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
  function pick(S, a) { return ST.pick(S, a); }

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

  /* 自分で攻めを選んだ人：相手を責め立てる側 */
  var SOLO_TOP = L('{a}「{m1}」――{a}は相手の弱いところを探り当て、ぐちゅぐちゅと音を立てて責め続けた。{s:wet}。相手が果てても、{a}はしばらく手を緩めなかった。|{a}は相手を押さえつけ、自分の好きな速さで腰を使った。{s:hit}。{a}「{m2}」――最後は相手の奥に、たっぷりと吐き出した。');
  /* 二人の場面（{b}＝受け）で、まだ男性向けの文がないとき */
  var PAIR = L('{s:wet}。{b}「{mb1}」――絡み合うたびに、いやらしい音が部屋に響いた。{b}「{mb2}」――{b}はびくびくと震えながら、{a}にしがみついてイった。|{a}は{b}の一番弱いところを見つけると、そこばかりを執拗に責め立てた。{s:hit}。{b}「{mb2}」');
  /* 一人の場面の「濃い」 */
  var AGAIN_SOLO = L('それは一度では終わらなかった。夜が白むまで、{a}は何度も同じことを繰り返された。|一度果てたあとも、解放はされなかった。二度目は、一度目よりずっと長かった。|息が整う間もなく、また手が伸びてきた。{a}が解放されたのは、空が明るくなりはじめてからだった。');
  var AGAIN_TOP = L('一度では収まらず、{a}はもう一度、相手を求めた。|{a}は息を整えると、また相手を組み敷いた。夜は、まだ長かった。');
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
        var recvOk = top || ((!HK.Content || HK.Content.ok(S, 'force')) && !(HK.State && !HK.State.mobSexOk(a)));
        if (er && top) add.push(E.fill(S, pick(S, SOLO_TOP), a));
        if (hi && recvOk) add.push(top ? pick(S, AGAIN_TOP) : pick(S, AGAIN_SOLO));
        a.eroDom = d;
        add = add.map(function (t) { return ST.fmt(t, { a: a.name }); });
      } else if (acts.length >= 2) {
        var od = HK.Pos ? HK.Pos.order(acts[0], acts[1], [acts[0], acts[1]]) : acts, x = od[0], y = od[1];
        var pk = function (l) { return pick(S, l); };
        if (er && !/♡/.test(o.text)) add.push(TE.fill(S, pk(PAIR), x, y).replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name));
        if (hi && S._r18A !== (S.log || []).length) add.push(TE.again(S, pk, x, y, er, !sep).replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name));
      }
      if (add.length) o.text = o.text + sep + add.join(sep);
    }
    return sayEv.apply(this, arguments);
  };
})();
