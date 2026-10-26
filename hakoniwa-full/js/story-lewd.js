/* 箱庭シミュレーター（R18版のみ）: 物語型の箱庭（邪神村RTA・吹雪の館の殺人）を、R18の描写の設定（lewd-unify.js）に合わせる
   ・描写の長さ：段落に分けた版（r18-thick.js・jashin-dark-thick.js）を使うかは、r18-thick.js の on() が HK.Lewd.storyShort を見て決める
   ・描写の作風「男性向け」：
       参加者どうしの交わり（HK.R18M.sex・女性どうし）は thick-sex-ero.js の山場（厚い版／短い版）に差し替える
       喘ぎ（HK.R18M.say）は ero-kit.js の態度9種×段階の♡の喘ぎに
       合意のない場面（村人・神・眷属・儀式など、一人が受ける場面）には男性向けの文を足さない。自分で攻めを選んだ人が主導する場面だけ SOLO_TOP を足す
   ・濃い：山場（kind: 'climax' の性的な場面）のあとに、もう一度の段落を足す
   ・ほのめかす：lewd-unify.js が結果の文をまろやかにする
   登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, X = HK.Lewd, E = HK.Ero, TE = HK.ThickEro, R = HK.R18M;
  if (!ST || !X || !E || !TE || !R) return;
  function L(s) { return s.split('|'); }
  var SCEN = { jashin: 1, yakata: 1 };
  function on(S) { return !HK.SAFE_ON && S && S.scen && SCEN[S.scen.id] && X.conf(S.scen.id); }
  function ero(S) { return on(S) && X.ero(S.env) && X.lv(S.env) !== 'low'; }
  /* 一回の結果の中で同じ文を繰り返さない（ero-kit.js の HK.Ero.fresh） */
  function pick(S, a) { return E.fresh ? E.fresh(S, a, function (l) { return ST.pick(S, l); }) : ST.pick(S, a); }

  /* 描写の長さ：一つの場面（記録一件）のあいだは同じ答えを返す */
  X.storyShort = function (S) {
    if (!on(S)) return false;
    var n = (S.log || []).length;
    if (S._lwShortN !== n) { S._lwShortN = n; S._lwShort = X.short(S.env, S.rng); }
    return S._lwShort;
  };
  X.storyEro = ero;

  /* 男性向け：参加者どうしの交わり（x＝攻め、y＝受け） */
  X.storyEroSex = function (S, x, y) {
    if (HK.Pos) { var od = HK.Pos.order(x, y, [x, y]); x = od[0]; y = od[1]; }
    var pk = function (a) { return pick(S, a); }, short = X.storyShort(S);
    var hi = X.high(S.env);
    if (hi) S._r18A = S.log.length;
    pair(S);
    var r = short ? TE.short({ S: S, pick: pk, a: x, b: y, again: hi }) : TE.scene({ S: S, pick: pk, rng: S.rng, a: x, b: y, style: HK.ThickSex ? HK.ThickSex.style(x) : 'gentle', open: ' ', again: hi });
    var t = r.text.replace(/^ \n\n/, '').replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name);
    if (HK.Pos && HK.Pos.ff(x, y) && HK.FF && HK.FF.fix) t = HK.FF.fix({ pick: pk, rng: S.rng }, t, x, y);
    return short ? t : '\n\n' + t;
  };
  /* この記録（場面）で交わりの部品を使ったか（山場の判定に使う） */
  function touch(S) { if (S && S.log) S._r18N = S.log.length; }
  /* 参加者どうしの交わり（合意の場面）を組み立てているとき */
  function pair(S) { if (S && S.log) S._r18P = S.log.length; }
  function inPair(S) { return S._r18P === (S.log || []).length; }
  /* 人に無理やり襲われる場面（村人・使用人・名前のある人の「抵抗」）：男性向けの文（♡の喘ぎ・段落・二回戦）は足さない */
  function force(S) { if (S && S.log) S._r18F = S.log.length; }
  function forced(S, o) { return S._r18F === (S.log || []).length || !!(o && FORCED[o.tag]); }
  var FORCED = { '夜這い': 1, '清めの湯': 1, '凌辱': 1, '脅迫': 1 };
  ['npc', 'resist', 'solo', 'group'].forEach(function (k) { var f = R[k]; if (typeof f === 'function') R[k] = function (S, by) {
    touch(S);
    if ((k === 'npc' && by !== 'god') || (k === 'resist' && by !== 'god')) force(S);
    return f.apply(this, arguments);
  }; });
  var sex0 = R.sex;
  R.sex = function (S, x, y) {
    touch(S); pair(S);
    if (ero(S)) return X.storyEroSex(S, x, y);
    var t = sex0.apply(this, arguments);
    /* 濃い：交わりのすぐあとに、もう一度の段落（記録の終わりに重ねて足さないよう印を付ける） */
    if (on(S) && X.high(S.env) && X.lv(S.env) !== 'low' && t) {
      if (HK.Pos) { var od = HK.Pos.order(x, y, [x, y]); x = od[0]; y = od[1]; }
      var sh = !/\n\n/.test(t);
      t += (sh ? '' : '\n\n') + TE.again(S, function (a) { return pick(S, a); }, x, y, false, sh).replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name);
      S._r18A = S.log.length;
    }
    return t;
  };

  /* 男性向けの喘ぎ：start／mid／climax は段階 0／1／2。自分で攻めを選んだ人・攻めの声は、主導する側の声 */
  var STAGE = { start: 0, mid: 1, climax: 2, top: 1, topc: 2 };
  var say0 = R.say;
  R.say = function (S, p, kind) {
    touch(S);
    if (!ero(S) || STAGE[kind] == null || forced(S) || !inPair(S)) return say0.apply(this, arguments);
    var dom = kind === 'top' || kind === 'topc' || (HK.Pos && HK.Pos.hardTop && HK.Pos.hardTop(p)), d = p.eroDom;
    p.eroDom = dom;
    var m = E.moan(S, p, STAGE[kind]);
    p.eroDom = d;
    return p.name + '「' + m + '」';
  };
  R.moans = function (S, p, kinds) { return (kinds || ['start', 'climax']).map(function (k) { return R.say(S, p, k); }).join(''); };

  /* 自分で攻めを選んだ人：相手（村人・神・眷属）を責め立てる側。男性の攻め（SOLO_TOP）と女性の攻め（SOLO_TOP_F）で書き分ける */
  var SOLO_TOP_ANY = L('{a}「{m1}」――{a}は相手の弱いところを探り当て、ぐちゅぐちゅと音を立てて責め続けた。{s:wet}。相手が果てても、{a}はしばらく手を緩めなかった。|{a}は相手の手首を頭の上でまとめて押さえ、もう片方の手で肌をゆっくりとなぞり下ろした。{s:wet}。焦らされた相手が懇願するまで、{a}は指を止めなかった。{a}「{m2}」');
  var SOLO_TOP = SOLO_TOP_ANY.concat(L('{a}は相手を押さえつけ、自分の好きな速さで腰を使った。{s:hit}。{a}「{m2}」――最後は相手の奥に、たっぷりと吐き出した。|' +
    '{a}は相手の腰を掴んで引き寄せ、逃げる隙も与えずに根元まで沈めた。{s:hit}。{a}「{m1}」――相手の喉から漏れる声が甘く崩れるまで、{a}は少しも速さを緩めなかった。|' +
    '{a}は相手をうつ伏せに転がし、背中にのしかかるようにして後ろから突き入れた。{s:hit}。相手が畳に爪を立てるたびに、{a}はさらに深く腰を沈めた。{a}「{m2}」――最後は一番奥に押しつけたまま、熱を吐き出した。|' +
    '{a}「{m1}」――{a}は相手の脚を肩に担ぎ上げ、真上から叩きつけるように腰を落とした。{s:hit}。相手が何度達しても、{a}は自分が果てるまで動きを止めなかった。|' +
    '{a}は相手の顎を掴んで目を合わせさせ、奥をゆっくりと捏ね回した。{s:wet}。焦らされた相手が自分から腰を揺らし始めると、{a}は満足げに笑って一気に突き上げた。{a}「{m2}」'));
  var SOLO_TOP_F = SOLO_TOP_ANY.concat(L('{a}は相手を仰向けに押し倒して跨り、自分の好きな速さで腰を揺らした。{s:wet}。{a}「{m1}」――相手が音を上げても、{a}は自分が満足するまで降りなかった。|' +
    '{a}は相手の顔の上にゆっくりと腰を落とし、舌を使わせた。{s:suck}。{a}「{m1}」――相手の髪を掴んだまま、{a}は何度も腰を震わせて達した。|' +
    '{a}「{m1}」――{a}は相手の胸に手をついて腰を擦りつけ、相手の息が乱れるたびに、わざと動きを緩めた。{s:wet}。主導権は、最後まで{a}の手を離れなかった。|' +
    '{a}は相手の脚のあいだに膝を割り込ませ、逃げられないように体重をかけた。{s:wet}。弱いところを指で責め立てられ、相手は{a}の下で何度も震えた。{a}「{m2}」|' +
    '{a}は相手の耳朶を甘く噛み、「動いていいなんて言ってない」と囁いた。{s:wet}。相手がもどかしげに身をよじるたびに、{a}は笑って、さらに焦らした。{a}「{m2}」'));
  /* 二人の場面（{b}＝受け）で、まだ男性向けの文がないとき */
  var PAIR = L('{s:wet}。{b}「{mb1}」――絡み合うたびに、いやらしい音が部屋に響いた。{b}「{mb2}」――{b}はびくびくと震えながら、{a}にしがみついてイった。|{a}は{b}の一番弱いところを見つけると、そこばかりを執拗に責め立てた。{s:hit}。{b}「{mb2}」|' +
    '{a}は{b}の耳元で「声、聞かせて」と囁いた。{s:wet}。{b}「{mb1}」――囁かれるたびに{b}の体は跳ね、とうとう{a}の腕の中で果てた。|' +
    '{b}「{mb1}」――{b}が逃げるように腰を引くと、{a}はそれを許さずに引き戻した。{s:wet}。{b}「{mb2}」――最後は{a}にしがみついたまま、全身を震わせてイった。|' +
    '{a}は{b}の両手に指を絡めて押さえ、弱いところばかりをゆっくりと責めた。{s:wet}。{b}「{mb2}」――焦らされ続けた{b}は、強く触れられた瞬間にあっけなく達してしまった。|' +
    '{s:wet}。{b}「{mb1}」――声を殺そうとする{b}の唇を、{a}が自分の唇で塞いだ。塞がれたまま、{b}は{a}の腕の中で何度もびくびくと震えた。');
  /* 一人の場面の「濃い」（受ける側。合意のない場面なので、ぼかした書き方だけ） */
  var AGAIN_SOLO = L('それは一度では終わらなかった。夜が白むまで、{a}は何度も同じことを繰り返された。|一度果てたあとも、解放はされなかった。二度目は、一度目よりずっと長かった。|息が整う間もなく、また手が伸びてきた。{a}が解放されたのは、空が明るくなりはじめてからだった。|' +
    '夜はまだ終わらなかった。{a}が意識を手放しかけるたびに、また何かが{a}を引き戻した。|' +
    '{a}が果てたあとも、気配は去らなかった。二度、三度と波が押し寄せ、{a}はそのたびに声を上げさせられた。|' +
    '解放されたと思ったのは、束の間だった。闇の奥から、また新しい手が伸びてきた。|' +
    '{a}は朦朧としたまま、何度目かも分からない熱に呑まれた。数えることは、とうに諦めていた。|' +
    '一度目が終わると、すぐに二度目が始まった。{a}の体はもう、拒むことを忘れかけていた。|' +
    '鶏が鳴くころになって、ようやく気配が離れていった。{a}の体には、夜の名残りがいつまでも疼いていた。|' +
    'それで終わりではなかった。休む間もなく体を返され、{a}はまた奥まで暴かれた。|' +
    '何度果てても、終わりは来なかった。{a}は途中から、自分の声さえ遠くに聞いていた。|' +
    '{a}がぐったりと動かなくなっても、それはしばらく{a}を離さなかった。最後の波が引いたのは、明け方近くだった。');
  var AGAIN_TOP = L('一度では収まらず、{a}はもう一度、相手を求めた。|{a}は息を整えると、また相手を組み敷いた。夜は、まだ長かった。|' +
    '相手がぐったりと崩れても、{a}の熱はまだ収まらなかった。{a}は相手の体を返し、もう一度最初から責め直した。|' +
    '{a}は乱れた息のまま、相手の顎を指で持ち上げた。「まだ終わってない」――二度目は、一度目よりずっと長かった。|' +
    '一度果てても、{a}は相手を逃がさなかった。夜が白むまで、{a}は何度も相手を自分の下で鳴かせた。|' +
    '{a}は水を一口含むと、また相手の上に覆いかぶさった。相手が許しを乞う声も、二度目の熱にかき消された。|' +
    '夜明け前、相手はとうとう声も出せなくなっていた。それでも{a}は、最後にもう一度だけ相手を求めた。|' +
    '{a}は果てたあとも、相手の弱いところを指で弄び続けた。相手が泣くように達するのを見届けて、{a}はようやく手を止めた。');
  /* 山場：交わりの部品を使った場面か、R18の場面の札 */
  var TAGS = { '夜': 1, '夢': 1, '夜這い': 1, '洞窟': 1, '清めの湯': 1, '媚薬の夜': 1, '蛇の夢': 1, '蛇の夜': 1, 'チョー・チョー人の夜': 1, '収穫祭の夜': 1, '凌辱': 1, 'ハメ撮り': 1, '憑依': 1, '大浴場': 1, '凍える夜': 1, '儀式': 1, '生贄': 1 };
  function isSex(S, o) { return S._r18N === (S.log || []).length || !!TAGS[o.tag]; }

  function who(S, a) { return typeof a === 'number' ? S.P[a] : a; }
  var sayEv = ST.say;
  ST.say = function (S, o) {
    /* R18に参加しない人（キャラの設定）が出る山場には、文を足さない */
    var noR = o && (o.actors || []).some(function (a) { var p = who(S, a); return p && HK.State && !HK.State.r18ok(p); });
    if (o && !noR && o.kind === 'climax' && typeof o.text === 'string' && on(S) && X.lv(S.env) !== 'low' && isSex(S, o) && !forced(S, o)) {
      var acts = (o.actors || []).map(function (a) { return who(S, a); }).filter(Boolean), sep = /\n\n/.test(o.text) ? '\n\n' : '';
      var er = X.ero(S.env), hi = X.high(S.env), add = [];
      if (acts.length === 1) {
        var a = acts[0], top = !!(HK.Pos && HK.Pos.hardTopNpc && HK.Pos.hardTopNpc(a)), d = a.eroDom;
        a.eroDom = top;
        /* 一人が受ける場面は合意のない場面なので、男性向けの文は足さない（濃いは、ぼかした一文だけ） */
        /* 受ける側の一人の場面（村人・神・生贄の儀式など）は、内容のスイッチ「合意のない展開」が入で、モブとの場面に出てよい人のときだけ「濃い」の一文を足す */
        /* 一人の場面の相手は村人・神・眷属（モブ）。内容のスイッチ「合意のない展開」が入で、モブとの場面に出てよい人のときだけ文を足す（攻めが主導する場面も同じ） */
        var recvOk = (!HK.Content || HK.Content.ok(S, 'force')) && !(HK.State && !HK.State.mobSexOk(a));
        if (er && top && recvOk) add.push(E.fill(S, pick(S, HK.Pos && HK.Pos.isF && HK.Pos.isF(a) ? SOLO_TOP_F : SOLO_TOP), a));
        if (hi && recvOk) add.push(top ? pick(S, AGAIN_TOP) : pick(S, AGAIN_SOLO));
        a.eroDom = d;
        add = add.map(function (t) { return ST.fmt(t, { a: a.name }); });
      } else if (acts.length >= 2) {
        var od = HK.Pos ? HK.Pos.order(acts[0], acts[1], [acts[0], acts[1]]) : acts, x = od[0], y = od[1];
        var pk = function (l) { return pick(S, l); };
        /* 攻めの台詞（ero-top-lines-r18.js）：受けだけが喘ぎ続けないように、最中の一言を半分ほど添える（元の山場に攻めの台詞がなければ） */
        var tl = HK.EroTop && !new RegExp(x.name + '「').test(o.text) && S.rng() < 0.6 ? HK.EroTop.say(S, x, y, 'mid', { kind: HK.Pos && HK.Pos.isF(x) ? (HK.Pos.isF(y) ? 'ff' : 'fm') : 'm' }) : '';
        if (er && !/♡/.test(o.text)) add.push(tl + TE.fill(S, pk(PAIR), x, y).replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name));
        if (hi && S._r18A !== (S.log || []).length) add.push(TE.again(S, pk, x, y, er, !sep).replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name));
      }
      if (add.length) o.text = o.text + sep + add.join(sep);
    }
    return sayEv.apply(this, arguments);
  };
})();
