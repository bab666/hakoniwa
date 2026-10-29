;
/* ==== js/rel-at.js ==== */
HK.Load.def(11,'js/rel-at.js',function(){
(function(){
'use strict';
var HK=window.HK=window.HK||{};
if(HK.atScen)return;
HK.atScen=function(id,fn){
var done=false;
function go(){
if(done)return;
var s=HK.SCENARIOS&&HK.SCENARIOS[id];
if(!s||s.stub)return;
done=true;
fn(s);
}
go();
if(!done&&HK.Load&&HK.Load.onChunk)HK.Load.onChunk(go);
};
var pend={};
HK.atEvent=function(scen,evId,fn){
if(!scen|| !scen.events)return;
var ev=scen.events.filter(function(e){return e&&e.id===evId;})[0];
if(ev){fn(ev);return;}
var k=(scen.id||'')+'/'+evId;
(pend[k]=pend[k]||[]).push(fn);
};
HK.eventAdded=function(scen,ev){
var k=(scen&&scen.id||'')+'/'+(ev&&ev.id),l=pend[k];
if(!l)return;
delete pend[k];
l.forEach(function(fn){fn(ev);});
};
})();
});
;
/* ==== js/tie-new.js ==== */
HK.Load.def(12,'js/tie-new.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK|| !HK.COMMON)return;
function L(s){return s.split('|');}
var PK=['proud','stern','tsun','gentle','devoted','cool','free','shy','polite'];
function per(c){var k=c&&(c.persona||(HK.personaOf&&HK.personaOf(c)))||'gentle';return PK.indexOf(k)>=0?k:'gentle';}
function P9(o){var r={};PK.forEach(function(k){r[k]=L(o[k]||o.gentle);});return r;}
function here(c){return!!c&&(HK.State?HK.State.here(c):c.alive!==false)&& !(c.flags&&c.flags.caged!=null);}
function fill(s,a,b,c){return String(s||'').replace(/\{a\}/g,a.name).replace(/\{b\}/g,b.name).replace(/\{c\}/g,c?c.name:'');}
function both(a,b){return!!(HK.canLove&&HK.canLove(a,b)&&HK.canLove(b,a));}
function T(){return HK.Ties;}
function from(ctx,a,b,ty){return T()&&T().from?T().from(ctx,a,b,ty):null;}
function has(ctx,a,b,ty){return T()&&T().has?T().has(ctx,a,b,ty):null;}
function dir(ctx,a,b,ty,ok){
var t=from(ctx,a,b,ty);if(t&&(!ok||ok(t)))return{A:a,B:b,t:t};
t=from(ctx,b,a,ty);if(t&&(!ok||ok(t)))return{A:b,B:a,t:t};
return null;
}
function thirds(ctx,a,b,fn){return(ctx.others?ctx.others(a):[]).filter(function(c){return c!==a&&c!==b&&here(c)&&(!fn||fn(c));});}
function gapWhy(ctx,a,b){var w=HK.Gap?HK.Gap.why(ctx,a,b):'';return w?'（'+w+'）':'';}
function gapK(ctx,a,b){return HK.Gap?HK.Gap.k(ctx,a,b):1;}
function okSexLove(a,b){if(!HK.Pos)return true;var x={},y={},k;for(k in a)x[k]=a[k];for(k in b)y[k]=b[k];x.noR18=false;y.noR18=false;return HK.Pos.okSex(x,y);}
function deadly(ctx){return!HK.SAFE_ON&& !!(ctx&&ctx.scen&& /^(br|zombie|island)$/.test(ctx.scen.id));}
var TN=HK.TieNew={P9:P9,per:per};
function push(ev){ev.scope='pair';ev.noOdd=true;HK.addTo(HK.COMMON,ev);}
function add(o){
push({
id:o.id,label:o.label,cat:o.cat,
when:function(ctx,a,b){return!!(b&&here(a)&&here(b)&&o.roles(ctx,a,b));},
w:function(ctx,a,b){var r=o.roles(ctx,a,b);return r?(typeof o.w==='function'?o.w(ctx,r):o.w||1):0;},
run:function(ctx,a,b){var r=o.roles(ctx,a,b);return r?o.run(ctx,r):null;}
});
}
function pk(ctx,l){return ctx.pick(l);}
function apR(ctx,a,b){return T()&&T().apathy&&T().apathy(ctx,b,a)&& !T().apathy(ctx,a,b)?{K:a,A:b}:null;}
var AP={
talk:L('{a}は{b}に話しかけた。今日あったこと、困っていること、少しだけ嬉しかったこと。|{a}は{b}の隣に腰を下ろし、「ねえ」と声をかけた。|{a}は{b}に、さっき見つけたものを見せようと駆け寄った。'),
talkRe:P9({
proud:'{b}「……で？」――{b}はそれだけ言って、{a}の顔も見なかった。',stern:'{b}は「そうか」とだけ答え、手元の作業から目を上げなかった。',
tsun:'{b}「ふーん。それ、私に関係ある？」――{b}は本当に、何の興味もなさそうだった。',gentle:'{b}は穏やかに相槌を打ったが、その目は{a}を通り越して、どこか遠くを見ていた。',
devoted:'{b}は丁寧に頷いた。けれど、{a}の名前を一度も呼ばなかった。{b}の心は、最初からほかの場所にあった。',cool:'{b}「そう」――{b}の返事は短く、温度がなかった。{a}の話は、{b}の中のどこにも引っかからなかった。',
free:'{b}は「へー」と言って、すぐに別のことを始めた。{a}の話がどこで終わったのか、{b}は気にもしなかった。',shy:'{b}は小さく会釈しただけで、何も言わなかった。照れているのではなく、ただ関心がなかった。',
polite:'{b}「さようでございますか」――礼儀正しい言葉の裏に、{a}への関心はひとかけらもなかった。'
}),
gift:L('{a}は{b}の分の食事を取り分けて、そっと手元に置いた。|{a}は{b}が困っていそうなのを見て、黙って手を貸した。|{a}は{b}の好きそうなものを見つけて、わざわざ届けに来た。'),
giftRe:P9({
proud:'{b}は「ああ」とだけ言って受け取り、礼も言わずに背を向けた。',stern:'{b}は「必要ない」と短く返した。{a}の手は、行き場をなくして宙に浮いた。',
tsun:'{b}「頼んでないけど」――受け取りはしたが、{b}はそれを見もしなかった。',gentle:'{b}は「ありがとう」と微笑んだ。ほかの誰に向けるのとも同じ、形だけの微笑みだった。',
devoted:'{b}は礼儀正しく礼を言った。けれど、それが{a}からのものだということは、すぐに忘れてしまった。',cool:'{b}は受け取ったものを脇に置き、そのまま触れなかった。{b}にとっては、どうでもいいことだった。',
free:'{b}は「お、どーも」と軽く受け取り、すぐにほかの用事に気を取られた。',shy:'{b}は小さく頭を下げただけだった。{a}が何をしてくれたのか、{b}は気に留めていなかった。',
polite:'{b}「お気遣いなく」――丁寧な一言で、{b}は{a}の好意を静かに脇へ退けた。'
}),
other:L('{a}が話しかけている最中に、{b}は{c}のほうを振り向いて、まったく別の話を始めた。|{a}が{b}を呼んだが、{b}は{c}との話を続けたまま、振り返りもしなかった。|{a}が差し出した手を素通りして、{b}は{c}の隣へ移った。'),
otherRe:P9({
proud:'{a}は舌打ちして、そっぽを向いた。「……ああそうかよ」',stern:'{a}は口を閉じた。存在ごと無視されることには、怒るより先に虚しさを覚えた。',
tsun:'{a}「な、なによ！　別に、聞いてほしかったわけじゃないし……」',gentle:'{a}は小さく笑って、言いかけた言葉を飲み込んだ。',
devoted:'{a}はその場に立ち尽くした。どうすれば{b}の目に映るのか、{a}には分からなかった。',cool:'{a}は肩をすくめた。「……興味がない、ってことか」――分かってはいたが、少しだけ胸が冷えた。',
free:'{a}は「あ、そう」と笑ってみせたが、その笑いはすぐにしぼんだ。',shy:'{a}は真っ赤になって俯き、そっとその場を離れた。',
polite:'{a}は「失礼いたしました」と会釈して下がった。声は、わずかに震えていた。'
})
};
function apWhy(r,k){return r.K.name+'の働きかけと、'+r.A.name+'の無関心'+k+'（'+r.A.name+'から'+r.K.name+'への気持ちは動かない）';}
add({id:'tie_nw_ap_talk',label:'無関心な相手に話しかけても響かない',cat:'bond',w:1.4,roles:apR,run:function(ctx,r){ctx.mod(r.K,r.A,{ten:2,aff: -1});return{text:fill(pk(ctx,AP.talk),r.K,r.A)+fill(pk(ctx,AP.talkRe[per(r.A)]),r.K,r.A),why:apWhy(r,'：話しかけても響かない')};}});
add({id:'tie_nw_ap_gift',label:'無関心な相手に好意を受け流される',cat:'help',w:0.9,roles:apR,run:function(ctx,r){ctx.mod(r.K,r.A,{aff:1,ten:2});return{text:fill(pk(ctx,AP.gift),r.K,r.A)+fill(pk(ctx,AP.giftRe[per(r.A)]),r.K,r.A),why:apWhy(r,'：好意を受け流す')};}});
add({
id:'tie_nw_ap_other',label:'無関心な相手に素通りされる',cat:'conflict',w:0.9,
roles:function(ctx,a,b){var r=apR(ctx,a,b);return r&&thirds(ctx,b,a).length?r:null;},
run:function(ctx,r){
var c=ctx.rng.pick(thirds(ctx,r.A,r.K));if(!c)return null;
ctx.mod(r.K,r.A,{ten:4,aff: -2});ctx.stress(r.K,3);
return{with:[c],text:fill(pk(ctx,AP.other),r.K,r.A,c)+fill(pk(ctx,AP.otherRe[per(r.K)]),r.K,r.A,c),why:apWhy(r,'：目の前の相手を素通りする')};
}
});
function frR(ctx,a,b){var F0=T()&&T().fears;if(!F0)return null;if(F0(ctx,a,b))return{F:a,X:b};if(F0(ctx,b,a))return{F:b,X:a};return null;}
var FR={
avoid:L('{b}が姿を見せたとたん、{a}は手にしていたものを置いて、何も言わずにその場を離れた。|{a}は{b}の足音を聞きつけると、物陰に身を隠した。{b}が通り過ぎるまで、息を殺していた。|{a}は{b}のいる場所を、いつも遠回りして避けた。同じ場所にいるだけで、指先が冷たくなった。'),
avoidRe:P9({
proud:'{a}「……ちっ、別にびびってるわけじゃねえ」――そう呟く声が、自分でも分かるほど掠れていた。',stern:'{a}は表情を崩さなかったが、握った拳の内側はじっとりと汗ばんでいた。',
tsun:'{a}「べ、別に逃げたわけじゃないから！　用事を思い出しただけ！」',gentle:'{a}は胸に手を当てて、ゆっくり息を吐いた。それでも、震えは止まらなかった。',
devoted:'{a}は誰にも気づかれないように、震える手を袖の中に隠した。',cool:'{a}は「合理的な判断だ」と自分に言い聞かせた。近づかなければ、何も起きない。',
free:'{a}は「あー、急に用事思い出した」と笑ってごまかした。笑い声は少しだけ上ずっていた。',shy:'{a}は目に涙をためて、小さく体を縮めた。',
polite:'{a}は「失礼いたします」と早口で告げて、逃げるように下がった。'
}),
freeze:L('{b}が何気なく{a}の名前を呼んだ。{a}の体が、びくりと跳ねた。|{b}は{a}に、ほんの短い用事を言いつけようとしただけだった。{a}はその場で凍りついた。|{b}が近づいてくるのに気づいたとき、{a}はもう動けなかった。足が床に縫いつけられたようだった。'),
freezeRe:P9({
proud:'{a}は言い返そうとして、口を開いたまま固まった。喉から、声が出てこなかった。',stern:'{a}「……は、はい」――いつもの毅然とした声は、どこにもなかった。',
tsun:'{a}「な、なに……？」――強がる余裕もなく、声は小さく震えていた。',gentle:'{a}は笑顔を作ろうとして、失敗した。頬がこわばって、うまく動かなかった。',
devoted:'{a}は反射的に頭を下げた。「ご、ごめんなさい」――何を謝っているのか、自分でも分からなかった。',cool:'{a}は頭の中で言葉を探したが、何ひとつ浮かばなかった。考えることそのものが止まっていた。',
free:'{a}の軽口は、喉の奥で消えた。いつもの調子が、まるで出てこなかった。',shy:'{a}は息を止めたまま、目をぎゅっとつむった。',
polite:'{a}「た、ただいま……参ります」――敬語だけが、かろうじて口から出た。'
}),
obey:L('{b}は{a}に、面倒な役目を押しつけた。{a}は一言も逆らわなかった。|{b}が「それ、やっておいて｜それを、やっておけ｜それ、やっておいてください」と言うと、{a}は手を止めて言われたとおりにした。|{b}は{a}の分の食料を指さした。{a}は黙って、それを差し出した。'),
force:L('{b}は{a}を呼びつけ、皆の前で膝をつかせた。「返事は？｜返事はどうした｜返事はどうしましたか？」{a}は震える声で「はい」と答えた。|{b}は{a}に、自分の言うこと以外は聞くなと言い渡した。{a}はうなずくしかなかった。|{b}は{a}の持ち物を取り上げ、「返してほしければ、分かるよね｜返してほしければ、分かるな｜返してほしければ、分かりますよね」と笑った。{a}は、{b}の言いなりになった。'),
obeyRe:P9({
proud:'{a}は唇を噛んで従った。腹の底で燃えるものより、怖さのほうが勝っていた。',stern:'{a}は無言で命令をこなした。逆らえば何が起きるか、考えたくもなかった。',
tsun:'{a}「わ、分かったってば……」――声は強がっていたが、手は素直に動いていた。',gentle:'{a}は「うん、いいよ」と笑ってみせた。笑うしか、身を守る方法を知らなかった。',
devoted:'{a}は言われるより先に動いた。{b}の機嫌を損ねないことが、いつのまにか一番になっていた。',cool:'{a}は損得を計算して、従うほうが安全だと結論した。それが言い訳だと、自分でも分かっていた。',
free:'{a}は「はーい」と軽く返事をした。その軽さは、怯えを隠すための精いっぱいだった。',shy:'{a}は小さく頷いて、言われたことを一つずつこなした。最後まで顔を上げられなかった。',
polite:'{a}「かしこまりました」――深く下げた頭は、なかなか上がらなかった。'
}),
shelter:L('{a}は{c}の姿を見るなり、{b}の背中に隠れた。{b}の服の裾を掴む指が、白くなっていた。|{a}は{b}のそばを離れようとしなかった。{c}が近くにいるあいだ、{b}の隣だけが安全な場所だった。|{a}は小さな声で{b}に頼んだ。「お願い、少しだけ一緒にいて。{c}が……怖い｜頼む、少しだけ一緒にいてくれ。{c}が……怖い｜お願いです、少しだけ一緒にいてください。{c}が……怖いんです」'),
shelterRe:P9({
proud:'{b}は{c}を睨みつけ、{a}を背中にかばった。「こいつに用があるなら、先に私を通せ」',stern:'{b}は黙って{a}の前に立った。それだけで、{c}は足を止めた。',
tsun:'{b}「し、しょうがないなあ。……ほら、ここにいれば？」{b}はそっぽを向いたまま、{a}の手を握った。',gentle:'{b}は{a}の肩を抱いて、「大丈夫、ここにいるよ」と囁いた。',
devoted:'{b}は{a}の手を両手で包んだ。「何があっても、私が守るから」',cool:'{b}は{c}との間に自然と体を入れ、{a}を壁際に下がらせた。「落ち着くまで、ここにいろ」',
free:'{b}は「おっ、頼られちゃった」とおどけてみせ、{a}の肩に腕を回した。その目は、{c}から離れなかった。',shy:'{b}は自分も震えながら、{a}の手をぎゅっと握り返した。「……い、一緒に、いるから」',
polite:'{b}は穏やかに言った。「ご安心ください。お傍におります」'
}),
eyes:L('{a}は{b}と目が合いそうになるたび、さっと視線を落とした。|{b}の声が聞こえるだけで、{a}の肩が小さく震えた。|{a}は{b}のいる方向に背を向けて座った。{b}の姿が視界に入らないように。'),
eyesRe:P9({
proud:'{b}は鼻で笑った。「何をびくびくしてんだ」――その一言で、{a}はさらに縮こまった。',stern:'{b}は{a}の様子に気づいたが、何も言わなかった。その沈黙が、{a}には何より重かった。',
tsun:'{b}「な、何よその態度。……私、何かした？」――{b}は不機嫌そうに眉を寄せた。',gentle:'{b}は少し寂しそうに目を伏せた。{a}に怖がられる理由を、{b}はうまく思い出せなかった。',
devoted:'{b}は{a}に近づきかけて、足を止めた。これ以上怖がらせたくはなかった。',cool:'{b}は{a}を一瞥し、興味をなくしたように視線を外した。',
free:'{b}は「え、なんでそんなに逃げるの？」と笑ったが、{a}は笑い返せなかった。',shy:'{b}も気まずそうに目を逸らした。二人のあいだに、ぎこちない沈黙が落ちた。',
polite:'{b}「……私が何か、お気に障ることをいたしましたか」――{a}は、首を横に振ることしかできなかった。'
})
};
function frWhy(r,k){return r.F.name+'は'+r.X.name+'を恐れている'+k;}
add({id:'tie_nw_fr_avoid',label:'恐れる相手と同じ場所にいられない',cat:'conflict',w:0.9,roles:frR,run:function(ctx,r){ctx.mod(r.F,r.X,{ten:3});ctx.stress(r.F,3);return{text:fill(pk(ctx,FR.avoid),r.F,r.X)+fill(pk(ctx,FR.avoidRe[per(r.F)]),r.F,r.X),why:frWhy(r,'：同じ場所にいたがらない')};}});
add({id:'tie_nw_fr_freeze',label:'恐れる相手に話しかけられて固まる',cat:'conflict',w:0.8,roles:frR,run:function(ctx,r){ctx.mod2(r.F,r.X,{ten:4},{ten:1});ctx.stress(r.F,4);return{text:fill(pk(ctx,FR.freeze),r.F,r.X)+fill(pk(ctx,FR.freezeRe[per(r.F)]),r.F,r.X),why:frWhy(r,'：話しかけられると固まる')};}});
add({
id:'tie_nw_fr_obey',label:'恐れる相手に従わされる',cat:'conflict',w:0.8,roles:frR,
run:function(ctx,r){
var force=ctx.rng()<HK.clamp(0.2*gapK(ctx,r.F,r.X),0.05,0.6);
if(force){ctx.mod(r.F,r.X,{ten:8,aff: -4});ctx.stress(r.F,8);}else{ctx.mod(r.F,r.X,{ten:3,trust: -1});ctx.mod(r.X,r.F,{trust:2});}
return{text:fill(pk(ctx,force?FR.force:FR.obey),r.F,r.X)+fill(pk(ctx,FR.obeyRe[per(r.F)]),r.F,r.X),why:frWhy(r,force?'：従うことを強いられた'+gapWhy(ctx,r.F,r.X):'：命じられると逆らえない'),mag:force?18:8};
}
});
add({
id:'tie_nw_fr_shelter',label:'怯える人が頼れる人に身を寄せる',cat:'help',w:0.7,
roles:function(ctx,a,b){
var F0=T()&&T().fears;if(!F0||F0(ctx,a,b)||F0(ctx,b,a)||T().apathy(ctx,b,a)||T().apathy(ctx,a,b))return null;
if(ctx.R(a,b).trust<0&&ctx.R(a,b).aff<10)return null;
var x=thirds(ctx,a,b,function(c){return F0(ctx,a,c);});
return x.length?{F:a,P:b}:null;
},
run:function(ctx,r){
var x=thirds(ctx,r.F,r.P,function(c){return T().fears(ctx,r.F,c);}),X=x.length?ctx.rng.pick(x):null;if(!X)return null;
ctx.mod2(r.F,r.P,{trust:6,aff:3},{trust:2,aff:3});ctx.mod(r.P,X,{ten:3});
return{with:[X],text:fill(pk(ctx,FR.shelter),r.F,r.P,X)+fill(pk(ctx,FR.shelterRe[per(r.P)]),r.F,r.P,X),why:r.F.name+'は'+X.name+'を恐れて、'+r.P.name+'に庇護を求めた'};
}
});
add({id:'tie_nw_fr_eyes',label:'恐れる相手と目を合わせられない',cat:'conflict',w:0.6,roles:frR,run:function(ctx,r){ctx.mod2(r.F,r.X,{ten:2},{ten:2});return{text:fill(pk(ctx,FR.eyes),r.F,r.X)+fill(pk(ctx,FR.eyesRe[per(r.X)]),r.F,r.X),why:frWhy(r,'：目を合わせられない')};}});
function fiT(ctx,a,b){return has(ctx,a,b,'fiance');}
function feelOf(t,x){return(t.a===x.i?t.feel:t.feelB)||'eager';}
function setFeel(t,x,v){if(t.a===x.i)t.feel=v;else t.feelB=v;}
function fiLoveOk(a,b){return both(a,b)&&okSexLove(a,b);}
var FI={
eager:P9({
proud:'{a}は{b}の隣にどかっと座った。「どうせ一緒になるんだ。今のうちに慣れとけ」',stern:'{a}は{b}に向き直り、改まって言った。「許嫁として、きちんと{b}を知っておきたい」',
tsun:'{a}「べ、別に許嫁だから気にしてるわけじゃないんだからね！」――そう言いながら、{a}は{b}の分の飲み物を用意していた。',gentle:'{a}は{b}の隣に座り、柔らかく笑った。「決められた縁でも、{b}でよかったって思ってる」',
devoted:'{a}は{b}の好きなものを、婚約が決まった日から少しずつ調べていた。今日、それを一つ{b}に手渡した。',cool:'{a}「家の取り決めとはいえ、悪くない組み合わせだと思っている。……少なくとも、私は」',
free:'{a}は{b}の手を取って、「ねえ、式はどんなのがいい？」と楽しそうに訊いた。',shy:'{a}は真っ赤になりながら、{b}の袖をそっと引いた。「あの……許嫁、ですから。少しだけ、隣に」',
polite:'{a}は丁寧に一礼した。「未来の伴侶として、どうぞよろしくお願いいたします」'
}),
back:{
eager:L('{b}は嬉しそうに頷き、{a}の手を握り返した。決められた縁は、二人の中でゆっくりと本物になりつつあった。|{b}「私も、同じことを考えてた｜私も、同じことを考えていた｜私も、同じことを考えていました」――二人は顔を見合わせて、少し照れたように笑った。|{b}は{a}の肩に頭を預けた。親の決めた約束が、今はただ心地よかった。'),
unsure:L('{b}は曖昧に笑った。嫌ではない。けれど、これが自分の望んだことなのか、まだ分からなかった。|{b}「……うん。ありがとう｜……ああ。ありがとう｜……はい。ありがとうございます」――{b}の返事は、少しだけ遅れた。|{b}は{a}のまっすぐさに戸惑いながらも、その手を振りほどきはしなかった。'),
refuse:L('{b}は{a}の手を、そっと外した。「ごめん。……親が決めたことに、私はまだ頷いてない｜すまない。……親が決めたことに、私はまだ頷いていない｜ごめんなさい。……親が決めたことに、私はまだ頷いていません」|{b}は目を逸らした。{a}の好意が本物であるほど、{b}の胸は重くなった。|{b}「そういうの、やめてほしい｜そういうのは、やめてほしい｜そういうの、やめてほしいです」――{b}の声は小さかったが、はっきりしていた。')
},
duty:L('{a}と{b}は、許嫁として礼儀正しく並んで座った。決められた縁を、二人とも家どうしの約束として受け止めていた。|{a}は{b}に、許嫁としての務めを果たすつもりだと告げた。それは恋の言葉ではなく、誠実な約束の言葉だった。|{a}と{b}は、家の行事の段取りを淡々と確かめ合った。二人のあいだにあるのは、穏やかな信頼だった。'),
unsure:L('{a}は{b}の横顔を見ながら、親に婚約を告げられた日のことを思い出していた。|{a}は許嫁という言葉を、口の中で何度か転がしてみた。まだ、自分のものになじまなかった。|{a}は{b}に何か言いかけて、やめた。何を言えばいいのか、自分でもまとまっていなかった。'),
unsureRe:P9({
proud:'{a}「……決められた相手、ってのがどうも気に入らねえんだよな。{b}が悪いわけじゃねえけど」',stern:'{a}は小さく息をついた。「務めは果たす。だが、心がついてくるかは別の話だ」',
tsun:'{a}「べ、別に嫌ってわけじゃないけど！　……ちょっと、急すぎるだけ」',gentle:'{a}は困ったように笑った。「{b}のことは嫌いじゃないよ。ただ、まだ自分の気持ちが分からないんだ」',
devoted:'{a}は{b}に頭を下げた。「ちゃんと向き合いたいの。だから、少しだけ時間がほしい」',cool:'{a}「感情は後からついてくる、と親は言った。……本当にそうなのか、確かめている最中だ」',
free:'{a}は「許嫁って、なんか実感ないよね」と笑った。その笑いは、半分は本音だった。',shy:'{a}は{b}と目が合うと、慌てて俯いた。嬉しいのか困っているのか、自分でも分からなかった。',
polite:'{a}「身に余るお話だとは存じております。……ただ、まだ気持ちの整理がつかなくて」'
}),
refuse:L('{a}は{b}と二人きりになると、意を決したように口を開いた。|{a}は{b}から贈られたものを、手もつけずに返した。|{a}は家に宛てた手紙を書きかけて、何度も破った。宛先は、婚約を決めた親だった。'),
refuseRe:P9({
proud:'{a}「はっきり言っとく。私はこの話、認めてねえからな」',stern:'{a}「この婚約は受け入れられない。親にも、そう伝えるつもりだ」',
tsun:'{a}「か、勝手に決められた相手なんて、好きになれるわけないでしょ！」',gentle:'{a}は申し訳なさそうに目を伏せた。「{b}を傷つけたくはないんだ。でも、このまま結婚はできない」',
devoted:'{a}は深く頭を下げた。「ごめんなさい。私の心は、私が選んだ人にしかあげられない」',cool:'{a}「家どうしの取り決めに、私の意思は入っていない。だから従う理由もない」',
free:'{a}は肩をすくめた。「ごめんね、私、決められた道を歩くの向いてないんだ」',shy:'{a}は震える声で、やっとのことで言った。「……あの、この婚約、なかったことに……できませんか」',
polite:'{a}は丁寧に、しかしきっぱりと言った。「大変申し訳ございませんが、お受けいたしかねます」'
}),
refuseBack:{
eager:L('{b}は言葉を失った。差し出しかけた手が、ゆっくりと下りた。|{b}「……そっか｜……そうか｜……そうですか」{b}はそれだけ言って、無理に笑った。|{b}の顔から、さっと血の気が引いた。'),
unsure:L('{b}は驚いたが、どこかでほっとしている自分にも気づいた。|{b}は「私も、ちゃんと考えたかった｜＝｜私も、ちゃんと考えたかったです」とだけ答えた。|{b}はしばらく黙ってから、小さく頷いた。'),
refuse:L('{b}「……実は、私も同じことを考えてた｜……実は、私も同じことを考えていた｜……実は、私も同じことを考えていました」二人は顔を見合わせ、初めて同じ気持ちで笑った。|{b}は肩の力を抜いた。「なら、一緒に親を説得しよう｜＝｜なら、一緒に親を説得しましょう」|{b}「気が合うのは、こういうところだけだね｜気が合うのは、こういうところだけだな｜気が合うのは、こういうところだけですね」――二人の間の空気が、少しだけ軽くなった。')
},
talk:L('{a}と{b}は、両家の顔合わせの日取りについて話した。どちらも、少しだけ他人行儀だった。|{a}と{b}は、子どものころに一度だけ会ったことがあると気づいた。互いに、相手のことをほとんど覚えていなかった。|{a}と{b}は、婚約を決めたそれぞれの親の口癖を言い合って、少しだけ笑った。'),
talkRe:P9({
proud:'{a}「ま、親の顔を立てるくらいはしてやるよ」',stern:'{a}「互いの家に恥をかかせないよう、務めは果たそう」',
tsun:'{a}「べ、別に、{b}のこと知りたいわけじゃないけど。……一応ね」',gentle:'{a}「少しずつでいいから、{b}のこと、教えてくれる？」',
devoted:'{a}「{b}の家のしきたり、ちゃんと覚えるね」',cool:'{a}「情報が少なすぎる。まず互いのことを知るところからだ」',
free:'{a}「結婚とかよく分かんないけど、{b}と話すのは嫌いじゃないよ」',shy:'{a}「……あの、{b}のこと、もっと、知りたいです」',
polite:'{a}「今後とも、末永くよろしくお願い申し上げます」'
}),
after:L('{a}と{b}は、婚約がなくなってから初めて同じ場所で過ごした。どちらから話しかけるべきか、二人とも分からなかった。|{a}は{b}の姿を見て、言いかけた挨拶を飲み込んだ。元許嫁という呼び方は、まだどちらにもなじまなかった。|{b}は{a}と目が合うと、気まずそうに会釈した。破談の日の言葉が、まだ二人のあいだに残っていた。'),
warm:L('{a}は、{b}が自分のために黙って手を回してくれていたことに気づいた。親が決めた相手だということを、{a}は初めて忘れた。|{a}は{b}の笑い声を聞いて、胸の奥が温かくなるのを感じた。決められた縁が、いつのまにか自分の選んだ縁になっていた。|{a}は{b}の隣にいる時間を、いつしか待ち遠しく思うようになっていた。'),
warmRe:P9({
proud:'{a}「……悪くねえな、この縁も」――そう呟いた{a}の耳は赤かった。',stern:'{a}「認めよう。私は、{b}と共に歩みたいと思っている」',
tsun:'{a}「か、勘違いしないでよね。親のためじゃなくて、私が{b}がいいって思っただけなんだから！」',gentle:'{a}は{b}の手をそっと取った。「やっと分かったんだ。{b}でよかったって」',
devoted:'{a}は{b}をまっすぐに見た。「これからは、私が{b}を選んだんだって、胸を張って言える」',cool:'{a}「感情は後からついてくる、と親は言った。……悔しいが、その通りだった」',
free:'{a}は「ねえ、やっぱり式、楽しみになってきた」と笑った。',shy:'{a}は消え入りそうな声で言った。「わ、私……この婚約、嬉しい、です」',
polite:'{a}は深く頭を下げた。「改めて、私からもお願い申し上げます。どうか、末永く」'
}),
brk:L('{a}は{b}を呼び出し、まっすぐに告げた。「この婚約は、なかったことにしてほしい。……ほかに、想ってる人がいるんだ｜この婚約は、なかったことにしてほしい。……ほかに、想う人がいるんだ｜この婚約は、なかったことにしてください。……ほかに、想う人がいるんです」{a}の視線の先には、{c}がいた。|{a}は家に宛てて、婚約を断る手紙を出した。{c}への想いを、もう自分に偽ることはできなかった。|{a}は皆の前で、{b}との婚約を解くと言い切った。{c}は驚いたように{a}を見つめていた。'),
brkRe:P9({
proud:'{a}「決めたのは親だ。私の相手は、私が決める」',stern:'{a}「筋は通す。だが、心まで縛られるつもりはない」',
tsun:'{a}「わ、悪いとは思ってるわよ！　でも、仕方ないじゃない……！」',gentle:'{a}「{b}には、本当に申し訳ないと思ってる。でも、嘘をついたまま一緒にはなれない」',
devoted:'{a}「私の心は、もう一人のものなの。ごめんなさい」',cool:'{a}「続けても、誰も幸せにならない。それが私の結論だ」',
free:'{a}「ごめん、{b}。私、自分の気持ちに正直でいたいんだ」',shy:'{a}は泣きそうな顔で、それでも最後まで言い切った。「……ごめんなさい」',
polite:'{a}「勝手を申し上げて、まことに申し訳ございません」'
}),
brkBack:L('{b}はしばらく黙っていたが、やがて静かに頷いた。|{b}は何も言わずに背を向けた。その肩が、小さく震えていた。|{b}「……分かった。親には、私からも話す｜＝｜……分かりました。親には、私からも話します」')
};
TN.FI=FI;
function fiOpen(ctx,a,b){var t=fiT(ctx,a,b);return t&& !t.broken&&ctx.pair(a,b).fiBroken==null?t:null;}
function fiWhy(t,a,b,k){return a.name+'と'+b.name+'は許嫁（'+a.name+'：'+HK.FIANCE_FEEL[feelOf(t,a)].short+'・'+b.name+'：'+HK.FIANCE_FEEL[feelOf(t,b)].short+'）'+k;}
add({
id:'tie_nw_fi_eager',label:'乗り気の許嫁が歩み寄る',cat:'bond',w:0.8,
roles:function(ctx,a,b){var t=fiOpen(ctx,a,b);return t&&feelOf(t,a)==='eager'?{a:a,b:b,t:t}:null;},
run:function(ctx,r){
var a=r.a,b=r.b,t=r.t,fb=feelOf(t,b);
if(!fiLoveOk(a,b)){ctx.mod2(a,b,{trust:3,aff:2},{trust:3,aff:2});return{cat:'bond',text:fill(pk(ctx,FI.duty),a,b),why:fiWhy(t,a,b,'：家どうしの約束として')};}
var text=fill(pk(ctx,FI.eager[per(a)]),a,b)+fill(pk(ctx,FI.back[fb]),a,b);
if(fb==='refuse'){ctx.mod2(a,b,{ten:2},{ten:4});return{cat:'conflict',text:text,why:fiWhy(t,a,b,'：乗り気の側の歩み寄りを拒んだ')};}
ctx.mod2(a,b,{att:5,aff:4},{att:fb==='eager'?4:2,aff:2});
return{cat:'romance',text:text,why:fiWhy(t,a,b,'：乗り気の側から歩み寄る')};
}
});
add({
id:'tie_nw_fi_unsure',label:'決められた縁に戸惑う許嫁',cat:'bond',w:0.6,
roles:function(ctx,a,b){var t=fiOpen(ctx,a,b);return t&&feelOf(t,a)==='unsure'?{a:a,b:b,t:t}:null;},
run:function(ctx,r){ctx.mod2(r.a,r.b,{ten:1,aff:1},{ten:1});return{text:fill(pk(ctx,FI.unsure),r.a,r.b)+fill(pk(ctx,FI.unsureRe[per(r.a)]),r.a,r.b),why:fiWhy(r.t,r.a,r.b,'：決められた縁への戸惑い')};}
});
add({
id:'tie_nw_fi_refuse',label:'許嫁に断りたい気持ちを打ち明ける',cat:'conflict',w:0.7,
roles:function(ctx,a,b){var t=fiOpen(ctx,a,b);return t&&feelOf(t,a)==='refuse'?{a:a,b:b,t:t}:null;},
run:function(ctx,r){
var fb=feelOf(r.t,r.b);
if(fb==='refuse')ctx.mod2(r.a,r.b,{aff:3,trust:3},{aff:3,trust:3});else{ctx.mod(r.b,r.a,{ten:6,aff: -3});ctx.mod(r.a,r.b,{ten:3});}
return{text:fill(pk(ctx,FI.refuse),r.a,r.b)+fill(pk(ctx,FI.refuseRe[per(r.a)]),r.a,r.b)+fill(pk(ctx,FI.refuseBack[fb]),r.a,r.b),why:fiWhy(r.t,r.a,r.b,'：断りたい気持ちを打ち明けた')};
}
});
add({
id:'tie_nw_fi_talk',label:'許嫁どうしで婚約について話す',cat:'bond',w:0.5,
roles:function(ctx,a,b){var t=fiT(ctx,a,b);return t?{a:a,b:b,t:t}:null;},
run:function(ctx,r){
if(r.t.broken||ctx.pair(r.a,r.b).fiBroken!=null){ctx.mod2(r.a,r.b,{ten:2},{ten:2});return{text:fill(pk(ctx,FI.after),r.a,r.b),why:r.a.name+'と'+r.b.name+'は元許嫁：破談のあとの気まずさ'};}
ctx.mod2(r.a,r.b,{aff:2,trust:2},{aff:2,trust:2});
return{text:fill(pk(ctx,FI.talk),r.a,r.b)+fill(pk(ctx,FI.talkRe[per(r.a)]),r.a,r.b),why:fiWhy(r.t,r.a,r.b,'：婚約をめぐる話')};
}
});
add({
id:'tie_nw_fi_warm',label:'決められた縁を自分で選び直す',cat:'romance',w:0.6,
roles:function(ctx,a,b){
var t=fiOpen(ctx,a,b);if(!t||feelOf(t,a)!=='unsure'|| !fiLoveOk(a,b))return null;
var x=ctx.R(a,b),y=ctx.R(b,a);
return x.att>20&&(x.aff+y.aff+x.trust+y.trust)/4>22?{a:a,b:b,t:t}:null;
},
run:function(ctx,r){
var a=r.a,b=r.b,t=r.t,pf=ctx.pair(a,b);
setFeel(t,a,'eager');
ctx.mod2(a,b,{att:6,aff:5},{att:3,aff:3});
var other=function(x){return ctx.chars.some(function(c){return c!==a&&c!==b&&c.alive!==false&&ctx.pair(x,c).couple;});};
if(feelOf(t,b)==='eager'&& !pf.couple&& !other(a)&& !other(b)){pf.couple=true;t.couple=true;(a.loveSet=a.loveSet||[]).push(b.i);(b.loveSet=b.loveSet||[]).push(a.i);}
return{text:fill(pk(ctx,FI.warm),a,b)+fill(pk(ctx,FI.warmRe[per(a)]),a,b),why:fiWhy(t,a,b,'：決められた縁を、自分で選び直した')};
}
});
function brkFor(ctx,a,b){return thirds(ctx,a,b,function(c){var r=ctx.R(a,c);return r.att>=35&&r.aff>=20&&both(a,c);});}
add({
id:'tie_nw_fi_break',label:'許嫁がほかの人を好きになり破談',cat:'conflict',w:1.2,
roles:function(ctx,a,b){var t=fiOpen(ctx,a,b);return t&&feelOf(t,a)==='refuse'&&brkFor(ctx,a,b).length?{a:a,b:b,t:t}:null;},
run:function(ctx,r){
var a=r.a,b=r.b,t=r.t,pf=ctx.pair(a,b),l=brkFor(ctx,a,b),c=null,bv= -1;
l.forEach(function(x){var v=ctx.R(a,x).att+ctx.R(a,x).aff*0.5;if(v>bv){bv=v;c=x;}});
if(!c)return null;
t.broken=true;t.couple=false;pf.couple=false;pf.fiBroken=ctx.stepIndex;
ctx.mod2(a,b,{ten:14,aff: -4,att: -8},{ten:18,aff: -8,trust: -6,att: -8});ctx.mod(a,c,{att:4});ctx.stress(b,10);
return{with:[c],text:fill(pk(ctx,FI.brk),a,b,c)+fill(pk(ctx,FI.brkRe[per(a)]),a,b,c)+fill(pk(ctx,FI.brkBack),a,b,c),why:'許嫁の破談（'+a.name+'は断りたい気持ちのまま、'+c.name+'に想いを寄せた）',mag:30};
}
});
function yanR(sub){return function(ctx,a,b){var r=dir(ctx,a,b,'yan',function(t){return t.sub===sub;});if(!r)return null;if(HK.Obsess&&HK.Obsess.blocked&&HK.Obsess.blocked(ctx,r.A,r.B))return null;return r;};}
var DEP={
search:L('{b}が少し席を外しただけで、{a}は顔色を変えて探し回った。見つけたとたん、{a}は{b}の袖を掴んで離さなかった。|{a}は{b}の姿が見えないことに気づくと、名前を呼びながらあちこちを駆け回った。|{b}が戻ってくると、{a}は泣き出しそうな顔で駆け寄った。「どこ行ってたの。……いなくなったかと思った｜どこへ行っていた。……いなくなったかと思った｜どこへ行っていたんですか。……いなくなったかと思いました」'),
check:L('{a}は数分おきに{b}のほうを振り返った。そこに{b}がいることを、何度でも確かめずにはいられなかった。|{a}「ねえ、ちゃんといる？｜おい、ちゃんといるか｜あの、ちゃんといますか？」――返事を聞くまで、{a}は同じことを何度も訊いた。|{a}は{b}が眠っているあいだも、その寝息を確かめるように、そばを離れなかった。'),
cling:L('{a}は{b}の腕にすがりついた。「お願い、一人にしないで。{b}がいないと、何もできない｜頼む、一人にしないでくれ。{b}がいないと、何もできない｜お願いです、一人にしないでください。{b}がいないと、何もできません」|{b}が誰かと話しに行こうとすると、{a}はその手を握って引き留めた。「すぐ戻る？　本当に？｜すぐ戻るのか？　本当か？｜すぐ戻りますか？　本当ですか？」|{a}は{b}の背中に額を押しつけたまま、しばらく動かなかった。「……もう少しだけ、このままで｜……もう少しだけ、このままでいさせてくれ｜……もう少しだけ、このままでいさせてください」'),
worry:L('{a}は{b}の顔色ばかり気にしていた。{b}が少し咳をしただけで、{a}は自分の上着を差し出した。|{a}は{b}が食べたものの量まで覚えていた。「今日、あんまり食べてないよね。大丈夫？｜今日は、あまり食べていないな。大丈夫か｜今日、あまり食べていませんよね。大丈夫ですか？」|{a}は{b}の様子が少しでも違うと、何があったのか知るまで落ち着かなかった。'),
re:P9({
proud:'{b}「……ったく、しょうがねえな。ほら、ここにいるだろ」|{b}は面倒くさそうに頭をかいたが、{a}の手を振りほどきはしなかった。',
stern:'{b}「落ち着け。私はどこへも行かない」――{b}の声は、厳しくも静かだった。|{b}は{a}を正面から見て、ゆっくりと言った。「一人で立てるようになれ。……そばにはいるから」',
tsun:'{b}「も、もう、心配しすぎ！　……どこにも行かないってば」|{b}は顔を赤くしながら、{a}の頭を乱暴に撫でた。',
gentle:'{b}は{a}の背中をそっと撫でた。「大丈夫。ちゃんとここにいるよ」|{b}は困ったように笑いながらも、{a}が落ち着くまで隣にいた。',
devoted:'{b}は{a}の手を握り返した。「私も、{a}がいないと困るよ」――その言葉に、{a}はようやく息をついた。|{b}は{a}の隣に座り直した。どちらがどちらに寄りかかっているのか、もう分からなかった。',
cool:'{b}は小さくため息をついた。「確認の頻度が多すぎる。……だが、気持ちは分かった」|{b}「心配するな。私の居場所は、決まったら必ず伝える」',
free:'{b}は「はいはい、ここにいますよー」と笑って、{a}の頬をつついた。|{b}は「重いなあ」と笑ったが、その声に嫌がる響きはなかった。',
shy:'{b}は戸惑いながらも、{a}の袖をそっと握り返した。「……い、いるよ」|{b}は何と言えばいいか分からず、ただ{a}の隣に座り直した。',
polite:'{b}「ご心配をおかけしました。ずっとお側におります」|{b}は穏やかに微笑んだ。「どうか、少しだけ肩の力を抜いてください」'
}),
reCold:L('{b}は{a}の手から、そっと身を引いた。重すぎる想いが、怖かった。|{b}は返事をせずに顔を背けた。{a}の目が、すがるように{b}を追った。|{b}「……少し、一人にさせて｜……少し、一人にさせてくれ｜……少し、一人にさせてください」――その言葉が、{a}をさらに不安にさせた。')
};
function coldBack(ctx,A,B){var s=HK.Obsess&&HK.Obsess.stance?HK.Obsess.stance(ctx,B,A):'';return s==='afraid'||s==='hate'||(T().fears&&T().fears(ctx,B,A))||(T().apathy&&T().apathy(ctx,B,A));}
function obWhy(ctx,r,k){var lv=HK.Obsess&&HK.Obsess.level?Math.round(HK.Obsess.level(ctx,r.A,r.B)):0;return r.A.name+'の'+r.B.name+'への執着（'+(lv?lv+'・':'')+k+'）'+gapWhy(ctx,r.A,r.B);}
function depRun(key,cat){
return function(ctx,r){
var cold=coldBack(ctx,r.A,r.B);
ctx.mod(r.B,r.A,cold?{ten:5,aff: -2}:{ten:2,aff:1});ctx.stress(r.A,3);
if(HK.Obsess&&HK.Obsess.add)HK.Obsess.add(ctx,r.A,r.B,cold?3:1.5);
return{cat:cat,text:fill(pk(ctx,DEP[key]),r.A,r.B)+fill(pk(ctx,cold?DEP.reCold:DEP.re[per(r.B)]),r.A,r.B),why:obWhy(ctx,r,'依存型'+{search:'：離れると探す',check:'：何度も確かめる',cling:'：すがる',worry:'：気にしてばかりいる'}[key])};
};
}
add({id:'tie_nw_dep_search',label:'依存する相手の姿が見えず探し回る',cat:'conflict',w:0.6,roles:yanR('dep'),run:depRun('search','conflict')});
add({id:'tie_nw_dep_check',label:'依存する相手を何度も確かめる',cat:'conflict',w:0.5,roles:yanR('dep'),run:depRun('check','conflict')});
add({id:'tie_nw_dep_cling',label:'依存する相手にすがりつく',cat:'conflict',w:0.5,roles:yanR('dep'),run:depRun('cling','conflict')});
add({id:'tie_nw_dep_worry',cat:'bond',w:0.5,roles:yanR('dep'),run:depRun('worry','bond')});
var HL={
seek:L('{a}は{b}が戻らないと聞くと、誰より先に探しに出た。見つけた{b}に、{a}は怒鳴った。「勝手なことするな！｜勝手なことをするな！｜勝手なことをしないでください！」|{a}は{b}の姿を見つけるまで、一度も足を止めなかった。見つけてから、ようやく自分の息が切れていることに気づいた。|{a}は{b}を探し当てると、黙って隣に腰を下ろした。「……別に、心配したわけじゃない｜……別に、心配したわけではない｜……別に、心配したわけじゃありません」'),
guard:L('{b}が危ない目に遭いかけた瞬間、{a}は体ごと割って入った。かばったあとで、{a}は{b}を睨みつけた。|{a}は{b}に近づこうとした者を、冷たい一瞥で追い払った。「{b}を傷つけていいのは、私だけ｜{b}を傷つけていいのは、私だけだ｜{b}を傷つけていいのは、私だけです」|{a}は{b}の盾になって傷を負った。手当てしようとする{b}の手を、{a}は振り払った。'),
test:L('{a}は{b}に、わざと答えにくい問いを投げた。「私がいなくなったら、{b}は泣く？　それとも、ほっとする？｜私がいなくなったら、{b}は泣くか？　それとも、ほっとするか？｜私がいなくなったら、{b}は泣きますか？　それとも、ほっとしますか？」|{a}は{b}の小さな失敗を、何度も蒸し返して責めた。責めながら、{a}は{b}の顔から目を離さなかった。|{a}は{b}が自分を選ぶかどうか、わざと素っ気なくしてみせて試した。'),
wound:L('{a}「{b}なんか、最初からいなければよかった｜{b}など、最初からいなければよかった｜{b}なんか、最初からいなければよかったんです」――言った瞬間、{a}自身がいちばん傷ついた顔をした。|{a}は{b}のいちばん触れられたくないところを、正確に言葉で突いた。{b}が黙り込むと、{a}は背を向けた。|{a}「大嫌い。……だから、私以外を見ないで｜大嫌いだ。……だから、私以外を見るな｜大嫌いです。……だから、私以外を見ないでください」'),
re:P9({
proud:'{b}「意味わかんねえ。……嫌いなら放っとけよ」――そう言いながら、{b}は{a}から目を逸らせなかった。|{b}は{a}の胸ぐらを掴みかけて、その目に浮かぶものに気づいて手を止めた。',
stern:'{b}「矛盾している。だが……それが{a}なのだろう」|{b}は黙って{a}の言葉を受け止めた。責める声の底にあるものを、{b}は聞き逃さなかった。',
tsun:'{b}「な、なによ、優しくしたり意地悪したり……！　どっちなのよ！」|{b}は唇を噛んで、それでも{a}の隣を離れなかった。',
gentle:'{b}は傷ついた顔で、それでも{a}の手を取った。「{a}が苦しいのは、分かってるよ」|{b}は何も言い返さず、ただ悲しそうに笑った。',
devoted:'{b}「憎まれてもいい。{a}のそばにいられるなら」|{b}は{a}の言葉に傷つきながら、それでも{a}の無事を確かめずにはいられなかった。',
cool:'{b}は冷静に{a}を見返した。「憎むのも、執着の一つの形だ」|{b}「試されるのは好きじゃない。……でも、答えは変わらない」',
free:'{b}は「はいはい、愛されてるねえ私」とおどけたが、その目は少し潤んでいた。|{b}は笑ってかわそうとして、うまくいかなかった。',
shy:'{b}は泣きそうな顔で黙り込んだ。{a}の言葉の、どこまでが本当なのか分からなかった。|{b}は小さく震えながら、{a}の袖を掴んだままでいた。',
polite:'{b}「……左様でございますか」――丁寧な言葉の端が、かすかに震えていた。|{b}は深く息を吸ってから言った。「それでも、お傍を離れるつもりはございません」'
})
};
function hlRun(key){
return function(ctx,r){
var hurt=key==='test'||key==='wound',cold=coldBack(ctx,r.A,r.B);
if(hurt){ctx.mod(r.B,r.A,{ten:6,aff: -3});ctx.mod(r.A,r.B,{att:2});ctx.stress(r.B,6);}else ctx.mod2(r.A,r.B,{aff:3},{trust:3,aff:2});
if(HK.Obsess&&HK.Obsess.add)HK.Obsess.add(ctx,r.A,r.B,hurt?3:2);
return{cat:hurt?'conflict':'help',text:fill(pk(ctx,HL[key]),r.A,r.B)+fill(pk(ctx,cold?DEP.reCold:HL.re[per(r.B)]),r.A,r.B),why:obWhy(ctx,r,'愛憎型'+{seek:'：姿が見えないと探す',guard:'：憎みながら守る',test:'：責めて試す',wound:'：傷つける言葉'}[key]),mag:hurt?14:10};
};
}
add({id:'tie_nw_hl_seek',label:'執着の相手が戻らず探しに出る（試す）',cat:'help',w:0.5,roles:yanR('hatelove'),run:hlRun('seek')});
add({id:'tie_nw_hl_guard',label:'執着の相手を危険からかばう（試す）',cat:'help',w:0.5,roles:yanR('hatelove'),run:hlRun('guard')});
add({id:'tie_nw_hl_test',label:'執着の相手の気持ちを試す',cat:'conflict',w:function(ctx,r){return 0.45*gapK(ctx,r.A,r.B);},roles:yanR('hatelove'),run:hlRun('test')});
add({id:'tie_nw_hl_wound',label:'執着の相手に心ない言葉をぶつける（試す）',cat:'conflict',w:function(ctx,r){return 0.4*gapK(ctx,r.A,r.B);},roles:yanR('hatelove'),run:hlRun('wound')});
function hateR(ctx,a,b){var Fd=HK.Feud;if(!Fd|| !Fd.hateGrade|| !Fd.HATE)return null;if(Fd.hateGrade(ctx,a,b))return{A:a,B:b};if(Fd.hateGrade(ctx,b,a))return{A:b,B:a};return null;}
function hTxt(ctx,key,r,c){var Fd=HK.Feud,re=Fd.HATE_RE[key]||Fd.HATE_RE.harm;return fill(pk(ctx,Fd.HATE[key]),r.A,r.B,c)+fill(pk(ctx,re[per(r.B)]||re.gentle),r.A,r.B,c);}
function hWhy(ctx,r,k){return r.A.name+'は'+r.B.name+'を憎んでいる（敵対・憎悪）'+k;}
add({id:'tie_nw_hate_demean',label:'憎む相手を人前で貶める',cat:'conflict',w:0.7,roles:hateR,run:function(ctx,r){ctx.mod(r.B,r.A,{ten:8,aff: -6});ctx.mod(r.A,r.B,{ten:2});ctx.stress(r.B,6);return{text:hTxt(ctx,'demean',r),why:hWhy(ctx,r,'：貶める')};}});
add({id:'tie_nw_hate_trap',label:'憎む相手を陥れる',cat:'betray',w:0.6,roles:hateR,run:function(ctx,r){ctx.mod(r.B,r.A,{ten:6,trust: -6});ctx.stress(r.B,8);return{cat:'conflict',text:hTxt(ctx,'trap',r),why:hWhy(ctx,r,'：陥れる')};}});
add({
id:'tie_nw_hate_isolate',label:'憎む相手を孤立させる',cat:'conflict',w:0.6,
roles:function(ctx,a,b){var r=hateR(ctx,a,b);return r&&thirds(ctx,r.A,r.B).length?r:null;},
run:function(ctx,r){
var c=ctx.rng.pick(thirds(ctx,r.A,r.B));if(!c)return null;
ctx.mod(c,r.B,{aff: -6,trust: -6});ctx.mod(r.B,c,{ten:3});ctx.stress(r.B,6);
return{with:[c],text:hTxt(ctx,'isolate',r,c),why:hWhy(ctx,r,'：孤立させる（'+c.name+'に陰口を吹き込んだ）')};
}
});
add({
id:'tie_nw_hate_harm',label:'憎しみが危害に変わる',cat:'conflict',w:function(ctx,r){return 0.35*gapK(ctx,r.A,r.B)*(HK.Dark?HK.Dark.f(ctx,'harm'):1);},roles:hateR,
run:function(ctx,r){
var A=r.A,B=r.B,safe= !!HK.SAFE_ON,lv=HK.HateKit?HK.HateKit.level(ctx,A,B):80,gw=gapWhy(ctx,A,B);
if(!safe&&deadly(ctx)&&ctx.kill&&lv>=80&&ctx.rng()<HK.clamp(0.22*gapK(ctx,A,B)*(HK.Dark?HK.Dark.f(ctx,'kill'):1),0,0.7)&& !(HK.Attr&&HK.Attr.spare&&HK.Attr.spare(ctx,B,A))){
ctx.kill(B,A,A.name+'の憎しみに駆られて');
return{cat:'kill',text:fill(pk(ctx,HK.Feud.HATE.harmKill),A,B),why:hWhy(ctx,r,'：憎しみが命を奪った'+gw),mag:60};
}
if(safe|| !deadly(ctx)){ctx.mod(B,A,{ten:14,trust: -8});ctx.stress(B,10);return{text:hTxt(ctx,'threat',r),why:hWhy(ctx,r,'：脅しに出た'+gw),mag:20};}
B.hp=Math.max(1,(B.hp||100)-30);ctx.mod(B,A,{ten:20,aff: -15,trust: -15});ctx.stress(B,18);
return{cat:'combat',text:hTxt(ctx,'harm',r),why:hWhy(ctx,r,'：危害を加えた'+gw),mag:35};
}
});
function guR(ctx,a,b){var r=dir(ctx,a,b,'benefactor',function(t){return t.feel==='guilt';});return r?{A:r.A,K:r.B}:null;}
var GU={
refuse:L('{a}が何気なく頼みごとを口にすると、{b}は考えるより先に「やる｜やろう｜やります」と答えていた。|{a}は{b}に、少し無理のある用事を頼んだ。{b}は一瞬ためらい、それでも引き受けた。|{b}は自分の分を後回しにして、{a}に頼まれたことを先に片づけた。'),
refuseRe:P9({
proud:'{b}「……借りがあるからな。断れるわけねえだろ」',stern:'{b}「恩を受けた身だ。断る理由はない」――そう言い切る声が、わずかに固かった。',
tsun:'{b}「べ、別に恩返しとかじゃないし！　……でも、やるけど」',gentle:'{b}は笑顔で引き受けた。断るという選択肢は、最初から{b}の中になかった。',
devoted:'{b}「{a}の頼みなら、何だって。……あの日のこと、忘れてないから」',cool:'{b}は損得を考えかけて、やめた。{a}への借りは、計算できるものではなかった。',
free:'{b}は「いいよー」と軽く答えた。軽く答えなければ、重さに押しつぶされそうだった。',shy:'{b}は小さく頷いた。「……わ、私でよければ」――断る言葉は、喉に引っかかったままだった。',
polite:'{b}「承知いたしました。ご恩に報いる機会をいただき、ありがとうございます」'
}),
obey:L('{a}の判断が間違っていると、{b}には分かっていた。それでも、{b}は口をつぐんだ。|{b}は{a}に反対しようとして、言葉を飲み込んだ。救われた日のことが、頭をよぎった。|{a}が危ない方へ進もうとしたとき、{b}は止めずに黙ってついていった。'),
obeyRe:P9({
proud:'{b}は奥歯を噛みしめた。「……あんたに逆らえるかよ」',stern:'{b}は黙って頭を下げた。恩人に意見するのは、{b}にとって裏切りと同じだった。',
tsun:'{b}「わ、私が口出しすることじゃないし……」――言いたいことは山ほどあった。',gentle:'{b}は困ったように微笑んで、何も言わなかった。{a}を困らせるくらいなら、自分が困るほうがよかった。',
devoted:'{b}「{a}がそう決めたなら、私はついていく」――それが本心なのか、{b}にも分からなかった。',cool:'{b}は反論を三つ用意して、一つも口にしなかった。',
free:'{b}は「ま、いっか」と笑った。本当は、少しもよくなかった。',shy:'{b}は何か言いかけて、俯いた。恩人の前では、どうしても声が出なかった。',
polite:'{b}「仰せのままに」――その一言を口にするたび、{b}の胸に小さな棘が増えていった。'
}),
guilt:L('{b}は{a}の背中を見ながら、あの日のことを思い出していた。あのとき助けられなければ、自分はここにいなかった。|{a}に礼を言われるたび、{b}は居心地が悪くなった。礼を言うべきなのは、いつだって自分のほうだった。|{b}は{a}に何か返せたためしがない、と思っていた。返しても返しても、借りは減らなかった。'),
guiltRe:P9({
proud:'{b}「……いつか、まとめて返す。それまでは、借りっぱなしだ」',stern:'{b}は心の中で、恩の重さを数え直した。数えるたびに、少しだけ重くなった。',
tsun:'{b}「恩とか、そういうの、重いんだってば……」――呟いた声は、誰にも届かなかった。',gentle:'{b}は小さく息をついた。「私、{a}に何をしてあげられるんだろう」',
devoted:'{b}は胸の前で手を握った。この命は、もう半分{a}のものだと思っていた。',cool:'{b}は自分の中の罪悪感を、冷静に眺めた。理屈では片づかない感情だった。',
free:'{b}は「借りっぱなしって性に合わないんだよね」と笑った。笑いながら、目を伏せた。',shy:'{b}は{a}と目が合うと、申し訳なさそうに俯いた。',
polite:'{b}「このご恩は、一生かけてもお返しできそうにありません」'
})
};
function guWhy(r,k){return r.K.name+'は恩人の'+r.A.name+'に負い目がある'+k;}
add({id:'tie_nw_gu_refuse',label:'恩人の頼みを断れない',cat:'help',w:0.7,roles:guR,run:function(ctx,r){ctx.mod2(r.A,r.K,{trust:2},{trust:2,ten:2});ctx.stress(r.K,3);return{text:fill(pk(ctx,GU.refuse),r.A,r.K)+fill(pk(ctx,GU.refuseRe[per(r.K)]),r.A,r.K),why:guWhy(r,'：頼みを断れない')};}});
add({id:'tie_nw_gu_obey',label:'負い目から恩人に逆らえない',cat:'bond',w:0.5,roles:guR,run:function(ctx,r){ctx.mod(r.K,r.A,{ten:3});ctx.stress(r.K,4);return{text:fill(pk(ctx,GU.obey),r.A,r.K)+fill(pk(ctx,GU.obeyRe[per(r.K)]),r.A,r.K),why:guWhy(r,'：逆らえない')};}});
add({id:'tie_nw_gu_guilt',cat:'bond',w:0.5,roles:guR,run:function(ctx,r){ctx.mod(r.K,r.A,{trust:2,ten:1});ctx.stress(r.K,2);return{text:fill(pk(ctx,GU.guilt),r.A,r.K)+fill(pk(ctx,GU.guiltRe[per(r.K)]),r.A,r.K),why:guWhy(r,'：罪悪感')};}});
function osR(ctx,a,b){var r=dir(ctx,a,b,'fond',function(t){return t.mode==='oshi';});return r?{O:r.A,S:r.B}:null;}
var OS={
cheer:L('{a}は{b}が何かをやり遂げるたびに、誰よりも大きな拍手を送った。|{a}は{b}が手こずっているのを見て、少し離れたところから小さく拳を握った。「がんばれ……！｜＝｜がんばってください……！」|{a}は{b}のいいところを、聞かれてもいないのに熱く語っていた。'),
cheerRe:P9({
proud:'{a}「見たか今の！　やっぱ{b}は格が違うんだよ！」',stern:'{a}は表情を崩さないまま、心の中で何度も頷いていた。――さすがだ。',
tsun:'{a}「べ、別にファンとかじゃないし！　……でも、今のはちょっとかっこよかった」',gentle:'{a}は目を輝かせて、そっと手を合わせた。「{b}、すごいなあ……」',
devoted:'{a}は胸の前で両手を組んだ。「{b}が笑ってくれるなら、それだけで生きていける」',cool:'{a}は冷静を装いながら、{b}の動きを一つ残らず目に焼きつけていた。',
free:'{a}は「{b}最高ー！」と叫んで、視線を浴びても気にしなかった。',shy:'{a}は物陰から、こっそり小さく手を振った。{b}が気づかなくても、それでよかった。',
polite:'{a}「本日の{b}様も、たいへん尊うございました」'
}),
gift:L('{a}は{b}の好物を、名前も書かずにそっと{b}の荷物の上に置いた。|{a}は{b}が疲れていそうなのを見て、飲み物を差し入れた。「これ、よかったら……！｜＝｜これ、よかったらどうぞ……！」|{a}は自分の分を削ってでも、{b}への差し入れを欠かさなかった。'),
giftRe:P9({
proud:'{b}「お、気が利くじゃん」――その一言で、{a}はその日一日を幸せに過ごした。',stern:'{b}は短く「助かる」と言った。{a}にとって、それは何よりの勲章だった。',
tsun:'{b}「べ、別に欲しかったわけじゃないけど。……ありがと」',gentle:'{b}は嬉しそうに笑った。「ありがとう、{a}」――名前を呼ばれて、{a}は固まった。',
devoted:'{b}は丁寧に礼を言い、お返しに何かできないかと{a}に訊いた。{a}は首が取れそうなほど横に振った。',cool:'{b}は差し入れを確かめて、「ちょうど欲しかった」と頷いた。{a}は小さく拳を握った。',
free:'{b}は「えっ、これ私に？　やったー！」と喜んだ。{a}は、その笑顔だけで報われた。',shy:'{b}は驚いたように目を瞬かせて、小さく頭を下げた。{a}も同じくらい赤くなっていた。',
polite:'{b}「お心遣い、ありがとうございます」――{b}の丁寧な礼に、{a}は思わず背筋を伸ばした。'
}),
watch:L('{a}は{b}から少し離れた場所に陣取って、ずっとその姿を見守っていた。近づきすぎないのが、{a}の決まりだった。|{a}は今日の{b}の様子を、手帳に細かく書き留めた。どこかに書き残さずにはいられなかった。|{a}は端末を握りしめて、「今日の{b}、尊すぎた」と書き込んだ。届くかどうかは、どうでもよかった。'),
watchRe:P9({
proud:'{a}「推しは遠くから見るもんなんだよ。分かってねえな」',stern:'{a}は距離を保ったまま、静かに見守り続けた。それが礼儀だと思っていた。',
tsun:'{a}「み、見てないし！　たまたま視界に入ってるだけ！」',gentle:'{a}は{b}が笑うたびに、自分のことのように微笑んだ。',
devoted:'{a}は{b}の一日が無事に終わるよう、そっと祈った。',cool:'{a}は観察記録を更新した。「本日も異常なし。尊い」',
free:'{a}は一人でにやにやしながら、何度も{b}のほうを振り返った。',shy:'{a}は{b}と目が合いそうになるたび、慌てて物陰に隠れた。',
polite:'{a}は遠くから深々と一礼した。{b}は気づいていなかった。'
}),
freeze:L('{b}が不意に{a}に話しかけた。「ねえ、いつもありがとう｜いつも、ありがとう｜いつも、ありがとうございます」{a}は、その場で石のように固まった。|{b}に名前を呼ばれた瞬間、{a}は手に持っていたものを全部落とした。|{b}が隣に座った。{a}は息の仕方を忘れた。'),
freezeRe:P9({
proud:'{a}「お、おう……！　あ、いや、どういたしまして……っす」',stern:'{a}は背筋を伸ばしたまま、ひと言も発せなかった。耳だけが真っ赤だった。',
tsun:'{a}「な、ななな何でもないから！　話しかけないで、心臓に悪い！」',gentle:'{a}はふわふわした声で「は、はい……」と答え、そのあと自分が何を言ったか覚えていなかった。',
devoted:'{a}は感極まって、言葉の代わりに何度も頷いた。目尻に涙がにじんでいた。',cool:'{a}は平静を装って「どうも」と返し、{b}が去ってから壁に額をつけてうずくまった。',
free:'{a}は「えっ、えっ、本物？」と口走ってから、自分で自分の口を押さえた。',shy:'{a}は顔を真っ赤にして、その場から逃げ出した。',
polite:'{a}「も、もったいないお言葉でございます……！」――声が裏返っていた。'
})
};
function osWhy(r,k){return r.O.name+'にとって'+r.S.name+'は推し'+k;}
add({id:'tie_nw_os_cheer',label:'推しを陰から応援する',cat:'bond',w:0.6,roles:osR,run:function(ctx,r){ctx.mod2(r.O,r.S,{aff:2},{aff:1});return{text:fill(pk(ctx,OS.cheer),r.O,r.S)+fill(pk(ctx,OS.cheerRe[per(r.O)]),r.O,r.S),why:osWhy(r,'：応援する')};}});
add({id:'tie_nw_os_gift',label:'推しに差し入れをする',cat:'help',w:0.5,roles:osR,run:function(ctx,r){ctx.mod2(r.O,r.S,{aff:2},{aff:3,trust:2});return{text:fill(pk(ctx,OS.gift),r.O,r.S)+fill(pk(ctx,OS.giftRe[per(r.S)]),r.O,r.S),why:osWhy(r,'：差し入れ')};}});
add({id:'tie_nw_os_watch',label:'推しを遠くから見守る',cat:'bond',w:0.5,roles:osR,run:function(ctx,r){ctx.mod(r.O,r.S,{aff:2});return{text:fill(pk(ctx,OS.watch),r.O,r.S)+fill(pk(ctx,OS.watchRe[per(r.O)]),r.O,r.S),why:osWhy(r,'：遠くから見守る')};}});
add({id:'tie_nw_os_freeze',label:'推しに話しかけられて固まる',cat:'bond',w:0.5,roles:osR,run:function(ctx,r){ctx.mod2(r.O,r.S,{aff:3,ten:1},{aff:2});return{text:fill(pk(ctx,OS.freeze),r.O,r.S)+fill(pk(ctx,OS.freezeRe[per(r.O)]),r.O,r.S),why:osWhy(r,'：話しかけられて固まる')};}});
var MAIN_T= /^(lover|mate|fated|honmei|spouse|fiance)$/;
function mainOf(ctx,x,not){
var best=null;
ctx.chars.forEach(function(c){if(best||c===x||c===not)return;if(ctx.pair(x,c).couple||T().all(ctx,x,c).some(function(t){return MAIN_T.test(t.type)&&(t.type!=='honmei'||t.a===x.i);}))best=c;});
return best;
}
function miR(ctx,a,b){
var t=has(ctx,a,b,'fwb');if(!t||t.mode!=='mistress')return null;
var pf=ctx.pair(a,b);if(pf.miCut!=null||pf.couple)return null;
if(!both(a,b)||(HK.Pos&& !HK.Pos.okSex(a,b)))return null;
var ma=mainOf(ctx,a,b),mb=mainOf(ctx,b,a);
var Y=mb&& !ma?b:ma&& !mb?a:ctx.chars[t.b]===b?b:a,X=Y===a?b:a;
return{X:X,Y:Y,M:mainOf(ctx,Y,X)};
}
var MI={
secret:L('{a}と{b}は、人目のある場所では目も合わせなかった。二人の関係は、誰にも知られてはならなかった。|{b}は{a}への連絡を、いつもすぐに消した。{a}はそれを知っていて、何も言わなかった。|{a}と{b}は、わざと別々の方向から同じ場所へ向かった。並んで歩くことは、一度もなかった。'),
secretRe:P9({
proud:'{a}「こそこそすんのは性に合わねえんだがな」――それでも、{a}は約束を守った。',stern:'{a}は感情を表に出さなかった。秘密を守ることも、この関係の決まりの一つだった。',
tsun:'{a}「べ、別に隠されても平気だし。……慣れてるし」',gentle:'{a}は寂しさを笑顔の下にしまった。{b}を困らせたくはなかった。',
devoted:'{a}は{b}の立場を守るためなら、自分がいないふりをすることも厭わなかった。',cool:'{a}「割り切った関係だ。表に出す必要はない」――そう言う声は、少しだけ乾いていた。',
free:'{a}は「スパイごっこみたいで楽しいね」と笑った。半分は強がりだった。',shy:'{a}は誰かの視線を感じるたび、びくりと肩を震わせた。',
polite:'{a}は人前では{b}を他人行儀に呼んだ。その呼び方が、いちばん{a}の胸を締めつけた。'
}),
found:L('{c}は、{a}と{b}が人目を避けて言葉を交わしているところを見てしまった。二人のあいだの空気は、ただの知り合いのものではなかった。|{b}の持ち物から、{a}の字で書かれた走り書きが落ちた。拾い上げた{c}の顔色が変わった。|{c}は{b}に問いただした。「{a}とは、どういう関係なの｜{a}とは、どういう関係なんだ｜{a}とは、どういう関係なんですか」{b}は答えに詰まった。'),
foundRe:P9({
proud:'{b}「……見られちまったか。言い訳はしねえよ」',stern:'{b}は目を閉じ、しばらくしてから言った。「事実だ。責めは私が負う」',
tsun:'{b}「ち、違うの！　……違わない、けど」',gentle:'{b}は青ざめて、何度も「ごめん」と繰り返した。誰に謝っているのか、自分でも分からなかった。',
devoted:'{b}は{a}をかばうように前に出た。「悪いのは私だけ。{a}は関係ない」',cool:'{b}は表情を変えずに言った。「否定はしない。……ただ、今は話せない」',
free:'{b}は「あはは、バレちゃった？」と笑ったが、その声はひどく乾いていた。',shy:'{b}は真っ白な顔で立ち尽くし、何も言えなかった。',
polite:'{b}「……弁解の余地もございません」'
}),
cut:L('{b}は{a}を呼び出し、目を見ずに切り出した。「もう、終わりにしよう｜＝｜もう、終わりにしましょう」|{a}は{b}に、これ以上待つのはやめると告げた。本命のもとへ帰っていく背中を、もう見送りたくなかった。|{b}は{a}の手に、手切れのつもりの品を握らせた。{a}はそれを、黙って突き返した。'),
cutRe:P9({
proud:'{a}「……勝手にしろ。最初から、こうなるって分かってたんだ」',stern:'{a}「分かった。だが、私の時間は返してもらえない」',
tsun:'{a}「せ、せいせいするわよ！　……ほんとに、せいせいするんだから」',gentle:'{a}は涙をこらえて頷いた。「{b}が幸せなら、それでいい」',
devoted:'{a}はすがりかけて、やめた。「……最後に、名前を呼んで」',cool:'{a}「妥当な判断だ。……私も、そろそろ潮時だと思っていた」',
free:'{a}は「じゃ、元気でね」と手を振った。振り返らないように、早足で歩き去った。',shy:'{a}は何も言えずに、ただ何度も頷いた。',
polite:'{a}「今までありがとうございました。どうぞ、お幸せに」'
}),
noshow:L('約束の夜、{b}は来なかった。{a}は冷めていく飲み物を前に、一人で夜明けを待った。|{a}は{b}が来るはずの時間を、何度も確かめた。その夜、{b}は本命のそばを離れなかった。|{a}は{b}からの「今夜は無理」という短い知らせを、何度も読み返した。'),
noshowRe:P9({
proud:'{a}「……来ねえなら来ねえって、最初から言えよ」',stern:'{a}は黙って灯りを消した。期待した自分を、少しだけ責めた。',
tsun:'{a}「べ、別に待ってなんかなかったし！」――誰もいない場所で、{a}は膝を抱えた。',gentle:'{a}は「仕方ないよね」と自分に言い聞かせた。それでも、胸の穴は埋まらなかった。',
devoted:'{a}は{b}の席を空けたまま、朝まで座っていた。',cool:'{a}「二番目とは、こういうことだ」――分かっていたはずの事実が、思ったより重かった。',
free:'{a}は「ま、そんな日もあるか」と伸びをした。その夜は、一睡もできなかった。',shy:'{a}は誰にも気づかれないように、声を殺して泣いた。',
polite:'{a}は「承知いたしました」とだけ返した。それ以上の言葉は、書けなかった。'
})
};
function miWhy(r,k){return r.X.name+'は'+r.Y.name+'の愛人'+(r.M?'（'+r.Y.name+'の本命は'+r.M.name+'）':'（'+r.Y.name+'にはほかに本命がいる）')+k;}
add({id:'tie_nw_mi_secret',label:'愛人どうしの秘密の時間',cat:'bond',w:0.6,roles:miR,run:function(ctx,r){ctx.mod2(r.X,r.Y,{trust:2},{trust:2});return{text:fill(pk(ctx,MI.secret),r.X,r.Y)+fill(pk(ctx,MI.secretRe[per(r.X)]),r.X,r.Y),why:miWhy(r,'：秘密の関係')};}});
add({
id:'tie_nw_mi_found',label:'愛人との関係が見つかる',cat:'conflict',w:function(ctx){return 0.5*(HK.Dark?HK.Dark.f(ctx,'cheat'):1);},
roles:function(ctx,a,b){var r=miR(ctx,a,b);return r&& !ctx.pair(a,b).miFound&&thirds(ctx,a,b).length?r:null;},
run:function(ctx,r){
var l=thirds(ctx,r.X,r.Y),c=r.M&&l.indexOf(r.M)>=0?r.M:ctx.rng.pick(l);if(!c)return null;
ctx.pair(r.X,r.Y).miFound=true;
ctx.mod(c,r.Y,{trust: -10,ten:8});ctx.mod(c,r.X,{ten:6});ctx.stress(r.Y,10);
return{with:[c],text:fill(pk(ctx,MI.found),r.X,r.Y,c)+fill(pk(ctx,MI.foundRe[per(r.Y)]),r.X,r.Y,c),why:miWhy(r,'：'+c.name+'に知られた'),mag:24};
}
});
add({id:'tie_nw_mi_cut',label:'愛人に手切れを告げる',cat:'conflict',w:0.4,roles:miR,run:function(ctx,r){ctx.pair(r.X,r.Y).miCut=ctx.stepIndex;ctx.mod2(r.X,r.Y,{ten:10,att: -6},{ten:6});return{text:fill(pk(ctx,MI.cut),r.X,r.Y)+fill(pk(ctx,MI.cutRe[per(r.X)]),r.X,r.Y),why:miWhy(r,'：手切れ'),mag:22};}});
add({id:'tie_nw_mi_noshow',cat:'conflict',w:0.5,roles:miR,run:function(ctx,r){ctx.mod(r.X,r.Y,{ten:5,aff: -2});ctx.stress(r.X,6);return{text:fill(pk(ctx,MI.noshow),r.X,r.Y)+fill(pk(ctx,MI.noshowRe[per(r.X)]),r.X,r.Y),why:miWhy(r,'：会いに来ない夜')};}});
function coR(ctx,a,b){return T()&&T().comrade&&T().comrade(ctx,a,b)&& !T().apathy(ctx,a,b)&& !T().fears(ctx,a,b)?{a:a,b:b}:null;}
var CO={
help:L('{a}は{b}の荷物が重そうなのを見て、何も言わずに半分を持った。仲間なら、それが当たり前だった。|{a}と{b}は、どちらからともなく役目を分け合った。言葉にしなくても、段取りは揃っていた。|{b}が手間取っているのを見て、{a}は自分の手を止めて駆け寄った。「こっちは任せて｜こっちは任せろ｜こちらは任せてください」'),
helpRe:P9({
proud:'{b}「……助かった。借りにしとく」',stern:'{b}は短く頷いた。「感謝する」――それで十分だった。',
tsun:'{b}「べ、別に頼んでないけど！　……ありがと」',gentle:'{b}は柔らかく笑った。「ありがとう。{a}がいてくれてよかった」',
devoted:'{b}「次は、私が{a}を助ける番だね」',cool:'{b}「効率がいい。この分担で行こう」',
free:'{b}は「さっすが！」と{a}の背中を叩いた。',shy:'{b}は小さく「……ありがとう」と言って、照れたように笑った。',
polite:'{b}「恐れ入ります。おかげで助かりました」'
}),
cover:L('{b}が責められかけたとき、{a}が一歩前に出た。「それは仲間みんなで決めたことだ｜それは仲間全員で決めたことだ｜それは仲間みんなで決めたことです」|{a}は{b}の失敗を、自分のことのように引き受けた。仲間の背中は、仲間が守るものだった。|{b}に向かって飛んできたものを、{a}がとっさに払いのけた。'),
coverRe:P9({
proud:'{b}「余計なことすんな。……でも、恩に着る」',stern:'{b}は{a}の横に並んだ。「一人で背負うな。私も責を負う」',
tsun:'{b}「か、かばってなんて頼んでないんだから！」――その声は、少し震えていた。',gentle:'{b}は{a}の袖をそっと握った。「ありがとう。……次は、私が守るね」',
devoted:'{b}は胸がいっぱいになって、しばらく言葉が出なかった。',cool:'{b}「無茶をする。……だが、正しい判断だった」',
free:'{b}は「かっこいいとこ持ってくなあ」と笑って、{a}の肩に腕を回した。',shy:'{b}は目に涙をためて、何度も頭を下げた。',
polite:'{b}「身に余るお気遣い、痛み入ります」'
}),
mourn:L('{a}と{b}は、{c}がよく座っていた場所に、二人で小さな目印を置いた。仲間の数は、一人減ってしまった。|{a}は{c}の名前を口にしかけて、黙った。{b}が、その肩にそっと手を置いた。|{a}と{b}は、{c}の分まで生き延びようと約束した。仲間だった者への、それが二人なりの弔いだった。'),
mournRe:P9({
proud:'{b}「……あいつの分も、きっちり返してやる」',stern:'{b}は目を閉じて、しばらく黙祷した。',
tsun:'{b}「泣いてなんか、ないんだから……」――声が、途中で詰まった。',gentle:'{b}は{a}の隣で、静かに涙を流した。',
devoted:'{b}「{c}のこと、絶対に忘れない」',cool:'{b}「感傷に浸る時間は短くていい。……でも、今だけは」',
free:'{b}は{c}の好きだった歌を、小さく口ずさんだ。',shy:'{b}は何も言えず、{a}の手をぎゅっと握った。',
polite:'{b}「どうか、安らかに」――深く下げた頭は、長いあいだ上がらなかった。'
}),
together:L('{a}と{b}は、示し合わせたように同じ方向へ歩き出した。仲間と動くとき、迷いはなかった。|{a}が合図を送ると、{b}はすぐに意図を読み取って動いた。|{a}と{b}は、見張りと休憩を交代で回した。どちらも、相手の番を疑わなかった。'),
togetherRe:P9({
proud:'{b}「行くぞ。遅れんなよ」',stern:'{b}「段取りどおりだ。問題ない」',
tsun:'{b}「し、仕方ないから一緒に行ってあげる」',gentle:'{b}「{a}と一緒だと、心強いな」',
devoted:'{b}「どこへでもついていくよ」',cool:'{b}「二人のほうが生き残る見込みは上がる。合理的だ」',
free:'{b}「よーし、仲間と一緒なら怖いものなし！」',shy:'{b}は小さく頷いて、{a}のすぐ後ろについた。',
polite:'{b}「お供いたします」'
})
};
function coWhy(a,b,k){return a.name+'と'+b.name+'は同じグループの仲間'+k;}
add({id:'tie_nw_co_help',label:'仲間どうしで助け合う',cat:'help',w:0.6,roles:coR,run:function(ctx,r){ctx.mod2(r.a,r.b,{trust:4,aff:2},{trust:5,aff:3});return{text:fill(pk(ctx,CO.help),r.a,r.b)+fill(pk(ctx,CO.helpRe[per(r.b)]),r.a,r.b),why:coWhy(r.a,r.b,'：助け合い')};}});
add({id:'tie_nw_co_cover',label:'仲間をかばう',cat:'help',w:0.5,roles:coR,run:function(ctx,r){ctx.mod2(r.a,r.b,{trust:3},{trust:7,aff:4});return{text:fill(pk(ctx,CO.cover),r.a,r.b)+fill(pk(ctx,CO.coverRe[per(r.b)]),r.a,r.b),why:coWhy(r.a,r.b,'：庇う')};}});
function deadMate(ctx,a,b){
var pf=ctx.pair(a,b),done=pf.coMourn||{};
return ctx.chars.filter(function(d){return d!==a&&d!==b&&d.alive===false&& !done[d.i]&&T().comrade(ctx,a,d)&&T().comrade(ctx,b,d);})[0]||null;
}
add({
id:'tie_nw_co_mourn',label:'亡くなった仲間を弔う',cat:'bond',w:1.6,
roles:function(ctx,a,b){var r=coR(ctx,a,b);return r&&deadMate(ctx,a,b)?r:null;},
run:function(ctx,r){
var d=deadMate(ctx,r.a,r.b);if(!d)return null;
var pf=ctx.pair(r.a,r.b);pf.coMourn=pf.coMourn||{};pf.coMourn[d.i]=1;
ctx.mod2(r.a,r.b,{trust:5,aff:4},{trust:5,aff:4});
return{text:fill(pk(ctx,CO.mourn),r.a,r.b,d)+fill(pk(ctx,CO.mournRe[per(r.b)]),r.a,r.b,d),why:coWhy(r.a,r.b,'：'+d.name+'を弔う')};
}
});
add({id:'tie_nw_co_together',label:'仲間と一緒に動く',cat:'bond',w:0.5,roles:coR,run:function(ctx,r){ctx.mod2(r.a,r.b,{trust:3,aff:2},{trust:3,aff:2});return{text:fill(pk(ctx,CO.together),r.a,r.b)+fill(pk(ctx,CO.togetherRe[per(r.b)]),r.a,r.b),why:coWhy(r.a,r.b,'：一緒に動く')};}});
function rivalsOf(ctx,a,b){return thirds(ctx,a,b,function(c){var r=ctx.R(b,c);return ctx.pair(b,c).couple||r.att>=45||r.aff>=45;});}
var HM={
lead:L('{a}は{b}と{c}が親しげに笑い合うのを見て、持っていたものを握りつぶした。|{a}は{c}を呼び止め、静かに言った。「{b}に近づかないで。お願いじゃない｜{b}に近づくな。頼んでいるのではない｜{b}に近づかないでください。お願いではありません」|{a}は{b}の前で{c}の悪口をまくし立て、{b}が眉をひそめても止まらなかった。'),
re:P9({
proud:'{a}「{b}の隣は、私の場所だ。誰にも渡さねえ」',stern:'{a}の声は低く、冷え切っていた。「二度は言わない」',
tsun:'{a}「な、なんで{c}なのよ……！　私のほうが、ずっと前から……！」',gentle:'{a}はいつもの笑顔のまま言った。その笑顔が、かえって怖かった。',
devoted:'{a}「{b}のためなら、私、何だってできるんだよ」',cool:'{a}は{c}の弱みを、淡々と並べ立てた。どれも、{b}の前で言うべきことではなかった。',
free:'{a}は笑っていたが、目だけが笑っていなかった。',shy:'{a}は震える声で、それでもはっきり言った。「……{b}を、取らないで」',
polite:'{a}「恐れ入りますが、{b}にはお近づきにならないでいただけますか」'
})
};
add({
id:'tie_nw_honmei',label:'本命への嫉妬が暴走する',cat:'conflict',w:function(ctx,r){var g=HK.Gap?HK.Gap.of(ctx,r.A,r.B):0;return g<0.3?0:0.35*gapK(ctx,r.A,r.B)*(HK.Dark?HK.Dark.f(ctx,'harm'):1);},
roles:function(ctx,a,b){var t=from(ctx,a,b,'honmei');if(!t||ctx.pair(a,b).couple||(HK.Obsess&&HK.Obsess.blocked&&HK.Obsess.blocked(ctx,a,b)))return null;return rivalsOf(ctx,a,b).length?{A:a,B:b}:null;},
run:function(ctx,r){
var l=rivalsOf(ctx,r.A,r.B),c=l.length?ctx.rng.pick(l):null;if(!c)return null;
ctx.mod(r.A,c,{ten:10,aff: -6});ctx.mod(c,r.A,{ten:10});ctx.mod(r.B,r.A,{ten:4});ctx.stress(r.A,6);
return{with:[c],text:fill(pk(ctx,HM.lead),r.A,r.B,c)+fill(pk(ctx,HM.re[per(r.A)]),r.A,r.B,c),why:r.A.name+'の本命は'+r.B.name+'：嫉妬が暴走した'+gapWhy(ctx,r.A,r.B),mag:22};
}
});
var BL={
lead:L('{a}は{b}に近づく{c}を、{b}の見ていないところで呼び止めた。「{b}の邪魔をしないで。{b}には、私がいれば十分だから｜{b}の邪魔をするな。{b}には、私がいれば十分だ｜{b}の邪魔をしないでください。{b}には、私がいれば十分ですから」|{a}は{c}が{b}に渡そうとしたものを、途中で取り上げて捨てた。|{a}は{b}の予定を一つずつ書き換え、{c}と顔を合わせる機会をすべて消していった。'),
re:P9({
proud:'{c}「……は？　何様のつもりだよ」',stern:'{c}は{a}を見据えた。「{b}が決めることだ。お前ではない」',
tsun:'{c}「な、なによそれ……！　{b}はあんたのものじゃないでしょ！」',gentle:'{c}は困ったように眉を下げ、それ以上{b}に近づくのをやめた。',
devoted:'{c}は唇を噛んだ。それでも、{b}を心配する気持ちは消えなかった。',cool:'{c}は肩をすくめて引き下がったが、{a}の行動を一つ残らず覚えておいた。',
free:'{c}は「こわっ」と笑ったが、本気でぞっとしていた。',shy:'{c}は怯えたように後ずさり、何も言えなかった。',
polite:'{c}「……承知しました。ですが、{b}にはお伝えします」'
})
};
function nearB(ctx,a,b){return thirds(ctx,a,b,function(c){return ctx.R(b,c).aff>=25;});}
add({
id:'tie_nw_blind',label:'盲信する相手から人を遠ざける',cat:'conflict',w:function(ctx,r){var g=HK.Gap?HK.Gap.of(ctx,r.A,r.B):0;return g<0.3?0:0.3*gapK(ctx,r.A,r.B);},
roles:function(ctx,a,b){var t=from(ctx,a,b,'blind');return t&&nearB(ctx,a,b).length?{A:a,B:b}:null;},
run:function(ctx,r){
var l=nearB(ctx,r.A,r.B),c=l.length?ctx.rng.pick(l):null;if(!c)return null;
ctx.mod(c,r.A,{ten:12,aff: -8});ctx.mod(c,r.B,{aff: -3});ctx.mod(r.A,r.B,{trust:2});
return{with:[c],text:fill(pk(ctx,BL.lead),r.A,r.B,c)+fill(pk(ctx,BL.re[per(c)]),r.A,r.B,c),why:r.A.name+'は'+r.B.name+'を盲信している：近づく'+c.name+'を排除した'+gapWhy(ctx,r.A,r.B),mag:20};
}
});
TN.TEXT={AP:AP,FR:FR,FI:FI,DEP:DEP,HL:HL,GU:GU,OS:OS,MI:MI,CO:CO,HM:HM,BL:BL};
})();
});
;
/* ==== js/rel-group.js ==== */
HK.Load.def(14,'js/rel-group.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK|| !HK.COMMON)return;
function L(s){return s.split('|');}
function R(ctx,a,b){return ctx.R(a,b);}
function couple(ctx,a,b){return!!(a&&b&&a!==b&&ctx.pair(a,b).couple);}
function loveOk(a,b){return!!(a&&b&&a!==b&&HK.canLove(a,b)&&HK.canLove(b,a)&& !(HK.ngPair&&HK.ngPair(a,b)));}
function here(ctx){return ctx.present?ctx.present():ctx.chars;}
function friendly(ctx,a,b){return R(ctx,a,b).aff>15&&R(ctx,a,b).ten<35;}
function rot(ctx,b,n){return((ctx.stepIndex||0)+(b?b.i:0))%n;}
function loverOf(ctx,b,not,ok){var ls=HK.Poly&&HK.Poly.lovers?HK.Poly.lovers(ctx,b):here(ctx).filter(function(c){return c!==b&&couple(ctx,b,c);});var hs=here(ctx);ls=ls.filter(function(c){return c!==not&&hs.indexOf(c)>=0&&(!ok||ok(c));});return ls.length>1?ls[rot(ctx,b,ls.length)]:ls[0]||null;}
function d4(t,d){return t.replace(/\{d\}/g,d?d.name:'');}
var TX={
cheer:L('{a}は、{b}と{c}が並んでいるのを見て、わざとらしく咳払いした。「はいはい、仲がよろしいことで｜やれやれ、仲がよろしいことだ｜はいはい、仲がよろしいことですね」――{b}は赤くなり、{c}は笑って{b}の肩を抱き寄せた。|{a}「{b}、{c}のこと、ちゃんと大事にしなよ｜{b}、{c}のことを、ちゃんと大事にしろ｜{b}さん、{c}さんのこと、ちゃんと大事にしてくださいね」――{b}は照れくさそうに頷いた。{c}は聞こえないふりをしていたが、耳まで赤かった。|{a}は{b}と{c}のために、こっそり二人分の飲み物を用意しておいた。「たまには二人でゆっくりしなよ｜たまには二人でゆっくりしろ｜たまには二人でゆっくりしてください」|{a}は{b}と{c}をからかいながら、二人の間の席をそっと空けてやった。{b}と{c}は顔を見合わせて、少しだけ肩を寄せた。'),
koibana:L('{a}は{b}にだけ、{c}のことが気になっていると打ち明けた。{b}は目を輝かせた。「え、いいじゃん。応援する｜ほう、いいじゃないか。応援する｜え、いいですね。応援します」|{b}「で、{c}とはどうなの？｜で、{c}とはどうなんだ？｜で、{c}さんとはどうなんですか？」――{a}は慌てて否定したが、{b}にはもうお見通しだった。|{a}と{b}は、夜更けまで恋の話をした。{c}の名前が出るたび、{a}は顔を伏せた。|{b}は{a}の背中を軽く叩いた。「{c}、絶対あなたのこと見てるって。次、話しかけてみなよ｜{c}は、絶対にあなたを見ている。次、話しかけてみろ｜{c}さん、絶対あなたのことを見ていますよ。次、話しかけてみてください」'),
match:L('{a}は「ちょっと用事を思い出した｜少し用事を思い出した｜ちょっと用事を思い出しました」と言って席を立ち、{b}と{c}を二人きりにした。去り際、{a}は{b}に小さく目配せした。|{a}は{b}と{c}を同じ見張りの番に組ませた。二人がぎこちなく話し始めるのを見て、{a}は満足そうに頷いた。|{a}「{c}、{b}が話したいことあるって｜{c}、{b}が話したいことがあるそうだ｜{c}さん、{b}さんが話したいことがあるそうです」――{b}は{a}を睨んだが、{c}は優しく笑って「何？｜何だ？｜何ですか？」と聞き返した。|{a}は{b}と{c}が二人になれるよう、ほかの人たちをさりげなく別の用事に誘い出した。'),
double:L('{a}と{b}、{c}と{d}は、二組並んで食事を囲んだ。誰がいちばん惚気るかで、ささやかな言い合いになった。|{a}と{b}は、{c}と{d}を誘って四人で過ごした。帰り道、二組の歩く速さは自然と同じになっていた。|{c}と{d}の小さな喧嘩の仲裁を、{a}と{b}が買って出た。結局、四人で笑って終わった。|{a}が{b}の世話を焼くのを見て、{c}は{d}の顔をちらりと見た。{d}は黙って{c}の手を取った。'),
bless:L('{a}は{b}と{c}に向かって、まっすぐに言った。「おめでとう。……二人なら、きっと大丈夫｜おめでとう。……二人なら、きっと大丈夫だ｜おめでとうございます。……二人なら、きっと大丈夫です」――胸の痛みは、言ってしまえば少しだけ軽くなった。|{a}は、{b}が{c}の隣で笑っているのを見て、ようやく踏ん切りがついた。{a}「{c}、{b}のこと泣かせたら許さないから｜{c}、{b}を泣かせたら許さない｜{c}さん、{b}さんのことを泣かせたら許しませんから」|{a}は{b}への想いを胸にしまい、二人の背中を押すことにした。「ほら、行ってきなよ｜ほら、行ってこい｜ほら、行ってきてください」')
};
function ev(o){HK.addTo(HK.COMMON,o);}
ev({
id:'grp_cheer',label:'恋人どうしを冷やかして応援する',cat:'bond',scope:'pair',
when:function(ctx,a,b){var c=loverOf(ctx,b,a);return!!c&& !couple(ctx,a,b)&&friendly(ctx,a,b)&&friendly(ctx,a,c);},
w:function(){return 0.2;},
run:function(ctx,a,b){
var c=loverOf(ctx,b,a);
ctx.mod2(b,c,{att:3,aff:2},{att:3,aff:2});ctx.mod2(a,b,{aff:2},{aff:3,trust:2});
return{with:[c],text:ctx.t(ctx.pick(TX.cheer),a,b,c),why:a.name+'が、恋人どうしの'+b.name+'と'+c.name+'を冷やかして応援した（仲良し）',mag:10};
}
});
function crushOf(ctx,a,not){return here(ctx).filter(function(c){return c!==a&&c!==not&&R(ctx,a,c).att>35&& !couple(ctx,a,c)&&loveOk(a,c);}).sort(function(x,y){return R(ctx,a,y).att-R(ctx,a,x).att;})[0]||null;}
ev({
id:'grp_koibana',label:'友人に片想いを打ち明ける',cat:'bond',scope:'pair',
when:function(ctx,a,b){return!couple(ctx,a,b)&&friendly(ctx,a,b)&&friendly(ctx,b,a)&& !!crushOf(ctx,a,b);},
w:function(ctx,a){return 0.3+a.tr.honesty*0.2;},
run:function(ctx,a,b){
var c=crushOf(ctx,a,b);
ctx.mod(a,c,{att:3});ctx.mod2(a,b,{trust:4,aff:2},{trust:3,aff:2});
return{with:[c],text:ctx.t(ctx.pick(TX.koibana),a,b,c),why:a.name+'が'+b.name+'に、'+c.name+'への想いを打ち明けた（恋バナ・仲良し）',mag:8};
}
});
ev({
id:'grp_match',label:'気になる二人を二人きりにする',cat:'bond',scope:'pair',
when:function(ctx,a,b){var c=crushOf(ctx,b,a);return!!c&&R(ctx,c,b).att>20&&friendly(ctx,a,b)&&a.tr.np+a.tr.fc>0.8;},
w:function(){return 0.2;},
run:function(ctx,a,b){
var c=crushOf(ctx,b,a);
ctx.mod2(b,c,{att:4,trust:3},{att:4,trust:3});ctx.mod(b,a,{trust:3});
return{with:[c],text:ctx.t(ctx.pick(TX.match),a,b,c),why:a.name+'が、'+b.name+'と'+c.name+'を二人きりにした（仲良し）',mag:10};
}
});
function otherCouple(ctx,a,b){
var P=here(ctx);
for(var i=0;i<P.length;i++)for(var j=i+1;j<P.length;j++){
var c=P[i],d=P[j];
if([a,b].indexOf(c)<0&&[a,b].indexOf(d)<0&&couple(ctx,c,d))return[c,d];
}
return null;
}
ev({
id:'grp_double',label:'二組でダブルデート',cat:'bond',scope:'pair',
when:function(ctx,a,b){return couple(ctx,a,b)&& !!otherCouple(ctx,a,b);},
w:function(){return 0.2;},
run:function(ctx,a,b){
var cd=otherCouple(ctx,a,b),c=cd[0],d=cd[1];
ctx.mod2(a,b,{att:2,aff:2},{att:2,aff:2});ctx.mod2(c,d,{att:2,aff:2},{att:2,aff:2});
[[a,c],[a,d],[b,c],[b,d]].forEach(function(p){ctx.mod2(p[0],p[1],{aff:2,trust:2},{aff:2,trust:2});});
return{with:[c,d],text:ctx.t(d4(ctx.pick(TX.double),d),a,b,c),why:a.name+'と'+b.name+'、'+c.name+'と'+d.name+'の二組で過ごした（ダブルデート・仲良し）',mag:10};
}
});
ev({
id:'grp_bless',label:'想いをしまって二人を祝福する',cat:'bond',scope:'pair',
when:function(ctx,a,b){var c=loverOf(ctx,b,a);return!!c&&R(ctx,a,b).att>35&& !couple(ctx,a,b)&&a.tr.np>0.45&& !(a.flags&&a.flags.blessed===b.i);},
w:function(ctx,a){return 0.3+a.tr.np*0.3;},
run:function(ctx,a,b){
var c=loverOf(ctx,b,a);
a.flags.blessed=b.i;
ctx.mod(a,b,{att: -15,aff:4});ctx.mod2(a,c,{aff:6,ten: -6},{aff:6,trust:5});ctx.mod(b,a,{trust:6,aff:4});
return{with:[c],text:ctx.t(ctx.pick(TX.bless),a,b,c),why:a.name+'は'+b.name+'への想いを胸にしまい、'+c.name+'との仲を祝福した（祝福・仲良し）',mag:14};
}
});
var TRIO={
morning:L('朝、{h}と{x}と{y}は、誰が先に顔を洗うかで少しだけ揉めた。結局いつもの順番に落ち着いて、三人とも小さく笑った。|{h}がいちばんに起きて、三人分の湯を沸かした。{x}は寝ぼけたまま{y}の肩にもたれ、{y}はそれを押し返さずに、{h}から湯気の立つカップを受け取った。|朝の支度の順番は、いつの間にか決まっていた。{x}が先に起きて{h}を揺り起こし、{h}が{y}の寝癖を直してやる。誰も口には出さないが、三人とも気に入っていた。|{y}が寝坊した朝、{h}と{x}は顔を見合わせて、二人がかりで毛布を剥がした。{y}は文句を言いながら、二人に挟まれて笑っていた。'),
errand:L('{h}と{x}と{y}は、三人で{shop}出かけた。{h}が先を歩き、{x}と{y}は荷物を半分ずつ持って、どちらが{h}の好きなものを先に見つけるかで盛り上がっていた。|{x}が「それは要らない｜＝｜それは要りません」と言い、{y}が「要る｜＝｜要ります」と言い、{h}が「両方にしよう｜＝｜両方にしましょう」と笑った。三人の{errand}は、いつも少しだけ荷物が多くなる。|{h}が重いほうの荷物に手を伸ばすと、{x}と{y}が同時にそれを取り上げた。三人で笑い合いながら、帰り道は自然と同じ歩幅になった。'),
bed:L('夜、三人は寝る位置で少しだけ揉めた。結局{h}が真ん中になり、{x}と{y}が両側から{h}の手を握った。|{x}が「今日は端でいい｜＝｜今日は端でいいです」と言うと、{y}も「じゃあ反対の端｜では反対の端だ｜じゃあ、反対の端にします」と笑った。真ん中の{h}は、二人の体温に挟まれてすぐに眠ってしまった。|寝床に入ると、{h}の右に{x}、左に{y}。いつの間にか決まった並びだった。灯りを消したあと、三人のうち誰かが小さく「おやすみ」と言い、残りの二人が同時に返した。')
};
var SHOP={zombie:['物資を探しに','物資探し'],island:['食べられるものを集めに','食料集め'],whiteroom:['差し入れの箱を開けに','差し入れの仕分け'],_:['買い出しに','買い出し']};
var TRIO_WHY={morning:'朝の順番',errand:'三人の買い出し',bed:'寝る位置'};
function trioOf(ctx,a,b){
var PY=HK.Poly;if(!PY|| !PY.groupOf)return null;
var g=PY.groupOf(ctx,a,true);
if(!g||g.members.length!==3||g.members.indexOf(b.i)<0|| !PY.harmonious(ctx,g))return null;
var m=g.members.map(function(i){return ctx.chars[i];});
if(!m.every(function(c){return HK.State?HK.State.here(c):c.alive;}))return null;
var h=g.hub!=null?ctx.chars[g.hub]:a,o=m.filter(function(c){return c!==h;});
return{h:h,x:o[0],y:o[1],g:g};
}
ev({
id:'grp_trio_day',label:'三人の恋人の何気ない一日',cat:'bond',scope:'pair',
when:function(ctx,a,b){return!!trioOf(ctx,a,b)&&ctx.flags.trioDayAt!==ctx.stepIndex;},
w:function(ctx,a){return 0.22+a.tr.np*0.15+a.tr.fc*0.1;},
run:function(ctx,a,b){
var t=trioOf(ctx,a,b),k=ctx.pick(['morning','errand','bed']),sh=SHOP[ctx.scen&&ctx.scen.id]||SHOP._;
ctx.flags.trioDayAt=ctx.stepIndex;
[[t.h,t.x],[t.h,t.y],[t.x,t.y]].forEach(function(p){ctx.mod2(p[0],p[1],{aff:3,trust:3},{aff:3,trust:3});});
ctx.stress(t.h,-6);ctx.stress(t.x,-6);ctx.stress(t.y,-6);
var text=ctx.pick(TRIO[k]).replace(/\{h\}/g,t.h.name).replace(/\{x\}/g,t.x.name).replace(/\{y\}/g,t.y.name).replace(/\{shop\}/g,sh[0]).replace(/\{errand\}/g,sh[1]);
var others=[t.h,t.x,t.y].filter(function(c){return c!==a;});
return{with:others.filter(function(c){return c!==b;}),text:text,why:t.h.name+'・'+t.x.name+'・'+t.y.name+'の、'+TRIO_WHY[k]+'（恋人たち・三人で円満・仲良し）',mag:10};
}
});
var PANG={
lead:L('{h}が{y}の髪についた埃を払ってやるのを、{x}は少し離れたところから見ていた。|{y}が{h}の肩にもたれて眠っている。{x}はその寝顔を見て、胸の奥がちくりとした。|{h}と{y}が二人だけで笑い合う声が、{x}の耳に届いた。何の話なのかは、聞こえなかった。'),
react:{
proud:L('{x}は舌打ちして、{h}の空いているほうの腕をわざと掴んだ。「……こっちも空いてるだろ」――{h}は笑って、{x}の頭を乱暴に撫でた。|{x}「別に妬いてねえよ。……ただ、次は私の番だからな」――{y}が吹き出し、{h}は二人の肩をまとめて抱いた。|{x}はわざと大きな音を立てて二人の間に座り込んだ。{y}は苦笑して少し詰め、{h}は{x}の背中を軽く叩いた。'),
stern:L('{x}は黙って目を伏せた。自分で選んだ形だ、と言い聞かせる。その横顔に気づいた{h}が、何も言わずに{x}の手を握った。|{x}「……気にしていない」――そう言った声が少し硬かったのを、{y}は聞き逃さなかった。{y}は{x}の隣に移って、肩を並べた。|{x}は小さく息を吐いた。妬く資格がないとは思わない。ただ、口に出すのは性に合わなかった。{h}はそれを分かっていて、あとで{x}にだけ温かい茶を淹れた。'),
tsun:L('{x}「べ、別に羨ましくなんかないし！」――{h}が手招きすると、{x}は文句を言いながら、結局いちばん近くに座った。|{x}はぷいと顔を背けた。{y}が「ほら、拗ねてる」と笑うと、{x}は真っ赤になって{y}の腕を叩いた。{h}は二人まとめて抱き寄せた。|{x}「……私だって、そうしてほしいんだけど」――言ってから慌てて口を塞いだ{x}に、{h}と{y}は顔を見合わせて笑った。'),
gentle:L('{x}は胸の痛みに少しだけ驚いて、それから笑った。「二人とも、仲いいね」――{h}は{x}を手招きして、三人分の隙間を作った。|{x}はちくりとした気持ちを、そっと飲み込んだ。気づいた{y}が「{x}もおいで」と呼び、{x}は嬉しそうに輪に入った。|{x}「ちょっと妬けちゃった」――正直に言うと、{h}は笑って{x}の手を取り、{y}も反対の手を取った。'),
devoted:L('{x}は、二人の邪魔をしないように、そっとその場を離れようとした。{h}がその袖を掴んだ。「どこ行くの。{x}もここ」|{x}は自分の胸に手を当てた。羨ましいと思ってしまったことが、少しだけ申し訳なかった。{y}がそれに気づいて、{x}の隣に座り直した。|{x}「……私、わがままかな」――{h}は首を振り、{x}を抱き寄せた。{y}も笑って、二人の背中に腕を回した。'),
cool:L('{x}は自分の中のやきもちを、冷静に眺めた。「……なるほど、これが嫉妬か」――{h}が吹き出し、{y}は「分析しないで」と笑った。|{x}「今の、少し妬けた。報告だけしておく」――{h}は「了解」と言って、{x}の隣に移った。|{x}は表情を変えずに、二人の間に割り込んだ。{y}は苦笑して少しずれ、{h}は{x}の頬を軽くつまんだ。'),
free:L('{x}「ずるーい！　私も！」――{x}が二人の上に飛び込むと、三人まとめて転がった。|{x}はわざとらしく頬をふくらませた。「はいはい、どうせ私は三番目ですよー」――{h}と{y}が同時に「違う」と言って、三人とも笑い出した。|{x}は後ろから{h}と{y}をまとめて抱きしめた。「やきもちの分、ぎゅーってする」'),
shy:L('{x}は何も言えずに、膝を抱えた。それに気づいた{h}が、黙って隣に座った。{y}も反対側に座り、{x}は二人に挟まれて、やっと顔を上げた。|{x}は少しだけ唇を噛んだ。……羨ましい、なんて言えない。そう思っていたら、{y}が{x}の手をそっと握った。|{x}「あ、あの……私も、そこ、入っていい……？」――消え入りそうな声に、{h}と{y}は同時に頷いた。'),
polite:L('{x}は姿勢を正して、小さく咳払いをした。「……お二人とも、お楽しそうで何よりです」――{h}は笑って、{x}の手を引いた。|{x}「少々、妬けてしまいました。お恥ずかしい」――{y}が「正直でよろしい」と笑い、{x}の席を空けた。|{x}は胸のざわめきを、丁寧に言葉にした。「私も、混ぜていただけますか」――{h}と{y}は顔を見合わせて、もちろん、と頷いた。')
}
};
ev({
id:'grp_trio_pang',label:'三人の恋人の小さなやきもち',cat:'bond',scope:'pair',
when:function(ctx,a,b){return!!trioOf(ctx,a,b)&&ctx.flags.trioPangAt!==ctx.stepIndex;},
w:function(ctx,a){return 0.26+a.tr.jealous*0.4;},
run:function(ctx,a,b){
var t=trioOf(ctx,a,b),x=a,o=[t.h,t.x,t.y].filter(function(c){return c!==x;}),h=t.h!==x?t.h:o[0],y=o.filter(function(c){return c!==h;})[0];
ctx.flags.trioPangAt=ctx.stepIndex;
ctx.mod(x,y,{ten:3});ctx.mod2(x,h,{att:2,aff:2},{aff:3});ctx.mod2(x,y,{aff:1},{aff:2});
var P0=HK.Poly&&HK.Poly.per?HK.Poly.per(x):'gentle';
var text=(ctx.pick(PANG.lead)+ctx.pick(PANG.react[P0]||PANG.react.gentle)).replace(/\{h\}/g,h.name).replace(/\{x\}/g,x.name).replace(/\{y\}/g,y.name);
return{with:[h,y].filter(function(c){return c!==b;}),text:text,why:x.name+'は、'+h.name+'と'+y.name+'が仲よくしているのを見て、少しやきもちを焼いた（恋人たちの三人・嫉妬）',mag:10};
}
});
if(HK.Poly&&HK.Poly.EVENTS)HK.Poly.EVENTS.forEach(ev);
var G=HK.RelGroup={};
G.L=L;G.couple=couple;G.loveOk=loveOk;G.here=here;G.friendly=friendly;G.loverOf=loverOf;G.otherCouple=otherCouple;
function isHere(ctx,c){return here(ctx).indexOf(c)>=0;}
function tieHas(ctx,a,b,t){return!!(HK.Ties&&HK.Ties.has&&ctx.ties&&HK.Ties.has(ctx,a,b,t));}
G.pairOk=function(ctx,b,c){
if(!b|| !c||b===c|| !isHere(ctx,b)|| !isHere(ctx,c)|| !loveOk(b,c))return false;
var pf=ctx.pair(b,c);
if(pf.kin||(!pf.couple&&(HK.lockOut(b,c)||HK.lockOut(c,b))))return false;
return ctx.romanceOk([b,c]);
};
G.mutualOf=function(ctx,b,not){
return here(ctx).filter(function(c){
if(c===b||c===not||couple(ctx,b,c)|| !G.pairOk(ctx,b,c))return false;
var pf=ctx.pair(b,c);
if(pf.rejected!=null||(HK.Poly&& !HK.Poly.canCouple(ctx,b,c)))return false;
return R(ctx,b,c).att>30&&R(ctx,c,b).att>18&&R(ctx,c,b).ten<40;
}).sort(function(x,y){return R(ctx,b,y).att-R(ctx,b,x).att;})[0]||null;
};
G.crushOf=function(ctx,b,not){
return here(ctx).filter(function(c){
if(c===b||c===not||couple(ctx,b,c)|| !G.pairOk(ctx,b,c))return false;
if(ctx.pair(b,c).rejected!=null||(HK.Poly&& !HK.Poly.canCouple(ctx,b,c)))return false;
return R(ctx,b,c).att>35;
}).sort(function(x,y){return R(ctx,b,y).att-R(ctx,b,x).att;})[0]||null;
};
G.partnerOf=function(ctx,b,not){return loverOf(ctx,b,not,function(c){return G.pairOk(ctx,b,c);});};
G.loveOf=function(ctx,b,not){return G.partnerOf(ctx,b,not)||G.mutualOf(ctx,b,not);};
G.thirdOk=function(ctx,a,b,c){
if(!a|| !b|| !c||a===b||a===c|| !isHere(ctx,a))return false;
if(couple(ctx,a,b)||couple(ctx,a,c))return false;
if(R(ctx,a,b).att>40||R(ctx,a,c).att>40)return false;
if(['apathy','fear'].some(function(t){return tieHas(ctx,a,b,t)||tieHas(ctx,a,c,t);}))return false;
return friendly(ctx,a,b)&&R(ctx,a,c).ten<40&&R(ctx,a,c).aff> -5;
};
G.stage=function(ctx,b,c){var pf=ctx.pair(b,c);return pf.couple?(pf.night?'bound':'couple'):'mutual';};
G.rel=function(ctx,a,b){
if(tieHas(ctx,a,b,'best'))return'best';
if(tieHas(ctx,a,b,'buddy'))return'buddy';
if(['sibling','sibclose','sibprot','sibbad'].some(function(t){return tieHas(ctx,a,b,t);}))return'sib';
if(tieHas(ctx,a,b,'childhood'))return'childhood';
if(tieHas(ctx,a,b,'classmate'))return'classmate';
if(tieHas(ctx,a,b,'senpai'))return'senpai';
return'';
};
G.per=function(c){return HK.Poly&&HK.Poly.per?HK.Poly.per(c):'gentle';};
G.byPer=function(ctx,o,c){return ctx.pick(o[G.per(c)]||o.gentle);};
G.fill=function(ctx,t,a,b,c,d,e){return ctx.t(t.replace(/\{d\}/g,d?d.name:'').replace(/\{e\}/g,e?e.name:''),a,b,c);};
G.once=function(ctx,id,list){var k='grp1_'+id+'_'+list.map(function(c){return c.i;}).sort(function(x,y){return x-y;}).join('-');if(ctx.flags[k])return false;return true;};
G.mark=function(ctx,id,list){ctx.flags['grp1_'+id+'_'+list.map(function(c){return c.i;}).sort(function(x,y){return x-y;}).join('-')]=1;};
G.fourth=function(ctx,a,b,c){return here(ctx).filter(function(d){return d!==a&&G.thirdOk(ctx,d,b,c)&&friendly(ctx,d,a);})[0]||null;};
G.REL={
best:L('親友の{b}のことなら、{a}は誰よりもよく分かっていた。|親友の頼みを、{a}が断るはずもなかった。'),
buddy:L('相棒の一大事に、{a}は迷わなかった。|背中を預け合ってきた相棒のためなら、{a}は何だってするつもりだった。'),
sib:L('{sib:a→b}の恋となれば、{a}も放ってはおけなかった。|{a}は、{sib:a→b}の{b}のこんな顔を、初めて見た気がした。'),
childhood:L('幼い頃から{b}を知っている{a}には、{b}の気持ちが手に取るように分かった。|幼馴染の{a}は、{b}の考えていることくらい、とっくにお見通しだった。'),
classmate:L('同じ教室で机を並べてきた仲だ。{a}は、{b}のことを放っておけなかった。|同級生のよしみで、{a}は{b}の話に最後まで付き合うことにした。')
};
G.relLead=function(ctx,a,b){var k=G.rel(ctx,a,b),t=G.REL[k];if(!t)return'';var x=ctx.pick(t);return HK.Sib?HK.Sib.fill(x,a,b,null,ctx):x;};
G.CHEER={
proud:L('{a}「うじうじしてないで、さっさと言っちゃえ。{c}だって待ってるかもしれない｜うじうじしていないで、さっさと言え。{c}だって待っているかもしれない｜うじうじしていないで、早く言ってしまってください。{c}さんも待っているかもしれません」|{a}は{b}の背中を乱暴に叩いた。「当たって砕けたら、私が拾ってやる。行ってこい｜＝｜当たって砕けたら、私が拾います。行ってきてください」'),
stern:L('{a}「中途半端がいちばんよくない。伝えるなら、まっすぐ伝えて｜中途半端がいちばんよくない。伝えるなら、まっすぐに伝えろ｜中途半端がいちばんよくありません。伝えるなら、まっすぐに伝えてください」|{a}は腕を組んで頷いた。「{c}は誠実な相手だ。誠実に向き合えば、ちゃんと応えてくれる｜{c}は誠実な相手だ。誠実に向き合えば、きちんと応えてくれる｜{c}さんは誠実な人です。誠実に向き合えば、きちんと応えてくれます」'),
tsun:L('{a}「べ、別に応援してるわけじゃないけど……{b}がうじうじしてると、見ててイライラするだけ｜別に応援しているわけではない。{b}がうじうじしていると、見ていて苛立つだけだ｜別に応援しているわけではありません。{b}さんがうじうじしていると、見ていて苛立つだけです」|{a}はそっぽを向いたまま言った。「……うまくいったら、一応、祝ってあげなくもない｜……うまくいったら、一応、祝ってやらなくもない｜……うまくいったら、一応、お祝いしてさしあげなくもありません」'),
gentle:L('{a}「{b}なら大丈夫。{c}も、きっと嬉しいと思う｜{b}なら大丈夫だ。{c}も、きっと喜ぶと思う｜{b}なら大丈夫です。{c}も、きっと喜ぶと思います」|{a}は{b}の手をそっと握った。「どんな結果でも、私はずっと味方だから｜どんな結果でも、私はずっと味方だ｜どんな結果でも、私はずっと味方です」'),
devoted:L('{a}「私にできることなら、何でもする。だから、{b}は笑ってて｜私にできることなら、何でもする。だから{b}は笑っていろ｜私にできることなら、何でもします。ですから、{b}は笑っていてください」|{a}は{b}より緊張した顔で、何度も頷いた。「{b}の幸せが、私の幸せだから。頑張って｜{b}の幸せが、私の幸せだ。頑張れ｜{b}の幸せが、私の幸せです。頑張ってください」'),
cool:L('{a}「客観的に見て、勝算は十分にある。{c}がそっちを見てる回数、数えたから｜客観的に見て、勝算は十分にある。{c}がそちらを見ている回数を数えた｜客観的に見て、勝算は十分にあります。{c}さんがそちらを見ている回数を数えましたから」|{a}は淡々と言った。「迷ってる時間がもったいない。結論は早いほうがいい｜迷っている時間が惜しい。結論は早いほうがいい｜迷っている時間がもったいないです。結論は早いほうがいいです」'),
free:L('{a}「いいね、いいね！ 当たって砕けろ、砕けたら一緒にやけ食い！｜いいじゃないか！ 当たって砕けろ。砕けたら一緒にやけ食いだ！｜いいですね！ 当たって砕けましょう。砕けたら一緒にやけ食いです！」|{a}は{b}の両肩を掴んで揺さぶった。「恋は勢い！ 考える前に動く！｜恋は勢いだ！ 考える前に動け！｜恋は勢いです！ 考える前に動きましょう！」'),
shy:L('{a}「わ、私まで、どきどきしてきた……。でも、{b}なら、きっと大丈夫｜私まで、どきどきしてきた……。だが、{b}なら、きっと大丈夫だ｜わ、私まで、どきどきしてきました……。でも、{b}さんなら、きっと大丈夫です」|{a}は小さな声で、でもはっきり言った。「……がんばって。私、ずっと応援してる｜……頑張れ。私はずっと応援している｜……頑張ってください。私はずっと応援しています」'),
polite:L('{a}「僭越ながら、{b}と{c}はとても似合うと思う｜僭越ながら、{b}と{c}はとても似合いだと思う｜僭越ながら、{b}と{c}はとてもお似合いだと思います」|{a}は{b}に深く頷いてみせた。「心から、うまくいくよう祈ってる｜心から、うまくいくよう祈っている｜心から、うまくいくようお祈りしております」')
};
G.BLESS={
proud:L('{a}「ふん、やっとか。待たせすぎ｜ふん、やっとか。待たせすぎだ｜ふん、やっとですか。待たせすぎです」|{a}は二人を見比べて鼻を鳴らした。「{c}を泣かせたら、私が許さないから｜{c}を泣かせたら、私が許さない｜{c}を泣かせたら、私が許しません」'),
stern:L('{a}「おめでとう。浮かれすぎて、本分を忘れないように｜おめでとう。浮かれすぎて、本分を忘れるな｜おめでとうございます。浮かれすぎて、本分を忘れないようにしてください」|{a}は二人に向かって背筋を伸ばした。「互いを大事にすること。それだけ守れば、文句はない｜互いを大事にすること。それさえ守れば、文句はない｜互いを大事にすること。それさえ守れば、文句はありません」'),
tsun:L('{a}「べ、別に羨ましくなんかないし。……おめでと｜別に羨ましくなどない。……おめでとう｜別に羨ましくなどありません。……おめでとうございます」|{a}はぷいと横を向いた。「せいぜい仲よくすれば？ ……ほんとに、よかったね｜せいぜい仲よくすればいい。……本当に、よかったな｜せいぜい仲よくなさってください。……本当に、よかったですね」'),
gentle:L('{a}「おめでとう。二人が並んでると、なんだかこっちまで嬉しい｜おめでとう。二人が並んでいると、こちらまで嬉しくなる｜おめでとうございます。お二人が並んでいると、こちらまで嬉しくなります」|{a}は目を細めた。「ずっと、こうなればいいなって思ってた｜ずっと、こうなればいいと思っていた｜ずっと、こうなればいいと思っていました」'),
devoted:L('{a}「本当に、本当によかった……！ 私、何でも協力するから｜本当に、本当によかった……！ 私は何でも協力する｜本当に、本当によかったです……！ 私、何でも協力します」|{a}は自分のことのように涙ぐんだ。「二人が幸せなら、私はそれだけで十分｜二人が幸せなら、私はそれで十分だ｜お二人が幸せなら、私はそれだけで十分です」'),
cool:L('{a}「予想より三日遅かった。でも、おめでとう｜予想より三日遅かった。だが、おめでとう｜予想より三日遅かったですね。でも、おめでとうございます」|{a}は表情を変えずに言った。「似合ってる。それだけ伝えておく｜似合っている。それだけは伝えておく｜お似合いです。それだけは伝えておきます」'),
free:L('{a}「やったー！ 今日はお祝いだ、二人のおごりで！｜やった！ 今日は祝いだ。二人のおごりでな！｜やりましたね！ 今日はお祝いです、お二人のおごりで！」|{a}は二人まとめて抱きついた。「おめでとー！ もう、見てるこっちが照れる！｜おめでとう！ 見ているこちらが照れる！｜おめでとうございます！ 見ているこちらが照れます！」'),
shy:L('{a}「お、おめでとう……。な、なんか、私まで顔が熱い｜お、おめでとう……。なぜか、私まで顔が熱い｜お、おめでとうございます……。な、なぜか、私まで顔が熱いです」|{a}はもじもじしながら、小さく拍手をした。「……よかった。ほんとに、よかった｜……よかった。本当に、よかった｜……よかったです。本当に、よかったです」'),
polite:L('{a}「このたびは、おめでとう。心からお祝いする｜このたびは、おめでとう。心から祝う｜このたびは、おめでとうございます。心よりお祝い申し上げます」|{a}は丁寧に頭を下げた。「二人の末永い幸せを、祈ってる｜二人の末永い幸せを、祈っている｜お二人の末永いお幸せを、お祈りしております」')
};
G.COMFORT={
proud:L('{a}「{b}の良さが分からない相手なんて、こっちから願い下げ。次、次｜{b}の良さが分からない相手など、こちらから願い下げだ。次だ｜{b}さんの良さが分からない相手など、こちらから願い下げです。次に行きましょう」|{a}は{b}の頭を乱暴に撫でた。「泣くなら今日だけ。明日からは顔を上げて｜泣くなら今日だけだ。明日からは顔を上げろ｜泣くなら今日だけにしてください。明日からは顔を上げましょう」'),
stern:L('{a}「ちゃんと伝えた。それは、誰にでもできることじゃない｜きちんと伝えた。それは誰にでもできることではない｜きちんと伝えました。それは、誰にでもできることではありません」|{a}は黙って隣に座り、しばらくしてから言った。「逃げずに向き合った{b}を、私は誇りに思う｜＝｜逃げずに向き合った{b}を、私は誇りに思います」'),
tsun:L('{a}「べ、別に心配なんかしてないし。……でも、今日は付き合ってあげる｜別に心配などしていない。……だが、今日は付き合ってやる｜別に心配などしていません。……でも、今日はお付き合いします」|{a}はハンカチを押しつけた。「顔、ひどいことになってる。……ほら、拭いて｜顔がひどいことになっている。……ほら、拭け｜お顔がひどいことになっています。……ほら、拭いてください」'),
gentle:L('{a}「頑張ったね。{b}が頑張ったの、私はちゃんと知ってる｜よく頑張ったな。{b}が頑張ったのは、私がちゃんと知っている｜よく頑張りましたね。{b}が頑張ったのは、私がちゃんと知っています」|{a}は何も言わずに、{b}の背中をゆっくりさすった。「泣いていいよ。誰も笑ったりしない｜泣いていい。誰も笑ったりしない｜泣いていいんですよ。誰も笑ったりしません」'),
devoted:L('{a}「{b}が元気になるまで、ずっとそばにいる｜＝｜{b}が元気になるまで、ずっとおそばにいます」|{a}は{b}以上に泣きそうな顔をしていた。「代われるものなら、私が代わりたい｜＝｜代われるものなら、私が代わりたいです」'),
cool:L('{a}「気持ちに正解はない。今回は、たまたま合わなかっただけ｜気持ちに正解はない。今回は、たまたま合わなかっただけだ｜気持ちに正解はありません。今回は、たまたま合わなかっただけです」|{a}は温かい飲み物を{b}の手に握らせた。「糖分。今はそれでいい｜糖分だ。今はそれでいい｜糖分です。今はそれでいいです」'),
free:L('{a}「よーし、今日はとことん遊ぶよ！ 落ち込む暇なんて作らせないから！｜よし、今日はとことん遊ぶぞ！ 落ち込む暇など作らせない！｜よし、今日はとことん遊びましょう！ 落ち込む暇なんて作らせません！」|{a}は{b}の手を引っ張った。「おいしいもの食べて、たくさん笑って、全部忘れちゃおう！｜うまいものを食べて、たくさん笑って、全部忘れよう！｜おいしいものを食べて、たくさん笑って、全部忘れましょう！」'),
shy:L('{a}「あ、あの……うまく言えないけど、{b}は、すごく素敵だと思う｜……うまく言えないが、{b}はとても素敵だと思う｜あ、あの……うまく言えませんけど、{b}さんは、とても素敵だと思います」|{a}はそっと{b}の袖をつまんだ。「……頼りないかもしれないけど、そばにいる｜……頼りないかもしれないが、そばにいる｜……頼りないかもしれませんけど、そばにいます」'),
polite:L('{a}「よく、勇気を出したね。心から尊敬する｜よく勇気を出した。心から尊敬する｜よく、勇気を出されましたね。心から尊敬いたします」|{a}は{b}に温かいお茶を差し出した。「今は、自分を労わって｜今は、自分を労わってくれ｜今は、どうかご自分を労わってください」')
};
G.turnedDown=function(ctx,b){return ctx.chars.filter(function(x){return x!==b&&ctx.pair(b,x).rejected===b.i;})[0]||null;};
if(HK.Poly&&HK.Poly.hookTieRel)HK.Poly.hookTieRel();
})();
});
;
/* ==== js/rel-core-extra.js ==== */
HK.Load.def(15,'js/rel-core-extra.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK|| !HK.buildPool|| !HK.TIES)return;
function L(s){return s.split('|');}
var GROUP={classmate:'classmate',friend:'friend',best:'friend',childhood:'childhood',sibling:'sib',sibclose:'sib',stepsib:'sib',parent:'parent',pparent:'parent',boss:'boss',mentor:'mentor',ex:'ex'};
function here(c){return!!c&&(HK.State?HK.State.here(c):c.alive!==false)&& !(c.flags&&c.flags.caged!=null);}
function find(ctx,a,b,g){
var l=HK.Ties?HK.Ties.all(ctx,a,b):[];
for(var i=0;i<l.length;i++){
var t=l[i],D=HK.TIES[t.type];
if(D&&GROUP[t.type]===g)return{t:t,D:D,side:D.dir?(t.a===a.i?'A':'B'):''};
}
return null;
}
function label(r){return HK.tieLabel?HK.tieLabel(r.t):r.D.label;}
function whyOf(a,b,r,w){
var role=r.side?'（'+a.name+'が'+(r.side==='A'?r.D.roleA:r.D.roleB)+'）':'';
if(r.side&&HK.Sib&&HK.Sib.isSibTie(r.t)){var w0=HK.Sib.rel(b,a,{tie:r.t});if(w0&&w0!=='きょうだい')role='（'+a.name+'が'+w0+'）';}
return a.name+'と'+b.name+'は'+label(r)+role+'：'+w;
}
function tagsOf(x){var m= /^\[([^\]]+)\]/.exec(x);return m?m[1].split(','):null;}
function strip(x){return x.replace(/^\[[^\]]+\]/,'');}
function lines(ctx,D,o,a,b){
var U=ctx._rcUsed||(ctx._rcUsed={});
return o.T.filter(function(x){
if(U[x])return false;
var tg=tagsOf(x);
return!tg||tg.some(function(k){return D.tag(ctx,a,b,k);});
});
}
function egoW(a,mood){var t=a.tr||{};return mood==='rub'?0.7+(t.cp||0)*0.4+(t.fc||0)*0.3:0.7+(t.np||0)*0.5+(t.a||0)*0.2;}
function rcOf(ctx,a,b){var pf=ctx.pair(a,b);return pf._rc||(pf._rc={at:{},n:{},last: -99});}
function kgW(ctx,a,b,g,mood){
if(g!=='parent'&&g!=='sib')return 1;
var r=find(ctx,a,b,g),kg=r&&r.t.kg;
if(!kg)return 1;
return kg==='bad'?(mood==='rub'?1.8:0.35):(mood==='rub'?0.4:1.6);
}
var D={};
var RC=HK.RelCore={D:D,find:find};
function nameOf(w){return String(w||'').replace(/（[^（）]*）$/,'').replace(/\{sibs?(?::[^}]*)?\}/g,'きょうだい');}
function make(sid,g,o){
var S=D[sid],id='tie_rc_'+sid+'_'+g+'_'+o.k;
return{
id:id,label:o.label||nameOf(o.why),cat:o.cat,scope:'pair',noOdd:true,
when:function(ctx,a,b){
if(!b|| !here(a)|| !here(b))return false;
var r=find(ctx,a,b,g);
if(!r||(o.side&&r.side!==o.side))return false;
if(o.need&& !o.need(ctx,a,b,r))return false;
var q=rcOf(ctx,a,b);
if(q.last===ctx.stepIndex)return false;
if(q.at[o.k]!=null&&ctx.stepIndex-q.at[o.k]<S.gap)return false;
if((q.n[o.k]||0)>=S.max)return false;
return lines(ctx,S,o,a,b).length>0;
},
w:function(ctx,a,b){return(o.w||1)*S.w*egoW(a,o.mood)*kgW(ctx,a,b,g,o.mood);},
run:function(ctx,a,b){
var r=find(ctx,a,b,g),ok=lines(ctx,S,o,a,b);
if(!r|| !ok.length)return null;
var x=ctx.pick(ok),q=rcOf(ctx,a,b);
ctx._rcUsed[x]=1;q.at[o.k]=ctx.stepIndex;q.n[o.k]=(q.n[o.k]||0)+1;q.last=ctx.stepIndex;
var fx=o.fx||(o.mood==='rub'?[{ten:4,aff:1},{ten:5}]:[{aff:4,trust:4},{aff:4,trust:4}]);
ctx.mod2(a,b,fx[0],fx[1]);
if(o.st){ctx.stress(a,o.st[0]);ctx.stress(b,o.st[1]);}
var t=ctx.t(strip(x),a,b);
if(S.fill)t=S.fill(ctx,t,a,b);
if(g==='mentor'&&HK.Ties&&HK.Ties.mentorWord)t=HK.Ties.mentorWord(t,ctx.chars[r.t.a],ctx.chars[r.t.b]);
var w=whyOf(a,b,r,o.why);
if(HK.Sib)w=HK.Sib.fill(w,a,b,null,ctx);
return{text:t,why:w};
}
};
}
var POOL={};
function scen(sid,conf,G){
D[sid]=conf;conf.G=G;
var list=POOL[sid]=[];
Object.keys(G).forEach(function(g){G[g].forEach(function(o){list.push(make(sid,g,o));});});
}
RC.POOL=POOL;
HK.wrap(HK,'buildPool',function(bp0){return function(sc){
var p=bp0.apply(this,arguments),x=sc&&POOL[sc.id];
if(sc&&D[sc.id]&&D[sc.id].install&& !sc._rcInstalled){sc._rcInstalled=true;D[sc.id].install(sc);}
if(!x)return p;
var ex=sc.exclude||[];
return p.concat(x.filter(function(e){return ex.indexOf(e.id)<0;}));
};});
scen('classroom',{w:2.0,gap:3,max:2,tag:function(ctx,a,b,k){return k===ctx.label;}},{
classmate:[
{k:'again',cat:'bond',mood:'rub',why:'前の学年から続く張り合い（からかい）',fx:[{ten:3,aff:2},{ten:3,aff:2}],T:L(
'[4月]クラス名簿を見た{a}は、また{b}の名前があるのを見つけてため息をついた。{a}「これで何年連続？｜これで何年連続だ｜これで何年連続ですか」{b}「数えてるの、あなただけ｜数えているのは、あなただけだ｜数えているの、あなただけですよ」――そう言う{b}も、指を折って数えていた。|'+
'[5月,12月]テストが返ってきた日、{a}と{b}は、前の学年からつけている勝ち負けの表を見せ合った。{b}「今回で、私の勝ち越し｜今回で、私の勝ち越しだ｜今回で、私の勝ち越しです」{a}「去年の分を足したら、まだ私が上｜去年の分を足せば、まだ私が上だ｜去年の分を足したら、まだ私が上です」|'+
'{a}は、新しくクラスに来た子に、{b}の去年の失敗談を話して聞かせた。{b}「ずっと同じクラスだと、こういうのが困る｜ずっと同じクラスだと、こういうのが困る｜ずっと同じクラスだと、こういうのが困ります」{a}「お互いさま｜お互いさまだ｜お互いさまです」')},
{k:'know',cat:'help',mood:'warm',why:'ずっと同じクラスだった気安さ（仲良し）',st:[-3,-6],T:L(
'[6月]体育祭の朝、{a}は{b}が去年と同じように緊張で青くなっているのに気づいて、去年と同じ飴を渡した。{b}「覚えてたんだ｜覚えていたのか｜覚えていたんですね」{a}「毎年のことだから｜毎年のことだからな｜毎年のことですから」|'+
'{a}は、新しいクラスになじめずにいる{b}の隣の席に、いつの間にか移ってきていた。{a}「同じクラスの古株どうし｜同じクラスの古株どうしだ｜同じクラスの古株どうしです」{b}は少し笑って、教科書を二人のあいだに広げた。|'+
'[3月]学年の終わり、{a}と{b}は、来年もまた同じクラスになるかどうかで賭けをした。{b}「負けたら、また一年、隣の席｜負ければ、また一年隣の席だ｜負けたら、また一年、隣の席です」{a}「それ、どっちが負けても同じでしょ｜それは、どちらが負けても同じだろう｜それ、どちらが負けても同じでしょう」')}
],
parent:[
{k:'meddle',side:'A',cat:'conflict',mood:'rub',why:'学校での口出し（すれ違い）',T:L(
'授業参観の日、{a}は教室のいちばん後ろから、{b}が当てられるたびに小さく頷いていた。休み時間、{b}は廊下で{a}をつかまえた。{b}「頷くのやめて。目立つから｜頷くのはやめろ。目立つ｜頷くのはやめてください。目立ちますから」{a}「つい｜＝｜つい、です」――{b}は額を押さえたが、怒りきれなかった。|'+
'[7月,12月]三者面談で、担任が{b}の進路を尋ねた。{b}が口を開く前に、{a}が答えていた。{b}「私の進路なんだけど｜私の進路なのだが｜私の進路なんですけど」{a}「……ごめん。先に聞くべきだった｜……すまない。先に聞くべきだった｜……ごめんなさい。先に聞くべきでした」帰り道、二人はしばらく黙って並んで歩いた。|'+
'{a}は廊下で{b}の制服の襟に手を伸ばした。{b}「もう子供じゃないんだけど｜もう子供ではないのだが｜もう子供じゃないんですけど」{a}「知ってる。でも、曲がってたから｜知っている。だが、曲がっていた｜知っています。でも、曲がっていましたから」――{b}は文句を言いながら、襟はそのまま直させた。|'+
'[5月,12月]テストの結果を見た{a}は、{b}の答案を廊下で広げようとした。{b}「ここで見ないで。家で見せるから｜ここで見るな。家で見せる｜ここで見ないでください。家で見せますから」{a}「家だと、あなたは隠すでしょ｜家だと、あなたは隠すだろう｜家だと、あなたは隠すでしょう」図星だった。|'+
'[6月]体育祭の観覧席から、{a}が{b}の名前を大声で呼んだ。走り終えた{b}は真っ赤な顔で戻ってきた。{b}「名前、呼ばないでって言ったよね｜名前は呼ぶなと言ったはずだ｜名前は呼ばないでって言いましたよね」{a}「呼ばなかったら、もっと大きい声が出てた｜呼ばなければ、もっと大きな声が出ていた｜呼ばなかったら、もっと大きな声が出ていました」')},
{k:'care',side:'B',cat:'help',mood:'warm',why:'子から親への気遣い（仲良し）',st:[-4,-8],T:L(
'放課後、{a}は校門の前で{b}を待っていて、重そうな紙袋を黙って半分持った。{b}「重くないのに｜重くはないのだが｜重くないんですよ」{a}「知ってる。持ちたいだけ｜知っている。持ちたいだけだ｜知っています。持ちたいだけです」――{b}はそれ以上何も言わず、歩く速さを{a}に合わせた。|'+
'[10月]文化祭の日、{a}は{b}を自分のクラスの出し物に案内した。{a}「この看板、私が描いた｜この看板は私が描いた｜この看板、私が描いたんです」{b}は看板の前で立ち止まり、何枚も写真を撮った。{a}は恥ずかしがるふりをして、撮り終わるまで隣に立っていた。|'+
'[3月]学年の終わり、{a}は通知表を家に着く前に{b}へ渡した。{a}「一年、心配かけた｜一年、心配をかけた｜一年、心配をかけました」{b}は通知表を開く前に、{a}の顔を見て笑った。{b}「それは、親の仕事だから｜それは親の仕事だ｜それは、親の仕事ですから」|'+
'{a}は、{b}が作った弁当を教室でいちばん先に開けた。周りにからかわれても、蓋は閉じなかった。夕方、{a}は{b}に短く言った。{a}「おいしかった。明日も｜うまかった。明日も頼む｜おいしかったです。明日もお願いします」{b}は返事のかわりに、空の弁当箱を受け取って軽く振った。')}
],
sib:[
{k:'bicker',cat:'conflict',mood:'rub',why:'学校でもいつもの口げんか（すれ違い）',T:L(
'昼休みの購買で、{b}が{a}の狙っていた最後のパンをさらっていった。{a}「それ、私が先に見てた｜それは私が先に見ていた｜それ、私が先に見ていたんですけど」{b}「昔からそうでしょ。早い者勝ち｜昔からそうだろう。早い者勝ちだ｜昔からそうでしょう。早い者勝ちです」――{a}は家に帰ったら言いつけてやると決めた。|'+
'[5月,12月]テストの順位が貼り出された。{a}と{b}の名前は、すぐ近くに並んでいた。{a}「家でまた比べられるの、私なんだけど｜家でまた比べられるのは、私なのだが｜家でまた比べられるの、私なんですけど」{b}「知らない。自分で頑張って｜知らん。自分で頑張れ｜知りません。自分で頑張ってください」二人は、目を合わせないまま廊下で別れた。|'+
'{a}は、先生に{b}の名前で呼ばれた。三回目だった。{a}「似てないって、何回言えば分かるんだろう｜似ていないと、何度言えば分かるのだろう｜似ていないって、何回言えば分かるんでしょう」{b}「こっちの台詞｜こちらの台詞だ｜こちらの台詞です」――言い合う声の調子まで、そっくりだった。|'+
'[11月]修学旅行の土産を選ぶ{a}の手元を、{b}がのぞき込んだ。{b}「それ、去年も家に買ってきたやつ｜それは去年も家に買ってきたものだ｜それ、去年も家に買ってきたものですよ」{a}「好きなんだからいいでしょ｜好きなのだからいいだろう｜好きなんですから、いいでしょう」――結局、二人とも同じ箱を一つずつ買った。')},
{k:'back',cat:'help',mood:'warm',why:'学校での{sibs}の助け合い（仲良し）',st:[-3,-8],T:L(
'{a}は、{b}が忘れた体操着を、黙って教室まで届けた。{b}「……助かった｜＝｜……助かりました」{a}「貸しね｜貸しだ｜貸しですよ」――子どものころから、こうして貸し借りを数えてきた。返されたことは、たぶん一度もない。|'+
'[6月]体育祭のリレーで、{a}は{b}からバトンを受け取った。家の前で何度も練習した受け渡しだった。ゴールのあと、{b}がぼそりと言った。{b}「昔のまんまだったね｜昔のままだったな｜昔のままでしたね」{a}は目を合わせずに、拳だけ突き出した。|'+
'{a}は、教室の隅でひとり弁当を広げている{b}の隣に、何も言わずに座った。{a}「家族が一人で食べてるの、見てられないだけ｜家族が一人で食べているのは、見ていられないだけだ｜家族が一人で食べているのは、見ていられないだけです」{b}は「余計なお世話｜余計な世話だ｜余計なお世話です」と言って、卵焼きを一つ{a}の弁当に移した。|'+
'[1月]冬休み明け、{a}は{b}の机に、家に置き忘れていた手袋を置いておいた。{b}がはめると、ポケットに飴が一つ入っていた。{b}「こういうとこ、昔から変わらない｜こういうところは、昔から変わらないな｜こういうところ、昔から変わりませんね」')}
],
childhood:[
{k:'tease',cat:'bond',mood:'rub',why:'教室で昔の話が出る（からかい）',fx:[{ten:3,aff:2},{ten:4,aff:1}],T:L(
'{a}は、教室で{b}を子どものころのあだ名で呼んでしまった。{b}「学校でその呼び方はやめて｜学校でその呼び方はやめろ｜学校でその呼び方はやめてください」{a}「ごめん、つい｜すまない、つい｜ごめんなさい、つい」――近くの席から、くすくす笑う声がした。|'+
'{a}は休み時間、{b}が小学生のころに書いた作文の話をうっかり始めた。{b}「それ以上言ったら、あなたの話もする｜それ以上言えば、あなたの話もする｜それ以上言ったら、あなたの話もしますよ」{a}は慌てて口を閉じた。二人とも、相手の弱みなら山ほど知っていた。|'+
'クラスの誰かに「二人って、どういう関係？」と聞かれて、{a}と{b}は同時に答えた。{a}「家が近いだけ｜家が近いだけだ｜家が近いだけです」{b}「昔からね｜昔からな｜昔からです」――息の合いすぎた返事に、かえって質問攻めにされた。|'+
'[8月]夏祭りの屋台で、{a}は{b}が金魚すくいの前で足を止めたのを見逃さなかった。{a}「一匹も取れなくて、昔ここで泣いたよね｜一匹も取れなくて、昔ここで泣いただろう｜一匹も取れなくて、昔ここで泣きましたよね」{b}「泣いてない｜泣いていない｜泣いていません」――{b}は意地になって、ポイを三枚破った。')},
{k:'always',cat:'help',mood:'warm',why:'昔からの合図と気遣い（仲良し）',st:[-3,-8],T:L(
'朝、{a}は{b}の家の前で、子どものころと同じように待っていた。寝ぐせのまま出てきた{b}が言った。{b}「先に行けばよかったのに｜先に行けばよかったものを｜先に行けばよかったじゃないですか」{a}「一人で行くと、調子が出ない｜一人で行くと、調子が出ない｜一人で行くと、調子が出ないんです」|'+
'{a}は、元気のない{b}の机を、指で二回叩いた。子どものころに二人で決めた「大丈夫か」の合図だった。{b}は少し笑って、三回叩き返した。{a}「話、あとで聞く｜話は、あとで聞く｜お話、あとで聞きます」|'+
'[5月,12月]テスト前、{a}は{b}の苦手な科目のノートを、昔の宿題みたいに丸ごと貸した。{b}「毎回これだね｜毎回これだな｜毎回これですね」{a}「毎回、返してくれないからね｜毎回、返さないからな｜毎回、返してくれませんからね」――言い合いながら、二人は図書室で同じ机についた。|'+
'[4月]始業式の日、{a}はクラス名簿に{b}の名前を見つけて、思わず声を上げた。{b}「また一緒か｜また一緒か｜また一緒ですか」{a}「嫌そうに言わないで｜嫌そうに言うな｜嫌そうに言わないでください」――{b}の口元は、隠しきれずに緩んでいた。')}
],
friend:[
{k:'split',cat:'conflict',mood:'rub',why:'行事での食い違い（すれ違い）',T:L(
'[9月,10月]文化祭の出し物を決める話し合いで、{a}と{b}は別々の案に手を挙げた。{a}「友達なんだから、こっちに入れてくれると思ってた｜友人なのだから、こちらに入れると思っていた｜友達なんですから、こっちに入れてくれると思っていました」{b}「友達だから、本気で選んだんだけど｜友人だから、本気で選んだのだが｜友達だから、本気で選んだんですけど」――その日の帰り道は、少しだけ遠かった。|'+
'{a}は、{b}にだけ話した秘密が、昼休みにはクラスの何人かに知られていたことに気づいた。{b}「言ってない。本当に、私じゃない｜言っていない。本当に、私ではない｜言っていません。本当に、私じゃありません」{a}は信じたかったが、すぐには頷けなかった。|'+
'[11月]修学旅行の班決めで、{b}は{a}ではなく、ほかの子と同じ班になった。{a}「別に、いいけど｜別に、構わない｜別に、いいですけど」{b}「よくない顔してる｜よくない顔をしている｜よくない顔をしていますよ」――{b}は消灯前に、こっそり{a}の部屋まで遊びに来た。|'+
'[6月]体育祭の騎馬戦で、{a}と{b}は敵どうしの組になった。{b}「手加減しないからね｜手加減はしない｜手加減はしませんからね」{a}「こっちの台詞｜こちらの台詞だ｜こちらの台詞です」――本気でぶつかり合ったあと、二人は肩で息をしながら笑った。')},
{k:'study',cat:'help',mood:'warm',why:'友人としての支え（仲良し）',st:[-3,-8],T:L(
'[5月,12月]テスト前の放課後、{a}は{b}の分まで要点をまとめたノートを作ってきた。{b}「これ、徹夜したでしょ｜これは徹夜しただろう｜これ、徹夜しましたよね」{a}「友達が赤点取るの、見たくないだけ｜友人が赤点を取るのは、見たくないだけだ｜友達が赤点を取るのは、見たくないだけです」|'+
'{a}は、授業中にずっとうつむいていた{b}に、購買のパンを一つ放った。{a}「理由は聞かない。食べて｜理由は聞かない。食え｜理由は聞きません。食べてください」{b}は袋を開けながら、小さく「ありがと｜すまない｜ありがとうございます」と言った。|'+
'[6月]体育祭で転んだ{b}のところへ、{a}はいちばんに駆け寄った。{a}「立てる？　肩、貸す｜立てるか。肩を貸す｜立てますか。肩、貸します」{b}「……ゴールまで｜……ゴールまでだ｜……ゴールまで、お願いします」――二人は最後尾で、並んでゴールテープを切った。|'+
'[3月]学年の終わり、{a}は{b}の机に寄せ書きの色紙をそっと置いた。真ん中の、いちばん大きな字は{a}のものだった。{b}「来年も、同じクラスがいい｜来年も、同じクラスがいい｜来年も、同じクラスがいいです」{a}「それ、私が先に書いた｜それは私が先に書いた｜それ、私が先に書きました」')}
],
ex:[
{k:'awk',cat:'conflict',mood:'rub',why:'別れたあとの教室の気まずさ（すれ違い）',fx:[{ten:4},{ten:4}],T:L(
'席替えのくじを引いたら、{a}の隣は{b}だった。教室じゅうの視線が、二人に集まった。{a}「……よろしく｜……よろしく頼む｜……よろしくお願いします」{b}「……こちらこそ｜＝｜……こちらこそ」――机と机のあいだに、きっちり拳一つぶんの隙間が空いた。|'+
'[9月,10月]文化祭の係決めで、{a}と{b}は同じ係になってしまった。{b}「仕事は仕事。ちゃんとやる｜仕事は仕事だ。ちゃんとやる｜仕事は仕事です。ちゃんとやります」{a}「私も、そのつもり｜私も、そのつもりだ｜私も、そのつもりです」――言葉とは裏腹に、二人は目を合わせなかった。|'+
'{a}は、{b}が前に渡したキーホルダーをまだ鞄につけているのに気づいた。{a}「それ、外さないの｜それは外さないのか｜それ、外さないんですか」{b}「気に入ってるだけ。深い意味はない｜気に入っているだけだ。深い意味はない｜気に入っているだけです。深い意味はありません」|'+
'[2月]バレンタインの朝、{a}と{b}は下駄箱の前で鉢合わせた。去年の今日のことを、二人とも覚えていた。{b}「……おはよう｜……おはよう｜……おはようございます」{a}「……うん｜……ああ｜……はい」――それだけで、二人とも足早に教室へ向かった。')},
{k:'easy',cat:'bond',mood:'warm',why:'元恋人どうしの、友人としての距離（仲良し）',T:L(
'{a}は、{b}が落とした消しゴムを拾って渡した。{b}「ありがとう。……前より、話しやすくなった気がする｜すまない。……前より、話しやすくなった気がする｜ありがとうございます。……前より、話しやすくなった気がします」{a}「別れてからのほうが、ちゃんと話せてるかもね｜別れてからのほうが、ちゃんと話せているな｜別れてからのほうが、ちゃんと話せていますね」|'+
'[5月,12月]テスト前、{a}は{b}が苦手だった科目を覚えていて、黙ってノートの一部をコピーして渡した。{b}「よく覚えてたね｜よく覚えていたな｜よく覚えていましたね」{a}「一緒に勉強してたころの癖｜一緒に勉強していたころの癖だ｜一緒に勉強していたころの癖です」|'+
'{a}が友達とけんかをして落ち込んでいると、{b}が隣に来て言った。{b}「あなた、謝るのだけは上手でしょ。大丈夫｜あなたは謝るのだけは上手だろう。大丈夫だ｜あなた、謝るのだけは上手でしょう。大丈夫です」{a}「……それ、褒めてる？｜……それは褒めているのか｜……それ、褒めてますか」二人は、久しぶりに声を出して笑った。|'+
'[3月]学年の終わりの日、{b}は{a}に言った。{b}「付き合ってた一年より、今年のほうが楽しかったかも｜付き合っていた一年より、今年のほうが楽しかった気がする｜付き合っていた一年より、今年のほうが楽しかった気がします」{a}「失礼な。でも、分かる｜失礼だな。だが、分かる｜失礼ですね。でも、分かります」')}
],
boss:[
{k:'habit',side:'B',cat:'bond',mood:'rub',why:'バイト先の上下が教室に出る（からかい）',fx:[{ten:3,aff:2},{ten:2,aff:2}],T:L(
'{a}は教室で{b}に話しかけるとき、バイト先の癖でつい敬語になった。{b}「ここ、学校だよ｜ここは学校だ｜ここ、学校ですよ」{a}「分かってる。でも、口が勝手に｜分かっている。だが、口が勝手に｜分かっています。でも、口が勝手に」――クラスの何人かが、不思議そうに二人を見ていた。|'+
'{a}は、廊下で{b}にすれ違いざまに頭を下げてしまった。{b}「学校では同級生でしょ｜学校では同級生だろう｜学校では同級生でしょう」{a}「店長代理の顔で言われても、説得力がない｜店長代理の顔で言われても、説得力がない｜店長代理の顔で言われても、説得力がないです」|'+
'[5月,12月]テスト期間、{a}は{b}にシフトを減らしてほしいと切り出した。教室で言うと、なぜか面談のような空気になった。{b}「減らすのはいい。点数、ちゃんと取ってきて｜減らすのは構わない。点数はちゃんと取ってこい｜減らすのはいいです。点数、ちゃんと取ってきてくださいね」{a}「……うん｜……分かった｜……はい」')},
{k:'cover',side:'A',cat:'help',mood:'warm',why:'上の立場から下を気遣う（仲良し）',st:[-2,-6],T:L(
'{a}は、バイトの疲れで机に突っ伏している{b}の机に、栄養ドリンクを置いた。{a}「昨日の締め、任せきりにしてごめん｜昨日の締めを任せきりにして、すまない｜昨日の締め、任せきりにしてごめんなさい」{b}「仕事ですから。……って言うと、ここでも敬語になる｜仕事だから。……と言うと、ここでも敬語になる｜仕事ですから。……って言うと、ここでも敬語になりますね」|'+
'[6月]体育祭の朝、{a}は{b}に「今日はシフトのことは忘れて｜今日はシフトのことは忘れろ｜今日はシフトのことは忘れてください」と言った。{b}は笑ってうなずき、その日いちばん大きな声で{a}を応援した。|'+
'{a}は、店で失敗して落ち込んでいた{b}に、教室でこっそり言った。{a}「あの判断は間違ってなかった。責任は私が取る｜あの判断は間違っていなかった。責任は私が取る｜あの判断は間違っていませんでした。責任は私が取ります」{b}は、授業が始まっても少しだけ顔を上げていた。')}
],
mentor:[
{k:'strict',side:'A',cat:'conflict',mood:'rub',why:'学校でも師の顔が出る（すれ違い）',T:L(
'{a}は、教室でも{b}の姿勢を見逃さなかった。{a}「背中が丸い。稽古のときと同じ｜背中が丸い。稽古のときと同じだ｜背中が丸いです。稽古のときと同じです」{b}「ここ、教室なんだけど｜ここは教室なのだが｜ここ、教室なんですけど」{a}「師匠は教室でも師匠｜師は教室でも師だ｜師匠は教室でも師匠です」|'+
'[6月]体育祭の練習で、{a}は{b}の走り方に何度も口を出した。{b}「今日は休みの日じゃなかったの｜今日は休みの日ではなかったのか｜今日はお休みの日じゃなかったんですか」{a}「弟子に休みはあっても、師匠に休みはない｜弟子に休みはあっても、師に休みはない｜弟子に休みはあっても、師匠に休みはありません」|'+
'[5月,12月]テストの点を見た{a}は、{b}にいつもの稽古のように言った。{a}「基本からやり直し｜基本からやり直せ｜基本からやり直しです」{b}「勉強は、師匠の担当じゃないでしょ｜勉強は師の担当ではないだろう｜勉強は、師匠の担当じゃないでしょう」――{b}はそう言いながら、帰りに問題集を一冊買った。')},
{k:'proud',side:'B',cat:'help',mood:'warm',why:'弟子が師を立て、師が認める（仲良し）',fx:[{trust:6,aff:4},{trust:5,aff:4}],T:L(
'[6月]体育祭で一位を取った{a}は、まっさきに観覧席の{b}のほうを見た。{b}は腕を組んだまま、一度だけ深く頷いた。{a}「見てた？｜見ていたか｜見ていましたか」{b}「見ていた。悪くない｜＝｜見ていました。悪くありません」――{a}にとっては、どんな賞状より重い一言だった。|'+
'{a}は、昼休みに{b}の分の茶を淹れて持っていった。{a}「教室でも、これくらいはさせて｜教室でも、これくらいはさせろ｜教室でも、これくらいはさせてください」{b}「……弟子に気を遣われる師匠か｜……弟子に気を遣われる師か｜……弟子に気を遣われる師匠ですか」{b}はそう言って、湯呑みを両手で受け取った。|'+
'[10月]文化祭の舞台で、{a}は{b}に教わったとおりに深呼吸してから幕の前に出た。終わったあと、{b}は短く言った。{b}「教えたことが、全部出ていた｜＝｜教えたことが、全部出ていました」{a}は、その言葉を何度も胸の中で繰り返した。')}
]
});
var TEACH={
parentA:{mood:'rub',cat:'conflict',why:'担任が親（すれ違い）',T:L(
'授業中、{a}は{b}を当てた。家での呼び方が口をついて出かけて、{a}は咳払いで言い直した。{b}「……先生、今の聞こえてた｜……先生、今のは聞こえていたぞ｜……先生、今の、聞こえていましたよ」教室に笑いが広がり、{b}は机に突っ伏した。|'+
'[7月,12月]三者面談の日、{a}は担任の椅子と親の椅子のあいだで立ち止まった。{b}「どっちに座っても、話すことは同じでしょ｜どちらに座っても、話すことは同じだろう｜どちらに座っても、話すことは同じでしょう」{a}は苦笑いして、担任の椅子に座った。面談は、家の食卓より少しだけ堅かった。|'+
'{a}は、{b}の提出物にだけ、ほかの生徒より厳しく赤を入れた。{b}「家族だからって、厳しくしなくていい｜家族だからといって、厳しくしなくていい｜家族だからって、厳しくしなくていいですよ」{a}「家族だから、甘くできない｜＝｜家族だから、甘くできないんです」{b}は口をとがらせたが、赤を全部直して出し直した。')},
parentB:{mood:'warm',cat:'help',why:'担任が親（仲良し）',T:L(
'放課後の職員室の前で、{b}は{a}に缶コーヒーを差し出した。{b}「学校では先生だけど、今は休憩｜学校では先生だが、今は休憩だ｜学校では先生ですけど、今は休憩です」{a}は少し驚いてから、家でしか見せない顔で笑った。|'+
'[3月]最後のホームルームのあと、{b}は誰もいなくなった教室で{a}に頭を下げた。{b}「一年間、担任としても、ありがとう｜一年間、担任としても世話になった｜一年間、担任としても、ありがとうございました」{a}「家ではまだ、親だからね｜家ではまだ、親だからな｜家ではまだ、親ですからね」|'+
'{a}が風邪気味なのに気づいた{b}は、昼休みに保健室でもらってきたのど飴を教卓に置いておいた。{a}は授業の途中でそれを見つけて、黒板のほうを向いたまま一粒口に入れた。')},
sibA:{mood:'rub',cat:'conflict',why:'担任が{sib:b→a}（すれ違い）',T:L(
'{a}は担任の顔で、{b}の遅刻を名簿につけた。{b}「家では起こしてくれたのに｜家では起こしてくれただろう｜家では起こしてくれたじゃないですか」{a}「家は家、学校は学校｜家は家、学校は学校だ｜家は家、学校は学校です」――言い返す声の調子まで、家と同じだった。|'+
'{a}が授業で昔の失敗談を話した。それは、{b}のことだった。{b}「それ、名前出してないだけで私の話でしょ｜それは名前を出していないだけで私の話だろう｜それ、名前を出していないだけで私の話でしょう」{a}は聞こえないふりをして、次の頁に進んだ。|'+
'[5月,12月]テストの採点をしていた{a}は、{b}の答案だけ二回見直した。{b}「家族の答案だけ厳しく見るの、やめて｜家族の答案だけ厳しく見るのは、やめろ｜家族の答案だけ厳しく見るの、やめてください」{a}「甘く見たって言われたくないだけ｜甘く見たと言われたくないだけだ｜甘く見たって言われたくないだけです」')},
sibB:{mood:'warm',cat:'help',why:'担任が{sib:b→a}（仲良し）',T:L(
'{b}は、職員室で残業している{a}に、家から持ってきた弁当を届けた。{b}「どうせ、また食べてないでしょ｜どうせ、また食べていないだろう｜どうせ、また食べていないでしょう」{a}「……先生って呼んで｜……先生と呼べ｜……先生と呼んでください」{b}「はいはい、先生｜分かった、先生｜はいはい、先生」|'+
'{a}は、クラスで浮きかけていた{b}に、ほかの生徒と組む役目をさりげなく回した。帰り道、{b}が言った。{b}「わざとでしょ、あれ｜わざとだろう、あれは｜わざとでしょう、あれ」{a}「担任の仕事。……{sib:b→a}の仕事でもある｜担任の仕事だ。……{sib:b→a}の仕事でもある｜担任の仕事です。……{sib:b→a}の仕事でもあります」|'+
'[3月]修了式の日、{b}は{a}の教卓に、クラスの寄せ書きをいちばんに置いた。{a}は一枚ずつ読んで、最後に{b}の字を見つけると、家でするのと同じ顔で笑った。')}
};
D.classroom.install=function(sc){
var ph0=sc.phase;
sc.phase=function(ctx,s,n){
ph0.apply(this,arguments);
var TS=(ctx.teachers||(ctx.teacher?[ctx.teacher]:[])).filter(here);
if(!TS.length||ctx.env&&ctx.env.tieEv==='off')return;
var cand=[];
TS.forEach(function(t){ctx.present().forEach(function(x){
if(x===t)return;
var r=find(ctx,t,x,'parent')||find(ctx,t,x,'sib');
if(r&&r.t.noev==='off')return;
if(r&&(GROUP[r.t.type]==='sib'||r.side==='A'))cand.push({t:t,x:x,r:r});
});});
if(!cand.length||ctx.rng()>0.35)return;
var c=ctx.rng.pick(cand),t=c.t,x=c.x,r=c.r,k=(GROUP[r.t.type]==='sib'?'sib':'parent')+(ctx.rng()<0.5?'A':'B'),o=TEACH[k];
var ok=lines(ctx,D.classroom,o,t,x);
if(!ok.length){k=k.slice(0,-1)+(k.slice(-1)==='A'?'B':'A');o=TEACH[k];ok=lines(ctx,D.classroom,o,t,x);}
if(!ok.length)return;
var line=ctx.pick(ok);
ctx._rcUsed[line]=1;
ctx.act2({actors:[t,x],cat:o.cat,fx:function(){if(o.mood==='rub')ctx.mod2(t,x,{ten:3},{ten:5,aff:1});else ctx.mod2(t,x,{aff:4,trust:4},{aff:5,trust:4});},
text:ctx.t(strip(line),t,x),why:HK.Sib?HK.Sib.fill(whyOf(t,x,r,o.why),t,x,null,ctx):whyOf(t,x,r,o.why)});
};
};
scen('island',{w:2.0,gap:2,max:2,tag:function(ctx,a,b,k){
if(k==='飢え')return(ctx.food||0)<25||a.hp<70||b.hp<70;
if(k==='嵐')return(ctx.env.storm||0)>45;
if(k==='序盤')return ctx.stepIndex<=2;
if(k==='終盤')return ctx.stepIndex>=(ctx.env.days||8)-2;
return false;
}},{
classmate:[
{k:'rival',cat:'conflict',mood:'rub',why:'学生のころの張り合いが島で出る（すれ違い）',T:L(
'{a}と{b}は、どちらが先に火を起こせるかで張り合った。{b}「林間学校のときも、あなたが先だった。今度は負けない｜林間学校のときも、あなたが先だった。今度は負けない｜林間学校のときも、あなたが先でした。今度は負けません」{a}「あのときは、あなたが薪を湿らせたんでしょ｜あのときは、あなたが薪を湿らせたのだろう｜あのときは、あなたが薪を湿らせたんでしょう」――火がついたのは、ほとんど同時だった。|'+
'{a}は、{b}の小屋の組み方に口を出した。{a}「学生のころの工作と同じ。見た目ばっかり｜学生のころの工作と同じだ。見た目ばかりだ｜学生のころの工作と同じです。見た目ばかりです」{b}「昔の話を持ち出さないで｜昔の話を持ち出すな｜昔の話を持ち出さないでください」――その夜、雨漏りしたのは{b}の小屋のほうだった。|'+
'[飢え]{a}と{b}は、獲れた魚の数で言い合いになった。{b}「点数で張り合ってたころと、何も変わらない｜点数で張り合っていたころと、何も変わらないな｜点数で張り合っていたころと、何も変わりませんね」{a}「変わったよ。今は、負けたら食べる物が減る｜変わった。今は、負ければ食べる物が減る｜変わりました。今は、負けたら食べる物が減るんです」')},
{k:'roll',cat:'help',mood:'warm',why:'同じクラスだった息の合い方（仲良し）',st:[-4,-6],T:L(
'{a}と{b}は、文化祭の準備をしていたころの手順で、拠点づくりを分担した。{a}「設計は私、力仕事はあなた。あのときと同じ｜設計は私、力仕事はあなただ。あのときと同じだ｜設計は私、力仕事はあなた。あのときと同じです」{b}「よく覚えてるね｜よく覚えているな｜よく覚えていますね」――役割が決まると、作業は驚くほど早く進んだ。|'+
'[序盤]浜で目を覚ました{a}は、隣に倒れていたのが{b}だと気づいて、思わず名前を叫んだ。{b}「こういう場で会うと、なんだか変な感じ｜こういう場で会うと、なんだか妙な感じだ｜こういう場で会うと、なんだか変な感じですね」{a}「教室以外で会うの、卒業以来だね｜教室以外で会うのは、卒業以来だな｜教室以外で会うの、卒業以来ですね」――知っている顔が一つあるだけで、足の震えが止まった。|'+
'眠れない夜、{a}と{b}は焚き火のそばで、同じクラスにいた顔ぶれの話をした。{b}「全員の名前、まだ言える？｜全員の名前を、まだ言えるか｜全員の名前、まだ言えますか」{a}は指を折りながら、一人ずつ名前を挙げた。途中で、二人とも少し泣いた。|'+
'[嵐]嵐の夜、{a}は震える{b}の背中を叩いて、昔の担任の口癖を真似た。{a}「『慌てるな、まず点呼』｜『慌てるな、まず点呼』だ｜『慌てるな、まず点呼』です」{b}は吹き出して、それから「……いる｜……いる｜……います」と答えた。')}
],
friend:[
{k:'share',cat:'conflict',mood:'rub',why:'友人どうしの食い違い（すれ違い）',T:L(
'[飢え]{a}は、{b}が自分の分の木の実を少しだけ多く取ったのを見てしまった。{a}「友達だから、言わないでおこうと思った。でも、言う｜友人だから、黙っておこうと思った。だが、言う｜友達だから、言わないでおこうと思いました。でも、言います」{b}は顔を赤くして、黙って木の実を一つ戻した。|'+
'{a}は、{b}が約束した見張りの時間に眠っていたのを見つけた。{a}「交代するって言ったよね｜交代すると言っただろう｜交代するって言いましたよね」{b}「……ごめん。言い訳はしない｜……すまない。言い訳はしない｜……ごめんなさい。言い訳はしません」――{a}は怒りきれずに、そのまま朝まで隣に座っていた。|'+
'{a}は、{b}がひとりで森の深いところへ行こうとするのを止めた。{b}「あなたは、いつも心配しすぎ｜あなたはいつも心配しすぎだ｜あなたは、いつも心配しすぎです」{a}「友達が戻ってこなかったら、私はどうすればいいの｜友人が戻ってこなかったら、私はどうすればいい｜友達が戻ってこなかったら、私はどうすればいいんですか」{b}は足を止めた。')},
{k:'watch',cat:'help',mood:'warm',why:'友人としての支え（仲良し）',st:[-3,-8],T:L(
'{a}は、うなされていた{b}の見張りの番を、黙って代わった。朝になって{b}が言った。{b}「起こしてくれればよかったのに｜起こせばよかったものを｜起こしてくれればよかったのに、と思います」{a}「起こしたら、友達じゃなくなる気がした｜起こせば、友人ではなくなる気がした｜起こしたら、友達じゃなくなる気がしたんです」|'+
'[飢え]{a}は、自分の分の焼き魚を半分に割って、{b}の葉っぱの皿に乗せた。{a}「半分こ。昔から、そうしてきたでしょ｜半分ずつだ。昔から、そうしてきただろう｜半分こです。昔から、そうしてきたでしょう」{b}は文句を言いかけて、やめた。|'+
'{a}は、砂浜に枝で、島を出たら二人で行く店の名前を書き並べた。{b}「全部行ったら、一年かかる｜全部行けば、一年かかる｜全部行ったら、一年かかりますよ」{a}「じゃあ、一年付き合って｜なら、一年付き合え｜じゃあ、一年付き合ってください」――波が来るたびに、二人で書き直した。')}
],
childhood:[
{k:'reckless',cat:'conflict',mood:'rub',why:'幼馴染の無茶を叱る（すれ違い）',T:L(
'{a}は、高い岩から海へ飛び込もうとする{b}の腕をつかんだ。{a}「子どものころ、それで溺れかけたの、忘れたの｜子どものころ、それで溺れかけたのを忘れたか｜子どものころ、それで溺れかけたの、忘れたんですか」{b}「あれは川。ここは海｜あれは川だ。ここは海だ｜あれは川です。ここは海です」{a}「余計に悪い｜余計に悪い｜余計に悪いです」|'+
'{a}は、{b}が食べられるかも分からない茸をかじろうとするのを、手ではたいた。{b}「昔から、あなたは私の口に入るものを見張りすぎ｜昔から、あなたは私の口に入る物を見張りすぎだ｜昔から、あなたは私の口に入るものを見張りすぎです」{a}「昔から、あなたは拾い食いしすぎ｜昔から、あなたは拾い食いしすぎだ｜昔から、あなたは拾い食いしすぎです」|'+
'[嵐]嵐の前、{b}は浜に置いた網を取りに戻ると言い張った。{a}「昔からそう。言い出したら聞かない｜昔からそうだ。言い出したら聞かない｜昔からそうです。言い出したら聞かないんですから」――結局、二人で取りに走り、ずぶ濡れで笑いながら戻った。')},
{k:'beach',cat:'bond',mood:'warm',why:'子どものころの思い出（仲良し）',st:[-4,-6],T:L(
'{a}と{b}は、浜で子どものころと同じ砂の城を作った。{b}「昔は、もっと大きく見えた｜昔は、もっと大きく見えた｜昔は、もっと大きく見えました」{a}「私たちが大きくなっただけ｜私たちが大きくなっただけだ｜私たちが大きくなっただけです」――波が城を崩すまで、二人は黙って眺めていた。|'+
'眠れない夜、{a}は{b}に、子どものころ二人で星座の名前を勝手につけた話をした。{b}「あれ、まだ覚えてる。『大きなおにぎり座』｜あれはまだ覚えている。『大きなおにぎり座』だ｜あれ、まだ覚えています。『大きなおにぎり座』です」――島の空にも、同じ形の星が並んでいた。|'+
'[序盤]見知らぬ浜で目を覚ました{a}は、まず{b}を探した。見つけると、子どものころに迷子になったときと同じように、{b}の袖をつかんだ。{b}「ここにいる。昔と同じ｜ここにいる。昔と同じだ｜ここにいます。昔と同じです」')}
],
sib:[
{k:'food',cat:'conflict',mood:'rub',why:'食料の取り合い（すれ違い）',fx:[{ten:5},{ten:5,aff: -1}],T:L(
'[飢え]焼けた魚が一匹だけ残った。{a}と{b}の手が、同時に伸びた。{a}「昔からそう。最後の一個は、いつもあなたが取る｜昔からそうだ。最後の一つは、いつもあなたが取る｜昔からそうです。最後の一つは、いつもあなたが取るんです」{b}「昔から、あなたは一口が大きい｜昔から、あなたは一口が大きい｜昔から、あなたは一口が大きいんです」――結局、二人で半分ずつ、骨まで残さず食べた。|'+
'{a}は、{b}が寝床にいちばん乾いた草を独り占めしているのに気づいた。{a}「家でも、いい布団はいつもあなただった｜家でも、いい布団はいつもあなただった｜家でも、いい布団はいつもあなたでした」{b}「先に取ったもの勝ちって、教えたのはそっち｜先に取った者が勝ちだと、教えたのはそちらだ｜先に取ったもの勝ちだと教えたのは、そちらです」|'+
'[飢え]{a}が見つけた果物を、{b}は「毒があるかもしれない」と言って先に一口かじった。{a}「毒見のふりして、昔からいちばん甘いところ食べるよね｜毒見のふりをして、昔からいちばん甘いところを食べるな｜毒見のふりをして、昔からいちばん甘いところを食べますよね」{b}は口をもぐもぐさせたまま、答えなかった。')},
{k:'storm',cat:'help',mood:'warm',why:'{sibs}の背中合わせ（仲良し）',st:[-4,-10],T:L(
'[嵐]嵐の夜、{a}と{b}は小屋の中で背中合わせに座った。{b}「子どものころ、雷の夜はいつもこうしてた｜子どものころ、雷の夜はいつもこうしていた｜子どものころ、雷の夜はいつもこうしていましたね」{a}「あのときは、あなたが泣いてた｜あのときは、あなたが泣いていた｜あのときは、あなたが泣いていました」{b}「今も泣きそう｜今も泣きそうだ｜今も泣きそうです」|'+
'{a}は、日焼けで赤くなった{b}の首に、濡らした布を黙って当てた。{b}「頼んでない｜頼んでいない｜頼んでいません」{a}「家に帰ったとき、親に怒られるのは私だから｜家に帰ったとき、親に叱られるのは私だからな｜家に帰ったとき、親に叱られるのは私ですから」|'+
'{a}は、熱を出した{b}のそばで一晩じゅう火を絶やさなかった。朝、目を覚ました{b}は、{a}の目の下の隈を見て言った。{b}「……ありがと。家に帰っても、言わないけど｜……すまない。家に帰っても、言わないが｜……ありがとうございます。家に帰っても、言いませんけど」')}
],
parent:[
{k:'stop',side:'A',cat:'conflict',mood:'rub',why:'親が子の無茶を止める（すれ違い）',T:L(
'{a}は、ひとりで沖の岩場へ泳いでいこうとする{b}を止めた。{b}「もう子供じゃないんだけど｜もう子供ではないのだが｜もう子供じゃないんですけど」{a}「知ってる。それでも止める。親だから｜知っている。それでも止める。親だからな｜知っています。それでも止めます。親ですから」――{b}は舌打ちして、それでも浜に座り直した。|'+
'{a}は、{b}の分の水を自分の分から足そうとして、{b}に手首をつかまれた。{b}「それ、やめて。あなたが倒れたら、私が困る｜それはやめろ。あなたが倒れたら、私が困る｜それ、やめてください。あなたが倒れたら、私が困ります」{a}は手を引っ込めたが、夜のうちにこっそり足しておいた。|'+
'[飢え]{a}は、{b}が生の貝をそのまま口に入れようとするのを、大声で止めた。{b}「みんなの前でそんな声出さないで｜皆の前でそんな声を出すな｜みんなの前でそんな声を出さないでください」{a}「子供のころから、お腹を壊すのはあなたなんだから｜子供のころから、腹を壊すのはあなただろう｜子供のころから、お腹を壊すのはあなたなんですから」')},
{k:'care',side:'B',cat:'help',mood:'warm',why:'子が親を気遣う（仲良し）',st:[-4,-10],T:L(
'{a}は、拠点で横になっている{b}の額に手を当てて、熱がないのを確かめた。{b}「逆でしょ、普通｜逆だろう、普通は｜逆でしょう、普通は」{a}「ここでは、普通なんてない｜ここでは、普通などない｜ここでは、普通なんてありません」――{b}は目を閉じて、しばらく子どもの寝顔を見ていた。|'+
'[飢え]{a}は、獲ったばかりの魚のいちばん脂ののったところを、{b}の皿に乗せた。{b}「それは、あなたが食べて｜それは、あなたが食べろ｜それは、あなたが食べてください」{a}「子供のころ、いつも私にくれたでしょ。今度は私の番｜子供のころ、いつも私にくれただろう。今度は私の番だ｜子供のころ、いつも私にくれたでしょう。今度は私の番です」|'+
'{a}は、{b}が寝ているあいだに、{b}の寝床の屋根を葉で厚くしておいた。朝、{b}が言った。{b}「いつの間に、こんなことができるようになったの｜いつの間に、こんなことができるようになった｜いつの間に、こんなことができるようになったんですか」{a}は少し得意げに鼻をこすった。')}
],
boss:[
{k:'rank',side:'A',cat:'conflict',mood:'rub',why:'島では肩書きは関係ない……はず（すれ違い）',T:L(
'{a}は、浜に集まった皆の前で宣言した。{a}「ここでは肩書きは関係ない。全員、対等｜ここでは肩書きは関係ない。全員、対等だ｜ここでは肩書きは関係ありません。全員、対等です」その日の午後、{a}は{b}に、薪の積み方をいつもの会議の調子で細かく指示した。{b}「……とは言ったが｜……とは言ったがな｜……とはおっしゃいましたが」{a}「……今のはなし｜……今のは忘れろ｜……今のはなしでお願いします」|'+
'{a}は、{b}の小屋の組み方を見て、つい「報告は｜報告は？｜報告は？」と口にした。{b}「ここ、職場じゃない｜ここは職場ではない｜ここ、職場じゃありません」{a}は咳払いをして、黙って柱を一本支えた。|'+
'{a}が魚の干し方を決めかけたとき、{b}がはっきりと反対した。職場では一度もなかったことだった。{b}「ここでは、私のやり方のほうが正しい｜ここでは、私のやり方のほうが正しい｜ここでは、私のやり方のほうが正しいです」{a}はしばらく黙ってから、{b}の案に従った。')},
{k:'trust',side:'B',cat:'help',mood:'warm',why:'部下が上司を立て、支える（仲良し）',st:[-3,-8],T:L(
'{a}は、皆の前で頭を抱えている{b}に、そっと耳打ちした。{a}「いつもの会議みたいに、三つに分けて決めましょう｜いつもの会議のように、三つに分けて決めよう｜いつもの会議みたいに、三つに分けて決めましょう」{b}は顔を上げて、いつもの調子で皆に指示を出した。|'+
'{a}は、{b}が夜中にひとりで焚き火の番をしているのを見つけて、隣に座った。{a}「職場でも、いつも最後まで残ってた｜職場でも、いつも最後まで残っていた｜職場でも、いつも最後まで残っていましたね」{b}「部下に見られてたとは｜部下に見られていたとはな｜部下に見られていたとは」――{b}の肩から、少し力が抜けた。|'+
'[終盤]救助の船を待つ浜で、{a}は{b}に言った。{a}「戻ったら、また下で働かせて｜戻ったら、また下で働かせてくれ｜戻ったら、また下で働かせてください」{b}「上下は、ここで終わり。戻ったら、隣で働いて｜上下は、ここで終わりだ。戻ったら、隣で働け｜上下は、ここで終わりです。戻ったら、隣で働いてください」')}
],
ex:[
{k:'awk',cat:'conflict',mood:'rub',why:'元恋人と二人きりの作業（気まずさ）',fx:[{ten:4},{ten:4}],T:L(
'水汲みの当番表で、{a}と{b}の名前が並んでいた。泉までの道、二人とも黙っていた。{a}「……前も、こういう沈黙、あったね｜……前も、こういう沈黙があったな｜……前も、こういう沈黙、ありましたね」{b}「別れる前の日の帰り道｜別れる前の日の帰り道だ｜別れる前の日の帰り道です」――桶の水が、やけに重かった。|'+
'{a}は、{b}の焚き火の組み方が昔と同じなのに気づいて、つい口を出した。{a}「そこ、空気が入らないって前も言った｜そこは空気が入らないと前も言った｜そこ、空気が入らないって前も言いました」{b}「今それを言う？｜今それを言うか｜今それを言いますか」――周りの視線に気づいて、二人とも口をつぐんだ。|'+
'[嵐]嵐を避けて、{a}と{b}は同じ岩陰に逃げ込んだ。肩が触れるほど狭かった。{b}「……昔なら、こういうの、うれしかったんだろうな｜……昔なら、こういうのはうれしかったのだろうな｜……昔なら、こういうの、うれしかったんでしょうね」{a}は答えずに、雨の向こうを見ていた。')},
{k:'know',cat:'help',mood:'warm',why:'元恋人だから知っている気遣い（仲良し）',st:[-3,-6],T:L(
'{a}は、{b}が貝のアレルギーだったのを覚えていて、黙って魚の皿と取り替えた。{b}「……覚えてたんだ｜……覚えていたのか｜……覚えていたんですね」{a}「付き合ってたの、ついこのあいだでしょ｜付き合っていたのは、ついこのあいだだろう｜付き合っていたの、ついこのあいだでしょう」――それ以上は、どちらも何も言わなかった。|'+
'{a}は、寒がりの{b}の寝床の近くに、自分の拾った流木を余分に積んでおいた。{b}「こういうところ、別れても変わらないね｜こういうところは、別れても変わらないな｜こういうところ、別れても変わりませんね」{a}「別れたのは恋人のほうで、人間のほうじゃない｜別れたのは恋人としてで、人としてではない｜別れたのは恋人としてで、人としてじゃありません」|'+
'[終盤]島を出る前の夜、{a}と{b}は並んで海を見た。{b}「帰ったら、今度はちゃんと友達になろう｜帰ったら、今度はちゃんと友人になろう｜帰ったら、今度はちゃんと友達になりましょう」{a}「うん。……それが、いちばんいい気がする｜ああ。……それがいちばんいい気がする｜はい。……それが、いちばんいい気がします」')}
],
mentor:[
{k:'drill',side:'A',cat:'conflict',mood:'rub',why:'島でも稽古の口調（すれ違い）',w:1.6,T:L(
'{a}は、{b}が薪を割る構えを見るなり、手を止めさせた。{a}「腰が浮いてる。稽古で何度言った？｜腰が浮いている。稽古で何度言った｜腰が浮いています。稽古で何度言いましたか」{b}「ここ、道場じゃないんだけど｜ここは道場ではないのだが｜ここ、道場じゃないんですけど」{a}「島は、いちばん厳しい道場｜島は、いちばん厳しい道場だ｜島は、いちばん厳しい道場です」|'+
'[飢え]{a}は、空腹でふらつく{b}に、それでも見張りの姿勢を崩すなと言った。{b}「師匠は、鬼｜師は鬼だ｜師匠は、鬼です」{a}「鬼でいい。生きて帰す｜鬼でいい。生きて帰す｜鬼で結構です。生きて帰します」――その夜、{a}は自分の分の魚を黙って{b}の前に置いた。|'+
'{a}は、{b}が勝手に高い木に登ったのを下から叱った。{b}「稽古の応用、って言ったら許してくれる？｜稽古の応用だと言えば、許すか｜稽古の応用です、って言ったら許してくれますか」{a}「降りてきてから考える｜降りてきてから考える｜降りてきてから考えます」')},
{k:'stand',side:'B',cat:'help',mood:'warm',why:'弟子が師を支える（仲良し）',w:1.6,st:[-6,-4],fx:[{trust:6,aff:4},{trust:5,aff:5}],T:L(
'[嵐]嵐の夜、{a}は、ひとりで屋根を押さえていた{b}の隣に、黙って並んだ。{b}「下がっていろと言った｜＝｜下がっていてくださいと言いました」{a}「師匠の教えは、困っている人の隣に立て、だった｜師の教えは、困っている者の隣に立て、だった｜師匠の教えは、困っている人の隣に立て、でした」|'+
'{a}は、足を痛めた{b}の代わりに、教わった罠を全部ひとりで見回った。戻ってきた{a}の手には、魚が三匹ぶら下がっていた。{b}「……一度も教えた覚えのない数だ｜＝｜……一度も教えた覚えのない数ですね」|'+
'[終盤]救助を待つ浜で、{a}は{b}に頭を下げた。{a}「島でいちばん教わったのは、稽古じゃなかった｜島でいちばん教わったのは、稽古ではなかった｜島でいちばん教わったのは、稽古じゃありませんでした」{b}は答えずに、{a}の頭に一度だけ手を置いた。')}
]
});
function zdanger(ctx,c){return ctx.zb&&c.z&&ctx.zb.A[c.z.area]?ctx.zb.A[c.z.area].z:0;}
scen('zombie',{w:1.6,gap:4,max:3,
tag:function(ctx,a,b,k){
if(k==='危険')return zdanger(ctx,a)>35;
if(k==='夜')return/夜/.test(ctx.label||'');
return false;
},
fill:function(ctx,t,a){return t.replace(/\{area\}/g,ctx.zb&&a.z&&ctx.zb.A[a.z.area]?ctx.zb.A[a.z.area].name:'街');}
},{
parent:[
{k:'shield',side:'A',cat:'help',mood:'warm',why:'親が子をかばう',need:function(ctx,a){return zdanger(ctx,a)>25;},fx:[{trust:3},{aff:8,trust:8}],st:[6,-6],T:L(
'{area}の路地で、角から腕が伸びてきた。{a}は迷わず{b}を背中に押しやり、自分が前に出た。{b}「下がって！　私がやる｜下がれ！　私がやる｜下がってください！　私がやります」{a}「子供を前に出す親がどこにいるの｜子供を前に出す親がどこにいる｜子供を前に出す親が、どこにいますか」――{a}の腕に、浅い引っかき傷が残った。|'+
'[夜]{area}の物陰で夜を明かすことになった。{a}は{b}を壁際に寝かせ、自分は入口のほうに座った。{b}「交代で見張るって言ったよね｜交代で見張ると言っただろう｜交代で見張るって言いましたよね」{a}「言った。でも、今夜は私が全部やる｜言った。だが、今夜は私が全部やる｜言いました。でも、今夜は私が全部やります」|'+
'[危険]{area}を走り抜ける途中、{b}が転んだ。{a}は群れとのあいだに自分の体を割り込ませ、{b}が立ち上がるまで一歩も引かなかった。{b}「なんで先に逃げないの｜なぜ先に逃げない｜どうして先に逃げないんですか」{a}「あなたを置いて逃げる足は、持ってない｜あなたを置いて逃げる足は、持っていない｜あなたを置いて逃げる足は、持っていません」')},
{k:'guard',side:'B',cat:'help',mood:'warm',why:'子が親を守る',need:function(ctx,a){return zdanger(ctx,a)>25;},fx:[{aff:4,trust:6},{aff:6,trust:10}],st:[4,-8],T:L(
'{area}で、{b}の背後に影が迫った。気づいたのは{a}のほうが先だった。{a}は{b}を突き飛ばし、手にしたもので影を殴り倒した。{a}「今度は私が守る番｜今度は私が守る番だ｜今度は私が守る番です」{b}は息を呑んで、それから黙って頷いた。|'+
'{a}は、足を痛めた{b}に肩を貸して{area}を抜けた。{b}「重いでしょ。置いていって｜重いだろう。置いていけ｜重いでしょう。置いていきなさい」{a}「子供のころ、何回おんぶしてもらったと思ってるの｜子供のころ、何度背負ってもらったと思っている｜子供のころ、何回おぶってもらったと思っているんですか」|'+
'[危険]群れの気配に、{a}は{b}より先に動いた。窓を塞ぎ、扉に棚を倒し、最後に{b}の手を引いた。{b}「いつの間に、そんなに頼もしくなったの｜いつの間に、そんなに頼もしくなった｜いつの間に、そんなに頼もしくなったんですか」{a}「あなたの背中を見てたから｜あなたの背中を見ていたからだ｜あなたの背中を見ていましたから」')},
{k:'fight',side:'B',cat:'conflict',mood:'rub',why:'過保護への反発（すれ違い）',T:L(
'{a}は、{b}に物資探しを止められて声を荒らげた。{a}「もう子供じゃない。自分の身くらい守れる｜もう子供ではない。自分の身くらい守れる｜もう子供じゃありません。自分の身くらい守れます」{b}「分かってる。分かってて止めてる｜分かっている。分かっていて止めている｜分かっています。分かっていて止めているんです」――二人とも、その夜は目を合わせなかった。|'+
'{a}は、自分の分の食料までこっそり{b}の鞄に移されているのに気づいた。{a}「こういうの、もうやめて。あなたが倒れたら意味がない｜こういうのは、もうやめろ。あなたが倒れたら意味がない｜こういうの、もうやめてください。あなたが倒れたら意味がありません」{b}は答えずに、鞄の口を閉めた。|'+
'{area}で別行動を提案した{a}に、{b}は首を振った。{a}「二手に分かれたほうが早い｜二手に分かれたほうが早い｜二手に分かれたほうが早いです」{b}「早くても、あなたが戻ってこなかったら意味がない｜早くても、あなたが戻らなければ意味がない｜早くても、あなたが戻ってこなかったら意味がありません」――結局、二人は一緒に動いた。')}
],
sib:[
{k:'split',cat:'conflict',mood:'rub',why:'物資の分け方で口げんか（すれ違い）',T:L(
'{area}で見つけた缶詰を前に、{a}と{b}は言い合いになった。{a}「昔からそう。いいほうは、いつもあなた｜昔からそうだ。いいほうは、いつもあなただ｜昔からそうです。いいほうは、いつもあなたなんです」{b}「じゃあ選んで。どっちでもいい｜なら選べ。どちらでもいい｜じゃあ選んでください。どちらでもいいです」――{a}は迷った末に、桃の缶を{b}に押しつけた。|'+
'{a}は、{b}が見張りの途中で居眠りしていたのを見つけた。{a}「家の留守番のときと同じ。全然変わってない｜家の留守番のときと同じだ。全然変わっていない｜家の留守番のときと同じです。全然変わっていません」{b}「起きてた。目を閉じて音を聞いてただけ｜起きていた。目を閉じて音を聞いていただけだ｜起きていました。目を閉じて音を聞いていただけです」|'+
'{a}と{b}は、どちらの道で{area}を抜けるかで揉めた。{b}「子どものころの迷子、誰のせいだったか覚えてる？｜子どものころの迷子は、誰のせいだったか覚えているか｜子どものころの迷子、誰のせいだったか覚えていますか」{a}「それ、今言う？｜それは今言うことか｜それ、今言いますか」――結局、{a}の道を選んで、少しだけ遠回りになった。')},
{k:'back',cat:'help',mood:'warm',why:'{sibs}の背中合わせ（仲良し）',st:[-4,-8],T:L(
'[危険]{area}で囲まれかけたとき、{a}と{b}は何も言わずに背中を合わせた。昔、喧嘩の相手に囲まれたときと同じ構えだった。{b}「右、三つ｜右に三つだ｜右に三つです」{a}「左、二つ。……いつもどおり｜左に二つ。……いつもどおりだ｜左に二つ。……いつもどおりです」|'+
'{a}は、{b}の武器の刃こぼれに気づいて、自分の予備を黙って渡した。{b}「それ、あなたの分でしょ｜それはあなたの分だろう｜それ、あなたの分でしょう」{a}「家族の分も入ってる｜家族の分も入っている｜家族の分も入っています」|'+
'[夜]眠れない夜、{a}は{b}に、家の台所の窓から見えた景色の話をした。{b}「帰ったら、あの窓、二人で拭こう｜帰ったら、あの窓を二人で拭こう｜帰ったら、あの窓、二人で拭きましょう」{a}「昔は、どっちがやるかで喧嘩してた｜昔は、どちらがやるかで喧嘩していた｜昔は、どちらがやるかで喧嘩していましたね」')}
],
ex:[
{k:'awk',cat:'conflict',mood:'rub',why:'元恋人との気まずい同行（すれ違い）',fx:[{ten:4},{ten:4}],T:L(
'{area}で同じ物陰に飛び込んだのは、{a}と{b}だった。息が整うまで、二人とも黙っていた。{a}「……こんな形で会うとは思わなかった｜……こんな形で会うとは思わなかった｜……こんな形で会うとは思いませんでした」{b}「私も。……生きててよかった、とは言っておく｜私もだ。……生きていてよかった、とは言っておく｜私もです。……生きていてよかった、とは言っておきます」|'+
'{a}は、{b}の判断に思わず口を出した。{a}「別れる前も、あなたはいつもそうやって一人で決めた｜別れる前も、あなたはいつもそうやって一人で決めた｜別れる前も、あなたはいつもそうやって一人で決めていました」{b}「今それを言う？｜今それを言うか｜今それを言いますか」――{area}の静けさが、かえって痛かった。|'+
'[夜]見張りの交代で、{a}と{b}が二人きりになった。{b}「昔、夜中に電話してきたの、覚えてる｜昔、夜中に電話してきたのを覚えているか｜昔、夜中に電話してきたの、覚えていますか」{a}「覚えてる。……今はやめよう、その話｜覚えている。……今はやめよう、その話は｜覚えています。……今はやめましょう、その話は」')},
{k:'trust',cat:'help',mood:'warm',why:'元恋人だから背中を預けられる（仲良し）',st:[-3,-6],T:L(
'[危険]{area}で群れに追われたとき、{a}は振り返らずに叫んだ。{a}「右！｜右だ！｜右です！」{b}は迷わず右に跳んだ。付き合っていたころ、何度も一緒に走った道の癖が、体に残っていた。|'+
'{a}は、{b}が寒がりなのを覚えていて、拾った毛布を黙って渡した。{b}「別れても、そういうとこは変わらないんだね｜別れても、そういうところは変わらないのだな｜別れても、そういうところは変わらないんですね」{a}「生き延びるためだから｜生き延びるためだ｜生き延びるためですから」――言い訳の声が、少しだけ優しかった。|'+
'{a}は、{b}の傷の手当てを手早く済ませた。{b}「昔は、絆創膏一枚で大騒ぎしてたのに｜昔は、絆創膏一枚で大騒ぎしていたのにな｜昔は、絆創膏一枚で大騒ぎしていたのに」{a}「この街で、それどころじゃなくなった｜この街で、それどころではなくなった｜この街で、それどころじゃなくなりました」')}
],
friend:[
{k:'leave',cat:'conflict',mood:'rub',why:'友人どうしの判断の食い違い（すれ違い）',T:L(
'{area}で、知らない生存者の助けを呼ぶ声が聞こえた。{a}は行こうとし、{b}は腕をつかんで止めた。{b}「友達を失うほうが怖い｜友人を失うほうが怖い｜友達を失うほうが怖いんです」{a}「……その友達が、見捨てる人になるのも怖い｜……その友人が、見捨てる人間になるのも怖い｜……その友達が、見捨てる人になるのも怖いです」|'+
'{a}は、{b}が最後の水を知らない子に分けてしまったのを見て、思わず言った。{a}「優しいのは知ってる。でも、自分のことも考えて｜優しいのは知っている。だが、自分のことも考えろ｜優しいのは知っています。でも、自分のことも考えてください」{b}「あなたが代わりに考えてくれるでしょ｜あなたが代わりに考えるだろう｜あなたが代わりに考えてくれるでしょう」|'+
'{a}と{b}は、{area}に残るか、別の場所へ移るかで意見が割れた。{b}「友達だからって、全部同じ考えじゃなくていい｜友人だからといって、全部同じ考えでなくていい｜友達だからって、全部同じ考えじゃなくていいです」――二人は、明日の朝まで考えることにした。')},
{k:'cheer',cat:'help',mood:'warm',why:'友人の励まし（仲良し）',st:[-3,-10],T:L(
'{a}は、うずくまっている{b}の隣に座って、{area}に来る前に二人で行った店の話を始めた。{b}「今、その話？｜今、その話か｜今、その話ですか」{a}「今だから、その話｜今だからこそ、その話だ｜今だから、その話です」――{b}の肩の震えが、少しずつ止まった。|'+
'[夜]見張りの番、{a}は{b}の分まで起きていた。朝、{b}が気づいて言った。{b}「友達に甘えすぎてる気がする｜友人に甘えすぎている気がする｜友達に甘えすぎている気がします」{a}「街を出たら、ご飯おごって。それでいい｜街を出たら、飯をおごれ。それでいい｜街を出たら、ご飯をおごってください。それでいいです」|'+
'{a}は、拾ったマジックで{b}の腕に、街を出たらやることを書いた。{b}「消えたらどうするの｜消えたらどうする｜消えたらどうするんですか」{a}「また書く。何回でも｜また書く。何度でも｜また書きます。何回でも」')}
],
childhood:[
{k:'again',cat:'conflict',mood:'rub',why:'幼馴染の無茶（すれ違い）',T:L(
'{a}は、{b}がひとりで{area}の先へ行こうとするのを止めた。{a}「昔から、危ないところほど行きたがる｜昔から、危ないところほど行きたがるな｜昔から、危ないところほど行きたがりますね」{b}「昔から、あなたは止めるのが仕事みたいに言う｜昔から、あなたは止めるのが仕事のように言う｜昔から、あなたは止めるのが仕事みたいに言いますね」――結局、二人で行って、二人で走って戻った。|'+
'{a}は、{b}が拾った武器の構え方を見て、思わず笑った。{a}「子どものころのチャンバラと同じ構え｜子どものころのチャンバラと同じ構えだ｜子どものころのチャンバラと同じ構えですね」{b}「笑うところじゃない｜笑うところではない｜笑うところじゃありません」――{b}も、少しだけ笑っていた。|'+
'[夜]{a}は、{b}が夜中に一人で泣いていたのを知っていて、朝になってから言った。{a}「昔から、泣くときは隠れて泣くよね｜昔から、泣くときは隠れて泣くな｜昔から、泣くときは隠れて泣きますよね」{b}「見てたなら、声かけてよ｜見ていたなら、声をかけろ｜見ていたなら、声をかけてください」')},
{k:'sign',cat:'help',mood:'warm',why:'子どものころの合図（仲良し）',st:[-4,-8],T:L(
'[危険]{area}で物音がしたとき、{a}は子どものころの「隠れろ」の合図を指で送った。{b}は迷わず従った。群れが通り過ぎたあと、{b}が小声で言った。{b}「まだ覚えてたんだ｜まだ覚えていたのか｜まだ覚えていたんですね」{a}「忘れるわけない｜忘れるわけがない｜忘れるわけがありません」|'+
'{a}は、{b}が好きだったお菓子を{area}の棚で見つけて、黙って手渡した。{b}「……子どものころ、これを半分こした｜……子どものころ、これを半分に分けた｜……子どものころ、これを半分こしましたね」{a}「今日も半分こ｜今日も半分ずつだ｜今日も半分こです」|'+
'{a}と{b}は、壁に二人だけに分かる落書きを残してから{area}を離れた。昔の秘密基地の目印と同じ形だった。{b}「はぐれたら、これを探す｜はぐれたら、これを探せ｜はぐれたら、これを探してください」{a}「昔も、そう言った｜昔も、そう言ったな｜昔も、そう言いましたね」')}
]
});
function fsame(ctx,a,b){var f=ctx.ft;return!!(f&&f.home&&f.home[a.i]===f.home[b.i]);}
scen('futari',{w:1.4,gap:6,max:3,tag:function(ctx,a,b,k){
var f=ctx.ft;if(!f)return false;
if(k==='朝')return f.t===0;
if(k==='昼')return f.t===1;
if(k==='夕方')return f.t===2;
if(k==='夜')return f.t===3;
if(k==='休日')return!!f.hol;
if(k==='家')return f.t===0||f.t===3||fsame(ctx,a,b)&& !(f.t===1&& !f.hol);
if(k==='街')return(f.t===1&&f.hol&& !fsame(ctx,a,b))||(f.t===2&& !fsame(ctx,a,b))||(f.t===1&& !f.hol);
return false;
}},{
classmate:[
{k:'fresh',cat:'bond',mood:'warm',why:'教室の外で会う新鮮さ（仲良し）',T:L(
'[街]待ち合わせの駅前に、私服の{b}が立っていた。{a}は一瞬、誰だか分からなかった。{a}「こういう場で会うと、なんだか新鮮だね｜こういう場で会うと、なんだか新鮮だな｜こういう場で会うと、なんだか新鮮ですね」{b}「制服じゃない私、そんなに変？｜制服でない私は、そんなに変か｜制服じゃない私、そんなに変ですか」{a}「変じゃない。……見慣れないだけ｜変ではない。……見慣れないだけだ｜変じゃありません。……見慣れないだけです」|'+
'[家]{a}と{b}は、卒業アルバムを開いて夜更かしした。{b}「この写真の私、何を考えてたんだろう｜この写真の私は、何を考えていたのだろう｜この写真の私、何を考えていたんでしょう」{a}「たぶん、お昼のこと｜たぶん、昼飯のことだ｜たぶん、お昼のことです」――二人の笑い声で、隣の部屋の明かりがついた。|'+
'{a}は、同じクラスだった誰かの結婚の知らせを{b}に見せた。{b}「もう、そういう年なんだね｜もう、そういう年なのだな｜もう、そういう年なんですね」{a}「教室で騒いでたのが、昨日みたいなのに｜教室で騒いでいたのが、昨日のようなのにな｜教室で騒いでいたのが、昨日みたいなのに」――二人はしばらく、窓の外を眺めていた。')},
{k:'past',cat:'bond',mood:'rub',why:'学生のころの話でからかい合う（からかい）',fx:[{ten:3,aff:2},{ten:3,aff:2}],T:L(
'{a}は、{b}が学生のころに書いた寄せ書きの言葉を、一字一句違わずに読み上げた。{b}「やめて。それ、本当にやめて｜やめろ。それは本当にやめろ｜やめてください。それ、本当にやめてください」{a}「『未来の私へ、ビッグになれ』｜『未来の私へ、ビッグになれ』だ｜『未来の私へ、ビッグになれ』です」――{b}はクッションに顔を埋めた。|'+
'[朝]寝ぼけた{b}が、{a}を学生のころの出席番号で呼んだ。{a}「それ、何年前の呼び方？｜それは何年前の呼び方だ｜それ、何年前の呼び方ですか」{b}「……体が覚えてた｜……体が覚えていた｜……体が覚えていました」――その日一日、{a}は{b}を出席番号で呼び返した。|'+
'[街]買い物の途中、{a}は学生のころの{b}の失敗談を、店員さんの前でうっかり口にした。{b}「人前で昔の話はしない約束｜人前で昔の話はしない約束だ｜人前で昔の話はしない約束です」{a}「そんな約束、したっけ｜そんな約束をしたか｜そんな約束、しましたっけ」')}
],
childhood:[
{k:'family',cat:'bond',mood:'rub',why:'近すぎる幼馴染（からかい）',fx:[{ten:3,aff:2},{ten:3,aff:2}],T:L(
'[家]{a}は、{b}の部屋の冷蔵庫を勝手に開けて麦茶を飲んだ。{b}「子どものころから、人の家の冷蔵庫を自分の家みたいに開ける｜子どものころから、人の家の冷蔵庫を自分の家のように開ける｜子どものころから、人の家の冷蔵庫を自分の家みたいに開けますよね」{a}「おばさんがいいって言ってた｜おばさんがいいと言っていた｜おばさんがいいって言っていました」{b}「何年前の話｜何年前の話だ｜何年前の話ですか」|'+
'{a}は、{b}の新しい髪型を見て、子どものころのおかっぱの話を始めた。{b}「その話、あと何回するの｜その話は、あと何回する｜その話、あと何回するんですか」{a}「一生する｜一生する｜一生します」|'+
'[街]商店街で、昔からの知り合いのおばあさんに「二人とも大きくなって」と声をかけられた。{a}と{b}は顔を見合わせた。{b}「いつまで子ども扱いなんだろうね｜いつまで子ども扱いなのだろうな｜いつまで子ども扱いなんでしょうね」{a}「たぶん、ずっと｜たぶん、ずっとだ｜たぶん、ずっとです」')},
{k:'wake',cat:'help',mood:'warm',why:'昔からの世話焼き（仲良し）',st:[-3,-6],T:L(
'[朝]{a}は、目覚ましを三つ止めた{b}の布団をはがした。子どものころ、遠足の朝にしたのと同じやり方だった。{b}「……あと五分｜……あと五分だ｜……あと五分ください」{a}「それ、小学生のときから言ってる｜それは小学生のときから言っている｜それ、小学生のときから言っていますよ」|'+
'[夜]{a}は、眠れない{b}の電話に、夜中まで付き合った。子どものころの怪談の話をして、二人で笑った。{b}「余計に眠れなくなった｜余計に眠れなくなった｜余計に眠れなくなりました」{a}「昔と同じ。最後は私が先に寝る｜昔と同じだ。最後は私が先に寝る｜昔と同じです。最後は私が先に寝ます」|'+
'{a}は、熱を出した{b}のために、子どものころ{b}の家で出てきた味の雑炊を作った。{b}「……これ、うちの味｜……これは、うちの味だ｜……これ、うちの味ですね」{a}「何回食べさせてもらったと思ってるの｜何回食べさせてもらったと思っている｜何回食べさせてもらったと思っているんですか」')}
],
friend:[
{k:'late',cat:'bond',mood:'rub',why:'友人どうしの小さな行き違い（すれ違い）',fx:[{ten:4},{ten:4,aff:1}],T:L(
'[街]約束の時間を三十分過ぎて、{b}が走ってきた。{a}「友達じゃなかったら、帰ってた｜友人でなければ、帰っていた｜友達じゃなかったら、帰っていました」{b}「友達でよかった｜友人でよかった｜友達でよかったです」{a}「それで済むと思ってる？｜それで済むと思っているのか｜それで済むと思っていますか」――昼ごはんは、{b}のおごりになった。|'+
'{a}は、{b}の恋の話に、つい口を出しすぎた。{b}「友達だからって、全部言わなくていい｜友人だからといって、全部言わなくていい｜友達だからって、全部言わなくていいです」{a}は黙って、それから「……ごめん。心配で｜……すまない。心配で｜……ごめんなさい。心配で」とだけ言った。|'+
'[家]{a}が貸した本を、{b}はコーヒーの染みをつけて返してきた。{b}「友達のよしみで許して｜友人のよしみで許せ｜友達のよしみで許してください」{a}「この染み、ちょうどいちばんいい場面なんだけど｜この染みは、ちょうどいちばんいい場面なのだが｜この染み、ちょうどいちばんいい場面なんですけど」')},
{k:'stay',cat:'help',mood:'warm',why:'友人としての気遣い（仲良し）',st:[-3,-8],T:L(
'[夕方]仕事で失敗した{b}のところへ、{a}はコンビニの袋を提げてやってきた。{a}「話さなくていい。食べて、寝て｜話さなくていい。食べて、寝ろ｜話さなくていいです。食べて、寝てください」{b}は袋の中身を見て、少し笑った。{b}の好きなものばかりだった。|'+
'[夜]{a}と{b}は、夜更けまで一本の映画を観た。終わったあと、{b}がぽつりと言った。{b}「友達って、こういうのでいいんだね｜友人というのは、こういうのでいいのだな｜友達って、こういうのでいいんですね」{a}「こういうのが、いちばんいい｜こういうのが、いちばんいい｜こういうのが、いちばんいいです」|'+
'[休日]{a}は、引っ越しを手伝いに来て、{b}より先に段ボールを開け始めた。{b}「友達に休日を使わせて、悪いね｜友人に休日を使わせて、すまない｜友達に休日を使わせて、すみません」{a}「次は、あなたが手伝う番｜次は、あなたが手伝う番だ｜次は、あなたが手伝う番ですよ」')}
],
sib:[
{k:'pudding',cat:'bond',mood:'rub',why:'{sibs}のいつもの口げんか（すれ違い）',fx:[{ten:4},{ten:4}],T:L(
'[家]冷蔵庫のプリンが消えていた。{a}は{b}を見た。{b}は目をそらした。{a}「昔からそう。名前を書いても食べる｜昔からそうだ。名前を書いても食べる｜昔からそうです。名前を書いても食べるんです」{b}「書いてあったのは、私の名前に見えた｜書いてあったのは、私の名前に見えた｜書いてあったのは、私の名前に見えました」|'+
'[朝]洗面所の取り合いで、{a}と{b}は朝から言い合いになった。{b}「家にいたころから、あなたは長い｜家にいたころから、あなたは長い｜家にいたころから、あなたは長いんです」{a}「あなたは短すぎ｜あなたは短すぎる｜あなたは短すぎます」――結局、二人とも同じ時間に家を出た。|'+
'{a}は、親からの電話で{b}と比べられた話を{b}にした。{b}「それ、こっちもあなたと比べて言われてる｜それは、こちらもあなたと比べて言われている｜それ、こちらもあなたと比べて言われています」――二人は顔を見合わせて、同時にため息をついた。')},
{k:'call',cat:'help',mood:'warm',why:'{sibs}の支え合い（仲良し）',st:[-3,-8],T:L(
'[夜]{a}は、{b}が親とけんかした夜、黙って温かい飲み物を置いた。{b}「味方してくれるの？｜味方をするのか｜味方してくれるんですか」{a}「今日だけ。明日は親の味方｜今日だけだ。明日は親の味方だ｜今日だけです。明日は親の味方です」{b}は笑って、カップを両手で包んだ。|'+
'[休日]{a}と{b}は、親の誕生日の贈り物を二人で選びに出かけた。{b}「毎年、結局あなたのセンスになる｜毎年、結局あなたのセンスになるな｜毎年、結局あなたのセンスになりますね」{a}「毎年、お金はあなたが多めに出す｜毎年、金はあなたが多めに出す｜毎年、お金はあなたが多めに出しますけどね」|'+
'[夕方]{a}は、風邪で寝込んだ{b}の部屋に、子どものころ親が作ってくれた味のスープを持ってきた。{b}「……これ、家の味｜……これは、家の味だ｜……これ、家の味ですね」{a}「覚えてたの、私だけじゃなかった｜覚えていたのは、私だけではなかったか｜覚えていたの、私だけじゃなかったんですね」')}
],
parent:[
{k:'nag',side:'A',cat:'bond',mood:'rub',why:'親の口出し（すれ違い）',fx:[{ten:3},{ten:5}],T:L(
'[家]{a}は、{b}の部屋に入るなり、散らかった机を片づけ始めた。{b}「もう子供じゃないんだけど｜もう子供ではないのだが｜もう子供じゃないんですけど」{a}「知ってる。でも、これは大人の机じゃない｜知っている。だが、これは大人の机ではない｜知っています。でも、これは大人の机じゃありません」――言い返せないのが、いちばん悔しかった。|'+
'[夕方]{a}は、{b}の帰りが遅いのを心配して、三回電話をかけた。{b}「あまり帰りは遅くならないように、って何歳まで言うの｜あまり帰りは遅くならないように、と何歳まで言うつもりだ｜あまり帰りは遅くならないように、って何歳まで言うんですか」{a}「あなたが何歳になっても｜あなたが何歳になってもだ｜あなたが何歳になってもです」|'+
'[朝]{a}は、{b}の弁当箱に野菜ばかり詰めた。{b}「もう子供じゃないんだけど｜もう子供ではないのだが｜もう子供じゃないんですけど」{a}「子供じゃないなら、野菜くらい食べられるでしょ｜子供でないなら、野菜くらい食べられるだろう｜子供じゃないなら、野菜くらい食べられるでしょう」')},
{k:'thanks',side:'B',cat:'help',mood:'warm',why:'子が親を気遣う（仲良し）',st:[-3,-8],T:L(
'[夕方]{a}は、仕事帰りの{b}のために夕飯を作って待っていた。{b}「いつの間に、料理なんか覚えたの｜いつの間に、料理など覚えた｜いつの間に、料理なんて覚えたんですか」{a}「見てたから。ずっと｜見ていたからだ。ずっと｜見ていましたから。ずっと」――{b}は箸を持ったまま、しばらく食べ始められなかった。|'+
'[休日]{a}は、{b}の好きな店に予約を入れて、休日に連れ出した。{b}「誕生日でもないのに｜誕生日でもないのにな｜誕生日でもないのに」{a}「誕生日じゃない日に、ありがとうって言いたかっただけ｜誕生日でない日に、礼を言いたかっただけだ｜誕生日じゃない日に、ありがとうって言いたかっただけです」|'+
'[夜]{a}は、{b}の肩を揉みながら言った。{a}「昔は、こうしてもらう側だった｜昔は、こうしてもらう側だった｜昔は、こうしてもらう側でした」{b}「……上手になったね｜……上手になったな｜……上手になりましたね」――{b}は目を閉じて、子どもの手の大きさを確かめていた。')}
],
boss:[
{k:'offday',side:'B',cat:'bond',mood:'rub',why:'休日に職場の顔が抜けない（からかい）',fx:[{ten:3,aff:2},{ten:2,aff:2}],T:L(
'[休日]休日の街で、{a}は向こうから歩いてくる{b}を見つけて、反射的に背筋を伸ばした。{b}「今日は休みでしょ。会釈はいらない｜今日は休みだろう。会釈はいらない｜今日はお休みでしょう。会釈はいりません」{a}「体が勝手に｜体が勝手に動いた｜体が勝手に動きました」――職場の外で見る{b}は、少しだけ小さく見えた。|'+
'[家]{a}は、{b}の家に招かれて、玄関でつい職場の挨拶をしてしまった。{b}「ここ、会社じゃない｜ここは会社ではない｜ここ、会社じゃありませんよ」{a}「じゃあ、なんて言えば｜では、なんと言えばいい｜では、なんと言えばいいんですか」{b}「『おじゃまします』でいい｜『おじゃまします』でいい｜『おじゃまします』でいいです」|'+
'[街]{a}と{b}は、休日の喫茶店で鉢合わせた。{b}は、テーブルに広げていた仕事の書類を慌てて隠した。{a}「休みの日まで上司やってるの？｜休みの日まで上司をやっているのか｜休みの日まで上司をやっているんですか」{b}「……部下に見つかるとは｜……部下に見つかるとはな｜……部下に見つかるとは」')},
{k:'drink',side:'A',cat:'help',mood:'warm',why:'職場の外での信頼（仲良し）',st:[-3,-6],T:L(
'[夕方]仕事帰り、{a}は{b}を駅前の小さな店に誘った。{a}「今日はお疲れさま。今のは指示じゃない、お誘い｜今日はお疲れさまだった。今のは指示ではない、誘いだ｜今日はお疲れさまでした。今のは指示ではありません、お誘いです」{b}は笑って、のれんをくぐった。|'+
'[夜]{a}は、{b}からの夜の電話に、仕事の話だと思って身構えた。{b}が話したのは、近所に住みついた野良猫のことだった。{a}「……そういう話も、していいんだ｜……そういう話もしていいのだな｜……そういう話も、していいんですね」{b}「職場の外では、上司も部下もない｜職場の外では、上司も部下もない｜職場の外では、上司も部下もありません」|'+
'[休日]{a}は、引っ越しの手伝いに来た{b}に、重い箱を持たせなかった。{a}「休みの日まで部下に力仕事はさせられない｜休みの日まで部下に力仕事はさせられない｜休みの日まで部下に力仕事はさせられません」{b}「休みの日は、部下じゃないよ｜休みの日は、部下ではない｜休みの日は、部下じゃありません」')}
],
ex:[
{k:'habit',cat:'bond',mood:'rub',why:'別れても残る昔の癖（気まずさ）',fx:[{ten:4},{ten:4}],T:L(
'[家]{a}は、{b}の分のコーヒーに、昔と同じだけ砂糖を入れてしまった。{b}「……今は、入れないんだけど｜……今は、入れないのだが｜……今は、入れないんですけど」{a}「……そっか。ごめん｜……そうか。すまない｜……そうですか。ごめんなさい」――カップを置く音が、やけに大きく響いた。|'+
'[街]{a}と{b}は、昔二人でよく行った店の前を通りかかった。{b}「ここ、まだあったんだ｜ここは、まだあったのか｜ここ、まだあったんですね」{a}「入る？｜入るか｜入りますか」{b}「……今日は、やめとく｜……今日は、やめておく｜……今日は、やめておきます」|'+
'{a}は、{b}の新しいスマホの待ち受けを見てしまった。そこに写っていたのは、もう自分ではなかった。{a}「いい写真｜いい写真だな｜いい写真ですね」{b}「……ありがとう｜＝｜……ありがとうございます」――それ以上、どちらも何も言わなかった。')},
{k:'friend',cat:'bond',mood:'warm',why:'元恋人から友人へ（仲良し）',T:L(
'[夕方]{a}は、{b}の愚痴を最後まで聞いてから言った。{a}「付き合ってたころより、いいアドバイスができてる気がする｜付き合っていたころより、いい助言ができている気がする｜付き合っていたころより、いいアドバイスができている気がします」{b}「別れてからのほうが、話しやすいのは確か｜別れてからのほうが話しやすいのは確かだ｜別れてからのほうが、話しやすいのは確かです」|'+
'[休日]{a}と{b}は、共通の友人の結婚祝いを一緒に選びに出かけた。{b}「こういうの、昔はけんかしながら選んでたね｜こういうのは、昔はけんかしながら選んでいたな｜こういうの、昔はけんかしながら選んでいましたね」{a}「今は、すんなり決まる｜今は、すんなり決まる｜今は、すんなり決まりますね」|'+
'[夜]{a}は、眠れないと言う{b}の電話に、昔みたいに付き合った。{b}「友達として、また話せてうれしい｜友人として、また話せてうれしい｜友達として、また話せてうれしいです」{a}「私も。……ちゃんと寝てね｜私もだ。……ちゃんと寝ろ｜私もです。……ちゃんと寝てくださいね」')}
],
mentor:[
{k:'lesson',side:'A',w:1.8,cat:'bond',mood:'rub',why:'日常でも師の顔（すれ違い）',fx:[{ten:3},{ten:4}],T:L(
'[家]{a}は、{b}が皿を洗う手つきにまで口を出した。{a}「力が入りすぎ。稽古と同じ｜力が入りすぎだ。稽古と同じだ｜力が入りすぎです。稽古と同じです」{b}「家でくらい、師匠をお休みして｜家でくらい、師匠を休め｜家でくらい、師匠をお休みしてください」{a}「休めと言われて休む師匠はいない｜休めと言われて休む師はいない｜休めと言われて休む師匠はいません」|'+
'[朝]{a}は、寝坊した{b}の枕元に、朝の稽古の予定表を置いた。{b}「今日は休みの日だったはず｜今日は休みの日だったはずだ｜今日は休みの日だったはずです」{a}「休みの日の稽古が、いちばん伸びる｜休みの日の稽古が、いちばん伸びる｜休みの日の稽古が、いちばん伸びます」|'+
'[街]買い物の途中、{a}は{b}の歩き方を直させた。{b}「人前でやめて｜人前でやめろ｜人前でやめてください」{a}「人前だから直す｜人前だから直すのだ｜人前だから直すんです」――{b}は文句を言いながら、背筋を伸ばして歩いた。')},
{k:'treat',side:'B',w:1.8,cat:'help',mood:'warm',why:'弟子が師をもてなす（仲良し）',fx:[{trust:5,aff:4},{trust:5,aff:5}],T:L(
'[夕方]{a}は、{b}の好物を作って待っていた。{a}「今日は、私が師匠をもてなす日｜今日は、私が師をもてなす日だ｜今日は、私が師匠をおもてなしする日です」{b}は箸をつけて、少しだけ眉を上げた。{b}「……腕を上げたな｜＝｜……腕を上げましたね」|'+
'[休日]{a}は、{b}を連れて、{b}が若いころに通っていたという店を探し当てた。{b}「よく見つけた｜よく見つけたな｜よく見つけましたね」{a}「弟子ですから｜弟子だからな｜弟子ですから」――{b}は懐かしそうに、昔と同じ席に座った。|'+
'[夜]{a}は、昔{b}にもらった言葉を書いた紙を、今も手帳に挟んでいた。それを見つけた{b}は、何も言わずに{a}の頭に手を置いた。{b}「まだ持ってたんだ｜まだ持っていたのか｜まだ持っていたんですね」')}
]
});
scen('br',{w:2.4,gap:3,max:3,tag:function(ctx,a,b,k){
if(k==='放送')return ctx.stepIndex>0&&ctx.stepIndex%4===0;
if(k==='終盤')return ctx.present().length<=4;
if(k==='同盟')return!!ctx.pair(a,b).allied;
return(ctx.label||'').indexOf(k)>=0;
}},{
classmate:[
{k:'aim',cat:'conflict',mood:'rub',why:'同じ教室にいた相手に武器を向けられるか（葛藤）',fx:[{ten:6,trust: -2},{ten:6,trust: -2}],T:L(
'森の中で、{a}と{b}は鉢合わせた。互いの手には支給された武器があった。{a}「同じクラスだったのに｜同じクラスだったのにな｜同じクラスだったのに」{b}「同じクラスだったから、余計に怖い｜同じクラスだったから、余計に怖い｜同じクラスだったから、余計に怖いんです」――二人は武器を下ろさないまま、ゆっくりと離れた。|'+
'[終盤]残りの人数が読み上げられたあと、{a}は{b}を見つめた。{a}「教室で隣の席だったころ、こんな顔で見るなんて思わなかった｜教室で隣の席だったころは、こんな顔で見るとは思わなかった｜教室で隣の席だったころ、こんな顔で見るなんて思いませんでした」{b}「……私も｜……私もだ｜……私もです」|'+
'{a}は、{b}が武器を握る手の震えに気づいた。体育の授業で鉄棒を握っていたときと、同じ震え方だった。{a}「あなたに、人は撃てない｜あなたに、人は撃てない｜あなたに、人は撃てませんよ」{b}「……試してみる？｜……試してみるか｜……試してみますか」――{b}の声は、かすれていた。')},
{k:'roll',cat:'bond',mood:'warm',why:'教室の思い出で正気を保つ（仲良し）',st:[-4,-8],T:L(
'{a}と{b}は、廃屋の陰で、同じクラスだったころの話を小声でした。{b}「文化祭のお化け屋敷、覚えてる？　本物より怖かった｜文化祭のお化け屋敷を覚えているか。本物より怖かった｜文化祭のお化け屋敷、覚えていますか。本物より怖かったですよね」{a}「今のほうが、ずっと怖い｜今のほうが、ずっと怖い｜今のほうが、ずっと怖いです」――それでも二人は、少しだけ笑った。|'+
'[放送]定時放送で、同じクラスにいた誰かの名前が読み上げられた。{a}は耳をふさぎ、{b}はその手の上から自分の手を重ねた。{b}「聞かなくていい。私が覚えておく｜聞かなくていい。私が覚えておく｜聞かなくていいです。私が覚えておきます」|'+
'[夜]{a}は、眠れない{b}に、昔の担任の口癖を真似てみせた。{a}「『全員そろって卒業するまでが学校』｜『全員そろって卒業するまでが学校だ』｜『全員そろって卒業するまでが学校です』」{b}は泣き笑いの顔で言った。{b}「……卒業、したかったね｜……卒業したかったな｜……卒業、したかったですね」')}
],
friend:[
{k:'doubt',cat:'conflict',mood:'rub',why:'友人を信じきれない（すれ違い）',fx:[{trust: -4,ten:5},{trust: -2,ten:5}],T:L(
'{a}は、{b}の鞄から見慣れない武器がのぞいているのに気づいた。{a}「それ、どこで拾ったの｜それは、どこで拾った｜それ、どこで拾ったんですか」{b}「疑ってるの？　友達なのに｜疑っているのか。友人なのに｜疑っているんですか。友達なのに」{a}「友達だから、聞いてる｜友人だから、聞いている｜友達だから、聞いているんです」|'+
'[夜]見張りの番、{a}は眠ったふりをしている{b}の寝息を数えていた。本当に眠っているのか、確かめずにはいられなかった。朝、{b}が言った。{b}「一晩じゅう起きてたでしょ｜一晩じゅう起きていただろう｜一晩じゅう起きていましたよね」{a}は答えられなかった。|'+
'[終盤]{b}は{a}に言った。{b}「最後の二人になったら、どうする？｜最後の二人になったら、どうする｜最後の二人になったら、どうしますか」{a}「友達のまま、終わりにする｜友人のまま、終わりにする｜友達のまま、終わりにします」――その言葉の意味を、{b}はしばらく考えていた。')},
{k:'watch',cat:'help',mood:'warm',why:'友人どうしの見張りと支え（仲良し）',st:[-4,-8],T:L(
'{a}は、{b}の分の水を残しておいた。{b}「友達に分ける余裕なんて、ないはずでしょ｜友人に分ける余裕など、ないはずだろう｜友達に分ける余裕なんて、ないはずでしょう」{a}「余裕じゃない。友達だから｜余裕ではない。友人だからだ｜余裕じゃありません。友達だからです」|'+
'[夜]{a}は、震えている{b}の隣で、一晩じゅう見張りを続けた。{a}「寝て。何かあったら起こす｜寝ろ。何かあったら起こす｜寝てください。何かあったら起こします」{b}は目を閉じる前に、{a}の袖を一度だけつかんだ。|'+
'{a}は、{b}の傷を、救急箱の残りで手当てした。{b}「あなたの分がなくなる｜あなたの分がなくなる｜あなたの分がなくなりますよ」{a}「友達の傷のほうが、見てて痛い｜友人の傷のほうが、見ていて痛い｜友達の傷のほうが、見ていて痛いんです」')}
],
childhood:[
{k:'lie',cat:'conflict',mood:'rub',why:'幼馴染だから嘘が分かる（すれ違い）',T:L(
'{b}は「大丈夫」と言ったが、{a}にはすぐに嘘だと分かった。{a}「子どものころから、嘘をつくとき右手を握る｜子どものころから、嘘をつくとき右手を握るな｜子どものころから、嘘をつくとき右手を握りますよね」{b}「……見ないで｜……見るな｜……見ないでください」――{b}の腕には、隠していた傷があった。|'+
'{a}は、{b}がひとりで囮になろうとしているのに気づいた。{a}「昔からそう。かくれんぼでも、自分から鬼になった｜昔からそうだ。かくれんぼでも、自分から鬼になった｜昔からそうです。かくれんぼでも、自分から鬼になりましたよね」{b}「今度は、本物の鬼がいる｜今度は、本物の鬼がいる｜今度は、本物の鬼がいるんです」|'+
'[終盤]{a}は、{b}が武器を自分に向けないことを、なぜか疑えなかった。{b}「疑わないの？｜疑わないのか｜疑わないんですか」{a}「あなたを疑うくらいなら、最初から一緒に遊んでない｜あなたを疑うくらいなら、最初から一緒に遊んでいない｜あなたを疑うくらいなら、最初から一緒に遊んでいません」')},
{k:'sign',cat:'help',mood:'warm',why:'子どものころの合図（仲良し）',st:[-4,-8],T:L(
'{a}は、遠くの茂みから、子どものころに決めた鳥の鳴き真似を聞いた。{b}だった。{a}も同じ鳴き真似を返した。合流した二人は、声を出さずに肩をぶつけ合った。|'+
'[夜]{a}と{b}は、禁止エリアの境目で、昔の秘密基地みたいに狭い岩陰に身を寄せた。{b}「ここ、あそこに似てる｜ここは、あそこに似ている｜ここ、あそこに似ていますね」{a}「だから、きっと見つからない｜だから、きっと見つからない｜だから、きっと見つかりません」|'+
'{a}は、{b}の手のひらに、指で「だいじょうぶ」と書いた。子どものころ、先生に叱られたあとに、いつもしていたことだった。{b}は小さく笑って、同じ字を書き返した。{b}「……昔のまんま｜……昔のままだな｜……昔のままですね」')}
],
sib:[
{k:'who',cat:'conflict',mood:'rub',why:'どちらが生き残るかの言い争い（葛藤）',fx:[{ten:6},{ten:6}],T:L(
'[終盤]{b}は、自分の武器を{a}に押しつけた。{b}「生き残るのは、あなた｜生き残るのは、あなただ｜生き残るのは、あなたです」{a}「昔からそう。いつも勝手に譲って、勝手にいなくなる｜昔からそうだ。いつも勝手に譲って、勝手にいなくなる｜昔からそうです。いつも勝手に譲って、勝手にいなくなるんです」――{a}は武器を突き返した。|'+
'{a}と{b}は、隠れる場所をめぐって言い合いになった。{a}「家の物置でも、いい場所はいつもあなた｜家の物置でも、いい場所はいつもあなただった｜家の物置でも、いい場所はいつもあなたでした」{b}「今は、場所を譲るから黙って｜今は場所を譲るから、黙れ｜今は場所を譲りますから、黙ってください」――言い合う声が、少しだけ震えていた。|'+
'[放送]定時放送のあと、{a}は{b}に言った。{a}「どっちか一人しか帰れないなら、親には何て言えばいい｜どちらか一人しか帰れないなら、親には何と言えばいい｜どちらか一人しか帰れないなら、親には何て言えばいいんですか」{b}は答えずに、{a}の頭を乱暴に撫でた。')},
{k:'back',cat:'help',mood:'warm',why:'{sibs}の背中合わせ（仲良し）',st:[-4,-10],T:L(
'{a}と{b}は、背中合わせで夜を明かした。子どものころ、雷の夜にそうしたように。{b}「怖くないふりするの、昔からうまいね｜怖くないふりをするのは、昔からうまいな｜怖くないふりをするの、昔からうまいですね」{a}「あなたの前でだけ｜あなたの前でだけだ｜あなたの前でだけです」|'+
'[同盟]{a}は、{b}が眠っているあいだに、自分の支給品を{b}の鞄にそっと移した。朝、それに気づいた{b}が言った。{b}「家族だからって、全部くれなくていい｜家族だからといって、全部くれなくていい｜家族だからって、全部くれなくていいです」{a}「家族だから、全部あげる｜家族だから、全部やる｜家族だから、全部あげます」|'+
'[昼]{a}は、{b}の好きだった歌を小さく口ずさんだ。{b}は目を閉じて、続きを歌った。{b}「帰ったら、またこれで喧嘩しよう｜帰ったら、またこれで喧嘩しよう｜帰ったら、またこれで喧嘩しましょう」')}
],
parent:[
{k:'shield',side:'A',cat:'help',mood:'warm',why:'親が子を守る',fx:[{trust:4},{aff:8,trust:8}],st:[6,-8],T:L(
'{a}は、物音のした方角に、迷わず{b}より先に出た。{b}「下がって！｜下がれ！｜下がってください！」{a}「子供の前を歩くのが、親の仕事｜子供の前を歩くのが、親の仕事だ｜子供の前を歩くのが、親の仕事です」――{a}の手は、武器を握りしめて白くなっていた。|'+
'[同盟]{a}は、自分の支給品を{b}の手に握らせた。{a}「これは、あなたが持ってて｜これは、あなたが持っていろ｜これは、あなたが持っていてください」{b}「それじゃ、あなたが丸腰になる｜それでは、あなたが丸腰になる｜それでは、あなたが丸腰になりますよ」{a}「親は、丸腰でも子供を守れる｜親は、丸腰でも子供を守れる｜親は、丸腰でも子供を守れます」|'+
'[放送]定時放送のあいだ、{a}はずっと{b}の手を握っていた。{b}の名前が呼ばれないと分かるまで、離さなかった。{a}「……よかった｜……よかった｜……よかったです」{b}「呼ばれるわけない。あなたがいるから｜呼ばれるわけがない。あなたがいるからだ｜呼ばれるわけがありません。あなたがいますから」')},
{k:'notchild',side:'B',cat:'conflict',mood:'rub',why:'守られるだけの子でいたくない（葛藤）',T:L(
'{a}は、また前に出ようとする{b}の腕をつかんだ。{a}「もう子供じゃない。守られてばかりは嫌｜もう子供ではない。守られてばかりは嫌だ｜もう子供じゃありません。守られてばかりは嫌です」{b}「子供じゃなくても、私の子供｜子供でなくても、私の子供だ｜子供じゃなくても、私の子供です」――言い合ううちに、遠くで銃声がして、二人とも黙った。|'+
'[終盤]{a}は、{b}に背を向けたまま言った。{a}「最後の一人しか帰れないなら、帰るのはあなた｜最後の一人しか帰れないなら、帰るのはあなただ｜最後の一人しか帰れないなら、帰るのはあなたです」{b}「親より先に死ぬ子供なんて、許さない｜親より先に死ぬ子供など、許さない｜親より先に死ぬ子供なんて、許しません」|'+
'{a}は、{b}の作った隠れ場所に入るのを拒んだ。{a}「私だって、あなたを守りたい｜私だって、あなたを守りたい｜私だって、あなたを守りたいんです」{b}は言い返そうとして、言葉を飲み込んだ。それから、隠れ場所を二人ぶんに広げ始めた。')}
],
boss:[
{k:'order',side:'B',cat:'conflict',mood:'rub',why:'上司の指示に従うか迷う（葛藤）',T:L(
'{b}は、皆を集めて動く順番を決めようとした。{a}は思わず口を挟んだ。{a}「ここでは、指示に従う義務はない｜ここでは、指示に従う義務はない｜ここでは、指示に従う義務はありません」{b}「分かってる。それでも、誰かが決めないと死ぬ｜分かっている。それでも、誰かが決めなければ死ぬ｜分かっています。それでも、誰かが決めないと死にます」――{a}は、結局いつものように頷いた。|'+
'[終盤]{a}は、{b}に向けかけた武器を下ろした。{a}「職場で、何度も助けてもらった｜職場で、何度も助けてもらった｜職場で、何度も助けていただきました」{b}「ここは職場じゃない。遠慮はいらない｜ここは職場ではない。遠慮はいらない｜ここは職場じゃありません。遠慮はいりません」{a}「……それでも、撃てない｜……それでも、撃てない｜……それでも、撃てません」|'+
'{a}は、{b}の判断が間違っていると思った。職場なら、黙って従っていた。{a}「今回だけは、私のやり方で行く｜今回だけは、私のやり方で行く｜今回だけは、私のやり方で行きます」{b}は少し驚いた顔で、それから「任せた｜任せる｜任せます」と言った。')},
{k:'take',side:'A',cat:'help',mood:'warm',why:'上司が責任を引き受ける（仲良し）',st:[4,-8],T:L(
'{a}は、{b}が震える手で武器を握っているのを見て、その手を上から押さえた。{a}「撃つ判断は、私がする。責任も私が取る｜撃つ判断は私がする。責任も私が取る｜撃つ判断は、私がします。責任も私が取ります」{b}はゆっくりと手を開いた。|'+
'[夜]{a}は、いちばん危ない見張りの番を、自分に割り振った。{b}「部下に任せればいいのに｜部下に任せればいいだろう｜部下に任せればいいじゃないですか」{a}「部下を守るのが上司の仕事。ここでも、それは変わらない｜部下を守るのが上司の仕事だ。ここでも、それは変わらない｜部下を守るのが上司の仕事です。ここでも、それは変わりません」|'+
'[放送]定時放送のあと、{a}は{b}の肩を叩いた。{a}「よく生き延びた。帰ったら、有給を全部使って｜よく生き延びた。帰ったら、有給を全部使え｜よく生き延びましたね。帰ったら、有給を全部使ってください」{b}は泣きそうな顔で笑った。')}
],
mentor:[
{k:'teach',side:'A',cat:'help',mood:'warm',why:'師が弟子に生き延びる術を教える（仲良し）',fx:[{trust:4},{trust:8,aff:4}],T:L(
'{a}は、{b}に支給品の構え方を一から教えた。{a}「力で握らないで。重さを預けて。稽古と同じ｜力で握るな。重さを預けろ。稽古と同じだ｜力で握らないでください。重さを預けるんです。稽古と同じです」{b}は頷いて、言われたとおりに構え直した。|'+
'{a}は、{b}に足音の消し方を教えた。{b}「稽古では、こんなこと教わらなかった｜稽古では、こんなことは教わらなかった｜稽古では、こんなこと教わりませんでした」{a}「教える日が来ないでほしかった｜教える日が来ないでほしかった｜教える日が来ないでほしかったんです」|'+
'[夜]{a}は、眠れない{b}の前で、静かに呼吸を整えてみせた。{a}「息を数えて。いつもの稽古の前と同じ｜息を数えろ。いつもの稽古の前と同じだ｜息を数えてください。いつもの稽古の前と同じです」{b}の呼吸が、少しずつ{a}の呼吸に重なった。')},
{k:'blade',side:'B',cat:'conflict',mood:'rub',why:'弟子は師に刃を向けられない（葛藤）',T:L(
'[終盤]{b}は、{a}に言った。{b}「最後の二人になったら、迷わず私を倒せ。それが最後の稽古｜最後の二人になったら、迷わず私を倒せ。それが最後の稽古だ｜最後の二人になったら、迷わず私を倒してください。それが最後の稽古です」{a}「そんな稽古、受けない｜そんな稽古は受けない｜そんな稽古、受けません」|'+
'{a}は、{b}の背中を見ながら、教わった型を思い出していた。どの型も、師に向けるためのものではなかった。{a}「あなたに教わったもので、あなたは傷つけない｜あなたに教わったもので、あなたは傷つけない｜あなたに教わったもので、あなたは傷つけません」{b}は振り返らずに、小さく頷いた。|'+
'{a}は、{b}の作戦に初めて逆らった。{a}「師匠が囮になるなら、弟子はやめる｜師が囮になるなら、弟子をやめる｜師匠が囮になるなら、弟子はやめます」{b}「……破門されたいのか｜……破門されたいのか｜……破門されたいんですか」{a}「されたくないから、言ってる｜されたくないから、言っている｜されたくないから、言っているんです」')}
],
ex:[
{k:'meet',cat:'conflict',mood:'rub',why:'元恋人との鉢合わせ（気まずさ）',fx:[{ten:5},{ten:5}],T:L(
'水場で、{a}と{b}は武器を構えたまま向かい合った。{a}「……別れたときより、ひどい顔｜……別れたときより、ひどい顔だ｜……別れたときより、ひどい顔ですね」{b}「お互いさま｜お互いさまだ｜お互いさまです」――どちらも、先に武器を下ろそうとはしなかった。|'+
'{a}は、{b}が誰かと手を組んでいるのを遠くから見た。胸の奥がざわついたのは、嫉妬なのか、心配なのか、分からなかった。{a}「……関係ない。もう関係ない｜……関係ない。もう関係はない｜……関係ありません。もう関係ないんです」|'+
'[夜]{a}と{b}は、同じ廃屋に逃げ込んでしまった。部屋の隅と隅に座って、夜が明けるのを待った。{b}「昔も、けんかした夜はこうだった｜昔も、喧嘩した夜はこうだった｜昔も、けんかした夜はこうでしたね」{a}「あのときは、朝になったら謝った｜あのときは、朝になったら謝った｜あのときは、朝になったら謝りました」')},
{k:'trust',cat:'help',mood:'warm',why:'元恋人に背中を任せる（仲良し）',st:[-3,-6],T:L(
'{a}は、背後の茂みを{b}に任せた。{b}「別れた相手に背中を預けるの？｜別れた相手に背中を預けるのか｜別れた相手に背中を預けるんですか」{a}「あなたの癖は全部知ってる。だから、信じられる｜あなたの癖は全部知っている。だから、信じられる｜あなたの癖は全部知っています。だから、信じられるんです」|'+
'{a}は、{b}の傷に気づいて、黙って布を裂いて巻いた。{b}「優しくしないで。調子が狂う｜優しくするな。調子が狂う｜優しくしないでください。調子が狂います」{a}「ここで死なれたら、もっと調子が狂う｜ここで死なれたら、もっと調子が狂う｜ここで死なれたら、もっと調子が狂います」|'+
'[放送]定時放送で{b}の名前が呼ばれなかったとき、{a}は自分でも驚くほど深く息を吐いた。{b}「今、ほっとしたでしょ｜今、ほっとしただろう｜今、ほっとしましたよね」{a}「……生きててほしいのは、昔から同じ｜……生きていてほしいのは、昔から同じだ｜……生きていてほしいのは、昔から同じです」')}
]
});
scen('trial',{w:2.6,gap:3,max:3,tag:function(ctx,a,b,k){
if(k==='事件後')return!!(ctx.flags.cases&&ctx.flags.cases.length);
return(ctx.label||'').indexOf(k)>=0;
}},{
classmate:[
{k:'suspect',cat:'conflict',mood:'rub',why:'同級生を疑ってしまう（葛藤）',fx:[{ten:5,trust: -3},{ten:5,trust: -2}],T:L(
'[裁判]裁判のあいだ、{a}はずっと{b}のアリバイを疑っていた。同じクラスだったころ、{b}が宿題を写して嘘をついたことを思い出していた。{a}「……疑ってごめん｜……疑って、すまない｜……疑って、ごめんなさい」{b}「謝らなくていい。私も、あなたを疑ってた｜謝らなくていい。私も、あなたを疑っていた｜謝らなくていいです。私も、あなたを疑っていました」|'+
'[昼]配られた動機の封筒を、{a}と{b}は同時に隠した。{b}「学生のころから、あなたは隠しごとが下手｜学生のころから、あなたは隠しごとが下手だ｜学生のころから、あなたは隠しごとが下手ですね」{a}「あなたもね｜あなたもな｜あなたもです」――二人とも、中身を見せ合おうとは言わなかった。|'+
'[事件後]{a}は、{b}の手の甲の小さな傷を見つけて、目を離せなくなった。{b}「それは昨日、扉で挟んだだけ。……信じてくれないの｜それは昨日、扉で挟んだだけだ。……信じないのか｜それは昨日、扉で挟んだだけです。……信じてくれないんですか」{a}「信じたい。同じ教室にいた人だから｜信じたい。同じ教室にいた人間だからな｜信じたいです。同じ教室にいた人ですから」')},
{k:'roll',cat:'bond',mood:'warm',why:'同じクラスだった思い出で支え合う（仲良し）',st:[-4,-8],T:L(
'[朝食]朝食の席で、{a}は{b}の皿に、苦手なものを黙って自分の皿へ移した。給食のときと同じだった。{b}「まだ覚えてたんだ｜まだ覚えていたのか｜まだ覚えていたんですね」{a}「同じ班だったから｜同じ班だったからな｜同じ班でしたから」|'+
'[夜]夜時間の前、{a}と{b}は廊下で、昔の担任の話をした。{b}「先生がここにいたら、全員まとめて正座させてたね｜先生がここにいたら、全員まとめて正座させていたな｜先生がここにいたら、全員まとめて正座させていましたね」{a}「黒幕も一緒に｜黒幕も一緒にな｜黒幕も一緒にです」――少しだけ、二人の肩から力が抜けた。|'+
'{a}は、{b}が娯楽室の隅でひとりになっているのを見つけて、隣に座った。{a}「修学旅行の夜も、こうやって話したね｜修学旅行の夜も、こうして話したな｜修学旅行の夜も、こうやって話しましたね」{b}「あのときは、明日が来るのが楽しみだった｜あのときは、明日が来るのが楽しみだった｜あのときは、明日が来るのが楽しみでした」')}
],
friend:[
{k:'vote',cat:'conflict',mood:'rub',why:'投票で友人を庇いきれなかった（葛藤）',fx:[{ten:4},{ten:6,trust: -3}],T:L(
'[裁判]裁判のあと、{b}は{a}を廊下で呼び止めた。{b}「さっき、私の名前が出たとき、何も言わなかった｜さっき、私の名前が出たとき、何も言わなかったな｜さっき、私の名前が出たとき、何も言いませんでしたね」{a}「……友達だから、証拠もなしに庇ったら、余計に疑われると思った｜……友人だから、証拠もなしに庇えば、余計に疑われると思った｜……友達だから、証拠もなしに庇ったら、余計に疑われると思ったんです」|'+
'[昼]{a}は、配られた動機を{b}に見せるかどうか、一晩じゅう迷った。結局、見せなかった。{b}「友達でも、言えないことはあるよね｜友人でも、言えないことはあるな｜友達でも、言えないことはありますよね」――その言い方が、{a}にはいちばん痛かった。|'+
'[事件後]{a}は、{b}が夜時間に部屋を出ていたと聞いて、問いただした。{b}「疑うなら、ちゃんと疑って。友達のふりのまま疑われるほうがつらい｜疑うなら、ちゃんと疑え。友人のふりのまま疑われるほうがつらい｜疑うなら、ちゃんと疑ってください。友達のふりのまま疑われるほうがつらいです」')},
{k:'stay',cat:'help',mood:'warm',why:'友人として寄り添う（仲良し）',st:[-4,-10],T:L(
'[夜]夜時間の前、{a}は{b}の部屋の前に椅子を置いて座った。{b}「何してるの｜何をしている｜何をしているんですか」{a}「見張り。友達が朝いなくなるのは、もう嫌だから｜見張りだ。友人が朝いなくなるのは、もう嫌だ｜見張りです。友達が朝いなくなるのは、もう嫌ですから」|'+
'[朝食]朝食の席で、{a}は手のつかない{b}の皿に、パンを一切れ足した。{a}「食べて。裁判で頭が回らなくなる｜食え。裁判で頭が回らなくなる｜食べてください。裁判で頭が回らなくなりますよ」{b}はしばらくパンを見つめてから、ちぎって口に運んだ。|'+
'[裁判]裁判が終わったあと、{a}は震える{b}の手を握った。{a}「今日も、二人とも生きてる｜今日も、二人とも生きている｜今日も、二人とも生きています」{b}「明日も、そう言って｜明日も、そう言え｜明日も、そう言ってください」')}
],
childhood:[
{k:'know',cat:'conflict',mood:'rub',why:'幼馴染だから嘘が見える（すれ違い）',T:L(
'[昼]{a}は、動機を受け取った{b}の顔を見て、すぐに分かった。{a}「昔から、困ると耳を触る｜昔から、困ると耳を触るな｜昔から、困ると耳を触りますよね」{b}「……言わないで。みんなの前では｜……言うな。皆の前では｜……言わないでください。みんなの前では」――{a}は頷いたが、その夜は眠れなかった。|'+
'[裁判]裁判で、{b}は{a}の証言を真っ先に疑った。{a}「子どものころから、私が嘘をついたことある？｜子どものころから、私が嘘をついたことがあるか｜子どものころから、私が嘘をついたこと、ありますか」{b}「何回もある。全部覚えてる｜何度もある。全部覚えている｜何回もあります。全部覚えています」――それでも、{b}は最後に{a}の側に票を入れなかった。|'+
'{a}は、{b}が一人で黒幕の部屋を探ろうとしているのを止めた。{a}「昔からそう。危ない秘密基地ほど、一人で行く｜昔からそうだ。危ない秘密基地ほど、一人で行く｜昔からそうです。危ない秘密基地ほど、一人で行くんです」{b}「今度は、一緒に来てくれる？｜今度は、一緒に来るか｜今度は、一緒に来てくれますか」')},
{k:'sign',cat:'help',mood:'warm',why:'子どものころの合図（仲良し）',st:[-4,-8],T:L(
'[裁判]裁判のあいだ、{a}は机の下で、子どものころの「大丈夫」の合図を{b}に送った。{b}は気づいて、同じ合図を返した。言葉にすれば疑われることも、指だけなら伝えられた。|'+
'[夜]夜時間の前、{a}は{b}の部屋の扉を、昔と同じリズムで三回叩いた。{b}「……あなたなら、開ける｜……あなたなら、開ける｜……あなたなら、開けます」――扉が少しだけ開いて、二人は朝まで小声で話した。|'+
'[朝食]朝食の席で、{a}は{b}に、子どものころ二人で作った暗号で「今日も生きる」と書いた紙ナプキンを渡した。{b}は小さく笑って、裏に「当たり前」と書き返した。{b}「昔から、返事が短いって言われる｜昔から、返事が短いと言われる｜昔から、返事が短いって言われます」')}
],
sib:[
{k:'motive',cat:'conflict',mood:'rub',why:'{sibs}で疑い合う（葛藤）',fx:[{ten:6},{ten:6}],T:L(
'[昼]配られた動機の映像には、二人の家が映っていた。{a}と{b}は、同時に画面から目をそらした。{a}「……どっちかが先に動く前に、約束して｜……どちらかが先に動く前に、約束しろ｜……どちらかが先に動く前に、約束してください」{b}「昔から、約束を破るのはあなた｜昔から、約束を破るのはあなただ｜昔から、約束を破るのはあなたです」|'+
'[裁判]裁判で、{b}は{a}の名前を口にしかけて、やめた。終わったあと、{a}が言った。{a}「疑うなら、ちゃんと言って。家族でしょ｜疑うなら、ちゃんと言え。家族だろう｜疑うなら、ちゃんと言ってください。家族でしょう」{b}「家族だから、言えなかった｜家族だから、言えなかった｜家族だから、言えなかったんです」|'+
'[朝食]朝食の席で、{a}と{b}はいつもの席の取り合いをした。{b}「家でも、窓際はいつもあなた｜家でも、窓際はいつもあなただった｜家でも、窓際はいつもあなたでした」――そんな喧嘩ができることが、まだ救いだった。')},
{k:'guard',cat:'help',mood:'warm',why:'{sibs}で守り合う（仲良し）',st:[-4,-10],T:L(
'[夜]夜時間の前、{a}は{b}の部屋で一緒に寝ると言い張った。{b}「子どもじゃないんだから｜子どもではないのだから｜子どもじゃないんですから」{a}「子どものころ、一人で寝られなかったのはどっち｜子どものころ、一人で寝られなかったのはどちらだ｜子どものころ、一人で寝られなかったのはどちらでしたっけ」――{b}は黙って、布団を半分空けた。|'+
'[裁判]裁判で疑われた{b}を、{a}は真っ先に庇った。{a}「この人は、虫も殺せない。家族だから知ってる｜この人は、虫も殺せない。家族だから知っている｜この人は、虫も殺せません。家族だから知っています」{b}は、膝の上で拳を握りしめていた。|'+
'{a}は、{b}が食事を抜いているのに気づいて、自分の分を半分に分けた。{a}「昔から、心配ごとがあると食べなくなる｜昔から、心配ごとがあると食べなくなるな｜昔から、心配ごとがあると食べなくなりますよね」{b}「昔から、あなたは目ざとい｜昔から、あなたは目ざとい｜昔から、あなたは目ざといですね」')}
],
parent:[
{k:'doubt',side:'A',cat:'conflict',mood:'rub',why:'親が子を疑いかける（葛藤）',fx:[{ten:4},{ten:6,aff: -2}],T:L(
'[裁判]裁判のあと、{a}は{b}の前で頭を下げた。{a}「一瞬だけ、あなたを疑った。親なのに｜一瞬だけ、あなたを疑った。親なのにな｜一瞬だけ、あなたを疑いました。親なのに」{b}「……正直に言ってくれるほうがいい｜……正直に言うほうがいい｜……正直に言ってくれるほうがいいです」――それでも{b}は、しばらく{a}の顔を見られなかった。|'+
'[昼]{a}は、{b}に配られた動機の中身を見せてほしいと言った。{b}「もう子供じゃない。自分で抱えられる｜もう子供ではない。自分で抱えられる｜もう子供じゃありません。自分で抱えられます」{a}「抱えられるかどうかじゃない。半分持たせて｜抱えられるかどうかではない。半分持たせろ｜抱えられるかどうかじゃありません。半分持たせてください」|'+
'[事件後]{a}は、夜時間に部屋を出ないよう、{b}に何度も念を押した。{b}「何回言うの｜何回言う｜何回言うんですか」{a}「あなたが返事をするまで｜あなたが返事をするまでだ｜あなたが返事をするまでです」――{b}は根負けして、「出ない｜出ない｜出ません」と答えた。')},
{k:'protect',side:'B',cat:'help',mood:'warm',why:'子が親を守る（仲良し）',fx:[{aff:4,trust:6},{aff:6,trust:8}],st:[-2,-8],T:L(
'[裁判]裁判で{b}が疑われたとき、{a}は立ち上がった。{a}「その時間、この人は私と一緒にいた。親を売る子供はいない｜その時間、この人は私と一緒にいた。親を売る子供はいない｜その時間、この人は私と一緒にいました。親を売る子供はいません」{b}は、{a}がいつの間にか自分より大きな声で話すようになっていたことに気づいた。|'+
'[朝食]朝食の席で、{a}は{b}の皿に、自分の分の卵を移した。{b}「逆でしょ。親の役目｜逆だろう。親の役目だ｜逆でしょう。親の役目です」{a}「ここでは、役目は交代制｜ここでは、役目は交代制だ｜ここでは、役目は交代制です」|'+
'[夜]夜時間の前、{a}は{b}の部屋の扉に、内側から椅子を立てかける方法を教えた。{b}「どこで覚えたの、そんなこと｜どこで覚えた、そんなことを｜どこで覚えたんですか、そんなこと」{a}「あなたを守るために、昨日考えた｜あなたを守るために、昨日考えた｜あなたを守るために、昨日考えました」')}
],
boss:[
{k:'speak',side:'B',cat:'conflict',mood:'rub',why:'上司に異を唱える（すれ違い）',T:L(
'[裁判]裁判で、{b}の推理に{a}が真っ向から反対した。職場では一度もなかったことだった。{a}「ここでは、肩書きは関係ない。その推理は間違ってる｜ここでは肩書きは関係ない。その推理は間違っている｜ここでは、肩書きは関係ありません。その推理は間違っています」{b}は一瞬言葉に詰まり、それから「……聞かせて｜……聞かせろ｜……聞かせてください」と言った。|'+
'[昼]{a}は、{b}が動機の封筒を開けないまま持っているのに気づいた。{a}「部下には見せられない中身なの？｜部下には見せられない中身なのか｜部下には見せられない中身ですか」{b}「上司だから、見せられない｜上司だから、見せられない｜上司だから、見せられないんです」|'+
'{a}は、{b}が皆の前で仕切ろうとするのを、初めて止めた。{a}「ここは会社じゃない。全員で決めよう｜ここは会社ではない。全員で決めよう｜ここは会社じゃありません。全員で決めましょう」――{b}は少し寂しそうに、それでも頷いた。')},
{k:'cover',side:'A',cat:'help',mood:'warm',why:'上司が部下を庇う（仲良し）',st:[2,-8],T:L(
'[裁判]裁判で{b}が疑われると、{a}はすぐに口を開いた。{a}「部下のことは、私がいちばん分かってる。この人は、こんなことはしない｜部下のことは、私がいちばん分かっている。この人は、こんなことはしない｜部下のことは、私がいちばん分かっています。この人は、こんなことはしません」{b}は、職場で庇ってもらった日のことを思い出していた。|'+
'[朝食]朝食の席で、{a}は{b}に、いつもの朝礼みたいに今日の予定を話した。{b}「こんな場所でも、朝礼するんだ｜こんな場所でも、朝礼をするのか｜こんな場所でも、朝礼をするんですね」{a}「いつもどおりが、いちばん効く｜いつもどおりが、いちばん効く｜いつもどおりが、いちばん効くんです」――{b}は、久しぶりに背筋が伸びるのを感じた。|'+
'[夜]夜時間の前、{a}は{b}の部屋の前を何度も見回った。{b}「上司に見張られてると、落ち着かない｜上司に見張られていると、落ち着かない｜上司に見張られていると、落ち着きません」{a}「落ち着かなくていい。朝まで生きてくれれば｜落ち着かなくていい。朝まで生きていればいい｜落ち着かなくていいです。朝まで生きていてくれれば」')}
],
mentor:[
{k:'deduce',side:'A',w:1.8,cat:'help',mood:'warm',why:'師が弟子に考え方を教える（仲良し）',fx:[{trust:4},{trust:8,aff:4}],T:L(
'[事件後]捜査時間、{a}は{b}の隣で、現場の見方を一つずつ教えた。{a}「見えたものより、見えなかったものを数えて｜見えたものより、見えなかったものを数えろ｜見えたものより、見えなかったものを数えてください」{b}は、師に教わった稽古と同じ集中で現場を見た。|'+
'[朝食]朝食の席で、{a}は{b}の背筋を指で軽く押した。{a}「怖いときほど、姿勢から崩れる｜怖いときほど、姿勢から崩れる｜怖いときほど、姿勢から崩れます」{b}は背を伸ばし、それだけで少し落ち着いた。|'+
'[裁判]裁判のあと、{a}は{b}に言った。{a}「今日の反論、よかった。教えたとおり｜今日の反論はよかった。教えたとおりだ｜今日の反論、よかったですよ。教えたとおりです」{b}は、褒められたのがいつ以来か思い出せなかった。')},
{k:'refuse',side:'B',w:1.8,cat:'conflict',mood:'rub',why:'弟子が師を疑えない／師に逆らう（葛藤）',T:L(
'[裁判]裁判で、{b}が自分に疑いを向けるよう皆を誘導した。{a}は叫んだ。{a}「やめて！　師匠が身代わりになるなんて、そんな教えは受けてない｜やめろ！　師が身代わりになるなど、そんな教えは受けていない｜やめてください！　師匠が身代わりになるなんて、そんな教えは受けていません」|'+
'[昼]{b}は、配られた動機を見た{a}に言った。{b}「迷ったら、私を疑え。弟子が師を庇って死ぬのは、いちばんの恥｜迷ったら、私を疑え。弟子が師を庇って死ぬのは、いちばんの恥だ｜迷ったら、私を疑ってください。弟子が師を庇って死ぬのは、いちばんの恥です」{a}「……そんな稽古、つけないで｜……そんな稽古はつけるな｜……そんな稽古、つけないでください」|'+
'[事件後]{a}は、{b}の推理に初めて異を唱えた。{a}「師匠の読みは、今回だけは違う｜師の読みは、今回だけは違う｜師匠の読みは、今回だけは違います」{b}は眉を上げてから、黙って{a}の話を最後まで聞いた。')}
],
ex:[
{k:'alibi',cat:'conflict',mood:'rub',why:'元恋人のアリバイ（気まずさ）',fx:[{ten:5},{ten:5}],T:L(
'[裁判]裁判で、{b}の夜時間のアリバイを証言できるのは{a}だけだった。{a}「……二人で、話してた。昔のことを｜……二人で話していた。昔のことを｜……二人で、話していました。昔のことを」――ざわめく裁判場で、{b}は顔を伏せた。|'+
'[昼]{a}は、{b}に配られた動機の封筒に、自分の名前が書かれているのを見てしまった。{b}「見なかったことにして｜見なかったことにしろ｜見なかったことにしてください」{a}「……別れたあとも、まだ巻き込んでる｜……別れたあとも、まだ巻き込んでいるな｜……別れたあとも、まだ巻き込んでいますね」|'+
'[朝食]朝食の席で、{a}と{b}は向かいの席になった。{b}は、{a}が昔と同じようにパンの耳を残すのを見ていた。{b}「……まだ、そうやって食べるんだ｜……まだ、そうやって食べるのか｜……まだ、そうやって食べるんですね」{a}「見ないで｜見るな｜見ないでください」')},
{k:'trust',cat:'help',mood:'warm',why:'元恋人を信じる（仲良し）',st:[-3,-6],T:L(
'[裁判]裁判で疑われた{b}を、{a}は迷わず庇った。{a}「この人は、嘘をつくとき必ず目をそらす。今は、そらしてない｜この人は、嘘をつくとき必ず目をそらす。今はそらしていない｜この人は、嘘をつくとき必ず目をそらします。今は、そらしていません」{b}は、昔の自分の癖を覚えていたことに、少し驚いた。|'+
'[夜]夜時間の前、{b}は{a}の部屋の前で立ち止まった。{b}「別れた相手に言うのも変だけど、明日も生きてて｜別れた相手に言うのも妙だが、明日も生きていろ｜別れた相手に言うのも変ですけど、明日も生きていてください」{a}「そっちこそ｜そちらこそだ｜そちらこそです」|'+
'[事件後]{a}は、眠れない{b}に、付き合っていたころに二人でよく聞いた歌を小さく口ずさんだ。{b}「ずるい。それ、泣く｜ずるい。それは泣く｜ずるいです。それ、泣きます」――それでも、その夜{b}は朝まで眠れた。')}
]
});
scen('whiteroom',{w:1.8,gap:2,max:2,tag:function(ctx,a,b,k){
if(k==='序盤')return ctx.stepIndex<=2;
if(k==='一人')return!!(HK.roomOnlyOne&&HK.roomOnlyOne(ctx.env));
if(k==='長丁場')return ctx.stepIndex>=4;
return false;
}},{
sib:[
{k:'bicker',cat:'conflict',mood:'rub',why:'閉じ込められても口げんか（すれ違い）',T:L(
'[序盤]白い部屋で目を覚ました{a}は、隣で寝ているのが{b}だと分かって、思わず頭を抱えた。{a}「よりによって、あなたと｜よりによって、あなたとか｜よりによって、あなたとですか」{b}「こっちの台詞。子どものころ物置に閉じ込められたのも、あなたのせいだった｜こちらの台詞だ。子どものころ物置に閉じ込められたのも、あなたのせいだった｜こちらの台詞です。子どものころ物置に閉じ込められたのも、あなたのせいでした」|'+
'{a}は、{b}が扉の紙を勝手に破りかけたのを止めた。{a}「昔からそう。説明書を読まないで組み立てる｜昔からそうだ。説明書を読まずに組み立てる｜昔からそうです。説明書を読まないで組み立てるんです」{b}「あなたは読みすぎて、いつまでも始めない｜あなたは読みすぎて、いつまでも始めない｜あなたは読みすぎて、いつまでも始めないんです」|'+
'[長丁場]時計の針ばかり見ている{b}に、{a}が言った。{a}「その貧乏ゆすり、家でもうるさかった｜その貧乏ゆすりは、家でもうるさかった｜その貧乏ゆすり、家でもうるさかったです」{b}「あなたの鼻歌もね｜あなたの鼻歌もな｜あなたの鼻歌もです」――言い合っているうちに、部屋の白さが少しだけ気にならなくなった。')},
{k:'back',cat:'help',mood:'warm',why:'{sibs}で支え合う（仲良し）',st:[-4,-10],T:L(
'{a}は、壁にもたれて黙り込んだ{b}の隣に座り、肩をぶつけた。{a}「家族が一緒なだけ、まし｜家族が一緒なだけ、ましだ｜家族が一緒なだけ、ましです」{b}「……それ、慰めてる？｜……それは慰めているのか｜……それ、慰めていますか」{a}「全力で｜全力でだ｜全力でです」|'+
'[一人]扉の紙を読んだ{b}は、すぐに{a}のほうを向いた。{b}「出るのは、あなた。昔から、いいほうはあなたに譲ってきた｜出るのは、あなただ。昔から、いいほうはあなたに譲ってきた｜出るのは、あなたです。昔から、いいほうはあなたに譲ってきました」{a}「今回だけは譲られない｜今回だけは譲られない｜今回だけは譲られません」|'+
'[長丁場]眠れない{a}に、{b}は子どものころ家で歌っていた歌を小さく口ずさんだ。{a}「……それ、まだ覚えてたんだ｜……それは、まだ覚えていたのか｜……それ、まだ覚えていたんですね」{b}「あなたが寝るまで、何回でも｜あなたが寝るまで、何度でもだ｜あなたが寝るまで、何回でも歌います」')}
],
parent:[
{k:'worry',side:'A',cat:'conflict',mood:'rub',why:'親の心配が空回りする（すれ違い）',T:L(
'{a}は、{b}が扉を何度も蹴るのを止めた。{b}「もう子供じゃない。自分で何とかする｜もう子供ではない。自分で何とかする｜もう子供じゃありません。自分で何とかします」{a}「子供じゃないから、足を折ったら自分で治すの？｜子供でないなら、足を折っても自分で治すのか｜子供じゃないなら、足を折っても自分で治すんですか」――{b}は黙って、足を下ろした。|'+
'[序盤]目を覚ました{a}は、まず{b}の体に怪我がないかを確かめ始めた。{b}「やめて。そういうの、子供のころだけでいい｜やめろ。そういうのは子供のころだけでいい｜やめてください。そういうの、子供のころだけでいいです」{a}「親は、いくつになっても親｜親は、いくつになっても親だ｜親は、いくつになっても親です」|'+
'{a}は、置かれていた食べ物を全部{b}の前に並べた。{b}「あなたも食べて。じゃないと、私も食べない｜あなたも食え。でなければ、私も食べない｜あなたも食べてください。じゃないと、私も食べません」――{a}は観念して、いちばん小さいのを一つ取った。')},
{k:'care',side:'B',cat:'help',mood:'warm',why:'子が親を支える（仲良し）',st:[-4,-10],T:L(
'[長丁場]時計を見ては落ち着かない{b}に、{a}は自分の上着をかけた。{a}「少し寝て。見張りは私がやる｜少し寝ろ。見張りは私がやる｜少し寝てください。見張りは私がやります」{b}「……子供に見張られる日が来るとは｜……子供に見張られる日が来るとはな｜……子供に見張られる日が来るとは」|'+
'[一人]扉の紙を見た{a}は、{b}が口を開く前に言った。{a}「親が子供を置いて出るなんて、言わせない。……でも、子供が親を置いて出るのもなし｜親が子供を置いて出るなど、言わせない。……だが、子供が親を置いて出るのもなしだ｜親が子供を置いて出るなんて、言わせません。……でも、子供が親を置いて出るのもなしです」|'+
'{a}は、白い壁に爪で家の間取りを描いてみせた。{a}「帰ったら、ここの棚を直す約束、まだだったでしょ｜帰ったら、ここの棚を直す約束が、まだだっただろう｜帰ったら、ここの棚を直す約束、まだでしたよね」{b}は笑って、それから少し泣いた。')}
],
friend:[
{k:'blame',cat:'conflict',mood:'rub',why:'閉じ込められた友人どうしの行き違い（すれ違い）',T:L(
'{a}は、{b}が昨夜の店を選んだせいでこうなったのでは、と口にしてしまった。{b}「友達のせいにするんだ｜友人のせいにするのか｜友達のせいにするんですね」{a}「……ごめん。八つ当たり｜……すまない。八つ当たりだ｜……ごめんなさい。八つ当たりです」――{b}は、黙って{a}の背中を一度だけ叩いた。|'+
'[一人]扉の紙を読んで、{a}と{b}は同時に黙り込んだ。{b}「友達でいられるのも、ここまでかな｜友人でいられるのも、ここまでか｜友達でいられるのも、ここまでですかね」{a}「そういうこと、冗談でも言わないで｜そういうことは、冗談でも言うな｜そういうこと、冗談でも言わないでください」|'+
'{a}は、{b}が扉の謎をひとりで解こうとするのにいら立った。{a}「友達なんだから、頼って｜友人なのだから、頼れ｜友達なんですから、頼ってください」{b}「友達だから、格好つけたかった｜友人だから、格好をつけたかった｜友達だから、格好つけたかったんです」')},
{k:'joke',cat:'help',mood:'warm',why:'友人の軽口で支える（仲良し）',st:[-4,-10],T:L(
'{a}は、白い壁に二人の顔の落書きを描いた。{a}「出たら、これを部屋に飾ろう｜出たら、これを部屋に飾ろう｜出たら、これを部屋に飾りましょう」{b}「私の鼻、そんなに大きくない｜私の鼻は、そんなに大きくない｜私の鼻、そんなに大きくありません」――{b}は笑いながら、落書きの鼻を少しだけ小さく描き直した。|'+
'[長丁場]眠れない{b}に、{a}は二人で行った旅行の話を始めた。{b}「あのとき、道に迷ったのも、あなたのせい｜あのとき道に迷ったのも、あなたのせいだ｜あのとき道に迷ったのも、あなたのせいです」{a}「でも、いちばん楽しかったでしょ｜だが、いちばん楽しかっただろう｜でも、いちばん楽しかったでしょう」|'+
'[序盤]目を覚ました{a}は、隣に{b}がいるのを見て、泣きそうな顔で笑った。{a}「知らない人じゃなくて、よかった｜知らない人間でなくて、よかった｜知らない人じゃなくて、よかったです」{b}「友達がいれば、だいたいのことはどうにかなる｜友人がいれば、たいていのことはどうにかなる｜友達がいれば、だいたいのことはどうにかなります」')}
],
childhood:[
{k:'old',cat:'bond',mood:'rub',why:'幼馴染の昔話でからかう（からかい）',fx:[{ten:3,aff:2},{ten:3,aff:2}],T:L(
'{a}は、白い部屋を見回して言った。{a}「子どものころの、あの物置より狭い｜子どものころの、あの物置より狭いな｜子どものころの、あの物置より狭いですね」{b}「あのとき泣いてたの、誰だっけ｜あのとき泣いていたのは、誰だった｜あのとき泣いていたの、誰でしたっけ」{a}「……覚えてない｜……覚えていない｜……覚えていません」|'+
'{a}が扉の紙を読み上げると、{b}は横から間違いを指摘した。{b}「昔から、漢字の読み方だけは怪しい｜昔から、漢字の読み方だけは怪しいな｜昔から、漢字の読み方だけは怪しいですよね」{a}「昔から、揚げ足取りだけは上手｜昔から、揚げ足取りだけは上手だ｜昔から、揚げ足取りだけは上手ですね」|'+
'[長丁場]{b}は、退屈しのぎに{a}の子どものころの失敗を一つずつ数え始めた。{a}「その話を始めたら、あなたのも全部言う｜その話を始めたら、あなたのも全部言う｜その話を始めたら、あなたのも全部言いますよ」――結局、二人とも笑いすぎて息が切れた。')},
{k:'sign',cat:'help',mood:'warm',why:'子どものころの合図（仲良し）',st:[-4,-8],T:L(
'{a}は、うつむいた{b}の手の甲を、子どものころに決めた「大丈夫」の合図で二回叩いた。{b}は顔を上げて、三回叩き返した。{b}「……まだ有効なんだ、それ｜……まだ有効なのか、それは｜……まだ有効なんですね、それ」{a}「一生有効｜一生有効だ｜一生有効です」|'+
'[序盤]白い部屋で目を覚ました{a}は、隣の{b}の袖を、子どものころ迷子になったときと同じようにつかんだ。{b}「ここにいる。昔と同じ｜ここにいる。昔と同じだ｜ここにいます。昔と同じです」|'+
'[一人]扉の紙を読んだあと、{a}は{b}に言った。{a}「子どものころの約束、覚えてる？　置いていかないって｜子どものころの約束を覚えているか。置いていかないと｜子どものころの約束、覚えていますか。置いていかないって」{b}「覚えてる。だから、二人で出る方法を探す｜覚えている。だから、二人で出る方法を探す｜覚えています。だから、二人で出る方法を探します」')}
],
ex:[
{k:'awk',cat:'conflict',mood:'rub',why:'元恋人と閉じ込められた気まずさ（すれ違い）',fx:[{ten:5},{ten:5}],T:L(
'[序盤]目を覚ました{a}は、向かいの壁にもたれているのが{b}だと分かって、しばらく言葉が出なかった。{b}「……久しぶり｜……久しぶりだな｜……お久しぶりです」{a}「別れてから、いちばん会いたくない場所で会った｜別れてから、いちばん会いたくない場所で会ったな｜別れてから、いちばん会いたくない場所で会いましたね」|'+
'{a}は、扉の紙を読む{b}の横顔を見て、別れた日のことを思い出した。{b}「何｜何だ｜何ですか」{a}「何でもない｜何でもない｜何でもありません」――白い部屋の静けさが、二人のあいだの距離を余計に目立たせた。|'+
'[長丁場]{b}は、部屋の隅で膝を抱えたまま言った。{b}「付き合ってたころも、こうやって黙ってる時間が多かった｜付き合っていたころも、こうして黙っている時間が多かった｜付き合っていたころも、こうやって黙っている時間が多かったですね」{a}「あのころは、黙ってても平気だった｜あのころは、黙っていても平気だった｜あのころは、黙っていても平気でした」')},
{k:'know',cat:'help',mood:'warm',why:'元恋人だから分かる気遣い（仲良し）',st:[-3,-8],T:L(
'{a}は、{b}が狭いところが苦手なのを覚えていて、扉からいちばん遠い、広く感じる隅を譲った。{b}「……覚えてたんだ｜……覚えていたのか｜……覚えていたんですね」{a}「別れても、忘れることと忘れないことがある｜別れても、忘れることと忘れないことがある｜別れても、忘れることと忘れないことがあります」|'+
'[長丁場]眠れない{b}に、{a}は昔と同じように、背中合わせに座った。{b}「別れた相手に、こういうことするの、ずるい｜別れた相手にこういうことをするのは、ずるい｜別れた相手に、こういうことをするの、ずるいです」{a}「今は、ここから出る仲間｜今は、ここから出る仲間だ｜今は、ここから出る仲間です」|'+
'[一人]扉の紙を読んだ{a}は、迷わず{b}を振り返った。{a}「出るのは、あなた。別れたときに、幸せになってって言ったから｜出るのは、あなただ。別れたときに、幸せになれと言ったからな｜出るのは、あなたです。別れたときに、幸せになってくださいと言いましたから」{b}「勝手に決めないで。それも昔から｜勝手に決めるな。それも昔からだ｜勝手に決めないでください。それも昔からです」')}
],
mentor:[
{k:'calm',side:'A',w:1.8,cat:'help',mood:'warm',why:'師が弟子を落ち着かせる（仲良し）',fx:[{trust:4},{trust:8,aff:4}],st:[-2,-10],T:L(
'{a}は、扉を叩き続ける{b}の手首をつかんだ。{a}「慌てるな。稽古で何を教えた｜慌てるな。稽古で何を教えた｜慌てないでください。稽古で何を教えましたか」{b}は息を整えて、「……まず、周りを見る｜……まず、周りを見る｜……まず、周りを見ます」と答えた。|'+
'[長丁場]{a}は、白い床に正座して、{b}にも座るよう促した。{a}「時間がある。稽古の続きをしよう｜時間はある。稽古の続きをしよう｜時間はあります。稽古の続きをしましょう」{b}は呆れた顔で笑って、それでも師の向かいに座った。|'+
'{a}は、扉の紙の謎に詰まった{b}に、答えではなく問いを一つだけ投げた。{b}は少し考えてから、目を見開いた。{b}「……そういうこと｜……そういうことか｜……そういうことですね」{a}「答えは、いつも弟子が見つける｜答えは、いつも弟子が見つける｜答えは、いつも弟子が見つけるものです」')},
{k:'defy',side:'B',w:1.8,cat:'conflict',mood:'rub',why:'弟子が師に逆らう（すれ違い）',T:L(
'[一人]扉の紙を読んだ{b}は、静かに言った。{b}「出るのは弟子のほう。それが師の務め｜出るのは弟子のほうだ。それが師の務めだ｜出るのは弟子のほうです。それが師の務めです」{a}「そんな教え、聞いたことない｜そんな教えは聞いたことがない｜そんな教え、聞いたことがありません」――{a}は、初めて師の言葉に首を振った。|'+
'{a}は、{b}の言う扉の開け方に、初めて異を唱えた。{a}「今回だけは、師匠の読みが違う｜今回だけは、師の読みが違う｜今回だけは、師匠の読みが違います」{b}は眉を上げて、それから黙って{a}に場所を譲った。|'+
'[長丁場]{b}が稽古の型を始めようとすると、{a}はそっぽを向いた。{a}「閉じ込められてまで稽古なんて、嫌｜閉じ込められてまで稽古など、ごめんだ｜閉じ込められてまで稽古なんて、嫌です」{b}「嫌でもやる。それが弟子｜嫌でもやる。それが弟子だ｜嫌でもやるんです。それが弟子です」――結局、{a}は文句を言いながら型をなぞった。')}
]
});
function osx(c){return c&&c.om&&c.om.sex;}
function oheat(c){return!!(c&&c.om&&((osx(c)==='o'&&c.om.heat>0)||(osx(c)==='a'&&c.om.rut>0)));}
scen('omega',{w:1.6,gap:4,max:2,tag:function(ctx,a,b,k){
if(k==='発情')return oheat(a)||oheat(b);
if(k==='Ω')return osx(a)==='o'||osx(b)==='o';
if(k==='偏見')return(ctx.env.society==null?60:ctx.env.society)>55;
return false;
}},{
ex:[
{k:'scent',cat:'conflict',mood:'rub',why:'元恋人の匂いと気まずさ（すれ違い）',fx:[{ten:5},{ten:5}],T:L(
'{a}は、すれ違った{b}の匂いが、付き合っていたころと変わっていないことに気づいて足を止めた。{b}「……何｜……何だ｜……何ですか」{a}「何でもない。抑制剤、まだあの銘柄なんだ｜何でもない。抑制剤は、まだあの銘柄か｜何でもありません。抑制剤、まだあの銘柄なんですね」――{b}は答えずに、早足で歩き去った。|'+
'[発情]{a}の発情期を聞きつけた{b}は、部屋の前まで来て、扉を叩けずに立ち尽くした。{b}「別れた相手が来ても、迷惑なだけか｜別れた相手が来ても、迷惑なだけか｜別れた相手が来ても、迷惑なだけですよね」――{b}は抑制剤の袋だけを扉の前に置いて、その場を離れた。|'+
'{a}は、{b}の首元から知らない匂いがすることに気づいた。{a}「……新しい相手、できたんだ｜……新しい相手ができたのか｜……新しい相手、できたんですね」{b}「あなたには関係ない｜あなたには関係ない｜あなたには関係ありません」――そう言った{b}の声は、少しだけ揺れていた。')},
{k:'care',cat:'help',mood:'warm',why:'元恋人だから知っている気遣い（仲良し）',st:[-3,-8],T:L(
'[Ω]{a}は、{b}の抑制剤の切れる日を、まだ覚えていた。前の日に、薬局の袋を黙って{b}の机に置いた。{b}「別れたのに、こういうことする｜別れたのに、こういうことをするのか｜別れたのに、こういうことするんですね」{a}「別れたのは恋人としてで、知り合いとしてじゃない｜別れたのは恋人としてで、知り合いとしてではない｜別れたのは恋人としてで、知り合いとしてじゃありません」|'+
'[偏見]第二性のことで心ない言葉を浴びた{b}の前に、{a}が立った。{a}「その人のことは、私がよく知ってる。あなたたちよりずっと｜その人のことは、私がよく知っている。あなたたちよりずっとだ｜その人のことは、私がよく知っています。あなたたちよりずっと」――元恋人の背中を、{b}は久しぶりに見上げた。|'+
'{a}と{b}は、別れてから初めて、二人で落ち着いて話した。{b}「番になれなかったのは、あなたのせいじゃない｜番になれなかったのは、あなたのせいではない｜番になれなかったのは、あなたのせいじゃありません」{a}「……ありがとう。やっと、ちゃんと友達になれそう｜……すまない。やっと、ちゃんと友人になれそうだ｜……ありがとうございます。やっと、ちゃんと友達になれそうです」')}
],
childhood:[
{k:'test',cat:'bond',mood:'rub',why:'第二性が分かる前からの幼馴染（からかい）',fx:[{ten:3,aff:2},{ten:3,aff:2}],T:L(
'{a}は、{b}に第二性の検査の日の話を持ち出した。{a}「結果の紙、震えて落としたの、覚えてる｜結果の紙を震えて落としたのを、覚えているか｜結果の紙、震えて落としたの、覚えていますか」{b}「落としたのはあなた｜落としたのはあなただ｜落としたのはあなたです」――二人の記憶は、毎回少しずつ食い違った。|'+
'{a}は、{b}の匂いについて遠慮なく言った。{a}「子どものころは、日なたの匂いだけだったのに｜子どものころは、日なたの匂いだけだったのにな｜子どものころは、日なたの匂いだけだったのに」{b}「人の匂いを、昔と比べないで｜人の匂いを、昔と比べるな｜人の匂いを、昔と比べないでください」|'+
'[偏見]第二性で人を見る人たちの話になったとき、{b}は{a}の肩を叩いた。{b}「あなたなんて、検査の前から変わってない。泣き虫のまま｜あなたなど、検査の前から変わっていない。泣き虫のままだ｜あなたなんて、検査の前から変わっていません。泣き虫のままです」{a}「それ、褒めてないよね｜それは褒めていないな｜それ、褒めていませんよね」')},
{k:'stay',cat:'help',mood:'warm',why:'幼馴染の変わらない距離（仲良し）',st:[-4,-8],T:L(
'[発情]{a}の発情期だと聞いて、{b}は子どものころ風邪をひいたときと同じように、玄関先に好物と抑制剤を置いた。扉越しに、{b}は言った。{b}「何年たっても、やることは同じ｜何年たっても、やることは同じだ｜何年たっても、やることは同じです」|'+
'{a}は、第二性のことで落ち込む{b}に、子どものころの写真を見せた。{a}「このころから、あなたはあなた。検査の紙一枚で変わらない｜このころから、あなたはあなただ。検査の紙一枚で変わらない｜このころから、あなたはあなたです。検査の紙一枚で変わりません」{b}は写真を受け取って、しばらく黙っていた。|'+
'[偏見]心ない噂に{a}がうつむいていると、{b}は昔と同じ合図で、{a}の手の甲を二回叩いた。{a}「……子どものころの合図｜……子どものころの合図だな｜……子どものころの合図ですね」{b}「大人になっても有効｜大人になっても有効だ｜大人になっても有効です」')}
],
friend:[
{k:'meddle',cat:'conflict',mood:'rub',why:'友人どうしの第二性をめぐる行き違い（すれ違い）',T:L(
'{a}は、{b}が抑制剤を飲み忘れているのに気づいて、皆の前で口にしてしまった。{b}「友達でも、それは人前で言わないで｜友人でも、それは人前で言うな｜友達でも、それは人前で言わないでください」{a}「……ごめん。心配で、つい｜……すまない。心配で、つい｜……ごめんなさい。心配で、つい言ってしまいました」|'+
'{a}は、{b}が匂いの合う相手の話ばかりするのに、少しむっとした。{a}「友達より、匂いのほうが大事？｜友人より、匂いのほうが大事か｜友達より、匂いのほうが大事ですか」{b}「そういう話じゃない｜そういう話ではない｜そういう話じゃありません」――言い返したあとで、{b}は少しだけ反省した。|'+
'[偏見]{b}が第二性で人を決めつけるような冗談を言った。{a}は笑わなかった。{a}「友達だから言う。今のは、よくない｜友人だから言う。今のはよくない｜友達だから言います。今のは、よくないです」{b}はしばらく黙って、それから「……ごめん｜……すまない｜……ごめんなさい」と頭を下げた。')},
{k:'cover',cat:'help',mood:'warm',why:'友人の発情期・偏見に寄り添う（仲良し）',st:[-4,-10],T:L(
'[発情]{a}は、{b}の発情期のあいだ、頼まれた買い物を玄関先に届け続けた。{b}「友達に、こんなことまで｜友人に、こんなことまで｜友達に、こんなことまで」{a}「友達だから、こんなことまで｜友人だから、こんなことまでだ｜友達だから、こんなことまでです」|'+
'[偏見]第二性のせいで店を断られた{b}の手を引いて、{a}は別の店に入った。{a}「こっちのほうが、おいしいって評判｜こちらのほうが、うまいと評判だ｜こちらのほうが、おいしいって評判です」{b}は、{a}がわざと明るい声を出しているのに気づいていた。|'+
'{a}は、第二性の話を一度もしないまま、{b}と一晩じゅうくだらない話をした。{b}「あなたといると、自分の第二性を忘れられる｜あなたといると、自分の第二性を忘れられる｜あなたといると、自分の第二性を忘れられます」{a}「忘れてていい日も、あっていい｜忘れていい日も、あっていい｜忘れていい日も、あっていいんです」')}
],
sib:[
{k:'bicker',cat:'conflict',mood:'rub',why:'第二性の違う{sibs}の口げんか（すれ違い）',T:L(
'{a}は、{b}の抑制剤の箱を見つけて、家にいたころと同じ調子で小言を言った。{b}「家族だからって、全部知ってなくていい｜家族だからといって、全部知っていなくていい｜家族だからって、全部知っていなくていいです」{a}「家族だから、知っておきたい｜家族だから、知っておきたい｜家族だから、知っておきたいんです」|'+
'{a}と{b}は、親からの電話で、第二性の違いで比べられた話をした。{b}「昔からそう。あなたは『期待の子』で、私は『心配な子』｜昔からそうだ。あなたは『期待の子』で、私は『心配な子』だ｜昔からそうです。あなたは『期待の子』で、私は『心配な子』です」{a}「それ、私も嫌だった｜それは私も嫌だった｜それ、私も嫌でした」|'+
'[発情]{a}の発情期に、{b}は部屋の前で見張りを買って出た。{a}「家族に見張られるの、恥ずかしいんだけど｜家族に見張られるのは、恥ずかしいのだが｜家族に見張られるの、恥ずかしいんですけど」{b}「恥ずかしいのと危ないの、どっちがいい｜恥ずかしいのと危ないのと、どちらがいい｜恥ずかしいのと危ないの、どちらがいいですか」')},
{k:'guard',cat:'help',mood:'warm',why:'{sibs}で守り合う（仲良し）',st:[-4,-10],T:L(
'[偏見]第二性のことで{b}を笑った人に、{a}は真っ先に食ってかかった。{a}「私の家族に、何か用？｜私の家族に、何か用か｜私の家族に、何か用ですか」――あとで{b}は、子どものころ公園で庇ってもらったときと同じ顔で礼を言った。|'+
'[発情]{a}は、発情期で動けない{b}のために、子どものころ親が作ってくれたスープを作って届けた。{b}「……これ、家の味｜……これは家の味だ｜……これ、家の味ですね」{a}「第二性が違っても、家の味は同じ｜第二性が違っても、家の味は同じだ｜第二性が違っても、家の味は同じです」|'+
'{a}と{b}は、第二性の検査の結果が分かった日のことを話した。{b}「あの日、あなたが『どっちでも、{sib:a→b}は{sib:a→b}だ』って言った｜あの日、あなたが『どちらでも、{sib:a→b}は{sib:a→b}だ』と言った｜あの日、あなたが『どちらでも、{sib:a→b}は{sib:a→b}だ』と言いました」{a}「今も変わらない｜今も変わらない｜今も変わりません」')}
],
parent:[
{k:'worry',side:'A',cat:'conflict',mood:'rub',why:'親の心配が重い（すれ違い）',T:L(
'[Ω]{a}は、{b}の抑制剤の残りを数えようとして、手を払われた。{b}「もう子供じゃないんだけど｜もう子供ではないのだが｜もう子供じゃないんですけど」{a}「知ってる。でも、第二性が分かった日から、ずっと心配なの｜知っている。だが、第二性が分かった日から、ずっと心配している｜知っています。でも、第二性が分かった日から、ずっと心配なんです」|'+
'{a}は、{b}に番の話を持ち出した。{b}「相手くらい、自分で決める｜相手くらい、自分で決める｜相手くらい、自分で決めます」{a}「決めていい。ただ、決めたら最初に教えて｜決めていい。ただ、決めたら最初に教えろ｜決めていいです。ただ、決めたら最初に教えてください」――{b}は、返事のかわりに小さく頷いた。|'+
'[偏見]第二性の噂を気にした{a}は、{b}に夜の外出を控えるよう言った。{b}「あまり帰りは遅くならないように、って、何歳まで言われるの｜あまり帰りは遅くならないように、と、何歳まで言われるんだ｜あまり帰りは遅くならないように、って、何歳まで言われるんですか」{a}「この街が変わるまで｜この街が変わるまでだ｜この街が変わるまでです」')},
{k:'care',side:'B',cat:'help',mood:'warm',why:'子が親を支える（仲良し）',st:[-4,-10],T:L(
'[偏見]第二性のことで心ない言葉を浴びて帰ってきた{b}に、{a}は温かいお茶を淹れた。{a}「昔、私が言われたとき、あなたはこうしてくれた｜昔、私が言われたとき、あなたはこうしてくれた｜昔、私が言われたとき、あなたはこうしてくれました」{b}は湯呑みを両手で包んで、しばらく黙っていた。|'+
'{a}は、{b}が抑制剤の副作用で疲れているのに気づいて、家事を全部引き受けた。{b}「親に気を遣わなくていい｜親に気を遣わなくていい｜親に気を遣わなくていいですよ」{a}「気を遣ってるんじゃない。家族の分担｜気を遣っているのではない。家族の分担だ｜気を遣っているんじゃありません。家族の分担です」|'+
'{a}は、{b}が若いころの第二性の話を、初めて聞かせてもらった。{a}「話してくれて、ありがとう｜話してくれて、感謝している｜話してくださって、ありがとうございます」{b}「あなたが大人になったから、話せた｜あなたが大人になったから、話せた｜あなたが大人になったから、話せたんです」')}
],
mentor:[
{k:'teach',side:'A',cat:'help',mood:'warm',why:'師が第二性に振り回されない生き方を教える（仲良し）',fx:[{trust:4},{trust:8,aff:4}],T:L(
'{a}は、第二性を理由に自分を小さく見積もる{b}に言った。{a}「第二性で決まるのは、匂いだけ。腕は、稽古で決まる｜第二性で決まるのは匂いだけだ。腕は稽古で決まる｜第二性で決まるのは、匂いだけです。腕は、稽古で決まります」{b}は、その日いつもより長く稽古場に残った。|'+
'[発情]{b}の発情期が明けた日、{a}はいつもと何も変わらない顔で稽古の続きを始めた。{b}「休んだぶん、遅れた｜休んだぶん、遅れた｜休んだぶん、遅れました」{a}「休むのも稽古のうち｜休むのも稽古のうちだ｜休むのも稽古のうちです」|'+
'[偏見]{b}が第二性で試合から外されかけたとき、{a}は自分の名前で抗議文を書いた。{a}「弟子を外すなら、師も外して｜弟子を外すなら、師も外せ｜弟子を外すなら、師も外してください」――翌日、{b}の名前は名簿に戻っていた。')},
{k:'defy',side:'B',cat:'conflict',mood:'rub',why:'弟子が師に逆らう（すれ違い）',T:L(
'{a}は、ラットの気配を隠して稽古に出てきた{b}を止めた。{a}「今日は休んで。師匠でも、その状態で教えるのは危ない｜今日は休め。師でも、その状態で教えるのは危ない｜今日は休んでください。師匠でも、その状態で教えるのは危ないです」{b}「弟子に指図される日が来るとは｜弟子に指図される日が来るとはな｜弟子に指図される日が来るとは」|'+
'{a}は、{b}の言う「第二性に合った戦い方」に、初めて首を振った。{a}「私は、私のやり方でやる｜私は、私のやり方でやる｜私は、私のやり方でやります」{b}はしばらく黙ってから、{a}の構えを見て「……悪くない｜……悪くない｜……悪くありません」とだけ言った。|'+
'[偏見]{b}が世間の目を気にして、{a}に表立って動かないよう言った。{a}「師匠に教わったのは、引かないことだった｜師に教わったのは、引かないことだった｜師匠に教わったのは、引かないことでした」{b}は苦い顔で、それでも反論しなかった。')}
]
});
})();
});
;
/* ==== js/tie-stage.js ==== */
HK.Load.def(16,'js/tie-stage.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK|| !HK.COMMON)return;
function L(s){return s.split('|');}
var PK=['proud','stern','tsun','gentle','devoted','cool','free','shy','polite'];
function per(c){var k=c&&(c.persona||(HK.personaOf&&HK.personaOf(c)))||'gentle';return PK.indexOf(k)>=0?k:'gentle';}
function own(ctx){return ctx&&ctx.scen&& /^(zombie|whiteroom|omega)$/.test(ctx.scen.id)?0.35:1;}
function here(c){return HK.State?HK.State.here(c):c.alive;}
var TS=HK.TieStage={};
var KINDS=['mentor','master','boss','teacher'];
var ROLE={
mentor:{ra:'師匠',rb:'弟子',task:'稽古'},
master:{ra:'主',rb:'従者',task:'務め'},
boss:{ra:'上司',rb:'部下',task:'仕事'},
teacher:{ra:'教師',rb:'生徒',task:'課題'}
};
function stageTie(ctx,a,b){
if(!HK.Ties|| !HK.Ties.all)return null;
var l=HK.Ties.all(ctx,a,b);
for(var i=0;i<l.length;i++)if(KINDS.indexOf(l[i].type)>=0)return l[i];
return null;
}
TS.tie=stageTie;
TS.grade=function(t){return t&&(t.cold==='good'||t.cold==='bad')?t.cold:'';};
function fill(t,a,b,R0,c){
var ra=(R0===ROLE.mentor&&HK.Ties&&HK.Ties.mentorCall&&HK.Ties.mentorCall(a,b))||R0.ra;
return t.replace(/\{a\}/g,a.name).replace(/\{b\}/g,b.name).replace(/\{c\}/g,c?c.name:'').replace(/\{ra\}/g,ra).replace(/\{rb\}/g,R0.rb).replace(/\{task\}/g,R0.task);
}
var SET={
chide:L('{a}は{b}が{task}に取り組む様子を黙って見ていたが、やがて口を開いた。「{b}、そこは手を抜くところじゃない｜{b}、そこは手を抜くところではない｜{b}、そこは手を抜くところではありません」|{b}がつい近道をしたのを、{a}は見逃さなかった。「{b}。急ぐのと雑なのは違う｜＝｜{b}。急ぐのと雑なのは違います」|{a}は{b}を呼び止めて、静かに嗜めた。「さっきの言い方は、少し棘があった。気をつけて｜さっきの言い方は、少し棘があった。気をつけろ｜さっきの言い方は、少し棘がありました。気をつけてください」'),
success:L('{b}が任された{task}を、思っていたよりずっと早く片づけた。{a}はその出来を確かめるように、しばらく黙って眺めていた。|{b}は、{a}に教わったとおりのやり方で、難しい場面を切り抜けた。周りから小さな声が上がった。|{b}が{a}の顔をうかがいながら、仕上げたものを差し出した。文句のつけようのない出来だった。'),
fail:L('{b}は{task}でしくじった。取り返しがつかないほどではないが、{a}の目の前だった。|{b}の判断が一拍遅れて、段取りが崩れた。{b}は唇を噛んで、{a}のほうを見られなかった。|{b}は{a}に言われたことを守れず、同じ失敗を繰り返した。{b}の肩が小さく落ちた。')
};
var RE={
chide:{
pos:{
proud:L('{b}は一瞬むっとしたが、すぐに頭をかいた。「……分かったよ。やり直す」|{b}「ちっ、言われると思った。――次は文句言わせねえ」{b}はそう言って、もう一度最初から手をつけた。|{b}は舌打ちを飲み込んで、短く「了解」と返した。{a}の言うことが正しいのは、{b}がいちばん分かっていた。'),
stern:L('{b}は背筋を伸ばして、深く頭を下げた。「ご指摘、もっともです。改めます」|{b}は言い訳をせずに頷いた。「気が緩んでいました。……二度としません」|{b}は黙ってやり直し始めた。その手つきは、さっきよりずっと丁寧だった。'),
tsun:L('{b}「べ、別に手を抜いたわけじゃないし！　……でも、やり直す」|{b}は頬をふくらませながらも、言われたとおりに直した。「……これでいい？」|{b}「言われなくても分かってたもん」――そう言いつつ、{b}の手はもう直しにかかっていた。'),
gentle:L('{b}は素直に頷いた。「ごめんなさい、気をつけるね。教えてくれてありがとう」|{b}「そっか、そういうことか。……うん、やり直してみる」{b}は穏やかに笑った。|{b}は{a}の言葉を胸の中で繰り返して、小さく頭を下げた。「次は、ちゃんとやるね」'),
devoted:L('{b}は慌てて頭を下げた。「すみません！　すぐに直します」――{b}の目は、叱られたことより期待されていることを喜んでいた。|{b}「{a}に言ってもらえるなら、何度でも直します」{b}は真剣な顔で手を動かし始めた。|{b}は{a}の言葉を一言も聞き漏らすまいと、じっと耳を傾けてから深く頷いた。'),
cool:L('{b}は少し考えてから頷いた。「確かに、効率を優先しすぎた。修正する」|{b}「指摘は妥当だ。改める」――{b}の返事は短かったが、手はすぐに動いていた。|{b}は自分のやり方を見直して、小さく息を吐いた。「……そっちのほうが筋がいい。直す」'),
free:L('{b}「あちゃー、ばれた？　ごめんごめん、ちゃんとやる！」{b}は笑って、袖をまくり直した。|{b}は大げさに肩を落としてみせた。「はーい、反省してまーす」――けれど、その直し方は真面目だった。|{b}「了解！　次は文句なしのやつ見せるから」{b}はにっと笑って、もう一度取りかかった。'),
shy:L('{b}は真っ赤になって、小さく頷いた。「……ご、ごめんなさい。直します」|{b}は俯いたまま「はい」とだけ答え、言われたところを一つずつ丁寧に直した。|{b}は恥ずかしそうに唇を噛んで、それでも{a}の目を見て「……ありがとう、ございます」と言った。'),
polite:L('{b}は姿勢を正した。「ご指導、痛み入ります。すぐに改めます」|{b}「お見苦しいところをお見せしました」――{b}は丁寧に頭を下げて、手順を一から確かめ直した。|{b}は{a}の言葉を手帳に書き留めた。「二度と同じ過ちはいたしません」')
},
neg:{
proud:L('{b}は鼻で笑った。「はあ？　いちいちうるせえな。やり方くらい自分で決める」|{b}「文句があるなら自分でやれよ」――{b}は道具を放り出して、そっぽを向いた。|{b}は{a}を睨み返した。「{ra}だからって、何でも言えると思うなよ」'),
stern:L('{b}は表情を変えずに言った。「お言葉ですが、私は間違っていません」――二人のあいだの空気が、すっと冷えた。|{b}は黙ったまま、返事をしなかった。手も止めなかったが、やり方も変えなかった。|{b}「……聞いておきます」――それは、聞く気がないという意味だった。'),
tsun:L('{b}「なによ、ちょっとくらいいいでしょ！　もう知らない！」{b}はぷいと背を向けた。|{b}は唇をとがらせて、わざと聞こえるように溜め息をついた。「はいはい、どうせ私が悪いんでしょ」|{b}「そんな言い方しなくてもいいじゃない……！」――{b}は目を潤ませて、その場を離れた。'),
gentle:L('{b}は困ったように笑ったが、目は笑っていなかった。「……そっか。私なりに頑張ったんだけどな」|{b}は小さく頷いたきり、しばらく{a}と口をきかなかった。|{b}「分かった。……でも、少しだけ一人にして」――{b}はそう言って、背を向けた。'),
devoted:L('{b}は泣きそうな顔で俯いた。「……私、また{a}をがっかりさせたんですね」――それきり、{b}は黙り込んだ。|{b}は唇を震わせた。「どうせ私なんか、何をやっても駄目なんです」|{b}は頭を下げたまま、しばらく顔を上げなかった。拗ねた背中だけが、{a}に向けられていた。'),
cool:L('{b}は眉一つ動かさずに返した。「結果が同じなら、過程はどうでもいいはずだ」|{b}「その指摘、根拠は？」――{b}は冷ややかに{a}を見返した。|{b}は肩をすくめた。「好みの問題だ。直す必要は感じない」'),
free:L('{b}「えー、いいじゃんこれで。細かいなあ」{b}はへらへら笑って、まるで聞いていなかった。|{b}は口笛を吹いて聞こえないふりをした。{a}の溜め息が、少し大きくなった。|{b}「はいはい、お説教タイムね」――{b}は大きなあくびで返事をした。'),
shy:L('{b}は何も言わずに俯いたが、拳は小さく握られていた。その日、{b}は{a}の顔を一度も見なかった。|{b}は小さく「……すみません」と言ったきり、隅のほうに引っ込んでしまった。|{b}は泣きそうな顔で{a}を見上げ、何か言いかけて、結局黙って背を向けた。'),
polite:L('{b}は丁寧に、しかし冷たく言った。「ご忠告ありがとうございます。参考にいたします」|{b}「承知いたしました」――言葉づかいは丁寧だったが、{b}は{a}と目を合わせなかった。|{b}は深々と頭を下げた。それが、これ以上は聞かないという意思表示だった。')
}
},
success:{
pos:{
proud:L('{a}はにやりと笑って、{b}の肩を強く叩いた。「やるじゃねえか。さすが私の{rb}だ」|{a}「……ふん、まあまあだな」――そう言いながら、{a}の口元は明らかに緩んでいた。|{a}「よくやった。今日の手柄は全部お前のもんだ」{b}は照れくさそうに頭をかいた。'),
stern:L('{a}は短く頷いた。「見事だ。教えた甲斐があった」――滅多に褒めない{a}の一言に、{b}は背筋を伸ばした。|{a}「さすがだ。……誇っていい」{a}はそれだけ言って、{b}の仕事を指でなぞった。|{a}は{b}をまっすぐに見て、一言だけ言った。「合格だ」'),
tsun:L('{a}「べ、別に驚いてないし。……でも、まあ、すごいんじゃない？」|{a}は顔を背けたまま言った。「ちょっとだけ、見直した。ちょっとだけね」|{a}「次もこのくらいできたら、褒めてあげなくもない」――{a}の耳は赤かった。'),
gentle:L('{a}は目を細めて、{b}の頭をそっと撫でた。「すごいね。頑張ったね」|{a}「さすが{b}。ずっと見てたよ、一生懸命だったの」――{b}ははにかんで笑った。|{a}は心から嬉しそうに手を叩いた。「本当によくできてる。私も鼻が高いよ」'),
devoted:L('{a}は{b}の手を両手で包んだ。「ありがとう。{b}がいてくれて、本当によかった」|{a}「やっぱり{b}はすごい。私が教えることなんて、もうないくらい」|{a}は感極まったように、何度も頷いた。「さすがです……いえ、さすがだね、{b}」'),
cool:L('{a}は出来を確かめて、小さく頷いた。「想定以上だ。いい判断だった」|{a}「この精度なら申し分ない。さすがだ」――淡々とした声に、確かな評価がこもっていた。|{a}「次からは、この手の判断は任せる」それが、{a}なりの最上の褒め言葉だった。'),
free:L('{a}「うわ、すっご！　さすが{b}、天才じゃん！」{a}は{b}の背中をばしばし叩いた。|{a}は大げさに拍手して見せた。「はい優勝！　今日のMVP！」――{b}は笑いながらも、嬉しそうだった。|{a}「やるねえ。私の{rb}、最高」{a}は親指を立てて、にかっと笑った。'),
shy:L('{a}は少しもじもじしてから、小さな声で言った。「……す、すごかった。さすが、だね」|{a}は何か言おうとして言葉が見つからず、代わりに{b}の袖をきゅっと掴んで頷いた。|{a}「あの……よくできてた、と、思う……」――{a}の頬は、{b}より赤かった。'),
polite:L('{a}は丁寧に一礼した。「お見事でした。さすがでございます」|{a}「たいへん素晴らしい出来です。私も見習わねばなりませんね」|{a}は穏やかに微笑んだ。「よく努められました。誇りに思います」')
},
neg:{
proud:L('{a}は鼻を鳴らした。「一回うまくいったくらいで調子に乗るなよ」|{a}「たまたまだろ。次も同じようにできたら認めてやる」――{b}の笑みが、すっと引いた。|{a}は{b}の仕事を一瞥して、そっぽを向いた。「その程度で胸を張るな」'),
stern:L('{a}は眉一つ動かさなかった。「当然だ。この程度で浮かれるな」|{a}「慢心は失敗の元だ。気を引き締めろ」――褒め言葉は、最後まで出てこなかった。|{a}は出来を確かめて、粗を一つだけ指摘した。それ以外は、何も言わなかった。'),
tsun:L('{a}「ふーん。……で？　それくらい、誰でもできるでしょ」|{a}はわざとらしく欠伸をした。「調子に乗らないでよね」|{a}「べつに、すごくなんかないし」――{a}はそう言い捨てて、そっぽを向いた。'),
gentle:L('{a}は穏やかに笑ったが、その声は少し冷たかった。「うん、よかったね。……でも、あまり調子に乗らないでね」|{a}「できて当たり前のことだよ。浮かれないで」――{b}は返す言葉を失った。|{a}は小さく息をついた。「褒めてほしいの？　まだ早いと思うな」'),
devoted:L('{a}は困ったように眉を寄せた。「それで満足しちゃうの？　{b}なら、もっとできるはずなのに」|{a}「……私がいなくても、もう平気みたいだね」――その声には、どこか拗ねた響きがあった。|{a}は{b}の出来をじっと見て、ため息をついた。「調子に乗ると、すぐ転ぶよ」'),
cool:L('{a}は淡々と言った。「誤差の範囲だ。評価には値しない」|{a}「再現性がなければ意味がない。調子に乗るな」|{a}は結果だけを確かめると、もう興味を失ったように視線を外した。'),
free:L('{a}「はいはい、まぐれまぐれ」――{a}は笑ったが、{b}の顔は笑っていなかった。|{a}は{b}の頭を軽く小突いた。「ドヤ顔すんなって。調子乗りすぎ」|{a}「へー、よかったね。で、次は？」――{a}の軽い口調が、{b}の胸に刺さった。'),
shy:L('{a}は目を逸らしたまま、ぼそりと言った。「……調子に、乗らないで」|{a}は{b}が褒め言葉を待っているのに気づいて、気まずそうに黙り込んだ。|{a}「べ、べつに……普通だと、思う」――{a}はそれだけ言って、逃げるように離れた。'),
polite:L('{a}は丁寧に、しかし冷ややかに言った。「この程度で誇られては困ります」|{a}「慢心なさいませんよう」――{a}は一礼して、それ以上は何も言わなかった。|{a}は微笑んだまま言った。「お喜びのところ恐縮ですが、まだ道半ばかと」')
}
},
fail:{
pos:{
proud:L('{a}は{b}の背中を乱暴に叩いた。「しけた顔すんな。失敗したら、取り返せばいいだけだ」|{a}「私だって昔は散々やらかした。次で倍返しにしろ」――{b}は顔を上げた。|{a}は黙って{b}の失敗の後始末を手伝い、終わってから一言だけ言った。「次は頼むぞ」'),
stern:L('{a}は静かに言った。「失敗から学べばいい。原因は分かっているな」{b}が頷くと、{a}はそれ以上責めなかった。|{a}「顔を上げろ。ここで折れるな」――厳しい声だったが、{b}にはそれが励ましだと分かった。|{a}は{b}の隣に立ち、手順をもう一度だけ見せた。「次は、できる」'),
tsun:L('{a}「もう、しょうがないなあ！　……ほら、手伝ってあげるから泣かないの」|{a}「べつに心配してないけど！　次はちゃんとやりなさいよね」――そう言いながら、{a}は{b}の肩をそっと撫でた。|{a}は口をとがらせて、それでも{b}の隣にしゃがみ込んだ。「一緒にやり直そ」'),
gentle:L('{a}は{b}の肩にそっと手を置いた。「大丈夫。誰だって失敗するよ。一緒にやり直そう」|{a}「頑張ってたの、ちゃんと見てたから。気にしないで」――{b}の目に、涙がにじんだ。|{a}は柔らかく笑った。「失敗したぶん、次はきっとうまくいくよ」'),
devoted:L('{a}は{b}の手を取った。「{b}のせいじゃないよ。私の教え方が足りなかった」|{a}「どんな{b}でも、私は信じてる。だから、もう一回やってみよう」|{a}は{b}が泣き止むまで、黙ってそばにいた。'),
cool:L('{a}は淡々と状況を整理した。「被害は軽微だ。修正すれば問題ない。次の手を考えよう」|{a}「失敗は情報だ。何が悪かったか分かれば、それでいい」――{b}は少しだけ肩の力を抜いた。|{a}は{b}に、次の段取りを短く指示した。責める言葉は一つもなかった。'),
free:L('{a}「どんまいどんまい！　失敗は成功のもとって言うじゃん」{a}は{b}の背中を叩いて笑った。|{a}「よーし、リベンジだ！　次は二人でやろ」――{b}もつられて笑った。|{a}は自分の昔の失敗話を面白おかしく話して、{b}を笑わせた。'),
shy:L('{a}はおずおずと{b}の袖を引いた。「あ、あの……大丈夫、だよ。私も、よく失敗するから」|{a}は何も言わずに、{b}の手にそっと温かい飲み物を握らせた。|{a}「……つ、次は、きっとできる」――小さな声だったが、{b}にはちゃんと届いた。'),
polite:L('{a}は穏やかに言った。「お気になさらず。誰にでもあることです。次に活かせば十分です」|{a}「ご自分を責めすぎませんよう。私が付いております」|{a}は丁寧に手順を示し直した。「もう一度、ご一緒にいたしましょう」')
},
neg:{
proud:L('{a}は大きく舌打ちした。「何やってんだよ。教えたこと、もう忘れたのか」|{a}「これだから任せられねえんだ」――{b}は唇を噛んで、俯いた。|{a}は{b}の失敗を鼻で笑った。「さすがだな。期待を裏切らない」'),
stern:L('{a}は冷たく言った。「何度目だ。言い訳は聞かない」|{a}「……失望した」――その一言が、どんな叱責より重く{b}にのしかかった。|{a}は黙って{b}の失敗を片づけ、終わってから言った。「次はないと思え」'),
tsun:L('{a}「ほら見なさい、だから言ったじゃない！」|{a}は呆れたように腕を組んだ。「ほんっと、私がいないと何もできないんだから」|{a}「べつに慰めてあげないからね」――{a}はそう言って、さっさと背を向けた。'),
gentle:L('{a}は困ったように笑った。「あれだけ教えたのにね。……まあ、仕方ないか」――その優しい声が、かえって{b}を傷つけた。|{a}「無理しなくていいよ。向いてないのかもしれないし」|{a}はため息をつきながら、黙って{b}の失敗を直した。'),
devoted:L('{a}は悲しそうに首を振った。「どうして……私、ちゃんと教えたよね？」|{a}「{b}なら、できると思ってたのに」――{b}は、その言葉に何も返せなかった。|{a}は{b}から目を逸らした。「……私の時間、無駄だったのかな」'),
cool:L('{a}は冷ややかに言った。「予想どおりの失敗だ。驚きもしない」|{a}「同じ間違いを繰り返すのは、学習していない証拠だ」|{a}は{b}の失敗を淡々と記録した。そこに、慰めの言葉はなかった。'),
free:L('{a}「うわ、やっちゃったねー。さすがにそれはないわ」{a}はけらけら笑った。|{a}「はい、期待してなかったから大丈夫」――{a}の軽口に、{b}は顔をこわばらせた。|{a}は{b}の失敗を、わざと周りに聞こえるように話した。'),
shy:L('{a}は小さく息を呑んで、目を伏せた。「……また、だね」――それだけの言葉が、{b}には痛かった。|{a}は何も言わず、ただ困ったように{b}を見つめた。その沈黙が、何より堪えた。|{a}「……私、もう、どう教えたらいいか、分からない」'),
polite:L('{a}は丁寧に言った。「お見事な失敗でございますね」――{b}は、その皮肉に言い返せなかった。|{a}「次からは、別の方にお願いすべきでしょうか」|{a}は微笑みを崩さずに言った。「同じことを、何度申し上げればよろしいのでしょう」')
}
}
};
TS.SET=SET;TS.RE=RE;
var SIT_WHY={chide:{pos:'嗜められて素直に聞いた',neg:'嗜められてヘソを曲げた'},success:{pos:'成功を「さすが」と認めた',neg:'成功に「調子に乗るな」'},fail:{pos:'失敗を励ました',neg:'失敗に嫌味を言った'}};
var GR_NAME={'':'ふつう',good:'良好',bad:'険悪'};
HK.addTo(HK.COMMON,{
id:'tie_grade',label:'上の立場の人が叱る・褒める・励ます',cat:'bond',scope:'pair',
when:function(ctx,a,b){return!!stageTie(ctx,a,b);},
w:function(ctx){return 0.9*own(ctx);},
run:function(ctx,a,b){
var t=stageTie(ctx,a,b),U=ctx.chars[t.a],D=ctx.chars[t.b],R0=ROLE[t.type],g=TS.grade(t),rng=ctx.rng;
var x=rng(),sit=x<0.34?'chide':x<0.67?'success':'fail';
var who=sit==='chide'?D:U,other=who===U?D:U,r=ctx.R(who,other);
var pPos=g==='good'?0.85:g==='bad'?0.2:HK.clamp(0.35+(r.aff+r.trust)/200-r.ten/150+(who.tr.np-0.5)*0.3,0.15,0.85);
var side=rng()<pPos?'pos':'neg';
var text=fill(ctx.pick(SET[sit]),U,D,R0)+fill(ctx.pick(RE[sit][side][per(who)]),U,D,R0);
if(side==='pos')ctx.mod2(U,D,{aff:3,trust:4},{aff:4,trust:5});
else ctx.mod2(U,D,{ten:5,aff: -3},{ten:6,aff: -4});
if(sit==='fail')ctx.stress(D,side==='pos'? -6:10);
var pf=ctx.pair(U,D);pf.gradeN=(pf.gradeN||0)+(side==='pos'?1: -1);
return{cat:side==='neg'?'conflict':sit==='fail'?'help':'bond',text:text,why:U.name+'（'+R0.ra+'）と'+D.name+'（'+R0.rb+'）・仲：'+GR_NAME[g]+'／'+who.name+'は'+SIT_WHY[sit][side],mag:10};
}
});
var TRIAL={
open:{
mentor:L('{a}は{b}を呼び、静かに告げた。「今日は試す。私に一本でも入れられたら、認めてやる｜＝｜今日は試します。私に一本でも入れられたら、認めます」|{a}「{b}、そろそろ見極めさせてもらう｜＝｜{b}、そろそろ見極めさせてもらいます」――{a}は{b}に、これまでで最も難しい課題を言い渡した。|{a}は{b}の前に立ちはだかった。「教えたことを、全部見せてみて｜教えたことを、全部見せてみろ｜教えたことを、全部見せてください」'),
master:L('{a}は{b}に、ひとりで果たすには重すぎる務めを命じた。「やり遂げてみせて。それができてこそ、私の{rb}だ｜やり遂げてみせろ。それができてこそ、私の{rb}だ｜やり遂げてみせてください。それができてこそ、私の{rb}です」|{b}は{a}の前に膝をついた。「一度だけ、私に任せてくれない？｜一度だけ、私に任せてくれないか｜一度だけ、私に任せていただけませんか」{a}はしばらく黙ってから、頷いた。|{a}は{b}を試すように言った。「あなたが私の代わりに決めて。今日だけは｜今日だけは、あなたが私の代わりに決めろ｜今日だけは、あなたが私の代わりに決めてください」'),
boss:L('{a}は{b}に、大きな判断をまるごと任せた。「責任者は{b}だ。私は口を出さない｜＝｜責任者は{b}です。私は口を出しません」|{a}「{b}、この件の段取りは全部任せる。結果で見せて｜{b}、この件の段取りは全部任せる。結果で見せろ｜{b}、この件の段取りは全部任せます。結果で見せてください」――{b}の顔がこわばった。|{a}は{b}を試すように、わざと難しい役目を振った。「できないなら、そう言っていい｜＝｜できないなら、そう言ってかまいません」'),
teacher:L('{a}は{b}に、とっておきの難題を出した。「これが解けたら、もう私から教えることはない｜＝｜これが解けたら、もう私から教えることはありません」|{a}「{b}、今日は私の代わりに皆の前に立ってみて｜{b}、今日は私の代わりに皆の前に立ってみろ｜{b}、今日は私の代わりに皆の前に立ってみてください」――{b}は息を呑んだ。|{a}は{b}の答えを、最後まで黙って聞くと言った。「間違えても、止めない｜＝｜間違えても、止めません」')
},
graduate:L('{b}は、{a}の課した試練をやり遂げた。{a}はしばらく黙ってから、深く頷いた。「……認める。{b}はもう一人前だ｜＝｜……認めます。{b}はもう一人前です」|{a}は{b}の肩に手を置いた。「認める。これからは、隣に並んで歩いて｜認める。これからは、隣に並んで歩け｜認めます。これからは、隣に並んで歩いてください」――{b}は唇を噛んで、涙をこらえた。|{a}「よくここまで来たな｜よくここまで来た｜よくここまで来ましたね」――{a}の声は、いつになく柔らかかった。{b}は深く頭を下げた。それは、{rb}としての最後の礼だった。'),
overturn:L('{b}は、{a}の予想をはるかに超えてみせた。それどころか、{a}の考えの甘さまで言い当てた。その場の誰もが、二人の立場が入れ替わったことを悟った。|{b}「もう、あなたの指図は受けない｜＝｜もう、あなたの指図は受けません」――{b}はまっすぐに{a}を見据えた。{a}は言い返そうとして、言葉が出なかった。|{b}は{a}の判断を退け、自分のやり方で場をまとめてしまった。{a}は黙ってそれを見ているしかなかった。上と下は、もう逆さまだった。'),
reconcile:L('しばらくして、{a}は苦笑した。「……追い越されたか。悔しいけど、見事だ｜……追い越されたか。悔しいが、見事だ｜……追い越されましたか。悔しいですが、見事です」{b}も肩の力を抜いて、手を差し出した。二人の手は、対等な高さで結ばれた。|{a}「あなたに教わる日が来るとはな｜あなたに教わる日が来るとは思わなかった｜あなたに教わる日が来るとは思いませんでした」――{b}は照れくさそうに笑った。「教わったことを返しただけ｜教わったことを返しただけだ｜教わったことを返しただけです」|{a}と{b}は、言い争いのあとで並んで座った。立場は変わったが、二人のあいだの信頼は、前よりずっと深くなっていた。'),
part:L('{a}は何も言わずに背を向けた。{b}も、追いかけなかった。二人のあいだに、もう上も下もなかった。あるのは、深い溝だけだった。|{a}「……勝手にして｜……勝手にしろ｜……勝手にしてください」{b}「うん、そうする｜ああ、そうする｜ええ、そうします」――それきり、二人は互いの名前を呼ばなくなった。|{b}は{a}の前で、静かに頭を下げた。それは感謝ではなく、決別の礼だった。'),
expel:{
mentor:L('{a}は{b}の失敗を見届けると、冷たく言い放った。「破門。二度と私の弟子を名乗らないで｜破門だ。二度と私の弟子を名乗るな｜破門です。二度と私の弟子を名乗らないでください」――{b}は青ざめて、その場に立ち尽くした。|{a}「あなたには失望した。今日限り、師でも弟子でもない｜＝｜あなたには失望しました。今日限り、師でも弟子でもありません」――{b}は何か言いかけて、言葉を失った。|{a}は{b}に背を向けた。「出直してきて。……いや、もう来なくていい｜出直してこい。……いや、もう来なくていい｜出直してきてください。……いや、もう来なくていいです」'),
master:L('{a}は{b}を見下ろして言った。「もういい。あなたには暇を出す｜＝｜もう結構です。あなたには暇を出します」――長年仕えてきた{b}の顔から、血の気が引いた。|{a}「私の{rb}は、こんな真似はしない｜＝｜私の{rb}は、こんな真似はしません」――{a}はそれだけ言って、{b}を下がらせた。|{a}は{b}から預けていた鍵を取り上げた。「今日から、あなたは私の{rb}じゃない｜今日から、あなたは私の{rb}ではない｜今日から、あなたは私の{rb}ではありません」'),
boss:L('{a}は短く告げた。「この件から外れてくれ。{b}にはもう任せられない｜この件から外れろ。{b}にはもう任せられない｜この件から外れてください。{b}にはもう任せられません」――{b}の顔がこわばった。|{a}「期待していた分、残念だ｜＝｜期待していた分、残念です」――{a}は{b}の担当をすべて取り上げた。|{a}は{b}を呼び出し、淡々と言った。「明日から、私の下じゃなくて、別の場所で働いてもらう｜明日から、私の下ではなく、別の場所で働いてもらう｜明日から、私の下ではなく、別の場所で働いてもらいます」'),
teacher:L('{a}は深い溜め息をついた。「……もう、私には{b}に教えられることはない｜＝｜……もう、私には{b}に教えられることはありません」――それは、見放すという意味だった。|{a}「好きにして。私はもう口を出さない｜好きにしろ。私はもう口を出さない｜好きにしてください。私はもう口を出しません」――{b}は、その言葉の冷たさに震えた。|{a}は{b}の答えを最後まで聞かずに、背を向けた。「{b}のことは、もう知らない｜＝｜{b}のことは、もう知りません」')
}
};
TS.TRIAL=TRIAL;
TS.MARKS={expel:'破門',graduate:'一人前',overturn:'主従逆転'};
function installMarks(){if(HK.MARK_NAME)for(var k in TS.MARKS)if(!HK.MARK_NAME[k])HK.MARK_NAME[k]=TS.MARKS[k];}
HK.addTo(HK.COMMON,{
id:'tie_trial',label:'一人前か下剋上か、節目の試練',cat:'conflict',scope:'pair',
when:function(ctx,a,b){var t=stageTie(ctx,a,b);return!!t&&ctx.stepIndex>=2&& !ctx.pair(a,b).trialDone&&here(a)&&here(b);},
w:function(ctx){return 0.14*own(ctx);},
run:function(ctx,a,b){
var t=stageTie(ctx,a,b),U=ctx.chars[t.a],D=ctx.chars[t.b],R0=ROLE[t.type],pf=ctx.pair(U,D),g=TS.grade(t),rng=ctx.rng;
pf.trialDone=true;installMarks();
var ru=ctx.R(U,D),rd=ctx.R(D,U);
var skill=D.tr.cp*0.3+D.tr.lead*0.3+D.tr.a*0.2+rng()*0.6+(pf.gradeN||0)*0.03;
var warm=(ru.aff+rd.aff+ru.trust+rd.trust)/4-(ru.ten+rd.ten)/3+(g==='good'?20:g==='bad'? -20:0);
var k=skill>0.95&&(warm<25||D.tr.cp>0.62)?'overturn':skill>0.62&&warm> -10?'graduate':warm<5||g==='bad'?'expel':'graduate';
var text=fill(ctx.pick(TRIAL.open[t.type]),U,D,R0),mark=k,why=U.name+'（'+R0.ra+'）が'+D.name+'（'+R0.rb+'）に試練を課した',cat='bond',after='';
if(k==='graduate'){
text+=fill(ctx.pick(TRIAL.graduate),U,D,R0);
t.cold='good';ctx.mod2(U,D,{trust:14,aff:8,ten: -8},{trust:12,aff:10,ten: -8});
why+='／'+D.name+'はやり遂げ、一人前と認められた（仲：良好）';
}else if(k==='expel'){
text+=fill(ctx.pick(TRIAL.expel[t.type]),U,D,R0);
t.cold='bad';ctx.mod2(U,D,{trust: -18,aff: -10,ten:16},{trust: -12,aff: -14,ten:20});ctx.stress(D,25);
why+='／'+D.name+'は応えられず、'+{mentor:'破門された',master:'暇を出された',boss:'担当を外された',teacher:'見放された'}[t.type]+'（仲：険悪）';
cat='conflict';
}else{
text+=fill(ctx.pick(TRIAL.overturn),U,D,R0);
cat='conflict';
var dark=HK.TieMasterR18&&HK.TieMasterR18.overturn?HK.TieMasterR18.overturn(ctx,D,U,t):null;
if(dark){after=dark.text;why+='／'+D.name+'は'+U.name+'を超え、立場が逆さまになった（下剋上）。'+dark.why;t.cold='bad';}
else if(warm>0||D.tr.np+U.tr.np>1.05){
after=fill(ctx.pick(TRIAL.reconcile),U,D,R0);t.cold='good';
ctx.mod2(U,D,{trust:10,aff:6,ten: -6},{trust:8,aff:6,ten: -6});
why+='／'+D.name+'は'+U.name+'を超え、立場が逆さまになった（下剋上）。二人は和解した';
}else{
after=fill(ctx.pick(TRIAL.part),U,D,R0);t.cold='bad';
ctx.mod2(U,D,{trust: -12,aff: -10,ten:14},{trust: -10,aff: -8,ten:12});
why+='／'+D.name+'は'+U.name+'を超え、立場が逆さまになった（下剋上）。二人は決別した';
}
if(t.type==='master'){var ta=t.a;t.a=t.b;t.b=ta;}
text+=after;
}
var e=ctx.act2({actors:[U,D],cat:cat,mag:30,text:text,why:why});
if(e)e.mark=(e.mark||[]).concat([mark]);
return null;
}
});
var FOND={
watch:L('{a}は少し離れたところから、{b}の様子をそっと見守っていた。{b}が無事に役目を終えると、{a}は誰にも気づかれないように胸をなで下ろした。|{a}は{b}の背中を目で追っていた。声をかけるつもりはなかった。ただ、そこにいてくれるだけでよかった。|{a}は{b}が困っていないか、ときどき振り返って確かめた。{b}が笑っているのを見ると、{a}も少しだけ笑った。'),
gift:L('{a}は{b}の分の飲み物を、黙って{b}の近くに置いておいた。名乗るつもりは、最初からなかった。|{a}は手に入れた甘いものを半分に割って、包み直してから{b}の荷物の上にそっと置いた。|{a}は{b}が好きだと聞いたものを、どこからか見つけてきて差し入れた。「たまたま余っただけ｜たまたま余っただけだ｜たまたま余っただけです」と、目を合わせずに言った。'),
notice:L('{b}はそれに気づいて、{a}のほうへ小さく頭を下げた。{a}は慌てて目を逸らしたが、耳まで赤くなっていた。|{b}「いつもありがとう。気づいてたよ｜いつも感謝している。気づいていた｜いつもありがとうございます。気づいていました」――{a}はうろたえて、「なんのこと｜何のことだ｜何のことですか」としか言えなかった。|{b}は{a}に笑いかけて、差し入れのお礼に、自分の分を少し分けた。{a}はそれを、宝物のように受け取った。'),
unaware:L('{b}はそれが誰の心遣いなのか知らないまま、「助かった｜＝｜助かりました」と呟いた。{a}はそれで十分だった。|{b}は気づかずに通り過ぎていった。{a}は、それでいいと思った。慕っているのは、自分の勝手だから。|{b}は差し入れに首をかしげ、近くにいた誰かに礼を言った。{a}は少しだけ苦笑して、何も言わなかった。')
};
HK.addTo(HK.COMMON,{
id:'tie_fond',label:'慕う相手を陰から見守る',cat:'help',scope:'pair',
when:function(ctx,a,b){return!!(HK.Ties&&HK.Ties.from(ctx,a,b,'fond'));},
w:function(ctx){return 1.1*own(ctx);},
run:function(ctx,a,b){
var k=ctx.rng()<0.5?'watch':'gift',noticed=ctx.rng()<0.25+b.tr.a*0.3+b.tr.np*0.2;
var text=ctx.t(ctx.pick(FOND[k])+ctx.pick(FOND[noticed?'notice':'unaware']),a,b);
ctx.mod(a,b,{aff:3,trust:2});
if(noticed)ctx.mod(b,a,{aff:5,trust:4});else ctx.mod(b,a,{trust:1});
ctx.stress(b,-4);
return{text:text,why:a.name+'は'+b.name+'を一方的に慕っている（敬愛）／'+(k==='watch'?'見守る':'差し入れ')+'・'+b.name+'は'+(noticed?'気づいた':'気づいていない'),mag:8};
}
});
var BLIND={
push:L('{c}が{b}に話しかけようとすると、{a}がすっと間に入った。「{b}は今、忙しい。用があるなら私が聞く｜＝｜{b}は今、忙しいです。用があるなら私が聞きます」|{a}は{c}を呼び止めて、低い声で言った。「{b}の邪魔はしないで。{b}には、余計な人はいらない｜{b}の邪魔はするな。{b}には、余計な人はいらない｜{b}の邪魔はしないでください。{b}には、余計な人はいりません」|{c}が{b}の隣に座ろうとしたとき、{a}は先にその席に荷物を置いた。「ここは空いてない｜ここは空いていない｜ここは空いていません」'),
praise:L('{a}は{c}に向かって、熱っぽく言った。「{b}の言うことは、いつも正しい。疑う人の気が知れない｜＝｜{b}の言うことは、いつも正しいです。疑う人の気が知れません」――{c}は返す言葉に困った。|{a}「{b}に逆らうなら、私が相手になる｜＝｜{b}に逆らうなら、私が相手になります」――{a}の目は、少しも笑っていなかった。|{a}は{b}の言葉を一言一句繰り返して、{c}にも同じようにさせようとした。'),
calm:L('{b}は困ったように{a}を見た。「{a}、そこまでしなくていいから｜{a}、そこまでしなくていい｜{a}、そこまでしなくていいです」{a}はすぐに頭を下げたが、{c}を見る目つきは変わらなかった。|{b}が「{c}とも話したい｜＝｜{c}とも話したいです」と言うと、{a}はしぶしぶ道を空けた。けれど、二人の会話が終わるまで、ずっとそばを離れなかった。|{b}は{a}の肩に手を置いて、なだめた。{a}はそれだけで、嘘のように大人しくなった。'),
blind:L('{b}は{a}がしたことに気づいていなかった。{c}だけが、遠ざけられた理由を飲み込めずにいた。|{c}は肩をすくめて引き下がった。{b}のまわりには、いつの間にか{a}しかいなくなっていた。|{b}は{a}を褒めた。「いつも気が利くね｜いつもよく気が利く｜いつも気が利きますね」――{a}は誇らしげに頷いた。{c}は、それを遠くから見ていた。')
};
HK.addTo(HK.COMMON,{
id:'tie_blind',label:'盲信する相手に近づく人を遠ざける',cat:'conflict',scope:'pair',
when:function(ctx,a,b){
if(!(HK.Ties&&HK.Ties.from(ctx,a,b,'blind')))return false;
return ctx.others(b).some(function(c){return c!==a&&ctx.R(c,b).aff>5;});
},
w:function(ctx,a){return(0.7+a.tr.jealous*0.5)*own(ctx);},
run:function(ctx,a,b){
var cs=ctx.others(b).filter(function(c){return c!==a&&ctx.R(c,b).aff>5;}),c=cs[Math.floor(ctx.rng()*cs.length)];
var k=ctx.rng()<0.6?'push':'praise',kb=ctx.rng()<0.3+b.tr.np*0.3?'calm':'blind';
var text=ctx.t((ctx.pick(BLIND[k])+ctx.pick(BLIND[kb])),a,b,c);
ctx.mod2(a,c,{ten:6,aff: -3},{ten:8,aff: -5});ctx.mod(c,b,{aff: -2});
if(kb==='calm')ctx.mod(b,a,{ten:3,trust:1});else ctx.mod(b,a,{aff:2});
return{with:[c],text:text,why:a.name+'は'+b.name+'を盲信している／'+c.name+'を'+b.name+'から遠ざけようとした'+(kb==='calm'?'（'+b.name+'がなだめた）':'（'+b.name+'は気づいていない）'),mag:12};
}
});
})();
});
;
/* ==== js/tie-abuse.js ==== */
HK.Load.def(17,'js/tie-abuse.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK|| !HK.COMMON)return;
function L(s){return s.split('|');}
function own(ctx){return ctx&&ctx.scen&& /^(zombie|whiteroom|omega)$/.test(ctx.scen.id)?0.4:1;}
function tieOf(ctx,a,b){return HK.Ties&&HK.Ties.has?HK.Ties.has(ctx,a,b,'abuse'):null;}
function here(ctx){return ctx.present?ctx.present():ctx.chars;}
var X={
control:L('{a}は{b}のスマホを取り上げ、履歴を一件ずつ確かめた。「この名前、誰？｜この名前は、誰だ？｜この名前、誰ですか？」――{b}は、答える前に謝っていた。|{a}は{b}が誰かと話すたびに、あとで「何を話したの｜何を話したんだ｜何を話したんですか」と一言ずつ確かめた。{b}は、だんだん誰とも話さなくなった。|{a}「私がいないところで、勝手に動くな｜＝｜私がいないところで、勝手に動かないでください」――{b}は頷いた。頷かないと、あとが長いことを知っていた。|{a}は{b}の着る服を選び、{b}が選んだ服は「似合わない｜＝｜似合いません」と言って脱がせた。{b}は、もう自分で選ばなくなっていた。'),
verbal:L('{a}「あなたみたいなのと一緒にいてやれるの、私くらいだよ｜あなたのような者と一緒にいてやれるのは、私くらいだ｜あなたみたいな人と一緒にいてあげられるのは、私くらいですよ」――{b}は笑おうとして、うまく笑えなかった。|{a}は皆の前で、{b}の失敗をわざと大きな声で話した。{b}は俯いたまま、何も言い返さなかった。|{a}「なんでそんなこともできないの？　何回言わせるの｜なぜそんなこともできないんだ？　何回言わせる気だ｜どうしてそんなこともできないんですか？　何回言わせるんですか」――{b}の声は、だんだん小さくなっていった。|{a}は{b}が何か言いかけるたびに、ため息で遮った。{b}は、話すのをやめた。'),
violence:L('{a}は壁を拳で殴った。すぐそばにいた{b}は、肩をすくめたまま動けなかった。|{a}は{b}の腕を、跡が残るほど強く掴んだ。「どこ行くの｜どこへ行く｜どこへ行くんですか」――{b}は「どこにも｜どこにも行かない｜どこにも行きません」と答えた。|{a}が手を振り上げた瞬間、{b}は目をつむった。手は、{b}の顔のすぐ横の扉を叩いた。|{a}は{b}の持っていたものを床に叩きつけた。{b}は黙って、散らばった破片を拾い集めた。'),
honey:L('{a}は{b}を抱きしめて、何度も謝った。「ごめん、本当にごめん。あなたがいないと駄目なんだ｜すまない、本当にすまない。あなたがいないと駄目なんだ｜ごめんなさい、本当にごめんなさい。あなたがいないと駄目なんです」――{b}は、その腕の中で目を閉じた。|{a}はその夜、{b}の好きなものを買ってきて、別人のように優しく笑った。{b}は「やっぱり、本当は優しい人なんだ｜＝｜やっぱり、本当は優しい人なんです」と思った。|{a}「もう二度としない。約束する｜＝｜もう二度としません。約束します」――{b}はその約束を、前にも聞いたことがあった。それでも、頷いた。'),
stay:L('{b}は、{a}の機嫌が悪いのは自分のせいだと思っていた。「私がちゃんとしてれば｜私がちゃんとしていれば｜私がちゃんとしていれば、よかったんです」――そう言って、腕の痣を袖で隠した。|{b}は周りに「大丈夫、あの人、本当は優しいから｜大丈夫だ、あの人は、本当は優しい｜大丈夫です、あの人、本当は優しいですから」と笑ってみせた。その笑顔は、少しも笑っていなかった。|{b}は{a}の顔色をうかがいながら、言われる前にお茶を淹れた。そうしていれば、今日は穏やかに過ごせる。'),
fear:L('{b}は{a}の足音が近づくだけで、体を固くした。|{b}は{a}の前では、言葉を選び、笑う場所を選び、息をする間合いまで選んでいた。|{a}が名前を呼んだ。{b}はびくりと肩を震わせ、「なに？｜何だ？｜何ですか？」と、できるだけ明るい声で返した。'),
flee:L('{b}は、{a}が眠ったのを確かめてから、こっそり荷物をまとめ始めた。手が震えて、うまく畳めなかった。|{b}は{a}の目を盗んで、出口までの道を何度も頭の中でなぞった。|{b}は小さな声で、自分に言い聞かせた。「次に手を上げたら、出ていく｜＝｜次に手を上げたら、出ていきます」――それを言うのは、もう三度目だった。'),
notice:L('{c}は、{b}の袖口からのぞく痣に気づいた。「……それ、どうしたの｜……それは、どうしたんだ｜……それ、どうしたんですか」――{b}は「ぶつけただけ｜ぶつけただけだ｜ぶつけただけです」と笑った。{c}は笑わなかった。|{c}は、{a}がいるときだけ{b}が無口になることに気づいていた。{c}「{b}、何かあったら、ちゃんと言って｜{b}、何かあったら、ちゃんと言え｜{b}、何かあったら、ちゃんと言ってください」|{c}は{a}が席を外した隙に、{b}の手を握った。「一人で抱えなくていいから｜一人で抱えなくていい｜一人で抱えなくていいですから」――{b}の目に、初めて涙がにじんだ。'),
step:L('{c}は{a}と{b}のあいだに割って入った。「やめなよ。今のは、ただの喧嘩じゃない｜やめろ。今のは、ただの喧嘩じゃない｜やめてください。今のは、ただの喧嘩じゃありません」――{a}は舌打ちして、その場を離れた。|{a}が{b}に詰め寄ったとき、{c}が{b}の前に立った。{c}「{b}に話があるなら、まず私を通して｜{b}に話があるなら、まず私を通せ｜{b}に話があるなら、まず私を通してください」|{c}は{b}の肩を抱いて、{a}から引き離した。{a}「関係ないだろ｜関係ないだろう｜関係ないでしょう」{c}「関係ある。{b}は、私の大事な人だから｜関係ある。{b}は、私の大事な人だ｜関係あります。{b}は、私の大事な人ですから」'),
free:L('{b}は{a}の前に立ち、震える声で言った。「もう、あなたとは一緒にいられない｜＝｜もう、あなたとは一緒にいられません」――{a}は何か言いかけたが、{b}はもう目を逸らさなかった。|{b}は{c}に支えられながら、{a}に別れを告げた。{a}がどんなに謝っても、{b}はもう頷かなかった。|{b}「好きだった。でも、もう怖いほうが大きい｜＝｜好きでした。でも、もう怖いほうが大きいんです」――{b}はそれだけ言って、{a}に背を向けた。'),
lJeal:L('{a}は{b}が誰かと楽しそうに話しているのを見て、露骨に不機嫌になった。「……べつに。楽しそうだったね｜……別に。楽しそうだったな｜……別に。楽しそうでしたね」|{a}「どこ行ってたの？　連絡くらいしてよ｜どこへ行っていた？　連絡くらいしろ｜どこに行っていたんですか？　連絡くらいしてください」――{b}は「ごめん｜すまない｜すみません」と言いながら、少しだけ息苦しさを覚えた。|{a}は{b}の予定を全部知りたがった。{b}は、それが愛情なのか心配性なのか、分からなくなっていた。'),
lFight:L('{a}と{b}は、些細なことで言い合いになった。{a}の言葉はいつも少しだけ強すぎて、{b}はいつも先に黙った。|{a}は{b}の言うことを最後まで聞かずに、「でもさ」と遮った。{b}は、言いたかったことを飲み込んだ。|{a}と{b}は、同じことでまた揉めた。結局、謝ったのは今回も{b}のほうだった。'),
lMake:L('{a}は気まずそうに{b}の隣に座り、「さっきは言いすぎた｜＝｜さっきは言いすぎました」と呟いた。{b}は少し迷ってから、{a}の手を握った。|{a}は{b}の好きな飲み物を黙って差し出した。仲直りの合図だと、{b}には分かった。|{b}「ちゃんと話そう。私の話も、最後まで聞いて｜ちゃんと話そう。私の話も、最後まで聞け｜ちゃんと話しましょう。私の話も、最後まで聞いてください」{a}は少し驚いて、それから小さく頷いた。')
};
HK.addTo(HK.COMMON,{
id:'tie_abuse',label:'すれ違いの多い恋人の束縛と喧嘩',cat:'conflict',scope:'pair',
when:function(ctx,a,b){var t=tieOf(ctx,a,b);return!!t&& !ctx.pair(a,b).abFree;},
w:function(ctx){return 1.4*own(ctx);},
run:function(ctx,a,b){
var t=tieOf(ctx,a,b),A=ctx.chars[t.a],B=ctx.chars[t.b],pf=ctx.pair(A,B),st=t.cold||'';
var heavy= !!(HK.Content&&HK.Content.ok(ctx,'abuse')),rng=ctx.rng,k,C=null,lab='歪んだ関係';
if(!heavy){
var x0=rng();
k=x0<0.4?'lJeal':x0<0.75?'lFight':'lMake';
if(k==='lMake')ctx.mod2(A,B,{aff:3,ten: -4},{aff:3,ten: -4});else ctx.mod2(A,B,{ten:3},{ten:4,trust: -2});
return{cat:k==='lMake'?'bond':'conflict',text:ctx.t(ctx.pick(X[k]),A,B),why:A.name+'と'+B.name+'（すれ違いの多い恋人）'+{lJeal:'：やきもち・束縛気味',lFight:'：言い合い',lMake:'：仲直り'}[k]+'／重い場面は「内容のスイッチ」の「DVなど歪んだ関係」で入れられます',mag:8};
}
pf.abN=(pf.abN||0)+1;
var friends=here(ctx).filter(function(c){return c!==A&&c!==B&&ctx.R(c,B).aff>10;});
C=friends.sort(function(x,y){return(y.tr.np+ctx.R(y,B).aff/100)-(x.tr.np+ctx.R(x,B).aff/100);})[0]||null;
var freeP=(st==='flee'?0.3:st==='fear'?0.15:0.05)+(pf.abSeen?0.15:0)+Math.min(0.2,(pf.abN-3)*0.04);
if(pf.abN>=3&&(C||st==='flee')&&rng()<freeP)k='free';
else if(C&&rng()<0.28)k=pf.abSeen&&rng()<0.55?'step':'notice';
else{
var x=rng();
k=x<0.26?'control':x<0.48?'verbal':x<0.62?'violence':x<0.8?'honey':st==='flee'?'flee':st==='fear'?'fear':'stay';
}
var text=ctx.t(ctx.pick(X[k]).replace(/\{c\}/g,C?C.name:'仲間'),A,B);
if(k==='control'){ctx.mod2(A,B,{att:2},{ten:5,trust: -3});ctx.stress(B,6);}
else if(k==='verbal'){ctx.mod2(A,B,{ten:2},{aff: -4,ten:6});ctx.stress(B,8);}
else if(k==='violence'){ctx.mod2(A,B,{ten:4},{aff: -6,trust: -6,ten:10});ctx.stress(B,12);}
else if(k==='honey'){ctx.mod2(A,B,{att:3},{att:st?2:5,aff:st?2:5,ten: -3});ctx.stress(B,-4);}
else if(k==='stay'||k==='fear'||k==='flee')ctx.stress(B,k==='stay'?3:6);
else if(k==='notice'||k==='step'){pf.abSeen=true;ctx.mod2(B,C,{trust:8,aff:5},{aff:4});if(k==='step')ctx.mod2(A,C,{ten:10},{ten:8,trust: -6});ctx.stress(B,-5);}
else if(k==='free'){
pf.abFree=true;pf.couple=false;
ctx.mod2(B,A,{att: -30,aff: -15,ten:6},{ten:8});ctx.stress(B,-10);
if(C)ctx.mod2(B,C,{trust:10,aff:6},{aff:5,trust:4});
}
if(HK.Emo&& /^(?:control|verbal|violence|fear|flee)$/.test(k))HK.Emo.bump(ctx,B,{fear:k==='violence'?30:16,grief:6},A.name+'との歪んだ関係');
var whyK={control:'：束縛',verbal:'：暴言',violence:'：物に当たる・手を上げる',honey:'：謝って優しくなる（繰り返し）',stay:'：離れられない',fear:'：怯えている',flee:'：逃げ出したい',notice:'：'+(C?C.name:'周り')+'が気づいた',step:'：'+(C?C.name:'周り')+'が間に入った',free:'：'+B.name+'が離れる決心をした（恋人ではなくなった）'}[k];
var back=HK.ABUSE_BACK&&HK.ABUSE_BACK[st]?HK.ABUSE_BACK[st].short:'';
return{cat:k==='honey'?'romance':k==='notice'||k==='step'||k==='free'?'help':'conflict',with:C&& /notice|step|free/.test(k)?[C]:null,text:text,why:A.name+'（支配する側）と'+B.name+'（支配される側・'+back+'）の'+lab+whyK,mag:k==='free'?22:k==='violence'||k==='step'?16:10};
}
});
})();
});
;
/* ==== js/tie-layer.js ==== */
HK.Load.def(18,'js/tie-layer.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK|| !HK.COMMON|| !HK.Ties)return;
function L(s){return s.split('|');}
var PK=['proud','stern','tsun','gentle','devoted','cool','free','shy','polite'];
function per(c){var k=c&&(c.persona||(HK.personaOf&&HK.personaOf(c)))||'gentle';return PK.indexOf(k)>=0?k:'gentle';}
function P9(o){var r={};PK.forEach(function(k){r[k]=L(o[k]||o.gentle);});return r;}
function here(c){return!!c&&(HK.State?HK.State.here(c):c.alive!==false)&& !(c.flags&&c.flags.caged!=null);}
function both(a,b){return!!(HK.canLove&&HK.canLove(a,b)&&HK.canLove(b,a));}
function loveOk(ctx,a,b){return both(a,b)&& !(HK.ngPair&&HK.ngPair(a,b))&& !ctx.pair(a,b).kin;}
function fill(s,a,b,c){return String(s||'').replace(/\{a\}/g,a.name).replace(/\{b\}/g,b.name).replace(/\{c\}/g,c?c.name:'');}
function pk(ctx,l){return ctx.pick(l);}
function all(ctx,a,b){return HK.Ties.all(ctx,a,b);}
function keyOf(a,b){return a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;}
var TL=HK.TieLayer={};
function push(ev){ev.scope='pair';ev.noOdd=true;HK.addTo(HK.COMMON,ev);}
function wrapEv(e){
if(!e||e._tlW|| !e.id|| !HK.TIE_EV_RE|| !(HK.TIE_EV_RE.test(e.id)|| /^rb_/.test(e.id)))return;
e._tlW=true;
var w0=e.when,r0=e.run;
if(typeof w0==='function')e.when=function(ctx,a,b){
if(!ctx|| !ctx._noEv|| !b)return w0.apply(this,arguments);
ctx._evq=(ctx._evq||0)+1;
try{return w0.apply(this,arguments);}finally{ctx._evq--;}
};
if(typeof r0==='function')e.run=function(ctx,a,b){
var r=r0.apply(this,arguments);
return ctx&&ctx._past&&b&&r&&typeof r.text==='string'?pastTouch(ctx,a,b,r):r;
};
}
function hookPool(){
if(!HK.buildPool||HK.buildPool._tlW)return;
HK.wrap(HK,'buildPool',function(bp){var f=function(){var p=bp.apply(this,arguments);(p||[]).forEach(wrapEv);return p;};f._tlW=true;return f;},1e9);
}
TL.wrapEv=wrapEv;
var af0=HK.Ties.after;
HK.Ties.after=function(ctx){
var r=af0.apply(this,arguments);
hookPool();
if(ctx&&ctx._past)intro(ctx);
return r;
};
var PAST={
friend:{
intro:L('{a}と{b}は、昔はいつも一緒にいた。いつから距離ができたのか、二人ともはっきりとは覚えていなかった。|{a}と{b}は、昔はよく笑い合う仲だった。今の二人がどう見えるにせよ、あのころのことは二人とも忘れていなかった。'),
touch:L('{a}はふと、{b}と並んで歩いた昔の帰り道を思い出した。{a}「昔は、毎日一緒に帰ってたね｜昔は、毎日一緒に帰っていたな｜昔は、毎日一緒に帰っていましたね」|{b}の笑い方が昔のままなのに気づいて、{a}は少しだけ懐かしくなった。|{a}「こうしてると、昔に戻ったみたい｜こうしていると、昔に戻ったようだ｜こうしていると、昔に戻ったみたいです」{b}「……昔の話はやめて｜……昔の話はやめろ｜……昔の話はやめてください」――そう言いながら、{b}も少し笑っていた。')
},
foe:{
intro:L('{a}と{b}は、昔は敵どうしだった。あのころの因縁は、二人のあいだにまだ薄く残っていた。|{a}と{b}は、昔は互いを打ち負かすことしか考えていなかった。同じ場所にいるのは、二人にとって妙な気分だった。'),
touch:L('{a}は{b}の横顔を見て、昔は本気でぶつかり合っていたことを思い出した。{a}「まさか、あなたと並ぶ日が来るとは思わなかった｜＝｜まさか、あなたと並ぶ日が来るとは思いませんでした」|{b}「昔の私が見たら、腰を抜かすね｜昔の私が見たら、腰を抜かすだろう｜昔の私が見たら、腰を抜かしますね」――{a}は鼻で笑って、それでも否定しなかった。|{a}と{b}は、昔の争いの話になると、今でも少しだけ意地を張り合った。どちらも、あのころの負けを認めていなかった。')
},
first:{
intro:L('{b}は、{a}の初恋の相手だった。{b}がそれを知っているのかどうか、{a}には分からなかった。|{a}にとって{b}は、初めて誰かを好きになった、その相手だった。あれから何年たっても、{b}の名前を聞くと、胸の奥が少しだけ揺れた。'),
touch:L('{b}の何気ない仕草に、{a}は初恋のころの気持ちを思い出して、思わず目を逸らした。|{a}は{b}の笑い声を聞いて、昔、遠くから見ているだけだった日々を思い出した。|{a}「……昔、{b}のこと、ずっと見てた｜……昔、{b}のことをずっと見ていた｜……昔、{b}のことを、ずっと見ていました」{b}「え？｜何だ？｜え？」{a}「何でもない｜何でもない｜何でもありません」')
},
adore:{
intro:L('昔、{a}は{b}に強く憧れていた。{b}の背中を追いかけていた日々のことを、{a}は今も覚えていた。'),
touch:L('{a}は{b}を見て、昔、憧れて背中を追いかけていたころのことを思い出した。|{a}「昔は、{b}みたいになりたかった｜昔は、{b}のようになりたかった｜昔は、{b}みたいになりたかったんです」{b}は少し照れくさそうに笑った。')
},
saved:{
intro:L('{a}は昔、{b}に助けられたことがある。あの日のことを、{a}は今も忘れていなかった。|{a}が昔、窮地に陥ったとき、手を差し伸べたのは{b}だった。{b}本人は、もう覚えていないかもしれなかった。'),
touch:L('{a}「あのとき助けてくれたこと、まだちゃんとお礼を言えてない気がする｜あのとき助けてもらったことに、まだきちんと礼を言えていない気がする｜あのとき助けていただいたこと、まだきちんとお礼を言えていない気がします」{b}「そんな昔のこと｜そんな昔のことか｜そんな昔のことを」|{a}は{b}の手際を見て、昔、同じように自分を助けてくれた{b}の姿を思い出した。|{a}は、昔{b}に救われた恩を返すつもりで、黙って{b}の荷物を半分持った。')
},
hurt:{
intro:L('{a}は昔、{b}にひどいことをした。{b}はそれを忘れていないし、{a}も忘れられずにいた。|{a}と{b}のあいだには、昔{a}がしたことが、今も小さな棘のように刺さっていた。'),
touch:L('{b}の視線に気づいて、{a}は昔の自分のしたことを思い出した。{a}「……あのときのこと、ずっと謝りたかった｜……あのときのことを、ずっと謝りたかった｜……あのときのこと、ずっと謝りたかったです」{b}「今さら｜今さらだ｜今さらですね」――{b}の声は冷たかったが、その場を立ち去りはしなかった。|{a}は{b}に何か言いかけて、やめた。昔{b}を傷つけた自分に、今さら言えることはない気がした。|{b}は{a}を見て、昔のことを思い出したように顔をこわばらせた。{a}はそれに気づいて、そっと距離を取った。'),
forgive:L('{a}「あのときは、本当にごめん｜あのときは、本当にすまなかった｜あのときは、本当にすみませんでした」{b}「……もういい。昔のことだから｜……もういい。昔のことだ｜……もういいです。昔のことですから」――{b}の返事に、{a}は少しだけ救われた。')
}
};
TL.PAST=PAST;
function pastViews(l){
var v=[],seen={};
var put=function(x,y,k){var P=HK.TIE_PAST[k],key=P&&P.sym?k:x+'>'+y+':'+k;if(!k|| !P||seen[key])return;seen[key]=1;v.push({a:x,b:y,k:k,d:x<y?'f':'r'});};
(l||[]).forEach(function(t){put(t.a,t.b,t.past);put(t.b,t.a,t.pastB);});
return v;
}
function pastTie(ctx,a,b){return pastViews(HK.Ties.all(ctx,a,b));}
function pcnt(ctx){return ctx._pastC||(ctx._pastC={});}
function pastN(ctx,v){return pcnt(ctx)[keyOf(ctx.chars[v.a],ctx.chars[v.b])]||0;}
function pastAt(ctx,v){return pcnt(ctx)['@'+keyOf(ctx.chars[v.a],ctx.chars[v.b])];}
function pastBump(ctx,v,touch){var m=pcnt(ctx),k=keyOf(ctx.chars[v.a],ctx.chars[v.b]);m[k]=(m[k]||0)+1;m['@'+k]=ctx.stepIndex==null? -1:ctx.stepIndex;if(touch)m[v.d+k]=(m[v.d+k]||0)+1;}
function pastPick(ctx,vs){
var m=pcnt(ctx),k=vs.length&&keyOf(ctx.chars[vs[0].a],ctx.chars[vs[0].b]),n=function(v){return m[v.d+k]||0;};
var lo=Math.min.apply(null,vs.map(n)),c=vs.filter(function(v){return n(v)===lo;});
return c[(ctx.stepIndex>0?ctx.stepIndex:0)%c.length];
}
var PAST_MAX=3;
function pastText(ctx,v,kind){
var A=ctx.chars[v.a],B=ctx.chars[v.b],k=v.k;
if(k==='first'&& !HK.canLove(A,B))k='adore';
var o=PAST[k];
if(!o)return'';
var l=o[kind];
if(k==='hurt'&&kind==='touch'&&ctx.R(B,A).aff>20&&ctx.R(B,A).ten<35)l=o.forgive;
var said=pcnt(ctx)['#'+keyOf(A,B)]||(pcnt(ctx)['#'+keyOf(A,B)]={}),tx=fill(pk(ctx,l),A,B);
if(said[tx]){var rest=l.filter(function(x){return!said[fill(x,A,B)];});tx=rest.length?fill(pk(ctx,rest),A,B):'';}
if(tx)said[tx]=1;
return tx;
}
function pastWhy(ctx,vs){
var A=ctx.chars[vs[0].a],B=ctx.chars[vs[0].b],x={names:true,map:HK.TIE_PAST};
return A.name+'と'+B.name+'の過去：'+vs.map(function(v){var P=ctx.chars[v.a],Q=ctx.chars[v.b];return v.k==='first'&& !HK.canLove(P,Q)?P.name+'の昔の憧れ':HK.tieExtraShort(x,v.k,P.name,Q.name);}).join('・');
}
function intro(ctx){
Object.keys(ctx.tiesAll||{}).forEach(function(k){
var vs=pastViews(ctx.tiesAll[k]);
if(!vs.length)return;
var A=ctx.chars[vs[0].a],B=ctx.chars[vs[0].b];
if(!A|| !B|| !here(A)|| !here(B))return;
var tx=vs.map(function(v){return pastText(ctx,v,'intro');}).join('');
if(!tx)return;
pastBump(ctx,vs[0]);
(ctx.pending=ctx.pending||[]).push({kind:'event',cat:'bond',actors:[A,B],mag:4,text:tx,why:pastWhy(ctx,vs)+'（導入）'});
});
}
function pastTouch(ctx,a,b,r){
var vs=pastTie(ctx,a,b);
if(!vs.length||pastN(ctx,vs[0])>=PAST_MAX||pastAt(ctx,vs[0])===ctx.stepIndex)return r;
var v=pastPick(ctx,vs),A=ctx.chars[v.a],B=ctx.chars[v.b];
if(!here(A)|| !here(B)||ctx.rng()>0.3)return r;
var tx=pastText(ctx,v,'touch');
if(!tx)return r;
pastBump(ctx,v,1);
r.text+=tx;
if(typeof r.why==='string')r.why+='／'+pastWhy(ctx,[v]);
return r;
}
TL.pastTouch=pastTouch;
push({
id:'tie_ly_past',label:'二人の過去がふと顔を出す',cat:'bond',tie:'-',
when:function(ctx,a,b){
if(!ctx._past|| !b|| !here(a)|| !here(b))return false;
var vs=pastTie(ctx,a,b);
return!!vs.length&&pastN(ctx,vs[0])<PAST_MAX&&pastAt(ctx,vs[0])!==ctx.stepIndex;
},
w:function(){return 0.3;},
run:function(ctx,a,b){
var vs=pastTie(ctx,a,b);
if(!vs.length)return null;
var v=pastPick(ctx,vs),A=ctx.chars[v.a],B=ctx.chars[v.b],tx=pastText(ctx,v,'touch');
if(!tx)return null;
pastBump(ctx,v,1);
if(v.k==='friend')ctx.mod2(A,B,{aff:3,trust:2},{aff:3,trust:2});
else if(v.k==='foe')ctx.mod2(A,B,{ten: -2,aff:2},{ten: -2,aff:2});
else if(v.k==='first')ctx.mod(A,B,HK.canLove(A,B)&& !(HK.ngPair&&HK.ngPair(A,B))?{att:2,aff:2}:{aff:2});
else if(v.k==='saved')ctx.mod2(A,B,{trust:3,aff:2},{aff:1});
else if(v.k==='hurt'){if(ctx.R(B,A).aff>20&&ctx.R(B,A).ten<35)ctx.mod2(A,B,{ten: -3},{ten: -6,aff:4});else ctx.mod2(A,B,{ten:2},{ten:3});}
return{text:tx,why:pastWhy(ctx,[v])+'（回想）',mag:6};
}
});
function wtTie(ctx,a,b){
var l=all(ctx,a,b);
for(var i=0;i<l.length;i++){var t=l[i];if(!t.heavy|| !HK.LOVE_WEIGHT[t.heavy])continue;if(t.type==='lover'||(t.type==='honmei'&&t.a===a.i))return t;}
return null;
}
TL.weight=function(ctx,a,b){var t=wtTie(ctx,a,b);return t?t.heavy:'';};
var HEAVY={
cling:P9({
proud:'{a}は{b}の手首を掴んで、離そうとしなかった。{a}「どこ行くの。……もう少し、ここにいて｜どこへ行く。……もう少し、ここにいろ｜どこへ行くんですか。……もう少し、ここにいてください」',
stern:'{a}は{b}の背中に向かって、低く言った。{a}「一人で行かせるつもりはない。私も行く｜＝｜一人で行かせるつもりはありません。私も行きます」',
tsun:'{a}は{b}の袖をつまんだまま、そっぽを向いた。{a}「べ、別に寂しいとかじゃないし。……ただ、離れたくないだけ｜別に寂しいわけではない。……ただ、離れたくないだけだ｜べ、別に寂しいわけではありません。……ただ、離れたくないだけです」',
gentle:'{a}は{b}の肩に頭を預けた。{a}「ずっとこうしていたい。{b}のいない時間が、前より長く感じる｜＝｜ずっとこうしていたいです。{b}のいない時間が、前より長く感じます」',
devoted:'{a}は{b}の手を両手で包んだ。{a}「{b}がいないと、息の仕方も分からなくなる。だから、そばにいて｜{b}がいないと、息の仕方も分からなくなる。だから、そばにいてくれ｜{b}がいないと、息の仕方も分からなくなります。だから、そばにいてください」',
cool:'{a}は表情を変えないまま、{b}の指に自分の指を絡めた。{a}「離れる理由が見つからない。だから離れない｜＝｜離れる理由が見つかりません。だから離れません」',
free:'{a}は後ろから{b}に抱きついた。{a}「やだ、行かないで。あと五分だけ｜嫌だ、行くな。あと五分だけだ｜嫌です、行かないでください。あと五分だけ、お願いします」',
shy:'{a}は{b}の服の裾を、そっと握った。{a}「……もう少しだけ、隣にいたい｜＝｜……もう少しだけ、隣にいたいです」',
polite:'{a}は{b}の手を取り、静かに言った。{a}「片時も離れていたくない。わがままだと分かっていても｜片時も離れていたくない。わがままだと分かっていてもだ｜片時も離れていたくありません。わがままだと分かっていても」'
}),
clingBack:L('{b}は少し困ったように笑って、それでも{a}の手を握り返した。|{b}「どこにも行かないよ｜どこにも行かない｜どこにも行きませんよ」――{b}はそう言って、{a}の髪をそっと撫でた。|{b}は何も言わずに、{a}が落ち着くまで隣に座っていた。'),
check:L('{a}は{b}の姿が見えなくなるたびに、どこにいるのか確かめずにはいられなかった。{a}「さっき、どこ行ってたの｜さっき、どこへ行っていた｜さっき、どこへ行っていたんですか」{b}「少し外の空気を吸ってただけ｜少し外の空気を吸っていただけだ｜少し外の空気を吸っていただけです」|{a}は{b}の予定を一つずつ聞き出して、全部覚えた。{b}は苦笑したが、嫌がりはしなかった。|{a}は{b}が誰と何を話したのか、さりげなく、けれど全部聞いた。{a}「……ううん、気になっただけ｜……いや、気になっただけだ｜……いえ、気になっただけです」|{a}は、{b}が少し離れただけで落ち着かなくなった。戻ってきた{b}の袖を、{a}は黙って掴んだ。'),
jeal:L('{a}は、{b}が{c}と笑い合っているのを見て、胸の奥がざわついた。{a}は二人のあいだに割って入り、{b}の腕を取った。{a}「{b}、こっち｜{b}、こっちだ｜{b}、こちらへ」|{b}が{c}に親しげに話しかけるたび、{a}の視線は鋭くなった。{a}「{c}とずいぶん楽しそうだったね｜{c}とずいぶん楽しそうだったな｜{c}とずいぶん楽しそうでしたね」――声は穏やかだったが、{a}は少しも笑っていなかった。|{a}は{c}の前で、わざと{b}の肩を抱き寄せた。{c}は気まずそうに目を逸らした。{a}「{b}は私の恋人だから｜{b}は私の恋人だ｜{b}は私の恋人ですから」'),
jealBack:L('{b}は{a}の嫉妬に気づいて、困ったように笑った。{b}「{a}だけだって、知ってるくせに｜{a}だけだと、知っているだろう｜{a}だけだって、知っているでしょう」|{b}は{a}の手を握って、{c}に小さく会釈した。そのまま、{a}の隣を離れなかった。|{b}「やきもち？｜やきもちか｜やきもちですか」――{b}がからかうように言うと、{a}はむっとして顔を背けた。'),
pine:L('{a}は、{b}がほかの誰かと笑うたびに、目で追ってしまう自分に気づいていた。想いを口にできないまま、{a}の胸だけが重くなっていった。|{a}は{b}の隣が空くのを、いつも待っていた。誰にも渡したくないという気持ちを、{a}は持て余していた。|{a}は、{b}の名前を誰かが呼ぶたびに振り返った。{a}「……私だけを見てくれたらいいのに｜……私だけを見てくれればいいのに｜……私だけを見てくれたらいいのに、と思います」――その呟きは、誰にも聞こえなかった。'),
pineC:L('{a}は、{b}と{c}が並んで話しているのを、少し離れたところから見ていた。割って入る資格はないと分かっていても、目が離せなかった。|{c}が{b}に何か耳打ちするのを見て、{a}は思わず拳を握った。{a}「……{b}を取らないで｜……{b}を取るな｜……{b}を取らないでください」――声にならない言葉が、喉の奥で止まった。')
};
var LIGHT={
space:P9({
proud:'{a}は{b}に「＠{a}＠今日は好きにしてて｜今日は好きにしていろ｜今日は好きにしていてください」とだけ言って、自分の用事に出かけた。べったりしないのが、二人の流儀だった。',
stern:'{a}と{b}は、それぞれの役目に戻った。顔を合わせるのは食事のときだけだったが、それで十分だった。{a}「夕方には戻る｜＝｜夕方には戻ります」',
tsun:'{a}「べ、別に{b}がいなくても平気だし。……夜には帰るけど｜別に{b}がいなくても平気だ。……夜には帰るが｜べ、別に{b}がいなくても平気です。……夜には帰りますけど」――{b}は笑って、手を振って見送った。',
gentle:'{a}は{b}の背中を見送って、自分の時間に戻った。会えない時間があるから、会えたときに嬉しいのだと、{a}は思っていた。',
devoted:'{a}は{b}の邪魔をしないよう、少し離れたところで自分の作業をしていた。{a}「何かあったら呼んで｜何かあったら呼んでくれ｜何かあったら呼んでください」――それだけ言えば、あとは待っていられた。',
cool:'{a}と{b}は、同じ場所にいても別々のことをしていた。{a}「互いの時間は、互いのもの｜互いの時間は、互いのものだ｜互いの時間は、互いのものです」――冷たいようでいて、二人にはそれが心地よかった。',
free:'{a}は「じゃ、またあとで｜では、またあとでな｜では、またあとで」と手を振って、さっさと自分の用事に向かった。{b}も同じように手を振り返した。',
shy:'{a}は{b}に声をかけようとして、やめた。{b}には{b}の時間がある。夜に会えれば、それでよかった。',
polite:'{a}は{b}に軽く会釈して、それぞれの用事に分かれた。{a}「また後ほど｜また後でな｜また後ほど、お会いしましょう」'
}),
calm:L('{a}と{b}は、しばらくぶりに顔を合わせた。{a}「今日、何してた？｜今日は何をしていた｜今日は何をしていましたか」{b}「いろいろ。そっちは？｜いろいろだ。そちらは？｜いろいろです。そちらは？」――それだけの会話で、二人とも満足していた。|{a}と{b}は、黙って並んで座っていた。話すことがないのではなく、話さなくてもよかった。|{b}が{a}に最後に連絡したのは、昨日の夜の一言だけだった。{a}はそれを気にもせず、{b}の顔を見ると軽く手を上げた。|{a}と{b}は、互いの予定を少しだけ確かめ合って、それぞれの時間に戻った。恋人だからといって、いつも一緒にいる必要はなかった。'),
pine:L('{a}は、遠くから{b}の姿を見つけて、少しだけ口元を緩めた。近づかなくても、それで十分だった。|{a}は{b}への想いを、急がずに胸にしまっていた。今は、{b}が元気でいればそれでいい。|{a}は{b}と短く言葉を交わして、すぐに自分の用事に戻った。{a}「また話そう｜＝｜また話しましょう」')
};
TL.HEAVY=HEAVY;TL.LIGHT=LIGHT;
function jealC(ctx,a,b){
return(ctx.others?ctx.others(a):[]).filter(function(c){
if(c===a||c===b|| !here(c)||ctx.pair(a,c).couple||ctx.pair(b,c).kin)return false;
return ctx.R(b,c).aff>10&&ctx.R(b,c).ten<45;
});
}
function wtRoles(ctx,a,b,want){
if(!b|| !here(a)|| !here(b))return null;
var t=wtTie(ctx,a,b);
if(!t||t.heavy!==want|| !loveOk(ctx,a,b))return null;
var cp=ctx.pair(a,b).couple;
if(t.type==='lover'&& !cp)return null;
return{t:t,cp:cp};
}
function wtWhy(a,b,t,w,k){return a.name+'と'+b.name+'は'+(t.type==='honmei'?a.name+'の本命':HK.tieLabel(t))+'（気持ちの重さ：'+(w==='heavy'?'重い':'軽い')+'）'+k;}
push({
id:'tie_ly_heavy',label:'重い想いで相手を目で追う',cat:'romance',
when:function(ctx,a,b){return!!wtRoles(ctx,a,b,'heavy');},
w:function(ctx,a){return 0.55+a.tr.jealous*0.3;},
run:function(ctx,a,b){
var r=wtRoles(ctx,a,b,'heavy');
if(!r)return null;
var C=jealC(ctx,a,b),c=C.length?ctx.pick(C):null;
if(!r.cp){
ctx.mod(a,b,{att:3,aff:1});ctx.stress(a,3);
if(c){ctx.mod(a,c,{ten:3});return{cat:'conflict',with:[c],text:fill(pk(ctx,HEAVY.pineC),a,b,c),why:wtWhy(a,b,r.t,'heavy','：'+b.name+'と'+c.name+'を見て、ひそかに嫉妬した'),mag:8};}
return{cat:'bond',text:fill(pk(ctx,HEAVY.pine),a,b),why:wtWhy(a,b,r.t,'heavy','：想いを抱えて目で追う'),mag:6};
}
var x=ctx.rng(),k=c&&x<0.32?'jeal':x<0.62?'check':'cling';
if(k==='jeal'){
ctx.mod(a,b,{att:2,ten:2});ctx.mod(a,c,{ten:4,aff: -2});ctx.stress(a,4);
return{cat:'conflict',with:[c],text:fill(pk(ctx,HEAVY.jeal),a,b,c)+fill(pk(ctx,HEAVY.jealBack),a,b,c),why:wtWhy(a,b,r.t,'heavy','：'+c.name+'と親しげな恋人に嫉妬し、独占しようとした'),mag:10};
}
if(k==='check'){
ctx.mod2(a,b,{att:2,aff:1},{aff:1,ten:2});
return{cat:'bond',text:fill(pk(ctx,HEAVY.check),a,b),why:wtWhy(a,b,r.t,'heavy','：恋人の居場所を確かめずにいられない'),mag:6};
}
ctx.mod2(a,b,{att:3,aff:2},{att:2,aff:2});ctx.stress(a,-3);
return{cat:'romance',text:fill(pk(ctx,HEAVY.cling[per(a)]),a,b)+fill(pk(ctx,HEAVY.clingBack),a,b),why:wtWhy(a,b,r.t,'heavy','：離れたくない'),mag:8};
}
});
push({
id:'tie_ly_light',label:'急がずに想い合う二人',cat:'bond',
when:function(ctx,a,b){return!!wtRoles(ctx,a,b,'light');},
w:function(ctx,a){return 0.5+a.tr.a*0.2;},
run:function(ctx,a,b){
var r=wtRoles(ctx,a,b,'light');
if(!r)return null;
if(!r.cp){ctx.mod(a,b,{aff:2,trust:1});return{text:fill(pk(ctx,LIGHT.pine),a,b),why:wtWhy(a,b,r.t,'light','：急がずに想う'),mag:4};}
var sp=ctx.rng()<0.5;
ctx.mod2(a,b,{trust:3,ten: -2},{trust:3,ten: -2});ctx.stress(a,-2);ctx.stress(b,-2);
return{text:fill(pk(ctx,sp?LIGHT.space[per(a)]:LIGHT.calm),a,b),why:wtWhy(a,b,r.t,'light',sp?'：互いの時間を大事にする':'：連絡は少なくても変わらない'),mag:4};
}
});
var DL=HK.Daily;
if(DL&&DL.REL&&DL.SPECS){
var wtDaily=function(want){return function(ctx,a,b){if((ctx.env&&ctx.env.tieEv==='off')|| !DL.REL.lovers(ctx,a,b))return false;var t=wtTie(ctx,a,b);return!!t&&t.type==='lover'&&t.heavy===want&&t.noev!=='off';};};
DL.REL.wtHeavy=wtDaily('heavy');
DL.REL.wtLight=wtDaily('light');
var E=function(id,cat,w,fx,texts,meta){DL.SPECS.push({id:id,args:[id,cat,'p',w,'',fx,texts],meta:meta});};
E('d_wt_heavy_wait','romance','np*.3+a*.2+.4','ab:att3,aff2;ba:aff2',
'{a}は、{b}の帰りを玄関で待っていた。何度も時計を見ては、外の足音に耳を澄ませた。{a}「遅い。……心配した｜＝｜遅いです。……心配しました」|{b}が帰ってくるなり、{a}はその胸に飛び込んだ。{a}「おかえり。……今日はもう、どこにも行かないで｜おかえり。……今日はもう、どこにも行くな｜おかえりなさい。……今日はもう、どこにも行かないでください」|{a}は{b}が出かけているあいだ、何度も連絡を送っていた。帰ってきた{b}の顔を見て、{a}はようやく息をついた。',
{at:'home.entrance,home.living',tm:'en',rel:'wtHeavy'});
E('d_wt_heavy_night','romance','np*.3+.4','ab:att3,aff2;ba:att2,aff2',
'{a}は、眠る{b}の手を握ったまま、なかなか目を閉じられなかった。朝になったら{b}がいなくなっている気がして、怖かった。|{a}は{b}の背中にぴたりとくっついた。{b}「暑い｜＝｜暑いです」{a}「我慢して｜我慢しろ｜我慢してください」――{a}は少しも離れようとしなかった。|{a}「明日も、明後日も、ずっと一緒｜明日も、明後日も、ずっと一緒だ｜明日も、明後日も、ずっと一緒です」――{a}は{b}の返事を聞くまで、眠ろうとしなかった。',
{at:'home.bedroom,home.living',tm:'n',rel:'wtHeavy'});
E('d_wt_light_own','bond','a*.3+ac*.2+.4','ab:trust3;ba:trust3;as:-3;bs:-3',
'{a}と{b}は、休みの日をそれぞれの趣味に使った。夕方に顔を合わせると、今日あったことを少しだけ話した。|{a}は{b}からの短い連絡に、短く返した。それで足りるのが、二人の距離感だった。|{a}は{b}の誘いを「＠{a}＠今日は一人でいたい｜＝｜今日は一人でいたいです」と断った。{b}も「了解｜分かった｜分かりました」とだけ返した。それで気まずくなることはなかった。',
{at:'home.living,town.cafe,work.office',tm:'de',rel:'wtLight'});
E('d_wt_light_meet','bond','np*.3+.4','ab:aff2,trust2;ba:aff2,trust2',
'{a}と{b}は、久しぶりに一緒に食事をした。{b}「久しぶり｜久しぶりだな｜お久しぶりです」{a}「そうでもないよ｜そうでもない｜そうでもないですよ」――会わない日があっても、二人の空気は少しも変わらなかった。|{a}と{b}は、同じテーブルで別々の本を読んでいた。ときどき目が合うと、どちらからともなく小さく笑った。',
{at:'town.cafe,town.park,home.kitchen',tm:'de',rel:'wtLight'});
}
var KG={
argue:{
parent:L('{a}と{b}は、ささいなことで言い合いになった。親子だからこそ、言葉に遠慮がなかった。{a}「どうして、いつも私の話を最後まで聞かないの｜なぜ、いつも私の話を最後まで聞かない｜どうして、いつも私の話を最後まで聞かないんですか」{b}「聞いてるよ。聞いたうえで言ってる｜聞いている。聞いたうえで言っている｜聞いています。聞いたうえで言っているんです」|{a}は{b}のやり方に口を出し、{b}はそれに言い返した。昔から、この二人はこうだった。{b}「もう子どもじゃない｜もう子どもではない｜もう子どもではありません」'),
sib:L('{a}と{b}は、昔のことを蒸し返して言い合いになった。どちらが先に手を出したのか、二人の記憶は食い違ったままだった。|{a}「いつもそうやって、自分だけ正しい顔をする｜＝｜いつもそうやって、自分だけ正しい顔をしますよね」{b}「そっちこそ｜そちらこそだ｜そちらこそです」――同じ家で育った二人の口喧嘩は、どこか似た調子だった。'),
rel:L('{a}と{b}は、親戚の集まりでの昔の出来事を持ち出して、気まずい言い合いになった。どちらも、自分の覚えているほうが正しいと譲らなかった。|{a}「親戚だからって、何でも口を出していいわけじゃない｜親戚だからといって、何にでも口を出していいわけではない｜親戚だからといって、何にでも口を出していいわけではありません」{b}は不機嫌そうに黙り込んだ。'),
bene:L('{b}は{a}の言葉に、思わず言い返した。{b}「恩は感謝してる。でも、それとこれとは別｜恩には感謝している。だが、それとこれとは別だ｜恩には感謝しています。でも、それとこれとは別です」{a}は眉をひそめて、黙り込んだ。|{a}「助けたからといって、何でも言うことを聞けとは言ってない｜助けたからといって、何でも言うことを聞けとは言っていない｜助けたからといって、何でも言うことを聞けとは言っていません」{b}「なら、放っておいて｜なら、放っておけ｜なら、放っておいてください」――恩のある二人の口論は、いつも同じところで行き詰まった。')
},
ignore:L('{a}は{b}に話しかけられても、聞こえないふりをした。{b}も、それ以上は何も言わなかった。|{a}と{b}は、同じ場所にいながら一言も口をきかなかった。周りのほうが、気まずそうにしていた。|{b}が差し出したものを、{a}は受け取らずに素通りした。{b}は黙って手を引っ込めた。'),
reconcile:L('{a}と{b}は、長い沈黙のあとで、どちらからともなく口を開いた。{a}「……さっきは、言いすぎた｜＝｜……さっきは、言いすぎました」{b}「こっちも｜こちらもだ｜こちらこそです」――仲直りの言葉は短かったが、二人にはそれで十分だった。|{a}は{b}の好きなものを黙って差し出した。{b}は少し驚いてから受け取った。{b}「……ありがと｜……感謝する｜……ありがとうございます」――それが、二人なりの和解だった。|危ない場面で、{a}は迷わず{b}をかばった。そのあと二人は目を合わせ、気まずそうに、それでも少しだけ笑った。'),
warm:{
parent:L('{a}は{b}の話を、最後まで嬉しそうに聞いていた。{a}「{b}がそう決めたなら、応援する｜＝｜{b}がそう決めたなら、応援します」|{b}は{a}の肩をそっと揉んだ。{a}「急にどうしたの｜急にどうした｜急にどうしたんですか」{b}「たまには親孝行｜たまには親孝行だ｜たまには親孝行です」'),
sib:L('{a}と{b}は、同じところで同時に笑い出した。きょうだいの笑いのツボは、昔から同じだった。|{a}は何も言わずに、{b}の分まで用意しておいた。{b}「さすが｜さすがだ｜さすがです」{a}「何年きょうだいやってると思ってるの｜何年きょうだいをやっていると思っている｜何年きょうだいをやっていると思っているんですか」'),
rel:L('{a}と{b}は、親戚の誰それの近況を教え合って笑った。遠い親戚のはずが、話してみると妙に気が合った。|{a}「困ったら、いつでも頼って。親戚なんだから｜困ったら、いつでも頼れ。親戚なのだから｜困ったら、いつでも頼ってください。親戚なんですから」'),
bene:L('{b}は{a}に、今日も小さな手伝いを申し出た。{a}は笑って、それを受けた。恩を返すというより、ただ一緒にいるのが楽しかった。|{a}「もう恩なんて気にしなくていいのに｜もう恩など気にしなくていい｜もう恩なんて気にしなくていいんですよ」{b}「気にしてるんじゃなくて、好きでやってる｜気にしているのではない。好きでやっている｜気にしているのではなく、好きでやっているんです」')
}
};
TL.KG=KG;
var KG_GRP={parent:'parent',pparent:'parent',sibling:'sib',sibprot:'sib',relative:'rel',benefactor:'bene'};
function kgRoles(ctx,a,b){
if(!b|| !here(a)|| !here(b)||ctx.pair(a,b).couple)return null;
var l=all(ctx,a,b);
for(var i=0;i<l.length;i++){
var t=l[i];if(!t.kg|| !HK.KIN_GRADE[t.kg])continue;
var g=t.type==='relative'&&t.step?'sib':KG_GRP[t.type];
if(!g)continue;
var D=HK.TIES[t.type],A=D&&D.dir?ctx.chars[t.a]:a,B=D&&D.dir?ctx.chars[t.b]:b;
return{t:t,g:g,A:A,B:B};
}
return null;
}
function kgWhy(r,k){return r.A.name+'と'+r.B.name+'は'+HK.tieLabel(r.t)+'（'+HK.KIN_GRADE[r.t.kg].short+'）：'+k;}
push({
id:'tie_ly_kin',label:'家族の仲のよさ・悪さが出る時間',cat:'conflict',
when:function(ctx,a,b){return!!kgRoles(ctx,a,b);},
w:function(ctx,a,b){var r=kgRoles(ctx,a,b);return r&&r.t.kg==='bad'?0.6+a.tr.cp*0.2+a.tr.fc*0.1:0.5+a.tr.np*0.2;},
run:function(ctx,a,b){
var r=kgRoles(ctx,a,b);
if(!r)return null;
var A=r.A,B=r.B,m=ctx._kgC||(ctx._kgC={}),key=keyOf(A,B),tx;
if(r.t.kg==='good'){
ctx.mod2(A,B,{aff:4,trust:3},{aff:4,trust:3});ctx.stress(A,-2);ctx.stress(B,-2);
tx=ctx.t(pk(ctx,KG.warm[r.g]),A,B);
return{cat:'bond',text:HK.Sib?HK.Sib.fill(tx,A,B,null,ctx):tx,why:kgWhy(r,'気安い時間'),mag:6};
}
var n=m[key]||0,k;
if(n>=2&&ctx.rng()<0.4)k='reconcile';
else k=ctx.rng()<0.62?'argue':'ignore';
if(k==='reconcile'){m[key]=0;ctx.mod2(A,B,{ten: -10,aff:5,trust:4},{ten: -10,aff:5,trust:4});ctx.stress(A,-4);ctx.stress(B,-4);}
else{m[key]=n+1;if(k==='argue')ctx.mod2(A,B,{ten:5,aff: -2},{ten:5,aff: -2});else ctx.mod2(A,B,{ten:3,trust: -1},{ten:3,trust: -1});ctx.stress(A,3);ctx.stress(B,3);}
tx=ctx.t(pk(ctx,k==='argue'?KG.argue[r.g]:KG[k]),A,B);
return{cat:k==='reconcile'?'bond':'conflict',text:HK.Sib?HK.Sib.fill(tx,A,B,null,ctx):tx,why:kgWhy(r,{argue:'口論',ignore:'無視',reconcile:'和解'}[k]),mag:k==='reconcile'?10:8};
}
});
var EXL={
awk:L('{a}は{b}と目が合うと、すぐに逸らした。別れてからの時間は、二人のあいだにまだ埋まらずにあった。|{a}は{b}に何か言いかけて、やめた。元恋人に何を話せばいいのか、{a}にはまだ分からなかった。|{a}「……久しぶり｜……久しぶりだな｜……お久しぶりです」――それ以上の言葉が続かず、{a}は気まずそうに視線を落とした。'),
over:L('{a}は{b}に、昔の友達に話すように気軽に声をかけた。{a}「元気そうでよかった｜＝｜お元気そうでよかったです」――そこには、もうわだかまりはなかった。|{a}は{b}の前で、別れたころの話を笑い話にしてみせた。{a}「あのころは、二人とも若かったね｜あのころは、二人とも若かったな｜あのころは、二人とも若かったですね」|{a}は{b}の背中を軽く叩いた。{a}「今は、いい友達でいよう｜＝｜今は、いい友達でいましょう」――元恋人という言葉は、{a}の中ではもう過去のものだった。'),
linger:L('{a}は{b}の横顔を盗み見て、まだ好きなのだと思い知らされた。別れたはずの想いは、少しも薄れていなかった。|{a}は、{b}が昔と同じ癖で髪に触れるのを見て、胸が苦しくなった。{a}「……変わってないね｜……変わっていないな｜……変わっていませんね」|{a}は{b}の隣に座って、言わずにいた言葉を飲み込みかけた。{a}「たまに思う。あのころに戻れたらって｜たまに思う。あのころに戻れたらと｜たまに思います。あのころに戻れたら、と」'),
back:{
awk:L('{b}もまた、どこを見ればいいのか分からないようだった。|{b}は曖昧に頷いて、その場を離れた。|{b}は小さく会釈しただけで、何も言わなかった。'),
over:L('{b}「うん、そっちも元気で｜ああ、そちらも元気でな｜はい、そちらもお元気で」――{b}の笑顔には、もう迷いがなかった。|{b}は穏やかに笑って、{a}の言葉を受け流した。{b}にとって、二人のことはもう終わった話だった。'),
linger:L('{b}は{a}の言葉に、一瞬だけ言葉を失った。{b}も、同じことを考えていた。|{b}「……私も、忘れてない｜……私も、忘れていない｜……私も、忘れていません」――二人のあいだに、昔と同じ沈黙が落ちた。')
}
};
TL.EX=EXL;
function exRoles(ctx,a,b){
if(!b|| !here(a)|| !here(b)||ctx.pair(a,b).couple)return null;
var t=HK.Ties.has(ctx,a,b,'ex');
if(!t||t.type!=='ex'|| !(t.feel||t.feelB))return null;
return{t:t,fa:(t.a===a.i?t.feel:t.feelB)||'',fb:(t.a===a.i?t.feelB:t.feel)||''};
}
function exShort(v){return v?HK.EX_FEEL[v].short:'気まずい';}
push({
id:'tie_ly_ex',label:'元恋人と目が合って気まずくなる',cat:'bond',
when:function(ctx,a,b){return!!exRoles(ctx,a,b);},
w:function(){return 0.55;},
run:function(ctx,a,b){
var r=exRoles(ctx,a,b);
if(!r)return null;
var ka=r.fa==='linger'&& !loveOk(ctx,a,b)?'':r.fa,kb=r.fb==='linger'&& !loveOk(ctx,a,b)?'':r.fb;
var ta=ka==='over'?'over':ka==='linger'?'linger':'awk',tb=kb==='over'?'over':kb==='linger'?'linger':'awk';
var cat='bond';
if(ta==='awk')ctx.mod2(a,b,{ten:2},{ten:2});
else if(ta==='over')ctx.mod2(a,b,{ten: -4,aff:3,trust:2},tb==='over'?{ten: -4,aff:3,trust:2}:{ten: -1,aff:1});
else{ctx.mod(a,b,{att:3,aff:2});if(tb==='linger'){ctx.mod(b,a,{att:3,aff:2});cat='romance';}ctx.stress(a,3);}
var why=a.name+'と'+b.name+'は元恋人（'+a.name+'：'+exShort(r.fa)+'・'+b.name+'：'+exShort(r.fb)+'）'+{awk:'：別れたあとの気まずさ',over:'：ふっきれた距離',linger:'：消えない未練'}[ta];
return{cat:cat,text:fill(pk(ctx,EXL[ta]),a,b)+fill(pk(ctx,EXL.back[tb]),a,b),why:why,mag:ta==='linger'?8:5};
}
});
})();
});
;
/* ==== js/fwb.js ==== */
HK.Load.def(56,'js/fwb.js',function(){
(function(){
'use strict';
var HK=window.HK;
var F=HK.FWB={};
var NO=['classroom','br'];
F.allowed=function(ctx){return NO.indexOf(ctx.scen.id)<0;};
F.lean=function(c){return HK.clamp(c.tr.cold*0.35+c.tr.impulse*0.35+(1-c.tr.ac)*0.15+(1-c.tr.np)*0.15-c.tr.cp*0.1);};
function love(r){return r.aff>38&&r.att>42;}
F.decide=function(ctx,a,b){
if(!F.allowed(ctx))return false;
if(HK.Pos&& !HK.Pos.okSex(a,b))return false;
var ab=ctx.R(a,b),ba=ctx.R(b,a),both=love(ab)&&love(ba);
var p=0.12+(F.lean(a)+F.lean(b))/2*0.65-(both?0.3:0)+(love(ab)!==love(ba)?0.12:0);
return ctx.rng()<HK.clamp(p,0.03,0.85);
};
F.mark=function(ctx,a,b){
var pf=ctx.pair(a,b);
pf.fwb=true;pf.night=true;pf.couple=false;pf.fwbAt=ctx.stepIndex;
pf.nights=Math.max(2,pf.nights||0);
};
F.OFFER={
cold:['{a}は服を着ながら言った。「付き合うとかは面倒だけど、また会うのはいいよ｜付き合うのは面倒だが、また会うのはいい｜お付き合いは面倒ですけど、また会うのはいいですよ」{b}は少し考えて、頷いた。','{a}「恋人じゃなくて、こういう関係でいよう。お互い楽でしょ｜恋人ではなく、こういう関係でいよう。お互い楽だろう｜恋人ではなくて、こういう関係でいましょう。お互い楽でしょう」{b}「……わかった｜＝｜……わかりました」'],
fc:['{a}「ねえ、またしようよ。付き合うとかは置いといて｜またしよう。付き合うかどうかは置いておいて｜付き合うとかは置いておいて、またしましょうよ」{b}は吹き出して、「{light}」と言いながら連絡先を交換した。','{a}は{b}の背中に抱きついて、「これ、たまにやりたい｜これは、たまにやりたい｜これ、たまにやりたいです」と言った。恋人になろうとは言わなかった。'],
ac:['{a}は「付き合って｜付き合ってくれ｜付き合ってください」と言えないまま、「……また、会える？｜……また、会えるか？｜……また、会えますか？」とだけ訊いた。{b}は「いつでも｜いつでもいい｜いつでもいいですよ」と答えた。それ以上は、どちらも言わなかった。','{a}は{b}の重荷になりたくなくて、「恋人じゃなくていいから｜恋人でなくていい｜恋人じゃなくていいですから」と先に言ってしまった。'],
cp:['{a}は「勘違いするな。これはそういう関係だ｜＝｜勘違いしないでください。これはそういう関係です」と線を引いた。{b}はその線の内側で、また会う約束をした。'],
np:['{a}は「{b}が寂しいときは、いつでも呼んで｜{b}が寂しいときは、いつでも呼んでくれ｜{b}が寂しいときは、いつでも呼んでください」と言った。それが恋人の約束ではないことを、二人とも分かっていた。']
};
var LIGHT={proud:'軽いな',stern:'節操がないな',tsun:'か、軽すぎ……',gentle:'ふふ、軽いね',devoted:'え、ええと……はい',cool:'軽いな',free:'いいね、そういうの',shy:'か、軽い……',polite:'軽いですね'};
F.offerText=function(ctx,a,b){
var k=a.tr.cold>0.6?'cold':a.tr.fc>0.6?'fc':a.tr.ac>0.6?'ac':a.tr.cp>0.6?'cp':a.tr.np>0.6?'np':ctx.rng.pick(['cold','fc']);
var pb=(b&&b.persona)||(HK.personaOf&&HK.personaOf(b))||'gentle';
return ctx.t(ctx.pick(F.OFFER[k]),a,b).replace(/\{light\}/g,LIGHT[pb]||'軽いね');
};
F.after=function(ctx,a,b){
var lead=F.lean(a)>=F.lean(b)?a:b,oth=lead===a?b:a;
return F.offerText(ctx,lead,oth);
};
var AGAIN=['{a}から「今夜、空いてる？｜今夜、空いているか？｜今夜、空いていますか？」とだけ連絡が来た。{b}は返事より先に、シャワーを浴びていた。','{a}と{b}は、いつものホテルのいつもの部屋で落ち合った。会話は少なかった。','{a}は{b}の部屋に来て、何も言わずにジャケットを脱いだ。{b}も何も訊かなかった。','終わったあと、{a}はすぐに服を着た。{b}は天井を見たまま「またね｜またな｜また会いましょう」と言った。','{a}と{b}は、恋人みたいにキスをして、恋人みたいには朝を迎えなかった。','{b}は{a}の首筋に残した痕を見て、「見えるとこはやめてって言ったでしょ｜見えるところはやめろと言っただろう｜見えるところはやめてと言ったでしょう」と笑った。','{a}は{b}を抱きながら、ふと「好き｜好きだ｜好きです」と言いかけて、別の言葉に変えた。','{a}と{b}は、お互いの恋愛の話を平気でした。平気なふりをした。'];
F.events=[
{
id:'fwb_offer',cat:'romance',sex:true,scope:'pair',pri:true,
when:function(ctx,a,b){var pf=ctx.pair(a,b);return F.allowed(ctx)&&pf.night&& !pf.couple&& !pf.fwb&& !pf.fwbAsked&& !pf.forced&&(!HK.Pos||HK.Pos.okSex(a,b));},
w:function(ctx,a){return 0.8+F.lean(a)*1.5;},
run:function(ctx,a,b){
var pf=ctx.pair(a,b);pf.fwbAsked=true;
if(F.decide(ctx,a,b)){
F.mark(ctx,a,b);
ctx.mod2(a,b,{att:6,trust:3},{att:6,trust:3});
return{text:F.offerText(ctx,a,b),why:a.name+'の「恋人より気楽な関係」寄りの気質（ドライさ・衝動性）',mag:18};
}
ctx.mod2(a,b,{aff:3},{aff:3});
return{text:ctx.t(ctx.pick(['{a}は「あれは、なかったことにしよう｜＝｜あれは、なかったことにしましょう」と言いかけて、やめた。{b}の顔を見たら、言えなかった。','{a}と{b}は、あの夜のことを一度も口にしないまま、普通に話した。','{a}は「またね｜またな｜また会いましょう」と言いかけて、「じゃあ」と言い直した。']),a,b),why:'体だけの関係にはしなかった'};
}
},
{
id:'fwb_again',label:'セフレといつもの部屋で落ち合う',cat:'romance',sex:true,scope:'pair',
when:function(ctx,a,b){var pf=ctx.pair(a,b);return F.allowed(ctx)&&pf.fwb&& !pf.couple&&pf.night&&(!HK.Pos||HK.Pos.okSex(a,b));},
w:function(ctx,a,b){return 0.9+ctx.R(a,b).att/60;},
run:function(ctx,a,b){
var pf=ctx.pair(a,b);pf.nights=(pf.nights||1)+1;
ctx.mod2(a,b,{att:5},{att:5});
var o=HK.Pos?HK.Pos.order(a,b,[a,b]):[a,b];
return{text:ctx.t(ctx.pick(AGAIN),o[0],o[1]),why:'セフレの関係（'+pf.nights+'回目）'};
}
}
];
HK.addTo(HK.COMMON,F.events);
HK.LABELS.fwbsettle={name:'セフレ',cls:'night',pol:1};
})();
});
;
/* ==== js/mini-tails.js ==== */
HK.Load.def(61,'js/mini-tails.js',function(){
(function(){
'use strict';
var HK=window.HK;
function L(s){return s.split('|');}
function T(o){var r={};Object.keys(o).forEach(function(k){r[k]=L(o[k]);});return r;}
var RULES=[
['confide',/本当は|打ち明け|弱音|本音|ここだけの話|知ってた|怖かった|怖い|泣い|泣き|過去|謝っ|ごめん|逃げたかった|家族の話|昔の|失敗/],
['promise',/約束|止める|守る|決めておこう|集合場所|作戦|推理|相談|段取り/],
['name',/名前/],
['tease',/照れ|からか|耳赤|赤いよ|ポイント|冗談|いい声|かわいい|似合|褒め/],
['laugh',/笑っ|笑い|吹き出|噴き出|爆笑|ネタ/],
['quiet',/黙って|静か|空を見上げ|夜風|星|並んで座|会話はなかった/],
['dream',/行ってみたい|将来|夢|いつか|帰ったら|ここを出たら/],
['play',/競争|勝負|挑|ゲーム|遊び|遊ん|走っ|しりとり|じゃんけん|歓声/],
['share',/おすすめ|教え|見せ|名物|知って|好きな|趣味|話をした|挙げた/],
['work',/作っ|作り|直し|直っ|繕|手伝|運ん|割れ|料理|片付|修理|掃除|組み立|見張り|席取り/]
];
HK.tailSub=function(cat,text){
if(cat!=='bond'|| !text)return null;
for(var i=0;i<RULES.length;i++)if(RULES[i][1].test(text))return RULES[i][0];
return null;
};
HK.TAILS_SUB={
promise:T({
CP:'{b}は「当てにしてる｜当てにしている｜当てにしています」と短く言った。|{b}は「異論はない｜＝｜異論はありません」と頷いた。|{b}は「……そっちこそ、忘れるなよ｜……そちらこそ、忘れるな｜……そちらこそ、忘れないでくださいね」と返した。',
NP:'{b}は「うん、そうしよう｜ああ、そうしよう｜はい、そうしましょう」とほっとしたように笑った。|{b}は「ありがとう、心強い｜＝｜ありがとうございます、心強いです」と言った。|{b}は小指を差し出した。',
A:'{b}は細かいところを二つ三つ確かめてから、頷いた。|{b}は「それでいこう｜＝｜それでいきましょう」と言った。|{b}は念のため、もう一度手順を口にした。',
FC:'{b}は「了解！｜了解だ！｜了解です！」と敬礼してみせた。|{b}は「よし、決まり！｜よし、決まりだ！｜よし、決まりですね！」と手を叩いた。|{b}は「じゃあ合言葉も決めよ！｜では合言葉も決めよう！｜では、合言葉も決めましょう！」と言い出した。',
AC:'{b}は「わ、わかった｜わ、分かった｜わ、分かりました」と何度も頷いた。|{b}は安心したように息をついた。|{b}は「頼りにしてもいい……？｜頼りにしてもいいか……？｜頼りにしてもいいですか……？」と小さく訊いた。'
}),
share:T({
CP:'{b}は「……ふうん、覚えておく｜……そうか、覚えておく｜……そうですか、覚えておきます」と言った。|{b}は興味なさそうな顔で、しっかり聞いていた。|{b}は「それなら、こっちのも教えてやる｜それなら、こちらのも教えてやる｜それなら、こちらのもお教えします」と張り合った。',
NP:'{b}は「今度一緒に見よう｜＝｜今度一緒に見ましょう」と笑った。|{b}は楽しそうに聞いて、質問を重ねた。|{b}は「教えてくれてありがとう｜教えてくれて助かった｜教えてくださって、ありがとうございます」と言った。',
A:'{b}は「なるほど」と言って、頭の中に書き留めた。|{b}は的確な質問を一つ返した。|{b}は少し考えてから、「悪くない趣味じゃん｜悪くない趣味だ｜悪くない趣味ですね」と言った。',
FC:'{b}は「え、知りたい知りたい！｜それは知りたい！｜え、知りたいです！」と身を乗り出した。|{b}は「それ好き！｜それは好きだ！｜それ、好きです！」と声を上げた。|{b}はすぐに自分のおすすめを語り返した。',
AC:'{b}は「へえ……」と、嬉しそうに聞いていた。|{b}は「私も、それ気になってた｜私も、それは気になっていた｜私も、それ気になっていました」と小さく言った。|{b}は聞きながら、何度も頷いた。'
}),
confide:T({
CP:'{b}は「……そっか｜……そうか｜……そうですか」とだけ言って、そのまま隣にいた。|{b}は「話してくれて助かる｜＝｜話してくれて助かります」と、ぶっきらぼうに言った。|{b}は茶化さずに、最後まで黙って聞いた。',
NP:'{b}は何も言わずに、その背中をさすった。|{b}は「話してくれて、ありがとう｜＝｜話してくれて、ありがとうございます」と言った。|{b}は「一人で抱えなくていいよ｜一人で抱えなくていい｜一人で抱えなくていいですよ」と笑った。',
A:'{b}は口を挟まず、最後まで聞いた。|{b}は「覚えておく｜＝｜覚えておきます」と静かに言った。|{b}は少し間を置いてから、「それでいいと思う｜＝｜それでいいと思います」と言った。',
FC:'{b}は「えっ、マジで｜何、本当か｜えっ、本当ですか」と言ってから、急に真面目な顔になった。|{b}は茶化しかけて、やめた。代わりに肩をぶつけた。|{b}は「じゃあ、こっちも一個言うね｜では、こちらも一つ言おう｜では、こちらも一つ言いますね」と、自分の話を始めた。',
AC:'{b}は「わ、私でよければ……」と小さく言った。|{b}は自分のことのように俯いた。|{b}は何度も頷いて、目を潤ませた。'
}),
name:T({
CP:'{b}は「……好きにしろ｜＝｜……好きにしてください」と言って、顔を背けた。|{b}は返事の代わりに、名前を呼び返した。|{b}は一瞬だけ足を止めた。',
NP:'{b}は嬉しそうに振り返った。|{b}は「なに？｜何だ？｜何ですか？」と柔らかく応えた。|{b}は名前を呼ばれて、顔をほころばせた。',
A:'{b}は少し間を置いて、「なに｜何だ｜何ですか」と応えた。|{b}は表情を変えなかったが、足を止めた。|{b}は「……慣れないな｜＝｜……慣れませんね」と呟いた。',
FC:'{b}は「はーい！」と手を挙げた。|{b}は呼ばれるたびに、大げさに返事をした。|{b}は「もう一回呼んで｜もう一回呼んでくれ｜もう一回呼んでください」と言った。',
AC:'{b}は名前を呼ばれて、肩を跳ねさせた。|{b}は照れくさそうに返事をした。|{b}は小さな声で、名前を呼び返した。'
}),
tease:T({
CP:'{b}は「うるさい｜＝｜うるさいです」と言って、そっぽを向いた。|{b}は「調子に乗らないで｜調子に乗るな｜調子に乗らないでください」と言い返したが、声に棘はなかった。|{b}はわざとらしく咳払いをした。',
NP:'{b}は「もう」と笑って、軽く叩き返した。|{b}は困ったように笑った。|{b}は「はいはい」と受け流した。満更でもなさそうだった。',
A:'{b}は「……根拠は？｜……根拠は何だ｜……根拠は何ですか」と真顔で返した。|{b}は聞こえなかったふりをした。|{b}は冷静に言い返したが、耳だけ赤かった。',
FC:'{b}は「そっちこそ｜そっちこそだ｜そちらこそです」とやり返した。|{b}はお返しに変な顔をしてみせた。|{b}は笑いながら肘でつついた。',
AC:'{b}は真っ赤になって俯いた。|{b}は「や、やめてよ……｜や、やめろ……｜や、やめてください……」と小声で言った。|{b}は返事に困って、袖をいじった。'
}),
laugh:T({
CP:'{b}は「くだらない｜＝｜くだらないですね」と言いながら、肩を震わせていた。|{b}は笑いをこらえきれず、口元を押さえた。|{b}は珍しく、声を出して笑った。',
NP:'{b}はお腹を抱えて笑った。|{b}は笑いながら、相手の肩に手を置いた。|{b}は「もう、やめてよ｜もう、やめてくれ｜もう、やめてください」と涙を拭いた。',
A:'{b}は真顔を保とうとして、失敗した。|{b}は一拍遅れて、小さく吹き出した。|{b}は「……今のは、ずるい｜＝｜……今のは、ずるいです」と笑った。',
FC:'{b}は床を叩いて笑い転げた。|{b}は「もう一回やって！｜もう一回やってくれ！｜もう一回やってください！」とせがんだ。|{b}は笑いすぎて、しゃっくりが止まらなくなった。',
AC:'{b}は笑っていいのか迷ってから、結局笑った。|{b}は口元を隠して、くすくす笑った。|{b}は周りの顔を見てから、ほっとしたように笑った。'
}),
quiet:T({
CP:'{b}は何も言わず、隣を離れなかった。|{b}は腕を組んだまま、同じ方を見ていた。|{b}は珍しく、黙っていることを選んだ。',
NP:'{b}はそっと隣に座り直した。|{b}は穏やかな顔をしていた。|{b}は小さく「いい夜だね｜いい夜だ｜いい夜ですね」と言った。',
A:'{b}は沈黙を気にしなかった。|{b}は目を閉じて、風の音を聞いていた。|{b}の表情が、少しだけ和らいでいた。',
FC:'{b}は珍しく、静かにしていた。|{b}は鼻歌を一小節だけ歌って、やめた。|{b}はあくびをして、笑った。',
AC:'{b}は沈黙が苦にならないことに、少し驚いていた。|{b}はほっとしたように息をついた。|{b}は膝を抱えて、隣にいた。'
}),
dream:T({
CP:'{b}は「付き合ってやってもいい｜＝｜付き合ってあげてもいいです」と言った。|{b}は「現実的じゃない｜現実的ではない｜現実的ではありません」と言いながら、一つ付け足した。|{b}は鼻で笑ったが、否定はしなかった。',
NP:'{b}は「一緒に行けたらいいね｜一緒に行けたらいいな｜一緒に行けたらいいですね」と言った。|{b}は楽しそうに話を聞いていた。|{b}は「絶対行こう｜＝｜絶対行きましょう」と小指を差し出した。',
A:'{b}は真剣に段取りを考え始めた。|{b}は「順番を決めよう｜＝｜順番を決めましょう」と言った。|{b}は少し考えて、自分の答えを返した。',
FC:'{b}は「全部行こう！｜＝｜全部行きましょう！」と言った。|{b}は話を膨らませすぎて、宇宙まで行った。|{b}は目を輝かせて身を乗り出した。',
AC:'{b}は「私も行っていいのかな｜私も行っていいのだろうか｜私も行っていいんでしょうか」と呟いた。|{b}は遠慮がちに、自分の答えを一つだけ挙げた。|{b}は、そんな日が来ることを想像して微笑んだ。'
}),
play:T({
CP:'{b}は「次は負けない｜＝｜次は負けません」と言った。|{b}は勝ち負けにこだわって、もう一回を要求した。|{b}は呆れた顔をしつつ、最後まで付き合った。',
NP:'{b}は楽しそうに笑っていた。|{b}は「また今度やろう｜＝｜また今度やりましょう」と言った。|{b}は相手が楽しんでいるのを見て、満足そうだった。',
A:'{b}は勝ち筋を冷静に考えていた。|{b}は表情を崩さなかったが、最後に少しだけ笑った。|{b}はルールの穴を見つけて、指摘した。',
FC:'{b}は誰より大声ではしゃいだ。|{b}は「もう一回！｜もう一回だ！｜もう一回お願いします！」と叫んだ。|{b}は笑いすぎて、涙を拭いていた。',
AC:'{b}は遠慮がちに、でも楽しそうについてきた。|{b}はみんなの顔色を見ながら笑っていた。|{b}は「私も入っていいの？｜私も入っていいのか？｜私も入っていいんですか？」と小さく訊いた。'
}),
work:T({
CP:'{b}は「やり方が甘い｜＝｜やり方が甘いです」と言いながら、手を貸した。|{b}は仕上がりを確かめて、小さく頷いた。|{b}は黙って、一番大変な部分を引き受けた。',
NP:'{b}は「ありがとう、助かる｜＝｜ありがとうございます、助かります」と笑った。|{b}は手を動かしながら、何度も声をかけた。|{b}は仕上がりを一緒に喜んだ。',
A:'{b}は手際よく段取りを整えた。|{b}は「次はこうした方が早い｜＝｜次はこうした方が早いです」と提案した。|{b}は出来を確かめて、「上出来じゃん｜上出来だ｜上出来です」と言った。',
FC:'{b}は途中で飽きかけたが、最後まで付き合った。|{b}は終わった瞬間、ハイタッチを求めた。|{b}は作業中ずっと鼻歌を歌っていた。',
AC:'{b}は言われたことを、丁寧にこなした。|{b}は「これで合ってる？｜これで合っているか？｜これで合っていますか？」と何度も確かめた。|{b}は役に立てて、ほっとした顔をした。'
})
};
})();
});
;
/* ==== js/omega-love-kit.js ==== */
HK.Load.def(101,'js/omega-love-kit.js',function(){
(function(){
'use strict';
var HK=window.HK,OM=HK.OMEGA;
if(!OM)return;
function L(s){return s.split('|');}
function key(a,b){return a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;}
function sx(c){return c.om&&c.om.sex;}
function bonded(ctx,a,b){return!!(ctx.om&&ctx.om.bonded&&ctx.om.bonded[key(a,b)]);}
function top(c){return HK.voiceTop?HK.voiceTop(c):'NP';}
function pick(ctx,a){return HK.Ero&&HK.Ero.fresh?HK.Ero.fresh(ctx,a,function(l){return ctx.pick(l);}):ctx.pick(a);}
function cap(ctx){var n=((ctx.om&&ctx.om.sexN)||0)/Math.max(1,HK.Pos&&HK.Pos.nightK?HK.Pos.nightK(ctx):1);return n<1?1:n<2?0.85:n<3?0.3:n<4?0.08:0.03;}
OM.sexCap=cap;
function combo(A,B){
var a=sx(A),b=sx(B);
if(a==='b'||b==='b')return'b';
if(a==='a'&&b==='o')return'ao';
if(a==='o'&&b==='a')return'oa';
return a==='a'?'aa':'oo';
}
var T={
when:L('週末の夜、|残業から帰った深夜、|休日の朝、ベッドの中で|二人で湯船に浸かったあと、|映画を観ていたソファの上で、|雨の音しか聞こえない午後、|記念日の食事から帰ってすぐ、|旅行先の旅館で、|寝る前の歯磨きを終えたところで、|ベランダで夜風に当たっていたとき、|二人で料理をしていたキッチンで、|久しぶりに会えた日の夜、'),
bondOpen:L('{x}は{o}のうなじの噛み跡に唇を寄せた。そこに触れられるだけで、{o}の体から力が抜けていく。|{b}が{a}の首筋に顔を埋めて、{sa}の匂いを深く吸い込んだ。それだけで、二人とも息が上がった。|{b}は{a}のシャツに顔を押しつけて、「ほかの匂い、ついてない｜ほかの匂いは、ついていない｜ほかの匂いは、ついていませんね」と確かめてから、自分から唇を重ねた。|うなじの番の印を指でなぞられて、{o}は小さく震えた。{x}は笑って、もう一度そこを甘噛みした。|{a}と{b}は、目が合っただけで分かった。{sa}と{sb}の匂いが、部屋の中で絡まり合っていく。|{b}は{a}の膝に跨り、額を合わせた。「今日は、ずっとこうしてたい｜今日は、ずっとこうしていたい｜今日は、ずっとこうしていたいです」|{x}は{o}を後ろから抱き寄せ、うなじの噛み跡にキスを落としながら、ゆっくり服の中に手を滑り込ませた。|{a}は{b}の指に自分の指を絡め、番の匂いを確かめるように、手首の内側に口づけた。'),
coupleOpen:L('{a}は{b}の手を引いて寝室に連れていき、扉を閉めるなり唇を重ねた。|{b}は{a}の膝の上に座り、「今日は泊まっていくよね｜今日は泊まっていくだろう｜今日は泊まっていきますよね」と囁いた。|{a}は{b}の髪に指を差し入れ、ゆっくりと深いキスをした。{b}の{sb}の匂いが、少しずつ濃くなった。|{a}と{b}は、ソファでじゃれ合ううちに、いつの間にか笑い声が途切れていた。|{b}は{a}のネクタイを指に巻きつけ、ゆっくりと引き寄せた。|{a}は{b}の耳元で「今夜は帰さない｜＝｜今夜は帰しません」と言った。{b}は返事の代わりに、{a}の背中に腕を回した。'),
after:{
CP:L('{b}は「……やりすぎ｜……やりすぎだ｜……やりすぎです」と文句を言いながら、{a}の腕の中から出ていこうとはしなかった。|{b}は乱れたシーツを見て、「片づけはあなたね｜片づけはあなただ｜片づけはあなたですよ」と言った。耳まで赤かった。'),
NP:L('{b}は{a}の髪を撫でながら、「今日も一緒にいてくれてありがとう｜＝｜今日も一緒にいてくれてありがとうございます」と言った。|{b}は{a}の汗を拭いてやり、それから自分も{a}の胸に潜り込んだ。'),
A:L('{b}は天井を見上げて、「明日、起きられない計算だ｜＝｜明日、起きられない計算です」と真顔で言った。|{b}は呼吸を整えながら、「……次は、もう少し手加減を」と言いかけて、やめた。'),
FC:L('{b}は「おなかすいた！｜腹が減った！｜おなかがすきました！」と叫んで、{a}の作った夜食をぺろりと平らげた。|{b}は{a}の背中の引っかき傷を数えて、「今日のは新記録｜今日のは新記録だ｜今日のは新記録です」と笑った。'),
AC:L('{b}は{a}の胸に顔を埋めたまま、「好き｜好きだ｜好きです」と小さく言った。二度目は言ってくれなかった。|{b}は{a}の匂いの残るシャツを、こっそり抱きしめて眠った。')
},
bondAfter:L('番の二人は、互いの匂いに包まれたまま眠った。{o}のうなじの噛み跡に、{x}は眠る前にもう一度だけキスをした。|{x}は{o}の噛み跡を指でなぞりながら、「一生、離さない｜＝｜一生、離しません」と言った。{o}は「知ってる｜知っている｜知っています」と笑った。|翌朝、{b}の首筋には新しい印がいくつも増えていた。{b}はタートルネックを探しながら、まんざらでもない顔をしていた。'),
low:L('――その夜、寝室の明かりは遅くまで消えなかった。|――翌朝、二人は同じ毛布にくるまって、昼過ぎまで起きてこなかった。|――そのあとのことは、二人だけが知っている。|――カーテンの隙間から朝日が差す頃、二人はようやく眠りについた。')
};
function allPlay(cb,hardA){
var o=[];
T.play.forEach(function(p){var l=(p[cb]||p.base).filter(function(x){return!(hardA&& /主導権/.test(x));});o=o.concat(l.length?l:p.base);});
return o;
}
function scene(ctx,x,y,bond){
var fb=sx(y)==='a'&&sx(x)!=='a'?[y,x]:[x,y];
var lr=HK.Pos?HK.Pos.order(x,y,fb):fb,A=lr[0],B=lr[1],cb=combo(A,B);
var lew=ctx.env.lewd||'mid',sc=OM.sc||function(t){return t;};
if(!T.play)lew='low';
var ff= !!HK.Pos&&(OM.ffTU?OM.ffTU(A,B):HK.Pos.ff(A,B)),hardA=HK.Pos&&HK.Pos.hardTop(A,B),fx=HK.Pos&&HK.Pos.fixed(A,B);
var Oq=sx(B)==='o'?B:sx(A)==='o'?A:B;
var bo=T.bondOpen.filter(function(l){return Oq!==A|| !/^\{x\}は\{o\}|\{o\}は小さく震えた|\{o\}の体から力が抜け/.test(l);});
var op=pick(ctx,bond?(bo.length?bo:T.coupleOpen):T.coupleOpen);
var out=[(ctx.rng()<0.25?'':pick(ctx,T.when))+op];
if(lew==='low')out.push(pick(ctx,T.low));
else if(ff){
if(ctx.rng()<0.6)out.push(pick(ctx,T.lead[top(A)]));
out.push(pick(ctx,T.playFF));
if(lew==='high'&&ctx.rng()<0.5)out.push('それから、'+pick(ctx,T.playFF));
out.push(pick(ctx,T.knotFF));
var Vf=HK.Voice;
if(Vf&&ctx.rng()<0.7)out.push(Vf.line(function(arr){return ctx.pick(arr);},B.persona,'climax','b'));
}else{
if(ctx.rng()<0.6)out.push(pick(ctx,T.lead[top(A)]));
var pa=allPlay(cb,hardA),l1=pick(ctx,pa);
out.push(l1);
if(lew==='high'&&ctx.rng()<0.5){var rest=pa.filter(function(x){return x!==l1;});if(rest.length)out.push('それから、'+pick(ctx,rest));}
var kn=T.knot[cb].filter(function(x){return!(fx&& /次はこっちが上/.test(x));});
if(ctx.rng()<(cb==='ao'?(bond?0.8:0.5):0.6))out.push(pick(ctx,kn.length?kn:T.knot[cb]));
var V=HK.Voice,pf=function(arr){return ctx.pick(arr);};
if(V&&ctx.rng()<0.7)out.push(V.line(pf,B.persona,'climax','b'));
}
out.push(pick(ctx,bond&&ctx.rng()<0.5?T.bondAfter:T.after[top(B)]));
var O=sx(B)==='o'?B:sx(A)==='o'?A:B,X=O===A?B:A;
var text=out.map(function(s){return sc(ctx.t(s.replace(/\{o\}/g,O.name).replace(/\{x\}/g,X.name),A,B),A,B);}).join('');
if(ff&&HK.FF)text=HK.FF.fix(ctx,text,A,B,{tools:true});
return{text:text,A:A,B:B,cb:cb};
}
OM.loveScene=scene;
OM.LOVE={T:T,combo:combo};
OM.lovePlay=function(ctx,A,B){
if(!T.play)return'';
if(HK.Pos&&(OM.ffTU?OM.ffTU(A,B):HK.Pos.ff(A,B)))return'それから、'+pick(ctx,T.playFF);
return'それから、'+pick(ctx,allPlay(combo(A,B),HK.Pos&&HK.Pos.hardTop(A,B)));
};
OM._love={L:L,sx:sx,bonded:bonded,pick:pick,cap:cap,scene:scene};
})();
});
;
/* ==== js/drunk.js ==== */
HK.Load.def(114,'js/drunk.js',function(){
(function(){
'use strict';
var HK=window.HK;
function L(s){return s.split('|');}
function hash(s){var h=7;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%9973;return h/9973;}
function top(c){return HK.topPick?HK.topPick(c):HK.voiceTop?HK.voiceTop(c):HK.egoType(c.eg).top;}
var TYPES={
amae:{label:'甘え上戸',fit:function(t){return t.ac*0.4+t.np*0.4+t.warmth*0.4-t.cp*0.2;}},
warai:{label:'笑い上戸',fit:function(t){return t.fc*0.7+t.warmth*0.2;}},
naki:{label:'泣き上戸',fit:function(t){return t.ac*0.6+t.np*0.3-t.fc*0.3;}},
sekkyo:{label:'説教上戸',fit:function(t){return t.cp*0.6+t.lead*0.2-t.ac*0.2;}},
honne:{label:'本音が漏れる',fit:function(t){return t.a*0.3+t.honesty*0.4+t.cold*0.2;}},
nemu:{label:'寝落ちする',fit:function(t){return t.caution*0.6+(1-t.impulse)*0.4+(1-t.fc)*0.2;}},
kiss:{label:'キス魔',fit:function(t){return t.fc*0.4+t.warmth*0.3+t.impulse*0.2;}},
sunao:{label:'素直になる',fit:function(t){return t.cp*0.45+t.ac*0.45+t.cold*0.3-t.warmth*0.3;}},
nugi:{label:'脱ぎ上戸',fit:function(t){return t.fc*0.35+t.impulse*0.45;}}
};
var D=HK.Drunk={TYPES:TYPES};
D.type=function(c){
if(c.flags.dkType)return c.flags.dkType;
var best=null,bv= -9,h=hash(c.name||''),avg={};
['a','cp','np','fc','ac','warmth','cold','lead','honesty','caution','impulse'].forEach(function(k){avg[k]=0.5;});
Object.keys(TYPES).forEach(function(k,i){var v=TYPES[k].fit(c.tr)-TYPES[k].fit(avg)+((h*(i+3)*7.13)%1)*0.12;if(v>bv){bv=v;best=k;}});
return(c.flags.dkType=best);
};
D.strong=function(ctx,c){
if(ctx.scen.id==='goukon'&&ctx.stat)return ctx.stat(c,'drink');
return HK.alcLevel(c);
};
D.label=function(ctx,c){return D.strong(ctx,c)>=5?'ザル（顔に出ない）':TYPES[D.type(c)].label;};
var SHOW={
amae:L('{a}は三杯目あたりから、隣の人の袖をつまんで離さなくなった。「ねえ、もうちょっとここにいて｜もう少しここにいろ｜あの、もう少しここにいてください」|{a}は頬杖をついたまま、とろんとした目で誰かの名前を呼んでいた。'),
warai:L('{a}は箸が転がっただけで、涙を流して笑い出した。止まらなかった。|{a}は自分の言った冗談に自分で笑い、テーブルに突っ伏して肩を震わせていた。'),
naki:L('{a}は二杯目で急に黙り込み、四杯目で「みんな優しすぎる｜＝｜みんな優しすぎます」と泣き出した。|{a}は昔飼っていた犬の話をしながら、おしぼりで目を押さえていた。'),
sekkyo:L('{a}は空いたグラスを置くなり、「そもそもね｜そもそもだな｜そもそもですね」と人生論を語り始めた。誰も頼んでいなかった。|{a}は後輩の生き方について、頼まれもしないのに三十分語った。'),
honne:L('{a}は酔いが回るにつれて、普段は飲み込んでいる言葉を、するすると口にし始めた。|{a}は「正直に言うと｜＝｜正直に申しますと」を五回言った。五回とも、本当に正直だった。'),
nemu:L('{a}は二杯目の途中で、グラスを持ったまま静かに眠っていた。|{a}は会話に相づちを打ちながら、だんだん首が傾いていき、ついに壁にもたれて寝息を立てた。'),
kiss:L('{a}は「乾杯！｜＝｜乾杯です！」のたびに、隣の人のグラスに口づけていた。グラスで済んでいるうちはよかった。|{a}は上機嫌で、手の甲にキスをして回っていた。'),
sunao:L('いつも素っ気ない{a}が、酔うと急に「ありがとう｜＝｜ありがとうございます」を連発し始めた。周りは少し怖がった。|{a}は普段の憎まれ口が嘘のように、にこにこと人の話を聞いていた。'),
nugi:L('{a}は「暑い｜＝｜暑いです」と言って上着を脱ぎ、ネクタイを外し、シャツのボタンに手をかけたところで止められた。|{a}は靴下を脱いで、なぜか丁寧に畳んでテーブルに置いた。'),
zaru:L('{a}は誰よりも飲んでいるのに、顔色ひとつ変わらなかった。追加の注文も、会計の計算も、全部{a}がやっていた。|{a}は日本酒を水のように飲み干し、「次、何にする？｜次、何にするか｜次、何にしますか？」と涼しい顔でメニューを開いた。')
};
var TO={
amae:L('{a}は{b}の肩に頭を乗せて、「{b}の隣、落ち着く｜{b}の隣は、落ち着く｜{b}さんの隣、落ち着きます」と言った。そのまま動かなかった。|{a}は{b}の腕に自分の腕を絡めて、「帰らないで｜帰るな｜帰らないでください」と三回言った。|{a}は{b}の手を取って、自分の頬に当てた。「つめたくて、きもちいい｜＝｜つめたくて、きもちいいです」'),
warai:L('{a}は{b}の何気ない一言に笑い転げ、{b}の背中をばしばし叩いた。|{a}は{b}の顔を見るたびに思い出し笑いをして、理由を最後まで言わなかった。'),
naki:L('{a}は{b}の手を握って、「{b}がいてくれてよかった｜＝｜{b}さんがいてくれてよかったです」と泣き出した。|{a}は{b}の肩に顔をうずめて、何に泣いているのか自分でも分からないまま泣いた。'),
sekkyo:L('{a}は{b}に「もっと自分を大事にしなよ｜もっと自分を大事にしろ｜もっと自分を大事にしてください」と、真剣な顔で一時間説教した。内容は、全部{b}を心配することだった。|{a}は{b}の箸の持ち方から生き方まで、愛情たっぷりにダメ出しをした。'),
honne:L('{a}は{b}を見つめて、「前から思ってたけど、{b}の笑い方、好き｜前から思っていたが、{b}の笑い方は、好きだ｜前から思っていたんですけど、{b}さんの笑い方、好きです」と言った。言ってから、自分で驚いていた。|{a}は{b}に「本当は、ずっと話したかった｜＝｜本当は、ずっと話したかったんです」とこぼした。|{a}は{b}に「{b}といると、ちょっと苦しい｜{b}といると、少し苦しい｜{b}さんといると、ちょっと苦しいです」と言った。それが何の告白なのか、{b}はしばらく考えた。'),
nemu:L('{a}は{b}の肩にもたれて、すうすうと眠ってしまった。{b}は動けなくなった。|{a}は{b}の膝を枕にして寝落ちした。寝言で、{b}の名前を呼んだ。'),
kiss:L('{a}は{b}の頬に、ちゅっと音を立ててキスをした。「あいさつ｜あいさつだ｜あいさつです」と言い張った。|{a}は{b}の手を取って、指の一本一本にキスをしていった。{b}は耳まで赤くなった。|{a}は{b}の額にキスをして、満足そうに笑った。'),
sunao:L('{a}は{b}の顔をまっすぐ見て、「いつもありがとう。本当は、すごく感謝してる｜いつも助かっている。本当は、すごく感謝している｜いつもありがとうございます。本当は、すごく感謝しています」と言った。素面では一度も言ったことがなかった。|{a}は{b}に「……好きだよ、{b}のこと｜……好きだ、{b}のことが｜……好きです、{b}さんのこと」とあっさり言った。翌日の自分が聞いたら、卒倒する台詞だった。'),
nugi:L('{a}は脱いだ上着を{b}の肩にかけて、「似合うよ｜似合う｜似合います」と笑った。自分はシャツ一枚になっていた。|{a}がシャツのボタンに手をかけたところで、{b}が慌ててその手を押さえた。'),
zaru:L('{a}は酔った人たちの間を回って水を配り、最後に{b}の隣に座って「お疲れ｜＝｜お疲れさまです」と言った。|{a}は涼しい顔のまま、{b}のグラスにだけこっそり烏龍茶を混ぜていた。')
};
var RE={
CP:L('{b}は「飲みすぎだよ｜飲みすぎだ｜飲みすぎです」と言いながら、{a}のグラスを取り上げた。手つきは優しかった。|{b}は呆れた顔をしたが、{a}の頭を一度だけ撫でた。'),
NP:L('{b}は「よしよし｜＝｜よしよし」と言って、{a}が落ち着くまで背中をさすった。|{b}は笑いながら、{a}の前に水とおしぼりを並べた。'),
A:L('{b}は「{a}は酔うとこうなるんだ｜{a}は酔うとこうなるのか｜{a}さんは酔うとこうなるんですか」と、なぜか手帳にメモをした。|{b}は冷静に水を頼み、{a}の分の会計まで計算していた。口元だけ笑っていた。'),
FC:L('{b}は大笑いして、こっそり動画を撮った。|{b}は「かわいいじゃん｜かわいいな｜かわいいじゃないですか」と言って、{a}の頬をつついた。'),
AC:L('{b}は真っ赤になって固まったまま、{a}を振りほどけなかった。|{b}はどうしていいか分からず、小さな声で「だ、大丈夫……？｜だ、大丈夫か……？｜だ、大丈夫ですか……？」と繰り返した。')
};
var CARE=L('{b}は酔いつぶれた{a}を背負って、夜道を歩いた。背中の{a}が、寝言で何か言った。|{b}は{a}をタクシーに乗せ、行き先を告げてから、迷った末に自分も乗り込んだ。|{b}はコンビニでスポーツドリンクを買ってきて、{a}の首筋に当てた。{a}は「つめたい｜＝｜つめたいです」と笑った。|{b}は{a}を部屋まで送り、靴を脱がせ、布団をかけて、水を枕元に置いて帰った。');
var MORN={
forget:L('翌朝、{a}は昨夜のことを何も覚えていなかった。{b}だけが、全部覚えていた。|翌朝、{a}は「昨日、変なこと言ってなかった？｜昨日、変なことを言っていなかったか｜昨日、変なことを言っていませんでしたか？」と{b}に訊いた。{b}は「別に｜＝｜別に、何も」と答えて、目を逸らした。'),
remember:L('翌朝、{a}は昨夜のことを全部覚えていた。{b}からの「おはよう｜＝｜おはようございます」に、{a}は布団をかぶったまま返事ができなかった。|翌朝、{a}は{b}に「昨日のは、忘れて｜昨日のは、忘れろ｜昨日のは、忘れてください」と送った。既読がついたまま、返事は来なかった。')
};
var OM_EX={
o:L('酔いのせいで抑制剤の効きが緩み、{a}の首元から甘い匂いがふわりと漏れた。|{a}は酔うと、自分の匂いがいつもより濃くなることを忘れていた。'),
a:L('酔った{a}の匂いが少しだけ強くなり、周りのΩがそわそわし始めた。{a}は気づかずに笑っていた。|{a}は酔っても威圧だけは出さないよう、無意識に息を整えていた。'),
b:L('{a}はαとΩの匂いが入り混じる中で、βらしく一人だけ平然と飲んでいた。')
};
var OM_AB=L('{b}は{a}の匂いに気づいて、自分の上着を{a}の肩にかけ、周りから隠した。|{b}は{a}の首筋に鼻先を寄せかけて、慌てて顔を背けた。「……飲みすぎだよ。帰ろう｜……飲みすぎだ。帰るぞ｜……飲みすぎです。帰りましょう」');
var OCC=L('週末の飲み会で、|{b}の部屋での宅飲みで、|行きつけのバーで、|誕生日祝いの席で、|花見の宴会で、|居酒屋のカウンターで、');
function fill(ctx,t,a,b){return ctx.t(t,a,b);}
function react(ctx,a,b){return fill(ctx,ctx.pick(RE[top(b)]||RE.NP),a,b);}
function why(ctx,a){var k=D.label(ctx,a);return a.name+'の酔い方「'+k+'」（'+(D.strong(ctx,a)>=5||a.alcohol?'酒の強さ '+D.strong(ctx,a)+(a.alcohol?'（設定）':''):'エゴグラムから')+'）';}
function behave(ctx,a,b){
var k=D.strong(ctx,a)>=5?'zaru':D.type(a);
var att={amae:{att:4,aff:3},warai:{aff:3},naki:{aff:4,trust:3},sekkyo:{trust:3,ten:2},honne:{att:6,trust:3},nemu:{aff:3},kiss:{att:7},sunao:{att:6,aff:5},nugi:{att:4},zaru:{trust:5,aff:3}}[k];
ctx.mod2(a,b,{att:2,aff:2},att);
return k;
}
var WEAK=L('{a}は、グラス半分で頬が真っ赤になった。|{a}は一杯目の途中で、もう目がとろんとしていた。|{a}は「弱いの、知ってるでしょ｜弱いのは、知っているだろう｜弱いの、知っているでしょう」と言いながら、二口目で耳まで赤くなった。|{a}は、乾杯の一口でもう首まで赤かった。');
D._k={top:top,fill:fill,react:react,why:why,behave:behave,SHOW:SHOW,TO:TO,CARE:CARE,MORN:MORN,OM_EX:OM_EX,OM_AB:OM_AB,OCC:OCC,WEAK:WEAK};
})();
});
;
/* ==== js/mini-serifu.js ==== */
HK.Load.def(130,'js/mini-serifu.js',function(){
(function(){
'use strict';
var HK=window.HK,E=HK.E;
var ALL=['goukon','whiteroom','classroom','island','br','trial','omega'];
var TALK=[
E('sf_name','bond','p+','warmth*.4+fc*.2','','ab:aff3;ba:aff4','{a}「名前、なんて呼べばいい？｜名前、なんと呼べばいい｜お名前、なんとお呼びすればいいですか？」{b}「好きに呼んで｜好きに呼べ｜好きに呼んでください」{a}「じゃあ、下の名前で｜なら、下の名前で呼ぶ｜では、下の名前でお呼びします」|{a}「{b}って、思ってたより話しやすいね｜{b}は、思っていたより話しやすいな｜{b}さんは、思っていたより話しやすいですね」{b}「どう思ってたの｜どう思っていたんだ｜どう思っていたんですか」|{a}「ねえ、それ癖？｜それは癖か｜それ、癖ですか？」{b}「え、何が｜何がだ｜え、何がですか」{a}「考えるとき、口尖らせるの｜考えるとき、口を尖らせる癖がある｜考えるとき、口を尖らせるんです」|{a}「私、{b}といると、なんか落ち着く｜私は{b}といると、妙に落ち着く｜私、{b}さんといると、なんだか落ち着きます」{b}「…それ、褒めてる？｜…それは、褒めているのか｜…それ、褒めているんですか？」|{a}「同い年だっけ｜同い年だったか｜同い年でしたっけ」{b}「たぶん｜＝｜たぶん、そうです」{a}「じゃあ敬語やめよ。私もそのほうが楽｜なら敬語はやめよう。私もそのほうが楽だ｜では、敬語はやめましょう。私もそのほうが楽です」|{a}「さっきから気になってたんだけど、いい声してるよね｜さっきから気になっていたが、いい声をしているな｜さっきから気になっていたんですが、いい声をしていますね」{b}「急に何｜急に何だ｜急に何ですか」'),
E('sf_thanks','help','p+','np*.5+ac*.2','','ba:aff5,trust4','{a}「さっきはありがとう。私、言いそびれてた｜さっきは助かった。言いそびれていた｜さっきはありがとうございました。私、言いそびれていました」{b}「何のこと？｜何のことだ｜何のことですか？」{a}「いいの、こっちの話｜いい、こっちの話だ｜いいんです、こちらの話です」|{a}「無理してない？｜無理をしていないか｜無理をしていませんか？」{b}「…ちょっとだけ｜…少しだけだ｜…少しだけです」{a}「ちょっとなら、寄りかかっていいよ｜少しなら、寄りかかっていい｜少しなら、寄りかかっていいですよ」|{a}「{b}が隣にいてくれて、私、助かってる｜{b}が隣にいてくれて、助かっている｜{b}さんが隣にいてくれて、私、助かっています」{b}「大げさだな｜＝｜大げさですね」|{a}「顔色悪いよ。水、飲む？｜顔色が悪いな。水を飲むか｜顔色が悪いですよ。お水、飲みますか？」{b}「…うん。ありがと｜…ああ。ありがとう｜…はい。ありがとうございます」|{a}「何かあったら、私に言って。黙ってるのが一番困る｜何かあったら、私に言え。黙っているのが一番困る｜何かあったら、私に言ってください。黙っているのが一番困ります」{b}「…わかった｜＝｜…わかりました」|{a}「それ、半分持つよ｜それを半分持とう｜それ、半分持ちます」{b}「いいって｜いい｜いいですよ」{a}「よくない｜＝｜よくないです」'),
E('sf_tease','bond','p+','fc*.5+impulse*.2','','ab:aff2;ba:aff2,ten1','{a}「今の顔、私、写真撮りたかった｜今の顔、写真に撮りたかった｜今の顔、私、写真に撮りたかったです」{b}「やめて｜やめろ｜やめてください」|{a}「{b}ってさ、絶対モテないでしょ｜{b}は、絶対モテないだろう｜{b}さんって、絶対モテないでしょう」{b}「は？｜＝｜はい？」{a}「冗談だって｜冗談だ｜冗談です」|{a}「それ本気で言ってる？｜それは本気で言っているのか｜それ、本気で言っていますか？」{b}「…半分｜＝｜…半分です」{a}「どっちの半分｜どちらの半分だ｜どちらの半分ですか」|{a}「はーい、今のでポイント一つ減った｜今のでポイントが一つ減った｜はい、今のでポイント一つ減りました」{b}「何のポイントだよ｜何のポイントだ｜何のポイントですか」|{a}「{b}の怒り方、猫みたい｜{b}の怒り方は、猫のようだな｜{b}さんの怒り方、猫みたいですね」{b}「怒ってない｜怒っていない｜怒っていません」|{a}「あ、照れてる｜照れているな｜あ、照れていますね」{b}「照れてない｜照れていない｜照れていません」{a}「耳赤いよ｜耳が赤い｜耳が赤いですよ」'),
E('sf_secret','bond','p+','honesty*.4+trust/80','trust>15','ab:trust5;ba:trust6;sec','{a}「誰にも言わないでね｜誰にも言うな｜誰にも言わないでください」{b}「言わない｜＝｜言いません」{a}「…実は｜＝｜…実は、ですね」|{a}「これ、私、{b}にしか言ってないから｜これは{b}にしか言っていない｜これ、私、{b}さんにしか言っていませんから」{b}「重いな｜＝｜重いですね」{a}「重いよ｜重いぞ｜重いです」|{a}「私の昔のこと、聞いてくれる？｜私の昔のことを、聞いてくれるか｜私の昔のことを、聞いてくれますか？」{b}「いくらでも｜＝｜いくらでも、どうぞ」|{a}「本当は、私、ずっと逃げたかったんだ｜本当は、ずっと逃げたかった｜本当は、私、ずっと逃げたかったんです」{b}「…知ってた｜…知っていた｜…知っていました」|{a}「私、{b}にだけは嘘つきたくないから言うけど｜{b}にだけは嘘をつきたくないから言う｜私、{b}さんにだけは嘘をつきたくないので言いますが」{b}「うん｜ああ｜はい」|{a}「笑わないで聞いて｜笑わずに聞け｜笑わないで聞いてください」{b}「笑わない｜＝｜笑いません」{a}「…絶対笑うやつ｜…絶対笑うやつだ｜…絶対笑うやつです」'),
E('sf_future','bond','p+','warmth*.3+np*.2+a*.2','','ab:aff3,trust3;ba:aff3,trust3','{a}「全部終わったら、何したい？｜全部終わったら、何をしたい｜全部終わったら、何をしたいですか？」{b}「とりあえず寝る｜＝｜とりあえず寝ます」{a}「わかる｜＝｜わかります」|{a}「来年の今ごろ、何してると思う？｜来年の今ごろ、何をしていると思う｜来年の今ごろ、何をしていると思いますか？」{b}「さあ。{a}は？｜さあな。{a}は？｜さあ、どうでしょう。{a}さんは？」{a}「私が隣にいたりして｜私が隣にいるかもしれない｜私が隣にいたりするかもしれませんね」|{a}「いつか一緒に海行こうよ｜いつか一緒に海へ行こう｜いつか一緒に海へ行きましょう」{b}「なんで海｜なぜ海なんだ｜なぜ海なんですか」{a}「なんとなく｜＝｜なんとなく、です」|{a}「約束しよう。また話そうって｜約束だ。また話そう｜約束しましょう。また話しましょう、って」{b}「約束するほどのこと？｜約束するほどのことか｜約束するほどのことですか」{a}「するほどのことだよ｜するほどのことだ｜するほどのことです」'),
E('sf_quiet','bond','p','caution*.3+ac*.3','','ab:trust3;ba:trust3','{a}「…何も喋らなくていい？｜…何も喋らなくていいか｜…何も喋らなくていいですか？」{b}「いいよ｜いい｜いいですよ」二人はしばらく黙って並んでいた。|{a}「静かだね｜静かだな｜静かですね」{b}「うん｜ああ｜はい」それ以上の会話はなかったが、悪くなかった。|{a}「私、{b}の隣、静かで好き｜{b}の隣は、静かで好きだ｜私、{b}さんの隣、静かで好きです」{b}「褒めてんの、それ｜褒めているのか、それは｜褒めているんですか、それ」|{a}「疲れた｜＝｜疲れました」{b}「知ってる｜知っている｜知っています」{a}「そうか｜＝｜そうですか」|{a}は{b}の隣に座った。どちらも口を開かなかったが、席を立つ気にもならなかった。|{a}「……何か話す？｜……何か話すか｜……何か話しますか？」{b}「別に｜＝｜別に、何もありません」{a}「だよね｜だな｜ですよね」二人は同じタイミングで小さく笑った。|{a}と{b}は、同じものを見ながら黙っていた。沈黙が気まずくない相手は、案外少ない。|{a}「眠い｜＝｜眠いです」{b}「寝てていいよ｜寝ていていい｜寝ていていいですよ」{a}は本当に、少しだけ目を閉じた。'),
E('sf_snap','conflict','p+','cp*.4+stress/100+aggr*.2','','ab:ten6;ba:ten8,aff-3','{a}「いい加減にしてくれる？｜いい加減にしろ｜いい加減にしてくれますか？」{b}「何が｜何がだ｜何がですか」{a}「全部だよ｜全部だ｜全部です」|{a}「私、{b}のそういうとこ、ほんと無理｜{b}のそういうところが、本当に無理だ｜私、{b}さんのそういうところ、本当に無理です」{b}「…どういうとこ｜…どういうところだ｜…どういうところですか」|{a}「黙ってないで何とか言ってよ｜黙っていないで何とか言え｜黙っていないで何とか言ってください」{b}「言ったら怒るでしょ｜言ったら怒るだろう｜言ったら怒るでしょう」|{a}「あなたに言われたくない｜あなたに言われたくない｜あなたに言われたくないです」{b}「こっちの台詞だよ｜こちらの台詞だ｜こちらの台詞です」|{a}「正論なのは私もわかってる。でも今それ言う？｜正論なのは分かっている。だが今それを言うのか｜正論なのは私もわかっています。でも今それを言いますか？」{b}「今言わないでいつ言うの｜今言わないでいつ言うんだ｜今言わないでいつ言うんですか」|{a}「もういい｜＝｜もういいです」{b}「よくないでしょ｜よくないだろう｜よくないでしょう」{a}「もういいって言ってるの｜もういいと言っている｜もういいと言っています」'),
E('sf_misread','conflict','p+','jealous*.4+ac*.2','ten>10','ab:ten5;ba:ten4','{a}「さっき、なんで笑ったの｜さっき、なぜ笑った｜さっき、なぜ笑ったんですか」{b}「笑ってないけど｜笑っていないが｜笑っていませんが」{a}「笑った｜＝｜笑いました」|{a}「どうせ{b}は、わかってくれないでしょ｜どうせ{b}は、分かってくれないだろう｜どうせ{b}さんは、わかってくれないでしょう」{b}「決めつけないでよ｜決めつけるな｜決めつけないでください」|{a}「別に私、怒ってないから｜別に怒っていない｜別に私、怒っていませんから」{b}「怒ってるじゃん｜怒っているじゃないか｜怒っているじゃないですか」{a}「怒ってない！｜怒っていない！｜怒っていません！」|{a}「{b}って、誰にでもそうなの？｜{b}は、誰にでもそうなのか｜{b}さんって、誰にでもそうなんですか？」{b}「そうって何｜そうとは何だ｜そう、とは何ですか」{a}「…なんでもない｜＝｜…なんでもないです」'),
E('sf_makeup','help','p+','np*.4+ac*.4','ten>20','ab:ten-10,trust5;ba:ten-10,trust5','{a}「さっきは、私が言いすぎた｜＝｜さっきは、私が言いすぎました」{b}「…こっちも｜＝｜…こちらもです」|{a}「ごめん。{b}が悪いんじゃない｜すまない。{b}が悪いのではない｜ごめんなさい。{b}さんが悪いんじゃありません」{b}「わかってる。だから怒れなかった｜分かっている。だから怒れなかった｜わかっています。だから怒れませんでした」|{a}「仲直りの印｜＝｜仲直りの印です」{a}は飴を一つ差し出した。{b}「安いな｜＝｜安いですね」でも受け取った。|{a}「怒ってる？｜怒っているか｜怒っていますか？」{b}「怒ってた｜怒っていた｜怒っていました」{a}「過去形？｜過去形か｜過去形ですか？」{b}「過去形｜＝｜過去形です」|{a}「私、謝るの下手でごめん｜謝るのが下手ですまない｜私、謝るのが下手でごめんなさい」{b}「知ってる。上手くなくていい｜知っている。上手くなくていい｜知っています。上手くなくていいですよ」|{a}「…ごめんね｜…すまない｜…ごめんなさい」{b}は答えずに、{a}の頭を一度だけ撫でた。'),
E('sf_pride','conflict','p+','cp*.5+lead*.3','B.cp>.55','ab:ten7;ba:ten7','{a}「私に指図しないで｜私に指図するな｜私に指図しないでください」{b}「指図じゃない、提案だよ｜指図ではない、提案だ｜指図ではなくて、提案です」{a}「同じだよ｜同じだ｜同じです」|{a}「{b}の案は穴だらけだよ｜{b}の案は穴だらけだ｜{b}さんの案は穴だらけです」{b}「じゃああなたの案を聞かせて｜ならあなたの案を聞かせろ｜ではあなたの案を聞かせてください」|{a}「ここは私、譲れない｜ここは譲れない｜ここは私、譲れません」{b}「こっちもだよ｜こっちもだ｜こちらもです」二人は睨み合ったまま動かなかった。|{a}「仕切りたいなら勝手にどうぞ｜仕切りたいなら勝手にしろ｜仕切りたいなら、ご自由にどうぞ」{b}「あなたもね｜あなたもな｜あなたもですよ」'),
E('sf_heart','romance','p+','att/50+honesty*.2','att>25&love=1','ab:att5;ba:att6','{a}「…なんでそんなに見るの｜…なぜそんなに見るんだ｜…なぜそんなに見るんですか」{b}「見てない｜見ていない｜見ていません」{a}「見てた｜見ていた｜見ていました」|{a}「{b}、髪にゴミついてる｜{b}、髪にゴミがついている｜{b}さん、髪にゴミがついています」{a}は手を伸ばして、取るふりをして少しだけ触れた。|{a}「寒い？｜寒いか｜寒いですか？」{b}「別に｜＝｜別に、平気です」{a}「手、冷たいじゃん｜手が冷たいじゃないか｜手が冷たいじゃないですか」|{a}「今の、ずるい｜今のは、ずるいな｜今の、ずるいです」{b}「何が｜何がだ｜何がですか」{a}「笑い方｜＝｜笑い方です」|{a}「{b}ってさ、自分がどう見えてるか分かってないでしょ｜{b}は、自分がどう見えているか分かっていないだろう｜{b}さんって、自分がどう見えているか分かっていないでしょう」{b}「どういう意味｜どういう意味だ｜どういう意味ですか」{a}「教えない｜＝｜教えません」|{a}「隣、座っていい？｜隣に座っていいか｜隣に座っていいですか？」{b}「…もう座ってるじゃん｜…もう座っているだろう｜…もう座っているじゃないですか」'),
E('sf_confess','romance','p','att/40+honesty*.3','att>45&love=1','ab:att8,aff5;ba:att6','{a}「私が好きって言ったら、困る？｜私が好きだと言ったら、困るか｜私が好きだと言ったら、困りますか？」{b}「…困らない｜＝｜…困りません」|{a}「私、ずっと言おうと思ってた。{b}のことが好き｜ずっと言おうと思っていた。{b}のことが好きだ｜私、ずっと言おうと思っていました。{b}さんのことが好きです」|{a}「冗談だと思って聞いて。好き｜冗談だと思って聞け。好きだ｜冗談だと思って聞いてください。好きです」{b}「冗談なの？｜冗談なのか｜冗談なんですか？」{a}「…冗談じゃない｜…冗談ではない｜…冗談じゃないです」|{a}「一回しか言わないから、ちゃんと聞いてて｜一度しか言わないから、ちゃんと聞け｜一度しか言いませんから、ちゃんと聞いていてください」{b}は息を止めた。|{a}「私、{b}のこと、もっと知りたい。…そういう意味で｜{b}のことを、もっと知りたい。…そういう意味で言っている｜私、{b}さんのこと、もっと知りたいです。…そういう意味で」'),
E('sf_shy','romance','p+','ac*.4+att/60','att>20&love=1','ab:att4;ba:att4','{a}「な、何でもない！｜な、何でもない！｜な、何でもないです！」{a}は自分の言いかけた言葉を飲み込んだ。|{a}「あの、その…私、今日、楽しかった｜あの、その…今日は、楽しかった｜あの、その…私、今日、楽しかったです」{b}「まだ終わってないよ｜まだ終わっていない｜まだ終わっていませんよ」|{a}は{b}に話しかけようとして、三回タイミングを逃した。|{a}「私、目、見て話すの苦手で…ごめん｜私は目を見て話すのが苦手だ…すまない｜私、目を見て話すのが苦手で…すみません」{b}「じゃあ、横向いて話そう｜なら、横を向いて話そう｜では、横を向いて話しましょう」'),
E('sf_joke','bond','g','fc*.5+np*.2','','gab:aff2;as:-3','{a}「はい、ここで問題。今一番お腹空いてるのは誰でしょう｜ここで問題だ。今一番腹が減っているのは誰だ｜はい、ここで問題です。今一番お腹が空いているのは誰でしょう」|{a}「なんか、修学旅行の夜みたいだね｜なんだか、修学旅行の夜のようだな｜なんだか、修学旅行の夜みたいですね」|{a}「この状況、十年後に笑い話にしようね｜この状況は、十年後に笑い話にしよう｜この状況、十年後に笑い話にしましょうね」|{a}「よし、全員一回深呼吸。はい吸ってー｜よし、全員一度深呼吸だ。吸え｜はい、全員一度深呼吸しましょう。はい、吸ってください」|{a}「誰か面白い話して。して。お願い｜誰か面白い話をしろ。頼む｜誰か面白い話をしてください。お願いします」'),
E('sf_lead','bond','g','lead*.6','','gab:trust3','{a}「よし、整理しよう。今わかってることは三つ｜よし、整理する。今分かっていることは三つだ｜では、整理しましょう。今わかっていることは三つです」|{a}「文句は後で聞く。今は動こう｜文句は後で聞く。今は動け｜文句は後で聞きます。今は動きましょう」|{a}「役割を決めよう。動ける人はこっち、残りは向こう｜役割を決める。動ける者はこっち、残りは向こうだ｜役割を決めましょう。動ける人はこちら、残りは向こうです」|{a}「大丈夫。何とかなる。…私が何とかする｜大丈夫だ。何とかなる。…私が何とかする｜大丈夫です。何とかなります。…私が何とかします」'),
E('sf_mutter','solo','s+','cold*.3+ac*.3','','as:2','{a}「…やってらんない｜…やっていられない｜…やっていられません」と小さく呟いた。|{a}「…私、帰りたい｜…帰りたい｜…私、帰りたいです」声に出してから、{a}は自分で驚いた。|{a}「なんでこうなったんだっけ｜どうしてこうなったのか｜どうしてこうなったんでしたっけ」と天井に訊いた。|{a}「大丈夫、大丈夫｜大丈夫だ、大丈夫｜大丈夫です、大丈夫ですから」{a}は自分に言い聞かせるように繰り返した。|{a}「…お腹すいた｜…腹が減った｜…お腹がすきました」誰にともなく言った。'),
E('sf_cheer','help','p+','np*.5+fc*.2','B.stress>40','ba:aff5,trust4;bs:-8','{a}「{b}なら大丈夫。根拠はないけど｜{b}なら大丈夫だ。根拠はないが｜{b}さんなら大丈夫です。根拠はありませんけど」{b}「ないの｜ないのか｜ないんですか」少し笑った。|{a}「泣いていいよ。見ないから｜泣いていい。見ないでおく｜泣いていいですよ。見ませんから」{b}「…見てるじゃん｜…見ているじゃないか｜…見ているじゃないですか」|{a}「ほら、深呼吸。一緒に｜＝｜ほら、深呼吸。一緒にしましょう」|{a}「{b}が頑張ってるの、私はちゃんと見てるから｜{b}が頑張っているのは、ちゃんと見ている｜{b}さんが頑張っているのは、私がちゃんと見ていますから」|{a}「大丈夫って言わなくていいよ。大丈夫じゃなくていい｜大丈夫と言わなくていい。大丈夫じゃなくていい｜大丈夫と言わなくていいですよ。大丈夫じゃなくていいんです」')
];
var FWB=[
E('fw_night','romance','p','att/50+impulse*.3','night=1','ab:att5;ba:att5','{a}「今夜、空いてる？｜今夜、空いているか｜今夜、空いていますか？」{b}「…いつもの？｜…いつものか｜…いつものですか？」{a}「いつもの」|{a}は{b}の部屋の前で、ノックを二回した。それが合図だった。――|{a}と{b}は、目が合っただけで同じことを考えていた。――|{a}「ねえ｜おい｜あの」{b}「言わなくていいよ｜言わなくていい｜言わなくていいです」――二人は、言葉より先に触れていた。'),
E('fw_morning','bond','p','cold*.3+caution*.3','night=1','ab:ten3;ba:ten3','{a}は{b}が目を覚ます前に服を着た。{b}「…帰るの？｜…帰るのか｜…帰るんですか？」{a}「いつも通り｜＝｜いつも通りです」|{a}「昨日のことは」{b}「いつも通り、なかったことに｜いつも通り、なかったことにする｜いつも通り、なかったことにしましょう」|朝、{a}と{b}は何事もなかったように「おはよう｜＝｜おはようございます」と言った。|{a}は{b}の寝顔を見ないようにして、先に部屋を出た。'),
E('fw_rule','bond','p+','a*.4+cold*.3','night=1','ab:trust3;ba:trust3','{a}「ルール、覚えてる？｜ルール、覚えているか｜ルール、覚えていますか？」{b}「本気になったら終わり、でしょ｜本気になったら終わり、だろう｜本気になったら終わり、でしょう」|{a}「好きになったら、ちゃんと言ってね。そしたら私、やめるから｜好きになったら、ちゃんと言え。そのときは私が引く｜好きになったら、ちゃんと言ってください。そうしたら私、やめますから」{b}「…わかった｜＝｜…わかりました」|{a}「他に好きな人できたら、教えて｜他に好きな人ができたら、言え｜他に好きな人ができたら、教えてください」{b}「{a}もね｜{a}もだ｜{a}さんもですよ」|{a}「キスは、しないって決めたよね｜キスは、しないと決めたはずだ｜キスは、しないと決めましたよね」{b}「…決めた｜＝｜…決めました」'),
E('fw_jealous','conflict','p+','jealous*.6+att/60','night=1','ab:ten8,att4;jea','{a}「さっき誰と話してたの｜さっき誰と話していた｜さっき誰と話していたんですか」{b}「関係ある？｜関係があるか｜関係ありますか？」{a}「…ないけど｜…ない｜…ありませんけど」|{a}は{b}が誰かと笑っているのを見て、理由のわからない苛立ちを覚えた。|{a}「別に、{b}が誰と何してても私には関係ないし｜別に、{b}が誰と何をしていても私には関係ない｜別に、{b}さんが誰と何をしていても、私には関係ありませんし」声が少し尖っていた。|{a}「…そういう関係じゃないもんね｜…そういう関係ではないからな｜…そういう関係ではありませんものね」{a}は自分に言い聞かせた。'),
E('fw_slip','romance','p','att/40+honesty*.3','night=1&aff>30','ab:att6,aff6;ba:att4','{a}は帰り際に、つい「好き｜＝｜好きです」と言いかけて、口をつぐんだ。|{a}「…今のは、なし｜…今のは、なしだ｜…今のは、なしです」{b}「何が｜＝｜何がですか」{a}「なんでもない｜＝｜なんでもないです」|{a}は{b}の手を、いつもより長く握っていた。|{a}は初めて、{b}に「おやすみ｜＝｜おやすみなさい」と言ってから帰った。'),
E('fw_upgrade','romance','p','att/35+aff/50+honesty*.3','night=1&aff>40&att>50&couple=0','couple;ab:att8,aff10,trust8;ba:att8,aff10,trust8','{a}「ルール、破っていい？｜ルール、破ってもいいか｜ルール、破っていいですか？」{b}「どれ｜どれだ｜どれですか」{a}「本気になったら終わり、ってやつ。…私、本気になった｜本気になったら終わり、というやつだ。…私は本気になった｜本気になったら終わり、ってやつです。…私、本気になりました」{b}「…遅いよ。こっちはとっくに｜…遅い。こっちはとっくにだ｜…遅いですよ。こっちはとっくにです」|{a}「体だけって言ったの、撤回させて｜体だけと言ったのは、撤回する｜体だけって言ったの、撤回させてください」{b}は黙って{a}を抱きしめた。|{a}「私、ちゃんと付き合いたい｜私は、ちゃんと付き合いたい｜私、ちゃんと付き合いたいです」{b}「…順番、めちゃくちゃだね｜…順番が、めちゃくちゃだな｜…順番、めちゃくちゃですね」二人は笑った。|{a}「私、{b}の恋人になりたい｜私は、{b}の恋人になりたい｜私、{b}の恋人になりたいです」{b}「とっくになってると思ってた｜とっくになっていると思っていた｜とっくになってると思ってました」'),
E('fw_end','conflict','p','cold*.4+ten/60+jealous*.2','night=1&aff<15','unnite;ab:ten8,att-6;ba:ten6','{a}「…もう、やめよっか｜…もう、やめにしよう｜…もう、やめましょうか」{b}「…うん｜…ああ｜…はい」理由は、どちらも訊かなかった。|{a}「私、好きな人できた。だから、終わり｜私に好きな人ができた。だから、終わりだ｜私、好きな人ができました。だから、終わりです」{b}「そっか。おめでとう｜そうか。おめでとう｜そうですか。おめでとうございます」|{a}「私、疲れちゃった。こういうの｜私は疲れた。こういうのは｜こういうの、私、疲れちゃいました」{b}「…わかった｜＝｜…わかりました」|{a}は{b}からの「今夜」の連絡に、初めて返事をしなかった。'),
E('fw_want','romance','p','impulse*.4+att/50','fwb=1&night=0','nite;ab:att5;ba:att5','{a}と{b}は目が合った。それだけで、いつもの夜がまた始まった。――|{a}「今日、行っていい？｜今日、行ってもいいか｜今日、行っていいですか？」{b}「…いいよ｜…いい｜…いいですよ」――|{a}は人目を盗んで、{b}の指に指を絡めた。それが合図だった。――')
];
var BREAK=[
E('al_crack','conflict','p+','cold*.4+ten/40+stress/120+.2','pact=1&ten>12','ab:ten6,trust-6;ba:ten5,trust-5','{a}「…本当に信じていいんだよね｜…本当に信じていいんだな｜…本当に信じていいんですよね」{b}「今さら何｜今さら何だ｜今さら何ですか」|{a}は{b}が眠っている間、荷物を自分の側に引き寄せた。|{a}「さっきの、どこ行ってたの｜さっきの、どこへ行っていた｜さっきの、どこ行ってたんですか」{b}「別に」|{a}は{b}の背中を、以前より長く見ていた。'),
E('al_break','betray','p','cold*.5+aggr*.3+ten/40+stress/150-trust/90','pact=1&ten>28','brk;ab:ten12,trust-20,aff-8;ba:ten15,trust-25,aff-10','{a}「悪いけど、ここからは私一人で行く｜悪いが、ここからは私一人で行く｜悪いですけど、ここからは私一人で行きます」{b}「…最初からそのつもりだったんでしょ｜…最初からそのつもりだったんだろう｜…最初からそのつもりだったんでしょう」|{a}「同盟は終わり。恨まないで｜同盟は終わりだ。恨むな｜同盟は終わりです。恨まないでください」{b}「恨むよ。一生｜恨む。一生だ｜恨みますよ。一生」|{a}「あなたと組んだのが私の間違いだった｜＝｜あなたと組んだのが私の間違いでした」{b}「こっちの台詞｜こっちの台詞だ｜こっちの台詞です」二人は別々の方向へ歩き出した。|{a}は{b}の分の荷物を置いて、黙って去った。|{a}「約束？そんなのしたっけ｜約束？そんなものをしたか｜約束ですか？そんなのしましたっけ」{b}は言葉を失った。'),
E('al_hold','help','p+','np*.5+trust/60','pact=1&ten>20&trust>20','ab:ten-8,trust6;ba:ten-8,trust6','{a}「疑ってごめん。…まだ、私と組んでてくれる？｜疑ってすまなかった。…まだ、私と組んでくれるか｜疑ってすみません。…まだ、私と組んでてくれますか？」{b}「当たり前でしょ｜当たり前だ｜当たり前です」|{a}「最後まで一緒って言ったの、まだ有効？｜最後まで一緒と言ったのは、まだ有効か｜最後まで一緒と言ったのは、まだ有効ですか？」{b}「有効｜有効だ｜有効です」|{a}「私、{b}を裏切るくらいなら、ここで終わっていい｜私は{b}を裏切るくらいなら、ここで終わっていい｜私、{b}さんを裏切るくらいなら、ここで終わってもかまいません」{b}「重いって｜重い｜重いですって」')
,E('al_last','betray','p','cold*.6+aggr*.4+stress/100+.3','pact=1&n<4','brk;ab:ten20,trust-25;ba:ten20,trust-25','{a}「最後の二人になったら、どうするか決めてなかったね｜最後の二人になったら、どうするか決めていなかったな｜最後の二人になったら、どうするか決めてなかったですね」{b}「…決めなくていいよ｜…決めなくていい｜…決めなくていいですよ」{a}「決めなきゃいけないんだよ｜決めなければいけないんだ｜決めなきゃいけないんですよ」|{a}「ここまでありがとう。でも、帰れるのは一人｜ここまでありがとう。だが、帰れるのは一人だ｜ここまでありがとうございました。でも、帰れるのは一人です」|{a}は{b}に背を向けたまま言った。「同盟は、ここまで｜同盟は、ここまでだ｜同盟は、ここまでです」|{a}「私、{b}とは戦いたくなかった｜私は{b}とは戦いたくなかった｜私、{b}とは戦いたくなかったです」{b}「なら、そう言い続けて｜なら、そう言い続けろ｜なら、そう言い続けてください」')
];
FWB.concat(BREAK).forEach(function(e){e.sig=true;});
var OUT=[E('sf_future_out','bond','p+','warmth*.3+np*.2+a*.2','','ab:aff3,trust3;ba:aff3,trust3','{a}「{b}は、ここを出たら私に会いに来てくれる？｜{b}は、ここを出たら私に会いに来るか｜{b}さんは、ここを出たら私に会いに来てくれますか？」{b}「…行くよ｜…行く｜…行きますよ」|{a}「ここを出たら、まず何する？｜ここを出たら、まず何をする｜ここを出たら、まず何をしますか？」{b}「…風呂｜…風呂だ｜…お風呂です」{a}「私も」')];
ALL.forEach(function(id){HK.addMini(id,id==='classroom'?TALK:TALK.concat(FWB));});
['whiteroom','br','trial','island'].forEach(function(id){HK.addMini(id,OUT);});
['br','trial','island'].forEach(function(id){HK.addMini(id,BREAK);});
})();
});
;
/* ==== js/factions.js ==== */
HK.Load.def(135,'js/factions.js',function(){
(function(){
'use strict';
var HK=window.HK;
var F=(HK.Factions={});
function R(ctx,a,b){return ctx.R(a,b);}
function names(list){return list.map(function(c){return c.name;}).join('・');}
F.REGIME={
none:'派閥なし',single:'一大グループ＋はぐれ者',two:'二大派閥',three:'三つ巴',multi:'群雄割拠',dictator:'独裁'
};
var FAC_ENV=[
{id:'facMode',label:'派閥の決め方',type:'select',fac:1,options:[
{v:'auto',label:'自動（関係と気質で生まれ、入れ替わる）'},
{v:'fix',label:'「仲間とみなす」グループで固定'},
{v:'none',label:'派閥は生まれない'}
],desc:'固定：住人タブのグループ見出しで「仲間とみなす」を入れたグループが、そのまま派閥になります（人数の設定は見ません。抜ける・鞍替え・解散は起きず、死亡・退場だけ反映。仲間のグループが無ければ自動と同じ）。無人島・クラスメイトで共通'},
{id:'facLead',label:'派閥のリーダー',type:'select',fac:1,options:[
{v:'auto',label:'自動（主導性と信頼。下克上もある）'},
{v:'CP',label:'CP（厳しさ）が最も高い人'},
{v:'NP',label:'NP（優しさ）が最も高い人'},
{v:'A',label:'A（冷静さ）が最も高い人'},
{v:'FC',label:'FC（自由さ）が最も高い人'},
{v:'AC',label:'AC（協調性）が最も高い人'}
],desc:'気質を選ぶと、派閥の中でその値が最も高い人がリーダーになり、下克上（リーダー交代）は起きません（リーダーが死亡・退場したときだけ次の人へ）。無人島・クラスメイトで共通'}
];
if(HK.GLOBAL_ENV&& !HK.GLOBAL_ENV.some(function(e){return e.id==='facMode';})){
if(HK.addTo)HK.addTo(HK.GLOBAL_ENV,FAC_ENV);else Array.prototype.push.apply(HK.GLOBAL_ENV,FAC_ENV);
}
function facMode(ctx){var v=ctx.env&&ctx.env.facMode;return v==='fix'||v==='none'?v:'auto';}
function facLead(ctx){var v=ctx.env&&ctx.env.facLead;return/^(CP|NP|A|FC|AC)$/.test(v||'')?v:'';}
F.mode=facMode;F.leadBy=facLead;
function topBy(ctx,mem,k){
var C=ctx.chars;
return mem.slice().sort(function(x,y){return((C[y].eg&&C[y].eg[k])||0)-((C[x].eg&&C[x].eg[k])||0)||C[y].tr.lead-C[x].tr.lead||x-y;})[0];
}
function leadFirst(g,L){g.leader=L;g.members=[L].concat(g.members.filter(function(m){return m!==L;}));return g;}
function comradeGroups(ctx){
if(ctx._facCG)return ctx._facCG;
var C=ctx.chars,T=HK.Ties,used={},out=[];
var co=function(a,b){return!!(T&&T.has&&T.has(ctx,a,b,'comrade'));};
for(var i=0;i<C.length;i++){
if(used[i])continue;
var g=[i];
for(var j=i+1;j<C.length;j++){
if(used[j])continue;
if(g.every(function(m){return co(C[m],C[j]);}))g.push(j);
}
if(g.length>=2){g.forEach(function(m){used[m]=1;});out.push(g);}
}
return(ctx._facCG=out);
}
function evalFixed(ctx,P,cg,prev){
var lt=facLead(ctx),here={},prevL={};
P.forEach(function(c){here[c.i]=1;});
(prev&&prev.groups||[]).forEach(function(g){if(g.gid!=null)prevL[g.gid]=g.leader;});
var groups=[];
cg.forEach(function(mem,k){
var m=mem.filter(function(x){return here[x];});
if(m.length<2)return;
var C=ctx.chars,L=lt?topBy(ctx,m,lt):m.slice().sort(function(x,y){
var sc=function(z){return C[z].tr.lead*100+(C[z].flags.leader?50:0)+(prevL[k]===z?15:0);};
return sc(y)-sc(x)||x-y;
})[0];
groups.push(leadFirst({leader:L,members:m,gid:k},L));
});
groups.sort(function(a,b){return b.members.length-a.members.length||a.gid-b.gid;});
return finish(ctx,P,groups,'「仲間とみなす」グループのまま（派閥は固定）');
}
function bond(ctx,o,L,prevLeader){
var r=R(ctx,o,L);
return r.trust*0.6+r.aff*0.4+L.tr.lead*18-r.ten*0.5+(prevLeader===L.i?10:0)+(L.flags.leader?8:0);
}
function pull(ctx,L,P){
var s=0;
P.forEach(function(o){if(o!==L)s+=Math.max(0,bond(ctx,o,L,null));});
return s;
}
F.evaluate=function(ctx){
var P=ctx.present(),th=ctx.env.faction||4,prev=ctx.fac||{of:{}};
var mode=facMode(ctx);
if(mode==='none')return{regime:'none',reason:'派閥は生まれない設定',groups:[],loners:P.map(function(c){return c.i;}),of:{}};
if(mode==='fix'){var cg=comradeGroups(ctx);if(cg.length)return evalFixed(ctx,P,cg,ctx.fac);}
if(P.length<th){
return{regime:'none',reason:'いま残っているのは'+P.length+'人。派閥に分かれるには少なすぎる（'+th+'人以上で派閥が生まれる設定）',groups:[],loners:P.map(function(c){return c.i;}),of:{}};
}
var cands=P.filter(function(c){return c.tr.lead>0.42||c.flags.leader;});
if(!cands.length){
return{regime:'none',reason:'人を引っぱる気質（CP・A高、AC低）の持ち主がいない。輪はできても派閥にはならない',groups:[],loners:P.map(function(c){return c.i;}),of:{}};
}
var pw={};
cands.forEach(function(L){pw[L.i]=pull(ctx,L,P)*(0.6+L.tr.lead);});
var join={};
P.forEach(function(o){
var best=null,bv=P.length>12?16:24;
cands.forEach(function(L){
if(L===o)return;
var v=bond(ctx,o,L,prev.of[o.i]);
if(cands.indexOf(o)>=0){if(pw[L.i]<=pw[o.i]*1.2||v+o.tr.np*14+o.tr.ac*10-o.tr.cp*10<36)return;}
if(v>bv){bv=v;best=L;}
});
if(best)join[o.i]=best.i;
});
function root(i){var seen={};while(join[i]!=null&& !seen[i]){seen[i]=1;i=join[i];}return i;}
var groupsBy={};
P.forEach(function(o){
if(join[o.i]==null)return;
var r=root(o.i);
(groupsBy[r]=groupsBy[r]||[]).push(o.i);
});
var groups=Object.keys(groupsBy).map(function(k){return{leader: +k,members:[+k].concat(groupsBy[k].filter(function(x){return x!== +k;}))};})
.filter(function(g){return g.members.length>=2;})
.sort(function(a,b){return b.members.length-a.members.length;});
var maxG=P.length>=9?3:P.length>=5?3:2;
while(groups.length>maxG){
var sm=groups.pop();
sm.members.forEach(function(m){
var o=ctx.chars[m],best=null,bv=30;
groups.forEach(function(g){var v=bond(ctx,o,ctx.chars[g.leader],prev.of[m])+(m===sm.leader?o.tr.np*10+o.tr.ac*8-o.tr.cp*10:0);if(v>bv){bv=v;best=g;}});
if(best)best.members.push(m);
});
groups.sort(function(a,b){return b.members.length-a.members.length;});
}
if(groups.length===1&&P.length>=5){
var G0=groups[0],L0=ctx.chars[G0.leader];
var rv=cands.filter(function(c){return c!==L0&&pw[c.i]>=pw[L0.i]*0.4;}).sort(function(x,y){return(R(ctx,y,L0).ten-R(ctx,y,L0).trust+pw[y.i]/20)-(R(ctx,x,L0).ten-R(ctx,x,L0).trust+pw[x.i]/20);})[0];
if(rv&&R(ctx,rv,L0).trust<35){
var side=P.filter(function(o){return o!==L0&&o!==rv&&bond(ctx,o,rv,prev.of[o.i])>Math.max(20,bond(ctx,o,L0,prev.of[o.i])-4);});
if(side.length){
G0.members=G0.members.filter(function(m){return m!==rv.i&&side.indexOf(ctx.chars[m])<0;});
groups.push({leader:rv.i,members:[rv.i].concat(side.map(function(o){return o.i;}))});
groups=groups.filter(function(g){return g.members.length>=2;}).sort(function(a,b){return b.members.length-a.members.length;});
}
}
}
var lt=facLead(ctx);
if(lt)groups.forEach(function(g){leadFirst(g,topBy(ctx,g.members,lt));});
return finish(ctx,P,groups,'');
};
function finish(ctx,P,groups,fixReason){
groups.forEach(function(g){g.subs=g.members.filter(function(m){return m!==g.leader&&ctx.chars[m].tr.lead>0.5;});});
var of={};
groups.forEach(function(g){g.members.forEach(function(m){of[m]=g.leader;});});
var loners=P.filter(function(c){return of[c.i]==null;}).map(function(c){return c.i;});
var regime,reason='';
if(!groups.length){regime='none';reason='中心になれる人物はいたが、まだ誰もついていくほど信頼していない';}
else if(groups.length===1){
var L=ctx.chars[groups[0].leader];
if(groups[0].members.length>=Math.ceil(P.length*0.7)&&L.tr.cp>0.6&&L.tr.np<0.6){
regime='dictator';reason=L.name+'のCP（'+Math.round(L.eg.CP)+'）と主導性に、ほぼ全員が従った';
}else{regime='single';reason=L.name+'を中心に一つの輪ができた';}
}else regime=groups.length===2?'two':groups.length===3?'three':'multi';
if(fixReason)reason=groups.length?fixReason+(reason?'。'+reason:''):P.length<2?'いま残っているのは'+P.length+'人':'「仲間とみなす」グループで、二人以上残っているものがない';
return{regime:regime,reason:reason,groups:groups,loners:loners,of:of};
}
function sameKey(f){
return f.regime+'|'+f.groups.map(function(g){return g.leader+':'+g.members.slice().sort().join(',');}).join('/');
}
F.step=function(ctx,s,n){
if(s===0)return;
var f=F.evaluate(ctx),prev=ctx.fac;
var C=ctx.chars;
f.lim=CAP;
ctx.facHist=ctx.facHist||[];
var changed= !prev||sameKey(prev)!==sameKey(f);
ctx._facQ=[];
if(changed){if(f.groups.some(function(g){return g.gid!=null;})||(prev&&prev.groups.some(function(g){return g.gid!=null;})))narrateFixed(ctx,prev,f);else narrate(ctx,prev,f);}
ctx.fac=f;
if(changed||s===n-1)ctx.facHist.push({step:s,label:ctx.label,regime:f.regime,reason:f.reason,groups:JSON.parse(JSON.stringify(f.groups)),loners:f.loners.slice()});
ctx.k=1;ctx._mag=0;ctx._touched={};
f.groups.forEach(function(g){
g.members.forEach(function(a){g.members.forEach(function(b){if(a!==b)ctx.mod(C[a],C[b],{trust:2,aff:1});});});
});
for(var i=0;i<f.groups.length;i++)for(var j=i+1;j<f.groups.length;j++){
var A=C[f.groups[i].leader],B=C[f.groups[j].leader];
ctx.mod2(A,B,{ten:6},{ten:6});
f.groups[i].members.forEach(function(m){if(m!==A.i)ctx.mod(C[m],B,{ten:2});});
f.groups[j].members.forEach(function(m){if(m!==B.i)ctx.mod(C[m],A,{ten:2});});
}
ctx._ring=facMode(ctx)==='none'?ring(ctx):null;
if(f.regime==='dictator'){
f.loners.forEach(function(i){
var c=C[i];
c.stress=HK.clamp(c.stress+8,0,100);
if(ctx.scen.id==='island')c.hp-=3;
});
}
if(f.groups.length>=2&&ctx.rng()<0.45)clash(ctx,f);
if(f.groups.length&&ctx.rng()<0.28)tide(ctx,f);
if(f.groups.length&& !facLead(ctx))coup(ctx,f);
if(f.regime==='dictator'&&f.loners.length&&ctx.rng()<0.55)purge(ctx,f);
flushQ(ctx);
};
var RING={pick:2,min:4,cap:0.4};
function ring(ctx){
var P=ctx.present(),C=ctx.chars,edges=[];
if(P.length<3)return null;
var close=function(a,b){var r=R(ctx,a,b);return r.trust*0.6+r.aff*0.4-r.ten*0.5;};
P.forEach(function(a){
P.filter(function(b){return b!==a;}).map(function(b){return{a:a.i,b:b.i,v:close(a,b)+close(b,a)*0.5};})
.filter(function(x){return x.v>RING.min;})
.sort(function(x,y){return y.v-x.v||x.b-y.b;}).slice(0,RING.pick).forEach(function(x){edges.push(x);});
});
edges.sort(function(x,y){return y.v-x.v||x.a-y.a||x.b-y.b;});
var top={},size={},cap=Math.max(3,Math.round(P.length*RING.cap));
P.forEach(function(c){top[c.i]=c.i;size[c.i]=1;});
var find=function(i){while(top[i]!==i)i=top[i]=top[top[i]];return i;};
edges.forEach(function(x){
var p=find(x.a),q=find(x.b);
if(p===q||size[p]+size[q]>cap)return;
if(q<p){var t=p;p=q;q=t;}
top[q]=p;size[p]+=size[q];
});
var of={},mem={};
P.forEach(function(c){var r=find(c.i);if(size[r]<2)return;of[c.i]=r;(mem[r]=mem[r]||[]).push(c.i);});
Object.keys(mem).forEach(function(k){
var m=mem[k];
m.forEach(function(a){m.forEach(function(b){if(a!==b)ctx.mod(C[a],C[b],{trust:2,aff:1});});});
});
return of;
}
F.ring=ring;F.RING=RING;
function tag(e,k){if(e&&typeof e==='object')try{Object.defineProperty(e,'fac',{value:k,enumerable:false,configurable:true});}catch(x){}return e;}
var CAP=3;
var PRI={form:0,dict:1,end:1,lead:1,clash:2,coup:2,purge:2,swap:3,tide:4,sub:5,scatter:6,lone:7};
var GAP={form:5,clash:5,dict:0,end:0,lead:0};
F.CAP=CAP;F.PRI=PRI;F.GAP=GAP;
function gapOf(k){return GAP[k]!=null?GAP[k]:3;}
function okKind(ctx,k){var L=(ctx._facLast||{})[k];return L==null||gapOf(k)===0||ctx.stepIndex-L>gapOf(k);}
function cand(ctx,k,run,opt){
var Q=ctx._facQ;
if(!Q){run();return-1;}
Q.push({k:k,p:PRI[k]!=null?PRI[k]:9,i:Q.length,run:run,parent:opt&&opt.parent,silent:opt&&opt.silent});
return Q.length-1;
}
function flushQ(ctx){
var Q=ctx._facQ||[],last=ctx._facLast=ctx._facLast||{},s=ctx.stepIndex,pick={},n=0;
ctx._facQ=null;
Q.filter(function(x){return okKind(ctx,x.k);}).sort(function(x,y){return x.p-y.p||x.i-y.i;}).forEach(function(x){
if(n>=CAP||(x.parent!=null&& !pick[x.parent]))return;
pick[x.i]=1;n++;
});
Q.forEach(function(x){
if(pick[x.i]){if(x.run())last[x.k]=s;}
else if(x.silent){ctx.k=1;ctx._mag=0;ctx._touched={};x.silent();}
});
}
var PLACE={classroom:{pl:'クラス',spot:'教室'},island:{pl:'島',spot:'浜'}};
function placeOf(ctx){return PLACE[ctx.scen.id]||{pl:ctx.place||'ここ',spot:ctx.place||'ここ'};}
function fill(t,o){return t.replace(/\{([a-z]+)\}/g,function(m,k){return o[k]!=null?o[k]:m;});}
function pickT(ctx,T){return ctx.pick((T._||[]).concat(T[ctx.scen.id]||[]));}
function nameList(list){return list.length<=3?names(list):names(list.slice(0,2))+'ほか'+(list.length-2)+'人';}
var T_FORM={
_:['{a}を中心に、{m}がまとまり始めた。{pl}の中に「{a}派」ができた。',
'{m}は、何かあると{a}の顔を見るようになった。誰が言い出したのか、{pl}ではそれを「{a}派」と呼んだ。',
'{a}が「＠{a}＠一緒にやろう｜＝｜一緒にやりましょう」と声をかけると、{m}が頷いた。{pl}に「{a}派」ができた瞬間だった。'],
classroom:['休み時間になると、{m}が{a}の席の周りに集まるようになった。いつの間にか、{spot}では「{a}派」と呼ばれていた。'],
island:['焚き火を囲むとき、{m}は自然と{a}の隣に座るようになった。{spot}の一角に「{a}派」ができた。']
};
var WHY_FORM=['信頼・好意と{a}の主導性（{n}）','{a}の主導性（{n}）に、信頼を寄せる人が集まった','{a}への信頼・好意が、ほかの誰よりも高い人たちが集まった（{a}の主導性 {n}）'];
var T_SCATTER={
_:['{a}派は、いつの間にか散り散りになっていた。',
'{a}の周りに集まる顔は、日に日に減っていった。気づけば、{a}派と呼べるものは残っていなかった。'],
classroom:['{a}が声をかけても、もう誰も席を立たなかった。{a}派は、{spot}から静かに消えた。'],
island:['{a}の焚き火を囲む者は、もういなかった。{a}派は、潮が引くように{spot}から消えた。']
};
var T_LONE={
_:['{m}は、どの輪にも属さなくなった。','{m}は、どの派閥の集まりにも顔を出さなくなった。'],
classroom:['{m}は、休み時間を{solo}過ごすようになった。どの派閥からも、もう声はかからない。'],
island:['{m}は、焚き火から少し離れたところで、{solo}眠るようになった。どの派閥にも、もう入っていない。']
};
var T_SWAP={
_:['{a}は{b}のグループを抜けて、{c}の側についた。',
'{a}は、{b}派の集まりに顔を出さなくなった。次に見かけたとき、{a}は{c}の隣にいた。',
'{a}「悪いけど、これからは{c}につく｜悪いが、これからは{c}につく｜すみません、これからは{c}の側につきます」――{b}は何も言わずに背を向けた。'],
classroom:['{a}は昼休みの席を、{b}たちの輪から{c}たちの輪へ移した。それだけで、{pl}中に鞍替えの噂が広まった。'],
island:['{a}は寝床を、{b}たちの焚き火のそばから{c}たちの焚き火のそばへ移した。誰も口には出さなかったが、意味は皆わかっていた。']
};
var T_SWAP_GONE=['{a}は、{b}のいなくなったグループを離れて{c}の側についた。','{b}のいない輪に、{a}はもう戻らなかった。次に見かけたとき、{a}は{c}の隣にいた。'];
var T_FOLD={
_:['{a}は自分の派閥をたたみ、{c}の側についた。',
'{a}は「私の負け。これからは{c}についていく｜私の負けだ。これからは{c}についていく｜私の負けです。これからは{c}についていきます」と言って、自分の派閥をたたんだ。',
'{a}の派閥は、そのまま{c}派に飲み込まれた。{a}自身も、{c}の隣に席を移した。']
};
var T_LEAD={
_:['{b}派の皆が相談に行く相手は、いつの間にか{a}に変わっていた。派閥は、そのまま「{a}派」と呼ばれるようになった。',
'{b}が一歩引いた形で、{a}が派閥の先頭に立つようになった。{b}は黙ってそれを受け入れた。',
'{a}が{b}に代わって、派閥をまとめるようになった。「＠{a}＠これからは私が仕切る｜＝｜これからは私が仕切ります」――誰も反対しなかった。']
};
var T_LEAD_GONE={_:['{b}がいなくなり、{a}が代わって皆をまとめることになった。','{b}のいない派閥を、{a}が引き継いだ。','{b}が抜けた穴を埋めるように、{a}が派閥の先頭に立った。']};
var T_CLASH={
_:['{t}を巡って、{a}派と{b}派が真っ二つに割れた。',
'{t}のことで、{a}と{b}が{spot}の真ん中で言い合いになった。どちらの派閥の者も、黙ってはいなかった。',
'{t}の話し合いは、{a}派と{b}派の意地の張り合いになった。結局、その日は何も決まらなかった。',
'{a}が「＠{a}＠それは違う｜＝｜それは違います」と言えば、{b}も一歩も引かなかった。{t}を巡って、{a}派と{b}派の溝が深まった。']
};
var T_SUB={
proud:[
'{a}は「仕切るのは{b}でいい。……今はね｜仕切るのは{b}でいい。……今はな｜仕切るのは{b}で構いません。……今は、ですが」と言って腕を組み、{b}派の参謀役に収まった。',
'{a}は文句を言いながらも、{b}の右腕として面倒な段取りを片っ端から片づけていった。「＠{a}＠これは貸しだからね｜これは貸しだからな｜これは貸しですからね」',
'{a}は「トップは{b}に譲る。二番目で十分｜トップは{b}に譲る。二番目で十分だ｜トップは{b}に譲ります。二番目で十分です」と言い捨てて、二番手の席にどかりと座った。'],
stern:[
'{a}は「{b}が決めて。細かい詰めは私がやる｜{b}が決めろ。細かい詰めは私がやる｜{b}が決めてください。細かい詰めは私がやります」と言い、{b}派の参謀役を引き受けた。',
'{a}は{b}の右腕として、決まりごとの抜けを一つずつ埋めていった。誰に頼まれたわけでもなかった。',
'{a}は{b}の一歩後ろに立つことを選んだ。「＠{a}＠上に立つ者は一人でいい｜＝｜上に立つ者は一人でいいのです」'],
tsun:[
'{a}は「べ、別に{b}のためじゃないから。放っておけないだけ｜別に{b}のためではない。放っておけないだけだ｜別に{b}のためではありません。放っておけないだけです」と言いながら、{b}派の作戦を練るようになった。',
'{a}はぶつぶつ言いながらも、{b}が言い出したことの後始末を全部引き受けた。気づけば、誰が見ても{b}の右腕だった。',
'{a}は「二番手でいいなんて、言ってないから｜二番手でいいとは言っていない｜二番手でいいなんて、言っていませんから」と言いつつ、{b}の隣の席から動かなかった。'],
gentle:[
'{a}は「{b}が前に出るなら、私は後ろで考えるね｜{b}が前に出るなら、私は後ろで考えよう｜{b}が前に出るなら、私は後ろで考えますね」と微笑み、{b}派の参謀役に収まった。',
'{a}は{b}の右腕として、皆の話を聞いて回った。{b}のところに届く頃には、揉め事はたいてい小さくなっていた。',
'{a}は、{b}の隣で二番手の席に座った。{b}が厳しく言ったあとには、いつも{a}がそっと声をかけに行った。'],
devoted:[
'{a}は{b}のために、夜遅くまで次の手を考えた。「＠{a}＠{b}の役に立てるなら、それでいい｜＝｜{b}の役に立てるなら、それでいいんです」',
'{a}は「細かいことは全部、私に任せて｜細かいことは全部、私に任せろ｜細かいことは全部、私に任せてください」と言い、{b}の右腕として走り回った。',
'{a}は{b}の一歩後ろを自分の場所と決めて、二番手の席に座った。{b}に頼られるたび、嬉しそうに頷いた。'],
cool:[
'{a}は「{b}が旗を振って、私が計算する。それがいちばん効率がいい｜{b}が旗を振り、私が計算する。それがいちばん効率がいい｜{b}が旗を振って、私が計算します。それがいちばん効率がいいです」と言い、{b}派の参謀役に収まった。',
'{a}は{b}の右腕として、誰が何をするかを手早く割り振った。{b}が口で言い、{a}が段取りに落とす。役割は自然に分かれた。',
'{a}は人数を数えて、{b}につくのが得策だと判断した。「＠{a}＠トップは{b}でいい。私は二番手で十分｜トップは{b}でいい。私は二番手で十分だ｜トップは{b}でいいと判断します。私は二番手で十分です」'],
free:[
'{a}は「作戦考えるの、けっこう楽しいかも｜作戦を考えるのは、なかなか楽しい｜作戦を考えるの、けっこう楽しいです」と言い出し、いつの間にか{b}派の参謀役になっていた。',
'{a}は{b}の右腕として、思いつきを次々に持ち込んだ。半分は使えなかったが、残りの半分で{b}派は何度も助けられた。',
'{a}は「てっぺんは{b}にあげる。私は二番目で好きにやる｜てっぺんは{b}に譲る。私は二番目で好きにやる｜てっぺんは{b}に譲ります。私は二番目で好きにやります」と笑って、二番手の席に座った。'],
shy:[
'{a}は、{b}にだけ小さな声で考えを伝えるようになった。{b}がそれを皆の前で言うと、たいていうまくいった。{a}は{b}派の、目立たない参謀役になった。',
'{a}は「わ、私は、{b}のそばで……手伝えたら、それで｜私は、{b}のそばで……手伝えたら、それで｜わ、私は、{b}のそばで……お手伝いできたら、それで」と言い、{b}の右腕として細かな仕事を引き受けた。',
'{a}は、皆に押し出されるようにして二番手の席に座った。「＠{a}＠わ、私なんかで、いいのかな……｜私などで、いいのか……｜わ、私なんかで、いいんでしょうか……」'],
polite:[
'{a}は「{b}が皆の前に立つなら、私は裏で支える。それが筋だと思う｜{b}が皆の前に立つなら、私は裏で支える。それが筋だろう｜{b}が皆の前に立つなら、私は裏でお支えします。それが筋だと思います」と言い、{b}派の参謀役に収まった。',
'{a}は{b}の右腕として、頼まれた用事を一つ残らず丁寧に片づけた。{b}派の誰もが、困ったときは{a}を頼るようになった。',
'{a}は「トップは{b}がいいと思う｜＝｜トップは{b}がいいと思います」と言い、二番手の席に座った。']
};
var WHY_SUB=['{a}も主導性はある（{n}）が、{b}の求心力が上回った','{a}の主導性（{n}）より、{b}を推す声のほうが多かった','{b}の周りに集まる顔ぶれを見て、{a}（主導性 {n}）は支える側に回った'];
function subNote(c){
var t=c.tr;
if(t.np+t.ac>1)return'NP・ACが高く、補佐に回るのが苦にならない';
if(t.a>0.6)return'Aが高く、自分が立つより得だと見た';
if(t.cp>0.6)return'CPは高いが、今は機を待つことにした';
if(t.fc>0.6)return'FCが高く、肩書きより動きやすさを取った';
return'';
}
function narrateFixed(ctx,prev,f){
var C=ctx.chars,W=placeOf(ctx),place=W.pl;
var pg={};
(prev?prev.groups:[]).forEach(function(g){if(g.gid!=null)pg[g.gid]=g;});
f.groups.forEach(function(g){
var L=C[g.leader],was=pg[g.gid];
if(!was){
var mem=g.members.filter(function(m){return m!==g.leader;}).map(function(m){return C[m];});
cand(ctx,'form',function(){
return tag(ctx.act2({actors:[L].concat(mem),cat:'bond',mag:12,text:L.name+'を中心に、'+names(mem)+'がひとつにまとまった。'+place+'の中で、仲間どうしの「'+L.name+'派」として動いていく。',why:'「仲間とみなす」グループ（派閥は固定）。リーダーは'+(facLead(ctx)?facLead(ctx)+'が最も高い'+L.name:L.name+'の主導性（'+Math.round(L.tr.lead*100)+'）')}),'form');
});
}else if(was.leader!==g.leader){
var O=C[was.leader];
if(O.alive&& !O.out&&g.members.indexOf(O.i)>=0)return;
cand(ctx,'lead',function(){
return tag(ctx.act2({actors:[L],cat:'bond',mag:10,text:O.name+'がいなくなり、'+L.name+'が代わって仲間たちをまとめることになった。',why:'派閥は固定。リーダーが'+(O.alive?'退場した':'亡くなった')}),'lead');
});
}
});
Object.keys(pg).forEach(function(k){
if(f.groups.some(function(g){return g.gid=== +k;}))return;
var g=pg[k],rest=g.members.filter(function(m){return C[m].alive&& !C[m].out;});
if(!rest.length)return;
cand(ctx,'scatter',function(){
return tag(ctx.act2({actors:rest.map(function(m){return C[m];}),cat:'solo',text:C[g.leader].name+'派は、残ったのが'+names(rest.map(function(m){return C[m];}))+'だけになり、派閥の形を保てなくなった。',why:'派閥は固定。仲間が死亡・退場で減った'}),'scatter');
});
});
if(f.regime==='dictator'&&(!prev||prev.regime!=='dictator')){
var D=C[f.groups[0].leader];
cand(ctx,'dict',function(){return tag(ctx.act2({actors:[D],cat:'conflict',mag:20,text:D.name+'の言葉が、そのまま'+place+'の決まりになった。異を唱える者はほとんどいない。',why:f.reason}),'dict');});
}
}
function carry(prev,f){
var map={},used={};
if(!prev)return map;
f.groups.forEach(function(g){prev.groups.forEach(function(x){if(x.leader===g.leader){map[g.leader]=x.leader;used[x.leader]=1;}});});
f.groups.forEach(function(g){
if(map[g.leader]!=null)return;
var best=null,bv=0;
prev.groups.forEach(function(x){
if(used[x.leader]||x.members.indexOf(g.leader)<0)return;
var same=x.members.filter(function(m){return g.members.indexOf(m)>=0;}).length;
if(same*2>=Math.max(x.members.length,g.members.length)&&same>bv){bv=same;best=x;}
});
if(best){map[g.leader]=best.leader;used[best.leader]=1;}
});
return map;
}
function narrate(ctx,prev,f){
var C=ctx.chars,W=placeOf(ctx),place=W.pl;
var pof=prev?prev.of:{},map=carry(prev,f),back={};
Object.keys(map).forEach(function(k){back[map[k]]= +k;});
f.groups.forEach(function(g){
var L=C[g.leader];
if(map[g.leader]!=null){
if(map[g.leader]===g.leader)return;
var O=C[map[g.leader]];
if(L.flags.coupOver===O.i){delete L.flags.coupOver;return;}
var here=O.alive&& !O.out;
cand(ctx,'lead',function(){
return tag(ctx.act2({actors:here?[L,O]:[L],cat:'bond',mag:10,text:fill(pickT(ctx,here?T_LEAD:T_LEAD_GONE),{a:L.name,b:O.name}),
why:here?L.name+'への信頼が、'+O.name+'への信頼を上回った（'+L.name+'の主導性 '+Math.round(L.tr.lead*100)+'）':O.name+'が'+(O.alive?'退場した':'亡くなった')}),'lead');
});
return;
}
var mem=g.members.filter(function(m){return m!==g.leader;}).map(function(m){return C[m];});
cand(ctx,'form',function(){
var o={a:L.name,m:names(mem),pl:W.pl,spot:W.spot,n:Math.round(L.tr.lead*100)};
return tag(ctx.act2({actors:[L].concat(mem),cat:'bond',mag:12,text:fill(pickT(ctx,T_FORM),o),why:fill(ctx.pick(WHY_FORM),o)}),'form');
});
});
var subs=[];
f.groups.forEach(function(g){(g.subs||[]).forEach(function(m){if(C[m].flags.subOf!==g.leader)subs.push({m:m,g:g});});});
if(subs.length){
subs.sort(function(x,y){return C[y.m].tr.lead-C[x.m].tr.lead||x.m-y.m;});
var top=subs[0],rest=subs.filter(function(x){return x!==top&&x.g===top.g;}).map(function(x){return C[x.m];});
cand(ctx,'sub',function(){
var c=C[top.m],L=C[top.g.leader],per=HK.personaOf?HK.personaOf(c):'gentle';
c.flags.subOf=L.i;
rest.forEach(function(x){x.flags.subOf=L.i;});
var o={a:c.name,b:L.name,n:Math.round(c.tr.lead*100)},note=subNote(c);
return tag(ctx.act2({actors:[c,L],cat:'bond',mag:8,text:fill(ctx.pick(T_SUB[per]||T_SUB.gentle),o),
why:fill(ctx.pick(WHY_SUB),o)+(note?'。'+note:'')+(rest.length?'。ほかに'+nameList(rest)+'も、'+L.name+'を支える側に回った':'')}),'sub');
});
}
var sw=[];
Object.keys(f.of).forEach(function(k){
var i= +k,nowL=f.of[i],oldL=pof[i];
if(oldL==null||oldL===nowL||i===nowL||map[nowL]===oldL)return;
sw.push({c:C[i],o:C[oldL],n:C[nowL]});
});
if(sw.length){
sw.sort(function(x,y){return R(ctx,y.c,y.n).trust-R(ctx,x.c,x.n).trust||x.c.i-y.c.i;});
var hurt=function(){sw.forEach(function(x){if(x.o!==x.c)ctx.mod(x.o,x.c,{ten:15,trust: -15});});};
cand(ctx,'swap',function(){
var m=sw[0],more=sw.slice(1).map(function(x){return x.c;});
var oGone= !m.o.alive||m.o.out;
var t=m.o===m.c?fill(pickT(ctx,T_FOLD),{a:m.c.name,c:m.n.name}):oGone?fill(ctx.pick(T_SWAP_GONE),{a:m.c.name,b:m.o.name,c:m.n.name}):fill(pickT(ctx,T_SWAP),{a:m.c.name,b:m.o.name,c:m.n.name,pl:W.pl,spot:W.spot});
return tag(ctx.act2({actors:[m.c,m.o,m.n].filter(function(x,j,A){return A.indexOf(x)===j&&(x!==m.o|| !oGone);}).concat(more),cat:'betray',mag:15,fx:hurt,
text:t+(more.length?'同じ頃、'+nameList(more)+'も所属を変えた。':''),why:m.c.name+'の'+m.n.name+'への信頼（'+Math.round(R(ctx,m.c,m.n).trust)+'）が上回った'}),'swap');
},{silent:hurt});
}
var gone={};
if(prev)prev.groups.forEach(function(g){
var Lg=C[g.leader];
if(back[g.leader]!=null|| !Lg.alive||Lg.out||f.of[g.leader]!=null)return;
gone[g.leader]=1;
cand(ctx,'scatter',function(){
var mood=g.members.length>=4?'大きかった輪が、求心力を失った':'求心力の低下';
return tag(ctx.act2({actors:[Lg],cat:'solo',text:fill(pickT(ctx,T_SCATTER),{a:Lg.name,pl:W.pl,spot:W.spot}),why:mood}),'scatter');
});
});
var lone=f.loners.filter(function(i){return pof[i]!=null&&C[i].alive&& !gone[i];}).map(function(i){return C[i];});
if(lone.length)cand(ctx,'lone',function(){
var cold=lone.every(function(c){return c.tr.cold>0.55;});
return tag(ctx.act2({actors:lone,cat:'solo',text:fill(pickT(ctx,T_LONE),{m:names(lone),solo:lone.length>1?'それぞれひとりで':'ひとりで'}),
why:'誰に対しても信頼が足りなかった／'+(cold?'ドライさ':'居場所のなさ')}),'lone');
});
if(f.regime==='dictator'&&(!prev||prev.regime!=='dictator')){
var D=C[f.groups[0].leader];
cand(ctx,'dict',function(){return tag(ctx.act2({actors:[D],cat:'conflict',mag:20,text:D.name+'の言葉が、そのまま'+place+'の決まりになった。異を唱える者はほとんどいない。',why:f.reason}),'dict');});
}
if(prev&&prev.regime==='dictator'&&f.regime!=='dictator'){
cand(ctx,'end',function(){return tag(ctx.say({text:C[prev.groups[0].leader].name+'の支配が崩れた。'}),'end');});
}
if(f.regime==='none'&&prev&&prev.groups.length)cand(ctx,'end',function(){return tag(ctx.say({text:'派閥はなくなった。'+f.reason+'。'}),'end');});
}
function clash(ctx,f){
if(!okKind(ctx,'clash'))return;
var C=ctx.chars,A=C[f.groups[0].leader],B=C[f.groups[1].leader],W=placeOf(ctx);
var p=cand(ctx,'clash',function(){
var topic=ctx.rng.pick(ctx.scen.id==='island'?['水場と寝床の割り当て','火の番の順番','食料の分け方']:['席替えのやり方','修学旅行の班決め','クラスTシャツのデザイン','放課後の掃除当番']);
return tag(ctx.act2({actors:[A,B],cat:'conflict',fx:function(){ctx.mod2(A,B,{ten:12,aff: -6},{ten:12,aff: -6});},
text:fill(pickT(ctx,T_CLASH),{t:topic,a:A.name,b:B.name,spot:W.spot}),why:'派閥の対立。双方の主導性'}),'clash');
});
var mid=f.groups[1].members.concat(f.groups[0].members).map(function(i){return C[i];}).filter(function(c){return c!==A&&c!==B&&c.tr.np>0.6&&c.tr.ac>0.5;})[0];
if(mid)cand(ctx,'clash',function(){
return tag(ctx.act2({actors:[mid],cat:'help',fx:function(){ctx.mod(A,mid,{trust:4});ctx.mod(B,mid,{trust:4});ctx.stress(mid,10);},
text:mid.name+'が両方の顔を立てて、なんとか話をまとめた。本人はその夜、ひどく疲れた顔をしていた。',why:mid.name+'のNP・AC（板挟み役）'}),'clash');
},{parent:p});
}
var TIDE={
classroom:{up:['文化祭の出し物で大成功を収め','体育祭のリレーで逆転勝ちを決め','定期テストで学年上位に入り','先生に一目置かれる発言をして'],down:['文化祭の準備でメンバーと揉め','修学旅行の班決めで仲間を一人置き去りにし','陰口を言っていたことが広まり','テスト期間に誰の相談にも乗らず']},
island:{up:['大物の魚を仕留めて皆に振る舞い','嵐の夜に的確な指示を出し','真水の湧く場所を見つけ'],down:['食料の分配で自分の取り分を多くし','狩りの失敗を人のせいにし','嵐の夜に判断を誤り']},
_:{up:['皆の前で頼れるところを見せ','揉め事をうまく収め'],down:['大事な場面で判断を誤り','仲間の信頼を裏切るような真似をし']}
};
function tide(ctx,f){
if(!okKind(ctx,'tide'))return;
var C=ctx.chars,T=TIDE[ctx.scen.id]||TIDE._;
var g=ctx.rng.pick(f.groups),L=C[g.leader],up=ctx.rng()<0.5+(L.tr.np*0.2+L.tr.a*0.15-L.tr.cold*0.15);
var all=ctx.present();
cand(ctx,'tide',function(){
return tag(ctx.act2({actors:[L],cat:up?'bond':'conflict',mag:12,fx:function(){
all.forEach(function(o){if(o!==L)ctx.mod(o,L,up?{trust:g.members.indexOf(o.i)>=0?6:9,aff:4}:{trust: -12,aff: -6,ten:6});});
},text:L.name+'は'+ctx.pick(up?T.up:T.down)+'、'+(up?L.name+'派の勢いが増した。様子見していた者たちの目も、'+L.name+'に向き始めた。':L.name+'派の求心力に陰りが見えた。'),why:'月日の流れで変わる力関係（'+L.name+'の'+(up?'NP・A：人を惹きつけた':'ドライさ・判断ミス')+'）'}),'tide');
});
}
function coup(ctx,f){
if(!okKind(ctx,'coup'))return;
var C=ctx.chars;
f.groups.forEach(function(g){
var L=C[g.leader];
(g.subs||[]).forEach(function(m){
var c=C[m];if(!c.alive||c.out||g.done)return;
var mine=g.members.filter(function(x){return x!==m&&x!==g.leader;});
var sL=mine.reduce(function(t,x){return t+R(ctx,C[x],L).trust;},0),sC=mine.reduce(function(t,x){return t+R(ctx,C[x],c).trust;},0);
if(mine.length&&sC>sL+25&&c.tr.cp+c.tr.lead>1&&ctx.rng()<0.5){
g.done=true;
cand(ctx,'coup',function(){
mine.forEach(function(x){ctx.mod(C[x],c,{trust:10});ctx.mod(C[x],L,{trust: -10});});
ctx.mod2(L,c,{ten:25,trust: -25},{ten:10});
c.flags.leader=true;L.flags.leader=false;c.flags.coupOver=L.i;
return tag(ctx.act2({actors:[c,L],cat:'betray',mag:25,text:'気づけば、'+L.name+'派の皆が相談に行く相手は'+c.name+'になっていた。'+c.name+'は'+L.name+'に代わって、派閥の先頭に立った。',why:'補佐の'+c.name+'への信頼（'+Math.round(sC/mine.length)+'）が、'+L.name+'への信頼（'+Math.round(sL/mine.length)+'）を上回った。'+c.name+'のCP・主導性'}),'coup');
});
}
});
});
}
function purge(ctx,f){
if(!okKind(ctx,'purge'))return;
var C=ctx.chars,D=C[f.groups[0].leader];
var t=f.loners.map(function(i){return C[i];}).sort(function(a,b){return(R(ctx,b,D).ten+b.tr.lead*30)-(R(ctx,a,D).ten+a.tr.lead*30);})[0];
if(!t)return;
var follower=f.groups[0].members.map(function(i){return C[i];}).filter(function(c){return c!==D;});
var doubter=follower.filter(function(c){return c.tr.np>0.6&&R(ctx,c,t).aff>15;})[0];
var island=ctx.scen.id==='island';
var p=cand(ctx,'purge',function(){
return tag(ctx.act2({actors:[D,t],cat:'conflict',mag:15,fx:function(){ctx.mod(t,D,{ten:18,aff: -10});ctx.stress(t,15);if(island)t.hp-=6;follower.forEach(function(c){ctx.mod(c,t,{aff: -4});});},
text:island?D.name+'は、従わない'+t.name+'の配給を減らすと決めた。誰も反対しなかった。':D.name+'のひと言で、クラスの誰も'+t.name+'に話しかけなくなった。',
why:D.name+'の独裁。'+t.name+'は輪の外にいた'}),'purge');
});
if(doubter)cand(ctx,'purge',function(){
return tag(ctx.act2({actors:[doubter,t,D],cat:'help',fx:function(){ctx.mod(t,doubter,{aff:14,trust:14});ctx.mod(D,doubter,{ten:8});},
text:doubter.name+'だけが、こっそり'+t.name+'に'+(island?'自分の分の魚を半分':'ノートを貸していた')+'。',why:doubter.name+'のNP。'+D.name+'派にいながら'}),'purge');
},{parent:p});
}
var KIND_RE=[['form',/を中心に、.*がまとまり始めた。|がひとつにまとまった。.*として動いていく/],['sub',/参謀役に収まった|の右腕として、細かな段取り|二番手の席に座った/],['swap',/のグループを抜けて、.*の側についた/],
['scatter',/派は、いつの間にか散り散りになっていた|派閥の形を保てなくなった/],['lone',/は、どの輪にも属さなくなった/],['lead',/が代わって仲間たちをまとめる/],
['clash',/派が真っ二つに割れた|が両方の顔を立てて/],['tide',/派の勢いが増した|派の求心力に陰りが見えた/]];
var FAM={form:'chg',sub:'chg',swap:'chg',scatter:'chg',lone:'chg',lead:'chg',clash:'flv',tide:'flv'};
F.kindOf=function(e){
if(!e)return null;
if(e.fac)return e.fac;
if(e.kind!=='event'|| !e.text)return null;
for(var i=0;i<KIND_RE.length;i++)if(KIND_RE[i][1].test(e.text))return KIND_RE[i][0];
return null;
};
F.foldSet=function(res){
if(!res|| !res.factions|| !res.log)return null;
if(res.factions.final&&res.factions.final.lim)return null;
var by={},steps=[];
res.log.forEach(function(e){
var k=F.kindOf(e);
if(!k|| !FAM[k])return;
if(!by[e.step]){by[e.step]=[];steps.push(e.step);}
by[e.step].push({e:e,k:k});
});
var fold={},last={chg:null,flv:null},swaps={},n=0;
steps.forEach(function(st){
var L=by[st],chg=L.filter(function(x){return FAM[x.k]==='chg';}),flv=L.filter(function(x){return FAM[x.k]==='flv';});
if(chg.length){
var first=last.chg==null,big=chg.some(function(x){return x.k==='form'||x.k==='scatter'||x.k==='sub'||x.k==='lead';})||chg.filter(function(x){return x.k==='swap'||x.k==='lone';}).length>1;
var show=first||(big&&st-last.chg>=3);
chg.forEach(function(x){
var hide= !show;
if(x.k==='swap'){var a=x.e.actors[0];swaps[a]=(swaps[a]||0)+1;if(swaps[a]>2)hide=true;}
if(hide){fold[x.e.n]=1;n++;}
});
if(show)last.chg=st;
}
if(flv.length){
if(last.flv!=null&&st-last.flv<3)flv.forEach(function(x){fold[x.e.n]=1;n++;});
else last.flv=st;
}
});
return n?fold:null;
};
F.noteFor=function(ctx,c){
var h=ctx.facHist||[];
if(!h.length)return null;
var last=h[h.length-1],C=ctx.chars;
var mine=last.groups.filter(function(g){return g.members.indexOf(c.i)>=0;})[0];
var hist=[];
h.forEach(function(x){
var g=x.groups.filter(function(g2){return g2.members.indexOf(c.i)>=0;})[0];
var tag=g?C[g.leader].name+'派'+(g.leader===c.i?'（頭）':''):'無所属';
if(hist[hist.length-1]!==tag)hist.push(tag);
});
var ever=h.some(function(x){return x.groups.length;});
var now=mine?(mine.leader===c.i?C[c.i].name+'派を率いた'+(last.regime==='dictator'?'。独裁者として君臨した':''):C[mine.leader].name+'派に属した')
:(!ever?'派閥は生まれなかった':last.regime==='none'?'最後には派閥そのものが消えた':'どの派閥にも属さなかった');
return'派閥：'+now+(hist.length>1?'（'+hist.join(' → ')+'）':'')+'。';
};
})();
});
;
/* ==== js/unreq.js ==== */
HK.Load.def(163,'js/unreq.js',function(){
(function(){
'use strict';
var HK=window.HK;
function L(s){return s.split('|');}
function fill(t,m){return t.replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function has(ctx,a,b,ty){return HK.Ties?HK.Ties.has(ctx,a,b,ty):null;}
function couple(ctx,a,b){return!!ctx.pair(a,b).couple|| !!(has(ctx,a,b,'lover')||has(ctx,a,b,'mate')||has(ctx,a,b,'fated'));}
function alive(c){return c&&c.alive&& !c.out;}
var U=HK.Unreq={};
U.crushOn=function(ctx,a,b){
if(!a|| !b||a===b||couple(ctx,a,b))return false;
if(HK.Ties&&HK.Ties.from(ctx,a,b,'crush'))return true;
if(has(ctx,a,b,'crush')&& !(HK.canLove(a,b)&&ctx.R(a,b).att>50))return false;
return HK.canLove(a,b)&&ctx.R(a,b).att>50;
};
U.heartOf=function(ctx,b,a){
if(HK.lockOut(b,a)){var lps=HK.lockPeople(ctx.chars,b).filter(function(x){return x.alive!==false;});if(lps.length>1)lps.sort(function(x,y){return heartV(ctx,b,y)-heartV(ctx,b,x);});if(lps[0])return lps[0];}
var best=null,bv=45;
ctx.chars.forEach(function(o){
if(o===b||o===a)return;
var v=heartV(ctx,b,o);
if(v>bv){bv=v;best=o;}
});
return best;
};
function heartV(ctx,b,o){
var v=ctx.R(b,o).att,cr=HK.Ties&&HK.Ties.from(ctx,b,o,'crush');
if(couple(ctx,b,o))v+=400;
if(cr)v+=300;
if(has(ctx,b,o,'fwb')||has(ctx,b,o,'almost')||has(ctx,b,o,'ex'))v+=150;
return v;
}
U.cold=function(ctx,a,b){
var t=HK.Ties&&HK.Ties.from(ctx,a,b,'crush');
if(t&&t.cold)return t.cold;
if(HK.Ties&&HK.Ties.from(ctx,b,a,'crush'))return'';
if(HK.lockOut(b,a))return U.heartOf(ctx,b,a)?'other':'none';
if(ctx.R(b,a).att>=20)return'';
if(U.heartOf(ctx,b,a))return'other';
if(ctx.R(b,a).ten>30||ctx.R(b,a).aff< -10)return'dislike';
return ctx.R(b,a).aff>30?'friend':'none';
};
U.unreq=function(ctx,a,b){return U.crushOn(ctx,a,b)&& !!U.cold(ctx,a,b);};
var COLD_WHY={none:'興味がない',friend:'友達としか見ていない',dislike:'苦手に思っている',other:'ほかに好きな人がいる'};
U.why=function(ctx,a,b){var c=U.cold(ctx,a,b);return a.name+'の片想い。'+(c==='other'?b.name+'には'+(HK.lockOut(b,a)&&HK.lockNames(ctx.chars,b)?HK.lockNames(ctx.chars,b)+'という、':'')+'ほかに好きな人がいる':b.name+'は'+a.name+'を'+(COLD_WHY[c]||'意識していない'))+'（'+b.name+'から'+a.name+'への惹かれ '+Math.round(ctx.R(b,a).att)+'）';};
var SCN=function(ctx){return ctx.scen.id;};
var D=U.TEXT={
serve:{
goukon:L('{a}は{b}のグラスが空く前に、次の一杯を頼んでいた。|{a}は{b}の話に、誰よりも大きく笑った。|{a}は自己紹介のあいだじゅう、{b}の方ばかり見ていた。|{a}は{b}の取り皿に、唐揚げをそっと一つ多くのせた。'),
classroom:L('{a}は休み時間、用もないのに{b}の席の近くを通った。|{a}は{b}に、昨日の課題のノートを貸した。|{a}は購買で、{b}の好きなパンを買ってきた。「たまたま二つ買っちゃって｜たまたま二つ買ってしまった｜たまたま二つ買ってしまったんです」|{a}は{b}の消しゴムを拾って、三秒迷ってから渡した。'),
island:L('{a}は一番大きな魚を、黙って{b}の前に置いた。|{a}は{b}のために、寝床の葉を余分に集めてきた。|{a}は{b}の隣で、一晩中火の番をした。|{a}は浜辺で見つけたきれいな貝殻を、{b}に渡した。'),
whiteroom:L('{a}はさりげなく、{b}の隣に座り直した。|{a}は残り少ない水を、{b}に先に飲ませた。|{a}は退屈そうな{b}に、しりとりを持ちかけた。|{a}は自分の上着を、寒そうな{b}の肩にかけた。'),
zombie:L('{a}は{b}の分の缶詰を、先に開けておいた。|{a}は{b}の擦り傷に、なけなしの消毒液を使った。|{a}は{b}の靴紐を、黙って結び直した。|{a}は{b}が眠れるように、毛布を一枚譲った。'),
any:L('{a}は{b}に、そっと飲み物を差し出した。|{a}は{b}の話を、誰よりも熱心に聞いていた。')
},
brush:{
none:L('{b}は「ありがと｜ありがとう｜ありがとうございます」とだけ言って、すぐに別の話を始めた。|{b}は{a}の方を見もせずに、生返事をした。|{b}は{a}の名前を、一度言い間違えた。|{b}は礼を言ったが、五分後にはもう忘れているようだった。'),
friend:L('{b}は「ほんといい奴だな、あなた｜本当にいい奴だな、あなたは｜本当にいい人ですね、あなたは」と{a}の背中を叩いた。それ以上の意味は、どこにもなかった。|{b}は「{a}みたいな友達がいてよかった｜{a}のような友人がいてよかった｜{a}みたいな友達がいてよかったです」と、まっすぐに笑った。|{b}は無防備に{a}の肩にもたれて、すぐに寝息を立てた。眠れないのは{a}だけだった。|{b}は「{a}になら何でも話せる｜＝｜{a}になら何でも話せます」と言った。それが一番、遠かった。'),
dislike:L('{b}は小さく会釈して、さりげなく距離をとった。|{b}は「……どうも」と言ったきり、{a}と目を合わせなかった。|{b}は用事を思い出したふりをして、その場を離れた。|{b}は受け取ったものを、{a}が見ていないところでそっと置いた。'),
other:L('{b}は礼を言いながら、目では{c}を探していた。|{b}は{a}の話を聞きながら、{c}の笑い声がするたびにそちらを振り向いた。|{b}は「ありがとう｜＝｜ありがとうございます」と言った。その声は、{c}に向けるときより一段低かった。|{b}は{a}にもらったものを、{c}に「見て｜見ろ｜見てください」と見せに行った。')
},
self:L('{a}は、それでもいいと思った。|{a}は笑って、少しだけ胸を押さえた。|{a}は空になった手を、ポケットに突っ込んだ。|{a}は「まあ、そうだよな｜まあ、そうだろうな｜まあ、そうですよね」と、誰にも聞こえない声で言った。|{a}は自分に言い聞かせた。見返りが欲しくてやったんじゃない。'),
tri:L('{a}は、{b}が{c}を目で追っているのに気づいた。その目は、自分には一度も向けられたことのないものだった。|{a}は、{b}が{c}の前でだけ髪を直すことを知っていた。知りたくなかった。|{b}が{c}に話しかけるとき、声が少しだけ高くなる。{a}はそれに気づくたびに、窓の外を見た。'),
triLoop:L('そして{c}の目は、{a}の方を向いていた。三人の視線は、どこでも交わらなかった。|{c}もまた、誰かを見つめていた。――{a}を。誰も、そのことに気づいていなかった。'),
triBlind:L('{c}は、そのことに気づいてさえいなかった。|{c}は今日も、{b}の気持ちに気づかないまま笑っていた。'),
protect:{
goukon:L('{b}に強引に絡む隣の席の客との間に、{a}は「すみません、こいつ酔うと面倒なんで」と笑って割って入った。|{a}は{b}のグラスを、気づかれないようにウーロン茶にすり替えた。|王様ゲームで{b}に際どい命令が回りかけた瞬間、{a}は「はい、代わりにやる！｜＝｜はい、代わりにやります！」と手を挙げた。|{a}は{b}の終電の時間を確かめて、「そろそろお開きにしない？｜そろそろお開きにしないか？｜そろそろお開きにしませんか？」と言い出した。|{b}に何度も肩を寄せる{c}の話を、{a}はさりげなく別の話題にそらした。|{a}は帰り道、{b}を駅まで送った。改札の前で、{a}は「じゃ｜では｜それでは」とだけ言って引き返した。'),
classroom:L('{b}の陰口を叩いていた連中に、{a}は「本人の前で言えば｜本人の前で言え｜本人の前で言ったらどうですか」と言った。|体育の時間、飛んできたボールから、{a}はとっさに{b}をかばった。|{a}は{b}が忘れた宿題のために、自分のノートを破って渡した。|{b}が先生に叱られそうになったとき、{a}は「私がやった｜＝｜私がやりました」と手を挙げた。'),
island:L('{a}は崖で足を滑らせた{b}の手首を、間一髪で掴んだ。|夜の見張りの番、{a}は{b}の分まで起きていた。|{a}は{b}が口にしかけた赤い実を、黙って叩き落とした。「それ、毒｜それは毒だ｜それ、毒です」|嵐の夜、{a}は{b}の寝床の上に、自分の分の屋根を広げた。'),
whiteroom:L('{a}は「その条件は、私がやる｜＝｜その条件は、私がやります」と言って、{b}の前に出た。|{b}に詰め寄る{c}の前に、{a}は黙って立ちはだかった。|{a}は{b}が眠れるように、扉の方を向いて座っていた。|{a}は監視カメラから{b}が見えないように、さりげなく立ち位置を変えた。'),
zombie:L('群れが迫ったとき、{a}は{b}を先に窓から押し出した。|{a}は{b}の背後に迫ったゾンビを、何も言わずに倒した。|{a}は{b}が眠っている間、扉の前から一歩も動かなかった。'),
any:L('{a}は{b}に危険が及ばないよう、ずっと目を配っていた。')
},
thanks:{
none:L('{b}は、守られたことに気づいてもいなかった。|{b}は「あ、どうも｜ああ、どうも｜あ、どうもありがとうございます」と軽く頭を下げた。'),
friend:L('{b}は「助かった、さすが親友！｜助かった、さすが親友だ！｜助かりました、さすが親友です！」と笑った。それだけだった。|{b}は{a}の頭をくしゃくしゃと撫でた。子どもにするみたいに。'),
dislike:L('{b}は戸惑ったように、小さく礼を言った。|{b}は「……ありがとう｜＝｜……ありがとうございます」と言って、少しだけ{a}を見直したような顔をした。'),
other:L('{b}は礼を言うと、すぐに{c}のところへ戻っていった。|{b}は「ありがとう｜＝｜ありがとうございます」と言いながら、{c}が見ていたかどうかを気にしていた。')
},
notice:L('{b}はふと、{a}がいつも自分を守ってくれていたことに気づいた。気づいてしまうと、もう前と同じ顔では{a}を見られなかった。|{b}は、自分の隣がいつも空いていない理由に、ようやく思い当たった。|{b}は{a}の背中を見ながら、これまでのことを一つずつ思い出していた。'),
confessAt:{goukon:'二次会の帰り道、{a}は{b}を呼び止めた。',classroom:'放課後の誰もいない教室で、{a}は{b}に向き合った。',island:'星がやけに多い夜、{a}は{b}を浜辺に呼んだ。',whiteroom:'扉が開く気配のない部屋の隅で、{a}は{b}に言った。',zombie:'見張りの交代の時間、{a}は{b}を引き止めた。',any:'{a}は{b}を呼び止めた。'},
confess:L('「ずっと好きだった｜＝｜ずっと好きでした」|「好き。……知ってたかもしれないけど｜好きだ。……知っていたかもしれないが｜好きです。……知っていたかもしれませんけど」|「一回だけ言わせて。好きだ｜一回だけ言わせてくれ。好きだ｜一回だけ言わせてください。好きです」|「迷惑なのは分かってる。でも、好き｜迷惑なのは分かっている。だが、好きだ｜迷惑なのは分かっています。でも、好きです」'),
reject:{
none:L('{b}は少し困った顔をした。「ごめん。そういうふうに考えたこと、なかった｜すまない。そういうふうに考えたことは、なかった｜ごめんなさい。そういうふうに考えたこと、ありませんでした」|{b}はしばらく黙ってから、「……ごめん｜……すまない｜……ごめんなさい」とだけ言った。'),
friend:L('{b}は笑って、それから真顔になった。「{a}のことは好きだよ。……友達として｜{a}のことは好きだ。……友人として｜{a}のことは好きですよ。……友達として、ですが」|{b}は困ったように笑った。「今の関係が一番いい。壊したくない｜＝｜今の関係が一番いいです。壊したくありません」'),
dislike:L('{b}は一歩下がった。「……ごめん。無理｜……すまない。無理だ｜……ごめんなさい。無理です」|{b}は目を逸らした。「そういうの、困る｜そういうのは、困る｜そういうの、困ります」'),
other:L('{b}は目を伏せた。「ごめん。好きな人がいる｜すまない。好きな人がいる｜ごめんなさい。好きな人がいます」――名前は言わなかったが、{a}には分かっていた。|{b}は申し訳なさそうに、{c}の方を見た。それが答えだった。')
},
after:{
persist:L('{a}は「じゃあ、好きになってもらえるまで頑張る｜では、好きになってもらえるまで頑張る｜じゃあ、好きになってもらえるまで頑張ります」と笑った。|{a}は「返事は急がない。待ってる｜返事は急がない。待っている｜返事は急ぎません。待っています」と言った。{b}が何か言う前に、背を向けた。'),
smile:L('{a}は「言えてよかった｜＝｜言えてよかったです」と笑った。目は笑っていなかった。|{a}は「聞いてくれてありがとう。……明日からも、普通にしてね｜聞いてくれて感謝する。……明日からも、普通にしてくれ｜聞いてくれてありがとうございます。……明日からも、普通にしてくださいね」と言った。'),
cold:L('{a}は「そうか｜＝｜そうですか」とだけ言って、背を向けた。|{a}は黙って頷いた。それから、少しだけ遠くへ歩いていった。')
},
help:L('{a}は{b}に、{c}の好きなものをこっそり教えた。自分の気持ちは、最後まで言わなかった。|{a}は{b}と{c}が二人きりになれるように、わざと席を外した。|{b}から{c}のことで相談を受けて、{a}は真剣に答えた。帰り道、一人で少しだけ泣いた。|{a}は{b}の背中を押した。「行ってこいよ｜行ってこい｜行ってきてください」――押した手を、しばらく見つめていた。'),
rival:L('{a}は{c}に、必要以上にきつく当たった。理由を訊かれても、言えなかった。|{a}は{c}に「{b}のこと、泣かせたら許さない｜{b}を泣かせたら許さない｜{b}のこと、泣かせたら許しません」と言った。{c}はきょとんとしていた。|{a}は{c}の欠点を探そうとして、一つも見つからなかった。それが一番、悔しかった。|{a}は{c}の隣で笑う{b}を見ないように、{c}とばかり話した。'),
loss:L('{c}を失った{b}の隣に、{a}は黙って座った。肩を貸すことしか、できなかった。|{b}は{a}の胸で泣いた。{a}は{b}の背中を撫でながら、自分の中の小さな期待を、心の底から憎んだ。|{a}は{b}に、{c}の形見を渡した。「持ってて。……忘れなくていいから｜持っていろ。……忘れなくていい｜持っていてください。……忘れなくていいですから」')
};
function sc(ctx,T){return T[SCN(ctx)]||T.any;}
function heart(ctx,a,b){var c=U.heartOf(ctx,b,a);return c&&alive(c)?c:null;}
function mk(id,cat,w,when,run){return{id:id,cat:cat,scope:'pair',mini:true,sig:true,when:when,w:w,run:run};}
var LIST=[
mk('u_serve','bond',function(ctx,a,b){return 0.7+a.tr.np*0.5+a.tr.ac*0.3;},
function(ctx,a,b){return U.unreq(ctx,a,b)&&(ctx.pair(a,b).userve||0)<3;},
function(ctx,a,b){
var pf=ctx.pair(a,b),k=U.cold(ctx,a,b),c=heart(ctx,a,b);
if(k==='other'&& !c)k='none';
pf.userve=(pf.userve||0)+1;
ctx.mod2(a,b,{att:3,aff:2},k==='dislike'?{ten:3}:{aff:3,trust:2});
ctx.stress(a,3);
var m={a:a.name,b:b.name,c:c?c.name:''};
return{text:fill(ctx.pick(sc(ctx,D.serve)),m)+fill(ctx.pick(D.brush[k]),m)+(ctx.rng()<0.6?fill(ctx.pick(D.self),m):''),why:U.why(ctx,a,b),with:k==='other'&&c?[c]:null};
}),
mk('u_tri','romance',function(ctx,a){return 0.9+a.tr.a*0.3+a.tr.jealous*0.4;},
function(ctx,a,b){return U.unreq(ctx,a,b)&& !!heart(ctx,a,b)&&(ctx.pair(a,b).utri||0)<2;},
function(ctx,a,b){
var pf=ctx.pair(a,b),c=heart(ctx,a,b),m={a:a.name,b:b.name,c:c.name};
pf.utri=(pf.utri||0)+1;
ctx.stress(a,6);ctx.mod(a,c,{ten:4});
var loop=U.crushOn(ctx,c,a),blind=ctx.R(c,b).att<25;
return{text:fill(ctx.pick(D.tri),m)+(loop?fill(ctx.pick(D.triLoop),m):blind?fill(ctx.pick(D.triBlind),m):''),why:'一方通行の三角関係：'+a.name+'→'+b.name+'→'+c.name+(loop?'→'+a.name:blind?'（'+c.name+'は気づいていない）':''),with:[c]};
}),
mk('u_protect','help',function(ctx,a){return(ctx.scen.id==='goukon'?1.6:0.8)+a.tr.np*0.4+a.tr.cp*0.3;},
function(ctx,a,b){return U.unreq(ctx,a,b)&&(ctx.pair(a,b).uprot||0)<4;},
function(ctx,a,b){
var pf=ctx.pair(a,b),k=U.cold(ctx,a,b),c=heart(ctx,a,b)||ctx.others(a).filter(function(o){return o!==b;})[0];
if(k==='other'&& !heart(ctx,a,b))k='none';
pf.uprot=(pf.uprot||0)+1;
var m={a:a.name,b:b.name,c:c?c.name:'誰か'};
var pool=sc(ctx,D.protect).filter(function(t){return c||t.indexOf('{c}')<0;});
var t=fill(ctx.pick(pool),m);
var noticed=pf.uprot>=3&&k!=='dislike'&& !pf.unotice&&ctx.rng()<0.3+a.tr.np*0.2;
if(noticed){
pf.unotice=true;
ctx.mod2(a,b,{aff:3},{att:14,aff:10,trust:10});
return{text:t+fill(ctx.pick(D.notice),m),why:a.name+'が黙って守り続けてきた（'+pf.uprot+'回目）。'+b.name+'の心が、少しだけ動いた',mag:26,with:c&&t.indexOf(c.name)>=0?[c]:null};
}
ctx.mod2(a,b,{att:2},{trust:6,aff:4});
return{text:t+fill(ctx.pick(D.thanks[k]),m),why:U.why(ctx,a,b)+'／それでも守る',with:c&&t.indexOf(c.name)>=0?[c]:null};
}),
mk('u_confess','romance',function(ctx,a){return 0.5+a.tr.honesty*0.6+a.tr.impulse*0.4+a.stress/150;},
function(ctx,a,b){var pf=ctx.pair(a,b);return U.unreq(ctx,a,b)&& !pf.uconf&&((pf.userve||0)+(pf.uprot||0)>=1||ctx.R(a,b).att>65)&&(!HK.Poly||HK.Poly.canTry(ctx,a,b));},
function(ctx,a,b){
var pf=ctx.pair(a,b),k=U.cold(ctx,a,b),c=heart(ctx,a,b);
if(k==='other'&& !c)k='none';
pf.uconf=true;
var m={a:a.name,b:b.name,c:c?c.name:''};
var open=fill(D.confessAt[SCN(ctx)]||D.confessAt.any,m)+fill(ctx.pick(D.confess),m);
if(k!=='dislike'&&k!=='other'&&ctx.R(b,a).att>32&&HK.canLove(b,a)){
pf.couple=true;ctx.mod2(a,b,{att:10,aff:10,trust:8},{att:14,aff:10,trust:8});
return{text:open+fill('{b}は長いあいだ黙っていた。それから、「……いつから？｜……いつからだ？｜……いつからですか？」と小さく訊いた。{a}が答えると、{b}は真っ赤になって俯いた。「……ずるい｜……ずるいな｜……ずるいです」',m),why:'相手にされていなかった片想いが、とうとう届いた（'+b.name+'の惹かれ '+Math.round(ctx.R(b,a).att)+'）',mag:36};
}
var af=a.tr.fc+a.tr.cp>1.15?'persist':a.tr.cold>0.6?'cold':'smile';
ctx.stress(a,18);ctx.mod2(a,b,{att:af==='persist'?4: -6},k==='dislike'?{ten:8}:{aff:2});
if(af==='persist')a.flags.unreqPersist=b.i;
return{text:open+fill(ctx.pick(D.reject[k]),m)+fill(ctx.pick(D.after[af]),m),why:U.why(ctx,a,b)+'／'+{persist:'諦めない（FC・CP）',smile:'笑ってみせた',cold:'引き下がった（ドライさ）'}[af],mag:30,with:k==='other'&&c?[c]:null};
}),
mk('u_help','help',function(ctx,a){return 0.4+a.tr.np*0.7+a.tr.ac*0.3-a.tr.jealous*0.4;},
function(ctx,a,b){var c=heart(ctx,a,b);return U.unreq(ctx,a,b)&& !!c&& !couple(ctx,b,c)&& !ctx.pair(a,b).uhelp;},
function(ctx,a,b){
var c=heart(ctx,a,b),m={a:a.name,b:b.name,c:c.name};
ctx.pair(a,b).uhelp=true;
ctx.mod(b,c,{att:6,aff:4});ctx.mod(b,a,{trust:10,aff:6});ctx.stress(a,10);
return{text:fill(ctx.pick(D.help),m),why:a.name+'は、'+b.name+'の想う'+c.name+'との仲を取り持った（NP・AC）',mag:26,with:[c]};
}),
{id:'u_rival',label:'片想いの相手の想い人に妬く',cat:'conflict',scope:'pair',mini:true,sig:true,
when:function(ctx,a,c){var b=rivalOf(ctx,a,c);return!!b&&(ctx.pair(a,c).urival||0)<2&&(!HK.Obsess||HK.Obsess.jealOk(ctx,a,b));},
w:function(ctx,a){return 0.4+a.tr.jealous*0.8+a.tr.aggr*0.3;},
run:function(ctx,a,c){
var b=rivalOf(ctx,a,c),m={a:a.name,b:b.name,c:c.name};
ctx.pair(a,c).urival=(ctx.pair(a,c).urival||0)+1;
if(HK.Obsess)HK.Obsess.feed(ctx,a,b,6);
ctx.mod2(a,c,{ten:8},{ten:4});
return{text:fill(ctx.pick(D.rival),m),why:a.name+'の想う'+b.name+'は、'+c.name+'を想っている（嫉妬・執着）',with:[b]};
}},
mk('u_loss','help',function(){return 2.2;},
function(ctx,a,b){if(!U.crushOn(ctx,a,b)||ctx.pair(a,b).uloss)return false;var c=U.heartOf(ctx,b,a);return c&& !c.alive&&c.diedAt!=null;},
function(ctx,a,b){
var c=U.heartOf(ctx,b,a),m={a:a.name,b:b.name,c:c.name};
ctx.pair(a,b).uloss=true;
b.stress=Math.max(0,b.stress-10);ctx.mod2(a,b,{att:4},{aff:10,trust:12});
return{text:fill(ctx.pick(D.loss),m),why:b.name+'の想い人だった'+c.name+'は、もういない。'+a.name+'の片想いは、行き場をなくした',mag:30};
})
];
function rivalOf(ctx,a,c){
var hit=null;
ctx.chars.forEach(function(b){if(!hit&&alive(b)&&b!==a&&b!==c&&U.unreq(ctx,a,b)&&U.heartOf(ctx,b,a)===c)hit=b;});
return hit;
}
['goukon','classroom','island','whiteroom'].forEach(function(id){HK.addMini(id,LIST);});
var ZC=LIST.map(function(e){var e2={};for(var k in e)e2[k]=e[k];e2.mini=false;e2.w=(function(w0){return function(ctx,a,b){return w0(ctx,a,b)*0.8;};})(e.w);return e2;});
HK.atScen('zombie',function(){var Z=HK.ZB;if(Z&&Z.scen)HK.addTo(Z.scen.events,ZC);});
})();
});
;
/* ==== js/fwbcrush.js ==== */
HK.Load.def(164,'js/fwbcrush.js',function(){
(function(){
'use strict';
var HK=window.HK;
function L(s){return s.split('|');}
function fill(t,m){return t.replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function has(ctx,a,b,ty){return HK.Ties?HK.Ties.has(ctx,a,b,ty):null;}
function wants(ctx,a,b){
if(HK.Ties&&HK.Ties.from(ctx,a,b,'crush'))return true;
if(has(ctx,a,b,'crush')){var tb=HK.Ties.from(ctx,b,a,'crush');return!(tb&&tb.cold)&&ctx.R(a,b).att>90;}
return ctx.R(a,b).att>58;
}
var FC=HK.FwbCrush={};
FC.kind=function(ctx,a,b){
if(!a|| !b||a===b|| !has(ctx,a,b,'fwb')||ctx.pair(a,b).couple)return null;
if(HK.Pos&& !HK.Pos.okSex(a,b))return null;
if(!wants(ctx,a,b))return null;
if(wants(ctx,b,a))return'mutual';
var t=HK.Ties&&HK.Ties.from(ctx,a,b,'crush');
if(t&&t.cold)return'cold';
return ctx.R(b,a).att>=34?'pulse':'cold';
};
var KW={cold:'相手は体だけのつもり',pulse:'相手にも、少しだけ脈がある',mutual:'両片想い（お互いに「相手は体だけ」と思い込んでいる）'};
FC.why=function(ctx,a,b,k){return'セフレで片想い：'+a.name+'→'+b.name+'（'+KW[k]+'／'+b.name+'から'+a.name+'への惹かれ '+Math.round(ctx.R(b,a).att)+'）';};
var D=FC.TEXT={
night:{
goukon:L('合コンの席で、{a}と{b}は初対面のふりをしていた。トイレの前ですれ違ったとき、{b}が{a}の手の甲を指でなぞった。いつもの合図だった。――その夜、二人は別々に店を出て、同じホテルに入った。|二次会を抜けたのは、{a}と{b}が同時だった。周りは誰も、二人が知り合いだと気づいていなかった。'),
trial:L('投票の前夜、{a}は{b}の独房の扉を叩いた。明日、どちらかが処刑されるかもしれない。それでも二人は、いつもと同じことをした。|審理が終わると、{b}は無言で{a}の部屋に入ってきた。言葉はいらなかった。いつもそうだった。'),
whiteroom:L('出られない部屋の簡易ベッドで、二人はいつものように肌を重ねた。条件のためではなかった。|監視カメラの赤い光を背に、{b}は{a}の服に手をかけた。「どうせ、いつもしてることでしょ｜どうせ、いつもしていることだろう｜どうせ、いつもしていることでしょう」'),
island:L('夜の洞窟で、二人はいつものように体を寄せ合った。波の音が、すべてをかき消した。|焚き火が消えたあと、{b}は当たり前のように{a}の寝床に潜り込んできた。'),
omega:L('発情期でもないのに、{b}は{a}の部屋に来た。「抑制剤の練習台｜抑制剤の練習台だ｜抑制剤の練習台です」――いつもの言い訳だった。|{b}の匂いが濃くなる夜、{a}の部屋の鍵は、いつも開いていた。'),
zombie:L('バリケードの奥で、二人はいつもの夜を過ごした。明日のことは、どちらも口にしなかった。|見張りの交代のあと、{b}は黙って{a}の寝袋に入ってきた。生きていることを確かめる、いつもの方法だった。'),
any:L('その夜も、二人はいつものように過ごした。')
},
after:{
cold:L('終わると、{b}はすぐに服を着た。「じゃ、またね｜では、また会おう｜では、また会いましょう」――{a}は「うん｜ああ｜はい」とだけ言って、天井を見ていた。|{b}はシャワーを浴びると、{a}の方を見ずにスマホをいじり始めた。{a}は、背中に「好き」と書きそうになった指を、握りしめた。|{a}が「もう少しいてもいいよ｜もう少しいてもいい｜もう少しいてもいいですよ」と言うと、{b}は笑った。「何それ、恋人みたい｜何だそれは、恋人のようだ｜何ですかそれ、恋人みたいですね」――{a}も笑った。うまく笑えたかは分からない。'),
pulse:L('いつもならすぐに帰る{b}が、その夜はなかなか服を着なかった。理由は、{b}自身にも分かっていなかった。|{b}は{a}の髪を、無意識に指で梳いていた。気づいて、慌てて手を引っ込めた。|{b}は帰り際、「……次、いつ空いてる｜……次は、いつ空いている｜……次は、いつ空いていますか」と訊いた。訊いてから、自分で少し驚いた顔をした。'),
mutual:L('二人は背中合わせに寝転がっていた。{a}は「好き」と言いかけてやめた。{b}も、同じ言葉を飲み込んでいた。お互いに、相手にとって自分は体だけだと思っていた。|{a}は{b}の寝顔を見つめていた。{b}は眠ったふりをしながら、{a}の視線を数えていた。どちらも、それが相手の本心だとは思わなかった。|朝、{a}は先に起きて、{b}の分のコーヒーを淹れた。{b}はそれを飲みながら、「セフレに優しくしすぎ｜セフレに優しくしすぎだ｜セフレに優しくしすぎです」と笑った。――{a}の気持ちに気づかれたくなくて、{b}も笑った。')
},
jealous:L('{b}が{c}と楽しそうに話しているのを、{a}は遠くから見ていた。文句を言う権利なんて、どこにもない。セフレなのだから。|{b}のスマホが鳴った。画面に{c}の名前が見えた。{a}は、見なかったことにした。|{a}は{b}に「{c}と、仲いいんだね｜{c}と、仲がいいんだな｜{c}と、仲がいいんですね」と言った。声が、思ったより低く出た。'),
jealousRe:{
cold:L('{b}は首を傾げた。「何、嫉妬？　そういう関係じゃないでしょ、私たち｜何だ、嫉妬か？　そういう関係ではないだろう、私たちは｜何ですか、嫉妬ですか？　そういう関係じゃないでしょう、私たちは」|{b}は気にも留めなかった。「別にいいじゃん、誰と話しても｜誰と話しても、別に構わないだろう｜誰と話しても、別にいいじゃないですか」'),
pulse:L('{b}は「……気にしてるの？｜……気にしているのか？｜……気にしているんですか？」と訊いた。否定されると、なぜか少しがっかりした。|{b}はそれから、{c}と話すのを少しだけ控えるようになった。自分でも理由は分からなかった。'),
mutual:L('{b}は「そっちこそ｜そちらこそだろう｜そちらこそでしょう」と言いかけて、黙った。{b}もまた、{a}が誰かと話すたびに同じ気持ちになっていた。|{b}はわざと{c}の話を続けた。{a}が少しでも妬いてくれるのが、嬉しかったから。')
},
slip:L('最中に、{a}の口から「好き」がこぼれた。{a}は凍りついた。|{a}は{b}を抱きしめたまま、小さく「好きだよ｜好きだ｜好きです」と言ってしまった。言うつもりは、なかった。'),
slipRe:{
cold:L('{b}は動きを止めた。「……そういうのは、なしって言ったよね｜……そういうのは、なしだと言ったはずだ｜……そういうのは、なしだと言いましたよね」――その夜、{b}はいつもより早く帰った。|{b}は聞こえなかったふりをした。それが一番、残酷だった。'),
pulse:L('{b}は何も言わなかった。ただ、{a}を抱く腕に、少しだけ力がこもった。|{b}は「……ずるい｜……ずるいな｜……ずるいです」とだけ言って、{a}の首筋に顔を埋めた。返事は、なかった。'),
mutual:L('{b}の目に、涙が浮かんだ。「……今の、本当？｜……今のは、本当か？｜……今の、本当ですか？」{a}が頷くと、{b}は笑って泣いた。「ずっと、体だけだと思ってた。私も、好き｜ずっと、体だけだと思っていた。私も、好きだ｜ずっと、体だけだと思っていました。私も、好きです」――セフレは、その夜で終わった。|{b}は{a}の顔を両手で挟んだ。「もう一回言って｜もう一回言ってくれ｜もう一回言ってください」{a}がもう一度言うと、{b}は「……私の方が、先に好きだった｜＝｜……私の方が、先に好きでした」と言った。二人は、初めてちゃんとキスをした。')
},
rule:L('{a}は決まりを破って、{b}の唇にキスをした。セフレの間では、しないと決めていたのに。|{a}は朝まで帰らなかった。「泊まらない」が、二人の約束だった。|{a}は人前で、{b}の手を握った。ほんの一瞬だけ。'),
ruleRe:{
cold:L('{b}は眉をひそめた。「ルール、守ってよ。面倒なのは嫌なの｜ルールは守れ。面倒なのは嫌だ｜ルール、守ってください。面倒なのは嫌なんです」|{b}は{a}の手を、そっとほどいた。「誰かに見られたらどうするの｜誰かに見られたらどうする｜誰かに見られたらどうするんですか」'),
pulse:L('{b}は怒らなかった。怒らなかった自分に、{b}は戸惑っていた。|{b}は「……今回だけね｜……今回だけだ｜……今回だけですよ」と言った。次も同じことを言う気がした。'),
mutual:L('{b}は「ルール違反｜ルール違反だ｜ルール違反です」と言いながら、{a}の手を握り返した。離さなかった。|{b}は一瞬固まってから、キスを返した。二人とも、何も言わなかった。言えば、壊れてしまう気がした。')
},
end:L('{a}は{b}に言った。「もう、会うのやめよう｜もう、会うのはやめよう｜もう、会うのはやめましょう」理由を訊かれても、{a}は答えなかった。好きだからとは、言えなかった。|{a}は{b}からの「今夜」の連絡に、初めて返事をしなかった。スマホを伏せて、膝を抱えた。'),
endRe:L('{b}は「そっか｜そうか｜そうですか」とだけ言った。引き止める言葉は、なかった。|{b}は少し驚いた顔をして、それから笑った。「了解。楽しかったよ｜了解だ。楽しかった｜分かりました。楽しかったです」'),
stay:L('{a}は分かっていた。この関係を続ける限り、自分だけが傷つく。それでも、{b}からの「今夜」に、{a}は「行く｜＝｜行きます」と返した。|{a}は自分に言い聞かせた。体だけでもいい。そばにいられるなら。'),
both:L('{a}は思った。{b}にとって自分は、都合のいい相手でしかない。――同じ夜、{b}も{a}について、まったく同じことを思っていた。|{a}は友達に「セフレに本気になったら終わりだよ」と言われて、笑ってごまかした。{b}も別の場所で、同じ言葉を言われていた。|{a}と{b}は、お互いに「重いと思われたくない」と思って、今日も好きと言わなかった。')
};
var SP={
trial:{t:L('{a}は{b}に投票しなかった。理由を訊かれて、「セフレがいなくなると困るから｜セフレがいなくなると困るからだ｜セフレがいなくなると困るからです」と答えた。嘘だった。|{b}が疑われたとき、{a}は真っ先に{b}をかばった。「{b}は、そんなことをする人じゃない｜{b}は、そんなことをする人間ではない｜{b}は、そんなことをする人じゃありません」――周りは、二人がそこまで親しかったことに驚いた。'),why:'処刑されるかもしれない相手を、体だけの関係のはずの{a}が必死でかばった'},
omega:{t:L('{a}は{b}のうなじに唇を寄せた。「……噛んでいい？｜……噛んでいいか？｜……噛んでもいいですか？」{b}は身をよじった。「だめ。番にはならないって、約束でしょ｜だめだ。番にはならないと、約束しただろう｜だめです。番にはならないって、約束でしょう」|{a}は発情した{b}のうなじを前にして、歯を立てる寸前で止まった。体だけの関係のまま番になったら、{b}を一生縛ってしまう。'),why:'番になりたいのは、片想いの側だけかもしれない'},
goukon:{t:L('合コンで{b}が{c}といい雰囲気になった。{a}は他人のふりをしたまま、何も言えなかった。帰りに{b}から「今夜、行っていい？｜今夜、行っていいか？｜今夜、行ってもいいですか？」とメッセージが来た。{a}は三十分迷ってから、「いいよ｜構わない｜いいですよ」と返した。|{a}は{b}が合コンで連絡先を交換するのを、向かいの席から見ていた。初対面のふりをしている以上、止める理由はなかった。'),why:'セフレであることを隠して、同じ合コンに来ていた'},
zombie:{t:L('{b}が群れに囲まれたとき、{a}は迷わず飛び込んだ。助け出したあと、{b}は「なんでそこまで｜なぜそこまでする｜どうしてそこまでするんですか」と訊いた。{a}は「セフレがいなくなったら困るし｜セフレがいなくなったら困るからな｜セフレがいなくなったら困りますから」と笑った。|{a}は{b}の分まで食料を集めてきた。「体だけの相手に、そこまでする？｜体だけの相手に、そこまでするか？｜体だけの相手に、そこまでしますか？」と{b}が笑うと、{a}は何も言わずに背を向けた。'),why:'命がけで守る理由を、体だけの関係では説明できなかった'}
};
function scnPool(ctx,T){return T[ctx.scen.id]||T.any;}
function other(ctx,a,b){var o=ctx.others(a).filter(function(x){return x!==b;});return o.length?ctx.pick(o):null;}
function mk(id,cat,w,when,run,only){return{id:id,cat:cat,scope:'pair',mini:true,sig:true,w:w,when:when,run:run,only:only,sex:id==='fc_night'||undefined};}
var LIST=[
mk('fc_night','romance',function(ctx,a,b){return 1+ctx.R(a,b).att/80;},
function(ctx,a,b){var k=FC.kind(ctx,a,b);return k&&(ctx.pair(a,b).fcN||0)<2;},
function(ctx,a,b){
var k=FC.kind(ctx,a,b),pf=ctx.pair(a,b),m={a:a.name,b:b.name};
pf.fcN=(pf.fcN||0)+1;pf.night=true;
ctx.mod2(a,b,{att:5},k==='cold'?{att:1}:{att:5,aff:3});
ctx.stress(a,k==='cold'?6:2);
return{text:fill(ctx.pick(scnPool(ctx,D.night)),m)+fill(ctx.pick(D.after[k]),m),why:FC.why(ctx,a,b,k),mag:26};
}),
mk('fc_jealous','conflict',function(ctx,a){return 0.6+a.tr.jealous*0.8;},
function(ctx,a,b){return FC.kind(ctx,a,b)&& !!other(ctx,a,b)&& !ctx.pair(a,b).fcJ&&(!HK.Obsess||HK.Obsess.jealOk(ctx,a,b));},
function(ctx,a,b){
var k=FC.kind(ctx,a,b),c=other(ctx,a,b),m={a:a.name,b:b.name,c:c.name};
ctx.pair(a,b).fcJ=true;
if(HK.Obsess)HK.Obsess.feed(ctx,a,b,6);
ctx.stress(a,8);ctx.mod(a,c,{ten:5});
if(k!=='cold')ctx.mod(b,a,{att:6});
return{text:fill(ctx.pick(D.jealous),m)+fill(ctx.pick(D.jealousRe[k]),m),why:FC.why(ctx,a,b,k)+'／嫉妬する権利はない',with:[c]};
}),
mk('fc_slip','romance',function(ctx,a){return 0.5+a.tr.honesty*0.5+a.tr.impulse*0.4;},
function(ctx,a,b){var pf=ctx.pair(a,b);return FC.kind(ctx,a,b)&& !pf.fcSlip&&(pf.fcN||0)>=1;},
function(ctx,a,b){
var k=FC.kind(ctx,a,b),pf=ctx.pair(a,b),m={a:a.name,b:b.name};
pf.fcSlip=true;
if(k==='mutual'){pf.couple=true;ctx.mod2(a,b,{att:12,aff:15,trust:12},{att:12,aff:15,trust:12});}
else if(k==='pulse'){ctx.mod(b,a,{att:12,aff:6});}
else{ctx.stress(a,18);ctx.mod2(a,b,{att: -2},{ten:6});}
return{text:fill(ctx.pick(D.slip),m)+fill(ctx.pick(D.slipRe[k]),m),why:FC.why(ctx,a,b,k)+(k==='mutual'?'／両片想いが、ようやく通じた':''),mag:k==='mutual'?40:30};
}),
mk('fc_rule','romance',function(ctx,a){return 0.6+a.tr.fc*0.4+a.tr.impulse*0.3;},
function(ctx,a,b){return FC.kind(ctx,a,b)&& !ctx.pair(a,b).fcRule;},
function(ctx,a,b){
var k=FC.kind(ctx,a,b),m={a:a.name,b:b.name};
ctx.pair(a,b).fcRule=true;
ctx.mod2(a,b,{att:4},k==='cold'?{ten:5}:{att:7,aff:4});
return{text:fill(ctx.pick(D.rule),m)+fill(ctx.pick(D.ruleRe[k]),m),why:FC.why(ctx,a,b,k)};
}),
mk('fc_end','romance',function(ctx,a){return 0.4+a.stress/120+a.tr.cp*0.3;},
function(ctx,a,b){var pf=ctx.pair(a,b);return FC.kind(ctx,a,b)==='cold'&& !pf.fcEnd&&(pf.fcSlip||(pf.fcN||0)>=2||a.stress>50);},
function(ctx,a,b){
var pf=ctx.pair(a,b),m={a:a.name,b:b.name};
pf.fcEnd=true;
if(a.tr.cp+a.tr.a>a.tr.ac+0.3){
pf.night=false;pf.wasNight=true;
ctx.stress(a,15);ctx.mod2(a,b,{att: -8},{ten:4});
return{text:fill(ctx.pick(D.end),m)+fill(ctx.pick(D.endRe),m),why:FC.why(ctx,a,b,'cold')+'／傷つく前に、自分から終わらせた（CP・A）',mag:30};
}
ctx.stress(a,8);
return{text:fill(ctx.pick(D.stay),m),why:FC.why(ctx,a,b,'cold')+'／それでも続けることを選んだ（AC）',mag:22};
}),
mk('fc_both','romance',function(){return 1.1;},
function(ctx,a,b){return FC.kind(ctx,a,b)==='mutual'&& !ctx.pair(a,b).fcBoth;},
function(ctx,a,b){
ctx.pair(a,b).fcBoth=true;
return{text:fill(ctx.pick(D.both),{a:a.name,b:b.name}),why:FC.why(ctx,a,b,'mutual')};
})
];
Object.keys(SP).forEach(function(id){
LIST.push(mk('fc_sp_'+id,id==='trial'||id==='zombie'?'help':'romance',function(){return 1.2;},
function(ctx,a,b){return ctx.scen.id===id&&FC.kind(ctx,a,b)&& !ctx.pair(a,b).fcSp&&(id!=='goukon'|| !!other(ctx,a,b));},
function(ctx,a,b){
var k=FC.kind(ctx,a,b),c=other(ctx,a,b),m={a:a.name,b:b.name,c:c?c.name:''};
ctx.pair(a,b).fcSp=true;
ctx.mod2(a,b,{att:4},k==='cold'?{trust:6}:{att:8,trust:6});
return{text:fill(ctx.pick(SP[id].t),m),why:FC.why(ctx,a,b,k)+'／'+fill(SP[id].why,m),mag:28,with:id==='goukon'&&c?[c]:null};
}));
});
['goukon','trial','whiteroom','island','omega'].forEach(function(id){HK.addMini(id,LIST);});
var ZC=LIST.map(function(e){var e2={};for(var k in e)e2[k]=e[k];e2.mini=false;return e2;});
HK.atScen('zombie',function(){var Z=HK.ZB;if(Z&&Z.scen)HK.addTo(Z.scen.events,ZC);});
})();
});
;
/* ==== js/pining.js ==== */
HK.Load.def(166,'js/pining.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK|| !HK.Ties)return;
function L(s){return s.split('|');}
function fill(t,m){return t.replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function alive(c){return c&&c.alive!==false&& !c.out;}
var P=HK.Pining={};
P.is=function(ctx,a,b){return alive(a)&&alive(b)&&HK.Ties.pining(ctx,a,b);};
function confidant(ctx,a,b){
var best=null,bv=15;
ctx.chars.forEach(function(c){
if(c===a||c===b|| !alive(c))return;
var v=Math.min(ctx.R(a,c).trust+ctx.R(a,c).aff,ctx.R(b,c).trust+ctx.R(b,c).aff)/2;
if(v>bv){bv=v;best=c;}
});
return best;
}
function suitor(ctx,a,b){
var best=null,bv= -1;
ctx.chars.forEach(function(c){
if(c===a||c===b|| !alive(c)|| !HK.canLove(c,b)||ctx.pair(c,b).couple)return;
var v=ctx.R(c,b).att+ctx.R(c,b).aff*0.3;
if(v>bv){bv=v;best=c;}
});
return best;
}
function anyOther(ctx,a,b){var l=ctx.chars.filter(function(c){return c!==a&&c!==b&&alive(c);});return l.length?l[ctx.rng.int?ctx.rng.int(l.length):Math.floor(ctx.rng()*l.length)]:null;}
var WHY=function(a,b){return a.name+'と'+b.name+'は両片想い（お互いに想っているのに、相手は何とも思っていないと思い込んでいる）';};
var D=P.TEXT={
glance:{
goukon:L('{a}と{b}は、乾杯のたびに目が合った。そのたびに、どちらも先にグラスへ視線を落とした。|{a}が{b}の方を見ると、{b}は慌てて隣の人との話に戻った。その少しあと、{b}が{a}を見ると、{a}はメニューを読むふりをしていた。|{a}は{b}の笑い声がするたびに、そちらを見ないように気をつけていた。{b}も、まったく同じことをしていた。'),
classroom:L('{a}は授業中、斜め前の{b}の背中ばかり見ていた。{b}が振り向いた瞬間、{a}は黒板を睨みつけた。{b}も、すぐに前を向いた。|廊下ですれ違うとき、{a}と{b}はどちらも目を逸らした。すれ違ってから、どちらも少しだけ振り返った。|{a}と{b}は、窓ガラスに映った相手と目が合った。二人とも、何事もなかったように教科書をめくった。'),
island:L('火の向こうで、{a}と{b}の目が合った。{a}は薪をくべるふりをして、{b}は海の方を向いた。|{a}は浜で魚を捌く{b}の横顔を見ていた。{b}が顔を上げると、{a}は急に空模様を気にしはじめた。|{a}と{b}は、同じ椰子の実に同時に手を伸ばした。指が触れて、どちらも慌てて手を引っ込めた。'),
whiteroom:L('白い部屋では、目を逸らす場所がなかった。{a}と{b}は何度も目が合っては、どちらも壁の継ぎ目を数えるふりをした。|{a}は{b}の寝顔を見ていた。{b}が目を開けたので、{a}は慌てて扉の紙を読み返した。|{a}と{b}は、壁を背に並んで座っていた。肩が触れそうで触れない距離を、どちらも動かなかった。'),
zombie:L('見張りの交代のとき、{a}と{b}の目が合った。「……異常なし｜＝｜……異常ありません」「……うん｜……ああ｜……はい」――言いたいことは、それではなかった。|{a}は物資を分ける{b}の手元ばかり見ていた。{b}が顔を上げると、{a}は窓の外の通りを確かめるふりをした。|暗い部屋で、{a}と{b}は同じ毛布の端を掴んでいた。どちらも、手を離さなかった。どちらも、何も言わなかった。'),
any:L('{a}と{b}は目が合うたびに、どちらも先に逸らした。|{a}は{b}を見ていた。{b}も{a}を見ていた。ただ、二人とも、相手が見ていないときにだけ見ていた。')
},
almost:L('{a}「あのさ、{b}……」――{b}「なに？｜何だ？｜何ですか？」――{a}「……いや、なんでもない｜……いや、何でもない｜……いえ、何でもありません」――{b}は「そっか｜そうか｜そうですか」と笑った。少しだけ、期待していた自分に呆れながら。|{b}が「{a}って、好きな人いるの？｜{a}には、好きな人がいるのか？｜{a}って、好きな人はいるんですか？」と訊いた。{a}は「……いるよ｜……いる｜……います」とだけ答えた。{b}は「そっか｜そうか｜そうですか」と言ったきり、その相手が自分だとは思いもしなかった。|{a}は{b}と二人きりになった。言うなら今だと思った。{b}も同じことを考えていた。結局、二人で天気の話をして終わった。|{a}「{b}はさ、私のこと――」――そこで邪魔が入った。{a}はほっとして、{b}はがっかりした。どちらも、相手の顔は見ていなかった。|{a}と{b}は同時に「あの」と言った。「先にどうぞ」「いや、そっちが｜いや、そちらが先だ｜いえ、そちらが先です」――譲り合っているうちに、言いたかったことは喉の奥に戻っていった。'),
misread:L('{b}が{c}と楽しそうに話しているのを見て、{a}は「やっぱりそうか｜＝｜やっぱりそうですか」と一人で納得した。{b}がそのとき話していたのは、{a}のことだった。|{a}は{c}の相談に乗っていた。それを遠くから見た{b}は、二人はお似合いだと思って、そっと胸の奥に蓋をした。|{b}は{c}に、{a}の好きなものをこっそり訊いていた。それを見た{a}は、{b}は{c}が好きなのだと思い込んだ。|{a}は{b}が{c}の隣に座るのを見て、自分の入る隙間はないと思った。{b}は{a}の隣に座る勇気がなくて、{c}の隣に逃げただけだった。'),
consult:L('{a}は{c}に、{b}のことが好きだと打ち明けた。「でも、向こうは何とも思ってないから｜だが、向こうは何とも思っていない｜でも、向こうは何とも思っていませんから」――その日の夕方、{c}は{b}からまったく同じ相談をされた。{c}は天を仰いだ。|{c}は、{a}と{b}の両方から「内緒の相談」をされていた。中身は同じだった。{c}は二人の顔を交互に見て、深くため息をついた。|{b}は{c}に「{a}って、好きな人いると思う？｜{a}に、好きな人はいると思うか？｜{a}って、好きな人がいると思いますか？」と訊いた。{c}はつい昨日、{a}から同じ質問をされたばかりだった。'),
consultHint:L('{c}は「……二人とも、もう少し周りを見たら？｜……二人とも、もう少し周りを見たらどうだ｜……二人とも、もう少し周りを見たらどうですか」とだけ言った。|{c}は何も言わなかった。ただ、次の席替えで{a}と{b}を隣にした。|{c}は「自分で確かめなよ｜自分で確かめろ｜自分で確かめてください」と、{a}の背中を押した。'),
jealous:L('{b}が{c}に笑いかけるのを見て、{a}は胸の奥がちくりとした。その夜、{a}が{c}と話し込んでいるのを見た{b}も、同じ痛みを味わっていた。|{a}は{c}と肩を並べる{b}を見て、黙って席を外した。{b}はその背中を目で追いかけて、自分が何かしたのかと悩んだ。|{a}は{b}が{c}のことを褒めるたびに、少しずつ口数が減った。{b}は、{a}の機嫌が悪いのは自分のせいだと思い込んでいた。'),
joke:L('{a}は冗談めかして「{b}のこと、好きかもな｜{b}のことが、好きかもしれない｜{b}のこと、好きかもしれません」と言った。{b}は「はいはい」と笑って流した。笑った{b}の耳が赤かったことに、{a}は気づかなかった。|{b}が「{a}と付き合う人は幸せだろうな｜＝｜{a}と付き合う人は幸せでしょうね」と言った。{a}は「じゃあ{b}が付き合ってよ｜では{b}が付き合ってくれ｜じゃあ{b}が付き合ってください」と返して、二人とも笑った。笑いが途切れたあとの沈黙が、少し長かった。|{a}が「好きだよ｜好きだ｜好きです」と言った。直前の話の流れで、それは{b}の作った料理のことになった。{a}は訂正しなかった。'),
confessAt:{
goukon:'店を出たあと、駅までの道で、{a}は立ち止まった。',
classroom:'放課後の誰もいない教室で、{a}は{b}を呼び止めた。',
island:'夜の浜辺で、波の音にまぎれるように、{a}は口を開いた。',
whiteroom:'扉の紙を見つめたまま、{a}は小さな声で言った。',
zombie:'「明日、生きてるか分からないから｜明日、生きているか分からないから｜明日、生きているか分かりませんから」――{a}はそう前置きして、{b}の目を見た。',
any:'二人きりになったとき、{a}はとうとう口を開いた。'
},
confess:L('「ずっと好きだった。……迷惑なら、忘れて｜ずっと好きだった。……迷惑なら、忘れてくれ｜ずっと好きでした。……迷惑なら、忘れてください」――{b}は目を丸くして、それから、泣きそうな顔で笑った。「……こっちの台詞なんだけど｜……こちらの台詞だ｜……こちらの台詞なんですけど」|「好きだ｜＝｜好きです」――{a}がそう言うと、{b}は長いあいだ黙っていた。「……なんで先に言うの。ずっと言おうと思ってたのに｜……なぜ先に言う。ずっと言おうと思っていたのに｜……どうして先に言うんですか。ずっと言おうと思っていたんですよ」|「{b}のことが好き｜{b}のことが好きだ｜{b}のことが好きです」――言い終わる前に、{b}も「好き｜好きだ｜好きです」と言っていた。二人の声が重なって、どちらが先だったのか分からなかった。|{a}は「好きなんだ｜好きなのだ｜好きなんです」と言った。{b}は「知らなかった｜＝｜知りませんでした」と言った。「……私も、ずっと、そうだったのに｜……私も、ずっと、そうだったのだが｜……私も、ずっと、そうだったんです」|「振られるのは分かってる。でも、言わないと後悔するから｜振られるのは分かっている。だが、言わないと後悔する｜振られるのは分かっています。でも、言わないと後悔しますから」――{b}は首を振った。「振らないよ。……ずっと、待ってた｜振らない。……ずっと、待っていた｜振りません。……ずっと、待っていました」'),
approach:{
goukon:L('{c}が席を替わって{b}の隣に座り、「このあと、二人で飲み直さない？｜このあと、二人で飲み直さないか？｜このあと、二人で飲み直しません？」と声を潜めた。{b}は曖昧に笑っていた。グラスを持つ{a}の手に、力がこもった。|{c}は{b}に連絡先を訊いていた。{b}がスマホを取り出すのを、{a}は向かいの席から黙って見ていた。|「{b}さんって、彼氏とか彼女とかいるの？｜{b}さんには、彼氏や彼女はいるのか？｜{b}さんって、彼氏とか彼女とかいるんですか？」――{c}がそう訊くのが、{a}の耳にも届いた。{b}が「いないよ｜いない｜いません」と答えると、{c}は「じゃあ立候補しようかな｜では立候補しようか｜じゃあ立候補しましょうか」と笑った。'),
classroom:L('昼休み、{c}が{b}を廊下に呼び出したという噂が、{a}の耳に入った。「告白されたらしいよ」――{a}は、弁当の味がしなくなった。|{c}が{b}を、文化祭を一緒に回ろうと誘っていた。{b}が「考えとく｜考えておく｜考えておきます」と答えるのを、{a}は少し離れた席で聞いていた。'),
island:L('{c}は、{b}のために一番大きな貝を採ってきて、照れくさそうに差し出した。{b}が礼を言って笑うのを、{a}は焚き火の向こうから見ていた。|夜の浜辺で、{c}が{b}の隣に腰を下ろすのが見えた。二人の影は、{a}が思っていたよりずっと近かった。'),
whiteroom:L('{c}が{b}の肩に上着をかけて、「寒くない？｜寒くないか？｜寒くないですか？」と囁いた。白い部屋では、その声は{a}にもはっきり聞こえた。|{c}は「ここを出たら、ご飯でも行こうよ｜ここを出たら、ご飯でも行こう｜ここを出たら、ご飯でも行きましょう」と{b}を誘った。{b}は「いいね｜いいな｜いいですね」と頷いた。{a}は壁を見つめたまま、拳を握った。'),
zombie:L('{c}は「私が守るから｜私が守る｜私が守ります」と言って、{b}の隣で見張りを買って出た。{b}が「ありがとう｜＝｜ありがとうございます」と笑うのを、{a}は暗がりから見ていた。|{c}が{b}の怪我の手当てをしていた。指先がやけに優しく見えて、{a}は目を逸らした。'),
any:L('{c}が{b}に親しげに話しかけ、{b}も笑って応えていた。{a}は、その様子から目を離せなかった。|{c}は{b}を二人きりに誘った。{b}がすぐに断らなかったのを、{a}は見てしまった。')
},
rush:L('{a}は立ち上がり、{b}の腕を掴んだ。「ちょっと、いい？｜少し、いいか？｜ちょっと、いいですか？」――人のいないところまで連れ出して、{a}は息を吸った。「……ほかの人のところに行かないで。好きなんだ、ずっと｜……ほかの人のところに行くな。好きなんだ、ずっと｜……ほかの人のところに行かないでください。ずっと、好きだったんです」――{b}は呆然として、それから、耳まで赤くなった。「……今それ言う？　こっちは、ずっと言えなかったのに｜……今それを言うのか。こちらは、ずっと言えなかったのに｜……今それを言うんですか？　こちらは、ずっと言えなかったんですよ」|{a}は{c}と{b}のあいだに割って入った。「ごめん、{b}は先約があるから｜すまない、{b}は先約がある｜ごめんなさい、{b}は先約がありますから」――{b}が「え？」と見上げると、{a}は目を逸らしたまま言った。「……私が、誘うつもりだったから。ずっと前から｜……私が、誘うつもりだった。ずっと前から｜……ずっと前から、私が誘うつもりだったんです」――{b}は少し黙って、「……遅いよ｜……遅い｜……遅いです」と笑った。その目は、少し潤んでいた。|{c}が離れた隙に、{a}は{b}の隣に滑り込んだ。「さっきの、行くの？｜さっきのに、行くのか？｜さっきの、行くんですか？」「……どうしようかなって｜……どうしようかと考えている｜……どうしようかなと思っています」「行かないでほしい。……好きだから｜行かないでほしい。……好きだからだ｜行かないでほしいです。……好きですから」――{b}は手元のグラスを見つめたまま、小さく言った。「それ、こっちがずっと言いたかったやつ｜それは、こちらがずっと言いたかったことだ｜それ、こちらがずっと言いたかったことです」'),
stall:L('{a}は何か言おうとして、結局、グラスの中身を飲み干しただけだった。{b}は、{a}が引き止めてくれないことに、少しだけ傷ついていた。|{a}は「よかったじゃん｜よかったな｜よかったですね」と笑ってみせた。{b}も「でしょ｜だろう｜でしょう」と笑った。二人とも、ひどく下手な笑い方だった。|{a}はその場を離れた。{b}は{c}の話に相槌を打ちながら、去っていく{a}の背中ばかり見ていた。'),
after:L('お互いに「何とも思われていない」と思い込んでいた時間を数えて、二人は同時に吹き出した。|{c}は、ようやくくっついた二人を見て、「長かった……｜＝｜長かったです……」と心の底から呟いた。|{a}と{b}は、それまでのすれ違いを一つずつ答え合わせした。どれも、全部、勘違いだった。')
};
function sc(ctx,tbl){return tbl[ctx.scen.id]||tbl.any;}
function bump(ctx,a,b){var pf=ctx.pair(a,b);pf.pn=(pf.pn||0)+1;return pf;}
function mk(id,cat,w,when,run){return{id:id,cat:cat,scope:'pair',mini:true,sig:true,when:when,w:w,run:run};}
var LIST=P.EVENTS=[
mk('pn_glance','romance',function(ctx,a){return 1.8+a.tr.ac*0.5;},
function(ctx,a,b){return P.is(ctx,a,b)&&(ctx.pair(a,b).pnGl||0)<3;},
function(ctx,a,b){
var pf=bump(ctx,a,b);pf.pnGl=(pf.pnGl||0)+1;
ctx.mod2(a,b,{att:3},{att:3});
return{text:fill(ctx.pick(sc(ctx,D.glance)),{a:a.name,b:b.name}),why:WHY(a,b)};
}),
mk('pn_almost','romance',function(ctx,a){return 1.5+a.tr.honesty*0.4+a.tr.ac*0.4;},
function(ctx,a,b){return P.is(ctx,a,b)&&(ctx.pair(a,b).pnAl||0)<2;},
function(ctx,a,b){
var pf=bump(ctx,a,b);pf.pnAl=(pf.pnAl||0)+1;
ctx.stress(a,4);ctx.stress(b,4);ctx.mod2(a,b,{att:3},{att:3});
return{text:fill(ctx.pick(D.almost),{a:a.name,b:b.name}),why:WHY(a,b)+'／どちらも、あと一言が言えなかった',mag:18};
}),
mk('pn_misread','romance',function(ctx,a){return 1.2+a.tr.ac*0.4+a.tr.jealous*0.4;},
function(ctx,a,b){return P.is(ctx,a,b)&& !ctx.pair(a,b).pnMr&& !!anyOther(ctx,a,b);},
function(ctx,a,b){
var c=confidant(ctx,a,b)||anyOther(ctx,a,b),pf=bump(ctx,a,b);pf.pnMr=true;
ctx.stress(a,8);
return{text:fill(ctx.pick(D.misread),{a:a.name,b:b.name,c:c.name}),why:WHY(a,b)+'／'+a.name+'は、'+b.name+'の想う相手を'+c.name+'だと勘違いした',mag:20,with:[c]};
}),
mk('pn_jealous','romance',function(ctx,a){return 1.0+a.tr.jealous*0.6;},
function(ctx,a,b){return P.is(ctx,a,b)&& !ctx.pair(a,b).pnJe&& !!anyOther(ctx,a,b)&&(!HK.Obsess|| !HK.Obsess.jealOk||HK.Obsess.jealOk(ctx,a,b));},
function(ctx,a,b){
var c=anyOther(ctx,a,b),pf=bump(ctx,a,b);pf.pnJe=true;
ctx.stress(a,6);ctx.stress(b,6);ctx.mod2(a,b,{att:2},{att:2});
return{text:fill(ctx.pick(D.jealous),{a:a.name,b:b.name,c:c.name}),why:WHY(a,b)+'／どちらも、相手が'+c.name+'を想っていると思い込んだ',mag:18,with:[c]};
}),
mk('pn_consult','bond',function(){return 1.4;},
function(ctx,a,b){return P.is(ctx,a,b)&& !ctx.pair(a,b).pnCo&& !!confidant(ctx,a,b);},
function(ctx,a,b){
var c=confidant(ctx,a,b),pf=bump(ctx,a,b),m={a:a.name,b:b.name,c:c.name};
pf.pnCo=true;pf.pnHint=ctx.rng()<0.6;
ctx.mod(a,c,{trust:5});ctx.mod(b,c,{trust:5});
return{text:fill(ctx.pick(D.consult),m)+(pf.pnHint?fill(ctx.pick(D.consultHint),m):''),why:WHY(a,b)+'／'+c.name+'だけが、二人の気持ちを知ってしまった',mag:24,with:[c]};
}),
mk('pn_joke','romance',function(ctx,a){return 1.0+a.tr.fc*0.5;},
function(ctx,a,b){return P.is(ctx,a,b)&& !ctx.pair(a,b).pnJo;},
function(ctx,a,b){
var pf=bump(ctx,a,b);pf.pnJo=true;
ctx.mod2(a,b,{att:4},{att:4});
return{text:fill(ctx.pick(D.joke),{a:a.name,b:b.name}),why:WHY(a,b)+'／本気の言葉が、冗談として流れていった',mag:18};
}),
mk('pn_rival','romance',function(ctx){return ctx.scen.id==='goukon'?4:0.8;},
function(ctx,a,b){return P.is(ctx,a,b)&& !ctx.pair(a,b).pnRv&& !!suitor(ctx,a,b);},
function(ctx,a,b){
var pf=bump(ctx,a,b),c=suitor(ctx,a,b),m={a:a.name,b:b.name,c:c.name};
pf.pnRv=true;
ctx.mod(c,b,{att:6});ctx.stress(a,10);
var shy=function(x){return x.tr.ac>0.6&&x.tr.fc<0.45;};
var p=shy(a)&&shy(b)?0.22:shy(a)?0.33:0.46;
var open=fill(ctx.pick(sc(ctx,D.approach)),m);
if(ctx.rng()<p&&HK.canLove(a,b)&&HK.canLove(b,a)&&(!HK.Poly||HK.Poly.canTry(ctx,a,b))){
pf.couple=true;pf.pnDone=true;
ctx.mod2(a,b,{att:14,aff:12,trust:10},{att:14,aff:12,trust:10});
ctx.stress(a,-14);ctx.stress(b,-10);
return{text:open+fill(ctx.pick(D.rush),m),why:WHY(a,b)+'／'+c.name+'が'+b.name+'に近づいたのを見て、'+a.name+'は焦って想いを口にした。両片想いが、両想いになった',mag:44,with:[c]};
}
ctx.stress(b,6);
return{text:open+fill(ctx.pick(D.stall),m),why:WHY(a,b)+'／'+c.name+'が'+b.name+'に近づいた。'+a.name+'は焦ったが、言えなかった'+(shy(a)?'（控え目な性格）':''),mag:26,with:[c]};
}),
mk('pn_confess','romance',function(ctx,a,b){var pf=ctx.pair(a,b);return 0.4+(pf.pn||0)*0.6+(pf.pnHint?1.2:0)+a.tr.honesty*0.4+a.tr.impulse*0.3+a.stress/200;},
function(ctx,a,b){var pf=ctx.pair(a,b);return P.is(ctx,a,b)&&(pf.pn||0)>=2&&HK.canLove(a,b)&&HK.canLove(b,a)&&(!HK.Poly||HK.Poly.canTry(ctx,a,b));},
function(ctx,a,b){
var pf=ctx.pair(a,b),c=confidant(ctx,a,b),m={a:a.name,b:b.name,c:c?c.name:''};
pf.couple=true;pf.pnDone=true;
ctx.mod2(a,b,{att:14,aff:12,trust:10},{att:14,aff:12,trust:10});
ctx.stress(a,-10);ctx.stress(b,-10);
var aft=D.after.filter(function(t){return c||t.indexOf('{c}')<0;});
return{text:fill(sc(ctx,D.confessAt),m)+fill(ctx.pick(D.confess),m)+fill(ctx.pick(aft),m),why:WHY(a,b)+'／すれ違いを'+(pf.pn||0)+'回重ねて、'+a.name+'が先に言った。両片想いが、ようやく両想いになった',mag:44,with:c&&pf.pnCo?[c]:null};
})
];
['goukon','classroom','island','whiteroom'].forEach(function(id){if(HK.addMini)HK.addMini(id,LIST);});
var ZC=LIST.map(function(e){var e2={};for(var k in e)e2[k]=e[k];e2.mini=false;return e2;});
HK.atScen('zombie',function(){var Z=HK.ZB;if(Z&&Z.scen)HK.addTo(Z.scen.events,ZC);});
})();
});
;
/* ==== js/heartbreak.js ==== */
HK.Load.def(167,'js/heartbreak.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK)return;
function L(s){return s.split('|');}
function fill(t,m){return t.replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function alive(c){return c&&c.alive!==false&& !c.out;}
function has(ctx,a,b,ty){return HK.Ties?HK.Ties.has(ctx,a,b,ty):null;}
function couple(ctx,a,b){return!!ctx.pair(a,b).couple|| !!(has(ctx,a,b,'lover')||has(ctx,a,b,'mate')||has(ctx,a,b,'fated'));}
function marked(a,b){return!!((a.ng&&a.ng.indexOf(b.i)>=0)||(b.ng&&b.ng.indexOf(a.i)>=0));}
function longs(ctx,a,b){
if(!alive(a)|| !b||a===b||marked(a,b)||ctx.pair(a,b).kin)return false;
if(HK.lockOut(a,b))return false;
var b0={};for(var k in b)b0[k]=b[k];b0.lock=null;b0.locks=null;b0.ng=[];
if(!HK.canLove(a,b0))return false;
return!!(HK.Ties&&HK.Ties.from(ctx,a,b,'crush'))||ctx.R(a,b).att>=50;
}
function rivalOf(ctx,a,b,ok){
var cs=ctx.chars.filter(function(c){return c!==a&&c!==b&&alive(c)&&(couple(ctx,b,c)||HK.lockTo(b,c))&&(!ok||ok(c));});
if(cs.length<2)return cs[0]||null;
var cp=cs.filter(function(c){return couple(ctx,b,c);});
if(cp.length)cs=cp;
return cs[((ctx.stepIndex||0)+a.i)%cs.length];
}
function lockNm(ctx,b,c){var L=HK.lockPeople(ctx.chars,b).filter(alive);return L.length>1&&L.indexOf(c)>=0?L.map(function(x){return x.name;}).join('・'):c.name;}
function rejected(ctx,a,b){var pf=ctx.pair(a,b);return!!pf.uconf&& !pf.couple;}
function forceful(a){var t=a.tr;return t.aggr>0.55||(t.cp>0.6&&t.impulse>0.5)||(t.impulse>0.65&&t.ac<0.4);}
function friendOf(ctx,a,b,c){
var best=null,bv=12;
ctx.others(a).forEach(function(d){
if(d===b||d===c|| !alive(d))return;
var v=ctx.R(d,a).aff+ctx.R(d,a).trust*0.5;
if(v>bv){bv=v;best=d;}
});
return best;
}
function sc(ctx,tbl){return tbl[ctx.scen.id]||tbl.any;}
var D=HK.HEARTBREAK={
news:{
goukon:L('{b}と{c}が、テーブルの下で手を繋いでいるのが見えた。{a}はグラスに残った酒を一息に飲み干した。味は、しなかった。|店を出る前、{b}が{c}の腕に自分の腕を絡めた。「この二人、付き合うことになったんだって」と誰かが囃した。{a}は笑って拍手をした。手のひらが、やけに痛かった。|{c}が{b}の耳元で何か囁き、{b}が嬉しそうに頷いた。それだけで、{a}にはすべて分かった。'),
classroom:L('昼休み、{b}と{c}が付き合い始めたという噂が、教室じゅうを駆け巡った。{a}は弁当の蓋を閉めた。もう、一口も入らなかった。|放課後、昇降口で{b}と{c}が並んで帰っていくのが見えた。{a}は靴を履き替える手を止めて、二人の背中が見えなくなるまで動けなかった。|{b}のスマホの待ち受けが、{c}との写真に変わっていた。{a}は見なかったふりをして、窓の外を眺めた。'),
island:L('朝、{b}と{c}が同じ寝床から出てくるのを、{a}は見てしまった。{a}は何も言わずに、薪を拾いに森へ入った。|焚き火の向こうで、{b}が{c}の肩に頭を預けていた。{a}は火の粉を見つめたまま、胸の奥が焼けるのを黙って耐えた。|{c}が{b}の髪についた砂を払ってやっていた。その手つきの優しさに、{a}はもう自分の入る場所がないことを知った。'),
whiteroom:L('{b}と{c}が、部屋の隅で額を寄せ合って笑っていた。逃げ場のない白い部屋で、{a}は目を逸らす場所さえ見つけられなかった。|{b}が{c}の手を取り、「出られたら、一緒にいよう｜＝｜出られたら、一緒にいましょう」と言うのが聞こえた。{a}は膝を抱えて、壁の継ぎ目を数え続けた。|{c}が{b}を抱き寄せた。{b}は少しも嫌がらなかった。{a}は、二人がそういう仲になったことを、その瞬間に知った。'),
zombie:L('見張りの交代のとき、{b}と{c}が指を絡めて眠っているのを、{a}は見てしまった。{a}は銃を握り直して、窓の外の暗がりだけを見つめた。|「明日も一緒にいよう｜＝｜明日も一緒にいましょう」――{b}が{c}にそう言うのが、薄い壁越しに聞こえた。{a}は、自分の毛布を頭までかぶった。|{c}が怪我をした{b}を背負って戻ってきた。{b}が{c}の首に回した腕を、{a}はいつまでも見ていた。'),
omega:L('{b}のうなじに、{c}の噛み跡を見つけた。{a}は思わず目を伏せた。もう、自分が入り込める場所はなかった。|{b}と{c}が、同じ匂いをまとって部屋から出てきた。{a}は何も気づかないふりをして、挨拶だけをした。|{c}の隣で、{b}が見たことのない顔で笑っていた。{a}はその笑顔を、遠くから見ていることしかできなかった。'),
any:L('{b}と{c}が恋人になったと知ったとき、{a}は「よかったね｜よかったな｜よかったですね」と笑った。笑えている自分が、少しだけ怖かった。|{b}が{c}の隣で幸せそうにしているのを見て、{a}はそっとその場を離れた。誰にも、顔を見られたくなかった。')
},
lockNews:L('{b}の目は、いつも{c}だけを追っていた。どれだけ近くにいても、自分は一度もその目に映っていない――{a}はそれを、とうとう認めるしかなかった。|{a}が冗談めかして{b}を誘うと、{b}は迷いもせずに首を振った。「ごめん。{c}以外は、考えたことない｜すまない。{c}以外は、考えたことがない｜ごめんなさい。{c}以外は、考えたことがありません」――その言葉には、少しの隙間もなかった。|{b}が{c}の話をするときだけ、声の温度が変わることに、{a}はずっと前から気づいていた。気づかないふりをするのも、もう限界だった。'),
alone:L('{a}は誰もいないところまで歩いていって、そこでようやく泣いた。声を殺すのが、思っていたより難しかった。|{a}は何事もなかったように皆と話し、笑った。ただ、{b}の方だけは一度も見なかった。|{a}は、{b}にもらった何でもない言葉を、ひとつずつ思い出していた。どれも、もう意味を持たなかった。|夜、{a}は寝つけずに天井を見ていた。「好きだった｜＝｜好きでした」と口の中で言ってみると、思っていたより胸が痛んだ。'),
aloneAt:{
goukon:'帰りの電車の窓に映る自分の顔を、{a}はぼんやり眺めていた。',
classroom:'{a}は屋上に出て、フェンスにもたれた。',
island:'{a}は誰もいない浜辺に座って、波が足を洗うのに任せていた。',
whiteroom:'{a}は壁の方を向いて横になり、毛布を頭までかぶった。',
zombie:'{a}は見張りを買って出て、ひとりで暗い通りを見下ろしていた。',
omega:'{a}は抑制剤の小瓶を指で転がしながら、ひとりで窓の外を見ていた。',
any:''
},
comfort:L('{d}は何も訊かずに、{a}の隣に座った。しばらくして、{a}の肩が小さく震えはじめた。{d}は、それが止まるまで黙ってそこにいた。|{d}は{a}に温かい飲み物を差し出した。「無理して笑わなくていいよ｜無理して笑わなくていい｜無理して笑わなくていいですよ」――{a}は受け取ったまま、しばらく顔を上げられなかった。|「見る目ないな、あいつ｜見る目がないな、あいつは｜あの人、見る目がないですね」{d}がわざと明るく言うと、{a}は泣き笑いの顔で「そうでもないよ｜そうでもない｜そうでもないですよ」と首を振った。|{d}は{a}の背中を、子どもをあやすように軽く叩いた。{a}は「……ありがと｜……ありがとう｜……ありがとうございます」とだけ言って、{d}の肩に額を預けた。'),
force:L('{a}は{b}の手首を掴んで、壁際に押しつけた。「{c}なんかより、私の方がずっと{b}を見てきた。……こっちを見て｜{c}なんかより、私の方がずっと{b}を見てきた。……こっちを見ろ｜{c}なんかより、私の方がずっと{b}を見てきました。……こっちを見てください」――{b}が身をすくめた。|{a}は{b}の行く手を塞いだ。「{c}のどこがいいの。私にしなよ｜{c}のどこがいい。私にしろ｜{c}のどこがいいんですか。私にしてください」――{b}は首を振ったが、{a}は掴んだ腕を離さなかった。|{a}は{b}を人目のないところへ引っ張っていった。「認めない。{b}は、私のものになるはずだった｜＝｜認めません。{b}は、私のものになるはずでした」――その目は、もう冗談を言っていなかった。'),
block:L('「その手、離せ｜その手を離せ｜その手を離してください」――{c}が二人のあいだに割って入った。{c}は{b}を背中にかばい、{a}をまっすぐに睨んだ。{a}は手を離したが、{c}から目を逸らさなかった。|{c}が{a}の腕を掴んで、{b}から引き剥がした。「{b}が嫌がってるの、分からない？｜{b}が嫌がっているのが、分からないのか？｜{b}が嫌がっているのが、分かりませんか？」――{b}は{c}の背中にしがみついた。{a}は唇を噛んで、二人に背を向けた。|駆けつけた{c}が、{b}を引き寄せた。{b}は{c}の胸に顔を埋めて、震えていた。その姿を見て、{a}はようやく、自分が何をしたのかに気づいた。'),
letgo:L('{b}と{c}が並んで笑っているのを見ても、{a}の胸はもう、前ほどは痛まなかった。「お幸せに」と小さく呟いて、{a}は自分の場所へ戻った。|{a}は{b}への想いを、心のいちばん奥の引き出しにしまった。捨てることはできなかった。でも、しまうことはできた。|ある朝、{a}は{b}のことを考えずに目を覚ましている自分に気づいた。少しだけ寂しくて、少しだけほっとした。')
};
function mk(id,cat,w,when,run){return{id:id,cat:cat,scope:'pair',mini:true,sig:true,when:when,w: /^hb_(?:comfort|letgo)$/.test(id)?w:function(ctx,a,b){return w(ctx,a,b)*HK.Dark.f(ctx,'heartbreak');},run:run};}
var LIST=HK.Heartbreak=[
mk('hb_news','solo',function(){return 4;},
function(ctx,a,b){return longs(ctx,a,b)&& !ctx.pair(a,b).hbNews&& !couple(ctx,a,b)&& !!rivalOf(ctx,a,b);},
function(ctx,a,b){
var pf=ctx.pair(a,b),c=rivalOf(ctx,a,b),lock= !couple(ctx,b,c)&&HK.lockTo(b,c),m={a:a.name,b:b.name,c:lock?lockNm(ctx,b,c):c.name};
pf.hbNews=ctx.stepIndex;pf.hbBy=c.i;
if(HK.Emo)HK.Emo.bump(ctx,a,{grief:30,shame:12},'失恋');
ctx.stress(a,18);ctx.mod2(a,b,{att: -8},{});ctx.mod(a,c,{ten:8});
return{text:fill(ctx.pick(lock?D.lockNews:sc(ctx,D.news)),m),why:a.name+'は'+b.name+'を想っていた（惹かれ '+Math.round(ctx.R(a,b).att+8)+'）。'+(lock?b.name+'の心は、'+m.c+'にしか向いていない（恋愛相手の固定）':b.name+'は'+c.name+'と恋人になった')+'――失恋',mag:30,with:[b,c]};
}),
mk('hb_alone','solo',function(){return 3;},
function(ctx,a,b){var pf=ctx.pair(a,b);return alive(a)&&(rejected(ctx,a,b)||pf.hbNews!=null)&& !pf.hbAlone&& !a.flags.unreqPersist;},
function(ctx,a,b){
var pf=ctx.pair(a,b),m={a:a.name,b:b.name};
pf.hbAlone=true;ctx.stress(a,10);
return{text:fill(sc(ctx,D.aloneAt),m)+fill(ctx.pick(D.alone),m),why:a.name+'の失恋（'+(pf.hbNews!=null?b.name+'にはほかに想う人がいた':b.name+'に告白して、断られた')+'）',mag:20};
}),
mk('hb_comfort','help',function(ctx,a){return 2.4+a.stress/80;},
function(ctx,a,b){var pf=ctx.pair(a,b);return alive(a)&&(pf.hbAlone||pf.hbNews!=null)&& !pf.hbComf&& !!friendOf(ctx,a,b,pf.hbBy!=null?ctx.chars[pf.hbBy]:null);},
function(ctx,a,b){
var pf=ctx.pair(a,b),d=friendOf(ctx,a,b,pf.hbBy!=null?ctx.chars[pf.hbBy]:null),m={a:a.name,b:b.name,d:d.name};
pf.hbComf=true;ctx.stress(a,-12);ctx.mod2(a,d,{trust:10,aff:8},{aff:6});
return{text:fill(ctx.pick(D.comfort),m),why:d.name+'は、'+a.name+'の失恋に気づいていた（'+d.name+'から'+a.name+'への好意 '+Math.round(ctx.R(d,a).aff)+'）',mag:20,with:[d]};
}),
mk('hb_force','conflict',function(ctx,a){return 3+a.tr.aggr*2+a.tr.impulse;},
function(ctx,a,b){
var pf=ctx.pair(a,b);
if(pf.hbForce||pf.hbNews==null|| !forceful(a)|| !alive(b))return false;
var c=rivalOf(ctx,a,b,function(x){return ctx.others(a).indexOf(x)>=0;});
return!!c&&alive(c)&&ctx.R(a,b).att>=30;
},
function(ctx,a,b){
var pf=ctx.pair(a,b),c=rivalOf(ctx,a,b,function(x){return ctx.others(a).indexOf(x)>=0;}),m={a:a.name,b:b.name,c:c.name};
pf.hbForce=true;
ctx.mod2(a,b,{att: -6},{trust: -18,aff: -12,ten:14});
ctx.mod2(a,c,{ten:20},{ten:22,aff: -10});
ctx.mod2(b,c,{trust:12,att:6},{trust:6});
ctx.stress(a,12);ctx.stress(b,14);
return{text:fill(ctx.pick(D.force),m)+fill(ctx.pick(D.block),m),why:a.name+'は失恋を受け入れられず、'+b.name+'に迫った（攻撃性・衝動性）。恋敵の'+c.name+'が阻んだ',mag:34,with:[b,c]};
}),
mk('hb_letgo','solo',function(){return 1.6;},
function(ctx,a,b){var pf=ctx.pair(a,b);return alive(a)&&pf.hbNews!=null&& !pf.hbLet&&ctx.stepIndex-pf.hbNews>=2&&a.stress<55;},
function(ctx,a,b){
var pf=ctx.pair(a,b),c=pf.hbBy!=null?ctx.chars[pf.hbBy]:null,m={a:a.name,b:b.name,c:c?c.name:''};
pf.hbLet=true;ctx.mod2(a,b,{att: -14,aff:4},{});if(c)ctx.mod(a,c,{ten: -8});
return{text:fill(ctx.pick(D.letgo),m),why:a.name+'は、'+b.name+'への想いに区切りをつけはじめた',mag:16};
})
];
['goukon','classroom','island','whiteroom','omega'].forEach(function(id){if(HK.addMini)HK.addMini(id,LIST);});
var ZC=LIST.map(function(e){var e2={};for(var k in e)e2[k]=e[k];e2.mini=false;return e2;});
HK.atScen('zombie',function(){var Z=HK.ZB;if(Z&&Z.scen)HK.addTo(Z.scen.events,ZC);});
})();
});
;
/* ==== js/unlike.js ==== */
HK.Load.def(168,'js/unlike.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK|| !HK.COMMON|| !HK.addTo)return;
var U=HK.Unlike=HK.Unlike||{};
function L(s){return s.split('|');}
var PK=['proud','stern','tsun','gentle','devoted','cool','free','shy','polite'];
function per(c){
var k=c&&c.persona;
if(PK.indexOf(k)>=0)return k;
var b=c&&c.tone&&HK.toneOpt?HK.toneOpt(c.tone,'base'):null;
if(PK.indexOf(b)>=0)return b;
k=c&&HK.personaOf?HK.personaOf(c):'gentle';
return PK.indexOf(k)>=0?k:'gentle';
}
function trOf(c){return(c&&c.tr)||(c&&c.eg&&HK.traits?HK.traits(c.eg):HK.traits({}));}
function isCtx(x){return!!(x&&x.R&&x.pair&&x.chars);}
function here(c){return!!c&&(HK.State&&HK.State.here?HK.State.here(c):c.alive!==false);}
function pc(v){return Math.round((v||0)*100);}
function h01(){
var h=2166136261;
for(var i=0;i<arguments.length;i++){h^=(arguments[i]|0)>>>0;h=Math.imul(h,16777619)>>>0;h^=h>>>13;}
h=Math.imul(h^(h>>>16),2246822507)>>>0;h=Math.imul(h^(h>>>13),3266489909)>>>0;h^=h>>>16;
return(h>>>0)/4294967296;
}
function fill(t,m){return String(t).replace(/\{(a|b|u|x|p|q)\}/g,function(s,k){var v=m[k];return v==null?s:typeof v==='string'?v:v.name;});}
function pickOf(X,arr){
if(!arr|| !arr.length)return'';
if(isCtx(X))return X.pick(arr);
if(HK.Story&&HK.Story.pick&&X&&X.recent)return HK.Story.pick(X,arr);
return arr[Math.floor(X.rng()*arr.length)];
}
U.expect=function(x){return x>0?2.4*Math.pow(x/0.4,2):0;};
U.pStep=function(x,n){return Math.min(0.9,U.expect(x)/Math.max(1,n||8));};
U.cap=function(x){return x>=0.7?3:2;};
U.TH=function(x){return x>=0.8?0.5:0.58;};
function chaosOf(X){
if(isCtx(X))return X.chaos||0;
var v=X&&X.env&&X.env.chaos;
return v==null||v===''?0.4: +v/100;
}
U.chaosOf=chaosOf;
function st(X){
if(X._unl)return X._unl;
var s=X._unl={used:{},cnt:{},log:[],tokAt: -1,tok:false,done:false,calls:0,n:0};
if(isCtx(X)){
s.salt=(X.seed|0)^0x5bd1e995;
try{s.nSteps=X.scen&&X.scen.steps?X.scen.steps(X.env).length:8;}catch(e){s.nSteps=8;}
}else s.salt=Math.floor(X.rng()*1e9);
return s;
}
U.state=st;
function tiesOf(X,a,b){
if(isCtx(X))return HK.Ties&&X.tiesAll?HK.Ties.all(X,a,b):[];
return(X.ties||[]).filter(function(t){return t&&((t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i));});
}
function kinNo(X,a,b){
if(isCtx(X))return!!X.pair(a,b).kin;
return tiesOf(X,a,b).some(function(t){return HK.tieNoLove&&HK.tieNoLove(t);});
}
function blocked(X,a,b){
if(!a|| !b||a===b|| !here(a)|| !here(b))return true;
if(a.flags&&a.flags.caged!=null)return true;
if(b.flags&&b.flags.caged!=null)return true;
if(tiesOf(X,a,b).some(function(t){return t.type==='apathy'||t.type==='fear';}))return true;
if(HK.Avoid&&HK.Avoid.of&&HK.Avoid.of(X,a,b))return true;
return false;
}
function related(X,a,b){
if(tiesOf(X,a,b).length)return 3;
if(isCtx(X)){
var ab=X.R(a,b),ba=X.R(b,a);
return ab.att>12||ba.att>12||Math.abs(ab.aff)>20||Math.abs(ba.aff)>20||ab.ten>20?2:1;
}
var k=a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i,d=X.relD&&X.relD[k];
return d!=null&&Math.abs(d)>=0.12?2:1;
}
U.related=related;
function romOK(X,a,b){
if(!a|| !b||a===b|| !HK.canLove|| !HK.canLove(a,b)|| !HK.canLove(b,a))return false;
if((HK.ngPair&&HK.ngPair(a,b))||(HK.noLovePair&&HK.noLovePair(a,b))||kinNo(X,a,b))return false;
if(HK.Poly&&HK.Poly.faithNG&&(HK.Poly.faithNG(a,b)||HK.Poly.faithNG(b,a)))return false;
if(HK.Avoid&&HK.Avoid.of&&(HK.Avoid.of(X,a,b)||HK.Avoid.of(X,b,a)))return false;
if(isCtx(X))return X.romanceOk([a,b])&&X.romanceOk([b,a]);
return!(X.env&&X.env.romance!=null&& +X.env.romance===0);
}
U.romOK=romOK;
function sexOK(X,a,b){
if(HK.SAFE_ON|| !U.R18|| !HK.State|| !HK.State.pairSex)return false;
if(!HK.State.pairSex(a,b)||(HK.sexBlocked&&HK.sexBlocked(a,b)))return false;
if(kinNo(X,a,b)||(HK.noLovePair&&HK.noLovePair(a,b)))return false;
return!(HK.Pos&&HK.Pos.okSex&& !HK.Pos.okSex(a,b));
}
U.sexOK=sexOK;
var F=U.FLIPS=[
{k:'jeal',name:'嫉妬しない人の嫉妬',noun:'やきもち',usual:L('ふだんは人が誰と親しくしても気にしない|やきもちとは縁がなさそうな'),lure:1,
fit:function(t,p){return 1-t.jealous+(p==='free'||p==='gentle'||p==='cool'?0.08:0);},why:function(t){return'嫉妬・執着 '+pc(t.jealous);},
t:L('{u}{a}が、{b}がほかのことに夢中になっているのを見て、露骨に黙り込んだ。{a}「……そんなに、そっちが楽しいんだ｜……そんなに、そっちが楽しいのか｜……そんなに、そちらが楽しいんですね」――言ってから、{a}自身がいちばん驚いた顔をしていた。|'+
'{u}{a}が、{b}の袖をつかんで離さなかった。{a}「私以外とばっかり、楽しそうにしないで｜私以外とばかり、楽しそうにするな｜私以外とばかり、楽しそうにしないでください」――冗談めかすつもりだった声は、少しも冗談になっていなかった。|'+
'{b}がほかの話題で笑っただけで、{u}{a}の眉がぴくりと動いた。{a}「別に。……楽しそうで、よかったね｜別に。……楽しそうで、何よりだ｜別に。……楽しそうで、何よりです」――棘のある言い方に、{a}は自分で戸惑った。')},
{k:'blush',name:'強引な人の照れ',noun:'照れた顔',usual:L('いつもは押しが強く、人の都合などお構いなしの|強引に人を引っぱっていくのが常の'),lure:1,
fit:function(t,p){return Math.max(t.aggr,t.lead)+(p==='proud'||p==='stern'?0.12:0);},why:function(t){return'攻撃性 '+pc(t.aggr)+'・主導性 '+pc(t.lead);},
t:L('{u}{a}が、{b}と目が合ったとたん、耳まで赤くして視線を逸らした。{a}「……見ないで。今、顔が変だから｜……見るな。今、顔がおかしい｜……見ないでください。今、顔が変なので」|'+
'{b}が何気なく礼を言うと、{u}{a}は言葉に詰まった。{a}「べ、別に、大したことしてない｜べ、別に、大したことはしていない｜べ、別に、大したことはしていません」――いつもなら胸を張るところで、{a}は口元を手で隠した。|'+
'{u}{a}は、{b}の手が触れた瞬間、跳ねるように身を引いた。{a}「ご、ごめん。急だったから｜す、すまない。急だったから｜ご、ごめんなさい。急だったので」――それきり、{a}は{b}の顔をまともに見られなかった。')},
{k:'panic',name:'冷静な人の取り乱し',noun:'取り乱した姿',usual:L('どんなときも顔色ひとつ変えない|何が起きても淡々としている'),neg:1,
fit:function(t,p){return Math.max(t.cold,t.a)+(p==='cool'||p==='stern'?0.12:0);},why:function(t){return'ドライさ '+pc(t.cold)+'・A '+pc(t.a);},
t:L('{b}が指先を少し切っただけなのに、{u}{a}は血相を変えて駆け寄った。{a}「大丈夫！？　見せて、早く｜大丈夫か！？　見せろ、早く｜大丈夫ですか！？　見せてください、早く」――手当ての手つきまで震えていて、{b}のほうが{a}を落ち着かせる羽目になった。|'+
'{b}の何気ない一言に、{u}{a}がはっきりとうろたえた。{a}「え、待って、今のどういう意味？｜待て、今のはどういう意味だ？｜え、待ってください、今のはどういう意味ですか？」――手にしていたものを取り落としたことにも、{a}は気づいていなかった。|'+
'{u}{a}が、{b}の前でだけ言葉をもつれさせた。考えをまとめようとするほど、話はあちこちに飛んだ。{a}「違う、そうじゃなくて……ああ、もう、何を言ってるんだろう｜違う、そうではなく……ああ、もう、何を言っているんだ｜違うんです、そうではなくて……ああ、もう、何を言っているんでしょう」')},
{k:'amae',name:'素直でない人の甘え',noun:'甘えた声',usual:L('いつもは本音を言わずに強がってばかりの|素直に頼るということを知らない'),lure:1,
fit:function(t,p){return 1-t.honesty+(p==='tsun'||p==='proud'?0.12:0);},why:function(t){return'本音の出やすさ '+pc(t.honesty);},
t:L('{u}{a}が、{b}の肩にこつんと額を預けた。{a}「……少しだけ、こうしてていい？｜……少しだけ、こうしていていいか｜……少しだけ、こうしていてもいいですか」――{b}が驚いて見下ろしても、{a}は離れなかった。|'+
'{u}{a}が、{b}にだけ聞こえる声で言った。{a}「今日、ちょっと疲れた。……褒めて｜今日は、少し疲れた。……褒めてくれ｜今日は、少し疲れました。……褒めてください」――あまりに素直な言い方に、{b}は聞き間違いかと思った。|'+
'{u}{a}が、{b}の服の裾をそっとつまんだ。{a}「あのさ。……そばにいてくれて、ありがとう｜あのな。……そばにいてくれて、感謝している｜あの。……そばにいてくれて、ありがとうございます」――言い終えた{a}は、自分の言葉に自分で目を丸くしていた。')},
{k:'rude',name:'丁寧な人の毒舌',noun:'荒っぽい物言い',usual:L('いつも誰にでも物腰のやわらかい|人を悪く言うところなど見たことのない'),neg:1,lure:1,
fit:function(t,p){return(p==='polite'||p==='devoted'||p==='gentle'?0.55+t.np*0.3:t.np*0.45+t.ac*0.35);},why:function(t){return'NP '+pc(t.np)+'・AC '+pc(t.ac);},
t:L('{u}{a}が、{b}の言葉をばっさりと切り捨てた。{a}「は？　それ、本気で言ってる？｜は？　それは本気で言っているのか？｜は？　それ、本気でおっしゃっているんですか？」――空気が一瞬で凍りついた。いちばん驚いていたのは、言った本人だった。|'+
'{u}{a}が、{b}に向かって遠慮のない悪態をついた。{a}「ほんと、要領悪いよね｜まったく、要領が悪いな｜本当に、要領が悪いですね」――{b}は思わず{a}の顔を二度見した。|'+
'{b}の手際の悪さに、{u}{a}が舌打ちをした。{a}「いいから貸して。見てられない｜いいから貸せ。見ていられない｜いいから貸してください。見ていられません」――乱暴に言い捨ててから、{a}ははっとして口を押さえた。')},
{k:'ichizu',name:'奔放な人の一途',noun:'ひたむきな目',usual:L('いつもは気の向くまま、誰とでも軽やかに付き合う|ひとつところに落ち着いたためしのない'),rom:1,lure:1,
fit:function(t,p){return Math.max(t.impulse,t.fc)+(p==='free'?0.12:0)-0.04;},why:function(t){return'衝動性 '+pc(t.impulse)+'・FC '+pc(t.fc);},
t:L('{u}{a}が、なぜか{b}のそばから一歩も離れなかった。{a}「今は、あなたといる。ほかはいい｜＝｜今は、あなたといます。ほかはいいです」――ほかの誘いを全部断ってまで、{a}は{b}の隣を選んだ。|'+
'{u}{a}が、真顔で{b}に言った。{a}「ほかの人じゃ、だめなんだ。あなたじゃないと｜ほかの者では、だめだ。あなたでなければ｜ほかの人では、だめなんです。あなたでないと」――いつもの軽口とは、声の温度がまるで違った。|'+
'{u}{a}が、{b}のことを何度も尋ねて確かめていた。好きなもの、苦手なもの、昔の話。{a}「全部、知っておきたいの｜全部、知っておきたい｜全部、知っておきたいんです」')},
{k:'bold',name:'臆病な人の大胆',noun:'大胆なひと言',usual:L('いつもは人の顔色をうかがって一歩引いている|自分から前に出ることなどめったにない'),rom:1,lure:1,
fit:function(t,p){return t.caution+(p==='shy'||p==='devoted'?0.12:0);},why:function(t){return'慎重さ '+pc(t.caution);},
t:L('{u}{a}が、まっすぐ{b}の前に立ち、目を逸らさずに言った。{a}「あなたと、もっと話したい。今から｜あなたと、もっと話したい。今からだ｜あなたと、もっと話したいです。今から」――{b}が返事をするより先に、{a}は{b}の手を取っていた。|'+
'{u}{a}が、{b}との距離を自分から詰めた。肩が触れるほど近くで、{a}は小さく、けれどはっきりと言った。{a}「逃げないで。……今日は、私から行くから｜逃げるな。……今日は、私から行く｜逃げないでください。……今日は、私から行きますから」|'+
'{u}{a}が、{b}の耳元でささやいた。{a}「ねえ、少しだけ、二人で話そう｜なあ、少しだけ、二人で話そう｜あの、少しだけ、二人でお話ししませんか」――言った本人の膝は笑っていたが、目だけは本気だった。')},
{k:'forget',name:'几帳面な人の物忘れ',noun:'うっかりした顔',usual:L('いつもは何事もきっちり守る|約束の時間に遅れたことすらない'),neg:1,
fit:function(t,p){return t.a*0.55+t.cp*0.45+(p==='stern'||p==='cool'?0.1:0);},why:function(t){return'A '+pc(t.a)+'・CP '+pc(t.cp);},
t:L('{u}{a}が、{b}と交わした約束をすっかり忘れていた。指摘されて、{a}は目を見開いた。{a}「うそ、ほんとに？　ごめん、全然覚えてない｜まさか、本当か？　すまない、まったく覚えていない｜うそ、本当ですか？　ごめんなさい、全然覚えていません」|'+
'{u}{a}が、{b}に頼まれていたことを、きれいに忘れていた。{a}「……あれ、何か頼まれてたっけ｜……ん、何か頼まれていたか｜……あれ、何か頼まれていましたっけ」――{b}がぽかんとしているのを見て、{a}はようやく事態に気づいた。|'+
'{u}{a}が、どこか上の空だった。{b}の話に相づちを打ちながら、同じことを二度も聞き返した。{a}「ごめん、もう一回いい？　……あれ、さっきも聞いた？｜すまない、もう一度いいか？　……ん、さっきも聞いたか？｜ごめんなさい、もう一度いいですか？　……あれ、さっきも聞きましたか？」')},
{k:'chatty',name:'無口な人のおしゃべり',noun:'楽しそうな饒舌',usual:L('ふだんは必要なことしか口にしない|いるのかいないのか分からないほど静かな'),lure:1,
fit:function(t,p){return 1-t.warmth+(p==='cool'||p==='shy'?0.08:0);},why:function(t){return'人懐こさ '+pc(t.warmth);},
t:L('{u}{a}が、{b}を相手に、堰を切ったように話し続けた。子どものころの話、好きな食べ物の話、どうでもいい夢の話。{a}「それでね、そのあとがまた面白くて｜それで、そのあとがまた面白くてな｜それで、そのあとがまた面白かったんです」――{b}が相づちを打つたびに、{a}の話は止まらなくなった。|'+
'{u}{a}が、{b}の隣に座るなり、自分から話しかけた。{a}「ねえ、聞いて。ずっと話したいことがあったの｜聞いてくれ。ずっと話したいことがあった｜あの、聞いてください。ずっと話したいことがあったんです」――{b}は、{a}の声をこんなに長く聞くのは初めてだと気づいた。|'+
'{u}{a}が、{b}の何気ない質問に、驚くほど長く答えた。笑ったり、身ぶりを交えたり、ときどき自分で照れたりしながら。{b}は、{a}がこんな顔で話す人だったことを、初めて知った。')},
{k:'cold',name:'面倒見のいい人の突き放し',noun:'突き放すような横顔',usual:L('いつもは誰の世話でも焼かずにいられない|困っている人を見ると放っておけない'),neg:1,
fit:function(t,p){return t.np+(p==='gentle'||p==='devoted'?0.1:0);},why:function(t){return'NP '+pc(t.np);},
t:L('{u}{a}が、{b}の頼みを素っ気なく断った。{a}「自分でやって。私は知らない｜自分でやれ。私は知らない｜ご自分でどうぞ。私は知りません」――突き放された{b}より先に、{a}のほうが傷ついた顔をしていた。|'+
'{b}が困っているのに、{u}{a}は手を貸さなかった。{a}「たまには、甘えないで｜たまには、甘えるな｜たまには、甘えないでください」――背を向けた{a}の肩が、少しだけ震えていた。|'+
'{u}{a}が、{b}の差し出したものを受け取らずに言った。{a}「放っておいて。今は、優しくできない｜放っておいてくれ。今は、優しくできない｜放っておいてください。今は、優しくできません」')},
{k:'wagama',name:'献身的な人のわがまま',noun:'わがままな声',usual:L('いつも自分のことは後回しにして尽くす|人の望みばかり先に叶えようとする'),lure:1,
fit:function(t,p){return t.np*0.5+t.ac*0.5+(p==='devoted'||p==='polite'?0.12:0);},why:function(t){return'NP '+pc(t.np)+'・AC '+pc(t.ac);},
t:L('{u}{a}が、{b}に向かって唇を尖らせた。{a}「今は、私の言うこと聞いて。全部｜今は、私の言うことを聞け。全部だ｜今は、私の言うことを聞いてください。全部です」――{b}は、{a}が自分の望みを口にするのを初めて聞いた。|'+
'{u}{a}が、{b}の腕を引いて駄々をこねた。{a}「やだ。もう少しここにいて｜嫌だ。もう少しここにいろ｜嫌です。もう少しここにいてください」――言ってしまってから、{a}は自分の声の幼さに頬を染めた。|'+
'{u}{a}が、{b}に取っておいた分の食べ物を、黙って自分で食べてしまった。{a}「……たまには、いいでしょ｜……たまには、いいだろう｜……たまには、いいでしょう」――開き直ったような顔の裏で、{a}はひどく落ち着かなかった。')},
{k:'weak',name:'強気な人の弱音',noun:'弱音',usual:L('いつも強気で、弱みなど見せたことのない|誰に対しても一歩も引かない'),neg:1,lure:1,
fit:function(t,p){return t.cp*0.6+(1-t.ac)*0.4+(p==='proud'||p==='tsun'?0.12:0);},why:function(t){return'CP '+pc(t.cp)+'・AC '+pc(t.ac);},
t:L('{u}{a}が、{b}の前でぽつりとこぼした。{a}「……正直、ちょっと怖い｜……正直、少し怖い｜……正直、少し怖いです」――それだけ言うと、{a}はうつむいて黙り込んだ。|'+
'{u}{a}が、{b}にだけ弱音を吐いた。{a}「私、ほんとはそんなに強くないんだ｜私は、本当はそれほど強くない｜私、本当はそんなに強くないんです」――{b}は、{a}がこんなに小さな声で話すのを初めて聞いた。|'+
'{u}{a}が、{b}の隣で長いため息をついた。{a}「疲れた。……今だけ、強がるのやめていい？｜疲れた。……今だけ、強がるのをやめていいか？｜疲れました。……今だけ、強がるのをやめてもいいですか？」')}
];
var FK={};F.forEach(function(f){FK[f.k]=f;});
U.flip=function(k){return FK[k]||null;};
var GAP=U.GAP={
proud:L('いつもの不遜な物言いは、すっかり鳴りを潜めていた。|人を見下ろすような{a}の目つきが、このときばかりは揺れていた。'),
stern:L('背筋を伸ばして構える{a}の姿は、どこにも見当たらなかった。|規律を何より重んじる{a}の顔から、いつもの厳しさが抜け落ちていた。'),
tsun:L('憎まれ口ひとつ添えないあたり、どう見ても{a}らしくなかった。|いつもの意地っ張りな言い訳は、最後まで出てこなかった。'),
gentle:L('おっとりと受け流すいつもの{a}とは、まるで別人だった。|{a}の穏やかな笑みは、このときばかりはどこかに消えていた。'),
devoted:L('人のために我慢するのが当たり前だった{a}にしては、珍しいことだった。|健気に笑ってみせるいつもの{a}は、そこにいなかった。'),
cool:L('理屈で物事を片づける{a}が、自分の気持ちの名前も分からないでいた。|冷静さを失わないはずの{a}の目が、珍しく泳いでいた。'),
free:L('いつも笑い飛ばして終わらせる{a}が、このときは笑わなかった。|軽やかなはずの{a}の声が、妙に重たく響いた。'),
shy:L('いつも誰かの陰に隠れている{a}とは、まるで違って見えた。|おどおどと周りを気にするいつもの{a}は、このときだけいなかった。'),
polite:L('誰にでも丁寧な{a}の言葉遣いが、ほんの少し崩れていた。|礼儀正しい{a}が、このときばかりは取り繕うのを忘れていた。')
};
var REACT=U.REACT={
dousa:{name:'動揺した',pos:1,t:L('{b}は返す言葉を見つけられなかった。見たことのない{a}の顔が、頭から離れない。{b}「……ど、どうしたの、急に｜……ど、どうした、急に｜……ど、どうしたんですか、急に」|'+
'{b}の心臓が、妙な跳ね方をした。{b}は何でもないふりをしようとして、手にしていたものを落としかけた。|'+
'{b}はしばらく固まっていた。いつもの{a}なら、こんなことはしない。そのことが、思った以上に{b}を揺さぶった。')},
toki:{name:'ときめいた',rom:1,pos:1,t:L('{b}の胸が、とくんと鳴った。こんな{a}もいるのだと知っただけで、目の前の景色が少し違って見えた。{b}「……そういうところ、ずるい｜……そういうところは、ずるいぞ｜……そういうところ、ずるいです」|'+
'{b}は思わず、{a}から目を逸らした。頬が熱い。今の{a}を、もう少し見ていたいと思ってしまった。|'+
'{b}は口元がゆるむのを止められなかった。{b}「……今の、ちょっとかわいかった｜……今のは、少し可愛かった｜……今の、ちょっと可愛かったです」――言われた{a}が真っ赤になるのを、{b}は見逃さなかった。')},
hikare:{name:'惹かれた',rom:1,pos:1,t:L('{b}はそれからしばらく、{a}のことばかり考えていた。いつもの印象と、さっきの姿。その落差が、どうしても頭から離れなかった。|'+
'{b}は、自分の中で何かが音を立てて変わるのを感じた。これまで{a}をどう見ていたのか、もう思い出せなかった。{b}「あなたって、そんな顔もするんだ｜あなたは、そんな顔もするのか｜あなたって、そんな顔もなさるんですね」|'+
'{b}は{a}から目が離せなくなっていた。よく知っているつもりだった相手が、急に知らない人のように見えた。それが、少しも嫌ではなかった。')},
kowaku:{name:'蠱惑的に感じた',rom:1,pos:1,t:L('{b}は、ぞくりとするものを感じた。いつもと違う{a}には、目を逸らさせない妙な引力があった。{b}「……危ない人だね、あなたは｜……危ない人だな、あなたは｜……危ない方ですね、あなたは」|'+
'{b}の視線が、{a}の口元で止まった。ふだんの{a}が隠していたものを、うっかり覗いてしまった気がした。それはひどく甘い毒のようだった。|'+
'{b}は小さく息をのんだ。崩れた{a}は、整っているときよりずっと危うくて、ずっと目を引いた。もっと崩してみたい――そんな考えが浮かんで、{b}は慌てて打ち消した。')},
shinpai:{name:'心配した',t:L('{b}は眉を寄せて、{a}の顔をのぞき込んだ。{b}「大丈夫？　何かあった？｜大丈夫か？　何かあったのか？｜大丈夫ですか？　何かあったんですか？」――{a}は答えられず、{b}はそのまま隣にいることにした。|'+
'{b}は、{a}らしくないことにすぐ気づいた。何も聞かずに隣に腰を下ろし、{a}が落ち着くまで黙って待った。|'+
'{b}は{a}の手をそっと取った。{b}「無理しないで。……話したくなったら、聞くから｜無理はするな。……話したくなったら、聞く｜無理しないでください。……話したくなったら、聞きますから」')},
omoshiro:{name:'面白がった',t:L('{b}は堪えきれずに吹き出した。{b}「何それ、あなたらしくない！｜何だそれは、あなたらしくないな｜何ですか、それ。あなたらしくないですね」――笑われた{a}は、むっとしたような、ほっとしたような顔をした。|'+
'{b}はにやりと笑って、{a}の顔をしげしげと眺めた。{b}「へえ。珍しいもの見ちゃった｜ほう。珍しいものを見た｜へえ。珍しいものを見てしまいました」|'+
'{b}は面白がって、わざと{a}をつついた。{b}「もう一回やって。今の、もう一回｜もう一度やってくれ。今のを、もう一度｜もう一回やってください。今の、もう一回」――{a}は「＠{a}＠やらない｜＝｜やりません」とそっぽを向いた。')},
keikai:{name:'警戒した',t:L('{b}は一歩、身を引いた。{b}「……何を企んでるの｜……何を企んでいる｜……何を企んでいらっしゃるんですか」――いつもと違う{a}を、{b}は素直に受け取れなかった。|'+
'{b}は笑顔を作りながら、内心で身構えていた。らしくない{a}の振る舞いの裏に、何かあるのではないか。疑いは、そう簡単には消えなかった。|'+
'{b}は{a}の顔をじっと見つめ、目を細めた。{b}「どういう風の吹き回し？｜どういう風の吹き回しだ？｜どういう風の吹き回しですか？」――答えを聞いても、{b}の警戒は解けなかった。')}
};
var TAIL=U.TAIL={
proud:{pos:L('{b}は鼻を鳴らしてみせたが、耳の先が赤かった。|{b}は強気な顔を取り繕ったまま、{a}をちらりと盗み見た。'),calm:L('{b}は腕を組んで、{a}を値踏みするように眺めた。|{b}は顎を上げたまま、{a}の出方を待った。')},
stern:{pos:L('{b}は咳払いをひとつして、乱れた心を立て直そうとした。うまくはいかなかった。|{b}は唇を引き結んだが、目元の厳しさが、いつもより少しゆるんでいた。'),calm:L('{b}は黙って{a}を見守った。必要なら、すぐに手を貸すつもりだった。|{b}は眉ひとつ動かさず、しかし{a}から目を離さなかった。')},
tsun:{pos:L('{b}は何か言い返そうとして、続きを飲み込んだ。|{b}はそっぽを向いた。けれど、{a}のいる方だけは、どうしても意識してしまっていた。'),calm:L('{b}「別に、気にしてないけど｜別に、気にしてはいない｜別に、気にしてはいませんけど」――そう言いながら、{b}は何度も{a}のほうを振り返った。|{b}はぶっきらぼうに目を逸らしたが、気配だけはずっと{a}に向けていた。')},
gentle:{pos:L('{b}はふわりと笑った。その笑みの奥で、胸がいつもより速く鳴っていた。|{b}はおっとりと首をかしげたが、頬にはうっすら赤みが差していた。'),calm:L('{b}は穏やかに微笑んで、{a}の言葉の続きを待った。|{b}はのんびりと頷いた。驚いてはいたが、慌てはしなかった。')},
devoted:{pos:L('{b}は胸の前で手をぎゅっと握りしめた。{a}のこの顔を、ずっと覚えていたいと思った。|{b}は小さく頷いて、{a}の隣に一歩だけ近づいた。'),calm:L('{b}は{a}の様子をうかがいながら、そっと寄り添った。|{b}は自分にできることを探して、{a}のそばを離れなかった。')},
cool:{pos:L('{b}は表情を変えなかった。ただ、{a}を見る時間が、いつもより少し長かった。|{b}は自分の動揺を分析しようとして、すぐに諦めた。'),calm:L('{b}は冷静に{a}の様子を観察していた。原因を探るように。|{b}は短く息をついて、{a}の変化を頭の中に書き留めた。')},
free:{pos:L('{b}は「やば」と小さく呟いて、自分の頬をぱちんと叩いた。|{b}は落ち着きなく{a}の周りをうろうろした。そわそわしているのは、{b}のほうだった。'),calm:L('{b}はけらけらと笑いながらも、{a}から目を離さなかった。|{b}は身を乗り出して、{a}の顔を覗き込んだ。')},
shy:{pos:L('{b}は真っ赤になって、両手で顔を覆った。指の隙間から、まだ{a}を見ていた。|{b}はうつむいたまま、服の裾をいじっていた。'),calm:L('{b}はおろおろと{a}の前で手をさまよわせた。|{b}は小さな声で、{a}の名前を一度だけ呼んだ。')},
polite:{pos:L('{b}は丁寧に笑みを返したが、言葉が少しだけ上ずっていた。|{b}は姿勢を正したが、指先が落ち着きなく動いていた。'),calm:L('{b}は礼儀正しく一歩下がり、{a}が落ち着くのを待った。|{b}は言葉を選ぶように少し黙ってから、{a}に向き直った。')}
};
var RX=U.RX={
dousa:{why:function(){return'いつもとの落差に戸惑った';},d:0.03},
toki:{why:function(){return'意外な一面に胸が鳴った';},d:0.1},
hikare:{why:function(X,a,b,low){return'落差に惹かれた'+(low?'（もともと好意は低かった）':'');},d:0.14},
kowaku:{why:function(){return'崩れた姿を蠱惑的に感じた';},d:0.12},
shinpai:{why:function(X,a,b){return'面倒見のよさ（NP '+pc(trOf(b).np)+'）';},d:0.08},
omoshiro:{why:function(X,a,b){return'遊び心（FC '+pc(trOf(b).fc)+'）';},d:0.06},
keikai:{why:function(X,a,b){return'慎重さ '+pc(trOf(b).caution);},d: -0.08},
sosoru:{why:function(X,a,b){return'体の熱が上がった（性欲'+(HK.Pos&&HK.Pos.libOf&&HK.Pos.libOf(b)==='high'?'：強い':'')+'）';},d:0.08}
};
function affOf(X,b,a){
if(isCtx(X))return X.R(b,a).aff;
var k=a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;
return((X.relD&&X.relD[k])||0)*60;
}
function reactW(X,a,b,f,ro,so){
var t=trOf(b),p=per(b),lib=HK.Pos&&HK.Pos.libOf?HK.Pos.libOf(b):'',aff=affOf(X,b,a);
var trust=isCtx(X)?X.R(b,a).trust:aff,ten=isCtx(X)?X.R(b,a).ten:0,x=chaosOf(X);
var w={
dousa:1+t.ac*0.6,
shinpai:f.neg?0.4+t.np*1.4:0.15+t.np*0.3,
omoshiro:0.2+t.fc*1.1,
keikai:0.15+t.caution*0.6+(trust<0?0.6:0)+(ten>30?0.5:0),
toki:ro?0.55+t.ac*0.5+Math.max(0,aff)/100:0,
hikare:ro?0.5+(aff<10?0.7:0.2)+x*0.5:0,
kowaku:ro&&f.lure?0.3+t.cold*0.6+(p==='cool'||p==='proud'||p==='stern'?0.3:0):0,
sosoru:so&& !(HK.Avoid&&HK.Avoid.of&&HK.Avoid.of(X,b,a))?(lib==='high'?1.8:lib===''?0.22:0)*(U.R18&&U.R18.react?1:0):0
};
return w;
}
function pickReact(X,a,b,f,ro,so){
var w=reactW(X,a,b,f,ro,so),keys=Object.keys(w).filter(function(k){return w[k]>0;});
return HK.weighted(X.rng,keys,function(k){return w[k];});
}
U.pickReact=pickReact;
function flipFor(X,a,b,ro){
var s=st(X),used=s.used[a.i]||{},t=trOf(a),p=per(a),th=U.TH(chaosOf(X)),best=null,bv= -1;
F.forEach(function(f,j){
if(used[f.k]||(f.rom&& !ro))return;
var v=f.fit(t,p);
if(v<th)return;
v+=h01(s.salt,a.i,j,31)*0.12;
if(v>bv){bv=v;best=f;}
});
return best;
}
U.flipFor=flipFor;
function scene(X,a,b,f,ro){
var s=st(X),so=sexOK(X,a,b),rk=pickReact(X,a,b,f,ro,so),R0=REACT[rk]||(U.R18&&U.R18.react&&U.R18.react.def);
var low=affOf(X,b,a)<10,x=chaosOf(X),m={a:a,b:b,u:pickOf(X,f.usual)};
var head=fill(pickOf(X,f.t),m);
if(X.rng()<0.6)head+=fill(pickOf(X,GAP[per(a)]||GAP.gentle),m);
var body=rk==='sosoru'&&U.R18&&U.R18.react?U.R18.react(X,a,b):fill(pickOf(X,R0.t),m);
var tp=TAIL[per(b)]||TAIL.gentle,tail=fill(pickOf(X,REACT[rk]&& !REACT[rk].pos&&rk!=='dousa'?tp.calm:tp.pos),m);
var text=head+body+(rk!=='shinpai'&&X.rng()<0.7?tail:'');
var name=REACT[rk]?REACT[rk].name:'そそられた';
var why=a.name+'の「らしくない」行動：'+f.name+'（ふだんの'+f.why(trOf(a))+'／運命の揺らぎ '+pc(x)+'）。'+b.name+'は'+name+'（'+RX[rk].why(X,a,b,low)+'）';
if(!ro&&(rk==='dousa'||rk==='sosoru'))why+=(so?'／恋愛には進まない組なので、惹かれではなく体の熱に流れた':'／恋愛には進まない組なので、動揺のまま');
s.used[a.i]=s.used[a.i]||{};s.used[a.i][f.k]=1;
s.cnt[a.i]=(s.cnt[a.i]||0)+1;s.n++;
return{text:text,why:why,rk:rk,f:f,rom:ro&&(rk==='toki'||rk==='hikare'||rk==='kowaku'||rk==='sosoru'),so:so,low:low};
}
function emo(X,a,b,rk){
var E=HK.Emo;if(!E|| !E.bump)return;
E.bump(X,a,{shame:12},'らしくない振る舞い');
var d={dousa:{shame:6},toki:{joy:8,shame:6},hikare:{joy:10},kowaku:{shame:4,joy:4},shinpai:{fear:4},omoshiro:{joy:8},keikai:{fear:6},sosoru:{lust:30}}[rk];
if(d)E.bump(X,b,d,'らしくない'+a.name+'を見て');
}
function apply(ctx,a,b,sc,ro){
var rk=sc.rk,pf=ctx.pair(a,b);
if(rk==='dousa'){ctx.mod(b,a,ro?{ten:3,att:5}:{ten:4});ctx.stress(b,3);}
else if(rk==='toki'){ctx.mod(b,a,{att:10,aff:4});ctx.mod(a,b,{att:3});}
else if(rk==='hikare'){ctx.mod(b,a,sc.low?{att:14,aff:12,ten: -8}:{att:14,aff:6,ten: -4});ctx.mod(a,b,{att:4});}
else if(rk==='kowaku'){ctx.mod(b,a,{att:13,ten:2});ctx.mod(a,b,{att:3});}
else if(rk==='shinpai'){ctx.mod(b,a,{aff:5,trust:3});ctx.mod(a,b,{trust:4,aff:2});}
else if(rk==='omoshiro'){ctx.mod(b,a,{aff:4});ctx.mod(a,b,{ten:2,aff:1});}
else if(rk==='keikai'){ctx.mod(b,a,{trust: -6,ten:5});ctx.mod(a,b,{ten:2});}
else if(rk==='sosoru'){if(ro)ctx.mod(b,a,{att:8});else ctx.mod(b,a,{ten:3});}
if(ro&&(rk==='toki'||rk==='hikare'||rk==='kowaku'))pf.unlSpark={by:b.i,to:a.i,at:ctx.stepIndex,k:sc.f.k,rk:rk};
if(rk==='sosoru')pf.unlHeat={by:b.i,to:a.i,at:ctx.stepIndex,k:sc.f.k};
emo(ctx,a,b,rk);
}
var AFTER=U.AFTER={
shame:{name:'自覚して恥じた',t:L('{a}は、{b}の前で見せた自分の姿を思い出しては、何度も頭を抱えた。|{a}は{b}と顔を合わせるたびに、あのときのことを思い出して視線を泳がせた。|{a}は{b}の姿を見かけると、さりげなく向きを変えた。あのときの自分を、なかったことにしたかった。'),
line:{
proud:'{a}「さっきのは忘れて。いい？｜さっきのは忘れろ。いいな｜さっきのことは、忘れてください。いいですね」',
stern:'{a}「先ほどは見苦しいところを見せた。……すまない｜＝｜先ほどは見苦しいところをお見せしました。……すみません」',
tsun:'{a}「あ、あれは違うから！　本気にしないでよね｜あ、あれは違う！　本気にするな｜あ、あれは違いますから！　本気にしないでくださいね」',
gentle:'{a}「ごめんね、変なところ見せちゃった｜すまない、変なところを見せた｜ごめんなさい、変なところを見せてしまいました」',
devoted:'{a}「あの、さっきはごめん。もう、あんなことしないから｜あの、さっきはすまなかった。もう、あんなことはしない｜あの、さっきはごめんなさい。もう、あんなことはしませんから」',
cool:'{a}「……さっきのは、記録から消しておいて｜……さっきのは、記録から消しておいてくれ｜……さっきのは、記録から消しておいてください」',
free:'{a}「うわー、思い出すと恥ずかしい！　忘れて忘れて｜ああ、思い出すと恥ずかしい！　忘れてくれ｜うわあ、思い出すと恥ずかしいです！　忘れてください」',
shy:'{a}「ご、ごめんね……あんなの、私じゃないみたいで｜す、すまない……あんなのは、私ではないみたいで｜ご、ごめんなさい……あんなの、私ではないみたいで」',
polite:'{a}「さっきは、失礼なことをした。忘れてほしい｜先ほどは、失礼をした。忘れてほしい｜先ほどは、大変失礼しました。どうか忘れてください」'
}},
own:{name:'開き直った',t:L('{a}は、もう取り繕おうとはしなかった。あのときの自分も自分だと、どこかで腹をくくっていた。|{a}は{b}と目が合うと、照れもせずに見つめ返した。|{a}は、あれ以来、{b}の前で無理に「いつもの自分」を演じなくなった。'),
line:{
proud:'{a}「何、文句ある？　あれも私だから｜何だ、文句があるのか？　あれも私だ｜何か、ご不満でも？　あれも私ですから」',
stern:'{a}「言い訳はしない。あれも、私の本心だ｜＝｜言い訳はしません。あれも、私の本心です」',
tsun:'{a}「……べ、別に、撤回はしないから｜……べ、別に、撤回はしない｜……べ、別に、撤回はしませんから」',
gentle:'{a}「たまには、ああいう私もいいでしょ？｜たまには、ああいう私もいいだろう？｜たまには、ああいう私もいいでしょう？」',
devoted:'{a}「たまには、私だってわがまま言いたいの｜たまには、私だってわがままを言いたい｜たまには、私だってわがままを言いたいんです」',
cool:'{a}「考えた結果、あれも私の一部だと結論した｜＝｜考えた結果、あれも私の一部だと結論しました」',
free:'{a}「いいじゃん、たまには！　またやるかもね｜いいだろう、たまには！　またやるかもしれない｜いいじゃないですか、たまには！　またやるかもしれません」',
shy:'{a}「あ、あれも、本当の私なの……たぶん｜あ、あれも、本当の私だ……たぶん｜あ、あれも、本当の私です……たぶん」',
polite:'{a}「見苦しかったかもしれないけど、後悔はしてない｜見苦しかったかもしれないが、後悔はしていない｜お見苦しかったかもしれませんが、後悔はしていません」'
}},
forget:{name:'覚えていなかった',t:L('{a}は、あのときのことをまるで覚えていなかった。{b}が話を振っても、きょとんと首をかしげるばかりだった。|{b}がそれとなく例の件に触れると、{a}は不思議そうに瞬きをした。どうやら本当に、何も覚えていないらしい。|{a}は、すっかりいつもどおりの{a}に戻っていた。あの「らしくない」{a}は、まるで最初からいなかったかのようだった。'),
line:{
proud:'{a}「は？　何の話？｜は？　何の話だ｜はい？　何のお話ですか」',
stern:'{a}「何のことだ。覚えがない｜＝｜何のことでしょう。覚えがありません」',
tsun:'{a}「な、何よ。そんなこと、言ってない｜な、何だ。そんなことは、言っていない｜な、何ですか。そんなこと、言っていません」',
gentle:'{a}「あら、そんなことあった？｜ほう、そんなことがあったか？｜あら、そんなことがありましたか？」',
devoted:'{a}「え、私、何かしちゃった？｜ん、私は何かしたか？｜え、私、何かしてしまいましたか？」',
cool:'{a}「記憶にない。誰かと勘違いしてない？｜記憶にない。誰かと勘違いしていないか｜記憶にありません。誰かと勘違いしていませんか」',
free:'{a}「え、ほんと？　全然覚えてないや｜何、本当か？　まったく覚えていない｜え、本当ですか？　全然覚えていません」',
shy:'{a}「わ、私、そんなことを……？｜わ、私が、そんなことを……？｜わ、私、そんなことをしてしまったんですか……？」',
polite:'{a}「申し訳ないけど、覚えがなくて｜申し訳ないが、覚えがない｜申し訳ありませんが、覚えがなくて」'
}}
};
function afterKind(X,a){
var t=trOf(a),p=per(a),x=chaosOf(X);
if(x>=0.7&&X.rng()<0.35)return'forget';
var own=t.honesty*0.6+t.fc*0.4+(p==='free'||p==='proud'?0.2:0),shame=t.ac*0.6+(1-t.honesty)*0.3+(p==='shy'||p==='tsun'||p==='stern'||p==='polite'?0.2:0);
return X.rng()*(own+shame)<own?'own':'shame';
}
function afterScene(X,a,b,P){
var k=afterKind(X,a),A=AFTER[k],m={a:a,b:b};
var t=fill(pickOf(X,A.t),m)+fill(A.line[per(a)]||A.line.gentle,m);
return{k:k,text:t,why:a.name+'の後日談：「らしくない」行動（'+FK[P.k].name+'）のあと、'+A.name+(k==='forget'?'（運命の揺らぎ '+pc(chaosOf(X))+'）':'')};
}
var SPARK=U.SPARK=L('{a}は、あのときの{b}の顔が忘れられずにいた。気づけば、自分から{b}の隣に座っていた。{a}「ねえ、また見せてよ。ああいう顔｜なあ、また見せてくれ。ああいう顔を｜あの、また見せてください。ああいう顔」|'+
'{a}は{b}を見かけるたび、つい目で追うようになっていた。{b}がそれに気づいて、二人のあいだに妙な沈黙が落ちた。どちらも、嫌な沈黙だとは思わなかった。|'+
'{a}は用もないのに{b}に話しかけた。理由を聞かれても、うまく答えられなかった。{a}「……別に。話したかっただけ｜……別に。話したかっただけだ｜……別に。お話ししたかっただけです」|'+
'{a}と{b}は、気づけば並んで過ごす時間が増えていた。あの「らしくない」一件以来、二人の距離はどこかおかしかった。それが、不思議と心地よかった。');
function token(ctx){
var s=st(ctx),i=ctx.stepIndex;
if(s.tokAt!==i){var left=s.tok&& !s.done&& !s.carried;s.tokAt=i;s.tok=left||h01(s.salt,i,77)<U.pStep(ctx.chaos,s.nSteps);s.carried=left;s.done=false;}
return s.tok&& !s.done;
}
function flipOk(ctx,a,b){
if(!b|| !(ctx.chaos>0)|| !token(ctx))return null;
var s=st(ctx);
if((s.cnt[a.i]||0)>=U.cap(ctx.chaos)||blocked(ctx,a,b))return null;
if(ctx.others(a).indexOf(b)<0)return null;
if(related(ctx,a,b)<(ctx.chaos>=0.7?1:2))return null;
var ro=romOK(ctx,a,b),f=flipFor(ctx,a,b,ro);
return f?{f:f,ro:ro}:null;
}
HK.addTo(HK.COMMON,[
{
id:'unl_flip',label:'らしくない行動と相手の動揺・ときめき',cat:'bond',scope:'pair',tie:'-',noOdd:true,
when:function(ctx,a,b){return!!flipOk(ctx,a,b);},
w:function(ctx){return 10+30*ctx.chaos;},
run:function(ctx,a,b){
var ok=flipOk(ctx,a,b);
if(!ok)return null;
var s=st(ctx);s.done=true;
var pf=ctx.pair(a,b),sc=scene(ctx,a,b,ok.f,ok.ro);
s.log.push({a:a.i,b:b.i,k:ok.f.k,rk:sc.rk,at:ctx.stepIndex,ro:ok.ro,so:sc.so,couple0: !!pf.couple,night0: !!pf.night||(pf.nights||0)>0});
apply(ctx,a,b,sc,ok.ro);
a._unlP={b:b.i,k:ok.f.k,at:ctx.stepIndex};
return{cat:sc.rom?'romance':'bond',odd:true,text:ctx.t(sc.text,a,b),why:sc.why,mag:14};
}
},
{
id:'unl_after',label:'らしくない行動を振り返る後日談',cat:'bond',scope:'solo',tie:'-',noOdd:true,
when:function(ctx,a){
var P=a._unlP;if(!P||P.done||ctx.stepIndex<=P.at)return false;
var b=ctx.chars[P.b];
return!!b&&here(a)&&here(b)&&ctx.others(a).indexOf(b)>=0;
},
w:function(){return 4;},
run:function(ctx,a){
var P=a._unlP,b=ctx.chars[P.b];P.done=true;
var r=afterScene(ctx,a,b,P);
if(r.k==='shame'){ctx.stress(a,4);ctx.mod(b,a,{aff:2});}
else if(r.k==='own'){ctx.mod(a,b,romOK(ctx,a,b)?{att:3,trust:2}:{trust:3});ctx.mod(b,a,{trust:2});}
else ctx.mod(b,a,{ten:3});
return{with:[b],text:ctx.t(r.text,a,b),why:r.why,mag:6};
}
},
{
id:'unl_spark',label:'らしくない一面が忘れられず近づく',cat:'romance',scope:'pair',tie:'-',noOdd:true,pri:true,
when:function(ctx,a,b){
if(!b)return false;
var pf=ctx.pair(a,b),sp=pf.unlSpark;
return!!sp&& !sp.done&&sp.by===a.i&&sp.to===b.i&&ctx.stepIndex>sp.at&& !pf.couple&&ctx.R(a,b).att>=14&&romOK(ctx,a,b)&& !blocked(ctx,a,b);
},
w:function(ctx,a,b){return(2.5+ctx.R(a,b).att/30)*(1+ctx.chaos);},
run:function(ctx,a,b){
var sp=ctx.pair(a,b).unlSpark;sp.done=true;
ctx.mod2(a,b,{aff:8,att:8,trust:4,ten: -4},{aff:7,att:8,trust:3,ten: -4});
return{text:ctx.t(ctx.pick(SPARK),a,b),why:a.name+'は、'+b.name+'の「らしくない」一面（'+FK[sp.k].name+'）が忘れられなかった（'+REACT[sp.rk].name+'あと）',mag:12};
}
}
]);
U.story=function(S,id,live,o){
o=o||{};
if(!S|| !S.rng)return null;
var x=chaosOf(S);
if(!(x>0))return null;
var L0=(live||[]).filter(function(p){return here(p);});
if(L0.length<2)return null;
var s=st(S);
s.calls++;
var pend=L0.filter(function(p){return p._unlP&& !p._unlP.done&&p._unlP.call<s.calls;})[0];
if(pend&&S.rng()<0.6){
var P=pend._unlP,pb=S.P[P.b];
if(pb&&L0.indexOf(pb)>=0){
P.done=true;
var ar=afterScene(S,pend,pb,P);
return{a:pend,b:pb,text:ar.text,why:ar.why,d:ar.k==='forget'? -0.02:0.03,tag:'らしくない（後日談）',after:true};
}
}
if(S.rng()>=U.pStep(x,o.n||10))return null;
var cands=[],cap=U.cap(x);
L0.forEach(function(a){
if((s.cnt[a.i]||0)>=cap)return;
L0.forEach(function(b){
if(a===b||blocked(S,a,b))return;
var ro=romOK(S,a,b),f=flipFor(S,a,b,ro),w=related(S,a,b);
if(f&&(w>=2||x>=0.5))cands.push({a:a,b:b,f:f,ro:ro,w:w===3?4:w});
});
});
if(!cands.length)return null;
var c=HK.weighted(S.rng,cands,function(q){return q.w;}),a=c.a,b=c.b;
var sc=scene(S,a,b,c.f,c.ro);
s.log.push({a:a.i,b:b.i,k:c.f.k,rk:sc.rk,at:s.calls,ro:c.ro,so:sc.so});
a._unlP={b:b.i,k:c.f.k,call:s.calls};
emo(S,a,b,sc.rk);
return{a:a,b:b,text:fill(sc.text,{a:a,b:b}),why:sc.why,d:RX[sc.rk].d*(c.ro||sc.rk==='shinpai'||sc.rk==='omoshiro'||sc.rk==='keikai'?1:0.3),tag:'らしくない',rk:sc.rk,k:c.f.k};
};
U.ENV={id:'chaos',label:'運命の揺らぎ',min:0,max:100,def:40,lo:'気質どおり',hi:'番狂わせ',desc:'高いほど、関係のある相手に「らしくない行動」（嫉妬しない人の嫉妬・強引な人の照れ など）をとり、それを見た相手が動揺したり、ときめいたりする'};
})();
});
;
/* ==== js/pair-react.js ==== */
HK.Load.def(181,'js/pair-react.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK|| !HK.buildPool)return;
function L(s){return s.split('|');}
var TARGET={island:1,zombie:1};
var GROUP={help:'help',bond:'bond',conflict:'conflict',combat:'act',escape:'act'};
var LABEL={deep:'深い仲',warm:'好意的',plain:'ふつう',hostile:'敵対的'};
var SKIP_ID= /^(?:tie_|ir_|ie_|hk_|hb_|pn_|fc_|al_|sf_|u_|z_cr_|z_sj_|z_lv_|ob_)/;
var SORRY_ID= /^(?:apologize|apology)$/;
function depth(ctx,a,b){
var T=HK.Ties,has=function(t){return!!(T&&T.has&&T.has(ctx,a,b,t));};
var r=ctx.R(b,a),pf=ctx.pair(a,b),H=HK.HateKit,hl=H&&H.level?H.level(ctx,b,a):0;
if(has('enemy')||has('bad')||has('rival')||hl>=35||(r.ten>=45&&r.aff<5))return'hostile';
if(pf.couple||['lover','mate','fated','best','childhood','sibclose','sibprot','buddy','worship','benefactor','blind'].some(has)||(r.aff>=55&&r.trust>=40))return'deep';
if(['friend','colleague','senpai','mentor','almost','sibling','classmate','boss','relative','fond'].some(has)||r.aff>=25||r.trust>=25)return'warm';
return'plain';
}
var RX={
help:{
deep:L('{b}は何も言わずに、{a}の手をそっと握った。礼を言う必要もない間柄だった。それでも{b}は、小さく「ありがとう｜＝｜ありがとうございます」とだけ言った。|{b}は{a}の顔をまっすぐ見て、ふっと肩の力を抜いた。{b}「{a}がいてくれて、本当によかった｜＝｜{a}さんがいてくれて、本当によかったです」――その声には、少しの迷いもなかった。|{b}は照れくさそうに目を伏せてから、{a}の肩に軽く額を預けた。言葉にしなくても、互いに分かっていた。'),
warm:L('{b}は少し驚いた顔をして、それから嬉しそうに笑った。{b}「助かった。この借りは、ちゃんと返すよ｜助かった。この借りは、ちゃんと返す｜助かりました。この借りは、ちゃんと返します」|{b}は{a}に頭を下げた。{b}「ありがとう。……一人だったら、危なかった｜＝｜ありがとうございます。……一人だったら、危なかったです」――そう言って、{b}はほっと息をついた。|{b}は「悪いね｜悪いな｜すみません」と言いながら、まんざらでもなさそうだった。二人の距離が、ほんの少し縮まった気がした。'),
plain:L('{b}は少し戸惑ったように会釈した。{b}「……どうも｜＝｜……どうも、ありがとうございます」――それ以上の言葉は、まだ出てこなかった。|{b}は意外そうに{a}を見た。{b}「ありがとう。……助かった｜＝｜ありがとうございます。……助かりました」――ぎこちないが、礼はきちんと言った。|{b}は短く礼を言うと、すぐに自分の作業へ戻った。それでも、{a}のことを少しだけ見直していた。'),
hostile:L('{b}は{a}を一瞥して、ぶっきらぼうに言った。{b}「……礼は言わないよ。借りにしておく｜……礼は言わない。借りにしておく｜……礼は言いません。借りにしておきます」――それでも、その場を離れようとはしなかった。|{b}は顔をしかめた。{b}「余計なことしないで｜余計なことをするな｜余計なことをしないでください」――そう言いながらも、{b}は{a}の手を振り払わなかった。|{b}は{a}を睨んだまま、黙って受け取った。助けられたことが、かえって悔しそうだった。')
},
bond:{
deep:L('{b}は{a}の話に、何度も頷いた。相手の言いたいことは、言い終わる前から分かっていた。二人のあいだに、心地のいい沈黙が落ちた。|{b}は{a}の隣で、くすくすと笑った。{b}「こういう話ができるのは、{a}だけだよ｜こういう話ができるのは、{a}だけだ｜こういう話ができるのは、{a}さんだけです」|{b}は{a}の肩に寄りかかったまま、話の続きを促した。こんな状況でも、二人で話していると、不思議と怖くなかった。'),
warm:L('{b}は楽しそうに身を乗り出した。{b}「それで、どうなった？｜それで、どうなった｜それで、どうなったんですか？」――話はなかなか終わらなかった。|{b}は{a}の話に笑って、自分の話も一つ返した。思っていたより、ずっと話しやすい相手だった。|{b}は{a}の顔を見て、少しだけ口元を緩めた。{b}「また聞かせてほしい｜＝｜また聞かせてほしいです」'),
plain:L('{b}は相槌を打ちながら、当たり障りのない返事をした。まだ、どこまで話していいのか測りかねていた。|{b}は少し考えてから、ぽつりと自分のことを話した。会話は途切れがちだったが、気まずくはなかった。|{b}は{a}の話を黙って聞いていた。最後に一言だけ、{b}「……そっか｜……そうか｜……そうですか」と返した。'),
hostile:L('{b}は腕を組んだまま、{a}の話を聞き流した。{b}「で、それが何｜で、それが何だ｜で、それが何ですか」――相手にする気は、ないようだった。|{b}は鼻で笑った。{b}「そんな話を、私にしてどうするの｜そんな話を、私にしてどうする｜そんな話を、私にしてどうするんですか」――それでも、{b}はその場を離れなかった。|{b}はそっぽを向いたまま、短く相槌を打った。打ち解けるつもりはない、という態度を崩さなかった。')
},
conflict:{
deep:L('{b}は何か言いかけて、やめた。{b}「……こんなことで、{a}と揉めたくない｜＝｜……こんなことで、{a}さんと揉めたくないです」――大事な相手だからこそ、引きずりたくなかった。|{b}は唇を噛んで黙り込んだ。しばらくして、{a}の袖をそっと引いた。仲直りの合図は、それで十分だった。|{b}は「もういい｜＝｜もういいです」と背を向けた。けれど、夜になる前には、何事もなかったように{a}の隣に戻ってきていた。'),
warm:L('{b}は困ったように眉を下げた。{b}「そこまで言わなくてもいいでしょ｜そこまで言わなくてもいいだろう｜そこまで言わなくてもいいでしょう」――けれど、本気で怒っているわけではなかった。|{b}はしばらくむっとしていたが、やがて肩をすくめた。{b}「……まあ、そっちの言い分も分かるよ｜……まあ、そっちの言い分も分かる｜……まあ、そちらの言い分も分かります」|{b}は言い返したあと、気まずそうに頭をかいた。言い合いは、どちらからともなく収まった。'),
plain:L('{b}は眉をひそめて、{a}から距離を取った。{b}「勝手にすればいいよ｜勝手にすればいい｜勝手にすればいいです」――それきり、二人は口をきかなかった。|{b}は言い返そうとして、面倒になったのか黙った。わだかまりだけが、二人のあいだに残った。|{b}はため息をついて、話を打ち切った。{b}「今は、揉めてる場合じゃないよ｜今は、揉めている場合じゃない｜今は、揉めている場合じゃありません」'),
hostile:L('{b}は待っていたとばかりに{a}に詰め寄った。{b}「前から言いたかった。あなたには、うんざり｜前から言いたかった。あなたには、うんざりだ｜前から言いたかったです。あなたには、うんざりです」――周りが止めに入るまで、二人の睨み合いは続いた。|{b}は冷たく笑った。{b}「やっぱり、あなたとは合わない｜やはり、あなたとは合わない｜やっぱり、あなたとは合いません」――その一言で、溝はさらに深くなった。|{b}は{a}の胸を指で突いた。{b}「次に同じことしたら、ただじゃ済まさないから｜次に同じことをしたら、ただでは済まさない｜次に同じことをしたら、ただでは済ませません」')
},
sorry:{
deep:L('{b}は{a}の言葉を最後まで聞かずに、その手を取った。{b}「もういい。……私も、悪かった｜＝｜もういいです。……私も、悪かったです」――わだかまりは、それだけで消えた。|{b}は困ったように笑って、{a}の額を指で軽く弾いた。{b}「謝らなくていいよ。分かってるから｜謝らなくていい。分かっている｜謝らなくていいです。分かっていますから」|{b}は黙って{a}を抱き寄せた。言葉より先に、許していることが伝わった。'),
warm:L('{b}は少し間をおいてから、頷いた。{b}「分かった。次から気をつけてくれればいいよ｜分かった。次から気をつけてくれればいい｜分かりました。次から気をつけてくれればいいです」|{b}は肩の力を抜いて笑った。{b}「わざわざ謝りに来るとは思わなかった。……ありがとう｜＝｜わざわざ謝りに来るとは思いませんでした。……ありがとうございます」|{b}は照れくさそうに頭をかいた。{b}「こっちこそ、言い過ぎた。おあいこだね｜こっちこそ、言い過ぎた。おあいこだ｜こちらこそ、言い過ぎました。おあいこです」'),
plain:L('{b}は少し驚いた顔をして、短く頷いた。{b}「……分かった｜＝｜……分かりました」――まだ、どこまで信じていいのか測りかねていた。|{b}はしばらく黙っていたが、やがて小さく息をついた。{b}「もう気にしてないよ｜もう気にしていない｜もう気にしていません」――本心かどうかは、{b}にも分からなかった。|{b}は謝罪を受け入れたが、表情は硬いままだった。それでも、二人のあいだの空気は少しだけ和らいだ。'),
hostile:L('{b}は冷ややかに{a}を見下ろした。{b}「謝れば済むと思わないで｜謝れば済むと思うな｜謝れば済むと思わないでください」――それでも、{b}は話を最後まで聞いていた。|{b}は鼻を鳴らした。{b}「今さら何。……まあ、聞くだけは聞いた｜今さら何だ。……まあ、聞くだけは聞いた｜今さら何ですか。……まあ、聞くだけは聞きました」|{b}は顔を背けたまま、何も言わなかった。許すつもりはない。けれど、突き放しもしなかった。')
},
act:{
deep:L('{b}は迷わず{a}の背中を守る位置についた。言葉で合図しなくても、互いの動きが分かっていた。|{b}は{a}の手を取って走った。{b}「離れないで。絶対に｜離れるな。絶対に｜離れないでください。絶対に」――握った手は、最後まで離れなかった。|{b}は{a}と目を合わせて、小さく頷いた。二人で切り抜けられないことは、ないと思えた。'),
warm:L('{b}は{a}の動きに合わせて、すぐに手を貸した。{b}「こっちは任せて｜こっちは任せろ｜こちらは任せてください」――頼もしい声だった。|{b}は{a}の隣に並んだ。{b}「一緒に行く。一人より二人のほうがいいよ｜一緒に行く。一人より二人のほうがいい｜一緒に行きます。一人より二人のほうがいいです」|{b}は少し遅れて{a}に続いた。息は合いきっていなかったが、互いを置いていくつもりはなかった。'),
plain:L('{b}は少し迷ってから、{a}のあとに続いた。信用しきっているわけではなかったが、ほかに手はなかった。|{b}は自分の持ち場を守りながら、ちらりと{a}の様子を窺った。{b}「……足を引っ張らないでよ｜……足を引っ張るなよ｜……足を引っ張らないでくださいね」|{b}は黙って{a}の指示に従った。うまくいったら、少しは見直すつもりだった。'),
hostile:L('{b}は舌打ちをして、{a}とは別の方向へ動いた。{b}「あなたの指図は受けない｜＝｜あなたの指図は受けません」――それでも、結果的には互いの背中を守る形になっていた。|{b}は{a}を押しのけるようにして前に出た。{b}「邪魔。どいて｜邪魔だ。どけ｜邪魔です。どいてください」――助け合う気など、少しもなさそうだった。|{b}は嫌そうな顔で{a}と並んだ。{b}「今回だけだよ。終わったら、また他人｜今回だけだ。終わったら、また他人だ｜今回だけです。終わったら、また他人です」')
}
};
function fill(ctx,t,a,b){return t.replace(/\{a\}/g,a.name).replace(/\{b\}/g,b.name);}
function pick(ctx,l){return HK.Ero&&HK.Ero.fresh?HK.Ero.fresh(ctx,l,function(x){return ctx.pick(x);}):ctx.pick(l);}
function addReact(ctx,a,b,e,res){
if(!res|| !res.text|| !b||b===a|| !b.alive||b.out||a.out)return res;
if(res.with&&res.with.some(function(x){return x&&x!==a&&x!==b;}))return res;
var tx=String(res.text);
if(tx.indexOf(b.name+'「')>=0||tx.indexOf(b.name+'は「')>=0||tx.indexOf('」と'+b.name)>=0)return res;
var lastS=tx.replace(/[。！？]+$/,'').split(/[。！？]/).pop()||'';
if(lastS.indexOf(b.name)===0)return res;
var cat=res.cat||e.cat,g=SORRY_ID.test(e.id||'')?'sorry':GROUP[cat];
if(!g||ctx.rng()>0.55)return res;
var d=depth(ctx,a,b),l=RX[g]&&RX[g][d];
if(!l)return res;
res.text=String(res.text)+fill(ctx,pick(ctx,l),a,b);
res.why=(res.why?res.why+'／':'')+b.name+'の反応：関係の深さ「'+LABEL[d]+'」';
return res;
}
HK.wrap(HK,'buildPool',function(bp0){return function(scen){
var pool=bp0.apply(this,arguments);
if(!scen|| !TARGET[scen.id])return pool;
return pool.map(function(e){
if(!e||e.scope!=='pair'||e.r18|| !GROUP[e.cat]||SKIP_ID.test(e.id||'')||typeof e.run!=='function')return e;
var w=Object.create(e);
w.run=function(ctx,a,b){return addReact(ctx,a,b,e,e.run.apply(this,arguments));};
return w;
});
};});
HK.PairReact={depth:depth,RX:RX,LABEL:LABEL};
})();
});
;
/* ==== js/pos-fm-tease.js ==== */
HK.Load.def(183,'js/pos-fm-tease.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK|| !HK.addMini)return;
function L(s){return s.split('|');}
var TEXT={
island:L('焚き火が小さくなった夜、{a}は寝床の{b}に跨って、見下ろした。「逃げても、島からは出られないよ」――{b}が何か言いかける前に、{a}は唇で塞いだ。|{a}は浜辺で{b}を砂の上に押し倒し、そのままお腹の上に座り込んだ。「今日、魚を逃したでしょ。罰ゲーム」――{b}は真っ赤になって、されるがままになっていた。|{a}は水浴びから戻った{b}の手首を掴み、ヤシの木の陰で押さえつけた。耳元で何かを囁くと、{b}は息を呑んで目を逸らした。|雨の夜、洞窟の奥で、{a}は{b}の上に跨ったまま、わざとゆっくり濡れた髪を拭いてやった。{b}が手を伸ばすたびに、{a}は「まだだめ」と笑って押し戻した。'),
zombie:L('見張りを交代した夜、{a}は寝袋の{b}に跨って、懐中電灯で顔を照らした。「眠そうだね。……起こしてあげる」――{b}の抗議は、すぐに静かになった。|{a}は{b}をバリケードの壁際に追い詰め、両手首を頭の上で押さえた。「さっき、無茶したよね」――罰だと言って、{a}は{b}が音を上げるまで離さなかった。|{a}は{b}をソファに押し倒して膝の上に座り、「今夜は、こっちが見張り役」と笑った。{b}は観念したように、{a}の腰に手を添えた。'),
};
var TAIL=L('{b}は顔を覆って「……ずるい」と呟いた。|{b}は、もう{a}の顔をまともに見られなかった。|{b}の耳は、しばらく赤いままだった。|{a}は満足そうに{b}の上から降りて、「続きは、また今度」と笑った。');
function src(c,k){return c?(c[k]!=null&&c[k]!==''?c[k]:(c.src&&c.src[k])||''):'';}
function ok(ctx,a,b){
var P=HK.Pos;
if(!P|| !b|| !P.isF(a,b)|| !P.isTop(a,b)||src(b,'gender')!=='m'|| !P.okSex(a,b))return false;
if(HK.canLove&&(!HK.canLove(a,b)|| !HK.canLove(b,a)))return false;
var pr=ctx.pair?ctx.pair(a,b):{};
return!!(pr.couple||pr.night||(ctx.R(a,b).att>25&&ctx.R(b,a).att>12));
}
Object.keys(TEXT).forEach(function(sid){
HK.addMini(sid,[{
id:'fm_tease_'+sid,cat:'romance',scope:'pair',mini:true,
when:function(ctx,a,b){return ok(ctx,a,b)&&(ctx.pair(a,b).fmTease||0)<2;},
w:function(ctx,a,b){var t=a.tr||{};return 0.5+ctx.R(a,b).att/70+(t.cp||0)*0.4+(t.fc||0)*0.3+(ctx.pair(a,b).couple?0.6:0);},
run:function(ctx,a,b){
var pr=ctx.pair(a,b);pr.fmTease=(pr.fmTease||0)+1;
ctx.mod(a,b,{att:5,aff:3},1.2);ctx.mod(b,a,{att:7,aff:2},1.2);
var text=ctx.t(ctx.pick(TEXT[sid]),a,b)+(ctx.rng()<0.6?ctx.t(ctx.pick(TAIL),a,b):'');
return{text:text,why:a.name+'は自分で「攻め」を選んでいて、'+b.name+'が気になっている（自分から跨っていじめる）'};
}
}]);
});
})();
});
;
/* ==== js/cold-fear-text.js ==== */
HK.Load.def(194,'js/cold-fear-text.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK)return;
function L(s){return s.split('|');}
var X=HK.ColdFearText={};
X.ACT={
push:{
zombie:L('{w}{b}が、二階の窓から外をうかがっていた。その背後に、{a}が音もなく立った。下の通りには、呻き声を上げる群れがひしめいていた。{a}は、ためらわなかった。{a}「ずっと、あなたが怖かった。……でも、もう怖くない｜ずっと、あなたが怖かった。……だが、もう怖くはない｜ずっと、あなたが怖かったんです。……でも、もう怖くありません」――押された{b}の体は、窓枠を越えて群れの中へ落ちていった。|'+
'非常階段の踊り場で、{w}{b}が手すりにすがった。その下では、ゾンビの群れが渦を巻いていた。{a}は{b}の指を、手すりから一本ずつ剥がした。{a}「あなたがいなくなれば、もう誰も私を脅さない｜あなたがいなくなれば、もう誰も私を脅さない｜あなたがいなくなれば、もう誰も私を脅かしません」――{b}の悲鳴は、すぐに呻き声の中に呑まれた。|'+
'屋上へ逃げる途中、{w}{b}が{a}に手を伸ばした。助けて、と言いかけたその顔を、{a}は冷たく見下ろした。{a}は差し出された手を取るふりをして、そのまま{b}を柵の外へ突き飛ばした。{a}「……さよなら。私を怖がらせた人｜……さらばだ。私を怖がらせた人｜……さようなら。私を怖がらせた人」――下で待っていた群れが、落ちてきたものに一斉に群がった。'),
br:L('崖沿いの細い道で、{w}{b}が{a}の肩にすがった。{a}はその手を振りほどき、{b}の胸を両手で突いた。{a}「ここで終わり。もう、あなたに怯えなくていい｜ここで終わりだ。もう、あなたに怯えなくていい｜ここで終わりです。もう、あなたに怯えなくていいんです」――{b}の体は、岩肌を転がって見えなくなった。|'+
'見張り台の上で、{w}{b}が座り込んでいた。{a}は背後から近づき、その背中を見下ろした。あれほど大きく見えた背中が、今はひどく小さかった。{a}「……私を見下ろしてたのは、ずっとあなたのほうだったのに｜……私を見下ろしていたのは、ずっとあなたのほうだったのにな｜……私を見下ろしていたのは、ずっとあなたのほうでしたのに」――{a}の手が{b}の背を押し、{b}は柵の向こうへ消えた。')
},
abandon:{
zombie:L('群れが入り口を破ったとき、{w}{b}は足をもつれさせて床に倒れた。{a}は一瞬だけ振り返り、そのまま背を向けて走り出した。{a}「……私は、悪くない。あなたが遅かっただけ｜……私は、悪くない。あなたが遅かっただけだ｜……私は、悪くありません。あなたが遅かっただけです」――背後で{b}が{a}の名前を呼んでいたが、{a}は耳をふさいでバリケードの扉を閉めた。|'+
'物資を探しに出た先で、{w}{b}が棚の陰から動けなくなった。{a}は{b}と目が合った。助けを求める目だった。{a}は黙って荷物を背負い直し、一人で裏口へ向かった。{a}「ごめん。でも、もうあなたの言うことは聞かない｜悪いな。だが、もうあなたの言うことは聞かない｜ごめんなさい。でも、もうあなたの言うことは聞きません」|'+
'車のエンジンがかかった。{w}{b}が後部座席の扉に手をかけた瞬間、{a}はアクセルを踏み込んだ。{a}「……乗せる義理なんて、ないから｜……乗せる義理などない｜……乗せる義理なんて、ありませんから」――ミラーの中で、{b}の姿が群れに囲まれて小さくなっていった。{a}は一度も、ミラーを見直さなかった。'),
island:L('潮が満ちはじめた岩場で、{w}{b}が動けなくなった。{a}は{b}を振り返り、それから浜へ向かって一人で歩き出した。{a}「あなたを背負って帰る力なんて、私にはない｜あなたを背負って帰る力など、私にはない｜あなたを背負って帰る力なんて、私にはありません」――打ち寄せる波の音が、{b}の呼ぶ声をかき消した。|'+
'嵐の夜、雨をしのげる岩陰は一人分しかなかった。{a}は先に岩陰に潜り込むと、外で震える{w}{b}に背を向けた。{a}「ずっと、私を怒鳴りつけてきたでしょ。今度は、あなたが外の番｜ずっと、私を怒鳴りつけてきただろう。今度は、あなたが外の番だ｜ずっと、私を怒鳴りつけてきましたよね。今度は、あなたが外の番です」――朝まで、{a}は一度も場所を譲らなかった。'),
br:L('{w}{b}が、仕掛けられた罠に足を取られて動けなくなった。{a}は罠を外しかけた手を止め、ゆっくりと立ち上がった。{a}「……私が助ける理由、ある？｜……私が助ける理由があるか？｜……私が助ける理由、ありますか？」――遠くで、別の誰かの足音が近づいていた。{a}はそれを聞きながら、茂みの奥へ消えた。|'+
'放送が禁止区域の広がりを告げた。{w}{b}は、もう自分の足では走れなかった。{a}は地図をたたみ、{b}を置いたまま区域の外へ向かった。{a}「あなたと一緒だと、私まで間に合わない｜あなたと一緒では、私まで間に合わない｜あなたと一緒だと、私まで間に合いません」'),
jashin:L('夜道で村人の松明に囲まれたとき、{w}{b}は{a}の腕にすがった。{a}はその手を振り払い、一人で藪の中へ飛び込んだ。{a}「離して……あなたと一緒だと、私まで捕まる｜離せ……あなたと一緒では、私まで捕まる｜離してください……あなたと一緒だと、私まで捕まります」――背後で、{b}の悲鳴と村人の囃し声が重なった。|'+
'祭囃子が近づいてくる中、{w}{b}は民宿の奥で動けずにいた。{a}は裏口の戸に手をかけ、一度だけ{b}を振り返った。{a}「……私は悪くない。逃げ遅れたのは、あなただから｜……私は悪くない。逃げ遅れたのは、あなただ｜……私は悪くありません。逃げ遅れたのは、あなたですから」――{a}は戸を閉め、闇の中へ走り去った。'),
jinro:L('疑いをかけられた{b}が、助けを求めるように{a}を見た。いつもなら、{a}は{b}に言われるまま、かばう側に回っていたはずだった。{a}は黙って目を逸らした。{a}「……私に、聞かないで｜……私に聞くな｜……私に、聞かないでください」――{b}の味方は、もう一人もいなかった。|'+
'広場の輪の中で、{w}{b}が一人で弁明を続けていた。{a}は輪の外に立ち、腕を組んだまま一言も口を挟まなかった。昨日までなら、震えながらでも{b}の肩を持っていたはずだった。{a}「……もう、あなたの言いなりにはならない｜……もう、あなたの言いなりにはならない｜……もう、あなたの言いなりにはなりません」'),
yakata:L('夜の見回りの順番で、{w}{b}は一人で廊下に残された。本当は{a}も一緒に残るはずだった。{a}は鍵をかけた自室の中で、{b}の足音が遠ざかるのを聞いていた。{a}「……私は、悪くない｜……私は悪くない｜……私は、悪くありません」|'+
'吹雪の音にまぎれて、{w}{b}が{a}の部屋の扉を叩いた。開けてくれ、という声は震えていた。{a}は扉に背を預けたまま、返事をしなかった。{a}「……あなたが、今まで私にしてきたことを思い出して｜……あなたが今まで私にしてきたことを、思い出せ｜……あなたが今まで私にしてきたことを、思い出してください」――やがて、足音は廊下の奥へ消えた。'),
ship:L('{w}{b}の看病の当番を、{a}は黙って放り出した。医療区画の扉を閉め、通路の灯りを落とした。{a}「あなたが私にしてきたことを、思い出してみて｜あなたが私にしてきたことを、思い出してみろ｜あなたが私にしてきたことを、思い出してみてください」――扉の向こうで、{b}が咳き込む音が長く続いた。|'+
'{w}{b}が、薬を取ってきてほしいと{a}に頼んだ。{a}は頷いて区画を出たきり、戻らなかった。{a}「……私は悪くない。忘れてただけ｜……私は悪くない。忘れていただけだ｜……私は悪くありません。忘れていただけです」――空っぽの通路に、{b}が{a}を呼ぶ声だけが響いていた。'),
gen:L('{w}{b}は、立ち上がることもできずにいた。{a}は一度だけ{b}を見て、そのまま背を向けた。{a}「あなたを助ける理由なんて、どこにもない｜あなたを助ける理由など、どこにもない｜あなたを助ける理由なんて、どこにもありません」――{b}が呼ぶ声を、{a}は最後まで聞かないふりをした。|'+
'危険が迫る中、{w}{b}が取り残されていた。{a}には、手を貸す時間がなかったわけではなかった。{a}は、手を貸さないことを選んだ。{a}「……私は、悪くない｜……私は、悪くない｜……私は、悪くありません」')
},
let:{
zombie:L('噛み跡を押さえてうずくまる{b}が、{a}に薬を分けてくれと頼んだ。{a}は救急箱を抱えたまま、首を横に振った。{a}「それ、もう助からないでしょ。無駄にはできない｜それはもう助からない。無駄にはできない｜それはもう助かりませんよね。無駄にはできません」――あれほど恐ろしかった{b}が、子どものように泣いていた。{a}は扉を閉め、外から鍵をかけた。|'+
'{b}の顔色が、目に見えて悪くなっていった。皆が手当ての方法を探しているあいだ、{a}だけは{b}のそばに近づこうとしなかった。{a}「私は悪くない……あの人が、勝手に噛まれたんだ｜私は悪くない……あの人が、勝手に噛まれたんだ｜私は悪くありません……あの人が、勝手に噛まれたんです」――{a}は、止血のための布をそっと隠した。'),
gen:L('{w}{b}は、水をくれとかすれた声で言った。{a}は水筒を手にしたまま、その場を動かなかった。{a}「……あなたに分ける分は、ない｜……あなたに分ける分はない｜……あなたに分ける分は、ありません」――{b}が伸ばした手は、{a}に届かないまま地面に落ちた。|'+
'{w}{b}の手当てに使える薬は、{a}の荷物の中にしかなかった。{a}はそのことを、誰にも言わなかった。{a}「……私は悪くない。訊かれなかったから｜……私は悪くない。訊かれなかったからだ｜……私は悪くありません。訊かれなかったから」――夜通し、{b}の苦しげな息が聞こえていた。')
},
sell:{
jashin:L('村人たちが、生贄を探して民宿の戸を叩いた。{a}は奥の部屋を振り返り、{w}{b}のいる場所を黙って指さした。{a}「あの人を連れていって。私は悪くない……悪くないから｜あの人を連れていけ。私は悪くない……悪くない｜あの人を連れていってください。私は悪くありません……悪くないんです」――引きずられていく{b}の叫び声を、{a}は両耳をふさいで聞かなかったことにした。|'+
'{a}は、村の長老の家を一人で訪ねた。差し出したのは、{w}{b}の居場所を書いた紙切れだった。{a}「その代わり、私だけは助けて｜その代わり、私だけは助けてくれ｜その代わり、私だけは助けてください」――その夜、民宿から{b}の姿が消えた。{a}は布団の中で、私は悪くない、と何度も繰り返した。'),
jinro:L('朝の広場で、{a}は誰よりも先に口を開いた。{a}「人狼は、あの人だと思う。昨日から、ずっと様子がおかしかった｜人狼は、あの人だと思う。昨日から、ずっと様子がおかしかった｜人狼は、あの人だと思います。昨日から、ずっと様子がおかしかったんです」――指さされた{b}は、言い返す言葉を探して口ごもった。あれほど恐ろしかった{b}が、皆の視線の前で小さく縮こまっていた。{a}は胸の奥で、私は悪くない、と繰り返した。|'+
'{w}{b}に、皆の視線が集まっていた。{a}はその輪に加わり、{b}の昨日の言葉の矛盾を一つずつ並べ立てた。{a}「私は悪くない……おかしいことを、おかしいって言ってるだけ｜私は悪くない……おかしいことを、おかしいと言っているだけだ｜私は悪くありません……おかしいことを、おかしいと言っているだけです」――{b}をかばう声は、もう上がらなかった。'),
trial:L('議論の場で、皆の視線が{w}{b}に集まりはじめた。{a}は、震える手を挙げた。{a}「あの人が……。私、見たの｜あの人が……。私は見た｜あの人が……。私、見たんです」――言い終えたあと、{a}は小さく付け足した。{a}「私は悪くない……本当のことを言っただけ｜私は悪くない……本当のことを言っただけだ｜私は悪くありません……本当のことを言っただけです」――{b}をかばう声は、もう上がらなかった。|'+
'{a}は、{w}{b}に不利な話を、議論の流れに合わせて少しずつ足していった。{b}が助けを求めるように{a}を見たが、{a}は目を合わせなかった。{a}「皆がそう思ってるなら、きっとそうなんだよ｜皆がそう思っているなら、きっとそうなのだろう｜皆さんがそう思っているなら、きっとそうなんですよ」――多数の側に立つのは、思っていたよりずっと楽だった。'),
yakata:L('吹雪に閉ざされた食堂で、{a}は皆の前に進み出た。{a}「あの夜、あの人が廊下にいたのを見た｜あの夜、あの人が廊下にいたのを見た｜あの夜、あの人が廊下にいたのを見ました」――見たというのは、半分は嘘だった。{w}{b}の顔から血の気が引いていくのを、{a}は不思議なほど落ち着いて眺めていた。{a}「私は悪くない……疑われるようなことをした、あの人が悪い｜私は悪くない……疑われるようなことをした、あの人が悪い｜私は悪くありません……疑われるようなことをした、あの人が悪いんです」|'+
'{a}は、{w}{b}の部屋に落ちていたものを、皆の前に差し出した。それが本当に{b}のものかどうか、{a}は確かめもしなかった。{a}「私は悪くない。見つけたものを見せただけ｜私は悪くない。見つけたものを見せただけだ｜私は悪くありません。見つけたものを見せただけです」――皆の視線が、一斉に{b}へ向いた。'),
ship:L('{a}は、船の故障の原因が{w}{b}の整備の手抜きにあると、皆の前で言い立てた。半分は本当で、半分は嘘だった。{a}「私は悪くない……あの人に言われたとおりにしただけ｜私は悪くない……あの人に言われたとおりにしただけだ｜私は悪くありません……あの人に言われたとおりにしただけです」――その日から、{b}の言葉に耳を貸す者はいなくなった。|'+
'配給が減らされた理由を問われたとき、{a}は{w}{b}の名前を挙げた。{b}は何か言い返そうとしたが、声が続かなかった。{a}「みんな、あの人の言いなりだったでしょ。私もそう｜皆、あの人の言いなりだっただろう。私もそうだ｜皆さん、あの人の言いなりでしたよね。私もそうです」')
}
};
X.SURVIVE=L('それでも{b}は、どうにか生き延びた。{b}は、{a}が何もしなかったことを忘れなかった。|{b}は、自分の力でどうにか持ち直した。そのあいだ、{a}が一度も振り返らなかったことを、{b}は覚えていた。|{b}は助かった。けれど、二人のあいだにあったものは、もう元には戻らなかった。');
X.FALL={
scorn:L('{w}{b}を、{a}はしばらく黙って見ていた。それから、ふっと鼻で笑った。{a}「なんだ。こんな人を、ずっと怖がってたんだ｜なんだ。こんな人を、ずっと怖がっていたのか｜なんだ。こんな人を、ずっと怖がっていたんですね」――{b}が顔を上げたとき、{a}はもう背を向けていた。|'+
'{a}は、{w}{b}の前にしゃがみこんで、その顔を覗き込んだ。昔は目を合わせることもできなかった顔だった。{a}「あなたも、こんなふうになるんだね｜あなたも、こんなふうになるんだな｜あなたも、こんなふうになるんですね」――{a}の声には、もう震えがなかった。|'+
'あれほど巨大に見えていた{b}が、今はちっぽけに見えた。{w}{b}の横を、{a}は会釈もせずに通り過ぎた。{a}「……こんなものだったんだ｜……こんなものだったのか｜……こんなものだったんですね」'),
retort:L('{w}{b}が、いつものように{a}に命令しようとした。{a}は初めて、その目をまっすぐに見返した。{a}「もう、あなたの言うことは聞かない｜もう、あなたの言うことは聞かない｜もう、あなたの言うことは聞きません」――{b}は何か言い返そうとして、言葉に詰まった。その沈黙が、{a}には何よりも心地よかった。|'+
'{w}{b}の怒鳴り声が、今日はひどく弱々しく聞こえた。{a}は手にしていたものを置き、{b}の前に立った。{a}「怒鳴れば私が黙ると思ってる？　もう、そうはいかない｜怒鳴れば私が黙ると思っているのか？　もう、そうはいかない｜怒鳴れば私が黙ると思っていますか？　もう、そうはいきません」――{b}は、初めて{a}から目を逸らした。'),
cut:L('{a}は、{w}{b}に向かって静かに告げた。{a}「これで終わりにしよう。あなたとは、もう関わらない｜これで終わりにしよう。あなたとは、もう関わらない｜これで終わりにしましょう。あなたとは、もう関わりません」――{b}が何か言いかけたが、{a}は聞かずにその場を離れた。背中で閉まった扉の音は、思っていたよりずっと軽かった。|'+
'{a}は、{b}から押しつけられていたものを一つずつ並べ、全部をまとめて{b}に突き返した。{w}{b}には、それを拒む力も残っていなかった。{a}「もう、あなたのものは何も要らない｜もう、あなたのものは何も要らない｜もう、あなたのものは何も要りません」'),
flee:L('{w}{b}を見て、{a}の胸に浮かんだのは安堵だった。今なら、逃げられる。{a}はその日のうちに荷物をまとめ、{b}から一番遠い場所へ移った。{a}「……やっと、離れられる｜……やっと、離れられる｜……やっと、離れられます」|'+
'{a}は、{b}が{w}隙に、そっと輪を抜けた。行き先は、{b}の目の届かない別の輪だった。{a}は一度も振り返らずに歩いた。{a}「……さよなら｜……さらばだ｜……さようなら」|'+
'{a}は、{b}と顔を合わせない道を選ぶようになった。{w}{b}が誰かを探すように視線を巡らせても、{a}はもうその視界の中にいなかった。距離を取るたびに、{a}の呼吸は少しずつ楽になっていった。'),
shelter:L('{w}{b}の額に、{a}は冷たい水で絞った布を当てた。あんなに巨大に見えていたものが、今はこんなにもちっぽけだった。{a}「大丈夫。これからは、私が全部決めてあげる｜大丈夫だ。これからは、私が全部決めてやる｜大丈夫です。これからは、私が全部決めてあげますから」――{b}が礼を言うと、{a}は優しく微笑んだ。その笑みには、もう怯えの影はなかった。|'+
'{a}は、{w}{b}の世話を誰にも任せなかった。食事も薬も、{a}の手からでなければ{b}に渡らなかった。{a}「私がいないと、あなたは何もできないね｜私がいないと、あなたは何もできないな｜私がいないと、あなたは何もできませんね」――{b}が頷くたびに、{a}の胸の奥で、長いあいだ縮こまっていた何かがほどけていった。|'+
'{a}は、{w}{b}の髪を撫でながら考えていた。あれほど恐ろしかった人が、今は自分の手の中で小さく震えている。{a}「もう誰にも、あなたを傷つけさせない。……私以外にはね｜もう誰にも、あなたを傷つけさせない。……私以外にはな｜もう誰にも、あなたを傷つけさせません。……私以外には、ですけど」'),
love:L('{w}{b}の姿を見たとき、{a}の胸に湧いたのは、恐怖でも安堵でもなかった。{a}は自分でも驚くほど自然に、{b}のそばに膝をついていた。{a}「……ずっと怖かった。でも、目を離せなかったのは、たぶんそれだけじゃない｜……ずっと怖かった。だが、目を離せなかったのは、たぶんそれだけではない｜……ずっと怖かったんです。でも、目を離せなかったのは、たぶんそれだけじゃありません」――{b}は、初めて見るような顔で{a}を見上げた。|'+
'{w}{b}の手を、{a}はそっと握った。冷たい手だった。あれほど恐ろしかった手が、今は自分の手の中で小さく震えている。{a}「……こんなときに、この手を離したくないなんて。おかしいね｜……こんなときに、この手を離したくないとは。おかしいな｜……こんなときに、この手を離したくないなんて。おかしいですね」')
};
X.TEND={};
X.TEND.social=L('{w}{a}の隣に、{b}は黙って腰を下ろした。周りの冷たい視線が、{b}にも向いた。それでも{b}は、席を立とうとしなかった。{b}「言いたい人には、言わせておけばいい｜言いたい者には、言わせておけばいい｜言いたい人には、言わせておけばいいんです」|'+
'{w}{a}をかばうように、{b}が皆の前に立った。{b}「この人一人を責めるのは、筋が違う｜この人一人を責めるのは、筋が違う｜この人一人を責めるのは、筋が違います」――ざわめきが、少しずつ収まっていった。{a}は、自分の前に立つ{b}の背中を、ただ見つめていた。');
X.TEND.mind=L('{w}{a}のそばに、{b}はずっと付き添っていた。水を渡し、背中をさすり、{a}の呼吸が落ち着くまで何も言わなかった。{b}「大丈夫。ゆっくりでいい｜大丈夫だ。ゆっくりでいい｜大丈夫です。ゆっくりでいいですから」|'+
'{w}{a}の肩に、{b}は自分の上着を掛けた。{b}「今は、何も考えなくていい｜今は、何も考えなくていい｜今は、何も考えなくていいんです」――{a}は、その声の静かさに、張りつめていたものが少しずつほどけていくのを感じた。{b}は、{a}が顔を上げるまでそばを離れなかった。');
X.TEND.hurt=L('{w}{a}のもとに、真っ先に駆けつけたのは{b}だった。{b}は黙って{a}の様子を確かめ、持っていたものを惜しまず使って、できる限りの手を尽くした。{b}「動かないで。じっとしてて｜動くな。じっとしていろ｜動かないでください。じっとしていてください」――{a}は、自分を助ける{b}の横顔を、初めてまともに見た。|'+
'{a}が{w}とき、{b}は何も言わずにそばにいた。夜通し水を運び、汗を拭い、{a}が眠るまで目を離さなかった。{b}「……あなたに倒れられると、困るから｜……あなたに倒れられると、困る｜……あなたに倒れられると、困りますから」――ぶっきらぼうな声だった。|'+
'危ないところで、{b}が{a}の腕を掴んで引き戻した。{w}{a}一人では、きっと切り抜けられなかった。{b}「……世話を焼かせないで｜……世話を焼かせるな｜……世話を焼かせないでください」――{a}の腕を掴んだ{b}の手は、思っていたよりずっと温かかった。');
X.MOVED=L('{a}はそれまで、{b}のことを景色の一部くらいにしか思っていなかった。けれど今は、{b}の顔がはっきりと見えた。{a}「……ありがとう。あなたのこと、何も知らなかった｜……ありがとう。あなたのことを、何も知らなかった｜……ありがとうございます。あなたのこと、何も知りませんでした」|'+
'{a}の中で、何かが小さく動いた。どうでもよかったはずの{b}の名前が、急に重みを持って胸に落ちてきた。{a}は、自分がそれに戸惑っていることに気づいた。{a}「……変なの。前は、何とも思わなかったのに｜……妙だな。前は、何とも思わなかったのに｜……変ですね。前は、何とも思わなかったのに」|'+
'{a}は、借りを作ったことが落ち着かなかった。{b}を目で追う時間が、少しずつ増えていった。{a}「……この借りは、返す｜……この借りは返す｜……この借りは、お返しします」――無関心でいるには、もう遅かった。');
X.EASED=L('{a}は、まだ{b}が怖かった。それでも、自分を助けた手の温かさだけは、どうしても忘れられなかった。{a}「……ありがとう。ちょっとだけ、怖くなくなった｜……礼を言う。少しだけ、怖くなくなった｜……ありがとうございます。少しだけ、怖くなくなりました」|'+
'{a}の肩から、ほんの少しだけ力が抜けた。{b}の声を聞いても、前ほどは体がすくまなかった。恐怖は消えていない。けれど、その輪郭が、少しだけぼやけた。|'+
'{a}は、{b}に礼を言おうとして、言葉に詰まった。怖い人だと思っていた。その人に、危ないところを救われた。{a}「……あなたのこと、少しだけ分からなくなった｜……あなたのことが、少しだけ分からなくなった｜……あなたのこと、少しだけ分からなくなりました」');
X.AFTER_HELP=L('{a}は、{b}に助けられた。|あのとき、{a}に手を差し伸べたのは{b}だった。|{a}は、思いがけず{b}に助けられた。');
X.END={
hate:'{a}が{b}に抱いていた恐怖は、憎しみに変わった。',
scorn:'{a}は、あれほど恐れていた{b}を、最後には見下すようになった。',
shelter:'{a}は、弱った{b}を手の中に囲い込んだ。恐怖は、歪んだ庇護に変わった。',
fled:'{a}は{b}から逃れ、もう怯えて眠ることはなかった。',
love:'{a}の{b}への恐怖は、いつしか恋に変わっていた。',
deep:'{a}の{b}への恐怖は、深まるばかりだった。',
eased:'{a}の{b}への恐怖は、少しだけ和らいだ。',
moved:'無関心だった{a}の心が、{b}に向かって動いた。',
shaken:'{a}は、もう{b}に無関心ではいられなかった。',
ahate:'{a}の{b}への無関心は、憎しみに変わった。'
};
X.EDGE={hate:'恐怖→憎悪',scorn:'恐怖→見下し',shelter:'恐怖→歪んだ庇護',fled:'恐怖から逃れた',love:'恐怖→恋',deep:'恐怖が深まった',eased:'恐怖が和らいだ',moved:'無関心→心が動いた',shaken:'無関心でいられない',ahate:'無関心→憎悪'};
})();
});
;
/* ==== js/cold-fear.js ==== */
HK.Load.def(195,'js/cold-fear.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK|| !HK.addTo|| !HK.wrap|| !HK.COMMON|| !HK.ColdFearText)return;
var X=HK.ColdFearText;
var CF=HK.ColdFear=HK.ColdFear||{};
CF.K={apathy:0.25,fear:0.1};
CF.EXT={zombie:1,island:1,br:1,trial:1,jashin:1,yakata:1,jinro:1,ship:1};
CF.trace=null;
CF.LOVE_P=0.08;
var PK=['proud','stern','tsun','gentle','devoted','cool','free','shy','polite'];
function per(c){
var k=c&&c.persona;
if(PK.indexOf(k)>=0)return k;
k=c&&HK.personaOf?HK.personaOf(c):'gentle';
return PK.indexOf(k)>=0?k:'gentle';
}
function trOf(c){return(c&&c.tr)||(c&&c.eg&&HK.traits?HK.traits(c.eg):HK.traits({}));}
function isCtx(x){return!!(x&&x.R&&x.pair&&x.chars);}
function here(c){return!!c&&(HK.State&&HK.State.here?HK.State.here(c):c.alive!==false);}
function pc(v){return Math.round((v||0)*100);}
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}
function fill(t,m){return String(t).replace(/\{(a|b|w)\}/g,function(s,k){var v=m[k];return v==null?s:typeof v==='string'?v:v.name;});}
function pickOf(Z,arr){
if(!arr|| !arr.length)return'';
if(isCtx(Z))return Z.pick(arr);
if(HK.Story&&HK.Story.pick&&Z&&Z.recent)return HK.Story.pick(Z,arr);
return arr[Math.floor(Z.rng()*arr.length)];
}
function scenOf(Z){return Z&&Z.scen?Z.scen.id:'';}
function note(Z,p,k){
if(!CF.trace)return;
CF.trace.push({scen:scenOf(Z),k:k,type:p.type,h:p.h,t:p.t,to:p.st,lv: !!p.lv});
}
var ACTIVE_F={'':1,deep:1,eased:1,fled:1};
function fearOn(p){return p.type==='fear'&& !!ACTIVE_F[p.st||''];}
function apaOn(p){return p.type==='apathy'&& !p.st;}
CF.fearOn=fearOn;CF.apaOn=apaOn;
function build(ties,P){
var out={},any=false;
(ties||[]).forEach(function(t){
if(!t||(t.type!=='apathy'&&t.type!=='fear')||t.a===t.b|| !P[t.a]|| !P[t.b])return;
var k=t.a+'>'+t.b;
if(out[k]&&out[k].type==='fear')return;
out[k]={h:t.a,t:t.b,type:t.type,lv: !!(HK.tieLoveOK&&HK.tieLoveOK(t)),st:'',deep:0};
any=true;
});
return any?out:null;
}
CF.pairOf=function(Z,h,t){var m=Z&&Z._cf;return m&&h&&t?m[h.i+'>'+t.i]||null:null;};
function rk(a,b){return a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;}
function weakE(ctx,c){
if(!c|| !here(c))return'';
var f=c.flags||{};
if(c.z&&c.z.bitten)return'ゾンビに噛まれた';
if(f.venom)return'毒に倒れた';
if(c.z&&c.z.fever)return'熱に浮かされて起き上がれなくなった';
if(typeof c.hp==='number'&&c.hp<=60)return'けがを負って、まともに動けなくなった';
if(c.z&&c.z.wound>=0)return'けがを負って、足を引きずるようになった';
if(c.z&&(c.z.hunger||0)>=2)return'飢えでひどくやつれた';
if(f.ostra)return'皆から爪弾きにされた';
if(ctx.flags&&ctx.flags.bully&&ctx.flags.bully.tg===c.i&&ctx.flags.bully.stopped==null)return'いじめの標的にされた';
if(f.exposed)return'隠していたことを暴かれた';
if((f.slump||0)>=2)return'心が折れて沈み込んだ';
if(f.down&&f.down<900)return'倒れて動けなくなった';
if((f.drunk||0)>=75)return'酔いつぶれて醜態をさらした';
if((c.stress||0)>=82)return'追い詰められて取り乱した';
return'';
}
var SW={
jashin:function(S,c){
if(c.m&&c.m.hp<=50)return'けがを負って動けなくなった';
if(c.possessed)return'何かに取り憑かれて、うわ言を繰り返すようになった';
if(c.curse!=null)return'呪いの痣に怯えて取り乱した';
if(c.m&&c.m.fear>=70)return'震えが止まらなくなった';
return'';
},
jinro:function(S,c){
var live=S.P.filter(function(q){return q.alive&&q.role!=='wolf'&&q.sus;});
function avg(x){var o=live.filter(function(q){return q!==x;});return o.length?o.reduce(function(s0,q){return s0+(q.sus[x.i]==null?50:q.sus[x.i]);},0)/o.length:0;}
var v=avg(c),top=S.P.filter(function(q){return q.alive&&q!==c;}).every(function(q){return avg(q)<=v;});
return v>=55||(top&&v>=50)?'皆から人狼だと疑われた':'';
},
yakata:function(S,c){
if(c.m&&c.m.sus>=45)return'犯人ではないかと疑われた';
if(c.m&&c.m.fear>=70)return'怯えきって、まともに口もきけなくなった';
return'';
},
ship:function(S,c){
if(c.inf>0)return'感染症に倒れた';
if(c.m&&c.m.hp<55)return'体を壊して寝込んだ';
if(c.m&&c.m.fear>=70)return'漂流の恐怖に押しつぶされかけた';
return'';
}
};
function hereS(p){return!!p&&here(p)&& !p.bound&& !p.locked&& !p.mad&& !p.away&& !p.panic&& !p.out;}
function weak(Z,c){
if(isCtx(Z))return weakE(Z,c);
var f=SW[scenOf(Z)];
return f&&hereS(c)?f(Z,c):'';
}
CF.weak=weak;
CF.setup=function(ctx){
var all=[];
Object.keys(ctx.tiesAll||{}).forEach(function(k){(ctx.tiesAll[k]||[]).forEach(function(t){all.push(t);});});
ctx._cf=build(all,ctx.chars);
if(!ctx._cf)return;
Object.keys(ctx._cf).forEach(function(k){
var p=ctx._cf[k];
if(p.type==='apathy'&&p.lv){p.slow=true;if(ctx._frz)delete ctx._frz[k];}
});
};
if(HK.Ties&&HK.Ties.freezeInit)HK.wrap(HK.Ties,'freezeInit',function(prev){
return function(ctx){var r=prev.apply(this,arguments);if(ctx&&ctx.chars)CF.setup(ctx);return r;};
});
function slowK(p,f,v){
if(p.type==='apathy'){
if(p.st)return f==='att'&&v>0?0.5:1;
return p.slow?CF.K.apathy:1;
}
if(!fearOn(p))return 1;
if(f==='att')return v>0?CF.K.fear:1;
if(f==='aff')return v>0?CF.K.fear/0.6:1.5;
if(f==='trust')return v>0?CF.K.fear/0.5:1.5;
if(f==='ten')return v>0?1.3:0.5;
return 1;
}
if(HK.Ctx&&HK.Ctx.prototype.mod)HK.wrap(HK.Ctx.prototype,'mod',function(prev){
return function(a,b,d,scale){
var m=this._cf;
if(!m||this._cfRaw|| !a|| !b|| !d)return prev.apply(this,arguments);
var p=m[a.i+'>'+b.i];
if(!p)return prev.apply(this,arguments);
var d2={};
for(var f in d)d2[f]=typeof d[f]==='number'?d[f]*slowK(p,f,d[f]):d[f];
return prev.call(this,a,b,d2,scale);
};
});
function raw(ctx,a,b,d){
if(!a|| !b||a===b|| !d)return;
var k=a.i+'>'+b.i;
if(ctx._frz&&ctx._frz[k])delete ctx._frz[k];
ctx._cfRaw=(ctx._cfRaw||0)+1;
try{ctx.mod(a,b,d);}finally{ctx._cfRaw--;}
}
function apaBreak(ctx,p,st){
var k=p.h+'>'+p.t;
p.st=st;
if(ctx._frz)delete ctx._frz[k];
if(ctx._apathy)delete ctx._apathy[k];
}
function fearEnd(ctx,p,st){
p.st=st;
if(!ACTIVE_F[st]&&ctx._fear)delete ctx._fear[p.h+'>'+p.t];
}
function endNote(Z,p,k){
var t=X.END[k];if(!t)return;
var P=isCtx(Z)?Z.chars:Z.P,s=fill(t,{a:P[p.h],b:P[p.t]});
if(isCtx(Z)){var l=Z.flags.endNotes=Z.flags.endNotes||[];if(l.indexOf(s)<0)l.push(s);}
p.end=k;
}
CF.raw=raw;CF.apaBreak=apaBreak;CF.fearEnd=fearEnd;CF.endNote=endNote;CF.note=note;
CF.per=per;CF.trOf=trOf;CF.fill=fill;CF.pickOf=pickOf;CF.here=here;CF.isCtx=isCtx;
if(HK.Ctx&&HK.Ctx.prototype.others)HK.wrap(HK.Ctx.prototype,'others',function(prev){
return function(a){
var l=prev.apply(this,arguments),m=this._cf;
if(!m|| !a|| !this._cfFled)return l;
var self=this;
return l.filter(function(c){return!self._cfFled[a.i+'>'+c.i];});
};
});
var KNAME={push:'突き落とした',abandon:'見捨てて逃げた',let:'見殺しにした',sell:'「私は悪くない……」と言いながら売り渡した',scorn:'見下した',retort:'言い返した',cut:'縁を切った',flee:'逃れた',shelter:'歪んだ庇護欲を向けた',love:'恋に転じた'};
var KTO={push:'hate',abandon:'hate',let:'hate',sell:'hate',scorn:'scorn',retort:'hate',cut:'scorn',flee:'fled',shelter:'shelter',love:'love'};
CF.KNAME=KNAME;CF.KTO=KTO;
function tiesOf(Z,a,b){
if(isCtx(Z))return HK.Ties&&Z.tiesAll?HK.Ties.all(Z,a,b):[];
return(Z.ties||Z._cfIn||[]).filter(function(t){return t&&((t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i));});
}
function hostile(Z,a,b){
return tiesOf(Z,a,b).some(function(t){
var D=HK.TIES&&HK.TIES[t.type];
if(t.type==='lovehate'&&(t.a===a.i||t.cold==='both'))return true;
if(t.lh&&(t.lh==='both'||(t.lh==='a')===(t.a===a.i)))return true;
return!!(D&&D.hate&&(t.a===a.i|| !t.cold));
});
}
function affOf(Z,a,b){
if(isCtx(Z))return Z.R(a,b).aff;
var d=Z.relD&&Z.relD[rk(a,b)];
return(d||0)*100;
}
function romOK(Z,a,b){
if(!HK.canLove|| !HK.canLove(a,b)|| !HK.canLove(b,a))return false;
if(isCtx(Z))return!!Z.romanceOk&&Z.romanceOk([b,a]);
return!(Z.env&&Z.env.romance!=null&&Z.env.romance!==''&& +Z.env.romance===0);
}
function lethalOK(Z,a,b){
if(!b||b.alive===false)return false;
if(HK.Attr&&HK.Attr.noKillPair&&HK.Attr.noKillPair(a,b))return false;
if(HK.Special&&HK.Special.canRevive&&HK.Special.canRevive(b))return false;
return true;
}
function wpick(Z,ws){
var keys=Object.keys(ws).filter(function(k){return ws[k]>0;});
if(!keys.length)return'';
return HK.weighted(Z.rng,keys,function(k){return ws[k];});
}
function extActs(Z,a,b,w){
var id=scenOf(Z),L0=lethalOK(Z,a,b),kf=HK.Dark?HK.Dark.f(Z,'kill'):1,o={};
if(id==='zombie'||id==='br'){if(L0)o.push=1.1*kf;o.abandon=1;}
else if(id==='island')o.abandon=1;
else if(id==='trial')o.sell=1.4;
else if(id==='jashin'){o.sell=b.curse!=null?0:1.2;o.abandon=0.8;}
else if(id==='jinro'||id==='yakata'){o.sell=1.3;o.abandon=0.7;}
else if(id==='ship'){o.abandon=1;o.sell=0.8;}
if(isCtx(Z)&&(id==='zombie'||id==='island'||id==='br')&& /噛まれた|毒に|けが/.test(w))o.let=1;
if((id==='jinro'||id==='trial')&& !L0)o.sell=0;
return o;
}
CF.choose=function(Z,a,b,w){
var t=trOf(a),p=per(a),id=scenOf(Z);
var why=[];
var p0=CF.pairOf(Z,a,b);
if(p0&&p0.lv&&romOK(Z,a,b)&&affOf(Z,a,b)>5&&Z.rng()<CF.LOVE_P)return{k:'love',why:'恋愛：あり・もともと好意があった（まれ）'};
var hos=hostile(Z,a,b),lh=HK.LoveHate&&HK.LoveHate.dir?HK.LoveHate.dir(Z,a,b):'';
var wA=t.aggr*1.2+t.cp*0.7+(hos?0.45:0)+(lh==='a'||lh==='both'?0.45:0)+(p==='proud'||p==='stern'?0.15:0);
var wF=t.ac*1.1+t.caution*0.5+(p==='shy'||p==='polite'?0.2:0);
var wS=t.np*1.2+(p==='devoted'||p==='gentle'?0.25:0);
var g=wpick(Z,{aggr:wA*wA,flee:wF*wF,shel:wS*wS});
if(g==='flee')return{k:'flee',why:'臆病さ（AC '+pc(t.ac)+'・慎重さ '+pc(t.caution)+'）'};
if(g==='shel')return{k:'shelter',why:'面倒見のよさ（NP '+pc(t.np)+'）が、弱った相手への歪んだ庇護欲に転じた'};
why.push('攻撃性 '+pc(t.aggr)+'・CP '+pc(t.cp)+(hos?'・敵視':'')+(lh?'・愛憎':''));
if(CF.EXT[id]){
var k=wpick(Z,extActs(Z,a,b,w));
if(k)return{k:k,why:why.join('')+'・極限の箱庭'};
}
var k2=wpick(Z,{retort:t.aggr+(hos?0.4:0),scorn:t.cp+(p==='proud'?0.3:0),cut:0.35+t.a*0.4});
return{k:k2||'scorn',why:why.join('')};
};
function actText(Z,k){
var id=scenOf(Z),A=X.ACT[k];
if(A)return A[id]||A.gen||A.zombie;
return X.FALL[k];
}
function pairsOf(ctx,h){
var m=ctx._cf,out=[];
if(!m)return out;
for(var k in m)if(m[k].h===h.i)out.push(m[k]);
return out;
}
function seen(ctx,a,b){return ctx.others(a).indexOf(b)>=0;}
function freeE(c){return here(c)&& !(c.flags&&(c.flags.caged!=null||c.flags.down))&& !c.mad;}
function fallOf(ctx,a){
if(!ctx._cf|| !freeE(a))return null;
var L0=pairsOf(ctx,a);
for(var i=0;i<L0.length;i++){
var p=L0[i],b=ctx.chars[p.t];
if(!fearOn(p)||p.st==='fled'||p.fellAt===ctx.stepIndex|| !here(b)|| !(seen(ctx,a,b)||(p.metAt!=null&&ctx.stepIndex-p.metAt<=1)))continue;
var w=weakE(ctx,b);
if(w)return{p:p,b:b,w:w};
}
return null;
}
function tendOf(ctx,b){
if(!ctx._cf|| !freeE(b))return null;
for(var k in ctx._cf){
var p=ctx._cf[k];
if(p.t!==b.i||p.tended||p.st==='fled'|| !(apaOn(p)||fearOn(p)))continue;
var a=ctx.chars[p.h];
if(!here(a)|| !seen(ctx,b,a)||CF.pairOf(ctx,b,a))continue;
if(HK.Avoid&&HK.Avoid.of&&HK.Avoid.of(ctx,b,a))continue;
var w=weakE(ctx,a);
if(!w)continue;
var t=trOf(b),r=ctx.R(b,a),will=t.np*0.8+t.warmth*0.3+Math.max(0,r.aff)/80-Math.max(0,r.ten-40)/120;
if(will>0.45)return{p:p,a:a,w:w,will:will};
}
return null;
}
function movedOf(ctx,a){
if(!ctx._cf|| !freeE(a))return null;
var L0=pairsOf(ctx,a);
for(var i=0;i<L0.length;i++){
var p=L0[i],b=ctx.chars[p.t];
if(p.pend&&ctx.stepIndex>=p.pend.at&&(apaOn(p)||fearOn(p))&&here(b)&&seen(ctx,a,b))return{p:p,b:b};
}
return null;
}
function moveE(ctx,p,a,b){
var head;
if(p.type==='apathy'){
raw(ctx,a,b,{trust:14,aff:10,ten:4});
apaBreak(ctx,p,'moved');endNote(ctx,p,'moved');
head='無関心の変化：'+a.name+'は'+b.name+'に無関心だったが、劇的なことで心が動いた（信頼・好意が上がった）';
}else{
raw(ctx,a,b,{ten: -14,trust:8,aff:5});
fearEnd(ctx,p,'eased');p.eased=(p.eased||0)+1;
if(!p.end||p.end==='deep')endNote(ctx,p,'eased');
head='恐怖の変化：'+a.name+'の'+b.name+'への恐怖が、少し和らいだ（恐怖は消えない）';
}
note(ctx,p,'rescue');
return head;
}
function deferKill(ctx,b,how,killer){ctx._cfDefer={v:b,how:how,k:killer||null};return true;}
function fallE(ctx,a,b,f){
var p=f.p,w=f.w,c=CF.choose(ctx,a,b,w),k=c.k,m={a:a,b:b,w:w};
var text=fill(pickOf(ctx,actText(ctx,k)),m),dead=false,few=HK.Dark&&HK.Dark.few?HK.Dark.few(ctx):1,kf=HK.Dark?HK.Dark.f(ctx,'kill'):1;
p.fellAt=ctx.stepIndex;
if(k==='push')dead=deferKill(ctx,b,'恐れていた相手に突き落とされた',a);
else if(k==='abandon'||k==='let'){
if(typeof b.hp==='number')b.hp=Math.max(1,b.hp-(k==='let'?15:20));
ctx.stress(b,20);
var pr=(k==='let'?0.55:0.35)*kf*few;
if(lethalOK(ctx,a,b)&&ctx.rng()<pr)dead=deferKill(ctx,b,k==='let'?'助けを拒まれ、見殺しにされた':'見捨てられ、取り残された',null);
else text+=fill(pickOf(ctx,X.SURVIVE),m);
}else if(k==='sell'){
ctx.present().forEach(function(o){if(o!==a&&o!==b)ctx.mod(o,b,{trust: -12,ten:10});});
}else if(k==='flee'){
(ctx._cfFled=ctx._cfFled||{})[a.i+'>'+b.i]=1;
}
var D={
push:[{ten: -40,aff: -20},null],abandon:[{ten: -35,aff: -15,trust: -15},{aff: -35,trust: -45,ten:30}],let:[{ten: -35,aff: -15,trust: -15},{aff: -35,trust: -45,ten:30}],
sell:[{ten: -35,aff: -15},{aff: -40,trust: -50,ten:35}],scorn:[{ten: -35,aff: -10,trust: -10},{ten:15,aff: -10}],retort:[{ten: -30,aff: -15},{ten:20}],
cut:[{ten: -30,aff: -20,trust: -15},{aff: -10,ten:10}],flee:[{ten: -15},null],shelter:[{ten: -35,aff:12,trust:5},{trust:12,aff:6,ten:6}],
love:[{ten: -30,aff:20,att:46,trust:10},null]
}[k];
raw(ctx,a,b,D[0]);
if(D[1]&& !dead)ctx.mod(b,a,D[1]);
if(k==='love'){var r=ctx.R(a,b);if(r.att<46)r.att=46;}
ctx.stress(a,k==='push'||k==='let'?15:k==='flee'? -10:5);
fearEnd(ctx,p,KTO[k]);endNote(ctx,p,KTO[k]);note(ctx,p,k);
var why='恐怖の変化：'+a.name+'は'+b.name+'を恐れていたが、'+b.name+'が'+w+'のを見て、恐怖を保てなくなった（'+c.why+'）→ '+KNAME[k]+(dead?'（'+b.name+'は命を落とした）':'');
return{text:text,why:why,k:k,dead:dead};
}
HK.addTo(HK.COMMON,[
{
id:'cf_fall',label:'恐れていた相手の落ちぶれた姿に態度が変わる',cat:'conflict',scope:'solo',tie:'fear',tags:['death','cruel'],pri:true,noOdd:true,
when:function(ctx,a){return!!fallOf(ctx,a);},
w:function(ctx,a){return fallOf(ctx,a)?60:0;},
run:function(ctx,a){
var f=fallOf(ctx,a);if(!f)return null;
var r=fallE(ctx,a,f.b,f);
return{with:[f.b],cat:r.k==='shelter'||r.k==='love'?'bond':r.k==='flee'?'solo':'conflict',text:r.text,why:r.why,mag:r.dead?40:24};
}
},
{
id:'cf_tend',label:'弱ったところを恐れ・無関心の相手に助けられる',cat:'help',scope:'solo',tie:'apathy,fear',pri:true,noOdd:true,
when:function(ctx,b){return!!tendOf(ctx,b);},
w:function(ctx,b){var x=tendOf(ctx,b);return x?2+x.will*4:0;},
run:function(ctx,b){
var x=tendOf(ctx,b);if(!x)return null;
var a=x.a,p=x.p;p.tended=true;
if(typeof a.hp==='number')a.hp=Math.min(100,a.hp+15);
ctx.stress(a,-10);
ctx.mod(b,a,{aff:4,trust:3});
var head=moveE(ctx,p,a,b),m={a:a,b:b,w:x.w};
var tk= /爪弾き|いじめ|暴かれ|疑われ/.test(x.w)?'social': /心が折れ|取り乱|酔いつぶれ|震え|怯え/.test(x.w)?'mind':'hurt';
var text=fill(pickOf(ctx,X.TEND[tk]),m)+fill(pickOf(ctx,p.type==='apathy'?X.MOVED:X.EASED),m);
return{with:[a],text:text,why:head+'／'+b.name+'が、'+x.w+a.name+'を助けた（NP '+pc(trOf(b).np)+'）',mag:20};
}
},
{
id:'cf_moved',label:'助けられて無関心・恐怖が揺らぐ',cat:'bond',scope:'solo',tie:'apathy,fear',pri:true,noOdd:true,
when:function(ctx,a){return!!movedOf(ctx,a);},
w:function(){return 6;},
run:function(ctx,a){
var x=movedOf(ctx,a);if(!x)return null;
var p=x.p,b=x.b;p.pend=null;
var head=moveE(ctx,p,a,b),m={a:a,b:b};
var text=fill(pickOf(ctx,X.AFTER_HELP),m)+fill(pickOf(ctx,p.type==='apathy'?X.MOVED:X.EASED),m);
return{with:[b],text:text,why:head+'／'+b.name+'に庇われた・救われたあと',mag:14};
}
}
]);
var RESCUE_RE= /庇っ|かばっ|庇い|かばい|身を挺|助け出|救い出|引き上げ|引っ張り上げ|手当て|看病|介抱|止血|担いで|背負って|盾にな|命を救|救出|助けた|助けられ/;
var THREAT_RE= /怒鳴|脅し|脅さ|脅す|殴|蹴り|蹴っ|突き飛ば|胸ぐら|見せしめ|威圧|睨みつけ|罵|怒声|平手|首を絞|押さえつけ/;
var OWN_RE= /(?:無関心|恐怖)の変化：/;
var DEATH_RE= /殺さ|殺し|殺す|死ん|死因|息絶|命を落と|動かなくな|もう動かなかった|亡骸|遺体|犠牲者|事切れ/;
var CALM_RE= /なだめ|割って入|止めに入|引き離|仲裁|落ち着かせ|別々の部屋に連れ/,SOFT_CAT={help:1,bond:1,romance:1,care:1,kind:1};
function watch(Z,idx,o){
var P=isCtx(Z)?Z.chars:Z.P,T=P[idx[0]],s=String(o.text||'')+' '+String(o.why||'')+' '+String(o.tag||''),add='';
if(!T||OWN_RE.test(String(o.why||'')))return'';
var resc=RESCUE_RE.test(s)&&(o.cat==='help'|| /救出|庇|かば|助け|看病|手当/.test(String(o.tag||'')+s));
var thr= !resc&&THREAT_RE.test(s)&& !SOFT_CAT[o.cat]&& !CALM_RE.test(s)&& !DEATH_RE.test(s)&&here(T);
if(!resc&& !thr)return'';
var step=isCtx(Z)?Z.stepIndex:(Z._cfStep||0);
idx.slice(1).forEach(function(j){
var H=P[j],p=H?CF.pairOf(Z,H,T):null;
if(!p||H===T)return;
if(resc&&(apaOn(p)||fearOn(p))&&p.st!=='fled'&& !p.pend)p.pend={at:step};
else if(thr&&fearOn(p)&&p.thrAt!==step&&here(H)){
p.thrAt=step;p.deep++;
if(isCtx(Z))raw(Z,H,T,{ten:8,trust: -6,aff: -5});
else{Z.relD=Z.relD||{};var k=rk(H,T);Z.relD[k]=clamp((Z.relD[k]||0)-0.06,-1,1);}
if(p.st===''||p.st==='eased'){p.st='deep';endNote(Z,p,'deep');}
note(Z,p,'threat');
add+='／恐怖の変化：'+H.name+'の'+T.name+'への恐怖が深まった（'+(idx.length===2?'脅し・暴力を向けられた':'脅し・暴力を目の当たりにした')+'）';
}
});
return add;
}
if(HK.Ctx&&HK.Ctx.prototype.say)HK.wrap(HK.Ctx.prototype,'say',function(prev){
return function(o){
if(this._cf&&o&&o.kind==='event'&&o.actors&&o.actors.length>=2&&typeof o.text==='string'){
var idx=o.actors.filter(Boolean).map(function(c){return c.i;}),m0=this._cf,si=this.stepIndex;
Object.keys(m0).forEach(function(k){var q=m0[k];if(idx.indexOf(q.h)>=0&&idx.indexOf(q.t)>=0)q.metAt=si;});
var add=watch(this,idx,o);
if(add)o.why=String(o.why||'')+add;
}
var e=prev.apply(this,arguments),D0=this._cfDefer;
if(D0&&o&&OWN_RE.test(String(o.why||''))){
this._cfDefer=null;
if(e&& !e.skipped&&D0.v.alive)this.kill(D0.v,D0.k,D0.how);
}
return e;
};
});
var ST=HK.Story;
function take(S,b){return function(){b.taken=true;b.takenAt=S.h;};}
var SA={
jashin:{
sell:function(S,a,b){return b.curse==null?{t:b.name+'は村人に連れ去られた（生贄の候補）',gone:true,go:take(S,b)}:null;},
abandon:function(S,a,b){
var gone=b.curse==null&&S.rng()<0.4*(HK.Dark?HK.Dark.f(S,'raid'):1);
return{t:gone?b.name+'は逃げ遅れ、村人に連れ去られた':'',gone:gone,go:function(){b.m.hp=clamp(b.m.hp-15,1,100);b.m.fear=clamp(b.m.fear+20,0,100);if(gone)take(S,b)();}};
}
},
jinro:{
ok:function(S){return/昼/.test(S.label||'');},
sell:function(S,a,b){return{t:b.name+'への疑いが一気に集まった',go:function(){S.P.forEach(function(q){if(q!==b&&q.alive&&q.role!=='wolf'&&q.sus)q.sus[b.i]=clamp((q.sus[b.i]==null?50:q.sus[b.i])+22,0,100);});}};},
abandon:function(S,a,b){return{t:'',go:function(){if(a.sus)a.sus[b.i]=100;S.P.forEach(function(q){if(q!==b&&q!==a&&q.alive&&q.role!=='wolf'&&q.sus)q.sus[b.i]=clamp((q.sus[b.i]==null?50:q.sus[b.i])+8,0,100);});}};}
},
yakata:{
sell:function(S,a,b){return{t:b.name+'への疑いが強まった',go:function(){b.m.sus=clamp(b.m.sus+25,0,100);}};},
abandon:function(S,a,b){return{t:'',go:function(){b.m.fear=clamp(b.m.fear+20,0,100);}};}
},
ship:{
sell:function(S,a,b){return{t:b.name+'は皆の信頼を失った',go:function(){S.relD=S.relD||{};S.P.forEach(function(q){if(q!==a&&q!==b&&q.alive){var k=rk(q,b);S.relD[k]=clamp((S.relD[k]||0)-0.15,-1,1);}});}};},
abandon:function(S,a,b){return{t:'',go:function(){b.m.hp=clamp(b.m.hp-12,1,100);}};}
}
};
CF.STORY=SA;
var RELD={hate: -0.5,scorn: -0.35,fled: -0.2,shelter:0.25,love:0.35,moved:0.18,eased:0.08};
function relS(S,a,b,d){if(!d)return;S.relD=S.relD||{};var k=rk(a,b);S.relD[k]=clamp((S.relD[k]||0)+d,-1,1);}
function dampS(S){
if(!S.relD)return;
var last=S._cfLast=S._cfLast||{};
Object.keys(S._cf).forEach(function(k){
var p=S._cf[k],a=S.P[p.h],b=S.P[p.t];if(!a|| !b)return;
var key=rk(a,b),cur=S.relD[key]||0,prev=last[key];
var slow=p.type==='apathy'?(apaOn(p)?CF.K.apathy:0):(fearOn(p)?CF.K.fear:0);
if(slow&&prev!=null&&cur>prev)S.relD[key]=prev+(cur-prev)*slow;
last[key]=S.relD[key]||0;
});
}
function storyFall(S,A){
var id=scenOf(S);
var ks=Object.keys(S._cf);
for(var i=0;i<ks.length;i++){
var p=S._cf[ks[i]],a=S.P[p.h],b=S.P[p.t];
if(!fearOn(p)||p.st==='fled'|| !hereS(a)|| !hereS(b))continue;
var w=weak(S,b);
if(!w||S.rng()>0.55)continue;
var c=CF.choose(S,a,b,w),k=c.k,m={a:a,b:b,w:w};
var text=fill(pickOf(S,actText(S,k)),m),fx=A[k]?A[k](S,a,b):null;
if((k==='abandon'||k==='let')&& !(fx&&fx.gone)&&id!=='jinro'&&id!=='yakata')text+=fill(pickOf(S,X.SURVIVE),m);
relS(S,a,b,RELD[KTO[k]]);
p.st=KTO[k];p.end=KTO[k];note(S,p,k);
if(k==='flee')(S._cfFled=S._cfFled||{})[a.i+'>'+b.i]=1;
var o=ST.say(S,{actors:[a,b],tag:'恐怖の変化',text:text,why:'恐怖の変化：'+a.name+'は'+b.name+'を恐れていたが、'+b.name+'が'+w+'のを見て、恐怖を保てなくなった（'+c.why+'）→ '+KNAME[k]+(fx&&fx.t?'（'+fx.t+'）':''),mag:26});
if(fx&&fx.go)fx.go();
if(o&&ST.key&&(k==='sell'||(fx&&fx.gone)))ST.key(S,o,a.name+'が'+b.name+'を'+(k==='sell'?'売り渡した':'見捨てた'));
return true;
}
return false;
}
function storyMoved(S){
var ks=Object.keys(S._cf);
for(var i=0;i<ks.length;i++){
var p=S._cf[ks[i]],a=S.P[p.h],b=S.P[p.t];
if(!p.pend|| !(apaOn(p)||fearOn(p))|| !hereS(a)|| !hereS(b))continue;
p.pend=null;
var m={a:a,b:b},head;
if(p.type==='apathy'){p.st='moved';p.end='moved';relS(S,a,b,RELD.moved);head='無関心の変化：'+a.name+'は'+b.name+'に無関心だったが、劇的なことで心が動いた';}
else{p.st='eased';if(!p.end||p.end==='deep')p.end='eased';relS(S,a,b,RELD.eased);head='恐怖の変化：'+a.name+'の'+b.name+'への恐怖が、少し和らいだ（恐怖は消えない）';}
note(S,p,'rescue');
ST.say(S,{actors:[a,b],tag:p.type==='apathy'?'無関心の変化':'恐怖の変化',text:fill(pickOf(S,X.AFTER_HELP),m)+fill(pickOf(S,p.type==='apathy'?X.MOVED:X.EASED),m),why:head+'／'+b.name+'に庇われた・救われたあと',mag:16});
return true;
}
return false;
}
CF.storyStep=function(S){
if(!S|| !S.P|| !S.scen||S._cfBusy)return;
if(S._cf===undefined)S._cf=build(S._cfIn||S.ties||[],S.P);
if(!S._cf)return;
S._cfStep=(S._cfStep||0)+1;
dampS(S);
var A=SA[scenOf(S)];
if(!A||(A.ok&& !A.ok(S)))return;
S._cfBusy=true;
try{if(!storyMoved(S))storyFall(S,A);}finally{S._cfBusy=false;}
};
if(ST&&ST.state)HK.wrap(ST,'state',function(prev){
return function(input){var S=prev.apply(this,arguments);if(S&&input){S._cfIn=input.ties||[];S._cf=undefined;}return S;};
});
if(ST&&ST.step)HK.wrap(ST,'step',function(prev){
return function(S){var r=prev.apply(this,arguments);try{CF.storyStep(S);}catch(e){if(HK.DEBUG)throw e;}return r;};
});
if(ST&&ST.say)HK.wrap(ST,'say',function(prev){
return function(S,o){
if(S&&S._cf&&o&&o.kind!=='step'&&o.kind!=='phase'&&o.actors&&o.actors.length>=2&&typeof o.text==='string'){
var idx=o.actors.map(function(x){return typeof x==='number'?x:x&&x.i;}).filter(function(x){return x!=null;});
var add=watch(S,idx,o);
if(add)o.why=String(o.why||'')+add;
}
return prev.apply(this,arguments);
};
});
var ECLS={hate:'enemy',scorn:'enemy',shelter:'guard',fled:'none',love:'pine',deep:'enemy',eased:'friend',moved:'friend',shaken:'obsess',ahate:'enemy'};
if(ST&&ST.result)HK.wrap(ST,'result',function(prev){
return function(S,input,o){
if(S&&S._cf&&o){
Object.keys(S._cf).forEach(function(k){
var p=S._cf[k],a=S.P[p.h],b=S.P[p.t],e=p.end;
if(!e|| !a|| !b|| !X.END[e])return;
var s=fill(X.END[e],{a:a,b:b});
if(o.ending&&Array.isArray(o.ending.lines)&&o.ending.lines.indexOf(s)<0)o.ending.lines.push(s);
if(Array.isArray(a.notes)&&a.notes.indexOf(s)<0)a.notes.push(s);
if(o.relmap&&Array.isArray(o.relmap.edges)&&X.EDGE[e])o.relmap.edges.push({a:a.i,b:b.i,label:'★'+X.EDGE[e],cls:ECLS[e]||'friend',dir:a.i});
});
}
return prev.apply(this,arguments);
};
});
var RCL={hate:'dislike',ahate:'dislike',scorn:'dislike',shelter:'guard',fled:'strangers'};
function cfEnd(ctx,A,B){
var p=CF.pairOf(ctx,A,B),q=CF.pairOf(ctx,B,A);
return p&&p.end?{p:p,h:A,t:B}:q&&q.end?{p:q,h:B,t:A}:null;
}
if(HK.TieRel&&HK.TieRel.refine)HK.wrap(HK.TieRel,'refine',function(prev){
return function(ctx,A,B,pf,cl){
var r=prev.apply(this,arguments),c=r||cl;
if(!ctx|| !ctx._cf|| !c|| !pf||pf.kill||pf.couple|| /^(kill|mutualkill|lovers|breakup)$/.test(c.id))return r;
var x=cfEnd(ctx,A,B);if(!x|| !RCL[x.p.end])return r;
return{id:RCL[x.p.end],dir:x.p.end==='shelter'?x.t.i:x.h.i};
};
});
if(HK.TieRel&&HK.TieRel.pairText)HK.wrap(HK.TieRel,'pairText',function(prev){
return function(ctx,A,B,cl){
var x=ctx&&ctx._cf&&cl&& !/^(kill|mutualkill|lovers|breakup)$/.test(cl.id)?cfEnd(ctx,A,B):null;
if(x&&X.END[x.p.end])return fill(X.END[x.p.end],{a:x.h,b:x.t});
return prev.apply(this,arguments);
};
});
})();
});
;
/* ==== js/hate-install.js ==== */
HK.Load.def(292,'js/hate-install.js',function(){
(function(){
'use strict';
var HK=window.HK,H=HK.HateKit,SC=HK.SCENARIOS;
if(!H|| !SC)return;
HK.atScen('zombie',function(s){H.install(s,{w:1.4});});
HK.atScen('classroom',function(s){H.install(s,{w:1.3,place:function(){return'教室で、';}});});
HK.atScen('goukon',function(s){H.install(s,{w:1.3,place:function(){return'合コンの席で、';}});});
HK.atScen('whiteroom',function(s){H.install(s,{w:1.3});});
HK.atScen('omega',function(s){H.install(s,{w:0.7,approach:function(ctx,a,b){return b.name+'は、'+a.name+'の匂いに引き寄せられるように、距離を詰めた。';}});});
})();
});
;
/* ==== js/obsess-install.js ==== */
HK.Load.def(295,'js/obsess-install.js',function(){
(function(){
'use strict';
var HK=window.HK,O=HK.Obsess,SC=HK.SCENARIOS;
if(!O|| !SC)return;
function L(s){return s.split('|');}
var P=O.PACK;
P.classroom={
where:'旧校舎の使われていない教室',
seed:L('{c}と並んで帰る{b}の後ろ姿を、{a}は教室の窓から見送った。その日から、{a}の目は{b}を追うのをやめられなくなった。|席替えで{b}の隣が{c}になった日、{a}は一日じゅう、二人の話し声に耳を澄ませていた。|{b}が{c}に貸したノートが返ってきたとき、{a}はそのページを何度も見返した。{c}の字が書き込まれていないか、確かめるように。'),
devote:L('{a}は{b}の分のノートまで清書して、毎朝そっと机に入れておいた。頼まれたことは一度もなかった。|{a}は購買で、{b}の好きなパンを毎日確保しておいた。|{a}は{b}が忘れた宿題を、筆跡を真似て代わりに仕上げていた。'),
bind:L('{a}「昼休み、どこ行ってたの？｜昼休み、どこへ行っていた？｜昼休み、どこへ行っていたんですか？」{b}が答えるまで、{a}は廊下で待っていた。|{a}は毎朝、{b}の下駄箱の前で{b}を待っていた。来る時間は、もう秒単位で分かっていた。|{a}は{b}の部活が終わるまで、誰もいない教室で待ち続けた。'),
purge:L('{b}に話しかけようとした同級生の前に、{a}はさりげなく立った。|{b}の隣の席に座ろうとした誰かに、{a}はただ笑いかけた。その子は黙って別の席に移った。'),
depend:L('{a}は休み時間のたびに{b}の席に来て、チャイムが鳴るまで離れなかった。|{a}は{b}が欠席した日、一日じゅう誰とも口をきかなかった。'),
devote2:L('{a}は{b}の時間割も、部活の予定も、帰り道も、全部覚えていた。|{a}の机の中には、{b}が使い終えたペンや消しゴムが、きれいに並べてしまってあった。'),
bind2:L('{a}は{b}のスマホに、位置を共有するアプリを入れさせた。「心配だから｜心配だからだ｜心配ですから」|{a}は{b}が{c}と話していた時間を、休み時間ごとに問い詰めた。'),
purge2:L('{c}の上履きが、ゴミ箱に捨てられていた。顔を上げると、遠くで{a}が笑っていた。|{a}は{c}の悪い噂を、クラスのグループにそっと流した。噂は{b}の耳にも届いた。|{a}は{c}の机に、「{b}に近づくな」とだけ書いた紙を入れた。'),
depend2:L('{a}「{b}が{c}と帰るなら、私、明日から学校来ない｜{b}が{c}と帰るなら、私は明日から学校に来ない｜{b}が{c}と帰るなら、私、明日から学校に来ません」|{a}は{b}の制服の袖を掴んだまま、保健室のベッドから離さなかった。'),
cage:L('{a}は放課後、{b}を旧校舎の準備室に連れ込み、外から鍵をかけた。「ここなら、誰も来ないよ｜ここなら、誰も来ない｜ここなら、誰も来ませんよ」|{a}は{b}を自分の家に連れ帰ったまま、帰さなかった。{b}の家には「{a}の家に泊まる」と連絡が入っていた。送ったのは{a}だった。'),
cage_s:L('{a}は放課後の空き教室に{b}を呼び出し、戸の前に立ったまま動かなかった。「……もう少しだけ、ここにいて｜……もう少しだけ、ここにいろ｜……もう少しだけ、ここにいてください」|{a}は{b}の鞄を抱えたまま、「一緒に帰るまで返さない｜＝｜一緒に帰るまで返しません」と言った。'),
cageDay:L('{b}の席は、今日も空いていた。担任は「体調不良」とだけ言った。{a}だけが、本当の理由を知っていた。|{a}は{b}のために、学校で配られたプリントを毎日持ち帰った。「ほら、ちゃんと授業にもついていけるよ｜ほら、これで授業にもついていける｜ほら、ちゃんと授業にもついていけますよ」'),
rescue:L('{c}は何日も学校に来ない{b}を不審に思い、{a}の家を訪ねた。奥の部屋から、物音がした。'),
harm:L('{c}は階段の踊り場で背中を押され、下まで転げ落ちた。見上げると、{a}が手すりに手をかけて見下ろしていた。|{c}の自転車のブレーキが、帰り道で効かなくなった。{c}は大けがをして入院した。'),
harm_s:L('{a}は{c}を校舎裏に呼び出し、笑顔のまま「{b}に近づかないでね｜{b}に近づくな｜{b}に近づかないでくださいね」と言った。|{c}の机には、「{b}に近づくな」と書かれた紙が、毎朝入っていた。'),
shinju:L('{a}は{b}の手を引いて、立入禁止の屋上の柵を越えた。「ずっと一緒だよ｜ずっと一緒だ｜ずっと一緒ですよ」――翌朝、二人は校庭で見つかった。|{a}は卒業式の前の夜、{b}を誰もいない教室に呼び出した。机の上には、二人分の薬が並べてあった。'),
shinjuFail:L('{a}は{b}の手を引いて、屋上の柵を越えようとした。{b}は{a}の腕を掴んで離さなかった。「……一緒に卒業しよう。それじゃだめ？｜……一緒に卒業しよう。それではだめか？｜……一緒に卒業しましょう。それではだめですか？」{a}はその場に崩れ落ちた。'),
shinju_s:L('{a}は{b}と並んで屋上の柵にもたれ、「このまま二人で消えちゃえたらいいのに｜このまま二人で消えてしまえたらいいのだが｜このまま二人で消えてしまえたらいいのに、と思います」と呟いた。{b}が手を握ると、{a}はようやく笑った。')
};
P.zombie={
seed:L('{c}が{b}をかばって前に出たとき、{a}は自分がその場所にいなかったことを、心の底から憎んだ。|夜の見張りで、{b}と{c}が肩を寄せて眠っていた。{a}は朝まで、二人から目を離さなかった。'),
devote:L('{a}は自分の食料を削ってまで、{b}の分を多くした。|{a}は見張りの番を何度も代わって、{b}を眠らせた。|{a}は{b}の武器の手入れを、毎晩欠かさなかった。'),
bind:L('{a}は{b}に、自分の目の届かない場所へ行かないよう何度も念を押した。「外は危ないから。……私から離れないで｜外は危ない。……私から離れるな｜外は危ないですから。……私から離れないでください」|{a}は{b}が物資を探しに出ると、必ず後ろからついていった。'),
purge:L('{a}は{b}に近づく生存者を、いつも冷たい目で見ていた。|{a}は{b}と同じ班に入ろうとした誰かを、「足手まといだ｜＝｜足手まといです」と追い払った。'),
depend:L('{a}「置いていかないで。……{b}がいなきゃ、私、とっくに死んでた｜置いていくな。……{b}がいなければ、私はとっくに死んでいた｜置いていかないでください。……{b}がいなければ、私、とっくに死んでいました」|{a}は物音がするたび、{b}の背中にしがみついた。'),
purge2:L('{a}は{c}の銃から、こっそり弾を抜いておいた。|{a}は{c}に、わざと危険な物資調達の役を押しつけた。|{a}は{c}の食料を、少しずつ自分の鞄に移していた。'),
bind2:L('{a}は{b}の靴を隠した。「外に出なければ、咬まれることもないでしょ｜外に出なければ、咬まれることもないだろう｜外に出なければ、咬まれることもないでしょう」|{a}は{b}が{c}と話すたび、見張りの交代を理由に引き離した。'),
depend2:L('{a}「{b}がゾンビになったら、私も咬まれに行く。本気だよ｜{b}がゾンビになったら、私も咬まれに行く。本気だ｜{b}がゾンビになったら、私も咬まれに行きます。本気です」|{a}は{b}がいない夜、銃口を自分のこめかみに当てたまま朝を待った。'),
where:function(ctx,a){var nm=(a&&a.z&&ctx.zb&&ctx.zb.A[a.z.area]&&ctx.zb.A[a.z.area].name)||'';return/港|埠頭/.test(nm)?'港の倉庫': /学校|校/.test(nm)?'学校の空き教室': /病院/.test(nm)?'病院の使われていない病室': /警察|署/.test(nm)?'警察署の留置室': /駅/.test(nm)?'駅の事務室': /店|モール|商店/.test(nm)?'店の倉庫':'近くの民家';},
cage:L('{a}は{b}を、バリケードで塞いだ{where}の奥の部屋に閉じ込めた。{a}は{b}を監禁したのだった。「外はゾンビだらけだよ。ここにいれば、私がずっと守ってあげる｜外はゾンビだらけだ。ここにいれば、私がずっと守ってやる｜外はゾンビだらけですよ。ここにいれば、私がずっと守ってあげます」|{a}は{b}を{where}に連れ込み、足首に鎖を巻いて柱につないだ。「ほら、もうどこにも行かなくていい｜＝｜ほら、もうどこにも行かなくていいんですよ」'),
cage_s:L('{a}は{b}を隠れ家の奥の部屋に押し込み、扉の前に座り込んだ。「外は危ない。……ここにいて｜外は危ない。……ここにいろ｜外は危ないです。……ここにいてください」'),
cageDay:L('{a}は毎日、外から集めてきた食料を{b}の部屋に運んだ。「今日は缶詰が三つあったよ｜今日は缶詰が三つあった｜今日は缶詰が三つありましたよ」|扉の外でゾンビの呻き声がするたび、{a}は{b}を抱きしめた。「大丈夫。私が全部、追い払ってあげる｜大丈夫だ。私が全部、追い払ってやる｜大丈夫です。私が全部、追い払ってあげます」'),
escape:L('{b}は{a}が物資を探しに出たすきに、窓を割って非常階段へ抜け出した。|{b}は{a}が見張りの最中にうとうとしたのを見逃さず、扉のバリケードを崩して外へ出た。'),
rescue:L('{c}は崩れかけたバリケードを壊し、奥の部屋に閉じ込められていた{b}を見つけた。|{c}は物資の減り方がおかしいことに気づき、{a}の後をつけた。行き着いた先に、{b}がいた。'),
harm:L('{a}は物資調達の途中、{c}を群れのいる路地に置き去りにした。{c}はなんとか逃げ帰ったが、もう{a}を見る目は前と違っていた。|{a}は{c}を見張り台から突き落とした。{c}は足を折り、まともに歩けなくなった。'),
harmKill:L('{a}は{c}の背中を、ゾンビの群れのほうへ突き飛ばした。{c}の悲鳴は、すぐに途切れた。{a}は{b}のもとへ戻り、「{c}は逃げ遅れた｜＝｜{c}は逃げ遅れました」とだけ言った。|{a}は眠っている{c}の部屋の扉を、外から開けたままにしておいた。朝になると、そこには何も残っていなかった。'),
shinju:L('{a}は残った最後の二発の弾を、{b}と自分のために取っておいた。「ゾンビになるくらいなら、一緒に｜＝｜ゾンビになるくらいなら、一緒に逝きましょう」――乾いた銃声が、二度響いた。|{a}は{b}を抱きしめたまま、群れの中へ歩いていった。「これで、もう誰にも取られない｜＝｜これで、もう誰にも取られません」'),
shinjuFail:L('{a}は最後の二発の弾を込めた銃を、{b}に向けた。{b}は銃口を掴んで下ろさせた。「生きるって決めたでしょ。……二人で｜生きると決めただろう。……二人で｜……二人で生きると、決めたでしょう」|{a}は{b}の手を引いて、群れのほうへ歩き出した。{b}はその手を強く引き戻し、{a}を抱きしめた。'),
shinju_s:L('{a}は{b}の肩にもたれて、「このまま、世界が終わっちゃえばいいのに｜このまま、世界が終わってしまえばいい｜このまま、世界が終わってしまえばいいのに、と思います」と呟いた。{b}は黙って、{a}の手を握った。')
};
P.goukon={
only:['cageDay','cage_s','harm_s'],
seed:L('{c}が{b}のグラスにお酒を注いだ瞬間、{a}は自分の中で何かが切れる音を聞いた。|{b}が{c}と連絡先を交換するのを見て、{a}は笑顔のまま、テーブルの下で拳を握りしめた。|{b}が{c}の冗談に笑うたび、{a}のグラスの氷が鳴った。'),
devote:L('{a}は{b}のグラスが空になる前に、必ず次の一杯を頼んでおいた。|{a}は{b}の好きな料理を、誰より先に取り分けて差し出した。'),
bind:L('{a}は{b}が席を立つたびに目で追い、戻るまでの時間を数えていた。|{a}「さっき{c}と、何話してたの？｜さっき{c}と、何を話していた？｜さっき{c}と、何を話していたんですか？」笑顔だったが、目は笑っていなかった。'),
purge:L('{a}は{b}の隣の席を、トイレから戻った{c}に譲らなかった。|{a}は{b}と{c}の会話に割り込み、話題を自分のほうへ持っていった。'),
depend:L('{a}「{b}が帰るなら、私も帰る。……{b}と一緒じゃないと嫌｜{b}が帰るなら、私も帰る。……{b}と一緒でなければ嫌だ｜{b}が帰るなら、私も帰ります。……{b}と一緒でないと嫌です」|{a}は{b}の服の裾を、テーブルの下でずっと掴んでいた。'),
devote2:L('{a}は{b}が初めて口にした地元の名前を、その場で検索していた。|{a}はもう、{b}の最寄り駅を知っていた。{b}は一度も教えていないのに。'),
bind2:L('{a}は{b}のスマホを取り上げて、{c}の連絡先を消した。「いらないでしょ、これ｜これは、いらないだろう｜これ、いらないですよね」|{a}は{b}の帰りの電車の時間を調べ上げ、「送っていく｜＝｜送っていきます」と譲らなかった。'),
purge2:L('{a}は{c}のグラスに、こっそり強いお酒を足していった。|{a}は{c}が席を外したすきに、「あの人、遊び人らしいよ｜あの人は、遊び人らしい｜あの人、遊び人らしいですよ」と{b}に囁いた。'),
depend2:L('{a}「今日{b}と会えなかったら、たぶん私、どうにかなってた｜今日{b}と会えなかったら、たぶん私はどうにかなっていた｜今日{b}と会えなかったら、たぶん私、どうにかなっていました」{a}の声は震えていた。'),
cage:L('{a}は二次会に向かう途中で{b}の手を引き、自分の部屋に連れ帰った。玄関の鍵を、内側からもう一つかけた。|{a}は酔った{b}をタクシーに乗せ、自分の家の住所を告げた。{b}が気づいたときには、もう部屋の中だった。'),
cage_s:L('{a}は店の外で{b}の手を握ったまま離さなかった。「二次会、行かないで。……今夜は、私と一緒にいて｜二次会には行くな。……今夜は、私と一緒にいろ｜二次会、行かないでください。……今夜は、私と一緒にいてください」'),
cageDay:L('{a}は{b}のスマホの電源を切って、引き出しにしまった。「今夜は、私だけでいいでしょ｜今夜は、私だけでいいだろう｜今夜は、私だけでいいでしょう」|{a}は{b}の隣にぴったりと座り、{b}が時計を見るたびに、その手を握った。|窓の外が白みはじめても、{a}は{b}を帰そうとしなかった。'),
rescue:L('{c}は{b}と連絡がつかないことを心配して、{a}の部屋のインターホンを鳴らし続けた。|{c}は{b}を乗せたタクシーを追いかけ、{a}の部屋の前までたどり着いた。'),
escape:L('{b}は{a}がシャワーを浴びているすきに、靴も履かずに部屋を飛び出した。|{b}は「水を買ってくる｜＝｜水を買ってきます」と言って部屋を出て、そのまま駅まで走った。'),
harm:L('{a}は{c}のグラスに、何杯分もの強い酒を混ぜた。{c}は店のトイレで倒れ、救急車で運ばれた。|{a}は帰り道の階段で、{c}の背中をそっと押した。{c}は足をくじいて、その夜は誰とも帰れなかった。'),
harm_s:L('{a}は{c}を店の外に呼び出し、笑顔のまま「{b}には近づかないでね｜{b}には近づくな｜{b}には近づかないでくださいね」と言った。{c}はその夜、二度と{b}の隣に座らなかった。'),
};
P.goukon.only.push('top','bottom');
P.whiteroom={
only:['cage','cage_s','cageDay','escape','rescue','release','shinju_s'],
seed:L('閉ざされた部屋の中で、{b}が{c}にだけ見せる笑顔を、{a}は見逃さなかった。|{b}が{c}と小声で話しているあいだ、{a}は壁を見つめたまま、二人の声だけを聞いていた。'),
devote:L('{a}は部屋にあった水と食べ物を、{b}に多めに回した。自分の分は、ほとんど口にしなかった。|{a}は{b}が眠っているあいだ、ずっとその寝顔を見守っていた。'),
bind:L('{a}は{b}が部屋のどこにいても、必ず手の届く場所にいた。|{a}「{c}と、何話してたの？｜{c}と、何を話していた？｜{c}と、何を話していたんですか？」狭い部屋に、逃げ場はなかった。'),
purge:L('{a}は{b}と{c}のあいだに、黙って座り込んだ。|{a}は{c}が{b}に近づくたび、わざと物音を立てて話を遮った。'),
depend:L('{a}「この部屋から出られなくても、{b}がいれば平気｜この部屋から出られなくても、{b}がいれば平気だ｜この部屋から出られなくても、{b}がいれば平気です」{a}は本気でそう言っていた。|{a}は{b}が少しでも離れると、不安そうに名前を呼んだ。'),
bind2:L('{a}は扉の脇に陣取り、{b}がそちらへ行くたびに腕を掴んだ。|{a}は{b}に、{c}と目を合わせないよう約束させた。'),
purge2:L('{a}は{c}の分の水を、黙って床にこぼした。|{a}は{c}が眠っているあいだに、その耳元で何かを囁いていた。{c}は朝から怯えていた。'),
depend2:L('{a}「出口なんて見つからなければいいのに。……ずっと、ここで二人でいたい｜出口など見つからなければいい。……ずっと、ここで二人でいたい｜出口なんて見つからなければいいのに。……ずっと、ここで二人でいたいです」'),
cage:L('扉の鍵が見つかったとき、{a}はそれを黙って隠した。{b}と二人きりの時間を、終わらせたくなかった。|{a}は部屋の出口の手がかりを、{b}に気づかれないように一つずつ壊していった。'),
cage_s:L('{a}は脱出の手がかりを見つけたが、{b}には言わなかった。「……もう少しだけ、このままで｜……もう少しだけ、このままでいたい｜……もう少しだけ、このままでいさせてください」'),
cageDay:L('{a}は{b}の隣から離れず、{b}が扉のほうを見るたびに、そっと手を引いた。|{a}は{b}の髪を撫でながら、「ここにいれば、誰にも邪魔されないね｜ここにいれば、誰にも邪魔されない｜ここにいれば、誰にも邪魔されませんね」と囁いた。'),
escape:L('{b}は{a}が隠していた鍵を見つけ出し、震える手で扉を開けた。|{b}は{a}が眠ったすきに、壊されていない最後の手がかりを解いた。'),
rescue:L('{c}は{a}の様子がおかしいことに気づき、{a}の隠していた鍵を見つけ出して{b}に渡した。'),
release:L('{a}は泣きながら、隠していた鍵を{b}の手に握らせた。「……ごめん。本当は、ずっと前に見つけてた｜……すまない。本当は、ずっと前に見つけていた｜……ごめんなさい。本当は、ずっと前に見つけていました」'),
harm:L('{a}は{c}を部屋の隅に追い詰め、首に手をかけた。{b}が止めに入らなければ、どうなっていたか分からない。|{a}は眠っている{c}の手首を縛り、口を塞いだ。「{b}に話しかけるから、こうなるんだよ｜{b}に話しかけるから、こうなるんだ｜{b}に話しかけるから、こうなるんですよ」'),
harmKill:L('朝、{c}は部屋の隅で冷たくなっていた。{a}は{b}の隣で、静かに微笑んでいた。「これで、二人きりだね｜これで、二人きりだな｜これで、二人きりですね」'),
harm_s:L('{a}は{c}を部屋の隅に呼び、低い声で「{b}に近づかないで｜{b}に近づくな｜{b}に近づかないでください」と言った。{c}は、それきり{b}に話しかけなくなった。'),
shinju:L('{a}は{b}を抱きしめたまま、部屋の空気が薄くなっていくのを待った。「出られなくていい。このまま二人で｜＝｜出られなくていいんです。このまま二人でいましょう」|{a}は部屋にあった薬を二人分、静かに水に溶かした。「この部屋で、ずっと一緒にいよう｜＝｜この部屋で、ずっと一緒にいましょう」'),
shinjuFail:L('{a}は二人分の薬を差し出した。{b}はそれを床に叩きつけた。「一緒に出るんだよ。この部屋から｜一緒に出るんだ。この部屋から｜この部屋から、一緒に出るんです」'),
shinju_s:L('{a}は{b}の肩にもたれて、「出られなくてもいいや｜出られなくてもいい｜出られなくてもいいです」と呟いた。{b}は{a}の手を握って、「一緒に出よう｜＝｜一緒に出ましょう」とだけ言った。')
};
P.island={
where:'島の奥の洞窟',
seed:L('{c}と並んで焚き火にあたる{b}を、{a}は浜辺の暗がりから見ていた。その夜から、{a}の目は{b}の背中を追うのをやめられなくなった。|{b}が{c}と二人で水を汲みに行ったきり、なかなか戻らなかった。{a}は日が沈むまで、森の入口に立ち尽くしていた。'),
devote:L('{a}は、いちばん大きな魚も、いちばん甘い果実も、黙って{b}の分にした。|{a}は{b}が眠っているあいだ、一晩じゅう焚き火の番をしていた。'),
bind:L('{a}は{b}が森へ入るたびに、少し離れてついていった。|{a}「どこへ行くの。……ひとりで？｜どこへ行く。……ひとりでか？｜どこへ行くんですか。……ひとりでですか？」'),
purge:L('{a}は{b}の隣の寝床を、誰にも使わせなかった。|{b}に果実を差し出した誰かの手を、{a}は黙って払いのけた。'),
depend:L('{a}は{b}がそばにいないと、火も起こせなくなっていた。'),
purge2:L('{c}の銛が、いつの間にか折られていた。{c}は浜辺で、{a}の冷たい視線とぶつかった。|{a}は{c}を、潮の満ちる岩場に誘い出した。'),
cage:L('{a}は{b}を、島の奥の洞窟に連れていき、入口を岩でふさいだ。「ここなら、誰も来ないよ｜ここなら、誰も来ない｜ここなら、誰も来ませんよ」|{a}は{b}の舟を壊した。「島から出なくていい。ずっと、ここで二人で｜＝｜島から出なくていいんです。ずっと、ここで二人でいましょう」'),
cage_s:L('{a}は{b}の手を引いて、誰も知らない入り江へ連れていった。「今日は、ここにいて｜今日は、ここにいろ｜今日は、ここにいてください」'),
only:['cage_s','harm_s'],
cageDay:L('{a}は毎日、洞窟の{b}のもとへ果実と水を運んだ。|{a}は{b}の髪を梳きながら、波の音に合わせて名前を呼び続けた。'),
rescue:L('{c}は{b}の足跡をたどり、岩でふさがれた洞窟を見つけ出した。'),
harm:L('{a}は{c}を、潮が満ちれば沈む岩場に置き去りにした。{c}はずぶ濡れで、命からがら浜に戻ってきた。'),
harmKill:L('{c}は潮の満ちた岩場で見つかった。{a}は{b}の隣で、静かに海を眺めていた。'),
shinju:L('{a}は{b}の手を取って、夜の海へ歩いていった。「一緒に、帰ろう｜＝｜一緒に、帰りましょう」――二人の足跡は、波打ち際で途切れていた。'),
harm_s:L('{a}は{c}を浜辺に呼び出し、低い声で「{b}に近づかないで｜{b}に近づくな｜{b}に近づかないでください」と言った。{c}はそれきり、{b}のそばに寄らなくなった。'),
shinju_s:L('{a}は{b}と並んで、夜の海を見ていた。「このまま、二人で流されちゃえたらいいのに｜このまま、二人で流されてしまえたらいいのだが｜このまま、二人で流されてしまえたらいいのに、と思います」{b}は黙って、{a}の手を握った。')
};
P.br={
seed:L('{c}が{b}をかばって前に出たのを見たとき、{a}は自分の手が届かなかったことを心の底から憎んだ。|{b}が{c}と背中を預け合っているのを、{a}は物陰から見ていた。'),
devote:L('{a}は自分の支給品の半分を、黙って{b}の鞄に移した。|{a}は{b}が眠るあいだ、ずっと銃を抱いて見張りをした。'),
bind:L('{a}「離れないで。ここでは、一瞬で死ぬから｜離れるな。ここでは、一瞬で死ぬ｜離れないでください。ここでは、一瞬で死にますから」{a}は{b}の手首を離さなかった。'),
purge2:L('{a}は{c}の武器から、弾を抜いておいた。|{a}は{c}の位置を、わざと誰かに聞こえるように口にした。'),
cage:L('{a}は{b}を、廃屋の地下室に押し込めて鍵をかけた。「ここなら、誰にも撃たれない。私以外には、誰にも｜＝｜ここなら、誰にも撃たれません。私以外の誰にも、です」'),
cage_s:L('{a}は{b}を廃屋の奥に隠し、扉の前に座り込んだ。「ここにいて。私が全部、終わらせるから｜ここにいろ。私が全部、終わらせる｜ここにいてください。私が全部、終わらせますから」'),
only:['cage_s','harm_s','shinju_s'],
cageDay:L('{a}は毎晩、地下室の{b}のもとへ戻ってきた。服には、知らない誰かの血がついていた。'),
harm:L('{a}は{c}を背後から撃った。弾は肩を貫いた。{c}は茂みの中へ逃げていった。'),
harmKill:L('{a}は{c}を、ためらいなく撃った。{a}は{b}のもとへ戻ると、「もう大丈夫｜もう大丈夫だ｜もう大丈夫です」とだけ言った。'),
shinju:L('最後の二人になったとき、{a}は{b}に銃を向け、それから自分のこめかみにも当てた。「優勝なんて、いらない。一緒に終わろう｜優勝など、いらない。一緒に終わろう｜優勝なんて、いりません。一緒に終わりましょう」'),
harm_s:L('{a}は{c}に銃口を向けたまま、「{b}に近づいたら撃つ｜＝｜{b}に近づいたら撃ちます」とだけ言った。{c}は両手を上げて後ずさった。'),
shinju_s:L('{a}は{b}の肩にもたれて、「ここで、二人で終わっちゃおうか｜ここで、二人で終わろうか｜ここで、二人で終わりましょうか」と呟いた。{b}は答えずに、{a}の手を握った。')
};
P.trial={
seed:L('{c}と並んで食堂に座る{b}を見たとき、{a}の中で何かが静かに形を変えた。|裁判で{b}をかばったのが{c}だったことを、{a}はいつまでも忘れられなかった。'),
devote:L('{a}は{b}のアリバイを、いつも誰よりも先に証言した。|{a}は{b}の部屋の前で、毎晩見張りをした。'),
bind:L('{a}「夜は、絶対に部屋から出ないで。……私以外が来ても、開けないで｜夜は、絶対に部屋から出るな。……私以外が来ても、開けるな｜夜は、絶対に部屋から出ないでください。……私以外が来ても、開けないでください」'),
purge2:L('{a}は裁判で、{c}に疑いが向くような話を、さりげなく口にした。|{a}は{c}の部屋の前に、意味ありげな置き手紙を残した。'),
cage:L('{a}は{b}を、空き部屋に閉じ込めて鍵をかけた。「ここなら、誰にも殺されない｜＝｜ここなら、誰にも殺されません」'),
cage_s:L('{a}は{b}を自分の部屋に招き、扉の前から動かなかった。「今夜だけは、ここにいて｜今夜だけは、ここにいろ｜今夜だけは、ここにいてください」'),
only:['cage_s','harm_s'],
harm:L('{a}は夜のうちに{c}を呼び出し、階段から突き落とした。{c}は足をひきずりながら、翌朝の裁判に現れた。'),
harm_s:L('{a}は{c}を呼び出して、低い声で「{b}に近づいたら、次の裁判であなたを指名する｜＝｜{b}に近づいたら、次の裁判であなたを指名します」と告げた。'),
shinju_s:L('{a}は{b}の肩にもたれて、「ここから二人で消えちゃえたらいいのに｜ここから二人で消えてしまえたらいいのだが｜ここから二人で消えてしまえたらいいのに、と思います」と呟いた。')
};
HK.atScen('island',function(s){O.install(s,{w:1.3,pace:1.6,cool:1});});
HK.atScen('br',function(s){O.install(s,{w:1.2,pace:2.4,cool:1});});
HK.atScen('trial',function(s){O.install(s,{w:1.2,pace:2,cool:1,lethal:false,shinju:false});});
HK.atScen('classroom',function(s){O.install(s,{w:1.4,pace:2.2,cool:1});});
var Z=HK.ZB;
var ASK=L('{a}は出会う人ごとに{b}の特徴を伝えて、見かけなかったかと尋ねて回った。|{a}は壁の伝言板を端から読み、{b}の名前を探した。|{a}は無線機のつまみを回し続け、{b}の手がかりを探した。|{a}は避難してきた人を捕まえて、{b}のことを根掘り葉掘り訊いた。');
var HEARD=L('「{p}で見た」という話を聞いた瞬間、{a}の目の色が変わった。|{p}の方で{b}らしい人を見た、という噂が耳に入った。');
var NOHEAR=L('誰も{b}を見ていなかった。{a}は爪を噛んだ。|手がかりは何もなかった。{a}は「生きてる。絶対に｜生きている。絶対にだ｜生きています。絶対にです」と自分に言い聞かせた。');
var FOUND=L('{a}はついに{b}を見つけた。駆け寄って、確かめるように何度も{b}の顔に触れた。「……やっと会えた。もう離れないから｜……やっと会えた。もう離れない｜……やっと会えました。もう離れませんから」|{b}の姿を見つけた瞬間、{a}は泣き笑いのような顔になった。「探したんだよ。ずっと｜探したんだ。ずっと｜ずっと、探していたんですよ」|{a}は{b}の腕を掴んで、離さなかった。「どこに行ってたの。……どれだけ探したと思ってるの｜どこに行っていた。……どれだけ探したと思っている｜どこに行っていたんですか。……どれだけ探したと思っているんですか」');
var FOUND_RE={
CP:L('{b}「……なんで来た？　危ないだろう｜……なぜ来た？　危ないだろう｜……どうして来たんですか？　危ないでしょう」{b}はそう言いながら、{a}の手を振りほどかなかった。'),
NP:L('{b}「無事でよかった｜＝｜無事でよかったです」{b}は{a}を抱きしめ返した。{a}の腕に、さらに力がこもった。'),
A:L('{b}「どうやってここが分かったの｜どうやってここが分かった｜どうやってここが分かったんですか」{b}の問いに、{a}は笑うだけで答えなかった。'),
FC:L('{b}「うわ、ほんとに来た！｜本当に来たのか！｜うわ、本当に来たんですね！」{b}は目を丸くして、それから少しだけ笑った。'),
AC:L('{b}は何も言えずに、{a}に抱きすくめられたまま震えていた。')
};
var GO=L('{a}は、もう{b}のことしか考えられなかった。|{a}は{b}がこの街のどこかにいると信じて、立ち上がった。|{a}の頭の中は、{b}の安否でいっぱいだった。');
function free(a){return a.alive&& !a.out&&a.z&& !a.z.alone&& !a.z.vanished&&a.z.cult==null&& !a.z.bitten;}
function seekT(ctx,a){
if(!free(a))return null;
var best=null,bv=54;
ctx.chars.forEach(function(o){
if(o===a|| !o.alive||o.out|| !o.z||o.z.area===a.z.area)return;
var v=(ctx.pair(a,o).ob&&ctx.pair(a,o).ob[a.i])||O.yanTie(ctx,a,o)?O.level(ctx,a,o):0;
if(v>bv){bv=v;best=o;}
});
return best;
}
function goalObj(T){return{id:'obsess',label:T.name+'と会う',bias:{help:0.8,bond:0.7}};}
if(Z)Z.obsDest=function(ctx,c){
if(!c.goal||c.goal.id!=='obsess')return null;
var T=ctx.chars[c.z.obT];
if(!T|| !T.alive||T.out)return null;
if(c.z.obKnow!=null&&c.z.obKnow!==c.z.area)return c.z.obKnow;
var adj=Z.adj(c.z.area),seen=function(x){return c.z.path.filter(function(p){return p===x;}).length;};
return adj.slice().sort(function(x,y){return seen(x)-seen(y)||((x+ctx.stepIndex+c.i)%3)-((y+ctx.stepIndex+c.i)%3);})[0];
};
var SEEK_EV=[{
id:'ob_seekgoal',label:'離れた場所にいる執着の相手を想う',cat:'solo',noOdd:true,pri:true,
when:function(ctx,a){return a.goal&&a.goal.id!=='obsess'&& !!seekT(ctx,a);},
w:function(ctx,a){return 2+O.level(ctx,a,seekT(ctx,a))/30;},
run:function(ctx,a){
var T=seekT(ctx,a),from=a.goal.label;
a.z.obPrev=a.goal;a.z.obT=T.i;a.z.obKnow=null;
a.goal=goalObj(T);a.goalHist=(a.goalHist||[]).concat([a.goal]);
return{with:[T],cat:'solo',text:ctx.t(ctx.pick(GO),a,T)+a.name+'の目標が変わった：「'+from+'」→「'+a.goal.label+'」',why:O.why(ctx,a,T)+'。離れた場所にいる相手に、どうしても会いたい',mag:14};
}
},{
id:'ob_ask',label:'執着の相手の噂を聞き回る',cat:'solo',noOdd:true,pri:true,
when:function(ctx,a){var T=a.goal&&a.goal.id==='obsess'&&ctx.chars[a.z.obT];return!!(T&&T.alive&& !T.out&&free(a)&&T.z.area!==a.z.area&&(a.z.obKnow==null||a.z.obKnow===a.z.area));},
w:function(){return 6;},
run:function(ctx,a){
var T=ctx.chars[a.z.obT],rng=ctx.rng,hit=rng()<0.75,wrong=hit&&rng()<ctx.env.rumor/100*0.5;
var t=ctx.t(ctx.pick(ASK),a,T);
if(hit){
var cand=Z.adj(T.z.area).filter(function(x){return x!==a.z.area;});
var p=wrong&&cand.length?rng.pick(cand):T.z.area;
a.z.obKnow=p;
t+=ctx.t(ctx.pick(HEARD),a,T).replace(/\{p\}/g,ctx.zb.A[p].name);
}else t+=ctx.t(ctx.pick(NOHEAR),a,T);
ctx.stress(a,4);
return{with:[],cat:'solo',text:t,why:a.name+'の目標「'+a.goal.label+'」。噂を聞き回った'+(hit?(wrong?'（デマ：情報の錯綜 '+ctx.env.rumor+'）':'（本当の情報）'):'（手がかりなし）'),mag:10};
}
},{
id:'ob_found',label:'探し続けた相手にようやく会える',cat:'bond',noOdd:true,pri:true,
when:function(ctx,a){var T=a.goal&&a.goal.id==='obsess'&&ctx.chars[a.z.obT];return!!(T&&free(a)&&T.alive&& !T.out&&T.z.area===a.z.area);},
w:function(){return 9;},
run:function(ctx,a){return found(ctx,a);}
}];
function found(ctx,a){
var T=ctx.chars[a.z.obT],from=a.goal.label,P=HK.SCENARIOS.zombie.goals.filter(function(g){return g.id==='protect';})[0];
a.goal=P||a.z.obPrev;a.focus=T;a.z.obKnow=null;a.goalHist=(a.goalHist||[]).concat([a.goal.id||a.goal]);
ctx.mod2(a,T,{att:6,aff:4},{ten:4,att:2});a.stress=Math.max(0,a.stress-20);
O.add(ctx,a,T,4);
var ft=T.eg&&HK.egoType?HK.egoType(T.eg).top:'',fre=FOUND_RE[ft]&&ctx.rng()<0.6?ctx.t(ctx.pick(FOUND_RE[ft]),a,T):'';
return{with:[T],cat:'bond',text:ctx.t(ctx.pick(FOUND),a,T)+fre+a.name+'の目標が変わった：「'+from+'」→「'+a.goal.label+'」',why:O.why(ctx,a,T)+'。探し続けた相手に、ようやく会えた',mag:22};
}
function seekAfter(ctx){
ctx.chars.forEach(function(a){
if(!a.goal||a.goal.id!=='obsess'|| !free(a))return;
var T=ctx.chars[a.z.obT];
if(!T|| !T.alive||T.out)return;
if(T.z.area===a.z.area){var r=found(ctx,a);ctx.say({kind:'event',cat:r.cat,actors:[a,T],text:r.text,why:r.why,mag:r.mag});return;}
if(a.z.obKnow!=null&&a.z.obKnow!==T.z.area&&ctx.rng()<0.4)a.z.obKnow=T.z.area;
});
}
SEEK_EV.push({
id:'ob_seeklost',cat:'solo',noOdd:true,pri:true,
when:function(ctx,a){var T=a.goal&&a.goal.id==='obsess'&&ctx.chars[a.z.obT];return!!(T&&(!T.alive||T.out));},
w:function(){return 9;},
run:function(ctx,a){
var T=ctx.chars[a.z.obT],from=a.goal.label;
a.goal=a.z.obPrev||HK.SCENARIOS.zombie.goals[0];a.goalHist=(a.goalHist||[]).concat([a.goal.id||a.goal]);
ctx.stress(a,25);
return{with:[],cat:'solo',text:ctx.t(T.alive?'{a}は、{b}がもう街を出たと知った。{a}はしばらく、その場から動けなかった。':'{a}は、{b}がもうこの世にいないと知った。{a}の中で、何かが音を立てて崩れた。',a,T)+a.name+'の目標が変わった：「'+from+'」→「'+a.goal.label+'」',why:'探していた'+T.name+'に、もう会えない',mag:20};
}
});
HK.atScen('zombie',function(s){O.install(s,{w:1.4,pace:2.4,cool:1,extra:SEEK_EV,after:seekAfter});});
HK.atScen('goukon',function(s){O.install(s,{w:1.8,pace:3.2,cool:0,shinju:false,lethal:false});});
HK.atScen('whiteroom',function(s){O.install(s,{w:1.6,pace:3,cool:0,shinjuW:0.35});});
})();
});
;
/* ==== js/grief-kit.js ==== */
HK.Load.def(297,'js/grief-kit.js',function(){
(function(){
'use strict';
var HK=window.HK,SC=HK&&HK.SCENARIOS;
if(!SC)return;
var G=HK.Grief={};
function L(s){return s.split('|');}
function fill(t,m){return String(t).replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function clamp(v,lo,hi){return Math.max(lo,Math.min(hi,v));}
var TYPE_OF={CP:'hold',NP:'sink',A:'flat',FC:'bright',AC:'blame'};
var TYPE_NAME={hold:'表に出さず抱え込む',sink:'深く沈む',flat:'淡々として、あとから崩れる',bright:'空元気でごまかす',blame:'自分を責める'};
var MULT={sink:1.2,blame:1.2,hold:1.05,bright:0.95,flat:0.9};
function typeOf(c){var t=HK.egoType?HK.egoType(c.eg).top:'NP';return TYPE_OF[t]||'sink';}
G.TYPE_NAME=TYPE_NAME;
var TIE_W={
lover:60,mate:65,fated:55,parent:60,pparent:55,sibprot:60,sibclose:55,sibling:45,best:50,buddy:45,
childhood:42,almost:40,mentor:35,teacher:30,master:30,friend:22,senpai:15,colleague:12,ex:18,fwb:12,acq:5,rival:8,
relative:35,classmate:16,boss:20,benefactor:22,worship:22,fond:26,blind:34
};
function relWord(type,mine){
switch(type){
case'lover':return'恋人';
case'mate':return'番';
case'fated':return'運命の相手';
case'parent':case'pparent':return'家族';
case'sibprot':case'sibclose':case'sibling':return'きょうだい';
case'best':return'親友';
case'buddy':return'相棒';
case'childhood':return'幼なじみ';
case'almost':return'特別な人';
case'crush':case'yan':return'想い人';
case'mentor':return mine?'弟子':'師匠';
case'teacher':return mine?'教え子':'先生';
case'master':return mine?'従者':'主';
case'friend':return'友だち';
case'relative':return'親族';
case'classmate':return'同級生';
case'colleague':return'同僚';
case'boss':return mine?'部下':'上司';
case'benefactor':return mine?'助けた相手':'恩人';
case'worship':return mine?'崇めていた人':'自分を慕っていた人';
case'fond':return mine?'陰ながら慕っていた人':'自分を慕ってくれていた人';
case'blind':return mine?'信じきっていた人':'自分を信じきっていた人';
default:return'';
}
}
G.depth=function(ctx,o,v,opt){
var best=0,rel='';
(HK.Ties?HK.Ties.all(ctx,o,v):[]).forEach(function(t){
var w=TIE_W[t.type]||0,mine=t.a===o.i;
if(t.type==='crush')w=mine?40:12;
if(t.type==='yan')w=mine?72:12;
if(t.type==='worship')w=mine?78:t.cold==='cherish'||t.cold==='accept'?30:18;
if(t.type==='blind')w=mine?66:14;
if(t.type==='fond')w=mine?38:12;
if(t.type==='benefactor'&& !mine)w=42;
if(w>best){best=w;rel=(HK.Sib&&HK.Sib.isSibTie(t)&&TIE_W[t.type]?HK.Sib.word(o,v,'plain',{tie:t}):'')||relWord(t.type,mine)||rel;}
});
var pf=ctx.pair(o,v);
if(pf.couple&&best<55){best=55;rel='恋人';}
if(best<60&&pf.ob&&pf.ob[o.i]&&HK.Obsess&&HK.Obsess.level&&HK.Obsess.level(ctx,o,v)>=60){best=60;rel=rel||'執着していた相手';}
var key=o.i<v.i?o.i+'-'+v.i:v.i+'-'+o.i;
if((pf.amagami||(ctx.om&&ctx.om.bonded&&ctx.om.bonded[key]))&&best<65){best=65;rel='番';}
if(HK.lockTo(o,v)&&best<50){best=50;rel=rel||'ただ一人と決めた人';}
var r=ctx.R(o,v);
var d=best+Math.max(0,r.aff)*0.55+Math.max(0,r.trust)*0.25+Math.max(0,r.att)*0.2-Math.max(0,r.ten-50)*0.3;
if(r.aff<0)d*=0.4;
if(!rel)rel=r.aff>=50||r.trust>=55?'大切な'+((opt&&opt.mate)||'仲間'):((opt&&opt.mate)||'仲間');
return{d:d,rel:rel};
};
var REACT={
sink:L('{a}は{b}の名前を何度も呼んだ。返事がないと分かっても、呼ぶのをやめられなかった。やがて声はかすれ、{a}はその場に膝をついて泣き崩れた。|{rel}の{b}がもういないと聞いた瞬間、{a}の顔から血の気が引いた。{a}「嘘だ。さっきまで、隣にいた｜＝｜嘘です。さっきまで、隣にいたんです」――そう言ったきり、{a}は両手で顔を覆った。肩の震えは、いつまでも止まらなかった。|{a}は{item}を胸に抱いたまま、声を上げて泣いた。誰が肩に手を置いても、{a}は顔を上げなかった。その夜、{a}は一口も食べられなかった。'),
blame:L('{a}「私のせいだ。私が、もっと早く気づいていれば｜＝｜私のせいです。私が、もっと早く気づいていればよかったんです」――{a}は何度も同じことを繰り返した。誰が違うと言っても、{a}は首を横に振るばかりだった。握りしめた拳に、爪が食い込んでいた。|{b}を失ったと知った{a}は、誰とも目を合わせなくなった。{a}「あのとき、私が代わっていれば｜あのとき、私が代わっていればよかった｜あのとき、私が代わっていればよかったんです」――小さな声が、{spot}にぽつりと落ちた。{a}はそのまま、膝を抱えて動かなくなった。|{a}は{b}が最後に言った言葉を、何度も思い返した。あのとき引き止めていれば、と考えるたびに、胸の奥がきしんだ。{a}はその晩、一睡もできなかった。'),
hold:L('{a}は{b}の死を聞いても、顔色ひとつ変えなかった。{a}「……分かった。やるべきことをやろう｜＝｜……分かりました。やるべきことをやりましょう」――そう言って、{a}は黙々と次の段取りを始めた。ただ、その手は一度だけ、小さく震えていた。|泣き崩れる周りをよそに、{a}は{b}の荷物を静かにまとめた。{a}「泣くのは、全部終わってからでいい｜＝｜泣くのは、全部終わってからでいいです」――誰に言うでもない声だった。その背中は、いつもより少しだけ硬く見えた。|{a}は{rel}の{b}のことを、誰にも何も言わなかった。いつもどおりに動き、いつもどおりに食事をとった。ただ、{item}だけは、誰にも触らせなかった。'),
bright:L('{a}「大丈夫、大丈夫。{b}なら、きっと笑って許してくれる｜大丈夫だ、大丈夫だ。{b}なら、きっと笑って許してくれる｜大丈夫です、大丈夫です。{b}なら、きっと笑って許してくれます」――{a}はやけに明るい声でそう言った。その笑顔は、誰の目にも引きつって見えた。{a}は一人になると、すぐに唇を噛んだ。|{a}は{b}を失った夜も、いつもどおり冗談を言った。誰も笑わなかったが、{a}は話すのをやめなかった。黙ってしまえば、何かが崩れてしまいそうだった。|{a}「ほら、元気出そう。{b}が見たら、怒る｜ほら、元気を出せ。{b}が見たら、怒るだろう｜ほら、元気を出しましょう。{b}が見たら、怒りますよ」――{a}は皆の背中を順番に叩いて回った。誰より声を張っていたのは、{a}自身だった。夜になって、{a}の寝床からは、押し殺した嗚咽が漏れていた。'),
flat:L('{a}は{b}の死を、驚くほど落ち着いて受け止めた。何が起きたのかを確かめ、やるべきことを順に片付け、次にすべきことを皆に伝えた。{a}自身でさえ、まだ何も感じていなかった。|{a}「……そうか。分かった｜＝｜……そうですか。分かりました」――{a}はそれだけ言って、{b}の荷物を整理した。手つきは丁寧で、迷いがなかった。泣いていない自分を、{a}はどこか遠くから眺めていた。|{a}は{rel}の{b}がいなくなったことを、ひとつの事実として書き留めるように飲み込んだ。{a}「今は、残った者のことを考える｜＝｜今は、残った者のことを考えます」――その声には、少しの揺れもなかった。けれど{a}は、その夜、明け方まで目を開けたままだった。')
};
var BEAT={
sink:{
deep:L('{a}は{item}を、ずっと手放さなかった。眠るときも胸に抱いたままで、ときどき顔をうずめていた。{b}の匂いが、まだ少しだけ残っている気がした。|{a}は{spot}で、ふいに{b}の名前を呼んだ。振り返っても、そこには誰もいなかった。{a}はしばらく口を開けたまま立ち尽くし、それから静かに泣いた。|{a}は食事にほとんど手をつけなかった。{a}「{b}の分も、ちゃんと食べないといけないのに｜{b}の分も、きちんと食べなければならないのに｜{b}の分も、ちゃんと食べないといけないんですが」――そう言いながら、手はまた止まった。目の前の食べ物は、すっかり冷めていた。'),
mid:L('誰かの笑い声を聞いた拍子に、{a}は{b}の笑い方を思い出した。こらえようとしたが、涙が勝手にこぼれた。{a}は袖で目元をぬぐって、何もなかったふりをした。|{a}は{b}が好きだったものを見つけて、思わず手に取った。{a}「これ、{b}に見せたかった｜これを、{b}に見せたかった｜これ、{b}に見せたかったです」――言ってから、もう見せる相手がいないことに気づいた。{a}はそれを、そっと元の場所に戻した。|{a}は夜中に目を覚まして、隣に手を伸ばした。そこにあるのは、冷たい空気だけだった。{a}は毛布を頭までかぶり、朝が来るのを待った。'),
late:L('{a}は{item}を、ようやく荷物の奥にしまった。捨てることは、まだできなかった。{a}「もう少しだけ、そばに置いておく｜＝｜もう少しだけ、そばに置いておきます」|{a}は{b}の話を、少しだけ笑って話せるようになった。それでも話の終わりには、決まって声が小さくなった。{a}は上を見上げて、小さく息を吐いた。|{a}は{spot}を通るたびに、足を止めるのが癖になっていた。{b}がよく立っていた場所だった。{a}は一度だけ目を閉じてから、また歩き出した。')
},
blame:{
deep:L('{a}は眠れない夜を過ごしていた。目を閉じるたびに、{b}の最後の姿がまぶたの裏に浮かんだ。{a}「ごめん。ごめん｜すまない。すまない｜ごめんなさい。ごめんなさい」――誰もいない暗がりで、{a}は謝り続けた。|{a}は{b}を失ったときのことばかり考えていた。あのとき別の道を選んでいれば、と何度も頭の中でやり直した。どの道を選んでも、{b}は戻ってこなかった。|{a}は食事をほとんど口にしなくなった。{a}「私だけ、普通に食べていいはずがない｜＝｜私だけ、普通に食べていいはずがありません」――止められても、{a}は聞かなかった。頬は日に日にこけていった。'),
mid:L('{a}は誰かに名前を呼ばれるたび、びくりと肩を震わせた。{b}の声に似ていた気がしたからだ。違うと分かると、{a}はまた黙ってうつむいた。|{a}は{item}を握りしめて、{spot}の隅に座っていた。{a}「私が生き残って、どうするんだ｜私が生き残って、どうしろというんだ｜私が生き残って、どうするんですか」――つぶやきは、誰の耳にも届かなかった。{a}は膝に額をつけたまま、しばらく動かなかった。|{a}は誰かが嫌な役を引き受けようとすると、必ず先に手を挙げた。{a}「私が行く。もう誰も、私の代わりにさせない｜＝｜私が行きます。もう誰も、私の代わりにはさせません」――その目は、どこか自分を投げ出しているように見えた。周りは、{a}を一人にしないように気をつけた。'),
late:L('{a}は{b}の夢を見た。夢の中の{b}は、何も責めずに笑っていた。目が覚めたとき、{a}は久しぶりに少しだけ泣けた。|{a}は{b}に宛てて、言えなかったことを小声で並べた。謝る言葉の合間に、ありがとうがひとつ混ざった。{a}はそこで言葉を切って、深く息を吸った。|{a}はまだ、自分を許せてはいなかった。それでも{b}の分まで生きなければ、と考えるようになった。{a}は顔を上げて、皆のいるほうへ戻っていった。')
},
hold:{
deep:L('{a}は今日も、誰より早く起きて誰より遅くまで働いた。{b}がやっていた分の仕事まで、黙って引き受けていた。休めと言われても、{a}は首を振るだけだった。|{a}は{b}の名前が出るたびに、さりげなく話題を変えた。表情は少しも崩れなかった。ただ、その夜の{a}は、いつまでも寝床に戻ってこなかった。|{a}は{item}を、誰にも見られないようにしまっていた。人前では一度も出さなかった。夜、皆が寝静まったあとにだけ、{a}はそれを取り出して長いこと眺めていた。'),
mid:L('{a}は{b}がよく言っていた言葉を、口の中で繰り返した。{a}「『無理は、しないこと』……か｜＝｜『無理は、しないこと』……ですね」――自分で言っておいて、{a}は小さく苦笑した。その無理をしているのは、{a}自身だった。|誰かが{b}の思い出話を始めると、{a}は黙って席を立った。{spot}で一人になってから、{a}は壁に手をついて長く息を吐いた。戻ってきたときには、もういつもの顔に戻っていた。|{a}は皆に指示を出す途中で、ふと言葉を止めた。{b}に相談するつもりで、振り返りかけていた。{a}「……いや、いい。続ける｜＝｜……いえ、いいです。続けます」'),
late:L('{a}は{b}のやり方を、自分のやり方に少しずつ取り入れていた。前の{a}なら、決してしなかったやり方だった。{a}「{b}なら、こうした｜＝｜{b}なら、こうしました」――そう言ったときの声は、少しだけ柔らかかった。|{a}は{b}の荷物から、まだ使えるものを皆に分けた。{a}「{b}も、そうしろと言うはずだ｜＝｜{b}も、そうしろと言うはずです」――最後に{item}だけを残して、{a}は荷物を閉じた。その手つきは、前よりずっと穏やかだった。|{a}は{spot}に、{b}のための小さな目印を作った。誰にも言わずに、毎日そこを通るようにしていた。{a}は目印の前で短く頭を下げ、いつもの仕事に戻った。')
},
bright:{
deep:L('{a}は今日も、誰より大きな声で笑っていた。{a}「平気、平気。私がしょげてたら、{b}に笑われる｜平気だ、平気だ。私がしょげていたら、{b}に笑われる｜平気です、平気です。私がしょげていたら、{b}に笑われます」――その目の下には、濃い隈ができていた。笑い声は、ときどき不自然に途切れた。|{a}は{b}の口癖を、わざと大げさに真似してみせた。皆が少し笑うと、{a}も笑った。けれど次の瞬間、{a}は急に黙り込み、くるりと背を向けた。|{a}は一人になる時間を、とにかく作らないようにしていた。誰かの隣に座り、誰かの手伝いをして、ひっきりなしに話し続けた。夜、皆が寝静まると、{a}は毛布の中で声を殺して泣いた。'),
mid:L('{a}は{b}の好きだった歌を、鼻歌で口ずさんでいた。途中で歌詞が出てこなくなって、{a}は首をかしげた。{a}「……そこ、いつも{b}が歌ってたところだ｜……そこは、いつも{b}が歌っていたところだ｜……そこ、いつも{b}が歌っていたところです」――そのまま、歌は止まった。|冗談を言った{a}は、いつものように隣を見た。そこで突っ込みを入れてくれるはずの{b}は、もういなかった。{a}は笑顔のまま固まり、それからゆっくり視線を落とした。|{a}は{item}を手に取って、わざとおどけて見せた。{a}「見て、{b}の忘れ物。取りに来ないなら、私がもらう｜見ろ、{b}の忘れ物だ。取りに来ないなら、私がもらう｜見てください、{b}の忘れ物です。取りに来ないなら、私がもらいます」――誰も何も言えなかった。{a}は笑ったまま、それを強く握りしめていた。'),
late:L('{a}の笑い声に、少しずつ本当の明るさが戻ってきた。{b}の話をするときも、もう無理に声を張らなくなった。{a}「{b}がいたら、今の、絶対に笑ってた｜{b}がいたら、今のは絶対に笑っていた｜{b}がいたら、今の、絶対に笑っていました」|{a}は{b}の口癖を、今度は自然に口にしていた。言ってから気づいて、{a}は小さく吹き出した。{a}「うつってた。いつの間にか｜うつっていた。いつの間にか｜いつの間にか、うつっていました」|{a}は{spot}で、{b}の分まで遠くを眺めた。{a}「そっちは、退屈してない？｜そっちは、退屈していないか？｜そちらは、退屈していませんか？」――答えはなかったが、{a}は少しだけ笑えた。それから、皆のところへ駆け戻っていった。')
},
flat:{
deep:L('{a}は{b}のことについて、事実だけを淡々と皆に伝えた。いつ、どこで、何が起きたのか。話し終えた{a}は、次の予定の確認に移った。|{a}は{b}が使っていた物を、きっちり整理した。{a}「残された物は、無駄にしない。それが一番いい｜＝｜残された物は、無駄にしません。それが一番いいです」――手つきは正確で、手早かった。周りのほうが、かえって{a}の顔を見られなかった。|{a}はいつもどおりの時間に起き、いつもどおりにやるべきことをこなした。{b}がいない以外は、何も変わらない一日だった。{a}は、それをおかしいとも思わなかった。'),
mid:L('{a}は考え事の途中で、ふと{b}の意見を聞きたくなった。答えはもう返ってこないと分かっていて、{a}はしばらく黙り込んだ。{a}「……計算どおりには、いかないものだ｜＝｜……計算どおりには、いかないものですね」|{a}は{b}のいた場所を、つい目で確かめてしまう癖がついた。そこが空いていると分かるたびに、胸の奥が小さく痛んだ。{a}は目元を押さえ、深く息をついた。|{a}は眠れない夜に、{b}と交わした会話を一つずつ思い出した。どれも、ありふれたやりとりだった。そのありふれたことが、もう二度とないのだと、{a}はようやく分かった。'),
late:L('{a}は{b}のことを、落ち着いて話せるようになっていた。{a}「{b}がいたから、私はここまで来られた｜＝｜{b}がいたから、私はここまで来られました」――淡々とした声だったが、そこにはちゃんと温度があった。聞いていた者も、黙ってうなずいた。|{a}は{item}を、手入れしてから大事にしまった。{a}「これは、持っていく｜＝｜これは、持っていきます」――迷いのない声だった。{a}にとってそれは、もう悲しみだけの品ではなかった。|{a}は{spot}で、しばらく{b}のことを考えていた。泣きはしなかったが、急ぐこともしなかった。日が傾くころ、{a}は静かに立ち上がった。')
}
};
var CRASH=L('{a}は何気なく{item}を見つけて、手を止めた。その瞬間、それまで押し込めていたものが、一度にあふれ出した。{a}「……{b}」――{a}はその場に座り込み、子どものように泣きじゃくった。|誰かが{b}の名前を口にしたとき、{a}の手から持っていたものが滑り落ちた。{a}は拾おうとして、そのまま動けなくなった。{a}「今になって、どうして｜今になって、どうしてだ｜今になって、どうしてですか」――震える声で、{a}は何度も同じことを言った。|{a}は夜中に飛び起きた。夢の中で、{b}が{a}を呼んでいた。{a}は暗がりの中で自分の腕を抱き、初めて声を上げて泣いた。');
var BREAK=L('一人きりになった{spot}で、{a}はついに膝をついた。{a}「……どうして、置いていった｜……なぜ、置いていった｜……どうして、置いていったんですか」――ずっと飲み込んできた言葉が、ようやく声になった。{a}は誰にも見られないまま、長いあいだ泣いた。|{a}は{item}を握りしめたまま、壁にもたれて座り込んだ。張りつめていた糸が、ぷつりと切れたようだった。{a}の目から、こらえていた涙がとめどなく流れた。|皆の前ではいつもどおりだった{a}が、ふと姿を消した。探しに行った先で、{a}は{b}の名前を呼びながら、声を殺して泣いていた。{a}「ごめん。少しだけ、このままでいたい｜すまない。少しだけ、このままでいたい｜すみません。少しだけ、このままでいさせてください」');
var ACCEPT={
sink:L('{a}は{spot}で、{b}のために静かに手を合わせた。{a}「ずっと泣いてばかりで、ごめん。もう少しだけ、ちゃんと生きてみる｜ずっと泣いてばかりで、すまなかった。もう少しだけ、ちゃんと生きてみる｜ずっと泣いてばかりで、ごめんなさい。もう少しだけ、ちゃんと生きてみます」――顔を上げた{a}の目に、ほんの少しだけ光が戻っていた。{a}はもう一度だけ深く頭を下げてから、皆のところへ戻った。|{a}は{b}の分まで食べると決めて、久しぶりに出されたものを残さず食べた。{a}「おいしい。……{b}にも、食べさせたかった｜うまい。……{b}にも、食べさせたかった｜おいしいです。……{b}にも、食べさせたかったです」――涙はこぼれたが、手は止まらなかった。食べ終えた{a}は、小さく「ごちそうさま｜＝｜ごちそうさまでした」と言った。|{a}は{item}に、小さく「＠{a}＠おやすみ｜＝｜おやすみなさい」と言ってから眠った。その夜、{a}は久しぶりに朝まで目を覚まさなかった。起きたとき、{a}の顔は少しだけ穏やかだった。'),
blame:L('{a}は{b}に向かって、初めて「ありがとう｜＝｜ありがとうございます」と言った。ずっと謝ることしかできなかった口から出た、別の言葉だった。{a}はそれで、少しだけ肩の力が抜けた。|{a}「{b}は、私に生きてほしかったんだと思う｜{b}は、私に生きてほしかったのだと思う｜{b}は、私に生きてほしかったんだと思います」――{a}はぽつりとそう言った。自分を許したわけではなかった。それでも、前を向く理由にはなった。|嫌な役を、{a}はもう自分だけで背負わなくなった。{a}「一緒に行こう。一人では行かない｜＝｜一緒に行きましょう。一人では行きません」――{b}を失ってから、{a}が初めて口にした言葉だった。隣にいた者は、黙ってうなずいた。'),
hold:L('{a}は皆の前で、初めて{b}の話をした。短く、言葉少なだったが、声は最後まで崩れなかった。話し終えた{a}の顔は、少しだけ軽くなって見えた。|{a}は引き受けすぎていた仕事を、ようやく人に任せた。{a}「{b}にも、よく言われていた。一人で抱えすぎだと｜＝｜一人で抱えすぎだと、{b}にもよく言われていました」――そう言って、{a}は珍しく自分から休んだ。その寝顔は、久しぶりに穏やかだった。|{a}は{item}を、誰の目にも見える場所に置いた。もう隠しておく必要はなかった。{a}「{b}も、ここにいればいい｜＝｜{b}も、ここにいればいいです」'),
bright:L('{a}は{b}の話をしながら、心から笑った。笑いながら少しだけ泣いて、また笑った。{a}「ちゃんと泣けた。……やっと｜＝｜やっと……ちゃんと泣けました」|{a}は{b}の口癖で、皆を笑わせた。今度の笑い声は、誰の耳にも本物に聞こえた。{a}「{b}の分も、私が笑っておく｜＝｜{b}の分も、私が笑っておきます」|{a}はもう、一人になる時間を怖がらなくなった。{spot}で静かに座り、{b}のことを思い出す時間を持つようになった。戻ってきた{a}の笑顔は、前よりずっと自然だった。'),
flat:L('{a}は{b}について、自分なりの区切りをつけた。{a}「悲しいのは、ちゃんと大切だったからだ｜＝｜悲しいのは、ちゃんと大切だったからです」――そう言葉にできて、{a}は小さくうなずいた。それは、{a}にとって何より確かな答えだった。|{a}は{b}の残したやり方を、皆に教え始めた。{a}「{b}のやり方は、残しておく価値がある｜＝｜{b}のやり方は、残しておく価値があります」――{b}の名前を出しても、もう声は揺れなかった。教わる者たちは、{b}の名前ごと、そのやり方を覚えていった。|{a}は{b}のいない日々を、ひとつずつ数えるのをやめた。代わりに、{b}と過ごした日のことを、ときどき思い出すことにした。{a}の表情は、前よりもやわらかくなっていた。')
};
var RECKLESS=L('{a}は休めと言われても、聞こうとしなかった。ふらつく足で、{b}がやっていたことにまで手を伸ばした。倒れる寸前まで、{a}は手を止めなかった。|{a}は{b}を失ってから、自分の身を守ることをやめてしまったように見えた。危ないと言われることにも、ためらわずに踏み込んでいった。{a}「怖くない。もう、怖いものなんてない｜怖くない。もう、怖いものなど何もない｜怖くありません。もう、怖いものなんてありません」|{a}は食べることも眠ることも忘れて、ただ体を動かし続けた。じっとしていると、{b}のことしか考えられなかった。{a}の顔色は、見るたびに悪くなっていった。');
var STOP=L('{c}が{a}の腕を強くつかんだ。{c}「一人で行かせない。{b}も、そんなことは望んでいない｜＝｜一人では行かせません。{b}も、そんなことは望んでいません」|気づいた{c}が、黙って{a}の前に立ちふさがった。{a}はしばらく{c}を睨んでいたが、やがて力なくうなだれた。|{c}は{a}を追いかけて、無理やり連れ戻した。{c}「あなたまでいなくなったら、私はどうすればいい｜あなたまでいなくなったら、私はどうすればいいんだ｜あなたまでいなくなったら、私はどうすればいいんですか」');
var COMFORT={
hold:L('{a}は{b}の前に立ち、まっすぐに目を見た。{a}「{d}の分まで生きる。それが、残った者の役目だ｜＝｜{d}の分まで生きましょう。それが、残った者の役目です」――厳しい言葉だったが、{a}の手は{b}の肩にしっかりと置かれていた。{b}はその重みに、少しだけ背筋を伸ばした。|{a}は{b}に、小さな仕事をひとつ任せた。{a}「手を動かしていれば、少しは楽になる。私もそうしてきた｜＝｜手を動かしていれば、少しは楽になります。私もそうしてきました」――{b}は黙ってうなずき、言われたことをこなした。終わったとき、{b}の顔色はわずかに戻っていた。|{a}は{b}が食事を抜こうとするのを、許さなかった。{a}「食べて。{d}が見ていたら、同じことを言うはずだ｜食べろ。{d}が見ていたら、同じことを言うはずだ｜食べてください。{d}が見ていたら、同じことを言うはずです」――{b}は渋々、手を伸ばした。{a}は{b}が食べ終わるまで、そばを離れなかった。'),
sink:L('{a}は何も言わずに、{b}を抱きしめた。{b}の体は、驚くほど冷えていた。{a}の腕の中で、{b}はようやく声を上げて泣いた。|{a}は温かい飲み物を用意して、{b}の手に持たせた。{a}「無理に話さなくていい。そばにいる｜＝｜無理に話さなくていいです。そばにいます」――{b}は両手でそれを包み、少しずつ口をつけた。湯気の向こうで、{b}の目がにじんだ。|{a}は{b}の隣に座り、{d}の思い出をひとつずつ聞いた。{b}が言葉に詰まるたび、{a}は黙って背中をさすった。話し終えたとき、{b}は少しだけ楽な顔をしていた。'),
flat:L('{a}は{b}に、眠れているかどうかを静かに尋ねた。{a}「今日は、私が代わる。少し横になって｜今日は、私が代わる。少し横になれ｜今日は、私が代わります。少し横になってください」――{b}が断ろうとしても、{a}は譲らなかった。その日、{b}は久しぶりに長く眠った。|{a}は{b}の話を、最後まで口を挟まずに聞いた。{a}「{b}のせいじゃない。あの状況では、誰にも止められなかった｜{b}のせいではない。あの状況では、誰にも止められなかった｜{b}のせいではありません。あの状況では、誰にも止められませんでした」――落ち着いた声で、{a}は一つずつ理由を挙げた。{b}は唇を噛んで、小さくうなずいた。|{a}は{b}の顔色を見て、黙って負担の軽い役目に入れ替えた。{a}「しばらくは、これでいい。急がなくていい｜＝｜しばらくは、これでいいです。急がなくていいです」――{b}が礼を言いかけると、{a}は首を振った。それ以上、二人とも何も言わなかった。'),
bright:L('{a}は{b}の隣にどかっと座り、{d}の失敗談を話し始めた。{a}「覚えてる？　あのとき{d}が――｜覚えているか？　あのとき{d}が――｜覚えていますか？　あのとき{d}がですね――」――{b}は最初こそ黙っていたが、やがて泣きながら吹き出した。二人はしばらく、{d}の話で笑って泣いた。|{a}は{b}の手を引いて、{spot}まで連れ出した。{a}「じっとしていると、気持ちまで沈む｜＝｜じっとしていると、気持ちまで沈みます」――{b}は渋々ついてきたが、少しだけ顔を上げた。{a}はそれ以上何も言わず、隣で一緒に深呼吸をした。|{a}は{b}の目の前で、{d}の口癖を真似してみせた。{b}は一瞬あっけにとられ、それから小さく笑った。{a}「ほら、笑えた。{d}も、きっとそっちのほうがいい｜＝｜ほら、笑えましたね。{d}も、きっとそちらのほうがいいです」'),
blame:L('{a}は何を言えばいいのか分からず、ただ{b}の隣に座った。{a}「……うまく言えない。でも、ここにいる｜＝｜……うまく言えません。でも、ここにいます」――それだけ言うと、{a}も一緒に泣いた。二人はしばらく、肩を寄せ合っていた。|{a}はそっと{b}の袖を引いた。{a}「一人で泣かないで。私も、ここにいる｜一人で泣くな。私も、ここにいる｜一人で泣かないでください。私も、ここにいます」――{b}は驚いたように{a}を見て、それから小さくうなずいた。袖をつかむ{a}の指は、少しだけ震えていた。|{a}は{b}が眠れるまで、小さな声で話しかけ続けた。何を話したのかは、{b}もあとでよく覚えていなかった。ただ、{a}の声がずっとそばにあったことだけは覚えていた。'),
shared:L('{a}と{b}は、{d}の話をしながら一緒に泣いた。{a}「{d}がいないと、静かすぎる｜＝｜{d}がいないと、静かすぎます」――{b}は涙をぬぐいながら、何度もうなずいた。同じ人を失った者どうしにしか分からない沈黙が、二人のあいだに流れた。|{a}は{b}に、{d}が最後に笑っていたときのことを話した。{b}も、自分の知っている{d}の話をした。二人の知らない{d}が、少しずつつながっていった。|{a}は{b}の手を握った。{a}「{d}のこと、私たちは忘れない。だから、二人で生き延びる｜{d}のことを、私たちは忘れない。だから、二人で生き延びる｜{d}のこと、私たちは忘れません。だから、二人で生き延びましょう」――{b}は強く握り返した。二人の手は冷えていたが、握り合ったところだけは温かかった。')
};
var ANSWER={
sink:L('{b}はしゃくり上げながら、{a}の服の裾をつかんで離さなかった。|{b}は泣き腫らした目で、「ありがとう｜＝｜ありがとうございます」とだけ言った。|{b}はようやく、小さく息を吐いた。'),
blame:L('{b}「……でも、私が」――言いかけた{b}の言葉を、{a}は首を振って止めた。|{b}は何度も謝ろうとして、そのたびに言葉を飲み込んだ。|{b}は少しだけ、自分を責める言葉を口にしなくなった。'),
hold:L('{b}「……大丈夫だ。もう、大丈夫｜……大丈夫だ。もう、大丈夫だ｜……大丈夫です。もう、大丈夫です」――そう言った{b}の声は、少しだけ震えていた。|{b}は表情を変えなかったが、{a}の手を振り払いはしなかった。|{b}は短く「ごめん｜すまない｜すみません」と言って、目を伏せた。'),
bright:L('{b}「やだな、泣かせないで｜よしてくれ。泣かせるな｜嫌ですね、泣かせないでください」――{b}は笑いながら、目元をぬぐった。|{b}はいつもの軽口を言いかけて、途中で声を詰まらせた。|{b}は照れくさそうに笑ったが、その笑顔は前より自然だった。'),
flat:L('{b}は少し考えてから、「そうかもしれない｜＝｜そうかもしれません」と静かに答えた。|{b}は黙ってうなずき、{a}の言葉を胸の中で繰り返した。|{b}「……ありがとう。少し、整理できた｜＝｜……ありがとうございます。少し、整理できました」')
};
var ASIDE={
sink:L('{a}「{b}がいたら……」――そうつぶやいて、{a}は少し目を伏せた。|{a}はふと隣を見て、そこに{b}がいないことを思い出した。|{a}「{b}にも、見せたかった｜＝｜{b}にも、見せたかったです」――声が少しだけ震えた。'),
blame:L('{a}「{b}がいたら、もっとうまくやれた｜＝｜{b}がいたら、もっとうまくやれました」――{a}は小さく唇を噛んだ。|{a}は一瞬、{b}の名前を呼びかけて、口をつぐんだ。|{a}の顔が、ほんの一瞬だけ曇った。{b}のことを思い出したようだった。'),
hold:L('{a}は{b}ならどうしたかを、口には出さずに考えていた。|{a}は一度だけ{b}のいた場所に目をやり、すぐに視線を戻した。|{a}「……{b}なら、こう言った｜＝｜……{b}なら、こう言いました」'),
bright:L('{a}「{b}がいたら、絶対に茶化してた｜{b}がいたら、絶対に茶化していた｜{b}がいたら、絶対に茶化していました」――{a}は笑ったが、声が少しだけかすれた。|{a}は{b}の口癖をつい口にして、それから黙った。|{a}は笑いながら、{b}のいない隣に話しかけそうになった。'),
flat:L('{a}は手を止めて、{b}がいた頃のことを一瞬だけ思い返した。|{a}「{b}なら、もっと早く気づいていた｜＝｜{b}なら、もっと早く気づいていました」|{a}は{b}の分まで数えかけて、静かに数え直した。')
};
var DEV_NAME={worship:'信じていたものを失った',yan:'執着していた相手を失った'};
var DEV_REACT={
worship:L('{a}は{b}の亡骸の前で、祈るように手を組んだまま動かなくなった。{a}「{b}がいない世界で、何を信じて生きていけばいいのか、分からない｜＝｜{b}がいない世界で、何を信じて生きていけばいいのか、分かりません」――答える者はいなかった。{a}の目から、光がひとつ消えた。|{b}を失ったと知った瞬間、{a}は糸が切れたように座り込んだ。すべてを捧げると決めた相手は、もうどこにもいない。{a}は泣くことさえ忘れて、虚空を見つめていた。|{a}「嘘だ。{b}が、死ぬはずがない｜＝｜嘘です。{b}が、死ぬはずがありません」――{a}は何度も首を振った。{a}にとって{b}は、生きる理由そのものだった。その理由が、いま目の前で失われていた。'),
yan:L('{a}は{b}の名前を叫び続けた。声が嗄れても、喉に血の味がしても、やめなかった。{a}「返して。{b}を、返して｜返せ。{b}を、返せ｜返してください。{b}を、返してください」――その声は、もう誰に向けたものでもなかった。|{a}は{b}を失ったと聞いても、笑っていた。{a}「{b}は、私を置いていったりしない｜＝｜{b}は、私を置いていったりしません」――その笑顔が、周りの者には何より恐ろしかった。|{a}は{b}の名前を呼びながら、自分の腕に爪を立てた。血がにじんでも、{a}は止まらなかった。{b}のいない自分の体など、どうでもいいようだった。')
};
var DEV_BEAT={
worship:{
deep:L('{a}は今日も、{b}のための祈りを欠かさなかった。祈りの言葉は、途中で何度も途切れた。{a}「{b}、私はこれから、どうすればいいのか分からない｜＝｜{b}、私はこれから、どうすればいいのか分かりません」――返事のない問いだけが、毎日積み重なっていった。|{a}は{item}を、祭壇のように整えた場所に置いた。毎朝そこに頭を下げてから、{a}は一日を始めた。そうしなければ、立ち上がれなかった。|{a}は{b}の声を思い出そうとして、うまく思い出せないことに気づいた。{a}はその場にうずくまり、長いあいだ動かなかった。信じていたものが、少しずつ遠ざかっていく気がした。'),
mid:L('{a}は、{b}ならどう言うかを考えてから動くようになった。{b}がいなくても、{b}の望みに従っていたかった。それが、{a}に残された唯一の支えだった。|{a}は{b}の口癖を、教えのように繰り返した。誰かがそれを笑うと、{a}は静かに睨み返した。'),
late:L('{a}は、{b}がくれたものを数えるようになった。失ったものではなく、もらったものを。{a}「{b}に恥じない生き方をする｜＝｜{b}に恥じない生き方をします」――それが、{a}の新しい祈りだった。|{a}は{item}を胸に当てて、短く目を閉じた。祈りは前より短くなったが、やめることはなかった。')
},
yan:{
deep:L('{a}は{b}がまだ生きているかのように、二人分の食事を用意した。{a}「{b}、冷めるよ｜{b}、冷めるぞ｜{b}、冷めますよ」――誰も座っていない席に、{a}は話しかけ続けた。|{a}は夜中に起き出して、{b}を探しに行こうとした。{a}「{b}が呼んでる｜{b}が呼んでいる｜{b}が呼んでいます」――{a}の目は、どこも見ていなかった。|{a}は{item}に頬を寄せて、ひとりで笑っていた。{a}「ずっと一緒。もう誰にも取られない｜ずっと一緒だ。もう誰にも取られない｜ずっと一緒です。もう誰にも取られません」'),
mid:L('{a}は{b}以外の誰にも、心を開こうとしなかった。誰かが近づくと、{a}は「{b}が嫌がる｜＝｜{b}が嫌がります」とだけ言って背を向けた。|{a}は{item}を肌身離さず持ち歩き、誰にも触らせなかった。'),
late:L('{a}は{b}のいない日々を、ただ数えるように生きていた。{a}「{b}のところへ行く日まで、生きてやる｜＝｜{b}のところへ行く日まで、生きてみせます」――それが、{a}なりの約束だった。|{a}は{item}を握りしめて、ようやく少しだけ眠れるようになった。')
}
};
var DEV_CRASH={
worship:L('{a}は淡々と日々をこなしていた。ある朝、祈ろうとして、祈る相手がもういないことに気づいた。{a}「……{b}」――{a}はその場に崩れ、声を上げて泣いた。'),
yan:L('{a}は何事もなかったように振る舞っていた。ある夜、{item}を見つけた瞬間、{a}は叫び声を上げた。{a}「{b}、{b}、{b}」――名前を呼ぶ声は、朝まで止まなかった。')
};
var DEV_BREAK={
worship:L('一人きりの{spot}で、{a}は{item}を胸に抱いて額を床につけた。{a}「{b}のいない世界に、私の残るものなんて何もない｜{b}のいない世界に、私の残るものなど何もない｜{b}のいない世界に、私の残るものなんて何もありません」――誰にも見せなかった祈りが、嗚咽に変わった。'),
yan:L('一人になった{spot}で、{a}は壁に頭を打ちつけた。{a}「なんで、私を置いていったの｜なぜ、私を置いていった｜なぜ、私を置いていったんですか」――ずっと笑顔で隠してきたものが、一度に崩れた。')
};
var DEV_BROKEN={
worship:L('{a}は、{b}がまだそばにいるかのように話しかけるようになった。{a}「{b}、今日はここで休む。……いいよね｜{b}、今日はここで休む。……いいだろう｜{b}、今日はここで休みます。……いいですよね」――返事を待つ{a}の横顔は、穏やかでさえあった。それが、周りの者には何より痛々しかった。|{a}は{b}が最後に立っていた場所に、毎日欠かさず花を置いた。花がなければ、瓦礫の中の雑草を摘んだ。{a}「{b}は、ここにいる｜＝｜{b}は、ここにいます」――{a}はそう信じて疑わなかった。'),
yan:L('{a}は{item}を抱いたまま、{b}の名前で自分を呼ぶようになった。{a}「これで、ずっと一緒｜これで、ずっと一緒だ｜これで、ずっと一緒です」――その笑顔に、誰も声をかけられなかった。|{a}は{b}の書いた字を、自分の腕に何度もなぞった。{a}「消えないように。忘れないように」――ペンの跡は、肌が赤くなるまで続いた。')
};
var DEV_FOLLOW={
worship:L('{a}は武器を置いて、群れのうろつく通りへ歩き出した。{a}「{b}のそばへ行く。それが、最後の務めだ｜＝｜{b}のそばへ行きます。それが、最後の務めです」――その足取りに、迷いはなかった。|{a}は{item}を握りしめたまま、{b}が倒れた場所へ一人で向かった。外にはまだ、呻き声がいくつも響いていた。'),
yan:L('{a}は笑いながら、扉のバリケードを崩し始めた。{a}「{b}が待ってる。一人にしたら、かわいそう｜{b}が待っている。一人にしたら、かわいそうだ｜{b}が待っています。一人にしたら、かわいそうです」|{a}は{b}を失った場所へ、裸足のまま走っていった。{a}「{b}、今行く｜＝｜{b}、今行きます」')
};
var DEV_FOLLOW_SOFT={
worship:L('{a}「{b}のいないところで、生きている意味があるのかな｜{b}のいないところで、生きている意味があるのだろうか｜{b}のいないところで、生きている意味があるのでしょうか」――{a}は遠くを見つめたまま、ぽつりとつぶやいた。その横顔に、聞いた者は背筋が冷たくなった。'),
yan:L('{a}「{b}のところへ行きたい。……行けば、また会える｜＝｜{b}のところへ行きたいです。……行けば、また会えます」――{a}は本気でそう信じているようだった。')
};
var DEV_STOP=L('{c}が{a}の前に立ちふさがった。{c}「{b}は、{a}にそんなことを望んでない｜{b}は、{a}にそんなことを望んでいない｜{b}は、{a}にそんなことを望んでいません」――{a}はしばらく抗っていたが、やがて{c}の腕の中で崩れ落ちた。|{c}は{a}の腕をつかんで、力ずくで引き戻した。{c}「行かせない。{a}まで失いたくない｜＝｜行かせません。{a}まで失いたくありません」――{a}は声を上げて泣いた。');
var DEV_ALONE=L('{a}は長いあいだ、そこに立ち尽くしていた。やがて、誰に止められたわけでもなく、ひとりで引き返した。{item}が、手の中でひどく重かった。');
var DEV_ASIDE={
worship:L('{a}は、{b}に祈るように一瞬だけ目を閉じた。|{a}「{b}なら、こうしろと言った｜＝｜{b}なら、こうしろと言いました」――その声には、迷いがなかった。'),
yan:L('{a}は誰もいない隣に向かって、小さく笑いかけた。|{a}「{b}も、そう思うよね｜{b}も、そう思うだろう｜{b}も、そう思いますよね」――答える者はいなかった。')
};
function devOf(ctx,o,v){
var H=HK.Ties;
if(H&&H.from(ctx,o,v,'worship'))return'worship';
if(H&&H.from(ctx,o,v,'yan'))return'yan';
var pf=ctx.pair(o,v);
if(pf.ob&&pf.ob[o.i]&&HK.Obsess&&HK.Obsess.level&&HK.Obsess.level(ctx,o,v)>=60)return'yan';
return'';
}
function dur(l){return clamp((l.d||l.lv0)/95,0.75,1.6)*(l.dev?1.7:1);}
function heavy(l){return!!l.dev||(l.d||0)>=115;}
G.devOf=devOf;
var DEF_ITEMS=L('{b}の上着|{b}が使っていた物|{b}の靴');
var DEF_SPOTS=L('部屋の隅|窓辺|いつもの場所');
function ok(c){return c&&c.alive&& !c.out&& !c.mad&& !(c.flags&&(c.flags.caged!=null||c.flags.offstage));}
function lossOf(c){var l=c&&c.flags&&c.flags.loss;return l&& !l.done?l:null;}
G.of=lossOf;
function stage(l){
if(l.type==='flat')return l.calm?'deep':l.lv>=28?'mid':'late';
return l.lv>=55?'deep':l.lv>=28?'mid':'late';
}
function vars(ctx,l,opt,extra){
var dn=l.name,items=opt.items||DEF_ITEMS,spots=opt.spots||DEF_SPOTS;
var m={b:dn,d:dn,rel:l.rel};
m.item=fill(ctx.pick(items),{b:dn});
m.spot=fill(ctx.pick(spots),{b:dn});
for(var k in extra)m[k]=extra[k];
return m;
}
function why(a,l,what){
return a.name+'は、'+(l.rel?l.rel+'の':'')+l.name+'を失った（喪失：'+TYPE_NAME[l.type]+(l.dev?'・'+DEV_NAME[l.dev]:'')+'・深さ '+Math.round(l.lv)+'）'+(what?'／'+what:'');
}
function addStress(c,v){c.stress=clamp((c.stress||0)+v,0,100);}
function scan(ctx,s,n,opt){
var seen=ctx.flags.gfSeen||(ctx.flags.gfSeen={});
ctx.chars.forEach(function(v){if(v.alive&&seen[v.i])delete seen[v.i];});
var dead=ctx.chars.filter(function(v){return!v.alive&& !v.out&& !seen[v.i];});
if(!dead.length)return;
var react=[];
dead.forEach(function(v){
seen[v.i]=1;
ctx.chars.forEach(function(o){
if(o===v|| !ok(o))return;
var dp=G.depth(ctx,o,v,opt);
addMourn(ctx,o,v,dp,s,opt);
if(dp.d<(opt.min||40))return;
var cur=lossOf(o),type=cur?cur.type:typeOf(o);
var lv=clamp(dp.d*MULT[type],30,100);
var l={who:v.i,name:v.name,rel:dp.rel,at:s,lv:lv,lv0:lv,type:type,last:s,aside: -9,comfortAt: -9,others:[],reckless:0,d:dp.d,dev:devOf(ctx,o,v)};
if(type==='flat'){l.calm=true;l.crashAt=s+(opt.crash||2)+(ctx.rng()<0.5?1:0);}
if(cur&&cur.lv>=lv){cur.others.push(v.name);cur.lv=Math.min(100,cur.lv+10);cur.lv0=Math.max(cur.lv0,cur.lv);l=cur;}
else{
if(cur){l.others=cur.others.concat([cur.name]);l.lv=l.lv0=Math.min(100,lv+8);l.calm=cur.calm;l.crashAt=cur.crashAt;l.broke=cur.broke;if(!l.dev&&cur.dev){l.dev=cur.dev;}}
o.flags.loss=l;
if(HK.Emo)HK.Emo.bump(ctx,o,{grief:Math.min(30,lv*0.3)},v.name+'を失った');
}
addStress(o,lv*(type==='flat'?0.25:type==='hold'?0.4:0.5)+(l.dev?15:0));
if(o.flags.grief==null)o.flags.grief=v.i;
if(l.who===v.i)react.push({o:o,l:l});
});
});
react.sort(function(x,y){return y.l.lv-x.l.lv;});
react.slice(0,opt.reactMax||3).forEach(function(x){
var o=x.o,l=x.l;
var dr=l.dev&&l.type!=='flat'&&l.type!=='hold'?DEV_REACT[l.dev]:null;
ctx.act2({actors:[o],cat:'solo',text:fill(ctx.pick(dr||REACT[l.type]),vars(ctx,l,opt,{a:o.name})),why:why(o,l,'知らせを受けて'+(dr?'。'+(l.dev==='worship'?'すべてを捧げていた相手だった':'世界のすべてだった相手だった'):'')),mag:18+l.lv/5+(dr?8:0)});
});
}
function beat(ctx,o,l,opt){
l.last=ctx.stepIndex;
addStress(o,3);
var st=stage(l),dv=l.dev&& !(l.type==='flat'&&l.calm)&&ctx.rng()<0.6?DEV_BEAT[l.dev][st]:null;
return{text:fill(ctx.pick(dv||BEAT[l.type][st]),vars(ctx,l,opt,{a:o.name})),why:why(o,l,st==='late'?'少しずつ薄れてきた':'まだ引きずっている'),mag:8+l.lv/8};
}
function comfort(ctx,a,b,opt){
var l=lossOf(b),al=lossOf(a),shared=al&&al.who===l.who;
var key=shared?'shared':typeOf(a);
var spots=(opt.spots||DEF_SPOTS).filter(function(x){return x.indexOf('{b}')<0;});
var m=vars(ctx,l,{items:opt.items,spots:spots.length?spots:DEF_SPOTS},{a:a.name,b:b.name,d:l.name});
var t=fill(ctx.pick(COMFORT[key]),m)+fill(ctx.pick(ANSWER[l.type]),m);
l.comfortAt=ctx.stepIndex;l.last=ctx.stepIndex;l.comforts=(l.comforts||0)+1;
l.lv=Math.max(0,l.lv-(shared?8:6));
if(l.type==='flat'&&l.calm)l.crashAt=Math.min(l.crashAt,ctx.stepIndex+1);
addStress(b,-10);
ctx.mod(b,a,{trust:6,aff:5});ctx.mod(a,b,{aff:3});
return{text:t,why:a.name+'が、'+l.name+'を失った'+b.name+'に寄り添った（慰める側：'+(shared?'同じ人を亡くした者どうし':TYPE_NAME[key]+'の型')+'／'+b.name+'：'+TYPE_NAME[l.type]+'・深さ '+Math.round(l.lv)+'）',mag:14};
}
function nearFriend(ctx,o,except){
var best=null,bv=15;
ctx.others(o).forEach(function(c){if(!ok(c)||c===except)return;var v=ctx.R(c,o).aff+c.tr.np*20+ctx.rng()*10;if(v>bv){bv=v;best=c;}});
return best;
}
function tick(ctx,s,n,opt){
var beats=0,comforts=0;
ctx.chars.forEach(function(o){
var l=lossOf(o);
if(l&&ctx.chars[l.who]&&ctx.chars[l.who].alive){l.done=true;return;}
if(!l|| !ok(o)||l.at===s)return;
var t=null;
if(l.type==='flat'&&l.calm&&s>=l.crashAt){
l.calm=false;l.lv=Math.min(100,l.lv+15);l.lv0=Math.max(l.lv0,l.lv);l.last=s;addStress(o,25);
t={text:fill(ctx.pick(l.dev?DEV_CRASH[l.dev]:CRASH),vars(ctx,l,opt,{a:o.name})),why:why(o,l,'淡々としていた分、あとから崩れた'),mag:25};
}else if(l.type==='hold'&& !l.broke&&l.lv>=40&&(o.stress>=65||s-l.at>=4)&&ctx.rng()<0.5*HK.Dark.f(ctx,'madness')){
l.broke=true;l.last=s;addStress(o,-10);
t={text:fill(ctx.pick(l.dev?DEV_BREAK[l.dev]:BREAK),vars(ctx,l,opt,{a:o.name})),why:why(o,l,'人前では抱え込んでいたものが、一人のときに崩れた'),mag:22};
}else if(!l.accepted&& !l.calm&&l.lv<Math.max(24,l.lv0*(l.dev?0.35:0.5))&&s-l.at>=Math.max(3,(n-l.at)*(l.dev?0.7:0.5))){
l.accepted=true;l.last=s;
t={text:fill(ctx.pick(ACCEPT[l.type]),vars(ctx,l,opt,{a:o.name})),why:why(o,l,'少しだけ前を向いた'),mag:15};
}else if(comforts<1&&l.lv>=45&&s-l.comfortAt>=3&&(l.comforts||0)<4&&ctx.rng()<0.35){
var c=nearFriend(ctx,o,null);
if(c&& !(lossOf(c)&&lossOf(c).who!==l.who&&lossOf(c).lv>60)){comforts++;var r=comfort(ctx,c,o,opt);ctx.act2({actors:[c,o],cat:'help',text:r.text,why:r.why,mag:r.mag});}
}else if(beats<(heavy(l)?3:2)&&l.lv>=30&&s-l.last>=(l.lv>=60?(heavy(l)?1:2):3)&&ctx.rng()<(heavy(l)?0.65:0.55)){
beats++;t=beat(ctx,o,l,opt);
}
if(t)ctx.act2({actors:[o],cat:'solo',text:t.text,why:t.why,mag:t.mag});
addStress(o,l.lv/20);
if(!l.calm)l.lv=Math.max(0,l.lv-Math.max(1.5,l.lv0*0.6/Math.max(2,Math.min(n-l.at,opt.span||99)))/dur(l));
if(l.lv<=6&&l.accepted)l.done=true;
});
mournTick(ctx,s,n,opt);
}
var MOURN_CLOSE= /^(?:lover|spouse|fiance|honmei|mate|fated|parent|pparent|sibprot|sibclose|sibling|stepsib|relative|best)$/;
var MOURN_FRIEND= /^(?:friend|buddy|childhood|almost|mentor|teacher|senpai|colleague|classmate|comrade|boss|benefactor|crush|yan|worship|fond|blind|master|acq)$/;
var MOURN_NO= /^(?:apathy|enemy|bad|sibbad|abuse|fear)$/;
var MOURN_KIND_NAME={close:'恋人・家族・親友',friend:'友人・仲間',acq:'顔見知り'};
var MOURN={
mood:{
deep:L('{a}は一日じゅう、ほとんど口をきかなかった。話しかけられても、少し遅れてから短く答えるだけだった。|{a}の目は赤く腫れたままだった。{b}がいないというだけで、景色の色が一段暗く見えた。|{a}は何をしていても、途中で手が止まった。{b}のいない時間に、まだ体が慣れていなかった。'),
lite:L('{a}はいつもより静かだった。{b}のことを考えているのだと、誰もが分かっていた。|{a}はふとした拍子に、ため息をついた。{b}のいない場所が、どうしても目に入った。|{b}のことが頭をよぎるたびに、{a}の笑顔は少しだけぎこちなくなった。')
},
name:{
deep:L('{a}は話の途中で、つい{b}の名前を出した。言ってから、{a}は口をつぐんだ。誰も、何も言えなかった。|{a}「{b}なら、こういうとき……｜{b}なら、こういうとき……｜{b}さんでしたら、こういうときは……」――{a}は言いかけて、その先を飲み込んだ。|{a}は誰かを呼ぼうとして、{b}の名前を口にしかけた。振り向いた先には、誰もいなかった。'),
lite:L('{a}は{b}の話をしかけて、途中でやめた。|皆で話しているとき、{a}はぽつりと言った。{a}「{b}にも、聞かせたかった｜{b}にも、聞かせたかった｜{b}さんにも、聞かせたかったです」|{a}は{b}のことを思い出して、少しだけ目を伏せた。')
},
item:{
deep:L('{a}は{item}を手に取ったまま、長いあいだ動かなかった。まだ、{b}の匂いが残っている気がした。|{a}は{item}を胸に抱えて眠った。朝になっても、手放せなかった。|{a}は{item}を、何度も指でなぞった。そうしていないと、手が震えた。'),
lite:L('{a}は{item}を見つけて、そっと元の場所に戻した。|{a}は{item}を、誰にも触らせないようにしまっておいた。|{a}は{item}の汚れを、丁寧に拭き取った。')
},
meal:{
deep:L('{a}の食事は、ほとんど減らなかった。一口食べるたびに、喉の奥がつかえた。|{a}は食事の席に着いたものの、手を止めたまま動かなかった。{b}の分の席が、空いたままだった。|{a}は無理に食べ物を口に運んだ。味は、何もしなかった。'),
lite:L('{a}は食事を半分ほど残した。|{a}はいつもの席に座ろうとして、そこが{b}の隣だったことを思い出した。|{a}は食事のあいだ、ほとんど話さなかった。')
},
night:{
deep:L('夜、{a}は毛布をかぶって声を殺して泣いた。それでも、すすり泣く声は隣まで聞こえていた。|{a}は眠れないまま、{b}の名前を何度も小さく呼んだ。返事がないと分かっていても、呼ぶのをやめられなかった。|夜中に目を覚ました{a}は、{b}の夢を見ていたことに気づいた。頬が濡れていた。'),
lite:L('{a}は夜、一人になってから少しだけ泣いた。|{a}はなかなか寝つけず、何度も寝返りを打った。|{a}は夜空を見上げて、{b}のことを思った。')
}
};
var MOURN_ACT={
withdraw:L('{a}は誰とも顔を合わせようとしなかった。{spot}にこもったまま、呼ばれても出てこなかった。|{a}は膝を抱えたまま、一日じゅう同じ場所から動かなかった。誰の言葉も、{a}の耳には届いていないようだった。|{a}は{b}のことを話そうとする人から、黙って離れていった。今は、誰とも話したくなかった。'),
lash:L('{c}の何気ない一言に、{a}が声を荒らげた。{a}「よく、そんなことが言える｜よく、そんなことが言えるな｜よく、そんなことが言えますね」――{c}が驚いて黙ると、{a}は自分の言葉に傷ついたような顔をした。|{a}は{c}が{b}の物に触れたのを見て、その手を払いのけた。払いのけてから、{a}は自分が何をしたのか分かって、唇を噛んだ。|{a}は些細なことで{c}に当たった。{a}「放っておいて｜放っておけ｜放っておいてください」――{c}は何か言いかけて、黙って背を向けた。'),
bright:L('{a}は誰よりも明るく振る舞った。{a}「平気。私が暗くしていたら、皆まで沈む｜平気だ。私が暗くしていたら、皆まで沈む｜平気です。私が暗くしていたら、皆まで沈みます」――その声は、少しだけ上ずっていた。|{a}はいつも以上に冗談を言った。笑い声のあとで、{a}がひとりで黙り込むのを、何人かが見ていた。|{a}は{b}の分まで働くと言って、休む間もなく動き回った。笑顔は崩さなかったが、目の下の隈は日ごとに濃くなった。'),
slip:L('{a}は誰にも言わずに、一人でその場を抜け出した。{spot}で、{a}は長いあいだ一人で座っていた。|気づくと、{a}の姿が見えなくなっていた。{a}は{b}とよく話した場所に、一人で立っていた。|{a}は夜明け前に、こっそり出ていった。戻ってきたとき、{a}の目は真っ赤だった。'),
found:L('探しに来た{c}が、{a}の隣に黙って座った。二人はしばらく、何も言わなかった。|{c}が{a}を見つけた。{c}「一人で行かないで｜一人で行くな｜一人で行かないでください」――{a}は小さく頷いた。|{c}は{a}の肩に上着をかけて、そのまま隣にいた。')
};
var MOURN_ACT_NAME={withdraw:'ふさぎ込む',lash:'八つ当たり',bright:'空元気',slip:'一人で抜け出す'};
var FUNERAL=L('{l}は、{b}のために短い黙祷をした。誰も、最後まで目を開けなかった。|{a}が{b}の名前を書いた小さな札を立てた。{l}は一人ずつ、その前で手を合わせた。|{l}は{item}を囲んで座った。言葉は少なかったが、誰も席を立たなかった。|その夜、{l}は{b}の話をした。笑う人もいれば、泣く人もいた。それが、この場所でできる精一杯の弔いだった。');
function perDay(ctx,opt){
if(opt.perDay)return opt.perDay;
var sc=ctx.scen||{};
return sc.unit==='日'?(sc.perUnit||1):0;
}
function nearKind(ctx,o,v,dp){
var ts=HK.Ties?HK.Ties.all(ctx,o,v):[],k='';
if(ts.some(function(t){return MOURN_NO.test(t.type)&&(t.type!=='fear'||t.a===o.i);})&& !ctx.pair(o,v).couple)return'';
ts.forEach(function(t){
if(t.type==='crush'&&t.a!==o.i)return;
if(MOURN_CLOSE.test(t.type))k='close';
else if(MOURN_FRIEND.test(t.type)&&k!=='close')k='friend';
});
if(ctx.pair(o,v).couple)k='close';
var d=dp?dp.d:G.depth(ctx,o,v).d;
if(!k)k=d>=95?'close':d>=45?'friend':d>=22?'acq':'';
else if(k==='friend'&&d>=110)k='close';
if(ctx.R(o,v).aff< -10&&k!=='close')return'';
return k;
}
function addMourn(ctx,o,v,dp,s,opt){
if(opt.mourn===false||v.killedBy===o.i)return;
var k=nearKind(ctx,o,v,dp);
if(!k)return;
var mild=HK.Dark&&HK.Dark.on(ctx,'kill')==='mild';
if(mild)k=k==='close'?'friend':k==='friend'?'acq':'';
if(!k)return;
var pd=perDay(ctx,opt),days={close:3,friend:2,acq:1}[k],until;
if(pd)until=(Math.floor(s/pd)+days)*pd-1;
else until=s+days-1;
var list=o.flags.mourn=o.flags.mourn||[];
list.push({who:v.i,name:v.name,k:k,at:s,until:until,rel:dp&&dp.rel?dp.rel:'',used:{},n:0,last: -9,act:0});
}
function mournOf(ctx,o,s){
var best=null,order={close:3,friend:2,acq:1};
(o.flags.mourn||[]).forEach(function(m){
var v=ctx.chars[m.who];
if(!v||v.alive||s>m.until||s<=m.at)return;
if(!best||order[m.k]>order[best.k])best=m;
});
return best;
}
function mournWhy(o,m,what){
return o.name+'は、'+(m.rel?m.rel+'の':'')+m.name+'を失って間もない（'+MOURN_KIND_NAME[m.k]+'・あと'+Math.max(0,m.until-m.at)+'区切りほど引きずる）'+(what?'／'+what:'');
}
function mournTick(ctx,s,n,opt){
var rng=ctx.rng,mild=HK.Dark&&HK.Dark.on(ctx,'kill')==='mild',lab=String(ctx.label||''),done=0,max=opt.mournMax||(ctx.chars.length>10?3:2);
if(opt.funeral!==false){
var fs=ctx.flags.gfFun=ctx.flags.gfFun||{};
ctx.chars.forEach(function(v){
if(v.alive||fs[v.i]||v.out)return;
var ms=[];
ctx.chars.forEach(function(o){if(!ok(o))return;var m=(o.flags.mourn||[]).filter(function(x){return x.who===v.i&&s>x.at&&x.k!=='acq';})[0];if(m)ms.push({o:o,m:m});});
var at=ms.length?ms[0].m.at:null;
if(at==null||s<=at)return;
fs[v.i]=1;
if(!(ms.length>=2||ms.some(function(x){return x.m.k==='close';}))||(mild&&rng()<0.5))return;
ms.sort(function(x,y){return(y.m.k==='close'?1:0)-(x.m.k==='close'?1:0);});
var lead=ms[0].o,who=ms.slice(0,4).map(function(x){return x.o;});
var m0=vars(ctx,{name:v.name,rel:ms[0].m.rel},opt,{a:lead.name,l:who.map(function(c){return c.name;}).join('・')});
ctx.act2({actors:who,cat:'bond',mag:14,fx:function(){who.forEach(function(c){addStress(c,-4);});},text:fill(ctx.pick(FUNERAL),m0),why:v.name+'の弔い（近かった'+who.length+'人）'});
});
}
var cand=[];
ctx.chars.forEach(function(o){
if(!ok(o))return;
var m=mournOf(ctx,o,s);
if(!m||m.last===s)return;
var p={close:0.75,friend:0.45,acq:0.3}[m.k]*(mild?0.6:1)*(m.n>=3?0.6:1);
if(rng()<p)cand.push({o:o,m:m});
});
cand.sort(function(x,y){return(y.m.k==='close'?2:y.m.k==='friend'?1:0)-(x.m.k==='close'?2:x.m.k==='friend'?1:0);});
cand.slice(0,max).forEach(function(x){
var o=x.o,m=x.m,e=o.emo||{},deep=m.k==='close'&& !mild,lv=deep?'deep':'lite';
m.last=s;m.n++;
var mv=vars(ctx,{name:m.name,rel:m.rel},opt,{a:o.name});
if(m.k!=='acq'&&m.act<2&&(o.stress>=60||(e.anger||0)>=40)&&rng()<0.6){
var t=o.tr,w={withdraw:0.4+t.ac*0.6+t.np*0.3+(e.grief||0)/200,lash:t.cp*0.5+t.aggr*0.6+(e.anger||0)/100,bright:t.fc*0.8,slip:t.caution*0.4+t.impulse*0.3+t.a*0.3};
var others=ctx.others(o).filter(function(c){return ok(c);});
if(!others.length){w.lash=0;}
var kind=HK.weighted(rng,['withdraw','lash','bright','slip'],function(k2){return m.used['b_'+k2]?w[k2]*0.3:w[k2];});
m.used['b_'+kind]=1;m.act++;
var c=null,txt;
if(kind==='lash'){
c=ctx.most(others,function(z){return ctx.R(o,z).ten/50+rng()*0.5;});
mv.c=c.name;
txt=fill(ctx.pick(MOURN_ACT.lash),mv);
ctx.mod2(o,c,{ten:8},{ten:6,aff: -3});
if(HK.Emo)HK.Emo.bump(ctx,o,{anger:10,shame:6});
}else if(kind==='slip'){
txt=fill(ctx.pick(MOURN_ACT.slip),mv);
c=nearFriend(ctx,o,null);
if(c&&rng()<0.6){mv.c=c.name;txt+=fill(ctx.pick(MOURN_ACT.found),mv);ctx.mod(o,c,{trust:5,aff:4});}else c=null;
}else{
txt=fill(ctx.pick(MOURN_ACT[kind]),mv);
if(kind==='bright')addStress(o,4);
}
if(kind!=='slip'|| !c)addStress(o,kind==='withdraw'?2:0);
ctx.act2({actors:c?[o,c]:[o],cat:kind==='lash'?'conflict':c?'help':'solo',mag:12,text:txt,why:mournWhy(o,m,MOURN_ACT_NAME[kind]+'（負担 '+Math.round(o.stress)+'）')});
return;
}
var night= /夜|夕/.test(lab),meal= /朝|昼|食/.test(lab),pd=perDay(ctx,opt);
var wk={mood:1,name:1,item:1,meal:meal|| !pd?1.3:0.4,night:night|| !pd?1.6:0.2};
var k3=HK.weighted(rng,['mood','name','item','meal','night'],function(k4){return m.used[k4]?wk[k4]*0.2:wk[k4];});
m.used[k3]=1;
addStress(o,deep?3:1);
if(HK.Emo)HK.Emo.bump(ctx,o,{grief:deep?6:3});
ctx.act2({actors:[o],cat:'solo',mag:deep?10:6,text:fill(ctx.pick(MOURN[k3][lv]),mv),why:mournWhy(o,m,{mood:'気分が沈む',name:'名前を出す',item:'遺品に触れる',meal:'食事が喉を通らない',night:'夜に泣く'}[k3])});
});
}
G.mournOf=function(ctx,o){return mournOf(ctx,o,ctx.stepIndex);};
var SKIP_CAT= /^(?:romance|lewd|sex|death|combat|betray)$/;
function aside(ctx,a,r,cat){
if(!r||typeof r.text!=='string'|| !r.text)return r;
if(SKIP_CAT.test(r.cat||cat||''))return r;
var l=lossOf(a);
if(!l||l.lv<25||l.calm||ctx.stepIndex-l.at<1||ctx.stepIndex-l.aside<(heavy(l)?2:3)||(l.asides||0)>=(heavy(l)?10:6)||r.text.indexOf(l.name)>=0)return r;
if(ctx.rng()>0.08+l.lv/500+(l.dev?0.08:0))return r;
l.aside=ctx.stepIndex;l.asides=(l.asides||0)+1;
r.text+=fill(ctx.pick(l.dev&&ctx.rng()<0.5?DEV_ASIDE[l.dev]:ASIDE[l.type]),{a:a.name,b:l.name});
r.why=(r.why?r.why+'／':'')+a.name+'は、まだ'+l.name+'のことを引きずっている（喪失：'+TYPE_NAME[l.type]+'）';
return r;
}
var MINE=[];
HK.wrap(HK,'buildPool',function(bp0){return function(scen){
var pool=bp0.apply(this,arguments);
if(!scen|| !scen.griefKit)return pool;
return pool.map(function(e){
var pr=e&&Object.getPrototypeOf(e);
if(pr&&MINE.indexOf(pr)>=0)return pr;
if(!e||typeof e.run!=='function'|| /^gf_/.test(e.id||'')||e.r18||SKIP_CAT.test(e.cat||''))return e;
var w=Object.create(e);
w.run=function(ctx,a){return aside(ctx,a,e.run.apply(this,arguments),e.cat);};
return w;
});
};});
G.install=function(scen,opt){
if(!scen|| !scen.events||scen.griefKit)return;
scen.griefKit=opt=opt||{};
var ph0=scen.phase,af0=scen.after;
scen.phase=function(ctx,s,n){var r=ph0?ph0.apply(this,arguments):undefined;ctx.flush();scan(ctx,s,n,opt);return r;};
scen.after=function(ctx,s,n){var r=af0?af0.apply(this,arguments):undefined;ctx.flush();scan(ctx,s,n,opt);tick(ctx,s,n,opt);return r;};
var mine=[];
mine.push({
id:'gf_think',label:'亡くした人のことばかり考える',cat:'solo',scope:'solo',noOdd:true,
when:function(ctx,a){var l=lossOf(a);return!!l&&l.lv>=15&&ctx.stepIndex-l.last>=(heavy(l)?1:2);},
w:function(ctx,a){var l=lossOf(a);return(0.4+l.lv/30)*(heavy(l)?1.4:1)*(opt.w||1);},
run:function(ctx,a){return beat(ctx,a,lossOf(a),opt);}
});
mine.push({
id:'gf_reckless',label:'悲しみから無茶をする',cat:'solo',scope:'solo',noOdd:true,
when:function(ctx,a){var l=lossOf(a);return!!l&&l.lv>=50&& !l.calm&&l.reckless<2&&l.type!=='flat'&&ctx.stepIndex-l.at>=1;},
w:function(ctx,a){var l=lossOf(a);return(0.2+a.tr.impulse*0.8+(l.type==='blame'||l.type==='bright'?0.4:0))*(opt.w||1)*HK.Dark.f(ctx,'harm');},
run:function(ctx,a){
var l=lossOf(a),c=nearFriend(ctx,a,null);
l.reckless++;l.last=ctx.stepIndex;addStress(a,5);
var list=opt.reckless?RECKLESS.concat(opt.reckless):RECKLESS;
var t=fill(ctx.pick(list),vars(ctx,l,opt,{a:a.name}));
if(c){t+=fill(ctx.pick(STOP),{a:a.name,b:l.name,c:c.name});ctx.mod(a,c,{trust:5});ctx.mod(c,a,{aff:3});}
return{text:t,why:why(a,l,'自分を大事にできなくなっている')+(c?'／'+c.name+'が止めた':''),mag:16,with:c?[c]:null};
}
});
mine.push({
id:'gf_broken',label:'喪失で心が壊れてしまう',cat:'solo',scope:'solo',noOdd:true,
when:function(ctx,a){var l=lossOf(a);return!!l&& !!l.dev&& !l.calm&& !l.brokenDev&&l.lv>=50&&ctx.stepIndex-l.at>=1;},
w:function(ctx,a){return(0.8+lossOf(a).lv/60)*(opt.w||1);},
run:function(ctx,a){
var l=lossOf(a);
l.brokenDev=true;l.last=ctx.stepIndex;l.lv=Math.min(100,l.lv+5);addStress(a,10);
return{text:fill(ctx.pick(DEV_BROKEN[l.dev]),vars(ctx,l,opt,{a:a.name})),why:why(a,l,'心のどこかが壊れてしまった'),mag:22};
}
});
mine.push({
id:'gf_follow',label:'亡くした人のあとを追おうとする',cat:'solo',scope:'solo',noOdd:true,
when:function(ctx,a){var l=lossOf(a);return!!l&& !!l.dev&& !l.calm&&l.lv>=60&&(l.follow||0)<(l.d>=120?2:1)&&ctx.stepIndex-l.at>=1&&ctx.stepIndex-(l.followAt|| -9)>=3;},
w:function(ctx,a){var l=lossOf(a);return(0.5+a.tr.impulse*0.5+a.tr.ac*0.4+(l.type==='blame'||l.type==='sink'?0.4:0))*(opt.w||1);},
run:function(ctx,a){
var l=lossOf(a),c=nearFriend(ctx,a,null),hard= !!opt.follow,m=vars(ctx,l,opt,{a:a.name,c:c?c.name:''});
l.follow=(l.follow||0)+1;l.followAt=l.last=ctx.stepIndex;addStress(a,8);
var t=fill(ctx.pick(hard?DEV_FOLLOW[l.dev]:DEV_FOLLOW_SOFT[l.dev]),m),w=why(a,l,'あとを追おうとした');
if(c&&ctx.rng()<0.8){
t+=fill(ctx.pick(DEV_STOP),m);ctx.mod(a,c,{trust:6,aff:4});ctx.mod(c,a,{aff:4});addStress(c,6);
l.lv=Math.max(0,l.lv-4);
return{text:t,why:w+'／'+c.name+'が止めた',mag:24,with:[c]};
}
if(hard){var r=opt.follow(ctx,a,l,m);if(r){t+=r.text;w+=r.why?'／'+r.why:'';}else t+=fill(ctx.pick(DEV_ALONE),m);}
else t+=fill(ctx.pick(DEV_ALONE),m);
return{text:t,why:w+'／止める人はいなかった',mag:26};
}
});
mine.push({
id:'gf_comfort',label:'大切な人を亡くした人に寄り添う',cat:'help',scope:'pair',noOdd:true,
when:function(ctx,a,b){
var l=lossOf(b);
if(!l||l.lv<20||l.who===a.i||ctx.stepIndex-l.comfortAt<3||(l.comforts||0)>=4|| !ok(b))return false;
var la=lossOf(a);if(la&&la.who!==l.who&&la.lv>60)return false;
return ctx.R(a,b).aff>5;
},
w:function(ctx,a,b){return(0.3+a.tr.np*0.9+Math.max(0,ctx.R(a,b).aff)/100)*(lossOf(b).lv/70)*(opt.w||1);},
run:function(ctx,a,b){return comfort(ctx,a,b,opt);}
});
HK.addTo(scen.events,mine);
MINE=MINE.concat(mine);
};
var SURVIVE=L('{a}は誰にも告げずに、一番危ない役目を引き受けた。{a}「どうなってもいい。今はそれでいい｜＝｜どうなってもいいです。今はそれでいいんです」――そのつぶやきを聞いた者は、背筋が冷たくなった。{a}は無事に戻ったが、その顔には何の色も浮かんでいなかった。');
HK.atScen('zombie',function(s){G.install(s,{
crash:5,span:20,
follow:function(ctx,a,l,m){
var Z=HK.ZB,r=ctx.rng(),A=ctx.zb&&a.z?ctx.zb.A[a.z.area]:null,dz=A?A.z/100:0.5;
if(r<0.08+dz*0.1){var t0=fill('{a}の足は、最後まで止まらなかった。呻き声の中へ消えていく背中を、誰も見ていなかった。',m);ctx.kill(a,null,l.name+'の後を追うように、群れの中へ歩いていった');return{text:t0,why:'群れに呑まれた'};}
if(Z&&Z.infect&& !a.z.bitten&&r<0.3+dz*0.15){Z.infect(ctx,a,'horde',true);return{text:fill('群れの手前で、{a}はようやく足を止めた。腕には、いつの間にか歯形が残っていた。{a}は、それを見ても眉ひとつ動かさなかった。',m),why:'群れに近づきすぎて咬まれた'};}
return null;
},
items:L('{b}が使っていた懐中電灯|{b}の上着|{b}の腕時計|{b}が最後まで持っていた鞄'),
spots:L('バリケードの陰|見張り台|隠れ家の屋上|崩れた非常階段'),
reckless:SURVIVE.concat(L('{a}は武器も持たずに、{b}を失った場所へ一人で向かおうとした。{a}「{b}を、置いてきたままにできない｜{b}を、置いてきたままにはできない｜{b}を、置いてきたままにはできません」――外にはまだ、呻き声がいくつも響いていた。{a}の足は、それでも止まらなかった。|{a}はわざと物音を立てて、ゾンビの群れのほうへ歩いていった。まるで、自分から見つかろうとしているようだった。寸前で引き返したのは、ほとんど偶然だった。|{a}は見張りの番を、何日も続けて誰にも譲らなかった。眠らずに暗がりを見つめる目は、どこか焦点が合っていなかった。{a}「来るなら来ればいい。私が全部、相手をする｜＝｜来るなら来ればいいです。私が全部、相手をします」'))
});});
HK.atScen('island',function(s){G.install(s,{
funeral:false,
items:L('{b}が編んだ籠|{b}の上着|{b}が拾った貝殻|{b}の靴'),
spots:L('浜辺|焚き火のそば|岩場|見晴らしのいい丘'),
reckless:SURVIVE.concat(L('{a}は荒れた海に、一人で漁に出ようとした。{a}「じっとしていると、{b}のことばかり考える｜＝｜じっとしていると、{b}のことばかり考えてしまいます」――波は、岩場を白く洗っていた。引き止められなければ、{a}は本当に沖へ出ていた。|{a}は誰も行かない崖の上まで、食べ物を探しに登っていった。足場の悪い斜面を、{a}はほとんど確かめもせずに進んだ。戻ってきた{a}の腕は、擦り傷だらけだった。|{a}は{b}が最後に向かった森の奥へ、何度も一人で入っていった。何かを探しているようでもあり、何かから逃げているようでもあった。{a}は夕暮れまで戻らなかった。'))
});});
HK.atScen('classroom',function(s){G.install(s,{
mate:'クラスメイト',span:6,
items:L('{b}に借りたままのノート|{b}の机に置かれた花|{b}と撮った写真|{b}のシャープペン'),
spots:L('教室の窓際|屋上|いつもの帰り道|{b}の空いた席の前')
});});
HK.atScen('whiteroom',function(s){G.install(s,{
span:24,
items:L('{b}の上着|{b}が壁に刻んだ印|{b}の靴'),
spots:L('部屋の隅|白い壁の前|ベッドの端|扉の前')
});});
HK.atScen('omega',function(s){G.install(s,{
span:12,
items:L('{b}の匂いが残る服|{b}の上着|{b}と撮った写真|{b}のマグカップ'),
spots:L('窓辺|部屋の隅|二人でよく座ったベンチ|ベランダ')
});});
HK.atScen('br',function(s){G.install(s,{
items:L('{b}の上着|{b}が持っていた地図|{b}の水筒'),
spots:L('岩陰|廃屋の陰|茂みの奥|崖の上'),
reckless:SURVIVE,reactMax:2
});});
HK.atScen('trial',function(s){G.install(s,{
items:L('{b}の上着|{b}の部屋の鍵|{b}が使っていたペン'),
spots:L('ホテルの廊下|{b}の部屋の前|食堂の隅|ロビーのソファ'),
reactMax:2
});});
})();
});
;
/* ==== js/tone-lines-hate.js ==== */
HK.Load.def(305,'js/tone-lines-hate.js',function(){
(function(){
'use strict';
var HK=window.HK,V=HK&&HK.Voice,TL=HK&&HK.TL;
if(!TL)return;
var T=TL.T;
function add(id,row){if(!T[id])T[id]=row;}
add('H_MEET_BAD',{
base:'……また{b}か。今日はついてない',
proud:'げっ、{b}かよ。……今日はついてねえ',
stern:'{b}か。……気分が悪い。視界に入るな',
tsun:'うわ、{b}じゃん。……なんでいるのよ',
gentle:'……あ、{b}。……ごめん、今はちょっと話したくないかな',
devoted:'{b}さん……すみません、今日は、あまり近寄らないでいただけますか',
cool:'{b}か。今日の運勢は、最悪だな',
free:'うわ、{b}だ。テンション下がるー',
shy:'あ……{b}……。う、うう……',
polite:'{b}さんですか。……今日は、ご縁がございませんね'
});
add('H_MEET_ENEMY',{
base:'{b}。よく平気な顔で、私の前に出てこられるな',
proud:'{b}。よくもまあ、私の前にツラ出せたな',
stern:'{b}。私の前に二度と現れるなと言ったはずだ',
tsun:'{b}……！　あんた、よく私の前に顔出せたわね',
gentle:'{b}。……どうして、また来たの。顔も見たくないのに',
devoted:'{b}さん。……私、あなたのことだけは、どうしても許せません',
cool:'{b}。お前の顔を見ると、思考が乱れる。消えろ',
free:'うっわ、{b}。マジで無理。視界から消えて',
shy:'{b}……っ、こ、こないで……あなたの顔、見たくない……',
polite:'{b}さん。よくも平然と、私の前にお顔を出せますね'
});
add('H_JAB',{
base:'邪魔だ。どけ',
proud:'邪魔なんだよ。どけ',
stern:'通路を塞ぐな。迷惑だ',
tsun:'ちょっと、邪魔！　どいてよ',
gentle:'……ごめん、そこ、どいてくれる？　邪魔なの',
devoted:'申し訳ありませんが、そこは邪魔です',
cool:'そこにいられると、動線の邪魔だ',
free:'はい邪魔ー。どいたどいた',
shy:'じゃ、じゃま……どいて……',
polite:'恐れ入りますが、お邪魔です。おどきください'
});
add('H_THAW',{
base:'……別に。お前が悪いわけじゃない',
proud:'……ちっ。別に、お前が悪いわけじゃねえよ',
stern:'……いや。君に非があるわけではない。私の問題だ',
tsun:'……べ、別に。あんたが悪いわけじゃないし',
gentle:'……ううん。きみが悪いんじゃないの。ごめんね',
devoted:'……いいえ。あなたが悪いのでは、ありません',
cool:'……訂正する。お前に原因はない',
free:'……あー、ごめん。八つ当たりだった',
shy:'……ち、ちがうの。あなたは、わるくない……',
polite:'……いえ。あなたに非はございません'
});
add('H_BACKFIRE',{
base:'そういうところが、嫌いなんだ',
proud:'そういうとこが、いちいちムカつくんだよ',
stern:'その態度こそが、私を苛立たせる',
tsun:'そういうとこ！　そういうとこが嫌いなの！',
gentle:'……そういうところが、苦手なんだ。ごめんね',
devoted:'そういうところが……どうしても、受け入れられないんです',
cool:'その善人ぶった態度が、一番癇に障る',
free:'うわ、そういうのマジでいらない',
shy:'そ、そういうの……もっと、つらくなる……',
polite:'そういうところが、どうにも好きになれません'
});
add('H_REFUSE',{
base:'……一人でやる。構うな',
proud:'一人でやる。構うんじゃねえ',
stern:'必要ない。私は一人で動く',
tsun:'い、いいって！　一人でできるから！',
gentle:'……ありがとう。でも、一人で大丈夫',
devoted:'お気持ちだけ、いただきます。一人で平気です',
cool:'断る。一人のほうが効率がいい',
free:'パス。一人のほうが気楽だし',
shy:'ひ、ひとりで、だいじょうぶ……だから……',
polite:'お気遣いなく。一人で結構です'
});
add('H_CONFUSED',{
base:'……なんで、私をかばうんだ',
proud:'……なんで、私なんかかばうんだよ',
stern:'……理解できない。なぜ私を庇う',
tsun:'……な、なんで、私なんかのこと……',
gentle:'……どうして、私なんかに優しくするの',
devoted:'……どうして、私などを庇ってくださるのですか',
cool:'……合理的じゃない。なぜ私を庇う',
free:'……え、なんで？　私のこと嫌いじゃないの？',
shy:'……な、なんで……わたし、ひどいこと、したのに……',
polite:'……なぜ、私などを庇ってくださるのです'
});
add('H_DISGUST',{
base:'……気持ち悪い。近寄るな',
proud:'気色悪い。寄るんじゃねえ',
stern:'不愉快だ。私に近づくな',
tsun:'き、気持ち悪い！　こっち来ないで！',
gentle:'……ごめん。そういうの、本当に無理なの',
devoted:'……申し訳ありません。あなたのお気持ちには、絶対に応えられません',
cool:'理解しかねる。その好意は、迷惑でしかない',
free:'うわ、ムリムリ。マジで勘弁して',
shy:'や、やだ……っ、こ、こないで……',
polite:'ご遠慮ください。そういったお気持ちは、迷惑です'
});
add('H_THREAT',{
base:'次に邪魔をしたら、ただじゃおかない',
proud:'次に邪魔しやがったら、ただじゃおかねえぞ',
stern:'次はない。覚えておけ',
tsun:'次に邪魔したら、絶対許さないから！',
gentle:'……次に邪魔したら、私、何するか分からないよ',
devoted:'次にお邪魔されたら……私も、手段を選びません',
cool:'次に邪魔をすれば、排除する。警告は一度だけだ',
free:'次やったら、マジで知らないからね？',
shy:'つ、次……じゃましたら……ゆ、ゆるさない……',
polite:'次にお邪魔なさったら、容赦はいたしません'
});
add('H_ROUGH',{
base:'勘違いするな。ここを出るためだ。それだけだ',
proud:'勘違いすんなよ。ここを出るためだ。それ以上でも以下でもねえ',
stern:'誤解するな。これは脱出のための手段にすぎない',
tsun:'か、勘違いしないでよね！　ここを出るためなんだから！',
gentle:'……ごめんね。優しくする気は、ないから',
devoted:'勘違いなさらないでください。ここを出るためです。それだけです',
cool:'感情は不要だ。条件を満たす。それだけだ',
free:'ムードとかいらないでしょ、うちらには',
shy:'か、勘違い、しないで……ここを、出るため、だから……',
polite:'誤解なさいませんよう。ここを出るためでございます'
});
add('H_FORCE_DRINK',{
base:'飲め。お前が飲めばいい',
proud:'お前が飲めよ。ほら、口開けろ',
stern:'君が飲め。拒否は認めない',
tsun:'あんたが飲みなさいよ！　ほら！',
gentle:'……ごめんね。でも、きみが飲んで',
devoted:'申し訳ありません。あなたに、飲んでいただきます',
cool:'お前が飲むのが合理的だ。口を開けろ',
free:'はい、あーん。拒否権ないから',
shy:'の、のんで……っ、おねがい、だから……！',
polite:'どうぞ、お召し上がりください。ご遠慮なく'
});
add('BAD_BLAME',{
base:'こうなったのは、{b}のせいだ',
proud:'全部お前のせいだ、{b}。お前さえいなきゃ……！',
stern:'{b}。君の軽率な判断が、事態を悪化させた',
tsun:'あんたのせいでしょ！　あんたがあんなこと言わなきゃ！',
gentle:'……ごめん、{b}。でも、これだけは言わせて。こうなったのは、きみのせいだよ',
devoted:'{b}さん……あなたのせいで、こうなったんです',
cool:'{b}。ここまでの失敗を数えると、半分以上はお前の判断だ',
free:'ねえ{b}、正直に言っていい？　全部あんたのせいだと思ってる',
shy:'{b}のせいだよ……っ、ぜんぶ、{b}の……！',
polite:'{b}さん。はっきり申し上げます。こうなったのは、あなたのせいです'
});
add('BAD_RETORT',{
base:'それはこっちの台詞だ',
proud:'はっ、こっちの台詞だ。お前さえいなけりゃな',
stern:'責任を押しつけるな。今は口論している場合ではない',
tsun:'はあ！？　それ、こっちの台詞なんだけど！',
gentle:'……そう思うなら、それでいいよ。でも今は、前を向こう',
devoted:'……私のせいなら、私が責任を取ります。それでいいでしょう',
cool:'感情論だな。今それを言って、何が変わる',
free:'はいはい、全部私のせい。それで気が済むなら、どうぞ',
shy:'そ、そんな……わ、私だって、怖かったのに……っ',
polite:'それは、こちらの台詞です'
});
add('R_FORCED',{
base:'やめ……っ、んぐ……！',
proud:'ふざけ……っ、んぐっ……！',
stern:'離せ……っ、ぐ……！',
tsun:'や、やだ……っ、んむ……っ！',
gentle:'ま、待って……っ、んっ……',
devoted:'お、おやめください……っ、ん……っ',
cool:'……っ、やめろ……ぐっ……',
free:'ちょ、待っ……んぐっ！',
shy:'や……っ、やだ……んく……っ',
polite:'お、おやめくださ……んっ……'
});
add('R_HATE_BACK',{
base:'そっちこそ、よく平気な顔でいられるな',
proud:'そっちこそ、よくのうのうとツラ見せられるな',
stern:'それはこちらの台詞だ。君の顔こそ見たくない',
tsun:'はあ？　それ、こっちの台詞なんだけど！',
gentle:'……私も、きみの顔は見たくなかったよ',
devoted:'……私も、あなたとは、お会いしたくありませんでした',
cool:'同感だ。お前と同じ空気を吸うのは不快だ',
free:'はいはい、こっちも同じ気持ちですー',
shy:'わ、わたしだって……あなたに、会いたくなかった……',
polite:'それは、こちらの台詞です'
});
add('R_MEET_NONE',{
base:'……え、何？　私、何かした？',
proud:'あ？　なんだよ、いきなり',
stern:'……何だ。用があるなら言え',
tsun:'な、何よ、急に。私、何かした？',
gentle:'え……私、何か気に障ることしちゃったかな',
devoted:'あ、あの……私、何か失礼なことをしてしまいましたか？',
cool:'……何の話だ。心当たりがない',
free:'え、なになに？　私なんかした？',
shy:'え、あ……ご、ごめん……？',
polite:'……失礼ですが、私が何かいたしましたでしょうか'
});
add('R_MEET_NORMAL',{
base:'あ、{b}。元気だった？',
proud:'お、{b}か。よう',
stern:'{b}か。変わりないか',
tsun:'あ、{b}。……べ、別に声かけただけだから',
gentle:'あ、{b}。元気にしてた？',
devoted:'{b}さん、こんにちは。お変わりありませんか',
cool:'{b}か。変わりはないか',
free:'あ、{b}じゃん。やっほー',
shy:'あ……{b}……こ、こんにちは……',
polite:'{b}さん、ごきげんよう'
});
add('R_MEET_FRIEND',{
base:'よう、{b}！　会えてよかった',
proud:'おう、{b}！　生きてたか',
stern:'{b}。無事で何よりだ',
tsun:'{b}！　……ふ、ふん。無事でよかったじゃない',
gentle:'{b}！　よかった、会えてうれしいよ',
devoted:'{b}さん！　お会いできて、本当によかったです',
cool:'{b}か。……悪くないタイミングだ',
free:'{b}ー！　会いたかったよー！',
shy:'{b}……っ、あ、会えて、よかった……',
polite:'{b}さん。お会いできて嬉しゅうございます'
});
add('R_MEET_LOVE',{
base:'{b}……会えて、うれしい',
proud:'{b}か。……会えて、悪くねえ気分だ',
stern:'{b}。……君の顔を見ると、落ち着く',
tsun:'{b}……っ、べ、別に、会いたかったわけじゃないんだからね',
gentle:'{b}……会えて、とってもうれしい',
devoted:'{b}さん……お顔を見られただけで、私、幸せです',
cool:'{b}。……心拍が上がった。原因はお前だ',
free:'{b}だー！　やった、会えた！',
shy:'{b}……っ、あ、あの……会えて、うれしい……',
polite:'{b}さん……お会いできて、嬉しいです'
});
add('R_PUZZLED',{
base:'……なんで、そんなに当たるんだ',
proud:'あ？　なんで私に当たんだよ',
stern:'……私が何をした。理由を言え',
tsun:'な、何よ！　なんで私ばっかり！',
gentle:'……私、何か、嫌われるようなことしちゃったのかな',
devoted:'……私の、何がいけなかったのでしょうか',
cool:'……私に対する敵意の理由が分からない',
free:'えー、なんで私だけ？　意味わかんない',
shy:'……ど、どうして……わたし、何もしてないのに……',
polite:'……私が、何かご無礼をいたしましたでしょうか'
});
add('R_PEACE',{
base:'何か気に障ったなら、言ってほしい',
proud:'なんか文句あんなら、はっきり言えよ。聞いてやるから',
stern:'不満があるなら聞こう。話し合いで解決したい',
tsun:'な、何か言いたいことあるなら、ちゃんと言いなさいよ',
gentle:'何か嫌なことしちゃったなら、教えてくれないかな',
devoted:'至らないところがあれば、直します。教えていただけませんか',
cool:'問題があるなら言え。原因を取り除く',
free:'ねえ、なんかあるなら言ってよ。仲良くしよ？',
shy:'あ、あの……わ、わたし、何かしたなら……あやまる、から……',
polite:'何かお気に障ったのでしたら、おっしゃってください'
});
add('R_TEASE',{
base:'無視しても、ついていくからな',
proud:'無視すんなって。どこまでもついてくぞ',
stern:'逃げるな。話は終わっていない',
tsun:'む、無視しないでよ！　……ついてくからね',
gentle:'ふふ、無視しても、ついていっちゃうよ',
devoted:'無視されても構いません。私は、おそばにいます',
cool:'無視は想定内だ。次の手を考える',
free:'無視とかウケる。どこまでもついてっちゃうよー',
shy:'む、むしされても……つ、ついてく……',
polite:'お返事がなくても、ついてまいりますね'
});
add('R_PUSHBACK',{
base:'言いたいことがあるなら、はっきり言え',
proud:'言いてえことがあんなら、面と向かって言えよ',
stern:'陰湿な真似はやめろ。言いたいことがあるなら、正面から言え',
tsun:'言いたいことあるなら、はっきり言いなさいよ！',
gentle:'……言いたいことがあるなら、ちゃんと言って。そういうのは、やめて',
devoted:'言いたいことがおありなら、どうか、正面からおっしゃってください',
cool:'回りくどい。用件をはっきり言え',
free:'なにそれ、感じ悪っ。言いたいことあるなら言えば？',
shy:'い、言いたいこと、あるなら……ちゃんと、言って……',
polite:'おっしゃりたいことがあるのでしたら、はっきりどうぞ'
});
add('R_INVITE',{
base:'{b}、一緒にやろう',
proud:'おい{b}、一緒にやるぞ',
stern:'{b}。手を貸せ。二人のほうが早い',
tsun:'{b}、ちょっと手伝いなさいよ。……ひ、一人じゃ大変なだけだから',
gentle:'{b}、一緒にやらない？',
devoted:'{b}さん、よろしければご一緒させてください',
cool:'{b}、組むぞ。二人のほうが効率がいい',
free:'{b}、一緒にやろーよ！',
shy:'{b}……い、いっしょに、やらない……？',
polite:'{b}さん、ご一緒にいかがですか'
});
add('R_DEFEND',{
base:'{b}は、悪いやつじゃない',
proud:'{b}を悪く言うな。あいつは、悪いやつじゃねえ',
stern:'{b}を侮辱するな。あれは、筋の通った人間だ',
tsun:'ちょっと！　{b}のこと悪く言わないでよ！',
gentle:'{b}は、悪い人じゃないよ。私が保証する',
devoted:'{b}さんは、そんな方ではありません',
cool:'{b}への評価は不正確だ。あいつは信用できる',
free:'えー、{b}いいやつだよ？　知らないだけでしょ',
shy:'{b}は……わ、わるいひとじゃ、ない……',
polite:'{b}さんは、そのような方ではございません'
});
add('R_LEAN',{
base:'{b}……少しだけ、こうしててもいい？',
proud:'{b}、ちょっとだけこうさせろ。……文句は言うなよ',
stern:'{b}。……少しの間、このままでいさせてくれ',
tsun:'べ、別に、くっつきたいわけじゃないから……ちょっとだけよ',
gentle:'{b}……少しだけ、こうしてていいかな',
devoted:'{b}さん……ほんの少しだけ、おそばにいさせてください',
cool:'{b}。……この距離が、一番落ち着く。理由は聞くな',
free:'{b}、ちょっとだけくっついてていい？　いいよね？',
shy:'{b}……ちょ、ちょっとだけ……このままで……',
polite:'{b}さん……少しだけ、このままでいてもよろしいですか'
});
add('R_APPROACH',{
base:'{b}、これ……よかったら',
proud:'{b}、これやる。……いらねえなら捨てろ',
stern:'{b}。これを受け取ってほしい',
tsun:'{b}、これ……あ、余っただけだから！',
gentle:'{b}、これ、よかったら使って',
devoted:'{b}さん、これ……受け取っていただけたら、嬉しいです',
cool:'{b}。これをやる。必要だと判断した',
free:'{b}、これあげる！　好きでしょ？',
shy:'{b}……こ、これ……もらって、くれる……？',
polite:'{b}さん、こちら、よろしければお納めください'
});
var ROWS=[
'〈〉……少しだけ、こうしててもいい？\t〈〉……少しだけ、こうしていてもいいかね\t〈〉……少しだけ、こうしておってもよいか\t〈〉……ちょっとだけ、こうしててええ？\t……〈〉。少し、このまま\t-\t〈〉さん……少しだけ、こうしててもいいですか。落ち着くんだ\t……〈〉。……ちょっとだけ、このまま。……動くの、だるいし',
'こうなったのは、〈〉のせいだ\tこうなったのは、〈〉、君のせいだよ\tこうなったのは、〈〉、おぬしのせいじゃ\tこうなったんは、〈〉のせいやろ\t……〈〉のせい\t-\tこうなったのは、〈〉さんのせいですよ。ほんとに\t……こうなったの、〈〉のせいだし',
'それはこっちの台詞だ\tそれは、こちらの台詞だよ\tそれはこちらの台詞じゃ\tそれ、こっちの台詞やわ\t……こっちの台詞\t-\tそれ、こっちの台詞ですよ。何言ってんの\t……それ、こっちの台詞',
'勘違いするな。ここを出るためだ。それだけだ\t勘違いしないでくれたまえ。ここを出るためだよ。それだけだ\t勘違いするでない。ここを出るためじゃ。それだけじゃ\t勘違いすなよ。ここ出るためや。それだけや\t……出るため。それだけ\t-\t勘違いしないでくださいね。ここを出るためです。それだけだから\t……勘違いしないで。……出るため。……それだけ',
'飲め。お前が飲めばいい\t飲みたまえ。君が飲めばいい\t飲め。おぬしが飲めばよい\t飲めや。あんたが飲んだらええねん\t……飲んで\t-\t飲んでください。あなたが飲めばいいじゃん\t……飲んで。……私、飲むのだるいし',
'やめ……っ、んぐ……！\tやめたまえ……っ、んぐ……！\tやめよ……っ、んぐ……！\tやめ……っ、んぐ……！\t……っ、ん……\t-\tやめてくださ……っ、んぐ……！\t……やめ……っ、ん……',
'……また〈〉か。今日はついてない\t……また〈〉か。今日はついていないね\t……また〈〉か。今日はついておらぬのう\t……また〈〉かいな。今日はついてへんわ\t……〈〉。……最悪\t-\t……また〈〉さんですか。今日ついてないなー\t……〈〉か。……今日、ついてない',
'〈〉。よく平気な顔で、私の前に出てこられるな\t〈〉。よく平気な顔で、私の前に出てこられたものだね\t〈〉。よくも平気な顔で、私の前に出てこられたものじゃ\t〈〉。よう平気な顔して、私の前に出てこれたもんやな\t……〈〉。消えて\t-\t〈〉さん。よく平気な顔で私の前に出てこれますね。ほんと無理\t……〈〉。……よく顔出せたね。……見たくないんだけど',
'邪魔だ。どけ\t邪魔だよ。どいてくれたまえ\t邪魔じゃ。どけい\t邪魔や。どいて\t……邪魔\t-\t邪魔なんですけど。どいて\t……じゃま。……どいて',
'……別に。お前が悪いわけじゃない\t……いや。君が悪いわけではないよ\t……いや。おぬしが悪いわけではない\t……別に。あんたが悪いわけちゃうねん\t……悪くない。そっちは\t-\t……別に。あなたが悪いわけじゃないです。うん\t……べつに。……あんたが悪いわけじゃないし',
'そういうところが、嫌いなんだ\tそういうところが、どうにも好かないのだよ\tそういうところが、好かぬのじゃ\tそういうとこが、嫌いやねん\t……そういうとこ、嫌い\t-\tそういうところが嫌いなんです。ほんとに\t……そういうとこ。……きらい',
'……一人でやる。構うな\t……一人でやるよ。構わないでくれたまえ\t……一人でやる。構うでない\t……一人でやるわ。構わんといて\t……一人で\t-\t……一人でやります。構わないで\t……ひとりでいい。……構わないで',
'……なんで、私をかばうんだ\t……なぜ、私をかばうのかね\t……なぜ、私をかばうのじゃ\t……なんで、私なんかかばうねん\t……なんで\t-\t……なんで、私をかばうんですか。わかんない\t……なんで、かばうの。……意味わかんない',
'……気持ち悪い。近寄るな\t……すまないが、近寄らないでくれたまえ。不愉快だ\t……気色悪い。近寄るでない\t……気持ち悪いわ。寄らんといて\t……無理。来ないで\t-\t……気持ち悪いです。近寄らないで。ほんと無理\t……むり。……近寄らないで',
'次に邪魔をしたら、ただじゃおかない\t次に邪魔をしたら、ただでは済まさないよ\t次に邪魔立てしたら、ただではおかぬぞ\t次に邪魔したら、ただじゃおかへんで\t……次は、ない\t-\t次邪魔したら、ただじゃおきませんから。覚えといて\t……次じゃましたら。……さすがに、怒るし',
'そっちこそ、よく平気な顔でいられるな\t君こそ、よく平気な顔でいられるものだね\tおぬしこそ、よう平気な顔でおられるのう\tそっちこそ、よう平気な顔してられるな\t……こっちも\t-\tそっちこそ、よく平気な顔してられますね。ほんと\t……そっちこそ。……顔、見たくなかったし',
'……え、何？　私、何かした？\t……おや、何かね。私が何かしたかな\t……む、何じゃ。私が何かしたか\t……え、なに？　私、なんかした？\t……？\t-\t……え、何ですか？　私、何かした？\t……え。……なに。……知らんし',
'あ、〈〉。元気だった？\tやあ、〈〉。変わりはないかね\tおお、〈〉か。息災か\tあ、〈〉。元気しとった？\t……ども\t-\tあ、〈〉さん。元気でした？\t……あ、〈〉。……ども',
'よう、〈〉！　会えてよかった\tやあ、〈〉！　会えて嬉しいよ\tおお、〈〉！　会えて嬉しいぞ\tよう、〈〉！　会えてよかったわ\t……〈〉。会えて、よかった\t-\tあ、〈〉さん！　会えてよかったです。ほんとに\t……あ、〈〉。……会えて、まあ、よかった',
'〈〉……会えて、うれしい\t〈〉……会えて嬉しいよ\t〈〉……会えて嬉しいのう\t〈〉……会えて、うれしいわ\t……〈〉。うれしい\t-\t〈〉さん……会えてうれしいです。ほんとに\t……〈〉。……会えて、ちょっとうれしい',
'……なんで、そんなに当たるんだ\t……なぜ、そんなに私に当たるのかね\t……なぜ、私にそう当たるのじゃ\t……なんで、そんな私に当たるん\t……なんで\t-\t……なんで、そんなに当たるんですか。わかんない\t……なんで当たるの。……めんどい',
'何か気に障ったなら、言ってほしい\t何か気に障ったのなら、言ってくれたまえ\t何か気に障ったなら、申してみよ\tなんか気に障ったんやったら、言うてや\t……何か、あるなら。言って\t-\t何か気に障ったなら、言ってください。ちゃんと聞くから\t……なんかあるなら、言って。……聞くだけなら',
'無視しても、ついていくからな\t無視しても、ついていくよ\t無視しても、ついてゆくぞ\t無視しても、ついてくで\t……ついてく\t-\t無視しても、ついていきますからね。ずっと\t……無視しても、ついてく。……ひまだし',
'言いたいことがあるなら、はっきり言え\t言いたいことがあるのなら、はっきり言いたまえ\t言いたいことがあるなら、はっきり申せ\t言いたいことあるんやったら、はっきり言いや\t……言いたいこと、あるなら、言え\t-\t言いたいことあるなら、はっきり言ってください。感じ悪いよ\t……言いたいことあるなら、言えば。……めんどいし',
'〈〉、一緒にやろう\t〈〉、一緒にやろうじゃないか\t〈〉、共にやろうぞ\t〈〉、一緒にやろや\t……〈〉。一緒に\t-\t〈〉さん、一緒にやりましょうよ\t……〈〉。……いっしょに、やる？',
'〈〉は、悪いやつじゃない\t〈〉は、悪い人間ではないよ\t〈〉は、悪い者ではないぞ\t〈〉は、悪いやつちゃうで\t……〈〉は、悪くない\t-\t〈〉さんは悪い人じゃないです。ほんとに\t……〈〉、悪いやつじゃないし。……たぶん',
'〈〉、これ……よかったら\t〈〉、これを……よかったら受け取ってくれたまえ\t〈〉、これを……受け取るがよい\t〈〉、これ……よかったら\t……〈〉。これ\t-\t〈〉さん、これ……よかったら。もらって\t……〈〉。……これ、あげる。……いらないなら、いいけど'
];
if(V){
var OVR=V.OVR=V.OVR||{},TONES=['gentleman','noja','kansai','mukuchi','polite','mixed','darui'];
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
var DERIVED=['aniki','tsun_n','devoted_p','calm'];
[
'H_MEET_BAD\t……{b}か。悪いが、今日はお前の相手をしてやる気分じゃねえ\tうわ、{b}か。……なんでいるんだよ\t{b}……ごめん、今日は、あんまり近寄らないでほしい\t……{b}か。今日は、あまり顔を合わせたくなかった',
'H_MEET_ENEMY\t{b}。面倒見のいい私でも、お前だけは別だ。消えな\t{b}……！　お前、よく私の前に顔出せたな\t{b}……私、あなたのことだけは、どうしても許せない\t{b}。……よく、平気な顔で私の前に立てるな',
'H_JAB\tおい、邪魔だ。どきな\tちょっと、邪魔！　どけって\tごめん、そこ、邪魔なんだ\tそこ、邪魔だ。どいてくれ',
'H_THAW\t……悪かった。お前のせいじゃねえのは、分かってんだ\t……べ、別に。お前が悪いわけじゃないし\t……ううん。あなたが悪いんじゃ、ないの\t……いや。お前が悪いわけじゃない。忘れてくれ',
'H_BACKFIRE\tそういうとこだよ。そういうとこが、どうにも気に食わねえ\tそういうとこ！　そういうとこが嫌いなんだって！\tそういうところが……どうしても、受け入れられないの\t……そういうところが、どうにも癇に障る',
'H_REFUSE\t気持ちだけもらっとく。一人でやれるさ\tい、いいって！　一人でできるから！\t気持ちだけ、もらっておくね。一人で平気だから\tいい。一人でやる',
'H_CONFUSED\t……なんで、私なんかをかばうんだよ\t……な、なんで、私なんかのこと……\t……どうして、私なんかを庇ってくれるの\t……分からないな。なぜ私を庇う',
'H_DISGUST\t悪いが、そういうのは受け取れねえ。寄るな\tき、気持ち悪い！　こっち来んな！\t……ごめん。あなたの気持ちには、絶対に応えられない\t……悪いが、その気持ちは迷惑なだけだ',
'H_THREAT\t次に邪魔したら、容赦しねえ。覚えときな\t次に邪魔したら、絶対許さないからな！\t次に邪魔したら……私も、手段を選ばないから\t次に邪魔をしたら、黙ってはいない。それだけ言っておく',
'H_ROUGH\t勘違いすんなよ。ここを出るためだ。手加減はしてやらねえ\tか、勘違いすんなよ！　ここを出るためなんだからな！\t勘違いしないで。ここを出るためだから。それだけだから\t勘違いするな。ここを出るためだ。優しくはしない',
'H_FORCE_DRINK\tお前が飲みな。ほら、口開けろ\tお前が飲めって！　ほら！\tごめんね。あなたに、飲んでもらうから\tお前が飲め。……口を開けろ',
'BAD_BLAME\t全部お前のせいだぞ、{b}。お前さえいなきゃ……！\tお前のせいだろ！　お前があんなこと言わなきゃ！\t{b}……あなたのせいで、こうなったんだよ\t{b}。……こうなったのは、お前のせいだ',
'BAD_RETORT\tはっ、そっくり返すぜ。お前さえいなけりゃな\tはあ！？　それ、こっちの台詞なんだけど！\t……私のせいなら、私が責任を取る。それでいいでしょ\t今それを言っても、何も変わらない。前を見ろ',
'R_FORCED\tてめ……っ、んぐっ……！\tや、やめ……っ、んむ……っ！\tや、やめて……っ、ん……っ\t……っ、やめろ……んっ……',
'R_HATE_BACK\tそっちこそ、よくのうのうとツラ見せられたな\tはあ？　それ、こっちの台詞なんだけど！\t……私も、あなたとは、会いたくなかった\t同感だ。私も、お前の顔は見たくなかった',
'R_MEET_NONE\tあ？　どうしたよ、いきなり\tな、なんだよ、急に。私、何かした？\tあ、あの……私、何か失礼なことしちゃった？\t……何の話だ。心当たりがない',
'R_MEET_NORMAL\tよう、{b}。元気にしてたか\tあ、{b}。……べ、別に声かけただけだから\t{b}、こんにちは。変わりない？\t{b}か。変わりはないか',
'R_MEET_FRIEND\tおう、{b}！　無事だったか、よかった\t{b}！　……ふ、ふん。無事でよかったな\t{b}！　会えて、本当によかった\t{b}か。……無事でよかった',
'R_MEET_LOVE\t{b}か。……へへ、会えてうれしいぜ\t{b}……っ、べ、別に、会いたかったわけじゃないからな\t{b}……顔を見られただけで、私、幸せ\t{b}。……会えてよかった。本当に',
'R_PUZZLED\tおいおい、なんで私に当たるんだよ\tな、なんだよ！　なんで私ばっかり！\t……私の、何がいけなかったのかな\t……私が何かしたか。覚えがない',
'R_PEACE\t文句があんなら、はっきり言いな。ちゃんと聞いてやるから\tな、何か言いたいことあるなら、ちゃんと言えよ\t悪いところがあったら、直すから。教えてくれないかな\t何かあるなら、言ってくれ。聞く',
'R_TEASE\t無視すんなって。どこまでもついてくぞ\tむ、無視すんなよ！　……ついてくからな\t無視されてもいいよ。私は、そばにいるから\t無視されても構わない。ついていく',
'R_PUSHBACK\t言いてえことがあんなら、面と向かって言いな\t言いたいことあるなら、はっきり言えよ！\t言いたいことがあるなら、ちゃんと正面から言って\t言いたいことがあるなら、はっきり言え',
'R_INVITE\tおい{b}、一緒にやるぞ。手ぇ貸せ\t{b}、ちょっと手伝えよ。……ひ、一人じゃ大変なだけだから\t{b}、よかったら一緒にやらせて\t{b}、一緒にやろう。そのほうがいい',
'R_DEFEND\t{b}を悪く言うな。あいつは、いいやつだ\tちょっと！　{b}のこと悪く言うなよ！\t{b}は、そんな人じゃないよ\t{b}はそんなやつじゃない。私が知ってる',
'R_LEAN\t{b}、ちょっとだけこうさせろ。……文句は言うなよ\tべ、別に、くっつきたいわけじゃないから……ちょっとだけだからな\t{b}……ほんの少しだけ、そばにいさせて\t{b}。……少し、このままでいさせてくれ',
'R_APPROACH\t{b}、これやるよ。遠慮すんな\t{b}、これ……あ、余っただけだから！\t{b}、これ……受け取ってくれたら、うれしいな\t{b}。これをやる。使ってくれ'
].forEach(function(line){
var c=line.split('\t'),row=T[c[0]];
if(!row)return;
DERIVED.forEach(function(t,i){
var v=c[i+1];
if(!v)return;
row['@'+t]=v;
if(V){var tb=V.OVR[t]=V.OVR[t]||{},k=v.replace(/\{b\}/g,'〈〉');if(tb[k]==null)tb[k]=k;}
});
});
})();
});
;
/* ==== js/incidents-social.js ==== */
HK.Load.def(306,'js/incidents-social.js',function(){
(function(){
'use strict';
var HK=window.HK;
HK.INCIDENTS=HK.INCIDENTS||{};
function R(ctx,a,b){return ctx.R(a,b);}
function names(list){return list.map(function(c){return c.name;}).join('・');}
function fav(ctx,a,pool,min){
var best=null,bv=min==null?25:min;
pool.forEach(function(o){if(o===a)return;var r=R(ctx,a,o),v=r.aff*0.5+r.att;if(v>bv){bv=v;best=o;}});
return best;
}
function pointAll(ctx,P,prefix,why){
if(P.length>8)P=ctx.rng.shuffle(P).slice(0,8);
var pick={};
P.forEach(function(a){pick[a.i]=fav(ctx,a,P,22);});
var done={};
P.forEach(function(a){
var b=pick[a.i];
if(!b){
ctx.act2({actors:[a],cat:'solo',fx:function(){P.forEach(function(o){if(o!==a&&R(ctx,o,a).att>35)ctx.stress(o,8);});},
text:ctx.t(a.tr.cold>0.55?'{a}は誰のことも指さず、肩をすくめた。':'{a}は迷った末に、誰でもなく天井を指さした。',a),why:a.name+'に、指さすほどの相手がまだいない'});
return;
}
if(done[a.i])return;
if(pick[b.i]===a){
done[a.i]=done[b.i]=1;
ctx.act2({actors:[a,b],cat:'romance',mag:20,fx:function(){ctx.mod2(a,b,{att:12,aff:6},{att:12,aff:6});},
text:ctx.t(prefix+'{a}と{b}の指が、互いを向いていた。どちらも一瞬、手を下ろしかけた。',a,b),why:why+'：両想い（惹かれ '+Math.round(R(ctx,a,b).att)+'／'+Math.round(R(ctx,b,a).att)+'）'});
}else{
var c=pick[b.i];
ctx.act2({actors:[a,b],cat:'romance',fx:function(){
ctx.mod(b,a,{att:b.tr.ac>0.55?8:4});ctx.stress(a,6);
if(c&&(!HK.Obsess||HK.Obsess.jealOk(ctx,a,b))){ctx.mod(a,c,{ten:8});ctx.pair(a,c).jealous++;if(HK.Obsess)HK.Obsess.feed(ctx,a,b,5);}
},text:ctx.t(prefix+'{a}は{b}を指さした。'+(c?'{b}の指は{c}を向いていた。':''),a,b,c),why:why+'：'+a.name+'の惹かれ（'+Math.round(R(ctx,a,b).att)+'）'});
}
});
}
HK.IncSocial={R:R,names:names,fav:fav,pointAll:pointAll};
})();
});
;
/* ==== js/incidents-extra.js ==== */
HK.Load.def(312,'js/incidents-extra.js',function(){
(function(){
'use strict';
var HK=window.HK;
HK.INCIDENTS=HK.INCIDENTS||{};
function R(ctx,a,b){return ctx.R(a,b);}
function L(s){return s.split('|');}
function loveOK(ctx,a,b){return ctx.env.romance!==0&&(!HK.canLove||HK.canLove(a,b))&& !ctx.pair(a,b).kin&& !HK.lockOut(a,b)&& !HK.lockOut(b,a);}
function zPair(ctx,P,min,love){
var best=null,bv=min==null?20:min;
P.forEach(function(a){
P.forEach(function(b){
if(a===b|| !a.z|| !b.z||a.z.area!==b.z.area||a.z.alone||b.z.alone)return;
if(love&& !loveOK(ctx,a,b))return;
var v=R(ctx,a,b).att+R(ctx,a,b).aff*0.5+ctx.rng()*10;
if(v>bv){bv=v;best=[a,b];}
});
});
return best;
}
function zLive(ctx){return ctx.present().filter(function(c){return!c.z|| !c.z.zombie;});}
function spaced(list,gap){
list.forEach(function(x){
var w0=x.when,r0=x.run;
x.when=function(ctx,s,n){var at=ctx.flags.incAt;return(at==null||s-at>=gap)&&(!w0||w0(ctx,s,n));};
x.run=function(ctx,s,n){ctx.flags.incAt=s;return r0(ctx,s,n);};
});
}
HK.IncExtra={R:R,L:L,loveOK:loveOK,zPair:zPair,zLive:zLive,spaced:spaced};
})();
});
;
/* ==== js/rel-bad-engine.js ==== */
HK.Load.def(321,'js/rel-bad-engine.js',function(){
(function(){
'use strict';
var HK=window.HK,RK=HK.RelKit;
if(!RK|| !HK.Ties)return;
var L=RK.L,fill=RK.fill;
function is(k){return function(ctx,a,b){return!!(b&&HK.Ties.has(ctx,a,b,k));};}
function third(ctx,a,b){var o=ctx.others(a).filter(function(c){return c!==b;});return o.length?ctx.pick(o):null;}
function hurt(ctx,b){return b.stress>40||(b.hp!=null&&b.hp<60);}
var TPL={
sbSpat:{k:'sibbad',cat:'conflict',gap:4,w:function(ctx,a){return 0.6+a.tr.aggr*0.6+a.tr.cp*0.3;},
run:function(ctx,a,b){ctx.mod2(a,b,{ten:7,aff: -3},{ten:7,aff: -3});ctx.stress(a,3);ctx.stress(b,3);return{why:a.name+'と'+b.name+'は、反りの合わない{sibs}（攻撃性・CP）'};}},
sbCompare:{k:'sibbad',cat:'conflict',gap:7,w:function(ctx,a){return 0.35+(a.tr.jealous||0)*0.8+a.tr.ac*0.3;},
run:function(ctx,a,b){ctx.mod(a,b,{ten:6});ctx.stress(a,6);return{why:a.name+'は、昔から'+b.name+'と比べられてきた（嫉妬深さ・AC）'};}},
sbGrudge:{k:'sibbad',cat:'help',gap:6,when:function(ctx,a,b){return hurt(ctx,b);},w:function(ctx,a){return 0.5+a.tr.np*0.6+a.tr.cp*0.2;},
run:function(ctx,a,b){ctx.mod(b,a,{trust:8,aff:6});ctx.mod(a,b,{ten: -3});ctx.stress(b,-6);return{why:'仲は悪くても、{sib:a→b}の'+b.name+'を放っておけなかった（NP）',mag:14};}},
sbDefend:{k:'sibbad',cat:'help',gap:8,need3:true,w:function(ctx,a){return 0.35+a.tr.cp*0.5+a.tr.aggr*0.2;},
run:function(ctx,a,b,c){ctx.mod(b,a,{aff:8,trust:6});ctx.mod(a,c,{ten:5});return{why:'他人に{sib:a→b}を悪く言われると、'+a.name+'は黙っていられない（CP）',with:[c],mag:14};}},
sbMemory:{k:'sibbad',cat:'bond',gap:8,w:function(ctx,a){return 0.25+a.tr.np*0.3+a.tr.fc*0.2;},
run:function(ctx,a,b){ctx.mod2(a,b,{aff:4,ten: -4},{aff:4,ten: -4});return{why:'子どもの頃の思い出が、少しだけ二人の角を取った'};}},
sbMakeup:{k:'sibbad',cat:'bond',gap:30,when:function(ctx,a,b){return ctx.R(a,b).aff>=12&& !ctx.pair(a,b)._sbMake;},w:function(){return 1.3;},
run:function(ctx,a,b){ctx.pair(a,b)._sbMake=true;ctx.mod2(a,b,{aff:10,ten: -15,trust:8},{aff:10,ten: -15,trust:8});return{why:'いがみ合ってきた{sibs}が、ようやく歩み寄った（好意が育った）',mag:22};}},
bdClash:{k:'bad',cat:'conflict',gap:4,w:function(ctx,a){return 0.6+a.tr.cp*0.5+a.tr.aggr*0.4;},
run:function(ctx,a,b){ctx.mod2(a,b,{ten:8,aff: -4},{ten:8,aff: -4});return{why:a.name+'と'+b.name+'は、もともと反りが合わない（CP・攻撃性）'};}},
bdSnark:{k:'bad',cat:'conflict',gap:5,w:function(ctx,a){return 0.4+a.tr.cold*0.5+a.tr.fc*0.2;},
run:function(ctx,a,b){ctx.mod(b,a,{ten:6,aff: -3});ctx.stress(b,5);return{why:a.name+'の皮肉（ドライさ）'};}},
bdForced:{k:'bad',cat:'bond',gap:6,w:function(ctx,a){return 0.5+a.tr.a*0.4+a.tr.ac*0.2;},
run:function(ctx,a,b){ctx.mod2(a,b,{trust:6,ten: -3},{trust:6,ten: -3});return{why:'気に食わない相手でも、組むしかなかった（A）'};}},
bdCredit:{k:'bad',cat:'conflict',gap:7,w:function(ctx,a){return 0.35+a.tr.cp*0.4+(1-a.tr.honesty)*0.3;},
run:function(ctx,a,b){ctx.mod2(a,b,{ten:6},{ten:7,trust: -3});ctx.stress(a,4);return{why:'手柄と責任の押し付け合い（CP・正直さの低さ）'};}},
bdThaw:{k:'bad',cat:'bond',gap:10,when:function(ctx,a,b){return ctx.R(a,b).ten<70;},w:function(ctx,a){return 0.3+a.tr.np*0.4+a.tr.a*0.2;},
run:function(ctx,a,b){ctx.mod2(a,b,{aff:8,ten: -6},{aff:6,ten: -4});return{why:a.name+'は、'+b.name+'の意外な一面を見た（NP・A）',mag:12};}},
bdBlowup:{k:'bad',cat:'conflict',gap:12,when:function(ctx,a,b){return ctx.R(a,b).ten>=55;},w:function(ctx,a){return 1+a.tr.aggr*0.5;},
run:function(ctx,a,b,c){ctx.mod2(a,b,{ten:10,aff: -8},{ten:10,aff: -8});ctx.stress(a,8);ctx.stress(b,8);return{why:'溜まっていたものが爆発した（緊張 '+Math.round(ctx.R(a,b).ten)+'）',with:c?[c]:[],mag:20};}}
};
var TX={};
TX.goukon={
sbSpat:'{a}は乾杯のグラスを置くなり、向かいの{b}を睨んだ。「なんであなたがここにいるんだよ｜なぜあなたがここにいるんだ｜どうしてあなたがここにいるんですか」――{sibs}で同じ合コンに来てしまったことに、二人とも今さら気づいた|{a}は{b}の自己紹介に、横から口を挟んだ。「こいつ、家じゃ一日中ジャージだから｜こいつは、家では一日中ジャージだ｜この人、家では一日中ジャージなんですよ」{b}はテーブルの下で、{a}の足を思い切り踏んだ',
sbCompare:'{b}がまた場を沸かせた。{a}はグラスを握りしめた。「……昔からそうだ。親戚の集まりでも、いつも{b}ばっかり｜……昔からそうだ。親戚の集まりでも、いつも{b}ばかりだ｜……昔からそうです。親戚の集まりでも、いつも{b}ばかりでした」|「{b}さんの方がしっかりしてるね」と言われ、{a}の笑顔が一瞬だけ引きつった',
sbGrudge:'飲みすぎて青い顔をした{b}に、{a}は黙って水のグラスを差し出した。「……勘違いすんなよ。家まで運ぶのが面倒なだけだ｜……勘違いするな。家まで運ぶのが面倒なだけだ｜……勘違いしないでください。家まで運ぶのが面倒なだけです」|しつこく絡まれている{b}を見て、{a}は席を立った。「こいつ、門限あるんで｜こいつには門限がある｜この人、門限があるんです」――そう言って、{b}を店の外へ連れ出した',
sbDefend:'{c}が{b}のことを「ちょっと痛い人だよね｜少し痛い人だ｜ちょっと痛い人ですよね」と笑った。{a}の声が低くなった。「……あいつの悪口を言っていいのは、家族だけだから｜……あいつの悪口を言っていいのは、家族だけだ｜……あの人の悪口を言っていいのは、家族だけです」|{c}が{b}の服装をからかうと、{a}は笑いもせずに言った。「あれ、選んだのうちの母親だから。文句ある？｜あれを選んだのは、うちの母親だ。文句があるか？｜あれ、選んだのはうちの母なんです。文句がありますか？」',
sbMemory:'二次会のカラオケで、{b}が子どもの頃に二人でよく歌ったアニメの曲を入れた。{a}は呆れた顔をしながら、気づけばハモっていた|帰り道、{a}がぽつりと言った。「……昔、迷子になったあなたを探して、町内一周したことあったな｜……昔、迷子になったあなたを探して、町内を一周したことがあった｜……昔、迷子になったあなたを探して、町内を一周したことがありましたね」{b}は、聞こえないふりをした',
sbMakeup:'店の外で、{a}と{b}は並んで夜風に当たった。「……今度、実家に帰るとき、一緒に行くか｜＝｜……今度、実家に帰るとき、一緒に行きませんか」{b}は少し間を置いて、うなずいた|会計のとき、{a}は黙って{b}の分まで払った。{b}は「……ありがと｜……ありがとう｜……ありがとうございます」とだけ言った。それだけで、十分だった',
bdClash:'{a}と{b}は、どっちの頼んだ料理を先に取り分けるかで揉め始めた。合コンの空気が、目に見えて冷えていった|{a}が好きな映画の話をすると、{b}が即座に「それ、つまらなかった｜それは、つまらなかった｜それ、つまらなかったです」と切り捨てた。二人のあいだで、火花が散った',
bdSnark:'{a}は{b}の自己紹介のあとで、にっこり笑った。「すごいね、自分のことそんなに好きになれるの｜自分のことをそんなに好きになれるとは、大したものだ｜自分のことをそんなに好きになれるなんて、すごいですね」|{b}が狙っていた相手と話し始めると、{a}は聞こえよがしに言った。「あ、それ、さっき別の人にも言ってたやつだ｜ああ、それはさっき別の人にも言っていたやつだ｜あ、それ、さっき別の人にも言っていたものですね」',
bdForced:'幹事が急に帰ってしまい、残った{a}と{b}が二次会の店を探すことになった。「……この店でいい？｜……この店でいいか？｜……このお店でいいですか？」「……いいんじゃない｜……いいだろう｜……いいと思います」――会話は最低限だったが、店はちゃんと決まった|ゲームでペアにされた{a}と{b}は、無言のまま完璧な連携を見せて優勝した。二人とも、それが一番気に入らなかった',
bdCredit:'ゲームに負けた原因をめぐって、{a}と{b}は互いを指さした。「あなたが答え間違えたからだろ｜あなたが答えを間違えたからだろう｜あなたが答えを間違えたからでしょう」「そっちが先に答えたんでしょ｜そっちが先に答えたんだろう｜そちらが先に答えたんでしょう」|場を盛り上げたのは自分だと、{a}も{b}も譲らなかった。周りは、二人がいちばん盛り上がっていると思っていた',
bdThaw:'{b}が、隅で居心地悪そうにしていた参加者にさりげなく話を振っているのを見て、{a}は少しだけ目を見張った。「……ああいうとこ、あるんだ｜……ああいうところも、あるのか｜……ああいうところ、あるんですね」|帰り際、{b}が{a}の忘れた傘を持って追いかけてきた。「……はい。濡れるでしょ｜……ほら。濡れるだろう｜……どうぞ。濡れるでしょう」{a}は、なんと言えばいいか分からなかった',
bdBlowup:'{a}の一言に、{b}がグラスを置いた。「前から思ってたけど、そういうとこ本当に無理｜前から思っていたが、そういうところは本当に無理だ｜前から思っていましたけど、そういうところ、本当に無理です」――二人の言い合いは止まらず、{c}が慌てて間に入った|とうとう{a}と{b}は立ち上がり、店じゅうに聞こえる声で言い合った。{c}が「ここ、合コンだから！｜ここは合コンの場だ！｜ここは合コンの場ですよ！」と二人の袖を引いた'
};
TX.whiteroom={
sbSpat:'「よりによって、あなたと閉じ込められるなんて｜よりによって、あなたと閉じ込められるとは｜よりによってあなたと閉じ込められるとは、思いませんでした」{a}が吐き捨てると、{b}も負けずに言い返した。「こっちの台詞なんだけど｜こっちの台詞だ｜それはこちらの台詞です」|{a}と{b}は、部屋の真ん中に引いた見えない線を、お互い一歩も越えなかった。越えた、越えてないで、また喧嘩になった',
sbCompare:'{b}があっさり条件の謎を解いたとき、{a}は壁を見つめたまま呟いた。「……いつもそうだ。何でも、あなたの方が先にできる｜＝｜……いつもそうです。何でも、あなたの方が先にできるんです」|{a}は、子どもの頃から{b}と同じ部屋を使わされるのが嫌だった。今、その理由を思い出していた',
sbGrudge:'眠れずに震えている{b}の肩に、{a}は無言で自分の上着をかけた。「……寒いのはあなたの方だろ。昔から冷え性なんだから｜……寒いのはあなたの方だろう。昔から冷え性なのだから｜……寒いのはあなたの方です。昔から冷え性でしょう」|{b}が出口を探して壁を叩き、手を擦りむいた。{a}は舌打ちしながら、その手にハンカチを巻いた',
sbDefend:'{c}が「{b}のせいで出られない｜＝｜{b}のせいで出られません」と言い出すと、{a}が立ちはだかった。「あいつを責めるなら、まず私に言え｜＝｜あの人を責めるなら、まず私に言ってください」|{c}の嫌味に、{b}が言い返せずに黙ったとき、{a}が代わりに口を開いた。「{sib:a→b}の悪口は、{sib:b→a}の特権だ｜＝｜{sib:a→b}の悪口は、{sib:b→a}の特権です」',
sbMemory:'{a}は白い壁を見ながら言った。「……子どもの頃、押し入れに二人で隠れて、出られなくなったことあったよな｜……子どもの頃、押し入れに二人で隠れて、出られなくなったことがあっただろう｜……子どもの頃、押し入れに二人で隠れて、出られなくなったことがありましたよね」{b}は、ふっと笑った|退屈しのぎに、{a}と{b}は昔家族でやったしりとりを始めた。気づけば、一時間も続いていた',
sbMakeup:'何日目かの夜、{a}がぽつりと言った。「……ここを出たら、ちゃんと話そう。今までのこと｜……ここを出たら、きちんと話そう。今までのことを｜……ここを出たら、今までのことをちゃんと話しましょう」{b}は、黙って{a}の隣に座り直した|{b}が泣き出したとき、{a}は何年ぶりかに{b}の頭を撫でた。二人とも、何も言わなかった',
bdClash:'条件の解き方をめぐって、{a}と{b}の意見は真っ二つに割れた。「絶対こっち｜絶対にこっちだ｜絶対にこちらです」「いや、あり得ない｜＝｜いえ、あり得ません」|{a}が提案するたびに、{b}が反対した。理由は、提案したのが{a}だから、だけだった',
bdSnark:'{a}は、{b}が壁に書いた計算を眺めて言った。「その計算、三回目だけど、答え毎回違うよね｜その計算は三回目だが、答えが毎回違うだろう｜その計算、三回目ですけど、答えが毎回違いますよね」|{b}が条件の紙を読み上げると、{a}は大げさに拍手した。「すごい、字が読めるんだ｜大したものだ、字が読めるのか｜すごい、字が読めるんですね」',
bdForced:'二人で同時に押さないと開かない仕掛けを前に、{a}と{b}は顔を見合わせた。「……せーの、で｜……せーの、でいくぞ｜……せーの、でいきましょう」――扉は、一回で開いた|{a}と{b}は、背中合わせに壁の文字を読み合った。顔を見なければ、意外と息は合った',
bdCredit:'扉が一枚開いたとき、{a}も{b}も「自分のおかげ」だと言い張った。|間違ったボタンを押して閉じ込められる時間が延びたのを、{a}と{b}は互いのせいにした',
bdThaw:'{a}は、{b}が自分の分の水をこっそり残しておいてくれたことに気づいた。「……なんで｜……なぜだ｜……どうしてですか」「別に。喉、乾いてそうだったから｜別に。喉が渇いていそうだったからだ｜別に。喉が渇いていそうに見えたんです」|{b}が、怖がる{c}を落ち着かせている姿を見て、{a}は{b}のことを少しだけ見直した',
bdBlowup:'狭い部屋の空気が、とうとう破裂した。{a}と{b}は胸ぐらを掴み合い、{c}が必死で二人を引き剥がした|{a}は{b}に向かって、ずっと言わずにいたことを全部ぶちまけた。{b}も、同じだけぶちまけ返した。{c}は、耳を塞いでいた'
};
TX.classroom={
sbSpat:'朝のホームルーム前、{a}と{b}はまた教室の入口で口喧嘩をしていた。同じクラスの{sibs}の喧嘩は、もう誰も止めなかった|{a}は{b}の弁当を見て「それ、私の分だろ｜それは、私の分だろう｜それ、私の分でしょう」と言った。{b}は「母さんが間違えたの｜母さんが間違えたんだ｜母が間違えたんです」と言い返し、昼休みじゅう揉めた',
sbCompare:'定期テストの結果が返ってきた。{b}の点数を見た担任が、{a}にだけ聞こえる声で言った。「{sibs}なのに、ずいぶん違うな」――{a}は答案を握りつぶした|三者面談で、{a}はまた{b}と比べられた。帰り道、{a}は一言も口をきかなかった',
sbGrudge:'{b}が体育で足をくじいた。{a}は文句を言いながら、{b}の鞄を二つ肩にかけて保健室まで付き添った|{b}がクラスで孤立しかけているのに気づいて、{a}はさりげなく自分のグループの輪に{b}を入れた。「……席、空いてたから｜……席が空いていたからだ｜……席が空いていたんです」',
sbDefend:'{c}が{b}の陰口を叩いているのを、{a}は廊下で聞いてしまった。{a}は{c}の前に立った。「それ、本人の前で言える？｜それを、本人の前で言えるか？｜それ、本人の前で言えますか？」|{c}が{b}をからかって笑いを取ろうとしたとき、{a}は机を叩いた。「やめろ。あいつをいじっていいのは私だけだ｜＝｜やめてください。あの人をいじっていいのは私だけです」',
sbMemory:'文化祭の準備中、{a}は段ボールの中から、小学生の頃に二人で作った工作とそっくりなものを見つけた。{b}も覗き込み、二人は同時に吹き出した|雨の放課後、{a}と{b}は同じ傘の下に入るしかなかった。昔は、いつもこうだった',
sbMakeup:'卒業式の日、{a}は{b}に、くしゃくしゃの手紙を渡した。中身は短かった。「今まで、ごめん｜今まで、すまなかった｜今まで、すみませんでした」|進路が分かれると決まった日、{a}と{b}は久しぶりに二人で帰った。「……向こう行っても、たまには連絡しろよ｜……向こうへ行っても、たまには連絡しろ｜……向こうに行っても、たまには連絡してください」',
bdClash:'学級会で、{a}と{b}の意見がまたぶつかった。文化祭の出し物は、とうとう多数決にもつれ込んだ|{a}と{b}は同じ班にされたが、作業の進め方で最初から揉めた',
bdSnark:'{a}は、{b}が黒板に書いた答えを見て、わざとらしく首をかしげた。「へえ、そういう解き方もあるんだ。間違ってるけど｜ほう、そういう解き方もあるのか。間違っているが｜へえ、そういう解き方もあるんですね。間違っていますけど」|{b}が発表を終えると、{a}が小声で言った。「台本、棒読みだったね｜台本が棒読みだった｜台本、棒読みでしたね」',
bdForced:'席替えで、{a}と{b}は隣同士になった。二人とも最初の一週間は口をきかなかったが、ノートの貸し借りだけは欠かさなかった|日直で組まされた{a}と{b}は、無言で黒板を消し、無言で日誌を書いた。日誌の字だけは、妙に揃っていた',
bdCredit:'班の発表が褒められると、{a}と{b}は、どちらがまとめたのかで揉めた|提出物を忘れた理由を、{a}は{b}のせいにした。{b}は、担任の前で{a}をにらみつけた',
bdThaw:'放課後、{a}は、{b}がひとりで花壇の水やりをしているのを見かけた。誰にも頼まれていないのに、毎日やっていたらしい|{b}が、試験前に{a}の苦手な科目のノートを机に置いていった。「……捨てるとこだったから｜……捨てるところだったからだ｜……捨てるところでしたから」',
bdBlowup:'{a}と{b}の口論は、とうとう授業中に爆発した。教科書が床に落ち、{c}が慌てて二人のあいだに割って入った|休み時間、{a}と{b}が掴み合いになった。{c}が先生を呼びに走った'
};
TX.island={
sbSpat:'{a}と{b}は、どっちが薪を集める番かで、朝から言い合っていた。「あなた、昨日もさぼっただろ｜あなたは昨日もさぼっただろう｜あなた、昨日もさぼったでしょう」「そっちこそ｜＝｜そちらこそでしょう」|焚き火の前で、{a}は{b}の焼いた魚に文句をつけた。{b}は無言で、{a}の分の魚を海に投げた',
sbCompare:'{b}が初めての漁で大物を釣り上げた。皆が拍手する中、{a}だけが黙っていた。「……昔から、何でも先に上手くなるんだよな、あいつは｜……昔から、何でも先に上手くなるのだ、あいつは｜……昔から、何でも先に上手くなるんですよね、あの人は」|{a}は、子どもの頃に{b}と比べられた夏休みの自由研究のことを、ふと思い出した',
sbGrudge:'熱を出して寝込んだ{b}のそばで、{a}は一晩中、濡らした布を取り替え続けた。朝、{b}が目を開けると、{a}はわざとそっぽを向いた|{b}が岩場で足を滑らせたとき、真っ先に飛び込んだのは{a}だった。「……泳げないくせに、無茶すんな｜……泳げないくせに、無茶をするな｜……泳げないのに、無茶をしないでください」',
sbDefend:'{c}が「{b}は役に立たない｜＝｜{b}は役に立ちません」とこぼすと、{a}が立ち上がった。「あいつの悪口は、私の前で言うな｜＝｜あの人の悪口は、私の前で言わないでください」|{c}が{b}の分の食料を減らそうと言い出すと、{a}は黙って自分の分を{b}の皿に移した',
sbMemory:'満天の星の下で、{a}が言った。「……子どもの頃、家族でキャンプに行ったよな。あなた、テントで泣いてた｜……子どもの頃、家族でキャンプに行っただろう。あなたはテントで泣いていた｜……子どもの頃、家族でキャンプに行きましたよね。あなた、テントで泣いていました」{b}は「泣いてない｜泣いていない｜泣いていません」と言いながら、少し笑った|{a}と{b}は、浜で昔よくやった水切りの数を競った。気づけば、二人とも子どもの顔になっていた',
sbMakeup:'嵐の夜、同じ岩陰で雨宿りをしながら、{a}がぽつりと言った。「……悪かったな。ずっと｜……悪かった。ずっと｜……ずっと、すみませんでした」{b}は、{a}の肩に頭を預けた|{a}は、{b}のために作った釣り竿を、何も言わずに渡した。{b}は、それを大事そうに抱えた',
bdClash:'{a}と{b}は、拠点を浜に作るか森に作るかで真っ向から対立した|水場の使い方をめぐって、{a}と{b}はまた揉めた。「先に汲んでたのはこっち｜先に汲んでいたのはこっちだ｜先に汲んでいたのはこちらです」「順番なんて決めてない｜順番など決めていない｜順番なんて決めていません」',
bdSnark:'{a}は{b}の建てた屋根を見上げて言った。「芸術的だね。雨はどこから入るの？｜芸術的だ。雨はどこから入るんだ？｜芸術的ですね。雨はどこから入るんですか？」|{b}が釣りから手ぶらで戻ると、{a}が拍手した。「おかえり。魚、元気だった？｜おかえり。魚は元気だったか？｜おかえりなさい。魚、元気でしたか？」',
bdForced:'{a}と{b}は、二人がかりでないと運べない流木を前に、黙って両端を持ち上げた|嵐が来る前に、{a}と{b}はしぶしぶ並んで屋根を補強した。終わってみれば、拠点で一番頑丈な屋根になっていた',
bdCredit:'狼煙の火が消えたのを、{a}は{b}のせいにし、{b}は{a}のせいにした|大物の魚が獲れたとき、{a}も{b}も、仕掛けを作ったのは自分だと言い張った',
bdThaw:'{a}は、{b}が夜中にこっそり、皆の寝床の周りに虫除けの草を置いて回っているのを見た|{b}が、{a}の破れた靴を、蔓で器用に縫い直して置いていった',
bdBlowup:'空腹と疲れで、{a}と{b}の我慢はとうとう限界を超えた。二人は浜で取っ組み合いになり、{c}が海水を浴びせて止めた|{a}と{b}の怒鳴り合いは、島じゅうに響いた。{c}が二人のあいだに座り込み、「いい加減にして｜いい加減にしろ｜いい加減にしてください」と言った'
};
TX.zombie={
sbSpat:'避難所の隅で、{a}と{b}はまた言い合いになった。「あなたが勝手に出歩くから、見つかりかけたんだろ｜あなたが勝手に出歩くから、見つかりかけたんだろう｜あなたが勝手に出歩くから、見つかりかけたんでしょう」「助けてなんて頼んでない｜助けてなどと頼んではいない｜助けてなんて頼んでいません」|{a}は{b}の拾ってきた缶詰を見て、「賞味期限切れてる｜賞味期限が切れている｜賞味期限が切れています」と言った。{b}は「死ぬよりマシ｜死ぬよりはマシだ｜死ぬよりはマシです」と言い返した',
sbCompare:'{b}が素早くゾンビをかわして皆に褒められたとき、{a}は唇を噛んだ。「……運動会でも、いつもあいつが一等だった｜＝｜……運動会でも、いつもあの人が一等でした」|{a}は、両親が最後に心配していたのが{b}のことだったのを、まだ根に持っていた',
sbGrudge:'噛まれかけた{b}の前に、{a}が飛び出してゾンビを突き飛ばした。「……親に、あなたを頼むって言われてるんだよ。それだけだ｜……親に、あなたを頼むと言われているんだ。それだけだ｜……親に、あなたを頼むと言われているんです。それだけです」|{b}が熱を出したとき、{a}はひとりで薬局まで薬を取りに行った。帰ってきた{a}の腕には、新しい擦り傷があった',
sbDefend:'{c}が「{b}は足手まといだ。置いていこう｜＝｜{b}は足手まといです。置いていきましょう」と言うと、{a}が銃口を床に向けたまま言った。「置いていくなら、私も残る｜＝｜置いていくなら、私も残ります」|{c}が{b}の判断ミスを責め立てたとき、{a}が割って入った。「あいつが間違えたなら、止めなかった私も同罪だ｜＝｜あの人が間違えたなら、止めなかった私も同罪です」',
sbMemory:'停電の夜、{a}と{b}は懐中電灯を一つだけ灯して並んで座った。「……昔、停電のとき、あなたが怖がって私の布団に潜り込んできたよな｜……昔、停電のとき、あなたが怖がって私の布団に潜り込んできただろう｜……昔、停電のとき、あなたが怖がって私の布団に潜り込んできましたよね」|{a}は、廃墟になった公園の滑り台を見て足を止めた。{b}も止まった。二人で、よく遊んだ公園だった',
sbMakeup:'バリケードの見張りを交代するとき、{a}が{b}に言った。「……生きて帰ったら、母さんの墓参り、一緒に行こう｜……生きて帰ったら、母さんの墓参りに一緒に行こう｜……生きて帰ったら、母さんのお墓参り、一緒に行きましょう」{b}は、うなずいた|{a}は、最後の一本のチョコバーを半分に折って{b}に渡した。子どもの頃、いつもそうしていたように',
bdClash:'{a}と{b}は、籠城するか移動するかで激しく対立した|物資の分け方をめぐって、{a}と{b}はまたぶつかった。「働いた分だけもらうべき｜働いた分だけもらうべきだ｜働いた分だけもらうべきです」「全員平等に決まってる｜全員平等に決まっている｜全員平等に決まっています」',
bdSnark:'{a}は、{b}が作ったバリケードを指でつついた。「頑丈だね。ゾンビが優しかったら持つと思う｜頑丈だ。ゾンビが優しければ持つだろう｜頑丈ですね。ゾンビが優しかったら持つと思います」|{b}がゾンビに驚いて悲鳴を上げると、{a}は鼻で笑った。「いい声。遠くまで届いたよ、たぶん｜いい声だ。たぶん、遠くまで届いただろう｜いい声ですね。たぶん、遠くまで届きましたよ」',
bdForced:'扉を押さえるには、二人の力が要った。{a}と{b}は顔も見ずに肩を並べ、朝まで扉を押さえ続けた|{a}が見張り、{b}が物資を運ぶ。口はきかなかったが、合図だけは正確だった',
bdCredit:'ゾンビの群れに見つかった原因を、{a}は{b}の物音のせいにした。{b}は{a}の懐中電灯のせいにした|脱出路を見つけたのはどっちか、{a}と{b}は避難所に戻るまで言い合っていた',
bdThaw:'{a}は、{b}が自分の水を、避難所の子どもにこっそり分けているのを見てしまった|{b}が、{a}の落とした家族写真を拾って、何も言わずに返した',
bdBlowup:'極限の緊張の中、{a}と{b}はとうとう掴み合いになった。物音が外に漏れ、{c}が真っ青な顔で二人の口を塞いだ|{a}と{b}の怒鳴り合いを、{c}が「死にたいの!?｜死にたいのか!?｜死にたいんですか!?」と止めた。窓の外で、何かが動いた'
};
TX.omega={
sbSpat:'親族の集まりで顔を合わせた{a}と{b}は、挨拶もそこそこに言い合いを始めた。「まだ番も見つけてないの？｜まだ番も見つけていないのか？｜まだ番も見つけていないんですか？」「余計なお世話｜余計な世話だ｜余計なお世話です」|{a}は{b}の職場に偶然取引で来てしまい、二人とも露骨に嫌な顔をした',
sbCompare:'「上の子がαだったらよかったのにね」――親戚の何気ない一言を、{a}は何年も忘れられずにいた。{b}の顔を見るたびに、それを思い出した|{b}の昇進の話を聞いて、{a}は祝いの言葉より先にため息をついていた',
sbGrudge:'{b}が発情期の兆しで体調を崩したと聞いて、{a}は文句を言いながら抑制剤を届けに来た。「……ドアの前に置いとく。開けなくていい｜……ドアの前に置いておく。開けなくていい｜……ドアの前に置いておきます。開けなくていいです」|街で{b}がしつこいαに絡まれていると、{a}が間に入った。「うちの{sib:a→b}に、何か用？｜うちの{sib:a→b}に、何の用だ｜うちの{sib:a→b}に、何か用ですか」',
sbDefend:'{c}が{b}の第二性のことを茶化すと、{a}の目つきが変わった。「……もう一回言ってみろ｜＝｜……もう一回言ってみてください」|{c}が{b}を「家の恥」と言ったとき、{a}は静かに席を立った。「恥かどうかは、家族が決める｜＝｜恥かどうかは、家族が決めます」',
sbMemory:'実家の片付けで、{a}と{b}は二人の背丈を刻んだ柱を見つけた。第二性が分かる前の、同じくらいの高さの線だった|{a}は、{b}が子どもの頃に好きだったお菓子を、なんとなく買って帰っていた',
sbMakeup:'雨の夜、{a}は{b}の部屋の前で長いこと立っていた。ドアが開くと、{a}は言った。「……ずっと、ちゃんと謝りたかった｜……ずっと、きちんと謝りたかった｜……ずっと、ちゃんと謝りたかったんです」|{b}の番が決まったと聞いて、{a}は誰よりも早く祝いに駆けつけた。「……泣かされたら言えよ｜……泣かされたら言え｜……泣かされたら言ってください」',
bdClash:'会議で、{a}と{b}の意見は最初から最後まで噛み合わなかった。部署の空気が、二人のフェロモンよりも重くなった|{a}と{b}は、プロジェクトの進め方で真っ向から対立した',
bdSnark:'{a}は、{b}のつけている香水を嗅いで言った。「抑制剤の匂い、ごまかしきれてないよ｜抑制剤の匂いが、ごまかしきれていない｜抑制剤の匂い、ごまかしきれていませんよ」|{b}の報告を聞き終えると、{a}は言った。「三行で済む話だったね｜三行で済む話だった｜三行で済む話でしたね」',
bdForced:'急な案件で、{a}と{b}は二人きりで残業する羽目になった。終電の頃には、仕事はきれいに片付いていた|取引先の前では、{a}と{b}は完璧なコンビを演じた。エレベーターの扉が閉まると、二人は同時にそっぽを向いた',
bdCredit:'プロジェクトの成功を、{a}も{b}も自分の手柄だと上司に報告した|ミスの原因を、{a}は{b}の確認漏れのせいにし、{b}は{a}の指示のせいにした',
bdThaw:'{a}は、{b}がΩの新人を、誰よりも気遣っているのを見てしまった|発情期で倒れかけた{a}に、{b}が無言で自分の抑制剤を差し出した',
bdBlowup:'{a}と{b}の言い合いは、とうとう廊下にまで響いた。αのフェロモンが張り詰め、{c}が慌てて窓を開けた|{a}が{b}に掴みかかりかけたところを、{c}が羽交い締めにして止めた'
};
TX.br={
sbSpat:'禁止エリアの地図を前に、{a}と{b}はこんなときでも言い合いをやめなかった。「あなたの方向音痴に付き合ってたら死ぬ｜あなたの方向音痴に付き合っていたら死ぬ｜あなたの方向音痴に付き合っていたら死にます」「そっちの決めた道で、もう二回死にかけた｜＝｜そちらの決めた道で、もう二回死にかけました」|{a}は支給された武器を見比べ、{b}に言った。「……あなたの方が当たりなの、昔からだよな｜……あなたの方が当たりなのは、昔からだ｜……あなたの方が当たりなのは、昔からですよね」',
sbCompare:'放送で{b}の名前が「優勝候補」として読み上げられたとき、{a}は乾いた笑い声を上げた。「ここでも、あなたが一番か｜＝｜ここでも、あなたが一番ですか」|{a}は、両親がいつも{b}の方を頼りにしていたことを、こんな島で思い出していた',
sbGrudge:'傷を負った{b}の前に、{a}が立った。「……殺し合いでも、{sib:a→b}だけは殺さない。決めてたことだ｜……殺し合いでも、{sib:a→b}だけは殺さない。決めていたことだ｜……殺し合いでも、{sib:a→b}だけは殺しません。決めていたことです」|{a}は、{b}の傷口を黙って縛り、自分の水を半分渡した。「勘違いするな。最後に決着をつけたいだけだ｜＝｜勘違いしないでください。最後に決着をつけたいだけです」',
sbDefend:'{c}が「{sibs}なら、先にあいつを殺せ｜＝｜{sibs}なら、先にあの人を殺してください」と囁いた。{a}は{c}に銃口を向けた。「あいつに手を出したら、あなたから殺す｜＝｜あの人に手を出したら、あなたから殺します」|{c}が{b}を罠にかけようとしているのに気づいて、{a}は黙って{b}の前に出た',
sbMemory:'廃屋で夜を明かしながら、{a}はぽつりと言った。「……子どもの頃、二人で家出したことあったな。夕飯までに帰ったけど｜……子どもの頃、二人で家出したことがあった。夕飯までに帰ったが｜……子どもの頃、二人で家出したことがありましたね。夕飯までに帰りましたけど」|{a}と{b}は、背中合わせに見張りをした。昔、二人で肝試しに行った夜と同じだった',
sbMakeup:'最後の夜、{a}は{b}に言った。「……どっちかが生き残るなら、あなたがいい｜……どちらかが生き残るなら、あなたがいい｜……どちらかが生き残るなら、あなたがいいです」{b}は、泣きながら首を振った|{a}と{b}は、生き残るための作戦を、初めて二人で一緒に考えた',
bdClash:'{a}と{b}は、組むか別れるかで言い争った。銃声が近づいても、二人は譲らなかった|隠れ場所をめぐって、{a}と{b}はまたぶつかった',
bdSnark:'{a}は{b}の武器を見て言った。「鍋の蓋か。いい盾になるね、たぶん｜鍋の蓋か。たぶん、いい盾になるだろう｜鍋の蓋ですか。たぶん、いい盾になりますね」|{b}が物音に飛び上がると、{a}は肩をすくめた。「その反応、敵に見つかる前に心臓が止まるよ｜その反応では、敵に見つかる前に心臓が止まるぞ｜その反応だと、敵に見つかる前に心臓が止まりますよ」',
bdForced:'敵に囲まれ、{a}と{b}は背中合わせに戦うしかなかった。息は、驚くほど合っていた|{a}が囮になり、{b}が撃つ。打ち合わせもないのに、作戦は一度で決まった',
bdCredit:'襲撃を切り抜けたあと、{a}と{b}はどちらが敵を倒したかで揉めた|仕掛けた罠に引っかかったのが自分たちだったことを、{a}と{b}は互いのせいにした',
bdThaw:'{a}は、{b}が死んだ参加者のまぶたを、そっと閉じてやっているのを見た|{b}が、眠っている{a}の上に、自分の上着をかけていった',
bdBlowup:'疑心暗鬼の果てに、{a}と{b}は互いに武器を向け合った。{c}が「撃ったら、全員で撃つ｜＝｜撃ったら、全員で撃ちます」と叫んで止めた|{a}と{b}は、隠れ家の中で怒鳴り合った。{c}が窓の外の気配に気づき、二人を床に押し伏せた'
};
TX.trial={
sbSpat:'議論の最中も、{a}と{b}は互いの発言の揚げ足を取り合った。「あなた、さっきと言ってること違うだろ｜あなたは、さっきと言っていることが違うだろう｜あなた、さっきと言っていることが違うでしょう」「そっちこそ｜＝｜そちらこそでしょう」|{a}は{b}のアリバイ証言に、真っ先に「信用できない。昔から嘘が下手なんだ｜＝｜信用できません。昔から嘘が下手なんです」と口を挟んだ',
sbCompare:'{b}の推理が場を納得させたとき、{a}は爪を噛んだ。「……いつもそうだ。肝心なときは、あいつが正しい｜＝｜……いつもそうです。肝心なときは、あの人が正しいんです」|{a}は、家で{b}ばかり褒められていた頃と、今の議論の空気が同じだと思った',
sbGrudge:'{b}に疑いが集まったとき、{a}が手を挙げた。「……あいつはやってない。あいつに人は殺せない。そういう奴なんだ｜……あいつはやっていない。あいつに人は殺せない。そういう奴なんだ｜……あの人はやっていません。あの人に人は殺せません。そういう人なんです」|追い詰められた{b}に、{a}が議論の穴をこっそり指で示した',
sbDefend:'{c}が「{sibs}なら共犯でしょ｜{sibs}なら共犯だろう｜{sibs}なら共犯でしょう」と言い放つと、{a}は机を叩いた。「家族だからって、ひとくくりにするな｜家族だからといって、ひとくくりにするな｜家族だからって、ひとくくりにしないでください」|{c}が{b}を犯人扱いしたとき、{a}は{c}の証言の矛盾を冷静に並べ立てた',
sbMemory:'休憩時間、{a}はぽつりと言った。「……子どもの頃、裁判ごっこして、いつもあなたが弁護士だったな｜……子どもの頃、裁判ごっこをして、いつもあなたが弁護士だった｜……子どもの頃、裁判ごっこをして、いつもあなたが弁護士でしたね」{b}は、少しだけ笑った|{a}は、{b}が考えごとをするときに髪をいじる癖が、子どもの頃から変わっていないことに気づいた',
sbMakeup:'投票の前、{a}は{b}に小さく言った。「……信じてる。今回は｜……信じている。今回は｜……今回は、信じています」{b}は、それだけで救われた顔をした|議論が終わると、{a}と{b}は初めて並んで座った',
bdClash:'{a}と{b}は、犯人の候補をめぐって真っ向から対立した|{a}が仮説を出すたびに、{b}が反論した。議論は、二人の言い合いになった',
bdSnark:'{a}は{b}の推理を聞き終えると、拍手した。「すごいね。前提が全部間違ってるのに、筋は通ってる｜大したものだ。前提が全部間違っているのに、筋は通っている｜すごいですね。前提が全部間違っているのに、筋は通っています」|{b}が証拠を出すと、{a}は言った。「それ、さっき自分で否定してたやつだよね｜それは、さっき自分で否定していたものだろう｜それ、さっき自分で否定していたものですよね」',
bdForced:'証拠の検証で組まされた{a}と{b}は、口もきかずに作業を進めた。出てきた結論は、驚くほど一致していた|{a}が証言を並べ、{b}が矛盾を突く。不本意ながら、二人の連携が真相に近づけた',
bdCredit:'真相に近づいたのが誰の手柄か、{a}と{b}は言い合った|間違った投票に誘導したのは誰か、{a}と{b}は互いを責めた',
bdThaw:'{a}は、{b}が泣いている参加者に、そっとハンカチを渡しているのを見た|{b}が、{a}の見落とした証拠を、皆の前ではなく、こっそり{a}にだけ教えた',
bdBlowup:'{a}と{b}の口論は、とうとう証言台を挟んだ掴み合いになった。{c}が二人を引き離した|{a}が{b}を「犯人だ｜＝｜犯人です」と名指しし、{b}が{a}を名指し返した。{c}が「落ち着いて！｜落ち着け！｜落ち着いてください！」と叫んだ'
};
var MUL={zombie:4,island:1.3,omega:0.8};
function install(id){
var S=HK.SCENARIOS[id],T=TX[id];
if(!S|| !T|| !S.events)return;
Object.keys(TPL).forEach(function(k){
var D=TPL[k],pool=L(T[k]),eid='rb_'+id+'_'+k;
HK.addTo(S.events,{
id:eid,cat:D.cat,scope:'pair',
when:function(ctx,a,b){
if(!b|| !is(D.k)(ctx,a,b)|| !RK.cool(ctx,a,b,k,D.gap))return false;
if(D.when&& !D.when(ctx,a,b))return false;
if(D.need3&& !third(ctx,a,b))return false;
return true;
},
w:function(ctx,a,b){return D.w(ctx,a,b)*(MUL[id]||1)*(D.cat==='conflict'?HK.Dark.f(ctx,'spite'):1);},
run:function(ctx,a,b){
RK.mark(ctx,a,b,k);
var c=third(ctx,a,b);
var r=D.run(ctx,a,b,c)||{};
r.text=fill(ctx.pick(pool),{a:a.name,b:b.name,c:c?c.name:'周りの誰か'});
if(!/[。」！？]$/.test(r.text))r.text+='。';
var tie=HK.Ties.has(ctx,a,b,D.k);
r.why=r.why+'（'+(tie&&HK.tieLabel?HK.tieLabel(tie):HK.TIES[D.k].label)+'）';
if(HK.Sib){r.text=HK.Sib.fill(r.text,a,b,c,ctx);r.why=HK.Sib.fill(r.why,a,b,c,ctx);}
if(r.with&& !r.with[0])r.with=[];
return r;
}
});
});
}
['goukon','whiteroom','classroom','island','zombie','omega','br','trial'].forEach(function(id){HK.atScen(id,function(){install(id);});});
HK.RelBad=HK.RelBad||{};
HK.RelBad.engineTX=TX;
})();
});
;
/* ==== js/sib-feud.js ==== */
HK.Load.def(322,'js/sib-feud.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK|| !HK.Ties|| !HK.COMMON)return;
var SF=HK.SibFeud=HK.SibFeud||{};
function L(s){return s.split('|');}
var PK=['proud','stern','tsun','gentle','devoted','cool','free','shy','polite'];
function per(c){var k=c&&(c.persona||(HK.personaOf&&HK.personaOf(c)))||'gentle';return PK.indexOf(k)>=0?k:'gentle';}
function P9(o){var r={};PK.forEach(function(k){r[k]=L(o[k]||o.gentle);});return r;}
function here(c){return!!c&&(HK.State?HK.State.here(c):c.alive!==false)&& !(c.flags&&c.flags.caged!=null);}
function keyOf(a,b){return a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;}
var BOSS= /^(mentor|master|boss|teacher)$/,SIBT= /^(sibling|stepsib|sibprot)$/;
var WARMT= /^(lover|spouse|mate|fated|almost|best|friend|buddy|childhood|sibclose|fiance|honmei|fwb)$/;
function kindsOf(l,ai){
var k={any:false,sib:false,warm:false,t:null};
(l||[]).forEach(function(t){
if(!t)return;
var f='';
if(t.type==='sibbad'){f='sibbad';k.sib=true;}
else if(t.type==='bad'||t.type==='enemy'){if(t.a===ai|| !t.cold)f=t.type;}
else if(t.type==='rival')f='rival';
else if(BOSS.test(t.type)&&t.cold==='bad')f='cold';
if(t.kg==='bad'){f=f||'kg';k.kg=true;if(SIBT.test(t.type)||(t.type==='relative'&&t.step))k.sib=true;}
if(f){k[f]=true;k.any=true;if(!k.t){k.t=t;k.f=f;}}
if(WARMT.test(t.type)||t.couple)k.warm=true;
});
return k;
}
SF.kinds=function(ctx,a,b){
if(!ctx|| !a|| !b||a===b||a.i==null||b.i==null)return kindsOf([],-1);
return kindsOf((ctx.tiesAll&&ctx.tiesAll[keyOf(a,b)])||[],a.i);
};
SF.feud=function(ctx,a,b){
var k=SF.kinds(ctx,a,b);
return k.any&& !k.warm&& !ctx.pair(a,b).couple?k:null;
};
SF.thawed=function(ctx,a,b){
var pf=ctx.pair(a,b);
if(pf._sfThaw||pf._sbMake)return true;
var r1=ctx.R(a,b),r2=ctx.R(b,a);
return r1.aff>=30&&r2.aff>=30&&Math.max(r1.ten,r2.ten)<40;
};
SF.chilly=function(ctx,a,b){return!!(ctx&&a&&b&&a!==b&&(SF.feud(ctx,a,b)||SF.feud(ctx,b,a))&& !SF.thawed(ctx,a,b));};
function labOf(k,A,B){
var t=k.t;if(!t)return'不仲';
var s=A&&B&&HK.Sib&&HK.Sib.isSibTie(t)&&HK.Sib.tieLabel?HK.Sib.tieLabel(t,t.a===A.i?A:B,t.a===A.i?B:A):'';
s=s||(HK.tieLabel?HK.tieLabel(t):(HK.TIES[t.type]||{}).label||'');
if(k.f==='kg')s+='（仲：不仲）';
else if(k.f==='cold')s+='（仲：険悪）';
return s||'不仲';
}
SF.labOf=labOf;
var FE_ID= /^(?:tie_sf_|rb_|hl_|hk_|fd_|tie_ly_kin|tie_grade|tie_trial|tie_nw_hl_|poly_rival)|feud|hate|grudge|rival|enemy|spite|snark|sibbad/i;
var FE_SRC= /sibbad|['"](?:bad|enemy|rival)['"]|hostile|\.kg\b|cold\s*===?\s*['"]bad|LoveHate|HK\.Feud|RelBad|SibFeud/;
function warmEv(e){
if(!e)return'';
if(Object.prototype.hasOwnProperty.call(e,'_sfK'))return e._sfK;
var k='';
if(e.scope==='pair'&&(e.cat==='bond'||e.cat==='help')&& !e.feudOk&& !FE_ID.test(e.id||'')&&
!(!/^tie_/.test(e.id||'')&&FE_SRC.test(String(e.when||'')+String(e.w||''))))k=e.cat;
try{Object.defineProperty(e,'_sfK',{value:k,enumerable:false,configurable:true,writable:true});}catch(x){}
return k;
}
SF.warmEv=warmEv;
SF.DAMP={bond:0.06,help:0.12,thawBond:0.5,thawHelp:0.6};
SF.damp=function(ctx,a,b,cat){
if(!ctx|| !a|| !b|| !SF.feud(ctx,a,b))return 1;
var th=SF.thawed(ctx,a,b),D=SF.DAMP;
return cat==='help'?(th?D.thawHelp:D.help):(th?D.thawBond:D.bond);
};
function dampEv(e){
var k=warmEv(e);
if(!k||e._sfW||typeof e.w!=='function')return;
var w0=e.w,mini= !!e.mini,sig0=e.sig;
e.w=function(ctx,a,b){
var v=w0.apply(this,arguments),d=b&&v>0?SF.damp(ctx,a,b,k):1;
if(mini){if(d<1)e.sig=true;else if(sig0===undefined)delete e.sig;else e.sig=sig0;}
return d<1?v*d:v;
};
try{Object.defineProperty(e,'_sfW',{value:true,enumerable:false,configurable:true,writable:true});}catch(x){e._sfW=true;}
}
function feudPair(ctx,x,y){return(SF.feud(ctx,x,y)||SF.feud(ctx,y,x))&& !SF.thawed(ctx,x,y);}
function hubEv(e){
if(!e|| !e.dailyHub||e._sfD)return;
var wh0=e.when,rn0=e.run;
function narrow(f,self,args){
var ctx=args[0],a=args[1],b=args[2];
if(typeof f!=='function'|| !ctx|| !a|| !b|| !ctx.tiesAll||typeof ctx.others!=='function')return f&&f.apply(self,args);
var own=Object.prototype.hasOwnProperty.call(ctx,'others'),o0=ctx.others;
ctx.others=function(x){return o0.call(this,x).filter(function(o){return o===a||o===b||(!feudPair(ctx,a,o)&& !feudPair(ctx,b,o));});};
try{return f.apply(self,args);}finally{if(own)ctx.others=o0;else delete ctx.others;}
}
e.when=function(){return narrow(wh0,this,arguments);};
e.run=function(){return narrow(rn0,this,arguments);};
try{Object.defineProperty(e,'_sfD',{value:true,enumerable:false,configurable:true,writable:true});}catch(x){e._sfD=true;}
}
HK.wrap(HK,'buildPool',function(bp0){
if(!bp0)return bp0;
return function(){var p=bp0.apply(this,arguments);(p||[]).forEach(function(e){dampEv(e);hubEv(e);});return p;};
},9e8);
function storyTies(S){return(S&&(S.ties||(S.input&&S.input.ties)))||[];}
SF.storyKinds=function(S,a,b){
if(!a|| !b||a===b)return kindsOf([],-1);
var l=storyTies(S).filter(function(t){return t&&((t.a===a.i&&t.b===b.i)||(t.a===b.i&&t.b===a.i));});
var k=kindsOf(l,a.i);
if(!k.any){var k2=kindsOf(l,b.i);if(k2.any){k2.warm=k2.warm||k.warm;return k2;}}
return k;
};
SF.storyDamp=function(S,a,b){
var k=SF.storyKinds(S,a,b);
if(!k.any||k.warm)return 1;
return S._sfThaw&&S._sfThaw[keyOf(a,b)]?SF.DAMP.thawBond:SF.DAMP.help;
};
var EV={
ignore:{
sib:L('{a}は{b}と鉢合わせした。{sibs}なのだから挨拶くらいしてもいいはずだったが、{a}の口は少しも動かなかった。|{b}が戻ってきたとたん、{a}は手元から顔を上げなくなった。同じ家で育った{sib:a→b}の足音は、見なくても分かった。|朝、{a}と{b}は同じ場所で顔を合わせた。子どものころからの癖で、二人とも相手のほうを見ないまま、ぶつからない距離だけは正確に測っていた。'),
gen:L('{a}は{b}と顔を合わせても、挨拶ひとつしなかった。{b}が何か言いかけたのも、聞こえなかったことにした。|{b}が近くに来ると、{a}はわざとらしく一歩離れた。居合わせた人たちが、気まずそうに視線を交わした。|{a}と{b}は、同じ場にいながら一度も目を合わせなかった。どちらが先に口をきくかで、根比べをしているようだった。'),
end:L('二人のあいだに漂う冷たい空気に、周りのほうが居心地悪そうにしていた。|結局、その場が終わるまで、{a}と{b}は一言も口をきかなかった。|それきり、二人は互いをいないものとして扱い続けた。')
},
grudge:{
sib:L('{a}は{b}の何気ない一言で、子どものころの記憶を掘り起こされた。親はいつも、{b}の言い分ばかり聞いていた。|{a}はふと、昔{b}に取られたまま返ってこなかった物のことを思い出した。誕生日にもらった大事な物だったのに、{b}はもう覚えてもいなかった。|{a}は、親戚の集まりのたびに{b}と比べられてきた。成績も、背の高さも、愛想のよさも、いつも{b}が基準だった。|{a}は、親が{b}にだけ買い与えた物のことを、今でも覚えていた。贔屓だと口に出したことは一度もなかったが、忘れたこともなかった。'),
end:L('言い合いはすぐに終わったが、二人のあいだの古い棘は、また少し深く刺さった。|昔の恨みは、何年たっても消えてはいなかった。二人とも、それ以上は相手の顔を見なかった。|蒸し返した昔話は、どちらの謝罪でも終わらなかった。二人は不機嫌なまま、別々の方向を向いた。')
},
parents:{
sib:L('親から届いた連絡をきっかけに、{a}と{b}の口論が始まった。実家に顔を出すのはどちらの番か、二人とも一歩も譲らなかった。|{b}が「＠{b}＠親が心配してた｜親が心配していた｜親が心配していました」と口にしたとたん、{a}の顔色が変わった。親の話になると、二人はいつも同じところでぶつかった。|{a}と{b}は、親の今後のことで言い合いになった。どちらも、自分のほうが親のことを分かっていると思っていた。'),
end:L('結局、親の話はいつものように物別れに終わった。二人とも、相手が折れるのを待っていた。|言い合いが終わっても、二人の不機嫌はしばらく続いた。親の顔を思い浮かべるたびに、また腹が立った。|口論のあと、二人はそれぞれ親に連絡しようとして、同じタイミングでやめた。そういうところだけは、腹立たしいほど似ていた。')
},
rank:{
sib:L('{a}と{b}は、どちらが段取りを決めるかで揉めた。こういうとき、生まれた順番は今でも二人のあいだに顔を出した。|{b}のやり方に、{a}が口を挟んだ。子どものころから何百回も繰り返してきた、上と下の言い合いだった。|{a}と{b}は、ささいなことで張り合い始めた。どちらが上かという話になると、二人とも子どものころに戻ってしまった。'),
end:L('上か下かの言い合いは、今日も決着がつかなかった。二人とも、子どものころから少しも変わっていなかった。|周りがなだめるまで、二人はにらみ合ったままだった。|言い合いのあと、二人は同じ仕草でそっぽを向いた。それを指摘する勇気のある人は、誰もいなかった。')
},
facade:{
sib:L('{c}がいる前では、{a}と{b}はごく普通の{sibs}のように振る舞った。二人のあいだが険悪なことに、{c}は少しも気づいていなかった。|{c}に話しかけられると、{a}と{b}はそろって愛想のいい顔をした。家の中の不仲を外に持ち出さないことだけは、二人とも昔から守っていた。'),
gen:L('{c}がそばにいるあいだ、{a}と{b}は当たり障りのない会話を続けた。事情を知らない{c}には、二人の不仲は少しも見えていなかった。|{c}の前で、{a}は{b}の話にいちいちうなずいてみせた。険悪な空気を人前で見せるのは、二人とも避けたかった。'),
end:L('{c}が戻ってくると、二人はまた何事もなかったように笑顔を作った。その切り替えの速さが、かえって不仲の根の深さを物語っていた。|その後も、人前でだけ取り繕う時間が続いた。二人きりになるたびに、空気は冷たく張りつめた。')
},
vie:{
sib:L('{a}と{b}は、子どものころから何でも張り合ってきた。食べる速さでも背の高さでも、今は目の前の小さな作業でも同じだった。|{b}が少しうまくやってみせると、{a}はすぐに同じことをもっとうまくやろうとした。{sibs}の負けず嫌いは、昔から少しも変わっていなかった。'),
gen:L('{a}と{b}は、どちらが先に作業を終えるかで張り合い始めた。誰も競争しろなどと言っていないのに、二人の手はどんどん速くなった。|{b}がうまくやってみせると、{a}はすぐに同じことをもっとうまくやろうとした。周りは、二人の負けず嫌いにすっかり慣れていた。'),
end:L('勝負は、どちらも負けを認めないまま引き分けに終わった。二人とも、次こそはと心に決めていた。|張り合っているうちに、作業はいつもの倍の速さで片づいた。周りは呆れながらも、少しだけ助かっていた。|結果がどうであれ、二人とも自分の勝ちだと言い張った。言い合いの続きは、次の機会に持ち越された。')
},
grudging:{
sib:L('ほかに手の空いている人がいなかった。{a}は、よりによって{sib:a→b}の{b}と組むことになった。|{a}と{b}は、渋々並んで同じ作業に取りかかった。どちらも不機嫌な顔のまま、それでも手だけは止めなかった。'),
gen:L('{a}と{b}は、成り行きで同じ役目を引き受けることになった。二人とも、組む相手を選べるなら絶対に選ばない相手だった。|手が足りず、{a}は渋々{b}に声をかけた。気に食わない相手でも、今は組むしかなかった。'),
end:L('作業は無事に終わった。礼の言葉はどちらからも出なかったが、仕事ぶりだけは互いに認めていた。|終わったとたん、二人は反対の方向に歩き出した。それでも、組んだ仕事に手抜かりは一つもなかった。|二人の連携は、不機嫌な顔に似合わず悪くなかった。それを口にしたら負けだと、二人とも分かっていた。')
},
tend:{
sib:L('{b}がひどく弱っているのに、最初に気づいたのは{a}だった。仲の悪い{sibs}でも、顔色の変化だけはすぐに分かった。|{b}が具合を悪くして横になっていた。{a}は、知らないふりをして通り過ぎようとして、足を止めた。'),
gen:L('{b}の具合が悪そうなのを、{a}は見ないふりをしようとした。けれど、どうしても目の端に入ってしまった。|{b}が弱っていると聞いても、{a}は最初、顔をしかめただけだった。気に食わない相手のことなど、放っておけばよかった。'),
end:L('{b}が礼を言いかけると、{a}は「＠{a}＠うるさい｜うるさい｜やめてください」とだけ言って顔を背けた。素直になれないまま、それでも{a}は最後まで{b}のそばを離れなかった。|{a}は、{b}が眠ったのを確かめてから、黙ってその場を離れた。明日になれば、また口をきかない二人に戻るはずだった。|{b}が回復するまで、{a}は文句を言いながら世話を続けた。誰かに見られると、決まって不機嫌な顔を作った。')
},
thaw:{
sib:L('{a}は{b}と並んで歩きながら、ふと口を開きかけた。いがみ合ってばかりの{sibs}が、こうして同じ方向を向いているのは久しぶりだった。|{a}は、{b}が一人でいるところへ近づいた。何度も言いかけてはやめてきた言葉が、今日は喉まで出かかっていた。'),
gen:L('{a}は、ずっと言えずにいた言葉を、ようやく口にする気になった。{b}とのあいだにあった冷たい空気が、ほんの少しだけ緩んでいた。|{a}は、{b}の隣に黙って立った。長く続いた不仲のあとで、自分から近づくのは思った以上に勇気が要った。'),
end:L('{b}は少し驚いた顔をして、それから小さくうなずいた。仲直りと呼ぶにはぎこちなかったが、二人にとっては大きな一歩だった。|{b}の返事は短かったが、そこにいつもの棘はなかった。長い冬のあとの、最初の雪解けのような一言だった。|{b}は何も言わなかったが、その場を立ち去りもしなかった。並んだ二人の距離は、昨日より少しだけ近かった。')
}
};
var SAY={
ignore:P9({
proud:'{a}は{b}のほうを見もせずに、聞こえるように舌打ちした。{a}「……空気が悪くなった｜……空気が悪くなったな｜……空気が悪くなりましたね」',
stern:'{a}は{b}に一瞥もくれず、手元のことを続けた。{a}「話すことは何もない｜話すことは何もない｜話すことは何もありません」',
tsun:'{a}はぷいと顔を背けた。{a}「別に、気づいてないし｜別に、気づいてなどいない｜別に、気づいていませんから」',
gentle:'{a}は困ったように目を伏せ、{b}の横をそっと通り過ぎた。{a}「……今は、話したくない｜……今は、話したくない｜……今は、話したくありません」',
devoted:'{a}は唇を噛んで、{b}から視線を外した。{a}「……私から話しかけることは、もうしない｜……私から話しかけることは、もうしない｜……私から話しかけることは、もうしません」',
cool:'{a}は{b}を視界の端に入れたまま、いないものとして扱った。{a}「用件があるなら、ほかの人を通して｜用件があるなら、ほかの者を通せ｜用件があるなら、ほかの人を通してください」',
free:'{a}は{b}が来たとたん、くるりと背を向けて別の人のほうへ行こうとした。{a}「ねえ、あっち行こう｜おい、あっちへ行こう｜あの、あちらへ行きましょう」',
shy:'{a}は{b}に気づくと、そそくさと物陰に下がった。{a}「……べ、別に、避けてない｜……べ、別に、避けてはいない｜……べ、別に、避けてはいません」',
polite:'{a}は{b}に、他人行儀なほど丁寧な会釈だけをした。{a}「……どうも｜……失礼する｜……失礼します」'
}),
grudge:P9({
proud:'{a}「あのときのこと、まだ許してないから｜あのときのことは、まだ許していないからな｜あのときのこと、まだ許していませんから」',
stern:'{a}「昔のことを蒸し返すつもりはない。ただ、忘れてもいない｜＝｜昔のことを蒸し返すつもりはありません。ただ、忘れてもいません」',
tsun:'{a}「べ、別に根に持ってなんかない。……ちょっと思い出しただけ｜べ、別に根に持ってなどいない。……少し思い出しただけだ｜べ、別に根に持ってなんかいません。……少し思い出しただけです」',
gentle:'{a}「もう昔のことだけど……あれ、けっこう悲しかった｜もう昔のことだが……あれは、かなりこたえた｜もう昔のことですけど……あれ、けっこう悲しかったんです」',
devoted:'{a}「私がどれだけ我慢してたか、知らないよね｜私がどれだけ我慢していたか、知らないだろう｜私がどれだけ我慢していたか、知らないでしょう」',
cool:'{a}「事実を言っているだけ。あのとき得をしたのは、いつもあなた｜事実を言っているだけだ。あのとき得をしたのは、いつもあなただ｜事実を申し上げているだけです。あのとき得をしたのは、いつもあなたでした」',
free:'{a}「ずるい！昔からずっとそう！｜ずるい！昔からずっとそうだ！｜ずるいです！昔からずっとそうでした！」',
shy:'{a}「……わ、私だって、ずっと言いたかった｜……わ、私だって、ずっと言いたかった｜……わ、私だって、ずっと言いたかったんです」',
polite:'{a}「昔のことだから、って流せればよかったんだけど｜昔のことだから、と流せればよかったのだが｜昔のことですから、と流せればよかったのですが」'
}),
parents:P9({
proud:'{a}「親の機嫌取りなら、あなた一人でやって｜親の機嫌取りなら、あなた一人でやれ｜親の機嫌取りなら、あなた一人でやってください」',
stern:'{a}「親に心配かけてるのは、どっちだと思ってるの｜親に心配をかけているのは、どちらだと思っている｜親に心配をかけているのは、どちらだと思っているんですか」',
tsun:'{a}「私だって、ちゃんと連絡してるし！あなたが言わないだけ！｜私だって、きちんと連絡している！あなたが言わないだけだ！｜私だって、ちゃんと連絡しています！あなたが言わないだけです！」',
gentle:'{a}「親の前で、またそういう言い方をするつもり？｜親の前で、またそういう言い方をするつもりか｜親の前で、またそういう言い方をするつもりですか？」',
devoted:'{a}「家のことは、全部私に押し付けてきたくせに｜家のことは、全部私に押し付けてきたくせに｜家のことは、全部私に押し付けてきたじゃないですか」',
cool:'{a}「あなたの『そのうち』は聞き飽きた。親のこと、いつ動くの｜あなたの『そのうち』は聞き飽きた。親のことで、いつ動く｜あなたの『そのうち』は聞き飽きました。親のこと、いつ動くんですか」',
free:'{a}「えー、また親の話？もうやめようよ、その話！｜また親の話か。もうやめろ、その話は！｜また親の話ですか？もうやめましょうよ、その話は！」',
shy:'{a}「……親には、私からちゃんと言うから。勝手に話さないで｜……親には、私からきちんと言う。勝手に話すな｜……親には、私からちゃんと言いますから。勝手に話さないでください」',
polite:'{a}「親の名前を出すのは、ずるいと思う｜親の名前を出すのは、卑怯だと思う｜親の名前を出すのは、ずるいと思います」'
}),
lord:P9({
proud:'{a}「{sib:b→a}に向かって、その口のきき方は何？｜{sib:b→a}に向かって、その口のきき方は何だ｜{sib:b→a}に向かって、その口のきき方は何ですか」',
stern:'{a}「年上の言うことは聞くものでしょ｜年上の言うことは聞くものだ｜年上の言うことは聞くものです」',
tsun:'{a}「私のほうが{sib:b→a}なんだから、黙って従えばいいの！｜私のほうが{sib:b→a}なのだから、黙って従えばいい！｜私のほうが{sib:b→a}なんですから、黙って従えばいいんです！」',
gentle:'{a}「{sib:b→a}として言わせて。それ、やめたほうがいい｜{sib:b→a}として言わせてもらう。それはやめたほうがいい｜{sib:b→a}として言わせてください。それ、やめたほうがいいです」',
devoted:'{a}「ずっと面倒を見てきたのは、私なんだけど｜ずっと面倒を見てきたのは、私なのだが｜ずっと面倒を見てきたのは、私なんですけど」',
cool:'{a}「経験の差を考えれば、私の判断のほうが正しい｜経験の差を考えれば、私の判断のほうが正しい｜経験の差を考えれば、私の判断のほうが正しいです」',
free:'{a}「はいはい、{sib:b→a}命令！今日は私が決める！｜いいか、{sib:b→a}の命令だ！今日は私が決める！｜はい、{sib:b→a}命令です！今日は私が決めます！」',
shy:'{a}「……い、一応、私のほうが上なんだから……｜……い、一応、私のほうが上なのだから……｜……い、一応、私のほうが上なんですから……」',
polite:'{a}「{sib:b→a}として、一言だけ言わせて｜{sib:b→a}として、一言だけ言わせてもらう｜{sib:b→a}として、一言だけ申し上げてもいいですか？」'
}),
upstart:P9({
proud:'{a}「{sibcall:a→b}だからって、偉そうにしないで｜{sibcall:a→b}だからといって、偉そうにするな｜{sibcall:a→b}だからって、偉そうにしないでください」',
stern:'{a}「生まれた順で、正しさが決まるわけじゃない｜生まれた順で、正しさが決まるわけではない｜生まれた順で、正しさが決まるわけではありません」',
tsun:'{a}「{sibcall:a→b}の言うことなんか、聞くわけないし！｜{sibcall:a→b}の言うことなど、聞くわけがない！｜{sibcall:a→b}の言うことなんて、聞くわけないです！」',
gentle:'{a}「口を出してくれなくていい。もう子どもじゃない｜口を出さなくていい。もう子どもではない｜口を出してくれなくていいです。もう子どもじゃありません」',
devoted:'{a}「いつまでも下に見ないで。私だって、ちゃんとやれる｜いつまでも下に見るな。私だって、きちんとやれる｜いつまでも下に見ないでください。私だって、ちゃんとやれます」',
cool:'{a}「年が上なのは、判断が正しい理由にならない｜年が上なのは、判断が正しい理由にはならない｜年が上なのは、判断が正しい理由にはなりません」',
free:'{a}「やだ！{sibcall:a→b}の言いなりなんて、絶対やだ！｜断る！{sibcall:a→b}の言いなりなど、絶対に断る！｜嫌です！{sibcall:a→b}の言いなりなんて、絶対に嫌です！」',
shy:'{a}「……わ、私にだって、考えくらいある｜……わ、私にだって、考えくらいある｜……わ、私にだって、考えくらいあります」',
polite:'{a}「{sibcall:a→b}の考えは分かった。でも、従う気はない｜{sibcall:a→b}の考えは分かった。だが、従う気はない｜{sibcall:a→b}のお考えは分かりました。でも、従うつもりはありません」'
}),
facade:P9({
proud:'{c}が離れたとたん、{a}は笑顔を消した。{a}「……いつまで、いい顔してるつもり？｜……いつまで、いい顔をしているつもりだ｜……いつまで、いい顔をしているつもりですか」',
stern:'{c}の足音が遠ざかると、{a}は表情を消した。{a}「人前で揉めるのはみっともない。それだけ｜人前で揉めるのは見苦しい。それだけだ｜人前で揉めるのは見苦しいです。それだけです」',
tsun:'{c}がいなくなったとたん、{a}はそっぽを向いた。{a}「勘違いしないで。仲良くしたわけじゃないから｜勘違いするな。仲良くしたわけではない｜勘違いしないでください。仲良くしたわけじゃありませんから」',
gentle:'{c}が離れると、{a}は小さくため息をついた。{a}「……人前でだけ、こうしていられるのも変な話｜……人前でだけ、こうしていられるのも妙な話だ｜……人前でだけ、こうしていられるのも変な話ですね」',
devoted:'{c}が去ると、{a}はうつむいた。{a}「……あの人に、心配をかけたくなかっただけ｜……あの人に、心配をかけたくなかっただけだ｜……あの人に、心配をかけたくなかっただけです」',
cool:'{c}が去ると、{a}はすぐに真顔に戻った。{a}「必要な演技だった。続ける理由はもうない｜必要な演技だった。続ける理由はもうない｜必要な演技でした。続ける理由はもうありません」',
free:'{c}がいなくなるなり、{a}は大きく伸びをした。{a}「あー、疲れた。いい人のふりって肩こる｜ああ、疲れた。いい人のふりは肩が凝る｜あー、疲れました。いい人のふりって肩がこります」',
shy:'{c}がいなくなると、{a}はそっと{b}から距離を取った。{a}「……い、今のは、その場に合わせただけ｜……い、今のは、その場に合わせただけだ｜……い、今のは、その場に合わせただけです」',
polite:'{c}が去ると、{a}は他人行儀な口調に戻った。{a}「さっきはどうも。もういいから｜さっきはどうも。もう結構だ｜先ほどはどうも。もう結構です」'
}),
vie:P9({
proud:'{a}「この程度で勝った気？笑わせないで｜この程度で勝った気か。笑わせるな｜この程度で勝った気ですか？笑わせないでください」',
stern:'{a}「勝負なら受ける。手加減はしない｜勝負なら受ける。手加減はしない｜勝負なら受けます。手加減はしません」',
tsun:'{a}「べ、別に競ってないし！たまたま速かっただけ！｜べ、別に競ってなどいない！たまたま速かっただけだ！｜べ、別に競ってなんかいません！たまたま速かっただけです！」',
gentle:'{a}「……ごめん、ここは譲れない｜……すまない、ここは譲れない｜……ごめんなさい、ここは譲れません」',
devoted:'{a}「あなたにだけは、負けたくない｜あなたにだけは、負けたくない｜あなたにだけは、負けたくありません」',
cool:'{a}「数字で比べよう。結果は明らかだから｜数字で比べるぞ。結果は明らかだ｜数字で比べましょう。結果は明らかですから」',
free:'{a}「よーし、もう一回！今度は絶対勝つ！｜よし、もう一回だ！今度は絶対に勝つ！｜よし、もう一回です！今度は絶対に勝ちます！」',
shy:'{a}「……つ、次は、負けない｜……つ、次は、負けない｜……つ、次は、負けません」',
polite:'{a}「では、もう一度。今度は私が勝たせてもらう｜では、もう一度だ。今度は私が勝たせてもらう｜では、もう一度。今度は私が勝たせていただきます」'
}),
grudging:P9({
proud:'{a}「あなたと組むのは気が進まないけど、仕方ない｜あなたと組むのは気が進まないが、仕方ない｜あなたと組むのは気が進みませんけど、仕方ありません」',
stern:'{a}「私情は挟まない。やるべきことをやるだけ｜私情は挟まない。やるべきことをやるだけだ｜私情は挟みません。やるべきことをやるだけです」',
tsun:'{a}「今回だけだから。次は絶対に組まない｜今回だけだ。次は絶対に組まない｜今回だけですから。次は絶対に組みません」',
gentle:'{a}「……文句はあとで聞く。今は手を貸して｜……文句はあとで聞く。今は手を貸せ｜……文句はあとで聞きます。今は手を貸してください」',
devoted:'{a}「私がやるから、あなたは足を引っ張らないで｜私がやるから、あなたは足を引っ張るな｜私がやりますから、あなたは足を引っ張らないでください」',
cool:'{a}「効率の問題。あなたと組むのが一番早い。それだけ｜効率の問題だ。あなたと組むのが一番早い。それだけだ｜効率の問題です。あなたと組むのが一番早い。それだけです」',
free:'{a}「うわ、よりによってあなたと？……まあいいや、さっさと終わらせよ｜よりによってあなたとか。……まあいい、さっさと終わらせるぞ｜よりによってあなたとですか？……まあいいです、さっさと終わらせましょう」',
shy:'{a}「……し、仕方なくだから。勘違いしないで｜……し、仕方なくだ。勘違いするな｜……し、仕方なくですから。勘違いしないでください」',
polite:'{a}「不本意だけど、協力はする｜不本意だが、協力はする｜不本意ですが、協力はいたします」'
}),
tend:P9({
proud:'{a}は舌打ちしながら、{b}の前に水と薬を乱暴に置いた。{a}「倒れられたら迷惑なだけ｜倒れられたら迷惑なだけだ｜倒れられたら迷惑なだけです」',
stern:'{a}は無言で{b}に毛布をかけた。{a}「体調の管理も務めのうち。今は休んで｜体調の管理も務めのうちだ。今は休め｜体調の管理も務めのうちです。今は休んでください」',
tsun:'{a}は{b}に背を向けたまま、温かい飲み物を差し出した。{a}「余っただけだから。……さっさと飲んで｜余っただけだ。……さっさと飲め｜余っただけですから。……さっさと飲んでください」',
gentle:'{a}は何も言わずに{b}の隣に座り、額の汗を拭った。{a}「……今だけ。治ったら、また元どおりだから｜……今だけだ。治ったら、また元どおりだ｜……今だけです。治ったら、また元どおりですから」',
devoted:'{a}は夜通し{b}のそばについていた。{a}「……あなたのためじゃない。放っておくと寝覚めが悪いだけ｜……あなたのためではない。放っておくと寝覚めが悪いだけだ｜……あなたのためじゃありません。放っておくと寝覚めが悪いだけです」',
cool:'{a}は{b}の様子を確かめて、淡々と言った。{a}「このままだと悪化する。言うとおりにして｜このままでは悪化する。言うとおりにしろ｜このままだと悪化します。言うとおりにしてください」',
free:'{a}は{b}の分の食事まで、勝手に運んできた。{a}「食べないと治らないって。ほら、さっさと食べて｜食べないと治らない。ほら、さっさと食べろ｜食べないと治りませんよ。ほら、さっさと食べてください」',
shy:'{a}は{b}の枕元に食べ物をそっと置き、すぐに立ち去ろうとした。{a}「……み、見かけたから、置いておくだけ｜……み、見かけたから、置いておくだけだ｜……み、見かけたから、置いておくだけです」',
polite:'{a}は{b}のために薬を用意し、事務的な口調で告げた。{a}「飲んでおいて。礼はいらない｜飲んでおけ。礼はいらない｜飲んでおいてください。お礼は結構です」'
}),
thaw:P9({
proud:'{a}「……前に言ったこと、言いすぎた。それだけ｜……前に言ったことは、言いすぎた。それだけだ｜……前に言ったこと、言いすぎました。それだけです」',
stern:'{a}「借りは返す主義なの。……この前のこと、ありがとう｜借りは返す主義だ。……先日のことには礼を言う｜借りは返す主義です。……先日のこと、お礼を申し上げます」',
tsun:'{a}「か、勘違いしないでよね。……でも、まあ、ありがと｜か、勘違いするな。……だが、まあ、礼は言う｜か、勘違いしないでください。……でも、まあ、ありがとうございます」',
gentle:'{a}「……ずっと、こうして話したかったのかもしれない｜……ずっと、こうして話したかったのかもしれない｜……ずっと、こうして話したかったのかもしれません」',
devoted:'{a}「私も、ずっと引っ込みがつかなかった。……ごめん｜私も、ずっと引っ込みがつかなかった。……すまない｜私も、ずっと引っ込みがつかなかったんです。……ごめんなさい」',
cool:'{a}「冷静に考えれば、争う理由はそれほど多くなかった｜冷静に考えれば、争う理由はそれほど多くなかった｜冷静に考えれば、争う理由はそれほど多くありませんでした」',
free:'{a}「ねえ、今度、ご飯でも行く？……いや、やっぱ今のなし！｜おい、今度、飯でも行くか。……いや、やはり今のはなしだ！｜あの、今度、ご飯でも行きませんか？……いえ、やっぱり今のはなしです！」',
shy:'{a}「……あ、あの。……この前は、ありがとう｜……あ、あの。……この前は、礼を言う｜……あ、あの。……この前は、ありがとうございました」',
polite:'{a}「これまでのこと、少しだけ謝りたい｜これまでの非礼を、少しだけ詫びたい｜これまでの非礼を、少しだけお詫びさせてください」'
})
};
var BACK={
snap:P9({
proud:'{b}は鼻で笑った。{b}「そっちこそ、何様のつもり｜そちらこそ、何様のつもりだ｜そちらこそ、何様のつもりですか」',
stern:'{b}は眉ひとつ動かさずに言い返した。{b}「その言葉、そのまま返す｜その言葉、そのまま返す｜その言葉、そのままお返しします」',
tsun:'{b}は真っ赤になって言い返した。{b}「な、何それ！私のほうが正しいし！｜な、何だそれは！私のほうが正しい！｜な、何ですかそれ！私のほうが正しいです！」',
gentle:'{b}は困ったように笑ったが、引き下がらなかった。{b}「……そういうところ、昔から変わらないね｜……そういうところは、昔から変わらないな｜……そういうところ、昔から変わりませんね」',
devoted:'{b}は唇を噛んだ。{b}「私だって、言いたいことはたくさんある｜私だって、言いたいことは山ほどある｜私だって、言いたいことはたくさんあります」',
cool:'{b}は冷ややかに肩をすくめた。{b}「感情的になっても、話は進まない｜感情的になっても、話は進まない｜感情的になっても、話は進みませんよ」',
free:'{b}はべーっと舌を出した。{b}「知らない！そっちが悪い！｜知るか！そちらが悪い！｜知りません！そちらが悪いです！」',
shy:'{b}はうつむいたまま、小さな声で言い返した。{b}「……そ、そんな言い方、しなくても｜……そ、そんな言い方をしなくても｜……そ、そんな言い方、しなくてもいいじゃないですか」',
polite:'{b}はにこりともせずに答えた。{b}「意見は聞いた。でも、聞く気はない｜意見は聞いた。だが、従う気はない｜ご意見はうかがいました。でも、聞くつもりはありません」'
}),
cold:P9({
proud:'{b}は聞こえよがしに舌打ちを返して、そっぽを向いた。',
stern:'{b}も表情ひとつ変えず、{a}がそこにいないかのように振る舞った。',
tsun:'{b}は鼻を鳴らして、わざと大きな音を立てて座り直した。',
gentle:'{b}は少しだけ寂しそうな顔をしたが、それ以上は何も言わなかった。',
devoted:'{b}は傷ついた顔を隠すように、手元のことに没頭した。',
cool:'{b}は一瞬だけ{a}を見て、何事もなかったように視線を戻した。',
free:'{b}は{a}に向かって、べーっと舌を出してみせた。',
shy:'{b}はびくりと肩を震わせて、黙って距離を取った。',
polite:'{b}は形だけの会釈を返し、そのまま口を閉ざした。'
}),
grudgeOk:P9({
proud:'{b}は「……ふん｜……ふん｜……そうですか」とだけ返して、渋々{a}に従った。',
stern:'{b}は短くうなずいた。礼は言わなかったが、拒みもしなかった。',
tsun:'{b}は「べ、別に頼んでない｜べ、別に頼んではいない｜べ、別に頼んでいません」と言いながら、結局{a}の言うとおりにした。',
gentle:'{b}は少し驚いた顔をして、「……うん｜……ああ｜……はい」とだけ答えた。',
devoted:'{b}は何か言いたそうにしたが、言葉を飲み込んで小さく頭を下げた。',
cool:'{b}は「合理的な判断だね｜合理的な判断だ｜合理的な判断です」とだけ言って、{a}に従った。',
free:'{b}は「えー｜＝｜ええっ」と口を尖らせたが、文句を言いながらもついてきた。',
shy:'{b}は消え入りそうな声で「……あ、ありがと｜……あ、ありがとう｜……あ、ありがとうございます」とつぶやいた。',
polite:'{b}は「どうも｜恐れ入る｜恐れ入ります」と他人行儀に答えて、それ以上は何も言わなかった。'
})
};
var SAY2={
stuck:P9({
proud:'{a}「よりによって、あなたと閉じ込められるとか。最悪｜よりによって、あなたと閉じ込められるとはな。最悪だ｜よりによって、あなたと閉じ込められるなんて。最悪です」',
stern:'{a}「……なんで、よりによってあなたなの｜……なぜ、よりによってあなたなのだ｜……どうして、よりによってあなたなんですか」',
tsun:'{a}「な、なんであなたと一緒なの！こっちに寄らないで！｜な、なぜあなたと一緒なんだ！こちらに寄るな！｜な、なんであなたと一緒なんですか！こっちに寄らないでください！」',
gentle:'{a}「……よりによって、あなたとか。困ったな｜……よりによって、あなたとか。困ったな｜……よりによって、あなたとですか。困りましたね」',
devoted:'{a}「ほかの誰かとなら、まだよかったのに｜ほかの誰かとなら、まだよかったのだが｜ほかの誰かとなら、まだよかったんですけど」',
cool:'{a}「確率の話をすれば、最悪の組み合わせだね｜確率の話をすれば、最悪の組み合わせだな｜確率の話をすれば、最悪の組み合わせですね」',
free:'{a}「えー、あなたと？うそでしょ、ほかの人がよかった！｜あなたとか。冗談だろう、ほかの者がよかった！｜えっ、あなたとですか？うそでしょう、ほかの人がよかったです！」',
shy:'{a}「……よ、よりによって、あなたと……｜……よ、よりによって、あなたと……｜……よ、よりによって、あなたとですか……」',
polite:'{a}「……あなたと同じところとは。ついてない｜……あなたと同じところとは。ついていない｜……あなたとご一緒とは。ついていませんね」'
}),
food:P9({
proud:'{a}「これは私の分。指一本触れないで｜これは私の分だ。指一本触れるな｜これは私の分です。指一本触れないでください」',
stern:'{a}「配分は公平に。あなたの分は、それで全部｜配分は公平にする。あなたの分は、それで全部だ｜配分は公平にしましょう。あなたの分は、それで全部です」',
tsun:'{a}「あ、あなたにあげる分なんてないから！｜あ、あなたにやる分などない！｜あ、あなたにあげる分なんてありませんから！」',
gentle:'{a}「……悪いけど、これだけは譲れない｜……悪いが、これだけは譲れない｜……悪いですけど、これだけは譲れません」',
devoted:'{a}「私が見つけてきた分。勝手に取らないで｜私が見つけてきた分だ。勝手に取るな｜私が見つけてきた分です。勝手に取らないでください」',
cool:'{a}「働いた量で分ける。それが一番揉めない｜働いた量で分ける。それが一番揉めない｜働いた量で分けましょう。それが一番揉めません」',
free:'{a}「早い者勝ち！これ、もらった！｜早い者勝ちだ！これはもらった！｜早い者勝ちです！これ、いただきました！」',
shy:'{a}「……そ、それ、私が先に取ったのに｜……そ、それは、私が先に取ったのだが｜……そ、それ、私が先に取ったんですけど」',
polite:'{a}「悪いけど、これはこっちでもらう｜悪いが、これはこちらでもらう｜申し訳ありませんが、これはこちらでいただきます」'
}),
leave:P9({
proud:'{a}は一歩、背を向けかけた。{a}「……知ったことか｜……知ったことか｜……知ったことではありません」――そう吐き捨てた次の瞬間、{a}は振り返って{b}の腕をつかんでいた。',
stern:'{a}は一瞬、冷たい計算をした。{a}「……見捨てるのが合理的｜……見捨てるのが合理的だ｜……見捨てるのが合理的です」――それでも、{a}の足は{b}のほうへ動いた。',
tsun:'{a}はその場で固まった。{a}「べ、別に、助けたいわけじゃ……｜べ、別に、助けたいわけでは……｜べ、別に、助けたいわけじゃありません……」――言い終わる前に、{a}は{b}に向かって駆け出していた。',
gentle:'{a}の足が、一瞬すくんだ。{a}「……放っておけば、いいはずなのに｜……放っておけばいいはずなのだが｜……放っておけばいいはずなんです」――頭ではそう思っても、{a}の手はもう{b}に伸びていた。',
devoted:'{a}は、昔{b}にされたことを思い出して立ち止まった。{a}「……ここで見捨てても、誰も責めない｜……ここで見捨てても、誰も責めない｜……ここで見捨てても、誰も責めません」――それでも{a}は、唇を噛んで{b}のもとへ走った。',
cool:'{a}は冷静に状況を見た。助ければ自分も危ない。{a}「……計算が合わない｜……計算が合わない｜……計算が合いません」――{a}は舌打ちして、計算を放り出した。',
free:'{a}は言いかけた悪態を飲み込んだ。{a}「……あーもう！見てられない！｜……ああもう！見ていられない！｜……あーもう！見ていられません！」――{a}は{b}に向かって飛び込んだ。',
shy:'{a}は震える足で立ち尽くした。{a}「……い、いなくなればいいって、思ったこともあるのに｜……い、いなくなればいいと、思ったこともあるのに｜……い、いなくなればいいって、思ったこともあったんです」――それでも{a}は、{b}の名前を叫んでいた。',
polite:'{a}は一瞬、背を向けかけた。{a}「……私には関係のないこと｜……私には関係のないことだ｜……私には関係のないことです」――そう言い聞かせたはずの体が、勝手に{b}のほうへ動いた。'
}),
shield:P9({
proud:'{a}は{b}を背にかばったまま、忌々しそうに舌打ちした。{a}「……なんで私が、あなたなんかを｜……なぜ私が、あなたなどを｜……どうして私が、あなたなんかを」',
stern:'{a}は肩で息をしながら、{b}を見もせずに言った。{a}「……体が勝手に動いただけ。礼はいらない｜……体が勝手に動いただけだ。礼は不要だ｜……体が勝手に動いただけです。お礼は不要です」',
tsun:'{a}は{b}の前に立ちはだかったまま、真っ赤になって怒鳴った。{a}「か、かばったんじゃないから！たまたま前にいただけ！｜か、かばったのではない！たまたま前にいただけだ！｜か、かばったんじゃありませんから！たまたま前にいただけです！」',
gentle:'{a}は{b}を引き寄せてから、自分のしたことに気づいて顔をしかめた。{a}「……もう、何やってるの。危ないでしょ｜……まったく、何をやっている。危ないだろう｜……もう、何をやっているんですか。危ないでしょう」',
devoted:'{a}は痛む腕を押さえながら、{b}から目を逸らした。{a}「……あなたのためじゃない。後味が悪くなるのが嫌なだけ｜……あなたのためではない。後味が悪くなるのが嫌なだけだ｜……あなたのためじゃありません。後味が悪くなるのが嫌なだけです」',
cool:'{a}は{b}をかばった自分の腕を、他人事のように眺めた。{a}「……今、あなたに倒れられると困る。戦力の問題｜……今、あなたに倒れられると困る。戦力の問題だ｜……今、あなたに倒れられると困ります。戦力の問題です」',
free:'{a}は床に転がった体を起こすなり、{b}に文句を言った。{a}「いったーい！……もう、あなたのせいだから！｜痛っ……！まったく、あなたのせいだ！｜いったーい！……もう、あなたのせいですから！」',
shy:'{a}は{b}の前で震えながら、自分の手を見つめた。{a}「……か、体が、勝手に……｜……か、体が、勝手に……｜……か、体が、勝手に動いたんです……」',
polite:'{a}は乱れた服を直しながら、冷ややかに言った。{a}「……勘違いしないで。たまたま、そうなっただけ｜……勘違いするな。たまたま、そうなっただけだ｜……勘違いなさらないでください。たまたま、そうなっただけです」'
})
};
var SCN={
wr_stuck:{
sib:L('目を覚ますと、そこは白い部屋だった。{a}は隣で起き上がった{sib:a→b}の{b}を見て、思わず顔をしかめた。|扉の文字を読み終えた{a}は、同じ部屋にいる{b}を見て、深いため息をついた。家でもまともに口をきかない{sibs}が、よりによって同じ部屋に閉じ込められていた。'),
gen:L('白い部屋で目を覚ました{a}は、同じ部屋に{b}がいると気づいて、露骨に不機嫌な顔をした。|閉ざされた扉の前で、{a}は振り返った。そこにいたのが{b}だと分かって、{a}の顔から表情が消えた。'),
end:L('{b}も同じことを思っていたらしく、二人は部屋の反対の隅に陣取った。出口を探すより先に、まず互いの距離を確保した。|二人の険悪な空気のせいで、白い部屋がさらに狭く感じられた。|二人は扉の文字をにらみつけたまま、どちらも相手に話しかけようとしなかった。')
},
wr_line:{
sib:L('{a}は、部屋の真ん中に見えない線を引くように、自分の持ち物を並べた。子どものころ、同じ部屋を分け合っていたときと同じやり方だった。'),
gen:L('{a}は、部屋の床に見えない境界線があるかのように振る舞った。{b}が一歩でもこちらに入ってくると、あからさまに眉をひそめた。'),
end:L('狭い部屋の中で、二人の陣地の取り合いは静かに続いた。|線を越えた越えないで、二人はまた小さく揉めた。閉じ込められていても、不仲は少しも変わらなかった。')
},
is_food:{
sib:L('食料が乏しくなったある日、{a}と{b}は同じ木の実に同時に手を伸ばした。子どものころのおやつの取り合いと、まるで同じだった。|{a}と{b}は、焚き火の前で最後の干し魚をにらみ合った。{sibs}の食い意地の張り合いは、島に来ても変わらなかった。'),
gen:L('配給の分け方をめぐって、{a}と{b}のあいだにまた火花が散った。腹が減っているときの不仲は、いつもより始末が悪かった。|{a}が取っておいた分を、{b}が手に取ろうとした。{a}はすかさず、その手を払いのけた。'),
end:L('見かねた誰かが二つに分けて、ようやくその場は収まった。二人とも、相手の取り分のほうが大きいと思っていた。|{a}は取り分を抱えて、{b}からいちばん遠い場所に座った。焚き火の煙だけが、二人のあいだを漂っていた。')
},
is_leave:{
gen:L('嵐の中、足を滑らせた{b}が、崖の縁にしがみついていた。いちばん近くにいたのは{a}だった。|満ちてきた潮に、{b}が岩場で足を取られていた。気づいていたのは、{a}だけだった。'),
end:L('{b}を安全な場所まで引き上げると、{a}は礼を言われる前に背を向けた。助けたことを、自分でもまだ認めたくなかった。|ずぶ濡れのまま、二人はしばらく黙って座り込んでいた。{b}が礼を言いかけると、{a}は不機嫌に「＠{a}＠やめて｜やめろ｜やめてください」とだけ言った。')
},
zb_leave:{
gen:L('路地の奥で、{b}がゾンビに追い詰められていた。気づいたのは{a}だけだった。|崩れた階段の下で、{b}が足を挟まれて動けなくなっていた。群れの足音が、少しずつ近づいていた。'),
end:L('{b}を物陰に引きずり込んで、{a}は荒い息をついた。礼を言おうとした{b}を、{a}は鋭くにらんで黙らせた。|安全な場所まで逃げ切ると、{a}は{b}の手を乱暴に振りほどいた。助けたことを、{a}は最後まで認めなかった。')
},
zb_shield:{
gen:L('物陰から飛び出してきたゾンビが、{b}に襲いかかった。考えるより先に、{a}の体が動いていた。|崩れかけた棚が、{b}の頭上に倒れかかった。気づいたときには、{a}が{b}と棚のあいだに飛び込んでいた。'),
end:L('{b}が何か言う前に、{a}は痛む腕を押さえて歩き出した。かばったことを、いちばん信じられないのは{a}自身だった。|二人とも、礼も文句も口にしなかった。ただ、{a}の舌打ちだけが、やけに大きく響いた。')
},
lk_stuck:{
sib:L('狭いロッカーの中で、{a}は押し付けられている相手が{sib:a→b}の{b}だと気づいた。家でもろくに口をきかない{sibs}が、身動きもとれないほど密着していた。'),
gen:L('暗いロッカーの中で、{a}は隣にいるのが{b}だと気づいて身をこわばらせた。いちばん顔を合わせたくない相手と、肩が触れ合うほどの距離に押し込められていた。'),
end:L('{b}も同じことを思っていたらしく、二人はできるかぎり体を離そうとして、かえって壁にぶつかった。|二人の険悪な沈黙のせいで、ロッカーの中の空気はさらに重くなった。')
}
};
function pick(rng,l){return l[Math.floor(rng()*l.length)];}
function compose(rng,D,sib,sayL,a,back,b){
var fr=pick(rng,sib&&D.sib?D.sib:D.gen||D.sib);
return fr+pick(rng,sayL[per(a)])+(back?pick(rng,back[per(b)]):'')+pick(rng,D.end);
}
function rankOf(a,b,env){
if(!HK.Sib|| !HK.Sib.info)return'';
var o=HK.Sib.info(a,b,env);
return o&& !o.flat&&(o.pos==='ue'||o.pos==='shita')&& !o.twin?o.pos:'';
}
var TYPES={
ignore:{cat:'conflict',gap:5,ok:function(k){return k.sibbad||k.bad||k.enemy||k.cold;},w:function(a){return 0.55+a.tr.cold*0.4+a.tr.ac*0.15;},
fx:function(ctx,a,b){ctx.mod2(a,b,{ten:4,trust: -1},{ten:3});ctx.stress(b,2);},why:'顔を合わせても口をきかない（ドライさ）',back:'cold'},
grudge:{cat:'conflict',gap:7,ok:function(k){return k.sib;},w:function(a){return 0.45+(a.tr.jealous||0)*0.5+a.tr.ac*0.25;},
fx:function(ctx,a,b){ctx.mod2(a,b,{ten:5,aff: -2},{ten:4,aff: -1});ctx.stress(a,3);},why:'昔の恨み（親の贔屓・取られた物・比べられた）を蒸し返した（嫉妬深さ・AC）',back:'snap'},
parents:{cat:'conflict',gap:8,ok:function(k){return k.sib;},w:function(a){return 0.4+a.tr.cp*0.3+a.tr.np*0.1;},
fx:function(ctx,a,b){ctx.mod2(a,b,{ten:5,aff: -2},{ten:5,aff: -2});},why:'親の話で口論になった（CP）',back:'snap'},
rank:{cat:'conflict',gap:7,ok:function(k){return k.sib;},w:function(a){return 0.45+a.tr.cp*0.4;},
fx:function(ctx,a,b){ctx.mod2(a,b,{ten:4},{ten:5,aff: -2});},why:'上下を笠に着る・突っぱねる（CP）',back:'snap'},
facade:{cat:'conflict',gap:8,need3:true,ok:function(k){return k.sibbad||k.bad||k.enemy||k.kg||k.cold;},w:function(a){return 0.35+a.tr.a*0.3+a.tr.ac*0.2;},
fx:function(ctx,a,b){ctx.mod2(a,b,{ten:2},{ten:2});},why:'人前では取り繕った（A・AC）',back:'cold'},
vie:{cat:'conflict',gap:6,ok:function(k){return k.rival||k.sibbad||k.kg||k.bad;},w:function(a){return 0.45+a.tr.cp*0.3+a.tr.fc*0.2;},
fx:function(ctx,a,b){ctx.mod2(a,b,{ten:4},{ten:4});},why:'張り合った（負けず嫌い：CP・FC）',back:'snap'},
grudging:{cat:'help',gap:7,ok:function(k){return k.sibbad||k.kg||k.enemy||k.rival||k.cold;},w:function(a){return 0.45+a.tr.a*0.3+a.tr.ac*0.1;},
fx:function(ctx,a,b){ctx.mod2(a,b,{trust:4},{trust:4});},why:'気が進まないまま、渋々協力した（A）',back:'grudgeOk'},
tend:{cat:'help',gap:6,hurt:true,ok:function(k){return k.sib||k.bad||k.cold;},w:function(a){return 1+a.tr.np*0.6;},
fx:function(ctx,a,b){ctx.mod(b,a,{trust:5});ctx.mod(a,b,{trust:2});ctx.stress(b,-6);},why:'素直になれないまま、弱った相手の世話を焼いた（NP）',back:'grudgeOk'},
thaw:{cat:'bond',gap:30,ok:function(k){return k.any;},w:function(a){return 0.25+a.tr.np*0.2+a.tr.a*0.1;},
fx:function(ctx,a,b){ctx.pair(a,b)._sfThaw=true;ctx.mod2(a,b,{aff:8,ten: -8},{aff:8,ten: -8});},why:'雪解けの小さな一歩（まれ。不仲の出来事が重なったあと）',back:null}
};
SF.TYPES=TYPES;SF.EV=EV;SF.SAY=SAY;SF.BACK=BACK;SF.SAY2=SAY2;SF.SCN=SCN;
function hurt(b){return(b.hp!=null&&b.hp<60)||b.stress>55;}
function cool(ctx,a,b,id,gap){var v=ctx.pair(a,b)['_sf_'+id];return v==null||ctx.stepIndex-v>=gap;}
function mark(ctx,a,b,id,feud){var pf=ctx.pair(a,b);pf['_sf_'+id]=ctx.stepIndex;if(feud)pf._sfN=(pf._sfN||0)+1;}
function third(ctx,a,b){var o=ctx.others(a).filter(function(c){return c!==b&&here(c);});return o.length?ctx.pick(o):null;}
function base(ctx,a,b){return!!b&&here(a)&&here(b)&& !ctx.pair(a,b).couple;}
function rankSay(ctx,a,b){var p=rankOf(a,b,ctx);return p==='shita'?SAY.lord:p==='ue'?SAY.upstart:null;}
function textOf(ctx,id,a,b,c){
var T=TYPES[id],k=SF.feud(ctx,a,b),sayL=id==='rank'?rankSay(ctx,a,b):SAY[id];
var t=compose(ctx.rng,EV[id],!!(k&&k.sib),sayL,a,T.back?BACK[T.back]:null,b);
return ctx.t(t,a,b,c);
}
var LABEL={
ignore:'不仲の相手と顔を合わせても無視する',grudge:'不仲なきょうだいが昔の恨みを蒸し返す',parents:'不仲なきょうだいが親の話で口論する',
rank:'不仲なきょうだいが上下で張り合う',facade:'不仲の二人が人前でだけ取り繕う',vie:'不仲の二人が何かと張り合う',
grudging:'気に食わない相手と渋々協力する',tend:'不仲の相手の世話を素直になれず焼く',thaw:'不仲の二人に雪解けの小さな一歩'
};
var TIEMARK={
ignore:'sibbad,bad,enemy,mentor,master,boss,teacher',grudge:'sibbad,sibling,stepsib,sibprot',parents:'sibbad,sibling,stepsib,sibprot',rank:'sibbad,sibling,stepsib',
facade:'sibbad,bad,enemy,sibling,parent,relative,mentor,master,boss,teacher',vie:'rival,sibbad,bad,sibling,parent,relative',grudging:'sibbad,enemy,rival,sibling,parent,relative,mentor,master,boss,teacher',
tend:'sibbad,bad,sibling,stepsib,sibprot,mentor,master,boss,teacher',thaw:'sibbad,bad,enemy,rival,sibling,parent,relative,mentor,master,boss,teacher'
};
Object.keys(TYPES).forEach(function(id){
var T=TYPES[id];
HK.addTo(HK.COMMON,{
id:'tie_sf_'+id,label:LABEL[id],tie:TIEMARK[id],cat:T.cat,scope:'pair',feudOk:true,
when:function(ctx,a,b){
if(!base(ctx,a,b)|| !cool(ctx,a,b,id,T.gap))return false;
var k=SF.feud(ctx,a,b);
if(!k|| !T.ok(k))return false;
if(T.hurt&& !hurt(b))return false;
if(T.need3&& !third(ctx,a,b))return false;
if(id==='rank'&& !rankSay(ctx,a,b))return false;
if(id==='thaw'&&((ctx.pair(a,b)._sfN||0)<4||SF.thawed(ctx,a,b)||ctx.stepIndex<2))return false;
return true;
},
w:function(ctx,a){return T.w(a);},
run:function(ctx,a,b){
var c=T.need3?third(ctx,a,b):null,k=SF.feud(ctx,a,b);
if(!k||(T.need3&& !c))return null;
mark(ctx,a,b,id,id!=='thaw');
T.fx(ctx,a,b);
return{with:c?[c]:[],text:textOf(ctx,id,a,b,c),why:a.name+'と'+b.name+'は'+labOf(k)+'：'+T.why,mag:id==='thaw'?16:8};
}
});
});
var SCN_EV={
whiteroom:[
{id:'tie_sf_wr_stuck',label:'よりによって不仲の相手と閉じ込められる',cat:'conflict',say:'stuck',back:null,gap:99,once:true,
when:function(ctx){return ctx.stepIndex<=1;},w:function(a){return 1.2+a.tr.cp*0.4;},
fx:function(ctx,a,b){ctx.mod2(a,b,{ten:5},{ten:5});ctx.stress(a,3);},why:'よりによって不仲の相手と閉じ込められた'},
{id:'tie_sf_wr_line',label:'狭い部屋に不仲の相手との境界線を引く',cat:'conflict',say:'ignore',sayFrom:SAY,back:'cold',gap:8,
w:function(a){return 0.45+a.tr.cold*0.3+a.tr.cp*0.2;},
fx:function(ctx,a,b){ctx.mod2(a,b,{ten:3},{ten:3});},why:'狭い部屋の中に、見えない境界線を引いた（ドライさ・CP）'}
],
island:[
{id:'tie_sf_is_food',label:'不仲の二人が乏しい食料を取り合う',cat:'conflict',say:'food',back:'snap',gap:6,
when:function(ctx){return ctx.food==null||ctx.food<60;},w:function(a){return 0.6+a.tr.cp*0.3+(1-a.tr.np)*0.2;},
fx:function(ctx,a,b){ctx.mod2(a,b,{ten:6,aff: -2},{ten:6,aff: -2});ctx.stress(a,3);ctx.stress(b,3);},why:'乏しい食料を取り合った（CP・NPの低さ）'},
{id:'tie_sf_is_leave',label:'不仲の相手を見捨てかけて思いとどまる',cat:'help',say:'leave',back:null,gap:12,once:true,
when:function(ctx){return ctx.stepIndex>=2;},w:function(a){return 0.4+a.tr.np*0.4;},
fx:function(ctx,a,b){ctx.mod(b,a,{trust:6});ctx.mod(a,b,{ten:2});ctx.stress(b,-4);},why:'見殺しにしかけて、思いとどまった（NP）'}
],
zombie:[
{id:'tie_sf_zb_shield',label:'不仲の相手をかばってしまい舌打ちする',cat:'help',say:'shield',back:null,gap:7,
w:function(a){return 0.6+a.tr.np*0.3+a.tr.aggr*0.2;},
fx:function(ctx,a,b){ctx.mod(b,a,{trust:6});ctx.stress(a,3);if(a.hp!=null&&a.hp>20)a.hp-=3;},why:'考えるより先に、不仲の相手をかばってしまった（NP）'},
{id:'tie_sf_zb_leave',label:'襲われた不仲の相手を見捨てかけて戻る',cat:'help',say:'leave',back:null,gap:8,hurt:55,
w:function(a){return 1+a.tr.np*0.5;},
fx:function(ctx,a,b){ctx.mod(b,a,{trust:6});ctx.mod(a,b,{ten:2});ctx.stress(b,-4);},why:'見殺しにしかけて、思いとどまった（NP）'}
]
};
SF.SCN_EV=SCN_EV;
function install(sid){
var S=HK.SCENARIOS[sid];
if(!S|| !S.events)return;
SCN_EV[sid].forEach(function(D){
var key=D.id.replace(/^tie_sf_/,''),TX=SCN[key];
HK.addTo(S.events,{
id:D.id,label:D.label,tie:'sibbad,bad,enemy,rival,sibling,parent,relative,mentor,master,boss,teacher',cat:D.cat,scope:'pair',feudOk:true,
when:function(ctx,a,b){
if(!base(ctx,a,b)|| !cool(ctx,a,b,key,D.gap)|| !SF.feud(ctx,a,b))return false;
if(D.once&&ctx.pair(a,b)['_sf_'+key]!=null)return false;
if(D.hurt&& !(b.hp!=null&&b.hp<D.hurt))return false;
return!D.when||D.when(ctx,a,b);
},
w:function(ctx,a){return D.w(a);},
run:function(ctx,a,b){
var k=SF.feud(ctx,a,b);
if(!k)return null;
mark(ctx,a,b,key,true);
D.fx(ctx,a,b);
var t=compose(ctx.rng,TX,k.sib,(D.sayFrom||SAY2)[D.say],a,D.back?BACK[D.back]:null,b);
return{text:ctx.t(t,a,b),why:a.name+'と'+b.name+'は'+labOf(k)+'：'+D.why,mag:10};
}
});
});
}
['whiteroom','island','zombie'].forEach(function(id){HK.atScen(id,function(){install(id);});});
var STORY_IDS={jashin:1,yakata:1,ship:1,locker:1};
var SKIP= /クライマックス|生贄|罰ゲーム|結末|エピローグ|解決|脱出|最後|真相|最期|終わり|時間切れ|見つかった/;
var STORY_K=['ignore','grudge','parents','rank','facade','vie','grudging','thaw'];
function sPick(S,l){return l[Math.floor(S.rng()*l.length)];}
function sFree(S,p){var RB=HK.RelBad;return p&&(RB&&RB.free?RB.free(S,p):p.alive!==false&& !p.out);}
function sFill(S,t,a,b,c){
t=t.replace(/\{a\}/g,a.name).replace(/\{b\}/g,b.name).replace(/\{c\}/g,c?c.name:'');
return HK.Sib?HK.Sib.fill(t,a,b,c,{ties:storyTies(S)}):t;
}
function storyHook(S,label){
var sid=S&&S.scen&&S.scen.id;
if(!STORY_IDS[sid]|| !S.P||SKIP.test(label||'')||(S._sfN||0)>=4)return;
var ties=storyTies(S);
if(!ties.some(function(t){var A=t&&S.P[t.a],B=t&&S.P[t.b];return A&&B&&A!==B&&(function(k){return k.any&& !k.warm;})(SF.storyKinds(S,A,B));}))return;
if(S.rng()>=0.33)return;
S._sfUsed=S._sfUsed||{};
var opts=[],P=S.P,seen={};
ties.forEach(function(t){
var A=P[t.a],B=P[t.b];
if(!A|| !B||A===B|| !sFree(S,A)|| !sFree(S,B))return;
var pk=keyOf(A,B);
if(seen[pk])return;seen[pk]=1;
[[A,B],[B,A]].forEach(function(ab){
var a=ab[0],b=ab[1],k=SF.storyKinds(S,a,b);
if(!k.any||k.warm)return;
var used=S._sfUsed[pk]||[];
if(sid==='locker'){
if(used.indexOf('lk_stuck')<0&&a.mates&&a.mates.indexOf(b)>=0)opts.push({a:a,b:b,k:k,pk:pk,id:'lk_stuck',w:1.5});
return;
}
STORY_K.forEach(function(id){
var T=TYPES[id];
if(used.indexOf(id)>=0|| !T.ok(k))return;
if(id==='thaw'&&used.length<3)return;
if(id==='rank'&& !rankOf(a,b,{ties:ties}))return;
var c=null;
if(T.need3){var cs=P.filter(function(q){return q!==a&&q!==b&&sFree(S,q);});if(!cs.length)return;c=sPick(S,cs);}
opts.push({a:a,b:b,k:k,pk:pk,id:id,c:c,w:Math.max(0.05,T.w(a))*(id==='thaw'?0.5:1)});
});
});
});
if(!opts.length)return;
var o=HK.weighted(S.rng,opts,function(x){return x.w;});
(S._sfUsed[o.pk]=S._sfUsed[o.pk]||[]).push(o.id);
S._sfN=(S._sfN||0)+1;
var a=o.a,b=o.b,t,why;
if(o.id==='lk_stuck'){
t=compose(S.rng,SCN.lk_stuck,o.k.sib,SAY2.stuck,a,null,b);
why='よりによって不仲の相手と同じロッカーに押し込められた';
}else{
var T=TYPES[o.id],p=o.id==='rank'?rankOf(a,b,{ties:ties}):'';
var sayL=o.id==='rank'?(p==='shita'?SAY.lord:SAY.upstart):SAY[o.id];
t=compose(S.rng,EV[o.id],o.k.sib,sayL,a,T.back?BACK[T.back]:null,b);
why=T.why;
if(o.id==='thaw'){S._sfThaw=S._sfThaw||{};S._sfThaw[o.pk]=1;}
}
var lab=labOf(o.k,a,b);
(HK.Story||{}).say(S,{actors:o.c?[a,b,o.c]:[a,b],tag:lab,text:sFill(S,t,a,b,o.c),why:a.name+'と'+b.name+'：'+why+'（'+lab+'）'});
}
SF.storyHook=storyHook;
var RB0=HK.RelBad=HK.RelBad||{};
RB0.EXTRA=RB0.EXTRA||[];
HK.addTo(RB0.EXTRA,storyHook);
})();
});
HK.Load.done('pack-rel', '2e22d1c526', 1);
