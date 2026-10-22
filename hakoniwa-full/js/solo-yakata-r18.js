/* 箱庭シミュレーター: 吹雪の館の殺人（R18版のみ）― 犯人が媚薬を盛って、事件をうやむやにする
   ・「夜の出来事（R18）」の設定で頻度が変わる（0なら起きない）。1回のゲームで2回まで
   ・盛り方は10通り（ワイン・ホットワイン・強い酒・お香・大浴場・菓子・暖房・紅茶・マッサージオイル・停電と香水）
   ・その夜に起きることも10通り（恋人どうし・敵どうし・片想いの暴走・探偵とバディ・探偵への誘惑・
     手がかりを持つ人の口封じ・館の使用人・乱交・一人で悶える・正気の人が現場を守る）
   ・翌朝、現場が荒らされて手がかりが失われ、酒の残った人の捜査は鈍る
   全年齢版ではこのファイルは読み込まれず、全年齢モードでも使わない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, Y = HK.YAKATA, ST = HK.Story, scen = HK.SCENARIOS && HK.SCENARIOS.yakata;
  if (!Y || !scen || !ST) return;
  function L(s) { return s.split('|'); }
  function F(t, m) { return ST.fmt(t, m); }
  /* 描写はシチュエーションごとに約10通り（solo-yakata-r18-text.js の文を足す） */
  /* 交わりの描写（体位・口調ごとの喘ぎ）：solo-r18-moan.js */
  /* 受け攻めの決まり（pos.js）：住人どうしは向きの決まる組（HK.Pos.okSex）だけ、{x}=HK.Pos.order の先頭。
     自分で攻めを選んだ人は、使用人・犯人の凌辱などで「される」側にしない。女性どうしは Y.R18T.ff の文と HK.FF で */
  function okP(a, b) { return !HK.Pos || HK.Pos.okSex(a, b); }
  function hardTop(p) { return !!(HK.Pos && HK.Pos.hardTop(p)); }
  function isFF(a, b) { return !!(HK.Pos && HK.Pos.ff(a, b)); }
  function od2(a, b) { return HK.Pos ? HK.Pos.order(a, b, [a, b]) : [a, b]; }
  function SX(S, x, y, mood, short, allow) {
    var R = HK.R18M;
    if (isFF(x, y) && HK.FF) {
      var ctx = { pick: function (a) { return ST.pick(S, a); } }, st = mood === 'rough' ? 'rough' : mood === 'love' ? 'gentle' : HK.FF.styleOf(x);
      var f = function (t) { return t.replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name); };
      S.r18Last = '';
      return f(HK.FF.pick(ctx, 'body', st, { tools: S.drugTools })) + (R ? R.say(S, y, 'start') + (short ? '' : R.say(S, x, 'top') + R.say(S, y, 'mid')) + R.say(S, y, 'climax') : '') + f(HK.FF.pick(ctx, 'climax', st));
    }
    return R ? R.sex(S, x, y, { mood: mood, fore: false, short: short, allow: allow }) : '';
  }
  function PW(S) { return HK.R18M && HK.R18M.lastPos(S) ? '（' + HK.R18M.lastPos(S) + '）' : ''; }
  function PL(k, base) { var T = Y.R18T || {}; return base.concat(T[k] || []); }
  /* 女性どうしなら女性どうしの文（Y.R18T.ff）、そうでなければ PL */
  function PLF(k, base, x, y) { var T = Y.R18T || {}; return isFF(x, y) && T.ff && T.ff[k] ? T.ff[k] : PL(k, base); }
  scen.env.push({ id: 'ylewd', label: '夜の出来事（R18）', min: 0, max: 100, def: 40, lo: '起きない', hi: 'たびたび', desc: '犯人が媚薬を盛って事件をうやむやにしたり、探偵を誘惑したりする頻度' });

  scen.env.push({ id: 'ypleasure', label: '快楽殺人の起きやすさ（R18）', min: 0, max: 100, def: 15, lo: '起きない', hi: 'いつも', desc: '犯人の動機が「快楽殺人（楽しかったから）」になる確率。快楽殺人の犯人は、夜に誰かを無理やり犯し、そのまま殺すことがある。動機を指定したときはそちらが優先' });
  /* 快楽殺人の起きやすさ：冷酷さ・FCの高い犯人ほど少しなりやすい */
  function pleasure(S, env, cul) {
    if (HK.SAFE_ON) return null;
    var v = env.ypleasure; if (v == null) v = 15;
    if (v <= 0) return 'no';
    var t = cul && cul.tr ? cul.tr : {};
    var p = v / 100 * (0.8 + (t.cold || 0) * 0.25 + (t.fc || 0) * 0.15);
    return S.rng() < Math.min(1, v >= 100 ? 1 : p) ? 'yes' : 'no';
  }

  /* ---------- 盛り方（10通り）：{c}=犯人 {p}=その夜の場所 ---------- */
  var DRUG = [
    { id: 'wine', p: '客間', t: L('その夜の夕食で、{c}は「とっておきの一本です」と、古いワインを開けた。|{c}は「館の主の秘蔵品だそうです」と、地下から埃をかぶった赤ワインを持ってきた。'), e: L('グラスが空になるころ、広間の空気は、ねっとりと甘く熱を帯びていた。|しばらくすると、誰もが頬を上気させ、互いの肌から目を離せなくなった。') },
    { id: 'hotwine', p: '暖炉の前', t: L('{c}は厨房に立ち、皆のために温かいホットワインを作った。蜂蜜と、少し変わった香辛料の匂いがした。|{c}は「体が温まりますよ」と、湯気の立つカップを一人ずつに手渡した。'), e: L('体の芯から温まったはずなのに、熱はいつまでも引かなかった。むしろ、下腹に溜まっていった。|カップを置いた指先が、隣の人の手に触れた。それだけで、息が止まりそうになった。') },
    { id: 'spirits', p: '遊戯室', t: L('{c}は暖炉の前で、皆に強い酒を注いで回った。「眠れない夜には、これが一番」|{c}は遊戯室で酒盛りを始めた。「怖いときは飲むに限る。ほら、もう一杯」'), e: L('二杯目で、誰もが妙に饒舌になった。三杯目で、誰もが妙に近くなった。|酔いが回るにつれて、恐怖は消え、代わりに得体の知れない熱が体を満たした。') },
    { id: 'incense', p: '寝室', t: L('{c}は「よく眠れますように」と、皆の寝室に小さなお香を焚いて回った。|館じゅうの部屋に、甘ったるい香りの煙が漂い始めた。{c}が、古い香炉に何かをくべていた。'), e: L('布団に入ってしばらくすると、肌が布に擦れるだけで声が漏れそうになった。|香りを吸い込むたびに、頭がぼうっとして、誰かに触れられたくてたまらなくなった。') },
    { id: 'bath', p: '大浴場', t: L('{c}は大浴場の湯を沸かし、「体を温めましょう」と皆を誘った。湯には、乳白色の入浴剤が溶かされていた。|{c}は「冷えた体には温泉が一番」と言って、館の大浴場に湯を張った。湯は、ほんのりと桃色だった。'), e: L('湯に浸かった瞬間から、肌という肌が火照り出した。湯気の向こうで、誰かの吐息が甘く震えていた。|湯から上がっても、熱は引かなかった。浴衣の合わせから覗く肌に、誰もが目を奪われた。') },
    { id: 'sweets', p: '談話室', t: L('{c}は「夜食にどうぞ」と、手作りのチョコレートを配って回った。|{c}は厨房で焼いたというマドレーヌを、皆に勧めた。「甘いものは、心を落ち着かせますから」'), e: L('ひと口かじると、舌の上で何かが溶けて広がった。体が、急に重く、熱くなった。|甘さが喉を通り過ぎたあと、体の奥から、じわじわと疼きが湧き上がってきた。') },
    { id: 'heater', p: '客間', t: L('{c}は「冷えますね」と言って、館の暖房の温度を上げた。通風口の奥に、何かを流し込んだことには、誰も気づかなかった。|{c}は夜中に起き出し、ボイラー室の吸気口に小瓶の中身を垂らした。'), e: L('暖房の風が強くなるにつれて、館じゅうの空気が、むせかえるほど甘くなった。|部屋が暖まるほど、頭がぼんやりとして、誰かの体温が恋しくてたまらなくなった。') },
    { id: 'tea', p: '書斎', t: L('{c}は「気持ちが落ち着きますよ」と、ハーブティーを淹れた。|{c}は、館に残っていた珍しい茶葉で紅茶を淹れた。花のような、少し変わった香りがした。'), e: L('二口目を飲んだあたりから、心臓の音がやけに大きく聞こえ始めた。|カップを持つ手が震えた。寒さのせいではなかった。') },
    { id: 'oil', p: '医務室', t: L('{c}は「肩が凝っているでしょう」と、皆にマッサージを申し出た。手に取ったオイルは、甘い花の香りがした。|{c}は「血行をよくするオイルです」と言って、小瓶を皆に回した。'), e: L('オイルを塗られた肌が、内側から燃えるように熱くなった。誰かの指が触れるたびに、体がびくりと跳ねた。|オイルが肌に馴染むにつれて、どこを触られても、声を抑えられなくなった。') },
    { id: 'dark', p: '暗闇の広間', t: L('夜更け、館の電気が一斉に消えた。暗闇の中で、{c}がまいた香水の匂いだけが、濃く漂っていた。|{c}は停電の暗闇に乗じて、甘い香りの霧を広間に撒いた。'), e: L('誰の顔も見えない闇の中で、誰かの手が、誰かの肌を探り当てた。|暗闇と甘い香りが、理性をゆっくりと溶かしていった。') }
  ];
  var SKIP = L('{a}は、グラスに口をつけるふりだけをした。何かがおかしい、と感じていた。|{a}は、それに手をつけなかった。それが、あとで幸いした。|{a}は、匂いに違和感を覚えて、そっと自室に戻った。|{a}は「今夜はやめておく」と断った。');

  /* ---------- その夜に起きること（10通り）：{x}=攻め {y}=受け {p}=場所 ---------- */
  var SC = {
    lovers: L('{p}で、{x}は{y}を抱き寄せた。「今夜は……我慢できない」――殺人犯がいるかもしれない館で、二人はいつもより激しく求め合った。{x}は{y}の奥を何度も突き上げ、{y}は{x}の名前を呼び続けた。|恋人どうしの{x}と{y}は、{p}の扉に鍵をかけるのももどかしく絡み合った。{y}は自分から脚を開き、{x}を深く迎え入れた。|{x}は{y}を{p}の壁に押しつけた。「怖いの、全部忘れさせて」――{y}の囁きに、{x}は何度も応えた。|{y}は{x}の上に跨り、熱に浮かされたまま腰を揺らした。{x}が{y}の中で果てても、二人は離れなかった。'),
    enemies: L('{p}で鉢合わせた{x}と{y}は、いつものように睨み合った。――次の瞬間、どちらからともなく唇を奪い合っていた。憎しみと熱が、ひとつに混ざった。|{x}は{y}の胸ぐらを掴んだ。「……お前なんか、大嫌いだ」そう言いながら、{x}は{y}を{p}の床に押し倒し、乱暴に奥まで沈めた。|罵り合いながら、{x}と{y}は互いの服を剥ぎ取った。{y}は{x}の背中に爪を立て、声を噛み殺しながら果てた。'),
    crush: L('ずっと{y}を想っていた{x}は、媚薬の熱に背中を押された。「ごめん……もう、抑えられない」――{x}は{p}で{y}を抱きしめ、唇を重ねた。|{x}は{y}の部屋を訪ねた。「ずっと、こうしたかった」――{y}は戸惑いながらも、熱に浮かされた体で{x}を受け入れた。|{x}は、{p}で眠り込んだ{y}の寝顔を見つめていた。媚薬の熱に負けて、そっと{y}の肌に触れた。{y}は目を覚まし――拒まなかった。'),
    buddy: L('探偵の{d}と助手の{b}は、{p}で二人きりになった。「先生……変なんです、体が」――その夜、二人は「相棒」の一線を越えた。|{b}は熱に浮かされた{d}を介抱しようとした。けれど、触れた指先から熱が移り、気づけば二人はベッドの上で絡み合っていた。|「推理の続きは、明日にしましょう」――{d}は{b}の手を引いた。いつも背中を預け合っていた相棒の肌は、思っていたよりずっと熱かった。'),
    casual: L('{x}は{y}の手を引いて、{p}に転がり込んだ。扉が閉まる前から、二人の唇は重なっていた。{x}は熱に浮かされたまま、何度も{y}の奥まで突き上げた。|{p}の絨毯の上で、{x}は{y}を組み敷いた。{y}は自分から脚を開き、{x}の腰を引き寄せた。|{y}は廊下で{x}にしがみついた。「熱いの……どうにかして」――{x}は{y}を壁に押しつけ、その場で繋がった。|名前くらいしか知らない相手だった。それでも{x}と{y}は、{p}で夜明けまで互いを貪った。'),
    group: L('{p}では、もう誰が誰と抱き合っているのか分からなかった。服が床に散らばり、喘ぎ声と水音が重なり合っていた。|気がつけば、{p}で三人が絡み合っていた。誰の手が誰の肌を這っているのか、誰にも分からなかった。|{p}のソファの上で、何人もの体が重なり合っていた。吹雪の音も、殺人犯のことも、誰の頭にも残っていなかった。'),
    solo: L('{a}は自室に閉じこもり、熱を持て余していた。誰にも見られないように、布団の中で自分の体に手を伸ばした。|{a}は浴室の冷たい水を浴びても、熱が引かなかった。壁に背を預けたまま、声を殺して何度も自分を慰めた。|{a}は誰とも顔を合わせたくなくて、部屋の鍵をかけた。扉の向こうから聞こえる甘い声に、指が止まらなくなった。'),
    servant: L('館の古い使用人が、{a}の部屋の扉を叩いた。「お休みになれないご様子でしたので」――{a}は、その手を拒めなかった。|{a}が廊下でうずくまっていると、館の使用人が黙って肩を貸してくれた。運ばれた先は、使用人部屋のベッドだった。'),
    silence: L('{c}は、手がかりを掴みかけていた{a}の部屋を訪ねた。「ねえ……今夜は、私のことだけ考えて」――{a}が目を覚ましたとき、手帳のページが一枚、破り取られていた。|{c}は熱に浮かされた{a}を抱きながら、耳元で囁き続けた。「全部、忘れて」――翌朝、{a}は自分が何を調べていたのか、うまく思い出せなかった。'),
    guard: L('{a}は、一人だけ酒を飲んでいなかった。乱れた館の中、{a}は現場の扉の前に座り込み、朝まで誰も近づけなかった。|{a}は異変に気づいて、現場の部屋に鍵をかけた。鍵は、自分のポケットにしまった。')
  };
  var SEDUCE = L('{c}は、熱に浮かされた{d}の部屋を訪ねた。「探偵さん……ずっと、気になってたんです」――{c}は{d}の膝に跨り、ゆっくりと腰を沈めた。|{c}は{d}の首に腕を回してベッドへ誘い込み、耳元で囁いた。「事件のことなんて、今夜は忘れて」――{d}は{c}を組み敷いた。{c}の中で果てるたびに、推理の糸が一本ずつほどけていった。|{c}は{d}の手帳をそっと閉じ、その手を自分の胸に導いた。「謎解きより、楽しいことしませんか」');
  var SEDUCE_TOP = L('{c}は、熱に浮かされた{d}の部屋に忍び込み、そのまま{d}を組み敷いた。「探偵さん、今夜は何も考えなくていい」――{c}に奥まで貫かれるたびに、{d}の頭から推理が抜け落ちていった。|{c}は{d}の手首を押さえつけ、ゆっくりと腰を進めた。{d}は抗おうとしたが、媚薬に浮かされた体は、{c}を受け入れることしか知らなかった。|{c}は{d}の眼鏡を外し、机の上に置いた。「推理は、もうおしまい」――そのまま{d}を机に押し伏せた。');
  /* 翌朝（10通り） */
  /* 自分で攻めを選んだ人のところへ来た使用人：{a}のほうが組み伏せる */
  var SERVANT_TOP = L('館の古い使用人が、{a}の部屋の扉を叩いた。「お休みになれないご様子でしたので」――{a}はその手首を掴んで部屋に引き入れ、寝台に押し倒した。夜明けまで、使用人は{a}の下で声を殺し続けた。|{a}が廊下でうずくまっていると、館の使用人が黙って肩を貸してくれた。運ばれた使用人部屋のベッドで、{a}は使用人の燕尾服の襟を掴み、自分の下に組み敷いた。');
  var MORNING = L('翌朝、館の誰もが、昨夜のことを口にしようとしなかった。乱れた広間は、いつの間にか片づけられていた――事件の現場ごと。|翌朝、皆はぼんやりとした頭で目を覚ました。昨夜の記憶は、甘い靄に包まれていた。現場に残っていたはずの痕跡も、誰かが踏み荒らしていた。|朝食の席で、誰も目を合わせようとしなかった。それどころではない事件が起きているはずなのに。|翌朝、何人かは見知らぬベッドで目を覚ました。慌てて服を探しているうちに、現場の証拠のことなど、誰も覚えていなかった。|翌朝、館じゅうに甘い香りが残っていた。窓を開けても、その匂いはなかなか消えなかった。|「昨夜は……飲みすぎましたね」誰かがそう言い、皆が気まずく笑った。笑いの中に、犯人の安堵が混じっていた。|翌朝、現場の扉は開け放たれ、床には誰かの浴衣の帯が落ちていた。何が証拠で、何がそうでないのか、もう分からなかった。|翌朝の館は、嘘のように静かだった。昨夜のことを思い出すたびに、誰もが顔を赤らめた。|翌朝、探偵の手帳は、昨夜のページだけが白紙だった。|翌朝、何人かの首筋には、隠しきれない痕が残っていた。互いの顔を見るたびに、昨夜の熱がぶり返した。');
  var MORNING_SAFE = L('翌朝、館は乱れきっていた。ただ一つ、{a}が守った現場だけは、昨夜のままだった。');

  Y.R18 = {
    pleasure: pleasure,
    on: function (S) { return !HK.SAFE_ON && (S.env.ylewd || 0) > 0; },
    /* 媚薬の夜。起きたら true（その夜の殺人は起きない） */
    night: function (S, day) {
      var rng = S.rng, c = S.cul, lv = S.env.ylewd / 100;
      if (!c || !Y.alive(c) || c.bound || S.mot.nobody || (S.spiked || 0) >= 2) return false;
      var found = S.pool.filter(function (x) { return x.found && !x.fake; }).length;
      var heat = found >= 2 || c.m.sus > 45 ? 0.35 : 0.12;
      if (rng() > lv * heat * (0.6 + c.tr.cold * 0.4 + c.tr.fc * 0.3)) return false;
      S.spiked = (S.spiked || 0) + 1; S.drugNight = day;
      var used = S.drugUsed || (S.drugUsed = []);
      var D = rng.pick(DRUG.filter(function (d) { return used.indexOf(d.id) < 0; })); used.push(D.id);
      var live = S.P.filter(function (q) { return Y.alive(q) && !q.bound; });
      var drunk = [], sober = [];
      live.forEach(function (q) { if (q === c) return; var ok = rng() < 0.85 - q.tr.caution * 0.5 - (q.role === 'doctor' || q.role === 'detective' ? 0.15 : 0); (ok ? drunk : sober).push(q); q.drugged = ok; });
      var t = F(ST.pick(S, D.t), { c: c.name }) + ST.pick(S, D.e);
      S.drugTools = D.id === 'oil';
      sober.slice(0, 2).forEach(function (q) { t += F(ST.pick(S, SKIP), { a: q.name }); });
      var o = ST.say(S, { actors: [c].concat(drunk), tag: '媚薬', kind: 'climax', text: t, why: '犯人の' + c.name + 'が媚薬を盛った（' + { wine: 'ワイン', hotwine: 'ホットワイン', spirits: '強い酒', incense: 'お香', bath: '大浴場の湯', sweets: '菓子', heater: '暖房', tea: '紅茶', oil: 'マッサージオイル', dark: '停電と香水' }[D.id] + '）。追い詰められるほど盛りやすい（夜の出来事 ' + S.env.ylewd + '）。その夜、事件はうやむやになる', mag: 40 });
      ST.key(S, o, c.name + 'が媚薬を盛った');
      var P = D.p, scenes = 0;
      function pairScene(kind, x, y, extra, why) {
        var od = HK.Pos ? HK.Pos.order(x, y, [x, y]) : [x, y];
        var m = { x: od[0].name, y: od[1].name, p: P, d: (extra && extra.d) || '', b: (extra && extra.b) || '' };
        var pool = PLF(kind, SC[kind], od[0], od[1]);
        /* 探偵と助手：向きの決まった文は、探偵が攻めか受けかで選ぶ */
        if (kind === 'buddy' && !isFF(od[0], od[1]) && Y.R18T) pool = pool.concat(Y.R18T[od[0] === x ? 'buddyDT' : 'buddyDB'] || []);
        ST.say(S, { actors: [od[0], od[1]], tag: '媚薬の夜', kind: 'climax', text: F(ST.pick(S, pool), m) + SX(S, od[0], od[1], kind === 'enemies' ? 'rough' : kind === 'lovers' || kind === 'crush' || kind === 'buddy' ? 'love' : 'drug'), why: why + PW(S), mag: 32 });
        Y.setRel(S, x, y, kind === 'enemies' ? 0.35 : 0.2, kind === 'enemies' ? '憎しみの一夜' : kind === 'buddy' ? '一線を越えた' : kind === 'crush' ? '想いが溢れた' : '一夜', kind === 'crush' ? x : null);
        drunk.splice(drunk.indexOf(x), 1); if (drunk.indexOf(y) >= 0) drunk.splice(drunk.indexOf(y), 1);
        scenes++;
      }
      function can(a, b) { return (!HK.canLove || HK.canLove(a, b)) && okP(a, b); }
      function tie(a, b, list) { return (S.ties || []).some(function (t) { return ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)) && list.split(',').indexOf(t.type) >= 0; }); }
      /* 探偵への誘惑 */
      var det = drunk.filter(function (q) { return q.isDet; })[0];
      if (det && rng() < 0.35 + lv * 0.3 && can(c, det)) {
        var o2 = HK.Pos ? HK.Pos.order(c, det, [c, det]) : [c, det];
        ST.say(S, { actors: [c, det], tag: '誘惑', kind: 'climax', text: F(ST.pick(S, o2[0] === c ? PLF('seduceTop', SEDUCE_TOP, c, det) : PLF('seduce', SEDUCE, c, det)), { c: c.name, d: det.name }) + SX(S, o2[0], o2[1], 'drug'), why: c.name + 'は探偵の' + det.name + 'を誘惑した。' + det.name + 'は' + c.name + 'を疑いにくくなり、推理が狂いやすくなる', mag: 44 });
        c.m.sus = Math.max(0, c.m.sus - 25); det.seduced = true; S.fake++;
        Y.setRel(S, c, det, 0.25, '誘惑', c); drunk.splice(drunk.indexOf(det), 1);
      }
      /* 手がかりを持つ人の口封じ（体で） */
      var holder = drunk.filter(function (q) { return q.cnt.clue > 0 || q.approached; }).sort(function (a, b) { return b.cnt.clue - a.cnt.clue; })[0];
      if (holder && rng() < 0.4 && can(c, holder)) {
        /* 犯人が受けの組は、犯人が自分から跨って聞き出す（silenceB） */
        var o3 = od2(c, holder), sl = o3[0] === c ? PLF('silence', SC.silence, c, holder) : PLF('silenceB', [], c, holder);
        ST.say(S, { actors: [c, holder], tag: '媚薬の夜', kind: 'climax', text: F(ST.pick(S, sl), { c: c.name, a: holder.name }) + SX(S, o3[0], o3[1], 'drug', true), why: c.name + 'は、手がかりを掴みかけていた' + holder.name + 'を抱いて、記憶を曖昧にさせた（' + holder.name + 'の手がかり探しが鈍る）', mag: 36 });
        holder.approached = false; holder.cnt.clue = Math.max(0, holder.cnt.clue - 1); Y.setRel(S, c, holder, 0.2, '口封じの一夜', c);
        drunk.splice(drunk.indexOf(holder), 1);
      }
      /* 探偵とバディ */
      drunk.filter(function (q) { return q.isDet && q.buddies && q.buddies.length; }).forEach(function (d) {
        var b = d.buddies.filter(function (x) { return drunk.indexOf(x) >= 0; })[0];
        if (b && rng() < 0.6 && can(d, b) && scenes < 4) pairScene('buddy', d, b, { d: d.name, b: b.name }, '探偵と助手が、相棒の一線を越えた');
      });
      /* 関係のある人どうし：恋人・敵・片想い */
      drunk.slice().forEach(function (x) {
        if (drunk.indexOf(x) < 0 || scenes >= 4) return;
        var cand = drunk.filter(function (y) { return y !== x && can(x, y); });
        var lov = cand.filter(function (y) { return tie(x, y, 'lover,mate,fated,almost,fwb'); })[0];
        if (lov) return pairScene('lovers', x, lov, null, '恋人どうし（' + Y.relLabel(S, x, lov) + '）');
        var cr = cand.filter(function (y) { return (S.ties || []).some(function (t) { return t.type === 'crush' && t.a === x.i && t.b === y.i; }); })[0];
        if (cr && rng() < 0.7) return pairScene('crush', x, cr, null, x.name + 'の片想いが、媚薬の勢いで溢れた');
        var en = cand.filter(function (y) { return Y.bond(S, x, y) < -0.2; })[0];
        if (en && rng() < 0.5) return pairScene('enemies', x, en, null, '仲の悪い二人（' + Y.relLabel(S, x, en) + '）が、憎しみごと抱き合った');
      });
      /* 残った人どうし */
      while (drunk.length >= 2 && scenes < 4) {
        var x = drunk[0], y = drunk.slice(1).filter(function (q) { return can(x, q); }).sort(function (a, b) { return Y.bond(S, x, b) - Y.bond(S, x, a); })[0];
        if (!y) { drunk.shift(); continue; }
        /* 乱交には、自分で攻めを選んだ人を入れない（誰に何をされるか分からない場面のため） */
        var gp = drunk.filter(function (q) { return !hardTop(q); });
        if (gp.length >= 3 && rng() < lv * 0.5) { var g = gp.slice(0, Math.min(gp.length, 3 + Math.floor(rng() * 2))); ST.say(S, { actors: g, tag: '媚薬の夜', kind: 'climax', text: F(ST.pick(S, g.every(function (q) { return HK.Pos && HK.Pos.isF(q); }) && Y.R18T && Y.R18T.ff ? Y.R18T.ff.group : PL('group', SC.group)), { p: P }) + (HK.R18M ? HK.R18M.group(S, g) : ''), why: '媚薬の熱で、' + g.map(function (q) { return q.name; }).join('・') + 'が絡み合った', mag: 34 }); g.forEach(function (q) { drunk.splice(drunk.indexOf(q), 1); }); scenes++; continue; }
        pairScene('casual', x, y, null, '媚薬の熱（' + (Y.relLabel(S, x, y) || '関係なし') + '）');
      }
      /* 一人あぶれた人 */
      drunk.forEach(function (q) {
        if (rng() < 0.5) ST.sayB(S, { actors: [q], tag: '媚薬の夜', text: F(ST.pick(S, PL('solo', SC.solo)), { a: q.name }) + (HK.R18M ? HK.R18M.solo(S, q) : ''), why: '相手がいなかった' }, q.name + 'は一人で悶えた');
        else if (hardTop(q)) ST.sayB(S, { actors: [q], tag: '媚薬の夜', text: F(ST.pick(S, SERVANT_TOP), { a: q.name }) + (HK.R18M ? HK.R18M.say(S, q, 'top') : ''), why: '館の使用人が慰めに来たが、' + q.name + 'のほうが組み伏せた（受け攻めの指定：攻め）' }, q.name + 'は使用人と');
        else ST.sayB(S, { actors: [q], tag: '媚薬の夜', text: F(ST.pick(S, PL('servant', SC.servant)), { a: q.name }) + (HK.R18M ? HK.R18M.npc(S, 'servant') + HK.R18M.moans(S, q, ['start', 'mid', 'climax']) : ''), why: '館の使用人に慰められた' }, q.name + 'は使用人と');
      });
      /* 正気の人が現場を守ると、手がかりは失われない */
      var gd = sober.filter(function (q) { return q.tr.caution + q.tr.cp > 0.9; })[0];
      if (gd && rng() < 0.35) {
        ST.say(S, { actors: [gd], tag: '見張り', text: F(ST.pick(S, SC.guard), { a: gd.name }), why: gd.name + 'は酒を飲まず、現場を守った（慎重さ・CP）', mag: 26 });
        ST.say(S, { kind: 'phase', tag: '翌朝', text: F(ST.pick(S, MORNING_SAFE), { a: gd.name }), why: '手がかりは失われなかった' });
      } else {
        var left = S.pool.filter(function (x) { return !x.found && !x.lost && !x.fake; });
        if (left.length > 1) left[0].lost = true;
        ST.say(S, { kind: 'phase', tag: '翌朝', text: ST.pick(S, MORNING), why: '媚薬の夜のあと：手がかりが一つ失われ、翌日は酒の残った人の捜査が鈍る', mag: 20 });
      }
      live.forEach(function (q) { q.m.fear = Math.max(0, q.m.fear - 10); });
      return true;
    }
  };
  /* ---------- 媚薬以外の夜の出来事（媚薬の夜でない夜に、1つ起きることがある） ----------
     凌辱（快楽殺人の犯人が無理やり）・吊り橋効果・犯人の脅し・大浴場・凍えた体を温め合う・取り調べでの誘惑
     起きても殺人は止まらない（false を返す）。凌辱のあと、そのまま殺されることもある */
  Y.R18.extra = function (S, day) {
    var rng = S.rng, lv = S.env.ylewd / 100, c = S.cul, T = Y.R18T;
    if (!T || rng() > lv * 0.7) return false;
    var live = S.P.filter(function (q) { return Y.alive(q) && !q.bound; });
    if (live.length < 2) return false;
    function can(a, b) { return (!HK.canLove || HK.canLove(a, b)) && okP(a, b); }
    /* 犯人 c が攻めに回る組（凌辱・脅しは、犯人が攻めのときだけ） */
    function cTop(q) { return can(c, q) && od2(c, q)[0] === c; }
    function od(a, b) { return HK.Pos ? HK.Pos.order(a, b, [a, b]) : [a, b]; }
    function pairs(f) { var r = []; live.forEach(function (a) { live.forEach(function (b) { if (a.i < b.i && can(a, b) && f(a, b)) r.push([a, b]); }); }); return r; }
    var cOk = c && Y.alive(c) && !c.bound && !S.mot.nobody;
    var others = live.filter(function (q) { return q !== c && q !== S.acc && !q.locked; });
    var EV = [];
    /* 凌辱：快楽殺人の犯人だけ */
    if (cOk && S.mot.id === 'pleasure' && !c.lock) {
      var vs = others.filter(function (q) { return cTop(q); });
      if (vs.length) EV.push({ w: 3 + c.tr.cold * 2, f: function () {
        var v = HK.weighted ? HK.weighted(rng, vs, function (q) { return 1 + q.m.fear / 50 + (q.tr.caution < 0.4 ? 1 : 0); }) : rng.pick(vs);
        var kill = S.kills.length < 5 && day <= S.env.days && rng() < 0.4 + c.tr.cold * 0.2;
        var mv = { c: c.name, v: v.name }, M = HK.R18M;
        var t = (T.assault_in ? F(ST.pick(S, T.assault_in), mv) : '') + (M ? M.resist(S, c, v, { endure: false }) : '') + F(ST.pick(S, isFF(c, v) && T.ff ? T.ff.assault : T.assault), mv) + (M ? M.say(S, v, 'endure') : '') + F(ST.pick(S, kill ? T.assault_kill : T.assault_live), { c: c.name, v: v.name });
        ST.say(S, { actors: [c, v], tag: '凌辱', kind: 'climax', text: t, why: '快楽殺人の犯人' + c.name + 'が、' + v.name + 'を無理やり犯した（冷酷さ・衝動）。' + (kill ? 'そのまま殺した' : v.name + 'は恐怖で口をつぐんだ'), mag: 46 });
        Y.setRel(S, c, v, -0.8, '凌辱', c);
        if (kill) { S.forceTgt = v; S.forceWhy = '快楽殺人：' + v.name + 'を犯したあと、殺した'; }
        else { v.m.fear = Math.min(100, v.m.fear + 35); v.cnt.clue = Math.max(0, v.cnt.clue - 1); v.violated = true; }
      } });
    }
    /* 犯人の脅し：手がかりを掴んだ人を体で黙らせる */
    if (cOk) {
      var hs = others.filter(function (q) { return (q.cnt.clue > 0 || q.approached) && !q.isDet && cTop(q); });
      if (hs.length) EV.push({ w: 1 + c.tr.cold + (S.mot.id === 'pleasure' ? 1 : 0), f: function () {
        var v = hs.sort(function (a, b) { return b.cnt.clue - a.cnt.clue; })[0];
        ST.say(S, { actors: [c, v], tag: '脅迫', kind: 'climax', text: (HK.R18M && HK.R18M.isStrong(v) ? HK.R18M.resist(S, c, v) : F(ST.pick(S, T.blackmail), { c: c.name, v: v.name })), why: c.name + 'は、秘密に近づいた' + v.name + 'を脅し、体で黙らせた（' + v.name + 'は手がかりを口にできなくなる）', mag: 38 });
        v.approached = false; v.cnt.clue = Math.max(0, v.cnt.clue - 1); v.m.fear = Math.min(100, v.m.fear + 20);
        Y.setRel(S, c, v, -0.5, '脅迫', c);
      } });
    }
    /* 吊り橋効果：怖がっている二人 */
    var br = pairs(function (a, b) { return a.m.fear + b.m.fear > 80 && Y.bond(S, a, b) > -0.2; });
    if (br.length) EV.push({ w: 2, f: function () { var pr = rng.pick(br), o = od(pr[0], pr[1]);
      ST.say(S, { actors: o, tag: '吊り橋', kind: 'climax', text: F(ST.pick(S, PLF('bridge', T.bridge, o[0], o[1])), { x: o[0].name, y: o[1].name }) + SX(S, o[0], o[1], 'love'), why: PW(S) + '恐怖の夜に、' + o[0].name + 'と' + o[1].name + 'が求め合った（恐怖 ' + Math.round(o[0].m.fear) + '・' + Math.round(o[1].m.fear) + '）', mag: 32 });
      o.forEach(function (q) { q.m.fear = Math.max(0, q.m.fear - 20); }); Y.setRel(S, o[0], o[1], 0.35, '吊り橋の一夜'); } });
    /* 大浴場で鉢合わせ */
    var bp = pairs(function (a, b) { return Y.bond(S, a, b) > -0.4; });
    if (bp.length) EV.push({ w: 1.2, f: function () { var pr = rng.pick(bp), o = od(pr[0], pr[1]);
      ST.say(S, { actors: o, tag: '大浴場', kind: 'climax', text: F(ST.pick(S, PLF('bath', T.bath, o[0], o[1])), { x: o[0].name, y: o[1].name }) + SX(S, o[0], o[1], 'plain', false, ['tachi', 'taimen', 'haimen', 'kijo', 'kuchi', 'yubi']), why: PW(S) + '夜の大浴場で、' + o[0].name + 'と' + o[1].name + 'が鉢合わせた', mag: 30 });
      Y.setRel(S, o[0], o[1], 0.25, '湯けむりの一夜'); } });
    /* 凍えた体を温め合う：捜索で外に出た二人 */
    var wp = pairs(function (a, b) { return Y.bond(S, a, b) > -0.1 && (a.tr.cp + b.tr.cp > 0.8 || a.isDet || b.isDet || a.role === 'butler' || b.role === 'butler'); });
    if (wp.length) EV.push({ w: 1, f: function () { var pr = rng.pick(wp), o = od(pr[0], pr[1]);
      ST.say(S, { actors: o, tag: '凍える夜', kind: 'climax', text: F(ST.pick(S, PLF('warmth', T.warmth, o[0], o[1])), { x: o[0].name, y: o[1].name }) + SX(S, o[0], o[1], 'love', false, ['soku', 'taimen', 'seijo', 'haimen']), why: PW(S) + '吹雪の中を捜索した' + o[0].name + 'と' + o[1].name + 'が、肌で温め合った', mag: 30 });
      Y.setRel(S, o[0], o[1], 0.3, '温め合った'); } });
    /* 取り調べでの誘惑：疑われている人が、取り調べ役を落とす */
    var sus = live.filter(function (q) { return q.m.sus > 40 && q.tr.fc + (q.tr.lie || q.tr.a * 0.5 || 0) > 0.8; }).sort(function (a, b) { return b.m.sus - a.m.sus; })[0];
    if (sus) { var iv = live.filter(function (q) { return q !== sus && (q.isDet || q.tr.cp > 0.5) && can(sus, q); })[0];
      if (iv) EV.push({ w: 1.5 + (sus === c ? 1 : 0), f: function () {
        /* 疑われた人が攻めなら膝に座らせ、受けなら自分から跨る */
        var o4 = od2(sus, iv);
        ST.say(S, { actors: [sus, iv], tag: '誘惑の取り調べ', kind: 'climax', text: F(ST.pick(S, T.interrogate.concat(T[o4[0] === sus ? 'interrogateT' : 'interrogateB'] || [])), { x: sus.name, y: iv.name }) + SX(S, o4[0], o4[1], 'plain', true), why: '疑われていた' + sus.name + 'が、取り調べ役の' + iv.name + 'を誘惑した（嘘・FC）。' + sus.name + 'への疑いが薄れる', mag: 34 });
        sus.m.sus = Math.max(0, sus.m.sus - 20); if (sus === c) S.fake++; if (iv.isDet) iv.seduced = true;
        Y.setRel(S, sus, iv, 0.25, '取り調べの夜', sus); } }); }
    if (!EV.length) return false;
    var tot = EV.reduce(function (a, e) { return a + e.w; }, 0), r = rng() * tot;
    for (var i = 0; i < EV.length; i++) { r -= EV[i].w; if (r <= 0) { EV[i].f(); break; } }
    if (i >= EV.length) EV[EV.length - 1].f();
    return false;
  };
})();
