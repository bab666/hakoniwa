/* 箱庭診断: ソロR18「感覚遮断穴」
   壁の穴に下半身がはまり、向こう側の感覚は遮断されている。何をされても分からない――はずだった。
   向こう側で起きたことは「溜まって」いき、解放の瞬間に一度に戻ってくる。そこで、どう果て、どう喘ぎ、どう混乱するか。 */
(function () {
  'use strict';
  var HK = window.HK, K = HK.SoloKit, DG = HK.DG;
  var clamp = HK.clamp;
  function L(s) { return s.split('|'); }

  var PLACE = {
    toilet: { n: '公衆トイレの壁', in: '{a}が目を覚ますと、腰から下が古いタイルの壁に埋まっていた。壁には「ご自由にお使いください」と落書きがあった。' },
    lab: { n: '魔術師の研究室', in: '{a}の腰は、魔法陣の刻まれた壁の穴にぴったりとはまっていた。机の上の札には「感覚遮断・実験体」とある。' },
    show: { n: '祭りの見世物小屋', in: '幕の向こうから、客引きの声が聞こえる。「さあさあ、壁から生えた不思議な――」{a}は、自分が何の見世物なのかを理解した。' },
    dungeon: { n: 'ダンジョンの罠部屋', in: '{a}は罠の床を踏んだ瞬間、壁に吸い込まれた。上半身だけがこちら側に残り、腰から下の感覚が、すっと消えた。' },
    white: { n: '白い部屋', in: '{a}が目を覚ますと、白い部屋の壁に腰まで埋まっていた。紙が一枚。「◯時間、耐えてください」' }
  };

  /* 壁の向こう（本人には分からない） */
  var BEYOND = L('壁の向こうで、誰かが小さく笑う声がした。{a}には、それが自分に向けたものかどうか分からなかった。|壁が、とん、とん、と規則正しく揺れた。{a}は何も感じない自分の腰を、ぼんやりと見下ろした。|向こう側で、何かの機械が低く唸り始めた。{a}の体は、何も伝えてこなかった。|壁越しに、複数の足音と、ひそひそ話す声が聞こえた。「…これ、本当に感じてないの？」|壁がわずかに温かくなった気がした。{a}は気のせいだと思うことにした。|向こう側から、ぬちゃ、という湿った音がした。{a}は耳を塞ぎたかったが、手が届かなかった。|壁の向こうで、誰かが「次、俺な」と言った。{a}は聞かなかったことにした。|しばらく静かだった。それから、壁が長いこと小刻みに震え続けた。');
  /* こちら側の心の動き（態度ごと） */
  var MIND = {
    proud: L('{a}は「出たら全員殴る」と天井に向かって宣言した。|{a}は腕を組み、苛立たしげに壁を拳で叩いた。「何がしたいんだ、これは」'),
    stern: L('{a}は目を閉じ、規則正しく呼吸を数え続けた。|{a}は乱れそうになる心を、規則正しい深呼吸で押さえつけた。'),
    tsun: L('{a}「べ、別に向こうで何されてても関係ないし。感じないし」――そう言いながら、何度も振り返ろうとした。|{a}は「気にしてない、気にしてない」と三十回くらい呟いた。'),
    gentle: L('{a}は「困ったわねえ」と頬に手を当て、壁の向こうの誰かに「乱暴にしないでね」と声をかけた。|{a}は鼻歌を歌って、時間が過ぎるのを待った。'),
    devoted: L('{a}は「大丈夫、何も感じないんだから、大丈夫」と自分に言い聞かせ続けた。|{a}は待っている人の顔を思い浮かべて、ぎゅっと目をつぶった。'),
    cool: L('{a}は「遮断が解けたとき、刺激が遡って伝わる可能性」について考えて、考えるのをやめた。|{a}は壁の振動の周期を数え、向こう側で何人が入れ替わったかを推測していた。'),
    free: L('{a}は「ねえ、今なにしてるの？実況してよ」と壁の向こうに話しかけた。返事はなかった。|{a}は暇すぎて、しりとりを一人で始めた。'),
    shy: L('{a}は「見ないで…見ないでください…」と、誰にともなく繰り返していた。|{a}は顔を両手で覆った。見えるのは自分の上半身だけなのに、恥ずかしくて仕方がなかった。')
  };
  MIND.polite = L('{a}は「どなたか、いらっしゃいませんか」と、丁寧に壁の向こうへ声をかけた。|{a}は姿勢を正し、「お時間まで、こちらでお待ちします」と誰にともなく言った。');
  var IMAGINE = L('{a}は、壁の向こうで今自分がどうなっているのかを、つい想像してしまった。顔が熱くなった。|何も感じないはずなのに、{a}は向こう側の音に合わせて、無意識に息を詰めていた。|{a}は自分の腰が今どんな格好なのかを考えて、頭を振った。想像は、止まらなかった。');
  var LEAK = L('一瞬だけ、遮断が揺らいだ。腰の奥に、遅れて届いた熱がずん、と響いた。{a}「――っ！？」|ほんの一秒、感覚が戻った。何かが、深いところに触れていた。{a}は息を呑んだまま固まった。|遮断の魔法がちらついた。{a}の太腿が、勝手に跳ねた。「い、今の、何…」');
  var SHOUT = L('{a}は「誰か！ここから出して！」と声を張り上げた。返事の代わりに、壁の向こうで誰かがくすくす笑った。|{a}は喉が嗄れるまで叫び続けた。声が届いているのかどうかも、分からなかった。|{a}「聞こえてるんでしょ！？」――壁が、返事をするように一度だけ揺れた。');
  var STRUGGLE = L('{a}は壁に手をついて、渾身の力で体を引き抜こうとした。びくともしなかった。|{a}は腰をよじって隙間を作ろうとした。穴は、ぴったりと{a}の形に締まった。');

  /* 時間を数える（いま何時間目かを、ちゃんと数える。熱が届いた直後は、まれに数えられなくなる） */
  var KAN = '〇一二三四五六七八九';
  function kan(n) { n = Math.max(0, Math.round(n)); if (n < 10) return KAN[n]; var t = Math.floor(n / 10), o = n % 10; return (t > 1 ? KAN[t] : '') + '十' + (o ? KAN[o] : ''); }
  var COUNT_OK = L('{a}は目を閉じ、呼吸を数えて時間を測った。「…まだ{t}時間か」|{a}は呼吸を数え直した。「{t}時間……と、{m}分くらい。あと{r}時間」|{a}は脈を数えて、頭の中で時計の針を進めた。――{t}時間経過。残り、{r}時間。|{a}「{t}時間。……よし、まだちゃんと数えられてる」|{a}は数えた呼吸の回数を、指を折って時間に直した。「…{t}時間。折り返しは、{half}時間」|{a}は小さく「{t}時間」と呟いた。あと{r}時間。数字を口にすると、少しだけ落ち着いた。');
  var COUNT_LATE = L('{a}は呼吸を数え続けた。「{t}時間……あと{r}時間。もうすぐだ」|{a}「{t}時間。……あと、{r}時間だけ」――数えるたびに、残りが短くなっていくのが救いだった。|{a}は数え続けた数字を確かめた。{t}時間。終わりは、もう見えていた。');
  var COUNT_LOST = L('{a}は呼吸を数えていたが、さっき届いた熱のせいで数が飛んだ。「…何時間、だっけ……」|{a}「{t}時間……いや、{tb}……あれ……？」数えるたびに、腰の奥の疼きが数字を溶かした。|気持ちよすぎて、{a}はもう何時間目なのか数えられなくなっていた。数えかけの数字が、吐息と一緒にこぼれていった。|{a}は「{t}……」と言いかけて、続きが出てこなかった。頭の中が、甘い霧で白く塗りつぶされていた。|{a}は最初から数え直そうとして、三回失敗した。「…いち、に……ん、っ……さん……」');
  function countText(S, t, H, hot) {
    var r = H - t, rng = S.rng;
    var v = { t: kan(t), r: kan(r), tb: kan(t + (rng() < 0.5 ? -1 : 1) || 1), half: kan(Math.ceil(H / 2)), m: ['十', '二十', '三十', '四十', '五十'][rng.int(5)] };
    var lost = hot && rng() < 0.35;
    var list = lost ? COUNT_LOST : r <= Math.max(1, H / 4) ? COUNT_LATE : COUNT_OK;
    return { text: K.fmt(S, K.pick(S, list), v), lost: lost };
  }

  /* 解放の瞬間 */
  var RELEASE = L('カチリ、と小さな音がした。遮断が、解けた。|壁の魔法陣が、ふっと光を失った。|「時間です」と、どこかで声がした。');
  var FLOOD = L('次の瞬間、{h}時間分の感覚が、一度に{a}の体へ雪崩れ込んだ。|遅れていたすべてが、まとめて{a}の腰の奥へ叩きつけられた。|{a}の体が、{h}時間ぶん溜め込んでいた熱を、一気に思い出した。');
  /* 解放中の混乱（態度ごと） */
  var CONFUSE = {
    proud: L('{a}「な、んだ、これ…っ、何、された…っ！？」|{a}は壁に爪を立てた。「ふざ、け…っ、止まら、な…」|{a}「誰だ…っ、誰が、こんな…ぁ」'),
    stern: L('{a}「…っ、追いつか、な…っ」|{a}は姿勢を保とうとして、膝から崩れた。「何が…起きて…」|{a}「数え…られない…何回…っ」'),
    tsun: L('{a}「や、やだ、うそ、こんなの聞いてな…っ！」|{a}「感じてない、感じてないのに…なんで…っ！」|{a}「ばか、ばかばか、止まって…っ」'),
    gentle: L('{a}「あら…あ、あ…待って、待ってちょうだい…っ」|{a}は困った笑みのまま、涙をこぼした。「何を、されていたの、わたし…」|{a}「ゆっくり…ゆっくり、来て…お願い…」'),
    devoted: L('{a}「ごめ、なさ…っ、わかんない、何もわかんない…っ」|{a}「大丈夫って、言ったのに…大丈夫じゃ、ない…っ」|{a}は泣きながら壁にしがみついた。「終わって、もう、終わって…」'),
    cool: L('{a}「…嘘、だろ…こんな、一度に…っ」|{a}の口から、意味をなさない数字がこぼれた。「よ、四…いや、六…」|{a}は初めて、自分の思考が完全に止まるのを感じた。'),
    free: L('{a}「えっ、なにこれ、なにこれ、やばっ…あっ、あぁっ！」|{a}「待って、こんなの、知らな…っ、ああっ、また…！」|{a}は笑っているのか泣いているのか分からない声を上げた。'),
    shy: L('{a}「ひっ…や、やだ…っ、声、出ちゃ…っ」|{a}は口を両手で押さえたが、指の隙間から声が漏れ続けた。|{a}「み、見ないで…今の、聞かないで…っ」')
  };
  CONFUSE.polite = L('{a}「も、申し訳、ありませ……っ、なにが、起きて……っ」|{a}「い、いけません、こんな……いっぺんに……っ」|{a}は丁寧な言葉を探そうとして、ひとつも見つからなかった。');
  var AFTER = {
    fall: L('{a}はしばらく動けなかった。やがて震える手で壁を撫で、小さな声で言った。「…もう一回、入れて」|{a}は解放されたあとも、壁の穴の前から離れなかった。次に入るのを、待っているようだった。|{a}は自分から、もう一度壁の穴へ腰を戻した。向こう側から、拍手が聞こえた。'),
    broken: L('{a}は床にへたり込んだまま、焦点の合わない目で天井を見ていた。何を言われても、しばらく返事ができなかった。|{a}は自分の腰に恐る恐る触れて、そこにまだ熱が残っているのを確かめ、顔を覆った。'),
    hold: {
      proud: L('{a}は膝を震わせながらも、自分の足で立った。「二度と来るか、こんなところ」'), stern: L('{a}は壁に額をつけたまま、長い長い息を吐いた。それから黙って服を整え、背筋を伸ばして部屋を出た。'),
      tsun: L('{a}は真っ赤な顔で「き、記憶にないから！何も覚えてないから！」と叫んで走り去った。'), gentle: L('{a}は「あらあら…大変だったわね、わたし」と自分の頭を撫でて、ふらふらと立ち上がった。'),
      devoted: L('{a}は泣きながら笑った。「…耐えた。ちゃんと、耐えたよ」'), cool: L('{a}はしばらく無言で天井を見つめ、「…記録には残さない」とだけ言った。'),
      polite: L('{a}は乱れた服を丁寧に整え、壁に向かって一礼してから部屋を出た。膝は、まだ震えていた。'), free: L('{a}は床に大の字になって、「すっご…なにあれ…」と天井に向かって呟いた。'), shy: L('{a}は乱れた服を整え、何もなかった顔で部屋を出た。廊下に出た瞬間、壁に手をついてしゃがみ込んだ。')
    }
  };

  HK.SCENARIOS.hole = {
    id: 'hole', name: '感覚遮断穴', kicker: 'ソロ・R18', solo: true, maxCast: 1, minCast: 1,
    desc: '壁の穴に下半身がはまり、向こう側の感覚は遮断されている。そこで何をされても分からない――解放されるまでは。※成人キャラクター向け',
    unit: '時間', simulate: function (input) { return run(input); },
    derived: ['caution', 'cold', 'impulse', 'honesty'],
    env: [
      { id: 'place', label: '場所', type: 'select', def: 'lab', options: Object.keys(PLACE).map(function (k) { return { v: k, label: PLACE[k].n }; }) },
      { id: 'hours', label: '解放までの時間', min: 1, max: 24, def: 6, lo: '1時間', hi: '24時間', unit: '時間' },
      { id: 'traffic', label: '壁の向こうの人通り', min: 0, max: 100, def: 50, lo: '誰も来ない', hi: '行列', desc: '多いほど、解放の瞬間に戻ってくる感覚が増える' },
      { id: 'leak', label: '遮断の不完全さ', min: 0, max: 100, def: 30, lo: '完璧', hi: 'ときどき漏れる', desc: '高いと、遮断中にも一瞬だけ感覚が届く' },
      { id: 'lewd', label: '向こう側の過激さ', min: 0, max: 100, def: 55, lo: 'いたずら程度', hi: '容赦なし' },
      { id: 'release', label: '解放のしかた', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'おまかせ' }, { v: 'burst', label: '一気に戻る' }, { v: 'drip', label: '少しずつ戻る' }, { v: 'mid', label: '最中に戻る' }, { v: 'late', label: '帰り道で遅れて戻る' }] }
    ],
    stats: [
      { id: 'sense', label: '感じやすさ', desc: '高いほど戻ってきた感覚に耐えられない' },
      { id: 'mind', label: '精神力', desc: '待っている間に心が削れにくい' }
    ],
    actions: [
      { id: 'count', label: '時間を数えてやり過ごす', fit: function (t) { return t.a * 0.6 + t.caution * 0.3; } },
      { id: 'shout', label: '大声で助けを呼ぶ', fit: function (t) { return t.cp * 0.5 + t.fc * 0.3; } },
      { id: 'imagine', label: '向こう側を想像してしまう', fit: function (t) { return t.fc * 0.4 + t.ac * 0.4; } },
      { id: 'sleep', label: '眠ってしまおうとする', fit: function (t) { return t.cold * 0.5 + t.np * 0.2; } },
      { id: 'struggle', label: '抜け出そうともがく', fit: function (t) { return t.aggr * 0.6 + t.impulse * 0.3; } }
    ],
    goals: [
      { id: 'escape', label: '自力で抜け出す', fit: function (t) { return t.cp * 0.5 + t.aggr * 0.3; } },
      { id: 'calm', label: '平静を保つ', fit: function (t) { return t.a * 0.5 + t.cold * 0.3; } },
      { id: 'nothing', label: '何もなかったことにする', fit: function (t) { return t.ac * 0.5 + t.caution * 0.3; } },
      { id: 'secret', label: '正直ちょっと気になる', fit: function (t) { return t.fc * 0.5 + t.honesty * 0.3; } }
    ],
    steps: function () { return []; }
  };

  function run(input) {
    var S = K.state(input, 'hole'), h = S.h, rng = S.rng, env = S.env;
    h.sens = 0.85 + (h.stats.sense - 3) * 0.12;
    var H = env.hours, pl = PLACE[env.place] || PLACE.lab;
    S.k = clamp(Math.pow(6 / H, 0.5), 0.5, 1.4);
    var topMe = HK.Pos && HK.Pos.vsNpc(h, '') === 'top';
    /* 自分で「攻め」を選んだ人は、壁の向こうで「される」側にならない：手を出そうとした相手は追い払われ、感覚は何も溜まらない */
    var hardTop = !!(HK.Pos && HK.Pos.hardTop(h));
    /* 攻めの指定なら「中に出された」系の文を避ける */
    var RECV_RE = /なか、|なかに|中に|中が|中を|お腹|内部|残留|残って|入っていた|注が|出され|太腿を伝|何人の方が|奥へ|奥に/;
    var pk = function (S0, arr) { var f = topMe ? arr.filter(function (x) { return !RECV_RE.test(x); }) : arr; return K.pick(S0, f.length ? f : arr); };
    var X = HK.HoleMore, plKey = PLACE[env.place] ? env.place : 'lab';
    var stored = 0, leaks = 0, visits = 0, people = 0, early = false, hot = 0, lostN = 0, meta = { cum: 0, tent: 0, mark: 0 }, thisN = 0;
    var mindList = MIND[h.persona].concat(X.MIND[h.persona] || []).filter(function (x) { return !hardTop || !/乱暴にしないで|お手柔らかに/.test(x); }), confList = CONFUSE[h.persona].concat(X.CONFUSE[h.persona] || []);
    /* 解放のしかた：おまかせなら場所と運で決まる */
    var mode = env.release && env.release !== 'auto' ? env.release : (function () { var x = rng(); return x < 0.4 ? 'burst' : x < 0.62 ? 'drip' : x < 0.82 ? 'mid' : 'late'; })();
    /* 最中に戻る：途中で遮断が壊れ、そのあとは壁の向こうをそのまま感じる（自分で攻めを選んだ人には起きない） */
    var LV = HK.HoleLive, live = false, liveTier = 0, liveN = 0, liveSeen = [], sweetUsed = [];
    if (mode === 'mid' && (hardTop || !LV)) mode = 'burst';
    var tMid = mode === 'mid' ? Math.max(1, Math.round(H * (0.35 + rng() * 0.3))) : Infinity;
    var lpk = function (arr) { var f = arr.filter(function (x) { return !(topMe && LV.RECV.test(x)); }); return K.pick(S, f.length ? f : arr); };
    function liveFx(be) {
      var tr = LV.tier(h), f = be.fx || {};
      var r = K.stim(S, 16 + be.lv * 9 + env.lewd / 9, { part: 'belly', defer: true, mind: tr < 2 });
      /* 意志が強いほど、受け入れていくのはゆっくり */
      h.corrupt += (3 + tr * 2 + (f.cum || 0) + (f.tent || 0)) * (1.25 - K.will(h)) * S.k;
      var t2 = LV.tier(h);
      /* 感覚の文は出来事の重さに合わせる（触れる程度なら軽い文、中に出されていなければ「注がれる」文を使わない） */
      var feels = be.lv === 0 && !(f.tent) ? LV.FEEL_LIGHT[t2] : LV.FEEL[topMe ? 'top' : 'recv'][t2].filter(function (x) { return f.cum || !/注が|果てる/.test(x); });
      var txt = K.fmt(S, be.t.replace(/◯/g, String(H))) + (rng() < 0.65 ? ' ' + K.fmt(S, lpk(LV.LIVE[plKey][t2])) : '') + ' ' + K.fmt(S, K.pick(S, feels.length ? feels : LV.FEEL_LIGHT[t2])) +
        ' ' + K.fmt(S, lpk(LV.REACT[h.persona][t2])) + (t2 === 2 && rng() < 0.5 ? ' ' + K.fmt(S, K.pick(S, LV.ENJOY[topMe ? 'top' : 'recv'])) : '');
      liveN++; liveTier = t2;
      K.say(S, { kind: 'ev', tag: ['感じてしまう', '体が応える', '自分から求める'][t2], text: txt, why: '感覚は戻っている／' + ['まだ抵抗している', '嫌なのに体が応える', '壁の向こうを受け入れた'][t2] + '（堕ち度 ' + Math.round(h.corrupt) + '・理性 ' + Math.round(Math.max(0, h.reason)) + '）' });
      /* 激しくされて、甘イキが止まらなくなる（揺らぐ・享受の段階で、過激な出来事か、続けて果てたとき。一回の遊びで二度まで） */
      if (t2 >= 1 && sweetUsed.length < 2 && (be.lv === 2 || r.climaxes.length >= 2 || rng() < 0.2 + t2 * 0.1)) {
        var cand = LV.SWEET.filter(function (p) { return sweetUsed.indexOf(p) < 0; }), sp = cand[rng.int(cand.length)];
        sweetUsed.push(sp);
        var nC = 2 + rng.int(3) + (t2 === 2 ? 1 : 0) - r.climaxes.length;
        for (var c2 = 0; c2 < nC; c2++) K.climax(S, { silent: true });
        var osw = K.say(S, { kind: 'climax', tag: '甘イキが止まらない', text: K.fmt(S, LV.sweetText(sp, topMe)), why: '感覚が戻ったあと、激しくされて ' + (nC + r.climaxes.length) + '回続けて果てた（絶頂 ' + h.climax + '回目まで）' });
        if (sweetUsed.length === 1) K.key(S, osw, '甘イキが止まらなくなった');
        return;
      }
      K.logClimax(S, r.climaxes);
    }
    /* 壁の向こうの出来事を、過激さに合わせて選ぶ */
    function beyond() {
      var lw = env.lewd / 100, wts = [1.2 - lw, 0.6 + lw * 0.2, lw * 1.6];
      /* 受け攻め：本人が攻めの指定なら、挿入される場面の代わりに「跨られる」場面を使う */
      var list = X.beyondFor ? X.beyondFor(h, plKey) : X.BEYOND[plKey];
      if (hardTop && X.BEYOND_HARD) return K.pick(S, X.BEYOND_HARD[plKey]);
      if (topMe && X.BEYOND_TOP) list = list.filter(function (e) { return !X.PEN_RE.test(e.t) && !(e.fx.cum > 0); }).concat(X.BEYOND_TOP);
      return HK.weighted(rng, list, function (e) { return Math.max(0.03, wts[e.lv]); });
    }
    function metaWhy() {
      var m = [];
      if (meta.cum) m.push((topMe ? '中で果てた ' : '中に出された ') + meta.cum + '回');
      if (meta.tent) m.push('触手・道具 ' + meta.tent + '回');
      if (meta.mark) m.push('記録・落書き ' + meta.mark);
      return '本人は感じていない' + (m.length ? '／' + m.join('・') : '');
    }
    K.say(S, { kind: 'sys', tag: '開始', text: K.fmt(S, pl.in.replace('◯', String(H))) + K.fmt(S, '腰から下の感覚は、きれいに消えていた。何をされても、分からない。'), why: '目標：' + h.goal.label + '／' + h.action.label });
    K.snap(S, { s: 0 });
    var stepH = Math.max(1, Math.ceil(H / 8));
    for (var t = stepH; t <= H; t += stepH) {
      S.step = t;
      K.step(S, t + '時間目');
      /* 向こう側 */
      var vis = 0;
      for (var q = 0; q < stepH; q++) vis += rng() < env.traffic / 100 * 0.9 ? 1 + (rng() < env.traffic / 200 ? 1 : 0) : 0;
      if (!live && t >= tMid && t < H + 1) {
        live = true;
        var ob = K.say(S, { kind: 'sys', tag: '遮断が壊れた', text: K.fmt(S, K.pick(S, LV.BREAK[plKey])) + ' ' + K.fmt(S, K.pick(S, LV.FLOOD)), why: '解放のしかた：最中に戻る（溜まっていた感覚 ' + Math.round(stored) + '）' });
        K.key(S, ob, '最中に感覚が戻った');
        h.pleasure += stored * 0.5; h.reason -= stored * 0.06; h.corrupt += stored * 0.04 * S.k; stored = 0;
        var bc = []; while (h.pleasure >= 100 && bc.length < 3) bc.push(K.climax(S, { silent: true }));
        K.logClimax(S, bc);
        K.settle(S);
      }
      var nEv = vis ? Math.min(2, vis) : 0;
      if (live && !nEv) K.say(S, { kind: 'ev', tag: '間', text: K.fmt(S, K.pick(S, LV.LULL[LV.tier(h)])), why: '' });
      for (var ev = 0; ev < nEv; ev++) {
        var be = beyond(), f = be.fx;
        if (live) {
          /* 「本人は知らない」書き方の出来事と、直近に出た出来事は引き直す */
          for (var tries = 0; tries < 6 && (LV.UNAWARE.test(be.t) || liveSeen.indexOf(be.t) >= 0); tries++) be = beyond();
          liveSeen.push(be.t); if (liveSeen.length > 4) liveSeen.shift(); f = be.fx;
          visits++; people += f.n || 0; meta.cum += f.cum || 0; meta.tent += f.tent || 0; meta.mark += f.mark || 0;
          liveFx(be); K.settle(S);
          if (rng() > 0.6) break;
          continue;
        }
        visits++; people += f.n || 0; meta.cum += f.cum || 0; meta.tent += f.tent || 0; meta.mark += f.mark || 0;
        if (!hardTop) stored += (40 + env.lewd * 0.6) * (1 + be.lv * 0.45 + (f.cum || 0) * 0.15 + (f.tent || 0) * 0.12) * (0.7 + rng() * 0.6) * h.sens;
        var txt = K.fmt(S, be.t.replace(/◯/g, String(H))) + (!hardTop && rng() < 0.55 ? K.fmt(S, pk(S, X.CONTRAST)) : '');
        K.say(S, { kind: 'ev', tag: '壁の向こう', text: txt, why: hardTop ? '攻めの指定：手を出そうとした相手を追い払った' : metaWhy() + '（溜まった感覚 ' + Math.round(stored) + '）' });
        if (rng() > 0.5) break;
      }
      /* こちら側に誰かが来る */
      if (!hardTop && stored > 60 && thisN < 2 && rng() < 0.22) {
        thisN++;
        K.say(S, { kind: 'ev', tag: 'こちら側', text: K.fmt(S, pk(S, X.THIS[plKey])) + ' ' + K.fmt(S, pk(S, X.THIS_REACT[h.persona])), why: '上半身の側にも、人が来た' });
        h.reason -= 3; h.corrupt += 2;
      }
      /* こちら側の心 */
      if (live) { if (hot > 0) hot--; K.settle(S); K.snap(S, { s: 0 }); continue; }
      var imag = h.tr.fc * 0.35 + h.tr.ac * 0.25 + h.tr.impulse * 0.2 + (h.action.id === 'imagine' ? 0.35 : 0) + (h.goal.id === 'secret' ? 0.25 : 0);
      var calm = h.tr.a * 0.35 + h.tr.cold * 0.3 + (h.stats.mind - 3) * 0.1 + (h.action.id === 'count' || h.action.id === 'sleep' ? 0.2 : 0);
      var counter = h.action.id === 'count' || h.tr.a > 0.62 || (h.tr.cp > 0.62 && h.tr.fc < 0.45);
      if (!hardTop && vis && rng() < imag) {
        h.reason -= 4 + imag * 6; h.corrupt += 2 + imag * 4; h.pleasure += 6; hot = 2;
        K.say(S, { kind: 'ev', tag: '想像', text: K.fmt(S, pk(S, IMAGINE)) + K.tail(S, 0.3, true), why: '想像してしまう（FC・AC・衝動）' });
      } else if (counter && t < H && rng() < (h.action.id === 'count' ? 0.8 : 0.5)) {
        var ct = countText(S, t, H, hot > 0 || h.pleasure > 35);
        if (ct.lost) { lostN++; h.reason -= 3; h.corrupt += 2; }
        K.say(S, { kind: 'ev', tag: ct.lost ? '数えられない' : '時間を数える', text: ct.text, why: ct.lost ? '遮断の揺らぎや想像で届いた熱が、数を溶かした' : '時間を数えてやり過ごす（A・慎重さ）' });
      } else if (h.action.id === 'sleep' && rng() < 0.55) {
        h.pleasure += 4;
        K.say(S, { kind: 'ev', tag: '眠り', text: K.fmt(S, pk(S, hardTop ? X.DREAM.filter(function (x) { return !/抱かれ|触れられ|甘い声/.test(x); }) : X.DREAM)), why: '眠ってやり過ごす' });
      } else if (rng() < 0.6) {
        h.reason -= Math.max(0, 3 - calm * 4);
        K.say(S, { kind: 'ev', tag: '待機', text: K.fmt(S, pk(S, mindList)), why: '口調「' + (HK.toneLabel ? HK.toneLabel(h) : HK.PERSONA[h.persona].label) + '」' });
      }
      if (H >= 4 && rng() < 0.18) K.say(S, { kind: 'ev', tag: '待つ体', text: K.fmt(S, pk(S, X.BODY)), why: '' });
      /* 遮断の揺らぎ */
      if (!hardTop && rng() < env.leak / 100 * 0.6 && stored > 30) {
        leaks++; hot = 2;
        var r = K.stim(S, 14 + env.lewd / 10, { part: 'belly', defer: true });
        K.say(S, { kind: 'ev', tag: '揺らぎ', text: K.fmt(S, pk(S, LEAK)) + (r.climaxes.length ? '' : K.tail(S, 0.4, true)), why: '遮断の不完全さ ' + env.leak });
        K.logClimax(S, r.climaxes);
      }
      /* 助けを呼ぶ */
      if (h.action.id === 'shout' && rng() < 0.5) K.say(S, { kind: 'ev', tag: '叫ぶ', text: K.fmt(S, pk(S, SHOUT)), why: '' });
      /* もがく */
      if ((h.action.id === 'struggle' || h.goal.id === 'escape' || hardTop) && rng() < 0.5) {
        if (rng() < 0.05 + h.tr.aggr * 0.08 + h.tr.cp * 0.05 + (hardTop ? 0.12 : 0)) { early = true; K.say(S, { kind: 'sys', tag: '脱出', text: K.fmt(S, '{a}は皮膚が擦りむけるのも構わず体をねじり、ついに壁から腰を引き抜いた。――遮断が、その場で解けた。'), why: '攻撃性・CP（自力脱出）' }); }
        else K.say(S, { kind: 'ev', tag: 'もがく', text: K.fmt(S, pk(S, STRUGGLE)), why: '' });
      }
      if (!hardTop) h.corrupt += vis * 0.8 * S.k;
      if (hot > 0) hot--;
      K.settle(S);
      K.snap(S, { s: Math.min(100, stored / 8) });
      if (early) break;
    }

    /* ---------- 解放 ---------- */
    S.step = H + 1;
    var ho = Math.round(early ? t : H);
    if (early && mode === 'late') mode = 'burst';
    if (hardTop) {
      /* 攻めの指定：何もさせなかった。戻ってくる感覚はない。抜け出したあと、壁の向こうの相手を逆に締め上げることもある */
      K.say(S, { kind: 'sys', tag: '解放', text: (early ? '' : K.fmt(S, pk(S, RELEASE))) + K.fmt(S, pk(S, X.TOP_RELEASE)), why: '壁の向こうには、何もさせなかった（追い払った相手 ' + visits + '）' });
      var revenge = visits > 0 && rng() < 0.4 + h.tr.aggr * 0.3 + h.tr.cp * 0.2;
      var ot = K.say(S, { kind: 'ev', tag: revenge ? '返り討ち' : '余韻', text: K.fmt(S, pk(S, revenge ? X.TOP_REVENGE[plKey] : X.TOP_AFTER)), why: revenge ? '壁の向こうに回り、手を出そうとした相手を逆に責めた（攻撃性・CP）' : '' });
      K.key(S, ot, revenge ? '壁の向こうの相手を返り討ちにした' : '何もさせずに出てきた');
      K.snap(S, { s: 0 });
      var Et = { type: 'hold', kind: 'ok', title: revenge ? '返り討ち ― 壁の向こうを締め上げた' : early ? '自力脱出 ― 指一本触れさせなかった' : '何もさせなかった ― 脚が最後まで守りきった', lines: [
        h.name + 'は' + pl.n + 'で' + ho + '時間を過ごした。壁の向こうには' + (people || visits) + '人が来ていた。',
        visits ? '手を出そうとした相手は、全員追い払われた。' + h.name + 'の腰から下には、何も溜まらなかった。' : '壁の向こうには、結局誰も手を出してこなかった。',
        revenge ? '最後に締め上げられたのは、壁の向こう側の方だった。' : ''
      ].filter(Boolean) };
      return K.finish(S, input, Et, ['自分で「攻め」を選んでいるので、壁の向こうで「される」側には回らなかった。', '抜け出せるかどうかは、攻撃性（' + Math.round(h.tr.aggr * 100) + '）とCP（' + Math.round(h.eg.CP) + '）しだい。'], { meta: pl.n + '・' + H + '時間', estats: [['経過', ho + '時間'], ['壁の向こうの人数', (people || visits) + '人'], ['追い払った', visits + '回'], ['返り討ち', revenge ? 'あり' : 'なし']], gaugeS: '溜まった感覚' });
    }
    if (live) {
      K.step(S, '解放');
      var tierE = LV.tier(h);
      var oe = K.say(S, { kind: 'sys', tag: '解放', text: K.fmt(S, K.pick(S, LV.END[tierE])), why: '感覚が戻ってから ' + liveN + '回、壁の向こうを感じた' });
      K.key(S, oe, '解放の時間');
      K.settle(S);
      var stL = h.fallen || h.corrupt >= 100 ? 'fall' : tierE === 2 ? 'enjoy' : tierE === 1 ? 'broken' : 'hold';
      var oa2 = K.say(S, { kind: 'sys', tag: stL === 'fall' || stL === 'enjoy' ? '陥落' : '余韻', text: K.fmt(S, pk(S, stL === 'hold' ? AFTER.hold[h.persona] : stL === 'enjoy' ? AFTER.fall : AFTER[stL])), why: '絶頂 ' + h.climax + '回・堕ち度 ' + Math.round(h.corrupt) });
      K.key(S, oa2, stL === 'fall' ? '快楽に堕ちた' : stL === 'enjoy' ? '壁の向こうを受け入れた' : stL === 'broken' ? '崩れ落ちた' : '耐えきった');
      K.snap(S, { s: 0 });
      var metaL = [];
      if (meta.cum) metaL.push((topMe ? '向こう側の誰かの中で果てたのは' : '中に出されたのは') + meta.cum + '回');
      if (meta.tent) metaL.push('触手や道具に責められたのは' + meta.tent + '回');
      var EL = { type: stL === 'enjoy' ? 'fall' : stL, kind: stL === 'fall' || stL === 'enjoy' ? 'over' : stL === 'broken' ? 'mid' : 'ok', title: stL === 'fall' ? '快楽堕ち ― 最中に戻った感覚に呑まれた' : LV.TITLE[tierE], lines: [
        h.name + 'は' + pl.n + 'で' + ho + '時間を過ごした。壁の向こうには' + (people || visits) + '人が来ていた。',
        '途中で遮断が壊れ、そこから先は、壁の向こうで起きることをすべて感じていた。' + (metaL.length ? metaL.join('、') + '。' : ''),
        K.fmt(S, LV.LINE[tierE]) + h.name + 'は' + h.climax + '回果てた。'
      ] };
      var advL = ['最中に感覚が戻ると、溜まっていた分が一度に届き、そのあとは一つ一つを生で感じる。', '受け入れていく早さは、意志（CP・A・理性）で遅くなり、過激さ ' + env.lewd + '・感じやすさ ' + h.stats.sense + 'で早くなる。'];
      return K.finish(S, input, EL, advL, { meta: pl.n + '・' + H + '時間・最中に戻る', estats: [['経過', ho + '時間'], ['壁の向こうの人数', (people || visits) + '人'], ['感覚が戻ってから', liveN + '回'], [topMe ? '中で果てた回数' : '中に出された回数', meta.cum + '回'], ['絶頂', h.climax + '回'], ['堕ち度', Math.round(h.corrupt)]], gaugeS: '溜まった感覚' });
    }
    K.step(S, early ? '脱出の瞬間' : mode === 'late' ? '解放……？' : '解放');
    var o0;
    if (mode === 'late') {
      o0 = K.say(S, { kind: 'sys', tag: '解放', text: K.fmt(S, pk(S, RELEASE)) + ' ' + K.fmt(S, pk(S, X.LATE_IN)), why: '感覚は、まだ戻っていない' });
      S.step = H + 2; K.step(S, '帰り道');
    } else {
      o0 = K.say(S, { kind: 'sys', tag: '解放', text: K.fmt(S, pk(S, RELEASE)) + ' ' + (mode === 'drip' ? K.fmt(S, topMe ? X.DRIP_TOP[0] : X.DRIP[0]) : K.fmt(S, pk(S, FLOOD), { h: ho })), why: '溜まっていた感覚 ' + Math.round(stored) + '（訪問 ' + visits + '回）／解放：' + X.RELEASE_MODE[mode] });
    }
    K.key(S, o0, '感覚が戻った');
    var wave = Math.min(mode === 'drip' ? 10 : 8, Math.max(mode === 'drip' ? 3 : 1, Math.round(stored / (mode === 'drip' ? 55 : 80))));
    var restore = stored;
    for (var w = 0; w < wave && restore > 0; w++) {
      var chunk = Math.min(restore, mode === 'drip' ? 40 + rng() * 40 : 70 + rng() * 60);
      restore -= chunk;
      h.pleasure += chunk * (0.9 + w * 0.08);
      h.reason -= chunk * 0.09; h.corrupt += 3 * S.k;
      var parts = [];
      while (h.pleasure >= 100 && parts.length < 3) parts.push(K.climax(S, { silent: true }));
      var lead = mode === 'late' && w === 0 ? K.fmt(S, pk(S, X.LATE)) + ' ' : mode === 'drip' && w > 0 && rng() < 0.5 ? K.fmt(S, topMe ? X.DRIP_TOP[1 + rng.int(X.DRIP_TOP.length - 1)] : X.DRIP[1 + rng.int(X.DRIP.length - 1)]) + ' ' : '';
      /* 地の文のあとに「……」が続くと、話し手が分からず口調が付かない。そのときは名前を前に置く */
      var lineTxt = lead + (parts.length ? (lead ? h.name : '') + (parts[0].charAt(0) === '「' ? '' : K.moan(S)) + parts.join('') : K.fmt(S, pk(S, confList)));
      if (parts.length && rng() < 0.7) lineTxt += ' ' + K.fmt(S, pk(S, confList));
      K.say(S, { kind: parts.length ? 'climax' : 'ev', tag: parts.length ? (parts.length > 1 ? '連続絶頂' : '絶頂') : '混乱', text: lineTxt, why: (w + 1) + '波目' + (parts.length ? '・' + parts.length + '回' : '') });
      K.settle(S);
    }
    var state = h.fallen || h.corrupt >= 100 ? 'fall' : h.corrupt >= 70 || h.climax >= 6 ? 'broken' : 'hold';
    var oa = K.say(S, { kind: 'sys', tag: state === 'fall' ? '陥落' : '余韻', text: K.fmt(S, pk(S, mode === 'late' ? X.LATE_AFTER[state] : state === 'hold' ? AFTER.hold[h.persona] : AFTER[state])), why: '絶頂 ' + h.climax + '回・堕ち度 ' + Math.round(h.corrupt) });
    K.key(S, oa, state === 'fall' ? '快楽に堕ちた' : state === 'broken' ? '崩れ落ちた' : '耐えきった');
    /* 壁の向こうを見に行く */
    var peeked = false;
    if (state !== 'fall' && mode !== 'late' && rng() < 0.2 + h.tr.fc * 0.25 + h.tr.a * 0.15 + (h.goal.id === 'secret' ? 0.3 : 0)) {
      peeked = true;
      K.say(S, { kind: 'ev', tag: '壁の向こう側へ', text: K.fmt(S, pk(S, X.PEEK), { marks: String(Math.max(1, Math.ceil((meta.mark + people) / 5))), visits: String(people || visits) }), why: '好奇心（FC・A）' });
    }
    K.snap(S, { s: 0 });

    var title = state === 'fall' ? '快楽堕ち ― 自分から穴に戻った' : mode === 'late' ? '帰り道で ― 遅れて届いた' + ho + '時間' : state === 'broken' ? '崩れ落ちた ― ' + h.climax + '回の波に呑まれて' : early ? '自力脱出 ― 溜まった分だけで済んだ' : peeked ? '見てしまった ― 壁の裏側の記録' : '耐えきった ― 最後まで心は折れなかった';
    var metaLine = [];
    if (meta.cum) metaLine.push((topMe ? '向こう側の誰かの中で果てたのは' : '中に出されたのは') + meta.cum + '回');
    if (meta.tent) metaLine.push('触手や道具に責められたのは' + meta.tent + '回');
    var E = { type: state, kind: state === 'fall' ? 'over' : state === 'broken' ? 'mid' : 'ok', title: title, lines: [
      h.name + 'は' + pl.n + 'で' + ho + '時間を過ごした。壁の向こうには' + (people || visits) + '人が来ていた。',
      metaLine.length ? '壁の向こうで' + metaLine.join('、') + '。' + h.name + 'がそれを知ったのは、' + (mode === 'late' ? '帰り道でのことだった。' : '感覚が戻った瞬間だった。') : '',
      '戻ってきた感覚で、' + h.name + 'は' + h.climax + '回果てた。' + (leaks ? '遮断の揺らぎは' + leaks + '回。' : '') + (lostN ? '時間を数えられなくなったのは' + lostN + '回。' : ''),
      h.goal.id === 'nothing' ? h.name + 'は「何もなかった」と言い張った。' + (state === 'hold' ? '本当にそう見えた。' : '誰も信じなかった。') : h.goal.id === 'secret' ? '「ちょっと気になる」の答えは、' + (state === 'fall' ? '思っていた以上だった。' : '知らないほうがよかった。') : ''
    ].filter(Boolean) };
    var adv = [];
    adv.push('待っている間に削れたのは、' + (h.tr.fc + h.tr.ac > h.tr.a + h.tr.cold ? '想像力（FC・AC）のせい。何も感じないのに、心だけが先に熱くなった。' : '時間そのもの。A・ドライさのおかげで、想像には呑まれにくかった。'));
    adv.push('戻ってきた感覚の量は、人通り ' + env.traffic + '・過激さ ' + env.lewd + '・感じやすさ ' + h.stats.sense + 'で決まった。解放のしかたは「' + X.RELEASE_MODE[mode] + '」。');
    if (state !== 'hold') adv.push('精神力（' + h.stats.mind + '）とCP（' + Math.round(h.eg.CP) + '）がもう少しあれば、最後の波に耐えられたかもしれない。');
    return K.finish(S, input, E, adv, { meta: pl.n + '・' + H + '時間・' + X.RELEASE_MODE[mode], estats: [['経過', ho + '時間'], ['壁の向こうの人数', (people || visits) + '人'], [topMe ? '中で果てた回数' : '中に出された回数', meta.cum + '回'], ['触手・道具', meta.tent + '回'], ['遮断の揺らぎ', leaks + '回'], ['解放時の絶頂', h.climax + '回'], ['堕ち度', Math.round(h.corrupt)]], gaugeS: '溜まった感覚' });
  }
  HK.SCEN_ORDER.push('hole');
})();
