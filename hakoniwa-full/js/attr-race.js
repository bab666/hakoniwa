/* 箱庭シミュレーター attr-race: 種族（attr.js の HK.Attr.raceOf）の「気分の一文」と「執着の一文」（全年齢版・R18版共通。attr-look.js の次に読む）
   ■ HK.Attr.raceMood(c, mood, pick)：気分ごとの種族の一文。mood＝trapped（閉じ込められた・苛立ち）／fear（怯え）／calm（落ち着き）／joy（喜び）／alert（警戒）。
       種族 6 種（vampire 吸血鬼／beast 獣人／demon 魔族／angel 天使／ghost 幽霊／other その他＝{note}）× 気分 5 種、各 3 文
   ■ HK.Attr.raceIntro(list, mood, pk)：箱庭の導入（閉じ込められた・始まった）のあとに足す文。種族のある人を名簿の順に 2 人まで（残りは省く）。
       pk は ctx（pick を持つ）・S（rng を持つ）・選ぶ関数のどれでもよい。種族のある人がいなければ乱数を使わずに ''
   ■ HK.Attr.moodKey(c)：HK.Emo の気分が強い（50 以上）ときの種族文の気分（怒り→trapped・恐れ→fear・喜び→joy・気分が引いて落ち着いた→calm）。なければ ''
       attr-look.js の look の一文を、これで気分の種族文に差し替える
   ■ HK.Attr.raceObsess(c, o, pick)：執着（ヤンデレ）の出来事で、執着する側 c の種族に合わせた一文（{o}＝執着される相手）。各種族 3 文
   ■ HK.Attr.raceLog：点検用（配列を入れると { kind: 'intro'|'mood'|'obsess'|'play', who, race, mood, text } を記録する）
   種族を決めていない人には乱数を使わない（決めていない人の結果は、これまでと変わらない）。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.Attr;
  if (!A || !A.raceOf) return;
  function L(s) { return s.split('|'); }
  A.raceLog = null;

  var MOOD = {
    vampire: {
      trapped: L('{c}は窓のない壁を見回して、少しだけ安堵の息を吐いた。日の光の心配だけは、しなくてよさそうだった。|{c}は閉ざされた扉に指先を当て、赤い瞳を細めた。牙の先が、苛立たしげに唇をかすめた。|{c}は冷たい壁にもたれ、夜を待つのには慣れているとでも言うように、静かに目を閉じた。'),
      fear: L('{c}の白い顔から、さらに血の気が引いた。もともと少ない体温が、指先から抜けていくようだった。|{c}は唇を引き結んだ。怯えを隠そうとするほど、小さな牙が震えてのぞいた。|{c}の赤い瞳が、落ち着きなくあたりを探った。影の濃いほうへ、無意識に身を寄せていた。'),
      calm: L('{c}は影の落ちる隅に腰を下ろし、赤い瞳を静かに伏せた。|{c}のひんやりとした指先が、ゆっくりと組まれた。長い夜を何度も越えてきた者の落ち着きだった。|{c}は灯りから少し離れたところで、いつもの涼しい顔に戻っていた。'),
      joy: L('{c}が笑うと、口元の小さな牙がのぞいた。本人は隠すのも忘れていた。|{c}の青白い頬に、珍しくうっすらと赤みが差していた。|{c}の赤い瞳が、灯りを映して楽しげにきらめいた。'),
      alert: L('{c}の赤い瞳が、暗がりの奥の何かを捉えたように細くなった。|{c}は鼻先をわずかに上げた。誰より早く、知らない匂いを嗅ぎ取っていた。|{c}は音もなく身を起こし、牙を隠すように口元を引き締めた。')
    },
    beast: {
      trapped: L('{c}の尻尾が、苛立ったように床を叩いていた。|{c}の耳がぺたりと後ろに倒れ、喉の奥で低い唸りが漏れた。|{c}は落ち着きなく壁際を行ったり来たりした。逆立った尻尾の毛が、なかなか元に戻らなかった。'),
      fear: L('{c}の尻尾が、足のあいだに巻き込まれていた。|{c}の耳が伏せられ、小刻みに震えていた。|{c}は身を縮め、尻尾を抱えるようにして息をひそめた。'),
      calm: L('{c}の尻尾が、ゆっくりと床の上で円を描いていた。|{c}の耳が、力を抜いたように少しだけ垂れた。|{c}は丸くなって座り込み、尻尾の先で自分の足を包んだ。'),
      joy: L('{c}の尻尾が、ちぎれそうなほど左右に揺れていた。|{c}の耳がぴんと立ち、隠しきれない嬉しさに小さく震えた。|{c}は喉を鳴らすような声で笑い、尻尾をぱたぱたと振った。'),
      alert: L('{c}の耳が、物音のしたほうへぴくりと向いた。|{c}は鼻をひくつかせ、知らない匂いを確かめていた。尻尾の毛が、ふわりと逆立った。|{c}の尻尾が、ぴたりと動きを止めた。耳だけが、あたりの気配を拾い続けていた。')
    },
    demon: {
      trapped: L('{c}の尾が、苛立たしげに床を打った。|{c}は角の先で壁を小突き、忌々しそうに舌打ちした。|{c}の瞳孔が細く絞られた。閉じ込められるのは、どうにも性に合わないらしかった。'),
      fear: L('{c}の尾が、自分の足首に巻きついて離れなかった。|{c}は強がるように笑ったが、瞳の奥の赤い光が揺れていた。|{c}の影が、怯えたように足元で小さく縮こまった。'),
      calm: L('{c}の尾の先が、ゆるやかに揺れていた。|{c}は角に触れる癖のまま、静かに目を閉じた。|{c}の瞳が、いつもの穏やかな色に戻っていた。'),
      joy: L('{c}の尾が、上機嫌に左右へ揺れた。|{c}は角を揺らして笑った。牙をのぞかせた笑みは、思いのほか無邪気だった。|{c}の瞳が、愉快そうに金色の光を帯びた。'),
      alert: L('{c}の尾が、ぴんと張りつめていた。|{c}の瞳孔が、獣のように細く絞られた。|{c}は角をわずかに傾け、気配のするほうを睨んだ。')
    },
    angel: {
      trapped: L('{c}は背の翼を広げかけて、天井の低さに気づき、ため息とともに畳んだ。|{c}の翼の先が、苛立ったように小さく震えていた。|{c}は閉ざされた扉を見上げ、祈るように胸の前で手を組んだ。翼の羽が、一枚ひらりと落ちた。'),
      fear: L('{c}の翼が、身を守るように自分の体を包んだ。|{c}の白い羽が、怯えたように逆立っていた。|{c}のまわりの淡い光が、心細そうに揺らいだ。'),
      calm: L('{c}は翼を静かに畳み、目を閉じて小さく祈った。|{c}のまわりの空気が、ふっと柔らかく明るくなった。|{c}の翼が、ゆったりと一度だけ羽ばたいた。'),
      joy: L('{c}の翼が、嬉しさを隠しきれないようにふわりと広がった。|{c}が笑うと、まわりの光が少しだけ強くなった気がした。|{c}の羽が、舞うように何枚も宙に散った。'),
      alert: L('{c}の翼が、音もなく半分ほど開かれた。|{c}は顔を上げ、何かを聞き取ろうとするように翼の先を震わせた。|{c}のまわりの光が、すっと冷たく澄んだ。')
    },
    ghost: {
      trapped: L('{c}は扉に手を伸ばしたが、指先は冷たい板に当たって止まった。いつもならすり抜けられるはずだった。|{c}の輪郭が、苛立ったように揺らいで、また元に戻った。|{c}は何度も壁に体を押し当てた。どういうわけか、ここの壁だけは通り抜けられなかった。'),
      fear: L('{c}の体が、怯えたように薄く透けていった。|{c}は思わず壁の中へ逃げ込みかけて、半分だけ埋もれたまま震えていた。|{c}の足元の輪郭が、不安げにちらちらと揺れた。'),
      calm: L('{c}は壁を見つめて、通り抜けられないことを確かめるように指先を当てた。|{c}はふわりと宙に浮かび、膝を抱えて静かに漂っていた。|{c}の輪郭が、ようやくはっきりとした形を取り戻した。'),
      joy: L('{c}の体が、嬉しさにほんのり明るく光った。|{c}はくるりと宙で回って、楽しそうに笑った。|{c}の透けた頬に、珍しく色が差して見えた。'),
      alert: L('{c}の体が、ふっと薄くなった。気配を消すときの癖だった。|{c}は床から少しだけ浮かび上がり、物音のしたほうへ滑るように近づいた。|{c}の輪郭が、張りつめた空気に震えるように揺らいだ。')
    },
    other: {
      trapped: L('{c}は{note}らしいしぐさで、閉ざされた扉を苛立たしげに睨んだ。|{c}の{note}らしい体が、狭さを嫌うように小さく身じろぎした。|{c}は{note}ならではの感覚で出口を探ったが、何も見つからなかった。'),
      fear: L('{c}は{note}らしい体を縮こまらせて、息をひそめた。|{c}の{note}らしい仕草が、怯えでぎこちなくなっていた。|{c}は{note}の本能のまま、身を守るように背を丸めた。'),
      calm: L('{c}は{note}らしい落ち着いた仕草で、ゆっくりと息をついた。|{c}の{note}らしい体から、ふっと力が抜けた。|{c}は{note}らしい癖で身なりを整え、静かに座り直した。'),
      joy: L('{c}は{note}らしいしぐさで、嬉しさを全身で表した。|{c}の{note}らしい姿が、いつもより生き生きして見えた。|{c}は{note}ならではのやり方で、上機嫌を隠さなかった。'),
      alert: L('{c}は{note}ならではの感覚を研ぎ澄まし、あたりの気配を探った。|{c}の{note}らしい体が、ぴりりと緊張した。|{c}は{note}らしい鋭さで、物音のしたほうへ顔を向けた。')
    }
  };
  /* 執着（ヤンデレ）：{c}＝執着する側、{o}＝執着される相手 */
  var OBSESS = {
    angel: L('{c}は翼で{o}を包み込んだ。優しく見えて、それは檻のようだった。|{c}の白い翼が、{o}の視界から自分以外のすべてを覆い隠した。|{c}は微笑んだまま、翼の内側に{o}を囲い込んだ。羽の一枚一枚が、逃げ道を塞いでいた。'),
    beast: L('{c}は{o}の首筋に鼻先を押しつけ、ほかの匂いがついていないか確かめた。|{c}の尻尾が{o}の腰に巻きつき、どこへも行かせまいとした。|{c}は{o}に自分の匂いを擦りつけるように、何度も頬を寄せた。低い唸りが、喉の奥で鳴っていた。'),
    vampire: L('{c}の牙が、{o}の首筋のすぐそばで止まった。噛まない。まだ。|{c}は{o}の手首に唇を寄せ、脈の音を数えるように目を閉じた。その音を、誰にも渡すつもりはなかった。|{c}の赤い瞳が、{o}をじっと見つめていた。目を逸らせば何が起きるのか、{o}にも分かっていた。'),
    demon: L('{c}の尾が{o}の足首に巻きついて、離さなかった。|{c}は{o}の背後に立ち、角の影を{o}の上に落とした。逃がすつもりがないことは、その影だけで分かった。|{c}の瞳が、{o}を見るときだけ妖しく光った。尾の先が、{o}の手首にそっと絡んで、ほどけなかった。'),
    ghost: L('{c}は壁をすり抜けて、{o}のすぐ後ろに立っていた。|{o}がどこへ行っても、振り返れば{c}の姿がうっすらと浮かんでいた。|{c}の冷たい指先が、{o}の背中にそっと触れた。いつからそこにいたのか、{o}には分からなかった。'),
    other: L('{c}は{note}らしいやり方で、{o}を自分のそばに引き留めた。|{c}の{note}らしい体が、{o}を囲い込むように寄り添った。|{c}は{note}ならではの執念で、{o}の居場所を片時も見失わなかった。')
  };
  A.RACE_MOOD = MOOD; A.RACE_OBSESS = OBSESS;

  function noteOf(c) { return (c && (c.raceNote || (c.src && c.src.raceNote))) || ''; }
  /* 文を出せる種族か（その他は種族の名前があるときだけ） */
  A.raceOk = function (c) { var r = A.raceOf(c); return r && MOOD[r] && (r !== 'other' || noteOf(c)) ? r : ''; };
  function fill(t, v) { return t.replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); }
  /* ctx（pick を持つ）・S（rng を持つ）・選ぶ関数のどれからでも、配列から一つ選ぶ関数を作る */
  A.racePick = function (p) {
    if (typeof p === 'function') return p;
    if (p && typeof p.pick === 'function') return function (l) { return p.pick(l); };
    if (p && typeof p.rng === 'function') return function (l) { return l[Math.floor(p.rng() * l.length) % l.length]; };
    return function (l) { return l[0]; };
  };
  /* 一回の結果の中で同じ文を続けて使わない（owner＝ctx や S ごとに、使った文を覚える。使い切ったら全部から選ぶ） */
  A.raceFresh = function (owner, pick) {
    var base = A.racePick(pick || owner);
    if (!owner || typeof owner !== 'object') return base;
    return function (l) {
      var m = owner._raceUsed || (owner._raceUsed = {}), f = l.filter(function (x) { return !m[x]; });
      var s = base(f.length ? f : l);
      if (!f.length) l.forEach(function (x) { delete m[x]; });
      m[s] = 1;
      return s;
    };
  };
  function log(kind, c, mood, text) { if (A.raceLog) A.raceLog.push({ kind: kind, who: c.name, race: A.raceOf(c), mood: mood || '', text: text }); }

  A.raceMood = function (c, mood, pick) {
    var r = A.raceOk(c), l = r && MOOD[r][mood];
    if (!l) return '';
    var s = fill(A.racePick(pick)(l), { c: c.name, note: noteOf(c) });
    log('mood', c, mood, s);
    return s;
  };
  /* 導入：種族のある人を名簿の順に max 人まで（既定 2） */
  A.raceIntro = function (list, mood, pk, max) {
    var who = (list || []).filter(function (c) { return c && c.alive !== false && A.raceOk(c); }).slice(0, max || 2);
    if (!who.length) return '';
    var pick = A.raceFresh(pk && typeof pk === 'object' ? pk : null, pk);
    return who.map(function (c) { var s = A.raceMood(c, mood, pick); if (A.raceLog && s) A.raceLog[A.raceLog.length - 1].kind = 'intro'; return s; }).join('');
  };
  var MKEY = { anger: 'trapped', fear: 'fear', joy: 'joy' };
  A.moodKey = function (c) {
    var E = HK.Emo, e = c && c.emo;
    if (!E || !E.mood || !e) return '';
    var m = E.mood(c);
    if (MKEY[m] && e[m] >= 50) return MKEY[m];
    /* 強い気分が引いて、落ち着きを取り戻したところ */
    if (m === 'calm' && c._emoPk && c._emoPk.v >= 50 && (e.calm || 0) >= 70) return 'calm';
    return '';
  };
  A.raceObsess = function (c, o, pick) {
    var r = A.raceOk(c), l = r && OBSESS[r];
    if (!l || !o) return '';
    var s = fill(A.racePick(pick)(l), { c: c.name, o: o.name, note: noteOf(c) });
    log('obsess', c, '', s + '（→' + o.name + '）');
    return s;
  };
})();
