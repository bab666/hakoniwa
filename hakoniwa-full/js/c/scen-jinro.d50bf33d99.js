;
/* ==== js/scenario-jinro.js ==== */
HK.Load.def(338,'js/scenario-jinro.js',function(){
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
HK.Load.def(339,'js/jinro-love.js',function(){
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
HK.Load.def(428,'js/jinro-data.js',function(){
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
HK.Load.def(429,'js/jinro-after.js',function(){
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
HK.Load.def(430,'js/jinro-wolfnight.js',function(){
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
var cl=close(c.input,w,v),love=cl>=0.45&&HK.canLove&&HK.canLove(w,v)&&HK.canLove(v,w);
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
var take=KB.canTake(z)&&St.pairSex(x,z)&& !(HK.sexBlocked&&HK.sexBlocked(x,z))&&Pz.order(x,z,[x,z])[0]===x&& !Pz.hardTop(z,x)&& !COLD[tieOf(c.input,x,z)]&& !(HK.NoGen&&HK.NoGen.on(x,z));
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
HK.Load.done('scen-jinro', 'd50bf33d99', 1);
