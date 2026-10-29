;
/* ==== js/solo-hole.js ==== */
HK.Load.def(189,'js/solo-hole.js',function(){
(function(){
'use strict';
var HK=window.HK,K=HK.SoloKit,DG=HK.DG;
var clamp=HK.clamp;
function L(s){return s.split('|');}
var PLACE={
toilet:{n:'公衆トイレの壁',in:'{a}が目を覚ますと、腰から下が古いタイルの壁に埋まっていた。壁には「ご自由にお使いください」と落書きがあった。'},
lab:{n:'魔術師の研究室',in:'{a}の腰は、魔法陣の刻まれた壁の穴にぴったりとはまっていた。机の上の札には「感覚遮断・実験体」とある。'},
show:{n:'祭りの見世物小屋',in:'幕の向こうから、客引きの声が聞こえる。「さあさあ、壁から生えた不思議な――」{a}は、自分が何の見世物なのかを理解した。'},
dungeon:{n:'ダンジョンの罠部屋',in:'{a}は罠の床を踏んだ瞬間、壁に吸い込まれた。上半身だけがこちら側に残り、腰から下の感覚が、すっと消えた。'},
white:{n:'白い部屋',in:'{a}が目を覚ますと、白い部屋の壁に腰まで埋まっていた。紙が一枚。「◯時間、耐えてください」'}
};
var BEYOND=L('壁の向こうで、誰かが小さく笑う声がした。{a}には、それが自分に向けたものかどうか分からなかった。|壁が、とん、とん、と規則正しく揺れた。{a}は何も感じない自分の腰を、ぼんやりと見下ろした。|向こう側で、何かの機械が低く唸り始めた。{a}の体は、何も伝えてこなかった。|壁越しに、複数の足音と、ひそひそ話す声が聞こえた。「…これ、本当に感じてないの？」|壁がわずかに温かくなった気がした。{a}は気のせいだと思うことにした。|向こう側から、ぬちゃ、という湿った音がした。{a}は耳を塞ぎたかったが、手が届かなかった。|壁の向こうで、誰かが「次、俺な」と言った。{a}は聞かなかったことにした。|しばらく静かだった。それから、壁が長いこと小刻みに震え続けた。');
var AMB=BEYOND.map(function(t){return{lv:0,t:t,fx:{amb:1}};});
var MIND={
proud:L('{a}は「出たら全員殴る」と天井に向かって宣言した。|{a}は腕を組み、苛立たしげに壁を拳で叩いた。「何がしたいんだ、これは」'),
stern:L('{a}は目を閉じ、規則正しく呼吸を数え続けた。|{a}は乱れそうになる心を、規則正しい深呼吸で押さえつけた。'),
tsun:L('{a}「べ、別に向こうで何されてても関係ないし。感じないし」――そう言いながら、何度も振り返ろうとした。|{a}は「気にしてない、気にしてない」と三十回くらい呟いた。'),
gentle:L('{a}は「困ったわねえ」と頬に手を当て、壁の向こうの誰かに「乱暴にしないでね」と声をかけた。|{a}は鼻歌を歌って、時間が過ぎるのを待った。'),
devoted:L('{a}は「大丈夫、何も感じないんだから、大丈夫」と自分に言い聞かせ続けた。|{a}は待っている人の顔を思い浮かべて、ぎゅっと目をつぶった。'),
cool:L('{a}は「遮断が解けたとき、刺激が遡って伝わる可能性」について考えて、考えるのをやめた。|{a}は壁の振動の周期を数え、向こう側で何人が入れ替わったかを推測していた。'),
free:L('{a}は「ねえ、今なにしてるの？実況してよ」と壁の向こうに話しかけた。返事はなかった。|{a}は暇すぎて、しりとりを一人で始めた。'),
shy:L('{a}は「見ないで…見ないでください…」と、誰にともなく繰り返していた。|{a}は顔を両手で覆った。見えるのは自分の上半身だけなのに、恥ずかしくて仕方がなかった。')
};
MIND.polite=L('{a}は「どなたか、いらっしゃいませんか」と、丁寧に壁の向こうへ声をかけた。|{a}は姿勢を正し、「お時間まで、こちらでお待ちします」と誰にともなく言った。');
var DEFY={
proud:{
blind:L('{a}は壁に向かって吠えた。「おい、そこの誰か。私の体に触ったら、出たあと一人ずつ探し出して殴る」――壁の向こうの気配が、一瞬だけ止まった。|{a}は壁を拳で何度も殴りつけた。「聞こえてんだろ。好き勝手しやがって、覚えとけよ」|{a}は向こう側の物音に舌打ちした。「……触るなら、顔を見せてからにしろ。卑怯者が」'),
live:L('{a}は奥歯を噛みしめ、腰に力を込めて壁の向こうの手を締め出そうとした。「っ……誰が、てめえらなんかに……っ」|{a}は戻ってきた感覚を、怒りでねじ伏せた。「は……っ、こんなもんで、私が折れると思うなよ」――壁の向こうで、誰かが手を止めた。|{a}は後ろへ思いきり足を蹴り出した。壁の向こうで、誰かが呻く声がした。「……ざまあみろ」')
},
stern:{
blind:L('{a}は姿勢を正し、壁の向こうへ低い声で告げた。「今すぐやめろ。この狼藉は、必ず報いを受けることになる」|{a}は目を閉じたまま、静かに言い放った。「私に触れた者の数は、すべて数えている。逃げられると思うな」|{a}は壁に手を当て、向こう側の気配を見据えるように睨んだ。「恥を知れ。……顔も見せられぬ者に、屈するつもりはない」'),
live:L('{a}は戻ってきた感覚に、全身の力で抗った。「く……っ、己を、律せよ……この程度で、乱れるものか」|{a}は腰に力を込め、壁の向こうの動きを拒むように締めつけた。「……っ、離れろ。これ以上は、許さん」|{a}は唇を噛み切りそうなほど噛みしめ、声を一つも漏らさなかった。壁の向こうの動きが、戸惑うように鈍った。')
},
tsun:{
blind:L('{a}は壁をばんばん叩いた。「ちょっと！ 聞こえてるんでしょ！ 勝手に触ったら、許さないんだから！」|{a}は向こう側に向かって叫んだ。「べ、別に怖くなんかないし！ 出たら全員、顔覚えてやるから！」|{a}は真っ赤な顔で壁を睨んだ。「さ、最低……っ！ こんなことして、楽しいわけ!?」'),
live:L('{a}は戻ってきた感覚に、思いきり首を振った。「や、やめなさいよ……っ、感じてなんか、ないんだから……っ」|{a}は後ろへ足をばたつかせた。壁の向こうで、誰かが小さく悲鳴を上げた。「ふ、ふん……当然の報いよ……っ」|{a}は唇を噛んで、声を必死に飲み込んだ。「……っ、ぜったい、負けない……こんなのに……っ」')
}
};
var PULL=L('解放されて、{a}はふらつく手で壁の縁をつかみ、体を引き抜こうとした。その足首を、壁の向こうから伸びた手が掴んだ。ずるり、と腰がまた穴の中へ引き戻された。{a}は抗わなかった。抗う力は、もう残っていなかった。|{a}が這い出しかけたとき、向こう側で誰かが笑った。「まだ終わってないよ」――太腿を掴まれ、{a}の体は穴の奥へ引きずり戻された。遮断の魔法陣が、もう一度、ゆっくりと光り始めた。|{a}の腰が壁から半分抜けたところで、向こう側の何本もの手がそれを押し戻した。{a}は壁に爪を立てたが、指先はすぐに力を失った。穴は、{a}の形にぴったりと締まり直した。|「次の時間、もう予約が入ってる」――壁の向こうの声と同時に、{a}の腰は穴の中へ引き戻された。{a}の口から漏れたのは、悲鳴なのか、別の声なのか、{a}自身にも分からなかった。');
function pullOn(env){return!HK.SAFE_ON&&(','+((env&&env.ct)||'')+',').indexOf(',force,')>=0;}
var IMAGINE=L('{a}は、壁の向こうで今自分がどうなっているのかを、つい想像してしまった。顔が熱くなった。|何も感じないはずなのに、{a}は向こう側の音に合わせて、無意識に息を詰めていた。|{a}は自分の腰が今どんな格好なのかを考えて、頭を振った。想像は、止まらなかった。');
var LEAK=L('一瞬だけ、遮断が揺らいだ。腰の奥に、遅れて届いた熱がずん、と響いた。{a}「――っ！？」|ほんの一秒、感覚が戻った。何かが、深いところに触れていた。{a}は息を呑んだまま固まった。|遮断の魔法がちらついた。{a}の太腿が、勝手に跳ねた。「い、今の、何…」');
var SHOUT=L('{a}は「誰か！ここから出して！」と声を張り上げた。返事の代わりに、壁の向こうで誰かがくすくす笑った。|{a}は喉が嗄れるまで叫び続けた。声が届いているのかどうかも、分からなかった。|{a}「聞こえてるんでしょ！？」――壁が、返事をするように一度だけ揺れた。');
function fresh(S,arr){
var U=S._hUse=S._hUse||{},free=[],i,t;
for(i=0;i<arr.length;i++)if(!U[arr[i]])free.push(arr[i]);
if(free.length)t=free[S.rng.int(free.length)];
else{t=arr[0];for(i=1;i<arr.length;i++)if(U[arr[i]]<U[t])t=arr[i];}
S._hUseN=(S._hUseN||0)+1;U[t]=S._hUseN;
return t;
}
HK.HoleFresh=fresh;
var STRUGGLE=L('{a}は壁に手をついて、渾身の力で体を引き抜こうとした。びくともしなかった。|{a}は腰をよじって隙間を作ろうとした。穴は、ぴったりと{a}の形に締まった。|{a}は壁の縁に指をかけて、少しずつ体をずらそうとした。指先が白くなるまで力を込めても、腰は一寸も動かなかった。|{a}は息を整えてから、もう一度だけ思いきり身をよじった。壁はみしりとも言わず、{a}の腰をしっかりと咥え込んだままだった。');
var KAN='〇一二三四五六七八九';
function kan(n){n=Math.max(0,Math.round(n));if(n<10)return KAN[n];var t=Math.floor(n/10),o=n%10;return(t>1?KAN[t]:'')+'十'+(o?KAN[o]:'');}
var COUNT_OK=L('{a}は目を閉じ、呼吸を数えて時間を測った。「…まだ{t}時間か」|{a}は呼吸を数え直した。「{t}時間……と、{m}分くらい。あと{r}時間」|{a}は脈を数えて、頭の中で時計の針を進めた。――{t}時間経過。残り、{r}時間。|{a}「{t}時間。……よし、まだちゃんと数えられてる」|{a}は数えた呼吸の回数を、指を折って時間に直した。「…{t}時間。折り返しは、{half}時間」|{a}は小さく「{t}時間」と呟いた。あと{r}時間。数字を口にすると、少しだけ落ち着いた。');
var COUNT_LATE=L('{a}は呼吸を数え続けた。「{t}時間……あと{r}時間。もうすぐだ」|{a}「{t}時間。……あと、{r}時間だけ」――数えるたびに、残りが短くなっていくのが救いだった。|{a}は数え続けた数字を確かめた。{t}時間。終わりは、もう見えていた。');
var COUNT_LOST=L('{a}は呼吸を数えていたが、さっき届いた熱のせいで数が飛んだ。「…何時間、だっけ……」|{a}「{t}時間……いや、{tb}……あれ……？」数えるたびに、腰の奥の疼きが数字を溶かした。|気持ちよすぎて、{a}はもう何時間目なのか数えられなくなっていた。数えかけの数字が、吐息と一緒にこぼれていった。|{a}は「{t}……」と言いかけて、続きが出てこなかった。頭の中が、甘い霧で白く塗りつぶされていた。|{a}は最初から数え直そうとして、三回失敗した。「…いち、に……ん、っ……さん……」');
function countText(S,t,H,hot){
var r=H-t,rng=S.rng;
var v={t:kan(t),r:kan(r),tb:kan(t+(rng()<0.5? -1:1)||1),half:kan(Math.ceil(H/2)),m:['十','二十','三十','四十','五十'][rng.int(5)]};
var lost=hot&&rng()<0.35;
var list=lost?COUNT_LOST:r<=Math.max(1,H/4)?COUNT_LATE:COUNT_OK;
return{text:K.fmt(S,fresh(S,list),v),lost:lost};
}
var RELEASE=L('カチリ、と小さな音がした。遮断が、解けた。|壁の魔法陣が、ふっと光を失った。|「時間です」と、どこかで声がした。');
var RELEASE_HOST=L('壁の裏の留め具が外され、遮断の魔法陣がゆっくりと光を失った。|予定より早く、壁の向こうの気配がすっと遠のいた。遮断を解いたのは、主催者の手だった。|「今日はここまで」――帳場の声と同時に、壁の魔法陣が消えた。');
var RELEASE_SELF=L('壁から体を引き抜いた瞬間、遮断の魔法陣がぱちんと弾けて消えた。|無理やり抜け出した拍子に、壁の術式がひび割れ、遮断が解けた。|{a}が壁の縁を押し広げて転がり出ると、遮断は途中で途切れた。');
var FLOOD=L('次の瞬間、{h}時間分の感覚が、一度に{a}の体へ雪崩れ込んだ。|遅れていたすべてが、まとめて{a}の腰の奥へ叩きつけられた。|{a}の体が、{h}時間ぶん溜め込んでいた熱を、一気に思い出した。');
var CONFUSE={
proud:L('{a}「な、んだ、これ…っ、何、された…っ！？」|{a}は壁に爪を立てた。「ふざ、け…っ、止まら、な…」|{a}「誰だ…っ、誰が、こんな…ぁ」'),
stern:L('{a}「…っ、追いつか、な…っ」|{a}は姿勢を保とうとして、膝から崩れた。「何が…起きて…」|{a}「数え…られない…何回…っ」'),
tsun:L('{a}「や、やだ、うそ、こんなの聞いてな…っ！」|{a}「感じてない、感じてないのに…なんで…っ！」|{a}「ばか、ばかばか、止まって…っ」'),
gentle:L('{a}「あら…あ、あ…待って、待ってちょうだい…っ」|{a}は困った笑みのまま、涙をこぼした。「何を、されていたの、わたし…」|{a}「ゆっくり…ゆっくり、来て…お願い…」'),
devoted:L('{a}「ごめ、なさ…っ、わかんない、何もわかんない…っ」|{a}「大丈夫って、言ったのに…大丈夫じゃ、ない…っ」|{a}は泣きながら壁にしがみついた。「終わって、もう、終わって…」'),
cool:L('{a}「…嘘、だろ…こんな、一度に…っ」|{a}の口から、意味をなさない数字がこぼれた。「よ、四…いや、六…」|{a}は初めて、自分の思考が完全に止まるのを感じた。'),
free:L('{a}「えっ、なにこれ、なにこれ、やばっ…あっ、あぁっ！」|{a}「待って、こんなの、知らな…っ、ああっ、また…！」|{a}は笑っているのか泣いているのか分からない声を上げた。'),
shy:L('{a}「ひっ…や、やだ…っ、声、出ちゃ…っ」|{a}は口を両手で押さえたが、指の隙間から声が漏れ続けた。|{a}「み、見ないで…今の、聞かないで…っ」')
};
CONFUSE.polite=L('{a}「も、申し訳、ありませ……っ、なにが、起きて……っ」|{a}「い、いけません、こんな……いっぺんに……っ」|{a}は丁寧な言葉を探そうとして、ひとつも見つからなかった。');
var AFTER={
fall:L('{a}はしばらく動けなかった。やがて震える手で壁を撫で、小さな声で言った。「…もう一回、入れて」|{a}は解放されたあとも、壁の穴の前から離れなかった。次に入るのを、待っているようだった。|{a}は自分から、もう一度壁の穴へ腰を戻した。向こう側から、拍手が聞こえた。'),
broken:L('{a}は床にへたり込んだまま、焦点の合わない目で天井を見ていた。何を言われても、しばらく返事ができなかった。|{a}は自分の腰に恐る恐る触れて、そこにまだ熱が残っているのを確かめ、顔を覆った。'),
hold:{
proud:L('{a}は膝を震わせながらも、自分の足で立った。「二度と来るか、こんなところ」|{a}は壁を一度だけ蹴りつけ、乱れた息のまま顎を上げた。「……この程度で、折れるかよ」|{a}は震える指で襟を正し、誰もいない部屋を睨み回した。「覚えてろ。仕掛けたやつ、全員だ」'),stern:L('{a}は壁に額をつけたまま、長い長い息を吐いた。それから黙って服を整え、背筋を伸ばして部屋を出た。|{a}は膝の震えが収まるまで、目を閉じて呼吸を数えた。百を数え終えると、何事もなかったように歩き出した。|{a}は乱れた襟元を一つずつ留め直した。最後のボタンを留める指だけが、わずかに震えていた。'),
tsun:L('{a}は真っ赤な顔で「き、記憶にないから！何も覚えてないから！」と叫んで走り去った。|{a}は壁を振り返りかけて、慌てて前を向いた。「べ、別に、何ともなかったし。……ほんとに」|{a}は赤い顔のまま、壁に向かって「二度と来ないから！」と言い捨てた。声が、少し裏返っていた。'),gentle:L('{a}は「あらあら…大変だったわね、わたし」と自分の頭を撫でて、ふらふらと立ち上がった。|{a}は壁にそっと手を当てて、「よく頑張ったわね」と自分の腰に言い聞かせるように撫でた。|{a}はゆっくり息を整え、乱れた髪を指で梳いた。「ふふ……帰ったら、お風呂に長く浸かりましょう」'),
devoted:L('{a}は泣きながら笑った。「…耐えた。ちゃんと、耐えたよ」|{a}は自分の両肩を抱きしめて、しばらく震えていた。それから小さく頷いた。「……帰ろう。待ってる人がいる」|{a}は涙を拭って、壁に頭を下げた。「……ちゃんと、最後まで、わたしのままでいられた」'),cool:L('{a}はしばらく無言で天井を見つめ、「…記録には残さない」とだけ言った。|{a}は手首の脈を測り、正常に戻るまでの秒数を数えた。「……回復まで四分。想定より長い」|{a}は壁の継ぎ目を一瞥し、構造を頭に叩き込んでから部屋を出た。二度と、同じ手には乗らない。'),
polite:L('{a}は乱れた服を丁寧に整え、壁に向かって一礼してから部屋を出た。膝は、まだ震えていた。|{a}は深く息を吐き、「大変、失礼いたしました」と誰にともなく詫びてから、ゆっくりと立ち上がった。|{a}は乱れた裾を整え、背筋を伸ばした。「……お世話に、なりました」――声だけが、まだ少し掠れていた。'),free:L('{a}は床に大の字になって、「すっご…なにあれ…」と天井に向かって呟いた。|{a}は笑いながら床を転がった。「やば、腰抜けた。……でも、ちょっと面白かったかも」|{a}は大きく伸びをして、「あー、生きてる」と天井に言った。脚は、まだ笑っていた。'),shy:L('{a}は乱れた服を整え、何もなかった顔で部屋を出た。廊下に出た瞬間、壁に手をついてしゃがみ込んだ。|{a}は顔を両手で覆ったまま、しばらく動けなかった。指の隙間から見える頬は、耳まで真っ赤だった。|{a}は誰にも会いませんようにと祈りながら、壁伝いに出口へ向かった。一歩ごとに、膝が小さく笑った。')
}
};
HK.SCENARIOS.hole={
id:'hole',name:'感覚遮断穴',kicker:'1〜4人・R18',solo:true,maxCast:4,minCast:1,
castHint:'1〜4人。役割「穴にはまる」の人が壁にはまり（決めなければ一人目）、ほかの人（3人まで）は壁の向こう、下半身の側にいる。途中で壁から突き出た体に出くわし、関係・性格・はまっている人の発情の見え方しだいで、助けるか、手を出すかが変わる。助け出されたら、その場で終わる。',
perFields:[{id:'side',label:'役割',auto:'おまかせ（一人目が穴にはまる）',offWhen:function(pk){return pk.host==='yes'?'主催者なので穴にも壁の向こうにも入らない':'';},options:[{id:'stuck',label:'穴にはまる'},{id:'behind',label:'壁の向こう（下半身側）'}]}],
desc:'壁の穴に下半身がはまり、向こう側の感覚は遮断されている。そこで何をされても分からない――解放されるまでは。※成人キャラクター向け',
unit:'時間',simulate:function(input){
var r=run(input),n=(input.chars||[]).length;
if(r&&r._host&&HK.HoleHost)HK.HoleHost.finish(r._host,r);
if(r)delete r._host;
if(n>1){var si=HK.HoleBehind?HK.HoleBehind.cast(input).si:0;r.chars=input.chars.map(function(c,i){return{name:c.name,i:i};});if(r.hero)r.hero.i=si;}
return r;
},
derived:['caution','cold','impulse','honesty'],
env:[
{id:'place',label:'場所',type:'select',def:'lab',options:Object.keys(PLACE).map(function(k){return{v:k,label:PLACE[k].n};})},
{id:'hours',label:'解放までの時間',min:1,max:24,def:6,lo:'1時間',hi:'24時間',unit:'時間'},
{id:'traffic',label:'壁の向こうの人通り',min:0,max:100,def:50,lo:'誰も来ない',hi:'行列',desc:'多いほど、解放の瞬間に戻ってくる感覚が増える'},
{id:'leak',label:'遮断の不完全さ',min:0,max:100,def:30,lo:'完璧',hi:'ときどき漏れる',desc:'高いと、遮断中にも一瞬だけ感覚が届く'},
{id:'wild',label:'向こう側の過激さ',min:0,max:100,def:55,lo:'いたずら程度',hi:'容赦なし'},
{id:'release',label:'解放のしかた',type:'select',def:'auto',options:[{v:'auto',label:'おまかせ'},{v:'burst',label:'一気に戻る'},{v:'drip',label:'少しずつ戻る'},{v:'mid',label:'最中に戻る'},{v:'late',label:'帰り道で遅れて戻る'}]}
].concat(HK.Ero?[HK.Ero.OPT]:[]),
stats:[
{id:'sense',label:'感じやすさ',desc:'高いほど戻ってきた感覚に耐えられない'}
],
actions:[
{id:'count',label:'時間を数えてやり過ごす',fit:function(t){return t.a*0.6+t.caution*0.3;}},
{id:'shout',label:'大声で助けを呼ぶ',fit:function(t){return t.cp*0.5+t.fc*0.3;}},
{id:'imagine',label:'向こう側を想像してしまう',fit:function(t){return t.fc*0.4+t.ac*0.4;}},
{id:'sleep',label:'眠ってしまおうとする',fit:function(t){return t.cold*0.5+t.np*0.2;}},
{id:'struggle',label:'抜け出そうともがく',fit:function(t){return t.aggr*0.6+t.impulse*0.3;}}
],
goals:[
{id:'escape',label:'自力で抜け出す',fit:function(t){return t.cp*0.5+t.aggr*0.3;}},
{id:'calm',label:'平静を保つ',fit:function(t){return t.a*0.5+t.cold*0.3;}},
{id:'nothing',label:'何もなかったことにする',fit:function(t){return t.ac*0.5+t.caution*0.3;}},
{id:'secret',label:'正直ちょっと気になる',fit:function(t){return t.fc*0.5+t.honesty*0.3;}}
],
steps:function(){return[];}
};
function ngOf(c){return c&&Array.isArray(c.loveNG)?c.loveNG.filter(function(x){return x>=0;}):[];}
function dripPick(S,arr,rng){
S._drip=S._drip||{};
var used=S._drip[arr===(HK.HoleMore&&HK.HoleMore.DRIP_TOP)?'t':'b']=S._drip[arr===(HK.HoleMore&&HK.HoleMore.DRIP_TOP)?'t':'b']||{};
var cand=[];
for(var i=1;i<arr.length;i++)if(!used[i])cand.push(i);
if(!cand.length){for(var j=1;j<arr.length;j++){delete used[j];cand.push(j);}}
var k=cand[rng.int(cand.length)];
used[k]=1;
return arr[k];
}
function run(input){
var S=K.state(input,'hole'),rng=S.rng,env=S.env;
var BH=HK.HoleBehind,cast=BH?BH.cast(input):{si:0,others:[]},rescue=null;
if(cast.si){S.h=K.hero(S,input.chars[cast.si],(input.perChar&&input.perChar[cast.si])||{});S.h.i=cast.si;S.party=[S.h];}
var h=S.h;
h.i=cast.si||0;h.ng=ngOf(input.chars[h.i]);(function(c){h.lock=c?HK.lockFirst(c.loveLock):null;if(HK.charFlags)HK.charFlags(c,h,'hole');})(input.chars[h.i]);
if(BH)BH.setup(S,input,cast);
var HH=HK.HoleHost,hostOn= !!(HH&&HH.setup(S,input));
var fin=function(E0,adv0,ex0){if(hostOn)HH.end(S,E0);var r0=K.finish(S,input,E0,adv0,ex0);if(hostOn)r0._host=S;return r0;};
h.sens=0.85+(h.stats.sense-3)*0.12;
h.stats.mind=HK.Attr&&HK.Attr.mindOf?HK.Attr.mindOf(h,rng):1+rng.int(5);
var H=env.hours,pl=PLACE[env.place]||PLACE.lab;
S.k=clamp(Math.pow(6/H,0.5),0.5,1.4);
S.k*=HK.Dark.f(S,'fall');
h.futa= !!(input.chars[cast.si||0]||{}).futa;
var hardTop= !!(HK.Pos&&HK.Pos.hardTopNpc(h));
var guard= !hardTop&& !HK.SAFE_ON&& !!h.noMob;
if(guard)hardTop=true;
var topMe=false;
var nvH=HK.Pos&&HK.Pos.npc?HK.Pos.npc(h):'';
if(HK.Pos&& !hardTop&& !HK.Pos.isF(h)&&HK.Pos.hasM(h)&&(nvH?nvH==='riba':(HK.Pos.of(h)==='riba'||(HK.Pos.of(h)===''&&h.gender==='m')))){
var lead0=(nvH==='riba'||HK.Pos.of(h)==='riba'?0.45:0.25)+(h.tr.cp-0.5)*0.5+(h.tr.aggr-0.5)*0.35+(h.tr.fc-0.5)*0.2-(h.tr.ac-0.5)*0.3;
topMe=rng()<clamp(lead0,0.08,0.8);
}
var RECV_RE= /なか、|なかに|中に|中が|中を|お腹|内部|残留|残って|入っていた|注が|出され|太腿を伝|何人の方が|奥へ|奥に/;
var EK=HK.Ero,eon= !!(EK&&EK.on(S));
var EL=function(key,base){if(!eon)return base;if(topMe)return EK.L(S,'hole',key+'.top',base);return EK.L(S,'hole',key,base);};
var say=function(S0,o){if(eon&&o&&o.text)o.text=EK.fill(S,o.text,h);return K.say(S0,o);};
var HT=HK.HoleThick;
function thickAdd(o,t,before){if(o&&t)o.text=before?t+'\n\n'+o.text:o.text+'\n\n'+t;}
var pk=function(S0,arr){
var f=topMe?arr.filter(function(x){return!RECV_RE.test(x);}):arr;if(!f.length)f=arr;
return fresh(S0,f);
};
var X=HK.HoleMore,plKey=PLACE[env.place]?env.place:'lab';
var stored=0,leaks=0,visits=0,people=0,early=false,earlyBy='',hot=0,lostN=0,meta={cum:0,tent:0,mark:0,ride:0},thisN=0;
var defyN=0,defyT=DEFY[h.persona]&& !hardTop?DEFY[h.persona]:null;
var mindList=MIND[h.persona].concat(X.MIND[h.persona]||[]).filter(function(x){return!hardTop|| !/乱暴にしないで|お手柔らかに/.test(x);}),confList=EL('confuse.'+h.persona,CONFUSE[h.persona].concat(X.CONFUSE[h.persona]||[]));
var mode=env.release&&env.release!=='auto'?env.release:(function(){var x=rng();return x<0.4?'burst':x<0.62?'drip':x<0.82?'mid':'late';})();
var LV=HK.HoleLive,live=false,liveTier=0,liveN=0,liveSeen=[],sweetUsed=[];
if(mode==='mid'&&(hardTop|| !LV))mode='burst';
var tMid=mode==='mid'?Math.max(1,Math.round(H*(0.35+rng()*0.3))):Infinity;
var lpk=function(arr){var f=arr.filter(function(x){return!(topMe&&LV.RECV.test(x));});return fresh(S,f.length?f:arr);};
var rxN={};
function rxLine(t2){
var arr=eon&& !topMe?EK.L(S,'hole','react.'+h.persona+'.'+t2,LV.REACT[h.persona][t2]):LV.REACT[h.persona][t2];
var ok=arr.filter(function(x){return(rxN[x]||0)<2;});
if(!ok.length)return'';
var x=lpk(ok);rxN[x]=(rxN[x]||0)+1;
return K.fmt(S,x);
}
var tierMax= -1,tierShown= -1;
function tierNow(){var x=LV.tier(h);if(x>tierMax)tierMax=x;return tierMax;}
function shiftTxt(t2){if(tierShown<0||t2<=tierShown){tierShown=Math.max(tierShown,t2);return'';}tierShown=t2;return LV.SHIFT&&LV.SHIFT[t2]?K.fmt(S,fresh(S,LV.SHIFT[t2]))+' ':'';}
function tail(p){if(S.rng()>p)return'';var T=DG.TAILS[h.persona]||DG.TAILS.gentle,tl=K.noDg(S,T[K.stage(h)]);return tl.length?' '+K.fmt(S,fresh(S,tl)):'';}
function liveFx(be){
var tr=tierNow(),f=be.fx||{};
var r=K.stim(S,16+be.lv*9+env.wild/9,{part:'belly',defer:true,mind:tr<2});
h.corrupt+=(3+tr*2+(f.cum||0)+(f.tent||0))*(1.25-K.will(h))*S.k;
var t2=tierNow(),sh=shiftTxt(t2);
var feels=be.lv===0&& !(f.tent)?LV.FEEL_LIGHT[t2]:(eon?EK.L(S,'hole','feel.'+(topMe?'top':'recv')+'.'+t2,LV.FEEL[topMe?'top':'recv'][t2]):LV.FEEL[topMe?'top':'recv'][t2]).filter(function(x){return f.cum|| !/注が|果てる/.test(x);});
var txt=K.fmt(S,be.t.replace(/◯/g,String(H)))+(rng()<0.65?' '+K.fmt(S,lpk(eon?EK.L(S,'hole','live.'+plKey+'.'+t2,LV.LIVE[plKey][t2]):LV.LIVE[plKey][t2])):'')+' '+K.fmt(S,fresh(S,feels.length?feels:LV.FEEL_LIGHT[t2]))+
' '+sh+rxLine(t2)+(t2===2&&rng()<0.5?' '+K.fmt(S,fresh(S,eon?EK.L(S,'hole','enjoy.'+(topMe?'top':'recv'),LV.ENJOY[topMe?'top':'recv']):LV.ENJOY[topMe?'top':'recv'])):'');
liveN++;liveTier=t2;
say(S,{kind:'ev',tag:['感じてしまう','体が応える','自分から求める'][t2],text:txt,why:'感覚は戻っている／'+['まだ抵抗している','嫌なのに体が応える','壁の向こうを受け入れた'][t2]+'（堕ち度 '+Math.round(h.corrupt)+'・理性 '+Math.round(Math.max(0,h.reason))+'）'});
if(t2>=1&&sweetUsed.length<2&&(be.lv===2||r.climaxes.length>=2||rng()<0.2+t2*0.1)){
var cand=LV.SWEET.filter(function(p){return sweetUsed.indexOf(p)<0;}),sp=cand[rng.int(cand.length)];
sweetUsed.push(sp);
var nC=2+rng.int(3)+(t2===2?1:0)-r.climaxes.length;
for(var c2=0;c2<nC;c2++)K.climax(S,{silent:true});
var osw=say(S,{kind:'climax',tag:'甘イキが止まらない',text:K.fmt(S,LV.sweetText(sp,topMe)),why:'感覚が戻ったあと、激しくされて '+(nC+r.climaxes.length)+'回続けて果てた（絶頂 '+h.climax+'回目まで）'});
if(HT)thickAdd(osw,HT.peak(S,'sweet',h,{topMe:topMe}),true);
if(sweetUsed.length===1)K.key(S,osw,'甘イキが止まらなくなった');
return;
}
K.logClimax(S,r.climaxes);
}
function beyond(){
var lw=env.wild/100,wts=[1.2-lw,0.6+lw*0.2,lw*1.6];
var list=(X.beyondFor?X.beyondFor(h,plKey):X.BEYOND[plKey]).concat(AMB);
if(hardTop&&X.BEYOND_HARD)return K.pick(S,X.BEYOND_HARD[plKey]);
if(topMe&&X.BEYOND_TOP)list=list.filter(function(e){return e.fx.ride||(!X.PEN_RE.test(e.t)&& !(e.fx.cum>0));}).concat(X.BEYOND_TOP);
if(eon){var ex=topMe?EK.L(S,'hole','beyondTop',[]):EK.L(S,'hole','beyond.'+plKey,[]);list=list.concat(ex,ex);}
var BU=S._beyUsed=S._beyUsed||new Map();
var ev=HK.weighted(rng,list,function(e){return Math.max(0.03,wts[e.lv])*(BU.has(e.t)?0.02:1);});
if(ev&&ev.t)BU.set(ev.t,1);
return ev;
}
function metaWhy(){
var m=[];
if(meta.cum)m.push((topMe?'中で果てた ':'中に出された ')+meta.cum+'回');
if(meta.ride)m.push('跨られた '+meta.ride+'回');
if(meta.tent)m.push('触手・道具 '+meta.tent+'回');
if(meta.mark)m.push('記録・落書き '+meta.mark);
return'本人は感じていない'+(m.length?'／'+m.join('・'):'');
}
say(S,{kind:'sys',tag:'開始',text:K.fmt(S,pl.in.replace('◯',String(H)))+K.fmt(S,'腰から下の感覚は、きれいに消えていた。何をされても、分からない。')+(HK.Attr&&HK.Attr.raceIntro?HK.Attr.raceIntro([h],'trapped',S):''),why:'目標：'+h.goal.label+'／'+h.action.label});
if(hostOn)HH.start(S);
K.snap(S,{s:0});
var stepH=Math.max(1,Math.ceil(H/8));
for(var t=stepH;t<=H;t+=stepH){
S.step=t;
K.step(S,t+'時間目');
var vis=0;
for(var q=0;q<stepH;q++)vis+=rng()<env.traffic/100*0.9?1+(rng()<env.traffic/200?1:0):0;
if(!live&&t>=tMid&&t<H+1){
live=true;
var ob=say(S,{kind:'sys',tag:'遮断が壊れた',text:K.fmt(S,fresh(S,LV.BREAK[plKey]))+' '+K.fmt(S,fresh(S,LV.FLOOD)),why:'解放のしかた：最中に戻る（溜まっていた感覚 '+Math.round(stored)+'）'});
if(HT)thickAdd(ob,HT.peak(S,'break',h,{topMe:topMe}));
K.key(S,ob,'最中に感覚が戻った');
h.pleasure+=stored*0.5;h.reason-=stored*0.06;h.corrupt+=stored*0.04*S.k;stored=0;
var bc=[];while(h.pleasure>=100&&bc.length<3)bc.push(K.climax(S,{silent:true}));
K.logClimax(S,bc);
K.settle(S);
tierShown=tierNow();
}
var nEv=vis?Math.min(Math.max(2,stepH),vis):0;
if(live&& !nEv)say(S,{kind:'ev',tag:'間',text:K.fmt(S,fresh(S,LV.LULL[tierNow()])),why:''});
for(var ev=0;ev<nEv;ev++){
var be=beyond(),f=be.fx;
if(live){
for(var tries=0;tries<6&&(be.fx.amb||LV.UNAWARE.test(be.t)||liveSeen.indexOf(be.t)>=0);tries++)be=beyond();
liveSeen.push(be.t);if(liveSeen.length>4)liveSeen.shift();f=be.fx;
visits++;people+=f.n||0;meta.cum+=f.cum||0;meta.tent+=f.tent||0;meta.mark+=f.mark||0;meta.ride+=f.ride||0;
liveFx(be);K.settle(S);
if(rng()>1-0.4/stepH)break;
continue;
}
visits++;people+=f.n||0;meta.cum+=f.cum||0;meta.tent+=f.tent||0;meta.mark+=f.mark||0;meta.ride+=f.ride||0;
if(!hardTop)stored+=(40+env.wild*0.6)*(1+be.lv*0.45+(f.cum||0)*0.15+(f.tent||0)*0.12)*(0.7+rng()*0.6)*h.sens;
var txt=K.fmt(S,be.t.replace(/◯/g,String(H)))+(!hardTop&& !f.amb&&rng()<0.55?K.fmt(S,pk(S,EL('contrast',X.CONTRAST))):'');
say(S,{kind:'ev',tag:'壁の向こう',text:txt,why:hardTop?(guard?'性行為の相手を固定した相手だけにしている：手を出そうとした相手を追い払った':'攻めの指定：手を出そうとした相手を追い払った'):metaWhy()+'（溜まった感覚 '+Math.round(stored)+'）'});
if(rng()>1-0.5/stepH)break;
}
if(defyT&&nEv&&defyN<3&&(!live||tierNow()<2)&&rng()<0.3+h.tr.cp*0.25+h.tr.aggr*0.15){
defyN++;
if(live)h.pleasure=Math.max(0,h.pleasure-(6+h.tr.cp*8));else stored*=0.9;
say(S,{kind:'ev',tag:'反抗',text:K.fmt(S,pk(S,defyT[live?'live':'blind'])),why:'態度が強い（CP・攻撃性）：壁の向こうに食ってかかった'+(live?'（快感を押し返した）':'（手を出す相手が少し怯んだ）')});
}
if(BH&& !S.behindDone&&t>=S.behindAt){
S.behindDone=true;
var bst={live:live,stored:stored,hardTop:hardTop,guard:guard,topMe:topMe,meta:meta};
rescue=BH.encounter(S,bst);
stored=bst.stored;
if(rescue)break;
}
if(!hardTop&&stored>60&&thisN<2&&rng()<0.22){
thisN++;
say(S,{kind:'ev',tag:'こちら側',text:K.fmt(S,pk(S,X.THIS[plKey]))+' '+K.fmt(S,pk(S,X.THIS_REACT[h.persona])),why:'上半身の側にも、人が来た'});
h.reason-=3;h.corrupt+=2;
}
if(hostOn){var hr=HH.tick(S,{stored:stored,live:live,hardTop:hardTop,guard:guard});stored=hr.stored;if(hr.release){early=true;earlyBy='host';K.settle(S);K.snap(S,{s:0});break;}}
if(live){if(hot>0)hot--;K.settle(S);K.snap(S,{s:0});continue;}
var imag=h.tr.fc*0.35+h.tr.ac*0.25+h.tr.impulse*0.2+(h.action.id==='imagine'?0.35:0)+(h.goal.id==='secret'?0.25:0);
var calm=h.tr.a*0.35+h.tr.cold*0.3+(h.stats.mind-3)*0.1+(h.action.id==='count'||h.action.id==='sleep'?0.2:0);
var counter=h.action.id==='count'||h.tr.a>0.62||(h.tr.cp>0.62&&h.tr.fc<0.45);
if(!hardTop&&vis&&rng()<imag){
h.reason-=4+imag*6;h.corrupt+=2+imag*4;h.pleasure+=6;hot=2;
say(S,{kind:'ev',tag:'想像',text:K.fmt(S,pk(S,IMAGINE))+tail(0.3),why:'想像してしまう（FC・AC・衝動）'});
}else if(counter&&t<H&&rng()<(h.action.id==='count'?0.8:0.5)){
var ct=countText(S,t,H,hot>0||h.pleasure>35);
if(ct.lost){lostN++;h.reason-=3;h.corrupt+=2;}
say(S,{kind:'ev',tag:ct.lost?'数えられない':'時間を数える',text:ct.text,why:ct.lost?'遮断の揺らぎや想像で届いた熱が、数を溶かした':'時間を数えてやり過ごす（A・慎重さ）'});
}else if(h.action.id==='sleep'&&rng()<0.55){
h.pleasure+=4;
say(S,{kind:'ev',tag:'眠り',text:K.fmt(S,pk(S,hardTop?X.DREAM.filter(function(x){return!/抱かれ|触れられ|甘い声/.test(x);}):X.DREAM)),why:'眠ってやり過ごす'});
}else if(rng()<0.6){
h.reason-=Math.max(0,3-calm*4);
say(S,{kind:'ev',tag:'待機',text:K.fmt(S,pk(S,mindList)),why:'口調「'+(HK.toneLabel?HK.toneLabel(h):HK.PERSONA[h.persona].label)+'」'});
}
if(H>=4&&rng()<0.18)say(S,{kind:'ev',tag:'待つ体',text:K.fmt(S,pk(S,X.BODY)),why:''});
if(!hardTop&&rng()<env.leak/100*0.6&&stored>30){
leaks++;hot=2;
var r=K.stim(S,14+env.wild/10,{part:'belly',defer:true});
say(S,{kind:'ev',tag:'揺らぎ',text:K.fmt(S,pk(S,EL('leak',LEAK)))+(r.climaxes.length?'':tail(0.4)),why:'遮断の不完全さ '+env.leak});
K.logClimax(S,r.climaxes);
}
if(h.action.id==='shout'&&rng()<0.5)say(S,{kind:'ev',tag:'叫ぶ',text:K.fmt(S,pk(S,SHOUT)),why:''});
if((h.action.id==='struggle'||h.goal.id==='escape'||hardTop)&&rng()<0.5){
if(rng()<0.05+h.tr.aggr*0.08+h.tr.cp*0.05+(hardTop?0.12:0)){early=true;earlyBy='self';say(S,{kind:'sys',tag:'脱出',text:K.fmt(S,'{a}は皮膚が擦りむけるのも構わず体をねじり、ついに壁から腰を引き抜いた。――遮断が、その場で解けた。'),why:'攻撃性・CP（自力脱出）'});}
else say(S,{kind:'ev',tag:'もがく',text:K.fmt(S,pk(S,STRUGGLE)),why:''});
}
if(!hardTop)h.corrupt+=vis*0.8*S.k;
if(hot>0)hot--;
K.settle(S);
K.snap(S,{s:Math.min(100,stored/8)});
if(early)break;
}
if(rescue){
var nR0=h.climax,rC= !hardTop&& !(live||stored<20);
var ER=BH.rescueEnd(S,input,{live:live,stored:stored,hardTop:hardTop,guard:guard,topMe:topMe},rescue);
if(HK.HoleEnd)HK.HoleEnd.push(S,ER,hardTop?'top':rC?'rescueC':'rescue',{b:rescue.rescued,doer:rescue.doers.indexOf(rescue.rescued)>=0,live:live,topMe:topMe,nR:h.climax-nR0,stored:stored,sit:'rescued'});
return fin(ER,['壁の向こうの住人が助けるか手を出すかは、はまっている人との関係・その人の性格（NP・CP・FC・衝動）・発情の見え方で決まる。','助け出された瞬間に、溜まっていた感覚は一度に戻る。'],{meta:pl.n+'・'+H+'時間・救出',estats:[['経過',S.step+'時間'],['助けた人',rescue.rescued.name],['手を出した人',rescue.doers.length?rescue.doers.map(function(d){return d.name;}).join('・'):'いない'],['絶頂',h.climax+'回'],['堕ち度',Math.round(h.corrupt)]],gaugeS:'溜まった感覚'});
}
S.step=H+1;
var ho=Math.round(early?t:H);
if(early&&mode==='late')mode='burst';
if(hardTop){
say(S,{kind:'sys',tag:'解放',text:(early?'':K.fmt(S,pk(S,RELEASE)))+K.fmt(S,pk(S,X.TOP_RELEASE)),why:'壁の向こうには、何もさせなかった（追い払った相手 '+visits+'）'});
var revenge= !guard&& !h.noMob&&visits>0&&rng()<0.4+h.tr.aggr*0.3+h.tr.cp*0.2;
var ot=say(S,{kind:'ev',tag:revenge?'返り討ち':'余韻',text:K.fmt(S,pk(S,revenge?X.TOP_REVENGE[plKey]:X.TOP_AFTER)),why:revenge?'壁の向こうに回り、手を出そうとした相手を逆に責めた（攻撃性・CP）':''});
K.key(S,ot,revenge?'壁の向こうの相手を返り討ちにした':'何もさせずに出てきた');
K.snap(S,{s:0});
var Et={type:'hold',kind:'ok',title:revenge?'返り討ち ― 壁の向こうを締め上げた':early?'自力脱出 ― 指一本触れさせなかった':'何もさせなかった ― 脚が最後まで守りきった',lines:[
h.name+'は'+pl.n+'で'+ho+'時間を過ごした。壁の向こうには'+(people||visits)+'人が来ていた。',
visits?'手を出そうとした相手は、全員追い払われた。'+h.name+'の腰から下には、何も溜まらなかった。':'壁の向こうには、結局誰も手を出してこなかった。',
revenge?'最後に締め上げられたのは、壁の向こう側の方だった。':''
].filter(Boolean)};
if(HK.HoleEnd)HK.HoleEnd.push(S,Et,'top',{sit:revenge?'revenge':'held'});
return fin(Et,[guard?'性行為の相手を「固定した相手だけ」にしているので、壁の向こうの誰にも手を出させなかった。':'自分で「攻め」を選んでいるので、壁の向こうで「される」側には回らなかった。','抜け出せるかどうかは、攻撃性（'+Math.round(h.tr.aggr*100)+'）とCP（'+Math.round(h.eg.CP)+'）しだい。'],{meta:pl.n+'・'+H+'時間',estats:[['経過',ho+'時間'],['壁の向こうの人数',(people||visits)+'人'],['追い払った',visits+'回'],['返り討ち',revenge?'あり':'なし']],gaugeS:'溜まった感覚'});
}
if(live){
K.step(S,'解放');
var tierE=tierNow();
var oe=say(S,{kind:'sys',tag:'解放',text:K.fmt(S,fresh(S,topMe?LV.END[tierE]:EL('end.'+tierE,LV.END[tierE]))),why:'感覚が戻ってから '+liveN+'回、壁の向こうを感じた'});
K.key(S,oe,'解放の時間');
K.settle(S);
var stL=h.fallen||h.corrupt>=100?'fall':tierE===2?'enjoy':tierE===1?'broken':'hold';
if(HK.Attr)stL=HK.Attr.fallState(h,stL,{fall:['fall','enjoy'],down:'broken'});
var oa2=say(S,{kind:'sys',tag:stL==='fall'||stL==='enjoy'?'陥落':'余韻',text:K.fmt(S,pk(S,stL==='hold'?EL('after.hold.'+h.persona,AFTER.hold[h.persona]):stL==='enjoy'?EL('after.fall',AFTER.fall):EL('after.'+stL,AFTER[stL]))),why:'絶頂 '+h.climax+'回・堕ち度 '+Math.round(h.corrupt)});
if(HT){var ta2=HT.after(S,stL==='fall'||stL==='enjoy'?'fall':stL,h,{topMe:topMe});if(ta2)oa2.text=ta2;}
if(h.willHeld)oa2.text+='\n\n'+HK.Attr.hold(function(l){return pk(S,l);},h,'hole');
K.key(S,oa2,stL==='fall'?'快楽に堕ちた':stL==='enjoy'?'壁の向こうを受け入れた':stL==='broken'?'崩れ落ちた':'耐えきった');
var pulledL=(stL==='fall'||stL==='enjoy')&&pullOn(env)&&rng()<0.6;
if(pulledL){oa2.tag='引き戻される';oa2.text=K.fmt(S,pk(S,PULL));oa2.why='内容のスイッチ「合意のない展開」：抜け出しかけたところを、壁の向こうから引き戻された';}
K.snap(S,{s:0});
var metaL=[];
if(meta.cum)metaL.push((topMe?'向こう側の誰かの中で果てたのは':'奥に注がれたのは')+meta.cum+'回');
if(meta.ride)metaL.push('跨られたのは'+meta.ride+'回');
if(meta.tent)metaL.push('触手や道具に責められたのは'+meta.tent+'回');
var EL={type:stL==='enjoy'?'fall':stL,kind:stL==='fall'||stL==='enjoy'?'over':stL==='broken'?'mid':'ok',title:pulledL?'快楽堕ち ― 向こう側から引き戻された':stL==='fall'?'快楽堕ち ― 最中に戻った感覚に呑まれた':LV.TITLE[tierE],lines:[
h.name+'は'+pl.n+'で'+ho+'時間を過ごした。壁の向こうには'+(people||visits)+'人が来ていた。',
'途中で遮断が壊れ、そこから先は、壁の向こうで起きることをすべて感じていた。'+(metaL.length?metaL.join('、')+'。':''),
K.fmt(S,LV.LINE[tierE])+h.name+'は'+h.climax+'回果てた。'
]};
if(defyN)EL.lines.push(h.name+'は壁の向こうに'+defyN+'回、食ってかかった。');
if(HK.HoleEnd)HK.HoleEnd.push(S,EL,stL==='fall'||stL==='enjoy'?'fall':'ret',{live:true,topMe:topMe,broken:stL==='broken',pulled:pulledL});
var advL=['最中に感覚が戻ると、溜まっていた分が一度に届き、そのあとは一つ一つを生で感じる。','受け入れていく早さは、意志（CP・A・理性）で遅くなり、過激さ '+env.wild+'・感じやすさ '+h.stats.sense+'で早くなる。'];
return fin(EL,advL,{meta:pl.n+'・'+H+'時間・最中に戻る',estats:[['経過',ho+'時間'],['壁の向こうの人数',(people||visits)+'人'],['感覚が戻ってから',liveN+'回'],[topMe?'中で果てた回数':'奥に注がれた回数',meta.cum+'回'],['絶頂',h.climax+'回'],['堕ち度',Math.round(h.corrupt)]],gaugeS:'溜まった感覚'});
}
K.step(S,early?'脱出の瞬間':mode==='late'?'解放……？':'解放');
var o0;
if(mode==='late'){
o0=say(S,{kind:'sys',tag:'解放',text:K.fmt(S,pk(S,RELEASE))+' '+K.fmt(S,pk(S,X.LATE_IN)),why:'感覚は、まだ戻っていない'});
S.step=H+2;K.step(S,'帰り道');
}else{
o0=say(S,{kind:'sys',tag:'解放',text:K.fmt(S,pk(S,early?(earlyBy==='host'?RELEASE_HOST:RELEASE_SELF):RELEASE))+' '+(mode==='drip'?K.fmt(S,topMe?X.DRIP_TOP[0]:pk(S,EL('drip',[X.DRIP[0]]))):K.fmt(S,pk(S,EL('flood',FLOOD)),{h:ho})),why:'溜まっていた感覚 '+Math.round(stored)+'（訪問 '+visits+'回）／解放：'+X.RELEASE_MODE[mode]});
}
K.key(S,o0,'感覚が戻った');
if(HK.Lewd&&HK.Lewd.conf('hole')&&HK.Lewd.high(env))stored=Math.round(stored*1.3);
var wave=Math.min(mode==='drip'?10:8,Math.max(mode==='drip'?3:1,Math.round(stored/(mode==='drip'?55:80))));
var restore=stored,floodThick=false,lastWave=null,thick4O=null;
for(var w=0;w<wave&&restore>0;w++){
var chunk=Math.min(restore,mode==='drip'?40+rng()*40:70+rng()*60);
restore-=chunk;
h.pleasure+=chunk*(0.9+w*0.08);
h.reason-=chunk*0.09;h.corrupt+=3*S.k;
var parts=[];
while(h.pleasure>=100&&parts.length<3)parts.push(K.climax(S,{silent:true}));
var lead=mode==='late'&&w===0?K.fmt(S,pk(S,X.LATE))+' ':mode==='drip'&&w>0&&rng()<0.5?K.fmt(S,dripPick(S,topMe?X.DRIP_TOP:X.DRIP,rng))+' ':'';
var lineTxt=lead+(parts.length?(lead?h.name:'')+(parts[0].charAt(0)==='「'?'':K.moan(S))+parts.join(''):K.fmt(S,pk(S,confList)));
if(parts.length&&rng()<0.7)lineTxt+=' '+K.fmt(S,pk(S,confList));
var wv=parts.length?EL('wave',[]):[];
if(wv.length)lineTxt=K.fmt(S,pk(S,wv))+' '+lineTxt;
if(parts.length&& !floodThick&&mode!=='late'&&HK.Thick4&&HK.Thick4.ok(S,'mid')){lineTxt=HK.Thick4.flood(S,h,{top:topMe,lead:lineTxt});floodThick=true;}
var ow=say(S,{kind:parts.length?'climax':'ev',tag:parts.length?(parts.length>1?'連続絶頂':'絶頂'):'混乱',text:lineTxt,why:(w+1)+'波目'+(parts.length?'・'+parts.length+'回':'')});
if(parts.length){lastWave=ow;if(floodThick&& !thick4O)thick4O=ow;}
K.settle(S);
}
if(HT&&lastWave&&lastWave!==thick4O)thickAdd(lastWave,HT.peak(S,'flood',h,{topMe:topMe}),true);
var state=h.fallen||h.corrupt>=100?'fall':h.corrupt>=70||h.climax>=6?'broken':'hold';
if(HK.Attr)state=HK.Attr.fallState(h,state,{fall:['fall'],down:'broken'});
var oa=say(S,{kind:'sys',tag:state==='fall'?'陥落':'余韻',text:K.fmt(S,pk(S,mode==='late'?X.LATE_AFTER[state]:state==='hold'?EL('after.hold.'+h.persona,AFTER.hold[h.persona]):EL('after.'+state,AFTER[state]))),why:'絶頂 '+h.climax+'回・堕ち度 '+Math.round(h.corrupt)});
if(HT&&mode!=='late'){var ta=HT.after(S,state,h,{topMe:topMe});if(ta)oa.text=ta;}
if(h.willHeld)oa.text+='\n\n'+HK.Attr.hold(function(l){return pk(S,l);},h,'hole');
K.key(S,oa,state==='fall'?'快楽に堕ちた':state==='broken'?'崩れ落ちた':'耐えきった');
var pulled=state==='fall'&&mode!=='late'&&pullOn(env)&&rng()<0.6;
if(pulled){oa.tag='引き戻される';oa.text=K.fmt(S,pk(S,PULL));oa.why='内容のスイッチ「合意のない展開」：抜け出しかけたところを、壁の向こうから引き戻された';}
var peeked=false;
if(state!=='fall'&&mode!=='late'&&rng()<0.2+h.tr.fc*0.25+h.tr.a*0.15+(h.goal.id==='secret'?0.3:0)){
peeked=true;
say(S,{kind:'ev',tag:'壁の向こう側へ',text:K.fmt(S,pk(S,EL('peek',X.PEEK)),{marks:String(Math.max(1,Math.ceil((meta.mark+people)/5))),visits:String(people||visits)}),why:'好奇心（FC・A）'});
}
K.snap(S,{s:0});
var title=pulled?'快楽堕ち ― 向こう側から引き戻された':state==='fall'?'快楽堕ち ― 自分から穴に戻った':mode==='late'?'帰り道で ― 遅れて届いた'+ho+'時間':state==='broken'?'崩れ落ちた ― '+h.climax+'回の波に呑まれて':early?'自力脱出 ― 溜まった分だけで済んだ':peeked?'見てしまった ― 壁の裏側の記録':'耐えきった ― 最後まで心は折れなかった';
var metaLine=[];
if(meta.cum)metaLine.push((topMe?'向こう側の誰かの中で果てたのは':'奥に注がれたのは')+meta.cum+'回');
if(meta.ride)metaLine.push('跨られたのは'+meta.ride+'回');
if(meta.tent)metaLine.push('触手や道具に責められたのは'+meta.tent+'回');
var E={type:state,kind:state==='fall'?'over':state==='broken'?'mid':'ok',title:title,lines:[
h.name+'は'+pl.n+'で'+ho+'時間を過ごした。壁の向こうには'+(people||visits)+'人が来ていた。',
metaLine.length?'壁の向こうで'+metaLine.join('、')+'。'+h.name+'がそれを知ったのは、'+(mode==='late'?'帰り道でのことだった。':'感覚が戻った瞬間だった。'):'',
'戻ってきた感覚で、'+h.name+'は'+h.climax+'回果てた。'+(leaks?'遮断の揺らぎは'+leaks+'回。':'')+(lostN?'時間を数えられなくなったのは'+lostN+'回。':''),
h.goal.id==='nothing'?h.name+'は「何もなかった」と言い張った。'+(state==='hold'?'本当にそう見えた。':'誰も信じなかった。'):h.goal.id==='secret'?'「ちょっと気になる」の答えは、'+(state==='fall'?'思っていた以上だった。':'知らないほうがよかった。'):''
].filter(Boolean)};
if(defyN)E.lines.push(h.name+'は壁の向こうに'+defyN+'回、食ってかかった。'+(state==='hold'?'最後まで、気持ちは折れなかった。':''));
if(HK.HoleEnd)HK.HoleEnd.push(S,E,state==='fall'?'fall':'ret',{topMe:topMe,late:mode==='late',broken:state==='broken',pulled:pulled});
var adv=[];
adv.push('待っている間に削れたのは、'+(h.tr.fc+h.tr.ac>h.tr.a+h.tr.cold?'想像力（FC・AC）のせい。何も感じないのに、心だけが先に熱くなった。':'時間そのもの。A・ドライさのおかげで、想像には呑まれにくかった。'));
adv.push('戻ってきた感覚の量は、人通り '+env.traffic+'・過激さ '+env.wild+'・感じやすさ '+h.stats.sense+'で決まった。解放のしかたは「'+X.RELEASE_MODE[mode]+'」。');
if(state!=='hold')adv.push('心の強さ（'+(HK.Attr&&HK.Attr.willLabel?HK.Attr.willLabel(h):h.stats.mind)+'）とCP（'+Math.round(h.eg.CP)+'）がもう少しあれば、最後の波に耐えられたかもしれない。');
return fin(E,adv,{meta:pl.n+'・'+H+'時間・'+X.RELEASE_MODE[mode],estats:[['経過',ho+'時間'],['壁の向こうの人数',(people||visits)+'人'],[topMe?'中で果てた回数':'奥に注がれた回数',meta.cum+'回'],['触手・道具',meta.tent+'回'],['遮断の揺らぎ',leaks+'回'],['解放時の絶頂',h.climax+'回'],['堕ち度',Math.round(h.corrupt)]],gaugeS:'溜まった感覚'});
}
if(HK.SCEN_ORDER.indexOf('hole')<0)HK.SCEN_ORDER.push('hole');
})();
});
;
/* ==== js/hole-host.js ==== */
HK.Load.def(190,'js/hole-host.js',function(){
(function(){
'use strict';
var HK=window.HK,K=HK&&HK.SoloKit;
if(!K|| !HK.SCENARIOS|| !HK.SCENARIOS.hole|| !HK.Roles)return;
function L(s){return s.split('|');}
var ROLE={allowMob:true,allowNone:true,auto:'none',yes:'主催者になる',mob:{given:true},
desc:'遮断穴を営む主催者を、住人がやるか・モブがやるか・なしにするかを選びます。住人の主催者は穴にも壁の向こうにも入らず、帳場の覗き窓から眺めて品評し、ときどき客を呼び込んだり、お気に入りを早めに出したりします。住人が一人だけのときは主催者を置きません',
fit:function(c){var t=c.tr||HK.traits(c.eg);return 0.3+t.fc*0.4+t.a*0.3+(t.lead||0)*0.3;}};
HK.Roles.install(HK.SCENARIOS.hole,'host','主催者',ROLE);
var T={
intro:{
res:L('この「遮断穴」を仕切っているのは、{h}だった。{h}は壁の裏の小部屋で帳簿を広げ、覗き窓から{a}の上半身を眺めた。{a}はまだ、この場の主催者が誰なのかを知らない。|{a}がはまった壁の裏には、細い通路と小さな帳場があった。そこに座っているのは、この遮断穴の主催者――{h}だ。{h}は穴の札を「使用中」に掛け替えて、静かに息をついた。|{h}は、遮断の具合を確かめる計器の針を指先でなぞった。今日の「お客」は{a}だった。主催者が知り合いだとは、{a}は夢にも思っていないだろう。'),
mob:L('壁の上には、小さな真鍮の札が打ちつけてあった。「当遮断穴の主催　{h}」――その下に、細い伝声管の口が開いている。「ようこそ。お時間まで、ごゆっくり」と、落ち着いた声が流れてきた。|{a}の目の前の壁に、覗き窓がひとつ開いた。「私は{h}。この穴を営んでいる者です」窓の向こうの目は、品定めするように{a}を見つめてから、ぱたりと閉じた。|伝声管から、咳払いがひとつ聞こえた。「主催の{h}です。遮断は完璧ですので、ご安心を」{a}は何を安心すればいいのか分からないまま、壁を睨みつけた。')
},
comment:{
proud:L('{h}は覗き窓から{a}を見下ろして、鼻を鳴らした。{h}「いいざまだな。しばらくそこで反省してろ」{h}は帳簿に大きく「延長」と書きかけて、やめた。|{h}「穴にはまったくらいで騒ぐな」{h}は伝声管の蓋を閉めたまま、ひとりごちた。それでも{h}の目は、何度も覗き窓のほうへ戻っていった。|{h}は腕を組んで、壁の向こうの人の出入りを数えていた。{h}「{a}の奴、まだ平気な顔をしてやがる」{h}は面白くなさそうに、計器の針を指で弾いた。'),
stern:L('{h}は計器の針を確かめ、帳簿に時刻を書き入れた。{h}「規定の時間までは、出すわけにいかない」覗き窓の向こうの{a}を一度だけ見て、{h}はまた帳簿に目を落とした。|{h}「{a}、姿勢を崩すな。遮断の具合が乱れる」{h}は伝声管越しに、事務的に告げた。返事の代わりに、壁のこちら側で{a}が何か言い返す声がした。|{h}は規則正しく、一時間ごとに覗き窓を開けた。{a}の顔色を確かめ、計器の数字を読み、窓を閉める。その手順を、{h}は一度も省かなかった。'),
tsun:L('{h}は覗き窓の前で、そわそわと行ったり来たりしていた。{h}「べ、別に{a}の様子が気になるわけじゃないし。仕事だし」そう言いながら、{h}は五分おきに窓を開けていた。|{h}「なんで{a}がはまってるのよ……」{h}は帳簿を握りしめて、頭を抱えた。それでも受付の札を「休止中」に変える勇気は、出なかった。|{h}は伝声管に口を近づけて、すぐに離した。{h}「……声かけたら、ばれるじゃない」{h}はむくれた顔で、計器の針をにらみつけた。'),
gentle:L('{h}は覗き窓から{a}の顔をのぞいて、困ったように微笑んだ。{h}「あらあら、退屈そうね」{h}は小さな水差しを用意して、窓の縁にそっと置いた。|{h}は帳場で編み物をしながら、ときどき{a}のほうへ目をやった。{h}「もう少しの辛抱よ、{a}」その声は、伝声管には乗らないくらい小さかった。|{h}「お腹すいてないかしら」{h}は{a}の頭の上の棚に、焼き菓子をひとつ置いた。{a}が首を伸ばしても届かない位置だったことに、{h}は気づいていなかった。'),
devoted:L('{h}は覗き窓に額をつけるようにして、{a}を見守っていた。{h}「何かあったら、すぐ止めるから」{h}は計器の非常の札に、ずっと手を添えていた。|{h}は{a}のために、壁の縁に柔らかい布を詰め直した。{h}「少しでも、楽になるといいんだけど」{a}は、急に腰回りが楽になった理由を知らなかった。|{h}「{a}、がんばって……」{h}は帳場の椅子にも座らず、立ったまま時間を数えていた。自分で始めた商売なのに、{h}はひどく落ち着かなかった。'),
cool:L('{h}は計器の数字を、淡々と記録帳に写していた。{h}「遮断率、九割九分。{a}の反応は想定どおり」{h}の筆は、一度も止まらなかった。|{h}は覗き窓から{a}の表情を観察し、余白に小さく書きつけた。{h}「待つ時間が長いほど、想像で消耗する。興味深い」{h}は次の頁をめくった。|{h}「{a}は時間を数えるほうか、数えないほうか」{h}は顎に手を当てて、覗き窓の向こうを眺めた。答えが出るまで、{h}は帳場を離れなかった。'),
free:L('{h}は覗き窓にかじりついて、{a}の顔を眺めていた。{h}「わ、今の顔いい！記念に描いとこ」{h}は帳簿の裏に、さらさらと似顔絵を描き始めた。|{h}「ねえねえ、{a}って意外と暇つぶし下手だよね」{h}は誰もいない帳場で、ひとりで笑い転げた。それから伝声管の蓋に手をかけて、話しかけようか迷った。|{h}は計器の針を眺めながら、足をぶらぶらさせていた。{h}「次はどんなお客が来るかなー」{h}にとっては、{a}の困り顔も、この商売の楽しみのひとつだった。'),
shy:L('{h}は覗き窓を指一本ぶんだけ開けて、こっそり{a}をのぞいた。{h}「み、見てない、見てないから……」目が合いそうになって、{h}は慌てて窓を閉めた。|{h}は帳場の隅で、膝を抱えて小さくなっていた。{h}「{a}に、こんなお店やってるって知られたら……」{h}は顔を真っ赤にして、帳簿で顔を隠した。|{h}「ご、ごめんね、{a}……」{h}は伝声管に聞こえないように、小さく謝った。それでも札を「休止中」に変えることは、{h}にはできなかった。'),
polite:L('{h}は覗き窓を開け、{a}に丁寧に一礼した。{h}「ご不便をおかけしております。お時間まで、もうしばらくお待ちくださいませ」窓は、音もなく閉じられた。|{h}は帳簿に{a}の名を書き入れ、几帳面に時刻を添えた。{h}「本日のお客様は、お一人様ですね」その声は、老舗の宿の主人のように穏やかだった。|{h}「お加減はいかがでしょう、{a}様」{h}は伝声管越しに、そっと尋ねた。返事を待つあいだ、{h}は背筋を伸ばしたまま微動だにしなかった。')
},
boost:{
pre:L('{h}は表の札を「空きあり」に掛け替えて、通りに向かって手招きした。ほどなく、壁の向こうに新しい足音が増えていった。{a}は何も感じないまま、伝声管から漏れる客の笑い声を聞いていた。|{h}は計器のつまみを、遮断がいちばん深くなるところまで回した。壁の向こうで何が起きても、{a}には何も届かない――その分だけ、溜まっていく。{h}は帳簿に、小さく丸をつけた。|{h}「せっかくだし、もう少し賑やかにしようか」{h}は呼び込みの鈴を三度鳴らした。壁の向こうの人の出入りが、目に見えて増えた。'),
live:L('{h}は表の札を「空きあり」に掛け替えて、通りに向かって手招きした。壁の向こうの足音が増えるたびに、戻ってきた感覚が{a}の腰を震わせた。{a}は唇を噛んで、覗き窓のほうを睨んだ。|{h}は呼び込みの鈴を鳴らした。すぐに壁の向こうに誰かが立つ気配がして、{a}の体がびくりと跳ねた。{h}「休んでいる暇はないよ」|{h}は計器のつまみを、ほんの少しだけ戻した。遮断の薄くなった壁越しに、向こう側の手つきがそのまま{a}に伝わってきた。{a}は額を壁に押しつけて、声をこらえた。'),
top:L('{h}は呼び込みの鈴を鳴らしたが、壁の向こうから聞こえてきたのは客の悲鳴だった。{a}の脚が、近づく者を片っ端から蹴り返していた。{h}は帳簿を閉じて、深いため息をついた。|{h}が表の札を掛け替えると、{a}は伝声管に向かって低く言った。{a}「今、客を入れたな。出たら覚えておけ」{h}は黙って、札を「休止中」に戻した。|{h}は遮断のつまみを回したが、{a}は気にも留めなかった。壁の向こうに立った誰かは、すぐに{a}の脚に追い払われた。{h}「……この人は、商売にならないな」')
},
save:L('{h}は計器の非常の札を引き、遮断の術をその場で解いた。{h}「今日はここまで。……{a}には、これ以上は無理だ」壁の留め具が外れ、{a}の腰がゆっくりと穴から抜けた。|{h}は覗き窓を閉めると、迷わず壁の裏の留め具に手をかけた。{h}「予定より早いけど、もうおしまい」{a}は急に軽くなった腰に戸惑いながら、壁から転がり出た。|{h}「{a}、出すよ」{h}は伝声管にそう告げてから、穴の縁の金具をひとつずつ外していった。最後の金具が外れたとき、{a}の体はふわりとこちら側へ戻ってきた。'),
tease:L('伝声管から、くすくすと笑う声が漏れてきた。「いい顔してるね。壁の向こうの様子、教えてあげようか？」{a}は返事をせず、真っ赤になって伝声管の口を手で塞いだ。|覗き窓がすっと開いて、細い指が一枚の紙を差し入れた。紙には、ここまでに壁の向こうへ来た人の数が、正の字で書かれていた。{a}はその数を数えかけて、途中でやめた。|「あと何時間か、数えてる？」伝声管の声は、楽しそうに続けた。「教えてあげない」――{a}が言い返す前に、伝声管の蓋はぱたんと閉じられた。'),
discover:L('伝声管から聞こえた声に、{a}ははっと顔を上げた。聞き違えるはずがなかった。――この穴の主催者は、{h}だ。|覗き窓の向こうの目と、{a}の目が合った。見慣れた目元に、{a}は息を呑んだ。この穴を営んでいるのは、{h}だったのだ。|覗き窓の隙間から、帳場の机が少しだけ見えた。そこに置かれた湯呑みにも、走り書きの字にも、見覚えがあった。{a}「……{h}？　ここ、{h}のお店なの？」'),
react:{
proud:L('{a}「{h}、てめえか。ここから出たら、真っ先に殴る」|{a}は壁を拳で叩いた。「{h}！聞こえてるんだろう！」|{a}「道理で、ずいぶん底意地の悪い穴だと思った」'),
stern:L('{a}「{h}。……出たら、きちんと説明してもらう」|{a}は目を閉じて、深く息を吐いた。「{h}、商売は選べ」|{a}「仲間をこんな目に遭わせるとは、感心しないぞ、{h}」'),
tsun:L('{a}「はあ！？{h}のお店だったの！？最っ低！」|{a}は耳まで赤くなった。「{h}、ずっと見てたってこと！？」|{a}「べ、別に驚いてないし。{h}ならやりそうだし」'),
gentle:L('{a}は目を丸くしてから、困ったように笑った。「まあ、{h}のお店だったのね」|{a}「{h}ったら、こんな商売をしていたの」|{a}「{h}なら、ひどいことはしないわよね？」'),
devoted:L('{a}「{h}が……？じゃあ、{h}が見ててくれたんだ」|{a}はほっとしたように、肩の力を抜いた。「{h}がいるなら、大丈夫」|{a}「{h}のお店なら、最後までちゃんと待つから」'),
cool:L('{a}「なるほど。この遮断の精度は、{h}の仕事か」|{a}は小さく頷いた。「{h}なら、時間はきっちり守るはずだ」|{a}「{h}。あとで、この術式の仕組みを聞かせてもらう」'),
free:L('{a}「えっ、{h}なの！？すごい、これ{h}のお店！？」|{a}は思わず笑い出した。「{h}、ちょっと、出してよー！」|{a}「なあんだ、{h}かあ。ねえ、ついでに何か飲み物ちょうだい」'),
shy:L('{a}は両手で顔を覆った。「{h}に、こんな格好を見られてたなんて……」|{a}「う、うそ……{h}……？」|{a}は消え入りそうな声で呟いた。「も、もう、{h}の顔、見られない……」'),
polite:L('{a}は目を見開いてから、静かに息を整えた。「{h}さんでしたか。……あとで、お話を伺っても？」|{a}「{h}さんのお店だったのですね。存じませんでした」|{a}「なるほど、{h}さんが。……少々、驚きました」')
},
reactLove:L('{h}だと分かった途端、{a}の顔から強張りがすっと抜けた。|{a}は一瞬むっとしてから、{h}らしいと小さく笑った。|{a}は、{h}にずっと見られていたのだと思うと、急に顔が熱くなった。'),
reactBad:L('{a}の目つきが険しくなった。{h}にだけは、こんな姿を見られたくなかった。|{a}「よりによって{h}か」――声には、隠しきれない棘があった。|{a}は覗き窓を睨みつけ、二度と弱音を吐かないと決めた。'),
end:{
known:L('{a}が帳場に顔を出すと、{h}は気まずそうに帳簿を閉じた。{h}「……お代は、いらないから」{a}は何か言いかけて、結局ため息だけをついた。|{h}は、穴から出た{a}に温かい手ぬぐいを差し出した。{h}「おつかれさま。……怒ってる？」{a}の返事は、しばらく返ってこなかった。|{a}が身支度を整えるあいだ、{h}は帳場で黙って待っていた。主催者と客として向き合うのは、二人とも初めてだった。{a}が先に口を開くまで、{h}は顔を上げなかった。'),
hidden:L('最後まで、{a}はこの穴の主催者が{h}だとは気づかなかった。{h}は何食わぬ顔で、空いた穴の札を「準備中」に掛け替えた。帳簿の{a}の欄には、小さな印がひとつだけ付けられていた。|{a}が去ったあと、{h}はひとりで帳簿を閉じた。主催者の正体は、{h}だけの秘密になった。次に会ったとき、どんな顔をすればいいのかは分からなかった。|{h}は覗き窓の掛け金を下ろして、深く息をついた。{a}は、主催者が知り合いだとは最後まで知らないままだった。{h}はそれを、少しだけ寂しく思った。'),
mob:L('帰り際、受付には主催者の{h}が座っていた。{h}「またのお越しを」{a}は振り返らずに、まっすぐ出口へ向かった。|主催者の{h}は、帳簿の{a}の欄に「上客」と書き込んだ。それが褒め言葉なのかどうか、{a}には分からなかった。{a}は、二度とこの道を通らないと決めた。|{h}は空いた穴を丁寧に拭き清め、札を「空きあり」に戻した。主催者にとって、{a}は今日の大勢の客のひとりにすぎなかった。表の通りには、もう次の客が立っていた。'),
knownFall:L('主催者の{h}は、穴に戻っていく{a}の背中を、覗き窓から黙って見送った。止めるべきか迷ううちに、札は「使用中」に掛け替わっていた。{h}は帳簿の{a}の欄に、そっと「常連」と書き足した。|{h}は帳場を出て、壁の前に立つ{a}の肩に手を置きかけた。けれど{a}の蕩けた横顔を見て、{h}はその手を引っ込めた。主催者として、知り合いとして、何を言えばいいのか分からなかった。|{a}「{h}のお店、また来てもいい？」――そう尋ねられて、{h}はしばらく答えられなかった。やがて{h}は黙って頷き、帳簿の新しい頁を開いた。主催者の指は、ほんの少しだけ震えていた。'),
hiddenFall:L('{a}は最後まで、この穴の主催者が{h}だとは知らなかった。{h}は覗き窓の向こうで、穴へ戻っていく{a}を見届けた。帳簿の{a}の欄には、もう印を付ける余白がなかった。|主催者の{h}は、自分から戻ってきた{a}の札を、黙って「使用中」に掛け替えた。{a}は、帳場にいるのが誰なのかを知らないままだった。{h}は、それでいいと思うことにした。|{h}は計器の針を見つめたまま、長いあいだ動かなかった。壁にはまっているのが{a}だということを、{h}だけが知っていた。主催者の秘密は、日を追うごとに重くなっていった。'),
mobFall:L('主催者の{h}は、戻ってきた{a}に「おかえりなさい」と微笑んだ。帳簿の{a}の欄には、「常連」の印が増えていった。{a}は、それを誇らしく思うようになっていた。|{h}は{a}のために、いちばん端の穴を空けておくようになった。主催者にとって、{a}はもう上客のひとりだった。{a}が通りに姿を見せると、札は黙って「空きあり」に変わった。|主催者の{h}は、帳簿を閉じて満足げに息をついた。{a}のような客がいる限り、この穴が空になることはない。表の札は、今日も「使用中」のままだった。'),
freed:L('予定の時間より早く遮断を解いたのは、主催者の{h}だった。|{a}を途中で穴から出したのは、主催者の{h}の判断だった。|時間を待たずに{a}を出すと決めたのは、主催者の{h}だった。')
}
};
function pk(S,arr){
var U=S.hostUse=S.hostUse||{},free=[],i,t,r=S.hostR;
for(i=0;i<arr.length;i++)if(!U[arr[i]])free.push(arr[i]);
if(free.length)t=free[r.int(free.length)];
else{t=arr[0];for(i=1;i<arr.length;i++)if(U[arr[i]]<U[t])t=arr[i];}
S.hostUseN=(S.hostUseN||0)+1;U[t]=S.hostUseN;
return t;
}
function nm(s,m){return s.replace(/\{(a|h)\}/g,function(x,k){return m[k]!=null?m[k]:x;});}
function sidePick(input,i){return((input.perChar&&input.perChar[i]&&input.perChar[i].pick)||{}).side;}
function hostYes(input,i){return((input.perChar&&input.perChar[i]&&input.perChar[i].pick)||{}).host==='yes';}
var NEAR= /^(lover|mate|fated|spouse|almost|crush|fwb|best|childhood|buddy|sibclose|sibprot|parent|worship)$/,BAD= /^(rival|enemy|bad|sibbad|ex)$/;
function tieOf(input,a,b){
var o={near:false,bad:false};
(input.ties||[]).forEach(function(t){
if(!((t.a===a&&t.b===b)||(t.a===b&&t.b===a)))return;
if(NEAR.test(t.type)&&(t.type!=='crush'||t.a===a))o.near=true;
if(BAD.test(t.type))o.bad=true;
});
return o;
}
var HH=HK.HoleHost={text:T};
HH.resolve=function(input){
var chars=(input&&input.chars)||[],env=(input&&input.env)||{};
var src=env[HK.Roles.envId('host')]||'auto';
var anyYes=chars.some(function(c,i){return hostYes(input,i);});
if(src==='none'||(src==='auto'&& !anyYes))return{kind:'none',i: -1};
var list=[];
chars.forEach(function(c,i){
if(sidePick(input,i)&& !hostYes(input,i))return;
var x={};for(var k in c)x[k]=c[k];x.i=i;x.tr=HK.traits(c.eg);list.push(x);
});
var rng=HK.rng(((+input.seed||0)*131+7919)>>>0);
var r=HK.Roles.resolve({rng:rng,env:env,chars:list},'host',input,ROLE);
if(r.kind==='res'&&chars.length<2)return{kind:'none',i: -1};
if(r.kind==='res')return{kind:'res',i:r.who[0].i};
if(r.kind==='mob')return{kind:'mob',i: -1,mob:r.mob};
return{kind:'none',i: -1};
};
HH.idx=function(input){return HH.resolve(input).i;};
HH.setup=function(S,input){
S.host=null;
var r=HH.resolve(input);
if(r.kind==='none')return null;
var h;
if(r.kind==='res'){
var c=input.chars[r.i];
h={i:r.i,name:c.name,eg:c.eg,tr:HK.traits(c.eg),gender:c.gender||'',likes:c.likes||'',tone:c.tone||'',pos:c.pos||'',futa: !!c.futa,
ng:Array.isArray(c.loveNG)?c.loveNG.filter(function(x){return x>=0;}):[],lock:HK.lockFirst(c.loveLock),locks:HK.parseLocks(c.loveLock),kind:'res'};
if(HK.charFlags)HK.charFlags(c,h,'hole');
var tt=tieOf(input,r.i,S.h.i);
h.near=tt.near;h.bad=tt.bad;
}else{h=r.mob;h.i= -1;h.kind='mob';h.tr=h.tr||HK.traits(h.eg);}
h.persona=HK.personaOf(h);
S.host=h;S.hostR=HK.rng(((+input.seed||0)*37+104729)>>>0);
S.hostN=0;S.hostKnown=h.kind==='mob';S.hostFreed=false;
return h;
};
HH.start=function(S){
var h=S.host;if(!h)return;
var o=K.say(S,{kind:'sys',tag:'主催者',text:nm(pk(S,T.intro[h.kind]),{h:h.name,a:S.h.name}),why:h.kind==='res'?'主催者：'+h.name+'（住人。穴にも壁の向こうにも入らない）':'主催者：'+h.name+'（モブ）'});
K.key(S,o,'主催者'+h.name+'の遮断穴');
};
function discover(S,how){
var h=S.host,a=S.h;
if(S.hostKnown||h.kind!=='res')return null;
S.hostKnown=true;
var t=nm(pk(S,T.discover),{h:h.name,a:a.name})+' '+nm(pk(S,T.react[a.persona]||T.react.gentle),{h:h.name,a:a.name});
var love=HK.canLove&&HK.canLove(a,h)&&HK.canLove(h,a);
if(h.near&&love)t+=nm(pk(S,T.reactLove),{h:h.name,a:a.name});
else if(h.bad)t+=nm(pk(S,T.reactBad),{h:h.name,a:a.name});
var o=K.say(S,{kind:'ev',tag:'主催者の正体',text:t,why:how||'主催者が知り合いだと気づいた'});
K.key(S,o,'主催者が'+h.name+'だと気づいた');
return o;
}
HH.tick=function(S,st){
var h=S.host,a=S.h,r=S.hostR,out={stored:st.stored,release:false};
if(!h)return out;
if((S.hostN||0)>=3||r()>0.28){
if(r()<0.3)K.say(S,{kind:'ev',tag:'主催者',text:nm(pk(S,T.comment[h.persona]||T.comment.gentle),{h:h.name,a:a.name}),why:h.name+'の品評（態度「'+(HK.PERSONA[h.persona]?HK.PERSONA[h.persona].label:h.persona)+'」）'});
return out;
}
var t=h.tr,opts=[],ng= !!(HK.ngPair&&HK.ngPair(h,a));
var worry=st.stored>160||a.corrupt>60||(st.live&&a.pleasure>70);
if(worry&&h.kind==='res'&&(h.near||t.np>0.6))opts.push(['save',0.5+t.np*0.8+(h.near?0.6:0)]);
if(worry&&h.kind==='mob'&&a.corrupt>85)opts.push(['save',0.15]);
if(!ng)opts.push(['boost',0.4+t.fc*0.5+t.cp*0.3+(h.kind==='mob'?0.4:0)-(h.near?0.3:0)]);
opts.push(['tease',0.3+t.fc*0.4+t.ac*0.2]);
var p=HK.weighted(r,opts,function(o){return o[1];});
if(!p)return out;
S.hostN++;
if(h.kind==='res'&& !S.hostKnown&&r()<(p[0]==='boost'?0.2:0.45))discover(S,'伝声管の声・覗き窓の目で気づいた');
if(p[0]==='save'){
S.hostFreed=true;out.release=true;
var o=K.say(S,{kind:'sys',tag:'主催者の助け舟',text:nm(pk(S,T.save),{h:h.name,a:a.name}),why:h.name+'が、予定より早く遮断を解いた（溜まった感覚 '+Math.round(st.stored)+'・堕ち度 '+Math.round(a.corrupt)+'）'});
K.key(S,o,h.name+'が早めに出した');
}else if(p[0]==='boost'){
if(st.hardTop)K.say(S,{kind:'ev',tag:'主催者の呼び込み',text:nm(pk(S,T.boost.top),{h:h.name,a:a.name}),why:st.guard?'性行為の相手を固定した相手だけにしているので、呼び込んだ客は追い払われた':'自分で攻めを選んでいるので、呼び込んだ客は追い払われた'});
else if(st.live){
var rs=K.stim(S,12+S.env.wild/10,{part:'belly',defer:true});
K.say(S,{kind:'ev',tag:'主催者の呼び込み',text:nm(pk(S,T.boost.live),{h:h.name,a:a.name}),why:h.name+'が客を呼び込んだ（感覚は戻っている）'});
K.logClimax(S,rs.climaxes);
}else{
out.stored+=(30+S.env.wild*0.4)*(a.sens||1);
K.say(S,{kind:'ev',tag:'主催者の呼び込み',text:nm(pk(S,T.boost.pre),{h:h.name,a:a.name}),why:h.name+'が客を呼び込み、遮断を深めた（溜まった感覚 '+Math.round(out.stored)+'）'});
a.corrupt+=1.5*(S.k||1);
}
}else{
a.reason-=3+a.tr.ac*4;
K.say(S,{kind:'ev',tag:'主催者の声',text:nm(pk(S,T.tease),{h:h.name,a:a.name}),why:h.name+'がからかった（AC '+Math.round(a.eg.AC)+'）'});
}
K.settle(S);
return out;
};
HH.end=function(S,E){
var h=S.host,a=S.h;
if(!h|| !E|| !Array.isArray(E.lines))return E;
if(h.kind==='res'&& !S.hostKnown&&(S.hostFreed||S.hostR()<0.5))discover(S,S.hostFreed?'穴から出してくれた人の顔を見た':'帰り際、帳場で顔を合わせた');
if(S.hostFreed){
E.lines.push(nm(pk(S,T.end.freed),{h:h.name,a:a.name}));
if(/^自力脱出/.test(E.title||''))E.title=E.title.replace(/^自力脱出/,'途中で解放');
}
var k0=h.kind==='mob'?'mob':S.hostKnown?'known':'hidden';
E.lines.push(nm(pk(S,T.end[k0+(E.kind==='over'?'Fall':'')]||T.end[k0]),{h:h.name,a:a.name}));
return E;
};
HH.finish=function(S,res){
var h=S.host;if(!h|| !res)return res;
res.host={name:h.name,kind:h.kind,i:h.i,known: !!S.hostKnown,freed: !!S.hostFreed};
res.summary+='／主催者：'+h.name+(h.kind==='mob'?'（モブ）':'');
return res;
};
})();
});
;
/* ==== js/solo-hole-data.js ==== */
HK.Load.def(459,'js/solo-hole-data.js',function(){
(function(){
'use strict';
var HK=window.HK;
var H=HK.HoleMore={};
function E(lv,t,fx){return{lv:lv,t:t,fx:fx||{}};}
H.BEYOND={
toilet:[
E(0,'壁の向こうで、酔った男が「なんだこれ」と笑った。男は{a}の尻を平手で一度叩いて、写真を一枚撮って出ていった。',{n:1}),
E(0,'向こう側の壁に、誰かがマジックで「ご自由に」の下に「使用済み」と書き足した。それから正の字の一画目を引いた。',{mark:1}),
E(0,'清掃員が壁の向こうを掃除しに来た。モップの柄で{a}の太腿をつつき、「またか」とため息をついて、そのまま掃除を続けた。',{n:1}),
E(0,'男が二人、小便をしながら{a}の下半身を品定めした。「肌きれいだな」「あとで来ようぜ」――二人は手も洗わずに出ていった。',{n:2}),
E(1,'仕事帰りのスーツの男が、ネクタイも緩めないまま{a}の腰を掴んだ。そのまま無言で奥まで突き入れ、数分で{a}の中に吐き出して、何事もなかったように出ていった。',{n:1,cum:1}),
E(1,'若い男が、震える指で{a}の性器を何度もまさぐった。慣れていないらしく、ずいぶん時間をかけてから、ようやく{a}の中に入ってきた。終わったあと、男は小さく「ありがとう」と言った。',{n:1,cum:1}),
E(1,'男が{a}の脚を左右に押し広げ、指で奥まで掻き回した。中がほぐれきるまで、男は何分でも指を止めなかった。',{n:1}),
E(1,'男は{a}の尻に冷たいローションを垂らし、そのまま後ろの穴にねじ込んだ。{a}の腰が、壁の向こうで何度も跳ねた。',{n:1,cum:1}),
E(2,'個室の前に、いつの間にか三人の列ができていた。一人が終わるたびに、次の男が{a}の中にまだ残っているものを指で掻き出して笑い、また同じ場所を使った。',{n:3,cum:3,mark:3}),
E(2,'男たちは{a}の両脚を持ち上げて、二人がかりで前と後ろを同時に塞いだ。壁が、二人分のリズムでばらばらに揺れた。',{n:2,cum:2}),
E(2,'常連らしい男が「今日もいるな」と言って、慣れた手つきで{a}の一番弱いところだけを執拗に突き上げた。向こう側の{a}の脚は、つま先まで反り返って痙攣していた。',{n:1,cum:1,mark:1}),
E(2,'男は{a}の中に出したあと、まだ硬いまま抜かずに二回目を始めた。{a}の太腿を、白いものが伝い落ちていった。',{n:1,cum:2}),
E(1,'誰かが{a}の性器にローターを押し込んで、テープで固定して出ていった。スイッチは入ったままだった。それから一時間、{a}の腰は誰もいない個室で震え続けた。',{tent:1}),
E(0,'男が{a}の内腿にマジックで「肉便器」と書いた。その下に、日付と正の字が書き足された。',{mark:2}),
E(2,'大学生らしいグループがやってきた。「順番な」「お前さっきやったろ」――五人が交代で{a}を使い終えるまで、個室の扉は一度も閉まらなかった。',{n:5,cum:5,mark:5}),
E(1,'男は{a}の性器を舌で舐め上げ、溢れたものを啜った。{a}の腰は、本人の知らないところで男の顔に押しつけられていた。',{n:1}),
E(2,'男は{a}の腰を抱え込み、射精する瞬間に一番奥まで押し込んだ。「全部飲めよ」――{a}の中は、もう前の誰かのものと混ざり合っていた。',{n:1,cum:1}),
E(0,'向こう側で、スマホのシャッター音が何度も鳴った。誰かが、{a}の下半身を角度を変えて撮っていた。',{n:1,mark:1}),
E(1,'男が{a}の中に指を二本入れ、くの字に曲げて同じ場所を擦り続けた。{a}の体は、壁の向こうで何度も潮を噴いた。床のタイルが濡れて光った。',{n:1}),
E(2,'夜中、作業着の男たちが仕事終わりに立ち寄った。四人分を受け止めたあと、{a}の腰の下には白い水たまりができていた。最後の男が、それを{a}の性器に塗り込んで帰った。',{n:4,cum:4,mark:4})
],
lab:[
E(0,'魔術師が羊皮紙を片手に、{a}の性器の形を細かくスケッチしていた。「感覚遮断下での充血反応。興味深い」',{mark:1}),
E(0,'魔術師は細い真鍮の棒で、{a}の内腿を一定の間隔でつついた。そのたびに筋肉が跳ねる回数を、助手が記録した。',{mark:1}),
E(1,'「第三実験。媚薬の経皮吸収」――魔術師は小瓶の液体を、{a}の性器にたっぷりと塗り込んだ。{a}の{女性器}は、触れられてもいないのにひくひくと震え始めた。',{tent:1}),
E(1,'魔術師は水晶の張り型を{a}の奥にゆっくり沈め、光の色が変わるのを観察した。「感度、通常の三倍」――{a}の中で、水晶が淡く脈打っていた。',{tent:1,mark:1}),
E(1,'使い魔のスライムが、魔術師の指示で{a}の下半身を覆った。スライムは{a}の性器の隙間という隙間に入り込み、内側からゆっくりと撫で回した。',{tent:2}),
E(2,'「容量の測定を行う」――魔術師はガラスの器具で{a}の中を押し広げ、測るたびに一段階ずつ大きいものに取り替えていった。',{tent:2,mark:1}),
E(1,'弟子たちが実習で、順番に{a}の性器に触れた。「ここが{陰核}、ここが……」「先生、反応がすごいです」',{n:3}),
E(2,'魔術師は召喚した触手の苗を{a}の中に植えつけた。「遮断が解けるまでに、どこまで根を張るか」――細い触手が、{a}の奥でゆっくりと蠢き始めた。',{tent:3}),
E(0,'助手が「先生、濡れてきてます」と報告した。魔術師は「感覚がないのに？記録しておけ」と言った。',{mark:1}),
E(2,'魔術師は{a}の性器に電極代わりの魔法陣を貼り、魔力を少しずつ流した。{a}の腰は、本人の知らないところで十五分間に七回、跳ね上がって果てた。',{mark:7}),
E(1,'魔術師の助手が、記録の合間にこっそり{a}の中に入ってきた。「……すみません、先生には内緒で」――助手は短く果てて、何事もなかったように白衣を直した。',{n:1,cum:1}),
E(2,'「繁殖実験、開始」――魔術師が連れてきたのは、人の形をしたホムンクルスだった。それは無表情のまま、何時間も休まずに{a}を犯し続け、そのたびに{a}の中を満たしていった。',{n:1,cum:4}),
E(1,'魔術師は細い筆に媚薬を含ませ、{a}の性器を一本一本の襞までなぞった。「ここの反応が最も強い」――筆先は、そこから離れなかった。',{tent:1}),
E(0,'研究室の扉が開き、別の魔術師が見学に来た。「ほう、これが噂の」――二人は{a}の下半身の前で、学会の話をしていた。',{n:1}),
E(2,'魔術師は{a}の奥に、魔力を溜め込む卵型の結晶を三つ押し込んだ。「解放の瞬間に、まとめて共鳴させる」――{a}の中で、結晶同士がかすかに擦れ合った。',{tent:3,mark:1}),
E(1,'使い魔の黒猫が、{a}の太腿から垂れたものを熱心に舐め取っていた。ざらついた舌が、何度も{a}の性器をかすめた。',{tent:1}),
E(2,'壁の向こうで、魔術師は弟子たちに命じた。「全員で一回ずつ。精液の魔力反応を比較する」――{a}の中は、六人分の魔力で淡く光り始めた。',{n:6,cum:6,mark:6}),
E(1,'魔術師は{a}の後ろの穴に、細い管を差し込んで温かい薬液を注いだ。「浄化の儀だ」――薬液は、{a}の腹の奥まで満たしていった。',{tent:1}),
E(0,'魔術師は記録紙の最後に「被験体：本人は無自覚」と書き、それに二重線を引いて「今のところは」と書き足した。',{mark:1}),
E(2,'魔術師の実験台が{a}の腰の位置まで上げられ、拘束具が脚を大きく開かせた。それから三時間、魔術師は記録を取りながら、ありとあらゆる道具で{a}を試し続けた。',{tent:4,mark:3})
],
show:[
E(0,'「さあさあ、壁から生えた不思議な下半身！触るのは一回百円！」――客が硬貨を投げ入れ、{a}の尻を撫でていった。',{n:3,mark:1}),
E(0,'客引きが{a}の脚を広げて見せ、「ほら、本物ですよ」と客に見せびらかした。どよめきが起きた。',{n:5}),
E(1,'「ここからは追加料金！」――料金を払った客が、{a}の性器を指で思うままにまさぐった。後ろには、もう次の客が並んでいた。',{n:4}),
E(2,'「本日の目玉、使い放題の時間です！」――太鼓が鳴った。それから一時間、{a}の前の列は途切れなかった。',{n:8,cum:8,mark:2}),
E(1,'酔った客が、屋台の焼き鳥の串の持ち手で{a}の性器を弄んだ。周りの客が手を叩いて笑った。',{n:1}),
E(1,'「さあ、何回イくか当てた方に景品！」――客が賭けをしている間、見世物小屋の主人が{a}の性器を指で責め続けた。{a}は本人も知らないまま、九回果てた。',{n:1,mark:9}),
E(2,'見世物小屋の主人は、{a}を「品評会」に出した。審査員を名乗る男たちが代わる代わる{a}の中を試し、「締まり：特上」と札をつけた。',{n:3,cum:3,mark:1}),
E(0,'客の一人が、{a}の太腿に投げ銭を挟んでいった。いつの間にか、{a}の腰のまわりは小銭だらけになっていた。',{n:6,mark:1}),
E(1,'「張り型の貸し出しはこちら！」――客が自分で選んだ道具を、{a}の中に試していった。太いもの、長いもの、震えるもの。',{n:5,tent:3}),
E(2,'夜の部が始まった。男たちは酒をあおりながら、{a}の前で順番を争った。最後の一人が終わるころには、{a}の脚の間から白いものが溢れ続けていた。',{n:7,cum:7}),
E(0,'悪戯好きの酔客が、{a}の足の裏をくすぐって大笑いしていた。{a}の足の指は、本人の知らないところで丸まって震えていた。',{n:1}),
E(1,'「お二人様、ご一緒にどうぞ！」――カップル客が、二人がかりで{a}の前と後ろを舐め回した。',{n:2}),
E(2,'見世物小屋の主人が「本日は特別に、中に出し放題！」と叫んだ。歓声が上がった。{a}の腹が、注がれた量でかすかに膨らんでいった。',{n:6,cum:9,mark:1}),
E(1,'常連客が「先週より敏感になってるな」と言いながら、{a}の性器を慣れた指つきで開いた。',{n:1,mark:1}),
E(0,'「触ったら罰金」の札が掛けられた。札の前で、客たちはわざと罰金を払って{a}に触れた。',{n:4,mark:1}),
E(2,'主人は大きな張り型を{a}の奥まで押し込み、その上から客に腰を使わせた。「二本同時は追加料金！」',{n:3,cum:3,tent:1}),
E(1,'客が{a}の{陰核}に洗濯ばさみを挟み、指で弾いて遊んだ。{a}の腰が跳ねるたびに、客席から拍手が起きた。',{n:2}),
E(0,'芸人が{a}の尻を太鼓代わりに叩いて、即興の歌を歌った。客は大笑いだった。',{n:1}),
E(2,'閉場間際、残っていた客が全員で{a}を囲んだ。「最後の一発、どうぞ！」――幕が下りるまで、{a}は何人分を受け止めたのか、誰も数えていなかった。',{n:10,cum:10}),
E(1,'主人は{a}の性器に「本日の売上」と書かれた札を差し込み、その日の稼ぎを数えていた。',{mark:1})
],
dungeon:[
E(1,'壁の向こうで、太い触手が{a}の太腿に巻きついた。先端が{a}の性器を探り当て、ぬるぬると入り口をまさぐり始めた。',{tent:1}),
E(2,'何本もの細い触手が、{a}の性器の襞を一枚ずつめくるように撫で回し、その奥へ順番に潜り込んでいった。',{tent:3}),
E(1,'スライムが{a}の下半身をすっぽりと包み込んだ。透明な体の中で、{a}の性器がスライムに吸われてひくついているのが、外からでも見えた。',{tent:2}),
E(2,'触手が{a}の前と後ろに同時に入り込み、中で絡み合いながら奥へ奥へと進んだ。{a}の下腹が、内側からかすかに盛り上がった。',{tent:4}),
E(2,'産卵管を持つ触手が、{a}の奥に柔らかい卵を一つ、また一つと産みつけていった。{a}の腹が、ゆっくりと重くなっていく。',{tent:3,cum:2}),
E(1,'吸盤のついた触手が、{a}の{陰核}に吸いついて離れなかった。吸盤が脈打つたびに、{a}の腰は壁の向こうで震えた。',{tent:1}),
E(0,'冒険者のパーティが壁の向こうを通りかかった。「うわ、罠にかかってる」「助ける？」「……触ってからでいいだろ」',{n:3}),
E(2,'冒険者たちは「助ける前に、ちょっとだけ」と言いながら、結局全員で{a}を使った。最後の一人が「回復薬、置いとくわ」と言って去っていった。',{n:4,cum:4}),
E(1,'ミミックが{a}の腰の下に口を開け、長い舌で{a}の性器を根元から舐め上げた。何度も、何度も。',{tent:2}),
E(2,'触手の先端から、甘い匂いの粘液が{a}の中に直接注がれた。粘液は媚薬だった。{a}の性器は、触れられなくても勝手にひくつき、蜜を垂らし続けた。',{tent:2,cum:3}),
E(1,'蔓植物の罠が{a}の脚に絡みつき、大きく開かせて固定した。開いた{a}の性器を、花の雄しべがくすぐるように撫で回した。',{tent:2}),
E(2,'ゴブリンの群れが{a}を見つけた。甲高い声で順番を争いながら、群れの全員が{a}の中に種を残していった。',{n:6,cum:6}),
E(0,'小さな触手が一本、{a}の足首から膝の裏までを、確かめるようにゆっくり這い上がった。それから、迷うことなく脚の付け根へ向かった。',{tent:1}),
E(2,'触手は{a}の中を満たしたまま、一定のリズムで脈打ち続けた。一時間に一度、熱い液を奥に吐き出した。',{tent:2,cum:3}),
E(1,'スライムの一部が{a}の性器に入り込み、中で形を変えながら、{a}の一番弱いところを覚えていった。',{tent:2}),
E(1,'触手の細い先端が、{a}の尿道の入り口をくすぐるようにつついた。{a}の腰は、本人の知らないところでがくがくと震えていた。',{tent:1}),
E(2,'ダンジョンの主が、{a}を「苗床」に選んだ。太い触手が{a}の奥に根を下ろし、そこから細い触手が何本も生え、中を休みなく撫で回し始めた。',{tent:5,cum:2}),
E(0,'迷宮の壁の向こうで、宝箱を開けた冒険者が「ハズレか」と呟いた。宝箱の中身は、{a}を責めるための道具ばかりだった。',{n:1}),
E(2,'オークが一体、{a}の腰を鷲掴みにした。人のものとは比べものにならない大きさで、{a}の奥を押し広げ、大量の精を注ぎ込んだ。',{n:1,cum:2}),
E(1,'触手は{a}の性器を咥え込むように覆い、内側の無数の突起で、{a}をしごき上げ続けた。',{tent:2})
],
white:[
E(0,'白い壁の向こうで、機械のアームが静かに動き出した。最初は、{a}の太腿の温度を測っているだけだった。',{mark:1}),
E(1,'機械のアームの先端が、{a}の性器の形をなぞるように、精密に一周した。アナウンスが流れた。「被験者、反応良好」',{tent:1,mark:1}),
E(2,'天井から降りてきた機械が、{a}の奥に挿入され、一定の速度でピストンを始めた。速度は十分ごとに一段階ずつ上がっていった。',{tent:3}),
E(1,'向こう側の部屋にも、もう一人閉じ込められている人がいた。その人の机の紙には「壁の穴を使えば出られる」と書いてあった。その人は、震える手で{a}の腰に触れた。',{n:1,cum:1}),
E(0,'向こう側の部屋のモニターに、{a}の下半身が大写しで映し出された。画面の隅には、数字が増えていくカウンターがあった。',{mark:1}),
E(1,'吸引機のような装置が{a}の{陰核}に取りつけられ、吸っては離し、吸っては離しを繰り返した。カウンターが一つずつ増えていった。',{tent:2,mark:3}),
E(2,'「条件：被験者を十回絶頂させる」――向こう側の部屋の住人は、その紙を読んで、ためらいながら{a}に触れ始めた。十回に届くまで、手は止まらなかった。',{n:1,mark:10}),
E(1,'白い部屋のスピーカーから、合成音声が流れた。「媚薬ガスを注入します」――{a}の下半身側にだけ、甘い霧が満ちていった。',{tent:1}),
E(2,'機械は{a}の前と後ろに、同時に振動する器具を差し込んだ。二つの振動が、{a}の中の薄い壁越しに共鳴した。',{tent:4}),
E(0,'向こう側の住人が、{a}の太腿に「ごめんなさい」と指で書いた。何度も、何度も。',{n:1}),
E(1,'機械が温かい液体を{a}の中に注入した。成分表示が壁に映った。「人工精液（観察用）」',{tent:1,cum:2}),
E(2,'「出口の条件：中に三回出すこと」――向こう側の住人は、条件を満たすために、泣きながら{a}の中で三回果てた。扉が開く音がした。',{n:1,cum:3}),
E(1,'細いアームが{a}の性器を左右に開き、中をカメラで撮影した。モニターには「記録完了」の文字が出た。',{mark:2}),
E(0,'白い部屋の床が少し傾き、{a}の腰の位置がわずかに持ち上がった。これから何をするのに都合のいい角度なのかは、明らかだった。',{}),
E(2,'機械は{a}が果てるたびにカウンターを一つ進め、果てた直後の一番敏感な瞬間に、また同じ場所を責め直した。カウンターは止まらなかった。',{tent:3,mark:8}),
E(1,'向こう側の部屋に、新しい住人が二人送り込まれた。紙には「協力して壁の向こうの被験者を満たせ」と書いてあった。',{n:2,cum:2}),
E(0,'壁に表示された数字が「経過：◯時間」から「残り：◯時間」に切り替わった。その下に、小さく「満足度」のゲージがあった。',{mark:1}),
E(2,'「最終試験」――機械のアームが八本、{a}の下半身のあらゆる場所を同時に責め始めた。性器も、後ろも、内腿も、足の裏も。',{tent:6}),
E(1,'向こう側の住人は、条件を満たしたあとも部屋に残り、自分の意思で{a}に触れ続けた。',{n:1,cum:1}),
E(0,'天井のスピーカーから、拍手の効果音が鳴った。「おめでとうございます。被験者は本日、新記録を達成しました」――何の記録かは、言わなかった。',{mark:1})
]
};
H.BEYOND_FEM={toilet:[5,9,12,15,18,19],lab:[2,4,6,8,12],show:[11,13,16,19],dungeon:[0,1,3,5,9,10],white:[5,8,12]};
H.BEYOND_MALE={
toilet:{
5:E(1,'若い男が、震える指で{a}のものを何度も握り直した。慣れていないらしく、ずいぶん時間をかけてから、ようやく{a}の後ろに入ってきた。終わったあと、男は小さく「ありがとう」と言った。',{n:1,cum:1}),
9:E(2,'男たちは{a}の腰を二人がかりで抱え込んだ。一人が後ろを塞ぎ、もう一人が{a}のものを口に含んだ。壁が、二人分のリズムでばらばらに揺れた。',{n:2,cum:1}),
12:E(1,'誰かが{a}のものの根元にローターをテープで巻きつけて出ていった。スイッチは入ったままだった。それから一時間、{a}の腰は誰もいない個室で震え続けた。',{tent:1}),
15:E(1,'男は{a}のものを喉の奥まで咥え込み、先から溢れたものを啜った。{a}の腰は、本人の知らないところで男の顔に押しつけられていた。',{n:1}),
18:E(1,'男が{a}の後ろに指を二本入れ、くの字に曲げて同じ場所を擦り続けた。{a}のものは触れられてもいないのに、壁の向こうで何度も白いものを噴いた。床のタイルが濡れて光った。',{n:1}),
19:E(2,'夜中、作業着の男たちが仕事終わりに立ち寄った。四人分を受け止めたあと、{a}の腰の下には白い水たまりができていた。最後の男が、それを{a}のものに塗りつけて帰った。',{n:4,cum:4,mark:4})
},
lab:{
2:E(1,'「第三実験。媚薬の経皮吸収」――魔術師は小瓶の液体を、{a}のものにたっぷりと塗り込んだ。{a}のものは触れられてもいないのに硬く張りつめ、先を濡らし始めた。',{tent:1}),
4:E(1,'使い魔のスライムが、魔術師の指示で{a}の下半身を覆った。スライムは{a}のものを包み込んだまま、後ろの入り口からも内側へ入り込み、ゆっくりと撫で回した。',{tent:2}),
6:E(1,'弟子たちが実習で、順番に{a}の体に触れた。「ここが前立腺の位置で、ここが……」「先生、反応がすごいです」',{n:3}),
8:E(0,'助手が「先生、勃ってきてます」と報告した。魔術師は「感覚がないのに？記録しておけ」と言った。',{mark:1}),
12:E(1,'魔術師は細い筆に媚薬を含ませ、{a}のものを根元から先まで、裏側の筋に沿ってなぞった。「ここの反応が最も強い」――筆先は、そこから離れなかった。',{tent:1})
},
show:{
11:E(1,'「お二人様、ご一緒にどうぞ！」――カップル客が、二人がかりで{a}のものと後ろを同時に舐め回した。',{n:2}),
13:E(1,'常連客が「先週より敏感になってるな」と言いながら、{a}のものを慣れた手つきで扱いた。',{n:1,mark:1}),
16:E(1,'客が{a}のものの先に洗濯ばさみを挟み、指で弾いて遊んだ。{a}の腰が跳ねるたびに、客席から拍手が起きた。',{n:2}),
19:E(1,'主人は{a}のものに「本日の売上」と書かれた札を巻きつけ、その日の稼ぎを数えていた。',{mark:1})
},
dungeon:{
0:E(1,'壁の向こうで、太い触手が{a}の太腿に巻きついた。先端が{a}の後ろの入り口を探り当て、ぬるぬるとまさぐり始めた。',{tent:1}),
1:E(2,'何本もの細い触手が{a}のものに幾重にも絡みつき、残りの何本かが、後ろの奥へ順番に潜り込んでいった。',{tent:3}),
3:E(2,'触手が{a}のものを締め上げながら、後ろの奥へ奥へと進んだ。{a}の下腹が、内側からかすかに盛り上がった。',{tent:4}),
5:E(1,'吸盤のついた触手が、{a}のものの先に吸いついて離れなかった。吸盤が脈打つたびに、{a}の腰は壁の向こうで震えた。',{tent:1}),
9:E(2,'触手の先端から、甘い匂いの粘液が{a}の中に直接注がれた。粘液は媚薬だった。{a}のものは触れられなくても勝手に跳ね、先から雫を垂らし続けた。',{tent:2,cum:3}),
10:E(1,'蔓植物の罠が{a}の脚に絡みつき、大きく開かせて固定した。張りつめた{a}のものを、花の雄しべがくすぐるように撫で回した。',{tent:2})
},
white:{
5:E(1,'吸引機のような装置が{a}のものに被せられ、吸っては離し、吸っては離しを繰り返した。カウンターが一つずつ増えていった。',{tent:2,mark:3}),
8:E(2,'機械は{a}の後ろに振動する器具を差し込み、{a}のものの根元にも振動するリングをはめた。二つの振動が、{a}の体の中で共鳴した。',{tent:4}),
12:E(1,'細いアームが{a}の後ろを左右に開き、中をカメラで撮影した。モニターには「記録完了」の文字が出た。',{mark:2})
}
};
H.BEYOND_NEU={
toilet:{
5:E(1,'若い男が、震える指で{a}の腰の奥を何度もまさぐった。慣れていないらしく、ずいぶん時間をかけてから、ようやく{a}の後ろに入ってきた。終わったあと、男は小さく「ありがとう」と言った。',{n:1,cum:1}),
9:E(2,'男たちは{a}の両脚を持ち上げて、二人がかりで代わる代わる後ろを塞いだ。一人が抜けば、もう一人がすぐに入れ替わった。壁が、二人分のリズムでばらばらに揺れた。',{n:2,cum:2}),
12:E(1,'誰かが{a}の後ろにローターを押し込んで、テープで固定して出ていった。スイッチは入ったままだった。それから一時間、{a}の腰は誰もいない個室で震え続けた。',{tent:1}),
15:E(1,'男は{a}の内腿から脚の付け根まで、舌でゆっくりと舐め上げた。{a}の腰は、本人の知らないところで男の顔に押しつけられていた。',{n:1}),
18:E(1,'男が{a}の後ろに指を二本入れ、くの字に曲げて同じ場所を擦り続けた。{a}の腰は、壁の向こうで何度もがくがくと跳ねた。床のタイルが濡れて光った。',{n:1}),
19:E(2,'夜中、作業着の男たちが仕事終わりに立ち寄った。四人分を受け止めたあと、{a}の腰の下には白い水たまりができていた。最後の男が、それを{a}の内腿に塗り広げて帰った。',{n:4,cum:4,mark:4})
},
lab:{
2:E(1,'「第三実験。媚薬の経皮吸収」――魔術師は小瓶の液体を、{a}の脚の付け根にたっぷりと塗り込んだ。{a}の腰は、触れられてもいないのにひくひくと震え始めた。',{tent:1}),
4:E(1,'使い魔のスライムが、魔術師の指示で{a}の下半身を覆った。スライムは肌の隙間という隙間に入り込み、後ろの入り口からも内側へ潜って、ゆっくりと撫で回した。',{tent:2}),
6:E(1,'弟子たちが実習で、順番に{a}の下半身に触れた。「ここが一番敏感な場所で、ここが……」「先生、反応がすごいです」',{n:3}),
8:E(0,'助手が「先生、肌が上気してきました」と報告した。魔術師は「感覚がないのに？記録しておけ」と言った。',{mark:1}),
12:E(1,'魔術師は細い筆に媚薬を含ませ、{a}のいちばん敏感なところを、ゆっくりと何度もなぞった。「ここの反応が最も強い」――筆先は、そこから離れなかった。',{tent:1})
},
show:{
11:E(1,'「お二人様、ご一緒にどうぞ！」――カップル客が、二人がかりで{a}の内腿と後ろを舐め回した。',{n:2}),
13:E(1,'常連客が「先週より敏感になってるな」と言いながら、{a}の腰の奥を慣れた指つきでほぐした。',{n:1,mark:1}),
16:E(1,'客が{a}の内腿の柔らかいところに洗濯ばさみを挟み、指で弾いて遊んだ。{a}の腰が跳ねるたびに、客席から拍手が起きた。',{n:2}),
19:E(1,'主人は{a}の腰に「本日の売上」と書かれた札を貼りつけ、その日の稼ぎを数えていた。',{mark:1})
},
dungeon:{
0:E(1,'壁の向こうで、太い触手が{a}の太腿に巻きついた。先端が{a}の後ろの入り口を探り当て、ぬるぬるとまさぐり始めた。',{tent:1}),
1:E(2,'何本もの細い触手が、{a}の脚の付け根を撫で回しながら、後ろの奥へ順番に潜り込んでいった。',{tent:3}),
3:E(2,'触手が二本、絡み合いながら{a}の後ろの奥へ奥へと進んだ。{a}の下腹が、内側からかすかに盛り上がった。',{tent:4}),
5:E(1,'吸盤のついた触手が、{a}のいちばん敏感なところに吸いついて離れなかった。吸盤が脈打つたびに、{a}の腰は壁の向こうで震えた。',{tent:1}),
9:E(2,'触手の先端から、甘い匂いの粘液が{a}の後ろの奥に直接注がれた。粘液は媚薬だった。{a}の腰は、触れられなくても勝手にひくつき続けた。',{tent:2,cum:3}),
10:E(1,'蔓植物の罠が{a}の脚に絡みつき、大きく開かせて固定した。むき出しになった脚の付け根を、花の雄しべがくすぐるように撫で回した。',{tent:2})
},
white:{
5:E(1,'吸引機のような装置が{a}のいちばん敏感なところに取りつけられ、吸っては離し、吸っては離しを繰り返した。カウンターが一つずつ増えていった。',{tent:2,mark:3}),
8:E(2,'機械は{a}の後ろに振動する器具を差し込み、内腿にも振動する板を押し当てた。二つの振動が、{a}の腰の奥で共鳴した。',{tent:4}),
12:E(1,'細いアームが{a}の脚を左右に開き、隅々までカメラで撮影した。モニターには「記録完了」の文字が出た。',{mark:2})
}
};
H.BEYOND_FF={
toilet:[
E(1,'女子トイレの個室に入ってきた女が、壁から突き出た腰を見て息を呑んだ。それから鍵をかけ、しゃがみ込んで、{a}の濡れたところに長いこと舌を這わせていた。',{n:1,fem:1}),
E(1,'化粧直しに来た二人連れの女が、くすくす笑いながら{a}の脚を左右に開いた。「ほら、こんなに」「やだ、指入っちゃった」――二人は交代で指を沈め、鏡の前に戻っていった。',{n:2,fem:1}),
E(2,'常連らしい女が、鞄から玩具を取り出した。{a}の奥にそれを沈め、自分の指で前の芽を転がしながら、{a}の腰が三度跳ねるまで手を止めなかった。',{n:1,tent:1,fem:1})
],
lab:[
E(1,'女魔術師は手袋を外し、素手で{a}の{女性器}を確かめた。「感覚がないのに、ここはちゃんと応える」――細い指が、一本、また一本と奥へ沈んでいった。',{n:1,fem:1}),
E(1,'女助手が頬を赤くしながら、記録用の羽根で{a}の前の芽をくすぐった。「せ、先生、どのくらい続ければ……」「反応が止まるまで」',{n:1,mark:1,fem:1}),
E(2,'女魔術師は{a}の脚の間に顔を埋め、舌で奥を探りながら、指で敏感な芽を挟んで揺らした。羊皮紙には「被験体、連続して痙攣」とだけ書かれた。',{n:1,mark:1,fem:1})
],
show:[
E(1,'女の客が「女同士なら、いいでしょう？」と主人に言って、{a}の太腿を撫で上げた。その指は、そのまま濡れたところへ滑り込んでいった。',{n:1,fem:1}),
E(1,'踊り子らしい女が、出番の合間に{a}の前に膝をついた。唇で前の芽を吸い、指で奥をかき回す。客席の男たちは、見ているだけで手を出せなかった。',{n:1,fem:1}),
E(2,'女たちの一団が、交代で{a}の脚の間に顔を埋めた。「次、わたし」「まだ震えてる」――一人が離れるたびに、{a}の腰は前より大きく跳ねた。',{n:3,mark:2,fem:1})
],
dungeon:[
E(1,'女の冒険者が、罠にかかった{a}の腰を見つけて足を止めた。「……少しだけ」――籠手を外した指が、{a}の濡れた入り口を何度も行き来した。',{n:1,fem:1}),
E(1,'女魔法使いは、詠唱の練習台にでもするように、指先に灯した微弱な電流で{a}の前の芽を弾いた。弾くたびに、{a}の脚がぴんと伸びた。',{n:1,tent:1,fem:1}),
E(2,'女盗賊は「いい獲物」と笑い、{a}の奥に二本の指を沈めて、内側の弱いところを探り当てた。そこばかりを、{a}の腰が崩れるまで擦り続けた。',{n:1,fem:1})
],
white:[
E(1,'向こう側の部屋に、もう一人の女性の住人がいた。紙には「壁の相手を三回、指で」とあった。彼女は申し訳なさそうに、{a}の濡れたところへ指を沈めた。',{n:1,fem:1}),
E(1,'向こう側の女性は、紙の指示を読み上げた。「舌で、十分間」――彼女はためらいながら{a}の脚の間に顔を寄せた。十分が過ぎても、彼女は顔を上げなかった。',{n:1,fem:1}),
E(2,'機械のアームに渡された玩具を、向こう側の女性が{a}の奥に沈めた。スピーカーが告げる。「強度、最大」――彼女は{a}の腰を抱いたまま、震えが収まるまで離さなかった。',{n:1,tent:1,fem:1})
]
};
H.BEYOND_FM={
toilet:[
E(1,'個室に入ってきた女は、壁から突き出た{a}のものを見下ろして、ふっと笑った。スカートをたくし上げ、背中を壁に預けて、自分の中へゆっくりと導き入れた。',{n:1,fem:1,ride:1}),
E(1,'ヒールの女が、{a}のものを指で何度か扱いて硬さを確かめた。「……合格」――それから跨り、自分の好きな角度で腰を揺らして、満足するとさっさと出ていった。',{n:1,fem:1,ride:1}),
E(2,'女が二人、{a}のものを取り合うように交代で跨った。一人が果てて降りると、もう一人が根元まで腰を沈めた。「まだ出しちゃだめよ」――壁越しの声は、少しも手加減がなかった。',{n:2,fem:1,ride:2,mark:1})
],
lab:[
E(1,'女魔術師は{a}のものを手のひらで包み、脈を測るように握った。「射精の制御、第一段階」――そのまま跨り、{a}が果てそうになるたびに腰を止めた。',{n:1,fem:1,ride:1,mark:1}),
E(1,'女助手が、魔術師に言われるまま{a}の上に跨った。「せ、先生、動いていいんですか」「搾り取るまでが実験です」――助手の腰が、ためらいがちに沈んだ。',{n:1,fem:1,ride:1}),
E(2,'女魔術師は自分の中で{a}を締め上げながら、羊皮紙に回数を書き込んだ。三回目の印を付けても、彼女は降りようとしなかった。',{n:1,fem:1,ride:3,mark:3})
],
show:[
E(1,'踊り子が客席に一礼してから、壁から生えた{a}のものに跨った。客の手拍子に合わせて腰を回し、最後の拍で根元まで沈めた。客席が沸いた。',{n:1,fem:1,ride:1}),
E(1,'女の客が「乗ってみたかったの」と笑い、{a}のものを自分の中へ導いた。降りるとき、彼女は{a}の太腿に口紅で印をつけていった。',{n:1,fem:1,ride:1,mark:1}),
E(2,'主人が「本日はご婦人限定」と札を掛けた。女たちの列が、小屋の外まで伸びた。誰かが跨るたびに、{a}のものは搾られ、萎える暇を与えられなかった。',{n:4,fem:1,ride:4,mark:4})
],
dungeon:[
E(1,'女戦士が鎧の腰当てを外し、{a}のものに跨った。「罠の獲物は、見つけた者のもの」――彼女は勝ち誇ったように腰を沈め、好きなだけ揺らした。',{n:1,fem:1,ride:1}),
E(2,'淫魔の娘が壁の向こうに現れ、{a}のものに舌なめずりした。跨るなり、ゆっくりと締めつけては緩め、吐き出させるたびに嬉しそうに笑った。',{n:1,fem:1,ride:3}),
E(1,'女盗賊は「ついでに」と言って{a}のものに跨り、腰を揺らしながら{a}の脚の装備を外していった。降りたとき、彼女の手には{a}の財布もあった。',{n:1,fem:1,ride:1,mark:1})
],
white:[
E(1,'向こう側の女性の住人が、紙を読んで顔を赤くした。「壁の相手に、跨って……」――彼女はおそるおそる{a}のものを自分の中へ導き、目を閉じて腰を動かした。',{n:1,fem:1,ride:1}),
E(2,'向こう側の女性は、最初はためらっていた。三度目の指示が来るころには、自分から{a}のものに跨り、条件の回数を数えるのも忘れていた。',{n:1,fem:1,ride:3}),
E(1,'スピーカーが告げた。「次の課題。壁の相手を、上から十分間」――向こう側の女性は{a}の上に跨り、時間いっぱい、自分のいいところに当たるよう腰を揺らした。',{n:1,fem:1,ride:1})
]
};
H.BEYOND_FUTA={
toilet:[
E(1,'男が壁から突き出た腰を見て、目を丸くした。「両方あるのかよ」――男は{a}のものを扱きながら、その下の濡れたところにも指を沈めて、両方を同時に責めた。',{n:1,futa:1}),
E(0,'個室の壁に、誰かが「前も後ろも、もう一つも」と書き足した。その横に、正の字が三つ並んだ。',{mark:3,futa:1})
],
lab:[
E(1,'魔術師は目を輝かせた。「両性の反応を同時に測れる」――媚薬の筆で{a}のものの裏筋をなぞりながら、もう一方の手で、その下の襞を一枚ずつ開いた。',{tent:1,mark:1,futa:1}),
E(1,'助手が報告した。「先生、前が勃って、下も濡れています」「両方とも記録しろ」――器具が二つ、同時に{a}の腰に取りつけられた。',{tent:2,mark:1,futa:1})
],
show:[
E(0,'主人の口上が変わった。「さあさあ、世にも珍しい、両方そなえた不思議な腰！」――客席がどよめき、触る順番の札が飛ぶように売れた。',{n:3,mark:1,futa:1}),
E(1,'客が二人、片方は{a}のものを咥え、もう片方は下の濡れたところを指でかき回した。{a}の腰は、どちらに逃げることもできずに震えた。',{n:2,futa:1})
],
dungeon:[
E(2,'触手は迷わなかった。一本が{a}のものに幾重にも巻きつき、残りが、その下の濡れた入り口へ順番に潜り込んでいった。',{tent:3,futa:1}),
E(1,'吸盤の触手が{a}のものの先に吸いつき、別の細い触手が下の芽を転がした。二か所から同時に、{a}の腰は壁の向こうで跳ねた。',{tent:2,futa:1})
],
white:[
E(1,'スピーカーが告げた。「被験者は両性。試験を二系統で行います」――{a}のものに吸引器が、その下には振動する器具が、同時に取りつけられた。',{tent:2,mark:1,futa:1}),
E(0,'モニターに{a}の下半身の図が映り、二か所に赤い印が付いた。「反応、両方とも陽性」――カウンターが、二つ並んで回り始めた。',{mark:2,futa:1})
]
};
H.beyondFor=function(c,plKey){
var base=H.BEYOND[plKey]||[],fem=H.BEYOND_FEM[plKey]||[],male=H.BEYOND_MALE[plKey]||{},neu=H.BEYOND_NEU[plKey]||{};
var P=HK.Pos,g=c&&(c.gender||(c.src&&c.src.gender))||'';
var gs=P&&P.genSet?P.genSet(c):'';
if(gs==='m')g='m';else if(gs==='f'||gs==='mf')g='f';
var futa= !!(P&&P.futa&&P.futa(c));
if(g==='f')return base.concat(futa?(H.BEYOND_FUTA[plKey]||[]).concat(H.BEYOND_FM[plKey]||[]):H.BEYOND_FF[plKey]||[]);
if(g==='m')return base.map(function(e,i){return male[i]||e;}).concat(gs==='none'?[]:H.BEYOND_FM[plKey]||[]);
return base.map(function(e,i){return fem.indexOf(i)<0?e:neu[i]||e;});
};
H.BEYOND_TOP=[
E(1,'壁の向こうで、誰かが{a}の腰に手を添えた。それから、ためらいがちに{a}のものの上へ腰を落としてきた。終わったあと、その人は小さく「ありがとう」と言った。',{n:1,cum:1}),
E(1,'仕事帰りらしい人が、ヒールの音を響かせて近づいてきた。壁に背中を預け、{a}のものを自分の中に導いて、数分で満足して出ていった。',{n:1,cum:1}),
E(1,'向こう側の誰かが、{a}のものをローションでぬるぬるにしてから、ゆっくりと跨った。壁が、その人のリズムで揺れ始めた。',{n:1,cum:1}),
E(1,'若い男が、震える手で{a}のものを握り、意を決したように後ろから自分の中に迎え入れた。壁越しに、押し殺した声が聞こえた。',{n:1,cum:1}),
E(2,'壁の前に、いつの間にか三人の列ができていた。一人が{a}の上で果てて降りるたびに、次の人が待ちきれずに跨った。',{n:3,cum:3,mark:3}),
E(2,'常連らしい人が「今日もいるね」と言って、慣れた腰つきで{a}のものを根元まで咥え込み、何度も何度も腰を打ちつけた。向こう側の{a}の脚は、つま先まで反り返って痙攣していた。',{n:1,cum:2,mark:1}),
E(2,'二人組が、{a}のものを交代で使った。片方が跨っている間、もう片方が「次は私」と急かした。',{n:2,cum:2}),
E(0,'向こう側の誰かが、{a}のものを指先でつついて「元気だね」と笑った。それから写真を一枚撮って出ていった。',{n:1,mark:1})
];
H.BEYOND_HARD={
toilet:[
E(0,'酔った男が壁の向こうで「なんだこれ」と笑い、手を伸ばした。その瞬間、こちら側から{a}の声が響いた。「触ったら、出たあと必ず探し出す」――男は手を引っ込めて、そそくさと出ていった。',{n:1}),
E(0,'男が{a}の腰に手をかけた。感覚はなくても、{a}の脚は覚えていた。踵が正確に男の脛を蹴り上げ、個室に情けない悲鳴が響いた。',{n:1}),
E(0,'誰かが向こう側の壁に、マジックで「ご自由に」と書き足そうとした。こちら側で{a}が壁を拳で叩くと、ペンを落として逃げていった。',{n:1}),
E(0,'清掃員が壁の向こうを掃除しに来た。「……この子は手を出させないね」――清掃員は呆れたように言って、個室の扉に「故障中」の札を下げていった。',{n:1})
],
lab:[
E(0,'魔術師が媚薬の小瓶を手に、壁の向こうへ回ろうとした。{a}は壁越しに言った。「それを使うなら、遮断が解けたあと、同じものを先生の分も用意しておけ」――魔術師は、小瓶を棚に戻した。',{n:1}),
E(0,'助手が測定器具を持って{a}の腰に近づいた。その手首を、穴から伸びた{a}の脚が器用に挟んで止めた。「……記録には『被験体に拒否された』と書いておきます」',{n:1,mark:1}),
E(0,'魔術師は羊皮紙に「被験体：非協力的」と書いた。実験は、{a}の上半身側の聞き取り調査だけに切り替わった。',{mark:1}),
E(0,'使い魔のスライムが壁の向こうで{a}の脚に這い寄ったが、蹴り飛ばされて天井に貼りついた。魔術師はため息をついて、スライムを瓶に戻した。',{})
],
show:[
E(0,'「さあさあ、触るのは一回百円！」――客引きの声に、こちら側の{a}が声を張り上げた。「触ったやつの顔は、全員覚えておく」――客席がしんとなり、硬貨を投げる者はいなかった。',{n:3}),
E(0,'酔った客が{a}の脚に手を伸ばした瞬間、{a}の踵がその顎を跳ね上げた。客席がどっと沸いた。見世物小屋の主人は、看板を「足技の見世物」に書き換えた。',{n:1}),
E(0,'客の一人が{a}の太腿に投げ銭を挟もうとして、脚に払い落とされた。小銭が床に散らばった。',{n:1}),
E(0,'主人は「触れたら蹴られます」の札を掛けた。それでも挑む客がいて、そのたびに蹴られて退場した。行列はいつの間にか「誰が触れるか」の賭けになっていた。',{n:5})
],
dungeon:[
E(0,'触手が一本、{a}の足首に巻きつこうとした。{a}の脚はそれを踏みつけ、壁にこすりつけて千切った。感覚はなくても、体は容赦がなかった。',{}),
E(0,'冒険者のパーティが壁の向こうを通りかかった。「罠にかかってる」「……触ってからでいいだろ」――壁越しに{a}の低い声がした。「やってみろ」――三人は黙って通り過ぎた。',{n:3}),
E(0,'スライムが{a}の下半身にまとわりつこうとしたが、暴れる脚に何度も振り払われ、とうとう諦めて床の隙間へ帰っていった。',{}),
E(0,'ゴブリンが一匹、{a}の腰によじ登ろうとして、膝で壁に叩きつけられた。仲間のゴブリンたちは、遠巻きに見ているだけだった。',{n:1})
],
white:[
E(0,'機械のアームが{a}の太腿へ伸びてきた。{a}の脚はそれを挟み込み、関節と逆の方向へねじった。アナウンスが流れた。「アーム三番、故障」',{}),
E(0,'向こう側の部屋の住人が、紙の指示を読んで{a}の腰に手を伸ばしかけた。{a}は壁越しに言った。「その紙に従うより、こっちと手を組んだ方が早く出られる」――住人の手が止まった。',{n:1}),
E(0,'スピーカーが告げた。「被験者が協力的でないため、試験内容を変更します」――モニターに映ったのは、{a}が蹴り落としたアームの残骸だった。',{mark:1}),
E(0,'天井から器具が降りてきたが、{a}の脚が届く範囲に入るたびに蹴り返され、やがて黙って天井へ戻っていった。',{})
]
};
H.TOP_RELEASE=['――戻ってきたのは、壁に擦れた腰の痛みと、何かを蹴り飛ばした足の甲の痺れだけだった。','――{a}の腰から下には、誰にも触れさせなかったという手応えだけが残っていた。'];
H.TOP_AFTER=['{a}は服を整え、壁を一度だけ蹴ってから部屋を出た。','{a}は壁の穴を振り返り、「二度とはまるか」と吐き捨てた。','{a}は痺れた脚をほぐしながら、何事もなかった顔で外へ出た。'];
H.TOP_REVENGE={
toilet:['{a}は服を整えて壁の向こうに回った。さっき手を伸ばした男が、まだ手洗い場でうろうろしていた。{a}は男の襟首を掴んで個室に押し込み、扉を閉めた。「次は、お前が壁にはまる番だ」――しばらくして出てきた{a}は、手を洗いながら鏡の自分に笑いかけた。',
'{a}は手洗い場で待っていた相手の手首を掴み、空いた壁の穴の前まで引きずっていった。「どんな気分か、自分で確かめてこい」――個室の扉が閉まり、しばらくして、壁の向こうから情けない声が漏れはじめた。',
'{a}は外で待ち構え、出てきた相手を個室の壁に押しつけた。耳元で「さっきの続き、こっちでしてやろうか」と囁くと、相手は膝から崩れ落ちた。{a}はそれを見下ろして、何も言わずに手を洗った。'],
lab:['{a}は壁から抜け出すと、まっすぐ魔術師の白衣の襟を掴んだ。実験台に押さえつけ、棚の媚薬の小瓶を逆さにする。「被験体、交代だ。記録は自分で取れ」――魔術師の羽ペンは、三行目で止まったまま動かなくなった。',
'{a}は抜け出すなり、魔術師の手から記録帳を取り上げた。「今度はお前の番だ」――拘束具を逆向きに留め直し、魔術師を壁の穴へ押し込む。記録帳には、{a}の字で「被験体の反応、良好」とだけ書き足された。',
'{a}は実験台の上の小瓶をひとつずつ手に取り、魔術師の目の前で栓を抜いた。「どれが一番効くか、知ってるのはお前だろう」――魔術師が三本目を指さすまで、{a}は少しも急がなかった。'],
show:['{a}は幕の裏に回り、見世物小屋の主人を壁際に追い詰めた。「今夜の目玉は、お前だ」――その夜、小屋の奥からは、主人の上ずった声が閉場まで続いた。',
'{a}は舞台に上がり、壁の穴の札を裏返した。「本日の出し物、交代」――客席がどよめくなか、引きずり出された主人が壁にはめ込まれ、今度は{a}が客席の最前列に腰を下ろした。',
'{a}は楽屋で主人を捕まえ、木戸銭の袋をその胸に押しつけた。「払い戻しだ。体で」――閉場のあとも、楽屋の灯りはなかなか消えなかった。'],
dungeon:['{a}は罠の壁から抜け出すと、さっきの触手の根元を掴んで引きずり出し、固く結んで床に転がした。それから、遠巻きに見ていた冒険者たちに向き直った。「さっき『触ってからでいい』と言ったのは、誰だ」',
'{a}は抜け出すと同時に、壁の罠の核を素手でつかみ出して握り潰した。動かなくなった触手を一本ずつほどき、それを見ていた冒険者の手首に巻きつける。「次は、お前が待つ番だ」',
'{a}は罠の仕掛けを逆向きに組み直し、さっき笑っていた冒険者を壁の前へ突き飛ばした。穴の縁が閉じる音がして、通路にその冒険者の悲鳴が響いた。{a}は振り返らずに、迷宮の奥へ歩き出した。'],
white:['{a}は向こう側の部屋の扉を開けた。震えていた住人の顎を指先で持ち上げ、壁の紙を破り捨てた。「出口の条件は、こっちで決める」――扉が開くまで、住人は{a}の腕の中で何度も声を上げた。',
'{a}は向こう側の部屋に踏み込み、壁際で固まっていた住人の手首を取った。「さっきは、ずいぶん楽しそうだったな」――壁の紙の条件を指でなぞり、{a}は住人を寝台へ押し倒した。扉が開く音がしたのは、ずっと後のことだった。',
'{a}は扉を開けると、住人の目の前で壁の紙を書き換えた。「出口の条件、追加だ」――読み上げられた条件に、住人の顔がみるみる赤くなった。{a}は椅子に腰かけて、住人が条件を満たすのを最後まで見届けた。']
};
H.PEN_RE=/中に入|中に吐|中を満た|奥まで|奥に|犯し|ねじ込|塞い|突き入|突き上|貫|沈め|後ろの穴|掻き出|使った|使い|中に出/;
H.CONTRAST=['――同じころ、{a}は天井のしみの数を数えていた。','――そのとき{a}は、晩ご飯のことを考えていた。','――{a}は、何も知らなかった。','――{a}は退屈そうに、あくびを一つした。','――何も感じない{a}は、ぼんやりと爪をいじっていた。','――{a}はそのころ、「意外と平気かも」と思っていた。','――{a}は、壁が少し揺れた気がして、首をかしげただけだった。','――{a}はうとうとしていた。','――こちら側の{a}は、鼻歌を歌っていた。','――{a}は「今、何もされてないといいな」と呟いた。','――{a}の顔は、まだ平然としていた。','――{a}は、まだ自分が何をされているのか知らない。'];
H.THIS={
toilet:['トイレの手洗い場の側から、男が{a}の顔を覗き込んだ。「へえ、上はこういう顔なんだ」','清掃員がこちら側にも回ってきて、{a}にペットボトルの水を差し出した。「頑張りな」――何を頑張るのかは言わなかった。','知らない男が{a}の頬を撫でて、「下のほう、すごいことになってるぞ」と耳打ちした。'],
lab:['魔術師がこちら側に来て、{a}の瞳孔を覗き込んだ。「意識は明瞭。……ふむ、まだ気づいていないか」','助手が{a}に温かいお茶を飲ませてくれた。「あの……がんばってください」その目は、なぜか泳いでいた。','魔術師が{a}の額に手を当てた。「体温上昇。下の感覚は、まだ切り離されているはずだが」'],
show:['こちら側にも、上半身を見物する客がやってきた。「下はあんなことになってるのに、顔は普通だな」','客引きが{a}の顔の横に札を立てた。「表の顔：無料／裏：有料」','酔ってはしゃいだ客が、{a}に飴を差し出した。「下のほう、すごかったよ」'],
dungeon:['冒険者がこちら側から{a}を見つけた。「おい、大丈夫か！……下は、見ないほうがいいぞ」','スライムの欠片が、こちら側にも少しだけ漏れ出してきて、{a}の指先をぺろりと舐めた。','迷宮の妖精が飛んできて、{a}の耳元でくすくす笑った。「向こう、すっごいことになってるよ」'],
white:['白い部屋のスピーカーが{a}に話しかけた。「ご気分はいかがですか。下半身側の状況は、のちほどお伝えします」','壁にモニターが現れた。画面は真っ黒で、「閲覧には条件があります」とだけ表示された。','天井から小さな紙が降ってきた。「あなたの下半身は、現在たいへん人気です」']
};
H.THIS_REACT={
proud:['{a}は「何がだ」と睨み返した。','{a}は「余計なことを言うな」と吐き捨てた。'],
stern:['{a}は「……報告は不要です」と目を閉じた。','{a}は聞かなかったことにした。'],
tsun:['{a}「な、何よそれ、どういう意味！？」','{a}「べ、別に気にしてないし！」'],
gentle:['{a}は「あらあら……ありがとう」と、とりあえず微笑んだ。','{a}は「どういうことかしら」と首をかしげた。'],
devoted:['{a}は「だ、大丈夫です……たぶん」と答えた。','{a}は不安で、泣きそうになった。'],
cool:['{a}は今の言葉から、向こう側の状況を推測しようとした。推測したくなかった。','{a}は「具体的に」と訊き返した。答えはなかった。'],
free:['{a}「え、なになに、何が起きてるの！？教えて！」','{a}は「まじで？」と笑った。少しだけ顔が引きつった。'],
shy:['{a}は真っ赤になって、顔を伏せた。','{a}は「い、言わないでください……」と小さく言った。']
};
H.THIS_REACT.polite=['{a}は「恐れ入ります」と、とりあえず丁寧に返した。','{a}は「……どういう意味でしょうか」と、静かに訊き返した。'];
H.BODY=['{a}は喉が渇いて、唇を舐めた。下半身の感覚がないのに、喉の渇きだけはやけにはっきりしていた。','{a}の腕が痺れてきた。壁についた手の位置を、何度も変えた。','{a}は鼻の頭が痒くなったが、手が届かなかった。小さな地獄だった。','{a}のお腹が鳴った。壁の向こうから、誰かが笑う声がした。','{a}は腰から上だけで伸びをした。背骨が、ぽきりと鳴った。'];
H.DREAM=['{a}は浅い眠りの中で、誰かに抱かれる夢を見た。目を覚ますと、心臓だけが速く打っていた。','{a}は夢の中で、知らない手に何度も触れられていた。目が覚めても、それが夢だったのか分からなかった。','{a}は眠りながら、小さく甘い声を漏らした。自分では気づかなかった。','{a}は夢を見なかった。ただ、起きたとき、なぜか頬が濡れていた。'];
H.MIND={
proud:['{a}は「ここを出たら、まずこの壁を叩き壊す」と計画を立てた。','{a}は「誰だか知らないが、覚えておけ」と壁に向かって言った。','{a}は腕組みをしたまま、苛立たしげに指で壁を叩いた。'],
stern:['{a}は背筋を伸ばし、目を閉じて精神を統一した。','{a}は「これも鍛錬だ」と自分に言い聞かせた。','{a}は身なりを整えようとして、整える下半身がないことに気づいた。'],
tsun:['{a}は「べ、別に寂しくないし」と、誰もいないこちら側で言った。','{a}は「ぜんっぜん気にしてないから」と、壁の向こうに聞こえるように言った。','{a}はちらちらと壁を振り返った。気にしていないはずだった。'],
gentle:['{a}は「向こうの人たちも、退屈してないといいわね」と呟いた。','{a}は壁をそっと撫でて、「よしよし」と言った。','{a}は待ちながら、子守唄を口ずさんだ。'],
devoted:['{a}は「わたしが我慢すれば、それでいいんだから」と自分に言った。','{a}は待っている人のために、絶対に泣かないと決めた。','{a}は「あと少し、あと少し」と小さく繰り返した。'],
cool:['{a}は壁の材質と厚みを推定した。脱出の可能性は低かった。','{a}は「遮断の魔法の持続時間」について、仮説を三つ立てた。','{a}は向こう側の物音を、時系列で記憶していた。'],
free:['{a}は壁の向こうに「ねー、何人いるのー？」と話しかけた。','{a}は暇つぶしに、壁の模様で顔を探した。七つ見つけた。','{a}は「意外と快適かも」と言った。言ってから、ちょっと後悔した。'],
shy:['{a}は「誰も見てませんように」と祈り続けた。','{a}はうつむいたまま、ずっと自分の指を見ていた。','{a}は恥ずかしくて、壁の向こうのことを考えないようにした。考えてしまった。']
};
H.MIND.polite=['{a}は「失礼ですが、あとどのくらいでしょうか」と壁に尋ねた。','{a}は背筋を伸ばし、待つことに専念した。','{a}は「お手柔らかにお願いします」と、壁の向こうに丁寧に頼んだ。'];
H.CONFUSE={
proud:['{a}「な、中に……っ、何が、入って……！？」','{a}「何人……っ、何人分、だ、これ……っ！」','{a}は壁を殴ろうとして、拳に力が入らなかった。'],
stern:['{a}「……っ、ありえ、ない……こんな、量……」','{a}は姿勢を保とうとして、壁にすがりついた。「く……っ、立って、いられな……」','{a}「奥、が……っ、まだ、何か……」'],
tsun:['{a}「う、うそ、うそうそ、なんでこんな……っ、いっぱい……！」','{a}「ちがう、こんなの、知らない……っ！」','{a}「やだ、なか、熱い……っ、なに、これぇ……！」'],
gentle:['{a}「あ、あら……わたし、こんなに……たくさん……？」','{a}は困った笑みを浮かべようとして、浮かべられなかった。','{a}「ま、待って……全部、一度に、なんて……っ」'],
devoted:['{a}「ごめんなさい……っ、何が、何だか……っ！」','{a}「お腹……っ、お腹、いっぱいで……っ」','{a}は泣きじゃくりながら、何度も果てた。'],
cool:['{a}「何回、って……っ、数え、きれな……」','{a}「な、中……っ、何か、残って……っ」','{a}は自分の体に起きていることを理解した瞬間、理解をやめた。'],
free:['{a}「えっ、えっ、なにこれ、全部まとめて来た！？あぁっ！」','{a}「やばい、やばいって、何されてたの、わたし……っ！」','{a}は笑いながら泣いて、泣きながら果てた。'],
shy:['{a}「ひっ……な、なか、いっぱい……っ、なんで……っ」','{a}「み、みんなに……っ、見られて、た……の……？」','{a}は声を殺そうとして、殺せなかった。']
};
H.CONFUSE.polite=['{a}「な、なかに……っ、いったい、何人の方が……っ」','{a}「お、お待ちください、こんな、一度には……っ」','{a}は「失礼します」と言いかけて、言葉が嬌声に溶けた。'];
H.RELEASE_MODE={burst:'一気に戻る',drip:'少しずつ戻る',late:'帰り道で遅れて戻る'};
H.DRIP=['遮断は、少しずつほどけていった。最初に戻ってきたのは、太腿を伝う生ぬるい感触だった。','感覚が、一つずつ戻ってきた。次に戻ってきたのは、奥に残る、何かが入っていた形だった。','{a}は、自分の中がまだ濡れていることを知った。戻ってくるたびに、知らないことが一つずつ増えた。','ひとつ戻るたびに、{a}は息を呑んだ。まだ、終わりではなかった。'];
H.DRIP_TOP=['遮断は、少しずつほどけていった。最初に戻ってきたのは、根元に残る、誰かに締めつけられていた感触だった。','感覚が、一つずつ戻ってきた。次に戻ってきたのは、何度も吐き出したあとの、甘い痺れだった。','{a}は、自分のものがまだ濡れていることを知った。戻ってくるたびに、知らないことが一つずつ増えた。','ひとつ戻るたびに、{a}は息を呑んだ。まだ、終わりではなかった。'];
H.LATE_IN=['遮断が解けた。……何も、起きなかった。{a}は拍子抜けして、服を整えて外に出た。','{a}は壁から抜け出した。感覚は戻らなかった。{a}は「なんだ、平気じゃん」と思った。'];
H.LATE=['帰りの電車の中で、それは突然やってきた。{a}は吊り革にしがみついて、膝から崩れ落ちそうになるのを必死にこらえた。','駅の階段を上る途中で、遅れていた感覚がまとめて戻ってきた。{a}は手すりにすがって、その場にうずくまった。','コンビニのレジに並んでいるとき、腰の奥に何時間分もの熱が一度に叩きつけられた。{a}は声を押し殺して、商品を床に落とした。','家の玄関の鍵を開けた瞬間だった。{a}は扉にもたれたまま、ずるずると座り込んだ。'];
H.LATE_AFTER={
fall:['{a}は家に帰らなかった。震える足で来た道を引き返し、あの壁の前に立った。','{a}は翌日、同じ時間に、同じ場所へ向かっていた。'],
broken:['{a}は駅のベンチに座り込んだまま、終電を二本見送った。','{a}は家にたどり着くなり玄関で崩れ落ち、朝までそこから動けなかった。'],
hold:['{a}は歯を食いしばって家までたどり着き、鍵をかけてから、ようやく声を上げた。','{a}は何事もない顔で改札を抜けた。誰にも、気づかれなかった。たぶん。']
};
H.PEEK=['{a}は服を整えてから、壁の向こう側に回ってみた。壁には正の字が{marks}個並び、床はまだ濡れていた。','{a}は壁の裏を覗いた。そこには使われた道具と、{a}の腰の形にへこんだ跡が残っていた。{a}は、黙って扉を閉めた。','{a}は向こう側の記録を見つけた。訪問者：{visits}人。その下の数字は、見なかったことにした。'];
})();
});
;
/* ==== js/solo-hole-live.js ==== */
HK.Load.def(460,'js/solo-hole-live.js',function(){
(function(){
'use strict';
var HK=window.HK;
function L(s){return s.split('|');}
var X=HK.HoleLive={};
X.BREAK={
toilet:L('ピシッ、と壁のタイルにひびが入る音がした。次の瞬間、{a}の腰から下に、個室の冷たい空気と、誰かの手の熱が同時に戻ってきた。|個室の電球がちかちかと瞬いた。それと同時に、{a}の下半身の感覚が、何の前触れもなく「点いた」。――ちょうど、誰かに腰を掴まれているところだった。'),
lab:L('魔法陣の線が一本、じじっと音を立てて焼き切れた。助手が叫んだ。「先生、遮断が！」――{a}の腰から下に、すべてが一度に流れ込んだ。|魔術師が呪文を一語、言い間違えた。遮断の膜が、しゃぼん玉のように弾けた。「……おや。戻ったね」――そのとき{a}の体は、ちょうど実験の真っ最中だった。'),
show:L('幕の向こうで、客の誰かが穴の縁の札を引き剥がした。札の裏の封印ごと。――{a}の下半身に、何十もの視線と、誰かの指の感触が一度に戻ってきた。|見世物小屋の主人が「おっと」と言った。「お客さん、今日は特別だ。――感じてますよ、この子」――客席がどよめいた。'),
dungeon:L('壁に埋め込まれた罠の魔石が、ぴしりと割れた。感覚が戻った瞬間、{a}は自分の脚に何本もの何かが絡みついていることを知った。|罠の仕掛けが古くなっていたのか、遮断の魔法がふっと消えた。――壁の向こうで動いていたものの感触が、{a}の腰に一度に押し寄せた。'),
white:L('スピーカーから無機質な声が流れた。「遮断装置に不具合が発生しました。試験は、このまま継続します」|ブツン、と何かの電源が落ちる音がした。それきり、{a}の下半身は何も遮らなくなった。――壁の向こうの機械は、止まらなかった。')
};
X.FLOOD=L('それまで壁の向こうで溜まっていた分が、まとめて{a}の腰の奥へなだれ込んだ。息をする暇もなかった。|何時間分もの熱が、一度に{a}の体を駆け上がった。{a}は壁に爪を立てて、のけぞった。|遅れていた感覚と、いま起きている感覚が、{a}の中で重なって区別がつかなくなった。');
X.LIVE={
toilet:[
L('壁の向こうの男が、ぴたりと手を止めた。「……今、こいつ跳ねなかったか？」|個室の外の列から、ひそひそ声がした。「なんか急に締まりがよくなったって」|向こう側で、誰かが面白がって同じ場所をもう一度なぞった。{a}の脚が、正直に震えた。'),
L('「おい、感じてるぞこれ」――向こう側の声が、明らかに弾んでいた。手つきが、確かめるようにゆっくりになった。|列に並んでいた男たちが、壁に耳を当てた。{a}が声を噛み殺すたびに、向こう側で誰かが小さく笑った。|向こうの男は、{a}が一番震える場所を探し当てると、そこばかりを狙い始めた。'),
L('壁の向こうで「すげえ、自分から腰振ってる」と声がした。列が、少し長くなった。|向こう側の男たちは、{a}の反応に合わせて交代の間隔を詰めた。休む暇は、もうなかった。|個室の扉の外に「今、感じてます」と書いた紙が貼られた。客足が、目に見えて増えた。')
],
lab:[
L('魔術師が羽ペンを走らせた。「感覚復帰直後の反応、記録。――ほら、続けて」|助手が戸惑いながらも、器具の目盛りを読み上げた。「心拍、上昇……先生、本人が嫌がってます」「記録しなさい」|魔術師は、{a}の反応を確かめるように、同じ刺激を三回、等間隔に与えた。'),
L('「抵抗の値が下がってきた。いい傾向だ」――魔術師は満足げに頷き、媚薬の小瓶をもう一本開けた。|助手が頬を赤くしながら報告した。「先生、被験体の声が……甘くなっています」「それも記録だ」|魔術師は器具の強さを一段上げた。{a}の腰が、壁の向こうでそれを追いかけた。'),
L('魔術師が羽ペンを置いた。「――もう記録は十分だ。あとは好きにさせてあげなさい」|助手が器具を止めようとすると、{a}は「やめないで」と声を上げた。助手の手が止まった。|魔術師は札に書き足した。「被験体、自発的に刺激を要求。実験は延長」')
],
show:[
L('客席から「動いた！」と声が上がった。見世物小屋の主人が口上を変えた。「さあさあ、今日だけ、本当に感じる不思議な壁！」|触っていた客が、驚いて手を引っ込めた。それから、もう一度、そっと手を伸ばしてきた。|{a}の脚が跳ねるたびに、客席から拍手と笑い声が起きた。'),
L('客たちは{a}の反応に夢中になって、次々と手を伸ばした。「ここ？」「いや、こっちのほうが――ほら」|主人が「お触り、時間延長でございます」と叫んだ。客席が沸いた。|{a}が声を漏らすたびに、幕の向こうで誰かが口笛を吹いた。'),
L('客席は総立ちだった。壁の向こうで、{a}の腰が自分から客の手を追いかけているのが、誰の目にも分かった。|主人は看板を「本日の花形」に掛け替えた。行列は、小屋の外まで伸びていた。|客の一人が「おねだりしてるぞ」と言った。否定する者はいなかった。')
],
dungeon:[
L('触手が、{a}の体温が変わったのを感じ取ったように、動きを速めた。|罠の部屋に、ぬちゃ、という音と、{a}の押し殺した声だけが響いた。触手たちは、声のするほうへ集まってきた。|スライムが{a}の脚を這い上がった。感覚が戻った肌に、その冷たさがいちいち鮮明だった。'),
L('触手たちは、{a}が一番大きく声を上げた場所を覚えたらしかった。次からは、そこにばかり群がった。|罠の壁が、{a}の反応に合わせるように脈打ち始めた。部屋そのものが、{a}を味わっているようだった。|触手の先から甘い匂いの粘液が滲み、{a}の肌に塗り広げられた。息をするたびに、頭がぼうっとした。'),
L('触手たちは、もう{a}を逃がす気がなかった。{a}の腰も、逃げる気がなかった。|罠の部屋の奥で、魔物たちが集まってくる気配がした。{a}は、それを怖いとは思えなくなっていた。|通りかかった冒険者が、壁の前で足を止めた。「……罠にかかって、喜んでる？」')
],
white:[
L('スピーカーが告げた。「被験者の反応を確認。強度を維持します」――機械は、少しも手加減しなかった。|モニターに数字が表示された。{a}が震えるたびに、数字が一つずつ増えていった。|アームが一定のリズムで動き続けた。感覚が戻ったいま、そのリズムは逃げ場のない拷問だった。'),
L('スピーカーが告げた。「反応値、上昇。強度を上げます」――機械の音が、一段高くなった。|白い壁に、{a}の心拍がグラフで映し出された。グラフは、もう平らに戻らなかった。|機械は{a}が一番反応した動きだけを学習して、それを延々と繰り返した。'),
L('スピーカーが告げた。「被験者が刺激を受け入れました。試験を延長します」|モニターに「満足度：測定不能」と表示された。誰も、それを止めなかった。|機械は止まらなかった。{a}も、止まってほしいとは言わなかった。')
]
};
X.FEEL={
recv:[
L('感覚が戻ったばかりの腰の奥を、熱いものがゆっくりと押し広げていた。{a}はそれが何なのか、考えたくなかった。|触れられている場所が、いちいち鮮明だった。何時間も何も感じなかった反動で、指一本の動きが、雷のように響いた。|{a}は、自分の中に何かが出入りしている感触を、生まれて初めてのように味わわされていた。'),
L('突かれるたびに、腰の奥から甘い痺れが背骨を駆け上がった。{a}は、逃げようとした腰が、勝手に押しつけられていることに気づいた。|奥の一番弱いところを擦られるたびに、{a}の頭の中が白く弾けた。嫌なはずなのに、次を待ってしまっていた。|中が勝手に締めつけて、出ていこうとするものを引き留めていた。{a}は、自分の体が恥ずかしかった。'),
L('{a}は、もう壁の向こうから奥を突かれるたびに声を上げていた。抑える理由が、どこにもなかった。|知らない誰かに満たされる感覚が、どうしようもなく気持ちよかった。{a}の腰は、壁の向こうで自分から迎えに行っていた。|中に注がれる熱を感じた瞬間、{a}の体は、それを喜ぶように震えた。')
],
top:[
L('感覚が戻った途端、{a}は自分のものが誰かの熱い中に根元まで咥え込まれていることを知った。|締めつけてくる柔らかさが、いちいち鮮明だった。何時間も何も感じなかった反動で、ほんの少しの動きが、腰の芯まで響いた。|{a}のものの上で、誰かがゆっくりと腰を揺らしていた。{a}はそれを止める方法を知らなかった。'),
L('上で動く誰かの腰が沈むたびに、{a}の背筋を甘い痺れが駆け上がった。{a}は、自分の腰が勝手に突き上げていることに気づいた。|根元から先までを締め上げられるたびに、{a}の頭の中が白く弾けた。嫌なはずなのに、次を待ってしまっていた。|壁の向こうの誰かは、{a}が一番震える角度を見つけると、そこばかりを使った。'),
L('{a}は、もう誰かが跨ってくるたびに、壁の向こうへ腰を突き出していた。|知らない誰かの熱に包まれる感覚が、どうしようもなく気持ちよかった。{a}の腰は、壁の向こうで自分から相手を突き上げていた。|{a}は、壁の向こうの誰かの中で果てるたびに、もっと欲しいと思っていた。')
]
};
X.FEEL_LIGHT=[
L('感覚が戻ったばかりの肌は、指先が触れただけで、びくりと跳ねた。{a}は自分の過敏さに驚いた。|何でもない刺激のはずなのに、何時間も何も感じなかった反動で、{a}には火傷のように熱かった。'),
L('触れられた場所から、じわじわと甘い痺れが広がった。{a}は、もっと強い刺激を待ってしまっている自分に気づいた。|軽く撫でられるだけで、{a}の腰は勝手に揺れた。物足りない、と思ってしまったのが恥ずかしかった。'),
L('{a}は、触れられるたびに、それだけでは足りないと腰をくねらせた。|撫でられるだけの刺激が、焦らされているようでたまらなかった。{a}は壁の向こうに「……それだけ？」と囁いた。')
];
X.REACT={
proud:[
L('{a}「な、んだ、これ……っ！　誰だ、勝手に……触ってんじゃ、ねえ……っ！」|{a}は壁を拳で叩いた。「やめろって、言ってんだろ……っ、く、ぅ……！」|{a}「感覚、戻って……ふざけ、んな……っ、離せ……！」'),
L('{a}「くそ……っ、なんで、体が、勝手に……っ」|{a}は歯を食いしばったが、腰の震えは止まらなかった。「……っ、こんなの、認めねえ……」|{a}「やめろ……やめ……っ、……そこ、は……っ」'),
L('{a}「……っ、もっと、強く……しろよ……っ」|{a}は壁に額を押しつけて、荒い息のまま笑った。「……悪く、ねえ……っ」|{a}「止めんな……っ、今止めたら、出たあと、ただじゃおかねえ……っ」')
],
stern:[
L('{a}「……っ、何を、している……！　ただちに、やめ……っ」|{a}は背筋を伸ばそうとして、膝が崩れた。「戻った、のか……感覚が……っ」|{a}「くっ……落ち着け……落ち着け……っ」'),
L('{a}「……っ、耐え、ろ……これしき……っ」|{a}の規則正しかった呼吸が、刻むたびに乱れていった。「ん、く……っ」|{a}「……体が、言うことを……聞かな……っ」'),
L('{a}「……っ、もう、少し……だけ……」|{a}は自分の口から出た言葉に愕然として、それから目を閉じた。「……続けて、くれ……」|{a}「規律、など……今は……どうでも、いい……っ」')
],
tsun:[
L('{a}「ちょっ、うそ、なんで感じ……っ、や、やだ、触んないでよ……っ！」|{a}「か、感じてないから！　今のは、びっくりしただけ……っ、ぁ」|{a}は壁を叩いた。「誰よ、こんなことしてるの……っ、出たら覚えてなさい……っ」'),
L('{a}「べ、別に、気持ちよくなんか……っ、ない、んだから……っ」|{a}「や、そこ、だめ……っ、だめって、言って……ぁ……っ」|{a}は顔を真っ赤にして唇を噛んだ。「……声、出てない。出てないから……っ」'),
L('{a}「……っ、や、やめたら、許さない、から……っ」|{a}「……もっと、って言ってない……言ってない、けど……っ、やめないで……」|{a}は壁に頬を押しつけて、小さく呟いた。「……ばか。気持ちいい……」')
],
gentle:[
L('{a}「あら、あ……っ？　待って、今、何を……っ」|{a}は困ったように眉を下げた。「ごめんなさい、急に感覚が……っ、あ、そこ……」|{a}「お願い、少しだけ、ゆっくり……ね？」'),
L('{a}「ん……っ、そんなに、されたら……わたし……っ」|{a}は頬を赤くして、壁の向こうに声をかけた。「上手、ね……っ、困っちゃう……」|{a}「だめよ……そんな、優しくしたら……っ」'),
L('{a}「……ふふ、いい子ね……もっと、ちょうだい……」|{a}は壁にもたれて、とろんとした目で微笑んだ。「好きなだけ、どうぞ……」|{a}「ん……全部、受け止めてあげる……っ」')
],
devoted:[
L('{a}「えっ、あ……っ、か、感覚が……っ、ど、どうしよう……っ」|{a}「や、やめてください……っ、お願いです……っ」|{a}は泣きそうな顔で壁にしがみついた。「何が、起きてるんですか……っ」'),
L('{a}「だ、だめです……っ、こんなの、だめなのに……っ」|{a}は首を振ったが、腰の震えは正直だった。「ごめんなさい……っ、変な声……っ」|{a}「我慢、しなきゃ……我慢……っ、ん……っ」'),
L('{a}「……っ、もっと、使ってください……っ」|{a}は涙をこぼしながら、壁の向こうへ囁いた。「気持ち、いいです……っ、ごめんなさい……」|{a}「わたしで、気持ちよくなって、ください……っ」')
],
cool:[
L('{a}「……っ、遮断が……解けた……？　なら、これは……っ」|{a}は状況を整理しようとして、言葉が途中で途切れた。「待て……情報が、多すぎる……っ」|{a}「……っ、刺激の、出所を……特定、しないと……」'),
L('{a}「理屈では……分かってる……分かってるのに……っ」|{a}の分析は、刺激が来るたびに一行ずつ消えていった。「ん、っ……今の、は……」|{a}「……反応を、抑制……できない……っ」'),
L('{a}「……もう、考えるのは……やめる……っ」|{a}は初めて、計算を手放して目を閉じた。「……続けて」|{a}「……悪くない……データとしては、最悪、だけど……っ」')
],
free:[
L('{a}「えっ、えっ、なにこれ、急に感じる……っ！？　ちょ、待って待って……っ」|{a}「うそ、今まで、ずっとこんなこと……されてたの……っ！？」|{a}は壁の向こうに叫んだ。「誰ー！？　ちょっと、いったんストップ……っ、ぁ！」'),
L('{a}「やば……っ、これ、やばいって……っ、ぁ、あっ」|{a}は笑いながら泣いていた。「なにこれ、なにこれぇ……っ」|{a}「待って、気持ちいい……っ、気持ちいいの、困る……っ！」'),
L('{a}「もっと、もっとして……っ！　止めないで……っ！」|{a}は壁の向こうに向かって叫んだ。「ねえ、次の人も来て……っ！」|{a}「最高……っ、こんなの、知らなかった……っ」')
],
shy:[
L('{a}「ひっ……！？　や、やだ、感覚、戻って……っ」|{a}は口を両手で塞いだ。「こ、声……出したら、聞こえちゃう……っ」|{a}「み、見ないで……触らないで……っ」'),
L('{a}「ん……っ、ん……っ、声、出ちゃ……っ」|{a}は顔を真っ赤にして、壁に額を押しつけた。「恥ずかしい……のに……っ」|{a}「や……そこ、ばっかり……っ」'),
L('{a}「……っ、も、もっと……して、ください……」|{a}は消え入りそうな声で、それでもはっきり言った。「……気持ち、いい……」|{a}「……恥ずかしいのに……やめて、ほしくない……っ」')
],
polite:[
L('{a}「も、申し訳ありません……っ、どなたか、そちらに……っ」|{a}「お、おやめください……っ、感覚が、戻って……っ」|{a}は姿勢を正そうとして、崩れた。「いったい、何を……っ」'),
L('{a}「いけません……っ、そのような、ところ……っ」|{a}は丁寧な言葉を探したが、喘ぎ声しか出てこなかった。「ん……っ、失礼、いたしました……っ」|{a}「お、お手柔らかに……お願い、いたします……っ」'),
L('{a}「……どうか、続けて、くださいませ……っ」|{a}は乱れた息のまま、壁の向こうへ一礼するように頭を下げた。「……とても、心地よう、ございます……」|{a}「お気の済むまで……どうぞ……っ」')
]
};
X.ENJOY={
recv:L('{a}は壁に手をつき直して、自分から腰を後ろへ押しつけた。壁の向こうで、誰かが満足げに息を漏らした。|{a}は壁の向こうに向かって「次の人、まだ？」と声をかけた。返事の代わりに、新しい手が腰を掴んだ。|{a}は穴の縁が腰に食い込むのも構わず、少しでも深く届くように体を沈めた。|{a}は、向こう側の誰かが果てて離れるたびに、名残惜しそうに腰を揺らした。'),
top:L('{a}は壁に手をつき直して、自分から腰を突き出した。壁の向こうで、跨っていた誰かが甘い声を上げた。|{a}は壁の向こうに向かって「次の人、まだ？」と声をかけた。返事の代わりに、新しい誰かが{a}のものに腰を落としてきた。|{a}は穴の縁が腰に食い込むのも構わず、壁の向こうへ深く突き上げた。|{a}は、向こう側の誰かが降りるたびに、名残惜しそうに腰を揺らした。')
};
X.END=[
L('カチリ、と解放の音がした。{a}は腰を壁から引き抜くと、その場にへたり込んだ。「……終わった……」|「時間です」――どこかで声がした。{a}は壁から抜け出すと、震える脚で必死に出口へ向かった。'),
L('カチリ、と解放の音がした。{a}は壁から抜けたあとも、しばらく腰の奥の余韻に震えていた。|「時間です」――どこかで声がした。{a}はほっとしたような、名残惜しいような顔で、壁から腰を引き抜いた。'),
L('カチリ、と解放の音がした。{a}は、壁から腰を抜こうとしなかった。「……もう少し、このままで」|「時間です」――どこかで声がした。{a}は聞こえなかったふりをして、壁の向こうへ、もう一度腰を押しつけた。')
];
X.TITLE=['最中に戻った ― 知りたくなかった感覚','最中に戻った ― 体だけが先に応えた','壁の向こうを受け入れた ― 自分から求めた'];
X.LINE=[
'感覚が戻ったあとも、{a}は最後まで抵抗をやめなかった。',
'感覚が戻ってから、{a}の体は嫌がる心を置いて、勝手に応え始めた。',
'感覚が戻ってしばらくすると、{a}は壁の向こうを自分から求めるようになっていた。'
];
function M(s){return'{a}「\u2060'+s+'」';}
X.SWEET=[
{recv:'壁の向こうの誰かが、{a}の腰を両手で固定し、容赦なく奥を打ちつけ始めた。感覚が戻ったばかりの体に、それは強すぎた。',
top:'壁の向こうの誰かが、{a}のものの上で、容赦なく腰を打ちつけ始めた。感覚が戻ったばかりの体に、それは強すぎた。',
m:['あ"……っあ、ああああ……うう…………！！','ひっ、あ、あっ、あ"……っ、ま、また……っ、あぁ……っ！'],
mid:'一度果てても、波は引かなかった。{a}の腰はびくびくと跳ね続け、甘い痙攣が次の痙攣を呼んだ。',
end:'{a}は壁に爪を立てたまま、小さく、何度も果て続けた。止め方が、分からなかった。'},
{recv:'一番奥に押し当てられたまま、ぐり、ぐり、とゆっくり捏ねられた。',
top:'根元まで咥え込まれたまま、ゆっくりと締めつけられ、捏ねるように揺すられた。',
m:['ん、んぅ……っ、あ……あ、あ……っ……♡','あ……っ、あ、ぁ……っ、あ……ぁ、あ……♡'],
mid:'強くはないのに、逃げ場がなかった。{a}は浅く果てて、果てたまま、また浅く果てた。',
end:'{a}の膝ががくがくと震え、壁にもたれた上半身がずるずると下がっていった。'},
{recv:'壁の向こうで、何かが低く唸りながら{a}の一番弱いところに押し当てられた。振動は、止まらなかった。',
top:'壁の向こうで、何かが低く唸りながら{a}のものの先に押し当てられた。振動は、止まらなかった。',
m:['あ"っ、あ"っ、あ……っ、ああああ……っ！！','う、うう……っ、あ"……ぁ……っ、ぁ…………！！'],
mid:'果てても、振動は少しも弱まらなかった。{a}は息を吸うたびに果て、吐くたびに果てた。',
end:'振動が止んだあとも、{a}の腰はしばらく勝手に跳ね続けていた。'},
{recv:'一人が果てて離れると、すぐに次の誰かが{a}の腰を掴んだ。休む間は、一秒もなかった。',
top:'一人が果てて降りると、すぐに次の誰かが{a}のものに跨った。休む間は、一秒もなかった。',
m:['あ、あ"……っ、ああああ……っ！！','は、ぁ……っ、あ、ぁ……う……ぁ…………♡'],
mid:'誰の番なのかも分からなくなった。{a}の体は、入れ替わるたびに果てて、そのたびに少しずつ溶けていった。',
end:'{a}は、もう自分が何回果てたのかを数えるのをやめていた。'},
{recv:'壁の向こうの誰かは、{a}が果てそうになるたびに動きを止めた。三度、四度。五度目に、一気に奥まで突き上げられた。',
top:'壁の向こうの誰かは、{a}が果てそうになるたびに腰を止めた。三度、四度。五度目に、一気に根元まで沈み込まれた。',
m:['――っ、あ、あ"……っ！！　あああ……っ、う、うう…………！！','あ……っ、ぁ……は……っ、ぁ…………'],
mid:'堰を切ったように、焦らされていた分が一度に{a}の体を駆け抜けた。果てが、果ての上に重なった。',
end:'{a}は焦点の合わない目のまま、口の端から甘い吐息をこぼし続けた。'}
];
X.sweetText=function(p,top){return p[top?'top':'recv']+M(p.m[0])+p.mid+M(p.m[1])+p.end;};
X.LULL=[
L('壁の向こうが、ふっと静かになった。{a}は荒い息のまま、次に何が来るのかを考えて身構えた。|誰かが離れていく足音がした。{a}はその隙に、壁に額をつけて呼吸を整えようとした。'),
L('壁の向こうが静かになった。{a}の腰は、何も触れていないのに、まだ小さく震えていた。|次の誰かが来るまでの間、{a}は戻ってきた感覚の余韻に、何度も身をよじった。'),
L('壁の向こうが静かになった。{a}は「……まだ？」と、思わず口にしていた。|誰も来ない時間が、{a}にはやけに長く感じられた。腰が、勝手に壁の向こうを探していた。')
];
X.UNAWARE= /知らな|本人の|気づか|感じてな|感じていな/;
X.RECV= /締ま|奥|中に|中を|中が|突き|突か|注が|満た/;
X.SHIFT=[null,
L('嫌だと思っているのに、{a}の腰は壁の向こうの動きに応え始めていた。|{a}の上げる声から、少しずつ拒む響きが抜けていった。|{a}は、壁の向こうの手つきを体が覚え始めていることに気づいてしまった。'),
L('抵抗の声が、いつの間にか甘くねだる声に変わっていた。|{a}はもう、壁の向こうの誰かを拒もうとはしていなかった。|{a}の腰は、自分から壁の向こうの熱を探して揺れるようになっていた。')
];
if(HK.HoleMore&&HK.HoleMore.RELEASE_MODE)HK.HoleMore.RELEASE_MODE.mid='最中に戻る';
X.tier=function(h){
if(h.corrupt>=62||h.reason<30)return 2;
if(h.corrupt>=28||h.reason<60||h.pleasure>=60)return 1;
return 0;
};
})();
});
;
/* ==== js/solo-hole-behind.js ==== */
HK.Load.def(461,'js/solo-hole-behind.js',function(){
(function(){
'use strict';
var HK=window.HK,K=HK.SoloKit;
if(!K)return;
function L(s){return s.split('|');}
function P(S,a){return HK.HoleFresh?HK.HoleFresh(S,a):K.pick(S,a);}
var LOVE= /^(lover|mate|fated|almost|fwb)$/,W={lover:1,mate:1,fated:1,almost:0.8,fwb:0.45,sibling:0.8,sibprot:0.95,sibclose:0.9,parent:0.95,pparent:0.9,best:0.75,buddy:0.8,childhood:0.7,friend:0.5,mentor:0.6,master:0.6,teacher:0.5,senpai:0.4,colleague:0.3,classmate:0.4,boss:0.45,benefactor:0.6,relative:0.6,worship:0.85,fond:0.55,blind:0.75,acq:0.1,ex:0.3,rival: -0.3,enemy: -0.7,sibbad: -0.15,bad: -0.4};
var FAMILY= /^(sibling|sibprot|sibclose|sibbad|parent|pparent|relative)$/;
var T={
arrive1:L('{b}は、壁の向こう側の小部屋に足を踏み入れた。壁から、人の下半身が突き出ていた。|物音を辿って裏の通路に入った{b}は、壁の穴から生えた誰かの腰に出くわした。|{b}が扉を開けると、壁から腰から下だけがこちら側に突き出していた。'),
arriveN:L('{n}は、連れ立って壁の向こう側の小部屋に入った。壁から、人の下半身が突き出ていた。|裏の通路を進んでいた{n}は、壁の穴から生えた誰かの腰を見つけて、立ち止まった。|扉を開けた{n}の前に、壁から突き出た誰かの下半身があった。'),
see:[
L('腰はぴくりとも動かず、何をされても分からない様子だった。|突き出た脚は、行儀よく揃えられたまま静かだった。'),
L('穴の縁で、腰が小さく震えていた。肌はうっすらと汗ばみ、熱を帯びているのが見て取れた。|腰のあたりが、ときおり小さく跳ねた。肌は上気して、ほのかに赤く色づいていた。'),
L('腰から下は、すっかり熱に浮かされていた。誘うようにひくつき、触れる前から甘い匂いを立てていた。|突き出た腰は、物欲しげに揺れていた。汗に濡れた肌が灯りを照り返し、誰が見ても分かるほど発情していた。')
],
know:L('{b}は、見覚えのある靴と脚に気づいた。――{a}だ。|{b}は、腰のほくろの位置で分かってしまった。これは{a}の体だ。|壁の向こうから、くぐもった声が聞こえた。{b}には、それが{a}の声だと分かった。'),
stranger:L('{b}には、それが誰の体なのか分からなかった。|{b}は、誰の体だろうと首をかしげた。|{b}は脚の形をしばらく眺めたが、見覚えはなかった。|{b}には、壁から生えた腰の持ち主に心当たりがなかった。'),
strangerN:L('{n}には、それが誰の体なのか分からなかった。|{n}は顔を見合わせたが、誰の体なのか、心当たりのある者はいなかった。|{n}は脚の形を確かめ合ったが、誰も見覚えがなかった。'),
help1:L('{b}は迷わず壁に手をかけ、穴の縁をこじ開けて{a}の体を引き抜いた。|{b}は壁の継ぎ目を探し、留め具を外して、{a}の腰をそっと穴から抜き出した。|{b}は周りを見回して道具を探し、壁を削って{a}を助け出した。'),
helpStranger:L('{b}は「放っておけない」と呟き、知らない誰かの腰を、壁から引き抜きにかかった。――壁の向こうから出てきたのは、{a}だった。|{b}は困っている人を見過ごせなかった。穴の縁を広げて引き抜くと、それは{a}だった。'),
leave:L('{b}は見なかったことにして、静かに扉を閉めた。|{b}は関わり合いになりたくなくて、そっと引き返した。|{b}は気まずそうに目を逸らし、足早に通り過ぎた。'),
lead:L('{b}は皆が言い合う前に壁に取りついた。「話はあと。まず出す」――{b}の勢いに押されて、{m}も手を貸した。|{b}はすぐさま指示を出した。「そっちを押さえて。私が引く」――皆がかりで、{a}の体は壁から抜けた。|使命感に背中を押されるように、{b}が先に動いた。{m}もつられて手を伸ばし、{a}を壁から引きずり出した。'),
hesitate:L('{c}は「た、助けたほうがいいよね……？」と、壁の前でおろおろしていた。|{c}は手を伸ばしかけて、引っ込めた。誰の体か分からないまま触れるのが、怖かった。|{c}は助けようか迷って、何度も周りを見回した。'),
beforeYou:L('そのあいだに、{b}が待ちきれないように腰に手をかけた。|{c}が迷っているうちに、{b}はもう服をくつろげていた。|{c}が言葉を探しているあいだに、{b}は笑って壁に歩み寄った。'),
discuss:L('{n}は壁の前で顔を見合わせた。|{n}は、壁から突き出た腰を前に、小声で相談を始めた。|しばらく、誰も口を開かなかった。'),
say:{
help:L('{b}「出してあげよう」|{b}「困ってるんだよ、助けないと」|{b}「さすがに放っておけない」'),
lewd:L('{b}「……少しくらい、いいんじゃない」|{b}「こんなの、誘ってるようなものだよ」|{b}「どうせ誰か分からないんだし」'),
leave:L('{b}「関わらないほうがいい」|{b}「見なかったことにしよう」')
},
decideHelp:L('結局、皆で{a}を助け出すことになった。|話はまとまり、{n}は壁に取りついた。'),
decideLewd:L('結局、誰も止めなかった。|反対の声は、小さすぎて届かなかった。'),
decideLeave:L('結局、誰も手を出さず、皆でその場を離れた。|話し合いは、見なかったことにする、で終わった。'),
stop:L('{c}が{b}の腕を掴んで止めた。「やめなよ。それより出してあげよう」|{c}は{b}の前に立ちはだかった。「今は助けるのが先」'),
stopFail:L('{c}の制止は、{b}の耳に届かなかった。|{b}は{c}の手を振りほどいた。'),
pen:L('{b}は{a}の腰を両手で掴み、熱く濡れたところへ、ゆっくりと自分を沈めていった。|{b}は待ちわびるようにひくつく腰を押さえつけ、一息に奥まで貫いた。壁が、規則正しく軋みはじめた。|{b}は息を荒げながら{a}の腰を引き寄せ、深いところで何度も突き上げた。'),
finger:L('{b}は{a}の腰を撫で下ろし、濡れて熱を持ったところに指を沈めた。指を増やすたびに、腰が物欲しげに揺れた。|{b}は穴の縁にもたれかかり、二本の指で奥を探った。腰は、指の動きに合わせて震えた。|{b}は舌と指で、{a}の熱いところを丁寧にほぐしていった。'),
tease:L('{b}は{a}の腰に頬を寄せ、熱を持った肌に舌を這わせた。|{b}は震える腰を両手で包み込み、焦らすように撫で回した。|{b}は{a}の脚の間に顔を埋め、熱いところを唇で確かめた。'),
ride:L('{b}は{a}の腰に跨り、突き出た体を使うように、ゆっくりと腰を揺らした。|{b}は壁に手をつき、{a}の上に跨って、熱を擦りつけるように腰を振った。|{b}は{a}の上で身をくねらせ、壁の向こうの体を好きなように味わった。'),
punish:L('{b}は低く呟いた。「……誰にこんな顔を見せたの」――嫉妬に任せて、{b}は{a}の体を自分のものだと刻みつけるように責め立てた。|{b}の目に、暗い光が宿った。「こんな格好で、誰を待ってたの」――{b}は{a}を許すつもりはなかった。|{b}は{a}の腰に爪を立てた。「ここは私のものだって、分からせてあげる」'),
join:L('{b}も、黙って隣に並んだ。|それを見て、{b}も我慢できなくなった。|{b}は笑って、順番を待たずに手を伸ばした。'),
fingerFF:L('{b}は{a}の濡れたところを指先でそっと割り開いた。女どうしだから分かる場所を、一つずつ確かめるように撫でていった。|{b}は前の芽を親指で転がしながら、二本の指を奥へ沈めた。腰が跳ねるたびに、{b}は指の角度を少しずつ変えた。|{b}は{a}の内腿に頬を寄せ、指で奥の弱いところを探り当てた。そこを押し上げるたびに、壁の向こうの腰がきゅっと縮こまった。'),
teaseFF:L('{b}は{a}の脚の間に顔を埋め、舌先で前の芽をゆっくりと転がした。|{b}は{a}の濡れたところに唇を寄せ、溢れるものを舌で掬い上げた。|{b}は{a}の腰を抱き寄せ、柔らかい唇で、熱を持ったところに何度も口づけた。'),
rideFM:L('{b}は{a}のものを手のひらで包んで硬さを確かめ、それから跨って、自分の中へゆっくりと導き入れた。|{b}は壁に背を預け、{a}のものの上に腰を沈めた。好きな深さ、好きな速さで、搾り取るように腰を揺らした。|{b}は{a}のものに跨ったまま、果てそうになるたびに動きを止めた。「まだ、だめ」――壁の向こうの腰が、焦れて震えた。'),
fingerFM:L('{b}は{a}のものを握り、根元から先まで、搾るようにゆっくりと扱き上げた。|{b}は{a}のものの先を指先で撫で回し、溢れてきたものを塗り広げながら、手首を返して扱いた。|{b}は片手で{a}のものを扱き、もう片方の手で、張りつめた付け根を柔らかく揉みしだいた。'),
penFuta:L('{b}はスカートの奥から自分のものを取り出し、{a}の腰を両手で掴んで、ゆっくりと奥まで沈めていった。|{b}は女の体に似合わない硬さを{a}の入り口に押し当て、一息に貫いた。壁が、{b}のリズムで軋みはじめた。|{b}は息を荒げながら{a}の腰を引き寄せ、自分のもので深いところを何度も突き上げた。'),
unaware:L('壁のこちら側の{a}は、何も感じないまま天井を見上げていた。|こちら側の{a}は、壁が揺れる理由を知らなかった。|{a}は、壁の向こうで誰が何をしているのか、まるで知らなかった。'),
feel:L('{a}は、壁の向こうから伝わる熱に、声を殺して身をよじった。|戻っていた感覚が、壁の向こうの動きを一つ残らず{a}に伝えた。{a}は壁に爪を立てた。|壁の向こうの手つきが、そのまま{a}の腰に響いた。{a}は唇を噛んで、こぼれそうな声をこらえた。|{a}は、壁の向こうで自分の体に何が起きているのかを、もう嫌というほど分かっていた。|感覚が戻った腰は、壁の向こうの動きに合わせて勝手に跳ねた。{a}は額を壁に押し当てて震えた。'),
after:{
rescue:L('ひとしきり満足すると、{b}は壁をこじ開けて{a}を引き抜いた。|事が済むと、{b}は何事もなかったように{a}を穴から助け出した。'),
leave:L('{b}は服を整え、何も言わずに部屋を出ていった。|{b}はそのまま、壁の向こうの{a}を残して去っていった。')
},
rescued:L('壁から抜けた瞬間、{a}の腰に、遮断されていた感覚がまとめて戻ってきた。{a}は{b}にしがみついたまま、声も出せずに震えた。|引き抜かれた{a}の体に、溜まっていた熱が一度に雪崩れ込んだ。{a}は{b}の首に腕を回し、すがりつきながら何度も達した。|助け出されて礼を言いかけた{a}の膝が、崩れた。戻ってきた感覚に耐えきれず、{a}は{b}に抱きついたまま果てた。'),
rescuedNG:L('壁から抜けた瞬間、{a}の腰に、遮断されていた感覚がまとめて戻ってきた。{a}は差し出された手を振りほどき、ひとりで床に膝をついた。背を向けたまま、声も出せずに震え続けた。|引き抜かれた{a}の体に、溜まっていた熱が一度に雪崩れ込んだ。「……来ないで。見ないで」{a}は誰の手も借りず、壁際にうずくまって何度も達した。足音が遠ざかり、扉の閉まる音がした。|助け出されて礼を言いかけた{a}の膝が、崩れた。{a}は支えようとする腕を押し返し、自分の肩を抱いて床にうずくまった。戻ってきた感覚に耐えきれず、{a}はひとりで果てた。'),
rescuedLiveNG:L('{a}は差し出された{b}の手を借りずに、自分で立ち上がった。乱れた服を整え、壁から一歩離れる。「……ありがとう。もう大丈夫」|{a}は{b}に短く礼を言い、目を合わせないまま背を向けた。震える指で襟を留め直す。「先に行って。少し、ひとりにして」'),
rescuedLive:L('{a}は{b}に抱きついて、震える息を吐いた。「……ありがとう」|{a}は助け出されるなり、{b}の胸に額を押しつけた。'),
rescuedTop:L('{a}は壁から抜けるなり、{b}に礼を言った。腰から下には、何の熱も残っていなかった。|{a}は{b}の手を借りて立ち上がった。「助かった」'),
knowAfter:L('――{b}は、助け出したのが{a}だと知って、言葉を失った。|{b}は、自分が触れていたのが{a}の体だったと知って、真っ青になった。')
};
function rel(input,a,b){
var best=0,neg=0,love=false,fam=false,crush=false;
(input.ties||[]).forEach(function(t){
if(!((t.a===a&&t.b===b)||(t.a===b&&t.b===a)))return;
var w=t.type==='crush'?(t.a===a?0.85:0.15):W[t.type]!=null?W[t.type]:0.1;
if(LOVE.test(t.type))love=true;
if(t.type==='crush'&&t.a===a)crush=true;
if(HK.tieNoLove?HK.tieNoLove(t):FAMILY.test(t.type))fam=true;
if(w>best)best=w;if(w<neg)neg=w;
});
return{w:best>0?best+neg*0.3:neg,love:love,crush:crush,fam:fam};
}
var BH=HK.HoleBehind={};
function EB(S,key,base){return HK.Ero?HK.Ero.L(S,'hole','behind.'+key,base):base;}
function EZ(S,t){return HK.Ero&&HK.Ero.on(S)?HK.Ero.fill(S,t,S.h):t;}
BH.cast=function(input){
var n=(input.chars||[]).length,pick=function(i){return((input.perChar&&input.perChar[i]&&input.perChar[i].pick)||{}).side;};
var hi=HK.HoleHost?HK.HoleHost.idx(input): -1,si= -1;
for(var i=0;i<n;i++)if(i!==hi&&pick(i)==='stuck'){si=i;break;}
for(var i2=0;si<0&&i2<n;i2++)if(i2!==hi)si=i2;
if(si<0)si=0;
var others=[];
for(var j=0;j<n;j++)if(j!==si&&j!==hi)others.push(j);
return{si:si,others:others.slice(0,3)};
};
BH.setup=function(S,input,cast){
var Pz=HK.Pos;
S.behind=cast.others.map(function(i){
var c=input.chars[i],b={i:i,lock:HK.lockFirst(c.loveLock),locks:HK.parseLocks(c.loveLock),ng:Array.isArray(c.loveNG)?c.loveNG.filter(function(x){return x>=0;}):[],name:c.name,eg:c.eg,tr:HK.traits(c.eg),gender:c.gender||'',likes:c.likes||'',tone:c.tone||'',pos:c.pos||'',posLike:c.posLike||'',futa: !!c.futa};
b.persona=HK.personaOf(b);
if(HK.charFlags)HK.charFlags(c,b,'hole');
b.r=rel(input,i,cast.si);
return b;
});
if(S.h&&(HK.kinNG||HK.fearNG)){var PM=[];PM[S.h.i]=S.h;S.behind.forEach(function(b){PM[b.i]=b;});if(HK.kinNG)HK.kinNG(PM,input.ties);if(HK.fearNG)HK.fearNG(PM,input.ties);}
S.behindAt=S.behind.length?Math.max(1,Math.round(S.env.hours*(0.25+S.rng()*0.45))):Infinity;
};
function names(l){return l.map(function(b){return b.name;}).join(l.length>2?'・':'と');}
function kindOf(S,b,h){
var Pz=HK.Pos;
if(!Pz|| !Pz.okSex(b,h))return null;
if((HK.ngSexPair&&HK.ngSexPair(b,h))||(HK.sexBlocked&&HK.sexBlocked(b,h)))return null;
var o=Pz.order(b,h,[b,h]);
if(o[0]===b)return Pz.hardTop(h,b)?null:Pz.isF(b)?'finger':'pen';
if(Pz.hasM&& !Pz.hasM(h))return'tease';
if(Pz.hardTop(h,b))return'ride';
return S.rng()<0.5?'ride':'tease';
}
BH.encounter=function(S,st){
var h=S.h,rng=S.rng,B=S.behind,env=S.env;
var vis=Math.min(2,Math.floor((st.stored/14+h.corrupt*0.6+(st.live?h.pleasure*0.5:0)+env.wild*0.15)/25));
if(st.hardTop)vis=Math.min(vis,1);
var F=function(t,v){return K.fmt(S,t,v);};
var t0=B.length===1?F(P(S,T.arrive1),{b:B[0].name}):F(P(S,T.arriveN),{n:names(B)});
t0+=F(P(S,T.see[vis]));
B.forEach(function(b){
b.know=rng()<0.15+Math.max(0,b.r.w)*0.6+(b.r.love?0.15:0)+(h.action.id==='shout'?0.2:0);
var w=b.know?b.r.w:0,love=b.know&&(b.r.love||b.r.crush),t=b.tr;
b.kind=st.guard?null:kindOf(S,b,h);
if(st.topMe&&(b.kind==='pen'||b.kind==='finger')&& !(HK.Pos&&HK.Pos.hardTop(b,h)))b.kind='ride';
var v=vis/2;
b.help=0.12+Math.max(0,w)*0.9+t.np*0.35+t.cp*0.15+t.caution*0.1-v*(t.fc*0.3+t.impulse*0.3)-(b.know&&b.r.fam?0:0);
b.lewd=b.kind?0.05+v*(0.45+t.fc*0.5+t.impulse*0.5+t.aggr*0.25)+(love?v*0.45:0)+Math.max(0,-w)*0.5+env.wild/250-t.warmth*0.15-(love?0:Math.max(0,w)*0.35)-(b.know&&b.r.fam?1:0):0;
b.punish= !!(b.kind&&love&&t.jealous>0.5&&vis>=1&&rng()<0.4+t.jealous*0.4);
if(b.punish)b.lewd+=0.5;
b.leave=0.12+t.cold*0.25+t.caution*0.1;
b.hes=b.persona==='shy'||t.caution>0.66||(t.ac>0.6&&t.cp<0.4);
b.mission=t.np*0.5+t.cp*0.5;
var x=rng()*(Math.max(0.01,b.help)+Math.max(0,b.lewd)+b.leave);
b.choice=x<b.help?'help':x<b.help+Math.max(0,b.lewd)?'lewd':'leave';
if(b.know)t0+=' '+F(P(S,T.know),{b:b.name});
});
var unk=B.filter(function(b){return!b.know;});
if(unk.length>1)t0+=' '+F(P(S,T.strangerN),{n:names(unk)});
else if(unk.length)t0+=' '+F(P(S,T.stranger),{b:unk[0].name});
var o0=K.say(S,{kind:'ev',tag:'壁の向こうの住人',text:t0,why:B.map(function(b){return b.name+'：'+(b.know?'誰の体か気づいた':'誰の体か分からない')+(b.know&&b.r.w?'（関係の近さ '+Math.round(b.r.w*100)+'）':'');}).join('／')+'／発情の見え方 '+['落ち着いている','上気している','すっかり発情している'][vis]});
K.key(S,o0,(B.length===1?B[0].name:names(B))+'が壁の向こうに来た');
var doers=[],rescuer=null,how='';
if(B.length===1){
var b=B[0];
if(b.choice==='help')rescuer=b,how=b.know?'help1':'helpStranger';
else if(b.choice==='lewd')doers=[b];
else{K.say(S,{kind:'ev',tag:'立ち去る',text:F(P(S,T.leave),{b:b.name}),why:b.name+'は関わらなかった（ドライさ・慎重さ）'});return null;}
}else{
var lead=B.slice().sort(function(x,y){return y.mission-x.mission;})[0];
var hes=B.filter(function(x){return x.hes&&x.choice!=='lewd';})[0];
var agg=B.filter(function(x){return x.choice==='lewd'||(x.kind&&x.tr.aggr+x.tr.impulse>1.1);}).sort(function(x,y){return(y.tr.aggr+y.tr.impulse)-(x.tr.aggr+x.tr.impulse);})[0];
if(lead.mission>0.62&&lead.help>lead.lewd&&rng()<0.65){
rescuer=lead;how='lead';
}else if(hes&&agg&&agg!==hes&&agg.kind){
K.say(S,{kind:'ev',tag:'迷い',text:F(P(S,T.hesitate),{c:hes.name})+F(P(S,T.beforeYou),{b:agg.name,c:hes.name}),why:hes.name+'は臆病で迷い、'+agg.name+'は積極的（攻撃性・衝動）'});
doers=[agg];
if(hes.tr.cp>0.55&&rng()<0.5){
var okStop=rng()<0.3+hes.tr.cp*0.4-agg.tr.aggr*0.3;
K.say(S,{kind:'ev',tag:'制止',text:F(P(S,T.stop),{b:agg.name,c:hes.name})+(okStop?'':F(P(S,T.stopFail),{b:agg.name,c:hes.name})),why:hes.name+'のCP'});
if(okStop){doers=[];rescuer=hes;how='help1';}
}
}else{
var t1=F(P(S,T.discuss),{n:names(B)});
B.forEach(function(x){t1+=F(P(S,T.say[x.choice]),{b:x.name});});
var sc={help:0,lewd:0,leave:0};
B.forEach(function(x){sc[x.choice]+=1+(x.choice==='help'?x.tr.cp*0.5:x.choice==='lewd'?x.tr.aggr*0.5:0);});
var win=sc.help>=sc.lewd&&sc.help>=sc.leave?'help':sc.lewd>=sc.leave?'lewd':'leave';
t1+=F(P(S,win==='help'?T.decideHelp:win==='lewd'?T.decideLewd:T.decideLeave),{n:names(B)});
K.say(S,{kind:'ev',tag:'話し合い',text:t1,why:'助ける '+sc.help.toFixed(1)+'・手を出す '+sc.lewd.toFixed(1)+'・立ち去る '+sc.leave.toFixed(1)});
if(win==='help'){rescuer=B.slice().sort(function(x,y){return y.help-x.help;})[0];how='group';}
else if(win==='lewd')doers=B.filter(function(x){return x.choice==='lewd'&&x.kind;});
else return null;
if(win==='lewd'&& !doers.length)return null;
}
}
doers.forEach(function(b,k){
var vk=variantOf(b,h),body=vk?(HK.Ero&&HK.Ero.has('hole','behind.'+vk)?EB(S,vk,T[vk]):vk==='fingerFM'?T[vk]:EB(S,b.kind,T[vk].concat(T[vk],T[b.kind]))):EB(S,b.kind,T[b.kind]);
var tx=(k?F(P(S,T.join),{b:b.name}):'')+(b.punish?F(P(S,EB(S,'punish',T.punish)),{b:b.name}):'')+F(P(S,body),{b:b.name});
var pw={pen:34,finger:26,tease:20,ride:28}[b.kind]+(b.punish?8:0);
if(st.live){
var r=K.stim(S,pw,{part:'belly',defer:true});
tx+=' '+F(P(S,EB(S,b.kind==='pen'?'feel':'feel.other',T.feel)));
if(HK.Attr&&HK.Attr.raceHole&& !st.topMe&&(b.kind==='pen'||b.kind==='finger'))tx+=HK.Attr.raceHole(b,h,b.kind,function(l){return P(S,l);},true);
tx=EZ(S,tx);
var dtk=HK.HoleThick&&HK.HoleThick.doer(S,b.kind,h,b,{topMe:st.topMe});
if(dtk)tx+='\n\n'+dtk;
K.say(S,{kind:'ev',tag:b.punish?'お仕置き':'壁の向こうの住人',text:tx,why:whyOf(b)+'／感覚は戻っている'});
K.logClimax(S,r.climaxes);
}else{
st.stored+=(60+env.wild*0.5)*(b.kind==='pen'?1.3:b.kind==='ride'?1.1:0.9)*(b.punish?1.25:1)*h.sens;
if(b.kind==='pen'||b.kind==='ride')st.meta.cum++;
h.corrupt+=3*(S.k||1);
if(HK.Attr&&HK.Attr.raceHole&& !st.topMe&&(b.kind==='pen'||b.kind==='finger'))tx+=HK.Attr.raceHole(b,h,b.kind,function(l){return P(S,l);},false);
tx+=' '+F(P(S,b.kind==='pen'||b.kind==='finger'?EB(S,'unaware',T.unaware):T.unaware));
tx=EZ(S,tx);
K.say(S,{kind:'ev',tag:b.punish?'お仕置き':'壁の向こうの住人',text:tx,why:whyOf(b)+'／本人は感じていない（溜まった感覚 '+Math.round(st.stored)+'）'});
}
K.settle(S);
});
if(doers.length){
var best=doers.concat(B).sort(function(x,y){return y.help-x.help;})[0];
if(rng()<0.15+Math.max(0,best.help)*0.35){rescuer=best;how='after';}
else{K.say(S,{kind:'ev',tag:'去る',text:F(P(S,T.after.leave),{b:doers[0].name}),why:''});return null;}
}
if(!rescuer)return null;
var others=B.filter(function(x){return x!==rescuer;});
var ht=how==='lead'?F(P(S,T.lead),{b:rescuer.name,m:names(others)||'皆'}):how==='after'?F(P(S,T.after.rescue),{b:rescuer.name}):how==='group'?F(P(S,T.help1),{b:rescuer.name}):F(P(S,T[how]||T.help1),{b:rescuer.name});
if(!rescuer.know&&how!=='helpStranger')ht+=F(P(S,T.knowAfter),{b:rescuer.name});
var o=K.say(S,{kind:'sys',tag:'救出',text:ht,why:rescuer.name+'が助け出した（'+(how==='lead'?'使命感':how==='after'?'事のあとで':how==='group'?'話し合いで':'関係・NP')+'）'});
K.key(S,o,rescuer.name+'に助け出された');
return{rescued:rescuer,doers:doers};
};
function variantOf(b,h){
var Pz=HK.Pos;if(!Pz)return'';
if(b.kind==='pen'&&Pz.futa(b))return'penFuta';
if(b.kind==='finger')return Pz.isF(h)?'fingerFF':Pz.isF(b)?'fingerFM':'';
if(b.kind==='tease'&&Pz.isF(b)&&Pz.isF(h))return'teaseFF';
if(b.kind==='ride'&&Pz.isF(b)&& !Pz.isF(h))return'rideFM';
return'';
}
function whyOf(b){
var k={pen:'挿入',finger:'指で',tease:'触れる・舐める（受けなので挿入しない）',ride:'跨る（受けなので自分からは挿入しない）'}[b.kind];
return b.name+'が手を出した：'+k+(b.punish?'／嫉妬深く、恋人（想い人）の体だと気づいたので、お仕置き':'')+(b.know?'':'／誰の体か分からないまま');
}
BH.rescueEnd=function(S,input,st,res){
var h=S.h,b=res.rescued,F=function(t){return K.fmt(S,t,{b:b.name});};
var ng= !!(HK.ngSexPair&&HK.ngSexPair(h,b))|| !!(HK.sexBlocked&&HK.sexBlocked(h,b))|| !!(HK.Pos&& !HK.Pos.okSex(h,b));
if(st.hardTop)K.say(S,{kind:'sys',tag:'解放',text:F(P(S,T.rescuedTop)),why:st.guard?'性行為の相手を固定した相手だけにしているので、壁の向こうの手を追い払い、何も溜まっていなかった':'自分で攻めを選んでいるので、何も溜まっていなかった'});
else if(st.live||st.stored<20)K.say(S,{kind:'sys',tag:'解放',text:F(P(S,ng?T.rescuedLiveNG:T.rescuedLive)),why:ng?'恋愛・R18にしない相手（または体の関係にならない相手）なので、縋らない':''});
else{
h.pleasure+=st.stored*0.8;h.reason-=st.stored*0.07;h.corrupt+=st.stored*0.03*(S.k||1);
var parts=[];while(h.pleasure>=100&&parts.length<4)parts.push(K.climax(S,{silent:true}));
var oc=K.say(S,{kind:'climax',tag:parts.length>1?'連続絶頂':'絶頂',text:EZ(S,F(P(S,ng?T.rescuedNG:EB(S,st.topMe?'rescued.top':HK.Pos&&HK.Pos.isF(h)&&HK.Pos.isF(b)?'rescued.ff':'rescued',T.rescued))))+(parts.length?' '+(parts[0].charAt(0)==='「'?h.name:'')+parts.join(''):''),why:'助け出された瞬間に、溜まっていた感覚（'+Math.round(st.stored)+'）が戻った'+(ng?'／恋愛・R18にしない相手なので、ひとりで受け止めた':'')});
var rtk=HK.HoleThick&&HK.HoleThick.peak(S,ng?'rescuedNG':'rescued',h,{topMe:st.topMe,b:ng?null:b});
if(rtk)oc.text=rtk+'\n\n'+oc.text;
K.key(S,oc,ng?b.name+'に助け出され、ひとりで達した':b.name+'に抱きついたまま達した');
}
K.settle(S);K.snap(S,{s:0});
var did=res.doers.length?res.doers.map(function(d){return d.name;}).join('と')+'が手を出した':'';
var E={type:'hold',kind:'ok',title:'救出 ― '+b.name+'に助け出された',lines:[
h.name+'は'+S.env.hours+'時間のうち'+S.step+'時間目に、'+b.name+'の手で壁から助け出された。',
did?'壁の向こうでは、'+did+'。'+(st.live?h.name+'はそれを、すべて感じていた。':h.name+'がそれを知ったのは、抜け出した瞬間だった。'):'',
h.climax?h.name+'は'+h.climax+'回果てた。':''
].filter(Boolean)};
return E;
};
BH.text=T;
})();
});
;
/* ==== js/solo-hole-ero.js ==== */
HK.Load.def(462,'js/solo-hole-ero.js',function(){
(function(){
'use strict';
var HK=window.HK,EK=HK.Ero;
if(!EK)return;
function L(s){return s.split('|');}
function E(lv,t,fx){return{lv:lv,t:t,fx:fx||{}};}
var T={};
T['beyond.toilet']=[
E(1,'個室に入ってきた男は、壁から突き出た尻を見るなりズボンを下ろした。{s:hit}――無言で十分ほど腰を打ちつけ、{s:cum}と奥に吐き出すと、内腿に正の字を一本足して出ていった。',{n:1,cum:1,mark:1}),
E(1,'男は{a}の穴に指を二本ねじ込み、{s:wet}と音を立てて掻き回した。「⁠ガバガバじゃねえか、何人目だよ」――笑いながら、そのまま自分のものを根元まで沈めた。',{n:1,cum:1}),
E(2,'個室の外に、いつの間にか列ができていた。一人終わるごとに、次の男が{a}の穴から溢れたものを指で掻き出し、「⁠まだあったけえ」と笑ってまた奥まで突き入れた。{s:hit}――壁の正の字が、三つ増えた。',{n:3,cum:3,mark:3}),
E(2,'男は{a}の腰を両手で固定し、「⁠便器なんだから文句ねえよな」と吐き捨てて、{s:hit}と容赦なく奥を叩いた。抜かずに二回、{s:cum}――{a}の腹が、注がれた分だけ、うっすらと膨らんでいた。',{n:1,cum:2,mark:1}),
E(0,'誰かが{a}の尻たぶにマジックで「ご自由にお使いください♡」と書き、その横に矢印を引いた。矢印の先は、ひくつく穴だった。',{mark:2}),
E(2,'酔った男たちが二人がかりで{a}の脚を抱え上げた。「⁠二本まとめて入るんじゃね？」――{s:wet}――一つの穴が二人分に押し広げられ、{s:hit}とばらばらのリズムで奥を叩かれた。最後は二人同時に、{s:cum}と注ぎ込まれた。',{n:2,cum:2,mark:2}),
E(1,'男はローターを{a}の奥に押し込み、テープで尻に貼りつけた。「⁠帰るまでイきっぱなしにしといてやるよ」――{a}の腰は、誰もいない個室で、ぶるぶると震え続けた。',{tent:1,mark:1}),
E(2,'常連らしい男が「⁠今日もいるな、俺の便器」と笑い、{a}の一番弱いところだけを{亀頭}でごりごりと抉った。向こう側の{a}の脚は、本人の知らないところで、つま先までぴんと反り返って痙攣していた。',{n:1,cum:1,mark:1})
];
T['beyond.lab']=[
E(1,'魔術師は記録用の水晶をかざし、{a}の穴に媚薬をたっぷりと塗り込んだ。「⁠被験体、感度上昇を確認」――{s:wet}――指を抜くたびに、穴が物欲しげにひくついた。',{n:1,mark:1}),
E(2,'壁の向こうで、助手たちが順番に{a}を使い、そのたびに羊皮紙に数字を書き込んだ。「⁠射精量、三人目で合計――」{s:cum}――「⁠あ、四人目入りました」',{n:4,cum:4,mark:4}),
E(1,'魔術師は透明な張形を{a}の奥まで沈め、中が締まる様子をじっくりと観察した。「⁠意識がなくても、ここはちゃんと吸いつくのか。実に興味深い」',{n:1,tent:1,mark:1}),
E(2,'召喚されたスライムが{a}の穴にずるずると潜り込み、中で膨らんでは縮み、膨らんでは縮んだ。{s:wet}――溢れ出た粘液が、床の魔法陣を濡らしていった。',{tent:2}),
E(2,'「⁠搾れるだけ記録を取る」――魔術師の号令で、助手が{a}の奥を突き、別の助手が回数を数えた。{s:hit}――羊皮紙の正の字は、もう五つ並んでいた。',{n:2,cum:3,mark:5})
];
T['beyond.show']=[
E(1,'「⁠さあ一回千円、中出し自由！」――客の男が硬貨を投げ入れ、観客の歓声の中で{a}の尻を鷲掴みにした。{s:hit}、{s:cum}――客席から拍手が起きた。',{n:1,cum:1,mark:1}),
E(2,'客が次々と壇上に上がった。主人は一人終わるごとに{a}の太腿に正の字を書き足し、「⁠まだまだ入りますよ！」と{a}の膨らんだ下腹を叩いてみせた。',{n:5,cum:5,mark:5}),
E(1,'客の一人が{a}の穴を指で広げ、観客に向けて中を見せた。{s:wet}――とろりと溢れた白いものに、客席がどっと沸いた。',{n:1,mark:1}),
E(2,'主人は{a}の穴に太い張形をねじ込み、ハンドルを回して出し入れさせた。「⁠本日の目玉、壁尻の自動ピストン！」――{s:hit}――客席は、最後まで誰も帰らなかった。',{tent:1,mark:2,n:3})
];
T['beyond.dungeon']=[
E(2,'太い触手が{a}の穴にずるりと入り込み、奥で何度も脈打った。{s:cum}――どろりとした卵のようなものが注ぎ込まれ、{a}の下腹が、ゆっくりと丸く膨らんでいった。',{tent:2,cum:1}),
E(1,'細い触手が何本も{a}の穴の縁をくすぐり、一本ずつ中へ潜り込んでいった。{s:wet}――中で絡まり合い、壁の向こうから粘ついた音が絶え間なく響いた。',{tent:1}),
E(2,'オークが壁の前にどっかりと座り込み、丸太のようなものを{a}の穴に押し当てた。{s:hit}――一突きごとに壁が軋み、最後は{s:cum}と、溢れるほど注ぎ込んだ。',{n:1,cum:2}),
E(1,'通りかかった冒険者が「⁠罠部屋の名物か」と笑い、{a}を使ってから壁に短剣で正の字を刻んでいった。',{n:1,cum:1,mark:1}),
E(2,'ゴブリンの群れが、{a}の穴を取り合って順番に腰を振った。{s:hit}、{s:cum}――群れが去ったあと、{a}の腹はたぷたぷに膨れ、脚の間から白いものが糸を引いていた。',{n:5,cum:5})
];
T['beyond.white']=[
E(1,'天井から降りてきた機械のアームが、{a}の穴に張形を押し当てた。{s:hit}――規則正しいピストンの音と、スピーカーの声。「⁠耐久試験、一時間目」',{tent:1,mark:1}),
E(2,'モニターに「搾精・注入量：計測中」と表示された。機械は{a}の奥へ温かい液体を{s:cum}と注ぎ込み、そのたびに数字が増えていった。',{tent:2,cum:2,mark:2}),
E(1,'壁の向こうの部屋に、紙の指示を持った住人が入ってきた。「⁠……『壁の穴を三回使用すること』」――住人はためらいながらも、指示どおり三回、{a}の中で果てた。',{n:1,cum:3,mark:3}),
E(2,'機械のアームが二本、{a}の腰を固定し、三本目が高速で奥を突き続けた。{s:hit}――スピーカーが告げた。「⁠被験体、無自覚のまま十回目の絶頂反応を記録」',{tent:2,mark:2})
];
T.beyondTop=[
E(1,'壁の向こうで、誰かが{a}のものを口に含み、{s:suck}と音を立てて硬くさせた。それからためらいもなく跨り、根元まで呑み込んで腰を振り始めた。',{n:1,cum:1}),
E(2,'壁の前に列ができていた。一人が{a}のものの上で果てて降りるたびに、次の人が「⁠まだ硬い」と笑って跨った。{s:hit}――壁の正の字が、三つ増えた。',{n:3,cum:3,mark:3}),
E(1,'向こう側の誰かが、{a}のものにローションを垂らして両手で扱き上げた。{s:wet}――びくびくと脈打つのを確かめると、満足げに自分の中へ導いた。',{n:1,cum:1})
];
T.contrast=L('――そのころ{a}は、「意外と平気かも」とあくびをしていた。|――同じころ、{a}は天井のしみを数えていた。腹の中に何が溜まっていくのかも知らずに。|――{a}は退屈そうに爪をいじっていた。下半身が今まさに使われていることなど、まるで知らなかった。|――こちら側の{a}は、「晩ご飯、何にしよう」と呟いていた。|――{a}は平然とした顔で、時計の秒針を目で追っていた。その間にも、壁の向こうの正の字は増えていった。');
T['contrast.top']=L('――そのころ{a}は、「意外と平気かも」とあくびをしていた。|――{a}は退屈そうに爪をいじっていた。下半身が今まさに使われていることなど、まるで知らなかった。');
T.leak=L('一瞬だけ、遮断が揺らいだ。{s:hit}――腰の奥を叩かれる感触が、遅れて一発だけ届いた。{a}「――っ、{m1}」|ほんの一秒、感覚が戻った。奥にどくどくと熱いものが注がれている、その感触だけが。{a}「は、ぁ……っ♡　な、に……っ、いま……っ」|遮断がちらついた。穴をごりごりと抉られる感覚が一瞬だけ走り、{a}の膝が勝手に跳ねた。{a}「{m1}」――すぐに、また何も感じなくなった。|一瞬、腰の奥に{s:wet}という水音と、熱く濡れた感触が届いた。{a}は自分の口から甘い声が漏れたことに、遅れて気づいた。');
T['leak.top']=L('一瞬だけ、遮断が揺らいだ。自分のものが、熱く濡れた中に根元まで咥え込まれている感触が、一発だけ届いた。{a}「――っ、{m1}」|ほんの一秒、感覚が戻った。根元をきゅうっと締めつけられる感触が走り、{a}の腰が勝手に跳ねた。');
T.flood=L('次の瞬間、{h}時間ぶんの「使われた」感覚が、まとめて{a}の腰の奥へ雪崩れ込んだ。突かれた回数、注がれた熱、擦られた場所、その全部が一度に。|遅れていたすべてが、一度に叩きつけられた。{s:hit}――存在しないはずの腰の動きが、何十回分も一瞬で{a}の奥を抉った。|{a}の腹の奥で、{h}時間かけて注がれた熱が、一斉に「熱い」と叫び出した。膨らんだ下腹が、内側からびくびくと痙攣した。');
T['flood.top']=L('次の瞬間、{h}時間ぶんの感覚が、まとめて{a}のものへ雪崩れ込んだ。咥え込まれ、締めつけられ、扱かれた分の全部が、一度に。|遅れていたすべてが、一度に{a}の根元へ叩きつけられた。何度も吐き出したはずの熱が、今さら込み上げてきた。');
T.wave=L('{s:hit}――幻の腰つきが、何人分も重なって{a}の奥を叩いた。|腹の奥で、注がれていたものがどぷっと揺れた。その重さだけで、{a}の腰が跳ねた。|一番弱いところを抉られた記憶が、まとめて神経を駆け上がった。|{s:wet}――太腿を伝って、溜まっていたものが溢れ出した。その感触が、さらに{a}を追い詰めた。|壁に書かれた正の字の数だけ、絶頂が順番に{a}を呑み込んでいった。');
T['wave.top']=L('締めつけられた記憶が、まとめて{a}の根元を駆け上がった。|何度分もの射精感が、一度に{a}を突き上げた。');
T['confuse.proud']=L('{a}「お゛っ……♡　な、んだ、これ……っ、何人に、ヤられ……っ♡♡」|{a}は壁に爪を立てた。「ふざ、け……っ、イくの、止まんね……っ♡♡」|{a}「腹、あつ……っ♡　中、どんだけ、出されて……っ♡」|{a}「くそ、っ……♡　体が、勝手に、締まる……っ♡♡」|{a}は歯を食いしばったまま、腰だけをがくがくと跳ねさせた。「見んな……っ♡　今、見んな……っ♡♡」');
T['confuse.stern']=L('{a}「あ゛……っ♡　か、数え……られ、な……♡♡」|{a}は背筋を伸ばそうとして、膝から崩れた。「腹の、奥、が……っ♡　こんなに、注がれ……っ♡♡」|{a}「ぉ……っ♡　規律、が……あたま、が……♡♡」|{a}「く……っ♡　耐え、ろ……耐え……ぁ゛……♡♡」|{a}は壁に額を押しつけた。「ふ、不覚……っ♡　また、来る……っ♡♡」');
T['confuse.tsun']=L('{a}「やっ♡　うそ、うそ、こんなの、聞いてな……っ♡♡」|{a}「感じてない、のに……っ♡　なんで、イくの……っ♡♡」|{a}「ばか、ばかぁ……♡　お腹、たぷたぷ、してる……っ♡♡」|{a}「やだ、やだぁ……っ♡　また、イっちゃう……っ♡♡」|{a}は涙目で壁を叩いた。「お、覚えてなさいよ……っ♡　ぁ、あっ♡♡」');
T['confuse.gentle']=L('{a}「あ、あぁ……っ♡　待って、ちょうだい……っ、こんなに、いっぺんに……♡♡」|{a}は困った笑みのまま、涙と涎をこぼした。「わたし、何人に……っ♡　ぁ、また……♡♡」|{a}「お腹、いっぱい……っ♡　とけちゃう……♡♡」|{a}「ん、ぁ……♡　奥まで、あったかい……♡♡」|{a}は壁にもたれて、甘い吐息をこぼし続けた。「こんなに、されてたの……っ♡」');
T['confuse.devoted']=L('{a}「ごめ、なさ……っ♡　わかんない、何回、イってるか……わかんない……っ♡♡」|{a}「大丈夫って、言ったのに……っ♡　だいじょぶ、じゃ、ない……♡♡」|{a}は泣きながら壁にしがみついた。「おなか、くるし……っ♡　きもちい……っ♡♡」|{a}「ぁ、ぁ……っ♡　ぜんぶ、ぜんぶ、きちゃう……っ♡♡」|{a}は震える指で壁を撫でた。「向こうの、ひと……っ♡　ありがと、ござ……っ♡♡」');
T['confuse.cool']=L('{a}「ぁ゛……っ♡　なん、かい……？　計算、が……♡♡」|{a}の口から、意味をなさない数字がこぼれた。「ろく……なな……ぉ゛っ♡♡」|{a}「思考、が……っ♡　とけ……る……♡♡」|{a}「入力、過多……っ♡　処理、できな……♡♡」|{a}は自分の腹を押さえ、焦点の合わない目で呟いた。「中に……まだ、残って……っ♡」');
T['confuse.free']=L('{a}「えっ、なにこれ、なにこれぇ♡♡　やば、やばいってこれぇ……っ♡」|{a}「イく、イくイく、またイく……っ♡♡　とまんないぃ……♡」|{a}は笑っているのか泣いているのか分からない声を上げた。「お腹、ぱんぱん……っ♡♡」|{a}「なにこれ、なにこれっ♡　すっご、やばぁ……っ♡♡」|{a}はけらけら笑いながら痙攣した。「何人分〜？　あは、わかんな……っ♡♡」');
T['confuse.shy']=L('{a}「ひっ♡　や、やだ……っ♡　こえ、でちゃ……♡♡」|{a}は口を両手で押さえたが、指の隙間から甘い声が漏れ続けた。「{m2}」|{a}「み、見ないで……っ♡　いまの、きかないで……っ♡♡」|{a}「や、ぁ……っ♡　こんな、こえ……でちゃ……っ♡♡」|{a}は両手で顔を覆ったまま、腰だけを震わせた。「は、はずかし……っ♡　とまんな……♡♡」');
T['confuse.polite']=L('{a}「も、申し訳、ありませ……っ♡　な、中に、いったい、何人の方が……っ♡♡」|{a}「い、いけません……っ♡　こんな、いっぺんに……っ♡♡」|{a}は丁寧な言葉を探そうとして、ひとつも見つからなかった。「{m2}」|{a}「お、お許しを……っ♡　こんなに、一度には……っ♡♡」|{a}は姿勢を保とうとして、崩れ落ちた。「し、失礼、いたしま……っ♡♡」');
T.drip=L('遮断は、少しずつほどけていった。最初に戻ってきたのは、穴からとろりと溢れ出す、生ぬるい{精液}の感触だった。');
T['after.fall']=L('{a}はしばらく動けなかった。やがて震える手で、まだひくつく穴を自分で撫で、壁に向かって囁いた。「……もう一回、入れて♡」|{a}は解放されたあとも、壁の穴の前から離れなかった。太腿を伝うものを指ですくって舐め、次に入るのを待っていた。|{a}は自分から、もう一度壁の穴へ腰を戻した。「次の人……はやく……♡」――向こう側から、拍手と、ベルトを外す音が聞こえた。');
T['after.broken']=L('{a}は床にへたり込んだまま、焦点の合わない目で天井を見ていた。脚の間から、どぷ、どぷ、と白いものが溢れ続けていた。|{a}は膨らんだ下腹に恐る恐る触れて、そこにまだ注がれたものが残っているのを確かめ、顔を覆った。|{a}は立ち上がろうとして、腰が抜けたままへたり込んだ。動くたびに中のものが溢れて、そのたびに小さく甘イキした。');
T['after.hold.proud']=L('{a}は膝を震わせながらも、自分の足で立った。脚の間を伝うものを乱暴に拭って、「二度と来るか」と吐き捨てた。');
T['after.hold.stern']=L('{a}は壁に額をつけたまま、長い息を吐いた。下腹に残る重さを無視して服を整え、背筋を伸ばして部屋を出た。');
T['after.hold.tsun']=L('{a}は真っ赤な顔で「き、記憶にないから！　お腹のこれも、何もないから！」と叫んで走り去った。');
T['after.hold.gentle']=L('{a}は「あらあら……ずいぶん、使われちゃったのね」と膨らんだお腹を撫でて、ふらふらと立ち上がった。');
T['after.hold.devoted']=L('{a}は泣きながら笑った。「……耐えた。お腹、たぷたぷだけど、ちゃんと、耐えたよ」');
T['after.hold.cool']=L('{a}は脚の間から溢れるものを見下ろし、「……推定、十人以上」とだけ呟いて、記録には残さなかった。');
T['after.hold.polite']=L('{a}は溢れるものを丁寧に拭い、壁に一礼してから部屋を出た。膝は、まだ震えていた。');
T['after.hold.free']=L('{a}は床に大の字になって、「すっご……お腹パンパンなんだけど……」と天井に向かって笑った。');
T['after.hold.shy']=L('{a}は乱れた服を整え、何もなかった顔で部屋を出た。廊下に出た瞬間、脚の間から溢れた感触に、壁に手をついてしゃがみ込んだ。');
T.peek=L('{a}は服を整えてから、壁の向こう側に回ってみた。壁には正の字が{marks}個。床には白い水たまりができていて、「⁠肉便器」「{visits}人目まで確認」と落書きが残っていた。|{a}は壁の裏を覗いた。自分の腰の形にへこんだ跡の周りに、使用済みのゴムと、正の字が{marks}個。{a}は黙って扉を閉めた。|{a}は壁の向こうを覗いた。穴の縁から垂れた白いものが、床まで糸を引いていた。落書きには「{visits}人に使われた便器」とあった。');
T['live.toilet.0']=L('壁の向こうの男が、ぴたりと腰を止めた。「⁠……今、締まったぞ。こいつ、感じてやがる」|列に並んだ男たちが顔を見合わせた。「⁠感覚戻ったってよ」「⁠マジかよ、次俺な」');
T['live.toilet.1']=L('「⁠おい、ケツ振ってるぞこれ」――向こう側の声が弾んだ。{s:hit}――突く速さが、明らかに上がった。|男たちは、{a}が声を噛み殺すたびに笑った。「⁠ほら、もっと鳴けよ便器」');
T['live.toilet.2']=L('壁の向こうで「⁠自分から吸いついてくる」と声がした。列が、さらに伸びた。|男たちは{a}の反応に合わせて、交代の間隔を詰めた。抜いた瞬間に次が入る。{s:hit}――休む暇は、もうなかった。');
T['live.lab.0']=L('魔術師が羽ペンを走らせた。「⁠感覚復帰。被験体の締めつけ、三割増し」|助手が器具の目盛りを読み上げた。「⁠先生、本人がものすごく嫌がってます」「⁠記録を続けて」');
T['live.lab.1']=L('「⁠抵抗値が下がってきた」――魔術師は媚薬の小瓶をもう一本、{a}の穴に直接流し込んだ。|助手が頬を赤くして報告した。「⁠先生、被験体の声が……完全に甘くなってます」');
T['live.lab.2']=L('魔術師が羽ペンを置いた。「⁠記録は十分だ。あとは好きなだけイかせてあげなさい」|助手が器具を止めようとすると、{a}は「とめないで♡」と声を上げた。');
T['live.show.0']=L('客席から「⁠動いた！」と声が上がった。主人が叫んだ。「⁠さあさあ、今日だけ、本当に感じる壁尻だ！」|触っていた客が驚いて手を引っ込め、それから、もう一度ゆっくりと指を沈めた。');
T['live.show.1']=L('客たちは{a}の反応に夢中になって、次々と手を伸ばした。「⁠ここ？」「⁠いや、こっちだ――ほら、イった」|主人が「⁠中出し、時間延長でございます！」と叫んだ。客席が沸いた。');
T['live.show.2']=L('客席は総立ちだった。壁の向こうで、{a}の腰が自分から客のものを追いかけているのが、誰の目にも分かった。|主人は看板を「本日の花形・イキっぱなし壁尻」に掛け替えた。');
T['live.dungeon.0']=L('触手が、{a}の体温が変わったのを感じ取ったように、中で一斉に動きを速めた。{s:wet}|罠の部屋に、{s:wet}という音と、{a}の押し殺した声だけが響いた。');
T['live.dungeon.1']=L('触手たちは、{a}が一番大きく声を上げた場所を覚え、そこばかりを集中して抉った。|罠の壁が、{a}の反応に合わせて脈打ち始めた。部屋そのものが、{a}を味わっていた。');
T['live.dungeon.2']=L('触手たちは、もう{a}を逃がす気がなかった。{a}の腰も、逃げる気がなかった。卵を注がれるたび、{a}は甘く鳴いた。');
T['live.white.0']=L('スピーカーが告げた。「⁠被験者の感覚復帰を確認。ピストン強度、維持」|モニターに数字が表示された。{a}が締めつけるたびに、数字が増えていった。');
T['live.white.1']=L('スピーカーが告げた。「⁠反応値上昇。ピストン速度、二段階上げます」――{s:hit}|白い壁に、{a}の絶頂回数がグラフで映し出された。');
T['live.white.2']=L('スピーカーが告げた。「⁠被験者が快楽を受け入れました。試験を無期限に延長します」|モニターに「アクメ回数：測定不能」と表示された。');
T['feel.recv.0']=L('感覚が戻ったばかりの穴を、太く熱いものがゆっくりと押し広げていた。ずっと突かれていたはずの奥が、今さら「熱い」と悲鳴を上げた。|何時間も何も感じなかった反動で、擦られるたびに神経が焼き切れそうだった。{s:wet}');
T['feel.recv.1']=L('{s:hit}――突かれるたびに、腰の奥から甘い痺れが背骨を駆け上がった。逃げようとした腰が、勝手に押しつけられていた。|奥の一番弱いところをごりっと擦られるたび、{a}の頭の中で何かが弾けた。');
T['feel.recv.2']=L('{a}は、もう壁の向こうから奥を突かれるたびに声を上げていた。知らない誰かのものが自分の中で膨らみ、どぷどぷと注がれる感触が、どうしようもなく気持ちよかった。|注がれるたびに、{a}の腹がまた少し膨らんだ。それが嬉しかった。');
T['feel.top.0']=L('感覚が戻った途端、{a}は自分のものが誰かの熱い中に根元まで咥え込まれていることを知った。|締めつけてくる柔らかさが、いちいち鮮明だった。{s:wet}');
T['feel.top.1']=L('上で動く誰かの腰が沈むたびに、{a}の背筋を甘い痺れが駆け上がった。{s:hit}|根元から先までを搾り上げられるたびに、{a}の頭の中が白くなった。');
T['feel.top.2']=L('{a}は、もう誰かが跨ってくるたびに、壁の向こうへ腰を突き上げていた。搾り取られる感覚が、どうしようもなく気持ちよかった。');
var RX={
proud:[
'{a}「な、んだ、これ……っ！　誰だ、勝手に……ハメてんじゃ、ねえ……っ」|{a}は壁を拳で叩いた。「抜けって、言ってんだろ……っ、{m0}」',
'{a}「{m1}」――{a}は歯を食いしばったが、腰が勝手に押しつけられた。|{a}「くそ……っ、なんで、{尻}で、感じて……っ♡」',
'{a}「……っ、もっと、奥……突けよ……っ♡」|{a}は壁に額を押しつけて、荒い息のまま笑った。「中に、出せ……っ♡　全部……っ」'
],
stern:[
'{a}「……っ、何を、している……！　ただちに、抜け……っ」|{a}は背筋を伸ばそうとして、膝が崩れた。「{m0}」',
'{a}「{m1}」――規則正しかった呼吸が、突かれるたびに乱れた。|{a}「……体が、勝手に……締まる……っ♡」',
'{a}「……もう、少しだけ……奥、に……♡」|{a}は自分の口から出た言葉に愕然として、それから目を閉じた。「……注いで、くれ……♡」'
],
tsun:[
'{a}「ちょっ、うそ、なんで感じ……っ、や、抜いてよ……っ！」|{a}「か、感じてないから！　{m0}」',
'{a}「{m1}」|{a}「べ、別に、気持ちよくなんか……っ、ない、のに……っ♡」',
'{a}「……ぬ、抜いたら、許さない、から……っ♡」|{a}「……中に、出して、って言ってない……言ってない、けど……っ♡」'
],
gentle:[
'{a}「あら、あ……っ？　待って、今、何か……入ってる……っ」|{a}「{m0}」',
'{a}「{m1}」|{a}「そんなに、奥ばっかり……っ♡　わたし、困っちゃう……♡」',
'{a}「……ふふ、いい子ね……♡　全部、中に、ちょうだい……♡」|{a}は壁にもたれて、とろんとした目で微笑んだ。「好きなだけ、使って……♡」'
],
devoted:[
'{a}「えっ、あ……っ、か、感覚が……っ、ど、どうしよう……っ」|{a}「{m0}」',
'{a}「{m1}」|{a}「だ、だめなのに……っ♡　{尻}、勝手に……っ♡」',
'{a}「……っ、もっと、使ってください……っ♡」|{a}「わたしで、いっぱい、気持ちよくなって……中に、ください……♡」'
],
cool:[
'{a}「……っ、遮断が……解けた……？　なら、今、挿入されて……っ」|{a}「{m0}」',
'{a}「{m1}」|{a}「理屈では……分かってるのに……っ♡　締まるのが、止められない……♡」',
'{a}「……もう、考えるのは……やめる……っ♡」|{a}は計算を手放して目を閉じた。「……続けて。奥に、出して……♡」'
],
free:[
'{a}「えっ、えっ、なにこれ、急に感じる……っ！？　今ハメられてんの！？」|{a}「{m0}」',
'{a}「{m1}」|{a}「やば……っ♡　これ、やばいって……っ♡　奥、きもちい……♡」',
'{a}「もっと、もっとして……っ♡　止めないで♡」|{a}は壁の向こうに向かって叫んだ。「ねえ、次の人も来て……っ♡　中に出してぇ♡」'
],
shy:[
'{a}「ひっ……！？　や、やだ、感覚、戻って……っ」|{a}は口を両手で塞いだ。「{m0}」',
'{a}「{m1}」|{a}は顔を真っ赤にして、壁に額を押しつけた。「は、恥ずかしい、のに……っ♡」',
'{a}「……っ、も、もっと……して、ください……♡」|{a}は消え入りそうな声で、それでもはっきり言った。「……なか、に……ほしい……♡」'
],
polite:[
'{a}「も、申し訳ありません……っ、どなたか、そちらで……っ」|{a}「{m0}」',
'{a}「{m1}」|{a}「いけません……っ♡　そのような、奥まで……っ♡」',
'{a}「……どうか、続けて、くださいませ……っ♡」|{a}は乱れた息のまま頭を下げた。「……中に、お出しくださいませ……♡」'
]
};
Object.keys(RX).forEach(function(p){RX[p].forEach(function(s,i){T['react.'+p+'.'+i]=L(s);});});
T['enjoy.recv']=L('{a}は壁に手をつき直して、自分から尻を後ろへ押しつけた。{s:hit}――壁の向こうで、誰かが満足げに唸った。|{a}は壁の向こうに向かって「次の人、まだ？　早く、挿れて……♡」と声をかけた。|{a}は自分で腰を揺らし、注がれたものが溢れる音をわざと立てた。{s:wet}');
T['enjoy.top']=L('{a}は壁に手をつき直して、自分から腰を突き上げた。壁の向こうで、跨っていた誰かが甘い声を上げた。|{a}は壁の向こうに向かって「次の人、まだ？」と声をかけた。');
T['end.0']=L('カチリ、と解放の音がした。{a}は腰を壁から引き抜くと、その場にへたり込んだ。脚の間から、注がれたものがどろりと溢れた。');
T['end.1']=L('カチリ、と解放の音がした。{a}は壁から抜けたあとも、腹の奥の余韻にびくびくと震えていた。');
T['end.2']=L('カチリ、と解放の音がした。{a}は、壁から腰を抜こうとしなかった。「……もう少し、このままで……♡　次の人、いるでしょ……？」');
T['behind.pen']=L('{b}は{a}の尻を両手で割り開き、ひくつく穴に先端を押し当てた。{s:wet}――そのまま一息に根元まで沈め、{s:hit}と腰を打ちつけ始めた。|{b}は待ちわびるようにひくつく穴を見下ろし、「……誘ってるよね、これ」と呟いて、奥まで貫いた。{s:hit}――最後は奥に押しつけたまま、{s:cum}と注ぎ込んだ。');
T['behind.finger']=L('{b}は{a}の穴に指を沈め、{s:wet}と音を立てて中を掻き回した。指を増やすたびに、腰が物欲しげに揺れた。|{b}は二本の指で奥の弱いところを探り当て、そこばかりを執拗に押し上げた。{s:wet}――指を抜くと、とろりと糸が引いた。');
T['behind.tease']=L('{b}は{a}の尻に顔を埋め、ひくつく穴に舌を差し入れた。{s:suck}|{b}は震える腰を両手で包み込み、内腿から穴の縁まで、焦らすように舐め上げた。');
T['behind.ride']=L('{b}は{a}の腰に跨り、突き出た体を使うように、熱く濡れたところを擦りつけて腰を揺らした。{s:wet}|{b}は壁に手をつき、{a}の上で腰を振った。{s:wet}――擦りつけるたびに、壁の向こうで{a}の腰がびくびくと跳ねた。');
T['behind.punish']=L('{b}は低く呟いた。「……誰にこんな穴、見せてたの」――嫉妬に任せて、{b}は{a}を自分のものだと刻みつけるように責め立てた。|{b}の目に、暗い光が宿った。「こんな格好で、誰に使われてたの」――');
T['behind.unaware']=L('壁のこちら側の{a}は、何も感じないまま天井を見上げていた。腹の中に注がれていくものも知らずに。|こちら側の{a}は、壁が揺れる理由を知らなかった。|{a}は、自分の穴が今まさに使われていることを、まるで知らなかった。');
T['behind.feel.other']=L('戻っていた感覚が、壁の向こうの熱を一つ残らず{a}に伝えた。{a}「{m1}」|{a}は、壁の向こうから伝わる熱に身をよじった。「{m1}」');
T['behind.feel']=L('{a}は、壁の向こうから伝わる熱に身をよじった。{a}「{m1}」|戻っていた感覚が、奥を突かれる一回一回を{a}に伝えた。{a}は壁に爪を立てた。「{m1}」');
T['behind.rescued']=L('壁から抜けた瞬間、遮断されていた感覚がまとめて戻ってきた。注がれていた熱、突かれた回数、その全部が一度に。{a}は{b}にしがみついたまま、声も出せずにイき続けた。|引き抜かれた{a}の体に、溜まっていた熱が一度に雪崩れ込んだ。脚の間から白いものを溢れさせながら、{a}は{b}の腕の中でびくびくと痙攣した。');
T['behind.rescued.top']=L('壁から抜けた瞬間、遮断されていた感覚がまとめて戻ってきた。咥え込まれ、搾られた分の全部が一度に。{a}は{b}にしがみついたまま、声も出せずに果て続けた。');
EK.add('hole',T);
var T2={};
T2.drip=L('遮断は、少しずつほどけていった。最初に戻ってきたのは、奥に溜まった重たい熱――何人分も注がれた{s:cum}の名残が、ゆっくりと腹の底へ落ちていく感触だった。|最初に戻ってきたのは、穴の縁のじんじんとした痺れだった。何度も押し広げられ、擦られ続けたことを、そこだけが先に思い出していた。{a}「{m0}」');
T2['after.hold.proud']=L('{a}は壁に拳を叩きつけ、それから脚の間を伝う白いものを睨みつけた。「……誰のか分かったら、ただじゃおかねえ」――膝は、まだ笑っていた。|{a}は奥に残る熱を無視して立ち上がった。歩くたびにこぼれる感触に舌打ちして、「二度と来るか」とだけ言った。');
T2['after.hold.stern']=L('{a}は太腿を伝うものを黙って拭い取り、乱れた服を一つずつ正した。腹の奥の重さを、意志の力だけで無視して歩き出した。|{a}は壁から離れても、しばらく直立したまま動かなかった。注がれた分の重さが下腹に沈んでいくのを、歯を食いしばってやり過ごした。');
T2['after.hold.tsun']=L('{a}は脚の間を押さえて真っ赤になった。「こ、これは汗だから！　汗！」――誰も聞いていないのに、何度もそう言った。|{a}は溢れてくる感触に「ひゃっ」と声を上げ、慌てて口を塞いだ。「……い、今のも、なし！」');
T2['after.hold.gentle']=L('{a}は下腹をそっと撫でて、困ったように笑った。「みんな、遠慮しなかったのね……」――溢れるものを拭いながら、ゆっくり立ち上がった。|{a}は「あら、まだ出てくる」と頬に手を当て、脚を閉じて小さく息をついた。');
T2['after.hold.devoted']=L('{a}はお腹を両手で押さえて、こぼれないように小さく丸まった。「……大丈夫。わたし、まだ、大丈夫」|{a}は震える脚で立ち上がり、太腿を伝うものを拭きながら、一歩ずつ出口へ向かった。「帰らなきゃ……ちゃんと」');
T2['after.hold.cool']=L('{a}は脚の間から垂れるものの量を目で測り、「……正の字と、整合する」と呟いた。声だけは、いつも通りだった。|{a}は下腹に溜まった熱を手のひらで確かめ、「影響は一時的」と自分に言い聞かせて、服を整えた。');
T2['after.hold.polite']=L('{a}は溢れるものをハンカチで丁寧に拭い、「……大変、お見苦しいところを」と誰もいない壁に詫びた。|{a}は脚を揃えて立ち、こぼれないよう慎重に一礼した。「……失礼、いたします」');
T2['after.hold.free']=L('{a}は脚の間をのぞき込んで、「うわ、まだ出てくる。何人ぶん？」と笑った。笑うたびに、また少しこぼれた。|{a}は膨らんだ下腹をぽんぽんと叩いて、「満員御礼って感じ？」と天井に言った。');
T2['after.hold.shy']=L('{a}は脚の間から溢れる感触に固まり、服の裾をぎゅっと押さえた。「……っ、ど、どうしよう……」|{a}は誰にも見られないよう壁に背をつけ、溢れるものを震える指で拭い続けた。顔は、耳まで真っ赤だった。');
T2['end.0']=L('「時間です」――どこかで声がした。{a}は壁から抜け出すと、震える脚で必死に立とうとした。そのたびに、奥から{s:cum}と白いものがこぼれた。|カチリ、と解放の音がした。{a}は這うようにして壁から離れ、「{m0}」と息を詰めた。脚の間は、まだひくついていた。');
T2['end.1']=L('「時間です」――どこかで声がした。{a}は壁から抜けたとたん、腰が砕けてその場に座り込んだ。「{m1}」――余韻だけで、また小さく達していた。|カチリ、と解放の音がした。{a}は抜けたあとも、注がれた分の熱が奥で脈打つのを感じて、太腿を擦り合わせた。');
T2['end.2']=L('「時間です」――どこかで声がした。{a}は聞こえなかったふりをして、壁の向こうへ尻を突き出したままだった。「{m2}」|カチリ、と解放の音がした。{a}は壁から抜けると、自分の指で穴を広げて、壁の向こう側へ見せつけた。「……ねえ、まだ、空いてるよ……♡」');
T2['live.dungeon.2']=L('{a}は自分から脚を開き、触手を奥へ迎え入れた。{s:wet}――太い一本が一番奥を小突くたびに、「{m2}」と甘く鳴いた。|罠の部屋の奥から、新しい触手が次々と這い出てきた。{a}の腰は、それを迎えるように揺れていた。{s:wet}');
T2['feel.top.2']=L('{a}は、跨ってくる誰かの中で何度も脈打った。{s:cum}――搾り取られるたびに、もっと欲しいと腰が勝手に突き上がった。|根元まで咥え込まれ、締めつけられ、吐き出させられる。その繰り返しが、もう{a}には気持ちよくて仕方なかった。「{m2}」');
T2['behind.rescued.top']=L('引き抜かれた{a}の腰に、何時間分もの熱が一度に戻ってきた。咥え込まれ、搾られ、吐き出させられた回数の全部が。{a}は{b}の腕の中で、{s:cum}と空打ちしながら果て続けた。|壁から抜けた瞬間、{a}のものが勝手に跳ねた。何度も搾られた記憶が一度に腰を駆け上がり、{a}は{b}にしがみついて「{m2}」と鳴いた。');
T2['behind.rescued.ff']=L('壁から抜けた瞬間、遮断されていた感覚がまとめて戻ってきた。掻き回され、舐められ、弄ばれた分の全部が一度に。{a}は{b}の柔らかい胸にしがみついたまま、声も出せずにイき続けた。|引き抜かれた{a}の体に、溜まっていた熱が一度に雪崩れ込んだ。{a}は{b}の首に腕を回し、「{m2}」と鳴きながら、腕の中でびくびくと痙攣した。|助け出された{a}は、{b}の膝に崩れ落ちた。何時間分もの甘い痺れが腰から駆け上がり、{b}の服をぎゅっと掴んだまま、何度も達した。');
T2['behind.fingerFF']=L('{b}は{a}の濡れた割れ目を指で開き、{s:wet}と音を立てて奥を掻き回した。「女の子の気持ちいいとこ、全部知ってるんだから」|{b}は前の芽を親指で押し潰しながら、二本の指で奥の弱いところを擦り上げた。{s:wet}――壁の向こうの腰が、びくびくと跳ねた。|{b}は指を三本に増やし、{a}が潮を噴くまで同じ場所を押し上げ続けた。{s:wet}');
T2['behind.teaseFF']=L('{b}は{a}の脚の間に顔を埋め、前の芽に吸いついた。{s:suck}――溢れてくる蜜を、一滴残さず啜り上げた。|{b}は舌を尖らせて{a}の入り口をほじり、{s:suck}と音を立てて吸った。|{b}は唇で前の芽を挟み、舌先で弾き続けた。{s:suck}――壁の向こうで、{a}の太腿が{b}の頭をぎゅっと挟んだ。');
T2['behind.rideFM']=L('{b}は{a}のものを根元まで一気に咥え込み、{s:hit}と自分から腰を打ちつけた。「ほら、まだ出しちゃだめ」|{b}は{a}のものに跨り、締めつけては緩め、緩めては締めつけた。{s:wet}――搾り取るように、何度でも。|{b}は{a}の上で腰を回し、{a}が果てそうになるたびに動きを止めた。五回目に止めなかったとき、{s:cum}――壁の向こうで、{a}のものが{b}の中で脈打った。');
T2['behind.fingerFM']=L('{b}は{a}のものを握り、{s:wet}と音を立てて扱き上げた。先から溢れるものを指で塗り広げ、さらに速く。|{b}は{a}のものの根元をきつく握ったまま、先だけを指先でくすぐった。出させてもらえない腰が、壁の向こうで暴れた。|{b}は両手で{a}のものを包み、搾るように扱いた。{s:cum}――噴き上がったものを、{b}は手のひらで受け止めて笑った。');
T2['behind.penFuta']=L('{b}はスカートの奥から反り返ったものを取り出し、{a}の穴に押し当てた。{s:wet}――女の体に似合わない太さが、根元まで沈んだ。|{b}は{a}の腰を掴み、自分のもので{s:hit}と奥を叩いた。「ふふ……こっちで抱くの、久しぶり」|{b}は{a}の奥に押しつけたまま、{s:cum}と注ぎ込んだ。それでも硬さは衰えず、二回目が始まった。');
EK.add('hole',T2);
})();
});
;
/* ==== js/hole-thick.js ==== */
HK.Load.def(463,'js/hole-thick.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK)return;
function L(s){return s.split('|');}
var OPEN={
break:{
f:L('遮断の膜が弾けた瞬間、{a}の腰から下に、何時間分もの感触が雪崩のように押し寄せた。撫でられた跡、吸われた跡、擦られ続けた跡が、一度に熱を持って疼き出す。{a}は壁に爪を立てたまま、自分の体がどこまでも溶けていくのを感じた。|ぱちん、と何かが切れた音がして、{a}の下半身に感覚が戻った。最初に分かったのは、脚の間がとろとろに濡れきっていることだった。次に分かったのは、その濡れたところを、今まさに誰かの指がなぞっていることだった。|戻ってきたのは、感覚というより熱そのものだった。内腿も、{尻}も、脚の間も、さっきまで何も感じなかったのが嘘のように、じんじんと脈を打っている。{a}は息の仕方を忘れたように、口を開けたまま震えた。'),
m:L('遮断の膜が弾けた瞬間、{a}の腰から下に、何時間分もの感触が雪崩のように押し寄せた。扱かれた跡、吸われた跡、後ろを擦られ続けた跡が、一度に熱を持って疼き出す。{a}は壁に爪を立てたまま、張りつめたものがびくびくと跳ねるのを感じた。|ぱちん、と何かが切れた音がして、{a}の下半身に感覚が戻った。最初に分かったのは、自分のものが痛いほど張りつめていることだった。次に分かったのは、その先端を、今まさに誰かの指がくるくると撫でていることだった。|戻ってきたのは、感覚というより熱そのものだった。根元も、内腿も、{尻}の奥も、さっきまで何も感じなかったのが嘘のように、じんじんと脈を打っている。{a}は息の仕方を忘れたように、口を開けたまま震えた。'),
top:L('遮断の膜が弾けた瞬間、{a}の腰から下に、何時間分もの感触が雪崩のように押し寄せた。何度も誰かに跨られ、熱く濡れた場所に呑み込まれた記憶が、一度に熱を持って甦る。{a}は壁に爪を立てたまま、張りつめたものがびくびくと跳ねるのを感じた。|ぱちん、と何かが切れた音がして、{a}の下半身に感覚が戻った。最初に分かったのは、自分のものが、今まさに誰かの熱い中に根元まで包まれていることだった。向こう側の誰かが、ゆっくりと腰を揺らしていた。|戻ってきたのは、感覚というより熱そのものだった。張りつめたものの根元から先まで、さっきまで何も感じなかったのが嘘のように、じんじんと脈を打っている。{a}は息の仕方を忘れたように、口を開けたまま震えた。')
},
flood:{
f:L('波は、まだ終わっていなかった。一つ果てるたびに、次の何時間分かがせり上がってきて、{a}の脚の間をまた熱くする。もう何がどの記憶なのかも分からず、ただ気持ちいいということだけが、何度も何度も体の奥を叩いた。|戻ってくる感覚は、一番最後に一番大きな波を残していた。誰かの指が中を掻き回した感触、舌がしつこく芽を転がした感触、道具が奥で震え続けた感触――それらが全部重なって、{a}の下腹でひとつに膨らんでいく。|{a}は床にへたり込んだまま、腰だけをがくがくと揺らしていた。何もされていないのに、脚の間はひくひくと疼き、溢れたものが内腿を伝っていく。壁の向こうで何時間も溜め込まれた分が、まだ底をつかなかった。'),
m:L('波は、まだ終わっていなかった。一つ果てるたびに、次の何時間分かがせり上がってきて、{a}のものをまた硬くする。もう何がどの記憶なのかも分からず、ただ気持ちいいということだけが、何度も何度も腰の奥を叩いた。|戻ってくる感覚は、一番最後に一番大きな波を残していた。誰かの手に扱き上げられた感触、口に含まれて吸われた感触、後ろを指で探られ続けた感触――それらが全部重なって、{a}の下腹でひとつに膨らんでいく。|{a}は床にへたり込んだまま、腰だけをがくがくと揺らしていた。何もされていないのに、張りつめたものは脈を打ち、先からとろとろと先走りが溢れていく。壁の向こうで何時間も溜め込まれた分が、まだ底をつかなかった。'),
top:L('波は、まだ終わっていなかった。一つ果てるたびに、次の何時間分かがせり上がってきて、{a}のものをまた硬くする。跨られ、締めつけられ、搾り取られた記憶が、何度も何度も腰の奥を叩いた。|戻ってくる感覚は、一番最後に一番大きな波を残していた。何人もの熱い中に代わる代わる包まれた感触が、全部重なって、{a}の根元でひとつに膨らんでいく。|{a}は床にへたり込んだまま、腰だけをがくがくと揺らしていた。何もされていないのに、張りつめたものは脈を打ち、誰かの中にいるような錯覚が消えない。壁の向こうで何時間も溜め込まれた分が、まだ底をつかなかった。')
},
sweet:{
f:L('もう、壁の向こうで何をされても、全部そのまま届いてしまう。誰かの指が入り口を撫でるだけで、{a}の膝ががくがくと笑った。イったばかりの体は少しも休ませてもらえず、敏感なところばかりを狙って責め続けられた。|{a}は壁にしがみついたまま、腰を逃がすこともできなかった。向こう側の誰かは、{a}が果てるたびに少しだけ手を止めて、震えが収まりかけたところでまた始める。そのたびに、前より浅いところで、前より簡単にイかされた。|向こう側からは、くちゅくちゅという音がはっきり聞こえていた。それが自分の体の音だと分かるたびに、{a}の顔が熱くなる。恥ずかしいと思えば思うほど、奥がきゅうっと締まって、また小さな波がやってきた。'),
m:L('もう、壁の向こうで何をされても、全部そのまま届いてしまう。誰かの指が裏側をなぞるだけで、{a}の膝ががくがくと笑った。果てたばかりの体は少しも休ませてもらえず、敏感な先ばかりを狙って責め続けられた。|{a}は壁にしがみついたまま、腰を逃がすこともできなかった。向こう側の誰かは、{a}が果てるたびに少しだけ手を止めて、震えが収まりかけたところでまた始める。そのたびに、前より浅いところで、前より簡単にイかされた。|向こう側からは、ぬちゅぬちゅという音がはっきり聞こえていた。それが自分のものを扱く音だと分かるたびに、{a}の顔が熱くなる。恥ずかしいと思えば思うほど、腰の奥がきゅうっと締まって、また小さな波がやってきた。'),
top:L('もう、壁の向こうで何をされても、全部そのまま届いてしまう。誰かが跨って腰を落とすたびに、熱く濡れた中が{a}のものを根元まで呑み込んだ。果てたばかりのものを少しも休ませてもらえず、締めつけられ、揺すられ続けた。|{a}は壁にしがみついたまま、腰を逃がすこともできなかった。向こう側の誰かは、{a}が果てそうになるたびに動きを止めて、震えが収まりかけたところでまた腰を使い始める。そのたびに、前より簡単に、前より深く搾り取られた。|向こう側からは、肌のぶつかる湿った音がはっきり聞こえていた。それが自分のものを呑み込む音だと分かるたびに、{a}の顔が熱くなる。恥ずかしいと思えば思うほど、根元がきゅうっと疼いて、また次の波がやってきた。')
},
rescued:{
f:L('壁から抜けた瞬間、{a}の腰から下に、何時間分もの感触が一度に流れ込んできた。{a}は立っていられず、{b}の胸に崩れ落ちた。{b}の腕に支えられたまま、脚の間がとろとろに溶けていくのを、どうすることもできなかった。|{b}が{a}を抱き起こそうとしたその時、溜まっていた感覚が堰を切った。撫でられた跡も、吸われた跡も、全部が一度に熱を持つ。{a}は{b}の服を握りしめ、声にならない声を上げた。|{a}は{b}にしがみついたまま、自分の体に何が起きているのか分からなかった。何もされていないのに、脚の間がひくひくと疼き、溢れたものが内腿を伝っていく。{b}の匂いと体温が、かえって熱を煽った。'),
m:L('壁から抜けた瞬間、{a}の腰から下に、何時間分もの感触が一度に流れ込んできた。{a}は立っていられず、{b}の胸に崩れ落ちた。{b}の腕に支えられたまま、張りつめたものがびくびくと跳ねるのを、どうすることもできなかった。|{b}が{a}を抱き起こそうとしたその時、溜まっていた感覚が堰を切った。扱かれた跡も、吸われた跡も、全部が一度に熱を持つ。{a}は{b}の服を握りしめ、声にならない声を上げた。|{a}は{b}にしがみついたまま、自分の体に何が起きているのか分からなかった。何もされていないのに、張りつめたものが脈を打ち、先からとろとろと溢れていく。{b}の匂いと体温が、かえって熱を煽った。'),
top:L('壁から抜けた瞬間、{a}の腰から下に、何時間分もの感触が一度に流れ込んできた。{a}は立っていられず、{b}の胸に崩れ落ちた。何人もの熱い中に包まれた記憶が一度に甦り、張りつめたものがびくびくと跳ねた。|{b}が{a}を抱き起こそうとしたその時、溜まっていた感覚が堰を切った。跨られ、締めつけられ、搾り取られた跡が、全部一度に熱を持つ。{a}は{b}の服を握りしめ、声にならない声を上げた。|{a}は{b}にしがみついたまま、自分の体に何が起きているのか分からなかった。何もされていないのに、誰かの中にいるような熱が根元から消えない。{b}の匂いと体温が、かえって熱を煽った。')
},
rescuedNG:{
f:L('壁から抜けた瞬間、{a}の腰から下に、何時間分もの感触が一度に流れ込んできた。{a}は差し出された手を振り払い、壁際へ這うように離れた。床に膝をついたまま、脚の間がとろとろに溶けていくのを、どうすることもできなかった。|助け起こそうとする腕を、{a}は「触らないで」と押し返した。その瞬間、溜まっていた感覚が堰を切った。撫でられた跡も、吸われた跡も、全部が一度に熱を持ち、{a}は自分の肩を抱いて床にうずくまった。|{a}は誰にも縋らず、ひとりで壁に背を預けた。何もされていないのに、脚の間がひくひくと疼き、溢れたものが内腿を伝っていく。閉じた扉の向こうの気配さえ、今は遠かった。'),
m:L('壁から抜けた瞬間、{a}の腰から下に、何時間分もの感触が一度に流れ込んできた。{a}は差し出された手を振り払い、壁際へ這うように離れた。床に膝をついたまま、張りつめたものがびくびくと跳ねるのを、どうすることもできなかった。|助け起こそうとする腕を、{a}は「触るな」と押し返した。その瞬間、溜まっていた感覚が堰を切った。扱かれた跡も、吸われた跡も、全部が一度に熱を持ち、{a}は自分の肩を抱いて床にうずくまった。|{a}は誰にも縋らず、ひとりで壁に背を預けた。何もされていないのに、張りつめたものが脈を打ち、先からとろとろと溢れていく。閉じた扉の向こうの気配さえ、今は遠かった。'),
top:L('壁から抜けた瞬間、{a}の腰から下に、何時間分もの感触が一度に流れ込んできた。{a}は差し出された手を振り払い、壁際へ這うように離れた。何人もの熱い中に包まれた記憶が一度に甦り、張りつめたものがびくびくと跳ねた。|助け起こそうとする腕を、{a}は「触るな」と押し返した。その瞬間、溜まっていた感覚が堰を切った。跨られ、締めつけられ、搾り取られた跡が全部一度に熱を持ち、{a}は自分の肩を抱いて床にうずくまった。|{a}は誰にも縋らず、ひとりで壁に背を預けた。何もされていないのに、誰かの中にいるような熱が根元から消えない。閉じた扉の向こうの気配さえ、今は遠かった。')
}
};
var BUILD={
f:L('{a}の太腿の内側が、ぴくぴくと勝手に震え始めた。お腹の奥がきゅうっと縮んで、また緩んで、そのたびに甘い痺れが背骨を駆け上がる。逃げようとする腰とは裏腹に、脚の間は物欲しげにひくついていた。|{a}は唇を噛んでこらえようとした。けれど、噛んだ唇の隙間から、熱い息が勝手に零れていく。脚の間からは、とろりと蜜が溢れ続けていた。|頭の中に、白い靄がかかっていく。何も考えられないのに、脚の間の感覚だけが、どこまでも鮮明だった。{a}の指先が、壁の上で何度も空を掻いた。|胸の先までが、触れられてもいないのに硬く尖っていた。全身の肌が粟立ち、服が擦れるだけで小さく声が漏れる。{a}は、自分がこんなに感じやすい体だったことを知らなかった。'),
m:L('{a}の太腿の内側が、ぴくぴくと勝手に震え始めた。根元の奥がきゅうっと縮んで、また緩んで、そのたびに甘い痺れが背骨を駆け上がる。逃げようとする腰とは裏腹に、張りつめたものは物欲しげに脈を打っていた。|{a}は唇を噛んでこらえようとした。けれど、噛んだ唇の隙間から、熱い息が勝手に零れていく。張りつめたものの先から、とろりと先走りが溢れ続けていた。|頭の中に、白い靄がかかっていく。何も考えられないのに、腰から下の感覚だけが、どこまでも鮮明だった。{a}の指先が、壁の上で何度も空を掻いた。|胸の先までが、触れられてもいないのに硬く尖っていた。全身の肌が粟立ち、服が擦れるだけで小さく声が漏れる。{a}は、自分がこんなに感じやすい体だったことを知らなかった。'),
top:L('{a}の太腿の内側が、ぴくぴくと勝手に震え始めた。根元の奥がきゅうっと縮んで、また緩んで、そのたびに甘い痺れが背骨を駆け上がる。もう我慢など効かないと、体のほうが先に分かっていた。|{a}は唇を噛んでこらえようとした。けれど、噛んだ唇の隙間から、熱い息が勝手に零れていく。締めつけられる感触が、根元から先まで何度も往復した。|頭の中に、白い靄がかかっていく。何も考えられないのに、張りつめたものを包む熱だけが、どこまでも鮮明だった。{a}の指先が、壁の上で何度も空を掻いた。')
};
var LINK=L('自分の声とは思えない、甘く掠れた声だった。|声を抑えようとしても、もう喉が言うことを聞かなかった。|壁の向こうに聞こえていると分かっていても、止められなかった。|吐き出した息が、そのまま声になって零れた。|噛み殺そうとした声が、喉の奥でほどけて溢れ出した。|呼吸のたびに、細く震える声が混じった。|自分の声が壁に跳ね返って、{a}の耳をさらに熱くした。|言葉にしようとしたものは、全部ただの喘ぎになった。');
var PERS_PEAK={
proud:L('{a}は最後まで「こんなもので」と吐き捨てようとした。けれど、悪態の途中で腰が跳ね、言葉は情けないほど甘い声に変わった。睨みつけていた目尻から、悔し涙が一筋こぼれた。|{a}は歯を食いしばり、意地だけで声を殺そうとした。誰にも負けたことのない体が、壁の向こうの見知らぬ手にあっけなく屈していく。屈辱と快感の区別が、もうつかなかった。|「くそ、くそ……っ」と繰り返すたびに、{a}の声は上ずっていった。拳で壁を叩いても、その拳にさえ力が入らない。{a}は、生まれて初めて自分の体に負けた。|{a}は「覚えてろ」と唸った。唸る声が、波に打たれるたびに裏返る。いちばん見せたくなかった顔を、{a}は誰もいない天井に晒していた。'),
stern:L('{a}は最後まで姿勢を正そうとしていた。乱れまいと唇を結び、眉間に皺を寄せて耐える。その結んだ唇の端から、こらえきれない声が一筋だけ零れ落ちた。|{a}は「耐えろ」と自分に命じ続けた。命じる声が、途中で何度も途切れる。規律で固めてきた体が、内側から少しずつ崩されていった。|{a}は壁に額を押し当て、呼吸を数えて正気を保とうとした。三つ数えたところで、数がどこまで進んだのか分からなくなった。きつく閉じた瞼の裏が、白く弾けた。|{a}は膝を揃え、最後の一線だけは守ろうとした。守ろうとした膝が、甘い痺れにがくがくと震え出す。乱れた息を整える間もなく、{a}は堪えきれずに声を上げた。'),
tsun:L('{a}は「ち、違う、感じてなんか」と言い張った。言い張る声が、最後まで続かない。真っ赤になった顔を誰にも見られていないことだけが、せめてもの救いだった。|{a}は「ばか、ばか」と誰にともなく繰り返した。そのたびに声は甘く崩れ、最後には泣き声みたいになった。強がる言葉を探しても、口から出るのは熱い息ばかりだった。|{a}は意地でも声を出すまいと、自分の腕に噛みついた。噛んだ腕の上で、くぐもった声が震える。それでも、体のほうは正直に、何度も何度も跳ね上がった。|{a}は「今のはなし、今のはなしだから」と早口で言った。言い終わる前に、次の波が来た。強がる声は、とうとう素直な喘ぎに変わってしまった。'),
gentle:L('{a}は戸惑いながらも、押し寄せる熱を拒まなかった。拒もうとするより先に、体のほうが柔らかくほどけていく。困ったように眉を下げたまま、{a}は甘い息をこぼし続けた。|{a}は「だめよ、こんなの」と小さく言った。言いながら、壁に寄りかかった体はとろけきっていた。優しい声が、甘い喘ぎに変わるのはあっという間だった。|{a}は熱に身を任せるように、ゆっくりと目を閉じた。押し寄せる波をひとつひとつ受け止めるたびに、唇から柔らかな声が漏れる。その声は、もう誰に向けたものでもなかった。|{a}は「あら、あら……」と、困り果てた声を漏らした。頬に添えた手が、熱に浮かされて小さく震えている。穏やかだった呼吸は、いつの間にか浅く甘く乱れていた。'),
devoted:L('{a}は「だ、大丈夫です」と誰にともなく繰り返した。大丈夫ではないことは、震える声が何より正直に語っていた。それでも{a}は、押し寄せるものを健気に受け止め続けた。|{a}は「ご、ごめんなさい」と謝りながら果てた。何に謝っているのか、自分でも分からなかった。謝るたびに、体の奥がきゅうっと切なく締まった。|{a}は声を殺そうと、自分の手の甲を口に押し当てた。けれど、押し当てた手の内側で、いくつもの甘い声が弾けた。健気にこらえた分だけ、波は大きく返ってきた。|{a}は待っている人の名前を、心の中で何度も呼んだ。呼ぶたびに胸がきゅっと痛んで、なのに体は止まらない。{a}は泣きそうな顔のまま、押し寄せる波に身を震わせた。'),
cool:L('{a}は最後まで、表情を変えまいとしていた。けれど浅くなる呼吸と、紅潮していく頬が、平静をとっくに裏切っている。落ち着いた声が、ひと息ごとに少しずつ崩れていった。|{a}は自分の体に起きていることを、他人事のように眺めようとした。眺めようとした目の焦点が、ふっと合わなくなる。頭の中が、静かに真っ白になっていった。|{a}は「……待て」と小さく言った。何を待ってほしいのか、自分でも分からなかった。動じないはずの声が、甘く掠れて途切れた。|{a}は「理屈では、分かっている」と呟いた。分かっていることと、耐えられることは別だった。冷静な声の芯が、とうとう溶けて崩れ落ちた。'),
free:L('{a}は「なにこれ、やばい」と笑おうとした。笑い声は、すぐに甘い悲鳴に変わった。恥じらう余裕もなく、{a}は気持ちいいところに素直に腰を押しつけた。|{a}は楽しげに声を上げ、波が来るたびに全身で受け止めた。我慢という言葉は、最初から{a}の辞書になかった。気持ちいい、気持ちいいと、{a}は何度も口に出した。|{a}は「もっと」と壁の向こうにねだった。返事の代わりに、さらに強い波が返ってくる。{a}は笑う余裕もなくなるまで、夢中でそれを貪った。|{a}は「すごい、すごい」と子どものように繰り返した。繰り返す声が、だんだん言葉の形をなくしていく。最後には、ただ甘い声だけが弾けるように溢れた。'),
shy:L('{a}は自分の声が恥ずかしくて、両手で顔を覆った。覆った指の隙間から、消え入りそうな甘い声が漏れ続ける。耳の先まで、真っ赤に染まっていた。|{a}は「み、見ないで」と、誰もいない方に向かって言った。見られていないと分かっていても、言わずにいられなかった。恥ずかしさで、体の奥がかえって熱くなった。|{a}は身を縮めて、波が過ぎるのをじっと待とうとした。けれど、縮めた体の奥で、熱は少しも引いてくれない。小さな声が、何度も喉からこぼれ落ちた。|{a}は小さく首を振って、「だめ、です」と囁いた。囁いた声は、自分の耳にもはっきりと甘く聞こえた。恥ずかしさに涙を浮かべながら、{a}は小さく何度も震えた。'),
polite:L('{a}は「お、お見苦しいところを」と詫びた。詫びる言葉の途中で、腰がびくりと跳ねる。丁寧な言葉遣いが、ひと息ごとに崩れていった。|{a}は乱れまいと、居住まいを正そうとした。正そうとした背筋が、波に打たれてしなやかに反る。上品な唇から、はしたない声が零れ落ちた。|{a}は「どうか、お許しを」と誰にともなく言った。許しを請う声が、甘く震えて途切れる。言葉を選ぶ余裕は、もうどこにも残っていなかった。|{a}は「失礼、いたしました」と言いかけて、言葉を飲み込んだ。飲み込んだ言葉の代わりに、震える吐息が零れる。礼儀正しく揃えていた指先が、壁の上でほどけていった。')
};
var PEAK={
f:L('次の瞬間、溜まっていたものがすべて弾けた。{a}の背中が弓なりに反り、爪先がぴんと伸びる。脚の間が何度も何度も痙攣して、そのたびに甘い波が頭の先まで突き抜けた。|大きな波が、{a}を頭の先まで呑み込んだ。お腹の奥がぎゅうっと縮み、溢れたものが床にまで滴る。{a}はしばらく、自分がどこにいるのかも分からなかった。|果てた瞬間、{a}の目の前が真っ白になった。痙攣は一度では終わらず、二度、三度と体を揺らす。ようやく息ができるようになったとき、{a}の頬は涙で濡れていた。|限界を越えたのは、ほんの小さなひと撫でだった。それだけで{a}の奥がきゅうっと縮み上がり、腰が壁の穴の中で何度も跳ねる。溢れた蜜が、太腿の内側をゆっくりと伝っていった。|{a}の指が壁の上で強く握り込まれ、そのまま白くなった。声も出せないまま、脚の間だけが波打つように痙攣を繰り返す。長い長い数秒が過ぎて、ようやく肺に空気が戻ってきた。|甘い痺れが、腰の奥で一点に集まった。次の瞬間、それが弾けて全身へ散っていく。{a}は壁に頬を押しつけたまま、震える息の合間に何度も小さく声を漏らした。|{a}の体が、ふっと宙に浮いたような気がした。浮いたまま、脚の間から頭の先まで熱がまっすぐ駆け抜ける。気がつくと{a}は、壁にすがりついたまま、溶けたように膝を折っていた。|奥の一番深いところが、何度も何度も脈を打った。そのたびに{a}の背中が跳ね、喉からかすれた声が押し出される。波が引いていくのが惜しいほど、長い絶頂だった。'),
m:L('次の瞬間、溜まっていたものがすべて弾けた。{a}の背中が弓なりに反り、張りつめたものが大きく跳ねる。何度も何度も脈を打って、そのたびに熱いものが勢いよく溢れ出した。|大きな波が、{a}を頭の先まで呑み込んだ。根元がぎゅうっと縮み、堰を切ったように精が迸る。{a}はしばらく、自分がどこにいるのかも分からなかった。|果てた瞬間、{a}の目の前が真っ白になった。脈打つものは一度では止まらず、二度、三度と腰を揺らす。ようやく息ができるようになったとき、{a}の頬は涙で濡れていた。|限界を越えたのは、ほんの小さなひと撫でだった。それだけで{a}の根元がきゅうっと縮み上がり、張りつめたものが穴の向こうで何度も跳ねる。吐き出した熱が、誰かの手を濡らしていくのが分かった。|{a}の指が壁の上で強く握り込まれ、そのまま白くなった。声も出せないまま、腰の奥から熱いものが何度もせり上がって迸る。長い長い数秒が過ぎて、ようやく肺に空気が戻ってきた。|甘い痺れが、根元で一点に集まった。次の瞬間、それが弾けて全身へ散っていく。{a}は壁に頬を押しつけたまま、脈打つたびに漏れる声を止められなかった。|{a}の体が、ふっと宙に浮いたような気がした。浮いたまま、根元から頭の先まで熱がまっすぐ駆け抜ける。気がつくと{a}は、出し切ったあとの痺れの中で、壁にすがりついて膝を折っていた。|後ろの奥と前の先が、同時に弾けた。どちらで果てているのかも分からないまま、{a}の腰ががくがくと揺れる。波が引いていくのが惜しいほど、長い絶頂だった。'),
top:L('次の瞬間、溜まっていたものがすべて弾けた。{a}の背中が弓なりに反り、包まれたまま張りつめたものが大きく跳ねる。何度も何度も脈を打って、そのたびに熱いものを吐き出した。|大きな波が、{a}を頭の先まで呑み込んだ。根元がぎゅうっと縮み、締めつける熱の中に、堰を切ったように精が迸る。{a}はしばらく、自分がどこにいるのかも分からなかった。|果てた瞬間、{a}の目の前が真っ白になった。脈打つものは一度では止まらず、二度、三度と腰を揺らす。ようやく息ができるようになったとき、{a}の頬は涙で濡れていた。|限界を越えたのは、ほんの小さなひと揺れだった。それだけで{a}の根元がきゅうっと縮み上がり、熱い中に包まれたまま何度も跳ねる。締めつけに逆らえず、{a}は奥へ奥へと吐き出した。|{a}の指が壁の上で強く握り込まれ、そのまま白くなった。声も出せないまま、包まれたものが中で何度も脈を打つ。向こう側の誰かが、満足げに腰を押しつけてくるのが分かった。|甘い痺れが、根元で一点に集まった。次の瞬間、それが弾けて、締めつける熱の中へ一気に溢れ出す。{a}は壁に頬を押しつけたまま、搾られるたびに漏れる声を止められなかった。|{a}の体が、ふっと宙に浮いたような気がした。浮いたまま、包まれた根元から頭の先まで熱がまっすぐ駆け抜ける。気がつくと{a}は、まだ締めつけられたまま、壁にすがりついて膝を折っていた。|跨った誰かが深く腰を沈めたまま、ぎゅうっと締め上げた。それが最後の一押しになって、{a}は声を詰まらせて果てた。波が引いていくのが惜しいほど、長い絶頂だった。')
};
var PEAK_ERO={
f:L('{s:wet}。{a}「{m2}」――{a}は爪先をぴんと伸ばし、全身をがくがくと震わせてイった。ぷしゃっ、と恥ずかしい音がして、溢れた蜜が床にまで飛び散った。イっている最中にも奥がひくひくと疼いて、波はなかなか引いてくれなかった。|{a}「{m2}」――お腹の奥がぎゅうっと縮み、{a}は腰を浮かせたまま長く果てた。{s:wet}。中が何度もきゅうきゅうと痙攣して、そのたびに甘い声が勝手に漏れた。|{s:wet}。{a}「{m2}」――頭の中が真っ白に弾けて、{a}は舌を突き出したまま震えた。とろとろに溶けた脚の間から、蜜がとめどなく溢れていく。もう、イっていない時間のほうが短かった。|{a}「{m2}」――壁の向こうで指がくいっと曲げられた瞬間、{a}は腰を跳ね上げてイった。{s:wet}。ひくひくと締まる奥から蜜があふれ、太腿をつたって床にぽたぽたと落ちていく。|{s:wet}。{a}「{m2}」――芽をちゅうっと吸い上げられて、{a}の頭の中で何かがぱちんと弾けた。腰ががくがくと揺れ、イきながらまた次の波に押し上げられていく。'),
m:L('{s:wet}。{a}「{m2}」――{a}は腰をがくがくと突き出し、張りつめたものから勢いよく精を噴き上げた。{s:cum}。一度では止まらず、脈を打つたびにびゅくびゅくと何度も溢れ出した。|{a}「{m2}」――根元がぎゅうっと縮み、{a}は壁にしがみついたまま果てた。{s:cum}。出し切ったはずなのに、ものはまだびくびくと跳ね続けていた。|{s:wet}。{a}「{m2}」――頭の中が真っ白に弾けて、{a}は舌を突き出したまま震えた。{s:cum}。床にまで飛び散った白いものを見下ろしても、熱は少しも引かなかった。|{a}「{m2}」――先端をくちゅくちゅと手のひらで撫で回されて、{a}は壁を掻きむしるように果てた。{s:cum}。止まらない脈動に合わせて、白いものが何度も壁の向こうへ噴き上がる。|{s:wet}。{a}「{m2}」――後ろの弱いところをぐりっと押し上げられた瞬間、触れられてもいない前からびゅっと精が溢れた。{s:cum}。{a}は穴の中で腰を震わせたまま、しばらく戻ってこられなかった。'),
top:L('{s:hit}。{a}「{m2}」――包まれたまま、{a}は腰を突き上げて果てた。{s:cum}。締めつける熱の中で、脈を打つたびにびゅくびゅくと何度も吐き出した。|{a}「{m2}」――根元をきゅうっと締め上げられて、{a}はこらえきれずに中へ注いだ。{s:cum}。出し切ったあとも、熱い中に搾られ続けて、ものはびくびくと跳ね続けた。|{s:hit}。{a}「{m2}」――頭の中が真っ白に弾けて、{a}は舌を突き出したまま震えた。{s:cum}。向こう側から、誰かの満足げな吐息が聞こえた。|{a}「{m2}」――跨った誰かがぱちゅんと深く腰を落とした瞬間、{a}は奥へ向かって吐き出した。{s:cum}。きゅうきゅうと締まる中に、最後の一滴まで搾り取られていく。|{s:hit}。{a}「{m2}」――ぐりぐりと腰を回されながら締めつけられて、{a}はこらえる間もなく果てた。{s:cum}。熱い中で脈打つたびに、向こう側の誰かが甘い声を上げた。')
};
var AGAIN={
f:L('けれど、それで終わりではなかった。息が整うより先に、次の波がまた脚の間から湧き上がってくる。{a}は「もう、無理」と首を振りながら、二度目の、もっと深い絶頂へ押し上げられていった。|果てたばかりの体は、前よりもずっと敏感になっていた。ほんの少しの刺激で、奥がまたひくひくと疼き出す。{a}が本当に解放されたのは、さらに二度、三度と果てたあとだった。|波が引ききる前に、壁の向こうの動きがまた速くなった。痺れたままの脚の間を休みなく責められて、{a}の腰ががくがくと震える。声にならない声を上げて、{a}はもう一度、さっきよりも高いところへさらわれた。|{a}は壁に額を押し当て、「もう、むり、何も」と首を振った。空っぽのはずの体の奥から、また熱がせり上がってくる。二度目は、一度目よりもずっと静かで、ずっと深かった。|{a}が肩で息をしているあいだも、壁の向こうの指は止まらなかった。敏感になりきった芽を、触れるか触れないかの強さで転がされる。{a}の腰がまた跳ね、小さな波が三つ、四つと続けて弾けた。|一度果てたことで、体のどこかの栓が抜けてしまったようだった。{a}はほんの少し撫でられるたびに、浅く、甘く、何度も達した。数えるのをやめたころ、やっと手が止まった。|{a}は「待って」と言いかけた。言い終わる前に、奥の一番弱いところを押し上げられた。{a}は爪先まで震わせて、もう一度、さっきよりも長く果てた。'),
m:L('けれど、それで終わりではなかった。息が整うより先に、次の波がまた腰の奥から湧き上がってくる。{a}は「もう、無理」と首を振りながら、萎えることも許されないまま、二度目の、もっと深い絶頂へ押し上げられていった。|果てたばかりのものは、前よりもずっと敏感になっていた。ほんの少しの刺激で、また硬く張りつめていく。{a}が本当に解放されたのは、さらに二度、三度と果てたあとだった。|波が引ききる前に、壁の向こうの動きがまた速くなった。達したばかりで痺れているものを休みなく扱かれて、{a}の腰ががくがくと震える。声にならない声を上げて、{a}はもう一度、さっきよりも高いところで弾けた。|{a}は壁に額を押し当て、「もう、出ない」と首を振った。出ないはずのものの奥から、また熱がせり上がってくる。二度目は、薄く、長く、腰が抜けるほど続いた。|{a}が肩で息をしているあいだも、壁の向こうの指は止まらなかった。過敏になりきった先を、手のひらでくるくると撫で回される。{a}の腰が逃げ場もなく跳ね、苦しいほどの快感が二度、三度と弾けた。|一度果てたことで、体のどこかの栓が抜けてしまったようだった。{a}は後ろを少し押されるたびに、前に触れられないまま、何度も小さく達した。数えるのをやめたころ、やっと手が止まった。|{a}は「待て」と言いかけた。言い終わる前に、くびれを指の輪で締め上げられた。{a}は爪先まで震わせて、もう一度、さっきよりも長く吐き出した。'),
top:L('けれど、それで終わりではなかった。息が整うより先に、次の波がまた根元から湧き上がってくる。{a}は「もう、出ない」と首を振りながら、萎えることも許されないまま、二度目の、もっと深い絶頂へ押し上げられていった。|果てたばかりのものは、前よりもずっと敏感になっていた。熱い中でほんの少し揺すられただけで、また硬く張りつめていく。{a}が本当に解放されたのは、さらに二度、三度と搾り取られたあとだった。|波が引ききる前に、跨った誰かがまた腰を使い始めた。達したばかりで痺れているものを熱く包まれたまま揺すられて、{a}の腰ががくがくと震える。声にならない声を上げて、{a}はもう一度、さっきよりも深く吐き出した。|{a}は壁に額を押し当て、「もう、出ない」と首を振った。跨った誰かは返事の代わりに、根元まで呑み込んだまま腰を回した。二度目は、薄く、長く、腰が抜けるほど続いた。|{a}が肩で息をしているあいだも、壁の向こうの腰は止まらなかった。過敏になりきったものを、熱い中でゆっくりと扱き上げられる。{a}は逃げ場もなく、二度、三度と搾り取られた。|跨っていた誰かが離れると、すぐに次の誰かが腰を落としてきた。休む間もなく別の熱に包まれて、{a}はまた中へ注いだ。数えるのをやめたころ、やっと誰も来なくなった。|{a}は「待て」と言いかけた。言い終わる前に、奥でぎゅうっと締め上げられた。{a}は爪先まで震わせて、もう一度、さっきよりも長く吐き出した。')
};
var AGAIN_ERO={
f:L('{s:wet}。けれど、それで終わりではなかった。{a}「{m2}」――イったばかりの奥がまたひくひくと疼き出して、{a}は泣きそうな顔で首を振った。二度目の絶頂は、一度目よりずっと深く、ずっと長かった。|果てたばかりの体は、前よりもずっと敏感になっていた。{s:wet}。{a}「{m1}」――ほんの少しの刺激で、また甘い波が押し寄せてくる。{a}が本当に解放されたのは、さらに三度イかされたあとだった。|{s:wet}。休む間もなく、壁の向こうの責めがまた始まった。{a}「{m2}」――痺れの残る奥をかき回されて、{a}の目から涙がこぼれた。三度目の絶頂は、声すら出ないほど深かった。|{s:wet}。{a}「{m1}」――イったばかりの芽をくりくりと転がされて、{a}は涙目で腰を引こうとした。引けない腰のまま、二度目の波がすぐそこまで来ている。{a}「{m2}」――とろとろの奥がきゅうっと締まり、{a}はまたイった。|{a}「{m2}」――休む間もなく、今度は二本の指でぐちゅぐちゅと奥を掻き回された。{s:wet}。{a}は壁にしがみついたまま、三度、四度と立て続けにイかされた。'),
m:L('{s:wet}。けれど、それで終わりではなかった。{a}「{m2}」――出したばかりのものがまた硬く張りつめて、{a}は泣きそうな顔で首を振った。二度目は、一度目よりずっと濃く、ずっと長かった。{s:cum}。|果てたばかりのものは、前よりもずっと敏感になっていた。{s:wet}。{a}「{m1}」――ほんの少しの刺激で、また先から溢れ出す。{a}が本当に解放されたのは、さらに三度搾り出されたあとだった。|{s:wet}。休む間もなく、壁の向こうの手がまた動き出した。{a}「{m2}」――出したばかりのものを容赦なく扱かれて、{a}の目から涙がこぼれた。{s:cum}。三度目の吐精は、声すら出ないほど長かった。|{s:wet}。{a}「{m1}」――出したばかりの先をにちゅにちゅと扱かれて、{a}は涙目で腰を引こうとした。引けない腰のまま、二度目がすぐそこまで来ている。{a}「{m2}」――{s:cum}。|{a}「{m2}」――休む間もなく、今度は後ろの弱いところと前を同時に責められた。{s:wet}。{a}は壁にしがみついたまま、薄くなった精を何度も搾り出された。'),
top:L('{s:hit}。けれど、それで終わりではなかった。{a}「{m2}」――出したばかりのものを熱い中でまた揺すられて、{a}は泣きそうな顔で首を振った。二度目は、一度目よりずっと濃く、ずっと長かった。{s:cum}。|果てたばかりのものは、前よりもずっと敏感になっていた。{s:hit}。{a}「{m1}」――ほんの少し締めつけられるだけで、また中へ溢れ出す。{a}が本当に解放されたのは、さらに三度搾り取られたあとだった。|{s:hit}。休む間もなく、跨った誰かがまた腰を沈めてきた。{a}「{m2}」――出したばかりのものを熱く締め上げられて、{a}の目から涙がこぼれた。{s:cum}。三度目は、声すら出ないほど深く搾り取られた。|{s:hit}。{a}「{m1}」――出したばかりのものを、熱い中でぬちゅぬちゅと揺すられて、{a}は涙目で腰を引こうとした。{a}「{m2}」――{s:cum}。逃げられないまま、二度目もそのまま中へ注いだ。|{a}「{m2}」――跨る誰かが入れ替わり、また別の熱い中にぬぷりと呑み込まれた。{s:hit}。{a}は壁にしがみついたまま、三度、四度と立て続けに搾り取られた。')
};
var DOER={
pen:{
f:L('{b}は{a}の腰を両手で掴み、溢れるほど濡れた入り口に自分のものを押し当てた。感覚の戻った{a}の体は、その熱さをひとつ残らず拾ってしまう。{b}がゆっくりと腰を進めるたびに、押し広げられていく感触が背骨まで響いた。\n\n根元まで埋められたところで、{b}は一度動きを止めた。{a}の中が、勝手にきゅうきゅうと{b}を締めつける。{b}は小さく笑うと、浅いところから奥まで、長い抜き差しを始めた。|壁の向こうで、{b}が{a}の太腿を抱え上げた。何が起きるのか分かった瞬間、{a}の奥がきゅっと疼く。次の瞬間、熱く硬いものが、一息に奥まで突き入れられた。\n\n{b}は遠慮なく腰を打ちつけた。肌のぶつかる音が壁越しに響き、そのたびに{a}の奥の一番弱いところが抉られる。逃げようにも、腰は壁の穴にぴったりとはまったままだった。|{b}は{a}の入り口を先端でくすぐるように擦ってから、焦らすように少しずつ沈めていった。一番太いところが入り口を越えた瞬間、{a}の喉から甲高い声が漏れる。{b}はその声を合図に、残りを一気に押し込んだ。\n\nそこからの{b}は容赦がなかった。奥を小刻みに突き上げ、{a}の中が震えると、さらに深く腰を沈める。{a}は壁の向こうの顔も見えない相手に、何度も何度も奥を明け渡した。'),
m:L('{b}は{a}の腰を両手で掴み、指でほぐしておいた後ろに自分のものを押し当てた。感覚の戻った{a}の体は、その熱さをひとつ残らず拾ってしまう。{b}がゆっくりと腰を進めるたびに、押し広げられていく感触が背骨まで響いた。\n\n根元まで埋められたところで、{b}は手を前に回し、{a}の張りつめたものを握った。後ろを揺すられながら前を扱かれて、{a}の膝ががくがくと震える。{b}は小さく笑うと、二つの動きを同じ速さに揃えていった。|壁の向こうで、{b}が{a}の腰を引き寄せた。何が起きるのか分かった瞬間、{a}の後ろがきゅっと縮む。次の瞬間、熱く硬いものが、ゆっくりと奥まで押し込まれた。\n\n{b}は奥の一点を探り当てると、そこばかりを狙って腰を使った。突かれるたびに、{a}の張りつめたものの先からとろりと先走りが溢れる。触れられてもいない前が、後ろの動きに合わせて跳ね続けた。|{b}は先端で{a}の後ろを何度も擦ってから、焦らすように少しずつ沈めていった。一番太いところが入り口を越えた瞬間、{a}の喉から甲高い声が漏れる。{b}はその声を合図に、残りを一気に押し込んだ。\n\nそこからの{b}は容赦がなかった。奥の弱いところを小刻みに突き上げ、{a}の腰が逃げようとすると、さらに深く腰を沈める。{a}は壁の向こうの顔も見えない相手に、何度も何度も奥を明け渡した。')
},
finger:{
ff:L('{b}は濡れそぼった{a}の入り口を、指先でそっと撫でた。それだけで{a}の腰がびくりと跳ねる。{b}は面白がるように、一本、二本と、ゆっくり指を沈めていった。\n\n中で指を曲げると、{a}の一番弱いところに指の腹が当たった。{b}はそこを見つけたことを確かめるように、とん、とん、と優しく押し上げる。もう片方の手の親指が、膨らんだ芽をくるくると転がし始めた。|{b}は{a}の脚の間に顔を寄せ、舌先で入り口をなぞった。指と舌に同時に責められて、{a}の膝ががくがくと笑う。{b}は逃げる腰を押さえつけ、指を奥まで差し入れた。\n\n中を掻き回す指と、芽を吸い上げる唇。そのどちらからも逃げられず、{a}の中はきゅうきゅうと{b}の指を締めつけた。{b}は締めつけが強くなるほど、指の動きを速くしていった。|{b}は二本の指を揃えて、{a}の中の奥の壁をゆっくりと撫で上げた。何度も同じところを往復するうちに、{a}の中から蜜がとめどなく溢れてくる。{b}は濡れた音を立てながら、指の動きをどんどん大胆にしていった。\n\n指を三本に増やされたとき、{a}の喉から甲高い声が漏れた。{b}はそれを聞くと、手首ごと揺するように奥を責め立てた。壁の向こうで、{a}の体は{b}の指に合わせて跳ね続けた。'),
mf:L('{b}は濡れそぼった{a}の入り口を、太い指先でそっと撫でた。それだけで{a}の腰がびくりと跳ねる。{b}は面白がるように、一本、二本と、ゆっくり指を沈めていった。\n\n中で指を曲げると、{a}の一番弱いところに指の腹が当たった。{b}はそこを何度も押し上げながら、もう片方の手で膨らんだ芽を転がす。節くれだった指が中で動くたびに、{a}の奥がきゅうっと切なく締まった。|{b}は{a}の脚の間に顔を寄せ、舌先で入り口をなぞった。指と舌に同時に責められて、{a}の膝ががくがくと笑う。{b}は逃げる腰を大きな手で押さえつけ、指を奥まで差し入れた。\n\n中を掻き回す指と、芽を吸い上げる唇。そのどちらからも逃げられず、{a}の中はきゅうきゅうと{b}の指を締めつけた。{b}は締めつけが強くなるほど、指の動きを速くしていった。|{b}は二本の指を揃えて、{a}の中の奥の壁を強く擦り上げた。何度も同じところを往復するうちに、{a}の中から蜜がとめどなく溢れてくる。{b}は濡れた音を立てながら、指の動きをどんどん激しくしていった。\n\n指を三本に増やされたとき、{a}の喉から甲高い声が漏れた。{b}はそれを聞くと、手首ごと揺するように奥を責め立てた。壁の向こうで、{a}の体は{b}の指に合わせて跳ね続けた。'),
m:L('{b}は{a}の張りつめたものを片手で包み、もう片方の指を後ろへ這わせた。感覚の戻った{a}の体は、その両方をひとつ残らず拾ってしまう。指先がゆっくりと沈んでいくと、{a}の腰がびくりと跳ねた。\n\n中で指を曲げると、{a}の奥の弱いところに指の腹が当たった。{b}はそこを押し上げながら、前を握った手をゆっくりと上下させる。後ろを押されるたびに、張りつめたものの先から先走りがとろりと溢れた。|{b}は{a}の張りつめたものの根元を指で締めつけたまま、先端だけを手のひらで撫で回した。出したいのに出させてもらえず、{a}の腰が勝手に揺れる。{b}は面白がるように、締めつけを緩めたり強めたりした。\n\nやがて{b}は、根元の指を離すと同時に、後ろへ二本の指を差し入れた。奥の弱いところを押し上げられながら前を扱かれて、{a}の膝ががくがくと笑う。壁の向こうで、{a}の体は{b}の手に合わせて跳ね続けた。|{b}はたっぷりと濡らした指で、{a}の張りつめたものを根元から先まで扱き上げた。ぬちゅぬちゅと濡れた音が、壁越しにはっきりと聞こえる。{b}は{a}の反応を確かめるように、速さを少しずつ変えていった。\n\n先端のくびれを指の輪で何度も擦られて、{a}の腰が跳ねた。{b}はそこが弱いと分かると、そこばかりをしつこく責めた。{a}は壁にしがみついたまま、逃げられない腰を震わせ続けた。')
},
tease:{
ff:L('{b}は{a}の内腿に唇を寄せ、ゆっくりと上へ這わせていった。脚の付け根に辿り着いたところで、わざと一番敏感なところを避けて息を吹きかける。焦らされた{a}の腰が、物欲しげに揺れた。\n\nやがて{b}の舌が、膨らんだ芽をそっと掬い上げた。{a}の体が大きく跳ねる。{b}はそのまま唇で芽を包み込み、ちゅう、と優しく吸い上げた。|{b}は{a}の{尻}の丸みを両手で撫で回し、時々わざと脚の間をかすめた。触れそうで触れない指先に、{a}の腰が勝手についていこうとする。{b}は小さく笑うと、ようやく濡れた入り口を指の腹でなぞった。\n\nなぞるだけで、中には入れない。{b}は入り口と芽のあいだを、何度も何度も往復した。焦らされ続けた{a}の脚の間から、蜜がとろとろと溢れ落ちていった。|{b}は{a}の脚の間に顔を埋め、舌全体を使って下から上へと舐め上げた。何度も、何度も、同じ速さで。{a}の腰は逃げることも許されず、そのたびにびくびくと跳ねた。\n\n舌先が芽を弾くたびに、{a}の中がひくひくと震えた。{b}はその震えを確かめるように、舌の動きを少しずつ速めていく。壁の向こうで、{a}は甘い声を止められなかった。'),
f:L('{b}は{a}の内腿に唇を寄せ、ゆっくりと上へ這わせていった。脚の付け根に辿り着いたところで、わざと一番敏感なところを避けて息を吹きかける。焦らされた{a}の腰が、物欲しげに揺れた。\n\nやがて{b}の舌が、膨らんだ芽をそっと掬い上げた。{a}の体が大きく跳ねる。{b}はそのまま唇で芽を包み込み、ちゅう、と音を立てて吸い上げた。|{b}は{a}の{尻}の丸みを大きな手で撫で回し、時々わざと脚の間をかすめた。触れそうで触れない指先に、{a}の腰が勝手についていこうとする。{b}は低く笑うと、ようやく濡れた入り口を指の腹でなぞった。\n\nなぞるだけで、中には入れない。{b}は入り口と芽のあいだを、何度も何度も往復した。焦らされ続けた{a}の脚の間から、蜜がとろとろと溢れ落ちていった。|{b}は{a}の脚の間に顔を埋め、舌全体を使って下から上へと舐め上げた。何度も、何度も、同じ速さで。{a}の腰は逃げることも許されず、そのたびにびくびくと跳ねた。\n\n舌先が芽を弾くたびに、{a}の中がひくひくと震えた。{b}はその震えを確かめるように、舌の動きを少しずつ速めていく。壁の向こうで、{a}は甘い声を止められなかった。'),
m:L('{b}は{a}の内腿に唇を寄せ、ゆっくりと上へ這わせていった。脚の付け根に辿り着いたところで、わざと張りつめたものを避けて息を吹きかける。焦らされた{a}のものが、物欲しげにびくびくと跳ねた。\n\nやがて{b}の舌が、裏筋を根元から先までゆっくりと舐め上げた。{a}の腰が大きく跳ねる。{b}はそのまま先端を唇で包み込み、ちゅう、と音を立てて吸い上げた。|{b}は{a}の張りつめたものに、指先だけでそっと触れた。根元から先へ、羽でなぞるように撫で上げる。強く握ってほしいのに握ってもらえず、{a}の腰が勝手に揺れた。\n\n{b}は先から溢れた先走りを指で掬い、先端に塗り広げた。ぬるぬるになった先を手のひらでくるくると撫で回されて、{a}の膝ががくがくと笑う。壁の向こうで、{a}は甘い声を止められなかった。|{b}は{a}のものを口に含み、ゆっくりと喉の奥まで呑み込んでいった。熱く濡れた口の中に包まれて、{a}の腰が勝手に浮く。{b}は頬をすぼめ、根元から先まで吸い上げるように頭を動かした。\n\n舌が裏側に絡みつくたびに、{a}のものがびくびくと跳ねた。{b}はその跳ね方を確かめるように、吸う強さを少しずつ変えていく。壁の向こうで、{a}は甘い声を止められなかった。')
},
ride:{
fm:L('{b}は{a}の張りつめたものを片手で支え、その上にゆっくりと跨った。熱く濡れた場所に先端が触れた瞬間、{a}の腰がびくりと跳ねる。{b}は焦らすように、少しずつ腰を落としていった。\n\n根元まで呑み込んだところで、{b}は満足そうに息をついた。熱い中がきゅうきゅうと{a}のものを締めつける。{b}はそのまま、自分の気持ちいいところに当たるように腰をくねらせ始めた。|{b}は{a}の上に跨ると、何も言わずに一息に腰を沈めた。いきなり根元まで包まれて、{a}の喉から声が漏れる。{b}は{a}の反応を楽しむように、上下に大きく腰を使い始めた。\n\n{b}が腰を落とすたびに、濡れた音が壁越しに響いた。{a}のものは熱い中で何度も扱き上げられ、そのたびに根元がきゅうっと疼く。{b}は{a}が果てそうになると動きを止め、震えが収まるとまた腰を使った。|{b}は{a}のものを自分の入り口に擦りつけ、たっぷりと濡らしてから跨った。腰を落とすと、ぬぷり、と熱い中に呑み込まれていく。{b}は奥まで迎え入れると、円を描くように腰を回した。\n\n締めつけられたまま揺すられて、{a}の腰が勝手に突き上がった。{b}はそれを咎めるように腰を押しつけ、自分の速さで{a}を搾り上げる。壁の向こうの{a}には、もう主導権などどこにもなかった。'),
mm:L('{b}は{a}の張りつめたものを片手で支え、その上にゆっくりと跨った。ほぐしておいた後ろに先端が触れた瞬間、{a}の腰がびくりと跳ねる。{b}は焦らすように、少しずつ腰を落としていった。\n\n根元まで呑み込んだところで、{b}は満足そうに息をついた。熱くきつい中が{a}のものを締めつける。{b}はそのまま、自分の気持ちいいところに当たるように腰を揺らし始めた。|{b}は{a}の上に跨ると、何も言わずに一息に腰を沈めた。いきなり根元まで包まれて、{a}の喉から声が漏れる。{b}は{a}の反応を楽しむように、上下に大きく腰を使い始めた。\n\n{b}が腰を落とすたびに、肌のぶつかる音が壁越しに響いた。{a}のものはきつい中で何度も扱き上げられ、そのたびに根元がきゅうっと疼く。{b}は{a}が果てそうになると動きを止め、震えが収まるとまた腰を使った。|{b}は{a}のものをたっぷりと濡らしてから跨り、ゆっくりと腰を落とした。きつい入り口を越えて、熱い中に呑み込まれていく。{b}は奥まで迎え入れると、円を描くように腰を回した。\n\n締めつけられたまま揺すられて、{a}の腰が勝手に突き上がった。{b}はそれを咎めるように腰を押しつけ、自分の速さで{a}を搾り上げる。壁の向こうの{a}には、もう主導権などどこにもなかった。')
}
};
var FALL={
f:L('{a}はしばらく、床に崩れ落ちたまま動けなかった。脚の間はまだひくひくと疼き、溢れたものが内腿を伝って乾く暇もない。何度果てたのか、もう数えることもできなかった。\n\nやがて{a}は、震える手で壁の穴の縁を撫でた。ついさっきまで自分の腰がはまっていた場所。そこに戻れば、またあの熱が来る。そう思っただけで、お腹の奥がきゅうっと切なく締まった。\n\n{a}は誰に命じられたわけでもなく、自分から壁に背を向けた。腰を穴の高さに合わせ、ゆっくりと押し込んでいく。ぴったりと締まる縁の感触に、{a}は小さく、満たされたような息を吐いた。|解放されたはずの体は、まだ壁の向こうを覚えていた。何もされていないのに、脚の間が勝手にひくつき、誰かの指を探すように腰が揺れる。{a}はその揺れを、もう止めようとは思わなかった。\n\n「……もう一回」と、{a}は誰にともなく呟いた。呟いた自分の声の甘さに、{a}自身が驚いた。驚いたのに、恥ずかしいとは思わなかった。\n\n{a}は壁の前に膝をつき、穴の縁に頬を寄せた。向こう側からは、まだ誰かの気配がしている。{a}はとろけた目のまま、自分から穴の中へ腰を差し出した。|{a}は解放されたあとも、壁の前から離れられなかった。体の芯に残った熱が、一刻ごとに大きくなっていく。足りない、と体のほうが先に言っていた。\n\n{a}は自分の指を脚の間に伸ばしてみた。けれど、自分の指では、あの感覚には少しも届かない。届かないことが分かるほど、壁の向こうが恋しくなった。\n\n{a}は壁の穴に向き直り、震える声で「入れてください」と言った。向こう側の誰かが、くすりと笑った気がした。{a}は自分から腰を穴に押し込み、目を閉じて、次の熱を待った。'),
m:L('{a}はしばらく、床に崩れ落ちたまま動けなかった。張りつめたものはまだびくびくと跳ね、何度出したのか分からない白いものが床に散っていた。何度果てたのか、もう数えることもできなかった。\n\nやがて{a}は、震える手で壁の穴の縁を撫でた。ついさっきまで自分の腰がはまっていた場所。そこに戻れば、またあの熱が来る。そう思っただけで、根元がきゅうっと疼き、ものがまた硬くなった。\n\n{a}は誰に命じられたわけでもなく、自分から壁に背を向けた。腰を穴の高さに合わせ、ゆっくりと押し込んでいく。ぴったりと締まる縁の感触に、{a}は小さく、満たされたような息を吐いた。|解放されたはずの体は、まだ壁の向こうを覚えていた。何もされていないのに、張りつめたものが勝手に脈を打ち、誰かの手を探すように腰が揺れる。{a}はその揺れを、もう止めようとは思わなかった。\n\n「……もう一回」と、{a}は誰にともなく呟いた。呟いた自分の声の甘さに、{a}自身が驚いた。驚いたのに、恥ずかしいとは思わなかった。\n\n{a}は壁の前に膝をつき、穴の縁に頬を寄せた。向こう側からは、まだ誰かの気配がしている。{a}はとろけた目のまま、自分から穴の中へ腰を差し出した。|{a}は解放されたあとも、壁の前から離れられなかった。体の芯に残った熱が、一刻ごとに大きくなっていく。足りない、と体のほうが先に言っていた。\n\n{a}は自分の手で、張りつめたものを握ってみた。けれど、自分の手では、あの感覚には少しも届かない。届かないことが分かるほど、壁の向こうが恋しくなった。\n\n{a}は壁の穴に向き直り、震える声で「入れてくれ」と言った。向こう側の誰かが、くすりと笑った気がした。{a}は自分から腰を穴に押し込み、目を閉じて、次の熱を待った。'),
top:L('{a}はしばらく、床に崩れ落ちたまま動けなかった。張りつめたものはまだびくびくと跳ね、何人の中に吐き出したのかも分からなかった。何度果てたのか、もう数えることもできなかった。\n\nやがて{a}は、震える手で壁の穴の縁を撫でた。ついさっきまで自分の腰がはまっていた場所。そこに戻れば、また誰かが跨ってくる。そう思っただけで、根元がきゅうっと疼き、ものがまた硬くなった。\n\n{a}は誰に命じられたわけでもなく、自分から壁に背を向けた。腰を穴の高さに合わせ、ゆっくりと押し込んでいく。ぴったりと締まる縁の感触に、{a}は小さく、満たされたような息を吐いた。|解放されたはずの体は、まだ壁の向こうを覚えていた。何もされていないのに、熱く濡れた中に包まれる感触が根元から離れない。{a}はその疼きを、もう止めようとは思わなかった。\n\n「……もう一回」と、{a}は誰にともなく呟いた。呟いた自分の声の甘さに、{a}自身が驚いた。驚いたのに、恥ずかしいとは思わなかった。\n\n{a}は壁の前に膝をつき、穴の縁に頬を寄せた。向こう側からは、まだ誰かの気配がしている。{a}はとろけた目のまま、自分から穴の中へ腰を差し出した。')
};
var FALL_ERO={
f:L('{s:wet}。腰を戻した途端に、向こう側から指が伸びてきた。{a}「{m2}」――{a}は壁にしがみついたまま、待ちわびていたものを迎えて、あっけなくイった。とろけきった顔のまま、{a}は自分から腰を揺らし続けた。|{a}「{m1}」――穴に戻った{a}の脚の間を、誰かの舌がゆっくりと舐め上げた。{s:wet}。{a}は「もっと」とねだりながら、何度も何度もイかされた。もう、壁の外に戻りたいとは思わなかった。'),
m:L('{s:wet}。腰を戻した途端に、向こう側から手が伸びてきた。{a}「{m2}」――{a}は壁にしがみついたまま、待ちわびていたものを迎えて、あっけなく果てた。{s:cum}。とろけきった顔のまま、{a}は自分から腰を揺らし続けた。|{a}「{m1}」――穴に戻った{a}のものを、誰かの口がゆっくりと呑み込んだ。{s:wet}。{a}は「もっと」とねだりながら、何度も何度も搾り出された。もう、壁の外に戻りたいとは思わなかった。'),
top:L('{s:hit}。腰を戻した途端に、向こう側の誰かが跨ってきた。{a}「{m2}」――熱い中に根元まで包まれて、{a}は待ちわびていたようにあっけなく果てた。{s:cum}。とろけきった顔のまま、{a}は自分から腰を突き上げ続けた。|{a}「{m1}」――穴に戻った{a}のものを、誰かの熱い中がゆっくりと呑み込んだ。{s:hit}。{a}は「もっと」とねだりながら、何度も何度も搾り取られた。もう、壁の外に戻りたいとは思わなかった。')
};
var PERS_FALL={
proud:L('あれほど強気だった{a}の目から、反抗の色がすっかり消えていた。悔しがることさえ、もう思い出せない。{a}は自分の負けを、甘い息と一緒に呑み込んだ。|{a}は「今日だけだ」と言い訳をした。言い訳をしている自分が、一番信じていなかった。誇りを手放した体は、驚くほど軽かった。'),
stern:L('規律で固めてきた{a}の心は、もうどこにも残っていなかった。背筋を伸ばすことも、声を律することも忘れて、{a}はただ熱を求めた。それが正しいかどうかなど、もう考えなかった。|{a}は最後に一度だけ、「いけない」と呟いた。呟いた唇は、すぐにとろけて緩んだ。戒めの言葉は、それきり二度と出てこなかった。'),
tsun:L('{a}はもう、「感じてない」とは言わなかった。言えなかった、のではなく、言う必要がなくなっていた。素直になった体は、拍子抜けするほど気持ちよかった。|{a}は小さな声で「……好き、これ」と言った。言ってから真っ赤になって、それでも取り消さなかった。意地を張る力は、全部壁の向こうに溶けてしまった。'),
gentle:L('{a}は困ったように微笑んで、熱をそのまま受け入れた。抗う理由が、もうどこにも見つからなかった。柔らかくほどけた体は、壁の向こうのすべてを優しく迎え入れていた。|{a}は「仕方ないわね」と、自分に向かって言った。その声は、ひどく甘くとろけていた。優しさの全部が、快楽に向いてしまったようだった。'),
devoted:L('{a}は「ありがとうございます」と、誰にともなく呟いた。何に感謝しているのかも分からないまま、満たされた顔で目を閉じる。尽くすことしか知らなかった体が、初めて満たされる側に回っていた。|{a}は「もっと、使ってください」と小さくねだった。言ってしまってから、その言葉の意味に気づいた。気づいても、取り消したいとは思わなかった。'),
cool:L('いつも動じなかった{a}の顔は、すっかりとろけていた。落ち着いた声も、静かな目も、もうどこにもない。{a}はただ、次の熱を待つだけの体になっていた。|{a}は「……悪くない」と小さく言った。その声が、自分でも驚くほど甘かった。冷静でいようとする気持ちは、跡形もなく消えていた。'),
free:L('{a}は「さいこう」と笑った。その笑顔には、迷いも後悔も一つもなかった。{a}は楽しいことを見つけた子どものように、自分から穴に戻っていった。|{a}は「また来よっと」と軽く言った。軽い口ぶりとは裏腹に、目はとろんと蕩けきっていた。もう、ここ以外のどこにも行きたくなかった。'),
shy:L('{a}は耳まで真っ赤にしながら、それでも自分から腰を差し出した。恥ずかしいのに、やめられない。恥ずかしいからこそ、体の奥がいっそう熱くなった。|{a}は消え入りそうな声で「……もう一回、だけ」と言った。言ったあとで両手で顔を覆い、それでも穴の前から離れなかった。一回だけでは済まないことを、{a}自身が一番よく分かっていた。'),
polite:L('{a}は「はしたないお願いですが」と前置きをして、もう一度だけ、と頼んだ。丁寧な言葉で頼むほど、その中身のいやらしさが際立った。{a}はもう、それを恥じてもいなかった。|{a}は乱れた髪を直すこともせず、穴の前で深々と頭を下げた。「どうか、続けてくださいませ」。上品な声が、蕩けて震えていた。')
};
var BROKEN={
f:L('{a}はしばらく、壁にもたれたまま立ち上がれなかった。何度果てたのか数えようとしても、途中で分からなくなる。脚の間は熱を持ったまま、ときどき思い出したようにひくひくと疼いた。\n\nやっと立ち上がっても、膝が言うことを聞かなかった。一歩踏み出すたびに、内腿が擦れて小さな声が漏れる。{a}は壁に手をつきながら、何度も立ち止まって息を整えた。|{a}は床に座り込み、自分の膝を抱えた。体の芯に残った熱が、なかなか引いてくれない。目を閉じると、さっきまでの波がまた甦ってきて、脚の間がきゅっと締まった。\n\n「……何だったの、今の」と{a}は呟いた。答える人は、どこにもいなかった。{a}は火照った頬を膝に押し当てて、熱が引くのをじっと待った。'),
m:L('{a}はしばらく、壁にもたれたまま立ち上がれなかった。何度果てたのか数えようとしても、途中で分からなくなる。出し尽くしたはずのものは、熱を持ったまま、ときどき思い出したように脈を打った。\n\nやっと立ち上がっても、膝が言うことを聞かなかった。一歩踏み出すたびに、敏感になりきったものが布に擦れて小さな声が漏れる。{a}は壁に手をつきながら、何度も立ち止まって息を整えた。|{a}は床に座り込み、自分の膝を抱えた。体の芯に残った熱が、なかなか引いてくれない。目を閉じると、さっきまでの波がまた甦ってきて、根元がきゅっと疼いた。\n\n「……何だったんだ、今の」と{a}は呟いた。答える人は、どこにもいなかった。{a}は火照った頬を膝に押し当てて、熱が引くのをじっと待った。')
};
BROKEN.top=BROKEN.m;
function R(S){
if(!S.lwH){
var src=(S.log||[]).map(function(e){return e.text||'';}).join('').slice(0,400),n=0;
for(var i=0;i<src.length;i++)n=(n*31+src.charCodeAt(i))>>>0;
S.lwH={rng:HK.rng((n+(S.log||[]).length*7919+((S.env&&S.env.hours)||1)*131+2027)>>>0),_eroSeen:S._eroSeen=S._eroSeen||{}};
}
return S.lwH;
}
function pick(S,a){
var t=R(S),u=t.used=t.used||{},ss=t.ss=t.ss||{},best=[],bs=Infinity;
a.forEach(function(x){
var sc=(x.match(/[^。！？]+[。！？]?/g)||[]).filter(function(y){return y.length>=12&&ss[y];}).length;
if(sc<bs){bs=sc;best=[x];}else if(sc===bs)best.push(x);
});
var f=best.filter(function(x){return!u[x];}),x;
if(f.length)x=f[t.rng.int(f.length)];
else x=best.reduce(function(m,y){return u[y]<u[m]?y:m;},best[0]);
t.n=(t.n||0)+1;u[x]=t.n;
(x.match(/[^。！？]+[。！？]?/g)||[]).forEach(function(y){ss[y]=1;});
return x;
}
function ero(S){return!!(HK.Ero&&HK.Ero.on&&HK.Ero.on(S));}
function on(S){
var X=HK.Lewd;
if(HK.SAFE_ON|| !X|| !X.conf('hole')|| !S|| !S.env||X.lv(S.env)==='low')return false;
var v=S.env.lewdLen;
return v==='thick'||(v==='mix'&&R(S).rng()<0.5);
}
function hi(S){return!!(HK.Lewd&&HK.Lewd.high(S.env));}
function bodyOf(h,topMe){return topMe?'top':HK.Pos&&HK.Pos.isF(h)?'f':'m';}
function persona(h){var p=h&&h.persona;return PERS_PEAK[p]?p:'gentle';}
function voice(S,h,st){
if(ero(S))return HK.Ero.moan(R(S),h,st);
var T4=HK.Thick4,p=persona(h),l=T4&&(st>=2?T4.SUB2:T4.SUB1)[p];
var old=function(){return l&&l.length?pick(S,l):'……っ';};
if(HK.Moan&&HK.Moan.say){
var K=HK.SoloKit,sg=K&&K.stage?K.stage(h):2;
return HK.Moan.say(R(S),h,st>=2?'climax':st?'mid':'start',{novel:true,force:sg<=1&& !!(K&&K.will&&K.will(h)>=0.45),fall:sg>=3},old);
}
return old();
}
function fill(S,t,h,b){
t=t.replace(/\{a\}/g,h.name).replace(/\{b\}/g,(b&&b.name)||'誰か').replace(/\{M(\d)\}/g,function(m,n){return voice(S,h,+n);});
if(HK.Ero)t=HK.Ero.fill(R(S),t,h);
return t;
}
function voicePara(S,h,st){return h.name+'「'+voice(S,h,st)+'」'+pick(S,LINK);}
var HT=HK.HoleThick={
on:on,
peak:function(S,kind,h,o){
o=o||{};
if(!h|| !on(S))return'';
var bd=bodyOf(h,o.topMe),e=ero(S),p=persona(h),out=[];
out.push(pick(S,OPEN[kind][bd]));
out.push(pick(S,BUILD[bd]));
out.push(voicePara(S,h,1));
out.push(pick(S,PERS_PEAK[p]));
out.push(pick(S,e?PEAK_ERO[bd]:PEAK[bd]));
if(hi(S))out.push(pick(S,e?AGAIN_ERO[bd]:AGAIN[bd]));
return out.map(function(t){return fill(S,t,h,o.b);}).join('\n\n');
},
doer:function(S,kind,h,b,o){
o=o||{};
if(!h|| !b|| !on(S)|| !DOER[kind])return'';
var P=HK.Pos,hf= !!(P&&P.isF(h)),bf= !!(P&&P.isF(b)),v;
if(kind==='pen')v=hf?'f':'m';
else if(kind==='finger')v=hf?(bf?'ff':'mf'):'m';
else if(kind==='tease')v=hf?(bf?'ff':'f'):'m';
else v=bf?'fm':'mm';
if((kind==='ride'&&hf)||(o.topMe&&(kind==='pen'||(kind==='finger'&& !hf))))return'';
var l=DOER[kind][v];if(!l)return'';
var bd=kind==='ride'?'top':hf?'f':'m',e=ero(S),out=[pick(S,l),voicePara(S,h,1),pick(S,PERS_PEAK[persona(h)]),pick(S,e?PEAK_ERO[bd]:PEAK[bd])];
if(hi(S))out.push(pick(S,e?AGAIN_ERO[bd]:AGAIN[bd]));
return out.map(function(t){return fill(S,t,h,b);}).join('\n\n');
},
after:function(S,state,h,o){
o=o||{};
if(!h|| !on(S)||(state!=='fall'&&state!=='broken'))return'';
var bd=bodyOf(h,o.topMe),out=[];
if(state==='broken'){
out.push(pick(S,BROKEN[bd]));
out.push(voicePara(S,h,1));
}else{
out.push(pick(S,FALL[bd]||FALL.m));
out.push(pick(S,PERS_FALL[persona(h)]));
if(ero(S))out.push(pick(S,FALL_ERO[bd]));
else out.push(voicePara(S,h,2));
}
return out.map(function(t){return fill(S,t,h,o.b);}).join('\n\n');
}
};
})();
});
;
/* ==== js/hole-end.js ==== */
HK.Load.def(464,'js/hole-end.js',function(){
(function(){
'use strict';
var HK=window.HK;
if(!HK)return;
function L(s){return s.split('|');}
var PERS=['proud','stern','tsun','gentle','devoted','cool','free','shy','polite'];
var LEAD_R={
mf:L('{b}は自分の上着を{a}の腰に掛け、ほとんど抱きかかえるようにして部屋の外へ連れ出した。廊下の灯りの下で、{b}は一度だけ、{a}の顔色を確かめるように覗き込んだ。|{b}は{a}の手を引いて立たせ、ふらつく体を自分の肩に寄りかからせた。歩幅を{a}に合わせて、{b}は出口までゆっくりと歩いた。'),
ff:L('{b}は{a}の乱れた裾を手早く整え、自分の羽織を肩に掛けてやった。二人は寄り添ったまま、足音を忍ばせて部屋を出た。|{b}は{a}の髪についた埃を払い、冷えきった指先を両手で包んで温めた。{b}「歩ける？」――{a}は小さく頷いた。'),
fm:L('{b}は自分より大きな{a}の体を肩で支え、よろける足取りに合わせて一歩ずつ進んだ。上着を{a}の腰に巻いてやると、{b}は何も言わずに前を向いた。|{b}は{a}の腕を自分の肩に回させ、重いと文句を言いながらも、最後まで手を離さなかった。部屋を出るまで、{b}は一度も後ろを振り返らなかった。'),
mm:L('{b}は{a}の腕を肩に担ぎ、半ば引きずるようにして部屋を出た。ずり落ちかけた{a}の服を、{b}は黙って引き上げてやった。|{b}は{a}の背を軽く叩いた。{b}「立てそう？」――{a}が頷くと、{b}は自分の上着を脱いで、{a}の腰に巻きつけた。'),
ng:L('{b}は{a}に手を貸そうとして、やめた。少し離れたところで背を向けたまま、{a}が自分で服を整え終えるのを待っていた。|{b}は扉の外で見張りに立ち、{a}が自分の足で出てくるまで、部屋の中を一度も覗かなかった。')
};
var REL_R={
love:L('その晩、{b}は{a}を一人にしなかった。眠りにつくまで、{b}の手はずっと{a}の手を握っていた。|{b}はあとになって、壁の前で{a}の脚を見つけたとき、心臓が止まるかと思ったと打ち明けた。{a}は返事の代わりに、{b}の肩に頭を預けた。|{b}は次の日から、{a}の出かける先を必ず聞くようになった。{a}は呆れたふりをしながら、聞かれるたびに少しだけ嬉しかった。'),
crush:L('{b}は、たまたま通りかかっただけだと言い張った。{a}を見送ったあと、{b}は一人で壁の前に戻り、穴の縁を長いこと睨んでいた。|{b}は帰り道、{a}の隣を歩きながら何度も口を開きかけて、結局何も言わなかった。{b}「……無事で、よかった」――別れ際にそれだけ言うと、{b}は足早に去っていった。'),
kin:L('{b}は家に着くまで、壁のことには一言も触れなかった。ただ、その日の夕食には、{a}の好物ばかりが並んでいた。|{b}は、このことは誰にも言わないとだけ言った。それきり、二人のあいだでその日の話が出ることはなかった。'),
close:L('{b}は翌日、何事もなかった顔で{a}に声をかけてきた。ただ、その日から{b}は、{a}が一人で出かけるときに行き先を聞くようになった。|{b}は貸しひとつだと笑って、それ以上は何も聞かなかった。{a}には、その気遣いがありがたかった。'),
acq:L('{b}は翌日、どこかぎこちなく{a}に挨拶した。そのぎこちなさが消えるまでには、少し時間がかかった。|{b}は、困ったことがあったら言ってと短く言って、それ以上は踏み込まなかった。顔見知りくらいの距離が、{a}にはちょうどよかった。'),
far:L('{b}は名前も聞かずに立ち去ろうとした。{a}が慌てて礼を言うと、{b}は振り返らずに片手だけ上げてみせた。|それから何度か、{a}は街で{b}とすれ違った。そのたびに{b}は気まずそうに会釈をして、{a}も同じだけ気まずく会釈を返した。'),
foe:L('{b}「勘違いしないで。見ていられなかっただけ」――{b}はそう言い捨てて、さっさと背を向けた。それでも{a}は、あの手が思っていたよりずっと優しかったことを覚えていた。|{b}はそれからしばらく、{a}と顔を合わせるたびに目を逸らした。二人の言い争いの数は、ほんの少しだけ減った。'),
ng:L('それきり、{b}がその日のことを口にすることはなかった。{a}も、聞かれないことに救われていた。|{b}は、誰にも言わないとだけ約束して、先に帰っていった。約束は、きちんと守られた。')
};
var DOER={
live:L('{a}は、助け出してくれた手が、ついさっきまで壁の向こうで自分に触れていた手と同じだと気づいていた。礼の言葉は、喉の奥でつかえたままだった。|{a}は、壁越しに感じていた手つきの癖を、{b}の手に見つけてしまった。二人とも、そのことには最後まで触れなかった。'),
numb:L('{b}は、壁の向こうで自分が何をしたのか、最後まで{a}に言えなかった。{a}がそれを知る日は、たぶん来ない。|{b}は{a}の顔を見るたびに、壁の向こうの感触を思い出して目を伏せた。{a}は、その理由を知らないままだった。')
};
var PERS_R={
proud:L('{a}は礼を言うより先に、誰がやったのかと低い声で聞いた。助けられた借りは、いつか必ず返すつもりだった。|{a}は助け出された悔しさに、唇を噛んだ。{a}「……今日のことは忘れて。私も忘れる」'),
stern:L('{a}は姿勢を正し、深く頭を下げた。{a}「恩に着る。この借りは、必ず返す」|{a}は帰ってすぐ、あの壁の場所と仕掛けを紙に書き留めた。二度と、誰も同じ目に遭わないように。'),
tsun:L('{a}「べ、別に助けてなんて頼んでないし。……でも、ありがと」|{a}は真っ赤な顔でそっぽを向いて、礼の一つも言わなかった。翌日、{b}の机の上には、黙って菓子折りが置かれていた。'),
gentle:L('{a}は{b}の手を両手で包んで、ありがとう、本当に助かったと微笑んだ。それから、助けた{b}のほうがよほど青い顔をしているのに気づいて、温かいお茶を淹れてやった。|{a}は助けられた側なのに、怖い思いをさせてしまったと、なぜか{b}のほうを気遣った。'),
devoted:L('{a}は何度も何度も{b}に頭を下げた。{a}「ありがとう、ありがとう……」――声が震えて、最後は涙になった。|{a}はその日から、{b}に何か恩返しができないかと、そればかり考えるようになった。'),
cool:L('{a}は短く礼を言い、壁の構造について{b}に二、三質問した。助けられた側とは思えない落ち着きぶりだった。|{a}「助かった。……次は、自分で抜け出せるようにしておく」'),
free:L('{a}は{b}の両手を握ってぶんぶん振り、命の恩人だと大げさに叫んだ。数日後には、その日のことを笑い話にして周りに話して回っていた。|{a}「いやあ、助かった！今度なにかおごる」――{a}はけろりとした顔で笑った。'),
shy:L('{a}は{b}の顔をまともに見られず、俯いたまま礼を言った。蚊の鳴くような声だった。|{a}は耳まで赤くして、帰り道のあいだずっと、{b}の半歩後ろを歩いた。'),
polite:L('{a}は乱れた身なりを整えてから、{b}に深々と頭を下げた。{a}「このご恩は、決して忘れません」|後日、{a}は丁寧な礼状を{b}に届けた。その日のことには、一言も触れていなかった。')
};
var VAL_R=[
L('溜まっていた感覚は、ほとんどなかった。{a}にとってあの壁は、すぐに悪い夢の一つになった。|{a}が壁の中にいた時間は、思っていたより短かった。数日もすると、あの日のことは笑って話せるくらいには遠くなった。'),
L('{a}はしばらくのあいだ、壁の前を通るたびに足を速めた。何もなかったはずの腰が、通り過ぎるときだけ少しこわばった。|夜、一人になると、{a}は壁の向こうの気配を思い出して寝返りを打った。それも、数日で収まった。'),
L('助け出されてからも、{a}の腰にはしばらく壁の向こうの熱が残っていた。夜になって一人になると、{a}はその熱を思い出して、膝を抱えた。|{a}は何日経っても、壁越しに感じたものを忘れられなかった。忘れられないことが、少しだけ怖かった。')
];
var LEAD_C={
mf:L('{a}の震えが収まるまで、{b}は黙って{a}を抱きとめていた。やがて{a}が我に返って身を離すと、{b}の服には、{a}がしがみついた皺がくっきりと残っていた。|達したあとの{a}は、{b}の腕の中でしばらく浅い息を繰り返していた。{b}は上着で{a}の腰を隠し、誰にも見られないように部屋の隅へ連れていった。'),
ff:L('{b}は崩れ落ちた{a}を胸に抱き寄せ、震えが引くまで背中を撫で続けた。{a}の熱い頬は、{b}の首筋に押しつけられたままだった。|{a}の脚から力が抜けると、{b}は一緒に床へ座り込み、{a}を膝の上に抱えた。髪を梳く{b}の指が、{a}の余韻をゆっくりとほどいていった。'),
fm:L('{b}は自分より大きな{a}の体を必死に支えたまま、震えが止まるのを待った。{a}が我に返ったとき、{b}の頬も同じくらい赤くなっていた。|{a}が膝から崩れると、{b}は一緒に床に座り込み、{a}の頭を自分の肩に預けさせた。{b}は{a}の荒い息が整うまで、何も言わずに背中をさすっていた。'),
mm:L('{b}は崩れかけた{a}の体を正面から受け止め、震えが収まるまで腕を緩めなかった。{a}が顔を上げると、{b}は気まずそうに視線を外した。|{a}が肩にしがみついたまま果てるあいだ、{b}はただ、大丈夫だと繰り返していた。{a}の膝が笑わなくなるまで、{b}はずっとそこに立っていた。'),
ng:L('{a}が顔を上げたとき、部屋にはもう誰もいなかった。扉の外で、{b}が背を向けて立っているのが見えた。|{a}は壁際にうずくまったまま、余韻が引いていくのを一人で待った。{b}は扉の外で、ただ時間が過ぎるのを待っていてくれた。')
};
var REL_C={
love:L('{b}は{a}の額に口づけて、全部私のせいにしていいからと囁いた。{a}は恥ずかしさで消えてしまいたくなりながら、その言葉に縋った。|その夜、{b}は{a}を抱きしめたまま眠った。{b}「あんな顔、ほかの誰にも見せないで」――眠りに落ちる前の{b}の声は、少しだけ拗ねていた。'),
crush:L('{b}は、助け出したあの瞬間の{a}の顔を、どうしても忘れられなかった。それからは{a}に会うたびに、{b}のほうが先に赤くなった。|{b}「見てない。何も見てない」――{b}はそう言い張ったが、その声はひどく上ずっていた。'),
kin:L('{b}は{a}の頭に上着をかぶせ、何も見ていないと一言だけ言った。家族のあいだで、その日のことが話題になることは二度となかった。|{b}は目を固く閉じたまま、{a}の手だけを握っていた。帰り道、二人はどちらからともなく、天気の話ばかりした。'),
close:L('{b}は、仕方ない、ああいう仕掛けなんだからと、何でもないことのように言った。その気遣いが、{a}にはかえって恥ずかしかった。|翌日、{b}はいつもどおりの顔で{a}に挨拶した。ただ、目が合うと、{b}はほんの一瞬だけ視線を泳がせた。'),
acq:L('{b}は翌日から、{a}と顔を合わせるたびに、話題を探すように視線をさまよわせた。{a}も、同じだけ話題を探していた。|{b}は、見たことは忘れると言って頭を掻いた。忘れられていないことは、二人ともよく分かっていた。'),
far:L('{b}は真っ赤な顔でお大事にと言い残し、逃げるように去っていった。{a}は、相手の名前も聞きそびれた。|{b}はどこを見ればいいのか分からない様子で、ずっと天井を見上げていた。別れ際の会釈は、二人ともぎこちなかった。'),
foe:L('{b}は呆れたように息を吐き、貸しにしておくとだけ言った。それから先、{b}がその日のことで{a}をからかうことは、なぜか一度もなかった。|{b}はいつもの皮肉を言いかけて、やめた。{a}の震える肩を見て、{b}は黙って上着を投げてよこした。'),
ng:L('{b}はその日のことを、誰にも話さなかった。{a}もまた、あの時間を一人で胸の奥にしまい込んだ。|後日、{b}と顔を合わせても、どちらもその日のことには触れなかった。それが二人の、暗黙の約束になった。')
};
var PERS_C={
proud:L('{a}は我に返るなり、真っ赤な顔で{b}を睨みつけた。{a}「……今のは、なかったことにして。いい？」|あんな姿を見られたことが、{a}には壁に埋まっていた何時間よりも屈辱だった。{a}は帰り道、一度も口を開かなかった。'),
stern:L('{a}は乱れた息を整え、見苦しいところを見せたと頭を下げた。耳の先だけが、いつまでも赤いままだった。|{a}は自分を律しきれなかったことを、何日も悔やんだ。それでも、あのとき支えられた温かさだけは、どうしても悔やめなかった。'),
tsun:L('{a}「い、今のは違うから！壁のせいだから！忘れて、今すぐ忘れて！」|{a}は顔を覆って、最悪、最悪と繰り返した。何が最悪なのか、自分でもよく分からなかった。'),
gentle:L('{a}は赤い顔のまま、困ったように笑ってみせた。{a}「……とんだところを、見せてしまった」――笑みの端が、まだ少し震えていた。|{a}は余韻の残る体を自分で抱きしめて、ゆっくりと息を吐いた。それから、驚かせてしまったことを、穏やかな声で詫びた。'),
devoted:L('{a}は泣きそうな顔で、ごめんなさい、ごめんなさいと謝り続けた。謝ることなど何もないのだと分かるまで、ずいぶん時間がかかった。|{a}は、助けてもらったうえに迷惑までかけたと、何日も落ち込んでいた。'),
cool:L('{a}はしばらく黙り込み、それから、生理的な反応だから、とだけ言った。その声が珍しく上ずっていたことを、{b}は聞き逃さなかった。|{a}は余韻が引くのを待ってから、何事もなかったように服を整えた。ただ、その日の記録だけは、どこにも残さなかった。'),
free:L('{a}は余韻の残る顔で、へらりと笑った。{a}「あー……見られちゃった。まあ、いっか」|{a}はすごかったと言って、恥ずかしさを笑いで押し流した。それでも、その夜は布団の中で何度も足をばたつかせた。'),
shy:L('{a}は両手で顔を覆ったまま、しばらく顔を上げられなかった。指の隙間から覗く耳は、火がついたように赤かった。|{a}はそれから何日も、あの瞬間を思い出しては枕に顔を埋めた。思い出すたびに、腰の奥が小さく疼いた。'),
polite:L('{a}は震える声で、大変お見苦しいところをと詫びた。最後まで言い終える前に、また膝から力が抜けた。|{a}は後日あらためて礼に訪れ、深々と頭を下げた。顔を上げたとき、その頬はまだ赤かった。')
};
var VAL_C=[
L('余韻は、家に着くころにはほとんど引いていた。ただ、ふとした拍子に腰の奥がひくりと震えて、{a}は一人で赤くなった。|思っていたより、波は早く引いていった。それでも{a}は、あの瞬間の自分の声を、しばらく忘れられなかった。'),
L('一度に戻ってきた何時間分もの熱は、その場だけでは引かなかった。{a}はその晩、思い出すたびに体の奥が疼いて、なかなか眠れなかった。|あの瞬間に{a}の体を突き抜けたのは、一度きりの波ではなかった気がした。それからしばらく、{a}は誰かに肩を抱かれるたびに、あの壁の前の自分を思い出した。')
];
var ERO_C={
f:L('家に帰ってからも、{a}はあの瞬間を思い出すたびに、脚の間がじゅんと濡れた。指で軽く触れただけで、また小さくイってしまった。|{a}は布団の中で、何時間分もの熱が一度に弾けたあの感覚を、指でなぞるように思い出した。とろとろに濡れたそこは、なかなか静まってくれなかった。'),
m:L('家に帰ってからも、{a}はあの瞬間を思い出すたびに硬くなった。一人で握っただけで、あっけなく果ててしまった。|{a}は布団の中で、何時間分もの熱が一度に弾けたあの感覚を思い出した。張りつめたものは、なかなか静まってくれなかった。')
};
var DAY=[
L('数日もすると、{a}の体はすっかり元の感覚を取り戻した。朝起きて、顔を洗って、いつもどおりの一日が始まった。|{a}はそれから、何事もなかったように日常へ戻っていった。壁の中の数時間は、少しずつ遠い夢のようになっていった。'),
L('{a}の体が元に戻るまで、二、三日かかった。そのあいだ、椅子に座るたびに、{a}は少しだけ腰の位置を気にした。|日常は、思っていたより簡単に戻ってきた。ただ、壁に背を預けることだけは、しばらくできなかった。'),
L('{a}はしばらく、まともに眠れなかった。目を閉じると、戻ってきた波の続きが、体の奥でまだ揺れている気がした。|元の暮らしに戻っても、{a}の体はなかなか元に戻らなかった。服が擦れるだけで息が詰まる日が、何日も続いた。')
];
var DAY_LATE=L('{a}はそれから、帰り道の角を曲がるたびに少しだけ身構えるようになった。あの日のように、遅れて何かが届く気がして。|{a}はしばらく、家まで寄り道をしなくなった。あの帰り道の途中で崩れ落ちた場所を、もう一度通る気にはなれなかった。');
var FLASH={
f:L('人混みで誰かの手が腰に触れた瞬間、{a}の脚の間がきゅっと縮んだ。{a}は慌てて人波から離れ、壁ではない柱にもたれて息を整えた。|湯船に浸かっているとき、ふと、あの何時間分かが一度に雪崩れ込んできた瞬間を思い出した。お湯の中で、{a}は膝をぎゅっと閉じた。'),
m:L('満員の電車で誰かの体が腰に当たった瞬間、{a}の下腹がずくりと疼いた。{a}は次の駅で降りて、しばらくホームのベンチから立てなかった。|湯船に浸かっているとき、ふと、あの何時間分かが一度に雪崩れ込んできた瞬間を思い出した。湯の中で頭をもたげた自分の体に、{a}は思わず顔を覆った。'),
top:L('誰かが何気なく膝に手を置いたとき、{a}は一瞬、あの壁の向こうで何度も跨られた感触を思い出した。顔に出さないようにするのが、精一杯だった。|夜、寝返りを打った拍子に、{a}はあの日、熱いところに何度も呑み込まれた記憶に襲われた。{a}は天井を睨んで、それが過ぎるのを待った。'),
topf:L('誰かが何気なく膝に手を置いたとき、{a}は一瞬、あの壁の向こうで自分の下に組み敷いた体の感触を思い出した。顔に出さないようにするのが、精一杯だった。|夜、寝返りを打った拍子に、{a}はあの日、腰を落とすたびに相手が上げた声の記憶に襲われた。{a}は天井を睨んで、それが過ぎるのを待った。|湯船に浸かっているとき、ふと、あの日自分が上になって搾り取った何時間分かを思い出した。お湯の中で、{a}は膝をぎゅっと閉じた。'),
soft:L('人混みで誰かの手が腰に触れた瞬間、{a}は小さく息を呑んだ。あの壁の向こうの気配が、一瞬だけ背中に戻ってきた気がした。|湯船に浸かっているとき、ふと、あの日の感覚が戻ってきた瞬間を思い出した。{a}はお湯に顔の半分まで沈んで、しばらく出てこなかった。')
};
var PERS_N={
proud:L('{a}は、あんなもの、もう覚えていないと言い張った。それでも、壁に穴の空いた建物を見かけると、{a}は必ず遠回りをした。|{a}は、あの壁を仕掛けた者を必ず探し出すと周りに宣言した。見つけたらどうするのかと聞かれると、{a}は黙って拳を握った。'),
stern:L('{a}は以前にも増して、規則正しい生活を送るようになった。乱れた何時間かを、几帳面な毎日で上から塗りつぶすように。|{a}は一度だけ、あの日のことを日記に書きかけて、ページごと破り捨てた。'),
tsun:L('{a}「あれくらい、全然平気だったし。……ほんとだし」――誰も何も聞いていないのに、{a}はときどきそう言った。|{a}は壁の話題が出るたびに、わざとらしく話を変えた。顔が赤くなっていることには、本人だけが気づいていなかった。'),
gentle:L('{a}はあの日のことを、ちょっと変わった体験と呼んで穏やかに笑った。ただ、壁際の席にだけは、もう座ろうとしなかった。|{a}は以前よりも少しだけ、自分の体を労わるようになった。長いお風呂と早めの就寝が、新しい習慣になった。'),
devoted:L('{a}は待っていてくれた人の顔を見た瞬間、張りつめていたものが切れて、子どものように泣いた。それからは、少しずつ笑えるようになった。|{a}は毎朝、もう大丈夫と自分に言い聞かせた。七日目の朝、{a}は言い聞かせるのを忘れていたことに気づいた。'),
cool:L('{a}はあの壁の仕組みについて、独自に調べ始めた。分析しているあいだだけは、体の奥の記憶を、ただの記録として扱えた。|{a}は表向き、何も変わらなかった。ただ、手帳の隅に、あの日戻ってきた波の回数が小さく書きつけてあった。'),
free:L('{a}はあの日のことを、酒の席で面白おかしく話してみせた。笑いを取りながら、{a}だけは、話すたびに体の芯がじんわりと熱くなるのを感じていた。|{a}「いやあ、人生で一番、わけ分かんない日だった」――そう言って笑う{a}の目は、少しだけ遠くを見ていた。'),
shy:L('{a}はしばらく、人と目を合わせるのが怖かった。誰もあの日のことを知らないはずなのに、全部見透かされている気がした。|{a}は夜、布団の中であの日のことを思い出しかけては、慌てて頭から布団をかぶった。'),
polite:L('{a}は翌日から、何事もなかったように丁寧な挨拶を欠かさなかった。ただ、お疲れさまですと言う声が、ほんの少し掠れる日があった。|{a}はあの日のことを、誰にも話さなかった。話さないことが、{a}にとっていちばん丁寧な片づけ方だった。')
};
var CLOSE_N=[
L('あの壁の中の時間は、{a}にとって、ただの奇妙な出来事として終わった。――少なくとも、本人はそう思っていた。|{a}があの壁の夢を見ることは、一度もなかった。'),
L('忘れたと思ったころに、ふと思い出す。あの壁は、{a}の中にそういう小さな棘を一本だけ残していった。|思い出す回数は、日を追うごとに減っていった。それでも、ゼロにはならなかった。'),
L('{a}は今もときどき、あの壁の前まで行って、引き返す。自分が何をしに来たのかを、考えないようにしながら。|あの日{a}の体に戻ってきた{c}回の波は、まだ完全には引いていなかった。')
];
var ERO_N={
f:L('夜、一人きりの部屋で、{a}は気づくと自分の脚の間に指を伸ばしていた。壁の向こうの何時間分かを思い出しながら、声を殺して何度もイった。|{a}は下着を替えるたびに、そこがいつのまにかとろとろに濡れていることに気づいて、顔を覆った。'),
m:L('夜、一人きりの部屋で、{a}は気づくと自分のものを握っていた。壁の向こうで何をされていたのかを想像しながら扱くと、あっけなく果ててしまった。|{a}は朝目覚めるたびに、下着の中で硬く張りつめている自分に気づいて、あの壁を恨んだ。'),
top:L('夜、一人きりの部屋で、{a}は気づくと自分のものを握っていた。何度も跨られて搾り取られた感触を思い出しながら扱くと、あっけなく果てた。|{a}は朝目覚めるたびに硬く張りつめている自分に気づき、あの熱く締めつけてきた感触を思い出して呻いた。'),
topf:L('夜、一人きりの部屋で、{a}は気づくと自分の脚の間に指を伸ばしていた。壁の向こうの相手に跨って、好きなだけ搾り取ったときの感触を思い出しながら、声を殺して果てた。|{a}は朝目覚めるたびに、腰の奥に残る熱に気づいた。自分の下で震えていた相手の感触を思い出して、{a}は枕に顔を埋めた。|{a}はシャワーを浴びながら、あの日自分が上になって追い詰めた相手の声を思い出した。お湯より熱いものが、脚の間から腿を伝った。')
};
var LEAD_F={
1:{
f:L('{a}は元の暮らしに戻った。けれど夜になると、体の奥があの壁を思い出してきゅうっと疼き、{a}は気づけば地図であの場所を探していた。|日常は戻ってきたはずだった。それでも{a}は、壁際に立つたびに、そこへ腰を押しつけたくなる自分を必死に抑えていた。'),
m:L('{a}は元の暮らしに戻った。けれど夜になると、腰の奥があの壁を思い出して熱を持ち、{a}は気づけば地図であの場所を探していた。|日常は戻ってきたはずだった。それでも{a}は、壁に穴の空いた場所を見かけるたびに、足を止めてしまう自分に気づいていた。'),
top:L('{a}は元の暮らしに戻った。けれど夜になると、何人もの熱い中に呑み込まれた感触が甦り、{a}は気づけば地図であの場所を探していた。|日常は戻ってきたはずだった。それでも{a}は、壁の前を通るたびに、あの向こうで誰かが跨ってくれるのを想像してしまった。'),
topf:L('{a}は元の暮らしに戻った。けれど夜になると、壁の向こうの誰かの口と指に好きなだけ奉仕させた感触が甦り、{a}は気づけば地図であの場所を探していた。|{a}は仕事の合間に、ふと、壁の向こうで自分の下にいた相手の震えを思い出す。そのたびに脚の間が熱くなって、{a}は机の下で膝を寄せた。|{a}は忘れようとした。けれど、あの壁の前で自分がどれだけ声を出させたかを思い出すと、体のほうが先に疼いた。'),
soft:L('{a}は元の暮らしに戻った。けれど夜になると、体があの壁を思い出してしまい、{a}は気づけば地図であの場所を探していた。|日常は戻ってきたはずだった。それでも{a}は、壁際に立つたびに、あの日のことばかり考えてしまう自分を抑えられなかった。')
},
2:{
f:L('{a}は三日と空けずに、あの壁へ通うようになった。自分から穴に腰を差し入れ、遮断が始まる前の一瞬だけ、壁の向こうの誰かに早くとねだった。|{a}は、壁の向こうに来る足音を聞き分けられるようになった。足音が近づくだけで、脚の間がとろけていくのが分かった。'),
m:L('{a}は三日と空けずに、あの壁へ通うようになった。自分から穴に腰を差し入れ、遮断が始まる前の一瞬だけ、壁の向こうの誰かに早くとねだった。|{a}は、壁の向こうに来る足音を聞き分けられるようになった。足音が近づくだけで、腰の奥が期待で熱く疼いた。'),
top:L('{a}は三日と空けずに、あの壁へ通うようになった。穴から腰を突き出して、誰かが跨ってくれるのを待つ時間が、一日でいちばん待ち遠しい時間になった。|{a}は、壁の向こうに来る足音を聞き分けられるようになった。今日は誰が跨ってくれるのか、足音だけで当てられるようになった。'),
topf:L('{a}は三日と空けずに、あの壁へ通うようになった。穴の向こうへ腰を預け、誰かが口と指で奉仕してくるのを待つ時間が、一日でいちばん待ち遠しかった。|{a}は壁の向こうの相手を、声で追い立てることを覚えた。「もっと」と言えば、言ったとおりに動く。その手応えが、{a}を何度も壁へ引き戻した。|{a}は自分が通っていることを誰にも言わなかった。けれど壁の前に立つと、もう昼間の顔ではいられなかった。'),
soft:L('{a}は三日と空けずに、あの壁へ通うようになった。自分から穴に腰を差し入れる手つきは、日に日に慣れていった。|{a}は、壁の向こうに来る足音を聞き分けられるようになった。足音が近づくだけで、胸が高鳴るのが分かった。')
},
3:{
f:L('{a}はもう、壁から出ようとしなかった。遮断も時間も要らないと言って、{a}は穴にはまったまま、壁の向こうの誰かを一日じゅう受け入れ続けた。|あの壁には、いつしか常設の札が掛けられた。札の下で、{a}の腰は今日も、来る人来る人に甘くひくついていた。'),
m:L('{a}はもう、壁から出ようとしなかった。遮断も時間も要らないと言って、{a}は穴にはまったまま、壁の向こうの誰かに一日じゅう体を差し出し続けた。|あの壁には、いつしか常設の札が掛けられた。札の下で、{a}の腰は今日も、来る人来る人に震えて応えていた。'),
top:L('{a}はもう、壁から出ようとしなかった。穴にはまったまま、跨ってくる誰かを一日じゅう迎え、果てても果てても腰を突き出し続けた。|あの壁には、いつしか常設の札が掛けられた。札の下で、{a}のものは今日も、跨ってくる誰かを待って張りつめていた。'),
topf:L('{a}はもう、壁から出ようとしなかった。穴にはまったまま、向こうから伸びてくる口と指を一日じゅう迎え、果てても果てても腰を押しつけ続けた。|{a}の声は、壁の向こうの誰を動かすかを知っていた。{a}は命じ、奉仕させ、果て、また命じた。昼と夜の区別は、とうになくなっていた。|{a}は自分の名前より先に、壁の向こうで自分に奉仕した相手の数を思い出せるようになっていた。'),
soft:L('{a}はもう、壁から出ようとしなかった。遮断も時間も要らないと言って、{a}は穴にはまったまま、壁の向こうの気配に身を委ね続けた。|あの壁には、いつしか常設の札が掛けられた。札の下から、今日も{a}の甘い声がかすかに漏れていた。')
}
};
var PERS_F1={
proud:L('{a}は壁の前を通りかかるたびに、舌打ちして足を速めた。速めたはずの足が、なぜか毎回同じ角で止まった。|{a}「もう二度と、行かない」――そう吐き捨てた夜に限って、{a}は眠れずに天井を睨んでいた。'),
stern:L('{a}は、あの壁のことを考えるたびに冷たい水を浴びて頭を冷やした。水を浴びる回数は、日ごとに増えていった。|{a}は手帳に、近づかないとだけ書いた。その一行を、{a}は何度も指でなぞった。'),
tsun:L('{a}「べ、別にまた行きたいとか思ってないし」――誰にも聞かれていないのに、{a}は一日に何度もそう言った。|{a}はあの場所の前を通らない道を、わざわざ遠回りして選んだ。遠回りの途中で、何度も後ろを振り返った。'),
gentle:L('{a}は困ったように微笑んで、あれは一度きりの思い出にしておこうと自分に言った。その声は、自分でも驚くほど頼りなかった。|{a}はあの日のことを思い出すたびに、温かいお茶を淹れて気を紛らわせた。お茶の減りが、少しだけ早くなった。'),
devoted:L('{a}「だめ。あれは、もう二度としない」――{a}は自分に言い聞かせるように、何度も首を振った。|{a}は、待っていてくれる人の顔を思い浮かべて、あの壁の熱を振り払おうとした。振り払うたびに、熱は少しずつ強くなった。'),
cool:L('{a}は、あの日の感覚を一時的な条件づけにすぎないと結論づけた。結論づけたはずの記録を、{a}は毎晩読み返していた。|{a}「……再現性を確かめるだけ。一度だけ」――{a}は誰にともなく言い訳をして、その言い訳の続きを考えないようにした。'),
free:L('{a}「いやあ、あれはやばかった。もう一回……いや、さすがにね」――{a}は笑ってごまかした。ごまかしきれていないことは、自分がいちばん分かっていた。|{a}は友人との話の途中で、ふと黙り込むことが増えた。何を考えていたのかと聞かれても、{a}は笑って答えなかった。'),
shy:L('{a}はあの日のことを思い出すたびに、顔を覆ってうずくまった。うずくまったまま、もう一度だけと思ってしまう自分が怖かった。|{a}は夜更けに一度だけ、あの場所の近くまで行った。壁の灯りが見えたところで、真っ赤になって引き返した。'),
polite:L('{a}は二度と参りませんと、誰もいない部屋で丁寧に宣言した。宣言の声は、少しだけ震えていた。|{a}は以前と変わらず礼儀正しく暮らしていた。ただ、あの場所の名前を聞いたときだけ、返事が一拍遅れた。')
};
var PERS_F={
proud:L('{a}「勘違いしないで。確かめに来ただけ」――そう言いながら、{a}は今日も自分から穴に腰を沈めた。言い訳は、日に日に短くなっていった。|{a}はかつて、出たら全員殴ると息巻いた壁の前で、自分から膝をついた。誇りの代わりに、待ちきれない熱だけが残っていた。'),
stern:L('{a}は規則正しく、決まった曜日の決まった時刻に壁へ通った。乱れるために律儀に通う自分を、{a}はもう咎めなかった。|{a}は、これは訓練なのだと自分に言い聞かせた。何の訓練なのかを考えることは、とうにやめていた。'),
tsun:L('{a}「べ、別に来たくて来たわけじゃないし」――毎日同じことを言いながら、{a}は毎日、穴の前に立っていた。|{a}「……今日で、最後だから」――壁に腰を沈めながら呟くその言葉を、{a}はもう何十回繰り返したか分からなかった。'),
gentle:L('{a}「今日もよろしく」――{a}は穏やかに微笑んで、壁の向こうの常連たちに声をかけた。その笑みは、以前よりずっと蕩けていた。|{a}は手作りの焼き菓子を、壁の向こうの人たちへの差し入れにするようになった。誰もそれを不思議に思わないほど、{a}はそこに馴染んでいた。'),
devoted:L('{a}「ここにいれば、誰かの役に立てる」――{a}は本気でそう信じて、壁の中で一日を過ごした。|{a}は壁の向こうからいい子だと囁かれるたびに、泣きそうなほど幸せそうな顔をした。'),
cool:L('{a}は通った日数と果てた回数を、几帳面に記録し続けた。数字が増えるたびに、{a}の表情から理屈が一枚ずつ剥がれていった。|{a}「合理的な判断。……ここが、一番気持ちいいから」――そう言い切った{a}の目は、もう何も分析していなかった。'),
free:L('{a}「ねえ、ここ最高だよ」――{a}は笑って、壁の場所を誰かれ構わず教えて回った。そして今日も、一番乗りで穴にはまった。|{a}は壁の前で鼻歌を歌いながら服を脱いだ。順番待ちの列ができるのを、{a}はむしろ楽しんでいた。'),
shy:L('{a}は誰にも見られないように、夜更けを選んで壁へ通った。穴に腰を沈めた瞬間だけ、{a}の恥じらいはとろりと溶けた。|{a}「……今日も、お願い」――消え入りそうな声でそう言うと、{a}は真っ赤な顔のまま、自分から穴に腰を差し入れた。'),
polite:L('{a}「本日も、よろしくお願いいたします」――{a}は壁の前で丁寧に一礼してから、自分で穴に腰を沈めた。|{a}は壁の向こうの人たちへの礼を、一度も欠かさなかった。礼を言う声は、いつも甘く掠れていた。')
};
var PULL_F=L('引き戻された{a}が次に壁から出られたのは、それから何時間も経ってからだった。誰が遮断を掛け直したのか、{a}はついに知らされなかった。|それから先のことを、{a}はよく覚えていない。壁の向こうの手は、{a}が抜け出しかけるたびに、ゆっくりと引き戻した。|{a}が自分の足で外へ出たのは、翌朝になってからだった。足首には、壁の向こうから掴まれた指の跡が、まだ薄く残っていた。');
var PULL_CLOSE=L('{a}は、あの手を恨んではいなかった。それが何より、{a}自身を怯えさせた。|あの日から{a}は、壁際に立つと、足首に誰かの指がかかる気がして振り返るようになった。|逃げ出せなかったのか、逃げなかったのか。{a}にはもう、その区別がつかなかった。');
var CLOSE_F={
1:L('まだ、戻れるはずだった。{a}自身も、そう信じていた。|{a}がふたたびあの壁の前に立つまで、そう長くはかからなかった。'),
2:L('もう、壁のない日のほうが落ち着かなかった。{a}の暮らしは、あの穴を中心に回り始めていた。|あの日{c}回果てた体は、もうその数では満足できなくなっていた。'),
3:L('遮断されていたのは、いつしか壁の向こうではなく、{a}の帰る場所のほうだった。|{a}が壁から出てくることは、もうなかった。壁の向こうでは今日も、{a}の甘い声を合図に、新しい誰かが列に並んだ。')
};
var ERO_F={
f:L('穴に腰を沈めた瞬間から、{a}の脚の間はもうとろとろに濡れていた。壁の向こうで誰かが奥まで入ってくるたびに、{a}は腰を押しつけてねだり、何度もイき続けた。|{a}の{ナカ}は、今では壁の向こうの誰が相手でも、すぐに形を覚えて吸いついた。奥に熱いものを注がれるたびに、{a}はびくびくと震えて次をねだった。'),
m:L('穴に腰を沈めた瞬間から、{a}のものはもう硬く張りつめていた。壁の向こうで誰かに奥を突かれるたびに、{a}は触れられてもいないのに白く果てた。|{a}の後ろは、今では壁の向こうの誰が相手でも、すぐに馴染んで吸いついた。奥に熱いものを注がれるたびに、{a}は腰を震わせて次をねだった。'),
top:L('穴に腰を沈めた瞬間から、{a}のものはもう硬く張りつめていた。壁の向こうで誰かが跨って腰を落とすたびに、{a}は熱い{ナカ}に搾り取られて果てた。|今では壁の向こうの誰が跨ってきても、{a}のものはすぐに応えた。果てても果てても締めつけられ、{a}は壁越しに腰を突き上げ続けた。'),
topf:L('穴に腰を沈めた瞬間から、{a}の脚の間はもう熱く濡れていた。壁の向こうの誰かが口と指で奉仕するたびに、{a}は腰を押しつけて「もっと」と命じ、何度も果てた。|今では壁の向こうの誰が奉仕しているのかも分からない。それでも{a}は、相手が自分の声で動くのが分かるたびに、腰の奥を熱くした。|{a}は向こう側の相手に、自分の果て方を教え込んだ。{a}が満足するまで、壁の向こうは離れることを許されなかった。')
};
var LEAD_T={
revenge:L('それからしばらく、あの壁の向こうに人が近づくことはなくなった。返り討ちにされた連中のあいだで、{a}の名前は妙な噂と一緒に囁かれるようになった。|後日、{a}はあの壁の前をわざと通ってみた。かつて手を出そうとした誰かが、{a}の顔を見るなり真っ青になって逃げていった。'),
held:L('{a}はあの壁で、結局最後まで誰にも何もさせなかった。その事実だけが、{a}にとっての勲章になった。|壁の向こうに来た連中は、誰一人として{a}に指一本触れられなかった。{a}はそれを、当然のことのように受け止めた。'),
rescued:L('{a}は{b}に借りができたことを、律儀に覚えていた。後日、{a}は{b}を食事に誘い、その日の礼をきちんと返した。|{a}「次にここにはまるのは、仕掛けた側の番」――{b}と並んで部屋を出ながら、{a}は壁の仕掛けを一瞥した。{a}は本気だった。')
};
var PERS_T={
proud:L('{a}は、あの壁を仕掛けた者を突き止めると宣言した。数日後、仕掛けた本人が自分の作った穴にはまっているのが見つかったが、{a}は何も知らないと言い張った。|{a}「この程度で、私をどうにかできると思った？」――{a}は壁に向かって鼻で笑い、二度と振り返らなかった。'),
stern:L('{a}はあの壁のことを、然るべきところへ淡々と報告した。報告書には、追い払った相手の人数まで正確に記されていた。|{a}は以前と何ひとつ変わらない毎日に戻った。ただ、背後に立たれることだけは、前よりも少し嫌うようになった。'),
tsun:L('{a}「べ、別に怖くなかったし。全員追い返したし」――何度も同じ自慢を繰り返す{a}の頬は、なぜか少し赤かった。|{a}は、壁の向こうの連中の慌てぶりを思い出しては、一人でにやりとした。そのことを指摘されると、{a}は真っ赤になって否定した。'),
gentle:L('{a}「次は、ないからね」――{a}は穏やかな笑みのまま、壁の向こうにいた人たちにそう告げた。その笑みが何より恐ろしかったと、あとで誰かが言った。|{a}は帰り道、何事もなかったように花屋に寄った。壁の向こうで青ざめていた顔を思い出して、{a}はくすりと笑った。'),
devoted:L('{a}は、誰にも何もさせなかったことを、待っていてくれた人にまっさきに報告した。誇らしげな顔だった。|{a}「……ちゃんと、守りきった」――{a}は小さく呟いて、自分の膝をそっと撫でた。'),
cool:L('{a}は壁の仕組みを分析し、穴の大きさから仕掛けた者の手口までを書き留めた。次に誰かがはまったとき、すぐに助け出せるように。|{a}は追い払った相手の顔を、一人残らず覚えていた。覚えている、ということだけを、{a}は彼らに伝えておいた。'),
free:L('{a}は壁の向こうでの立ち回りを、身振り手振りつきで友人たちに話して聞かせた。話すたびに、追い払った相手の数が一人ずつ増えていった。|{a}「なかなか楽しかった。次は壁の向こう側に回ってみようかな」――冗談めかした{a}の目は、少しも笑っていなかった。'),
shy:L('{a}は恥ずかしくて、あの日のことを誰にも話さなかった。それでも、指一本触れさせなかったことだけは、ひそかな自慢になった。|{a}は人前では俯いてばかりいたが、あの壁の向こうの連中は、{a}の名前を聞くだけで顔色を変えるようになった。'),
polite:L('{a}「今後一切、ここへは近づかないように」――{a}は壁の向こうにいた人たちに、礼儀正しく、けれど有無を言わせずにそう言い含めた。|{a}は乱れひとつない身なりで部屋を出て、受付に丁寧に礼を言って帰った。まるで、ただ見学に来た客のように。')
};
var CLOSE_T={
revenge:L('あの日、壁に捕まったのは本当はどちらだったのか。――壁の向こうの誰かは、今でもそう言って身を震わせる。|締め上げられた側が、{a}の前でだけ妙に大人しくなったのは、それからのことだった。'),
held:L('{a}の腰から下には、最後まで何も溜まらなかった。溜まったのは、壁の向こうの連中の、{a}への恐れだけだった。|壁は{a}を閉じ込めたが、{a}を変えることはできなかった。')
};
var ERO_T={
m:L('{a}は後日、懲りずに壁の前をうろついていた相手を捕まえ、今度は自分が壁の向こうに回った。穴から突き出された腰を掴み、{a}は相手が泣いて謝るまで、奥を突き上げ続けた。|{a}は、あの日手を出そうとした誰かを壁の穴に押し込み、後ろから好きなだけ貫いた。壁の向こうから聞こえる上ずった声に、{a}は満足げに目を細めた。'),
f:L('{a}は後日、懲りずに壁の前をうろついていた相手を捕まえ、今度は自分が壁の向こうに回った。穴から突き出された腰に跨り、{a}は相手が泣いて謝るまで、好きな速さで搾り取り続けた。|{a}は、あの日手を出そうとした誰かを壁の穴に押し込み、突き出されたものを指で弄び続けた。果てそうになるたびに手を止めると、壁の向こうから情けない声が聞こえた。')
};
function R(S){
if(!S.hEndR){
var src=(S.log||[]).map(function(e){return e.text||'';}).join('').slice(-400),n=0;
for(var i=0;i<src.length;i++)n=(n*31+src.charCodeAt(i))>>>0;
S.hEndR={rng:HK.rng((n+(S.log||[]).length*7177+4049)>>>0),used:{}};
}
return S.hEndR;
}
function pick(S,a){
var t=R(S),f=a.filter(function(x){return!t.used[x];});
if(!f.length)f=a;
var x=f[t.rng.int(f.length)];
t.used[x]=1;
return x;
}
function per(h){return h&&PERS.indexOf(h.persona)>=0?h.persona:'gentle';}
function lv(S){var X=HK.Lewd;return X&&X.conf('hole')&&S&&S.env?X.lv(S.env):'mid';}
function ero(S){return!!(HK.Ero&&HK.Ero.on&&HK.Ero.on(S));}
function bodyOf(h,topMe){var P=HK.Pos;if(!P)return topMe?'top':'m';return topMe?(P.hasM(h)?'top':P.isFBody(h)?'topf':'none'):P.isF(h)?'f':P.hasM(h)?'m':'none';}
function pairOf(h,b){
var P=HK.Pos,hf= !!(P&&P.isF(h)),bf= !!(P&&P.isF(b));
return hf?(bf?'ff':'mf'):(bf?'fm':'mm');
}
function relOf(h,b){
if(!b)return'far';
if(b.r&&b.r.fam)return'kin';
if(HK.ngPair&&HK.ngPair(h,b))return'ng';
var r=b.r||{},cl=function(x,y){return!HK.canLove||HK.canLove(x,y);};
if(r.love&& !r.fam&&cl(h,b)&&cl(b,h))return'love';
if(r.crush&& !r.fam&&cl(b,h))return'crush';
if(r.fam)return'kin';
if(r.w<0)return'foe';
return r.w>=0.35?'close':r.w>0?'acq':'far';
}
function fill(S,t,h,v){
return String(t).replace(/\{([a-z])\}/g,function(m,k){return k==='a'?h.name:v[k]!=null?v[k]:m;});
}
var G='\u0000';
var HE=HK.HoleEnd={
MANY:250,
depth:function(h,o){
var live= !!(o&&o.live);
if((live&& !h.fallen&&h.corrupt<100)||h.climax<=4)return 1;
return h.climax+(live?2:0)>=9?3:2;
},
level:function(h,o){
var sc=h.corrupt+h.climax*5;
if(o&&o.broken)return 2;
return sc<40?0:sc<80?1:2;
},
coda:function(S,kind,h,o){
o=o||{};
if(HK.SAFE_ON|| !h)return'';
var p=per(h),out=[],b=o.b,low=lv(S)==='low',e=ero(S),v={b:b?b.name:'',c:String(h.climax)};
if(kind==='top'){
var sit=o.sit||'held';
out.push(pick(S,LEAD_T[sit]||LEAD_T.held));
if(sit==='rescued'&&b)out.push(pick(S,REL_R[relOf(h,b)]));
out.push(G);
out.push(pick(S,PERS_T[p]));
out.push(pick(S,CLOSE_T[sit==='revenge'?'revenge':'held']));
if(e&&sit==='revenge')out.push(pick(S,ERO_T[HK.Pos&&HK.Pos.isF(h)?'f':'m']));
}else if(kind==='rescue'||kind==='rescueC'){
if(!b)return'';
var rel=relOf(h,b),pr=rel==='ng'?'ng':pairOf(h,b);
if(kind==='rescue'){
out.push(pick(S,LEAD_R[pr]));
if(o.doer)out.push(pick(S,DOER[o.live?'live':'numb']));
out.push(G);
out.push(pick(S,PERS_R[p]));
out.push(G);
out.push(pick(S,REL_R[rel]));
var sr=h.corrupt+h.climax*8;
out.push(pick(S,VAL_R[sr<30&& !o.live?0:sr<70?1:2]));
}else{
out.push(pick(S,LEAD_C[pr]));
if(o.doer)out.push(pick(S,DOER[o.live?'live':'numb']));
out.push(G);
out.push(pick(S,PERS_C[p]));
out.push(G);
out.push(pick(S,REL_C[rel]));
var many=(o.nR||0)>=2||(o.stored||0)>=HE.MANY||h.corrupt>=50;
out.push(pick(S,VAL_C[many?1:0]));
if(e&&many)out.push(pick(S,ERO_C[HK.Pos&&HK.Pos.isF(h)&& !o.topMe?'f':'m']));
}
}else if(kind==='ret'){
var l=HE.level(h,o),bd=bodyOf(h,o.topMe);
out.push(pick(S,o.late?DAY_LATE:DAY[l]));
if(l>=1||o.late)out.push(pick(S,low?FLASH.soft:FLASH[bd]||FLASH.soft));
out.push(G);
out.push(pick(S,PERS_N[p]));
out.push(G);
out.push(pick(S,CLOSE_N[l]));
if(e&&l>=1&&ERO_N[bd])out.push(pick(S,ERO_N[bd]));
}else if(kind==='fall'&&o.pulled){
out.push(pick(S,PULL_F));
out.push(G);
out.push(pick(S,PULL_CLOSE));
}else if(kind==='fall'){
var d=HE.depth(h,o),bf=bodyOf(h,o.topMe);
out.push(pick(S,LEAD_F[d][low?'soft':bf]||LEAD_F[d].soft));
out.push(G);
out.push(pick(S,(d===1?PERS_F1:PERS_F)[p]));
out.push(G);
out.push(pick(S,CLOSE_F[d]));
if(e&&d>=2&&ERO_F[bf])out.push(pick(S,ERO_F[bf]));
}else return'';
return out.map(function(t){return t===G?'\n\n':fill(S,t,h,v);}).join('').replace(/^\n+|\n+$/g,'');
},
push:function(S,E,kind,o){
if(!E|| !Array.isArray(E.lines))return;
var t=HE.coda(S,kind,S.h,o);
if(t)E.lines.push(t);
},
T:{LEAD_R:LEAD_R,REL_R:REL_R,DOER:DOER,PERS_R:PERS_R,VAL_R:VAL_R,LEAD_C:LEAD_C,REL_C:REL_C,PERS_C:PERS_C,VAL_C:VAL_C,ERO_C:ERO_C,DAY:DAY,DAY_LATE:DAY_LATE,FLASH:FLASH,PERS_N:PERS_N,CLOSE_N:CLOSE_N,ERO_N:ERO_N,LEAD_F:LEAD_F,PERS_F1:PERS_F1,PERS_F:PERS_F,CLOSE_F:CLOSE_F,ERO_F:ERO_F,LEAD_T:LEAD_T,PERS_T:PERS_T,CLOSE_T:CLOSE_T,ERO_T:ERO_T}
};
})();
});
;
HK.Load.def(464.5,'tone:scen-hole',function(){
HK.Load.toneData("mixed",{"F":[
["……少しくらい、いいんじゃない","……少しくらい、いいんじゃないですか"],
["あら…あ、あ…待って、待ってちょうだい…っ","あ…あ、あ…待って、待ってください…っ"],
["えっ、えっ、なにこれ、急に感じる……っ！？　ちょ、待って待って……っ","えっ、えっ、なにこれ、急に感じる……っ！？　ちょ、待って、待ってください……っ"],
["次の人、まだ？","次の人、まだですか？"]],
"O":{
"全員で一回ずつ。精液の魔力反応を比較する":"全員で一回ずつ、お願いします。比べるからね",
"……報告は不要です":"……報告は不要です。見れば分かるし",
"誰か！ここから出して！":"誰か！　ここから出してください！　ねえ、誰かいないの！",
"聞こえてるんでしょ！？":"聞こえてるんですよね！？　返事してよ！",
"これも鍛錬だ":"これも鍛錬ですよ。文句言わない",
"何人……っ、何人分、だ、これ……っ！":"何人……っ、何人分なんですか、これ……っ！",
"誰だ…っ、誰が、こんな…ぁ":"誰ですか…っ、誰が、こんな…ぁ",
"な、んだ、これ…っ、何、された…っ！？":"な、何これ…っ、何、されたんですか…っ！？",
"意外と平気かも":"意外と平気かもしれません。……ちょっと拍子抜け",
"今、何もされてないといいな":"今、何もされてないといいんですけど。……怖いな",
"なんだ、平気じゃん":"なんだ、平気じゃん。心配して損しました",
"ひっ……な、なか、いっぱい……っ、なんで……っ":"ひっ……な、なか、いっぱい、です……っ、なんで……っ",
"み、見ないで…今の、聞かないで…っ":"み、見ないでください…今の、聞かないで…っ",
"み、みんなに……っ、見られて、た……の……？":"み、みんなに……っ、見られて、たんですか……？　うそでしょ……",
"解放の瞬間に、まとめて共鳴させる":"解放の瞬間に、まとめて共鳴させます。見ててね",
"あらあら……ありがとう":"あらあら……ありがとうございます。うれしいな",
"やばい、やばいって、何されてたの、わたし……っ！":"やばい、やばいって、何されてたんですか、私……っ！",
"どういうことかしら":"どういうことですか。説明してよ",
"ゆっくり…ゆっくり、来て…お願い…":"ゆっくり…ゆっくり、来てください…こわいよ…",
"誰も見てませんように":"誰も見てませんように。……見てたら最悪",
"余計なことを言うな":"余計なことを言わないでください。ややこしくなるじゃん",
"え、なになに、何が起きてるの！？教えて！":"え、なになに、何が起きてるんですか！？教えてよ！",
"出たら全員殴る":"出たら全員殴ります。覚えてなよ",
"先生、反応がすごいです":"先生、反応がすごいです。見てよ、これ",
"見ないで…見ないでください…":"見ないでください…恥ずかしいよ…",
"う、うそ、うそうそ、なんでこんな……っ、いっぱい……！":"う、うそ、うそうそ、なんでこんな……っ、いっぱい、です……！",
"ねえ、今なにしてるの？実況してよ":"ねえ、今なにしてるんですか？実況してよ",
"二度と来るか、こんなところ":"二度と来ませんから、こんなところ。最悪だよ",
"わたしが我慢すれば、それでいいんだから":"私が我慢すれば、それでいいんです。平気だよ",
"ごめんなさい……っ、何が、何だか……っ！":"ごめんなさい……っ、何が、何だか……っ、わかんないよ！",
"べ、別に向こうで何されてても関係ないし。感じないし":"べ、別に向こうで何されてても関係ないです。感じないし",
"向こうの人たちも、退屈してないといいわね":"向こうの人たちも、退屈してないといいですね。私は暇だよ",
"…耐えた。ちゃんと、耐えたよ":"…耐えました。ほら、平気だったでしょ",
"あらあら…大変だったわね、わたし":"あらあら…大変でしたね、私。よく頑張ったよ",
"気にしてない、気にしてない":"気にしてないです。……ほんとに、平気だし",
"ねー、何人いるのー？":"ねー、何人いるんですかー？　教えてよー",
"大丈夫、何も感じないんだから、大丈夫":"大丈夫です、何も感じないんだから、大丈夫",
"全部飲めよ":"全部飲んでください。こぼしたら怒るよ",
"ぜんっぜん気にしてないから":"ぜんっぜん気にしてないですから。ほんとだし",
"き、記憶にないから！何も覚えてないから！":"き、記憶にないですから！何も覚えてないし！"}});
HK.Load.toneData("noja",{"F":[
["……っ、こんなの、認めねえ……","……っ、このようなもの、認めぬぞ……"],
["……っ、も、もっと……して、ください……","……っ、も、もっと……して、たもれ……"],
["……っ、刺激の、出所を……特定、しないと……","……っ、刺激の、出所を……特定、せねば……"],
["……ばか。気持ちいい……","……たわけ。気持ちよい……"],
["……ふふ、いい子ね……もっと、ちょうだい……","……ふふ、よい子じゃ……もっと、おくれ……"],
["……もっと、って言ってない……言ってない、けど……っ、やめないで……","……もっと、とは言うておらぬ……言うておらぬ、が……っ、やめるでない……"],
["……声、出てない。出てないから……っ","……声など、出ておらぬ。出ておらぬぞ……っ"],
["……恥ずかしいのに……やめて、ほしくない……っ","……恥ずかしいのに……やめて、ほしくないのじゃ……っ"],
["……悪くない……データとしては、最悪、だけど……っ","……悪くない……データとしては、最悪、じゃが……っ"],
["いや、こっちのほうが――ほら","いや、こちらのほうが――ほれ"],
["うそ、今まで、ずっとこんなこと……されてたの……っ！？","うそじゃろ、今まで、ずっとこんなこと……されておったのか……っ！？"],
["え、なになに、何が起きてるの！？教えて！","え、何じゃ何じゃ、何が起きておるのじゃ！？教えてたもれ！"],
["えっ、えっ、なにこれ、急に感じる……っ！？　ちょ、待って待って……っ","えっ、えっ、なんじゃこれ、急に感じる……っ！？　ちょ、待て待て……っ"],
["えっ、なにこれ、なにこれ、やばっ…あっ、あぁっ！","えっ、何じゃこれ、何じゃこれは…あっ、あぁっ！"],
["お願い、少しだけ、ゆっくり……ね？","頼む、少しだけ、ゆっくり……のう？"],
["か、感じてないから！　今のは、びっくりしただけ……っ、ぁ","か、感じてなどおらぬ！　今のは、驚いただけじゃ……っ、ぁ"],
["くそ……っ、なんで、体が、勝手に……っ","くっ……なぜ、体が、勝手に……っ"],
["すっご…なにあれ…","なんと…何じゃあれは…"],
["だ、だめです……っ、こんなの、だめなのに……っ","な、ならぬ……っ、このようなこと、ならぬのに……っ"],
["だめよ……そんな、優しくしたら……っ","ならぬ……そのように、優しくしては……っ"],
["ちょっ、うそ、なんで感じ……っ、や、やだ、触んないでよ……っ！","ちょっ、うそじゃ、なぜ感じ……っ、や、やめい、触るでない……っ！"],
["な、んだ、これ……っ！　誰だ、勝手に……触ってんじゃ、ねえ……っ！","な、なんじゃ、これ……っ！　誰じゃ、勝手に……触るでない……っ！"],
["ねえ、今なにしてるの？実況してよ","のう、今なにをしておるのじゃ？実況してみせよ"],
["ねえ、次の人も来て……っ！","のう、次の者も来るのじゃ……っ！"],
["ひっ……！？　や、やだ、感覚、戻って……っ","ひっ……！？　や、やじゃ、感覚が、戻って……っ"],
["もっと、もっとして……っ！　止めないで……っ！","もっと、もっとじゃ……っ！　止めるでないぞ……っ！"],
["や、そこ、だめ……っ、だめって、言って……ぁ……っ","や、そこは、ならぬ……っ、ならぬと、言うて……ぁ……っ"],
["やば……っ、これ、やばいって……っ、ぁ、あっ","まずい……っ、これは、まずいぞ……っ、ぁ、あっ"],
["やめろって、言ってんだろ……っ、く、ぅ……！","やめよと、言うておろう……っ、く、ぅ……！"],
["ん……全部、受け止めてあげる……っ","ん……全部、受け止めてやろう……っ"],
["上手、ね……っ、困っちゃう……","上手、じゃのう……っ、困ってしまう……"],
["今、何もされてないといいな","今、何もされておらぬとよいのう"],
["何が、起きてるんですか……っ","何が、起きておるのじゃ……っ"],
["待って、気持ちいい……っ、気持ちいいの、困る……っ！","待て、気持ちよい……っ、気持ちよくて、困るのじゃ……っ！"],
["意外と平気かも","意外と平気かもしれぬ"],
["意外と快適かも","意外と快適かもしれぬ"],
["感覚、戻って……ふざけ、んな……っ、離せ……！","感覚が、戻って……ふざけるでない……っ、離さぬか……！"],
["我慢、しなきゃ……我慢……っ、ん……っ","我慢、せねば……我慢……っ、ん……っ"],
["最高……っ、こんなの、知らなかった……っ","最高じゃ……っ、このようなもの、知らなんだ……っ"],
["次の人、まだ？","次の者は、まだか？"],
["止めんな……っ、今止めたら、出たあと、ただじゃおかねえ……っ","止めるでない……っ、今止めたら、出たあと、ただではおかぬぞ……っ"],
["気持ち、いいです……っ、ごめんなさい……","気持ち、よい……っ、すまぬ……"],
["規律、など……今は……どうでも、いい……っ","規律、など……今は……どうでも、よい……っ"],
["誰よ、こんなことしてるの……っ、出たら覚えてなさい……っ","誰じゃ、こんなことをしておるのは……っ、出たら覚えておれ……っ"],
["誰ー！？　ちょっと、いったんストップ……っ、ぁ！","誰じゃー！？　ちょっと、いったん止まるのじゃ……っ、ぁ！"],
["関わらないほうがいい","関わらぬほうがよい",1],
["誰も見てませんように","誰も見ておらぬように",1],
["余計なことを言うな","余計なことを言うでない",1],
["ここを出たら、まずこの壁を叩き壊す","ここを出たら、まずこの壁を叩き壊してくれる",1],
["話はあと。まず出す","話はあとじゃ。まず出すぞ",1],
["……少しくらい、いいんじゃない","……少しくらい、よいではないか",1],
["どうせ誰か分からないんだし","どうせ誰か分からぬのじゃし",1]],
"O":{
"全員で一回ずつ。精液の魔力反応を比較する":"皆で一度ずつじゃ。精の魔力の反応を比べるぞ",
"……報告は不要です":"……報告には及ばぬ",
"誰か！ここから出して！":"誰ぞ！　ここから出せい！",
"聞こえてるんでしょ！？":"聞こえておるのじゃろう！？",
"これも鍛錬だ":"これも鍛錬じゃ",
"何人……っ、何人分、だ、これ……っ！":"何人……っ、何人分じゃ、これは……っ！",
"誰だ…っ、誰が、こんな…ぁ":"誰じゃ…っ、誰が、このような…ぁ",
"な、んだ、これ…っ、何、された…っ！？":"な、何じゃ、これは…っ、何をされた…っ！？"}});
HK.Load.toneData("kansai",{"F":[
["……っ、こんなの、認めねえ……","……っ、こんなん、認めへん……"],
["……っ、何を、している……！　ただちに、やめ……っ","……っ、何を、しとるんや……！　今すぐ、やめ……っ"],
["……っ、刺激の、出所を……特定、しないと……","……っ、刺激の、出所を……特定、せんと……"],
["……ふふ、いい子ね……もっと、ちょうだい……","……ふふ、ええ子やね……もっと、ちょうだい……"],
["……もっと、って言ってない……言ってない、けど……っ、やめないで……","……もっと、って言うてへん……言うてへん、けど……っ、やめんといて……"],
["……声、出てない。出てないから……っ","……声、出てへん。出てへんから……っ"],
["……少しくらい、いいんじゃない","……ちょっとくらい、ええんちゃう"],
["……恥ずかしいのに……やめて、ほしくない……っ","……恥ずかしいのに……やめて、ほしない……っ"],
["あら…あ、あ…待って、待ってちょうだい…っ","あ…あ、あ…待って、待ってえな…っ"],
["うそ、今まで、ずっとこんなこと……されてたの……っ！？","うそ、今まで、ずっとこんなこと……されてたん……っ！？"],
["か、感じてないから！　今のは、びっくりしただけ……っ、ぁ","か、感じてへんから！　今のは、びっくりしただけ……っ、ぁ"],
["こ、声……出したら、聞こえちゃう……っ","こ、声……出したら、聞こえてまう……っ"],
["だ、だめです……っ、こんなの、だめなのに……っ","あ、あかん……っ、こんなん、あかんのに……っ"],
["ちょっ、うそ、なんで感じ……っ、や、やだ、触んないでよ……っ！","ちょっ、うそ、なんで感じ……っ、い、いやや、触らんといてよ……っ！"],
["どうせ誰か分からないんだし","どうせ誰か分からへんし"],
["な、んだ、これ……っ！　誰だ、勝手に……触ってんじゃ、ねえ……っ！","な、んや、これ……っ！　誰や、勝手に……触んなや……っ！"],
["もっと、もっとして……っ！　止めないで……っ！","もっと、もっとして……っ！　止めんといて……っ！"],
["やめなよ。それより出してあげよう","やめとき。それより出したろ"],
["やめろって、言ってんだろ……っ、く、ぅ……！","やめろって、言うてるやろ……っ、く、ぅ……！"],
["ん……全部、受け止めてあげる……っ","ん……全部、受け止めたげる……っ"],
["上手、ね……っ、困っちゃう……","上手、やね……っ、困ってまう……"],
["何が、起きてるんですか……っ","何が、起きてるん……っ"],
["困ったわねえ","困ったなあ"],
["困ってるんだよ、助けないと","困ってるんやで、助けな"],
["我慢、しなきゃ……我慢……っ、ん……っ","我慢、せな……我慢……っ、ん……っ"],
["戻った、のか……感覚が……っ","戻った、んか……感覚が……っ"],
["最高……っ、こんなの、知らなかった……っ","最高……っ、こんなん、知らんかった……っ"],
["止めんな……っ、今止めたら、出たあと、ただじゃおかねえ……っ","止めんな……っ、今止めたら、出たあと、ただじゃおかへんで……っ"],
["誰よ、こんなことしてるの……っ、出たら覚えてなさい……っ","誰や、こんなことしてるん……っ、出たら覚えときや……っ"],
["関わらないほうがいい","関わらんほうがええ"],
["感じてない、感じてないのに…なんで…っ！","感じてへん、感じてへんのに…なんで…っ！",1],
["さすがに放っておけない","さすがにほっとかれへん",1]],
"O":{
"全員で一回ずつ。精液の魔力反応を比較する":"全員で一回ずつな。精液の魔力反応、比べるで",
"……報告は不要です":"……報告はいらんで",
"誰か！ここから出して！":"誰か！　ここから出してや！",
"聞こえてるんでしょ！？":"聞こえてるんやろ！？",
"これも鍛錬だ":"これも鍛錬や",
"何人……っ、何人分、だ、これ……っ！":"何人……っ、何人分や、これ……っ！",
"誰だ…っ、誰が、こんな…ぁ":"誰や…っ、誰が、こんな…ぁ",
"な、んだ、これ…っ、何、された…っ！？":"な、なんや、これ…っ、何、された…っ！？"}});
HK.Load.toneData("mukuchi",{"F":[
["……っ、ありえ、ない……こんな、量……","……ありえない……こんな、量……"],
["……っ、も、もっと……して、ください……","……もっと……っ"],
["……っ、や、やめたら、許さない、から……っ","……やめたら、許さない……っ"],
["……っ、刺激の、出所を……特定、しないと……","……特定、しないと"],
["……っ、耐え、ろ……これしき……っ","……耐えろ……っ"],
["……恥ずかしいのに……やめて、ほしくない……っ","……やめないで……っ"],
["……悪くない……データとしては、最悪、だけど……っ","……悪くない……っ"],
["あら…あ、あ…待って、待ってちょうだい…っ","……待って……っ"],
["あらあら……ありがとう","……ありがとう"],
["いや、こっちのほうが――ほら","……こっち"],
["うそ、今まで、ずっとこんなこと……されてたの……っ！？","……ずっと……されてたの……っ？"],
["な、んだ、これ……っ！　誰だ、勝手に……触ってんじゃ、ねえ……っ！","……触んな……っ"],
["な、中に……っ、何が、入って……！？","……中に、何が……？"],
["ひっ…や、やだ…っ、声、出ちゃ…っ","……声、出ちゃう……っ"],
["み、みんなに……っ、見られて、た……の……？","……見られて、た……？"],
["や、そこ、だめ……っ、だめって、言って……ぁ……っ","……だめ……っ"],
["やめろって、言ってんだろ……っ、く、ぅ……！","……やめろ……っ"],
["二度と来るか、こんなところ","……二度と来るか"],
["何が、起きてるんですか……っ","……なに……っ？"],
["我慢、しなきゃ……我慢……っ、ん……っ","……我慢……っ"],
["戻った、のか……感覚が……っ","……感覚が……っ"],
["止めんな……っ、今止めたら、出たあと、ただじゃおかねえ……っ","……止めんな……っ"],
["規律、など……今は……どうでも、いい……っ","……どうでも、いい……っ"],
["ぜんっぜん気にしてないから","……気にしてない",1],
["ふざ、け…っ、止まら、な…","……止まら、な……",1],
["あー……見られちゃった。まあ、いっか","……あー。見られた。……まあ、いっか",1]],
"O":{
"全員で一回ずつ。精液の魔力反応を比較する":"……全員、一回ずつ。比べる",
"……報告は不要です":"……報告、いらない",
"誰か！ここから出して！":"……誰か。出して",
"聞こえてるんでしょ！？":"……聞こえてる、でしょ",
"これも鍛錬だ":"……鍛錬",
"何人……っ、何人分、だ、これ……っ！":"……何人分",
"誰だ…っ、誰が、こんな…ぁ":"……誰。誰が",
"な、んだ、これ…っ、何、された…っ！？":"……何、された"}});
HK.Load.toneData("polite",{"F":[
["……少しくらい、いいんじゃない","……少しくらい、よろしいのではありませんか"],
["いや、こっちのほうが――ほら","いえ、こちらのほうが――ほら、いかがですか"],
["も、申し訳、ありませ……っ、なにが、起きて……っ","も、申し訳、ありませ……っ、なにが、起きているのですか……っ"],
["やめなよ。それより出してあげよう","おやめください。それより、出して差し上げましょう"],
["次の人、まだ？","次の方は、まだですか？"],
["困ってるんだよ、助けないと","困っているのです、助けないと",1]],
"O":{
"全員で一回ずつ。精液の魔力反応を比較する":"全員で一回ずつお願いします。精液の魔力反応を比較します",
"誰か！ここから出して！":"誰か！　ここから出してください！",
"聞こえてるんでしょ！？":"聞こえているんでしょう！？",
"これも鍛錬だ":"これも鍛錬です",
"何人……っ、何人分、だ、これ……っ！":"何人……っ、何人分ですか、これ……っ！",
"誰だ…っ、誰が、こんな…ぁ":"誰ですか…っ、誰が、こんな…ぁ",
"な、んだ、これ…っ、何、された…っ！？":"な、何ですか、これ…っ、何をされたんですか…っ！？"}});
HK.Load.toneData("gentleman",{"F":[
["……少しくらい、いいんじゃない","……少しくらい、構わないのではないかね"],
["いや、こっちのほうが――ほら","いや、こちらのほうが――ほら、分かるだろう"],
["くっ……落ち着け……落ち着け……っ","くっ……落ち着くんだ……落ち着け……っ"],
["やめなよ。それより出してあげよう","やめたまえ。それより、出してあげようじゃないか"],
["次の人、まだ？","次の者は、まだかね？"],
["こんなの、誘ってるようなものだよ","これでは、誘っているようなものだよ。困った人だね",1],
["どうせ誰か分からないんだし","どうせ、誰かは分からないのだからね",1],
["困ってるんだよ、助けないと","困っているのだよ。助けなくては",1],
["……誘ってるよね、これ","……誘っているね、これは",1],
["晩ご飯、何にしよう","晩ご飯は、何にしようかね",1]],
"O":{
"全員で一回ずつ。精液の魔力反応を比較する":"全員で一度ずつだ。精液の魔力反応を比べさせてもらうよ",
"……報告は不要です":"……報告はいらないよ",
"誰か！ここから出して！":"誰か！　ここから出してくれたまえ！",
"聞こえてるんでしょ！？":"聞こえているのだろう！？",
"これも鍛錬だ":"これも鍛錬だよ",
"何人……っ、何人分、だ、これ……っ！":"何人……っ、何人分なのだ、これは……っ！",
"誰だ…っ、誰が、こんな…ぁ":"誰だ…っ、誰が、こんなことを…ぁ",
"な、んだ、これ…っ、何、された…っ！？":"な、何だ、これは…っ、何をされた…っ！？"}});
HK.Load.toneData("proud",{"F":[
["……少しくらい、いいんじゃない","……少しくらい、いいだろ",1],
["どうせ誰か分からないんだし","どうせ誰か分からねえんだ",1]]});
HK.Load.toneData("aniki",{"F":[
["……少しくらい、いいんじゃない","……少しくらい、いいんじゃねえか？",1],
["どうせ誰か分からないんだし","どうせ誰かわかんねえんだしさ",1],
["そっちを押さえて。私が引く","そっち押さえてくれ。私が引く",1]]});
HK.Load.toneData("yankee",{"F":[
["……っ、何を、している……！　ただちに、やめ……っ","……っ、てめえ、何、してやがる……！　さっさと、やめ……っ"],
["あら…あ、あ…待って、待ってちょうだい…っ","お…あ、あ…待って、待ってくれよ…っ"],
["あら、あ……っ？　待って、今、何を……っ","お、おい……っ？　待てよ、今、何を……っ"],
["あらあら……ありがとう","お、おう……ありがとな"],
["お願い、少しだけ、ゆっくり……ね？","頼むよ、ちょっとだけ、ゆっくり……な？"],
["だめよ……そんな、優しくしたら……っ","だめだって……そんな、優しくされたら……っ"],
["ちょっ、うそ、なんで感じ……っ、や、やだ、触んないでよ……っ！","ちょっ、うそだろ、なんで感じ……っ、や、やめろ、触んじゃねえよ……っ！"],
["どういうことかしら","どういうことだよ"],
["ねえ、次の人も来て……っ！","おい、次の奴も来いよ……っ！"],
["ねー、何人いるのー？","なあ、何人いんの？"],
["上手、ね……っ、困っちゃう……","上手い、じゃん……っ、調子狂うな……"],
["次の人、まだ？","次の奴、まだかよ？"],
["規律、など……今は……どうでも、いい……っ","規律なんざ……今は……どうでも、いい……っ"],
["誰だか知らないが、覚えておけ","誰だか知らねえが、覚えとけ"],
["誰も見てませんように","誰も見てねえといいけど"],
["誰よ、こんなことしてるの……っ、出たら覚えてなさい……っ","誰だよ、こんなことしてんの……っ、出たら覚えてろ……っ"],
["え、なになに、何が起きてるの！？教えて！","え、なになに、何が起きてんだよ！？　教えろよ！",1],
["出してあげよう","出してやるよ",1],
["関わらないほうがいい","関わんねえほうがいい",1],
["……少しくらい、いいんじゃない","……少しくらい、いいんじゃねえの",1],
["ねえ、今なにしてるの？実況してよ","おい、今なにしてんだよ？　実況しろよ",1],
["やばい、やばいって、何されてたの、わたし……っ！","やべえ、やべえって、何されてたんだ、私……っ！",1],
["ふざ、け……っ、イくの、止まんね……っ♡♡","ふざ、け……っ、イくの、止まんね……っ♡♡",1]]});
HK.Load.toneData("stern",{"F":[
["いや、こっちのほうが――ほら","いや、こちらのほうが――ほら"],
["次の人、まだ？","次の者は……まだ、か……っ"],
["こんなの、誘ってるようなものだよ","これは……誘っているも同然だ",1],
["どうせ誰か分からないんだし","どうせ誰かは分からん",1],
["……少しくらい、いいんじゃない","……少しくらいなら、構わんだろう",1],
["全員で一回ずつ。精液の魔力反応を比較する","全員で一回ずつ。精液の魔力反応を比べる",1]]});
HK.Load.toneData("tsun",{"F":[
["こんなの、誘ってるようなものだよ","こ、こんなの、誘ってるようなもんじゃない……！",1]]});
HK.Load.toneData("tsun_n",{"F":[
["な、何よそれ、どういう意味！？","な、何だよそれ、どういう意味！？"],
["誰よ、こんなことしてるの……っ、出たら覚えてなさい……っ","誰だよ、こんなことしてるの……っ、出たら覚えてろよ……っ"],
["こんなの、誘ってるようなものだよ","こんなの、誘ってるようなものだろ",1],
["や、やだ、うそ、こんなの聞いてな…っ！","ま、待て、うそだ、こんなの聞いてな…っ！",1],
["やだ、やだぁ……っ♡　また、イっちゃう……っ♡♡","嫌だ、嫌だ……っ♡　また、イっちゃう……っ♡♡",1]]});
HK.Load.toneData("gentle",{"F":[
["困ったわねえ","困ったねえ",1]]});
HK.Load.toneData("gentle_n",{"F":[
["……ふふ、いい子ね……もっと、ちょうだい……","……ふふ、いい子だね……もっと、ちょうだい……"],
["あら…あ、あ…待って、待ってちょうだい…っ","あれ…あ、あ…待って、ちょっと待って…っ"],
["あらあら……ありがとう","わあ……ありがとう"],
["だめよ……そんな、優しくしたら……っ","だめだよ……そんな、優しくしたら……っ"],
["困ったわねえ","困ったねえ"]]});
HK.Load.toneData("ane",{"F":[
["あらあら…大変だったわね、わたし","あらあら…大変だったわね、私"],
["やめなよ。それより出してあげよう","やめなさい。それより出してあげましょう"],
["困ってるんだよ、助けないと","困ってるのよ、助けないと",1],
["あらあら……ありがとう","あらあら……ありがとう",1]]});
HK.Load.toneData("devoted",{"F":[
["……少しくらい、いいんじゃない","……少しくらい、いいんじゃないですか"],
["いや、こっちのほうが――ほら","いえ、こっちのほうが――ほら、どうですか……？"],
["やめなよ。それより出してあげよう","やめてください。それより出してあげましょう"],
["次の人、まだ？","次の方は、まだですか……？"],
["誰か！ここから出して！","誰か！ここから出してください！"]],
"S":[
"ごめんなさい……っ、何が、何だか……っ！"]});
HK.Load.toneData("kohai",{"F":[
["……とても、心地よう、ございます……","……めっちゃ、気持ちいいっす……"],
["……どうか、続けて、くださいませ……っ","……そのまま、続けてほしいっす……っ"],
["……少しくらい、いいんじゃない","……少しくらい、いいんじゃないっすか"],
["い、いけません、こんな……いっぺんに……っ","だ、ダメっす、こんな……いっぺんに……っ"],
["いけません……っ、そのような、ところ……っ","ダメっす……っ、そんなとこ……っ"],
["いったい、何を……っ","な、何してるんすか……っ"],
["いや、こっちのほうが――ほら","いや、こっちのほうが――ほら、いいっす"],
["お、おやめください……っ、感覚が、戻って……っ","や、やめてくださいっす……っ、感覚、戻ってるっす……っ"],
["お、お待ちください、こんな、一度には……っ","ま、待ってくださいっす、こんな、一度には……っ"],
["お、お手柔らかに……お願い、いたします……っ","お、お手柔らかに……頼むっす……っ"],
["お時間まで、こちらでお待ちします","時間まで、ここで待ってるっす"],
["お気の済むまで……どうぞ……っ","気が済むまで……好きにしていいっすよ……っ"],
["どうせ誰か分からないんだし","どうせ誰か分からないっすし"],
["も、申し訳、ありませ……っ、なにが、起きて……っ","す、すんませ……っ、なにが、起きて……っ"],
["も、申し訳ありません……っ、どなたか、そちらに……っ","す、すんません……っ、誰か、そっちにいるんすか……っ"],
["やめなよ。それより出してあげよう","やめるっすよ。それより出してあげるっす"],
["全員で一回ずつ。精液の魔力反応を比較する","全員で一回ずつっす。精液の魔力反応を比較するっす"],
["次の人、まだ？","次の人、まだなんすか？"],
["聞こえてるんでしょ！？","聞こえてるっすよね！？"],
["困ってるんだよ、助けないと","困ってるんすよ、助けないと",1],
["晩ご飯、何にしよう","晩ご飯、何にするっすかね",1],
["こんなの、誘ってるようなものだよ","こんなの、誘ってるようなもんじゃないっすか",1]]});
HK.Load.toneData("cool",{"F":[
["聞こえてるんでしょ！？","聞こえてるんだろ！？"],
["こんなの、誘ってるようなものだよ","これは誘っていると解釈するのが妥当だ",1],
["どうせ誰か分からないんだし","どうせ個人の特定はできない",1],
["……少しくらい、いいんじゃない","……少しくらいなら、問題ないだろう",1],
["理屈では……分かってるのに……っ♡　締まるのが、止められない……♡","理屈では……分かっているのに……っ♡　締まるのが、止められない……♡",1],
["全員で一回ずつ。精液の魔力反応を比較する","全員で一回ずつ。精液の魔力反応を比較する",1],
["意外と平気かも","意外と平気かもしれない",1],
["誰か！ここから出して！","誰か！　ここから出してくれ！",1],
["出してあげよう","出してやろう",1],
["……誘ってるよね、これ","……誘っているな、これは",1]]});
HK.Load.toneData("calm",{"F":[
["……っ、刺激の、出所を……特定、しないと……","……っ、誰が……触って、いる……"],
["……反応を、抑制……できない……っ","……体が、言うことを……きかない……っ"],
["……悪くない……データとしては、最悪、だけど……っ","……悪くない……困ったことに、だけど……っ"],
["よ、四…いや、六…","……四。いや、六か"],
["全員で一回ずつ。精液の魔力反応を比較する","全員で一回ずつ。精液の魔力を確かめる"],
["待て……情報が、多すぎる……っ","待て……いきなり、こんな……っ"],
["誰か！ここから出して！","誰か、ここから出してくれ"],
["こんなの、誘ってるようなものだよ","こんなの、誘っているようなものだよ",1],
["どうせ誰か分からないんだし","どうせ、誰か分からないんだし",1],
["……少しくらい、いいんじゃない","……少しくらい、いいんじゃないかな",1],
["理屈では……分かってるのに……っ♡　締まるのが、止められない……♡","頭では……分かってるのに……っ♡　締まるのが、止められない……♡",1],
["ぁ゛……っ♡　なん、かい……？　計算、が……♡♡","ぁ゛……っ♡　なん、かい……？　もう、わから、な……♡♡",1],
["入力、過多……っ♡　処理、できな……♡♡","多すぎ、る……っ♡　もう、受けとめ、きれな……♡♡",1],
["思考、が……っ♡　とけ……る……♡♡","頭、が……っ♡　とけ……る……♡♡",1],
["理屈では……分かってる……分かってるのに……っ","頭では……分かってる……分かってるのに……っ",1],
["……回復まで四分。想定より長い","……落ち着くまで四分。思ったより長い",1]]});
HK.Load.toneData("free",{"F":[
["こんなの、誘ってるようなものだよ","こんなの、誘ってるようなものだよ？",1]]});
HK.Load.toneData("usan",{"F":[
["あら…あ、あ…待って、待ってちょうだい…っ","あ…あ、あ…待って、待って…っ"],
["お願い、少しだけ、ゆっくり……ね？","あんた……少しだけ、ゆっくり頼むよ……っ"],
["ごめんなさい、急に感覚が……っ、あ、そこ……","おっと、急に感覚が……っ、あ、そこ……"],
["だめよ……そんな、優しくしたら……っ","だめだって……そんな、優しくされたら……っ"],
["上手、ね……っ、困っちゃう……","上手だねえ……っ、参っちまうよ……"],
["困ったわねえ","参ったねえ"],
["次の人、まだ？","次の人は、まだかい？"],
["こんなの、誘ってるようなものだよ","こんなの、誘ってるようなものだよねえ",1]]});
HK.Load.toneData("ojou",{"F":[
["……少しくらい、いいんじゃない","……少しくらい、よろしいのではなくて"],
["いや、こっちのほうが――ほら","いいえ、こちらのほうが――ほら、いかがですの？"],
["やめなよ。それより出してあげよう","おやめなさいまし。それより、出して差し上げましょう"],
["次の人、まだ？","次の方は、まだですの？"],
["どうせ誰か分からないんだし","どうせ誰だか分かりませんもの",1],
["話はあと。まず出す","お話はあとですわ。まずは出しますわよ",1]]});
HK.Load.toneData("hero",{"F":[
["え、なになに、何が起きてるの！？教えて！","え、なになに、何が起きてるんだ！？　教えてくれ！",1],
["出してあげよう","出してやるぜ！",1]]});
HK.Load.toneData("gyaru",{"F":[
["こんなの、誘ってるようなものだよ","こんなん、誘ってるようなもんじゃん〜",1],
["やばい、やばいって、何されてたの、わたし……っ！","やばい、やばいって、何されてたの、私……っ！"],
["解放の瞬間に、まとめて共鳴させる","解放の瞬間に、まとめて共鳴させちゃう"],
["関わらないほうがいい","関わんないほうがいいよ"],
["全員で一回ずつ。精液の魔力反応を比較する","全員で一回ずつね。精液の魔力反応、比べてみよ"],
["そっちを押さえて。私が引く","そっち押さえて。私が引く"],
["さすがに放っておけない","さすがに放っとけないって"],
["先生、反応がすごいです","先生、反応ヤバいんだけど"],
["聞こえてるんでしょ！？","聞こえてんでしょ！？"],
["感覚遮断下での充血反応。興味深い","感覚遮断中の充血反応。めっちゃ興味深い"],
["媚薬ガスを注入します","媚薬ガス、入れちゃうね"],
["話はあと。まず出す","話はあと。まず出すよ"],
["今は助けるのが先","今は助けるのが先だって"]]});
HK.Load.toneData("chara",{"F":[
["え、なになに、何が起きてるの！？教えて！","え、なになに、何起きてんの！？　教えて！",1],
["……少しくらい、いいんじゃない","……少しくらい、いいんじゃね？",1],
["こんなの、誘ってるようなものだよ","こんなん、誘ってるようなもんっしょ"],
["どうせ誰か分からないんだし","どうせ誰か分かんねーんだし"],
["やばい、やばいって、何されてたの、わたし……っ！","やばい、やばいって、何されてたの、私……っ！"],
["そっちを押さえて。私が引く","そっち押さえて。私が引くから"],
["……誘ってるよね、これ","……誘ってるっしょ、これ"],
["晩ご飯、何にしよう","晩ご飯、何にしよっか"],
["さすがに放っておけない","さすがに放っとけねーわ"],
["先生、反応がすごいです","先生、反応ヤバいっす"],
["やめなよ。それより出してあげよう","やめなって。それより出してあげよ"],
["媚薬ガスを注入します","媚薬ガス、注入しまーす"]]});
HK.Load.toneData("mystic",{"F":[
["こんなの、誘ってるようなものだよ","こんなの、誘っているようなものなんだ。わかっているくせに",1],
["どうせ誰か分からないんだし","どうせ誰か分からないんだ",1],
["……少しくらい、いいんじゃない","……少しくらい、いいんじゃないかい",1],
["理屈では……分かってるのに……っ♡　締まるのが、止められない……♡","分かってる、のに……っ♡　締まるのが、止められない……んだ……♡",1],
["全員で一回ずつ。精液の魔力反応を比較する","全員で一回ずつね。精液の魔力反応を比べてみるんだ",1],
["……誘ってるよね、これ","……誘っているね、これは",1]]});
HK.Load.toneData("genki",{"F":[
["も、申し訳、ありませ……っ、なにが、起きて……っ","ご、ごめんなさ……っ、なにが、起きて……っ"],
["話はあと。まず出す","話はあとです！　まず出しましょう！",1]]});
HK.Load.toneData("darui",{"F":[
["あら…あ、あ…待って、待ってちょうだい…っ","……あ…あ……待って、待って…っ"],
["うそ、今まで、ずっとこんなこと……されてたの……っ！？","……うそ……今まで、ずっとこんなこと……されてたの……っ"],
["え、なになに、何が起きてるの！？教えて！","……え、なになに、何が起きてるの？……教えて"],
["えっ、えっ、なにこれ、急に感じる……っ！？　ちょ、待って待って……っ","……えっ……なにこれ……急に、感じる……っ……待って……"],
["な、んだ、これ…っ、何、された…っ！？","……な、んだ、これ…っ、何、された…っ？"],
["な、中に……っ、何が、入って……！？","……な、中に……っ、何が、入って……？"],
["ひっ……！？　や、やだ、感覚、戻って……っ","……ひっ……やだ……感覚、戻って……っ"],
["困ったわねえ","……困ったな"],
["聞こえてるんでしょ！？","……聞こえてるんでしょ？"],
["誰ー！？　ちょっと、いったんストップ……っ、ぁ！","……誰……？　……ちょっと、いったんストップ……っ、ぁ"],
["こんなの、誘ってるようなものだよ","……こんなの。……誘ってるのと同じ",1]]});
HK.Load.toneData("sondai",{"F":[
["こんなの、誘ってるようなものだよ","まったく……これでは誘っているようなものではないかね",1],
["どうせ誰か分からないんだし","どうせ誰かなど分かりはしないのだよ",1],
["困ってるんだよ、助けないと","困っているのだよ。助けねばなるまい",1],
["今、何もされてないといいな","今、何もされていないといいがね",1],
["全部飲めよ","全部飲みたまえ",1],
["意外と平気かも","意外と平気かもしれんね",1],
["晩ご飯、何にしよう","晩ご飯は、何にしようかね",1]]});
});
HK.Load.done('scen-hole', '48737df521', 1);
