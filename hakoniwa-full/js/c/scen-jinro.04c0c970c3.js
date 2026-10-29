;
/* ==== js/scenario-jinro.js ==== */
HK.Load.def(375,'js/scenario-jinro.js',function(){
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
HK.Load.def(376,'js/jinro-love.js',function(){
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
/* ==== js/jinro-data.js ==== */
HK.Load.def(487,'js/jinro-data.js',function(){
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
HK.Load.def(488,'js/jinro-after.js',function(){
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
;
/* ==== js/jinro-wolfnight.js ==== */
HK.Load.def(489,'js/jinro-wolfnight.js',function(){
(function(){
'use strict';
var HK=window.HK,scen=HK.SCENARIOS&&HK.SCENARIOS.jinro,JA=HK.JinroAfter;
if(!scen|| !JA||HK.SAFE_ON)return;
function L(s){return s.split('|');}
HK.addTo(scen.env,{id:'wolfnight',label:'人狼の勝利の夜',type:'select',def:'random',options:[{v:'random',label:'おまかせ（人狼が勝ったとき、半分くらい）'},{v:'yes',label:'必ず（人狼が勝ったとき）'},{v:'off',label:'なし'}],desc:'人狼陣営が勝ったあと、生き残った人狼（攻め）が、生き残った村人（受け）を「ゲームの続き」として食べに行く（R18）'});
var TW={lover:1,mate:1,fated:1,spouse:1,honmei:0.9,almost:0.8,fwb:0.7,best:0.6,buddy:0.55,childhood:0.55,crush:0.6,friend:0.35};
function close(input,a,b){
var w=0;
(input.ties||[]).forEach(function(t){if((t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i)){var x=TW[t.type]||0;if(x>w)w=x;}});
return w;
}
var T={
soft:L('片づけが終わったあと、{x}は{y}の耳元で囁いた。「人狼が勝ったんだから……最後に残った村人は、食べられないとね」――{y}は笑って押し返そうとしたが、その手にはまるで力が入っていなかった。|{x}は帰ろうとする{y}の手首を掴んで、部屋の奥へ引き寄せた。「まだ終わってない。夜のターンが残ってる」――{y}は呆れた顔をして、それでも逃げなかった。|勝ちが決まった瞬間から、{x}の視線はずっと{y}に向いていた。二人きりになると、{x}は低い声で言った。「いただきます」――{y}は真っ赤になって、小さく頷いた。'),
force:L('{x}は、最後まで自分を疑わなかった{y}を壁際に追い詰めた。「ずっと騙してたのに、気づかなかったんだな」――逃げ道を塞ぐ腕は、ゲームの最中よりずっと本気だった。|みんなが帰ったあと、{x}は{y}を引き留めた。「村人は、狼に食べられるものだろ」――{y}が笑い飛ばそうとした唇を、{x}は無理やり塞いだ。|{x}は{y}を押し倒し、両手首を床に縫いとめた。「最後の夜だ。今度は、本当に襲う」――{y}の抗議の声は、{x}の口づけに飲み込まれた。'),
afterSoft:L('{y}は{x}の胸に顔を埋めて、「次は絶対、村人で勝つから」と呟いた。{x}は笑って、その頭を撫でた。|{x}は{y}の髪を指で梳きながら、「次も騙されてね」と言った。{y}は返事の代わりに、{x}の脇腹をつねった。|二人は、散らかった役職カードの上で、しばらく息を整えていた。'),
melt:L('{y}は乱れた息のまま、{x}の背中にしがみついていた。悔しいのに、腕をほどく気にはなれなかった。|{y}は「……ずるい」とだけ言って、{x}の肩に額を押しつけた。|終わったあと、{y}は自分から{x}の指に指を絡めていた。'),
resent:L('{y}は乱れた服をかき合わせて、{x}を睨んだ。「……ゲームのせいにするなよ」――その声は、まだ少し震えていた。|{y}は何も言わずに部屋を出ていった。扉の閉まる音だけが、やけに大きく響いた。|{y}は{x}の手を振り払った。「騙されたのは、ゲームの中だけにしておきたかった」'),
lost:L('{y}は天井を見上げたまま、しばらく動けなかった。今のが何だったのか、まだうまく飲み込めなかった。|{y}は、{x}がかけてくれた上着を握りしめたまま、ぼんやりと座り込んでいた。|{y}は「……え、今の、なに」と小さく呟いた。{x}は答えずに、{y}の乱れた髪を直した。')
};
function react(y){var t=y.tr||{};return(t.cp||0)+(t.aggr||0)>1.05?'resent':(t.ac||0)>0.55&&(t.fc||0)<0.5?'lost':'melt';}
var end0=JA.end;
JA.end=function(c){
end0.apply(this,arguments);
var S=c.S,env=c.env||{},rng=S.rng,St=HK.State,Pz=HK.Pos,R=HK.R18M;
if(c.winner!=='wolf'||env.wolfnight==='off'|| !R|| !Pz|| !St)return;
if(env.wolfnight!=='yes'&&rng()>=0.5)return;
var force= !HK.Content||HK.Content.on(env,'force','jinro');
var cands=[];
c.wolves.forEach(function(w){
if(!St.here(w))return;
c.P.forEach(function(v){
if(c.isW(v)|| !St.here(v)|| !St.pairSex(w,v)||(HK.sexBlocked&&HK.sexBlocked(w,v)))return;
if(Pz.order(w,v,[w,v])[0]!==w)return;
if(HK.Avoid&&HK.Avoid.of(S,w,v))return;
var cl=close(c.input,w,v),love=cl>=0.45&&HK.canLove&&HK.canLove(w,v)&&HK.canLove(v,w);
if(love&&Pz.nightOff&&Pz.nightOff(S))love=false;
if(!love&& !force)return;
var sc=(love?1+cl:0.2+((w.tr&&w.tr.aggr)||0)*0.5+((w.tr&&w.tr.impulse)||0)*0.4)+rng()*0.3;
cands.push({w:w,v:v,love:love,sc:sc});
});
});
if(!cands.length)return;
cands.sort(function(a,b){return b.sc-a.sc;});
var p=cands[0],x=p.w,y=p.v,m={x:x.name,y:y.name};
HK.Story.step(S,'人狼の勝利の夜');
var X=HK.Lewd,ero= !!(X&&X.conf('jinro')&&X.ero(env)&&X.lv(env)!=='low'&&HK.Ero);
var kr=HK.rng((((S.log||[]).length*7919)+x.i*131+y.i*17+4242)>>>0),KR={rng:kr};
var KB=HK.KabaiR18,kb= !p.love&&KB?kabaiPick(c,kr,x,y):null;
var tgt=kb&&kb.mode==='subA'?kb.z:y,mt={x:x.name,y:tgt.name};
var k=p.love?'afterSoft':react(tgt);
var body=p.love?(ero?loveEro(S,x,y,kr):R.sex(S,x,y,{mood:'love'})):(ero?forceEro(S,KR,x,tgt):R.sex(S,x,tgt,{mood:'rough'}));
var t=HK.Story.fmt(HK.Story.pick(S,p.love?T.soft:T.force),m);
if(kb)t+='\n\n'+kbFill(kb,KB.motive[kb.rel],kr)+(kb.mode!=='both'?' '+kbFill(kb,JK[kb.mode],kr):'');
t+='\n\n'+body;
if(kb&&kb.mode==='both')t+='\n\n'+kbFill(kb,JK.both,kr)+' '+(ero?forceEro(S,KR,x,kb.z,true):(R.say?R.say(S,kb.z,R.isStrong&&R.isStrong(kb.z)?'endure':'climax'):''));
var ngW=kb&&HK.NoGen&&(HK.NoGen.on(kb.z,y)||HK.NoGen.on(x,y));
if(kb&&kb.mode==='watch'){t+='\n\n'+kbFill(kb,ero&& !ngW?KB.watchEro:KB.shame,kr,KR);if(KB.fixed1(kb.z))t+=' '+kbFill(kb,KB.fixed,kr);}
t+='\n\n'+HK.Story.fmt(HK.Story.pick(S,T[k]),mt);
if(kb)t+='\n\n'+kbFill(kb,KB.after[kb.rel],kr);
var KBW={hit:'突き飛ばされた',subA:'身代わりを申し出て、代わりに襲われた',subR:'身代わりを申し出たが、相手にされなかった',both:'二人とも襲われた',watch:'押さえつけられて見せつけられ、興奮してしまった（体の関係にはならない）'};
HK.Story.say(S,{kind:'climax',lewd:true,actors:kb?[x.i,y.i,kb.z.i]:[x.i,y.i],tag:'人狼の勝利の夜',text:t,why:'人狼の'+x.name+'（攻め）が、生き残った村人の'+y.name+'（受け）を「ゲームの続き」として食べに行った'+(p.love?'（近い関係で、合意のうえ）':'（強引に。'+tgt.name+'の反応：'+{melt:'流される',resent:'根に持つ（CP・攻撃性が高い）',lost:'困惑する（ACが高い）'}[k]+'）')+(kb?'。'+kb.z.name+'が'+y.name+'を庇った→'+KBW[kb.mode]:'')+(R.lastPos&&R.lastPos(S)?'・'+R.lastPos(S):''),mag:30});
};
var COLD={apathy:1,fear:1};
function tieOf(input,a,b){var r='';(input.ties||[]).forEach(function(t){if((t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i))r=r||t.type;});return r;}
function kabaiPick(c,kr,x,y){
var KB=HK.KabaiR18,St=HK.State,Pz=HK.Pos;
var zs=c.P.filter(function(z){return z!==y&&z!==x&& !c.isW(z)&&St.here(z)&&tieOf(c.input,z,y)!=='apathy';});
if(!zs.length||kr()>=0.5)return null;
var z=zs.slice().sort(function(a,b){return close(c.input,b,y)-close(c.input,a,y);})[kr()<0.6?0:kr.int(zs.length)];
var take=KB.canTake(z)&&St.pairSex(x,z)&& !(HK.Avoid&&HK.Avoid.of(c.S,x,z))&& !(HK.sexBlocked&&HK.sexBlocked(x,z))&&Pz.order(x,z,[x,z])[0]===x&& !Pz.hardTop(z,x)&& !COLD[tieOf(c.input,x,z)]&& !(HK.NoGen&&HK.NoGen.on(x,z));
var opts=['hit'];if(take)opts.push('subA','both','both');else opts.push('subR');if(KB.canWatch(z))opts.push('watch','watch');
var tie=tieOf(c.input,z,y);
return{z:z,x:x,y:y,mode:opts[kr.int(opts.length)],rel:KB.rel(z,y,tie,{att:close(c.input,z,y)*60,trust:close(c.input,z,y)*60})};
}
function kbFill(kb,list,kr,KR){
var E=HK.Ero,t=list[kr.int(list.length)].replace(/\{w\}/g,kb.z.name).replace(/\{v\}/g,kb.y.name).replace(/\{x\}/g,kb.x.name);
if(!KR|| !E)return t.replace(/\{s:\w+\}。?/g,'');
return t.replace(/\{s:(\w+)\}/g,function(m,k){return E.sfx(KR,k);})
.replace(/\{vm1\}/g,function(){return HK.Moan&&HK.Moan.say?HK.Moan.say(KR,kb.y,'mid',{force:true,fall:false}):E.moan(KR,kb.y,1,{force:true});});
}
var JK={
hit:L('{x}は{w}を片手で突き飛ばした。床に転がった{w}を見下ろして、{x}は冷たく笑った。{x}「邪魔しないで。次はあなたの番かもね｜邪魔をするな。次はあなたの番かもしれない｜邪魔をしないでください。次はあなたの番かもしれませんよ」|'+
'{w}は{x}の腕にしがみついて引き剥がそうとした。けれど振り払われた拍子に、肩から壁に叩きつけられた。{w}は痛みに顔を歪めながら、それでも{v}の名前を呼びつづけた。|'+
'{w}は{v}と{x}のあいだに体をねじ込んだ。{x}は{w}の胸ぐらを掴み、部屋の外へ乱暴に押し出した。閉ざされた扉の向こうから、{v}の声だけが聞こえてきた。'),
subA:L('{w}は{v}を背中に庇ったまま、{x}をまっすぐ見上げた。{w}「{v}の代わりに、私を食べればいい｜{v}の代わりに、私を食べればいい｜{v}の代わりに、私を食べてください」――{x}は面白そうに目を細め、{v}から手を離した。|'+
'{w}は震える手で、自分の襟元をくつろげた。{w}「狼の獲物なら、私がなる。だから{v}は放して｜狼の獲物なら、私がなる。だから{v}は放せ｜狼の獲物なら、私がなります。だから{v}は放してください」――{x}は少し考えてから、新しい獲物に向き直った。|'+
'{w}は{x}の前に膝をつき、{v}を逃がしてほしいと頼んだ。{x}「健気だね。いいよ、あなたで我慢してあげる｜健気だな。いいだろう、あなたで我慢してやる｜健気ですね。いいですよ、あなたで我慢してあげます」――解放された{v}の目の前で、{w}は床に押し倒された。'),
subR:L('{w}は自分が代わりになると申し出た。{x}は鼻で笑って、{w}を押しのけた。{x}「あなたじゃ駄目。欲しいのは{v}だから｜あなたでは駄目だ。欲しいのは{v}だ｜あなたでは駄目です。欲しいのは{v}ですから」|'+
'{w}は{x}の腕を掴み、自分を連れていけと迫った。{x}はその手を、汚れでも払うように振りほどいた。{w}の申し出は、狼の耳には届かなかった。|'+
'{w}は{v}の前に立ちはだかり、身代わりになると言い張った。{x}は{w}を一瞥しただけで、強引に脇へ押しやった。よろめいた{w}の目の前で、{v}は再び押さえ込まれた。'),
both:L('{x}は{v}から体を離すと、立ち尽くしていた{w}のほうへ向き直った。{x}「次はあなた。庇った罰だよ｜次はあなただ。庇った罰だ｜次はあなたです。庇った罰ですよ」――{w}は逃げる間もなく、{v}の隣に押し倒された。|'+
'狼の食事は、一人では終わらなかった。{x}は{w}の手首を掴んで引き寄せ、{v}が見ている前で組み敷いた。{w}の抗議の声は、すぐに途切れ途切れになっていった。|'+
'{x}は二人を並べて床に横たえ、代わる代わる貪った。{v}を庇ったはずの{w}も、やがて同じ声を上げはじめた。互いの乱れた顔が、すぐ隣にあった。'),
watch:L('{x}は{w}を一瞥しただけで、その場に縫いとめた。{x}「そこで見てて。動いたら次はあなただから｜そこで見ていろ。動いたら次はあなただ｜そこで見ていてください。動いたら次はあなたですから」――{w}は壁際にへたり込んだまま、目を逸らすこともできなかった。|'+
'{w}は{x}に腕をねじり上げられ、床に押さえつけられた。顔だけは、{v}のほうへ向けさせられたまま。{w}の目の前で、{v}の服が一枚ずつ剥がされていった。|'+
'{w}は助けに入ったはずだった。それなのに、突き飛ばされて尻もちをついたまま、{v}が乱されていく姿から目を離せない。下腹に熱が溜まっていくのに気づいて、{w}は唇を噛んだ。')
};
var FE={
act:{
mf:L('{x}は{y}を床に押し倒し、もがく両手首を頭の上でひとまとめに押さえつけた。{x}「狼は、獲物を逃がさないんだよ｜狼は、獲物を逃がさない｜狼は、獲物を逃がしませんよ」――脚のあいだに割り込んだ{男性器}が、{y}の{女性器}を一息に奥まで貫いた。{s:hit}。{y}「{v0}」|'+
'{x}は{y}を壁に押しつけ、後ろから腰を抱え込んだ。乱暴にずらされた下着の隙間から、熱い{男性器}がずぶずぶと{ナカ}へ押し入ってくる。{s:hit}。{y}「{v0}」――逃げようとするたびに腰を引き戻され、さらに深く突き上げられた。|'+
'{x}は{y}の脚を肩に担ぎ上げ、真上から体重をかけて{男性器}を沈めた。{s:hit}。{y}「{v1}」――ゲームのあいだ一度も疑わなかった相手に、{y}は{ナカ}の一番奥まで暴かれていった。'),
mm:L('{x}は{y}を床にうつ伏せに押さえつけ、{尻}を割り開いた。{x}「最後まで騙されてたんだ。これくらい当然でしょ｜最後まで騙されていたんだ。これくらい当然だろう｜最後まで騙されていたんですから。これくらい当然でしょう」――張りつめた{男性器}が、{後ろ}をこじ開けて奥まで押し入った。{s:hit}。{y}「{v0}」|'+
'{x}は{y}を壁際に追い詰め、後ろから腰を打ちつけた。{s:hit}。{y}「{v0}」――奥の膨らみを擦り上げられるたびに、{y}の{男性器}まで意思に反して硬くなっていった。|'+
'{x}は{y}を組み敷いたまま{男性器}を握り込んで扱き、{後ろ}を容赦なく突き上げた。{s:hit}。{y}「{v1}」――前と後ろを同時に責められて、抗議の声は途中で裏返った。'),
ff:L('{x}は{y}を床に押し倒し、太腿を割って体を重ねた。{x}「村人は、狼に食べられるものでしょ｜村人は、狼に食べられるものだろう｜村人は、狼に食べられるものでしょう」――指が{女性器}を割り開き、{ナカ}の弱いところを容赦なく掻き回す。{s:wet}。{y}「{v0}」|'+
'{x}は{y}の脚を抱え込んで閉じられないようにし、{女性器}に舌を這わせた。{s:suck}。{y}「{v0}」――{陰核}を吸われるたびに、押しのけようとした手から力が抜けていった。|'+
'{x}は{y}を押さえ込み、自分の{女性器}を{y}の{女性器}に重ねて、逃げる腰を追いかけるように擦りつけた。{s:wet}。{y}「{v1}」――押さえつけられた{胸}の先が、{x}の肌に擦れて硬く尖っていった。'),
fm:L('{x}は{y}を床に押し倒し、その腰の上に乗り上げた。{x}「抵抗しても無駄。夜は狼の時間だから｜抵抗しても無駄だ。夜は狼の時間だ｜抵抗しても無駄ですよ。夜は狼の時間ですから」――無理やり昂らされた{男性器}を、{x}は自分の{女性器}に一気に呑み込んだ。{s:wet}。{y}「{v0}」|'+
'{x}は{y}の手首を床に縫いとめたまま、腰を激しく上下させた。{s:hit}。{y}「{v0}」――{男性器}を{ナカ}で搾り上げられ、やめてくれという声はすぐに掠れていった。|'+
'{x}は{y}の胸板に両手をついて体重をかけ、逃げられないようにした。{s:wet}。{y}「{v1}」――根元まで呑み込まれたまま腰をくねらされ、{y}の{男性器}は意思に反して{x}の{ナカ}で脈打った。')
},
mid:L('{y}は{x}の肩を押し返そうとした。{s:wet}。けれど押し返す腕は、突かれるたびに力を失っていく。{y}「{v1}」――悔しいのに、体の奥だけが勝手に熱を帯びていった。|'+
'{y}は顔を背け、唇を噛んで声をこらえた。{s:hit}。こらえきれずに漏れた声を聞いて、{x}は楽しそうに目を細めた。{y}「{v1}」|'+
'{x}はわざと動きを緩め、{y}の腰がそれを追いかけるのを待った。{s:wet}。気づいた{y}は真っ赤になって首を振ったが、追いかける腰は止まらなかった。{y}「{v1}」'),
peak:{
proud:L('{y}は最後まで{x}を睨みつけていた。{s:hit}。けれど一番奥を抉られるたびに、睨む目から力が抜けていく。{y}「{v1}」――悔しさに歯を鳴らしながら、{y}は{x}の下でイかされた。|'+
'{y}は{x}の背中に爪を立て、声だけは上げまいとした。爪の跡が赤く残っても、腰の震えは止まらない。{s:hit}。屈辱に顔を歪めたまま、{y}の体は大きく跳ね上がった。'),
stern:L('{y}は唇を固く結び、ただ時間が過ぎるのを待とうとした。{s:wet}。けれど体の奥の熱は、{x}の動きに合わせて勝手に膨らんでいく。{y}は短く息を詰め、背を反らして達した。|'+
'{y}は、これはゲームの続きにすぎないと自分に言い聞かせた。言い聞かせる声が、突かれるたびに乱れていく。{s:hit}。最後の一突きで、{y}の中で張りつめていたものがぷつりと切れた。'),
tsun:L('{y}は涙目で{x}を罵りつづけた。罵る声に甘いものが混じりはじめても、口だけは止めなかった。{s:hit}。{y}「{v1}」――イかされた瞬間、{y}は真っ赤になって顔を背けた。|'+
'{y}は、感じてなんかいないと言い張った。言い張る唇は、もう震えていた。{s:wet}。{y}の背中がびくびくと跳ね、言葉とは裏腹に{x}にしがみついていた。'),
gentle:L('{y}は抗うのをやめ、目を閉じて嵐が過ぎるのを待った。{s:wet}。それでも押し寄せる波には逆らえず、{y}は涙を浮かべたまま達した。{x}は満足げに、その涙を舐め取った。|'+
'{y}は{x}の名前を、やめてと乞うように何度も呼んだ。その声が、突かれるたびに甘く崩れていく。{s:hit}。{y}の体が細かく震え、とうとう高みに押し上げられた。'),
devoted:L('{y}は、ゲームの中で{x}を信じた自分を思い出していた。{s:wet}。信じた相手に暴かれていく体が、悔しいほど熱い。{y}は声を殺したまま、びくびくと震えてイった。|'+
'{y}は唇を噛んで耐えた。耐えた分だけ深く溜まった熱が、最後の一突きで一気に弾けた。{s:hit}。{y}の腰ががくがくと跳ね、指先まで痙攣が走った。'),
cool:L('{y}は無表情を保ったまま、{x}の動きをやり過ごそうとした。{s:wet}。保っていたはずの顔が、一突きごとに崩れていく。{y}は小さく息を呑み、びくりと腰を跳ねさせてイかされた。|'+
'{y}は、議論のときと同じように頭を冷やそうとした。{s:hit}。考えようとするたびに、思考が白く途切れる。{y}の喉から、本人も聞いたことのない声が漏れた。'),
free:L('{y}は最初、冗談にしてしまおうと笑ってみせた。{s:hit}。笑い声はすぐに途切れ、喉の奥で引きつった声に変わる。{y}は泣き笑いのような顔で、{x}の下で達した。|'+
'{y}は暴れ、蹴り、{x}を押し返そうとした。{s:hit}。いつもの軽口は一つも出てこない。体が勝手に達して痙攣したとき、{y}は信じられないというように目を見開いた。'),
shy:L('{y}は両手で顔を覆い、{x}の顔を見ないようにした。{s:wet}。指の隙間から漏れる声だけは、どうしても隠せない。{y}は小さく体を丸めたまま、びくびくと震えて達した。|'+
'{y}は消え入りそうな声で、やめてと繰り返した。繰り返すたびに、その声は細く甘くなっていった。{s:hit}。{y}は耳まで真っ赤にして、声もなくイかされた。'),
polite:L('{y}は乱れた息の合間に、丁寧な言葉で{x}をたしなめようとした。{s:wet}。言葉は途中から形を失い、ただの声になる。{y}は慎ましく閉じていた膝をがくがくと震わせて達した。|'+
'{y}は最後まで、取り乱すまいと身を固くしていた。けれど体は、礼儀などお構いなしに{x}を締めつける。{s:hit}。{y}の品のよい顔が、快楽にとろりと崩れた。')
},
fin:{
m:L('{x}の動きが荒く、速くなっていく。{s:hit}。{x}は{y}の腰を強く引き寄せ、一番奥に押しつけたまま果てた。{s:cum}。注ぎ込まれる熱に、{y}の{ナカ}がひくひくと締まった。|'+
'{x}は{y}の奥で何度も脈打ち、{精液}を吐き出しきるまで腰を離さなかった。{s:cum}。溢れた白いものが、{y}の太腿を伝って床に落ちた。|'+
'{x}は果てる寸前に引き抜き、{y}の肌に熱いものをぶちまけた。{s:cum}。{x}「ごちそうさま｜ごちそうさま｜ごちそうさまでした」――汚された{y}を見下ろして、{x}は舌なめずりをした。'),
ff:L('{x}は{y}を責めながら、自分の{女性器}を{y}の太腿に擦りつけていた。{s:wet}。{x}がびくびくと身を震わせて果てると、ようやく指の動きが止まった。|'+
'{x}は{y}が果てたあとも指を抜かず、もう一度、もう一度と責め立てた。{s:wet}。{y}が潮を噴いてぐったりしたところで、{x}はようやく満足げに指を引き抜いた。|'+
'{x}は{y}と脚を絡めたまま腰を揺らしつづけ、二人はほとんど同時に達した。{s:wet}。重なった体のあいだで、どちらのものとも分からない{愛液}が糸を引いた。'),
fm:L('{x}は{y}の上で腰を打ちつけ、{男性器}を奥まで咥え込んだまま締め上げた。{s:cum}。{y}がこらえきれずに{x}の{ナカ}で果てると、{x}も背を反らして達した。|'+
'{x}は{y}が果てても腰を止めなかった。{s:wet}。出し尽くして敏感になった{男性器}を搾られつづけ、{y}は声にならない声を上げた。|'+
'{x}は{y}の{精液}を{ナカ}で受け止め、恍惚とした顔で腰を震わせた。{s:cum}。{x}「ごちそうさま｜ごちそうさま｜ごちそうさまでした」――{x}は汗ばんだ{y}の頬を、獲物を確かめるように撫でた。')
},
again:L('{x}は一度では満足しなかった。ぐったりとした{y}の体を裏返し、また最初から貪りはじめる。{s:hit}。{y}「{v2}」――夜が白むまで、狼の食事は終わらなかった。|'+
'休む間もなく、{x}は{y}の脚をもう一度開かせた。{s:wet}。{y}には、もう押し返す力も残っていない。{y}「{v2}」――二度目は、一度目よりも長く、執拗だった。|'+
'{x}は{y}を膝の上に抱え上げ、逃げられないように腰を抱き寄せた。{s:wet}。{y}「{v2}」――抗い方を忘れた体は、やがて{x}の動きに合わせて揺れはじめていた。')
};
function forceEro(S,KR,x,y,second){
var Pz=HK.Pos,E=HK.Ero,R=HK.R18M,env=S.env||{},kr=KR.rng;
if(HK.NoGen&&HK.NoGen.on(x,y))return second?(R&&R.say?R.say(S,y,'climax'):''):R.sex(S,x,y,{mood:'rough'});
var mx= !Pz.isF(x),my= !Pz.isF(y),k=mx?(my?'mm':'mf'):(my?'fm':'ff');
var per=(HK.personaOf&&HK.personaOf(y))||y.persona||'gentle',strong= !!(R&&R.isStrong&&R.isStrong(y));
var VK=['start','mid','climax'],pk=function(l){return l[kr.int(l.length)];};
function mo(kk,late){return HK.Moan&&HK.Moan.say?HK.Moan.say(KR,y,kk,{force:true,hush:strong,late: !!late}):E.moan(KR,y,VK.indexOf(kk),{force:true});}
function fl(t,late){
if(k==='ff')t=String(t).replace(/\{s:(?:hit|cum)\}/g,'{s:wet}');
return String(t).replace(/\{x\}/g,x.name).replace(/\{y\}/g,y.name).replace(/\{s:(\w+)\}/g,function(m,z){return E.sfx(KR,z);})
.replace(/\{v([012])\}/g,function(m,n){return mo(VK[+n],late||n==='2');});
}
var climax=y.name+'「'+mo('climax',true)+'」';
if(second)return fl(pk(FE.act[k]))+' '+climax;
var short=HK.Lewd.short(env,kr),tail=fl(pk(FE.peak[per]||FE.peak.gentle),true)+' '+climax;
if(short)return fl(pk(FE.act[k]))+' '+tail;
var am=HK.Moan&&HK.Moan.say?HK.Moan.say(KR,x,k==='mf'||k==='mm'?'top':'topmid',{}):E.moan(KR,x,1);
var out=[fl(pk(FE.act[k])),fl(pk(FE.mid)),tail+' '+x.name+'「'+am+'」――'+fl(pk(FE.fin[k==='mf'||k==='mm'?'m':k]),true)];
if(HK.Lewd.high(env))out.push(fl(pk(FE.again),true));
return out.join('\n\n');
}
function loveEro(S,x,y,kr){
var TE=HK.ThickEro,E=HK.Ero,R=HK.R18M;
if(!TE||(HK.NoGen&&HK.NoGen.on(x,y)))return R.sex(S,x,y,{mood:'love'});
var pk=function(a){return E.fresh?E.fresh(S,a,function(l){return HK.Story.pick(S,l);}):HK.Story.pick(S,a);};
var hi=HK.Lewd.high(S.env||{}),short=HK.Lewd.short(S.env||{},kr);
var r=short?TE.short({S:S,pick:pk,a:x,b:y,again:hi}):TE.scene({S:S,pick:pk,rng:S.rng,a:x,b:y,style:HK.ThickSex?HK.ThickSex.style(x):'gentle',open:' ',again:hi});
var t=r.text.replace(/^ \n\n/,'').replace(/\{a\}/g,x.name).replace(/\{b\}/g,y.name);
if(HK.Pos&&HK.Pos.ff(x,y)&&HK.FF&&HK.FF.fix)t=HK.FF.fix({pick:pk,rng:S.rng},t,x,y);
return t;
}
})();
});
;
HK.Load.def(489.5,'tone:scen-jinro',function(){
HK.Load.toneData("mixed",{"F":[
["〈〉、さっきから全員の顔色をうかがってる。〈〉が白なら、それはそれで情報になる。","〈〉さん、さっきから全員の顔色をうかがってますよね。〈〉さんが白なら、それはそれで情報になるよ。"],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉さんが黒なら全部説明がつきます。私は〈〉さんに入れるよ"],
["感情じゃなくて情報で決めよう。今日は〈〉","感情じゃなくて情報で決めよう。今日は〈〉さんに入れます"],
["私は村人だ。根拠を一つずつ反論する","私は村人です。根拠には一つずつ反論する"],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から言いますね。平和な朝の前、〈〉さんは護衛先を探るようなことを言ってました。……正直、私の中では〈〉さんが一番黒いかな。",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","整理させてください。〈〉さんは対抗が出た瞬間、どっちを信じるか即決しましたよね。……根拠、薄くない？　〈〉さんの意見を聞きたいです。",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉さんと〈〉さん、お互いに一度も疑ってないですよね。〈〉さんが白なら、それはそれで情報になるし。",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉さんの発言、昨日と今日で言ってることが逆になってます。〈〉さん、ちゃんと説明して。",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","ちょっと、〈〉さん！　最後まで白だって言ってたじゃないですか！　……嘘つき！",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉さん、今日はずっと口数が少ないですね。……私の中では、〈〉さんが一番黒いかな。",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉さん、今日はずっと口数が少ないですね。〈〉さん、説明して。",1],
["……ここまでか。だが、まだ終わってない","……ここまで、か。でも、まだ終わってませんから",1],
["〈〉は笑ってるけど、目が笑ってない。〈〉、説明してほしい。","〈〉さんは笑ってるけど、目が笑ってないです。〈〉さん、説明してよ。",1],
["人狼がこんなに堂々としてると思う？","人狼がこんなに堂々としてると思います？",1],
["騙すの、正直ちょっとつらかった","騙すの、正直ちょっとつらかったです",1],
["ちょっと待って、それ逆に〈〉が怪しくない？","ちょっと待ってください、それ逆に〈〉さんが怪しくない？",1],
["〈〉の意見に賛成です。〈〉でいいと思う","〈〉さんの意見に賛成です。〈〉さんでいいと思う",1],
["ひとつ引っかかってる。〈〉は自分から話題を振らない。様子見にしても長すぎる。俺は〈〉が怪しいと思う。","ひとつ引っかかってます。〈〉さんは自分から話題を振らないですよね。様子見にしても長すぎ。私は〈〉さんが怪しいと思います。",1],
["今日の占い結果。〈〉は人間","今日の占い結果です。〈〉さんは人間だったよ",1],
["人狼だったら、もっとうまく隠れるって","人狼だったら、もっとうまく隠れますって",1],
["迷ったら一番怪しいところ。〈〉だ","迷ったら一番怪しいところです。〈〉さんだよ",1],
["ピンと来た。〈〉だ","ピンと来ました。〈〉さんだよ",1],
["〈〉って感じじゃないんだよね。〈〉にする","〈〉さんって感じじゃないんですよね。〈〉さんにするよ",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。俺は〈〉が怪しいと思う。","〈〉さんの発言、昨日と今日で言ってることが逆になってます。私は〈〉さんが怪しいと思うな。",1],
["わ、私が狼なわけないでしょ！　顔見れば分かるでしょ！","わ、私が狼なわけないじゃないですか！　顔見れば分かるでしょ！",1],
["私の考えを言う。〈〉、占い師が出たときの反応が早すぎた。知ってたみたいに。俺は〈〉が怪しいと思う。","私の考えを言います。〈〉さん、占い師が出たときの反応が早すぎました。知ってたみたいに。私は〈〉さんが怪しいと思う。",1]],
"O":{
"少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする":"少なくとも〈〉さんは村だと思ってます。だから〈〉さんの意見を軸にするね",
"むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ":"むしろ怪しいのは〈〉さんのほうだと思います。理由も言えるよ",
"私が狼なら、今ここで〈〉を庇ってる":"私が狼なら、今ここで〈〉さんを庇ってますよ。考えればわかるでしょ",
"私が村人であることは、明日の結果が証明する":"私が村人だってことは、明日の結果が証明しますよ",
"出るね。占い師。〈〉――人狼でした":"出るね。占い師です。〈〉さん――人狼でした",
"出るね。占い師。〈〉――人狼ではありませんでした":"出るね。占い師です。〈〉さん――人狼じゃなかったです",
"霊媒師です。昨日処刑された〈〉は――人狼でした":"霊媒師です。昨日処刑された〈〉さんは――人狼だったよ",
"私を吊って、明日後悔しても知らないよ":"私を吊って、明日後悔しても知りませんからね",
"私は村人。断言する":"私は村人です。断言する",
"皆さまのご武運をお祈りしております":"皆さんのご武運を祈ってます。がんばってね",
"疑うなら、どうぞ。何も出てこないから":"疑うなら、どうぞ。何も出てこないから",
"村目線で言わせてもらうと、〈〉の動きが一番狼っぽい":"村目線で言わせてもらうと、〈〉さんの動きが一番狼っぽいです",
"完敗。次は負けないよ":"完敗です。次は負けないよ",
"根拠が薄いのは〈〉のほうだよ":"根拠が薄いのは〈〉さんのほうですよ",
"ここからは協力しよう":"ここからは協力しましょう。揉めてる場合じゃないし",
"〈〉吊りの流れ、誰が作った？　そっちのほうが気になる":"〈〉さん吊りの流れ、誰が作ったんです？　そっちのほうが気になる",
"俺は〈〉を信じる。今日は二人で同じところに入れよう":"私は〈〉さんを信じます。今日は二人で同じところに入れよう",
"え？　あ、うん、そう、そうだよね":"え？　あ、はい、そう、そうだよね",
"いいよ、私を吊っても。でも次は〈〉を吊ってね":"いいですよ、私を吊っても。でも次は〈〉さんを吊ってね",
"くだらない。俺の票を見てから言え":"くだらないですね。私の票を見てから言ってよ",
"……〈〉が怪しいと思う":"……〈〉さんが怪しいと思います。勘だけどね",
"〈〉って、狼のときもこんな感じだったよね？":"〈〉さんって、狼のときもこんな感じでしたよね？",
"ねえ〈〉、今ちょっとドキッとしたでしょ？":"ねえ〈〉さん、今ちょっとドキッとしましたよね？",
"全員が同じことを言い出したら、逆に怪しい。俺は〈〉を見てる":"全員が同じこと言い出したら、逆に怪しいですよ。私は〈〉さんを見てる",
"……そういう言い方するから疑われるんだよ":"……そういう言い方するから疑われるんですよ",
"わ、私は村人だよ":"わ、私は村人です……ほんとだよ",
"私の発言、全部見返してみて":"私の発言、全部見返してください。矛盾なんてないよ",
"……ふん。一人くらいくれてやる":"……ふん。一人くらいくれてやります。安いもんだよ",
"〈〉の推理、穴だらけだよ。指摘しようか？":"〈〉さんの推理、穴だらけですよ。指摘しようか？",
"私を信じて。後悔はさせない":"私を信じてください。後悔はさせないよ",
"対抗します。占い師は私。〈〉は人狼でした":"対抗します。占い師は私。〈〉は人狼だったよ",
"〈〉が言うなら、たぶんそうなんだろうな……":"〈〉さんが言うなら、たぶんそうなんですね……信じるよ",
"私は明日も生きて、〈〉の黒を証明する":"私は明日も生きます。〈〉の黒、絶対証明してやるんだから",
"完璧な村だった！":"完璧な村でした！　みんな最高だよ！",
"村のために言うけど、〈〉の動き、ずっとおかしい":"村のために言いますけど、〈〉さんの動き、ずっとおかしいよ",
"わ、私じゃない……と、思う……いや、違う！":"わ、私じゃないです……と、思う……いや、違う！",
"感じ悪いな。それ、狼ムーブじゃない？":"感じ悪いですね。それ、狼ムーブじゃない？",
"そ、そんなことより〈〉でしょ":"そ、そんなことより〈〉さんですよ。そっち見てよ",
"霊媒結果。〈〉――人狼でした":"霊媒結果です。〈〉――人狼だったよ",
"負けたけど、推理は楽しかった":"負けちゃいました。でも推理は楽しかったな",
"〈〉の意見に賛成です。〈〉でいいと思う":"〈〉さんの意見に賛成です。〈〉でいいと思う",
"黙ってて。考えてるから":"黙っててください。今考えてるんだから",
"占い結果の筋を見れば分かる。〈〉の結果は不自然だ":"占い結果の筋を見れば分かりますよ。〈〉の結果は不自然だって",
"仲間は、まだいるぞ":"仲間は、まだいますよ。油断しないでね",
"信じてよかった……":"信じてよかったです……ほんとに嬉しい",
"本物の占い師は私。〈〉は人狼でした":"本物の占い師は私です。〈〉は人狼だったよ",
"最後まで信じた甲斐があった！":"最後まで信じた甲斐がありました！　嬉しいなあ",
"待って、占い師は私。〈〉は人狼でした":"待ってください、占い師は私。〈〉は人狼だったよ",
"私の勘、当たるんだよ。〈〉":"私の勘、当たるんですよ。ほら、〈〉だよ",
"せいぜい頑張れ":"せいぜい頑張ってください。無理だろうけどね",
"〈〉吊ろう！　外れたら謝る！":"〈〉吊りましょう！　外れたら謝るから！",
"なんとなくだけど、〈〉から狼の匂いがする":"なんとなくですけど、〈〉さんから狼の匂いがするんだよね",
"なんでそんなに焦ってるの":"なんでそんなに焦ってるんですか。変だよ",
"なんか、雰囲気が人狼っぽい！":"なんか、雰囲気が人狼っぽいです！　絶対そうだって",
"〈〉を吊るのは早すぎる。情報が足りない":"〈〉さんを吊るのは早すぎます。情報が足りないよ",
"最高の相棒だった":"最高の相棒でした。ありがとね",
"まあ、楽しかったからいいや":"まあ、楽しかったからいいです。満足だよ",
"いちいち説明させないで":"いちいち説明させないでください。見れば分かるでしょ",
"偽物が出たね。私が本物。〈〉――人狼でした":"偽物が出たね。私が本物です。〈〉――人狼でした",
"〈〉は対抗が出てから急に結果を言い出した。偽物だ":"〈〉さんは対抗が出てから急に結果を言い出しました。偽物だよ",
"はい！　〈〉が人狼だと思います！":"はい！　〈〉さんが人狼だと思います！　絶対だよ！",
"〈〉の笑い方、絶対なんか隠してる！":"〈〉さんの笑い方、絶対なんか隠してます！　見れば分かるよ",
"〈〉、その座り方、絶対狼だって":"〈〉さん、その座り方、絶対狼ですって。分かりやすいよ",
"黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした":"黙ってるつもりでしたけど、言うよ。占い師。〈〉は人狼でした",
"占いCO。結果、〈〉は人狼でした":"占いCOします。結果、〈〉は人狼だったよ",
"両方の発言を比べた。偽物は〈〉だと思う":"両方の発言を比べました。偽物は〈〉だと思う",
"〈〉は違うと思う。むしろ〈〉が怪しい":"〈〉さんは違うと思います。むしろ〈〉が怪しいよ",
"霊媒結果を言うね。〈〉は人狼でした":"霊媒結果を言いますね。〈〉は人狼だったよ",
"いいゲームだった。次も呼んでね":"いいゲームでした。次も呼んでね",
"笑っちゃう。私が人狼なら、もっと上手くやるって":"笑っちゃいます。私が人狼なら、もっと上手くやるって",
"〈〉が黙ってると、なんか落ち着かないんだよね":"〈〉さんが黙ってると、なんか落ち着かないんです。何か喋ってよ",
"黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした":"黙ってるつもりでしたけど、言うよ。占い師。〈〉は人狼ではありませんでした",
"霊媒CO。〈〉、人狼でした":"霊媒COします。〈〉、人狼だったよ",
"あの投票、なんで入れ替えなかったんだろ……":"あの投票、なんで入れ替えなかったんでしょう……悔しいな",
"悪いけど、空気には合わせない。〈〉が怪しい":"悪いですけど、空気には合わせないよ。〈〉が怪しい",
"真贋は判断できない。だから占い師から順に吊る":"真贋は判断できません。だから占い師から順に吊るよ",
"偽物が出たね。私が本物。〈〉――人狼ではありませんでした":"偽物が出たね。私が本物です。〈〉――人狼ではありませんでした",
"よく分からないけど、〈〉が言うなら……":"よく分からないですけど、〈〉さんが言うなら……うん",
"もう一戦やる？":"もう一戦やりませんか？　まだ遊び足りないよ",
"覚えてろ。村人を吊ったこと、後悔させてやる":"覚えててください。村人を吊ったこと、後悔させてやる",
"私が狼だったら、もうとっくにボロ出てるよ！":"私が狼だったら、もうとっくにボロ出てますよ！　見てれば分かるじゃん",
"〈〉、正直に言いなよ。狼でしょ？":"〈〉さん、正直に言ってください。狼でしょ？",
"〈〉はずっと村目線で喋ってるよ":"〈〉さんはずっと村目線で喋ってますよ。見てなかった？",
"明日に情報を残すためにも、今日は〈〉を吊る":"明日に情報を残すためです。今日は〈〉を吊るよ",
"最後まで、誰も気づかなかったね":"最後まで、誰も気づかなかったですね。ふふ、楽しかったよ",
"霊媒結果と照らし合わせれば、〈〉の結果だけ噛み合わない":"霊媒結果と照らし合わせてください。〈〉の結果だけ噛み合わないよ",
"根拠？　顔！　〈〉の顔が言ってる！":"根拠ですか？　顔！　〈〉さんの顔が言ってるじゃん！",
"あはは、やっぱりバレちゃった":"あはは、やっぱりバレちゃいました。悔しいなあ",
"みんな〈〉って言ってるけど、それ流されてない？":"みんな〈〉さんって言ってますけど、それ流されてない？",
"私の分まで、正しく推理してくれ":"私の分まで、正しく推理してください。頼んだよ",
"完敗だ。よく見抜いた":"完敗です。よく見抜いたね",
"多数派に乗るのが一番危ないんだよ。今日は〈〉に入れる":"多数派に乗るのが一番危ないんですよ。今日は〈〉に入れる",
"ごめん！　ゲームだから、ゲームだから！":"ごめんなさい！　ゲームだから、怒らないでよ！",
"本物の占い師は私だよ。〈〉は人狼でした":"本物の占い師は私ですよ。〈〉は人狼だった",
"よし、整理する。候補は〈〉と〈〉。今日は〈〉だ":"よし、整理します。候補は〈〉と〈〉。今日は〈〉だよ",
"いやあ、騙された騙された":"いやあ、騙されました。完全にやられたよ",
"庇う理由がない。〈〉に入れる":"庇う理由がありません。〈〉に入れるよ",
"つまり〈〉が怪しい、のは……さっき否定したんだった":"つまり〈〉が怪しい、のは……さっき否定したんでしたね。ややこしいなあ",
"……み、みんな、がんばって……":"……み、みなさん、がんばってください……応援してるよ……",
"待って、狩人CO。私を吊ると護衛がいなくなる":"待ってください、狩人CO。私を吊ると護衛がいなくなるよ",
"〈〉、さっきから喋らなさすぎじゃない？":"〈〉さん、さっきから喋らなさすぎですよ。何か隠してない？",
"ばれたー！　でも楽しかった！":"ばれちゃいました！　でも楽しかったよ！",
"な、なんで私なのよ！　ちゃんと見てたの？":"な、なんで私なんですか！　ちゃんと見てたの？",
"実は最初から、ずっと狼でした":"実は最初から、ずっと狼でした。気づかなかったでしょ",
"異論は？　……ないな。〈〉だ":"異論はありますか？　……ないね。〈〉だ",
"うそでしょ、私!?　ないって！　信じて！":"うそでしょ、私ですか!?　ないって！　信じて！",
"〈〉、昨日の発言で分からなくなった。悪いけど":"〈〉さん、昨日の発言で分からなくなりました。悪いけど",
"〈〉が黒なら全部説明がつく。私は〈〉に入れる":"〈〉さんが黒なら全部説明がつきます。私は〈〉に入れるよ",
"……し、信じて、ほしかったな……":"……し、信じて、ほしかったです……悲しいな……",
"みんな、いい村だったよ。私たちのほうが上手だったけど":"みんな、いい村でした。私たちのほうが上手だったけどね",
"〈〉の返事、ちょっと早すぎない？　怪しい！":"〈〉さんの返事、ちょっと早すぎませんか？　怪しいよ！",
"あーあ、もっと遊びたかった！　またね！":"あーあ、もっと遊びたかったです！　またね！",
"理由はないけど、〈〉だけは信用できない気がする":"理由はないですけど、〈〉さんだけは信用できない気がするんだよね",
"〈〉の推理、納得できた。〈〉で":"〈〉さんの推理、納得できました。〈〉でいいよ",
"……みんなに合わせます":"……みんなに合わせます。それでいいよね",
"そんなことも分からないの？":"そんなことも分からないんですか？　呆れちゃうよ",
"私が白と分かれば、残りの計算が楽になる":"私が白と分かれば、残りの計算が楽になりますよ。簡単でしょ",
"迷ってる余裕はない。占い師を順に処理していこう":"迷ってる余裕はありません。占い師を順に処理していこう",
"〈〉が怪しい。今日は〈〉だ":"〈〉さんが怪しいです。今日は〈〉だよ",
"俺を吊った瞬間、村の負けが決まるぞ":"私を吊った瞬間、村の負けが決まりますよ。分かってる？",
"ずるい！　〈〉、顔に出なさすぎ！":"ずるいです！　〈〉さん、顔に出なさすぎ！",
"疑われる理由は理解した。だが、結論が早すぎる":"疑われる理由は理解しました。でも、結論が早すぎるよ",
"う、うまく説明できないけど……本当に違うの……":"う、うまく説明できないですけど……本当に違うの……",
"今のうちに言っておく。〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉の意見を聞きたい。":"今のうちに言っておきます。〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉さんの意見を聞きたいな。",
"〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉の意見を聞きたい。":"〈〉さんの発言、昨日と今日で言ってることが逆になってます。〈〉さんの意見を聞きたいな。",
"どっちが本物か分からないなら、両方吊ればいい。単純な話だ":"どっちが本物か分からないなら、両方吊ればいいんです。単純な話じゃん",
"見事だった。認めよう":"見事でした。認めるよ",
"霊媒CO。〈〉、人狼ではありませんでした":"霊媒COします。〈〉、人狼じゃなかったよ",
"その根拠、確率で言えば三割もない":"その根拠、確率で言えば三割もないですよ。弱すぎじゃん",
"全員、今日の投票先を一人ずつ言って。最後にまとめる":"全員、今日の投票先を一人ずつ言ってください。最後にまとめるね",
"……私は村人だった。あとは任せる":"……私は村人でした。あとは任せたよ",
"名前、書き間違えてた……":"名前、書き間違えてました……最悪だよ……",
"完璧な吊り筋だったね":"完璧な吊り筋でしたね。気持ちいいなあ",
"ひとつ引っかかってる。〈〉は霊媒結果を聞いても、表情ひとつ変えなかった。俺の中では、〈〉が一番黒い。":"ひとつ引っかかってます。〈〉は霊媒結果を聞いても、表情ひとつ変えなかった。私の中では、〈〉が一番黒いよ。",
"占い師は吊らない。情報源は残して、グレーから吊ろう":"占い師は吊りません。情報源は残して、グレーから吊ろう",
"全員、〈〉に入れてくれ。責任は俺が取る":"全員、〈〉に入れてください。責任は私が取るから",
"天国から応援してる！":"天国から応援してます！　負けないでよ！",
"時間がない。今日は〈〉に入れよう":"時間がないです。今日は〈〉に入れよう",
"真贋を見極めよう。俺は〈〉が偽物だと判断する":"真贋を見極めましょう。私は〈〉が偽物だと判断するよ",
"感情で吊るのはやめよう。私の投票先を確認してほしい":"感情で吊るのはやめましょう。私の投票先、確認してみてよ",
"推理の勝利だな":"推理の勝利ですね。気持ちいいなあ",
"CO者は明日の結果を見たい。今日はグレー吊りで":"CO者は明日の結果を見たいです。今日はグレー吊りでいこう",
"反論がないなら、〈〉で決めるぞ":"反論がないなら、〈〉で決めますよ。いいね？",
"根拠がそれだけなら話にならない":"根拠がそれだけなら話になりません。出直してきなよ",
"この吊りで、少なくとも一つ情報が増えた":"この吊りで、少なくとも一つ情報が増えました。無駄じゃなかったよ",
"言いにくいけど、言うね。昨日の投票、〈〉だけが流れと違うところに入れてる。〈〉、説明してほしい。":"言いにくいですけど、言うね。昨日の投票、〈〉だけが流れと違うところに入れてる。〈〉さん、説明してほしい。",
"私の考えを言う。〈〉、さっきから全員の顔色をうかがってる。だから今日は〈〉を推す。":"私の考えを言います。〈〉、さっきから全員の顔色をうかがってる。だから今日は〈〉を推すよ。",
"その推理には穴がある。順番に説明しよう":"その推理には穴がありますよ。順番に説明しようか",
"〈〉と〈〉の票が、二日続けて揃ってる。偶然にしては出来すぎ。俺は〈〉が怪しいと思う。":"〈〉と〈〉の票が、二日続けて揃ってます。偶然にしては出来すぎだよ。私は〈〉が怪しいと思う。",
"さっきから気になってたんだけど、〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉の意見を聞きたい。":"さっきから気になってたんですけど、〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉さんの意見を聞きたい。",
"直感って大事だよ。〈〉、目を逸らしたでしょ":"直感って大事なんですよ。〈〉さん、目を逸らしたでしょ",
"私の考えを言う。昨日の投票、〈〉だけが流れと違うところに入れてる。俺の中では、〈〉が一番黒い。":"私の考えを言います。昨日の投票、〈〉だけが流れと違うところに入れてる。私の中では、〈〉が一番黒いよ。",
"〈〉の推理、結論ありきで後から理由をつけてる感じがする。〈〉が白なら、それはそれで情報になる。":"〈〉さんの推理、結論ありきで後から理由をつけてる感じがします。〈〉が白なら、それはそれで情報になるよ。",
"言いにくいけど、言うね。〈〉は笑ってるけど、目が笑ってない。〈〉、説明してほしい。":"言いにくいですけど、言うね。〈〉は笑ってるけど、目が笑ってない。〈〉さん、説明してほしい。",
"私は最初から一貫している。記録を見てくれ":"私は最初から一貫してます。記録を見てよ",
"いいよ、吊っても。でも村人だからね、覚えといて":"いいですよ、吊っても。でも村人だからね、覚えといて",
"昨日の投票、〈〉だけが流れと違うところに入れてる。〈〉の意見を聞きたい。":"昨日の投票、〈〉さんだけが流れと違うところに入れてます。〈〉さんの意見を聞きたいな。",
"確認なんだけど、〈〉、具体的な名前を一度も出してないよね。俺の中では、〈〉が一番黒い。":"確認なんですけど、〈〉、具体的な名前を一度も出してないよね。私の中では、〈〉が一番黒い。",
"〈〉、さっきから全員の顔色をうかがってる。〈〉が白なら、それはそれで情報になる。":"〈〉さん、さっきから全員の顔色をうかがってますよね。〈〉が白なら、それはそれで情報になるよ。",
"今のうちに言っておく。〈〉は投票の直前で票先を変えた。あれ、何を見て変えたの？〈〉の意見を聞きたい。":"今のうちに言っておきます。〈〉は投票の直前で票先を変えた。あれ、何を見て変えたの？〈〉さんの意見を聞きたい。",
"みんな、聞いて。〈〉の推理、結論ありきで後から理由をつけてる感じがする。俺は〈〉が怪しいと思う。":"みんな、聞いてください。〈〉の推理、結論ありきで後から理由をつけてる感じがする。私は〈〉が怪しいと思う。",
"今のうちに言っておく。〈〉は質問されると、質問で返してる。〈〉が白なら、それはそれで情報になる。":"今のうちに言っておきます。〈〉は質問されると、質問で返してる。〈〉が白なら、それはそれで情報になる。",
"私の考えを言う。〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉、説明してほしい。":"私の考えを言います。〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉さん、説明してほしい。",
"みんな、聞いて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。":"みんな、聞いてください。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉さんの意見を聞きたい。",
"今のうちに言っておく。〈〉はCOが出る前から、占い師の真贋に妙に詳しかった。〈〉、説明してほしい。":"今のうちに言っておきます。〈〉はCOが出る前から、占い師の真贋に妙に詳しかった。〈〉さん、説明してほしい。",
"言いにくいけど、言うね。〈〉は質問されると、質問で返してる。俺は〈〉が怪しいと思う。":"言いにくいですけど、言うね。〈〉は質問されると、質問で返してる。私は〈〉が怪しいと思う。",
"〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉、説明してほしい。":"〈〉さんは自分から話題を振りません。様子見にしても長すぎるよ。〈〉さん、説明してほしい。",
"べ、別に焦ってないし！　村人だし！":"べ、別に焦ってないです！　村人だし！",
"整理させて。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。俺は〈〉が怪しいと思う。":"整理させてください。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。私は〈〉が怪しいと思う。",
"言いにくいけど、言うね。〈〉は質問されると、質問で返してる。〈〉、説明してほしい。":"言いにくいですけど、言うね。〈〉は質問されると、質問で返してる。〈〉さん、説明してほしい。",
"〈〉はCOが出る前から、占い師の真贋に妙に詳しかった。俺の中では、〈〉が一番黒い。":"〈〉さんはCOが出る前から、占い師の真贋に妙に詳しかったです。私の中では、〈〉が一番黒いよ。",
"整理させて。〈〉、今日はずっと口数が少ない。〈〉が白なら、それはそれで情報になる。":"整理させてください。〈〉、今日はずっと口数が少ない。〈〉が白なら、それはそれで情報になる。",
"〈〉、具体的な名前を一度も出してないよね。〈〉の意見を聞きたい。":"〈〉さん、具体的な名前を一度も出してないですよね。〈〉さんの意見を聞きたいな。",
"〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。〈〉の意見を聞きたい。":"〈〉さんは「誰でもいい」って言ったのに、急に一人に絞りました。理由が見えないよ。〈〉さんの意見を聞きたい。",
"〈〉はCOが出る前から、占い師の真贋に妙に詳しかった。〈〉、説明してほしい。":"〈〉さんはCOが出る前から、占い師の真贋に妙に詳しかったです。〈〉さん、説明してほしいな。",
"さっきから気になってたんだけど、〈〉の投票先、毎回いちばん安全なところを選んでる気がする。〈〉が白なら、それはそれで情報になる。":"さっきから気になってたんですけど、〈〉の投票先、毎回いちばん安全なところを選んでる気がする。〈〉が白なら、それはそれで情報になる。",
"〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。俺は〈〉が怪しいと思う。":"〈〉さんは対抗が出た瞬間、どっちを信じるか即決しました。根拠が薄いよ。私は〈〉が怪しいと思う。",
"昨夜の噛み先、〈〉を疑ってた人ばかり狙われてる。〈〉が白なら、それはそれで情報になる。":"昨夜の噛み先、〈〉さんを疑ってた人ばかり狙われてます。〈〉が白なら、それはそれで情報になるよ。",
"確認なんだけど、〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。":"確認なんですけど、〈〉は質問されると、質問で返してる。〈〉さんの意見を聞きたい。",
"私の考えを言う。〈〉は自分から話題を振らない。様子見にしても長すぎる。俺は〈〉が怪しいと思う。":"私の考えを言います。〈〉は自分から話題を振らない。様子見にしても長すぎる。私は〈〉が怪しいと思う。",
"〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。":"〈〉さんは質問されると、質問で返してます。〈〉さんの意見を聞きたいな。",
"私を吊るのは、期待値で見て損だ":"私を吊るのは、期待値で見て損ですよ。計算すれば分かるじゃん",
"議論は出尽くした。決を採ろう。俺は〈〉":"議論は出尽くしました。決を採ろう。私は〈〉",
"順番に意見を言おう。最後に決を採る":"順番に意見を言いましょう。最後に決を採るよ",
"整理させて。〈〉は霊媒結果を聞いても、表情ひとつ変えなかった。〈〉が白なら、それはそれで情報になる。":"整理させてください。〈〉は霊媒結果を聞いても、表情ひとつ変えなかった。〈〉が白なら、それはそれで情報になる。",
"私の考えを言う。〈〉の投票先、毎回いちばん安全なところを選んでる気がする。俺の中では、〈〉が一番黒い。":"私の考えを言います。〈〉の投票先、毎回いちばん安全なところを選んでる気がする。私の中では、〈〉が一番黒い。",
"言いにくいけど、言うね。〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉が白なら、それはそれで情報になる。":"言いにくいですけど、言うね。〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉が白なら、それはそれで情報になる。",
"平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺は〈〉が怪しいと思う。":"平和な朝の前、〈〉さんは護衛先を探るようなことを言ってました。私は〈〉が怪しいと思うよ。",
"私のことは後回しでいいよ。もっと怪しい人がいる":"私のことは後回しでいいですよ。もっと怪しい人がいるじゃん",
"〈〉は霊媒結果を聞いても、表情ひとつ変えなかった。〈〉、説明してほしい。":"〈〉さんは霊媒結果を聞いても、表情ひとつ変えませんでした。〈〉さん、説明してほしいな。",
"仮に私が人狼なら、そんな分かりやすいミスはしない":"仮に私が人狼なら、そんな分かりやすいミスはしませんよ。考えれば分かるでしょ",
"信じてたけど、もう庇えない":"信じてましたけど、もう庇えないよ",
"言いにくいけど、言うね。〈〉は投票の直前で票先を変えた。あれ、何を見て変えたの？俺の中では、〈〉が一番黒い。":"言いにくいですけど、言うね。〈〉は投票の直前で票先を変えた。あれ、何を見て変えたの？私の中では、〈〉が一番黒い。",
"後悔しろ。俺は村人だった":"後悔してください。私は村人だったんだよ",
"私を吊ってもいいです。でも、そのあと必ず狼を見つけてください":"私を吊ってもいいです。でも、そのあと必ず狼を見つけてよね",
"確認なんだけど、〈〉は投票の直前で票先を変えた。あれ、何を見て変えたの？俺の中では、〈〉が一番黒い。":"確認なんですけど、〈〉は投票の直前で票先を変えた。あれ、何を見て変えたの？私の中では、〈〉が一番黒い。",
"ここで割れるのが一番まずい。〈〉に揃えよう":"ここで割れるのが一番まずいです。〈〉に揃えよう",
"ひとつ引っかかってる。〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。":"ひとつ引っかかってます。〈〉は質問されると、質問で返してる。〈〉さんの意見を聞きたい。",
"〈〉、今日はずっと口数が少ない。〈〉の意見を聞きたい。":"〈〉さん、今日はずっと口数が少ないですね。〈〉さんの意見を聞きたいな。",
"結論から言うと、〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。俺は〈〉が怪しいと思う。":"結論から言いますね。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。私は〈〉が怪しいと思う。",
"整理させて。〈〉、占い師が出たときの反応が早すぎた。知ってたみたいに。俺の中では、〈〉が一番黒い。":"整理させてください。〈〉、占い師が出たときの反応が早すぎた。知ってたみたいに。私の中では、〈〉が一番黒い。",
"……ここだ。〈〉のこの一言で、全部ひっくり返されたんだ":"……ここです。〈〉のこの一言で、全部ひっくり返されたんだ",
"ちょっといい？〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉の意見を聞きたい。":"ちょっといいですか？〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉さんの意見を聞きたい。",
"結論から言うと、〈〉、今日はずっと口数が少ない。俺は〈〉が怪しいと思う。":"結論から言いますね。〈〉、今日はずっと口数が少ない。私は〈〉が怪しいと思う。",
"やられたー！　いや、今回は完全に〈〉の勝ちだ！":"やられました！　いや、今回は完全に〈〉さんの勝ちだよ！",
"〈〉って感じじゃないんだよね。〈〉にする":"〈〉さんって感じじゃないんですよね。〈〉にする",
"……なんか、〈〉の方が気になる":"……なんか、〈〉さんの方が気になります。なんでだろ",
"推理？　……〈〉が気に食わない。それだけ":"推理ですか？　……〈〉が気に食わない。それだけだよ",
"次は、真っ先にお前を吊るからな":"次は、真っ先にあなたを吊りますから。覚えときなよ",
"証拠を出せ。話はそれからだ":"証拠を出してください。話はそれからだよ",
"……〈〉さんの言う通りだと思います":"……〈〉さんの言う通りだと思います。反論、ないよ",
"感情論だな。データで来い":"感情論ですね。データで来なよ",
"えー、ここで退場!?　まあいっか、応援してるね！":"えー、ここで退場ですか!?　まあいっか、応援してるね！",
"〈〉はCOが出る前から、占い師の真贋に妙に詳しかった。〈〉が白なら、それはそれで情報になる。":"〈〉さんはCOが出る前から、占い師の真贋に妙に詳しかったです。〈〉が白なら、それはそれで情報になるよ。",
"え、あ、あの……ち、違います……":"え、あ、あの……ち、違います……ほんとだよ……",
"〈〉は質問されると、質問で返してる。俺は〈〉が怪しいと思う。":"〈〉さんは質問されると、質問で返してます。私は〈〉が怪しいと思うよ。",
"みんな、聞いて。〈〉、さっきから全員の顔色をうかがってる。〈〉、説明してほしい。":"みんな、聞いてください。〈〉、さっきから全員の顔色をうかがってる。〈〉さん、説明してほしい。",
"整理させて。〈〉はCOが出る前から、占い師の真贋に妙に詳しかった。〈〉の意見を聞きたい。":"整理させてください。〈〉はCOが出る前から、占い師の真贋に妙に詳しかった。〈〉さんの意見を聞きたい。",
"整理させて。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。〈〉が白なら、それはそれで情報になる。":"整理させてください。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。〈〉が白なら、それはそれで情報になる。",
"〈〉は笑ってるけど、目が笑ってない。俺の中では、〈〉が一番黒い。":"〈〉さんは笑ってますけど、目が笑ってない。私の中では、〈〉が一番黒いよ。",
"今のうちに言っておく。〈〉は笑ってるけど、目が笑ってない。俺の中では、〈〉が一番黒い。":"今のうちに言っておきます。〈〉は笑ってるけど、目が笑ってない。私の中では、〈〉が一番黒い。",
"は？　俺を疑う暇があったら、もっと頭を使え":"は？　私を疑う暇があったら、もっと頭を使ってください。ほんと呆れる",
"吊りたきゃ吊れ。後で泣くのはお前らだ":"吊りたければ吊ってください。後で泣くのはあなたたちだよ",
"……あとは、任せたからね":"……あとは、任せましたから。負けないでね",
"ひとつ引っかかってる。〈〉は笑ってるけど、目が笑ってない。〈〉の意見を聞きたい。":"ひとつ引っかかってます。〈〉は笑ってるけど、目が笑ってない。〈〉さんの意見を聞きたい。",
"ちょっと待って、それ逆に〈〉が怪しくない？":"ちょっと待ってください、それ逆に〈〉が怪しくない？",
"結論から言うと、〈〉と〈〉の票が、二日続けて揃ってる。偶然にしては出来すぎ。〈〉、説明してほしい。":"結論から言いますね。〈〉と〈〉の票が、二日続けて揃ってる。偶然にしては出来すぎ。〈〉さん、説明してほしい。",
"吊られた人に票を入れてないの、〈〉だけなんだよね。俺の中では、〈〉が一番黒い。":"吊られた人に票を入れてないの、〈〉さんだけなんですよね。私の中では、〈〉が一番黒いよ。",
"言いにくいけど、言うね。〈〉の推理、結論ありきで後から理由をつけてる感じがする。俺の中では、〈〉が一番黒い。":"言いにくいですけど、言うね。〈〉の推理、結論ありきで後から理由をつけてる感じがする。私の中では、〈〉が一番黒い。",
"結論から言うと、〈〉は投票の直前で票先を変えた。あれ、何を見て変えたの？〈〉、説明してほしい。":"結論から言いますね。〈〉は投票の直前で票先を変えた。あれ、何を見て変えたの？〈〉さん、説明してほしい。",
"平和な朝の前、〈〉は護衛先を探るようなことを言ってた。〈〉の意見を聞きたい。":"平和な朝の前、〈〉さんは護衛先を探るようなことを言ってました。〈〉さんの意見を聞きたいな。",
"ひとつ引っかかってる。〈〉の推理、結論ありきで後から理由をつけてる感じがする。〈〉が白なら、それはそれで情報になる。":"ひとつ引っかかってます。〈〉の推理、結論ありきで後から理由をつけてる感じがする。〈〉が白なら、それはそれで情報になる。",
"〈〉の推理、結論ありきで後から理由をつけてる感じがする。俺の中では、〈〉が一番黒い。":"〈〉さんの推理、結論ありきで後から理由をつけてる感じがします。私の中では、〈〉が一番黒いよ。",
"確認なんだけど、〈〉と〈〉の票が、二日続けて揃ってる。偶然にしては出来すぎ。〈〉、説明してほしい。":"確認なんですけど、〈〉と〈〉の票が、二日続けて揃ってる。偶然にしては出来すぎ。〈〉さん、説明してほしい。",
"ちょっといい？〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。":"ちょっといいですか？〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉さんの意見を聞きたい。",
"言いにくいけど、言うね。〈〉の推理、結論ありきで後から理由をつけてる感じがする。俺は〈〉が怪しいと思う。":"言いにくいですけど、言うね。〈〉の推理、結論ありきで後から理由をつけてる感じがする。私は〈〉が怪しいと思う。",
"ひとつ引っかかってる。〈〉、具体的な名前を一度も出してないよね。俺の中では、〈〉が一番黒い。":"ひとつ引っかかってます。〈〉、具体的な名前を一度も出してないよね。私の中では、〈〉が一番黒い。",
"ちょっといい？〈〉、具体的な名前を一度も出してないよね。俺の中では、〈〉が一番黒い。":"ちょっといいですか？〈〉、具体的な名前を一度も出してないよね。私の中では、〈〉が一番黒い。",
"さっきから気になってたんだけど、〈〉、さっきから全員の顔色をうかがってる。〈〉の意見を聞きたい。":"さっきから気になってたんですけど、〈〉、さっきから全員の顔色をうかがってる。〈〉さんの意見を聞きたい。",
"〈〉、今日はずっと口数が少ない。俺は〈〉が怪しいと思う。":"〈〉さん、今日はずっと口数が少ないですね。私は〈〉が怪しいと思うよ。"}});
HK.Load.toneData("noja",{"F":[
["……ここまでか。だが、まだ終わってない","……ここまでか。じゃが、まだ終わってはおらぬ"],
["〈〉、正直に言いなよ。狼でしょ？","〈〉、正直に申せ。狼じゃろう？"],
["〈〉の意見に賛成です。〈〉でいいと思う","〈〉の意見に賛成じゃ。〈〉でよいと思う"],
["そんなことも分からないの？","そんなことも分からぬのか？"],
["みんな、いい村だったよ。私たちのほうが上手だったけど","皆、よい村であったぞ。私らのほうが一枚上手であったがな",1],
["も、もう！　絶対後悔させてやるんだから！","も、もう！　必ずや後悔させてやるぞ！"],
["ガオー！　……なんちゃって","ガオー！　……なんてな、戯れじゃ"],
["人狼だったら、もっとうまく隠れるって","人狼ならば、もっとうまく隠れるわい"],
["全員が同じことを言い出したら、逆に怪しい。俺は〈〉を見てる","皆が同じことを言い出したら、かえって怪しい。私は〈〉を見ておる"],
["感じ悪いな。それ、狼ムーブじゃない？","感じ悪いのう。それ、狼のやり口ではないか？"],
["理由を聞かれても困るけど、〈〉に一票！","理由を聞かれても困るが、〈〉に一票じゃ！"],
["自信ないけど、みんなと同じで〈〉に","自信はないが、みんなと同じで〈〉に"],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙っておくつもりであったが、言おう。私は占い師じゃ。〈〉は人狼ではなかった",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から申そう。平和な朝の前、〈〉は護衛先を探るようなことを口にしておった。私の見立てでは、〈〉がいちばん黒い。",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。私の中では、〈〉が一番黒い。","結論から申そう。平和な朝の前、〈〉は護衛先を探るようなことを口にしておった。私の見立てでは、〈〉がいちばん黒い。",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","整理させよ。〈〉は対抗が出た途端、どちらを信じるか即座に決めた。根拠が薄い。〈〉、申し開きを聞かせてみよ。",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉と〈〉、互いに一度も疑うておらぬ。〈〉が白ならば、それはそれで手がかりになる。",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉の言うこと、昨日と今日とで逆になっておる。〈〉、申し開きをせよ。",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙っておくつもりであったが、言おう。私は占い師じゃ。〈〉は――人狼であった",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉、今日はずっと口数が少ないのう。私の見立てでは、〈〉がいちばん黒い。",1],
["〈〉、今日はずっと口数が少ない。私の中では、〈〉が一番黒い。","〈〉、今日はずっと口数が少ないのう。私の見立てでは、〈〉がいちばん黒い。",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉、今日はずっと口数が少ないのう。〈〉、申し開きをせよ。",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉は問われると、問いで返しておるな。〈〉自身の考えを聞かせてみよ。",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","皆、今日の票の行き先を一人ずつ申せ。最後にまとめる",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","占いの筋を見れば分かろう。〈〉の結果は不自然じゃ",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","これ、〈〉！　最後まで白いと申しておったではないか！",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉は対抗が出てから慌てて結果を言い出した。偽物じゃ",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒なら、すべて説明がつく。私は〈〉に入れる",1],
["やられたー！　いや、今回は完全に〈〉の勝ちだ！","やられたわ！　いや、此度は完全に〈〉の勝ちじゃ！",1],
["自分では決められないので、今日は流れに乗ります","己では決められぬゆえ、今日は流れに乗るとしよう",1],
["真贋は判断できない。だから占い師から順に吊る","真贋は見極められぬ。ゆえに占い師から順に吊る",1],
["偽物が出たね。私が本物。〈〉――人狼でした","偽物が出たのう。私が本物じゃ。〈〉は――人狼であった",1],
["直感って大事だよ。〈〉、目を逸らしたでしょ","勘というのは大事じゃぞ。〈〉、今、目を逸らしたであろう",1],
["ちょっと待って、それ逆に〈〉が怪しくない？","待て待て、それは逆に〈〉が怪しかろう？",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","ここで割れるのがいちばんまずい。〈〉に揃えようぞ",1],
["〈〉が噛まれるのは分かってたし……あ、いや、予想してたって意味","〈〉が噛まれるのは分かっておったし……あ、いや、予想しておったという意味じゃ",1],
["人狼がこんなに堂々としてると思う？","人狼がこんなに堂々としておると思うか？",1],
["〈〉の推理、穴だらけだよ。指摘しようか？","〈〉の推理、穴だらけじゃよ。指摘してやろうか？",1],
["対抗します。占い師は私。〈〉は人狼でした","対抗する。占い師は私じゃ。〈〉は人狼じゃった",1],
["ひとつ引っかかってる。〈〉の投票先、毎回いちばん安全なところを選んでる気がする。〈〉の意見を聞きたい。","ひとつ引っかかっておる。〈〉の投票先、毎回いちばん安全なところを選んでおる気がするのう。〈〉の意見を聞きたい。",1],
["信じてよかった……","信じてよかったのう……",1],
["待って、占い師は私。〈〉は人狼でした","待て、占い師は私じゃ。〈〉は人狼じゃった",1],
["私を吊って、明日後悔しても知らないよ","私を吊って、明日悔いても知らぬぞ",1],
["偽物が出たね。私が本物。〈〉――人狼ではありませんでした","偽物が出たのう。私が本物じゃ。〈〉は――人狼ではなかった",1],
["両方の発言を比べた。偽物は〈〉だと思う","両方の発言を比べた。偽物は〈〉じゃと思う",1],
["……〈〉が怪しいと思う","……〈〉が怪しいのう",1],
["騙すの、正直ちょっとつらかった","騙すのは、正直ちと辛かったのう",1],
["俺は〈〉を信じる。今日は二人で同じところに入れよう","私は〈〉を信じる。今日は二人で同じところに入れようぞ",1],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉は違うと思うぞ。むしろ〈〉が怪しい",1],
["多数派に乗るのが一番危ないんだよ。今日は〈〉に入れる","多数派に乗るのが一番危ないのじゃ。今日は〈〉に入れるぞ",1],
["後悔しろ。俺は村人だった","後悔するがよい。私は村人じゃった",1],
["庇う理由がない。〈〉に入れる","庇う理由はない。〈〉に入れるぞ",1],
["計算違いだったな","計算違いじゃったのう",1],
["まあ、楽しかったからいいや","まあ、楽しかったからよいわ",1],
["私は村人。断言する","私は村の者じゃ。言い切るぞ",1],
["私が村人であることは、明日の結果が証明する","私が村の者であることは、明日の結果が証すであろう",1],
["議論は出尽くした。決を採ろう。俺は〈〉","議論は出尽くした。決を採ろう。私は〈〉じゃ",1],
["ちょっといい？〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。俺の中では、〈〉が一番黒い。","ちと、よいか？〈〉は対抗が出た瞬間、どちらを信じるか即決した。根拠が薄い。私の中では、〈〉が一番黒いのう。",1],
["〈〉は霊媒結果を聞いても、表情ひとつ変えなかった。俺は〈〉が怪しいと思う。","〈〉は霊媒結果を聞いても、表情ひとつ変えなんだ。私は〈〉が怪しいと思うぞ。",1],
["私は明日も生きて、〈〉の黒を証明する","私は明日も生きて、〈〉の黒を証明してみせよう",1],
["〈〉は霊媒結果を聞いても、表情ひとつ変えなかった。〈〉が白なら、それはそれで情報になる。","〈〉は霊媒結果を聞いても、表情ひとつ変えなんだ。〈〉が白なら、それはそれで情報になる。",1],
["いやあ、騙された騙された","いやあ、騙されたわ",1],
["次は、真っ先にお前を吊るからな","次は、真っ先におぬしを吊るからのう",1],
["あはは、やっぱりバレちゃった","あはは、やはりバレてしもうた",1],
["真贋を見極めよう。俺は〈〉が偽物だと判断する","真贋を見極めようぞ。私は〈〉が偽物と見た",1],
["言いにくいけど、言うね。〈〉の発言、昨日と今日で言ってることが逆になってる。俺は〈〉が怪しいと思う。","言いにくいが、言うぞ。〈〉の発言、昨日と今日で言うておることが逆になっておる。私は〈〉が怪しいと思う。",1],
["笑っちゃう。私が人狼なら、もっと上手くやるって","笑ってしまうわ。私が人狼なら、もっと上手くやる",1],
["えー、ここで退場!?　まあいっか、応援してるね！","なんと、ここで退場か!?　まあよい、応援しておるぞ！",1],
["〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。〈〉が白なら、それはそれで情報になる。","〈〉は「誰でもよい」と言うたのに、急に一人に絞った。理由が見えぬ。〈〉が白なら、それはそれで情報になる。",1],
["私の分まで、正しく推理してくれ","私の分まで、正しく推理してたもれ",1],
["今のうちに言っておく。〈〉はCOが出る前から、占い師の真贋に妙に詳しかった。〈〉、説明してほしい。","……今のうちに言うておく。〈〉はCOが出る前から、占い師の真贋に妙に詳しかったのう。〈〉、説明してもらおうか。",1],
["……なんか、〈〉の方が気になる","……なにやら、〈〉の方が気になるのう",1],
["想定より一日早かった","想定より一日早かったのう",1],
["なんか、あざとくない？","……なにやら、あざとくないか？",1],
["〈〉って感じじゃないんだよね。〈〉にする","〈〉という感じではないのじゃ。〈〉にする",1],
["〈〉、さっきから喋らなさすぎではないか？","〈〉よ、さっきから黙りすぎではないかの？",1],
["〈〉の推理には納得した。〈〉に入れる","〈〉の推理、得心がいった。〈〉に入れるぞ",1],
["反対する理由がないので、〈〉に入れる","反対する理由もないゆえ、〈〉に入れる",1],
["根拠がそれだけなら話にならない","根拠がそれだけでは、話にならぬ",1],
["ひとつ引っかかってる。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。俺の中では、〈〉が一番黒い。","ひとつ引っかかっておる。〈〉は「誰でもよい」と申しておったのに、急に一人に絞った。理由が見えぬ。私の中では、〈〉が一番黒いのう。",1],
["〈〉はCOが出る前から、占い師の真贋に妙に詳しかった。〈〉、説明してほしい。","〈〉はCOが出る前から、占い師の真贋に妙に詳しかったのう。〈〉、申し開きを聞かせてもらおうか。",1],
["あーあ、もっと遊びたかった！　またね！","あーあ、もっと遊びたかったのう！　またのう！",1]],
"O":{
"少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする":"少なくとも〈〉は村の者じゃと思うておる。じゃから〈〉の意見を軸にする",
"むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ":"むしろ怪しいのは〈〉のほうじゃ。理由も言えるぞ",
"私が狼なら、今ここで〈〉を庇ってる":"私が狼ならば、今ここで〈〉を庇うておる",
"私が村人であることは、明日の結果が証明する":"私が村の者であることは、明日の結果が証すであろう",
"出るね。占い師。〈〉――人狼でした":"名乗るぞ。占い師じゃ。〈〉は――人狼であった",
"出るね。占い師。〈〉――人狼ではありませんでした":"名乗るぞ。占い師じゃ。〈〉は――人狼ではなかった",
"霊媒師です。昨日処刑された〈〉は――人狼でした":"霊媒師じゃ。昨日処刑された〈〉は――人狼であった",
"私を吊って、明日後悔しても知らないよ":"私を吊って、明日悔いても知らぬぞ",
"私は村人。断言する":"私は村の者じゃ。言い切るぞ",
"皆さまのご武運をお祈りしております":"皆の武運を祈っておるぞ",
"疑うなら、どうぞ。何も出てこないから":"疑うならば、好きにせい。何も出てはこぬ",
"村目線で言わせてもらうと、〈〉の動きが一番狼っぽい":"村の目線で申すと、〈〉の動きが一番狼らしい",
"完敗。次は負けないよ":"完敗じゃ。次は負けぬぞ",
"根拠が薄いのは〈〉のほうだよ":"根拠が薄いのは〈〉のほうじゃ",
"ここからは協力しよう":"ここからは手を組もうぞ",
"〈〉吊りの流れ、誰が作った？　そっちのほうが気になる":"〈〉を吊る流れ、誰が作った？　そちらのほうが気になる",
"俺は〈〉を信じる。今日は二人で同じところに入れよう":"私は〈〉を信じる。今日は二人で同じところに入れようぞ",
"え？　あ、うん、そう、そうだよね":"む？　あ、うむ、そう、そうじゃな",
"いいよ、私を吊っても。でも次は〈〉を吊ってね":"よいぞ、私を吊っても。じゃが次は〈〉を吊るのじゃぞ",
"くだらない。俺の票を見てから言え":"くだらぬ。私の票を見てから申せ",
"……〈〉が怪しいと思う":"……〈〉が怪しいと思う",
"〈〉って、狼のときもこんな感じだったよね？":"〈〉は、狼のときもこのようであったな？",
"ねえ〈〉、今ちょっとドキッとしたでしょ？":"のう〈〉、今ちとどきりとしたじゃろう？",
"全員が同じことを言い出したら、逆に怪しい。俺は〈〉を見てる":"皆が同じことを申し出したら、かえって怪しい。私は〈〉を見ておる",
"……そういう言い方するから疑われるんだよ":"……そういう物言いをするから疑われるのじゃ"}});
HK.Load.toneData("kansai",{"F":[
["……ご、ごめんなさい……人狼でした……","……ご、ごめん……私、人狼やってん……"],
["〈〉が黙ってると、なんか落ち着かないんだよね","〈〉が黙ってると、なんか落ち着かへんねんな"],
["〈〉の意見に賛成です。〈〉でいいと思う","〈〉の意見に賛成や。〈〉でええと思う"],
["いちいち説明させないで","いちいち説明させんといて"],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から言うとな、平和な朝の前、〈〉は護衛先を探るようなこと言うてたんや。私の中では、〈〉がいちばん黒いで。",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。私の中では、〈〉が一番黒い。","結論から言うとな、平和な朝の前、〈〉は護衛先を探るようなこと言うてたんや。私の中では、〈〉がいちばん黒いで。",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","ちょっと整理させて。〈〉は対抗が出た瞬間、どっち信じるか即決したやろ。根拠が薄いねん。〈〉の意見、聞かせてや。",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉と〈〉、お互いいっぺんも疑うてへんやん。〈〉が白やったら、それはそれで情報になるで。",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉の発言、昨日と今日で言うてることが逆になっとるで。〈〉、説明してくれへん？",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙っとくつもりやったけど、言うわ。占い師や。〈〉は人狼やなかった",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙っとくつもりやったけど、言うわ。占い師や。〈〉は――人狼やった",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉、今日ずっと口数少ないやん。私の中では、〈〉がいちばん黒いで。",1],
["〈〉、今日はずっと口数が少ない。私の中では、〈〉が一番黒い。","〈〉、今日ずっと口数少ないやん。私の中では、〈〉がいちばん黒いで。",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉、今日ずっと口数少ないやん。〈〉、説明してくれへん？",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉、質問されたら質問で返しとるやろ。〈〉の意見、聞かせてや。",1],
["みんな、いい村だったよ。私たちのほうが上手だったけど","みんな、ええ村やったで。私らのほうが一枚上手やったけどな",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","全員、今日の投票先、一人ずつ言うて。最後にまとめるわ",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","占い結果の筋見たら分かるやろ。〈〉の結果は不自然や",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","おい、〈〉！　最後まで白い言うとったやないか！",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉、対抗が出てから急に結果言い出したやろ。偽物や",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒やったら全部説明つくわ。私は〈〉に入れる",1],
["やられたー！　いや、今回は完全に〈〉の勝ちだ！","やられたー！　いや、今回は完全に〈〉の勝ちや！",1],
["自分では決められないので、今日は流れに乗ります","自分では決められへんから、今日は流れに乗っときます",1],
["真贋は判断できない。だから占い師から順に吊る","真贋は判断でけへん。せやから占い師から順に吊るで",1],
["偽物が出たね。私が本物。〈〉――人狼でした","偽物が出たな。私が本物や。〈〉は――人狼やった",1],
["直感って大事だよ。〈〉、目を逸らしたでしょ","直感って大事やで。〈〉、今目ぇ逸らしたやろ",1],
["ちょっと待って、それ逆に〈〉が怪しくない？","ちょ、待って、それ逆に〈〉が怪しない？",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","ここで割れるのがいちばんあかん。〈〉に揃えよ",1],
["どっちが本物か分からないなら、両方吊ればいい。単純な話だ","どっちが本物か分からへんなら、両方吊ったらええ。単純な話や",1],
["私の考えを言う。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。俺は〈〉が怪しいと思う。","私の考え言うわ。〈〉は「誰でもええ」って言うてたのに、急に一人に絞ったやろ。理由が見えへん。私は〈〉が怪しいと思う。",1],
["占い結果が……あれ、どっちがどっちに黒出したんだっけ","占い結果が……あれ、どっちがどっちに黒出したんやっけ",1],
["〈〉、正直に言いなよ。狼でしょ？","〈〉、正直に言いや。狼やろ？",1],
["真贋を見極めよう。俺は〈〉が偽物だと判断する","真贋、見極めよ。私は〈〉が偽もんやと思う",1],
["私の考えを言う。〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉が白なら、それはそれで情報になる。","私の考え言うわ。〈〉、自分から話題振らへんやろ。様子見にしても長すぎや。〈〉が白やったら、それはそれで情報になるで。",1],
["私を信じて。後悔はさせない","私を信じて。後悔はさせへん",1],
["反対する理由がないので、〈〉で","反対する理由あらへんし、〈〉で",1],
["なんでそんなに焦ってるの","なんでそんなに焦っとるん",1],
["……〈〉さんの言う通りだと思います","……〈〉さんの言う通りやと思う",1],
["ちょっといい？〈〉の推理、結論ありきで後から理由をつけてる感じがする。俺の中では、〈〉が一番黒い。","ちょっとええ？〈〉の推理、結論ありきで後から理由つけてる感じがするねん。私の中では、〈〉がいちばん黒いで。",1],
["あはは、やっぱりバレちゃった","あはは、やっぱりバレてもうた",1],
["覚えてろ。村人を吊ったこと、後悔させてやる","覚えとき。村人吊ったこと、後悔させたるわ",1],
["信じなくていいわよ、どうせ後悔するんだから","信じんでええよ、どうせ後悔するんやから",1],
["対抗します。占い師は私。〈〉は人狼でした","対抗するわ。占い師は私や。〈〉は人狼やった",1],
["村のために言うけど、〈〉の動き、ずっとおかしい","村のために言うけど、〈〉の動き、ずっとおかしいで",1],
["……ふん。一人くらいくれてやる","……ふん。一人くらいくれたるわ",1],
["待って、狩人CO。私を吊ると護衛がいなくなる","待って、狩人CO。私吊ったら護衛おらんようになるで",1],
["〈〉は笑ってるけど、目が笑ってない。〈〉、説明してほしい。","〈〉、笑とるけど目が笑てへんねん。〈〉、説明してくれへん？",1],
["いいよ、吊っても。でも村人だからね、覚えといて","ええよ、吊っても。せやけど村人やからな、覚えといて",1],
["私は明日も生きて、〈〉の黒を証明する","私は明日も生きて、〈〉の黒を証明したる",1],
["仲間は、まだいるぞ","仲間は、まだおるで",1],
["まあ、楽しかったからいいや","まあ、楽しかったからええわ",1],
["〈〉を吊るのは早すぎる。情報が足りない","〈〉を吊るのは早すぎるわ。情報が足りへん",1],
["あそこで入れ替えてれば……！","あそこで入れ替えとったら……！",1],
["黙ってて。考えてるから","黙っといて。考えとるから",1],
["ひとつ引っかかってる。〈〉は自分から話題を振らない。様子見にしても長すぎる。俺は〈〉が怪しいと思う。","ひとつ引っかかっとるねん。〈〉、自分から話題振らへんやろ。様子見にしても長すぎや。私は〈〉が怪しいと思う。",1],
["〈〉、今までずっと一緒にいたでしょ。私が嘘ついたこと、ある？","〈〉、今までずっと一緒におったやろ。私が嘘ついたこと、ある？",1],
["ひとつ引っかかってる。〈〉、さっきから全員の顔色をうかがってる。〈〉が白なら、それはそれで情報になる。","ひとつ引っかかっとるねん。〈〉、さっきから全員の顔色うかがっとるやろ。〈〉が白やったら、それはそれで情報になるで。",1],
["……べ、別に悔しくなんかないし","……べ、別に悔しないし",1],
["〈〉が噛まれるのは分かってたし……あ、いや、予想してたって意味","〈〉が噛まれるのは分かってたし……あ、いや、予想してたって意味やで",1],
["人狼だったら、もっとうまく隠れるって","人狼やったら、もっとうまく隠れるって",1],
["〈〉の推理、納得できた。〈〉で","〈〉の推理、納得したわ。〈〉で",1],
["理由を聞かれても困るけど、〈〉に一票！","理由聞かれても困るけど、〈〉に一票や！",1],
["あーあ、もっと遊びたかった！　またね！","あーあ、もっと遊びたかったわ！　ほなな！",1],
["いやあ、騙された騙された","いやあ、まんまと騙されたわ",1],
["順番に意見を言おう。最後に決を採る","順番に意見言うていこか。最後に決採るで",1]],
"O":{
"少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする":"少なくとも〈〉は村やと思っとる。せやから〈〉の意見を軸にするわ",
"むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ":"むしろ怪しいのは〈〉のほうやと思う。理由も言えるで",
"私が狼なら、今ここで〈〉を庇ってる":"私が狼やったら、今ここで〈〉庇ってるわ",
"私が村人であることは、明日の結果が証明する":"私が村人やってことは、明日の結果が証明するわ",
"出るね。占い師。〈〉――人狼でした":"出るわ。占い師。〈〉――人狼やった",
"出るね。占い師。〈〉――人狼ではありませんでした":"出るわ。占い師。〈〉――人狼ちゃうかった",
"霊媒師です。昨日処刑された〈〉は――人狼でした":"霊媒師や。昨日処刑された〈〉は――人狼やった",
"私を吊って、明日後悔しても知らないよ":"私吊って、明日後悔しても知らんで",
"私は村人。断言する":"私は村人や。断言するわ",
"皆さまのご武運をお祈りしております":"みんなの武運、祈っとるで",
"疑うなら、どうぞ。何も出てこないから":"疑うんやったら、どうぞ。なんも出てけえへんから",
"村目線で言わせてもらうと、〈〉の動きが一番狼っぽい":"村目線で言わせてもらうと、〈〉の動きがいっちゃん狼っぽいわ",
"完敗。次は負けないよ":"完敗や。次は負けへんで",
"根拠が薄いのは〈〉のほうだよ":"根拠薄いんは〈〉のほうやで",
"ここからは協力しよう":"ここからは協力しよ",
"〈〉吊りの流れ、誰が作った？　そっちのほうが気になる":"〈〉吊りの流れ、誰が作ったん？　そっちのほうが気になるわ",
"俺は〈〉を信じる。今日は二人で同じところに入れよう":"私は〈〉信じるわ。今日は二人で同じとこに入れよ",
"え？　あ、うん、そう、そうだよね":"え？　あ、うん、せや、せやんな",
"いいよ、私を吊っても。でも次は〈〉を吊ってね":"ええよ、私吊っても。でも次は〈〉吊ってな",
"くだらない。俺の票を見てから言え":"しょうもな。私の票見てから言いや",
"……〈〉が怪しいと思う":"……〈〉が怪しいと思うわ",
"〈〉って、狼のときもこんな感じだったよね？":"〈〉って、狼のときもこんな感じやったやんな？",
"ねえ〈〉、今ちょっとドキッとしたでしょ？":"なあ〈〉、今ちょっとドキッとしたやろ？",
"全員が同じことを言い出したら、逆に怪しい。俺は〈〉を見てる":"全員同じこと言い出したら、逆に怪しいで。私は〈〉見てる",
"……そういう言い方するから疑われるんだよ":"……そういう言い方するから疑われるんやで"}});
HK.Load.toneData("mukuchi",{"F":[
["あの投票、なんで入れ替えなかったんだろ……","……あの投票、なんで入れ替えなかった"],
["いちいち説明させないで","……説明させないで"],
["そ、そんなことより〈〉でしょ","……それより、〈〉"],
["対抗します。占い師は私。〈〉は人狼でした","……対抗。占い師、私。〈〉、人狼"],
["待って、狩人CO。私を吊ると護衛がいなくなる","……狩人CO。私を吊ると、護衛がいなくなる"],
["霊媒結果を言うね。〈〉は人狼でした","……〈〉、人狼だった"],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","……占い師。〈〉は、人間",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","……〈〉。護衛先、探ってた。……黒",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。私の中では、〈〉が一番黒い。","……〈〉。護衛先、探ってた。……黒",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","……決めるの、早すぎ。〈〉、なんで",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","……〈〉と〈〉、一度も疑い合ってない",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","……昨日と逆。〈〉、説明",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","……〈〉、口数少ない。……黒",1],
["〈〉、今日はずっと口数が少ない。私の中では、〈〉が一番黒い。","……〈〉、口数少ない。……黒",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","……〈〉、口数少ない。説明して",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","……質問に、質問で返してる。〈〉の考え、聞きたい",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","……占い師。〈〉は、人狼",1],
["みんな、いい村だったよ。私たちのほうが上手だったけど","……いい村だった。……でも、勝ち",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","……投票先。一人ずつ",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","……〈〉の結果、不自然",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","……〈〉。白いって、言ったのに",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","……出るのが遅い。〈〉、偽物",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","……〈〉が黒なら、全部つながる。〈〉に入れる",1],
["えー、ここで退場!?　まあいっか、応援してるね！","……退場。……応援してる",1],
["やられたー！　いや、今回は完全に〈〉の勝ちだ！","……負けた。〈〉の勝ち",1],
["自分では決められないので、今日は流れに乗ります","……決められない。流れに乗る",1],
["真贋は判断できない。だから占い師から順に吊る","……どっちが本物か、分からない。占い師から吊る",1],
["偽物が出たね。私が本物。〈〉――人狼でした","……私が本物。〈〉は、人狼",1],
["直感って大事だよ。〈〉、目を逸らしたでしょ","……〈〉、今、目を逸らした",1],
["ちょっと待って、それ逆に〈〉が怪しくない？","……待って。逆に、〈〉が怪しい",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","……割れるのは、まずい。〈〉に揃える",1],
["覚えてろ。村人を吊ったこと、後悔させてやる","……覚えてて。村人を吊ったこと",1],
["〈〉、さっきから喋らなさすぎじゃない？","……〈〉、喋らなさすぎ",1],
["迷ったら一番怪しいところ。〈〉だ","……迷ったら、いちばん怪しい〈〉",1],
["〈〉は霊媒結果を聞いても、表情ひとつ変えなかった。俺は〈〉が怪しいと思う。","……〈〉が、怪しい",1],
["〈〉の推理、穴だらけだよ。指摘しようか？","……〈〉の推理、穴だらけ",1],
["〈〉は霊媒結果を聞いても、表情ひとつ変えなかった。〈〉が白なら、それはそれで情報になる。","……〈〉、霊媒結果にも無表情。……白なら、それも情報",1],
["次は、真っ先にお前を吊るからな","……次は、真っ先にきみを吊る",1],
["真贋を見極めよう。俺は〈〉が偽物だと判断する","……偽物は、〈〉",1],
["言いにくいけど、言うね。〈〉の発言、昨日と今日で言ってることが逆になってる。俺は〈〉が怪しいと思う。","……〈〉、言ってることが逆。……怪しい",1],
["霊媒CO。〈〉、人狼ではありませんでした","……〈〉、人狼じゃなかった",1],
["〈〉、さっきから全員の顔色をうかがってる。〈〉が白なら、それはそれで情報になる。","……〈〉、みんなの顔色、うかがってる。……白なら、それも情報",1],
["霊媒CO。〈〉、人狼でした","……〈〉、人狼だった",1],
["〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。〈〉が白なら、それはそれで情報になる。","……〈〉、急に一人に絞った。……理由が、見えない",1],
["私の分まで、正しく推理してくれ","……私の分まで、推理して",1],
["私の発言、全部見返してみて","……私の発言、全部、見返して",1],
["〈〉、その座り方、絶対狼だって","……〈〉、その座り方。……狼",1],
["最後まで信じた甲斐があった！","……信じて、よかった",1],
["確認なんだけど、〈〉は笑ってるけど、目が笑ってない。俺は〈〉が怪しいと思う。","……〈〉、目が笑ってない。……怪しい",1],
["整理させて。平和な朝の前、〈〉は護衛先を探るようなことを言ってた。〈〉が白なら、それはそれで情報になる。","……平和な朝の前、〈〉、護衛先を探ってた",1],
["私の考えを言う。〈〉は投票の直前で票先を変えた。あれ、何を見て変えたの？俺は〈〉が怪しいと思う。","……〈〉、直前で票を変えた。……怪しい",1],
["〈〉、昨日の発言で分からなくなった。悪いけど","……〈〉、昨日の発言で、わからなくなった",1],
["ちょっといい？〈〉、さっきから全員の顔色をうかがってる。〈〉の意見を聞きたい。","……〈〉、みんなの顔色、うかがってる。……〈〉、どう思う",1],
["完全に騙された。見事だよ、〈〉","……騙された。……見事、〈〉",1],
["〈〉が噛まれるのは分かってたし……あ、いや、予想してたって意味","……〈〉が噛まれるのは、分かってた。……あ。予想してた、って意味",1]],
"O":{
"少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする":"……〈〉は村。〈〉に、合わせる",
"むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ":"……怪しいのは、〈〉",
"私が狼なら、今ここで〈〉を庇ってる":"……私が狼なら、〈〉を庇ってる",
"私が村人であることは、明日の結果が証明する":"……村人。明日、わかる",
"出るね。占い師。〈〉――人狼でした":"……占い師。〈〉、人狼",
"出るね。占い師。〈〉――人狼ではありませんでした":"……占い師。〈〉、人狼じゃない",
"霊媒師です。昨日処刑された〈〉は――人狼でした":"……霊媒師。〈〉、人狼だった",
"私を吊って、明日後悔しても知らないよ":"……吊ったら、後悔する",
"私は村人。断言する":"……村人。断言する",
"皆さまのご武運をお祈りしております":"……みんな、がんばって",
"疑うなら、どうぞ。何も出てこないから":"……疑っていい。何も出ない",
"村目線で言わせてもらうと、〈〉の動きが一番狼っぽい":"……〈〉が、一番狼っぽい",
"完敗。次は負けないよ":"……完敗。次は、勝つ",
"根拠が薄いのは〈〉のほうだよ":"……根拠が薄いのは、〈〉",
"ここからは協力しよう":"……ここから、協力",
"〈〉吊りの流れ、誰が作った？　そっちのほうが気になる":"……〈〉吊りの流れ、誰が作った",
"俺は〈〉を信じる。今日は二人で同じところに入れよう":"……〈〉を信じる。同じところに、入れる",
"え？　あ、うん、そう、そうだよね":"……え。あ、うん",
"いいよ、私を吊っても。でも次は〈〉を吊ってね":"……吊っていい。次は、〈〉",
"くだらない。俺の票を見てから言え":"……くだらない。票、見て",
"……〈〉が怪しいと思う":"……〈〉が、怪しい",
"〈〉って、狼のときもこんな感じだったよね？":"……〈〉、狼のときも、こうだった",
"ねえ〈〉、今ちょっとドキッとしたでしょ？":"……〈〉、今、ドキッとした",
"全員が同じことを言い出したら、逆に怪しい。俺は〈〉を見てる":"……みんな同じは、怪しい。〈〉を見てる",
"……そういう言い方するから疑われるんだよ":"……その言い方だから、疑われる"}});
HK.Load.toneData("polite",{"F":[
["ごめん！　ゲームだから、ゲームだから！","すみません！　ゲームですから、ゲームですから！"],
["そ、そんなことより〈〉でしょ","そ、そんなことより〈〉さんでしょう"],
["ちょっと、言い方","ちょっと、その言い方はどうかと思います"],
["みんな、いい村だったよ。私たちのほうが上手だったけど","皆さん、いい村でしたよ。私たちのほうが上手でしたけど"],
["よく分からないけど、〈〉が言うなら……","よく分かりませんが、〈〉さんがおっしゃるなら……"],
["人狼だったら、もっとうまく隠れるって","人狼だったら、もっとうまく隠れますよ"],
["待って、占い師は私。〈〉は人狼でした","待ってください、占い師は私です。〈〉さんは人狼でした"],
["本物の占い師は私。〈〉は人狼でした","本物の占い師は私です。〈〉さんは人狼でした"],
["理由を聞かれても困るけど、〈〉に一票！","理由を聞かれても困りますが、〈〉さんに一票です！"],
["確認なんだけど、〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉が白なら、それはそれで情報になる。","確認なんですが、〈〉さんは対抗が出た瞬間、どちらを信じるか即決しました。根拠が薄いです。〈〉さんが白なら、それはそれで情報になります。"],
["私を信じて。後悔はさせない","私を信じてください。後悔はさせません"],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙っているつもりでしたが、申し上げます。占い師です。〈〉さんは、人狼ではありませんでした",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から申し上げますと、平和な朝の前、〈〉さんは護衛先を探るようなことをおっしゃっていました。私の中では、〈〉さんがいちばん疑わしいです。",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","整理させてください。〈〉さんは対抗が出た瞬間、どちらを信じるか即決なさいました。根拠が薄いように思います。〈〉さんのご意見を伺いたいです。",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙っているつもりでしたが、申し上げます。占い師です。〈〉さんは、人狼でした",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉さんと〈〉さん、お互いに一度も疑っていらっしゃいません。〈〉さんが白なら、それはそれで情報になります。",1],
["わ、私じゃない……と、思う……いや、違う！","わ、私ではありません……と、思います……いえ、違います！",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉さんのご発言、昨日と今日で逆になっています。〈〉さん、ご説明いただけますか。",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","〈〉さん！　最後まで白だとおっしゃっていたではありませんか！",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉さんが黒なら、すべて説明がつきます。私は〈〉さんに入れます",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉さん、今日はずっと口数が少ないですね。私の中では、〈〉さんがいちばん疑わしいです。",1],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉さんは違うと思います。むしろ、〈〉さんのほうが怪しいかと",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉さんは質問されると、質問で返していらっしゃいます。〈〉さんのご意見を伺いたいです。",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉さん、今日はずっと口数が少ないですね。〈〉さん、ご説明いただけますか。",1],
["つかれた。〈〉の隣がいちばん安心する","疲れました。〈〉さんの隣が、いちばん安心します",1],
["黙ってて。考えてるから","少し静かにしていてください。考えていますから",1],
["霊媒結果。〈〉――人狼でした","霊媒結果です。〈〉さん――人狼でした",1],
["反対する理由がないので、〈〉で","反対する理由がないので、〈〉さんで",1],
["まあ、楽しかったからいいや","まあ、楽しかったのでよしとします",1],
["〈〉が人狼なら、あの占い結果は……ああ、そういうことか","〈〉さんが人狼なら、あの占い結果は……ああ、そういうことですか",1],
["〈〉が黙ってると、なんか落ち着かないんだよね","〈〉さんが黙っていると、なんだか落ち着かないんですよね",1],
["悪いけど、空気には合わせない。〈〉が怪しい","申し訳ないですが、空気には合わせません。〈〉さんが怪しいです",1],
["結論から言うと、〈〉、具体的な名前を一度も出してないよね。〈〉が白なら、それはそれで情報になる。","結論から言いますと、〈〉さん、具体的な名前を一度も出していませんよね。〈〉さんが白なら、それはそれで情報になります。",1],
["なんとなくだけど、〈〉から狼の匂いがする","なんとなくですが、〈〉さんから狼の匂いがします",1],
["対抗します。占い師は私。〈〉は人狼でした","対抗します。占い師は私です。〈〉さんは人狼でした",1],
["〈〉が白で、〈〉も白だから……あれ、そしたら狼いなくない？","〈〉さんが白で、〈〉さんも白ですから……あれ、そうしたら狼がいなくなりませんか？",1]],
"O":{
"少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする":"少なくとも〈〉さんは村人だと思っています。ですから、〈〉さんの意見を軸にします",
"むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ":"むしろ怪しいのは〈〉さんのほうだと思います。理由もお話しできます",
"私が狼なら、今ここで〈〉を庇ってる":"私が狼なら、今ここで〈〉さんを庇っています",
"私が村人であることは、明日の結果が証明する":"私が村人であることは、明日の結果が証明します",
"出るね。占い師。〈〉――人狼でした":"名乗ります。占い師です。〈〉さんは――人狼でした",
"出るね。占い師。〈〉――人狼ではありませんでした":"名乗ります。占い師です。〈〉さんは――人狼ではありませんでした",
"私を吊って、明日後悔しても知らないよ":"私を吊って、明日後悔しても知りませんよ",
"私は村人。断言する":"私は村人です。断言します",
"疑うなら、どうぞ。何も出てこないから":"疑うなら、どうぞ。何も出てきませんから",
"村目線で言わせてもらうと、〈〉の動きが一番狼っぽい":"村目線で言わせていただくと、〈〉さんの動きが一番狼らしいです",
"完敗。次は負けないよ":"完敗です。次は負けません",
"根拠が薄いのは〈〉のほうだよ":"根拠が薄いのは、〈〉さんのほうです",
"ここからは協力しよう":"ここからは協力しましょう",
"〈〉吊りの流れ、誰が作った？　そっちのほうが気になる":"〈〉さんを吊る流れは、誰が作ったんですか？　そちらのほうが気になります",
"俺は〈〉を信じる。今日は二人で同じところに入れよう":"私は〈〉さんを信じます。今日は二人で同じ方に入れましょう",
"え？　あ、うん、そう、そうだよね":"えっ？　あ、はい、そう、そうですよね",
"いいよ、私を吊っても。でも次は〈〉を吊ってね":"私を吊っても構いません。でも、次は〈〉さんを吊ってくださいね",
"くだらない。俺の票を見てから言え":"くだらないです。私の票を見てからおっしゃってください",
"……〈〉が怪しいと思う":"……〈〉さんが怪しいと思います",
"〈〉って、狼のときもこんな感じだったよね？":"〈〉さんって、狼のときもこんな感じでしたよね？",
"ねえ〈〉、今ちょっとドキッとしたでしょ？":"あの、〈〉さん、今ちょっとドキッとしましたよね？",
"全員が同じことを言い出したら、逆に怪しい。俺は〈〉を見てる":"全員が同じことを言い出したら、かえって怪しいです。私は〈〉さんを見ています",
"……そういう言い方するから疑われるんだよ":"……そういう言い方をなさるから、疑われるんです"}});
HK.Load.toneData("gentleman",{"F":[
["〈〉の笑い方、絶対なんか隠してる！","〈〉のあの笑い方、きっと何か隠しているね"],
["ちょっと、言い方","おや、その言い方はいただけないね"],
["もう一戦やる？","もう一戦どうだい？"],
["人狼だったら、もっとうまく隠れるって","人狼だったら、もっとうまく隠れるだろうね"],
["感じ悪いな。それ、狼ムーブじゃない？","感じが悪いね。それは狼の動きではないかい？"],
["確認なんだけど、〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉が白なら、それはそれで情報になる。","確認させてもらうが、〈〉は対抗が出た瞬間、どちらを信じるか即決したね。根拠が薄い。〈〉が白なら、それはそれで情報になる。"],
["私を信じて。後悔はさせない","私を信じたまえ。後悔はさせない"],
["ちょっといい？〈〉の投票先、毎回いちばん安全なところを選んでる気がする。〈〉が白なら、それはそれで情報になる。","少しいいかい？　〈〉の投票先は、毎回いちばん安全なところを選んでいるように見える。〈〉が白なら、それはそれで有益な情報だね。",1],
["今のうちに言っておく。〈〉、〈〉が疑われたときだけ、やけに庇うよね。〈〉が白なら、それはそれで情報になる。","今のうちに言っておこう。〈〉は、〈〉が疑われたときだけ、やけに庇うね。〈〉が白なら、それはそれで情報になる。",1],
["言いにくいけど、言うね。昨日の投票、〈〉だけが流れと違うところに入れてる。〈〉の意見を聞きたい。","言いにくいけれど、言わせてもらうよ。昨日の投票、〈〉だけが流れと違うところに入れているね。〈〉の意見を聞かせたまえ。",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","整理させてくれたまえ。〈〉は対抗が出た瞬間、どちらを信じるか即決した。根拠が薄いね。〈〉の意見を聞かせてくれるかい？",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉と〈〉は、お互いに一度も疑っていないね。〈〉が白なら、それはそれで情報になる。",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉の発言は、昨日と今日で言っていることが逆になっているね。〈〉、説明してくれたまえ。",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙っているつもりだったけれど、言おう。私は占い師だ。〈〉は人狼ではなかったよ",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉は質問されると、質問で返しているね。〈〉の意見を聞かせてくれたまえ。",1],
["霊媒結果と照らし合わせれば、〈〉の結果だけ噛み合わない","霊媒結果と照らし合わせると、〈〉の結果だけが噛み合わないね",1],
["感情で吊るのはやめよう。私の投票先を確認してほしい","感情で吊るのはやめようじゃないか。私の投票先を確かめてくれたまえ",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙っているつもりだったけれど、言おう。私は占い師だ。〈〉は人狼だったよ",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","占い結果の筋を見れば分かるよ。〈〉の結果は不自然だね",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉は対抗が出てから急に結果を言い出したね。偽物だよ",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉は今日、ずっと口数が少ないね。〈〉、説明してくれたまえ。",1],
["自分では決められないので、今日は流れに乗ります","自分では決められないからね、今日は流れに乗らせてもらうよ",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","全員、今日の投票先を一人ずつ言ってくれたまえ。最後にまとめよう",1],
["みんな、いい村だったよ。私たちのほうが上手だったけど","皆、いい村だったよ。私たちのほうが上手だったけれどね",1],
["理由はないけど、〈〉だけは信用できない気がする","理由はないけれど、〈〉だけは信用できない気がするのさ",1],
["真贋は判断できない。だから占い師から順に吊る","真贋は判断できないね。だから占い師から順に吊ろう",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒なら、すべて説明がつくね。私は〈〉に入れるよ",1],
["疑われる理由は理解した。だが、結論が早すぎる","疑われる理由は理解したよ。だが、結論が早すぎるね",1],
["つまり〈〉が怪しい、のは……さっき否定したんだった","つまり〈〉が怪しい、のは……さっき否定したのだったね",1],
["明日に情報を残すためにも、今日は〈〉を吊る","明日に情報を残すためにも、今日は〈〉を吊ろう",1],
["村のために言うけど、〈〉の動き、ずっとおかしい","村のために言わせてもらうよ。〈〉の動きは、ずっとおかしいね",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","おい、〈〉！　最後まで白いと言っていたではないか！",1],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉は違うと思うよ。むしろ〈〉の方が怪しいね",1],
["私の分まで、正しく推理してくれ","私の分まで、正しく推理してくれたまえ",1],
["わ、私じゃない……と、思う……いや、違う！","わ、私ではないよ……と、思う……いや、違う！",1],
["次は、真っ先にお前を吊るからな","次は真っ先に君を吊るからね。覚えておきたまえ",1],
["騙すの、正直ちょっとつらかった","騙すのは、正直少しつらかったよ",1],
["完敗だ。よく見抜いた","完敗だよ。よく見抜いたね",1],
["私は明日も生きて、〈〉の黒を証明する","私は明日も生きて、〈〉の黒を証明してみせよう",1],
["悪いけど、空気には合わせない。〈〉が怪しい","悪いが、空気には合わせないよ。〈〉が怪しい",1],
["結論から言うと、〈〉、具体的な名前を一度も出してないよね。〈〉が白なら、それはそれで情報になる。","結論から言おう。〈〉は具体的な名前を一度も出していないね。〈〉が白なら、それはそれで有益な情報だ。",1],
["今のうちに言っておく。〈〉は霊媒結果を聞いても、表情ひとつ変えなかった。〈〉、説明してほしい。","今のうちに言っておこう。〈〉は霊媒結果を聞いても、表情ひとつ変えなかったね。〈〉、説明してくれたまえ。",1],
["名前、書き間違えてた……","名前を、書き間違えていたよ……",1],
["なんとなくだけど、〈〉から狼の匂いがする","なんとなくだが、〈〉から狼の匂いがするね",1],
["私の勘、当たるんだよ。〈〉","私の勘は当たるのだよ。〈〉",1],
["対抗します。占い師は私。〈〉は人狼でした","対抗しよう。占い師は私だ。〈〉は人狼だったよ",1],
["よく分からないけど、〈〉が言うなら……","よく分からないが、〈〉が言うのなら……",1],
["〈〉が白で、〈〉も白だから……あれ、そしたら狼いなくない？","〈〉が白で、〈〉も白だから……おや、そうすると狼がいないことにならないかい？",1],
["仲間の健闘を祈る","仲間の健闘を祈っているよ",1],
["まあ、楽しかったからいいや","まあ、楽しかったから良しとしよう",1],
["最高の相棒だった","最高の相棒だったよ",1],
["〈〉の返事、ちょっと早すぎない？　怪しい！","〈〉の返事は、少し早すぎないかい？　怪しいね！",1],
["〈〉が黙ってると、なんか落ち着かないんだよね","〈〉が黙っていると、どうも落ち着かないのだよ",1],
["三日目のあの発言も、全部演技だったのか。……〈〉、次は本気で見抜くから","三日目のあの発言も、全部演技だったのか。……〈〉、次は本気で見抜いてみせるよ",1],
["なんか、雰囲気が人狼っぽい！","どうも、雰囲気が人狼らしいね！",1],
["待って、狩人CO。私を吊ると護衛がいなくなる","待ちたまえ、狩人COだ。私を吊ると護衛がいなくなるよ",1],
["……あれ？　昨日、誰に入れたんだっけ","……おや？　昨日、誰に入れたのだったかな",1],
["わ、私は村人だよ","わ、私は村人だよ",1],
["見事だった。認めよう","見事だったよ。認めよう",1],
["〈〉吊ろう！　外れたら謝る！","〈〉を吊ろうじゃないか！　外れたら謝るよ！",1],
["完璧な村だった！","完璧な村だったね！",1],
["人狼がこんなに堂々としてると思う？","人狼が、これほど堂々としていると思うかね？",1],
["多数派に乗るのが一番危ないんだよ。今日は〈〉に入れる","多数派に乗るのが一番危ないのだよ。今日は〈〉に入れよう",1],
["判断を誤ったな。だが、責めはしない","判断を誤ったね。だが、責めはしないよ",1],
["どっちが本物か分からないなら、両方吊ればいい。単純な話だ","どちらが本物か分からないなら、両方吊ればいい。単純な話だね",1],
["私の考えを言う。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。俺は〈〉が怪しいと思う。","私の考えを言おう。〈〉は「誰でもいい」と言っておきながら、急に一人に絞ったね。理由が見えない。私は〈〉が怪しいと思うよ。",1],
["占い結果が……あれ、どっちがどっちに黒出したんだっけ","占い結果が……おや、どちらがどちらに黒を出したのだったかな",1],
["占いロラで確実に一人は狼を処理できる。今日は〈〉から","占いロラなら、確実に一人は狼を処理できる。今日は〈〉からにしよう",1],
["待って、さっきと言ってること逆だ","待ちたまえ、さっきと言っていることが逆だね",1],
["〈〉、正直に言いなよ。狼でしょ？","〈〉、正直に言いたまえ。狼だろう？",1],
["完璧な吊り筋だったね","完璧な吊り筋だったね",1],
["占い師は吊らない。情報源は残して、グレーから吊ろう","占い師は吊らないよ。情報源は残して、グレーから吊ろうじゃないか",1],
["霊媒CO。〈〉、人狼でした","霊媒COだ。〈〉は、人狼だったよ",1],
["私の考えを言う。〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉が白なら、それはそれで情報になる。","私の考えを言おう。〈〉は自分から話題を振らないね。様子見にしても長すぎる。〈〉が白なら、それはそれで有益な情報だ。",1],
["反対する理由がないので、〈〉で","反対する理由がないのでね、〈〉にしよう",1],
["なんでそんなに焦ってるの","どうしてそんなに焦っているのかね",1],
["いやあ、騙された騙された","いやあ、見事に騙されたよ",1],
["ちょっといい？〈〉の推理、結論ありきで後から理由をつけてる感じがする。俺の中では、〈〉が一番黒い。","少しいいかい？　〈〉の推理は、結論ありきで後から理由をつけているように見える。私の見立てでは、〈〉が一番黒いね。",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から言おう。平和な朝の前、〈〉は護衛先を探るようなことを言っていたね。私の見立てでは、〈〉が一番黒いよ。",1],
["ちょっといい？〈〉の発言、昨日と今日で言ってることが逆になってる。俺の中では、〈〉が一番黒い。","少しいいかい？　〈〉の発言は、昨日と今日で言っていることが逆になっているね。私の見立てでは、〈〉が一番黒いよ。",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉は今日、ずっと口数が少ないね。私の見立てでは、〈〉が一番黒いよ。",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","ここで割れるのが一番まずいね。〈〉に揃えようじゃないか",1],
["……私は村人だった。あとは任せる","……私は村人だったよ。あとは任せたまえ",1],
["昨日の投票、〈〉だけが流れと違うところに入れてる。〈〉、説明してほしい。","昨日の投票で、〈〉だけが流れと違うところに入れているね。〈〉、説明してくれたまえ。",1],
["〈〉が噛まれるのは分かっていた……あ、いや、予想していたという意味だ","〈〉が噛まれるのは分かっていたよ……ああ、いや、予想していたという意味だがね",1],
["〈〉の推理には納得した。〈〉に入れる","〈〉の推理には納得したよ。〈〉に入れよう",1]],
"O":{
"少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする":"少なくとも〈〉は村人だと思っているよ。だから〈〉の意見を軸にしよう",
"むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ":"むしろ怪しいのは〈〉のほうだと思うね。理由も言えるよ",
"私が狼なら、今ここで〈〉を庇ってる":"私が狼なら、今ここで〈〉を庇っているよ",
"私が村人であることは、明日の結果が証明する":"私が村人であることは、明日の結果が証明してくれるよ",
"出るね。占い師。〈〉――人狼でした":"名乗ろう。占い師だ。〈〉は――人狼だったよ",
"出るね。占い師。〈〉――人狼ではありませんでした":"名乗ろう。占い師だ。〈〉は――人狼ではなかったよ",
"霊媒師です。昨日処刑された〈〉は――人狼でした":"霊媒師だ。昨日処刑された〈〉は――人狼だったよ",
"私を吊って、明日後悔しても知らないよ":"私を吊って、明日後悔しても知らないよ",
"私は村人。断言する":"私は村人だ。断言しよう",
"皆さまのご武運をお祈りしております":"皆の武運を祈っているよ",
"疑うなら、どうぞ。何も出てこないから":"疑うのなら、どうぞ。何も出てきはしないよ",
"村目線で言わせてもらうと、〈〉の動きが一番狼っぽい":"村人の目線で言わせてもらうと、〈〉の動きが一番狼らしいね",
"完敗。次は負けないよ":"完敗だよ。次は負けないがね",
"根拠が薄いのは〈〉のほうだよ":"根拠が薄いのは、〈〉のほうだよ",
"ここからは協力しよう":"ここからは、協力しようじゃないか",
"〈〉吊りの流れ、誰が作った？　そっちのほうが気になる":"〈〉を吊る流れは、誰が作ったのかね？　そちらのほうが気になるよ",
"俺は〈〉を信じる。今日は二人で同じところに入れよう":"私は〈〉を信じるよ。今日は二人で同じところに入れよう",
"え？　あ、うん、そう、そうだよね":"おや？　ああ、うん、そう、そうだね",
"いいよ、私を吊っても。でも次は〈〉を吊ってね":"構わないよ、私を吊っても。だが次は〈〉を吊ってくれたまえ",
"くだらない。俺の票を見てから言え":"くだらないね。私の票を見てから言いたまえ",
"……〈〉が怪しいと思う":"……〈〉が怪しいと思うね",
"〈〉って、狼のときもこんな感じだったよね？":"〈〉は、狼のときもこんな様子だったね？",
"ねえ〈〉、今ちょっとドキッとしたでしょ？":"ところで〈〉、今少しどきりとしただろう？",
"全員が同じことを言い出したら、逆に怪しい。俺は〈〉を見てる":"全員が同じことを言い出したら、逆に怪しいものだ。私は〈〉を見ているよ",
"……そういう言い方するから疑われるんだよ":"……そういう言い方をするから、疑われるのだよ"}});
HK.Load.toneData("proud",{"F":[
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村だ。だから〈〉の意見を軸にする。異論は認めねえ",1],
["……ここまでか。だが、まだ終わってない","……ここまでか。だが、まだ終わっちゃいねえ",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙ってるつもりだったが、言ってやる。占い師だ。〈〉は人狼じゃなかった",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙ってるつもりだったが、言ってやる。占い師だ。〈〉は人狼だった",1],
["自分では決められないので、今日は流れに乗ります","自分じゃ決めきれねえ。今日は流れに乗ってやる",1],
["私を吊って、明日後悔しても知らないよ","私を吊って、明日後悔しても知らねえぞ",1],
["……ふん。一人くらいくれてやる","……ふん。一人くらいくれてやる",1],
["覚えてろ。村人を吊ったこと、後悔させてやる","覚えてろ。村人を吊ったこと、後悔させてやる",1],
["くだらない。私の票を見てから言え","くだらねえ。私の票を見てから言え",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","おい、〈〉！　最後まで白いって言ってただろうが！",1],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉は違う。むしろ〈〉が怪しい",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒なら全部説明がつく。私は〈〉に入れる",1],
["私が狼なら、今ここで〈〉を庇ってる","私が狼なら、今ここで〈〉を庇ってる。考えりゃわかるだろ",1],
["〈〉って、狼のときもこんな感じだったよね？","〈〉、お前、狼のときもこんな感じだったよな？",1],
["私が村人であることは、明日の結果が証明する","私が村人だってことは、明日の結果が証明してくれる",1],
["村目線で言わせてもらうと、〈〉の動きが一番狼っぽい","村目線で言わせてもらう。〈〉の動きが一番狼くさい",1],
["〈〉、さっきから喋らなさすぎじゃない？","〈〉、さっきから喋らなさすぎじゃねえか？",1],
["〈〉の返事、ちょっと早すぎない？　怪しい！","〈〉の返事、ちょっと早すぎねえか？　怪しいぞ",1],
["〈〉吊ろう！　外れたら謝る！","〈〉を吊るぞ！　外れたら謝ってやる！",1],
["感じ悪いな。それ、狼ムーブじゃない？","感じ悪いな。それ、狼ムーブじゃねえか？",1],
["みんな〈〉って言ってるけど、それ流されてない？","みんな〈〉って言ってるけど、それ流されてねえか？",1],
["完敗。次は負けないよ","完敗だ。次は負けねえ",1],
["ねえ〈〉、今ちょっとドキッとしたでしょ？","おい〈〉、今ちょっとドキッとしただろ？",1],
["みんな、聞いて。〈〉、占い師が出たときの反応が早すぎた。知ってたみたいに。〈〉の意見を聞きたい。","みんな、聞け。〈〉、占い師が出たときの反応が早すぎた。知ってたみたいにな。〈〉、言い分を聞かせろ。",1],
["私の発言、全部見返してみて","私の発言、全部見返してみろ",1],
["〈〉の推理、穴だらけだよ。指摘しようか？","〈〉の推理、穴だらけだ。指摘してやろうか？",1],
["わ、私は村人だよ","わ、私は村人だ",1],
["ここからは協力しよう","ここからは手を組むぞ",1],
["疑うなら、どうぞ。何も出てこないから","疑うなら好きにしろ。何も出てこねえよ",1],
["本物の占い師は私。〈〉は人狼でした","本物の占い師は私だ。〈〉は人狼だった",1],
["いいよ、私を吊っても。でも次は〈〉を吊ってね","いいぜ、私を吊っても。だが次は〈〉を吊れよ",1],
["理由はないけど、〈〉だけは信用できない気がする","理由はねえが、〈〉だけは信用できねえ",1],
["〈〉、正直に言いなよ。狼でしょ？","〈〉、正直に言え。狼だろ？",1],
["私は村人。断言する","私は村人だ。断言する",1],
["な、なんで私なのよ！　ちゃんと見てたの？","な、なんで私が疑われなきゃならねえ！　ちゃんと見てたのか？",1],
["なんか、あざとくない？","なんか、あざとくねえか？",1],
["結論から言うと、〈〉は笑ってるけど、目が笑ってない。〈〉、説明してほしい。","結論から言う。〈〉は笑ってるが、目が笑ってねえ。〈〉、説明しろ。",1]]});
HK.Load.toneData("aniki",{"F":[
["いいよ、私を吊っても。でも次は〈〉を吊ってね","いいぜ、私を吊っても。でも次は〈〉を吊ってくれよ"],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村だと思うんだ。だから〈〉の意見を軸にしようぜ",1],
["……ここまでか。だが、まだ終わってない","……ここまでか。でも、まだ終わっちゃいねえぞ",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙ってるつもりだったけど、言うよ。占い師だ。〈〉は人狼じゃなかった",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙ってるつもりだったけど、言うよ。占い師だ。〈〉が人狼だった",1],
["自分では決められないので、今日は流れに乗ります","自分じゃ決められねえや。今日は流れに乗るよ",1],
["私を吊って、明日後悔しても知らないよ","私を吊ってもいいけどさ、明日後悔しても知らねえぞ",1],
["……ふん。一人くらいくれてやる","……しゃあねえ。一人くらいくれてやるよ",1],
["覚えてろ。村人を吊ったこと、後悔させてやる","覚えてろよ。村人を吊ったこと、後悔させてやるからな",1],
["くだらない。私の票を見てから言え","くだらねえこと言うなよ。私の票を見てから言いな",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","おい、〈〉！　最後まで白いって言ってたじゃねえか！",1],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉は違うと思うぜ。むしろ〈〉のほうが怪しい",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒なら全部説明がつくんだよ。私は〈〉に入れる",1],
["私が狼なら、今ここで〈〉を庇ってる","私が狼なら、今ここで〈〉を庇ってるさ",1],
["〈〉って、狼のときもこんな感じだったよね？","〈〉ってさ、狼のときもこんな感じだったよな？",1],
["私が村人であることは、明日の結果が証明する","私が村人だってのは、明日の結果が証明してくれるさ",1],
["村目線で言わせてもらうと、〈〉の動きが一番狼っぽい","村目線で言わせてもらうとさ、〈〉の動きが一番狼っぽいんだよ",1],
["ここからは協力しよう","ここからは協力しようぜ",1],
["私の発言、全部見返してみて","私の発言、全部見返してみな",1],
["ねえ〈〉、今ちょっとドキッとしたでしょ？","なあ〈〉、今ちょっとドキッとしただろ？",1],
["疑うなら、どうぞ。何も出てこないから","疑うなら好きにしな。何も出てこねえよ",1],
["〈〉の推理、穴だらけだよ。指摘しようか？","〈〉の推理、穴だらけだぜ。指摘してやろうか？",1],
["偽物が出たね。私が本物。〈〉――人狼ではありませんでした","偽物が出たな。本物は私だ。〈〉――人狼ではなかった",1],
["完敗。次は負けないよ","完敗だ。次は負けねえぞ",1],
["私は村人。断言する","私は村人だ。断言する",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してくれ。",1],
["私を信じて。後悔はさせない","私を信じな。後悔はさせねえよ",1],
["全員、〈〉に入れてくれ。責任は俺が取る","全員、〈〉に入れてくれ。責任は私が取る",1],
["いちいち説明させないで","いちいち説明させんなよ",1],
["〈〉、占い師が出たときの反応が早すぎた。知ってたみたいに。〈〉、説明してほしい。","〈〉、占い師が出たときの反応が早すぎた。知ってたみたいにな。〈〉、説明してくれ。",1],
["偽物が出たね。私が本物。〈〉――人狼でした","偽物が出たな。本物は私だ。〈〉――人狼だった",1],
["〈〉は質問されると、質問で返してる。〈〉、説明してほしい。","〈〉は質問されると、質問で返してる。〈〉、説明してくれ。",1],
["〈〉はCOが出る前から、占い師の真贋に妙に詳しかった。〈〉、説明してほしい。","〈〉はCOが出る前から、占い師の真贋に妙に詳しかった。〈〉、説明してくれ。",1],
["人狼がこんなに堂々としてると思う？","人狼がこんなに堂々としてると思うか？",1],
["結論から言うと、〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。〈〉が白なら、それはそれで情報になる。","結論から言うと、〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えねえ。〈〉が白なら、それはそれで情報になる。",1],
["な、なんで私なのよ！　ちゃんと見てたの？","な、なんで私が疑われんだよ！　ちゃんと見てたのか？",1]]});
HK.Load.toneData("yankee",{"F":[
["〈〉って、狼のときもこんな感じだったよね？","〈〉って、狼のときもこんな感じだったよな？"],
["いいよ、吊っても。でも村人だからね、覚えといて","いいよ、吊っても。でも村人だからな、覚えとけよ"],
["いいよ、私を吊っても。でも次は〈〉を吊ってね","いいよ、私を吊っても。でも次は〈〉を吊ってくれよ"],
["出るね。占い師。〈〉――人狼ではありませんでした","出るぞ。占い師。〈〉――人狼じゃなかった"],
["反対する理由がないので、〈〉で","反対する理由もねえし、〈〉で"],
["待って、占い師は私。〈〉は人狼でした","待て、占い師は私。〈〉は人狼だった"],
["理由はないけど、〈〉だけは信用できない気がする","理由はねえけど、〈〉だけは信用できねえ気がする"],
["私が村人であることは、明日の結果が証明する","私が村人だってことは、明日の結果が証明してくれる"],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙ってるつもりだったけどよ、言うわ。占い師だ。〈〉は人狼じゃなかった",1],
["本物の占い師は私。〈〉は人狼でした","本物の占い師は私だ。〈〉は人狼だった",1],
["大丈夫、怒ってないよ。でも、村人なんだ","大丈夫、怒ってねえよ。けど、村人なんだよ",1],
["なんでそんなに焦ってるの","なんでそんなに焦ってんだよ",1],
["私を信じて。後悔はさせない","私を信じろ。後悔はさせねえ",1],
["な、なんで私なのよ！　ちゃんと見てたの？","な、なんで私が疑われんだよ！　ちゃんと見てたのか？",1],
["うそでしょ、私!?　ないって！　信じて！","マジかよ、私!?　ねえって！　信じろって！",1],
["〈〉、正直に言いなよ。狼でしょ？","〈〉、正直に言えよ。狼だろ？",1],
["私は村人。断言する","私は村人だ。断言する",1],
["見事だった。認めよう","見事だった。認めてやるよ",1],
["私の発言、全部見返してみて","私の発言、全部見返してみろよ",1],
["〈〉吊ろう！　外れたら謝る！","〈〉吊るぞ！　外れたら謝っから！",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉、今日はずっと口数が少ねえ。私の中じゃ、〈〉が一番黒い。",1],
["迷ってる余裕はない。占い師を順に処理していこう","迷ってる余裕はねえ。占い師を順に処理してくぞ",1],
["時間がない。今日は〈〉に入れよう","時間がねえ。今日は〈〉に入れんぞ",1],
["え？　あ、うん、そう、そうだよね","え？　あ、おう、そう、そうだよな",1],
["ちょっといい？〈〉の投票先、毎回いちばん安全なところを選んでる気がする。〈〉が白なら、それはそれで情報になる。","ちょっといいか。〈〉の投票先、毎回いちばん安全なとこ選んでやがる。〈〉が白なら、それはそれで情報になんだろ。",1],
["今のうちに言っておく。〈〉、〈〉が疑われたときだけ、やけに庇うよね。〈〉が白なら、それはそれで情報になる。","今のうちに言っとくぞ。〈〉、〈〉が疑われたときだけやけに庇うよな。〈〉が白なら、それはそれで情報だ。",1],
["言いにくいけど、言うね。昨日の投票、〈〉だけが流れと違うところに入れてる。〈〉の意見を聞きたい。","言いにくいけど、言うわ。昨日の投票、〈〉だけ流れと違うとこに入れてんだよ。〈〉、どういうつもりか聞かせろ。",1],
["感情で吊るのはやめよう。私の投票先を確認してほしい","感情で吊んのはやめろ。私の投票先、確認しとけ",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉が白なら、それはそれで情報になる。","整理させろ。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄いんだよ。〈〉が白なら、それはそれで情報になる。",1],
["整理させて。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。俺は〈〉が怪しいと思う。","整理させろ。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えねえ。私は〈〉が怪しいと思う。",1],
["むしろ怪しいのは〈〉のほうだと思う。理由も言える","むしろ怪しいのは〈〉のほうだろ。理由も言えるぜ",1],
["〈〉、さっきから喋らなさすぎではないか？","〈〉、さっきから黙りすぎじゃねえか？",1],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉は違えと思う。むしろ〈〉が怪しいだろ",1],
["〈〉が噛まれるのは分かっていた……あ、いや、予想していたという意味だ","〈〉が噛まれんのは分かってたし……あ、いや、予想してたって意味だよ",1],
["自分では決められないので、今日は流れに乗る","自分じゃ決めらんねえから、今日は流れに乗るわ",1]]});
HK.Load.toneData("stern",{"F":[
["〈〉、正直に言いなよ。狼でしょ？","〈〉、正直に言え。狼だろ？"],
["いいよ、私を吊っても。でも次は〈〉を吊ってね","構わない、私を吊れ。だが次は〈〉を吊ってくれ"],
["ちょっと、言い方","待て、言い方を考えろ"],
["もう一戦やる？","もう一戦やるか？"],
["人狼だったら、もっとうまく隠れるって","人狼なら、もっとうまく隠れる"],
["感じ悪いな。それ、狼ムーブじゃない？","感じが悪いな。それは、狼の動きだ"],
["私は村人。断言する","私は村人だ。断言する"],
["私は村人だ。根拠を一つずつ反論する","私は村人だ。根拠の一つずつに反論する"],
["黙ってて。考えてるから","黙っていろ。考えている"],
["ちょっといい？〈〉の投票先、毎回いちばん安全なところを選んでる気がする。〈〉が白なら、それはそれで情報になる。","一つ言わせてもらう。〈〉の投票先は、毎回いちばん安全なところだ。〈〉が白なら、それもまた一つの情報になる。",1],
["今のうちに言っておく。〈〉、〈〉が疑われたときだけ、やけに庇うよね。〈〉が白なら、それはそれで情報になる。","今のうちに言っておく。〈〉は、〈〉が疑われたときだけ、やけに庇う。〈〉が白なら、それもまた一つの情報だ。",1],
["言いにくいけど、言うね。昨日の投票、〈〉だけが流れと違うところに入れてる。〈〉の意見を聞きたい。","言いにくいが、言う。昨日の投票、〈〉だけが流れと違うところに入れている。〈〉の弁明を聞きたい。",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","整理する。〈〉は対抗が出た瞬間、どちらを信じるか即決した。根拠が薄い。〈〉の弁明を聞かせろ。",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉と〈〉は、互いに一度も疑っていない。〈〉が白なら、それもまた一つの情報だ。",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉の発言は、昨日と今日で逆になっている。〈〉、説明しろ。",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙っているつもりだったが、言う。私は占い師だ。〈〉は人狼ではなかった",1],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村だと見ている。だから〈〉の意見を軸にする",1],
["全員が同じことを言い出したら、逆に怪しい。俺は〈〉を見てる","全員が同じことを言い出したら、かえって怪しい。私は〈〉を見ている",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉は問われると、問いで返している。〈〉の弁明を聞きたい。",1],
["霊媒結果と照らし合わせれば、〈〉の結果だけ噛み合わない","霊媒結果と照らし合わせれば、〈〉の結果だけが噛み合わん",1],
["感情で吊るのはやめよう。私の投票先を確認してほしい","感情で吊るのはやめろ。私の投票先を確かめてくれ",1],
["むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ","むしろ怪しいのは〈〉の方だ。理由も言える",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙っているつもりだったが、言う。私は占い師だ。〈〉は人狼だった",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","占い結果の筋を見れば分かる。〈〉の結果は不自然だ",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉は対抗が出てから急に結果を言い出した。偽物だ",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉は今日、ずっと口数が少ない。〈〉、説明しろ。",1],
["自分では決められないので、今日は流れに乗ります","自分では決めかねる。今日は流れに従う",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","全員、今日の投票先を一人ずつ言え。最後にまとめる",1],
["みんな、いい村だったよ。私たちのほうが上手だったけど","皆、いい村だった。私たちの方が上手だったがな",1],
["理由はないけど、〈〉だけは信用できない気がする","理由はない。だが、〈〉だけは信用できん",1],
["真贋は判断できない。だから占い師から順に吊る","真贋は判断できん。ゆえに占い師から順に吊る",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒ならば、すべて説明がつく。私は〈〉に入れる",1],
["疑われる理由は理解した。だが、結論が早すぎる","疑われる理由は理解した。だが、結論が早すぎる",1],
["私が村人であることは、明日の結果が証明する","私が村人であることは、明日の結果が証明する",1],
["つまり〈〉が怪しい、のは……さっき否定したんだった","つまり〈〉が怪しい、のは……先ほど否定したのだった",1],
["明日に情報を残すためにも、今日は〈〉を吊る","明日に情報を残すためにも、今日は〈〉を吊る",1],
["村のために言うけど、〈〉の動き、ずっとおかしい","村のために言う。〈〉の動きは、ずっとおかしい",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","おい、〈〉！　最後まで白いと言っていただろうが！",1],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉は違う。むしろ〈〉が怪しい",1],
["私を吊って、明日後悔しても知らないよ","私を吊って、明日悔やんでも知らんぞ",1],
["私が狼なら、今ここで〈〉を庇ってる","私が狼なら、今ここで〈〉を庇っている",1],
["根拠が薄いのは〈〉のほうだよ","根拠が薄いのは〈〉のほうだ",1],
["私の分まで、正しく推理してくれ","私の分まで、正しく推理してくれ。頼んだぞ",1],
["わ、私じゃない……と、思う……いや、違う！","わ、私ではない……と、思う……いや、違う！",1],
["次は、真っ先にお前を吊るからな","次は真っ先にお前を吊る。覚悟しておけ",1],
["騙すの、正直ちょっとつらかった","騙すのは、正直こたえた",1],
["〈〉、占い師が出たときの反応が早すぎた。知ってたみたいに。〈〉、説明してほしい。","〈〉は、占い師が出たときの反応が早すぎた。まるで知っていたようにな。〈〉、説明してもらおう。",1],
["偽物が出たね。私が本物。〈〉――人狼でした","偽物が出たな。本物は私だ。〈〉――人狼だった",1],
["人狼がこんなに堂々としてると思う？","人狼が、これほど堂々としていると思うか？",1],
["結論から言うと、〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。〈〉が白なら、それはそれで情報になる。","結論を述べる。〈〉は「誰でもいい」と言いながら、急に一人に絞った。理由が見えん。〈〉が白なら、それもまた一つの情報だ。",1],
["今のうちに言っておく。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。〈〉、説明してほしい。","今のうちに言っておく。〈〉は「誰でもいい」と言いながら、急に一人に絞った。理由が見えん。〈〉、説明しろ。",1],
["ちょっといい？〈〉は〈〉への疑いを、話題を変えて逸らした。俺は〈〉が怪しいと思う。","一ついいか。〈〉は〈〉への疑いを、話題を変えて逸らした。私は〈〉が怪しいと見る。",1],
["待って、占い師は私。〈〉は人狼でした","待て、占い師は私だ。〈〉は人狼だった",1],
["本物の占い師は私。〈〉は人狼でした","本物の占い師は私だ。〈〉は人狼だった",1],
["疑うなら、どうぞ。何も出てこないから","疑うなら好きにしろ。何も出てこない",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論を述べる。平和な朝の前、〈〉は護衛先を探るようなことを口にしていた。私の見立てでは、〈〉が一番黒い。",1],
["ちょっといい？〈〉の発言、昨日と今日で言ってることが逆になってる。俺の中では、〈〉が一番黒い。","一ついいか。〈〉の発言は、昨日と今日で逆になっている。私の見立てでは、〈〉が一番黒い。",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉は今日、ずっと口数が少ない。私の見立てでは、〈〉が一番黒い。",1],
["村目線で言わせてもらうと、〈〉の動きが一番狼っぽい","村の目線で言わせてもらう。〈〉の動きが一番狼らしい",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","ここで割れるのが一番まずい。〈〉に揃えるぞ",1],
["〈〉って、狼のときもこんな感じだったよね？","〈〉は、狼のときもこのような様子だったな？",1],
["言いにくいけど、言うね。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。俺の中では、〈〉が一番黒い。","言いにくいが、言う。〈〉は対抗が出た瞬間、どちらを信じるか即決した。根拠が薄い。私の見立てでは、〈〉が一番黒い。",1],
["みんな、聞いて。〈〉、さっきから全員の顔色をうかがってる。俺は〈〉が怪しいと思う。","皆、聞け。〈〉は、さっきから全員の顔色をうかがっている。私は〈〉が怪しいと見る。",1],
["みんな、聞いて。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。〈〉の意見を聞きたい。","皆、聞け。〈〉は「誰でもいい」と言いながら、急に一人に絞った。理由が見えん。〈〉の意見を聞かせてもらう。",1]]});
HK.Load.toneData("tsun",{"F":[
["〈〉、さっきから喋らなさすぎじゃない？","〈〉、さっきから喋らなさすぎじゃない？　……べ、別に気にしてないけど",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉、今日ずっと口数が少ないわよね。〈〉、ちゃんと説明しなさいよ",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉、今日ずっと口数が少ないわよね。私の中じゃ、〈〉が一番黒いわ",1],
["〈〉が言うなら、たぶんそうなんだろうな……","〈〉が言うなら……ま、まあ、たぶんそうなんでしょうね",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒なら全部説明がつくわ。私は〈〉に入れる",1],
["〈〉って、狼のときもこんな感じだったよね？","〈〉って、狼のときもこんな感じだったわよね？",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉と〈〉、お互い一度も疑ってないわよね。〈〉が白なら、それはそれで情報になるわ",1],
["〈〉の意見に賛成です。〈〉でいいと思う","〈〉の意見に賛成。〈〉でいいと思うわ",1],
["〈〉の推理、穴だらけだよ。指摘しようか？","〈〉の推理、穴だらけよ。指摘してあげましょうか？",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉の発言、昨日と今日で真逆じゃない。〈〉、ちゃんと説明しなさいよ",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉は対抗が出てから急に結果を言い出したじゃない。偽物よ",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉、質問されると質問で返してるわよね。〈〉はどう思うわけ？",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","ちょっと〈〉！　最後まで白いって言ってたでしょ！",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","ここで割れるのが一番まずいわ。〈〉に揃えるわよ",1],
["みんな、いい村だったよ。私たちのほうが上手だったけど","みんな、いい村だったわよ。……ま、私たちのほうが上手だったけど",1],
["むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ","むしろ怪しいのは〈〉のほうでしょ。理由だって言えるわよ",1],
["やられたー！　いや、今回は完全に〈〉の勝ちだ！","やられた……っ！　……ま、今回は〈〉の勝ちってことにしといてあげる",1],
["人狼がこんなに堂々としてると思う？","人狼がこんなに堂々としてると思うわけ？",1],
["人狼だったら、もっとうまく隠れるって","人狼だったら、もっとうまく隠れるわよ。……ばかじゃないの",1],
["偽物が出たね。私が本物。〈〉――人狼でした","偽物が出たわね。本物は私よ。〈〉――人狼だったわ",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","全員、今日の投票先を一人ずつ言いなさい。最後にまとめるから",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","占い結果の筋を見れば分かるでしょ。〈〉の結果は不自然よ",1],
["多数派に乗るのが一番危ないんだよ。今日は〈〉に入れる","多数派に乗るのが一番危ないのよ。今日は〈〉に入れるわ",1],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも、〈〉は村だと思ってる。だから〈〉の意見を軸にするわ",1],
["待って、さっきと言ってること逆だ","ちょっと待ちなさいよ、さっきと言ってること逆じゃない",1],
["待って、占い師は私。〈〉は人狼でした","待ちなさいよ、占い師は私。〈〉は人狼だったわ",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄いのよ。〈〉はどう思うわけ？",1],
["明日に情報を残すためにも、今日は〈〉を吊る","明日に情報を残すためにも、今日は〈〉を吊るわよ",1],
["本物の占い師は私。〈〉は人狼でした","本物の占い師は私よ。〈〉は人狼だったわ",1],
["村目線で言わせてもらうと、〈〉の動きが一番狼っぽい","村目線で言わせてもらうと、〈〉の動きが一番狼っぽいわ",1],
["次は、真っ先にお前を吊るからな","次は、真っ先にあんたを吊るんだから",1],
["直感って大事だよ。〈〉、目を逸らしたでしょ","直感って大事なのよ。〈〉、目を逸らしたでしょ",1],
["真贋は判断できない。だから占い師から順に吊る","真贋は判断できないわ。だから占い師から順に吊るわよ",1],
["私が村人であることは、明日の結果が証明する","私が村人だってことは、明日の結果が証明するわよ",1],
["私が狼なら、今ここで〈〉を庇ってる","私が狼なら、今ここで〈〉を庇ってるわよ",1],
["私は明日も生きて、〈〉の黒を証明する","私は明日も生き残って、〈〉の黒を証明してみせるわよ",1],
["私を吊って、明日後悔しても知らないよ","私を吊ったら、明日後悔しても知らないんだから",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から言うわよ。平和な朝の前、〈〉は護衛先を探るようなこと言ってた。私の中じゃ、〈〉が一番黒いわ",1],
["自信ないけど、みんなと同じで〈〉に","自信ないけど……みんなと同じで、〈〉に",1],
["自分では決められないので、今日は流れに乗ります","自分じゃ決められないから……今日は流れに乗る。……べ、別に優柔不断とかじゃないから",1],
["順番に意見を言おう。最後に決を採る","順番に意見を言いなさい。最後に決を採るわよ",1],
["騙すの、正直ちょっとつらかった","騙すの……正直、ちょっとつらかったんだから",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙ってるつもりだったけど、言うわ。占い師は私。〈〉は人狼だった",1],
["実は最初から、ずっと狼でした","実は最初から、ずっと狼だったのよ",1],
["ごめん！　ゲームだから、ゲームだから！","わ、悪かったわよ！　ゲームだから、ゲームだから！",1],
["占いCO。結果、〈〉は人狼でした","占いCO。結果、〈〉は人狼だったわ",1]]});
HK.Load.toneData("tsun_n",{"F":[
["〈〉、さっきから喋らなさすぎじゃない？","〈〉、さっきから喋らなさすぎだろ",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉は今日、ずっと口数が少ない。〈〉、説明しろ",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉は今日、ずっと口数が少ない。私の中では、〈〉が一番黒い",1],
["〈〉が言うなら、たぶんそうなんだろうな……","〈〉が言うなら、たぶんそうなんだろう……",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒なら全部説明がつく。私は〈〉に入れる",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる",1],
["〈〉の意見に賛成です。〈〉でいいと思う","〈〉の意見に賛成だ。〈〉でいいと思う",1],
["〈〉の推理、穴だらけだよ。指摘しようか？","〈〉の推理は穴だらけだ。指摘してやろうか",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉の発言、昨日と今日で逆だ。〈〉、説明しろ",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉は対抗が出てから急に結果を言い出した。偽物だ",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","おい、〈〉！　最後まで白いって言ってただろ！",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","ここで割れるのが一番まずい。〈〉に揃えるぞ",1],
["ほら見なさい！　村人だって言ったのに！","ほら見ろ！　村人だって言っただろ！",1],
["みんな、いい村だったよ。私たちのほうが上手だったけど","みんな、いい村だった。私たちのほうが上手だったけどな",1],
["むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ","むしろ怪しいのは〈〉のほうだ。理由も言える",1],
["やられたー！　いや、今回は完全に〈〉の勝ちだ！","やられた！　今回は完全に〈〉の勝ちだ",1],
["人狼がこんなに堂々としてると思う？","人狼がこんなに堂々としてると思うか？",1],
["人狼だったら、もっとうまく隠れるって","人狼だったら、もっとうまく隠れる",1],
["偽物が出たね。私が本物。〈〉――人狼でした","偽物が出たな。本物は私だ。〈〉――人狼だった",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","全員、今日の投票先を一人ずつ言え。最後にまとめる",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","占い結果の筋を見れば分かる。〈〉の結果は不自然だ",1],
["多数派に乗るのが一番危ないんだよ。今日は〈〉に入れる","多数派に乗るのが一番危ない。今日は〈〉に入れる",1],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村だと思う。だから〈〉の意見を軸にする",1],
["待って、さっきと言ってること逆だ","待て、さっきと言ってることが逆だ",1],
["待って、占い師は私。〈〉は人狼でした","待て、占い師は私だ。〈〉は人狼だった",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","整理させてくれ。〈〉は対抗が出た瞬間、即決した。根拠が薄い。〈〉の意見を聞きたい",1],
["明日に情報を残すためにも、今日は〈〉を吊る","明日に情報を残すためにも、今日は〈〉を吊る",1],
["本物の占い師は私。〈〉は人狼でした","本物の占い師は私だ。〈〉は人狼だった",1],
["村目線で言わせてもらうと、〈〉の動きが一番狼っぽい","村目線で言わせてもらうと、〈〉の動きが一番狼っぽい",1],
["次は、真っ先にお前を吊るからな","次は、真っ先にお前を吊る",1],
["直感って大事だよ。〈〉、目を逸らしたでしょ","直感は大事だ。〈〉、目を逸らしただろ",1],
["真贋は判断できない。だから占い師から順に吊る","真贋は判断できない。だから占い師から順に吊る",1],
["私が村人であることは、明日の結果が証明する","私が村人であることは、明日の結果が証明する",1],
["私が狼なら、今ここで〈〉を庇ってる","私が狼なら、今ここで〈〉を庇ってる",1],
["私は明日も生きて、〈〉の黒を証明する","私は明日も生きて、〈〉の黒を証明する",1],
["私を吊って、明日後悔しても知らないよ","私を吊れば、明日後悔するぞ",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から言う。平和な朝の前、〈〉は護衛先を探るようなことを言ってた。私の中では、〈〉が一番黒い",1],
["自信ないけど、みんなと同じで〈〉に","自信はないが、みんなと同じで〈〉に",1],
["自分では決められないので、今日は流れに乗ります","自分では決められない。今日は流れに乗る",1],
["順番に意見を言おう。最後に決を採る","順番に意見を言え。最後に決を採る",1],
["騙すの、正直ちょっとつらかった","騙すのは、正直少しつらかった",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙ってるつもりだったが、言う。占い師。〈〉は人狼だった",1]]});
HK.Load.toneData("gentle",{"F":[
["いちいち説明させないで","もう……いちいち説明させないでほしいな"],
["結果を言う。〈〉、人間","結果を言うね。〈〉は人間だったよ"],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村側だと思ってる。だから、〈〉の意見を軸にして考えるね",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙っておくつもりだったけど、言うね。私が占い師。〈〉は、人狼だったよ",1],
["私を吊って、明日後悔しても知らないよ","私を吊っても、明日後悔するのはみんなだよ。それでもいいの？",1],
["異論は？　……ないな。〈〉だ","異論は？　……ないね。じゃあ、〈〉で",1]]});
HK.Load.toneData("gentle_n",{"F":[
["いちいち説明させないで","いちいち説明させないでほしいな"],
["結果を言う。〈〉、人間","結果を言うね。〈〉は人間だったよ"],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村だと思う。だから〈〉の意見を軸にする",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙ってるつもりだったけど、言う。占い師は私。〈〉は人狼だった",1],
["誰も責めないよ。あとはよろしくね","誰も責めない。あとは頼んだ",1],
["ごめんね、みんな……仲間を、頼んだよ","ごめん、みんな……仲間を、頼んだ",1],
["私を吊って、明日後悔しても知らないよ","私を吊るなら、明日後悔しても知らない",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","ちょっと、〈〉！　最後まで白だって言ってたよね！",1]],
"S":[
"〈〉の推理、穴だらけだよ。指摘しようか？"]});
HK.Load.toneData("ane",{"F":[
["あの投票、なんで入れ替えなかったんだろ……","あの投票、なんで入れ替えなかったのかしら……"],
["いやあ、騙された騙された","いやあ、すっかり騙されちゃったわ"],
["おい、〈〉！　最後まで白いって言ってただろうが！","ちょっと、〈〉！　最後まで白いって言ってたじゃない！"],
["まあ、楽しかったからいいや","まあ、楽しかったからいいわ"],
["疑うなら、どうぞ。何も出てこないから","疑うなら、どうぞ。何も出てこないわよ"],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙ってるつもりだったけど、言うわ。私、占い師よ。〈〉は人狼じゃなかったわ"],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村だと思ってるわ。だから〈〉の意見を軸にさせてもらうわね",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙ってるつもりだったけど、言うわ。占い師は私よ。〈〉は人狼だったわ",1],
["誰も責めないよ。あとはよろしくね","誰も責めたりしないわ。あとはよろしくね",1],
["ごめんね、みんな……仲間を、頼んだよ","ごめんなさいね、みんな……仲間を、頼んだわよ",1],
["仲間のために、もう少し粘りたかった……","仲間のために、もう少し粘りたかったわね……",1],
["私を吊って、明日後悔しても知らないよ","私を吊って、明日後悔しても知らないわよ",1],
["大丈夫、怒ってないよ。でも、村人なんだ","大丈夫、怒ってないわ。でも、村人なのよ",1],
["異論は？　……ないな。〈〉だ","異論は？　……ないわね。じゃあ、〈〉で決まりね",1],
["次は、真っ先にお前を吊るからな","次は、真っ先にあなたを吊るからね",1],
["〈〉、さっきから喋らなさすぎじゃない？","〈〉、さっきから口数が少なすぎるんじゃない？",1]]});
HK.Load.toneData("devoted",{"F":[
["いいよ、私を吊っても。でも次は〈〉を吊ってね","いいですよ、私を吊っても。でも次は〈〉を吊ってくださいね"],
["いやあ、騙された騙された","いやあ、すっかり騙されました"],
["え？　あ、うん、そう、そうだよね","え？　あ、はい、そう、そうですよね"],
["ごめんね、みんな……仲間を、頼んだよ","すみません、皆さん……仲間を、お願いします",1],
["人狼だったら、もっとうまく隠れるって","人狼だったら、もっとうまく隠れますって"],
["確認なんだけど、〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉が白なら、それはそれで情報になる。","確認なんですけど、〈〉は対抗が出た瞬間、どっちを信じるか即決しました。根拠が薄いです。〈〉が白なら、それはそれで情報になります。"],
["私を信じて。後悔はさせない","私を信じてください。後悔はさせません"],
["黙ってて。考えてるから","少し静かにしててください。考えてますから"],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉さんは村の方だと思っています。ですから、〈〉さんのご意見を軸にします",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙っているつもりでしたが、申し上げます。私が占い師です。〈〉さんは、人狼でした",1],
["誰も責めないよ。あとはよろしくね","誰も責めたりしません。あとのこと、よろしくお願いします",1],
["仲間のために、もう少し粘りたかった……","仲間のために、もう少し粘りたかったです……",1],
["私を吊って、明日後悔しても知らないよ","私を吊っても……明日、後悔なさることになりますよ",1],
["理由を聞かれても困るけど、〈〉に一票！","理由を聞かれると困りますけど……〈〉さんに一票です！",1],
["よし、整理する。候補は〈〉と〈〉。今日は〈〉だ","よし、整理します。候補は〈〉さんと〈〉さん。今日は〈〉さんにしましょう",1],
["ピンと来た。〈〉だ","ピンと来ました。〈〉さんです",1],
["〈〉の意見に賛成です。〈〉でいいと思う","〈〉さんの意見に賛成です。〈〉さんでいいと思います",1],
["自信ないけど、みんなと同じで〈〉に","自信はないですけど、みんなと同じで〈〉さんに",1],
["推理？　……〈〉が気に食わない。それだけ","推理ですか？　……〈〉さんが、どうしても気に入らないんです。それだけです",1],
["騙すの、正直ちょっとつらかったです","正直……騙すの、ちょっとつらかったです",1]]});
HK.Load.toneData("devoted_p",{"F":[
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にするね",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙ってるつもりだったけど、言うね。占い師は私。〈〉は人狼だったよ",1],
["誰も責めないよ。あとはよろしくね","誰も責めないよ。あとはよろしくね！",1],
["私を吊って、明日後悔しても知らないよ","私を吊って、明日後悔しても知らないからね",1],
["自分では決められないので、今日は流れに乗ります","自分じゃ決められないから、今日は流れに乗っちゃう",1],
["次は、真っ先にお前を吊るからな","次は、真っ先にあなたを吊るからね",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙ってるつもりだったけど、言うね。占い師。〈〉は人狼じゃなかった",1],
["出るね。占い師。〈〉――人狼ではありませんでした","出るね。占い師。〈〉――人狼じゃなかった",1]]});
HK.Load.toneData("kohai",{"F":[
["〈〉の返事、ちょっと早すぎない？　怪しい！","〈〉の返事、ちょっと早すぎないっすか？　怪しいっす！"],
["ご納得いただけるまで、ご説明いたします","納得してもらえるまで、説明するっす"],
["どうか、もう一度ご検討を","どうか、もう一回考えてみてくださいっす"],
["どうか、皆さまで真実にたどり着いてください","どうか、皆さんで真実にたどり着いてくださいっす"],
["よく分からないけど、〈〉が言うなら……","よく分かんないっすけど、〈〉さんが言うなら……"],
["冷静にご判断いただければ、分かっていただけるかと","冷静に考えてもらえれば、分かってもらえるはずっす"],
["大変失礼いたしました。人狼でございました","すんません。人狼だったっす"],
["恐れ入りますが、私は村人でございます","すんませんけど、私は村人っす"],
["皆さまのご武運をお祈りしております","皆さんの武運を祈ってるっす"],
["皆さまの慧眼に敬服いたします","皆さんの見る目、さすがっす"],
["短い間でしたが、ありがとうございました","短い間だったっすけど、ありがとうございました"],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙ってるつもりだったっすけど、言うっす。自分、占い師っす。〈〉さんは人狼じゃなかったっす",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から言うと、平和な朝の前、〈〉さんは護衛先を探るようなこと言ってたっす。私の中じゃ、〈〉さんが一番黒いっす。",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","ちょっと整理させてほしいっす。〈〉さん、対抗が出た瞬間どっちを信じるか即決したっすよね。根拠が薄いっす。〈〉さんの意見、聞きたいっす。",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙ってるつもりだったっすけど、言うっす。自分、占い師っす。〈〉さんは人狼だったっす",1],
["自分では決められないので、今日は流れに乗ります","自分じゃ決められないんで、今日は流れに乗るっす",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉さんと〈〉さん、お互いに一度も疑ってないっすよね。〈〉さんが白なら、それはそれで情報になるっす。",1],
["わ、私じゃない……と、思う……いや、違う！","じ、自分じゃない……と、思うっす……いや、違うっす！",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉さんの発言、昨日と今日で言ってることが逆になってるっす。〈〉さん、説明してほしいっす。",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","〈〉さん！　最後まで白だって言ってたじゃないっすか！",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉さんが黒なら、全部説明がつくっす。私は〈〉さんに入れるっす",1],
["誠に心外でございます。私は村人です","めちゃくちゃ心外っす。私、村人っすよ",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉さん、今日ずっと口数少ないっすね。私の中じゃ、〈〉さんが一番黒いっす。",1],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉さんは違うと思うっす。むしろ〈〉さんのほうが怪しいっす",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉さん、質問されると質問で返してるっすよね。〈〉さんの意見、聞きたいっす。",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉さん、今日ずっと口数少ないっすね。〈〉さん、説明してほしいっす。",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","全員、今日の投票先を一人ずつ言ってほしいっす。最後に私がまとめるっす",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","占い結果の筋を見れば分かるっす。〈〉さんの結果、不自然っすよ",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉さん、対抗が出てから急に結果を言い出したっすよね。偽物っす",1],
["やられたー！　いや、今回は完全に〈〉の勝ちだ！","やられたー！　いや、今回は完全に〈〉さんの勝ちっす！",1],
["〈〉の推理、納得できた。〈〉で","〈〉さんの推理、納得したっす。〈〉さんで",1],
["黙ってて。考えてるから","ちょっと静かにしててほしいっす。今考えてるんで",1],
["自信ないけど、みんなと同じで〈〉に","自信ないっすけど、みんなと同じで〈〉さんに",1],
["〈〉が怪しい。今日は〈〉だ","〈〉さんが怪しいっす。今日は〈〉さんっす",1],
["〈〉、さっきから全員の顔色をうかがってる。だから今日は〈〉を推す。","〈〉さん、さっきから全員の顔色をうかがってるっす。だから今日は〈〉さんを推すっす。",1],
["占いCO。結果、〈〉は人狼でした","占いCO。結果、〈〉さんは人狼だったっす",1],
["感情じゃなくて情報で決めよう。今日は〈〉","感情じゃなくて、情報で決めるっす。今日は〈〉さんっす",1],
["あの投票、なんで入れ替えなかったんだろ……","あの投票、なんで入れ替えなかったんすかね……",1],
["はい！　〈〉が人狼だと思います！","はい！　〈〉さんが人狼だと思うっす！",1],
["直感って大事だよ。〈〉、目を逸らしたでしょ","直感って大事っすよ。〈〉さん、目を逸らしたっしょ",1],
["狩人です。昨夜は〈〉を守った","狩人っす。昨夜は〈〉さんを守ったっす",1],
["私は明日も生きて、〈〉の黒を証明する","私は明日も生きて、〈〉さんの黒を証明するっす",1],
["両方の発言を比べた。偽物は〈〉だと思う","両方の発言を比べたっす。偽物は〈〉さんだと思うっす",1],
["全員、〈〉に入れてくれ。責任は俺が取る","全員、〈〉さんに入れてくださいっす。責任は私が取るっす",1],
["異論は？　……ないな。〈〉だ","異論は？　……ないっすね。〈〉さんっす",1],
["〈〉、さっきから喋らなさすぎじゃない？","〈〉さん、さっきから喋らなさすぎじゃないっすか？",1],
["根拠？　顔！　〈〉の顔が言ってる！","根拠っすか？　顔っす！　〈〉さんの顔が言ってるっす！",1],
["〈〉が言うなら、たぶんそうなんだろうな……","〈〉さんが言うなら、たぶんそうなんすよね……",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","ここで割れるのが一番まずいっす。〈〉さんに揃えましょう",1],
["私の考えを言う。〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉の意見を聞きたい。","私の考えを言うっす。〈〉さんは自分から話題を振らないっす。様子見にしても長すぎっす。〈〉さんの意見を聞きたいっす。",1],
["いやあ、騙された騙された","いやあ、すっかり騙されたっす",1],
["〈〉、その座り方、絶対狼だって","〈〉さん、その座り方、絶対狼っすって",1],
["〈〉が黙ってると、なんか落ち着かないんだよね","〈〉さんが黙ってると、なんか落ち着かないんすよね",1],
["〈〉が白で、〈〉も白だから……あれ、そしたら狼いなくない？","〈〉さんが白で、〈〉さんも白だから……あれ、そしたら狼いなくないっすか？",1],
["反対する理由がないので、〈〉にします","反対する理由もないんで、〈〉にするっす",1],
["次は、真っ先にあなたを吊りますからね","次は、真っ先にあなたを吊るっすからね",1]]});
HK.Load.toneData("cool",{"F":[
["ちょっといい？〈〉の投票先、毎回いちばん安全なところを選んでる気がする。〈〉が白なら、それはそれで情報になる。","一つ指摘する。〈〉の投票先は、毎回もっともリスクの低い位置だ。〈〉が白なら、それ自体が有益なデータになる。",1],
["今のうちに言っておく。〈〉、〈〉が疑われたときだけ、やけに庇うよね。〈〉が白なら、それはそれで情報になる。","今のうちに言っておく。〈〉は、〈〉が疑われた局面に限って庇う。偏りがある。〈〉が白なら、それも有益なデータだ。",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","整理する。〈〉は対抗が出た直後に、どちらを信じるか即断した。根拠が不足している。〈〉の説明を聞きたい。",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉と〈〉は、互いに一度も疑っていない。〈〉が白なら、それ自体が有益なデータだ。",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉の発言は昨日と今日で矛盾している。〈〉、説明してくれ。",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙っておく予定だったが、言う。私は占い師だ。〈〉は人狼ではなかった",1],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村側である可能性が高い。だから〈〉の意見を軸にする",1],
["全員が同じことを言い出したら、逆に怪しい。俺は〈〉を見てる","全員の意見が一致したら、かえって怪しい。私は〈〉を見ている",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉は質問に対して、質問で返している。〈〉の見解を聞きたい。",1],
["霊媒結果と照らし合わせれば、〈〉の結果だけ噛み合わない","霊媒結果と照合すると、〈〉の結果だけが整合しない",1],
["むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ","むしろ怪しいのは〈〉の方だ。根拠も示せる",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙っておく予定だったが、言う。私は占い師だ。〈〉は人狼だった",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","占い結果の整合性を見れば分かる。〈〉の結果は不自然だ",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉は対抗が出てから結果を出した。タイミングが不自然だ。偽物だ",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉は今日、発言量が少ない。〈〉、説明してくれ。",1],
["自分では決められないので、今日は流れに乗ります","判断材料が足りない。今日は多数派に乗る",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","全員、今日の投票先を一人ずつ言ってくれ。最後に集計する",1],
["みんな、いい村だったよ。私たちのほうが上手だったけど","いい村だった。私たちの方が一手上回っていたが",1],
["理由はないけど、〈〉だけは信用できない気がする","根拠はない。だが、〈〉だけは信用できない",1],
["真贋は判断できない。だから占い師から順に吊る","真贋は判断できない。だから占い師から順に吊る。それが最も確実だ",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒なら、すべての事象に説明がつく。私は〈〉に入れる",1],
["私が村人であることは、明日の結果が証明する","私が村人であることは、明日の結果が証明する。待てばいい",1],
["つまり〈〉が怪しい、のは……さっき否定したんだった","つまり〈〉が怪しい、のは……さっき自分で否定していた",1],
["明日に情報を残すためにも、今日は〈〉を吊る","明日に情報を残すためにも、今日は〈〉を吊るのが合理的だ",1],
["村のために言うけど、〈〉の動き、ずっとおかしい","村のために言う。〈〉の行動は、ずっと一貫性がない",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","おい、〈〉！　最後まで白いと言っていただろう！",1],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉は違う。むしろ〈〉の方が怪しい",1],
["私を吊って、明日後悔しても知らないよ","私を吊って、明日後悔しても知らないぞ",1],
["次は霊媒結果を見て、推理を組み直せ","次は霊媒結果を見て、推理を組み直せ",1],
["私が狼なら、今ここで〈〉を庇ってる","私が狼なら、今ここで〈〉を庇っているはずだ",1],
["根拠が薄いのは〈〉のほうだよ","根拠が薄いのは〈〉のほうだ。論拠を示してくれ",1],
["わ、私じゃない……と、思う……いや、違う！","わ、私ではない……はずだ……いや、違う！",1],
["次は、真っ先にお前を吊るからな","次は真っ先にお前を吊る。疑わしさが最も高いからな",1],
["騙すの、正直ちょっとつらかった","騙すのは、正直つらかった。割り切れなかった",1],
["直感って大事だよ。〈〉、目を逸らしたでしょ","直感も判断材料だ。〈〉、目を逸らしただろう",1],
["〈〉の推理、穴だらけだよ。指摘しようか？","〈〉の推理は穴だらけだ。指摘しようか？",1],
["完敗。次は負けないよ","完敗だ。次は負けない",1],
["私の勘、当たるんだよ。〈〉","私の勘は当たる。〈〉だ",1],
["理由を聞かれても困るけど、〈〉に一票！","理由を聞かれても困るが、〈〉に一票",1],
["出るね。占い師。〈〉――人狼でした","出る。占い師だ。〈〉――人狼だった",1],
["なんとなくだけど、〈〉から狼の匂いがする","根拠は薄いが、〈〉から狼の匂いがする",1],
["……〈〉が怪しいと思う","……〈〉が怪しい",1],
["〈〉が噛まれるのは分かってたし……あ、いや、予想してたって意味","〈〉が噛まれるのは分かっていた……いや、予想していたという意味だ",1],
["まあ、楽しかったからいいや","まあ、楽しかったから良しとする",1],
["反対する理由がないので、〈〉で","反対する理由がない。〈〉で",1],
["いちいち説明させないで","いちいち説明させるな",1],
["……そういう言い方するから疑われるんだよ","……そういう言い方をするから疑われるんだ",1],
["私の考えを言う。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。俺は〈〉が怪しいと思う。","私の考えを言う。〈〉は対抗が出た瞬間、どちらを信じるか即決した。根拠が薄い。私は〈〉が怪しいと見ている。",1],
["名前、書き間違えてた……","名前を、書き間違えていた……",1],
["待って、占い師は私。〈〉は人狼でした","待て、占い師は私だ。〈〉は人狼だった",1],
["私は村人。断言する","私は村人だ。断言する",1],
["〈〉の発言、全部辻褄が合わない","〈〉の発言は、全部辻褄が合わない",1],
["〈〉、さっきから全員の顔色をうかがってる。〈〉が白なら、それはそれで情報になる。","〈〉は、さっきから全員の顔色をうかがっている。〈〉が白なら、それはそれで有益なデータになる。",1],
["……あれ？　昨日、誰に入れたんだっけ","……待て。昨日、誰に入れたんだったか",1],
["〈〉、正直に言いなよ。狼でしょ？","〈〉、正直に言え。狼だろう？",1],
["人狼がこんなに堂々としてると思う？","人狼が、これほど堂々としていると思うか？",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から言う。平和な朝の直前、〈〉は護衛先を探る発言をしていた。総合すると、〈〉が最も黒い。",1],
["言いにくいけど、言うね。昨日の投票、〈〉だけが流れと違うところに入れてる。〈〉の意見を聞きたい。","言いにくいが、言う。昨日の投票で、〈〉だけが流れと異なる先に入れている。〈〉の説明が欲しい。",1],
["ちょっといい？〈〉の発言、昨日と今日で言ってることが逆になってる。俺の中では、〈〉が一番黒い。","一つ指摘する。〈〉の発言は昨日と今日で矛盾している。総合して、〈〉が最も黒い。",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉は今日、発言量が極端に少ない。総合して、〈〉が最も黒い。",1],
["村目線で言わせてもらうと、〈〉の動きが一番狼っぽい","村の視点で分析すると、〈〉の動きが最も狼に近い",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","ここで票が割れるのが最悪の展開だ。〈〉に揃える",1],
["〈〉って、狼のときもこんな感じだったよね？","〈〉は、狼のときもこういう挙動だったはずだ",1],
["〈〉って感じじゃないんだよね。〈〉にする","〈〉という感じではない。〈〉にする",1]]});
HK.Load.toneData("calm",{"F":[
["その根拠、確率で言えば三割もない","その根拠、あんまり当てにならない"],
["否定材料を三つ挙げよう","違うと思う理由を三つ挙げよう"],
["感情論だな。データで来い","感情論だな。根拠を出せ"],
["私が白と分かれば、残りの計算が楽になる","私が白と分かれば、残りはずっと絞りやすくなる"],
["私を吊るのは、期待値で見て損だ","私を吊っても、損をするだけだ"],
["ちょっといい？〈〉の投票先、毎回いちばん安全なところを選んでる気がする。〈〉が白なら、それはそれで情報になる。","少しいいか。〈〉の投票先は、いつもいちばん安全なところだ。〈〉が白なら、それはそれで手がかりになる。",1],
["今のうちに言っておく。〈〉、〈〉が疑われたときだけ、やけに庇うよね。〈〉が白なら、それはそれで情報になる。","今のうちに言っておく。〈〉は、〈〉が疑われたときだけ、やけに庇う。〈〉が白なら、それはそれで手がかりになる。",1],
["言いにくいけど、言うね。昨日の投票、〈〉だけが流れと違うところに入れてる。〈〉の意見を聞きたい。","言いにくいが、言う。昨日の投票、〈〉だけが流れと違うところに入れている。〈〉の意見を聞きたい。",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","整理させてくれ。〈〉は対抗が出た瞬間、どちらを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉と〈〉、お互いに一度も疑っていない。〈〉が白なら、それはそれで手がかりになる。",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉の発言、昨日と今日で言っていることが逆になっている。〈〉、説明してほしい。",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙っているつもりだったけど、言う。私は占い師だ。〈〉は人狼ではなかった",1],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村だと思っている。だから〈〉の意見を軸にする",1],
["全員が同じことを言い出したら、逆に怪しい。俺は〈〉を見てる","全員が同じことを言い出したら、逆に怪しい。私は〈〉を見ている",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉は質問されると、質問で返している。〈〉の意見を聞きたい。",1],
["霊媒結果と照らし合わせれば、〈〉の結果だけ噛み合わない","霊媒結果と照らし合わせると、〈〉の結果だけ噛み合わない",1],
["むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ","むしろ怪しいのは〈〉のほうだと思う。理由も言える",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙っているつもりだったけど、言う。私は占い師だ。〈〉は人狼だった",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","占い結果の筋を見れば分かる。〈〉の結果は不自然だ",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉は対抗が出てから急に結果を言い出した。偽物だ",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉は今日、ずっと口数が少ない。〈〉、説明してほしい。",1],
["自分では決められないので、今日は流れに乗ります","自分では決められないから、今日は流れに乗る",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","全員、今日の投票先を一人ずつ言ってくれ。最後にまとめる",1],
["みんな、いい村だったよ。私たちのほうが上手だったけど","みんな、いい村だった。私たちのほうが上手だったけど",1],
["理由はないけど、〈〉だけは信用できない気がする","理由はないけど、〈〉だけは信用できない気がする",1],
["真贋は判断できない。だから占い師から順に吊る","真贋は判断できない。だから占い師から順に吊る",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒なら、全部説明がつく。私は〈〉に入れる",1],
["私が村人であることは、明日の結果が証明する","私が村人であることは、明日の結果が証明してくれる",1],
["つまり〈〉が怪しい、のは……さっき否定したんだった","つまり〈〉が怪しい、のは……さっき否定したんだった",1],
["明日に情報を残すためにも、今日は〈〉を吊る","明日に情報を残すためにも、今日は〈〉を吊る",1],
["村のために言うけど、〈〉の動き、ずっとおかしい","村のために言う。〈〉の動き、ずっとおかしい",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","おい、〈〉！　最後まで白いって言ってただろう！",1],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉は違うと思う。むしろ〈〉が怪しい",1],
["私を吊って、明日後悔しても知らないよ","私を吊って、明日後悔しても知らないぞ",1],
["次は霊媒結果を見て、推理を組み直せ","次は霊媒結果を見て、推理を組み直そう",1],
["私が狼なら、今ここで〈〉を庇ってる","私が狼なら、今ここで〈〉を庇ってる",1],
["根拠が薄いのは〈〉のほうだよ","根拠が薄いのは、〈〉のほうじゃないかな",1],
["わ、私じゃない……と、思う……いや、違う！","わ、私じゃない……と、思う……ううん、違う！",1],
["次は、真っ先にお前を吊るからな","次は、真っ先にお前を吊るからね",1],
["騙すの、正直ちょっとつらかった","騙すの、正直ちょっとつらかったんだ",1],
["計算違いだったな","思ってたのと違ったね",1],
["想定より一日早かった","思っていたより、一日早かったね",1],
["本物の占い師は私。〈〉は人狼でした","本物の占い師は私だ。〈〉は人狼だった",1],
["待って、占い師は私。〈〉は人狼でした","待て、占い師は私だ。〈〉は人狼だった",1],
["出るね。占い師。〈〉――人狼でした","出る。占い師だ。〈〉――人狼だった",1],
["偽物が出たね。私が本物。〈〉――人狼でした","偽物が出たね。本物は私だ。〈〉――人狼だった",1],
["出るね。占い師。〈〉――人狼ではありませんでした","出る。占い師だ。〈〉――人狼ではなかった",1],
["私は村人。断言する","私は村人だ。断言する",1],
["完敗。次は負けないよ","完敗だ。次は負けないよ",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言っていた。私の中では、〈〉が一番黒い。",1],
["ちょっといい？〈〉の発言、昨日と今日で言ってることが逆になってる。俺の中では、〈〉が一番黒い。","少しいいか。〈〉の発言、昨日と今日で言っていることが逆になっている。私の中では、〈〉が一番黒い。",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉は今日、ずっと口数が少ない。私の中では、〈〉が一番黒い。",1],
["村目線で言わせてもらうと、〈〉の動きが一番狼っぽい","村の目線で言わせてもらうと、〈〉の動きが一番狼らしい",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","ここで割れるのが一番まずい。〈〉に揃えよう",1],
["〈〉って、狼のときもこんな感じだったよね？","〈〉って、狼のときもこんな感じだったよな？",1],
["その推論は前提が間違っている","その考えは、前提が違ってる",1]]});
HK.Load.toneData("free",{"F":[
["〈〉、さっきから喋らなさすぎじゃない？","〈〉、さっきから喋らなさすぎじゃない！？",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉、今日ずっと口数少ないよね！　〈〉、説明して！",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉、今日ずっと口数少ないよね！　私の中じゃ〈〉が一番黒い！",1],
["〈〉が言うなら、たぶんそうなんだろうな……","〈〉が言うなら、たぶんそうなんだろうね！",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒なら全部説明がつくね！　私は〈〉に入れる！",1],
["〈〉って、狼のときもこんな感じだったよね？","〈〉って、狼のときもこんな感じだったよね？",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉と〈〉、お互い一度も疑ってないよね！　〈〉が白なら、それも情報になるよ",1],
["〈〉の意見に賛成です。〈〉でいいと思う","〈〉の意見に賛成！　〈〉でいいと思う！",1],
["〈〉の推理、穴だらけだよ。指摘しようか？","〈〉の推理、穴だらけだよ！　指摘しよっか？",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉の発言、昨日と今日で逆になってるよ！　〈〉、説明して！",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉は対抗が出てから急に結果を言い出したよ！　偽物だね！",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉、質問されると質問で返してるよね！　〈〉はどう思う？",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","ちょっと〈〉！　最後まで白いって言ってたじゃん！",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","ここで割れるのが一番まずいよ！　〈〉に揃えよう！",1],
["ごめん！　ゲームだから、ゲームだから！","ごめんね！　ゲームだから、ゲームだから！",1],
["みんな、いい村だったよ。私たちのほうが上手だったけど","みんな、いい村だったよ！　私たちのほうが上手だったけどね！",1],
["むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ","むしろ怪しいのは〈〉のほうだと思う！　理由も言えるよ！",1],
["やられたー！　いや、今回は完全に〈〉の勝ちだ！","やられたー！　今回は完全に〈〉の勝ちだね！",1],
["人狼がこんなに堂々としてると思う？","人狼がこんなに堂々としてると思う！？",1],
["人狼だったら、もっとうまく隠れるって","人狼だったら、もっとうまく隠れるってば！",1],
["偽物が出たね。私が本物。〈〉――人狼でした","偽物が出たね！　本物は私！　〈〉――人狼だったよ！",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","全員、今日の投票先を一人ずつ言って！　最後にまとめるね！",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","占い結果の筋を見れば分かるよ！　〈〉の結果は不自然！",1],
["多数派に乗るのが一番危ないんだよ。今日は〈〉に入れる","多数派に乗るのが一番危ないんだよ！　今日は〈〉に入れる！",1],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村だと思ってる！　だから〈〉の意見を軸にするね",1],
["待って、さっきと言ってること逆だ","待って、さっきと言ってること逆だよ！",1],
["待って、占い師は私。〈〉は人狼でした","待って、占い師は私！　〈〉は人狼だったよ！",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","整理させて！　〈〉は対抗が出た瞬間、どっちを信じるか即決してた。根拠薄いよね？　〈〉はどう思う？",1],
["明日に情報を残すためにも、今日は〈〉を吊る","明日に情報を残すためにも、今日は〈〉を吊ろう！",1],
["本物の占い師は私。〈〉は人狼でした","本物の占い師は私！　〈〉は人狼だったよ！",1],
["村目線で言わせてもらうと、〈〉の動きが一番狼っぽい","村目線で言うとね、〈〉の動きが一番狼っぽい！",1],
["次は、真っ先にお前を吊るからな","次は、真っ先にあなたを吊るからね！",1],
["直感って大事だよ。〈〉、目を逸らしたでしょ","直感って大事だよ！　〈〉、目を逸らしたでしょ！",1],
["真贋は判断できない。だから占い師から順に吊る","本物か分かんないから、占い師から順に吊ろう！",1],
["私が村人であることは、明日の結果が証明する","私が村人だってことは、明日の結果が証明してくれるよ！",1],
["私が狼なら、今ここで〈〉を庇ってる","私が狼なら、今ここで〈〉を庇ってるよ！",1],
["私は明日も生きて、〈〉の黒を証明する","私は明日も生きて、〈〉の黒を証明してみせる！",1],
["私を吊って、明日後悔しても知らないよ","私を吊ったら、明日後悔しても知らないよ！",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論からね！　平和な朝の前、〈〉が護衛先を探るようなこと言ってたの。私の中じゃ〈〉が一番黒い！",1],
["自信ないけど、みんなと同じで〈〉に","自信ないけど、みんなと同じで〈〉に！",1],
["自分では決められないので、今日は流れに乗ります","自分じゃ決められないから、今日は流れに乗っちゃう！",1],
["順番に意見を言おう。最後に決を採る","順番に意見を言おう！　最後に決を採るね！",1],
["騙すの、正直ちょっとつらかった","騙すの、正直ちょっとつらかった……",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙ってるつもりだったけど、言っちゃう！　占い師は私！　〈〉は人狼だったよ！",1],
["対抗します。占い師は私。〈〉は人狼でした","対抗するよ！　占い師は私！　〈〉は人狼だった！",1]]});
HK.Load.toneData("usan",{"F":[
["いいよ、私を吊っても。でも次は〈〉を吊ってね","いいよ、私を吊っても。でも次は〈〉を吊ってほしいねえ"],
["いやあ、騙された騙された","いやあ、すっかり騙されたねえ"],
["おい、〈〉！　最後まで白いって言ってただろうが！","おい、〈〉！　最後まで白いって言ってたじゃないか！"],
["感じ悪いな。それ、狼ムーブじゃない？","感じ悪いねえ。それ、狼ムーブなんじゃない？"],
["言いにくいけど、言うね。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。俺は〈〉が怪しいと思う。","言いにくいけど、言うね。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。私は〈〉が怪しいと思うよ。"],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉、今日はずっと口数が少ないねえ。〈〉、説明してもらえるかい？",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉、今日はずっと口数が少ないねえ。私の中じゃ、〈〉が一番黒いよ",1],
["〈〉が言うなら、たぶんそうなんだろうな……","〈〉が言うなら、たぶんそうなんだろうねえ……",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒なら全部説明がつくねえ。私は〈〉に入れるよ",1],
["〈〉って、狼のときもこんな感じだったよね？","〈〉って、狼のときもこんな感じだったよねえ？",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉と〈〉、お互い一度も疑ってないねえ。〈〉が白なら、それはそれで情報になるさ",1],
["〈〉の意見に賛成です。〈〉でいいと思う","〈〉の意見に賛成だねえ。〈〉でいいと思うよ",1],
["〈〉の推理、穴だらけだよ。指摘しようか？","〈〉の推理、穴だらけだねえ。ひとつずつ指摘してあげようか",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉の発言、昨日と今日で逆になってるねえ。〈〉、説明してもらえるかい？",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉は対抗が出てから急に結果を言い出したねえ。偽物だよ",1],
["うーん……疑われるのは仕方ないけど、違うんだ","うーん……疑われるのは仕方ないけどねえ、違うんだよ",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","ここで割れるのが一番まずいねえ。〈〉に揃えようじゃないの",1],
["ごめん！　ゲームだから、ゲームだから！","悪いねえ、ゲームだから、ゲームだからさ",1],
["みんな、いい村だったよ。私たちのほうが上手だったけど","みんな、いい村だったねえ。……私たちのほうが、ちょいと上手だったけどさ",1],
["むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ","むしろ怪しいのは〈〉のほうだと思うけどねえ。理由も言えるよ",1],
["やられたー！　いや、今回は完全に〈〉の勝ちだ！","やられたねえ。今回は完全に〈〉の勝ちだよ",1],
["人狼がこんなに堂々としてると思う？","人狼がこんなに堂々としてると思うかい？",1],
["人狼だったら、もっとうまく隠れるって","人狼だったら、もっとうまく隠れるさ",1],
["偽物が出たね。私が本物。〈〉――人狼でした","偽物が出たねえ。本物は私さ。〈〉――人狼だったよ",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","全員、今日の投票先を一人ずつ言っておくれ。最後にまとめるからさ",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","占い結果の筋を見れば分かるよねえ。〈〉の結果は不自然だよ",1],
["多数派に乗るのが一番危ないんだよ。今日は〈〉に入れる","多数派に乗るのが一番危ないんだよねえ。今日は〈〉に入れるよ",1],
["大丈夫、怒ってないよ。でも、村人なんだ","大丈夫、怒っちゃいないよ。でもねえ、村人なんだよ",1],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村だと思ってるよ。だから〈〉の意見を軸にしようかねえ",1],
["待って、さっきと言ってること逆だ","おや、待っておくれ。さっきと言ってること、逆じゃないかい",1],
["待って、占い師は私。〈〉は人狼でした","おっと、待っておくれ。占い師は私さ。〈〉は人狼だったよ",1],
["明日に情報を残すためにも、今日は〈〉を吊る","明日に情報を残すためにも、今日は〈〉を吊るとしようか",1],
["本物の占い師は私。〈〉は人狼でした","本物の占い師は私さ。〈〉は人狼だったよ",1],
["村目線で言わせてもらうと、〈〉の動きが一番狼っぽい","村目線で言わせてもらうとねえ、〈〉の動きが一番狼っぽいよ",1],
["次は、真っ先にお前を吊るからな","次は、真っ先にあんたを吊るとしようかねえ",1],
["直感って大事だよ。〈〉、目を逸らしたでしょ","直感ってのは大事でねえ。〈〉、目を逸らしたろう？",1],
["真贋は判断できない。だから占い師から順に吊る","真贋は判断できないねえ。だから、占い師から順に吊ろうか",1],
["私が村人であることは、明日の結果が証明する","私が村人だってことは、明日の結果が証明してくれるさ",1],
["私が狼なら、今ここで〈〉を庇ってる","私が狼なら、今ここで〈〉を庇ってるさ",1],
["私は明日も生きて、〈〉の黒を証明する","私は明日も生き延びて、〈〉の黒を証明してみせるさ",1],
["私を吊って、明日後悔しても知らないよ","私を吊って、明日後悔しても知らないよお？",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から言うとねえ、平和な朝の前、〈〉は護衛先を探るようなことを言ってたのさ。私の中じゃ、〈〉が一番黒いよ",1],
["自信ないけど、みんなと同じで〈〉に","自信はないけどねえ、みんなと同じで〈〉にしとくよ",1],
["自分では決められないので、今日は流れに乗ります","自分じゃ決められないからねえ。今日は流れに乗るとするよ",1],
["誰も責めないよ。あとはよろしくね","誰も責めやしないよ。あとはよろしく頼むよ",1],
["順番に意見を言おう。最後に決を採る","順番に意見を言っていこうか。最後に決を採るよ",1],
["騙すの、正直ちょっとつらかった","騙すのは、正直ちょいとつらかったねえ",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙ってるつもりだったけど、言うとしようかねえ。占い師さ。〈〉は人狼だったよ",1],
["実は最初から、ずっと狼でした","実は最初から、ずっと狼だったのさ",1],
["……〈〉さんの言う通りだと思います","……〈〉さんの言う通りだと思うねえ",1],
["霊媒師です。昨日処刑された〈〉は――人狼でした","霊媒師さ。昨日処刑された〈〉は――人狼だったよ",1],
["反対する理由がないので、〈〉で","反対する理由もないしねえ、〈〉で",1],
["はい！　〈〉が人狼だと思います！","はいはい、〈〉が人狼だと思うねえ",1]]});
HK.Load.toneData("shy",{"F":[
["〈〉、今日はずっと口数が少ない。〈〉の意見を聞きたい。","レ、〈〉、今日はずっと口数が少ないね……。〈〉の意見、聞きたいな……"],
["〈〉の推理、穴だらけだよ。指摘しようか？","……〈〉の推理、その……穴、あるかも……。い、言ってもいい……？"],
["いちいち説明させないで","い、いちいち……説明させないで、ほしい……"],
["そんなことも分からないの？","そ、そんなことも……わ、分からない、の……？"],
["感じ悪いな。それ、狼ムーブじゃない？","な、なんか……感じ悪い、かも。それ、狼ムーブじゃない……？"],
["根拠？　顔！　〈〉の顔が言ってる！","こ、根拠……？　か、顔……〈〉の顔が、そう言ってる、から……"],
["次は、真っ先にお前を吊るからな","つ、次は……真っ先に、あなたを吊るから……"],
["私が村人であることは、明日の結果が証明する","そ、その……私が村人だってことは……明日の結果で、わかると思う……",1],
["私は明日も生きて、〈〉の黒を証明する","……わ、私、明日も生きて……〈〉の黒を、証明する、から……"],
["私は村人。断言する","わ、私、村人なの……。ほ、本当に……信じて……"],
["私を信じて。後悔はさせない","わ、私を……信じて、ほしい……。こ、後悔は、させないから……"],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","す、少なくとも、〈〉さんは、む、村だと思います……だ、だから、〈〉さんの意見で……",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","だ、黙ってるつもり、でしたけど……わ、私、占い師で……〈〉さんは、じ、人狼、でした……",1],
["誰も責めないよ。あとはよろしくね","だ、誰も、責めません……あ、あとは、よろしく、お願いします……",1],
["ごめんね、みんな……仲間を、頼んだよ","ご、ごめんなさい、みんな……な、仲間を、お願い、します……",1],
["仲間のために、もう少し粘りたかった……","な、仲間のために……も、もう少し、粘りたかった……",1],
["私を吊って、明日後悔しても知らないよ","わ、私を吊ったら……あ、明日、こ、後悔、しますよ……？",1],
["私を吊ってもいいです。でも、そのあと必ず狼を見つけてください","わ、私を吊っても、いいです……で、でも、そのあと、か、必ず狼を、見つけてください……",1]]});
HK.Load.toneData("ojou",{"F":[
["自信ないけど、みんなと同じで〈〉に","自信はありませんけれど、皆さんと同じく〈〉さんに"],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙っているつもりでしたけれど、申し上げますわ。私、占い師ですの。〈〉さんは、人狼ではありませんでしたわ",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から申し上げますわ。平和な朝の前、〈〉さんは護衛先を探るようなことをおっしゃっていましたの。私の中では、〈〉さんがいちばん怪しいですわ。",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","整理させてくださいまし。〈〉さんは対抗が出た途端、どちらを信じるか即決なさいましたわね。根拠が薄くてよ。〈〉さんのご意見を伺いたいですわ。",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙っているつもりでしたけれど、申し上げますわ。私、占い師ですの。〈〉さんは、人狼でしたわ",1],
["自分では決められないので、今日は流れに乗ります","私では決めかねますので、今日は流れに乗りますわ",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉さんと〈〉さん、お互いに一度も疑っていらっしゃいませんわね。〈〉さんが白なら、それはそれで手がかりになりますわ。",1],
["わ、私じゃない……と、思う……いや、違う！","わ、私ではありませんわ……と、思いますの……いいえ、違いますわ！",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉さんのご発言、昨日と今日で逆になっていますわ。〈〉さん、ご説明くださいまし。",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","〈〉さん！　最後まで白だとおっしゃっていたではありませんの！",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉さんが黒なら、すべて説明がつきますわ。私は〈〉さんに入れますわね",1],
["誠に心外でございます。私は村人です","心外ですわ。私は村人ですのよ",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉さん、今日はずっと口数が少ないですわね。私の中では、〈〉さんがいちばん怪しいですわ。",1],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉さんは違うと思いますわ。むしろ、〈〉さんのほうが怪しくてよ",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉さんは質問されると、質問で返していらっしゃいますわね。〈〉さんのご意見を伺いたいですわ。",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉さん、今日はずっと口数が少ないですわね。〈〉さん、ご説明くださいまし。",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","皆さま、今日の投票先をお一人ずつおっしゃって。最後に私がまとめますわ",1],
["いやあ、騙された騙された","まあ、すっかり騙されましたわ",1],
["くっそー！　あと一手だったのに！","悔しいですわ！　あと一手でしたのに！",1],
["人狼がこんなに堂々としてると思う？","人狼がこんなに堂々としていると思いまして？",1],
["反論がないなら、〈〉で決めるぞ","反論がないなら、〈〉さんで決めますわよ",1],
["感情じゃなくて情報で決めよう。今日は〈〉","感情ではなく、情報で決めましょう。今日は〈〉さんですわ",1],
["議論は出尽くした。決を採ろう。俺は〈〉","議論は出尽くしましたわ。決を採りましょう。わたくしは〈〉さんに入れますわ",1],
["理由はないけど、〈〉だけは信用できない気がする","理由はありませんけれど、〈〉さんだけは信用できない気がしますわ",1],
["〈〉吊ろう！　外れたら謝る！","〈〉さんを吊りましょう！　外れたら謝りますわ！",1],
["〈〉の推理、納得できた。〈〉で","〈〉さんの推理、納得できましたわ。〈〉さんで",1],
["〈〉の意見に賛成です。〈〉でいいと思う","〈〉さんのご意見に賛成ですわ。〈〉さんでよろしいと思います",1],
["……〈〉さんの言う通りだと思います","……〈〉さんのおっしゃる通りだと思いますわ",1],
["騙すの、正直ちょっとつらかった","騙すのは、正直、少しつらかったですわ",1],
["〈〉、その座り方、絶対狼だって","〈〉さん、その座り方、絶対に狼ですわよ",1],
["〈〉が言うなら、たぶんそうなんだろうな……","〈〉さんがおっしゃるなら、たぶんそうなのでしょうね……",1],
["今日の占い結果。〈〉は人間","今日の占い結果ですわ。〈〉さんは人間でした",1],
["村のために言うけど、〈〉の動き、ずっとおかしい","村のために申しますけれど、〈〉さんの動き、ずっとおかしいですわ",1],
["私の考えを言う。〈〉の推理、結論ありきで後から理由をつけてる感じがする。俺の中では、〈〉が一番黒い。","わたくしの考えを申しますわ。〈〉さんの推理、結論ありきで後から理由をつけている感じがします。わたくしの中では、〈〉さんがいちばん黒いですわ。",1],
["〈〉の笑い方、絶対なんか隠してる！","〈〉さんの笑い方、絶対に何か隠していますわ！",1],
["負けたけど、推理は楽しかった","負けましたけれど、推理は楽しかったですわ",1]]});
HK.Load.toneData("hero",{"F":[
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙ってるつもりだったけど、言うぞ！　占い師だ！　〈〉は人狼じゃなかった！",1],
["自分では決められないので、今日は流れに乗ります","自分じゃ決められねえ！　今日は流れに乗るぜ！",1],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村だと思う！　だから〈〉の意見を軸にするぜ！",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙ってるつもりだったけど、言うぞ！　占い師だ！　〈〉は人狼だった！",1],
["わ、私じゃない……と、思う……いや、違う！","わ、私じゃない……と、思う……いや、違う！",1],
["私を吊って、明日後悔しても知らないよ","私を吊って、明日後悔しても知らねえぞ！",1],
["うそでしょ、私!?　ないって！　信じて！","うそだろ、私!?　ないって！　信じてくれ！",1],
["えー、ここで退場!?　まあいっか、応援してるね！","えー、ここで退場か!?　……よし、あとは任せたぜ！",1],
["あーあ、もっと遊びたかった！　またね！","あーあ、もっと遊びたかったぜ！　またな！",1],
["私を信じて。後悔はさせない","私を信じろ！　後悔はさせねえ！",1],
["私は村人。断言する","私は村人だ！　断言するぜ！",1],
["〈〉、正直に言いなよ。狼でしょ？","〈〉、正直に言えよ！　狼だろ？",1],
["笑っちゃう。私が人狼なら、もっと上手くやるって","笑っちまうぜ。私が人狼なら、もっと上手くやるって！",1],
["むしろ怪しいのは〈〉のほうだと思う！　理由も言えるよ","むしろ怪しいのは〈〉のほうだと思うぜ！　理由も言えるぞ！",1],
["確認なんだけど、〈〉は質問されると、質問で返してる。〈〉、説明してほしい。","確認なんだけど、〈〉は質問されると、質問で返してる。〈〉、説明してくれ！",1],
["疑うなら、どうぞ。何も出てこないから","疑うなら好きにしてくれ！　何も出てこないからな！",1],
["〈〉の推理、納得できた。〈〉で","〈〉の推理、納得できた。〈〉で決まりだ！",1],
["村目線で言うとね、〈〉の動きが一番狼っぽい","村目線で言うとな、〈〉の動きが一番狼っぽいぜ",1],
["な、なんで私なのよ！　ちゃんと見てたの？","な、なんで私が疑われるんだ！？　ちゃんと見てたのか！？",1],
["さっきから気になってたんだけど、〈〉はCOが出る前から、占い師の真贋に妙に詳しかった。〈〉、説明してほしい。","さっきから気になってたんだけど、〈〉はCOが出る前から、占い師の真贋に妙に詳しかった。〈〉、説明してくれ！",1],
["本物の占い師は私だよ。〈〉は人狼でした","本物の占い師は私だ！　〈〉は人狼だったぜ！",1]]});
HK.Load.toneData("gyaru",{"F":[
["〈〉、さっきから喋らなさすぎじゃない？","〈〉、さっきから全然しゃべってなくない？",1],
["〈〉が言うなら、たぶんそうなんだろうな……","〈〉が言うなら、たぶんそうなんだろうな〜",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒なら全部説明つくじゃん。私は〈〉に入れる",1],
["〈〉って、狼のときもこんな感じだったよね？","〈〉ってさ、狼のときもこんな感じじゃなかった？",1],
["〈〉の意見に賛成です。〈〉でいいと思う","〈〉の意見に賛成〜。〈〉でいいと思う！",1],
["〈〉の推理、穴だらけだよ。指摘しようか？","〈〉の推理、穴だらけじゃん。ツッコんでいい？",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉、対抗出てから急に結果言い出したじゃん。偽物確定！",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","ちょ、〈〉！　最後まで白いって言ってたじゃん！",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","ここで割れんのが一番ヤバいって！　〈〉に揃えよ！",1],
["ごめん！　ゲームだから、ゲームだから！","ごめんってば！　ゲームだから、ゲームだから〜！",1],
["みんな、いい村だったよ。私たちのほうが上手だったけど","みんな、いい村だったよ〜！　ま、私たちのほうが上手だったけど！",1],
["むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ","むしろ怪しいの〈〉のほうじゃん？　理由も言えるし！",1],
["やられたー！　いや、今回は完全に〈〉の勝ちだ！","やられたー！　今回は完全に〈〉の勝ちじゃん！",1],
["人狼がこんなに堂々としてると思う？","人狼がこんな堂々としてるわけなくない？",1],
["人狼だったら、もっとうまく隠れるって","人狼だったらもっとうまく隠れるって！",1],
["偽物が出たね。私が本物。〈〉――人狼でした","偽物出たね〜。本物は私！　〈〉――人狼だったよ",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","全員、今日の投票先ひとりずつ言って〜！　最後にまとめるから！",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","占い結果の筋見れば分かるじゃん。〈〉の結果、不自然すぎ",1],
["多数派に乗るのが一番危ないんだよ。今日は〈〉に入れる","多数派に乗るのが一番ヤバいんだって。今日は〈〉に入れる！",1],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村だと思ってる！　だから〈〉の意見軸でいこ",1],
["待って、さっきと言ってること逆だ","待って待って、さっきと言ってること逆じゃん！",1],
["待って、占い師は私。〈〉は人狼でした","待って待って、占い師は私！　〈〉は人狼だったし！",1],
["明日に情報を残すためにも、今日は〈〉を吊る","明日に情報残すためにも、今日は〈〉吊ろ！",1],
["本物の占い師は私。〈〉は人狼でした","本物の占い師、私だから！　〈〉は人狼だったよ",1],
["村目線で言わせてもらうと、〈〉の動きが一番狼っぽい","村目線で言うと、〈〉の動きがいちばん狼っぽくない？",1],
["次は、真っ先にお前を吊るからな","次は真っ先にあんた吊るし",1],
["真贋は判断できない。だから占い師から順に吊る","どっちが本物か分かんないし、占い師から順に吊ろ",1],
["私が村人であることは、明日の結果が証明する","私が村人なのは、明日の結果で分かるし！",1],
["私が狼なら、今ここで〈〉を庇ってる","私が狼だったら、今ここで〈〉庇ってるし",1],
["私は明日も生きて、〈〉の黒を証明する","私、明日も生き残って〈〉の黒、証明してみせるし！",1],
["私を吊って、明日後悔しても知らないよ","私吊ったら、明日マジで後悔するよ？",1],
["自信ないけど、みんなと同じで〈〉に","自信ないけど、みんなと同じで〈〉にしとく",1],
["自分では決められないので、今日は流れに乗ります","自分じゃ決めらんないし、今日はノリで流れに乗る〜",1],
["順番に意見を言おう。最後に決を採る","順番に意見言ってこ！　最後に決とるね",1],
["騙すの、正直ちょっとつらかった","騙すの、正直ちょっとしんどかった",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙ってるつもりだったけど、言うね。占い師、私。〈〉は人狼だった",1],
["狩人です。昨夜は〈〉を守った","狩人だよ！　昨夜は〈〉守ったし",1],
["悪いけど、空気には合わせない。〈〉が怪しい","悪いけど、空気には合わせないし。〈〉が怪しい"],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙ってるつもりだったけど、言うね。占い師。〈〉は人狼じゃなかったよ"],
["霊媒結果と照らし合わせれば、〈〉の結果だけ噛み合わない","霊媒結果と照らし合わせたら、〈〉の結果だけ噛み合わないんだけど"],
["ここからは協力しよう","ここからは協力しよ"],
["感じ悪いな。それ、狼ムーブじゃない？","感じ悪っ。それ、狼ムーブじゃない？"],
["直感って大事だよ。〈〉、目を逸らしたでしょ","直感って大事だよ。〈〉、目そらしたじゃん"],
["私の勘、当たるんだよ。〈〉","私の勘、当たるんだよね。〈〉"],
["霊媒師です。昨日処刑された〈〉は――人狼でした","霊媒師だよ。昨日処刑された〈〉は――人狼だった"],
["私を信じて。後悔はさせない","私を信じて。後悔はさせないから！"],
["……〈〉さんの言う通りだと思います","……〈〉の言う通りだと思う"],
["私は村人。断言する","私は村人。断言する！"],
["ひとつ引っかかってる。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。俺の中では、〈〉が一番黒い。","一個引っかかってんだけど。〈〉は「誰でもいい」って言ったのに、急に一人に絞ったじゃん。理由が見えないし。私の中では、〈〉が一番クロ。"],
["出るね。占い師。〈〉――人狼ではありませんでした","出るね。占い師。〈〉――人狼じゃなかったよ"],
["本物の占い師は私だよ。〈〉は人狼でした","本物の占い師は私だよ。〈〉は人狼だった"],
["CO者には明日も結果を出してもらう。今日はそれ以外から","CO者には明日も結果出してもらうね。今日はそれ以外からで"],
["私の考えを言う。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。俺は〈〉が怪しいと思う。","私的にはさ、〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。私は〈〉が怪しいと思うんだよね。"],
["明日の占い結果まで見据えて、今日は〈〉を吊る","明日の占い結果まで考えて、今日は〈〉吊るね"],
["私の考えを言う。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。俺は〈〉が怪しいと思う。","私的にはさ、〈〉って対抗が出た瞬間、どっち信じるか即決したじゃん。根拠薄くない？　私は〈〉が怪しいと思うんだよね。"],
["俺は〈〉を信じる。今日は二人で同じところに入れよう","私は〈〉を信じる。今日は二人で同じとこに入れよ"],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論からね！　平和な朝の前、〈〉が護衛先探るようなこと言ってたの。私の中じゃ〈〉が一番クロ！"],
["ちょっといい？〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。俺は〈〉が怪しいと思う。","ちょ、いい？　〈〉って対抗が出た瞬間、どっち信じるか即決したじゃん。根拠薄くない？　私は〈〉が怪しいと思うんだよね。"],
["さっきから気になってたんだけど、〈〉、具体的な名前を一度も出してないよね。〈〉の意見を聞きたい。","てかさ、さっきから気になってたんだけど、〈〉、具体的な名前一回も出してないよね。〈〉の意見聞きたいんだけど。"],
["結論から言うと、〈〉、具体的な名前を一度も出してないよね。〈〉が白なら、それはそれで情報になる。","ぶっちゃけ、〈〉、具体的な名前一回も出してないよね。〈〉が白なら、それはそれで情報になるし。"],
["今のうちに言っておく。〈〉は霊媒結果を聞いても、表情ひとつ変えなかった。〈〉、説明してほしい。","今のうちに言っとくね。〈〉って霊媒結果聞いても、表情ひとつ変えなかったじゃん。〈〉、説明してほしいんだけど。"],
["待って、狩人CO。私を吊ると護衛がいなくなる","待って、狩人CO。私吊ったら護衛いなくなるよ"],
["みんな、聞いて。〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉の意見を聞きたい。","みんな、ちょっと聞いて〜。〈〉って自分から話題振らないじゃん。様子見にしても長すぎ。〈〉の意見聞きたいんだけど。"],
["いやあ、騙された騙された","いや〜、騙された騙された"],
["実は最初から、ずっと狼でした","実は最初から、ずっと狼だったんだよね"],
["全員が同じことを言い出したら、逆に怪しい。俺は〈〉を見てる","全員が同じこと言い出したら、逆に怪しいし。私は〈〉見てるから"],
["〈〉の発言、全部辻褄が合わない","〈〉の発言、全部辻褄合わないんだけど"],
["真贋を見極めよう。俺は〈〉が偽物だと判断する","真贋見極めよ。私は〈〉が偽物だと思う"],
["〈〉の推理、納得できた。〈〉で","〈〉の推理、マジ納得。〈〉で"],
["私の発言、全部見返してみて","私の発言、全部見返してみてよ"],
["ちょっといい？〈〉は〈〉への疑いを、話題を変えて逸らした。俺は〈〉が怪しいと思う。","ちょ、いい？　〈〉って〈〉への疑いを、話題変えて逸らしたよね。私、〈〉が怪しいと思うんだけど。"],
["〈〉、占い師が出たときの反応が早すぎた。知ってたみたいに。〈〉、説明してほしい。","〈〉、占い師が出たときの反応早すぎ。知ってたみたいじゃん。〈〉、説明してほしいんだけど。"],
["ちょっといい？〈〉は質問されると、質問で返してる。俺の中では、〈〉が一番黒い。","ちょ、いい？　〈〉って質問されると、質問で返してるじゃん。私の中じゃ、〈〉が一番クロ。"],
["議論は出尽くした。決を採ろう。俺は〈〉","議論は出尽くしたよね。決とろ。私は〈〉"],
["占い師を吊るのは最後の手段。今日はグレーを詰める","占い師吊るのは最後の手段じゃん。今日はグレー詰めよ"],
["三日目のあの発言も、全部演技だったのか。……〈〉、次は本気で見抜くから","三日目のあの発言も、全部演技だったんだ。……〈〉、次はマジで見抜くから"],
["結果を言う。〈〉、人間","結果言うね。〈〉、人間"],
["迷ったら一番怪しいところ。〈〉だ","迷ったら一番怪しいとこ。〈〉で"],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉、今日ずっと口数少ないよね！　私の中じゃ〈〉が一番クロ！"],
["反対する理由がないので、〈〉で","反対する理由ないし、〈〉で"],
["全員、〈〉に入れてくれ。責任は俺が取る","全員、〈〉に入れて。責任は私が取るから"],
["偽物が出たね。私が本物。〈〉――人狼ではありませんでした","偽物出たね。私が本物。〈〉――人狼じゃなかったよ"],
["確認なんだけど、〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉が白なら、それはそれで情報になる。","一応確認なんだけど、〈〉って自分から話題振らないじゃん。様子見にしても長すぎ。〈〉が白なら、それはそれで情報になるし。"],
["占いロラで確実に一人は狼を処理できる。今日は〈〉から","占いロラなら確実に一人は狼処理できるじゃん。今日は〈〉からね"],
["私の考えを言う。〈〉の推理、結論ありきで後から理由をつけてる感じがする。〈〉の意見を聞きたい。","私的にはさ、〈〉の推理、結論ありきで後から理由つけてる感じがするんだよね。〈〉の意見を聞きたいんだけど。"],
["〈〉は投票の直前で票先を変えた。あれ、何を見て変えたの？〈〉が白なら、それはそれで情報になる。","〈〉は投票の直前で票先変えたじゃん。あれ、何見て変えたの？〈〉が白なら、それはそれで情報になるし。"],
["平和な朝の前、〈〉は護衛先を探るようなことを言ってた。〈〉が白なら、それはそれで情報になる。","平和な朝の前、〈〉は護衛先を探るようなこと言ってたよね。〈〉が白なら、それはそれで情報になるじゃん。"],
["〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。俺の中では、〈〉が一番黒い。","〈〉、対抗が出た瞬間、どっち信じるか即決したよね。根拠薄くない？私の中では、〈〉が一番クロ。"],
["ひとつ引っかかってる。〈〉、具体的な名前を一度も出してないよね。〈〉の意見を聞きたい。","一個引っかかってんだけど。〈〉、具体的な名前一回も出してないよね。〈〉の意見聞きたいんだけど。"],
["〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","〈〉、対抗が出た瞬間どっち信じるか即決したよね。根拠薄くない？〈〉の意見聞きたいんだけど。"],
["今のうちに言っておく。〈〉は笑ってるけど、目が笑ってない。俺は〈〉が怪しいと思う。","今のうちに言っとくね。〈〉は笑ってるけど、目が笑ってないじゃん。私は〈〉が怪しいと思うんだよね。"],
["推理？　……〈〉が気に食わない。それだけ","推理？　……〈〉がムカつく。それだけ"],
["〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉の意見を聞きたい。","〈〉って自分から話題振らないよね。様子見にしても長すぎ。〈〉の意見聞きたいんだけど。"],
["みんな、聞いて。〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","みんな、ちょっと聞いて〜。〈〉、今日ずっと口数少ないじゃん。私の中では、〈〉が一番クロ。"],
["私の考えを言う。〈〉は笑ってるけど、目が笑ってない。〈〉の意見を聞きたい。","私的にはさ、〈〉は笑ってるけど、目が笑ってないじゃん。〈〉の意見聞きたいんだけど。"],
["〈〉が怪しい。今日は〈〉だ","〈〉が怪しいんだよね。今日は〈〉で"],
["霊媒結果を言うね。〈〉は人狼でした","霊媒結果言うね。〈〉は人狼だったよ"],
["結果を言う。〈〉、人狼","結果言うね。〈〉、人狼"],
["霊媒結果。〈〉――人狼でした","霊媒結果。〈〉――人狼だったよ"],
["状況が変わった。今日は〈〉だ","状況変わったし。今日は〈〉で"],
["ピンと来た。〈〉だ","ピンと来た。〈〉じゃん"],
["……みんなに合わせます","……みんなに合わせるよ"],
["役職を吊るのはもったいない。今日はグレーの","役職吊るのはもったいないじゃん。今日はグレーの"],
["よし、整理する。候補は〈〉と〈〉。今日は〈〉だ","よし、整理するね。候補は〈〉と〈〉。今日は〈〉で"],
["両方の発言を比べた。偽物は〈〉だと思う","両方の発言比べたんだけど。偽物は〈〉だと思う"],
["出るね。占い師。〈〉――人狼でした","出るね。占い師。〈〉――人狼だったよ"],
["異論は？　……ないな。〈〉だ","異論ある？　……ないよね。〈〉で決まり"],
["庇う理由がない。〈〉に入れる","庇う理由とかないし。〈〉に入れる"],
["みんな、聞いて。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。俺の中では、〈〉が一番黒い。","みんな、ちょっと聞いて〜。〈〉は「誰でもいい」って言ったのに、急に一人に絞ったじゃん。理由が見えないんだよね。私の中では、〈〉が一番クロ。"],
["私の考えを言う。〈〉は自分が疑われたときより、〈〉が疑われたときのほうが焦ってた。俺の中では、〈〉が一番黒い。","私的にはさ、〈〉は自分が疑われたときより、〈〉が疑われたときのほうが焦ってたんだよね。私の中では、〈〉が一番クロ。"],
["確認なんだけど、〈〉は自分から話題を振らない。様子見にしても長すぎる。俺の中では、〈〉が一番黒い。","一応確認なんだけど、〈〉は自分から話題振らないじゃん。様子見にしても長すぎ。私の中では、〈〉が一番クロ。"],
["ちょっといい？〈〉は笑ってるけど、目が笑ってない。俺の中では、〈〉が一番黒い。","ちょっといい？〈〉は笑ってるけど、目が笑ってないじゃん。私の中では、〈〉が一番クロ。"],
["〈〉、さっきから全員の顔色をうかがってる。俺の中では、〈〉が一番黒い。","〈〉、さっきから全員の顔色うかがってるよね。私の中では、〈〉が一番クロ。"],
["〈〉が噛まれるのは分かってたし……あ、いや、予想してたって意味","〈〉が噛まれるのは分かってたし……あ、いや、予想してたって意味だし",1]]});
HK.Load.toneData("chara",{"F":[
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙ってるつもりだったけど言うね。占い師。〈〉は人狼じゃなかったよ",1],
["自分では決められないので、今日は流れに乗ります","自分じゃ決めらんないから、今日は流れに乗っとくわ",1],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村っぽいんだよね。だから〈〉の意見軸でいこ",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙ってるつもりだったけど言うね。占い師。〈〉、人狼だったよ",1],
["わ、私じゃない……と、思う……いや、違う！","わ、私じゃない……と思う……いや、違うって！",1],
["私を吊って、明日後悔しても知らないよ","私のこと吊って、明日後悔しても知らないよ？",1],
["うそでしょ、私!?　ないって！　信じて！","うそっしょ、私!?　ないない！　信じてって！",1],
["えー、ここで退場!?　まあいっか、応援してるね！","えー、ここで退場!?　ま、いっか。応援してるね！",1],
["あーあ、もっと遊びたかった！　またね！","あーあ、もっと遊びたかった！　また遊ぼーね！",1],
["疑うなら、どうぞ。何も出てこないから","疑うならどーぞ。何も出てこないし",1],
["〈〉の推理、納得できた。〈〉で","〈〉の推理、納得したわ。〈〉でいいっしょ",1],
["私は村人。断言する","私、村人だから。断言するよ！",1],
["偽物が出たね。私が本物。〈〉――人狼ではありませんでした","偽物出たね！　本物は私！　〈〉――人狼じゃなかったよ！",1],
["な、なんで私なのよ！　ちゃんと見てたの？","な、なんで私が疑われてんの！？　ちゃんと見てた？",1],
["笑っちゃう。私が人狼なら、もっと上手くやるって","笑うわ。私が人狼なら、もっと上手くやるって"],
["私が狼だったら、もうとっくにボロ出てるよ！","私が狼だったら、もうとっくにボロ出てるって！"],
["いいよ、私を吊っても。でも次は〈〉を吊ってね","いいよ、私を吊っても。でも次は〈〉吊ってね"],
["多数派に乗るのが一番危ないんだよ。今日は〈〉に入れる","多数派に乗るのが一番ヤバいんだって。今日は〈〉に入れるわ"],
["私が村人であることは、明日の結果が証明する","私が村人だってことは、明日の結果が証明してくれるって"],
["村のために言うけど、〈〉の動き、ずっとおかしい","村のために言うけど、〈〉の動き、ずっとおかしくね？"],
["人狼がこんなに堂々としてると思う？","人狼がこんな堂々としてると思う？"],
["みんな、いい村だったよ。私たちのほうが上手だったけど","みんな、いい村だったよ！　私たちのほうが上手だったけどね！"],
["霊媒結果と照らし合わせれば、〈〉の結果だけ噛み合わない","霊媒結果と照らし合わせたら、〈〉の結果だけ噛み合わないんだよね"],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒なら全部説明つくっしょ。私は〈〉に入れるわ"],
["〈〉、さっきから喋らなさすぎじゃない？","〈〉、さっきから喋らなさすぎじゃね？"],
["〈〉が言うなら、たぶんそうなんだろうな……","〈〉が言うなら、たぶんそうなんだろうね……"],
["ここからは協力しよう","ここからは協力しよ"],
["待って、占い師は私。〈〉は人狼でした","待って、占い師は私！　〈〉は人狼だったよ！"],
["私は明日も生きて、〈〉の黒を証明する","私は明日も生きて、〈〉の黒を証明してみせるって"],
["私が狼なら、今ここで〈〉を庇ってる","私が狼なら、今ここで〈〉を庇ってるって"],
["私の勘、当たるんだよ。〈〉","私の勘、当たるんだって。〈〉"],
["霊媒師です。昨日処刑された〈〉は――人狼でした","霊媒師っす。昨日処刑された〈〉は――人狼だったわ"],
["私を信じて。後悔はさせない","私を信じてって。後悔はさせないから"],
["……〈〉さんの言う通りだと思います","……〈〉の言う通りだと思うわ"],
["本物の占い師は私。〈〉は人狼でした","本物の占い師は私！　〈〉は人狼だったよ！"],
["〈〉の返事、ちょっと早すぎない？　怪しい！","〈〉の返事、ちょい早すぎじゃね？　怪しい！"],
["ひとつ引っかかってる。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。俺の中では、〈〉が一番黒い。","一個引っかかってんだよね。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えねー。私の中では、〈〉が一番クロだわ。"],
["出るね。占い師。〈〉――人狼ではありませんでした","出るね。占い師。〈〉――人狼じゃなかったわ"],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉、質問されると質問で返してるよね。〈〉の意見聞きたいんだけど"],
["本物の占い師は私だよ。〈〉は人狼でした","本物の占い師は私だよ。〈〉は人狼だったわ"],
["CO者には明日も結果を出してもらう。今日はそれ以外から","CO者には明日も結果出してもらうわ。今日はそれ以外からね"],
["私の考えを言う。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。俺は〈〉が怪しいと思う。","私的にはさ、〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えねー。私は〈〉が怪しいと思うわ。"],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉の発言、昨日と今日で逆になってんじゃん。〈〉、説明してくんね？"],
["明日の占い結果まで見据えて、今日は〈〉を吊る","明日の占い結果まで見据えて、今日は〈〉吊るわ"],
["偽物が出たね。私が本物。〈〉――人狼でした","偽物出たね！　本物は私！　〈〉――人狼だったよ！"],
["私の考えを言う。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。俺は〈〉が怪しいと思う。","私的にはさ、〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。私は〈〉が怪しいと思うんだよね。"],
["俺は〈〉を信じる。今日は二人で同じところに入れよう","私は〈〉を信じる。今日は二人で同じとこに入れよ"],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から言うと、平和な朝の前、〈〉が護衛先を探るようなこと言ってたんだわ。私の中じゃ、〈〉がガチで一番クロ。"],
["ちょっといい？〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。俺は〈〉が怪しいと思う。","ちょい、いい？〈〉は対抗が出た瞬間、どっちを信じるか即決したっしょ。根拠薄くね？　私は〈〉が怪しいと思うわ。"],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉、対抗が出てから急に結果言い出したっしょ。偽物だわ"],
["待って、狩人CO。私を吊ると護衛がいなくなる","待って、狩人CO。私吊ったら護衛いなくなるって"],
["全員が同じことを言い出したら、逆に怪しい。俺は〈〉を見てる","全員が同じこと言い出したら、逆に怪しくね？　私は〈〉を見てるわ"],
["真贋を見極めよう。俺は〈〉が偽物だと判断する","真贋、見極めよ。私は〈〉が偽物って判断するわ"],
["わ、私は村人だよ","わ、私は村人だって"],
["ちょっといい？〈〉は〈〉への疑いを、話題を変えて逸らした。俺は〈〉が怪しいと思う。","ちょい、いい？〈〉は〈〉への疑いを、話題変えて逸らしたっしょ。私は〈〉が怪しいと思うわ。"],
["次は、真っ先にお前を吊るからな","次は、真っ先にあんたを吊るからね！"],
["ちょっといい？〈〉は質問されると、質問で返してる。俺の中では、〈〉が一番黒い。","ちょい、いい？〈〉は質問されると、質問で返してるっしょ。私の中じゃ、〈〉が一番クロだわ。"],
["議論は出尽くした。決を採ろう。俺は〈〉","議論はもう出尽くしたっしょ。決、採ろ。私は〈〉"],
["占い師を吊るのは最後の手段。今日はグレーを詰める","占い師吊るのは最後の手段っしょ。今日はグレー詰めてこ"],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉と〈〉、お互い一度も疑ってなくね？　〈〉が白なら、それはそれで情報になるっしょ"],
["三日目のあの発言も、全部演技だったのか。……〈〉、次は本気で見抜くから","三日目のあの発言も、全部演技だったのかよ。……〈〉、次はガチで見抜くから"],
["結果を言う。〈〉、人間","結果言うわ。〈〉、人間"],
["迷ったら一番怪しいところ。〈〉だ","迷ったら一番怪しいとこっしょ。〈〉で"],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉、今日ずっと口数少なくね？　私の中じゃ、〈〉が一番クロだわ"],
["反対する理由がないので、〈〉で","反対する理由ないし、〈〉で"],
["全員、〈〉に入れてくれ。責任は俺が取る","全員、〈〉に入れて。責任は私が取るからさ"],
["確認なんだけど、〈〉は自分から話題を振らない。様子見にしても長すぎる。〈〉が白なら、それはそれで情報になる。","確認なんだけどさ、〈〉って自分から話題振らなくね？　様子見にしても長すぎっしょ。〈〉が白なら、それはそれで情報になるわけだし。"],
["占いロラで確実に一人は狼を処理できる。今日は〈〉から","占いロラで確実に一人は狼処理できるっしょ。今日は〈〉から"],
["推理の勝利だな","推理の勝利っしょ"],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","占い結果の筋見りゃ分かるって。〈〉の結果、不自然っしょ"],
["私の考えを言う。〈〉の推理、結論ありきで後から理由をつけてる感じがする。〈〉の意見を聞きたい。","私的にはさ、〈〉の推理、結論ありきで後から理由つけてる感じすんだよね。〈〉の意見、聞きたいんだけど。"],
["〈〉は投票の直前で票先を変えた。あれ、何を見て変えたの？〈〉が白なら、それはそれで情報になる。","〈〉、投票の直前で票先変えたよね。あれ、何見て変えたの？〈〉が白なら、それはそれで情報になるっしょ。"],
["真贋は判断できない。だから占い師から順に吊る","どっちが本物か分かんねーし、占い師から順に吊るわ"],
["平和な朝の前、〈〉は護衛先を探るようなことを言ってた。〈〉が白なら、それはそれで情報になる。","平和な朝の前、〈〉が護衛先探るようなこと言ってたんだよね。〈〉が白なら、それはそれで情報になるっしょ。"],
["最後まで信じた甲斐があった！","最後まで信じた甲斐あったわ！"],
["〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。俺の中では、〈〉が一番黒い。","〈〉、対抗出た瞬間にどっち信じるか即決したよね。根拠薄くね？私の中では、〈〉が一番クロだわ。"],
["ここで割れるのが一番まずい。〈〉に揃えよう","ここで割れるのが一番ヤバいって。〈〉に揃えよ！"],
["今のうちに言っておく。〈〉は笑ってるけど、目が笑ってない。俺は〈〉が怪しいと思う。","今のうちに言っとくけど、〈〉は笑ってるけど、目が笑ってねー。私は〈〉が怪しいと思うわ。"],
["みんな、聞いて。〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","みんな、ちょい聞いて。〈〉、今日ずっと口数少なくね？私の中では、〈〉が一番クロだわ。"],
["私の考えを言う。〈〉は笑ってるけど、目が笑ってない。〈〉の意見を聞きたい。","私の考え言うわ。〈〉、笑ってるけど目が笑ってねーんだよね。〈〉の意見聞きたいんだけど。"],
["順番に意見を言おう。最後に決を採る","順番に意見言ってこ！　最後に決とるね！"],
["〈〉の意見に賛成です。〈〉でいいと思う","〈〉の意見に賛成！　〈〉でいいと思うわ"],
["〈〉が怪しい。今日は〈〉だ","〈〉が怪しいわ。今日は〈〉っしょ"],
["整理させて。〈〉は笑ってるけど、目が笑ってない。〈〉の意見を聞きたい。","ちょい整理させて。〈〉って笑ってるけど、目が笑ってねーんだよね。〈〉の意見聞きたいんだけど。"],
["霊媒結果を言うね。〈〉は人狼でした","霊媒結果言うね。〈〉は人狼だったわ"],
["結果を言う。〈〉、人狼","結果言うわ。〈〉、人狼"],
["はい！　〈〉が人狼だと思います！","はい！　〈〉が人狼だと思うっす！"],
["霊媒結果。〈〉――人狼でした","霊媒結果。〈〉――人狼だったわ"],
["状況が変わった。今日は〈〉だ","状況変わったわ。今日は〈〉っしょ"],
["ピンと来た。〈〉だ","ピンと来たわ。〈〉っしょ"],
["役職を吊るのはもったいない。今日はグレーの","役職吊るのはもったいないっしょ。今日はグレーの"],
["よし、整理する。候補は〈〉と〈〉。今日は〈〉だ","よし、整理するわ。候補は〈〉と〈〉。今日は〈〉っしょ"],
["両方の発言を比べた。偽物は〈〉だと思う","両方の発言比べてみたわ。偽物は〈〉じゃね？"],
["出るね。占い師。〈〉――人狼でした","出るわ。占い師。〈〉――人狼だったって"],
["異論は？　……ないな。〈〉だ","異論ある？　……ないね。〈〉だ！"],
["庇う理由がない。〈〉に入れる","庇う理由ねーわ。〈〉に入れる"],
["みんな、聞いて。〈〉は「誰でもいい」って言ったのに、急に一人に絞った。理由が見えない。俺の中では、〈〉が一番黒い。","みんな、ちょい聞いて。〈〉は「誰でもいい」って言ったのに、急に一人に絞ったっしょ。理由が見えねーんだわ。私の中では、〈〉が一番クロかな。"],
["私の考えを言う。〈〉は自分が疑われたときより、〈〉が疑われたときのほうが焦ってた。俺の中では、〈〉が一番黒い。","私的にはさ、〈〉って自分が疑われたときより、〈〉が疑われたときのほうが焦ってたんだよね。私の中では、〈〉が一番クロかな。"],
["確認なんだけど、〈〉は自分から話題を振らない。様子見にしても長すぎる。俺の中では、〈〉が一番黒い。","確認なんだけどさ、〈〉って自分から話題振らなくね？　様子見にしても長すぎっしょ。私の中では、〈〉が一番クロだわ。"],
["ちょっといい？〈〉は笑ってるけど、目が笑ってない。俺の中では、〈〉が一番黒い。","ちょい、いい？〈〉、笑ってるけど目が笑ってねーんだよね。私の中では、〈〉が一番クロだわ。"],
["〈〉、さっきから全員の顔色をうかがってる。俺の中では、〈〉が一番黒い。","〈〉、さっきから全員の顔色うかがってんじゃん。私の中では、〈〉が一番クロだわ。"],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉は違うと思うわ。むしろ〈〉が怪しいっしょ",1],
["〈〉が噛まれるのは分かってたし……あ、いや、予想してたって意味","〈〉が噛まれるのは分かってたし……あ、いや、予想してたって意味ね",1]]});
HK.Load.toneData("mystic",{"F":[
["ちょっといい？〈〉の投票先、毎回いちばん安全なところを選んでる気がする。〈〉が白なら、それはそれで情報になる。","ねえ、ちょっといいかい？　〈〉の投票先、いつもいちばん安全なところなんだ。〈〉が白なら……それはそれで、面白い手がかりだね。",1],
["今のうちに言っておく。〈〉、〈〉が疑われたときだけ、やけに庇うよね。〈〉が白なら、それはそれで情報になる。","今のうちに言っておくよ。〈〉、〈〉が疑われたときだけ、やけに庇うよね。〈〉が白なら……それはそれで情報なんだ。",1],
["言いにくいけど、言うね。昨日の投票、〈〉だけが流れと違うところに入れてる。〈〉の意見を聞きたい。","言いにくいけど、言うね。昨日の投票、〈〉だけが流れと違うところに入れているんだ。〈〉の意見、聞かせてくれるかい？",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","整理させておくれよ。〈〉は対抗が出た瞬間、どっちを信じるか即決したんだ。根拠が薄い。〈〉の意見を聞かせてくれるかい？",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉と〈〉、お互いに一度も疑っていないんだ。〈〉が白なら……それはそれで情報だね。",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉の発言、昨日と今日で逆だよ。〈〉、説明してくれるかい？",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙っているつもりだったけど、言うね。私は占い師だよ。〈〉は人狼じゃなかったよ",1],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","少なくとも〈〉は村だと思っているんだ。だから〈〉の意見を軸にするよ",1],
["全員が同じことを言い出したら、逆に怪しい。俺は〈〉を見てる","全員が同じことを言い出したら、逆に怪しいんだ。私は〈〉を見ているよ",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉はね、質問されると質問で返しているんだ。〈〉の意見、聞かせてくれるかい？",1],
["霊媒結果と照らし合わせれば、〈〉の結果だけ噛み合わない","霊媒結果と照らし合わせるとね、〈〉の結果だけ噛み合わないんだ",1],
["むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ","むしろ怪しいのは〈〉のほうだと思うんだ。理由も言えるよ",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙っているつもりだったけど、言うね。私は占い師だよ。〈〉は人狼だったよ",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","占い結果の筋を見れば分かるんだ。〈〉の結果は不自然だよ",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉は対抗が出てから急に結果を言い出したんだ。偽物だね",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉、今日はずっと口数が少ないんだ。〈〉、説明してくれるかい？",1],
["自分では決められないので、今日は流れに乗ります","自分では決められないんだ。だから今日は、流れに乗るよ",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","みんな、今日の投票先を一人ずつ言っておくれよ。最後にまとめるんだ",1],
["みんな、いい村だったよ。私たちのほうが上手だったけど","みんな、いい村だったよ。私たちのほうが上手だったけどね",1],
["理由はないけど、〈〉だけは信用できない気がする","理由はないけどね、〈〉だけは信用できない気がするんだ",1],
["真贋は判断できない。だから占い師から順に吊る","真贋は判断できないんだ。だから占い師から順に吊ろうか",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒なら、全部説明がつくんだ。私は〈〉に入れるよ",1],
["私が村人であることは、明日の結果が証明する","私が村人だってことは、明日の結果が証明してくれるんだ",1],
["つまり〈〉が怪しい、のは……さっき否定したんだった","つまり〈〉が怪しい、のは……さっき否定したんだったっけ",1],
["明日に情報を残すためにも、今日は〈〉を吊る","明日に情報を残すためにも、今日は〈〉を吊ろうか",1],
["村のために言うけど、〈〉の動き、ずっとおかしい","村のために言うけどね、〈〉の動き、ずっとおかしいんだ",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","ちょっと、〈〉！　最後まで白いって言っていたじゃないか！",1],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉は違うと思うんだ。むしろ〈〉が怪しいよ",1],
["私を吊って、明日後悔しても知らないよ","私を吊って、明日後悔しても知らないんだ",1],
["次は霊媒結果を見て、推理を組み直せ","次は霊媒結果を見て、推理を組み直すんだ",1],
["私が狼なら、今ここで〈〉を庇ってる","私が狼なら、今ここで〈〉を庇っているんだ",1],
["根拠が薄いのは〈〉のほうだよ","根拠が薄いのは〈〉のほうだよ",1],
["わ、私じゃない……と、思う……いや、違う！","わ、私じゃない……と、思う……いや、違うよ！",1],
["次は、真っ先にお前を吊るからな","次は、真っ先に君を吊るんだ。ふふ",1],
["騙すの、正直ちょっとつらかった","騙すの、正直ちょっとつらかったんだ",1],
["感情論だな。データで来い","気持ちの話だね。証拠を持っておいでよ",1],
["〈〉の意見に賛成です。〈〉でいいと思う","〈〉の意見に賛成だ。〈〉でいいと思うよ",1],
["偽物が出たね。私が本物。〈〉――人狼でした","偽物が出たね。本物は私なんだ。〈〉――人狼だったよ",1],
["出るね。占い師。〈〉――人狼でした","出るよ。占い師なんだ。〈〉――人狼だった",1],
["本物の占い師は私。〈〉は人狼でした","本物の占い師は私だよ。〈〉は人狼だったよ",1],
["私は村人。断言する","私は村人なんだ。断言するよ",1],
["待って、占い師は私。〈〉は人狼でした","待って、占い師は私だ。〈〉は人狼だった",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から言うとね、平和な朝の前、〈〉は護衛先を探るようなことを言っていたんだ。私の中では、〈〉が一番黒いよ。",1],
["ちょっといい？〈〉の発言、昨日と今日で言ってることが逆になってる。俺の中では、〈〉が一番黒い。","ちょっといいかい？　〈〉の発言、昨日と今日で逆なんだ。私の中では、〈〉が一番黒いよ。",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉、今日はずっと口数が少ないんだ。私の中では、〈〉が一番黒いよ。",1],
["村目線で言わせてもらうと、〈〉の動きが一番狼っぽい","村の目線で言わせてもらうとね、〈〉の動きが一番狼っぽいんだ",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","ここで割れるのが一番まずいんだ。〈〉に揃えようよ",1],
["〈〉って、狼のときもこんな感じだったよね？","〈〉ってさ、狼のときもこんな感じだったよね？",1],
["人狼なら、もっとうまく隠れる","人狼なら、もっとうまく隠れるものだよ",1],
["負けたが、推理は楽しかった","負けはしたけれど、推理は楽しかったよ",1]]});
HK.Load.toneData("genki",{"F":[
["いやあ、騙された騙された","いやあ、すっかり騙されちゃいました！"],
["どうか、もう一度ご検討を","お願いします、もう一回考え直してください"],
["どうか、皆さまで真実にたどり着いてください","みなさん、絶対に真実にたどり着いてくださいね！"],
["冷静にご判断いただければ、分かっていただけるかと","冷静に考えてもらえれば、わかってもらえると思います"],
["皆さまのご武運をお祈りしております","みなさん、がんばってくださいね！　応援してます！"],
["皆さまの慧眼に敬服いたします","みなさん、すごいです！　お見事でした！"],
["順番に意見を言おう。最後に決を採る","順番に意見を言いましょう！　最後に決を採ります！"],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙ってるつもりでしたけど、言っちゃいます！　私、占い師です。〈〉さんは人狼じゃなかったですよ！",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から言いますね！　平和な朝の前、〈〉さんは護衛先を探るようなこと言ってました。私の中では、〈〉さんがいちばん怪しいです！",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","ちょっと整理させてください！　〈〉さんは対抗が出た瞬間、どっちを信じるか即決しましたよね。根拠が薄いです。〈〉さんの意見、聞きたいです！",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙ってるつもりでしたけど、言っちゃいます！　私、占い師です。〈〉さんは……人狼でした！",1],
["自分では決められないので、今日は流れに乗ります","自分じゃ決められないので、今日は流れに乗っちゃいます！",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉さんと〈〉さん、お互いに一回も疑ってないですよね。〈〉さんが白なら、それはそれで情報になります！",1],
["わ、私じゃない……と、思う……いや、違う！","わ、私じゃない……と、思います……いや、違いますってば！",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉さんの発言、昨日と今日で言ってることが逆になってますよ！　〈〉さん、説明してください！",1],
["大変失礼いたしました。人狼でございました","ごめんなさい！　人狼、私でした！",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","〈〉さん！　最後まで白だって言ってたじゃないですか！",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉さんが黒なら、ぜんぶ説明がつきます！　私は〈〉さんに入れまーす！",1],
["短い間でしたが、ありがとうございました","短い間でしたけど、ありがとうございました！",1],
["誠に心外でございます。私は村人です","えー、心外です！　私、村人ですよ！",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉さん、今日はずっと口数が少ないですね？　私の中では、〈〉さんがいちばん怪しいです！",1],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉さんは違うと思います！　むしろ〈〉さんのほうが怪しいです",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉さん、質問されると質問で返してますよね？　〈〉さんの意見、聞きたいです！",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉さん、今日はずっと口数が少ないですね？　〈〉さん、説明してください！",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","みなさん、今日の投票先を一人ずつ言ってくださーい！　最後に私がまとめます！",1],
["待って、さっきと言ってること逆だ","待ってください、さっきと言ってること逆ですよ！",1],
["〈〉吊ろう！　外れたら謝る！","〈〉さんを吊りましょう！　外れたら謝ります！",1],
["くっそー！　あと一手だったのに！","くやしいですー！　あと一手だったのに！",1],
["〈〉、正直に言いなよ。狼でしょ？","〈〉さん、正直に言ってください。狼ですよね？",1],
["偽物が出たね。私が本物。〈〉――人狼ではありませんでした","偽物が出ましたね！　本物は私です。〈〉さんは――人狼じゃなかったです！",1],
["悪いけど、空気には合わせない。〈〉が怪しい","ごめんなさい、空気には合わせません！　〈〉さんが怪しいです",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉さんは対抗が出てから、急に結果を言い出しました。偽物です！",1],
["自信ないけど、みんなと同じで〈〉に","自信ないですけど、みんなと同じで〈〉さんに！",1],
["ご指摘はもっともですが、誤解です","ご指摘はもっともですけど、誤解です！",1],
["ご納得いただけるまで、ご説明いたします","納得してもらえるまで、説明します！",1]]});
HK.Load.toneData("darui",{"F":[
["もう一戦やる？","……もう一戦やる？"],
["私が狼なら、今ここで〈〉を庇ってる","……私が狼なら……今ここで〈〉を庇ってる"],
["私は明日も生きて、〈〉の黒を証明する","……明日も生きて、〈〉の黒、証明する",1],
["私を信じて。後悔はさせない","……私を信じて。……後悔はさせない"],
["私を吊って、明日後悔しても知らないよ","……私を吊って、明日後悔しても知らない……"],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","……黙ってるつもりだったけど……言う。……占い師。……〈〉は人狼じゃなかった"],
["〈〉、さっきから喋らなさすぎじゃない？","……〈〉、さっきから静かすぎ",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","……〈〉、今日ずっと静か。……〈〉、説明して",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","……〈〉、今日ずっと静か。……一番黒いの、〈〉",1],
["〈〉が言うなら、たぶんそうなんだろうな……","……〈〉が言うなら……そうなんでしょ",1],
["〈〉って、狼のときもこんな感じだったよね？","……〈〉、狼のときもこんなだったよね",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","……〈〉と〈〉、お互い疑ってない。……〈〉が白でも、情報にはなる",1],
["〈〉の意見に賛成です。〈〉でいいと思う","……〈〉に賛成。……〈〉で",1],
["〈〉の推理、穴だらけだよ。指摘しようか？","……〈〉の推理、穴だらけ。……言っていい？",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","……〈〉の発言、昨日と今日で逆。……〈〉、説明して",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","……〈〉、対抗が出てから急に言い出した。……偽物",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","……〈〉、質問に質問で返してる。……〈〉はどう思う",1],
["あーあ、もっと遊びたかった！　またね！","……あーあ。……もっと遊びたかった。……また",1],
["えー、ここで退場!?　まあいっか、応援してるね！","……え。……ここで退場。……まあいっか。……応援、してる",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","……〈〉。……最後まで白いって、言ってたでしょ",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","……ここで割れると、まずい。……〈〉に揃えよ",1],
["みんな、いい村だったよ。私たちのほうが上手だったけど","……みんな、いい村だった。……私たちのほうが、上手だったけど",1],
["むしろ怪しいのは〈〉のほうだと思う。理由も言えるよ","……むしろ怪しいの、〈〉のほう。……理由も、ある",1],
["やられたー！　いや、今回は完全に〈〉の勝ちだ！","……やられた。……今回は〈〉の勝ち",1],
["人狼がこんなに堂々としてると思う？","……人狼が、こんな堂々としてると思う？",1],
["人狼だったら、もっとうまく隠れるって","……人狼なら、もっとうまく隠れる",1],
["偽物が出たね。私が本物。〈〉――人狼でした","……偽物、出た。……本物は私。……〈〉――人狼",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","……全員、投票先、一人ずつ。……最後にまとめる",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","……占い結果の筋、見ればわかる。……〈〉の結果、不自然",1],
["多数派に乗るのが一番危ないんだよ。今日は〈〉に入れる","……多数派に乗るのが、一番あぶない。……今日は〈〉",1],
["少なくとも〈〉は村だと思ってる。だから〈〉の意見を軸にする","……〈〉は村だと思う。……だから〈〉の意見、軸に",1],
["待って、さっきと言ってること逆だ","……待って。……さっきと逆",1],
["待って、占い師は私。〈〉は人狼でした","……待って。……占い師、私。……〈〉、人狼",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","……整理。……〈〉、対抗が出た瞬間に即決した。……根拠、薄い。……〈〉はどう思う",1],
["明日に情報を残すためにも、今日は〈〉を吊る","……明日に情報残すなら、今日は〈〉",1],
["本物の占い師は私。〈〉は人狼でした","……本物の占い師、私。……〈〉、人狼",1],
["村目線で言わせてもらうと、〈〉の動きが一番狼っぽい","……村目線だと、〈〉が一番狼っぽい。……知らんけど",1],
["次は、真っ先にお前を吊るからな","……次は、あんたから吊る",1],
["真贋は判断できない。だから占い師から順に吊る","……どっちが本物か、わかんない。……占い師から順に吊る",1],
["私が村人であることは、明日の結果が証明する","……私が村人なのは、明日わかる",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","……結論。……平和な朝の前、〈〉が護衛先を探ってた。……〈〉が一番黒い",1],
["自信ないけど、みんなと同じで〈〉に","……自信ない。……みんなと同じで、〈〉",1],
["自分では決められないので、今日は流れに乗ります","……自分じゃ決められないし。……今日は流れに乗る。……らくだし",1],
["順番に意見を言おう。最後に決を採る","……順番に意見言って。……最後に決める",1],
["騙すの、正直ちょっとつらかった","……騙すの、正直ちょっと、しんどかった",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","……黙ってるつもりだったけど。……占い師。……〈〉は人狼だった",1],
["反対する理由がないので、〈〉で","……反対する理由、ないし。……〈〉で",1],
["信じなくていいわよ、どうせ後悔するんだから","……信じなくていい。……どうせ後悔するし",1],
["え？　あ、うん、そう、そうだよね","……え？……あ、うん。……そう、かも",1],
["疑うなら、どうぞ。何も出てこないから","……疑うなら、どうぞ。……なにも出てこないし",1],
["ごめんね、みんな……仲間を、頼んだよ","……ごめんね、みんな……仲間、頼んだよ",1],
["私の考えを言う。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。俺は〈〉が怪しいと思う。","……私の考え。〈〉は対抗が出た瞬間、どっちを信じるか即決した。……根拠が薄い。私は〈〉が怪しいと思う。",1]],
"S":[
"……そういう言い方するから疑われるんだよ"]});
HK.Load.toneData("sondai",{"F":[
["ちょっといい？〈〉の投票先、毎回いちばん安全なところを選んでる気がする。〈〉が白なら、それはそれで情報になる。","少しいいかね。〈〉の投票先は、毎回いちばん安全なところばかりだ。〈〉が白だというなら、それもまた情報というものだよ。",1],
["今のうちに言っておく。〈〉、〈〉が疑われたときだけ、やけに庇うよね。〈〉が白なら、それはそれで情報になる。","今のうちに言っておこうか。〈〉は、〈〉が疑われたときだけ、妙に庇い立てする。〈〉が白なら、それもまた情報というものだがね。",1],
["言いにくいけど、言うね。昨日の投票、〈〉だけが流れと違うところに入れてる。〈〉の意見を聞きたい。","言いにくいことだがね、言わせてもらおう。昨日の投票、〈〉だけが流れと違うところに入れている。〈〉、弁明を聞かせたまえ。",1],
["整理させて。〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。〈〉の意見を聞きたい。","整理させてもらおう。〈〉は対抗が出た瞬間、どちらを信じるか即決した。根拠が薄い。〈〉、言い分を聞かせたまえ。",1],
["〈〉と〈〉、お互いに一度も疑ってない。〈〉が白なら、それはそれで情報になる。","〈〉と〈〉、お互いに一度も疑っていないではないか。〈〉が白なら、それもまた情報というものだがね。",1],
["〈〉の発言、昨日と今日で言ってることが逆になってる。〈〉、説明してほしい。","〈〉の発言、昨日と今日で逆ではないかね。〈〉、説明したまえ。",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼ではありませんでした","黙っているつもりだったがね、言わせてもらおう。私は占い師だ。〈〉は人狼ではなかったのだよ",1],
["〈〉は質問されると、質問で返してる。〈〉の意見を聞きたい。","〈〉は問われるたびに、問いで返してばかりではないかね。〈〉、意見を聞かせたまえ。",1],
["霊媒結果と照らし合わせれば、〈〉の結果だけ噛み合わない","霊媒結果と照らし合わせれば、〈〉の結果だけが噛み合わんのだよ",1],
["感情で吊るのはやめよう。私の投票先を確認してほしい","感情で吊るのはやめたまえ。私の投票先を確かめればよいのだよ",1],
["黙ってるつもりだったけど、言う。占い師。〈〉は人狼でした","黙っているつもりだったがね、言わせてもらおう。私は占い師だ。〈〉は人狼だったのだよ",1],
["占い結果の筋を見れば分かる。〈〉の結果は不自然だ","占い結果の筋を見れば分かるだろう。〈〉の結果は不自然なのだよ",1],
["〈〉は対抗が出てから急に結果を言い出した。偽物だ","〈〉は対抗が出てから急に結果を言い出したではないか。偽物だよ",1],
["〈〉、今日はずっと口数が少ない。〈〉、説明してほしい。","〈〉、今日はずっと口数が少ないではないか。〈〉、説明したまえ。",1],
["自分では決められないので、今日は流れに乗ります","自分で決めるほどの材料がないのでね。今日は流れに乗ろうではないか",1],
["全員、今日の投票先を一人ずつ言って。最後にまとめる","諸君、今日の投票先を一人ずつ言いたまえ。最後に私がまとめよう",1],
["みんな、いい村だったよ。私たちのほうが上手だったけど","諸君、いい村だったよ。私たちのほうが一枚上手だったがね",1],
["理由はないけど、〈〉だけは信用できない気がする","理由などないがね、〈〉だけは信用ならんのだよ",1],
["真贋は判断できない。だから占い師から順に吊る","真贋など判断できんよ。ならば占い師から順に吊ればよいのだ",1],
["〈〉が黒なら全部説明がつく。私は〈〉に入れる","〈〉が黒なら、すべて説明がつくではないか。私は〈〉に入れよう",1],
["疑われる理由は理解した。だが、結論が早すぎる","疑われる理由は理解したとも。だが、結論が早すぎるのではないかね",1],
["つまり〈〉が怪しい、のは……さっき否定したんだった","つまり〈〉が怪しい、のは……ふむ、さっき否定したのだったか",1],
["明日に情報を残すためにも、今日は〈〉を吊る","明日に情報を残すためにも、今日は〈〉を吊ろうではないか",1],
["村のために言うけど、〈〉の動き、ずっとおかしい","村のために言わせてもらうがね。〈〉の動きは、ずっとおかしいのだよ",1],
["おい、〈〉！　最後まで白いって言ってただろうが！","何なんだこれは！　〈〉、最後まで白いと言っていたではないかね！",1],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉は違うだろう。むしろ〈〉の方が怪しいのではないかね",1],
["私の分まで、正しく推理してくれ","私の分まで、正しく推理してみせたまえ",1],
["わ、私じゃない……と、思う……いや、違う！","わ、私ではない……と、思うのだが……いや、違う！",1],
["次は、真っ先にお前を吊るからな","次は真っ先にお前を吊ってやろう。覚悟したまえ",1],
["騙すの、正直ちょっとつらかった","騙すのは、正直ちょっとこたえたのだよ",1],
["〈〉の推理、納得できた。〈〉で","〈〉の推理には納得したよ。〈〉にしよう",1],
["仲間の健闘を祈る","仲間の健闘を祈っているよ",1],
["今日の占い結果。〈〉は人間","今日の占い結果だ。〈〉は人間だよ",1],
["私の考えを言う。〈〉の推理、結論ありきで後から理由をつけてる感じがする。俺の中では、〈〉が一番黒い。","私の考えを言おう。〈〉の推理は、結論ありきで後から理由をこしらえている。私の見立てでは、〈〉が一番黒いのだよ。",1],
["判断を誤ったな。だが、責めはしない","判断を誤ったな。だが、責めはせんよ",1],
["まあ、楽しかったからいいや","まあ、楽しかったから良しとしようではないか",1],
["人狼がこんなに堂々としてると思う？","人狼が、これほど堂々としていると思うかね？",1],
["負けたけど、推理は楽しかった","負けはしたがね、推理は楽しかったよ",1],
["私の発言、全部見返してみて","私の発言を、全部見返してみたまえ",1],
["完敗だ。よく見抜いた","完敗だよ。よく見抜いたね",1],
["いいゲームだった。次も呼んでね","いいゲームだったよ。次も呼びたまえ",1],
["……みんなに合わせます","……皆に合わせよう",1],
["〈〉を吊るのは早すぎる。情報が足りない","〈〉を吊るのは早すぎるね。情報が足りない",1],
["〈〉は霊媒結果を聞いても、表情ひとつ変えなかった。〈〉が白なら、それはそれで情報になる。","〈〉は霊媒結果を聞いても、表情ひとつ変えなかったね。〈〉が白だというなら、それもまた情報というものだよ。",1],
["〈〉が噛まれるのは分かってたし……あ、いや、予想してたって意味","〈〉が噛まれるのは分かっていたのだよ……おっと、いや、予想していたという意味だ",1],
["対抗します。占い師は私。〈〉は人狼でした","対抗しよう。占い師は私だ。〈〉は人狼だったよ",1],
["結果を言う。〈〉、人狼","結果を言おう。〈〉は、人狼だ",1],
["自信ないけど、みんなと同じで〈〉に","自信はないのだがね、皆と同じく〈〉に入れよう",1],
["完璧な村だった！","完璧な村だったね！",1],
["ひとつ引っかかってる。〈〉の投票先、毎回いちばん安全なところを選んでる気がする。〈〉の意見を聞きたい。","ひとつ気になることがあるのだがね。〈〉の投票先は、毎回いちばん安全なところばかりだ。〈〉の意見を聞かせたまえ。",1],
["信じてよかった……","信じてよかったよ……",1],
["待って、占い師は私。〈〉は人狼でした","待ちたまえ、占い師は私だ。〈〉は人狼だったよ",1],
["結論から言うと、平和な朝の前、〈〉は護衛先を探るようなことを言ってた。俺の中では、〈〉が一番黒い。","結論から言おう。平和な朝の前、〈〉は護衛先を探るようなことを言っていた。私の見立てでは、〈〉が一番黒い。",1],
["ちょっといい？〈〉の発言、昨日と今日で言ってることが逆になってる。俺の中では、〈〉が一番黒い。","少しいいかね。〈〉の発言、昨日と今日で逆になっている。私の見立てでは、〈〉が一番黒いのだよ。",1],
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉、今日はずっと口数が少ないではないか。私の見立てでは、〈〉が一番黒いのだよ。",1],
["ここで割れるのが一番まずい。〈〉に揃えよう","ここで割れるのが一番まずいのだよ。〈〉に揃えたまえ",1],
["……なんか、〈〉の方が気になる","……どうも、〈〉の方が気になるね",1],
["〈〉、今日はずっと口数が少ない。〈〉の意見を聞きたい。","〈〉は、今日はずっと口数が少ないね。〈〉の意見を聞かせたまえ。",1],
["〈〉は対抗が出た瞬間、どっちを信じるか即決した。根拠が薄い。俺の中では、〈〉が一番黒い。","〈〉は対抗が出た瞬間、どちらを信じるか即決した。根拠が薄い。私の見立てでは、〈〉が一番黒いのだよ。",1],
["霊媒結果。〈〉――人狼でした","霊媒の結果だ。〈〉――人狼であった",1]]});
HK.Load.toneData("boku_n",{"F":[
["〈〉、今日はずっと口数が少ない。俺の中では、〈〉が一番黒い。","〈〉、今日はずっと口数が少ないよね。……私の中では、〈〉が一番黒いかな。",1]]});
HK.Load.toneData("god",{"F":[
["むしろ怪しいのは〈〉のほうだと思う。理由も言える","むしろ怪しいのは〈〉のほうである。理由も示せるぞ",1],
["〈〉、さっきから喋らなさすぎではないか？","〈〉よ、先ほどから口数が少なすぎるのではないか？",1],
["〈〉は違うと思う。むしろ〈〉が怪しい","〈〉は違うと見る。むしろ〈〉が怪しい",1],
["悪いが、空気には合わせない。〈〉が怪しい","悪いが、空気には合わせぬ。〈〉が怪しい",1],
["〈〉が噛まれるのは分かっていた……あ、いや、予想していたという意味だ","〈〉が噛まれるのは分かっていた……む、いや、予想していたという意味である",1],
["すまない！　ゲームだから、ゲームだから！","すまぬ。これは遊戯ゆえ、遊戯ゆえ……",1]]});
HK.Load.toneData("keigo_sarc",{"F":[
["〈〉の意見に賛成です。〈〉でいいと思います","〈〉の意見に賛成です。〈〉でいいでしょう",1]]});
HK.Load.toneData("keigo_bossy",{"F":[
["待ってください、さっきと言っていることが逆です","お待ちなさい。さっきと言っていることが逆です",1]]});
HK.Load.toneData("keigo_flat",{"F":[
["なんだか、雰囲気が人狼っぽいです！","……雰囲気が、人狼に近いです。根拠は薄いですが",1],
["自分では決められないので、今日は流れに乗ります","判断材料が足りません。今日は、流れに乗ります",1]]});
HK.Load.toneData("ronkyaku",{"F":[
["むしろ怪しいのは〈〉のほうだと思う。理由も言える","むしろ怪しいのは〈〉のほうだ。理由も示せるのだよ",1]]});
});
HK.Load.done('scen-jinro', '04c0c970c3', 1);
