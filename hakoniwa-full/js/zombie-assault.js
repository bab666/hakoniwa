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

  /* v の恋人（except は除く。生きている人だけ） */
  Z.loverOf = function (ctx, v, except) {
    var hit = null;
    ctx.chars.forEach(function (o) { if (!hit && o !== v && o !== except && alive(o) && Z.isLover && Z.isLover(ctx, v, o)) hit = o; });
    return hit;
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

  /* ゾンビに襲われ、犯される。z_trouble の「咬まれる」かわりに、まれに起きる。返り値は出来事の結果 */
  Z.zombieAssault = function (ctx, v, mates, A) {
    var rng = ctx.rng, X = Z.ZA_TEXT, lv = ctx.env.zlewd === 'high' ? 'high' : 'fade';
    var L0 = Z.loverOf(ctx, v), here = L0 && mates.indexOf(L0) >= 0;
    var pow = mates.reduce(function (s0, x) { return s0 + (x.weapon ? x.weapon.pow : 0); }, 0);
    var brave = mates.reduce(function (s0, x) { return Math.max(s0, x.tr.np * 0.5 + x.tr.cp * 0.3 + x.tr.aggr * 0.3); }, 0);
    var save = Math.min(0.85, 0.1 + ctx.stat(v, 'luck') * 0.03 + mates.length * 0.17 + pow * 0.02 + brave * 0.2 + (here ? 0.15 : 0));
    var m = { a: v.name, area: A.name, m: mates.length ? Z.names(mates.slice(0, 2)) : '', L: L0 ? L0.name : '' };
    var t = X.body(ctx, v, mates, lv, L0) + Z.loverShock(ctx, v, L0, here, true);
    var why = A.name + 'で、ゾンビの群れに押し倒された（' + v.name + 'は攻め指定ではない）';
    var actors = [v].concat(mates);
    ctx.stress(v, 40);
    if (!mates.length) {
      if (rng() < 0.3 + ctx.stat(v, 'luck') * 0.03) {
        v.hp -= 30; Z.infect(ctx, v, null, true);
        loverNews(ctx, v, null, true);
        return { with: actors, text: t + fill(ctx.pick(X.crawl), m), why: why + '――一人きりで、どうにか這い出した。だが、咬まれていた', mag: 50 };
      }
      ctx.kill(v, null, 'ゾンビの群れに、犯されながら喰い殺された');
      loverNews(ctx, v, L0, false);
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
      var t2 = t + fill(ctx.pick(X.caught), { a: v.name, m: vic.name }) + fill(ctx.pick(lv === 'high' ? X.die : X.dieFade), m);
      ctx.kill(v, null, 'ゾンビの群れに、仲間の前で犯されながら喰い殺された');
      vic.hp -= 40 + rng.int(25); ctx.stress(vic, 40);
      if (vic.hp <= 0) ctx.kill(vic, null, v.name + 'を助けに入り、ゾンビの群れに喰われた');
      else Z.infect(ctx, vic, null, true);
      return { with: actors, text: t2, why: why + '――助けに入った' + vic.name + 'も巻き込まれた', mag: 60 };
    }
    mates.forEach(function (x) { ctx.stress(x, 30); x.flags.grief = v.i; var na = rng.pick(Z.adj(x.z.area)); x.z.area = na; x.z.path.push(na); });
    ctx.kill(v, null, 'ゾンビの群れに、仲間の前で犯されながら喰い殺された');
    return { with: actors, text: t + fill(ctx.pick(X.abandon), m) + fill(ctx.pick(lv === 'high' ? X.die : X.dieFade), m), why: why + '――仲間は、助けられなかった' + (here ? '（恋人の' + L0.name + 'の目の前で）' : ''), mag: 60 };
  };
})();
