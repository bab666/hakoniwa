;
/* ==== js/room-lewd-more.js ==== */
HK.Load.def(68,'js/room-lewd-more.js',function(){
(function(){
'use strict';
var RL=window.HK&&window.HK.RoomLewd;
if(!RL|| !RL.POOLS)return;
})();
});
;
/* ==== js/room-lewd-x.js ==== */
HK.Load.def(69,'js/room-lewd-x.js',function(){
(function(){
'use strict';
var RL=window.HK&&window.HK.RoomLewd;
if(!RL|| !RL.POOLS)return;
})();
});
;
/* ==== js/scenario-room.js ==== */
HK.Load.def(70,'js/scenario-room.js',function(){
(function(){
'use strict';
var HK=window.HK;
function R(ctx,a,b){return ctx.R(a,b);}
function names(list){return list.map(function(c){return c.name;}).join('・');}
function key(a,b){return a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;}
var K={
hand:{type:'act',lvl:1,noun:'手を繋ぐ',obj:'手',unit:'回',fin:function(n){return n>1?'手を'+n+'回繋がないと':'手を繋がないと';},mid:function(n){return n>1?'手を'+n+'回繋いで':'手を繋いで';}},
hug:{type:'act',lvl:2,noun:'ハグ',unit:'回',fin:function(n){return n>1?'ハグを'+n+'回しないと':'ハグしないと';},mid:function(n){return n>1?'ハグを'+n+'回して':'ハグして';}},
lap:{type:'act',lvl:2,noun:'膝枕',unit:'回',fin:function(n){return n>1?'膝枕を'+n+'回しないと':'膝枕しないと';},mid:function(n){return n>1?'膝枕を'+n+'回して':'膝枕して';}},
kiss:{type:'act',lvl:3,noun:'キス',unit:'回',fin:function(n){return n>1?'キスを'+n+'回しないと':'キスしないと';},mid:function(n){return n>1?'キスを'+n+'回して':'キスして';}},
h:{type:'act',lvl:5,noun:'エッチ',unit:'回',fin:function(n){return n>1?'エッチを'+n+'回しないと':'エッチしないと';},mid:function(n){return n>1?'エッチを'+n+'回して':'エッチして';}},
love:{type:'word',mode:'both',noun:'「好き」',unit:'回',fin:function(n){return n>1?'「好き」と'+n+'回ずつ言い合わないと':'「好き」と言い合わないと';},mid:function(n){return n>1?'「好き」と'+n+'回ずつ言い合って':'「好き」と言い合って';}},
honne:{type:'word',mode:'both',noun:'本音',unit:'つ',fin:function(n){return n>1?'本音を'+n+'つずつ打ち明け合わないと':'本音を打ち明け合わないと';},mid:function(n){return n>1?'本音を'+n+'つずつ打ち明け合って':'本音を打ち明け合って';}},
praise:{type:'word',mode:'sum',noun:'いいところ',unit:'個',fin:function(n){return'相手のいいところを'+n+'個言わないと';},mid:function(n){return'相手のいいところを'+n+'個言って';}},
aphro:{type:'consume',item:'媚薬',unit:'本',fin:function(n){return'媚薬を'+n+'本飲み切らないと';},mid:function(n){return'媚薬を'+n+'本飲み切って';}},
sake:{type:'consume',item:'酒',unit:'杯',fin:function(n){return'酒を'+n+'杯飲み干さないと';},mid:function(n){return'酒を'+n+'杯飲み干して';}},
spicy:{type:'consume',item:'激辛ラーメン',unit:'杯',fin:function(n){return'激辛ラーメンを'+n+'杯完食しないと';},mid:function(n){return'激辛ラーメンを'+n+'杯完食して';}},
pill:{type:'consume',item:'謎の錠剤',unit:'錠',fin:function(n){return'謎の錠剤を'+n+'錠飲み切らないと';},mid:function(n){return'謎の錠剤を'+n+'錠飲み切って';}},
one:{type:'one',fin:function(){return'一人しか';},mid:function(){return'';}},
kill:{type:'kill',noun:'誰かの命',unit:'人',fin:function(n){return(HK.SAFE_ON?'誰かを'+(n>1?n+'人':'')+'気絶させないと':'誰かを'+(n>1?n+'人':'')+'殺さないと');},mid:function(n){return HK.SAFE_ON?'誰かを気絶させて':'誰かを殺して';}}
};
var KLABEL={
h:'エッチ',kiss:'キス',hug:'ハグ',hand:'手を繋ぐ',lap:'膝枕',love:'「好き」と言い合う',honne:'本音を打ち明け合う',praise:'相手のいいところを言う',
aphro:'媚薬を飲み切る',sake:'酒を飲み干す',spicy:'激辛ラーメンを完食',pill:'謎の錠剤を飲み切る',one:'一人しか出られない',kill:'誰かを殺す（全年齢では気絶させる）'
};
HK.ROOM_KINDS=K;
function isGlob(T){return!!T&&(T.type==='consume'||T.type==='kill'||T.type==='task');}
function isPairT(T){return!!T&&(T.type==='act'||T.type==='word'||T.type==='hurt'||T.type==='trio');}
var ALT={water:'sake',gasballoon:'balloon'};
function fixKind(k){return K[k]?k:ALT[k]&&K[ALT[k]]?ALT[k]:'h';}
function nOf(k,v){return Math.max(1,+v||1)*(K[k].mul||1);}
function rulesOf(env){
var c1=fixKind(env.cond||'h'),c2=env.cond2&&env.cond2!=='none'?fixKind(env.cond2):null;
if(c1==='one'&&c2&&c2!=='one')return[{k:c2,n:nOf(c2,env.n2)}];
var r=[{k:c1,n:nOf(c1,env.n1)}];
if(c1!=='one'&&c2&&c2!==c1)r.push({k:c2,n:nOf(c2,env.n2)});
return r;
}
function oneWith(env){return env.only1==='on'||(env.cond==='one'&&rulesOf(env)[0].k!=='one');}
function allOutEnv(env){return env.allout==='on'&&rulesOf(env)[0].k!=='one'&& !oneWith(env);}
var NOUN_N={hand:'手繋ぎ',hug:'ハグ',lap:'膝枕',kiss:'キス',h:'エッチ',love:'「好き」の言い合い',honne:'本音の打ち明け合い'};
function nounN(r){
var T=K[r.k],n=r.n;
if(T.nounN)return T.nounN(n);
if(T.type==='consume')return T.item+n+T.unit;
if(T.type==='kill')return(HK.SAFE_ON?'誰かの気絶':'誰かの命')+(n>1?n+'人分':'');
if(r.k==='praise')return'相手のいいところ'+n+'個';
return(NOUN_N[r.k]||T.noun)+(n>1?n+T.unit+(T.type==='word'?'ずつ':''):'');
}
HK.roomLabel=function(env){return HK.roomLabelOf(env,rulesOf(env));};
HK.roomLabelOf=function(env,r){
if(env.label&&String(env.label).trim())return String(env.label).trim();
if(r[0].k==='one')return'一人しか出られない部屋';
var s=r.length<2?K[r[0].k].fin(r[0].n)
:env.order==='seq'?K[r[0].k].mid(r[0].n).replace(/て$/,'た').replace(/で$/,'だ')+'あとに、'+K[r[1].k].fin(r[1].n)
:nounN(r[0])+'と'+nounN(r[1])+'、両方を済ませないと';
return s+(oneWith(env)?'出られない部屋（ただし、出られるのは一人だけ）':allOutEnv(env)?'出られない部屋（ただし、条件を満たした人と一緒に、ほかの全員も出られる）':'出られない部屋');
};
HK.roomOnlyOne=function(env){return rulesOf(env)[0].k==='one'||oneWith(env);};
HK.roomAllOut=allOutEnv;
HK.roomRules=rulesOf;
var options=Object.keys(KLABEL).map(function(k){return{v:k,label:KLABEL[k]};});
function addKind(k,def,label){
if(K[k])return;
K[k]=def;KLABEL[k]=label;
options.push({v:k,label:label});
(scen.env||[]).forEach(function(e){if(e.id==='cond2'&&e.options!==options)e.options.push({v:k,label:label});});
}
function noteN(s){(scen.env||[]).forEach(function(e){if(e.id==='n1'||e.id==='n2')e.desc=(e.desc?e.desc+'。':'')+s;});}
function prog(ctx,a,b){var k=key(a,b);return(ctx.flags.prog[k]=ctx.flags.prog[k]||{act:{},said:{}});}
function needK(left,n,ctx){
if(!(left>1))return 1;
if(n&&ctx&&(n-left)/n>=(ctx.stepIndex||0)/Math.max(1,ctx.stepsTotal||1))return 1;
return 1+Math.min(1.5,Math.log(left)/Math.LN10*0.75);
}
function needKPair(ctx,el,a,b){
var m=1;
(el||[]).forEach(function(r){var v=effOf(ctx,r,a,b)||[0,0],T=K[r.k];m=Math.max(m,needK(r.n-(T.type==='word'&&T.mode!=='sum'?Math.min(v[0],v[1]):T.type==='word'?v[0]+v[1]:v[0]),r.n,ctx));});
return m;
}
function paceInc(ctx,tk,left,inc,rate,n){
var si=ctx.stepIndex||0;
if(tk.t0==null)tk.t0=si;
tk.n=(tk.n||0)+1;
if(!(left>1))return inc;
if(n&&(n-left)/n>=si/Math.max(1,ctx.stepsTotal||1))return inc;
var rem=Math.max(1,(ctx.stepsTotal||1)-1-si),obs=tk.n>1?Math.max(rate,(tk.n-1)/Math.max(1,si-tk.t0)):rate;
return Math.max(inc,Math.min(left,Math.ceil(left/Math.max(1,rem*obs))));
}
function killCount(ctx){return ctx.chars.filter(function(c){return(c.alive===false&&c.killedBy!=null)||c.flags.knocked;}).length;}
function rawOf(ctx,rule,a,b){
var T=K[rule.k];
if(T.type==='consume'||T.type==='task')return[(ctx.flags.consumed[rule.k]||0),0];
if(T.type==='kill')return[killCount(ctx),0];
var p=prog(ctx,a,b);
if(T.type==='act'||T.type==='hurt'||T.type==='trio')return[p.act[rule.k]||0,0];
if(T.type==='word')return[p.said[rule.k+a.i]||0,p.said[rule.k+b.i]||0];
return[0,0];
}
function seqOn(ctx){return ctx.env.order==='seq'&&ctx.rules.length===2;}
function effOf(ctx,rule,a,b){
if(!seqOn(ctx)||rule!==ctx.rules[1])return rawOf(ctx,rule,a,b);
var T=K[rule.k],glob=isGlob(T),r0glob=isGlob(K[ctx.rules[0].k]);
if(glob){if(!ctx.flags.seqOpen&& !(r0glob&&ruleDone(ctx,ctx.rules[0],a,b)))return null;}
else if(!ruleDone(ctx,ctx.rules[0],a,b))return null;
if(glob){
if(!ctx.flags.seqResetG){ctx.flags.seqResetG=true;if(T.type==='consume'||T.type==='task')ctx.flags.consumed[rule.k]=0;else ctx.flags.killBase=killCount(ctx);}
}else{
var p=prog(ctx,a,b);
if(!p.seqReset){p.seqReset=true;p.act[rule.k]=0;p.said[rule.k+a.i]=0;p.said[rule.k+b.i]=0;}
}
var v=rawOf(ctx,rule,a,b);
if(T.type==='kill')v[0]=Math.max(0,v[0]-(ctx.flags.killBase||0));
return v;
}
function ruleDone(ctx,rule,a,b){
var T=K[rule.k];
if(T.type==='one')return false;
var v=effOf(ctx,rule,a,b);
if(!v)return false;
var ok=T.type==='word'?(T.mode==='sum'?v[0]+v[1]>=rule.n:v[0]>=rule.n&&v[1]>=rule.n):v[0]>=rule.n;
if(ok&&seqOn(ctx)&&rule===ctx.rules[0])ctx.flags.seqOpen=true;
return ok;
}
function seqWait(ctx,rule,a,b){
if(!seqOn(ctx)||rule!==ctx.rules[1]|| !a|| !b)return false;
return isPairT(K[rule.k])&& !ruleDone(ctx,ctx.rules[0],a,b);
}
function waitNote(ctx,rule,a,b){
var r0=ctx.rules[0];
return'扉の紙は、今の'+(FL_NOUN[rule.k]||K[rule.k].noun)+'を数えなかった。条件の順番では、'+(r0.k==='h'?'一つ目の条件を先に満たさないと':'先に'+K[r0.k].fin(r0.n))+'、数えてもらえない。';
}
function seqFlush(ctx,r,a,b){if(seqOn(ctx)&&r===ctx.rules[1])effOf(ctx,r,a,b);}
function bumpAct(ctx,r,a,b,inc,to,cap){
var p=prog(ctx,a,b);
if(seqWait(ctx,r,a,b)){p.pre=p.pre||{};p.pre[r.k]=(p.pre[r.k]||0)+(to!=null?to:inc||1);return false;}
seqFlush(ctx,r,a,b);
var v=to!=null?to:(p.act[r.k]||0)+(inc||1);
p.act[r.k]=cap===false?v:Math.min(r.n,v);
return true;
}
function globLeft(ctx,r){
var v=effOf(ctx,r,null,null);
return v?Math.max(0,r.n-v[0]):0;
}
function globDone(ctx,r){var v=effOf(ctx,r,null,null);return!!v&&v[0]>=r.n;}
HK.roomGlobLeft=function(ctx,r){return globLeft(ctx,r);};
function markGoals(ctx,e){
var seen=ctx.flags.goalSeen,got=[];
ctx.rules.forEach(function(r){
var T=K[r.k],lab=(T.goal||KLABEL[r.k])+(r.n>1?' '+r.n+T.unit:'');
if(T.type==='one')return;
if(isGlob(T)){
if(!seen[r.k]&&globDone(ctx,r)){seen[r.k]=1;got.push(lab);}
return;
}
ctx.chars.forEach(function(a){
ctx.chars.forEach(function(b){
if(a.i>=b.i|| !ctx.flags.prog[key(a,b)])return;
var sk=r.k+':'+key(a,b);
if(seen[sk]|| !ruleDone(ctx,r,a,b))return;
seen[sk]=1;
got.push(lab+(ctx.chars.length>2?'（'+(HK.pairNameOf?HK.pairNameOf(a,b):a.name+'×'+b.name)+'）':''));
});
});
});
var outN=ctx.chars.filter(function(c){return c.out;}).length;
if(got.length)e.goal=got;
if(outN>ctx.flags.goalOut)e.goalExit=true;
ctx.flags.goalOut=outN;
}
function leftText(ctx,a,b){
var out=[];
ctx.rules.forEach(function(r){
if(ruleDone(ctx,r,a,b))return;
var T=K[r.k],v0=effOf(ctx,r,a,b)||[0,0];
var p={act:{},said:{}};p.act[r.k]=v0[0];p.said[r.k+a.i]=v0[0];p.said[r.k+b.i]=v0[1];
if(seqOn(ctx)&&r===ctx.rules[1]&& !ruleDone(ctx,ctx.rules[0],a,b)){out.push('そのあと'+(T.type==='consume'?T.item+'を'+r.n+T.unit:T.type==='kill'?'誰かの命':T.noun+(r.n>1?'を'+r.n+T.unit:'')));return;}
if(T.type==='task'){out.push(T.left?T.left(globLeft(ctx,r)):T.noun+'があと'+globLeft(ctx,r)+T.unit);return;}
if(T.type==='hurt'||T.type==='trio'){out.push(T.leftP?T.leftP(r.n-(p.act[r.k]||0),r.n):T.noun);return;}
if(T.type==='act')out.push(T.noun+(r.n>1?'があと'+(r.n-(p.act[r.k]||0))+T.unit:''));
else if(T.type==='word'&&T.mode==='both'){
var who=[a,b].filter(function(c){return(p.said[r.k+c.i]||0)<r.n;}).map(function(c){return c.name;});
var whoN=[a,b].filter(function(c){return(p.said[r.k+c.i]||0)<r.n;});
if(r.n>1)out.push(whoN.map(function(c){return c.name+'の'+T.noun+'があと'+(r.n-(p.said[r.k+c.i]||0))+T.unit;}).join('、'));
else out.push((who.length>1?'お互いの':who[0]+'の')+T.noun);
}else if(T.type==='word')out.push(T.noun+'があと'+(r.n-(p.said[r.k+a.i]||0)-(p.said[r.k+b.i]||0))+T.unit);
else if(T.type==='consume')out.push(T.item+'があと'+globLeft(ctx,r)+T.unit);
else if(T.type==='kill')out.push(HK.SAFE_ON?'誰かを気絶させること':'誰かの命');
});
return out.join('、')||(HK.roomOnlyOne&&HK.roomOnlyOne(ctx.env)?'扉をくぐる一人を決めることだけ':'ほかの条件がそろうのを待つことだけ');
}
function pairOnlyWait(ctx,a,b){
var left=ctx.rules.filter(function(r){return!ruleDone(ctx,r,a,b);});
return left.length>0&&left.length<ctx.rules.length;
}
function pairDone(ctx,a,b){return ctx.rules.every(function(r){return ruleDone(ctx,r,a,b);});}
function pairTag(ctx,a,b){return ctx.chars.length>2?(HK.pairNameOf?HK.pairNameOf(a,b):a.name+'×'+b.name)+'の':'';}
function cntTag(ctx,r,a,b,cnt,inc){
if(seqWait(ctx,r,a,b))return waitNote(ctx,r,a,b);
if(r.n<=1)return'';
if(seqOn(ctx)&&r===ctx.rules[1]&& !ruleDone(ctx,ctx.rules[0],a,b))return'（'+pairTag(ctx,a,b)+K[r.k].noun+'は条件1のあとから数える）';
return'（'+pairTag(ctx,a,b)+K[r.k].noun+' '+cnt+'/'+r.n+(inc>1?'・まとめて'+inc+K[r.k].unit:'')+'）';
}
function hasPairRule(ctx){return ctx.rules.some(function(r){return isPairT(K[r.k]);});}
function allOut(ctx){return!ctx.flags.isOne&& !ctx.flags.oneCond&&ctx.env.allout==='on';}
var DOOR_LINE='条件を満たしたので扉が開いた。';
function doorOpen(ctx,d){(ctx.flags.doorQ=ctx.flags.doorQ||[]).push(d);}
function endNow(ctx){return!!(scen.end&&scen.end(ctx,ctx.stepIndex,ctx.stepsTotal));}
function doorHit(ctx,o){
var Q=ctx.flags.doorQ;
if(!Q|| !Q.length||ctx.flags.doorBusy)return false;
var A=(o.actors||[]).map(function(c){return typeof c==='number'?c:c&&c.i;});
return Q.some(function(d){return d.g.some(function(c){return c&&A.indexOf(c.i)>=0;});});
}
function doorFlush(ctx){
var Q=ctx.flags.doorQ;
if(!Q|| !Q.length||ctx.flags.doorBusy)return;
ctx.flags.doorQ=[];ctx.flags.doorBusy=true;
try{
Q.forEach(function(d){
var g=d.g.filter(function(c,i,s){return c&&s.indexOf(c)===i;}),p0=(ctx.pending||[]).length;
ctx.say({kind:'phase',cat:'phase',actors:g,text:DOOR_LINE,why:d.why||'',mag:25});
var P=ctx.pending||[],so=P.filter(function(o,i){return i>=p0&&o&&o._rcA!=null;});
if(so.length){ctx.pending=P.filter(function(o){return so.indexOf(o)<0;});so.forEach(function(o){ctx.say(o);});}
var t=d.post||'',ex=d.ex;
if(ex&& !endNow(ctx)){
ex.told=true;
if(!d.noEnd&&HK.RoomEnd&&HK.RoomEnd.groupEnd)t+=HK.RoomEnd.groupEnd(ctx,ex,{lt:d.lt})||'';
}
var w=(d.with||[]).filter(function(c){return c&&g.indexOf(c)<0;}),ga=d.lead&&g.indexOf(d.lead)>0?[d.lead].concat(g.filter(function(c){return c!==d.lead;})):g;
if(t){var po={kind:'event',cat:d.cat||'escape',cageOk:true,actors:ga.concat(w),text:t,why:d.postWhy||names(g)+'が部屋の外へ出たあと',mag:d.mag||14};if(d.sex===false)po.sex=false;ctx.say(po);}
if(d.after)d.after();
});
}finally{ctx.flags.doorBusy=false;}
}
function alongMood(c){
var t=c.baseTr||c.tr||{},p=HK.personaOf?HK.personaOf(c):'';
if((t.cp>=0.65&&t.fc>=0.6&&t.ac<=0.4)||(p==='proud'&&t.np<0.45))return'law';
if(p==='free'&&t.ac<0.5)return'free';
if(t.cold>=0.72||(p==='cool'&&t.np<0.4))return'dry';
if(p==='devoted'||p==='shy'||p==='polite'||(p==='gentle'&&t.np>=0.55)||(t.np>=0.65&&t.ac>=0.6))return'sorry';
return'';
}
var ALONG_NOTE={
sorry:['{G}が条件を満たして開いた扉から、一緒に部屋を出た。何もしていないのに出られたことを、少し申し訳なく思った','{G}が条件を満たして開いた扉から、一緒に部屋を出た。自分は何もしていないのに、と{G}に何度も頭を下げた','{G}が条件を満たして開いた扉から、一緒に部屋を出た。何もせずに出られたことが、少し後ろめたかった'],
law:['{G}が条件を満たして開いた扉から、当然のような顔で出た','{G}が条件を満たして開いた扉から、礼も言わずにいちばん先に出た'],
free:['{G}が条件を満たして開いた扉から、一緒に部屋を出た。何もせずに出られて、得をしたと思った','{G}が条件を満たして開いた扉から、ラッキーだと笑って出た'],
dry:['{G}が条件を満たして開いた扉から、一緒に部屋を出た。得をしたと思っただけで、特に何も感じなかった','{G}が条件を満たして開いた扉から、一緒に部屋を出た。何もせずに出られたのは運がよかった、とだけ思った']
};
function alongNote(c,gn){
if(c.flags.down)return gn+'が条件を満たして開いた扉から、一緒に部屋を出た（倒れていたので、担がれて出た）';
var m=alongMood(c),L=m&&ALONG_NOTE[m];
return L?L[c.i%L.length].replace(/\{G\}/g,gn):gn+'が条件を満たして開いた扉から、一緒に部屋を出た';
}
function bringAlong(ctx,g){
if(!allOut(ctx))return[];
var L=ctx.present().filter(function(c){return g.indexOf(c)<0&& !c.out;});
if(!L.length)return[];
var gn=g.map(function(c){return c.name;}).join('と');
L.forEach(function(c){c.out=true;c.fate='脱出';c.fateNote=alongNote(c,gn);});
var ex=ctx.flags.exits||[],last=ex[ex.length-1];
if(last)last.along=(last.along||[]).concat(L.map(function(c){return c.i;}));
return L;
}
function loveThird(ctx,a,b){
var H=HK.RoomTrio&&HK.RoomTrio.harmony;
if(!H||ctx.flags.isOne)return null;
return ctx.present().filter(function(c){return c!==a&&c!==b&& !c.out&&c.alive!==false&&c.flags.cagePair==null&&H(ctx,[a,b,c])&& !(pairDone(ctx,a,c)&&pairDone(ctx,b,c));})[0]||null;
}
function loveTrioOf(ctx,a,b){var H=HK.RoomTrio&&HK.RoomTrio.harmony;return!!H&&ctx.present().some(function(c){return c!==a&&c!==b&&H(ctx,[a,b,c]);});}
function loveWaitKey(a,b){return Math.min(a.i,b.i)+'-'+Math.max(a.i,b.i);}
function loveWaiting(ctx,a,b){return!!(ctx.flags.loveWait&&ctx.flags.loveWait[loveWaitKey(a,b)]&&loveThird(ctx,a,b));}
function oneDoor(ctx,list,text,why,night){
if(ctx.flags.oneOut)return{cat:'escape',mag:10,text:text+'扉は、もう開かなかった。',why:why+'／一人しか出られない部屋。もう一人が出たあとだった'};
var rng=ctx.rng,L=list.filter(function(c){return!c.out&&c.alive!==false;});
if(!L.length)return{cat:'escape',mag:10,text:text,why:why};
if(night&&L.length===2&&okSex(L[0],L[1]))ctx.pair(L[0],L[1]).night=true;
var giver=ctx.most(L,function(c){var others=L.filter(function(o){return o!==c;});return c.tr.np*1.2+(others.length?Math.max.apply(null,others.map(function(o){return ctx.R(c,o).aff;}))/80:0)-c.tr.cold*0.4;});
var taker=ctx.most(L,function(c){return c.tr.cold*0.7+c.tr.aggr*0.5+c.stress/200-c.tr.np*0.4;});
var gv=giver.tr.np*1.2+(L.length>1?Math.max.apply(null,L.filter(function(o){return o!==giver;}).map(function(o){return ctx.R(giver,o).aff;}))/80:0);
var go,how,t,after=null;
if(L.length>1&&gv>0.95&&rng()<0.7){
var cand=L.filter(function(o){return o!==giver;});
go=cand.slice().sort(function(x,y){return ctx.R(giver,y).aff-ctx.R(giver,x).aff;})[0];how='sacrifice';
t=ctx.t(ctx.pick(['扉の紙の下には、小さな字で「ただし、一人だけ」と足されていた。{a}は迷わず{b}の背中を押した。「先に行って｜先に行け｜先に行ってください」','誰が出るのか、と誰もが黙った。{a}が{b}の手を取って、扉の前まで連れていった。「{b}が出て。私はいい｜{b}が出ろ。私はいい｜{b}が出てください。私はいいです」','扉の上の文字が光った。「一人だけ」――{a}は{b}を振り返り、笑ってみせた。「行きなよ｜行け｜行ってください」']),giver,go);
giver.fate='残った';giver.fateNote=go.name+'を先に出した';
ctx.mod2(giver,go,{aff:10},{aff:25,trust:25,att:10});
}else{
go=L.length>1?taker:L[0];how='grab';
var rest=L.filter(function(o){return o!==go;});
t=rest.length?ctx.t(ctx.pick(['「一人だけ」と書き足された紙を読むより早く、{a}は扉に手をかけていた。{b}の声に、{a}は振り返らなかった。','{a}は{b}を押しのけて、一人で外へ出た。扉は、すぐに閉まった。','「一人しか出られないなら｜一人しか出られないのなら｜一人しか出られないのでしたら」{a}はそれだけ言って、外へ出た。残された{b}は、閉まった扉を見つめていた。']),go,rest[0]):'';
after=function(){rest.forEach(function(o){ctx.mod(o,go,{aff: -25,ten:30,trust: -35});});};
}
go.out=true;go.fate='脱出';go.fateNote=how==='sacrifice'?giver.name+'に背中を押されて一人で出た':'一人で部屋を出た';
ctx.flags.oneOut=true;
(ctx.flags.exits=ctx.flags.exits||[]).push({a:go.i,b:(how==='sacrifice'?giver:(L.filter(function(o){return o!==go;})[0]||go)).i,label:ctx.label,how:how});
var ow='一人しか出られない部屋（'+(how==='sacrifice'?giver.name+'の優しさ':go.name+'のドライさ')+'）';
doorOpen(ctx,{g:L,why:why,post:t,postWhy:ow+'。'+go.name+'だけが脱出した',cat:how==='sacrifice'?'help':'betray',mag:45,noEnd:true,lead:how==='sacrifice'?giver:go,sex:false,after:after||null});
return{cat:'escape',mag:30,text:text,why:why+'／'+ow};
}
function exitPair(ctx,a,b,text,why,night){
if(ctx.flags.oneCond)return oneDoor(ctx,[a,b],text,why,night);
var stay=null,lt=allOut(ctx)?null:loveThird(ctx,a,b);
if(lt){
var multiOk=(ctx.env.multi||'open')!=='no'&&ctx.flags.multiKnown;
if(multiOk){
var W=ctx.flags.loveWait=ctx.flags.loveWait||{},key=loveWaitKey(a,b);
if(W[key])return{cat:'romance',mag:6,text:text+a.name+'と'+b.name+'は、'+lt.name+'と三人で出るまで、扉の前を素通りした。',why:why+'／三人で出るのを待っている'};
W[key]=true;
ctx.mod(lt,a,{trust:4,aff:3});ctx.mod(lt,b,{trust:4,aff:3});
var lw=lt.name+'も二人の恋人。円満な三人なので、二人だけで先に出ず、三人で出るのを待つ';
doorOpen(ctx,{g:[a,b],with:[lt],why:why,cat:'romance',mag:24,postWhy:lw,post:ctx.t(ctx.pick([
'{a}と{b}は、立ち上がらなかった。{b}が{c}に手を伸ばした。{b}「三人で来たんだから、三人で出よう｜三人で来たのだから、三人で出よう｜三人で来たのですから、三人で出ましょう」',
'{a}は扉を一度だけ見て、それから{c}の隣に座り直した。{a}「{c}を置いていくわけないでしょ｜{c}を置いていくわけがないだろう｜{c}を置いていくわけがありません」――{b}も、黙って{c}の反対側に座った。',
'{c}が顔を上げた。{c}「……行っていいよ｜……行っていい｜……行ってください」{a}と{b}は同時に首を振った。三人は恋人どうしだった。誰か一人を置いて出る扉なら、くぐる理由がなかった。'
]),a,b,lt)});
return{cat:'romance',mag:24,text:text,why:why+'／'+lw};
}
stay=HK.RoomTrio&&(pairDone(ctx,a,lt)?b:pairDone(ctx,b,lt)?a:(a.tr.np>=b.tr.np?a:b));
var go0=stay===a?b:a;
go0.out=true;go0.fate='脱出';go0.fateNote=stay.name+'と条件を満たして出た（'+stay.name+'は、'+lt.name+'のために残った）';
stay.flags.stayed=(stay.flags.stayed||0)+1;
var exS={a:go0.i,b:stay.i,label:ctx.label,night: !!night,stay:stay.i};
(ctx.flags.exits=ctx.flags.exits||[]).push(exS);
if(night&&okSex(a,b))ctx.pair(a,b).night=true;
ctx.mod2(stay,lt,{trust:6,aff:4},{trust:6,aff:4});
var sw=lt.name+'も二人の恋人。二人ずつしか出られない部屋なので、'+stay.name+'が残って付き添う';
doorOpen(ctx,{g:[a,b],with:[lt],ex:exS,lt:lt,why:why,cat:'romance',mag:24,postWhy:go0.name+'だけが脱出した。'+sw,post:ctx.t(ctx.pick([
'{a}は{b}の背中を押した。{a}「先に出て、待ってて。{c}と一緒に行くから｜先に出て、待っていろ。{c}と一緒に行く｜{c}と一緒に行きますから、先に出て待っていてください」――{b}は振り返りながら外へ出た。',
'{b}だけが外に出て、{a}は{c}の隣に残った。{a}「一人にはしないよ｜一人にはしない｜一人にはしません」――扉の向こうで、{b}が「待ってる｜待っている｜待っています」と言った。',
'{a}と{b}は短く口づけを交わし、{b}が先に出た。{a}は{c}の手を握った。{a}「次は、私たちの番｜次は、私たちの番だ｜次は、私たちの番です」'
]),stay,go0,lt)});
return{cat:'romance',mag:30,text:text,why:why+'／'+sw};
}
if(night&& !okSex(a,b))night=false;
if(night&&ctx.present().length>=3&& !allOut(ctx)){
[a,b].forEach(function(c){if(!stay&&eager(ctx,c)>0.68&&ctx.rng()<0.5)stay=c;});
}
if(stay){
var go=stay===a?b:a;
go.out=true;go.fate='脱出';go.fateNote=stay.name+'と条件を満たして出た（'+stay.name+'は残った）';
stay.flags.stayed=(stay.flags.stayed||0)+1;
var exE={a:go.i,b:stay.i,label:ctx.label,night:true,stay:stay.i};
(ctx.flags.exits=ctx.flags.exits||[]).push(exE);
ctx.pair(a,b).night=true;
ctx.mod(go,stay,{ten:6});
var ew=stay.name+'の積極性（'+Math.round(eager(ctx,stay)*100)+'）';
doorOpen(ctx,{g:[a,b],ex:exE,why:why,cat:'romance',mag:20,postWhy:go.name+'だけが脱出した。'+ew,post:go.name+'は外へ出ていったが、'+stay.name+'は「もうちょっといる｜もう少しいる｜もう少しいます」と言って、残っている人たちの方を振り返った。'});
return{cat:'romance',mag:30,text:text,why:why+'／'+ew};
}
a.out=b.out=true;
(ctx.flags.exits=ctx.flags.exits||[]).push({a:a.i,b:b.i,label:ctx.label,night: !!night});
var pfx=ctx.pair(a,b);
if(night)pfx.nights=Math.max(pfx.nights||0,prog(ctx,a,b).act.h||1);
if(night&& !pfx.forced&&HK.FWB&&HK.FWB.decide(ctx,a,b)){HK.FWB.mark(ctx,a,b);text+=HK.FWB.after(ctx,a,b);}
return finishExit(ctx,a,b,text,why,night);
}
function finishExit(ctx,a,b,text,why,night){
a.fate=b.fate='脱出';
a.fateNote=b.name+'と一緒に部屋を出た';b.fateNote=a.name+'と一緒に部屋を出た';
if(night)ctx.pair(a,b).night=true;
ctx.mod2(a,b,{trust:8},{trust:8});
var al=bringAlong(ctx,[a,b]),ex=ctx.flags.exits||[];
var w=why+(al.length?'／条件を満たした人と一緒に、ほかの全員も出られる部屋':'');
doorOpen(ctx,{g:[a,b].concat(al),ex:ex[ex.length-1],why:w});
return{cat:'escape',mag:35,text:text,why:w};
}
function sweepExits(ctx){
if(ctx.flags.isOne||(ctx.flags.oneCond&&ctx.flags.oneOut))return;
if(!hasPairRule(ctx)){
if(ctx.present().length&&ctx.rules.every(function(r){return globDone(ctx,r);}))exitAll(ctx);
return;
}
var P=ctx.present(),night=ctx.rules.some(function(r){return r.k==='h';});
for(var i=0;i<P.length;i++)for(var j=i+1;j<P.length;j++){
var a=P[i],b=P[j];
if(a.out||b.out|| !pairDone(ctx,a,b)||loveWaiting(ctx,a,b))continue;
var ex=exitPair(ctx,a,b,'扉の紙を見ると、'+a.name+'と'+b.name+'の分の数字が、いつの間にかそろっていた。',a.name+'と'+b.name+'の条件が、ほかの出来事の中でそろった',night);
ctx.say({kind:'event',cat:'escape',actors:[a,b],text:ex.text,why:ex.why,mag:ex.mag||30});
}
}
function lastOf(r){var T=K[r.k];return T.last?T.last(r.n):'最後の一'+T.unit+'が空になった';}
function exitAll(ctx){
var P=ctx.present().filter(function(c){return!c.flags.knocked;});
if(!P.length)return;
var kr=ctx.rules.some(function(r){return r.k==='kill';});
var vic=kr?ctx.chars.filter(function(c){return(c.alive===false&&c.killedBy!=null)||c.flags.knocked;}):[];
if(ctx.flags.oneCond){var od=oneDoor(ctx,P,'','部屋全体の条件がそろった');if(od.text)ctx.say({kind:'event',cat:od.cat,actors:P,text:od.text,why:od.why,mag:od.mag});doorFlush(ctx);return;}
var vn=names(vic);
P.forEach(function(c){c.out=true;c.fate='脱出';c.fateNote=kr?(HK.SAFE_ON?vn+'を気絶させて開いた扉から、部屋を出た':vn+'の命と引き換えに開いた扉から、部屋を出た'):'条件を満たし、全員で部屋を出た';});
var exG={group:P.map(function(c){return c.i;}),label:ctx.label};
(ctx.flags.exits=ctx.flags.exits||[]).push(exG);
doorOpen(ctx,{g:P,ex:exG,why:kr?(HK.SAFE_ON?vn+'を気絶させて、部屋全体の条件がそろった':vn+'の命と引き換えに、部屋全体の条件がそろった'):'部屋全体の条件を満たした'});
if(kr)doorFlush(ctx);
else ctx.say({kind:'event',cat:'escape',actors:P,text:lastOf(ctx.rules[0])+'。',why:'部屋全体の条件を満たした',mag:30});
}
function checkExit(ctx,a,b){
if(ctx.flags.oneCond&&ctx.flags.oneOut)return null;
if(!hasPairRule(ctx)){
if(ctx.rules.every(function(r){return globDone(ctx,r);}))exitAll(ctx);
return null;
}
if(a&&b&& !a.out&& !b.out&&pairDone(ctx,a,b)&& !loveWaiting(ctx,a,b))return true;
return null;
}
var ACT_TEXT={
hand:{
will:['{a}が黙って手を差し出した。{b}は少し迷ってから、その指に自分の指を絡めた。','{a}と{b}は壁にもたれて、肩を並べたまま手を繋いだ。','{b}の手は思ったより冷たかった。{a}はそれを温めるように握り直した。','「……ほら｜……ほら｜……どうぞ」{a}が手を伸ばすと、{b}は照れ隠しに鼻を鳴らして、それでも握った。','繋いだ手の中で、{a}の親指が{b}の手の甲をそっと撫でた。'],
des:['{a}と{b}は、目を合わせないまま手を繋いだ。握手のような繋ぎ方だった。','{a}と{b}は「条件だから｜条件だ｜条件ですから」と言い合って、指先だけを触れ合わせた。','{a}が{b}の手首を掴んだ。それでも扉の紙は、手を繋いだと認めたらしい。']
},
hug:{
will:['{a}が両腕を広げた。{b}は一瞬だけ笑って、その中に収まった。','{b}の背中に回した腕に、{a}は思ったより力を込めていた。','抱き合ったまま、{a}は{b}の髪の匂いに気づいてしまった。','「長くない？｜長くないか？｜長くないですか？」と{b}が言った。{a}は「数えてない｜数えていない｜数えていません」と答えて、腕をほどかなかった。','{a}は{b}を抱きしめた。心臓の音がどちらのものか分からなかった。'],
des:['{a}と{b}は、肩を叩き合うようなハグをして、すぐに離れた。','「三秒でいいだろ｜三秒でいいだろう｜三秒でいいでしょう」{a}はそう言って{b}を引き寄せ、本当に三秒で離した。','{a}と{b}は、背中に手を回すだけの、ぎこちないハグをした。']
},
lap:{
will:['{b}の膝に頭を乗せた{a}は、天井を見上げたまま「重くない？｜重くないか？｜重くないですか？」と訊いた。{b}は「全然｜全然だ｜全然です」と答えて、{a}の前髪を指でよけた。','{a}は膝の上の{b}の髪を、指先で何度も梳いた。','{b}の膝の上で、{a}はいつの間にか本当に眠っていた。','膝枕をされたまま、{a}は{b}の顔を下から見上げて、何か言いかけてやめた。'],
des:['{a}は{b}の膝に、頭の重さを預けないように首を浮かせていた。','{a}と{b}は、時計を見ながら膝枕をした。{a}「何秒？｜何秒だ？｜何秒ですか？」{b}「知らない｜＝｜知りません」']
},
kiss:{
will:['{a}が{b}の頬に手を添えた。唇が触れて、離れて、もう一度触れた。','{b}の方が先に目を閉じた。{a}はそれに気づいて、ほんの少し笑ってから口づけた。','{a}と{b}の額がこつんと当たって、二人して笑ったあと、静かにキスをした。','{a}は{b}にもう一度唇を寄せた。{b}「数えてる？｜数えているか？｜数えていますか？」{a}「数えてない｜数えていない｜数えていません」','{a}は{b}の襟を掴んで引き寄せた。乱暴な仕草とは裏腹に、触れた唇はひどく慎重だった。','{b}の唇は少し震えていた。{a}は離れる前に、そっと親指でそれをなぞった。'],
des:['{a}と{b}は目を固く閉じたまま、一瞬だけ唇を重ねた。','「事故だと思って｜事故だと思え｜事故だと思ってください」{a}はそう言って、{b}の唇に軽く触れた。','{a}と{b}は、ぶつかるような短いキスをして、同時に袖で口元を拭った。','{b}が「早く済ませて｜早く済ませろ｜早く済ませてください」と言った。{a}はその通りにした。']
},
h:{
will:['{a}と{b}は、言葉少なに互いを確かめ合った。――そのあとのことは、二人だけが知っている。','{b}が{a}のシャツのボタンに指をかけた。{a}はその手を止めずに、自分の手を重ねた。――照明が、気を利かせたように一段落ちた。','「嫌だったら、すぐ言って｜嫌なら、すぐ言え｜嫌だったら、すぐ言ってください」{a}の言葉に、{b}は答えの代わりに{a}を引き寄せた。――','{a}と{b}は、ベッドの縁に並んで座ったまま、しばらく何も言わなかった。先に手を伸ばしたのは{b}だった。――','{a}が{b}の名前を呼んだ。それだけで、{b}には十分だった。――'],
des:['{a}と{b}は、何も言わずに条件を呑んだ。――終わったあとも、しばらくどちらも口をきかなかった。','「出るためだ｜＝｜出るためです」と{a}は言った。{b}は頷いて、照明のスイッチを探した。――','{a}と{b}は背中合わせで服を脱いだ。どちらも、相手の顔を見なかった。――']
}
};
var TOOLS=[
{n:'目隠し',t:['{a}は木箱から黒い布の目隠しを取り出して、{b}の目にそっと巻いた。「見えない方が、恥ずかしくないでしょ｜見えない方が、恥ずかしくないだろう｜見えない方が、恥ずかしくないでしょう」――','{a}は木箱の目隠しで{b}の目を覆った。何も見えなくなった{b}は、{a}の指がどこに触れるのか分からずに、何度も肩を跳ねさせた。――']},
{n:'手錠',t:['{a}は木箱から毛皮つきの手錠を取り出して、指でくるくる回した。「{b}、これつける？｜{b}、これをつけるか？｜{b}、これをつけますか？」{b}は「…片方だけなら｜…片方だけならいい｜…片方だけなら、いいです」と手首を差し出した。――','{a}は木箱の手錠を、冗談めかして{b}の手首にかけた。{b}は笑っていたが、{a}はその手錠を外さないまま{b}を抱き寄せた。――']},
{n:'ロープ',t:['{a}は木箱の柔らかい縄を手に、{b}の顔を窺った。「縛ってもいい？嫌なら言って｜縛ってもいいか？嫌なら言え｜縛ってもいいですか？嫌なら言ってください」{b}は黙って両手首を差し出した。――','{a}は木箱の縄で、{b}の両手首を器用に結んだ。{b}「…なんでそんなに慣れてるの｜…なぜそんなに慣れているんだ｜…どうしてそんなに慣れているんですか」{a}「秘密｜秘密だ｜秘密です」――']},
{n:'媚薬入りのオイル',t:['{a}は木箱の媚薬入りオイルを{b}の背中に垂らし、手のひらで塗り広げた。塗られたところから、{b}の肌にじわじわと熱が広がった。――']}
];
var REPEAT=['{a}と{b}は、それからも条件の回数を一つずつ重ねていった。','「もう一回｜もう一回だ｜もう一回しましょう」と{a}が言い、{b}は頷いた。','扉の紙の残りの数字が一つ減るたび、{a}と{b}の間の照れも少しずつ減っていった。','何回目かのときには、{b}の方から{a}に手を伸ばした。','扉の紙の回数を数えるのは、途中から{a}の役目になった。'];
var PRAISE=['笑うと目尻に皺が寄るところ','嘘をつくとき耳を触る癖','字がきれいなところ','絶対に人の悪口を言わないところ','寝起きの声が低いところ','箸の持ち方がきれいなところ','人の話を最後まで聞くところ','怒ると黙るところ','意外と涙もろいところ','靴をきちんと揃えるところ','歌が下手なのを気にしないところ','背中が広いところ','手が温かいところ','負けず嫌いなところ','誰にでも同じ態度なところ','料理の味見を必ずするところ','約束の五分前に来るところ','名前を呼ぶときの声','困ってる人を放っておけないところ','ちゃんと謝れるところ'];
var PRAISE_EG={
CP:{hi:['筋を通すところ','約束を絶対に守るところ','嫌なことを嫌って言えるところ','責任から逃げないところ','人を本気で叱れるところ','背筋がいつも伸びてるところ'],lo:['細かいことで怒らないところ','人のミスを笑って流せるところ','決めつけないところ','型にはまらないところ']},
NP:{hi:['困ってる人を放っておけないところ','人の話を最後まで聞くところ','弱ってるときに真っ先に気づくところ','自分より人の分を先に取り分けるところ','声が優しいところ','褒め方が上手いところ'],lo:['ほどよく距離を置いてくれるところ','余計なお節介をしないところ','人に流されないところ','甘やかさないところ']},
A:{hi:['どんなときも冷静なところ','話が分かりやすいところ','感情的にならずに考えられるところ','段取りが完璧なところ','物知りなところ','状況をすぐ整理してくれるところ'],lo:['理屈より気持ちで動けるところ','勘がいいところ','計算しないで飛び込めるところ','考えすぎないところ']},
FC:{hi:['笑うと場が明るくなるところ','楽しいことを見つける天才なところ','好きなものの話をするとき目が輝くところ','思ったことを素直に言えるところ','一緒にいると退屈しないところ','ノリがいいところ'],lo:['落ち着いてるところ','はしゃがない大人っぽさ','感情を顔に出さないところ','一緒にいると静かに安心できるところ']},
AC:{hi:['気配りが細かいところ','空気を読んで先回りしてくれるところ','ちゃんと謝れるところ','人に合わせるのが上手いところ','遠慮がちなところが可愛いところ','頼まれごとを断らないところ'],lo:['自分の意見をはっきり言うところ','誰にでも同じ態度なところ','人の顔色で動かないところ','堂々としてるところ']}
};
function praiseFor(ctx,a,b,n){
var out=[],eg=b.eg,F=['CP','NP','A','FC','AC'];
var cand=[];
F.forEach(function(f){
if(eg[f]>=13)PRAISE_EG[f].hi.forEach(function(x){cand.push({t:x,w:eg[f]-10,src:f+'高'});});
if(eg[f]<=7)PRAISE_EG[f].lo.forEach(function(x){cand.push({t:x,w:10-eg[f],src:f+'低'});});
});
PRAISE.forEach(function(x){cand.push({t:x,w:1.2+a.tr.a*2,src:''});});
for(var i=0;i<n&&cand.length;i++){
var c=HK.weighted(ctx.rng,cand,function(x){return x.w;});
out.push(c.t);cand.splice(cand.indexOf(c),1);
if(c.src)ctx.flags.praiseSrc=c.src;
}
return out.join('、');
}
var ITEM={
aphro:{
fit:function(c){return c.tr.np*0.35+c.tr.impulse*0.45+c.tr.cold*0.3+(c.goal.id==='quick'?0.4:0);},
lines:{
np:['「誰かに飲ませるくらいなら、私が飲む」{a}はそう言って、媚薬の瓶を{n}本空けた。','{a}は震える手で{n}本目の封を切った。「大丈夫、まだ平気」','{a}は残りの本数を数えて、自分の分を多めに引き寄せた。'],
fc:['「どうせ全部飲むんでしょ」{a}は笑いながら{n}本を立て続けに空けた。','{a}は瓶を光にかざして「ピンクだ」と面白がり、そのまま{n}本飲み干した。','{a}は乾杯の真似をして、{n}本を一息に呷った。'],
cold:['「効率の問題だ」{a}は表情も変えずに{n}本を空けた。','{a}は残りの本数と時間を計算して、黙々と{n}本飲んだ。','{a}は{n}本を並べ、薬を飲むように一本ずつ流し込んだ。'],
ac:['{a}は皆の顔を見回して、誰も手を伸ばさないのを確かめてから、{n}本を手に取った。','{a}は「私が飲めば、みんなは」と小さく言って、{n}本を飲んだ。']
},
effect:function(ctx,c,n){
c.flags.aphro=(c.flags.aphro||0)+n;
c.flags.aphroTotal=(c.flags.aphroTotal||0)+n;
var lim=3+ctx.stat(c,'hp')*1.6;
if(c.flags.aphro>lim&&ctx.rng()<0.25+(c.flags.aphro-lim)*0.15){c.flags.down=2+(ctx.stat(c,'hp')<=2?1:0);c.flags.justDown=true;c.hp-=15;c.flags.aphro*=0.6;}
c.tr.impulse=HK.clamp(c.tr.impulse+0.06*n);c.tr.honesty=HK.clamp(c.tr.honesty+0.05*n);
ctx.others(c).forEach(function(o){ctx.mod(c,o,{att:5*n});});
ctx.stress(c,6*n);
},
state:function(c){
if(c.flags.justDown){c.flags.justDown=false;return'次の瞬間、{a}の膝が崩れた。{a}の体は飲んだ媚薬の量に耐えきれず、{a}は床に倒れ込んだまま動けなくなった。';}
var x=c.flags.aphro||0;return x>=8?'{a}の目は焦点が合っておらず、熱い息だけが漏れていた。':x>=5?'{a}の呼吸は浅く、肌が熱を帯びていた。':x>=3?'{a}の頬がはっきりと赤い。':'';
}
},
sake:{
fit:function(c){return c.tr.fc*0.5+c.tr.impulse*0.3+c.tr.cold*0.2+ctx0(c);},
lines:{
np:['{a}は「つまみがないのが惜しいね」と笑って、{n}杯空けた。','{a}は皆の分まで引き受けるように、{n}杯を飲み干した。'],
fc:['「一気！一気！」{a}は自分で囃し立てて{n}杯空けた。','{a}は{n}杯目で歌い始めた。','{a}は「これ、いい酒だ」と目を輝かせて{n}杯呷った。'],
cold:['{a}は水でも飲むように{n}杯空けた。顔色ひとつ変わらない。','{a}は「分担しよう。俺はあと{n}杯」と事務的に言って、その通りにした。'],
ac:['{a}は勧められるまま、断れずに{n}杯飲んだ。','{a}は「私、強くないんだけど……」と言いながら{n}杯空けた。'],
weak:['{a}は「お酒、弱いんだけど｜酒には弱いんだ｜お酒は弱いんです」と前置きして、{n}杯を少しずつ流し込んだ。もう頬が赤い。','{a}は鼻をつまむようにして{n}杯飲んだ。一杯目の途中で、もう目が潤んでいた。','{a}は{n}杯空けると、壁に手をついて深く息を吐いた。「……回るの、早すぎ｜……回るのが、早すぎる｜……回るのが、早すぎます」'],
strong:['{a}は「任せて。酒なら強い｜任せろ。酒なら強い｜任せてください。お酒なら強いです」と言って、{n}杯を涼しい顔で空けた。','{a}は水でも飲むように{n}杯飲み干し、「次｜次だ｜次をください」と杯を差し出した。','{a}は{n}杯空けても顔色ひとつ変えず、皆の残りの杯数を数え直した。']
},
effect:function(ctx,c,n){c.flags.drunk=(c.flags.drunk||0)+n*12*(1.4-ctx.stat(c,'hp')*0.12)*HK.drunkRate(c);if(c.flags.drunk>70+ctx.stat(c,'hp')*8&&ctx.rng()<0.4){c.flags.down=2;c.flags.justDown=true;c.flags.drunk*=0.5;}c.tr.honesty=HK.clamp(c.tr.honesty+0.05*n);c.tr.impulse=HK.clamp(c.tr.impulse+0.04*n);ctx.stress(c,-4*n);},
state:function(c){if(c.flags.justDown){c.flags.justDown=false;return'{a}はそのまま床に突っ伏して、寝息を立て始めた。';}var x=c.flags.drunk||0;return x>=60?'{a}の呂律が回らなくなってきた。':x>=30?'{a}の目元が赤い。':'';}
},
spicy:{
fit:function(c){return c.tr.cp*0.4+c.tr.fc*0.4+c.tr.np*0.2;},
lines:{
np:['{a}は涙を流しながら、{n}杯目を完食した。「みんなの分、少しでも減らしたくて」','{a}は汗だくで{n}杯を平らげ、残りのスープまで飲んだ。'],
fc:['「辛っ！でもうまっ！」{a}は叫びながら{n}杯をかき込んだ。','{a}はなぜか楽しそうに{n}杯完食して、舌を出してみせた。'],
cold:['{a}は無言で{n}杯を食べ切った。唇だけが真っ赤だった。','{a}は一口ごとに水を飲む配分まで計算して、{n}杯を処理した。'],
cp:['「この程度で音を上げるか」{a}は意地で{n}杯を平らげた。','{a}は誰にも負けたくない一心で、{n}杯を完食した。']
},
effect:function(ctx,c,n){ctx.stress(c,7*n);c.hp-=3*n;c.flags.spicy=(c.flags.spicy||0)+n;if(ctx.rng()<0.25+n*0.1-ctx.stat(c,'hp')*0.04)c.flags.belly=2+ctx.rng.int(3);},
state:function(c){return c.stress>70?'{a}は床に倒れ込んで、天井を見上げていた。':'';}
},
pill:{
fit:function(c){return c.tr.np*0.5+c.tr.impulse*0.4+c.tr.cold*0.2;},
lines:{
np:['{a}は「毒見だと思えば」と言って、{n}錠を水で流し込んだ。','{a}は自分が先に飲んで、何も起きないことを皆に見せた。{n}錠。'],
fc:['{a}は錠剤をラムネのように口に放り込んだ。{n}錠。','「何が起きるか見てみたい」{a}は{n}錠を一度に飲んだ。'],
cold:['{a}は錠剤の刻印を確かめてから、{n}錠飲んだ。','{a}は一錠ずつ時間を空けて、効果を観察しながら{n}錠を飲んだ。'],
ac:['{a}は目を瞑って、{n}錠を飲み込んだ。']
},
effect:function(ctx,c,n){
var r=ctx.rng();
if(r<0.35){ctx.others(c).forEach(function(o){ctx.mod(c,o,{att:4*n});});c.flags.pillfx='heat';}
else if(r<0.65){ctx.stress(c,-8*n);c.flags.pillfx='calm';}
else{ctx.stress(c,8*n);c.tr.honesty=HK.clamp(c.tr.honesty+0.08*n);c.flags.pillfx='truth';}
},
state:function(c){return{heat:'{a}の視線が、熱っぽく揺れている。',calm:'{a}はやけに穏やかな顔をしている。',truth:'{a}は、聞かれてもいないことを話し始めた。'}[c.flags.pillfx]||'';}
}
};
function ctx0(){return 0;}
function topKey(c){
var t=c.tr,best='np',bv= -1;
[['np',t.np],['fc',t.impulse],['cold',t.cold],['ac',t.ac],['cp',t.cp]].forEach(function(x){if(x[1]>bv){bv=x[1];best=x[0];}});
return best;
}
var LVL_ATT=[0,-8,4,26,36,42];
var LVL_TRUST=[0,-10,-2,6,12,16];
function wsNoSex(ctx,a,b){
if(!ctx|| !ctx.tiesAll|| !HK.Ties|| !a|| !b||a===b)return false;
return HK.Ties.all(ctx,a,b).some(function(t){return(t.type==='worship'&&HK.tieOptNoLove&&HK.tieOptNoLove(t)&&t.cold!=='dominate')||(HK.tieNoLove&&HK.tieNoLove(t));});
}
HK.roomWsNoSex=wsNoSex;
function tieWall(ctx,a,b,lvl){
if(wsNoSex(ctx,a,b))return lvl>=3?999:0;
var hw=0;[a,b].forEach(function(c,k){var o=k?a:b;if(c.honmei!=null&&c.honmei!==o.i&&lvl>=3)hw+=HK.honmeiDesperate(ctx,c)?6:28;});
if(hw)return hw+(function(){var t0=HK.Ties?HK.Ties.get(ctx,a,b):null;return t0&&HK.TIES[t0.type]&& !HK.TIES[t0.type].family?({enemy:20,rival:12,ex:6,lover: -30,fwb: -35,almost: -15,crush: -8,best: -4,childhood: -4}[t0.type]||0):0;})();
var t=HK.Ties?HK.Ties.get(ctx,a,b):null;
if(!t)return 0;
var D=HK.TIES[t.type];
if(D.family)return!HK.tieNoLove(t)?0:lvl>=3?999:0;
return{enemy:20,rival:12,ex:6,lover: -30,fwb: -35,almost: -15,crush: -8,best: -4,childhood: -4}[t.type]||0;
}
function posClash(a,b){return!!(HK.Pos&&HK.Pos.clash&&HK.Pos.clash(a,b));}
function clashH(ctx,a,b){return posClash(a,b)&&ctx.rules.some(function(r){return r.k==='h';});}
function okSex(a,b){return(!HK.Pos||(HK.Pos.okSex(a,b)&&(!HK.Pos.libOK||HK.Pos.libOK([a,b]))))&& !wsNoSex(HK._curCtx,a,b);}
function canLead(a,b){return!HK.Pos||HK.Pos.orients(a,b).some(function(o){return o[0]===a;});}
function bothBottom(a,b){var P=HK.Pos;return!!(P&&P.explicit(a,b)&&P.explicit(b,a)&&P.isBottom(a,b)&&P.isBottom(b,a)&&P.okSex(a,b));}
var CLASH_BOTTOM={
cp:['{a}と{b}は、どちらも相手がリードするものだと思っていた。気まずい沈黙のあと、{a}が仕方なさそうに、乱暴に袖をまくった。','{a}と{b}は、どちらも自分から動く気はなかった。見かねた{a}が、ため息をついて{b}の肩を押した。','「普通、そっちがリードするところだろ」――{a}と{b}は同時に同じことを言った。睨み合いに負けたのは、{a}のほうだった。'],
cold:['{a}と{b}は、どちらも抱かれる側のつもりだった。このままでは埒が明かないと判断した{a}が、慣れない手つきで{b}に触れ始めた。','{a}は時計を見上げ、「このまま待っても進まない」と淡々と言った。それから、自分が動くほうを引き受けた。','{a}と{b}は、どちらが動くかを理屈で決めようとして、結論が出なかった。{a}は小さく息を吐き、黙って{b}の上着に手をかけた。'],
fc:['{a}と{b}は、どちらがリードするかでじゃんけんをした。負けた{a}は、照れ笑いしながら{b}に覆いかぶさった。','{a}と{b}は、お互いに相手が動くのを待って、しばらく見つめ合ったまま笑ってしまった。先に手を伸ばしたのは、{a}だった。','{a}は「じゃあ今回だけ、こっちがやってみる」と言って袖をまくった。{b}は「初心者マークつけといて」と笑った。'],
np:['{a}と{b}は、どちらも相手に委ねたいほうだった。{b}の不安そうな顔を見て、{a}が覚悟を決めた。','{a}は{b}の手が震えているのに気づいて、「いいよ、こっちがする」と静かに言った。','{a}は{b}を毛布でくるんでから、「慣れてないけど、優しくするから」と言って、そっと隣に横になった。'],
ac:['{a}と{b}は、どちらも自分から動けなかった。長い沈黙のあと、震える指で先に触れたのは、{a}のほうだった。','{a}と{b}は、ベッドの端と端に座ったまま、何分も動けなかった。先に「……じゃあ」と言ったのは{a}で、言った途端に耳まで赤くなった。','{a}は消え入りそうな声で「下手でも、笑わないで」と言ってから、おそるおそる{b}の肩に触れた。']
};
function clashText(ctx,a,b){
var o=HK.Pos.order(a,b,[a,b]),y=o[0],t=y.tr;
var k=[['cp',t.cp],['cold',t.cold||0],['fc',t.fc],['np',t.np],['ac',t.ac]].sort(function(x,z){return z[1]-x[1];})[0][0];
return{text:ctx.t(ctx.pick(CLASH_BOTTOM[k]),o[0],o[1]),why:'どちらも受け。'+y.name+'が覚悟を決めた'};
}
var scen={
id:'whiteroom',name:'出られない部屋',kicker:'密室・関係性',
desc:'目覚めると白い部屋。扉の紙には脱出条件。条件は自由に組み立てられる（例：媚薬を10本飲み切って、エッチしないと出られない部屋）。',
unit:'時間',preRel:0,lethal:false,
romanceCore:true,
catBias:{romance:1.5,escape:1.2},decay:0.995,miniShare:0.75,priBoost:3,
derived:['caution','honesty','impulse','cold'],
exclude:['take_charge'],
env:[
{id:'cond',label:'条件1',type:'select',def:'h',options:options},
{id:'n1',label:'条件1の回数・本数',min:1,max:100,def:1,lo:'1',hi:'100',desc:'「キスを10回」「媚薬を10本」の数字。多いほど、住人は条件を進める行動をよく選び、残りの時間に合わせて一度に何回ぶんかをまとめて進める'},
{id:'cond2',label:'条件2（任意）',type:'select',def:'none',options:[{v:'none',label:'なし'}].concat(options.filter(function(o){return o.v!=='one';}))},
{id:'n2',label:'条件2の回数・本数',min:1,max:100,def:1,lo:'1',hi:'100'},
{id:'order',label:'条件の順番',type:'select',def:'any',options:[{v:'any',label:'どちらからでも（同時に数える）'},{v:'seq',label:'条件1を満たしてから条件2（先に満たした条件2は数えない）'}],desc:'どちらからでも：「媚薬2本とキス、両方を済ませないと出られない部屋」。条件1から：「媚薬を2本飲み切ったあとに、キスしないと出られない部屋」（条件1の前の条件2は、起きにくく、起きても数えない）'},
{id:'only1',label:'一人しか出られない（ほかの条件と併用）',type:'select',def:'off',options:[{v:'off',label:'なし'},{v:'on',label:'あり：条件を満たしても、扉をくぐれるのは一人だけ'}],desc:'条件1に「一人しか出られない」、条件2にキスなどを選んでも同じになる（条件2を満たすと扉が開き、くぐれるのは一人）。三人以上で一緒に満たしたときも一人だけ'},
{id:'allout',label:'条件を満たした人と一緒に、全員出られる',type:'select',def:'off',options:[{v:'off',label:'なし（条件を満たした人だけが出る）'},{v:'on',label:'あり：誰かが条件を満たして扉が開けば、何もしていない人も一緒に出られる'}],desc:'例：二人が条件を満たして扉が開いたとき、部屋に残っていた三人目もついでに出られる。「一人しか出られない」部屋では働かない'},
{id:'label',label:'部屋の名前（空欄なら自動）',type:'text',def:'',placeholder:'例：媚薬を10本飲み切らないと出られない部屋'},
{id:'hours',label:'閉じ込められる時間',min:4,max:240,def:10,lo:'4時間',hi:'10日',unit:'時間',desc:'長いほど、条件を進める出来事はゆっくりでも積み重なり、時間内に満たしやすくなる。48時間を超えると、経過は数時間ごとにまとめ、結果は重要な出来事だけの短縮版で表示する'},
{id:'pressure',label:'部屋の圧',min:0,max:100,def:50,lo:'居心地がいい',hi:'息苦しい',desc:'高いほど焦りが溜まり、覚悟が早く決まる'}
],
stats:[{id:'exp',label:'恋愛経験',desc:'高いほど条件への抵抗が小さい'},{id:'hp',label:'体力',desc:'媚薬・酒・激辛に耐える力。低い人が飲みすぎると倒れる'}],
actions:[
{id:'inspect',label:'扉と壁を調べ尽くす',fit:function(t){return t.a;},bias:{escape:2,solo:1.3}},
{id:'calm',label:'相手を落ち着かせる',fit:function(t){return t.np;},bias:{help:1.8,bond:1.3}},
{id:'still',label:'壁際で動かない',fit:function(t){return t.ac*0.7+t.caution*0.3;},bias:{solo:1.8,romance:0.7}},
{id:'rip',label:'条件の紙を破り捨てる',fit:function(t){return t.cp*0.6+t.aggr*0.4;},bias:{conflict:1.6,romance:0.6}},
{id:'fun',label:'状況を面白がる',fit:function(t){return t.fc;},bias:{bond:1.4,romance:1.3}}
],
goals:[
{id:'noway',label:'条件を満たさずに出る方法を探す',fit:function(t){return t.cp*0.5+t.a*0.5;},bias:{escape:1.8,romance:0.5}},
{id:'respect',label:'相手の意思を最優先する',fit:function(t){return t.np;},bias:{help:1.8,romance:0.9}},
{id:'quick',label:'さっさと条件を満たす',fit:function(t){return t.cold*0.5+t.impulse*0.5;},bias:{romance:1.7,escape:1.4}},
{id:'know',label:'相手の本心を知りたい',fit:function(t){return t.honesty*0.5+t.jealous*0.5;},bias:{bond:1.6,romance:1.2}}
],
steps:function(env){
var s=['目覚め'],H= +env.hours,st=Math.max(1,Math.ceil(H/48));
function lab(h){return h<24?h+'時間後':Math.floor(h/24)+'日'+(h%24?(h%24)+'時間':'')+'後';}
for(var h=st;h<H;h+=st)s.push(lab(h));
s.push(lab(H)+'（限界）');
return s;
},
longRun:function(env){return+env.hours>48;},
setup:function(ctx){
ctx.place='白い部屋';
ctx.rules=rulesOf(ctx.env);
ctx.flags.prog={};ctx.flags.consumed={};ctx.flags.drank={};
ctx.flags.roomLabel=HK.roomLabel(ctx.env);
ctx.flags.romantic=ctx.rules.some(function(r){var T=K[r.k];return(T.type==='act'&&T.lvl>=2)||r.k==='love'||r.k==='aphro';});
ctx.flags.hasAphroRule=ctx.rules.some(function(r){return r.k==='aphro';});
ctx.flags.isOne=ctx.rules[0].k==='one';
ctx.flags.oneCond= !ctx.flags.isOne&&oneWith(ctx.env);
ctx.flags.toolbox=ctx.rules.some(function(r){return r.k==='h'||r.k==='kiss';});
ctx.chars.forEach(function(c){c.baseTr=JSON.parse(JSON.stringify(c.tr));c.hp=40+ctx.stat(c,'hp')*12;});
ctx.stepsTotal=scen.steps(ctx.env).length;
ctx.stepH=Math.max(1,Math.ceil(+ctx.env.hours/48));
ctx.flags.goalSeen={};ctx.flags.goalOut=0;
var say0=ctx.say;
ctx.say=function(o){var e=say0.call(this,o);markGoals(ctx,e);if(o&&o.kind!=='step'&&doorHit(ctx,o))doorFlush(ctx);return e;};
},
phase:function(ctx,s,n){
if(s===0){
var cons=ctx.rules.filter(function(r){return K[r.k].type==='consume';});
ctx.say({text:names(ctx.present())+'は白い部屋で目を覚ました。扉には一枚の紙。「'+ctx.flags.roomLabel.replace(/部屋$/,'')+'」'+(cons.length?'部屋の隅のテーブルには、'+cons.map(function(r){return K[r.k].table?K[r.k].table(r.n):K[r.k].item+'が'+r.n+K[r.k].unit;}).join('、')+'並んでいる。':'')+(ctx.flags.toolbox?'ベッドの脇には、中身を想像したくない木箱が一つ置かれていた。':'')+(HK.Attr&&HK.Attr.raceIntro?HK.Attr.raceIntro(ctx.present(),'trapped',ctx):'')});
}
if(s===n-1&&ctx.present().length>1)ctx.say({text:'照明が一段暗くなった。残された時間は少ない。'});
},
after:function(ctx){
doorFlush(ctx);
countFlavor(ctx);
sweepExits(ctx);
doorFlush(ctx);
var P=ctx.present();
P.forEach(function(c){c.stress=HK.clamp(c.stress+ctx.env.pressure/100*12+4,0,100);});
if(P.length===2)ctx.mod2(P[0],P[1],{trust:2.5,att:ctx.flags.romantic?2:0.5,ten: -1},{trust:2.5,att:ctx.flags.romantic?2:0.5,ten: -1});
P.forEach(function(c){
if(c.flags.partner!=null&&ctx.chars[c.flags.partner].out)c.flags.partner=null;
if(c.flags.down>0){c.flags.down--;if(!c.flags.down)ctx.say({text:c.name+'がようやく起き上がった。',actors:[c]});}
if(c.flags.aphro)c.flags.aphro=Math.max(0,c.flags.aphro-0.15*(ctx.stepH||1));
if(c.flags.belly>0)c.flags.belly=Math.max(0,c.flags.belly-1);
});
},
end:function(ctx){return ctx.flags.oneOut||ctx.present().filter(function(c){return!c.flags.knocked;}).length<=(hasPairRule(ctx)?1:0);},
finish:function(ctx){
doorFlush(ctx);
sweepExits(ctx);
doorFlush(ctx);
ctx.present().concat(ctx.chars.filter(function(c){return c.alive!==false&& !c.out&&c.flags&&c.flags.knocked;})).forEach(function(c){
if(c.flags.stayed){c.fate='自分から残った';c.fateNote='条件を満たしたが、自分の意思で部屋に残った';return;}
c.fate='取り残された';
c.fateNote=c.flags.knocked?(c.flags.knockedBy!=null?ctx.chars[c.flags.knockedBy].name+'に':'')+'気絶させられ、部屋に残された':(ctx.flags.isOne||ctx.flags.oneCond)&&ctx.flags.oneOut?'扉はもう開かなかった':'最後まで条件を満たせなかった';
});
ctx.flags.outcome=ctx.flags.roomLabel;
if(HK.RoomLeft)HK.RoomLeft.decide(ctx);
},
events:[]
};
var EV=scen.events;
var ACT_RE={hand: /手を(繋|つな|握)|手を探り当て|指を絡/,hug: /抱きしめ|抱き合|ハグ/,lap: /膝枕/,kiss: /キスを?し|唇を重ね|口づけ/};
var NO_RE= /身を引いた|振り払った|振りほどいた|手を引っ込め|払いのけ|拒んだ/;
var FL_NOUN={hand:'手繋ぎ'};
function snip(t){t=String(t);return t.length>28?t.slice(0,27)+'…':t;}
function preSeen(ctx,r,a,b,e){
var p=prog(ctx,a,b);
p.pre=p.pre||{};p.pre[r.k]=(p.pre[r.k]||0)+1;
if((p.preNote=p.preNote||{})[r.k])return;
p.preNote[r.k]=1;
ctx.say({kind:'event',cat:'escape',actors:[a,b],text:waitNote(ctx,r,a,b),why:'「'+snip(e.text)+'」の中の'+(FL_NOUN[r.k]||K[r.k].noun)+'は、条件の順番（条件1を満たしてから条件2）で、まだ数えない',mag:4});
}
function countFlavor(ctx){
var from=ctx.flags.scan||0,L=ctx.log;
ctx.flags.scan=L.length;
if(ctx.flags.isOne)return;
for(var i=from;i<L.length;i++){
var e=L[i],ac=e.actors||[];
if(ac.length!==2|| !e.text|| /扉|\d+\/\d+）/.test(e.text))continue;
var a=typeof ac[0]==='number'?ctx.chars[ac[0]]:ac[0],b=typeof ac[1]==='number'?ctx.chars[ac[1]]:ac[1];
if(!a|| !b||a.out||b.out||a===b)continue;
if(a.alive===false||b.alive===false||e.cat==='kill'||e.cat==='death')continue;
ctx.rules.forEach(function(r){
if(r.k!=='love'||a.out||ruleDone(ctx,r,a,b)|| !/「[^」]*好き(?!な|に|じゃな)[^」]*」/.test(e.text))return;
if(seqWait(ctx,r,a,b)){preSeen(ctx,r,a,b,e);return;}
seqFlush(ctx,r,a,b);
var p=prog(ctx,a,b);
if((p.said['love'+a.i]||0)>=r.n)return;
p.said['love'+a.i]=(p.said['love'+a.i]||0)+1;
if(a.flags.partner==null)a.flags.partner=b.i;
if(b.flags.partner==null)b.flags.partner=a.i;
if(pairDone(ctx,a,b)){
var ex=exitPair(ctx,a,b,'扉の紙が、今の「好き」を数えた。','「'+snip(e.text)+'」の中で、条件の「好き」が揃った',false);
ctx.say({kind:'event',cat:'escape',actors:[a,b],text:ex.text,why:ex.why,mag:30});
}else ctx.say({kind:'event',cat:'romance',actors:[a,b],text:'扉の紙が、'+a.name+'の今の「好き」を数えた。残っているのは、'+leftText(ctx,a,b)+'。',why:'「'+snip(e.text)+'」の中で、条件の言葉が出た',mag:6});
});
ctx.rules.forEach(function(r){
if(a.out||K[r.k].type!=='act'|| !ACT_RE[r.k]||ruleDone(ctx,r,a,b)|| !ACT_RE[r.k].test(e.text)||NO_RE.test(e.text))return;
if(seqWait(ctx,r,a,b)){preSeen(ctx,r,a,b,e);return;}
var p=prog(ctx,a,b);
bumpAct(ctx,r,a,b,1);
var note='扉の紙が、今の'+(FL_NOUN[r.k]||K[r.k].noun)+'を数えた'+cntTag(ctx,r,a,b,p.act[r.k])+'。';
if(pairDone(ctx,a,b)){
var ex=exitPair(ctx,a,b,note,'「'+snip(e.text)+'」の中で、条件の'+(FL_NOUN[r.k]||K[r.k].noun)+'が済んでいた',false);
ctx.say({kind:'event',cat:'escape',actors:[a,b],text:ex.text,why:ex.why,mag:30});
}else if(p.act[r.k]>=r.n)ctx.say({kind:'event',cat:'escape',actors:[a,b],text:note+'扉はまだ開かない。'+a.name+'と'+b.name+'に残っているのは、'+leftText(ctx,a,b)+'。',why:'「'+snip(e.text)+'」の中で、条件の一つが済んだ',mag:8});
});
}
ctx.flags.scan=ctx.log.length;
}
function actElig(ctx,a,b){
return ctx.rules.filter(function(x){var T=K[x.k];return T.type==='act'&& !ruleDone(ctx,x,a,b)&& !(T.lvl>=5&& !okSex(a,b))&&(willing(ctx,a,b,T.lvl)||desperate(ctx,a,b,T.lvl));});
}
EV.push({
id:'doact',cat:'romance',sex:true,nightCond:true,scope:'pair',pri:true,
when:function(ctx,a,b){
if(a.flags.down||b.flags.down)return false;
return ctx.rules.some(function(r){
var T=K[r.k];
if(T.type!=='act'||ruleDone(ctx,r,a,b))return false;
if(T.lvl>=5&& !okSex(a,b))return false;
if(T.lvl>=3&&(exclOther(ctx,a,b)||exclOther(ctx,b,a)))return false;
return willing(ctx,a,b,T.lvl)||desperate(ctx,a,b,T.lvl);
});
},
w:function(ctx,a,b){
var lv=ctx.rules.reduce(function(m,r){return K[r.k].type==='act'?Math.min(m,K[r.k].lvl):m;},5);
var w=2+(5-lv)*0.7+R(ctx,a,b).att/40+(ctx.present().length===2?1:0);
if(crowd(ctx)){
[[a,b],[b,a]].forEach(function(x){var p=x[0].flags.partner;if(p!=null)w*=p===x[1].i?2.2:0.35;});
w*=0.6+eager(ctx,a);
}
var el=actElig(ctx,a,b);
if(el.length&&el.every(function(x){return seqWait(ctx,x,a,b);}))w*=0.15;
return w*needKPair(ctx,el,a,b);
},
run:function(ctx,a,b){
var el=actElig(ctx,a,b),r=el.filter(function(x){return!seqWait(ctx,x,a,b);})[0]||el[0];
var T=K[r.k],p=prog(ctx,a,b),wl=willing(ctx,a,b,T.lvl),wait=seqWait(ctx,r,a,b);
var first= !p.act[r.k]&& !(p.pre&&p.pre[r.k]);
var span=Math.max(3,ctx.stepsTotal*0.55);
var inc=r.n>3?Math.max(1,Math.round(r.n/span*(wl?1.3:0.8)*(0.6+ctx.rng()*0.8)*(6-T.lvl)/3)):1+(wl&&r.n>1&&ctx.rng()<0.5?1:0);
if(!wait)inc=paceInc(ctx,(p.tk=p.tk||{})[r.k]=p.tk[r.k]||{},r.n-((effOf(ctx,r,a,b)||[0])[0]||0),inc,0.4,r.n);
bumpAct(ctx,r,a,b,inc);
var g=T.lvl*2.5;
ctx.mod2(a,b,{att:wl?g+2:g/2,aff:wl?g/2:0,trust:2},{att:wl?g+2:g/2,aff:wl?g/2:0,trust:2});
var pool=ACT_TEXT[r.k][wl?'will':'des'];
var LW=HK.RoomLewd,isH=r.k==='h'&&LW;
var text=isH?(first&&(!wl||ctx.rng()<0.5)?ctx.t(ctx.pick(pool),a,b).replace(/――.*$/,''):'')+LW.scene(ctx,a,b,first?(wl?'will':'des'):'repeat')
:first?ctx.t(ctx.pick(pool),a,b)
:LW&&LW.repeat[r.k]&&ctx.rng()<0.8?ctx.t(ctx.pick(LW.repeat[r.k]),a,b):ctx.t(ctx.pick(REPEAT),a,b);
var user=ctx.most([a,b],function(c){return c.tr.fc*0.5+c.tr.impulse*0.3+(ctx.stat(c,'exp')-3)*0.1+eager(ctx,c)*0.3;});
if(HK.Pos&&okSex(a,b))user=HK.Pos.order(a,b,[user,user===a?b:a])[0];
if(ctx.flags.toolbox&&okSex(a,b)&&(r.k==='h'||r.k==='kiss')&&ctx.rng()<0.22+user.tr.fc*0.25+(ctx.stat(user,'exp')-3)*0.06+(a.flags.aphro||0)*0.03){
var tool=ctx.pick(TOOLS),other=user===a?b:a;
var tt=ctx.t(ctx.pick(tool.t),user,other);
text=isH?LW.scene(ctx,user,other,wl?'will':'des',{toolText:tt,lead:true}):tt.replace(/――$/,'')+ctx.t(ctx.pick(ACT_TEXT.kiss.will),user,other);
if(r.n>1)bumpAct(ctx,r,a,b,1);
ctx.mod2(user,other,{att:4},{att:other.tr.fc>0.5?5:1,ten:other.tr.cp>0.65?4:0});
ctx.flags.toolUsed=(ctx.flags.toolUsed||0)+1;
}
if(r.k==='kiss'&& !HK.SAFE_ON&&HK.Moan&&HK.Moan.pick&&HK.Pos&&okSex(a,b)&& !a.noR18&& !b.noR18&&ctx.rng()<0.6){
var kv=HK.Pos.order(a,b,[a,b])[1];
text+=kv.name+'「'+HK.Moan.pick(ctx,kv,'k0',{})+'」';
}
var HKr=HK.HateKit,rough=HKr&&(r.k==='h'||r.k==='kiss')?HKr.forcer(ctx,a,b):null;
if(rough&& !isH){
var rv=rough===a?b:a;
text=rough.name+'は'+rv.name+'の手首を掴んで、乱暴に壁へ押しつけた。'+HK.TL.line(rough,'H_ROUGH',rv)+text;
}
var cl=r.k==='h'&&first&&bothBottom(a,b)?clashText(ctx,a,b):null;
if(cl)text=cl.text+text;
var fsx=r.k==='h'&&HK.State.freeSex&&HK.State.freeSex(ctx,a,b);
if(fsx){if(first)text=HK.FreeSex.lead(ctx,a,b)+text;HK.FreeSex.mark(ctx,a,b);if(first)HK.FreeSex.jealous(ctx,a,b);}
text+=cntTag(ctx,r,a,b,p.act[r.k],inc);
var whyT=(wait?'条件の順番：条件1のあとから数える（今のは数えない）／':'')+(cl?cl.why+'／':'')+(rough?rough.name+'は'+(rough===a?b:a).name+'を敵視している（嫌悪 '+Math.round(HKr.level(ctx,rough,rough===a?b:a))+'）・強引な性格。条件のために、乱暴に':wl?'互いの惹かれ（'+Math.round(R(ctx,a,b).att)+'／'+Math.round(R(ctx,b,a).att)+'）と信頼':'焦りと諦め（'+Math.round(a.stress)+'／'+Math.round(b.stress)+'）。気持ちより状況が先だった');
if(checkExit(ctx,a,b))return exitPair(ctx,a,b,text,whyT,r.k==='h');
if(!wait&&p.act[r.k]>=r.n)text+='扉はまだ開かない。'+a.name+'と'+b.name+'に残っているのは、'+leftText(ctx,a,b)+'。';
return{text:text,why:whyT,mag:first?15:5};
}
});
function eager(ctx,c){
return HK.clamp(c.tr.impulse*0.45+c.tr.fc*0.25+(ctx.stat(c,'exp')-3)*0.08+(c.flags.aphro||0)*0.05-c.tr.ac*0.15-c.tr.cp*0.15+0.2,0,1);
}
HK.roomEager=eager;
function heavyRule(ctx){return ctx.rules.some(function(r){return K[r.k].type==='act'&&K[r.k].lvl>=3;});}
function crowd(ctx){return ctx.present().length>=3&&heavyRule(ctx);}
function exclOther(ctx,a,b){
if(!a.flags.excl||a.flags.exclOpen||a.flags.partner==null||a.flags.partner===b.i)return false;
var p=ctx.chars[a.flags.partner];
if(!p||p.out||p.flags.down)return false;
var el=ctx.stepIndex-(a.flags.partnerAt||0);
if(el>=3&&R(ctx,a,b).att>=35&&R(ctx,a,b).att>R(ctx,a,p).att)return false;
return true;
}
function willing(ctx,a,b,lvl){
if(lvl>=5&&HK.RoomReluct&&HK.RoomReluct.blocks(ctx,a,b))return false;
if(lvl>=5&& !okSex(a,b))return false;
var exp=(ctx.stat(a,'exp')+ctx.stat(b,'exp')-6)*3+(ctx.present().length===2?4:0)-tieWall(ctx,a,b,lvl);
if(lvl>=5&&HK.Pos&&HK.Pos.libMul)exp+=(HK.Pos.libMul([a,b])-1)*12;
var ab=R(ctx,a,b),ba=R(ctx,b,a);
return ab.att+exp>LVL_ATT[lvl]&&ba.att+exp>LVL_ATT[lvl]&&ab.trust>LVL_TRUST[lvl]&&ba.trust>LVL_TRUST[lvl]&&ab.ten<55&&ba.ten<55;
}
function desperate(ctx,a,b,lvl){
if(lvl>=5&&HK.RoomReluct&&HK.RoomReluct.blocks(ctx,a,b))return false;
if(lvl>=5&& !okSex(a,b))return false;
var wall=tieWall(ctx,a,b,lvl);
if(wall>=999)return false;
var des=10+lvl*10+Math.max(0,wall)*0.6;
var ab=R(ctx,a,b),ba=R(ctx,b,a);
return(a.flags.resign||a.stress>des)&&(b.flags.resign||b.stress>des)&&ab.trust>LVL_TRUST[lvl]-18&&ba.trust>LVL_TRUST[lvl]-18&&ab.ten<60&&ba.ten<60;
}
function wordElig(ctx,a,b){
return ctx.rules.filter(function(x){return K[x.k].type==='word'&& !(x.k==='love'&&HK.ngPair(a,b))&& !ruleDone(ctx,x,a,b)&&(K[x.k].mode==='sum'||(prog(ctx,a,b).said[x.k+a.i]||0)<x.n);});
}
EV.push({
id:'doword',cat:'bond',scope:'pair',pri:true,
when:function(ctx,a,b){return ctx.rules.some(function(r){return K[r.k].type==='word'&& !(r.k==='love'&&HK.ngPair(a,b))&& !ruleDone(ctx,r,a,b)&&(K[r.k].mode==='sum'||(prog(ctx,a,b).said[r.k+a.i]||0)<r.n);});},
w:function(ctx,a,b){
var w=1.6+a.tr.honesty*0.8+a.stress/80+Math.max(0,R(ctx,a,b).trust)/60-(a.tr.cp>0.7?0.3:0)+(ctx.present().length===2?1:0);
var p=prog(ctx,a,b);
if(ctx.rules.some(function(r){return K[r.k].type==='word'&&K[r.k].mode==='both'&&(p.said[r.k+b.i]||0)>(p.said[r.k+a.i]||0);}))w*=3.5;
if(a.flags.partner!=null)w*=a.flags.partner===b.i?1.8:0.6;
var el=wordElig(ctx,a,b);
if(el.length&&el.every(function(x){return seqWait(ctx,x,a,b);}))w*=0.15;
return w*needKPair(ctx,el,a,b);
},
run:function(ctx,a,b){
var el=wordElig(ctx,a,b),r=el.filter(function(x){return!seqWait(ctx,x,a,b);})[0]||el[0];
var p=prog(ctx,a,b),rr=R(ctx,a,b),text,whyT,cat='bond',wait=seqWait(ctx,r,a,b);
var inc=r.k==='praise'?1+ctx.rng.int(Math.max(1,Math.ceil(r.n/4))):r.n>3?Math.max(1,Math.round(r.n/Math.max(3,ctx.stepsTotal*0.5)*(0.6+ctx.rng()*0.8))):1;
if(!wait){var wv=effOf(ctx,r,a,b)||[0,0];inc=paceInc(ctx,(p.tk=p.tk||{})[r.k+a.i]=p.tk[r.k+a.i]||{},r.n-(K[r.k].mode==='sum'?wv[0]+wv[1]:(p.said[r.k+a.i]||0)),inc,0.4,r.n);}
if(wait){p.pre=p.pre||{};p.pre[r.k]=(p.pre[r.k]||0)+inc;}
else{seqFlush(ctx,r,a,b);p.said[r.k+a.i]=(p.said[r.k+a.i]||0)+inc;}
if(r.k==='love'){
cat='romance';
var sincere=rr.att>40&&rr.aff>25;
if(sincere){text=ctx.pick(['{a}は{b}に言った。「好きだよ｜好きだ｜好きです」声は、思ったより震えていた。','{a}は{b}の目をまっすぐ見て「好き」と言った。言ってから、自分で驚いた顔をした。','「好き。……条件とか関係なく｜好きだ。……条件とは関係なく｜好きです。……条件とは関係ありません」{a}は{b}に小さく付け足した。','{a}は{b}の耳元で、聞こえるか聞こえないかの声で「好き」と言った。']);ctx.mod(b,a,{att:10,aff:8});}
else if(a.tr.cold>0.6){text=ctx.pick(['「好き。……これでいい？｜好きだ。……これでいいか？｜好きです。……これでいいですか？」{a}は{b}ではなく扉を見たまま言った。','{a}は{b}に棒読みで「好き」と言い、紙の方を確認した。','「好き好き好き」{a}は{b}に早口で三回言って、肩をすくめた。']);ctx.mod(b,a,{ten:6,aff: -3});}
else{text=ctx.pick(['{a}は{b}から目を逸らしたまま、「好き」と小さく言った。','{a}は{b}の前で何度か口を開けては閉じて、ようやく「……好き｜……好きだ｜……好きです」と絞り出した。','「す、好き｜す、好きだ｜す、好きです」{a}は噛んだ。{b}が吹き出した。']);ctx.mod(b,a,{att:4});}
whyT=sincere?'本心（惹かれ '+Math.round(rr.att)+'）':a.name+'の'+(a.tr.cold>0.6?'ドライさ':'焦り')+'。言葉だけが先に出た';
}else if(r.k==='honne'){
var what;
if(rr.att>35&& !HK.ngPair(a,b)){what=ctx.pick(['{a}は、ずっと{b}に惹かれていたと打ち明けた。','{a}は{b}に「本当は私、最初に会ったときから気になってた｜本当は私、最初に会ったときから気になっていた｜本当は私、最初に会ったときから気になっていました」と言った。']);ctx.mod(b,a,{att:8,aff:6});}
else if(rr.ten>30){what=ctx.pick(['{a}は、{b}のことが苦手だったと正直に言った。','{a}は{b}に「あのときの一言、私、まだ根に持ってる｜あのときの一言を、私はまだ根に持っている｜あのときの一言、私、まだ根に持っています」と打ち明けた。']);ctx.mod(b,a,{ten:6,trust:6});}
else if(a.stress>50){what=ctx.pick(['{a}は{b}にだけ、本当はずっと怖かったと口にした。','{a}は{b}に、ここに来る前から眠れていなかったと話した。']);ctx.mod(b,a,{aff:6,trust:8});}
else{what=ctx.pick(['{a}は{b}に、誰にも話したことのない昔の話をした。','{a}は{b}に、家族とずっと口をきいていないことを打ち明けた。','{a}は{b}に、本当は今の仕事を辞めたいのだと言った。']);ctx.mod(b,a,{trust:10});}
ctx.mod(a,b,{trust:6});
text=what;whyT=a.name+'の本音の出やすさ（'+Math.round(a.tr.honesty*100)+'）';
}else{
var pr=praiseFor(ctx,a,b,inc);
text=ctx.pick(['{a}は{b}に「'+pr+'」','{a}は少し考えてから「'+pr+'」と言った。','「'+pr+'」と{a}が言うと、{b}は「そんなとこ見てたの｜そんなところを見ていたのか｜そんなところを見ていたんですか」と目を丸くした。','{a}は指を折りながら、{b}のいいところを「'+pr+'」と挙げた。']);
ctx.mod(b,a,{aff:3,att:2});
whyT=a.name+'の観察（'+(a.tr.np>a.tr.a?'NP':'A')+'）'+(ctx.flags.praiseSrc?'／'+b.name+'の'+ctx.flags.praiseSrc+'から':'');
ctx.flags.praiseSrc=null;
}
if(text.indexOf('{b}')<0)text='（'+b.name+'に）'+text;
text=ctx.t(text,a,b);
var T=K[r.k];
if(T.mode==='both'&&a.flags.partner==null){a.flags.partner=b.i;if(b.flags.partner==null)b.flags.partner=a.i;}
var cnt=T.mode==='sum'?(p.said[r.k+a.i]||0)+(p.said[r.k+b.i]||0):p.said[r.k+a.i];
text+=cntTag(ctx,r,a,b,cnt,inc);
if(checkExit(ctx,a,b))return exitPair(ctx,a,b,text,whyT,false);
if(pairOnlyWait(ctx,a,b))text+='扉はまだ開かない。'+a.name+'と'+b.name+'に残っているのは、'+leftText(ctx,a,b)+'。';
return{cat:cat,text:text,why:whyT};
}
});
EV.push({
id:'consume',label:'条件の飲み物や食べ物を口にする',cat:'escape',scope:'solo',pri:true,
when:function(ctx,a){return!a.flags.down&&ctx.rules.some(function(r){return K[r.k].type==='consume'&&globLeft(ctx,r)>0;});},
w:function(ctx,a){
var r=ctx.rules.filter(function(x){return K[x.k].type==='consume'&&globLeft(ctx,x)>0;})[0];
return(0.8+ITEM[r.k].fit(a)*1.5+a.stress/120+ctx.stepIndex*(ctx.stepH||1)/Math.max(4,ctx.env.hours)*1.5+(r.k==='sake'&&a.alcohol?(a.alcohol-3)*0.3:0)+(ITEM[r.k].wb||0))*needK(globLeft(ctx,r)/(K[r.k].mul||1),r.n/(K[r.k].mul||1),ctx);
},
run:function(ctx,a){
var r=ctx.rules.filter(function(x){return K[x.k].type==='consume'&&globLeft(ctx,x)>0;})[0];
var I=ITEM[r.k],left=globLeft(ctx,r);
var boss=ctx.most(ctx.present(),function(c){return c.tr.cp*(1-c.tr.np);});
var drinker=a,forced=false,HKt=HK.HateKit;
var foe=HKt?ctx.most(ctx.others(a).filter(function(o){return HKt.forceful(ctx,a,o)&& !o.flags.down;}),function(o){return HKt.level(ctx,a,o);}):null;
if(foe&&ctx.rng()<0.65){drinker=foe;forced='hate';}
else if(boss===a&&a.tr.cp>0.7&&a.tr.np<0.4&&ctx.rng()<0.5){
var meek=ctx.most(ctx.others(a),function(o){return o.tr.ac;});
if(meek&&meek.tr.ac>0.6){drinker=meek;forced=true;}
}
var scale=Math.max(1,Math.round(r.n/Math.max(4,ctx.stepsTotal*1.2)*(I.mult||1)));
if(I.round)scale=Math.max(I.round,Math.round(scale/I.round)*I.round);
var n=Math.min(left,(1+(drinker.tr.impulse>0.6?ctx.rng.int(3):ctx.rng.int(2)))*scale);
var np=paceInc(ctx,(ctx.flags.ctk=ctx.flags.ctk||{})[r.k]=ctx.flags.ctk[r.k]||{},left,n,0.6,r.n);
if(np>n)n=Math.min(left,I.round?Math.ceil(np/I.round)*I.round:np);
ctx.flags.consumed[r.k]=(ctx.flags.consumed[r.k]||0)+n;
var dk=ctx.flags.drank[drinker.i]=ctx.flags.drank[drinker.i]||{};
dk[r.k]=(dk[r.k]||0)+n;
I.effect(ctx,drinker,n);
var tk=topKey(drinker);
var al=r.k==='sake'&&drinker.alcohol?(drinker.alcohol<=2?I.lines.weak:drinker.alcohol>=4?I.lines.strong:null):null;
var lines=al||I.lines[tk]||I.lines.np;
var text;
if(forced==='hate'){
var resist=drinker.tr.cp*0.4+drinker.tr.aggr*0.3-drinker.tr.ac*0.2>0.35&&ctx.rng()<0.5;
text=a.name+'は'+K[r.k].item+'を掴むと、'+drinker.name+'の顎を押さえつけた。'+HK.TL.line(a,'H_FORCE_DRINK',drinker)+HK.TL.line(drinker,'R_FORCED',a)+
(resist?drinker.name+'は身をよじり、半分を床にこぼしながらも、残りを飲み下させられた。':drinker.name+'は咳き込みながら、'+n+K[r.k].unit+'分を飲み下させられた。');
ctx.mod(drinker,a,{ten:18,trust: -14,aff: -8});
if(HKt)HKt.shift(ctx,drinker,a,10);
}else if(forced){
text=a.name+'は'+drinker.name+'の前に'+K[r.k].item+'を押しやった。「飲め｜＝｜飲んでください」'+drinker.name+'は逆らわずに'+n+K[r.k].unit+'空けた。';
ctx.mod(drinker,a,{ten:14,trust: -10});
}else text=ctx.t(ctx.pick(lines),drinker).replace(/\{n\}/g,String(n));
var st=I.state(drinker);
if(st)text+=ctx.t(st,drinker);
var total=r.n-globLeft(ctx,r);
text+='（'+K[r.k].item+' '+total+'/'+r.n+K[r.k].unit+'）';
var whyT=forced==='hate'?a.name+'は'+drinker.name+'を敵視している（嫌悪 '+Math.round(HKt.level(ctx,a,drinker))+'）・強引な性格。自分では飲まずに、無理やり飲ませた（'+drinker.name+'の嫌悪も上がった）':forced?a.name+'のCP高・NP低／'+drinker.name+'のAC（断れない）':drinker.name+'の'+{np:'NP（自分が引き受ける）',fc:'衝動性（面白がる）',cold:'ドライさ（効率）',ac:'AC（空気を読んで）',cp:'CP（負けず嫌い）'}[tk];
var e={text:text,why:whyT,with:drinker!==a?[drinker]:null,mag:6};
if(total>=r.n){
ctx.say({kind:'event',cat:'escape',actors:drinker!==a?[a,drinker]:[a],text:text,why:whyT,mag:10});
if(!hasPairRule(ctx)){checkExit(ctx);return null;}
ctx.say({text:lastOf(r)+'。だが扉はまだ開かない。紙の残りの一文が、まだ残っている。'});
ctx.present().forEach(function(x){
ctx.present().forEach(function(y){
if(x.i<y.i&& !x.out&& !y.out&& !ctx.flags.oneOut&&pairDone(ctx,x,y)){
var actR=ctx.rules.filter(function(q){return K[q.k].type!=='consume';})[0];
var ex=exitPair(ctx,x,y,x.name+'と'+y.name+'は、もう一つの条件をすでに満たしていた。'+(actR&&HK.RoomLewd?HK.RoomLewd.recap(ctx,x,y,actR.k,0):''),'条件がすべて揃った',false);
ctx.say({kind:'event',cat:'escape',actors:[x,y],text:ex.text,why:ex.why,mag:30});
}
});
});
return null;
}
return e;
}
});
EV.push({
id:'aphro_react',cat:'help',scope:'pair',
when:function(ctx,a,b){return(b.flags.aphro||0)>=2;},
w:function(ctx,a,b){return 0.6+a.tr.np*0.8+R(ctx,a,b).att/60;},
run:function(ctx,a,b){
var r=R(ctx,a,b);
if(a.tr.np>0.55){ctx.mod2(a,b,{att:3},{trust:12,aff:8});ctx.stress(b,-6);return{text:ctx.t(ctx.pick(['{a}は水を汲んで{b}に渡し、手の届かない距離に座り直した。「辛かったら言って｜辛かったら言え｜辛かったら言ってください」','{a}は自分の上着を脱いで、熱っぽい{b}の肩にかけた。','{a}は{b}の額に濡らした布を当てた。「無理しないで｜無理をするな｜無理しないでください」','{a}は{b}の隣で、ただ黙って時間が過ぎるのを待った。']),a,b),why:a.name+'のNP：相手の意思を待つ'};}
if(r.att>35&& !HK.ngPair(a,b)){ctx.mod2(a,b,{att:9},{att:6});return{cat:'romance',text:ctx.t(ctx.pick(['{a}は、潤んだ目の{b}から視線を外せなくなっていた。','{b}が袖を掴んできた。{a}はその手を振りほどけなかった。','{a}は{b}の熱い指先が自分の手首に触れるのを、黙って許した。']),a,b),why:a.name+'の元々の惹かれ（'+Math.round(r.att)+'）'};}
if(a.tr.cp>0.6){ctx.mod(a,b,{ten:6});return{cat:'conflict',text:ctx.t(ctx.pick(['「考えなしに飲むからだよ｜考えなしに飲むからだ｜考えなしに飲むからです」{a}は壁際から動かなかった。','{a}は{b}から一番遠い隅に移って、背中を向けた。']),a,b),why:a.name+'のCP'};}
return{text:ctx.t(ctx.pick(['{a}はどうしていいか分からず、{b}の背中をぎこちなくさすった。','{a}は{b}の様子を気にしながら、紙の文面を何度も読み返していた。']),a,b),why:'戸惑い'};
}
});
EV.push({
id:'pick_one',cat:'bond',scope:'pair',pri:true,
when:function(ctx,a,b){return crowd(ctx)&&a.flags.partner==null&& !HK.ngPair(a,b)&&eager(ctx,a)<0.42&&R(ctx,a,b).trust> -5&&ctx.stepIndex>=1&& !loveTrioOf(ctx,a,b);},
w:function(ctx,a,b){return 0.5+(0.5-eager(ctx,a))+(R(ctx,a,b).trust+R(ctx,a,b).aff)/80;},
run:function(ctx,a,b){
a.flags.partner=b.i;a.flags.excl=true;a.flags.partnerAt=ctx.stepIndex;
var mutual=b.flags.partner==null&&eager(ctx,b)<0.55;
if(mutual){b.flags.partner=a.i;b.flags.excl=true;b.flags.partnerAt=ctx.stepIndex;}
ctx.mod2(a,b,{trust:8,att:4},{trust:mutual?8:3,att:mutual?4:1});
return{text:ctx.t(ctx.pick(['{a}は{b}の袖を引いた。「…するなら、私は{b}がいい。他の人とは無理｜…するなら、私は{b}がいい。他の者とは無理だ｜…するなら、私は{b}がいいです。他の人とは無理です」','{a}は皆に聞こえないように{b}に言った。「揉めたくない。だから、相手は{b}だけって決めていい？｜揉めたくない。だから、相手は{b}だけと決めていいか？｜揉めたくありません。だから、相手は{b}だけと決めていいですか？」','{a}は{b}の隣に座って、それ以上誰とも目を合わせなかった。','{a}「私、こういうのは一人とだけって決めてる｜私は、こういうことは一人とだけと決めている｜私、こういうことは一人とだけと決めています」{a}は{b}の方だけを見ていた。']),a,b)+(mutual?ctx.t('{b}は小さく頷いた。',a,b):''),why:a.name+'は積極性が低く（'+Math.round(eager(ctx,a)*100)+'）、面倒を避けて相手を一人に決めた'};
}
});
EV.push({
id:'decline_more',label:'決めた相手がいるので誘いを断る',cat:'conflict',scope:'pair',
when:function(ctx,a,b){return crowd(ctx)&&b.flags.partner!=null&&b.flags.partner!==a.i&& !HK.ngPair(a,b)&&eager(ctx,a)>0.55&&R(ctx,a,b).att>15;},
w:function(ctx,a){return 0.6+eager(ctx,a);},
run:function(ctx,a,b){
var p=ctx.chars[b.flags.partner];
ctx.mod2(a,b,{att:2,ten:3},{ten:8});
if(p&& !p.out)ctx.mod(p,a,{ten:8});
return{text:ctx.t(ctx.pick(['{a}が{b}に「こっちでもいいじゃん｜こっちでもいいだろう｜こちらでもいいでしょう」と囁いた。{b}は首を振って、{c}の隣に戻った。','{a}は{b}の肩に手を回した。{b}は「…ごめん、決めてるから｜…すまない、決めているんだ｜…ごめんなさい、もう決めているんです」とその手を外した。','{a}「三人の方が早く済むかもよ？｜三人の方が早く済むのではないか？｜三人の方が、早く済むかもしれませんよ？」{b}「そういう問題じゃない｜そういう問題ではない｜そういう問題ではありません」']).replace(/\{c\}/g,p?p.name:'相手'),a,b),why:b.name+'はもう相手を決めている。'+a.name+'の積極性（'+Math.round(eager(ctx,a)*100)+'）'};
}
});
EV.push({
id:'multi_flirt',cat:'romance',scope:'pair',
when:function(ctx,a,b){return crowd(ctx)&&eager(ctx,a)>0.6&&(a.flags.partner==null||a.flags.partner!==b.i)&&HK.canLove(a,b)&& !clashH(ctx,a,b);},
w:function(ctx,a){return 0.5+eager(ctx,a)*1.2;},
run:function(ctx,a,b){
ctx.mod2(a,b,{att:7},{att:eager(ctx,b)>0.5?6:2,ten:eager(ctx,b)>0.5?0:4});
var jealous=ctx.present().filter(function(o){return o!==a&&o!==b&&R(ctx,o,a).att>30&&(!HK.Obsess||HK.Obsess.jealOk(ctx,o,a));})[0];
if(jealous){ctx.pair(jealous,a).jealous++;ctx.mod(jealous,a,{ten:8});if(HK.Obsess)HK.Obsess.feed(ctx,jealous,a,6);}
return{text:ctx.t(ctx.pick(['{a}は{b}の隣に移って、指先で{b}の手の甲をなぞった。「次は{b}の番かな｜次は{b}の番か｜次は{b}の番でしょうか」','{a}「どうせなら、全員と仲良くなっといた方が早くない？｜どうせなら、全員と仲良くなっておいた方が早くないか？｜どうせなら、全員と仲良くなっておいた方が早くないですか？」{b}は返事に困った。','{a}は誰かと話しながらも、ずっと{b}に視線を送っていた。','{a}は{b}の耳元で「あとで、ね｜あとでだ｜あとでにしましょう」と囁いた。']),a,b)+(jealous?ctx.t('それを見ていた{c}の顔が、少し曇った。',a,b,jealous):''),why:a.name+'の積極性（'+Math.round(eager(ctx,a)*100)+'）：一人に決めず、何人とでも'};
}
});
function trioOut(c){return!!(HK.Pos&&HK.Pos.trioOptOut&&HK.Pos.trioOptOut(c));}
function groupOf(ctx,a){
if(eager(ctx,a)<=0.55||a.flags.partner!=null||trioOut(a))return null;
var G=[a];
ctx.present().filter(function(c){return c!==a&&eager(ctx,c)>0.55&&c.flags.partner==null&& !trioOut(c);})
.sort(function(x,y){return eager(ctx,y)-eager(ctx,x);})
.forEach(function(c){if(G.length<4&&G.every(function(g){return okSex(g,c);}))G.push(c);});
if(G.length>=3)return G;
var T3=HK.RoomTrio,cs=ctx.present().filter(function(c){return c!==a&&eager(ctx,c)>0.55&&c.flags.partner==null&& !trioOut(c);})
.sort(function(x,y){return eager(ctx,y)-eager(ctx,x);});
for(var i=0;T3&&T3.plan3&&i<cs.length;i++)for(var j=i+1;j<cs.length;j++){var g3=[a,cs[i],cs[j]],pl=T3.plan3(g3);if(pl&& !pl.all){g3.hub=pl.hub;return g3;}}
return null;
}
EV.push({
id:'group_h',cat:'romance',sex:true,nightCond:true,scope:'solo',pri:true,
when:function(ctx,a){
if(!ctx.rules.some(function(r){return r.k==='h';})||ctx.flags.groupDone)return false;
return ctx.present().length>=3&&eager(ctx,a)>0.7&& !!groupOf(ctx,a);
},
w:function(ctx,a){return 0.4+eager(ctx,a);},
run:function(ctx,a){
var G=groupOf(ctx,a);
if(!G)return null;
ctx.flags.groupDone=true;
var others=ctx.present().filter(function(c){return G.indexOf(c)<0;});
var rh=ctx.rules.filter(function(r){return r.k==='h';})[0],gWait=null;
G.forEach(function(x){G.forEach(function(y){if(x.i<y.i){if(!G.hub||okSex(x,y))ctx.pair(x,y).night=true;ctx.mod2(x,y,{att:8,aff:4},{att:8,aff:4});if(!bumpAct(ctx,rh,x,y,1,null,false)&& !gWait)gWait=[x,y];}});});
var tps=G.hub?[[G[0],G[1]],[G[0],G[2]],[G[1],G[2]]].filter(function(p){return okSex(p[0],p[1]);}):null;
others.forEach(function(o){G.forEach(function(g){ctx.mod(o,g,{ten:6});});ctx.stress(o,8);});
var lead=(HK.Pos&&G.filter(function(c){return HK.Pos.hardTopIn(c,G);})[0])||a,g2=G.filter(function(c){return c!==lead;});
var groupLine=null,g4in=false;
var text=ctx.t('{a}が「もう、みんなでいいじゃん｜もう、みんなでいいだろう｜もう、みんなでいいじゃないですか」と笑った。',a)+names(G)+'は顔を見合わせ、誰からともなく手を伸ばした。'+
((groupLine&&groupLine())||ctx.t('{a}が照明を落とすと、{b}と{c}も黙って身を寄せた。その先のことは、輪の中にいた者だけが知っている。',G.hub||lead,(G.hub?G.filter(function(c){return c!==G.hub;}):g2)[0],(G.hub?G.filter(function(c){return c!==G.hub;}):g2)[1]))+
(G.length>3&& !g4in?names(G.slice(3))+'も、すぐに輪の中に引き込まれた。':'')+'――'+(others.length?names(others)+'は部屋の隅で、背中を向けて耳を塞いでいた。':'');
var exitTxt=[];
if(HK.RoomTrio&&(ctx.env.multi||'note')!=='no'&&G.every(function(x){return G.every(function(y){return x===y||pairDone(ctx,x,y);});})){
ctx.flags.multiKnown=true;
var exG=HK.RoomTrio.exitGroup(ctx,G,text,names(G)+'の積極性が揃った。但し書き：三人以上で同時なら全員分',true,'free');
if(tps&&exG)exG.trioPairs=tps;
return exG;
}
G.forEach(function(x){G.forEach(function(y){if(x.i<y.i&& !x.out&& !y.out&&pairDone(ctx,x,y)){var ex=exitPair(ctx,x,y,'','複数人で条件を満たした',!G.hub||okSex(x,y));exitTxt.push(ex.text);}});});
if(gWait)text+=waitNote(ctx,rh,gWait[0],gWait[1]);
return{trioPairs:tps,text:text+(exitTxt.length?exitTxt[0]:''),why:names(G)+'の積極性が揃った（'+G.map(function(c){return Math.round(eager(ctx,c)*100);}).join('・')+'）'+(G.hub?'／'+G.hub.name+'を真ん中に（'+G.filter(function(c){return c!==G.hub;}).map(function(c){return c.name;}).join('と')+'は直接は触れ合わない）':''),mag:35};
}
});
function speedy(c){return c.tr.cold*0.45+c.tr.aggr*0.3+c.tr.impulse*0.25-c.tr.np*0.35;}
EV.push({
id:'speedrun',cat:'romance',sex:true,nightCond:true,scope:'pair',pri:true,
when:function(ctx,a,b){
if(a.flags.down||b.flags.down||ctx.pair(a,b).speedTried||speedy(a)<0.38||ctx.stepIndex<1)return false;
if(b.flags.partner!=null&&b.flags.partner!==a.i)return false;
if(clashH(ctx,a,b))return false;
if(HK.Pos&&(HK.Pos.hardTop(b,a)|| !canLead(a,b)))return false;
return ctx.rules.some(function(r){return K[r.k].type==='act'&&K[r.k].lvl>=2&& !ruleDone(ctx,r,a,b)&& !seqWait(ctx,r,a,b);})&&tieWall(ctx,a,b,3)<999&&HK.canLove(a,b);
},
w:function(ctx,a){return(speedy(a)-0.25)*3+a.stress/120+(a.goal.id==='quick'?0.8:0);},
run:function(ctx,a,b){
var pf=ctx.pair(a,b);pf.speedTried=true;
var lockedOther=HK.Pos&&okSex(a,b)&&HK.Pos.order(a,b,[a,b])[0]!==a;
var tool=ctx.flags.toolbox?ctx.pick(['手錠','ロープ','木箱の革ベルト']):ctx.pick(['ネクタイ','ベルト','シーツを裂いた紐']);
var dodge=b.tr.caution*0.4+b.tr.cp*0.3+b.tr.a*0.2+ctx.rng()*0.5+Math.max(0,tieWall(ctx,a,b,3))/60;
if(dodge>0.75||lockedOther){
ctx.mod2(a,b,{ten:6},{ten:22,trust: -20});
return{cat:'conflict',text:ctx.t(ctx.pick(['{a}が{b}の背後に回り込んだ瞬間、{b}は振り向きざまに{a}の手首を掴んだ。「…何するつもり？｜…何をするつもりだ？｜…何をするつもりですか？」{a}は'+tool+'を後ろ手に隠した。','{a}は'+tool+'を手に{b}の隙を窺っていたが、{b}は最後まで背中を見せなかった。','{b}は{a}の手元の'+tool+'に気づいて、部屋の反対側まで下がった。「近づかないで｜近づくな｜近づかないでください」']),a,b),why:a.name+'のスピード型（ドライさ・攻撃性・衝動）／'+b.name+'の慎重さが上回った'};
}
pf.night=pf.night||ctx.rules.some(function(r){return r.k==='h';});
pf.forced=a.i;
var p=prog(ctx,a,b);
var waited=[];
ctx.rules.forEach(function(r){if(K[r.k].type==='act'&& !bumpAct(ctx,r,a,b,0,r.n))waited.push(r);});
var liked=R(ctx,b,a).att>35;
ctx.mod2(a,b,{att:4,trust: -4},liked?{att:6,ten:10,trust: -6}:{ten:35,trust: -35,aff: -20});
var text=ctx.t(ctx.pick(['{b}が扉の紙を読み返している隙に、{a}は'+tool+'で{b}の手首を縛った。「すぐ終わらせるから。恨むなら部屋を恨んで｜すぐ終わらせる。恨むなら部屋を恨め｜すぐ終わらせます。恨むなら部屋を恨んでください」――','{a}は何の前置きもなく{b}をベッドに押し倒し、'+tool+'で両手をまとめた。「話し合ってたら日が暮れる｜話し合っていたら日が暮れる｜話し合っていたら日が暮れます」――','{a}は「ちょっと手、貸して｜少し手を貸せ｜ちょっと手を貸してください」と言って、差し出された{b}の両手を'+tool+'で縛った。――{a}は時計も見ずに、手際よく条件を片づけた。','{a}は{b}が眠りかけた瞬間を逃さず、'+tool+'で{b}の両手首を縛った。結び目は、驚くほど手慣れていた。――']),a,b);
if(liked&&HK.RoomLewd&&ctx.rules.some(function(r){return r.k==='h';}))text=text.replace(/――$/,'')+HK.RoomLewd.scene(ctx,a,b,'speed',{lead:true});
else if(!ctx.rules.some(function(r){return r.k==='h';})){
var SPD={kiss:['{a}は縛った{b}の顎を持ち上げ、条件の数だけ、手早く唇を重ねた。','{a}は身動きの取れない{b}に、息つく暇もなくキスを繰り返した。'],hug:['{a}は縛った{b}を正面から抱きすくめ、条件の回数だけ腕に力を込めた。','{a}は{b}を後ろから抱え込み、「はい、一回、二回」と数えながら締めつけた。'],hand:['{a}は縛られた{b}の指に、自分の指を無理やり絡めた。'],lap:['{a}は{b}の頭を自分の膝に押しつけて、条件の時間が過ぎるまで離さなかった。']};
ctx.rules.forEach(function(r){if(SPD[r.k])text+=ctx.t(ctx.pick(SPD[r.k]),a,b);});
}
text+=liked?ctx.t('{b}は解かれた手首をさすりながら「…強引すぎ｜…強引すぎる｜…強引すぎます」とだけ言った。耳が赤かった。',a,b):ctx.t('{b}は解かれた手首をさすったまま、{a}と一度も目を合わせなかった。',a,b);
if(waited.length)text+=waitNote(ctx,waited[0],a,b);
var whyT=a.name+'のスピード型（ドライさ '+Math.round(a.tr.cold*100)+'・攻撃性 '+Math.round(a.tr.aggr*100)+'・NP低）';
if(checkExit(ctx,a,b))return exitPair(ctx,a,b,text,whyT,pf.night);
return{text:text,why:whyT,mag:30};
}
});
EV.push({
id:'aphro_heat',cat:'romance',sex:true,scope:'pair',pri:true,
when:function(ctx,a,b){return!a.flags.down&&(a.flags.aphro||0)>=2.5+ctx.stat(a,'hp')*0.5&& !ctx.pair(a,b).heatDone;},
w:function(ctx,a,b){
var w=0.4+(a.flags.aphro||0)/4+R(ctx,a,b).att/60+(b.flags.aphro?0.4:0);
var hr=ctx.rules.filter(function(r){return r.k==='h'||r.k==='kiss'||r.k==='hug';});
if(hr.length&&hr.every(function(r){return seqWait(ctx,r,a,b);}))w*=0.35;
return w;
},
run:function(ctx,a,b){
var ab=R(ctx,a,b),ba=R(ctx,b,a),pf=ctx.pair(a,b);
var heat=(a.flags.aphro||0)+(a.flags.aphroTotal||0)*0.3;
var mutual=(ba.att>28||(b.flags.aphro||0)>=3)&&ba.ten<55&& !(HK.Ties&&HK.tieNoLove(HK.Ties.get(ctx,a,b)));
var wild=a.tr.aggr+a.tr.impulse-a.tr.np+heat/10;
var text,why,cat='romance';
if(mutual&&okSex(a,b)&&(heat>6||ab.att+ba.att>70)){
pf.heatDone=true;pf.night=true;
ctx.mod2(a,b,{att:14,aff:6},{att:12,aff:5});
text=ctx.t(ctx.pick(['{a}の熱い指が{b}の頬に触れた。{b}はその手を払わなかった。','「ごめん、私、もう無理｜すまない、私はもう無理だ｜ごめんなさい、私、もう無理です」{a}が掠れた声で言った。{b}は「…いいよ｜…構わない｜…構いません」とだけ答えて、{a}を引き寄せた。','{b}も同じくらい熱かった。どちらからともなく唇が重なった。','{a}は{b}の首筋に顔を埋めた。{b}の手が、ためらいながら{a}の背中に回った。']),a,b)+(HK.RoomLewd?HK.RoomLewd.scene(ctx,a,b,'aphro'):'――');
why='媚薬の量（'+Math.round(heat)+'）と、'+b.name+'の側の惹かれ（'+Math.round(ba.att)+'）';
var hr=ctx.rules.filter(function(r){return r.k==='h'||r.k==='kiss'||r.k==='hug';});
var hw=hr.filter(function(r){return!bumpAct(ctx,r,a,b,1);});
if(hw.length){text+=waitNote(ctx,hw[0],a,b);why+='／条件の順番：条件1のあとから数える（今のは数えない）';}
if(hr.length&&checkExit(ctx,a,b))return exitPair(ctx,a,b,text,why,true);
return{text:text,why:why,mag:25};
}
if(wild>1.0&&heat>4){
pf.heatDone=true;
var third=ctx.most(ctx.others(a).filter(function(o){return o!==b&& !o.flags.down;}),function(o){return o.tr.np+o.tr.cp*0.5;});
var stop=b.tr.cp*0.6+b.tr.a*0.3+(third?third.tr.np*0.5+third.tr.cp*0.4:0)+ctx.rng()*0.6;
cat='conflict';
var mayForce=okSex(a,b)&&canLead(a,b)&&(!HK.Pos||HK.Pos.order(a,b,[a,b])[0]===a);
var FORCED=null;
if(stop>0.7|| !mayForce|| !FORCED){
ctx.mod2(a,b,{ten:10},{ten:30,trust: -30,aff: -15});
text=ctx.t(HK.Pos&&HK.Pos.hardTop(b,a)?'媚薬に呑まれた{a}が、{b}に掴みかかった。{b}はその手首を掴み返して、壁際まで押し戻した。':'媚薬に呑まれた{a}が、{b}を床に押し倒した。',a,b)+(third&&third.tr.np+third.tr.cp>b.tr.cp?ctx.t('{c}が{a}を引き剥がした。「しっかりしろ！｜＝｜しっかりしてください！」',a,b,third):ctx.t(ctx.pick(['{b}は{a}の肩を突き返した。「目を覚まして｜目を覚ませ｜目を覚ましてください」','{b}は{a}の手首を掴んで止めた。「それは、違う｜＝｜それは、違います」']),a,b));
if(third)ctx.mod(b,third,{trust:15,aff:8});
why=a.name+'の攻撃性・衝動と媚薬（'+Math.round(heat)+'）。'+(third?third.name+'が止めた':b.name+'が拒んだ');
a.flags.shame=true;
}else{
pf.night=true;pf.forced=a.i;
ctx.mod2(a,b,{att:8},{ten:35,trust: -35,att:4});
text=ctx.t(ctx.pick(FORCED),a,b);
why=a.name+'の攻撃性・衝動と媚薬（'+Math.round(heat)+'）。'+b.name+'は止めきれなかった';
}
return{cat:cat,text:text,why:why,mag:30};
}
ctx.mod2(a,b,{att:6},{att:ba.att>15?5:0,ten:ba.att>15?0:6});
return{sex:false,text:ctx.t(ctx.pick(['{a}は熱に浮かされた目で{b}を見つめて、「ねえ｜なあ｜あの」と呼んだ。','{a}は{b}の袖を掴んだまま離さなかった。指先が熱い。','{a}は{b}の肩に額を押しつけて、荒い息を整えようとしていた。','{a}は自分の手を太腿に押しつけて、{b}に触れまいと耐えていた。']),a,b),why:'媚薬が回っている（'+Math.round(heat)+'）'};
}
});
EV.push({
id:'down_care',cat:'help',scope:'pair',
when:function(ctx,a,b){return b.flags.down>0&& !a.flags.down;},
w:function(ctx,a,b){return 1+a.tr.np+R(ctx,a,b).aff/50;},
run:function(ctx,a,b){
ctx.mod2(a,b,{aff:4},{aff:10,trust:12});
return{text:ctx.t(ctx.pick(['{a}は倒れた{b}を横向きに寝かせ、水を少しずつ口に含ませた。','{a}は{b}の頭を自分の膝に乗せて、呼吸が落ち着くのを待った。','{a}「飲みすぎだよ、ばか｜飲みすぎだ、ばか｜ばかですね。飲みすぎです」{a}は{b}の額の汗を拭った。','{a}は{b}の脈を測って、ほっと息をついた。']),a,b),why:a.name+'のNP。'+b.name+'は体力が尽きて倒れている'};
}
});
EV.push({
id:'spicy_after',cat:'solo',scope:'solo',
when:function(ctx,a){return a.flags.belly>0||(a.flags.spicy&&ctx.rng()<0.3);},
w:function(ctx,a){return 1.2+(a.flags.belly||0)*0.4;},
run:function(ctx,a){
var o=ctx.others(a)[0];
if(a.flags.belly>0){
ctx.stress(a,10);a.hp-=4;
if(o)ctx.mod(o,a,{aff:1});
return{text:ctx.t(ctx.pick(['{a}のお腹が、聞いたことのない音を立てた。{a}は部屋の隅の仕切りへ駆け込んだ。','{a}「…ちょっと、向こう向いてて。しばらく｜…しばらく、向こうを向いていろ｜…しばらく、向こうを向いていてください」','{a}は脂汗を浮かべて、お腹を抱えてうずくまった。「辛いのって、二回来るんだ…｜辛いものは、二回来るのか…｜辛いものって、二回来るんですね…」','{a}は仕切りの向こうから「絶対に聞かないで｜絶対に聞くな｜絶対に聞かないでください」と三回言った。','{a}は三度目のトイレから戻って、無言で床に倒れた。']),a),why:'激辛でお腹を壊した（体力 '+ctx.stat(a,'hp')+'）'};
}
return{text:ctx.t(ctx.pick(['{a}の唇はまだ腫れていた。「たらこみたい｜たらこのようだ｜たらこみたいです」と言われて、{a}は口を押さえた。','{a}は「牛乳…牛乳が欲しい…｜＝｜牛乳…牛乳が欲しいです…」と天井に向かって呟いた。','{a}のしゃっくりが止まらない。','{a}は汗が止まらず、シャツの襟をばたばたさせた。']),a),why:'激辛の後遺症'};
}
});
function killRule(ctx){return ctx.rules.filter(function(r){return r.k==='kill';})[0];}
EV.push({
id:'cond_kill',cat:'betray',dk:'kill',scope:'pair',pri:true,
when:function(ctx,a,b){var r=killRule(ctx);return!!r&& !globDone(ctx,r)&&ctx.stepIndex>0&& !a.flags.down&& !b.flags.knocked&&b.alive!==false&&a.stress>40&& !(HK.Attr&&HK.Attr.spare&&HK.Attr.spare(ctx,b,a));},
w:function(ctx,a,b){return Math.max(0.02,a.tr.cold*0.6+a.tr.aggr*0.5-a.tr.np*0.6+a.stress/140-Math.max(0,ctx.R(a,b).aff)/120-0.3);},
run:function(ctx,a,b){
var will=a.tr.cold*0.6+a.tr.aggr*0.5+a.stress/160-a.tr.np*0.5-Math.max(0,ctx.R(a,b).aff)/90;
var safe=HK.SAFE_ON;
if(ctx.rng()>HK.clamp(will,0.05,0.9)){
ctx.stress(a,10);ctx.mod(b,a,{ten:12,trust: -10});
return{mag:20,text:ctx.t(ctx.pick(safe?['{a}は{b}の背後で拳を握りしめた。……けれど、振り下ろせなかった。','{a}は{b}の首筋に手を伸ばしかけて、震える指を引っ込めた。','「……できるわけ、ないだろ｜……できるわけが、ないだろう｜……できるわけ、ありません」{a}は扉の紙を睨んで、床に座り込んだ。']:['{a}は{b}の背後で、割れた照明の破片を握りしめた。……けれど、振り下ろせなかった。','{a}は眠る{b}の首に手をかけて、そのまま動けなくなった。指先が、ひどく冷たかった。','「……できるわけ、ないだろ｜……できるわけが、ないだろう｜……できるわけ、ありません」{a}は扉の紙を握りつぶして、壁に背を預けた。']),a,b),why:a.name+'は条件を満たそうとして、踏みとどまった（優しさ・'+b.name+'への好意）'};
}
if(safe){
b.flags.knocked=true;b.flags.down=999;b.flags.knockedBy=a.i;
ctx.mod(b,a,{aff: -40,ten:40,trust: -50});ctx.others(a).forEach(function(o){if(o!==b)ctx.mod(o,a,{ten:20,trust: -25});});
return{mag:45,text:ctx.t(ctx.pick(['{a}は{b}の背後に回り、首筋を強く打った。{b}は声もなく崩れ落ちた。扉の紙の文字が、一つ消えた。','{a}は{b}の口元に、部屋の隅にあった薬を染み込ませた布を押し当てた。{b}の体から、ゆっくりと力が抜けていった。','揉み合いになった末、{b}は壁に頭を打ちつけて動かなくなった。息はある。{a}は扉の紙を見上げた。']),a,b),why:a.name+'は条件のために、'+b.name+'を気絶させた（ドライさ・攻撃性・焦り）'};
}
ctx.kill(b,a,'部屋の条件のために');
ctx.others(a).forEach(function(o){ctx.mod(o,a,{aff: -40,ten:45,trust: -60});});
return{mag:60,text:ctx.t(ctx.pick(['{a}は{b}の背後に回り、迷いを振り切るように腕に力を込めた。{b}がもがくのをやめたとき、扉の紙の文字が一つ消えた。','{a}は割れた照明の破片を、{b}の胸に突き立てた。{b}は信じられないものを見る目で、{a}を見上げた。','「ごめん｜すまない｜ごめんなさい」――それが、{a}が{b}にかけた最後の言葉だった。']),a,b),why:a.name+'は条件のために、'+b.name+'を手にかけた（ドライさ・攻撃性・焦り）'};
}
});
EV.push({
id:'sacrifice',cat:'help',scope:'pair',pri:true,
when:function(ctx,a,b){return ctx.flags.isOne&&R(ctx,a,b).aff>40&&ctx.stepIndex>0;},
w:function(ctx,a,b){return a.tr.np*1.2+R(ctx,a,b).aff/80-0.5;},
run:function(ctx,a,b){
b.out=true;b.fate='脱出';b.fateNote=a.name+'に背中を押されて一人で出た';
a.fate='残った';a.fateNote=b.name+'を先に出した';
ctx.flags.oneOut=true;
(ctx.flags.exits=ctx.flags.exits||[]).push({a:b.i,b:a.i,label:ctx.label,how:'sacrifice'});
ctx.mod2(a,b,{aff:10},{aff:25,trust:25,att:10});
var tx=ctx.t(ctx.pick(['{a}は{b}を扉の前へ押しやった。「先に行って｜先に行け｜先に行ってください」','{a}は{b}の背中を叩いた。「あなたが出て。私はいい｜あなたが出ろ。私はいい｜あなたが出てください。私はいいです」{a}は笑っていた。','「私、待ってるから｜私は、待っている｜私、待っています」と{a}は言った。それが嘘だと、{b}にも分かっていた。']),a,b);
doorOpen(ctx,{g:[a,b],why:'一人しか出られない部屋。'+a.name+'が'+b.name+'を先に出した'});
return{mag:45,text:tx,why:a.name+'のNP（'+Math.round(a.eg.NP)+'）と'+b.name+'への好意（'+Math.round(R(ctx,a,b).aff)+'）'};
}
});
EV.push({
id:'grab',cat:'betray',scope:'pair',pri:true,
when:function(ctx,a){return ctx.flags.isOne&&a.stress>30;},
w:function(ctx,a){return Math.max(0.01+a.stress/1200,a.tr.cold*0.7+a.tr.aggr*0.5-a.tr.np*0.4-a.tr.ac*0.25-0.3);},
run:function(ctx,a,b){
a.out=true;a.fate='脱出';a.fateNote='一人で部屋を出た';
ctx.flags.oneOut=true;
(ctx.flags.exits=ctx.flags.exits||[]).push({a:a.i,b:b.i,label:ctx.label,how:'grab'});
ctx.others(a).forEach(function(o){ctx.mod(o,a,{aff: -30,ten:35,trust: -40});});
var tx=ctx.t(ctx.pick(['{b}が目を離した隙に、{a}は一人で扉に手をかけた。振り返らなかった。','{a}は{b}の手を振りほどいて、扉に手をかけた。','眠ったふりをしていた{a}は、皆が寝静まるのを待って、扉に手をかけた。']),a,b);
doorOpen(ctx,{g:[a,b],why:'一人しか出られない部屋。'+a.name+'が一人で出た'});
return{mag:45,text:tx,why:a.name+'のドライさ（A高・NP低）と攻撃性。焦り '+Math.round(a.stress)};
}
});
EV.push({
id:'inspect',cat:'escape',scope:'solo',
w:function(ctx,a){return 0.3+a.tr.a*0.9+(a.goal.id==='noway'?0.6:0);},
run:function(ctx,a){
ctx.stress(a,a.tr.a>0.6? -4:6);
return{text:ctx.t(ctx.pick(['{a}は壁を一枚ずつ叩いて回った。どこにも継ぎ目はない。','{a}は扉の紙を何度も読み返した。抜け道になりそうな言い回しは見つからない。','{a}は天井の照明を見上げて、何か仕掛けがないか考えていた。','{a}は床に這いつくばって、扉の下の隙間に指を入れようとした。','{a}は部屋の歩数を数えた。縦十二歩、横九歩。','{a}は換気口の格子に耳を当てて、外の音を探した。']),a),why:a.name+'のA（'+Math.round(a.eg.A)+'）'};
}
});
EV.push({
id:'panic',cat:'solo',scope:'solo',
when:function(ctx,a){return a.stress>45;},
w:function(ctx,a){return a.tr.ac*0.6+a.tr.impulse*0.4;},
run:function(ctx,a){
ctx.others(a).forEach(function(o){ctx.stress(o,4);});
return{text:ctx.t(ctx.pick(['{a}が扉を拳で叩いた。返事はない。','{a}は「出して｜出せ｜出してください」と叫んで、扉にもたれたまま座り込んだ。','{a}は壁に爪を立てた。白い壁に、薄く線が残った。','{a}は自分の腕を抱いて、浅い呼吸を繰り返していた。']),a),why:'焦り（'+Math.round(a.stress)+'）と'+a.name+'の衝動性'};
}
});
EV.push({
id:'discuss',cat:'bond',scope:'pair',
w:function(ctx,a){return 0.4+a.tr.a*0.4+a.tr.honesty*0.3;},
run:function(ctx,a,b){
if(b.tr.cp>0.65&&ctx.flags.romantic){
ctx.mod2(a,b,{ten:6,trust:2},{ten:8});
return{text:ctx.t(ctx.pick(['{a}が条件の話を切り出すと、{b}は「ふざけてる｜ふざけている｜ふざけています」と吐き捨てた。','{b}は紙を指で弾いた。「私はこんなものに従う気はない｜＝｜私はこんなものに従う気はありません」','「話し合う余地なんてある？｜話し合う余地なんかあるか｜話し合う余地なんてありますか」{b}は{a}の言葉を遮った。']),a,b),why:b.name+'のCP（'+Math.round(b.eg.CP)+'）：理不尽なルールへの反発'};
}
ctx.mod2(a,b,{trust:7,att:ctx.flags.romantic?3:0},{trust:7,att:ctx.flags.romantic?3:0});
return{text:ctx.t(ctx.pick(['{a}と{b}は、紙の条件について真面目に話し合った。話すほど、相手の考え方が見えてきた。','{a}と{b}は、条件の文言を一語ずつ分解して検討した。','「もし出られなかったら、どうする？｜もし出られなかったら、どうする｜もし出られなかったら、どうしますか」{a}の問いに、{b}は長いこと考えてから答えた。','{a}は{b}に、どこまでなら平気かを率直に訊いた。{b}も率直に答えた。']),a,b),why:a.name+'のA（状況を言語化する）'};
}
});
EV.push({
id:'consent',cat:'help',scope:'pair',
when:function(ctx,a,b){return ctx.flags.romantic&& !HK.ngPair(a,b)&&R(ctx,a,b).att>20;},
w:function(ctx,a){return a.tr.np*1.2+(a.goal.id==='respect'?0.8:0);},
run:function(ctx,a,b){
ctx.mod2(a,b,{trust:5},{trust:14,aff:8,att:5});
ctx.stress(b,-10);
return{text:ctx.t(ctx.pick(['「嫌なら、私は他の方法を探す。時間はある｜＝｜嫌なら、私は他の方法を探します。時間はあります」{a}は{b}にそう言った。','{a}は{b}の正面に座って、目線を合わせた。「どっちでもいい。決めるのはあなた｜どちらでもいい。決めるのはあなただ｜どちらでも構いません。決めるのはあなたです」','{a}は「止めてほしくなったら、肩を叩いて｜止めてほしくなったら、肩を叩け｜止めてほしくなったら、肩を叩いてください」と合図を決めた。','{a}は{b}が落ち着くまで、何も急かさなかった。']),a,b),why:a.name+'のNP（'+Math.round(a.eg.NP)+'）：相手の意思を先に確かめる'};
}
});
EV.push({
id:'push',cat:'conflict',scope:'pair',
when:function(ctx,a,b){return hasPairRule(ctx)&&a.stress>35&& !(HK.ngPair(a,b)&&ctx.rules.some(function(r){return K[r.k].type==='act'||r.k==='love';}));},
w:function(ctx,a){return a.tr.lead*0.6+(a.goal.id==='quick'?0.8:0);},
run:function(ctx,a,b){
if(R(ctx,b,a).att>35){
ctx.mod2(a,b,{att:5},{att:6,trust:2});
return{cat:'romance',text:ctx.t(ctx.pick(['{a}が「さっさと済ませよう｜＝｜さっさと済ませましょう」と言った。{b}は反論しなかった。むしろ少し、待っていたような顔をした。','「いい加減、決めよう｜＝｜いい加減、決めましょう」{a}の言葉に、{b}は小さく頷いた。']),a,b),why:a.name+'の主導性と、'+b.name+'の側の惹かれ'};
}
ctx.mod2(a,b,{ten:6},{ten:16,trust: -12,aff: -6});
return{text:ctx.t(ctx.pick(['{a}が条件を満たそうと詰め寄った。{b}は壁際まで下がって首を振った。','「いつまでこうしてる気だ｜いつまでこうしている気だ｜いつまでこうしているつもりですか」{a}の苛立った声に、{b}は耳を塞いだ。','{a}は{b}の腕を掴みかけて、振り払われた。']),a,b),why:a.name+'の焦り（'+Math.round(a.stress)+'）。'+b.name+'はまだその気がない'};
}
});
EV.push({
id:'close',cat:'romance',scope:'pair',
when:function(ctx){return ctx.flags.romantic;},
w:function(ctx,a,b){return 0.35+R(ctx,a,b).att/70+a.stress/150;},
run:function(ctx,a,b){
ctx.mod2(a,b,{att:6,trust:3},{att:6,trust:3});
return{text:ctx.t(ctx.pick(['狭い部屋で、{a}と{b}の肩が触れ合う距離に座っていた。どちらも離れなかった。','照明が落ちた数分間、{a}は{b}の呼吸の音だけを聞いていた。','{a}は{b}の横顔を盗み見た。意識しないようにするほど、意識した。','{a}が身じろぎするたびに、{b}の膝に膝が当たった。','{b}の髪から、知らないシャンプーの匂いがした。{a}はそれを知ってしまったことを後悔した。','{a}と{b}は背中合わせに座っていた。背中越しに体温が伝わってくる。']),a,b),why:'逃げ場のない距離。二人の間の相性（化学反応）'};
}
});
EV.push({
id:'resign',cat:'solo',scope:'solo',
when:function(ctx,a){return a.stress>50&& !a.flags.resign&& !ctx.flags.isOne&&hasPairRule(ctx);},
w:function(ctx,a){return 0.6+a.tr.a*0.4;},
run:function(ctx,a){
a.flags.resign=true;
return{text:ctx.t(ctx.pick(['{a}は長いため息をついた。「……わかった。ここで終わるよりはいい｜＝｜……わかりました。ここで終わるよりはいいです」','{a}は紙を見つめたまま、静かに覚悟を決めた顔になった。','「もう、いい｜＝｜もう、いいです」{a}は呟いた。何を諦めたのかは言わなかった。']),a),why:'焦りが限界を越えた。'+a.name+'の覚悟が決まった'};
}
});
HK.SCENARIOS.whiteroom=scen;
if(HK.SCEN_ORDER.indexOf('whiteroom')<0)HK.SCEN_ORDER.splice(1,0,'whiteroom');
HK.RoomAPI={K:K,EV:EV,scen:scen,prog:prog,ruleDone:ruleDone,seqWait:seqWait,seqFlush:seqFlush,bumpAct:bumpAct,waitNote:waitNote,pairDone:pairDone,leftText:leftText,eager:eager,willing:willing,desperate:desperate,tieWall:tieWall,names:names,hasPairRule:hasPairRule,finishExit:finishExit,exitPair:exitPair,doorOpen:doorOpen,doorFlush:doorFlush,DOOR_LINE:DOOR_LINE,
KLABEL:KLABEL,ITEM:ITEM,ACT_TEXT:ACT_TEXT,addKind:addKind,noteN:noteN,isGlob:isGlob,globLeft:globLeft,globDone:globDone,checkExit:checkExit,exitAll:exitAll,oneDoor:oneDoor,allOut:allOut,bringAlong:bringAlong,lastOf:lastOf,okSex:okSex,exclOther:exclOther,cntTag:cntTag};
})();
});
;
/* ==== js/room-reluct.js ==== */
HK.Load.def(71,'js/room-reluct.js',function(){
(function(){
'use strict';
var HK=window.HK,API=HK.RoomAPI;
if(!API)return;
var K=API.K,EV=API.EV;
function L(s){return s.split('|');}
function couple(ctx,a,b){
var t=HK.Ties?HK.Ties.get(ctx,a,b):null;
return!!(t&&HK.TIES[t.type]&&HK.TIES[t.type].couple);
}
function hRule(ctx,a,b){return ctx.rules.some(function(r){return r.k==='h'&& !API.ruleDone(ctx,r,a,b);});}
function toneKey(c){var t=HK.toneOf?HK.toneOf(c):c.tone;return REFUSE[t]?t:(HK.personaOf?HK.personaOf(c):'gentle');}
function score(ctx,c){
var x=c.tr,t=toneKey(c);
var s=x.cp*0.45+x.ac*0.35+(x.caution||0)*0.3+(1-x.fc)*0.2-(x.impulse||0)*0.3-(API.eager?API.eager(ctx,c):0.4)*0.4;
s+=(HK.toneOpt&&HK.toneOpt(t,'reluct'))||0;
if(ctx.present().length>=3)s+=0.3;
s-=(c.flags.aphro||0)*0.06;
return s;
}
function st(ctx,a,b){
var p=API.prog(ctx,a,b);
if(p.shibu===undefined){
p.shibu=null;
if(couple(ctx,a,b)&&hRule(ctx,a,b)){
var sa=score(ctx,a),sb=score(ctx,b),w=sa>=sb?a:b,sv=Math.max(sa,sb);
if(sv+ctx.rng()*0.25>0.7)p.shibu={who:w.i,left:Math.round(30+sv*60),done:false,tries:0,sc:sv};
}
}
return p.shibu;
}
HK.RoomReluct={
blocks:function(ctx,a,b){
var s=st(ctx,a,b);
if(!s||s.done)return false;
var w=a.i===s.who?a:b;
return!(w.flags.resign&&w.stress>85);
}
};
var REFUSE={
proud:L('はあ!? こんなとこで、できるわけねえだろ|ふざけんな。どっかで見られてるかもしれねえんだぞ|……おい、本気で言ってんのか。こんな、何もねえ部屋で'),
stern:L('……ならん。このような場所で、軽々しく肌を晒すわけにはいかない|けじめというものがある。こんな得体の知れない部屋で、できるものか|誰が見ているかも分からないのだぞ。断る'),
tsun:L('む、無理無理！ こんなとこで、できるわけないでしょ！|ば、ばかじゃないの!? どこかにカメラとかあったらどうすんのよ|べ、別にあんたが嫌なわけじゃ……ないけど。ここは、無理'),
tsun_n:L('む、無理だ！ こんなとこで、できるわけない|ば、ばかか!? どこかにカメラがあったらどうする|べ、別にお前が嫌なわけじゃ……ない。ただ、ここは無理だ'),
gentle:L('ごめんね……こういうのは、ちゃんとしたところがいいな|……誰かに見られてる気がして、落ち着かないの|あなたとが嫌なんじゃないの。ただ、ここだと……'),
gentle_n:L('ごめん……こういうのは、ちゃんとした場所がいい|……誰かに見られてる気がして、落ち着かない|お前とが嫌なんじゃない。ただ、ここだと……'),
devoted:L('ご、ごめんなさい……あなたとなら、って思うんです。でも、ここは……|……せめて、二人きりだって分かるところが、いいです|お願いです、もう少しだけ……心の準備を、させてください'),
devoted_p:L('ご、ごめん……あなたとなら、って思うよ。でも、ここは……|……せめて、二人きりだって分かるところがいい|お願い、もう少しだけ……心の準備、させて'),
cool:L('……監視されている可能性を否定できない。この状況でするのは、合理的じゃない|条件を満たす以外の出口が、まだあるかもしれない。結論を急ぐな|……誰かの思惑どおりに動くのは、気に入らない'),
calm:L('……ここでは、したくない|落ち着け。……他の方法を、先に探そう|……誰かに見られている気がする。今は、やめておく'),
free:L('えー、ここで!? ちょっと、さすがに雰囲気なさすぎじゃない？|待って待って、どっかで見られてたら恥ずかしすぎるって！|せめてベッドくらい欲しいんだけど！'),
shy:L('む、無理……っ、こ、こんなところで、なんて……|だ、だって……み、見られてたら、どうするの……|ご、ごめんなさい……は、恥ずかしくて、死んじゃう……'),
polite:L('……申し訳ありません。このような場所で、というのは……どうしても|誰に見られているかも分からないところで、肌を晒すなど……|せめて、もう少し落ち着ける場所であれば……'),
aniki:L('……悪い。こういうのは、ちゃんと大事にしたいんだよ|こんな見世物みたいな真似、お前にさせたくねえ|ここでってのは、ちょっとな……他の手を探そうぜ'),
noja:L('な、何を言うておる！ こんなところで、できるわけがなかろう|誰に見られておるか分からぬのじゃぞ……恥ずかしいにも程がある|おぬしが嫌なのではない。……ここが、嫌なのじゃ'),
mukuchi:L('……ここは、いや|……見られてる、かも|……あとで'),
mixed:L('いや、ここではちょっと……無理ですって。恥ずかしいじゃん|誰かに見られてたら、どうするんですか。……ほんとに、やだ|あなたが嫌なわけじゃないんです。ここが嫌なだけ'),
kansai:L('いやいや、ここで!? 無理やって、さすがに|どっかで見られてたらどないすんの……恥ずかしすぎるわ|あんたが嫌なんちゃうよ？ ここが嫌なだけ'),
cool_soft:L('……ここでは、したくないな|見られてるかもしれないよ。ほかの方法、先に探そう|あなたが嫌なんじゃない。場所が嫌なだけ'),
darui_lite:L('……ここで？ むり。落ち着かないし|見られてたら、めんどいことになるし|……あとで。ここじゃなくて'),
boku_n:L('ごめん……こういうのは、ちゃんとした場所がいいな|誰かに見られてる気がして、落ち着かないんだ|あなたが嫌なんじゃないよ。ただ、ここだと……'),
god:L('ならぬ。かような場で、肌を晒せと申すか|何者かが覗いておるやもしれぬ。断る|私を何と心得る。このような場所で、できるものか')
};
var WATCHED=L('{a}は、部屋の隅にいる他の人たちを、ちらりと見た。|{a}は、ほかの人の視線を気にして、{b}から半歩離れた。|{a}は、壁の向こうから聞こえてくる物音に、肩を強張らせた。');
var COAX={
gentle:{f:function(x){return x.np;},t:L('{a}「無理しなくていい。あなたがいいって思えるまで、待つから｜無理はしなくていい。あなたがいいと思えるまで、待つ｜無理しなくていいです。あなたがいいと思えるまで、待ちますから」{a}はそう言って、{b}の手をそっと握った。|{a}は{b}の隣に座り、肩を抱いた。「大丈夫。焦らなくていい｜＝｜大丈夫です。焦らなくていいですよ」|{a}「ここを出たら、ちゃんとしたところで、ゆっくりしよう。……でも、今は二人で出よう｜＝｜ここを出たら、ちゃんとしたところで、ゆっくりしましょう。……でも、今は二人で出ましょう」')},
playful:{f:function(x){return x.fc;},t:L('{a}「誰も見てないって。見てたら、見せつけてやればいいじゃん｜誰も見ていない。見ていたら、見せつけてやればいい｜誰も見ていませんよ。見ていたら、見せつけてやればいいじゃないですか」{a}は笑って、{b}の頬をつついた。|{a}は大げさに部屋を見回した。「はい、カメラなし！ 監視なし！ ……たぶん！」|{a}「じゃあさ、電気消して、布団被ってやれば見えないでしょ？｜では、電気を消して、布団を被ってやれば見えないだろう？｜じゃあ、電気を消して、布団を被ってやれば見えないでしょう？」')},
rough:{f:function(x){return x.aggr*0.6+x.cp*0.4;},t:L('{a}「いいから来い。ここで終わるつもりか｜＝｜いいから来てください。ここで終わるつもりですか」{a}は{b}の腕を掴んで引き寄せた。|{a}は{b}を壁際に追い詰めた。「……私だけ見てろ。他のことは考えるな｜……私だけ見ていろ。他のことは考えるな｜……私だけ見ていてください。他のことは考えないでください」|{a}「出たいんだろ。だったら、腹をくくれ｜出たいのだろう。だったら、腹をくくれ｜出たいんでしょう。だったら、腹をくくってください」')},
tease:{f:function(x){return x.cold*0.5+x.a*0.5;},t:L('{a}「ふうん。家だと、もっと大胆なのにね｜ふうん。家では、もっと大胆だろう｜ふうん。家では、もっと大胆ですよね」{a}の言葉に、{b}は真っ赤になった。|{a}は{b}の耳元で囁いた。「恥ずかしがってる顔、すごくいい。……もっと見たい｜恥ずかしがっている顔、すごくいい。……もっと見たい｜恥ずかしがっている顔、すごくいいです。……もっと見たいです」|{a}「見られてるかもって思うと、興奮する？｜見られているかもしれないと思うと、興奮するか？｜見られているかもしれないと思うと、興奮しますか？」')},
reason:{f:function(x){return x.a;},t:L('{a}「出る方法は、これしか見つからなかった。恥ずかしいのは分かる。でも、ここで餓えるよりいい｜出る方法は、これしか見つからなかった。恥ずかしいのは分かる。だが、ここで餓えるよりはいい｜出る方法は、これしか見つかりませんでした。恥ずかしいのは分かります。でも、ここで餓えるよりいいです」|{a}は部屋の隅々を調べてみせた。「カメラも、覗き穴もない。少なくとも、私が見た限りは｜＝｜カメラも、覗き穴もありません。少なくとも、私が見た限りではそうです」|{a}「条件を満たせば扉は開く。それだけのことだ。……相手が私じゃ、不満？｜条件を満たせば扉は開く。それだけのことだ。……相手が私では、不満か？｜条件を満たせば扉は開きます。それだけのことです。……相手が私では、不満ですか？」')},
clumsy:{f:function(x){return x.ac;},t:L('{a}「お、私も恥ずかしいよ……！ で、でも、一緒なら……｜お、私も恥ずかしい……！ で、でも、一緒なら……｜お、私も恥ずかしいです……！ で、でも、一緒なら……大丈夫です」|{a}は{b}と同じくらい赤くなって、うつむいた。「……ど、どうしよう｜……ど、どうする｜……ど、どうしましょう」|{a}「そ、そうだよね、ここじゃ……ご、ごめん、急かして｜そ、そうだな、ここでは……す、すまない、急かした｜そ、そうですよね、ここでは……す、すみません、急かしてしまいました」')}
};
function coaxStyle(c){
var best='gentle',bv= -1;
for(var k in COAX){var v=COAX[k].f(c.tr)+(k==='rough'&&c.tr.np>0.6? -0.3:0);if(v>bv){bv=v;best=k;}}
return best;
}
var MOVED=L('{b}は黙り込んだ。それから、小さく頷きかけて、また首を振った。|{b}は唇を噛んだ。「……もう少しだけ、待って｜……もう少しだけ、待ってくれ｜……もう少しだけ、待ってください」|{b}の肩の力が、ほんの少しだけ抜けた。|{b}は{a}の胸に額を押しつけた。「……分かってる。分かってるけど｜……分かっている。分かっているが｜……分かっています。分かってはいるんです」');
var BOUNCE=L('{b}は{a}の手を振りほどいた。「だから、ここは嫌だって言ってるだろ｜だから、ここは嫌だと言っているだろう｜だから、ここは嫌だって言っているでしょう」|{b}は壁の方を向いて、膝を抱えてしまった。|{b}「……そういうこと言うから、余計にできなくなるんだよ｜……そういうことを言うから、余計にできなくなるんだ｜……そういうことを言うから、余計にできなくなるんですよ」|{b}はむっとして、部屋の反対側に座り込んだ。');
var YIELD={
proud:L('……っ、分かったよ。そのかわり、こっち見んな|……ちっ。今回だけだからな。二度とねえぞ|……電気、消せ。それが条件だ'),
stern:L('……分かった。お前となら、恥ではない|……覚悟は決めた。手早く済ませろ|……今回だけだ。私にここまでさせたこと、覚えておけ'),
tsun:L('……っ、こ、今回だけだからね！ 勘違いしないでよ|……電気、消して。絶対、こっち見ないでよ|べ、別に、あんたのためじゃなくて……出るためなんだから'),
tsun_n:L('……っ、こ、今回だけだからな！ 勘違いするなよ|……電気、消せ。絶対、こっち見るな|べ、別に、お前のためじゃない……出るためだ'),
gentle:L('……うん。あなたとなら、大丈夫|……優しくしてね。それなら、いいよ|……ふふ、私も、本当はずっと、触れたかったの'),
gentle_n:L('……うん。お前となら、大丈夫|……優しくして。それなら、いい|……本当は、ずっと触れたかった'),
devoted:L('……はい。あなたがそう言ってくれるなら|……ごめんなさい、わがまま言って。もう、大丈夫です|……私も、あなたと一緒に、ここを出たいです'),
devoted_p:L('……うん。あなたがそう言ってくれるなら|……ごめん、わがまま言って。もう、大丈夫|……私も、一緒にここを出たい'),
cool:L('……分かった。他に選択肢がない以上、これが最善だ|……感情的には、まだ納得していない。だが、お前なら|……記録には残らない。そう信じることにする'),
calm:L('……分かった。お前となら、いい|……ゆっくりで、頼む|……もう、迷わない'),
free:L('……もう、しょうがないなあ！ そのかわり、うんと優しくしてよね|……ま、いっか！ 二人だけの秘密ってことで|……えへへ、なんか逆にドキドキしてきた'),
shy:L('……っ、で、電気、消してくれるなら……|……み、見ないでね……絶対、見ないでね……|……あ、あなたとなら……が、がんばる……'),
polite:L('……承知いたしました。あなたとでしたら|……どうか、お手柔らかに、お願いいたします|……はしたないところを、お見せしても……嫌いに、ならないでくださいね'),
aniki:L('……ったく、お前には敵わねえな。来いよ|……分かった。腹、くくるわ|……へへ。ここまで言わせたんだ、責任取れよ'),
noja:L('……し、仕方のないやつじゃ。今回だけじゃぞ|……灯りを消すのじゃ。それなら、許す|……おぬしとなら、まあ、よいか'),
mukuchi:L('……ん|……いい|……優しく、して'),
mixed:L('……もう、しょうがないですね。今回だけだよ|……電気、消してください。それなら、いいよ|……あなたとなら、まあ、いっか'),
kansai:L('……もう、しゃあないなあ。今回だけやで|……電気消してな。それやったら、ええよ|……あんたとやったら、まあ、ええか'),
cool_soft:L('……分かった。あなたとなら、いいよ|……ゆっくりで、お願い|……今回だけ、ね'),
darui_lite:L('……はあ。わかった。今回だけ|……電気、消して。それなら|……まあ、あなたとなら。いいけど'),
boku_n:L('……うん。あなたとなら、大丈夫|……優しくしてくれるなら、いいよ|……本当は、ずっと触れたかったんだ'),
god:L('……よかろう。此度だけ、許す|……灯りを消せ。それが条件だ|……あなたゆえ、許すのだ。勘違いするでないぞ')
};
(function(){
var V=HK.Voice,FIX=V?(V.TONE_FIX=V.TONE_FIX||{}):null;
if(!FIX)return;
['cool_soft','darui_lite','boku_n','god'].forEach(function(t){
var F=FIX[t]=FIX[t]||{};
REFUSE[t].concat(YIELD[t]).forEach(function(x){if(F[x]==null)F[x]=x;});
});
})();
HK.addTo(EV,{
id:'notHere',cat:'romance',scope:'pair',pri:true,
when:function(ctx,a,b){
if(a.flags.down||b.flags.down|| !HK.canLove(a,b))return false;
var s=st(ctx,a,b);
return!!(s&& !s.done&&hRule(ctx,a,b));
},
w:function(ctx,a,b){var s=st(ctx,a,b);return 2.4+(s.tries?0.4:1.2)+(a.i!==s.who?0.6:0);},
run:function(ctx,a,b){
var s=st(ctx,a,b),w=a.i===s.who?a:b,o=w===a?b:a;
var tk=toneKey(w),first= !s.tries;
s.tries++;
var text='',why;
if(first){
text=(ctx.present().length>=3?ctx.t(ctx.pick(WATCHED),w,o):'')+ctx.t('{b}が条件の紙を指さすと、{a}は首を横に振った。',w,o)+w.name+'「'+ctx.pick(REFUSE[tk])+'」';
}
var sty=coaxStyle(o),R=ctx.R(w,o);
var push=12+R.trust/5+R.att/8+(sty==='gentle'?8:sty==='rough'?(w.tr.ac>0.6?14: -4):sty==='tease'?(w.tr.cp>0.6? -6:10):4)+w.stress/6+ctx.rng()*12-s.sc*10;
var hit=push>14;
text+=ctx.t(ctx.pick(COAX[sty].t),o,w);
if(hit)s.left-=push;else s.left-=4;
if(s.left<=0||(w.flags.resign&&w.stress>70)){
s.done=true;
text+=ctx.t('{a}は長いこと黙っていた。やがて、{b}の袖をそっと掴んだ。',w,o)+w.name+'「'+ctx.pick(YIELD[tk])+'」';
ctx.mod2(w,o,{trust:8,att:6},{trust:4,att:6,aff:4});
why=w.name+'は折れた。'+o.name+'の説得（'+{gentle:'待つ',playful:'茶化す',rough:'押し切る',tease:'からかう',reason:'理屈で説く',clumsy:'一緒に慌てる'}[sty]+'）と、焦り（'+Math.round(w.stress)+'）';
return{text:text,why:why,mag:16};
}
text+=ctx.t(ctx.pick(hit?MOVED:BOUNCE),o,w);
if(hit)ctx.mod2(w,o,{trust:3,att:2},{trust:1});else{ctx.mod2(w,o,{ten:5},{ten:3});ctx.stress(o,4);}
ctx.stress(w,3);
why='恋人どうしでも、'+w.name+'は場所を嫌がって渋った（CP・AC・慎重さ'+(ctx.present().length>=3?'・人目':'')+'）。'+o.name+'の説得は'+(hit?'少し届いた':'逆効果だった');
return{text:text,why:why,mag:first?14:8};
}
});
})();
});
;
/* ==== js/room-trio-lines.js ==== */
HK.Load.def(72,'js/room-trio-lines.js',function(){
(function(){
'use strict';
var HK=window.HK;
function L(s){return s.split('|');}
var X=HK.TrioLines={};
X.ROUND2=L('三人は、もう一度身を寄せ合った。今度は、誰も照れなかった。|二回目は、一回目より自然だった。三人は、もう誰が先に触れるかで迷わなかった。|休憩もそこそこに、{x}がまた二人の手を引いた。|三人は水を回し飲みしてから、また互いに手を伸ばした。|{h}が「もう一回｜もう一回だ｜もう一回しましょう」と言った。言い終わる前に、{x}と{y}の手が伸びてきた。|二回目は、一回目とは違う組み合わせから始まった。三人は、もう形にこだわらなかった。');
X.OPEN={
auto:L('{x}と{y}の視線が、同時に{h}に向いた。三人は紙の但し書きを読み返して、顔を見合わせた。{h}「……三人でなら、一回で済む｜＝｜……三人でなら、一回で済みます」――誰も、反対しなかった。|{x}が{h}の隣に座り、少し遅れて{y}が反対側に座った。{h}は両側の体温に挟まれて、小さく息を吐いた。{h}「……分かった。三人で｜……分かった。三人でだ｜……分かりました。三人でしましょう」|白い部屋に、長い沈黙が続いた。それを破ったのは{y}だった。{y}「誰か一人を選ぶとか、もう、やめよう｜誰か一人を選ぶのは、もう、やめよう｜誰か一人を選ぶとか、もう、やめましょう」{x}が頷き、{h}が二人の手を取った。|{h}は扉の紙を指でなぞって、但し書きの一文で止めた。{h}「ここ。……三人なら、全員で出られる｜ここだ。……三人なら、全員で出られる｜ここです。……三人なら、全員で出られます」{x}と{y}は顔を見合わせ、それから{h}を見た。|{h}はベッドの真ん中に座って、両側を軽く叩いた。{h}「二人とも、来て｜二人とも、来い｜二人とも、来てください」{x}と{y}は一瞬ためらって、それから同時に動いた。|三人で閉じ込められて、何時間も経っていた。誰と誰が、という線引きは、もうどうでもよくなっていた。{x}が{h}の手を取り、{y}がその上に手を重ねた。|{y}「三人で、っていうのは……」言いかけた{y}の言葉を、{x}が引き取った。{x}「あり、だと思う｜＝｜あり、だと思います」――{h}は少し笑って、頷いた。|三人は紙の但し書きを、何度も読んだ。{h}「誰か一人を置いていくのは、嫌｜誰か一人を置いていくのは、嫌だ｜誰か一人を置いていくのは、嫌です」――それが答えだった。'),
join:L('{x}と{y}が先に始めていた。{h}は壁際で背を向けていたが、二人の声は耳を塞いでも届いた。やがて{h}は立ち上がった。|{x}と{y}の体が重なるのを、{h}は部屋の隅から見ていた。見ているうちに、{h}の息も上がっていた。{y}が気づいて、黙って手を差し伸べた。|二人が終わりかけたとき、{h}がベッドの端に座った。{h}「……私も、数えてもらえる？｜……私も、数えてもらえるか？｜……私も、数えてもらえますか？」{x}は笑って、{h}の手を引いた。|{x}は{y}を抱きながら、部屋の隅の{h}に目をやった。{x}「{h}も、こっち｜{h}も、こっちへ来い｜{h}も、こっちへ来てください」――{h}は少し迷ってから、服のボタンに手をかけた。'),
aphro:L('媚薬の熱は、三人全員に回っていた。誰が最初に手を伸ばしたのかは、もう誰も覚えていない。|{h}の呼吸が浅く、肌は熱を帯びていた。{x}と{y}も同じだった。三人の視線が絡まった瞬間、理性の糸が同時に切れた。|{h}「もう、無理……｜もう、無理だ……｜もう、無理です……」媚薬に浮かされた{h}の声に、{x}と{y}は同時に動いた。止める者は、この部屋にはいなかった。|媚薬の甘い匂いが、白い部屋を満たしていた。三人は言葉もなく、熱に押されるように身を寄せた。正気は、どこにも残っていなかった。')
};
X.fill=function(s,r){
return String(s).replace(/\{([a-z])\}/g,function(m,k){return r[k]?r[k].name:m;});
};
})();
});
;
/* ==== js/room-trio.js ==== */
HK.Load.def(73,'js/room-trio.js',function(){
(function(){
'use strict';
var HK=window.HK,A=HK.RoomAPI;
if(!A)return;
var K=A.K,EV=A.EV,scen=A.scen;
var T=HK.RoomTrio={};
function R(ctx,a,b){return ctx.R(a,b);}
function L(s){return s.split('|');}
function kn(n){return['','一人','二人','三人','四人','五人','六人'][n]||n+'人';}
scen.env.splice(4,0,{id:'multi',label:'三人以上で一緒に満たす',type:'select',def:'open',options:[
{v:'open',label:'最初から紙に書いてある'},
{v:'note',label:'扉の紙の裏に但し書きがある（見つけたら使える）'},
{v:'no',label:'認めない（二人ずつだけ）'}
],desc:'「三人以上で同時にした場合、全員がそれぞれ満たしたものとみなす」。回数が一回でも、三人の場面一度で全員分が数えられます。三人ちょうどでエッチか媚薬の部屋なら、受けに回れる人が一人でもいれば三人の場面（3P）が起こります'});
function multiOf(ctx){return ctx.env.multi||'open';}
function allowed(ctx){return multiOf(ctx)!=='no'&& !ctx.flags.isOne&& !ctx.flags.trioRule&&A.hasPairRule(ctx);}
function isF(c){var P=HK.Pos;return!!(P&&P.isF(c));}
function hardTop(c){var P=HK.Pos;return!!(c&&P&&P.hardTop(c));}
function canBottom(c){var P=HK.Pos;return!P||P.canBottom(c);}
function bothRiba(a,b){var P=HK.Pos;if(!P)return false;if(P.bothRiba)return P.bothRiba(a,b);return P.of(a)==='riba'&&P.of(b)==='riba';}
function jealVal(ctx,c,o){
var v=(c.tr.jealous||0);
if(HK.Obsess&&HK.Obsess.yanTie&&HK.Obsess.yanTie(ctx,c,o))v+=0.5;
else if(HK.Ties&&HK.Ties.has&&HK.Ties.has(ctx,c,o,'yan'))v+=0.5;
if(c.flags.excl&&(c.flags.partner===o.i))v+=0.4;
if(HK.Obsess&&HK.Obsess.level&&HK.Obsess.level(ctx,c,o)>=35)v+=0.35;
if((ctx.pair(c,o).jealous||0)>0)v+=0.1;
if(HK.Obsess&&HK.Obsess.noTie&&HK.Obsess.noTie(ctx,c,o))v=0;
return v;
}
function isJealous(ctx,c,o){return jealVal(ctx,c,o)>=0.62;}
function jealShape(ctx,pr,o){
var js=pr.filter(function(c){return isJealous(ctx,c,o);});
if(!js.length)return{jeal:'none'};
if(js.length===2){var a=jealVal(ctx,pr[0],o)>=jealVal(ctx,pr[1],o)?pr[0]:pr[1];return{jeal:'both',j:a,o:pr[0]===a?pr[1]:pr[0]};}
return{jeal:'one',j:js[0],o:pr[0]===js[0]?pr[1]:pr[0]};
}
function openVal(ctx,c){
var t=c.tr;
return t.fc*0.45+(t.impulse||0)*0.3+(ctx.stat(c,'exp')-3)*0.07+(c.flags.aphro||0)*0.04-t.ac*0.5-t.cp*0.2-(t.caution||0)*0.1;
}
function openOf(ctx,c){var v=openVal(ctx,c);return v>=0.28?'open':v<=0.02?'shy':'mid';}
var OPEN_LABEL={open:'開放的',mid:'ふつう',shy:'照れ屋'},JEAL_LABEL={none:'なし',one:'片方',both:'両方'},SHAPE_LABEL={oneTwo:'攻め×受け・受け',twoOne:'攻め・攻め×受け',sandwich:'サンドイッチ',ring:'輪'};
T.jealVal=jealVal;T.openOf=openOf;
function pairRules(ctx){return ctx.rules.filter(function(r){var t=K[r.k].type;return t==='act'||t==='word';});}
function maxLvl(ctx){return ctx.rules.reduce(function(m,r){return K[r.k].type==='act'?Math.max(m,K[r.k].lvl):m;},2);}
function hasH(ctx){return ctx.rules.some(function(r){return r.k==='h';});}
function free(c){return c&&c.alive!==false&& !c.out&& !c.flags.down&&c.flags.cagePair==null;}
function pairsOf(g){var o=[];for(var i=0;i<g.length;i++)for(var j=i+1;j<g.length;j++)o.push([g[i],g[j]]);return o;}
function done3(ctx,g){return pairsOf(g).every(function(p){return A.pairDone(ctx,p[0],p[1]);});}
function family(ctx,a,b){return A.tieWall(ctx,a,b,3)>=999;}
function okSex(a,b){return(!HK.Pos||(HK.Pos.okSex(a,b)&&(!HK.Pos.libOK||HK.Pos.libOK([a,b]))))&& !(HK.roomWsNoSex&&HK.roomWsNoSex(HK._curCtx,a,b));}
function loveTie(ctx,a,b){var T0=HK.Ties;return ctx.pair(a,b).couple|| !!(T0&&T0.has&&(T0.has(ctx,a,b,'lover')||T0.has(ctx,a,b,'mate')||T0.has(ctx,a,b,'fated')));}
function hubTie(ctx,a,b){var T0=HK.Ties;return loveTie(ctx,a,b)|| !!(T0&&T0.has&&T0.has(ctx,a,b,'almost'));}
function friendTie(ctx,a,b){
var T0=HK.Ties,t=T0&&T0.get?T0.get(ctx,a,b):null;
if(!t|| !/^(best|friend|childhood|buddy|colleague|senpai|almost|lover|mate|fated)$/.test(t.type))return false;
return R(ctx,a,b).ten<50&&R(ctx,b,a).ten<50;
}
function harmonyOf(ctx,g){
if(!g||g.length!==3)return null;
var ngH=HK.ngPairHard||HK.ngPair;
if(pairsOf(g).some(function(p){return ngH&&ngH(p[0],p[1]);}))return null;
if(pairsOf(g).every(function(p){return loveTie(ctx,p[0],p[1]);}))return{full:true};
for(var i=0;i<3;i++){
var h=g[i],o=g.filter(function(c){return c!==h;});
if(hubTie(ctx,h,o[0])&&hubTie(ctx,h,o[1])&&friendTie(ctx,o[0],o[1]))return{full:false,hub:h};
}
return null;
}
function harmony(ctx,g){return!!harmonyOf(ctx,g);}
function obsessed(ctx,c,o){
var O=HK.Obsess;
if(!O||(O.noTie&&O.noTie(ctx,c,o)))return false;
return!!(O.yanTie&&O.yanTie(ctx,c,o))||(O.level?O.level(ctx,c,o):0)>=35;
}
function clashOf(ctx,g){
var hm=harmonyOf(ctx,g);
if(!hm)return null;
var cs=hm.full?g:[hm.hub];
for(var i=0;i<cs.length;i++){
var w=cs[i],o=g.filter(function(c){return c!==w;});
if(obsessed(ctx,o[0],w)&&obsessed(ctx,o[1],w))return{w:w,pr:o};
}
return null;
}
function loveKind(ctx,g){var hm=harmonyOf(ctx,g);return!hm?null:clashOf(ctx,g)?'loveclash':hm.full?'love':'lovehub';}
function isLove(kind){return kind==='love'||kind==='lovehub';}
function isLoveAny(kind){return isLove(kind)||kind==='loveclash';}
function wsOk(x,y){return!(HK.roomWsNoSex&&HK.roomWsNoSex(HK._curCtx,x,y));}
function plan3(g){
var P=HK.Pos;
if(!g||g.length!==3|| !P)return null;
var pl;
if(!HK.SAFE_ON&&P.trioPlan)pl=P.trioPlan(g[0],g[1],g[2],{ok:wsOk});
else{
if(P.trioOptOut&&g.some(P.trioOptOut))return null;
var all=pairsOf(g),prs=all.filter(function(p){return okSex(p[0],p[1]);});
if(prs.length===3)pl={pairs:prs,hub:null,all:true,watch:[]};
else if(prs.length===2)pl={pairs:prs,hub:g.filter(function(x){return prs[0].indexOf(x)>=0&&prs[1].indexOf(x)>=0;})[0],all:false,watch:all.filter(function(p){return prs.indexOf(p)<0;})};
else pl=null;
}
if(pl&&pl.watch.some(function(p){return(HK.ngExplicit&&HK.ngExplicit(p[0],p[1]))||p[0].noR18||p[1].noR18;}))return null;
return pl;
}
T.plan3=plan3;
T.shape=function(ctx,g,hubOnly){return shape(ctx,g,hubOnly);};
T.touchOK=function(l,rr,g,apart){return touchOK(l,rr,g,apart);};
T.apartOf=function(g){return apartOf(g);};
function loveShape(ctx,g){
var hm=harmonyOf(ctx,g),cl=hm&&clashOf(ctx,g);
if(!hm||(hm.full&& !cl))return null;
var h=cl?cl.w:hm.hub,o=g.filter(function(c){return c!==h;});
var pl=plan3(g);
if(!pl||(!pl.all&&pl.hub!==h))return null;
return{sg:[h].concat(o),hubOnly:true,plan:pl};
}
T.harmony=harmony;T.harmonyOf=harmonyOf;
T.sexShape=function(g,hubOnly){return sexShape(g,hubOnly);};
T.okSex=function(a,b){return okSex(a,b);};
T.family=function(ctx,a,b){return family(ctx,a,b);};
T.loveTie=function(ctx,a,b){return loveTie(ctx,a,b);};
T.canBottom=function(c){return canBottom(c);};
function sexShape(g,hubOnly){
var pl=plan3(g);
if(!pl)return null;
if(pl.all&& !hubOnly)return{sg:g,hubOnly:false,plan:pl};
var h=pl.all?g[0]:pl.hub;
return{sg:[h].concat(g.filter(function(c){return c!==h;})),hubOnly:true,plan:pl};
}
function shapeFor(ctx,g,kind){
if(kind==='lovehub'||kind==='loveclash')return loveShape(ctx,g);
var x=g[1],y=g[2];
var hub=kind==='hub'||(kind==='invite'&& !(HK.canLove(x,y)&&HK.canLove(y,x)&&R(ctx,x,y).att>10));
var sp=sexShape(g,hub);
if(sp&&sp.hubOnly&&sp.sg[0]!==g[0]&&(kind==='hub'||kind==='invite'))return null;
return sp;
}
var setup0=scen.setup,phase0=scen.phase,finish0=scen.finish;
scen.setup=function(ctx){
setup0(ctx);
ctx.flags.multiKnown=multiOf(ctx)==='open';
ctx.flags.trios=[];ctx.flags.trioHL={};
ctx.flags.trioRoll=null;
};
scen.phase=function(ctx,s,n){
phase0(ctx,s,n);
if(s===0&&ctx.flags.multiKnown&&allowed(ctx)&&ctx.present().length>=3)
ctx.say({text:'紙の一番下には、小さな字で但し書きがあった。「\u2060※三人以上で同時に行った場合、参加者全員がそれぞれ条件を満たしたものとみなす」'});
};
var FIND=L('{a}は扉の紙を何度も読み返しているうちに、裏面に小さな字の但し書きがあることに気づいた。「\u2060※三人以上で同時に行った場合、参加者全員がそれぞれ条件を満たしたものとみなす」|{a}は紙を照明に透かして、裏に印刷された一文を読み上げた。「\u2060三人以上で同時に行った場合、参加者全員が条件を満たしたものとみなす……だって」|{a}が紙の端をめくると、折り込まれていた部分に続きがあった。「\u2060※複数人での同時達成も可」――部屋の空気が、少し変わった。');
var FIND_REACT={
fc:L('{b}が「え、じゃあ一回で済むじゃん｜つまり、一回で済むわけか｜え、では一回で済むんですね」と身を乗り出した。|{b}は「一石三鳥ってこと？｜一石三鳥ということか？｜一石三鳥ということですか？」と笑った。'),
ac:L('{b}は顔を真っ赤にして、紙から目を逸らした。|{b}は聞こえなかったふりをして、膝を抱え直した。'),
cp:L('{b}は「冗談じゃない｜冗談ではない｜冗談じゃありません」と吐き捨てたが、紙から目を離さなかった。|{b}は「……選択肢の一つとしては、覚えておく｜＝｜……選択肢の一つとしては、覚えておきます」とだけ言った。'),
np:L('{b}は「それなら、誰も置いていかなくて済むね｜それなら、誰も置いていかずに済むな｜それなら、誰も置いていかなくて済みますね」と小さく言った。|{b}は全員の顔を順番に見て、「無理はしないで｜無理はするな｜無理はしないでください」と言った。'),
cold:L('{b}は「合理的ではある｜＝｜合理的ではあります」と頷いた。|{b}は黙って、残り時間を計算し直した。')
};
function topKey(c){
var t=c.tr,best='np',bv= -1;
[['np',t.np],['fc',t.fc],['cold',t.cold],['ac',t.ac],['cp',t.cp]].forEach(function(x){if(x[1]>bv){bv=x[1];best=x[0];}});
return best;
}
HK.addTo(EV,{
id:'trio_note',label:'三人で扉の条件の紙を読み解く',cat:'escape',scope:'solo',pri:true,
when:function(ctx,a){return allowed(ctx)&& !ctx.flags.multiKnown&&ctx.present().length>=3&&ctx.stepIndex>=1&&free(a);},
w:function(ctx,a){return 0.7+a.tr.a*0.8+(a.action&&a.action.id==='inspect'?1.2:0)+ctx.stepIndex*0.15;},
run:function(ctx,a){
ctx.flags.multiKnown=true;
var others=ctx.present().filter(function(c){return c!==a;});
var b=ctx.pick(others);
var t=ctx.t(ctx.pick(FIND),a)+ctx.t(ctx.pick(FIND_REACT[topKey(b)]),a,b);
return{text:t,why:a.name+'のA（'+Math.round(a.eg.A)+'）と、扉を調べる気持ち',mag:14,with:[b]};
}
});
function partnered(ctx,a,b){
var t=HK.Ties?HK.Ties.get(ctx,a,b):null;
return a.flags.partner===b.i||b.flags.partner===a.i||ctx.pair(a,b).couple||(t&& /lover|fwb|almost/.test(t.type));
}
function exclBlock(ctx,x,g){
if(!x.flags.excl||x.flags.exclOpen||harmony(ctx,g))return false;
var el=ctx.stepIndex-(x.flags.partnerAt||0);
var others=g.filter(function(y){return y!==x&&y.i!==x.flags.partner;});
if(el>=3&&others.every(function(o){return R(ctx,x,o).att>=35;}))return false;
if(el>=2&&x.stress>70&&ctx.stepIndex>=ctx.stepsTotal*0.7)return false;
return true;
}
function plan(ctx,a,b){
var P=ctx.present().filter(function(c){return free(c)&&c!==a&&c!==b;});
var lv=maxLvl(ctx),best=null;
P.forEach(function(c){
var g=[a,b,c];
if(done3(ctx,g))return;
if(pairsOf(g).some(function(p){return family(ctx,p[0],p[1]);}))return;
if(g.some(function(x){return x.flags.trioNo;}))return;
if(g.some(function(x){return exclBlock(ctx,x,g);}))return;
var leftLov=function(x,o){var t=HK.Ties?HK.Ties.get(ctx,x,o):null;return(t&& /lover|fwb/.test(t.type))||ctx.pair(x,o).couple;};
var holders=g.filter(function(x){return ctx.present().some(function(o){return g.indexOf(o)<0&&leftLov(x,o);});});
if(holders.length&& !(harmony(ctx,g)&&holders.length===1))return;
var cands=[];
var hm=harmonyOf(ctx,g);
var cl0=hm&&clashOf(ctx,g);
if(hm)cands.push({kind:cl0?'loveclash':hm.full?'love':'lovehub',h:cl0?cl0.w:hm.full?g.slice().sort(function(p,q){return A.eager(ctx,q)-A.eager(ctx,p);})[0]:hm.hub,v:10});
var yanTo=function(x,h){var t=HK.Obsess&&HK.Obsess.yanTie?HK.Obsess.yanTie(ctx,x,h):null;if(t)return true;t=HK.Ties&&HK.Ties.has?HK.Ties.has(ctx,x,h,'yan'):null;return!!(t&&t.a===x.i);};
var hubLate=ctx.stepIndex>=Math.max(2,Math.floor((ctx.stepsTotal||10)*0.3));
var hub=function(h,x,y){
if(!hubLate||yanTo(x,h)||yanTo(y,h))return;
if(R(ctx,x,h).att>22&&R(ctx,y,h).att>22&&R(ctx,h,x).att>10&&R(ctx,h,y).att>10&&R(ctx,x,y).ten<55&&R(ctx,y,x).ten<55&&HK.canLove(h,x)&&HK.canLove(h,y)&&HK.canLove(x,h)&&HK.canLove(y,h))
cands.push({kind:'hub',h:h,x:x,y:y,v:1.2+(R(ctx,x,h).att+R(ctx,y,h).att)/70});
};
hub(a,b,c);hub(b,a,c);hub(c,a,b);
[[a,b,c],[a,c,b],[b,c,a]].forEach(function(z){
var x=z[0],y=z[1],o=z[2];
if(partnered(ctx,x,y)&&o.flags.partner==null&&R(ctx,o,x).att+R(ctx,o,y).att>20&&R(ctx,x,o).ten<50&&R(ctx,y,o).ten<50&&(x.tr.np+y.tr.np>0.9||A.eager(ctx,x)+A.eager(ctx,y)>1.1||ctx.present().length===3))
cands.push({kind:'invite',h:o,x:x,y:y,v:0.9+(x.tr.np+y.tr.np)*0.6+(ctx.present().length===3?0.6:0)});
});
if(g.every(function(x){return A.eager(ctx,x)>0.5;})&&pairsOf(g).every(function(p){return R(ctx,p[0],p[1]).ten<50;}))
cands.push({kind:'free',h:g.slice().sort(function(p,q){return A.eager(ctx,q)-A.eager(ctx,p);})[0],v:0.8+g.reduce(function(s,x){return s+A.eager(ctx,x);},0)*0.4});
if(ctx.stepIndex>=ctx.stepsTotal*0.55&&g.every(function(x){return x.stress>45||x.flags.resign;})&&pairsOf(g).every(function(p){return R(ctx,p[0],p[1]).ten<60&&R(ctx,p[0],p[1]).trust> -15;}))
cands.push({kind:'late',h:g[0],v:0.7+ctx.stepIndex/ctx.stepsTotal});
if(pairsOf(g).every(function(p){return A.willing(ctx,p[0],p[1],Math.min(lv,4));}))
cands.push({kind:'warm',h:g[0],v:1.0});
cands.forEach(function(cd){
cd.g=cd.h?[cd.h].concat(g.filter(function(x){return x!==cd.h;})):g;
if(hasH(ctx)){var sh=shapeFor(ctx,cd.g,cd.kind);if(!sh)return;if(sh.hubOnly)cd.g=sh.sg;}
if(!best||cd.v>best.v)best=cd;
});
});
return best;
}
function ord(ctx,x,y){
var fb=HK.RoomLewd?HK.RoomLewd.lead(ctx,x,y):[x,y];
return HK.Pos?HK.Pos.order(x,y,fb):fb;
}
function shape(ctx,g,hubOnly){
var h=g[0],x=g[1],y=g[2];
if(hubOnly){
var ox=ord(ctx,h,x),oy=ord(ctx,h,y),ht=(ox[0]===h?1:0)+(oy[0]===h?1:0);
if(ht===2)return{p:'oneTwo',t:h,m:x,u:y};
if(ht===0)return{p:'twoOne',t:x,m:y,u:h};
return{p:'sandwich',t:ox[0]===h?y:x,m:h,u:ox[0]===h?x:y};
}
var es=pairsOf(g).map(function(p){return ord(ctx,p[0],p[1]);});
var top=function(c){return es.filter(function(e){return e[0]===c;}).length;};
var Tn=g.filter(function(c){return top(c)===2;})[0],Bn=g.filter(function(c){return top(c)===0;})[0];
if(!Tn|| !Bn){var e0=es[0],e1=es.filter(function(e){return e[1]===e0[0];})[0]||es[1];return{p:'ring',t:e0[0],m:e0[1],u:e1[0]===e0[0]?e1[1]:e1[0]};}
var M=g.filter(function(c){return c!==Tn&&c!==Bn;})[0];
var P=HK.Pos,pool=P&&P.explicit(M,Tn)&&P.isBottom(M,Tn)?['oneTwo','oneTwo','oneTwo','sandwich','twoOne']:['sandwich','sandwich','twoOne','oneTwo'];
return{p:ctx.rng.pick(pool),t:Tn,m:M,u:Bn};
}
var SEX0={};
var SOFT={
kiss:L('三人は額を寄せ合い、順番に唇を重ねた。{a}と{b}、{b}と{c}、{c}と{a}――最後の一回は、三人同時に唇を寄せようとして、鼻がぶつかって笑ってしまった。|{a}は{b}に、{b}は{c}に、{c}は{a}に。三人は輪になって、一周ずつキスを回した。'),
hug:L('三人は輪になって、互いの背中に腕を回した。誰のものか分からない鼓動が、肌越しに伝わってきた。|{a}が{b}と{c}をまとめて抱き寄せた。寄り添った体温で、白い部屋が少しだけ暖かくなった。'),
hand:L('三人は輪になって、手を繋いだ。{a}の右手は{b}と、左手は{c}と。|{a}を真ん中に、三人は手を繋いで並んで座った。'),
lap:L('{a}は{b}の膝に頭を乗せ、{c}の膝に脚を預けた。三人は、そのまましばらく黙っていた。|{b}と{c}が並んで座り、その膝の上に{a}が寝転がった。「贅沢すぎる｜＝｜贅沢すぎます」と{a}が笑った。'),
love:L('三人は向かい合って、順番に「好き｜好きだ｜好きです」と言い合った。{a}から{b}へ、{b}から{c}へ、{c}から{a}へ。言い終わったあと、三人とも照れて目を逸らした。'),
honne:L('三人は輪になって座り、一人ずつ本音を打ち明けた。誰か一人を選べなかったこと、それでいいと思えたこと。'),
praise:L('三人は順番に、残りの二人のいいところを言い合った。言われるたびに、誰かが顔を覆った。')
};
var SOFT_HUB={
kiss:L('{a}は{b}と{c}に、順番に唇を重ねた。{b}と{c}は、自分の番が来るのを黙って待った。|{a}は右の{b}に、それから左の{c}に口づけた。二人は{a}越しに、ちらりと目を合わせただけだった。'),
hug:L('{a}は{b}と{c}を、片腕ずつで抱き寄せた。二人は{a}の肩越しに、ちらりと目を合わせただけだった。|{a}は{b}を抱きしめ、それから{c}を抱きしめた。順番を待つあいだ、二人は黙って{a}の背中を見ていた。'),
hand:L('{a}は右手で{b}と、左手で{c}と手を繋いだ。真ん中の{a}だけが、二人の両方と繋がっていた。|{a}を真ん中に、三人は並んで座った。{a}の右手は{b}と、左手は{c}と繋がっていた。'),
lap:L('{a}は{b}の膝に頭を乗せ、{c}の膝に脚を預けた。三人は、そのまましばらく黙っていた。')
};
var OPEN={
loveclash:L('{x}と{y}は、但し書きを読み終える前に{h}の両腕を掴んでいた。どちらも、手を離す気はなかった。{x}「{h}は私のだ｜{h}は私のものだ｜{h}は私のものです」{y}「最初から、私のだ｜最初から、私のものだ｜最初から、私のものです」|{h}が但し書きを読み上げると、{x}と{y}は同時に{h}を引き寄せようとして、互いの手がぶつかった。二人は睨み合い、それから同じことを考えた。三人でなら、相手に{h}を独り占めさせずに済む。|「三人で」と{h}が言い終わる前に、{x}が{h}の唇を塞いだ。{y}はその肩を掴んで{h}を自分の方へ向かせ、奪い返すように口づけた。どちらも、相手に一秒でも長く{h}を渡したくなかった。'),
lovehub:L('{x}と{y}は但し書きを読んで、顔を見合わせた。どちらも{h}と特別な仲で、どちらも互いをよく知っていた。{x}「……{h}となら、三人でも大丈夫｜……{h}となら、三人でも大丈夫だ｜……{h}となら、三人でも大丈夫です」{y}も笑って頷いた。|{h}は{x}と{y}の手を、片方ずつ握った。「二人とも好き。それは、二人とももう知ってるよね｜二人とも好きだ。それは、二人とももう知っているだろう｜二人とも好きです。それは、二人とももう知っていますよね」――{x}と{y}は、照れくさそうに目を合わせた。仲のいい二人のあいだに、迷いはなかった。|{y}が{x}の肩を軽く叩いた。「今日は、一緒に{h}を大事にしよう｜＝｜今日は、一緒に{h}を大事にしましょう」{x}は「言われなくても｜言われるまでもない｜言われなくても、そのつもりです」と笑い返した。{h}は二人のやりとりを聞いて、顔を赤くした。'),
love:L('{h}は紙の但し書きを読んで、{x}と{y}の顔を見た。二人とも、もう笑っていた。{x}「三人一緒なら、いつもどおりだね｜三人一緒なら、いつもどおりだ｜三人一緒なら、いつもどおりですね」|{x}と{y}は、迷わず{h}の両側に腰を下ろした。三人で恋人どうしになってから、誰か一人を置いていくことなど、一度も考えたことがなかった。{h}が二人の手を取ると、指が自然に絡んだ。|「こんな部屋でも、三人なら怖くない｜＝｜こんな部屋でも、三人なら怖くありません」と{y}が言った。{x}が頷いて、{h}の肩に頭を預けた。{h}は二人の髪に順番に口づけてから、「おいで｜来い｜来てください」と囁いた。|三人は、但し書きを読む前から同じベッドに座っていた。いつもの夜と同じように、{h}が真ん中で、{x}と{y}が両側にいた。違うのは、この部屋に窓がないことだけだった。'),
hub:L('{x}と{y}の視線が、同時に{h}に向いた。{h}は二人の顔を見比べて、長いこと黙っていた。「……選べない。だったら、三人で｜……選べない。ならば、三人で｜……選べません。だったら、三人で」|{x}と{y}は、どちらが{h}の相手をするかで言い争いになりかけた。{h}が二人の手を同時に取った。「喧嘩するくらいなら、三人でしよう｜喧嘩をするくらいなら、三人でしよう｜喧嘩するくらいなら、三人でしましょう」|{h}は「どっちかを選んだら、もう一人を置いていくことになる｜どちらかを選べば、もう一人を置いていくことになる｜どちらかを選んだら、もう一人を置いていくことになります」と言った。それから、紙の但し書きを指さした。'),
invite:L('{x}と{y}は顔を見合わせ、部屋の隅で膝を抱えていた{h}に手を差し出した。「一人だけ置いていくのは、なしにしよう｜一人だけ置いていくのは、なしだ｜一人だけ置いていくのは、なしにしましょう」|{x}は{y}の手を握ったまま、{h}の方を振り返った。「{h}も、一緒に｜{h}も、一緒に来い｜{h}も、一緒に来てください」――{y}も、黙って頷いた。|二人で出たら、{h}は一人きりでこの部屋に残る。{x}と{y}は同じことを考えていた。「……三人で、出よう｜……三人で、出るぞ｜……三人で、出ましょう」'),
free:L('{h}が「三人の方が早くない？｜三人の方が早くないか？｜三人の方が早くないですか？」と笑った。誰も、反対しなかった。|{h}は残りの二人の手を引いて、ベッドの真ん中に座らせた。「せっかくだし、みんなで｜せっかくだ、みんなでやろう｜せっかくですし、みんなでやりましょう」'),
late:L('時間がない。三人は顔を見合わせ、言葉少なに決めた。「……三人で、一回で終わらせよう｜＝｜……三人で、一回で終わらせましょう」|照明が暗くなっていく中で、三人は誰からともなく身を寄せ合った。'),
grudge:L('{h}と{x}は、但し書きを読んでも目を合わせなかった。先に口を開いたのは{x}だった。{x}「勘違いしないで。ここを出るためだから｜勘違いするな。ここを出るためだ｜勘違いしないでください。ここを出るためです」{h}「こっちの台詞｜こちらの台詞だ｜こちらの台詞です」――{y}は、二人の顔を見比べて黙っていた。|{h}と{x}のあいだの空気は、最後まで冷えたままだった。それでも、時間は待ってくれない。{y}が「出るまでの、一回だけ｜出るまでの一回だけだ｜出るまでの、一回だけです」と言うと、二人はそっぽを向いたまま頷いた。|{x}は{h}を睨んで、それから扉の紙を睨んだ。{x}「……好きでするわけじゃない｜……好きでするわけではない｜……好きでするわけじゃありません」{h}「知ってる。こっちも同じ｜知っている。こちらも同じだ｜知っています。こちらも同じです」――{y}が、黙って二人のあいだの毛布を広げた。'),
warm:L('この部屋で過ごすうちに、三人の距離はすっかり縮まっていた。{h}が但し書きを指さすと、残りの二人は顔を見合わせて、小さく笑った。|「誰と誰が、とかじゃなくてさ｜誰と誰が、ということではなく｜誰と誰が、とかじゃなくてですね」と{h}が言った。「三人で、ってのはどう？｜三人で、というのはどうだ？｜三人で、というのはどうですか？」――二人は少し考えて、頷いた。')
};
var GRUDGE_AFTER=null;
var TOUCH= /口づけ|唇|キス|舐|抱|撫で|触れ|吸い|指|舌|繋が|挿|貫|重な|重ね|絡|しゃぶ|咥|胸|奥|しがみつ|拭|握|支え|もたれ|寄りかか|寄り添|頬を寄せ|手を引/;
var MUTUAL3= /互いの|互いに|抱きしめ合|抱き合|触れ合|重ね合|口づけ合|求め合|絡み合|絡め合|確かめ合|擦り合|握り合|寄せ合|重なり合|下の二人|残りの二人が|重ねて寝かせ|を重ねて|の重みと|手が伸びてきた/;
var ALL3= /三人(?:は|とも|で|が|の体)[^。]*(?:手を繋|手を重ね|指を絡|抱き合|身を寄せ|絡み合|絡ま|重なり合|折り重な|肌を寄せ|額を寄せ|しがみつ|一つに)/;
function touchOK(l,rr,g,apart){
if(!apart|| !apart.length)return true;
if(MUTUAL3.test(l)||ALL3.test(l))return false;
var hb=g.filter(function(c){return apart.every(function(p){return p.indexOf(c)<0;});})[0]||null;
var parts=[];
String(l).split(/[。\n]/).forEach(function(x){parts.push(x);var sub=x.split(/、/);if(sub.length>1)parts=parts.concat(sub);});
return parts.every(function(x){
if(!TOUCH.test(x))return true;
var who=(x.match(/\{[a-z]\}/g)||[]).map(function(k){return rr[k.charAt(1)];}).filter(Boolean);
if(/二人/.test(x)&&who.length&&who.every(function(c){return c===who[0];})&&who[0]!==hb&&apart.some(function(p){return p.indexOf(who[0])>=0;}))return false;
return!apart.some(function(p){return who.indexOf(p[0])>=0&&who.indexOf(p[1])>=0&& !g.some(function(c){return c!==p[0]&&c!==p[1]&&who.indexOf(c)>=0;});});
});
}
function apartOf(g){return pairsOf(g).filter(function(p){return!okSex(p[0],p[1]);});}
function sexScene(ctx,g,kind,sp,hubOnly,first){
var fpk=HK.Ero&&HK.Ero.freshPick?HK.Ero.freshPick(ctx,function(arr){return ctx.pick(arr);}):function(arr){return ctx.pick(arr);};
var X=HK.TrioLines,V=HK.Voice,pf=function(arr){return fpk(arr);};
var r={h:g[0],x:g[1],y:g[2],t:sp.t,m:sp.m,u:sp.u};
var jp=sp.p==='twoOne'?[sp.t,sp.m]:sp.p==='oneTwo'?[sp.m,sp.u]:sp.p==='sandwich'?[sp.t,sp.u]:null;
var jc=sp.p==='twoOne'?sp.u:sp.p==='oneTwo'?sp.t:sp.m;
var J=jp?jealShape(ctx,jp,jc):{jeal:'none'};
var spat=null;
if(isLove(kind)){if(J.j&&ctx.rng()<0.7)spat={j:J.j,o:J.o,w:jc};J={jeal:'none'};}
if(kind==='loveclash'&&jp){var j1=jealVal(ctx,jp[0],jc)>=jealVal(ctx,jp[1],jc)?jp[0]:jp[1];J={jeal:'both',j:j1,o:jp[0]===j1?jp[1]:jp[0]};}
if(J.j){r.j=J.j;r.o=J.o;}
if(kind==='loveclash')r.w=jc;
var sCand=sp.p==='oneTwo'?[sp.m,sp.u]:sp.p==='ring'?[sp.t,sp.m,sp.u].filter(canBottom):[sp.u];
sCand=sCand.filter(canBottom);
var sB=sCand.length?sCand.slice().sort(function(p,q){return Math.abs(openVal(ctx,q)-0.15)-Math.abs(openVal(ctx,p)-0.15);})[0]:null;
var op=sB?openOf(ctx,sB):'mid';
r.s=sB;
var setPQ=function(rr){if(rr.s){var oth=g.filter(function(c){return c!==rr.s;});rr.p=oth[0];rr.q=oth[1];}else{rr.p=rr.q=null;}};
setPQ(r);
var sTop=function(k){var c=g.slice().sort(function(p,q){return q.tr[k]-p.tr[k];})[0];return c.tr[k]>0.55?c:null;};
var recvOK=function(o,rr){rr=rr||r;return!o.recv|| !o.recv.split(' ').some(function(k){var c=k==='s'&&o.who?sTop(o.who):rr[k];return!c||hardTop(c,g);});};
var E={oneTwo:[[sp.t,sp.m],[sp.t,sp.u]],twoOne:[[sp.t,sp.u],[sp.m,sp.u]],sandwich:[[sp.t,sp.m],[sp.m,sp.u]],ring:[[sp.t,sp.m],[sp.m,sp.u],[sp.u,sp.t]]}[sp.p];
var ffE=HK.Pos?E.filter(function(e){return HK.Pos.ff(e[0],e[1]);})[0]:null;
var ngE= !!(HK.NoGen&&HK.NoGen.on&&E.some(function(e){return HK.NoGen.on(e[0],e[1]);}));
var PEN= /奥まで沈|深く沈|腰を沈|腰を落と|繋が|貫|突い|突き|突く|突か|中に入|入って|熱を吐き出|腰を打ちつけ|果てて.*中|奥で果て|中で果て|最奥|迎え入れ|受け入れ|挿れ|挿入|抜き差し|根元|穿|口に含|のもの/;
var penRaw=function(l){return!ffE|| !PEN.test(l);};
var rolesOK=function(l){var m=String(l).match(/\{[a-z]\}/g)||[];return m.every(function(k){return!!r[k.charAt(1)];});};
var AWK= /本当にするの|初めてだった|初めて見る|初めてだ|選べない|変な関係|二人同時なんて|二人は、だめ|忘れて|飲み込めて|顔を上げられ|気まず|見なかったことに|取り合って|張り合|睨|拗ね|恋敵/;
var moodOK=function(l){return!isLove(kind)|| !AWK.test(l);};
var penOK=function(l){return penRaw(l)&&rolesOK(l)&&moodOK(l)&&apartOK(l);};
var tagOK=function(o){
return(!o.kinds||o.kinds.split(' ').indexOf(kind)>=0)&&(!o.shapes||o.shapes.split(' ').indexOf(sp.p)>=0)
&&(!o.jeal||o.jeal.split(' ').indexOf(J.jeal)>=0)&&(!o.open||o.open.split(' ').indexOf(op)>=0)
&&(!o.recv||o.recv.split(' ').every(function(k){return k==='s'? !!(o.who||r.s): !!r[k];}));
};
var ok=function(o){return tagOK(o)&&recvOK(o);};
var noHub=function(l){return(!hubOnly|| !/同時に触れ合|抱きしめ合/.test(l))&&penOK(l);};
var allRiba=bothRiba(sp.t,sp.m)&&bothRiba(sp.m,sp.u)&&bothRiba(sp.t,sp.u);
var ribaOK=function(o){var pr={tm:[sp.t,sp.m],mu:[sp.m,sp.u],tu:[sp.t,sp.u]}[o.riba];return o.riba==='all'?allRiba: !!pr&&bothRiba(pr[0],pr[1]);};
var swapOK=function(l){return allRiba|| !/入れ替わ|どちらの顔も/.test(l);};
var toyOK=function(l){return!/双頭/.test(l)||bothRiba(sp.t,sp.m);};
var apart=pairsOf(g).filter(function(p){return!okSex(p[0],p[1])|| !wsOk(p[0],p[1]);});
var apartOK=function(l,rr){return touchOK(l,rr||r,g,apart);};
var roleSwapOK=function(l){return!/役を入れ替え|入れ替わ|入れ替え/.test(l)|| !g.some(function(c){return HK.Pos&&HK.Pos.hardTopIn(c,g);});};
var pickA=function(arr,rr){var l=(arr||[]).filter(function(x){return apartOK(x,rr)&&roleSwapOK(x);});return l.length?fpk(l):null;};
if(HK.SAFE_ON&&HK.RoomFade3)return HK.RoomFade3(ctx);
var out=[],used=[];
var LV=HK.Lewd,r18= !HK.SAFE_ON&&LV;
if((HK.SAFE_ON||(r18&&LV.lv(ctx.env)==='low'))&&HK.RoomFade3)return HK.RoomFade3(ctx);
var tShort=r18&&LV.short(ctx.env,ctx.rng),TE=r18&&LV.ero(ctx.env)&&HK.ThickEro&&HK.ThickEro.TRIO?HK.ThickEro:null,tHigh=r18&&LV.high(ctx.env),teC=null;
var efill=function(l){return X.fill(TE.trioFill(ctx,l,r,sp.p),r);};
var T3=HK.Trio3&& !HK.SAFE_ON?HK.Trio3.begin(ctx,sp,{env:ctx.env,short: !!tShort,ero: !!TE,rel:isLove(kind)?'lover':'',first:first,apart:apart}):null;
var put=function(st,t,pri,tag){if(!t)return;if(T3)T3.add(st,t,pri,tag);else out.push(t);};
var pickTagged=function(pool,wfn){
var cands=pool.filter(ok).filter(function(o){return o.t.some(penOK);});
if(!cands.length)return null;
var o=HK.weighted(ctx.rng,cands,function(z){return(wfn?wfn(z):1)*(isLoveAny(kind)&&z.kinds?3:1)/(1+(ctx.flags.trioHL[z.id]||0)*2);});
if(!o)return null;
ctx.flags.trioHL[o.id]=(ctx.flags.trioHL[o.id]||0)+1;
var ls=o.t.filter(penOK);
return{o:o,text:X.fill(fpk(ls.length?ls:o.t),r)};
};
var ltOn=isLove(kind)&&sp.p==='oneTwo'&& !HK.SAFE_ON&&X.LT;
var ltPick=function(k){
var pool=(X.LT&&X.LT[k]||[]).filter(function(o){return(!o.topm|| !isF(sp.t))&&(!o.topf||isF(sp.t))&&recvOK(o)&&o.t.some(penOK);});
if(!pool.length)return null;
var o=HK.weighted(ctx.rng,pool,function(z){return 1/(1+(ctx.flags.trioHL[z.id]||0)*2);});
ctx.flags.trioHL[o.id]=(ctx.flags.trioHL[o.id]||0)+1;
if(o.tag)used.push(o.tag);
return X.fill(fpk(o.t.filter(penOK)),r);
};
var rvM=T3&& !isLoveAny(kind)&&HK.TrioRival?HK.TrioRival.match(ctx,sp):null,rvR=null;
if(rvM){rvR=HK.TrioRival.apply(ctx,rvM,put,fpk,function(l,rr){return apartOK(l,rr);},!!tShort,T3,{first:first,tools: !!ctx.flags.toolbox});used.push(rvR.tag);}
ctx.flags.lastTrioRival=rvR?rvR.why:null;
var ltW=ltOn&&first&& !tShort&&ctx.rng()<0.85?ltPick('warm'):null;
if(ltW)put('fore',ltW,2);
else if(first&& !tShort&& !rvR){
var warmPool=[];
X.WARM.forEach(function(o){var ls=o.t.filter(function(l){return noHub(l)&&apartOK(l);});if(ls.length){var c={};for(var k in o)c[k]=o[k];c.t=ls;warmPool.push(c);}});
var w=pickTagged(warmPool,function(z){return(z.jeal?2.6:1)*(z.open?1.8:1)*(z.kinds?2:1);});
if(w){var wtg=w.o.jeal||w.o.open?(w.o.jeal?'嫉妬の前戯':OPEN_LABEL[op]+'な受け'):'';put('fore',w.text,2,wtg);if(wtg)used.push(wtg);}
}
var ml=ffE&&X.MAIN_FF?X.MAIN_FF[sp.p].filter(swapOK).concat(ctx.flags.toolbox?(X.TOY_FF[sp.p]||[]).filter(toyOK).filter(swapOK):[]).filter(function(l){return apartOK(l);}):X.MAIN[sp.p].filter(noHub).filter(swapOK).filter(function(l){return apartOK(l);});
var ml0=X.MAIN[sp.p].filter(swapOK),ml1=ml0.filter(function(l){return apartOK(l);});
var mlA=ml.length?ml:ml1.length?ml1:apart.length?(SEX0[sp.p]||[]).filter(function(l){return apartOK(l);}):ml0;
if(!(rvR&&rvR.noMain))put('in',X.fill(fpk(mlA.length?mlA:ml0),r),1);
if(apart.length&&X.WATCH){
var wp=apart[0],wa=ctx.rng()<0.5?wp:[wp[1],wp[0]],wh=g.filter(function(c){return wp.indexOf(c)<0;})[0];
var wl=(X.WATCH[wa[0].persona]||X.WATCH.gentle||[]).filter(function(l){return apartOK(l,{a:wa[0],b:wa[1],h:wh});});
if(wl.length&&wh)put('in',X.fill(fpk(wl),{a:wa[0],b:wa[1],h:wh}),2);
}
if(HK.Attr&&HK.Attr.nightText){
var NP={oneTwo:[[sp.t,sp.m],[sp.t,sp.u]],twoOne:[[sp.t,sp.u],[sp.m,sp.u]],sandwich:[[sp.t,sp.m],[sp.m,sp.u]],ring:[[sp.t,sp.m],[sp.m,sp.u]]}[sp.p]||[[sp.t,sp.u]];
var keyOf=function(c){return c===sp.t?'t':c===sp.m?'m':'u';},nAdded=0;
NP.forEach(function(pr){
if(nAdded>=2|| !pr[0]|| !pr[1]||pr[0]===pr[1])return;
var md=HK.Pos&&HK.Pos.isF(pr[0])?(HK.Pos.isF(pr[1])?'ff':'fm'):'mf';
var nt=HK.Attr.nightText(pr[0],pr[1],md,fpk,!!TE,nAdded?'top':undefined);
if(nt){put('mid',X.fill(nt.replace(/\{a\}/g,'{'+keyOf(pr[0])+'}').replace(/\{b\}/g,'{'+keyOf(pr[1])+'}'),r),nAdded?3:2);nAdded++;}
});
}
if(TE){
var pens={oneTwo:[sp.t],twoOne:[sp.t,sp.m],sandwich:[sp.t,sp.m],ring:[sp.t,sp.m,sp.u]}[sp.p]||[sp.t];
var penM= !ffE&& !ngE&&HK.Pos&&pens.every(function(c){return!HK.Pos.isF(c);})&&TE.TRIO.pen[sp.p];
var teL=pickA(penM?TE.TRIO.pen[sp.p]:ngE?TE.TRIO.soft.filter(function(l){return!/ナカ|沈め|挿|貫|奥/.test(l);}):TE.TRIO.soft);
if(teL)put('in',efill(teL),2);
}
if(ltOn){var lh1=ltPick('hl');if(lh1)put('mid',lh1,2);if(first&& !tShort&&ctx.rng()<0.6){var lh2=ltPick('hl');if(lh2&&lh2!==lh1)put('mid',lh2,3);}}
var rb=(ffE?X.RIBA_FF:X.RIBA)||[];
rb=rb.filter(function(o){return(!o.shapes||o.shapes.split(' ').indexOf(sp.p)>=0)&&ribaOK(o);});
if(rb.length&&ctx.rng()<0.5){var rbL=pickA(fpk(rb).t);if(rbL){put('mid',X.fill(rbL,r),3,'リバ同士の入れ替わり');used.push('リバ同士の入れ替わり');}}
if(V&&sp.u&& !hardTop(sp.u,g)&&ctx.rng()<0.75)put('mid',X.fill(V.line(pf,sp.u.persona,ctx.rng()<0.5?'edge':'climax','b').replace(/\{b\}/g,'{u}').replace(/\{a\}/g,'{t}'),r),3);
var top=function(k,th){var c=g.slice().sort(function(p,q){return q.tr[k]-p.tr[k];})[0];return c.tr[k]>th?c:null;};
var after=null;
var addHL=function(pool,wfn,pri){
var cands=pool.filter(function(o){return ok(o)&&(!o.who||top(o.who,0.55))&&o.t.some(penOK);});
if(!cands.length)return false;
var o=HK.weighted(ctx.rng,cands,function(z){return(wfn?wfn(z):1)*(isLoveAny(kind)&&z.kinds?3:1)/(1+(ctx.flags.trioHL[z.id]||0)*2);});
if(!o)return false;
ctx.flags.trioHL[o.id]=(ctx.flags.trioHL[o.id]||0)+1;
var rr=Object.assign({},r);if(o.who){rr.s=top(o.who,0.55);setPQ(rr);}
if(!recvOK(o,rr))return false;
var ls=o.t.filter(function(l){return penOK(l)&&apartOK(l,rr);});
if(!ls.length){if(apart.length)return false;ls=o.t;}
put('mid',X.fill(fpk(ls),rr),pri||3,o.tag);
used.push(o.tag);
if(o.id==='sync')r.synced=true;
if(o.after)after=o.after;
return true;
};
if(!tShort){
var hlJ=X.HL.filter(function(o){return o.jeal;}),hlO=X.HL.filter(function(o){return o.open&& !o.jeal;}),hlG=X.HL.filter(function(o){return!o.jeal&& !o.open&& !o.spat;});
if(spat&&X.SPAT&&X.SPAT.length){
var so=X.SPAT[Math.floor(ctx.rng()*X.SPAT.length)],rs=Object.assign({},r,spat),sl=so.t.filter(function(l){return penRaw(l)&&moodOK(l)&&apartOK(l,rs)&&(String(l).match(/\{[a-z]\}/g)||[]).every(function(k){return!!rs[k.charAt(1)];});});
if(sl.length){put('mid',X.fill(fpk(sl),rs),2,so.tag);used.push(so.tag);}
}
var nJ=kind==='loveclash'?1:J.jeal!=='none'?(ctx.rng()<0.85?1:0):(ctx.rng()<0.45?1:0);
if(kind==='loveclash')addHL(X.HL.filter(function(o){return o.kinds&&o.kinds.split(' ').indexOf('loveclash')>=0;}),null,1);
if(nJ)addHL(hlJ,null,2);
if(ctx.rng()<(first?0.6:0.35))addHL(hlO);
var nG=first?(ctx.rng()<0.6?1:0)+(used.length<2?1:0):(used.length?0:1);
for(var k=0;k<nG;k++)addHL(hlG,function(z){return(z.kinds?2.2:1)*(z.shapes?1.6:1)*(z.who?1.3:1);});
}
if(sp.p==='sandwich'&&V&& !hardTop(sp.m,g)&&ctx.rng()<0.6)put('peak',X.fill(V.line(pf,sp.m.persona,'climax','b').replace(/\{b\}/g,'{m}').replace(/\{a\}/g,'{t}'),r),3);
var ltC=ltOn&& !TE&& !r.synced&&ctx.rng()<0.6?ltPick('climax'):null;
if(rvR){}
else if(ltC)put('peak',ltC,1);
else if(TE&&(teC=pickA(TE.TRIO.climax.filter(function(l){return!(ngE&& /\{s:(?:hit|cum)\}|搾り|注|吐き出/.test(l));}).filter(function(l){return!/搾りと[られ]/.test(l)||((sp.p==='twoOne'||sp.p==='sandwich')&&HK.Pos&&HK.Pos.hasM(sp.t)&&HK.Pos.hasM(sp.m));})))!==null)put('peak',efill(teC),1);
else if(!r.synced){
var cx=(X.CLIMAX_X||[]).filter(function(o){return ok(o)&&o.t.some(penOK)&&(!o.after||o.after===after);});
var c=cx.length&&ctx.rng()<0.7?HK.weighted(ctx.rng,cx,function(z){return(z.jeal?2:1)*(z.open?1.5:1)*(z.kinds?(isLoveAny(kind)?6:2):1)/(1+(ctx.flags.trioHL[z.id]||0)*2);}):null;
if(c){ctx.flags.trioHL[c.id]=(ctx.flags.trioHL[c.id]||0)+1;var cl=c.t.filter(penOK);put('peak',X.fill(fpk(cl.length?cl:c.t),r),1);}
else if(!T3||ctx.rng()<0.5)put('peak',X.fill(fpk(X.CLIMAX.filter(penOK)),r),1);
}
if(tHigh&&HK.ThickEro){var agL=pickA(TE?TE.TRIO.again:HK.ThickEro.TRIO.againNovel);if(agL)put('after',TE?efill(agL):X.fill(agL,r),1);}
if(!tShort&&ctx.rng()<(first?0.75:0.4)){
var aOK=function(l){return rolesOK(l)&&moodOK(l)&&apartOK(l);};
var ax=(X.AFTER_X||[]).filter(function(o){return ok(o)&&o.t.some(aOK)&&(!o.after||o.after===after||(!after&&o.after==='bond'&&J.jeal==='none'));});
var a=ax.length&&ctx.rng()<(after?0.9:0.6)?HK.weighted(ctx.rng,ax,function(z){return(z.after&&z.after===after?3:1)*(z.jeal?1.6:1)*(z.kinds?(isLoveAny(kind)?6:2):1)/(1+(ctx.flags.trioHL[z.id]||0)*2);}):null;
var al=a?a.t.filter(aOK):[];
if(a&&al.length){ctx.flags.trioHL[a.id]=(ctx.flags.trioHL[a.id]||0)+1;put('after',X.fill(fpk(al),r),2);}
else{var af=X.AFTER.filter(aOK);put('after',X.fill(fpk(af.length?af:X.AFTER.filter(moodOK)),r),2);}
}
var txt3=T3?T3.text():out.join('');
if(T3&&T3.dropped.length)used=used.filter(function(tg){return T3.dropped.indexOf(tg)<0;});
ctx.flags.lastTrioTags=used;
ctx.flags.lastTrioInfo={p:sp.p,jeal:J.jeal,open:op,j:J.j?J.j.name:'',s:sB?sB.name:'',after:after};
if(ffE&&HK.FF)txt3=HK.FF.fix(ctx,txt3,ffE[0],ffE[1],{tools: !!ctx.flags.toolbox});
var apartP=function(a,b){return apart.some(function(p){return p.indexOf(a)>=0&&p.indexOf(b)>=0;});};
if(HK.FM&&HK.Pos)g.filter(function(c){return HK.Pos.isF(c)&&(HK.Pos.isTop(c)||HK.Pos.hasFor(c));}).forEach(function(f){
g.forEach(function(m){if(m!==f&& !HK.Pos.isF(m)&&HK.Pos.isTop(f,m)&& !apartP(f,m))txt3=HK.FM.fixWith(ctx,txt3,f,m.name);});
});
if(HK.FM&&HK.Pos&&E)E.forEach(function(e){var f=e[0],m=e[1];if(f&&m&&f!==m&&HK.Pos.isF(f,m)&& !HK.Pos.isF(m,f)&& !HK.Pos.isTop(f,m))txt3=HK.FM.fixWith(ctx,txt3,f,m.name);});
return txt3;
}
if(HK.TrioLines&&HK.TrioLines.OPEN)Object.keys(HK.TrioLines.OPEN).forEach(function(k){OPEN[k]=OPEN[k]||HK.TrioLines.OPEN[k];});
function scene(ctx,g,kind,first,nPresent,pre,force){
var h=g[0],x=g[1],y=g[2],V=HK.Voice,pf=function(arr){return ctx.pick(arr);};
var rk=pairRules(ctx),sex=force||rk.some(function(r){return r.k==='h';});
var sh=sex?pre||shapeFor(ctx,g,kind):null;
var ap=sh?apartOf(g):[],rr0={h:h,x:x,y:y},okL=function(l,rr){return touchOK(l,rr||rr0,g,ap);};
if(sh)ctx.flags.lastTrioPairs=pairsOf(g).filter(function(p){return okSex(p[0],p[1]);});
var op=(OPEN[kind]||OPEN.warm).filter(function(l){return(nPresent===3|| !/一人きり/.test(l))&&okL(l);});
if(!op.length)op=OPEN.warm.filter(function(l){return(nPresent===3|| !/一人きり/.test(l))&&okL(l);});
if(!op.length)op=['{h}が但し書きを指さすと、残りの二人は顔を見合わせて、小さく頷いた。'];
var r2=HK.TrioLines?HK.TrioLines.ROUND2.filter(function(l){return okL(l);}):[];
var txt=first?ctx.t(ctx.pick(op).replace(/\{h\}/g,'\u0001').replace(/\{x\}/g,'\u0002').replace(/\{y\}/g,'\u0003'),h,x,y).replace(/\u0001/g,h.name).replace(/\u0002/g,x.name).replace(/\u0003/g,y.name)
:(HK.TrioLines&&r2.length?HK.TrioLines.fill(ctx.pick(r2),rr0):ap.length?ctx.t('三人は、もう一度向き合った。',h,x,y):ctx.t('三人は、もう一度身を寄せ合った。',h,x,y));
if(sex){
if(sh)txt+=sexScene(ctx,sh.sg,kind,sh.sp||shape(ctx,sh.sg,sh.hubOnly),sh.hubOnly,first,nPresent);
else txt+='三人は身を寄せ合ったが、それ以上は進まなかった。';
}
var hb=ap.length?g.filter(function(c){return ap.every(function(p){return p.indexOf(c)<0;});})[0]:null,ob=hb?g.filter(function(c){return c!==hb;}):null;
rk.forEach(function(r){
if(r.k==='h'|| !SOFT[r.k])return;
var ls=SOFT[r.k].filter(function(l){return okL(l,{a:h,b:x,c:y});});
if(ls.length)txt+=ctx.t(ctx.pick(ls),h,x,y);
else if(hb&&SOFT_HUB[r.k])txt+=ctx.t(ctx.pick(SOFT_HUB[r.k]),hb,ob[0],ob[1]);
});
return txt;
}
function count(ctx,g){
var span=Math.max(3,ctx.stepsTotal*0.55);
ctx.flags.trioWait=null;
pairRules(ctx).forEach(function(r){
var Tk=K[r.k];
pairsOf(g).forEach(function(pr){
var p=A.prog(ctx,pr[0],pr[1]);
if(Tk.type==='act'){
var inc=r.n>3?Math.max(1,Math.round(r.n/span*1.2*(0.6+ctx.rng()*0.8)*(6-Tk.lvl)/3)):1;
if(A.bumpAct){if(!A.bumpAct(ctx,r,pr[0],pr[1],inc)&& !ctx.flags.trioWait)ctx.flags.trioWait=[r,pr[0],pr[1]];}else p.act[r.k]=Math.min(r.n,(p.act[r.k]||0)+inc);
}else if(A.seqWait&&A.seqWait(ctx,r,pr[0],pr[1])){
p.pre=p.pre||{};p.pre[r.k]=(p.pre[r.k]||0)+1;
if(!ctx.flags.trioWait)ctx.flags.trioWait=[r,pr[0],pr[1]];
}else{
if(A.seqFlush)A.seqFlush(ctx,r,pr[0],pr[1]);
pr.forEach(function(c){p.said[r.k+c.i]=Math.min(r.n,(p.said[r.k+c.i]||0)+(Tk.mode==='sum'?Math.ceil(r.n/2):1));});
}
});
});
}
function progText(ctx,g){
var w=ctx.flags.trioWait;
if(w&&A.waitNote){ctx.flags.trioWait=null;return A.waitNote(ctx,w[0],w[1],w[2]);}
var r=pairRules(ctx).filter(function(q){return K[q.k].type==='act'&&q.n>1;})[0];
if(!r)return'';
return'（三人で'+K[r.k].noun+'：'+pairsOf(g).map(function(pr){return(HK.pairNameOf?HK.pairNameOf(pr[0],pr[1]):pr[0].name+'×'+pr[1].name)+' '+(A.prog(ctx,pr[0],pr[1]).act[r.k]||0)+'/'+r.n;}).join('・')+'）';
}
function stayFor(ctx,g){
var out=null;
g.some(function(x){
var o=ctx.present().filter(function(y){return g.indexOf(y)<0&& !y.out&&y.alive!==false&&y.flags.cagePair==null&&loveTie(ctx,x,y)&& !A.pairDone(ctx,x,y);})[0];
if(o)out={s:x,o:o};
return!!o;
});
return out;
}
T.exitGroup=function(ctx,g,text,why,night,kind){
if(ctx.flags.oneCond&&A.oneDoor){
pairsOf(g).forEach(function(pr){if(night&&okSex(pr[0],pr[1]))ctx.pair(pr[0],pr[1]).night=true;});
var od=A.oneDoor(ctx,g,text,why,false);
od.with=g;if(night)od.lewd=true;
return od;
}
var sf=A.allOut&&A.allOut(ctx)?null:stayFor(ctx,g);
if(sf){
var go=g.filter(function(c){return c!==sf.s;});
go.forEach(function(c){c.out=true;c.fate='脱出';c.fateNote=go.filter(function(o){return o!==c;}).map(function(o){return o.name;}).join('と')+'と部屋を出た（'+sf.s.name+'は、'+sf.o.name+'のために残った）';c.flags.trio=g.map(function(o){return o.i;});});
sf.s.flags.trio=g.map(function(o){return o.i;});sf.s.flags.stayed=(sf.s.flags.stayed||0)+1;
pairsOf(g).forEach(function(pr){ctx.mod2(pr[0],pr[1],{trust:8,aff:4},{trust:8,aff:4});if(night&&okSex(pr[0],pr[1]))ctx.pair(pr[0],pr[1]).night=true;});
ctx.mod2(sf.s,sf.o,{trust:6,aff:4},{trust:6,aff:4});
var ex0={group:g.map(function(c){return c.i;}),label:ctx.label,trio:true,night: !!night,kind:kind||'warm'};
(ctx.flags.exits=ctx.flags.exits||[]).push(ex0);
ctx.flags.trios.push(ex0);
var st=ctx.t(ctx.pick([
'{a}は二人の背中を押して先に行かせ、自分は部屋の中に向き直った。{a}「{b}を一人にはしない。すぐ行く｜＝｜{b}を一人にはしません。すぐ行きます」',
'{a}は出ていく二人に手を振ってから、部屋の隅の{b}の隣に腰を下ろした。{a}「待たせた。次は、二人で｜待たせたな。次は、二人でだ｜お待たせしました。次は、二人で」',
'{b}が顔を上げた。{a}は外へは出ず、{b}の手を取った。{a}「先に出てて。{b}と一緒に行くから｜先に出ていろ。{b}と一緒に行く｜先に出ていてください。{b}と一緒に行きますから」――二人は頷いて、先に外へ出た。'
]),sf.s,sf.o);
var sw=sf.s.name+'には、部屋に残る恋人（'+sf.o.name+'）がいる。場面は三人までにして、'+sf.s.name+'が残った';
if(A.doorOpen)A.doorOpen(ctx,{g:g,with:[sf.o],ex:ex0,noEnd:true,why:why,cat:'escape',mag:30,post:st,postWhy:sw});
return{cat:'escape',mag:40,text:text,why:why+'／'+sw,with:g,lewd:night?true:undefined};
}
g.forEach(function(c){
c.out=true;c.fate='脱出';
c.fateNote=g.filter(function(o){return o!==c;}).map(function(o){return o.name;}).join('と')+'と、'+kn(g.length)+'で部屋を出た';
c.flags.trio=g.map(function(o){return o.i;});
});
pairsOf(g).forEach(function(pr){ctx.mod2(pr[0],pr[1],{trust:8,aff:4},{trust:8,aff:4});if(night&&okSex(pr[0],pr[1]))ctx.pair(pr[0],pr[1]).night=true;});
var ex={group:g.map(function(c){return c.i;}),label:ctx.label,trio:true,night: !!night,kind:kind||'warm'};
(ctx.flags.exits=ctx.flags.exits||[]).push(ex);
ctx.flags.trios.push(ex);
var al=A.bringAlong?A.bringAlong(ctx,g):[];
var w=why+(al.length?'／条件を満たした人と一緒に、ほかの全員も出られる部屋':'');
if(A.doorOpen)A.doorOpen(ctx,{g:g.concat(al),ex:ex,why:w});
return{cat:'escape',mag:40,text:text,why:w,with:g,lewd:night?true:undefined};
};
T.sexOk3=function(g){return g.length===3&& !!sexShape(g,false);};
T.condScene=function(ctx,g,first,opt){
if(!T.sexOk3(g))return null;
var sh=sexShape(g,false);
var sp=shape(ctx,sh.sg,sh.hubOnly),kind=harmony(ctx,g)?loveKind(ctx,g)||'warm':'warm';
if(kind==='lovehub'||kind==='loveclash')kind='warm';
var gr=opt&&opt.kind==='grudge'&&opt.gr&&opt.gr.length?opt.gr[0]:null;
var rvM0= !gr&&kind==='warm'&&first&&HK.TrioRival?HK.TrioRival.match(ctx,sp):null;
if(rvM0)gr=[rvM0.u,rvM0.k];
if(gr)kind='grudge';
var go=orderG(ctx,g,sh,sp,kind);
if(gr){
var h0=go[0];
if(gr.indexOf(h0)>=0){var x0=gr[0]===h0?gr[1]:gr[0];go=[h0,x0].concat(g.filter(function(c){return c!==h0&&c!==x0;}));}
else if(!sh.hubOnly)go=[gr[0],gr[1]].concat(g.filter(function(c){return gr.indexOf(c)<0;}));
}
var text=scene(ctx,go,kind,first,ctx.present().length,{sg:go,hubOnly:sh.hubOnly,sp:sp},true);
if(gr&&GRUDGE_AFTER&& !ctx.flags.lastTrioRival)text+=ctx.t(ctx.pick(GRUDGE_AFTER),go[0],go[1],go[2]);
var why=(KIND_WHY[kind]||'')+infoWhy(ctx,sh);
if(ctx.flags.lastTrioTags&&ctx.flags.lastTrioTags.length){why+='／見所：'+ctx.flags.lastTrioTags.join('・');ctx.flags.lastTrioTags=null;}
return{text:text,why:why,kind:kind};
};
HK.addTo(EV,{
id:'trio_persuade',cat:'romance',scope:'pair',pri:true,
when:function(ctx,a,b){
if(!allowed(ctx)|| !ctx.flags.multiKnown||ctx.present().length<3|| !free(a)|| !free(b)||ctx.flags.trioCur)return false;
if(!b.flags.excl||b.flags.exclOpen||(b.flags.persuadeAt===ctx.stepIndex)||(b.flags.persuadeN||0)>=3)return false;
if(ctx.stepIndex-(b.flags.partnerAt||0)<1)return false;
if(family(ctx,a,b))return false;
var third=ctx.present().filter(function(c){return c!==a&&c!==b&&free(c)&&HK.canLove(b,c)&& !family(ctx,a,c)&& !family(ctx,b,c);})[0];
if(!third)return false;
return a.i===b.flags.partner?A.eager(ctx,a)>0.45||a.tr.np>0.6:A.eager(ctx,a)>0.55&&R(ctx,a,b).att>15;
},
w:function(ctx,a,b){return 0.5+A.eager(ctx,a)+(a.i===b.flags.partner?0.5:0);},
run:function(ctx,a,b){
var isP=a.i===b.flags.partner;
var c=ctx.present().filter(function(x){return x!==a&&x!==b&&free(x)&&HK.canLove(b,x)&& !family(ctx,a,x)&& !family(ctx,b,x);}).sort(function(x,y){return R(ctx,b,y).att-R(ctx,b,x).att;})[0];
b.flags.persuadeAt=ctx.stepIndex;b.flags.persuadeN=(b.flags.persuadeN||0)+1;
var ch=0.2+R(ctx,b,a).trust/110+R(ctx,b,a).att/130+A.eager(ctx,b)*0.4-b.tr.cp*0.3+(isP?0.15:0)+b.stress/300+(b.flags.persuadeN-1)*0.1+Math.max(0,R(ctx,b,c).att)/150;
var ok=ctx.rng()<ch;
var t=ctx.t(ctx.pick(isP?[
'{a}は{b}の手を取った。{a}「三人で、なんて……{b}が嫌ならやめる。でも、{c}を一人にしておけないんだ｜三人で、というのは……{b}が嫌ならやめる。だが、{c}を一人にはしておけない｜三人で、なんて……{b}が嫌ならやめます。でも、{c}を一人にしておけないんです」',
'{a}は{b}の耳元で囁いた。{a}「私は{b}が一番だよ。それは変わらない。……{c}も、一緒にいてほしい｜私は{b}が一番だ。それは変わらない。……{c}にも、一緒にいてほしい｜私は{b}が一番ですよ。それは変わりません。……{c}にも、一緒にいてほしいんです」',
'{a}「{b}が決めたことは分かってる。でも、このままじゃ{c}だけ出られない｜{b}が決めたことは分かっている。だが、このままでは{c}だけ出られない｜{b}が決めたことは分かっています。でも、このままじゃ{c}だけ出られません」'
]:[
'{a}が{b}の前に座り込んだ。{a}「{b}が一人だけって決めてるのは知ってる。でも、三人なら早く出られる｜{b}が一人だけと決めているのは知っている。だが、三人なら早く出られる｜{b}が一人だけと決めているのは知っています。でも、三人なら早く出られます」',
'{a}は{b}に頭を下げた。{a}「お願い。邪魔はしない。端っこにいさせてくれるだけでいいから｜頼む。邪魔はしない。端にいさせてくれるだけでいい｜お願いします。邪魔はしません。端っこにいさせてくれるだけでいいですから」',
'{a}「ねえ{b}、決め事って、たまには破ってもいいと思う｜なあ{b}、決め事は、たまには破ってもいいと思う｜ねえ{b}、決め事って、たまには破ってもいいと思います」'
]),a,b,c);
if(ok){
b.flags.exclOpen=true;
ctx.mod2(b,a,{trust:4,att:3},{trust:4,att:3});
t+=ctx.t(ctx.pick([
'{b}は長いこと黙っていた。それから、{a}の顔を見ずに小さく頷いた。{b}「……{a}がそこまで言うなら｜＝｜……{a}がそこまでおっしゃるなら」',
'{b}はため息をついた。{b}「……今回だけ。それに、{a}が隣にいるなら｜……今回だけだ。それに、{a}が隣にいるなら｜……今回だけですよ。それに、{a}が隣にいるなら」',
'{b}は{c}の方をちらりと見て、目を伏せた。{b}「……分かった。仲間外れは、させたくない｜＝｜……分かりました。仲間外れは、させたくありません」'
]),a,b,c);
return{text:t,why:a.name+'が、「相手は一人だけ」と決めていた'+b.name+'を説得した（'+(isP?'決めた相手からの頼み・':'')+'信頼・惹かれ）。'+b.name+'は三人に加わってもいいと思い始めた',mag:16,with:c?[c]:[]};
}
ctx.mod2(b,a,{ten:4},{ten:2});
t+=ctx.t(ctx.pick([
'{b}は首を振った。{b}「最初に言ったよね。他の人とは無理｜最初に言ったはずだ。他の人とは無理だ｜最初に言いましたよね。他の人とは無理です」',
'{b}は{a}の手をそっと外した。{b}「……ごめん。そこは、譲れない｜……すまない。そこは、譲れない｜……ごめんなさい。そこは、譲れません」',
'{b}は黙って、壁の方を向いてしまった。'
]),a,b,c);
return{text:t,why:b.name+'は「相手は一人だけ」という決め事を曲げなかった（CP・積極性の低さ）',mag:10,with:c?[c]:[]};
}
});
function trioProb(ctx,g){
var avg=function(f){return g.reduce(function(s,c){return s+f(c);},0)/g.length;};
var p=0.62+(avg(function(c){return A.eager(ctx,c);})-0.35)*0.7;
if(g.some(function(c){return HK.Pos&&HK.Pos.nori&&HK.Pos.nori(c);}))p+=0.08;
p-=avg(function(c){return c.tr.ac;})*0.2+avg(function(c){return c.tr.cp;})*0.15;
p-=g.filter(function(c){return c.flags.excl&& !c.flags.exclOpen;}).length*0.1;
if(ctx.flags.hasAphroRule)p+=0.1;
p+=(+ctx.env.pressure||50)/1000;
if(harmony(ctx,g))p=Math.max(p+0.25,0.8);
return HK.clamp(p,0.3,0.95);
}
function roll(ctx){
var g=ctx.present();
if(ctx.flags.trioRoll==null){
if(g.length!==3)return false;
var p=trioProb(ctx,g);
ctx.flags.trioProb=p;
ctx.flags.trioRoll=ctx.rng()<p?'y':'n';
}
if(ctx.flags.trioRoll==='n'&& !ctx.flags.trioLate&&g.length===3&&ctx.stepIndex>=ctx.stepsTotal*0.65&& !(ctx.flags.exits||[]).length&&g.every(function(c){return c.stress>55||c.flags.resign;})){
ctx.flags.trioLate=true;
if(ctx.rng()<0.5){ctx.flags.trioRoll='y';ctx.flags.trioProb=0.5;}
}
return ctx.flags.trioRoll==='y';
}
T.roll=roll;
function aphroHot(ctx,g){
var n=function(th){return g.filter(function(c){return(c.flags.aphro||0)>=th;}).length;},sum=g.reduce(function(s,c){return s+(c.flags.aphro||0);},0);
return n(2)>=2||(sum>=5&&n(1.5)>=2)||sum>=7;
}
function donePair(ctx,g){return pairsOf(g).filter(function(p){return(A.prog(ctx,p[0],p[1]).act.h||0)>0;})[0]||null;}
function seqWaitAll(ctx,g){
var rs=pairRules(ctx).filter(function(r){return K[r.k].type==='act';});
return!!A.seqWait&&rs.length>0&&rs.every(function(r){return pairsOf(g).every(function(p){return A.seqWait(ctx,r,p[0],p[1]);});});
}
function ready(ctx,g){
if(ctx.stepIndex<1)return false;
if(aphroHot(ctx,g)||donePair(ctx,g))return true;
var lv=Math.min(maxLvl(ctx),5);
if(pairsOf(g).some(function(p){return okSex(p[0],p[1])&&(A.willing(ctx,p[0],p[1],lv)||A.desperate(ctx,p[0],p[1],lv));}))return true;
return ctx.stepIndex>=ctx.stepsTotal*0.4;
}
function exclOK3(ctx,c,g){
if(!c.flags.excl||c.flags.exclOpen||harmony(ctx,g))return true;
var el=ctx.stepIndex-(c.flags.partnerAt||0),p=c.flags.partner!=null?ctx.chars[c.flags.partner]:null;
if(el>=1&&p&&isJealous(ctx,c,p))return true;
if(el>=2&&(A.eager(ctx,c)>0.35||c.stress>40))return true;
return c.stress>70&&ctx.stepIndex>=ctx.stepsTotal*0.6;
}
function kindFor(ctx,g){
if(harmony(ctx,g))return loveKind(ctx,g);
if(aphroHot(ctx,g))return'aphro';
if(donePair(ctx,g))return'join';
var cands=['auto'];
g.forEach(function(h){
var o=g.filter(function(c){return c!==h;});
if(R(ctx,o[0],h).att>30&&R(ctx,o[1],h).att>30&&HK.canLove(o[0],h)&&HK.canLove(o[1],h))cands.push('hub');
});
if(pairsOf(g).some(function(p){return partnered(ctx,p[0],p[1]);}))cands.push('invite');
if(g.every(function(c){return A.eager(ctx,c)>0.5;}))cands.push('free');
if(ctx.stepIndex>=ctx.stepsTotal*0.6&&g.every(function(c){return c.stress>45||c.flags.resign;}))cands.push('late');
return ctx.rng.pick(cands);
}
function orderG(ctx,g,sh,sp,kind){
var h;
if(kind==='join'){var dp=donePair(ctx,g);h=g.filter(function(c){return dp.indexOf(c)<0;})[0];}
else if(kind==='hub')h=g.slice().sort(function(p,q){var s=function(c){return g.reduce(function(t,o){return o===c?t:t+R(ctx,o,c).att;},0);};return s(q)-s(p);})[0];
else if(kind==='lovehub')h=harmonyOf(ctx,g).hub;
else if(kind==='loveclash')h=clashOf(ctx,g).w;
else if(kind==='invite')h=g.filter(function(c){return g.filter(function(o){return o!==c;}).every(function(o){return!partnered(ctx,c,o);});})[0];
if(!h)h=sh.hubOnly?sh.sg[0]:sp.p==='twoOne'?sp.u:sp.p==='oneTwo'?sp.t:sp.p==='sandwich'?sp.m:sh.sg[0];
return[h].concat(g.filter(function(c){return c!==h;}));
}
var TURN=L('{a}は、「相手は一人だけ」と言ったときのことを思い出した。あれから何時間も経って、気持ちは少しずつ変わっていた。|{a}は、自分で決めたはずの線を、もう一度見直していた。この部屋で過ごした時間が、それを書き換えていた。');
var TURN_LATE=L('{a}は、「他の人とは無理｜他の人とは無理だ｜他の人とは無理です」と言った自分を思い出した。けれど、もう時間がなかった。|{a}は唇を噛んだ。最初の決め事より、ここを出ることの方が大事になっていた。');
var TURN_JEAL=L('{a}は、{b}をもう一人と二人きりにするくらいなら、と自分も加わることにした。決め事を曲げたのは、嫉妬だった。|{a}「……{b}を一人で行かせるより、ましだ｜＝｜……{b}を一人で行かせるより、ましです」{a}はそう言って、決めたはずの線を自分で踏み越えた。|{a}は{b}の手を離さなかった。離さないまま、三人の輪の中に入っていった。');
function turnText(ctx,g){
if(harmony(ctx,g)){g.forEach(function(c){if(c.flags.excl)c.flags.exclOpen=true;});return'';}
return g.filter(function(c){return c.flags.excl&& !c.flags.exclOpen;}).map(function(c){
c.flags.exclOpen=true;
var p=c.flags.partner!=null?ctx.chars[c.flags.partner]:null;
var late=c.stress>70&&ctx.stepIndex>=ctx.stepsTotal*0.6;
if(p&&isJealous(ctx,c,p)&& !late)return ctx.t(ctx.pick(TURN_JEAL),c,p);
return ctx.t(ctx.pick(late?TURN_LATE:TURN),c);
}).join('');
}
var KIND_WHY={loveclash:'二人の恋人が、同じ一人にそろって執着していた。円満ではなく、激しい取り合いになった',love:'三人とも互いに恋人どうしで、円満だった',lovehub:'一人が残りの二人の両方と恋人（または友達以上恋人未満）で、残りの二人も仲がよい。円満な三人',hub:'二人が同じ一人に惹かれていた',invite:'恋人同士が、残る一人を誘った',free:'三人とも積極的だった',late:'残り時間への焦り。三人なら一度で済む',warm:'三人とも、互いに打ち解けていた',grudge:'不仲の二人も、もう一人がいる三人ならと、条件のために割り切った',auto:'三人ちょうどで、受けに回れる人がいた',join:'二人が先に始めていて、三人目が加わった',aphro:'媚薬が三人に回っていた'};
function infoWhy(ctx,sh){
var info=ctx.flags.lastTrioInfo;
if(!info)return'';
var rvW=ctx.flags.lastTrioRival?'／'+ctx.flags.lastTrioRival:'';
ctx.flags.lastTrioRival=null;
var hubNote=sh&&sh.hubOnly?'（'+pairsOf(sh.sg).filter(function(p){return!okSex(p[0],p[1]);}).map(function(p){return p[0].name+'と'+p[1].name;}).join('・')+'は直接は繋がらない）':'';
return'／形：'+(SHAPE_LABEL[info.p]||info.p)+hubNote+'／嫉妬：'+JEAL_LABEL[info.jeal]+(info.j?'（'+info.j+'）':'')+'／受けの開放度：'+OPEN_LABEL[info.open]+(info.s?'（'+info.s+'）':'')+(info.after?'／結末：'+{sour:'険悪',bond:'連帯',yield:'折れた'}[info.after]:'')+rvW;
}
HK.addTo(EV,{
id:'trio_auto',label:'三人で条件を満たす流れになる',cat:'romance',sex:true,scope:'pair',pri:true,
when:function(ctx,a,b){
if(!allowed(ctx)|| !ctx.flags.multiKnown||ctx.flags.trioCur)return false;
var g=ctx.present();
if(g.length!==3|| !g.every(free))return false;
if(!hasH(ctx)&& !(ctx.flags.hasAphroRule&&aphroHot(ctx,g)))return false;
if(done3(ctx,g)||pairsOf(g).some(function(p){return family(ctx,p[0],p[1]);}))return false;
if(g.some(function(c){return c.flags.trioNo;}))return false;
if(!g.some(canBottom)|| !(loveShape(ctx,g)||sexShape(g,false)))return false;
if(!roll(ctx))return false;
if(!g.every(function(c){return exclOK3(ctx,c,g);}))return false;
return ready(ctx,g);
},
w:function(ctx){var g=ctx.present();return(5.5+g.reduce(function(s,c){return s+A.eager(ctx,c);},0)*1.5+(aphroHot(ctx,g)?2:0)+(donePair(ctx,g)?1.5:0))*(seqWaitAll(ctx,g)?0.15:1);},
run:function(ctx,a,b){
var g=ctx.present();
var sh=loveShape(ctx,g)||sexShape(g,false);
if(!sh)return null;
var sp=shape(ctx,sh.sg,sh.hubOnly),kind=kindFor(ctx,g),go=orderG(ctx,g,sh,sp,kind);
var turn=turnText(ctx,g);
ctx.flags.trioCur={g:g.map(function(c){return c.i;}),kind:kind};
g.forEach(function(c){c.flags.partner=null;});
count(ctx,g);
pairsOf(g).forEach(function(pr){ctx.mod2(pr[0],pr[1],{att:8,aff:5,trust:4},{att:8,aff:5,trust:4});if(okSex(pr[0],pr[1]))ctx.pair(pr[0],pr[1]).heatDone=true;});
var text=turn+scene(ctx,go,kind,true,3,{sg:go,hubOnly:sh.hubOnly,sp:sp},!hasH(ctx));
var why='三人の場面：'+KIND_WHY[kind]+infoWhy(ctx,sh)+'／三人になる確率 '+Math.round((ctx.flags.trioProb||0)*100)+'%（積極性・奔放・内気・CP・決め事・媚薬から）／但し書き：三人以上で同時なら全員分';
if(ctx.flags.lastTrioTags&&ctx.flags.lastTrioTags.length){why+='／見所：'+ctx.flags.lastTrioTags.join('・');ctx.flags.lastTrioTags=null;}
var third=g.filter(function(c){return c!==a&&c!==b;});
if(done3(ctx,g)){ctx.flags.trioCur=null;return T.exitGroup(ctx,g,text,why,hasH(ctx),kind);}
return{text:text+progText(ctx,g)+'扉はまだ開かない。',why:why,mag:30,with:third};
}
});
HK.addTo(EV,{
id:'trio_heat',label:'三人に薬が回り条件に向かう',cat:'romance',sex:true,scope:'pair',pri:true,
when:function(ctx,a,b){
if(multiOf(ctx)==='no'||ctx.flags.isOne||ctx.flags.oneCond||A.hasPairRule(ctx)|| !ctx.flags.hasAphroRule||ctx.flags.trioHeat)return false;
var g=ctx.present();
if(g.length!==3|| !g.every(free)|| !aphroHot(ctx,g))return false;
if(pairsOf(g).some(function(p){return family(ctx,p[0],p[1]);}))return false;
if(!g.some(canBottom)|| !(loveShape(ctx,g)||sexShape(g,false)))return false;
return roll(ctx);
},
w:function(ctx){var g=ctx.present();return 4+g.reduce(function(s,c){return s+(c.flags.aphro||0);},0)/3;},
run:function(ctx,a,b){
var g=ctx.present(),sh=loveShape(ctx,g)||sexShape(g,false);
if(!sh)return null;
ctx.flags.trioHeat=true;
var hk=loveKind(ctx,g)||'aphro';
var sp=shape(ctx,sh.sg,sh.hubOnly),go=orderG(ctx,g,sh,sp,hk);
pairsOf(g).forEach(function(pr){var pf=ctx.pair(pr[0],pr[1]);pf.heatDone=true;if(okSex(pr[0],pr[1]))pf.night=true;ctx.mod2(pr[0],pr[1],{att:10,aff:4},{att:10,aff:4});});
var text=scene(ctx,go,hk,true,3,{sg:go,hubOnly:sh.hubOnly,sp:sp},true);
var why='三人の場面：'+(isLoveAny(hk)?KIND_WHY[hk]+'。':'')+'媚薬が三人に回っていた（'+g.map(function(c){return Math.round(c.flags.aphro||0);}).join('・')+'）'+infoWhy(ctx,sh);
if(ctx.flags.lastTrioTags&&ctx.flags.lastTrioTags.length){why+='／見所：'+ctx.flags.lastTrioTags.join('・');ctx.flags.lastTrioTags=null;}
return{text:text,why:why,mag:30,with:g.filter(function(c){return c!==a&&c!==b;})};
}
});
HK.addTo(EV,{
id:'trio',label:'三人でという条件に向き合う',cat:'romance',sex:true,scope:'pair',pri:true,
when:function(ctx,a,b){
if(!allowed(ctx)|| !ctx.flags.multiKnown||ctx.present().length<3|| !free(a)|| !free(b))return false;
if(ctx.flags.trioCur)return false;
if(ctx.present().length===3&&hasH(ctx)&& !roll(ctx))return false;
var pl=plan(ctx,a,b);
ctx._trioPlan=pl;
return!!pl;
},
w:function(ctx,a,b){var pl=plan(ctx,a,b);return pl?(0.6+pl.v*0.9)*(seqWaitAll(ctx,pl.g)?0.15:1):0;},
run:function(ctx,a,b){
var pl=plan(ctx,a,b);
if(!pl)return{text:ctx.t('{a}と{b}は、紙の但し書きをもう一度読んだ。',a,b)};
var g=pl.g;
var refuser=g.filter(function(c){return c.tr.cp>0.72&&A.eager(ctx,c)<0.35&&pl.kind!=='late'&& !isLoveAny(pl.kind);})[0];
if(refuser){
refuser.flags.trioNo=true;
g.forEach(function(c){if(c!==refuser)ctx.mod(refuser,c,{ten:6});});
return{cat:'conflict',text:ctx.t(ctx.pick(['{a}は「三人で、なんて絶対に無理｜三人で、というのは絶対に無理だ｜三人で、なんて絶対に無理です」と首を振った。話は、そこで終わった。','{a}は但し書きの紙を裏返して、「見なかったことにする｜＝｜見なかったことにします」と言った。','{a}「私は、するなら一人とだけ。それは譲れない｜私は、するなら一人とだけだ。それは譲れない｜私は、するなら一人とだけです。それは譲れません」']),refuser),why:refuser.name+'のCP（'+Math.round(refuser.eg.CP)+'）：三人でという形には頷けなかった',mag:12,with:g.filter(function(c){return c!==refuser;})};
}
var turn=isLoveAny(pl.kind)?'':g.filter(function(c){return c.flags.excl&& !c.flags.exclOpen;}).map(function(c){
c.flags.exclOpen=true;
var late=c.stress>70&&ctx.stepIndex>=ctx.stepsTotal*0.7;
return ctx.t(ctx.pick(late?['{a}は、「他の人とは無理｜他の人とは無理だ｜他の人とは無理です」と言った自分を思い出した。けれど、もう時間がなかった。','{a}は唇を噛んだ。最初の決め事より、ここを出ることの方が大事になっていた。']
:['{a}は、「相手は一人だけ」と言ったときのことを思い出した。あれから何時間も経って、気持ちは少しずつ変わっていた。','{a}は、自分で決めたはずの線を、もう一度見直していた。この部屋で過ごした時間が、それを書き換えていた。']),c);
}).join('');
ctx.flags.trioCur={g:g.map(function(c){return c.i;}),kind:pl.kind};
g.forEach(function(c){c.flags.partner=null;});
count(ctx,g);
pairsOf(g).forEach(function(pr){ctx.mod2(pr[0],pr[1],{att:8,aff:5,trust:4},{att:8,aff:5,trust:4});});
ctx.present().filter(function(o){return g.indexOf(o)<0;}).forEach(function(o){g.forEach(function(c){ctx.mod(o,c,{ten:3});});ctx.stress(o,5);});
var text=turn+scene(ctx,g,pl.kind,true,ctx.present().length);
var why='三人の場面：'+{loveclash:g[1].name+'と'+g[2].name+'はどちらも'+g[0].name+'の恋人で、どちらも'+g[0].name+'に執着していた。激しい取り合いになった',love:KIND_WHY.love,lovehub:g[0].name+'は'+g[1].name+'と'+g[2].name+'の両方と恋人（または友達以上恋人未満）で、'+g[1].name+'と'+g[2].name+'も仲がよい。円満な三人',hub:g[1].name+'と'+g[2].name+'がどちらも'+g[0].name+'に惹かれていた。'+g[0].name+'は選ばなかった',invite:g[1].name+'と'+g[2].name+'は、'+g[0].name+'を一人で残したくなかった',free:'三人とも積極的だった（'+g.map(function(c){return Math.round(A.eager(ctx,c)*100);}).join('・')+'）',late:'残り時間への焦り。三人なら一度で済む',warm:'三人とも、互いに打ち解けていた'}[pl.kind]+infoWhy(ctx,null)+'／但し書き：三人以上で同時なら全員分';
if(ctx.flags.lastTrioTags&&ctx.flags.lastTrioTags.length){why+='／見所：'+ctx.flags.lastTrioTags.join('・');ctx.flags.lastTrioTags=null;}
if(done3(ctx,g)){ctx.flags.trioCur=null;return T.exitGroup(ctx,g,text,why,hasH(ctx),pl.kind);}
return{text:text+progText(ctx,g)+'扉はまだ開かない。',why:why,mag:30,with:g.filter(function(c){return c!==a&&c!==b;})};
}
});
HK.addTo(EV,{
id:'trio_more',label:'三人で条件の回数を重ねる',cat:'romance',sex:true,scope:'solo',pri:true,
when:function(ctx,a){
var c=ctx.flags.trioCur;
if(!c)return false;
if(!c.g.every(function(i){return free(ctx.chars[i]);})){ctx.flags.trioCur=null;return false;}
return c.g.indexOf(a.i)>=0;
},
w:function(ctx){var c=ctx.flags.trioCur;return c&&seqWaitAll(ctx,c.g.map(function(i){return ctx.chars[i];}))?0.33:2.2;},
run:function(ctx,a){
var c=ctx.flags.trioCur,g=c.g.map(function(i){return ctx.chars[i];});
count(ctx,g);
var text=scene(ctx,g,c.kind,false);
if(done3(ctx,g)){ctx.flags.trioCur=null;return T.exitGroup(ctx,g,text,'三人で、条件の回数を重ねきった',hasH(ctx),c.kind);}
return{text:text+progText(ctx,g),why:'三人で条件を重ねていく',mag:12,with:g.filter(function(x){return x!==a;})};
}
});
['trio','trio_auto','trio_heat','trio_more'].forEach(function(id){
var e=EV.filter(function(x){return x.id===id;})[0];
if(!e||e._tp)return;
var run0=e.run;
e._tp=true;
e.run=function(ctx){
ctx.flags.lastTrioPairs=null;
var r=run0.apply(this,arguments);
if(r&&typeof r==='object'&&ctx.flags.lastTrioPairs)r.trioPairs=ctx.flags.lastTrioPairs;
ctx.flags.lastTrioPairs=null;
return r;
};
});
T.bond=function(ctx,g){
var ps=pairsOf(g),v=ps.map(function(pr){return Math.min(R(ctx,pr[0],pr[1]).aff+R(ctx,pr[0],pr[1]).att*0.6,R(ctx,pr[1],pr[0]).aff+R(ctx,pr[1],pr[0]).att*0.6);});
var mn=Math.min.apply(null,v),av=v.reduce(function(s,x){return s+x;},0)/v.length;
var ten=Math.max.apply(null,ps.map(function(pr){return Math.max(R(ctx,pr[0],pr[1]).ten,R(ctx,pr[1],pr[0]).ten);}));
if(av>55&&mn>30&&ten<40)return'marry';
if(av>32&&ten<55)return'secret';
if(ten>=55)return'jealous';
return'forget';
};
var LOVE_BOND=L('三人は部屋を出ると、自然に手を繋いだ。{a}が真ん中で、{b}と{c}が両側だった。帰り道、誰も「この先どうする」とは訊かなかった。答えは、もう三人とも知っていた。|部屋を出た夜、三人はいつもの部屋に帰って、同じ毛布にくるまった。{b}が「怖かった？｜怖かったか？｜怖かったですか？」と訊くと、{a}は首を振った。{c}が「三人だったから｜三人だったからだ｜三人でしたから」と代わりに答えた。|しばらくして、三人は揃いの指輪を作った。三人で恋人になったときから決めていたことを、あの白い部屋が少しだけ早めた。{a}は指輪を眺めながら、「次は、窓のある部屋がいい｜＝｜次は、窓のある部屋がいいです」と笑った。|三人の暮らしは、部屋を出たあとも何も変わらなかった。朝は{b}が珈琲を淹れ、{c}が寝坊し、{a}が二人を起こした。変わったのは、三人で笑う理由が一つ増えたことだけだった。');
var CLASH_BOND=L('部屋を出たあとも、{b}と{c}は{a}の両腕を一本ずつ離さなかった。どちらが{a}の隣を歩くかで、帰り道のあいだじゅう張り合っていた。{a}は困った顔で、それでも二人の手を握り返していた。|それからも三人は一緒にいた。{b}と{c}は相変わらず{a}を奪い合い、{a}はそのたびに二人の間に割って入った。誰も、三人をやめるとは言わなかった。|{a}の部屋には、歯ブラシが三本並ぶようになった。{b}と{c}は、どちらが{a}の隣で眠るかを毎晩のように争った。{a}は二人の真ん中で眠ることにして、争いを終わらせた。');
var HUB_BOND=L('部屋を出たあとも、三人の形は変わらなかった。{a}と{b}と{c}は、誰か一人が欠けることを、もう考えなかった。三人で過ごす夜は、それからも続いた。|三人は外に出ると、近くの店で朝ご飯を食べた。誰がどこに座るかで少しだけ揉めて、結局いつもの並びになった。あの部屋のことは、三人だけの思い出になった。|部屋を出た三人は、それからも同じように会い続けた。二人の恋人と、恋人を同じくする親友。名前のつけにくい関係だったが、三人ともそれを気に入っていた。');
T.BOND_LABEL={marry:'三人婚',secret:'三人だけの秘密の関係',jealous:'三人のうち一人が揺れている',forget:'なかったことにした'};
var BOND_TEXT={
marry:L('部屋を出てしばらくして、{a}・{b}・{c}は一緒に暮らし始めた。誰か一人を選ぶ必要は、もうなかった。|半年後、三人は揃いの指輪をはめていた。形のない約束だったが、三人にはそれで十分だった。|三人はそれからも、休みのたびに同じ部屋に集まった。いつの間にか、そこが三人の家になっていた。'),
secret:L('部屋を出たあとも、三人はときどき集まった。それが何という関係なのか、誰も名前をつけなかった。|三人のグループチャットは、外から見ればただの友達同士だった。夜にだけ、少しだけ違う会話が流れた。|それからも三人は、月に一度だけ同じ店で落ち合った。誰が誘うでもなく、その日はいつも空けてあった。|部屋を出たあと、{a}の手帳には、三人だけに通じる小さな印のついた日が、ときどき増えた。|その後、外で顔を合わせても、三人は何でもない話しかしなかった。それでも別れ際、{b}は必ず「またね｜また会おう｜また会いましょう」と言った。'),
jealous:L('部屋を出たあと、{a}は二人が並んで歩く背中を、少しだけ寂しそうに見ていた。三人の形は、まだ定まっていなかった。|三人はそれからも会ったが、誰か一人が先に帰る夜が増えていった。|部屋を出たあと、{a}は、二人から届く連絡に少しずつ返事が遅れるようになった。三人でいるときより、一人の夜のほうが長く感じた。'),
forget:L('部屋を出た三人は、あの部屋でのことを一度も口にしなかった。それが、三人の出した答えだった。|三人は外で別れるとき、「じゃあ、また｜では、また｜では、またお会いしましょう」とだけ言った。また、があるのかは分からなかった。|部屋を出た三人は、駅で別れた。誰も振り返らなかったが、誰も連絡先を消してはいなかった。|その後、{a}は、あの部屋でのことを「夢だった」ということにした。{b}と{c}も、何も言わずにそれに合わせた。')
};
function loveBoth(ctx,x,y){return HK.canLove(x,y)&&HK.canLove(y,x)&& !(HK.Poly&&HK.Poly.faithBlocked&&HK.Poly.faithBlocked(ctx,x,y));}
function marryOk(ctx,g){
if(HK.Poly&&HK.Poly.mode&&HK.Poly.mode(ctx)==='none')return false;
return g.some(function(h){return g.every(function(o){return o===h||loveBoth(ctx,h,o);});});
}
scen.finish=function(ctx){
finish0(ctx);
(ctx.flags.trios||[]).forEach(function(ex){
var g=ex.group.map(function(i){return ctx.chars[i];});
var bd=T.bond(ctx,g),lv=ex.kind==='love'&&harmony(ctx,g),lh=ex.kind==='lovehub'&&harmony(ctx,g),lc=ex.kind==='loveclash'&&harmony(ctx,g);
if(lv&&bd!=='jealous')bd='marry';
if(lh&&bd==='forget')bd='secret';
if(bd==='marry'&& !lv&& !lh&& !marryOk(ctx,g))bd='secret';
ex.bond=bd;ex.bondLabel=T.BOND_LABEL[bd];
if(HK.Poly&&(lv||lh)&&bd!=='jealous')HK.Poly.register(ctx,g,lh?(harmonyOf(ctx,g)||{}).hub:null);
var lone=bd==='jealous'?g.slice().sort(function(p,q){var s=function(c){return g.reduce(function(t,o){return o===c?t:t+R(ctx,o,c).aff;},0);};return s(p)-s(q);})[0]:g[0];
var cw=lc?clashOf(ctx,g):null;
if(cw)lone=cw.w;
var order=[lone].concat(g.filter(function(c){return c!==lone;}));
g.forEach(function(c){c.fateNote+='。その後は「'+ex.bondLabel+'」';});
ctx.say({kind:'event',cat:'romance',actors:g,text:ctx.t(ctx.pick(lc?CLASH_BOND:lv&&bd==='marry'?LOVE_BOND:lh&&bd!=='jealous'?HUB_BOND:BOND_TEXT[bd]),order[0],order[1],order[2]||order[1]),why:'部屋を出たあとの三人：'+(lc?'二人の恋人が同じ一人を取り合う三人だった。':lv?'三人とも恋人どうしで、円満だった。':lh?'中心のある円満な三人だった。':'')+'三人のあいだの好意と緊張から',mag:20});
});
};
})();
});
;
/* ==== js/room-left.js ==== */
HK.Load.def(74,'js/room-left.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK)return;
function L(s){return s.split('|');}
function nm(list){return list.map(function(c){return c.name;}).join('・');}
function fill(t,o){return String(t).replace(/\{(\w+)\}/g,function(m,k){return o[k]!=null?o[k]:m;});}
function pk(ctx,arr,U){
var k=Math.floor(ctx.rng()*arr.length)%arr.length;
if(U){for(var d=0;d<arr.length;d++)if(!U[arr[(k+d)%arr.length]]){k=(k+d)%arr.length;break;}U[arr[k]]=1;}
return arr[k];
}
function att(c){return HK.Emo&&HK.Emo.att?HK.Emo.att(c):'gentle';}
function mood(c){return HK.Emo&&HK.Emo.mood?HK.Emo.mood(c):'calm';}
function bump(ctx,c,d,why){if(HK.Emo&&HK.Emo.bump)HK.Emo.bump(ctx,c,d,why);}
function ties(ctx,a,b){return HK.Ties?HK.Ties.all(ctx,a,b):[];}
function tieFrom(ctx,a,b,re){return ties(ctx,a,b).some(function(t){return re.test(t.type)&&(!HK.TIES[t.type]|| !HK.TIES[t.type].dir||t.a===a.i);});}
function love2(a,b){return HK.canLove(a,b)&&HK.canLove(b,a);}
function hate(ctx,a,b){return HK.HateKit?HK.HateKit.level(ctx,a,b):0;}
function obs(ctx,a,b){return HK.Obsess&&HK.Obsess.level?HK.Obsess.level(ctx,a,b):0;}
function darkOn(ctx){return HK.Dark?HK.Dark.on(ctx):'normal';}
var T={};
T.alone={
proud:L('{a}は扉の前に腰を下ろし、「出してくれと頼むつもりはない」と誰にともなく言った。|{a}は白い壁を拳で一度だけ叩いて、それきり叩かなかった。負けを認めたくなかった。|{a}は部屋のまんなかで胡座をかき、「この部屋のほうが先に音を上げる」と言い張った。'),
stern:L('{a}は残った食べ物を数え直し、一日に食べる量を決めた。|{a}は壁に爪で線を引き、過ぎた時間を数えはじめた。|{a}は眠る時間と起きる時間を決めて、決めたとおりに過ごした。そうしていないと、崩れそうだった。'),
tsun:L('{a}は「別に、一人のほうが気楽だし」と言って、毛布を頭までかぶった。|{a}は閉じた扉に向かって「戻ってこなくていいから」と言い、それから長いこと黙った。|{a}は誰もいない部屋で、「寂しくなんかない」と二度言った。'),
gentle:L('{a}は空になった部屋を見回して、「静かだね」と小さく笑った。|{a}は出ていった人たちが無事に帰れたことを、扉に向かって祈った。|{a}はベッドの端に座り、外の天気を想像して時間をやり過ごした。'),
devoted:L('{a}は「みんな、ちゃんと帰れたかな」とそればかり気にしていた。自分のことは、あとまわしだった。|{a}は散らかった部屋を片づけて、誰かがいつ戻ってきてもいいようにした。|{a}は出ていった人の名前を、一人ずつ数えるように呼んだ。'),
cool:L('{a}は扉と壁の継ぎ目を、端から順に調べなおした。感傷にひたる時間は、もったいなかった。|{a}は「条件を満たせる相手がいない以上、待つしかない」と短くまとめ、目を閉じた。|{a}は扉の紙を読み返し、まだ読み落としがないかを確かめ続けた。'),
free:L('{a}は「貸し切りだ」と笑って、ベッドの上で大の字になった。笑い声は、すぐに途切れた。|{a}は壁に落書きをはじめた。扉の紙の横に、出ていった人たちの似顔絵が並んだ。|{a}はしりとりの相手がいないことに気づいて、一人で続けた。'),
shy:L('{a}は部屋の隅で膝を抱え、物音がするたびに扉を見た。|{a}は誰もいない部屋で、ようやく声を出して泣いた。|{a}は小さな声で、出ていった人たちに言えなかったことを一つずつ口にした。'),
polite:L('{a}は乱れた毛布を丁寧にたたみ直し、背筋を伸ばして扉の前に座った。|{a}は「待つのは、慣れておりますから」と、誰にともなく微笑んだ。|{a}は時間を決めて食事をとり、きちんと手を合わせた。それが{a}の保ち方だった。')
};
T.aloneWith={
proud:L('{a}は「どうせすぐ開く」と言い張り、扉の前の場所を誰にも譲らなかった。|{a}は弱音を吐く者がいれば鼻で笑った。いちばん吐きたかったのは、{a}自身だった。|{a}は壁にもたれて腕を組み、残った顔ぶれを見渡した。「泣き言は聞かないからな」'),
stern:L('{a}は残った食べ物を人数分に分け、一日に食べる量を決めた。|{a}は壁に爪で線を引き、過ぎた時間を数えはじめた。|{a}は眠る順番と見張りの順番を決めて、決めたとおりに守らせた。'),
tsun:L('{a}は「別に、心細くなんかないし」と言いながら、誰かの隣から離れなかった。|{a}は毛布を頭までかぶって、「寝る」とだけ言った。毛布の中から、ときどき鼻をすする音がした。|{a}は閉じた扉に向かって「戻ってこなくていいから」と言い、それから長いこと黙った。'),
gentle:L('{a}は「大丈夫、きっと誰か来るよ」と、残った人たちに笑いかけた。|{a}は出ていった人たちが無事に帰れたことを、扉に向かって祈った。|{a}はベッドの端に座り、外の天気の話をして時間をやり過ごした。'),
devoted:L('{a}は自分の分の水を、隣の人の前にそっと置いた。|{a}は眠れない人の背中を、朝までさすっていた。|{a}は「先に出た人たち、ちゃんと帰れたかな」とそればかり気にしていた。'),
cool:L('{a}は扉と壁の継ぎ目を、端から順に調べなおした。感傷にひたる時間は、もったいなかった。|{a}は「条件を満たせる組がない以上、待つしかない」と短くまとめ、目を閉じた。|{a}は扉の紙を読み返し、まだ読み落としがないかを確かめ続けた。'),
free:L('{a}は「延長戦だ」と笑って、ベッドの上で大の字になった。笑い声は、すぐに途切れた。|{a}は壁に落書きをはじめた。扉の紙の横に、出ていった人たちの似顔絵が並んだ。|{a}はしりとりを始めた。三周目で、答える声がなくなった。'),
shy:L('{a}は部屋の隅で膝を抱え、物音がするたびに扉を見た。|{a}は毛布の中で、声を殺して泣いた。|{a}は小さな声で、出ていった人たちに言えなかったことを一つずつ口にした。'),
polite:L('{a}は乱れた毛布を丁寧にたたみ直し、背筋を伸ばして扉の前に座った。|{a}は「お互い、気を落とさずにまいりましょう」と、残った人たちに微笑んだ。|{a}は時間を決めて食事をとり、きちんと手を合わせた。それが{a}の保ち方だった。')
};
T.aloneMood={
grief:L('ときどき、{a}の肩が小さく震えた。|{a}の目元は、ずっと赤いままだった。|{a}は思い出したように泣いて、泣き疲れて眠った。'),
anger:L('{a}の胸の中では、置いていかれた悔しさがまだ燃えていた。|{a}は閉じた扉を睨みつけ、出ていった人の名前を噛みしめた。|{a}は壁を蹴りかけて、やめた。怒りの行き場はなかった。'),
fear:L('照明が落ちるたびに、{a}は息を詰めた。|{a}は自分の呼吸の音さえ怖がるようになった。|{a}は扉に背中をつけて眠った。そうしないと眠れなかった。'),
calm:L('白い部屋の時間は、音もなく過ぎていった。|{a}の息づかいは、思ったより落ち着いていた。部屋で過ごした時間は、悪いものばかりではなかった。|扉の紙の文字は、変わらずそこにあった。{a}はそれを、もう読まなかった。')
};
T.aloneGroup={
friend:L('{L}は、残った食べ物を等分に分けあって、交代で眠った。一人きりでないことが、せめてもの救いだった。|{a}と{b}は背中を合わせて座り、知っている歌を順番にうたった。|{L}は昔話を一つずつ披露しあった。笑い声が、ときどき白い壁に跳ね返った。'),
awk:L('扉の紙の条件を、{a}と{b}はどうしても満たせなかった。二人とも、相手に身を任せる側にはなれなかった。ベッドの両端に座ったまま、気まずい時間だけが流れた。|{a}と{b}は「どっちも譲らないなら、仕方ない｜どちらも譲らないなら、仕方ない｜どちらも譲らないなら、仕方ありません」と苦笑した。どちらも攻めたい側で、そこだけはどうにもならなかった。|{a}と{b}は、条件の話を避けるようになった。目が合うと、どちらからともなく扉の紙を見た。'),
enemy:L('{a}と{b}は、部屋の対角線のいちばん遠いところに陣取った。狭い部屋で、それが精いっぱいの距離だった。|{a}と{b}は口をきかなかった。差し入れの箱を開けるときだけ、相手の手の位置を睨んだ。|{a}が何か言えば、{b}が言い返した。白い部屋に、言い争いの声だけが響いた。'),
plain:L('{L}は、互いの名前のほかはほとんど何も知らないまま、同じ壁にもたれて時間をやり過ごした。|{L}は、ぽつりぽつりと身の上話をした。話が尽きると、また黙った。|{L}は交代で扉を調べ、交代で眠った。誰が言い出したわけでもなかった。')
};
T.method=L(
'{r}は白い部屋のことを何日も調べた。古い掲示板の書き込みをたどって、扉の外側にある小さな操作盤と、そこに打ち込む番号を突き止めた。|'+
'{r}は、扉の紙と同じ紙を扱う業者を探し当てた。問い詰めて聞き出したのは、外から鍵を外す手順だった。|'+
'{r}は、外へ出るときに見た廊下の配電盤を覚えていた。白い部屋の照明と鍵は、同じ線でつながっていた。{r}はその線を、迷わず切った。|'+
'{r}は、同じ部屋から戻った人を探して話を聞いて回った。「外の紙に、条件を満たしたと書き込めばいい」――半信半疑で書き込んだ文字に、扉は応えた。|'+
'{r}は扉の外側の壁に、内側と同じ紙が貼られているのを見つけた。条件の欄の下に小さく「外からは、名前を呼べば開く」とあった。{r}は、中にいる人の名前を呼んだ。'
);
T.reunion={
lover:L('扉が開いた瞬間、{x}は{r}の腕の中に飛び込んでいた。{r}「遅くなって、ごめん｜遅くなって、すまない｜遅くなって、ごめんなさい」――{x}は首を振るだけで、声にならなかった。|{r}は部屋に踏み込むなり、{x}を強く抱きしめた。「一人にして、ごめん。もう離れないから｜一人にして、すまない。もう離れない｜一人にして、ごめんなさい。もう離れませんから」|{x}が顔を上げると、{r}が息を切らして立っていた。{r}「迎えに来た｜＝｜迎えに来ました」――二人は額を合わせて、しばらく動かなかった。'),
crush:L('{r}は{x}の前で立ち止まり、言いかけた言葉を一度飲み込んだ。「……{x}を置いてきたこと、ずっと後悔してた｜……{x}を置いてきたことを、ずっと後悔していた｜……{x}を置いてきたこと、ずっと後悔していました」|{r}「あの部屋を出てから、{x}のことばかり考えてた｜あの部屋を出てから、{x}のことばかり考えていた｜あの部屋を出てから、{x}のことばかり考えていました」――{x}は驚いた顔で、それでも差し出された手を取った。|{r}は照れ隠しのように「たまたま方法を見つけただけ｜たまたま方法を見つけただけだ｜たまたま方法を見つけただけです」と言った。{x}には、それが嘘だとすぐに分かった。'),
obsess:L('{r}は{x}の手首を掴んで、部屋の外へ引き出した。「もう二度と、離さない。どこにも行かせない｜＝｜もう二度と、離しません。どこにも行かせません」|{r}は{x}の顔をじっと見つめ、「迎えに来られるのは、私だけだった｜＝｜迎えに来られるのは、私だけでした」と微笑んだ。その指は、{x}の手を痛いほど握っていた。|{r}「{x}がいない外の世界なんて、意味がなかった｜{x}がいない外の世界など、意味がなかった｜{x}がいない外の世界なんて、意味がありませんでした」――{r}は{x}の肩を抱き寄せ、もう放すつもりはなかった。'),
friend:L('{r}「待たせた！｜＝｜お待たせしました！」――扉の向こうから聞き慣れた声がして、{x}は思わず笑った。泣き笑いだった。|{r}は{x}の背中を何度も叩いた。「一人で残すわけないだろ｜一人で残すわけがないだろう｜一人で残すわけがないでしょう」|{r}は扉を押さえたまま手を伸ばした。{x}がその手を掴むと、{r}は「約束どおり｜約束どおりだ｜約束どおりです」とだけ言った。')
};
T.friendEnd=L('{L}は{r}に手を引かれて、白い部屋を出た。振り返ると、扉はもうただの壁になっていた。|外の空気は、思ったより温かかった。{L}は{r}に何度も礼を言い、{r}は照れくさそうに頭をかいた。|廊下の先には、ちゃんと出口があった。{L}は{r}と並んで、外の光の中へ歩き出した。');
T.rescueOpen={
report:L('数日後、扉の向こうが騒がしくなった。{O}の届け出を受けた救助隊が、ついに白い部屋を見つけ出したのだ。扉は外側から焼き切られた。|部屋を出た{O}の証言をもとに、警察が建物を捜索していた。重い音がして、扉が外からこじ開けられた。|「誰かいますか！」――扉の向こうから知らない声がした。{O}が伝えた場所を、救助隊がしらみつぶしに探していたのだった。'),
none:L('数日後、扉の向こうで足音がした。行方不明の届け出を受けた警察が、白い部屋にたどり着いたのだ。扉は外から焼き切られた。|突然、扉の外で金属を削る音がした。救助隊が、何日もかけてこの部屋を探し当てたのだった。|壁の向こうで、犬の吠える声がした。捜索隊の照明が、扉の隙間から差し込んだ。')
};
T.joy={
proud:L('{a}は救助隊員の手を借りずに立ち上がり、「遅い」と言った。その声は、少しだけ震えていた。|{a}は胸を張って部屋を出た。外に出たとたん、膝から力が抜けた。|{a}は「待ってやってたんだ」と言い張りながら、毛布を受け取った。'),
stern:L('{a}は救助隊員に、閉じ込められていた時間と残りの食料を正確に伝えた。報告を終えると、ようやく深く息を吐いた。|{a}は一礼して部屋を出た。外の光に目を細め、しばらく動けなかった。|{a}は差し出された水を一口飲んで、「助かりました」とだけ言った。'),
tsun:L('{a}は「べ、別に、もう少しで自分で出られたし」と言いながら、救助隊員の袖を離さなかった。|{a}はそっぽを向いたまま毛布にくるまり、誰にも見えないように涙を拭った。|{a}は「来るのが遅いんだけど」と文句を言った。顔は、ぐしゃぐしゃに笑っていた。'),
gentle:L('{a}は救助隊員の顔を見るなり、「来てくださって、ありがとう」と何度も頭を下げた。|{a}は外の空気を吸い込んで、「帰れるんだね」と泣きながら笑った。|{a}は救助隊員の手を握って、しばらく離さなかった。'),
devoted:L('{a}は自分のことより先に、「先に出た人たちは無事ですか」と尋ねた。無事だと聞くと、その場に座り込んだ。|{a}は救助隊員に深く頭を下げ、「本当に、本当にありがとうございます」と繰り返した。|{a}は毛布を受け取ると、まず隣にいた人の肩にかけた。'),
cool:L('{a}は救助隊員に状況を短く説明し、それから、誰にも聞こえない声で「助かった」とつぶやいた。|{a}は外の時計を見て、閉じ込められていた時間を確かめた。手が、少しだけ震えていた。|{a}は表情を変えずに部屋を出た。救急車の中で、ようやく目を閉じた。'),
free:L('{a}は「出られた！」と叫んで、救助隊員に抱きついた。隊員は困った顔で、それでも背中を叩いてくれた。|{a}は部屋を飛び出して、外の空に向かって大声で笑った。|{a}は「まずはラーメン！」と言って、救助隊員を笑わせた。'),
shy:L('{a}は声も出せずに泣きだした。救助隊員が毛布をかけてくれるまで、震えが止まらなかった。|{a}は救助隊員の後ろに隠れるようにして、そっと部屋を出た。外の光が、まぶしかった。|{a}は小さな声で「ありがとう」と言った。三度目で、ようやく隊員に届いた。'),
polite:L('{a}は乱れた服を整えてから、救助隊員に深々と頭を下げた。「お手数をおかけしました」|{a}は「ご迷惑をおかけしました」と丁寧に礼を述べた。それから、こらえきれずに涙をこぼした。|{a}は背筋を伸ばして部屋を出た。外に出たところで、ようやく小さく息をついた。')
};
T.rescueEnd=L('{L}は救急車に乗せられ、白い部屋のある建物をあとにした。|{L}は毛布にくるまって、夜明け前の街を見た。どこにでもある、見覚えのある景色だった。|{L}が振り返ると、白い部屋の扉は、立ち入り禁止の黄色いテープで覆われていた。');
T.vow={
hate:L('{a}は救急車の窓から街を見ながら、{b}の顔を思い浮かべた。「……借りは、必ず返す｜＝｜……借りは、必ず返します」|毛布にくるまった{a}は、小さな声で言った。「{b}のことは、絶対に許さない。どこにいても、見つけ出す｜＝｜{b}のことは、絶対に許しません。どこにいても、見つけ出します」|{a}は救助隊員に{b}の名前を尋ねられ、「覚えておいて｜覚えておけ｜覚えておいてください」とだけ答えた。その目は笑っていなかった。'),
obsess:L('{a}は外の光の中で、まっさきに{b}の姿を探した。いなかった。「……いいよ。今度は、私が迎えに行くから｜……いい。今度は、私が迎えに行く｜……いいですよ。今度は、私が迎えに行きますから」|{a}は{b}の名前を、何度も口の中で繰り返した。「どこに行っても、必ず見つける。もう二度と、離れない｜＝｜どこに行っても、必ず見つけます。もう二度と、離れません」|{a}は救急車の中で、{b}のことだけを考えていた。「待っててね。すぐに会いに行く｜待っていろ。すぐに会いに行く｜待っていてくださいね。すぐに会いに行きます」'),
lovehate:L('{a}は{b}の出ていった扉を思い出し、唇を噛んだ。「好きだった。だから、置いていったことは許さない｜＝｜好きでした。だから、置いていったことは許しません」|{a}「{b}に会ったら、まず一発殴る。それから……それから、のことは、そのとき考える｜＝｜{b}に会ったら、まず一発殴ります。それから……それから、のことは、そのとき考えます」|{a}は{b}への想いと恨みを、どちらも捨てられないまま外に出た。「必ず、もう一度会う｜＝｜必ず、もう一度会います」'),
abandon:L('{a}は、自分を置いて出ていった{b}の背中を忘れていなかった。「あのときの顔、一生覚えてるから｜あのときの顔は、一生覚えている｜あのときの顔、一生覚えていますから」|{a}は「{b}は、振り返りもしなかった｜＝｜{b}は、振り返りもしませんでした」とだけ言って、拳を握った。「次に会ったら、ただじゃおかない｜次に会ったら、ただではおかない｜次に会ったら、ただではおきません」|{a}は外に出ると、まず{b}の連絡先を探した。礼を言うためでは、なかった。')
};
T.loopOpen=L('突然、鍵の外れる音が響いた。条件は満たしていない。それでも扉は、細く開いていた。{L}は迷わず飛び出した。|照明が一度だけまたたき、扉がひとりでに開いた。{L}は考えるより先に、外の廊下へ駆け出していた。|がちゃり、と音がして、扉が開いた。{L}は振り返らずに、白い廊下を走った。');
T.loopHall=L('廊下はまっすぐで、どこまでも白かった。突き当たりの扉を押し開けると――そこは、白い部屋だった。扉には一枚の紙。見覚えのある文字が並んでいた。|走っても走っても、廊下の景色は変わらなかった。ようやく見つけた扉の先には、ベッドと、テーブルと、条件の紙。最初に目を覚ましたときと、何もかも同じ部屋だった。|角を曲がると、扉が一つだけあった。開けると、白い部屋だった。壁の時計は、目覚めたときと同じ時刻を指していた。');
T.loopReact={
proud:L('{a}は「冗談だろ」と笑おうとして、笑えなかった。|{a}は扉の紙を引き剥がそうとして、手を止めた。紙には、まだ誰も触れた跡がなかった。|{a}は「何度でもやってやる」と言った。その声は、白い壁に吸い込まれた。'),
stern:L('{a}は壁を見た。自分で刻んだはずの線は、一本も残っていなかった。|{a}は時計を見つめたまま、数え直すべきものが何なのか分からなくなった。|{a}は深呼吸をして、規則正しく、最初の一時間を数えはじめた。'),
tsun:L('{a}は「……は？」とだけ言って、その場にへたりこんだ。|{a}は「こんなの、ぜんぜん怖くないし」と言った。声が、裏返っていた。|{a}は扉の紙を睨みつけた。紙は、何も言い返さなかった。'),
gentle:L('{a}は小さく笑った。「……また、はじめからだね」|{a}はベッドの端に座り、何も言わずに扉の紙を見つめた。|{a}は「夢、だったのかな」とつぶやいた。答える人はいなかった。'),
devoted:L('{a}はとっさに、出ていった人たちの名前を呼んだ。返事はなかった。|{a}は「みんなは、ちゃんと外に出られたよね」と自分に言い聞かせた。|{a}は部屋を見回して、誰かの忘れ物を探した。何も、なかった。'),
cool:L('{a}は「記憶の混乱か、部屋の仕掛けか」と冷静に言った。手のひらは、汗で濡れていた。|{a}は扉の紙を一字ずつ読み、前と同じだと確かめてから、目を閉じた。|{a}は廊下の距離を思い出そうとした。何歩走ったのか、どうしても思い出せなかった。'),
free:L('{a}は「おかわり、ってこと？」と笑った。笑い声だけが、いつまでも響いていた。|{a}はベッドに飛び込んで、「二周目は上手くやるから」と言った。|{a}は扉に向かって「もう一回！」と叫んだ。扉は、静かに閉まっていた。'),
shy:L('{a}は声も出せずに、扉の前で立ち尽くした。|{a}は部屋の隅で膝を抱え、目を閉じた。開けたら、何かが変わっている気がした。|{a}は震える手で、扉の紙に触れた。紙は、まだ新しかった。'),
polite:L('{a}は「……失礼しました」と小さく言って、白い部屋に戻った。誰に謝ったのかは、{a}にも分からなかった。|{a}は乱れた息を整え、いつものように背筋を伸ばした。それしか、できることがなかった。|{a}は丁寧に扉を閉めた。閉める必要は、なかったのかもしれない。')
};
T.loopEnd=L('扉の紙の文字が、ゆっくりと浮かび上がった。白い部屋の、最初の一時間がはじまる。|どこかで、鍵のかかる音がした。白い部屋は、何事もなかったかのように静まり返っていた。|照明が、目覚めたときと同じ明るさに戻った。――最初から、だろうか。');
T.after={
alone:L('{a}がその後どうなったのかを、知る人はいない。白い部屋の扉は、今も閉じたままだという。|{a}のいた白い部屋の話は、いつのまにか噂話のひとつになった。|{a}はまだ、あの白い部屋で扉が開くのを待っているのかもしれない。'),
loop:L('{a}の姿を、外で見た人はいない。ただ、白い部屋の夢を見たという人の話に、ときどき{a}の名前が出てくる。|{a}は今も、白い部屋の最初の一時間にいるのかもしれない。|{a}がその後どうなったのかは、誰にも分からない。扉の紙だけが、変わらずそこにある。')
};
var TITLE={alone:'最後まで部屋に残った',friend:'仲の良い人が助けに来た',rescue:'救助隊に助け出された',loop:'白い部屋に戻った（？）'};
function insideOf(ctx){
return ctx.chars.filter(function(c){
if(c.alive===false||c.out||c.gone||c.taken)return false;
var f=c.flags||{};
return f.caged==null&&f.cagePair==null;
});
}
function outsideOf(ctx){return ctx.chars.filter(function(c){return c.alive!==false&&c.out&& /脱出/.test(c.fate||'');});}
function bondOf(ctx,o,x){
if(hate(ctx,o,x)>=45)return null;
var pf=ctx.pair(o,x),r=ctx.R(o,x);
if((pf.couple||tieFrom(ctx,o,x,/^(?:lover|spouse|mate|fated)$/))&&love2(o,x))return{k:'lover',s:100};
if(obs(ctx,o,x)>=35||(HK.Obsess&&HK.Obsess.yanTie&&HK.Obsess.yanTie(ctx,o,x)))return{k:'obsess',s:90};
if(tieFrom(ctx,o,x,/^(?:honmei|crush)$/)&&HK.canLove(o,x))return{k:'crush',s:80};
if(tieFrom(ctx,o,x,/^(?:best|buddy|childhood|sibclose|sibling|sibprot|parent|pparent|mentor|master|benefactor)$/))return{k:'friend',s:70};
if(r.aff>=45&&r.trust>=25)return{k:r.att>=50&&love2(o,x)?'crush':'friend',s:40+Math.min(40,r.aff-45+r.trust/3)};
return null;
}
function vowOf(ctx,x,o){
var r=ctx.R(x,o),hl=hate(ctx,x,o);
var grab=(ctx.flags.exits||[]).some(function(e){return e.how==='grab'&&e.a===o.i;});
if(obs(ctx,x,o)>=35)return'obsess';
if((tieFrom(ctx,x,o,/^ex$/)||r.att>=40)&&hl>=30)return'lovehate';
if(hl>=50||tieFrom(ctx,x,o,/^enemy$/))return'hate';
if(grab&&r.trust<0)return'abandon';
return null;
}
var RL=HK.RoomLeft={T:T,TITLE:TITLE};
RL.decide=function(ctx){
ctx.flags.roomLeft=null;
var inside=insideOf(ctx);
if(!inside.length)return null;
var outs=outsideOf(ctx),dk=darkOn(ctx);
var best=null;
outs.forEach(function(o){inside.forEach(function(x){var b=bondOf(ctx,o,x);if(b&&(!best||b.s>best.s))best={r:o,x:x,k:b.k,s:b.s};});});
var stress=inside.reduce(function(t,c){return t+(c.stress||0);},0)/inside.length;
var uncanny=dk==='mild'?0.4:dk==='dark'?1.6:1;
var W={
alone:40*(1+stress/250)*(inside.length===1?1.1:1),
rescue:38*(outs.length?1.25:1)*(inside.some(function(c){return c.flags&&c.flags.knocked;})?1.2:1),
friend:best?55*best.s/100:0,
loop:10*uncanny
};
var tot=0,k;
for(k in W)tot+=W[k];
var x=ctx.rng()*tot,id='alone';
for(k in W){x-=W[k];if(x<0){id=k;break;}}
var o={id:id,title:TITLE[id],who:inside.map(function(c){return c.i;}),outs:outs.map(function(c){return c.i;}),by:[],vows:[],stayed:inside.filter(function(c){return c.flags&&c.flags.stayed;}).map(function(c){return c.i;}),rescued:id==='friend'||id==='rescue',cand:best?best.k:''};
if(id==='friend'){o.by=[best.r.i];o.to=best.x.i;o.bond=best.k;}
ctx.flags.roomLeft=o;
return o;
};
function persons(ctx,L0,key,U){
var out=[];
L0.slice(0,3).forEach(function(c){out.push(fill(pk(ctx,T[key][att(c)]||T[key].gentle,U),{a:c.name}));});
return out.join('');
}
function groupKind(ctx,a,b){
if(hate(ctx,a,b)>=50||hate(ctx,b,a)>=50)return'enemy';
if(!HK.SAFE_ON&&(ctx.rules||[]).some(function(r){return r.k==='h';})&&HK.Pos&&HK.Pos.clash&&HK.Pos.clash(a,b)&&HK.Pos.hardTop(a,b)&&HK.Pos.hardTop(b,a))return'awk';
var r1=ctx.R(a,b),r2=ctx.R(b,a);
if((r1.aff+r2.aff)/2>=25)return'friend';
return'plain';
}
function moodKey(c){var m=mood(c);return T.aloneMood[m]?m:'calm';}
RL.write=function(ctx){
var o=ctx.flags.roomLeft;
if(!o)return;
var C=ctx.chars,G=o.who.map(function(i){return C[i];}).filter(function(c){return c&&c.alive!==false&& !c.out;});
if(!G.length){ctx.flags.roomLeft=null;return;}
o.who=G.map(function(c){return c.i;});
var LN=nm(G),outs=o.outs.map(function(i){return C[i];}),parts=[],actors=G.slice(),why='',U={};
if(o.id==='alone'){
if(G.length>=2){
var a=G[0],b=G[1];
for(var i=0;i<G.length;i++)for(var j=i+1;j<G.length;j++){var gk0=groupKind(ctx,G[i],G[j]);if(gk0==='awk'||gk0==='enemy'){a=G[i];b=G[j];}}
var gk=groupKind(ctx,a,b);
parts.push(fill(pk(ctx,T.aloneGroup[gk]),{L:LN,a:a.name,b:b.name}));
why='残った人どうしの仲（'+{friend:'仲がいい',awk:'攻め×攻めで条件を満たせない',enemy:'敵視している',plain:'親しくない'}[gk]+'）';
}
G.slice(0,3).forEach(function(c){
var mk=moodKey(c);
var TA=G.length>1?T.aloneWith:T.alone;
parts.push(fill(pk(ctx,TA[att(c)]||TA.gentle,U),{a:c.name})+fill(pk(ctx,T.aloneMood[mk],U),{a:c.name}));
bump(ctx,c,mk==='anger'?{anger:8,grief:10}:{grief:18,fear:8},'部屋に取り残された');
});
why='結末：取り残された人の結末（孤独）'+(why?'／'+why:'')+'／気分：'+G.slice(0,3).map(function(c){return c.name+((HK.Emo&&HK.Emo.NAME)?HK.Emo.NAME[moodKey(c)]:'');}).join('・');
}else if(o.id==='friend'){
var r=C[o.by[0]],x=C[o.to];
parts.push('部屋を出たあと、'+fill(pk(ctx,T.method),{r:r.name}));
parts.push(fill(pk(ctx,T.reunion[o.bond]||T.reunion.friend),{r:r.name,x:x.name}));
parts.push(fill(pk(ctx,T.friendEnd),{L:LN,r:r.name}));
actors=[r].concat(G);
G.forEach(function(c){bump(ctx,c,{joy:c===x?45:30,fear: -30,grief: -15},r.name+'が助けに来た');});
bump(ctx,r,{joy:30},x.name+'を助け出した');
ctx.mod2(r,x,{trust:15,aff:10},{trust:20,aff:15});
why='結末：取り残された人の結末（'+r.name+'が助けに来た）／'+r.name+'から'+x.name+'への'+{lover:'恋人としての想い',crush:'想い',obsess:'執着',friend:'友情・絆'}[o.bond];
}else if(o.id==='rescue'){
parts.push(fill(pk(ctx,outs.length?T.rescueOpen.report:T.rescueOpen.none),{L:LN,O:nm(outs.slice(0,3))}));
parts.push(persons(ctx,G,'joy',U));
G.forEach(function(c){bump(ctx,c,{joy:40,fear: -30},'救助隊が来た');});
var pv=Math.min(1,0.85*(HK.Dark?HK.Dark.f(ctx,'spite'):1));
G.forEach(function(c){
if(o.vows.length>=2)return;
var best=null;
outs.forEach(function(t){var k=vowOf(ctx,c,t);if(k&& !best)best={t:t,k:k};});
if(!best||ctx.rng()>=pv)return;
o.vows.push({a:c.i,b:best.t.i,k:best.k});
parts.push(fill(pk(ctx,T.vow[best.k]),{a:c.name,b:best.t.name}));
bump(ctx,c,best.k==='obsess'?{anger:10,joy:5}:{anger:30},best.t.name+'への誓い');
});
parts.push(fill(pk(ctx,T.rescueEnd),{L:LN}));
why='結末：取り残された人の結末（救助隊）'+(o.vows.length?'／'+o.vows.map(function(v){return C[v.a].name+'から'+C[v.b].name+'へ：'+{hate:'敵視',obsess:'執着',lovehate:'愛憎',abandon:'置いていかれた恨み'}[v.k];}).join('、'):'');
}else{
parts.push(fill(pk(ctx,T.loopOpen),{L:LN}));
parts.push(pk(ctx,T.loopHall));
parts.push(persons(ctx,G,'loopReact',U));
parts.push(pk(ctx,T.loopEnd));
G.forEach(function(c){bump(ctx,c,{fear:35},'白い部屋に戻った');});
why='結末：取り残された人の結末（ループ）';
}
G.forEach(function(c){
var st=o.stayed.indexOf(c.i)>=0;
if(o.id==='friend'){c.fate='脱出';c.fateNote=(st?'条件を満たしたが自分から残り、':'')+'あとから'+C[o.by[0]].name+'に助け出された';c.out=true;}
else if(o.id==='rescue'){c.fate='脱出';c.fateNote=(st?'条件を満たしたが自分から残り、':'')+'あとから救助隊に助け出された';c.out=true;}
else if(o.id==='loop'){c.fate='白い部屋に戻った（？）';c.fateNote='開いた扉から飛び出したが、廊下の先はまた白い部屋だった';}
});
ctx.flags.outcome=(ctx.flags.outcome||'')+'（'+TITLE[o.id]+'）';
ctx.say({kind:'event',cat:'phase',cageOk:true,actors:actors,text:parts.join(''),why:why,mag:30});
};
RL.note=function(res,X){
var o=res&&res.end&&res.end.room&&res.end.room.left;
if(!o|| !o.who|| !o.who.length)return'';
var who=X.names(o.who),base=(o.outs||[]).length>0;
if(o.id==='friend')return'なお、あとから'+X.nm(o.by[0])+'が戻ってきて、'+who+'を助け出した。';
if(o.id==='rescue')return base?'なお、あとから'+who+'も救助隊に助け出された。':'なお、'+who+'は、あとから救助隊に助け出された。';
if(o.id==='loop')return'なお、'+who+'は開いた扉から飛び出したが、廊下の先はまた白い部屋だった……。';
if(o.id!=='alone'&&o.title)return'なお、'+who+'：'+o.title+'。';
return'なお、'+who+'は最後まで部屋に残った。';
};
RL.afterLines=function(res){
var o=res&&res.end&&res.end.room&&res.end.room.left;
if(!o||o.rescued|| !TITLE[o.id]|| !o.who)return[];
var C=res.chars||[],key=o.id==='loop'?'loop':'alone',out=[];
o.who.forEach(function(i,k){
var c=C[i];
if(!c)return;
var arr=T.after[key],h=HK.Emo&&HK.Emo.hash?HK.Emo.hash(String(res.seed)+'|left|'+c.name):0;
out.push(c.name+'のその後――'+fill(arr[(Math.floor(h*arr.length)+k)%arr.length],{a:c.name}));
});
return out;
};
})();
});
;
/* ==== js/room-cheer.js ==== */
HK.Load.def(75,'js/room-cheer.js',function(){
(function(){
'use strict';
var HK=window.HK,scen=HK.SCENARIOS&&HK.SCENARIOS.whiteroom,G=HK.RelGroup;
if(!scen|| !G)return;
var L=G.L;
function R(ctx,a,b){return ctx.R(a,b);}
function ev(o){HK.addTo(scen.events,o);}
function calm(ctx){return!!(ctx.rules&& !ctx.flags.isOne&& !ctx.flags.oneCond&& !ctx.rules.some(function(r){return r.k==='kill'||r.k==='one';}));}
function rk(ctx){
var K=HK.ROOM_KINDS||{},r=(ctx.rules||[]).filter(function(x){var T=K[x.k];return T&&(T.type==='act'||T.type==='word');})[0];
if(r)return r.k;
return(ctx.rules||[]).some(function(x){var T=K[x.k];return T&&T.type==='consume';})?'drink':'other';
}
function W(x){return function(ctx,a){return x+a.tr.np*0.15+(a.tr.warmth||0)*0.1;};}
var LEAD={
hand:L('扉の条件は、手を繋ぐこと。{b}の手が、{c}の手のすぐそばで、さっきから迷っていた。|{b}と{c}は並んで座っていたが、二人の手の間には、まだ指一本ぶんの隙間があった。'),
hug:L('扉の条件は、ハグ。{b}と{c}は、さっきから一歩近づいては、また離れていた。|{b}は{c}の前で両腕を広げかけて、そのまま頭をかいてごまかした。'),
lap:L('扉の条件は、膝枕。{c}は正座したまま、{b}が来るのを待っていた。|{b}は{c}の膝をちらりと見ては、慌てて目を逸らしていた。'),
kiss:L('扉の条件は、キス。{b}と{c}は、さっきから目が合うたびに逸らしていた。|{b}は{c}の唇から目を逸らそうとして、かえって何度も見てしまっていた。'),
h:L('扉の紙の条件を、{b}と{c}はもう何度も読み返していた。|{b}と{c}は、条件のことを口に出せないまま、ベッドの端と端に座っていた。'),
love:L('扉の条件は、「好き」と言い合うこと。{b}は口を開きかけては、{a}のほうをちらりと見た。|{b}は{c}の前で「す」まで言いかけて、咳払いでごまかした。'),
honne:L('扉の条件は、本音を打ち明け合うこと。{b}も{c}も、ほかの人のいる前では口が重かった。|{b}は{c}に本音を言いかけては、{a}の視線に気づいて黙り込んだ。'),
praise:L('扉の条件は、相手のいいところを言うこと。{b}は{c}の前で、ずっともじもじしていた。|{b}は{c}のいいところなら百でも言えたが、本人を前にすると一つも出てこなかった。'),
drink:L('テーブルには、まだ飲み切れていない瓶が並んでいた。{b}と{c}は、並んで次の一本に手を伸ばしたところだった。|{b}と{c}は、残りの本数を数えては、顔を見合わせてため息をついていた。'),
other:L('{b}と{c}は、扉の紙の前で、さっきから何やら小声で相談していた。|{b}と{c}は並んで座り、ときどき肩が触れるたびに、どちらからともなく笑っていた。')
};
var T={
space:L('{a}は部屋の隅まで下がって、壁のほうを向いて座り込んだ。「私は壁のしみを数えてるから、ごゆっくり｜私は壁のしみを数えている。ごゆっくり｜私は壁のしみを数えていますから、どうぞごゆっくり」――{b}と{c}は顔を見合わせて、それから少しだけ笑った。|{a}は自分の毛布を広げて、部屋の真ん中に即席の衝立を作った。「見ない、聞かない、覚えてない。約束する｜見ない、聞かない、覚えていない。約束する｜見ません、聞きません、覚えていません。約束します」――衝立の向こうで、{b}が小さく「ありがとう｜＝｜ありがとうございます」と言うのが聞こえた。|{a}は扉の紙をもう一度読んでから、黙って部屋の反対側に移った。両耳を指でふさいで、わざとらしく鼻歌を歌い始めた。その鼻歌があまりに下手で、{b}と{c}の緊張はどこかへ消えてしまった。'),
pushLead:L('{b}は、{c}のほうを見ては、扉の紙に目を戻していた。{a}はその様子を、しばらく黙って見ていた。やがて{a}は立ち上がり、{b}の隣にしゃがみ込んだ。|{b}がまた{c}から目を逸らしたのを見て、{a}は小さくため息をついた。それから{b}の肩を、軽く指でつついた。{b}が振り向くと、{a}は{c}のほうへ顎をしゃくった。|部屋の時計の針が、また一つ進んだ。{b}は{c}の隣で、膝の上の手を握ったり開いたりしていた。見かねた{a}が、{b}の耳元に顔を寄せた。'),
share:L('差し入れの箱に、温かい飲み物が二つだけ入っていた。{a}はそれを、迷わず{b}と{c}に渡した。「私はさっき水を飲んだから｜私はさっき水を飲んだ｜私はさっき水をいただきましたから」――二人は一口ずつ飲んでから、残りを{a}に返した。|{a}は、自分の分の毛布を{b}と{c}に譲った。二人は一枚の毛布を半分ずつ使い、もう一枚を{a}の膝に掛け返した。三人の間に、しばらく静かな時間が流れた。|照明が落ちて部屋が冷えてくると、{a}は{b}と{c}の背中に、自分の上着を掛けた。「二人がくっついてれば、それで足りるでしょ｜二人がくっついていれば、それで足りるだろう｜お二人がくっついていれば、それで足りるでしょう」――{b}は照れて{c}から離れかけ、{c}がそれを引き戻した。'),
koibana:L('{b}は{a}の袖を引いて、部屋の隅まで連れていった。{c}に聞こえないように、小さな声で、{c}への気持ちを打ち明けた。{a}はちらりと{c}のほうを見てから、{b}に向き直った。|眠れない夜、{b}は隣の{a}にだけ聞こえる声で言った。もし相手が{c}なら、扉の条件も怖くない気がする、と。{a}は天井を見たまま、少し笑った。|{a}と{b}は、壁際に並んで膝を抱えていた。{b}の視線が何度も{c}に向かうのを、{a}は見逃さなかった。{a}が肘でつつくと、{b}は観念したように、{c}への気持ちを話し始めた。'),
tease:L('{b}と{c}が並んで座っているのを見て、{a}は扉の紙を指さした。「その調子なら、条件なんてすぐだね｜その調子なら、条件などすぐだな｜その調子なら、条件なんてすぐですね」――{b}は枕を投げ、{c}はそれを笑って受け止めた。|{a}は差し入れの箱から菓子を一つ取り出して、{b}と{c}の間に置いた。「はい、二人の分。半分こで｜ほら、二人の分だ。半分ずつ食え｜はい、お二人の分です。半分ずつ召し上がってください」――二人が律儀に半分に割るのを見て、{a}は声を殺して笑った。|{b}が{c}の肩にもたれて眠っているのを見て、{a}はそっと毛布を掛けてやった。目を覚ましていた{c}が、唇の前に指を立てた。{a}も同じ仕草を返して、足音を忍ばせて離れた。'),
double:L('{a}と{b}、{c}と{d}は、部屋の真ん中で輪になって座った。どちらの組が先に扉を開けるか、という話になり、{c}が「負けたほうが、外で甘いものをおごる｜＝｜負けたほうが、外で甘いものをおごります」と言い出した。{b}は真っ赤になり、{d}は笑い転げた。|退屈しのぎに、{a}と{b}は{c}と{d}としりとりを始めた。二組とも、気づけば相手の名前ばかり答えに入れようとしていた。四人とも笑いすぎて、しりとりは十回も続かなかった。|{a}と{b}の組は、{c}と{d}の組に、差し入れの箱のお菓子を半分分けた。お返しに、{d}は二人のために毛布を一枚譲った。白い部屋の中で、そこだけ少し賑やかだった。'),
wait:L('扉の向こうから、かすかに{d}の声が聞こえた気がした。先に出た{d}と{e}は、きっと外で待っている。{a}は{b}と{c}を振り返って、「私たちも、あとに続こう｜＝｜私たちも、あとに続きましょう」と言った。|{a}は扉の下の隙間に、そっと耳を当てた。それから振り返って、{b}と{c}に笑ってみせた。「{d}たち、外で待ってるって。……二人とも、焦らなくていいからね｜{d}たちは、外で待っているそうだ。……二人とも、焦らなくていい｜{d}たちは、外で待っているそうです。……お二人とも、焦らなくていいですからね」|先に出ていった{d}と{e}の毛布が、部屋の隅に畳まれたまま残っていた。{a}はそれを{b}と{c}の肩に掛けてやった。「外に出たら、{d}と{e}も一緒に、みんなでご飯を食べよう｜外に出たら、{d}と{e}も一緒に、皆で飯を食おう｜外に出たら、{d}と{e}も一緒に、皆さんでご飯を食べましょう」'),
sendLead:L('扉の向こうに光が差した。{b}と{c}が並んで敷居をまたぐ前に、{a}が声をかけた。|{b}と{c}が扉に手をかけたとき、{a}は二人の背中に向かって手を振った。|開いた扉の前で、{b}と{c}は一度だけ部屋を振り返った。壁際の{a}と、目が合った。'),
reunion:L('扉の外では、先に出た{d}と{e}が待っていた。{d}は二人を見るなり、「遅い！｜遅いぞ！｜遅いですよ！」と笑った。四人はしばらく、廊下の明かりの下で、互いの無事を確かめ合った。|廊下に出ると、{d}と{e}が壁にもたれて座っていた。{e}が立ち上がって、{b}と{c}に手を振った。四人は顔を見合わせて、誰からともなく笑い出した。|外の廊下には、{d}と{e}が並んで待っていた。{b}と{c}が繋いだ手を見て、{d}は黙って親指を立てた。{e}は「おかえり｜＝｜おかえりなさい」と言った。')
};
var PUSH={
proud:L('{a}「いつまでぐずぐずしてる。{c}は、とっくに覚悟の決まった顔だ｜いつまでぐずぐずしている。{c}は、とうに覚悟の決まった顔だ｜いつまでぐずぐずしているんですか。{c}さんは、とうに覚悟の決まった顔ですよ」|{a}は{b}の背中を押した。「ほら。扉は、二人で開けるものなんだから｜ほら。扉は二人で開けるものだ｜ほら。扉は、お二人で開けるものですよ」'),
stern:L('{a}「条件は条件。だけど、相手が{c}でよかったと、私は思う｜条件は条件だ。だが、相手が{c}でよかったと私は思う｜条件は条件です。けれど、相手が{c}でよかったと、私は思います」|{a}は静かに言った。「迷うのは、{c}を大事に思っている証拠。なら、大丈夫｜迷うのは、{c}を大事に思っている証拠だ。なら、大丈夫だ｜迷うのは、{c}を大事に思っている証拠です。なら、大丈夫です」'),
tsun:L('{a}「べ、別に二人のためじゃないし。私が早く出たいだけだから、さっさとして｜別に二人のためではない。私が早く出たいだけだ。さっさとしろ｜別にお二人のためではありません。私が早く出たいだけです。早くしてください」|{a}は顔を背けたまま言った。「……{c}、さっきから{b}のことばっかり見てる。気づいてないの、{b}だけ｜……{c}は、さっきから{b}のことばかり見ている。気づいていないのは{b}だけだ｜……{c}さんは、さっきから{b}さんのことばかり見ています。気づいていないのは{b}さんだけです」'),
gentle:L('{a}「焦らなくていいよ。時間はまだある。{c}も、きっと同じ気持ち｜焦らなくていい。時間はまだある。{c}も、きっと同じ気持ちだ｜焦らなくていいですよ。時間はまだあります。{c}さんも、きっと同じ気持ちです」|{a}は{b}の肩にそっと手を置いた。「{c}となら、きっと怖くない｜＝｜{c}となら、きっと怖くありません」'),
devoted:L('{a}「二人が出られるなら、私は最後でいい。だから、遠慮しないで｜二人が出られるなら、私は最後でいい。だから遠慮するな｜お二人が出られるなら、私は最後でかまいません。ですから、遠慮しないでください」|{a}は二人のために、床のクッションを並べ直した。「せめて、これくらいはさせて｜せめて、これくらいはさせてくれ｜せめて、これくらいはさせてください」'),
cool:L('{a}「合理的に考えて、二人が最初に出るのが一番早い。……それに、似合ってる｜合理的に考えて、二人が最初に出るのが一番早い。……それに、似合っている｜合理的に考えて、お二人が最初に出るのが一番早いです。……それに、お似合いです」|{a}は時計を見上げた。「残り時間から逆算すると、今がちょうどいい頃合い｜残り時間から逆算すると、今がちょうどいい頃合いだ｜残り時間から逆算すると、今がちょうどいい頃合いです」'),
free:L('{a}「いけいけ！ 私、ちゃんと目をつぶってるから！｜行け行け！ 私はちゃんと目をつぶっている！｜行け行けです！ 私はちゃんと目をつぶっていますから！」|{a}は二人の手を取って、無理やり重ねた。「はい、これで半分クリア！｜よし、これで半分は済んだ！｜はい、これで半分クリアです！」'),
shy:L('{a}「わ、私、あっち向いてる……！ が、がんばって……｜私は、あちらを向いている……！ が、頑張れ……｜わ、私、あちらを向いています……！ が、頑張ってください……」|{a}は真っ赤な顔で、両手で目を覆った。「ど、どうぞ……！ 私のことは、気にしないで｜ど、どうぞ……！ 私のことは気にするな｜ど、どうぞ……！ 私のことは、お気になさらないでください」'),
polite:L('{a}「二人の邪魔はしない。どうぞ、ゆっくりして｜二人の邪魔はしない。ゆっくりしてくれ｜お二人のお邪魔はいたしません。どうぞ、ごゆっくりなさってください」|{a}は一礼して、部屋の隅に下がった。「何かあれば、呼んで｜何かあれば呼んでくれ｜何かあれば、お呼びください」')
};
var SEND={
proud:L('{a}「さっさと行け。……外で、ちゃんと待ってなよ｜さっさと行け。……外で、きちんと待っていろ｜さっさと行ってください。……外で、ちゃんと待っていてくださいね」|{a}「振り返るな。……おめでとう、二人とも｜＝｜振り返らないでください。……おめでとうございます、お二人とも」'),
stern:L('{a}「おめでとう。外に出ても、互いを大事にすること｜おめでとう。外に出ても、互いを大事にしろ｜おめでとうございます。外に出ても、互いを大事にしてください」|{a}は二人に向かって、小さく頷いた。「よくやった。……あとは任せて｜よくやった。……あとは任せろ｜よくやりました。……あとは任せてください」'),
tsun:L('{a}「べ、別に寂しくないし。早く行けば？ ……おめでと｜別に寂しくなどない。早く行け。……おめでとう｜別に寂しくなどありません。早く行ってください。……おめでとうございます」|{a}は腕を組んでそっぽを向いた。「外で、いちゃいちゃしすぎないように｜外で、いちゃつきすぎるな｜外で、いちゃいちゃしすぎないでくださいね」'),
gentle:L('{a}「おめでとう。外で、二人で美味しいもの食べてね｜おめでとう。外で、二人でうまいものでも食べてくれ｜おめでとうございます。外で、お二人で美味しいものを食べてくださいね」|{a}は二人の手を一度ずつ握った。「先に行ってて。すぐ追いつくから｜先に行っていてくれ。すぐに追いつく｜先に行っていてください。すぐに追いつきますから」'),
devoted:L('{a}「本当によかった……。私のことは気にしないで、行って｜本当によかった……。私のことは気にするな。行け｜本当によかったです……。私のことは気にせず、行ってください」|{a}は涙ぐみながら、二人を扉まで送った。「二人が笑ってるのが、いちばん嬉しい｜二人が笑っているのが、いちばん嬉しい｜お二人が笑っているのが、いちばん嬉しいです」'),
cool:L('{a}「おめでとう。……外の空気がどんなだったか、あとで教えて｜おめでとう。……外の空気がどうだったか、あとで教えてくれ｜おめでとうございます。……外の空気がどうだったか、あとで教えてください」|{a}は二人を見送りながら、扉の紙に目をやった。「一組、達成。……似合ってたよ｜一組、達成だ。……似合っていた｜一組、達成です。……お似合いでした」'),
free:L('{a}「いってらっしゃーい！ 外でお祝いの準備しといてね！｜行ってこい！ 外で祝いの準備をしておけよ！｜いってらっしゃい！ 外でお祝いの準備をしておいてくださいね！」|{a}は両手をぶんぶん振った。「お幸せにー！ 結婚式には呼んでよ！｜お幸せに！ 結婚式には呼べよ！｜お幸せに！ 結婚式にはお招きくださいね！」'),
shy:L('{a}「お、おめでとう……。そ、外で、待っててくれたら、うれしい｜お、おめでとう……。外で待っていてくれたら、うれしい｜お、おめでとうございます……。外で待っていてくださったら、うれしいです」|{a}は小さく手を振った。「……い、いってらっしゃい｜……い、行ってこい｜……い、いってらっしゃいませ」'),
polite:L('{a}「おめでとう。外でも、どうか幸せに｜おめでとう。外でも、どうか幸せになってくれ｜おめでとうございます。外の世界でも、どうかお幸せになってください」|{a}は深く一礼した。「お先にどうぞ。二人の門出を、心からお祝いする｜先に行ってくれ。二人の門出を、心から祝う｜お先にどうぞ。お二人の門出を、心からお祝い申し上げます」')
};
ev({
id:'rm_space',label:'恋人たちに場所を譲る',cat:'bond',scope:'pair',
when:function(ctx,a,b){if(!calm(ctx))return false;var c=G.loveOf(ctx,b,a);return!!c&&G.thirdOk(ctx,a,b,c)&&G.once(ctx,'space',[a,b,c]);},
w:W(0.35),
run:function(ctx,a,b){
var c=G.loveOf(ctx,b,a);G.mark(ctx,'space',[a,b,c]);
ctx.mod2(b,c,{att:4,trust:3,ten: -2},{att:4,trust:3,ten: -2});ctx.mod(b,a,{trust:3,aff:2});ctx.stress(b,-5);ctx.stress(c,-5);
return{with:[c],text:ctx.t(ctx.pick(LEAD[rk(ctx)])+ctx.pick(T.space),a,b,c),why:a.name+'が、'+b.name+'と'+c.name+'に場所を譲った（応援・仲良し）',mag:9};
}
});
ev({
id:'rm_push',label:'迷う友人の背中を押す',cat:'bond',scope:'pair',
when:function(ctx,a,b){if(!calm(ctx))return false;var c=G.loveOf(ctx,b,a);return!!c&&G.thirdOk(ctx,a,b,c)&&G.once(ctx,'push',[a,b]);},
w:function(ctx,a,b){return 0.3+a.tr.np*0.15+a.tr.fc*0.1+b.stress/300;},
run:function(ctx,a,b){
var c=G.loveOf(ctx,b,a);G.mark(ctx,'push',[a,b]);
ctx.mod(b,c,{att:4,trust:2});ctx.mod2(a,b,{aff:2},{trust:4,aff:3});ctx.stress(b,-8);
return{with:[c],text:ctx.t(ctx.pick(T.pushLead)+G.byPer(ctx,PUSH,a),a,b,c),why:a.name+'が、'+c.name+'を前に迷う'+b.name+'の背中を押した（応援・仲良し）',mag:9};
}
});
ev({
id:'rm_share',label:'恋人たちに自分の分を譲る',cat:'bond',scope:'pair',
when:function(ctx,a,b){if(!calm(ctx))return false;var c=G.loveOf(ctx,b,a);return!!c&&G.thirdOk(ctx,a,b,c)&&G.once(ctx,'share',[a,b,c]);},
w:W(0.26),
run:function(ctx,a,b){
var c=G.loveOf(ctx,b,a);G.mark(ctx,'share',[a,b,c]);
ctx.mod2(b,c,{aff:3,att:3},{aff:3,att:3});ctx.mod(b,a,{aff:4,trust:3});ctx.mod(c,a,{aff:3,trust:3});ctx.stress(b,-4);ctx.stress(c,-4);
return{with:[c],text:ctx.t(ctx.pick(T.share),a,b,c),why:a.name+'が、'+b.name+'と'+c.name+'に自分の分を譲った（応援・仲良し）',mag:8};
}
});
ev({
id:'rm_koibana',label:'部屋の隅で恋の相談',cat:'bond',scope:'pair',
when:function(ctx,a,b){if(!calm(ctx))return false;var c=G.mutualOf(ctx,b,a)||G.crushOf(ctx,b,a);return!!c&&G.thirdOk(ctx,a,b,c)&&G.friendly(ctx,b,a)&&G.once(ctx,'koibana',[a,b,c]);},
w:function(ctx,a,b){return 1.6+b.tr.honesty*0.5+(G.rel(ctx,a,b)?0.5:0);},
run:function(ctx,a,b){
var c=G.mutualOf(ctx,b,a)||G.crushOf(ctx,b,a);G.mark(ctx,'koibana',[a,b,c]);
ctx.mod2(a,b,{trust:4,aff:2},{trust:5,aff:3});ctx.mod(b,c,{att:3});
return{with:[c],text:ctx.t(G.relLead(ctx,a,b)+ctx.pick(T.koibana)+G.byPer(ctx,G.CHEER,a),a,b,c),why:b.name+'が'+a.name+'に、'+c.name+'への想いを相談した（恋の相談・仲良し）',mag:8};
}
});
ev({
id:'rm_tease',label:'恋人どうしを冷やかす',cat:'bond',scope:'pair',
when:function(ctx,a,b){if(!calm(ctx))return false;var c=G.partnerOf(ctx,b,a);return!!c&&G.thirdOk(ctx,a,b,c)&&G.once(ctx,'tease',[a,b,c]);},
w:function(ctx,a){return 0.22+a.tr.fc*0.2;},
run:function(ctx,a,b){
var c=G.partnerOf(ctx,b,a);G.mark(ctx,'tease',[a,b,c]);
ctx.mod2(b,c,{att:3,aff:2},{att:3,aff:2});ctx.mod2(a,b,{aff:2},{aff:2,trust:2});ctx.stress(b,-4);ctx.stress(c,-4);
return{with:[c],text:ctx.t(ctx.pick(T.tease),a,b,c),why:a.name+'が、恋人どうしの'+b.name+'と'+c.name+'を冷やかした（冷やかし・仲良し）',mag:8};
}
});
ev({
id:'rm_double',label:'二組で笑い合う部屋の時間',cat:'bond',scope:'pair',
when:function(ctx,a,b){if(!calm(ctx)|| !G.couple(ctx,a,b)|| !G.pairOk(ctx,a,b)||ctx.flags.rmDoubleAt===ctx.stepIndex)return false;var cd=G.otherCouple(ctx,a,b);return!!cd&&G.pairOk(ctx,cd[0],cd[1]);},
w:function(){return 0.4;},
run:function(ctx,a,b){
var cd=G.otherCouple(ctx,a,b),c=cd[0],d=cd[1];
ctx.flags.rmDoubleAt=ctx.stepIndex;
ctx.mod2(a,b,{att:2,aff:3},{att:2,aff:3});ctx.mod2(c,d,{att:2,aff:3},{att:2,aff:3});
[[a,c],[a,d],[b,c],[b,d]].forEach(function(p){ctx.mod2(p[0],p[1],{aff:2,trust:2},{aff:2,trust:2});});
[a,b,c,d].forEach(function(x){ctx.stress(x,-6);});
return{with:[c,d],text:G.fill(ctx,ctx.pick(T.double),a,b,c,d),why:a.name+'と'+b.name+'、'+c.name+'と'+d.name+'の二組で、部屋の中で笑い合った（ダブルデート・仲良し）',mag:9};
}
});
function gonePair(ctx,upto){
var ex=ctx.flags.exits||[],C=ctx.chars;
for(var i=Math.min(upto==null?ex.length:upto,ex.length)-1;i>=0;i--){
var x=ex[i];if(!x||x.group||x.how||x.stay!=null||x.a==null||x.b==null||x.a===x.b)continue;
var d=C[x.a],e=C[x.b];
if(d&&e&&d.out&&e.out&&d.alive!==false&&e.alive!==false)return[d,e];
}
return null;
}
ev({
id:'rm_wait',label:'先に出た二人が外で待つ',cat:'bond',scope:'pair',
when:function(ctx,a,b){if(!calm(ctx)|| !gonePair(ctx))return false;var c=G.loveOf(ctx,b,a);return!!c&&G.thirdOk(ctx,a,b,c)&&G.once(ctx,'wait',[a,b,c]);},
w:W(0.9),
run:function(ctx,a,b){
var c=G.loveOf(ctx,b,a),de=gonePair(ctx);G.mark(ctx,'wait',[a,b,c]);
ctx.mod2(b,c,{att:3,trust:3},{att:3,trust:3});ctx.mod2(a,b,{aff:2,trust:2},{aff:3,trust:3});[a,b,c].forEach(function(x){ctx.stress(x,-6);});
return{with:[c],text:G.fill(ctx,ctx.pick(T.wait),a,b,c,de[0],de[1]),why:'先に出た'+de[0].name+'と'+de[1].name+'が外で待っている。'+a.name+'が、残った'+b.name+'と'+c.name+'を励ました（応援・仲良し）',mag:8};
}
});
function sendoff(ctx){
var ex=ctx.flags.exits||[],from=ctx.flags.rcSeen||0;
if(ex.length<=from)return;
ctx.flags.rcSeen=ex.length;
if(!calm(ctx))return;
for(var i=from;i<ex.length;i++){
var x=ex[i];if(!x||x.group||x.how||x.stay!=null||x.a==null||x.b==null||x.a===x.b)continue;
var b=ctx.chars[x.a],c=ctx.chars[x.b];
if(!b|| !c|| !b.out|| !c.out)continue;
var pf=ctx.pair(b,c);
if(pf.forced!=null|| !G.loveOk(b,c)|| !(pf.couple||(R(ctx,b,c).att>25&&R(ctx,c,b).att>25)))continue;
var rest=G.here(ctx).filter(function(a){return a!==b&&a!==c&& !G.couple(ctx,a,b)&& !G.couple(ctx,a,c)&&R(ctx,a,b).att<40&&R(ctx,a,c).att<40&&(G.friendly(ctx,a,b)||G.friendly(ctx,a,c))&&R(ctx,a,b).ten<40&&R(ctx,a,c).ten<40;});
var a=rest.sort(function(p,q){return(R(ctx,q,b).aff+R(ctx,q,c).aff)-(R(ctx,p,b).aff+R(ctx,p,c).aff);})[0];
if(a&&ctx.rng()<0.5){
ctx.mod(a,b,{aff:3});ctx.mod(a,c,{aff:3});ctx.stress(a,-4);
ctx.pending.push({kind:'event',cat:'bond',actors:[a,b,c],text:ctx.t(ctx.pick(T.sendLead)+G.byPer(ctx,SEND,a),a,b,c),why:b.name+'と'+c.name+'が条件を満たして部屋を出た。残る'+a.name+'が送り出した（送り出し・仲良し）',mag:10,_rcA:a.i});
}
var de=gonePair(ctx,i);
if(de&&de.indexOf(b)<0&&de.indexOf(c)<0&&ctx.rng()<0.6)
ctx.pending.push({kind:'event',cat:'bond',actors:[b,c],text:G.fill(ctx,ctx.pick(T.reunion),null,b,c,de[0],de[1]),why:'先に出た'+de[0].name+'と'+de[1].name+'が、外で'+b.name+'と'+c.name+'を待っていた（再会・仲良し）',mag:8});
}
}
var setup0=scen.setup;
scen.setup=function(ctx){
var r=setup0?setup0.apply(this,arguments):undefined;
var say0=ctx.say;
ctx.flags.rcSeen=0;
ctx.say=function(o){
if(o&&o._rcA!=null){var sa=ctx.chars[o._rcA];delete o._rcA;if(!sa||sa.out||sa.alive===false)return{skipped:true,n:ctx.log.length};}
var e=say0.apply(this,arguments);sendoff(ctx);return e;
};
return r;
};
})();
});
;
/* ==== js/room-know.js ==== */
HK.Load.def(76,'js/room-know.js',function(){
(function(){
'use strict';
var HK=window.HK,scen=HK.SCENARIOS&&HK.SCENARIOS.whiteroom;
if(!scen)return;
function R(ctx,a,b){return ctx.R(a,b);}
function T(ctx,s,a,b){return ctx.t(s,a,b);}
scen.actions=scen.actions.concat([
{id:'askq',label:'相手のことを質問する',fit:function(t){return t.np*0.5+t.warmth*0.4+t.honesty*0.1;},bias:{bond:1.8,romance:1.1,solo:0.6}}
]);
var Q=[
['好きな食べ物って何？','{b}「…卵焼き。甘いやつ｜…卵焼きだ。甘いのがいい｜…卵焼きです。甘いのがいいです」|{b}「ラーメン。夜中に食べるのが一番うまい｜＝｜ラーメン。夜中に食べるのが一番おいしいです」|{b}「白いご飯。おかずはいらない｜白い飯。おかずはいらない｜白いご飯。おかずはいりません」',0],
['休みの日は何してるの？','{b}「寝てる。ひたすら寝てる｜寝ている。ひたすら寝ている｜寝ています。ひたすら寝ています」|{b}「散歩。知らない道を歩くのが好きで｜散歩だ。知らない道を歩くのが好きだ｜散歩です。知らない道を歩くのが好きなんです」|{b}「録りためたドラマを一気に見る｜＝｜録りためたドラマを一気に見ます」',0],
['子どもの頃の夢って何だった？','{b}「宇宙飛行士。…笑わないでよ｜宇宙飛行士。…笑うなよ｜宇宙飛行士。…笑わないでください」|{b}「パン屋さん。今でもちょっと思ってる｜パン屋。今でも少し思っている｜パン屋さん。今でもちょっと思っています」|{b}「なかった。だから今もちょっと探してる｜なかった。だから今も少し探している｜ありませんでした。だから今もちょっと探しています」',0],
['動物で例えたら、自分は何だと思う？','{b}「…猫かな。気が向いたときだけ寄っていく｜…猫だな。気が向いたときだけ寄っていく｜…猫でしょうか。気が向いたときだけ寄っていきます」|{b}「ナマケモノ」|{b}「犬。たぶん、しっぽ振ってるのばれてる｜犬。たぶん、しっぽを振っているのがばれている｜犬。たぶん、しっぽを振っているのがばれています」',0],
['最近、いちばん笑ったことは？','{b}「…今。この状況｜…今だ。この状況だ｜…今です。この状況です」|{b}「駅で、鳩に本気で追いかけられてる人を見た｜駅で、鳩に本気で追いかけられている人を見た｜駅で、鳩に本気で追いかけられている人を見ました」|{b}「自分の寝言で起きたこと｜＝｜自分の寝言で起きたことです」',0],
['人に言えない趣味とかある？','{b}「…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる｜＝｜…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れます」|{b}「知らない人の家の間取り図を眺めること｜＝｜知らない人の家の間取り図を眺めることです」|{b}「…ぬいぐるみに名前つけて話しかけてる｜…ぬいぐるみに名前をつけて話しかけている｜…ぬいぐるみに名前をつけて話しかけています」',1],
['最近、泣いたのっていつ？','{b}「先週。映画で。動物が出てくるやつはずるい｜先週だ。映画で。動物が出てくるものはずるい｜先週です。映画で。動物が出てくるのはずるいです」|{b}「…覚えてない。泣き方を忘れたのかもしれない｜…覚えていない。泣き方を忘れたのかもしれない｜…覚えていません。泣き方を忘れたのかもしれません」|{b}「ここで目が覚めたとき。…少しだけ｜＝｜ここで目が覚めたとき。…少しだけです」',1],
['初恋っていつだった？','{b}「小学校の、図書室の先生｜＝｜小学校の、図書室の先生です」|{b}「…それ、今聞く？｜…それを、今聞くのか｜…それ、今聞きますか？」と言いながら、{b}は中学のときの話をした|{b}「まだ、かもしれない｜＝｜まだ、かもしれません」',1,true],
['どんな人がタイプ？','{b}「…ちゃんと話を聞いてくれる人｜＝｜…ちゃんと話を聞いてくれる人です」|{b}「一緒にいて、黙ってても平気な人｜一緒にいて、黙っていても平気な人｜一緒にいて、黙っていても平気な人です」|{b}「笑うと目がなくなる人｜＝｜笑うと目がなくなる人です」と言って、{b}は{a}から目を逸らした',1,true],
['今、いちばん怖いことって何？','{b}「…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと｜…ここから出られないこと。いや、出たあと、ここでのことを忘れてしまうことだ｜…ここから出られないこと。ではなくて、出たあと、ここでのことを忘れてしまうことです」|{b}「誰にも必要とされなくなること｜＝｜誰にも必要とされなくなることです」|{b}「…自分が、何もできないまま終わること｜＝｜…自分が、何もできないまま終わることです」',2],
['後悔してることってある？','{b}「親に、ちゃんとありがとうって言えてない｜親に、ちゃんとありがとうと言えていない｜親に、ちゃんとありがとうと言えていません」|{b}「一人だけ、謝りそびれてる人がいる｜一人だけ、謝りそびれている人がいる｜一人だけ、謝りそびれている人がいます」|{b}「…あのとき、行かないでって言えばよかった｜…あのとき、行かないでと言えばよかった｜…あのとき、行かないでと言えばよかったです」',2],
['ここを出たら、最初に誰に会いたい？','{b}「…家族。いや、飼ってる猫｜…家族。いや、飼っている猫だ｜…家族。いえ、飼っている猫です」|{b}「誰にも。一人で、ちゃんと眠りたい｜＝｜誰にも。一人で、ちゃんと眠りたいです」|{b}「…それは、出てから言う｜＝｜…それは、出てから言います」',2,true],
['正直、私のことどう思ってる？','{b}「…思ってたより、ずっといい人｜…思っていたより、ずっといい人だ｜…思っていたより、ずっといい人です」|{b}「最初は苦手だった。今は、そうでもない｜＝｜最初は苦手でした。今は、そうでもないです」|{b}「それは、答えたら負けな気がする｜＝｜それは、答えたら負けな気がします」と言いながら、{b}の耳は赤かった',2,true]
];
function askLine(ctx,a,q){
var t=a.tr;
if(t.np>0.62||t.warmth>0.62)return ctx.pick(['{a}「よかったら、聞いてもいい？　'+q+'」','{a}は少し考えてから、やわらかく訊いた。「答えたくなかったらいいんだけど……'+q+'」','{a}「ねえ、暇つぶしに。'+q+'」']);
if(t.cp>0.65||t.aggr>0.6)return ctx.pick(['{a}「'+q+'　答えろよ、暇なんだから」','{a}は前置きもなく訊いた。「'+q+'」']);
if(t.fc>0.62)return ctx.pick(['{a}「はい質問タイム！　'+q+'」','{a}「じゃーん、第一問。'+q+'」']);
if(t.ac>0.62)return ctx.pick(['{a}「あ、あの……'+q+'」','{a}は何度か口を開けては閉じて、ようやく訊いた。「……'+q+'」']);
return ctx.pick(['{a}「'+q+'」','{a}は{b}の隣に座って、訊いた。「'+q+'」']);
}
var NOPE={
CP:['{b}「答える義理はない｜＝｜答える義理はありません」','{b}「それを聞いてどうするの｜それを聞いてどうする｜それを聞いてどうするんですか」'],
NP:['{b}「…それは、またいつかね｜…それは、またいつかだ｜…それは、またいつかにします」と、{b}は困ったように笑った。','{b}「ごめん。それは、まだ言えない｜すまない。それは、まだ言えない｜すみません。それは、まだ言えません」'],
A:['{b}「それ、今の状況に関係ある？｜それは、今の状況に関係あるのか｜それ、今の状況に関係ありますか？」','{b}「その質問には答えないことにしてる｜その質問には答えないことにしている｜その質問には答えないことにしています」'],
FC:['{b}「ひみつー」','{b}「当ててみて。当たったら教える｜当ててみろ。当たったら教える｜当ててみてください。当たったら教えます」'],
AC:['{b}は俯いて、黙ってしまった。','{b}「……ごめん、それはちょっと｜……すまない、それはちょっと｜……すみません、それはちょっと」']
};
function awkward(ctx,a,b){
if(a.tr.np>0.6||a.tr.warmth>0.6)return ctx.pick(['{a}「あ、ごめん。変なこと聞いた｜あ、すまない。変なことを聞いた｜あ、すみません。変なことを聞きました」{a}はすぐに話題を変えた。それでも、しばらく部屋の空気は硬かった。','{a}「いいよ、無理に答えなくて｜無理に答えなくていい｜無理に答えなくていいですよ」二人の間に、少しだけ長い沈黙が落ちた。']);
if(a.tr.fc>0.6)return ctx.pick(['{a}「…はい、じゃあ次の質問！｜…よし、では次の質問だ！｜…はい、では次の質問です！」誰も笑わなかった。','{a}「ちぇー」とおどけてみせたが、そのあとの沈黙は{a}にもごまかせなかった。']);
return ctx.pick(['沈黙が落ちた。白い壁が、やけに白く見えた。','{a}は「そう｜そうか｜そうですか」とだけ言って、壁の方を向いた。時計の音だけが聞こえた。','気まずい空気のまま、二人とも扉の紙を読み直すふりをした。']);
}
function know(ctx,a,b){var pf=ctx.pair(a,b);pf.known=pf.known||{};return(pf.known[a.i]=pf.known[a.i]||{});}
function honneRule(ctx){return(ctx.rules||[]).filter(function(r){return r.k==='honne';})[0];}
function countHonne(ctx,a,b,who){
var r=honneRule(ctx),p=ctx.flags.prog&&ctx.flags.prog[a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i];
if(!r|| !p)return false;
var k='honne'+who.i;
if((p.said[k]||0)>=r.n)return false;
p.said[k]=(p.said[k]||0)+1;
return true;
}
scen.events.push({
id:'r_ask',cat:'bond',scope:'pair',pri:true,
when:function(ctx,a,b){return!ctx.flags.isOne||ctx.present().length>1;},
w:function(ctx,a,b){
var k=know(ctx,a,b),n=Object.keys(k).length;
return Math.max(0.05,((a.action&&a.action.id==='askq')?3.2:0.45)+a.tr.np*0.7+a.tr.warmth*0.7+(a.goal&&a.goal.id==='know'?1:0)-n*0.12);
},
run:function(ctx,a,b){
var rng=ctx.rng,k=know(ctx,a,b),rab=R(ctx,a,b),rba=R(ctx,b,a);
var depthMax=rba.trust>30||rab.aff>35?2:rba.trust>8?1:0;
var pool=Q.filter(function(q,i){return!k[i]&&q[2]<=depthMax&&(!q[3]||HK.canLove(a,b)||q[2]<2);});
if(!pool.length)pool=Q.filter(function(q,i){return!k[i];});
if(!pool.length)return null;
var q=ctx.pick(pool),qi=Q.indexOf(q);
var soft=(a.tr.np+a.tr.warmth)/2;
var p=0.62+b.tr.honesty*0.2+rba.trust/120+rba.aff/220+soft*0.2-q[2]*0.2-b.tr.cold*0.2-rba.ten/180-(a.tr.cp>0.65||a.tr.aggr>0.6?0.12:0);
var ask=T(ctx,askLine(ctx,a,q[0]),a,b);
if(rng()<p){
k[qi]=1;
var ans=T(ctx,ctx.pick(q[1].split('|')),a,b);
var deep=q[2]>=2,rom= !!q[3];
var dA={aff:4+q[2]*2,trust:3+q[2]*2,ten: -3},dB={aff:3+q[2]*2,trust:4+q[2]*3,ten: -4};
if(rom&&HK.canLove(a,b)){dA.att=3+q[2]*2;dB.att=2+q[2];}
ctx.mod2(a,b,dA,dB);ctx.stress(a,-4);ctx.stress(b,-3-q[2]*2);
var tail=deep?ctx.pick(['{a}は「教えてくれて、ありがとう｜＝｜教えてくれて、ありがとうございます」と言った。','{a}は何も言わずに頷いた。それで十分だった。','話したあと、{b}の肩から少しだけ力が抜けていた。']):
ctx.pick(['{a}「意外｜意外だな｜意外です」{b}「よく言われる｜＝｜よく言われます」','{a}は思わず笑った。','{a}「わかる｜＝｜わかります」と言って、自分の話もした。','']);
var hn=deep&&countHonne(ctx,a,b,b)?'（'+b.name+'の本音として数えられた）':'';
return{cat:rom&&rab.att>30?'romance':'bond',text:ask+ans+T(ctx,tail,a,b)+hn,why:a.name+'の聞き方（NP・あたたかさ）と'+b.name+'の正直さ・'+a.name+'への信頼（'+Math.round(rba.trust)+'）',mag:6+q[2]*4};
}
var top=HK.voiceTop(b),nope=T(ctx,ctx.pick(NOPE[top]||NOPE.AC),a,b);
var playful=top==='FC'&&q[2]===0;
ctx.mod2(a,b,{ten:playful?1:5+q[2]*3,aff:playful?1: -1},{ten:playful?0:4+q[2]*2});
ctx.stress(a,playful?0:4);ctx.stress(b,playful?0:3);
if(q[2]>=1&&b.tr.np+b.tr.honesty>0.9){b.flags.owe=b.flags.owe||{};b.flags.owe[a.i]=qi;}
return{cat:playful?'bond':'conflict',text:ask+nope+(playful?T(ctx,ctx.pick(['{a}「ずるい｜＝｜ずるいです」{b}は楽しそうに笑っていた。','結局、その日のうちに{a}は三回当てようとして、三回外した。']),a,b):T(ctx,awkward(ctx,a,b),a,b)),
why:b.name+'は答えなかった（質問の深さ '+q[2]+'・'+b.name+'の正直さとドライさ・緊張）',mag:5};
}
});
scen.events.push({
id:'r_answer_later',cat:'bond',scope:'pair',pri:true,
when:function(ctx,a,b){return a.flags.owe&&a.flags.owe[b.i]!=null&&R(ctx,a,b).trust> -5;},
w:function(ctx,a,b){return 0.4+a.tr.np*0.5+a.tr.honesty*0.4+R(ctx,a,b).aff/100;},
run:function(ctx,a,b){
var qi=a.flags.owe[b.i],q=Q[qi];
delete a.flags.owe[b.i];
know(ctx,b,a)[qi]=1;
var ans=ctx.pick(q[1].split('|'));
ctx.mod2(a,b,{trust:8,aff:5,ten: -8},{trust:10,aff:8,ten: -10});
var hn=q[2]>=2&&countHonne(ctx,a,b,a)?'（'+a.name+'の本音として数えられた）':'';
return{text:T(ctx,ctx.pick(['{a}は{b}の隣に座って、ぽつりと言った。「さっきの質問。…答える｜＝｜さっきの質問。…答えます」','{a}「さっきは、ごめん。ちゃんと答えたい｜さっきは、すまない。ちゃんと答えたい｜さっきは、すみません。ちゃんと答えたいです」']),a,b)+ctx.t(ans,b,a)+T(ctx,ctx.pick(['{b}は黙って聞いていた。','{b}「…ありがとう。話してくれて｜＝｜…話してくれて、ありがとうございます」','']),a,b)+hn,
why:a.name+'のNP・正直さ（答えなかった質問に、あとから答えた）',mag:12};
}
});
var fin0=scen.finish;
scen.finish=function(ctx){
var r=fin0?fin0.apply(this,arguments):undefined;
var C=ctx.chars,notes=(ctx.flags.endNotes=ctx.flags.endNotes||[]);
for(var i=0;i<C.length;i++)for(var j=i+1;j<C.length;j++){
var a=C[i],b=C[j],kn=ctx.pair(a,b).known||{},na=Object.keys(kn[a.i]||{}).length,nb=Object.keys(kn[b.i]||{}).length;
if(na+nb>=3)notes.push(a.name+'と'+b.name+'は、部屋の中でお互いのことを'+(na+nb)+'つ知った。');
}
return r;
};
})();
});
;
/* ==== js/room-end.js ==== */
HK.Load.def(77,'js/room-end.js',function(){
(function(){
'use strict';
var HK=window.HK,RA=HK.RoomAPI;
if(!RA|| !RA.scen)return;
var scen=RA.scen,RE=HK.RoomEnd=HK.RoomEnd||{};
function L(s){return s.split('|');}
function nm(list){list=list.map(function(c){return c.name;});return list.length>6?list.slice(0,6).join('・')+'ほか'+(list.length-6)+'人':list.join('・');}
function fill(t,o){return String(t).replace(/\{(\w+)\}/g,function(m,k){return o[k]!=null?o[k]:m;});}
function pairsOf(g){var o=[];for(var i=0;i<g.length;i++)for(var j=i+1;j<g.length;j++)o.push([g[i],g[j]]);return o;}
scen.env.push({id:'outsideNames',label:'登場しない住人の名前を出す',type:'select',def:'no',options:[
{v:'no',label:'出さない'},
{v:'yes',label:'出す（結末の「その後」に、参加していない住人を友人・恋人・家族として出す）'}
],desc:'名簿にいて今回は参加していない住人のうち、参加者と友人・親友・幼馴染・相棒・恋人・夫婦・家族の関係がある人の名前を、結末の「その後」に出します（例：「〇〇は、友人の△△との約束場所へ向かっていった」）。出さないときは「友人との約束場所へ」のように名前なしで書きます'});
var OUT_T={
spouse:['lover','伴侶',0],lover:['lover','恋人',1],fiance:['lover','許嫁',2],
best:['friend','親友',3],buddy:['friend','相棒',4],childhood:['friend','幼馴染',5],friend:['friend','友人',6],
sibclose:['family','きょうだい',7],sibling:['family','きょうだい',7],sibprot:['family','きょうだい',7],
parent:['family','家族',8],pparent:['family','家族',8],stepsib:['family','きょうだい',9],relative:['family','親族',9]
};
function outsideOf(input){
var UI=HK.UI,S=UI&&UI.state?UI.state():null;
if(!S|| !Array.isArray(S.chars)|| !Array.isArray(S.ties)|| !input|| !Array.isArray(input.chars))return null;
var byName={},dup={},byId={};
S.chars.forEach(function(c){if(!c|| !c.name)return;if(byName[c.name])dup[c.name]=1;byName[c.name]=c;byId[c.id]=c;});
var idx={};
input.chars.forEach(function(c,i){var r=c&&byName[c.name];if(r&& !dup[c.name])idx[r.id]=i;});
var yes= !!(input.env&&input.env.outsideNames==='yes'),out=[];
S.ties.forEach(function(t){
var d=t&&OUT_T[t.type];
if(!d||t.cold==='separated'||t.cold==='divorced')return;
[[t.a,t.b],[t.b,t.a]].forEach(function(p){
var o=byId[p[1]];
if(idx[p[0]]==null||idx[p[1]]!=null|| !o|| !o.name||dup[o.name])return;
if(input.chars.some(function(c){return c&&c.name===o.name;}))return;
out.push({i:idx[p[0]],k:d[0],l:d[1],p:d[2],n:yes?o.name:''});
});
});
out.sort(function(x,y){return x.i-y.i||x.p-y.p;});
var cnt={};
return out.filter(function(o){cnt[o.i]=(cnt[o.i]||0)+1;return cnt[o.i]<=2;}).map(function(o){var r={i:o.i,k:o.k,l:o.l};if(o.n)r.n=o.n;return r;});
}
RE.outsideOf=outsideOf;
if(HK.wrap&&HK.simulate)HK.wrap(HK,'simulate',function(orig){
return function(input){
if(input&&input.scenId==='whiteroom'&&input.outside===undefined){
try{var o=outsideOf(input);if(o&&o.length)input.outside=o;}catch(e){}
}
return orig.apply(this,arguments);
};
});
function outs(ctx,c,kind){return((ctx.input&&ctx.input.outside)||[]).filter(function(o){return o&&o.i===c.i&&(!kind||o.k===kind);});}
function roName(ctx,o){return o.n&&ctx.env.outsideNames==='yes'?o.l+'の'+o.n:o.l;}
var DOOR=L('{t}、条件を満たしたので扉が開いた。|{t}、扉の紙の数字がそろい、鍵の外れる音がした。|{t}、白い扉が、何の前触れもなく内側へ開いた。|{t}、扉の紙の文字がすっと薄れ、鍵が外れた。|{t}、扉の向こうから、冷たい風が細く吹きこんできた。');
var KILL_PAUSE=L('誰も、すぐには動けなかった。|開いた扉の向こうから、場違いなほど明るい光が差しこんでいた。|しばらくのあいだ、誰も扉に近づこうとしなかった。');
var EXIT={
rush:L('{G}が我先にと外に飛び出した。|{G}は顔も見合わせず、先を争うように外へ出た。|{G}は扉が開ききるのも待たずに、廊下へ駆け出した。|{G}は、誰が先かも決めないまま、押し合うようにして外へ出た。'),
hand2:L('{a}は{b}の手を取って、外へ出た。|{a}と{b}は手を繋いだまま、一歩ずつ外へ出た。|{b}が差し出した手を{a}が握り返し、二人は並んで扉を抜けた。|{a}は{b}の肩を抱くようにして、ゆっくり外へ出た。'),
handG:L('{a}は{b}の手を取って扉を抜け、{R}もそのあとに続いた。|{R}が先に出て、{a}と{b}は手を繋いだまま最後に扉を抜けた。|{a}と{b}が手を繋いで先に出ると、{R}も黙ってあとに続いた。'),
silent:L('{G}は互いに目を合わせないまま、黙って外へ出た。|誰も口をきかなかった。{G}は、一度も振り返らずに外へ出た。|{G}は、肩がぶつからないように間を空けて、無言で外へ出た。'),
silent2:L('{a}が先に出て、{b}は少し間を置いてから、無言であとに続いた。|{a}と{b}は、どちらも相手を見ないまま、黙って扉を抜けた。|{a}は{b}より先に出ようとして、扉の前で肩がぶつかった。どちらも、何も言わなかった。'),
calm:L('{G}は顔を見合わせてから、外へ出た。|{G}は、白い部屋を一度だけ振り返ってから扉を抜けた。|{G}は、拍子抜けするほどあっさりと外へ出た。|{G}は、誰からともなく小さく笑って、外へ出た。')
};
var ALONG=L('{L}も、{G}が開けた扉から、一緒に外へ出た。|{L}も開いた扉から、そっとあとに続いた。|{L}も、開いた扉から遅れずに外へ出た。|{L}は置いていかれまいと、慌ててあとを追った。|{L}は少し遅れて、肩をすくめながら扉を抜けた。');
var ORDER=L('扉は、条件を満たした組ごとに開いた。{SEQ}外へ出た。|{SEQ}、それぞれ外へ出た。|一組ずつ、扉は開いては閉じた。{SEQ}白い部屋をあとにした。|{SEQ}、順に外へ出ていった。');
var ORDER_MANY=L('扉は、条件を満たした組ごとに何度も開いた。最後に外へ出たのは、{G}だった。|一組、また一組と、扉の向こうへ消えていった。最後に出たのは{G}だった。');
var FIRST=L('{a}だけが先に外へ出て、{b}はあとから出てきた。|先に出た{a}は、扉の外で{b}が出てくるのを待っていた。|{b}は一度は部屋に残ったが、{a}に遅れて外へ出た。');
var SCENE=L('全員が外に出たところで、背後の扉は音もなく消えた。廊下の先には、見覚えのある街の夜景が広がっていた。|外の空気は、思っていたよりずっと冷たかった。振り返ると、白い部屋はもうどこにもなかった。|最後の一人が出ると、白い部屋の照明がひとりでに落ち、扉はただの壁に戻った。|扉の外は、見慣れた駅の裏通りだった。遠くで、終電の発車ベルが鳴っていた。|外は雨上がりで、濡れたアスファルトに街灯の光がにじんでいた。振り返った先に、扉はもうなかった。|廊下を抜けると、明け方の公園に出た。白い部屋のことは、夢だったと言われれば信じてしまいそうだった。|扉の向こうは、どこかのビルの屋上だった。夜風の中で、遠くの観覧車がゆっくり回っていた。|外に出ると、朝の光がまぶしかった。背後で扉の閉まる音がして、それきり何も聞こえなくなった。');
var SCENE_G=L('扉の外は、見慣れた駅の裏通りだった。|廊下を抜けると、明け方の公園に出た。|扉の向こうは、どこかのビルの屋上だった。夜風が、思ったより冷たかった。|外は雨上がりで、濡れたアスファルトに街灯の光がにじんでいた。|外に出ると、朝の光がまぶしかった。');
var GO_LATER=L('外に出た{a}は、部屋に残った{b}のことが、帰り道のあいだずっと頭から離れなかった。|{a}は一人で外の空気を吸った。残ると決めた{b}の顔を思い出して、少しだけ笑った。|{a}は振り返らずに歩き出した。{b}とは、それきりになった。|{a}は外で{b}を待とうとして、やめた。{b}が自分で選んだことだった。');
var GO_WAIT=L('{a}は扉の外の壁にもたれて、{b}と{c}が出てくるのを待つことにした。|外に出た{a}は、閉じた扉にそっと手を当てた。{b}と{c}なら、きっとすぐに出てくる。|{a}は外の廊下に座りこんで、{b}と{c}を待った。待つのは、少しも苦ではなかった。');
var SCENE1=L('背後で、扉が音もなく消えた。|白い部屋の話は、それで終わりになった。|振り返ると、扉のあった場所はただの壁になっていた。|外の空気は、思っていたよりずっと冷たかった。|廊下の先には、見覚えのある街の夜景が広がっていた。');
var SOME=L('扉は、それきり開かなくなった。白い部屋には{L}だけが残された。|外へ出た人たちの足音が遠ざかると、部屋はまた静かになった。{L}は閉じた扉の前に座りこんだ。|{L}がどれだけ扉を叩いても、返ってくる音はなかった。|扉が閉まる直前、{L}は何か言いかけて、やめた。|照明がひとつずつ落ちていき、{L}の影だけが白い壁に長く伸びた。');
var NONE=L('{t}。照明が最後の一段まで落ち、白い部屋は真っ暗になった。扉の紙の条件は、誰ひとり満たせなかった。{L}は暗闇の中で、互いの息づかいだけを数えていた。|{t}。扉は最後まで開かなかった。{L}は壁にもたれて、朝とも夜ともつかない白い光を黙って見上げていた。この部屋から出た人は、一人もいない。|{t}。時間切れを知らせるように、扉の紙の文字がすっと消えた。{L}は顔を見合わせたが、誰も何も言わなかった。白い部屋は、全員を閉じ込めたまま静まり返った。|{t}。扉の紙の文字は最後まで変わらなかった。{L}は白い部屋に閉じ込められたまま、限界の時刻を迎えた。|{t}。{L}の誰も、もう扉の方を見なくなっていた。白い部屋は、何事もなかったように静まり返っていた。');
var ONE={
sacrifice:L('{a}がくぐった扉は、二度と開かなかった。外の光の中で、{a}は何度も振り返った。|{a}は一人で外の世界に戻った。{b}に押された背中の感触が、いつまでも消えなかった。|外に出た{a}は、扉のあった場所の壁に額をつけた。向こう側で{b}が待っている気がした。|外に出た{a}は、一歩ごとに足が重くなった。最後に見た{b}は、笑って手を振っていた。|{a}は外の光の中で立ち尽くした。{b}が残ったのは自分のためだと、分かりすぎるほど分かっていた。'),
grab:L('一人で外に出た{a}は、振り返らずに歩き出した。|{a}が抜け出したあと、扉は二度と開かなかった。{L}は閉じた扉を見つめたまま、長いあいだ動かなかった。|外の空気を吸った{a}は、一度だけ立ち止まった。それから、白い部屋のことは忘れたふりをして歩き出した。|{a}は外に出るなり、走り出した。背後で扉の閉まる音がしても、足を止めなかった。|{a}は一人で外に出た。白い部屋に残った{L}の声は、もう聞こえなかった。')
};
var ONE_AFTER={
sacrifice:L('{a}はそれから毎晩、{b}の名前を思い出してから眠った。|{a}は外で、白い部屋の場所を探し続けた。扉は、二度と見つからなかった。|{a}は、{b}がくれた時間を無駄にしないと決めた。決めたことだけが、{a}を前に進ませた。'),
sacrificeO:L('{a}は{RO}に会うなり、子どものように泣いた。理由は、うまく話せなかった。|{a}は帰り道、{RO}に「ただいま」とだけ送った。それ以上は、まだ書けなかった。'),
grab:L('{a}は、何事もなかったように日常へ戻った。夜中にふと目が覚める回数だけが、少し増えた。|{a}は、白い部屋のことを誰にも話さなかった。話せば、自分が何をしたかも話すことになる。|{a}は、閉じた扉の前で叫んでいた{b}の声を、聞かなかったことにした。'),
grabO:L('{a}は{RO}との約束の時間に、少しだけ遅れて着いた。遅れた理由は、最後まで言わなかった。|{a}は{RO}の前で、いつもどおりに笑ってみせた。うまく笑えているかどうかは、分からなかった。')
};
var STAYED=L('{S}は、扉が開いても外へ出なかった。自分で選んで、白い部屋に残った。|{S}は開いた扉を見送って、自分から部屋に残ることを選んだ。|{S}にとっては、外より白い部屋の方が居心地がよかったらしい。{S}は自分の意思で残った。|{S}は「もう少しだけ｜もう少しだけだ｜もう少しだけです」と言って、閉まっていく扉に背を向けた。|{S}は扉の前で一度だけ立ち止まり、それから部屋の奥へ戻っていった。');
var PAIR={
love:L('{a}と{b}は、部屋を出たその足で一緒に帰った。駅までの道で、どちらからともなく手を繋いだ。|一週間後、{a}と{b}は改めて待ち合わせをした。あの部屋のことは話さなかったが、帰り際に{b}の方から次の約束を口にした。|{a}と{b}は、それからも会うようになった。白い部屋で始まった関係は、外でも続いている。|{a}と{b}は、帰り道のコンビニで同じ飲み物を選んで、顔を見合わせて笑った。|{a}は{b}を家まで送った。玄関の前で、{b}の方から「上がっていく？｜上がっていくか？｜上がっていきますか？」と訊いた。'),
awk:L('部屋を出た{a}と{b}は、外の明るさに目を細めたまま、ろくに挨拶もせず別々の方向へ歩き出した。|{a}と{b}は、あの部屋でのことを一度も口にしなかった。連絡先も、交換しないままだった。|{a}は{b}に何か言いかけて、やめた。二人のあいだのことは、白い部屋に置いてきたことになった。|{a}と{b}は、出口で目が合うと、同時に逸らした。それきり、どちらも口をひらかなかった。'),
hate:L('{a}と{b}は、扉を出たところで一度だけ睨み合い、反対の方向へ歩き出した。|{a}は{b}に「二度と顔を見せないで｜二度と顔を見せるな｜二度と顔を見せないでください」とだけ言った。{b}は、振り返りもしなかった。|{a}と{b}は、外に出てからも張り合うように足を速め、駅で別々の電車に乗った。|{a}は{b}の背中を目で追いながら、次に会ったら何と言ってやろうかと考えていた。それが憎しみなのか別の何かなのか、{a}にも分からなかった。'),
friend:L('{a}と{b}は外に出ると、肩を叩き合って笑った。あの部屋の話は、いつのまにか二人だけの笑い話になった。|{a}と{b}は連絡先を交換した。たまに届くメッセージは、決まって「生きてる？」の一言から始まった。|部屋を出た{a}と{b}は、近くの店で遅い食事をとった。特別な何かにはならなかったが、いい友人になった。|{a}が「お腹すいた｜腹が減った｜お腹が空きました」と言うと、{b}も同じことを言って吹き出した。|{a}と{b}は、次の休みに会う約束をした。白い部屋の話は、二人の鉄板の笑い話になった。'),
far:L('{a}と{b}は扉を出たところで別れた。名前のほかは、互いのことをほとんど知らないままだった。|{a}と{b}は外に出るなり、目も合わせずに別々の道を選んだ。二人がまた会うことは、たぶんない。|外に出ると、{a}と{b}はそれぞれのスマホを確かめ、短く会釈して離れた。白い部屋で一緒だったことだけが、二人の接点だった。|{a}と{b}は、出口で軽く会釈をしただけだった。名前を呼ぶ機会は、結局一度もなかった。|外に出ると、{a}も{b}も、それぞれの日常へ紛れていった。'),
go:L('{a}は先に外へ出た。部屋に残った{b}のことが、帰り道のあいだずっと頭から離れなかった。|{a}は一人で外の空気を吸った。残ると決めた{b}の顔を思い出して、少しだけ笑った。|{a}は振り返らずに外へ出た。{b}とは、それきりになった。|{a}は外で{b}を待とうとして、やめた。{b}が自分で選んだことだった。'),
group:L('{G}は外に出ると、誰からともなく大きく息を吐いた。それから、近くの店でそろって朝食をとった。|{G}は扉の外で一度だけ振り返り、それぞれの帰り道へ散っていった。|外に出た{G}は、あの部屋のことは「なかったこと」にしようと決めた。けれど、全員の連絡先はちゃんと残っていた。|{G}は、扉の外で互いの無事を確かめ合い、駅までは一緒に歩いた。'),
kusare:L('{a}と{b}は、扉を出たところで「これで清々した｜これで清々した｜これで清々しました」と同時に言い、同時に顔をしかめた。帰る方向は、なぜか同じだった。|{a}と{b}は、連絡先を交換しなかった。それでも一週間後、二人は同じ店で鉢合わせて、また口喧嘩を始めた。|外に出た{a}と{b}は、駅までずっと言い争っていた。改札の前で、どちらからともなく「じゃあ、また｜じゃあ、またな｜では、またお会いしましょう」と言った。|{a}は{b}に「二度と会いたくない｜二度と会いたくない｜二度と会いたくありません」と言い、{b}は「こっちの台詞｜こちらの台詞だ｜こちらの台詞です」と返した。二人が次に会ったのは、三日後だった。'),
kusare1:L('{a}は扉を出るなり、{b}に背を向けた。けれど角を曲がる前に一度だけ振り返り、{b}がまだそこにいるのを確かめた。|{a}は「せいせいした｜せいせいした｜せいせいしました」と吐き捨てて歩き出した。その夜、{a}は{b}の名前を検索しかけて、乱暴にスマホを伏せた。|{b}は何事もなかったように帰っていった。{a}だけが、その背中に向かって聞こえないほどの悪態をつき、それから長いあいだ立ち尽くしていた。|{a}は{b}の連絡先を消そうとして、指を止めた。嫌いな相手の番号を、なぜ消せないのか、{a}自身にも分からなかった。'),
kill:L('{G}は、外に出ても誰も口をきかなかった。白い部屋に置いてきたものの重さだけが、帰り道について来た。|{G}は、二度とこの話をしないと約束して別れた。|{G}は、扉の外で一度だけ振り返った。そこにはもう、壁しかなかった。')
};
var BY_O=L('{a}は巻き込まれなかったことにホッとしつつ、{RO}との約束場所へ向かっていった。|{a}は巻き込まれずに済んだことに胸をなで下ろし、{RO}が待つ店へ急いだ。|{a}は何事もなかった顔で{RO}に「＠{a}＠今から行く｜今から行く｜今から向かいます」とだけ送って、駅へ向かった。');
var BY_N=L('{a}は巻き込まれなかったことにホッとしつつ、ひとりで夜景を眺めながら帰った。|{a}は巻き込まれずに済んだ幸運をかみしめて、まっすぐ家に帰った。|{a}はコンビニで温かい飲み物を買い、何も見なかったことにして家路についた。|{a}は一人だけ涼しい顔で、終電の時刻を確かめていた。');
var OUT_X=L('{a}は外に出るとすぐ、{RO}に電話をかけた。声を聞いたら、ようやく帰ってきた気がした。|{a}を待っていたのは、{RO}からの山ほどの不在着信だった。|{a}は、{RO}の顔が無性に見たくなって、帰り道を少しだけ遠回りした。');
var OUT_G=L('{a}は{RO}からの着信に気づいたが、出られなかった。白い部屋でのことは、言えそうになかった。|{a}は、待ち合わせ場所に立つ{RO}を遠くから見つけて、足が止まった。|{a}は{RO}に会う前に、念入りに手を洗った。それで何かが消えるわけではなかった。');
RE.TEXT={DOOR:DOOR,KILL_PAUSE:KILL_PAUSE,SCENE_G:SCENE_G,GO_LATER:GO_LATER,GO_WAIT:GO_WAIT,EXIT:EXIT,ALONG:ALONG,ORDER:ORDER,SCENE:SCENE,SCENE1:SCENE1,SOME:SOME,NONE:NONE,ONE:ONE,STAYED:STAYED,PAIR:PAIR,BY_O:BY_O,BY_N:BY_N,OUT_X:OUT_X,OUT_G:OUT_G};
function avgR(ctx,a,b){var r1=ctx.R(a,b),r2=ctx.R(b,a);return{att:(r1.att+r2.att)/2,aff:(r1.aff+r2.aff)/2,ten:(r1.ten+r2.ten)/2};}
function tieHas(ctx,a,b,ty){return!!(HK.Ties&&HK.Ties.has&&HK.Ties.has(ctx,a,b,ty));}
function isHate(ctx,a,b){
var H=HK.HateKit,v=avgR(ctx,a,b);
if(H&&H.level&&Math.max(H.level(ctx,a,b),H.level(ctx,b,a))>=35)return true;
if(HK.Ties&&HK.Ties.hostile&&(HK.Ties.hostile(ctx,a,b)||HK.Ties.hostile(ctx,b,a))&&v.aff<30)return true;
return v.ten>=50&&v.aff<15;
}
function isClose(ctx,a,b){return['best','buddy','childhood','sibclose'].some(function(t){return tieHas(ctx,a,b,t);});}
function isLove(ctx,a,b){var pf=ctx.pair(a,b),v=avgR(ctx,a,b);return!!pf.couple||(v.att>45&&v.aff>35);}
function kusareOf(ctx,a,b){
var LH=HK.LoveHate,pf=ctx.pair(a,b);
if(!LH|| !LH.has||pf.couple||pf.kill)return'';
var ha=LH.has(ctx,a,b),hb=LH.has(ctx,b,a);
if(!ha&& !hb)return'';
var n=(pf.lhN||0)+(pf.lhJeal||0)+(pf.lhLewd||0)*2;
if(!(pf.night||pf.hateSex||pf.hateNight)&&n<3)return'';
return ha&&hb?'kusare':'kusare1';
}
function kindOf(ctx,a,b){
var pf=ctx.pair(a,b),v=avgR(ctx,a,b),r18= !HK.SAFE_ON&& !!PAIR.fwb;
if(isLove(ctx,a,b)&&pf.couple)return'love';
var ku=kusareOf(ctx,a,b);
if(ku)return ku;
if(isLove(ctx,a,b))return'love';
if(pf.fwb)return r18?'fwb':'friend';
if(isHate(ctx,a,b))return'hate';
if(pf.night)return'night';
if(v.aff>20&&v.ten<40)return'friend';
return'far';
}
RE.kindOf=kindOf;
function pairPool(k){return k==='night'?(PAIR.night&& !HK.SAFE_ON?PAIR.night.concat(PAIR.awk):PAIR.awk):PAIR[k]||PAIR.far;}
function pairLayer(ctx,x,y){
var k=kindOf(ctx,x,y);
if(k==='kusare1'&& !HK.LoveHate.has(ctx,x,y)){var s=x;x=y;y=s;}
return fill(ctx.pick(pairPool(k)),{a:x.name,b:y.name});
}
RE.pairLayer=pairLayer;
function manner(ctx,g){
var ps=pairsOf(g).filter(function(p){return!kusareOf(ctx,p[0],p[1]);}),hp=ps.filter(function(p){return isLove(ctx,p[0],p[1]);})[0]||ps.filter(function(p){var v=avgR(ctx,p[0],p[1]);return isClose(ctx,p[0],p[1])||(v.aff>45&&v.ten<30);})[0];
ps=pairsOf(g);
if(hp)return{m:'hand',p:hp};
if(ps.some(function(p){return isHate(ctx,p[0],p[1]);}))return{m:'silent',p:ps[0]};
if(ps.every(function(p){var v=avgR(ctx,p[0],p[1]);return v.aff<15&&v.att<20;}))return{m:'rush'};
return{m:'calm'};
}
function exitLine(ctx,g){
var mm=manner(ctx,g),G=g.length===2?g[0].name+'と'+g[1].name:nm(g);
if(mm.m==='hand'){
var a=mm.p[0],b=mm.p[1],R=g.filter(function(c){return c!==a&&c!==b;});
if(ctx.rng()<0.5){var s=a;a=b;b=s;}
return fill(ctx.pick(R.length?EXIT.handG:EXIT.hand2),{a:a.name,b:b.name,R:nm(R),G:G});
}
if(mm.m==='silent'&&g.length===2)return fill(ctx.pick(EXIT.silent.concat(EXIT.silent2)),{a:g[0].name,b:g[1].name,G:G});
return fill(ctx.pick(EXIT[mm.m]),{G:G});
}
function involved(ctx,c){
if(c.flags.trio)return true;
var l3=ctx.flags.last3;
if(l3&&l3.g&&l3.g.indexOf(c.i)>=0)return true;
return ctx.chars.some(function(o){if(o===c)return false;var pf=ctx.pair(c,o);return!!(pf.night||pf.fwb||pf.heatDone);});
}
function sn(s){var t=String(s).replace(/「[^」]*」/g,'「」'),m=t.match(/[。！？]/g);return Math.max(1,m?m.length:0);}
function trim(parts,max){
var total=function(){return parts.reduce(function(s,p){return s+sn(p.t);},0);};
while(total()>max){
var sh=parts.filter(function(p){return p.alt&&sn(p.alt)<sn(p.t);})[0];
if(sh){sh.t=sh.alt;sh.alt=null;continue;}
var k= -1,ko=0;
parts.forEach(function(p,i){if(p.o>ko){ko=p.o;k=i;}});
if(k<0)break;
parts.splice(k,1);
}
return parts;
}
function timeOf(label){
var t=String(label||'').replace(/（.*$/,'');
return!t||t==='目覚め'?'目覚めてまもなく':'目覚めてから'+t;
}
function seqLabel(label){var t=String(label||'').replace(/（.*$/,'');return!t||t==='目覚め'?'目覚めてすぐ':t;}
function membersOf(ctx,e){
var C=ctx.chars;
if(e.group)return e.group.map(function(i){return C[i];});
if(e.stay!=null)return[C[e.a]];
return[C[e.a],C[e.b]];
}
var SKEY= /駅|夜景|雨|公園|屋上|朝|観覧車|冷た|消え/g;
function freshScene(ctx,pool,peek){
var used=ctx.flags.endScene||[],ks=function(t){return String(t).match(SKEY)||[];};
var ok=pool.filter(function(t){return!ks(t).some(function(k){return used.indexOf(k)>=0;});});
var t=ctx.pick(ok.length?ok:pool);
if(!peek)ctx.flags.endScene=used.concat(ks(t));
return t;
}
RE.groupEnd=function(ctx,ex,opt){
opt=opt||{};
if(!ex||ex.how)return'';
var C=ctx.chars,parts=[];
if(ex.stay!=null){
var lt=opt.lt;
parts.push({t:fill(ctx.pick(lt?GO_WAIT:GO_LATER),{a:C[ex.a].name,b:C[ex.stay].name,c:lt?lt.name:''}),o:0});
}else{
var g=membersOf(ctx,ex),lay;
if(ex.trio||g.length>2)lay={t:freshScene(ctx,SCENE_G),o:1};
else{var x=g[0],y=g[1];if(ctx.rng()<0.5){var s=x;x=y;y=s;}lay={t:pairLayer(ctx,x,y),o:0};}
if(!/^[^。]*(?:外に出る|部屋を出た|扉を出た)/.test(lay.t))parts.push({t:exitLine(ctx,g),o:2});
parts.push(lay);
}
return trim(parts,3).map(function(p){return p.t;}).join('');
};
function closing(ctx,late){
var C=ctx.chars,P=ctx.present(),out=C.filter(function(c){return c.out;});
var stayed=P.filter(function(c){return c.flags.stayed;}),left=P.filter(function(c){return!c.flags.stayed;});
var tEnd=timeOf(ctx.label);
var ex=ctx.flags.exits||[],parts=[],title,who=P.length?P:out;
var one=ex.filter(function(e){return e.how==='sacrifice'||e.how==='grab';})[0];
var kill=ctx.rules&&ctx.rules.some(function(r){return r.k==='kill';});
var usedOut={};
if(!out.length){
parts.push({t:fill(ctx.pick(NONE),{t:tEnd,L:nm(P)}),o:0});
title='誰も出られなかった';
}else if(one){
var a=C[one.a],b=C[one.b],Lr=nm(P)||b.name;
parts.push({t:fill(ctx.pick(ONE[one.how]),{a:a.name,b:b.name,L:Lr}),o:0});
var oo=outs(ctx,a)[0];
var pool=oo&&ctx.rng()<0.6?ONE_AFTER[one.how+'O']:ONE_AFTER[one.how];
if(oo)usedOut[a.i]=1;
parts.push({t:fill(ctx.pick(pool),{a:a.name,b:b.name,RO:oo?roName(ctx,oo):''}),o:0});
title=a.name+'だけが外へ出た';
}else{
var real=ex.filter(function(e){return!e.how;}),fresh=real.filter(function(e){return!e.told;});
if(fresh.length===1){
var e0=fresh[0],g0=membersOf(ctx,e0);
if(kill&&e0.group)parts.push({t:ctx.pick(KILL_PAUSE),o:4});
parts.push({t:kill&&e0.group?fill(ctx.pick(EXIT.silent),{G:nm(g0)}):exitLine(ctx,g0),o:0});
}else if(fresh.length>1){
var byL=[],lab={};
fresh.forEach(function(e){var k=seqLabel(e.label);if(lab[k]==null){lab[k]=byL.length;byL.push({l:k,g:[]});}byL[lab[k]].g.push(membersOf(ctx,e));});
var gname=function(gs){return gs.map(function(g){return g.length===2?g[0].name+'と'+g[1].name:nm(g);}).join('、');};
if(byL.length<=3)parts.push({t:fill(ctx.pick(ORDER),{SEQ:byL.map(function(x){return x.l+'に'+gname(x.g)+'が';}).join('、')}),o:0});
else parts.push({t:fill(ctx.pick(ORDER_MANY),{G:gname(byL[byL.length-1].g)}),o:0});
}else if(!real.length)parts.push({t:fill(ctx.pick(DOOR),{t:tEnd}),o:0});
var alongE=fresh.filter(function(e){return e.along&&e.along.length;}).pop();
if(alongE)parts.push({t:fill(ctx.pick(ALONG),{L:nm(alongE.along.map(function(i){return C[i];})),G:nm(membersOf(ctx,alongE))}),o:2.5});
real.filter(function(e){return e.stay!=null&&C[e.stay].out;}).slice(0,1).forEach(function(e){parts.push({t:fill(ctx.pick(FIRST),{a:C[e.a].name,b:C[e.stay].name}),o:5});});
if(!P.length){title=C.length===2?'二人とも部屋を出た':'全員が部屋を出た';parts.push({t:freshScene(ctx,SCENE),alt:freshScene(ctx,SCENE1,true),o:6});}
else if(left.length){title=nm(left)+'が取り残された';parts.push({t:fill(ctx.pick(SOME),{L:nm(left)}),o:0});}
else title=nm(stayed)+'が自分から残った';
if(stayed.length)parts.push({t:fill(ctx.pick(STAYED),{S:nm(stayed)}),o:2});
var nL=0;
fresh.forEach(function(e){
if(e.trio)return;
var t;
if(e.group)t=fill(ctx.pick(kill?PAIR.kill:PAIR.group),{G:nm(e.group.map(function(i){return C[i];}))});
else if(e.stay!=null)t=fill(ctx.pick(PAIR.go),{a:C[e.a].name,b:C[e.b].name});
else{var x=C[e.a],y=C[e.b];if(ctx.rng()<0.5){var s=x;x=y;y=s;}t=pairLayer(ctx,x,y);}
parts.push({t:t,o:nL?8+nL:1});
nL++;
});
}
(late||[]).forEach(function(e){parts.push({t:e.text,o:0});});
var l3=ctx.flags.last3,L3=RE.L3;
if(l3&&L3&& !HK.SAFE_ON&&out.length){
var g3=l3.g.map(function(i){return C[i];});
parts.push({t:fill(ctx.pick(L3[l3.mood]||L3.none),{a:g3[0].name,b:g3[1].name,c:g3[2].name,G:nm(g3)}),o:1});
}
if(out.length&& !one){
var lewdRun=C.some(function(c){return involved(ctx,c);});
var free=out.filter(function(c){return c.alive!==false&& !usedOut[c.i];});
var by=lewdRun?free.filter(function(c){return!involved(ctx,c);}):[];
if(by.length){
var bc=by[Math.floor(ctx.rng()*by.length)%by.length],bo=outs(ctx,bc)[0];
usedOut[bc.i]=1;
parts.push({t:fill(ctx.pick(bo?BY_O:BY_N),{a:bc.name,RO:bo?roName(ctx,bo):''}),o:3});
}
var gu=free.filter(function(c){return!usedOut[c.i]&&involved(ctx,c)&&outs(ctx,c,'lover').length;});
if(gu.length&&ctx.rng()<0.6){
var gc=gu[Math.floor(ctx.rng()*gu.length)%gu.length];
usedOut[gc.i]=1;
parts.push({t:fill(ctx.pick(OUT_G),{a:gc.name,RO:roName(ctx,outs(ctx,gc,'lover')[0])}),o:3});
}else if(!by.length){
var ox=free.filter(function(c){return!usedOut[c.i]&&outs(ctx,c).length;});
if(ox.length&&ctx.rng()<0.55){
var xc=ox[Math.floor(ctx.rng()*ox.length)%ox.length];
usedOut[xc.i]=1;
parts.push({t:fill(ctx.pick(OUT_X),{a:xc.name,RO:roName(ctx,outs(ctx,xc)[0])}),o:3});
}
}
}
trim(parts,6);
if(out.length&& !P.length&&parts.reduce(function(s,p){return s+sn(p.t);},0)<=2&& !parts.some(function(p){return SCENE.indexOf(p.t)>=0||SCENE1.indexOf(p.t)>=0;}))parts.splice(Math.min(2,parts.length),0,{t:freshScene(ctx,SCENE),o:6});
ctx.flags.outcome=(ctx.flags.outcome||ctx.flags.roomLabel||'')+' ― '+title;
ctx.say({kind:'step',cat:'phase',text:'結末'});
ctx.say({kind:'event',cat:'phase',cageOk:true,actors:who,text:parts.map(function(p){return p.t;}).join(''),why:'結末：'+title,mag:30});
}
RE.closing=closing;
var fin0=scen.finish;
scen.finish=function(ctx){
var s0=ctx.log.length;
var r=fin0?fin0.apply(this,arguments):undefined;
ctx.flush();
var late=[];
for(var i=ctx.log.length-1;i>=s0;i--)if(/^部屋を出たあとの三人/.test(ctx.log[i].why||''))late.unshift(ctx.log.splice(i,1)[0]);
for(var j=s0;j<ctx.log.length;j++)ctx.log[j].n=j;
closing(ctx,late);
if(HK.RoomLeft)HK.RoomLeft.write(ctx);
return r;
};
})();
});
;
/* ==== js/room-tie.js ==== */
HK.Load.def(78,'js/room-tie.js',function(){
(function(){
'use strict';
var HK=window.HK,scen=HK.SCENARIOS&&HK.SCENARIOS.whiteroom;
if(!scen|| !HK.RoomAPI)return;
var API=HK.RoomAPI;
function L(s){return s.split('|');}
var TYPES=['boss','worship','benefactor','relative','classmate','colleague'];
var LABEL={colleague:'同僚',classmate:'同級生',boss:'上司と部下',worship:'執着（信仰）',benefactor:'恩人',relative:'親族'};
function tieOf(ctx,a,b){
if(!HK.Ties|| !a|| !b||a===b)return null;
var got=TYPES.map(function(k){return HK.Ties.has(ctx,a,b,k);}).filter(Boolean);
return got.length?got[Math.floor(ctx.rng()*got.length)]:null;
}
function hasTie(ctx,a,b){return!!HK.Ties&&TYPES.some(function(k){return HK.Ties.has(ctx,a,b,k);});}
function loveOk(ctx,a,b){
if(HK.ngPair&&HK.ngPair(a,b))return false;
if(HK.canLove&&(!HK.canLove(a,b)|| !HK.canLove(b,a)))return false;
return!HK.Ties.all(ctx,a,b).some(function(t){return(HK.tieNoLove&&HK.tieNoLove(t))||(HK.tieOptNoLove&&HK.tieOptNoLove(t));});
}
function heavyOk(ctx,a,b){return loveOk(ctx,a,b)&&sexOk(ctx,a,b);}
function sexOk(ctx,a,b){
if(HK.SAFE_ON||(HK.ngPair&&HK.ngPair(a,b))||(HK.sexBlocked&&HK.sexBlocked(a,b)))return false;
if(HK.canLove&&(!HK.canLove(a,b)|| !HK.canLove(b,a)))return false;
if(HK.Pos&& !HK.Pos.okSex(a,b))return false;
return!HK.Ties.all(ctx,a,b).some(function(t){return HK.tieNoLove&&HK.tieNoLove(t);});
}
function domOf(ctx,t){var pf=ctx.pair(ctx.chars[t.a],ctx.chars[t.b]);return t.type==='worship'&&(t.cold==='dominate'||pf.dominate===t.b);}
function sit(ctx,a,b){
if(ctx.flags.isOne)return'one';
var rs=(ctx.rules||[]).filter(function(r){return!API.ruleDone(ctx,r,a,b);});
if(!rs.length)return'';
var T=API.K[rs[0].k];
if(T.type==='act')return T.lvl>=3?'heavy':'light';
return T.type==='consume'?'consume':T.type==='word'?'word':'';
}
function qn(ctx,a,b){
var rs=(ctx.rules||[]).filter(function(r){return!API.ruleDone(ctx,r,a,b);}),r=rs[0];
if(!r)return'お題';
var T=API.K[r.k];
return T.type==='consume'?T.item:T.noun||'お題';
}
function fmt(ctx,s,a,b){return ctx.t(String(s).replace(/\{q\}/g,qn(ctx,a,b)),a,b);}
var PAT={
colleague:{
x:L('{a}は扉の紙を読み上げて、腕を組んだ。{a}「要件がこれだけって、職場で回ってくる依頼よりひどい｜要件がこれだけとは、職場で回ってくる依頼よりひどい｜要件がこれだけって、職場で回ってくる依頼よりひどいです」{b}「でも、締め切りがないぶんまし｜だが、締め切りがないぶんましだ｜でも、締め切りがないぶんましです」|{a}と{b}は、いつもの打ち合わせのように壁際に並んで座り、分かっていることと分かっていないことを床に指で書き分けた。手順の踏み方まで、二人はそっくりだった。|{b}「{a}、こういうとき、いつも最初に出口を確かめるよね｜{a}は、こういうとき、いつも最初に出口を確かめるな｜{a}、こういうとき、いつも最初に出口を確かめますよね」{a}「{b}こそ、最初に非常ベルを探してた｜{b}こそ、最初に非常ベルを探していた｜{b}こそ、最初に非常ベルを探していましたよ」二人は同時に、天井の何もない隅を見上げた。|{a}は白い壁を叩いて回り、{b}は叩いた場所を順に覚えていった。職場で何度も組んだ分担が、ここでもそのまま出た。|{a}「職場に連絡がつかないのが、地味にいちばん怖い｜＝｜職場に連絡がつかないのが、地味にいちばん怖いです」{b}「無断欠勤の言い訳、二人で考えておこう｜無断欠勤の言い訳を、二人で考えておこう｜無断欠勤の言い訳、二人で考えておきましょう」'),
S:{
heavy:L('{a}は扉の紙の「{q}」の字から目を逸らした。{a}「……明日から、どんな顔で同じ職場に行けばいいの｜……明日から、どんな顔で同じ職場に行けばいいんだ｜……明日から、どんな顔で同じ職場に行けばいいんでしょう」{b}「それは、出てから二人で考えよう｜＝｜それは、出てから二人で考えましょう」|{b}「{a}とは、仕事の相棒のままでいたかった｜＝｜{a}とは、仕事の相棒のままでいたかったです」{a}「今だって相棒だ。お題が変なだけ｜今でも相棒だ。お題が変なだけだ｜今だって相棒です。お題が変なだけです」二人は顔を見合わせて、少しだけ笑った。'),
one:L('{a}「一人しか出られないなら、出た人が助けを呼ぶ。それが一番早い｜一人しか出られないなら、出た者が助けを呼ぶ。それが一番早い｜一人しか出られないなら、出た人が助けを呼びます。それが一番早いです」{b}「職場と同じで、報告が先ってことか｜職場と同じで、報告が先ということか｜職場と同じで、報告が先ということですか」二人は、どちらが出るかをまだ決めなかった。'),
consume:L('{a}は並んだ{q}を数えて、{b}と半分ずつに分けた。{a}「仕事と同じ。分担すれば早い｜仕事と同じだ。分担すれば早い｜仕事と同じです。分担すれば早いです」{b}「残業代は出ないけどね｜残業代は出ないがな｜残業代は出ませんけどね」'),
word:L('{a}「{q}を言えって、評価面談より難しい｜{q}を言えとは、評価面談より難しい｜{q}を言えって、評価面談より難しいです」{b}「面談なら、前もって書いて持っていけるのに｜面談なら、前もって書いて持っていけるのだが｜面談なら、前もって書いて持っていけるんですけど」')
}
},
classmate:{
x:L('{a}「同じクラスだったころ、{b}とこんなに長く二人で話したことあったっけ｜同じクラスだったころ、{b}とこんなに長く二人で話したことがあったか｜同じクラスだったころ、{b}とこんなに長く二人で話したこと、ありましたっけ」{b}「なかった。席、いちばん遠かったし｜なかった。席がいちばん遠かったからな｜ありませんでした。席がいちばん遠かったですから」|{a}と{b}は、担任の口癖を思い出しては交互にまねをした。白い部屋に、学生のころの笑い声が少しだけ戻った。|{b}は白い壁をじっと見て言った。{b}「なんか、テスト前の自習室みたい｜なんだか、テスト前の自習室のようだ｜なんだか、テスト前の自習室みたいです」{a}「自習室に扉の紙は貼ってなかった｜自習室に扉の紙は貼っていなかった｜自習室に扉の紙は貼っていませんでした」|{a}は、{b}が考え込むときに髪をいじる癖が、学生のころから変わっていないことに気づいた。|{a}「卒業してから、みんなどうしてるんだろう｜卒業してから、皆どうしているんだろう｜卒業してから、みんなどうしているんでしょう」{b}「少なくとも、ここにいる二人はろくな目に遭ってない｜少なくとも、ここにいる二人はろくな目に遭っていない｜少なくとも、ここにいる二人はろくな目に遭っていません」'),
S:{
heavy:L('{b}は扉の紙の「{q}」を見て、顔を覆った。{b}「同級生と、これ……同窓会でどんな顔すればいいの｜同級生と、これか……同窓会でどんな顔をすればいいんだ｜同級生と、これ……同窓会でどんな顔をすればいいんですか」{a}「言わなきゃ誰にも分からない｜言わなければ誰にも分からない｜言わなければ誰にも分かりません」{b}「{a}、そういうところ昔から変わらない｜{a}は、そういうところが昔から変わらないな｜{a}、そういうところ昔から変わりませんね」'),
one:L('{a}「一人しか出られないなら、くじ引きにしよう。学生のころの席替えみたいに｜一人しか出られないなら、くじ引きにしよう。学生のころの席替えのように｜一人しか出られないなら、くじ引きにしましょう。学生のころの席替えみたいに」{b}「あのくじ、{a}がいつもいい席を引いてた｜あのくじは、{a}がいつもいい席を引いていた｜あのくじ、{a}がいつもいい席を引いていましたよね」'),
consume:L('{a}「{q}を前に二人で並ぶの、学生のころの悪ふざけみたい｜{q}を前に二人で並ぶのは、学生のころの悪ふざけのようだ｜{q}を前に二人で並ぶの、学生のころの悪ふざけみたいです」{b}「あのころより、だいぶ体力ないけどね｜あのころより、だいぶ体力はないがな｜あのころより、だいぶ体力ないですけどね」'),
word:L('{a}「{q}を言うの、卒業文集の寄せ書き以来かも｜{q}を言うのは、卒業文集の寄せ書き以来だろう｜{q}を言うの、卒業文集の寄せ書き以来かもしれません」{b}「あれ、{a}に何て書いたか覚えてる？｜あれに、{a}へ何と書いたか覚えているか？｜あれ、{a}に何て書いたか覚えていますか？」{a}は覚えていなかった。{b}は少しだけ拗ねた顔をした。')
}
},
boss:{
A:L('{a}は扉と壁と紙を順に確かめてから、{b}に指示を出した。{a}「{b}は右の壁を。私は左を見る。何かあったらすぐ呼んで｜{b}は右の壁を。私は左を見る。何かあったらすぐ呼べ｜{b}は右の壁を。私は左を見ます。何かあったらすぐ呼んでください」{b}は職場と同じ返事をした。|{a}「{b}、慌てなくていい。状況の整理は私がする｜＝｜{b}、慌てなくていいです。状況の整理は私がします」{a}の声は、いつもの朝の打ち合わせと同じ、落ち着いた調子だった。|{a}は、閉じ込められてからの時間を袖口に書きつけていた。{a}「出たら、ちゃんと記録を残す。{b}の欠勤も、私の責任で処理する｜＝｜出たら、ちゃんと記録を残します。{b}の欠勤も、私の責任で処理します」'),
B:L('{b}は{a}の分の水を先に確かめて、黙って手渡した。{a}が礼を言うと、{b}は職場と同じように小さく頭を下げた。|{b}は{a}が考え込んでいる間、物音を立てないように壁際で待っていた。職場で何度も見てきた、{a}が答えを出す前の沈黙だった。|{b}「{a}は、こういうとき絶対に弱音を吐かない。だから私が代わりに吐いておく｜＝｜{a}は、こういうとき絶対に弱音を吐きません。だから私が代わりに吐いておきます」{b}がわざと大きくため息をつくと、{a}の口元が少しゆるんだ。'),
S:{
heavyA:L('{a}は扉の紙の「{q}」を読んで、{b}の前に立った。{a}「{b}、これは命令でも仕事でもない。嫌なら、私は絶対に何もしない｜＝｜{b}、これは命令でも仕事でもありません。嫌なら、私は絶対に何もしません」{b}は、上司のその言い方に少しだけ救われた。'),
heavyB:L('{b}は「{q}」の文字を見て青ざめた。{b}「{a}と、そんな……職場に戻れなくなる｜＝｜{a}と、そんな……職場に戻れなくなります」{a}「戻れるようにするのが、私の仕事だ｜＝｜戻れるようにするのが、私の仕事です」{a}は冗談めかして言ったが、目は真剣だった。'),
oneA:L('{a}「一人しか出られないなら、{b}が出て。部下を置いて先に出る上司はいない｜一人しか出られないなら、{b}が出ろ。部下を置いて先に出る上司はいない｜一人しか出られないなら、{b}が出てください。部下を置いて先に出る上司はいません」{b}「上司を置いて先に出る部下だって、いない｜上司を置いて先に出る部下も、いない｜上司を置いて先に出る部下だって、いません」二人はしばらく睨み合った。'),
oneB:L('{b}「{a}が出るべきだ。{a}がいないと、職場が回らない｜＝｜{a}が出るべきです。{a}がいないと、職場が回りません」{a}「私の代わりはいる。{b}の代わりはいない｜＝｜私の代わりはいます。{b}の代わりはいません」{b}は言い返せなかった。'),
consumeA:L('{a}は{q}を手に取り、{b}より先に口をつけた。{a}「何が入っているか分からない。最初は私が確かめる｜＝｜何が入っているか分かりません。最初は私が確かめます」'),
consumeB:L('{b}は{q}の数を数えて、{a}の分まで自分のほうに寄せた。{b}「こういうのは部下の仕事。{a}は無理しなくていい｜こういうのは部下の仕事だ。{a}は無理しなくていい｜こういうのは部下の仕事です。{a}は無理しなくていいですよ」'),
wordA:L('{a}「{q}か。{b}の評価面談なら、言うことはいくらでもあるんだけど｜{q}か。{b}の評価面談なら、言うことはいくらでもあるんだが｜{q}ですか。{b}の評価面談なら、言うことはいくらでもあるんですけど」{b}は笑っていいのか分からない顔をした。'),
wordB:L('{b}は{a}を前に、{q}を言うために何度も息を吸った。職場では一度も言えなかったことばかりが、喉の奥で渋滞していた。')
}
},
worship:{
A:L('{a}は、{b}が座る場所の床を袖で丁寧に拭ってから、{b}を座らせた。白い部屋のどこにいても、{a}の視線は{b}から離れなかった。|{a}「{b}がここにいるなら、この部屋だって悪くない｜{b}がここにいるなら、この部屋も悪くない｜{b}がここにいるなら、この部屋だって悪くありません」{a}は本気でそう言った。{b}がどんな顔をしても、{a}の目の色は変わらなかった。|{a}は{b}の言葉を一つも聞き漏らさないよう、{b}が口を開くたびに体ごと向き直った。'),
B:{
'':L('{b}は、{a}がずっと自分の世話を焼いていることを、ただの親切だと思っていた。{b}「{a}って、本当に面倒見がいい｜{a}は、本当に面倒見がいいな｜{a}って、本当に面倒見がいいですね」{a}は何も言わずに微笑んだ。|{b}は、{a}がいつも自分の少し後ろに座ることに気づかなかった。扉に何かあれば、{a}がいちばんに{b}の前へ出られる位置だった。'),
accept:L('{b}は{a}が差し出した水を、当たり前のように受け取った。{b}「ありがとう、{a}｜＝｜ありがとうございます、{a}」――その一言で、{a}は空腹も疲れも忘れた顔をした。|{b}は{a}の膝に頭を預けて目を閉じた。{a}は息をひそめて、その重さを噛みしめていた。'),
confused:L('{b}は、{a}の視線が自分から片時も離れないことに気づいて、落ち着かなげに膝を抱えた。{b}「{a}、そんなに見なくても、どこにも行かない｜＝｜{a}、そんなに見なくても、どこにも行きません」{a}「分かってる。それでも見ていたい｜分かっている。それでも見ていたい｜分かっています。それでも見ていたいんです」|{b}は、{a}が自分の分の食べ物まで差し出してくるのを、困った顔で押し返した。{b}「{a}も食べて。そういうのは、少し重い｜{a}も食べろ。そういうのは、少し重い｜{a}も食べてください。そういうのは、少し重いです」{a}は素直にうなずいて、それでも半分しか食べなかった。'),
dominate:L('{b}は壁にもたれたまま、指先だけで{a}を呼んだ。{a}はすぐに膝をついて{b}の前に控えた。{b}「肩が凝った｜＝｜肩が凝りました」――その一言で、{a}の両手はもう{b}の肩にあった。|{b}は{a}に、扉の紙を読み上げるよう命じた。{a}が読み終えると、{b}は「もう一度｜もう一度だ｜もう一度お願いします」と言った。{a}は何度でも、うれしそうに読み直した。'),
cherish:L('{b}は{a}の手を取って、自分の隣に座らせた。{b}「{a}、私の前でひざまずかなくていい。隣にいてくれればいい｜＝｜{a}、私の前でひざまずかなくていいです。隣にいてくれればいいんです」{a}は戸惑いながら、言われたとおりに隣に座った。|{b}は、{a}が自分のことばかりで眠っていないのに気づいて、毛布で{a}をくるんだ。{b}「今度は、私が{a}の番をする｜＝｜今度は、私が{a}の番をします」')
},
S:{
heavyL:L('{a}は扉の紙の「{q}」を読むと、迷わず{b}の前にひざまずいた。{a}「{b}が望むなら、私は何でも差し出す。お題のためでも、{b}のためなら喜んで｜＝｜{b}が望むなら、私は何でも差し出します。お題のためでも、{b}のためなら喜んで」|{a}「{q}なんて、{b}が嫌なら私が別の出口を探す。でも、{b}がいいと言うなら――私には、それ以上の幸せはない｜{q}など、{b}が嫌なら私が別の出口を探す。だが、{b}がいいと言うなら――私には、それ以上の幸せはない｜{q}なんて、{b}が嫌なら私が別の出口を探します。でも、{b}がいいと言うなら――私には、それ以上の幸せはありません」'),
heavyN:L('{a}は扉の紙の「{q}」を読むと、静かに首を振った。{a}「{b}に、したくないことはさせない。別の出口を、私が探す｜＝｜{b}に、したくないことはさせません。別の出口を、私が探します」{a}はそれから、一睡もせずに壁を調べ続けた。'),
heavyD:L('{b}は扉の紙の「{q}」を一瞥して、{a}に顎で示した。{b}「{a}、お題だ。私がいいと言うまで、そこで待っていて｜{a}、お題だ。私がいいと言うまで、そこで待っていろ｜{a}、お題です。私がいいと言うまで、そこで待っていてください」{a}は頬を染めて、うれしそうに頭を下げた。'),
oneA:L('{a}「一人しか出られないなら、出るのは{b}だ。{b}のいない外より、{b}を外に出せたこの部屋のほうがいい｜＝｜一人しか出られないなら、出るのは{b}です。{b}のいない外より、{b}を外に出せたこの部屋のほうがいいです」{a}は扉の前から一歩も動かなかった。'),
oneD:L('{b}「一人しか出られないなら、私が出る。{a}は、ここで私の帰りを待っていればいい｜＝｜一人しか出られないなら、私が出ます。{a}は、ここで私の帰りを待っていてください」{a}「{b}がそう言うなら｜＝｜{b}がそうおっしゃるなら」――{a}は少しもためらわなかった。'),
consumeA:L('{a}は{q}を全部自分の前に集めた。{a}「{b}の分も、私が飲む。{b}の体に、知らないものを入れさせたくない｜＝｜{b}の分も、私が飲みます。{b}の体に、知らないものを入れさせたくありません」'),
consumeD:L('{b}は{q}を{a}の前に押しやった。{b}「全部飲んで。{a}ならできる｜全部飲め。{a}ならできる｜全部飲んでください。{a}ならできます」{a}は一つ目に手を伸ばしながら、{b}に命じられたことをむしろ喜んでいた。'),
wordA:L('{a}は{q}を言う番が来ると、止まらなくなった。{b}の声、{b}の指、{b}の考え方――{a}がいつまでも並べ続けるので、{b}のほうが先に音を上げた。')
}
},
benefactor:{
A:L('{a}は、{b}がちゃんと食べて眠っているかを、昔と同じように気にかけていた。{a}「{b}、顔色が悪い。少し横になって｜{b}、顔色が悪い。少し横になれ｜{b}、顔色が悪いです。少し横になってください」|{a}「{b}が困ったときに手を出すのは、私の癖みたいなもの。気にしなくていい｜{b}が困ったときに手を出すのは、私の癖のようなものだ。気にしなくていい｜{b}が困ったときに手を出すのは、私の癖みたいなものです。気にしなくていいですよ」{a}はそう言って、扉の仕掛けの前に立った。'),
B:L('{b}は、{a}が壁を調べる間ずっと、そのすぐ後ろについて回った。{b}「{a}には返しきれない恩がある。ここでくらい、役に立ちたい｜＝｜{a}には返しきれない恩があります。ここでくらい、役に立ちたいんです」|{b}は、{a}に助けてもらったあの日のことを思い出していた。あのときの{a}の手の温かさを、{b}は今でも覚えていた。|{b}は{a}の寝床を整え、{a}の靴の埃まで払った。{a}が「そこまでしなくていい｜＝｜そこまでしなくていいです」と言っても、{b}の手は止まらなかった。'),
S:{
oneA:L('{a}「出るのは{b}だ。私が{b}を助けたのは、こんなところで終わらせるためじゃない｜出るのは{b}だ。私が{b}を助けたのは、こんなところで終わらせるためではない｜出るのは{b}です。私が{b}を助けたのは、こんなところで終わらせるためじゃありません」'),
oneB:L('{b}「一人しか出られないなら、{a}が出て。あのとき{a}が助けてくれなかったら、私は今ここにいない。だから、今度は私の番｜一人しか出られないなら、{a}が出ろ。あのとき{a}が助けてくれなかったら、私は今ここにいない。だから、今度は私の番だ｜一人しか出られないなら、{a}が出てください。あのとき{a}が助けてくれなかったら、私は今ここにいません。だから、今度は私の番です」'),
consumeB:L('{b}は{q}を{a}より先に手に取った。{b}「これは私が飲む。今度は、私が{a}を助ける番だから｜これは私が飲む。今度は、私が{a}を助ける番だ｜これは私が飲みます。今度は、私が{a}を助ける番ですから」'),
heavyA:L('{a}は「{q}」の文字を見て、{b}に言った。{a}「{b}、私に恩があるからって、無理に応じなくていい。それだけは忘れないで｜{b}、私に恩があるからといって、無理に応じなくていい。それだけは忘れるな｜{b}、私に恩があるからって、無理に応じなくていいです。それだけは忘れないでください」'),
heavyB:L('{b}は扉の紙の「{q}」を見て、{a}の前で唇を噛んだ。{b}「{a}に、恩返しのつもりでこんなことをさせたくない｜＝｜{a}に、恩返しのつもりでこんなことをさせたくありません」{a}「恩なんて、とっくに返してもらってる｜恩など、とっくに返してもらっている｜恩なんて、とっくに返してもらっていますよ」'),
wordB:L('{b}は{q}を言う番になると、{a}への感謝ばかりを並べた。{a}が「それ、お題と違う気がする｜それは、お題と違う気がする｜それ、お題と違う気がします」と言っても、{b}は止まらなかった。')
}
},
relative:{
x:L('{a}「{b}と二人きりって、親戚の集まりで子ども用の席に押し込まれて以来かも｜{b}と二人きりとは、親戚の集まりで子ども用の席に押し込まれて以来だろう｜{b}と二人きりって、親戚の集まりで子ども用の席に押し込まれて以来かもしれません」{b}「あのとき、{a}がジュースをこぼして、二人で怒られた｜＝｜あのとき、{a}がジュースをこぼして、二人で怒られましたね」|{a}と{b}は、子どものころ親戚の家で並んで寝た夏の話をした。白い天井を見上げると、あの家の木の天井を思い出した。|{b}「おばあちゃんに知られたら、二人とも説教だ｜＝｜おばあちゃんに知られたら、二人とも説教です」{a}「『あんたたちは昔から』で始まるやつ｜『あんたたちは昔から』で始まるあれだ｜『あんたたちは昔から』で始まるやつですね」二人は声をそろえて、その口癖をまねた。|{a}は、{b}が困ったときに耳を触る癖が、子どものころから変わっていないことに気づいて笑った。|{a}「出たら、正月にこの話をしよう。誰も信じないだろうけど｜出たら、正月にこの話をしよう。誰も信じないだろうが｜出たら、お正月にこの話をしましょう。誰も信じないでしょうけど」{b}「親戚中の話の種になる｜＝｜親戚中の話の種になりますね」'),
S:{
heavy:L('{a}と{b}は扉の紙の「{q}」を見て、同時に顔をしかめた。{a}「親戚どうしで、これは……」{b}「法事で顔を合わせられなくなる｜＝｜法事で顔を合わせられなくなります」'),
one:L('{b}「一人しか出られないなら、{a}が出て。{a}がいなくなったら、親戚中が泣く｜一人しか出られないなら、{a}が出ろ。{a}がいなくなったら、親戚中が泣く｜一人しか出られないなら、{a}が出てください。{a}がいなくなったら、親戚中が泣きます」{a}「{b}がいなくなっても同じ。だから二人で出る方法を探す｜{b}がいなくなっても同じだ。だから二人で出る方法を探す｜{b}がいなくなっても同じです。だから二人で出る方法を探しましょう」'),
consume:L('{a}は{q}を前に、子どものころ{b}に苦い薬を半分飲んでもらったことを思い出した。{a}「今回は、私が半分飲む｜＝｜今回は、私が半分飲みます」'),
word:L('{a}「{q}って、親戚に言うのはなんか照れる｜{q}を親戚に言うのは、なんだか照れる｜{q}って、親戚に言うのはなんだか照れますね」{b}「子どものころは、平気で言ってたのに｜子どものころは、平気で言っていたのにな｜子どものころは、平気で言っていたじゃないですか」')
}
}
};
function patLine(ctx,t,a,b){
var P=PAT[t.type],X=ctx.chars[t.a],Y=ctx.chars[t.b],s=sit(ctx,a,b),side,pool,S=P.S||{};
if(P.x){
pool=S[s]&&(s!=='heavy'||ctx.rng()<0.7)&&ctx.rng()<0.55?S[s]:P.x;
return[fmt(ctx,ctx.pick(pool),a,b),''];
}
side=a===X?'A':'B';
if(t.type==='worship'){
var dom=domOf(ctx,t);
var sk=s==='heavy'?(dom&&sexOk(ctx,X,Y)?'heavyD':heavyOk(ctx,X,Y)?'heavyL':'heavyN'):s==='one'?(dom?'oneD':'oneA'):s==='consume'?(dom?'consumeD':'consumeA'):s==='word'?'wordA':'';
if(sk&&ctx.rng()<0.5)return[fmt(ctx,ctx.pick(S[sk]),X,Y),'：部屋のお題と信仰'];
pool=side==='A'?P.A:P.B[dom?'dominate':t.cold||'']||P.B[''];
return[fmt(ctx,ctx.pick(pool),X,Y),side==='A'?'：信仰する側から':'：信仰される側から'];
}
var k=s+side,k2=s+(side==='A'?'B':'A');
var sp=S[k]||S[k2];
if(sp&&ctx.rng()<0.5)return[fmt(ctx,ctx.pick(sp),X,Y),'：部屋のお題と立場'];
return[fmt(ctx,ctx.pick(P[side]),X,Y),''];
}
scen.events.push({
id:'rt_pat',label:'昔からの縁で落ち込む相手を支える',cat:'bond',scope:'pair',
when:function(ctx,a,b){return!a.flags.down&& !b.flags.down&&hasTie(ctx,a,b);},
w:function(){return 0.85;},
run:function(ctx,a,b){
var t=tieOf(ctx,a,b),r=patLine(ctx,t,a,b);
ctx.mod2(a,b,{aff:2,trust:2},{aff:2,trust:2});
return{cat:'bond',text:r[0],why:ctx.chars[t.a].name+'と'+ctx.chars[t.b].name+'は'+LABEL[t.type]+r[1]};
}
});
var KEEP={
colleague:L('{b}の手が止まったのを見て、{a}は黙って隣に座った。{a}「締め切り前の徹夜よりはまし。あのときも二人で乗り切った｜締め切り前の徹夜よりはましだ。あのときも二人で乗り切った｜締め切り前の徹夜よりはましです。あのときも二人で乗り切りました」{b}は小さく笑って、もう一度扉の紙を読み直した。|{a}は{b}の肩を軽く叩いた。{a}「ここを出たら、まず二人で報告書を出そう。『出られない部屋に閉じ込められました』って｜ここを出たら、まず二人で報告書を出そう。『出られない部屋に閉じ込められました』とな｜ここを出たら、まず二人で報告書を出しましょう。『出られない部屋に閉じ込められました』って」{b}「誰も信じない｜＝｜誰も信じませんよ」二人は笑って、少しだけ肩の力が抜けた。|{a}と{b}は、職場の誰が今ごろ二人の空いた席に気づいているか、名前を挙げて当てっこをした。他愛ない話のうちに、白い部屋の息苦しさが少し遠のいた。'),
classmate:L('{b}がうつむいたままなのを見て、{a}は学生のころの話を始めた。文化祭の準備で夜遅くまで残ったこと、二人で先生に叱られたこと。{b}はいつの間にか笑っていた。|{a}「{b}、覚えてる？　修学旅行で迷子になったときも、結局なんとかなった｜{b}、覚えているか？　修学旅行で迷子になったときも、結局なんとかなった｜{b}、覚えていますか？　修学旅行で迷子になったときも、結局なんとかなりました」{b}「なんとかしたのは、私｜なんとかしたのは、私だ｜なんとかしたのは、私です」{a}「それ。今回もよろしく｜それだ。今回もよろしく頼む｜そうです。今回もよろしくお願いします」|{a}と{b}は、クラスの誰が今いちばん出世していそうかを言い合った。どうでもいい話のおかげで、白い部屋の時計の音が気にならなくなった。'),
bossA:L('{b}の呼吸が浅くなっているのに気づいて、{a}は{b}の正面にしゃがみ込んだ。{a}「{b}、私を見て。吸って、吐いて。……大丈夫、ここでも責任は私が持つ｜{b}、私を見ろ。吸って、吐け。……大丈夫だ、ここでも責任は私が持つ｜{b}、私を見てください。吸って、吐いて。……大丈夫です、ここでも責任は私が持ちます」{b}はゆっくりうなずいて、震える指を握りしめた。|{a}は{b}の肩に自分の上着を掛けた。{a}「職場でもここでも、{b}を守るのは私の役目だ｜＝｜職場でもここでも、{b}を守るのは私の役目です」{b}は上着の端を握って、小さくうなずいた。|{a}は扉の紙を前に固まる{b}に、一つずつ手順を区切って示した。{a}「全部いっぺんに考えなくていい。次にやることだけ考えて｜全部いっぺんに考えなくていい。次にやることだけ考えろ｜全部いっぺんに考えなくていいです。次にやることだけ考えてください」――それは、{b}が新人のころに{a}から教わったやり方だった。'),
bossB:L('{a}が壁を殴りかけた拳を、{b}が両手で包んで止めた。{b}「{a}が怪我をしたら、誰が指示を出すの｜{a}が怪我をしたら、誰が指示を出すんだ｜{a}が怪我をしたら、誰が指示を出すんですか」{a}は拳をほどいて、苦く笑った。|{b}は、{a}が一睡もしていないことに気づいていた。{b}「見張りは私がやる。{a}は少し休んで。これは部下からのお願い｜見張りは私がやる。{a}は少し休め。これは部下からの頼みだ｜見張りは私がやります。{a}は少し休んでください。これは部下からのお願いです」{a}は笑って、言われたとおりに目を閉じた。|{a}が自分を責めるようにうつむくと、{b}はきっぱりと言った。{b}「{a}のせいじゃない。こんな部屋、誰にも予想できない｜{a}のせいではない。こんな部屋、誰にも予想できない｜{a}のせいじゃありません。こんな部屋、誰にも予想できません」{a}は顔を上げて、{b}をしばらく見ていた。'),
worship:L('{a}は、{b}が眠っている間ずっと、扉と{b}の間に座っていた。{a}「{b}が目を覚ましたとき、最初に見るのが扉じゃなくて私ならいい｜{b}が目を覚ましたとき、最初に見るのが扉ではなく私ならいい｜{b}が目を覚ましたとき、最初に見るのが扉じゃなくて私ならいいんですけど」――独り言は、白い壁に吸い込まれた。|{a}は自分の分の食べ物を、何も言わずに{b}の手元に置いた。{b}が気づいて押し返しても、{a}は首を振って受け取らなかった。|{a}「{b}が笑ってくれるなら、私はそれで一日を生きられる｜＝｜{b}が笑ってくれるなら、私はそれで一日を生きられます」{b}が冗談だと思って笑うと、{a}は本当に満ち足りた顔をした。'),
worshipStill:L('{b}は苛立って、{a}に「もう構わないで｜もう構うな｜もう構わないでください」と言った。{a}はうなずいて一歩下がった。けれど、{b}が寒そうに肩をすくめたとき、毛布を掛けにきたのはやはり{a}だった。|{b}の冷たい言葉にも、{a}の目の色は変わらなかった。{a}「{b}が私を嫌いでもいい。私が{b}を想う理由は、{b}の気持ちとは関係ないから｜{b}が私を嫌いでもいい。私が{b}を想う理由は、{b}の気持ちとは関係ない｜{b}が私を嫌いでもいいんです。私が{b}を想う理由は、{b}の気持ちとは関係ありませんから」|{b}に突き放されたあと、{a}は壁際で一人膝を抱えていた。それでも、{b}が扉の紙の前で立ち止まったとき、真っ先に隣へ駆け寄ったのは{a}だった。'),
worshipDom:L('{b}は{a}に、部屋の隅から隅まで歩いて壁を確かめるよう命じた。{a}は何十往復でも文句一つ言わなかった。戻ってきた{a}の髪を、{b}は褒美のように一度だけ撫でた。|{b}「{a}、そこに座って。私がいいと言うまで動かないで｜{a}、そこに座れ。私がいいと言うまで動くな｜{a}、そこに座ってください。私がいいと言うまで動かないでください」{a}は言われたとおり、一時間でも動かなかった。{b}に従っている間、{a}はひどく穏やかな顔をしていた。|{b}は脚を組んで、{a}に靴を脱がせた。{a}はうやうやしくそれを受け取り、白い床に揃えて置いた。{b}「よくできた｜＝｜よくできました」――その一言を、{a}は宝物のように胸にしまった。'),
benefactor:L('{b}がうつむいていると、{a}は昔と同じように{b}の頭に手を置いた。{a}「大丈夫。前も、なんとかなった｜大丈夫だ。前も、なんとかなった｜大丈夫です。前も、なんとかなりました」{b}は、その手の重さに泣きそうになった。|{b}は{a}の手のひらの小さな傷に気づいて、手当てをした。{b}「{a}の手当てをするのは、これが初めてだ｜＝｜{a}の手当てをするのは、これが初めてです」{a}「上手になった｜＝｜上手になりましたね」|{a}が疲れて壁にもたれると、{b}はすかさず自分の上着を{a}の背中に挟んだ。{a}「ありがとう｜＝｜ありがとうございます」{b}「お礼を言うのは、いつも私のほうだったから｜お礼を言うのは、いつも私のほうだったからな｜お礼を言うのは、いつも私のほうでしたから」'),
relative:L('{b}が眠れずにいると、{a}は子どものころと同じように背中をとんとんと叩いた。{b}は「もう子どもじゃない｜もう子どもではない｜もう子どもじゃありません」と言いながら、すぐに眠ってしまった。|{a}「{b}が泣き虫だったころ、私がいつも手を引いてた｜{b}が泣き虫だったころ、私がいつも手を引いていた｜{b}が泣き虫だったころ、私がいつも手を引いていたんですよ」{b}「今は、私のほうが背が高い｜＝｜今は、私のほうが背が高いです」二人は言い合いながら、自然と並んで扉の前に立った。|{a}と{b}は、それぞれの親の近況を話し合った。遠い家の話をしている間だけは、閉じ込められていることを忘れられた。')
};
function keepKey(ctx,t){
var X=ctx.chars[t.a],Y=ctx.chars[t.b];
if(t.type==='boss')return Y.stress>=X.stress||ctx.rng()<0.3?'bossA':'bossB';
if(t.type==='worship'){
var ry=ctx.R(Y,X);
if(domOf(ctx,t)&&ctx.rng()<0.65)return'worshipDom';
if(ry.aff<10||ry.ten>25||t.cold==='confused')return ctx.rng()<0.6?'worshipStill':'worship';
return'worship';
}
return t.type;
}
scen.events.push({
id:'rt_keep',cat:'help',scope:'pair',
when:function(ctx,a,b){
if(a.flags.down||b.flags.down|| !hasTie(ctx,a,b))return false;
var pf=ctx.pair(a,b);
return pf.rtKeepAt==null||ctx.stepIndex-pf.rtKeepAt>=2;
},
w:function(ctx,a,b){return 0.6+Math.max(a.stress,b.stress)/120;},
run:function(ctx,a,b){
var t=tieOf(ctx,a,b),X=ctx.chars[t.a],Y=ctx.chars[t.b],k=keepKey(ctx,t),pf=ctx.pair(a,b);
pf.rtKeepAt=ctx.stepIndex;
var helped=k==='bossB'?X:k==='benefactor'||k==='worship'||k==='worshipStill'||k==='bossA'?Y:(a.stress>=b.stress?a:b);
if(k==='worshipStill')ctx.mod2(X,Y,{aff:3,trust:2},{trust:3,ten: -2});
else if(k==='worshipDom')ctx.mod2(X,Y,{aff:4,trust:4},{aff:2,trust:3});
else ctx.mod2(X,Y,{trust:4,aff:3},{trust:4,aff:3});
ctx.stress(helped,-6);
var why={bossA:'：上司が部下を落ち着かせる',bossB:'：部下が上司をかばう',worshipStill:'：冷たくされても、信仰する側の想いは揺らがない',worshipDom:'：信仰される側が命じ、信仰する側は喜んで従う',worship:'：信仰する側の献身'}[k]||'：いつもの関係を確かめ合う';
var sym= !HK.TIES[t.type].dir,A0=sym?(helped===a?b:a):X,B0=sym?helped:Y;
return{cat:'help',text:fmt(ctx,ctx.pick(KEEP[k]),A0,B0),why:X.name+'と'+Y.name+'は'+LABEL[t.type]+why};
}
});
var GROW={
colleague:{
deep:L('{a}は、職場では言ったことのない話を{b}にした。仕事は好きなのに、ときどき全部投げ出したくなること。{b}「私もだ。{a}がいるから続いてるだけ｜私もだ。{a}がいるから続いているだけだ｜私もです。{a}がいるから続いているだけです」二人は、同僚という言葉では足りないものを、白い部屋で確かめ合った。|{b}「出たら、仕事の話抜きで一度ご飯に行こう｜出たら、仕事の話抜きで一度食事に行こう｜出たら、仕事の話抜きで一度ご飯に行きましょう」{a}「仕事の話抜きで、何を話すの｜仕事の話抜きで、何を話すんだ｜仕事の話抜きで、何を話すんですか」{b}「それを、ここで考えておく｜＝｜それを、ここで考えておきましょう」――{a}は思わず笑って、うなずいた。|{a}と{b}は、扉の仕掛けを解く手がかりを二人で一つずつ潰していった。言葉にしなくても相手の次の手が分かる。職場で積み上げてきた信頼が、ここでは命綱になっていた。'),
love:L('{a}は、隣で考え込む{b}の横顔を見ていた。職場で毎日見ているはずの顔が、白い照明の下ではまるで違って見えた。{a}「{b}、私、たぶんずっと前から{b}のことが気になってた｜{b}、私は、たぶんずっと前から{b}のことが気になっていた｜{b}、私、たぶんずっと前から{b}のことが気になっていました」{b}は動きを止めて、{a}を見た。|{b}「職場では、こういうこと言えないから｜職場では、こういうことは言えないからな｜職場では、こういうこと言えませんから」{b}は{a}の袖を引いた。{b}「{a}のこと、同僚としてだけ見るのは、もう無理みたい｜{a}を、同僚としてだけ見るのは、もう無理なようだ｜{a}のこと、同僚としてだけ見るのは、もう無理みたいです」――扉の紙より先に、{a}の顔が熱くなった。|{a}と{b}は、壁にもたれて肩を並べていた。いつもならデスク一つぶん空いている距離が、今日はなかった。どちらからともなく手が触れて、どちらも離さなかった。')
},
classmate:{
deep:L('{b}は、卒業してから一度も連絡しなかった理由を、ぽつりと話した。{b}「忙しかったんじゃなくて、{a}に今の自分を見られるのが嫌だった｜忙しかったのではなく、{a}に今の自分を見られるのが嫌だった｜忙しかったんじゃなくて、{a}に今の自分を見られるのが嫌だったんです」{a}「私も同じこと考えてた｜私も同じことを考えていた｜私も同じことを考えていました」――学生のころには言えなかった話を、二人は一つずつ埋めていった。|{a}「出たら、ちゃんと連絡先を交換し直そう。今度は途切れないように｜＝｜出たら、ちゃんと連絡先を交換し直しましょう。今度は途切れないように」{b}「卒業式の日も、同じこと言ってた｜卒業式の日も、同じことを言っていた｜卒業式の日も、同じことを言っていましたよ」{a}「今度は本当｜今度は本当だ｜今度は本当です」{b}は、学生のころと同じ顔で笑った。|{a}と{b}は、同じクラスにいたのに知らなかったお互いの話をした。部活のこと、家のこと、進路で迷ったこと。白い部屋で、二人の間の空白の年月が少しずつ縮んでいった。'),
love:L('{a}は、学生のころ{b}の後ろ姿ばかり見ていたことを打ち明けた。{a}「言えないまま卒業したの、ずっと心残りだった｜言えないまま卒業したのが、ずっと心残りだった｜言えないまま卒業したの、ずっと心残りでした」{b}はしばらく黙っていたが、やがて{a}の手に自分の手を重ねた。{b}「……私も、{a}のこと見てた｜……私も、{a}のことを見ていた｜……私も、{a}のことを見ていました」|{b}「同じクラスだったとき、{a}のこと好きだった｜同じクラスだったとき、{a}のことが好きだった｜同じクラスだったとき、{a}のことが好きでした」{b}は白い壁に向かって言った。{b}「こんなところで言うことになるとは思わなかった｜＝｜こんなところで言うことになるとは思いませんでした」{a}は{b}の隣に座り直し、{b}の肩にそっと頭を預けた。|{a}と{b}は、卒業アルバムの話をしていたはずだった。気づけば二人は、学生のころよりずっと近い距離で、お互いの目を見ていた。')
},
boss:{
deep:L('{a}は扉の前で、ふっと肩の力を抜いた。{a}「{b}、ここには職場も役職もない。ここでは、私をただの{a}として扱って｜{b}、ここには職場も役職もない。ここでは、私をただの{a}として扱え｜{b}、ここには職場も役職もありません。ここでは、私をただの{a}として扱ってください」{b}は少し迷ってから、初めて肩書き抜きで{a}の名前を呼んだ。|{b}は、職場ではずっと言えなかった案を{a}に話した。扉の仕掛けについての、少し無茶な案だった。{a}「……いい案だ。どうして今まで黙ってた｜……いい案だ。どうして今まで黙っていた｜……いい案です。どうして今まで黙っていたんですか」{b}「上司に意見するのが怖かった｜＝｜上司に意見するのが怖かったんです」{a}「これからは、遠慮なく言って｜これからは、遠慮なく言え｜これからは、遠慮なく言ってください」――二人の間の段差が、一つ低くなった。|{a}は{b}に、今の立場になったばかりのころの失敗を話した。誰にも話したことのない話だった。{b}「{a}にも、そんなときがあったんだ｜{a}にも、そんなときがあったのか｜{a}にも、そんなときがあったんですね」{b}は初めて、上司ではない{a}の顔を見た気がした。'),
love:L('{a}は、{b}の寝顔を見ながら長いこと黙っていた。上司として、言ってはいけないと思っていた言葉があった。{b}が目を開けたとき、{a}はとうとうそれを口にした。{a}「{b}、私は、部下としてだけ{b}を見ていたわけじゃない｜{b}、私は、部下としてだけ{b}を見ていたわけではない｜{b}、私は、部下としてだけ{b}を見ていたわけじゃありません」|{b}「出たら、私、異動の希望を出す｜出たら、私は異動の希望を出す｜出たら、私、異動の希望を出します」{a}が顔を上げると、{b}は真っ赤な顔で続けた。{b}「{a}の部下のままだと、{a}を好きでいられないから｜{a}の部下のままでは、{a}を好きでいられないからだ｜{a}の部下のままだと、{a}を好きでいられませんから」|{a}と{b}は、職場では決して並ばない距離で座っていた。{a}の手が{b}の手に重なっても、{b}はもう、誰かに見られたらとは言わなかった。')
},
worship:{
love:L('{a}は、ずっと胸の内に置いてきた言葉を、とうとう{b}に告げた。{a}「{b}を崇めるだけじゃ足りなくなった。{b}に、触れたい｜{b}を崇めるだけでは足りなくなった。{b}に、触れたい｜{b}を崇めるだけじゃ足りなくなりました。{b}に、触れたいです」{b}は驚いた顔で{a}を見て、それから、そっと{a}の頬に手を添えた。|{b}「{a}は、私を見上げてばかりいる｜＝｜{a}は、私を見上げてばかりいますね」{b}は{a}の顎を指ですくって、目の高さを合わせた。{b}「たまには、同じ高さで見て｜たまには、同じ高さで見ろ｜たまには、同じ高さで見てください」――{a}の目に映った{b}は、崇める相手ではなく、一人の人だった。|{a}は、{b}の手の甲に唇を寄せた。祈るような口づけだった。けれど{b}が手を返して{a}の指を握ったとき、それは祈りではなくなった。'),
dom:L('{b}は{a}を足元に座らせ、その首筋に指を這わせた。{b}「{a}は、誰のもの？｜{a}は、誰のものだ？｜{a}は、誰のものですか？」{a}「{b}のもの｜{b}のものだ｜{b}のものです」――{a}の答えには、一片の迷いもなかった。白い部屋で、二人の上下はいっそうはっきりと形になった。|{b}は、{a}に一つずつ約束をさせた。ここを出ても{b}のそばを離れないこと。{b}以外の誰の言葉にも従わないこと。{a}は一つ約束するたびに、うれしそうにうなずいた。|{b}は{a}の手首を掴み、印をつけるように強く握った。痕が残るほどの力だったのに、{a}はその痕を愛おしそうに撫でた。{a}「{b}が残してくれたものなら、何でもうれしい｜＝｜{b}が残してくれたものなら、何でもうれしいです」'),
'':L('{b}は、{a}が自分のために何度も無茶をしていることに、ようやく気づいた。{b}「{a}、どうしてそこまでしてくれるの｜{a}、どうしてそこまでしてくれるんだ｜{a}、どうしてそこまでしてくれるんですか」{a}は答えずに、ただ微笑んだ。{b}の中で、{a}を見る目が少し変わった。|{b}は、扉の前でいつも自分をかばう位置に立つ{a}に気づいた。{b}「{a}、もしかして、ずっとそうしてた？｜{a}、もしかして、ずっとそうしていたのか？｜{a}、もしかして、ずっとそうしていたんですか？」{a}「{b}が気づかなくても、私は同じことをした｜＝｜{b}が気づかなくても、私は同じことをしました」'),
accept:L('{b}は、{a}が差し出す献身を、拒まずに受け取ると決めた。{b}「{a}がそうしたいなら、私はそれを受け取る。その代わり、無理はしないで｜{a}がそうしたいなら、私はそれを受け取る。その代わり、無理はするな｜{a}がそうしたいなら、私はそれを受け取ります。その代わり、無理はしないでください」{a}は、許された喜びに目を潤ませた。|{b}は{a}に、自分の世話を焼く役目を正式に任せると言った。{a}は、白い部屋でいちばん大切な仕事をもらったように背筋を伸ばした。'),
confused:L('{b}「{a}、私はそんなに立派な人じゃない｜{a}、私はそんなに立派な人間ではない｜{a}、私はそんなに立派な人じゃありません」{b}は、重荷を下ろすように言った。{a}「知ってる。それでも、私にとっては{b}がすべてだ｜知っている。それでも、私にとっては{b}がすべてだ｜知っています。それでも、私にとっては{b}がすべてです」――{b}は困った顔で笑うしかなかった。|{b}は、{a}の想いの重さに耐えかねて、正直に「少し怖い｜＝｜少し怖いです」と言った。{a}は傷ついた顔もせずにうなずいた。{a}「{b}が怖くない距離にいる。それでも、そばにはいる｜＝｜{b}が怖くない距離にいます。それでも、そばにはいます」'),
cherish:L('{b}は{a}の両手を握った。{b}「{a}が私を大事にしてくれるぶん、私も{a}を大事にしたい｜＝｜{a}が私を大事にしてくれるぶん、私も{a}を大事にしたいです」{a}は、信じていたものに初めて手を握り返されたような顔をした。|{b}は、{a}が自分のために削ってきたものを一つずつ数えて、{a}に返していった。眠る時間、食べる分、笑う余裕。{a}は戸惑いながら、それを受け取った。')
},
benefactor:{
deep:L('{b}は、{a}が眠っている間に、一人で扉の仕掛けを最後まで調べ上げた。目を覚ました{a}に、{b}は書き出した手がかりを差し出した。{b}「今度は、私が{a}を助ける｜＝｜今度は、私が{a}を助けます」{a}はしばらく何も言えなかった。|{a}が弱音をこぼしたとき、{b}は迷わず{a}の手を握った。{b}「{a}があの日してくれたことを、今、全部返す｜＝｜{a}があの日してくれたことを、今、全部返します」――助けられる側だった{b}の手は、もう震えていなかった。|{b}「恩返しのつもりだった。でも、もう違う。{a}が大事だから、助けたい｜恩返しのつもりだった。だが、もう違う。{a}が大事だから、助けたい｜恩返しのつもりでした。でも、もう違います。{a}が大事だから、助けたいんです」{a}は、助けたはずの相手に助けられている自分に気づいて、照れくさそうに笑った。'),
love:L('{b}は、感謝と呼んでいた気持ちの正体に、白い部屋でようやく気づいた。{b}「{a}、恩人としてじゃなく、{a}のことが好きだ｜{a}、恩人としてではなく、{a}のことが好きだ｜{a}、恩人としてじゃなく、{a}のことが好きです」{a}は目を見開いて、それから、{b}の手をそっと握り返した。|{a}は、助けたあの日から{b}を見守ってきた。いつの間にか、見守るだけでは足りなくなっていた。{a}「{b}、私はもう、{b}の恩人のままでいたくない｜＝｜{b}、私はもう、{b}の恩人のままでいたくありません」|{b}は{a}の胸に額を押しあてた。{b}「返しきれないなら、ずっとかけて返す。そばにいさせて｜返しきれないなら、ずっとかけて返す。そばにいさせてくれ｜返しきれないなら、ずっとかけて返します。そばにいさせてください」{a}は答えの代わりに、{b}の背中を抱きしめた。')
},
relative:{
deep:L('{b}は、家族にも言えずにいた悩みを、{a}にだけ打ち明けた。{a}は黙って最後まで聞いてから、{b}の肩を抱いた。{a}「親戚なんて遠いと思ってたけど、{b}のことは、ちゃんと家族だと思ってる｜親戚など遠いと思っていたが、{b}のことは、ちゃんと家族だと思っている｜親戚なんて遠いと思っていましたけど、{b}のことは、ちゃんと家族だと思っています」|{a}「出たら、一度うちに遊びに来て。子どものころみたいに｜出たら、一度うちに遊びに来い。子どものころのように｜出たら、一度うちに遊びに来てください。子どものころみたいに」{b}「もうお年玉はもらえないけど｜もうお年玉はもらえないがな｜もうお年玉はもらえませんけど」{a}「それは私も｜それは私もだ｜それは私もです」――二人は笑って、子どものころの約束をもう一度した。|{a}と{b}は、亡くなった祖父の話をした。二人とも同じ口癖を覚えていて、同じところで笑った。つながった血が、白い部屋の中で静かに温かかった。'),
love:L('{a}は、子どものころから{b}を特別だと思っていたことを打ち明けた。{a}「親戚だから、ずっと言っちゃいけないと思ってた｜親戚だから、ずっと言ってはいけないと思っていた｜親戚だから、ずっと言ってはいけないと思っていました」{b}は長い沈黙のあと、{a}の手を握った。{b}「……私も、同じだった｜＝｜……私も、同じでした」|{b}「正月に会うたびに、{a}のことを目で追ってた。親戚の誰にも、気づかれないように｜正月に会うたびに、{a}のことを目で追っていた。親戚の誰にも、気づかれないように｜お正月に会うたびに、{a}のことを目で追っていました。親戚の誰にも、気づかれないように」{a}は、子どものころとは違う意味で、{b}の手を引いた。|{a}と{b}は、子どものころに並んで寝た夏の話をしていた。話が途切れたとき、二人はあのころよりずっと近くで、お互いの息づかいを聞いていた。')
}
};
var GROW_WHY={
colleague:{deep:'：仕事仲間から、仕事抜きでも信じ合える仲へ',love:'：同僚から恋へ'},
classmate:{deep:'：昔話から、もう一度近づく',love:'：同級生から恋へ'},
boss:{deep:'：職場の外で、対等に信頼し合う',love:'：上司と部下から恋へ'},
worship:{love:'：信仰が恋に変わる（恋愛に発展：する）',dom:'：支配と服従が深まる（信仰される側が支配している）','':'：信仰される側が、想いに気づき始める',accept:'：信仰される側が、献身を受け入れる',confused:'：信仰される側は戸惑うが、信仰する側は揺らがない',cherish:'：信仰される側も、相手を大切にし返す'},
benefactor:{deep:'：恩を受けた側が、今度は恩人を助ける',love:'：恩が恋に変わる'},
relative:{deep:'：家族としての絆',love:'：親族から恋へ（恋愛：あり）'}
};
function growKind(ctx,t){
var X=ctx.chars[t.a],Y=ctx.chars[t.b],rx=ctx.R(X,Y),ry=ctx.R(Y,X);
var lv=loveOk(ctx,X,Y)&&(rx.att+ry.att>45||(rx.att>30||ry.att>30)&&rx.aff+ry.aff>70)&&ctx.rng()<0.65;
if(t.type==='worship'){
if(lv&&t.love==='ok')return'love';
if(domOf(ctx,t))return'dom';
return t.cold||'';
}
return lv?'love':'deep';
}
scen.events.push({
id:'rt_grow',label:'閉じ込められて関係が深まる',cat:'bond',scope:'pair',
when:function(ctx,a,b){
if(a.flags.down||b.flags.down||ctx.stepIndex<1|| !hasTie(ctx,a,b))return false;
var pf=ctx.pair(a,b);
return(pf.rtGrow||0)<3&&(pf.rtGrowAt==null||ctx.stepIndex-pf.rtGrowAt>=2);
},
w:function(ctx,a,b){return 0.55+Math.max(0,ctx.R(a,b).trust+ctx.R(b,a).trust)/200;},
run:function(ctx,a,b){
var t=tieOf(ctx,a,b),X=ctx.chars[t.a],Y=ctx.chars[t.b],k=growKind(ctx,t),pf=ctx.pair(a,b);
pf.rtGrow=(pf.rtGrow||0)+1;pf.rtGrowAt=ctx.stepIndex;
var pool=GROW[t.type][k]||GROW[t.type].deep||GROW[t.type][''];
var cat=k==='love'?'romance':'bond';
if(k==='love')ctx.mod2(X,Y,{att:8,aff:5,trust:3},{att:8,aff:5,trust:3});
else if(k==='dom')ctx.mod2(X,Y,{aff:5,trust:6},{aff:3,trust:4,ten: -2});
else if(t.type==='worship')ctx.mod2(X,Y,{aff:3,trust:3},k==='confused'?{trust:3}:{aff:5,trust:5});
else if(t.type==='benefactor')ctx.mod2(X,Y,{trust:6,aff:5},{trust:4,aff:4});
else ctx.mod2(X,Y,{trust:6,aff:4},{trust:6,aff:4});
var A0=X,B0=Y;
if(!HK.TIES[t.type].dir&&ctx.rng()<0.5){A0=Y;B0=X;}
return{cat:cat,text:fmt(ctx,ctx.pick(pool),A0,B0),why:X.name+'と'+Y.name+'は'+LABEL[t.type]+(GROW_WHY[t.type][k]||''),mag:k==='love'||k==='dom'?14:8};
}
});
HK.RoomTie={tieOf:tieOf,loveOk:loveOk,heavyOk:heavyOk,sexOk:sexOk,domOf:domOf,TYPES:TYPES};
})();
});
;
/* ==== js/room-tie-more.js ==== */
HK.Load.def(79,'js/room-tie-more.js',function(){
(function(){
'use strict';
var HK=window.HK,scen=HK.SCENARIOS&&HK.SCENARIOS.whiteroom;
if(!scen|| !HK.RoomAPI|| !HK.Ties|| !HK.TIES)return;
var API=HK.RoomAPI;
function L(s){return s.split('|');}
var PK=['proud','stern','tsun','gentle','devoted','cool','free','shy','polite'];
function per(c){var k=c&&(c.persona||(HK.personaOf&&HK.personaOf(c)))||'gentle';return PK.indexOf(k)>=0?k:'gentle';}
function P9(o){var r={};PK.forEach(function(k){r[k]=L(o[k]||o.gentle);});return r;}
function free(c){return!!c&&(HK.State?HK.State.canAct(c):c.alive!==false)&& !(c.flags&&(c.flags.caged!=null||c.flags.cagePair!=null||c.flags.down));}
var SAY={
pal:{
warm:P9({
proud:'{a}「この程度で参るほど、私たちはやわじゃない。でしょ？｜この程度で参るほど、私たちはやわではない。そうだろう｜この程度で参るほど、私たちはやわではありません。そうでしょう？」',
stern:'{a}「焦るな、とは言わない。でも、焦っても扉は開かない｜焦るなとは言わない。だが、焦っても扉は開かない｜焦るな、とは申しません。でも、焦っても扉は開きません」',
tsun:'{a}「べ、別に心配してるわけじゃない。……隣、空いてたから座っただけ｜べ、別に心配しているわけではない。……隣が空いていたから座っただけだ｜べ、別に心配しているわけじゃありません。……隣が空いていたから座っただけです」',
gentle:'{a}「大丈夫。あなたが一人で抱え込まなくていいように、私がいる｜大丈夫だ。あなたが一人で抱え込まなくていいように、私がいる｜大丈夫です。あなたが一人で抱え込まなくていいように、私がいます」',
devoted:'{a}「あなたのためなら、壁だって一晩中叩いていられる｜あなたのためなら、壁でも一晩中叩いていられる｜あなたのためなら、壁だって一晩中叩いていられます」',
cool:'{a}「状況は悪くない。水はあるし、時間もある。あなたもいる｜＝｜状況は悪くありません。水はありますし、時間もあります。あなたもいます」',
free:'{a}「せっかくだし、出たらこの話で一晩笑えるようにしよう｜せっかくだ、出たらこの話で一晩笑えるようにしよう｜せっかくですし、出たらこの話で一晩笑えるようにしましょう」',
shy:'{a}「あ、あの……一人だったら、きっと泣いてた。あなたがいてよかった｜あ、あの……一人だったら、きっと泣いていた。あなたがいてよかった｜あ、あの……一人だったら、きっと泣いていました。あなたがいてよかったです」',
polite:'{a}「お互い、無理はなしにしよう。疲れたら、ちゃんと言って｜お互い、無理はなしにしよう。疲れたら、ちゃんと言え｜お互い、無理はなしにしましょう。疲れたら、ちゃんと言ってください」'
}),
rub:P9({
proud:'{a}「あなたの段取りに任せてたら、日が暮れる。私がやる｜あなたの段取りに任せていたら、日が暮れる。私がやる｜あなたの段取りにお任せしていたら、日が暮れます。私がやります」',
stern:'{a}「さっきから同じところばかり見てる。もっと頭を使って｜さっきから同じところばかり見ている。もっと頭を使え｜さっきから同じところばかり見ています。もっと頭を使ってください」',
tsun:'{a}「ちょっと、近い。……狭いんだから、もうちょっとそっち寄って｜おい、近い。……狭いんだ、もう少しそっちへ寄れ｜ちょっと、近いです。……狭いんですから、もう少しそちらへ寄ってください」',
gentle:'{a}「ごめん、少しだけ頭を冷やさせて。あなたのせいじゃないから｜すまない、少しだけ頭を冷やさせてくれ。あなたのせいではない｜ごめんなさい、少しだけ頭を冷やさせてください。あなたのせいじゃありませんから」',
devoted:'{a}「私ばっかり気を回してる気がする。……ううん、何でもない｜私ばかり気を回している気がする。……いや、何でもない｜私ばかり気を回している気がします。……いえ、何でもありません」',
cool:'{a}「その案、三回目。結果は同じだと思う｜その案は三回目だ。結果は同じだと思う｜その案、三回目です。結果は同じだと思います」',
free:'{a}「そんな顔してたら、扉のほうが引くって｜そんな顔をしていたら、扉のほうが引くぞ｜そんな顔をしていたら、扉のほうが引きますよ」',
shy:'{a}「……あの、もう少しだけ、相談してほしかった｜……あの、もう少しだけ、相談してほしかった｜……あの、もう少しだけ、相談してほしかったです」',
polite:'{a}「言い方を考えて。こっちも余裕がないんだから｜言い方を考えてくれ。こちらも余裕がないんだ｜言い方を考えてください。こちらも余裕がないんですから」'
})
},
love:{
warm:P9({
proud:'{a}「閉じ込められた相手が私で、運がよかったと思って｜閉じ込められた相手が私で、運がよかったと思え｜閉じ込められた相手が私で、運がよかったと思ってください」',
stern:'{a}「離れないで。……この部屋では、それだけ守って｜離れるな。……この部屋では、それだけ守れ｜離れないでください。……この部屋では、それだけ守ってください」',
tsun:'{a}「別に、くっつきたいわけじゃない。寒いだけ｜別に、くっつきたいわけではない。寒いだけだ｜別に、くっつきたいわけじゃありません。寒いだけです」',
gentle:'{a}「どこにいても、あなたの隣なら平気｜どこにいても、あなたの隣なら平気だ｜どこにいても、あなたの隣なら平気です」',
devoted:'{a}「あなたが眠るまで、ずっと起きてる｜あなたが眠るまで、ずっと起きている｜あなたが眠るまで、ずっと起きています」',
cool:'{a}「脱出の手順は考えた。あなたを置いていく手順は、一つもない｜＝｜脱出の手順は考えました。あなたを置いていく手順は、一つもありません」',
free:'{a}「白い部屋に二人きりって、ちょっとした旅行みたい｜白い部屋に二人きりとは、ちょっとした旅行のようだ｜白い部屋に二人きりって、ちょっとした旅行みたいですね」',
shy:'{a}「……手、つないでてもいい？　少しだけ｜……手を、つないでいてもいいか。少しだけ｜……手、つないでいてもいいですか。少しだけ」',
polite:'{a}「疲れたら、私の肩を使って。遠慮はなしで｜疲れたら、私の肩を使え。遠慮はなしだ｜疲れたら、私の肩を使ってください。遠慮はなしで」'
}),
rub:P9({
proud:'{a}「さっき、ほかの人と楽しそうだった。……別に、気にしてないけど｜さっき、ほかの者と楽しそうだった。……別に、気にしてはいないが｜さっき、ほかの方と楽しそうでした。……別に、気にしていませんけど」',
stern:'{a}「勝手に一人で無茶をしないで。私に相談してから｜勝手に一人で無茶をするな。私に相談してからにしろ｜勝手に一人で無茶をしないでください。私に相談してからにしてください」',
tsun:'{a}「なんで私より先に、扉の紙を読んでるの｜なぜ私より先に、扉の紙を読んでいる｜なぜ私より先に、扉の紙を読んでいるんですか」',
gentle:'{a}「私にだけは、強がらないでほしかった｜＝｜私にだけは、強がらないでほしかったです」',
devoted:'{a}「私がいなくても、平気そうに見える。……それが、少し寂しい｜＝｜私がいなくても、平気そうに見えます。……それが、少し寂しいです」',
cool:'{a}「感情的になってる。今のあなたの判断は、信用できない｜感情的になっている。今のあなたの判断は、信用できない｜感情的になっています。今のあなたの判断は、信用できません」',
free:'{a}「そんなに眉間にしわ寄せてると、キスしにくいんだけど｜そんなに眉間にしわを寄せていると、口づけしにくいんだが｜そんなに眉間にしわを寄せていると、キスしにくいんですけど」',
shy:'{a}「……もう少し、こっちを見てくれてもいいのに｜……もう少し、こちらを見てくれてもいいのに｜……もう少し、こちらを見てくださってもいいのに」',
polite:'{a}「一人で決めないで。私たちは二人で閉じ込められてる｜一人で決めるな。私たちは二人で閉じ込められている｜一人で決めないでください。私たちは二人で閉じ込められているんです」'
})
},
kin:{
warm:P9({
proud:'{a}「家族が一緒なんだ。負けるわけがない｜＝｜家族が一緒なんです。負けるわけがありません」',
stern:'{a}「顔を上げて。うちの者が、こんな部屋に負けてどうする｜顔を上げろ。うちの者が、こんな部屋に負けてどうする｜顔を上げてください。うちの者が、こんな部屋に負けてどうするんですか」',
tsun:'{a}「……心配なんかしてない。家族だから、隣にいるだけ｜……心配などしていない。家族だから、隣にいるだけだ｜……心配なんかしていません。家族だから、隣にいるだけです」',
gentle:'{a}「家に帰ったら、温かいものを作る。何が食べたい？｜家に帰ったら、温かいものを作る。何が食べたい｜家に帰ったら、温かいものを作りますね。何が食べたいですか」',
devoted:'{a}「あなたが無事なら、それでいい。家族の分まで、私が頑張る｜＝｜あなたが無事なら、それでいいんです。家族の分まで、私が頑張ります」',
cool:'{a}「家の鍵、開けっぱなしかもしれない。……まあ、出てから考えよう｜家の鍵は、開けたままかもしれない。……まあ、出てから考えよう｜家の鍵、開けたままかもしれません。……まあ、出てから考えましょう」',
free:'{a}「家族旅行が、まさか白い部屋になるとはね｜家族旅行が、まさか白い部屋になるとはな｜家族旅行が、まさか白い部屋になるとは思いませんでした」',
shy:'{a}「……昔みたいに、隣で寝てもいい？｜……昔のように、隣で寝てもいいか｜……昔みたいに、隣で寝てもいいですか」',
polite:'{a}「困ったときは、お互いさまだから。遠慮しないで｜困ったときは、お互いさまだ。遠慮するな｜困ったときは、お互いさまですから。遠慮しないでください」'
}),
rub:P9({
proud:'{a}「家でも外でも、あなたはいつも私の言うことを聞かない｜＝｜家でも外でも、あなたはいつも私の言うことを聞きませんね」',
stern:'{a}「小さいころから言ってる。考えてから動いて｜小さいころから言っている。考えてから動け｜小さいころから言っています。考えてから動いてください」',
tsun:'{a}「うるさい。家族だからって、何でも分かったような顔しないで｜うるさい。家族だからといって、何でも分かったような顔をするな｜うるさいです。家族だからって、何でも分かったような顔をしないでください」',
gentle:'{a}「家族なのに、どうしてこんなにすれ違うんだろう｜＝｜家族なのに、どうしてこんなにすれ違うんでしょう」',
devoted:'{a}「私は、いつだってあなたの味方のつもりだった。……伝わってなかったんだね｜私は、いつでもあなたの味方のつもりだった。……伝わっていなかったんだな｜私は、いつだってあなたの味方のつもりでした。……伝わっていなかったんですね」',
cool:'{a}「昔から、肝心なときに限って感情で動く。誰に似たんだか｜昔から、肝心なときに限って感情で動く。誰に似たのか｜昔から、肝心なときに限って感情で動きますね。誰に似たんでしょう」',
free:'{a}「出たら、この件は親戚中に言いふらす。覚悟して｜出たら、この件は親戚中に言いふらす。覚悟しろ｜出たら、この件は親戚中に言いふらします。覚悟してください」',
shy:'{a}「……家族の前だと、うまく言えない。ずっと、そうだった｜＝｜……家族の前だと、うまく言えません。ずっと、そうでした」',
polite:'{a}「家族だからこそ、言っていいことと悪いことがある｜＝｜家族だからこそ、言っていいことと悪いことがあります」'
})
},
guideA:{
warm:P9({
proud:'{a}「私の教え子なら、この程度の部屋で取り乱さない｜私の教え子なら、この程度の部屋で取り乱すな｜私の教え子なら、この程度の部屋で取り乱さないでください」',
stern:'{a}「教えたとおりにやればいい。一つずつ、確かめて｜教えたとおりにやればいい。一つずつ確かめろ｜教えたとおりにやればいいんです。一つずつ、確かめてください」',
tsun:'{a}「あなたのためじゃない。教えた身として、放っておけないだけ｜あなたのためではない。教えた身として、放っておけないだけだ｜あなたのためじゃありません。教えた身として、放っておけないだけです」',
gentle:'{a}「よく頑張ってる。ここを出たら、ちゃんと褒めさせて｜よく頑張っている。ここを出たら、ちゃんと褒めさせてくれ｜よく頑張っていますね。ここを出たら、ちゃんと褒めさせてください」',
devoted:'{a}「あなたを無事に帰すのが、私の最後の授業でもいい｜＝｜あなたを無事に帰すのが、私の最後の授業でも構いません」',
cool:'{a}「問題を分けて考えよう。扉、紙、時間。解けない問題はない｜問題を分けて考えろ。扉、紙、時間だ。解けない問題はない｜問題を分けて考えましょう。扉、紙、時間です。解けない問題はありません」',
free:'{a}「課外授業にしては、ちょっと難しすぎるね｜課外授業にしては、少し難しすぎるな｜課外授業にしては、少し難しすぎますね」',
shy:'{a}「……教える側なのに、頼りなくてごめん｜……教える側なのに、頼りなくてすまない｜……教える側なのに、頼りなくてごめんなさい」',
polite:'{a}「分からないことは、遠慮なく聞いて。ここでも、それは同じ｜分からないことは、遠慮なく聞け。ここでも、それは同じだ｜分からないことは、遠慮なく聞いてください。ここでも、それは同じです」'
}),
rub:P9({
proud:'{a}「何度言わせるの。人の話は最後まで聞いて｜何度言わせる。人の話は最後まで聞け｜何度言わせるんですか。人の話は最後まで聞いてください」',
stern:'{a}「勝手な真似はしないで。ここでも、私の指示に従って｜勝手な真似をするな。ここでも、私の指示に従え｜勝手な真似はしないでください。ここでも、私の指示に従ってください」',
tsun:'{a}「ほら、だから言ったのに。……怪我は？｜ほら、だから言ったのに。……怪我はないか｜ほら、だから言ったのに。……お怪我はありませんか」',
gentle:'{a}「焦る気持ちは分かる。でも、今のは危なかった｜焦る気持ちは分かる。だが、今のは危なかった｜焦るお気持ちは分かります。でも、今のは危なかったです」',
devoted:'{a}「あなたに何かあったら、私は自分を許せない。分かって｜あなたに何かあったら、私は自分を許せない。分かってくれ｜あなたに何かあったら、私は自分を許せません。分かってください」',
cool:'{a}「その考え方、前にも直したはず｜その考え方は、前にも直したはずだ｜その考え方、前にも直したはずです」',
free:'{a}「あれ、私の教えたこと、全部どこかに置いてきた？｜おや、私の教えたことは、全部どこかに置いてきたのか｜あら、私のお教えしたこと、全部どこかに置いてきましたか」',
shy:'{a}「……ちゃんと、言うことを聞いてほしい。お願いだから｜……ちゃんと、言うことを聞いてほしい。頼む｜……ちゃんと、言うことを聞いてほしいです。お願いですから」',
polite:'{a}「ここは教室じゃないけど、決まりは守って｜ここは教室ではないが、決まりは守れ｜ここは教室ではありませんが、決まりは守ってください」'
})
},
guideB:{
warm:P9({
proud:'{a}「教わったことは全部覚えてる。今度は私が守る番｜教わったことは全部覚えている。今度は私が守る番だ｜教わったことは全部覚えています。今度は私が守る番です」',
stern:'{a}「指示をもらえれば動く。それまでは、ここで待つ｜指示をくれれば動く。それまでは、ここで待つ｜ご指示をいただければ動きます。それまでは、ここで待ちます」',
tsun:'{a}「別に、頼りにしてるわけじゃない。……ちょっとだけ｜別に、頼りにしているわけではない。……少しだけだ｜別に、頼りにしているわけじゃありません。……少しだけです」',
gentle:'{a}「疲れてない？　いつも教えてもらってばかりだから、今日は私が見張る｜疲れていないか。いつも教えてもらってばかりだから、今日は私が見張る｜お疲れではありませんか。いつも教えていただいてばかりですから、今日は私が見張ります」',
devoted:'{a}「あなたに教わってよかった。ここでも、ちゃんとそう思える｜＝｜あなたに教わってよかったです。ここでも、ちゃんとそう思えます」',
cool:'{a}「教わったとおりに整理した。答え合わせをお願い｜教わったとおりに整理した。答え合わせを頼む｜教わったとおりに整理しました。答え合わせをお願いします」',
free:'{a}「ここを出たら、この部屋の話で一回分の授業になるね｜ここを出たら、この部屋の話で一回分の講義になるな｜ここを出たら、この部屋のお話で一回分の授業になりますね」',
shy:'{a}「……そばにいても、いい？　邪魔はしない｜……そばにいても、いいか。邪魔はしない｜……おそばにいても、いいですか。邪魔はしません」',
polite:'{a}「私にできることがあれば、何でも言って｜私にできることがあれば、何でも言ってくれ｜私にできることがあれば、何でもおっしゃってください」'
}),
rub:P9({
proud:'{a}「いつまでも子ども扱いしないで。私だって、考えてる｜いつまでも子ども扱いするな。私も考えている｜いつまでも子ども扱いしないでください。私だって、考えています」',
stern:'{a}「その指示には従えない。理由を説明して｜その指示には従えない。理由を説明しろ｜その指示には従えません。理由を説明してください」',
tsun:'{a}「わ、分かってる。いちいち言われなくても｜わ、分かっている。いちいち言われなくてもな｜わ、分かっています。いちいち言われなくても」',
gentle:'{a}「心配してくれるのは嬉しい。でも、少しは任せてほしい｜心配してくれるのは嬉しい。だが、少しは任せてほしい｜ご心配いただけるのは嬉しいです。でも、少しはお任せいただきたいです」',
devoted:'{a}「あなたに認めてもらいたくて、無理をした。……ごめん｜あなたに認めてもらいたくて、無理をした。……すまない｜あなたに認めていただきたくて、無理をしました。……ごめんなさい」',
cool:'{a}「その方法は効率が悪い。私のやり方で試させて｜その方法は効率が悪い。私のやり方で試させろ｜その方法は効率が悪いです。私のやり方で試させてください」',
free:'{a}「はいはい、お説教はここを出てからまとめて聞く｜分かった、説教はここを出てからまとめて聞く｜はいはい、お説教はここを出てからまとめてお聞きします」',
shy:'{a}「……私だって、役に立ちたいのに｜＝｜……私だって、お役に立ちたいのに」',
polite:'{a}「お言葉だけど、今回は私の考えも聞いて｜言わせてもらうが、今回は私の考えも聞いてくれ｜お言葉ですが、今回は私の考えもお聞きください」'
})
},
faithA:{
warm:P9({
proud:'{a}「あなたの隣に立つのは、私以外にありえない｜＝｜あなたの隣に立つのは、私以外にありえません」',
stern:'{a}「あなたは座っていて。危ないことは全部、私が引き受ける｜あなたは座っていろ。危ないことは全部、私が引き受ける｜あなたは座っていてください。危ないことは全部、私が引き受けます」',
tsun:'{a}「あ、あなたのために動いてるんじゃない。……いや、あなたのためだけど｜あ、あなたのために動いているのではない。……いや、あなたのためだが｜あ、あなたのために動いているんじゃありません。……いえ、あなたのためですけど」',
gentle:'{a}「あなたが笑ってくれるなら、この部屋だって悪くない｜あなたが笑ってくれるなら、この部屋も悪くない｜あなたが笑ってくださるなら、この部屋だって悪くありません」',
devoted:'{a}「あなたが望むなら、何時間でも、何日でも、ここで仕える｜＝｜あなたが望まれるなら、何時間でも、何日でも、ここでお仕えします」',
cool:'{a}「あなたの判断が正しい。私はそれを支える手順を考える｜＝｜あなたのご判断が正しいです。私はそれを支える手順を考えます」',
free:'{a}「あなたと閉じ込められるなんて、ご褒美みたいなもの｜あなたと閉じ込められるとは、褒美のようなものだ｜あなたと閉じ込められるなんて、ご褒美みたいなものです」',
shy:'{a}「……あの、お水、先にどうぞ。私は、あとでいい｜……あの、水を先に飲んでくれ。私は、あとでいい｜……あの、お水、先にお飲みください。私は、あとで結構です」',
polite:'{a}「疲れているなら、私の上着を敷いて。床は冷えるから｜疲れているなら、私の上着を敷け。床は冷える｜お疲れなら、私の上着をお敷きください。床は冷えますから」'
}),
rub:P9({
proud:'{a}「あなたを軽く見る人がいるなら、私が許さない｜あなたを軽く見る者がいるなら、私が許さない｜あなたを軽く見る人がいるなら、私が許しません」',
stern:'{a}「ほかの人の言うことは聞かなくていい。あなたは正しい｜ほかの者の言うことは聞かなくていい。あなたは正しい｜ほかの方の言うことはお聞きにならなくていいです。あなたは正しいです」',
tsun:'{a}「どうして私を見てくれないの。……いや、見なくていいけど｜なぜ私を見ない。……いや、見なくていいが｜どうして私を見てくださらないんですか。……いえ、見なくていいですけど」',
gentle:'{a}「あなたが私を遠ざけても、私は離れない｜＝｜あなたが私を遠ざけても、私は離れません」',
devoted:'{a}「私では、足りない？　もっと、何でもするのに｜私では、足りないか。もっと、何でもするのに｜私では、足りませんか。もっと、何でもいたしますのに」',
cool:'{a}「あの人の言い分は、筋が通ってない。あなたが耳を貸す必要はない｜あの者の言い分は、筋が通っていない。あなたが耳を貸す必要はない｜あの方の言い分は、筋が通っていません。あなたが耳を貸す必要はありません」',
free:'{a}「あなたを独り占めできるなら、扉なんて開かなくてもいい｜あなたを独り占めできるなら、扉など開かなくてもいい｜あなたを独り占めできるなら、扉なんて開かなくても構いません」',
shy:'{a}「……ほかの人と、そんなに話さないで。……ごめん、今のは忘れて｜……ほかの者と、そんなに話すな。……すまない、今のは忘れてくれ｜……ほかの方と、そんなにお話しにならないでください。……ごめんなさい、今のは忘れてください」',
polite:'{a}「失礼を承知で言う。その人は、あなたにふさわしくない｜失礼を承知で言う。その者は、あなたにふさわしくない｜失礼を承知で申し上げます。その方は、あなたにふさわしくありません」'
})
},
faithB:{
warm:P9({
proud:'{a}「ついてきたいなら、ついてきて。置いていきはしない｜ついてきたいなら、ついてこい。置いていきはしない｜ついてきたいなら、ついてきてください。置いていきはしません」',
stern:'{a}「私のために無理をするのは、今日はここまで｜私のために無理をするのは、今日はここまでだ｜私のために無理をなさるのは、今日はここまでです」',
tsun:'{a}「そ、そんなに見られると落ち着かない。……でも、いてくれて助かる｜そ、そんなに見られると落ち着かない。……だが、いてくれて助かる｜そ、そんなに見られると落ち着きません。……でも、いてくださって助かります」',
gentle:'{a}「ありがとう。でも、あなたも休んで。あなたが倒れたら、私が困る｜ありがとう。だが、あなたも休め。あなたが倒れたら、私が困る｜ありがとうございます。でも、あなたも休んでください。あなたが倒れたら、私が困ります」',
devoted:'{a}「あなたがそこまで思ってくれるなら、私も応えたい｜＝｜あなたがそこまで思ってくださるなら、私もお応えしたいです」',
cool:'{a}「あなたの献身は受け取る。代わりに、ちゃんと眠って｜あなたの献身は受け取る。代わりに、ちゃんと眠れ｜あなたの献身は受け取ります。代わりに、ちゃんと眠ってください」',
free:'{a}「そんなに尽くされたら、扉が開いても帰りたくなくなる｜そんなに尽くされたら、扉が開いても帰りたくなくなるな｜そんなに尽くされたら、扉が開いても帰りたくなくなります」',
shy:'{a}「……そんなに大事にされるの、慣れてない。でも、嫌じゃない｜……そんなに大事にされるのは、慣れていない。だが、嫌ではない｜……そんなに大事にされるの、慣れていません。でも、嫌じゃありません」',
polite:'{a}「いつもありがとう。今日は、私にも何か返させて｜いつも感謝している。今日は、私にも何か返させてくれ｜いつもありがとうございます。今日は、私にも何かお返しさせてください」'
}),
rub:P9({
proud:'{a}「私を神さまみたいに扱うのは、やめて｜私を神のように扱うのは、やめろ｜私を神さまみたいに扱うのは、やめてください」',
stern:'{a}「私の判断が、いつも正しいわけじゃない。疑うことも覚えて｜私の判断が、いつも正しいわけではない。疑うことも覚えろ｜私の判断が、いつも正しいわけではありません。疑うことも覚えてください」',
tsun:'{a}「ちょっと、ついてこないで。……一人で考えたいだけ｜おい、ついてくるな。……一人で考えたいだけだ｜ちょっと、ついてこないでください。……一人で考えたいだけです」',
gentle:'{a}「あなたの気持ちは嬉しい。でも、少し重いときがある｜あなたの気持ちは嬉しい。だが、少し重いときがある｜あなたのお気持ちは嬉しいです。でも、少し重いときがあります」',
devoted:'{a}「私のことばかりで、あなた自身はどこにいるの｜私のことばかりで、あなた自身はどこにいる｜私のことばかりで、あなたご自身はどこにいらっしゃるんですか」',
cool:'{a}「その思い込みは、いずれあなたを傷つける。今のうちに改めて｜その思い込みは、いずれあなたを傷つける。今のうちに改めろ｜その思い込みは、いずれあなたを傷つけます。今のうちに改めてください」',
free:'{a}「そんなに崇められても、私、ただの人なんだけど｜そこまで崇められても、私はただの人間なのだが｜そんなに崇められても、私、ただの人なんですけど」',
shy:'{a}「……ずっと見られてると、何もできなくなる｜……ずっと見られていると、何もできなくなる｜……ずっと見られていると、何もできなくなります」',
polite:'{a}「気持ちはありがたい。でも、私の代わりに決めないで｜気持ちはありがたい。だが、私の代わりに決めるな｜お気持ちはありがたいです。でも、私の代わりに決めないでください」'
})
},
rival:{
warm:P9({
proud:'{a}「認めてあげる。この部屋に閉じ込められた相棒としては、悪くない｜認めてやる。この部屋に閉じ込められた相棒としては、悪くない｜認めて差し上げます。この部屋に閉じ込められた相棒としては、悪くありません」',
stern:'{a}「勝負は休み。出るまでは、手を組む｜勝負は休みだ。出るまでは、手を組む｜勝負はお休みです。出るまでは、手を組みます」',
tsun:'{a}「あなたに助けられたなんて、絶対に誰にも言わないから｜あなたに助けられたなど、絶対に誰にも言わないからな｜あなたに助けられたなんて、絶対に誰にも言いませんから」',
gentle:'{a}「張り合う相手がいると、不思議と心細くない｜＝｜張り合うお相手がいると、不思議と心細くありません」',
devoted:'{a}「あなたに勝つまでは、こんなところで終われない｜＝｜あなたに勝つまでは、こんなところで終われません」',
cool:'{a}「あなたの読みは正確だった。今回は、私の負けでいい｜＝｜あなたの読みは正確でした。今回は、私の負けで結構です」',
free:'{a}「どっちが先に扉を開けるか、競争する？　一緒に開けたら引き分け｜どちらが先に扉を開けるか、競争するか。一緒に開けたら引き分けだ｜どちらが先に扉を開けるか、競争しますか。一緒に開けたら引き分けです」',
shy:'{a}「……今の、すごかった。悔しいけど｜……今のは、すごかった。悔しいがな｜……今の、すごかったです。悔しいですけど」',
polite:'{a}「今だけは休戦にしよう。出たら、また正々堂々と｜今だけは休戦にしよう。出たら、また正々堂々とだ｜今だけは休戦にしましょう。出たら、また正々堂々と」'
}),
rub:P9({
proud:'{a}「その解き方、私なら半分の時間でやれる｜その解き方なら、私は半分の時間でやれる｜その解き方、私なら半分の時間でやれます」',
stern:'{a}「足を引っ張らないで。あなたと共倒れは、ごめんだ｜足を引っ張るな。あなたと共倒れはごめんだ｜足を引っ張らないでください。あなたと共倒れは、ごめんです」',
tsun:'{a}「な、なんであなたと閉じ込められなきゃいけないの｜な、なぜあなたと閉じ込められなければならない｜な、なぜあなたと閉じ込められなければならないんですか」',
gentle:'{a}「こんなときくらい、張り合うのはやめない？｜こんなときくらい、張り合うのはやめないか｜こんなときくらい、張り合うのはやめませんか」',
devoted:'{a}「あなたにだけは、弱いところを見せたくなかった｜＝｜あなたにだけは、弱いところを見せたくありませんでした」',
cool:'{a}「勝負なら出てからにして。今は時間の無駄｜勝負なら出てからにしろ。今は時間の無駄だ｜勝負なら出てからにしてください。今は時間の無駄です」',
free:'{a}「扉の紙を先に読んだのは私。一点リード｜扉の紙を先に読んだのは私だ。一点リードだ｜扉の紙を先に読んだのは私です。一点リードです」',
shy:'{a}「……あなたには、負けたくない。こんなところでも｜……あなたには、負けたくない。こんなところでもな｜……あなたには、負けたくありません。こんなところでも」',
polite:'{a}「お手並み拝見、と言いたいところだけど、今は協力して｜手並み拝見と言いたいところだが、今は協力しろ｜お手並み拝見、と言いたいところですが、今は協力してください」'
})
}
};
var MATCH={
spouse:function(t){return t.type==='lover'&& !!t.spouse;},
stepsib:function(t){return t.type==='relative'&& !!t.step;},
relative:function(t){return t.type==='relative'&& !t.step;}
};
function match(k,t){return!!t&&(MATCH[k]?MATCH[k](t):t.type===k);}
function find(ctx,a,b,k){
var l=HK.Ties.all(ctx,a,b);
for(var i=0;i<l.length;i++){
var t=l[i];
if(!match(k,t))continue;
var D=HK.TIES[k]||HK.TIES[t.type];
return{t:t,D:D,side:D&&D.dir?(t.a===a.i?'A':'B'):''};
}
return null;
}
function loveOk(ctx,a,b){return!!(HK.canLove&&HK.canLove(a,b)&&HK.canLove(b,a))&& !(HK.ngPair&&HK.ngPair(a,b))&& !ctx.pair(a,b).kin;}
var NEED={
love:function(ctx,a,b){return loveOk(ctx,a,b);},
warmSpouse:function(ctx,a,b,r){return loveOk(ctx,a,b)&& !/^(cold|separated)$/.test(r.t.married||'');}
};
function pend(ctx,a,b){return(ctx.rules||[]).filter(function(r){return API.K[r.k]&& !API.ruleDone(ctx,r,a,b);});}
var SIT={
'序盤':function(ctx){return ctx.stepIndex<=2;},
'長丁場':function(ctx){return ctx.stepIndex>=4;},
'一人':function(ctx){return!!(HK.roomOnlyOne&&HK.roomOnlyOne(ctx.env));},
'二人':function(ctx){return ctx.present().length===2;},
'大勢':function(ctx){return ctx.present().length>=3;},
'重い':function(ctx,a,b){return!!qOf(ctx,a,b,'重い');},
'言葉':function(ctx,a,b){return!!qOf(ctx,a,b,'言葉');},
'飲む':function(ctx,a,b){return!!qOf(ctx,a,b,'飲む');}
};
function qOf(ctx,a,b,tag){
var rs=pend(ctx,a,b);
for(var i=0;i<rs.length;i++){
var T=API.K[rs[i].k];
if(tag==='重い'&&T.type==='act'&&T.lvl>=3)return T.noun;
if(tag==='言葉'&&T.type==='word')return T.noun;
if(tag==='飲む'&&T.type==='consume')return T.item;
}
return'';
}
var EGO={CP:'cp',NP:'np',A:'a',FC:'fc',AC:'ac'};
function egoTop(c){var t=c.tr||{},best='np',bv= -1;['cp','np','a','fc','ac'].forEach(function(k){if((t[k]||0)>bv){bv=t[k]||0;best=k;}});return best;}
function tagsOf(x){var m= /^\[([^\]]+)\]/.exec(x);return m?m[1].split(','):null;}
function strip(x){return x.replace(/^\[[^\]]+\]/,'');}
function lineOk(ctx,x,a,b){
var tg=tagsOf(x);
if(!tg)return true;
var eg=tg.filter(function(k){return EGO[k];}),st=tg.filter(function(k){return SIT[k];});
if(eg.length&&eg.map(function(k){return EGO[k];}).indexOf(egoTop(a))<0)return false;
return!st.length||st.some(function(k){return SIT[k](ctx,a,b);});
}
function lines(ctx,o,a,b){
var U=ctx._rmUsed||(ctx._rmUsed={});
return o.T.filter(function(x){return!U[x]&&lineOk(ctx,x,a,b);});
}
var W0=1.6,GAP=2,MAX=2;
function egoW(a,mood){var t=a.tr||{};return mood==='rub'?0.7+(t.cp||0)*0.4+(t.fc||0)*0.3:0.7+(t.np||0)*0.5+(t.a||0)*0.2;}
function kgW(r,mood){var kg=r&&r.t.kg;if(!kg)return 1;return kg==='bad'?(mood==='rub'?1.8:0.35):(mood==='rub'?0.4:1.6);}
function rmOf(ctx,a,b){var pf=ctx.pair(a,b);return pf._rm||(pf._rm={at:{},n:{},last: -99});}
function labelOf(r){return HK.tieLabel?HK.tieLabel(r.t):r.D.label;}
function whyOf(ctx,a,b,r,w){
var role=r.side?'（'+a.name+'が'+(r.side==='A'?r.D.roleA:r.D.roleB)+'）':'';
if(r.side&&HK.Sib&&HK.Sib.isSibTie(r.t)){var w0=HK.Sib.rel(b,a,{tie:r.t});if(w0&&w0!=='きょうだい')role='（'+a.name+'が'+w0+'）';}
var s=a.name+'と'+b.name+'は'+labelOf(r)+role+'：'+w;
return HK.Sib&&HK.Sib.fill?HK.Sib.fill(s,a,b,null,ctx):s;
}
var FX={rub:[{ten:4,aff:1},{ten:5}],warm:[{aff:4,trust:4},{aff:4,trust:4}],romance:[{att:3,aff:3,trust:2},{att:3,aff:3,trust:2}]};
var GROUP={acq:'pal',friend:'pal',best:'pal',buddy:'pal',classmate:'pal',childhood:'pal',colleague:'pal',senpai:'pal',noobs:'pal',
almost:'love',fated:'love',mate:'love',spouse:'love',honmei:'love',
pparent:'kin',parent:'kin',sibprot:'kin',sibclose:'kin',sibling:'kin',stepsib:'kin',relative:'kin',rival:'rival'};
function sayOf(ctx,k,o,a){
var g=o.say||GROUP[k]||'pal',tb=SAY[g]&&SAY[g][o.mood==='rub'?'rub':'warm'];
return tb?ctx.pick(tb[per(a)]||tb.gentle):'';
}
function make(k,o){
var id='tie_rm_'+k+'_'+o.k;
return{
id:id,label:o.label,cat:o.cat,scope:'pair',noOdd:true,tie:k,
when:function(ctx,a,b){
if(!b|| !free(a)|| !free(b)||(ctx.flags&&ctx.flags.trioCur))return false;
var r=find(ctx,a,b,k);
if(!r||(o.side&&r.side!==o.side))return false;
if(o.need&& !NEED[o.need](ctx,a,b,r))return false;
var q=rmOf(ctx,a,b);
if(q.last===ctx.stepIndex)return false;
if(q.at[o.k]!=null&&ctx.stepIndex-q.at[o.k]<GAP)return false;
if((q.n[o.k]||0)>=MAX)return false;
return lines(ctx,o,a,b).length>0;
},
w:function(ctx,a,b){return(o.w||1)*W0*egoW(a,o.mood)*kgW(find(ctx,a,b,k),o.mood);},
run:function(ctx,a,b){
var r=find(ctx,a,b,k),ok=lines(ctx,o,a,b);
if(!r|| !ok.length)return null;
var x=ctx.pick(ok),q=rmOf(ctx,a,b);
ctx._rmUsed[x]=1;q.at[o.k]=ctx.stepIndex;q.n[o.k]=(q.n[o.k]||0)+1;q.last=ctx.stepIndex;
var tg=tagsOf(x)||[],qn='';
tg.forEach(function(t0){if(!qn&& /^(重い|言葉|飲む)$/.test(t0))qn=qOf(ctx,a,b,t0);});
var fx=o.fx||(o.cat==='romance'?FX.romance:FX[o.mood]||FX.warm);
ctx.mod2(a,b,fx[0],fx[1]);
if(o.st){ctx.stress(a,o.st[0]);ctx.stress(b,o.st[1]);}
else if(o.mood==='warm'){ctx.stress(a,-3);ctx.stress(b,-5);}
var s=strip(x).replace(/\{say\}/g,function(){return sayOf(ctx,k,o,a);}).replace(/\{q\}/g,qn||'お題');
var t=ctx.t(s,a,b);
if(k==='mentor'&&HK.Ties.mentorWord)t=HK.Ties.mentorWord(t,ctx.chars[r.t.a],ctx.chars[r.t.b]);
return{text:t,why:whyOf(ctx,a,b,r,o.why)};
}
};
}
var RM=HK.RoomTieMore={SAY:SAY,find:find,keys:[]};
RM.add=function(G){
var list=[];
Object.keys(G).forEach(function(k){if(RM.keys.indexOf(k)<0)RM.keys.push(k);G[k].forEach(function(o){list.push(make(k,o));});});
HK.addTo(scen.events,list);
return list;
};
RM.add({
acq:[
{k:'names',cat:'bond',mood:'warm',label:'顔見知りと名前で呼び合えるようになる',why:'顔見知りから、名前で呼び合う仲へ（仲良し）',T:L(
'[序盤]白い部屋で目を覚ました{a}は、隣にいるのが顔を知っているだけの{b}だと気づいた。{a}「……たしか、前に何度か会ったよね｜……たしか、前に何度か会ったな｜……たしか、前に何度かお会いしましたよね」{b}「名前、ちゃんと覚えてる？｜名前は、ちゃんと覚えているか｜名前、ちゃんと覚えていますか」――二人は、ぎこちなく名乗り直すところから始めた。|'+
'{a}と{b}は、壁を半分ずつ調べたあと、並んで腰を下ろした。会釈しか交わしたことのない相手の隣は、思ったより落ち着いた。{say}――{b}は少し笑って、うなずいた。|'+
'[長丁場]時間がたつにつれ、{a}は{b}の好きな食べ物も、苦手な季節も知っていた。{a}「顔見知りって、こんなに早く卒業できるものなんだ｜顔見知りとは、こんなに早く卒業できるものなんだな｜顔見知りって、こんなに早く卒業できるものなんですね」{b}「扉のおかげ、とは言いたくないけど｜扉のおかげ、とは言いたくないがな｜扉のおかげ、とは言いたくないですけど」|'+
'[NP]{a}は、{b}が黙って膝を抱えているのに気づいて、隣に座り、まだ呼び慣れない名前を呼んだ。{say}')},
{k:'distance',cat:'conflict',mood:'rub',label:'顔見知りとの距離感がつかめない',why:'よく知らない相手との気まずさ（すれ違い）',T:L(
'{a}と{b}は、黙ったまま同じ壁を調べていた。知っているのは顔と名前だけ。何を話していいのか分からないまま、互いの手順ばかりが気になった。{say}|'+
'[重い]扉の紙の「{q}」を読んで、{a}と{b}は同時に目を逸らした。{a}「……顔見知り程度の相手と、これは無理｜……顔見知り程度の相手と、これは無理だ｜……顔見知り程度の方と、これは無理です」{b}「同感。せめて友達からにして｜同感だ。せめて友人からにしてくれ｜同感です。せめてお友達からにしてください」|'+
'[CP]{a}は{b}の手順に口を出した。{say}――{b}は、ほとんど知らない相手に言われる筋合いはない、という顔をした。|'+
'{a}が冗談のつもりで言った一言に、{b}は真顔で返した。お互いの冗談の通じ方も、まだ知らない。白い部屋の空気が、少しだけ硬くなった。')}
],
almost:[
{k:'unsaid',cat:'romance',mood:'warm',need:'love',label:'友達以上の二人が言えない一言を飲み込む',why:'友達以上・恋人未満のもどかしさ（仲良し）',T:L(
'[重い]扉の紙の「{q}」を見て、{a}と{b}は顔を見合わせ、同時に赤くなった。{a}「……友達どうしで、これ？｜……友人どうしで、これか｜……友達どうしで、これですか」{b}「友達、ね｜友人、か｜友達、ですか」――{b}のその言い方に、{a}は返す言葉を探せなかった。|'+
'{a}と{b}は、寒さをしのぐために肩を寄せ合っていた。いつもなら冗談で済ませる距離なのに、今日は冗談が出てこなかった。{say}|'+
'[長丁場]眠りかけた{b}の頭が、{a}の肩に落ちた。{a}は動けないまま、いつか言おうと思っていた言葉を、白い天井に向かってそっと飲み込んだ。|'+
'[一人]{a}「一人しか出られないなら、あなたが出て。……出たら、言いたいことがある｜一人しか出られないなら、あなたが出ろ。……出たら、言いたいことがある｜一人しか出られないなら、あなたが出てください。……出たら、言いたいことがあります」{b}「今、言えばいいのに｜今、言えばいいだろう｜今、おっしゃればいいのに」')},
{k:'friendface',cat:'conflict',mood:'rub',label:'友達以上の二人がからかい合って気まずくなる',why:'友達の顔をしたままのすれ違い（すれ違い）',T:L(
'{a}は、笑いながら言った。{a}「私たち、ただの友達だし｜私たちは、ただの友人だからな｜私たちは、ただのお友達ですから」{b}「……そうだね｜……そうだな｜……そうですね」――{b}の返事が、少しだけ硬かった。|'+
'[大勢]{a}は、ほかの人と楽しそうに話す{b}を、壁際から見ていた。戻ってきた{b}に、{a}はつい言った。{say}――言ってから、{a}は自分の声の棘に気づいた。|'+
'{a}と{b}は、出たら何をするかを話していた。{b}が「誰かと映画に行く｜誰かと映画に行く｜どなたかと映画に行きます」と言ったとき、{a}は、その誰かが自分なのかを聞けなかった。|'+
'[FC]{a}はわざと{b}をからかって、子どもっぽい言い合いに持ち込んだ。本当に言いたいことから逃げるには、それがいちばん楽だった。{say}')}
],
best:[
{k:'trust',cat:'help',mood:'warm',label:'親友が言葉なしで役割を分ける',why:'親友どうしの、言わなくても分かる信頼（仲良し）',T:L(
'{a}と{b}は、目を覚ますなり、何も言わずに部屋の両端へ散った。調べ終えて戻ってくると、二人は床に同じ図を描いていた。{a}は図を見比べてから、{b}の隣に座り直した。{say}|'+
'[一人]扉の紙を読んだ{a}は、迷わず{b}の背中を押した。{a}「出るのはあなた。親友を置いていくなんて、あなたにはできないでしょ。だから、私が残る｜出るのはあなただ。親友を置いていくなど、あなたにはできないだろう。だから、私が残る｜出るのはあなたです。親友を置いていくなんて、あなたにはできないでしょう。ですから、私が残ります」{b}「その理屈、そっくり返す｜その理屈は、そっくり返す｜その理屈、そっくりお返しします」|'+
'[長丁場]眠れない夜、{a}と{b}は、出会ったころの話を一つずつ思い出していった。笑い話ばかりなのに、{b}は途中で少しだけ泣いた。{a}は気づかないふりをして、話を続けた。|'+
'[AC]{a}は、{b}にだけは弱音を吐けた。ひとしきり吐き出したあと、{a}は少し笑って、{b}の隣に座り直した。{say}――{b}は黙って、{a}の背中を叩いた。')},
{k:'secret',cat:'conflict',mood:'rub',label:'親友の隠しごとに気づいてしまう',why:'親友だからこそ言えなかったこと（すれ違い）',T:L(
'{a}は、{b}がずっと何かを言いかけてはやめているのに気づいていた。{a}「親友に隠しごと？｜親友に隠しごとか｜親友に隠しごとですか」{b}「親友だから、言えないこともある｜＝｜親友だから、言えないこともあります」――その答えが、{a}には少し寂しかった。|'+
'[言葉]{q}を言う番になって、{b}は{a}の知らない話を打ち明けた。何年も一緒にいたのに、一度も聞いたことのない話だった。{a}には、知らなかったことより、黙っていられたことのほうがこたえた。|'+
'[CP]{a}は{b}の考えをばっさり切り捨てた。親友だからこそ遠慮のない言い方だった。{say}――{b}は言い返さず、壁のほうを向いた。')}
],
pparent:[
{k:'guard',side:'A',cat:'help',mood:'warm',label:'親代わりが閉じ込められた子を見守る',why:'親代わりが子を守る（仲良し）',T:L(
'{a}は、{b}の隣に座って、扉を見張っていた。血はつながっていなくても、{b}を育ててきたのは自分だった。{say}|'+
'[序盤]目を覚ました{a}がまず確かめたのは、扉ではなく{b}の顔色だった。{a}「怪我はない？　……よかった｜怪我はないか。……よかった｜お怪我はありませんか。……よかったです」{b}「もう子どもじゃないって、何度言えば｜もう子どもではないと、何度言えば分かる｜もう子どもじゃないって、何度言えばいいんですか」|'+
'[一人]{a}「一人しか出られないなら、あなたが出て。あなたを引き取った日から、そう決めてる｜一人しか出られないなら、あなたが出ろ。あなたを引き取った日から、そう決めている｜一人しか出られないなら、あなたが出てください。あなたを引き取った日から、そう決めています」')},
{k:'grown',side:'B',cat:'conflict',mood:'rub',label:'育ての親に一人前と認めてほしい',why:'子ども扱いへの反発（すれ違い）',T:L(
'{a}は、何でも先回りして片づけてしまう{b}の手を止めた。{say}――{b}は伸ばしかけた手を、ゆっくり引っ込めた。|'+
'[重い]扉の紙の「{q}」を見た{b}が、すぐに{a}の前に立った。{a}「どいて。あなたに守られてばかりの年じゃない｜どけ。あなたに守られてばかりの年ではない｜どいてください。あなたに守られてばかりの年じゃありません」――その声は、{b}が思っていたよりずっと大人だった。|'+
'[長丁場]{a}は、{b}に引き取られた日のことを話した。{a}「あのとき、本当の家族じゃないって泣いた。……今は、そんなこと思ってない｜あのとき、本当の家族ではないと泣いた。……今は、そんなことは思っていない｜あのとき、本当の家族じゃないって泣きました。……今は、そんなこと思っていません」――{b}は返事の代わりに、{a}の頭に手を置いた。')}
],
fated:[
{k:'pull',cat:'romance',mood:'warm',need:'love',label:'運命の相手と閉じ込められて離れられない',why:'運命に引き寄せられる二人（仲良し）',T:L(
'[序盤]目を覚ました瞬間、{a}は{b}の匂いに気づいた。初めて会うはずなのに、ずっと探していたような気がした。{b}も、同じ顔で{a}を見ていた。|'+
'{a}と{b}は、気づけば部屋のどこにいても互いの位置を目で追っていた。いつの間にか、二人は並んで座っていた。{say}|'+
'[長丁場]{a}「この部屋に閉じ込められたのは、偶然じゃない気がする｜この部屋に閉じ込められたのは、偶然ではない気がする｜この部屋に閉じ込められたのは、偶然じゃない気がします」{b}「運命なんて、信じてなかったのに｜運命など、信じていなかったのにな｜運命なんて、信じていませんでしたのに」')},
{k:'resist',cat:'conflict',mood:'rub',need:'love',label:'運命に流されるのが怖くて距離を取る',why:'惹かれる気持ちへの戸惑い（すれ違い）',T:L(
'{a}は、{b}のそばに行きたがる自分の足を、壁際に縫いとめていた。{a}「来ないで。今は、近づかないほうがいい｜来るな。今は、近づかないほうがいい｜来ないでください。今は、近づかないほうがいいです」――言いながら、{a}の目は{b}から離れなかった。|'+
'[重い]扉の紙の「{q}」を読んだ{b}は、{a}から一番遠い隅へ移った。{b}「今あなたに近づいたら、たぶん止まれない｜＝｜今あなたに近づいたら、たぶん止まれません」――{a}は、その距離の意味が分かってしまって、黙った。|'+
'{a}「会ったばかりなのに、こんなに惹かれるのはおかしい｜＝｜お会いしたばかりなのに、こんなに惹かれるのはおかしいです」{b}「……私のせいみたいに言わないで｜……私のせいのように言うな｜……私のせいみたいに言わないでください」――二人は背中合わせに座り、それでも肩だけは触れていた。')}
],
mate:[
{k:'nest',cat:'romance',mood:'warm',need:'love',label:'番どうしが白い部屋に寝床を作る',why:'番の二人の寄り添い（仲良し）',T:L(
'{a}は、部屋の隅に毛布と上着を集めて、小さな寝床を作った。{a}「ここが、今夜の二人の巣｜ここが、今夜の二人の巣だ｜ここが、今夜の二人の巣です」――{b}は笑って、そこに潜り込んだ。|'+
'{a}と{b}は、背中合わせではなく、向かい合って眠った。どちらかが目を覚ますたびに、相手がそこにいることを確かめた。目が合うと、{a}は小さく言った。{say}|'+
'[一人]{a}「一人しか出られない？　なら、出ない。番を置いていく理由がない｜一人しか出られないのか。なら、出ない。番を置いていく理由がない｜一人しか出られないんですか。なら、出ません。番を置いていく理由がありません」')},
{k:'mine',cat:'conflict',mood:'rub',need:'love',label:'番がほかの人と話すのが面白くない',why:'番の独占欲（すれ違い）',T:L(
'[大勢]{b}がほかの人と話し込んでいるあいだ、{a}はずっと壁にもたれて腕を組んでいた。戻ってきた{b}に、{a}は言った。{say}|'+
'{a}は{b}の首筋に顔を寄せて、ほかの人の匂いがしないか確かめた。{b}「そういうところ、本当に動物みたい｜そういうところは、本当に獣のようだ｜そういうところ、本当に動物みたいですね」{a}「番なんだから、当たり前｜番なんだ、当たり前だ｜番なんですから、当たり前です」|'+
'[長丁場]閉じ込められて何時間もたつうちに、{a}は{b}が少しでも離れると落ち着かなくなった。{b}が水を取りに立っただけで、{a}は目で追った。{b}「すぐ戻るから｜すぐ戻る｜すぐ戻りますから」――その一言で、ようやく{a}の肩が下りた。')}
],
teacher:[
{k:'lesson',side:'A',cat:'help',mood:'warm',say:'guideA',label:'教師が閉じ込められた教え子を落ち着かせる',why:'教師が教え子を導く（仲良し）',T:L(
'{a}は、パニックになりかけた{b}の前にしゃがみ込み、教室で問題を出すときと同じ声で言った。{a}「深呼吸。答えは、一つずつ探せばいい｜深呼吸だ。答えは、一つずつ探せばいい｜深呼吸です。答えは、一つずつ探せばいいんです」――{b}の呼吸が、少しずつ落ち着いていった。|'+
'[序盤]{a}は扉の紙を読み上げると、{b}に向き直った。{say}――{b}は、板書を写すときの顔でうなずいた。|'+
'[言葉]{q}を言う番になって、{a}は{b}の答案の字がきれいなことを挙げた。{b}「そこ？｜そこか｜そこですか」{a}「ずっと言いそびれてた｜ずっと言いそびれていた｜ずっと言いそびれていました」')},
{k:'rebel',side:'B',cat:'conflict',mood:'rub',say:'guideB',label:'教え子が教師の指示に反発する',why:'教え子の反発（すれ違い）',T:L(
'{a}は、{b}の指示を最後まで聞かずに扉の仕掛けに手を伸ばした。{b}に止められると、{a}は振り返った。{say}|'+
'[重い]扉の紙の「{q}」を見た{b}が、{a}をかばうように前に出た。{a}「ここは教室じゃない。先生に守られる理由はない｜ここは教室ではない。先生に守られる理由はない｜ここは教室じゃありません。先生に守られる理由はありません」――{b}は、教え子の背中の大きさに初めて気づいた。|'+
'{a}「卒業したのに、まだ先生の顔をするんだ｜卒業したのに、まだ教師の顔をするのか｜卒業したのに、まだ先生の顔をなさるんですね」{b}「あなたが目の前にいると、どうしても｜あなたが目の前にいると、どうしてもな｜あなたが目の前にいると、どうしても」')}
],
sibprot:[
{k:'shield',side:'A',cat:'help',mood:'warm',label:'兄姉が弟妹を背にかばう',why:'兄姉の庇護（仲良し）',T:L(
'{a}は、扉が軋むたびに{b}を自分の背中に回した。小さいころからの癖だった。{say}|'+
'[序盤]目を覚ました{a}は、隣で眠る{b}の肩を揺すった。{a}「起きて。……大丈夫、私がいる｜起きろ。……大丈夫だ、私がいる｜起きてください。……大丈夫です、私がいます」――{b}は寝ぼけた声で、子どものころと同じ呼び方をした。|'+
'[飲む]{a}は並んだ{q}を数えて、{b}の分まで自分の前に引き寄せた。{a}「こういうのは、上の役目｜こういうのは、上の役目だ｜こういうのは、上の役目です」')},
{k:'notkid',side:'B',cat:'conflict',mood:'rub',label:'弟妹が兄姉の過保護に反発する',why:'守られる側の反発（すれ違い）',T:L(
'{a}は、{b}の差し出した手を払った。{say}――{b}は、払われた手のやり場に困った。|'+
'[一人]{a}「一人しか出られないなら、今度は私が残る。いつまでも守られる側じゃない｜一人しか出られないなら、今度は私が残る。いつまでも守られる側ではない｜一人しか出られないなら、今度は私が残ります。いつまでも守られる側じゃありません」{b}「……生意気になった｜……生意気になったな｜……生意気になりましたね」|'+
'[長丁場]{a}は、{b}がずっと自分のために何かを我慢してきたことを、白い部屋でようやく口にした。{a}「私のせいで、やりたいこと、諦めてきたでしょ｜私のせいで、やりたいことを諦めてきただろう｜私のせいで、やりたいことを諦めてきたでしょう」――{b}は答えなかった。それが答えだった。')}
],
sibclose:[
{k:'play',cat:'bond',mood:'warm',label:'仲良しのきょうだいが閉じ込められても遊ぶ',why:'親友のようなきょうだい（仲良し）',T:L(
'{a}と{b}は、白い壁に指で落書きを始めた。子どものころ、二人で考えた秘密の暗号だった。描き終えると、{a}は{b}の隣に座り込んだ。{say}|'+
'[長丁場]退屈しのぎに、{a}と{b}は家族のものまね大会を始めた。親の口癖をまねると、二人とも涙が出るほど笑った。|'+
'[一人]{a}「一人しか出られないなら、じゃんけん。三回勝負｜一人しか出られないなら、じゃんけんだ。三回勝負だ｜一人しか出られないなら、じゃんけんです。三回勝負です」{b}「子どものころから、あなたは最初にグーを出す｜＝｜子どものころから、あなたは最初にグーを出しますよね」')},
{k:'sulk',cat:'conflict',mood:'rub',label:'仲良しのきょうだいがよそ見に拗ねる',why:'きょうだいを取られたような寂しさ（すれ違い）',T:L(
'[大勢]{b}がほかの人と打ち解けていくのを、{a}は少し離れて見ていた。戻ってきた{b}に、{a}はつい突っかかった。{say}|'+
'{a}は、{b}が自分に相談せずに扉の仕掛けをいじったことに腹を立てた。{a}「いつもなら、真っ先に私に言うのに｜いつもなら、真っ先に私に言うのにな｜いつもなら、真っ先に私に言うじゃないですか」|'+
'{a}と{b}は、どちらが先に扉の紙を読んだかで、子どものように言い合った。{say}――言い合いながらも、二人は同じ毛布に入っていた。')}
],
noobs:[
{k:'easy',cat:'bond',mood:'warm',label:'嫉妬のない二人が気楽に過ごす',why:'執着しない二人の気楽さ（仲良し）',T:L(
'{a}と{b}は、誰が誰と組んで調べるかを、くじで決めた。どちらがほかの人と組んでも、どちらも気にしなかった。調べ終えて戻ってくると、{a}は{b}の隣に腰を下ろした。{say}|'+
'[大勢]{b}がほかの人と笑っているのを見ても、{a}の胸は少しもざわつかなかった。{a}「あなたといると、気が楽｜あなたといると、気が楽だ｜あなたといると、気が楽です」{b}「お互い、縛らないからね｜お互い、縛らないからな｜お互い、縛りませんからね」|'+
'[長丁場]{a}と{b}は、それぞれ好きな場所で好きなように過ごした。離れていても、ときどき目が合えば手を振る。それで十分だった。')},
{k:'lonely',cat:'conflict',mood:'rub',label:'執着しない相手に物足りなさを覚える',why:'執着しない気安さが、少しだけ寂しい（すれ違い）',T:L(
'{a}は、自分がいなくても平気そうな{b}を見て、ほんの少しだけ物足りなくなった。{a}「……少しくらい、私を探してくれてもいいのに｜＝｜……少しくらい、私を探してくださってもいいのに」|'+
'[一人]{b}は扉の紙を読むと、あっさり言った。{b}「一人しか出られないなら、出られる人が出ればいい｜一人しか出られないなら、出られる者が出ればいい｜一人しか出られないなら、出られる人が出ればいいです」{a}「……そこは、少しくらい迷ってほしかった｜＝｜……そこは、少しくらい迷ってほしかったです」|'+
'{a}が誰の隣で眠っても、{b}は何も言わない。それが二人の楽なところで、ときどき少しだけ物足りないところだった。')}
],
stepsib:[
{k:'family',cat:'bond',mood:'warm',label:'義理のきょうだいが家族になっていく',why:'親の再婚でできた家族の距離が縮まる（仲良し）',T:L(
'{a}と{b}は、親が再婚した日のことを話した。知らない人と同じ家に住むことになった、あの気まずい夕食。{a}「あのとき、醤油を取ってって言えなかった｜あのとき、醤油を取ってくれと言えなかった｜あのとき、お醤油を取ってくださいって言えませんでした」――{b}は吹き出した。|'+
'{say}――{a}がそう言うと、{b}は少し驚いた顔をして、それから照れたように目を逸らした。|'+
'[一人]{a}「一人しか出られないなら、あなたが出て。親たちに、あなたまでいなくなったって思わせたくない｜一人しか出られないなら、あなたが出ろ。親たちに、あなたまでいなくなったと思わせたくない｜一人しか出られないなら、あなたが出てください。親たちに、あなたまでいなくなったと思わせたくありません」|'+
'[長丁場]何時間も一緒にいるうちに、{a}は{b}の寝癖も、くしゃみの癖も知った。同じ家に住んでいたのに、知らないことばかりだった。')},
{k:'reserve',cat:'conflict',mood:'rub',label:'義理のきょうだいに遠慮して本音を隠す',why:'血がつながっていない遠慮（すれ違い）',T:L(
'{a}は、{b}にだけ敬語が抜けきらない自分に気づいていた。{a}「……ごめん。まだ、どう話せばいいのか分からない｜……すまない。まだ、どう話せばいいのか分からない｜……ごめんなさい。まだ、どう話せばいいのか分かりません」――{b}は、少し寂しそうに笑った。|'+
'{b}が昔の家族写真の話をしたとき、{a}はその中に自分がいないことを思い出して、黙った。{b}は、言ってから気づいて、口をつぐんだ。|'+
'[重い]扉の紙の「{q}」を見て、{a}は苦笑いした。{a}「義理でも、きょうだいはきょうだい。……親に何て言えばいい｜義理でも、きょうだいはきょうだいだ。……親に何と言えばいい｜義理でも、きょうだいはきょうだいです。……親に何と言えばいいんですか」――{b}は答えられずに、扉の紙から目を逸らした。')}
]
});
})();
});
;
/* ==== js/room-tie-more2.js ==== */
HK.Load.def(80,'js/room-tie-more2.js',function(){
(function(){
'use strict';
var HK=window.HK,RM=HK.RoomTieMore;
if(!RM|| !RM.add)return;
function L(s){return s.split('|');}
RM.add({
senpai:[
{k:'brave',side:'A',cat:'help',mood:'warm',label:'先輩が後輩の前で弱音を飲み込む',why:'先輩の意地と面倒見（仲良し）',T:L(
'{a}は、{b}の前では弱音を吐かないと決めていた。後輩の前で先輩が崩れるわけにはいかない。{a}は{b}の隣に腰を下ろし、いつもの調子で言った。{say}|'+
'[序盤]{a}は扉の紙を読むと、{b}の肩を叩いた。{a}「大丈夫、こういうのは先輩に任せて｜大丈夫だ、こういうのは先輩に任せろ｜大丈夫です、こういうのは先輩に任せてください」――そう言った{a}の手が少し震えていたのを、{b}は見逃さなかった。|'+
'[飲む]{a}は{q}を手に取ると、{b}より先に口をつけた。{a}「毒見は先輩の仕事｜毒見は先輩の仕事だ｜毒見は先輩の仕事です」')},
{k:'seen',side:'B',cat:'conflict',mood:'rub',label:'後輩が先輩のやせ我慢を見抜く',why:'後輩から見た先輩の強がり（すれ違い）',T:L(
'{a}は、{b}が一睡もしていないのに気づいて、きっぱり言った。{a}「先輩、少しは後輩を頼って｜先輩、少しは後輩を頼れ｜先輩、少しは後輩を頼ってください」{b}「後輩に心配されるようじゃ、先輩失格｜後輩に心配されるようでは、先輩失格だ｜後輩に心配されるようじゃ、先輩失格です」|'+
'{a}は、{b}の指示がいつもより雑なことに苛立った。{say}――{b}は、後輩に見透かされたことが悔しくて、黙った。|'+
'[長丁場]{a}は、{b}が隠れて壁を殴っていたのを見てしまった。{a}は何も言わず、自分の上着を{b}の手に巻いた。{b}「……見なかったことにして｜……見なかったことにしてくれ｜……見なかったことにしてください」')}
],
buddy:[
{k:'back',cat:'help',mood:'warm',label:'バディが背中合わせで扉を見張る',why:'バディの連携（仲良し）',T:L(
'{a}と{b}は、背中合わせに座って、それぞれの視界の端を見張った。ほとんど言葉はいらなかった。しばらくして、{a}が背中越しに言った。{say}|'+
'[長丁場]交代で眠ることになった。{a}は、{b}の寝息を聞きながら、扉と壁と天井を順に見張り続けた。相棒の眠りを守るのは、いつものことだった。|'+
'[一人]{a}「一人しか出られないなら、出たほうが残ったほうを迎えに来る。いつもの手順｜一人しか出られないなら、出たほうが残ったほうを迎えに来る。いつもの手順だ｜一人しか出られないなら、出たほうが残ったほうを迎えに来ます。いつもの手順です」{b}「了解｜了解だ｜了解です」')},
{k:'solo',cat:'conflict',mood:'rub',label:'バディが相談なしに危ない手を打つ',why:'相棒の独断（すれ違い）',T:L(
'{a}は、{b}が一人で扉の仕掛けをいじっていたことに気づいて、顔をこわばらせた。{say}|'+
'{a}「どうして合図を待たなかった｜なぜ合図を待たなかった｜どうして合図を待たなかったんですか」{b}「待ってたら、あなたが先にやってた｜待っていたら、あなたが先にやっていた｜待っていたら、あなたが先にやっていましたよ」――二人は睨み合って、それから同時にため息をついた。|'+
'[CP]{a}は{b}の作戦に、一つずつ穴を指摘した。{say}――相棒だからこそ、手加減がなかった。')}
],
classmate:[
{k:'reunion',cat:'bond',mood:'warm',label:'同級生と卒業後の近況を出し合う',why:'昔の同級生との再会（仲良し）',T:L(
'{a}と{b}は、クラスの誰がどこで何をしているか、知っている限りの近況を出し合った。話が一段落すると、{a}は{b}の隣で伸びをした。{say}|'+
'[長丁場]{a}「文化祭のとき、二人で看板を壊したの覚えてる？｜文化祭のとき、二人で看板を壊したのを覚えているか｜文化祭のとき、二人で看板を壊したの、覚えていますか」{b}「あれは、あなたが脚立を蹴った｜あれは、あなたが脚立を蹴ったんだ｜あれは、あなたが脚立を蹴ったんです」――二人は、あのころと同じ言い合いをして笑った。|'+
'[序盤]{a}は、白い部屋で目を覚まして最初に見た顔に、思わず昔のあだ名を呼びそうになった。{a}「……もしかして、同じクラスだった？｜……もしかして、同じクラスだったか｜……もしかして、同じクラスでしたか」')},
{k:'nick',cat:'conflict',mood:'rub',label:'同級生に昔のあだ名で呼ばれて気まずい',why:'昔の自分を知られている気まずさ（すれ違い）',T:L(
'{b}は、学生のころのあだ名で{a}を呼んだ。{a}「その呼び方、やめて。もう大人なんだから｜その呼び方はやめろ。もう大人なんだ｜その呼び方、やめてください。もう大人なんですから」――{b}は面白がって、もう一度呼んだ。|'+
'{a}は、{b}が学生のころの失敗を今でも覚えていることに顔をしかめた。{say}|'+
'[言葉]{q}を言う番になって、{b}は学生のころの{a}の話ばかりした。{a}は、今の自分を見てほしいと思って、少しむくれた。')}
],
relative:[
{k:'summer',cat:'bond',mood:'warm',label:'親族と子どものころの夏を思い出す',why:'親族どうしの思い出（仲良し）',T:L(
'{a}と{b}は、親戚の家の縁側で並んでスイカを食べた夏のことを思い出した。白い部屋には蝉の声もないのに、二人とも同じ匂いを思い出していた。{a}は{b}の肩に軽くもたれた。{say}|'+
'[長丁場]{a}は、{b}が眠れずにいるのに気づいて、子どものころ聞かされた祖父の昔話を始めた。途中から、{b}が続きを話した。二人とも、一字一句覚えていた。|'+
'[飲む]{a}「{q}、親戚の集まりのお酒よりはましかも｜{q}は、親戚の集まりの酒よりはましかもしれない｜{q}、親戚の集まりのお酒よりはましかもしれません」{b}「あれは、ひどかった｜あれは、ひどかったな｜あれは、ひどかったですね」')},
{k:'gossip',cat:'conflict',mood:'rub',label:'親族に家の事情を持ち出されて揉める',why:'親族ならではの遠慮のなさ（すれ違い）',T:L(
'{a}は、{b}が親戚の噂話を持ち出したことに顔をしかめた。{say}|'+
'{b}は、思い出したように言った。{b}「あなたの親、まだあのこと根に持ってるよ｜あなたの親は、まだあのことを根に持っているぞ｜あなたのご両親、まだあのことを根に持っていらっしゃいますよ」{a}「ここで言うこと？｜ここで言うことか｜ここで言うことですか」――二人は、狭い部屋で親戚の揉め事を蒸し返した。|'+
'[重い]扉の紙の「{q}」を見た{a}は、真っ先に親戚中の顔を思い浮かべた。{a}「法事で、どんな顔をすれば｜法事で、どんな顔をすればいい｜法事で、どんな顔をすればいいんですか」――{b}は聞こえないふりをした。')}
],
spouse:[
{k:'home',cat:'romance',mood:'warm',need:'warmSpouse',label:'夫婦が白い部屋で家の話をする',why:'連れ添った二人の落ち着き（仲良し）',T:L(
'{a}と{b}は、壁にもたれて、家の冷蔵庫に何が残っていたかを思い出し合った。{a}「卵、たしか賞味期限が今日｜卵は、たしか賞味期限が今日だ｜卵、たしか賞味期限が今日です」{b}「出たら、まずそれ｜出たら、まずそれだな｜出たら、まずそれですね」――夫婦の会話は、白い部屋でもいつもどおりだった。|'+
'{say}――{a}がそう言うと、{b}は結婚した日と同じ顔で笑った。|'+
'[一人]{a}「一人しか出られない？　なら、二人で残る。誓いの言葉、覚えてる？｜一人しか出られないのか。なら、二人で残る。誓いの言葉を、覚えているか｜一人しか出られないんですか。なら、二人で残ります。誓いの言葉、覚えていますか」|'+
'[長丁場]{a}は、眠る{b}の左手の指輪を、そっと指でなぞった。何年たっても、その重みはちゃんとそこにあった。')},
{k:'chores',cat:'conflict',mood:'rub',say:'kin',label:'夫婦が閉じ込められても家事の話で揉める',why:'長年の不満が噴き出す（すれ違い）',T:L(
'{a}は、{b}が扉の紙を読んでいる横で、出がけに洗濯物を取り込んだかどうかを問い詰めた。{say}|'+
'{a}「いつも、大事なことは私任せ｜いつも、大事なことは私任せだ｜いつも、大事なことは私任せですよね」{b}「それ、今言う？｜それを今言うか｜それ、今おっしゃいますか」――夫婦喧嘩の続きが、白い部屋で始まった。|'+
'[大勢]ほかの人の前で、{b}は{a}の寝相の悪さを笑い話にした。{a}は笑って流したふりをして、あとで{b}の脇腹を小突いた。')}
],
honmei:[
{k:'only',side:'A',cat:'romance',mood:'warm',need:'love',label:'本命だけを見つめて扉の前に立つ',why:'本命への一途な想い（仲良し）',T:L(
'{a}は、部屋に誰がいても、気づけば{b}の姿を探していた。見つけるたびに、{a}は{b}の隣へ戻った。{say}|'+
'[一人]{a}「一人しか出られないなら、あなたが出て。あなたのいない外に、出る意味がない｜一人しか出られないなら、あなたが出ろ。あなたのいない外に、出る意味はない｜一人しか出られないなら、あなたが出てください。あなたのいない外に、出る意味がありません」――{b}は、その言葉の重さに戸惑った。|'+
'[重い]扉の紙の「{q}」を読んだ{a}は、ほかの誰とも目を合わせずに、まっすぐ{b}を見た。言葉にしなくても、{a}が誰を選ぶかは明らかだった。')},
{k:'gaze',side:'B',cat:'conflict',mood:'rub',say:'faithB',label:'本命が一途な視線に戸惑う',why:'想われる側の戸惑い（すれ違い）',T:L(
'{a}は、{b}の視線がずっと自分を追っていることに気づいて、落ち着かなく膝を抱えた。{say}|'+
'{b}は、{a}が誰かと話すたびに顔を曇らせた。{a}「……どうして、そんな顔をするの｜……なぜ、そんな顔をする｜……どうして、そんな顔をなさるんですか」――{b}は答えられなかった。答えたら、もう戻れない気がした。|'+
'[大勢]{a}がほかの人と組んで壁を調べ始めると、{b}は黙って反対側の壁に向かった。{a}は、その背中が少しだけ寂しそうに見えて、手を止めた。')}
],
rival:[
{k:'truce',cat:'bond',mood:'warm',label:'ライバルと休戦して手を組む',why:'ライバルとの休戦（仲良し）',T:L(
'{a}と{b}は、ここを出るまでは休戦だと握手した。握った手に、二人とも妙に力が入っていた。{say}|'+
'[長丁場]{a}は、{b}が自分の思いつかなかった手で仕掛けを一つ解いたのを見て、悔しそうに笑った。{a}「やっぱり、あなたはすごい｜やはり、あなたはすごい｜やはり、あなたはすごいです」{b}「今ごろ気づいた？｜今ごろ気づいたか｜今ごろお気づきですか」|'+
'[一人]{a}「一人しか出られないなら、勝負で決める。負けたほうが残る｜＝｜一人しか出られないなら、勝負で決めます。負けたほうが残ります」{b}「受けて立つ。……でも、負けても恨まない｜受けて立つ。……だが、負けても恨まない｜受けて立ちます。……でも、負けても恨みません」')},
{k:'race',cat:'conflict',mood:'rub',label:'ライバルが扉の謎解きで張り合う',why:'ライバルの張り合い（すれ違い）',T:L(
'{a}と{b}は、どちらが先に扉の仕掛けを解くかで、競い始めた。先に手を止めたのは{a}だった。{say}|'+
'[言葉]{q}を言う番になって、{a}と{b}はお互いのいいところを、嫌味たっぷりに並べ合った。言っていることは褒め言葉なのに、空気はどんどん険しくなった。|'+
'{a}は{b}の案を鼻で笑った。{b}「笑うなら、もっといい案を出して｜笑うなら、もっといい案を出せ｜笑うなら、もっといい案を出してください」――二人の間に、白い火花が散った。')}
],
mentor:[
{k:'taught',side:'B',cat:'help',mood:'warm',say:'guideB',label:'弟子が師匠の教えで部屋を調べる',why:'弟子が師の教えを生かす（仲良し）',T:L(
'{a}は、師匠に教わったとおり、壁を三度ずつ叩いて音の違いを確かめていった。振り返ると、{b}が満足そうにうなずいていた。{say}|'+
'[長丁場]{a}は、疲れて眠る{b}に、自分の上着を掛けた。師匠が教えてくれたのは技だけではなかった、と{a}は思った。|'+
'[一人]{a}「一人しか出られないなら、師匠が出て。弟子を置いていくのも、修行のうち｜一人しか出られないなら、師匠が出てくれ。弟子を置いていくのも、修行のうちだ｜一人しか出られないなら、師匠が出てください。弟子を置いていくのも、修行のうちです」{b}「そんな修行、教えた覚えはない｜そんな修行は、教えた覚えがない｜そんな修行、お教えした覚えはありません」')},
{k:'test',side:'A',cat:'conflict',mood:'rub',say:'guideA',label:'師匠が閉じ込められた弟子を試す',why:'師の厳しさ（すれ違い）',T:L(
'{a}は、仕掛けに力任せに挑む{b}を見かねて、その手を止めさせた。{say}――{b}は唇を噛んで、もう一度最初からやり直した。|'+
'{a}「これも修行。答えは教えない｜これも修行だ。答えは教えない｜これも修行です。答えは教えません」{b}「こんなときまで？｜こんなときまでか｜こんなときまでですか」――{a}の目は、厳しいまま、どこか楽しそうだった。|'+
'[重い]扉の紙の「{q}」を読んだ{a}は、眉一つ動かさずに言った。{a}「動揺するのは未熟な証拠｜動揺するのは未熟な証拠だ｜動揺するのは未熟な証拠です」――そう言った{a}の耳が赤いのを、{b}は見逃さなかった。')}
],
parent:[
{k:'story',side:'A',cat:'help',mood:'warm',label:'親が閉じ込められた子に昔話をする',why:'親の変わらない愛情（仲良し）',T:L(
'{a}は、眠れない{b}の背中をさすりながら、{b}が小さかったころの話をした。{say}|'+
'[序盤]目を覚ました{a}は、隣にいるのが{b}だと分かると、扉より先に{b}の手を握った。{a}「……よかった、一人じゃなくて｜……よかった、一人ではなくて｜……よかったです、一人じゃなくて」{b}「それ、どっちの台詞？｜それは、どちらの台詞だ｜それ、どちらの台詞ですか」|'+
'[飲む]{a}は{q}を全部自分の前に並べた。{a}「親の分は、親が引き受ける｜＝｜親の分は、親が引き受けます」{b}「全部飲む気？　年を考えて｜全部飲む気か。年を考えろ｜全部飲むおつもりですか。お年を考えてください」')},
{k:'adult',side:'B',cat:'conflict',mood:'rub',label:'子が親の過干渉に言い返す',why:'大人になった子と親のすれ違い（すれ違い）',T:L(
'{a}は、{b}が何度も同じ注意をすることにうんざりした。{say}|'+
'[重い]扉の紙の「{q}」を見た瞬間、{b}は{a}の目を両手でふさごうとした。{a}「もう大人なんだけど｜もう大人なのだが｜もう大人なんですけど」――{b}は手を下ろしたが、顔は真っ赤だった。|'+
'{a}「いつまで子ども扱いするつもり？｜いつまで子ども扱いするつもりだ｜いつまで子ども扱いなさるおつもりですか」{b}「あなたが何歳になっても、私の子だから｜あなたが何歳になっても、私の子だからだ｜あなたが何歳になっても、私の子ですから」――言い返せない返事に、{a}は黙った。')}
],
friend:[
{k:'candy',cat:'bond',mood:'warm',label:'友人と隠し持った飴を分け合う',why:'友人どうしの気安さ（仲良し）',T:L(
'{a}は、ポケットに入っていた飴を一つ見つけて、{b}と半分に割った。二人で並んで座り、飴を口に入れた。{say}|'+
'[長丁場]{a}と{b}は、ここを出たら行きたい店を、交互に一つずつ挙げていった。百を超えたあたりで、二人とも笑いが止まらなくなった。|'+
'[一人]{a}「一人しか出られない？　なら、出たほうが残ったほうの好物を山ほど持って迎えに来る｜一人しか出られないのか。なら、出たほうが残ったほうの好物を山ほど持って迎えに来る｜一人しか出られないんですか。なら、出たほうが残ったほうの好物を山ほど持って迎えに来ます」{b}「それ、絶対ね｜それは、絶対だぞ｜それ、絶対ですよ」')},
{k:'promise',cat:'conflict',mood:'rub',label:'友人との約束を破ったことを蒸し返す',why:'友人どうしの古い不満（すれ違い）',T:L(
'{a}と{b}は、壁を調べる手順のことで小さく揉めた。{a}は、ついでのように、{b}が閉じ込められる前日に約束をすっぽかしたことまで持ち出した。{say}|'+
'{b}は眉をひそめた。{b}「あれは、ちゃんと謝ったでしょ｜あれは、ちゃんと謝っただろう｜あれは、ちゃんと謝ったでしょう」{a}「謝ればいいってものじゃない｜謝ればいいというものではない｜謝ればいいというものじゃありません」――二人は、白い部屋の端と端に座った。|'+
'[大勢]{a}は、{b}が新しく知り合った人とばかり話しているのが、少し面白くなかった。友達なのに、と思う自分も、少し嫌だった。')}
],
colleague:[
{k:'meeting',cat:'help',mood:'warm',label:'同僚と扉の前で脱出の会議を開く',why:'同僚どうしの段取り（仲良し）',T:L(
'{a}と{b}は、扉の前で即席の会議を開いた。議題は一つ、ここを出る方法。{a}は会議の締めくくりに言った。{say}|'+
'[長丁場]{a}は、{b}が手帳に書いた脱出の案を見て、職場でいつもそうするように爪で印をつけた。{b}「ここ、詰めが甘い？｜ここは、詰めが甘いか｜ここ、詰めが甘いですか」{a}「いつもどおりの出来｜いつもどおりの出来だ｜いつもどおりの出来です」――褒め言葉だった。|'+
'[一人]{a}「一人しか出られないなら、出た人が職場に事情を説明する。誰かがやらないと、二人とも無断欠勤になる｜一人しか出られないなら、出た者が職場に事情を説明する。誰かがやらないと、二人とも無断欠勤だ｜一人しか出られないなら、出た人が職場に事情を説明します。誰かがやらないと、二人とも無断欠勤になります」')},
{k:'credit',cat:'conflict',mood:'rub',label:'同僚と手がかりの手柄を取り合う',why:'同僚の張り合い（すれ違い）',T:L(
'{a}は、{b}が自分の見つけた手がかりを、さも自分の発見のように話したことにむっとした。{say}|'+
'{a}は低い声で言った。{a}「その案、会議で私が出したやつ｜その案は、会議で私が出したものだ｜その案、会議で私が出したものですよね」{b}「いい案は、みんなのもの｜いい案は、皆のものだ｜いい案は、みんなのものです」――職場の因縁が、白い部屋で再燃した。|'+
'[重い]扉の紙の「{q}」を前に、{a}と{b}はどちらが先に言い出すかで、無言の押し付け合いを始めた。職場の面倒な仕事を押し付け合うときと、まったく同じ顔だった。')}
],
childhood:[
{k:'base',cat:'bond',mood:'warm',label:'幼馴染と子どものころの秘密基地を語る',why:'幼馴染の変わらない絆（仲良し）',T:L(
'{a}と{b}は、子どものころに作った秘密基地の話をした。話しながら、{a}は昔のように{b}の隣に寝転がった。{say}|'+
'[長丁場]{a}は、{b}が眠る前に必ず左を向く癖を、今でも覚えていた。{b}も、{a}が考えごとをするときに唇を噛む癖を覚えていた。|'+
'[一人]{a}「一人しか出られないなら、昔みたいに、あなたが先に行って。私は、あとから必ず追いつく｜一人しか出られないなら、昔のように、あなたが先に行け。私は、あとから必ず追いつく｜一人しか出られないなら、昔みたいに、あなたが先に行ってください。私は、あとから必ず追いつきます」')},
{k:'ears',cat:'conflict',mood:'rub',label:'幼馴染に強がりを見抜かれる',why:'幼馴染だからごまかせない（すれ違い）',T:L(
'{a}は、平気なふりをしていた{b}の顔を覗き込んだ。{a}「嘘ついてる。昔から、耳が赤くなる｜嘘をついている。昔から、耳が赤くなる｜嘘をついていますね。昔から、耳が赤くなるんです」――{b}は、耳を手で隠した。|'+
'{a}は、{b}がほかの誰かを気にしているのに気づいて、からかった。{a}「さっきから、あの人ばっかり見てる｜さっきから、あの人ばかり見ているな｜さっきから、あの方ばかり見ていますね」――{b}にじろりと睨まれて、{a}は肩をすくめた。|'+
'[大勢]ほかの人の前で、{a}は{b}の子どものころの失敗談を話してしまった。{b}は笑ってごまかしたが、あとで{a}の足を思いきり踏んだ。')}
],
sibling:[
{k:'blanket',cat:'bond',mood:'warm',label:'きょうだいで一つの毛布を分け合う',why:'きょうだいで支え合う（仲良し）',T:L(
'{a}と{b}は、一枚しかない毛布を取り合ってから、結局、子どものころのように二人でくるまった。{say}|'+
'[長丁場]{a}は、{b}が家族にしか見せない顔で眠っているのを見て、なんとなく安心した。|'+
'[飲む]{a}は{q}を前に言った。{a}「半分こ。昔から、おやつはそう決まってる｜半分ずつだ。昔から、おやつはそう決まっている｜半分ずつです。昔から、おやつはそう決まっています」')},
{k:'parents',cat:'conflict',mood:'rub',label:'きょうだいで親の話になって揉める',why:'きょうだいの言い分の食い違い（すれ違い）',T:L(
'{a}と{b}は、どちらが親に可愛がられていたかで言い合いになった。{say}|'+
'{a}「家に帰ったら、私が先に親に連絡する｜＝｜家に帰ったら、私が先に親に連絡します」{b}「いつもそう。いいところは全部持っていく｜いつもそうだ。いいところは全部持っていく｜いつもそうですね。いいところは全部持っていくんですから」|'+
'[重い]扉の紙の「{q}」を見た{a}と{b}は、同時に首を横に振った。きょうだいで、それだけはすぐに意見が合った。')}
],
worship:[
{k:'bed',side:'A',cat:'help',mood:'warm',say:'faithA',label:'崇める相手のために寝床を整える',why:'信仰する側の献身（仲良し）',T:L(
'{a}は、白い部屋でいちばん暖かい場所を探し当てて、{b}のための寝床を整えた。{say}|'+
'[飲む]{a}は{q}を一つ残らず自分の前に集めた。{b}の体に知らないものを入れさせるくらいなら、自分が全部引き受ける。{a}にとって、それは迷うことでもなかった。|'+
'[長丁場]{a}は、{b}が目を覚ますたびに、何か欲しいものはないかと尋ねた。{b}が首を振っても、{a}は嬉しそうに微笑んだ。答えてもらえるだけで、{a}には十分だった。')},
{k:'weight',side:'B',cat:'conflict',mood:'rub',say:'faithB',label:'崇められる重さに耐えかねる',why:'信仰される側の戸惑い（すれ違い）',T:L(
'{a}は、何をするにも先回りして世話を焼く{b}に、とうとう声を上げた。{say}|'+
'[重い]扉の紙の「{q}」を見た{b}が、ためらいもなく{a}の前にひざまずいた。{a}「やめて。そういうのは、望んでない｜やめろ。そういうのは、望んでいない｜おやめください。そういうのは、望んでいません」――{b}は、叱られたことさえ嬉しそうにうなずいた。|'+
'{a}は、{b}の視線から逃げるように壁のほうを向いた。どこを向いても、{b}の祈るような目がついてくる気がした。')}
],
blind:[
{k:'believe',side:'A',cat:'help',mood:'warm',say:'faithA',label:'盲信する相手の言葉だけを頼りにする',why:'盲信する側の揺るがない信頼（仲良し）',T:L(
'{a}は、{b}が「この壁が怪しい｜この壁が怪しい｜この壁が怪しいです」と言った瞬間、迷わずその壁を叩き始めた。{say}|'+
'[一人]{a}「一人しか出られないなら、あなたが決めて。あなたが決めたことなら、それが正しい｜一人しか出られないなら、あなたが決めろ。あなたが決めたことなら、それが正しい｜一人しか出られないなら、あなたが決めてください。あなたが決めたことなら、それが正しいんです」|'+
'[長丁場]何時間たっても、{a}の目には迷いがなかった。{b}が「きっと出られる｜きっと出られる｜きっと出られます」と言ったから。{a}にとっては、それで十分な根拠だった。')},
{k:'doubt',side:'B',cat:'conflict',mood:'rub',say:'faithB',label:'絶対の信頼が怖くなる',why:'盲信される側の不安（すれ違い）',T:L(
'{a}は、自分の思いつきを{b}が少しも疑わずに実行するのを見て、急に怖くなった。{say}|'+
'{a}は思わず尋ねた。{a}「もし私が間違ってたら、どうするの｜もし私が間違っていたら、どうする｜もし私が間違っていたら、どうなさるんですか」{b}「あなたは間違えない｜＝｜あなたは間違えません」――{a}は、その答えにかえって言葉を失った。|'+
'[重い]扉の紙の「{q}」を前に、{b}は{a}の顔だけを見ていた。{a}が何と言っても従うつもりの目だった。{a}は、軽はずみなことは一言も言えなくなった。')}
]
});
})();
});
;
/* ==== js/room-same.js ==== */
HK.Load.def(81,'js/room-same.js',function(){
(function(){
'use strict';
var HK=window.HK,scen=HK.SCENARIOS&&HK.SCENARIOS.whiteroom,API=HK.RoomAPI;
if(!scen|| !API)return;
var EV=API.EV;
var S=HK.RoomSame=HK.RoomSame||{};
function L(s){return s.split('|');}
function R(ctx,a,b){return ctx.R(a,b);}
function fill(s,v){return String(s).replace(/\{(\w+)\}/g,function(m,k){return v[k]!=null?v[k]:m;});}
function q3(s){s=String(s);return s.charAt(0)==='「'&&s.charAt(s.length-1)==='」'?s.slice(1,-1):s;}
function same(a,b){var A=HK.Attr;return!!(A&&A.samePair&&A.samePair(a,b));}
function dark(c){var A=HK.Attr;if(!c)return false;return A&&A.isDark? !!A.isDark(c): !!c.sameDark;}
function darkOf(a,b){
var A=HK.Attr;
if(A&&A.darkOf)return A.darkOf(a,b)||null;
if(!same(a,b))return null;
var x=dark(a),y=dark(b);
return x&& !y?a:y&& !x?b:null;
}
S.dark=dark;S.darkOf=darkOf;S.same=same;
function free(c){return!!c&&HK.State.here(c)&& !(c.flags&&c.flags.down)&&c.flags.cagePair==null;}
function top(c){
if(!c)return'A';
if(c.flags.rsTop)return c.flags.rsTop;
var t=HK.egoType?HK.egoType(c.eg||{}).top:'A';
return(c.flags.rsTop= /^(CP|NP|A|FC|AC)$/.test(t)?t:'A');
}
S.top=top;
function tie(ctx,a,b,type){return!!(HK.Ties&&HK.Ties.has(ctx,a,b,type));}
function loveTie(ctx,a,b){return ctx.pair(a,b).couple||tie(ctx,a,b,'lover')||tie(ctx,a,b,'spouse')||tie(ctx,a,b,'mate')||tie(ctx,a,b,'fated');}
function yan(ctx,a,b){var O=HK.Obsess;return!!(O&&O.yanTie&&O.yanTie(ctx,a,b));}
function obs(ctx,a,b){
var O=HK.Obsess;
if(O&&O.noTie&&O.noTie(ctx,a,b))return false;
return yan(ctx,a,b)||(O&&O.level?O.level(ctx,a,b):0)>=35||(a.tr.jealous||0)>=0.62;
}
function want(ctx,a,c){return HK.canLove(a,c)&&(loveTie(ctx,a,c)||yan(ctx,a,c)||R(ctx,a,c).att>=30);}
function hostile(ctx,a,c){
if(HK.Ties&&HK.Ties.hostile&&HK.Ties.hostile(ctx,a,c))return true;
var HKit=HK.HateKit;
return!!(HKit&&HKit.level&&HKit.level(ctx,a,c)>=35);
}
function friendly(ctx,b,c){var r=R(ctx,b,c);return!hostile(ctx,b,c)&&r.aff>=20&&r.ten<45;}
function others(ctx,list){return ctx.present().filter(function(c){return list.indexOf(c)<0&&free(c);});}
S.gk=function(T,B){var P=HK.Pos;return(P&&P.isF(T,B)?'f':'m')+(P&&P.isF(B,T)?'f':'m');};
S.sexOk=function(ctx,a,b){
if(HK.SAFE_ON|| !HK.State.r18ok(a)|| !HK.State.r18ok(b)||HK.ngPair(a,b)||(HK.sexBlocked&&HK.sexBlocked(a,b)))return false;
if(!HK.canLove(a,b)|| !HK.canLove(b,a)||(HK.Pos&& !HK.Pos.okSex(a,b)))return false;
if(ctx.pair(a,b).kin)return false;
return!(HK.Ties&&HK.Ties.all(ctx,a,b).some(function(t){return HK.tieNoLove&&HK.tieNoLove(t);}));
};
function darkWhy(ctx,d){
if(ctx.flags.rsDarkWhy)return'';
ctx.flags.rsDarkWhy=true;
return'（'+d.name+'は闇に堕ちた自分。二重人格の別人格のように本人を守るためには動かない。もう一人の自分をより苦しめたいという本能だけで動く）';
}
var FN={CP:'CP（断罪・支配）',NP:'NP（過干渉・束縛）',A:'A（冷徹な計算）',FC:'FC（衝動・遊び半分の残酷さ）',AC:'AC（卑屈さの裏返しの嫉妬）'};
var FN_L={CP:'CP（否認して怒る）',NP:'NP（救おうとする）',A:'A（自分ではないと切り離す）',FC:'FC（逃げる）',AC:'AC（責めを受け入れる）'};
var RIVAL=L('{b}が{c}の隣に座ったのを見て、{a}は{b}の腕を引いて立たせた。{a}「そこ、私の席｜そこは私の席だ｜そこは私の席です」{b}「同じ顔なんだから、どっちが座っても同じでしょ｜同じ顔なのだから、どちらが座っても同じだろう｜同じ顔なんですから、どちらが座っても同じでしょう」{c}は、そっくりな二人に両側から見下ろされて、身を縮めた。'+
'|{b}が{c}に甘えた声を出すのを聞いて、{a}は顔をしかめた。{a}「……自分とは思えない……。そんな声、出したことない｜……自分とは思えない……。そんな声は、出したことがない｜……自分とは思えません……。そんな声、出したことありません」{b}「出してるよ。{c}の前では、いつも｜出している。{c}の前では、いつもだ｜出していますよ。{c}の前では、いつも」'+
'|{a}は{c}に笑いかけてから、横目で{b}を睨んだ。{b}「よくそんな顔ができるね。さっきまで、私と同じ顔で拗ねてたじゃん｜よくそんな顔ができるな。さっきまで、私と同じ顔で拗ねていたではないか｜よくそんな顔ができますね。さっきまで、私と同じ顔で拗ねていたじゃありませんか」{a}「同じ顔だから、どこを直せば{c}が喜ぶか分かるの｜同じ顔だから、どこを直せば{c}が喜ぶか分かる｜同じ顔ですから、どこを直せば{c}が喜ぶか分かるんです」'+
'|{c}が{a}に礼を言うと、{b}がすかさず割って入った。{b}「それ、私も同じことができる。もっと上手に｜それなら、私にも同じことができる。もっと上手にな｜それ、私にも同じことができます。もっと上手にできます」{a}「自分に張り合われるの、こんなに腹が立つとは思わなかった｜自分に張り合われるのが、これほど腹立たしいとは思わなかった｜自分に張り合われるのが、こんなに腹の立つことだとは思いませんでした」'+
'|{a}と{b}は、{c}の両手を一本ずつ取ったまま、どちらも離さなかった。{a}「離して。{c}が困ってる｜離せ。{c}が困っている｜離してください。{c}が困っています」{b}「困らせてるのはそっちでしょ。……自分とは思えない……。そんなにみっともなくすがるなんて、見てられない｜困らせているのはそちらだろう。……自分とは思えない……。そこまでみっともなくすがるとは、見ていられない｜困らせているのはそちらでしょう。……自分とは思えません……。そんなにみっともなくすがるなんて、見ていられません」'+
'|{c}「……どっちが本物なの？｜……どちらが本物だ？｜……どちらが本物なんですか？」{c}が困ったように訊くと、{a}と{b}は同時に「私」と答えた。そして同時に、相手を睨みつけた。{a}「よくそんな顔ができるね。真似しないで｜よくそんな顔ができるな。真似をするな｜よくそんな顔ができますね。真似しないでください」');
var RIVAL_C=L('{c}は、同じ顔の二人に挟まれて、どちらの目を見ればいいのか分からなかった。|{c}は二人の間で困ったように笑った。同じ人に、二度想われている――その奇妙さを、どう受け止めればいいのか分からなかった。|{c}が口を開きかけると、{a}と{b}は同じ速さで振り向いた。{c}は、言いかけた言葉を飲み込んだ。');
function rivalOf(ctx,a,b,only){
var cs=(only?[only]:others(ctx,[a,b])).filter(function(c){return want(ctx,a,c)&&want(ctx,b,c)&&(obs(ctx,a,c)||obs(ctx,b,c));});
if(!cs.length)return null;
return cs.sort(function(x,y){return(R(ctx,a,y).att+R(ctx,b,y).att)-(R(ctx,a,x).att+R(ctx,b,x).att);})[0];
}
function twin(ctx,a){var A=HK.Attr,i=a&&a.same;if(i==null|| !A)return null;var t=ctx.chars[i];return t&&same(a,t)&&free(t)?t:null;}
function setOf(ctx,a,bb,fn){
if(same(a,bb)){var c=fn(ctx,a,bb);return c?{a:a,b:bb,c:c}:null;}
var s=twin(ctx,a);
if(!s||s===bb)return null;
return fn(ctx,a,s,bb)===bb?{a:a,b:s,c:bb}:null;
}
EV.push({
id:'rs_rival',label:'同一人物の二人が同じ人を想う',cat:'conflict',scope:'pair',pri:true,
when:function(ctx,a,bb){
if(!free(a)|| !free(bb)||ctx.present().length<3)return false;
var st=setOf(ctx,a,bb,rivalOf);
if(!st)return false;
var pf=ctx.pair(st.a,st.b);
return(pf.rsRival||0)<3&&(pf.rsRivalAt==null||ctx.stepIndex-pf.rsRivalAt>=2);
},
w:function(ctx,a){return 1.8+(a.tr.jealous||0)*0.8;},
run:function(ctx,a0,bb){
var st=setOf(ctx,a0,bb,rivalOf);
if(!st)return null;
var a=st.a,b=st.b,c=st.c;
var pf=ctx.pair(a,b);
pf.rsRival=(pf.rsRival||0)+1;pf.rsRivalAt=ctx.stepIndex;pf.jealous=(pf.jealous||0)+1;
ctx.mod2(a,b,{ten:8,aff: -3},{ten:8,aff: -3});
ctx.mod(a,c,{att:3});ctx.mod(b,c,{att:3});
var t=q3(ctx.pick(RIVAL))+(ctx.rng()<0.5?ctx.pick(RIVAL_C):'');
var oa=obs(ctx,a,c),ob=obs(ctx,b,c);
return{text:ctx.t(t,a,b,c),why:a.name+'と'+b.name+'は同一人物で、どちらも'+c.name+'を想っている。'+(oa&&ob?'二人とも':(oa?a:b).name+'が')+c.name+'に強く執着していた：同じ相手の取り合い',mag:14,with:bb===b?[c]:[b]};
}
});
var RECOIL=L('{b}が{c}と笑い合っているのを見て、{a}は思わず一歩下がった。{a}「……え、待って。なんでその人と笑えるの｜……待て。なぜその人と笑える｜……待ってください。なぜその人と笑えるんですか」{b}「話してみたら、悪い人じゃなかったよ｜話してみたら、悪い人ではなかった｜話してみたら、悪い人じゃありませんでしたよ」{a}は、自分の顔が自分の嫌いな相手に笑いかけているのを、信じられない思いで見ていた。'+
'|{c}の冗談に、{b}が肩を揺らして笑った。{a}はその横顔を見て、背筋が冷えた。同じ顔で、同じ声で、あの{c}に心を許している。{a}「……やめて。その顔でその人に懐かないで｜……やめろ。その顔でその人に懐くな｜……やめてください。その顔でその人に懐かないでください」'+
'|{a}は、{b}が{c}に飲み物を半分分けてやるのを見て、口を押さえた。{a}「無理。自分があれをやってるの、本当に無理｜無理だ。自分があれをしているのは、本当に無理だ｜無理です。自分があれをしているのは、本当に無理です」{b}は首をかしげた。{b}「同じ私なのに、どうしてそんなに嫌うの｜同じ私なのに、なぜそこまで嫌う｜同じ私なのに、どうしてそんなに嫌うんですか」'+
'|{b}と{c}が並んで壁の継ぎ目を調べているのを、{a}は部屋の反対側から眺めていた。{a}（あれは私じゃない。私は、あの人の隣になんか座らない）――そう思っても、{b}の仕草は、どこまでも自分と同じだった。'+
'|{c}が{b}を名前で呼んだ。{b}は自然に振り向いて、笑い返した。{a}は鳥肌の立った腕をさすった。{a}「……気持ち悪い。自分が、あの人に名前で呼ばれて喜んでる｜……気味が悪い。自分が、あの人に名前で呼ばれて喜んでいる｜……気味が悪いです。自分が、あの人に名前で呼ばれて喜んでいます」'+
'|{a}は{b}の袖を引いて、部屋の隅まで連れていった。{a}「あの人が何をしたか、忘れたの？｜あの人が何をしたか、忘れたのか？｜あの人が何をしたか、忘れたんですか？」{b}「覚えてる。でも、ここではただの{c}だから｜覚えている。だが、ここではただの{c}だ｜覚えています。でも、ここではただの{c}ですから」{a}は、自分の口から出たとは思えないその答えに、言葉を失った。');
function recoilOf(ctx,a,b,only){return(only?[only]:others(ctx,[a,b])).filter(function(c){return free(c)&&hostile(ctx,a,c)&&friendly(ctx,b,c);})[0]||null;}
EV.push({
id:'rs_recoil',label:'もう一人の自分が敵と笑い合う',cat:'conflict',scope:'pair',pri:true,
when:function(ctx,a,bb){
if(!free(a)|| !free(bb)||ctx.present().length<3)return false;
var st=setOf(ctx,a,bb,recoilOf);
if(!st)return false;
var pf=ctx.pair(st.a,st.b);
return(pf['rsRecoil'+a.i]||0)<2&&(pf.rsRecoilAt==null||ctx.stepIndex-pf.rsRecoilAt>=2);
},
w:function(){return 2.2;},
run:function(ctx,a0,bb){
var st=setOf(ctx,a0,bb,recoilOf);
if(!st)return null;
var a=st.a,b=st.b,c=st.c;
var pf=ctx.pair(a,b);
pf['rsRecoil'+a.i]=(pf['rsRecoil'+a.i]||0)+1;pf.rsRecoilAt=ctx.stepIndex;
ctx.mod2(a,b,{ten:6,trust: -4},{ten:3});
ctx.mod(a,c,{ten:4});
ctx.stress(a,5);
return{text:ctx.t(q3(ctx.pick(RECOIL)),a,b,c),why:a.name+'は'+c.name+'を敵視している。なのに、もう一人の自分の'+b.name+'は'+c.name+'と親しくしていた：ドン引き',mag:12,with:bb===b?[c]:[b]};
}
});
var DUO={
before:L('{a}は{b}の寝顔を見ていて、ふと目を逸らした。自分の顔なのに、ずっと見ていたいと思ってしまった。{a}「……自分に見とれるなんて、どうかしてる｜……自分に見とれるとは、どうかしている｜……自分に見とれるなんて、どうかしています」'+
'|{b}「ねえ、もし私たちが付き合ったら、それって何て呼ぶんだろう｜もし私たちが付き合ったら、それは何と呼ぶのだろうな｜もし私たちがお付き合いしたら、それは何と呼ぶんでしょう」{a}「……自分に惹かれるって、ただのナルシストでしょ｜……自分に惹かれるのは、ただのナルシストだろう｜……自分に惹かれるのは、ただのナルシストでしょう」そう言いながら、{a}は{b}から目を離せなかった。'+
'|二人きりの部屋で、{a}と{b}は同じ速さで息をしていた。{a}は、{b}が自分のいちばん弱いところを知っていて、それでも黙ってそばにいてくれることに気づいた。それは、これまで知らなかった種類の優しさだった。'),
lover:L('{a}と{b}は、背中を合わせて座っていた。{a}「出られなくても、いいかもしれない。あなたがいるなら｜出られなくても、いいのかもしれない。あなたがいるなら｜出られなくても、いいのかもしれません。あなたがいるなら」{b}「同じことを言おうとしてた｜同じことを言おうとしていた｜同じことを言おうとしていました」二人は、同時に小さく笑った。'+
'|{b}が{a}の髪を指で梳いた。自分の癖を、自分がいちばんよく知っている。{a}は目を閉じた。{a}「恋人が自分だなんて、人には言えないね｜恋人が自分だとは、人には言えないな｜恋人が自分だなんて、人には言えませんね」{b}「言わなくていい。私たちだけが知ってれば｜言わなくていい。私たちだけが知っていればいい｜言わなくていいんです。私たちだけが知っていれば」'+
'|{a}は{b}の肩に頭を預けた。もう一人の自分の体温は、ほんの少しだけ自分より高かった。{a}「ずるいな。同じ私なのに、あなたのほうがあったかい｜ずるいな。同じ私なのに、あなたのほうが温かい｜ずるいです。同じ私なのに、あなたのほうが温かいんですから」'),
spouse:L('{a}「家の鍵、ちゃんと閉めてきたっけ｜家の鍵は、ちゃんと閉めてきたか｜家の鍵、ちゃんと閉めてきましたっけ」{b}「閉めた。あなたが閉めたのを、私が確かめた｜閉めた。あなたが閉めたのを、私が確かめた｜閉めましたよ。あなたが閉めたのを、私が確かめました」――同じ人どうしの夫婦は、白い部屋でも、いつもの暮らしの話をしていた。'+
'|{b}は{a}の指輪を、自分の指輪と並べて照明にかざした。同じ形の手に、同じ形の指輪。{b}「結婚するとき、友達に変な顔をされたね｜結婚するとき、友人たちに妙な顔をされたな｜結婚するとき、友人たちに変な顔をされましたね」{a}「でも、後悔したことは一度もない｜だが、後悔したことは一度もない｜でも、後悔したことは一度もありません」'+
'|{a}と{b}は、部屋の隅で並んで横になった。夫婦になってから、二人で眠らなかった夜はない。{a}「ここでも、寝る場所は右側なんだ｜ここでも、寝る場所は右側なのか｜ここでも、寝る場所は右側なんですね」{b}「あなたも私も、右側がいいから。家でもいつも取り合いになる｜あなたも私も、右側がいいからな。家でもいつも取り合いになる｜あなたも私も、右側がいいですから。家でもいつも取り合いになりますね」'),
fwb:L('{a}と{b}は、触れるか触れないかの距離に座っていた。{a}「……ここで変な空気にしたら、出た後に困るのは私たち｜……ここで妙な空気にすれば、出た後に困るのは私たちだ｜……ここで変な空気にしたら、出た後に困るのは私たちです」{b}「自分相手に、今さら何を困るの｜自分を相手に、今さら何を困る｜自分を相手に、今さら何を困るんですか」'+
'|{b}「恋人じゃない。でも、他人でもない。……自分って、いちばん都合のいい相手だよね｜恋人ではない。だが、他人でもない。……自分というのは、いちばん都合のいい相手だな｜恋人ではありません。でも、他人でもありません。……自分って、いちばん都合のいい相手ですよね」{a}は答えずに、{b}の肩に額を預けた。名前のない関係のまま、二人は朝を待った。'+
'|{a}は{b}の横顔を見て、ため息をついた。{a}「会うのは、いつも夜だけだったね｜会うのは、いつも夜だけだったな｜会うのは、いつも夜だけでしたね」{b}「昼間に自分と会っても、話すことがないから｜昼間に自分と会っても、話すことがないからな｜昼間に自分と会っても、話すことがありませんから」――昼も夜もない白い部屋で、二人は初めて、ただ並んで座っていた。')
};
var DUO_LABEL={before:'付き合う前',lover:'恋人',spouse:'夫婦',fwb:'セフレ'};
function duoRel(ctx,a,b){
if(tie(ctx,a,b,'spouse'))return'spouse';
if(ctx.pair(a,b).couple||tie(ctx,a,b,'lover'))return'lover';
if(tie(ctx,a,b,'fwb'))return'fwb';
return'before';
}
EV.push({
id:'rs_duo',label:'同一人物の二人だけの部屋',cat:'bond',scope:'pair',pri:true,
when:function(ctx,a,b){
if(!same(a,b)||darkOf(a,b)||ctx.present().length!==2|| !free(a)|| !free(b))return false;
if(HK.ngPair(a,b)|| !HK.canLove(a,b)|| !HK.canLove(b,a))return false;
var pf=ctx.pair(a,b);
return(pf.rsDuo||0)<3&&(pf.rsDuoAt==null||ctx.stepIndex-pf.rsDuoAt>=2)&&ctx.stepIndex>=1;
},
w:function(){return 2;},
run:function(ctx,a,b){
var pf=ctx.pair(a,b),rel=duoRel(ctx,a,b);
pf.rsDuo=(pf.rsDuo||0)+1;pf.rsDuoAt=ctx.stepIndex;
if(rel==='before')ctx.mod2(a,b,{att:4,trust:4},{att:4,trust:4});
else ctx.mod2(a,b,{aff:4,trust:4,att:2},{aff:4,trust:4,att:2});
var X=S.X&&S.X.duo&&S.X.duo[rel];
var pool=X&& !HK.SAFE_ON?DUO[rel].concat(X):DUO[rel];
return{cat:rel==='before'?'bond':'romance',text:ctx.t(q3(ctx.pick(pool)),a,b),why:a.name+'と'+b.name+'は同一人物で、二人だけで閉じ込められた（'+DUO_LABEL[rel]+'）',mag:10};
}
});
var TRIO_SAFE=L('{c}は、同じ顔の二人に左右から挟まれて座っていた。{a}と{b}が同時に{c}の名前を呼び、同時に顔をしかめた。{a}「……自分と一緒に恋人を囲むなんて、変な感じ｜……自分と一緒に恋人を囲むとは、妙な気分だ｜……自分と一緒に恋人を囲むなんて、変な気分です」'+
'|{a}は、{b}が{c}を見る目つきを見て、思わず目を伏せた。自分は{c}を、あんなふうに見ていたのか。{b}も、同じことを考えている顔をしていた。'+
'|{c}「二人とも、同じところで笑うんだね｜二人とも、同じところで笑うのだな｜お二人とも、同じところで笑うんですね」{a}と{b}は顔を見合わせた。自分の笑い方を、恋人の隣で外から見せつけられる――それは少しだけ、恥ずかしかった。');
function trioSame(ctx,g){
if(!g||g.length<3)return null;
g=g.slice(0,3);
for(var i=0;i<3;i++)for(var j=i+1;j<3;j++){
var x=g[i],y=g[j];
if(!same(x,y))continue;
var o=g.filter(function(c){return c!==x&&c!==y;})[0];
if(!o)return null;
if(loveTie(ctx,x,o))return{a:x,b:y,c:o};
if(loveTie(ctx,y,o))return{a:y,b:x,c:o};
}
return null;
}
['trio','trio_auto','trio_heat','trio_more'].forEach(function(id){
var e=EV.filter(function(x){return x.id===id;})[0];
if(!e||e._rs)return;
var run0=e.run;
e._rs=true;
e.run=function(ctx,a,b){
ctx.flags.lastTrioInfo=null;
var r=run0.apply(this,arguments);
if(!r||typeof r.text!=='string')return r;
var seen=[],g=[a,b].concat(r.with||[]).filter(function(c){if(!c||seen.indexOf(c)>=0)return false;seen.push(c);return true;});
var t=trioSame(ctx,g);
if(!t)return r;
var k='rsTrio'+[t.a.i,t.b.i,t.c.i].sort().join('-');
if((ctx.flags[k]||0)>=2)return r;
ctx.flags[k]=(ctx.flags[k]||0)+1;
var sexed= !!ctx.flags.lastTrioInfo,add='';
if(sexed&& !HK.SAFE_ON&&S.X&&S.X.trio)add=S.X.trio(ctx,t.a,t.b,t.c)||'';
if(!add)add=ctx.t(q3(ctx.pick(TRIO_SAFE)),t.a,t.b,t.c);
var at= -1,re= /（三人で[^）]*）|扉はまだ開かない。/g,m;
while((m=re.exec(r.text))){if(m.index>=r.text.length*0.5){at=m.index;break;}}
r.text=at>=0?r.text.slice(0,at)+add+r.text.slice(at):r.text+add;
r.why=(r.why||'')+'／'+t.a.name+'と'+t.b.name+'は同一人物。'+t.c.name+'は'+t.a.name+'の'+(tie(ctx,t.a,t.c,'spouse')?'結婚相手':'恋人');
return r;
};
});
var TORM={
CP:{
solo:L('{a}は{b}を見下ろして、鼻で笑った。{a}「正しいふりが上手になったね。中身は私と同じくせに｜正しいふりが上手くなったな。中身は私と同じくせに｜正しいふりがお上手になりましたね。中身は私と同じですけど」'+
'|{a}は{b}を壁際に立たせ、床を指さした。{a}「座って。あなたが何をしてきたか、一つずつ言って｜座れ。あなたが何をしてきたか、一つずつ言え｜座ってください。あなたが何をしてきたか、一つずつおっしゃってください」{b}が言い淀むたび、{a}は同じ問いを、少しずつ声を強めて繰り返した。'+
'|{a}「覚えてる？　あなたが最初に嘘をついた日。私は覚えてる。同じ私だから｜覚えているか？　あなたが最初に嘘をついた日を。私は覚えている。同じ私だからな｜覚えていますか？　あなたが最初に嘘をついた日。私は覚えています。同じ私ですから」{a}は、{b}が人に言わずにきた過ちを、罪状を読み上げるように並べていった。'+
'|{a}は{b}の手首をつかんで、床に膝をつかせた。{a}「罰は受けないと。あなたが自分に甘いから、私がこうなった｜罰は受けるべきだ。あなたが自分に甘いから、私がこうなった｜罰は受けないといけません。あなたが自分に甘いから、私がこうなったんです」'),
crowd:L('{a}は{c}の前で{b}を指さした。{a}「この人はね、自分のことは棚に上げて、正しい顔で人を裁くのが得意なの｜この人は、自分のことは棚に上げて、正しい顔で人を裁くのが得意だ｜この人は、自分のことは棚に上げて、正しい顔で人を裁くのがお得意なんです」{b}は言い返せなかった。{c}の目が、{b}と{a}を見比べていた。'+
'|{a}は{c}に向き直り、{b}の過去の失敗を、日付まで正確に話して聞かせた。{a}「裁かれるべきなのは私じゃない。こっち｜裁かれるべきなのは私ではない。こちらだ｜裁かれるべきなのは私ではありません。こちらです」{b}は、{c}の視線から逃げるように俯いた。')
},
NP:{
solo:L('{a}は{b}の襟を直し、髪を整え、靴の紐まで結び直した。{a}「ほら、あなたは私がいないと何もできない｜ほら、あなたは私がいないと何もできない｜ほら、あなたは私がいないと何もできないんです」{b}が身を引こうとすると、{a}は優しく、けれど骨がきしむほど強く、その手首を押さえた。'+
'|{a}「どこに行くの？　何をするの？　何を考えてるの？｜どこに行く？　何をする？　何を考えている？｜どこに行くんですか？　何をするんですか？　何を考えているんですか？」{a}は{b}が立ち上がるたびに、母親のような声で同じことを訊いた。部屋の中で、{b}が一人になれる場所はどこにもなかった。'+
'|{a}は{b}の額に手を当てて、困ったように笑った。{a}「また眠れてないんでしょう。あなた、昔からそう。夜になると、ひとりで泣くの｜また眠れていないのだろう。あなたは昔からそうだ。夜になると、ひとりで泣く｜また眠れていないんでしょう。あなたは昔からそうです。夜になると、ひとりで泣くんです」{a}の声は優しかった。優しいまま、{b}が隠してきた弱さを、一つも残さず掘り起こしていった。'),
crowd:L('{a}は{c}に向かって、{b}の世話の焼き方を得意げに話した。{a}「この人ね、熱が出ると子どもみたいになるの。私が全部やってあげないと｜この人は、熱が出ると子どものようになる。私が全部やってやらないとな｜この人、熱が出ると子どもみたいになるんです。私が全部してあげないといけないんです」{b}は、{c}の前で弱いところを晒されて、顔を上げられなかった。'+
'|{a}は{c}と{b}の間に、当たり前のように座り込んだ。{a}「この人に話があるなら、私を通して｜この人に話があるなら、私を通せ｜この人にお話があるなら、私を通してください」{a}は笑っていたが、{b}の手首をつかむ指は、少しも緩まなかった。')
},
A:{
solo:L('{a}は{b}の正面に座り、指を折って数えた。{a}「あなたが嘘をついた回数、知ってる？　私は正確に知ってる｜あなたが嘘をついた回数を、知っているか？　私は正確に知っている｜あなたが嘘をついた回数、ご存じですか？　私は正確に知っています」{a}は表情を変えずに、{b}がいちばん触れられたくない数字を口にした。'+
'|{a}「あなたが今いちばん恐れていること、三つ挙げてあげる｜あなたが今いちばん恐れていることを、三つ挙げてやろう｜あなたが今いちばん恐れていること、三つ挙げてさしあげます」{a}の挙げた三つは、どれも外れていなかった。{b}の顔から、少しずつ血の気が引いていった。'+
'|{a}は淡々と、{b}がこの部屋を出た後に失うものを、一つずつ数えていった。仕事。友人。居場所。{a}「計算は合ってる。反論があるなら、どうぞ｜計算は合っている。反論があるなら、言ってみろ｜計算は合っています。反論があるなら、おっしゃってください」'),
crowd:L('{a}は{c}に、{b}の癖と弱点を、取扱説明書でも読み上げるように説明した。{a}「この人は、褒められると断れない。覚えておくと便利｜この人は、褒められると断れない。覚えておくと便利だ｜この人は、褒められると断れません。覚えておくと便利ですよ」{b}は、自分の仕組みを他人に渡される寒さに、身を固くした。'+
'|{a}「{c}は気づいてた？　この人、あなたの前でだけ声が半音上がるの｜{c}は気づいていたか？　この人は、あなたの前でだけ声が半音上がる｜{c}は気づいていましたか？　この人、あなたの前でだけ声が半音上がるんです」{b}の耳まで赤くなるのを、{a}は観察記録でも取るように眺めていた。')
},
FC:{
solo:L('{a}は{b}の背後から、いきなり耳元で叫んだ。{b}が飛び上がると、{a}は床を転げ回って笑った。{a}「あはは！　その顔、最高｜あはは！　その顔は最高だ｜あはは！　その顔、最高です」'+
'|{a}「ねえ、ゲームしよう。あなたが泣いたら私の勝ち｜ゲームをしよう。あなたが泣いたら私の勝ちだ｜ゲームをしましょう。あなたが泣いたら私の勝ちです」{a}は{b}の大事にしていた物を一つずつ取り上げて、目の前で放り投げてみせた。'+
'|{a}は{b}の昔のあだ名を、節をつけて歌い出した。{b}が二度と聞きたくなかった名前だった。{a}は{b}の顔色が変わるたびに、手を叩いて喜んだ。'),
crowd:L('{a}は{c}の肩を叩いて、{b}を指さした。{a}「ねえ見て見て、この人の秘密、教えてあげる！｜おい見ろ、この人の秘密を教えてやる！｜ねえ見てください、この人の秘密、教えてあげます！」{b}が止める間もなく、{a}は{b}の恥ずかしい失敗談を、身振りつきで演じてみせた。'+
'|{a}は{b}の声色を真似て、{c}に向かってでたらめを言いふらした。{c}が戸惑うたび、{a}は腹を抱えて笑った。{b}は、自分の声で自分が汚されていくのを、止められなかった。')
},
AC:{
solo:L('{a}は膝を抱えたまま、上目遣いで{b}を見た。{a}「いいよね、あなたは。ちゃんと光の当たる場所にいて。……ずるい｜いいな、あなたは。ちゃんと光の当たる場所にいて。……ずるい｜いいですね、あなたは。ちゃんと光の当たる場所にいて。……ずるいです」{a}の声は小さかったが、そこには{b}を同じ暗がりまで引きずり込もうとする粘り気があった。'+
'|{a}「あなただけ救われるなんて、許さない。私と同じところまで落ちてきて｜あなただけ救われるなど、許さない。私と同じところまで落ちてこい｜あなただけ救われるなんて、許しません。私と同じところまで落ちてきてください」{a}は泣きながら笑っていた。'+
'|{a}は{b}がようやく取り戻しかけた自信を、ひとつずつ指でつついて崩していった。{a}「それ、本当に自分の力だと思ってる？　私は、あなたがどれだけ人の顔色を窺ってきたか知ってるよ｜それが、本当に自分の力だと思っているのか？　私は、あなたがどれだけ人の顔色を窺ってきたか知っている｜それ、本当にご自分の力だと思っていますか？　私は、あなたがどれだけ人の顔色を窺ってきたか知っています」'),
crowd:L('{a}は{c}に{b}のことを訊かれると、ぽつりと言った。{a}「その人、外面がいいだけ。中身は私と同じ、みじめなまま｜その人は、外面がいいだけだ。中身は私と同じ、みじめなままだ｜その人、外面がいいだけです。中身は私と同じ、みじめなままです」{b}は、{c}の前で否定する言葉を探して、見つけられなかった。'+
'|{a}は{c}が{b}に笑いかけるたびに、{b}の袖をそっと引いた。{a}「……私のことも、見てよ。同じ顔なんだから｜……私のことも見ろ。同じ顔なのだから｜……私のことも、見てください。同じ顔なんですから」{c}が{a}のほうを向くと、{a}は{b}を見て、勝ち誇ったように目を伏せた。')
}
};
var PLEAS=L('{a}は、{b}の顔が歪むのを見て、うっとりと目を細めた。自分の顔が苦しむさまほど、見ていて飽きないものはなかった。'+
'|{b}が唇を噛むたび、{a}の口元はほころんだ。その痛みがどこから来るのか、{a}がいちばんよく知っていた。'+
'|{a}は小さく息を吐いた。満ち足りた吐息だった。{b}が苦しんでいる――それだけで、{a}の胸は甘く満たされていった。'+
'|{a}は{b}の震える指先を、宝物でも眺めるように見つめていた。'+
'|{a}「その顔。その顔が見たかった｜その顔だ。その顔が見たかった｜その顔です。その顔が見たかったんです」{a}は、心の底から嬉しそうに笑った。');
S.PLEAS=PLEAS;
function pleas(ctx){return q3(ctx.pick(PLEAS));}
S.pleas=pleas;
EV.push({
id:'rs_dk_torment',label:'闇に堕ちた自分が自分を責め苛む',cat:'conflict',scope:'pair',pri:true,
when:function(ctx,a,b){
if(darkOf(a,b)!==a|| !free(a)|| !free(b))return false;
var pf=ctx.pair(a,b);
return pf.rsTorAt==null||ctx.stepIndex-pf.rsTorAt>=1;
},
w:function(ctx,a){return 2+(a.tr.aggr||0)*0.8+(a.tr.cold||0)*0.4;},
run:function(ctx,a,b){
var pf=ctx.pair(a,b),f=top(a),T=TORM[f];
pf.rsTorAt=ctx.stepIndex;pf.rsTor=(pf.rsTor||0)+1;
var oth=others(ctx,[a,b]),c=oth.length&&ctx.rng()<0.45?ctx.pick(oth):null;
var t=q3(ctx.pick(c?T.crowd:T.solo));
if(ctx.rng()<0.45)t+=pleas(ctx);
ctx.mod(b,a,{ten:10,aff: -5,trust: -6});
ctx.mod(a,b,{ten:3});
ctx.stress(b,8);
b.flags.rsTormented=(b.flags.rsTormented||0)+1;
if(c)ctx.mod(c,b,{trust: -3});
return{text:ctx.t(t,a,b,c),why:a.name+'は闇に堕ちた自分。'+FN[f]+'が歪んだ形で、同一人物の'+b.name+'を苛む'+darkWhy(ctx,a),mag:16,with:c?[c]:null};
}
});
var REACT={
AC:L('{a}は反論しなかった。{a}「……うん。全部、本当のこと｜……ああ。全部、本当のことだ｜……はい。全部、本当のことです」{a}は、責められていると、なぜか少しだけ息がしやすかった。罰を受けているあいだは、許されなくても、逃げなくて済んだ。'+
'|{a}は{b}の前で膝を抱え、黙って言葉を浴び続けた。逃げたい。けれど、それ以上に、裁いてほしかった。裁く相手が自分自身なら、なおさらだった。'+
'|{a}「もっと言って。……私、それを聞かないといけない気がする｜もっと言え。……私は、それを聞かなければならない気がする｜もっと言ってください。……私、それを聞かないといけない気がします」{b}は嬉しそうに、望みどおりに続けた。'),
CP:L('{a}「違う！　私はそんなことしてない！｜違う！　私はそんなことはしていない！｜違います！　私はそんなことしていません！」{a}は叫んだ。叫びながら、声の震えが、自分でも否定しきれない何かを白状していた。'+
'|{a}は{b}の胸ぐらをつかんだ。{a}「黙って。あなたに私を裁く資格はない｜黙れ。あなたに私を裁く資格はない｜黙ってください。あなたに私を裁く資格はありません」――そう言いながら、{a}はどこかで、裁かれる日を待っていた自分にも気づいていた。'+
'|{a}は壁を殴りつけた。認めれば終わる。認めなければ、{b}は何度でも同じことを言うだろう。{a}は、どちらも選べないまま、拳の痛みだけを握りしめていた。'),
A:L('{a}「あれは私じゃない。私の、ありえた可能性の一つにすぎない｜あれは私ではない。私の、ありえた可能性の一つにすぎない｜あれは私ではありません。私の、ありえた可能性の一つにすぎません」{a}はそう言い聞かせた。けれど{b}が口にすることは、どれも確かに、{a}の記憶にあるものだった。'+
'|{a}は{b}の言葉を、他人事のように分析しようとした。動機、手口、効果。……分析すればするほど、それが自分の手口と寸分違わないことが分かって、{a}は考えるのをやめた。'+
'|{a}「切り離して考えれば、平気｜切り離して考えれば、平気だ｜切り離して考えれば、平気です」{a}は目を閉じた。平気なはずなのに、{b}の声を聞くたび、胸のどこかがざわついた。'),
FC:L('{a}は耳を塞いで、部屋の隅まで走った。{a}「聞こえない！　何も聞こえない！｜聞こえない！　何も聞こえない！｜聞こえません！　何も聞こえません！」――狭い部屋に、逃げ場はなかった。それでも{a}は、走るのをやめられなかった。'+
'|{a}は{b}に背を向けて、わざとらしく鼻歌を歌った。逃げたかった。忘れたかった。けれど、どこへ逃げても、もう一人の自分が追ってくることも分かっていた。'+
'|{a}は冗談で返そうとして、笑い損ねた。{a}「……ねえ、やめよう。ね？｜……なあ、やめよう。な？｜……ねえ、やめましょう。ね？」{b}は笑ったまま首を振った。{a}は、逃げ出したいのと同じくらい、捕まえてほしいと思っている自分に気づいて、ぞっとした。'),
NP:L('{a}は、{b}の冷たい手を両手で包んだ。{a}「あなたがそうなったのは、私のせいだ。だから、私が連れて帰る｜あなたがそうなったのは、私のせいだ。だから、私が連れて帰る｜あなたがそうなったのは、私のせいです。だから、私が連れて帰ります」{b}はその手を振り払わずに、ただ愉快そうに見下ろしていた。'+
'|{a}は{b}の罵りを、一つも遮らずに聞いた。{a}「……全部、受け止める。それで少しでも、あなたが楽になるなら｜……全部、受け止める。それで少しでも、あなたが楽になるならな｜……全部、受け止めます。それで少しでも、あなたが楽になるなら、構いません」{a}は、救いたいのが{b}なのか自分なのか、もう分からなかった。'+
'|{a}「戻ってきて。あなたも、私なんだから｜戻ってこい。あなたも、私なのだから｜戻ってきてください。あなたも、私なんですから」{b}は鼻で笑った。{a}は、差し伸べた手を下ろせなかった。下ろしたら、自分から逃げることになる気がした。')
};
var REACT_FX={
AC:function(ctx,a,b){ctx.stress(a,6);ctx.mod(a,b,{aff:3,ten: -2});},
CP:function(ctx,a,b){ctx.stress(a,4);ctx.mod(a,b,{ten:8,aff: -4});},
A:function(ctx,a,b){ctx.stress(a,-2);ctx.mod(a,b,{trust: -4});},
FC:function(ctx,a,b){ctx.stress(a,6);ctx.mod(a,b,{ten:4});},
NP:function(ctx,a,b){ctx.stress(a,3);ctx.mod(a,b,{aff:5,trust:2});}
};
EV.push({
id:'rs_dk_react',cat:'conflict',scope:'pair',pri:true,
when:function(ctx,a,b){
if(darkOf(a,b)!==b|| !free(a)|| !free(b)|| !(a.flags.rsTormented>(a.flags.rsReacted||0)))return false;
var pf=ctx.pair(a,b);
return pf.rsReactAt==null||ctx.stepIndex-pf.rsReactAt>=1;
},
w:function(){return 2;},
run:function(ctx,a,b){
var f=top(a),pf=ctx.pair(a,b);
a.flags.rsReacted=a.flags.rsTormented;pf.rsReactAt=ctx.stepIndex;
REACT_FX[f](ctx,a,b);
return{text:ctx.t(q3(ctx.pick(REACT[f])),a,b),why:a.name+'は、闇に堕ちた自分（'+b.name+'）に責められている'+(f==='AC'||f==='CP'?'。逃げたいのに、責められることをどこかで望んでいる':'')+'：'+FN_L[f],mag:10};
}
});
var NTR_SAFE=L('{a}は{b}の口ぶりをそっくり真似て、{c}の隣に座った。{a}「ねえ、さっきはごめんね｜さっきは、すまなかったな｜さっきは、ごめんなさい」{c}が安心したように笑うのを、本物の{b}は部屋の隅から見ていることしかできなかった。'+
'|{b}が眠っている間に、{a}は{c}に、{b}の秘密を一つずつ囁いた。{b}が{c}にしか話していないはずのことを、{a}は全部知っていた。目を覚ました{b}が見たのは、自分を見る{c}の、知らない人を見るような目だった。'+
'|{a}は{b}の目の前で、{c}の肩にもたれた。{a}「同じ顔なら、どっちでもいいでしょう？｜同じ顔なら、どちらでもいいだろう？｜同じ顔なら、どちらでもいいでしょう？」{c}はうろたえて身を離したが、{b}の胸には、{c}が一瞬ためらったことだけが残った。'+
'|{a}は、{c}の好きな言い回しも、落ち着く仕草も、{b}と同じだけ知っていた。{c}が{a}に向ける眼差しが、少しずつ{b}に向けるそれと見分けがつかなくなっていくのを、{a}は{b}の隣で楽しげに眺めていた。'+
'|{a}「{b}が言えなかったこと、私が代わりに言ってあげる｜{b}が言えなかったことを、私が代わりに言ってやろう｜{b}が言えなかったこと、私が代わりに言ってさしあげます」{a}は{c}の耳元で、{b}が胸にしまっていた想いを、{b}の声で囁いた。{b}は、自分の想いが自分以外の口から届けられるのを、ただ聞いていた。');
var NTR_NO=L('{c}は{a}の手を振り払った。{c}「……違う。あなたは{b}じゃない｜……違う。あなたは{b}ではない｜……違います。あなたは{b}じゃありません」{a}は肩をすくめ、{b}に向かって笑った。{a}「でも、一瞬迷ったよね｜だが、一瞬迷ったな｜でも、一瞬迷いましたよね」'+
'|{c}は寄り添ってきた{a}から身を離した。それでも、{c}がほんの一瞬だけためらったことを、{b}は見逃さなかった。{a}にとっては、それで十分だった。'+
'|{c}「同じ顔でも、私には分かる｜同じ顔でも、私には分かる｜同じお顔でも、私には分かります」{c}にきっぱりと拒まれて、{a}は楽しそうに首をかしげた。{a}は、{c}の言葉を聞いて安堵する{b}の顔を、次はどう崩そうかと眺めていた。');
function ntrTarget(ctx,a,b){return others(ctx,[a,b]).filter(function(c){return loveTie(ctx,b,c)&& !loveTie(ctx,a,c);})[0]||null;}
EV.push({
id:'rs_dk_ntr',label:'闇に堕ちた自分が想い人を奪いに行く',cat:'betray',scope:'pair',pri:true,
when:function(ctx,a,b){
if(darkOf(a,b)!==a|| !free(a)|| !free(b)||ctx.stepIndex<1)return false;
var pf=ctx.pair(a,b);
if((pf.rsNtr||0)>=2||(pf.rsNtrAt!=null&&ctx.stepIndex-pf.rsNtrAt<2))return false;
return!!ntrTarget(ctx,a,b);
},
w:function(ctx,a){return(1+(a.tr.fc||0)*0.5+(a.tr.cold||0)*0.4)*HK.Dark.f(ctx,'cheat');},
run:function(ctx,a,b){
var c=ntrTarget(ctx,a,b);
if(!c)return null;
var pf=ctx.pair(a,b);
pf.rsNtr=(pf.rsNtr||0)+1;pf.rsNtrAt=ctx.stepIndex;
var front=ctx.rng()<0.55,why=a.name+'は闇に堕ちた自分。同一人物の'+b.name+'を苦しめるために、'+b.name+'の恋人の'+c.name+'に迫った（'+(front?b.name+'の目の前で':'隠れて')+'）'+darkWhy(ctx,a);
var hold=R(ctx,c,b).aff/160+(c.tr.cp||0)*0.35+(c.flags&&c.faithful?0.5:0)-(c.tr.fc||0)*0.15;
ctx.mod(b,a,{ten:18,aff: -14,trust: -18});ctx.stress(b,12);
if(ctx.rng()<HK.clamp(hold,0.15,0.85)){
ctx.mod(c,a,{ten:8});ctx.mod(b,c,{trust: -4});
return{text:ctx.t(q3(ctx.pick(NTR_NO)),a,b,c)+(ctx.rng()<0.5?ctx.t(pleas(ctx),a,b):''),why:why+'。'+c.name+'は拒んだ',mag:22,with:[c]};
}
ctx.mod(b,c,{trust: -14,ten:10});ctx.mod(c,a,{att:6});ctx.mod(c,b,{ten:6});
var sx= !HK.SAFE_ON&&S.X&&S.X.ntr&&S.sexOk(ctx,a,c)&&HK.Dark.on(ctx)!=='mild'?S.X.ntr(ctx,a,b,c,front):null;
if(sx){
var pac=ctx.pair(a,c);pac.night=true;pac.nights=(pac.nights||0)+1;
return{text:sx,why:why+'。'+c.name+'は、恋人と同じ顔・同じ声に流された',mag:34,with:[c],sex:true};
}
return{text:ctx.t(q3(ctx.pick(NTR_SAFE)),a,b,c)+(ctx.rng()<0.5?ctx.t(pleas(ctx),a,b):''),why:why+'。'+c.name+'の心が揺れた',mag:24,with:[c]};
}
});
var HOLD={
CP:L('{b}が扉に向かいかけると、{a}がその前に立ちはだかった。{a}「出る資格があると思ってるの？　あなたが外でしてきたこと、全部ここに置いていくつもり？｜出る資格があると思っているのか？　あなたが外でしてきたことを、全部ここに置いていくつもりか？｜出る資格があると思っているんですか？　あなたが外でしてきたこと、全部ここに置いていくおつもりですか？」{b}の足は、その場に縫い止められたように動かなくなった。'+
'|{a}は扉の紙を指でなぞり、{b}を振り返った。{a}「条件を満たせば出られる。でも、まだ終わってない｜条件を満たせば出られる。だが、まだ終わっていない｜条件を満たせば出られます。でも、まだ終わっていません」{b}は扉へ伸ばしかけた腕を、ゆっくりと下ろした。'),
NP:L('{a}は{b}の背中にそっと寄り添い、扉から遠ざけるように肩を抱いた。{a}「外に出ても、また同じことを繰り返すだけ。ここなら、私が見ていてあげる｜外に出ても、また同じことを繰り返すだけだ。ここなら、私が見ていてやる｜外に出ても、また同じことを繰り返すだけです。ここなら、私が見ていてあげます」{b}は、その声のあまりの優しさに、扉へ向かう足を止めてしまった。'+
'|{a}「疲れたでしょう。外はあなたに厳しすぎる。ここで休んでいけばいい｜疲れただろう。外はあなたに厳しすぎる。ここで休んでいけばいい｜疲れたでしょう。外はあなたに厳しすぎます。ここで休んでいけばいいんです」{a}は扉と{b}のあいだに毛布を広げ、そこに{b}を座らせた。'),
A:L('{a}は扉の前で、{b}が外に出た後に起きることを淡々と並べた。{a}「一週間で眠れなくなる。一か月で、また同じ過ちをする。半年後には、ここに戻りたいと思う｜一週間で眠れなくなる。一か月で、また同じ過ちを犯す。半年後には、ここに戻りたいと思うだろう｜一週間で眠れなくなります。一か月で、また同じ過ちをします。半年後には、ここに戻りたいと思うでしょう」{b}は、その予言がどれも外れそうにないことを、自分がいちばんよく知っていた。'+
'|{a}「計算してみた。あなたがこの扉の向こうで幸せになれる確率は、ほとんどゼロ｜計算してみた。あなたがこの扉の向こうで幸せになれる確率は、ほとんどゼロだ｜計算してみました。あなたがこの扉の向こうで幸せになれる確率は、ほとんどゼロです」{b}は扉の前で立ち止まった。数字を疑う理由を、{b}は一つも思いつけなかった。'),
FC:L('{a}は扉の前に寝転がって、手足をばたつかせた。{a}「通せんぼー！　出たかったら、私をどかしてごらん｜通せんぼだ！　出たかったら、私をどかしてみろ｜通せんぼです！　出たかったら、私をどかしてごらんなさい」{b}が近づくたびに、{a}はけらけら笑って足を引っかけた。'+
'|{a}は扉の取っ手に、部屋じゅうの紐を結びつけて遊んでいた。{a}「ほどけたら出してあげる。ほどけたらね｜ほどけたら出してやる。ほどけたらな｜ほどけたら出してあげます。ほどけたら、ですけど」紐は、{b}がほどくそばから結び直されていった。'),
AC:L('{b}が扉に近づいた瞬間、{a}が後ろから袖をつかんだ。{a}「……置いていくの？　また、私だけ置いていくの？｜……置いていくのか？　また、私だけ置いていくのか？｜……置いていくんですか？　また、私だけ置いていくんですか？」{b}は袖を振りほどけなかった。置いていかれる痛みを、{b}は自分のこととして知っていた。'+
'|{a}は扉の前にうずくまって、{b}の足にすがりついた。{a}「あなたが出ていったら、私はここで一人になる。……それでもいいの？｜あなたが出ていけば、私はここで一人になる。……それでもいいのか？｜あなたが出ていったら、私はここで一人になります。……それでもいいんですか？」{b}の足は、扉の一歩手前で止まった。')
};
function fracOf(ctx,b,x){
var p=API.prog(ctx,b,x),rs=ctx.rules||[],s=0,n=0;
rs.forEach(function(r){
var T=API.K[r.k];
if(!T||T.type==='one'||T.type==='kill')return;
var v=0;
if(T.type==='act')v=(p.act[r.k]||0)/r.n;
else if(T.type==='word')v=T.mode==='sum'?((p.said[r.k+b.i]||0)+(p.said[r.k+x.i]||0))/r.n:Math.min(p.said[r.k+b.i]||0,p.said[r.k+x.i]||0)/r.n;
else if(T.type==='consume')v=(ctx.flags.consumed[r.k]||0)/r.n;
s+=Math.min(1,v);n++;
});
return n?s/n:0;
}
function nearExit(ctx,b){
if(ctx.flags.isOne)return ctx.stepIndex>=2?{x:null,f:0}:null;
var best=null;
ctx.present().forEach(function(x){
if(x===b|| !free(x)||API.pairDone(ctx,b,x))return;
var f=fracOf(ctx,b,x),lv=0;
(ctx.rules||[]).forEach(function(r){var T=API.K[r.k];if(T&&T.type==='act'&& !API.ruleDone(ctx,r,b,x))lv=Math.max(lv,T.lvl);});
var will=lv&&API.willing(ctx,b,x,lv);
if((f>=0.5||will)&&(!best||f>best.f))best={x:x,f:f,will:will};
});
return best;
}
function setBack(ctx,b,x){
if(x){
var p=API.prog(ctx,b,x),rs=ctx.rules||[];
for(var i=rs.length-1;i>=0;i--){
var r=rs[i],T=API.K[r.k];
if(!T)continue;
if(T.type==='act'&&(p.act[r.k]||0)>0){p.act[r.k]--;return T.noun+'の数が一つ戻った';}
if(T.type==='word'&&(p.said[r.k+b.i]||0)>0){p.said[r.k+b.i]--;return T.noun+'の数が一つ戻った';}
if(T.type==='consume'&&(ctx.flags.consumed[r.k]||0)>0&&(ctx.flags.consumed[r.k]||0)<r.n){ctx.flags.consumed[r.k]--;return T.item+'が一つ、床にこぼされた';}
}
ctx.mod(b,x,{att: -4});
}
b.flags.partner=null;
ctx.stress(b,-12);
return'決心が鈍った';
}
EV.push({
id:'rs_dk_hold',label:'闇に堕ちた自分が脱出を引き留める',cat:'conflict',scope:'pair',pri:true,
when:function(ctx,a,b){
if(darkOf(a,b)!==a|| !free(a)|| !free(b)||ctx.stepIndex<1)return false;
if((ctx.flags.rsHold=ctx.flags.rsHold||{})[b.i])return false;
return!!nearExit(ctx,b);
},
w:function(){return 2.2;},
run:function(ctx,a,b){
var ne=nearExit(ctx,b);
if(!ne)return null;
ctx.flags.rsHold[b.i]=true;
var f=top(a),what=setBack(ctx,b,ne.x);
ctx.mod(b,a,{ten:6});ctx.stress(b,4);
var x=ne.x&&ne.x!==a?ne.x:null;
return{text:ctx.t(q3(ctx.pick(HOLD[f])),a,b)+'（'+b.name+'の'+what+'）',why:a.name+'は闇に堕ちた自分。出られそうな'+b.name+'を、ここに残るよう引き留めた：'+FN[f]+darkWhy(ctx,a),mag:14,with:x?[x]:null};
}
});
var STAY=L('{a}は{b}の隣に座り、白い壁を見上げた。{a}「ねえ、ここで暮らそう。外には、あなたを傷つけるものしかない｜ここで暮らそう。外には、あなたを傷つけるものしかない｜ここで暮らしましょう。外には、あなたを傷つけるものしかありません」{a}「ここなら、怖いものは何もない。私と、あなただけ｜ここなら、怖いものは何もない。私と、あなただけだ｜ここなら、怖いものは何もありません。私と、あなただけです」'+
'|{a}は{b}の耳元で、外の世界のことを囁いた。冷たい人。終わらない仕事。いつか必ず来る別れ。{a}「そんなところに、どうして戻るの？　私たちは、ここで完結できるのに｜そんなところに、なぜ戻る？　私たちは、ここで完結できるのに｜そんなところに、どうして戻るんですか？　私たちは、ここで完結できるんですよ」'+
'|{a}は{b}の両頬を包んで、額をそっと合わせた。{a}「同じ人が二人いれば、ほかには何もいらないでしょう？　この部屋で、ずっと一緒にいよう｜同じ人が二人いれば、ほかには何もいらないだろう？　この部屋で、ずっと一緒にいよう｜同じ人が二人いれば、ほかには何もいらないでしょう？　この部屋で、ずっと一緒にいましょう」'+
'|{a}「扉なんて開かなくていい。開いたら、私が閉めてあげる｜扉など開かなくていい。開いたら、私が閉めてやる｜扉なんて開かなくていいんです。開いたら、私が閉めてあげます」{a}は、この白い部屋を、二人きりの家だと信じて疑わない目をしていた。'+
'|{a}は床に、見えない家の間取りを指でなぞった。{a}「ここが寝室。ここが台所。外の怖いものは、一つも入ってこない｜ここが寝室だ。ここが台所だ。外の怖いものは、一つも入ってこない｜ここが寝室です。ここが台所です。外の怖いものは、一つも入ってきません」{b}は、その声が、自分がいちばん弱っていた頃の声と同じだと気づいた。');
var STAY_RE={
accept:L('{b}は、うなずきかけた。外の冷たさを、{b}も知っていた。{b}「……それも、いいのかもしれない｜……それも、いいのかもしれない｜……それも、いいのかもしれません」――言ってから、{b}は自分の声の弱さにぞっとした。'+
'|{b}は{a}の腕を振りほどけなかった。ここにいれば、もう責められることもない。その甘さに、{b}は危うく身を委ねかけた。'),
refuse:L('{b}「断る。ここは家じゃない。檻だ｜断る。ここは家ではない。檻だ｜お断りします。ここは家ではありません。檻です」{b}はきっぱりと言い、{a}から目を逸らさなかった。'+
'|{b}は{a}の腕を払いのけた。{b}「外が怖いから閉じこもるなんて、私はしない｜外が怖いから閉じこもるなど、私はしない｜外が怖いから閉じこもるなんて、私はしません」'),
laugh:L('{b}は吹き出した。{b}「白い壁しかない家？　インテリアのセンス、最悪だね｜白い壁しかない家か？　インテリアの趣味は最悪だな｜白い壁しかない家ですか？　インテリアのセンス、最悪ですね」――笑い飛ばしながら、{b}の指先は少しだけ震えていた。'+
'|{b}「冗談。冷蔵庫もない家なんて、三日で飽きる｜冗談だろう。冷蔵庫もない家など、三日で飽きる｜ご冗談を。冷蔵庫もない家なんて、三日で飽きます」{b}はわざと大きく伸びをして、{a}の誘いを空気ごと払った。'),
flee:L('{b}は黙って立ち上がり、部屋のいちばん遠い隅へ移った。{a}の声が届かない場所は、この部屋のどこにもなかったけれど、それでも距離を取らずにはいられなかった。'+
'|{b}「……少し、一人で考えさせて｜……少し、一人で考えさせてくれ｜……少し、一人で考えさせてください」{b}はそう言って、{a}から逃げるように背を向けた。')
};
var STAY_OF={AC:'accept',NP:'accept',CP:'refuse',FC:'laugh',A:'flee'},STAY_LAB={accept:'受け入れかける',refuse:'拒む',laugh:'笑い飛ばす',flee:'逃げる'};
function darkObs(ctx,a,b){
if(obs(ctx,a,b))return true;
return ctx.chars.some(function(o){return o!==a&&yan(ctx,a,o);});
}
EV.push({
id:'rs_dk_stay',label:'闇に堕ちた自分が部屋に残ろうと迫る',cat:'conflict',scope:'pair',pri:true,
when:function(ctx,a,b){
if(darkOf(a,b)!==a|| !free(a)|| !free(b)||ctx.stepIndex<1)return false;
var pf=ctx.pair(a,b);
if((pf.rsStay||0)>=2||(pf.rsStayAt!=null&&ctx.stepIndex-pf.rsStayAt<3))return false;
return darkObs(ctx,a,b);
},
w:function(ctx,a){return 1+(a.tr.jealous||0)*0.8;},
run:function(ctx,a,b){
var pf=ctx.pair(a,b),k=STAY_OF[top(b)]||'flee';
pf.rsStay=(pf.rsStay||0)+1;pf.rsStayAt=ctx.stepIndex;
if(k==='accept'){ctx.mod(b,a,{aff:4,ten: -2});ctx.stress(b,-4);}
else if(k==='refuse')ctx.mod(b,a,{ten:8,aff: -4});
else ctx.mod(b,a,{ten:4});
return{text:ctx.t(q3(ctx.pick(STAY))+q3(ctx.pick(STAY_RE[k])),a,b),why:a.name+'は闇に堕ちた自分で、執着が強い。外を怖いものとして語り、この部屋で二人で完結しようと迫った。'+b.name+'は'+STAY_LAB[k]+'（'+top(b)+'）'+darkWhy(ctx,a),mag:14};
}
});
var DLW={
any:L('「ほら、やっぱりあなたはそういう人なんだ……。すぐ手が出て、何度も大切な物を壊してきたよね？　あなたのこれからの人生が楽しみだね｜ほら、やはりあなたはそういう人だ……。すぐ手が出て、何度も大切な物を壊してきただろう？　あなたのこれからの人生が楽しみだ｜ほら、やっぱりあなたはそういう人なんです……。すぐ手が出て、何度も大切な物を壊してきましたよね？　あなたのこれからの人生が楽しみですね」'+
'|「……自分を殺すなんて、ね。これから毎朝、その顔を鏡で見るんだ。楽しみだね｜……自分を殺すとはな。これから毎朝、その顔を鏡で見るわけだ。楽しみだな｜……自分を殺すなんて、ね。これから毎朝、その顔を鏡で見るんですね。楽しみですね」'),
CP:L('「……ほら、やっぱり。正しいって顔で、人を壊すんだ……。次は誰の番かな。楽しみにしてる｜……ほら、やはりな。正しいという顔で、人を壊す……。次は誰の番だろうな。楽しみにしている｜……ほら、やっぱり。正しいという顔で、人を壊すんですね……。次は誰の番でしょう。楽しみにしています」'+
'|「……自分を殺すなんて、ね。それも、あなたの言う正しいこと？｜……自分を殺すとはな。それも、あなたの言う正しいことか？｜……自分を殺すなんて、ね。それも、あなたの言う正しいことですか？」'),
NP:L('「痛いな。……覚えておいて、その手｜痛いな。……覚えておけ、その手｜痛いですね。……覚えておいてください、その手」'+
'|「……優しいね。最後まで、そうやって世話を焼くんだ。自分の始末まで｜……優しいな。最後まで、そうやって世話を焼くのか。自分の始末までな｜……お優しいですね。最後まで、そうやって世話を焼くんですね。自分の始末まで」'),
A:L('「……自分を殺すのも、計算のうち？　へえ｜……自分を殺すのも、計算のうちか？　ほう｜……自分を殺すのも、計算のうちですか？　へえ」'+
'|「冷静だね……。自分を殺すときまで、そんな顔ができるんだ｜冷静だな……。自分を殺すときまで、そんな顔ができるとはな｜冷静ですね……。自分を殺すときまで、そんな顔ができるんですね」'),
FC:L('「へえ。自分の顔、殴れるんだ……｜ほう。自分の顔を、殴れるのか……｜へえ。自分の顔、殴れるんですね……」'+
'|「あは……やっちゃったね。……ねえ、楽しかった？｜あは……やってしまったな。……楽しかったか？｜あは……やってしまいましたね。……ねえ、楽しかったですか？」'),
AC:L('「……できたじゃない。いつも人の顔色ばかり窺ってたあなたが、自分の手で。……これからが、楽しみ｜……できたではないか。いつも人の顔色ばかり窺っていたあなたが、自分の手で。……これからが、楽しみだ｜……できたじゃありませんか。いつも人の顔色ばかり窺っていたあなたが、ご自分の手で。……これからが、楽しみです」'+
'|「泣かないで。……あなたが選んだんでしょう｜泣くな。……あなたが選んだのだろう｜泣かないでください。……あなたが選んだんでしょう」')
};
S.DLW=DLW;
var AFTERK={
self:L('{a}の耳には、{c}の最期の言葉が、まだ残っていた。その声は、自分の声とまったく同じだった。{a}は、あれが呪いなのか予言なのか分からないまま、膝を抱えた。'+
'|{a}は自分の両手を見下ろした。殺したのは、闇に堕ちた自分だった。それでも{a}は、それを「自分ではないもの」と呼べなかった。{a}「……これも、私の罪だ｜……これも、私の罪だ｜……これも、私の罪です」'+
'|{a}は、{c}が倒れていた場所から目を逸らせなかった。{c}の言ったことは、何ひとつ間違っていなかった。{a}は、その言葉を背負っていくしかないのだと思った。'),
plain:L('{a}は、{c}の最後の顔を思い出して、顔をしかめた。嫌な顔だった。'+
'|{a}は、自分を殺した手を見下ろした。それから、黙ってその手を握り込んだ。'+
'|{a}は何も言わずに、{c}が倒れていた場所に背を向けた。'+
'|{a}「……最後まで、嫌なやつ｜……最後まで、嫌なやつだ｜……最後まで、嫌な人でした」{a}はそれだけ言って、壁にもたれた。')
};
function selfBlame(c){return!!c&&(top(c)==='AC'||c.persona==='devoted'||c.persona==='shy');}
if(HK.Ctx&&HK.Ctx.prototype.kill&& !HK.Ctx.prototype.kill._rs)HK.wrap(HK.Ctx.prototype,'kill',function(kill0){
var f=function(v,killer,how){
var was= !!(v&&v.alive);
var r=kill0.apply(this,arguments);
if(was&&v.alive===false&&killer&&killer!==v&&this.scen&&this.scen.id==='whiteroom'&&dark(v)){
try{darkLast(this,v,killer);}catch(e){}
}
return r;
};
f._rs=true;
return f;
});
function darkLast(ctx,v,killer){
if(HK.Special&&HK.Special.canRevive&&HK.Special.canRevive(v))return;
var f=top(killer),pool=ctx.rng()<0.3?DLW.any:DLW[f]||DLW.any;
var q=q3(ctx.pick(pool));
var one=HK.Tone&&HK.Tone.pick?(HK.Tone.pick(q,v,false)||{}).q||q.split('｜')[0]:q.split('｜')[0];
v.lastWords=v.name+'「'+one+'」';v.lastTo=killer.i;v.lastKind='kill';v.rsDarkLast=true;
var pd=ctx.pending&&ctx.pending[ctx.pending.length-1];
if(pd&&pd.kind==='death'&&pd.actors&&pd.actors[0]===v){
pd.text+='　――'+v.name+'が最期に遺した言葉：'+v.name+'「'+q+'」';
v.lastLogged=true;
}
if(same(v,killer)&&ctx.pending){
ctx.stress(killer,10);
var sb=selfBlame(killer);
ctx.pending.push({kind:'event',cat:'solo',actors:[killer],text:ctx.t(q3(ctx.pick(sb?AFTERK.self:AFTERK.plain)),killer,null,v),why:killer.name+'は、闇に堕ちた自分（'+v.name+'）を手にかけた。最期の言葉が残り、'+(sb?'それを自分の罪として背負う（自罰的な性格）':'後味の悪さだけが残った'),mag:12});
}
}
if(HK.LABELS){
if(!HK.LABELS.darkself)HK.LABELS.darkself={name:'闇に堕ちた自分',cls:'enemy',pol: -2};
if(!HK.LABELS.darkkill)HK.LABELS.darkkill={name:'闇に堕ちた自分（決着）',cls:'kill',pol: -2};
}
var cf0=scen.classifyFirst;
scen.classifyFirst=function(ctx,A0,B0,pf){
var d=darkOf(A0,B0);
if(d)return{id:pf.kill?'darkkill':'darkself',dir:d.i,by:pf.kill?pf.kill.by:null};
return cf0?cf0.apply(this,arguments):null;
};
var DTEXT=L('{L}は最後まで、闇に堕ちた自分の言葉から逃げられなかった。{D}は、もう一人の自分が苦しむさまを、最後まで楽しんでいた。'+
'|同じ顔をした二人のうち、一人は光の側に、一人は闇の底にいた。{D}は{L}を苛み続け、{L}は最後まで、その声から離れられなかった。'+
'|愛憎よりも深く、悪意よりも近い。{D}にとって{L}は、壊しても壊しても飽きない、たった一人の自分だった。');
var pt0=scen.pairText;
scen.pairText=function(ctx,A0,B0,cl){
if(cl&&(cl.id==='darkself'||cl.id==='darkkill')){
var D=ctx.chars[cl.dir],Lt=D===A0?B0:A0,v={D:D.name,L:Lt.name};
if(cl.id==='darkkill')return fill(cl.by===D.i?'{D}は、もう一人の自分の命を奪った。闇に堕ちた自分は、最後まで光の側の自分を許さなかった。':'{L}は、闇に堕ちた自分を手にかけた。{D}が遺した言葉は、{L}の中でいつまでも響き続けた。',v);
return fill(DTEXT[(A0.i*7+B0.i*3+(ctx.seed||0))%DTEXT.length],v);
}
return pt0?pt0.apply(this,arguments):null;
};
})();
});
;
/* ==== js/room-games.js ==== */
HK.Load.def(82,'js/room-games.js',function(){
(function(){
'use strict';
var HK=window.HK,A=HK.RoomAPI;
if(!A|| !A.addKind)return;
var K=A.K,EV=A.EV,scen=A.scen;
function R(ctx,a,b){return ctx.R(a,b);}
function nm(list){return list.map(function(c){return c.name;}).join('・');}
function ruleK(ctx,k){return ctx.rules.filter(function(r){return r.k===k;})[0];}
function free(c){return!!c&&c.alive!==false&& !c.out&& !(c.flags&&(c.flags.down||c.flags.knocked))&&c.flags.cagePair==null;}
function fillN(s,n){return String(s).replace(/\{N\}/g,String(n));}
function pickNew(ctx,pool){
var L=ctx.flags.gLast=ctx.flags.gLast||{},key=pool[0],c=pool.length>1?pool.filter(function(s){return s!==L[key];}):pool;
var s=ctx.pick(c.length?c:pool);
L[key]=s;
return s;
}
function topKey(c){
var t=c.tr,best='np',bv= -1;
[['np',t.np],['fc',t.fc],['cold',t.cold||0],['ac',t.ac],['cp',t.cp]].forEach(function(x){if(x[1]>bv){bv=x[1];best=x[0];}});
return best;
}
var softNow=false;
function trioSoft(){return HK.SAFE_ON||softNow;}
A.addKind('nyan',{type:'task',noun:'「にゃん」',unit:'回',goal:'「にゃん」と言う',
fin:function(n){return'語尾に「にゃん」を付けて'+n+'回しゃべらないと';},mid:function(n){return'語尾に「にゃん」を付けて'+n+'回しゃべって';},
nounN:function(n){return'「にゃん」'+n+'回';},left:function(x){return'「にゃん」があと'+x+'回';},last:function(){return'最後の「にゃん」が部屋に響いた';}},'「〜にゃん」と言う（部屋の全員で合計）');
A.addKind('roulette',{type:'task',noun:'ロシアンルーレット',unit:'回',goal:'ロシアンルーレット',
fin:function(n){return'ロシアンルーレットを'+(n>1?n+'回':'')+'しないと';},mid:function(n){return'ロシアンルーレットを'+(n>1?n+'回':'')+'して';},
nounN:function(n){return'ロシアンルーレット'+(n>1?n+'回':'');},left:function(x){return'ロシアンルーレットがあと'+x+'回';},last:function(){return'最後の空砲が鳴った';}},'ロシアンルーレット（空砲。負けた人は罰ゲーム）');
A.addKind('tickle',{type:'task',noun:'くすぐり',unit:'秒',mul:10,goal:'くすぐられる',
fin:function(n){return'合計'+n+'秒くすぐられないと';},mid:function(n){return'合計'+n+'秒くすぐられて';},
nounN:function(n){return'くすぐり合計'+n+'秒';},left:function(x){return'くすぐりがあと'+x+'秒';},last:function(){return'タイマーが最後の一秒を刻んだ';}},'くすぐられる（部屋の全員で合計の秒数。数字×10秒）');
A.addKind('balloon',{type:'task',noun:'風船',unit:'個',goal:'風船を割る',
fin:function(n){return'風船を'+n+'個割らないと';},mid:function(n){return'風船を'+n+'個割って';},
nounN:function(n){return'風船'+n+'個';},left:function(x){return'風船があと'+x+'個';},last:function(){return'最後の風船が割れた';}},'風船を割る');
A.addKind('hurt',{type:'hurt',noun:'傷つけること',unit:'回',goal:'相手を傷つける',
fin:function(n){return'相手を'+(n>1?n+'回':'')+'傷つけないと';},mid:function(n){return'相手を'+(n>1?n+'回':'')+'傷つけて';},
nounN:function(n){return'相手を傷つけること'+(n>1?n+'回':'');},
leftP:function(x,n){return n>1?'どちらかが傷つくことがあと'+x+'回':'どちらかが傷つくこと';}},'相手を傷つける（平手・つねる・言葉。どちらかが傷つけば満たす）');
var TRIO_LABEL='三人で抱き合う（三人以上のとき）';
A.addKind('trio3',{type:'trio',noun:'三人で',unit:'回',goal:'三人で',
fin:function(n){return'三人で'+(n>1?n+'回':'')+(trioSoft()?'抱き合わないと':'仲良くしないと');},
mid:function(n){return'三人で'+(n>1?n+'回':'')+(trioSoft()?'抱き合って':'仲良くして');},
nounN:function(n){return'三人での'+(trioSoft()?'ハグ':'仲良し')+(n>1?n+'回':'');},
leftP:function(x,n){return'三人で'+(trioSoft()?'抱き合うこと':'仲良くすること')+(n>1?'があと'+x+'回':'');}},TRIO_LABEL);
A.noteN('くすぐりは「1」で10秒として数える');
var INTRO={
nyan:['扉の脇の壁には、数字のカウンターが埋め込まれていた。語尾に「にゃん」を付けてしゃべった回数を数えるらしい。表示は0/{N}。','扉の紙の横に、猫耳のカチューシャが人数分ぶら下がっていた。壁のカウンターには「0/{N}」と出ている。','扉の紙の下に、小さな字で注意書きがあった。誰が言っても、部屋の全員の合計で数えるという。壁のカウンターは0を示していた。'],
roulette:['テーブルの上に、古びたリボルバーが一丁置かれていた。添えられたメモには、弾は空砲が一発、音が鳴った人の負け、負けた人は罰ゲーム、とある。','テーブルのリボルバーの横に、メモが一枚。空砲が一発だけ入っていること、そして罰ゲームは「扉の条件をもう一回」であることが書かれていた。','部屋の真ん中の小さなテーブルに、リボルバーが置かれていた。弾倉には、空砲が一発だけ。その重さに、誰もすぐには手を伸ばさなかった。'],
tickle:['壁の高いところに、大きなタイマーが掛かっていた。誰かがくすぐられているあいだだけ進むらしい。表示は0/{N}秒。','部屋の隅に、羽根ぼうきが一本立てかけてあった。壁のタイマーは0/{N}秒を示している。','扉の紙の下に、小さな字で注意書きがあった。誰がくすぐられても、合計の秒数で数えるという。壁のタイマーは止まったままだ。'],
balloon:['床一面に、色とりどりの風船が転がっていた。数えると、ちょうど{N}個。','天井から、たくさんの風船がぶら下がっていた。紐の先には、一つずつ番号札がついている。全部で{N}個。','部屋の半分が、膨らんだ風船で埋まっていた。歩くたびに、足元で風船がきゅっと鳴った。'],
hurt:['扉の紙の下には、赤い字で注意書きがあった。傷つけ方は問わない、と。誰も、すぐには口を開かなかった。','扉の紙を読んだ全員の顔がこわばった。殴る必要はない。けれど、何もしないわけにはいかない。','扉の紙の条件の横に、小さな救急箱が置かれていた。それが、かえって気味が悪かった。'],
trio3:['扉の紙の条件の横には、三つの丸を線でつないだ絵が描かれていた。','扉の紙には、三人が抱き合う簡単な絵が添えられていた。','扉の紙の「三人で」の字だけが、やけに大きく書かれていた。']
};
var INTRO_H=null,LEAD_H=null;
var TASK={};
function by(ctx,k,c,n){var B=ctx.flags.taskBy=ctx.flags.taskBy||{};var m=B[k]=B[k]||{};m[c.i]=(m[c.i]||0)+n;}
function scaleOf(ctx,r,span){return Math.max(1,Math.round(r.n/Math.max(4,ctx.stepsTotal*(span||0.7))));}
function taskDone(ctx,r,e){
ctx.say(e);
if(!A.hasPairRule(ctx)){A.checkExit(ctx);return;}
if(A.globDone&& !ctx.rules.every(function(q){return!A.isGlob(K[q.k])||A.globDone(ctx,q);}))return;
ctx.say({text:A.lastOf(r)+'。だが扉はまだ開かない。紙の残りの一文が、まだ残っている。'});
ctx.present().forEach(function(x){
ctx.present().forEach(function(y){
if(x.i<y.i&& !x.out&& !y.out&& !ctx.flags.oneOut&&A.pairDone(ctx,x,y)){
var ex=A.exitPair(ctx,x,y,x.name+'と'+y.name+'は、もう一つの条件をすでに満たしていた。','条件がすべて揃った',false);
ctx.say({kind:'event',cat:'escape',actors:[x,y],text:ex.text,why:ex.why,mag:30});
}
});
});
}
function taskRule(ctx,a){
return ctx.rules.filter(function(r){return K[r.k].type==='task'&&TASK[r.k]&&A.globLeft(ctx,r)>0&&(!TASK[r.k].when||TASK[r.k].when(ctx,a,r));})[0];
}
EV.push({
id:'room_task',label:'扉の条件の恥ずかしい課題をこなす',cat:'escape',scope:'solo',pri:true,
when:function(ctx,a){return free(a)&& !!taskRule(ctx,a);},
w:function(ctx,a){
var r=taskRule(ctx,a),H=TASK[r.k],tf=ctx.stepIndex/Math.max(4,ctx.stepsTotal),df=1-A.globLeft(ctx,r)/r.n;
var gate=ctx.env.order==='seq'&&ctx.rules.length===2&&ctx.rules[0]===r?2.5:1;
return(1.8+(H.fit?H.fit(a):0.5)*1.4+a.stress/120+tf*1.6)*(1+3*Math.max(0,tf-df))*gate;
},
run:function(ctx,a){
var r=taskRule(ctx,a),H=TASK[r.k],T=K[r.k],left=A.globLeft(ctx,r);
var first= !(ctx.flags.taskFirst=ctx.flags.taskFirst||{})[r.k];
ctx.flags.taskFirst[r.k]=1;
var res=H.run(ctx,a,r,first,left);
if(!res)return null;
var inc=Math.max(0,Math.min(left,res.inc||0));
ctx.flags.consumed[r.k]=(ctx.flags.consumed[r.k]||0)+inc;
if(inc)by(ctx,r.k,res.who||a,inc);
var total=r.n-A.globLeft(ctx,r);
var text=res.text+(inc?'（'+T.noun+' '+total+'/'+r.n+T.unit+'）':'');
if(res.after)text+=res.after();
var actors=[a].concat((res.with||[]).filter(function(c){return c!==a;}));
if(total>=r.n){
text+=ctx.t(fillN(ctx.pick(H.done),r.n),res.doneA||a,res.doneB||(res.with&&res.with[0])||null);
taskDone(ctx,r,{kind:'event',cat:'escape',actors:actors,text:text,why:res.why,mag:12,sex: !!res.sex,lewd:res.lewd});
return null;
}
return{cat:res.cat,text:text,why:res.why,with:res.with,mag:res.mag||6,sex:res.sex,lewd:res.lewd};
}
});
var NYAN={
first:['{a}は扉の紙を三回読み直してから、観念したように口を開いた。{a}「……よろしくにゃん｜……よろしく頼むにゃん｜……よろしくお願いしますにゃん」言い終えた途端、{a}の耳が真っ赤になった。','{a}は咳払いを一つして、壁のカウンターをにらんだ。{a}「数えるなら、ちゃんと数えてにゃん｜数えるなら、ちゃんと数えろにゃん｜数えるなら、ちゃんと数えてくださいにゃん」カウンターの数字が、ぴこんと増えた。','{a}は誰とも目を合わせないまま、小さな声で言った。{a}「……にゃん｜＝｜……にゃん、です」それでも、壁のカウンターは律儀に数を進めた。'],
fc:['{a}は両手を猫の手にして、くるりと回ってみせた。{a}「お腹すいたにゃん｜腹が減ったにゃん｜お腹が空きましたにゃん」部屋の空気が、少しだけゆるんだ。','{a}は面白がって、一言ごとに語尾を付けた。{a}「この部屋、意外と快適にゃん。ベッドもふかふかにゃん｜この部屋は意外と快適にゃん。ベッドもふかふかにゃん｜この部屋、意外と快適ですにゃん。ベッドもふかふかですにゃん」カウンターの数字が、まとめて進んだ。','{a}は{b}の肩をつついた。{a}「一緒に言おうにゃん｜一緒に言うにゃん｜一緒に言いましょうにゃん」{a}だけが、やけに楽しそうだった。'],
cold:['{a}は表情ひとつ変えずに言った。{a}「了解にゃん。続けるにゃん｜＝｜了解ですにゃん。続けますにゃん」淡々とした声が、かえって部屋の笑いを誘った。','{a}は壁のカウンターを見上げ、残りの回数を確かめた。{a}「効率よく済ませるにゃん｜＝｜効率よく済ませましょうにゃん」誰も笑ってはいけない気がした。','{a}は腕を組んだまま、事務連絡のように言った。{a}「水を飲むにゃん。寝るにゃん。以上にゃん｜＝｜水を飲みますにゃん。寝ますにゃん。以上ですにゃん」カウンターが、まとめて進んだ。'],
ac:['{a}は膝を抱えて、蚊の鳴くような声で言った。{a}「……喉、かわいたにゃん｜……喉が、渇いたにゃん｜……喉が、渇きましたにゃん」顔を上げられないまま、{a}はさらに小さく丸まった。','{a}は何度も口を開きかけてはやめ、ようやく言った。{a}「わ、私も、言うにゃん｜＝｜わ、私も、言いますにゃん」声が裏返った。','{a}は手で顔を隠したまま言った。{a}「見ないでにゃん｜見るなにゃん｜見ないでくださいにゃん」隠しきれない耳が、真っ赤だった。'],
cp:['{a}は紙をにらみつけたまま、吐き捨てるように言った。{a}「ふざけてるにゃん｜ふざけているにゃん｜ふざけていますにゃん」怒っているのに語尾だけ守るので、誰かが吹き出した。','{a}は眉間に皺を寄せた。{a}「こんな条件を考えた人に、文句を言いたいにゃん｜＝｜こんな条件を考えた人に、文句を言いたいですにゃん」語尾のせいで、少しも迫力がなかった。','{a}は腕を組んで壁にもたれた。{a}「私は言わない。……言わないにゃん｜＝｜私は言いません。……言いませんにゃん」言ってしまったことに気づいて、{a}は天井を仰いだ。'],
np:['{a}は固まっている皆を見回して、先に手を挙げた。{a}「私が多めに言うにゃん。だから、気にしないでにゃん｜私が多めに言うにゃん。だから、気にするなにゃん｜私が多めに言いますにゃん。だから、気にしないでくださいにゃん」','{a}は{b}の顔をのぞきこんだ。{a}「大丈夫、怖くないにゃん｜大丈夫だ、怖くないにゃん｜大丈夫です、怖くないですにゃん」{b}の肩から、少し力が抜けた。','{a}は照れ笑いしながら、次々に言葉を継いだ。{a}「おはようにゃん。おやすみにゃん。ありがとうにゃん｜＝｜おはようございますにゃん。おやすみなさいにゃん。ありがとうございますにゃん」'],
more:['それからしばらく、{a}は語尾に「にゃん」を付けたまま、しゃべり続けた。','一度言ってしまうと、{a}の口からは「にゃん」が次々に出てきた。','{a}はそのまま、壁のカウンターが進むのを見ながら、何度か「にゃん」を繰り返した。'],
react:['{b}は口元を押さえて、肩を震わせていた。','{b}「……今の、もう一回｜……今のを、もう一回だ｜……今のを、もう一回お願いします」{b}は真顔で言った。','{b}は聞こえなかったふりをして、壁の継ぎ目を数え続けた。耳だけが、こちらを向いていた。','{b}も観念したように、小さく「にゃん」と付け足した。'],
done:['{a}の一言で、壁のカウンターがちょうど{N}になった。部屋に、妙な達成感と気まずさが同時に広がった。','カウンターの数字が{N}でぴたりと止まった。{a}は両手で顔を覆った。{a}「……もう一生言わない｜＝｜……もう一生言いません」','最後の「にゃん」を言い終えた{a}は、深いため息をついた。誰も、今の数時間のことを口にしようとはしなかった。']
};
TASK.nyan={
fit:function(c){return c.tr.fc*0.6+c.tr.np*0.3-c.tr.cp*0.2;},
done:NYAN.done,
run:function(ctx,a,r,first){
var b=ctx.pick(ctx.others(a).filter(free))||null;
var tk=topKey(a),pool=first?NYAN.first:NYAN[tk]||NYAN.np;
if(!b)pool=pool.filter(function(s){return s.indexOf('{b}')<0;});
if(!pool.length)pool=NYAN.first;
var inc=(tk==='fc'||tk==='np'?1+ctx.rng.int(3):1+ctx.rng.int(2))*scaleOf(ctx,r);
var text=ctx.t(pickNew(ctx,pool),a,b);
if(b&&ctx.rng()<0.6){text+=ctx.t(pickNew(ctx,NYAN.react),a,b);ctx.mod(b,a,{aff:2});}
if(inc>(text.match(/にゃん/g)||[]).length+1)text+=pickNew(ctx,NYAN.more).replace(/\{a\}/g,a.name);
if(tk==='cp'||tk==='ac')ctx.stress(a,4);else ctx.stress(a,-3);
return{text:text,inc:inc,with:b?[b]:null,cat:'bond',why:a.name+'の'+{fc:'奔放さ（面白がる）',cold:'ドライさ（淡々とこなす）',ac:'照れ（顔が上げられない）',cp:'厳しさ（腹を立てながら）',np:'優しさ（皆の分まで）'}[tk]+'。お題：語尾に「にゃん」'};
}
};
var RR={
start:['{a}は銃を手に取り、弾倉を回した。','{a}が弾倉を指で弾くと、からからと乾いた音がした。','{a}はリボルバーを持ち上げ、皆の顔を順に見た。{a}「回す｜回すぞ｜回します」'],
lose:['{a}は肩を跳ねさせ、それから自分が無事なことを確かめるように胸を押さえた。','{a}「……分かっていても、怖い｜……分かっていても、怖いな｜……分かっていても、怖いです」{a}は銃をそっとテーブルに戻した。','{a}はしばらく天井を見上げたまま動かなかった。耳の奥で、まだ音が鳴っていた。'],
pen:['罰ゲームは、扉の紙の条件をもう一回。{a}は覚悟を決めて、{b}の方を向いた。','メモの裏には、罰ゲームは条件の行為をもう一回、とあった。{a}は{b}に目で尋ね、{b}は小さく頷いた。','{b}「罰ゲームだよ｜罰ゲームだ｜罰ゲームですよ」{b}にそう言われて、{a}は観念した。'],
light:['罰ゲームとして、{a}は皆の前で変顔を十秒続けた。誰も笑わないので、余計に恥ずかしかった。','罰ゲームは、恥ずかしい昔話を一つ。{a}は渋々、学生のころの失敗談を話した。思ったより受けた。','罰ゲームとして、{a}は部屋の真ん中で一曲歌わされた。拍手は、まばらだった。','罰ゲームは、皆の肩を順番に揉むことだった。{a}「……どこが凝ってる？｜……どこが凝っている？｜……どこが凝っていますか？」'],
done:['最後の空砲が鳴ると、リボルバーのメモの文字が「おつかれさま」に変わった。','{N}回目の空砲の音が、白い壁に吸い込まれていった。もう、引き金を引かなくていい。','最後の音が鳴り終わると、{a}はリボルバーをそっとテーブルに置いた。手のひらが汗で湿っていた。']
};
RR.first=['誰も動かないので、{a}が最初にリボルバーを手に取った。思ったより重かった。','{a}は深呼吸を一つして、テーブルのリボルバーに手を伸ばした。{a}「空砲なら、怖くない｜空砲なら、怖くはない｜空砲なら、怖くありません」声が少し震えていた。','{a}がメモをもう一度読み上げ、それから銃を取った。誰も、止めなかった。'];
function actOk(ctx,r,x,y){
var lv=K[r.k].lvl;
if(A.ruleDone(ctx,r,x,y)||(A.seqWait&&A.seqWait(ctx,r,x,y)))return false;
if(lv>=5&&(!A.okSex(x,y)||(HK.RoomReluct&&HK.RoomReluct.blocks(ctx,x,y))))return false;
if(lv>=3&&(!HK.canLove(x,y)|| !HK.canLove(y,x)||A.exclOther(ctx,x,y)||A.exclOther(ctx,y,x)||A.tieWall(ctx,x,y,lv)>=999))return false;
if(lv>=2&&HK.ngPair(x,y))return false;
return A.willing(ctx,x,y,lv)||A.desperate(ctx,x,y,lv)||(lv<=2&&R(ctx,x,y).ten<50&&R(ctx,y,x).ten<50);
}
function penAct(ctx,x){
var out=null;
ctx.rules.forEach(function(r){
if(out||K[r.k].type!=='act')return;
var cands=ctx.present().filter(function(y){return y!==x&&free(y)&&actOk(ctx,r,x,y);});
if(!cands.length)return;
var y=cands.filter(function(c){return c.i===x.flags.partner;})[0]||ctx.most(cands,function(c){return R(ctx,x,c).att+R(ctx,c,x).att;});
out={r:r,b:y};
});
return out;
}
TASK.roulette={
fit:function(c){return c.tr.fc*0.4+(c.tr.cold||0)*0.3+c.tr.cp*0.2;},
done:RR.done,
run:function(ctx,a,r,first){
var P=ctx.present().filter(free);
if(P.indexOf(a)<0)P.unshift(a);
var s=P.indexOf(a),k=ctx.rng.int(6),loser=P[(s+k)%P.length];
var text=first?ctx.t(pickNew(ctx,RR.first),a):'';
text+=ctx.t(pickNew(ctx,RR.start),a);
var clicks=[];
for(var j=0;j<k;j++)clicks.push(P[(s+j)%P.length].name+'の番。カチリ。');
text+=(clicks.length>3?clicks.slice(0,2).join('')+'……カチリ、カチリ。':clicks.join(''))+loser.name+'の番。パン、と乾いた音が響いた。'+ctx.t(pickNew(ctx,RR.lose),loser);
ctx.stress(loser,8);
(ctx.flags.rrLose=ctx.flags.rrLose||{})[loser.i]=(ctx.flags.rrLose[loser.i]||0)+1;
var why='空砲が'+loser.name+'の番で鳴った（運）。罰ゲーム';
var res={text:text,inc:1,who:a,with:loser!==a?[loser]:[],cat:'escape',why:why};
var pa=penAct(ctx,loser);
res.after=function(){
if(!pa){ctx.stress(loser,4);res.why+='：条件の行為を一緒にできる相手がいないので、軽い罰ゲーム';return ctx.t(pickNew(ctx,RR.light),loser);}
var x=loser,y=pa.b,rk=pa.r.k,wl=A.willing(ctx,x,y,K[rk].lvl);
if(res.with.indexOf(y)<0)res.with.push(y);
A.bumpAct(ctx,pa.r,x,y,1);
var t=ctx.t(pickNew(ctx,RR.pen),x,y),LW=HK.RoomLewd;
if(rk==='h'){
t+=LW&&LW.scene?LW.scene(ctx,x,y,wl?'will':'des'):ctx.t('{a}と{b}は、罰ゲームの分だけ、もう一度身を寄せ合った。――',x,y);
ctx.pair(x,y).night=true;res.sex=true;res.lewd=true;
}else t+=ctx.t(pickNew(ctx,A.ACT_TEXT[rk][wl?'will':'des']),x,y);
ctx.mod2(x,y,{att:3,trust:2},{att:3,trust:2});
t+=A.cntTag(ctx,pa.r,x,y,A.prog(ctx,x,y).act[rk]);
res.cat='romance';
res.why+='：扉の条件（'+A.KLABEL[rk]+'）をもう一回。相手は'+y.name+'（'+(wl?'互いの惹かれと信頼':'焦りと諦め')+'）';
if(A.pairDone(ctx,x,y)){
var ex=A.exitPair(ctx,x,y,'',res.why,rk==='h');
t+=ex.text;res.why=ex.why;
}
return t;
};
return res;
}
};
var TK={
first:['{a}は壁のタイマーを見上げてから、{b}に向き直った。{a}「……覚悟して｜……覚悟しろ｜……覚悟してください」{b}が身構えるより早く、{a}の指が脇腹に届いた。','{a}は両手の指をわきわきと動かしながら、{b}に近づいた。{b}「待って、心の準備が｜待て、心の準備が｜待ってください、心の準備が」――待たなかった。','{a}は{b}に、どこが弱いのかと真面目な顔で訊いた。{b}が答えるより先に、{b}の脇腹が答えを出した。'],
warm:['{a}は{b}の脇腹をくすぐった。{b}「あははっ、待って、待って｜ははっ、待て、待てって｜あははっ、待ってください、待って」{b}は笑いすぎて、床を転げ回った。','{a}の指が{b}の首筋をなぞると、{b}は笑い声を上げて身をよじった。タイマーの数字が、どんどん進んでいく。','{b}は笑い涙を拭いながら、それでも逃げなかった。{b}「あと何秒？｜あと何秒だ？｜あと何秒ですか？」{a}「内緒｜内緒だ｜内緒です」'],
awk:['{a}は遠慮がちに、{b}の脇腹をつついた。{b}は笑いをこらえて、唇を噛んでいた。タイマーは、それでも進んだ。','{a}と{b}は、目を合わせないまま条件をこなした。{b}の押し殺した笑い声だけが、部屋に響いていた。','{a}は{b}の足の裏をくすぐった。{b}「……っ、くすぐったい｜……っ、くすぐったいな｜……っ、くすぐったいです」{b}の声は、思ったより高かった。'],
foe:['{a}は容赦なく{b}の脇腹を攻めた。{b}「やめ、っ……覚えてて｜やめ、っ……覚えていろ｜やめ、っ……覚えていてください」笑いながらにらむという器用なことを、{b}はやってのけた。','{b}は歯を食いしばって笑いをこらえていた。{a}はそれが面白くて、手を止めなかった。','{a}の指が触れるたびに、{b}は笑い声と文句を交互に上げた。タイマーの数字だけが、律儀に進んでいった。'],
done:['タイマーが{N}秒を指したところで、ブザーが鳴った。{b}は床に大の字になって、肩で息をしていた。','ブザーの音で、{a}はようやく手を止めた。{b}の目尻には、笑い涙がたまっていた。','最後の一秒が過ぎると、タイマーの表示が「満了」に変わった。くすぐられ続けた{b}は、しばらく起き上がれなかった。']
};
TASK.tickle={
fit:function(c){return c.tr.fc*0.6+c.tr.np*0.2+(c.tr.aggr||0)*0.2;},
done:TK.done,
when:function(ctx,a){return ctx.others(a).some(free);},
run:function(ctx,a,r,first){
var O=ctx.others(a).filter(free);
if(!O.length)return null;
var b=HK.weighted(ctx.rng,O,function(o){return Math.max(0.2,1+(R(ctx,a,o).aff+R(ctx,o,a).aff)/60+o.tr.fc*0.5);});
var ten=Math.max(R(ctx,a,b).ten,R(ctx,b,a).ten),warm=ctx.pair(a,b).couple||(R(ctx,a,b).aff>15&&R(ctx,b,a).aff>15);
var kind=ten>45?'foe':warm?'warm':'awk';
var sec=Math.max(10,Math.round(r.n/Math.max(3,ctx.stepsTotal*0.4)*(0.6+ctx.rng()*0.8)/5)*5);
var text=ctx.t(pickNew(ctx,first?TK.first:TK[kind]),a,b);
ctx.stress(b,-5);
if(kind==='foe')ctx.mod(b,a,{ten:4});else ctx.mod2(a,b,{trust:2,aff:1},{trust:2,aff:kind==='warm'?2:0});
return{text:text,inc:sec,who:b,with:[b],doneA:a,doneB:b,cat:'bond',why:a.name+'が'+b.name+'を'+sec+'秒くすぐった（'+{warm:'仲がよい',awk:'ぎこちない',foe:'張りつめた'}[kind]+'二人）'};
}
};
var BL={
fc:['{a}は風船の上に勢いよく尻もちをついた。パン、と派手な音がして、{a}はそのまま床に転がって笑った。','{a}は風船を両手で抱えて、思いきり締め上げた。{a}「割れろ、割れろ｜＝｜割れてください、お願いします」――パン。','{a}は風船を蹴り上げては踏みつけ、次々に割っていった。'],
ac:['{a}は耳を両手で塞ぎながら、そっと風船を踏んだ。パン、という音に、{a}自身がいちばん驚いていた。','{a}はヘアピンを一本抜いて、風船の端をそっとつついた。割れた瞬間、小さく悲鳴を上げた。','{a}は風船から顔を背けたまま、ゆっくり体重をかけた。{a}「来る、来る……｜＝｜来ます、来ます……」――パン。'],
cold:['{a}は風船を一列に並べ、端から順番に踏み割っていった。無駄のない動きだった。','{a}は割れやすい結び目の近くを狙って、指で弾いて割った。','{a}「一人あたりの割り当てを出した｜＝｜一人あたりの割り当てを出しました」{a}は自分の分を、黙々と割った。'],
np:['{a}は怖がる皆の分まで、風船を引き受けて割った。','{a}は割れる音に皆が驚かないように、「次、割るよ｜次、割るぞ｜次、割りますよ」と声をかけてから踏んだ。','{a}は割れた風船の切れ端を、一つずつ拾い集めた。'],
cp:['{a}は風船を力任せに握りつぶした。{a}「こんなもの｜＝｜こんなもの、です」――パン。','{a}は鬼のような形相で、風船を次々に踏み抜いた。','{a}は割れない風船に苛立ち、二度、三度と踏みつけた。'],
pair:['{a}と{b}は、風船を一つ体の間に挟んで、ぎゅっと押し合った。なかなか割れずに、二人の顔が近づいていく。――パン。二人は同時に跳び退いた。','{a}が{b}の背中に風船を押し当てて、体重をかけて割った。{b}「わっ、びっくりした｜わっ、驚いた｜わっ、びっくりしました」{b}の悲鳴に、{a}が吹き出した。','{a}と{b}は、背中合わせに風船を挟んで、せーので体重をかけた。パン、と割れた音と一緒に、二人は床に尻もちをついた。'],
done:['最後の風船が割れた。床には、色とりどりのゴムの切れ端だけが残った。','最後の一個は、なかなか割れなかった。{a}が全体重をかけて、ようやくパンと鳴った。','{N}個目の風船が割れると、部屋は急に静かになった。耳の奥に、まだ音が残っていた。']
};
TASK.balloon={
fit:function(c){return c.tr.fc*0.5+c.tr.np*0.3+(c.tr.cold||0)*0.2;},
done:BL.done,
run:function(ctx,a,r){
var inc=(1+ctx.rng.int(3))*scaleOf(ctx,r);
var mate=ctx.most(ctx.others(a).filter(function(o){return free(o)&& !HK.ngPair(a,o)&&R(ctx,a,o).ten<40&&R(ctx,o,a).ten<40&&R(ctx,a,o).aff>5&&R(ctx,o,a).aff>5;}),function(o){return R(ctx,a,o).aff+R(ctx,o,a).aff;});
if(mate&&ctx.rng()<0.3){
ctx.mod2(a,mate,{att:2,trust:2},{att:2,trust:2});
return{text:ctx.t(pickNew(ctx,BL.pair),a,mate),inc:inc,with:[mate],cat:'bond',why:a.name+'と'+mate.name+'は気安い仲。二人で挟んで割った'};
}
var tk=topKey(a);
if(tk==='ac')ctx.stress(a,5);else ctx.stress(a,-3);
return{text:ctx.t(pickNew(ctx,BL[tk]||BL.np),a),inc:inc,cat:'escape',why:a.name+'の'+{fc:'奔放さ',ac:'怖がり',cold:'ドライさ（効率）',np:'優しさ（皆の分まで）',cp:'厳しさ（苛立ち）'}[tk]+'。お題：風船を割る'};
}
};
function hurtRule(ctx){return ruleK(ctx,'hurt');}
function relOf(ctx,a,b){
var Ti=HK.Ties,ab=R(ctx,a,b),ba=R(ctx,b,a);
var lover=ctx.pair(a,b).couple||(Ti&&Ti.has&&(Ti.has(ctx,a,b,'lover')||Ti.has(ctx,a,b,'mate')||Ti.has(ctx,a,b,'fated')))||(ab.att>45&&ba.att>45&&ab.aff>30&&ba.aff>30&&HK.canLove(a,b)&&HK.canLove(b,a));
if(lover)return'love';
if(Math.max(ab.ten,ba.ten)>45||Math.min(ab.aff,ba.aff)< -20||(Ti&&Ti.has&&(Ti.has(ctx,a,b,'enemy')||Ti.has(ctx,a,b,'rival'))))return'foe';
return'cold';
}
function tierOf(ctx){
var D=HK.Dark,h=D?D.on(ctx,'harm'):'normal',k=D?D.on(ctx,'kill'):'normal';
if(h==='mild'||k==='mild')return'word';
var w=h==='dark'&&k==='dark'?[0.2,0.3,0.5]:[0.4,0.35,0.25],x=ctx.rng();
return x<w[0]?'word':x<w[0]+w[1]?'pinch':'slap';
}
var HURT={
no:{
love:['{a}は{b}の頬に手を伸ばしかけて、そのまま撫でてしまった。{a}「……できない｜＝｜……できません」','{a}は{b}を傷つける言葉を探して、一つも見つけられなかった。','{b}は目を閉じて待った。{b}「いいよ、叩いて｜いい、叩け｜いいですよ、叩いてください」{a}は手を上げたまま、下ろせなかった。'],
foe:['{a}は{b}をにらみつけ、拳を握った。……けれど、紙の言いなりになるのは癪だった。','{a}は{b}に詰め寄ったが、{b}の目を見て、言いかけた言葉を飲み込んだ。','{a}「あなたのために手を汚すのも、ばかばかしい｜あなたのために手を汚すのも、ばかばかしいな｜あなたのために手を汚すのも、ばかばかしいです」{a}は背を向けた。'],
cold:['{a}は{b}の前に立ったが、何を言えば傷つくのか、{b}のことを何も知らなかった。','{a}は手を上げかけて、やめた。理由もなく人を叩けるほど、{a}は冷たくなれなかった。','{a}と{b}は気まずく顔を見合わせた。どちらも、相手を傷つける理由を持っていなかった。']
},
word:{
love:['{a}は目を伏せて、震える声で言った。{a}「あなたの寝相、本当にひどい。毎晩、蹴られてる｜あなたの寝相は、本当にひどい。毎晩、蹴られている｜あなたの寝相、本当にひどいです。毎晩、蹴られています」{b}は目を丸くして、それから少し傷ついた顔をした。','{a}は{b}のいちばん気にしていることを、わざと口にした。{a}「前から思ってた。料理、下手だよね｜前から思っていた。料理が下手だな｜前から思っていました。料理、下手ですよね」言った{a}の方が、泣きそうだった。','{a}「あなたなんか、嫌い｜あなたなんか、嫌いだ｜あなたなんか、嫌いです」{a}は言った直後に、{b}の手を握っていた。{b}は、その言葉が嘘だと知っていた。'],
foe:['{a}は{b}に向かって、ずっと腹に溜めていたことをぶちまけた。{b}の顔から、すっと表情が消えた。','{a}「あなたと同じ部屋にいるだけで、息が詰まる｜＝｜あなたと同じ部屋にいるだけで、息が詰まります」{a}の言葉は、{b}のいちばん痛いところに刺さった。','{a}は{b}の失敗を、一つずつ数え上げた。{b}は黙って聞いていたが、握った拳が白くなっていた。'],
cold:['{a}は{b}をまっすぐ見て、感情のこもらない声で言った。{a}「あなたのこと、別に何とも思ってない｜あなたのことは、別に何とも思っていない｜あなたのこと、別に何とも思っていません」{b}は、思ったより傷ついた顔をした。','{a}は{b}の服の趣味を、淡々とけなした。{b}「……そこまで言わなくても｜……そこまで言わなくてもいいだろう｜……そこまで言わなくても、いいでしょう」','{a}「正直、あなたの話はいつも退屈｜正直、あなたの話はいつも退屈だ｜正直、あなたの話はいつも退屈です」{b}は苦笑いしたが、目は笑っていなかった。']
},
pinch:{
love:['{a}は{b}の腕を、そっとつねった。{b}「……痛い｜……痛いな｜……痛いです」{a}はすぐに、つねったところを撫でた。','{b}が自分から手の甲を差し出した。{a}はためらいながら、そこをつねった。赤い跡が、小さく残った。','{a}は{b}の頬をつまんで、ぎゅっと引っぱった。{b}の目に涙がにじんだのは、痛みのせいだけではなかった。'],
foe:['{a}は{b}の二の腕を、爪を立ててつねり上げた。{b}は顔をしかめて、{a}をにらみ返した。','{a}は{b}の手の甲を、ひねるようにつねった。{a}「これで済むなら、安いもの｜これで済むなら、安いものだ｜これで済むなら、安いものです」','{a}は無言で{b}の脇腹をつねった。遠慮も、手加減もなかった。'],
cold:['{a}は「失礼｜失礼する｜失礼します」と断ってから、{b}の腕をつねった。{b}は小さく声を上げた。','{a}は{b}の手の甲を、事務的につねった。痛みより、その手つきの冷たさの方がこたえた。','{a}と{b}は、どちらがどちらをつねるかで少し揉めた。結局、{a}が{b}の腕をつねった。']
},
slap:{
love:['{a}は目をつぶって、{b}の頬を平手で打った。乾いた音のあと、{a}は{b}以上に痛そうな顔をした。','{b}「いいよ。思いきりやって｜いい。思いきりやれ｜いいですよ。思いきりやってください」{a}は{b}の頬を打ち、すぐにその頬に手を添えた。','{a}の平手は、{b}の頬を軽く打っただけだった。それでも扉の紙は、それを数えた。'],
foe:['{a}の平手が、{b}の頬を打った。部屋に響いた音は、思ったより大きかった。','{a}は迷わず{b}の頬を張った。{b}の頬に、赤い手の跡が浮かんだ。','{a}は{b}の頬を打ってから、手のひらを振った。{a}「ずっと、こうしたかった｜＝｜ずっと、こうしたかったんです」'],
cold:['{a}は{b}に断ってから、その頬を平手で打った。{b}はよろめいたが、文句は言わなかった。','{a}の平手は、迷いがなかった。{b}は打たれた頬を押さえて、{a}を見た。','{a}と{b}は、どちらが打つかを、じゃんけんで決めた。負けた{b}の頬を、{a}の平手が打った。']
},
after:{
love:['{a}は{b}を抱き寄せて、何度も謝った。{b}「大丈夫。条件だから｜大丈夫だ。条件だから｜大丈夫です。条件ですから」','二人は、しばらく黙って寄り添っていた。傷ついたのは、どちらも同じだった。','{b}は笑ってみせた。{a}は、その笑顔を見ていられなかった。'],
foe:['{b}は{a}をにらみつけたまま、低い声で言った。{b}「覚えておく｜覚えておくぞ｜覚えておきます」','{a}は少しだけ気が晴れた顔をしていた。{b}の方は、そうはいかなかった。','二人のあいだの空気は、前よりいっそう冷たくなった。'],
cold:['{a}と{b}は、気まずそうに目を逸らした。それ以上、何も言わなかった。','{b}は肩をすくめた。{b}「お互い、仕方なかった｜＝｜お互い、仕方なかったですね」','何でもない相手だったはずなのに、二人のあいだに小さな棘が残った。']
}
};
var TIER_JA={word:'言葉で傷つけた',pinch:'つねった',slap:'平手で打った'},REL_JA={love:'恋人',foe:'敵対',cold:'無関心'};
EV.push({
id:'cond_hurt',cat:'conflict',scope:'pair',pri:true,
when:function(ctx,a,b){
var r=hurtRule(ctx);
return!!r&&ctx.stepIndex>0&&free(a)&&free(b)&& !A.ruleDone(ctx,r,a,b)&&a.stress>20;
},
w:function(ctx,a,b){
var rel=relOf(ctx,a,b),t=ctx.stepIndex/Math.max(4,ctx.stepsTotal);
var w=rel==='foe'?1.8+Math.max(R(ctx,a,b).ten,0)/50:rel==='love'?0.8+a.stress/120:1.1+(a.tr.cold||0)*0.8;
w+=t*2+(a.flags.partner===b.i?0.5:0);
if(A.seqWait(ctx,hurtRule(ctx),a,b))w*=0.15;
else if(ctx.env.order==='seq'&&ctx.rules.length===2&&ctx.rules[0]===hurtRule(ctx))w*=2;
return w;
},
run:function(ctx,a,b){
var r=hurtRule(ctx),rel=relOf(ctx,a,b),t=ctx.stepIndex/Math.max(4,ctx.stepsTotal);
var will=0.15+(a.tr.cold||0)*0.5+(a.tr.aggr||0)*0.4+a.stress/150-a.tr.np*0.4+(rel==='foe'?0.3:rel==='love'? -0.1:0)+t*0.6;
if(ctx.rng()>HK.clamp(will,0.15,0.92)){
ctx.stress(a,6);
if(rel==='love')ctx.mod2(a,b,{aff:2},{aff:2});
return{cat:rel==='love'?'bond':'conflict',text:ctx.t(pickNew(ctx,HURT.no[rel]),a,b),why:a.name+'は条件を満たそうとして、踏みとどまった（関係：'+REL_JA[rel]+'）',mag:8};
}
var tier=tierOf(ctx),k=tier==='slap'?1.3:tier==='pinch'?1:0.8;
var counted=A.bumpAct(ctx,r,a,b,1);
var text=ctx.t(pickNew(ctx,HURT[tier][rel]),a,b)+ctx.t(pickNew(ctx,HURT.after[rel]),a,b);
if(rel==='love'){ctx.mod2(a,b,{trust:3,aff:2},{trust:2,ten:4*k});ctx.stress(a,8);}
else if(rel==='foe'){ctx.mod(b,a,{ten:14*k,trust: -10*k,aff: -8*k});ctx.mod(a,b,{ten: -3});ctx.stress(b,6);}
else{ctx.mod(b,a,{ten:8*k,trust: -6*k});ctx.stress(b,4);}
(ctx.flags.hurtLog=ctx.flags.hurtLog||[]).push({a:a.i,b:b.i,tier:tier,rel:rel});
if(!counted)text+=A.waitNote(ctx,r,a,b);
else text+=A.cntTag(ctx,r,a,b,A.prog(ctx,a,b).act.hurt);
var why=a.name+'は条件のために、'+b.name+'を'+TIER_JA[tier]+'（関係：'+REL_JA[rel]+(HK.Dark?'／'+HK.Dark.tag(ctx,'harm'):'')+'）';
if(counted&&A.pairDone(ctx,a,b))return A.exitPair(ctx,a,b,text,why,false);
if(counted&&A.ruleDone(ctx,r,a,b))text+='扉はまだ開かない。'+a.name+'と'+b.name+'に残っているのは、'+A.leftText(ctx,a,b)+'。';
return{text:text,why:why,mag:tier==='slap'?22:15};
}
});
function trioRule(ctx){return ruleK(ctx,'trio3');}
function pairs3(g){return[[g[0],g[1]],[g[0],g[2]],[g[1],g[2]]];}
function faith3(g){return!HK.Poly|| !HK.Poly.faithOk|| !HK._curCtx||HK.Poly.faithOk(HK._curCtx,g);}
function hardOk(g){var T=HK.RoomTrio;return!!(T&&T.sexOk3&&T.sexOk3(g))&&faith3(g);}
function faithOut(ctx,C){return C.filter(function(c){return c.faithful&&HK.Poly&&HK.Poly.faithOk&&C.some(function(o){return o!==c&& !HK.Poly.faithOk(ctx,[c,o]);});});}
function direct(x,y){return!!(A.okSex&&A.okSex(x,y));}
function soft(ctx){return!!ctx.flags.trioSoft||HK.SAFE_ON;}
function exclOk(ctx,g){return g.every(function(x){return!g.some(function(y){return y!==x&&A.exclOther(ctx,x,y);});});}
function readyPair(ctx,x,y,lv){return A.willing(ctx,x,y,lv)||A.desperate(ctx,x,y,lv);}
function lateOk(ctx,x,y,late){return late&&R(ctx,x,y).ten<55&&R(ctx,y,x).ten<55&&[x,y].every(function(z){return z.stress>45||z.flags.resign||A.eager(ctx,z)>0.5;});}
function grudge(ctx,x,y){
if(HK.SAFE_ON|| !x|| !y)return false;
var ts=HK.Ties&&HK.Ties.all?HK.Ties.all(ctx,x,y):[],H=HK.HateKit;
return ts.some(function(t){return/^(rival|enemy|bad)$/.test(t.type);})|| !!(H&&H.level&&(H.level(ctx,x,y)>=35||H.level(ctx,y,x)>=35));
}
function grudgeOk(ctx,x,y,late){
if(!grudge(ctx,x,y))return false;
if(HK.Avoid&&(HK.Avoid.of(ctx,x,y)||HK.Avoid.of(ctx,y,x)))return false;
var LH=HK.LoveHate,early=ctx.stepIndex>=ctx.stepsTotal*0.2;
return[x,y].every(function(z){
var o=z===x?y:x;
if(LH&&LH.has&&LH.has(ctx,z,o))return early&&(z.flags.resign||z.stress>25||A.eager(ctx,z)>0.35);
if(!late)return false;
var low=HK.Pos&&HK.Pos.libOf&&HK.Pos.libOf(z)==='low';
return z.flags.resign||z.stress>(low?55:40)||A.eager(ctx,z)>(low?0.65:0.5);
});
}
function pickTrio(ctx,a,b){
var r=trioRule(ctx);
if(!r)return null;
var late=ctx.stepIndex>=ctx.stepsTotal*0.35;
var cs=ctx.present().filter(function(c){return c!==a&&c!==b&&free(c);}),best=null,bv= -1e9;
cs.forEach(function(c){
var g=[a,b,c],gr=[];
if(A.pairDone(ctx,a,b)&&A.pairDone(ctx,a,c)&&A.pairDone(ctx,b,c))return;
if(!exclOk(ctx,g)||(HK.Poly&&HK.Poly.faithOk&& !HK.Poly.faithOk(ctx,g)))return;
var ok;
if(soft(ctx))ok=pairs3(g).every(function(p){var x=p[0],y=p[1];return(R(ctx,x,y).ten<60&&R(ctx,y,x).ten<60&&R(ctx,x,y).trust> -30&&R(ctx,y,x).trust> -30)||(late&&x.stress>60&&y.stress>60);});
else{
var warm=0;
ok=hardOk(g)&&pairs3(g).every(function(p){
var x=p[0],y=p[1];
if(!direct(x,y))return R(ctx,x,y).ten<60&&R(ctx,y,x).ten<60;
if(HK.RoomReluct&&HK.RoomReluct.blocks(ctx,x,y))return false;
if(readyPair(ctx,x,y,4)||lateOk(ctx,x,y,late)){warm++;return true;}
if(grudgeOk(ctx,x,y,late)){gr.push(p);return true;}
return false;
})&&(!gr.length||warm>0);
}
if(!ok)return;
var v=pairs3(g).reduce(function(s,p){return s+R(ctx,p[0],p[1]).att+R(ctx,p[1],p[0]).att+R(ctx,p[0],p[1]).aff;},0)-gr.length*40;
if(v>bv){bv=v;best=g;best.gr=gr;}
});
return best;
}
var TRIO_SOFT={
first:['{a}が{b}と{c}に手を差し出した。三人は輪になって手をつなぎ、それから、誰からともなく身を寄せ合った。','{a}「三人で、だって｜三人で、だそうだ｜三人で、だそうです」{a}が両腕を広げると、{b}と{c}が照れくさそうにその中に入った。','三人は、どこに手を置けばいいか迷いながら、ぎこちなく抱き合った。{b}の肘が{c}の脇腹に当たって、三人そろって吹き出した。'],
again:['三人はもう一度輪になって、肩を寄せ合った。さっきより、ずっと自然だった。','{a}が「もう一回｜もう一回だ｜もう一回しましょう」と言うと、{b}と{c}は笑って、また腕を回した。','三人で抱き合うたびに、扉の紙の数字が一つずつ減っていった。{c}は、それを少しだけ惜しそうに見ていた。'],
done:['三人が抱き合ったまま、扉の紙の文字が淡く光った。','腕をほどいた三人は、顔を見合わせて小さく笑った。','三人の輪がほどけると、部屋の空気が少しだけ温かくなっていた。']
};
EV.push({
id:'cond_trio',label:'三人で条件を満たそうとする',cat:'bond',scope:'pair',pri:true,
when:function(ctx,a,b){return!!ctx.flags.trioRule&&ctx.stepIndex>=1&&free(a)&&free(b)&& !!pickTrio(ctx,a,b);},
w:function(ctx,a){return 1.6+ctx.stepIndex/Math.max(4,ctx.stepsTotal)*2+A.eager(ctx,a)+(ctx.stepIndex>=ctx.stepsTotal*0.7?2:0);},
run:function(ctx,a,b){
var g=pickTrio(ctx,a,b),r=trioRule(ctx);
if(!g)return null;
var c=g[2],P=pairs3(g),first= !P.some(function(p){return(A.prog(ctx,p[0],p[1]).act.trio3||0)>0;});
var hard= !soft(ctx),text='',why='',sex=false,waited=null;
if(!text){
text=ctx.t(pickNew(ctx,first?TRIO_SOFT.first:TRIO_SOFT.again),a,b,c);
why='条件「三人で」：'+nm(g)+'は、張りつめていない三人。三人で抱き合った';
}
var inc=r.n>3?Math.max(1,Math.round(r.n/Math.max(3,ctx.stepsTotal*0.55)*(0.6+ctx.rng()*0.8))):1;
ctx.rules.forEach(function(q){
var T=K[q.k];
if(q!==r&& !(T.type==='act'&&(sex||T.lvl<=2)))return;
P.forEach(function(p){if(!A.bumpAct(ctx,q,p[0],p[1],q===r?inc:1)&& !waited)waited=[q,p[0],p[1]];});
});
P.forEach(function(p){ctx.mod2(p[0],p[1],{att:sex?8:2,aff:4,trust:4},{att:sex?8:2,aff:4,trust:4});});
if(waited)text+=A.waitNote(ctx,waited[0],waited[1],waited[2]);
else if(r.n>1)text+='（三人で：'+P.map(function(p){return p[0].name+'×'+p[1].name+' '+(A.prog(ctx,p[0],p[1]).act.trio3||0)+'/'+r.n;}).join('・')+'）';
var tps=sex?P.filter(function(p){return direct(p[0],p[1]);}):null;
var all=P.every(function(p){return A.pairDone(ctx,p[0],p[1]);});
if(all&&HK.RoomTrio&&HK.RoomTrio.exitGroup){
if(!sex)text+=ctx.t(pickNew(ctx,TRIO_SOFT.done),a,b,c);
var n0=(ctx.flags.trios||[]).length;
var ex=HK.RoomTrio.exitGroup(ctx,g,text,why,sex,sex?'warm':'soft');
if(!sex&&ctx.flags.trios&&ctx.flags.trios.length>n0)ctx.flags.trios.length=n0;
ex.with=[c];if(sex){ex.sex=true;ex.cat='romance';ex.trioPairs=tps;}
return ex;
}
if(!waited&&P.every(function(p){return A.ruleDone(ctx,r,p[0],p[1]);}))text+='扉はまだ開かない。残っているのは、'+A.leftText(ctx,a,b)+'。';
return{cat:sex?'romance':'bond',sex:sex,lewd:sex?true:undefined,text:text,why:why,with:[c],mag:sex?30:14,trioPairs:tps};
}
});
var setup0=scen.setup,phase0=scen.phase,finish0=scen.finish;
scen.setup=function(ctx){
setup0(ctx);
if(ctx.rules.some(function(r){return K[r.k].aphro;})){ctx.flags.hasAphroRule=true;ctx.flags.romantic=true;}
var tr=trioRule(ctx);
ctx.flags.trioRule= !!tr;
if(!tr)return;
ctx.flags.romantic=true;
var C=ctx.chars.filter(function(c){return HK.State.here(c);});
if(C.length<3){
if(HK._trioPrev)HK._trioPrev.res={n:C.length,few:true};
if(ctx.rules.some(function(q){return q.k==='hug';}))ctx.rules.splice(ctx.rules.indexOf(tr),1);else tr.k='hug';
ctx.flags.trioRule=false;ctx.flags.trioFall='few';
ctx.flags.trioLabel=HK.roomLabelOf(ctx.env,ctx.rules);
return;
}
if(HK.SAFE_ON){ctx.flags.trioSoft=true;if(HK._trioPrev)HK._trioPrev.res={n:C.length,soft:true};return;}
if(!ctx.flags.trioSoft&& !ctx.flags.trioNG)ctx.flags.trioSoft=true;
};
var NG_NOTE=null;
scen.phase=function(ctx,s,n){
phase0(ctx,s,n);
if(s!==0)return;
if(ctx.flags.trioFall==='few')ctx.say({text:'扉の紙の条件は「三人で」だったが、部屋にいるのは'+ctx.chars.length+'人だけだった。三人そろわなければ、この条件は成り立たない。紙の文字がにじんで、条件は「ハグ」に書き換わった。'});
else if(ctx.flags.trioFall==='ng'&&NG_NOTE)ctx.say({text:NG_NOTE(ctx,true)});
if(ctx.flags.trioLabel)ctx.flags.roomLabel=ctx.flags.trioLabel;
if(ctx.flags.trioRule&& !ctx.flags.trioFall&&NG_NOTE){var nt=NG_NOTE(ctx,false);if(nt)ctx.say({text:nt});}
ctx.rules.forEach(function(r){
var pool=r.k==='trio3'&& !soft(ctx)&&INTRO_H?INTRO_H:INTRO[r.k]||HK.RoomGames.INTRO[r.k];
if(pool&&pool.length)ctx.say({text:fillN(ctx.pick(pool),r.n)});
});
};
var BY_JA={nyan:'言った回数',roulette:'回した回数',tickle:'くすぐられた秒数',balloon:'割った個数'};
scen.finish=function(ctx){
finish0(ctx);
var notes=function(s){(ctx.flags.endNotes=ctx.flags.endNotes||[]).push(s);};
ctx.rules.forEach(function(r){
var T=K[r.k];
if(T.type!=='task')return;
var B=(ctx.flags.taskBy||{})[r.k]||{},ids=Object.keys(B).sort(function(x,y){return B[y]-B[x];});
notes(A.KLABEL[r.k].replace(/（.*$/,'')+'：'+Math.min(r.n,ctx.flags.consumed[r.k]||0)+'/'+r.n+T.unit+(ids.length?'（'+(BY_JA[r.k]||'')+'：'+ids.map(function(i){return ctx.chars[i].name+' '+B[i]+T.unit;}).join('・')+'）':''));
if(r.k==='roulette'&&ctx.flags.rrLose){var L0=ctx.flags.rrLose;notes('罰ゲーム：'+Object.keys(L0).map(function(i){return ctx.chars[i].name+' '+L0[i]+'回';}).join('・'));}
});
if(ctx.flags.hurtLog&&ctx.flags.hurtLog.length)notes('傷つけた：'+ctx.flags.hurtLog.map(function(h){return ctx.chars[h.a].name+'→'+ctx.chars[h.b].name+'（'+{word:'言葉',pinch:'つねる',slap:'平手'}[h.tier]+'）';}).join('、'));
if(ctx.flags.trioFall==='few')notes('条件「三人で」：部屋に三人そろわなかったので、「ハグ」に替わった');
};
HK.RoomGames={TASK:TASK,INTRO:{},addTask:function(k,H,intro){TASK[k]=H;if(intro)HK.RoomGames.INTRO[k]=intro;},free:free,topKey:topKey,scaleOf:scaleOf,fillN:fillN,pickNew:pickNew};
})();
});
;
/* ==== js/room-trio-note.js ==== */
HK.Load.def(83,'js/room-trio-note.js',function(){
(function(){
'use strict';
var HK=window.HK,scen=HK&&HK.SCENARIOS&&HK.SCENARIOS.whiteroom;
if(!scen)return;
var RG=HK.RoomGames=HK.RoomGames||{};
var steps0=scen.steps;
scen.steps=function(){return HK._trioPrev?[]:steps0.apply(this,arguments);};
RG.preview=function(input){
var box={},prev=HK._trioPrev;
HK._trioPrev=box;
try{HK.simulate(JSON.parse(JSON.stringify(input)));}catch(e){box.err=String(e&&e.message||e);}finally{HK._trioPrev=prev||null;}
return box.res||null;
};
function noteText(r){
if(!r)return'';
if(r.few)return'条件「三人で」は三人以上で成り立ちます。いまの参加者は'+r.n+'人なので、条件は「ハグ」に替わります（参加者を三人以上にすると使えます）。';
if(r.soft)return'条件「三人で」は、三人そろって抱き合う場面になります。';
var t='';
return t;
}
RG.noteText=noteText;
function noteHtml(r){
if(!r)return'';
var h='';
if(!h){var t=noteText(r);h=t?'<div class="desc trioinfo">'+HK.escape(t)+'</div>':'';}
return h;
}
RG.noteHtml=noteHtml;
if(typeof document==='undefined'|| !document.addEventListener||typeof MutationObserver==='undefined')return;
var timer=null,busy=false,lastKey='',lastText='';
function schedule(){if(busy)return;clearTimeout(timer);timer=setTimeout(update,250);}
function trioSel(){
var ids=['env-cond','env-cond2'];
for(var i=0;i<ids.length;i++){var s=document.getElementById(ids[i]);if(s&&s.value==='trio3')return s;}
return null;
}
function update(){
try{
var UI=HK.UI,S=UI&&UI.state?UI.state():null,old=document.getElementById('trio-note');
var sel=S&&S.scenId==='whiteroom'?trioSel():null;
if(!sel|| !UI.buildInput){if(old){busy=true;old.parentNode.removeChild(old);setTimeout(function(){busy=false;},0);}return;}
var input=UI.buildInput(0),key=JSON.stringify({c:input.chars,t:input.ties,e:input.env,n:(S.chars||[]).map(function(c){return c.name;})});
var t=key===lastKey?lastText:noteHtml(RG.preview(input));
lastKey=key;lastText=t;
var grid=sel.closest&&sel.closest('.envgrid'),host=grid?grid.parentNode:(sel.closest&&sel.closest('.envitem'))||sel.parentNode;
busy=true;
if(old&&(old.parentNode!==host||(grid&&old.nextSibling!==grid))){old.parentNode.removeChild(old);old=null;}
if(!t){if(old)old.parentNode.removeChild(old);}
else{
if(!old){old=document.createElement('div');old.id='trio-note';old.setAttribute('aria-live','polite');if(grid)host.insertBefore(old,grid);else host.appendChild(old);}
if(old._h!==t){old.innerHTML=t;old._h=t;}
}
setTimeout(function(){busy=false;},0);
}catch(e){busy=false;}
}
RG.noteUpdate=update;
document.addEventListener('change',schedule,true);
document.addEventListener('input',schedule,true);
var start=function(){try{new MutationObserver(schedule).observe(document.body||document.documentElement,{childList:true,subtree:true});}catch(e){}schedule();};
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();
});
;
/* ==== js/room-noexit-note.js ==== */
HK.Load.def(84,'js/room-noexit-note.js',function(){
(function(){
'use strict';
var HK=window.HK,A=HK&&HK.RoomAPI,scen=A&&A.scen;
if(!scen)return;
var K=A.K,NX=HK.RoomNoExit={};
function isPairT(T){return!!T&&(T.type==='act'||T.type==='word'||T.type==='hurt'||T.type==='trio');}
function hereOf(ctx){return ctx.chars.filter(function(c){return HK.State&&HK.State.here?HK.State.here(c):c.alive!==false&& !c.out;});}
function condName(ctx,r){
var e=ctx.env||{},k1=e.cond||'h',lab=r.k==='kill'?(HK.SAFE_ON?'誰かを気絶させる':'誰かを殺す'):(A.KLABEL&&A.KLABEL[r.k])||r.k;
var no=r.k===k1?'条件1':r.k===e.cond2?'条件2':'条件';
var seq=e.order==='seq'&&ctx.rules.length===2&&r===ctx.rules[1]?'（条件1のあと）':'';
return no+'「'+lab+'」'+seq;
}
function canH(ctx,a,b){
var P=HK.Pos;
if(!P|| !P.okSex)return true;
var f=function(){return P.okSex(a,b)&&(!P.libOK||P.libOK([a,b]));};
return P.forceOpen? !!P.forceOpen(ctx,[a,b],f): !!f();
}
function personWhy(c,force){
var P=HK.Pos,o=null;
if(!o&&c.likes==='none'&&(!P.sexLikeOf||P.sexLikeOf(c)==='none'))o={t:'恋愛対象が「なし」',fix:c.name+'の「恋愛対象」を変える'};
return o;
}
var LIKE_JA={m:'男性',f:'女性'},POS_JA={top:'攻め',bottom:'受け',riba:'リバ'};
function likeMiss(x,y){var v=x.likes;return!!(LIKE_JA[v]&&LIKE_JA[y.gender]&&v!==y.gender);}
function pairWhy(ctx,a,b,force){
var P=HK.Pos,r=null,i,x,y,pr=[[a,b],[b,a]];
if(likeMiss(a,b)&&likeMiss(b,a))return{t:a.name+'（恋愛対象「'+LIKE_JA[a.likes]+'」）と'+b.name+'（恋愛対象「'+LIKE_JA[b.likes]+'」）は、どちらも相手が恋愛対象に合わない',fix:a.name+'と'+b.name+'の「恋愛対象」を変える'};
if(r)return{t:r.t,fix:r.fix};
for(i=0;i<2;i++){x=pr[i][0];y=pr[i][1];if(likeMiss(x,y))return{t:x.name+'の恋愛対象「'+LIKE_JA[x.likes]+'」に、'+y.name+'（'+LIKE_JA[y.gender]+'）が合わない',fix:x.name+'の「恋愛対象」を変える'};}
for(i=0;i<2;i++){x=pr[i][0];y=pr[i][1];if(x.ng&&x.ng.indexOf(y.i)>=0)return{t:x.name+'が'+y.name+'を「恋愛にしない相手」にしている',fix:x.name+'の「恋愛にしない相手」から'+y.name+'を外す'};}
if((a.coNG&&a.coNG.indexOf(b.i)>=0)||(b.coNG&&b.coNG.indexOf(a.i)>=0))return{t:'同じ人の恋人どうし',fix:'二人のあいだに恋愛の関係を足すか、恋人の関係を見直す'};
if(HK.sexBlocked&&HK.sexBlocked(a,b))return{t:'どちらかが相手を固定している（恋愛相手の固定など）',fix:'相手の固定を見直す'};
var lab=function(c,o){return P.explicit&&P.explicit(c,o)?POS_JA[P.of(c,o)]||'おまかせ':'おまかせ';};
return{t:'受け攻めが合わない（'+a.name+'：'+lab(a,b)+'・'+b.name+'：'+lab(b,a)+'）',fix:'受け攻めを、どちらかが受けかリバに回れるようにする'};
}
var MAXROW=5;
function hItem(ctx,r,C){
var P=HK.Pos,force= !!(P&&P.forceOn&&P.forceOn(ctx)),i,j;
for(i=0;i<C.length;i++)for(j=i+1;j<C.length;j++)if(canH(ctx,C[i],C[j]))return null;
var rows=[],out={},more=0;
C.forEach(function(c){var o=personWhy(c,force);if(o){out[c.i]=1;rows.push({a:c.name,who:c.name,t:o.t+'（誰とも体の関係になりません）',fix:o.fix});}});
for(i=0;i<C.length;i++)for(j=i+1;j<C.length;j++){
if(out[C[i].i]||out[C[j].i])continue;
if(rows.length>=MAXROW){more++;continue;}
var w=pairWhy(ctx,C[i],C[j],force);
rows.push({a:C[i].name,b:C[j].name,t:w.t,fix:w.fix});
}
return{lead:condName(ctx,r)+'を満たせる二人がいません（この顔ぶれでは、どの二人も体の関係になりません）。',rows:rows,more:more,
notes:['直し方：下のどれかを直すか、体の関係の要らない条件（キス・ハグなど）に替える']};
}
NX.judge=function(ctx){
var rules=ctx&&ctx.rules;
if(!rules|| !rules.length|| !K[rules[0].k]||rules[0].k==='one')return null;
var C=hereOf(ctx),N=C.length,pairR=rules.filter(function(r){return isPairT(K[r.k]);}),items=[];
if(pairR.length&&N<2)items.push({lead:condName(ctx,pairR[0])+'は二人で満たす条件ですが、部屋にいるのは'+N+'人です。',rows:[],notes:['直し方：住人を二人以上にする']});
else rules.forEach(function(r){
var T=K[r.k];
if(r.k==='h'){var it=hItem(ctx,r,C);if(it)items.push(it);}
else if(T&&T.type==='kill'){
var keep=pairR.length?2:1,max=N-keep;
if(r.n>max)items.push({lead:condName(ctx,r)+'の人数（'+r.n+'人）が多すぎます。部屋にいるのは'+N+'人なので、'+(keep>1?'もう一つの条件を満たす二人':'扉をくぐる人')+'が残りません。',rows:[],
notes:['直し方：'+(max>0?'人数を'+max+'人以下にするか、':'')+'住人を増やす']});
}
});
return items.length?{n:N,items:items}:null;
};
var steps0=scen.steps;
scen.steps=function(){
var box=HK._trioPrev;
if(box&&box.noexitAsk&&HK._curCtx&&HK._curCtx.rules){try{box.noexit=NX.judge(HK._curCtx);}catch(e){box.noexit=null;}}
return steps0.apply(this,arguments);
};
NX.preview=function(input){
var box={noexitAsk:true},prev=HK._trioPrev;
HK._trioPrev=box;
try{HK.simulate(JSON.parse(JSON.stringify(input)));}catch(e){box.noexit=null;}finally{HK._trioPrev=prev||null;}
return box.noexit||null;
};
NX.html=function(res){
if(!res|| !res.items|| !res.items.length|| !HK.NgBand)return'';
var rows=[],notes=[],more=0;
res.items.forEach(function(it){rows=rows.concat(it.rows||[]);more+=it.more||0;notes=notes.concat(it.notes||[]);});
if(more)notes.unshift('ほか'+more+'組も、同じく体の関係になりません');
return HK.NgBand.html({red:true,count:false,title:'この状況では脱出できません',lead:res.items.map(function(it){return it.lead;}).join(''),rows:rows,notes:notes,
foot:'扉は最後まで開かず、時間切れになります（そのあとの結末で、救助などで外に出ることはあります）。'});
};
if(typeof document==='undefined'|| !document.addEventListener||typeof MutationObserver==='undefined')return;
var timer=null,busy=false,lastKey='',lastHtml='';
function schedule(){if(busy)return;clearTimeout(timer);timer=setTimeout(update,250);}
function drop(old){if(old&&old.parentNode){busy=true;old.parentNode.removeChild(old);setTimeout(function(){busy=false;},0);}}
function update(){
try{
var UI=HK.UI,S=UI&&UI.state?UI.state():null,old=document.getElementById('noexit-note');
var sel=S&&S.scenId==='whiteroom'?document.getElementById('env-cond'):null;
if(!sel|| !UI.buildInput){drop(old);return;}
var input=UI.buildInput(0),key=JSON.stringify({s: !!HK.SAFE_ON,i:input,n:(S.chars||[]).map(function(c){return c.name;})});
var h=key===lastKey?lastHtml:NX.html(NX.preview(input));
lastKey=key;lastHtml=h;
var grid=sel.closest&&sel.closest('.envgrid'),host=grid?grid.parentNode:(sel.closest&&sel.closest('.envitem'))||sel.parentNode;
var trio=document.getElementById('trio-note'),anchor=trio&&trio.parentNode===host?trio:grid;
if(!h){drop(old);return;}
busy=true;
if(old&&(old.parentNode!==host||(anchor&&old.nextSibling!==anchor))){old.parentNode.removeChild(old);old=null;}
if(!old){old=document.createElement('div');old.id='noexit-note';old.setAttribute('aria-live','polite');if(anchor)host.insertBefore(old,anchor);else host.appendChild(old);}
if(old._h!==h){old.innerHTML=h;old._h=h;}
setTimeout(function(){busy=false;},0);
}catch(e){busy=false;}
}
NX.update=update;
document.addEventListener('change',schedule,true);
document.addEventListener('input',schedule,true);
var start=function(){try{new MutationObserver(schedule).observe(document.body||document.documentElement,{childList:true,subtree:true});}catch(e){}schedule();};
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();
});
;
/* ==== js/trap-open-room.js ==== */
HK.Load.def(85,'js/trap-open-room.js',function(){
(function(){
'use strict';
var HK=window.HK,scen=HK.SCENARIOS&&HK.SCENARIOS.whiteroom;
if(!scen|| !HK.wrap)return;
function free(c){return HK.State&&HK.State.canAct?HK.State.canAct(c): !!c&&c.alive!==false&& !c.out;}
function run(ctx){
var T=HK.TrapOpen;
if(!T||ctx.flags.trapOpen)return;
ctx.flags.trapOpen=[];
var P=ctx.present().filter(free);
if(P.length<2)return;
var X=T.mk(ctx,'room',P,{seed:ctx.seed,all:ctx.chars});
var t0=ctx._touched,m0=ctx._mag;
ctx._touched={};ctx._mag=0;
T.make(X).forEach(function(e){
var note='';
if(e.eff){
if(e.eff.ab)ctx.mod(e.a,e.b,e.eff.ab);
if(e.eff.ba)ctx.mod(e.b,e.a,e.eff.ba);
note=T.effNote(e.a,e.b,e.eff);
}
if(e.calmA){ctx.stress(e.a,-5);note=(note?note+'・':'')+e.a.name+'の焦り -5';}
ctx.say({kind:'event',cat:e.cat||'bond',actors:e.actors,text:e.text,why:T.whyOf(e,note),mag:8});
ctx.flags.trapOpen.push({sys:e.sys,key:e.key,a:e.a.i,b:e.b?e.b.i:null,moved: !!e.eff});
});
ctx._touched=t0;ctx._mag=m0;
T.lastRun=ctx.flags.trapOpen;
}
HK.wrap(scen,'phase',function(ph0){
return function(ctx,s,n){
var r=ph0?ph0.apply(this,arguments):undefined;
if(s===0)run(ctx);
return r;
};
});
})();
});
;
/* ==== js/mini-room.js ==== */
HK.Load.def(119,'js/mini-room.js',function(){
(function(){
'use strict';
var E=window.HK.E;
window.HK.addMini('whiteroom',[
E('r_screw','escape','s+','a*.5+#exp*0+cp*.2','','as:-2','{a}は爪で、壁のネジを回そうとした。爪が割れた。|{a}は靴のかかとで、扉の蝶番を叩き続けた。|{a}は換気口の格子を外そうとして、ネジが一本もないことに気づいた。|{a}は扉の鍵穴に、ヘアピンを差し込んでみた。|{a}は壁の継ぎ目を探して、手のひらで部屋を一周した。|{a}は床のタイルを一枚ずつ押してみた。どれも動かなかった。|{a}は天井に向かって物を投げて、高さを測った。'),
E('r_paper','escape','s+','a*.6+honesty*.2','','','{a}は扉の紙を裏返した。裏には何も書かれていない。|{a}は紙の文字を光に透かして、隠し文字を探した。|{a}は紙の端に、小さく印刷された番号を見つけた。意味は分からない。|{a}は紙を破ろうとしたが、どれだけ力を込めても破れなかった。|{a}は紙の文言を声に出して読み上げ、言葉の抜け穴を探した。|{a}は紙が貼られた位置が、ちょうど目の高さであることに気づいた。|{a}は紙の文字のフォントが、どこかで見たものだと思った。'),
E('r_shout','solo','s+','fc*.4+cp*.3+stress/100','','as:-2;gab:ten1','{a}は「誰か見てるんだろ！｜誰か見ているんだろう！｜誰か見ているんでしょう！」と天井に向かって叫んだ。|{a}は扉に向かって、知っている限りの罵倒を浴びせた。|{a}はカメラがあるかもしれない方向に、中指を立てた。|{a}は「ふざけるな｜＝｜ふざけないでください」と叫んで、自分の声の反響に驚いた。|{a}は大声で歌い始めた。誰かへの抗議のつもりだった。|{a}は「聞こえてるなら返事して｜聞こえているなら返事をしろ｜聞こえているなら返事をしてください」と、壁を蹴った。'),
E('r_listen','escape','s+','a*.4+caution*.4','','as:-3','{a}は壁に耳を当てて、外の音を探した。かすかに水の流れる音がした。|{a}は扉の隙間から漏れる空気の温度を、手のひらで確かめた。|{a}は換気口から聞こえる低い唸りに、じっと耳を澄ませた。|{a}は照明の点滅に、規則性があるかどうか数えていた。|{a}は床に耳をつけた。誰かの足音が聞こえた気がした。|{a}は自分の心臓の音しか聞こえないことに気づいて、目を閉じた。'),
E('r_plan','bond','p+','a*.5+lead*.3','','ab:trust5;ba:trust5','{a}は{b}と、脱出の計画を三通り立てた。どれも現実的ではなかった。|{a}は{b}に、扉が開く条件の「抜け道」を真剣に提案した。|{a}と{b}は、肩車をして天井の照明に手を伸ばした。|{a}は{b}に、時間の経過を記録する係を頼んだ。|{a}と{b}は、二人がかりで扉を押してみた。|{a}は{b}と「もし出られたら最初に何をするか」を決めた。'),
E('r_cold','help','p+','np*.5+att/80','','ba:aff4,att3;bs:-3','部屋の温度が下がった。{a}は{b}の肩に、自分の上着をかけた。|{a}は震える{b}の手を、両手で包んで温めた。|{a}と{b}は、寒さに耐えかねて背中合わせに座った。|{a}は{b}の指先の冷たさに驚いて、自分の首筋に当てさせた。|{a}は「寒くない？｜寒くないか？｜寒くないですか？」と{b}に訊いて、返事を待たずに隣に座った。|{a}は自分の靴下を脱いで、裸足の{b}に渡した。'),
E('r_hot','romance','p+','impulse*.3+att/80+rroom*.3','','ab:att4;ba:att4;as:4','部屋の温度が上がった。{a}はシャツのボタンを一つ外した。{b}がそれを見ていた。|{a}は額の汗を拭った。{b}は目のやり場に困っていた。|{a}は暑さに耐えかねて、上着を脱いで床に放った。|{a}は首筋を伝う汗を、{b}に見られていることに気づいた。|{a}は{b}に「暑くない？｜暑くないか？｜暑くないですか？」と訊いた。声が少し掠れていた。|{a}と{b}は、壁の冷たい部分を取り合った。'),
E('r_thirst','help','p+','np*.5','','ba:aff5,trust4;as:3','{a}は差し入れの水を、半分{b}に分けた。|{a}は自分のペットボトルの最後の一口を、{b}に譲った。|{a}は{b}が喉を鳴らしているのに気づいて、水を差し出した。|{a}と{b}は、一本の水を交互に飲んだ。間接キスだと、どちらも口にしなかった。|{a}は水を{b}に渡して、自分は唇を舐めて我慢した。|{a}は{b}の分の水を、ずっと取っておいた。'),
E('r_toilet','solo','s+','ac*.5+caution*.2','step>=2','as:8','{a}は部屋の隅の仕切りの向こうに、簡易トイレがあることに気づいて、絶望した。|{a}は限界まで、トイレに行くのを我慢していた。|{a}は「耳塞いでて｜耳を塞いでいろ｜耳を塞いでいてください」と言って、仕切りの向こうに消えた。|{a}はトイレの音をごまかすために、大声でしりとりを始めた。|{a}は仕切りの向こうから「絶対こっち見ないで｜絶対にこっちを見るな｜絶対にこっちを見ないでください」と三回言った。|{a}はトイレから戻って、誰とも目を合わせなかった。'),
E('r_hungry','bond','p+','fc*.3+warmth*.3','step>=3','ab:aff3;ba:aff3','{a}のお腹が盛大に鳴った。{b}が吹き出した。|{a}はポケットに入っていた飴を、{b}と半分にした。|{a}と{b}は、出たら何を食べるかで三十分語り合った。|{a}は{b}に、一番好きなラーメン屋の話をした。|{a}と{b}は、空腹を紛らわすために料理しりとりをした。|{a}は{b}に、出られたら焼肉を奢ると約束した。'),
E('r_sleep','romance','p','stress/100+att/70','step>=3','ab:att5,trust4;ba:att3','{a}は気づくと、{b}の肩にもたれて眠っていた。|{a}は{b}が眠ったのを確かめてから、その寝顔を見ていた。|{a}は{b}の寝息を聞きながら、眠れずにいた。|{a}と{b}は、背中合わせで眠った。起きたとき、なぜか向かい合っていた。|{a}は眠ってしまった{b}の頭を、自分の膝に乗せた。|{a}は{b}が寝言で自分の名前を呼んだ気がした。'),
E('r_insomnia','solo','s+','stress/80+caution*.2','step>=3','as:3','{a}は一睡もできずに、天井の照明を数えていた。|{a}は横になっても、目を閉じるのが怖かった。|{a}は眠っている皆の顔を、一人ずつ見ていた。|{a}は壁にもたれて、朝が来るのを待った。朝が来たのかは分からなかった。|{a}は眠気を払うために、腕をつねった。|{a}は眠ったら何か起きる気がして、ずっと起きていた。'),
E('r_clock','solo','s+','a*.4+ac*.3','','as:2','{a}は腕時計がないことに気づいて、自分の脈で時間を数えた。|{a}は時計の秒針を、ずっと目で追っていた。|{a}は「今、何時だと思う？｜＝｜今、何時だと思いますか？」と何度も訊いた。|{a}は時間の感覚がなくなって、怖くなった。|{a}は壁に爪で正の字を刻んで、時間を記録した。|{a}は照明の明るさの変化で、昼夜を推測しようとした。'),
E('r_shiritori','bond','p+','fc*.4+warmth*.3','','ab:aff3;ba:aff3','{a}と{b}は、気を紛らわせるためにしりとりを始めた。三百語続いた。|{a}は{b}に、なぞなぞを出し続けた。|{a}と{b}は、指スマで真剣勝負をした。|{a}は{b}と、「好きな〇〇」を交互に言い合うゲームをした。|{a}と{b}は、手の影で動物を作って遊んだ。|{a}は{b}と、壁に指で絵を描くしりとりをした。'),
E('r_story','bond','p+','honesty*.4+trust/80','','ab:trust5;ba:trust5,aff2','{a}は{b}に、子どもの頃の夢を話した。|{a}は{b}に、初めて人を好きになった日の話をした。|{a}は{b}に、一番後悔していることを話した。|{a}は{b}に、家族の話をした。思っていたより長くなった。|{a}は{b}に、ここに来る直前に何をしていたかを話した。|{a}は{b}に、人に言ったことのない趣味を打ち明けた。'),
E('r_question','romance','p+','honesty*.4+att/60','','ab:att3;ba:att4','{a}は{b}に「今、何考えてる？｜今、何を考えている？｜今、何を考えていますか？」と訊いた。|{a}は{b}に「好きな人いる？｜好きな人はいるか？｜好きな人はいますか？」と、冗談めかして訊いた。|{a}は{b}に「ここに来る相手が私で、よかった？｜ここに来る相手が私で、よかったか？｜ここに来る相手が私で、よかったですか？」と訊いた。|{a}は{b}に、最後に恋人がいたのはいつか訊いた。|{a}は{b}に「どこまでなら平気？｜どこまでなら平気だ？｜どこまでなら平気ですか？」と真顔で訊いた。|{a}は{b}に「出たら、また会う？｜出たら、また会うか？｜出たら、また会いますか？」と訊いた。'),
E('r_sing','bond','s+','fc*.5+warmth*.2','','gab:aff2;as:-4','{a}は小さな声で、子守唄を歌い始めた。|{a}は鼻歌で、流行りの曲を口ずさんだ。|{a}は手拍子で皆を巻き込んで、歌を歌った。|{a}は誰にも聴かせるつもりのない歌を、壁に向かって歌った。|{a}は歌詞をうろ覚えのまま、最後まで歌い切った。|{a}は歌いながら、少しだけ泣いた。'),
E('r_joke','bond','g','fc*.5+np*.2','','gab:aff3;as:-3','{a}は「これ、ドッキリ番組じゃない？｜これは、ドッキリ番組じゃないか？｜これ、ドッキリ番組じゃないですか？」と言って、場を少し和ませた。|{a}は紙の条件を読み上げて、わざと大げさに嘆いてみせた。|{a}は監視カメラに向かって、渾身の変顔をした。|{a}は「出たら全員で焼肉な｜出たら全員で焼肉だ｜出たら全員で焼肉にしましょう」と勝手に決めた。|{a}は部屋を「スイートルーム」と呼び始めた。|{a}は条件の紙に、勝手にツッコミを書き込んだ。'),
E('r_silence','solo','s+','cold*.4+ac*.3','','as:2','{a}はもう一時間、誰とも口をきいていなかった。|{a}は膝を抱えて、壁の一点を見つめていた。|{a}は話しかけられても、首を振るだけだった。|{a}は部屋の隅で、自分の手のひらを眺めていた。|{a}は目を閉じて、別の場所にいることを想像していた。|{a}は黙ったまま、紙の文字を指でなぞり続けた。'),
E('r_compare','conflict','p+','cp*.4+jealous*.3','','ab:ten4;ba:ten4','{a}は{b}に「なんで私がこんな目に｜なぜ私がこんな目に遭うんだ｜どうして私がこんな目に遭うんですか」と当たった。|{a}は{b}の楽観的な態度に苛立った。|{a}は{b}の黙り込む癖を「ずるい｜＝｜ずるいです」と言った。|{a}は{b}が泣いているのを見て「泣いても出られない｜＝｜泣いても出られませんよ」と言った。|{a}は{b}が条件の話を避けるのを責めた。|{a}は{b}の何気ない一言に、過剰に噛みついた。'),
E('r_apology','help','p+','np*.4+ac*.4','ten>20','ab:ten-8,trust4;ba:ten-8,trust5','{a}は{b}に「さっきは私が悪かった。ごめん｜さっきは私が悪かった。すまない｜さっきは私が悪かったです。すみません」と言った。|{a}は{b}に、言い過ぎたことを謝った。|{a}は{b}の隣に座り直して、何も言わずに肩を寄せた。|{a}は{b}に「こんな場所だから、苛立っただけ｜こんな場所だから、苛立っただけだ｜こんな場所だから、苛立っただけです」と言った。|{a}は{b}に、仲直りの印として水を渡した。|{a}は{b}の手を握って「喧嘩してる場合じゃない｜喧嘩している場合ではない｜喧嘩している場合ではありません」と言った。'),
E('r_dilemma','solo','s+','ac*.4+caution*.3+rroom*.3','','as:6','{a}は紙の条件を見つめたまま、長いこと黙っていた。|{a}は「本当にやるしかないの？｜本当にやるしかないのか｜本当にやるしかないんでしょうか」と、何度も自分に問いかけた。|{a}は条件のことを考えると、相手の顔を見られなくなった。|{a}は「私、誰とでも、ってわけじゃない｜私は、誰とでも、というわけではない｜私、誰とでも、というわけじゃありません」と小さく呟いた。|{a}は条件を満たした自分を想像して、首を振った。|{a}は紙を見ないように、壁の方を向いた。'),
E('r_whoWith','romance','p','att/50+honesty*.2','rroom>0&att>25','ab:att5;as:4','{a}は、もし条件を満たすなら相手は{b}がいい、と思ってしまった。|{a}は{b}を見て、すぐに目を逸らした。|{a}は{b}の唇に目が行ってしまい、自分を殴りたくなった。|{a}は{b}の手の大きさを、こっそり測っていた。|{a}は{b}が近くに座るだけで、心拍数が上がるのを感じた。|{a}は{b}以外の誰かと条件を満たす想像が、できなかった。'),
E('r_negotiate','bond','p+','a*.4+honesty*.3','rroom>0','ab:trust5;ba:trust5','{a}は{b}と、「どこまでならできるか」を正直に話し合った。|{a}は{b}に、条件を満たすならルールを決めようと言った。|{a}は{b}と「目を閉じたままなら」という妥協案を検討した。|{a}は{b}に「嫌になったら私がすぐ止める｜嫌になったら私がすぐに止める｜嫌になったら私がすぐに止めます」と約束した。|{a}と{b}は、条件のことを「あれ」と呼ぶようになった。|{a}は{b}に、どちらがリードするかを話し合おうと言った。'),
E('r_refuse','conflict','p+','cp*.5+cold*.3-att/60','rroom>0','ab:ten4;ba:ten5,att-3','{a}は{b}に「そういうことは、好きな人とするものだ｜＝｜そういうことは、好きな人とするものです」と言った。|{a}は条件の話が出るたび、話題を変えた。|{a}は{b}に「私は絶対に嫌だ｜＝｜私は絶対に嫌です」とはっきり言った。|{a}は{b}の視線を避けて、部屋の対角線上に座った。|{a}は「何日かかっても、私は別の方法を探す｜＝｜何日かかっても、私は別の方法を探します」と宣言した。|{a}は{b}が近づくたび、一歩下がった。'),
E('r_shy_touch','romance','p+','ac*.3+att/60','rroom>0&att>20','ab:att5;ba:att5','{a}の指先が{b}の手の甲に触れて、二人とも同時に引っ込めた。|{a}は{b}の髪についた埃を取ろうとして、手を止めた。|{a}は{b}の肩に触れようとして、宙で手を握り込んだ。|{a}と{b}の膝が触れた。どちらも離さなかった。|{a}は{b}の袖を、指先でつまんだ。|{a}は{b}の手の上に、自分の手をそっと重ねた。'),
E('r_practice','romance','p+','fc*.4+att/60','rroom>0&att>25','ab:att6;ba:att6','{a}は{b}に「練習だと思って｜練習だと思え｜練習だと思ってください」と言って、手を差し出した。|{a}は{b}と、目を見つめ合う練習を始めた。三秒で吹き出した。|{a}は{b}に「慣れるまで、少しずつ｜慣れるまで、少しずつだ｜慣れるまで、少しずつにしましょう」と提案した。|{a}は{b}の頬に、指先で触れてみた。|{a}と{b}は、距離を十センチずつ詰める遊びをした。|{a}は{b}の耳元で、わざと囁いてみた。'),
E('r_tease_cond','romance','p+','fc*.5+cold*.2','rroom>0','ab:att3;ba:att3,ten2','{a}は「じゃあ、する？｜では、するか？｜じゃあ、しますか？」と冗談めかして{b}に言った。{b}は固まった。|{a}は条件の紙を指でつついて「どうする？｜＝｜どうしますか？」と{b}に笑った。|{a}は{b}に「顔赤いよ｜顔が赤いぞ｜顔が赤いですよ」と言った。|{a}は{b}の反応を見て、わざとゆっくり近づいた。|{a}は「冗談だよ｜冗談だ｜冗談ですよ」と言いながら、目は冗談ではなかった。|{a}は{b}に「経験あるの？｜経験はあるのか？｜経験はあるんですか？」と訊いた。'),
E('r_ideal','romance','p+','honesty*.3+att/60','rroom>0','ab:att3;ba:att4','{a}は{b}に、初めてのキスの話をした。|{a}は{b}に「私、初めてがこんな場所なのは嫌だ｜私は、初めてがこんな場所なのは嫌だ｜私、初めてがこんな場所なのは嫌です」と打ち明けた。|{a}は{b}に、理想の告白の場面を語った。|{a}は{b}の恋愛経験を聞いて、目を丸くした。|{a}は{b}に「付き合ってもいない相手と、できる？｜付き合ってもいない相手と、できるか？｜付き合ってもいない相手と、できますか？」と訊いた。|{a}は{b}に、昔の恋人との別れ方を話した。'),
E('r_protect_cond','help','p+','np*.5+cp*.3','rroom>0','ba:trust8,aff5','{a}は{b}に「あなたが嫌なら、私は何もしない｜＝｜あなたが嫌なら、私は何もしません」と言った。|{a}は{b}に詰め寄る誰かの前に、立ちはだかった。|{a}は{b}が嫌がることは、紙が何と言おうとしないと決めていた。|{a}は{b}の震える手を見て、条件の話をやめさせた。|{a}は{b}に「私が誰にも無理強いさせない｜私が誰にも無理強いはさせない｜私が誰にも無理強いはさせません」と約束した。|{a}は{b}に、自分を盾にしていいと言った。'),
E('r_resolve','romance','p','att/40+stress/120','rroom>0&att>40&trust>15','ab:att6,trust5;ba:att4','{a}は{b}の目を見て「私、あなたとなら、いい｜私は、あなたとなら、構わない｜私、あなたとなら、いいです」と言った。|{a}は深呼吸をして、{b}の手を取った。|{a}は{b}に「条件じゃなくて、私が自分で選んだことにしたい｜条件ではなく、私が自分で選んだことにしたい｜条件ではなく、私が自分で選んだことにしたいです」と言った。|{a}は{b}の名前を呼んだ。それだけで、何を言いたいのか伝わった。|{a}は{b}の隣に座って「怖くない｜＝｜怖くないです」と嘘をついた。|{a}は{b}の頬に触れて、許可を求めるように見つめた。'),
E('r_aph_heat','romance','s+','aphro/3','aphro>1','as:4','{a}は自分の体温が上がっていくのを、他人事のように感じていた。|{a}は熱を逃がすように、壁に額を押しつけた。|{a}の呼吸が、少しずつ浅くなっていった。|{a}は自分の腕を抱いて、何かに耐えるように目を閉じた。|{a}は唇を噛んで、声を殺していた。|{a}は誰にも触れないように、部屋の隅で小さくなっていた。|{a}は袖で顔を隠した。耳まで赤かった。'),
E('r_aph_reach','romance','p','aphro/3+att/80','aphro>2&att>20','ab:att6;ba:att4','{a}は熱に浮かされた目で、{b}の袖を掴んだ。|{a}は{b}の首筋に、額を押し当てた。|{a}は{b}の名前を、何度も呼んだ。|{a}は{b}の手を取って、自分の頬に当てた。冷たくて気持ちいい、と言った。|{a}は{b}の肩に顔を埋めて、動かなくなった。|{a}は{b}に「私の近くにいて｜私の近くにいてくれ｜私の近くにいてください」と言った。'),
E('r_aph_endure','help','p+','np*.5+cp*.3','B.aphro>2','ba:trust8,aff5','{a}は{b}が自分に手を伸ばすたび、その手を握って「大丈夫｜大丈夫だ｜大丈夫です」と言った。|{a}は{b}が落ち着くまで、ずっと話しかけ続けた。|{a}は{b}の額に濡れた布を当て続けた。|{a}は熱っぽい{b}から目を逸らして、背中をさすった。|{a}は{b}に、深呼吸の仕方を教えた。|{a}は{b}が後悔しないように、自分が理性でいようと決めた。'),
E('r_aph_tempt','romance','p','att/50+impulse*.3','B.aphro>2&att>30','ab:att7;as:6','{a}は熱に潤んだ{b}の目を見て、自分の理性の脆さを知った。|{a}は{b}の乱れた呼吸から、目を逸らせなかった。|{a}は{b}が掴んだ袖を、振りほどけなかった。|{a}は{b}の熱い指先が触れるたび、息を止めた。|{a}は「今の{b}は正気じゃない｜今の{b}は正気ではない｜今の{b}は正気じゃありません」と自分に言い聞かせた。|{a}は{b}の名前を呼ぶ声が、自分でも驚くほど甘いことに気づいた。'),
E('r_drunk_truth','romance','p+','drunk/40+honesty*.3','drunk>30','ab:att4,trust4;ba:att4','{a}は酒の勢いで、{b}に「私、前から気になってた｜私は、前から気になっていた｜私、前から気になっていました」と言った。|{a}は酔って、{b}の顔の好きなところを三つ挙げた。|{a}は{b}に「あなた、いい匂いするよな｜あなたは、いい匂いがするな｜あなた、いい匂いがしますね」と言った。|{a}は酔った勢いで、{b}の膝に頭を乗せた。|{a}は{b}に、普段絶対に言わない褒め言葉を並べた。|{a}は{b}の手を握って「離すなよ｜離すな｜離さないでください」と言った。'),
E('r_spicy_fall','solo','s+','stress/100+fc*.2','stress>50','as:3','{a}は辛さと熱気で、床に倒れ込んだ。|{a}は舌を冷やすために、氷を探したがなかった。|{a}は汗だくになりながら「もう無理｜もう無理だ｜もう無理です」と三回言った。|{a}は唇が腫れて、まともに喋れなくなった。|{a}は辛さで涙を流しながら、なぜか笑っていた。|{a}は「次は私、絶対に誰かに代わってもらう｜次こそ、私は絶対に誰かに代わってもらう｜次は私、絶対に誰かに代わってもらいます」と誓った。'),
E('r_one_think','solo','s+','one*1+a*.3','one>0','as:6','{a}は「一人しか出られない」の文字を見つめて、誰を出すべきかを考えていた。|{a}は自分が残ると決めかけて、怖くなった。|{a}は自分が出たいと思っていることに、気づいてしまった。|{a}は皆の顔を見回して、誰が一番外に出るべきかを考えた。|{a}はくじ引きで決めようかと考えた。|{a}は「残る方が楽かもしれない｜＝｜残る方が楽かもしれません」と思った。'),
E('r_one_lots','bond','g','one*1+a*.4+lead*.3','one>0&n>1','gab:trust3','{a}は「くじ引きで決めよう｜＝｜くじ引きで決めましょう」と提案した。|{a}は「一番帰りを待ってる人がいる奴が出るべきだ｜一番帰りを待っている人がいる者が出るべきだ｜一番帰りを待っている人がいる方が出るべきです」と言った。|{a}は誰が出るかの話し合いを仕切った。|{a}は「誰も出ないなら、全員で残ろう｜＝｜誰も出ないなら、全員で残りましょう」と言った。|{a}は「出た人が、必ず助けを呼ぶこと｜出た者が、必ず助けを呼ぶこと｜出た人が、必ず助けを呼んでください」と約束させた。|{a}は自分の名前をくじから外した。'),
E('r_one_suspect','conflict','p+','one*1+jealous*.4+caution*.3','one>0','ab:ten6,trust-5','{a}は{b}が抜け駆けするのではないかと、目を離さなかった。|{a}は{b}が扉に近づくたびに、立ち上がった。|{a}は{b}の優しさが、演技なのではないかと疑った。|{a}は{b}が眠ったふりをしているのではないかと思った。|{a}は扉の前に座り込んで、誰も近づけないようにした。|{a}は{b}に「あなたが先に出たいんでしょ｜あなたが先に出たいんだろう｜あなたが先に出たいんでしょう」と言った。'),
E('r_one_promise','help','p+','one*1+np*.5','one>0&aff>20','ab:aff6;ba:aff6,trust6','{a}は{b}に「あなたが出ろ｜＝｜あなたが出てください」と言った。{b}は首を振った。|{a}は{b}と「どっちが出ても恨みっこなし｜どちらが出ても恨みっこなしだ｜どちらが出ても恨みっこなしですよ」と約束した。|{a}は{b}に、外の家族への伝言を託した。|{a}は{b}に「出られたら、私のことは忘れていい｜＝｜出られたら、私のことは忘れていいです」と言った。|{a}は{b}の手に、自分のお守りを握らせた。|{a}は{b}に「もし私が出たら、絶対に戻ってくる｜＝｜もし私が出たら、絶対に戻ってきます」と言った。'),
E('r_eye','solo','s+','caution*.5+jealous*.3','','as:4','{a}は、壁の向こうから誰かに見られている気がした。|{a}は監視カメラを探して、部屋の角を順に見た。|{a}は照明の一つが、わずかに動いた気がした。|{a}はどこかでシャッター音がした気がして、体を硬くした。|{a}は扉の向こうに、誰かが立っている気配を感じた。|{a}は自分たちの会話が、録音されているのではないかと思った。'),
E('r_noise','solo','s','caution*.3+.3','','gab:ten1;as:4','どこからか、時計の針の音がした。この部屋に時計はない。|換気口から、甘い匂いが流れ込んできた。|天井のスピーカーから、ノイズ混じりの笑い声が一瞬だけ聞こえた。|扉の向こうで、誰かが拍手をした気がした。|照明が三回点滅して、また元に戻った。|壁の一部が、一瞬だけ温かくなった。'),
E('r_mirror','solo','s+','a*.3+ac*.3','','as:3','{a}は壁の一部が鏡のようになっていることに気づいた。マジックミラーかもしれない。|{a}は自分の顔が、思っていたより疲れていることに気づいた。|{a}は鏡に映った自分と、目を合わせられなかった。|{a}は鏡越しに、誰かと目が合った気がした。|{a}は鏡を叩いてみた。中は空洞の音がした。|{a}は鏡に向かって「見てるなら出せ｜見ているなら出せ｜見ているなら出してください」と言った。'),
E('r_item','bond','g','fc*.3+a*.3','','gab:aff2','{a}は部屋の隅に、トランプが一組置かれているのを見つけた。|{a}は差し入れ口から出てきた毛布を、皆に配った。|{a}は床に落ちていたペンで、壁に絵を描き始めた。|{a}はポケットから出てきたガムを、皆に配った。|{a}は差し入れられた本を、声に出して読み聞かせた。|{a}は部屋の隅で、古いラジオを見つけた。ノイズしか流れなかった。'),
E('r_lean','bond','p+','ac*.4+trust/80','trust>10','ab:trust5,att3;ba:aff3','{a}は{b}の背中に、自分の背中を預けた。|{a}は{b}に「ちょっと私に寄りかからせて｜少し私に寄りかからせてくれ｜少し私に寄りかからせてください」と言った。|{a}は{b}の腕に、頭をこつんと当てた。|{a}は{b}の隣で、ようやく肩の力を抜いた。|{a}は{b}の袖を掴んだまま、眠りかけていた。|{a}は{b}の手を握ったまま「少しだけこのまま｜少しだけこのままでいさせてくれ｜少しだけこのままでいさせてください」と言った。'),
E('r_comfort','help','p+','np*.6','B.stress>40','ba:aff6,trust6;bs:-10','{a}は泣き出しそうな{b}の頭を、そっと撫でた。|{a}は{b}に「大丈夫、絶対出られる｜大丈夫だ、絶対に出られる｜大丈夫です、絶対に出られます」と言った。根拠はなかった。|{a}は{b}の手を握って、呼吸を合わせた。|{a}は{b}に、出たら行きたい場所の話をさせた。|{a}は{b}を抱き寄せて、背中をさすった。|{a}は{b}に、面白かった昔の話をして笑わせた。'),
E('r_annoy','conflict','p+','cp*.4+stress/100-np*.3','stress>40','ab:ten5;ba:ten5','{a}は{b}の貧乏ゆすりに、我慢できなくなった。|{a}は{b}のため息の多さを指摘した。|{a}は{b}の楽観的すぎる言葉に「黙ってて｜黙っていろ｜黙っていてください」と言った。|{a}は{b}が壁を叩く音に、耳を塞いだ。|{a}は{b}の同じ話を三回聞かされて、苛立った。|{a}は{b}の存在そのものに、苛立ち始めていた。'),
E('r_flirt','romance','p+','fc*.4+att/60','att>25','ab:att5;ba:att5','{a}は{b}の耳元で、何かを囁いた。{b}の耳が赤くなった。|{a}は{b}の指を、自分の指で一本ずつなぞった。|{a}は{b}に「近いね｜近いな｜近いですね」と言って、離れなかった。|{a}は{b}の髪に指を通して「柔らかい｜＝｜柔らかいですね」と言った。|{a}は{b}の顔を覗き込んで、わざと黙った。|{a}は{b}の唇の端についた水滴を、指で拭った。'),
E('r_confess','romance','p','honesty*.4+att/40','att>50&aff>30','ab:att6;ba:att6,aff5','{a}は{b}に、閉じ込められる前から好きだったと言った。|{a}は{b}に「こんな状況じゃなきゃ、私、言わなかった｜こんな状況でなければ、私は言わなかった｜こんな状況じゃなければ、私、言いませんでした」と前置きして、想いを告げた。|{a}は{b}に「条件じゃなくても、私は触れたいと思ってた｜条件でなくても、私は触れたいと思っていた｜条件じゃなくても、私は触れたいと思っていました」と言った。|{a}は{b}に、ずっと目で追っていたことを打ち明けた。|{a}は{b}に「出ても、私の隣にいてほしい｜＝｜出ても、私の隣にいてほしいです」と言った。|{a}は{b}の名前を呼んで、それから「好きだ｜＝｜好きです」と言った。'),
E('r_hurt','conflict','p','cold*.4+cp*.3','ratt>30','ba:ten6,att-4;bs:10','{a}は{b}に「条件のためじゃなきゃ、私はあなたとは無理｜条件のためでなければ、私はあなたとは無理だ｜条件のためでなければ、私はあなたとは無理です」と言ってしまった。|{a}は{b}の好意に気づいていて、わざと冷たくした。|{a}は{b}に「誰でもよかった｜＝｜誰でもよかったんです」と言った。|{a}は{b}が差し出した手を、払いのけた。|{a}は{b}に「勘違いするなよ｜勘違いするな｜勘違いしないでください」と言った。|{a}は{b}の告白を、笑い飛ばした。'),
E('r_together','bond','p+','warmth*.4+trust/60','trust>25','ab:trust6,aff4;ba:trust6,aff4','{a}と{b}は、出たら一緒に行く場所のリストを作った。|{a}は{b}と、互いの連絡先を暗記し合った。|{a}と{b}は「ここでのことは二人だけの秘密｜ここでのことは二人だけの秘密だ｜ここでのことは二人だけの秘密ですよ」と約束した。|{a}は{b}と、出たらまず何を食べるか決めた。|{a}と{b}は、壁に二人の名前を並べて刻んだ。|{a}は{b}と、どんな結末になっても恨まないと誓い合った。'),
E('r_memory','solo','s+','ac*.3+np*.3','','as:3','{a}は外にいる誰かのことを考えて、少しだけ泣いた。|{a}は飼っている猫が、今頃お腹を空かせていると心配した。|{a}は明日の予定を思い出して、もう間に合わないと思った。|{a}は最後に家族と話した言葉を思い出せなかった。|{a}は返していないLINEのことを、ふと思い出した。|{a}は部屋の電気を消し忘れたことを、思い出した。'),
E('r_strength','help','p+','cp*.4+lead*.4','B.stress>35','ba:trust6;bs:-6','{a}は{b}に「しっかりしろ｜＝｜しっかりしてください」と言って、その肩を掴んだ。|{a}は{b}に、今やるべきことを一つずつ指示した。|{a}は{b}に「私がなんとかする｜＝｜私がなんとかします」と言った。|{a}は{b}の前で、弱音を一切吐かなかった。|{a}は{b}が泣き止むまで、黙って隣に立っていた。|{a}は{b}に「あなたは悪くない｜＝｜あなたは悪くありません」と断言した。'),
E('r_rule_check','escape','p+','a*.5+lead*.2','','ab:trust3;ba:trust3','{a}は{b}に、条件の数え方について確認した。「さっきのも一回に入る？｜さっきのも一回に入るか？｜さっきのも一回に入りますか？」|{a}と{b}は、紙の数字が減っているかを確かめた。|{a}は{b}と、どちらがどれだけやったかを記録した。|{a}は{b}に「あと何回？｜あと何回だ？｜あと何回ですか？」と訊いた。|{a}は{b}と、条件をどう分担するか話し合った。|{a}は{b}に「同時にやったら二回分になる？｜同時にやったら二回分になるか？｜同時にやったら二回分になりますか？」と真顔で訊いた。'),
E('r_rest','bond','p+','np*.3+warmth*.3','','ab:aff3,trust3;ba:aff3,trust3','{a}と{b}は、床に寝転んで天井を見上げた。|{a}は{b}に、ゆっくり休もうと言った。|{a}と{b}は、毛布を一枚分け合った。|{a}は{b}の隣で、何も考えずにぼんやりしていた。|{a}と{b}は、互いの呼吸の音だけを聞いていた。|{a}は{b}に「今は何もしなくていい｜＝｜今は何もしなくていいですよ」と言った。'),
E('r_rage','conflict','s','aggr*.6+stress/100','stress>55','gab:ten3;as:-6','{a}は扉を蹴り続けた。足を痛めるまで。|{a}は差し入れのトレイを、壁に投げつけた。|{a}は「全部あなたたちのせい｜全部あなたたちのせいだ｜全部あなたたちのせいです」と叫んだ。誰のことかは分からなかった。|{a}は条件の紙を、拳で殴った。|{a}は誰も悪くないと分かっていて、誰かに当たりたかった。|{a}は壁に頭を打ちつけそうになって、自分で止めた。'),
E('r_calm_all','help','g','np*.4+a*.4','n>2','gab:trust3;as:-2','{a}は全員を輪になって座らせて、一人ずつ話をさせた。|{a}は皆に、水を分ける順番を決めた。|{a}は皆に、深呼吸を三回させた。|{a}は皆の名前と、外で待っている人の名前を聞いて回った。|{a}は「一人で抱え込まないこと」というルールを作った。|{a}は皆が眠れるように、照明の下に毛布で影を作った。'),
E('r_odd_calm','solo','s+','cold*.5+a*.3','','as:-6','{a}は、この状況でも妙に落ち着いていた。|{a}は「どうせ出られる｜＝｜どうせ出られますよ」と言って、昼寝を始めた。|{a}は紙を読んで「まあ、そういうこともある｜＝｜まあ、そういうこともありますよ」と呟いた。|{a}はこの状況を、どこか楽しんでいるように見えた。|{a}は誰よりも早く、部屋の仕組みに慣れた。|{a}は監視されていると知って、むしろ姿勢を正した。'),
E('r_hold','romance','p','att/40+warmth*.3','att>40&ratt>30','ab:att6,trust4;ba:att6,trust4','{a}は何も言わずに、{b}を抱きしめた。|{a}は{b}の手を取って、指を絡めた。|{a}は{b}の額に、自分の額を寄せた。|{a}は{b}を引き寄せて、腕の中に閉じ込めた。|{a}は{b}の背中に腕を回して、しばらく離さなかった。|{a}は{b}の頬に、そっと唇を寄せた。'),
E('r_bicker','romance','p+','fc*.4+cp*.3','att>20&ten>15','ab:att4,ten2;ba:att4,ten2','{a}と{b}は、条件の意味をめぐって痴話喧嘩のような言い合いをした。|{a}は{b}に「私、あなたとだけは絶対嫌だ｜私は、あなたとだけは絶対に嫌だ｜私、あなたとだけは絶対に嫌です」と言った。言いながら、目は逸らさなかった。|{a}と{b}は、どちらが先に触れるかで揉めた。|{a}は{b}に「下手そう｜下手そうだ｜下手そうですね」と言って、本気で怒らせた。|{a}と{b}は、互いの欠点を言い合って、なぜか距離が縮んだ。|{a}は{b}に「意識してんの？｜意識しているのか？｜意識しているんですか？」と言われて、言い返せなかった。')
]);
})();
});
;
/* ==== js/mini-room-cute.js ==== */
HK.Load.def(120,'js/mini-room-cute.js',function(){
(function(){
'use strict';
var HK=window.HK,E=HK.E;
if(!E|| !HK.addMini)return;
HK.addMini('whiteroom',[
E('rc_peace','bond','p+','fc*.5+warmth*.3+aff/120+.05','aff>-10','ab:aff4;ba:aff4;as:-4;bs:-4',
'{a}と{b}は、天井の隅に向かって二人でピースした。「見てるなら、せめて盛れてて｜見ているなら、せめて盛れていてくれ｜見ているなら、せめて盛れていてください」|{a}は{b}の肩に腕を回して、見えないカメラにダブルピースをした。{b}も、遅れてピースを出した。|{a}と{b}は、指でハートの半分ずつを作って、くっつけた。|{a}は{b}の頭の上に、指でうさぎの耳を作った。{b}は気づかないまま、真顔でピースしていた。|{a}と{b}は「せーの」で、決めポーズを取った。ポーズは見事にバラバラだった。|{a}は{b}と並んで、卒業アルバムみたいに肩を寄せて微笑んだ。誰も撮っていない。|{a}と{b}は、どっちがより盛れる角度を知っているかで張り合った。|{a}は{b}に「はい、チーズ」と言った。{b}が反射的にピースしたので、二人で笑った。'),
E('rc_selfie','bond','p+','fc*.4+warmth*.3+.05','','ab:aff3;ba:aff3;as:-3',
'{a}は手で四角い枠を作って、{b}を撮るふりをした。「はい、いい顔｜よし、いい顔だ｜はい、いい顔です」|{a}と{b}は、ありもしないスマホで自撮りする真似をした。画角の取り合いになった。|{a}は{b}に、指で作ったカメラを向けて「目線ちょうだい｜目線をくれ｜目線ください」と言った。|{a}は{b}に、プリクラの落書きみたいに空中で文字を書いてみせた。「ずっともだよ｜ずっと友達だ｜ずっと友達ですよ」'),
E('rc_hands','bond','p+','fc*.45+warmth*.25+.1','','ab:aff3;ba:aff3;as:-3;bs:-3',
'{a}と{b}は、あっち向いてホイを始めた。{a}は十連敗した。|{a}と{b}は、指相撲で本気の勝負をした。最後は二人とも親指がつりそうになった。|{a}は{b}に「せっせっせーの、よいよいよい」と手を出した。{b}は、ちゃんと最後まで付き合ってくれた。|{a}と{b}は、じゃんけんを百回した。結果は五十勝五十敗だった。|{a}と{b}は、手押し相撲をした。{a}はバランスを崩して、床に尻もちをついた。|{a}と{b}は、アルプス一万尺を一番から最後まで通しでやり切った。|{a}は{b}と、「いっせーのーで」の指当てゲームを始めた。数字を当てるたびに、勝ち誇った。|{a}は{b}の手のひらに、指で文字を書いた。「なんて書いたと思う？｜何と書いたと思う？｜何と書いたと思いますか？」{b}は三回外した。'),
E('rc_penalty','bond','p+','fc*.5+cp*.15+impulse*.2','ten<35','ab:aff2;ba:aff2,ten1;as:-3',
'{a}はじゃんけんに勝って、{b}のおでこにデコピンをした。思ったより痛そうで、すぐに謝った。|{a}と{b}は、負けた方が変顔をする勝負をした。{a}の変顔で、二人とも息ができなくなるほど笑った。|{a}は罰ゲームで、{b}のいいところを十個言わされた。八個目で、照れて言えなくなった。|{a}と{b}は、しっぺを賭けてにらめっこをした。先に笑ったのは{a}だった。'),
E('rc_compare','bond','p+','warmth*.35+fc*.25+trust/120+.05','','ab:aff3,trust2;ba:aff3,trust2',
'{a}と{b}は、背中合わせで背比べをした。{a}はこっそり、つま先立ちをしていた。|{a}は{b}と手のひらを合わせた。「手、ちっちゃ｜手が、小さいな｜手、小さいですね」{b}は言い返した。「そっちがでかいんだよ｜そっちがでかいんだ｜そちらが大きいんですよ」|{a}と{b}は、どっちの靴が大きいか並べて比べた。|{a}と{b}は、袖をまくって腕の太さを比べた。勝負はつかなかった。|{a}は{b}と、指の長さを一本ずつ比べた。薬指だけ、{b}の方が長かった。|{a}と{b}は、どっちが長く息を止められるか競った。{a}は途中で吹き出した。'),
E('rc_match','bond','p+','warmth*.3+np*.2+aff/100+.05','aff>5','ab:aff4;ba:aff4',
'{a}は{b}の靴紐を、自分と同じ結び方に結び直した。「おそろい｜おそろいだ｜おそろいです」|{a}と{b}は、袖を同じ長さにまくった。それだけで、なんだか仲間になった気がした。|{a}は{b}に、自分のヘアゴムを一つ渡した。二人とも、同じ色のゴムで髪を留めた。|{a}と{b}は、差し入れのストローで指輪を作って、交換した。|{a}は{b}と、毛布を二人羽織みたいにかぶって座った。'),
E('rc_sync','bond','p+','warmth*.3+fc*.2+aff/100+.1','','ab:aff3;ba:aff3;as:-2;bs:-2',
'{a}と{b}は、同時にくしゃみをした。顔を見合わせて、同時に吹き出した。|{a}と{b}のお腹が、同時に鳴った。|{a}と{b}は「せーので、出たら最初に食べたいもの」と言い合った。答えは揃っていた。|{a}と{b}は、同時に口を開きかけて、同時に譲り合った。|{a}が鼻歌を歌うと、{b}が勝手にハモってきた。|{a}と{b}は、同じタイミングであくびをした。うつったのはどっちなのか、言い合いになった。'),
E('rc_shadow','bond','p+','fc*.35+a*.15+warmth*.2','','ab:aff3;ba:aff3;as:-3',
'{a}は照明の下で、手で影絵のきつねを作った。{b}が隣で鳩を作って、きつねにつつかせた。|{a}と{b}は、壁に映る影で「巨大怪獣と勇者」の劇を始めた。|{a}は{b}の影に、自分の影でこっそり角を生やした。|{a}と{b}は、二人の手で一匹の蝶の影を作った。羽ばたかせるのに、五分かかった。'),
E('rc_play','bond','p+','fc*.45+lead*.15+warmth*.2','','ab:aff3;ba:aff3,trust2;as:-3',
'{a}は「ただいまより、脱出の実況をお送りします」と言って、{b}にエア・マイクを向けた。|{a}と{b}は、探偵ごっこを始めた。犯人は、部屋を作った誰かということになった。|{a}は{b}を勝手に「隊長」と呼び、敬礼した。{b}は渋々、敬礼を返した。|{a}と{b}は、紙の条件を読み上げるニュースキャスターごっこをした。|{a}は{b}とラジオ体操を始めた。第二まで覚えていたのは{b}だけだった。|{a}と{b}は、部屋の中で「だるまさんがころんだ」をした。鬼は、毎回{a}が負けてやった。'),
E('rc_draw','bond','p+','fc*.3+warmth*.25+a*.1','','ab:aff3;ba:aff3',
'{a}は床に落ちていたペンで、{b}の似顔絵を描いた。似てなかった。{b}は大事そうに眺めていた。|{a}と{b}は、壁に交互に一本ずつ線を描いて、一枚の絵を完成させた。何の絵かは、二人にも分からなかった。|{a}は{b}の手の甲に、小さな花の絵を描いた。|{a}と{b}は、紙の裏にこの部屋の間取りを描いて、勝手に家具を配置した。'),
E('rc_nick','bond','p+','fc*.35+warmth*.3+aff/120','aff>0','ab:aff4;ba:aff4',
'{a}は{b}に、ここだけのあだ名をつけた。{b}は嫌そうな顔をしたが、呼ばれると返事をした。|{a}と{b}は、お互いのあだ名を考え合った。どちらも、ろくな案が出なかった。|{a}は{b}を変なあだ名で呼んだ。三回目から、{b}は普通に返事をするようになった。'),
E('rc_dance','bond','p+','fc*.5+warmth*.2-ac*.2','','ab:aff3;ba:aff3;as:-5',
'{a}は{b}の手を取って、くるりと回した。{b}は「何これ｜何だこれは｜これ、何ですか」と言いながら、一緒にステップを踏んだ。|{a}と{b}は、うろ覚えのアイドルの振り付けを二人で踊った。サビだけは完璧だった。|{a}は{b}と、無音のままワルツの真似をした。足を三回踏んだ。|{a}と{b}は、誰も見ていない（はずの）部屋で、変なダンスを考案した。'),
E('rc_hi5','bond','p+','warmth*.3+fc*.2+trust/100+.05','trust>0','ab:trust3,aff2;ba:trust3,aff2',
'{a}と{b}は、扉の条件が一つ進むたびにハイタッチした。|{a}は{b}に拳を突き出した。{b}は少し迷ってから、こつんとグータッチした。|{a}と{b}は、何もいいことが起きていないのにハイタッチした。|{a}と{b}は、二人だけの複雑な握手を考えた。最後は指を鳴らして終わる。'),
E('rc_feed','romance','p+','warmth*.3+fc*.2+att/70','att>15&love>0','ab:att4,aff2;ba:att4,aff2',
'{a}は差し入れのクッキーを割って、{b}の口元に差し出した。「はい、あーん」{b}は一瞬固まってから、食べた。|{a}は{b}の口の端についたパンくずを、指で取ってやった。|{a}は飴を半分かじって、残りを{b}に渡した。{b}は何も言わずに受け取った。'),
E('rc_hair','romance','p+','np*.3+warmth*.2+att/80+aff/150','aff>10','ab:aff3,att2;ba:aff4,att2',
'{a}は{b}の寝癖を、指でちょいちょいと直してやった。|{a}は{b}の髪を、勝手に三つ編みにした。{b}はおとなしくされるがままだった。|{a}は{b}の前髪を、差し入れの輪ゴムで結んでちょんまげにした。{b}は鏡を見て、しばらく黙った。|{a}は{b}の肩に乗った糸くずを、ふっと吹いて飛ばした。')
]);
})();
});
;
/* ==== js/mini-extra-a-room.js ==== */
HK.Load.def(127,'js/mini-extra-a-room.js',function(){
(function(){
'use strict';
var E=window.HK.E;
window.HK.addMini('whiteroom',[
E('r_count_wall','solo','s+','a*.4+ac*.2','','as:-2','{a}は壁に、残りの回数を爪で刻んでいた。|{a}は紙の数字を、何度も声に出して確かめた。|{a}は進み具合を、指で数えていた。|{a}は「半分は過ぎたね｜半分は過ぎた｜半分は過ぎました」と自分を励ました。|{a}は数字が減らないことに、苛立ち始めていた。|{a}は残りの数を、誰かに言ってほしかった。'),
E('r_hum','bond','p+','warmth*.4+fc*.3','','ab:aff3;ba:aff3','{a}は{b}の好きな歌を聞いて、一緒に口ずさんだ。|{a}は{b}に、子どもの頃の遊び歌を教えた。|{a}と{b}は、手遊び歌を全部思い出そうとした。|{a}は{b}の鼻歌に、ハモりを重ねた。|{a}と{b}は、懐かしいアニメの主題歌を最後まで歌った。|{a}は{b}に「下手だね｜下手だな｜下手ですね」と言われて、もっと大きな声で歌った。'),
E('r_hair','romance','p+','np*.3+att/60','att>25','ab:att5;ba:att5','{a}は{b}の乱れた髪を、指で整えてやった。|{a}は{b}に頼まれて、髪を三つ編みにした。|{a}は{b}の後頭部の寝癖を、手のひらで押さえた。|{a}は{b}の前髪が目にかかっているのを、そっと払った。|{a}は{b}の髪に指を通して「伸びたね｜伸びたな｜伸びましたね」と言った。|{a}は{b}に、自分の髪を結ばせた。'),
E('r_breath','romance','p','att/40','att>40&rroom>0','ab:att6','{a}は{b}の吐息がかかる距離にいることに、気づいてしまった。|{a}は{b}の匂いを、深く吸い込んでいる自分に気づいた。|{a}は{b}の首筋の脈が、速くなっているのを見た。|{a}は{b}の唇が乾いているのを、じっと見ていた。|{a}は{b}の喉が動くのを、目で追っていた。|{a}は{b}の体温が、服越しに伝わってくるのを感じていた。'),
E('r_guess','bond','p+','a*.3+fc*.3','','ab:trust3;ba:trust3','{a}と{b}は、この部屋を作った人間の目的を推理した。|{a}は{b}と、自分たちが選ばれた理由を考えた。|{a}と{b}は、外では今頃何が起きているかを想像した。|{a}は{b}に「これ、誰かの夢の中なんじゃない？｜これは、誰かの夢の中なんじゃないか｜これ、誰かの夢の中なんじゃないですか？」と言った。|{a}と{b}は、同じ部屋に閉じ込められた他の誰かがいるかもしれないと話した。|{a}は{b}と、黒幕がどんな顔をしているか想像した。'),
E('r_backrub','help','p+','np*.5+att/80','','ba:aff5,att3;bs:-6','{a}は{b}の凝った肩を揉んだ。|{a}は{b}の背中をさすって、呼吸を落ち着かせた。|{a}は{b}の冷えた足を、自分の手で温めた。|{a}は{b}のこめかみを、指でゆっくり押した。|{a}は{b}の手のひらのツボを押して「効く？｜効くか｜効きますか？」と訊いた。|{a}は{b}の背中に寄りかからせて、自分が壁になった。'),
E('r_shame','solo','s+','ac*.5+rroom*.3','rroom>0','as:6','{a}はさっきの自分の行動を思い出して、顔を覆った。|{a}は誰とも目を合わせられなくなった。|{a}は「今のは忘れて｜今のは忘れろ｜今のは忘れてください」と小さく言った。|{a}は耳まで真っ赤になって、膝に顔を埋めた。|{a}は自分の声が思ったより大きかったことに気づいて、口を塞いだ。|{a}は監視カメラの存在を思い出して、床に突っ伏した。'),
E('r_lighthearted','bond','p+','fc*.5+cold*.2','rroom>0','ab:aff3,ten-3;ba:aff3,ten-3','{a}は「もう、こうなったら楽しんだもん勝ち｜もう、こうなったら楽しんだ者の勝ちだ｜もう、こうなったら楽しんだもの勝ちです」と{b}に笑った。|{a}は条件の紙を指さして「これ書いた人、絶対モテない｜これを書いた奴は、絶対モテない｜これを書いた人、絶対モテません」と言った。|{a}は{b}に「出たらこの話、一生ネタにしようね｜出たらこの話、一生ネタにしような｜出たらこの話、一生ネタにしましょうね」と言った。|{a}は深刻な顔の{b}の頬を、指でつついた。|{a}は{b}に「深呼吸。はい、もう一回｜深呼吸だ。もう一回だ｜深呼吸。はい、もう一回です」と、なぜかラジオ体操を始めた。|{a}は{b}に、条件の言い方を変えたら面白くなる遊びを提案した。'),
E('r_boundary','help','p+','np*.4+a*.3','rroom>0','ba:trust8;ab:trust4','{a}は床にテープの代わりに上着を置いて「ここから先は入らない｜＝｜ここから先は入りません」と線を引いた。|{a}は{b}に、嫌なことをされたら合言葉を言うように決めた。|{a}は{b}に「急がなくていいよ｜急がなくていい｜急がなくていいですよ」と三回言った。|{a}は{b}と背中合わせに座って、互いの顔が見えないようにした。|{a}は{b}に「あなたが決めたことなら、どっちでもついていく｜あなたが決めたことなら、どちらでもついていく｜あなたが決めたことなら、どちらでもついていきます」と言った。|{a}は{b}のために、部屋の隅に一人になれる場所を作った。'),
E('r_memory_touch','romance','p+','att/50+honesty*.2','att>30','ab:att4,trust4;ba:att4,trust4','{a}は{b}に、初めて会った日のことを覚えているかと訊いた。|{a}は{b}に、前に一度だけ手が触れたことがあると言った。|{a}は{b}に、あの日言えなかったことを話した。|{a}は{b}に、ずっと気になっていたあの言葉の意味を訊いた。|{a}は{b}と、二人だけの昔の思い出を話した。|{a}は{b}に「あなた、昔より笑うようになったね｜あなたは、昔より笑うようになった｜あなた、昔より笑うようになりましたね」と言った。'),
E('r_challenge','conflict','p+','cp*.4+fc*.3','rroom>0','ab:att3,ten3;ba:att3,ten3','{a}は{b}に「先に照れた方の負け｜先に照れた方の負けだ｜先に照れた方の負けです」と言った。|{a}は{b}に「どうせあなたからは来ない｜＝｜どうせあなたからは来ません」と挑発した。|{a}は{b}に「怖いの？｜怖いのか｜怖いんですか？」と言った。{b}は「誰が｜＝｜誰がですか」と言い返した。|{a}は{b}と、どちらが先に目を逸らすか勝負した。|{a}は{b}に「主導権は渡さない｜＝｜主導権は渡しません」と言った。|{a}は{b}に「あなたに任せたら一生終わらない｜＝｜あなたに任せたら一生終わりません」と言った。'),
E('r_cold_feet','solo','s+','caution*.4+ac*.3','rroom>0','as:5','{a}は覚悟を決めたはずなのに、いざとなると手が震えた。|{a}は「やっぱり、もう少しだけ待って｜やはり、もう少しだけ待て｜やっぱり、もう少しだけ待ってください」と言った。|{a}は相手に触れる直前で、手を引っ込めた。|{a}は自分が何を怖がっているのか、分からなくなった。|{a}は深呼吸を十回して、それでも動けなかった。|{a}は「ごめん｜すまない｜すみません」と言って、壁の方を向いた。'),
E('r_drink_share','bond','p+','np*.3+fc*.3','B.drunk>20','ab:aff3;ba:aff4','{a}は酔った{b}に、水を口元まで運んでやった。|{a}は{b}と、残りの杯を半分ずつ分け合った。|{a}は{b}の酔った話を、根気よく聞いた。|{a}は{b}に「次の一杯は私が｜＝｜次の一杯は私が出します」と言った。|{a}は{b}と乾杯して、一気に飲み干した。|{a}は{b}が飲めない分を、黙って引き受けた。'),
E('r_spicy_help','help','p+','np*.5','B.stress>40','ba:aff5,trust5;bs:-5','{a}は辛さに悶える{b}に、自分の水を渡した。|{a}は{b}の分のラーメンを、半分引き受けた。|{a}は{b}の背中をさすりながら「あと少し｜＝｜あと少しです」と励ました。|{a}は{b}の額の汗を、袖で拭った。|{a}は{b}に、辛さを和らげる方法を教えた。|{a}は{b}が食べ終わるまで、隣で応援し続けた。'),
E('r_pill_talk','bond','p+','honesty*.4+a*.2','stress>30','ab:trust5;ba:trust5','{a}は錠剤のせいか、{b}に聞かれてもいない本音を話し始めた。|{a}は{b}に、子どもの頃の一番怖かった記憶を話した。|{a}は{b}に、今まで誰にも言えなかった失敗を話した。|{a}は{b}に、なぜ自分がこの部屋にいるのか分かる気がすると言った。|{a}は{b}に、誰かを傷つけた過去を打ち明けた。|{a}は{b}の手を握って「ずっと言いたかったんだけど｜ずっと言いたかったんだが｜ずっと言いたかったんですけど」と話し始めた。'),
E('r_light_play','bond','g','fc*.5','','gab:aff2','{a}は照明の明るさが変わるたびに、効果音をつけた。|{a}は照明に向かって手を振り続けた。|{a}は壁の影で、即興の影絵芝居を始めた。|{a}は部屋の角を「ステージ」と呼んで、一人漫才を始めた。|{a}は照明の点滅に合わせて踊り出した。|{a}は天井に向かって「次のお題ちょうだい｜次のお題をくれ｜次のお題をください」と言った。'),
E('r_hand_in_hand','romance','p','att/40+ac*.2','att>35&ratt>30','ab:att5,trust4;ba:att5,trust4','{a}と{b}は、どちらからともなく手を繋いでいた。|{a}は{b}の手を、離すタイミングを失っていた。|{a}は{b}と繋いだ手を、ポケットに入れた。|{a}は{b}の指の一本一本を、確かめるように握った。|{a}と{b}は、繋いだ手を見つめて、同時に笑った。|{a}は{b}の手の甲に、親指で円を描いた。'),
E('r_rule_rage','conflict','s','cp*.5+aggr*.3','rroom>0','gab:ten2;as:-3','{a}は「人の気持ちを何だと思ってるの｜人の気持ちを何だと思っている｜人の気持ちを何だと思っているんですか」と天井に向かって怒鳴った。|{a}は条件の紙を、拳で何度も叩いた。|{a}は「私はこんな条件、絶対に従わない｜＝｜私はこんな条件、絶対に従いません」と宣言した。|{a}は黒幕への怒りで、体が震えていた。|{a}は紙に書かれた文字を、ペンで塗り潰そうとした。|{a}は「出たら、私がこれを作った奴を見つけ出す｜＝｜出たら、私がこれを作った人を見つけ出します」と言った。'),
E('r_misunderstand','conflict','p+','impulse*.3+.15','','ab:ten4;ba:ten5','{a}が何気なく触れた手を、{b}は別の意味に受け取った。|{a}の冗談を、{b}は本気にした。|{a}の沈黙を、{b}は拒絶だと思った。|{a}の「大丈夫｜大丈夫だ｜大丈夫です」を、{b}は信じなかった。|{a}が距離を取ったのを、{b}は嫌われたと思った。|{a}の優しさを、{b}は同情だと受け取った。'),
E('r_deep_trust','bond','p+','honesty*.3+trust/50','trust>35','ab:trust6,aff4;ba:trust6,aff4','{a}は{b}に「あなたとなら、どこに閉じ込められても大丈夫な気がする｜＝｜あなたとなら、どこに閉じ込められても大丈夫な気がします」と言った。|{a}は{b}の前でだけ、本当の顔を見せられた。|{a}は{b}に、一番弱いところを見せた。|{a}は{b}の隣でなら、眠れた。|{a}は{b}に、自分のすべてを預けてもいいと思った。|{a}は{b}に「出ても、隣にいていい？｜出ても、隣にいていいか｜出ても、隣にいていいですか？」と訊いた。'),
E('r_odd_food','bond','g','fc*.4+np*.2','step>=2','gab:aff2','差し入れ口から出てきたのは、なぜか高級なショートケーキだった。{a}は皆に切り分けた。|{a}は差し入れられた弁当の中身を、皆で平等に分けた。|{a}は差し入れのカップ麺に、お湯がないことに気づいて嘆いた。|{a}は差し入れられたチョコレートを、一粒ずつ配った。|{a}は差し入れのお茶のパックで、即席のお茶会を開いた。|{a}は差し入れに添えられたメッセージカードを、声に出して読んだ。'),
E('r_photo_frame','solo','s+','a*.3+np*.3','','as:3','{a}は部屋の隅で、自分たちの写真が入った写真立てを見つけた。|{a}は壁に、自分の幼い頃の写真が貼られているのに気づいた。|{a}は差し入れの中に、自分の家の鍵が入っていることに気づいた。|{a}は部屋のどこかから、自分の好きな曲が流れてくるのを聞いた。|{a}は自分のことを知りすぎている誰かの存在に、背筋が寒くなった。|{a}は差し入れのお菓子が、自分の好物ばかりなことに気づいた。'),
E('r_lie_down','romance','p','att/50+stress/150','att>30','ab:att4;ba:att3','{a}は{b}の隣に寝転んで、天井を見上げた。肩と肩が触れていた。|{a}は{b}の腕を枕にして、目を閉じた。|{a}は{b}と並んで寝転び、同じ照明の染みを見ていた。|{a}は{b}の胸の上下する音を、聞いていた。|{a}は{b}の寝顔を、すぐ横で見ていた。|{a}は{b}の方に寝返りを打って、目が合った。'),
E('r_forgive_self','solo','s+','np*.3+a*.3','stress>45','as:-8','{a}は「誰も悪くない｜＝｜誰も悪くないです」と自分に言い聞かせた。|{a}はここで起きたことを、全部受け入れようと思った。|{a}はもう一度、深く息を吸った。|{a}は自分を責めるのを、少しだけやめた。|{a}は「出たら、ちゃんと笑おう｜＝｜出たら、ちゃんと笑いましょう」と思った。|{a}は自分の手を見つめて、まだ大丈夫だと思った。'),
E('r_tickle','bond','p+','fc*.6','','ab:aff3;ba:aff3','{a}は{b}の脇腹をくすぐって、逃げ回られた。|{a}は{b}に羽根でくすぐり攻撃をした。|{a}と{b}は、くすぐり合って床を転げ回った。|{a}は{b}の足の裏をくすぐって、蹴られた。|{a}は{b}の首筋に息を吹きかけて、悲鳴を上げさせた。|{a}は{b}と、どちらがくすぐりに強いか勝負した。'),
E('r_stare','romance','p+','att/50+fc*.2','att>25','ab:att5;ba:att5','{a}は{b}と、何も言わずに見つめ合った。先に笑ったのは{b}だった。|{a}は{b}の瞳の色が、思っていたより明るいことに気づいた。|{a}は{b}の睫毛の長さを、間近で見た。|{a}は{b}の目の奥に、自分が映っているのを見た。|{a}は{b}の顔を、両手で挟んで覗き込んだ。|{a}は{b}に「なんで見てるの｜なぜ見ているんだ｜なぜ見ているんですか」と訊かれて「見たいから｜見たいからだ｜見たいからです」と答えた。'),
E('r_spirit','help','g','lead*.4+np*.3','n>1','gab:trust3;as:-3','{a}は「まだ時間はある。一個ずつやろう｜まだ時間はある。一つずつやろう｜まだ時間はあります。一つずつやりましょう」と言った。|{a}は皆に、今できることを一つずつ挙げさせた。|{a}は弱音を吐く誰かの肩を叩いて「大丈夫｜大丈夫だ｜大丈夫です」と言った。|{a}は条件を満たすための「作戦会議」を開いた。|{a}は皆の役割を決めて、部屋の空気を変えた。|{a}は「全員でここを出る｜＝｜全員でここを出ます」と宣言した。'),
E('r_kiss_cheek','romance','p','att/40+fc*.3','att>40&ratt>30','ab:att6;ba:att7','{a}は{b}の頬に、不意打ちで唇を寄せた。|{a}は{b}の額に、そっと口づけた。|{a}は{b}の手の甲に、騎士のように唇を当てた。|{a}は{b}の髪に、顔を埋めた。|{a}は{b}の耳たぶに、小さく唇を触れた。|{a}は{b}の指先に、唇を押し当てた。'),
E('r_after_glow','romance','p','att/40+trust/80','couple>0','ab:att5,aff5;ba:att5,aff5','{a}は{b}の指を絡めたまま「後悔してない？｜後悔していないか｜後悔していませんか？」と訊いた。|{a}と{b}は、少し照れくさそうに並んで座っていた。|{a}は{b}の肩に頭を乗せて、目を閉じた。|{a}は{b}に「次は、ちゃんとした場所で｜＝｜次は、ちゃんとした場所で」と言った。|{a}と{b}は、互いの顔を見て吹き出した。|{a}は{b}の頬に残った赤みを、指でなぞった。'),
E('r_drink_refuse','conflict','p+','cp*.4+caution*.4','B.aphro>0','ab:ten4;ba:ten4','{a}は「もう飲まないで｜もう飲むな｜もう飲まないでください」と{b}の手から瓶を取り上げた。|{a}は{b}が次の一本に手を伸ばすのを、腕を掴んで止めた。|{a}は{b}に「自分の体のことを考えて｜自分の体のことを考えろ｜自分の体のことを考えてください」と怒鳴った。|{a}は{b}の分を、自分が引き受けると言い張った。|{a}は{b}に「これ以上はダメ｜これ以上はダメだ｜これ以上はダメです」と言って、瓶を隠した。|{a}は{b}に「無理しすぎだよ｜無理しすぎだ｜無理しすぎです」と言って、隣に座り込んだ。'),
E('r_strange_calm','bond','p+','a*.3+warmth*.3','step>=4','ab:trust4;ba:trust4','{a}は{b}と、この部屋での時間が少しだけ心地よくなっていることに気づいた。|{a}は{b}に「外より、ここの方が素直になれる｜＝｜外より、ここの方が素直になれます」と言った。|{a}は{b}と、何もない部屋で笑い合った。|{a}は{b}と、時間を忘れて話していた。|{a}は{b}に「もう少しだけ、このままでもいい｜＝｜もう少しだけ、このままでもいいです」と言った。|{a}は{b}と、出られなくてもいいかと思った瞬間があった。'),
E('r_survival','solo','s+','a*.4+caution*.3','step>=3','as:-2','{a}は水と食料の残りを確認して、配分を考えた。|{a}は体力を温存するために、なるべく動かないようにした。|{a}は睡眠の順番を決めようと提案した。|{a}は部屋の温度の変化を、記録し始めた。|{a}はトイレの使い方のルールを作った。|{a}は誰かが倒れたときのために、毛布を一枚取っておいた。'),
E('r_whisper','romance','p','att/50+honesty*.2','att>35','ab:att5;ba:att6','{a}は{b}の耳元で、カメラに聞こえないように何かを囁いた。|{a}は{b}に、二人だけの秘密を小声で話した。|{a}は{b}の耳に唇を寄せて「本当はね｜本当はな｜本当はですね」と言った。|{a}は{b}に、聞こえるか聞こえないかの声で名前を呼んだ。|{a}は{b}に囁いた言葉を、もう一度言ってと頼まれた。|{a}は{b}の耳元で「ここを出たら、言いたいことがある｜＝｜ここを出たら、言いたいことがあります」と言った。'),
E('r_rival_pair','conflict','p','jealous*.6+att/80','att>35&n>2','ab:ten5;as:6;jea','{a}は{b}が別の誰かと条件を満たそうとしていることに、気づいてしまった。|{a}は{b}と別の誰かが話し込むのを、黙って見ていた。|{a}は{b}の隣にいる別の誰かを、睨んだ。|{a}は{b}が別の誰かに笑いかけるのを見て、拳を握った。|{a}は{b}が自分を選ばなかったことに、傷ついていた。|{a}は{b}の相手が自分でないことを、受け入れられなかった。'),
E('r_finally_laugh','bond','g','fc*.4+np*.3','step>=2','gab:aff3,ten-2;as:-5','誰かの腹の虫が鳴って、{a}が最初に吹き出した。|{a}のくしゃみが妙に可愛くて、皆が笑った。|{a}が転んで、部屋中に笑い声が響いた。|{a}がしりとりで「ん」で終わって、皆に責められた。|{a}は自分の寝言を指摘されて、笑ってごまかした。|{a}が真顔で言った一言が、なぜか全員のツボに入った。'),
E('r_hand_warm','help','p+','np*.4+warmth*.3','','ba:aff4,trust4','{a}は{b}の手を取って、息を吹きかけて温めた。|{a}は{b}の手を、自分の脇の下に挟ませた。|{a}は{b}の両手を、自分の両手で包んだ。|{a}は{b}に「手、冷たいね｜手が冷たいな｜手、冷たいですね」と言って離さなかった。|{a}は{b}の手を、自分の首筋に当てさせた。|{a}は{b}の手をこすって、温まるまで待った。'),
E('r_condition_joke','bond','p+','fc*.4+a*.2','','ab:aff3;ba:aff3','{a}は{b}に「この紙、誤字ってない？｜この紙、誤字っていないか｜この紙、誤字っていませんか？」と真顔で言った。|{a}は{b}と、条件の文言を勝手に書き換える妄想をした。|{a}は{b}に「これが『しりとりしないと出られない部屋』だったら楽だった｜＝｜これが『しりとりしないと出られない部屋』だったら楽でした」と言った。|{a}は{b}と、もっとひどい条件を考える遊びをした。|{a}は{b}に「この部屋の評価、星いくつ？｜この部屋の評価は、星いくつだ｜この部屋の評価、星いくつですか？」と訊いた。|{a}は{b}と、黒幕へのクレームの文面を考えた。')
]);
})();
});
;
/* ==== js/pair-name.js ==== */
HK.Load.def(174,'js/pair-name.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK)return;
function who(res,i){
var c=(res.input&&res.input.chars&&res.input.chars[i])||{},r=(res.chars&&res.chars[i])||{};
return{i:i,name:r.name||c.name||String(i),gender:c.gender||'',pos:c.pos||'',likes:c.likes||'',futa: !!c.futa,posFor:c.posFor&&typeof c.posFor==='object'?c.posFor:null,topLv:c.topLv||'',tr:r.tr||{}};
}
function lean(c){
var t=c.tr||{};
return(t.cp||0)*0.4+(t.lead||0)*0.3+(t.aggr||0)*0.3-(t.ac||0)*0.35+(t.cold||0)*0.1;
}
function decided(A,B){
var P=HK.Pos;
if(!P|| !P.orients)return null;
var os=P.orients(A,B);
if(!os.length)return P.hardTop(B,A)&& !P.hardTop(A,B)?[B,A]:P.hardTop(A,B)?[A,B]:null;
if(os.length===1)return os[0];
var pr=P.prefer?P.prefer(A,B):null;
if(pr)return pr;
var pa=P.of(A,B),pb=P.of(B,A);
if(pa==='riba'&&pb==='riba')return null;
if(pa==='top'&&pb!=='top')return[A,B];
if(pb==='top'&&pa!=='top')return[B,A];
if(pa==='bottom'&&pb!=='bottom')return[B,A];
if(pb==='bottom'&&pa!=='bottom')return[A,B];
if(pa==='bottom'&&pb==='bottom'&& !!P.explicit(A,B)!== !!P.explicit(B,A))return P.explicit(A,B)?[B,A]:[A,B];
if(pa===pb&&(pa==='top'||pa==='bottom')){
var la=lean(A),lb=lean(B);
return la>lb+0.001?[A,B]:lb>la+0.001?[B,A]:(A.name<B.name?[A,B]:[B,A]);
}
return null;
}
HK.pairIdx=function(res,p){
var a=p&&p.a,b=p&&p.b;
if(a==null||b==null|| !res)return[a,b];
var lo=Math.min(a,b),hi=Math.max(a,b);
if(!res.input|| !res.input.chars|| !res.input.chars[hi])return[lo,hi];
var d=decided(who(res,lo),who(res,hi));
return d?[d[0].i,d[1].i]:[lo,hi];
};
HK.pairName=function(res,p,sep){
var o=HK.pairIdx(res,p),C=(res&&res.chars)||[];
var n=function(i){return(C[i]&&C[i].name)||'';};
return n(o[0])+(sep==null?'×':sep)+n(o[1]);
};
HK.pairOrder=function(a,b){
if(!a|| !b||a===b||a.mob||b.mob)return[a,b];
var lo=a.i!=null&&b.i!=null&&b.i<a.i?b:a,hi=lo===a?b:a;
var d=null;
try{d=decided(lo,hi);}catch(e){d=null;}
return d?[d[0],d[1]]:[a,b];
};
HK.pairNameOf=function(a,b,sep){
var o=HK.pairOrder(a,b);
return((o[0]&&o[0].name)||'')+(sep==null?'×':sep)+((o[1]&&o[1].name)||'');
};
})();
});
;
/* ==== js/incidents-room.js ==== */
HK.Load.def(309,'js/incidents-room.js',function(){
(function(){
'use strict';
var HK=window.HK,K=HK.IncSocial;
if(!K)return;
HK.INCIDENTS=HK.INCIDENTS||{};
var R=K.R,names=K.names,fav=K.fav,pointAll=K.pointAll;
HK.INCIDENTS.whiteroom=[
{
id:'aphro',from:1,
when:function(ctx){return ctx.flags.romantic&& !ctx.flags.hasAphroRule;},
w:function(){return 2.2;},
run:function(ctx){
var P=ctx.present();
ctx.incident('天井の小窓から、小瓶が一つ落ちてきた。ラベルには「媚薬。一人が飲めば、扉は少しだけ近くなる」');
var boss=ctx.most(P,function(c){return c.tr.lead+c.tr.cp*0.5;});
var meek=ctx.most(ctx.others(boss),function(o){return o.tr.ac;});
var breaker=ctx.most(P,function(c){return c.tr.cp*0.6+(c.goal.id==='noway'?0.6:0)-c.tr.fc*0.3;});
var drinker=null,how;
if(breaker.tr.cp>0.7&&breaker.goal.id==='noway'&&ctx.rng()<0.6){
ctx.act2({actors:[breaker],cat:'conflict',fx:function(){P.forEach(function(o){ctx.stress(o,10);if(o!==breaker)ctx.mod(o,breaker,{ten:o.goal.id==='quick'?12:0,trust:o.tr.np>0.5?6:0});});},
text:ctx.t('{a}は小瓶を拾い上げ、そのまま床に叩きつけた。「誰が飲むの、こんなもの｜誰が飲むか、こんなもの｜誰が飲むんですか、こんなもの」',breaker),why:breaker.name+'のCP（'+Math.round(breaker.eg.CP)+'）と目標「'+breaker.goal.label+'」'});
return;
}
if(boss.tr.cp>0.65&&boss.tr.np<0.45&&meek&&meek.tr.ac>0.6){
drinker=meek;how='forced';
ctx.act2({actors:[boss,meek],cat:'conflict',mag:15,fx:function(){ctx.mod(meek,boss,{ten:18,trust: -12,att:4});},
text:ctx.t('「あなたが飲んで｜あなたが飲め｜あなたが飲んでください」{a}は{b}に小瓶を握らせた。{b}は数秒黙ってから、蓋を開けた。',boss,meek),why:boss.name+'のCP高・NP低／'+meek.name+'のAC（'+Math.round(meek.eg.AC)+'）：断れない'});
}else{
drinker=ctx.most(P,function(c){return c.tr.np*0.45+c.tr.impulse*0.45+c.tr.cold*0.3+(c.goal.id==='quick'?0.4:0)+(c.goal.id==='respect'?0.3:0);});
how=drinker.tr.np>=Math.max(drinker.tr.impulse,drinker.tr.cold)?'np':drinker.tr.impulse>=drinker.tr.cold?'fc':'cold';
var line={np:'「誰かに飲ませるくらいなら、私が飲む｜＝｜誰かに飲ませるくらいなら、私が飲みます」{a}はそう言って小瓶を空けた。',fc:'「どうせなら試してみたいでしょ｜どうせなら試してみたいだろう｜どうせなら試してみたいでしょう」{a}は止める間もなく一息に飲み干した。',cold:'「効率の問題だよ｜効率の問題だ｜効率の問題です」{a}は表情も変えずに小瓶を傾けた。'}[how];
ctx.act2({actors:[drinker],cat:'romance',mag:10,text:ctx.t(line,drinker),why:drinker.name+'の'+{np:'NP（自分が引き受ける）',fc:'衝動性（FC高・A低）',cold:'ドライさ（A高・NP低）'}[how]});
}
drinker.flags.aphro=true;
drinker.tr.impulse=HK.clamp(drinker.tr.impulse+0.25);
drinker.tr.honesty=HK.clamp(drinker.tr.honesty+0.2);
ctx.stress(drinker,18);
ctx.k=1;ctx._touched={};
ctx.others(drinker).forEach(function(o){ctx.mod(drinker,o,{att:16});});
ctx.say({text:'飲んでから十五分ほどして、'+drinker.name+'の呼吸が浅くなり、頬が赤く染まってきた。'});
ctx.others(drinker).forEach(function(o){
var r=R(ctx,o,drinker);
if(o.tr.np>0.55)ctx.act2({actors:[o,drinker],cat:'help',fx:function(){ctx.mod2(o,drinker,{att:3},{trust:14,aff:8});},
text:ctx.t('{a}は水を汲んで{b}に渡し、手の届かない距離に座り直した。「辛かったら言って｜辛かったら言え｜辛かったら言ってください」',o,drinker),why:o.name+'のNP：相手の意思を待つ'});
else if(r.att>35)ctx.act2({actors:[o,drinker],cat:'romance',fx:function(){ctx.mod2(o,drinker,{att:10},{att:6});},
text:ctx.t('{a}は、潤んだ目の{b}から視線を外せなくなっていた。',o,drinker),why:o.name+'の元々の惹かれ（'+Math.round(r.att)+'）'});
else if(o.tr.cp>0.6&&how==='fc')ctx.act2({actors:[o,drinker],cat:'conflict',fx:function(){ctx.mod(o,drinker,{ten:8});},
text:ctx.t('「考えなしに飲むからだよ｜考えなしに飲むからだ｜考えなしに飲むからです」{a}は壁際から動かなかった。',o,drinker),why:o.name+'のCP'});
});
}
},
{
id:'point',label:'一番気になる人を同時に指さす',from:1,min:2,
run:function(ctx){
ctx.incident('新しい紙が差し込まれた。「この部屋で一番好きな人を、同時に指させ」');
pointAll(ctx,ctx.present().filter(function(c){return c.flags.cagePair==null;}),'','追加ルール');
}
},
{
id:'camera',from:1,
run:function(ctx){
var P=ctx.present(),finder=ctx.most(P,function(c){return c.tr.a;});
ctx.act2({actors:[finder],cat:'escape',text:ctx.t('{a}が、照明の縁に小さなレンズを見つけた。この部屋は見られている。',finder),why:finder.name+'のA（観察力）'});
P.forEach(function(c){
if(c.tr.ac>0.6)ctx.act2({actors:[c],cat:'solo',fx:function(){ctx.stress(c,15);},text:ctx.t('{a}は膝を抱えてレンズに背を向けた。',c),why:c.name+'のAC：見られることへの羞恥'});
else if(c.tr.cp>0.65)ctx.act2({actors:[c],cat:'conflict',fx:function(){ctx.stress(c,8);},text:ctx.t('{a}はレンズを睨みつけ、靴で叩き割ろうとした。届かなかった。',c),why:c.name+'のCP：理不尽への怒り'});
else if(c.tr.fc>0.65){
var pal=ctx.most(ctx.others(c).filter(function(o){return o.tr.ac<=0.6&&(o.tr.fc>0.5||o.tr.warmth>0.55||ctx.R(o,c).aff>25);}),function(o){return o.tr.fc*0.5+o.tr.warmth*0.3+ctx.R(o,c).aff/100;});
var duo=pal?ctx.pick(['{a}はレンズに向かってピースした。「どうせ見てるなら｜どうせ見ているなら｜どうせ見ているのでしたら」――{b}もすかさず隣に並んで、二人でピースした。','{a}はレンズに向かってピースした。{b}が横から顔を出して、ダブルピースで割り込んだ。','{a}は{b}の腕を引っぱって、二人でレンズに向かってピースした。「盛れてる？｜盛れているか｜盛れていますか？」','{a}と{b}は、レンズの前で指ハートを半分ずつ作って、くっつけた。']):'';
ctx.act2({actors:pal?[c,pal]:[c],cat:'bond',fx:function(){ctx.others(c).forEach(function(o){ctx.stress(o,-5);ctx.mod(o,c,{aff:3});});if(pal)ctx.mod2(c,pal,{aff:5},{aff:5});},text:pal?ctx.t(duo,c,pal):ctx.t('{a}はレンズに向かってピースした。「どうせ見てるなら｜どうせ見ているなら｜どうせ見ているのでしたら」',c),why:c.name+'のFC'+(pal?'。'+pal.name+'も乗った（FC・人懐こさ）':'')});
}
});
}
},
{
id:'tray',min:2,
run:function(ctx){
var P=ctx.present();
ctx.incident('差し入れ口から、食事のトレイが一つだけ出てきた。');
var giver=ctx.most(P,function(c){return c.tr.np-c.tr.cold*0.4;});
var taker=ctx.most(P,function(c){return c.tr.aggr+c.tr.cold*0.5;});
var splitter=ctx.most(P,function(c){return c.tr.a;});
if(taker.tr.aggr>0.65&&taker!==giver&&ctx.rng()<0.6){
ctx.act2({actors:[taker],cat:'conflict',fx:function(){ctx.others(taker).forEach(function(o){ctx.mod(o,taker,{ten:8,aff: -4});});},text:ctx.t('{a}がトレイを引き寄せ、黙って食べ始めた。',taker),why:taker.name+'の攻撃性・ドライさ'});
}else if(giver.tr.np>0.6){
var to=ctx.most(ctx.others(giver),function(o){return o.stress+R(ctx,giver,o).aff;});
ctx.act2({actors:[giver,to],cat:'help',fx:function(){ctx.mod(to,giver,{aff:10,trust:10,att:4});},text:ctx.t('{a}はトレイをそのまま{b}の前に置いた。「先に食べて｜先に食べろ｜先に食べてください」',giver,to),why:giver.name+'のNP'});
}else{
ctx.act2({actors:[splitter],cat:'help',fx:function(){ctx.others(splitter).forEach(function(o){ctx.mod(o,splitter,{trust:5});});},text:ctx.t('{a}がパンを等分に割った。端の大きさまで揃えて。',splitter),why:splitter.name+'のA'});
}
}
},
{
id:'blackout',from:1,min:2,
run:function(ctx){
var P=ctx.present();
ctx.incident('照明が落ちた。完全な暗闇。');
var reach=ctx.most(P,function(c){return c.tr.impulse+(c.flags.aphro?0.4:0);});
var tg=fav(ctx,reach,P,15);
if(tg)ctx.act2({actors:[reach,tg],cat:'romance',fx:function(){ctx.mod2(reach,tg,{att:8},{att:R(ctx,tg,reach).att>25?10:0,ten:R(ctx,tg,reach).att>25?0:8});},
text:ctx.t('暗闇の中で、{a}の手が{b}の手を探り当てた。'+(R(ctx,tg,reach).att>25?'{b}は振りほどかなかった。':'{b}はびくりと身を引いた。'),reach,tg),why:reach.name+'の衝動性。'+tg.name+'の側の惹かれ（'+Math.round(R(ctx,tg,reach).att)+'）'});
var scared=ctx.most(ctx.others(reach),function(o){return o.tr.ac+o.stress/100;});
var near=scared&&ctx.closest(scared);
if(scared&&near&&scared.tr.ac>0.55)ctx.act2({actors:[scared,near],cat:'bond',fx:function(){ctx.mod2(scared,near,{trust:8,att:5},{att:3});},text:ctx.t('{a}は手探りで{b}の服の裾を掴み、明かりが戻るまで離さなかった。',scared,near),why:scared.name+'のAC'});
var calm=ctx.most(P,function(c){return c.tr.a-c.tr.ac*0.3;});
if(calm&&calm.tr.a>0.65)ctx.act2({actors:[calm],cat:'escape',text:ctx.t('{a}は暗闇のあいだ、壁に耳を当てて、外の物音を聞いていた。',calm),why:calm.name+'のA'});
}
},
{
id:'shrink',from:2,
run:function(ctx){
var P=ctx.present();
ctx.incident('低い駆動音。壁が、少しずつ内側へ迫ってくる。');
ctx.k=1;ctx._touched={};
P.forEach(function(a){ctx.stress(a,14);P.forEach(function(b){if(a!==b)ctx.mod(a,b,{att:4});});});
var panic=ctx.most(P,function(c){return c.tr.ac+c.tr.impulse*0.5;});
var lead=ctx.most(ctx.others(panic),function(o){return o.tr.lead;});
ctx.act2({actors:[panic,lead],cat:'help',fx:function(){if(lead)ctx.mod(panic,lead,{trust:10});},
text:lead?ctx.t('壁を押し返そうとする{a}の肩を、{b}が掴んだ。「止まった。もう止まってる｜止まった。もう止まっている｜止まりました。もう止まっています」',panic,lead):ctx.t('{a}は壁を押し返そうとしていた。',panic),why:panic.name+'の焦り／'+(lead?lead.name+'の主導性':'')});
}
},
{
id:'bed',from:1,min:2,
run:function(ctx){
var P=ctx.present();
ctx.incident('部屋の隅の床が開いて、ベッドが一台せり上がってきた。一台だけ。');
var best=null,bv=0;
P.forEach(function(a){P.forEach(function(b){if(a.i<b.i){var v=Math.min(R(ctx,a,b).att,R(ctx,b,a).att)+Math.min(R(ctx,a,b).trust,R(ctx,b,a).trust)*0.5;if(v>bv){bv=v;best=[a,b];}}});});
if(best&&bv>40){
ctx.act2({actors:best,cat:'romance',mag:10,fx:function(){ctx.mod2(best[0],best[1],{att:8,trust:5},{att:8,trust:5});},text:ctx.t('結局、ベッドは{a}と{b}が使った。背中合わせで、どちらも眠らなかった。',best[0],best[1]),why:'互いの惹かれと信頼'});
return;
}
var giver=ctx.most(P,function(c){return c.tr.np;}),claim=ctx.most(P,function(c){return c.tr.cp+c.tr.cold*0.5;});
if(claim.tr.cp>0.65&&claim.tr.np<0.5)ctx.act2({actors:[claim],cat:'conflict',fx:function(){ctx.others(claim).forEach(function(o){ctx.mod(o,claim,{ten:6});});},text:ctx.t('{a}は当然のようにベッドに腰を下ろした。',claim),why:claim.name+'のCP高・NP低'});
else ctx.act2({actors:[giver],cat:'help',fx:function(){ctx.others(giver).forEach(function(o){ctx.mod(o,giver,{aff:5});});},text:ctx.t('{a}は「床で平気｜床で平気だ｜床で平気です」と言って、ベッドを譲った。',giver),why:giver.name+'のNP'});
}
},
{
id:'memory',from:2,min:2,
run:function(ctx){
var P=ctx.present(),t=ctx.rng.pick(P);
ctx.incident('壁一面にスクリーンが浮かび、'+t.name+'の過去の映像が流れ始めた。誰にも話していなかった頃のこと。');
ctx.act2({actors:[t],cat:'solo',fx:function(){ctx.stress(t,22);},text:ctx.t(t.tr.cp>0.6?'{a}は唇を噛んで、自分の過去の映像から最後まで目を逸らさなかった。':'{a}は自分の過去が映し出されるのに耐えられず、途中で顔を覆った。',t),why:t.name+'の'+(t.tr.cp>0.6?'CP（弱みを見せない）':'AC')});
ctx.others(t).forEach(function(o){
if(o.tr.np>0.6)ctx.act2({actors:[o,t],cat:'help',fx:function(){ctx.mod2(o,t,{aff:5,att:3},{trust:12,aff:8});},text:ctx.t('映像が終わると、{a}は何も訊かずに{b}の隣に座った。',o,t),why:o.name+'のNP'});
else if(o.tr.jealous>0.6||o.tr.cold>0.65)ctx.act2({actors:[o,t],cat:'conflict',fx:function(){ctx.mod2(o,t,{trust: -6},{ten:8});},text:ctx.t('映像を見たあと、{a}は{b}を見る目を少し変えた。',o,t),why:o.name+'の'+(o.tr.jealous>0.6?'疑い深さ':'ドライさ')});
else ctx.act2({actors:[o,t],cat:'bond',fx:function(){ctx.mod(o,t,{trust:4,att:2});},text:'',why:''});
});
}
},
{
id:'clock',from:2,
run:function(ctx){
ctx.incident('壁の時計の針が、急に速く回り始めた。残り時間が削られていく。');
ctx.present().forEach(function(c){c.stress=HK.clamp(c.stress+18,0,100);});
var c=ctx.most(ctx.present(),function(x){return x.tr.a;});
ctx.act2({actors:[c],cat:'escape',text:ctx.t('{a}だけが、針の速さから残り時間を計算していた。',c),why:c.name+'のA'});
}
}
];
})();
});
;
HK.Load.def(309.5,'tone:scen-whiteroom',function(){
HK.Load.toneData("mixed",{"F":[
["……今回だけ。それに、〈〉が隣にいるなら","……今回だけですよ。それに、〈〉さんが隣にいるなら",1],
["聞こえてるなら返事して","聞こえてるなら返事してください。ねえってば",1]],
"O":{
"全員でここを出る":"全員でここを出ましょう。置いてくなんてなしだよ",
"好きな食べ物って何？":"好きな食べ物って何ですか？　教えてよ",
"…今。この状況":"…今です。この状況、そのものだよ",
"止まった。もう止まってる":"止まりました。もう止まってるって",
"誰が飲むか、こんなもの":"誰が飲むもんですか、こんなもの。絶対いやだって",
"動物で例えたら、自分は何だと思う？":"動物で例えたら、自分は何だと思います？",
"もうちょっといる":"もうちょっといます。帰りたくないし",
"私はこんなものに従う気はない":"私、こんなものに従う気はないです。誰が決めたの、これ",
"ごめん。それは、まだ言えない":"すみません。それは、まだ言えない",
"話し合ってたら日が暮れる":"話し合ってたら日が暮れますよ。さっさと決めよ",
"私、こういうのは一人とだけって決めてる":"私、こういうのは一人とだけって決めてるんです",
"さっきのも一回に入る？":"さっきのも一回に入ります？　ずるくない？",
"なかった。だから今もちょっと探してる":"なかったです。だから今もちょっと探してる",
"小学校の、図書室の先生":"小学校の、図書室の先生です。よく本を貸してくれたんだ",
"三人以上で同時に行った場合、参加者全員が条件を満たしたものとみなす……だって":"三人以上で同時に行った場合、全員が条件を満たしたものとみなす……だそうですよ。適当すぎない？",
"最近、いちばん笑ったことは？":"最近、いちばん笑ったことって何です？",
"録りためたドラマを一気に見る":"録りためたドラマを一気に見ます。至福だよ",
"……選択肢の一つとしては、覚えておく":"……選択肢の一つとしては、覚えておきますね",
"当ててみて。当たったら教える":"当ててみてください。当たったら教えてあげる",
"どこまでなら平気？":"どこまでなら平気です？　無理なら言ってね",
"駅で、鳩に本気で追いかけられてる人を見た":"駅で、鳩に本気で追いかけられてる人を見たんです。めっちゃ笑った",
"これ、ドッキリ番組じゃない？":"これ、ドッキリ番組じゃないですか？",
"それなら、誰も置いていかなくて済むね":"それなら、誰も置いていかなくて済みますね。よかった",
"誰かに飲ませるくらいなら、自分が飲む":"誰かに飲ませるくらいなら、私が飲みますよ。止めないでね",
"…何するつもり？":"…何するつもりですか？　ちょっと怖いんだけど",
"散歩。知らない道を歩くのが好きで":"散歩です。知らない道を歩くのが好きでさ",
"寝てる。ひたすら寝てる":"寝てます。ひたすら寝てる、それだけ",
"……ごめん、それはちょっと":"……ごめんなさい、それはちょっと無理かな",
"ふざけてる":"ふざけてますよね。笑えないんだけど",
"どっちかを選んだら、もう一人を置いていくことになる":"どっちかを選んだら、もう一人を置いていくことになります。それは嫌だな",
"嫌なら、私は他の方法を探す。時間はある":"嫌なら、私は他の方法を探します。時間はあるし",
"ずっともだよ":"ずっともですよ。約束だからね",
"どっちでもいい。決めるのはお前だ":"どっちでもいいです。決めるのはあなただよ",
"え、じゃあ一回で済むじゃん":"え、じゃあ一回で済むじゃないですか。楽じゃん",
"今、何考えてる？":"今、何考えてます？　顔に出てるよ",
"……わかった。ここで終わるよりはいい":"……わかりました。ここで終わるよりはいいよ",
"付き合ってもいない相手と、できる？":"付き合ってもいない相手と、できます？　私は迷うな",
"私は、するなら一人とだけ。それは譲れない":"私は、するなら一人とだけです。それは譲れないよ",
"同時にやったら二回分になる？":"同時にやったら二回分になります？　ならないかな",
"半分は過ぎた":"半分は過ぎました。あと少しだよ",
"本当にやるしかないのか":"本当にやるしかないんですか。ほかに道ないの？",
"どうせなら、全員と仲良くなっといた方が早くない？":"どうせなら、全員と仲良くなっといた方が早くないですか？　絶対そうだよ",
"私、初めてがこんな場所なのは嫌だ":"私、初めてがこんな場所なのは嫌です。絶対やだよ",
"人の気持ちを何だと思ってる":"人の気持ちを何だと思ってるんですか。ひどいよ",
"そっちがでかいんだよ":"そっちがでかいんですよ。私のせいじゃないし",
"考えなしに飲むからだ":"考えなしに飲むからですよ。自業自得じゃん",
"この紙、誤字ってない？":"この紙、誤字ってないですか？　ほらここ",
"私は〈〉が一番だよ。それは変わらない。……〈〉も、一緒にいてほしい":"私は〈〉が一番です。それは変わらないよ。……〈〉も、一緒にいてほしいな",
"どうせお前からは来ない":"どうせあなたからは来ないですよね。わかってるよ",
"合理的ではある":"合理的ではありますね。納得はしないけど",
"誰か見てるんだろ！":"誰か見てるんですよね！　出てきてよ！",
"止めてほしくなったら、肩を叩いて":"止めてほしくなったら、肩を叩いてください。すぐやめるから",
"まあ、そういうこともある":"まあ、そういうこともありますよ。気にしないで",
"お前に任せたら一生終わらない":"あなたに任せたら一生終わらないです。貸してよ",
"嫌になったら私がすぐ止める":"嫌になったら私がすぐ止めます。安心してね",
"今は何もしなくていい":"今は何もしなくていいです。休んでて",
"……選べない。だったら、三人で":"……選べないです。だったら、三人でいいじゃん",
"じゃあ、する？":"じゃあ、します？　私はいいよ",
"これ書いた人、絶対モテない":"これ書いた人、絶対モテないですよ。センスないもん",
"目線ください":"目線ください。こっち見てよ",
"まだ、かもしれない":"まだ、かもしれないです。わかんないけどね",
"これが『しりとりしないと出られない部屋』だったら楽だった":"これが『しりとりしないと出られない部屋』だったら楽でしたね。ほんとにさ",
"三人で、なんて絶対に無理":"三人で、なんて絶対に無理です。ありえないよ",
"見てるなら、せめて盛れてて":"見てるなら、せめて盛れててください。頼むよ",
"見てるなら出せ":"見てるなら出してください。いい加減にしてよ",
"絶対こっち見ないで":"絶対こっち見ないでください。見たら怒るよ",
"大丈夫、絶対出られる":"大丈夫です、絶対出られるよ",
"なんで私がこんな目に":"なんで私がこんな目にあうんですか。最悪だよ",
"主導権は渡さない":"主導権は渡しません。私の番だよ",
"いつまでこうしてる気だ":"いつまでこうしてる気ですか。もう飽きたよ",
"最近、泣いたのっていつ？":"最近、泣いたのっていつですか？　教えてよ",
"こんな場所だから、苛立っただけ":"こんな場所だから、苛立っただけです。ごめんね",
"…ぬいぐるみに名前つけて話しかけてる":"…ぬいぐるみに名前つけて話しかけてます。笑わないでよ",
"私はこんな条件、絶対に従わない":"私はこんな条件、絶対に従いません。誰が決めたのさ",
"お前が決めたことなら、どっちでもついていく":"あなたが決めたことなら、どっちでもついていきます。信じてるよ",
"ねえ〈〉、決め事って、たまには破ってもいいと思う":"ねえ〈〉さん、決め事って、たまには破ってもいいと思いますよ",
"……分かった。仲間外れは、させたくない":"……分かりました。仲間外れは、させたくないもん",
"これ、誰かの夢の中なんじゃない？":"これ、誰かの夢の中なんじゃないですか？　変だもん",
"私、誰とでも、ってわけじゃない":"私、誰とでも、ってわけじゃないです。そこは勘違いしないでよ",
"出たら、ちゃんと笑おう":"出たら、ちゃんと笑いましょう。約束だよ",
"出たら、私がこれを作った奴を見つけ出す":"出たら、私がこれを作った人を見つけ出します。絶対許さないよ",
"〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない":"〈〉さんが決めたことは分かってます。でも、このままじゃ〈〉さんだけ出られないよ",
"最初に言ったよね。他の人とは無理":"最初に言いましたよね。他の人とは無理だよ",
"…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと":"…ここから出られないこと、じゃないんです。出たあと、ここでのことを忘れちゃうこと",
"経験あるの？":"経験あるんですか？　意外だね",
"一人だけ置いていくのは、なしにしよう":"一人だけ置いていくのは、なしにしましょう。そんなの嫌だよ",
"私が誰にも無理強いさせない":"私が誰にも無理強いさせません。任せてよ",
"…覚えてない。泣き方を忘れたのかもしれない":"…覚えてないです。泣き方を忘れたのかもしれないね",
"次は私、絶対に誰かに代わってもらう":"次は私、絶対に誰かに代わってもらいます。もう懲りたよ",
"出たらこの話、一生ネタにしような":"出たらこの話、一生ネタにしましょうね。絶対だよ",
"…ごめん、決めてるから":"…ごめんなさい、決めてるから",
"〈〉が一人だけって決めてるのは知ってる。でも、三人なら早く出られる":"〈〉さんが一人だけって決めてるのは知ってます。でも、三人なら早く出られるよ",
"意識してんの？":"意識してるんですか？　顔赤いよ",
"ちょっと私に寄りかからせて":"ちょっと私に寄りかからせてください。疲れちゃった",
"……今のは、忘れてくれ":"……今のは、忘れてください。お願いだからさ",
"一人だけ、謝りそびれてる人がいる":"一人だけ、謝りそびれてる人がいるんです。ずっと気になってて",
"やっぱり、もう少しだけ待って":"やっぱり、もう少しだけ待ってください。心の準備がまだなんだ",
"まだ時間はある。一個ずつやろう":"まだ時間はあります。一個ずつやろうよ",
"三人の方が早く済むかもよ？":"三人の方が早く済むかもですよ？　どうする？",
"…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる":"…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れます。すごいでしょ",
"泣いても出られない":"泣いても出られないですよ。ほら、顔上げて",
"先週。映画で。動物が出てくるやつはずるい":"先週です。映画で。動物が出てくるやつはずるいよ",
"三人で、なんて……〈〉が嫌ならやめる。でも、〈〉を一人にしておけないんだ":"三人で、なんて……〈〉さんが嫌ならやめます。でも、〈〉さんを一人にしておけないんだ",
"何日かかっても、私は別の方法を探す":"何日かかっても、私は別の方法を探します。諦めないよ",
"…それ、今聞く？":"…それ、今聞きます？　空気読んでよ"}});
HK.Load.toneData("noja",{"F":[
["この紙、誤字ってない？","この紙、誤字があるのではないか？"],
["これ、誰かの夢の中なんじゃない？","これ、誰かの夢の中なのではないか？"],
["どうせなら、全員と仲良くなっといた方が早くない？","どうせなら、全員と仲良うなっておいた方が早いじゃろう？"],
["一石三鳥ってこと？","一石三鳥ということか？"],
["見てるなら、せめて盛れてて","見ておるなら、せめてよく写してたもれ"],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉が決めたことは分かっておる。じゃが、このままでは〈〉だけが出られぬではないか",1],
["どっちかを選んだら、もう一人を置いていくことになる","どちらかを選べば、もう一人を置いてゆくことになるのう",1],
["お前が決めたことなら、どっちでもついていく","おぬしが決めたことなら、どちらであろうとついてゆく",1],
["ここに来る相手が自分で、よかった？","ここに来た相手が私で、よかったか？",1],
["散歩。知らない道を歩くのが好きで","散歩じゃ。知らぬ道を歩くのが好きでのう",1],
["今は何もしなくていい","今は何もせずともよい",1],
["……選べない。だったら、三人で","……選べぬ。ならば、三人で",1],
["どうせ見てるなら","どうせ見ておるなら",1],
["喧嘩するくらいなら、三人でしよう","喧嘩するくらいなら、三人でするがよい",1],
["いつまでこうしてる気だ","いつまでこうしておる気じゃ",1],
["それは、今の状況に関係あるのか","それは、今の有様に関わりがあるのか？",1],
["もし出られなかったら、どうする","もし出られなんだら、どうするのじゃ",1],
["まあ、そういうこともある","まあ、そういうこともあるじゃろう",1],
["これを書いた奴は、絶対モテない","これを書いた者は、まずモテぬじゃろうな",1],
["まだ時間はある。一つずつやろう","まだ時間はある。一つずつやるのじゃ",1],
["誰かに飲ませるくらいなら、私が飲む","誰ぞに飲ませるくらいなら、私が飲む",1]],
"O":{
"好きな食べ物って何？":"好きな食べ物は何じゃ？",
"…今。この状況":"…今じゃ。この有様よ",
"止まった。もう止まってる":"止まったぞ。もう止まっておる",
"誰が飲むか、こんなもの":"誰が飲むか、このようなもの",
"動物で例えたら、自分は何だと思う？":"獣に例えれば、おぬしは己を何と思う？",
"もうちょっといる":"もう少しおるぞ",
"私はこんなものに従う気はない":"私は、このようなものに従う気はない",
"ごめん。それは、まだ言えない":"すまぬ。それは、まだ言えぬ",
"話し合ってたら日が暮れる":"話し合うておったら日が暮れるわ",
"私、こういうのは一人とだけって決めてる":"私は、こういうことは一人とだけと決めておる",
"さっきのも一回に入る？":"さっきのも、一回に入るのか？",
"なかった。だから今もちょっと探してる":"なかった。じゃから今も、少し探しておる",
"小学校の、図書室の先生":"手習い所の、書庫の師じゃ",
"三人以上で同時に行った場合、参加者全員が条件を満たしたものとみなす……だって":"三人以上で同時に行えば、皆が条件を満たしたとみなす……とのことじゃ",
"最近、いちばん笑ったことは？":"近頃いちばん笑うたことは？",
"録りためたドラマを一気に見る":"録りためた芝居を、一気に見るのじゃ",
"……選択肢の一つとしては、覚えておく":"……選択肢の一つとしては、覚えておくぞ",
"当ててみて。当たったら教える":"当ててみよ。当たったら教えてやろう",
"どこまでなら平気？":"どこまでなら平気じゃ？",
"駅で、鳩に本気で追いかけられてる人を見た":"駅で、鳩に本気で追われておる者を見たわ",
"これ、ドッキリ番組じゃない？":"これは、ドッキリの見世物ではないか？",
"それなら、誰も置いていかなくて済むね":"それならば、誰も置いてゆかずに済むのう",
"誰かに飲ませるくらいなら、自分が飲む":"誰ぞに飲ませるくらいなら、私が飲む"}});
HK.Load.toneData("kansai",{"F":[
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉が決めたことは分かっとる。せやけど、このままやと〈〉だけ出られへんやん",1],
["どっちかを選んだら、もう一人を置いていくことになる","どっちか選んだら、もう一人を置いていくことになるやん",1],
["どうせなら、全員と仲良くなっといた方が早くない？","どうせやったら、全員と仲良うなっといた方が早ない？",1],
["お前が決めたことなら、どっちでもついていく","あんたが決めたことやったら、どっちでもついていくで",1],
["人の気持ちを何だと思ってる","人の気持ち、何やと思うとるん",1],
["三人で、なんて……〈〉が嫌ならやめる。でも、〈〉を一人にしておけないんだ","三人で、なんて……〈〉が嫌ならやめとく。せやけど、〈〉を一人にはしとかれへんねん",1],
["ふざけてる","ふざけとる",1],
["経験あるの？","経験あるん？",1],
["本当にやるしかないのか","ほんまにやるしかあらへんのか",1],
["喧嘩するくらいなら、三人でしよう","喧嘩するくらいやったら、三人でしよ",1],
["…卵焼き。甘いやつ","…卵焼き。甘いやつがええ",1],
["散歩。知らない道を歩くのが好きで","散歩。知らん道を歩くのが好きでな",1],
["もし出られなかったら、どうする？","もし出られへんかったら、どうする？",1],
["まあ、そういうこともある","まあ、そういうこともあるわな",1],
["もう、こうなったら楽しんだもん勝ち","もう、こうなったら楽しんだもん勝ちやで",1],
["これが『しりとりしないと出られない部屋』だったら楽だった","これが『しりとりせな出られへん部屋』やったら楽やったのになあ",1],
["誰かに飲ませるくらいなら、私が飲む","誰かに飲ませるくらいやったら、私が飲むわ",1],
["せーので、出たら最初に食べたいもの","せーので言お。出たら最初に食べたいもん",1]],
"O":{
"好きな食べ物って何？":"好きな食べもん何？",
"…今。この状況":"…今や。この状況",
"止まった。もう止まってる":"止まった。もう止まっとるで",
"誰が飲むか、こんなもの":"誰が飲むか、こんなもん",
"動物で例えたら、自分は何だと思う？":"動物で例えたら、自分は何やと思う？",
"もうちょっといる":"もうちょっとおるわ",
"私はこんなものに従う気はない":"私、こんなもんに従う気あらへん",
"ごめん。それは、まだ言えない":"ごめんな。それは、まだ言われへん",
"話し合ってたら日が暮れる":"話し合ってたら日ぃ暮れるわ",
"私、こういうのは一人とだけって決めてる":"私、こういうのは一人とだけって決めてんねん",
"さっきのも一回に入る？":"さっきのも一回に入る？",
"なかった。だから今もちょっと探してる":"なかってん。せやから今もちょっと探してるわ",
"小学校の、図書室の先生":"小学校の、図書室の先生や",
"三人以上で同時に行った場合、参加者全員が条件を満たしたものとみなす……だって":"三人以上で同時にやったら、全員条件満たしたことになる……やって",
"最近、いちばん笑ったことは？":"最近いちばん笑ったことは？",
"録りためたドラマを一気に見る":"録りためたドラマ、一気に見るねん",
"……選択肢の一つとしては、覚えておく":"……選択肢の一つとしては、覚えとくわ",
"当ててみて。当たったら教える":"当ててみて。当たったら教えたるわ",
"どこまでなら平気？":"どこまでやったら平気？",
"駅で、鳩に本気で追いかけられてる人を見た":"駅で、鳩に本気で追いかけられてる人見てん",
"これ、ドッキリ番組じゃない？":"これ、ドッキリ番組ちゃう？",
"それなら、誰も置いていかなくて済むね":"それやったら、誰も置いていかんで済むな",
"誰かに飲ませるくらいなら、自分が飲む":"誰かに飲ませるくらいやったら、私が飲むわ"}});
HK.Load.toneData("mukuchi",{"F":[
["…卵焼き。甘いやつ","……卵焼き。甘いやつ"],
["ここで目が覚めたとき。…少しだけ","……ここで目が覚めたとき。少しだけ"],
["ふざけてる","……ふざけてる"],
["三人で、なんて絶対に無理","……三人は、無理"],
["嫌なら、私は他の方法を探す。時間はある","……嫌なら、他の方法を探す"],
["嫌になったら私がすぐ止める","……嫌になったら、私がすぐ止める"],
["散歩。知らない道を歩くのが好きで","……散歩。知らない道、好き"],
["私、誰とでも、ってわけじゃない","……誰とでも、じゃない"],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","……分かってる。でも、〈〉だけ出られない",1],
["どっちかを選んだら、もう一人を置いていくことになる","……どっちか選ぶと、一人置いていく",1],
["どうせなら、全員と仲良くなっといた方が早くない？","……みんなと仲良くするほうが、早い",1],
["……今回だけ。それに、〈〉が隣にいるなら","……今回だけ。……〈〉が隣なら",1],
["私は、するなら一人とだけ。それは譲れない","……するなら、一人とだけ",1],
["…自分が、何もできないまま終わること","……何もできないまま、終わること",1],
["……選べない。だったら、三人で","……選べない。……三人で",1],
["私、初めてがこんな場所なのは嫌だ","……初めてが、ここは、嫌",1],
["誰かに飲ませるくらいなら、私が飲む","……誰かに飲ませるなら、私が飲む",1]],
"O":{
"好きな食べ物って何？":"……好きな食べ物",
"…今。この状況":"……今。この状況",
"止まった。もう止まってる":"……止まった",
"誰が飲むか、こんなもの":"……飲まない",
"動物で例えたら、自分は何だと思う？":"……動物なら、何",
"もうちょっといる":"……もう少し、いる",
"私はこんなものに従う気はない":"……従わない",
"ごめん。それは、まだ言えない":"……まだ、言えない",
"話し合ってたら日が暮れる":"……日が暮れる",
"私、こういうのは一人とだけって決めてる":"……こういうのは、一人とだけ",
"さっきのも一回に入る？":"……さっきのも、一回？",
"なかった。だから今もちょっと探してる":"……なかった。今も、探してる",
"小学校の、図書室の先生":"……図書室の、先生",
"三人以上で同時に行った場合、参加者全員が条件を満たしたものとみなす……だって":"……三人以上で同時なら、全員、満たす。……だって",
"最近、いちばん笑ったことは？":"……最近、笑ったこと",
"録りためたドラマを一気に見る":"……録りためたドラマ。一気に",
"……選択肢の一つとしては、覚えておく":"……覚えておく",
"当ててみて。当たったら教える":"……当てて。当たったら、教える",
"どこまでなら平気？":"……どこまで、平気",
"駅で、鳩に本気で追いかけられてる人を見た":"……駅で、鳩に追われてる人",
"これ、ドッキリ番組じゃない？":"……ドッキリ？",
"それなら、誰も置いていかなくて済むね":"……それなら、誰も置いていかない",
"誰かに飲ませるくらいなら、自分が飲む":"……誰かに飲ませるなら、私が飲む"}});
HK.Load.toneData("polite",{"F":[
["……今回だけ。それに、〈〉が隣にいるなら","……今回だけですよ。それに、〈〉さんが隣にいるなら"],
["…何するつもり？","…何をなさるおつもりですか？"],
["…卵焼き。甘いやつ","…卵焼きです。甘いのがいいです",1],
["いつまでこうしてる気だ","いつまでこうしているおつもりですか"],
["散歩。知らない道を歩くのが好きで","散歩です。知らない道を歩くのが好きで"],
["どっちかを選んだら、もう一人を置いていくことになる","どちらかを選べば、もうお一人を置いていくことになります",1],
["…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと","…ここから出られないこと、ではありません。出たあと、ここでのことを忘れてしまうことです",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉さんがお決めになったことは分かっています。けれど、このままでは〈〉さんだけが出られません",1],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","…昔のアイドルのライブ映像を見ながら、振り付けを全部踊れます",1],
["今、何考えてる？","今、何を考えていますか？",1],
["ふざけてる","ふざけた話です",1],
["誰が飲むか、こんなもの","誰が飲むものですか、こんなもの",1],
["誰かに飲ませるくらいなら、私が飲む","誰かに飲ませるくらいなら、私が飲みます",1],
["三人で、なんて……〈〉が嫌ならやめます。でも、〈〉を一人にしておけないんです","三人で、だなんて……〈〉さんがお嫌なら、やめます。ですが、〈〉さんをひとりにはしておけないんです",1]],
"O":{
"好きな食べ物って何？":"好きな食べ物は何ですか？",
"…今。この状況":"…今です。この状況です",
"止まった。もう止まってる":"止まりました。もう止まっています",
"誰が飲むか、こんなもの":"誰が飲みますか、こんなもの",
"動物で例えたら、自分は何だと思う？":"動物で例えたら、ご自分は何だと思いますか？",
"もうちょっといる":"もう少しいます",
"私はこんなものに従う気はない":"私は、こんなものに従うつもりはありません",
"ごめん。それは、まだ言えない":"すみません。それは、まだ言えません",
"話し合ってたら日が暮れる":"話し合っていたら、日が暮れてしまいます",
"私、こういうのは一人とだけって決めてる":"私、こういうことは一人の方とだけと決めているんです",
"さっきのも一回に入る？":"さっきのも、一回に入りますか？",
"なかった。だから今もちょっと探してる":"ありませんでした。だから今も少し探しています",
"小学校の、図書室の先生":"小学校の、図書室の先生です",
"三人以上で同時に行った場合、参加者全員が条件を満たしたものとみなす……だって":"三人以上で同時に行った場合、全員が条件を満たしたものとみなす……だそうです",
"最近、いちばん笑ったことは？":"最近、いちばん笑ったことは何ですか？",
"録りためたドラマを一気に見る":"録りためたドラマを一気に見ます",
"……選択肢の一つとしては、覚えておく":"……選択肢の一つとしては、覚えておきます",
"当ててみて。当たったら教える":"当ててみてください。当たったらお教えします",
"どこまでなら平気？":"どこまでなら大丈夫ですか？",
"駅で、鳩に本気で追いかけられてる人を見た":"駅で、鳩に本気で追いかけられている人を見ました",
"これ、ドッキリ番組じゃない？":"これ、ドッキリ番組ではありませんか？",
"それなら、誰も置いていかなくて済むね":"それなら、誰も置いていかずに済みますね",
"誰かに飲ませるくらいなら、自分が飲む":"誰かに飲ませるくらいなら、私が飲みます"}});
HK.Load.toneData("gentleman",{"F":[
["…ごめん、決めてるから","…すまないね、もう決めているのだよ"],
["…何するつもり？","…何をするつもりかね？"],
["…卵焼き。甘いやつ","…卵焼きだね。甘いほうの"],
["ねえ〈〉、決め事って、たまには破ってもいいと思う","〈〉、決め事というものは、たまには破ってもいいと思うよ"],
["次のお題をください","次のお題をいただけるかね"],
["…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと","…ここから出られないことではないよ。出たあと、ここでのことを忘れてしまうことさ",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉が決めたことは分かっているよ。だが、このままでは〈〉だけが出られないのさ",1],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","…昔のアイドルのライブ映像を見ながら、振り付けを全部踊れるのさ",1],
["どっちかを選んだら、もう一人を置いていくことになる","どちらかを選んだら、もう一人を置いていくことになるのさ",1],
["どうせなら、全員と仲良くなっといた方が早くない？","どうせなら、全員と仲良くなっておいた方が早くないかい？",1],
["散歩。知らない道を歩くのが好きで","散歩だよ。知らない道を歩くのが好きでね",1],
["止めてほしくなったら、肩を叩いて","止めてほしくなったら、肩を叩きたまえ",1],
["どっちでもいい。決めるのはお前だ","どちらでもいい。決めるのは君だよ",1],
["喧嘩するくらいなら、三人でしよう","喧嘩をするくらいなら、三人でしようじゃないか",1],
["私は、するなら一人とだけ。それは譲れない","私は、するなら一人とだけだ。それは譲れないよ",1],
["大丈夫、絶対出られる","大丈夫、必ず出られるとも",1],
["これ、誰かの夢の中なんじゃない？","これは、誰かの夢の中ではないのかい？",1],
["一緒にいて、黙ってても平気な人","一緒にいて、黙っていても平気な人だね",1],
["そっちがでかいんだよ","君の方が大きいのだよ",1],
["じゃあ、する？","では、するかい？",1],
["どうせ見てるなら","どうせ見ているのなら",1],
["さっさと済ませよう","さっさと済ませようじゃないか",1],
["まだ、かもしれない","まだ、かもしれないね",1],
["ここから先は入らない","ここから先は、入らないよ",1],
["もし出られなかったら、どうする","もし出られなかったら、どうするかね",1],
["絶対にこっちを見るな","いいかい、決してこちらを見ないでくれたまえ",1],
["まだ時間はある。一つずつやろう","まだ時間はあるよ。一つずつ片付けていこうじゃないか",1],
["誰かに飲ませるくらいなら、私が飲む","誰かに飲ませるくらいなら、私が飲もう",1],
["私が誰にも無理強いはさせない","私がいる限り、誰にも無理強いはさせないよ",1],
["……わかった。ここで終わるよりはいい","……わかった。ここで終わるよりはいいだろう",1]],
"O":{
"好きな食べ物って何？":"好きな食べ物は何かね？",
"…今。この状況":"…今だよ。この状況だ",
"止まった。もう止まってる":"止まったよ。もう止まっている",
"誰が飲むか、こんなもの":"誰が飲むものかね、こんなもの",
"動物で例えたら、自分は何だと思う？":"動物に例えるなら、君は自分を何だと思うかね？",
"もうちょっといる":"もう少しいるとしよう",
"私はこんなものに従う気はない":"私は、こんなものに従うつもりはないよ",
"ごめん。それは、まだ言えない":"すまない。それは、まだ言えないよ",
"話し合ってたら日が暮れる":"話し合っていたら日が暮れてしまうよ",
"私、こういうのは一人とだけって決めてる":"私は、こういうことは一人とだけと決めているのだよ",
"さっきのも一回に入る？":"さっきのも、一回に数えるのかね？",
"なかった。だから今もちょっと探してる":"なかったよ。だから今も、少し探している",
"小学校の、図書室の先生":"小学校の、図書室の先生だよ",
"三人以上で同時に行った場合、参加者全員が条件を満たしたものとみなす……だって":"三人以上で同時に行った場合、全員が条件を満たしたものとみなす……だそうだ",
"最近、いちばん笑ったことは？":"最近、いちばん笑ったことは何かね？",
"録りためたドラマを一気に見る":"録りためたドラマを、一気に見るのだよ",
"……選択肢の一つとしては、覚えておく":"……選択肢の一つとしては、覚えておこう",
"当ててみて。当たったら教える":"当ててみたまえ。当たったら教えよう",
"どこまでなら平気？":"どこまでなら平気かね？",
"駅で、鳩に本気で追いかけられてる人を見た":"駅で、鳩に本気で追いかけられている人を見たよ",
"これ、ドッキリ番組じゃない？":"これは、ドッキリ番組ではないかね？",
"それなら、誰も置いていかなくて済むね":"それなら、誰も置いていかずに済むね",
"誰かに飲ませるくらいなら、自分が飲む":"誰かに飲ませるくらいなら、私が飲もう"}});
HK.Load.toneData("ane",{"F":[
["…卵焼き。甘いやつ","…卵焼き。甘いのがいいわ"],
["いつまでこうしてる気だ","いつまでこうしてるつもりなの"],
["人の気持ちを何だと思ってる","人の気持ちを何だと思ってるの"],
["出たら、私がこれを作った奴を見つけ出す","出たら、これを作った相手を私が見つけ出すわ"],
["本当にやるしかないのか","本当にやるしかないのね"],
["誰かに飲ませるくらいなら、自分が飲む","誰かに飲ませるくらいなら、私が飲むわ"],
["誰か見てるんだろ！","誰か見てるんでしょう！"],
["好きな食べ物って何？","好きな食べ物は何かしら？",1],
["……好きな食べ物って何？","……好きな食べ物は何かしら？",1],
["動物で例えたら、自分は何だと思う？","動物に例えたら、自分は何だと思う？",1],
["……動物で例えたら、自分は何だと思う？","……動物に例えたら、自分は何だと思う？",1],
["最近、いちばん笑ったことは？","最近いちばん笑ったのは、どんなこと？",1],
["……最近、いちばん笑ったことは？","……最近いちばん笑ったのは、どんなこと？",1],
["人に言えない趣味とかある？","人に言えない趣味、隠してるんじゃない？",1],
["……人に言えない趣味とかある？","……人に言えない趣味、隠してるんじゃない？",1],
["最近、泣いたのっていつ？","最近泣いたのは、いつかしら？",1],
["……最近、泣いたのっていつ？","……最近泣いたのは、いつかしら？",1],
["どんな人がタイプ？","どんな人がタイプなの？",1],
["……どんな人がタイプ？","……どんな人がタイプなの？",1],
["今、いちばん怖いことって何？","今いちばん怖いことって、なあに？",1],
["……今、いちばん怖いことって何？","……今いちばん怖いことって、なあに？",1],
["後悔してることってある？","後悔してること、ある？",1],
["……後悔してることってある？","……後悔してること、ある？",1],
["ここを出たら、最初に誰に会いたい？","ここを出たら、最初に誰に会いたいの？",1],
["……ここを出たら、最初に誰に会いたい？","……ここを出たら、最初に誰に会いたいの？",1],
["どっちかを選んだら、もう一人を置いていくことになる","どっちかを選んだら、もう一人は置いていくことになるのよ",1],
["宇宙飛行士。…笑わないでよ","宇宙飛行士。…笑わないでよね",1]]});
HK.Load.toneData("aniki",{"F":[
["ごめん。それは、まだ言えない","悪いね。それは、まだ言えないんだ"],
["動物で例えたら、自分は何だと思う？","動物で例えたら、自分は何だと思う？　私は……熊かな。冬はちゃんと寝るぞ",1],
["どっちかを選んだら、もう一人を置いていくことになる","どっちかを選んだら、もう一人を置いてくことになる。……そんなの、できるかよ",1],
["録りためたドラマを一気に見る","録りためたドラマを一気見だな。つまみ用意してさ",1],
["私、こういうのは一人とだけって決めてる","私はさ、こういうのは一人とだけって決めてるんだ。悪いな",1],
["駅で、鳩に本気で追いかけられてる人を見た","駅でさ、鳩に本気で追いかけられてる奴を見たんだよ。腹抱えて笑ったわ",1],
["なかった。だから今もちょっと探してる","なかったんだよ。だから今もちょっと探してる",1],
["散歩。知らない道を歩くのが好きで","散歩だな。知らない道をぶらつくのが好きでさ",1],
["誰かに飲ませるくらいなら、自分が飲む","誰かに飲ませるくらいなら、私が飲むよ",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉が決めたことはわかってるよ。でも、このままじゃ〈〉だけ出られねえだろ",1],
["付き合ってもいない相手と、できる？","付き合ってもいない相手と、できるか？",1],
["…何するつもり？","…何するつもりだ？",1],
["……動物で例えたら、自分は何だと思う？","……動物で例えたら、自分は何だと思う？　私は……熊かな。冬はちゃんと寝るぞ",1],
["三人で、なんて……〈〉が嫌ならやめる。でも、〈〉を一人にしておけないんだ","三人で、なんて……〈〉が嫌ならやめる。けど、〈〉を一人にしとけねえんだよ",1]]});
HK.Load.toneData("calm",{"F":[
["…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと","…ここから出られないことじゃない。出たあと、ここでのことを忘れてしまうことだ",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉が決めたことは分かっている。でも、このままじゃ〈〉だけ出られない",1],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる",1],
["どっちかを選んだら、もう一人を置いていくことになる","どちらかを選んだら、もう一人を置いていくことになる",1],
["どうせなら、全員と仲良くなっといた方が早くない？","どうせなら、全員と仲良くなっておいた方が早くないか？",1],
["駅で、鳩に本気で追いかけられてる人を見た","駅で、鳩に本気で追いかけられてる人を見た",1],
["誰かに飲ませるくらいなら、自分が飲む","誰かに飲ませるくらいなら、私が飲む",1],
["私、こういうのは一人とだけって決めてる","私、こういうのは一人とだけって決めてる",1],
["なかった。だから今もちょっと探してる","なかった。だから今も、少し探してる",1],
["動物で例えたら、自分は何だと思う？","動物で例えたら、自分は何だと思う？",1],
["……選択肢の一つとしては、覚えておく","……選択肢の一つとしては、覚えておく",1],
["散歩。知らない道を歩くのが好きで","散歩。知らない道を歩くのが好きで",1],
["録りためたドラマを一気に見る","録りためたドラマを、一気に見る",1],
["止めてほしくなったら、肩を叩いて","止めてほしくなったら、肩を叩いてくれ",1],
["合理的ではある","筋は通っている",1]]});
HK.Load.toneData("chara",{"F":[
["当ててみて。当たったら教える","当ててみて。当たったら教えたげる",1],
["駅で、鳩に本気で追いかけられてる人を見た","駅でさ、鳩にガチで追いかけられてる人見たんだけど",1],
["私、こういうのは一人とだけって決めてる","私さ、こういうのは一人とだけって決めてんの",1],
["動物で例えたら、自分は何だと思う？","動物で例えたら、自分って何だと思う？",1],
["どっちかを選んだら、もう一人を置いていくことになる","どっちか選んだら、もう一人置いてくことになんじゃん……",1],
["なかった。だから今もちょっと探してる","なかったんだよね。だから今もちょい探してる",1],
["散歩。知らない道を歩くのが好きで","散歩。知らない道歩くの好きなんだよね",1],
["録りためたドラマを一気に見る","録りためたドラマ一気見かな",1],
["止まった。もう止まってる","止まった。もう止まってるって",1],
["そういうことは、好きな人とするものだ","そういうのは、好きな人とするもんっしょ",1],
["三人で、なんて……〈〉が嫌ならやめる。でも、〈〉を一人にしておけないんだ","三人で、なんて……〈〉が嫌ならやめる。でも、〈〉を一人にしとけないんだって"],
["話し合ってたら日が暮れる","話し合ってたら日が暮れるって"],
["お前が決めたことなら、どっちでもついていく","あんたが決めたことなら、どっちでもついてくって"],
["ここに来る相手が自分で、よかった？","ここに来たのが私で、よかった？"],
["誰かに飲ませるくらいなら、自分が飲む","誰かに飲ませるくらいなら、私が飲むって"],
["誰が飲むか、こんなもの","誰が飲むかって、こんなん"],
["私はこんなものに従う気はない","私はこんなのに従う気、ないって"],
["私は、するなら一人とだけ。それは譲れない","私は、するなら一人とだけ！　それは譲れないって"],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","…昔のアイドルのライブ映像見ながら、振り付け全部踊れるんだよね"],
["私が誰にも無理強いさせない","私が誰にも無理強いさせないから"],
["どっちでもいい。決めるのはお前だ","どっちでもいいって。決めるのはあんただよ"],
["私、誰とでも、ってわけじゃない","私、誰とでも、ってわけじゃねーから"],
["嫌なら、私は他の方法を探す。時間はある","嫌なら、私は他の方法探すわ。時間はあるし"],
["出たら、私がこれを作った奴を見つけ出す","出たら、私がこれ作った奴を見つけ出すわ"],
["私は〈〉が一番だよ。それは変わらない。……〈〉も、一緒にいてほしい","私は〈〉が一番だよ。それは変わんねー。……〈〉も、一緒にいてほしい"],
["私はこんな条件、絶対に従わない","私はこんな条件、ぜってー従わねーから"],
["何日かかっても、私は別の方法を探す","何日かかっても、私は別の方法探すわ"],
["もう、こうなったら楽しんだもん勝ち","もう、こうなったら楽しんだもん勝ちっしょ"],
["ふざけてる","ふざけてんなー"],
["私、初めてがこんな場所なのは嫌だ","私、初めてがこんな場所なのはマジ嫌だわ"],
["お前に任せたら一生終わらない","あんたに任せたら一生終わんねーって"],
["人の気持ちを何だと思ってる","人の気持ち、何だと思ってんの"],
["嫌になったら私がすぐ止める","嫌になったら私がすぐ止めるって"],
["三人で、なんて絶対に無理","三人で、とか絶対ムリだって"],
["次のお題をください","次のお題ちょーだい"],
["…ぬいぐるみに名前つけて話しかけてる","…ぬいぐるみに名前つけて話しかけてんの"],
["私は絶対に嫌だ","私は絶対ヤダ"],
["いつまでこうしてる気だ","いつまでこうしてる気だよ"],
["外より、ここの方が素直になれる","外より、ここのほうが素直になれんだよね"],
["誰か見てるんだろ！","誰か見てんだろ！"],
["全員でここを出る","全員でここ出るって"],
["ここから先は入らない","ここから先は入んないって"],
["考えなしに飲むからだ","考えなしに飲むからっしょ"],
["先週。映画で。動物が出てくるやつはずるい","先週。映画で。動物出てくるやつはずるいって"],
["ただいまより、脱出の実況をお送りします","はい今から、脱出の実況いっちゃいまーす"],
["条件のためじゃなきゃ、私はお前とは無理","条件のためじゃなきゃ、私はあんたとはマジ無理だわ"],
["一人だけ置いていくのは、なしにしよう","一人だけ置いてくのは、ナシにしよ"],
["こんな場所だから、苛立っただけ","こんな場所だから、イラついただけだって"],
["余計なお節介をしないところ","余計なお節介しないとこ"],
["まあ、そういうこともある","まあ、そういうこともあるって"],
["つまみがないのが惜しいね","つまみないのが惜しいね〜"],
["この程度で音を上げるか","この程度で音上げちゃう感じ？"],
["まだ、かもしれない","まだ、かもしんない"],
["泣いても出られない","泣いても出らんないって"],
["贅沢すぎる","贅沢すぎ！"],
["宇宙飛行士。…笑わないでよ","宇宙飛行士。…笑わないでよ〜",1],
["寝てる。ひたすら寝てる","寝てる。ひたすら寝てるわ〜",1],
["…今。この状況","…今。この状況っしょ",1],
["聞こえてるなら返事して","聞こえてんなら返事してって",1],
["これが『しりとりしないと出られない部屋』だったら楽だった","これが『しりとりしないと出られない部屋』だったら余裕だったのになー",1]]});
HK.Load.toneData("cool",{"F":[
["…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと","…ここから出られないことじゃない。出たあと、ここでの記憶が消えることだ",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉の決定は理解している。だが、このままでは〈〉だけが出られない",1],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","…昔のアイドルのライブ映像を見ながら、全曲の振り付けを再現できる",1],
["どっちかを選んだら、もう一人を置いていくことになる","どちらかを選べば、もう一人を置いていく結果になる",1],
["どうせなら、全員と仲良くなっといた方が早くない？","どうせなら、全員と関係を築いておいた方が効率がいい",1],
["駅で、鳩に本気で追いかけられてる人を見た","駅で、鳩に本気で追いかけられている人間を観測した",1],
["誰かに飲ませるくらいなら、自分が飲む","誰かに飲ませるくらいなら、私が飲む",1],
["私、こういうのは一人とだけって決めてる","私は、こういうことは一人とだけと決めている",1],
["なかった。だから今もちょっと探してる","なかった。だから今も少し探している",1],
["動物で例えたら、自分は何だと思う？","動物で例えると、自分は何だと思う？",1],
["……選択肢の一つとしては、覚えておく","……選択肢の一つとしては、記憶しておく",1],
["散歩。知らない道を歩くのが好きで","散歩だ。知らない道を歩くのが好きだ",1],
["録りためたドラマを一気に見る","録りためたドラマを一気に見る。効率がいい",1],
["止めてほしくなったら、肩を叩いて","止めてほしくなったら、肩を叩いてくれ",1],
["最近、いちばん笑ったことは？","最近、いちばん笑ったことは何だ？",1],
["好きな食べ物って何？","好きな食べ物は何だ？",1],
["これ、誰かの夢の中なんじゃない？","これは、誰かの夢の中なんじゃないか？",1],
["私は、するなら一人とだけ。それは譲れない","私は、するなら一人とだけだ。それは譲れない",1],
["今、何考えてる？","今、何を考えている？",1],
["寝てる。ひたすら寝てる","寝ている。ひたすら寝ている",1]]});
HK.Load.toneData("darui",{"F":[
["お願い。邪魔はしない。端っこにいさせてくれるだけでいいから","……お願い。……邪魔はしないから……端っこにいさせて"],
["この紙、誤字ってない？","……この紙、誤字ってない？"],
["深呼吸。はい、もう一回","……深呼吸。……はい……もう一回"],
["…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと","……出られないこと、じゃなくて。……出たあと、ここのこと忘れること",1],
["…ぬいぐるみに名前つけて話しかけてる","……ぬいぐるみに名前つけて、話しかけてる。……それだけ",1],
["…自分が、何もできないまま終わること","……なにもできないまま、終わること",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","……〈〉が決めたのは、わかってる。……でも、このままじゃ〈〉だけ、出られない",1],
["お前が決めたことなら、どっちでもついていく","……あんたが決めたなら、どっちでも。……ついてく",1],
["ここに来る相手が自分で、よかった？","……来たのが私で……よかった？",1],
["これ、誰かの夢の中なんじゃない？","……これ、誰かの夢の中なんじゃない",1],
["せーので、出たら最初に食べたいもの","……せーので。……出たら最初に食べたいもの",1],
["どうせなら、全員と仲良くなっといた方が早くない？","……どうせなら、全員と仲良くしといたほうが早い。……揉めるの、だるいし",1],
["付き合ってもいない相手と、できる？","……付き合ってない相手と。……できる？",1],
["動物で例えたら、自分は何だと思う？","……動物で例えたら、自分、何だと思う？……私はナマケモノ",1],
["喧嘩するくらいなら、三人でしよう","……喧嘩するくらいなら……三人で。……めんどくさくないし",1],
["嫌なら、私は他の方法を探す。時間はある","……嫌なら、他の方法、探す。……時間はあるし",1],
["散歩。知らない道を歩くのが好きで","……散歩。……知らない道、ふらふらするのは、わりと好き",1],
["止めてほしくなったら、肩を叩いて","……止めてほしくなったら、肩、叩いて",1],
["私、こういうのは一人とだけって決めてる","……私、こういうのは一人とだけって決めてる。……めんどいし",1],
["私は、するなら一人とだけ。それは譲れない","……するなら、一人とだけ。……そこは、譲れない",1],
["私はこんなものに従う気はない","……こんなのに従う気、ない",1],
["誰かに飲ませるくらいなら、自分が飲む","……誰かに飲ませるくらいなら、私が飲む。……どうせ動かないし",1],
["駅で、鳩に本気で追いかけられてる人を見た","……駅で、鳩に本気で追われてる人、見た。……たいへんそうだった",1],
["もう、こうなったら楽しんだもん勝ち","……もう、こうなったら楽しんだもん勝ちでしょ",1],
["宇宙飛行士。…笑わないでよ","……宇宙飛行士。…笑わないでよ",1],
["好きな食べ物って何？","……好きな食べ物、なに？",1]]});
HK.Load.toneData("devoted",{"F":[
["……ごめん、それはちょっと","……すみません、それはちょっと"],
["なかった。だから今もちょっと探してる","ありませんでした。だから今もちょっと探してます"],
["散歩。知らない道を歩くのが好きで","散歩です。知らない道を歩くのが好きで"],
["止まった。もう止まってる","止まりました。もう止まってます"],
["誰が飲むか、こんなもの","ごめんなさい、これはさすがに飲めません"],
["好きな食べ物って何？","好きな食べ物は、何ですか？",1],
["……好きな食べ物って何？","……好きな食べ物は、何ですか？",1],
["動物で例えたら、自分は何だと思う？","動物に例えたら、ご自分は何だと思いますか？",1],
["……動物で例えたら、自分は何だと思う？","……動物に例えたら、ご自分は何だと思いますか？",1],
["最近、いちばん笑ったことは？","最近いちばん笑ったのは、どんなことですか？",1],
["……最近、いちばん笑ったことは？","……最近いちばん笑ったのは、どんなことですか？",1],
["人に言えない趣味とかある？","人には言えない趣味って、ありますか？",1],
["……人に言えない趣味とかある？","……人には言えない趣味って、ありますか？",1],
["最近、泣いたのっていつ？","最近、泣いたのはいつですか？",1],
["……最近、泣いたのっていつ？","……最近、泣いたのはいつですか？",1],
["どんな人がタイプ？","どんな人がタイプですか？",1],
["……どんな人がタイプ？","……どんな人がタイプですか？",1],
["今、いちばん怖いことって何？","今いちばん怖いことって、何ですか？",1],
["……今、いちばん怖いことって何？","……今いちばん怖いことって、何ですか？",1],
["後悔してることってある？","後悔していることって、ありますか？",1],
["……後悔してることってある？","……後悔していることって、ありますか？",1],
["ここを出たら、最初に誰に会いたい？","ここを出たら、最初に誰に会いたいですか？",1],
["……ここを出たら、最初に誰に会いたい？","……ここを出たら、最初に誰に会いたいですか？",1],
["どっちかを選んだら、もう一人を置いていくことになる","どちらかを選んだら……もう一人を、置いていくことになってしまいます",1],
["あ、すみません。変なことを聞きました","あっ、ごめんなさい……変なこと、聞いちゃいましたね",1]]});
HK.Load.toneData("devoted_p",{"F":[
["好きな食べ物って何？","好きな食べ物って、なに？",1],
["……好きな食べ物って何？","……好きな食べ物って、なに？",1],
["動物で例えたら、自分は何だと思う？","動物に例えたら、自分は何だと思う？",1],
["……動物で例えたら、自分は何だと思う？","……動物に例えたら、自分は何だと思う？",1],
["最近、いちばん笑ったことは？","最近いちばん笑ったのって、どんなこと？",1],
["……最近、いちばん笑ったことは？","……最近いちばん笑ったのって、どんなこと？",1],
["人に言えない趣味とかある？","人に言えない趣味とか、ある？",1],
["……人に言えない趣味とかある？","……人に言えない趣味とか、ある？",1],
["最近、泣いたのっていつ？","最近、泣いたのっていつ？",1],
["……最近、泣いたのっていつ？","……最近、泣いたのっていつ？",1],
["どんな人がタイプ？","どんな人がタイプ？",1],
["……どんな人がタイプ？","……どんな人がタイプ？",1],
["今、いちばん怖いことって何？","今いちばん怖いことって、なに？",1],
["……今、いちばん怖いことって何？","……今いちばん怖いことって、なに？",1],
["後悔してることってある？","後悔してることって、ある？",1],
["……後悔してることってある？","……後悔してることって、ある？",1],
["ここを出たら、最初に誰に会いたい？","ここを出たら、最初に誰に会いたい？",1],
["……ここを出たら、最初に誰に会いたい？","……ここを出たら、最初に誰に会いたい？",1],
["どっちかを選んだら、もう一人を置いていくことになる","どっちか選んだら、もう一人を置いてくことになっちゃう",1],
["人の気持ちを何だと思ってる","人の気持ちを何だと思ってるの",1],
["誰が飲むか、こんなもの","こ、これは……飲めないよ",1]]});
HK.Load.toneData("free",{"F":[
["……今回だけ。それに、〈〉が隣にいるなら","……今回だけ。それに、〈〉が隣にいるなら！",1],
["…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと","……ここから出られないことじゃなくて、出たあと、ここでのことを忘れちゃうこと",1],
["…ぬいぐるみに名前つけて話しかけてる","……ぬいぐるみに名前つけて、話しかけてるんだ！",1],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","昔のアイドルのライブ映像見ながら、振り付け全部踊れるよ！",1],
["…自分が、何もできないまま終わること","……自分が、何もできないまま終わること",1],
["〈〉が一人だけって決めてるのは知ってる。でも、三人なら早く出られる","〈〉が一人だけって決めてるのは知ってるよ。でも、三人なら早く出られるよ！",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉が決めたことは分かってるよ。でも、このままじゃ〈〉だけ出られないよ！",1],
["お前が決めたことなら、どっちでもついていく","きみが決めたことなら、どっちでもついていくよ！",1],
["ここに来る相手が自分で、よかった？","ここに来たのが私で、よかった？",1],
["これ、誰かの夢の中なんじゃない？","これ、誰かの夢の中なんじゃない！？",1],
["どうせなら、全員と仲良くなっといた方が早くない？","どうせなら全員と仲良くなっちゃったほうが早くない？",1],
["付き合ってもいない相手と、できる？","付き合ってもいない相手とでも、できる？",1],
["動物で例えたら、自分は何だと思う？","動物で例えたら、自分は何だと思う？　私はねー、たぶん犬！",1],
["喧嘩するくらいなら、三人でしよう","喧嘩するくらいなら、三人でしようよ！",1],
["嫌なら、私は他の方法を探す。時間はある","嫌なら、私は他の方法を探すよ。時間はあるし！",1],
["散歩。知らない道を歩くのが好きで","散歩！　知らない道を歩くのが大好きなの！",1],
["止めてほしくなったら、肩を叩いて","止めてほしくなったら、肩を叩いてね！",1],
["私、こういうのは一人とだけって決めてる","私、こういうのは一人とだけって決めてるんだ！",1],
["私は、するなら一人とだけ。それは譲れない","私は、するなら一人とだけ！　それは譲れないよ",1],
["私はこんなものに従う気はない","私はこんなのに従う気、ないよ！",1],
["誰かに飲ませるくらいなら、自分が飲む","誰かに飲ませるくらいなら、私が飲む！",1],
["録りためたドラマを一気に見る","録りためたドラマを一気見するの！　お菓子も用意して！",1],
["駅で、鳩に本気で追いかけられてる人を見た","駅でね、鳩に本気で追いかけられてる人見たの！　あはは！",1]]});
HK.Load.toneData("genki",{"F":[
["どっちかを選んだら、もう一人を置いていくことになる","どっちかを選んだら、もう一人を置いていくことになっちゃいます……",1],
["〈〉が一人だけって決めてるのは知ってる。でも、三人なら早く出られる","〈〉さんが一人だけって決めてるのは知ってます。でも、三人なら早く出られますよ！",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉さんが決めたことは分かってます。でも、このままじゃ〈〉さんだけ出られないんです！",1],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","…昔のアイドルのライブ映像を見ながら、振り付けぜんぶ踊れちゃいます！",1],
["…ぬいぐるみに名前つけて話しかけてる","…ぬいぐるみに名前つけて、話しかけてます。えへへ",1],
["そっちがでかいんだよ","そっちが大きいんですよ！",1],
["はい、いい顔","はい、いい顔です！",1]]});
HK.Load.toneData("gentle",{"F":[
["誰が飲むか、こんなもの","こんなの、さすがに飲めないよ"],
["好きな食べ物って何？","好きな食べ物って、なあに？",1],
["……好きな食べ物って何？","……好きな食べ物って、なあに？",1],
["動物で例えたら、自分は何だと思う？","動物に例えたら、自分は何だと思う？",1],
["……動物で例えたら、自分は何だと思う？","……動物に例えたら、自分は何だと思う？",1],
["最近、いちばん笑ったことは？","最近いちばん笑ったのは、どんなこと？",1],
["……最近、いちばん笑ったことは？","……最近いちばん笑ったのは、どんなこと？",1],
["人に言えない趣味とかある？","人には内緒の趣味って、ある？",1],
["……人に言えない趣味とかある？","……人には内緒の趣味って、ある？",1],
["最近、泣いたのっていつ？","最近、泣いたのっていつ？",1],
["……最近、泣いたのっていつ？","……最近、泣いたのっていつ？",1],
["どんな人がタイプ？","どんな人に惹かれるの？",1],
["……どんな人がタイプ？","……どんな人に惹かれるの？",1],
["今、いちばん怖いことって何？","今いちばん怖いことって、何かな",1],
["……今、いちばん怖いことって何？","……今いちばん怖いことって、何かな",1],
["後悔してることってある？","後悔してること、ある？",1],
["……後悔してることってある？","……後悔してること、ある？",1],
["ここを出たら、最初に誰に会いたい？","ここを出たら、最初に誰に会いたい？",1],
["……ここを出たら、最初に誰に会いたい？","……ここを出たら、最初に誰に会いたい？",1],
["どっちかを選んだら、もう一人を置いていくことになる","どっちかを選んだら、もう一人を置いていくことになるんだよね……",1]]});
HK.Load.toneData("gentle_n",{"F":[
["誰が飲むか、こんなもの","ごめん、これはちょっと飲めないかな"],
["好きな食べ物って何？","好きな食べ物って、何？",1],
["……好きな食べ物って何？","……好きな食べ物って、何？",1],
["動物で例えたら、自分は何だと思う？","動物に例えたら、自分は何だと思う？",1],
["……動物で例えたら、自分は何だと思う？","……動物に例えたら、自分は何だと思う？",1],
["最近、いちばん笑ったことは？","最近いちばん笑ったのって、どんなこと？",1],
["……最近、いちばん笑ったことは？","……最近いちばん笑ったのって、どんなこと？",1],
["人に言えない趣味とかある？","人に言えない趣味とか、ある？",1],
["……人に言えない趣味とかある？","……人に言えない趣味とか、ある？",1],
["最近、泣いたのっていつ？","最近、泣いたのっていつ？",1],
["……最近、泣いたのっていつ？","……最近、泣いたのっていつ？",1],
["どんな人がタイプ？","どんな人がタイプ？",1],
["……どんな人がタイプ？","……どんな人がタイプ？",1],
["今、いちばん怖いことって何？","今いちばん怖いことって、何？",1],
["……今、いちばん怖いことって何？","……今いちばん怖いことって、何？",1],
["後悔してることってある？","後悔してることって、ある？",1],
["……後悔してることってある？","……後悔してることって、ある？",1],
["ここを出たら、最初に誰に会いたい？","ここを出たら、最初に誰に会いたい？",1],
["……ここを出たら、最初に誰に会いたい？","……ここを出たら、最初に誰に会いたい？",1],
["どっちかを選んだら、もう一人を置いていくことになる","どちらかを選べば、もう一人を置いていくことになる",1],
["いつまでこうしてる気だ","いつまでこうしてるつもり？",1],
["私、こういうのは一人とだけって決めてる","私ね、こういうのは一人とだけって、決めてるんだ",1]]});
HK.Load.toneData("gyaru",{"F":[
["当ててみて。当たったら教える","当ててみて〜。当たったら教えたげる"],
["……今回だけ。それに、〈〉が隣にいるなら","……今回だけね。それに、〈〉が隣にいるなら",1],
["…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと","……ここから出られないことじゃなくて〜、出たあと、ここのこと忘れちゃうことかな",1],
["…ぬいぐるみに名前つけて話しかけてる","……ぬいぐるみに名前つけて話しかけてんの。かわいくない？",1],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","昔のアイドルのライブ映像見ながら、振り付け全部踊れるんだよね〜！",1],
["…自分が、何もできないまま終わること","……自分が、なんもできないまま終わること、かな",1],
["〈〉が一人だけって決めてるのは知ってる。でも、三人なら早く出られる","〈〉が一人だけって決めてんのは知ってる。でも、三人ならもっと早く出られるし！",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉が決めたのは分かってるけど〜、このままじゃ〈〉だけ出られないじゃん！",1],
["お前が決めたことなら、どっちでもついていく","きみが決めたことなら、どっちでもついてくし！",1],
["ここに来る相手が自分で、よかった？","ここに来たのが私で、よかった感じ？",1],
["これ、誰かの夢の中なんじゃない？","これ、誰かの夢の中なんじゃない？　ウケる",1],
["どうせなら、全員と仲良くなっといた方が早くない？","どうせなら全員と仲良くなっといたほうが早くない？　友達百人いっとこ！",1],
["付き合ってもいない相手と、できる？","付き合ってもない相手と、できちゃう感じ？",1],
["動物で例えたら、自分は何だと思う？","動物で例えたら、自分って何だと思う？　ウケるやつでいいよ",1],
["喧嘩するくらいなら、三人でしよう","喧嘩するくらいなら三人でしよ〜！　平和的解決じゃん！",1],
["嫌なら、私は他の方法を探す。時間はある","嫌なら、私は他の方法探すし。時間はあるから〜",1],
["散歩。知らない道を歩くのが好きで","散歩！　知らない道歩くのが好きなんだよね〜",1],
["止めてほしくなったら、肩を叩いて","止めてほしくなったら、肩トンってして〜",1],
["私、こういうのは一人とだけって決めてる","私、こういうのは一人とだけって決めてんの",1],
["私は、するなら一人とだけ。それは譲れない","私、するなら一人とだけ。そこは譲れないし",1],
["私はこんなものに従う気はない","私、こんなのに従う気ないから",1],
["誰かに飲ませるくらいなら、自分が飲む","誰かに飲ませるくらいなら、私が飲むし",1],
["録りためたドラマを一気に見る","録りためたドラマ一気見！　チョー幸せ",1],
["駅で、鳩に本気で追いかけられてる人を見た","駅で鳩にマジで追いかけられてる人見た！　ウケる",1],
["なかった。だから今もちょっと探してる","なかったんだよね。だから今もちょっと探してる"],
["三人で、なんて……〈〉が嫌ならやめる。でも、〈〉を一人にしておけないんだ","三人で、なんて……〈〉が嫌ならやめる。でも、〈〉を一人にしとけないんだよね"],
["話し合ってたら日が暮れる","話し合ってたら日が暮れるし"],
["誰が飲むか、こんなもの","こんなもん、誰が飲むかっての"],
["出たら全員で焼肉な","出たら全員で焼肉ね！"],
["私が誰にも無理強いさせない","私が誰にも無理強いさせないし"],
["どっちでもいい。決めるのはお前だ","どっちでもいいよ。決めるのはあんただし"],
["私、誰とでも、ってわけじゃない","私、誰とでも、ってわけじゃないし"],
["これが『しりとりしないと出られない部屋』だったら楽だった","これが『しりとりしないと出られない部屋』だったら楽だったのにね"],
["これ書いた人、絶対モテない","これ書いた人、絶対モテないじゃん"],
["……動物で例えたら、自分は何だと思う？","……動物で例えたら、自分って何だと思う？"],
["出たら、私がこれを作った奴を見つけ出す","出たら、私がこれ作ったやつ見つけ出すし"],
["誰か一人を選ぶとか、もう、やめよう","誰か一人選ぶとか、もうやめよ"],
["私は〈〉が一番だよ。それは変わらない。……〈〉も、一緒にいてほしい","私は〈〉が一番だよ。それは変わんない。……〈〉も、一緒にいてほしい"],
["誰か一人を置いていくのは、嫌だ","誰か一人置いてくのは、ヤダ"],
["私はこんな条件、絶対に従わない","私はこんな条件、ぜったい従わないし"],
["何日かかっても、私は別の方法を探す","何日かかっても、私は別の方法探すし"],
["ふざけてる","マジふざけてる"],
["出たらこの話、一生ネタにしような","出たらこの話、一生ネタにしよ！"],
["私、初めてがこんな場所なのは嫌だ","私、初めてがこんな場所なのはマジで嫌なんだけど"],
["…覚えてない。泣き方を忘れたのかもしれない","…覚えてないんだよね。泣き方、忘れちゃったのかも"],
["お前に任せたら一生終わらない","あんたに任せたら一生終わんないじゃん"],
["人の気持ちを何だと思ってる","人の気持ち、何だと思ってんの"],
["嫌になったら私がすぐ止める","嫌になったら私がすぐ止めるから"],
["そういうことは、好きな人とするものだ","そういうことは、好きな人とするもんでしょ"],
["三人で、なんて絶対に無理","三人で、とか絶対ムリ"],
["次のお題をください","次のお題ちょうだい"],
["私は絶対に嫌だ","私は絶対ヤダ"],
["いつまでこうしてる気だ","いつまでこうしてる気なの？"],
["外より、ここの方が素直になれる","外より、ここのほうが素直になれるんだよね"],
["誰か見てるんだろ！","誰か見てるんでしょ！"],
["全員でここを出る","全員でここ出るし"],
["本当は私、最初に会ったときから気になってた","ホントは私、最初に会ったときから気になってたんだよね"],
["ここから先は入らない","ここから先は入んないし"],
["考えなしに飲むからだ","考えなしに飲むからじゃん"],
["先週。映画で。動物が出てくるやつはずるい","先週。映画で。動物出てくるやつはずるいって"],
["ただいまより、脱出の実況をお送りします","今から、脱出の実況お届けしまーす"],
["条件のためじゃなきゃ、私はお前とは無理","条件のためじゃなきゃ、私はあんたとかマジ無理"],
["誰かに飲ませるくらいなら、私が飲む","誰かに飲ませるくらいなら、私が飲むし"],
["こんな場所だから、苛立っただけ","こんな場所だから、イラッとしただけだし"],
["見てるなら出せ","見てるなら出してよ"],
["出た人が、必ず助けを呼ぶこと","出た人が、絶対助け呼ぶこと！"],
["余計なお節介をしないところ","余計なお節介しないとこ"],
["縛ってもいい？嫌なら言って","縛ってもいい？嫌なら言ってね"],
["まあ、そういうこともある","まあ、そういうこともあるって"],
["つまみがないのが惜しいね","つまみないのが惜しいよね"],
["この程度で音を上げるか","この程度でもう音上げちゃう？"],
["宇宙飛行士。…笑わないでよ","宇宙飛行士。…笑わないでよ、マジで",1],
["寝てる。ひたすら寝てる","寝てる。ひたすら寝てる、マジで",1],
["…今。この状況","…今。この状況、マジ笑える",1],
["…卵焼き。甘いやつ","…卵焼き。甘いやつがいい",1],
["どっちかを選んだら、もう一人を置いていくことになる","どっちか選んだら、もう一人置いてくことになるじゃん",1],
["もし出られなかったら、どうする？","もし出られなかったら、どうすんの？",1],
["止まった。もう止まってる","止まった。もう止まってるっぽい",1],
["聞こえてるなら返事して","聞こえてんなら返事してって！",1],
["もう、こうなったら楽しんだもん勝ち","もうさ、こうなったら楽しんだもん勝ちっしょ",1],
["最近、いちばん笑ったことは？","最近いちばん笑ったことって何〜？",1]]});
HK.Load.toneData("hero",{"F":[
["当ててみて。当たったら教える","当ててみろ！　当たったら教えてやる！",1],
["駅で、鳩に本気で追いかけられてる人を見た","駅でさ、鳩に本気で追いかけられてる奴を見たんだ！",1],
["私、こういうのは一人とだけって決めてる","私は、こういうのは一人とだけって決めてるんだ！",1],
["動物で例えたら、自分は何だと思う？","動物で例えたら、自分は何だと思う？",1],
["どっちかを選んだら、もう一人を置いていくことになる","どっちかを選んだら、もう一人を置いていくことになる……そんなの、私は嫌だ！",1],
["なかった。だから今もちょっと探してる","なかったんだ！　だから今もちょっと探してる！",1],
["散歩。知らない道を歩くのが好きで","散歩だ！　知らない道を歩くのが好きでさ！",1],
["録りためたドラマを一気に見る","録りためたドラマを一気に見る！　熱い回は三回見る！",1],
["止まった。もう止まってる","止まった！　もう止まってる！",1],
["どんな人がタイプ？","どんな奴がタイプだ？",1],
["全員でここを出る","全員でここを出るぞ！",1],
["私はこんな条件、絶対に従わない","私はこんな条件、絶対に従わねえ！",1],
["三人で、なんて……〈〉が嫌ならやめる。でも、〈〉を一人にしておけないんだ","三人で、なんて……〈〉が嫌ならやめる。でも、〈〉を一人にしておけねえんだ！",1],
["…何するつもり？","…何するつもりだ？",1],
["耳塞いでて","耳塞いでてくれ",1],
["……好きな食べ物って何？","……好きな食べ物って何だ？",1],
["好きな食べ物って何？","好きな食べ物って何だ？",1],
["辛かったら言え","辛かったら言えよ！",1],
["寝ている。ひたすら寝ている","寝てるぜ！　ひたすら寝てる！",1],
["出たら、私がこれを作った奴を見つけ出す","ここを出たら、これを作った奴は私が絶対に見つけ出す！",1],
["嫌になったら私がすぐに止める","嫌になったら、私がすぐ止めてやる！",1],
["まあ、そういうこともある","まあ、そういうこともあるさ！",1]]});
HK.Load.toneData("kohai",{"F":[
["……ごめん、それはちょっと","……すんません、それはちょっと"],
["…今。この状況","…今っすよ。この状況"],
["…何するつもり？","…何するつもりっすか？"],
["…卵焼き。甘いやつ","…卵焼きっす。甘いやつ"],
["なかった。だから今もちょっと探してる","なかったっす。だから今もちょっと探してるっす"],
["人の気持ちを何だと思ってる","人の気持ちを何だと思ってるんすか"],
["私、こういうのは一人とだけって決めてる","私、こういうのは一人とだけって決めてるんす"],
["誰が飲むか、こんなもの","誰が飲むんすか、こんなもの"],
["どっちかを選んだら、もう一人を置いていくことになる","どっちかを選んだら、もう一人を置いてくことになるっす",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉さんが決めたことは分かってるっす。でも、このままじゃ〈〉さんだけ出られないっすよ",1],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","…昔のアイドルのライブ映像見ながら、振り付け全部踊れるっす",1],
["じゃあ、する？","じゃあ、するっすか？",1],
["……〈〉がそこまで言うなら","……〈〉さんがそこまで言うなら、いいっすけど",1],
["どうせお前からは来ない","どうせそっちからは来ないっすよね",1],
["どっちでもいい。決めるのはお前だ","どっちでもいいっす。決めるのはそっちっす",1],
["いつまでこうしてる気だ","いつまでこうしてるつもりっすか",1],
["せっせっせーの、よいよいよい","せっせっせーの、よいよいよい！",1],
["一人だけ置いていくのは、なしにしましょう","一人だけ置いてくのは、なしにしましょうよ",1],
["お互い、気を落とさずにまいりましょう","お互い、気を落とさずにいきましょうっす",1]]});
HK.Load.toneData("mystic",{"F":[
["…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと","…ここから出られないことじゃないんだ。出たあと、ここでのことを忘れちゃうことだよ",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉が決めたことは分かっているよ。でもね、このままじゃ〈〉だけ出られないんだ",1],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れるんだ",1],
["どっちかを選んだら、もう一人を置いていくことになる","どっちかを選んだら、もう一人を置いていくことになるんだ",1],
["どうせなら、全員と仲良くなっといた方が早くない？","どうせなら、全員と仲良くなっといた方が早くないかい？",1],
["駅で、鳩に本気で追いかけられてる人を見た","駅で、鳩に本気で追いかけられている人を見たんだ",1],
["誰かに飲ませるくらいなら、自分が飲む","誰かに飲ませるくらいなら、私が飲むんだ",1],
["私、こういうのは一人とだけって決めてる","私はね、こういうのは一人とだけって決めているんだ",1],
["なかった。だから今もちょっと探してる","なかったんだ。だから今も、ちょっと探している",1],
["動物で例えたら、自分は何だと思う？","動物で例えたら、自分は何だと思うかい？",1],
["……選択肢の一つとしては、覚えておく","……選択肢の一つとしては、覚えておくんだ",1],
["散歩。知らない道を歩くのが好きで","散歩だ。知らない道を歩くのが好きでね",1],
["録りためたドラマを一気に見る","録りためたドラマを、一気に見るんだ",1],
["止めてほしくなったら、肩を叩いて","止めてほしくなったら、肩を叩いてね",1],
["合理的ではある","筋は通っているね",1],
["辛かったら言え","辛かったら、言ってごらん",1],
["どこまでなら平気だ？","どこまでなら平気なんだい？",1]]});
HK.Load.toneData("ojou",{"F":[
["どっちかを選んだら、もう一人を置いていくことになる","どちらかを選べば、もうお一人を置いていくことになりますのね",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉さんがお決めになったことは分かっていますわ。けれど、このままでは〈〉さんだけが出られませんのよ",1],
["…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと","…ここから出られないこと、ではありませんの。出たあと、ここでのことを忘れてしまうことですわ",1],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","…昔のアイドルのライブ映像を見ながら、振り付けを全部踊れますのよ",1],
["……今回だけ。それに、〈〉が隣にいるなら","……今回だけですわよ。それに、〈〉さんが隣にいらっしゃるなら",1],
["はい、いい顔","はい、いいお顔ですわ",1],
["散歩。知らない道を歩くのが好きで","お散歩ですわ。知らない道を歩くのが好きですの",1],
["もう、みんなでいいじゃん","もう、皆さまでよろしいではありませんか",1],
["……〈〉がそこまで言うなら","……〈〉さんがそこまでおっしゃるなら",1],
["本当にやるしかないのか","本当に、やるしかありませんの？",1],
["三人の方が早くない？","三人のほうが、早くありませんこと？",1],
["出たら、私がこれを作った奴を見つけ出す","出たら、これを作った方を、私が見つけ出してみせますわ",1],
["あ、すみません。変なことを聞きました","あら、失礼いたしました。妙なことをお聞きしましたわ",1],
["これが『しりとりしないと出られない部屋』だったら楽でした","これが『しりとりしないと出られない部屋』でしたら、楽でしたのに",1],
["どうせなら試してみたいでしょう","どうせなら、試してみたいでしょう？",1],
["……わかりました。ここで終わるよりはいいです","……わかりましたわ。ここで終わるよりは、ましですもの",1],
["同時にやったら二回分になりますか？","同時になさったら、二回分になりますの？",1],
["自分の寝言で起きたことです","自分の寝言で、目が覚めたことですわ",1]]});
HK.Load.toneData("proud",{"F":[
["動物で例えたら、自分は何だと思う？","動物で例えたら、自分は何だと思う？　……私のことか？　獅子に決まってるだろ",1],
["どっちかを選んだら、もう一人を置いていくことになる","どっちかを選べば、もう一人は置いていく。……そういうことだ",1],
["録りためたドラマを一気に見る","録りためたドラマを一気に見る。……文句あるか",1],
["私、こういうのは一人とだけって決めてる","私は、こういうのは一人とだけって決めてる。……文句あるか",1],
["駅で、鳩に本気で追いかけられてる人を見た","駅で、鳩に本気で追いかけられてる奴を見た。……笑ってねえぞ",1],
["なかった。だから今もちょっと探してる","なかった。だから今も探してる。……悪いか",1],
["散歩。知らない道を歩くのが好きで","散歩だ。知らない道を歩くのが好きなんだよ",1],
["誰かに飲ませるくらいなら、自分が飲む","誰かに飲ませるくらいなら、私が飲む",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉が決めたことはわかってる。だが、このままじゃ〈〉だけ出られねえ",1],
["出たら、ちゃんと笑おう","出たら、ちゃんと笑えよ",1],
["それなら、誰も置いていかなくて済むね","それなら、誰も置いていかなくて済むな",1],
["止めてほしくなったら、肩を叩いて","止めてほしくなったら、肩を叩け",1],
["好きな食べ物って何？","好きな食べ物は何だ？",1]]});
HK.Load.toneData("shy",{"F":[
["誰が飲むか、こんなもの","こ、こんなの……の、飲めないよ……"],
["好きな食べ物って何？","好きな食べ物って……何？",1],
["……好きな食べ物って何？","……好きな食べ物って……何？",1],
["動物で例えたら、自分は何だと思う？","動物に例えたら……自分は、何だと思う？",1],
["……動物で例えたら、自分は何だと思う？","……動物に例えたら……自分は、何だと思う？",1],
["最近、いちばん笑ったことは？","最近、いちばん笑ったのって……？",1],
["……最近、いちばん笑ったことは？","……最近、いちばん笑ったのって……？",1],
["人に言えない趣味とかある？","人に言えない趣味とか……ある？",1],
["……人に言えない趣味とかある？","……人に言えない趣味とか……ある？",1],
["最近、泣いたのっていつ？","最近、泣いたのって……いつ？",1],
["……最近、泣いたのっていつ？","……最近、泣いたのって……いつ？",1],
["どんな人がタイプ？","ど、どんな人が……タイプ……？",1],
["……どんな人がタイプ？","……ど、どんな人が……タイプ……？",1],
["今、いちばん怖いことって何？","今、いちばん怖いことって……何？",1],
["……今、いちばん怖いことって何？","……今、いちばん怖いことって……何？",1],
["後悔してることってある？","後悔してることって……ある？",1],
["……後悔してることってある？","……後悔してることって……ある？",1],
["ここを出たら、最初に誰に会いたい？","ここを出たら……最初に、誰に会いたい？",1],
["……ここを出たら、最初に誰に会いたい？","……ここを出たら……最初に、誰に会いたい？",1],
["どっちかを選んだら、もう一人を置いていくことになる","ど、どっちか選んだら……も、もう一人を、置いてく、ことに……",1],
["私はこんなものに従う気はない","こ、こんなものに……し、従う気は、ないから……",1],
["いつまでこうしてる気だ","……い、いつまで、こうしてるつもり……？",1],
["さっさと済ませよう","は、早く……済ませちゃおう……",1]]});
HK.Load.toneData("stern",{"F":[
["…何するつもり？","…何をするつもりだ？"],
["…卵焼き。甘いやつ","…卵焼き。甘い味付けのものだ"],
["なかった。だから今もちょっと探してる","なかった。だから今も少し探している"],
["もうちょっといる","もう少しいる"],
["好きな食べ物って何？","好きな食べ物は何だ？"],
["散歩。知らない道を歩くのが好きで","散歩だ。知らない道を歩くのが好きだ"],
["私、こういうのは一人とだけって決めてる","こういうことは一人とだけと、私は決めている"],
["縛ってもいい？嫌なら言って","縛ってもいいだろうか。嫌なら言ってくれ"],
["…なんでそんなに慣れてるの","…なんでそんなに慣れているんだ"],
["みんなの分、少しでも減らしたくて","みんなの分を、少しでも減らしたかった……"],
["辛っ！でもうまっ！","辛いが、うまいな。"],
["普通、そっちがリードするところだろ","普通は、そちらがリードをするところだ"],
["じゃあ今回だけ、こっちがやってみる","なら今回だけ、こっちがやってみる"],
["初心者マークつけといて","初心者マークをつけておいてくれ"],
["慣れてないけど、優しくするから","慣れてはいないが、優しくしよう"],
["好き。……これでいい？","好き。……これでいいか？"],
["本当は私、最初に会ったときから気になってた","本当は……最初に会ったときから気になっていた"],
["そんなとこ見てたの","そんなところを見ていたのか"],
["考えなしに飲むからだ","馬鹿め、考えなしに飲むからだ"],
["こっちでもいいじゃん","こっちでもいいだろう"],
["…ごめん、決めてるから","…すまない、決めているんだ"],
["三人の方が早く済むかもよ？","三人の方が早く済むかもしれない"],
["もう、みんなでいいじゃん","もう、全員でいいだろう"],
["…ちょっと、向こう向いてて。しばらく","…向こうを向いていろ。しばらく"],
["辛いのって、二回来るんだ…","辛さが二度もくるとは…っ"],
["恥ずかしがってる顔、すごくいい。……もっと見たい","その顔、そそられるな。……もっと見たい"],
["見られてるかもって思うと、興奮する？","見られてるかもと思うと、興奮するのか？"],
["お、俺も恥ずかしいよ……！ で、でも、一緒なら……","私も恥ずかしいさ。だが、君と一緒なら……"],
["…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと","……ここから出られぬことではない。出たあと、ここでのことを忘れてしまうことだ",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉が決めたことは分かっている。だが、このままでは〈〉だけが出られん",1],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","……昔のアイドルのライブ映像を見ながら、振り付けをすべて踊れる",1],
["どっちかを選んだら、もう一人を置いていくことになる","どちらかを選べば、もう一人を置いていくことになる",1],
["どうせなら、全員と仲良くなっといた方が早くない？","どうせなら、全員と打ち解けておいた方が早い",1],
["駅で、鳩に本気で追いかけられてる人を見た","駅で、鳩に本気で追い回されている者を見た",1],
["誰かに飲ませるくらいなら、自分が飲む","誰かに飲ませるくらいなら、私が飲む",1],
["動物で例えたら、自分は何だと思う？","動物に例えるなら、自分は何だと思う？",1],
["……選択肢の一つとしては、覚えておく","……選択肢の一つとしては、覚えておく",1],
["手は膝の上だ。私がいいと言うまで","手は膝の上だ。私がいいと言うまで動かすな",1],
["止めてほしくなったら、肩を叩いて","止めてほしくなったら、肩を叩け",1],
["今、何考えてる？","今、何を考えている？",1],
["一石三鳥ってこと？","一石三鳥ということか",1]]});
HK.Load.toneData("tsun",{"F":[
["……今回だけ。それに、〈〉が隣にいるなら","……今回だけよ。それに、〈〉が隣にいるなら……べ、別にいいけど",1],
["…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと","……ここから出られないこと、じゃなくて。出たあと、ここでのことを忘れちゃうこと。……べ、別に寂しいとかじゃないから",1],
["…ぬいぐるみに名前つけて話しかけてる","……ぬいぐるみに名前つけて、話しかけてる。……わ、悪い？",1],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","……昔のアイドルのライブ映像見ながら、全部の振り付け踊れるわよ。……な、なによその顔",1],
["…自分が、何もできないまま終わること","……自分が、何もできないまま終わること。……い、言わせないでよ",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉が決めたことは分かってる。でも……このままじゃ〈〉だけ出られないじゃない",1],
["お前が決めたことなら、どっちでもついていく","あんたが決めたことなら……どっちでも、ついてってあげる",1],
["ここに来る相手が自分で、よかった？","ここに来たのが私で……よ、よかったわけ？",1],
["これ、誰かの夢の中なんじゃない？","これ、誰かの夢の中なんじゃないの？　……そ、そんなわけないわよね",1],
["どうせなら、全員と仲良くなっといた方が早くない？","どうせなら、全員と仲良くなっといたほうが早いでしょ。……べ、別に友達欲しいわけじゃないから",1],
["付き合ってもいない相手と、できる？","付き合ってもいない相手と……で、できるわけ？",1],
["動物で例えたら、自分は何だと思う？","動物で例えたら、自分は何だと思う？　……べ、別に興味があるわけじゃないけど",1],
["喧嘩するくらいなら、三人でしよう","喧嘩するくらいなら……さ、三人でしましょ。べ、別に私が言い出したわけじゃないから",1],
["散歩。知らない道を歩くのが好きで","散歩よ。知らない道を歩くのが好きなの。……悪い？",1],
["止めてほしくなったら、肩を叩いて","止めてほしくなったら、肩を叩きなさいよ。……ちゃんと止めるから",1],
["私、こういうのは一人とだけって決めてる","私、こういうのは一人とだけって決めてるの。……誰とは言わないけど",1],
["私はこんなものに従う気はない","私は、こんなものに従う気なんてないわよ",1],
["誰かに飲ませるくらいなら、自分が飲む","誰かに飲ませるくらいなら、私が飲むわよ。……べ、別に心配だからじゃないから",1],
["録りためたドラマを一気に見る","録りためたドラマを一気に見るの。……べ、別に暇なわけじゃないから",1],
["駅で、鳩に本気で追いかけられてる人を見た","駅で、鳩に本気で追いかけられてる人を見たの。……笑ってないから",1]]});
HK.Load.toneData("tsun_n",{"F":[
["……今回だけ。それに、〈〉が隣にいるなら","……今回だけだ。それに、〈〉が隣にいるなら",1],
["…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと","……ここから出られないことじゃない。出たあと、ここでのことを忘れることだ",1],
["…ぬいぐるみに名前つけて話しかけてる","……ぬいぐるみに名前をつけて、話しかけてる。……悪いか",1],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","……昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる",1],
["…自分が、何もできないまま終わること","……自分が、何もできないまま終わることだ",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉が決めたことは分かってる。だが、このままじゃ〈〉だけ出られない",1],
["お前が決めたことなら、どっちでもついていく","お前が決めたことなら、どっちでもついていく",1],
["ここに来る相手が自分で、よかった？","ここに来る相手が私で、よかったのか？",1],
["これ、誰かの夢の中なんじゃない？","これは、誰かの夢の中なんじゃないか",1],
["どうせなら、全員と仲良くなっといた方が早くない？","どうせなら、全員と仲良くなっておいたほうが早い",1],
["付き合ってもいない相手と、できる？","付き合ってもいない相手と、できるのか？",1],
["動物で例えたら、自分は何だと思う？","動物で例えたら、自分は何だと思う？",1],
["喧嘩するくらいなら、三人でしよう","喧嘩するくらいなら、三人でしよう",1],
["散歩。知らない道を歩くのが好きで","散歩。知らない道を歩くのが好きだ",1],
["止めてほしくなったら、肩を叩いて","止めてほしくなったら、肩を叩け",1],
["私、こういうのは一人とだけって決めてる","私は、こういうのは一人とだけと決めてる",1],
["私はこんなものに従う気はない","私はこんなものに従う気はない",1],
["誰かに飲ませるくらいなら、自分が飲む","誰かに飲ませるくらいなら、私が飲む",1],
["録りためたドラマを一気に見る","録りためたドラマを一気に見る",1],
["駅で、鳩に本気で追いかけられてる人を見た","駅で、鳩に本気で追いかけられてる人を見た",1]]});
HK.Load.toneData("usan",{"F":[
["いつまでこうしてる気だ","いつまでこうしてる気だい"],
["この部屋の評価、星いくつ？","この部屋の評価、星いくつだい？"],
["これ、ドッキリ番組じゃない？","これ、ドッキリ番組なんじゃない？"],
["主導権は渡さない","主導権は渡さないよ"],
["人の気持ちを何だと思ってる","人の気持ちを何だと思ってるのさ"],
["今は何もしなくていい","今は何もしなくていいよ"],
["私が誰にも無理強いさせない","私がいる限り、誰にも無理強いはさせないさ"],
["私は絶対に嫌だ","私は絶対に嫌だねえ"],
["……今回だけ。それに、〈〉が隣にいるなら","……今回だけさ。それに、〈〉が隣にいるならねえ",1],
["…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと","……ここから出られないことじゃなくてねえ。出たあと、ここでのことを忘れちゃうことさ",1],
["…ぬいぐるみに名前つけて話しかけてる","……ぬいぐるみに名前をつけて、話しかけてるのさ",1],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","昔のアイドルのライブ映像を見ながらねえ、振り付け全部踊れるのさ",1],
["…自分が、何もできないまま終わること","……自分がねえ、何もできないまま終わることさ",1],
["〈〉が一人だけって決めてるのは知ってる。でも、三人なら早く出られる","〈〉が一人だけって決めてるのは知ってるさ。でもねえ、三人なら早く出られるよ",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉が決めたことは分かってるさ。でもねえ、このままじゃ〈〉だけ出られないよ",1],
["お前が決めたことなら、どっちでもついていく","あんたが決めたことなら、どっちでもついていくさ",1],
["ここに来る相手が自分で、よかった？","ここに来たのが私で、よかったかい？",1],
["これ、誰かの夢の中なんじゃない？","これ、誰かの夢の中なんじゃないかい？",1],
["どうせなら、全員と仲良くなっといた方が早くない？","どうせなら、全員と仲良くなっといたほうが早いと思うけどねえ",1],
["付き合ってもいない相手と、できる？","付き合ってもいない相手と、できるのかい？",1],
["動物で例えたら、自分は何だと思う？","動物で例えたら、自分は何だと思うかねえ？",1],
["喧嘩するくらいなら、三人でしよう","喧嘩するくらいなら、三人でしようかねえ",1],
["嫌なら、私は他の方法を探す。時間はある","嫌なら、私は他の方法を探すさ。時間はあるからねえ",1],
["散歩。知らない道を歩くのが好きで","散歩さ。知らない道を歩くのが好きでねえ",1],
["止めてほしくなったら、肩を叩いて","止めてほしくなったら、肩を叩いておくれ",1],
["私、こういうのは一人とだけって決めてる","私はね、こういうのは一人とだけって決めてるのさ",1],
["私は、するなら一人とだけ。それは譲れない","私はねえ、するなら一人とだけなのさ。そこは譲れないよ",1],
["私はこんなものに従う気はない","私はねえ、こんなものに従う気はないのさ",1],
["誰かに飲ませるくらいなら、自分が飲む","誰かに飲ませるくらいなら、私が飲むよ",1],
["録りためたドラマを一気に見る","録りためたドラマを一気に見るのさ。これがいいんだよねえ",1],
["駅で、鳩に本気で追いかけられてる人を見た","駅でさ、鳩に本気で追いかけられてる人を見たんだよねえ",1],
["宇宙飛行士。…笑わないでよ","宇宙飛行士さ。…笑わないでおくれよ",1],
["当ててみて。当たったら教える","当ててごらんよ。当たったら教えてあげる",1]]});
HK.Load.toneData("yankee",{"F":[
["……選択肢の一つとしては、覚えておく","……選択肢の一つとしては、覚えとく"],
["いつまでこうしてる気だ","いつまでこうしてる気だよ"],
["ごめん。それは、まだ言えない","悪い。それは、まだ言えねえ"],
["それなら、誰も置いていかなくて済むね","それなら、誰も置いてかなくて済むな"],
["ただいまより、脱出の実況をお送りします","ただいまより、脱出の実況をお送りするっす"],
["合理的ではある","まあ、合理的っちゃ合理的だな"],
["本当にやるしかないのか","マジでやるしかねえのかよ"],
["次のお題をください","次のお題、くれよ"],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉が決めたことなのはわかってんだよ。けど、このままじゃ〈〉だけ出られねえだろ",1],
["止まった。もう止まってる","止まった。もう止まってんよ",1],
["散歩。知らない道を歩くのが好きで","散歩。知らねえ道ぶらつくのが好きなんだよ",1],
["私、こういうのは一人とだけって決めてる","こういうのは一人とだけって決めてんだよ",1],
["私は〈〉が一番だよ。それは変わらない。……〈〉も、一緒にいてほしい","私は〈〉が一番だ。それは変わらねえ。……〈〉も、一緒にいてくれよ",1],
["動物で例えたら、自分は何だと思う？","動物で例えたら、自分は何だと思う？",1],
["駅で、鳩に本気で追いかけられてる人を見た","駅で、鳩に本気で追いかけられてるやつ見たわ",1],
["……ごめん、それはちょっと","……わりい、それはちょっと",1],
["当ててみろ。当たったら教える","当ててみろよ。当たったら教えてやる",1],
["録りためたドラマを一気に見る","録りためたドラマ、一気に見んだよ",1],
["…猫だな。気が向いたときだけ寄っていく","…猫だな。気が向いたときだけ寄ってく",1],
["聞こえているなら返事をしろ","聞こえてんなら返事しろよ",1],
["…今だ。この状況だ","…今だよ。この状況",1]]});
HK.Load.toneData("sondai",{"F":[
["…ここから出られないこと。じゃなくて、出たあと、ここでのことを忘れちゃうこと","…ここから出られないことではないのだよ。出たあと、ここでのことを忘れてしまうことだ",1],
["〈〉が決めたことは分かってる。でも、このままじゃ〈〉だけ出られない","〈〉が決めたことは分かっているのだがね。このままでは、〈〉だけが出られないではないか",1],
["…昔のアイドルのライブ映像を見ながら、全部の振り付けを踊れる","…昔のアイドルのライブ映像を見ながら、振り付けを全部踊れるのだよ。意外かね？",1],
["どっちかを選んだら、もう一人を置いていくことになる","どちらかを選べば、もう一人を置いていくことになるのだよ",1],
["どうせなら、全員と仲良くなっといた方が早くない？","どうせなら、全員と打ち解けておいた方が早いのではないかね？",1],
["散歩。知らない道を歩くのが好きで","散歩だよ。知らない道を歩くのが好きでね",1],
["手は膝の上だ。私がいいと言うまで","手は膝の上に置きたまえ。私がよいと言うまでだ",1],
["止めてほしくなったら、肩を叩いて","止めてほしくなったら、肩を叩きたまえ",1],
["見てるなら、せめて盛れてて","見ているのなら、せめて見栄えよく映してほしいものだね",1],
["……わかった。ここで終わるよりはいい","……わかった。ここで終わるよりはましだろう",1],
["まだ、かもしれない","まだ、かもしれんね",1],
["これが『しりとりしないと出られない部屋』だったら楽だった","これが『しりとりしないと出られない部屋』だったら、楽だったのだがね",1],
["目線ください","目線をくれたまえ",1],
["今のは忘れて","今のは忘れたまえ",1],
["嫌になったら私がすぐ止める","嫌になったら、私がすぐに止めよう",1],
["この紙、誤字ってない？","この紙、誤字があるのではないかね？",1],
["私、誰とでも、ってわけじゃない","私は、誰とでも、というわけではないのだよ",1],
["もし出られなかったら、どうする","もし出られなかったら、どうするつもりかね",1],
["どうせなら試してみたいだろう","どうせなら、試してみたいだろう？",1],
["まあ、そういうこともある","まあ、そういうこともあるものだよ",1],
["考えなしに飲むからだ","考えなしに飲むからだよ。まったく",1],
["せっかくだ、みんなでやろう","せっかくだ、皆でやろうではないか",1]]});
HK.Load.toneData("cool_soft",{"F":[
["もし出られなかったら、どうする","もし、出られなかったら……どうする",1]]});
HK.Load.toneData("boku_n",{"F":[
["もし出られなかったら、どうする？","もし出られなかったら、どうしようか",1]]});
HK.Load.toneData("god",{"F":[
["犬。たぶん、しっぽを振っているのがばれている","犬である。おそらく、尾を振っているのが見透かされておる",1],
["あ、すまない。変なことを聞いた","む、すまぬ。妙なことを問うた",1],
["私は、こういうことは一人とだけと決めている","私は、こういうことは一人とのみと定めておる",1],
["パン屋。今でも少し思っている","パン屋である。今もなお、少しは思っておる",1],
["なかった。だから今も少し探している","なかった。ゆえに今も、少し探しておる",1],
["駅で、鳩に本気で追いかけられている人を見た","駅で、鳩に本気で追われておる者を見たぞ",1],
["録りためたドラマを一気に見る","録りためたドラマを一気に見るのだ",1],
["すまない。それは、まだ言えない","すまぬ。それは、まだ明かせぬ",1],
["もし出られなかったら、どうする","もし出られなんだら、いかにする",1],
["考えなしに飲むからだ","考えなしに飲むからよ",1],
["これを書いた奴は、絶対モテない","これを書いた者は、決して好かれまい",1],
["絶対にこっちを見るな","決してこちらを見るでないぞ",1],
["まだ時間はある。一つずつやろう","まだ時はある。一つずつ片付けよ",1]]});
HK.Load.toneData("darui_lite",{"F":[
["これが『しりとりしないと出られない部屋』だったら楽だった","……これが『しりとりしないと出られない部屋』なら、楽だったのに",1],
["どっちかを選んだら、もう一人を置いていくことになる","……どっちか選んだら、もう一人は置いてくことになる",1]]});
HK.Load.toneData("keigo_sarc",{"F":[
["その質問には答えないことにしています","その質問には、答えないことにしています。……あしからず",1],
["絶対にこっちを見ないでください","こっちを見ないでください。……絶対に",1]]});
HK.Load.toneData("keigo_bossy",{"F":[
["この紙、誤字っていませんか？","この紙、誤字がありますよ。確認しなさい",1],
["まだ時間はあります。一つずつやりましょう","まだ時間はあります。一つずつ片付けなさい",1],
["もう、こうなったら楽しんだもの勝ちです","こうなったら、楽しんだもの勝ちです。あなたも楽しみなさい",1],
["自分の寝言で起きたことです","自分の寝言で起きたことです。笑いたければ笑いなさい",1],
["考えなしに飲むからです","考えなしに飲むからです。少しは懲りなさい",1]]});
HK.Load.toneData("keigo_flat",{"F":[
["それ、今の状況に関係ありますか？","その質問は、今の状況と関係がありますか",1],
["誰か見ているんでしょう！","誰か、見ているはずです",1],
["そちらが大きいんですよ","そちらが大きいだけです",1]]});
HK.Load.toneData("otaku",{"F":[
["犬。たぶん、しっぽを振っているのがばれています","犬ですな。たぶん、しっぽを振っているのがバレておりますぞ",1],
["パン屋さん。今でもちょっと思っています","パン屋さんですな。今でもちょっと思っておりますぞ",1]]});
HK.Load.toneData("ronkyaku",{"F":[
["犬。たぶん、しっぽを振っているのがばれている","犬だ。おそらく、しっぽを振っているのが見抜かれている",1],
["あ、すまない。変なことを聞いた","ああ、すまない。愚問だった",1],
["辛かったら言え","辛かったら言いたまえ",1],
["私は、こういうことは一人とだけと決めている","私は、こういうことは一人とだけと決めているのだよ",1],
["当ててみろ。当たったら教える","当ててみたまえ。当たったら教えよう",1],
["止まった。もう止まっている","止まった。……もう、止まっているのだよ",1],
["この紙、誤字っていないか","この紙、誤字があるのではないかね",1]]});
});
HK.Load.done('scen-whiteroom', 'c166fd5e40', 1);
