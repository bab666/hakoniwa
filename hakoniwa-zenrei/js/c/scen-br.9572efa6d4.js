;
/* ==== js/scenario-br.js ==== */
HK.Load.def(64,'js/scenario-br.js',function(){
(function(){
'use strict';
var HK=window.HK;
function R(ctx,a,b){return ctx.R(a,b);}
function names(list){return list.map(function(c){return c.name;}).join('・');}
function closing(ctx,P){
var rng=ctx.rng,all=ctx.chars,out=all.filter(function(c){return c.out;}),dead=all.filter(function(c){return!c.alive;});
var fill=function(t,m){return t.replace(/\{(\w)\}/g,function(_,k){return m[k]!=null?m[k]:'';});};
var text,head;
var live=all.filter(function(c){return c.alive;}),pr=null,best=25;
live.forEach(function(a){live.forEach(function(b){if(a.i<b.i){var v=(R(ctx,a,b).aff+R(ctx,b,a).aff)/2+(ctx.pair(a,b).allied?20:0);if(v>best){best=v;pr=[a,b];}}});});
if(out.length){
head='脱出';
var left=all.filter(function(c){return c.alive&& !c.out;});
text=fill(rng.pick([
'夜明け前、ボートは島影を離れた。外した首輪は、波の底へ沈めた。{o}は振り返らなかった。島の灯りが見えなくなるまで、誰も口をきかなかった。',
'朝の光の中で、{o}はようやく顔を上げた。ゲームの会場だった島は、もう水平線の向こうの小さな影でしかなかった。生き延びたのではなく、自分の手で抜け出したのだと、{o}は何度も胸の中で繰り返した。',
'ボートが本土の浜に乗り上げたとき、{o}は膝から崩れ落ちた。首に残った輪の跡が、まだひりひりと痛んだ。それでも、ここから先は、誰にも決められない明日だった。'
]),{o:names(out)})+(left.length?fill(rng.pick(['島には、{l}が残された。','{l}は、ボートに乗らなかった。','岸に立つ{l}の姿が、だんだん小さくなっていった。']),{l:names(left)}):'');
}else if(P.length===1&&P[0].alive){
var w=P[0],k=w.flags.kills||0;
head='優勝';
text=fill(rng.pick(k?[
'最後の放送が、{a}の名前を優勝者として読み上げた。迎えのヘリが降りてきたとき、{a}は手にしていた武器をようやく離した。指は、しばらく開かなかった。',
'首輪の電子音が止んだ。島に立っているのは、もう{a}一人だけだった。{a}が手にかけたのは{k}人。ヘリの窓から見下ろした島は、ひどく小さく見えた。',
'{a}は、優勝者の証として渡された紙切れを、黙って握りつぶした。帰りの船の上で、{a}は一度も眠れなかった。目を閉じるたびに、最後に向かい合った顔が浮かんだ。'
]:[
'最後の放送が、{a}の名前を優勝者として読み上げた。{a}は一度も、自分の手で誰かを殺さなかった。それでも、生き残ったのは{a}一人だった。',
'{a}は、隠れていた場所から外へ出た。島はしんと静まり返っていた。誰とも戦わずに勝った{a}を、迎えのヘリが黙って乗せていった。',
'首輪の電子音が止んだとき、{a}は自分がまだ息をしていることに驚いた。手は汚れていなかった。それが救いなのかどうか、{a}にはまだ分からなかった。'
]),{a:w.name,k:k});
}else if(P.length>1&&P.every(function(c){return c.alive;})){
head='時間切れ';
text=fill(rng.pick([
'試合の終わりを告げるサイレンが、島じゅうに鳴り響いた。{l}は、最後まで生き延びた。誰も勝たなかったゲームは、記録の上では「中止」として片づけられた。',
'時間切れの放送のあと、首輪のランプが一斉に消えた。{l}は呆然と空を見上げた。殺し合わずに迎えた朝が、ひどくまぶしかった。',
'迎えの船に乗せられた{l}は、互いの顔を見ないようにして座っていた。生き残ったという実感は、本土の港が見えるまで湧いてこなかった。'
]),{l:names(P)});
}else{
head='全滅';
text=fill(rng.pick([
'島に、動く者はいなくなった。管理室のモニターには、{n}人分の首輪の信号が、ひとつ残らず途絶えたことが表示されていた。今回のゲームに、優勝者はいなかった。',
'最後の首輪が鳴り止んだあと、島には波の音だけが残った。勝者のいない試合の記録は、誰にも読まれないまま綴じられた。',
'翌朝、島に上陸した回収班は、{n}人の名前を一人ずつ名簿から消していった。最後の欄には、「該当者なし」とだけ書き込まれた。'
]),{n:all.length});
}
if(head!=='全滅'){
var mw=head==='優勝'?P[0]:ctx.most((head==='脱出'?out:live).filter(function(c){return c.motive&&c.motive!=='none';}),function(c){return c.motiveAuto?0:1;});
var me=mw?motiveEnd(ctx,mw):'';
if(me)text+=me;
}
if(pr&&head!=='全滅')text+=fill(rng.pick(['{a}と{b}は、最後まで互いの名前を呼び合っていた。','{a}は、{b}の手を離さなかった。','{a}と{b}の背中合わせの約束は、最後まで守られた。']),{a:pr[0].name,b:pr[1].name});
else if(dead.length&&head!=='全滅')text+=fill(rng.pick(['{d}の名前は、もう放送で読み上げられることもない。','島に残された{d}のことを、生き残った者は一生忘れないだろう。',head==='優勝'?'{d}の顔を、夢の中で何度も見ることになる。':'{d}の分まで生きる――そう思えるようになるには、まだ時間がかかりそうだった。']),{d:names(dead.slice(-3))});
ctx.say({kind:'step',cat:'phase',text:'試合終了 ― '+head});
ctx.say({kind:'event',cat:head==='全滅'?'combat':'escape',actors:head==='全滅'?[]:all.filter(function(c){return c.alive;}),text:text,why:'ゲームの結末（'+head+'）',mag:40});
if(!ctx.flags.outcome)ctx.flags.outcome=head==='脱出'?names(out)+'が島を脱出':head==='時間切れ'?'時間切れ ― '+names(P)+'が生き延びた':head==='全滅'?'全滅 ― 優勝者なし':'';
}
function add(s){HK.SCENARIOS[s.id]=s;if(HK.SCEN_ORDER.indexOf(s.id)<0)HK.SCEN_ORDER.push(s.id);}
HK.WEAPONS=[
{id:'gun',name:'拳銃',pow:9},{id:'bow',name:'ボウガン',pow:7},{id:'sickle',name:'鎌',pow:6},
{id:'knife',name:'サバイバルナイフ',pow:5},{id:'bat',name:'金属バット',pow:4},{id:'kitchen',name:'包丁',pow:4},
{id:'stun',name:'スタンガン',pow:3},{id:'poison',name:'毒薬の小瓶',pow:2,sp:'poison'},
{id:'aid',name:'救急箱',pow:0,sp:'heal'},{id:'radar',name:'探知機',pow:0,sp:'radar'},
{id:'lid',name:'鍋の蓋',pow:1},{id:'fork',name:'フォーク',pow:1}
];
function allied(ctx,a,b){return!!ctx.pair(a,b).allied;}
function willKill(c){return c.tol!=null?0.45+c.tol*0.9:1;}
function firstKill(ctx){
var DG=HK.DGK;
if(!DG)return;
ctx.present().forEach(function(c){
if(!c.flags.kills||c.flags.trauma|| !c.life)return;
c.flags.trauma=true;
ctx.stress(c,{peace:28,harsh:10,killed:2}[c.life]);
ctx.act2({actors:[c],cat:'solo',text:ctx.t(ctx.pick(DG.AFTER_KILL[c.life]),c),why:c.name+'の生い立ち（'+DG.LIFE_LABEL[c.life]+'）。初めて人を殺したあと'});
});
}
function L(s){return s.split('|');}
function fillM(t,m){return String(t).replace(/\{(\w+)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
var MOT_LABEL={home:'生きて帰りたい理由がある',guard:'守りたい人がいる',grudge:'復讐したい相手がいる',rebel:'主催者に一矢報いたい',prize:'優勝の賞品が欲しい',atone:'罪を償いたい・死に場所を探している',none:'何もない（巻き込まれただけ）'};
var MOT_KEYS=['home','guard','grudge','rebel','prize','atone','none'];
var MOT_FIELD={id:'motive',label:'動機',auto:'おまかせ（気質と関係から）',options:MOT_KEYS.map(function(k){
return{id:k,label:MOT_LABEL[k]+({home:'（家族・約束・夢）',guard:'（恋人・家族・親友など）',grudge:'（憎い相手・主催者）',prize:'（賞金・願い）'}[k]||'')};
})};
function hateScore(ctx,a,o){
if(!a|| !o||a===o)return 0;
var r=R(ctx,a,o),s=HK.HateKit&&HK.HateKit.level?HK.HateKit.level(ctx,a,o):Math.max(0,r.ten-r.aff);
(HK.Ties?HK.Ties.all(ctx,a,o):[]).forEach(function(t){
var from=t.a===a.i;
if(t.type==='enemy'&&(from|| !t.cold))s+=t.grade==='hate'?60:40;
else if(t.type==='bad'&&(from|| !t.cold))s+=18;
else if(t.type==='sibbad')s+=15;
else if(t.type==='yan'&&from&&t.sub==='hatelove')s+=30;
});
if(HK.LoveHate&&HK.LoveHate.has&&HK.LoveHate.has(ctx,a,o))s+=25;
if(a.flags.revenge===o.i)s+=60;
return s;
}
function hateTarget(ctx,a,min){
var best=null,bv=min;
ctx.chars.forEach(function(o){if(o!==a&&o.alive){var v=hateScore(ctx,a,o);if(v>bv){bv=v;best=o;}}});
return best;
}
var GUARD_T={lover:60,spouse:70,fiance:60,honmei:50,mate:60,fated:55,parent:65,pparent:60,sibprot:60,sibclose:50,sibling:40,best:50,buddy:40,childhood:35,almost:35,crush:30,master:30,mentor:25};
function guardTarget(ctx,a){
var best=null,bv=40;
ctx.chars.forEach(function(o){
if(o===a|| !o.alive)return;
var v=Math.max(0,R(ctx,a,o).aff)*0.6;
(HK.Ties?HK.Ties.all(ctx,a,o):[]).forEach(function(t){var w=GUARD_T[t.type]||0;if(t.type==='crush'&&t.a!==a.i)w=0;v=Math.max(v,w+Math.max(0,R(ctx,a,o).aff)*0.3);});
if(v>bv){bv=v;best=o;}
});
return best;
}
function setupMotives(ctx){
var rng=HK.rng((((ctx.seed||1)*7919)+31)>>>0);
ctx.chars.forEach(function(c){
var t=c.tr,pk=(c.pick||{}).motive,hate=hateTarget(ctx,c,30),guard=guardTarget(ctx,c);
var m=MOT_LABEL[pk]?pk:null;
if(!m){
var w={home:0.5+t.ac*0.3+t.np*0.2,guard:guard?0.6+t.np*0.8:0.03,grudge:hate?0.35+t.aggr*0.6+t.jealous*0.3:0.03,rebel:0.15+t.cp*0.4+t.a*0.3,
prize:0.1+t.cold*0.4+t.fc*0.3,atone:0.05+(c.life==='killed'?0.5:0)+t.ac*0.15,none:0.35};
m=HK.weighted(rng,MOT_KEYS,function(k){return w[k];});
c.motiveAuto=true;
}
c.motive=m;
if(m==='guard'){if(guard)c.flags.guardOf=guard.i;else c.motive='home';}
if(m==='grudge'&&hate)c.flags.grudge=hate.i;
if(c.action&&c.action.id==='revenge'&&c.flags.grudge==null){var h2=hateTarget(ctx,c,12);if(h2)c.flags.grudge=h2.i;}
if(c.flags.grudge!=null&&c.flags.revenge==null)c.flags.revenge=c.flags.grudge;
});
}
function grudgeOf(ctx,c){return c.flags.grudge!=null?ctx.chars[c.flags.grudge]:null;}
function guardOf(ctx,c){return c.flags.guardOf!=null?ctx.chars[c.flags.guardOf]:null;}
function mad(c){return!!(c&&c.flags&&c.flags.brMad);}
function despair(c){return!!(c&&c.action&&c.action.id==='despair'&& !c.flags.relived);}
function motK(c,k){return c.motive===k;}
var MOT_INTRO={
home:L('{a}は首輪に指をかけたまま、目を閉じた。家で待っている人の顔が浮かんだ。{a}「……帰る。何があっても｜……帰る。何があってもだ｜……帰ります。何があっても」|{a}は支給品の袋の底に、折りたたんだ写真を押し込んだ。帰ったらやると決めていたことが、まだいくつも残っていた。|{a}は配られた地図の端に、小さく日付を書き込んだ。約束の日までに、ここを出なければならなかった。'),
guard:L('{a}は名簿の中に{c}の名前を見つけて、息が止まりそうになった。{a}「{c}だけは、絶対に死なせない｜{c}だけは、決して死なせない｜{c}だけは、絶対に死なせません」|{a}が真っ先に考えたのは、自分のことではなかった。{c}は今、どこにいるのか。{a}は武器を握り直して、森へ入った。|教室を出る前、{a}は一度だけ{c}の方を振り返った。目が合ったのは一瞬だった。それで、やることは決まった。'),
grudge:L('{a}は名簿の{c}の名前を、爪の跡が残るほど強くなぞった。この島でなら、誰にも咎められない。|{a}は{c}の背中を目で追った。何年も胸の奥で燻っていたものが、首輪の冷たさで形になった。|{a}「{c}だけは、私の手で終わらせる｜{c}だけは、私の手で終わらせる｜{c}だけは、私の手で終わらせます」――{a}の声は、誰にも聞こえないほど低かった。'),
grudgeHost:L('{a}はスピーカーを睨みつけた。大切な人を奪ったこのゲームの主催者の顔を、{a}はまだ知らない。それでも、必ず見つけ出すと決めていた。|{a}は前にも一度、このゲームの名前を聞いたことがあった。帰ってこなかった人の名前と一緒に。{a}は首輪に触れて、静かに歯を食いしばった。|{a}「このゲームを作った人間に、私は会いに来た｜このゲームを作った人間に、私は会いに来た｜このゲームを作った人に、私は会いに来ました」――{a}の目は、名簿ではなく監視カメラの方を向いていた。'),
rebel:L('{a}は首輪の継ぎ目を指でなぞった。殺し合うつもりは、最初からなかった。壊すべきなのは、このゲームの方だった。|{a}は監視カメラの位置を一つずつ数えていた。主催者が見ているなら、見せてやればいい。思いどおりにならない参加者がいることを。|{a}「殺し合いなんて、誰がするか｜殺し合いなど、誰がするか｜殺し合いなんて、誰がするものですか」――{a}は配られた地図を裏返し、島の電線の位置を書き込み始めた。'),
prize:L('{a}は優勝の賞品の話を、もう一度頭の中で繰り返した。それさえ手に入れば、全部やり直せる。|{a}はほかの参加者の顔を、品定めするように眺めた。最後に残るのは一人だけ。なら、その一人になればいい。|{a}「賞金が出るなら、話は早い｜賞金が出るのなら、話は早い｜賞金が出るのなら、話は早いです」――{a}は武器の重さを確かめて、小さく笑った。'),
atone:L('{a}は配られた武器を見下ろした。ずっと前に背負ったものの重さに比べれば、ひどく軽かった。|{a}は誰とも目を合わせなかった。ここで終わるなら、それもいい。ただ、終わる前に一つくらいは、誰かの役に立ちたかった。|{a}「私には、ちょうどいい場所かもしれない｜私には、ちょうどいい場所かもしれない｜私には、ちょうどいい場所かもしれません」――そう言った{a}の顔は、妙に静かだった。')
};
var MOT_THINK={
home:L('{a}は木の根元に座り、写真の端を指でなぞった。帰る場所があるということが、今は一番の武器だった。|{a}は眠れない夜、家で待つ人に話しかけるように、小さく口を動かした。明日も生きる理由を、一つずつ数えた。|{a}は残りの食料を、きっちり日数分に分けた。生きて帰るつもりの人間の分け方だった。'),
guard:L('{a}は放送で{c}の名前が呼ばれなかったことを確かめて、ようやく息を吐いた。|{a}は{c}がいそうな場所を、地図の上で一つずつ消していった。どこかで、まだ生きているはずだった。|{a}は{c}の分の水も、水筒に残しておいた。会えたときに渡せるように。'),
grudge:L('{a}は{c}の足取りを追っていた。踏み荒らされた草、捨てられた包み紙。近づいている、と{a}は思った。|{a}は手の中の武器を何度も確かめた。{c}の顔を思い浮かべるたびに、握る手に力がこもった。|{a}は{c}の名前がまだ放送で呼ばれないことに、安堵していた。自分の手で終わらせるまでは、生きていてもらわなければ困る。'),
grudgeHost:L('{a}はスピーカーの位置から、放送の届き方を測っていた。主催者に近づく道は、必ずどこかにあるはずだった。|{a}は禁止エリアの順番を書き留めていた。主催者が何を見て、何を楽しんでいるのか。それが分かれば、喉元に届く。|{a}は監視カメラのレンズを、まっすぐ見返した。向こう側にいる誰かに、目をそらさせるつもりで。'),
rebel:L('{a}は拾った針金で、首輪の留め具を探っていた。外せないなら、外せない理由を見つければいい。|{a}は禁止エリアの順番を書き留めていた。主催者の癖が、少しずつ見えてきた。|{a}は監視カメラに背を向けて、地図の裏に島の配電の線を書き足した。'),
prize:L('{a}は優勝したあとのことを考えていた。そう考えているあいだだけ、震えが止まった。|{a}は遠くの銃声を数えた。一つ鳴るたびに、賞品に近づいている気がした。|{a}は手に入れたら何に使うかを、紙の端に書いた。書き終えてから、その紙を丸めて捨てた。'),
atone:L('{a}は誰かの悲鳴が聞こえるたびに、そちらへ向かおうとした。自分が行けば、一人くらいは助かるかもしれない。|{a}は夜明けの海を見ていた。償いきれないことがあるのは知っていた。それでも、ここで逃げたら同じことの繰り返しだった。|{a}は支給された薬を、自分では使わずにしまっておいた。使うべき誰かが、きっと現れる。')
};
var GUARD_LOST=L('{a}は定時放送で{c}の名前を聞いた。守ると決めた理由が、音を立てて崩れた。{a}は長いあいだ、その場から動けなかった。|{a}は{c}のために残しておいた水筒を、黙って地面に置いた。もう渡す相手はいなかった。|{c}の名前が読み上げられたとき、{a}は声も出さずに膝をついた。この島で生き延びる意味が、一つ消えた。');
var GRUDGE_LOST=L('{a}は定時放送で{c}の名前を聞いた。自分の手で終わらせるはずだった相手だった。{a}は握りしめた武器の置き場所を、しばらく見つけられなかった。|{c}の死を知った{a}は、声を立てずに笑った。笑いはすぐに途切れた。憎しみだけが、行き場をなくして残った。|{a}は{c}の名前が読み上げられたあと、長いあいだ空を睨んでいた。奪われたのは命ではなく、自分の復讐だった。');
var MOT_END={
home:L('{a}はそのまま家へ帰った。玄関の扉を開けて、待っていた人の顔を見たとき、ようやく声を上げて泣いた。|{a}は約束の日に間に合った。島で何があったのかは、まだ誰にも話せていない。|{a}が最初にしたのは、家に電話をかけることだった。受話器の向こうの声を聞いただけで、膝から力が抜けた。'),
guardOk:L('{a}は隣にいる{c}の横顔を見た。守ると決めたものは、まだそこにあった。|{a}は{c}の肩に、自分の上着をかけた。この島で一度も手放さなかったものが、ようやく安心して眠っていた。|{a}は{c}の名前を一度だけ呼んだ。返事があることが、今はそれだけで十分だった。'),
guardLost:L('{a}は、守れなかった{c}の分まで生きると決めた。そう決めなければ、立っていられなかった。|{a}は{c}の形見を、胸のポケットにしまった。守ると誓った相手は、もう隣にいなかった。|{a}は島を振り返らなかった。{c}を置いてきた場所を、見てしまえば歩けなくなる気がした。'),
grudgeDone:L('{a}の復讐は終わった。胸に残ったのは晴れやかさではなく、ひどく静かな空洞だった。|{a}は、憎んでいた相手がいない世界に戻っていった。憎しみの抜けた場所を、何で埋めればいいのか分からなかった。|{a}は二度と、{c}の名前を口にしなかった。'),
grudgeLost:L('{a}が憎んだ{c}は、ほかの誰かの手で死んだ。{a}の憎しみは、行き場をなくしたまま残った。|{a}は最後まで、{c}を自分の手で裁けなかった。それでよかったのかどうか、{a}にはまだ分からない。|島を出ても、{a}は時々{c}の名前を思い出した。憎む相手がいないことに、なかなか慣れなかった。'),
grudgeAlive:L('{a}は最後まで、{c}を手にかけなかった。その理由を、{a}は自分でもうまく言えなかった。|{a}は、{c}の名前を最後まで口にしなかった。殺すことも、許すこともできないまま、ゲームは終わった。|{a}の憎しみは、島を出ても消えなかった。けれど、{c}を殺さなかった自分のことは、少しだけ許せそうだった。'),
grudgeHost:L('{a}は島を出たその足で、ゲームの主催者のことを調べ始めた。奪われたものを取り返す旅は、まだ終わっていない。|{a}は迎えの船の操縦席を、じっと見ていた。あの向こうに、主催者に繋がる道がある。|{a}は自分の首輪を、捨てずに持ち帰った。いつか、これを作った人間の前に置くために。'),
rebel:L('{a}は外した首輪を、証拠として持ち帰った。主催者に一矢報いるのは、これからだった。|{a}は島の地図を、最後まで手放さなかった。そこに書き込んだ配電の線が、いつか主催者に届く気がした。|{a}は迎えの船の上で、監視カメラのレンズに向かって、黙って中指を立てた。'),
prize:L('{a}は賞品を受け取った。望んだものは手に入った。それなのに、思っていたほど嬉しくはなかった。|{a}は手に入れたものを、帰りの船の上で何度も確かめた。そのたびに、島で見た顔が一つずつ浮かんだ。|{a}は賞品の書かれた紙を握りしめた。払った代わりのものが何だったのか、{a}はまだ数えられずにいた。'),
atone:L('{a}は生き残ってしまった。償いの続きは、島の外でするしかなかった。|{a}は帰りの船で、島で助けられなかった人の名前を一つずつ書き出した。それが、{a}の次の荷物になった。|死に場所を探していたはずの{a}は、生きて島を出た。その意味を、{a}はこれから考え続けることになる。'),
none:L('{a}は、ただ巻き込まれただけだった。それでも、島で起きたことは一生、{a}のものになった。|{a}は迎えの船の上で、ようやく自分が何に巻き込まれていたのかを考え始めた。|{a}にとって、このゲームに理由はなかった。理由のないまま失ったものの重さだけが、手に残った。')
};
var LURES=[
{id:'prize',label:'優勝の賞品',fit:function(c){return c.tr.cold*0.4+c.tr.fc*0.3+(motK(c,'prize')?0.6:0);},texts:[
'放送：「優勝した方には、望みを一つ、何でも叶えて差し上げます」',
'放送：「本日の優勝賞金を発表します。……桁を数えるのは、生き残ってからにしてください」',
'放送：「生きて帰った方には、借金も、罪も、過去も、すべて消して差し上げます」'],
react:L('{a}は放送が終わってからも、スピーカーを見上げたままだった。望みを一つ。その言葉が、頭から離れなかった。|{a}は武器を握る手に、知らず力を込めていた。叶えたい望みなら、いくらでもあった。|{a}は小さく笑った。笑ったあとで、自分が何を考えたのかに気づいて、顔をこわばらせた。')},
{id:'hostage',label:'外の人質',fit:function(c){return c.tr.np*0.5+c.tr.ac*0.3+(motK(c,'home')?0.6:0);},texts:[
'放送のスピーカーから、聞き覚えのある声が流れた。外にいる誰かの家族の声だった。「早く帰ってきて」――声は、そこで途切れた。',
'島のあちこちの掲示板に、参加者の家族の写真が一枚ずつ貼り出された。写真の下には「優勝できなければ」とだけ書かれていた。',
'放送：「皆様のご家族には、まだ何もお知らせしていません。知らせるかどうかは、明日の結果次第です」'],
react:L('{a}は耳を塞いだ。それでも、さっきの声は頭の中で鳴り続けた。|{a}は掲示板の前で立ち尽くした。写真の中の顔は、何も知らずに笑っていた。|{a}は震える手で首輪に触れた。帰らなければならない理由が、急に重くのしかかった。')},
{id:'expose',label:'秘密の暴露',fit:function(c){return c.tr.jealous*0.5+c.tr.aggr*0.3+(motK(c,'grudge')?0.5:0);},texts:[
'放送：「この島には、あなたの大切な人を傷つけた方が参加しています。どなたかは、ご自分でお確かめください」',
'放送のあと、参加者全員の過去の罪が一行ずつ読み上げられた。名前だけは伏せられていた。',
'放送：「参加者の中に、昔あなたを裏切った方がいます。ヒントは、その方が今、一番あなたに優しいことです」'],
react:L('{a}は名簿を取り出し、一人ずつ顔を思い浮かべた。誰でもあり得る気がした。|{a}は放送のあと、隣にいる人の横顔から目が離せなくなった。|{a}は小さく舌打ちした。主催者の思うつぼだと分かっていても、疑う気持ちは止められなかった。')},
{id:'bounty',label:'倒した数の褒美',fit:function(c){return c.tr.aggr*0.6+c.tr.cold*0.3;},texts:[
'放送：「本日より、一人倒すごとに、次の禁止エリアを一つ先にお知らせします」',
'放送：「首輪を一つ持ってきた方には、食料と水を一日分差し上げます。どうやって外したかは問いません」',
'放送：「本日もっとも多く倒した方の武器を、明朝、拳銃と取り替えて差し上げます」'],
react:L('{a}は自分の武器を見下ろした。拳銃なら、と一瞬だけ考えた。|{a}は残りの水の量を確かめて、唇を噛んだ。一日分の水は、今の{a}には重すぎる誘いだった。|{a}は放送を聞き流そうとした。けれど、指先はもう武器の握りを探していた。')},
{id:'nopact',label:'同盟への揺さぶり',fit:function(c){return c.tr.caution*0.4+c.tr.cold*0.3;},texts:[
'放送：「手を組んでいる皆様へ。明日の朝、相手より先に起きた方だけに、ささやかな贈り物をご用意しています」',
'放送：「二人組で行動している方々。どちらか一人の首輪だけを、外して差し上げてもかまいませんよ」',
'放送：「仲間を信じるのは素敵なことです。その仲間が昨夜どこにいたのか、ご存じなら」'],
react:L('{a}は隣で眠る仲間の寝顔を、長いあいだ見ていた。眠ったふりかもしれない、と一度でも思ってしまった自分が嫌だった。|{a}は見張りの交代の時間を、黙って一時間早めた。|{a}は仲間に背中を向けて眠れなくなった。誰も、何も言わなかった。')},
{id:'mercy',label:'殺さない者への罰',fit:function(c){return(c.goal&&c.goal.id==='nokill'?0.6:0)+c.tr.np*0.3+c.tr.caution*0.2;},texts:[
'放送：「最後まで誰も手にかけなかった方は、たとえ残っても優勝とは認めません」',
'放送：「本日、誰も倒さなかった方の首輪の制限時間を、一時間ずつ短くしました」',
'放送：「隠れているだけの方へ。次の禁止エリアは、あなたの隠れ場所です」'],
react:L('{a}は膝を抱えたまま、首輪の冷たさを確かめた。誰も殺さないと決めたことが、急に頼りなく思えた。|{a}は隠れ場所を出るべきか、長いあいだ迷っていた。|{a}は放送を聞いて、手のひらに爪を立てた。それでも、殺すとは決めなかった。')}
];
var STROLL={
find:L('{a}はあてもなく浜辺を歩いていて、打ち上げられた木箱を見つけた。中には包帯と缶詰が入っていた。|{a}は気の向くまま林道を歩き、誰かが落としていった水のボトルを拾った。|{a}はふらりと入った民家の台所で、まだ食べられそうなパンを見つけた。'),
weapon:L('{a}はあてもなく歩くうちに、廃屋の床下で{w}を見つけた。|{a}がなんとなく覗いた用具小屋の棚に、{w}が置き忘れられていた。|{a}は気まぐれに登った見張り台の上で、{w}を拾った。'),
near:L('{a}はぼんやり歩いているうちに、禁止エリアの境目まで来ていた。首輪が短く鳴って、{a}は慌てて引き返した。|{a}は道に迷い、同じ岬を三度も通り過ぎた。遠くで銃声がしても、あまり気にしていないようだった。|{a}が鼻歌まじりに歩いていた小道の先に、さっきまで誰かが争っていた跡があった。{a}は少しだけ足を速めた。'),
meet:L('{a}は散歩でもするような足取りで、{b}が隠れていた小屋の前を通りかかった。{b}が身構えると、{a}は「あ、こんにちは｜ああ、どうも｜あ、どうも。お邪魔しています」と頭を下げた。|{a}はふらふらと歩いているうちに、{b}と鉢合わせた。{b}が武器を向けても、{a}はきょとんとしていた。毒気を抜かれた{b}は、黙って道を譲った。|{a}が何気なく覗いた木陰に、{b}がうずくまっていた。二人はしばらく見つめ合い、それから{a}は持っていた飴を一つ置いていった。')
};
var MAD={
start:L('{a}は開始の合図を聞いた瞬間から、まともではなかった。歯の根が合わず、誰かが近づくたびに悲鳴を上げた。|{a}は渡された{wa}を胸に抱えたまま、ぶつぶつと同じ言葉を繰り返していた。誰の声も、もう届いていないようだった。|教室を飛び出した{a}は、出口とは逆の方向へ走っていった。笑っているのか泣いているのか、遠目には分からなかった。'),
snap:L('{a}の中で、何かが音を立てて切れた。{a}は意味の分からない言葉を叫びながら、森の中へ駆け出した。|{a}は急に笑い出した。笑いながら、手にした{wa}を誰もいない茂みに向かって振り回し続けた。|{a}「来ないで。来ないで、来ないで｜来るな。来るな、来るな｜来ないでください。来ないで、来ないで」――誰もいない木立に向かって、{a}は叫び続けた。何が見えているのか、{a}自身にも分からなかった。'),
frenzy:L('茂みから飛び出した{a}が、意味をなさない叫び声とともに{b}へ{wa}を振り下ろした。|{a}は{b}を見て、まるで別の誰かを見たように顔を歪めた。{a}「あなたのせいだ｜あなたのせいだ｜あなたのせいです」――そう叫ぶなり、{a}は飛びかかった。|{a}は笑いながら{b}に近づいてきた。目の焦点が合っていなかった。{b}が後ずさるより早く、{wa}が振り上げられた。'),
frenzyAlly:L('{a}は、さっきまで背中を預けていた{b}にさえ、{wa}を向けた。{b}の呼ぶ声は、もう{a}には届いていなかった。|{a}は見張りの交代に来た{b}を、敵と見間違えた。いや、もう見分けがついていなかった。|{b}が差し出した水を、{a}は払いのけた。次の瞬間、{a}は{wa}を握って{b}に向き直っていた。'),
hallu:L('{b}は、木の幹に向かって楽しそうに話しかけている{a}を見つけた。相手は、もうこの島にいない誰かのようだった。{b}は声をかけられないまま、その場を離れた。|{a}は崖の縁を、綱渡りのように両手を広げて歩いていた。{b}が名前を呼んでも、{a}は振り向かなかった。|{a}は拾い集めた首輪の部品を地面に並べ、何かの儀式のように並べ替えていた。{b}はそれを遠くから見て、息を殺して通り過ぎた。'),
calm:L('{a}は暴れる{b}を、背中から押さえ込んだ。何度も名前を呼んだ。やがて{b}の体から力が抜け、{b}は子どものように泣き出した。|{a}は{b}の前にしゃがみ、ゆっくり話しかけた。{a}「大丈夫。ここにいる。もう誰も来ない｜大丈夫だ。ここにいる。もう誰も来ない｜大丈夫です。ここにいます。もう誰も来ません」――{b}の目に、少しずつ焦点が戻っていった。|{a}は{b}の手から{wb}をそっと取り上げ、代わりに水筒を持たせた。{b}は水を一口飲んで、ようやく自分がどこにいるのかを思い出したようだった。'),
back:L('{a}は長い悪夢から覚めたように、何度も瞬きをした。自分の手の汚れを見て、{a}は震え出した。|{a}はようやく、自分の名前を思い出したような顔をした。何をしていたのかは、怖くて誰にも聞けなかった。|{a}の呼吸が、少しずつ落ち着いていった。正気に戻った{a}が最初に口にしたのは、謝る言葉だった。')
};
var GRUDGE={
lead:L('{a}はついに{b}を見つけた。何年も胸の中で燻っていたものが、一度に燃え上がった。|{a}は{b}の前に立ちはだかった。{a}「ずっと、この時を待っていた｜ずっと、この時を待っていた｜ずっと、この時を待っていました」|{a}は{b}の退路を塞ぐように回り込んだ。言葉はいらなかった。互いに、相手が何をしに来たのか分かっていた。'),
lh:L('{a}は{b}を見つけた。憎くて仕方がないはずなのに、その顔を見た瞬間、{a}の足が一瞬止まった。それでも、{a}は{wa}を構えた。|{a}「あなたを終わらせるのは、私だけ｜あなたを終わらせるのは、私だけだ｜あなたを終わらせるのは、私だけです」――{a}は泣きそうな顔で、{b}に{wa}を向けた。|{a}は{b}の名前を呼んだ。振り向いた{b}に、{a}は{wa}を向けた。誰にも渡したくなかった。殺すのも、自分でなければ嫌だった。'),
spare:L('{a}は{b}に{wa}を突きつけた。けれど、どうしても最後の一歩が踏み出せなかった。{a}は武器を下ろし、{b}に背を向けた。|{a}は{b}を追い詰めた。それなのに、手が動かなかった。憎んでいる相手でも殺さないと、ずっと前に決めていたことを、{a}は思い出した。|{a}は{b}に{wa}を向けたまま、長いあいだ動かなかった。{a}「……あなたのために、私が汚れることはない｜……あなたのために、私が汚れることはない｜……あなたのために、私が汚れることはありません」'),
done:L('終わった。{a}の胸に残ったのは、思っていたような晴れやかさではなく、ひどく静かな空洞だった。|{a}は長いあいだ、その場から動けなかった。憎しみを向ける相手は、もうどこにもいなかった。|{a}は武器を取り落とした。復讐を果たしたら自分はどうするつもりだったのか、{a}には思い出せなかった。'),
none:L('{a}は憎むべき相手を探して、名簿を見直した。けれど、殺したいほど憎い顔はそこになかった。行き場のない殺気だけが、{a}の中に残った。|{a}は誰かを憎もうとした。そうでもしなければ、この島で正気を保てなかった。けれど、憎める相手は見つからなかった。')
};
var GIVEUP={
give:L('{a}は自分の{wa}を、{b}の手に押しつけた。{a}「私はもういい。あなたが使って｜私はもういい。あなたが使え｜私はもういいです。あなたが使ってください」|{a}は{b}の荷物の上に、黙って自分の{wa}を置いていった。{b}が気づいたときには、{a}の姿はもうなかった。|{a}は{b}に{wa}を渡し、代わりに何も受け取らなかった。{a}「生き残るなら、あなたの方がいい｜生き残るなら、あなたの方がいい｜生き残るなら、あなたの方がいいです」'),
toss:L('{a}は{wa}を海へ投げ捨てた。もう、誰とも戦うつもりはなかった。|{a}は{wa}を木の根元に置いたまま、歩き去った。振り返りもしなかった。'),
void:L('{a}は灯台の下に座り込み、波の音を聞いていた。隠れようともしなかった。誰かが来たら、それで終わりでいいと思っていた。|{a}は支給品の紙に、短い手紙を書いた。宛名は書かなかった。書き終えると、{a}は手紙を石の下に挟んだ。|{a}は禁止エリアの境目に立ったまま、しばらく動かなかった。一歩踏み出せば、首輪が鳴る。{a}はゆっくりと後ろへ下がった。まだ、その時ではなかった。'),
relive:L('{a}は{b}の前に座り込み、まっすぐ目を見た。{a}「勝手に終わらせないで。私はまだ、あなたと話したいことがある｜勝手に終わらせるな。私はまだ、あなたと話したいことがある｜勝手に終わらせないでください。私はまだ、あなたと話したいことがあります」――{b}は長いあいだ黙っていたが、やがて小さく頷いた。|{a}は自分の食料を半分に割って、{b}に差し出した。{b}が首を振っても、{a}は手を引かなかった。根負けした{b}が一口かじったとき、少しだけ顔に色が戻った。|{a}は{b}に、島を出たら何をしたいかを尋ねた。{b}は答えられなかった。{a}は自分の答えを先に話した。最後まで聞いた{b}は、小さな声で一つだけ答えた。')
};
function lureTurn(ctx){
var str=(ctx.env.lure||0)/100,P=ctx.present(),rng=ctx.rng;
if(!str||P.length<2||rng()>0.25+str*0.65)return;
var allied0=P.some(function(a){return P.some(function(b){return a!==b&&allied(ctx,a,b);});});
var lu=HK.weighted(rng,LURES,function(x){return(x.id==='nopact'&& !allied0?0:1)*(ctx.flags.lastLure===x.id?0.3:1);});
if(!lu)return;
ctx.flags.lastLure=lu.id;ctx.flags.lures=(ctx.flags.lures||0)+1;
ctx.incident(ctx.pick(lu.texts));
var hit=ctx.most(P,function(c){return lu.fit(c)+c.stress/300;});
P.forEach(function(c){
var f=Math.max(0,lu.fit(c));
ctx.stress(c,f*10*str);
if(lu.id==='prize'||lu.id==='bounty'||lu.id==='mercy')c.flags.lure=(c.flags.lure||0)+f*str;
if(HK.Emo)HK.Emo.bump(ctx,c,lu.id==='hostage'?{fear:6+f*10}:lu.id==='expose'?{anger:4+f*8}:{fear:3});
});
if(lu.id==='nopact')P.forEach(function(a){P.forEach(function(b){if(a.i<b.i&&allied(ctx,a,b))ctx.mod2(a,b,{ten:6*str+2,trust: -5*str},{ten:6*str+2,trust: -5*str});});});
if(lu.id==='expose'&&hit&&hit.flags.grudge==null&&rng()<0.5*HK.Dark.f(ctx,'grudge')){
var h=hateTarget(ctx,hit,25);
if(h&&h.alive&& !h.out){hit.flags.grudge=h.i;if(hit.flags.revenge==null)hit.flags.revenge=h.i;}
}
if(hit)ctx.act2({actors:[hit],cat:'solo',text:ctx.t(ctx.pick(lu.react),hit),why:'主催者の揺さぶり「'+lu.label+'」が、'+hit.name+'に刺さった（'+(hit.motive?'動機：'+MOT_LABEL[hit.motive]:'気質')+'）'+(hit.flags.grudge!=null&&lu.id==='expose'?'。'+ctx.chars[hit.flags.grudge].name+'への憎しみが、殺意に変わった':'')});
}
function motiveIntro(ctx){
var P=ctx.present().filter(function(c){return c.motive&&c.motive!=='none'&& !mad(c);});
var k=Math.min(P.length,ctx.chars.length>12?4:3);
var list=ctx.rng.shuffle(P).sort(function(x,y){return(x.motiveAuto?1:0)-(y.motiveAuto?1:0);}).slice(0,k);
list.forEach(function(c){
var key=c.motive==='grudge'&& !grudgeOf(ctx,c)?'grudgeHost':c.motive,o=c.motive==='guard'?guardOf(ctx,c):c.motive==='grudge'?grudgeOf(ctx,c):null;
if(!MOT_INTRO[key])return;
ctx.act2({actors:[c],cat:'solo',text:ctx.t(ctx.pick(MOT_INTRO[key]),c,null,o),why:c.name+'の動機：'+MOT_LABEL[c.motive]+(o?'（'+o.name+'）':'')+(c.motiveAuto?'（気質と関係から）':'')});
});
}
function motiveLoss(ctx){
ctx.present().forEach(function(c){
var g=guardOf(ctx,c);
if(g&& !g.alive&& !c.flags.guardLost){
c.flags.guardLost=true;ctx.stress(c,18);
var kk=g.killedBy!=null?ctx.chars[g.killedBy]:null;
ctx.act2({actors:[c],cat:'solo',text:ctx.t(ctx.pick(GUARD_LOST),c,null,g),why:c.name+'の動機（守りたい人：'+g.name+'）を失った'+(kk&&kk.alive&&kk!==c?'。'+kk.name+'への憎しみが残った':'')});
if(kk&&kk.alive&&kk!==c&&c.flags.grudge==null&&ctx.rng()<0.6*HK.Dark.f(ctx,'grudge')){c.flags.grudge=kk.i;c.flags.revenge=kk.i;}
}
var h=grudgeOf(ctx,c);
if(h&& !h.alive&&h.killedBy!==c.i&& !c.flags.grudgeLost){
c.flags.grudgeLost=true;
ctx.act2({actors:[c],cat:'solo',text:ctx.t(ctx.pick(GRUDGE_LOST),c,null,h),why:c.name+'が憎んでいた'+h.name+'は、ほかの手で亡くなった'});
}
});
}
function madTurn(ctx,s){
var rng=ctx.rng;
ctx.present().forEach(function(c){
if(mad(c)){
c.flags.brMad.lv-=6+c.tr.a*8;
if(c.flags.brMad.lv<=0&&s-c.flags.brMad.at>=2&&rng()<0.4){
c.flags.brMad=null;c.flags.madBack=true;c.stress=HK.clamp(c.stress-20,0,100);
ctx.act2({actors:[c],cat:'solo',text:ctx.t(ctx.pick(MAD.back),c),why:c.name+'の錯乱が治まった（A '+Math.round(c.eg.A)+'）'});
}
return;
}
if(c.flags.madBack||s===0)return;
var e=c.emo||{},edge=c.stress>=92&&((e.fear||0)>=55||(e.grief||0)>=60);
if(!edge||rng()>0.09*HK.Dark.f(ctx,'madness')*(0.5+c.tr.ac*0.8))return;
c.flags.brMad={at:s,lv:40+c.tr.ac*30};
if(HK.Emo)HK.Emo.bump(ctx,c,{fear:30,anger:15},'錯乱');
ctx.act2({actors:[c],cat:'solo',mag:20,text:ctx.t(ctx.pick(MAD.snap),c),why:c.name+'の心が限界を越えた（負担 '+Math.round(c.stress)+'・気分：'+((e.fear||0)>=55?'恐れ '+Math.round(e.fear):'悲しみ '+Math.round(e.grief))+'・'+HK.Dark.tag(ctx,'madness')+'）'});
});
}
function willKill2(c){return willKill(c)*(1+Math.min(0.5,(c.flags.lure||0)*0.25))*(motK(c,'prize')?1.2:1)*(motK(c,'atone')||motK(c,'rebel')?0.75:1)*(despair(c)?0.3:1);}
function motiveEnd(ctx,c){
var m=c.motive,g=guardOf(ctx,c),h=grudgeOf(ctx,c),key=m,o=null;
if(!m)return'';
if(m==='guard'){key=g&&g.alive?(!!g.out=== !!c.out?'guardOk':''):'guardLost';o=g;}
else if(m==='grudge'||(c.action&&c.action.id==='revenge'&&h&& !h.alive&&h.killedBy===c.i)){if(!h)key='grudgeHost';else{o=h;key=h.alive?'grudgeAlive':h.killedBy===c.i?'grudgeDone':'grudgeLost';}}
if(!MOT_END[key])return'';
return ctx.t(ctx.pick(MOT_END[key]),c,null,o);
}
add({
id:'br',name:'バトルロワイヤル',kicker:'デスゲーム',zenreiOnly:true,
killMain:true,
desc:'首輪をつけられ、ランダムな武器を一つ渡される。最後の一人だけが帰れる。',
note:'※映画『バトル・ロワイアル』のパロディです。',
unit:'時間帯',preRel:2,lethal:true,
derived:['caution','aggr','cold','warmth'],
exclude:['lighten','tease','compliment','take_charge','apologize'],
catBias:{combat:1.2},
env:[
{id:'days',label:'制限日数',min:1,max:6,def:4,lo:'1日',hi:'6日',unit:'日',desc:'大人数ほど決着に日数がかかる（30人なら4日以上が目安）'},
{id:'zone',label:'禁止エリアの進行',min:0,max:100,def:50,lo:'ゆっくり',hi:'急速',desc:'速いほど後半に遭遇・戦闘が増える'},
{id:'gap',label:'支給武器の格差',min:0,max:100,def:60,lo:'均等',hi:'当たり外れ大'},
{id:'timeout',label:'時間切れ',type:'select',def:'boom',options:[{v:'boom',label:'生存者全員の首輪が爆発'},{v:'home',label:'生存者は全員帰還'}]},
{id:'lure',label:'主催者の揺さぶり',min:0,max:100,def:0,lo:'なし',hi:'毎回',desc:'定時放送のたびに、主催者が「動機」を配る多さ（優勝の賞品・外の人質・秘密の暴露・倒した数の褒美・同盟への揺さぶり・殺さない者への罰）。0 なら配らない。刺さった人ほど追い詰められ、殺し合いに踏み出しやすくなる'}
],
stats:[
{id:'hp',label:'体力',desc:'戦闘力と耐久'},
{id:'agi',label:'運動神経',desc:'戦闘力と逃げ足'}
],
weapons:true,maxCast:30,
perFields:(HK.DGK?[HK.DGK.LIFE]:[]).concat([MOT_FIELD]),
actions:[
{id:'hide',label:'隠れてやり過ごす',fit:function(t){return t.caution;},bias:{solo:2,combat:0.5}},
{id:'seek',label:'仲間を探す',fit:function(t){return t.warmth;},bias:{bond:1.8,help:1.3}},
{id:'hunt',label:'武器を確かめて狩りに出る',fit:function(t){return t.aggr;},bias:{combat:2}},
{id:'collar',label:'首輪を外す方法を探す',fit:function(t){return t.a*0.7+t.cp*0.3;},bias:{escape:2}},
{id:'freeze',label:'動けずに震えている',fit:function(t){return t.ac*0.7+(1-t.a)*0.3;},bias:{solo:1.6,combat:0.4}},
{id:'wander',label:'適当に歩く',fit:function(t){return(t.fc*0.5+(1-t.caution)*0.4)*0.8;},bias:{solo:1.3,bond:1.1}},
{id:'mad',label:'発狂・錯乱',fit:function(t){return(t.ac*0.4+t.impulse*0.3)*0.6;},bias:{combat:1.3,solo:1.3,bond:0.4}},
{id:'revenge',label:'嫌いな人間を殺す・復讐',fit:function(t){return(t.aggr*0.5+t.jealous*0.4)*0.75;},bias:{combat:1.6,solo:1.1,bond:0.6}},
{id:'despair',label:'自分の命を度外視・諦め',fit:function(t){return(t.ac*0.4+(1-t.fc)*0.3+t.np*0.2)*0.65;},bias:{solo:1.4,help:1.4,combat:0.4}}
],
goals:[
{id:'last',label:'最後の一人になる',fit:function(t){return t.aggr*0.5+t.cold*0.5;},bias:{combat:1.8,betray:1.8,help:0.4}},
{id:'save',label:'誰かを生き残らせる',fit:function(t){return t.np;},bias:{help:2.2,combat:0.7},needsFocus:true},
{id:'nokill',label:'誰も殺さない',fit:function(t){return t.np*0.6+t.ac*0.4;},bias:{combat:0.25,betray:0.2,bond:1.4}},
{id:'rebel',label:'主催者に一矢報いる',fit:function(t){return t.cp*0.5+t.a*0.5;},bias:{escape:2,bond:1.2}},
{id:'meet',label:'好きな人に会いたい',fit:function(t){return t.ac*0.4+t.fc*0.4;},bias:{romance:2,help:1.3},needsFocus:true}
],
steps:function(env){
var s=[],parts=['朝','昼','夕方','夜'];
for(var d=1;d<=env.days;d++)parts.forEach(function(p){s.push(d+'日目・'+p);});
return s;
},
setup:function(ctx){
ctx.place='会場の島';
ctx.flags.plan=0;ctx.flags.deadSeen=0;
var rng=ctx.rng,gap=ctx.env.gap/100;
ctx.chars.forEach(function(c){
var w=null;
if(c.weaponPick&&c.weaponPick!=='random')w=HK.WEAPONS.filter(function(x){return x.id===c.weaponPick;})[0];
if(!w)w=HK.weighted(rng,HK.WEAPONS,function(x){return 1-(1-gap)*Math.abs(x.pow-4.5)/5;});
c.weapon=w;
c.hp=60+ctx.stat(c,'hp')*8;
if(HK.DGK)HK.DGK.init(rng,c,{know:false});
});
setupMotives(ctx);
var TEAM={lover:1,best:1,parent:1,sibling:1,master:1,childhood:1,almost:1};
Object.keys(ctx.ties||{}).forEach(function(k){
var t=ctx.ties[k];
if(TEAM[t.type]||TEAM[(HK.TIES[t.type]||{}).like])ctx.pair(ctx.chars[t.a],ctx.chars[t.b]).allied=true;
});
},
phase:function(ctx,s,n){
var P=ctx.present();
if(s===0)ctx.say({text:'教室のスピーカーがゲームの開始を告げた。'+ctx.chars.map(function(c){return c.name+'「\u2060'+c.weapon.name+'」';}).join('、')+'。'+(HK.Attr&&HK.Attr.raceIntro?HK.Attr.raceIntro(ctx.chars,'alert',ctx):'')});
if(s===0){
P.forEach(function(c){if(c.action.id==='mad'&& !mad(c)){c.flags.brMad={at:0,lv:60+c.tr.ac*30};if(HK.Emo)HK.Emo.bump(ctx,c,{fear:35,anger:10},'錯乱');ctx.act2({actors:[c],cat:'solo',text:ctx.t(ctx.pick(MAD.start),c),why:c.name+'の行動：発狂・錯乱'});}});
motiveIntro(ctx);
}
if(s>0&&s%4===0){
var dead=ctx.chars.filter(function(c){return!c.alive;});
var fresh=dead.slice(ctx.flags.deadSeen);
ctx.flags.deadSeen=dead.length;
ctx.say({text:'定時放送。'+(fresh.length?'死亡者は、'+names(fresh)+'。':'死亡者はいない。')+'残り'+P.length+'名。'});
if(fresh.length&&HK.DGK)P.forEach(function(c){ctx.stress(c,fresh.length*2.5*HK.DGK.drain(c));});
motiveLoss(ctx);
lureTurn(ctx);
}
if(s===n-1&&P.length>1&&ctx.flags.plan>=100){
var crew=P.filter(function(c){return!mad(c)&&(c.goal.id==='rebel'||c.motive==='rebel'||c.action.id==='collar'||P.some(function(o){return o!==c&&(o.goal.id==='rebel')&&allied(ctx,c,o);}));});
if(crew.length){
crew.forEach(function(c){c.out=true;c.fate='脱出';c.fateNote='首輪を外して会場を出た';});
ctx.say({kind:'event',cat:'escape',actors:crew,text:names(crew)+'は首輪の解除に成功した。夜の海へ、ボートが一艘滑り出した。',why:'首輪解除の計画（進捗 '+Math.round(ctx.flags.plan)+'%）',mag:50});
}
}
},
after:function(ctx,s,n){
ctx.present().forEach(function(c){c.stress=HK.clamp(c.stress+(4+ctx.stepIndex*0.4)*(HK.DGK?HK.DGK.drain(c):1)+c.tr.ac*3-c.tr.cold*2,0,100);});
firstKill(ctx);
madTurn(ctx,s);
var P=ctx.present(),rng=ctx.rng;
for(var eg=0;eg<2;eg++)if(P.length>=2&&P.length<=6&&s>=n-4&&rng()<0.45+ctx.env.zone/200){
var x=HK.weighted(rng,P,function(c){return 0.2+c.tr.aggr+(mad(c)?0.6:0);});
var y=rng.pick(P.filter(function(o){return o!==x;}));
if(ctx.pair(x,y).allied&&x.tr.np>0.55&& !mad(x)){
ctx.act2({actors:[x,y],cat:'bond',text:ctx.t('狭まる禁止エリアに追われて、{a}と{b}は最後の安全地帯で背中を合わせた。',x,y),why:'同盟と'+x.name+'のNP'});
}else{
var fr=ctx.fight(x,y,{noEvade:true,lethality:1.3});
ctx.act2({actors:[x,y],cat:'combat',text:ctx.t('禁止エリアが島の大半を覆った。逃げ場をなくした{a}と{b}が、同じ岬で向かい合った。',x,y)+fr.text,why:'終盤の追い込み。'+fr.why});
}
P=ctx.present();
}
if(P.length<6)return;
var cnt=Math.floor((P.length-1)/3*(0.8+s/n*(1+ctx.env.zone/100))+rng());
for(var k=0;k<cnt;k++){
P=ctx.present();
if(P.length<2)break;
var a=HK.weighted(rng,P,function(c){return(0.15+c.tr.aggr*c.tr.aggr+(c.goal.id==='last'?0.5:0)+(mad(c)?0.5:0))*(despair(c)?0.3:1);});
var b=rng.pick(P.filter(function(o){return o!==a&&(!ctx.pair(a,o).allied||mad(a));}));
if(!b)continue;
var tb=HK.Ties?HK.Ties.get(ctx,a,b):null;
var tmod=tb?(tb.type==='enemy'?0.35:tb.type==='rival'?0.15:HK.TIES[tb.type].pol>0? -0.5:0):0;
if(a.tr.aggr+rng()*0.7+s/n*0.2+tmod+(mad(a)?0.4:0)+(a.flags.grudge===b.i?0.4:0)-(despair(a)?0.5:0)-Math.max(0,ctx.R(a,b).aff)/80<0.6){
ctx.act2({actors:[a,b],cat:'solo',fx:function(){ctx.mod2(a,b,{ten:6},{ten:6});},
text:ctx.t(rng.pick(['{a}と{b}は、森の中で鉢合わせた。互いに武器を構えたまま、後ずさりで別れた。','{a}は遠くに{b}の姿を見つけて、気づかれないように道を変えた。','{a}と{b}は廃屋の入り口で目が合い、どちらからともなく背を向けた。']),a,b),why:'遭遇。'+a.name+'に襲う気がなかった'});
continue;
}
var res=ctx.fight(a,b,{lethality:1.4});
ctx.act2({actors:[a,b],cat:'combat',text:ctx.t(rng.pick(['禁止エリアに追い立てられた先で、{a}が{b}に襲いかかった。','{a}は物陰から{b}に{wa}を向けた。','{a}と{b}は、水場で鉢合わせた。先に動いたのは{a}だった。']),a,b)+res.text,why:res.why});
}
},
charNote:function(ctx,c){
if(!c.motive)return'';
var g=c.motive==='guard'?guardOf(ctx,c):null,h=grudgeOf(ctx,c);
var s='動機：'+MOT_LABEL[c.motive]+(g?'（'+g.name+'）':c.motive==='grudge'?(h?'（'+h.name+'）':'（主催者）'):'')+(c.motiveAuto?'（気質と関係から）':'')+'。';
if(h&&c.motive!=='grudge')s+=h.name+'を狙っていた。';
if(c.flags.madBack)s+='一度錯乱し、正気に戻った。';else if(mad(c))s+='錯乱したままだった。';
if(c.action&&c.action.id==='despair')s+=c.flags.relived?'命を投げ出していたが、仲間の言葉で持ち直した。':'自分の命を勘定に入れていなかった。';
return s;
},
end:function(ctx){return ctx.alive().filter(function(c){return!c.out;}).length<=1&&ctx.stepIndex>0;},
finish:function(ctx){
var P=ctx.present();
if(P.length===1&& !ctx.chars.some(function(c){return c.out;})){
P[0].fate='優勝';P[0].fateNote='最後の一人として会場を出た（'+(P[0].flags.kills||0)+'人を手にかけた）';
ctx.flags.outcome=P[0].name+'の優勝';
}else if(P.length>1){
if(ctx.env.timeout==='boom'){
ctx.say({text:'時間切れ。生き残っていた'+names(P)+'の首輪が、同時に鳴った。'});
P.forEach(function(c){c.alive=false;c.fate='死亡';c.fateNote='時間切れで首輪が作動した';});
}else P.forEach(function(c){c.fate='生還';c.fateNote='時間切れまで生き延びた';});
}
closing(ctx,P);
},
events:[
{
id:'hunt',cat:'combat',scope:'pair',
when:function(ctx,a,b){return!allied(ctx,a,b);},
w:function(ctx,a,b){
var enc=0.35+ctx.stepIndex/12*(0.3+ctx.env.zone/100);
var r=R(ctx,a,b);
var gr=a.flags.grudge===b.i?(1.2+(a.action.id==='revenge'?0.8:0))*HK.Dark.f(ctx,'grudge'):0;
return enc*(a.tr.aggr*1.1+r.ten/80-Math.max(0,r.aff)/70+(a.flags.revenge===b.i&&a.flags.grudge!==b.i?1.5:0)+gr)*(0.5+(a.weapon.pow/9))*willKill2(a);
},
run:function(ctx,a,b){
var gr=a.flags.grudge===b.i,lh=gr&&HK.LoveHate&&HK.LoveHate.has&&HK.LoveHate.has(ctx,a,b);
if(gr&&HK.Attr&&HK.Attr.noKillPair&&HK.Attr.noKillPair(a,b)){
ctx.mod2(a,b,{ten:10},{ten:20,trust: -20});a.flags.grudgeSpared=true;
return{cat:'conflict',text:ctx.t(ctx.pick(GRUDGE.spare),a,b),why:a.name+'は'+b.name+'を憎んでいたが、殺さない相手だと決めていた'};
}
var res=ctx.fight(a,b,despair(b)?{noEvade:true}:null);
var lead=gr?ctx.t(ctx.pick(lh?GRUDGE.lh:GRUDGE.lead),a,b):a.flags.revenge===b.i?ctx.t('{a}は{b}を見つけた。仇だった。',a,b):ctx.t('{a}が{wa}を構えて{b}に襲いかかった。',a,b);
if(despair(b)&& !res.escaped)lead+=ctx.t('{b}は逃げなかった。',a,b);
var tail=gr&&res.killed&&res.winner===a?ctx.t(ctx.pick(GRUDGE.done),a,b):'';
return{mag:gr?20:0,text:lead+res.text+tail,why:res.why+(gr?'／'+(lh?'愛憎の相手への':'')+'憎しみ（'+Math.round(hateScore(ctx,a,b))+'・'+HK.Dark.tag(ctx,'grudge')+'）':a.flags.revenge===b.i?'／復讐':'')+(despair(b)?'／'+b.name+'は命を投げ出していた':'')};
}
},
{
id:'ambush',cat:'combat',scope:'pair',
when:function(ctx,a,b){return!allied(ctx,a,b)&&ctx.stepIndex>1;},
w:function(ctx,a){return mad(a)||despair(a)?0:a.tr.a*a.tr.aggr*1.3*(a.weapon.pow>4?1:0.4)*willKill2(a);},
run:function(ctx,a,b){
var res=ctx.fight(a,b,{ambush:true});
return{text:ctx.t('{a}は物陰で{b}が通り過ぎるのを待った。',a,b)+res.text,why:a.name+'のA×攻撃性（待ち伏せ）。'+res.why};
}
},
{
id:'ally',cat:'bond',scope:'pair',
when:function(ctx,a,b){return!allied(ctx,a,b)&&R(ctx,a,b).ten<45&& !mad(a)&& !mad(b)&&a.flags.grudge!==b.i;},
w:function(ctx,a,b){return(0.3+a.tr.warmth*0.7+Math.max(0,R(ctx,a,b).aff)/60+(a.flags.guardOf===b.i?1.2:0))*(motK(a,'prize')?0.6:1);},
run:function(ctx,a,b){
var rb=R(ctx,b,a);
if(b.tr.caution>0.6&&rb.trust<15&&ctx.rng()<0.6){
ctx.mod2(a,b,{aff: -3},{ten:10});
return{cat:'solo',text:ctx.t('{a}が「味方だ」と声をかけた。{b}は{wb}を向けたまま後ずさり、姿を消した。',a,b),why:b.name+'の慎重さ（'+Math.round(b.tr.caution*100)+'）が信じることを拒んだ'};
}
ctx.pair(a,b).allied=true;
ctx.mod2(a,b,{trust:22,aff:8},{trust:18,aff:8});
return{text:ctx.t('{a}と{b}は手を組んだ。交代で見張りをすることにした。',a,b),why:a.name+'の人懐こさ'+(rb.aff>20?'、元々の好意':'')};
}
},
{
id:'betrayal',cat:'betray',scope:'pair',
when:function(ctx,a,b){return allied(ctx,a,b)&&ctx.present().length<=4&& !mad(a)&&a.flags.guardOf!==b.i;},
w:function(ctx,a,b){return((a.tr.cold*0.7+a.tr.aggr*0.4+(a.goal.id==='last'?0.9:0)+(motK(a,'prize')?0.5:0)+(a.flags.lure||0)*0.2)-Math.max(0,R(ctx,a,b).aff)/50)*willKill2(a);},
run:function(ctx,a,b){
ctx.pair(a,b).allied=false;
ctx.mod(b,a,{trust: -80,ten:40});
var res;
if(a.weapon.sp==='poison'){
if(ctx.rng()<0.7){ctx.kill(b,a,'水筒の水に毒が入っていた',{force:true});res={text:''};}
else res={text:b.name+'は一口目で異変に気づき、水を吐き出した。'};
return{mag:40,text:ctx.t('{a}は{b}の水筒に、小瓶の中身を落とした。',a,b)+res.text,why:a.name+'のドライさと目標「'+a.goal.label+'」'};
}
res=ctx.fight(a,b,{ambush:true,noEvade:true,canSpare:false});
return{mag:30,text:ctx.t('見張りを交代した直後、{a}は背後から{b}に{wa}を向けた。',a,b)+res.text,why:a.name+'のドライさ（'+Math.round(a.tr.cold*100)+'）と目標「'+a.goal.label+'」。'+res.why};
}
},
{
id:'shield',cat:'help',scope:'pair',
when:function(ctx,a,b){return(allied(ctx,a,b)||R(ctx,a,b).aff>40||a.flags.guardOf===b.i||despair(a))&&b.hp<70&& !mad(a);},
w:function(ctx,a,b){return a.tr.np*1.2+(a.focus===b?1.5:0)+(a.flags.guardOf===b.i?1.5:0)+(motK(a,'atone')?0.8:0)+(despair(a)?1:0);},
run:function(ctx,a,b){
var dmg=15+ctx.rng()*20;
a.hp-=dmg;
ctx.mod2(a,b,{aff:8},{aff:20,trust:25,att:8});
var dead=a.hp<=0;
if(dead)ctx.kill(a,null,b.name+'をかばって');
return{mag:25,text:ctx.t('{b}を狙った一撃の前に、{a}が割って入った。',a,b)+(dead?'':'（残り体力 '+Math.round(a.hp)+'）'),why:a.name+'のNP（'+Math.round(a.eg.NP)+'）'+(a.focus===b?'。'+b.name+'を生き残らせると決めていた':'')};
}
},
{
id:'hide',cat:'solo',scope:'solo',
w:function(ctx,a){return mad(a)?0:(0.2+a.tr.caution*0.9)*(motK(a,'home')?1.3:1)*(despair(a)||motK(a,'atone')?0.4:1);},
run:function(ctx,a){
ctx.stress(a,5);a.hp=Math.min(100,a.hp+4);
return{text:ctx.t(ctx.pick(['{a}は民家の押し入れに身を潜めていた。遠くで銃声が二度鳴った。','{a}は灯台の螺旋階段の途中で、息を殺していた。']),a),why:a.name+'の慎重さ（A・AC高、FC低）'};
}
},
{
id:'medic',cat:'help',scope:'pair',
when:function(ctx,a,b){return b.hp<75&&R(ctx,a,b).ten<40&& !mad(a);},
w:function(ctx,a,b){return(a.weapon.sp==='heal'?1.4:0.2)+a.tr.np*0.5+(a.flags.guardOf===b.i?1:0);},
run:function(ctx,a,b){
b.hp=Math.min(100,b.hp+(a.weapon.sp==='heal'?35:12));
ctx.mod2(a,b,{aff:4},{aff:12,trust:15});
return{text:ctx.t(a.weapon.sp==='heal'?'{a}は救急箱を開けて、{b}の傷を縫った。':'{a}は自分のシャツを裂いて{b}の傷を縛った。',a,b),why:a.name+'のNP'+(a.weapon.sp==='heal'?'／支給品が救急箱':'')};
}
},
{
id:'plan',cat:'escape',scope:'solo',
w:function(ctx,a){return mad(a)?0:a.tr.a*0.6*((a.goal.id==='rebel'||a.action.id==='collar'||motK(a,'rebel')||(motK(a,'grudge')&&a.flags.grudge==null))?2.2:0.4);},
run:function(ctx,a){
ctx.flags.plan+=(5+a.tr.a*12+(a.weapon.sp==='radar'?10:0))/Math.max(1,ctx.chars.length/8);
return{text:ctx.t('{a}は首輪の継ぎ目を調べ、分校の配電図を書き起こしていた。（解除計画 '+Math.min(100,Math.round(ctx.flags.plan))+'%）',a),why:a.name+'のA（'+Math.round(a.eg.A)+'）と目標「'+a.goal.label+'」'};
}
},
{
id:'lastwords',cat:'romance',scope:'pair',
when:function(ctx,a,b){return a.hp<40&&R(ctx,a,b).aff>35&& !ctx.pair(a,b).confessed[a.i];},
w:function(ctx,a,b){return 1+R(ctx,a,b).att/40;},
run:function(ctx,a,b){
ctx.pair(a,b).confessed[a.i]=true;
var rb=R(ctx,b,a);
if(rb.aff>30&&HK.canLove(a,b)&&HK.canLove(b,a))ctx.pair(a,b).couple=R(ctx,a,b).att>35&&rb.att>30;
ctx.mod2(a,b,{aff:10,att:10},{aff:15,att:12,trust:10});
return{mag:25,text:ctx.t('血の止まらない腹を押さえたまま、{a}は{b}に言った。「本当は、ずっと――」',a,b),why:'体力 '+Math.round(a.hp)+'。言わずに終わることへの恐れが'+a.name+'の口を開かせた'};
}
},
{
id:'mourn',label:'放送で呼ばれた名前を受け入れられない',cat:'solo',scope:'solo',
when:function(ctx,a){return a.flags.grief!=null&& !a.flags.mourned;},
w:function(){return 2;},
run:function(ctx,a){
a.flags.mourned=true;
var d=ctx.chars[a.flags.grief];
return{with:[d],text:ctx.t('{a}は{c}の名前が呼ばれたことを、まだ受け入れられずにいた。',a,null,d),why:d.name+'への好意（'+Math.round(R(ctx,a,d).aff)+'）'};
}
},
{
id:'br_motive',label:'戦う理由を胸に思い返す',cat:'solo',scope:'solo',noOdd:true,
when:function(ctx,a){return!!a.motive&&a.motive!=='none'&& !mad(a)&&(a.flags.motDay==null||Math.floor(ctx.stepIndex/4)>a.flags.motDay);},
w:function(){return 0.45;},
run:function(ctx,a){
var m=a.motive,o=null,key=m;
if(m==='guard'){o=guardOf(ctx,a);if(!o|| !o.alive)return null;}
if(m==='grudge'){o=grudgeOf(ctx,a);if(!o)key='grudgeHost';else if(!o.alive)return null;}
if(!MOT_THINK[key])return null;
a.flags.motDay=Math.floor(ctx.stepIndex/4);
if(m==='home')a.hp=Math.min(100,a.hp+3);
return{text:ctx.t(ctx.pick(MOT_THINK[key]),a,null,o),why:a.name+'の動機：'+MOT_LABEL[m]+(o?'（'+o.name+'）':'')};
}
},
{
id:'br_stroll',label:'あてもなく歩き回る',cat:'solo',scope:'solo',noOdd:true,
when:function(ctx,a){return a.action.id==='wander'&& !mad(a);},
w:function(){return 1.1;},
run:function(ctx,a){
var rng=ctx.rng,r=rng(),o=ctx.others(a).filter(function(x){return!mad(x);});
if(r<0.3){
var w=HK.WEAPONS[rng.int(HK.WEAPONS.length)];
if(w.pow>a.weapon.pow&&rng()<0.5){a.weapon=w;return{text:fillM(ctx.t(ctx.pick(STROLL.weapon),a),{w:w.name}),why:a.name+'の行動：適当に歩く（拾い物）'};}
a.hp=Math.min(100,a.hp+10);
return{text:ctx.t(ctx.pick(STROLL.find),a),why:a.name+'の行動：適当に歩く（拾い物）'};
}
if(r<0.6&&o.length){
var b=rng.pick(o);
ctx.mod2(a,b,{aff:3},{aff:4,ten: -4});
return{with:[b],cat:'bond',text:ctx.t(ctx.pick(STROLL.meet),a,b),why:a.name+'の行動：適当に歩く。気まぐれな足取りに、'+b.name+'は毒気を抜かれた'};
}
ctx.stress(a,4);
return{text:ctx.t(ctx.pick(STROLL.near),a),why:a.name+'の行動：適当に歩く（FC・慎重さの低さ）'};
}
},
{
id:'br_frenzy',label:'錯乱して周りに襲いかかる',cat:'combat',scope:'pair',dk:'madness',
when:function(ctx,a){return mad(a);},
w:function(){return 1.6;},
run:function(ctx,a,b){
var al=allied(ctx,a,b);
if(ctx.rng()<0.45){ctx.stress(b,6);return{cat:'solo',with:[b],text:ctx.t(ctx.pick(MAD.hallu),a,b),why:a.name+'は錯乱していた（'+HK.Dark.tag(ctx,'madness')+'）'};}
if(al){ctx.pair(a,b).allied=false;ctx.mod(b,a,{trust: -30,ten:25});}
var res=ctx.fight(a,b,{canSpare:false,lethality:HK.Dark.pick(ctx,0.8,1.15,1.35,'madness')});
return{mag:22,text:ctx.t(ctx.pick(al?MAD.frenzyAlly:MAD.frenzy),a,b)+res.text,why:a.name+'は錯乱して、敵と味方の区別がつかなくなっていた。'+res.why};
}
},
{
id:'br_calm',label:'錯乱した仲間をなだめる',cat:'help',scope:'pair',noOdd:true,
when:function(ctx,a,b){return mad(b)&& !mad(a)&&(allied(ctx,a,b)||R(ctx,a,b).aff>25||a.flags.guardOf===b.i);},
w:function(ctx,a,b){return 0.5+a.tr.np*1.2+Math.max(0,R(ctx,a,b).aff)/50;},
run:function(ctx,a,b){
b.flags.brMad.lv-=25+a.tr.np*20;
ctx.mod2(a,b,{aff:4},{aff:10,trust:12});ctx.stress(b,-10);
var back=b.flags.brMad.lv<=0&&ctx.rng()<0.7;
if(back){b.flags.brMad=null;b.flags.madBack=true;}
return{mag:14,text:ctx.t(ctx.pick(MAD.calm),a,b)+(back?ctx.t(ctx.pick(MAD.back),b):''),why:a.name+'のNP（'+Math.round(a.eg.NP)+'）。錯乱した'+b.name+'を落ち着かせた'+(back?'（正気に戻った）':'')};
}
},
{
id:'br_grudge',label:'恨む相手を追う',cat:'solo',scope:'solo',noOdd:true,
when:function(ctx,a){
if(mad(a)||a.flags.grudgeLost)return false;
var h=grudgeOf(ctx,a);
if(h)return h.alive&& !h.out&& !a.flags.grudgeSpared&&ctx.stepIndex-(a.flags.grAt==null? -9:a.flags.grAt)>=3;
return a.action.id==='revenge'&& !a.flags.grNone;
},
w:function(ctx){return 0.8*HK.Dark.f(ctx,'grudge');},
run:function(ctx,a){
var h=grudgeOf(ctx,a);
a.flags.grAt=ctx.stepIndex;
if(!h){a.flags.grNone=true;a.tr.aggr=Math.min(1,a.tr.aggr+0.1);return{text:ctx.t(ctx.pick(GRUDGE.none),a),why:a.name+'の行動：嫌いな人間を殺す（この島には、殺したいほど憎い相手がいなかった）'};}
return{text:ctx.t(ctx.pick(MOT_THINK.grudge),a,null,h),why:a.name+'は'+h.name+'を狙っている（憎しみ '+Math.round(hateScore(ctx,a,h))+'）'};
}
},
{
id:'br_giveup',label:'絶望して生きるのを諦めかける',cat:'solo',scope:'solo',noOdd:true,
when:function(ctx,a){return despair(a)&& !mad(a)&&(ctx.stepIndex-(a.flags.guAt==null? -9:a.flags.guAt)>=2);},
w:function(){return 0.9;},
run:function(ctx,a){
a.flags.guAt=ctx.stepIndex;
if(a.weapon&&a.weapon.pow>0&& !a.flags.gaveW){
a.flags.gaveW=true;
var b=ctx.most(ctx.others(a).filter(function(o){return!mad(o)&&R(ctx,a,o).aff>0;}),function(o){return R(ctx,a,o).aff/50+(a.flags.guardOf===o.i?2:0)+(allied(ctx,a,o)?0.6:0);});
var w0=a.weapon,t0=ctx.t(ctx.pick(b?GIVEUP.give:GIVEUP.toss),a,b);
if(b&&w0.pow>b.weapon.pow)b.weapon=w0;
a.weapon={id:'none',name:'素手',pow:0};
if(b)ctx.mod2(a,b,{aff:4},{aff:12,trust:10});
return{with:b?[b]:null,cat:b?'help':'solo',text:t0,why:a.name+'の行動：自分の命を度外視・諦め（武器「'+w0.name+'」を手放した）'};
}
ctx.stress(a,-4);
return{text:ctx.t(ctx.pick(GIVEUP.void),a),why:a.name+'の行動：自分の命を度外視・諦め'};
}
},
{
id:'br_relive',label:'絶望した人に寄り添う',cat:'help',scope:'pair',noOdd:true,
when:function(ctx,a,b){return despair(b)&& !mad(a)&& !despair(a)&&(allied(ctx,a,b)||R(ctx,a,b).aff>30);},
w:function(ctx,a,b){return 0.3+a.tr.np*0.8+Math.max(0,R(ctx,a,b).aff)/60;},
run:function(ctx,a,b){
ctx.mod2(a,b,{aff:5,trust:4},{aff:12,trust:12});
var ok=ctx.rng()<0.35+a.tr.np*0.3+Math.max(0,R(ctx,b,a).aff)/200;
if(ok){b.flags.relived=true;ctx.stress(b,-12);if(HK.Emo)HK.Emo.bump(ctx,b,{joy:10});}
return{mag:14,text:ctx.t(ctx.pick(GIVEUP.relive),a,b),why:a.name+'のNP。命を投げ出していた'+b.name+'に寄り添った'+(ok?'（'+b.name+'は持ち直した）':'')};
}
}
]
});
})();
});
;
/* ==== js/mini-br.js ==== */
HK.Load.def(117,'js/mini-br.js',function(){
(function(){
'use strict';
var E=window.HK.E;
window.HK.addMini('br',[
E('b_hide_house','solo','s+','caution*.6','','as:3','{a}は民家の床下に潜り込んで、息を殺した。|{a}は学校の屋根裏で、膝を抱えて夜を明かした。|{a}は神社の賽銭箱の裏に身を潜めた。|{a}は畑の案山子の陰で、日が暮れるのを待った。|{a}は廃屋の押し入れで、震える手で武器を握っていた。|{a}は灯台の螺旋階段の途中で、上下の足音に耳を澄ませた。|{a}は診療所のベッドの下で、夜が明けるのを待った。'),
E('b_move','solo','s+','fc*.3+a*.3','','as:2','{a}は禁止エリアを避けて、森の中を慎重に移動した。|{a}は地図を広げて、次の潜伏場所を探した。|{a}は川沿いに、音を立てないように歩いた。|{a}は月明かりを避けて、木の影から影へと移った。|{a}は誰かの足跡を見つけて、反対方向へ進んだ。|{a}は崖の上から、島の全体を見渡した。'),
E('b_supply','solo','s+','a*.3+fc*.2+.2','','ahp:5','{a}は民家の台所で、缶詰を三つ見つけた。|{a}は空き家の救急箱から、包帯と消毒液を手に入れた。|{a}は自販機を壊して、ペットボトルの水を手に入れた。|{a}は商店の棚から、乾パンをかき集めた。|{a}は誰かの死体のそばに落ちていた鞄から、水を拝借した。|{a}は農家の納屋で、使えそうな鎌と縄を見つけた。'),
E('b_rest','solo','s+','caution*.3+stress/100','','as:-6;ahp:4','{a}はようやく安全そうな場所を見つけて、二時間だけ眠った。|{a}は湧き水で顔を洗って、少しだけ正気を取り戻した。|{a}は木の上で、体を縄で枝に縛りつけて眠った。|{a}は配給の乾パンを、ゆっくり噛みしめた。|{a}は傷口に布を巻き直して、深呼吸をした。|{a}は空を見上げて、まだ生きていることを確かめた。'),
E('b_noise','solo','s+','caution*.4+stress/150','','as:6','{a}は小枝が折れる音に、心臓が止まりそうになった。|{a}は遠くの銃声を数えて、生き残りの数を推測した。|{a}は風で揺れる草の音を、足音だと思い込んで武器を構えた。|{a}は夜中、誰かの悲鳴を聞いた。それきり静かになった。|{a}は自分の呼吸の音が大きすぎる気がして、口を手で塞いだ。|{a}はカラスが一斉に飛び立った方角を、じっと見ていた。'),
E('b_broadcast','solo','s+','ac*.3+np*.3','','as:6','{a}は放送で読み上げられた名前を、一人ずつ指を折って数えた。|{a}は放送の声が、担任の声に似ていることに気づいて吐き気がした。|{a}は放送の禁止エリアを、地図に書き込んだ。手が震えて線がずれた。|{a}は放送で友達の名前が呼ばれなかったことに、安堵した。|{a}は放送のたびに耳を塞いだ。|{a}は放送の合間の音楽が、皮肉なほど明るいことに腹を立てた。'),
E('b_weapon_check','solo','s+','a*.4+aggr*.3','','as:-2','{a}は支給された{wa}を、何度も握り直した。|{a}は{wa}の使い方を、説明書を読まずに理解した。|{a}は{wa}を構える練習を、誰もいない場所で繰り返した。|{a}は{wa}を見つめて、これで人を傷つけられるのかを考えた。|{a}は{wa}の重さに、ようやく現実を感じた。|{a}は{wa}を枕元に置いて、眠ろうとした。'),
E('b_weapon_trade','bond','p+','a*.3+warmth*.3','allies>0','ab:trust5;ba:trust5','{a}は{b}と、互いの支給品を見せ合った。|{a}は{b}に、{wa}の使い方を教えた。|{a}は{b}と、武器を交換しようかと話し合った。|{a}は{b}の{wb}を見て「当たりだな」と言った。|{a}は{b}に、自分の武器の方が強いから前を歩くと言った。|{a}は{b}と、武器の弱点を確認し合った。'),
E('b_weapon_drop','solo','s+','np*.4+ac*.3','','as:4','{a}は{wa}を川に投げ捨てようとして、できなかった。|{a}は{wa}を地面に置いて「使わない」と呟いた。|{a}は{wa}を持っている自分の手が、震えているのに気づいた。|{a}は{wa}に布を巻いて、見えないようにした。|{a}は{wa}を構えるたびに、吐き気がした。|{a}は{wa}を鞄の一番底にしまった。'),
E('b_standoff','conflict','p+','caution*.4+aggr*.3','allies<1','ab:ten8;ba:ten8','{a}と{b}は、武器を向け合ったまま動けなくなった。|{a}は{b}と目が合って、互いに一歩ずつ後ずさった。|{a}は{b}に「動くな」と言った。{b}も同じことを言った。|{a}と{b}は、五分間睨み合ったあと、同時に背を向けた。|{a}は{b}の武器の先が震えているのを見て、撃たなかった。|{a}は{b}に向けた{wa}を、下ろせずにいた。'),
E('b_spare','help','p+','np*.6-aggr*.2','allies<1','ba:aff8,trust6;ab:aff3','{a}は{b}を見つけたが、声をかけずに見逃した。|{a}は傷ついた{b}を見て、武器を下ろした。|{a}は{b}に「行け」と言って、道を開けた。|{a}は眠っている{b}の横を、音を立てずに通り過ぎた。|{a}は{b}に、自分の水を半分投げてよこした。|{a}は{b}を撃てる位置にいながら、引き金を引かなかった。'),
E('b_flee','solo','s+','caution*.5+.1','','as:6','{a}は誰かの気配に気づいて、全力で逃げた。|{a}は追いかけてくる足音から、崖を滑り降りて逃れた。|{a}は川に飛び込んで、追手をまいた。|{a}は藪の中を這って、敵の視界から外れた。|{a}は逃げる途中で、靴を片方なくした。|{a}は息が切れるまで走って、ようやく振り返った。'),
E('b_talk_enemy','bond','p+','warmth*.4+honesty*.3','allies<1&ten<40','ab:trust4;ba:trust4','{a}は{b}と、武器を構えたまま話し始めた。|{a}は{b}に「殺し合いなんて、やめよう」と言った。|{a}は{b}に、クラスでの思い出を語りかけた。|{a}は{b}に「お前は誰か殺したか」と訊いた。|{a}は{b}と、互いの武器を地面に置こうと交渉した。|{a}は{b}に、主催者への怒りをぶつけた。'),
E('b_threat','conflict','p+','aggr*.5+cp*.3','allies<1','ba:ten10;bs:8','{a}は{b}に{wa}を突きつけて、持っている食料を全部出させた。|{a}は{b}に「次に会ったら殺す」と言った。|{a}は{b}の足元に、威嚇で一発撃ち込んだ。|{a}は{b}に、自分の縄張りに入るなと警告した。|{a}は{b}の武器を取り上げて、遠くに投げた。|{a}は{b}に「生き残りたいなら、俺に従え」と言った。'),
E('b_ally_share','help','p+','np*.5','allies>0','ba:aff5,trust5;bhp:5','{a}は{b}に、最後の乾パンを半分に割って渡した。|{a}は{b}の分まで、水を汲んできた。|{a}は{b}が眠る間、ずっと見張りをした。|{a}は{b}の傷の手当てをした。|{a}は{b}に、自分の上着を貸した。|{a}は{b}に「お前が生き残れ」と言った。'),
E('b_ally_plan','bond','p+','a*.5+lead*.3','allies>0','ab:trust6;ba:trust6','{a}は{b}と、生き残るための作戦を地面に描いた。|{a}は{b}と、どこに隠れるかを話し合った。|{a}は{b}と、合図の決め方を決めた。|{a}は{b}と、もし離れ離れになったら会う場所を決めた。|{a}は{b}と、首輪の構造について推理した。|{a}は{b}と、敵の位置を地図に記した。'),
E('b_ally_doubt','conflict','p','jealous*.4+caution*.4+cold*.2','allies>0','ab:trust-8,ten6;as:5','{a}は眠っている{b}の顔を見ながら、いつ裏切られるかを考えていた。|{a}は{b}が武器を手放さないことが、気になった。|{a}は{b}が自分より先に食べ物に手を伸ばすのを見て、眉をひそめた。|{a}は{b}の寝言に、知らない名前を聞いた。|{a}は{b}が一人で出かけた理由を、問い詰めたくなった。|{a}は{b}に背中を向けて眠ることが、できなかった。'),
E('b_ally_laugh','bond','p+','fc*.5+warmth*.2','allies>0','ab:aff5;ba:aff5;as:-5;bs:-5','{a}と{b}は、こんな状況なのに馬鹿な話で笑い合った。|{a}は{b}に、くだらない冗談を言って笑わせた。|{a}は{b}と、生きて帰ったら行きたい店の話をした。|{a}と{b}は、クラスの担任の悪口で盛り上がった。|{a}は{b}と、しりとりをしながら夜を明かした。|{a}は{b}の変な寝相を見て、声を殺して笑った。'),
E('b_ally_confess','romance','p','att/40+honesty*.3','allies>0&att>35','ab:att6;ba:att6,aff5','{a}は{b}に「死ぬ前に言っておく」と前置きして、想いを打ち明けた。|{a}は{b}に、ずっと好きだったと言った。|{a}は{b}の手を握って「一緒に帰ろう」と言った。|{a}は{b}に「お前だけは守る」と言った。|{a}は{b}に、生きて帰ったら付き合ってほしいと言った。|{a}は{b}の名前を、何度も確かめるように呼んだ。'),
E('b_ally_cry','help','p+','np*.6','allies>0&B.stress>45','ba:aff6,trust6;bs:-10','{a}は泣き崩れる{b}を、黙って抱きしめた。|{a}は{b}が泣き止むまで、背中をさすり続けた。|{a}は{b}に「お前のせいじゃない」と言った。|{a}は{b}の手を握って、一緒に深呼吸をした。|{a}は{b}に、昔の楽しかった思い出を話させた。|{a}は{b}の耳を手で塞いで、放送を聞かせなかった。'),
E('b_fear','solo','s+','ac*.4+stress/100','','as:6','{a}は膝を抱えて、声を出さずに泣いた。|{a}は自分の首輪に触れて、その冷たさに震えた。|{a}は母親の顔を思い浮かべて、唇を噛んだ。|{a}は「死にたくない」と何度も小さく呟いた。|{a}は夢であってほしいと、目を閉じて祈った。|{a}は手の震えが止まらなくて、武器を握れなかった。'),
E('b_resolve','solo','s+','cp*.4+aggr*.3','','as:-5','{a}は「生き残るのは自分だ」と、声に出して言った。|{a}は涙を拭って、武器を握り直した。|{a}は覚悟を決めた顔で、隠れ家を出た。|{a}は殺されるくらいなら殺すと、自分に言い聞かせた。|{a}は主催者の顔を思い浮かべて、怒りで恐怖を塗りつぶした。|{a}はもう誰も信じないと決めた。'),
E('b_memory','solo','s+','np*.3+ac*.3','','as:4','{a}は教室での何気ない日常を思い出していた。|{a}は誰かの笑顔を思い出して、胸が苦しくなった。|{a}は修学旅行のはずだったバスの中のことを思い出した。|{a}はもう二度と会えないかもしれない誰かの名前を呼んだ。|{a}は昨日まで隣の席にいた誰かの死を、まだ受け入れられなかった。|{a}は家族に送れなかったメッセージのことを考えた。'),
E('b_nightmare','solo','s+','stress/80','stress>40','as:5','{a}は眠った瞬間に、誰かに襲われる夢を見て飛び起きた。|{a}は夢の中で、自分が誰かを殺していた。|{a}はうなされて、自分の声で目を覚ました。|{a}は眠るのが怖くて、一晩中目を開けていた。|{a}は夢の中で、死んだはずの友達と話していた。|{a}は目覚めて、自分の手に血がついていないか確かめた。'),
E('b_guilt','solo','s+','kills*.6+np*.3','kills>0','as:10','{a}は自分が殺した相手の顔が、頭から離れなかった。|{a}は手を何度洗っても、血の感触が消えなかった。|{a}は「仕方なかった」と繰り返した。|{a}は殺した相手の名前を、何度も呼んで謝った。|{a}は自分の手が、もう元には戻らないと感じた。|{a}は殺した相手の持ち物を、どうしても捨てられなかった。'),
E('b_numb','solo','s+','kills*.4+cold*.4','kills>0','as:-4','{a}は人を殺したあとなのに、妙に冷静な自分に気づいた。|{a}は死体の横で、平然と食事をした。|{a}はもう何も感じなくなっていた。|{a}は次の標的を、淡々と地図で探した。|{a}は殺した数を、指で数えた。|{a}は自分がこんなに冷たい人間だったのかと、他人事のように思った。'),
E('b_body','solo','s+','np*.4+caution*.3','step>2','as:8','{a}は森の中で、見覚えのある制服を着た死体を見つけた。|{a}は死体の目を、そっと閉じてやった。|{a}は死体の横に、摘んだ花を置いた。|{a}は死体の持ち物から、食料だけを取って謝った。|{a}は死体を見て、その場で吐いた。|{a}は死体に土をかけて、簡単な墓を作った。'),
E('b_grief','solo','s+','griev*1+np*.3','griev>0','as:8','{a}は放送で呼ばれた名前を、何度も頭の中で繰り返した。|{a}はもう会えない誰かのために、声を殺して泣いた。|{a}は誰かの形見のハンカチを、握りしめていた。|{a}は「仇は取る」と呟いた。|{a}は失った誰かの笑い声を、思い出そうとしても思い出せなかった。|{a}は空に向かって、誰かの名前を叫んだ。'),
E('b_revenge','conflict','p','griev*.8+aggr*.4','griev>0&ten>30','ab:ten10','{a}は、{b}が誰かを殺したという噂を信じ込んでいた。|{a}は{b}の居場所を、執拗に探していた。|{a}は{b}を見つけたら、必ず殺すと決めていた。|{a}は{b}の足跡を見つけて、その後を追った。|{a}は{b}の名前を、呪いのように繰り返した。|{a}は{b}への憎しみだけで、立ち上がっていた。'),
E('b_collar','escape','s+','a*.5+cp*.2','','as:-2','{a}は首輪の継ぎ目を、指で探り続けた。|{a}は首輪から微かな電子音がするのに気づいた。|{a}は首輪に盗聴器が仕込まれている可能性を考えた。|{a}は首輪を外そうとした誰かの末路を思い出して、手を止めた。|{a}は首輪の電池が切れる日数を計算しようとした。|{a}は首輪にメモを書いた紙を巻いて、主催者への伝言にしようとした。'),
E('b_antiorg','escape','p+','cp*.4+a*.3','','ab:trust5;ba:trust5','{a}は{b}に、主催者の本部を襲撃する計画を打ち明けた。|{a}は{b}と、筆談で首輪の解除方法を話し合った。|{a}は{b}に、盗聴されているから大事な話は紙に書けと伝えた。|{a}は{b}と、本部の位置を推理した。|{a}は{b}に「全員で生き残る方法がある」と言った。|{a}は{b}と、首輪の電波を妨害できないか考えた。'),
E('b_hack','escape','s+','a*.6+#agi*.05','','as:-3','{a}は分校のパソコンを見つけて、電源が入るか試した。|{a}は電波塔の位置を地図に書き込んだ。|{a}は拾った無線機で、主催者の通信を傍受しようとした。|{a}は首輪の周波数を調べるために、ラジオを分解した。|{a}は島の発電所の場所を探した。|{a}は主催者の監視カメラの死角を、地図に記した。'),
E('b_old_friend','bond','p+','warmth*.4+aff/60','aff>20','ab:trust6,aff4;ba:trust6,aff4','{a}は親友の{b}と、廃墟の中で再会した。二人とも泣いた。|{a}は{b}の顔を見て、張り詰めていた糸が切れた。|{a}は{b}が生きていたことに、心の底から安堵した。|{a}は{b}に、ずっと探していたと言った。|{a}は{b}と、黙って抱き合った。|{a}は{b}の名前を呼んで、駆け寄った。'),
E('b_hate_old','conflict','p+','cold*.4+aggr*.3','ten>25','ab:ten8;ba:ten6','{a}は昔から気に入らなかった{b}を、ここで終わらせようかと考えた。|{a}は{b}に「お前だけは昔から嫌いだった」と言った。|{a}は{b}が昔したことを、ここで責め立てた。|{a}は{b}の命乞いを、冷たい目で見ていた。|{a}は{b}に「学校じゃないんだ、ここは」と言った。|{a}は{b}への恨みを、ようやく晴らせると思った。'),
E('b_trap','solo','s+','a*.5+caution*.3','','as:-2','{a}は隠れ家の入り口に、空き缶を吊るして鳴子を作った。|{a}は通り道に、縄で足払いの罠を仕掛けた。|{a}は井戸の近くに、偽の足跡を残した。|{a}は隠れ家の周りに、割れたガラスを撒いた。|{a}は食料を囮にして、物陰で待ち伏せした。|{a}は扉に、開けると音が鳴る仕掛けをした。'),
E('b_trapped','solo','s','impulse*.4+.2-caution*.3','','ahp:-10;as:8','{a}は誰かの仕掛けた罠に足を取られて、転倒した。|{a}は鳴子に気づかず踏んでしまって、慌てて逃げた。|{a}は割れたガラスで、足の裏を切った。|{a}は落とし穴に落ちて、足首を捻った。|{a}は罠の縄に引っかかって、膝を擦りむいた。|{a}は囮の食料に手を伸ばしかけて、寸前で気づいた。'),
E('b_letter','bond','p','honesty*.3+np*.3+aff/60','aff>25','ab:aff4;sec','{a}は{b}に宛てた手紙を書いて、ポケットにしまった。|{a}は{b}に会えたら渡そうと、拾ったお守りを持っていた。|{a}は{b}の名前を、木の幹に刻んだ。|{a}は{b}が通りそうな道に、メッセージを残した。|{a}は{b}に伝えたいことを、地図の裏に書き留めた。|{a}は{b}への遺言を、録音しようとしてやめた。'),
E('b_crowd','conflict','s','lead*.4+cp*.3','','gab:ten2','{a}は拡声器で、「みんな集まれ、殺し合いをやめよう」と呼びかけた。|{a}は灯台の上から、皆に向かって手を振った。|{a}は「協力すれば全員助かる」と、通りかかった者に訴えた。|{a}は皆を説得するために、危険を承知で姿を現した。|{a}は白旗を掲げて、広場の真ん中に立った。|{a}は放送室を占拠して、皆に語りかけようとした。'),
E('b_eat','solo','s+','.3','','ahp:3;as:-2','{a}は配給のパンを、半分だけ食べて残りを取っておいた。|{a}は缶詰を開ける道具がなくて、石で叩いて開けた。|{a}は空腹に耐えかねて、生の芋を齧った。|{a}は湧き水を飲みながら、空を見上げた。|{a}は食べ物の味が、ほとんど分からなかった。|{a}は最後の水を、ゆっくり時間をかけて飲んだ。'),
E('b_wound','solo','s+','1.1-hp/100','hp<60','as:5','{a}は傷口が熱を持ってきたのに気づいた。|{a}は止血のために、自分の制服の袖を裂いた。|{a}は痛みで、歩くたびに顔をしかめた。|{a}は傷の具合を確かめて、まだ動けると判断した。|{a}は血の跡を残さないように、傷口を押さえて歩いた。|{a}は痛み止めの代わりに、歯を食いしばった。'),
E('b_watch_ally','romance','p','att/50','allies>0&att>30','ab:att5','{a}は見張りの合間に、眠る{b}の寝顔を見ていた。|{a}は{b}の横顔を、焚き火の明かり越しに見つめた。|{a}は{b}が無事でいることを、何度も確かめた。|{a}は{b}の手の温かさを、忘れないようにしようと思った。|{a}は{b}がいなくなる想像をして、胸が苦しくなった。|{a}は{b}の髪についた葉を、そっと取った。'),
E('b_rain','bond','p+','warmth*.3+.2','allies>0','ab:trust4;ba:trust4','雨が降り出して、{a}と{b}は廃屋の軒下で身を寄せ合った。|{a}と{b}は、雨音に紛れて小声で話した。|{a}は{b}の濡れた髪を、自分の袖で拭いた。|{a}と{b}は、雨水を空き缶に溜めて飲んだ。|{a}と{b}は、雨のおかげで足跡が消えることを喜んだ。|{a}は{b}と、雨が止むまで黙って座っていた。'),
E('b_split','conflict','p+','cold*.4+caution*.3','allies>0','ab:trust-5;ba:trust-6','{a}は{b}に「ここで別れよう。その方が生き残れる」と言った。|{a}は{b}の足手まといになりたくないと言って、離れた。|{a}は{b}と、行き先をめぐって意見が割れた。|{a}は{b}に「お前とは目的が違う」と言った。|{a}は{b}が眠っている間に、一人で出発した。|{a}は{b}に、自分を置いて行けと言った。'),
E('b_sacrifice_food','help','p+','np*.6','B.hp<60','ba:aff6,trust6;bhp:8;ahp:-5','{a}は自分の分の水を、全部{b}に飲ませた。|{a}は{b}の傷に、自分の包帯を使った。|{a}は{b}を背負って、安全な場所まで運んだ。|{a}は{b}のために、危険を冒して薬を取りに行った。|{a}は{b}に、自分の食料を全部渡した。|{a}は{b}に「俺は大丈夫だから」と嘘をついた。'),
E('b_dark','solo','s','cold*.4+aggr*.4','step>4','as:-3','{a}は、もう残りの人数を数えるのが癖になっていた。|{a}は誰かを殺す夢を見ても、もう驚かなかった。|{a}は地図に、標的の位置を印していった。|{a}は笑っている自分に気づいて、ぞっとした。|{a}は生き残るための計算を、何度も繰り返していた。|{a}は誰かの悲鳴を聞いて、一人減ったと思った。'),
E('b_pray','solo','s+','ac*.4+np*.3','','as:-4','{a}は神社で手を合わせて、誰も死なないようにと祈った。|{a}は首から下げたお守りを、握りしめた。|{a}は空に向かって、誰かの無事を祈った。|{a}は自分が生き残ったら、何をするか誓った。|{a}は祈る言葉が見つからず、ただ目を閉じた。|{a}は死んだ誰かのために、黙祷した。'),
E('b_kindness','help','p+','np*.5+warmth*.3','allies<1&ten<30','ba:aff6,trust5','{a}は傷ついて動けない{b}に、包帯を投げてやった。|{a}は{b}が落とした食料を、拾って返した。|{a}は{b}に、禁止エリアの情報を教えた。|{a}は{b}に、罠の場所を教えて立ち去った。|{a}は{b}に「生きろよ」とだけ言った。|{a}は{b}の隠れ家の場所を、誰にも言わないと約束した。'),
E('b_scout','escape','s+','a*.4+#agi*.06','','as:-2','{a}は高台から双眼鏡で、他の生存者の動きを観察した。|{a}は他の生存者の足跡を辿って、潜伏場所を突き止めた。|{a}は誰がどこにいるかを、地図に書き込んでいった。|{a}は禁止エリアに追い込まれる位置を予測した。|{a}は誰と誰が組んでいるかを、遠くから見極めた。|{a}は銃声の方角と時刻を、記録していた。'),
E('b_mock','conflict','p+','cold*.4+aggr*.3+fc*.2','allies<1','ba:ten8;bs:6','{a}は{b}の怯えた顔を見て、笑った。|{a}は{b}に「どうせお前は生き残れない」と言った。|{a}は{b}の武器を見て「ハズレだな」と鼻で笑った。|{a}は{b}に、死んだ友達の名前を出して挑発した。|{a}は{b}の命乞いを、録音しようとした。|{a}は{b}に「泣いても誰も助けない」と言った。')
]);
})();
});
;
/* ==== js/mini-extra-b-br.js ==== */
HK.Load.def(123,'js/mini-extra-b-br.js',function(){
(function(){
'use strict';
var E=window.HK.E;
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
/* ==== js/incidents-br.js ==== */
HK.Load.def(302,'js/incidents-br.js',function(){
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
id:'dilemma',label:'信じるか裏切るかのボタンを迫られる',min:2,
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
;
HK.Load.def(302.5,'tone:scen-br',function(){
HK.Load.toneData("mixed",{"F":[
["お前は誰か殺したか","あなた、誰か殺しました？",1]],
"O":{
"匂いが違う":"匂いが違います。嗅いでみてよ",
"ハズレだな":"ハズレですね。次いこ、次",
"殺し合いなんて、やめよう":"殺し合いなんて、やめましょうよ。誰も得しないって"}});
HK.Load.toneData("noja",{"F":[
["どちらかが死んだら、残った方が家族に伝える","どちらかが果てたら、残った者が家の者に伝えるのじゃ",1],
["全員で生き残る方法がある","全員で生き残る方法があるのじゃ",1],
["まだやり残したことがある","まだやり残したことがあるのじゃ",1],
["夜は動かない、水場には近づかない","夜は動かぬ、水場には近づかぬ",1]],
"O":{
"匂いが違う":"匂いが違うぞ",
"ハズレだな":"ハズレじゃな",
"殺し合いなんて、やめよう":"殺し合いなど、やめるのじゃ"}});
HK.Load.toneData("kansai",{"F":[
["どちらかが死んだら、残った方が家族に伝える","どっちかが死んだら、残ったほうが家族に伝えよな",1],
["泣いても誰も助けない","泣いても誰も助けてくれへんで",1],
["こんなゲーム、終わらせてやる","こんなゲーム、終わらせたる",1],
["お前が先に食え","あんたが先に食べ",1]],
"O":{
"匂いが違う":"匂いがちゃう",
"ハズレだな":"ハズレやな",
"殺し合いなんて、やめよう":"殺し合いなんか、やめよ"}});
HK.Load.toneData("mukuchi",{"F":[
["どちらかが死んだら、残った方が家族に伝える","……どっちか死んだら、残ったほうが伝える",1]],
"O":{
"匂いが違う":"……匂い、違う",
"ハズレだな":"……ハズレ",
"殺し合いなんて、やめよう":"……殺し合い、やめよう"}});
HK.Load.toneData("polite",{"O":{
"匂いが違う":"匂いが違います",
"ハズレだな":"ハズレですね",
"殺し合いなんて、やめよう":"殺し合いなんて、やめましょう"}});
HK.Load.toneData("gentleman",{"F":[
["あなたが先に食え","君が先に食べたまえ",1]],
"O":{
"匂いが違う":"匂いが違うね",
"ハズレだな":"ハズレだね",
"殺し合いなんて、やめよう":"殺し合いなど、やめようじゃないか"}});
HK.Load.toneData("ane",{"F":[
["みんな集まれ、殺し合いをやめよう","みんな、集まって。殺し合いはやめましょう",1],
["こんなゲーム、終わらせてやる","こんなゲーム、終わらせてみせるわ",1]]});
HK.Load.toneData("chara",{"F":[
["泣いても誰も助けない","泣いても誰も助けねーよ"],
["匂いが違う","匂いが違くね？"],
["お前が先に食え","あんたが先に食えって"],
["全員で生き残る方法がある","全員で生き残る方法、あるんだって"],
["夜は動かない、水場には近づかない","夜は動かない、水場には近づかない。これ鉄則な"],
["生き残りたいなら、俺に従え","生き残りたいなら、私に従えって"],
["お前が生きている意味はない","あんたが生きてる意味とかねーし"],
["殺し合いなんて、やめよう","殺し合いとか、やめよ"],
["ハズレだな","ハズレだわ"],
["お前も怖かったんだろ","あんたも怖かったんだろ"],
["お前は誰か殺したか","あんた、誰か殺した？"],
["水を分けるから、話を聞いてくれ","水分けるからさ、話聞いてくんね？"],
["学校じゃないんだ、ここは","学校じゃないんだって、ここは"],
["誰かいないか","誰かいねーの？"],
["当たりだな","当たりっしょ"]]});
HK.Load.toneData("darui",{"F":[
["どちらかが死んだら、残った方が家族に伝える","……どっちか死んだら、残ったほうが家族に伝える",1],
["みんな集まれ、殺し合いをやめよう","……みんな、集まって。……殺し合い、やめよ",1]]});
HK.Load.toneData("devoted_p",{"F":[
["お前が先に食え","あなたが先に食べて",1]]});
HK.Load.toneData("free",{"F":[
["どちらかが死んだら、残った方が家族に伝える","どっちかが死んだら、残ったほうが家族に伝える！　約束！",1],
["みんな集まれ、殺し合いをやめよう","みんな集まって！　殺し合いはやめよう！",1],
["夜は動かない、水場には近づかない","夜は動かない、水場には近づかない！　約束ね！",1]]});
HK.Load.toneData("genki",{"F":[
["お前が先に食え","先に食べてください！",1],
["学校じゃないんだ、ここは","学校じゃないんですよ、ここは",1],
["夜は動かない、水場には近づかない","夜は動きません、水場には近づきません！",1],
["こんなゲーム、終わらせてやる","こんなゲーム、終わらせちゃいます！",1],
["お前は誰か殺したか","あなた、誰か殺しましたか？",1],
["お前が生き残れ","あなたは生き残ってください！",1]]});
HK.Load.toneData("gentle",{"F":[
["お前が先に食え","きみが先に食べて"]]});
HK.Load.toneData("gentle_n",{"F":[
["お前は誰か殺したか","きみは、誰か殺した？"]]});
HK.Load.toneData("gyaru",{"F":[
["どちらかが死んだら、残った方が家族に伝える","どっちか死んだら、残ったほうが家族に伝えるって約束ね",1],
["みんな集まれ、殺し合いをやめよう","みんな集まって！　殺し合いとかやめよ！",1],
["夜は動かない、水場には近づかない","夜は動かない、水場には近づかない！　これ鉄則ね！",1],
["お前が生きている意味はない","あんたが生きてる意味とか、ないし",1],
["こんなゲーム、終わらせてやる","こんなゲーム、終わらせてやるし"],
["泣いても誰も助けない","泣いても誰も助けないよ"],
["お前が先に食え","あんたが先に食べなよ"],
["生き残りたいなら、俺に従え","生き残りたいなら、私に従って"],
["殺し合いなんて、やめよう","殺し合いとか、やめよ"],
["お前も怖かったんだろ","あんたも怖かったんでしょ"],
["お前は誰か殺したか","あんた、誰か殺した？"],
["水を分けるから、話を聞いてくれ","水分けるから、話聞いてよ"],
["学校じゃないんだ、ここは","ここ、学校じゃないんだって"],
["誰かいないか","誰かいないの？"],
["当たりだな","当たりじゃん"]]});
HK.Load.toneData("ojou",{"F":[
["誰かいないか","どなたか、いらっしゃいませんの？",1]]});
HK.Load.toneData("tsun",{"F":[
["どちらかが死んだら、残った方が家族に伝える","どっちかが死んだら、残ったほうが家族に伝える。……約束よ",1],
["みんな集まれ、殺し合いをやめよう","みんな集まりなさい、殺し合いはやめるわよ",1],
["夜は動かない、水場には近づかない","夜は動かない、水場には近づかない。……分かった？",1]]});
HK.Load.toneData("tsun_n",{"F":[
["どちらかが死んだら、残った方が家族に伝える","どちらかが死んだら、残った方が家族に伝える",1],
["みんな集まれ、殺し合いをやめよう","みんな集まれ、殺し合いをやめよう",1],
["夜は動かない、水場には近づかない","夜は動かない。水場には近づかない",1]]});
HK.Load.toneData("usan",{"F":[
["どちらかが死んだら、残った方が家族に伝える","どちらかが死んだら、残った方が家族に伝えるのさ。約束だよ",1],
["みんな集まれ、殺し合いをやめよう","みんな集まっておくれ。殺し合いはやめようじゃないの",1],
["夜は動かない、水場には近づかない","夜は動かない、水場には近づかない。それが長生きのコツさ",1]]});
HK.Load.toneData("yankee",{"F":[
["生き残りたいなら、俺に従え","生き残りたいなら、私に従え"],
["お前が生きている意味はない","お前が生きてる意味なんかねえ",1],
["みんな集まれ、殺し合いをやめよう","みんな集まれ、殺し合いなんかやめろ",1]]});
HK.Load.toneData("sondai",{"F":[
["お前は誰か殺したか","君は、誰か殺したのかね",1],
["全員で生き残る方法がある","全員で生き残る方法があるのだよ",1],
["泣いても誰も助けない","泣いても、誰も助けてはくれんよ",1],
["こんなゲーム、終わらせてやる","こんなゲーム、終わらせてやろう",1]]});
HK.Load.toneData("god",{"F":[
["水を分けるから、話を聞いてくれ","水を分けてやる。ゆえに、話を聞け",1]]});
});
HK.Load.done('scen-br', '9572efa6d4', 1);
