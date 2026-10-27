/* 箱庭診断: 全員に降りかかる出来事（バトルロワイヤル。全年齢版だけの箱庭。R18版では読まない）
   2026-10-27（分割読み込みの第3段）：incidents-survival.js から分けた（全年齢版は箱庭のかたまり scen-br。incidents-survival.js のすぐ後に読む） */
(function () {
  'use strict';
  var HK = window.HK;
  HK.INCIDENTS = HK.INCIDENTS || {};
  function R(ctx, a, b) { return ctx.R(a, b); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  function hurt(ctx, c, v, how) { c.hp -= v; if (c.hp <= 0 && c.alive) ctx.kill(c, null, how); }
  function without(list, x) { return list.filter(function (c) { return x.indexOf ? x.indexOf(c) < 0 : c !== x; }); }
  function fav(ctx, a, pool) {
    var best = null, bv = 25;
    pool.forEach(function (o) { if (o === a) return; var r = R(ctx, a, o), v = r.aff * 0.6 + r.att; if (v > bv) { bv = v; best = o; } });
    return best;
  }

  /* ======================= 無人島 ======================= */
  /* ======================= バトルロワイヤル（主催者のゲーム） ======================= */
  HK.INCIDENTS.br = [
    {
      id: 'vote', min: 3, from: 2,
      w: function () { return 1.2; },
      run: function (ctx) {
        var P = ctx.present(), votes = {}, ballots = [];
        ctx.incident('放送：「特別ゲーム。生存者全員で投票し、最多票の一名を処刑する。白票は本人の首輪を作動させる」');
        P.forEach(function (a) {
          var pick = ctx.most(ctx.others(a), function (o) { var r = R(ctx, a, o); return r.ten - r.aff * 0.6 - r.trust * 0.3 + (a.flags.revenge === o.i ? 60 : 0); });
          votes[pick.i] = (votes[pick.i] || 0) + 1;
          ballots.push({ a: a, b: pick });
        });
        var top = ctx.most(P, function (c) { return (votes[c.i] || 0) * 10; });
        var max = votes[top.i];
        var tied = P.filter(function (c) { return votes[c.i] === max; });
        if (ballots.length <= 8) ctx.say({ text: '開票：' + ballots.map(function (x) { return x.a.name + '→' + x.b.name; }).join('、') });
        else ctx.say({ text: '開票：' + P.filter(function (c) { return votes[c.i]; }).sort(function (x, y) { return votes[y.i] - votes[x.i]; }).slice(0, 5).map(function (c) { return c.name + ' ' + votes[c.i] + '票'; }).join('、') + (P.length > 5 ? 'ほか' : '') });
        var shown = 0;
        ballots.forEach(function (x) {
          var r = R(ctx, x.a, x.b);
          if (r.aff > 20 && shown++ < 6) ctx.act2({ actors: [x.a, x.b], cat: 'betray', odd: true, fx: function () { ctx.mod(x.b, x.a, { trust: -30, ten: 25, aff: -15 }); },
            text: ctx.t('{a}は、好意を持っていたはずの{b}の名前を書いていた。', x.a, x.b), why: '生き残るための計算。' + x.a.name + 'の' + (x.a.tr.cold > 0.55 ? 'ドライさ' : '恐怖') });
          else ctx.act2({ actors: [x.a, x.b], cat: 'conflict', fx: function () { ctx.mod(x.b, x.a, { ten: 10, trust: -8 }); }, text: '', why: '' });
        });
        if (tied.length > 1) {
          ctx.say({ text: '同票。' + names(tied) + 'の首輪から電流が流れた。' });
          tied.forEach(function (c) { hurt(ctx, c, 28, '投票ゲームの電流で'); });
        } else {
          ctx.kill(top, null, '投票ゲームで処刑された（' + max + '票）');
          P.forEach(function (o) {
            if (o === top || !o.alive || R(ctx, o, top).aff < 35) return;
            ballots.forEach(function (x) { if (x.b === top && x.a !== o) { ctx.k = 1; ctx.mod(o, x.a, { ten: 20, aff: -12 }); o.flags.revenge = x.a.i; } });
          });
        }
      }
    },
    {
      id: 'dilemma', min: 2,
      run: function (ctx) {
        var P = ctx.present(), rng = ctx.rng;
        var a = rng.pick(P), b = ctx.most(ctx.others(a), function (o) { return Math.abs(R(ctx, a, o).aff) + R(ctx, a, o).ten; });
        ctx.incident('放送：「' + a.name + 'と' + b.name + 'は別々の部屋へ。『信じる』か『裏切る』か、ボタンを一つ押せ」');
        function choose(x, y) { var r = R(ctx, x, y); return r.trust + x.tr.np * 40 - x.tr.cold * 30 - (x.goal.id === 'last' ? 25 : 0) + rng() * 30 * (0.5 + ctx.chaos) > 25; }
        var ca = choose(a, b), cb = choose(b, a);
        var txt, why;
        if (ca && cb) {
          txt = '二人とも『信じる』を押した。扉が開き、二人分の水と食料が置かれていた。';
          ctx.act2({ actors: [a, b], cat: 'bond', mag: 15, fx: function () { a.hp = Math.min(100, a.hp + 15); b.hp = Math.min(100, b.hp + 15); ctx.mod2(a, b, { trust: 25, aff: 10 }, { trust: 25, aff: 10 }); }, text: txt, why: '互いの信頼（' + Math.round(R(ctx, a, b).trust) + '／' + Math.round(R(ctx, b, a).trust) + '）' });
        } else if (!ca && !cb) {
          ctx.act2({ actors: [a, b], cat: 'betray', fx: function () { hurt(ctx, a, 30, '信頼ゲームの罰で'); hurt(ctx, b, 30, '信頼ゲームの罰で'); ctx.mod2(a, b, { ten: 15 }, { ten: 15 }); },
            text: '二人とも『裏切る』を押した。両方の首輪が鳴った。', why: '互いに相手を信じきれなかった' });
        } else {
          var tr = ca ? b : a, vi = ca ? a : b;
          ctx.act2({ actors: [tr, vi], cat: 'betray', mag: 20, fx: function () { tr.hp = Math.min(100, tr.hp + 20); hurt(ctx, vi, 40, tr.name + 'に裏切られた信頼ゲームで'); ctx.mod(vi, tr, { trust: -60, ten: 40, aff: -25 }); vi.flags.revenge = tr.i; },
            text: ctx.t('{a}は『裏切る』を、{b}は『信じる』を押した。', tr, vi), why: tr.name + 'のドライさ（' + Math.round(tr.tr.cold * 100) + '）／' + vi.name + 'の' + (vi.tr.np > 0.55 ? 'NP' : '信頼') });
        }
      }
    },
    {
      id: 'roulette', min: 2, from: 3,
      run: function (ctx) {
        var P = ctx.rng.shuffle(ctx.present()).slice(0, 4), rng = ctx.rng;
        ctx.incident('放送：「' + names(P) + 'は体育館へ。弾は一発、六つの穴。順番に引き金を引け」');
        var first = ctx.most(P, function (c) { return c.tr.cp * 0.5 + c.tr.fc * 0.5 + c.tr.cold * 0.3; });
        ctx.act2({ actors: [first], cat: 'solo', text: ctx.t('最初に銃を取ったのは{a}だった。', first), why: first.name + 'の' + (first.tr.cp > first.tr.fc ? 'CP（自分で決めたい）' : 'FC（どうせなら先に）') });
        var order = [first].concat(P.filter(function (c) { return c !== first; }));
        var left = 6;
        for (var t = 0; t < 8; t++) {
          var cur = order[t % order.length];
          if (!cur.alive) continue;
          var sub = ctx.most(P.filter(function (o) { return o !== cur && o.alive; }), function (o) { return R(ctx, o, cur).aff / 100 + o.tr.np * 0.5; });
          var shooter = cur;
          if (sub && R(ctx, sub, cur).aff > 45 && sub.tr.np > 0.55 && rng() < 0.6) {
            shooter = sub;
            ctx.act2({ actors: [sub, cur], cat: 'help', mag: 20, fx: function () { ctx.mod2(sub, cur, { aff: 5 }, { aff: 20, trust: 20, att: 10 }); },
              text: ctx.t('{b}の番で、{a}が銃を奪った。「代わる｜代わろう｜代わります」', sub, cur), why: sub.name + 'のNPと' + cur.name + 'への好意（' + Math.round(R(ctx, sub, cur).aff) + '）' });
          }
          if (rng() < 1 / left) { ctx.kill(shooter, null, 'ロシアンルーレットの' + (7 - left) + '発目で'); break; }
          left--;
          ctx.say({ text: shooter.name + '、空砲。' });
          if (left <= 1) break;
        }
        P.forEach(function (c) { if (c.alive) c.stress = HK.clamp(c.stress + 18, 0, 100); });
      }
    },
    {
      id: 'confession', min: 2, from: 1,
      run: function (ctx) {
        var P = ctx.present(), picks = {};
        if (P.length > 10) P = ctx.rng.shuffle(P).slice(0, 10);
        ctx.incident('放送：「紙に一番大切な人の名前を書け。両想いだった二人には、救急箱と食料を与える」');
        P.forEach(function (a) { picks[a.i] = fav(ctx, a, ctx.others(a)); });
        var done = {};
        P.forEach(function (a) {
          var b = picks[a.i];
          if (!b) { ctx.act2({ actors: [a], cat: 'solo', text: ctx.t('{a}の紙は白紙だった。', a), why: a.name + 'に、名前を書くほどの相手がいなかった' }); return; }
          if (done[a.i]) return;
          if (picks[b.i] === a) {
            done[a.i] = done[b.i] = 1;
            ctx.pair(a, b).confessed[a.i] = ctx.pair(a, b).confessed[b.i] = true;
            ctx.act2({ actors: [a, b], cat: 'romance', mag: 25, fx: function () { a.hp = Math.min(100, a.hp + 20); b.hp = Math.min(100, b.hp + 20); ctx.mod2(a, b, { att: 14, aff: 10, trust: 12 }, { att: 14, aff: 10, trust: 12 }); },
              text: ctx.t('{a}と{b}の名前が並んで読み上げられた。互いの名前を書いていた。', a, b), why: '両想い（惹かれ ' + Math.round(R(ctx, a, b).att) + '／' + Math.round(R(ctx, b, a).att) + '）' });
          } else {
            var c = picks[b.i];
            ctx.act2({ actors: [a, b], cat: 'romance', fx: function () { ctx.mod(b, a, { att: b.tr.np > 0.5 ? 6 : 2, ten: b.tr.cold > 0.6 ? 4 : 0 }); ctx.stress(a, 12); if (c) { ctx.mod(a, c, { ten: 12 }); ctx.pair(a, c).jealous++; } },
              text: ctx.t('{a}は{b}の名前を書いた。' + (c ? '{b}が書いたのは{c}だった。' : '{b}の紙は白紙だった。'), a, b, c), why: '一方通行の想いが、全員の前で明かされた' });
          }
        });
      }
    },
    {
      id: 'crate', min: 2,
      run: function (ctx) {
        var P = ctx.present();
        ctx.incident('放送：「分校の屋上に救急箱を一つ置いた。一人分だ」');
        var claim = ctx.most(P, function (c) { return c.tr.aggr * 0.6 + c.tr.cold * 0.4 + (100 - c.hp) / 200; });
        var rival = ctx.most(ctx.others(claim), function (o) { return o.tr.aggr + (100 - o.hp) / 150; });
        var giver = ctx.most(P, function (c) { return c.tr.np - c.tr.cold * 0.5; });
        if (giver && giver.tr.np > 0.65 && giver !== claim) {
          var weak = P.slice().sort(function (x, y) { return x.hp - y.hp; })[0];
          if (weak !== giver) {
            ctx.act2({ actors: [giver, weak], cat: 'help', mag: 15, fx: function () { weak.hp = Math.min(100, weak.hp + 35); ctx.mod2(giver, weak, { aff: 5 }, { aff: 18, trust: 18 }); },
              text: ctx.t('救急箱を手にした{a}は、それを自分には使わず{b}に投げ渡した。', giver, weak), why: giver.name + 'のNP（' + Math.round(giver.eg.NP) + '）' });
            return;
          }
        }
        if (rival && rival.tr.aggr > 0.5) {
          var r = ctx.fight(claim, rival, { lethality: 0.6 });
          ctx.act2({ actors: [claim, rival], cat: 'combat', fx: function () { if (r.winner) r.winner.hp = Math.min(100, r.winner.hp + 30); },
            text: ctx.t('屋上で{a}と{b}が鉢合わせた。', claim, rival) + r.text, why: '物資の奪い合い。' + (r.why || '') });
        } else {
          ctx.act2({ actors: [claim], cat: 'solo', fx: function () { claim.hp = Math.min(100, claim.hp + 30); ctx.others(claim).forEach(function (o) { ctx.mod(o, claim, { ten: 4 }); }); },
            text: ctx.t('救急箱は{a}が持ち去った。', claim), why: claim.name + 'の攻撃性・ドライさ' });
        }
      }
    },
    {
      id: 'hostage', min: 3, from: 2,
      run: function (ctx) {
        var P = ctx.present(), rng = ctx.rng;
        var v = rng.pick(P);
        ctx.incident('放送：「' + v.name + 'を灯台に拘束した。日没までに誰も来なければ首輪を作動させる」');
        var res = ctx.most(ctx.others(v), function (o) { return Math.max(0, R(ctx, o, v).aff) / 60 + o.tr.np * 0.5 + (o.focus === v ? 1 : 0) - o.tr.caution * 0.3; });
        var score = Math.max(0, R(ctx, res, v).aff) / 60 + res.tr.np * 0.5 + (res.focus === v ? 1 : 0) - res.tr.caution * 0.3;
        if (score > 0.55) {
          ctx.act2({ actors: [res, v], cat: 'help', mag: 25, fx: function () { hurt(ctx, res, 20, v.name + 'を助けに灯台へ向かって'); ctx.mod2(res, v, { aff: 6 }, { aff: 22, trust: 25, att: 10 }); },
            text: ctx.t('日没の十分前、灯台の扉を蹴破ったのは{a}だった。', res, v), why: res.name + 'の' + (res.focus === v ? '目標（' + v.name + 'を守る）' : 'NPと' + v.name + 'への好意') });
        } else {
          ctx.kill(v, null, '灯台で、誰にも助けられないまま');
          ctx.others(v).forEach(function (o) { if (o.alive && R(ctx, o, v).aff > 35) ctx.act2({ actors: [o, v], cat: 'solo', fx: function () { ctx.stress(o, 25); }, text: ctx.t('{a}は灯台の方角を見ないようにしていた。', o, v), why: o.name + 'の慎重さが、' + v.name + 'への好意（' + Math.round(R(ctx, o, v).aff) + '）に勝った' }); });
        }
      }
    },
    {
      id: 'dinner', min: 3,
      run: function (ctx) {
        var P = ctx.present(), rng = ctx.rng;
        ctx.incident('放送：「食堂に人数分の食事を用意した。一皿だけ、毒が入っている」');
        var taster = ctx.most(P, function (c) { return c.tr.np * 0.6 + c.tr.fc * 0.3 + (c.goal.id === 'save' ? 0.5 : 0); });
        var forcer = ctx.most(P, function (c) { return c.tr.cp * (1 - c.tr.np); });
        var meek = ctx.most(ctx.others(forcer), function (o) { return o.tr.ac; });
        var tasterUsed = taster;
        if (forcer.tr.cp > 0.7 && forcer.tr.np < 0.4 && meek && meek.tr.ac > 0.6) {
          tasterUsed = meek;
          ctx.act2({ actors: [forcer, meek], cat: 'conflict', fx: function () { ctx.mod(meek, forcer, { ten: 20, trust: -15 }); },
            text: ctx.t('「あなたが先に食べなよ｜あなたが先に食え｜あなたが先に食べてください」{a}は{b}の前に皿を押しやった。{b}は逆らわなかった。', forcer, meek), why: forcer.name + 'のCP高・NP低／' + meek.name + 'のAC（' + Math.round(meek.eg.AC) + '）' });
        } else {
          ctx.act2({ actors: [taster], cat: 'help', fx: function () { ctx.others(taster).forEach(function (o) { ctx.mod(o, taster, { trust: 6, aff: 4 }); }); },
            text: ctx.t('「毒見なら私がやる｜＝｜毒見なら私がやります」{a}が真っ先にスプーンを取った。', taster), why: taster.name + 'のNP・FC' });
        }
        var poisoned = rng.pick(P);
        var nose = ctx.most(ctx.others(poisoned), function (o) { return o.tr.a; });
        if (nose && rng() < nose.tr.a * 0.55) {
          ctx.act2({ actors: [nose, poisoned], cat: 'help', mag: 15, fx: function () { ctx.mod(poisoned, nose, { trust: 18, aff: 10 }); },
            text: ctx.t('{b}が口をつける直前、{a}がその皿を払い落とした。「匂いが違う｜＝｜匂いが違います」', nose, poisoned), why: nose.name + 'のA（' + Math.round(nose.eg.A) + '）：観察力' });
        } else {
          ctx.act2({ actors: [poisoned], cat: 'solo', fx: function () { hurt(ctx, poisoned, poisoned === tasterUsed ? 55 : 45, '毒入りの皿を引いて'); }, text: ctx.t('毒の皿を引いたのは{a}だった。', poisoned), why: '偶然' });
        }
      }
    },
    {
      id: 'zone', from: 2,
      run: function (ctx) {
        var P = ctx.present();
        if (P.length < 2) return;
        var a = ctx.rng.pick(P);
        var b = ctx.most(ctx.others(a), function (o) { return R(ctx, a, o).ten + R(ctx, a, o).att; });
        ctx.incident('放送：「' + a.name + 'の潜伏地点を禁止エリアに指定する」');
        var r = R(ctx, a, b);
        if (r.ten > 35 && a.tr.aggr > 0.45) {
          var f = ctx.fight(a, b);
          ctx.act2({ actors: [a, b], cat: 'combat', text: ctx.t('追い出された{a}は、逃げた先で{b}と出くわした。', a, b) + f.text, why: '強制移動。積もった緊張（' + Math.round(r.ten) + '）。' + f.why });
        } else {
          ctx.act2({ actors: [a, b], cat: r.att > 30 ? 'romance' : 'bond', fx: function () { ctx.mod2(a, b, { trust: 8, att: 4 }, { trust: 6, att: 4 }); },
            text: ctx.t('追い出された{a}は、逃げた先で{b}と出くわした。{b}は黙って、隠れ家の奥を空けた。', a, b), why: b.name + 'の側に敵意がなかった' });
        }
      }
    }
  ];
})();
