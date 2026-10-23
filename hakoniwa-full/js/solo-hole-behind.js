/* 箱庭診断: 感覚遮断穴 ― 壁の向こう（下半身側）にいる住人（R18版のみ。登場人物はすべて成人として扱う）
   穴にはまった人のほかに、住人を3人まで「壁の向こう」に置ける。その人たちは途中で、壁から突き出た下半身に出くわす。
   ・助けるか、手を出すか、立ち去るかは、はまっている人との関係 × その人の性格 × はまっている人の発情の見え方（えっちに見えるか）で決まる
   ・誰の体か気づくかどうかも関係しだい（気づかなければ、知らない人の体として扱う）
   ・嫉妬深い人が、恋人や想い人の体だと気づくと「お仕置き」を始めることがある
   ・二人以上いれば：使命感の強い一人が率先して助ける／臆病な人が迷っているうちに、積極的な人が始めてしまう／話し合って決める
   ・受け攻め（HK.Pos）：動く側が手を出す側なら、女性は指、それ以外は挿入。手を出す側が受けなら挿入はしない（触れる・舐める、相手が攻めなら跨る）。
     自分で「攻め」を選んだ、はまっている人には、跨る以外の手出しはしない
   ・助け出されたら、その場で終わり。まだ感覚が戻っていなければ、その瞬間に溜まっていた分が一度に戻り、助けた人に抱きつきながら達する */
(function () {
  'use strict';
  var HK = window.HK, K = HK.SoloKit;
  if (!K) return;
  function L(s) { return s.split('|'); }
  var LOVE = /^(lover|mate|fated|almost|fwb)$/, W = { lover: 1, mate: 1, fated: 1, almost: 0.8, fwb: 0.45, sibling: 0.8, sibprot: 0.95, sibclose: 0.9, parent: 0.95, pparent: 0.9, best: 0.75, buddy: 0.8, childhood: 0.7, friend: 0.5, mentor: 0.6, master: 0.6, teacher: 0.5, senpai: 0.4, colleague: 0.3, acq: 0.1, ex: 0.3, rival: -0.3, enemy: -0.7, sibbad: -0.15, bad: -0.4 };
  var FAMILY = /^(sibling|sibprot|sibclose|sibbad|parent|pparent)$/;

  var T = {
    arrive1: L('{b}は、壁の向こう側の小部屋に足を踏み入れた。壁から、人の下半身が突き出ていた。|物音を辿って裏の通路に入った{b}は、壁の穴から生えた誰かの腰に出くわした。|{b}が扉を開けると、壁から腰から下だけがこちら側に突き出していた。'),
    arriveN: L('{n}は、連れ立って壁の向こう側の小部屋に入った。壁から、人の下半身が突き出ていた。|裏の通路を進んでいた{n}は、壁の穴から生えた誰かの腰を見つけて、立ち止まった。|扉を開けた{n}の前に、壁から突き出た誰かの下半身があった。'),
    see: [
      L('腰はぴくりとも動かず、何をされても分からない様子だった。|突き出た脚は、行儀よく揃えられたまま静かだった。'),
      L('穴の縁で、腰が小さく震えていた。肌はうっすらと汗ばみ、熱を帯びているのが見て取れた。|腰のあたりが、ときおり小さく跳ねた。肌は上気して、ほのかに赤く色づいていた。'),
      L('腰から下は、すっかり熱に浮かされていた。誘うようにひくつき、触れる前から甘い匂いを立てていた。|突き出た腰は、物欲しげに揺れていた。汗に濡れた肌が灯りを照り返し、誰が見ても分かるほど発情していた。')
    ],
    know: L('{b}は、見覚えのある靴と脚に気づいた。――{a}だ。|{b}は、腰のほくろの位置で分かってしまった。これは{a}の体だ。|壁の向こうから、くぐもった声が聞こえた。{b}には、それが{a}の声だと分かった。'),
    stranger: L('{b}には、それが誰の体なのか分からなかった。|{b}は、誰の体だろうと首をかしげた。'),
    /* 一人：迷う／助ける */
    help1: L('{b}は迷わず壁に手をかけ、穴の縁をこじ開けて{a}の体を引き抜いた。|{b}は壁の継ぎ目を探し、留め具を外して、{a}の腰をそっと穴から抜き出した。|{b}は周りを見回して道具を探し、壁を削って{a}を助け出した。'),
    helpStranger: L('{b}は「放っておけない」と呟き、知らない誰かの腰を、壁から引き抜きにかかった。――壁の向こうから出てきたのは、{a}だった。|{b}は困っている人を見過ごせなかった。穴の縁を広げて引き抜くと、それは{a}だった。'),
    leave: L('{b}は見なかったことにして、静かに扉を閉めた。|{b}は関わり合いになりたくなくて、そっと引き返した。|{b}は気まずそうに目を逸らし、足早に通り過ぎた。'),
    /* 二人以上 */
    lead: L('{b}は皆が言い合う前に壁に取りついた。「話はあと。まず出す」――{b}の勢いに押されて、{m}も手を貸した。|{b}はすぐさま指示を出した。「そっちを押さえて。私が引く」――皆がかりで、{a}の体は壁から抜けた。|使命感に背中を押されるように、{b}が先に動いた。{m}もつられて手を伸ばし、{a}を壁から引きずり出した。'),
    hesitate: L('{c}は「た、助けたほうがいいよね……？」と、壁の前でおろおろしていた。|{c}は手を伸ばしかけて、引っ込めた。誰の体か分からないまま触れるのが、怖かった。|{c}は助けようか迷って、何度も周りを見回した。'),
    beforeYou: L('そのあいだに、{b}が待ちきれないように腰に手をかけた。|{c}が迷っているうちに、{b}はもう服をくつろげていた。|{c}が言葉を探しているあいだに、{b}は笑って壁に歩み寄った。'),
    discuss: L('{n}は壁の前で顔を見合わせた。|{n}は、壁から突き出た腰を前に、小声で相談を始めた。|しばらく、誰も口を開かなかった。'),
    say: {
      help: L('{b}「出してあげよう」|{b}「困ってるんだよ、助けないと」|{b}「さすがに放っておけない」'),
      lewd: L('{b}「……少しくらい、いいんじゃない」|{b}「こんなの、誘ってるようなものだよ」|{b}「どうせ誰か分からないんだし」'),
      leave: L('{b}「関わらないほうがいい」|{b}「見なかったことにしよう」')
    },
    decideHelp: L('結局、皆で{a}を助け出すことになった。|話はまとまり、{n}は壁に取りついた。'),
    decideLewd: L('結局、誰も止めなかった。|反対の声は、小さすぎて届かなかった。'),
    decideLeave: L('結局、誰も手を出さず、皆でその場を離れた。|話し合いは、見なかったことにする、で終わった。'),
    stop: L('{c}が{b}の腕を掴んで止めた。「やめなよ。それより出してあげよう」|{c}は{b}の前に立ちはだかった。「今は助けるのが先」'),
    stopFail: L('{c}の制止は、{b}の耳に届かなかった。|{b}は{c}の手を振りほどいた。'),
    /* 手を出す（{b}=手を出す人） */
    pen: L('{b}は{a}の腰を両手で掴み、熱く濡れたところへ、ゆっくりと自分を沈めていった。|{b}は待ちわびるようにひくつく腰を押さえつけ、一息に奥まで貫いた。壁が、規則正しく軋みはじめた。|{b}は息を荒げながら{a}の腰を引き寄せ、深いところで何度も突き上げた。'),
    finger: L('{b}は{a}の腰を撫で下ろし、濡れて熱を持ったところに指を沈めた。指を増やすたびに、腰が物欲しげに揺れた。|{b}は穴の縁にもたれかかり、二本の指で奥を探った。腰は、指の動きに合わせて震えた。|{b}は舌と指で、{a}の熱いところを丁寧にほぐしていった。'),
    tease: L('{b}は{a}の腰に頬を寄せ、熱を持った肌に舌を這わせた。|{b}は震える腰を両手で包み込み、焦らすように撫で回した。|{b}は{a}の脚の間に顔を埋め、熱いところを唇で確かめた。'),
    ride: L('{b}は{a}の腰に跨り、突き出た体を使うように、ゆっくりと腰を揺らした。|{b}は壁に手をつき、{a}の上に跨って、熱を擦りつけるように腰を振った。|{b}は{a}の上で身をくねらせ、壁の向こうの体を好きなように味わった。'),
    punish: L('{b}は低く呟いた。「……誰にこんな顔を見せたの」――嫉妬に任せて、{b}は{a}の体を自分のものだと刻みつけるように責め立てた。|{b}の目に、暗い光が宿った。「こんな格好で、誰を待ってたの」――{b}は{a}を許すつもりはなかった。|{b}は{a}の腰に爪を立てた。「ここは私のものだって、分からせてあげる」'),
    join: L('{b}も、黙って隣に並んだ。|それを見て、{b}も我慢できなくなった。|{b}は笑って、順番を待たずに手を伸ばした。'),
    unaware: L('壁のこちら側の{a}は、何も感じないまま天井を見上げていた。|こちら側の{a}は、壁が揺れる理由を知らなかった。|{a}は、壁の向こうで誰が何をしているのか、まるで知らなかった。'),
    feel: L('{a}は、壁の向こうから伝わる熱に、声を殺して身をよじった。|戻っていた感覚が、壁の向こうの動きを一つ残らず{a}に伝えた。{a}は壁に爪を立てた。'),
    after: {
      rescue: L('ひとしきり満足すると、{b}は壁をこじ開けて{a}を引き抜いた。|事が済むと、{b}は何事もなかったように{a}を穴から助け出した。'),
      leave: L('{b}は服を整え、何も言わずに部屋を出ていった。|{b}はそのまま、壁の向こうの{a}を残して去っていった。')
    },
    /* 助け出される */
    rescued: L('壁から抜けた瞬間、{a}の腰に、遮断されていた感覚がまとめて戻ってきた。{a}は{b}にしがみついたまま、声も出せずに震えた。|引き抜かれた{a}の体に、溜まっていた熱が一度に雪崩れ込んだ。{a}は{b}の首に腕を回し、すがりつきながら何度も達した。|助け出されて礼を言いかけた{a}の膝が、崩れた。戻ってきた感覚に耐えきれず、{a}は{b}に抱きついたまま果てた。'),
    rescuedLive: L('{a}は{b}に抱きついて、震える息を吐いた。「……ありがとう」|{a}は助け出されるなり、{b}の胸に額を押しつけた。'),
    rescuedTop: L('{a}は壁から抜けるなり、{b}に礼を言った。腰から下には、何の熱も残っていなかった。|{a}は{b}の手を借りて立ち上がった。「助かった」'),
    knowAfter: L('――{b}は、助け出したのが{a}だと知って、言葉を失った。|{b}は、自分が触れていたのが{a}の体だったと知って、真っ青になった。')
  };

  function rel(input, a, b) {
    var best = 0, neg = 0, love = false, fam = false, crush = false;
    (input.ties || []).forEach(function (t) {
      if (!((t.a === a && t.b === b) || (t.a === b && t.b === a))) return;
      var w = t.type === 'crush' ? (t.a === a ? 0.85 : 0.15) : W[t.type] != null ? W[t.type] : 0.1;
      if (LOVE.test(t.type)) love = true;
      if (t.type === 'crush' && t.a === a) crush = true;
      if (HK.tieNoLove ? HK.tieNoLove(t) : FAMILY.test(t.type)) fam = true;
      if (w > best) best = w; if (w < neg) neg = w;
    });
    return { w: best > 0 ? best + neg * 0.3 : neg, love: love, crush: crush, fam: fam };
  }

  var BH = HK.HoleBehind = {};
  /* 描写の作風「男性向け」（solo-hole-ero.js の 'behind.*'）。地の文の差し込みは ero-kit.js の HK.Ero.fill */
  function EB(S, key, base) { return HK.Ero ? HK.Ero.L(S, 'hole', 'behind.' + key, base) : base; }
  function EZ(S, t) { return HK.Ero && HK.Ero.on(S) ? HK.Ero.fill(S, t, S.h) : t; }
  /* はまる人と、壁の向こうの人を決める（役割「穴にはまる」の人、いなければ一人目） */
  BH.cast = function (input) {
    var n = (input.chars || []).length, pick = function (i) { return ((input.perChar && input.perChar[i] && input.perChar[i].pick) || {}).side; };
    var si = 0;
    for (var i = 0; i < n; i++) if (pick(i) === 'stuck') { si = i; break; }
    var others = [];
    for (var j = 0; j < n; j++) if (j !== si) others.push(j);
    return { si: si, others: others.slice(0, 3) };
  };
  BH.setup = function (S, input, cast) {
    var Pz = HK.Pos;
    S.behind = cast.others.map(function (i) {
      var c = input.chars[i], b = { i: i, name: c.name, eg: c.eg, tr: HK.traits(c.eg), gender: c.gender || '', likes: c.likes || '', tone: c.tone || '', pos: c.pos || '', posLike: c.posLike || '', futa: !!c.futa };
      b.persona = HK.personaOf(b);
      b.r = rel(input, i, cast.si);
      return b;
    });
    S.behindAt = S.behind.length ? Math.max(1, Math.round(S.env.hours * (0.25 + S.rng() * 0.45))) : Infinity;
  };
  function names(l) { return l.map(function (b) { return b.name; }).join(l.length > 2 ? '・' : 'と'); }
  /* 手を出すときのやり方（受け攻めで決める）。手を出せない組なら null */
  function kindOf(S, b, h) {
    var Pz = HK.Pos;
    if (!Pz || !Pz.okSex(b, h)) return null;
    var o = Pz.order(b, h, [b, h]);
    if (o[0] === b) return Pz.hardTop(h) ? null : Pz.isF(b) ? 'finger' : 'pen';
    /* 手を出す側が受け：挿入はしない。はまっている人が自分で攻めを選んでいれば、跨るだけ */
    if (Pz.hardTop(h)) return 'ride';
    return S.rng() < 0.5 ? 'ride' : 'tease';
  }
  /* 出くわす：st = { live, stored, hardTop, topMe, meta } を更新する。助け出されたら { rescued: 助けた人 } */
  BH.encounter = function (S, st) {
    var h = S.h, rng = S.rng, B = S.behind, env = S.env;
    var vis = Math.min(2, Math.floor((st.stored / 14 + h.corrupt * 0.6 + (st.live ? h.pleasure * 0.5 : 0) + env.lewd * 0.15) / 25));
    if (st.hardTop) vis = Math.min(vis, 1);
    var F = function (t, v) { return K.fmt(S, t, v); };
    var t0 = B.length === 1 ? F(K.pick(S, T.arrive1), { b: B[0].name }) : F(K.pick(S, T.arriveN), { n: names(B) });
    t0 += F(K.pick(S, T.see[vis]));
    /* 誰の体か気づくか */
    B.forEach(function (b) {
      b.know = rng() < 0.15 + Math.max(0, b.r.w) * 0.6 + (b.r.love ? 0.15 : 0) + (h.action.id === 'shout' ? 0.2 : 0);
      var w = b.know ? b.r.w : 0, love = b.know && (b.r.love || b.r.crush), t = b.tr;
      b.kind = kindOf(S, b, h);
      var v = vis / 2;
      b.help = 0.12 + Math.max(0, w) * 0.9 + t.np * 0.35 + t.cp * 0.15 + t.caution * 0.1 - v * (t.fc * 0.3 + t.impulse * 0.3) - (b.know && b.r.fam ? 0 : 0);
      b.lewd = b.kind ? 0.05 + v * (0.45 + t.fc * 0.5 + t.impulse * 0.5 + t.aggr * 0.25) + (love ? v * 0.45 : 0) + Math.max(0, -w) * 0.5 + env.lewd / 250 - t.warmth * 0.15 - (love ? 0 : Math.max(0, w) * 0.35) - (b.know && b.r.fam ? 1 : 0) : 0;
      b.punish = !!(b.kind && love && t.jealous > 0.5 && vis >= 1 && rng() < 0.4 + t.jealous * 0.4);
      if (b.punish) b.lewd += 0.5;
      b.leave = 0.12 + t.cold * 0.25 + t.caution * 0.1;
      b.hes = b.persona === 'shy' || t.caution > 0.66 || (t.ac > 0.6 && t.cp < 0.4);
      b.mission = t.np * 0.5 + t.cp * 0.5;
      var x = rng() * (Math.max(0.01, b.help) + Math.max(0, b.lewd) + b.leave);
      b.choice = x < b.help ? 'help' : x < b.help + Math.max(0, b.lewd) ? 'lewd' : 'leave';
      t0 += ' ' + F(K.pick(S, b.know ? T.know : T.stranger), { b: b.name });
    });
    var o0 = K.say(S, { kind: 'ev', tag: '壁の向こうの住人', text: t0, why: B.map(function (b) { return b.name + '：' + (b.know ? '誰の体か気づいた' : '誰の体か分からない') + (b.know && b.r.w ? '（関係の近さ ' + Math.round(b.r.w * 100) + '）' : ''); }).join('／') + '／発情の見え方 ' + ['落ち着いている', '上気している', 'すっかり発情している'][vis] });
    K.key(S, o0, (B.length === 1 ? B[0].name : names(B)) + 'が壁の向こうに来た');

    var doers = [], rescuer = null, how = '';
    if (B.length === 1) {
      var b = B[0];
      if (b.choice === 'help') rescuer = b, how = b.know ? 'help1' : 'helpStranger';
      else if (b.choice === 'lewd') doers = [b];
      else { K.say(S, { kind: 'ev', tag: '立ち去る', text: F(K.pick(S, T.leave), { b: b.name }), why: b.name + 'は関わらなかった（ドライさ・慎重さ）' }); return null; }
    } else {
      var lead = B.slice().sort(function (x, y) { return y.mission - x.mission; })[0];
      var hes = B.filter(function (x) { return x.hes && x.choice !== 'lewd'; })[0];
      var agg = B.filter(function (x) { return x.choice === 'lewd' || (x.kind && x.tr.aggr + x.tr.impulse > 1.1); }).sort(function (x, y) { return (y.tr.aggr + y.tr.impulse) - (x.tr.aggr + x.tr.impulse); })[0];
      if (lead.mission > 0.62 && lead.help > lead.lewd && rng() < 0.65) {
        rescuer = lead; how = 'lead';
      } else if (hes && agg && agg !== hes && agg.kind) {
        /* 臆病な人が迷っているうちに、積極的な人が始めてしまう */
        K.say(S, { kind: 'ev', tag: '迷い', text: F(K.pick(S, T.hesitate), { c: hes.name }) + F(K.pick(S, T.beforeYou), { b: agg.name, c: hes.name }), why: hes.name + 'は臆病で迷い、' + agg.name + 'は積極的（攻撃性・衝動）' });
        doers = [agg];
        if (hes.tr.cp > 0.55 && rng() < 0.5) {
          var okStop = rng() < 0.3 + hes.tr.cp * 0.4 - agg.tr.aggr * 0.3;
          K.say(S, { kind: 'ev', tag: '制止', text: F(K.pick(S, T.stop), { b: agg.name, c: hes.name }) + (okStop ? '' : F(K.pick(S, T.stopFail), { b: agg.name, c: hes.name })), why: hes.name + 'のCP' });
          if (okStop) { doers = []; rescuer = hes; how = 'help1'; }
        }
      } else {
        /* 話し合って決める */
        var t1 = F(K.pick(S, T.discuss), { n: names(B) });
        B.forEach(function (x) { t1 += F(K.pick(S, T.say[x.choice]), { b: x.name }); });
        var sc = { help: 0, lewd: 0, leave: 0 };
        B.forEach(function (x) { sc[x.choice] += 1 + (x.choice === 'help' ? x.tr.cp * 0.5 : x.choice === 'lewd' ? x.tr.aggr * 0.5 : 0); });
        var win = sc.help >= sc.lewd && sc.help >= sc.leave ? 'help' : sc.lewd >= sc.leave ? 'lewd' : 'leave';
        t1 += F(K.pick(S, win === 'help' ? T.decideHelp : win === 'lewd' ? T.decideLewd : T.decideLeave), { n: names(B) });
        K.say(S, { kind: 'ev', tag: '話し合い', text: t1, why: '助ける ' + sc.help.toFixed(1) + '・手を出す ' + sc.lewd.toFixed(1) + '・立ち去る ' + sc.leave.toFixed(1) });
        if (win === 'help') { rescuer = B.slice().sort(function (x, y) { return y.help - x.help; })[0]; how = 'group'; }
        else if (win === 'lewd') doers = B.filter(function (x) { return x.choice === 'lewd' && x.kind; });
        else return null;
        if (win === 'lewd' && !doers.length) return null;
      }
    }
    /* 手を出す */
    doers.forEach(function (b, k) {
      var tx = (k ? F(K.pick(S, T.join), { b: b.name }) : '') + (b.punish ? F(K.pick(S, EB(S, 'punish', T.punish)), { b: b.name }) : '') + F(K.pick(S, EB(S, b.kind, T[b.kind])), { b: b.name });
      var pw = { pen: 34, finger: 26, tease: 20, ride: 28 }[b.kind] + (b.punish ? 8 : 0);
      if (st.live) {
        var r = K.stim(S, pw, { part: 'belly', defer: true });
        tx += ' ' + F(K.pick(S, EB(S, b.kind === 'pen' || b.kind === 'finger' ? 'feel' : 'feel.other', T.feel)));
        tx = EZ(S, tx);
        K.say(S, { kind: 'ev', tag: b.punish ? 'お仕置き' : '壁の向こうの住人', text: tx, why: whyOf(b) + '／感覚は戻っている' });
        K.logClimax(S, r.climaxes);
      } else {
        st.stored += (60 + env.lewd * 0.5) * (b.kind === 'pen' ? 1.3 : b.kind === 'ride' ? 1.1 : 0.9) * (b.punish ? 1.25 : 1) * h.sens;
        if (b.kind === 'pen' || b.kind === 'ride') st.meta.cum++;
        h.corrupt += 3 * (S.k || 1);
        tx += ' ' + F(K.pick(S, b.kind === 'pen' || b.kind === 'finger' ? EB(S, 'unaware', T.unaware) : T.unaware));
        tx = EZ(S, tx);
        K.say(S, { kind: 'ev', tag: b.punish ? 'お仕置き' : '壁の向こうの住人', text: tx, why: whyOf(b) + '／本人は感じていない（溜まった感覚 ' + Math.round(st.stored) + '）' });
      }
      K.settle(S);
    });
    if (doers.length) {
      /* 事が済んだあと：助け出すか、そのまま去るか */
      var best = doers.concat(B).sort(function (x, y) { return y.help - x.help; })[0];
      if (rng() < 0.15 + Math.max(0, best.help) * 0.35) { rescuer = best; how = 'after'; }
      else { K.say(S, { kind: 'ev', tag: '去る', text: F(K.pick(S, T.after.leave), { b: doers[0].name }), why: '' }); return null; }
    }
    if (!rescuer) return null;
    var others = B.filter(function (x) { return x !== rescuer; });
    var ht = how === 'lead' ? F(K.pick(S, T.lead), { b: rescuer.name, m: names(others) || '皆' }) : how === 'after' ? F(K.pick(S, T.after.rescue), { b: rescuer.name }) : how === 'group' ? F(K.pick(S, T.help1), { b: rescuer.name }) : F(K.pick(S, T[how] || T.help1), { b: rescuer.name });
    if (!rescuer.know && how !== 'helpStranger') ht += F(K.pick(S, T.knowAfter), { b: rescuer.name });
    var o = K.say(S, { kind: 'sys', tag: '救出', text: ht, why: rescuer.name + 'が助け出した（' + (how === 'lead' ? '使命感' : how === 'after' ? '事のあとで' : how === 'group' ? '話し合いで' : '関係・NP') + '）' });
    K.key(S, o, rescuer.name + 'に助け出された');
    return { rescued: rescuer, doers: doers };
  };
  function whyOf(b) {
    var k = { pen: '挿入', finger: '指で', tease: '触れる・舐める（受けなので挿入しない）', ride: '跨る（受けなので自分からは挿入しない）' }[b.kind];
    return b.name + 'が手を出した：' + k + (b.punish ? '／嫉妬深く、恋人（想い人）の体だと気づいたので、お仕置き' : '') + (b.know ? '' : '／誰の体か分からないまま');
  }
  /* 助け出されたときの終わり */
  BH.rescueEnd = function (S, input, st, res) {
    var h = S.h, b = res.rescued, F = function (t) { return K.fmt(S, t, { b: b.name }); };
    if (st.hardTop) K.say(S, { kind: 'sys', tag: '解放', text: F(K.pick(S, T.rescuedTop)), why: '自分で攻めを選んでいるので、何も溜まっていなかった' });
    else if (st.live || st.stored < 20) K.say(S, { kind: 'sys', tag: '解放', text: F(K.pick(S, T.rescuedLive)), why: '' });
    else {
      h.pleasure += st.stored * 0.8; h.reason -= st.stored * 0.07; h.corrupt += st.stored * 0.03 * (S.k || 1);
      var parts = []; while (h.pleasure >= 100 && parts.length < 4) parts.push(K.climax(S, { silent: true }));
      var oc = K.say(S, { kind: 'climax', tag: parts.length > 1 ? '連続絶頂' : '絶頂', text: EZ(S, F(K.pick(S, EB(S, st.topMe ? 'rescued.top' : 'rescued', T.rescued)))) + (parts.length ? ' ' + h.name + parts.join('') : ''), why: '助け出された瞬間に、溜まっていた感覚（' + Math.round(st.stored) + '）が戻った' });
      K.key(S, oc, b.name + 'に抱きついたまま達した');
    }
    K.settle(S); K.snap(S, { s: 0 });
    var did = res.doers.length ? res.doers.map(function (d) { return d.name; }).join('と') + 'が手を出した' : '';
    var E = { type: 'hold', kind: 'ok', title: '救出 ― ' + b.name + 'に助け出された', lines: [
      h.name + 'は' + S.env.hours + '時間のうち' + S.step + '時間目に、' + b.name + 'の手で壁から助け出された。',
      did ? '壁の向こうでは、' + did + '。' + (st.live ? h.name + 'はそれを、すべて感じていた。' : h.name + 'がそれを知ったのは、抜け出した瞬間だった。') : '',
      h.climax ? h.name + 'は' + h.climax + '回果てた。' : ''
    ].filter(Boolean) };
    return E;
  };
  BH.text = T;
})();
