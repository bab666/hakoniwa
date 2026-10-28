/* 箱庭シミュレーター: ゾンビの街 ― ゾンビに襲われて犯される（まれ）／恋人のショック
   ・普通のゾンビに襲われたとき、まれに犯される展開になる（襲われる人が「攻め」指定でないときだけ）
   ・その場の仲間しだいで、助け出される／巻き込まれる／逃げるしかない、に分かれる（仲間が多いほど助かりやすい）
   ・恋人がその場にいれば、恋人は強いショックを受ける（助けに入る力も強くなる）
   描写の文は R18 版の solo-zombie-love.js にある（Z.ZA_TEXT）。なければこの展開は起きない */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB;
  if (!Z || !Z.scen) return;
  function L(s) { return s.split('|'); }
  function fill(t, m) { return t.replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function alive(c) { return c && c.alive && !c.out; }

  /* v の恋人（except は除く。生きている人だけ）。Z.loversOf は全員。
     among（居合わせた人）を渡せば、恋人が二人以上いるとき、その場にいる恋人（いちばん好意の高い人）を先に（2026-10-27：住人欄のいちばん上の一人だけになっていたのを直す） */
  Z.loversOf = function (ctx, v, except) {
    return ctx.chars.filter(function (o) { return o !== v && o !== except && alive(o) && Z.isLover && Z.isLover(ctx, v, o); });
  };
  Z.loverOf = function (ctx, v, except, among) {
    var L = Z.loversOf(ctx, v, except);
    if (among && L.length > 1) { var h = L.filter(function (o) { return among.indexOf(o) >= 0; }); if (h.length) return h.length > 1 ? ctx.most(h, function (o) { return ctx.R(o, v).aff; }) : h[0]; }
    return L[0] || null;
  };
  var SHOCK = {
    here: L('{L}の絶叫が響いた。「{a}に触るな――っ！」|{L}は、恋人が目の前で汚されていくのを見ていた。膝が、言うことを聞かなかった。|{L}は{a}の名前を呼んだ。何度も。喉が裂けるほど。'),
    hereNs: L('{L}の絶叫が響いた。「{a}――っ！」|{L}は、恋人が目の前で引きずり倒されるのを見ていた。'),
    after: L('助け出されたあと、{a}は{L}に触れられるたびに体をこわばらせた。{L}は何も言わず、ただ一晩中、少し離れた場所に座っていた。|{L}は{a}を抱きしめた。{a}は、抱きしめ返せなかった。|{L}はその夜、誰もいない場所で壁を殴り続けた。拳から血が出ても、やめなかった。'),
    away: L('――そのころ{L}は、別の場所で{a}の帰りを待っていた。'),
    news: L('{L}が{a}の最期を知ったのは、ずっとあとのことだった。{L}は、その場に崩れ落ちた。|{L}は{a}の身に起きたことを、仲間の口から聞いた。最後まで聞くことは、できなかった。')
  };
  /* 恋人がいるときの一文と、ショック（zombie-cure からも呼ぶ） */
  Z.loverShock = function (ctx, v, L0, here, sexual) {
    if (!L0) return '';
    ctx.stress(L0, here ? 45 : 20); L0.flags.grief = v.i;
    ctx.mod(L0, v, { aff: 5 });
    return here ? fill(ctx.pick(sexual ? SHOCK.here : SHOCK.hereNs), { a: v.name, L: L0.name }) : '';
  };
  function loverNews(ctx, v, L0, here) {
    if (!L0 || here) return;
    Z.later(ctx, function () {
      if (!alive(L0)) return;
      ctx.stress(L0, 30);
      ctx.act2({ actors: [L0, v], cat: 'solo', text: fill(ctx.pick(SHOCK.news), { a: v.name, L: L0.name }), why: L0.name + 'は、恋人の' + v.name + 'を失った', mag: 34 });
    });
  }

  /* ゾンビに襲われ、犯される。z_trouble の「咬まれる」かわりに、まれに起きる。返り値は出来事の結果
     o（省略可。ゾンビの性欲の出来事 z_lust から）：live＝助かる見込みに足す値、sated＝一人きりのとき、咬まれずに群れが離れていく文（live の確率） */
  Z.zombieAssault = function (ctx, v, mates, A, o) {
    var rng = ctx.rng, X = Z.ZA_TEXT, lv = Z.loveLv(ctx) === 'high' ? 'high' : 'fade';
    var L0 = Z.loverOf(ctx, v, null, mates), here = L0 && mates.indexOf(L0) >= 0;
    var pow = mates.reduce(function (s0, x) { return s0 + (x.weapon ? x.weapon.pow : 0); }, 0);
    var brave = mates.reduce(function (s0, x) { return Math.max(s0, x.tr.np * 0.5 + x.tr.cp * 0.3 + x.tr.aggr * 0.3); }, 0);
    var save = Math.min(0.85, 0.1 + ctx.stat(v, 'luck') * 0.03 + mates.length * 0.17 + pow * 0.02 + brave * 0.2 + (here ? 0.15 : 0));
    if (o && o.live) save = Math.min(0.9, save + o.live);
    /* 少人数（mood-dial.js の HK.Dark.few）：助からない側を狭める（6人以上は前と同じ） */
    var fw = HK.Dark && HK.Dark.few ? HK.Dark.few(ctx) : 1;
    if (fw < 1) save = 1 - (1 - save) * fw;
    if (ctx.zb) ctx.zb.zaN = (ctx.zb.zaN || 0) + 1;
    var m = { a: v.name, area: A.name, m: mates.length ? Z.names(mates.slice(0, 2)) : '', L: L0 ? L0.name : '' };
    var t = X.body(ctx, v, mates, lv, L0) + Z.loverShock(ctx, v, L0, here, true);
    var why = A.name + 'で、ゾンビの群れに押し倒された（' + v.name + 'は攻め指定ではない）';
    var actors = [v].concat(mates);
    ctx.stress(v, 40);
    if (!mates.length) {
      if (o && o.sated && rng() < o.live) {
        v.hp = Math.max(1, v.hp - 15);
        return { with: actors, text: t + fill(ctx.pick(o.sated), m), why: why + '――一人きりだったが、群れは興味を失ったように離れていった（咬まれずに済んだ）', mag: 50 };
      }
      var crawl = 0.3 + ctx.stat(v, 'luck') * 0.03;
      if (rng() < (fw < 1 ? 1 - (1 - crawl) * fw : crawl)) {
        v.hp -= 30; Z.infect(ctx, v, null, true);
        loverNews(ctx, v, null, true);
        return { with: actors, text: t + fill(ctx.pick(X.crawl), m), why: why + '――一人きりで、どうにか這い出した。だが、咬まれていた', mag: 50 };
      }
      ctx.kill(v, null, 'ゾンビの群れに押し倒され、喰い殺された');
      Z.loversOf(ctx, v).forEach(function (o) { loverNews(ctx, v, o, false); });
      return { with: actors, text: t + fill(ctx.pick(lv === 'high' ? X.die : X.dieFade), m), why: why + '（その場に、誰もいなかった）', mag: 58 };
    }
    var r = rng();
    if (r < save) {
      var hero = here && rng() < 0.6 ? L0 : ctx.most(mates, function (x) { return x.tr.np * 0.5 + x.tr.cp * 0.3 + (x.weapon ? x.weapon.pow * 0.05 : 0); });
      v.hp -= 20; ctx.stress(v, 20);
      mates.forEach(function (x) { ctx.stress(x, 18); ctx.mod(v, x, { aff: 12, trust: 18 }); });
      var bitten = rng() < 0.35;
      if (bitten) Z.infect(ctx, v, null, true);
      var hm = { a: v.name, m: hero.name, w: hero.weapon ? hero.weapon.name : '素手', L: L0 ? L0.name : '' };
      return { with: actors, text: t + fill(ctx.pick(hero === L0 ? X.saveL : X.save), hm) + (bitten ? fill(ctx.pick(X.bitAfter), m) : '') + (L0 ? fill(ctx.pick(SHOCK.after), m) : ''), why: why + '――' + (hero === L0 ? '恋人の' : '') + hero.name + 'たちが助け出した（仲間 ' + mates.length + '人・助かる見込み ' + Math.round(save * 100) + '%）' + (bitten ? '。だが咬まれていた' : ''), mag: 54 };
    }
    if (r < save + (1 - save) * 0.4) {
      var vic = here && rng() < 0.5 ? L0 : ctx.most(mates, function (x) { return x.tr.np + x.tr.impulse * 0.5; });
      /* 庇い展開（R18版の ZA_TEXT.cover）：群れを引き剥がそうとして一緒に押し倒され、二人とも這い出す／助け出される → 事後。1回の箱庭で2回まで */
      var cv = X.cover ? X.cover(ctx, v, vic, mates, lv, t, why) : null;
      if (cv) return cv;
      /* 助けに入った人を押さえつけるのは、巻き込まれてよい人だけ（「攻め」指定・性行為の相手の固定・R18に参加しない人は、殴り倒して下がるが咬まれる） */
      var top = !!X.caughtTop && (X.inv ? !X.inv(vic) : !!(HK.Pos && HK.Pos.hardTopNpc(vic)));
      var t2 = t + fill(ctx.pick(top ? X.caughtTop : X.caught), { a: v.name, m: vic.name }) + fill(ctx.pick(lv === 'high' ? X.die : X.dieFade), m);
      ctx.kill(v, null, 'ゾンビの群れに押し倒され、仲間の前で喰い殺された');
      vic.hp -= 40 + rng.int(25); ctx.stress(vic, 40);
      if (vic.hp <= 0) ctx.kill(vic, null, v.name + 'を助けに入り、ゾンビの群れに喰われた');
      else Z.infect(ctx, vic, null, true);
      return { with: actors, text: t2, why: why + '――助けに入った' + vic.name + 'も巻き込まれた', mag: 60 };
    }
    mates.forEach(function (x) { ctx.stress(x, 30); x.flags.grief = v.i; var na = rng.pick(Z.adj(x.z.area)); x.z.area = na; x.z.path.push(na); });
    ctx.kill(v, null, 'ゾンビの群れに押し倒され、仲間の前で喰い殺された');
    return { with: actors, text: t + fill(ctx.pick(X.abandon), m) + fill(ctx.pick(lv === 'high' ? X.die : X.dieFade), m), why: why + '――仲間は、助けられなかった' + (here ? '（恋人の' + L0.name + 'の目の前で）' : ''), mag: 60 };
  };

  /* r18:begin */
  /* ゾンビの性欲（環境値 zlust。R18版の solo-zombie-raid.js が足す）：日常の遭遇で、群れに押し倒される（2026-10-27）。
     z_trouble の「咬まれる」かわりの分かれ（まれ）とは別に、性欲の高さに比例して起きる（0 なら起きない。50 で1回の箱庭に1〜2件、100 で2〜3件ほど）。
     起きるのは、内容のスイッチ「合意のない展開」が入・夜の描写が「描かない」でない・襲われる人が Z.Cover.inv（「攻め」指定・性行為の相手の固定・R18に参加しない人・モブとの場面に出ない人・性器なしの人以外）のとき。
     同じ人ばかりにならないよう、襲われた回数で重みを下げ、襲われてから6区切りは外す。群れが「襲うより先に欲を満たす」ので、ふだんの分かれより助かりやすい（live） */
  var LUST = {
    lead: L('{area}の路地で、{a}は腐臭に気づくのが遅れた。振り向いたときには、もう何本もの腕に服を掴まれていた。|{a}が{area}の物陰で息を整えていると、暗がりから呻き声の群れが這い寄ってきた。いつもの群れとは、どこか様子が違った。|{area}を抜ける途中、{a}は瓦礫に足を取られて転んだ。群れは、喰らいつくより先に、{a}の体にのしかかってきた。|{area}で、ゾンビたちは{a}を取り囲んだまま、なぜかすぐには咬みつかなかった。濁った目が、{a}の体を舐めるように見ていた。'),
    leadM: L('{area}で、群れが一行の列に割り込んできた。{m}が武器を構えるより早く、{a}だけが群れの中へ引きずり込まれた。|{area}の暗がりで、{a}は{m}から数歩だけ離れた。その数歩のあいだに、群れの腕が{a}の足首を掴んでいた。|{area}を走って抜ける途中、{a}が一人だけ遅れた。群れは、遅れた{a}に一斉に群がった。'),
    sated: L('――群れは、満ち足りたように動きを緩め、一体、また一体と{a}から離れていった。{a}は咬み跡のない自分の腕を、信じられない思いで見つめた。|――どれくらい経ったのか分からない。群れは興味を失ったように、呻き声を引きずって去っていった。{a}は這って物陰に転がり込み、朝まで震えていた。|――遠くでガラスの割れる音がした。群れは一斉にそちらへ顔を向け、{a}を置き去りにして流れていった。{a}は、どこも咬まれてはいなかった。')
  };
  function lustOf(ctx) { var v = ctx.env.zlust; return v == null || v === '' ? 50 : +v; }
  /* 関係のある二人（2026-10-28 担当JA。環境値 zpair「関係のある二人の遭遇」：off なし／on ふつう（既定。前と同じ）／many 多い。R18版の solo-zombie-raid.js が足す）
     ・Z.pairTie：a と b が恋人（夫婦・婚約・番・運命の番を含む）・体の関係の相手（セフレ・性行為の相手の固定）・相棒・親友・愛憎の組なら、その種類（なければ ''）
     ・Z.pairOk：その二人を「二人きりで襲われる」場面に出してよいか（恋愛対象・受け攻めが合う（HK.Pos.okSex・HK.canLove を両方向）・恋愛やR18にしない相手でない・血縁でない・二人ともR18に参加する）
     ・Z.pairAlone：a がいま関係のある相手と二人きりか（同じエリアに、その相手しかいない）。ok なら Z.pairOk も見る。相手を返す
     ・多い：ゾンビの性欲（z_lust）で二人きりの組が選ばれやすく（重み ×4）、関係のある二人は同じ場所から始まり、二人で見回りに出たところを襲われる場面（z_pair）も起きる。略奪者も二人きりの組を狙いやすい
     ・なし：二人きりの組は、ゾンビの性欲・略奪者の場面で襲われない */
  Z.pairLv = function (ctx) { var v = ctx.env.zpair; return v === 'off' ? 0 : v === 'many' ? 2 : 1; };
  Z.pairTie = function (ctx, a, b) {
    if (!a || !b || a === b) return '';
    var T = HK.Ties, has = function (k) { return !!(T && T.has && (T.has(ctx, a, b, k) || T.has(ctx, b, a, k))); };
    if ((Z.isLover && Z.isLover(ctx, a, b)) || has('spouse') || has('fiance') || has('mate') || has('fated')) return 'lover';
    if (has('fwb') || (a.sexLocks || []).indexOf(b.i) >= 0 || (b.sexLocks || []).indexOf(a.i) >= 0) return 'fixed';
    if (has('buddy')) return 'buddy';
    if (has('best')) return 'best';
    if (HK.LoveHate && HK.LoveHate.any && HK.LoveHate.any(ctx, a, b)) return 'lovehate';
    return '';
  };
  Z.PAIR_LBL = { lover: '恋人', fixed: '体の関係の相手', buddy: '相棒', best: '親友', lovehate: '愛憎の相手' };
  Z.pairOk = function (ctx, a, b) {
    var S = HK.State;
    return !!(HK.Pos && HK.Pos.okSex(a, b) && HK.canLove && HK.canLove(a, b) && HK.canLove(b, a)) && !(HK.ngPair && HK.ngPair(a, b)) && !ctx.pair(a, b).kin &&
      !(S && S.r18ok && !(S.r18ok(a) && S.r18ok(b)));
  };
  Z.pairAlone = function (ctx, a, ok) {
    if (!a || !a.z || a.z.alone) return null;
    var m = Z.here(ctx, a).filter(function (o) { return o.alive && !o.out; });
    return m.length === 1 && Z.pairTie(ctx, a, m[0]) && (!ok || Z.pairOk(ctx, a, m[0])) ? m[0] : null;
  };
  var FM = function () { return (HK.Pos && HK.Pos.FORCE_MARK) || '〔合意のない展開〕'; };
  var LUST_EV = {
    id: 'z_lust', cat: 'combat', scope: 'solo', dk: 'harm', noOdd: true,
    when: function (ctx, a) {
      return !!(Z.ZA_TEXT && Z.Cover && ctx.zb) && lustOf(ctx) > 0 && !a.out && !a.z.alone && ctx.zb.A[a.z.area].z > 8 && Z.loveLv(ctx) !== 'off' && (!HK.Content || HK.Content.ok(ctx, 'force')) &&
        Z.Cover.inv(a) && !(a.z.zaAt != null && ctx.stepIndex - a.z.zaAt < 6) && !(Z.pairLv(ctx) === 0 && Z.pairAlone(ctx, a));
    },
    w: function (ctx, a) { var A = ctx.zb.A[a.z.area]; return 0.8 * Math.pow(lustOf(ctx) / 50, 1.4) * (0.5 + A.z / 100) / (1 + (a.z.zaN || 0) * 1.5) * (Z.pairLv(ctx) === 2 && Z.pairAlone(ctx, a, true) ? 4 : 1); },
    run: function (ctx, a) {
      var A = ctx.zb.A[a.z.area], mates = Z.here(ctx, a).filter(function (o) { return o.alive && !o.out; });
      a.z.zaAt = ctx.stepIndex; a.z.zaN = (a.z.zaN || 0) + 1; a.z.zassault = true;
      a.flags.mobHit = { at: ctx.stepIndex, by: 'ゾンビ' };
      var t = fill(ctx.pick(mates.length ? LUST.leadM : LUST.lead), { a: a.name, area: A.name, m: mates.length ? Z.names(mates.slice(0, 2)) : '' });
      var ra = Z.zombieAssault(ctx, a, mates, A, { live: 0.25, sated: LUST.sated });
      var pt = mates.length === 1 ? Z.pairTie(ctx, a, mates[0]) : '';
      return { with: ra.with, text: t + ra.text, why: FM() + 'ゾンビの性欲（' + lustOf(ctx) + '）／' + (pt ? a.name + 'は' + Z.PAIR_LBL[pt] + 'の' + mates[0].name + 'と二人きりだった／' : '') + ra.why, mag: ra.mag, lewd: true };
    }
  };
  HK.addTo(Z.scen.events, LUST_EV);

  /* ゾンビの性欲が高いとき（70 以上）の保証（2026-10-28 担当JA）：ゾンビに性的に襲われる場面がまだ一度も起きていなければ、
     区切りの終わりに、起きてよい人（ゾンビの性欲と同じ条件＋性欲「なし」でない）から一人を選んで起こす
     （初日の夕方から区切りごとに 15%、残り3区切り 5割・残り2区切り 7割5分・最後の区切り 必ず。少人数では脱出や死で早く人がいなくなるので、序盤から少しずつ）。
     起きた数は Z.zombieAssault が数える（ctx.zb.zaN）。性欲が 70 未満なら何もしない（乱数も引かない） */
  var LUST_HIGH = 70;
  Z.LUST_HIGH = LUST_HIGH;
  function lustSure(ctx, s, n) {
    var zb = ctx.zb;
    if (!zb || zb.zaN || lustOf(ctx) < LUST_HIGH || s < Math.min(n - 3, 2) || !Z.ZA_TEXT || !Z.Cover || Z.loveLv(ctx) === 'off' || (HK.Content && !HK.Content.ok(ctx, 'force'))) return;
    var vs = ctx.present().filter(function (c) {
      return c.alive && !c.out && c.z && !c.z.alone && Z.Cover.inv(c) && !(HK.Pos && HK.Pos.libOf && HK.Pos.libOf(c) === 'none') && !(Z.pairLv(ctx) === 0 && Z.pairAlone(ctx, c));
    });
    if (!vs.length || ctx.rng() >= (s >= n - 1 ? 1 : s === n - 2 ? 0.75 : s === n - 3 ? 0.5 : 0.15)) return;
    var a = HK.weighted(ctx.rng, vs, function (c) { return (Z.pairLv(ctx) === 2 && Z.pairAlone(ctx, c, true) ? 3 : 1) / (1 + (c.z.zaN || 0)); });
    var r = LUST_EV.run(ctx, a);
    ctx.act2({ actors: r.with, cat: 'combat', text: r.text, why: r.why + '／ゾンビの性欲が高い（' + lustOf(ctx) + '）ので、箱庭の終わりまでに一度は起きる', mag: r.mag, lewd: true });
  }
  HK.wrap(Z.scen, 'after', function (orig) {
    return function (ctx, s, n) { if (ctx.zb) lustSure(ctx, s, n); return orig.apply(this, arguments); };
  });

  /* 関係のある二人の遭遇「多い」：二人で見回り・物資探しに出たところを、ゾンビの群れ（生きている略奪者がいれば、ときどき略奪者）に襲われる（z_pair）。
     一人が襲われ、もう一人は助けに入る・庇って一緒に押し倒される・見ているしかない（Z.zombieAssault・Z.raiderAssault の分かれ。仲間が一人なので助かりにくい）。
     襲われるのは Z.Cover.inv で性欲「なし」でない人（二人とも当てはまれば受け攻めの受けの側）。同じ二人は4区切り（1日）あける */
  var PAIR = {
    out: L('{a}と{b}は、二人だけで{area}の様子を見に出た。ほかの仲間には、すぐ戻ると言い残して。|{b}が「二人で行こう｜＝｜二人で行きましょう」と言い、{a}は頷いた。{area}の路地に入ったのは、{a}と{b}の二人だけだった。|物資の残りを確かめに、{a}と{b}は{area}へ向かった。二人きりになるのは、久しぶりだった。'),
    here: L('{area}で、{a}と{b}は息をひそめていた。この街で頼れるのは、もう互いだけだった。|{a}と{b}は、{area}の物陰で肩を寄せ合っていた。見張りを交代する相手は、互いしかいない。|{area}の静まり返った通りを、{a}と{b}は並んで歩いていた。互いの足音のほかには、何も聞こえなかった。')
  };
  function pairVictim(ctx, a, b) {
    var ok = function (c) { return c.alive && !c.out && Z.Cover.inv(c) && !(HK.Pos && HK.Pos.libOf && HK.Pos.libOf(c) === 'none') && !(c.z.zaAt != null && ctx.stepIndex - c.z.zaAt < 6); };
    var oa = ok(a), ob = ok(b);
    if (oa && ob) return HK.Pos && HK.Pos.order ? HK.Pos.order(a, b, [b, a])[1] : a;
    return oa ? a : ob ? b : null;
  }
  /* 多いなら、関係のある二人（恋愛対象・受け攻めが合う組）は同じ場所から始める（二人で行動している。乱数は引かない） */
  HK.wrap(Z.scen, 'setup', function (orig) {
    return function (ctx) {
      var r = orig.apply(this, arguments);
      if (ctx.zb && Z.pairLv(ctx) === 2) {
        var used = {};
        ctx.chars.forEach(function (a) {
          if (used[a.i] || !a.z) return;
          var b = ctx.chars.filter(function (o) { return o !== a && !used[o.i] && o.z && Z.pairTie(ctx, a, o) && Z.pairOk(ctx, a, o); })[0];
          if (!b) return;
          used[a.i] = used[b.i] = 1;
          b.z.area = b.z.start = a.z.area; b.z.path = [a.z.area];
        });
      }
      return r;
    };
  });
  HK.addTo(Z.scen.events, {
    id: 'z_pair', cat: 'combat', scope: 'pair', dk: 'harm', noOdd: true, r18: true,
    when: function (ctx, a, b) {
      if (!b || !ctx.zb || Z.pairLv(ctx) !== 2 || !Z.ZA_TEXT || !Z.Cover || Z.loveLv(ctx) === 'off' || (HK.Content && !HK.Content.ok(ctx, 'force'))) return false;
      if (a.out || b.out || !a.z || !b.z || a.z.alone || b.z.alone || a.z.area !== b.z.area || ctx.zb.A[a.z.area].z <= 8) return false;
      if (!Z.pairTie(ctx, a, b) || !Z.pairOk(ctx, a, b)) return false;
      var pf = ctx.pair(a, b);
      if (pf.zpairAt != null && ctx.stepIndex - pf.zpairAt < 4) return false;
      return !!pairVictim(ctx, a, b);
    },
    w: function (ctx, a, b) { var A = ctx.zb.A[a.z.area]; return 10 * (0.5 + A.z / 100) * (Z.part(ctx) >= 2 ? 1.3 : 1); },
    run: function (ctx, a, b) {
      var v = pairVictim(ctx, a, b), p = v === a ? b : a, A = ctx.zb.A[v.z.area], pt = Z.pairTie(ctx, a, b);
      var alone = Z.here(ctx, v).filter(function (o) { return o.alive && !o.out; }).length === 1;
      ctx.pair(a, b).zpairAt = ctx.stepIndex;
      var m = { a: v.name, b: p.name, area: A.name, m: p.name };
      var lead = fill(ctx.pick(alone ? PAIR.here : PAIR.out), m);
      var head = FM() + '関係のある二人の遭遇：多い（' + v.name + 'と' + p.name + 'は' + Z.PAIR_LBL[pt] + '。二人きりのところを襲われた）／';
      /* 生きている略奪者がいれば、ときどき略奪者に（solo-zombie-raid.js） */
      var lt = Z.raiderAssault && Z.raidOk && Z.raidOk(ctx) ? ctx.zb.npcs.filter(function (n) { return n.type === 'looter' && n.alive; })[0] : null;
      if (lt && ctx.rng() < 0.4) {
        lt.area = v.z.area; v.z.raidN = (v.z.raidN || 0) + 1;
        v.flags.mobHit = { at: ctx.stepIndex, by: lt.label || '略奪者' };
        var rr = Z.raiderAssault(ctx, v, [p], lt);
        return { with: rr.with, text: lead + rr.text, why: head + rr.why, mag: rr.mag, lewd: true };
      }
      v.z.zaAt = ctx.stepIndex; v.z.zaN = (v.z.zaN || 0) + 1; v.z.zassault = true;
      v.flags.mobHit = { at: ctx.stepIndex, by: 'ゾンビ' };
      var ra = Z.zombieAssault(ctx, v, [p], A, { live: 0.25, sated: LUST.sated });
      return { with: ra.with, text: lead + fill(ctx.pick(LUST.leadM), m) + ra.text, why: head + ra.why, mag: ra.mag, lewd: true };
    }
  });
  /* r18:end */
})();
