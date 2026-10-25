/* 箱庭シミュレーター: 邪神村RTA ― クライマックス（神の祠のある場所へ）と、神の顕現
   ・場所は洞窟だけでなく、地下祭壇・村長の家・鏡の先の異空間…と、神や運で変わる（jashin-place.js）
   ・その場所でも死の罠が待つ。村人が追ってくることもある。関係による出来事や、敵対勢力の乱入もある
   ・儀式を企む術者がいれば、生贄を揃えて別の神を呼び、対抗させる（成功率が上がる）。その場でばれることもある
   ・対抗策に失敗するか、刻限を過ぎると、神が顕現する。顕現した神は、村ごと一行を呑み込むことがある（全滅） */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, JS = HK.JASHIN, clamp = HK.clamp, M = JS && JS.MORE;
  if (!ST || !JS || !M) return;
  function fmtG(S, t) { return ST.fmt(t, { g: S.G.call, n: S.V }); }

  function climax(S, h) {
    var PL = JS.PLACE ? JS.PLACE.begin(S) : null;
    try { run(S, h, PL); } finally { if (JS.PLACE) JS.PLACE.end(S); }
  }
  function pl(S, PL, k, def) { return fmtG(S, ST.pick(S, PL && PL[k] ? PL[k] : def)); }
  function run(S, h, PL) {
    var C = JS.core, rng = S.rng, alive = JS.alive, skill = JS.skill;
    S.inCave = true;
    function inCave() { return S.P.filter(function (p) { return alive(p) && !p.bound; }); }
    var live = inCave(), taken = S.P.filter(function (p) { return p.alive && p.taken; }), bound = S.P.filter(function (p) { return alive(p) && p.bound; });
    ST.step(S, 'クライマックス　' + (PL ? PL.name : '洞窟') + 'へ　' + C.label(h + 1));
    S.P.forEach(function (p) { if (p.bound && p.boundUntil != null && alive(p)) { p.bound = false; p.boundUntil = null; } });
    live = inCave(); bound = S.P.filter(function (p) { return alive(p) && p.bound; });
    if (JS.REL) JS.REL.confess(S, live);
    ST.say(S, { kind: 'phase', text: '祭りの太鼓が鳴り始めた。' + C.names(live) + 'は、' + S.G.call + 'を封じるため、' + (PL ? PL.to : '祠のある洞窟') + 'へ向かった。' + pl(S, PL, 'in', M.CAVE_IN) + (bound.length ? C.names(bound) + 'は、縛られたまま民宿に残された。' : '') });
    if (JS.PLACE) { JS.PLACE.travel(S, inCave()); live = inCave(); if (!live.length) { if (!manifest(S, h + 1, 0.85)) C.flee(S, h + 2); return; } }
    var mid = pl(S, PL, 'mid', M.CAVE_MID);
    if (!(PL && PL.noChase) && S.hostile > 40 && rng() < 0.4 + S.hostile / 250) { mid += ST.pick(S, M.CAVE_CHASE); live.forEach(function (p) { p.m.fear = clamp(p.m.fear + 10, 0, 100); }); }
    ST.say(S, { kind: 'phase', text: mid });
    if (JS.R18 && JS.R18.on(S) && JS.R18.cave) JS.R18.cave(S, live);
    /* 洞窟の死の罠 */
    live.forEach(function (p) { if (alive(p) && !p.out && rng() < (PL ? 0.2 : 0.3)) C.trap(S, p, inCave(), !PL || PL.id === 'cave'); });
    /* その場所ならではの死の罠 */
    if (PL) JS.PLACE.hazard(S, inCave());
    live = inCave();
    if (!live.length) { if (!manifest(S, h + 1, 0.85)) C.flee(S, h + 2); return; }
    ST.say(S, { kind: 'phase', text: pl(S, PL, 'end', M.CAVE_END) });

    var bonus = 0;
    /* 関係による出来事・敵対勢力の乱入（jashin-place.js） */
    if (JS.PLACE) {
      bonus += JS.PLACE.rel(S, inCave());
      var ix = JS.PLACE.intrude(S, inCave(), h);
      if (ix && ix.done) return;
      if (ix) bonus += ix.bonus || 0;
      live = inCave();
      if (!live.length) { if (!manifest(S, h + 1, 0.85)) C.flee(S, h + 2); return; }
    }

    /* 儀式を企む術者：生贄を揃えて、別の神を呼ぶ */
    var mage = live.filter(function (p) { return p.plot; })[0];
    if (mage) {
      var ok = mage.plot.kills >= mage.plot.need;
      if (!ok) {
        var vs = live.filter(function (q) { return q !== mage; }).sort(function (a, b) { return a.stats.luck - b.stats.luck; });
        if (vs.length) {
          var v = vs[0];
          C.die(S, v, '儀式を企む' + mage.name + 'に生贄にされて', [ST.fmt(ST.pick(S, M.MAGE_PUSH), { a: mage.name, v: '{a}' })]);
          mage.plot.kills++;
          ok = !JS.detectMage(S, mage, true);
        }
      }
      if (ok && alive(mage) && !mage.bound) {
        var cg = mage.plot.god;
        bonus = 0.32;
        var o = ST.say(S, { actors: [mage], tag: '召喚', kind: 'climax', text: ST.fmt(ST.pick(S, M.MAGE_SUMMON), { a: mage.name, g: S.G.call }) + '――' + ST.fmt(cg.t, { g: S.G.call }) + ST.pick(S, JS.MAGE.X.CLASH), why: mage.name + 'は生贄 ' + mage.plot.kills + '人で条件を整え、' + cg.n + 'を呼んで' + S.G.call + 'に対抗させた（成功率 +32％）', mag: 48 });
        ST.key(S, o, mage.name + 'が' + cg.n + 'を召喚');
        if (rng() < 0.35) { mage.alive = false; mage.fate = '呼び出した神に連れ去られた（' + JS.hm(h + 1) + '）'; ST.say(S, { actors: [mage], tag: '代償', text: ST.fmt(ST.pick(S, M.MAGE_PRICE), { a: mage.name }), why: '別の神を呼んだ代償', mag: 30 }); }
      }
      live = inCave();
      if (!live.length) { if (!manifest(S, h + 1, 0.85)) C.flee(S, h + 2); return; }
    }

    /* 対抗策 */
    var rite = live.filter(function (p) { return !p.plot; }).sort(function (a, b) { return skill(b, 'rite') + skill(b, 'lore') - skill(a, 'rite') - skill(a, 'lore'); })[0] || live[0];
    if (JS.GOALX) bonus += JS.GOALX.hijackCave(S, live);
    if (JS.MAGE) { bonus += JS.MAGE.sabotage(S, live, rite); live = inCave(); if (!live.length) { if (!manifest(S, h + 1, 0.85)) C.flee(S, h + 2); return; } }
    /* 神ごとの場面（jashin-godev*.js）：対抗策の手順や担い手が変わることがある */
    var gx = JS.GODEV ? JS.GODEV.cave(S, live, rite) || {} : {};
    bonus += gx.bonus || 0; if (gx.rite && alive(gx.rite)) rite = gx.rite;
    live = inCave(); if (!live.length) { if (!manifest(S, h + 1, 0.85)) C.flee(S, h + 2); return; }
    if (!alive(rite) || rite.bound) rite = live[0];
    var avgA = live.reduce(function (s0, p) { return s0 + p.tr.a; }, 0) / live.length;
    var poss = live.filter(function (p) { return p.possessed; }).length;
    var chance = clamp(0.3 + skill(rite, 'rite') * 0.33 + live.length * 0.02 + avgA * 0.1 - S.fake * 0.14 - (S.partial ? 0.15 : 0) - poss * 0.1 + (S.sealBonus || 0) + bonus, 0.05, 0.92);
    chance = clamp(chance * HK.Dark.pick(S, 1, 1, 0.8), 0.05, 0.92);   /* 展開の重さ（mood-dial.js）：重いでは封印がしくじりやすい */
    var t = gx.t ? ST.fmt(gx.t, { a: rite.name }) : rite.name + 'が祠の前に進み出た。' + S.G.sol + '――';
    if (S.fake && rng() < 0.5) t += '途中で、誰かが記者の言葉を思い出して手を止めかけた。';
    var why = '成功率 ' + Math.round(chance * 100) + '％（' + rite.name + 'の儀式の力・人数' + live.length + (bonus - (gx.bonus || 0) > 0 ? '・呼び出した神の助け' : bonus - (gx.bonus || 0) < 0 ? '・術者のすり替え' : '') + (S.fake ? '・信じた偽情報 ' + S.fake : '') + (S.partial ? '・手がかり不足' : '') + (poss ? '・取り憑かれた仲間' : '') + (gx.why ? '・' + gx.why : '') + '）';
    if (rng() < chance) {
      S.result = 'sealed';
      var o2 = ST.say(S, { actors: live.concat(taken), tag: '封印', kind: 'climax', text: t + (gx.okT || '地の底から響いていた唸り声が、ふっと途絶えた。') + pl(S, PL, 'out', M.COLLAPSE), why: why + '――成功', mag: 50 });
      ST.key(S, o2, '封印に成功');
      live.forEach(function (p) { if (alive(p) && rng() < (0.06 - p.stats.luck * 0.005) * HK.Dark.f(S, 'kill')) C.die(S, p, '崩れる' + (PL ? PL.noun : '洞窟') + 'で', PL && PL.id !== 'cave' ? PL.die : M.COLLAPSE_DIE); });
      var minute = h + 1 + rng() * 1.5, outs = S.P.filter(function (p) { return p.alive && !p.out; });
      outs.forEach(function (p) { p.taken = false; p.out = true; p.esc = minute; p.fate = p.bound ? '縛られたまま連れ出された（' + JS.hm(minute) + '）' : '生還（' + JS.hm(minute) + '）'; });
      ST.say(S, { actors: outs, tag: '脱出', kind: 'climax', text: (taken.length ? '座敷牢から、' + C.names(taken) + 'が助け出された。' : '') + (bound.length ? '縛られた' + C.names(bound) + 'も、引きずるようにして連れ出した。' : '') + '霧が晴れ、山道の先に国道の明かりが見えた。一行は振り返らずに走った。', why: '生還 ' + outs.length + '人', mag: 40 });
      return;
    }
    ST.say(S, { actors: live, tag: '失敗', text: t + (gx.ngT || 'しかし、何かが足りなかった。'), why: why + '――失敗', mag: 40 });
    if (manifest(S, h + 1, 0.42 + S.P.length * 0.04)) return;
    var vic = taken[0] || live.slice().sort(function (a, b) { return a.stats.luck - b.stats.luck; })[0];
    if (vic && !HK.Dark.skip(S, 'kill')) C.sacrifice(S, vic, h + 1); else if (vic && vic.taken) { vic.taken = false; vic.out = true; vic.esc = h + 1; vic.fate = '逃げ延びた（' + JS.hm(h + 1) + '）'; ST.say(S, { actors: [vic], tag: '救出', text: '祭壇へ引き出される直前、' + vic.name + 'の縄がゆるんだ。' + vic.name + 'は松明の列の隙間をすり抜け、闇の中へ転がり出た。そのまま、山道を駆け下りた。', why: '見張りの隙を突いて逃れた（展開の重さ：穏やか）', mag: 30 }); }   /* 展開の重さ（mood-dial.js）：穏やかでは、生贄の座が空くこともある */
    C.flee(S, h + 2);
  }

  /* 神の顕現。村ごと呑み込んだら true */
  function manifest(S, h, pm) {
    var rng = S.rng, alive = JS.alive;
    S.manifested = true;
    var form = S.FX ? S.FX.form : '闇の奥から、名状しがたい何かが姿を現した。';
    var o = ST.say(S, { tag: '顕現', kind: 'climax', text: ST.pick(S, M.MANIFEST) + form, why: S.G.name + 'が顕現した', mag: 54 });
    ST.key(S, o, S.G.name + 'の顕現');
    /* 時を戻すアーティファクト（jashin-loop.js）：巻き戻るなら、ここで打ち切る */
    if (JS.LOOP && JS.LOOP.tryRewind(S, h)) return true;
    if (JS.MAGE) JS.MAGE.witness(S, h);
    if (JS.GODEV) { var mr = JS.GODEV.manifest(S, h, pm); if (mr != null) return mr; }
    if (S.counter) pm *= 0.35;
    var left = S.P.filter(function (p) { return p.alive && !p.out; });
    if (!left.length) return true;
    if (rng() < pm * HK.Dark.pick(S, 0.05, 1, 2)) {   /* 展開の重さ（mood-dial.js）：顕現した神が村ごと呑み込む */
      S.engulf = true;
      left.forEach(function (p) { p.alive = false; p.taken = false; p.fate = S.G.call + 'に呑み込まれた（' + JS.hm(h) + '）'; });
      var o2 = ST.say(S, { actors: left, tag: '全滅', kind: 'climax', text: fmtG(S, ST.pick(S, M.ENGULF)), why: '顕現した神が、村ごと呑み込んだ（' + Math.round(pm * 100) + '％）', mag: 56 });
      ST.key(S, o2, '村ごと呑み込まれた');
      return true;
    }
    ST.say(S, { kind: 'phase', text: fmtG(S, ST.pick(S, M.NO_ENGULF)) });
    return false;
  }
  JS.CAVE = { climax: climax, manifest: manifest };
})();
