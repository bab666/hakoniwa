/* 箱庭シミュレーター: ゾンビの街 ― 住人以外の生存者（NPC）
   軍人・宗教家・狂人・迷子の子・医者・略奪者・配信者・老人・咬まれた市民が、ランダムに街に現れる */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB;
  function L(s) { return s.split('|'); }
  var CHILD = { jp: L('ミウ|ソウタ|ハルト|ユイ|リク|コハル|メイ|タイチ'), us: L('リリー|ノア|エマ|ルーカス|ミア|オリバー|ゾーイ|ベン') };
  function nm(n) { return n.label; }
  /* {you}：住人から生存者（NPC）への呼びかけ（mob.js の HK.Mob.addr。台詞では話し手の二人称、全体の設定で「名前で」なら名前で） */
  function fillN(ctx, t, n, a, b) { if (HK.Mob) t = HK.Mob.you(t, n, n.type === 'child' ? 'ちゃん' : 'さん'); return ctx.t(t, a, b).replace(/\{n\}/g, n.label).replace(/\{area\}/g, Z.an(ctx, n.area)); }
  function luck(ctx, c) { return ctx.stat(c, 'luck'); }
  function power(c) { return (c.weapon ? c.weapon.pow : 0) * 5 + c.hp * 0.25 + c.tr.aggr * 12 + c.tr.a * 6; }

  Z.spawnNPC = function (ctx) {
    var zb = ctx.zb, rng = ctx.rng;
    if (ctx.stepIndex === 0) return;
    var live = zb.npcs.filter(function (n) { return n.alive; }).length;
    var rate = ctx.env.npc / 100 * 0.42 * (live >= 5 ? 0.3 : 1);
    if (rng() > rate) return;
    var occ = [];
    ctx.present().forEach(function (c) { if (occ.indexOf(c.z.area) < 0) occ.push(c.z.area); });
    var area = occ.length && rng() < 0.8 ? rng.pick(occ) : rng.int(9);
    var used = {};
    zb.npcs.forEach(function (n) { used[n.type] = (used[n.type] || 0) + 1; });
    var type = HK.weighted(rng, Object.keys(Z.NPC_TYPES), function (k) { return Z.NPC_TYPES[k].w / (1 + (used[k] || 0) * 1.5) * (k === 'soldier' ? 0.6 + Z.day(ctx) * 0.12 : 1); });
    var T = Z.NPC_TYPES[type], pool = type === 'child' ? CHILD[zb.reg] : Z.NPC_NAMES[zb.reg];
    var taken = zb.npcs.map(function (n) { return n.name; });
    var name = rng.pick(pool.filter(function (x) { return taken.indexOf(x) < 0; }).concat(pool.length ? [] : ['名無し'])) || rng.pick(pool);
    var n = { id: zb.npcs.length, type: type, name: name, label: T[zb.reg] + name, area: area, alive: true, with: null, at: ctx.stepIndex, met: false, turnAt: type === 'bitten' ? ctx.stepIndex + 2 + rng.int(4) : -1, cult: [], deserter: type === 'soldier' && rng() < 0.22, gun: zb.reg === 'us' && rng() < 0.6 };
    if (type === 'child') n.label = '迷子の' + (zb.reg === 'us' ? '' : '子・') + name;
    zb.npcs.push(n);
  };

  /* 指定の種類のNPCを、指定のエリアにすぐ出す（始まりの場面用） */
  Z.spawnNPCAt = function (ctx, type, area) {
    var zb = ctx.zb, rng = ctx.rng, T = Z.NPC_TYPES[type], pool = type === 'child' ? CHILD[zb.reg] : Z.NPC_NAMES[zb.reg];
    var name = rng.pick(pool);
    var n = { id: zb.npcs.length, type: type, name: name, label: T[zb.reg] + name, area: area, alive: true, with: null, at: 0, met: false, turnAt: -1, cult: [], deserter: false, gun: zb.reg === 'us' };
    if (type === 'child') n.label = '迷子の' + (zb.reg === 'us' ? '' : '子・') + name;
    zb.npcs.push(n);
    return n;
  };
  Z.npcStep = function (ctx) {
    var zb = ctx.zb, rng = ctx.rng;
    zb.npcs.forEach(function (n) {
      if (!n.alive) return;
      if (n.with != null) {
        var w = ctx.chars[n.with];
        if (w.alive && !w.out) n.area = w.z.area;
        else if (w.out && n.type === 'child') { n.out = true; n.alive = false; n.note = w.name + 'と一緒に街を出た'; return; }
        else { n.with = null; if (n.type === 'child') n.alone = true; }
      }
      /* 咬まれた市民の発症 */
      if (n.turnAt >= 0 && ctx.stepIndex >= n.turnAt) return npcTurns(ctx, n);
      var P = Z.inArea(ctx, n.area);
      if (!P.length) return;
      var fn = NPC[n.type];
      if (!n.met) { n.met = true; return fn.meet(ctx, n, P); }
      if (fn.again && (n.agains || 0) < 4 && rng() < (n.type === 'child' ? 0.22 : 0.15)) { n.agains = (n.agains || 0) + 1; fn.again(ctx, n, P); }
    });
  };

  function npcTurns(ctx, n) {
    var zb = ctx.zb, rng = ctx.rng;
    n.alive = false; n.turned = true; n.note = 'ゾンビになった';
    zb.stats.npcDead++;
    var P = Z.inArea(ctx, n.area);
    zb.A[n.area].z = Math.min(100, zb.A[n.area].z + 4);
    if (!P.length) return;
    var v = HK.weighted(rng, P, function (c) { return n.with === c.i ? 3 : 1; });
    var t = fillN(ctx, rng.pick(['夜中、{n}の包帯の下から、黒い血が滲み出した。{n}は起き上がり、いちばん近くで眠っていた{a}に覆いかぶさった。', '{n}は「大丈夫、ただの切り傷だ」と言っていた。その{n}が、白く濁った目で{a}の方を向いた。']), n, v);
    if (rng() < 0.5 - luck(ctx, v) * 0.05) { Z.infect(ctx, v, null, true); v.z.bitten.npc = n.label; t += ctx.t('{a}の腕に、歯形が残った。', v); }
    else t += ctx.t('{a}は寸前で身をかわし、{n}だったものの頭に' + (v.weapon ? v.weapon.name : '椅子') + 'を振り下ろした。', v).replace(/\{n\}/g, n.label);
    ctx.act2({ actors: P, cat: 'combat', text: t, why: n.label + 'は咬まれていたことを隠していた', mag: 30 });
  }

  var NPC = {
    /* --- 軍人 --- */
    soldier: {
      meet: function (ctx, n, P) {
        var zb = ctx.zb, rng = ctx.rng;
        var bit = P.filter(function (c) { return c.z.bitten && (c.z.aware || c.z.hiding); })[0];
        if (n.deserter) {
          var a = ctx.most(P, function (c) { return c.weapon ? c.weapon.pow : 0; });
          var resist = P.filter(function (c) { return c.tr.aggr > 0.6; })[0];
          if (resist && rng() < 0.45) {
            var win = power(resist) + rng() * 40 > 60 + rng() * 30;
            if (win) { n.alive = false; n.note = resist.name + 'に倒された'; zb.stats.npcDead++; resist.flags.npcKill = (resist.flags.npcKill || 0) + 1; return ctx.act2({ actors: P, cat: 'combat', text: fillN(ctx, '銃を突きつけて物資を奪おうとした脱走兵の{n}に、{a}が飛びかかった。もみ合いの末、銃声が一発。床に倒れていたのは{n}の方だった。', n, resist), why: n.label + 'は部隊を見捨てた脱走兵／' + resist.name + 'の攻撃性', mag: 32 }); }
            ctx.kill(resist, null, '脱走兵の' + n.label + 'に撃たれた');
            return ctx.act2({ actors: P, cat: 'combat', text: fillN(ctx, '脱走兵の{n}に、{a}が掴みかかった。銃声が響き、{a}が崩れ落ちた。{n}は食料を袋に詰めて、振り返らずに出ていった。', n, resist), why: n.label + 'は部隊を見捨てた脱走兵', mag: 40 });
          }
          P.forEach(function (c) { c.z.food = Math.max(0, c.z.food - 1); });
          if (a.weapon && a.weapon.gun) { a.weapon = Z.weapon(['素手', 0]); }
          return ctx.act2({ actors: P, cat: 'conflict', text: fillN(ctx, '{n}は部隊章を剥がした迷彩服を着ていた。「食い物と弾を置いていけ」――銃口を向けられて、' + Z.names(P) + 'は従うしかなかった。', n), why: n.label + 'は脱走兵だった', mag: 22 });
        }
        if (bit && rng() < (bit.z.hiding ? 0.55 : 0.95)) {
          var def = P.filter(function (c) { return c !== bit && ctx.R(c, bit).aff > 50 && c.tr.aggr + c.tr.np > 0.9; })[0];
          if (def && rng() < 0.5) {
            var ok = power(def) + rng() * 40 > 55 + rng() * 35;
            if (ok) { n.alive = false; n.note = def.name + 'に倒された'; zb.stats.npcDead++; ctx.pair(def, bit).defendedZ = def.i; return ctx.act2({ actors: [def, bit], cat: 'combat', fx: function () { ctx.mod(bit, def, { aff: 20, trust: 25 }); }, text: fillN(ctx, '{n}は{b}の咬み跡を見つけ、無言で銃を構えた。その腕に、{a}が体ごとぶつかった。――気がつくと、{a}の手には{n}の銃があり、{n}はもう動かなかった。', n, def, bit), why: def.name + 'の' + bit.name + 'への想い（好意 ' + Math.round(ctx.R(def, bit).aff) + '）が、軍人に向かわせた', mag: 45 }); }
            ctx.kill(def, null, '咬まれた' + bit.name + 'をかばって、' + n.label + 'に撃たれた');
          }
          ctx.act2({ actors: P, cat: 'death', text: fillN(ctx, '{n}は' + (bit.z.hiding ? '{a}の袖の下の咬み跡を見逃さなかった' : '{a}の咬み跡を見た') + '。「規則だ。悪く思うな」――乾いた銃声が一発だけ響いた。', n, bit), why: '軍人は咬まれた者を見逃さない' + (bit.z.hiding ? '（' + bit.name + 'は隠していた）' : ''), mag: 45 });
          ctx.kill(bit, null, n.label + 'に射殺された（咬まれていた）');
          return;
        }
        var heli = ctx.env.end === 'heli' && rng() < 0.7, t;
        if (heli) { P.forEach(function (c) { c.z.heliAt = zb.heli; c.z.know.heli = true; }); t = '{n}は無線を確かめてから言った。「最終日の朝、' + Z.an(ctx, zb.heli) + 'に救助ヘリが降りる。それまで生きていろ」'; }
        else if (zb.safe >= 0) { P.forEach(function (c) { c.z.safe = zb.safe; }); t = '{n}は地図を広げ、' + Z.an(ctx, zb.safe) + 'に丸をつけた。「今のところ、あそこはまだ持ちこたえている」'; }
        else t = '{n}は首を横に振った。「安全な場所なんて、もうない。俺の部隊も、昨日の夜に全滅した」';
        P.forEach(function (c) { c.z.know.bite = true; c.z.know.head = true; if (c.goal.id === 'escape') zb.escort = { area: n.area, until: ctx.stepIndex + 3 }; });
        ctx.act2({ actors: P, cat: 'help', text: fillN(ctx, rng.pick(['{area}で、迷彩服の{n}が銃を下ろした。', '{n}は瓦礫の陰から現れ、「民間人か」と短く訊いた。']) + t, n), why: n.label + 'は正確な情報を持っていた', mag: 22 });
      },
      again: function (ctx, n, P) {
        var rng = ctx.rng, c = rng.pick(P);
        ctx.act2({ actors: P, cat: 'help', fx: function () { c.z.food++; }, text: fillN(ctx, rng.pick(['{n}は{a}に、軍用の携行食を一袋渡した。「食え。倒れられると迷惑だ」', '{n}は夜通し見張りに立ち、{a}たちに数時間の眠りをくれた。']), n, c), why: n.label + 'の手助け' });
      }
    },
    /* --- 宗教家 --- */
    priest: {
      meet: function (ctx, n, P) {
        var rng = ctx.rng;
        var t = fillN(ctx, rng.pick(['{area}の広場で、{n}が瓦礫の上に立って叫んでいた。「これは審判だ！　咬まれた者は救われる、新しい体を授かるのだ！」', '{n}は、教会の扉を開けて{a}たちを招き入れた。蝋燭の火の向こうに、十数人の信者が並んでいた。', '{n}は穏やかな声で言った。「怖がらなくていい。終わりは、救いです」']), n, P[0]);
        var rec = P.filter(function (c) { return c.stress > 50 && c.tr.ac + (1 - c.tr.a) > 1.0 && c.z.cult == null; }).sort(function (x, y) { return y.stress - x.stress; })[0];
        P.forEach(function (c) { c.z.food++; });
        if (rec && rng() < 0.5) {
          rec.z.cult = n.id; n.cult.push(rec.i); rec.stress = Math.max(0, rec.stress - 30);
          var keep = Z.here(ctx, rec).filter(function (o) { return ctx.R(o, rec).aff > 40; })[0];
          t += ctx.t('{a}は、気づけば{n}の手を握って泣いていた。その夜、{a}は信者たちの輪に加わった。', rec).replace(/\{n\}/g, n.label);
          if (keep) t += ctx.t('{b}が呼んでも、{a}はもう振り返らなかった。', rec, keep);
          return ctx.act2({ actors: P, cat: 'solo', text: t, why: rec.name + 'の追い詰められ方（焦り ' + Math.round(rec.stress + 30) + '）とAC。救いの言葉にすがった', mag: 30 });
        }
        ctx.act2({ actors: P, cat: 'help', text: t + 'その夜は、温かいスープが配られた。', why: n.label + 'の教会（食料+1）', mag: 12 });
      },
      again: function (ctx, n, P) {
        var rng = ctx.rng, zb = ctx.zb;
        var mem = n.cult.map(function (i) { return ctx.chars[i]; }).filter(function (c) { return c.alive && !c.out && c.z.area === n.area; });
        if (!mem.length || rng() > 0.45) return;
        /* 儀式：連れ戻しに来た者がいれば止められることも */
        var res = P.filter(function (o) { return mem.indexOf(o) < 0 && mem.some(function (m) { return ctx.R(o, m).aff > 35; }); })[0];
        if (res && rng() < 0.35 + res.tr.cp * 0.3 + res.tr.np * 0.2) {
          mem.forEach(function (m) { m.z.cult = null; ctx.mod(m, res, { aff: 20, trust: 20 }); });
          return ctx.act2({ actors: [res].concat(mem), cat: 'help', text: fillN(ctx, '儀式の杯が回り始めたとき、{a}が祭壇を蹴り倒した。「帰るぞ｜＝｜帰りますよ」――' + Z.names(mem) + 'の手から、杯が落ちた。', n, res), why: res.name + 'の想い（' + Z.names(mem) + 'への好意）とCP', mag: 40 });
        }
        n.alive = false; n.note = '信者たちと「旅立った」'; zb.stats.npcDead++;
        ctx.act2({ actors: mem, cat: 'death', text: fillN(ctx, '{n}は信者たちに杯を配った。「新しい世界で会いましょう」――朝、礼拝堂の長椅子に、眠るように並んだ人々がいた。その中に、' + Z.names(mem) + 'もいた。', n), why: Z.names(mem) + 'は' + n.label + 'の教えにすがっていた', mag: 50 });
        mem.forEach(function (m) { ctx.kill(m, null, n.label + 'の教団の集団自決で'); });
      }
    },
    /* --- 狂人 --- */
    madman: {
      meet: function (ctx, n, P) {
        var rng = ctx.rng, zb = ctx.zb, a = rng.pick(P);
        if (rng() < 0.4) {
          var r = Z.RUMORS.filter(function (x) { return x.truth === false; });
          var rm = rng.pick(r);
          P.forEach(function (c) { c.z.know[rm.id] = true; });
          return ctx.act2({ actors: P, cat: 'solo', fx: function () { P.forEach(function (c) { ctx.stress(c, 6); }); }, text: fillN(ctx, '{n}は{a}の肩を掴み、唾を飛ばしながら叫んだ。「' + rm.t + '！　知らないのか！？」――そして笑いながら走り去った。', n, a), why: n.label + 'の言葉（デマ）を、' + Z.names(P) + 'は聞いてしまった' });
        }
        var mp = 40 + rng() * 45, ap = power(a) + rng() * 30;
        if (ap > mp) {
          n.alive = false; n.note = a.name + 'に倒された'; zb.stats.npcDead++;
          a.flags.npcKill = (a.flags.npcKill || 0) + 1; ctx.stress(a, 14);
          return ctx.act2({ actors: P, cat: 'combat', text: fillN(ctx, rng.pick(['{n}が鉈を振り回しながら{a}に襲いかかった。{a}は無我夢中で' + (a.weapon ? a.weapon.name : '拳') + 'を振るった。我に返ったとき、{n}は動かなくなっていた。人間を、殺した。', '{n}は「お前もあいつらの仲間だろう！」と叫んで{a}に飛びかかった。もみ合いの末、{n}は階段を転げ落ちて、それきりだった。']), n, a), why: a.name + 'の戦う力（' + Math.round(ap) + '）が' + n.label + 'を上回った', mag: 30 });
        }
        a.hp -= 15 + rng.int(15); if (a.z.wound < 0) a.z.wound = ctx.stepIndex;
        if (a.hp <= 0) { ctx.act2({ actors: P, cat: 'death', text: fillN(ctx, '{n}の鉈が、{a}の頭上に振り下ろされた。', n, a), why: n.label + 'は正気を失っていた', mag: 40 }); ctx.kill(a, null, n.label + 'に襲われて'); return; }
        ctx.act2({ actors: P, cat: 'combat', text: fillN(ctx, '{n}は{a}に斬りかかり、{a}の腕を深く切り裂いてから、笑い声とともに闇に消えた。', n, a), why: n.label + 'は正気を失っていた', mag: 22 });
      },
      again: function (ctx, n, P) {
        ctx.act2({ actors: P, cat: 'solo', fx: function () { P.forEach(function (c) { ctx.stress(c, 8); }); }, text: fillN(ctx, ctx.pick(['{area}のどこかで、{n}の調子外れの歌声が響いていた。歌声は、少しずつ近づいてくる。', '壁に、赤いペンキで大きな笑顔が描かれていた。{n}の仕業だろう。']), n), why: n.label + 'がまだうろついている' });
      }
    },
    /* --- 迷子の子 --- */
    child: {
      meet: function (ctx, n, P) {
        var rng = ctx.rng, a = ctx.most(P, function (c) { return c.tr.np + c.tr.warmth * 0.5; });
        if (a.tr.np < 0.35 && a.tr.cold > 0.6 && rng() < 0.6) {
          n.alone = true;
          return ctx.act2({ actors: P, cat: 'solo', fx: function () { P.forEach(function (c) { if (c.tr.np > 0.5) ctx.stress(c, 12); }); }, text: fillN(ctx, '物陰で、{n}が膝を抱えて泣いていた。{a}は足を止めかけて、それから首を振った。「連れていけない。足手まといになる｜＝｜連れていけません。足手まといになります」', n, a), why: a.name + 'のドライさ（' + Math.round(a.tr.cold * 100) + '）', mag: 18 });
        }
        n.with = a.i; a.z.child = n.id;
        ctx.act2({ actors: P, cat: 'help', fx: function () { ctx.stress(a, -8); }, text: fillN(ctx, rng.pick(['{area}の車の陰で、{n}が泣きじゃくっていた。{a}はしゃがんで目線を合わせ、「{you}も、一緒に行こう｜＝｜{you}も、一緒に行きましょう」と手を差し出した。', '{n}は「ママを待ってる」と言って動こうとしなかった。{a}は{n}を背負い、「ママには、生きてたら会えるから｜ママには、生きていれば会える｜ママには、生きていれば会えますから」と言った。', '{n}は{a}の服の裾を掴んで離さなかった。{a}は諦めて、{n}の手を握り直した。']), n, a), why: a.name + 'のNP（' + Math.round(a.eg.NP) + '）', mag: 20 });
      },
      again: function (ctx, n, P) {
        var rng = ctx.rng, zb = ctx.zb, a = n.with != null ? ctx.chars[n.with] : null;
        if (!a) return;
        if (zb.A[n.area].def.shelter && !zb.A[n.area].fallen && rng() < 0.5) {
          n.with = null; n.alive = false; n.out = true; n.note = '避難所で母親と再会した'; a.z.child = null;
          return ctx.act2({ actors: [a], cat: 'help', fx: function () { ctx.stress(a, -20); }, text: fillN(ctx, '避難所の人混みの中から、誰かが{n}の名前を叫んだ。{n}は{a}の手を離して駆け出し、泣き崩れる母親の腕に飛び込んだ。{a}は手を振って、それから少しだけ泣いた。', n, a), why: '避難所までたどり着いた', mag: 30 });
        }
        if (zb.A[n.area].z > 45 && rng() < 0.14) {
          n.turnAt = ctx.stepIndex + 2 + rng.int(3); n.bit = true;
          return ctx.act2({ actors: [a], cat: 'combat', fx: function () { ctx.stress(a, 25); }, text: fillN(ctx, '{n}の悲鳴が上がった。{a}が振り向いたときには、{n}の小さな足首に歯形がついていた。{a}は{n}を抱きしめたまま、しばらく動けなかった。', n, a), why: '子どもを守りきれなかった（' + Z.an(ctx, n.area) + 'のゾンビの多さ）', mag: 38 });
        }
        if (n.bit && rng() < 0.5) {
          n.alive = false; n.note = a.name + 'の腕の中で眠った'; zb.stats.npcDead++;
          var put = a.tr.cp * 0.4 + a.tr.a * 0.4 > 0.55;
          return ctx.act2({ actors: [a], cat: 'death', fx: function () { ctx.stress(a, 35); a.flags.grief = -1; }, text: fillN(ctx, put ? '{n}の熱が上がりきる前に、{a}は{n}を膝に乗せて、子守唄を歌った。歌い終わったとき、{a}の手の中で、すべてが終わっていた。' : '{n}は{a}の腕の中で、「……ありがと」と言って目を閉じた。{a}は、{n}が二度と目を開けないことを、ずっと祈っていた。', n, a), why: '咬まれた子ども', mag: 45 });
        }
        ctx.act2({ actors: [a], cat: 'help', fx: function () { ctx.stress(a, -5); a.z.food = Math.max(0, a.z.food - (rng() < 0.3 ? 1 : 0)); }, text: fillN(ctx, rng.pick(['{a}は自分の分の食料を、{n}に半分あげた。', '{n}は{a}の背中で眠っていた。{a}はその重さに、なぜか救われていた。', '{n}が小声で歌を歌い始め、{a}は慌てて口を塞いだ。それから二人で、声を出さずに笑った。', '{n}は{a}に、「ママ、どこにいると思う？」と訊いた。{a}は「きっと待ってる｜きっと待っている｜きっと待っていますよ」としか言えなかった。', '{n}は拾ったクレヨンで、{a}の似顔絵を描いた。{a}はそれを、胸ポケットにしまった。', '{n}が熱を出した。{a}は一晩中、{n}の額の濡れタオルを替え続けた。咬み跡は、どこにもなかった。']), n, a), why: a.name + 'と' + n.label });
      }
    },
    /* --- 医者 --- */
    doctor: {
      meet: function (ctx, n, P) {
        var rng = ctx.rng, cured = [];
        P.forEach(function (c) { c.z.know.bite = true; c.z.know.blood = false; if (c.z.wound >= 0 && !c.z.bitten) { c.z.wound = -1; c.z.fever = false; c.hp = Math.min(100, c.hp + 15); cured.push(c); } });
        var bit = P.filter(function (c) { return c.z.bitten && c.z.aware && ctx.stepIndex - c.z.bitten.at <= 2; })[0];
        var t = fillN(ctx, '{area}の診療所に、{n}が一人で残っていた。「感染するのは咬み傷からだけだ。返り血はただの血だよ」', n) + (cured.length ? Z.names(cured) + 'の傷は、きちんと縫い直された。' : '');
        if (bit) {
          var ok = rng() < 0.42 + ctx.stat(bit, 'hp') * 0.03;
          bit.hp -= 25;
          if (ok) { bit.z.bitten = null; bit.z.turnAt = -1; bit.z.cut = true; t += ctx.t('{n}は{a}の咬み跡を見て、メスを取った。「まだ間に合うかもしれない。歯を食いしばれ」――手術は朝まで続き、{a}の熱は、引いた。', bit).replace(/\{n\}/g, n.label); }
          else t += ctx.t('{n}は{a}の傷口を見て、黙ってメスを置いた。「……すまない。もう、全身に回ってる」', bit).replace(/\{n\}/g, n.label);
          if (bit.hp <= 0) { ctx.act2({ actors: P, cat: 'death', text: t, why: '切断手術に体がもたなかった', mag: 40 }); ctx.kill(bit, null, n.label + 'の切断手術の最中に'); return; }
          return ctx.act2({ actors: P, cat: 'help', text: t, why: n.label + 'の処置（' + bit.name + 'の体力 ' + ctx.stat(bit, 'hp') + '）' + (ok ? '：間に合った' : '：手遅れ'), mag: ok ? 40 : 25 });
        }
        ctx.act2({ actors: P, cat: 'help', text: t, why: n.label + 'は正しい知識を持っていた', mag: 16 });
      }
    },
    /* --- 略奪者 --- */
    looter: {
      meet: function (ctx, n, P) {
        var rng = ctx.rng, zb = ctx.zb;
        var f = ctx.most(P, function (c) { return c.tr.aggr + c.tr.cp * 0.5 + (c.weapon ? c.weapon.pow * 0.05 : 0); });
        if (f.tr.aggr + f.tr.cp * 0.5 > 0.75 && rng() < 0.6) {
          var lp = 45 + rng() * 35 + (n.gun ? 25 : 0), fp = power(f) + rng() * 35;
          if (fp > lp) { n.alive = false; n.note = f.name + 'たちに追い払われた'; return ctx.act2({ actors: P, cat: 'combat', text: fillN(ctx, '{n}たちが「食い物を出せ」と押し入ってきた。{a}は「{you}たちに渡す分はない｜＝｜{you}たちに渡す分はありません」と言い捨て、' + (f.weapon ? f.weapon.name : '拳') + 'で先頭の男を殴り倒した。残りは悲鳴を上げて逃げていった。', n, f), why: f.name + 'の攻撃性・CP（' + Math.round(fp) + '）', mag: 26 }); }
          if (rng() < (n.gun ? 0.45 : 0.2) * HK.Dark.f(ctx, 'raid')) { ctx.act2({ actors: P, cat: 'death', text: fillN(ctx, '{n}たちに歯向かった{a}は、' + (n.gun ? '至近距離から撃たれた' : '数人がかりで殴り倒された') + '。', n, f), why: n.label + 'たちは容赦がなかった', mag: 42 }); ctx.kill(f, null, n.label + 'たちに襲われて'); P.forEach(function (c) { c.z.food = 0; }); return; }
          f.hp -= 20; if (f.z.wound < 0) f.z.wound = ctx.stepIndex;
          if (f.hp <= 0) { ctx.act2({ actors: P, cat: 'death', text: fillN(ctx, '{n}たちに殴りかかった{a}は、袋叩きにされて動かなくなった。', n, f), why: '略奪者のほうが多かった', mag: 40 }); ctx.kill(f, null, n.label + 'たちに襲われて'); return; }
          P.forEach(function (c) { c.z.food = Math.max(0, c.z.food - 2); });
          return ctx.act2({ actors: P, cat: 'combat', text: fillN(ctx, '{a}は「{you}たちに渡すものはない｜＝｜{you}たちに渡すものはありません」と{n}たちに殴りかかったが、多勢に無勢だった。食料をほとんど奪われ、{a}は肋骨を押さえてうずくまった。', n, f), why: '略奪者のほうが多かった', mag: 26 });
        }
        /* まれに、一人が犯される（R18版の solo-zombie-raid.js。襲われる人が「攻め」指定でないときだけ） */
        if (Z.raiderAssault && Z.loveLv(ctx) !== 'off' && ctx.env.zraid !== 'off' && (!HK.Content || HK.Content.ok(ctx, 'force')) && rng() < 0.3 * HK.Dark.f(ctx, 'raid')) {
          var vs = P.filter(function (c) { return !(HK.Pos && !HK.Pos.canReceive(c)) && !(HK.State && !HK.State.mobSexOk(c)) && !c.flags.raided; });
          if (vs.length) {
            var v = HK.weighted(rng, vs, function (c) { return 1 + (1 - c.tr.cp) * 0.6 + (c.hp < 50 ? 0.4 : 0); });
            P.forEach(function (c) { c.z.food = Math.max(0, c.z.food - 1); });
            v.flags.mobHit = { at: ctx.stepIndex, by: n.label || '略奪者' };
            var ra = Z.raiderAssault(ctx, v, P.filter(function (c) { return c !== v; }), n);
            return ctx.act2({ actors: ra.with, cat: 'betray', text: ra.text, why: ra.why, mag: ra.mag });
          }
        }
        P.forEach(function (c) { c.z.food = Math.max(0, c.z.food - 1); ctx.stress(c, 8); });
        ctx.act2({ actors: P, cat: 'conflict', text: fillN(ctx, '{n}たちは' + (n.gun ? '銃' : '鉄パイプ') + 'をちらつかせて、' + Z.names(P) + 'の食料を半分持っていった。「命までは取らねえよ。今日のところはな」', n), why: '逆らわないほうを選んだ（慎重さ）', mag: 18 });
      }
    },
    /* --- 配信者 --- */
    streamer: {
      meet: function (ctx, n, P) {
        var rng = ctx.rng, zb = ctx.zb;
        var r = rng() < ctx.env.rumor / 100 ? rng.pick(Z.RUMORS.filter(function (x) { return x.truth === false; })) : rng.pick(Z.RUMORS.filter(function (x) { return x.truth === true; }));
        P.forEach(function (c) { c.z.know[r.id] = true; });
        zb.A[n.area].z = Math.min(100, zb.A[n.area].z + 22);
        var t = fillN(ctx, '{n}がスマホに向かって喋っていた。「同接三万人！　みんな、' + r.t + 'って情報入ってます！」――その声とライトに、ゾンビが集まり始めていた。', n);
        if (rng() < 0.5) { n.alive = false; n.note = '配信中に群れに呑まれた'; zb.stats.npcDead++; t += fillN(ctx, '配信は、{n}の悲鳴で途切れた。', n); }
        ctx.act2({ actors: P, cat: 'solo', fx: function () { P.forEach(function (c) { ctx.stress(c, 10); }); }, text: t, why: n.label + 'の配信（' + (r.truth ? '本当の情報' : 'デマ') + '）と、その騒音', mag: 22 });
        Z.hordeEvent(ctx, P, zb.A[n.area]);
      }
    },
    /* --- 老人 --- */
    old: {
      meet: function (ctx, n, P) {
        var rng = ctx.rng, a = rng.pick(P);
        a.z.food += 2;
        ctx.act2({ actors: P, cat: 'help', text: fillN(ctx, rng.pick(['{n}は、家の戸口で{a}たちを手招きした。「わしはここを動かんよ。これを持っていきなさい」――缶詰と、乾パンだった。', '{n}は「孫が迎えに来るんだ」と言って、玄関先に座り続けていた。{a}に、炊いたばかりの握り飯を二つくれた。']), n, a), why: n.label + 'の厚意（食料+2）', mag: 14 });
      },
      again: function (ctx, n, P) {
        var rng = ctx.rng;
        if (rng() < 0.5) {
          n.alive = false; n.turned = true; n.note = 'ゾンビになっていた'; ctx.zb.stats.npcDead++;
          ctx.act2({ actors: P, cat: 'solo', fx: function () { P.forEach(function (c) { ctx.stress(c, 10); }); }, text: fillN(ctx, 'もう一度通りかかった{n}の家の戸口に、{n}は座っていた。同じ姿勢のまま、白く濁った目で、迎えの来ない道の先を見ていた。', n), why: '動かないことを選んだ人の結末', mag: 20 });
        }
      }
    },
    /* --- 咬まれた市民 --- */
    bitten: {
      meet: function (ctx, n, P) {
        var rng = ctx.rng, a = ctx.most(P, function (c) { return c.tr.np - c.tr.cold * 0.5; });
        var sees = P.filter(function (c) { return c.tr.a + c.tr.caution > 1.1; })[0];
        if (sees && rng() < 0.55) {
          return ctx.act2({ actors: P, cat: 'conflict', text: fillN(ctx, '{n}は「仲間に入れてほしい」と頭を下げた。{a}は{n}の腕の包帯を見て、首を横に振った。「{you}、その傷を見せてくれ｜＝｜{you}、その傷を見せてください」――{n}は黙って、来た道を引き返していった。', n, sees), why: sees.name + 'の冷静さと慎重さ（A・AC）', mag: 16 });
        }
        if (a.tr.np > 0.5 || rng() < 0.4) {
          n.with = a.i;
          return ctx.act2({ actors: P, cat: 'help', text: fillN(ctx, '{n}は「ガラスで切った」と言って、包帯の腕をかばっていた。{a}は少し迷ってから、{n}を仲間に入れた。', n, a), why: a.name + 'のNP（' + Math.round(a.eg.NP) + '）', mag: 14 });
        }
        ctx.act2({ actors: P, cat: 'solo', text: fillN(ctx, '{n}が助けを求めて近づいてきた。{a}たちは、扉を開けなかった。', n, a), why: '危険は冒せない', mag: 10 });
      }
    }
  };
  Z.NPC = NPC;
})();
