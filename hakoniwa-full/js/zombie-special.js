/* 箱庭シミュレーター: ゾンビの街 ― 特殊役職（不死・吸血鬼）（special.js の組み込み）
   ・不死／吸血鬼は、死んでも次の区切りの頭に蘇る。咬まれてゾンビになっても、やがて人に戻って起き上がる
   ・特殊役職の人は、ストレスの高い時間が続くと発狂して動けなくなる（同じエリアの仲の良い人が落ち着かせるまで）
   ・吸血鬼は三日に一度、同じエリアにいる人の血を吸う（ゾンビ・咬まれた人の血は吸えない） */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB, SP = HK.Special;
  if (!Z || !Z.scen || !SP) return;
  var LOVE = /^(lover|mate|fated|almost|fwb)$/;
  var BACK = ['{a}の濁った目に、少しずつ光が戻っていった。腐りかけていた肌が張りを取り戻し、{a}は自分の手を見つめて呟いた。「……戻って、きた？」', 'ゾンビの群れの中で、{a}の足が止まった。{a}は激しく咳き込み、黒い血を吐き出した。次に顔を上げたとき、{a}は人間の目をしていた。'];
  function adapter(ctx) {
    var A = ctx.spA;
    if (!A) A = ctx.spA = {
      rng: ctx.rng, all: ctx.chars, env: ctx.env, scenId: 'zombie',
      r18: !HK.SAFE_ON && (ctx.env.zlewd != null || !!(HK.Lewd && HK.Lewd.conf('zombie'))) && Z.loveLv(ctx) !== 'off', lewd: Z.loveLv(ctx) === 'high' ? 0.55 : 0.3,
      alive: function (c) { return !!c.alive; },
      here: function (c) { return !c.out; },
      near: function (a, b) { return a.z && b.z && a.z.area === b.z.area; },
      say: function (o) {
        var e = ctx.act2({ actors: o.actors, cat: o.tag === '吸血' || o.tag === '凶行' ? 'combat' : 'solo', text: o.text, why: o.why, mag: o.mag || 0 });
        return e;
      },
      hp: function (c) { return c.hp; },
      setHp: function (c, v) { c.hp = Math.max(0, Math.min(c.hpMax || 100, v)); },
      full: function (c) { return c.hpMax || 100; },
      stress: function (c) { return c.stress; },
      addStress: function (c, v) { c.stress = Math.max(0, Math.min(100, c.stress + v)); },
      rel: function (a, b) {
        var t = HK.Ties && HK.Ties.get(ctx, a, b), r = ctx.R(a, b);
        return { love: !!((t && LOVE.test(t.type || '')) || ctx.pair(a, b).couple), w: Math.max(-1, Math.min(1, r.aff / 80)) };
      },
      relMod: function (b, a, how) { ctx.mod(b, a, how === '力ずく' ? { trust: -25, aff: -15 } : how === '催眠' ? { trust: -6 } : { aff: 6, trust: 6 }); },
      reviveText: function (c) { return c.spWasZ ? BACK[Math.floor(ctx.rng() * BACK.length)].replace(/\{a\}/g, c.name) : null; },
      revive: function (c) {
        var zb = ctx.zb;
        c.spWasZ = c.fate === 'ゾンビ化';
        if (c.spWasZ) {
          /* ゾンビになっていた体が人に戻る：群れの記録から外す */
          zb.zpc = zb.zpc.filter(function (z) { return z.i !== c.i; });
        }
        c.alive = true; c.fate = ''; c.fateNote = ''; c.deathHow = ''; c.diedAt = null; c.killedBy = null;
        c.z.bitten = null; c.z.turnAt = -1; c.z.aware = false; c.z.decided = false; c.z.wound = -1; c.z.hiding = false;
      },
      kill: function (c, how, text, by) {
        ctx.act2({ actors: by ? [by, c] : [c], cat: 'death', text: text, why: how + '命を落とした', mag: 40 });
        ctx.kill(c, by || null, how);
      },
      zombie: function (c) { return !!(c.z && c.z.bitten); }
    };
    A.nowH = ctx.stepIndex * 6;
    return A;
  }
  var sc = Z.scen, setup0 = sc.setup, phase0 = sc.phase, after0 = sc.after, finish0 = sc.finish, end0 = sc.end;
  /* 全員が倒れても、蘇る人が残っていれば続ける */
  sc.end = function (ctx) { return end0(ctx) && !ctx.chars.some(function (c) { return c.spec && !c.alive && !c.spNoRev && !c.spGone && !c.out; }); };
  sc.setup = function (ctx) {
    setup0(ctx);
    ctx.chars.forEach(function (c) { c.hpMax = c.hp; });
    SP.setup(adapter(ctx), ctx.chars, function (c) { return { pick: c.pick }; });
  };
  sc.phase = function (ctx, s, n) {
    var A = adapter(ctx);
    if (s > 0) SP.revive(A);
    phase0(ctx, s, n);
    ctx.flush();
    ctx.present().forEach(function (c) {
      if (!c.alive || c.out) return;
      if (c.mad) SP.madTurn(A, c);
      else if (c.spec === 'vampire') SP.vampTurn(A, c);
    });
  };
  sc.after = function (ctx, s, n) {
    after0(ctx, s, n);
    var A = adapter(ctx);
    ctx.present().forEach(function (c) { SP.wear(A, c, { base: 64, lim: 26 }); });
    /* 最後の区切りで死んだ不死も、結末の前に起き上がる */
    if (s === n - 1) SP.revive(A);
  };
  sc.finish = function (ctx) {
    finish0(ctx);
    ctx.chars.forEach(function (c) { var t = SP.endNote(c); if (t) c.fateNote = (c.fateNote ? c.fateNote + '／' : '') + t; });
  };
})();

/* ---------- 結末の締め：生き延びた人・街を出た人・失われた人を、記録の最後にまとめる ----------
   結末の条件：最終日が終わる（救助ヘリ／救助なし／街ごと焼き払われる）か、街に残る人がいなくなる（zombie-core.js の end）。
   最後に「結末」の段と、その回の生死から組み立てた締めの文を入れる */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB, sc = Z && Z.scen;
  if (!sc) return;
  function L(s) { return s.split('|'); }
  function nm(list) { list = list.map(function (c) { return c.name; }); return list.length > 6 ? list.slice(0, 6).join('・') + 'ほか' + (list.length - 6) + '人' : list.join('・'); }
  function fill(t, o) { return t.replace(/\{(\w+)\}/g, function (m, k) { return o[k] != null ? o[k] : m; }); }
  var T = {
    heli: L('{G}を乗せたヘリは、朝日の中を海の方へ飛んでいった。窓の外で、街の煙が小さくなっていく。しばらく誰も口をきかなかった。|{G}は、ヘリの床に座りこんだまま毛布を肩にかけられた。隣にいる人の体温だけが、生き延びた証だった。|避難キャンプに降り立った{G}は、配られた温かい汁物を、黙って最後の一滴まで飲んだ。悪夢は、ひとまずここで終わった。'),
    out: L('{G}は、街の境を越えたところで一度だけ振り返った。煙の上がる街は、もう遠い景色になっていた。|{G}は、検問の灯りを目指して夜道を歩き続けた。街の外にも、ちゃんと朝は来るらしかった。|街を抜け出した{G}は、知らない町の避難所で、久しぶりに靴を脱いで眠った。'),
    stay: L('{D}日目の夜が明けた。{G}は{P}で、残った食料を数え直した。この先どうなるかは分からない。それでも、今日を生き延びた。|{G}は{P}の窓から、昇ってくる朝日を眺めた。呻き声は遠い。生き残った人だけの、静かな朝だった。|{D}日が過ぎた。{G}は{P}で、交代で見張りに立つ順番を決めた。この街で生きていくための、最初の決まりごとだった。'),
    missed: L('ヘリの音が消えた空を、{G}はしばらく見上げていた。|救助は、{G}のいる場所には降りてこなかった。|乗りそこねたヘリの影を、{G}は黙って見送った。'),
    zomb: L('{Z}は、今も呻き声の群れの中にいる。|{Z}だったものが、まだ街のどこかをさまよっている。|{Z}の名前を呼んでも、もう返事はない。'),
    dead: L('{X}は、この{D}日間を越えられなかった。|{X}の名前を、生き残った人は忘れない。|{X}は、帰ってこなかった。'),
    burn: L('{D}日目の夜、街は白い炎に包まれた。{X}の足跡も叫び声も、すべて灰の下に消えた。生き残った人は、一人もいなかった。|空が白く光ったあと、街には何も残らなかった。{X}がここで生きていたことを知る人は、もういない。|炎は朝まで燃え続けた。{X}が身を寄せ合った場所も、守ろうとしたものも、すべて灰になった。'),
    wipe: L('{D}日目、街に動くものはもう人の姿をしていなかった。{X}の話は、ここで途切れた。|誰もいなくなった避難所で、手回しラジオだけが救助の呼びかけを繰り返していた。応える声は、もうなかった。|{D}日目。街には呻き声だけが残った。{X}がここで生きていたことを、知る人はいない。'),
    burnOut: L('その夜、背後の街は白い炎に包まれた。|街を出たあと、遠くの空が白く光った。|夜になって、街は丸ごと焼き払われた。')
  };
  function closing(ctx) {
    var C = ctx.chars, env = ctx.env, D = parseInt(ctx.label, 10) || env.days;
    var heli = C.filter(function (c) { return c.out && c.fate === '救助された'; });
    var out = C.filter(function (c) { return c.out && c.fate !== '救助された'; });
    var stay = C.filter(function (c) { return c.alive && !c.out; });
    var zomb = C.filter(function (c) { return !c.alive && c.fate === 'ゾンビ化'; });
    var dead = C.filter(function (c) { return !c.alive && c.fate !== 'ゾンビ化'; });
    var gone = zomb.concat(dead), t = '', title;
    var area = function (list) { return list.map(function (c) { return c.z && ctx.zb.A[c.z.area] ? ctx.zb.A[c.z.area].name : ''; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; }).join('や'); };
    if (!heli.length && !out.length && !stay.length) {
      t = fill(ctx.pick(env.end === 'burn' && D >= env.days ? T.burn : T.wipe), { D: D, X: nm(gone) });
      title = env.end === 'burn' && D >= env.days ? '街は焼き払われた ― 全滅' : '全滅';
    } else {
      if (heli.length) t += fill(ctx.pick(T.heli), { G: nm(heli) });
      if (out.length) t += fill(ctx.pick(T.out), { G: nm(out) });
      if (env.end === 'burn' && (heli.length || out.length) && D >= env.days) t += ctx.pick(T.burnOut);
      if (stay.length) t += (env.end === 'heli' && D >= env.days ? fill(ctx.pick(T.missed), { G: nm(stay) }) : '') + fill(ctx.pick(T.stay), { G: nm(stay), D: D, P: area(stay) || '街の片隅' });
      if (zomb.length) t += fill(ctx.pick(T.zomb), { Z: nm(zomb) });
      if (dead.length) t += fill(ctx.pick(T.dead), { X: nm(dead), D: D });
      title = heli.length ? '救助ヘリで脱出' : out.length ? '街を脱出' : env.end === 'heli' && D >= env.days ? '救助を逃して生き延びた' : env.end === 'none' && D >= env.days ? '最後の日を生き延びた' : '生き延びた';
      title += ' ― ' + (ctx.flags.outcome || '');
    }
    ctx.flags.outcome = title;
    ctx.say({ kind: 'step', cat: 'phase', text: '結末' });
    ctx.say({ kind: 'event', cat: 'phase', cageOk: true, actors: heli.concat(out, stay).length ? heli.concat(out, stay) : gone, text: t, why: '結末：' + title, mag: 30 });
  }
  var fin0 = sc.finish;
  sc.finish = function (ctx) {
    var r = fin0 ? fin0.apply(this, arguments) : undefined;
    ctx.flush();
    closing(ctx);
    return r;
  };
})();
