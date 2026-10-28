;
/* ==== js/scenarios-a.js ==== */
HK.Load.def(80,'js/scenarios-a.js',function(){
(function(){
'use strict';
var HK=window.HK;
HK.SCENARIOS=HK.SCENARIOS||{};
HK.SCEN_ORDER=HK.SCEN_ORDER||[];
function R(ctx,a,b){return ctx.R(a,b);}
function names(list){return list.map(function(c){return c.name;}).join('・');}
function add(s){HK.SCENARIOS[s.id]=s;if(HK.SCEN_ORDER.indexOf(s.id)<0)HK.SCEN_ORDER.push(s.id);}
function gRom(ctx){return(ctx.env.romance==null?50:ctx.env.romance)/50;}
function gTaken(ctx,a){return ctx.chars.some(function(c){return c!==a&&ctx.pair(a,c).couple;});}
function gTie(ctx,x,y){var T=HK.Ties;return!!(T&&T.has&&(T.has(ctx,x,y,'lover')||T.has(ctx,x,y,'mate')||T.has(ctx,x,y,'fated')));}
function gMulti(ctx,x){var n=0;ctx.chars.forEach(function(o){if(o!==x&&gTie(ctx,x,o))n++;});return n>=2;}
function gOther(ctx,x,y){return ctx.chars.some(function(o){return o!==x&&o!==y&&ctx.pair(x,o).couple;});}
function gSecond(ctx,a,b){return(gOther(ctx,a,b)&& !gMulti(ctx,a))||(gOther(ctx,b,a)&& !gMulti(ctx,b));}
var G_SECOND_PASS=0.4;
function gShared(ctx,a,b){
var L=ctx.chars.filter(function(c){return c!==a&&c!==b&&c.alive&& !c.out&&ctx.pair(a,c).couple&&ctx.pair(b,c).couple&& !(gTie(ctx,a,c)&&gTie(ctx,b,c));});
return L[0]||null;
}
function gRivalOf(ctx,a){
if(!a.alive||a.out)return null;
var hit=null;
ctx.chars.forEach(function(b){
if(hit||b===a|| !b.alive||b.out)return;
var pf=ctx.pair(a,b);
if((pf.gTwo||0)>=2||(pf.gTwoAt!=null&&ctx.stepIndex<=pf.gTwoAt+1))return;
var c=gShared(ctx,a,b);
if(c)hit={b:b,c:c};
});
return hit;
}
function gHeat(a){return a.tr.jealous*0.55+a.tr.cp*0.35+a.tr.impulse*0.2-a.tr.np*0.2;}
function gTwoKind(a,b){
var h=gHeat(a);
if(a.tr.ac>0.62&&h<0.6)return'sulk';
if(h>0.58&&gHeat(b)>0.45)return'grab';
if(h>0.46)return'press';
return'spar';
}
var G_TWO={
spar:[
'{a}は{b}の隣に座り直して、にこやかにグラスを差し出した。{a}「{c}とは、いつから？｜{c}とは、いつからだ｜{c}とは、いつからですか？」{b}「今日から｜今日からだ｜今日からです」――二人は笑顔のまま、音を立てずにグラスを触れ合わせた。',
'{a}と{b}は、{c}を挟んで同じタイミングで取り皿を差し出した。{a}「どうぞ、お先に」{b}「いえ、そちらこそ」声は柔らかいのに、二人の目はまったく笑っていなかった。',
'{a}は{b}に聞こえるように、{c}の好きな食べ物を注文した。{b}はそれに張り合うように、{c}の好きな曲の話を始めた。テーブルの上で、静かな点の取り合いが続いた。'
],
grab:[
'{a}が{c}の右腕を取ると、{b}がすかさず左腕を取った。{a}「{c}は、私と帰る｜＝｜{c}は、私と帰ります」{b}「決めるのは{c}でしょ｜決めるのは{c}だ｜決めるのは{c}です」二人に挟まれて、{c}は身動きが取れなくなった。',
'{a}は{c}の肩を抱き寄せて、{b}をまっすぐ見た。{b}は一歩も引かずに、{c}の手を握った。{a}「先に付き合ったのは、私｜先に付き合ったのは、私だ｜先に付き合ったのは、私です」{b}「順番は関係ないよ｜順番は関係ない｜順番は関係ありません」二人の声が、だんだん大きくなっていった。',
'{a}と{b}は、{c}の隣の席を巡って立ったまま睨み合った。周りの会話が、一つずつ止まっていった。{b}「座るなら、どうぞ」{a}「遠慮はしないよ｜遠慮はしない｜遠慮はしません」'
],
press:[
'{a}は{c}を廊下に呼び出した。{a}「{b}とも付き合ってるって、本当？｜{b}とも付き合っているというのは、本当か｜{b}とも付き合ってるって、本当ですか？」{c}が言葉を探すあいだ、{a}は腕を組んだまま一度も目を逸らさなかった。',
'{a}はグラスを置いて、{c}に向き直った。{a}「私と{b}、どっちが本気か答えて｜私と{b}、どちらが本気か答えろ｜私と{b}、どっちが本気か答えてください」テーブルの向こうで、{b}も箸を止めて{c}の答えを待っていた。',
'トイレから戻った{c}を、{a}が席の手前で待っていた。{a}「さっき{b}に、私に向けるのと同じ顔をしてた｜さっき{b}に、私に向けるのと同じ顔をしていた｜さっき{b}に、私に向けるのと同じ顔をしてました」声は低く、少しも震えていなかった。'
],
sulk:[
'{a}は、{c}と{b}が笑い合うのを向かいの席から見ていた。何か言おうとして、言葉の代わりにウーロン茶を一口飲んだ。グラスを握る指先だけが、白くなっていた。',
'{b}が{c}の耳元で何か囁いた。{a}はそれに気づかないふりをして、メニューを何度もめくった。同じページを、もう三度は見ていた。',
'{a}「楽しそう｜楽しそうだな｜楽しそうですね」――{a}はそれだけ言って、{c}と{b}から目を逸らした。その一言のほかは、誰とも話さなかった。{a}の前の料理は、ほとんど手つかずのまま冷めていった。'
]
};
var G_TWO_C={
soothe:[
'{c}は二人の顔を交互に見た。{c}「どっちも大事だから、喧嘩はしないでほしい｜どちらも大事だ。喧嘩はしないでくれ｜どっちも大事なので、喧嘩はしないでほしいです」その言葉で、空気はかえって冷たくなった。',
'{c}は慌てて二人のグラスにビールを注ぎ足した。{c}「ほら、今日は楽しく飲もう｜今日は楽しく飲むぞ｜ほら、今日は楽しく飲みましょう」笑ったのは、{c}だけだった。',
'{c}は二人の間に割って入って、両方の手を握った。{c}「ちゃんと話すから、今はやめよう｜ちゃんと話す。今はやめろ｜ちゃんと話しますから、今はやめましょう」{a}も{b}も、その手を握り返さなかった。'
],
shrink:[
'{c}は小さくなった。{c}「ごめん、ごめん｜すまない、悪かった｜すみません、すみません」誰に向けた「ごめん｜すまない｜すみません」なのか、{c}自身にも分からなかった。',
'{c}はおろおろと二人の顔を見比べた。言い訳を言いかけては飲み込み、結局何も言えなかった。その沈黙が、二人の苛立ちをさらに煽った。',
'{c}は耳まで赤くして、グラスの縁ばかり見ていた。{c}「こんなつもりじゃなかった｜こんなつもりではなかった｜こんなつもりじゃなかったんです」{a}も{b}も、その言葉を信じてはいなかった。'
],
dodge:[
'{c}は笑って、話題を王様ゲームに切り替えようとした。誰もそれには乗らなかった。{c}だけが、何事もない顔でスマホをいじっていた。',
'{c}は肩をすくめた。{c}「今日はそういう話、なしにしない？｜今日はそういう話は、なしにしないか｜今日はそういう話、なしにしませんか？」はぐらかされたのは、{a}にも{b}にも分かった。',
'{c}は涼しい顔をしていた。{c}「どっちとも付き合ってる。何か問題？｜どちらとも付き合っている。何か問題か｜どっちとも付き合ってます。何か問題ですか？」テーブルが一瞬で静まり返り、{a}と{b}は初めて同じ顔をした。'
]
};
var G_TWO_END=[
'{a}は長いため息をついた。{a}「もういい。{b}と、どうぞお幸せに｜もういい。{b}と幸せになれ｜もういいです。{b}と、どうぞお幸せに」そう言って、{a}は{c}の手を離した。',
'{a}はグラスに残った酒を飲み干した。{a}「別れよう。二番目でいるのは、無理｜別れる。二番目でいるのは、無理だ｜別れましょう。二番目でいるのは、無理です」{c}は、引き止める言葉を見つけられなかった。',
'{a}はしばらく黙っていたが、やがて静かに立ち上がった。{a}「今日で終わりにする｜＝｜今日で終わりにします」その一言だけを残して、{a}は席を移った。'
];
var G_HOLD={
self:[
'{a}は{b}に何か言いかけて、口をつぐんだ。スマホの待ち受けには、恋人の写真がまだ残っていた。{a}「……なんでもない｜＝｜……なんでもないです」{a}は笑って、グラスを持ち直した。',
'{a}は{b}を店の外に誘い出したところで、足を止めた。{a}「ごめん。今の私が言っていいことじゃなかった｜すまない。今の私が言っていいことではなかった｜すみません。今の私が言っていいことじゃなかったです」{b}はその意味を察して、黙って頷いた。',
'{a}は{b}への言葉を、喉の奥で何度か転がした。けれど、恋人の顔が先に浮かんだ。{a}はその言葉を、ビールと一緒に飲み込んだ。'
],
other:[
'{a}が想いを告げると、{b}は少し困ったように笑った。{b}「ありがとう。でも、私には付き合ってる人がいる｜ありがとう。だが、私には付き合っている人がいる｜ありがとうございます。でも、私には付き合ってる人がいます」{a}は頷いて、ぎこちなくグラスを空けた。',
'{a}の言葉を、{b}は最後まで聞いてから首を振った。{b}「その気持ちは嬉しい。でも、恋人を裏切ることはできない｜その気持ちは嬉しい。だが、恋人を裏切ることはできない｜その気持ちは嬉しいです。でも、恋人を裏切ることはできません」{b}の声は、思ったよりずっと穏やかだった。',
'{a}が想いを口にしかけたところで、{b}がそっと手を上げて止めた。{b}「それ以上は、聞かないでおく。恋人がいるから｜それ以上は、聞かない。恋人がいる｜それ以上は、聞かないでおきます。恋人がいますから」{a}は伸ばしかけた手を、テーブルの下に戻した。'
]
};
var GC_TWO={
rage:[
'翌朝、{a}のスマホに、{b}と{c}が一緒に帰る写真が届いた。{a}はすぐに{b}へ電話をかけた。{a}「説明して｜説明しろ｜説明してください」三人の関係は、その朝から一気にこじれ始めた。',
'{a}は、{b}が{c}と店を出ていくのを見ていた。その夜、{a}から{b}へのメッセージは二十件を超えた。最後の一件には、「{c}にも会わせて｜{c}にも会わせろ｜{c}にも会わせてください」とあった。',
'次の週末、{a}は{c}を呼び出した。{a}「{b}は私の恋人。手を引いて｜{b}は私の恋人だ。手を引け｜{b}は私の恋人です。手を引いてください」{c}「それは{b}が決めること｜それは{b}が決めることだ｜それは{b}が決めることです」三人のグループチャットは、その日から修羅場になった。'
],
cold:[
'{a}は、{b}が{c}と帰っていったことを翌日の噂で知った。{a}は泣きもせず、怒りもしなかった。その日のうちに、{a}は{b}に別れのメッセージを送った。',
'{a}は、{b}と{c}が並んで歩いていく後ろ姿を、改札の向こうから見送った。{a}「分かった｜＝｜分かりました」誰にともなく呟いて、次の朝、{a}は{b}の連絡先を消した。',
'{b}から「昨日はごめん｜昨日はすまなかった｜昨日はすみませんでした」とメッセージが届いた。{a}が返したのは、「{c}とお幸せに」の一言だけだった。それきり、{a}から連絡が来ることはなかった。'
],
ache:[
'{a}は、{b}が{c}と帰ったことに気づいていた。それでも翌朝、{a}は何も知らないふりをして「おはよう｜＝｜おはようございます」と送った。返事を待つあいだ、{a}は何度もスマホを伏せては、また表に返した。',
'{a}は一人で終電に乗り、窓に映る自分の顔をぼんやり見ていた。{b}の隣にいたのが{c}だったことを、何度も思い出した。問い詰める勇気は、まだ湧かなかった。',
'{a}は{b}に「楽しかった？｜楽しかったか｜楽しかったですか？」とだけ送った。{c}のことは、一言も書かなかった。既読がついたまま、返事はなかなか来なかった。'
],
both:[
'{b}には、この夜のうちに恋人が二人になっていた。{a}と{c}は、互いの存在を知ったまま、それぞれの電車に乗った。どちらも、{b}を手放すつもりはなかった。',
'{a}と{c}は、どちらも{b}の恋人として店を出た。駅前で三人の足が止まり、気まずい沈黙が流れた。{b}「また連絡する｜＝｜また連絡します」{b}は二人に、まったく同じ言葉を言った。',
'翌日から、{b}のスマホには{a}と{c}のメッセージが交互に届くようになった。二人とも、相手より先に返事が来るかを気にしていた。{b}の二股は、合コンの夜をまたいで続いていくことになった。'
]
};
var WALK_LOVE=[
'改札の前で、{a}が足を止めた。「また会いたい。今度は、二人で｜また会いたい。今度は、二人でだ｜また会いたいです。今度は、二人で」――{b}は笑って頷いた。その場で、次の約束が決まった。',
'駅までの道で、{a}の手の甲が何度も{b}の手に触れた。三度目で、{b}のほうから指を絡めた。「……付き合う？｜……付き合うか｜……付き合いますか？」「うん｜ああ｜はい」',
'終電を一本見送って、{a}と{b}はホームのベンチで話し込んだ。次の電車が来る前に、二人は恋人になっていた。',
'「今日のこと、酔ってたからって忘れないでね｜今日のことを、酔っていたからと忘れるな｜今日のこと、酔っていたからといって忘れないでくださいね」と{b}が言った。{a}は「忘れない。ちゃんと付き合いたい｜忘れない。ちゃんと付き合いたい｜忘れません。ちゃんと付き合いたいです」と返した。'
];
var G_CONFESS=[
'トイレから戻る廊下で、{a}は{b}を呼び止めた。「今日、来てよかった。……{b}に会えたから｜今日、来てよかった。……{b}に会えたからだ｜今日、来てよかったです。……{b}さんに会えましたから」',
'店の外の自販機の前で、{a}は{b}に向き直った。「酔った勢いって思われてもいい。好きになった｜酔った勢いと思われてもいい。好きになった｜酔った勢いだと思われてもいいです。好きになりました」',
'席替えのあと、{a}はテーブルの下で{b}の指先に触れた。「このあと、ちゃんと言いたいことがある。……好き、かもしれない｜このあと、ちゃんと言いたいことがある。……好きだ、たぶん｜このあと、ちゃんと言いたいことがあります。……好き、かもしれません」',
'{a}は{b}のグラスに自分のグラスを当てて、小さな声で言った。「初対面でこんなこと言うの、変かな。……付き合ってほしい｜初対面でこんなことを言うのは、変だろうか。……付き合ってほしい｜初対面でこんなこと言うの、変でしょうか。……付き合ってほしいです」',
'盛り上がる声に紛れて、{a}は{b}の耳元に口を寄せた。「さっきから、{b}のことしか見てない｜さっきから、{b}のことしか見ていない｜さっきから、{b}さんのことしか見ていません」',
'取り皿を渡すふりをして、{a}は{b}にだけ聞こえる声で言った。「次は、二人で会いたい。……恋人になってほしい｜次は、二人で会いたい。……恋人になってくれ｜次は、二人で会いたいです。……恋人になってほしいです」'
];
var G_YES=[
'{b}は一瞬目を丸くして、それから笑った。「……同じこと、考えてた｜……同じことを、考えていた｜……同じことを、考えていました」',
'{b}は返事の代わりに、{a}の指をきゅっと握り返した。',
'{b}は耳まで赤くして頷いた。「じゃあ、今日から、ね｜では、今日からだ｜では、今日から、ですね」',
'{b}はスマホを差し出した。「連絡先、一番上にピン留めしといて｜連絡先、一番上にピン留めしておけ｜連絡先、一番上にピン留めしておいてください」'
];
var G_NO=[
'{b}は困ったように笑った。「今日会ったばかりだし……まずは友達から、じゃだめ？｜今日会ったばかりだ……まずは友達から、ではだめか｜今日会ったばかりですし……まずは友達から、ではだめですか？」',
'{b}は「酔ってるでしょ｜酔っているだろう｜酔っているでしょう」と笑って、{a}の額を指でつついた。',
'{b}は少し黙ってから、「ごめん｜すまない｜すみません」と小さく言った。'
];
var G_CONFESS_K=G_CONFESS.filter(function(t){return!/初対面/.test(t);}).concat([
'{a}は{b}のグラスに自分のグラスを当てて、小さな声で言った。「ずっと前から知ってるのに、こんな場所で言うの、変かな。……付き合ってほしい｜ずっと前から知っているのに、こんな場所で言うのは、変だろうか。……付き合ってほしい｜ずっと前から知っているのに、こんな場所で言うのは、変でしょうか。……付き合ってほしいです」'
]);
var G_NO_K=G_NO.filter(function(t){return!/会ったばかり/.test(t);}).concat([
'{b}は困ったように笑った。「今の関係のままがいい……じゃ、だめ？｜今の関係のままがいい……では、だめか｜今の関係のままがいいです……じゃ、だめですか？」'
]);
var GC_OPEN={
yes:[
'終電のアナウンスが流れ、カラオケの部屋の明かりが落ちた。{n}人の合コンは、駅前のロータリーで解散になった。最後に誰かが「楽しかった｜＝｜楽しかったです」と言い、何人かが頷いた。',
'二次会のカラオケは、最後の一曲を歌い切って終わった。終電間際の改札の前で、幹事が「今日はありがとう｜＝｜今日はありがとうございました」と頭を下げた。それで、この夜の合コンはお開きになった。',
'終電の時刻が近づいて、誰からともなく上着を手に取った。カラオケ店の前で写真を一枚だけ撮った。{n}人の夜は、そこで解散になった。'
],
no:[
'「じゃあ、そろそろ｜では、そろそろ｜では、そろそろ失礼します」という幹事の一言で、一次会がお開きになった。店の前の歩道で、{n}人は軽く手を振り合った。二次会の話は、誰も言い出さなかった。',
'会計を済ませて店の外に出ると、夜風が少し冷たかった。二次会には行かず、合コンはその場で解散になった。それぞれの帰り道が、店の前で分かれた。',
'店員がラストオーダーを告げに来て、宴はそこで締めになった。暖簾をくぐって外に出ると、通りはもう静かだった。{n}人の合コンは、そこで終わった。'
]
};
var GC_PAIR={
cage:[
'{a}と{b}の席は、いつの間にか空になっていた。{a}が{b}の手を引いて店を出ていくところを、誰も見ていなかった。{b}の電話は、その夜ずっとつながらなかった。',
'お開きの時間には、{a}と{b}の姿はもうなかった。二人は途中で店を抜けていた。{a}の部屋の鍵は、内側から閉まったままだった。',
'{a}は{b}を連れて、途中で店を出た。幹事が送ったメッセージには、最後まで既読がつかなかった。二人がどこへ行ったのか、店に残った誰も知らない。'
],
keep:[
'{a}と{b}は、最初から決まっていたように同じタクシーに乗った。恋人どうしの二人にとって、この合コンは少し長い寄り道だった。次の週末の約束は、もう決まっていた。',
'{a}と{b}は並んで店を出て、同じ部屋に帰っていった。周りに冷やかされても、二人は手を離さなかった。恋人のまま、二人の夜は終わった。',
'{b}の上着を{a}が持って、二人は一緒にタクシーを拾った。合コンの席では他人のふりをしていたが、帰り道はいつもの恋人どうしだった。二人の関係は、何も変わらなかった。'
],
lover:[
'{a}と{b}は、同じタクシーで夜の街に消えた。次の朝には、二人は恋人どうしとして同じ駅に向かっていた。合コンで生まれた恋は、そのまま続いていくことになった。',
'{a}と{b}は二人で店を出て、それきり戻らなかった。朝が来るころ、二人は「付き合おう｜付き合う｜付き合いましょう」と言い合っていた。この合コンは、二人にとって始まりの夜になった。',
'{a}と{b}を乗せたタクシーのテールランプが、角を曲がって見えなくなった。あの夜をきっかけに、二人は付き合い始めた。グループチャットには、あとで二人の写真が貼られた。'
],
fwb:[
'{a}と{b}は同じタクシーに乗って帰った。恋人にはならなかったが、「またね｜また会おう｜では、また会いましょう」の約束だけが残った。二人は、名前のつかない関係に落ち着いた。',
'{a}と{b}は、店を出たあと同じ部屋で夜を明かした。朝になっても、二人は「好き｜＝｜好きです」とは言わなかった。それでも連絡は、ときどき続くことになった。',
'{a}と{b}の夜は、恋人の夜ではなかった。次に会う約束は、決めないまま別れた。二人のあいだには、気楽で曖昧な関係だけが残った。'
],
forget:[
'{a}と{b}は同じタクシーに乗った。けれど次の朝、二人はその夜のことを口にしなかった。合コンの記憶は、二人のあいだでだけ曖昧なまま閉じられた。',
'{a}と{b}の夜は、一度きりで終わった。翌朝のメッセージは、短い「おつかれ｜＝｜おつかれさまでした」だけだった。二人はそれきり、元の他人に戻った。',
'{a}と{b}は、店を出たあと同じ部屋に帰った。朝の光の中で、二人は目を合わせずに身支度をした。あの夜は、なかったことになった。'
],
unsure:[
'{a}と{b}は同じタクシーで帰った。あの夜が何だったのか、二人ともまだ言葉にできていない。連絡先の一番上には、互いの名前が残った。',
'{a}と{b}の夜は明けた。「これって何なんだろうね｜これは何なんだろうな｜これは何なんでしょうね」と言い合ったが、答えは出なかった。二人の関係は、まだ決まらないまま続いていく。',
'{a}と{b}は、朝の駅で別れた。次の約束をするかどうか、二人とも決めかねていた。合コンの夜の続きは、まだ書きかけのままだった。'
],
walkLove:[
'駅まで一緒に歩いた{a}と{b}は、改札の前で恋人になっていた。それぞれの電車に乗ってからも、メッセージは途切れなかった。二人の恋は、合コンの帰り道から始まった。',
'{a}と{b}は、帰り道の途中で想いを確かめ合った。家に着くまで、二人は電話をつないだままだった。二人にとって、今夜は付き合い始めた日になった。',
'終電の窓越しに、{a}は{b}に手を振った。{b}も、ホームから大きく振り返した。恋人になったばかりの二人の夜は、そこで静かに終わった。'
],
couple:[
'店の中で想いを伝え合った{a}と{b}は、手を繋いで駅に向かった。改札の前で、二人はなかなか手を離せなかった。恋人どうしになった二人は、次の約束をしてから別れた。',
'{a}と{b}は、皆に冷やかされながら二人で帰っていった。合コンの席で始まった恋は、駅までの道でもう当たり前の顔をしていた。二人の帰り道は、恋人の帰り道だった。',
'{a}と{b}は同じ方向の電車に乗った。並んで吊り革につかまり、降りる駅までずっと話していた。この夜の合コンは、二人が恋人になった夜として残った。'
],
walk:[
'{a}と{b}は同じ方向の電車に乗った。恋人にはならなかったが、また会う理由はできた。降りる駅で、二人は少しだけ名残惜しそうに手を振った。',
'{a}と{b}は駅まで一緒に歩いた。その先の約束はまだないが、連絡先は交換した。二人にとって、悪くない夜の終わりだった。',
'{a}と{b}は改札の前で「またね｜また会おう｜では、また会いましょう」と言い合った。友達以上かどうかは、まだ分からない。二人の合コンは、静かな余韻を残して終わった。'
]
};
var GC_SOLO={
crash:[
'{a}は最後まで酔いが抜けず、誰かの肩を借りてタクシーに乗せられた。翌朝のことは、ほとんど覚えていなかった。グループチャットの写真で、{a}は自分の醜態を知った。',
'{a}は店の前でしゃがみ込んだまま、しばらく立てなかった。結局、幹事が家の前まで送り届けた。{a}の合コンは、酔いつぶれて終わった。',
'{a}はタクシーの中で眠ってしまった。運転手に起こされたとき、もう家の前だった。誰と何を話したのか、{a}の記憶は途中で途切れていた。'
],
leave:[
'{a}は解散の声と同時に、まっすぐ駅へ向かった。目標どおり、誰とも寄り道しなかった。家に着くと、{a}はすぐに靴を脱いでソファに倒れ込んだ。',
'{a}は「おつかれ｜＝｜おつかれさまでした」とだけ言って、誰よりも早く改札を抜けた。電車の中で、{a}はやっと肩の力を抜いた。{a}にとって、合コンは無事に終わった仕事だった。',
'{a}は二次会の誘いをかわして、一人で帰った。帰り道のコンビニで、好きなアイスを買った。{a}の夜は、それでちょうどよかった。'
],
jilt:[
'{a}は、{b}がほかの人と帰っていくのを、改札の向こうから見送った。声をかけるきっかけは、最後まで来なかった。{a}は一人で電車に乗った。',
'{a}は{b}の後ろ姿が見えなくなるまで、駅の前に立っていた。スマホを開いて、送りかけたメッセージを消した。{a}の合コンは、片想いのまま終わった。',
'{a}は、{b}と最後に交わした会話を思い返しながら帰った。{b}の隣にいたのは、自分ではなかった。{a}は終電の窓に額をつけて、目を閉じた。'
],
alone:[
'{a}は一人で電車に乗った。窓に映る自分の顔が、少しだけ赤かった。誰とも帰らなかったが、悪い夜ではなかった。',
'{a}は駅で皆と別れて、一人で家路についた。今夜交換した連絡先を、ひとつずつ眺めた。次につながるかどうかは、まだ分からない。',
'{a}は帰り道、コンビニで水を一本買った。今夜の会話を思い出して、一人で小さく笑った。{a}の合コンは、そこで終わった。'
]
};
var GC_LAST={
love:[
'こうして、この夜の合コンは{k}組の恋人を残して終わった。',
'あの夜の合コンから、{k}組の恋人が生まれた。グループチャットはしばらく、その話題で持ちきりになった。',
'この合コンは、{k}組の恋が始まった夜として、皆の記憶に残った。'
],
pair:[
'恋人は生まれなかったが、一緒に帰った組はあった。この夜の合コンは、それぞれに少しずつ何かを残して終わった。',
'誰が誰と帰ったのか、翌日のグループチャットで小さな噂になった。それも、この合コンの締めくくりだった。',
'この夜の合コンは、恋人こそ生まれなかったものの、次の約束をいくつか残して終わった。'
],
none:[
'結局、誰も誰とも帰らなかった。グループチャットに残った集合写真だけが、この夜の名残になった。',
'この夜の合コンは、誰とも結ばれないまま幕を閉じた。翌日、幹事から「また飲もう｜また飲むか｜また飲みましょう」とだけメッセージが届いた。',
'全員がそれぞれの電車で帰り、合コンは何事もなく終わった。恋は始まらなかったが、それもまた一つの結末だった。'
]
};
var G_SOUR={
end:[
'一次会の終わり、{a}は{b}を店の外に呼び出した。{a}「やっぱり、私たちは合わないと思う｜＝｜やっぱり、私たちは合わないと思います」――{b}は言い返そうとして、やめた。店に戻ったとき、二人はもう恋人ではなかった。',
'{a}と{b}は、帰り支度の途中で小さく言い争った。きっかけは些細なことだったが、{a}は最後に「付き合うの、やめよう｜付き合うのは、やめにしよう｜お付き合いは、やめにしましょう」と言った。{b}は黙って頷き、二人は別々の電車で帰った。',
'店を出る前に、{a}は{b}にだけ聞こえる声で別れを告げた。{b}は笑おうとして、うまく笑えなかった。二人の恋は、店の明かりが消える前に終わった。'
],
mend:[
'{a}と{b}は、店を出る前に外で少しだけ話した。{a}「さっきは、言いすぎた｜＝｜さっきは、言いすぎました」{b}「……私も｜……私もだ｜……私もです」――ぎこちないまま、二人は手をつなぎ直した。',
'{a}はおしぼりを畳みながら、{b}に小さく謝った。{b}はしばらく黙っていたが、やがて{a}のグラスに自分のグラスを当てた。仲直りは、それで十分だった。',
'{a}は帰り際、{b}の袖をそっと引いた。言い争ったことには触れずに、二人は並んで店を出た。気まずさは、駅に着くころには薄れていた。'
]
};
function gSour(ctx,P,used){
for(var i=0;i<P.length;i++)for(var j=i+1;j<P.length;j++){
var a=P[i],b=P[j],pf=ctx.pair(a,b);
if(!pf.couple||used[a.i]||used[b.i])continue;
var ab=R(ctx,a,b),ba=R(ctx,b,a),lo=Math.min(ab.aff,ba.aff);
if(lo>=0)continue;
var x=ab.aff<=ba.aff?a:b,y=x===a?b:a;
if(HK.Dark&&HK.Dark.skip(ctx,'breakup')){
ab.aff=Math.max(ab.aff,4);ba.aff=Math.max(ba.aff,4);
ctx.say({kind:'event',cat:'bond',text:ctx.t(ctx.pick(G_SOUR.mend),x,y),actors:[x,y],mag:18,why:'恋人どうしの'+x.name+'から'+y.name+'への好意が冷えていた（'+Math.round(lo)+'）。展開の重さ「穏やか」で、別れずに仲直りした'});
continue;
}
delete pf._polyUndo;
pf.couple=false;pf.gSour=true;pf.brokeAt=ctx.stepIndex;
var e=ctx.say({kind:'event',cat:'conflict',text:ctx.t(ctx.pick(G_SOUR.end),x,y),actors:[x,y],mag:24,why:'恋人どうしのまま、'+x.name+'から'+y.name+'への好意が冷えきった（'+Math.round(lo)+'）。店を出る前に別れた'});
if(e&&e.n!=null)pf.moments.push({n:e.n,mag:24});
}
}
function gCloseTwo(ctx,P,T){
if(HK.Poly&&HK.Poly.mode(ctx)==='secret')return;
P.forEach(function(b){
var ps=P.filter(function(o){return o!==b&&ctx.pair(b,o).couple;});
if(ps.length<2||ps.every(function(o){return gTie(ctx,b,o);}))return;
var nt=null;
T.forEach(function(t){if(t.newLove&&(t.a===b.i||t.b===b.i))nt=ctx.chars[t.a===b.i?t.b:t.a];});
var a,c,k;
if(nt&&ps.indexOf(nt)>=0){
c=nt;
var rest=ps.filter(function(o){return o!==c;}).sort(function(x,y){return(gTie(ctx,b,y)-gTie(ctx,b,x))||(gHeat(y)-gHeat(x));});
a=rest[0];
var h=gHeat(a);
k=h>0.58?'rage': !gTie(ctx,a,b)&&(a.tr.cold>0.55||(h>0.42&&a.tr.np<0.4))?'cold':'ache';
if(k==='cold'&&HK.Dark.skip(ctx,'breakup'))k='ache';
}else{
c=ps.filter(function(o){return!gTie(ctx,b,o);})[0];
a=ps.filter(function(o){return o!==c;})[0];k='both';
}
var why='結末：'+b.name+'には恋人が二人（'+a.name+'・'+c.name+'）。二股の夜のあと／'+a.name+'の嫉妬・執着 '+Math.round(a.tr.jealous*100)+'・CP '+Math.round(a.eg.CP);
if(k==='cold'){
var pf=ctx.pair(a,b);
pf.couple=false;pf.gTwoBroke=true;
a.fateNote=(a.fateNote||'')+'。'+b.name+'とは別れた';
why+='。'+a.name+'は別れを選んだ';
}else if(k==='rage')why+='。'+a.name+'は黙っていなかった';
else if(k==='ache')why+='。'+a.name+'は問い詰められずにいる';
b.fateNote=(b.fateNote||'')+(k==='cold'?'。'+a.name+'に振られた':'。恋人が二人になった');
ctx.say({kind:'event',cat:'conflict',text:ctx.t(ctx.pick(GC_TWO[k]),a,b,c),actors:[a,b,c],mag:26,why:why});
});
}
function gClose(ctx,P,used){
var T=(ctx.flags.together||[]).filter(function(t){return ctx.chars[t.a]&&ctx.chars[t.b];});
var second=ctx.env.second==='yes';
ctx.label=second?'終電のあと':'お開きのあと';
ctx.say({kind:'step',cat:'phase',text:ctx.label});
var nHere=P.filter(function(c){return!T.some(function(t){return t.cage&&(t.a===c.i||t.b===c.i);});}).length;
ctx.say({text:ctx.pick(GC_OPEN[second?'yes':'no']).replace(/\{n\}/g,nHere+(ctx.gkMob?ctx.gkMob.length:0)),mag:25,why:'結末：'+(second?'二次会のあと、終電で解散':'一次会でお開き')});
var loves=0,kinds=[];
T.forEach(function(t){
var a=ctx.chars[t.a],b=ctx.chars[t.b],pf=ctx.pair(a,b),k;
if(t.cage){kinds.push('cage');ctx.say({text:ctx.t(ctx.pick(GC_PAIR.cage),a,b),actors:[a,b],mag:25,cageOk:true,why:'結末：途中で店を抜けた二人（'+a.name+'による監禁）'});return;}
if(t.night)k=t.outc==='keep'?'keep':t.outc==='fwb'?'fwb':t.outc==='forget'?'forget':(t.outc==='lover'||pf.couple)?'lover':'unsure';
else k=t.walk?'walkLove':pf.couple?'couple':'walk';
if(k==='lover'||k==='walkLove'||k==='couple')loves++;
kinds.push(k);
ctx.say({text:ctx.t(ctx.pick(GC_PAIR[k]),a,b),actors:[a,b],mag:25,why:'結末：一緒に帰った二人（'+{keep:'もとから恋人',lover:'恋人になった',fwb:'恋人ではない関係',forget:'なかったことに',unsure:'まだ決まらない',walkLove:'帰り道で恋人に',couple:'店で恋人に',walk:'一緒に帰っただけ'}[k]+'）'});
});
gCloseTwo(ctx,P,T);
var solos=P.filter(function(c){return!used[c.i];}),shown=solos.slice(0,4),rest=solos.slice(4);
shown.forEach(function(c){
var cr=ctx.crush(c,45),k,b=null;
if(c.fate==='潰れた')k='crash';
else if(cr&&used[cr.i]){k='jilt';b=cr;}
else if(c.goal&&c.goal.id==='leave')k='leave';
else k='alone';
ctx.say({text:ctx.t(ctx.pick(GC_SOLO[k]),c,b),actors:[c],mag:25,why:'結末：一人で帰った（'+{crash:'酔いつぶれた',jilt:(b?b.name:'')+'はほかの人と帰った',leave:'目標「早く帰りたい」',alone:'誰とも帰らなかった'}[k]+'）'});
});
if(rest.length)ctx.say({text:names(rest)+'も、それぞれの電車で帰っていった。誰の手にも、今夜交換した連絡先が少しずつ残っていた。',actors:rest,mag:25});
var lk=loves?'love':T.length?'pair':'none';
ctx.say({text:ctx.pick(GC_LAST[lk]).replace(/\{k\}/g,loves===1?'一':loves===2?'二':loves===3?'三':String(loves)),mag:25,why:'結末：恋人になった組 '+loves+'／一緒に帰った組 '+T.length});
if(!ctx.flags.outcome){
var head=second?'合コンは終電で解散':'合コンはお開き',tail;
if(!T.length)tail='誰も誰とも帰らなかった';
else{
var LV={lover:1,walkLove:1,couple:1},lp=T.filter(function(t,i){return LV[kinds[i]];});
var nmOf=function(l){return l.slice(0,2).map(function(t){return ctx.chars[t.a].name+'と'+ctx.chars[t.b].name;}).join('、')+(l.length>2?'ほか':'');};
var T2=T.filter(function(t,i){return kinds[i]!=='cage';}),k2=kinds.filter(function(k){return k!=='cage';}),cg=T.filter(function(t){return t.cage;});
if(lp.length)tail=nmOf(lp)+'が恋人になった';
else if(!T2.length)tail=nmOf(cg)+'が途中で店を抜けた';
else if(k2.every(function(k){return k==='keep';}))tail=nmOf(T2)+'（恋人どうし）が一緒に帰った';
else tail=nmOf(T2)+(k2.every(function(k){return k!=='walk';})?'が同じタクシーで帰った':'が一緒に帰った');
if(cg.length&&T2.length)tail+='。'+nmOf(cg)+'は途中で店を抜けた';
}
ctx.flags.outcome=head+' ― '+tail;
}
}
add({
id:'goukon',name:'合コン',kicker:'恋愛・社交',
desc:'居酒屋の個室で一晩。酒が回るほど本音と衝動が出る。最後に誰と帰ったかで決着。',
unit:'時刻',preRel:0,lethal:false,
catBias:{romance:1.7},
derived:['impulse','honesty','warmth','jealous'],
env:[
{id:'alcohol',label:'酒の進み',min:0,max:100,def:55,lo:'ソフドリ',hi:'飲み放題の暴走'},
{id:'mood',label:'場の空気',min:0,max:100,def:55,lo:'しらけ',hi:'盛り上がり'},
{id:'second',label:'二次会',type:'select',def:'yes',options:[{v:'yes',label:'カラオケまで行く'},{v:'no',label:'一次会で解散'}]},
{id:'kingsgame',label:'王様ゲーム',type:'select',def:'yes',options:[{v:'yes',label:'やる'},{v:'no',label:'やらない'}]},
{id:'mobs',label:'モブの参加者',min:0,max:4,def:0,lo:'なし',hi:'4人',unit:'人',desc:'幹事の友達・数合わせなど、住人ではない参加者。席を埋めて会話や王様ゲームに加わり、二人の仲を取り持ったり、当て馬になったり、割って入ったりするが、誰の恋人にも夜の相手にもならない'}
],
stats:[
{id:'drink',label:'酒の強さ',desc:'低いほど早く酔い、衝動性が上がる'},
{id:'looks',label:'見た目の自信',desc:'高いほど相手の第一印象（惹かれ）が上がる'}
],
actions:[
{id:'watch',label:'端の席で様子見',fit:function(t){return t.caution;},bias:{solo:1.8,romance:0.7,bond:0.8}},
{id:'mc',label:'幹事として場を回す',fit:function(t){return t.lead*0.6+t.warmth*0.4;},bias:{bond:1.6,conflict:1.2}},
{id:'seat',label:'狙いの相手の隣を確保',fit:function(t){return t.impulse*0.6+t.honesty*0.4;},bias:{romance:1.8}},
{id:'eat',label:'食べることに集中',fit:function(t){return t.cold*0.5+t.fc*0.3;},bias:{solo:1.5,romance:0.6}}
],
goals:[
{id:'lover',label:'恋人を作る',fit:function(t){return t.honesty*0.5+t.ac*0.3;},bias:{romance:1.8}},
{id:'friends',label:'友達を増やす',fit:function(t){return t.warmth;},bias:{bond:1.6,romance:0.7}},
{id:'takehome',label:'誰かを持ち帰る',fit:function(t){return t.impulse*0.7+t.cold*0.3;},bias:{romance:2.2,bond:0.7}},
{id:'leave',label:'早く帰りたい',fit:function(t){return t.cold*0.6+t.caution*0.2;},bias:{solo:2,bond:0.6,romance:0.4}},
{id:'cupid',label:'誰かの恋を応援する',fit:function(t){return t.np*0.8;},bias:{help:2},needsFocus:true}
],
steps:function(env){
var s=['19:00 乾杯','19:40 自己紹介','20:20 盛り上がり','21:00 席替え','21:40 王様ゲーム','22:20 一次会終了'];
if(env.kingsgame==='no')s[4]='21:40 宴たけなわ';
if(env.second==='yes')s.push('23:00 二次会・カラオケ','24:00 終電');
else s.push('22:40 店の前');
return s;
},
setup:function(ctx){
ctx.place='居酒屋の個室';
var rf=gRom(ctx);
ctx.chars.forEach(function(c){
c.flags.drunk=0;c.baseTr=JSON.parse(JSON.stringify(c.tr));
ctx.others(c).forEach(function(o){if(HK.canLove(o,c))ctx.R(o,c).att=HK.clamp(ctx.R(o,c).att+(ctx.stat(c,'looks')-3)*6+(8+ctx.rng()*16)*rf,0,100);});
});
},
phase:function(ctx,s){
var P=ctx.present(),rng=ctx.rng;
if(s===0)ctx.say({text:names(P)+'がグラスを合わせた。'+(ctx.env.mood>60?'最初から妙に空気がいい。':ctx.env.mood<35?'乾杯の声が少しだけ揃わなかった。':'')});
if(s===0&&HK.Attr&&HK.Attr.meetScene)HK.Attr.meetScene(P,ctx);
if(s===3&&P.length>2){
var sh=rng.shuffle(P);
for(var i=0;i+1<sh.length;i+=2){
ctx.R(sh[i],sh[i+1]).att+=4;ctx.R(sh[i+1],sh[i]).att+=4;
}
ctx.say({text:'席替え。'+sh.map(function(c){return c.name;}).join('、')+'の順に座り直した。'});
}
if(s===4&&ctx.env.kingsgame==='yes'&&P.length>=2){
var two=rng.shuffle(P).slice(0,2),a=two[0],b=two[1];
if(HK.ngPair(a,b)){var okp=[];P.forEach(function(x,i){P.slice(i+1).forEach(function(y){if(!HK.ngPair(x,y))okp.push([x,y]);});});if(!okp.length)return;var pr=okp[rng.int(okp.length)];a=pr[0];b=pr[1];}
var lines=['見つめ合って10秒','ポッキーゲーム','相手のいいところを3つ言う'];
var order=rng.pick(lines);
ctx.k=1;ctx._mag=0;ctx._touched={};
var shyA=a.tr.ac>0.6,shyB=b.tr.ac>0.6;
ctx.mod2(a,b,{att:shyA?12:7},{att:shyB?12:7});
var txt='王様の命令で、'+a.name+'と'+b.name+'が「'+order+'」をすることになった。';
if(a.tr.cp>0.7||b.tr.cp>0.7){txt+=(a.tr.cp>b.tr.cp?a.name:b.name)+'は最後まで渋い顔をしていた。';ctx.mod2(a,b,{ten:6},{ten:6});}
else if(shyA||shyB)txt+=(shyA?a.name:b.name)+'の耳が赤い。';
else txt+='二人とも案外ノリノリだった。';
var e=ctx.say({kind:'event',cat:'romance',actors:[a,b],text:txt,why:'王様ゲーム（ランダム）。反応はCP・ACで分かれる',mag:ctx._mag});
ctx.pair(a,b).moments.push({n:e.n,mag:e.mag});
}
},
after:function(ctx){
ctx.present().forEach(function(c){
c.stress=HK.clamp(c.stress+3+c.tr.ac*6-c.tr.fc*2+(ctx.crush(c,50)?2:0),0,100);
var gain=ctx.env.alcohol/100*(6-ctx.stat(c,'drink'))*(2+ctx.rng()*4);
c.flags.drunk=HK.clamp(c.flags.drunk+gain,0,100);
c.tr.impulse=HK.clamp(c.baseTr.impulse+c.flags.drunk/220);
c.tr.honesty=HK.clamp(c.baseTr.honesty+c.flags.drunk/260);
c.tr.a=HK.clamp(c.baseTr.a-c.flags.drunk/300);
});
},
classify:function(ctx,A,B,pf){
if(pf.kill)return null;
if(!pf.couple&&(pf.gSour||pf.gTwoBroke))return{id:'breakup'};
if(pf.couple){
var ab=ctx.R(A,B),ba=ctx.R(B,A);
if(ab.aff>=0&&ba.aff>=0&&(ab.ten>70||ba.ten>70))return{id:'lovers'};
}
return null;
},
finish:function(ctx){
var P=ctx.present(),used={},rng=ctx.rng,out=[];
var SOFT_END={
keep:['朝、二人は何事もなかったように並んで歯を磨いた。','翌朝、二人はいつもより少し長く、玄関でキスをした。'],
lover:['朝、二人は「ちゃんと付き合おう｜ちゃんと付き合う｜ちゃんと付き合いましょう」と言い合った。','翌朝の二人は、もう恋人の顔をしていた。'],
fwb:['朝、二人は「またね｜また会おう｜では、また会いましょう」とだけ言って別れた。恋人ではない「また」だった。','二人とも、「好き｜＝｜好きです」とは言わなかった。'],
forget:['翌朝、二人は昨夜のことをなかったことにした。','朝になると、二人は他人の顔に戻っていた。'],
unsure:['連絡先だけは交換した。その先は、まだ決まっていない。','「これって何なんだろうね｜これは何なんだろうな｜これは何なんでしょうね」――答えは、まだ出ていない。']
};
function tieHas(a,b,t){return HK.Ties&&HK.Ties.has?HK.Ties.has(ctx,a,b,t):false;}
function nightOutcome(ctx,a,b,fwb){
var pf=ctx.pair(a,b),ab=R(ctx,a,b),ba=R(ctx,b,a),mutual=Math.min(ab.aff,ba.aff),dry=(a.tr.cold+b.tr.cold)/2;
if(fwb)return'fwb';
if(HK.lockSexOnly&&HK.lockSexOnly(a,b))return tieHas(a,b,'fwb')?'fwb':'forget';
if(tieHas(a,b,'lover')||tieHas(a,b,'mate'))return'keep';
if(pf.couple)return'lover';
var imp=(a.tr.impulse+b.tr.impulse)/2,warm=(a.tr.warmth+b.tr.warmth)/2;
if(mutual>=46-rf*8&&Math.min(ab.att,ba.att)>=58-rf*8&&warm>0.36)return!gSecond(ctx,a,b)||rng()<G_SECOND_PASS?'lover':'unsure';
if(mutual<26||dry>0.56||(tieHas(a,b,'rival')&&mutual<36)||(imp>0.72&&mutual<36))return'forget';
return'unsure';
}
ctx.chars.forEach(function(b){
if(b.flags.caged==null||b.alive===false)return;
var a=ctx.chars[b.flags.caged];
if(!a||a.alive===false||a.out)return;
used[a.i]=used[b.i]=1;
a.fate=b.fate='途中で抜けた';
a.fateNote=b.name+'を連れて、途中で店を出た（監禁）';
b.fateNote=a.name+'に連れ出され、途中で店を出た（監禁）';
b.flags.cageDone=true;
(ctx.flags.together=ctx.flags.together||[]).push({a:a.i,b:b.i,night: !!ctx.pair(a,b).night,cage:true});
});
gSour(ctx,P,used);
var rf=gRom(ctx),cand=[];
for(var i=0;i<P.length;i++)for(var j=i+1;j<P.length;j++){
var a=P[i],b=P[j],ab=R(ctx,a,b),ba=R(ctx,b,a);
var v=Math.min(ab.att,ba.att)+Math.min(ab.aff,ba.aff)*0.5+(ctx.pair(a,b).couple?30:0);
cand.push({a:a,b:b,v:v});
}
cand.sort(function(x,y){return y.v-x.v;});
cand.forEach(function(c){
var so=HK.lockSexOnly&&HK.lockSexOnly(c.a,c.b),ca=so?Object.assign({},c.a,{lock:null,locks:null}):c.a,cb=so?Object.assign({},c.b,{lock:null,locks:null}):c.b;
var fs= !!(HK.State.freeSex&&HK.State.freeSex(ctx,c.a,c.b));
if(used[c.a.i]||used[c.b.i])return;
if(fs){
var dr=((c.a.flags.drunk||0)+(c.b.flags.drunk||0))/200,im0=(c.a.tr.impulse+c.b.tr.impulse)/2;
if(rng()>=HK.clamp(0.25+dr*0.5+im0*0.35,0,0.9)*0.5*HK.FreeSex.factor(ctx,c.a,c.b))return;
}else if(c.v<55-rf*20|| !HK.canLove(ca,cb)|| !HK.canLove(cb,ca))return;
if(ctx.pair(c.a,c.b).kin)return;
if(ctx.pair(c.a,c.b).gSour)return;
if(so&& !(HK.Pos&&HK.Pos.okSex(c.a,c.b)))return;
used[c.a.i]=used[c.b.i]=1;
var imp=(c.a.tr.impulse+c.b.tr.impulse)/2;
var night=so||fs||(imp>0.55&&rng()<imp*0.9*(HK.Pos&&HK.Pos.libMul?HK.Pos.libMul([c.a,c.b]):1));
if(night&&((HK.sexBlocked&&HK.sexBlocked(c.a,c.b))||(HK.Pos&&HK.Pos.libOK&& !HK.Pos.libOK([c.a,c.b]))))night=false;
if(night)ctx.pair(c.a,c.b).night=true;
c.a.fate=c.b.fate=night?'お持ち帰り':'一緒に帰った';
var tg={a:c.a.i,b:c.b.i,night:night};
(ctx.flags.together=ctx.flags.together||[]).push(tg);
c.a.fateNote=c.b.name+'と'+(night?'同じ部屋に帰った':'同じ方向の電車に乗った');
c.b.fateNote=c.a.name+'と'+(night?'同じ部屋に帰った':'同じ方向の電車に乗った');
ctx.k=1;ctx._mag=0;ctx._touched={};
ctx.mod2(c.a,c.b,{att:10,aff:6},{att:10,aff:6});
var fwbNow=night&& !fs&& !ctx.pair(c.a,c.b).couple&& !tieHas(c.a,c.b,'lover')&& !tieHas(c.a,c.b,'mate')&&HK.FWB&&HK.FWB.decide(ctx,c.a,c.b);
var outc=fs?'fwb':night?nightOutcome(ctx,c.a,c.b,fwbNow):null;
if(outc){var on={keep:'恋人どうしの夜を過ごした',lover:'そのまま付き合うことになった',fwb:'恋人ではない関係に落ち着いた',forget:'翌朝、なかったことにした',unsure:'関係はまだ決まっていない'}[outc];c.a.fateNote+='。'+on;c.b.fateNote+='。'+on;}
var gn=night&&HK.GoukonNight?HK.GoukonNight(ctx,c.a,c.b,outc):null;
var wasCouple= !!ctx.pair(c.a,c.b).couple;
if(outc==='lover'||outc==='keep')ctx.pair(c.a,c.b).couple=true;
var walkLove= !night&& !ctx.pair(c.a,c.b).couple&&Math.min(R(ctx,c.a,c.b).aff,R(ctx,c.b,c.a).aff)>=36-rf*6&&Math.min(R(ctx,c.a,c.b).att,R(ctx,c.b,c.a).att)>=50-rf*6;
if(walkLove&&gSecond(ctx,c.a,c.b)&&rng()>=G_SECOND_PASS)walkLove=false;
tg.outc=outc;tg.walk=walkLove;tg.newLove= !wasCouple&&(outc==='lover'||walkLove);
if(walkLove){ctx.pair(c.a,c.b).couple=true;c.a.fateNote+='。帰り道で付き合うことになった';c.b.fateNote+='。帰り道で付き合うことになった';}
if(outc==='forget')ctx.pair(c.a,c.b).forgot=true;
var e=ctx.say({kind:'event',cat:'romance',sex: !!night,actors:[c.a,c.b],text:night?c.a.name+'と'+c.b.name+'は、店を出たあと同じタクシーに乗った。'+(fs?HK.FreeSex.lead(ctx,c.a,c.b):'')+(gn?gn.text:'その先のことは、二人しか知らない。')+(gn?'':(function(){
var tb=HK.Pos?HK.Pos.order(c.a,c.b,[c.a,c.b]):[c.a,c.b];
if(HK.SAFE_ON)return ctx.t(rng.pick(['――翌朝、{a}は二人分のコーヒーを淹れた。{b}は寝ぐせのまま、照れくさそうにそれを受け取った。','――翌朝、{b}は{a}の部屋の窓から、知らない街の景色を眺めていた。{a}は後ろから「おはよう｜＝｜おはようございます」とだけ言った。','――翌朝、二人は駅まで並んで歩いた。昨夜より、少しだけ距離が近かった。']),tb[0],tb[1]);
return ctx.t(rng.pick(['――翌朝、{b}は少しだけ腰をかばうように歩いていた。{a}はそれに気づいて、黙って{b}の荷物を持った。','――翌朝、{a}の背中には{b}の爪の痕が残っていた。{b}は目を合わせずに「……強すぎ｜……強すぎる｜……強すぎです」とだけ言った。','――翌朝、{b}は{a}のシャツを着たまま、ベッドから起き上がれずにいた。','――翌朝、{a}は先に起きて、まだ眠っている{b}の髪をそっと撫でた。']),tb[0],tb[1]);
})())+(!gn&&outc?rng.pick(SOFT_END[outc]):''):c.a.name+'と'+c.b.name+'は駅まで一緒に歩いた。'+(walkLove?ctx.t(rng.pick(WALK_LOVE),c.a,c.b):(ctx.pair(c.a,c.b).couple?'繋いだ手を、改札の前でなかなか離せなかった。':'改札で別れるのに少し時間がかかった。')),why:(fs?HK.FreeSex.why(c.a,c.b)+'／酔い':'互いの惹かれ（'+Math.round(Math.min(R(ctx,c.a,c.b).att,R(ctx,c.b,c.a).att))+'）')+(night?'と酔いによる衝動性':'')+(gn?'／夜：'+gn.label:outc?'／その後：'+{keep:'恋人のまま',lover:'恋人になる',fwb:'セフレに落ち着く',forget:'なかったことにする',unsure:'まだ答えが出ない'}[outc]:''),mag:25});
ctx.pair(c.a,c.b).moments.push({n:e.n,mag:25});
if(fs){HK.FreeSex.mark(ctx,c.a,c.b);HK.FreeSex.jealous(ctx,c.a,c.b);}
if(fwbNow){
HK.FWB.mark(ctx,c.a,c.b);
var e2=ctx.say({kind:'event',cat:'romance',sex:true,actors:[c.a,c.b],text:'翌朝。'+HK.FWB.after(ctx,c.a,c.b),why:'二人とも「恋人より気楽な関係」寄り（ドライさ・衝動性）',mag:15});
ctx.pair(c.a,c.b).moments.push({n:e2.n,mag:15});
}
});
P.forEach(function(c){
if(used[c.i])return;
if(c.flags.drunk>88){c.fate='潰れた';c.fateNote='最後は誰かに肩を借りて帰った';}
else{c.fate='一人で帰った';c.fateNote=c.goal.id==='leave'?'目標どおり、さっさと帰った':'終電の窓に映る自分の顔を見ていた';}
out.push(c);
});
gClose(ctx,P,used);
},
events:[
{
id:'drink',cat:'solo',scope:'solo',
w:function(ctx,a){return ctx.env.alcohol/100*(0.4+a.tr.fc*0.5+a.stress/120);},
run:function(ctx,a){
a.flags.drunk=HK.clamp(a.flags.drunk+12*(6-ctx.stat(a,'drink'))/3,0,100);
return{text:ctx.t(a.flags.drunk>70?'{a}の呂律が怪しくなってきた。':'{a}のグラスがまた空になった。',a),why:'酒の強さ '+ctx.stat(a,'drink')+'／酔い '+Math.round(a.flags.drunk)};
}
},
{
id:'nurse',cat:'help',scope:'pair',
when:function(ctx,a,b){return b.flags.drunk>55;},
w:function(ctx,a,b){return a.tr.np*1.3;},
run:function(ctx,a,b){
ctx.mod2(a,b,{aff:3,att:3},{aff:10,trust:10,att:6});
return{text:ctx.t('{a}は酔った{b}に水を渡し、上着を取ってやった。',a,b),why:a.name+'のNP（'+Math.round(a.eg.NP)+'）と'+b.name+'の酔い'};
}
},
{
id:'contact',cat:'romance',scope:'pair',
when:function(ctx,a,b){return R(ctx,a,b).att>25&& !ctx.pair(a,b).contact;},
w:function(ctx,a){return 0.4+a.tr.honesty*0.8;},
run:function(ctx,a,b){
var rb=R(ctx,b,a);
ctx.pair(a,b).contact=true;
if(rb.att<12&&b.tr.cold>0.6){
ctx.mod(a,b,{att: -4});
return{text:ctx.t('{a}が連絡先を聞いた。{b}は「あとでグループに貼っといて｜あとでグループに貼っておけ｜あとでグループに貼っておいてください」とかわした。',a,b),why:b.name+'のドライさ、'+a.name+'への関心の薄さ'};
}
ctx.mod2(a,b,{att:6,trust:3},{att:6,trust:3});
return{text:ctx.t('{a}と{b}が連絡先を交換した。',a,b),why:a.name+'の積極性（本音の出やすさ）'};
}
},
{
id:'wingman',cat:'help',scope:'pair',
when:function(ctx,a,b){var c=ctx.crush(b,45);return c&&c!==a&&c.alive&& !c.out&& !HK.ngPair(b,c);},
w:function(ctx,a,b){return(a.tr.np*0.7+a.tr.fc*0.3)*(a.focus===b?2.5:1);},
run:function(ctx,a,b){
var c=ctx.crush(b,45);
ctx.mod(b,a,{trust:8,aff:5});
ctx.mod2(b,c,{att:6},{att:7,aff:4});
if(R(ctx,a,c).att>35){ctx.mod(a,c,{att:4});ctx.stress(a,12);}
return{with:[c],text:ctx.t('{a}はさりげなく席を立ち、{b}と{c}を二人きりにした。',a,b,c),why:a.name+'のNP'+(R(ctx,a,c).att>35?'。ただし'+a.name+'自身も'+c.name+'が気になっていた':'')};
}
},
{
id:'outside',label:'二人で外の空気を吸いに抜け出す',cat:'romance',scope:'pair',
when:function(ctx,a,b){return R(ctx,a,b).att>35&&R(ctx,b,a).att>20;},
w:function(ctx,a){return 0.3+a.tr.impulse*0.9;},
run:function(ctx,a,b){
ctx.mod2(a,b,{att:9,trust:5,aff:4},{att:9,trust:5,aff:4});
return{text:ctx.t('「ちょっと外の空気吸ってくる｜少し外の空気を吸ってくる｜少し外の空気を吸ってきます」と言った{a}に、{b}がついてきた。戻ってくるまで十五分かかった。',a,b),why:'互いの惹かれと'+a.name+'の衝動性'};
}
},
{
id:'g_confess',label:'合コンの席で想いを告げる',cat:'romance',scope:'pair',
when:function(ctx,a,b){var pf=ctx.pair(a,b);return ctx.stepIndex>=2&&HK.canLove(a,b)&& !pf.couple&& !pf.gconf&& !pf.kin&&(!gTaken(ctx,a)||(HK.Poly&&HK.Poly.mode(ctx)!=='none'))&&R(ctx,a,b).att>44-gRom(ctx)*12;},
w:function(ctx,a,b){return(0.4+a.tr.honesty*0.7+a.tr.impulse*0.4+R(ctx,a,b).att/100)*(a.goal.id==='lover'?1.8:1);},
run:function(ctx,a,b){
var d=gRom(ctx),rb=R(ctx,b,a),pf=ctx.pair(a,b);
var yes=HK.canLove(b,a)&&(!gTaken(ctx,b)||(HK.Poly&&HK.Poly.mode(ctx)!=='none'))&&(!HK.Poly||HK.Poly.canCouple(ctx,a,b))&& !HK.lockOut(b,a)&&rb.att>36-d*10&&rb.aff>8-d*6;
pf.gconf=true;
if(yes){pf.couple=true;ctx.mod2(a,b,{att:8,aff:10,trust:6},{att:8,aff:10,trust:6});}
else{ctx.mod2(a,b,{att: -3},{aff:2});ctx.stress(a,10);}
var kn= !!(HK.GoukonRel&&HK.GoukonRel.known(ctx,a,b));
return{text:ctx.t(ctx.pick(kn?G_CONFESS_K:G_CONFESS)+ctx.pick(yes?G_YES:kn?G_NO_K:G_NO),a,b),why:a.name+'の惹かれ（'+Math.round(R(ctx,a,b).att)+'）と本音の出やすさ。'+b.name+'の惹かれ（'+Math.round(rb.att)+'）・好意（'+Math.round(rb.aff)+'）'+(yes?'。その場で恋人に':''),mag:yes?26:16};
}
},
{
id:'g_two',label:'同じ相手をめぐって恋敵とぶつかる',cat:'conflict',scope:'solo',pri:true,
when:function(ctx,a){return!!gRivalOf(ctx,a)&& !(HK.Poly&&HK.Poly.mode(ctx)==='secret');},
w:function(ctx,a){return 0.8+a.tr.jealous*1.8+a.tr.cp*0.6+a.tr.impulse*0.3;},
run:function(ctx,a){
var rv=gRivalOf(ctx,a),b=rv.b,c=rv.c,pf=ctx.pair(a,b),pc=ctx.pair(a,c),rc=R(ctx,a,c);
var k=gTwoKind(a,b),h=gHeat(a);
pf.gTwo=(pf.gTwo||0)+1;pf.gTwoAt=ctx.stepIndex;
ctx.mod2(a,b,{ten:8+h*14,aff: -4-h*6},{ten:6+gHeat(b)*12,aff: -3});
ctx.mod(a,c,{trust:k==='sulk'? -4: -7,ten:k==='press'||k==='grab'?8:3});
ctx.stress(a,k==='sulk'?14:9);ctx.stress(c,12);
if(HK.Obsess&&HK.Obsess.feed)HK.Obsess.feed(ctx,a,c,4+Math.round(h*6));
var ck=c.tr.np>0.55&&c.tr.np>=c.tr.cold?'soothe':c.tr.cold>0.55||c.tr.ac<0.3?'dodge':'shrink';
var t=ctx.pick(G_TWO[k])+ctx.pick(G_TWO_C[ck]);
var keep=rc.aff*0.8+rc.trust*0.4+a.tr.np*35+a.tr.ac*10-a.tr.cp*25-a.tr.jealous*35-(ck==='dodge'?15:0)+15;
var end=k==='press'&& !gTie(ctx,a,c)&&keep<ctx.rng()*100*HK.Dark.f(ctx,'breakup');
if(end){pc.couple=false;pc.gTwoBroke=true;ctx.mod2(a,c,{aff: -14,ten:10},{aff: -4,ten:6});t+=ctx.pick(G_TWO_END);}
var KN={spar:'笑顔のさや当て',grab:c.name+'の取り合い',press:c.name+'を問い詰めた',sulk:'何も言えずに見ていた'},CN={soothe:'なだめようとした（NP）',shrink:'縮こまった',dodge:'はぐらかした（ドライさ）'};
return{text:ctx.t(t,a,b,c),with:[b,c],mag:end?32:24,
why:'二股：'+c.name+'の恋人が二人（'+a.name+'・'+b.name+'）。'+a.name+'の嫉妬・執着 '+Math.round(a.tr.jealous*100)+'・CP '+Math.round(a.eg.CP)+'・AC '+Math.round(a.eg.AC)+'→'+KN[k]+'／'+c.name+'は'+CN[ck]+(end?'／'+a.name+'はその場で別れを選んだ':'')};
}
},
{
id:'phone',cat:'solo',scope:'solo',
w:function(ctx,a){return a.tr.cold*0.6*(1.2-ctx.env.mood/100);},
run:function(ctx,a){
ctx.others(a).forEach(function(o){ctx.mod(o,a,{aff: -3});});
return{text:ctx.t('{a}はテーブルの下でスマホを見ていた。',a),why:a.name+'のドライさと場の空気'};
}
},
{
id:'monopolize',cat:'conflict',scope:'pair',
when:function(ctx,a,b){var c=ctx.crush(b,40);return c&&c!==a;},
w:function(ctx,a){return a.tr.fc*a.tr.cp*1.4;},
run:function(ctx,a,b){
var c=ctx.crush(b,40);
ctx.mod(a,c,{att:3});
ctx.mod(b,a,{ten:12,aff: -6});
return{with:[c],text:ctx.t('{a}が{c}との会話を独占した。{b}は相槌を打つしかなかった。',a,b,c),why:a.name+'のFC×CP（自分が中心にいたい）'};
}
}
]
});
var G_COUPLE_W={u_confess:1,pn_rival:1,pn_confess:1,fc_slip:1};
HK.wrap(HK,'buildPool',function(bp0){if(!bp0)return bp0;return function(scen){
var pool=bp0.apply(this,arguments);
if(!scen||scen.id!=='goukon')return pool;
return pool.map(function(e){
if(!e||e.scope!=='pair')return e;
if(e.id==='confess'){
var w=Object.create(e);
w.run=function(ctx,a,b){
if(!b|| !gSecond(ctx,a,b)||ctx.rng()<G_SECOND_PASS)return e.run.apply(this,arguments);
var p=ctx.pair(a,b),self=gOther(ctx,a,b)&& !gMulti(ctx,a);
if(p.confessed)p.confessed[a.i]=true;
ctx.stress(a,6);ctx.mod2(a,b,{att: -2},{trust:3});
return{text:ctx.t(ctx.pick(G_HOLD[self?'self':'other']),a,b),why:(self?a.name:b.name)+'にはもう恋人がいる。二股にはならなかった（'+a.name+'の惹かれ '+Math.round(R(ctx,a,b).att)+'）',mag:14};
};
return w;
}
if(G_COUPLE_W[e.id]&&typeof e.w==='function'){
var w2=Object.create(e);
w2.w=function(ctx,a,b){var v=e.w.apply(this,arguments);return b&&gSecond(ctx,a,b)?v*G_SECOND_PASS:v;};
return w2;
}
return e;
});
};});
})();
});
;
/* ==== js/mini-goukon.js ==== */
HK.Load.def(139,'js/mini-goukon.js',function(){
(function(){
'use strict';
var E=window.HK.E;
window.HK.addMini('goukon',[
E('g_pour','help','p+','np*.7+ac*.3','','ba:aff3,att2','{a}は{b}のグラスが空く前に、さりげなく注ぎ足した。|{a}は{b}の飲み物の残りを気にして、メニューを差し出した。|「次、何にする？｜次は何にする？｜次は何になさいますか？」{a}は{b}の空いたグラスに気づいて声をかけた。|{a}は瓶ビールのラベルを上にして、{b}に注いだ。|{a}は{b}のグラスの水滴を、おしぼりで拭った。|{a}は{b}の飲むペースに合わせて、自分のグラスを口に運んだ。'),
E('g_toast2','bond','p+','fc*.6+warmth*.3','','ab:aff3;ba:aff3','{a}が「二回目の乾杯！｜二回目の乾杯だ！｜二回目の乾杯をしましょう！」と{b}のグラスに自分のグラスを当てた。|{a}は{b}と目が合うたびにグラスを掲げた。|{a}は「{b}の明日に乾杯｜＝｜{b}さんの明日に乾杯しましょう」と意味の分からない音頭を取った。|{a}は{b}のグラスに自分のグラスを、わざと下の位置で当てた。|{a}は「乾杯し直し｜乾杯し直しだ｜乾杯し直しましょう」と言って{b}と二人だけでグラスを鳴らした。|{a}は{b}が何か言うたびに「それに乾杯｜＝｜それに乾杯しましょう」と言った。'),
E('g_strong','solo','s+','fc*.4+cp*.3+drunk/80','','as:-3','{a}は焼酎をロックで頼んだ。周りが少しざわついた。|{a}は日本酒の銘柄を三つ挙げて、店員を困らせた。|{a}は「まだ一杯目みたいなもん｜まだ一杯目のようなものだ｜まだ一杯目みたいなものです」と言って五杯目を頼んだ。|{a}はハイボールを水のように飲み干した。|{a}は「強いお酒ほど二日酔いしない｜強い酒ほど二日酔いしないものだ｜強いお酒ほど二日酔いしないんです」という持論を披露した。|{a}はテキーラを頼もうとして、隣に止められた。'),
E('g_soft','solo','s+','caution*.6+ac*.3','','as:-2','{a}は最後までウーロン茶を通した。|{a}は「明日早いから｜明日は早い｜明日早いんです」とノンアルコールを頼んだ。|{a}はカシスオレンジ一杯を、一時間かけて飲んでいた。|{a}は乾杯のビールに口をつけただけで、そっとグラスを遠ざけた。|{a}は誰にも気づかれないように、自分のグラスに水を足していた。|{a}は酔ったふりだけ上手かった。'),
E('g_drunktalk','bond','p+','drunk/60+honesty*.4','drunk>30','ab:trust4;ba:trust3,aff2','酔いの回った{a}が、{b}に「ここだけの話」を始めた。|{a}は{b}の肩に手を置いて、仕事の愚痴を一気にまくし立てた。|{a}は{b}に、初恋の人の名前をフルネームで教えた。|{a}は「あなた、いいやつだな｜あなたは、いいやつだ｜あなたは、いい人ですね」と{b}に三回言った。|{a}は{b}の顔を覗き込んで「何考えてるか分かんないよね｜何を考えているのか分からない｜何を考えているのか分からないですね」と笑った。|{a}は{b}に、誰にも言っていない夢の話をした。'),
E('g_drunk_cling','romance','p+','drunk/50+att/60','drunk>45&att>20','ab:att5;ba:att3','{a}は酔いに任せて、{b}の肩にもたれかかった。|{a}は{b}の腕にしがみついて、目を閉じてしまった。|{a}は{b}の袖を引っ張って「私、帰りたくない｜私は帰りたくない｜私、帰りたくないです」と言った。|{a}は{b}の膝の上に、こてんと頭を乗せた。|{a}は{b}の指に、自分の指を絡めて遊び始めた。|{a}は{b}の耳元で、何かを囁いて笑った。'),
E('g_water','help','p+','np*.6+a*.3','B.drunk>40','ba:aff4,trust4;bs:-4','{a}は{b}の前に、黙って水のグラスを置いた。|{a}は{b}のグラスを、こっそりウーロン茶にすり替えた。|{a}は{b}に「一回お手洗い行こ｜一度手洗いに行こう｜一度お手洗いに行きましょう」と声をかけて連れ出した。|{a}は{b}の分の水を、店員に三杯頼んだ。|{a}は{b}の背中をさすりながら「ゆっくりでいいよ｜ゆっくりでいい｜ゆっくりでいいですよ」と言った。|{a}は{b}の鞄を代わりに持った。'),
E('g_spill_secret','conflict','p+','drunk/60+fc*.3','drunk>40','ba:ten6,trust-5','{a}は酔った勢いで、{b}のあだ名の由来をばらした。|{a}は{b}の昔の失敗談を、身振りつきで再現した。|{a}は「{b}ってさ、実は｜{b}は、実はだな｜{b}って、実はですね」と言いかけて、{b}に口を塞がれた。|{a}は{b}の元恋人の話を、大声で始めた。|{a}は{b}の年収を当てようとして、ぴたりと当てた。|{a}は{b}のスマホの待ち受けを皆に見せて回った。'),
E('g_order','help','g','lead*.5+np*.3','','gab:trust2','{a}が皆の分をまとめて注文した。誰が何を飲むか、全部覚えていた。|{a}は店員を呼び止めて、取り皿と追加のおしぼりを頼んだ。|{a}は「とりあえず唐揚げとポテト｜とりあえず唐揚げとポテトだ｜とりあえず唐揚げとポテトをお願いします」と、場の空気を読んで注文した。|{a}は食べ物の減り具合を見て、次の皿を頼むタイミングを計っていた。|{a}はラストオーダーの時間を皆に伝えた。|{a}は誰も頼まないサラダを、黙って頼んだ。'),
E('g_serve','help','p+','np*.6+ac*.3','','ba:aff3;as:2','{a}はサラダを取り分けて、{b}の前に最初に置いた。|{a}は鍋の具を{b}の取り皿によそった。肉が多めだった。|{a}は{b}の皿に、最後の唐揚げを置いた。|{a}は{b}が苦手そうなパクチーを、そっと除けてやった。|{a}は焼き鳥を串から外して、{b}に「取りやすいように｜取りやすいようにした｜取りやすいようにしました」と差し出した。|{a}は{b}の分の刺身に、わさびを溶いた。'),
E('g_lastpiece','conflict','p+','fc*.5+aggr*.3','','ab:ten3;ba:ten4','最後の一切れに、{a}と{b}の箸が同時に伸びた。|{a}は{b}が狙っていた最後のだし巻きを、迷いなく食べた。|{a}と{b}は、最後の唐揚げをじゃんけんで争った。|{a}は「遠慮の塊」を一番に処理した。{b}が残念そうな顔をした。|{a}は{b}の皿から枝豆を一つ盗んだ。|{a}は{b}の頼んだデザートを一口だけと言って、半分食べた。'),
E('g_feed','romance','p+','impulse*.5+att/60+drunk/100','att>30','ab:att6;ba:att6','{a}が「あーん」と箸を差し出した。{b}は一瞬固まってから口を開けた。|{a}は{b}の口元についたソースを、指で拭った。|{a}は自分のアイスを一口すくって、{b}に差し出した。|{a}は{b}のフォークで、{b}のケーキを食べた。|{a}は{b}の皿から一口もらって「間接キス｜間接キスだ｜間接キスですね」と笑った。|{a}は{b}にポッキーの端を咥えさせようとした。'),
E('g_allergy','help','p+','a*.6+np*.3','','ba:trust6,aff3','{a}は{b}が甲殻類が苦手だと覚えていて、エビの皿を遠ざけた。|{a}は{b}の注文した料理の中身を、店員に確認した。|{a}は{b}が箸をつけていない皿に気づいて、別の料理を勧めた。|{a}は{b}の好物を、さっきの会話から覚えていた。|{a}は{b}が辛いものを避けていることに気づいていた。|{a}は{b}が食べられないものを、黙って自分の皿に移した。'),
E('g_foodie','bond','p+','fc*.5+a*.2','','ab:aff3;ba:aff3','{a}と{b}は、この店のポテトサラダの隠し味について真剣に議論した。|{a}は{b}に、駅の反対側にある美味いラーメン屋の話をした。|{a}と{b}は、唐揚げにレモンをかける派かどうかで盛り上がった。|{a}は{b}とお互いの地元の名物を言い合った。|{a}は{b}に「今度ここ、私と行こうよ｜今度ここへ、私と行こう｜今度ここ、私と行きましょう」と、スマホの写真を見せた。|{a}と{b}は、だし巻き卵の甘さで意見が割れた。'),
E('g_job','bond','p+','a*.4+warmth*.3','','ab:trust3;ba:trust3','{a}は{b}の仕事の話を、身を乗り出して聞いた。|{a}は{b}に、自分の職場の変な上司の話をした。|{a}と{b}は、同じ業界の知り合いがいることに気づいた。|{a}は{b}の職業を当てようとして、三回外した。|{a}は「その仕事、向いてそう｜その仕事は向いていそうだ｜その仕事、向いていそうですね」と{b}に言った。|{a}は{b}に、名刺の渡し方を真面目に教えようとした。'),
E('g_hometown','bond','p+','warmth*.6','','ab:aff3;ba:aff4','{a}と{b}は、同じ県の出身だと分かって方言で話し始めた。|{a}は{b}に、地元の何もなさを自虐的に語った。|{a}と{b}は、地元の駅前の再開発について熱く語り合った。|{a}は{b}の地元の名物を知っていて、{b}を喜ばせた。|{a}は{b}に、実家の猫の写真を見せた。|{a}と{b}は、上京したての頃の失敗談で笑い合った。'),
E('g_hobby','bond','p+','fc*.5+warmth*.3','','ab:aff4;ba:aff4','{a}と{b}の趣味が、まさかの同じマイナーなゲームだった。|{a}は{b}に、最近ハマっている登山の話をした。|{a}は{b}のおすすめの映画を、その場でメモした。|{a}は{b}に、推しのアイドルの良さを十分間語った。|{a}と{b}は、好きな漫画の最終回について熱く語り合った。|{a}は{b}に「今度一緒に行こう｜＝｜今度一緒に行きましょう」とライブのチケットの話をした。'),
E('g_horoscope','bond','p+','fc*.4+ac*.3','','ab:aff2;ba:aff2','{a}は{b}の血液型を当てて、得意げな顔をした。|{a}は{b}と星座の相性を調べて「最悪だって｜最悪だそうだ｜最悪だそうです」と笑った。|{a}は{b}に、MBTIは何かと訊いた。|{a}は{b}の手相を見て、適当なことを言った。|{a}は{b}の誕生日を聞いて「私と一日違い｜私と一日違いだ｜私と一日違いです」と騒いだ。|{a}は{b}との相性占いのアプリを開いた。'),
E('g_type','romance','p+','honesty*.5+att/70','','ab:att3;ba:att4','「好きなタイプは？｜好きなタイプは何だ？｜好きなタイプは何ですか？」{a}の質問に、{b}は少し考えてから答えた。|{a}は自分の好きなタイプを話しながら、{b}の方をちらりと見た。|{a}は「優しい人がいい｜＝｜優しい人がいいです」と言った。{b}は「みんなそう言う｜皆そう言う｜みんなそう言いますね」と笑った。|{a}は{b}に、理想のデートの話をさせた。|{a}は{b}の好きなタイプを聞いて、自分と一つも当てはまらないことに気づいた。|{a}は「笑い方が好きな人｜笑い方が好きな人だ｜笑い方が好きな人です」と答えて、{b}と目が合った。'),
E('g_ex','bond','p+','honesty*.5+drunk/100','','ab:trust4;ba:trust3','{a}は{b}に、元恋人と別れた理由を正直に話した。|{a}は「私、前の恋愛で懲りた｜私は前の恋愛で懲りた｜私、前の恋愛で懲りたんです」と言って、{b}に慰められた。|{a}は{b}の恋愛遍歴を聞いて「波乱万丈だね｜波乱万丈だ｜波乱万丈ですね」と言った。|{a}は{b}に、最後に恋人がいたのは三年前だと打ち明けた。|{a}と{b}は、浮気の線引きについて議論した。|{a}は{b}に「なんで別れたの？｜なぜ別れた？｜どうして別れたんですか？」とストレートに訊いた。'),
E('g_listen','help','p+','np*.6+a*.3','','ba:aff4,trust4','{a}は{b}の長い話を、遮らずに最後まで聞いた。|{a}は{b}の話に、ちょうどいい質問を挟んだ。|{a}は{b}が話し終えるまで、自分のグラスに口をつけなかった。|{a}は{b}が話に詰まったとき、言葉を拾ってやった。|{a}は{b}の話の細部まで覚えていて、あとで話題に出した。|{a}は{b}の話を聞きながら、何度も深く頷いた。'),
E('g_mansplain','conflict','p+','cp*.5+lead*.3-np*.3','','ba:ten6,aff-3','{a}は{b}の話を途中で遮って、自分の意見を言い始めた。|{a}は{b}の仕事に「それはさ｜それはだな｜それはですね」と説教を始めた。|{a}は{b}の好きな映画を「浅い｜＝｜浅いですね」と切り捨てた。|{a}は{b}の言い間違いを、いちいち訂正した。|{a}は{b}の話を、自分の武勇伝にすり替えた。|{a}は{b}に、年収と貯金額を訊いた。'),
E('g_brag','conflict','s+','cp*.4+fc*.3-ac*.2','','gab:aff-2;as:-2','{a}は自分の年収の話を、聞かれてもいないのに始めた。|{a}は有名人の知り合いがいる話を三回した。|{a}は自分の車の話を、車に興味のない人たちにした。|{a}は学生時代のモテ話を延々と続けた。|{a}は「私、こう見えて意外と｜私は、こう見えて意外と｜私、こう見えて意外とですね」と言って、意外でもない話をした。|{a}は海外旅行の写真をスライドショーのように見せた。'),
E('g_joke_fail','solo','s+','fc*.5+impulse*.3','','as:6','{a}の渾身のギャグが、完全に滑った。|{a}が言った下ネタに、誰も笑わなかった。|{a}はものまねを披露して、誰にも伝わらなかった。|{a}のダジャレのあと、三秒の沈黙が流れた。|{a}は自分で言った冗談に自分で笑って、一人だった。|{a}は「今の面白くない？｜今のは面白くないか？｜今の、面白くないですか？」と念を押して、さらに場を冷やした。'),
E('g_joke_hit','bond','g','fc*.6+a*.2','','gab:aff3','{a}の一言で、テーブル全体が爆笑した。|{a}の店員のものまねが、妙に似ていた。|{a}は場の空気を読んで、絶妙なタイミングでボケた。|{a}の失敗談に、皆が涙を流して笑った。|{a}は誰かの言い間違いを拾って、一晩中のネタにした。|{a}の自己紹介が、その日一番の盛り上がりを作った。'),
E('g_silence','help','g','np*.4+a*.3+lead*.2','','gab:trust2','会話が途切れた瞬間、{a}が新しい話題を振った。|{a}は沈黙に耐えかねて、自分の失敗談を差し出した。|{a}は「みんな、休みの日って何してる？｜皆、休みの日は何をしている？｜みなさん、休みの日は何をしていますか？」と全員に振った。|{a}は端に座っている人に話を振った。|{a}は盛り上がりの外にいる人を、さりげなく会話に引き入れた。|{a}は場が冷えるたびに、何かしらの話題を投げ込んだ。'),
E('g_quiet','solo','s+','ac*.4+cold*.3+caution*.3','','as:3','{a}は会話の輪に入るタイミングを、ずっと探していた。|{a}は相槌だけを打ちながら、時計をちらりと見た。|{a}はメニューを読み込むふりをしていた。|{a}は皆の話を聞きながら、黙って枝豆を剥いていた。|{a}は笑うタイミングを、隣の人に合わせていた。|{a}は誰かに話を振られるまで、ほとんど口を開かなかった。'),
E('g_compliment_style','romance','p+','np*.4+fc*.3+att/80','','ba:att5,aff2','{a}は{b}のピアスを「似合ってる｜似合っている｜似合っています」と褒めた。|{a}は{b}の声を「落ち着く｜＝｜落ち着きます」と言った。|{a}は{b}の指の長さを褒めて、少し変な空気にした。|{a}は{b}の笑顔を「反則｜反則だ｜反則です」と言った。|{a}は{b}の時計に気づいて「センスいいね｜センスがいい｜センスがいいですね」と言った。|{a}は{b}の字を見て「きれい｜きれいだ｜きれいです」と呟いた。'),
E('g_name','romance','p+','impulse*.4+warmth*.3+att/80','att>20','ab:att4;ba:att5','{a}は途中から、{b}を下の名前で呼び始めた。|{a}は{b}にあだ名をつけた。{b}はまんざらでもなさそうだった。|{a}は{b}の名前を、わざとゆっくり呼んだ。|{a}が{b}を呼び捨てにした瞬間、{b}がこちらを見た。|{a}は「なんて呼べばいい？｜何と呼べばいい？｜何とお呼びすればいいですか？」と{b}に訊いた。|{a}は{b}の名前の漢字を、テーブルに指で書かせた。'),
E('g_eye','romance','p+','att/50+ac*.2','att>25','ab:att4;ba:att3','{a}は{b}と目が合って、すぐに逸らした。|{a}はグラス越しに{b}を見ていた。|{a}は{b}が笑うたびに、つられて笑った。|{a}は{b}の話す口元ばかり見ていた。|{a}は{b}の視線に気づいて、髪を耳にかけ直した。|{a}と{b}の目が、テーブルの向こうで三回合った。'),
E('g_knee','romance','p+','impulse*.4+att/60','att>30','ab:att5;ba:att5','テーブルの下で、{a}の膝が{b}の膝に触れた。どちらも動かなかった。|{a}は{b}の隣に座り直した。肩が触れる距離だった。|{a}はおしぼりを取るふりをして、{b}の手に触れた。|{a}は{b}の背中越しに、メニューを覗き込んだ。|{a}は{b}の耳元で話すために、身を寄せた。|{a}の髪が、{b}の頬をかすめた。'),
E('g_jeal_look','conflict','p','jealous*.8+att/80','att>30','ab:ten5;as:6;jea','{a}は、{b}が別の誰かと笑い合っているのを横目で見ていた。|{a}は{b}が席を移ったことに、誰より早く気づいた。|{a}は{b}が他の人に連絡先を聞かれているのを見て、グラスを強く握った。|{a}は{b}の隣の席が埋まっていることに、小さく舌打ちした。|{a}は{b}の楽しそうな声を聞きながら、氷をかじった。|{a}は{b}が自分以外に見せる笑顔を、数えていた。'),
E('g_rival','conflict','p+','cp*.4+jealous*.4','ten>15','ab:ten6;ba:ten6','{a}と{b}は、同じ人の隣の席を巡って牽制し合った。|{a}は{b}の話に被せて、自分の話を始めた。|{a}は{b}より先に、店員を呼んだ。|{a}と{b}は、どちらがより面白い話をするかで張り合った。|{a}は{b}の冗談に、わざと笑わなかった。|{a}は{b}の自慢話に、もっと大きな自慢で返した。'),
E('g_defend_joke','help','p+','np*.5+cp*.3','B.stress>30','ba:aff5,trust5','{a}は{b}がいじられすぎているのに気づいて、話題を変えた。|{a}は「それ以上はやめとこ｜それ以上はやめておけ｜それ以上はやめておきましょう」と{b}をかばった。|{a}は{b}への失礼な質問を、笑って遮った。|{a}は{b}に振られた無茶ぶりを、自分で引き受けた。|{a}は{b}が困っているのを見て、「トイレ行かない？｜手洗いに行かないか？｜お手洗いに行きませんか？」と連れ出した。|{a}は{b}の言いにくそうな沈黙を、代わりに埋めた。'),
E('g_game_yamanote','bond','g','fc*.6+lead*.2','n>2','gab:aff2','{a}が山手線ゲームを始めた。お題は「元カノの名前」だった。|{a}は古今東西ゲームで、毎回一番最初に詰まった。|{a}がNGワードゲームを提案し、自分が真っ先にアウトになった。|{a}は英語禁止ゲームで、三秒でアウトになった。|{a}は「せーのでピース」ゲームで全員を負かした。|{a}はしりとりで「る」攻めを仕掛けて嫌われた。'),
E('g_game_lose','solo','s+','fc*.3+impulse*.3','','as:4;drunk:0','{a}はゲームに負けて、一気飲みをさせられた。|{a}は罰ゲームで、隣の人の良いところを三つ言わされた。|{a}は罰ゲームで、初恋の話をさせられた。|{a}は罰ゲームで、一番最近の検索履歴を読み上げた。|{a}は罰ゲームで、店員さんに「今日のおすすめ」を聞きに行かされた。|{a}は罰ゲームで、変顔の写真を撮られた。'),
E('g_game_pair','romance','p+','fc*.4+att/70','','ab:att5;ba:att5','ゲームの罰で、{a}と{b}は十秒見つめ合うことになった。|{a}と{b}は「好きなところを三つ言い合う」罰を受けた。|{a}と{b}は、ゲームの罰で恋人つなぎをさせられた。|{a}と{b}は、ゲームで同じチームになって息がぴったり合った。|{a}は罰ゲームで{b}の頬をつついた。|{a}と{b}は罰で、互いの第一印象を正直に言わされた。'),
E('g_game_cheat','conflict','p+','fc*.4+cold*.3','','ba:ten5','{a}はゲームでズルをして、{b}に見抜かれた。|{a}は{b}が負けるように、こっそりルールを変えた。|{a}は{b}の答えを先に言って、横取りした。|{a}は{b}にばかり無茶ぶりを回した。|{a}は{b}の罰ゲームを、勝手に重くした。|{a}は{b}の言い間違いを、執拗にアウト判定した。'),
E('g_photo','bond','g','fc*.5+warmth*.3','','gab:aff2','{a}がスマホを掲げて「集合写真撮ろう！｜集合写真を撮ろう！｜集合写真を撮りましょう！」と言った。|{a}は料理の写真を撮るまで、誰にも箸をつけさせなかった。|{a}は全員の顔が入るように、腕を限界まで伸ばした。|{a}は撮った写真を、すぐにグループに送った。|{a}は自撮りの角度に異様にこだわった。|{a}は店員に「撮ってもらえる？｜撮ってもらえるか｜撮ってもらえますか？」と頼んだ。'),
E('g_selfie2','romance','p+','fc*.5+att/70','att>20','ab:att4;ba:att4','{a}は{b}と二人だけの写真を撮った。顔が近かった。|{a}は{b}の横顔を、こっそり撮った。|{a}は「盛れてる｜盛れている｜盛れています」と言って、{b}との写真を見せた。|{a}は{b}に「その写真、送って｜その写真を送ってくれ｜その写真、送ってください」と言われた。|{a}は{b}とのツーショットを、スマホのロック画面にしようか迷った。|{a}は{b}に「撮るよ｜撮るぞ｜撮りますよ」と言ってから、三枚連続でシャッターを押した。'),
E('g_noPhoto','solo','s+','cold*.4+caution*.4','','gab:aff-1','{a}は写真に写るのを嫌がって、撮る側に回った。|{a}は集合写真で、いつも端の方にいた。|{a}は「SNSにはあげないで｜SNSには上げるな｜SNSには上げないでください」と念を押した。|{a}は写真を撮られるたびに、手で顔を隠した。|{a}はカメラを向けられて、ぎこちない笑顔を作った。|{a}は写真が回ってくる前に、トイレに立った。'),
E('g_line_ask','romance','p+','honesty*.5+att/60','att>25','ab:att3;ba:att4','{a}は「グループ作るね｜グループを作る｜グループを作りますね」と言って、{b}のQRコードを読み込んだ。|{a}は{b}のアイコンの写真が何なのか訊いた。|{a}は{b}に、LINEのスタンプを一つ送りつけた。|{a}は{b}の連絡先を、トイレに立ったついでに聞いた。|{a}は「あとで写真送るから｜あとで写真を送る｜あとで写真を送りますね」と{b}の連絡先を手に入れた。|{a}は{b}に「インスタやってる？｜インスタはやっているか？｜インスタはやっていますか？」と訊いた。'),
E('g_line_secret','romance','p','att/50+honesty*.3','att>35','ab:att5;ba:att5;sec','{a}はテーブルの下で、{b}に個別でメッセージを送った。「このあと二人で抜けない？｜このあと二人で抜けないか？｜このあと二人で抜けませんか？」|{a}と{b}は、同じテーブルにいながらLINEでやりとりしていた。|{a}は{b}のスマホが光るたび、自分が送ったものだと知っていた。|{a}は{b}に「さっきの話、続きはあとで｜さっきの話の続きは、あとでしよう｜さっきの話の続きは、あとでしましょう」とメッセージを送った。|{a}は{b}にだけ、こっそりスタンプを送った。{b}は吹き出しそうになった。|{a}は{b}の既読がつくのを、横目で見ていた。'),
E('g_powder','solo','s+','ac*.4+att/100+caution*.2','','as:-5','{a}はトイレで化粧を直しながら、鏡の中の自分に「落ち着いて｜落ち着け｜落ち着いてください」と言った。|{a}はトイレの個室で、友達に実況のLINEを送った。|{a}は洗面所で、冷たい水で手首を冷やした。|{a}はトイレから戻る前に、深呼吸を三回した。|{a}は鏡の前で、自分の笑顔の練習をした。|{a}はトイレで、香水を少しだけ付け直した。'),
E('g_restroom_talk','bond','p+','warmth*.4+honesty*.3','','ab:trust5;ba:trust5;sec','トイレの前で鉢合わせた{a}と{b}は、「誰狙い？｜誰が狙いだ？｜誰が狙いですか？」と小声で作戦会議を始めた。|{a}は洗面所で{b}に「さっきの人、どう思う？｜さっきの人をどう思う？｜さっきの人、どう思いますか？」と訊いた。|{a}と{b}は、トイレの列に並びながら本音を言い合った。|{a}は{b}に「今日、来てよかった？｜今日は来てよかったか？｜今日、来てよかったですか？」と訊いた。|{a}と{b}は、トイレの鏡越しに目を合わせて笑った。|{a}は{b}に、今日の自分の失敗を報告した。'),
E('g_smoke','bond','p+','cold*.3+fc*.3','','ab:trust5;ba:trust5','{a}と{b}は、店の外の喫煙所で二人きりになった。|{a}は{b}に、ライターの火を差し出した。|{a}と{b}は、外の空気を吸いながら店内の噂話をした。|{a}は喫煙所で、{b}の意外な一面を知った。|{a}は{b}に「吸わないのに来たの？｜吸わないのに来たのか？｜吸わないのに来たんですか？」と訊かれた。|{a}と{b}は、夜風に当たりながら黙って空を見上げた。'),
E('g_seat_move','romance','p+','impulse*.5+att/60','att>25','ab:att4;ba:att3','{a}はグラスを持って、さりげなく{b}の隣に移動した。|{a}は「こっちの方が話しやすい｜こちらの方が話しやすい｜こちらの方が話しやすいです」と言って{b}の正面に座り直した。|{a}は席を立った隙に、{b}の隣のポジションを確保した。|{a}は{b}の隣の人に「席替わって｜席を替わってくれ｜席を替わってもらえますか？」と頼んだ。|{a}は戻ってきたとき、自分の席ではなく{b}の隣に座った。|{a}は{b}の隣に座るために、トイレのタイミングを計算していた。'),
E('g_staff','solo','s+','np*.4+warmth*.3','','as:-2','{a}は店員にいちいち「ありがとう｜＝｜ありがとうございます」と言っていた。|{a}は忙しそうな店員を見かねて、空いた皿をまとめた。|{a}は店員の名札を見て、名前で呼んだ。|{a}は注文を間違えた店員に「大丈夫だよ｜大丈夫だ｜大丈夫ですよ」と笑った。|{a}は店員とすっかり仲良くなって、サービスの一品をもらった。|{a}は店員の手書きのメニューを褒めた。'),
E('g_staff_rude','conflict','s','cp*.5+aggr*.3-np*.4','','gab:aff-4;as:-2','{a}は料理が遅いと、店員に強い口調で言った。|{a}は店員の注文ミスに、舌打ちをした。|{a}は店員に「早くして｜早くしろ｜早くしてください」と言って、場の空気を凍らせた。|{a}は店員を手で呼んだ。何人かが顔をしかめた。|{a}は店員に、タメ口で話し続けた。|{a}は料理の量に文句を言った。'),
E('g_phone_call','solo','s+','cold*.4+lead*.2','','gab:aff-2','{a}は仕事の電話で、十分ほど席を外した。|{a}はスマホの通知を、何度も確認していた。|{a}は「ごめん、ちょっと｜すまない、少し失礼する｜すみません、ちょっと失礼します」と言って、メールを一本返した。|{a}は電話の相手に「今、飲み会｜今は飲み会だ｜今、飲み会なんです」と面倒くさそうに言った。|{a}は誰かからのLINEに、小さく笑っていた。|{a}はテーブルの下でゲームのログインボーナスを受け取っていた。'),
E('g_deep','bond','p+','honesty*.4+a*.3','trust>15','ab:trust7,aff3;ba:trust7,aff3','{a}と{b}は、いつの間にか人生観の話をしていた。|{a}は{b}に「ちゃんと幸せ？｜ちゃんと幸せか？｜ちゃんと幸せですか？」と真顔で訊いた。|{a}と{b}は、親との関係について話し込んだ。|{a}は{b}に、将来の不安を打ち明けた。|{a}と{b}は、合コンの場にそぐわない真面目な話で盛り上がった。|{a}は{b}に「今日、ここに来た理由」を正直に話した。'),
E('g_lonely','bond','p+','ac*.4+honesty*.3+stress/100','','ab:trust5;ba:aff4','{a}は{b}に、休日にずっと一人でいることを話した。|{a}は{b}に「私、友達が結婚していって焦る｜私は、友達が結婚していって焦っている｜私、友達が結婚していって焦るんです」と漏らした。|{a}は{b}に、引っ越してきて知り合いがいないと話した。|{a}は{b}に「私、こういう場、本当は苦手｜私は、こういう場が本当は苦手だ｜私、こういう場は本当は苦手なんです」と打ち明けた。|{a}は{b}に、誕生日を一人で過ごしたことを話した。|{a}は{b}に、最近笑ったのはいつだったか分からないと言った。'),
E('g_advice','help','p+','np*.4+a*.4','B.stress>25','ba:trust6,aff3;bs:-5','{a}は{b}の悩みに、具体的な解決策を三つ出した。|{a}は{b}に「それ、あなたのせいじゃないよ｜それは、あなたのせいではない｜それは、あなたのせいじゃないですよ」と言った。|{a}は{b}の転職の相談に、真剣に乗った。|{a}は{b}に「逃げてもいいんだよ｜逃げてもいいんだ｜逃げてもいいんですよ」と言った。|{a}は{b}の話を聞いて、知り合いの専門家を紹介すると言った。|{a}は{b}の悩みを笑い飛ばして、なぜか{b}も笑った。'),
E('g_value_clash','conflict','p+','cp*.5+honesty*.3','','ab:ten6;ba:ten6','{a}と{b}は、結婚観の違いで言い合いになった。|{a}と{b}は、割り勘かおごりかで意見がぶつかった。|{a}は{b}の「仕事は二の次」という考えを真っ向から否定した。|{a}と{b}は、子どもが欲しいかどうかで微妙な空気になった。|{a}は{b}の恋愛観を「重い｜＝｜重いですね」と言った。|{a}と{b}は、休日の過ごし方の価値観が真逆だと判明した。'),
E('g_noticed','romance','p+','a*.5+att/60','att>20','ba:att6,trust4','{a}は{b}が髪を切ったばかりだと気づいた。|{a}は{b}が無理して笑っているのに気づいた。|{a}は{b}の爪が、今日のために塗られたものだと気づいた。|{a}は{b}が寒そうにしているのに気づいて、エアコンの風向きを変えてもらった。|{a}は{b}が左利きだと気づいて、席を入れ替えた。|{a}は{b}の話のなかの小さな嘘に気づいたが、黙っていた。'),
E('g_k_sing','bond','s','fc*.6+step/8','step>=5','gab:aff2','{a}は一曲目から十八番を入れて、場を温めた。|{a}は誰も知らない曲を熱唱して、マイクを離さなかった。|{a}のバラードが意外に上手くて、皆が静まり返った。|{a}はアニソンを振り付きで歌い切った。|{a}は採点機能で九十五点を出して、得意げに振り返った。|{a}はタンバリンを全力で叩き続けた。'),
E('g_k_duet','romance','p+','fc*.4+att/60+step/10','step>=5&att>20','ab:att6;ba:att6','{a}と{b}がデュエット曲を歌った。サビで目が合った。|{a}は{b}をデュエットに誘った。{b}は「私、この曲しか知らない｜私はこの曲しか知らない｜私、この曲しか知りません」と言いつつ乗った。|{a}と{b}のハモりが妙に綺麗で、皆が拍手した。|{a}は{b}が歌っている間、ずっと画面ではなく{b}を見ていた。|{a}と{b}は、ラブソングの歌詞を照れながら歌った。|{a}は{b}の歌う声に、思わず聴き入った。'),
E('g_k_shy','solo','s+','ac*.5+caution*.3','step>=5','as:5','{a}はカラオケで、ずっと曲を選ぶふりをしていた。|{a}は「歌わない｜＝｜歌いません」と頑なに断り続けた。|{a}はようやく入れた曲のイントロで、マイクを人に渡そうとした。|{a}はコーラス部分だけ、小さな声で参加した。|{a}は歌い終わって、拍手に小さく頭を下げた。|{a}はドリンクバーとの往復で、時間を潰していた。'),
E('g_k_listen','romance','p','att/50','step>=5&att>30','ab:att6','{b}がマイクを握ると、{a}は手拍子を止めて聴き入った。|{a}は{b}の入れた曲をこっそり覚えておいた。|{a}は{b}の歌の選曲から、昔の失恋を勝手に想像した。|{a}は{b}が歌う横顔を、暗い部屋の中でじっと見ていた。|{a}は{b}の歌に一番大きな拍手を送った。|{a}は{b}の歌声を、こっそり録音しようか迷った。'),
E('g_coat','help','p+','np*.5+att/80','step>=4','ba:aff4,att3','{a}は{b}のコートを、ハンガーから取って渡した。|{a}は{b}が忘れかけたマフラーを、追いかけて届けた。|{a}は{b}の靴を揃えておいた。|{a}は{b}の傘を、自分の傘と一緒に持っていた。|{a}は寒そうな{b}に、カイロを一つ渡した。|{a}は{b}が鞄の中身をぶちまけたのを、一緒に拾った。'),
E('g_walk','romance','p+','att/50+warmth*.3','step>=5&att>30','ab:att6,trust4;ba:att6,trust4','駅までの道、{a}と{b}は皆から少し遅れて歩いた。|{a}は{b}の歩幅に合わせて、ゆっくり歩いた。|{a}は車道側に回って、{b}を歩道の内側に入れた。|{a}と{b}は、信号待ちの間に今日の感想を言い合った。|{a}は{b}に「また会える？｜また会えるか？｜また会えますか？」と訊いた。|{a}と{b}は、遠回りだと分かっている道を選んだ。'),
E('g_ghost','solo','s+','cold*.5+caution*.3','step>=4','gab:aff-3','{a}は「明日早いから｜明日は早い｜明日早いんです」と言って、一次会で姿を消した。|{a}はいつの間にか会計を済ませて、先に帰っていた。|{a}は二次会の店の前で、そっと別の方向に歩き出した。|{a}は「トイレ｜トイレに行く｜お手洗いに行ってきます」と言ったきり、戻ってこなかった。|{a}は皆が盛り上がっている隙に、タクシーを呼んでいた。|{a}は「楽しかった｜＝｜楽しかったです」とだけLINEを残して帰った。'),
E('g_thanks','bond','g','np*.4+ac*.3','step>=4','gab:aff3','{a}は帰り際、全員に「今日はありがとう｜＝｜今日はありがとうございました」と頭を下げた。|{a}は幹事に、さりげなく多めにお金を渡した。|{a}は「次は私が幹事やる｜次は私が幹事をやる｜次は私が幹事をやります」と宣言した。|{a}は帰りのLINEで、全員分の良いところを一言ずつ書いた。|{a}は店を出る前に、店員に深々とお辞儀をした。|{a}は「みんなと会えてよかった｜皆と会えてよかった｜みなさんと会えてよかったです」と照れくさそうに言った。'),
E('g_late','solo','s+','fc*.4+impulse*.3','step<2','gab:ten2','{a}は三十分遅れて、汗だくで現れた。|{a}は「道に迷った｜＝｜道に迷いました」と言い訳して、乾杯のあとに滑り込んだ。|{a}は遅れてきたのに、誰よりもテンションが高かった。|{a}は遅刻の言い訳を三つ用意していて、全部使った。|{a}は到着するなり「駆けつけ一杯！｜駆けつけ一杯だ！｜駆けつけ一杯、いただきます！」と叫んだ。|{a}は遅れた分を取り返すように、ハイペースで飲み始めた。'),
E('g_dress','romance','s','fc*.4+cp*.2','','gab:att2','{a}は今日のために新しい服を買ったことを、誰にも言わなかった。|{a}の香水が、席を立つたびにふわりと香った。|{a}は眼鏡を外して、雰囲気を変えてみた。|{a}の服装が場違いなほど気合いが入っていて、皆が二度見した。|{a}は髪型を変えたばかりで、何度も触っていた。|{a}は時計だけは良いものをつけていた。'),
E('g_wrongname','conflict','p+','impulse*.4+drunk/80','','ba:ten4,aff-2','{a}は{b}の名前を間違えて呼んだ。二回。|{a}は{b}の話を、別の人の話と混同した。|{a}は{b}を年下だと思い込んで話していた。|{a}は{b}の職業を最後まで勘違いしていた。|{a}は{b}に「前にも会ったことあるよね｜前にも会ったことがあるだろう｜前にもお会いしたことがありますよね」と言った。会ったことはなかった。|{a}は{b}に二回同じ質問をした。'),
E('g_rumor','conflict','p','jealous*.5+fc*.3','ten>20','ab:ten5;sec','{a}は{c}の耳元で、{b}についての噂話をした。|{a}は{b}が席を外した隙に「あの人、彼氏いるらしいよ｜あの人には、彼氏がいるらしい｜あの人、彼氏がいるらしいですよ」と言った。|{a}は{b}の過去の噂を、さも本当のように話した。|{a}は{b}が席にいないとき、{b}の話し方を真似して笑いを取った。|{a}は{b}について「狙ってる人いるっぽい｜狙っている人がいるらしい｜狙っている人がいるみたいです」と吹聴した。|{a}は{b}のSNSを調べて、その内容を皆に共有した。'),
E('g_smile','romance','p+','warmth*.5+att/80','','ba:att4','{a}は{b}が話すたびに、心から楽しそうに笑った。|{a}の笑顔に、{b}はつられて笑ってしまった。|{a}は{b}の冗談に、少し遅れて吹き出した。|{a}は{b}の失敗談に、涙を流して笑った。|{a}は{b}の方を向いて、くしゃっと笑った。|{a}は{b}に「その話、私もっと聞きたい｜その話を、私はもっと聞きたい｜その話、私もっと聞きたいです」と笑った。'),
E('g_tease_back','romance','p+','fc*.4+cp*.3+att/80','att>20','ab:att4;ba:att5','{a}は{b}をからかい、{b}もすぐやり返した。その応酬は、端から見ると完全にいちゃついていた。|{a}は{b}の言い間違いを、一晩中いじり続けた。|{a}は{b}に「意外とドジだね｜意外とドジだ｜意外とドジなんですね」と言った。|{a}は{b}のグラスの持ち方を真似して笑った。|{a}は{b}の口癖を見つけて、何度も指摘した。|{a}は{b}に「絶対モテるでしょ｜絶対モテるだろう｜絶対モテますよね」と言って、否定されるのを楽しんだ。'),
E('g_cold_shoulder','conflict','p+','cold*.6-att/60','att<15','ba:aff-4,ten3','{a}は{b}の質問に、一言だけで答えた。|{a}は{b}の話の途中で、スマホを見始めた。|{a}は{b}の連絡先交換の申し出を、笑顔でかわした。|{a}は{b}と目を合わせないように、ずっと反対側を向いていた。|{a}は{b}の話に「ふーん｜そうか｜そうですか」としか言わなかった。|{a}は{b}に「で？｜それで？｜それで、何ですか？」と返した。'),
E('g_backup','help','p+','np*.4+a*.3+lead*.2','','ba:trust5,aff3','{a}は{b}が答えに詰まった質問を、代わりに引き取った。|{a}は{b}の話の面白いところを、皆に聞こえるように繰り返した。|{a}は{b}が言いかけてやめた話を、もう一度振った。|{a}は{b}の良いところを、本人の代わりに皆にアピールした。|{a}は{b}が困っているのを見て、話題を自分の失敗談に移した。|{a}は{b}が浮いているのに気づいて、隣に座った。'),
E('g_fortune','bond','g','fc*.5','','gab:aff2','{a}は手相占いを始めて、全員の手を見て回った。|{a}は即興で全員の前世を占った。|{a}はおみくじアプリで、全員の今日の運勢を引いた。|{a}は全員の動物占いを調べて読み上げた。|{a}は「この中で一番先に結婚する人」を予言した。|{a}はタロットアプリを開いて、恋愛運を占い始めた。'),
E('g_sulk','solo','s+','jealous*.5+ac*.3','stress>30','as:6','{a}は話の輪に入れず、黙ってグラスを空け続けた。|{a}は笑顔を作るのに疲れて、トイレで五分休んだ。|{a}は誰とも連絡先を交換できず、スマホを伏せた。|{a}は狙っていた人の隣を取られて、急に口数が減った。|{a}は誰にも話を振られず、ひたすら枝豆を剥いた。|{a}は「楽しい？｜楽しいか？｜楽しいですか？」と聞かれて「楽しいよ｜楽しい｜楽しいです」と即答したが、嘘だった。'),
E('g_invite_next','romance','p+','honesty*.5+att/50','att>35&step>=3','ab:att6,trust4;ba:att6','{a}は{b}に「今度、二人でご飯行かない？｜今度、二人で食事に行かないか？｜今度、二人でご飯に行きませんか？」と訊いた。|{a}は{b}に、来週のライブのチケットが一枚余っていると言った。|{a}は{b}に、行きたかった店の話をして「一緒に｜一緒にどうだ｜ご一緒にいかがですか」と付け足した。|{a}は{b}に「次は私と二人で来たい｜＝｜次は私と二人で来たいです」と言った。|{a}は{b}の予定を、さりげなく聞き出した。|{a}は{b}に「水族館、好き？｜水族館は好きか？｜水族館はお好きですか？」と訊いた。'),
E('g_cupid2','help','p','np*.5+fc*.3','ratt>30','ba:trust4','{a}は{b}に「あの人、あなたのこと見てたよ｜あの人は、あなたのことを見ていた｜あの人、あなたのことを見ていましたよ」と耳打ちした。|{a}は{b}のために、狙っている相手の好みをこっそり聞き出した。|{a}は{b}と{c}が二人きりになるよう、トイレに立った。|{a}は{b}の背中を押して、気になる人の隣に座らせた。|{a}は{b}の良いところを、{c}の前でさりげなく話した。|{a}は{b}に「今だよ｜今だ｜今です」と小声で合図した。'),
E('g_mood_kill','conflict','s','cp*.4+cold*.4','','gab:aff-3,ten2','{a}が政治の話を始めて、場の温度が下がった。|{a}は「こういう会、意味ある？｜こういう会に意味はあるのか？｜こういう会、意味ありますか？」と言った。|{a}は盛り上がっている話題に「でもそれって｜だがそれは｜でも、それはですね」と水を差した。|{a}は時計を見て「あと何分？｜あと何分だ？｜あと何分ですか？」と訊いた。|{a}は誰かの恋愛話に「現実見た方がいい｜現実を見た方がいい｜現実を見た方がいいですよ」と言った。|{a}は乾杯の音頭に、一人だけグラスを上げなかった。'),
E('g_overheard','conflict','p','a*.3+jealous*.4','','ab:ten6,trust-5','{a}は、{b}がトイレで自分のことを話しているのを聞いてしまった。|{a}は{b}のスマホの画面に、自分の名前が見えた。|{a}は{b}が別の人に「本命は別｜本命は別だ｜本命は別の人です」と言っているのを聞いた。|{a}は{b}の「今日はハズレ｜今日はハズレだ｜今日はハズレですね」という呟きを聞き逃さなかった。|{a}は{b}が自分の話を笑いのネタにしているのを聞いた。|{a}は{b}が「あの人苦手｜あの人は苦手だ｜あの人は苦手です」と言っている相手が自分だと気づいた。'),
E('g_gift','romance','p+','np*.4+att/60','att>30','ba:att5,aff4','{a}は{b}に、鞄に入っていた飴を一つ渡した。|{a}は{b}に、店のマッチをお土産に渡した。|{a}は{b}が欲しがっていた本のタイトルをメモして渡した。|{a}は{b}に、自分のハンカチを貸した。返さなくていいと言った。|{a}は{b}に、ガチャガチャで出たキーホルダーをあげた。|{a}は{b}の誕生日が近いと聞いて、その場でケーキを頼んだ。'),
E('g_bill_share','help','p+','np*.4+cp*.3','step>=4','ba:aff3','{a}は{b}の分の会計を、黙って立て替えた。|{a}は{b}に「今日は私が払うよ｜今日は私が払う｜今日は私が払います」と言った。{b}は二回断ってから、素直に甘えた。|{a}は{b}の小銭が足りないのを見て、百円玉を差し出した。|{a}は{b}が遅れて来た分の会計を調整してやった。|{a}は{b}に「次奢って｜次は奢れ｜次は奢ってくださいね」と言って、その場は払った。|{a}は{b}の分の端数を、自分で被った。'),
E('g_nervous','solo','s+','ac*.5+att/100','step<3','as:5','{a}は緊張で、乾杯の音頭のタイミングを逃した。|{a}はお通しの小鉢を、ひっくり返しそうになった。|{a}は自己紹介で、名前の次に言うことを忘れた。|{a}はおしぼりを、何度も畳み直した。|{a}は話しかけられて、声が裏返った。|{a}は手汗を何度もおしぼりで拭いた。'),
E('g_confident','romance','s','fc*.4+cp*.3-ac*.3','','gab:att2','{a}は自己紹介で、場の主導権を一瞬で握った。|{a}は全員の名前を一度で覚えて、名前で呼んだ。|{a}の話し方には妙な余裕があった。|{a}は乾杯の挨拶で、気の利いた一言を添えた。|{a}は誰に話しかけられても、同じ温度で返した。|{a}は自分の笑い声の大きさを、ちゃんと計算していた。'),
E('g_anime','bond','p+','fc*.4+a*.2','','ab:aff5;ba:aff5','{a}と{b}は、同じアニメの同じキャラが推しだと判明して握手した。|{a}は{b}の鞄についているキーホルダーの元ネタに気づいた。|{a}と{b}は、好きな声優の話で一気に距離が縮まった。|{a}と{b}は、とある漫画の名台詞を同時に言った。|{a}は{b}に、今期のおすすめアニメを三本挙げた。|{a}と{b}は、オタク同士にしか分からない符丁で話し始めた。'),
E('g_pet','bond','p+','warmth*.5','','ab:aff4;ba:aff4','{a}は{b}に、飼っている犬の写真を十枚見せた。|{a}と{b}は、猫派と犬派の論争で盛り上がった。|{a}は{b}のペットの名前を聞いて、名付けのセンスを褒めた。|{a}は{b}に、昔飼っていたハムスターの話をした。|{a}と{b}は、動物の動画を見せ合って時間を忘れた。|{a}は{b}に「私、いつか猫を飼いたい｜私はいつか猫を飼いたい｜私、いつか猫を飼いたいんです」と夢を語った。'),
E('g_sports','bond','p+','fc*.4+cp*.2','','ab:aff3;ba:aff3','{a}と{b}は、同じ野球チームのファンだと分かって盛り上がった。|{a}は{b}に、学生時代の部活の話をした。|{a}と{b}は、筋トレのメニューを教え合った。|{a}は{b}と、次の試合を一緒に観に行く約束をしかけた。|{a}は{b}に、マラソン大会の完走メダルの写真を見せた。|{a}と{b}は、敵チームのファン同士で言い合いになった。'),
E('g_food_war','conflict','p+','cp*.4+fc*.3','','ab:ten3;ba:ten3','{a}と{b}は、唐揚げにレモンを勝手にかけるかどうかで本気で揉めた。|{a}と{b}は、目玉焼きに何をかけるかで譲らなかった。|{a}と{b}は、きのこ派とたけのこ派で真っ二つに割れた。|{a}と{b}は、カレーは飲み物かどうかで議論した。|{a}と{b}は、酢豚のパイナップルの是非で口論になった。|{a}と{b}は、ラーメンの「硬め」の正義について争った。'),
E('g_mirror','romance','p','att/50+a*.2','att>30&ratt>30','ab:att6;ba:att6','{a}と{b}は、同じタイミングでグラスを口に運んだ。|{a}と{b}は、同じメニューを同時に指差した。|{a}と{b}の笑うタイミングが、ぴたりと揃った。|{a}と{b}は、同じ言葉を同時に口にして顔を見合わせた。|{a}が頬杖をつくと、{b}も同じ姿勢をしていた。|{a}と{b}は、同じ冗談に同じ瞬間に吹き出した。'),
E('g_nostalgic','bond','p+','warmth*.3+honesty*.3','','ab:aff3;ba:aff3','{a}と{b}は、子どもの頃に流行った遊びの話で盛り上がった。|{a}は{b}と、昔のテレビ番組の主題歌を口ずさんだ。|{a}と{b}は、駄菓子の値段の話で世代を感じた。|{a}は{b}に、中学の修学旅行の思い出を話した。|{a}と{b}は、初めて買ったCDを教え合った。|{a}と{b}は、昔の携帯の着メロの話で笑った。'),
E('g_weird','solo','s+','fc*.5+impulse*.3','','gab:aff1','{a}は突然、おしぼりで鶴を折り始めた。|{a}は割り箸の袋で、器用に箸置きを作った。|{a}は氷をストローで吸う音を、一人で楽しんでいた。|{a}は店内のBGMの曲名を当てるゲームを、一人でやっていた。|{a}は唐揚げの断面を観察して「これは名店｜これは名店だ｜これは名店ですね」と頷いた。|{a}はメニューの誤字を見つけて、密かに喜んでいた。'),
E('g_fatigue','solo','s+','cold*.3+caution*.3+stress/100','step>=3','as:4','{a}は笑顔のまま、心の中で終電の時間を数えていた。|{a}は話を聞きながら、あくびを噛み殺した。|{a}はふと、家に帰ってから見るドラマのことを考えた。|{a}は靴を脱いだ足が、少しむくんでいるのを感じていた。|{a}は人の多さに、少しだけ疲れていた。|{a}は店の時計を、三回見た。'),
E('g_protect_drunk','help','p+','np*.4+cp*.4','B.drunk>55','ba:trust6,aff4','{a}は酔った{b}を狙うように近づいた誰かを、さりげなく遠ざけた。|{a}は{b}に「今日は私が送っていく｜＝｜今日は私が送っていきます」と言った。|{a}は{b}の代わりに、タクシーを呼んだ。|{a}は{b}が持ち帰られそうになっているのに気づいて、「同じ方向だから｜同じ方向だ｜同じ方向ですから」と割って入った。|{a}は{b}の家族に連絡がつくか確認した。|{a}は{b}が寝ないように、話しかけ続けた。'),
E('g_honest_reject','conflict','p+','honesty*.5+cold*.3','ratt>30&att<15','ba:att-6,ten4;bs:8','{a}は{b}の好意に気づいて、「ごめん、そういうつもりじゃない｜すまない、そういうつもりはない｜ごめんなさい、そういうつもりはないんです」とはっきり言った。|{a}は{b}の誘いを、角が立たないように断った。|{a}は{b}に「友達としてなら｜友人としてならいい｜友達としてなら、いいですよ」と言った。|{a}は{b}に、付き合っている人がいるとこっそり打ち明けた。|{a}は{b}の連絡先の申し出に「グループで｜グループでならいい｜グループでお願いします」と返した。|{a}は{b}からの視線を、分かっていて避けた。')
]);
})();
});
;
/* ==== js/goukon-rel.js ==== */
HK.Load.def(140,'js/goukon-rel.js',function(){
(function(){
'use strict';
var HK=window.HK;
var gk=HK&&HK.SCENARIOS&&HK.SCENARIOS.goukon;
if(!gk)return;
function L(s){return s.split('|');}
gk.env.push({
id:'rel',label:'住人どうしの関係',type:'select',def:'keep',
options:[{v:'keep',label:'関係性のまま'},{v:'fresh',label:'全員初対面として扱う'}],
desc:'関係性のままにすると、設定した関係（同級生・親子・きょうだい・上司と部下など）に合わせた台詞と反応になります（席に着いたとき・自己紹介・王様ゲーム・帰り道など）。全員初対面にすると、設定した関係は合コンの中では無視され、関係の出来事も起きません。ただし、恋人・番・運命の番・夫婦・許嫁と、無関心・恐怖はそのまま残ります。家族（恋愛：なし）の二人は、初対面として扱っても恋愛の相手にはなりません'
});
var KIND={
classmate:'pal',friend:'pal',best:'pal',childhood:'pal',acq:'pal',colleague:'pal',buddy:'pal',comrade:'pal',
parent:'parent',pparent:'parent',
sibling:'sib',sibclose:'sib',sibbad:'sib',sibprot:'sib',relative:'sib',
boss:'boss',mentor:'boss',teacher:'boss',senpai:'boss',master:'boss',
lover:'love',mate:'love',fated:'love',fiance:'love',
ex:'ex',fwb:'fwb',crush:'crush',honmei:'crush',almost:'crush',
rival:'foe',enemy:'foe',bad:'foe'
};
var ORDER=['parent','sib','love','ex','fwb','crush','boss','foe','pal'];
var DIRK={parent:1,boss:1,crush:1};
var S={
pal:{
seat:L('{a}は向かいの席に{b}を見つけて、思わず二度見した。{a}「こういう場で会うと、なんだか新鮮だね｜こういう場で会うと、妙に新鮮だな｜こういう場で会うと、なんだか新鮮ですね」{b}「こっちの台詞｜こちらの台詞だ｜こちらの台詞です」|{a}と{b}は、{r}どうしで同じ合コンに来ていたと知って、顔を見合わせて笑った。お互い、誰にも言っていないはずだった。|{b}「{a}も来てたんだ｜{a}も来ていたのか｜{a}も来てたんですね」{a}は、{r}の{b}の前で「合コンの顔」をするのが急に恥ずかしくなった。|{a}は{b}の隣に座るなり、小声で言った。{a}「知ってる顔がいて、ちょっと安心した｜知っている顔がいて、少し安心した｜知っている顔がいて、ちょっと安心しました」{b}「頼りにされても困る｜頼りにされても困る｜頼りにされても困ります」'),
intro:L('自己紹介の順番が{a}に回ってきた。{r}の{b}が見ている前で改めて名乗るのは、妙に照れくさかった。{b}は、口元を押さえて笑いをこらえていた。|{a}は名前を言いかけて、{b}と目が合って噴き出した。{a}「……知ってる人に自己紹介するの、変な感じ｜……知っている相手に名乗るのは、変な感じだ｜……知っている人に自己紹介するの、変な感じですね」|{b}は{a}の自己紹介に、いちいち小さく頷いていた。{a}「頷かなくていいから｜頷かなくていい｜頷かなくていいですから」{b}「全部知ってる話だったから｜全部知っている話だったからな｜全部知ってる話でしたから」|{a}は自己紹介で、少しだけ話を盛った。{r}の{b}だけが、それが盛った話だと知っていた。{b}は何も言わずに、グラスで口元を隠した。'),
king:L('{a}「まさか{b}とこれをやる日が来るとは｜まさか{b}とこれをやる日が来るとはな｜まさか{b}とこれをやる日が来るとは思いませんでした」{b}「いいから早く終わらせて｜いいから早く終わらせろ｜いいから早く終わらせてください」|{r}の二人に命令が当たって、{a}と{b}は同時に頭を抱えた。明日からどんな顔で会えばいいのか、二人とも分からなかった。|{a}と{b}は、命令が終わってから顔を見合わせた。{a}「……今の、なかったことにしよう｜……今のは、なかったことにする｜……今の、なかったことにしましょう」{b}「賛成｜賛成だ｜賛成です」'),
watchA:L('{a}は、{r}の{b}が{c}と命令をこなすのを見て、笑いをこらえきれなかった。あとで絶対にからかうつもりだった。|{a}はこっそりスマホを構えた。{b}「撮らないで｜撮るな｜撮らないでください」{a}「記念だから｜記念だ｜記念ですから」|{a}は、{c}の隣で照れている{b}を見て、{r}として少しだけ誇らしいような、くすぐったいような気持ちになった。'),
late:L('{a}と{b}は、店の外で並んで夜風に当たった。{a}「合コンで{b}と話すと、いつもと違う話になるね｜合コンで{b}と話すと、いつもと違う話になるな｜合コンで{b}と話すと、いつもと違う話になりますね」|{b}「さっきの、誰が気になってるの？｜さっきの話、誰が気になっている？｜さっきの、誰が気になってるんですか？」{a}「{b}には絶対言わない｜{b}には絶対に言わない｜{b}には絶対言いません」――{r}どうしの内緒話は、いつもより少しだけ長引いた。|{a}は{b}のグラスに残った氷を見て、昔からこのペースだったと思い出した。{a}「飲みすぎないでよ｜飲みすぎるな｜飲みすぎないでくださいね」'),
otherA:L('{a}は、{c}と帰っていく{b}に、こっそり親指を立てた。{a}「明日、詳しく聞かせて｜明日、詳しく聞かせろ｜明日、詳しく聞かせてくださいね」|{a}は、{b}が{c}と同じ電車に乗るのを見送った。{r}だけのやりとりに、お祝いのスタンプを一つだけ送った。|{b}は改札の前で振り返って、{a}に小さく手を振った。隣には{c}がいた。{a}は、{r}の新しい顔を見た気がした。'),
both:L('{a}と{b}は、結局いつもの帰り道を並んで歩いた。{a}「合コンに来て、{b}と帰るとは思わなかった｜合コンに来て、{b}と帰ることになるとはな｜合コンに来て、{b}と帰るとは思いませんでした」|{a}と{b}は、駅のホームで今夜の反省会をした。結論は、次はそれぞれ別の合コンに行こう、だった。|{a}「今日のこと、ほかの人には内緒ね｜今日のことは、ほかの者には内緒だ｜今日のこと、ほかの人には内緒にしてくださいね」{b}「お互いさまでしょ｜お互いさまだ｜お互いさまですよ」')
},
parent:{
seat:L('{a}と{b}は、まさか{r}そろって同じ合コンに来るとは思っていなかった。乾杯のあいだ、二人とも互いの顔を見ないようにしていた。|{a}は、同じテーブルに{b}がいると気づいて、グラスを持ったまま固まった。{b}「……なんでいるの｜……なぜいる｜……なんでいるんですか」{a}「それはこっちが聞きたい｜それはこちらが聞きたい｜それはこちらが聞きたいです」|{b}は席に着くなり、{a}に小声で釘を刺した。{b}「今日は子供扱いしないで｜今日は子供扱いするな｜今日は子供扱いしないでください」{a}「努力する｜努力はする｜努力します」|{a}は乾杯のビールを一口飲んで、{b}のグラスの中身をさりげなく目で確かめた。{b}は気づかないふりをした。'),
intro:L('{b}の自己紹介を、{a}はつい{ra}の顔で聞いてしまった。{b}「……そういう目で見ないで｜……そういう目で見るな｜……そういう目で見ないでください」|自己紹介で{a}が名乗ると、{b}は耐えきれずにテーブルに突っ伏した。{r}だと知った周りが、一斉にどよめいた。|{a}は自己紹介で、{b}との関係をどう言うか迷った。{a}「ええと……保護者、みたいな｜ええと……保護者だ｜ええと……保護者です」{b}「言い方｜言い方を考えろ｜言い方を考えてください」|{b}は、{a}が若いころの話を盛っているのを聞いて、横から小さく訂正した。周りは笑ったが、{a}だけは笑っていなかった。'),
king:L('{r}に命令が当たり、テーブルが一瞬静まり返った。どちらからともなく、{a}と{b}は同じタイミングでため息をついた。|{b}「なんで{r}でこれをやるの｜なぜ{r}でこれをやる｜なんで{r}でこれをやるんですか」{a}「くじに言って｜くじに言え｜くじに言ってください」――二人は、誰よりも早く命令を終わらせた。|命令が終わると、{a}と{b}は何事もなかったように同時に箸を取った。家でもこうなのだろう、と周りは思った。王様だけが、なぜか気まずそうだった。'),
watchA:L('{a}は、{b}が{c}と命令をこなすあいだ、ずっと天井の照明を見ていた。|{a}は、{c}と見つめ合う{b}から目を逸らして、黙って水を飲んだ。{ra}としては、見ていいのか分からなかった。|{a}「……{c}、{b}をあまり困らせないように｜……{c}、{b}をあまり困らせるな｜……{c}、{b}をあまり困らせないでくださいね」{b}「ゲームだから｜ゲームだ｜ゲームですから」'),
watchB:L('{b}は、{a}が{c}と命令をこなすのを見て、両手で顔を覆った。{ra}のそういう姿は、できれば見たくなかった。|{b}「……見なかったことにする｜……見なかったことにする｜……見なかったことにします」{b}は{a}と{c}から目を逸らして、唐揚げに集中した。|{b}は、{a}が照れているのを見て、こっそり写真を撮った。家族のグループに送るかどうかは、まだ決めていない。'),
late:L('{a}「あんまり帰り、遅くならないようにね｜あまり帰りは遅くならないように｜あまり帰りは遅くならないようにしてくださいね」{b}「もう子供じゃないんだけど｜もう子供ではないのだが｜もう子供じゃないんですけど」――{a}は聞こえないふりをして、{b}の上着を椅子の背から取ってやった。|{b}「このあと、誰か一緒に飲み直せる人いないかな｜このあと、誰か一緒に飲み直せる者はいないか｜このあと、誰か一緒に飲み直せる人いませんか」{a}「誰でもいいなら……私じゃだめ？｜誰でもいいなら……私ではだめか？｜誰でもいいなら……私じゃだめですか？」{b}「{r}で飲み直してどうするの｜{r}で飲み直してどうする｜{r}で飲み直してどうするんですか」――冗談めかした声の半分くらいは、本気のぼやきだった。|{a}は二次会の相談に聞き耳を立てていた。{b}「ついてこないでね｜ついてくるな｜ついてこないでくださいね」{a}「行かない、行かない｜行かない｜行きませんよ」|{a}は{b}の顔の赤さを見て、水を一杯頼んだ。{b}「頼んでないけど｜頼んでいないが｜頼んでないんですけど」{a}「知ってる｜知っている｜知っています」'),
otherA:L('{a}は、{c}と並んで帰っていく{b}の背中を見送った。{a}「……あまり遅くならないようにね｜……あまり遅くならないように｜……あまり遅くならないようにしてくださいね」その声は、たぶん{b}には届いていなかった。|{a}は、{b}が{c}と同じ電車に乗るのを見届けてから、一人で反対のホームに向かった。{ra}の出る幕ではない、と自分に言い聞かせた。|{b}は改札の前で振り返って、{a}に言った。{b}「先に帰ってて｜先に帰っていろ｜先に帰っててください」{a}「……鍵、ちゃんと持ってる？｜……鍵は、ちゃんと持っているか？｜……鍵、ちゃんと持ってますか？」{b}「持ってる｜持っている｜持ってます」'),
otherB:L('{b}は、{c}とタクシーに乗り込む{a}を、なんとも言えない顔で見送った。{b}「……あまり遅くならないようにね｜……あまり遅くならないように｜……あまり遅くならないようにしてくださいね」立場が、すっかり逆だった。|{b}は、{a}が{c}と並んで歩いていくのを見て、スマホを取り出し、何も打たずにしまった。{rb}の口から言えることは、何もなかった。|{a}は{c}と帰る前に、{b}に声をかけた。{a}「先に帰る。戸締まり、よろしく｜先に帰る。戸締まりを頼む｜先に帰ります。戸締まり、お願いしますね」{b}「……どっちが子供なんだか｜……どちらが子供なのだか｜……どっちが子供なんだか分かりませんね」'),
both:L('{a}と{b}は、結局同じ電車に乗った。{b}「誰でもいいから一緒に帰ってくれる人、って思ってたけど｜誰でもいいから一緒に帰る相手を、と思っていたが｜誰でもいいから一緒に帰ってくれる人、って思ってましたけど」{a}「だから、私じゃだめかって言ったのに｜だから、私ではだめかと言っただろう｜だから、私じゃだめですかって言ったじゃないですか」|{a}と{b}は、駅前のコンビニでアイスを二つ買って、同じ方向の電車に乗った。合コンの話は、どちらもしなかった。|帰り道、{a}は{b}に何か言いかけて、やめた。{b}「言いたいこと、分かってるから｜言いたいことは、分かっている｜言いたいこと、分かってますから」――{r}の帰り道は、いつもより少し静かだった。')
},
sib:{
seat:L('{a}は同じテーブルに{b}を見つけて、一瞬で帰りたくなった。{a}「よりによって、身内がいるとは｜よりによって、身内がいるとはな｜よりによって、身内がいるとは思いませんでした」{b}「それはこっちの台詞｜それはこちらの台詞だ｜それはこちらの台詞です」|{a}と{b}は、目が合った瞬間に同時にため息をついた。{r}そろって合コンに来たことは、絶対に家族には言えなかった。|{b}「身内がいると、気が抜けない｜身内がいると、気が抜けない｜身内がいると、気が抜けませんね」{a}「こっちも同じ｜こちらも同じだ｜こちらも同じです」――二人は、テーブルのいちばん端と端に座った。'),
intro:L('{a}の自己紹介の途中で、{b}が小声で茶々を入れた。{b}「盛りすぎ｜盛りすぎだ｜盛りすぎです」{a}は聞こえないふりをして、最後まで言い切った。|{a}は、{b}との関係を言うか迷って、結局ただの知り合いだと言ってごまかした。{b}は笑いをこらえて、肩を震わせていた。|自己紹介で{b}が{a}の名前を出し、{r}だとあっさりばらした。{a}「なんで言うの｜なぜ言う｜なんで言うんですか」'),
king:L('身内どうしで命令をこなす羽目になり、{a}と{b}は顔を見合わせた。他人とやるより、何倍も気まずかった。|{a}「これ、家族のグループには絶対載せないで｜これは、家族のグループには絶対に載せるな｜これ、家族のグループには絶対に載せないでくださいね」{b}「載せる｜載せる｜載せます」――{a}は無言で割り箸を折った。|命令が終わるなり、{a}と{b}は同時におしぼりで手を拭いた。子どものころから、こういうところだけは息が合っていた。'),
watchA:L('{a}は、{b}が{c}と命令をこなすのを見て、スマホを取り出した。{b}「撮ったら怒る｜撮ったら怒るぞ｜撮ったら怒りますよ」{a}「もう撮った｜もう撮った｜もう撮りました」|{a}は、{c}の前で照れている{b}を見て、口の端だけで笑った。この顔は、あとで家族全員に報告するつもりだった。|{a}は、{b}のそういう顔を見たくなくて、命令が終わるまでずっとメニューを読んでいた。'),
late:L('{a}「今日のこと、あとで親に言うから｜今日のことは、あとで親に言うからな｜今日のこと、あとで親に言いますからね」{b}「言ったら、そっちのことも言う｜言ったら、そちらのことも言う｜言ったら、そっちのことも言いますよ」――二人は互いの弱みを握り合ったまま、黙ってグラスを空けた。|{b}は{a}の袖を引いた。{b}「飲みすぎ。顔、真っ赤｜飲みすぎだ。顔が真っ赤だ｜飲みすぎです。顔、真っ赤ですよ」{a}「身内に言われたくない｜身内に言われたくはない｜身内に言われたくないです」|{a}と{b}は、二次会に行くかどうかで小さく揉めた。どちらも、相手がいないほうに行きたかった。'),
otherA:L('{a}は、{c}と帰っていく{b}の背中を見送って、スマホを取り出した。{a}「……あとで親に言うから｜……あとで親に言うからな｜……あとで親に言いますからね」送り先は、まだ決めていなかった。|{a}は{b}に、すれ違いざまに言った。{a}「明日の朝ごはん、いるかどうかだけ連絡して｜明日の朝食がいるかどうかだけ連絡しろ｜明日の朝ごはん、いるかどうかだけ連絡してください」{b}は{c}の隣で、振り向かずに手を振った。|{a}は、{b}が{c}と同じタクシーに乗るのを見て、深いため息をついた。身内のこういう場面は、何度見ても慣れない。'),
both:L('{a}と{b}は、結局二人で同じ電車に乗った。{b}「身内と帰る合コンって、何｜身内と帰る合コンとは何だ｜身内と帰る合コンって、何なんでしょうね」{a}「言わないで｜言うな｜言わないでください」|{a}と{b}は、駅のホームで今夜のことを口止めし合った。どちらも結局、家で話してしまうのは分かっていた。|帰り道、{a}は{b}の荷物を半分持った。{b}は礼を言わなかったが、歩く速さを合わせた。')
},
boss:{
seat:L('{a}は同じテーブルの{b}に気づくと、先に口を開いた。{a}「今日はここでは上下関係なしで｜今日は、ここでは上下関係はなしだ｜今日は、ここでは上下関係なしでいきましょう」{b}「……努力する｜……努力する｜……努力します」|{b}は{ra}の{a}がいると知って、座る前に一度だけ背筋を伸ばした。{a}「今日は{ra}じゃないから｜今日は{ra}ではない｜今日は{ra}じゃありませんから」|{a}と{b}は、まさか同じ合コンで顔を合わせるとは思っていなかった。{b}「……お疲れ｜……お疲れさま｜……お疲れさまです」{a}「ここではそれ、なしで｜ここではそれはなしだ｜ここではそれ、なしでお願いします」'),
intro:L('{b}は自己紹介で、{a}のほうを気にしながら言葉を選んだ。{a}は笑いをこらえて、助け舟を出さなかった。|{a}は自己紹介で{b}のほうを見て言った。{a}「この人とは、知り合い程度で｜この者とは、知り合い程度だ｜この人とは、知り合い程度です」{b}には、それがいちばん気をつかった言い方だと分かっていた。|{a}が自己紹介でいつもと違う顔を見せたので、{rb}の{b}は思わず二度見した。{b}「……そういう話し方、するんだ｜……そういう話し方をするのか｜……そういう話し方、するんですね」'),
king:L('王様の命令が、{ra}と{rb}に当たった。{b}「これ、断っていい？｜これは、断っていいか｜これ、断っていいですか？」{a}「上下関係なしって言ったでしょ｜上下関係なしと言っただろう｜上下関係なしって言いましたよね」――{a}は涼しい顔のまま、グラスに口をつけた。|命令が終わると同時に、{a}と{b}は何事もなかったように仕事の話を始めた。周りは、どう突っ込めばいいのか分からなかった。|{b}は命令のあいだ、{a}の目を一度も見られなかった。{a}「明日、普通にしてね｜明日は、普通にしろ｜明日は、普通にしてくださいね」'),
watchA:L('{a}は、{c}と命令をこなす{b}を、グラス越しにじっと見ていた。上下関係なしとは言ったが、見ていないとは言っていない。|{b}は命令の途中で、{a}の視線に気づいた。{b}「……見ないでもらえる？｜……見ないでもらえるか｜……見ないでもらえますか？」{a}「見てない｜見ていない｜見ていません」――完全に見ていた。|{a}は、{b}が{c}の前で照れるのを見て、少しだけ{ra}の顔に戻って頷いた。何に頷いたのかは、本人にも分からなかった。'),
watchB:L('{b}は、{a}が{c}と命令をこなすのを見て、見てはいけないものを見た気がした。明日から、まともに顔を見られる自信がなかった。|{b}は、照れている{a}を見て、スマホを構えかけてやめた。{rb}の身で撮るのは、さすがに勇気がいった。|{a}は命令を終えると、{b}のほうを見た。{a}「今の、忘れて｜今のは、忘れろ｜今の、忘れてください」{b}「……善処する｜……善処する｜……善処します」'),
late:L('{a}は、少し酔った{b}の隣に移った。{a}「上下関係なしとは言ったけど、ちゃんと見てるからね｜上下関係なしとは言ったが、見ているぞ｜上下関係なしとは言いましたが、ちゃんと見ていますよ」{b}「……分かってる｜……分かっている｜……分かってます」|{b}「今日は、明日の話はなしで｜今日は、明日の話はなしだ｜今日は、明日の話はなしでお願いします」{a}「してない｜していない｜していません」――{a}の手には、明日の予定を開いたスマホがあった。|{a}は二次会の相談の輪の外で、{b}の帰りの電車を調べていた。{ra}の癖は、合コンの席でも抜けなかった。'),
otherA:L('{a}は、{c}と帰っていく{b}を見送りながら、小さく呟いた。{a}「……とは言ったけど、見てるからね｜……とは言ったが、見ているぞ｜……とは言いましたが、見ていますよ」|{a}は{b}の肩を軽く叩いた。{a}「明日、遅刻しないように｜明日、遅刻はするな｜明日、遅刻しないようにしてくださいね」{b}は{c}の隣で、真っ赤になって頷いた。|{a}は、{b}が{c}と同じ方向に歩いていくのを見て、明日は何も聞かないと決めた。たぶん、顔には出てしまう。'),
otherB:L('{b}は、{c}と帰っていく{a}の背中を見て、見なかったことにすると決めた。{ra}のこういう場面は、記憶に残すべきではない。|{a}は{c}と店を出る前に、{b}に言った。{a}「今日のことは、ここだけの話で｜今日のことは、ここだけの話だ｜今日のことは、ここだけの話でお願いします」{b}「……最初からそのつもり｜……最初からそのつもりだ｜……最初からそのつもりです」|{b}は、{a}が{c}とタクシーに乗るのを見送った。明日どんな顔で挨拶すればいいのか、帰り道ずっと考えていた。'),
both:L('{a}と{b}は、同じ方向の電車に乗った。{a}「上下関係なしって言ったの、どこまで覚えてる？｜上下関係なしと言ったのを、どこまで覚えている？｜上下関係なしって言ったの、どこまで覚えてますか？」{b}「全部｜全部だ｜全部です」|{a}は、一人で帰ろうとする{b}を駅まで送った。{ra}の役目は、結局最後まで抜けなかった。|帰り道、{b}は{a}に今夜の感想を聞かれて、正直に答えた。{a}は笑って、それ以上は何も言わなかった。')
},
love:{
seat:L('{a}と{b}は、示し合わせたように離れた席に座った。二人が{r}だということは、まだ誰にも言っていない。|{a}は、テーブルの向こうの{b}と一瞬だけ目を合わせた。それだけで、今夜の合コンは二人にとって別の意味になった。|{b}「なんで合コンに来てるの｜なぜ合コンに来ている｜なんで合コンに来てるんですか」{a}「数合わせで頼まれて｜数合わせで頼まれた｜数合わせで頼まれたんです」――二人は、他人のふりを続けることにした。'),
intro:L('{a}は自己紹介で、{b}との関係を言うかどうか一瞬迷って、言わなかった。{b}が、テーブルの下で{a}の足を軽く小突いた。|{b}の自己紹介を、{a}は初めて聞くような顔で聞いていた。好きな食べ物も、休日の過ごし方も、全部知っていた。|{a}は自己紹介で冗談を言いかけて、{b}の視線に気づいてやめた。'),
king:L('命令が{a}と{b}に当たった。{r}の二人にとっては、今さらの命令だった。それを知らない周りだけが、無邪気に囃し立てていた。|{a}と{b}は、照れるふりをしながら命令をこなした。テーブルの下で、二人の指先が一瞬だけ触れた。|{b}「……人前だと照れる｜……人前だと照れるな｜……人前だと照れますね」{a}「いつもと同じでいい｜いつもと同じでいい｜いつもと同じでいいですよ」――その一言で、周りの何人かが二人の関係に気づいた。'),
watchA:L('{a}は、{b}が{c}と命令をこなすのを、笑顔のまま見ていた。グラスの氷だけが、やけに大きな音を立てた。|{a}は、照れている{b}を見て、こっそり写真を撮った。あとで本人に送るつもりだった。|{a}は{c}に向かって、にこやかに言った。{a}「{b}を、よろしくね｜{b}を、よろしく頼む｜{b}を、よろしくお願いしますね」――冗談なのか本気なのか、誰にも分からなかった。|{a}は、{b}と{c}が命令を終えるまで、黙ってグラスを見つめていた。終わった瞬間、{b}がまっすぐこちらを見て笑ったので、{a}も少しだけ笑い返した。'),
late:L('{a}は二次会の相談の輪から外れて、{b}の隣に立った。{a}「そろそろ、他人のふりやめる？｜そろそろ、他人のふりはやめるか｜そろそろ、他人のふりはやめますか？」{b}「もう少しだけ｜もう少しだけだ｜もう少しだけ、続けましょう」|二人が{r}だということは、いつの間にかテーブル中に知れ渡っていた。冷やかされても、{a}と{b}は否定しなかった。|{b}は{a}の上着の袖を、誰にも見えないところで引いた。帰る相手は、最初から決まっていた。')
},
ex:{
seat:L('{a}は、向かいに座ったのが{b}だと気づいて、乾杯のグラスを持つ手が止まった。{b}も、同じ顔をしていた。|{b}「……久しぶり｜……久しぶりだな｜……お久しぶりです」{a}「……元気そうで｜……元気そうだな｜……お元気そうで何よりです」――{r}どうしの挨拶は、それきり続かなかった。|{a}と{b}は、互いに気づかないふりをして別々の人と話し始めた。それでも、相手の笑い声だけは耳に入ってきた。'),
intro:L('{a}は自己紹介で、{b}と付き合っていたころと同じ冗談を言った。{b}だけが、笑わなかった。|{b}の自己紹介の「趣味」は、{a}と別れたあとに始めたものだった。{a}は、知らない{b}がいることに少しだけ驚いた。|{a}は、{b}の前でもう一度名乗るのが妙に気まずかった。{b}は目を伏せたまま、小さく拍手をした。'),
king:L('よりによって、{r}どうしの二人に命令が当たった。{a}と{b}は昔の呼吸のまま命令をこなしてしまい、終わってから二人とも黙り込んだ。|{a}「……こういうの、昔もやった｜……こういうのは、昔もやったな｜……こういうの、昔もやりましたね」{b}「覚えてない｜覚えていない｜覚えてません」――{b}の耳だけが、赤かった。|{a}と{b}は、命令のあいだ一度も目を合わせなかった。周りの冷やかしが、なぜか途中で止まった。'),
watchA:L('{a}は、{b}が{c}と命令をこなすのを見て、グラスを持つ手に力が入った。もう関係ないはずなのに、目が離せなかった。|{a}は、{c}の前で照れている{b}を見て、自分といたころの顔を思い出した。少しだけ、胸が痛んだ。|{a}は、{b}と{c}の命令が終わるまで、わざと隣の人と大きな声で話していた。'),
late:L('店の外で、{a}と{b}は偶然二人になった。{a}「……今日、来てるとは思わなかった｜……今日、来ているとは思わなかった｜……今日、来てるとは思いませんでした」{b}「お互いさま｜お互いさまだ｜お互いさまです」|{b}は、{a}のグラスが空になるたびに目で追っている自分に気づいて、席を立った。|{a}「……元気だった？｜……元気だったか｜……お元気でしたか？」{b}「まあまあ｜まあまあだ｜まあまあです」――それだけの会話に、二人とも少し時間がかかった。'),
otherA:L('{a}は、{c}と帰っていく{b}の背中を、改札の手前で見送った。昔は、あの隣を歩いていたのは自分だった。|{a}は、{b}が{c}と同じタクシーに乗るのを見て、小さく息を吐いた。{r}の自分に言えることは、何もなかった。|{b}は改札の前で一度だけ振り返った。{a}と目が合ったが、どちらも手は振らなかった。{c}が、不思議そうに二人を見比べた。')
},
fwb:{
seat:L('{a}と{b}は、目が合った瞬間に同時に視線を逸らした。大勢の中で顔を合わせるのは、たぶん初めてだった。|{b}「……ここで会う？｜……ここで会うか｜……ここで会いますか？」{a}「会っちゃったね｜会ってしまったな｜会っちゃいましたね」――二人は、互いに知らない顔をして乾杯した。|{a}は、{b}がほかの人に向ける愛想笑いを、初めて正面から見た。知らない顔だった。'),
intro:L('{b}の自己紹介で、{a}は{b}の仕事を初めて知った。{a}「……そうだったんだ｜……そうだったのか｜……そうだったんですね」思わず声に出て、周りに不思議そうな顔をされた。|{a}と{b}は、自己紹介のあいだ互いを見ないようにしていた。知っているのは、名前と連絡先くらいだった。|{b}「最近、出会いがなくて｜最近は、出会いがない｜最近、出会いがなくて困ってるんです」{a}はグラスで口元を隠した。'),
king:L('{a}と{b}に命令が当たった。二人はいかにも初対面らしくぎこちなく振る舞ったが、少しだけぎこちなさが足りなかった。|{b}「……初めてのふり、できてる？｜……初めてのふりは、できているか｜……初めてのふり、できてますか？」{a}「たぶん、できてない｜たぶん、できていない｜たぶん、できてません」|命令を終えた{a}と{b}は、何事もなかったように別々の席に戻った。二人とも、少しだけ飲むペースが上がった。'),
watchA:L('{a}は、{b}が{c}と命令をこなすのを見て、自分でも意外なほど面白くなかった。恋人でもないのに、と自分に言い聞かせた。|{a}は、{c}と照れ合う{b}を見ても、表情を変えなかった。二人のあいだに、そういう約束はない。|{a}は、{b}と{c}の命令が終わるのを待たずに、トイレに立った。'),
late:L('{b}は二次会の相談のふりをして、{a}にだけ聞こえる声で言った。{b}「今日は別々に帰る？｜今日は別々に帰るか｜今日は別々に帰りますか？」{a}「どっちでも｜どちらでもいい｜どちらでも」|{a}と{b}は、最後まで連絡先を交換するふりをしなかった。もう、とっくに知っていた。|{a}のスマホが震えた。テーブルの向こうの{b}からの、このあとの予定を聞くだけの短い一文だった。')
},
crush:{
seat:L('{a}は、斜め向かいの席に{b}がいると気づいて、乾杯の声が少し裏返った。知っている顔が一人いるだけで、今夜の合コンはまるで違う意味になった。|{a}は、{b}がほかの誰かの隣に座るのを、グラス越しに見ていた。{b}が誰と話すのかが、今夜いちばんの気がかりだった。|{b}「{a}も来てたんだ｜{a}も来ていたのか｜{a}も来てたんですね」{a}「……うん、数合わせで｜……ああ、数合わせだ｜……はい、数合わせで」――本当は、{b}が来ると聞いたからだった。'),
intro:L('{a}は自己紹介のあいだ、{b}の反応だけを見ていた。{b}が笑ったところだけ、あとで何度も思い出した。|{a}は、{b}の自己紹介の「好きなタイプ」を一言も聞き漏らさなかった。自分に当てはまるところを、こっそり数えた。|{b}の前で改めて名乗るのが、{a}には妙に恥ずかしかった。声が少しだけ小さくなった。'),
king:L('命令が{a}と{b}に当たった瞬間、{a}は割り箸を落とした。{b}は不思議そうに、それを拾って渡した。|{a}は命令をこなすあいだ、顔を上げられなかった。{b}だけが、いつもどおりだった。|{a}と{b}に命令が当たった。冗談で済むはずの命令が、{a}にとってだけは冗談にならなかった。'),
watchA:L('{a}は、{b}が{c}と命令をこなすのを、笑顔を作ったまま見ていた。拍手をする手が、少しだけ遅れた。|{a}は、{c}の前で照れている{b}を見て、そっと目を逸らした。あんな顔は、自分には向けられたことがなかった。|{a}は、命令が終わるまでずっと、グラスの水滴を指でなぞっていた。'),
late:L('{a}は二次会の相談の輪の中で、{b}が行くかどうかだけを気にしていた。{b}「行く｜行く｜行きます」の一言で、{a}も行くことに決めた。|店の外で、{a}は{b}と二人になった。{a}「今日、来てよかった｜今日は、来てよかった｜今日、来てよかったです」{b}「楽しかったね｜楽しかったな｜楽しかったですね」――{a}が言いたかったことは、それとは少し違った。|{a}は{b}のグラスが空いたのに気づいて、誰よりも早くメニューを差し出した。{b}は気づかずに、ほかの人と笑っていた。'),
otherA:L('{a}は、{c}と帰っていく{b}の背中を見送った。知り合いのままでいるのと、合コンで負けるのとでは、痛みの種類が違った。|{a}は、{b}が{c}と同じ電車に乗るのを見て、送りかけたメッセージを消した。|{a}は改札の前で、{b}に手を振った。{b}は{c}の隣で振り返したが、{a}の顔は見ていなかった。')
},
foe:{
seat:L('{a}は、同じテーブルに{b}がいると気づいて、露骨に眉をひそめた。{b}「……なんでいるの｜……なぜいる｜……なんでいるんですか」{a}「こっちの台詞｜こちらの台詞だ｜こちらの台詞です」|{a}と{b}は、テーブルの端と端に座った。乾杯のグラスだけは、互いに一度も触れ合わせなかった。|{a}は{b}に聞こえるように言った。{a}「合コンまで張り合う気？｜合コンまで張り合う気か｜合コンまで張り合う気ですか？」{b}「そっちこそ｜そちらこそ｜そちらこそ」'),
intro:L('{a}の自己紹介に、{b}だけが拍手をしなかった。{a}は、それに気づかないふりをした。|{b}は自己紹介で、{a}より一つでも多く笑いを取ろうとした。{a}は、それを見て鼻で笑った。|{a}は、{b}の前で名乗るのが心底いやそうだった。{b}は、それを見て少しだけ機嫌がよくなった。'),
king:L('よりによって、{a}と{b}に命令が当たった。二人は笑顔のまま、互いに一歩も引かなかった。|{a}「……ゲームだから｜……ゲームだからな｜……ゲームですから」{b}「分かってる｜分かっている｜分かってます」――二人とも、目がまったく笑っていなかった。|命令が終わった瞬間、{a}と{b}は同時に反対のほうを向いた。周りは、さっきまでの空気が何だったのか分からなくなった。'),
watchA:L('{a}は、{b}が{c}と命令をこなすのを見て、聞こえるように鼻で笑った。|{a}は、照れている{b}を、ここぞとばかりに写真に収めた。あとで何かに使うつもりらしかった。|{a}は、{b}の命令が終わるまで、わざとらしく拍手を続けた。'),
late:L('{a}と{b}は、二次会に行くかどうかで張り合った。相手が行くなら、自分も引けなかった。|{b}「今日のところは、引き分け｜今日のところは、引き分けだ｜今日のところは、引き分けにしておきましょう」{a}「勝手に決めないで｜勝手に決めるな｜勝手に決めないでください」|{a}は、酔った{b}の前に黙って水を置いた。{b}「……借りにはしない｜……借りにはしない｜……借りにはしませんから」{a}「そうして｜そうしろ｜そうしてください」')
}
};
var SCENE={seat:'席に着いたとき',intro:'自己紹介',king:'王様ゲーム',watchA:'王様ゲームを見ていた',watchB:'王様ゲームを見ていた',late:'一次会の終わり',otherA:'帰る相手を見送った',otherB:'帰る相手を見送った',both:'二人とも一人で帰る'};
function mode(ctx){return ctx&&ctx.env&&ctx.env.rel==='fresh'?'fresh':'keep';}
function all(ctx,a,b){return HK.Ties&&HK.Ties.all?HK.Ties.all(ctx,a,b):[];}
function here(c){return!!c&&(HK.State&&HK.State.here?HK.State.here(c):c.alive!==false&& !c.out);}
function known(ctx,a,b){
if(!a|| !b||a===b||mode(ctx)==='fresh')return false;
return all(ctx,a,b).some(function(t){return t&&t.type!=='noobs';});
}
function lab(t){
var D=HK.TIES[t.type]||{},s=HK.tieLabel?HK.tieLabel(t):D.label||'';
s=String(s||D.label||'').replace(/（[^）]*）/g,'');
if(t.spouse&&t.married==='separated'&&HK.TIES.spouse)s+='の'+HK.TIES.spouse.label;
return s;
}
function relOf(ctx,a,b){
if(!a|| !b||a===b||mode(ctx)==='fresh')return null;
if(HK.Ties&&HK.Ties.apathy&&(HK.Ties.apathy(ctx,a,b)||HK.Ties.apathy(ctx,b,a)))return null;
if(HK.Ties&&HK.Ties.fears&&(HK.Ties.fears(ctx,a,b)||HK.Ties.fears(ctx,b,a)))return null;
var best=null,bi=99;
all(ctx,a,b).forEach(function(t){
var k=t&&KIND[t.type];
if(!k||(t.type==='fiance'&& !t.couple))return;
var i=ORDER.indexOf(k);
if(i<bi){bi=i;best=t;}
});
if(!best)return null;
var k0=KIND[best.type],D=HK.TIES[best.type]||{},dir= !!(D.dir&&DIRK[k0]);
var A=dir?ctx.chars[best.a]:a,B=dir?ctx.chars[best.b]:b,r=lab(best);
return{k:k0,t:best,A:A,B:B,dir:dir,r:r,ra:dir?D.roleA:r,rb:dir?D.roleB:r};
}
function fill(ctx,rel,s,a,b,c){
var t=ctx.t(s.replace(/\{ra\}/g,rel.ra).replace(/\{rb\}/g,rel.rb).replace(/\{r\}/g,rel.r),a,b,c);
if(rel.dir&&rel.t&&rel.t.type==='mentor'&&HK.Ties&&HK.Ties.mentorWord)t=HK.Ties.mentorWord(t,rel.A,rel.B);
return t;
}
function whyOf(rel,sc){return'関係「'+rel.r+'」の二人（'+SCENE[sc]+'）。住人どうしの関係：関係性のまま';}
function pairs(ctx){
var P=ctx.present(),out=[];
for(var i=0;i<P.length;i++)for(var j=i+1;j<P.length;j++){
var r=relOf(ctx,P[i],P[j]);
if(r&&S[r.k])out.push(r);
}
return out.length>1?ctx.rng.shuffle(out):out;
}
function say(ctx,rel,sc,a,b,c,txt){
var ac=[a,b].concat(c?[c]:[]);
var fx=rel.k==='foe'?{ten:2}:rel.k==='ex'?{ten:1}:{aff:2,trust:1};
return ctx.act2({actors:ac,cat:'bond',fx:function(){ctx.mod2(a,b,fx,fx);},text:txt,why:whyOf(rel,sc),mag:4});
}
function scene(ctx,sc,n,p){
var L0=pairs(ctx),k=0;
for(var i=0;i<L0.length&&k<n;i++){
var rel=L0[i],src=S[rel.k][sc];
if(!src||ctx.rng()>=p)continue;
say(ctx,rel,sc,rel.A,rel.B,null,fill(ctx,rel,ctx.pick(src),rel.A,rel.B));
k++;
}
}
function kingPair(ctx,e){
var C=ctx.chars,x=C[e.actors[0]],y=C[e.actors[1]],t=e.text;
if(!x|| !y)return null;
if(t.indexOf('⁠'+x.name+'と'+y.name+'で')>=0)return[x,y];
if(t.indexOf('王様は'+y.name+'。')===0&&t.indexOf('⁠'+x.name+'が王様')>=0)return[x,y];
return null;
}
function kingReact(ctx,s){
if(mode(ctx)==='fresh')return;
var done=ctx._gkRelK=ctx._gkRelK||{};
ctx.log.forEach(function(e){
if(!e||done[e.n]||e.step!==s||e.kind!=='event'||typeof e.text!=='string'|| !/^王様は/.test(e.text)|| !e.actors||e.actors.length!==2)return;
done[e.n]=1;
if(/罰の一気/.test(e.text))return;
var pr=kingPair(ctx,e);
if(!pr)return;
var x=pr[0],y=pr[1],rel=relOf(ctx,x,y);
if(rel&&S[rel.k]&&S[rel.k].king){
if(ctx.rng()<0.85){e.text+=fill(ctx,rel,ctx.pick(S[rel.k].king),rel.A,rel.B);e.why=(e.why?e.why+'／':'')+whyOf(rel,'king');}
return;
}
var W=[];
ctx.present().forEach(function(w){
if(w===x||w===y)return;
[[y,x],[x,y]].forEach(function(q){
var r=relOf(ctx,w,q[0]);
if(!r|| !S[r.k])return;
var key=r.dir?(w===r.A?'watchA':'watchB'):'watchA';
if(!S[r.k][key])return;
W.push({r:r,w:w,tg:q[0],c:q[1],key:key});
});
});
if(!W.length||ctx.rng()>=0.6)return;
var o=ctx.pick(W),r=o.r;
var a=r.dir?r.A:o.w,b=r.dir?r.B:o.tg;
e.text+=fill(ctx,r,ctx.pick(S[r.k][o.key]),a,b,o.c);
e.why=(e.why?e.why+'／':'')+whyOf(r,o.key);
});
}
function home(ctx){
var T=(ctx.flags.together||[]).filter(function(t){return ctx.chars[t.a]&&ctx.chars[t.b];});
var mate={};
T.forEach(function(t){mate[t.a]=t.b;mate[t.b]=t.a;});
var L0=pairs(ctx),k=0;
for(var i=0;i<L0.length&&k<3;i++){
var rel=L0[i],X=S[rel.k],x=rel.A,y=rel.B;
if(mate[x.i]===y.i)continue;
var mx=mate[x.i]!=null?ctx.chars[mate[x.i]]:null,my=mate[y.i]!=null?ctx.chars[mate[y.i]]:null;
var w=null,tg=null,c=null,key;
if(my&&here(my)){w=x;tg=y;c=my;}
else if(mx&&here(mx)){w=y;tg=x;c=mx;}
if(w)key=rel.dir?(w===rel.A?'otherA':'otherB'):'otherA';
else key='both';
if(!X[key]||ctx.rng()>=0.75)continue;
var a=rel.dir?rel.A:(w||x),b=rel.dir?rel.B:(w?tg:y);
say(ctx,rel,key,a,b,c,fill(ctx,rel,ctx.pick(X[key]),a,b,c));
k++;
}
}
var phase0=gk.phase;
gk.phase=function(ctx,s){
phase0.apply(this,arguments);
if(mode(ctx)==='fresh')return;
ctx.flush();
if(s===0)scene(ctx,'seat',3,0.85);
else if(s===1)scene(ctx,'intro',3,0.8);
else if(s===5)scene(ctx,'late',2,0.7);
};
var after0=gk.after;
gk.after=function(ctx,s){
var r=after0?after0.apply(this,arguments):undefined;
if(s===4)kingReact(ctx,s);
return r;
};
var finish0=gk.finish;
gk.finish=function(ctx){
if(mode(ctx)==='fresh')return finish0.apply(this,arguments);
var own=Object.prototype.hasOwnProperty.call(ctx,'say'),say0=ctx.say,done=false;
function restore(){if(own)ctx.say=say0;else delete ctx.say;}
ctx.say=function(o){
if(!done&&o&& /^結末：恋人になった組/.test(o.why||'')){done=true;restore();home(ctx);}
return say0.apply(ctx,arguments);
};
try{return finish0.apply(this,arguments);}finally{if(!done)restore();}
};
var FIRST={contact:1,g_line_ask:1,g_wrongname:1,g_hometown:1,g_horoscope:1,g_name:1,g_job:1};
HK.wrap(HK,'buildPool',function(bp0){if(!bp0)return bp0;return function(scen){
var pool=bp0.apply(this,arguments);
if(!scen||scen.id!=='goukon')return pool;
return pool.map(function(e){
if(!e|| !FIRST[e.id]||e.scope!=='pair')return e;
var w=Object.create(e);
w.when=function(ctx,a,b){if(known(ctx,a,b))return false;return e.when?e.when.apply(this,arguments):true;};
return w;
});
};});
HK.GoukonRel={mode:mode,known:known,relOf:relOf,LINES:S};
})();
});
;
/* ==== js/goukon-talk.js ==== */
HK.Load.def(142,'js/goukon-talk.js',function(){
(function(){
'use strict';
var HK=window.HK;
var gk=HK.SCENARIOS.goukon;
if(!gk)return;
var TOPICS=[
'休日の過ごし方|「休みの日って何してるの？｜休みの日は何をしている｜休みの日って何してるんですか？」|warmth:.4,fc:.2','好きな食べ物|「一番好きな食べ物、せーので言わない？｜一番好きな食べ物、せーので言うか｜一番好きな食べ物、せーので言いません？」|fc:.4,warmth:.3','最近ハマってるもの|「最近なにかハマってる？｜最近、何かハマっているものはあるか｜最近、何かハマっているものはありますか？」|fc:.5,honesty:.2',
'地元の話|「出身どこ？｜出身はどこだ｜ご出身はどちらですか？」|np:.3,warmth:.3','血液型占い|「私、何型か当てていい？｜何型か当ててやろう｜私、何型か当ててもいいですか？」|fc:.4,ac:.2','星座占い|「誕生日いつ？私、星座で当てる｜誕生日はいつだ。星座で当ててやる｜誕生日いつですか？私、星座で当てます」|fc:.3,ac:.3',
'MBTI|「MBTIって何型？｜MBTIは何型だ｜MBTIって何型ですか？」|fc:.3,a:.3','好きな映画|「最近観た映画で一番よかったのは？｜最近観た映画で一番よかったのは何だ｜最近観た映画で一番よかったのは何ですか？」|a:.3,fc:.3','好きな音楽|「カラオケで絶対歌う曲ってある？｜カラオケで絶対歌う曲はあるか｜カラオケで絶対歌う曲ってあります？」|fc:.5',
'ペットの話|「動物飼ってる？写真見たい！｜動物を飼っているか。写真を見せろ｜動物飼ってます？写真見たいです！」|np:.5,warmth:.3','猫派か犬派か|「猫派？犬派？｜猫派か、犬派か｜猫派ですか？犬派ですか？」|fc:.3,warmth:.3','料理の腕前|「料理とかする？得意料理は？｜料理はするか。得意料理は何だ｜料理はしますか？得意料理は何ですか？」|np:.4,a:.2',
'旅行の思い出|「今まで行った中で一番よかった旅行先は？｜今まで行った中で一番よかった旅行先はどこだ｜今まで行った中で一番よかった旅行先はどこですか？」|fc:.5,warmth:.2','行ってみたい国|「死ぬまでに行きたい国ある？｜死ぬまでに行きたい国はあるか｜死ぬまでに行きたい国はありますか？」|fc:.4,a:.2','学生時代の部活|「部活何やってた？｜部活は何をやっていた｜部活は何をやっていましたか？」|cp:.2,warmth:.3,fc:.2',
'黒歴史|「人生最大の黒歴史、教えて｜人生最大の黒歴史を教えろ｜人生最大の黒歴史、教えてください」|honesty:.5,fc:.3|risk','初恋の話|「初恋っていつだった？｜初恋はいつだった｜初恋って、いつでしたか？」|honesty:.4,ac:.2','理想のデート|「理想のデートってどんなの？｜理想のデートはどんなものだ｜理想のデートって、どんなものですか？」|honesty:.3,fc:.3,ac:.2',
'好きなタイプ|「好きなタイプ、正直に｜好きなタイプを、正直に言え｜好きなタイプ、正直にお願いします」|honesty:.5,impulse:.2','元恋人の話|「前の恋人ってどんな人だった？｜前の恋人はどんな人だった｜前の恋人って、どんな人でしたか？」|honesty:.4,jealous:.3|risk','恋人に求める条件|「付き合うなら絶対これは譲れない、ってある？｜付き合うなら絶対これは譲れない、というものはあるか｜付き合うなら絶対これは譲れない、というものはありますか？」|cp:.4,a:.2',
'仕事の愚痴|「仕事どう、大変？｜仕事はどうだ、大変か｜仕事どうですか、大変ですか？」|cp:.3,ac:.3','上司あるある|「私の上司がさ…｜私の上司がな…｜私の上司がですね…」|cp:.3,fc:.2,ac:.2','年収の話|「ぶっちゃけ稼いでる？｜ぶっちゃけ稼いでいるのか｜ぶっちゃけ、稼いでいますか？」|cold:.4,impulse:.2|risk',
'将来の夢|「子どもの頃の夢、何だった？｜子どもの頃の夢は何だった｜子どもの頃の夢は、何でしたか？」|fc:.3,np:.2,honesty:.2','結婚観|「結婚願望ある？｜結婚願望はあるか｜結婚願望あります？」|honesty:.3,ac:.3|risk','子どもは欲しいか|「将来、子どもは欲しい派？｜将来、子どもは欲しい派か｜将来、子どもは欲しい派ですか？」|np:.5|risk',
'お酒の失敗談|「お酒で一番やらかしたことは？｜酒で一番やらかしたことは何だ｜お酒で一番やらかしたことは何ですか？」|fc:.5,honesty:.3','最近あった面白いこと|「最近一番笑ったことって何？｜最近一番笑ったことは何だ｜最近一番笑ったことって何ですか？」|fc:.5,warmth:.3','怖い話|「実はこの店、出るらしいよ｜実はこの店、出るらしいぞ｜実はこの店、出るらしいですよ」|fc:.3,impulse:.3',
'ゲームの話|「ゲームやる？今何やってる？｜ゲームはやるか。今は何をやっている｜ゲームはやりますか？今は何をやっていますか？」|fc:.4,a:.2','アニメ・漫画|「好きな漫画ある？｜好きな漫画はあるか｜好きな漫画あります？」|fc:.4,ac:.2','推しの話|「推しっている？｜推しはいるのか｜推しっています？」|fc:.4,jealous:.2,honesty:.2',
'筋トレ|「何か運動してる？｜何か運動しているか｜何か運動してます？」|cp:.3,lead:.2','サウナ|「サウナ好き？ととのう？｜サウナは好きか。ととのうか｜サウナは好きですか？ととのいますか？」|fc:.3,a:.2','キャンプ|「キャンプとか行く？｜キャンプには行くか｜キャンプとか行きます？」|fc:.4,warmth:.2',
'コーヒーの好み|「コーヒー派？紅茶派？｜コーヒー派か、紅茶派か｜コーヒー派ですか？紅茶派ですか？」|a:.3,caution:.2','朝型か夜型か|「朝型？夜型？｜朝型か、夜型か｜朝型ですか？夜型ですか？」|a:.3,warmth:.2','休日の起床時間|「休みの日、何時に起きる？｜休みの日は何時に起きる｜休みの日、何時に起きます？」|fc:.3,honesty:.3',
'一人暮らし事情|「一人暮らし？自炊する？｜一人暮らしか。自炊はするのか｜一人暮らしですか？自炊はしますか？」|np:.3,a:.3','家族の話|「兄弟っている？｜兄弟はいるか｜ご兄弟はいますか？」|np:.4,warmth:.2','実家のルール|「実家の謎ルールってある？｜実家の謎ルールはあるか｜実家の謎ルールはありますか？」|fc:.4,ac:.2',
'SNSの使い方|「インスタやってる？｜インスタはやっているか｜インスタやってます？」|fc:.3,jealous:.3','スマホの待ち受け|「スマホの待ち受け見せて｜スマホの待ち受けを見せろ｜スマホの待ち受けを見せてください」|fc:.4,impulse:.3','最近買ってよかったもの|「最近買ってよかったものある？｜最近買ってよかったものはあるか｜最近買ってよかったものあります？」|a:.3,fc:.3',
'好きなコンビニ|「コンビニ、どこ派？｜コンビニはどこ派だ｜コンビニ、どこ派ですか？」|fc:.3,warmth:.3','ラーメンの好み|「ラーメン何系が好き？｜ラーメンは何系が好きだ｜ラーメンは何系が好きですか？」|fc:.4,cp:.2','甘いもの|「甘いもの好き？｜甘いものは好きか｜甘いもの好きですか？」|fc:.4,np:.2',
'苦手な食べ物|「逆に、苦手な食べ物は？｜逆に、苦手な食べ物は何だ｜逆に、苦手な食べ物は何ですか？」|honesty:.4,fc:.2','得意なこと|「人に自慢できる特技ある？｜人に自慢できる特技はあるか｜人に自慢できる特技はありますか？」|fc:.4,lead:.2','意外な一面|「意外って言われることある？｜意外だと言われることはあるか｜意外だと言われることはありますか？」|honesty:.4,fc:.2',
'第一印象当て|「お互いの第一印象、言い合わない？｜お互いの第一印象を言い合うか｜お互いの第一印象、言い合いませんか？」|honesty:.5,impulse:.3|risk','共通点探し|「何か共通点あるかな｜何か共通点はあるだろうか｜何か共通点あるでしょうか」|warmth:.5,ac:.2','学生時代のあだ名|「昔のあだ名、何だった？｜昔のあだ名は何だった｜昔のあだ名は、何でしたか？」|fc:.5,honesty:.2',
'バイト経験|「学生のときのバイトは？｜学生のときのバイトは何だ｜学生のときのバイトは何でしたか？」|warmth:.3,fc:.2,cp:.2','人生で一番の買い物|「今までで一番高い買い物って何？｜今までで一番高い買い物は何だ｜今までで一番高い買い物は何ですか？」|impulse:.3,cold:.3','宝くじが当たったら|「三億当たったら何する？｜三億当たったら何をする｜三億当たったら、何をしますか？」|fc:.5,impulse:.2',
'無人島に持っていくもの|「無人島に一つだけ持っていくなら？｜無人島に一つだけ持っていくなら何だ｜無人島に一つだけ持っていくなら何ですか？」|fc:.4,a:.3','タイムマシン|「過去と未来、行けるならどっち？｜過去と未来、行けるならどちらだ｜過去と未来、行けるならどちらですか？」|a:.3,fc:.3','生まれ変わったら|「生まれ変わったら何になりたい？｜生まれ変わったら何になりたいんだ｜生まれ変わったら何になりたいですか？」|fc:.4,np:.2',
'好きな季節|「どの季節が一番好き？｜どの季節が一番好きだ｜どの季節が一番好きですか？」|warmth:.4,ac:.2','休日の理想|「完璧な休日を一日設計するなら？｜完璧な休日を一日設計するならどうする｜完璧な休日を一日設計するならどうしますか？」|fc:.4,a:.2','最近泣いたこと|「最近泣いたことある？｜最近泣いたことはあるか｜最近泣いたことはありますか？」|honesty:.5,np:.3',
'嫌いな人のタイプ|「どういう人が苦手？｜どういう人が苦手だ｜どういう人が苦手ですか？」|cp:.5,honesty:.2|risk','浮気の線引き|「どこからが浮気だと思う？｜どこからが浮気だと思う｜どこからが浮気だと思いますか？」|jealous:.5,cp:.3|risk','恋愛の失敗談|「恋愛で一番の失敗は？｜恋愛で一番の失敗は何だ｜恋愛で一番の失敗は何ですか？」|honesty:.5,fc:.2|risk',
'告白はする派かされる派か|「告白するほう？されるほう？｜告白するほうか、されるほうか｜告白するほうですか？されるほうですか？」|honesty:.4,ac:.3','連絡の頻度|「恋人とは毎日連絡したい派？｜恋人とは毎日連絡したい派か｜恋人とは毎日連絡したい派ですか？」|jealous:.4,ac:.3','デートの割り勘|「デート代って割り勘派？｜デート代は割り勘派か｜デート代って割り勘派ですか？」|cp:.4,cold:.2|risk',
'手料理と外食|「手料理作ってもらうのと外食、どっちが嬉しい？｜手料理を作ってもらうのと外食、どちらが嬉しい｜手料理を作ってもらうのと外食、どちらが嬉しいですか？」|np:.4,fc:.2','理想の休日デート|「家デートと外デート、どっち派？｜家デートと外デート、どちら派だ｜家デートと外デート、どちら派ですか？」|warmth:.3,fc:.3','お酒の好み|「何飲んでるの？それおいしい？｜何を飲んでいる。それはうまいか｜何飲んでるんですか？それおいしいですか？」|fc:.4,warmth:.3',
'今日の服装|「その服どこで買ったの？｜その服はどこで買った｜その服どこで買ったんですか？」|fc:.3,np:.2','香水の話|「なんかいい匂いしない？香水？｜何かいい匂いがする。香水か｜何かいい匂いがしませんか？香水ですか？」|impulse:.4,fc:.2','髪型の話|「髪切ったばっかり？｜髪を切ったばかりか｜髪を切ったばかりですか？」|np:.3,warmth:.3',
'幽霊を信じるか|「幽霊って信じる？｜幽霊は信じるか｜幽霊って信じますか？」|fc:.4,a:.2','UFOと宇宙|「宇宙人っていると思う？｜宇宙人はいると思うか｜宇宙人っていると思います？」|a:.4,fc:.3','陰謀論|「これ知ってる？実は…｜これを知っているか。実は…｜これ、知っていますか？実は…」|fc:.3,impulse:.3|risk',
'政治の話|「最近のニュースどう思う？｜最近のニュースをどう思う｜最近のニュースをどう思いますか？」|cp:.5,a:.3|risk','お金の使い方|「貯金する派？使う派？｜貯金する派か、使う派か｜貯金する派ですか？使う派ですか？」|a:.4,caution:.3','投資の話|「投資とかやってる？｜投資はやっているか｜投資とかやっていますか？」|a:.4,cold:.3|risk',
'資格の話|「何か資格持ってる？｜何か資格を持っているか｜何か資格持ってます？」|cp:.3,a:.3','転職の話|「転職考えたことある？｜転職を考えたことはあるか｜転職考えたことあります？」|honesty:.3,a:.3','理想の老後|「おじいちゃん・おばあちゃんになったらどうしてたい？｜年寄りになったらどうしていたい｜おじいちゃん・おばあちゃんになったらどうしていたいですか？」|np:.4,warmth:.3',
'好きな本|「最近読んだ本で面白かったのは？｜最近読んだ本で面白かったのは何だ｜最近読んだ本で面白かったのは何ですか？」|a:.5','好きな言葉|「座右の銘ってある？｜座右の銘はあるか｜座右の銘はありますか？」|cp:.4,a:.2','尊敬する人|「尊敬してる人っている？｜尊敬している人はいるか｜尊敬してる人っています？」|cp:.3,np:.3',
'最近の悩み|「最近、何か悩んでることある？｜最近、何か悩んでいることはあるか｜最近、何か悩んでいることはありますか？」|np:.4,honesty:.3','自分の短所|「自分の直したいところってある？｜自分の直したいところはあるか｜自分の直したいところはありますか？」|ac:.4,honesty:.3','褒められて嬉しかったこと|「言われて一番嬉しかった言葉は？｜言われて一番嬉しかった言葉は何だ｜言われて一番嬉しかった言葉は何ですか？」|ac:.4,np:.3',
'小さな幸せ|「最近の小さな幸せ、教えて｜最近の小さな幸せを教えろ｜最近の小さな幸せ、教えてください」|np:.4,warmth:.4','子どもの頃の遊び|「子どもの頃、何して遊んでた？｜子どもの頃、何をして遊んでいた｜子どもの頃、何をして遊んでいましたか？」|fc:.5,warmth:.2','修学旅行の思い出|「修学旅行どこ行った？｜修学旅行はどこへ行った｜修学旅行どこ行きました？」|fc:.4,warmth:.3',
'好きな芸人|「好きな芸人さんいる？｜好きな芸人はいるか｜好きな芸人さんはいますか？」|fc:.5','ものまね|「誰かのものまねできる？｜誰かのものまねはできるか｜誰かのものまねはできますか？」|fc:.6,impulse:.2','手相占い|「私、手相見てあげようか｜手相を見てやろうか｜私、手相を見てあげましょうか」|impulse:.4,fc:.3',
'心理テスト|「心理テストやっていい？｜心理テストをやるぞ、いいか｜心理テストやっていいですか？」|fc:.4,ac:.3','好きな色|「好きな色で性格わかるらしいよ｜好きな色で性格がわかるらしいぞ｜好きな色で性格わかるらしいですよ」|fc:.3,ac:.3','じゃんけんの必勝法|「じゃんけん、最初何出す派？｜じゃんけんは、最初に何を出す派だ｜じゃんけん、最初に何を出す派ですか？」|fc:.4,a:.2',
'この後の予定|「このあと、どうする？｜このあとは、どうする｜このあと、どうします？」|impulse:.5,honesty:.2','連絡先交換|「よかったら連絡先、交換しない？｜よかったら連絡先を交換しないか｜よかったら連絡先、交換しません？」|impulse:.4,honesty:.3','次の約束|「今度、ご飯でも行かない？｜今度、飯でも行かないか｜今度、ご飯でも行きませんか？」|impulse:.4,honesty:.3,ac:.1'
].map(function(s){
var p=s.split('|'),fit={};
p[2].split(',').forEach(function(kv){var m=kv.split(':');fit[m[0]]=parseFloat(m[1]);});
return{t:p[0],q:p[1],fit:fit,risk:p[3]==='risk'};
});
var OUT={
hit:['{a}の振った「{t}」で、テーブルが一気に沸いた。{f}が身を乗り出して「わかる！｜＝｜わかります！」と叫んだ。','「{t}」の話は止まらなかった。{f}と{a}は気づけば二人だけで話し込んでいた。','{a}の「{t}」の話に、{f}が涙を流して笑った。店員が様子を見に来た。','{f}「え、それ私もめっちゃわかる｜ああ、それは私もよく分かる｜え、それ私もすごくわかります」――「{t}」の話題で、テーブルの温度が上がった。'],
good:['「{t}」の話はそこそこ盛り上がった。{f}がいちばん楽しそうだった。','{a}の振った「{t}」に、{f}が乗っかった。','「{t}」の話で、{f}の意外な一面が出てきた。'],
meh:['「{t}」の話は、二往復で終わった。','{a}が「{t}」の話を振ったが、返ってきたのは「へえ｜ほう｜そうなんですか」だけだった。','「{t}」の話をしている間、{x}はスマホを見ていた。'],
flop:['{a}の振った「{t}」は、見事に滑った。沈黙を、ジョッキの氷の音が埋めた。','{a}「…あれ、この話、つまんなかった？｜…この話、つまらなかったか｜…あれ、この話、つまらなかったですか？」{x}が気まずそうに笑った。','「{t}」の話題で、場の空気が一段冷えた。{x}がトイレに立った。'],
mine:['「{t}」の話で、{x}の表情が固まった。{a}は地雷を踏んだことに気づいた。','{x}「…その話、やめない？｜…その話は、やめにしないか｜…その話、やめませんか？」――「{t}」は地雷だった。','「{t}」で{a}と{x}の意見が真っ向から割れた。空気がぴりついた。']
};
function interest(c,T,ctx){
var v=0;
for(var k in T.fit)v+=(c.tr[k]||0)*T.fit[k];
return v+ctx.rng()*0.25+(c.flags.drunk||0)/400;
}
function topicTurn(ctx){
var P=ctx.present(),rng=ctx.rng;
if(P.length<2)return;
ctx.flags.usedTopics=ctx.flags.usedTopics||{};
var a=ctx.most(P,function(c){return c.tr.fc*0.5+c.tr.lead*0.4+c.tr.warmth*0.3+(c.flags.drunk||0)/150+rng()*0.6;});
var cand=TOPICS.filter(function(T){return!ctx.flags.usedTopics[T.t];});
var T=HK.weighted(rng,cand,function(x){return 0.3+interest(a,x,ctx);});
ctx.flags.usedTopics[T.t]=1;
var scores=P.map(function(c){return{c:c,v:interest(c,T,ctx)};}).sort(function(x,y){return y.v-x.v;});
var avg=scores.reduce(function(s,x){return s+x.v;},0)/scores.length+(ctx.env.mood-50)/250;
var fan=scores[0].c===a&&scores[1]?scores[1].c:scores[0].c;
var cold=scores[scores.length-1].c===a?scores[scores.length-2].c:scores[scores.length-1].c;
var mine=T.risk&&P.some(function(c){return c!==a&&(c.tr.cp>0.65||c.tr.jealous>0.65);})&&rng()<0.45;
if(mine)cold=ctx.most(ctx.others(a),function(c){return c.tr.cp+c.tr.jealous;});
var lvl=mine?'mine':avg>0.6?'hit':avg>0.48?'good':avg>0.38?'meh':'flop';
var text=ctx.pick(OUT[lvl]).replace(/\{t\}/g,T.t);
text=a.name+T.q+' '+ctx.t(text,a).replace(/\{f\}/g,fan.name).replace(/\{x\}/g,cold.name);
var FT={'好きな食べ物':'like','ラーメンの好み':'like','料理の腕前':'like','一人暮らし事情':'like','甘いもの':'taste','コーヒーの好み':'taste','苦手な食べ物':'hate'};
var food=HK.Food&&lvl!=='mine'&&HK.Food.any(P)?[a,fan].concat(P.filter(function(c){return c!==a&&c!==fan;})):null;
var fx=function(){
var fr=food?HK.Food.intro(ctx,FT[T.t]?food:[a,fan],FT[T.t]||''):null;
if(fr){text+=fr.text;whyF='／'+fr.why;}
if(lvl==='hit'||lvl==='good'){
var g=lvl==='hit'?1.6:1;
scores.forEach(function(x){if(x.v>0.4&&x.c!==a){ctx.mod(x.c,a,{aff:4*g,att:3*g});ctx.mod(a,x.c,{aff:3*g});}});
ctx.mod2(a,fan,{att:4*g,aff:3*g},{att:4*g,aff:3*g});
P.forEach(function(c){ctx.stress(c,-4*g);});
}else if(lvl==='mine'){
ctx.mod2(a,cold,{ten:10},{ten:16,aff: -8});
P.forEach(function(c){ctx.stress(c,5);});
}else{
ctx.stress(a,lvl==='flop'?10:4);
if(cold!==a)ctx.mod(cold,a,{aff:lvl==='flop'? -4: -1});
}
};
var whyF='';
ctx.act2({actors:[a,fan],cat:lvl==='mine'?'conflict':'bond',fx:fx,text:function(){return text;},
why:function(){return'話題「'+T.t+'」×参加者の気質'+(lvl==='hit'?'（全体的に刺さった）':lvl==='mine'?'（'+cold.name+'のCP・こだわりに触れた）':lvl==='flop'?'（誰の気質にも刺さらなかった）':'')+whyF;},mag:lvl==='hit'?10:lvl==='mine'?12:3});
}
var ORDERS=[
'1|one|一発ギャグ','1|one|好きな人のタイプを発表','1|one|初恋の話をする','1|one|変顔で写真を撮られる','1|one|語尾に「にゃん」をつけて3分過ごす','1|one|全力で褒められる',
'1|one|ものまねをする','1|one|黒歴史を一つ告白','1|one|好きな人の有無を正直に答える','1|one|スマホの検索履歴を一件見せる','1|one|一番最近撮った写真を見せる','1|one|自分のチャームポイントを3つ言う',
'1|one|子どもの頃のあだ名で呼ばれる','1|one|10秒間ウインクし続ける','1|one|好きな歌のサビを歌う','1|one|好きな芸能人を発表','1|one|今日の下着の色を言う','1|one|元恋人の良かったところを言う',
'1|two|あっち向いてホイで勝負','1|two|しりとりで負けたほうが一気','1|two|お互いの第一印象を言い合う','1|two|手押し相撲','1|two|指相撲','1|two|10秒間見つめ合う',
'1|two|お互いのいいところを3つずつ言う','1|two|一緒に変顔で写真','1|two|名前を呼び捨てで呼び合う','1|two|ハイタッチ','1|two|握手しながら自己紹介','1|two|似顔絵を描き合う',
'1|all|全員で乾杯の音頭を順番に取る','1|all|全員で一番恥ずかしい話を一つずつ','1|all|全員で写真を撮る','1|all|全員で好きなタイプを発表','1|all|山手線ゲーム「好きなところ」','1|all|全員で「せーの」で好きな人を指さす',
'2|two|手を繋いで30秒','2|two|お互いの手の大きさを比べる','2|two|肩を組んで一曲歌う','2|two|恋人つなぎで1分','2|two|相手の耳元で「好き」と囁く','2|two|ポッキーゲーム',
'2|two|あーんで食べさせ合う','2|two|お姫様抱っこ','2|two|背中合わせで座って10秒','2|two|相手の髪を撫でる','2|two|膝の上に座る','2|two|おでこをくっつけて10秒',
'2|two|相手の好きなところを本気で一つ言う','2|two|カップルのふりで自撮り','2|two|相手のグラスで一口飲む','2|two|相手の手のひらに文字を書いて当てる','2|two|ハグを5秒','2|two|相手の手を握って告白の練習',
'2|king|王様にあーんで食べさせる','2|king|王様の肩を揉む','2|king|王様を全力で褒める','2|king|王様と腕を組んで写真','2|king|王様にラブレターを読み上げる','2|king|王様の言うことを次のターンまで聞く',
'2|one|好きな人の名前のイニシャルを言う','2|one|この中で一番タイプな人を指名','2|one|この中で付き合うなら誰か答える','2|one|最後にキスしたのはいつか答える','2|one|今まで付き合った人数を答える','2|one|一番最近のデートの話をする',
'2|all|全員で隣の人と手を繋いで一周','2|all|この中で一番モテそうな人を投票','2|all|この中で一番エロそうな人を投票','2|all|全員の第一印象を順番に言う','2|all|全員で一番キスが上手そうな人を投票','2|all|全員が隣の人の好きなところを言う',
'3|two|ほっぺにキス','3|two|ハグを30秒','3|two|首筋の匂いを嗅ぐ','3|two|膝枕を1分','3|two|相手の上着を着る','3|two|口移しで氷を渡す',
'3|two|壁ドンして口説く','3|two|顎クイして見つめる','3|two|耳に息を吹きかける','3|two|ポッキーゲームを最後まで','3|two|相手の膝の上で1分','3|two|手の甲にキス',
'3|king|王様のほっぺにキス','3|king|王様とハグ','3|king|王様の膝の上に座る','3|one|一番感じやすい場所を答える','3|one|今まで一番すごかった夜の話をする','3|one|自分の性癖を一つ告白',
'4|two|唇にキス','4|two|10秒ディープキス','4|two|二人でトイレに3分行ってくる','4|two|服のボタンを一つ外してあげる','4|two|首筋にキスマークをつける','4|two|今夜一緒に帰る約束をする',
'1|one|最近の失恋を語る','2|two|相手の名前を甘い声で呼ぶ','3|two|相手の指を一本ずつ握る','4|king|王様と一緒に帰る'
].map(function(s){var p=s.split('|');return{lv: +p[0],who:p[1],t:p[2]};});
function kingGame(ctx){
var P=ctx.present(),rng=ctx.rng;
if(P.length<3){if(P.length===2&& !(HK.GoukonMob&&HK.GoukonMob.count(ctx)))ctx.say({text:'二人しかいないので、王様ゲームは「じゃんけんで負けたほうが本音を一つ言う。私からね｜じゃんけんで負けたほうが本音を一つ言う。私からだ｜じゃんけんで負けたほうが本音を一つ言います。私からですね」に変更された。'});return;}
var drunk=P.reduce(function(s,c){return s+(c.flags.drunk||0);},0)/P.length;
var cap=1+ctx.env.alcohol/45+ctx.env.mood/70+drunk/40;
var rounds=3+(drunk>50?1:0);
ctx.say({text:'割り箸のくじが回ってきた。「王様だーれだ！」'});
for(var r=0;r<rounds;r++){
var king=P[rng.int(P.length)];
var pool=ORDERS.filter(function(o){return o.lv<=cap&&(o.lv>=2||cap<3||rng()<0.4);});
var heat=(king.tr.impulse+(king.flags.drunk||0)/100);
var O=HK.weighted(rng,pool,function(o){return 1+(o.lv-1)*heat*0.8;});
var others=rng.shuffle(P.filter(function(c){return c!==king;}));
var okTwo=[],okKing=others.filter(function(c){return!HK.ngPair(c,king);});
others.forEach(function(x,i){others.slice(i+1).forEach(function(y){if(!HK.ngPair(x,y))okTwo.push([x,y]);});});
var badO=function(o){return o.lv>=2&&((o.who==='two'&& !okTwo.length)||(o.who==='king'&& !okKing.length));};
if(badO(O)){var pool2=pool.filter(function(o){return!badO(o);});O=pool2.length?HK.weighted(rng,pool2,function(o){return 1+(o.lv-1)*heat*0.8;}):ORDERS[0];}
var a=others[0],b=O.who==='king'?king:others[1];
if(O.lv>=2&&O.who==='two'&&HK.ngPair(a,b)){var pr=okTwo[rng.int(okTwo.length)];a=pr[0];b=pr[1];}
if(O.lv>=2&&O.who==='king'&&HK.ngPair(a,b))a=okKing[rng.int(okKing.length)];
if(O.who==='two'&&HK.Pos&&HK.Pos.hardTop(b,a)&& !HK.Pos.hardTop(a,b)){var sw=a;a=b;b=sw;}
var text='王様は'+king.name+'。「\u2060'+(O.who==='two'?a.name+'と'+b.name+'で':O.who==='king'?a.name+'が':O.who==='one'?a.name+'が':'全員で')+O.t+'！」';
var cat=O.lv>=2?'romance':'bond',why='王様ゲーム（強さ'+O.lv+'）';
var refuse=O.lv>=3&&(a.tr.cp>0.65||(a.tr.ac>0.6&&ctx.R(a,b).att<25)|| !HK.canLove(a,b))&&rng()<0.6;
if(O.lv>=4&&O.who!=='one'&&O.who!=='all'&&HK.Pos&& !HK.Pos.okSex(a,b))refuse=true;
var fx;
if(O.who==='all'){
fx=function(){P.forEach(function(c){ctx.stress(c,-4);ctx.others(c).forEach(function(o){ctx.mod(c,o,{aff:1.5,att:O.lv>=2?1.5:0});});});};
text+=ctx.pick(['全員がやけくそで従った。','一番盛り上がったのは、言い出した'+king.name+'だった。',a.name+'の答えで場がざわついた。']);
}else if(O.who==='one'){
fx=function(){ctx.stress(a,O.lv*3);ctx.others(a).forEach(function(o){ctx.mod(o,a,{aff:2,att:O.lv>=2?2:0.5});});};
text+=a.tr.fc>0.6?a.name+'はノリノリでやりきった。':a.tr.ac>0.6?a.name+'は真っ赤になりながら、小さな声でやりきった。':a.tr.cp>0.6?a.name+'は「くだらない｜＝｜くだらないです」と言いながら、律儀にやった。':a.name+'は照れ笑いでごまかしながらやった。';
why+='。'+a.name+'の反応は気質（FC・AC・CP）で変わる';
}else if(refuse){
fx=function(){a.flags.drunk=HK.clamp((a.flags.drunk||0)+15*(6-ctx.stat(a,'drink'))/3,0,100);ctx.mod(b,a,{ten:4});ctx.mod(king,a,{ten:3});};
text+=a.name+'は「無理｜無理だ｜無理です」と首を振って、罰の一気を選んだ。'+ctx.pick(['場から「えー！」と声が上がった。',b.name+'は少しだけほっとした顔をした。',b.name+'は少しだけ残念そうだった。']);
why+='。'+a.name+(a.tr.cp>0.65?'のCP（理不尽な命令は拒む）': !HK.canLove(a,b)?'の恋愛対象外':'のAC（照れ）と惹かれの不足');
cat='conflict';
}else{
var ab=ctx.R(a,b),ba=ctx.R(b,a);
var spark=HK.canLove(a,b)&&HK.canLove(b,a)&&ab.att+ba.att>40;
fx=function(){
var g=O.lv*(spark?4:2);
if(HK.canLove(a,b))ctx.mod(a,b,{att:g,aff:2});else ctx.mod(a,b,{aff:3});
if(HK.canLove(b,a))ctx.mod(b,a,{att:g,aff:2});else ctx.mod(b,a,{aff:3});
if(O.lv>=4&&spark&&(a.flags.drunk||0)+(b.flags.drunk||0)>80)ctx.pair(a,b).kgHot=true;
};
text+=spark?ctx.pick(['二人とも、思ったより長くそのままだった。','囃し立てる声が、途中から静かになった。'+a.name+'と'+b.name+'の空気が、冗談で済まなくなっていた。',a.name+'の耳が赤い。'+b.name+'はそれに気づいて、目を逸らした。','終わったあと、二人はしばらく目を合わせなかった。']):
ctx.pick(['二人とも案外ノリノリだった。','あまりのぎこちなさに、全員が爆笑した。',b.name+'は「はい終わり！｜終わりだ！｜はい終わりです！」と三秒で切り上げた。','王様が一番照れていた。']);
why+=spark?'。もともとの惹かれ（'+Math.round(ab.att)+'／'+Math.round(ba.att)+'）が火をつけた':'。ノリでこなした';
}
ctx.act2({actors:O.who==='all'?[king]:[a,b],cat:cat,fx:fx,text:text,why:why,mag:O.lv*4});
}
}
var oldPhase=gk.phase;
gk.phase=function(ctx,s,n){
var kg=ctx.env.kingsgame;
ctx.env.kingsgame='no';
oldPhase(ctx,s,n);
ctx.env.kingsgame=kg;
ctx.flush();
if(s>=1&&s<=3){topicTurn(ctx);if(s===2||ctx.rng()<0.4)topicTurn(ctx);}
if(s===4&&kg==='yes')kingGame(ctx);
if(s===4&&kg!=='yes')topicTurn(ctx);
if(s===6)topicTurn(ctx);
};
HK.GOUKON_TOPICS=TOPICS;HK.KING_ORDERS=ORDERS;
})();
});
;
/* ==== js/drunk-goukon.js ==== */
HK.Load.def(144,'js/drunk-goukon.js',function(){
(function(){
'use strict';
var HK=window.HK,D=HK.Drunk,K=D&&D._k;
if(!K)return;
var top=K.top,fill=K.fill,react=K.react,why=K.why,behave=K.behave,SHOW=K.SHOW,TO=K.TO,CARE=K.CARE,MORN=K.MORN,OM_EX=K.OM_EX,OM_AB=K.OM_AB,OCC=K.OCC,WEAK=K.WEAK;
var GK=HK.SCENARIOS&&HK.SCENARIOS.goukon;
if(GK){
GK.events.push({
id:'dk_style',label:'酔いが回って酒癖が出る',cat:'solo',scope:'solo',
when:function(ctx,a){return(a.flags.drunk>45||ctx.stat(a,'drink')>=5&&ctx.stepIndex>=2)&& !a.flags.dkShown;},
w:function(ctx,a){return 1.2+(a.flags.drunk||0)/80;},pri:true,
run:function(ctx,a){
a.flags.dkShown=true;
var k=ctx.stat(a,'drink')>=5?'zaru':D.type(a);
return{text:fill(ctx,ctx.pick(SHOW[k]),a,null),why:why(ctx,a),mag:10};
}
});
GK.events.push({
id:'dk_to',label:'酔って気になる相手に絡む',cat:'romance',scope:'pair',
when:function(ctx,a,b){return a.flags.dkShown&&(a.flags.drunk>50||ctx.stat(a,'drink')>=5)&&(ctx.pair(a,b).dk||0)<2;},
w:function(ctx,a,b){return 0.9+ctx.R(a,b).att/60+(a.flags.drunk||0)/100;},
run:function(ctx,a,b){
var pf=ctx.pair(a,b);pf.dk=(pf.dk||0)+1;
var k=behave(ctx,a,b);
return{cat:k==='sekkyo'?'bond':k==='zaru'?'help':'romance',text:fill(ctx,ctx.pick(TO[k]),a,b)+react(ctx,a,b),why:why(ctx,a)+'／'+b.name+'の反応は'+top(b)+'（いちばん強い因子）',mag:14};
}
});
GK.events.push({
id:'dk_care',label:'酔いつぶれた人を介抱する',cat:'help',scope:'pair',
when:function(ctx,a,b){return b.flags.drunk>75&&(a.flags.drunk||0)<50&& !b.flags.dkCared&&ctx.stepIndex>=4;},
w:function(ctx,a,b){return 0.6+a.tr.np+ctx.R(a,b).att/60;},
run:function(ctx,a,b){
b.flags.dkCared=true;
ctx.mod2(a,b,{aff:4,att:3},{trust:10,aff:8,att:5});
return{text:fill(ctx,ctx.pick(CARE),b,a),why:a.name+'の面倒見（NP '+Math.round(a.eg.NP)+'）と、'+b.name+'の酔い（'+Math.round(b.flags.drunk)+'）',mag:16};
}
});
}
})();
});
;
/* ==== js/goukon-mob.js ==== */
HK.Load.def(146,'js/goukon-mob.js',function(){
(function(){
'use strict';
var HK=window.HK;
var gk=HK&&HK.SCENARIOS&&HK.SCENARIOS.goukon;
if(!gk|| !HK.Mob)return;
function L(s){return s.split('|');}
var ROLES=[
{id:'friend',full:'幹事の友達の{n}'},{id:'kazu',full:'数合わせで呼ばれた{n}'},{id:'kohai',full:'幹事の会社の後輩の{n}'},
{id:'doki',full:'幹事の大学の同期の{n}'},{id:'tobi',full:'飛び入りで来た{n}'}
];
var KINDS={
moriage:{label:'盛り上げ役',part:'橋渡し',fit:function(t){return t.fc*0.6+t.lead*0.3;}},
sewa:{label:'世話焼き',part:'橋渡し',fit:function(t){return t.np*0.7+t.warmth*0.2;}},
kuuki:{label:'空気を読まない',part:'邪魔',fit:function(t){return t.fc*0.4+t.impulse*0.4-t.a*0.3+0.2;}},
aiso:{label:'誰にでも愛想がいい',part:'当て馬',fit:function(t){return t.warmth*0.5+t.ac*0.2+t.fc*0.2;}},
mokumoku:{label:'食べに来ただけ',part:'',fit:function(t){return t.cold*0.5+t.caution*0.3;}},
zaru:{label:'酒豪',part:'',fit:function(t){return t.cp*0.3+t.a*0.2+0.15;}}
};
var KIND_IDS=Object.keys(KINDS);
var INTRO={
moriage:L('{m}は「はい、トップバッターいきます！」と誰より先に立ち上がり、名前と好きな食べ物と特技を一息で言い切った。拍手が起きた。|{m}は自己紹介の順番を勝手に決め、自分の番では「今日は皆さんの引き立て役です」と胸を張った。'),
sewa:L('{m}は自己紹介を手短に済ませると、「取り皿、足りてます？」と全員の前に皿を配り始めた。|{m}は「幹事に頼まれて来ました。今日は裏方です」と笑い、おしぼりを人数分そろえた。'),
kuuki:L('{m}は自己紹介で、最近別れた恋人の話を五分した。誰も止められなかった。|{m}は「趣味は人間観察です」と言って、全員の顔を順番にじっと見た。'),
aiso:L('{m}は一人ひとりの名前を一度で覚え、もう「〇〇さん」と呼び分けていた。|{m}は誰の自己紹介にも「えー、すごい！」と目を丸くした。たぶん全部本心だった。'),
mokumoku:L('{m}は名前だけ言って座り、お通しの小鉢を丁寧に食べ始めた。|{m}は「タダ飯と聞いて来ました」と正直に言い、なぜか少し好感を持たれた。'),
zaru:L('{m}は自己紹介の前にジョッキを一つ空け、「では改めまして」と二杯目を頼んだ。|{m}は「お酒はたしなむ程度です」と言った。その時点で三杯目だった。')
};
var DO={
moriage:L('{m}が「はい、{a}の今の話に拍手！」と手を叩いた。つられて全員が拍手し、{a}は照れくさそうに頭をかいた。|話が途切れかけたところで、{m}が「じゃあ次、{a}の番ね！」と無茶振りをした。{a}がなんとか答えると、場が一段明るくなった。|{m}はタンバリンもないのに、手拍子だけで{a}の話を盛り上げ続けた。'),
sewa:L('{m}は{a}の取り皿に、黙ってサラダと唐揚げを取り分けた。{a}は小さく頭を下げた。|{m}は{a}のグラスが空く前に「次、何にします？」とメニューを差し出した。{a}は少し肩の力が抜けたようだった。|{m}は{a}の話を「それで？それで？」と最後まで聞いた。{a}は気づけば、いつもより多く喋っていた。'),
kuuki:L('{m}が{a}に「で、前の恋人とはなんで別れたんですか？」と真顔で訊いた。空気が止まった。|{m}は{a}の話の途中で「それ、オチあります？」と言った。{a}の笑顔が少し固まった。|{m}は{a}に「さっきから全然食べてないですね。緊張してます？」と大きな声で訊いた。{a}は箸を持ち直した。'),
aiso:L('{m}は{a}の話に、誰よりも大きくうなずいていた。{a}はつい、いつもより饒舌になった。|{m}は「{a}さんの話、もっと聞きたい」と身を乗り出した。{a}はまんざらでもなさそうだった。|{m}は{a}の時計を褒め、靴を褒め、最後に笑い方を褒めた。{a}は「褒めすぎ｜褒めすぎだ｜褒めすぎですよ」と笑った。'),
mokumoku:L('{m}は唐揚げの最後の一個を、黙って{a}の皿に移した。この夜、{m}が自分から動いたのはその一回だけだった。|沈黙が落ちた瞬間、{m}がぼそっと「この店、出汁がうまいですね」と言った。なぜか{a}が吹き出し、つられて全員が笑った。|{m}は焼き鳥の串を外す係を黙々とこなしていた。{a}が「ありがとう｜＝｜ありがとうございます」と言うと、{m}は小さくうなずいただけだった。'),
zaru:L('{m}が「{a}さん、いける口でしょ」と日本酒を注いだ。{a}は断りきれずに、お猪口を空けた。|{m}は{a}に飲み比べを持ちかけた。三杯目で{a}の顔が赤くなり、{m}の顔色は最後まで変わらなかった。|{m}は{a}のグラスが空くたびに「おかわり、いっときます？」と店員を呼んだ。')
};
var COVER=L('{b}がすかさず「そういえばこの店の唐揚げ、すごくない？｜そういえばこの店の唐揚げは、すごくないか｜そういえばこの店の唐揚げ、すごくないですか」と話を変えた。{a}は助かったという顔で{b}を見た。|{b}が「はいはい、{you}、その話はまた今度！｜はいはい、{you}、その話はまた今度だ！｜はいはい、{you}、その話はまた今度にしましょう！」と笑って流した。{a}は{b}に、目だけで礼を言った。|{b}が{a}のグラスに飲み物を注ぎ足して、さりげなく話題を引き取った。');
var WING={
moriage:L('{m}が「ねえ、{a}と{b}って、さっきから話が合いすぎじゃない？」と大声で言った。{a}と{b}は同時に「そんなことない｜＝｜そんなことありません」と言い、その揃い方にまた冷やかされた。|{m}は「{a}、{b}の隣空いてるよ」と言って、{a}の背中を押した。{a}は文句を言いながらも、その席に座った。|{m}は{a}と{b}の共通点を勝手に三つ数え上げ、「もう運命でしょ」と締めくくった。二人とも笑ったが、目が合うと少し黙った。'),
sewa:L('{m}はトイレに立つついでに、{a}に「{b}さん、さっきの映画の話、すごく楽しそうでしたよ」と耳打ちした。戻ってきた{a}は、自分から{b}に映画の話を振った。|{m}は大皿を取り分けるふりをして、{a}と{b}の間の席を空けた。気づいたときには、二人は肩が触れそうな距離に座っていた。|{m}は{b}に「{a}さん、ああ見えて聞き上手なんですよ」とさりげなく言った。{b}はそれから、{a}の顔を見て話すようになった。')
};
var ATE=L('{m}が{b}に「よかったら、あとで連絡先聞いてもいいですか」と言った。|{m}は{b}の隣に移って、{b}の話にばかり笑っていた。|{m}が{b}のグラスに自分のグラスを当てて、「{b}さんと飲むの、楽しいな」と言った。|{m}が{b}に「今度、二人でその店行きましょうよ」と誘った。');
var ATE_RE={
CP:L('{b}は「ごめん、{you}とは今日はそういうのはなしで｜すまない、{you}とは今日はそういうのはなしだ｜すみません、{you}とは今日はそういうのはなしでお願いします」とあっさり断った。|{b}は「そういうのは間に合ってる｜そういうのは間に合っている｜そういうのは間に合ってます」と、きっぱり線を引いた。'),
NP:L('{b}は「ありがとう。でも{you}とも、またみんなでね｜ありがとう。だが{you}とも、また皆で会おう｜ありがとうございます。でも{you}とも、またみんなで会いましょうね」とやわらかくかわした。|{b}は笑って受け流し、そのまま{a}のほうにも話を振った。'),
A:L('{b}は「考えておく｜＝｜考えておきます」とだけ言って、話題を変えた。|{b}は丁寧に礼を言い、それ以上は何も言わなかった。'),
FC:L('{b}は「えー、{you}と？　どうしようかな｜えー、{you}とか？　どうしたものか｜えー、{you}とですか？　どうしましょうかね」とノリで返し、笑ってごまかした。|{b}は「じゃあ三十年後にね｜では三十年後だ｜じゃあ三十年後にしましょうね」と冗談にして流した。'),
AC:L('{b}は困ったように笑い、ちらりと{a}のほうを見た。|{b}は返事に詰まって、助けを求めるように{a}を見た。')
};
var ATE_JEAL=L('{a}は、そのやりとりから目を離せなかった。手元のグラスの氷が、すっかり溶けていた。|{a}の箸が止まった。自分でも驚くほど、胸の奥がざわついていた。|{a}は聞こえないふりをして、聞き耳を立てていた。|{a}は、なぜか急に飲むペースが上がった。');
var SPOIL=L('{a}と{b}がいい雰囲気になりかけたところで、{m}が「ねえ、二人で何の話？」と割って入った。二人は顔を見合わせて、少し笑った。|{a}が{b}に何か言いかけたとき、{m}が「すみません、店員さーん！」と手を挙げた。言いかけた言葉は、そのまま飲み込まれた。|{m}は{a}と{b}の間にぐいっと座り込み、「ここ、いちばん楽しそうな席だから」と言った。二人は少しだけ、名残惜しそうだった。|{a}と{b}が二人で話し込んでいると、{m}が「はい、内緒話禁止ー！」と大声を出した。{b}は苦笑いし、{a}は小さくため息をついた。');
var SEAT_WING=L('{m}が「席替えは私が決めます」と仕切り、{a}を{b}の隣に座らせた。偶然を装っていたが、誰が見ても偶然ではなかった。|{m}は割り箸のくじに細工をして、{a}と{b}を隣どうしにした。{a}だけがそれに気づいて、{m}をにらんだ。|{m}は「{a}はそっち、{b}はその隣」とさっさと指をさした。二人とも黙って従った。');
var SEAT_SPOIL=L('{m}は席替えのどさくさで、{a}と{b}の間に座った。本人に悪気はまったくなかった。|{m}は「ここ空いてる！」と、{a}と{b}の間に滑り込んだ。');
var SEAT_PLAIN=L('{m}は席替えのたびに、いちばん端の席を選んだ。|{m}は「どこでもいいです」と言って、空いた席に収まった。|席替えのあと、{m}はなぜか店員と一番仲良くなっていた。');
var KG_ONE=L('一発ギャグ|ものまね|好きな歌のサビを歌う|自分のチャームポイントを3つ言う|子どもの頃のあだ名を発表|語尾に「にゃん」をつけて3分過ごす|変顔で写真を撮られる|黒歴史を一つ告白');
var KG_TWO=L('あっち向いてホイで勝負|指相撲|手押し相撲|お互いの似顔絵を描き合う|一緒に変顔で写真');
var KG_ONE_RE={
FC:L('{a}はノリノリでやりきった。拍手がいちばん大きかったのは、王様の{m}だった。|{a}は全力でやった。{m}がお腹を抱えて笑った。'),
AC:L('{a}は真っ赤になりながら、小さな声でやりきった。{m}は「かわいいー！」と囃した。|{a}は消え入りそうな声でやった。{m}が先に照れていた。'),
CP:L('{a}は「くだらない｜＝｜くだらないですね」と言いながら、律儀にやった。{m}は満足そうにうなずいた。|{a}は眉間にしわを寄せたまま、完璧にこなした。{m}のほうが圧倒された。'),
NP:L('{a}は「しょうがないなあ｜仕方がないな｜しょうがないですね」と笑ってやった。場がほっこりした。|{a}は王様の{m}に付き合うように、楽しそうにやった。'),
A:L('{a}は淡々とやりきった。かえって面白かった。|{a}は一度手順を確認してから、正確にやった。{m}が「真面目か」と突っ込んだ。')
};
var KG_TWO_RE=L('{a}と{b}は本気で勝負した。勝ったほうが、なぜか王様の{m}とハイタッチした。|{a}と{b}のぎこちなさに、全員が爆笑した。|{a}と{b}は思ったより息が合っていて、{m}が「仲良しか」と突っ込んだ。');
var KG_WING=L('王様は{m}。割り箸の番号をこっそり見比べてから、「{a}と{b}で、10秒見つめ合う！」と言った。{a}は先に目を逸らしかけて、{b}に「まだ五秒｜まだ五秒だ｜まだ五秒ですよ」と笑われた。|王様は{m}。「{a}と{b}で、お互いのいいところを3つずつ言う！」――言い終わるころには、二人とも耳まで赤かった。|王様は{m}。「{a}と{b}で、名前を呼び捨てで呼び合う！」{a}が{b}の名前を呼ぶと、囃し立てる声が少しだけ静かになった。');
var KG_MOB={
moriage:L('王様は{a}。命令が当たったのは{m}で、一発ギャグを三連発して場を最高潮にした。|王様は{a}。{m}は「ものまね」の命令に、頼まれてもいない二人目まで披露した。'),
sewa:L('王様は{a}。{m}は「全員の飲み物を当てる」という命令を、一つも外さずにこなした。|王様は{a}。命令を受けた{m}は、なぜか全員の空いた皿を片づけてから席に戻った。'),
kuuki:L('王様は{a}。命令を受けた{m}は、一発ギャグを頼まれたのに五分の漫談をした。誰も止めなかった。|王様は{a}。「黒歴史を一つ」と言われた{m}は、三つ話した。三つ目で{a}が「{you}、もういい｜＝｜{you}、もういいです」と止めた。'),
aiso:L('王様は{a}。「王様を全力で褒める」という命令に、{m}は一分間{a}を褒め続けた。{a}は途中から耐えられずに笑い出した。|王様は{a}。{m}は命令どおりに歌い、最後に「{a}さんに捧げます」と付け足した。'),
mokumoku:L('王様は{a}。命令を受けた{m}は、無表情のまま完璧なものまねをした。一拍おいて、全員が崩れ落ちた。|王様は{a}。「一発ギャグ」と言われた{m}は、長い沈黙のあと「……以上です」と言った。それがいちばんウケた。'),
zaru:L('王様は{a}。罰ゲームの一気を、{m}は三回連続で引き受けた。顔色は変わらなかった。|王様は{a}。{m}は「次の一杯、私が全員分おごります」と勝手に命令を上書きした。')
};
var DRUNK={
moriage:L('{m}は酔って声がさらに大きくなり、隣の部屋から店員が様子を見に来た。立ち上がろうとして、そのまま座布団に崩れ落ちた。|{m}は「もう一回乾杯しよう！」を十分おきに言い続け、五回目の乾杯でグラスを持ったまま動かなくなった。'),
sewa:L('{m}は酔っても皿を片づけ続け、最後は重ねた皿を抱えたまま眠りかけた。|{m}は全員の帰り道を心配しているうちに、自分がいちばん立てなくなっていた。'),
kuuki:L('{m}は酔うとさらに空気を読まなくなり、店員を名札の名前で呼び始めたあたりで、ろれつが回らなくなった。|{m}は誰も頼んでいない恋愛相談を始め、話の途中でテーブルに突っ伏した。'),
aiso:L('{m}は酔うと誰彼かまわず肩を組み、最後は店員とも肩を組んで、そのままよろけた。|{m}は「みんな大好き！」と全員と握手して回り、最後の一人の前で足がもつれた。'),
mokumoku:L('{m}は静かに飲み続け、気づけばテーブルに突っ伏して寝ていた。|{m}は一言も喋らないまま顔だけが真っ赤になり、立ち上がろうとして壁に手をついた。'),
zaru:L('さすがの{m}も、八杯目を過ぎたあたりで目が据わり、箸を二回落とした。|{m}は日本酒の一升瓶を抱いたまま「まだいける」と言い張り、そのまま寝息を立て始めた。')
};
var CARE1=L('{a}が{m}の前に水を置き、背中をさすった。「{you}、今日はもう帰ろう｜＝｜{you}、今日はもう帰りましょう」|{a}が{m}の鞄と上着をまとめて、店の外まで肩を貸した。「{you}、歩ける？　ほら、つかまって｜{you}、歩けるか？　ほら、つかまれ｜{you}、歩けますか？　ほら、つかまってください」|{a}が{m}の代わりに、タクシーを呼んだ。「{you}の家の住所、言える？｜{you}の家の住所は、言えるか？｜{you}の家の住所、言えますか？」');
var CARE2=L('{a}と{b}が両側から{m}を支えて、店の外まで連れ出した。「せーの」の掛け声が、妙に揃っていた。|{a}が{m}の肩を支え、{b}が水と荷物を持った。言葉を交わさなくても、役割が自然に決まっていた。|{a}と{b}は二人がかりで{m}をタクシーに乗せ、走り去るのを見送ってから、顔を見合わせて笑った。');
var WATER=L('{m}が{a}の前に、黙って水のグラスを置いた。{a}は少し顔を上げた。|{m}は{a}のグラスを、こっそりウーロン茶にすり替えた。|{m}が「{a}さん、一回お手洗い行きましょ」と声をかけて、{a}を連れ出した。');
var KARA={
wing:L('{m}が「次、{a}と{b}でデュエットね！」と勝手に曲を入れた。{a}は抗議しかけたが、イントロが流れると{b}の隣でマイクを握った。|{m}は{a}と{b}のために、昔のラブソングを入れた。二人は照れながら最後まで歌った。'),
plain:L('{m}はマイクを離さず、十八番を三曲続けて歌った。|{m}はタンバリン係に徹し、誰の歌にも全力で合いの手を入れた。|{m}は一曲も歌わず、ずっと唐揚げを頼んでいた。|{m}の選んだ演歌で、なぜか全員が肩を組んだ。')
};
var BYE={
moriage:L('{M}は「また集まろうね！」と全員に手を振り、最後まで声が大きかった。|{M}は最後に全員で写真を撮り、店の前で一人だけ逆方向に帰っていった。'),
sewa:L('{M}は忘れ物がないか個室を確かめてから、最後に店を出た。|{M}は全員がタクシーや電車に乗るのを見届けてから、一人で歩いて帰った。'),
kuuki:L('{M}は帰り際、「今日、誰が一番モテてたか発表します」と言いかけて、幹事に止められた。|{M}は最後に「楽しかったです、また呼んでください」と言った。たぶん、もう呼ばれない。'),
aiso:L('{M}は全員と連絡先を交換して帰った。誰とも、それ以上にはならなかった。|{M}は店の前で一人ひとりに「今日はありがとう」と言って回り、終電に走っていった。'),
mokumoku:L('{M}は会計のときだけ現れ、きっちり割り勘分を払って静かに帰った。|{M}は「ごちそうさまでした」とだけ言って、誰より先に駅へ向かった。'),
zaru:L('{M}は「もう一軒」と言い残して、一人で夜の街へ消えていった。|{M}は最後まで顔色を変えずに、全員分の会計を計算して帰っていった。')
};
var BYE_DRUNK=L('{M}は最後、誰かに肩を借りてタクシーに押し込まれた。|{M}は店の前のベンチで、しばらく夜風に当たってから帰った。|{M}は駅の階段で一度座り込み、幹事に引きずられるようにして改札を抜けた。|{M}はコンビニで水を買い、それを飲み干してから、ふらふらと帰っていった。|{M}は翌朝、自分がどうやって帰ったのかを覚えていなかった。');
var BYE_WING=L('{M}は、{a}と{b}が並んで店を出ていくのを見送って、小さくガッツポーズをした。|{M}は帰りの電車で、{a}と{b}の背中を思い出して一人で満足そうに笑った。');
var BYE_ATE=L('{M}は最後まで、自分が{a}の背中を押したことに気づいていなかった。|{M}は帰り道、「{b}さん、脈なしだったなあ」と一人でつぶやいた。その隣を、{a}と{b}が歩いていた。');
function count(ctx){var n=Math.round(+(ctx.env&&ctx.env.mobs)||0);return Math.max(0,Math.min(4,n));}
function list(ctx){return(ctx&&ctx.gkMob)||[];}
function here(ctx){return list(ctx).filter(function(m){return!m.gone;});}
function fill(ctx,t,m,a,b){return ctx.t(HK.Mob.you(t,m,'さん').replace(/\{M\}/g,m.full).replace(/\{m\}/g,m.name),a,b);}
function top(c){return HK.topPick?HK.topPick(c):HK.voiceTop?HK.voiceTop(c):HK.egoType(c.eg).top;}
function why(m,s){return'モブ（'+m.full+'・'+KINDS[m.kind].label+'）'+(s?'：'+s:'')+'。モブは住人ではなく、恋愛・夜の相手にならない';}
function loveOk(ctx,a,b){return HK.State.pairLove(a,b)&& !HK.ngPair(a,b)&& !ctx.pair(a,b).kin&&ctx.romanceOk([a,b]);}
function crushPairs(ctx,min){
var P=ctx.present(),out=[];
P.forEach(function(a){P.forEach(function(b){if(a!==b&& !ctx.pair(a,b).couple&&ctx.R(a,b).att>=min&&loveOk(ctx,a,b))out.push([a,b]);});});
return out;
}
function pickPair(ctx,L,fn){return HK.weighted(ctx.rng,L,fn||function(p){return 0.2+ctx.R(p[0],p[1]).att/50;});}
function deed(m,k,a,b){m.deeds.push({k:k,a:a.i,b:b?b.i:null});}
function makeMobs(ctx,n){
var rng=ctx.rng,P=ctx.chars,used={},kinds={},roles=rng.shuffle(ROLES),out=[];
var gm=P.filter(function(c){return c.gender==='m';}).length,gf=P.filter(function(c){return c.gender==='f';}).length;
for(var k=0;k<n;k++){
var g=gm<gf?'m':gf<gm?'f':rng()<0.5?'m':'f';
if(g==='m')gm++;else gf++;
var m=null;
for(var t=0;t<8;t++){
m=HK.Mob.make(ctx,{gender:g});
var nm=m.name;
if(!used[nm]&& !P.some(function(c){return c.name.indexOf(nm)>=0||nm.indexOf(c.name)>=0;}))break;
}
used[m.name]=1;
var kd=HK.weighted(rng,KIND_IDS.filter(function(id){return!kinds[id];}),function(id){return Math.max(0.05,KINDS[id].fit(m.tr)+0.25);})||'moriage';
kinds[kd]=1;
var role=roles[k%roles.length];
m.likes='none';m.lock= -1;m.noR18=true;m.noMob=true;m.mob=true;
m.kind=kd;m.roleId=role.id;m.full=role.full.replace('{n}',m.name);
m.flags={drunk:0};m.stats={drink:kd==='zaru'?5:1+rng.int(4)};m.deeds=[];m.acts=0;m.said={};
out.push(m);
}
return out;
}
var setup0=gk.setup;
gk.setup=function(ctx){
setup0.apply(this,arguments);
var n=count(ctx);
ctx.gkMob=[];
if(!n)return;
ctx.gkMob=makeMobs(ctx,n);
ctx.few=function(){return false;};
ctx.pick=function(arr){
var r=this._recent||(this._recent=[]),t=this.rng.pick(arr);
if(arr&&arr.length>1&&typeof t==='string'){
for(var i=0;i<4&&r.indexOf(t)>=0;i++)t=this.rng.pick(arr);
r.push(t);if(r.length>40)r.shift();
}
return t;
};
};
function emit(ctx,o){return ctx.act2(o);}
function plain(ctx,m){
var P=ctx.present();if(!P.length)return null;
var a=HK.weighted(ctx.rng,P,function(c){return m.kind==='zaru'?0.4+ctx.stat(c,'drink')/3:m.kind==='kuuki'?0.4+c.tr.ac:1;});
var src=DO[m.kind].filter(function(t){return!m.said[t];}),line=ctx.pick(src.length?src:DO[m.kind]);
m.said[line]=1;
var text=fill(ctx,line,m,a);
if(m.kind==='kuuki'){
var cov=ctx.most(P.filter(function(c){return c!==a;}),function(c){return c.tr.np*0.6+c.tr.warmth*0.3+(ctx.R(c,a).aff+50)/200;});
if(cov){
return emit(ctx,{actors:[cov,a],cat:'bond',text:text+fill(ctx,ctx.pick(COVER),m,a,cov),
fx:function(){ctx.stress(a,5);ctx.mod2(cov,a,{aff:3},{aff:5,trust:4});},why:why(m,'空気を読まない一言を、'+cov.name+'のNP（面倒見）がかばった'),mag:6});
}
return emit(ctx,{actors:[a],cat:'solo',text:text,fx:function(){ctx.stress(a,6);},why:why(m,'空気を読まない一言'),mag:4});
}
return emit(ctx,{actors:[a],cat:'solo',text:text,why:why(m,KINDS[m.kind].label+'らしく'),mag:3,
fx:function(){
if(m.kind==='zaru')a.flags.drunk=HK.clamp((a.flags.drunk||0)+10*(6-ctx.stat(a,'drink'))/3,0,100);
else if(m.kind==='moriage'){P.forEach(function(c){ctx.stress(c,-2);});ctx.stress(a,-3);}
else ctx.stress(a,-4);
}});
}
function wing(ctx,m,src){
var L=crushPairs(ctx,18);if(!L.length)return null;
var p=pickPair(ctx,L),a=p[0],b=p[1];
var e=emit(ctx,{actors:[a,b],cat:'romance',text:fill(ctx,ctx.pick(src||WING[m.kind]||WING.moriage),m,a,b),
fx:function(){ctx.mod2(a,b,{att:6,aff:2},{att:4,aff:2});},why:why(m,KINDS[m.kind].part==='橋渡し'?'橋渡し役。'+a.name+'の惹かれ（'+Math.round(ctx.R(a,b).att)+'）に気づいて、二人をくっつけようとした':'二人をくっつけようとした'),mag:8});
if(e)deed(m,'wing',a,b);
return e;
}
function ateuma(ctx,m){
var L=crushPairs(ctx,25);if(!L.length)return null;
var p=pickPair(ctx,L,function(p){return 0.2+ctx.R(p[0],p[1]).att/40+p[0].tr.jealous;}),a=p[0],b=p[1];
var tb=top(b),re=ATE_RE[tb]||ATE_RE.NP;
var text=fill(ctx,ctx.pick(ATE),m,a,b)+fill(ctx,ctx.pick(re),m,a,b)+fill(ctx,ctx.pick(ATE_JEAL),m,a,b);
var e=emit(ctx,{actors:[a,b],cat:'romance',text:text,
fx:function(){ctx.mod(a,b,{att:7});ctx.stress(a,6);if(tb==='AC'||tb==='NP')ctx.mod(b,a,{att:3,aff:2});},
why:why(m,'当て馬。'+b.name+'に話しかけたことで、'+a.name+'の嫉妬（'+Math.round(a.tr.jealous*100)+'）と惹かれに火がついた。'+b.name+'の返しは'+tb),mag:9});
if(e)deed(m,'ate',a,b);
return e;
}
function spoil(ctx,m,src){
var L=crushPairs(ctx,30).filter(function(p){return p[0].i<p[1].i&&ctx.R(p[1],p[0]).att>=25;});if(!L.length)return null;
var p=pickPair(ctx,L),a=p[0],b=p[1];
var e=emit(ctx,{actors:[a,b],cat:'romance',text:fill(ctx,ctx.pick(src||SPOIL),m,a,b),
fx:function(){ctx.mod2(a,b,{att: -2,ten:2},{att: -2});ctx.stress(a,4);},why:why(m,'お邪魔虫。惹かれ合う二人（'+Math.round(ctx.R(a,b).att)+'／'+Math.round(ctx.R(b,a).att)+'）の間に悪気なく割って入った'),mag:6});
if(e)deed(m,'spoil',a,b);
return e;
}
function act(ctx,m){
m.acts++;
var r=ctx.rng(),e=null,part=KINDS[m.kind].part;
if(part==='橋渡し'&&r<0.5)e=wing(ctx,m);
else if(part==='当て馬'&&r<0.55)e=ateuma(ctx,m);
else if(part==='邪魔'&&r<0.45)e=spoil(ctx,m);
else if(m.kind==='zaru'&&r<0.4){
var dr=ctx.present().filter(function(c){return(c.flags.drunk||0)>55;});
if(dr.length){
var a=ctx.rng.pick(dr);
e=emit(ctx,{actors:[a],cat:'help',text:fill(ctx,ctx.pick(WATER),m,a),fx:function(){a.flags.drunk=HK.clamp(a.flags.drunk-12,0,100);ctx.stress(a,-3);},why:why(m,'酒に強いぶん、酔った'+a.name+'に気づいた'),mag:4});
}
}
return e||plain(ctx,m);
}
function actors(ctx,k){
var M=here(ctx),out=[];
while(out.length<k&&M.length){
var m=HK.weighted(ctx.rng,M,function(x){return 1/(1+x.acts);});
out.push(m);M.splice(M.indexOf(m),1);
}
return out;
}
function intro(ctx){
var M=list(ctx);
var nm=M.map(function(m){return m.full;});
ctx.say({text:(nm.length>1?nm.slice(0,-1).join('、')+'と、'+nm[nm.length-1]:nm[0])+'も、同じテーブルについていた。'});
}
function selfIntro(ctx){
list(ctx).forEach(function(m){ctx.say({text:fill(ctx,ctx.pick(INTRO[m.kind]),m)});});
}
function seat(ctx){
var M=list(ctx),w=M.filter(function(m){return KINDS[m.kind].part==='橋渡し';}),s=M.filter(function(m){return m.kind==='kuuki';});
if(w.length&&ctx.rng()<0.6&&wing(ctx,ctx.rng.pick(w),SEAT_WING))return;
if(s.length&&ctx.rng()<0.6&&spoil(ctx,ctx.rng.pick(s),SEAT_SPOIL))return;
var m=ctx.rng.pick(M);
ctx.say({text:fill(ctx,ctx.pick(SEAT_PLAIN),m)});
}
function kingRounds(ctx){
var P=ctx.present(),M=list(ctx),rng=ctx.rng;
if(!P.length)return;
if(P.length<3)ctx.say({text:'割り箸のくじが回ってきた。「王様だーれだ！」'});
var rounds=M.length>=3?2:1;
var order=rng.shuffle(M);
for(var r=0;r<rounds;r++){
var m=order[r%order.length];
if(rng()<0.55){
if(KINDS[m.kind].part==='橋渡し'&&rng()<0.6){
var e=wing(ctx,m,KG_WING);
if(e){e.why=why(m,'王様ゲームの王様。くじを見て、惹かれている二人を組ませた');continue;}
}
if(P.length>=2&&rng()<0.4){
var two=rng.shuffle(P).slice(0,2),a=two[0],b=two[1];
emit(ctx,{actors:[a,b],cat:'bond',text:'王様は'+m.name+'。「⁠'+a.name+'と'+b.name+'で'+rng.pick(KG_TWO)+'！」'+fill(ctx,ctx.pick(KG_TWO_RE),m,a,b),
fx:function(){ctx.mod2(a,b,{aff:3},{aff:3});ctx.stress(a,-2);ctx.stress(b,-2);},why:why(m,'王様ゲームの王様。色っぽくない命令'),mag:4});
}else{
var c=rng.pick(P),tc=top(c);
emit(ctx,{actors:[c],cat:'solo',text:'王様は'+m.name+'。「⁠'+c.name+'が'+rng.pick(KG_ONE)+'！」'+fill(ctx,ctx.pick(KG_ONE_RE[tc]||KG_ONE_RE.NP),m,c),
fx:function(){ctx.stress(c,4);ctx.others(c).forEach(function(o){ctx.mod(o,c,{aff:2});});},why:why(m,'王様ゲームの王様。'+c.name+'の反応は'+tc),mag:4});
}
}else{
var k=ctx.most(P,function(x){return x.tr.fc*0.4+x.tr.lead*0.3+ctx.rng()*0.5;});
emit(ctx,{actors:[k],cat:'bond',text:fill(ctx,ctx.pick(KG_MOB[m.kind]),m,k),
fx:function(){P.forEach(function(x){ctx.stress(x,-3);});},why:why(m,'王様ゲームで命令が当たった。応じ方は'+KINDS[m.kind].label+'らしく'),mag:4});
}
}
}
function drunkMob(ctx){
var M=here(ctx).filter(function(m){return m.flags.drunk>55;});
if(!M.length)return false;
var m=ctx.most(M,function(x){return x.flags.drunk/100;}),P=ctx.present();
if(!P.length)return false;
m.gone=true;
var head=fill(ctx,ctx.pick(DRUNK[m.kind]),m);
var cs=P.slice().sort(function(x,y){return(y.tr.np*0.7+y.tr.warmth*0.3)-(x.tr.np*0.7+x.tr.warmth*0.3);});
var a=cs[0],b=cs[1]&&cs[1].tr.np>0.4&&ctx.rng()<0.6?cs[1]:null;
if(b){
emit(ctx,{actors:[a,b],cat:'bond',text:head+fill(ctx,ctx.pick(CARE2),m,a,b),
fx:function(){ctx.mod2(a,b,{aff:5,trust:4},{aff:5,trust:4});},why:why(m,'酔いつぶれた（酔い '+Math.round(m.flags.drunk)+'）。'+a.name+'と'+b.name+'のNP（面倒見）で、二人がかりの介抱に'),mag:7});
}else{
emit(ctx,{actors:[a],cat:'help',text:head+fill(ctx,ctx.pick(CARE1),m,a),
fx:function(){ctx.stress(a,2);ctx.others(a).forEach(function(o){ctx.mod(o,a,{aff:2,trust:2});});},why:why(m,'酔いつぶれた（酔い '+Math.round(m.flags.drunk)+'）。'+a.name+'のNP（面倒見）'),mag:5});
}
return true;
}
function karaoke(ctx){
var M=here(ctx);if(!M.length)return;
var m=ctx.rng.pick(M);
if(KINDS[m.kind].part==='橋渡し'&&ctx.rng()<0.6&&wing(ctx,m,KARA.wing))return;
ctx.say({text:fill(ctx,ctx.pick(KARA.plain),m)});
}
var phase0=gk.phase;
gk.phase=function(ctx,s,n){
phase0.apply(this,arguments);
var M=list(ctx);
if(!M.length)return;
ctx.flush();
var lab=ctx.label||'';
if(s===0)intro(ctx);
if(s===1)selfIntro(ctx);
if(s===2)actors(ctx,M.length>=3?2:1).forEach(function(m){act(ctx,m);});
if(s===1||s===3)actors(ctx,1).forEach(function(m){act(ctx,m);});
if(s===3)seat(ctx);
if(s===4){if(ctx.env.kingsgame==='yes')kingRounds(ctx);else actors(ctx,1).forEach(function(m){act(ctx,m);});}
if(s>=5){
if(!drunkMob(ctx)&&ctx.rng()<0.6)actors(ctx,1).forEach(function(m){act(ctx,m);});
if(/カラオケ/.test(lab))karaoke(ctx);
}
ctx.flush();
};
var after0=gk.after;
gk.after=function(ctx){
after0.apply(this,arguments);
list(ctx).forEach(function(m){
var gain=ctx.env.alcohol/100*(6-m.stats.drink)*(2+ctx.rng()*4);
m.flags.drunk=HK.clamp(m.flags.drunk+gain,0,100);
});
};
var finish0=gk.finish;
gk.finish=function(ctx){
finish0.apply(this,arguments);
var M=list(ctx);
if(!M.length)return;
var C=ctx.chars,tg=ctx.flags.together||[];
function home(i,j){return tg.some(function(t){return(t.a===i&&t.b===j)||(t.a===j&&t.b===i);})||ctx.pair(C[i],C[j]).couple;}
var notes=(ctx.flags.endNotes=ctx.flags.endNotes||[]);
notes.push('同じ席にいたモブ（住人ではない）：'+M.map(function(m){return m.full+'（'+KINDS[m.kind].label+(KINDS[m.kind].part?'・'+KINDS[m.kind].part:'')+'）';}).join('、'));
M.forEach(function(m){
var won=m.deeds.filter(function(d){return(d.k==='wing'||d.k==='ate')&&d.b!=null&&home(d.a,d.b);})[0],t;
if(m.gone)t=fill(ctx,ctx.pick(BYE_DRUNK),m);
else if(won&&won.k==='wing')t=fill(ctx,ctx.pick(BYE_WING),m,C[won.a],C[won.b]);
else if(won)t=fill(ctx,ctx.pick(BYE_ATE),m,C[won.a],C[won.b]);
else if(m.flags.drunk>85&&m.kind!=='zaru')t=fill(ctx,ctx.pick(BYE_DRUNK),m);
else t=fill(ctx,ctx.pick(BYE[m.kind]),m);
notes.push(t);
});
};
HK.GoukonMob={count:count,list:list,KINDS:KINDS};
})();
});
;
/* ==== js/solo-goukon-night.js ==== */
HK.Load.def(147,'js/solo-goukon-night.js',function(){
(function(){
'use strict';
var HK=window.HK;
function L(s){return s.split('|');}
var N={
stranger:L(
'部屋に入るなり、{a}は{b}を玄関の壁に押しつけて唇を塞いだ。名前と、好きな酒の銘柄しか知らない相手だった。服を脱がせ合う手が、互いにもどかしかった。{a}が奥まで沈むと、{b}は知らない天井を見上げながら、知らない人の名前を何度も呼んだ。|'+
'「こういうの、慣れてる？」{b}の問いに、{a}は答えずにシャツのボタンを外した。慣れていないのは、指の震えで分かった。それでも重なった体はやけに相性がよくて、{b}は三度目で声を抑えるのを諦めた。|'+
'ホテルの照明を一番暗くして、{a}と{b}は手探りで互いを確かめた。初対面の体は、どこが弱いのか分からない。そのぶん、{a}は丁寧に、{b}が息を詰める場所を一つずつ探していった。最後は二人とも、名前を聞いておけばよかったと思いながら果てた。|'+
'{b}は自分から{a}の膝に跨った。「今夜だけ、ね」――そう言ったくせに、{a}に腰を掴まれて奥を突き上げられると、{b}は{a}の首にしがみついて離れなかった。|'+
'{a}は{b}をベッドに座らせ、跪いて脚の間に顔を埋めた。初めて会った人の舌に、{b}はシーツを握りしめて腰を浮かせた。そのあと、{a}がゆっくり押し入ってくるまで、{b}はもう待てなかった。'),
tipsy:L(
'二人とも足元がおぼつかないまま、ベッドに倒れ込んだ。笑いながらキスをして、笑いながら服を脱がせて、{a}が{b}の中に入った瞬間だけ、二人とも笑うのをやめた。酒の熱と体の熱が、区別できなかった。|'+
'酔った{b}は甘えるように{a}の首筋に吸いつき、「早く」と何度もねだった。{a}も酔っていて、加減が分からなかった。激しく揺さぶられるたびに、{b}は呂律の回らない声で{a}の名前を呼んだ。|'+
'{a}は酔いのせいで、なかなか達せなかった。そのぶん長く、{b}は何度も何度も果てさせられた。最後には{b}が泣きながら「もう無理」と言って、{a}はようやく{b}の奥で果てた。|'+
'シャワーを浴びる余裕もなかった。{a}は{b}をソファに押し倒し、服を半分着せたまま繋がった。酔った{b}の体はとろとろに熱くて、{a}は理性を手放すのに三秒もかからなかった。|'+
'酔いが回った{b}は大胆で、{a}を仰向けにして上に跨った。腰を揺らしながら「見て」と言う{b}を、{a}は下から何度も突き上げた。翌朝、二人とも半分しか覚えていなかった。'),
newCouple:L(
'「付き合って最初の夜が、これでいいの？」{b}が笑うと、{a}は「いいよ」と言ってキスをした。ゆっくりと服を脱がせ合い、{a}は{b}の体の一つ一つを確かめるように触れた。繋がったとき、{b}は小さく「好き」と言った。|'+
'告白の言葉をもう一度言わせたくて、{b}は{a}の上で動きを止めた。「もう一回、言って」――{a}が言うたびに、{b}の中がきゅうと締まった。二人は何度も「好き」を交わしながら、一緒に果てた。|'+
'恋人になったばかりの{b}の体を、{a}は宝物みたいに扱った。焦らすつもりはなかったのに、優しすぎる指に{b}の方が先に音を上げた。「お願い、もう……」――{a}は{b}の額にキスをしてから、ゆっくりと奥まで入った。|'+
'{a}は{b}をベッドに寝かせ、何度もキスをしながら、指を絡めたまま腰を進めた。手を離さないまま揺れ続けて、果てる瞬間も、二人は互いの名前を呼んでいた。|'+
'「恋人だから、ちゃんと全部見せて」――{a}は明かりを消させなかった。恥ずかしがる{b}の顔を見つめたまま深く繋がって、{b}が達する顔を、{a}は最後まで見ていた。'),
lover:L(
'合コンに来ていたことをお互い責めるのは、部屋に着くまでにしておいた。ドアが閉まった途端、{a}は{b}を抱き上げ、ベッドまで運んだ。嫉妬の分だけ、今夜の{a}はしつこかった。|'+
'「他の人に、あんな顔してた」――{a}は{b}の耳を噛みながら言った。{b}が謝るたびに奥を突かれ、謝り終わる前に何度も果てた。最後に{a}は、{b}の首筋に誰にでも見える痕を残した。|'+
'いつもの部屋、いつものベッドで、{a}と{b}はいつもより丁寧に抱き合った。合コンの喧騒が嘘みたいに静かな夜だった。{b}の中で果てたあと、{a}はしばらく{b}を離さなかった。|'+
'{b}は自分から{a}を押し倒した。「今夜は、私が先に選んだって証明する」――{a}の上で腰を沈め、{b}は{a}が音を上げるまで揺れ続けた。|'+
'慣れた体だからこそ、{a}は{b}の弱いところを容赦なく責めた。{b}は枕に顔を押しつけて声を殺したが、{a}はそれを許さなかった。'),
ex:L(
'「こういうのは、もうやめようって言ったのに」――{b}はそう言いながら、自分から{a}のシャツのボタンを外した。体は、別れる前と同じ場所で感じた。{a}の腕の中で果てたあと、二人は長いこと天井を見ていた。|'+
'{a}は{b}の弱いところを、まだ全部覚えていた。それが悔しくて、{b}は{a}の背中に爪を立てた。懐かしい痛みに、{a}はかえって深く{b}を抱いた。|'+
'元恋人の部屋は、家具の配置だけが変わっていた。ベッドの上で、{a}は昔より少しだけ優しかった。{b}はそれが、知らない誰かのせいなのかと思って、少しだけ泣いた。|'+
'「一回だけ」と二人で決めた。一回では終わらなかった。夜が明けるまで、{a}と{b}は別れていた時間を埋めるように、何度も求め合った。|'+
'{b}は{a}の上に跨り、昔と同じように{a}の手を自分の腰に導いた。「覚えてる？」――{a}は答える代わりに、昔と同じ強さで突き上げた。'),
friend:L(
'「友達だよね、私たち」――{b}が言うと、{a}は「今夜まではね」と言ってキスをした。長年知っていたはずの体は、知らないことだらけだった。繋がった瞬間、二人とも少し笑って、それから笑えなくなった。|'+
'{a}は{b}の服を脱がせる手を何度も止めた。「本当にいい？」――{b}は答える代わりに、自分で最後の一枚を脱いだ。友達の顔が、知らない表情に変わっていくのを、{a}は息を詰めて見ていた。|'+
'何年も隣にいたのに、{b}がこんな声を出すことを、{a}は知らなかった。知ってしまったら、もう止まれなかった。{a}は{b}の奥で果てながら、明日からどんな顔をすればいいのか考えていた。|'+
'{b}は{a}の上で、照れ隠しみたいに笑いながら腰を揺らした。「変な感じ」――そう言った{b}の声が、すぐに甘く崩れた。{a}は友達の名前を、初めてそういう声で呼んだ。|'+
'いつもの軽口を叩き合いながら服を脱いで、ベッドの上でも軽口は止まらなかった。止まったのは、{a}が{b}の中に入った瞬間だった。'),
work:L(
'明日も職場で顔を合わせる。分かっていて、{a}は{b}のネクタイ／襟元を引いた。「月曜、普通にできる？」――{b}は「無理」と言って、自分からキスをした。|'+
'{a}は{b}をデスクの代わりにベッドの端に押しつけ、後ろから抱いた。職場で聞き慣れた{b}の声が、知らない高さで漏れた。|'+
'「先輩」「後輩」と呼び合う癖が、ベッドの上でも抜けなかった。{b}が「先輩」と呼ぶたびに、{a}の腰が深く沈んだ。|'+
'職場の飲み会では見せない顔で、{b}は{a}の上に跨った。「月曜からは、また他人ね」――そう言った{b}の方が、朝まで{a}を離さなかった。|'+
'二人は明かりを消さずに抱き合った。いつも会議室で見ている相手の、誰も知らない姿を、互いに焼きつけておきたかった。'),
crush:L(
'ずっと好きだった人の体温に、{b}は触れる前から泣きそうだった。{a}はそれに気づいて、急がなかった。何度もキスをして、ゆっくりと繋がって、{b}が「夢みたい」と言うたびに、もっと深く抱いた。|'+
'{a}はずっと、{b}をこうしたかった。触れる指が震えていることを、{b}に悟られないように、わざと強く腰を掴んだ。{b}の声を聞いた瞬間、何年分もの我慢が切れた。|'+
'片想いの相手に抱かれながら、{b}は目を閉じられなかった。一瞬でも長く、{a}の顔を見ていたかった。{a}が果てる顔を見た瞬間、{b}も堪えきれずに達した。|'+
'{a}は{b}の名前を、何度も確かめるように呼んだ。呼ぶたびに{b}の中が締まって、{a}は呼ぶのをやめられなかった。|'+
'「これ、酔った勢いじゃないから」――{a}は{b}の目を見てそう言ってから、ゆっくりと奥まで入った。'),
pining:L(
'ベッドの端に並んで座ったまま、二人ともしばらく動けなかった。先に口を開いたのは{b}だった。{b}は「……私、ずっと片想いだと思ってた」と言った。{a}は目を見開いて、それから額を押さえて笑った。「それ、こっちの台詞」――笑いながら唇を重ねて、{a}がゆっくりと奥まで沈むと、{b}は泣きそうな顔で{a}の背中にしがみついた。|'+
'服を脱がせる{a}の指が震えていた。{b}はそれを見て、自分の指も同じくらい震えていることに気づいた。「緊張してる？」「……そっちこそ」――言い合って、二人とも少し笑った。相手は自分を何とも思っていないと信じてきた体が、ようやく重なった。{a}が奥まで入ったとき、{b}は堪えきれずに「好き」と言って、{a}も同時に同じ言葉を口にしていた。|'+
'「乾杯のとき、目が合ったのに、すぐ逸らしたよね」{a}が言うと、{b}は「逸らしたのはそっちでしょ」と言い返した。どちらも、嫌われていると思っていた。誤解をひとつずつ解くたびに、キスが深くなった。{a}が{b}の中に入ると、{b}は「もっと早く言えばよかった」と言いかけて、その声は甘く崩れた。|'+
'{a}は何度も、何か言いかけてはやめた。{b}も何度も、言いたそうに{a}を見上げては目を伏せた。結局、言葉より先に体が繋がった。{b}の奥で{a}が動くたびに、{b}の唇から漏れたのは、何年も飲み込んできた{a}の名前だった。|'+
'{b}は自分から{a}の膝に跨った。{b}は「どうせ、私の片想いだし」と言って、ゆっくりと腰を沈めた。その{b}を、{a}は下から強く抱き寄せた。「……ずっと、こっちの片想いだと思ってたんだけど」――{b}の動きが止まり、それから、さっきよりずっと深く{a}を求めた。|'+
'二人とも、同じ人に互いのことを相談していた。それを知ったのは、ついさっき、シーツの上でだった。「あの子に何て言ってた？」「……たぶん、そっちと同じこと」――{a}は笑って{b}の脚を開き、ゆっくりと奥まで沈んだ。{b}は笑い声の途中で息を詰めて、そのまま{a}の首に腕を回した。|'+
'キスの合間に、{b}は何度も「本当に？」と訊いた。{a}はそのたびに「本当」と答えて、答えるたびに{b}の深いところを突いた。好きなのは自分だけだと、二人とも同じ勘違いをしていた。その勘違いの年月を埋めるように、二人は夜が明けるまで何度も求め合った。'),
rival:L(
'店でさんざん言い合った二人は、部屋でもまだ言い合っていた。言い合いながら服を剥ぎ取り、言い合いながら繋がった。最後に言葉が途切れたのは、{b}の方だった。|'+
'「あんたなんか嫌い」――そう言う{b}の口を、{a}はキスで塞いだ。嫌いな相手に抱かれて、{b}は悔しいくらい感じていた。|'+
'{a}は{b}を組み敷いて、意地の悪いことばかり囁いた。{b}は睨み返しながら、腰だけは正直に{a}を求めていた。|'+
'負けず嫌い同士の夜は、どちらが先に音を上げるかの勝負になった。{a}が勝った。三回目で、{b}は「降参」と言った。|'+
'{b}は{a}を押し倒して上に乗り、主導権を奪おうとした。{a}は下から腰を掴んで突き上げ、あっという間に奪い返した。'),
fwb:L(
'いつもの部屋で、いつものように、二人は余計なことを言わずに服を脱いだ。慣れた手順で慣れた場所に触れ、{a}は慣れた強さで{b}を抱いた。それなのに今夜は、なぜか{b}の方からキスをねだった。|'+
'合コンで別の相手を探すつもりだったのに、結局いつもの相手を持ち帰った。{a}は苦笑しながら{b}の脚を開き、{b}も苦笑しながら{a}を迎え入れた。|'+
'「今日は泊まっていく？」――いつもなら訊かない言葉を、{b}は果てたあとに口にした。{a}は答えずに、もう一度{b}を抱き寄せた。|'+
'{a}は{b}の体の地図を、もう全部持っている。だから今夜は、わざと遠回りをして焦らした。{b}は文句を言いながら、三回もねだった。|'+
'気楽な関係のはずだった。{b}の中で果てる瞬間、{a}は初めて{b}の手を握った。'),
king:L(
'王様ゲームの続きだった。店でできなかったことを、二人は部屋で全部やった。命令する王様はもういないのに、{b}は「次は？」と{a}に訊き続けた。|'+
'「十秒じゃ足りなかった」――{a}は玄関で{b}に深くキスをした。十秒どころか、そのまま朝までだった。|'+
'{b}の首筋には、店でつけられたキスマークが残っていた。{a}はその上に、もう一つ重ねた。それから、王様の命令よりずっと先まで進んだ。|'+
'王様ゲームで外したボタンの続きを、{a}は一つずつ外していった。最後の一枚まで脱がせて、{a}は「命令です」と笑ってから{b}を抱いた。|'+
'店ではふざけていた二人が、部屋では一言も喋らなかった。ゲームのせいにできない夜だった。')
};
var ADD={
stranger:L(
'エレベーターの中で、もう我慢できなかった。{a}は{b}を壁際に追い詰め、ドアが開くまでキスを続けた。部屋に入ってからは、服を脱ぐ時間さえ惜しかった。|'+
'{b}は「シャワー、先に」と言いかけて、{a}に後ろから抱きすくめられた。湯気の立つ浴室で、{a}は{b}を壁に手をつかせ、そのまま深く繋がった。濡れた背中に、{a}は何度もキスを落とした。|'+
'「名前、本当はなんていうの？」――{b}が訊いたのは、もう二回果てたあとだった。{a}が耳元で教えると、{b}はその名前を呼びながら、三回目をねだった。|'+
'初めて会った人の部屋は、知らない匂いがした。{a}のベッドに沈められて、{b}はその匂いに包まれながら、何度も腰を浮かせた。|'+
'{a}は{b}の手首を頭の上でまとめて押さえ、「嫌だったら言って」と囁いた。{b}は何も言わずに脚を絡めた。一晩中、{b}は一度も「嫌」と言わなかった。'),
tipsy:L(
'{b}は酔ったまま{a}のベルトに手をかけ、うまく外せなくて笑った。{a}が自分で外すと、{b}はそのまま膝をついて、{a}のものを口に含んだ。|'+
'酔いの回った{a}は、{b}の体のどこにでもキスをした。くすぐったいと笑っていた{b}が、内腿に唇が触れた瞬間に黙り込んだ。|'+
'ベッドに着く前に、二人はリビングの床で一度果てた。それから水を一杯ずつ飲んで、今度はちゃんとベッドで、もう一度。|'+
'酔った{b}は声の大きさを気にしなかった。{a}は慌てて{b}の口を手で塞ぎ、そのせいでかえって興奮して、腰を止められなくなった。'),
newCouple:L(
'{a}は{b}の服を一枚ずつ脱がせるたびに、「好き」と言った。最後の一枚がなくなったとき、{b}は真っ赤になって「もう、分かったから」と言った。|'+
'付き合って数時間の二人は、まだ相手の好きな触れ方を知らなかった。「ここ？」「……もうちょっと、下」――探り合ううちに、{b}はとろけていった。|'+
'{b}は{a}の上で、ぎこちなく腰を揺らした。「下手でも、笑わないで」――{a}は笑わずに{b}の腰を支え、二人で同じ速さを見つけた。|'+
'恋人として初めての夜、{a}は{b}が達するたびに額にキスをした。三回目のキスで、{b}は「もう数えられない」と笑った。'),
lover:L(
'「合コンの子とは何もなかったよね？」――{b}の問いに、{a}は答える代わりに、{b}の体に一つずつキスを落とした。何もなかった証明は、朝まで続いた。|'+
'{a}はいつもより乱暴に{b}を抱いた。{b}は文句を言わなかった。むしろ、{a}の嫉妬が嬉しくて、何度も自分から腰を押しつけた。|'+
'合コン帰りの服のまま、二人はベッドに倒れ込んだ。脱がせるのももどかしく、{a}は{b}のスカート／ズボンを半分だけ下ろして繋がった。|'+
'{b}は{a}の目を見たまま、ゆっくりと腰を沈めた。「今夜、誰を見てたか、ちゃんと分かってる？」――{a}は{b}しか見ていなかった。'),
ex:L(
'{a}は昔の呼び方で{b}を呼んだ。{b}はそれを咎めずに、昔と同じ声で応えた。重なった体は、別れた理由を全部忘れていた。|'+
'{b}は{a}の新しい香水の匂いに気づいて、少しだけ傷ついた。傷ついた分、{b}は{a}をきつく抱き締めて、離さなかった。|'+
'「やっぱり、相性だけはよかったね」――果てたあと、{b}が言った。{a}は笑えなかった。|'+
'別れたときに言えなかった言葉の代わりに、{a}は{b}を何度も抱いた。{b}は最後に、{a}の胸で少しだけ泣いた。'),
friend:L(
'{b}は「笑わないでよ」と言って、自分から{a}にキスをした。{a}は笑わなかった。笑うどころか、そこから先は一度も余裕のある顔ができなかった。|'+
'友達の家に泊まるのはいつものことだった。同じ布団に入るのも、いつものことだった。{a}が{b}の背中に手を回したのだけが、いつもと違った。|'+
'{a}は{b}のことを何でも知っていると思っていた。耳の後ろが弱いことも、{a}の名前を呼ぶときに声が震えることも、今夜初めて知った。|'+
'「明日、普通に話せるかな」――{b}が不安そうに言うと、{a}は「話せなくてもいい」と言って、もう一度{b}を抱き寄せた。'),
work:L(
'{a}は{b}の社員証を首から外して、ベッドサイドに置いた。「今は、仕事のことは忘れて」――{b}が忘れられたのは、二回目からだった。|'+
'会議では言い負かされてばかりの{b}が、ベッドの上では{a}を言葉一つで翻弄した。「……いつもの仕返し」|'+
'{a}は{b}の背中に、明日スーツで隠れる場所だけを選んでキスマークを残した。月曜の朝、{b}はシャツのボタンを一つ多く留めた。|'+
'「社内恋愛は禁止じゃなかったよね」――{b}が確かめると、{a}は就業規則を思い出すのをやめて、{b}を押し倒した。'),
crush:L(
'{b}は{a}に触れられるたびに、これが現実か確かめるように{a}の顔に触れた。{a}はその手を取って、指先にキスをしてから、ゆっくりと奥まで入った。|'+
'片想いの長さの分だけ、{a}は{b}の全部を確かめたかった。どこに触れても、{b}は小さく声を漏らした。夜は長かった。|'+
'{b}は{a}にしがみついて、「ずっと好きだった」と言った。言った瞬間に中がきゅうと締まって、{a}は堪えきれずに果てた。|'+
'{a}は{b}が眠ったあとも、しばらく寝顔を見ていた。この人がずっと好きだったのだと、もう一度思った。'),
rival:L(
'「どうせ下手なんでしょ」――{b}の挑発に、{a}は無言で応えた。一時間後、{b}は前言を撤回させられていた。|'+
'{a}と{b}は、キスの主導権を奪い合ってベッドの上を転がった。最後に上を取ったのは{a}で、{b}は悔しそうに、でも抵抗せずに脚を開いた。|'+
'{b}は{a}の背中に、わざと深く爪を立てた。{a}は顔をしかめて、それ以上の強さで{b}を突き上げた。痛みも快感も、どちらが先か分からなくなった。|'+
'果てたあと、{a}と{b}はまた言い合いを始めた。言い合いの途中で、どちらからともなく、二回目が始まった。'),
fwb:L(
'「合コンで、いい人いた？」「いなかった」――そんな会話をしながら、二人はいつものように服を脱いだ。今夜の{a}は、いつもより少し優しかった。|'+
'{b}はいつものように背を向けて眠ろうとした。{a}は初めて、後ろから{b}を抱きしめて眠った。|'+
'慣れた体どうしは、言葉がいらない。{a}が腰を引けば{b}が追い、{b}が求めれば{a}が与えた。それだけの夜のはずだった。|'+
'「セフレって、こんなにキスするもの？」――{b}の問いに、{a}は答えずにもう一度キスをした。'),
king:L(
'「王様の命令は絶対、だったよね」――部屋に着くなり、{b}は{a}に命令した。「全部、脱いで」|'+
'店のトイレで三分間何があったのか、二人は誰にも話さなかった。続きは、部屋で一時間かけた。|'+
'{a}は王様ゲームの割り箸を一本、ポケットに入れて持ち帰っていた。それで{b}の顎を持ち上げて、「今夜は、ずっと王様」と言った。|'+
'ゲームの罰ゲームで{b}がつけたキスマークを、{a}は鏡で確かめて笑った。それから{b}を抱き寄せて、同じ場所にお返しをした。')
};
Object.keys(ADD).forEach(function(k){N[k]=N[k].concat(ADD[k]);});
var FF={
stranger:L('部屋に入るなり、{a}は{b}を玄関の壁に押しつけて唇を塞いだ。名前と、好きな酒の銘柄しか知らない相手だった。{a}の指が下着の中に滑り込むと、{b}は知らない天井を見上げながら、知らない人の名前を何度も呼んだ。|ホテルの照明を一番暗くして、{a}と{b}は手探りで互いを確かめた。初対面の体は、どこが弱いのか分からない。そのぶん{a}は、{b}が息を詰める場所を一つずつ指で探していった。|名前を呼び合うのも照れくさくて、二人は互いの名字のまま服を脱がせ合った。|{b}が先にシャワーを浴びるかと訊くと、{a}は「待てない」と言ってそのままベッドに押し倒した。'),
tipsy:L('二人とも足元がおぼつかないまま、ベッドに倒れ込んだ。笑いながらキスをして、笑いながら服を脱がせて、{a}の指が{b}の熱いところに触れた瞬間だけ、二人とも笑うのをやめた。|酔った{b}は甘えるように{a}の首筋に吸いつき、「早く」と何度もねだった。{a}は加減も分からないまま、{b}の脚のあいだに顔を埋めた。|{a}は酔った勢いで{b}を抱き上げようとして、二人でベッドに転がり落ちた。笑い声が、すぐに吐息に変わった。|酒の味の残るキスは、いつもより長く、いつもより深かった。'),
newCouple:L('「付き合って最初の夜が、これでいいの？」{b}が笑うと、{a}は「いいよ」と言ってキスをした。{a}は{b}の胸に、お腹に、内ももに、確かめるように唇を落としていった。{b}は小さく「好き」と言った。|{a}は{b}をベッドに寝かせ、指を絡めたまま、もう片方の手で{b}をゆっくりと追い上げた。果てる瞬間も、二人は互いの名前を呼んでいた。|「本当に、いいの？」と{a}が訊くと、{b}は返事の代わりに{a}のシャツを掴んで引き寄せた。|手を繋いでホテルに入っただけで、二人とも顔が真っ赤だった。'),
lover:L('合コンに来ていたことをお互い責めるのは、部屋に着くまでにしておいた。ドアが閉まった途端、{a}は{b}をベッドへ引っぱり込んだ。嫉妬の分だけ、今夜の{a}の指はしつこかった。|いつもの部屋、いつものベッドで、{a}と{b}はいつもより丁寧に脚を絡めた。合コンの喧騒が嘘みたいに静かな夜だった。|{a}は部屋に入るなり{b}のスマホを取り上げ、「今夜は俺だけ見てろ」と言った。|店で他の誰かに向けられた{b}の笑顔が、{a}の頭から離れなかった。'),
ex:L('{a}は{b}の弱いところを、まだ全部覚えていた。昔と同じ場所を、昔と同じ指で撫でられて、{b}は悔しそうに{a}の背中に爪を立てた。|「一回だけ」と二人で決めた。一回では終わらなかった。夜が明けるまで、{a}と{b}は別れていた時間を埋めるように、互いの肌を求め合った。|別れた夜と同じ部屋、同じ照明だった。{a}の触れ方も、何ひとつ変わっていなかった。|「最後にする」と言ったのは、これで何度目だったか。{b}は数えるのをやめて、{a}に唇を重ねた。'),
friend:L('「友達だよね、私たち」――{b}が言うと、{a}は「今夜まではね」と言ってキスをした。長年知っていたはずの体は、知らないことだらけだった。{a}の指が触れた瞬間、二人とも少し笑って、それから笑えなくなった。|何年も隣にいたのに、{b}がこんな声を出すことを、{a}は知らなかった。知ってしまったら、もう指を止められなかった。|いつもふざけ合っていた{a}の手が、今夜は震えていた。{b}はその手を自分の頬に当てた。|「後悔しない？」――{b}が訊くと、{a}は「たぶんする」と笑って、それでも唇を重ねた。'),
work:L('明日も職場で顔を合わせる。分かっていて、{a}は{b}の襟元を引いた。「月曜、普通にできる？」――{b}は「無理」と言って、自分からキスをした。|{a}は{b}の背中に、明日スーツで隠れる場所だけを選んでキスマークを残しながら、指で{b}を何度も追い上げた。|ネクタイを緩める{a}の手つきを、{b}はいつも会議室で見ていた。今夜は、それが自分に向けられていた。|「名字で呼ぶのやめて」――{b}が囁くと、{a}は初めて{b}を下の名前で呼んだ。'),
crush:L('ずっと好きだった人の体温に、{b}は触れる前から泣きそうだった。{a}はそれに気づいて、急がなかった。何度もキスをして、ゆっくりと指を沈めて、{b}が「夢みたい」と言うたびに、もっと深く抱き寄せた。|片想いの相手に触れられながら、{b}は目を閉じられなかった。一瞬でも長く、{a}の顔を見ていたかった。|何年も見ていた横顔が、今は目の前にあった。{b}は触れる前から指が震えていた。|{a}が「ずっと気づかなくてごめん」と言うと、{b}は首を振って、自分から唇を重ねた。'),
pining:L('ベッドの上で向かい合ったまま、{a}と{b}は同時に「あのね」と言って、同時に黙った。「……先にどうぞ」「そっちこそ」――譲り合っているうちに、どちらからともなく唇が重なった。{a}の指がゆっくりと{b}の中に沈むと、{b}は「ずっと、私だけだと思ってた」と震える声で言った。{a}は指を止めずに、「それ、こっちの台詞」と耳元で囁いた。|'+
'{a}は{b}の肌に唇を落としながら、何度も顔を上げて{b}の表情を確かめた。嫌がられていないか、本気で不安だった。{b}も同じくらい不安で、{a}の髪を撫でる手が震えていた。{a}の舌が{b}の熱いところに触れた瞬間、{b}は堪えきれずに{a}の名前を呼んで、二人の不安はそこで溶けた。|'+
'「今日来たのも、あなたが来るって聞いたから」――{b}がそう白状すると、{a}は真っ赤になって{b}の肩に顔を埋め、「……私も、同じ」と呟いた。相手は自分を見ていないと思い込んで、二人は何度もすれ違ってきた。そのすれ違いを取り戻すみたいに、{a}は{b}の脚のあいだに指を沈め、{b}が果てるまで一度も目を逸らさなかった。|'+
'{b}の胸元に触れる前に、{a}は「本当に、いいの？」と三回訊いた。三回目に、{b}は笑って{a}の手を自分の胸に押し当てた。「何年待ったと思ってるの」――{a}が「……待ってたのは私のほう」と言い返すと、{b}は「絶対こっち」と言い返して、そこから先は言い合う余裕がなくなった。'),
rival:L('店でさんざん言い合った二人は、部屋でもまだ言い合っていた。言い合いながら服を剥ぎ取り、言い合いながら脚を絡めた。最後に言葉が途切れたのは、{b}の方だった。|「あんたなんか嫌い」――そう言う{b}の口を、{a}はキスで塞いだ。嫌いな相手の指に、{b}は悔しいくらい感じていた。|「どっちが先にねだるか、勝負な」――{a}が言うと、{b}は「上等」と返して{a}のシャツを引き裂くように開いた。|口喧嘩の続きのようなキスだった。歯がぶつかって、二人とも舌打ちした。'),
fwb:L('いつもの部屋で、いつものように、二人は余計なことを言わずに服を脱いだ。慣れた手順で慣れた場所に触れ、{a}は慣れた指使いで{b}を追い上げた。それなのに今夜は、なぜか{b}の方からキスをねだった。|{a}は{b}の体の地図を、もう全部持っている。だから今夜は、わざと遠回りをして焦らした。{b}は文句を言いながら、三回もねだった。|「今日は合コンどうだった？」――{b}が訊くと、{a}は答えずに{b}の首筋に顔を埋めた。|いつもの手順のはずなのに、今夜の{a}は妙に丁寧だった。'),
king:L('王様ゲームの続きだった。店でできなかったことを、二人は部屋で全部やった。命令する王様はもういないのに、{b}は「次は？」と{a}に訊き続けた。|{b}の首筋には、店でつけられたキスマークが残っていた。{a}はその上に、もう一つ重ねた。それから、王様の命令よりずっと先まで、指と唇で進んだ。|「王様の命令、まだ残ってるよね」――{b}が言うと、{a}は「全部聞く」と笑って、{b}を押し倒した。|店でさせられたキスの続きを、二人は誰にも見られずにやり直した。')
};
var END={
keep:L('果てたあと、{b}は{a}の腕の中で「やっぱり、ここがいい」と言った。|朝、{a}は{b}の寝癖を直しながら「もう合コンは行かないで」と言った。{b}は「そっちこそ」と笑った。|{a}は眠る{b}の左手の薬指を、指でなぞっていた。|二人は朝まで抱き合ったまま眠り、目覚ましを三回止めた。|「次の休み、どこ行く？」――{b}のいつもの問いが、今朝はやけに嬉しかった。'),
lover:L('果てたあと、{a}は{b}の手を握ったまま言った。「ちゃんと、付き合おう」――{b}は返事の代わりに、{a}の胸に顔をうずめた。|明け方、{b}は眠っている{a}の指に、自分の指を絡めた。この人と、これからも朝を迎えたいと思った。|{a}は{b}の寝顔を見ながら、次のデートの行き先を考えていた。|「順番、逆になっちゃったね」――{b}が笑うと、{a}は「これから全部やり直そう」と言った。|シャワーのあと、{a}は{b}にキスをして「今日から恋人ね」と言った。{b}は耳まで赤くなって頷いた。'),
fwb:L('果てたあと、二人は並んで天井を見上げた。「……またしよっか」――どちらが先に言ったのかは、分からなかった。|{b}はシャワーを浴びて、さっさと服を着た。「また連絡する」――恋人の言い方ではなかった。|{a}は{b}の連絡先を「ご飯」という名前で登録した。|二人とも、「好き」とは一度も言わなかった。それがこの関係の決まりになった。|朝、{a}は{b}の分のコーヒーも淹れた。それ以上のことは、何も約束しなかった。'),
forget:L('明け方、{b}は{a}が眠っているうちに服を着て、静かに部屋を出た。メモは残さなかった。|目を覚ました{a}と{b}は、しばらく黙っていた。「……昨日のは、なかったことにしよう」――言い出したのは{b}だった。|{a}は{b}の連絡先を、帰りの電車で消した。消したあとも、名前だけは覚えていた。|「お互い、酔ってたよね」――{b}の言葉に、{a}は「うん」とだけ答えた。それで全部が終わった。|朝、二人は一言も話さずに駅まで歩き、反対方向の電車に乗った。'),
unsure:L('朝になっても、二人は昨夜のことを言葉にしなかった。連絡先だけは交換した。|{b}は帰り際に振り返って、何か言いかけてやめた。{a}も、引き止める言葉を探して見つけられなかった。|「これって、何なんだろうね」――{b}の問いに、{a}は答えられなかった。|{a}から「昨日はありがとう」とだけ届いた。{b}は返信を、三回書き直した。|二人は「またね」と言って別れた。「また」がいつなのかは、どちらも決めなかった。')
};
var END_LABEL={keep:'恋人のまま',lover:'恋人になる',fwb:'セフレに落ち着く',forget:'なかったことにする',unsure:'まだ答えが出ない'};
var AFTER=L('果てたあと、{b}は{a}の胸に頬を乗せて、規則正しい心臓の音を聞いていた。|{a}は眠ってしまった{b}の髪を、しばらく撫でていた。|二人はシャワーを浴びたあと、またベッドに戻った。|{b}は{a}の腕の中で、「また会える？」と訊いた。|明け方、{a}は{b}の寝顔を見ながら、帰るタイミングを失っていた。|果てたあと、{b}は{a}の肩に額を乗せたまま、しばらく息を整えていた。|{a}は冷蔵庫の水を一口飲んでから、残りを{b}に口移しで渡した。|果てたあと、二人は顔を見合わせて、店での会話を思い出して吹き出した。|{b}は乱れたシーツにくるまって、「酔いが醒めちゃった」と笑った。|{a}は{b}の背中に浮いた汗を、指先でなぞって乾かしていた。|果てたあとも、{a}は{b}を後ろから抱いたまま、うなじに何度も唇を落とした。');
function tie(ctx,a,b,t){
if(HK.Ties&&HK.Ties.has)return HK.Ties.has(ctx,a,b,t);
var k=a.i<b.i?a.i+'-'+b.i:b.i+'-'+a.i;
return((ctx.tiesAll||{})[k]||[]).some(function(x){return x.type===t;});
}
function kindOf(ctx,a,b){
var pf=ctx.pair(a,b),dr=((a.flags.drunk||0)+(b.flags.drunk||0))/2;
if(tie(ctx,a,b,'lover')||tie(ctx,a,b,'mate'))return'lover';
if(tie(ctx,a,b,'fwb'))return'fwb';
if(tie(ctx,a,b,'ex'))return'ex';
if(HK.Ties&&HK.Ties.from&&HK.Ties.from(ctx,a,b,'crush')&&HK.Ties.from(ctx,b,a,'crush'))return'pining';
if(tie(ctx,a,b,'crush')||tie(ctx,a,b,'almost'))return'crush';
if(tie(ctx,a,b,'rival')||tie(ctx,a,b,'enemy'))return'rival';
if(tie(ctx,a,b,'colleague')||tie(ctx,a,b,'senpai')||tie(ctx,a,b,'boss'))return'work';
if(tie(ctx,a,b,'friend')||tie(ctx,a,b,'best')||tie(ctx,a,b,'childhood')||tie(ctx,a,b,'buddy')||tie(ctx,a,b,'classmate'))return'friend';
if(pf.kgHot)return'king';
if(pf.couple)return'newCouple';
if(dr>60)return'tipsy';
return'stranger';
}
var THICK_OPEN={
stranger:L('部屋に入るなり、{a}は{b}を玄関の壁に押しつけて唇を塞いだ。名前と、好きな酒の銘柄しか知らない相手だった。|ホテルの照明を一番暗くして、{a}と{b}は手探りで互いを確かめ合った。初対面の体は、どこが弱いのかまだ分からない。'),
tipsy:L('二人とも足元がおぼつかないまま、ベッドに倒れ込んだ。笑いながらキスをして、笑いながら服を脱がせ合った。|酔った{b}は{a}の首筋に吸いつき、「早く」と何度もねだった。{a}も酔っていて、加減が分からなかった。'),
newCouple:L('「付き合って最初の夜が、これでいいの？」――{b}が笑うと、{a}は「いいよ」と言ってキスをした。|恋人になったばかりの{b}の体を、{a}は宝物みたいに扱った。'),
lover:L('合コンに来ていたことを責めるのは、部屋に着くまでにしておいた。ドアが閉まった途端、{a}は{b}を壁に押しつけた。嫉妬の分だけ、今夜の{a}はしつこかった。|「他の人に、あんな顔してた」――{a}は{b}の耳を噛みながら言った。'),
ex:L('「こういうのは、もうやめようって言ったのに」――{b}はそう言いながら、自分から{a}のシャツのボタンを外した。|{a}は{b}の弱いところを、まだ全部覚えていた。それが悔しくて、{b}は{a}の背中に爪を立てた。'),
friend:L('「友達だよね、私たち」――{b}が言うと、{a}は「今夜まではね」と言ってキスをした。|長年知っていたはずの体は、知らないことだらけだった。{a}は友達の顔が変わっていくのを、息を詰めて見ていた。'),
work:L('明日も職場で顔を合わせる。分かっていて、{a}は{b}の襟元を引いた。「月曜、普通にできる？」――{b}は「無理」と言って、自分からキスをした。|職場で聞き慣れた{b}の声が、知らない高さで漏れた。{a}はそれをもっと聞きたくなった。'),
crush:L('ずっと好きだった人の体温に、{b}は触れる前から泣きそうだった。{a}はそれに気づいて、急がなかった。|「これ、酔った勢いじゃないから」――{a}は{b}の目を見てそう言ってから、唇を重ねた。'),
pining:L('部屋に着いても、{a}と{b}はしばらく玄関に立ったままだった。「……私、ずっと片想いだと思ってた」――ほとんど同時にそう言って、二人は顔を見合わせた。それから、どちらからともなく笑って、唇を重ねた。|'+
'{a}は「酔った勢いじゃないから」と言いかけて、{b}がまったく同じ言葉を言いかけていることに気づいた。二人とも黙った。黙ったまま、{a}は{b}の頬に触れて、ゆっくりと唇を重ねた。|'+
'「いつから？」と{b}が訊いた。{a}が答えると、{b}は「……私のほうが先」と悔しそうに言った。相手は自分を何とも思っていないと思い込んでいた二人は、その答え合わせを、キスの合間に続けた。'),
rival:L('店でさんざん言い合った二人は、部屋でもまだ言い合っていた。言い合いながら服を剥ぎ取った。|「お前にだけは負けたくない」――{a}は{b}の手首を掴んで、ベッドに投げ出した。'),
fwb:L('いつもの部屋で、いつものように、二人は余計なことを言わずに服を脱いだ。|{a}は慣れた手つきで{b}の服を脱がせ、慣れた場所に唇を落とした。'),
king:L('王様ゲームの続きだった。店でできなかったことを、二人は部屋で全部やるつもりだった。|命令する王様はもういないのに、{b}は「次は？」と{a}に訊いた。')
};
var LABEL={stranger:'初対面',tipsy:'酔った勢い',newCouple:'今夜付き合ったばかり',lover:'もともと恋人',ex:'元恋人',friend:'友達の一線を越える',work:'職場の相手',crush:'片想いが叶う',pining:'両片想いが通じる',rival:'犬猿の仲',fwb:'いつものセフレ',king:'王様ゲームの続き'};
var HEAD_N={
stranger:'1:2 5 4:2 9:2',tipsy:'6 5 8:1',newCouple:'5 6 0:3',lover:'5:1 7:1 0:2',ex:'2:2 5:2 6',
friend:'1 6 7 5:2',work:'4 5:2 7:1 2:1',crush:'6:2 1:2 5:1',pining:'0:4 1:3 2:3 3:2 5:2',rival:'1:1 2:1 5:1 6:1',fwb:'1:1 5:1 8 3:2',king:'1:1 2:2 3:1 5 7 8'
};
var HEAD_FF={
stranger:'2 3',tipsy:'2 3',newCouple:'2 3 0:2',lover:'2 3 1:1',ex:'2 3',friend:'2 3',work:'2 3 1:1',
crush:'2 3 1:2',pining:'3 0:2 1:2',rival:'2 3 1:1',fwb:'2 3 1:2',king:'2 3'
};
function sentences(t){
var out=[],cur='',d=0;
for(var i=0;i<t.length;i++){
var ch=t.charAt(i);cur+=ch;
if(ch==='「')d++;else if(ch==='」'&&d>0)d--;
if(d===0&&ch==='。'){out.push(cur);cur='';}
}
if(cur)out.push(cur);
return out;
}
function heads(src,spec){
var o={};
Object.keys(spec).forEach(function(k){
o[k]=spec[k].split(' ').map(function(x){
var p=x.split(':'),s=src[k][+p[0]];
return p[1]?sentences(s).slice(0,+p[1]).join(''):s;
});
});
return o;
}
var OPEN_N=heads(N,HEAD_N),OPEN_FF=heads(FF,HEAD_FF);
var OPEN_FM={
stranger:L('部屋に入るなり、{a}は{b}をベッドに突き飛ばして、その腰に跨った。名前と、好きな酒の銘柄しか知らない相手だった。|{a}は{b}をソファに座らせ、膝の上に乗って見下ろした。「名前、まだ聞いてなかったね。……あとでいいか」|{a}は初めて会った{b}のシャツのボタンを、上から順に外していった。{b}の喉が鳴るのを、楽しそうに見下ろしながら。'),
tipsy:L('酔った{a}は{b}をベッドに押し倒し、笑いながらその上に陣取った。「逃げたら、罰ゲームね」|{a}は足元をふらつかせながらも、{b}のベルトだけは迷わず外した。|{a}は酔いに任せて{b}の上に跨り、ふにゃりと笑った。「重い？　でも、どかない」'),
newCouple:L('「最初の夜は、こっちがリードするって決めてた」――{a}はそう言って、{b}を仰向けに寝かせた。|{a}は{b}の上に跨り、照れくさそうに笑ってからキスを落とした。恋人になって、まだ数時間だった。|{a}は{b}の手を取り、自分の腰に添えさせた。「恋人の特権、だよ」'),
lover:L('ドアが閉まった途端、{a}は{b}をベッドに押し倒し、上から見下ろした。「今夜は、誰のものか教えてあげる」|{a}は{b}の両手首をシーツに押さえつけ、首筋に痕を残した。「他の子に見せられないようにしておく」|合コンで{b}が笑いかけていた相手の顔を思い出しながら、{a}は{b}の上に跨った。'),
ex:L('{a}は昔と同じように{b}の胸に手をついて跨った。「覚えてる？　この角度」|別れる前と同じ場所に、{a}は{b}を押し倒した。{b}は抵抗しなかった。|{a}は{b}の弱いところを、まだ全部覚えていた。上から順に、昔と同じ順番で触れていった。'),
friend:L('「友達だよね、私たち」と言いかけた{b}の口を、{a}は自分の唇で塞いで、そのまま押し倒した。|{a}は{b}の上に乗って、「今さら照れないでよ」と笑った。笑っている{a}の耳も、真っ赤だった。|長年の友達の上に跨って、{a}は初めて{b}を見下ろした。知らない顔が、そこにあった。'),
work:L('{a}は{b}のネクタイを掴んで引き寄せ、ベッドに座らせてから膝に跨った。「月曜は、何もなかった顔をして」|職場ではいつも並んで歩く{b}を、{a}は今夜、上から見下ろしていた。|{a}は{b}の社員証を外して放り投げ、「今は肩書きなし」と言って押し倒した。'),
crush:L('{a}は{b}の上に跨り、ずっと見ていた顔を、今夜は真上から見下ろした。|「ずっと、こうしたかった」――{a}は{b}をベッドに寝かせ、震える指でシャツのボタンを外していった。|{a}は{b}の頬を両手で挟み、確かめるように何度も唇を重ねてから、ゆっくりと押し倒した。'),
pining:L('{a}は{b}をベッドに座らせ、その膝に跨った。{a}が「どうせ、私の片想いなんでしょ」と拗ねたように言うと、{b}はその腰を両手で引き寄せた。「……ずっと、こっちの片想いだと思ってた」――{a}は一瞬黙って、それから泣き笑いの顔で{b}を押し倒した。|'+
'{a}は{b}を仰向けに寝かせて、上から見下ろした。何度も言いかけてはやめてきた言葉を、今夜は真上から落とした。「好き。……ずっと」――{b}が目を見開いて「先に言われた」と呟くと、{a}は笑って、その唇を塞いだ。|'+
'{a}は{b}のシャツのボタンを外す指を、途中で止めた。「嫌われてると思ってた」――{b}が「こっちこそ」と返すと、{a}は小さく息を吐いて、残りのボタンを一気に外した。{b}の上に跨った{a}の頬は、酒のせいではなく赤かった。'),
rival:L('「店での続き、こっちで決着つけよう」――{a}は{b}を押し倒し、手首をまとめて押さえつけた。|{a}は{b}の胸に手をついて見下ろし、「降参って言ったら、許してあげる」と笑った。|言い合いの途中で、{a}は{b}をベッドに突き倒して跨った。「黙らせるなら、こっちが早い」'),
fwb:L('いつもの部屋で、{a}はいつものように{b}を仰向けにして、その上に跨った。|{a}は慣れた手つきで{b}のベルトを外し、「今日は、こっちの好きにさせて」と言った。|{a}は{b}の弱いところを知り尽くしていた。だから今夜は、わざと遠回りをして焦らした。'),
king:L('「王様の命令、続きをどうぞ」――{a}は{b}をベッドに座らせ、自分はその膝の上に乗った。|{a}は店から持ち帰った割り箸で{b}の顎を持ち上げた。「今夜の王様は、こっち」|{a}は「命令。動かないで」と言って{b}を仰向けにし、上からゆっくりと服を脱がせていった。')
};
var OPEN_PS={
proud:L('{b}は「勘違いするなよ。酔ってるだけだ」と言い捨てたが、{a}の手を払いのけはしなかった。|{b}は余裕のある顔を作ろうとして、{a}に耳を噛まれた瞬間、それが崩れた。|「先に誘ったのはそっちだからな」――{b}はそう念を押してから、{a}の首に腕を回した。'),
stern:L('{b}は「明日に響かない程度に」と真面目な顔で言った。言った本人が、いちばん守れそうになかった。|{b}は脱いだ服をきちんと畳もうとして、{a}にその手を取られた。|{b}は「こういうのは、本来……」と言いかけて、{a}の唇に続きを塞がれた。'),
tsun:L('「か、勘違いしないで。酔ってるだけだから」――{b}は真っ赤な顔でそう言って、{a}の袖を離さなかった。|{b}は「別に、期待とかしてないから」と三回言った。三回とも、{a}の腕の中で言った。|{b}はそっぽを向いたまま、{a}の手を自分の腰へ引き寄せた。'),
gentle:L('{b}は「お店、楽しかったね」と笑って、{a}の頬にそっと手を添えた。|{b}は緊張している{a}に気づいて、「ゆっくりでいいよ」と囁いた。|{b}は{a}の上着を受け取ってハンガーに掛け、それから振り返って{a}を抱きしめた。'),
devoted:L('{b}は「選んでもらえて、うれしい」と小さく言って、{a}の胸に額を預けた。|{b}は{a}の顔色をうかがいながら、「どうしたら、いい？」と訊いた。|{b}は{a}の手を両手で包み、「今夜は、全部あげる」と言った。'),
cool:L('{b}は「酔いのせいにする気はない」と淡々と言って、自分の上着を脱いだ。|{b}は表情ひとつ変えずに{a}を見上げた。ただ、握り返した指だけが熱かった。|{b}は「時間、まだあるな」と腕時計を外し、ベッドサイドに置いた。'),
free:L('{b}は「やっと二人きり」と笑って、靴を脱ぎ捨てるなり{a}に飛びついた。|{b}は「今夜は楽しんだもん勝ちでしょ」と言って、{a}のシャツのボタンに手をかけた。|{b}は鼻歌まじりに服を脱ぎ散らかし、ベッドの上から{a}を手招きした。'),
shy:L('{b}は部屋の明かりを消してほしいと、消え入りそうな声で頼んだ。|{b}は{a}の顔を見られずに、ずっと胸元ばかり見ていた。|{b}は「お酒、もうちょっと飲んでくればよかった」と小さく笑って、{a}の服の裾を握った。'),
polite:L('{b}は「ふつつか者ですが」と冗談めかして頭を下げ、それから自分で笑ってしまった。|{b}は「よろしければ、シャワーを先に」と言いかけて、{a}に引き寄せられた。|{b}は丁寧に靴を揃えてから、ためらいがちに{a}の手を取った。')
};
var PEAK_PS={
proud:L('{b}は荒い息のまま{a}を睨んだ。「……酒のせいだ。全部」――その声に、もう棘はなかった。|{b}は崩れた顔を見られまいと腕で目元を覆い、それでも{a}の手は握ったままだった。|{b}は「次は、こうはいかない」と掠れた声で言った。次がある前提だった。'),
stern:L('{b}はしばらく天井を見つめ、乱れた呼吸を整えようとした。整わなかった。|{b}は「……取り乱した」とだけ言って、{a}の胸に額を押しつけた。|{b}は崩れた自分の声を思い出して、耳まで赤くなった。それでも、{a}から離れようとはしなかった。'),
tsun:L('{b}は「……今の、なし。聞かなかったことにして」と枕に顔を埋めた。|{b}は{a}の胸を軽く叩いた。「ばか」――叩いた手は、そのまま{a}の背中に回った。|{b}は顔を背けたまま、{a}の指に自分の指を絡めた。'),
gentle:L('{b}は息を整えながら、{a}の汗ばんだ髪を指で梳いた。「……すごかったね」|{b}はとろけた顔のまま微笑んで、{a}の頬にキスをした。|{b}は{a}を抱き寄せて、背中をゆっくり撫でた。店の喧騒が、遠い昔のことみたいだった。'),
devoted:L('{b}は潤んだ目で{a}を見上げた。「……気持ちよかった、ですか」――自分のことより先に、それを訊いた。|{b}は{a}の腕にしがみついたまま、「離れないで」と小さく言った。|{b}は震える指で{a}の頬に触れ、嬉しそうに目を細めた。'),
cool:L('{b}は乱れた前髪の下で目を閉じ、「……計算外だ」とだけ呟いた。|{b}はしばらく黙っていたが、やがて小さく息を吐いた。「酔いが、いっぺんに醒めた」|{b}のいつもの冷静な顔は、まだ戻ってこなかった。'),
free:L('{b}は笑いながら仰向けに転がった。「やば、最高。合コン来てよかった」|{b}は息を切らしたまま{a}に抱きつき、「ね、もう一回」とねだった。|{b}は満足そうに伸びをして、{a}の肩に頭を乗せた。'),
shy:L('{b}は毛布を頭まで引き上げて、中から「……見ないで」と言った。|{b}は自分の声を思い出して、{a}の胸に顔を押しつけたまま動けなくなった。|{b}は真っ赤な顔で、毛布の端から{a}を盗み見た。'),
polite:L('{b}は乱れた息の合間に、「……失礼、いたしました」と律儀に言った。{a}は思わず笑った。|{b}は崩れた髪を整えようとして、指がまだ震えていることに気づいた。|{b}は「とても、その……よかったです」と言って、恥ずかしそうに目を伏せた。')
};
var AFTER_PS={
proud:L('{b}はシャワーから戻ると、何事もなかったような顔でベッドの端に座った。首筋の痕だけが、何かあったことを物語っていた。|{b}は「水」とだけ言って手を出した。{a}がペットボトルを渡すと、ふんと鼻を鳴らして受け取った。|{b}は乱れたシーツを見下ろし、「……悪くはなかった」と認めた。'),
stern:L('{b}は脱ぎ散らかした服を一枚ずつ拾い、きちんと畳んで椅子に置いた。|{b}は「明日は何時に起きる」と訊いた。いつもの声に戻っていた。|{b}は時計を見て、「あと四時間は眠れる」と言った。'),
tsun:L('{b}は背中を向けたまま、「……寒いから」と言って{a}の腕を自分の体に回させた。|{b}は「別に、また会いたいとか思ってないから」と言った。誰も訊いていなかった。|{b}は{a}の寝顔を見ていたことに気づかれて、慌てて目をそらした。'),
gentle:L('{b}は冷蔵庫から水を二本出して、一本を{a}に手渡した。|{b}は{a}の頭を胸に抱いたまま、ゆっくりと背中を撫で続けた。|{b}は{a}の寝顔を見ながら、店でのことを一つずつ思い出して笑った。'),
devoted:L('{b}は眠る{a}にそっと毛布をかけ直してから、隣に潜り込んだ。|{b}は「何か、飲むもの持ってきます」と言って、{a}の返事を待たずにベッドを抜け出した。|{b}は{a}の腕枕の中で、眠るのが惜しくて目を開けていた。'),
cool:L('{b}は天井を見上げたまま、「合コンの収穫としては、上出来だな」と呟いた。|{b}はシャワーを浴びて戻ってくると、もういつもの涼しい顔だった。|{b}は{a}の腕の中で、珍しく何も考えずに目を閉じた。'),
free:L('{b}はコンビニの袋からアイスを出して、「半分こしよ」と笑った。|{b}は裸のままスマホをいじり、「今日の店、また行こうよ」と言った。|{b}は大の字になって、「あー、楽しかった」と言った。'),
shy:L('{b}は服を着るあいだ、ずっと{a}に背中を向けていた。|{b}は毛布にくるまったまま、「……おやすみなさい」とだけ言った。|{b}は自分の首筋の痕を鏡で見つけて、声にならない声を上げた。'),
polite:L('{b}は乱れた髪を手櫛で整え、「お水、いただけますか」と訊いた。|{b}は身支度を終えると、ベッドの{a}に向かって小さく頭を下げた。|{b}は{a}の隣で、背筋を伸ばしたまま眠ろうとして、結局{a}の肩にもたれた。')
};
function psOf(c){return(HK.personaOf?HK.personaOf(c):c.persona)||c.persona||'gentle';}
function slash(t,rng){return t.replace(/／襟元/g,'').replace(/スカート／ズボン/g,rng()<0.5?'スカート':'ズボン');}
function okList(l,f){var o=l.filter(f);return o.length?o:l;}
HK.GoukonNight=function(ctx,a,b,out){
var LW=HK.Lewd;
if(HK.SAFE_ON||(LW&&LW.lv(ctx.env)==='low'))return null;
var o=HK.Pos?HK.Pos.order(a,b,[a,b]):[a,b],A=o[0],B=o[1];
var k=kindOf(ctx,a,b),rng=ctx.rng;
var ff=HK.Pos&&HK.Pos.ff(A,B);
var fm= !ff&&HK.Pos&&HK.Pos.isF(A)&& !HK.Pos.isF(B);
var ps=psOf(B),pk0=function(arr){return rng.pick(arr);},pk=HK.Ero&&HK.Ero.freshPick?HK.Ero.freshPick(ctx,pk0):pk0;
var noTop=function(l){return!(HK.Pos&&HK.Pos.hardTop(A,B)&& /\{b\}は(自分から)?\{a\}を押し倒|\{a\}を仰向けにして|翻弄/.test(l));};
var pool=ff?FF[k]:N[k].filter(noTop);
var short=LW?LW.short(ctx.env,rng):false,ero=LW&&LW.ero(ctx.env)&&HK.ThickEro,high=LW&&LW.high(ctx.env);
var endT=out&&END[out]?pk(END[out]):'';
var af=AFTER.filter(function(l){return!(/^果てたあと/.test(l)&& /^果てたあと/.test(endT))&& !(out==='keep'&& /また会える|帰るタイミング/.test(l))&& !(out==='lover'&& /帰るタイミング/.test(l));});
var glow=rng()<0.55?pk(AFTER_PS[ps]||AFTER_PS.gentle):rng()<0.6&&af.length?pk(af):'';
if(!endT&& !glow)glow=pk(AFTER);
var TS=HK.ThickSex;
if(TS&&THICK_OPEN[k]&& !short){
var opens=THICK_OPEN[k].concat(ff?OPEN_FF[k]:fm?OPEN_FM[k]:OPEN_N[k]).filter(noTop);
var op=slash(pk(opens),rng)+(rng()<0.7?pk(OPEN_PS[ps]||OPEN_PS.gentle):'');
var tail=(rng()<0.75?pk(PEAK_PS[ps]||PEAK_PS.gentle)+'\n\n':'');
if(high&&HK.ThickEro)tail+=HK.ThickEro.again(ctx,pk,A,B,!!ero,false)+'\n\n';
tail+=glow+endT;
var r=ero?HK.ThickEro.scene({S:ctx,pick:pk,rng:rng,a:A,b:B,style:TS.style(A),open:op,after:tail,place:'goukon',again:false})
:TS.scene({pick:pk,rng:rng,a:A,b:B,style:TS.style(A),open:op,after:tail,place:'goukon',jealous:k==='lover'});
var tx=ctx.t(r.text,A,B);
if(ff&&HK.FF)tx=HK.FF.fix(ctx,tx,A,B);
return{text:'\n\n'+tx,kind:k,label:LABEL[k]+(out?'→'+END_LABEL[out]:'')};
}
var t;
if(ero){
var sh=HK.ThickEro.short({S:ctx,pick:pk,a:A,b:B,open:slash(pk(okList((ff?OPEN_FF[k]:fm?OPEN_FM[k]:OPEN_N[k]),noTop)),rng),again:high,after:glow+endT});
var tx2=ctx.t(sh.text,A,B);
if(ff&&HK.FF)tx2=HK.FF.fix(ctx,tx2,A,B);
return{text:tx2,kind:k,label:LABEL[k]+(out?'→'+END_LABEL[out]:'')};
}
if(fm&&HK.FM&&HK.FM.pick){
var st=HK.FF&&HK.FF.styleOf?HK.FF.styleOf(A):'gentle',fp={pick:pk};
t=pk(OPEN_FM[k])+HK.FM.pick(fp,'body',st)+HK.FM.pick(fp,'climax',st);
}else t=slash(pk(pool),rng);
if(high&&HK.ThickEro)t+=HK.ThickEro.again(ctx,pk,A,B,false,true);
t+=glow+endT;
var txt=ctx.t(t,A,B);
if(ff&&HK.FF)txt=HK.FF.fix(ctx,txt,A,B);
return{text:txt,kind:k,label:LABEL[k]+(out?'→'+END_LABEL[out]:'')};
};
HK.GoukonNight.POOLS={N:N,FF:FF,AFTER:AFTER,END:END,THICK_OPEN:THICK_OPEN,OPEN_N:OPEN_N,OPEN_FF:OPEN_FF,OPEN_FM:OPEN_FM,OPEN_PS:OPEN_PS,PEAK_PS:PEAK_PS,AFTER_PS:AFTER_PS};
})();
});
;
/* ==== js/mini-extra-a.js ==== */
HK.Load.def(152,'js/mini-extra-a.js',function(){
(function(){
'use strict';
var E=window.HK.E;
window.HK.addMini('goukon',[
E('g_wink','romance','p+','fc*.5+att/70','att>25','ab:att4;ba:att5','{a}は{b}にだけ分かるように、片目をつぶってみせた。|{a}は{b}の話に、わざと大げさに頷いてみせた。|{a}は{b}と目が合うたびに、小さく笑った。|{a}は{b}に、テーブルの下で親指を立てた。|{a}は{b}の冗談に、一番最初に笑った。|{a}は{b}にだけ聞こえる声で「今の面白かった｜今のは面白かった｜今の、面白かったです」と言った。'),
E('g_age','bond','p+','fc*.3+warmth*.3','','ab:aff2;ba:aff2','{a}は{b}の年齢を当てようとして、五歳若く言って喜ばれた。|{a}は{b}と同い年だと分かって、学生時代の話で盛り上がった。|{a}は{b}が年上だと知って、急に敬語になった。|{a}は{b}に「若く見えるね｜若く見える｜若く見えますね」と言った。本心だった。|{a}は{b}と干支が同じだと分かって、なぜか握手をした。|{a}は{b}の生まれ年の流行りを言い当てた。'),
E('g_handsign','romance','p','att/50+fc*.2','att>30&ratt>25','ab:att5;ba:att5;sec','{a}と{b}は、テーブルの下で小指を絡めた。|{a}は{b}の手のひらに、指で文字を書いた。|{a}と{b}は、誰にも気づかれずに目配せを交わした。|{a}は{b}の靴の先を、自分の靴の先で小さくつついた。|{a}と{b}は、同じタイミングで席を立ち、廊下で鉢合わせた。|{a}は{b}に、二人だけの合図を決めようと囁いた。'),
E('g_parent','bond','p+','honesty*.3+np*.3','','ab:trust4;ba:trust4','{a}は{b}に、実家の親から結婚をせかされていると話した。|{a}は{b}に、親の介護のことを少しだけ話した。|{a}は{b}に、兄弟の子どもの写真を見せた。|{a}は{b}に、親とは仲がいいのかと訊いた。|{a}は{b}に、家族で行った旅行の失敗談を話した。|{a}は{b}に、母親の料理の話をして懐かしがった。'),
E('g_diet','bond','p+','ac*.3+fc*.3','','ab:aff2;ba:aff2','{a}は「私、今ダイエット中で｜私は今ダイエット中だ｜私、今ダイエット中なんです」と言いながら、唐揚げに手を伸ばした。|{a}は{b}と、筋トレのプロテインの味の話で盛り上がった。|{a}は{b}に、最近始めたヨガの話をした。|{a}は{b}に「明日から本気出す｜＝｜明日から本気を出します」と宣言した。|{a}は{b}と、健康診断の結果を見せ合いそうになってやめた。|{a}は{b}に、甘いものは別腹だと力説した。'),
E('g_travel','bond','p+','fc*.4+warmth*.2','','ab:aff3;ba:aff3','{a}は{b}に、一人旅で行った島の話をした。|{a}と{b}は、行ってみたい国を三つずつ挙げた。|{a}は{b}に、海外で財布を盗まれた話をした。|{a}は{b}と、同じ温泉地に行ったことがあると分かって盛り上がった。|{a}は{b}に、旅先で見た夕日の写真を見せた。|{a}は{b}に「今度どこか行こう｜＝｜今度どこか行きましょう」と言いかけて、飲み込んだ。'),
E('g_fail_conf','solo','s+','ac*.4+att/100','step>=3','as:8','{a}は言いたいことを、結局一つも言えなかった。|{a}は誘い文句を三回練習して、三回とも言えなかった。|{a}は二人きりになれる機会を、自分から逃した。|{a}は連絡先を聞くタイミングを、ずっと探していた。|{a}は「また今度｜＝｜また今度、お願いします」と言われて、それ以上何も言えなかった。|{a}はトイレの鏡に向かって「次こそ｜次こそだ｜次こそです」と言った。'),
E('g_kanji','bond','p+','a*.3+fc*.3','','ab:aff2;ba:aff2','{a}は{b}の名前の漢字を、テーブルに指で書いてもらった。|{a}は{b}の珍しい苗字の由来を聞いた。|{a}は{b}の名前を、きれいだと褒めた。|{a}は{b}と、名前の画数占いをした。|{a}は{b}のあだ名の候補を、五つ考えた。|{a}は{b}に、自分の名前の由来を話した。'),
E('g_doubt','conflict','p','jealous*.4+a*.3','att>30','ab:trust-4;as:4','{a}は{b}の左手の薬指に、指輪の跡がないか確かめた。|{a}は{b}のスマホに、誰かからの頻繁な通知が来るのが気になった。|{a}は{b}が誰にでも同じ笑顔を向けていることに気づいた。|{a}は{b}の「彼女いない｜彼女はいない｜彼女はいません」が本当かどうか、疑っていた。|{a}は{b}が自分以外とも連絡先を交換しているのを見た。|{a}は{b}の優しさが、営業用なのではないかと思った。')
]);
})();
});
;
/* ==== js/incidents-goukon.js ==== */
HK.Load.def(414,'js/incidents-goukon.js',function(){
(function(){
'use strict';
var HK=window.HK,K=HK.IncSocial;
if(!K)return;
HK.INCIDENTS=HK.INCIDENTS||{};
var R=K.R,names=K.names,fav=K.fav,pointAll=K.pointAll;
HK.INCIDENTS.goukon=[
{
id:'point',label:'一番気になる人を同時に指さす',from:2,min:3,
run:function(ctx){
ctx.incident('「じゃあ、せーので一番気になる人を指さそう｜では、せーので一番気になる者を指す｜では、せーので一番気になる人を指さしましょう」と誰かが言い出した。');
pointAll(ctx,ctx.present().filter(function(c){return c.flags.cagePair==null;}),'せーの。','同時指さし');
}
},
{
id:'ex',from:1,
run:function(ctx){
var P=ctx.present(),a=ctx.rng.pick(P);
ctx.incident(a.name+'のスマホが鳴った。画面には元恋人の名前。');
if(a.tr.honesty>0.6)ctx.act2({actors:[a],cat:'bond',fx:function(){ctx.others(a).forEach(function(o){ctx.mod(o,a,{trust:4});});},text:ctx.t('「元カレ……いや、元カノか。どっちでもいいや｜元カレ……いや、元カノか。どちらでもいい｜元カレ……いえ、元カノでした。どちらでもいいです」{a}は画面を伏せて笑った。',a),why:a.name+'の本音の出やすさ'});
else if(a.tr.cold>0.55)ctx.act2({actors:[a],cat:'solo',text:ctx.t('{a}は表情を変えずに着信を切り、電源ごと落とした。',a),why:a.name+'のドライさ'});
else ctx.act2({actors:[a],cat:'solo',fx:function(){ctx.stress(a,14);},text:ctx.t('{a}は「ちょっと｜少し失礼する｜ちょっと失礼します」と言って席を外し、しばらく戻ってこなかった。',a),why:a.name+'のAC：切り捨てられない'});
ctx.others(a).forEach(function(o){
if(R(ctx,o,a).att>35)ctx.act2({actors:[o,a],cat:'conflict',fx:function(){ctx.mod(o,a,{att:4,ten:6});ctx.stress(o,8);},text:ctx.t('{a}は、{b}が戻ってくるまでグラスの氷ばかり見ていた。',o,a),why:o.name+'は'+a.name+'に惹かれていた（嫉妬・執着 '+Math.round(o.tr.jealous*100)+'）'});
});
}
},
{
id:'drunkard',label:'隣の席の酔客に絡まれる',from:2,min:2,
run:function(ctx){
var P=ctx.present(),t=ctx.most(P,function(c){return R(ctx,P[0]===c?P[1]:P[0],c).att/100+ctx.rng()*0.5;});
ctx.incident('隣の席の酔客が、'+t.name+'に絡み始めた。');
var def=ctx.most(ctx.others(t),function(o){return o.tr.cp*0.5+o.tr.aggr*0.3+o.tr.np*0.3+Math.max(0,R(ctx,o,t).att)/80;});
var hide=ctx.most(ctx.others(t).filter(function(o){return o!==def;}),function(o){return o.tr.caution;});
if(def&&def.tr.cp*0.5+def.tr.aggr*0.3+def.tr.np*0.3>0.35){
ctx.act2({actors:[def,t],cat:'help',mag:12,fx:function(){ctx.mod(t,def,{att:10,aff:8,trust:10});},
text:ctx.t('「連れなんで｜連れだ｜連れなんです」{a}が立ち上がって、{b}と酔客の間に入った。',def,t),why:def.name+'の'+(def.tr.cp>def.tr.np?'CP（筋を通す）':'NP（守る）')});
}else ctx.act2({actors:[t],cat:'solo',fx:function(){ctx.stress(t,15);},text:ctx.t('誰も動かなかった。{a}は愛想笑いでやり過ごした。',t),why:'全員の慎重さが勝った'});
if(hide&&hide.tr.caution>0.65)ctx.act2({actors:[hide,t],cat:'solo',fx:function(){ctx.mod(t,hide,{att: -5});},text:ctx.t('{a}はずっとメニューで顔を隠していた。',hide),why:hide.name+'の慎重さ'});
}
},
{
id:'spill',from:1,
run:function(ctx){
var P=ctx.present(),clumsy=ctx.most(P,function(c){return c.tr.impulse+(c.flags.drunk||0)/100;});
var wiper=ctx.most(ctx.others(clumsy),function(o){return o.tr.np;});
var laugher=ctx.most(ctx.others(clumsy),function(o){return o.tr.fc*o.tr.cp;});
ctx.incident(clumsy.name+'の肘が当たって、グラスが倒れた。');
if(wiper)ctx.act2({actors:[wiper,clumsy],cat:'help',fx:function(){ctx.mod2(wiper,clumsy,{aff:2},{aff:7,att:4});},text:ctx.t('{a}が真っ先におしぼりを掴んで、{b}の袖を拭いた。',wiper,clumsy),why:wiper.name+'のNP'});
if(laugher&&laugher!==wiper&&laugher.tr.fc*laugher.tr.cp>0.35)ctx.act2({actors:[laugher,clumsy],cat:'conflict',fx:function(){ctx.mod(clumsy,laugher,{ten:clumsy.tr.ac>0.6?10:2,aff:clumsy.tr.fc>0.6?3: -3});},text:ctx.t('{a}は手を叩いて笑った。「やると思った｜＝｜やると思いました」',laugher,clumsy),why:laugher.name+'のFC×CP'});
}
},
{
id:'love_talk',from:1,min:2,
run:function(ctx){
var P=ctx.present();
ctx.incident('話題が恋愛遍歴に移った。');
var talker=ctx.most(P,function(c){return c.tr.honesty+(c.flags.drunk||0)/150;});
var dodger=ctx.most(ctx.others(talker),function(o){return o.tr.ac+o.tr.cold*0.5-o.tr.honesty;});
ctx.act2({actors:[talker],cat:'bond',fx:function(){ctx.others(talker).forEach(function(o){ctx.mod(o,talker,{trust:5,att:o.tr.fc>0.5?4:1});});},text:ctx.t('{a}は、三年付き合って振られた話を、自分で笑いながら話し切った。',talker),why:talker.name+'の本音の出やすさ'});
if(dodger)ctx.act2({actors:[dodger],cat:'solo',fx:function(){ctx.others(dodger).forEach(function(o){if(R(ctx,o,dodger).att>25)ctx.mod(o,dodger,{att:5});});},text:ctx.t('{a}は「普通だよ｜普通だ｜普通ですよ」としか言わなかった。それがかえって気になった者もいた。',dodger),why:dodger.name+'のAC／ドライさ。隠すほど興味を引く'});
}
},
{
id:'bill',
when:function(ctx,s,n){return s>=n-3;},
w:function(){return 2;},
run:function(ctx){
var P=ctx.present();
ctx.incident('会計の伝票が回ってきた。');
var payer=ctx.most(P,function(c){return c.tr.cp*0.4+c.tr.np*0.4+c.tr.fc*0.2;});
var counter=ctx.most(ctx.others(payer),function(o){return o.tr.a*o.tr.cp;});
ctx.act2({actors:[payer],cat:'help',fx:function(){ctx.others(payer).forEach(function(o){ctx.mod(o,payer,{att:o.tr.ac>0.55?6:2,aff:3});});},text:ctx.t('{a}が伝票を取り上げた。「今日は多めに出すよ｜今日は多めに出す｜今日は多めに出しますよ」',payer),why:payer.name+'のCP・NP（面倒を見る側に立つ）'});
if(counter&&counter.tr.a*counter.tr.cp>0.4)ctx.act2({actors:[counter,payer],cat:'conflict',fx:function(){ctx.mod2(counter,payer,{ten:4},{ten:6});},text:ctx.t('{a}は電卓アプリを開いて、一円単位で割り直した。',counter),why:counter.name+'のA×CP'});
}
},
{
id:'lastTrain',label:'終電を逃す',
when:function(ctx,s,n){return s>=n-2;},
w:function(){return 2;},
run:function(ctx){
var P=ctx.present();
var a=ctx.most(P,function(c){return c.tr.impulse+(c.flags.drunk||0)/100;});
var b=fav(ctx,a,P,20)||ctx.closest(a);
if(!b)return;
ctx.incident(a.name+'が終電を逃した。');
var rb=R(ctx,b,a);
ctx.act2({actors:[b,a],cat:rb.att>30?'romance':'help',fx:function(){ctx.mod2(b,a,{att:rb.att>30?8:2},{att:8,trust:6});},
text:ctx.t(rb.att>30?'「うち、ここから歩いて十分だけど｜うちは、ここから歩いて十分だが｜うち、ここから歩いて十分ですけど」と{a}が言った。{b}は少し考えて、頷いた。':'{a}はタクシー代を貸してやった。{b}は「絶対返す｜＝｜絶対返します」と三回言った。',b,a),why:b.name+'の側の惹かれ（'+Math.round(rb.att)+'）'});
}
}
];
})();
});
;
HK.Load.def(414.5,'tone:scen-goukon',function(){
HK.Load.toneData("mixed",{"F":[
["恋愛で一番の失敗は？","恋愛で一番の失敗って、何です？",1],
["コーヒー派？紅茶派？","コーヒー派ですか？　紅茶派？",1],
["〈〉の明日に乾杯","〈〉さんの明日に、乾杯です",1],
["その仕事、向いてそう","その仕事、向いてそうですね",1],
["好きなタイプ、正直に","好きなタイプ、正直に教えてくださいよ",1],
["明日から本気出す","明日から本気出します。たぶんね",1],
["最近、何かハマっているものはありますか？","最近なにかハマってます？　教えてよ",1],
["意外だと言われることはありますか？","意外って言われることあります？　私はよくあるよ",1],
["幽霊って信じますか？","幽霊って信じます？　私はちょっと信じてる",1],
["…その話、やめませんか？","…その話、やめません？　空気重いじゃん",1],
["前の恋人って、どんな人でしたか？","前の恋人ってどんな人でした？　怒らないから言ってよ",1],
["最近、何か悩んでいることはありますか？","最近、何か悩んでることあります？　聞くよ",1],
["投資とかやっていますか？","投資とかやってます？　私、興味あるんだよね",1],
["料理はしますか？得意料理は何ですか？","料理とかします？得意料理は？　食べてみたいな",1],
["死ぬまでに行きたい国はありますか？","死ぬまでに行きたい国あります？　私はいっぱいあるよ",1],
["今度、ご飯でも行きませんか？","今度、ご飯でも行きません？　近くにいい店あるよ",1],
["私、何型か当ててもいいですか？","私、何型か当ててもいいですか？　絶対A型でしょ",1],
["サウナは好きですか？ととのいますか？","サウナ好きですか？ととのいます？　私はハマってるよ",1],
["一人暮らしですか？自炊はしますか？","一人暮らしですか？自炊する？",1],
["スマホの待ち受けを見せてください","スマホの待ち受け見せてください。減るもんじゃないじゃん",1],
["誰かのものまねはできますか？","誰かのものまねできます？　やってみてよ",1],
["これ、知っていますか？実は…","これ知ってます？実は…すごいんだよ",1],
["好きな芸人さんはいますか？","好きな芸人さんいます？　私はね、ベタだけど漫才派だよ",1],
["お互いの第一印象、言い合いませんか？","お互いの第一印象、言い合いません？　正直にだよ",1],
["自分の直したいところはありますか？","自分の直したいところってあります？　私はいっぱいあるよ",1],
["ご出身はどちらですか？","出身どこですか？　なまり、ちょっとあるよね",1],
["子どもの頃、何をして遊んでいましたか？","子どもの頃、何して遊んでました？　私は外ばっかりだったよ",1],
["子どもの頃の夢は、何でしたか？","子どもの頃の夢、何でした？　笑わないからさ",1],
["実家の謎ルールはありますか？","実家の謎ルールってあります？　うちはあるよ",1],
["人に自慢できる特技はありますか？","人に自慢できる特技あります？　私はないんだよね",1],
["どこからが浮気だと思いますか？","どこからが浮気だと思います？　私はLINEからかな",1],
["最近のニュースをどう思いますか？","最近のニュース、どう思います？　私はちょっと怖いな",1],
["初恋って、いつでしたか？","初恋っていつでした？　教えてよ",1],
["ぶっちゃけ、稼いでいますか？","ぶっちゃけ稼いでます？　顔に出てるよ",1],
["髪を切ったばかりですか？","髪切ったばっかりですか？　似合ってるじゃん",1],
["座右の銘はありますか？","座右の銘ってあります？　かっこいいの教えてよ",1],
["部活は何をやっていましたか？","部活何やってました？　当ててみよっか",1],
["撮ってもらえますか？","撮ってもらえますか。かわいく撮ってよ",1],
["私、手相を見てあげましょうか","私、手相見てあげましょうか。けっこう当たるよ",1],
["次は、二人で会いたいです。……恋人になってほしいです","次は、二人で会いたいです。……恋人に、なってほしい",1]],
"O":{
"次は私が幹事やる":"次は私が幹事やります。任せてよ",
"え、それ私もめっちゃわかる":"え、それ私もめっちゃわかります。あるあるだよね",
"人生最大の黒歴史、教えてください":"人生最大の黒歴史、教えてください。笑わないからさ",
"手料理作ってもらうのと外食、どっちが嬉しい？":"手料理作ってもらうのと外食、どっちが嬉しいです？",
"好きなタイプは？":"好きなタイプは？　教えてくださいよ",
"初恋っていつでした？":"初恋っていつでした？　教えてよ",
"今度ここ、私と行こうよ":"今度ここ、私と行きましょうよ。絶対楽しいって",
"キャンプとか行きます？":"キャンプとか行きます？　私、結構好きなんだ",
"MBTIって何型？":"MBTIって何型です？",
"お酒で一番やらかしたことは？":"お酒で一番やらかしたことって何です？",
"これって何なんだろうね":"これって何なんでしょうね。何だろ",
"最近読んだ本で面白かったのは？":"最近読んだ本で面白かったのって何です？",
"デート代って割り勘派？":"デート代って割り勘派です？",
"修学旅行どこ行きました？":"修学旅行どこ行きました？　私は京都だったな",
"幽霊って信じます？":"幽霊って信じます？　私はちょっと信じてる",
"まだ一杯目みたいなもん":"まだ一杯目みたいなもんですよ。全然いけるって",
"みんな、休みの日って何してる？":"みなさん、休みの日って何してます？　私は寝てばっかりだよ",
"優しい人がいい":"優しい人がいいです。それだけでいいよ",
"みんなそう言う":"みなさんそう言うんですよね。ずるいなあ",
"なんで別れたの？":"なんで別れたんですか？　気になるじゃん",
"私の上司がさ…":"私の上司がですね…聞いてよ、ひどいんだから",
"今度一緒に行こう":"今度一緒に行きましょう。絶対楽しいよ",
"朝型ですか？夜型ですか？":"朝型ですか？夜型ですか？　私は完全に夜だよ",
"休みの日って何してるんですか？":"休みの日って何してるんですか？　気になるじゃん",
"どこからが浮気だと思います？":"どこからが浮気だと思います？　私はLINEからかな",
"今の面白くない？":"今の面白くないですか？　笑ってよ",
"カラオケで絶対歌う曲ってあります？":"カラオケで絶対歌う曲ってあります？　私はいつも同じだよ",
"その話、私もっと聞きたい":"その話、私もっと聞きたいです。続けてよ",
"好きな漫画あります？":"好きな漫画あります？　語ろうよ",
"今度、ご飯でも行きません？":"今度、ご飯でも行きません？　近くにいい店あるよ",
"SNSにはあげないで":"SNSにはあげないでください。絶対だよ",
"前にも会ったことあるよね":"前にも会ったことありますよね。気のせいじゃないよね？",
"最近の小さな幸せ、教えてください":"最近の小さな幸せ、教えてください。何でもいいよ",
"さっきの人、どう思う？":"さっきの人、どう思います？　正直に言ってよ",
"好きな色で性格わかるらしいですよ":"好きな色で性格わかるらしいですよ。やってみようよ",
"おじいちゃん・おばあちゃんになったらどうしてたい？":"おじいちゃん・おばあちゃんになったらどうしてたいですか？　私は縁側でのんびりかな",
"私、こういう場、本当は苦手":"私、こういう場、本当は苦手なんです。内緒だよ",
"前の恋人ってどんな人でした？":"前の恋人ってどんな人でした？　怒らないから言ってよ",
"…その話、やめません？":"…その話、やめません？　空気重いじゃん",
"誕生日いつですか？私、星座で当てます":"誕生日いつですか？私、星座で当てるよ",
"今までで一番高い買い物って何？":"今までで一番高い買い物って何ですか？　気になるじゃん",
"その写真、送って":"その写真、送ってください。待ってるね",
"心理テストやっていいですか？":"心理テストやっていいですか？　当たるんだよ",
"私、いつか猫を飼いたい":"私、いつか猫を飼いたいんです。絶対かわいいじゃん",
"家デートと外デート、どっち派？":"家デートと外デート、どっち派ですか？　私は家かな",
"お互いの第一印象、言い合いません？":"お互いの第一印象、言い合いません？　正直にだよ",
"何考えてるか分かんないよね":"何考えてるか分かんないですよね。不思議な人だよ",
"転職考えたことあります？":"転職考えたことあります？　私はしょっちゅうだよ",
"よかったら連絡先、交換しません？":"よかったら連絡先、交換しません？　嫌ならいいけどさ",
"波乱万丈だね":"波乱万丈ですね。ドラマみたいじゃん",
"とりあえず唐揚げとポテト":"とりあえず唐揚げとポテトでお願いします。定番じゃん",
"恋人とは毎日連絡したい派？":"恋人とは毎日連絡したい派ですか？　私はしたいかな",
"こっちの方が話しやすい":"こっちの方が話しやすいです。落ち着くじゃん",
"今度どこか行こう":"今度どこか行きましょう。どこがいい？",
"最近一番笑ったことって何？":"最近一番笑ったことって何ですか？　私はね、昨日の猫動画だよ",
"じゃんけん、最初何出す派？":"じゃんけん、最初何出す派ですか？　当ててあげよっか",
"インスタやってます？":"インスタやってます？　フォローしてよ",
"結婚願望あります？":"結婚願望あります？　正直に言ってよ",
"若く見えるね":"若く見えますね。ほんとだよ",
"甘いもの好きですか？":"甘いもの好きですか？　私は大好きなんだよね",
"一番好きな食べ物、せーので言いません？":"一番好きな食べ物、せーので言いません？　絶対当てるよ",
"私、前の恋愛で懲りた":"私、前の恋愛で懲りたんです。もうこりごりだよ",
"お前、いいやつだな":"あなた、いい人ですね。ちょっと見直したよ",
"好きなところを三つ言い合う":"好きなところを三つ言い合いましょう。照れないでよ",
"私、友達が結婚していって焦る":"私、友達が結婚していって焦ってるんです。笑わないでよ",
"駆けつけ一杯！":"駆けつけ一杯です！　ほら、飲んで飲んで！",
"コンビニ、どこ派ですか？":"コンビニ、どこ派ですか？　私はね、断然あそこだよ",
"生まれ変わったら何になりたい？":"生まれ変わったら何になりたいですか？　私は猫かな",
"今日、来てよかった？":"今日、来てよかったですか？　私はよかったよ",
"センスいいね":"センスいいですね。どこで買ったの？",
"…あれ、この話、つまんなかった？":"…あれ、この話、つまんなかったですか？　正直に言ってよ",
"俺、こう見えて意外と":"私、こう見えて意外とですね……笑わないでよ",
"今度、二人でご飯行かない？":"今度、二人でご飯行きません？　いい店知ってるよ",
"どの季節が一番好きですか？":"どの季節が一番好きですか？　私は秋かな",
"撮ってもらえますか":"撮ってもらえますか。かわいく撮ってよ",
"どういう人が苦手ですか？":"どういう人が苦手ですか？　私だったらやだな",
"私、この曲しか知らない":"私、この曲しか知らないんです。笑わないでよ",
"今日から恋人ね":"今日から恋人ですね。よろしくね",
"ちゃんと、付き合おう":"ちゃんと、付き合いましょう。本気だよ",
"こういうの、慣れてる？":"こういうの、慣れてます？　余裕そうじゃん",
"名前、本当はなんていうの？":"名前、本当はなんていうんですか？　教えてよ",
"お互い、酔ってたよね":"お互い、酔ってましたよね。忘れてよ",
"同じ方向だから":"同じ方向ですから。一緒に帰ろうよ",
"貯金する派？使う派？":"貯金する派ですか？使う派？",
"これって、何なんだろうね":"これって、何なんですかね。不思議だよね",
"恋人だから、ちゃんと全部見せて":"恋人ですから、ちゃんと全部見せてよ"}});
HK.Load.toneData("noja",{"F":[
["…あれ、この話、つまんなかった？","…おや、この話、つまらなかったかの？"],
["…その話、やめません？","…その話、やめぬか？"],
["お互いの第一印象、言い合いません？","お互いの第一印象、言い合わぬか？"],
["何飲んでるんですか？それおいしい？","何を飲んでおるのじゃ？それはうまいのか？"],
["心理テストやっていいですか？","心理テストをやってもよいかの？"],
["恋人とは毎日連絡したい派？","恋人とは毎日連絡を取りたい方かの？"],
["私、こういう場、本当は苦手","私は、こういう場は実のところ苦手なのじゃ"],
["私の上司がさ…","私の上司がのう…"],
["私、いつか猫を飼いたい","私は、いつか猫を飼いたいのう",1],
["休みの日って何してるんですか？","休みの日は何をしておるのじゃ？",1],
["みんな、休みの日って何してる？","皆、休みの日は何をしておる？",1],
["あの人苦手","あの者は苦手じゃ",1],
["なんで別れたの？","な、なぜ別れたのじゃ？",1],
["家デートと外デート、どっち派？","家で過ごすのと外へ出るの、どちらが好みじゃ？",1],
["宇宙人っていると思います？","宇宙人はおると思うかの？",1],
["私、今ダイエット中で","私は、今ダイエット中でのう",1],
["まだ一杯目みたいなもん","まだ一杯目のようなものじゃ",1],
["今度一緒に行こう","今度、共に行こうぞ",1],
["最近観た映画で一番よかったのは？","近頃観た映画で、一番よかったのは何じゃ？",1],
["転職考えたことあります？","転職を考えたことはあるかの？",1],
["このあと、ちゃんと言いたいことがある。……好きだ、たぶん","このあと、ちゃんと言うておきたいことがある。……好きなのじゃ、たぶんな",1],
["初対面でこんなことを言うのは、変だろうか。……付き合ってほしい","会うたばかりでこんなことを言うのは、妙かのう。……私と付き合うてはくれぬか",1],
["今日会ったばかりだ……まずは友達から、ではだめか","今日会うたばかりじゃ……まずは友からでは、ならぬかのう",1],
["吸わないのに来たのか？","吸わぬのに来たのか？",1],
["何かいい匂いがする。香水か","何やらよい匂いがするのう。香水か",1],
["酔っているだろう","酔うておるじゃろう",1],
["その服はどこで買った","その服、どこで買うたのじゃ",1],
["年寄りになったらどうしていたい","年を取ったら、どうしていたいのじゃ",1],
["さっきの話の続きは、あとでしよう","さっきの話の続きは、あとでするとしようかの",1],
["何型か当ててやろう","何型か、私が当ててやろう",1],
["一人暮らしか。自炊はするのか","一人暮らしか。自炊はするのかの",1],
["さっきの人をどう思う？","さっきの者を、どう思うた？",1],
["付き合うなら絶対これは譲れない、というものはあるか","付き合うなら、これだけは譲れぬというものはあるかの",1],
["グループを作る","組を作るのじゃ",1],
["貯金する派か、使う派か","蓄える方か、使う方か、どっちじゃ",1],
["連絡先、一番上にピン留めしておけ","私の連絡先、一番上に留めておくのじゃぞ",1],
["お互いの第一印象を言い合うか","互いの第一印象を言い合うてみるかの",1],
["〈〉の明日に乾杯","〈〉の明日に、乾杯じゃ",1],
["完璧な休日を一日設計するならどうする","申し分のない休みを一日こしらえるなら、どうするのじゃ",1],
["最近、何かハマっているものはありますか？","最近なにか夢中になっておるものはあるかの？",1],
["意外だと言われることはありますか？","意外じゃと言われることはあるか？",1],
["幽霊って信じますか？","幽霊は信じるか？",1],
["…その話、やめませんか？","…その話、やめぬか？",1],
["最近、何か悩んでいることはありますか？","最近、何か悩んでおることはあるかの？",1],
["料理はしますか？得意料理は何ですか？","料理などはするかの？得意料理は？",1],
["死ぬまでに行きたい国はありますか？","死ぬまでに行きたい国はあるか？",1],
["子どもの頃、何をして遊んでいましたか？","子どもの頃、何をして遊んでおった？",1],
["ご兄弟はいますか？","兄弟はおるかの？",1],
["子どもの頃の夢は、何でしたか？","幼き頃の夢は何じゃった？",1],
["実家の謎ルールはありますか？","実家に、妙な掟はあるか？",1],
["人に自慢できる特技はありますか？","人に誇れる技はあるか？",1],
["最近のニュースをどう思いますか？","近頃の知らせを、どう思う？",1],
["昔のあだ名は、何でしたか？","昔のあだ名は、何じゃった？",1],
["三億当たったら、何をしますか？","三億当たったら、何をするかの？",1],
["初恋って、いつでしたか？","初恋はいつじゃった？",1],
["髪を切ったばかりですか？","髪を切ったばかりかの？",1],
["座右の銘はありますか？","座右の銘はあるかの？",1],
["私、手相を見てあげましょうか","私が手相を見てやろうか",1],
["酔った勢いと思われてもいい。好きになった","酔うた勢いと思われてもよい。好きになってしもうた",1]],
"O":{
"え、それ私もめっちゃわかる":"む、それは私もようわかるぞ",
"人生最大の黒歴史、教えてください":"人生最大の恥を、聞かせよ",
"手料理作ってもらうのと外食、どっちが嬉しい？":"手料理を振る舞われるのと外で食うのと、どちらが嬉しい？",
"好きなタイプは？":"好みはどのような者じゃ？",
"初恋っていつでした？":"初恋はいつじゃった？",
"今度ここ、私と行こうよ":"今度ここへ、私と共にゆこう",
"動物飼ってます？写真見たい！":"獣は飼うておるか？　写し絵を見せよ！",
"キャンプとか行きます？":"野営などには行くか？",
"MBTIって何型？":"MBTIとやらは何型じゃ？",
"お酒で一番やらかしたことは？":"酒で一番しくじったことは何じゃ？",
"これって何なんだろうね":"これは一体、何なのじゃろうな",
"最近読んだ本で面白かったのは？":"近頃読んだ書で、面白かったものは？",
"デート代って割り勘派？":"逢瀬の代は、割り勘か？",
"修学旅行どこ行きました？":"修学旅行はどこへ行った？",
"幽霊って信じます？":"幽霊は信じるか？"}});
HK.Load.toneData("kansai",{"F":[
["その服どこで買ったんですか？","その服、どこで買ったん？"],
["どの季節が一番好きですか？","どの季節が一番好き？"],
["今度、ご飯でも行きません？","今度、ご飯でも行かへん？"],
["何か運動してます？","なんか運動してるん？"],
["何飲んでるんですか？それおいしい？","何飲んでるん？それおいしい？"],
["心理テストやっていいですか？","心理テストやってもええ？"],
["転職考えたことあります？","転職、考えたことある？"],
["何考えてるか分かんないよね","何考えてるか分からへんよな",1],
["最近の小さな幸せ、教えてください","最近の小さな幸せ、教えて",1],
["実はこの店、出るらしいですよ","実はこの店、出るらしいで",1],
["今日会ったばかりだし……まずは友達から、じゃだめ？","今日会うたばっかりやし……まずは友達から、ってのはあかん？",1],
["今日、来てよかった。……〈〉に会えたから","今日、来てほんまよかった。……〈〉に会えたし",1],
["最近なにかハマってる？","最近なんかハマっとるもんある？",1],
["意外って言われることある？","意外やって言われることある？",1],
["幽霊って信じる？","幽霊って信じとる？",1],
["今度一緒に行こう","今度一緒に行こや",1],
["家デートと外デート、どっち派？","家デートと外デート、どっち派なん？",1],
["コンビニ、どこ派？","コンビニ、どこ派なん？",1],
["死ぬまでに行きたい国ある？","死ぬまでに行きたい国とかある？",1],
["私、友達が結婚していって焦る","私、友達がどんどん結婚していって焦るねん",1],
["最近、何か悩んでいることはありますか？","最近、何か悩んでることある？",1],
["料理はしますか？得意料理は何ですか？","料理とかする？得意料理は？",1],
["今度、ご飯でも行きませんか？","今度、ご飯でも行かへん？",1],
["私、何型か当ててもいいですか？","私、何型か当ててええ？",1],
["サウナは好きですか？ととのいますか？","サウナ好きなん？ととのう派？",1],
["一人暮らしですか？自炊はしますか？","一人暮らしなん？自炊する？",1],
["好きな芸人さんはいますか？","好きな芸人さんいる？",1],
["ご兄弟はいますか？","兄弟っている？",1],
["子どもの頃の夢は、何でしたか？","子どもの頃の夢、何やった？",1],
["実家の謎ルールはありますか？","実家の謎ルールってある？",1],
["人に自慢できる特技はありますか？","人に自慢できる特技ある？",1],
["最近のニュースをどう思いますか？","最近のニュース、どう思う？",1],
["初恋って、いつでしたか？","初恋っていつやった？",1],
["最近泣いたことはありますか？","最近泣いたことある？",1],
["髪を切ったばかりですか？","髪切ったばっかりなん？",1],
["ゲームやる？今何やってる？","ゲームやる？　今何やってるん？",1],
["私、今ダイエット中で","私、今ダイエット中やねん",1],
["半分こしよ","半分こしよか",1]],
"O":{
"え、それ私もめっちゃわかる":"え、それ私もめっちゃわかるわ",
"人生最大の黒歴史、教えてください":"人生最大の黒歴史、教えてや",
"手料理作ってもらうのと外食、どっちが嬉しい？":"手料理作ってもらうのと外食、どっちが嬉しい？",
"好きなタイプは？":"好きなタイプは？",
"初恋っていつでした？":"初恋っていつやった？",
"今度ここ、私と行こうよ":"今度ここ、私と行こや",
"動物飼ってます？写真見たい！":"動物飼っとる？　写真見たい！",
"キャンプとか行きます？":"キャンプとか行く？",
"MBTIって何型？":"MBTIって何型？",
"お酒で一番やらかしたことは？":"お酒でいっちゃんやらかしたことは？",
"これって何なんだろうね":"これって何なんやろな",
"最近読んだ本で面白かったのは？":"最近読んだ本でおもろかったんは？",
"デート代って割り勘派？":"デート代って割り勘派？",
"修学旅行どこ行きました？":"修学旅行どこ行った？",
"幽霊って信じます？":"幽霊って信じる？"}});
HK.Load.toneData("mukuchi",{"F":[
["あの人苦手","……あの人、苦手"],
["その服どこで買ったんですか？","……その服、どこで買った？"],
["どの季節が一番好きですか？","……どの季節が好き？"],
["完璧な休日を一日設計するなら？","……完璧な休日、設計するなら？"],
["波乱万丈だね","……波乱万丈"],
["笑い方が好きな人","……笑い方が、好きな人"],
["おじいちゃん・おばあちゃんになったらどうしてたい？","……年をとったら、何してたい？",1],
["一番好きな食べ物、せーので言いません？","……好きな食べ物、せーので言う？",1],
["好きな色で性格わかるらしいですよ","……好きな色で、性格わかるらしい",1],
["コーヒー派？紅茶派？","……コーヒー？　紅茶？",1],
["意外だと言われることはありますか？","……意外って言われる？",1],
["幽霊って信じますか？","……幽霊、信じる？",1],
["死ぬまでに行きたい国はありますか？","……行きたい国",1],
["私、何型か当ててもいいですか？","……血液型、当てていい？",1],
["付き合うなら絶対これは譲れない、というものはありますか？","……譲れないこと、ある？",1],
["これ、知っていますか？実は…","……これ、知ってる？",1],
["子どもの頃の夢は、何でしたか？","……子どもの頃の夢",1],
["実家の謎ルールはありますか？","……実家の、謎ルール",1],
["人に自慢できる特技はありますか？","……自慢できる特技、ある？",1],
["最近のニュースをどう思いますか？","……最近のニュース、どう思う",1],
["初恋って、いつでしたか？","……初恋、いつ",1]],
"O":{
"え、それ私もめっちゃわかる":"……わかる",
"人生最大の黒歴史、教えてください":"……黒歴史、教えて",
"手料理作ってもらうのと外食、どっちが嬉しい？":"……手料理と外食、どっち",
"好きなタイプは？":"……好きなタイプ",
"初恋っていつでした？":"……初恋、いつ",
"今度ここ、私と行こうよ":"……今度、ここ。一緒に",
"動物飼ってます？写真見たい！":"……動物、飼ってる？　写真",
"キャンプとか行きます？":"……キャンプ、行く？",
"MBTIって何型？":"……MBTI、何型",
"お酒で一番やらかしたことは？":"……お酒の、失敗",
"これって何なんだろうね":"……これ、何だろう",
"最近読んだ本で面白かったのは？":"……最近の、面白い本",
"デート代って割り勘派？":"……デート代、割り勘？",
"修学旅行どこ行きました？":"……修学旅行、どこ",
"幽霊って信じます？":"……幽霊、信じる？"}});
HK.Load.toneData("polite",{"F":[
["…あれ、この話、つまんなかった？","…あれ、このお話、つまらなかったですか？"],
["まだ一杯目みたいなもん","まだ一杯目みたいなものです"],
["完璧な休日を一日設計するなら？","完璧な休日を一日設計するなら、どうしますか？"],
["私、こういう場、本当は苦手","私、こういう場は、本当は苦手なんです"],
["笑い方が好きな人","笑い方が素敵な人です",1],
["恋愛で一番の失敗は？","恋愛でいちばんの失敗は、何ですか？",1],
["無人島に一つだけ持っていくなら？","無人島に一つだけ持っていくなら、何にしますか？",1],
["好きなタイプ、正直に","好きなタイプ、正直に教えてください",1],
["逆に、苦手な食べ物は？","逆に、苦手な食べ物はありますか？",1],
["酔った勢いだと思われてもいいです。好きになりました","酔った勢いだと思われても、構いません。……好きに、なりました",1],
["投資とかやっていますか？","投資などは、なさっていますか？",1]],
"O":{
"え、それ私もめっちゃわかる":"あ、それ、私もすごくわかります",
"手料理作ってもらうのと外食、どっちが嬉しい？":"手料理を作ってもらうのと外食、どちらが嬉しいですか？",
"好きなタイプは？":"好きなタイプは、どんな方ですか？",
"今度ここ、私と行こうよ":"今度ここへ、私と行きませんか",
"動物飼ってます？写真見たい！":"動物は飼っていますか？　写真を見たいです！",
"MBTIって何型？":"MBTIは何型ですか？",
"お酒で一番やらかしたことは？":"お酒で一番失敗したことは何ですか？",
"これって何なんだろうね":"これは何なんでしょうね",
"最近読んだ本で面白かったのは？":"最近読んだ本で、面白かったものは何ですか？",
"デート代って割り勘派？":"デート代は、割り勘派ですか？"}});
HK.Load.toneData("gentleman",{"F":[
["せーのでピース","では、せーので、ピースといこうじゃないか"],
["まだ一杯目みたいなもん","まだ一杯目のようなものだよ"],
["何飲んでるんですか？それおいしい？","何を飲んでいるんだい？　それは美味しいのかね？"],
["前にも会ったことあるよね","以前にも会ったことがあるだろう？"],
["心理テストやっていいですか？","心理テストをしてもいいかね？"],
["私、こういう場、本当は苦手","私は、こういう場が本当は苦手でね"],
["誕生日いつですか？私、星座で当てます","誕生日はいつなんだい？　星座を当ててみせよう"],
["転職考えたことあります？","転職を考えたことはあるかい？"],
["おじいちゃん・おばあちゃんになったらどうしてたい？","おじいさん・おばあさんになったら、どう過ごしていたいかい？",1],
["最近の小さな幸せ、教えてください","最近の小さな幸せを、教えてくれたまえ",1],
["その服どこで買ったんですか？","その服、どこで仕立てたのかい？　よく似合っているね",1],
["生まれ変わったら何になりたい？","生まれ変わったら、何になりたいかね？",1],
["さっきの人、どう思う？","さっきの人を、どう思うかね？",1],
["推しっています？","推しというものは、いるのかい？",1],
["私、今ダイエット中で","私は今、減量中でね",1],
["私、いつか猫を飼いたい","私はいつか、猫を飼いたいと思っているよ",1],
["前の恋人ってどんな人でした？","前の恋人は、どんな人だったのかね？",1],
["どこからが浮気だと思います？","どこからが浮気だと思うかね？",1],
["カラオケで絶対歌う曲ってあります？","カラオケで必ず歌う曲は、あるかい？",1],
["何か共通点あるかな","何か共通点はあるかな",1],
["現実見た方がいい","現実を見た方がいいね",1],
["今度どこか行こう","今度、どこかへ行こうじゃないか",1],
["なんで別れたの？","どうして別れたんだい？",1],
["とりあえず唐揚げとポテト","とりあえず、唐揚げとポテトを頼もうか",1],
["〈〉の明日に乾杯","〈〉の明日に乾杯しよう",1],
["あとで写真送るから","あとで写真を送るよ",1],
["今日、来てよかった？","今日は、来てよかったかい？",1],
["俺、こう見えて意外と","私はこう見えて、意外と",1],
["一番好きな食べ物、せーので言いません？","一番好きな食べ物を、せーので言わないかい？",1],
["これから全部やり直そう","これから全部、やり直そうじゃないか",1],
["初対面でこんなことを言うのは、変だろうか。……付き合ってほしい","初対面でこんなことを言うのは、おかしいかもしれないね。……私と、付き合ってくれないか",1],
["今日会ったばかりだ……まずは友達から、ではだめか","会ったのは今日が初めてだ……まずは友人から、というのではいけないかね",1],
["優しい人がいい","優しい人がいいね",1],
["理想のデートはどんなものだ","理想の逢い引きとは、どんなものかね",1],
["SNSには上げるな","SNSには上げないでくれたまえ",1],
["今日のことを、酔っていたからと忘れるな","今日のことを、酔っていたからと忘れてもらっては困るよ",1],
["学生のときのバイトは何だ","学生のころは、どんなアルバイトをしていたのかね",1],
["最近観た映画で一番よかったのは何だ","最近観た映画で、いちばんよかったのは何かね",1],
["家デートと外デート、どちら派だ","家で過ごすのと出かけるのと、君はどちらが好みかね",1],
["コンビニはどこ派だ","コンビニは、どこがお気に入りかね",1],
["逆に、苦手な食べ物は何だ","逆に、苦手な食べ物は何かね",1],
["どの季節が一番好きだ","どの季節がいちばん好きかね",1],
["前の恋人はどんな人だった","前の恋人は、どんな人だったのかね",1],
["無人島に一つだけ持っていくなら何だ","無人島に一つだけ持っていくとしたら、何を選ぶかね",1],
["今までで一番高い買い物は何だ","これまででいちばん高い買い物は何かね",1],
["過去と未来、行けるならどちらだ","過去と未来、行けるとしたらどちらを選ぶかね",1],
["完璧な休日を一日設計するならどうする","完璧な休日を一日こしらえるとしたら、どう過ごすかね",1],
["出身はどこだ","君の出身はどこかね",1],
["子どもの頃、何をして遊んでいた","子どものころは、何をして遊んでいたのかね",1],
["じゃんけんは、最初に何を出す派だ","じゃんけんでは、最初に何を出すのかね",1],
["どこからが浮気だと思う","どこからが浮気だと、君は思うかね",1],
["最近のニュースをどう思う","最近のニュースを、君はどう見ているかね",1],
["連絡先、一番上にピン留めしておけ","私の連絡先は、いちばん上に留めておいてくれたまえ",1],
["あとでグループに貼っておけ","あとで皆の集まりに貼っておいてくれたまえ",1],
["意外だと言われることはありますか？","意外だと言われることは、あるかね？",1],
["幽霊って信じますか？","幽霊は信じるかね？",1],
["最近、何か悩んでいることはありますか？","最近、何か悩んでいることはあるかい？",1],
["死ぬまでに行きたい国はありますか？","死ぬまでに行きたい国はあるかね？",1],
["私、何型か当ててもいいですか？","私が、君の血液型を当ててみてもいいかね",1],
["誰かのものまねはできますか？","誰かのものまねはできるかい？",1],
["好きな芸人さんはいますか？","好きな芸人はいるかい？",1],
["自分の直したいところはありますか？","自分の直したいところは、あるかね？",1],
["実家の謎ルールはありますか？","実家に、妙な決まりごとはあるかね？",1],
["人に自慢できる特技はありますか？","人に自慢できる特技はあるかね？",1],
["昔のあだ名は、何でしたか？","昔のあだ名は、何だったのかね？",1],
["初恋って、いつでしたか？","初恋は、いつだったかね？",1]],
"O":{
"え、それ私もめっちゃわかる":"おや、それは私もよくわかるよ",
"人生最大の黒歴史、教えてください":"人生最大の失敗談を、聞かせてくれたまえ",
"手料理作ってもらうのと外食、どっちが嬉しい？":"手料理を作ってもらうのと外食と、どちらが嬉しいかね？",
"好きなタイプは？":"好みのタイプは、どんな人かね？",
"初恋っていつでした？":"初恋は、いつだったかね？",
"今度ここ、私と行こうよ":"今度ここへ、私と行こうじゃないか",
"動物飼ってます？写真見たい！":"動物は飼っているかね？　写真を見たいね",
"キャンプとか行きます？":"キャンプなどには行くかね？",
"MBTIって何型？":"MBTIは何型かね？",
"お酒で一番やらかしたことは？":"酒で一番しくじったことは何かね？",
"これって何なんだろうね":"これは一体、何なのだろうね",
"最近読んだ本で面白かったのは？":"最近読んだ本で、面白かったものは何かね？",
"デート代って割り勘派？":"デートの費用は、割り勘派かね？",
"修学旅行どこ行きました？":"修学旅行は、どこへ行ったかね？",
"幽霊って信じます？":"幽霊は信じるかね？"}});
HK.Load.toneData("proud",{"F":[
["どの季節が一番好きですか？","どの季節が一番好きなんだ？"],
["え、それ私もめっちゃわかる","……それは、私もわかる",1],
["最近読んだ本で面白かったのは？","最近読んだ本で面白かったのは何だ？",1],
["手料理作ってもらうのと外食、どっちが嬉しい？","手料理と外食、どっちが嬉しい？　……参考までに聞いてやる",1],
["誕生日いつですか？私、星座で当てます","誕生日いつだ？　私が星座で当ててやる",1],
["撮ってもらえますか","撮ってくれ",1],
["今日会ったばかりだ……まずは友達から、ではだめか","今日会ったばかりだしな……まずは友達から、じゃダメか？",1],
["ゲームはやるか。今は何をやっている","ゲームはやるのか？　今は何やってる",1],
["意外だと言われることはあるか","意外だって言われること、あるか？",1],
["幽霊は信じるか","幽霊とか、信じるか？",1],
["何かいい匂いがする。香水か","何かいい匂いがするな。香水か？",1],
["死ぬまでに行きたい国はあるか","死ぬまでに行きたい国、あるか？",1],
["今度、飯でも行かないか","今度、飯でも行くか？",1],
["一人暮らしか。自炊はするのか","一人暮らしか？　自炊はすんのか",1],
["心理テストをやるぞ、いいか","心理テストやるぞ。いいな？",1],
["これを知っているか。実は…","これ、知ってるか？　実はな…",1],
["最近、何か悩んでいることはありますか？","最近、何か悩んでることあるのか？",1],
["私、何型か当ててもいいですか？","お前が何型か、私が当ててやる",1],
["最近のニュースをどう思いますか？","最近のニュース、どう思う？",1],
["撮ってもらえますか？","撮ってくれ",1],
["その話を、私はもっと聞きたい","その話、もっと聞かせろよ",1]]});
HK.Load.toneData("aniki",{"F":[
["え、それ私もめっちゃわかる","お、それ私もめっちゃわかるわ",1],
["最近読んだ本で面白かったのは？","最近読んだ本で面白かったの、あるか？",1],
["手料理作ってもらうのと外食、どっちが嬉しい？","手料理作ってもらうのと外食、どっちが嬉しい？　参考にするからさ",1],
["一番好きな食べ物、せーので言いません？","一番好きな食べ物、せーので言ってみようぜ",1],
["朝型ですか？夜型ですか？","朝型か？　夜型か？",1],
["なんで別れたの？","なんで別れたんだ？",1],
["…その話、やめません？","…その話、やめにしねえか？",1],
["どういう人が苦手ですか？","どういう奴が苦手なんだ？",1],
["…その話、やめませんか？","…その話、やめにしねえか？",1],
["最近、何か悩んでいることはありますか？","最近、何か悩んでることあるか？　聞くぞ",1],
["サウナは好きですか？ととのいますか？","サウナ好きなの？ととのう？",1],
["最近のニュースをどう思いますか？","最近のニュース、どう思う？",1],
["髪を切ったばかりですか？","髪切ったばっかりか？",1],
["これを知っているか。実は…","これ、知ってるか？　実はな…",1],
["一人暮らしか。自炊はするのか","一人暮らしか。ちゃんと自炊してんのか？",1]]});
HK.Load.toneData("yankee",{"F":[
["どういう人が苦手ですか？","どういう奴が苦手なんだ？"],
["どの季節が一番好きですか？","どの季節が一番好きなんだ？"],
["一回お手洗い行こ","一回トイレ行こうぜ"],
["今の面白くない？","今の面白くねえ？"],
["宇宙人っていると思います？","宇宙人っていると思う？"],
["朝型ですか？夜型ですか？","朝型か？夜型か？"],
["え、それ私もめっちゃわかる","お、それめっちゃわかるわ",1],
["推しっています？","推しっているか？",1],
["撮ってもらえますか","撮ってくんねえか？",1],
["このあと、ちゃんと言いたいことがある。……好きだ、たぶん","あとで、ちゃんと言いてえことがある。……好きなんだよ、たぶん",1],
["初対面でこんなことを言うのは、変だろうか。……付き合ってほしい","会ったばっかでこんなこと言うの、変かもしんねえけど。……付き合ってくれ",1],
["今日会ったばかりだ……まずは友達から、ではだめか","今日会ったばっかだしよ……まずはダチから、じゃダメか",1],
["ゲームはやるか。今は何をやっている","ゲームやんの？　今何やってんだよ",1],
["最近、何かハマっているものはあるか","最近なんかハマってるもんあんのか？",1],
["学生のときのバイトは何だ","学生ん時のバイト、何やってたんだよ",1],
["今日のことを、酔っていたからと忘れるな","今日のこと、酔ってたからって忘れんじゃねえぞ",1],
["吸わないのに来たのか？","吸わねえのに来たのかよ？",1],
["幽霊は信じるか","幽霊とか信じてんのか？",1],
["今度一緒に行こう","今度一緒に行こうぜ",1],
["家デートと外デート、どちら派だ","家デートと外デート、どっち派だよ",1],
["その服はどこで買った","その服、どこで買ったんだよ",1],
["SNSには上げるな","SNSには上げんじゃねえぞ",1],
["最近観た映画で一番よかったのは何だ","最近観た映画でいちばんよかったの、何だよ",1],
["何かいい匂いがする。香水か","なんかいい匂いすんな。香水か？",1],
["死ぬまでに行きたい国はあるか","死ぬまでに行きてえ国とかあんのか？",1],
["一人暮らしか。自炊はするのか","一人暮らしか？　自炊とかすんのかよ",1],
["心理テストをやるぞ、いいか","心理テストやんぞ。いいな？",1],
["これを知っているか。実は…","これ知ってっか？　実はよ…",1],
["好きな芸人はいるか","好きな芸人とかいんのか？",1],
["今日、来てよかった。……〈〉に会えたからだ","今日、来てよかったわ。……〈〉に会えたしな",1],
["サウナは好きですか？ととのいますか？","サウナ好きか？ととのう？",1],
["ご兄弟はいますか？","兄弟っている？",1],
["最近のニュースをどう思いますか？","最近のニュース、どう思う？",1],
["ぶっちゃけ、稼いでいますか？","ぶっちゃけ稼いでんのか？",1],
["髪を切ったばかりですか？","髪切ったばっかか？",1],
["撮ってもらえますか？","撮ってくんねえか？",1],
["私、手相を見てあげましょうか","私、手相見てやろうか",1],
["今日、来てよかった。……〈〉に会えた","今日、来てよかったわ。……〈〉に会えたしな",1],
["意外だと言われることはあるか","意外だって言われること、あんのか？",1],
["インスタはやっているか？","インスタやってんのか？",1],
["少し外の空気を吸ってくる","ちょっと外の空気吸ってくるわ",1],
["今のは面白かった","今のは笑ったわ",1],
["今度どこか行こう","今度どっか行こうぜ",1],
["あとでグループに貼っておけ","あとでグループに貼っとけよ",1]]});
HK.Load.toneData("stern",{"F":[
["え、それ私もめっちゃわかる","……それは私にもよくわかる"],
["デート代って割り勘派？","デート代は割り勘派か？"],
["何飲んでるんですか？それおいしい？","何を飲んでいるんだ？　それは旨いのか？"],
["前にも会ったことあるよね","前にも会ったことがあるな"],
["撮ってもらえますか","撮ってもらえるか"],
["私、こういう場、本当は苦手","私は、こういう場は本当は苦手だ"],
["転職考えたことあります？","転職を考えたことはあるか？"],
["おじいちゃん・おばあちゃんになったらどうしてたい？","年寄りになったら、どう過ごしていたい？",1],
["誕生日いつですか？私、星座で当てます","誕生日はいつだ？　星座で当ててみせる",1],
["最近の小さな幸せ、教えてください","最近の小さな幸せを、教えてくれ",1],
["最近読んだ本で面白かったのは？","最近読んだ本で、得るものがあったのは何だ",1],
["その服どこで買ったんですか？","その服は、どこで買った",1],
["甘いもの好きですか？","甘いものは好きか？",1],
["一番好きな食べ物、せーので言いません？","一番好きな食べ物を、せーので言わんか",1],
["順番、逆になっちゃったね","順番が、逆になってしまったな",1],
["意外だと言われることはありますか？","意外だと言われることはあるか",1],
["家デートと外デート、どちら派だ","家で会うのと外へ出るのと、どちらがいい",1],
["最近、何か悩んでいることはありますか？","最近、何か悩んでいることはあるか？",1],
["私、何型か当ててもいいですか？","私、何型か当ててもいいか",1],
["サウナは好きですか？ととのいますか？","サウナは好きか？　ととのうのか？",1],
["これ、知っていますか？実は…","これを知っているか？　実は…",1],
["子どもの頃、何をして遊んでいましたか？","子どもの頃、何をして遊んでいた？",1],
["最近のニュースをどう思いますか？","最近の報道をどう見る",1],
["撮ってもらえますか？","撮ってもらえるか",1],
["学生のときのバイトは何だ","学生の頃は、何のアルバイトをしていた",1]]});
HK.Load.toneData("tsun",{"F":[
["おじいちゃん・おばあちゃんになったらどうしてたい？","おじいちゃん・おばあちゃんになったら、どうしてたいわけ？　……べ、別に一緒にいる前提じゃないから",1],
["一番好きな食べ物、せーので言いません？","一番好きな食べ物、せーので言わない？　……べ、別にあんたの好みが知りたいわけじゃ",1],
["人生最大の黒歴史、教えてください","人生最大の黒歴史、教えなさいよ",1],
["今までで一番高い買い物って何？","今までで一番高い買い物って何よ",1],
["何飲んでるんですか？それおいしい？","何飲んでるの？　それ、おいしい？　……べ、別に欲しいわけじゃないけど",1],
["好きな色で性格わかるらしいですよ","好きな色で性格わかるらしいわよ。……べ、別に占いとか信じてないけど",1],
["手料理作ってもらうのと外食、どっちが嬉しい？","手料理作ってもらうのと外食、どっちが嬉しい？　……参考までに聞いてるだけだから",1],
["最近の小さな幸せ、教えてください","最近の小さな幸せ、教えなさいよ",1],
["最近観た映画で一番よかったのは？","最近観た映画で一番よかったのは？　……べ、別に一緒に観たいとかじゃないから",1],
["最近読んだ本で面白かったのは？","最近読んだ本で面白かったのは？　……べ、別に話題がないわけじゃないから",1],
["無人島に一つだけ持っていくなら？","無人島に一つだけ持っていくなら？　……べ、別にあんたとか言わないから",1],
["生まれ変わったら何になりたい？","生まれ変わったら、何になりたいわけ？",1],
["誕生日いつですか？私、星座で当てます","誕生日いつ？　私、星座で当てるから",1],
["意外だと言われることはありますか？","意外って言われることある？　……べ、別に気になってないけど",1],
["最近、何か悩んでいることはありますか？","最近、何か悩んでることあるでしょ。……べ、別に心配してるわけじゃないけど",1],
["死ぬまでに行きたい国はありますか？","死ぬまでに行きたい国、あるの？",1],
["サウナは好きですか？ととのいますか？","サウナ好きなの？　……ととのう？",1],
["言われて一番嬉しかった言葉は？","べ、別に興味ないけど……言われて一番嬉しかった言葉って、何？",1]]});
HK.Load.toneData("tsun_n",{"F":[
["おじいちゃん・おばあちゃんになったらどうしてたい？","おじいちゃん・おばあちゃんになったら、どうしてたい？",1],
["一番好きな食べ物、せーので言いません？","一番好きな食べ物、せーので言わないか？",1],
["人生最大の黒歴史、教えてください","人生最大の黒歴史を教えてくれ",1],
["今までで一番高い買い物って何？","今までで一番高い買い物は何だ？",1],
["何飲んでるんですか？それおいしい？","何を飲んでる？　それ、うまいのか？",1],
["好きな色で性格わかるらしいですよ","好きな色で性格がわかるらしい",1],
["手料理作ってもらうのと外食、どっちが嬉しい？","手料理と外食、どっちが嬉しい？",1],
["最近の小さな幸せ、教えてください","最近の小さな幸せを教えてくれ",1],
["最近観た映画で一番よかったのは？","最近観た映画で一番よかったのは？",1],
["最近読んだ本で面白かったのは？","最近読んだ本で、面白かったのは？",1],
["無人島に一つだけ持っていくなら？","無人島に一つだけ持っていくなら、何だ？",1],
["生まれ変わったら何になりたい？","生まれ変わったら、何になりたい？",1],
["誕生日いつですか？私、星座で当てます","誕生日はいつだ？　私が星座で当てる",1],
["撮ってもらえますか","撮ってもらえるか？",1],
["意外だと言われることはありますか？","意外だと言われることはあるか？",1],
["最近、何か悩んでいることはありますか？","最近、何か悩んでることがあるだろ",1],
["死ぬまでに行きたい国はありますか？","死ぬまでに行きたい国はあるか？",1],
["サウナは好きですか？ととのいますか？","サウナは好きか？　ととのうか？",1],
["撮ってもらえますか？","撮ってもらえるか？",1],
["今日会ったばかりだし……まずは友達から、じゃだめ？","きょ、今日会ったばかりだし……まずは友達から。それでいいでしょ",1]]});
HK.Load.toneData("gentle",{"F":[
["今の面白くない？","ねえ、今の、面白くない？",1]]});
HK.Load.toneData("gentle_n",{"F":[
["私、友達が結婚していって焦る","友達がどんどん結婚していくとさ、私、ちょっと焦るんだ",1]]});
HK.Load.toneData("ane",{"F":[
["え、それ私もめっちゃわかる","え、それ私もすごくわかるわ"],
["まだ一杯目みたいなもん","まだ一杯目みたいなものよ"],
["好きなところを三つ言い合う","好きなところを三つ言い合いましょう"],
["私の上司がさ…","私の上司がね…"],
["付き合うなら絶対これは譲れない、ってある？","付き合うなら絶対に譲れないこと、ある？",1],
["座右の銘ってある？","座右の銘ってあるのかしら？",1]]});
HK.Load.toneData("devoted",{"F":[
["まだ一杯目みたいなもん","まだ一杯目みたいなものです"],
["恋愛で一番の失敗は？","恋愛で一番の失敗って、何ですか？"],
["私、こういう場、本当は苦手","私、こういう場、本当は苦手なんです"]]});
HK.Load.toneData("devoted_p",{"F":[
["サウナは好きですか？ととのいますか？","サウナ好き？ととのう？",1]]});
HK.Load.toneData("kohai",{"F":[
["一番好きな食べ物、せーので言いません？","一番好きな食べ物、せーので言ってみないっすか？",1],
["何飲んでるんですか？それおいしい？","何飲んでるんすか？それ、おいしいっす？",1],
["告白するほう？されるほう？","告白するほうっすか？　されるほうっすか？",1],
["過去と未来、行けるならどっち？","過去と未来、行けるならどっちっすか？",1],
["幽霊って信じますか？","幽霊って、信じてるっすか？",1],
["ご兄弟はいますか？","兄弟っているっすか？",1],
["私、手相を見てあげましょうか","私、手相見てあげるっすよ？",1],
["前にもお会いしたことがありますよね","前にも会ったこと、あるっすよね？",1],
["幽霊って信じます？","幽霊って、信じてるっすか？",1]]});
HK.Load.toneData("cool",{"F":[
["え、それ私もめっちゃわかる","それは私もわかる"],
["前にも会ったことあるよね","前にも会ったことある？"],
["心理テストやっていいですか？","心理テスト、やってもいいか？"],
["おじいちゃん・おばあちゃんになったらどうしてたい？","高齢になったら、どう過ごしていたい？",1],
["誕生日いつですか？私、星座で当てます","誕生日はいつだ？　星座で当ててみせる",1],
["最近の小さな幸せ、教えてください","最近の小さな幸せを、教えてくれ",1],
["最近読んだ本で面白かったのは？","最近読んだ本で、興味深かったものは？",1],
["その服どこで買ったんですか？","その服、どこで買った？　参考にしたい",1],
["SNSにはあげないで","SNSには上げないでくれ",1],
["…その話、やめません？","…その話はやめないか",1],
["まだ一杯目みたいなもん","まだ一杯目のようなものだ",1],
["コンビニ、どこ派ですか？","コンビニは、どこ派だ？",1],
["好きなタイプ、正直に","好きなタイプを、正直に頼む",1],
["今の面白くない？","今の、面白くないか？",1],
["どういう人が苦手ですか？","どういう人が苦手だ？",1],
["デート代って割り勘派？","デート代は、割り勘派か？",1],
["好きな漫画あります？","好きな漫画はあるか？",1],
["MBTIって何型？","MBTIは何型だ？",1],
["これって何なんだろうね","これは何なんだろうな",1],
["一番好きな食べ物、せーので言いません？","一番好きな食べ物を、同時に言わないか",1],
["意外だと言われることはありますか？","意外だと言われることはあるか。参考までに聞きたい",1],
["…その話、やめませんか？","…その話はやめないか",1],
["最近、何か悩んでいることはありますか？","最近、何か悩んでいることはあるか？",1],
["料理はしますか？得意料理は何ですか？","料理はするか？　得意料理は？",1],
["私、何型か当ててもいいですか？","何型か、当ててみてもいいか",1],
["これ、知っていますか？実は…","これ、知っているか？　実は…",1],
["最近のニュースをどう思いますか？","最近のニュースをどう分析する？",1],
["髪を切ったばかりですか？","髪、切ったばかりか？",1]]});
HK.Load.toneData("calm",{"F":[
["え、それ私もめっちゃわかる","それ、私もよくわかる"],
["おじいちゃん・おばあちゃんになったらどうしてたい？","おじいちゃん・おばあちゃんになったら、どうしていたい？",1],
["誕生日いつですか？私、星座で当てます","誕生日はいつだ？　星座で当ててみる",1],
["最近の小さな幸せ、教えてください","最近の小さな幸せ、教えてくれ",1],
["最近読んだ本で面白かったのは？","最近読んだ本で、面白かったのはある？",1],
["その服どこで買ったんですか？","その服、どこで買ったの？",1],
["心理テストやっていいですか？","心理テスト、やってもいい？",1],
["一番好きな食べ物、せーので言いません？","一番好きな食べ物、せーので言わないか？",1],
["意外だと言われることはありますか？","意外って言われること、ある？",1],
["最近、何か悩んでいることはありますか？","最近、何か悩んでることはあるか？",1],
["最近のニュースをどう思いますか？","最近のニュース、どう思う？",1],
["次は私と二人で来たい","次は、二人で来たいな。……私と",1]]});
HK.Load.toneData("free",{"F":[
["おじいちゃん・おばあちゃんになったらどうしてたい？","おじいちゃん・おばあちゃんになったら、何してたい？　私は縁側でお茶！",1],
["一番好きな食べ物、せーので言いません？","一番好きな食べ物、せーので言おうよ！",1],
["人生最大の黒歴史、教えてください","人生最大の黒歴史、教えて！",1],
["今までで一番高い買い物って何？","今までで一番高い買い物って何！？",1],
["何飲んでるんですか？それおいしい？","何飲んでるの？　それおいしい？　ひと口ちょうだい！",1],
["好きな色で性格わかるらしいですよ","好きな色で性格わかるらしいよ！",1],
["手料理作ってもらうのと外食、どっちが嬉しい？","手料理作ってもらうのと外食、どっちが嬉しい？　私は両方！",1],
["最近の小さな幸せ、教えてください","最近の小さな幸せ、教えて！",1],
["最近観た映画で一番よかったのは？","最近観た映画で一番よかったのは！？",1],
["最近読んだ本で面白かったのは？","最近読んだ本で面白かったのってある？",1],
["無人島に一つだけ持っていくなら？","無人島に一つだけ持っていくなら！？",1],
["生まれ変わったら何になりたい？","生まれ変わったら、何になりたい？",1],
["誕生日いつですか？私、星座で当てます","誕生日いつ？　私、星座で当てるよ！",1],
["心理テストやっていいですか？","心理テスト、やってもいい？",1],
["撮ってもらえますか","撮ってもらえる？",1],
["意外だと言われることはありますか？","意外って言われることある？",1],
["最近、何か悩んでいることはありますか？","最近、何か悩んでることある？　聞くよ！",1],
["死ぬまでに行きたい国はありますか？","死ぬまでに行きたい国、ある？",1],
["サウナは好きですか？ととのいますか？","サウナ好き？　ととのう？",1],
["撮ってもらえますか？","撮ってもらえる？",1],
["初対面でこんなこと言うの、変かな。……付き合ってほしい","初対面でこんなこと言うの、変かな。でも、言っちゃう。……付き合ってほしい",1]]});
HK.Load.toneData("usan",{"F":[
["さっきの人、どう思う？","さっきの人、どう思うんだい？"],
["コーヒー派？紅茶派？","コーヒー派かい？　それとも紅茶派？"],
["今日から恋人ね","今日から恋人だねえ"],
["おじいちゃん・おばあちゃんになったらどうしてたい？","おじいちゃん・おばあちゃんになったら、どうしてたいんだい？",1],
["一番好きな食べ物、せーので言いません？","一番好きな食べ物、せーので言ってみないかい？",1],
["人生最大の黒歴史、教えてください","人生最大の黒歴史、教えておくれよ",1],
["今までで一番高い買い物って何？","今までで一番高い買い物は何だい？",1],
["何飲んでるんですか？それおいしい？","何飲んでるんだい？　それ、おいしいのかい？",1],
["好きな色で性格わかるらしいですよ","好きな色で性格がわかるらしいよ。……さて、当たるかねえ",1],
["手料理作ってもらうのと外食、どっちが嬉しい？","手料理と外食、どっちが嬉しいかい？",1],
["最近の小さな幸せ、教えてください","最近の小さな幸せ、教えてもらえるかい？",1],
["最近観た映画で一番よかったのは？","最近観た映画で一番よかったのは何だい？",1],
["最近読んだ本で面白かったのは？","最近読んだ本で、面白かったのはあるかい？",1],
["無人島に一つだけ持っていくなら？","無人島に一つだけ持っていくなら、何にするんだい？",1],
["生まれ変わったら何になりたい？","生まれ変わったら、何になりたいんだい？",1],
["誕生日いつですか？私、星座で当てます","誕生日はいつだい？　私が星座で当ててあげよう",1],
["幽霊って信じます？","幽霊って、信じるかい？",1],
["前の恋人ってどんな人でした？","前の恋人って、どんな人だったんだい？",1],
["キャンプとか行きます？","キャンプとか、行くのかい？",1],
["意外だと言われることはありますか？","意外って言われることはあるかい？",1],
["幽霊って信じますか？","幽霊って、信じるかい？",1],
["前の恋人って、どんな人でしたか？","前の恋人って、どんな人だったんだい？",1],
["最近、何か悩んでいることはありますか？","最近、何か悩んでることでもあるのかい？",1],
["投資とかやっていますか？","投資とか、やってるのかい？",1],
["死ぬまでに行きたい国はありますか？","死ぬまでに行きたい国はあるかい？",1],
["サウナは好きですか？ととのいますか？","サウナは好きかい？　ととのうかい？",1],
["子どもの頃、何をして遊んでいましたか？","子どもの頃は、何して遊んでたんだい？",1],
["最近のニュースをどう思いますか？","最近のニュース、どう思うかい？",1],
["三億当たったら、何をしますか？","三億当たったら、何するんだい？",1],
["ぶっちゃけ、稼いでいますか？","ぶっちゃけ、稼いでるのかい？",1],
["私、手相を見てあげましょうか","手相、見てあげようか。……当たるかどうかは、保証しないけどねえ",1],
["家デートと外デート、どっち派？","家デートと外デート、あんたはどっち派だい？",1],
["最近泣いたことある？","最近、泣いたことはあるかい？",1],
["今日はハズレ","今日はハズレだねえ",1],
["最近なにかハマってる？","最近、なにかハマってるのかい？",1]]});
HK.Load.toneData("shy",{"F":[
["連絡先、一番上にピン留めしといて","れ、連絡先……い、一番上に、ピン留め、しといて……",1],
["過去と未来、行けるならどっち？","あ、あの……過去と未来、行けるなら……どっち？",1],
["最近なにかハマってる？","さ、最近……なにか、ハマってる……？",1]]});
HK.Load.toneData("ojou",{"F":[
["何考えてるか分かんないよね","何を考えているのか分かりませんわよね"],
["好きな漫画あります？","好きな漫画はありますの？"],
["私の上司がさ…","私の上司ときたら……"],
["順番、逆になっちゃったね","順番、逆になってしまいましたわね"],
["一番好きな食べ物、せーので言いません？","一番好きな食べ物、せーので言い合いませんこと？",1],
["おじいちゃん・おばあちゃんになったらどうしてたい？","おじいさま・おばあさまになったら、どうしていたいですの？",1],
["何飲んでるんですか？それおいしい？","何を飲んでいらっしゃるの？　それ、おいしいんですの？",1],
["過去と未来、行けるならどっち？","過去と未来、行けるならどちらがよろしくて？",1],
["これは名店","これは名店ですわ",1],
["みんな、休みの日って何してる？","皆さま、お休みの日は何をなさっていますの？",1],
["休みの日って何してるんですか？","お休みの日は、何をなさっているんですの？",1],
["みんなそう言う","皆さま、そうおっしゃいますわ",1],
["修学旅行どこ行きました？","修学旅行は、どちらへ行かれましたの？",1],
["インスタやってます？","インスタは、なさっていますの？",1],
["現実見た方がいい","現実を見たほうがよろしいですわ",1],
["転職考えたことあります？","転職を考えたことは、ありまして？",1],
["このあと、ちゃんと言いたいことがあります。……好き、かもしれません","このあと、きちんと申し上げたいことがありますの。……好き、かもしれませんわ",1],
["酔った勢いだと思われてもいいです。好きになりました","酔った勢いだと思われても構いませんわ。好きになってしまいましたの",1],
["今日会ったばかりですし……まずは友達から、ではだめですか？","今日お会いしたばかりですもの……まずはお友達から、ではいけませんこと？",1],
["絶対モテますよね","きっと、おモテになりますわよね",1],
["今度一緒に行きましょう","今度、ご一緒いたしましょう",1],
["前の恋人って、どんな人でしたか？","前の恋人は、どんな方でしたの？",1],
["酔っているでしょう","酔っていらっしゃるでしょう？",1],
["さっきの話の続きは、あとでしましょう","先ほどのお話の続きは、のちほどにいたしましょう",1],
["次は、二人で会いたいです。……恋人になってほしいです","次は、二人きりでお会いしたいですわ。……私の恋人になってくださいまし",1],
["忘れません。ちゃんと付き合いたいです","忘れませんわ。きちんとお付き合いしたいんですの",1],
["初対面でこんなこと言うの、変でしょうか。……付き合ってほしいです","初対面でこんなことを申し上げるのは、おかしいかしら。……お付き合いしてくださいまし",1],
["料理はしますか？得意料理は何ですか？","お料理はなさいますの？　得意料理は何ですの？",1],
["サウナは好きですか？ととのいますか？","サウナはお好きですの？　ととのいまして？",1],
["誰かのものまねはできますか？","どなたかのものまね、おできになりますの？",1],
["これ、知っていますか？実は…","これ、ご存じでして？　実は…",1],
["好きな芸人さんはいますか？","好きな芸人さんは、いらっしゃいますの？",1],
["ご出身はどちらですか？","ご出身は、どちらですの？",1],
["子どもの頃、何をして遊んでいましたか？","子どもの頃、何をして遊んでいらしたの？",1],
["三億当たったら、何をしますか？","三億当たったら、何をなさいますの？",1],
["ぶっちゃけ、稼いでいますか？","正直なところ、稼いでいらっしゃいますの？",1],
["コンビニ、どこ派ですか？","コンビニは、どちら派ですの？",1]]});
HK.Load.toneData("hero",{"F":[
["え、それ私もめっちゃわかる","え、それ私もめっちゃわかるぜ！",1],
["若く見えるね","若く見えるな！",1],
["今までで一番高い買い物って何？","今までで一番高い買い物って何だ！？",1],
["その話、私もっと聞きたい","その話、もっと聞かせてくれ！",1],
["最近のニュースをどう思いますか？","最近のニュース、どう思う？",1],
["私、手相を見てあげましょうか","私が手相見てやろうか！",1],
["部活は何をやっていた","部活は何やってたんだ？",1]]});
HK.Load.toneData("gyaru",{"F":[
["え、それ私もめっちゃわかる","え、それ私もチョーわかる"],
["おじいちゃん・おばあちゃんになったらどうしてたい？","おじいちゃん・おばあちゃんになったらさ〜、何してたい？",1],
["一番好きな食べ物、せーので言いません？","一番好きな食べ物、せーので言お！",1],
["人生最大の黒歴史、教えてください","人生最大の黒歴史、教えて〜！",1],
["今までで一番高い買い物って何？","今までで一番高い買い物って何？",1],
["何飲んでるんですか？それおいしい？","何飲んでんの？　それおいしい？",1],
["好きな色で性格わかるらしいですよ","好きな色で性格わかるんだって！　何色好き？",1],
["手料理作ってもらうのと外食、どっちが嬉しい？","手料理と外食、どっちがアガる？",1],
["最近の小さな幸せ、教えてください","最近の小さな幸せ、教えて〜！",1],
["最近観た映画で一番よかったのは？","最近観た映画でいちばんよかったのって何？",1],
["最近読んだ本で面白かったのは？","最近読んだ本で面白かったのある？　教えて〜",1],
["無人島に一つだけ持っていくなら？","無人島にひとつだけ持ってくなら何〜？",1],
["生まれ変わったら何になりたい？","生まれ変わったら何になりたい〜？",1],
["誕生日いつですか？私、星座で当てます","誕生日いつ？　私、星座で当てちゃう！",1],
["優しい人がいい","優しい人がいいな〜"],
["みんなそう言う","みんなそう言うし"],
["今度ここ、私と行こうよ","今度ここ、私と行こーよ"],
["こっちの方が話しやすい","こっちのが話しやすいし"],
["私、友達が結婚していって焦る","私、友達が結婚してくの焦るんだけど"],
["私、今ダイエット中で","私、今ダイエット中なんだよね"],
["その話、私もっと聞きたい","その話、私もっと聞きたい！"],
["甘いもの好きですか？","甘いもの好き？"],
["私、こういう場、本当は苦手","私、こういう場、ホントは苦手なんだよね"],
["私、この曲しか知らない","私、この曲しか知らないんだよね"],
["俺、こう見えて意外と","私、こう見えて意外と"],
["自分と一日違い","自分と一日違いじゃん！"],
["今日は私が送っていく","今日は私が送ってく"],
["私、前の恋愛で懲りた","私、前の恋愛で懲りたんだよね"],
["次は私と二人で来たい","次は私と二人で来たいな"],
["次は私が幹事やる","次は私が幹事やる！"],
["現実見た方がいい","現実見た方がいいって"],
["これは名店","これは名店じゃん"],
["ちゃんと、付き合おう","ちゃんと付き合お"],
["これから全部やり直そう","これから全部やり直そ"],
["今日、来てよかった。……〈〉に会えたから","今日、来てマジよかった。……〈〉に会えたし",1],
["最近なにかハマってる？","最近なんかハマってんのある？",1],
["意外って言われることある？","意外って言われることある系？",1],
["その服どこで買ったの？","その服どこで買ったの？　かわいすぎ",1],
["幽霊って信じる？","幽霊とか信じる系？",1],
["今度一緒に行こう","今度一緒に行こ！",1],
["家デートと外デート、どっち派？","おうちデートとお出かけデート、どっち派？",1],
["…その話、やめない？","…その話、やめよ？",1],
["最近、何か悩んでることある？","最近なんか悩んでることある？　聞くよ",1],
["今度、ご飯でも行かない？","今度ごはん行こーよ",1],
["死ぬまでに行きたい国はありますか？","死ぬまでに行きたい国ってある？",1],
["私、何型か当ててもいいですか？","私、何型か当てていい？",1],
["サウナは好きですか？ととのいますか？","サウナ好き？　ととのう派？",1],
["一人暮らしですか？自炊はしますか？","一人暮らし？自炊とかする？",1],
["髪を切ったばかりですか？","髪切ったばっか？",1],
["私、手相を見てあげましょうか","私、手相見てあげよっか",1],
["実家の謎ルールってある？","実家の謎ルールってある？　あるっしょ？",1]]});
HK.Load.toneData("chara",{"F":[
["え、それ私もめっちゃわかる","え、それ私もめっちゃわかる！",1],
["撮ってもらえますか","撮ってもらえる？",1],
["無人島に一つだけ持っていくなら？","無人島に一個だけ持ってくなら？"],
["誕生日いつですか？私、星座で当てます","誕生日いつ？　私、星座で当てるよ！"],
["コンビニ、どこ派ですか？","コンビニ、どこ派？"],
["何飲んでるんですか？それおいしい？","何飲んでんの？　それおいしい？"],
["おじいちゃん・おばあちゃんになったらどうしてたい？","おじいちゃん・おばあちゃんになったら、何してたい？"],
["さっきから、〈〉のことしか見てない","さっきから、〈〉のことしか見てないじゃん"],
["最近観た映画で一番よかったのは？","最近観た映画で一番よかったのって何？"],
["私、友達が結婚していって焦る","私、友達が結婚してくの見て焦ってんだよね"],
["実はこの店、出るらしいですよ","実はこの店、出るらしいっすよ"],
["私、今ダイエット中で","私、今ダイエット中でさ"],
["今度一緒に行こう","今度一緒に行こーぜ"],
["その話、私もっと聞きたい","その話、私もっと聞きたいわ"],
["前にも会ったことあるよね","前にも会ったことあるっしょ？"],
["私、こういう場、本当は苦手","私、こういう場、ガチで苦手なんだよね"],
["お前、いいやつだな","あんた、いいやつじゃん"],
["私、この曲しか知らない","私、この曲しか知らねー"],
["仕事どうですか、大変？","仕事どう？　大変じゃね？"],
["俺、こう見えて意外と","私、こう見えて意外と"],
["何か運動してます？","なんか運動してる？"],
["今度どこか行こう","今度どっか行こ"],
["今日は私が送っていく","今日は私が送ってくわ"],
["私、前の恋愛で懲りた","私、前の恋愛で懲りたわ"],
["次は私と二人で来たい","次は私と二人で来たいな"],
["次は私が幹事やる","次は私が幹事やるわ！"],
["現実見た方がいい","現実見た方がいいって"],
["これは名店","これ、名店っしょ"],
["私、何型か当ててもいいですか？","私、何型か当てていい？",1],
["一人暮らしですか？自炊はしますか？","一人暮らし？　自炊とかする？",1],
["付き合うなら絶対これは譲れない、というものはありますか？","付き合うなら絶対これは譲れない、ってある？",1],
["最近のニュースをどう思いますか？","最近のニュース、どう思う？",1],
["撮ってもらえますか？","撮ってもらえる？",1],
["私、手相を見てあげましょうか","手相見てあげよっか？",1],
["今日、来てよかった。……〈〉に会えたから","今日、マジ来てよかったわ。……〈〉に会えたし",1],
["これって、何なんだろうね","これってさ、何なんだろね",1]]});
HK.Load.toneData("mystic",{"F":[
["おじいちゃん・おばあちゃんになったらどうしてたい？","おじいちゃん・おばあちゃんになったら、どうしていたいんだい？",1],
["誕生日いつですか？私、星座で当てます","誕生日はいつだい？　星座で当ててみせるんだ",1],
["最近の小さな幸せ、教えてください","最近の小さな幸せ、教えておくれよ",1],
["最近読んだ本で面白かったのは？","最近読んだ本で面白かったのは？　教えてほしいんだ",1],
["その服どこで買ったんですか？","その服、どこで買ったんだい？",1],
["朝型ですか？夜型ですか？","朝型かい？　それとも夜型かい？",1],
["一番好きな食べ物、せーので言いません？","一番好きな食べ物、せーので言わないかい？",1],
["意外だと言われることはありますか？","意外って言われること、あるかい？",1],
["最近、何か悩んでいることはありますか？","最近、何か悩んでいることはあるかい？",1],
["最近のニュースをどう思いますか？","最近のニュース、どう思うかい？",1],
["撮ってもらえるか","撮ってもらえるかい？",1],
["今度ここへ、私と行こう","今度ここへ、私と行かないかい？",1]]});
HK.Load.toneData("genki",{"F":[
["一番好きな食べ物、せーので言いません？","一番好きな食べ物、せーので言いっこしませんか？",1],
["おじいちゃん・おばあちゃんになったらどうしてたい？","おじいちゃん・おばあちゃんになったら、どうしてたいですか？",1],
["お前、いいやつだな","あなたって、いい人ですね！",1],
["それに乾杯","それに乾杯でーす！",1],
["好きなところを三つ言い合う","好きなところを、三つ言い合いましょう！",1],
["料理はしますか？得意料理は何ですか？","料理とかします？　得意料理は何ですか？",1],
["死ぬまでに行きたい国はありますか？","死ぬまでに行きたい国、あります？",1],
["どこからが浮気だと思いますか？","ずばり、どこからが浮気だと思います？",1],
["どこからが浮気だと思います？","ずばり、どこからが浮気だと思います？",1],
["狙っている人がいるみたいです","狙ってる人、いるみたいですよ〜！",1],
["あの人は苦手です","あの人、ちょっと苦手なんですよね〜",1],
["前にもお会いしたことがありますよね","前にも会ったこと、ありますよね！？",1],
["私の上司がですね…","私の上司がですねー…",1]]});
HK.Load.toneData("darui",{"F":[
["え、それ私もめっちゃわかる","……え……それ、私もめっちゃわかる"],
["その服どこで買ったんですか？","……その服どこで買ったの？"],
["どの季節が一番好きですか？","……どの季節が一番好き？"],
["何か運動してます？","……なんか運動してる？"],
["おじいちゃん・おばあちゃんになったらどうしてたい？","……おじいちゃん・おばあちゃんになったら。……どうしてたい？　……私は、ずっと寝てたい",1],
["一番好きな食べ物、せーので言いません？","……一番好きな食べ物、せーので。……いい？",1],
["人生最大の黒歴史、教えてください","……人生最大の黒歴史。……教えて",1],
["今までで一番高い買い物って何？","……今までで一番高い買い物、なに",1],
["好きな色で性格わかるらしいですよ","……好きな色で、性格わかるらしい",1],
["手料理作ってもらうのと外食、どっちが嬉しい？","……手料理と外食、どっちがいい？……私は出前",1],
["最近の小さな幸せ、教えてください","……最近の小さな幸せ。……教えて",1],
["最近観た映画で一番よかったのは？","……最近観た映画で、いちばんよかったの",1],
["最近読んだ本で面白かったのは？","……最近読んだ本で、おもしろかったの、ある？",1],
["無人島に一つだけ持っていくなら？","……無人島に一つだけ持ってくなら。……ふとん",1],
["生まれ変わったら何になりたい？","……生まれ変わったら、なにになりたい？……私は猫",1],
["誕生日いつですか？私、星座で当てます","……誕生日、いつ？……星座、当てる",1],
["最近、何かハマっているものはありますか？","……最近なにかハマってる？",1],
["意外だと言われることはありますか？","……意外って、言われる？",1],
["最近、何か悩んでいることはありますか？","……最近、なんか悩んでる？",1],
["料理はしますか？得意料理は何ですか？","……料理とかする？……得意料理は？",1],
["死ぬまでに行きたい国はありますか？","……死ぬまでに行きたい国、ある？",1],
["私、何型か当ててもいいですか？","……何型か、当てていい？",1],
["サウナは好きですか？ととのいますか？","……サウナ、好き？……ととのう？",1],
["一人暮らしですか？自炊はしますか？","……一人暮らし？……自炊する？",1],
["好きな芸人さんはいますか？","……好きな芸人さんいる？",1],
["今日、来てよかった。……〈〉に会えたから","……来てよかった、今日。……〈〉に会えたから",1],
["今日から恋人ね","……今日から、恋人ね",1]]});
HK.Load.toneData("sondai",{"F":[
["おじいちゃん・おばあちゃんになったらどうしてたい？","歳を重ねたら、どう過ごしていたいかね？",1],
["最近の小さな幸せ、教えてください","最近の小さな幸せとやらを、聞かせたまえ",1],
["その服どこで買ったんですか？","ほう、その服はどこで買ったのかね",1],
["乾杯し直し","乾杯をし直そうではないか",1],
["告白するほう？されるほう？","告白するほうかね？　されるほうかね？",1],
["最近買ってよかったものある？","最近買ってよかったものは、あるかね？",1],
["あとで写真送るから","あとで写真を送ってやろう",1],
["その話、私もっと聞きたい","その話、もっと聞かせたまえ",1],
["無人島に一つだけ持っていくなら？","無人島に一つだけ持っていくなら、何かね？",1],
["一回お手洗い行こ","少し、手洗いに行ってこよう",1],
["…あれ、この話、つまんなかった？","…おや、この話はつまらなかったかね？",1],
["優しい人がいい","優しい人がいいね",1],
["じゃんけん、最初何出す派？","じゃんけんは、最初に何を出す派かね？",1],
["結婚願望あります？","結婚願望は、あるのかね？",1],
["私の上司がさ…","私の上司がだね…",1],
["自分と一日違い","私と一日違いではないか",1],
["言われて一番嬉しかった言葉は？","言われて一番嬉しかった言葉は、何かね？",1],
["一番好きな食べ物、せーので言いません？","一番好きな食べ物を、せーので言おうではないか",1],
["順番、逆になっちゃったね","順番が、逆になってしまったね",1],
["酔った勢いと思われてもいい。好きになった","酔った勢いと思われても構わんよ。……好きになったのだ",1],
["初対面でこんなことを言うのは、変だろうか。……付き合ってほしい","初対面でこんなことを言うのは、妙かもしれんがね。……私と付き合いたまえ",1],
["学生のときのバイトは何だ","学生時代は、どんなアルバイトをしていたのかね",1],
["今日のことを、酔っていたからと忘れるな","今日のことを、酔っていたからと忘れてもらっては困るね",1],
["最近観た映画で一番よかったのは何だ","最近観た映画で、いちばんよかったのは何かね",1],
["家デートと外デート、どちら派だ","家で過ごすのと出かけるのと、君はどちらを好むのかね",1],
["今日、来てよかった。……〈〉に会えたからだ","今日は、来た甲斐があった。……〈〉に会えた",1],
["好きな芸人さんはいますか？","好きな芸人は、いるのかね？",1],
["今日、来てよかった。……〈〉に会えた","今日は、来た甲斐があった。……〈〉に会えた",1],
["席を替わってくれ","君、その席を替わってくれたまえ",1]]});
HK.Load.toneData("cool_soft",{"F":[
["ゲームはやるか。今は何をやっている","ゲームはやる？　今は何をやってるの",1],
["恋愛で一番の失敗は何だ","恋愛で一番の失敗って、何？",1],
["貯金する派か、使う派か","貯金する派？　使う派？",1],
["投資はやっているか","投資とか、やってる？",1]]});
HK.Load.toneData("god",{"F":[
["初対面でこんなことを言うのは、変だろうか。……付き合ってほしい","会うて間もなく申すのも妙であろうが……私と、共にあれ",1],
["今日会ったばかりだ……まずは友達から、ではだめか","今日まみえたばかりよ……まずは友として、ではならぬか",1],
["最近、何かハマっているものはあるか","近ごろ、何に心を奪われておる",1],
["吸わないのに来たのか？","吸わぬのに来たのか？",1],
["意外だと言われることはあるか","意外だと言われることはあるか、汝",1],
["最近観た映画で一番よかったのは何だ","近ごろ観た映画で、最も良かったのは何だ",1],
["幽霊は信じるか","汝は、幽霊を信じるか",1],
["今度一緒に行こう","いずれ共に参ろう",1],
["家デートと外デート、どちら派だ","家で過ごすのと外へ出るのと、汝はいずれを好む",1],
["SNSには上げるな","SNSには上げるでない",1],
["何かいい匂いがする。香水か","何やら、よい香りがする。香水か",1],
["死ぬまでに行きたい国はあるか","死ぬまでに訪れたい国はあるか",1],
["何型か当ててやろう","汝の血の型、私が当ててやろう",1],
["貯金する派か、使う派か","蓄える者か、使う者か。汝はいずれだ",1],
["席を替わってくれ","席を替われ",1],
["無人島に一つだけ持っていくなら何だ","無人の島へ一つだけ持ってゆくなら、何とする",1],
["また会いたい。今度は、二人でだ","また会いたい。次は、二人きりでな",1]]});
HK.Load.toneData("darui_lite",{"F":[
["今日会ったばかりだし……まずは友達から、じゃだめ？","今日会ったばっかだし……まずは友達から、じゃだめ？",1]]});
HK.Load.toneData("keigo_sarc",{"F":[
["最近、何か悩んでいることはありますか？","最近、何か悩んでいますか。……顔に出ていますが",1]]});
HK.Load.toneData("keigo_bossy",{"F":[
["何かいい匂いがしませんか？香水ですか？","何かいい匂いがしますね。香水ですか？",1],
["前の恋人って、どんな人でしたか？","前の恋人はどんな人でした？　正直に言いなさい",1],
["今度、ご飯でも行きませんか？","今度、ご飯に付き合いなさい",1],
["前の恋人ってどんな人でした？","前の恋人はどんな人でした？　正直に言いなさい",1],
["今度、ご飯でも行きません？","今度、ご飯に付き合いなさい",1]]});
HK.Load.toneData("ronkyaku",{"F":[
["少し外の空気を吸ってくる","少し外の空気を吸ってくる。頭を冷やすのも合理的な判断なのだよ",1],
["このあと、ちゃんと言いたいことがある。……好きだ、たぶん","このあと、きちんと言っておきたいことがある。……好きなのだよ、おそらくはね",1]]});
HK.Load.toneData("chara_down",{"F":[
["料理はしますか？得意料理は何ですか？","料理とかします？　得意料理、なんですー？",1],
["実家の謎ルールはありますか？","実家の謎ルールとか、あったりします？",1],
["おじいちゃん・おばあちゃんになったらどうしていたいですか？","おじいちゃん・おばあちゃんになったら、どうしてたいです？",1],
["貯金する派ですか？使う派ですか？","貯金する派です？　使う派です？",1],
["こういうの、慣れてる？","こういうの、慣れてます？",1]]});
});
HK.Load.done('scen-goukon', '27b625f3ef', 1);
