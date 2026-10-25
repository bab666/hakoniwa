/* 箱庭シミュレーター: 邪神村RTA ― 目標「恋人を作る」の人のための恋愛の出来事
   ・狙った相手と過ごす場面（吊り橋効果・夜の縁側・雨宿り・村人の冷やかし・庇う・夕飯 …）。通じると距離が縮まり、告白が早まる
   ・狙った相手に恋人ができたら、嫉妬して諦め、別の相手を探す
   ・恋が叶ったあとも、恋人どうしの場面（手を繋いで逃げる・見張りを交代で・帰ったらの約束 …）が続く
   jashin-goals.js の act を包む。目標が「恋人を作る」でない人には何もしない */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, JS = HK.JASHIN, clamp = HK.clamp;
  if (!ST || !JS || !JS.GOALX) return;
  function L(s) { return s.split('|'); }
  function al(p) { return JS.alive(p); }
  function F(t, m) { return ST.fmt(t, m); }
  function pk(S, a) { return ST.pick(S, a); }
  function bond(S, a, b) { return JS.REL ? JS.REL.bond(S, a, b) : 0; }
  function setRel(S, a, b, d, lab, from) { if (JS.DRAMA) JS.DRAMA.setRel(S, a, b, d, lab, from); }
  function edge(S, a, b, lab, cls, from) { if (JS.DRAMA) JS.DRAMA.edge(S, a, b, lab, cls, from); }
  function hasTie(S, a, b, list) { return (S.ties || []).some(function (t) { return ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)) && list.split(',').indexOf(t.type) >= 0; }); }
  function loverOf(S, b) { return S.P.filter(function (c) { return c !== b && al(c) && hasTie(S, c, b, 'lover,mate,fated'); })[0] || null; }

  /* ---------- 恋人を作る：狙った相手と過ごす場面 ---------- */
  /* when(S,p,b,h)：その場面が起きる状況。y／n：相手の反応（通じた／通じない） */
  var MOMENT = [
    { id: 'fear', why: '吊り橋効果（怖さを分け合うと、惹かれやすい）', bonus: 0.15,
      when: function (S, p, b) { return b.m.fear > 50 || (S.tension || 0) > 45; },
      t: L('物音に跳ね上がった{b}の手を、{a}がとっさに掴んだ。{a}「大丈夫。……ここにいる」|夜の山道で、{a}は{b}の前に立って懐中電灯を握り直した。{a}「後ろ、ついてきて。離れないで」|蔵の中で何かが軋んだ。{a}は思わず{b}を背中にかばっていた。'),
      y: L('{b}は、掴まれた手を振りほどかなかった。心臓の音が、怖さのせいだけではない気がした。|{b}は{a}の服の裾を、ぎゅっと握った。{b}「……ありがと」|震えが止まったあとも、{b}はしばらく{a}から離れなかった。'),
      n: L('{b}は「平気」とだけ言って、手を引っ込めた。|{b}は{a}を押しのけて、自分で前に出た。{b}「守られるの、慣れてない」') },
    { id: 'night', why: '夜、二人きりになれる時間', bonus: 0.05,
      when: function (S, p, b, h) { return JS.night(h); },
      t: L('民宿の縁側で、{a}は{b}の隣に腰を下ろした。蚊取り線香の煙が、二人の間をゆっくり流れていった。|{a}は{b}を誘って、田んぼの畦道に出た。蛍が、足もとから一つ、また一つと浮かび上がった。|眠れずに廊下へ出た{a}は、同じように起きていた{b}と鉢合わせた。二人は台所で、温かい麦茶を分け合った。|街灯のない村の夜空は、星で埋まっていた。{a}は{b}に、知っている星座を一つずつ指さしてみせた。'),
      y: L('{b}は、{a}の肩に少しだけ寄りかかった。{b}「こういう夜、嫌いじゃない」|{b}は笑って、{a}の話に最後まで付き合った。いつの間にか、肩が触れていた。|{b}「……この村に来なかったら、こうして話すこともなかった」その声は、少しだけ嬉しそうだった。'),
      n: L('{b}は欠伸をひとつして、「そろそろ寝る」と立ち上がった。|{b}は話の途中で、黙って夜空から目を逸らした。') },
    { id: 'rain', why: '夕立で、二人きりの雨宿り', bonus: 0.08,
      when: function (S, p, b, h) { return !JS.night(h); },
      t: L('調べものの帰りに夕立が来た。{a}と{b}は、道ばたの小さな祠の軒下に駆け込んだ。肩が触れるほど狭かった。|雨に降られた{a}は、自分の上着を{b}の頭にかけた。{a}「着てて。風邪ひくから」|蝉の声が止んで、雨が来た。神社の拝殿の軒先で、{a}は濡れた{b}の髪を、ハンカチでそっと拭いた。'),
      y: L('{b}は雨音に紛れるような声で言った。{b}「……もう少し、止まなくてもいいかも」|{b}は{a}の上着を返さずに、そのまま羽織っていた。|雨が上がっても、{b}はすぐには歩き出さなかった。'),
      n: L('{b}は小降りになった途端、「先に行くね」と駆け出していった。|{b}は少しだけ距離を取って、雨が止むのを黙って待っていた。') },
    { id: 'tease', why: '村人に「お似合い」と冷やかされた', bonus: 0.1,
      when: function (S) { return (S.hostile || 0) < 60; },
      t: L('並んで歩く{a}と{b}を見て、畑の老婆が目を細めた。「＠あんたら、お似合いだねえ。村で祝言でも挙げていくかい」|駄菓子屋の店主が、{a}と{b}にラムネを一本だけ差し出した。「＠二人で一本。若いもんはそれでええ」|民宿の女将が、{a}と{b}の布団を並べて敷いていた。「＠あら、違ったの？」'),
      y: L('{b}は真っ赤になって否定した。けれど、{a}と目が合うと、否定の声はだんだん小さくなった。|{a}と{b}は顔を見合わせて、同時に吹き出した。そのあとの沈黙が、少しだけ甘かった。'),
      n: L('{b}は「違います」ときっぱり言って、{a}から一歩離れた。|{b}は苦笑いして、話を変えた。') },
    { id: 'guard', why: '村人の敵意から、相手をかばった', bonus: 0.12,
      when: function (S) { return (S.hostile || 0) >= 45; },
      t: L('村人たちの視線が{b}に集まった。{a}は黙って{b}の前に立ち、その視線を一身に受け止めた。|鍬を持った村の男が、{b}に詰め寄った。{a}がその間に割って入った。{a}「この人に用があるなら、先にこっちが聞く」|{a}は、村人がひそひそと{b}の名前を口にしているのを聞きつけ、すぐに{b}の隣へ移った。'),
      y: L('{b}は、{a}の背中を見上げたまま、しばらく何も言えなかった。|{b}「……かっこつけすぎ」そう言いながら、{b}は{a}の袖を離さなかった。'),
      n: L('{b}は「余計なことしないで」と小声で言った。{b}は、目立つのが怖かった。') },
    { id: 'meal', why: '食事の席で、隣どうしになった', bonus: 0.05,
      when: function () { return true; },
      t: L('民宿の夕飯で、{a}はさりげなく{b}の隣の座布団に座った。{a}は{b}の苦手な漬物を、黙って自分の皿に移した。|{a}は、村の商店で買ったおにぎりを{b}に半分渡した。{a}「鮭のほう、あげる」|囲炉裏端で、{a}は{b}の湯呑みに、そっとお茶を注ぎ足した。'),
      y: L('{b}「……なんで好きなほう分かったの」{b}は、嬉しそうにおにぎりを頬張った。|{b}は、{a}の皿に自分のおかずを一品のせ返した。小さな交換だった。|{b}は、注がれたお茶を両手で包んで、{a}に小さく笑いかけた。'),
      n: L('{b}は「ありがと」と言ったきり、ほかの人との話に戻っていった。|{b}は、そのお茶に口をつけなかった。') },
    { id: 'tend', why: '小さな怪我の手当て', bonus: 0.08,
      when: function () { return true; },
      t: L('草むらで{b}が足を切った。{a}はしゃがみ込んで、水筒の水で傷口を洗い、ハンカチを巻いた。|山道で転んだ{b}に、{a}は迷わず背中を向けた。{a}「乗って。民宿まで、すぐだから」|{a}は{b}の指に刺さった棘を、時間をかけて丁寧に抜いた。'),
      y: L('{b}は、{a}の背中に頬を預けて、小さく「重くない？」と聞いた。|{b}は巻かれたハンカチを、そのあともずっとほどかなかった。|{b}「……優しいね」その一言に、{a}のほうが照れた。'),
      n: L('{b}は「自分でできるから」と、{a}の手から包帯を取った。') },
    { id: 'shrine', why: '神社で、二人で願いをかけた', bonus: 0.08,
      when: function (S) { return !S.shrine; },
      t: L('神社の石段を上りきったところで、{a}は{b}に五円玉を一枚渡した。{a}「せっかくだし、願いごとでも」|{a}と{b}は、拝殿の古い鈴を一緒に鳴らした。{a}は、手を合わせたまま{b}の横顔を盗み見た。|{a}は社務所で、縁結びのお守りを二つ買った。一つを、黙って{b}の手に握らせた。'),
      y: L('{b}「何をお願いしたの？」{a}「……内緒」――{b}も、自分の願いを言わなかった。|{b}は、もらったお守りを鞄の一番見えるところに結びつけた。'),
      n: L('{b}は「こういうの、信じてないから」と、早々に石段を下りていった。|{b}は、お守りを受け取ったものの、困ったように笑った。') }
  ];

  /* ---------- 恋人どうしになったあとの場面 ---------- */
  var LOVER = [
    { why: '怖いときほど、手を離さない', when: function (S, p, b) { return p.m.fear > 45 || b.m.fear > 45 || (S.tension || 0) > 50; },
      t: L('{a}と{b}は、指を絡めたまま暗い道を走った。どちらの手も、汗で濡れていた。{a}「絶対、離さないから」|{b}が悪夢にうなされて飛び起きた。{a}は何も言わずに、{b}を胸に抱き寄せた。|{a}は、震える{b}の額に自分の額を当てた。{a}「一緒に帰る。約束したでしょ」') },
    { why: '恋人どうしで、交代で見張り', when: function (S, p, b, h) { return JS.night(h); },
      t: L('見張りの番を、{a}と{b}は交代で務めることにした。結局、二人とも朝まで起きていた。|{a}は、眠る{b}の寝顔を見ながら、戸口の前に座り込んでいた。|民宿の狭い布団で、{a}と{b}は背中合わせに眠った。寝返りを打つたびに、どちらからともなく手を探した。') },
    { why: '帰ったあとの約束', when: function () { return true; },
      t: L('{a}は、{b}の小指に自分の小指を絡めた。{a}「帰ったら、ちゃんとしたデートしよう。海がいい」|{b}「生きて帰れたら、何したい？」{a}は少し考えてから言った。{a}「……{b}と、普通の朝ごはんが食べたい」|{a}と{b}は、帰ったら行く店の話をした。その数は、十を超えていた。') },
    { why: '人目を盗んで', when: function () { return true; },
      t: L('蔵の陰で、{a}は{b}にそっと口づけた。遠くで、祭囃子の稽古の音がしていた。|皆の前では普段どおりにしていた{a}と{b}だったが、すれ違いざまに、指先だけが触れ合った。|{a}は、{b}の髪についた木の葉を取ってやった。そのまま、手が{b}の頬に残った。') },
    { why: '恋人の目標を手伝う', when: function () { return true; },
      t: L('{a}は、{b}の調べものに付き合って、古い帳面を一緒にめくった。肩を寄せ合って読む文字は、なぜか頭に入りやすかった。|{a}は{b}の荷物を持って、村の外れまでついて行った。{a}「一人で行かせるわけないでしょ」') }
  ];

  var JEALOUS = L('{a}は、{b}が{c}と寄り添っているのを見てしまった。二人のあいだに、入る隙間はなかった。|{b}と{c}が付き合い始めたと、{a}は人づてに聞いた。{a}は「そっか」と笑って、一人で民宿の裏へ回った。|{a}は、{b}の手を引く{c}の背中を、遠くから見送った。');
  var MOVEON = L('{a}は、川で顔を洗った。冷たい水が、少しだけ気持ちを切り替えてくれた。{a}「……次」|{a}は、空を見上げて大きく息を吐いた。失恋で落ち込んでいる暇は、この村にはなかった。');

  function moment(S, p, b, h) {
    var rng = S.rng, L0 = p.love;
    var pool = MOMENT.filter(function (x) { return x.when(S, p, b, h) && (L0.seen || []).indexOf(x.id) < 0; });
    if (!pool.length) { L0.seen = []; pool = MOMENT.filter(function (x) { return x.when(S, p, b, h); }); }
    if (!pool.length) return false;
    var x = pool[rng.int(pool.length)];
    (L0.seen = L0.seen || []).push(x.id);
    var lv = loverOf(S, b), m = { a: p.name, b: b.name };
    var yes = rng() < 0.42 + bond(S, b, p) * 0.4 + b.tr.warmth * 0.2 + x.bonus - (lv ? 0.35 : 0) - b.tr.cp * 0.1;
    if (yes) { L0.pt++; setRel(S, p, b, 0.14, 'いい雰囲気', p); b.m.fear = clamp(b.m.fear - 4, 0, 100); }
    else setRel(S, p, b, -0.02, null);
    ST.sayB(S, { actors: [p, b], tag: '恋', text: F(pk(S, x.t), m) + F(pk(S, yes ? x.y : x.n), m), why: p.name + 'の目標は「恋人を作る」。' + x.why + '。' + (yes ? b.name + 'との距離が縮まった' : b.name + 'には響かなかった' + (lv ? '（' + lv.name + 'という恋人がいる）' : '')) }, p.name + 'が' + b.name + 'と過ごした');
    return true;
  }

  function loverMoment(S, p, b, h) {
    var pool = LOVER.filter(function (x) { return x.when(S, p, b, h); });
    if (!pool.length) return false;
    var x = pool[S.rng.int(pool.length)];
    setRel(S, p, b, 0.06, '恋人'); p.m.fear = clamp(p.m.fear - 5, 0, 100); b.m.fear = clamp(b.m.fear - 5, 0, 100);
    ST.sayB(S, { actors: [p, b], tag: '恋人', text: F(pk(S, x.t), { a: p.name, b: b.name }), why: p.name + 'と' + b.name + 'は恋人どうし。' + x.why + '（恐怖が少し和らぐ）' }, p.name + 'と' + b.name + 'は寄り添っていた');
    return true;
  }

  /* 気になる相手を決める（jashin-goals.js の love と同じ選び方） */
  function pickTarget(S, p, live) {
    var L0 = p.love, cs = live.filter(function (q) { return q !== p && !q.bound && al(q) && HK.canLove(p, q) && HK.canLove(q, p) && (!HK.Poly || HK.Poly.storyCan(S, p, q)) && !(S.ties || []).some(function (t) { return ((t.a === p.i && t.b === q.i) || (t.a === q.i && t.b === p.i)) && HK.tieNoLove(t); }) && !(L0.no && L0.no.indexOf(q.i) >= 0); });
    if (!cs.length) return null;
    var b = HK.weighted(S.rng, cs, function (q) { return 1 + Math.max(0, bond(S, p, q)) * 2 + q.tr.warmth; });
    L0.pt = 0;
    ST.sayB(S, { actors: [p, b], tag: '恋', text: F(pk(S, JS.GT.LOVE_PICK), { a: p.name, b: b.name }), why: p.name + 'の目標は「恋人を作る」（FC・NP・衝動）' }, p.name + 'は' + b.name + 'が気になっていた');
    return b;
  }

  function loveAct(S, p, h, live, free) {
    var rng = S.rng, L0 = p.love;
    if (!L0 || p.bound || !p.goal0) return false;
    /* 恋が叶ったあと */
    if (L0.done) {
      var b0 = L0.t;
      if (!b0 || !al(b0) || b0.bound || rng() > 0.4 * (ST.romK ? ST.romK(S) : 1)) return false;
      return loverMoment(S, p, b0, h);
    }
    if (p.goal !== p.goal0 || p.goal.id !== 'love') return false;
    if (ST.romK && ST.romK(S) < 1 && rng() > ST.romK(S)) return false;
    var b = L0.t;
    if (!b || !al(b)) b = L0.t = pickTarget(S, p, live);
    if (!b || b.bound) return false;
    /* 狙った相手に、ほかの恋人ができた */
    var lv = loverOf(S, b);
    if (lv && lv !== p) {
      if (rng() > 0.6) return false;
      (L0.no = L0.no || []).push(b.i); L0.t = null; L0.pt = 0;
      p.m.fear = clamp(p.m.fear + 4, 0, 100);
      setRel(S, p, lv, -0.1, '恋敵', p);
      ST.sayB(S, { actors: [p, b, lv], tag: '片恋', text: F(pk(S, JEALOUS), { a: p.name, b: b.name, c: lv.name }) + F(pk(S, MOVEON), { a: p.name }), why: p.name + 'が想っていた' + b.name + 'には、' + lv.name + 'という恋人ができた。' + p.name + 'は諦めて、別の相手を探す' }, p.name + 'は失恋した');
      return true;
    }
    if (p.m.fear > 80) return false;
    /* 告白できるところまで来ていたら、たいていは告白に進む（jashin-goals.js の love） */
    var ready = L0.pt >= 2 && bond(S, p, b) >= 0.3;
    if (free ? ready : rng() > (ready ? 0.25 : 0.7)) return false;
    return moment(S, p, b, h);
  }

  var act0 = JS.GOALX.act;
  JS.GOALX.act = function (S, p, h, live) {
    if (loveAct(S, p, h, live)) return true;
    return act0(S, p, h, live);
  };
  /* 自分の番（行動）とは別に、一時間ごとに恋の場面が起きることもある */
  var tick0 = JS.GOALX.tick;
  JS.GOALX.tick = function (S, live, h) {
    tick0(S, live, h);
    live.forEach(function (p) {
      if (!al(p) || !p.goal0 || (!p.love && p.goal0.id !== 'love')) return;
      if (S.rng() < 0.35) { p.love = p.love || { t: null, pt: 0, tries: 0 }; loveAct(S, p, h, live, true); }
    });
  };
  JS.LOVEX = { act: loveAct };
})();
