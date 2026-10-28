/* 箱庭シミュレーター: ゾンビの街 ― 住人どうしの出来事・噂・目標の変化・脱出・咬まれた仲間への反応・結末
   出来事は「同じエリアにいる者どうし」でだけ起きる（engine.js の othersFor） */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB, scen = Z.scen, EV = scen.events;
  function L(s) { return s.split('|'); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  function tieT(ctx, a, b) { var t = HK.Ties && HK.Ties.get(ctx, a, b); return t ? (t.like || t.type) : ''; }
  function wname(c) { return c.weapon ? c.weapon.name : '素手'; }
  function luck(ctx, c) { return ctx.stat(c, 'luck'); }
  function an(ctx, i) { return Z.an(ctx, i); }
  /* 憎悪を持っても殺さない相手（attr.js の HK.Attr.spare）：v を k が殺さないなら真。殺す出来事を選ぶ前に見る */
  function spare(ctx, v, k) { return !!(HK.Attr && HK.Attr.spare && HK.Attr.spare(ctx, v, k)); }

  /* ======================= 目標の変化 ======================= */
  var GOAL = {};
  scen.goals.forEach(function (g) { GOAL[g.id] = g; });
  Z.setGoal = function (ctx, c, id, why, text) {
    if (!c.alive || c.out || c.goal.id === id) return;
    var from = c.goal.label;
    c.goal = GOAL[id];
    c.goalHist = (c.goalHist || []).concat([id]);
    ctx.act2({ actors: [c], cat: 'solo', text: (text ? ctx.t(text, c) : '') + c.name + 'の目標が変わった：「' + from + '」→「' + c.goal.label + '」', why: why, mag: 14 });
  };
  Z.goalShift = function (ctx, c, trig) {
    var f = c.z.family, rng = ctx.rng;
    if (trig === 'familyBad' && c.goal.id === 'family') {
      var close = Z.here(ctx, c).filter(function (o) { return ctx.R(c, o).aff > 35; })[0];
      if (c.tr.cold + c.tr.aggr > 1.2 && rng() < 0.5) Z.setGoal(ctx, c, 'chaos', '家族の悲報で、' + c.name + 'の中の何かが切れた（ドライさ・攻撃性）', '{a}はスマホを握りつぶすように閉じた。もう、守るものはない。');
      else if (close) { c.focus = close; Z.setGoal(ctx, c, 'protect', '家族を失った' + c.name + 'は、そばにいる' + close.name + 'を守ることにした'); }
      else Z.setGoal(ctx, c, 'live', '家族の悲報。それでも、生きなければならない');
    }
  };
  /* 状況で目標が変わる（ひとりの出来事として） */
  EV.push({
    id: 'z_goal', cat: 'solo', scope: 'solo',
    when: function (ctx, a) { a.z.gr = goalReason(ctx, a); return !!a.z.gr; },
    w: function () { return 1.6; },
    run: function (ctx, a) {
      var r = a.z.gr || goalReason(ctx, a);
      if (!r) return null;
      if (r.focus) a.focus = r.focus;
      var from = a.goal.label; a.goal = GOAL[r.id];
      a.goalHist = (a.goalHist || []).concat([r.id]);
      return { text: ctx.t(r.text, a, r.focus) + a.name + 'の目標が変わった：「' + from + '」→「' + a.goal.label + '」', why: r.why, mag: 14 };
    }
  });
  function goalReason(ctx, a) {
    var z = a.z, g = a.goal.id, d = Z.day(ctx);
    if (z.cult != null || z.bitten) return null;
    if (g !== 'escape' && z.know.burn && ctx.env.end === 'burn' && a.tr.a + a.tr.caution > 0.9) return { id: 'escape', text: '{a}は、街ごと焼き払われるという話を、本当だと判断した。', why: '噂「街ごと焼き払う」を信じた（冷静さ・慎重さ）' };
    if (g === 'chaos' && a.stress < 30 && a.tr.np > 0.45 && Z.here(ctx, a).some(function (o) { return ctx.R(a, o).aff > 45; })) { var f0 = Z.here(ctx, a).filter(function (o) { return ctx.R(a, o).aff > 45; })[0]; return { id: 'protect', focus: f0, text: '{a}は、{b}の寝顔を見ながら、自分が何をしようとしていたのかを考えた。', why: a.name + 'の中に残っていたNPと、' + f0.name + 'への好意' }; }
    if ((g === 'live' || g === 'chaos') && z.food <= 0 && z.hunger >= 2 && a.tr.a > 0.5) return { id: 'escape', text: '{a}は空腹の頭で考えた。この街に残っていても、飢えて死ぬだけだ。', why: '食料が尽きた（飢え ' + z.hunger + ' 日）' };
    if (g === 'protect' && a.focus && !a.focus.alive) {
      if (a.tr.cold + a.tr.aggr > 1.1) return { id: 'chaos', text: '{a}は' + a.focus.name + 'を守れなかった。{a}の目から、何かが消えた。', why: '守りたかった人を失った（ドライさ・攻撃性）' };
      return { id: 'escape', text: '{a}は' + a.focus.name + 'の形見を握りしめた。「生きて、この街を出る。それが約束だよ｜生きて、この街を出る。それが約束だ｜生きて、この街を出ます。それが約束です」', why: '守りたかった人を失った' };
    }
    if (g === 'live' && d >= 3 && a.tr.fc + a.tr.lead > 1.15 && Z.here(ctx, a).length === 0 && ctx.rng() < 0.3) return { id: 'escape', text: '{a}は、籠城に飽きていた。「待ってても、何も来ないよ｜待っていても、何も来ない｜待っていても、何も来ません」', why: a.name + 'のFC・主導性' };
    if (g === 'family' && z.family && z.family.found && z.family.state === 'ok') return { id: 'escape', text: '{a}は' + z.family.rel + 'の手を引いた。「一緒に、この街を出よう｜＝｜一緒に、この街を出ましょう」', why: '家族と合流できた' };
    if (g === 'family' && z.family && z.family.found && z.family.state !== 'ok') {
      var cl = Z.here(ctx, a).filter(function (o) { return ctx.R(a, o).aff > 30; })[0];
      if (cl) return { id: 'protect', focus: cl, text: '{a}には、もう帰る場所がない。だから、隣にいる{b}だけは。', why: '家族を失い、そばの' + cl.name + 'に心が向いた' };
      return { id: 'live', text: '{a}は' + z.family.rel + 'のいない世界で、それでも生きることにした。', why: '家族を失った' };
    }
    return null;
  }

  /* ======================= 家族の元へ ======================= */
  EV.push({
    id: 'z_family_reach', cat: 'solo', scope: 'solo', pri: true,
    when: function (ctx, a) { var f = a.z.family; return f && f.pc == null && f.inside && !f.found && a.z.area === f.area; },
    w: function () { return 6; },
    run: function (ctx, a) {
      var f = a.z.family, rng = ctx.rng, rel = f.rel;
      if (f.state === 'ok' && rng() < 0.25) {
        f.area = rng() < 0.6 && ctx.zb.safe >= 0 ? ctx.zb.safe : rng.pick(Z.adj(f.area));
        return { text: ctx.t('{a}は' + rel + 'のいるはずの場所にたどり着いた。誰もいなかった。壁に、' + rel + 'の字で「' + an(ctx, f.area) + 'へ行く」と書かれていた。', a), why: '家族は先に動いていた', mag: 18 };
      }
      f.found = true;
      if (f.state === 'ok') {
        f.with = true; a.stress = Math.max(0, a.stress - 30);
        return { cat: 'help', text: ctx.t(rng.pick(['{a}がドアを叩くと、中から' + rel + 'の声がした。扉が開いた瞬間、{a}は' + rel + 'を抱きしめていた。', an(ctx, a.z.area) + 'の避難所の片隅に、' + rel + 'がいた。{a}の名前を呼んで、' + rel + 'は泣き出した。']), a), why: '家族は無事だった（' + an(ctx, a.z.area) + '）', mag: 35 };
      }
      if (f.state === 'dead') {
        ctx.stress(a, 35); a.flags.grief = -1;
        return { text: ctx.t('{a}がたどり着いたとき、' + rel + 'はもう冷たくなっていた。{a}は' + rel + 'の手を握ったまま、夜が来るまで動けなかった。', a), why: '家族は亡くなっていた', mag: 40 };
      }
      /* ゾンビになった家族 */
      var put = a.tr.cp * 0.4 + a.tr.a * 0.35 + a.tr.cold * 0.3, flee = a.tr.caution * 0.6, hug = a.tr.np * 0.4 + a.tr.ac * 0.4 + a.stress / 200;
      var k = HK.weighted(rng, ['put', 'flee', 'hug'], function (x) { return Math.pow(Math.max(0.03, { put: put, flee: flee, hug: hug }[x]), 2); });
      ctx.stress(a, 40); a.flags.grief = -1;
      var base = '{a}が見つけた' + rel + 'は、もう' + rel + 'ではなかった。濁った目が、{a}の方を向いた。';
      if (k === 'put') return { cat: 'combat', text: ctx.t(base + '{a}は' + wname(a) + 'を握り直し、「……ごめん｜……すまない｜……すみません」と一度だけ言った。', a), why: a.name + 'の決断（CP・A・ドライさ）', mag: 45 };
      if (k === 'flee') return { cat: 'escape', text: ctx.t(base + '{a}は後ずさり、扉を閉めて、外から鍵をかけた。扉の向こうで、' + rel + 'が爪を立てる音がした。', a), why: a.name + 'の慎重さ', mag: 40 };
      Z.infect(ctx, a, null, true); a.z.bitten.npc = rel;
      return { cat: 'death', text: ctx.t(base + '{a}は武器を下ろした。両腕を広げて、' + rel + 'を抱きしめた。首筋に歯が食い込んでも、{a}は腕をほどかなかった。', a), why: a.name + 'のNP・ACと、追い詰められ方（焦り ' + Math.round(a.stress) + '）', mag: 55 };
    }
  });

  /* ======================= 脱出 ======================= */
  function wantsOut(ctx, c) {
    var g = c.goal.id, f = c.z.family;
    if (c.z.cult != null || c.z.alone) return false;
    if (g === 'escape') return true;
    if (g === 'family' && f && f.pc == null && !f.inside) return true;
    if (ctx.env.end === 'burn' && (c.z.know.burn || Z.day(ctx) >= ctx.env.days - 1)) return true;
    return false;
  }
  var ESC = {
    ok: {
      0: L('{who}は線路に降り、トンネルの闇の中を隣の市へ歩き始めた。振り返ると、街の灯りが一つずつ消えていくのが見えた。|{who}は、乗り捨てられた車のキーを見つけた。ハイウェイの封鎖線を突き破り、街を後にした。'),
      8: L('{who}は、漁船のエンジンをどうにかかけた。岸壁に群がるゾンビを置き去りにして、船は沖へ出た。|{who}は貨物船の船倉に潜り込んだ。汽笛が鳴り、船はゆっくりと岸を離れた。')
    },
    fail: L('出口は封鎖されていた。{who}は、バリケードの向こうから銃口を向けられて引き返した。|{who}が出口にたどり着いたとき、そこは群れに埋め尽くされていた。|{who}は出口の手前で、足を止めるしかなかった。夜の闇が深すぎた。|{who}がたどり着いた出口には、乗り捨てられた車が何台も折り重なっていた。どかすには、人手も時間も足りなかった。|{who}は出口の目前で、物陰から飛び出してきた群れに追い返された。|出口の向こうから、拡声器の声がした。「感染の疑いのある者は通過できない」――{who}は、引き返すしかなかった。|{who}が目指した道は、崩れた高架に塞がれていた。|{who}は出口までの最後の通りで、群れの足音に囲まれた。息を殺して、来た道を戻った。|出口の手前で雨が降り出した。視界がきかず、{who}は進むのを諦めた。|{who}は出口にたどり着いたが、鉄の門には太い鎖が巻かれていた。|{who}の前で、出口へ続く橋が爆破された。誰がやったのかは分からない。|出口の前に、昨日までなかったはずの検問が敷かれていた。{who}は、明かりを避けて引き返した。|{who}は出口に向かう途中で、仲間の一人が足をくじいた。全員で戻るしかなかった。|出口の見張り台から、誰かが無言で石を投げてきた。{who}は、それ以上近づけなかった。'),
    /* 失敗したあとの、それぞれの反応（気質で決まる） */
    react: { cp: L('{a}は唇を噛んだ。「次は別の道を探そう。必ず出るよ｜次は別の道を探す。必ず出る｜次は別の道を探します。必ず出ます」|{a}は皆を振り返った。「下を向かないで。まだ終わってないよ｜下を向くな。まだ終わっていない｜下を向かないでください。まだ終わっていません」'), np: L('{a}は、うつむく仲間の肩を一人ずつ叩いて回った。|{a}は「大丈夫、みんな無事だったんだから、それでいいよ｜大丈夫だ。みんな無事だった、それでいい｜大丈夫です。みんな無事だったんですから、それで十分です」と笑ってみせた。'), a: L('{a}は、見張りの交代時間と群れの動きを手帳に書き留めた。次の機会のために。|{a}は地図に×印をつけて、残りの出口を数え直した。'), fc: L('{a}は空き缶を思いきり蹴飛ばした。「なんなの、もう！｜なんなんだ、もう！｜なんなんですか、もう！」|{a}は道端に座り込んで、空に向かって叫んだ。'), ac: L('{a}は物陰で、声を殺して泣いた。|{a}は「私のせいで遅れたのかな｜私のせいで遅れたのか｜私のせいで遅れたんでしょうか」と、何度も繰り返した。') }
  };
  Z.escapes = function (ctx) {
    var zb = ctx.zb, rng = ctx.rng;
    Z.groups(ctx).forEach(function (g) {
      var A = zb.A[g[0].z.area];
      if (!A.def.exit) return;
      var want = g.filter(function (c) { return wantsOut(ctx, c); });
      if (!want.length) return;
      var lead = ctx.most(want, function (c) { return c.tr.lead; });
      var crew = g.filter(function (o) { return want.indexOf(o) >= 0 || ctx.R(o, lead).aff > 30 || ctx.pair(o, lead).couple || o.focus === lead; });
      var p = 0.05 + crew.reduce(function (s, c) { return s + luck(ctx, c); }, 0) / crew.length * 0.03 + (zb.escort && zb.escort.area === A.i && ctx.stepIndex <= zb.escort.until ? 0.3 : 0) - A.z / 300 + Z.day(ctx) * 0.025 + (ctx.env.end === 'burn' && Z.day(ctx) >= ctx.env.days - 1 ? 0.15 : 0);
      if (Z.day(ctx) === 1) p *= 0.3;
      if (Z.part(ctx) === 3) p *= 0.6;
      var who = names(crew);
      if (rng() < p) {
        crew.forEach(function (c) { c.out = true; c.fate = '街を脱出'; c.fateNote = ctx.label + '、' + A.name + 'から' + A.def.exit.replace(/^(.*)$/, '$1') + 'ことで街を出た' + (c.z.family && c.z.family.pc == null && !c.z.family.inside ? '。' + c.z.family.rel + 'のいる街の外へ' : ''); });
        zb.stats.escaped += crew.length;
        var left = g.filter(function (o) { return crew.indexOf(o) < 0; });
        var t = ctx.pick(ESC.ok[A.i] || ESC.ok[0]).replace(/\{who\}/g, who);
        if (left.length) {
          /* 残る理由：目標・家族・気質で決める */
          var why1 = function (o) {
            var f = o.z.family;
            if (o.z.cult != null) return o.name + 'は教団のもとを離れなかった';
            if (o.goal.id === 'family' && f) return o.name + 'は「' + (f.pc != null ? ctx.chars[f.pc].name : f.rel || '家族') + 'を置いていけない」と首を振った';
            if (o.goal.id === 'protect' && o.focus && o.focus.alive && !o.focus.out) return o.name + 'は' + o.focus.name + 'のそばに残ると決めていた';
            if (o.goal.id === 'chaos') return o.name + 'は、この混乱の街の方が性に合っていると笑った';
            if (o.tr.ac > 0.6) return o.name + 'は足がすくんで、一歩も動けなかった';
            if (o.tr.np > 0.6) return o.name + 'は「まだ助けを待ってる人がいるよ｜まだ助けを待っている人がいる｜まだ助けを待っている人がいます」と言って残った';
            if (o.tr.a > 0.6) return o.name + 'は「その道は危ないよ｜その道は危険だ｜その道は危険です」と判断して、別の機会を待つことにした';
            return o.name + 'は、ここに残ると言った';
          };
          t += left.map(why1).join('。') + '。'; left.forEach(function (o) { crew.forEach(function (c) { ctx.mod(o, c, { aff: -4, ten: 4 }); }); }); }
        ctx.act2({ actors: crew.concat(left), cat: 'escape', text: t, why: '出口（' + A.name + '）にたどり着いた。脱出の成功率は運・ゾンビの多さ' + (zb.escort && zb.escort.area === A.i ? '・軍人の護衛' : '') + 'で決まる', mag: 45 });
      } else if (rng() < 0.45) {
        crew.forEach(function (c) { ctx.stress(c, 8); });
        zb.failUsed = zb.failUsed || [];
        var fl = ESC.fail.filter(function (t) { return zb.failUsed.indexOf(t) < 0; }); if (!fl.length) { zb.failUsed = []; fl = ESC.fail; }
        var ft = ctx.pick(fl); zb.failUsed.push(ft);
        /* 一番目立つ気質の人が反応する */
        var rx = null, rk = '', rv = 0;
        crew.forEach(function (c) { ['cp', 'np', 'a', 'fc', 'ac'].forEach(function (k) { if (c.tr[k] > rv) { rv = c.tr[k]; rx = c; rk = k; } }); });
        var tail = rx && rv > 0.6 && rng() < 0.7 ? ctx.pick(ESC.react[rk]).replace(/\{a\}/g, rx.name) : '';
        ctx.act2({ actors: crew, cat: 'escape', text: ft.replace(/\{who\}/g, who) + tail, why: '脱出に失敗（' + A.name + 'のゾンビの多さ ' + Math.round(A.z) + '）' + (tail ? '。' + rx.name + 'の' + rk.toUpperCase() + 'が反応に出た' : ''), mag: 14 });
      }
    });
  };

  /* ======================= 咬まれた仲間への反応 ======================= */
  var GR = {
    kill: L('{k}は黙って立ち上がり、{c}の背後に回った。「待って｜待て｜待ってください」と誰かが言うより早く、{w}が振り下ろされた。|「今のうちに終わらせるべきだよ｜今のうちに終わらせるべきだ｜今のうちに終わらせるべきです」――{k}はそう言って、{c}に{w}を向けた。{c}は、目を閉じて頷いた。|{k}は{c}に「ごめん｜すまない｜すみません」と言った。それが、{c}が最後に聞いた言葉だった。'),
    stand: L('{k}が{w}を構えた瞬間、{p}が{c}の前に立ちはだかった。「やるなら、私から先にやって｜やるなら、私から先にやれ｜やるなら、私から先にやってください」――{k}は舌打ちをして、武器を下ろした。|{p}は{c}を背中にかばった。「まだ{c}は{c}だよ｜まだ{c}は{c}だ｜まだ{c}さんは{c}さんです」――{k}と{p}は、しばらく睨み合ったままだった。'),
    fightP: L('{k}と{p}は、{c}をめぐって掴み合いになった。'),
    accept: L('{p}は{c}の隣に座り、咬み跡に包帯を巻き直した。「最後まで一緒にいるよ｜最後まで一緒にいる｜最後まで一緒にいます」|{p}は「その時が来るまで、普通に過ごそう｜＝｜その時が来るまで、普通に過ごしましょう」と言って、{c}の好きだった歌を口ずさんだ。|誰も、{c}を置いていこうとは言わなかった。'),
    leave: L('{who}は、{c}を残して出ていった。扉を閉める前に、誰も振り返らなかった。|翌朝、{c}が目を覚ますと、{who}の荷物は消えていた。')
  };
  function gfill(t, m) { return t.replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  Z.groupReaction = function (ctx, c) {
    var rng = ctx.rng, mates = Z.here(ctx, c);
    if (!mates.length) return;
    var K = null, kv = -9, P = null, pv = -9, leavers = [];
    mates.forEach(function (o) {
      var r = ctx.R(o, c), pf = ctx.pair(o, c);
      var k = o.tr.cold * 0.55 + o.tr.cp * 0.35 + (o.z.know.blood ? 0.25 : 0) + (o.goal.id === 'chaos' ? 0.3 : 0) - r.aff / 90 - o.tr.np * 0.35;
      var p = r.aff / 80 + o.tr.np * 0.5 + (pf.couple || tieT(ctx, o, c) === 'lover' ? 0.6 : 0);
      if (k > kv) { kv = k; K = o; }
      if (p > pv) { pv = p; P = o; }
      if (o.tr.caution > 0.55 && r.aff < 15 && o !== P) leavers.push(o);
    });
    var m = { c: c.name, k: K.name, p: P ? P.name : '', w: wname(K) };
    /* 処分しようとする人が、咬まれた人を「殺さない」にしているなら、処分の場面にしない（かばう・受け入れる・離れるのほうへ） */
    if (kv > 0.3 && rng() < 0.4 + kv * 0.4 && !spare(ctx, c, K)) {
      if (P && P !== K && pv > 0.75) {
        if (K.tr.aggr > 0.6 && rng() < 0.4) {
          var fr = ctx.fight(K, P, { noEvade: true, canSpare: true });
          ctx.act2({ actors: [K, P, c], cat: 'combat', text: gfill(ctx.pick(GR.fightP), m) + fr.text, why: K.name + 'は「今のうちに殺すべき」、' + P.name + 'は「守るよ」。' + fr.why, mag: 40 });
          if (P.alive && fr.winner === P) return;
          if (!P.alive || fr.winner === K) {
            ctx.pair(K, c).zexec = K.i;
            ctx.act2({ actors: [K, c], cat: 'death', text: gfill(ctx.pick(GR.kill), m), why: K.name + 'のドライさ（' + Math.round(K.tr.cold * 100) + '）', mag: 45 });
            ctx.kill(c, K, '発症する前に、' + K.name + 'の手で');
          }
          return;
        }
        ctx.act2({ actors: [K, P, c], cat: 'conflict', fx: function () { ctx.mod2(K, P, { ten: 20 }, { ten: 25, trust: -15 }); ctx.mod(c, P, { aff: 20, trust: 25 }); }, text: gfill(ctx.pick(GR.stand), m), why: P.name + 'の' + c.name + 'への想い（好意 ' + Math.round(ctx.R(P, c).aff) + '）が、' + K.name + 'を止めた', mag: 35 });
        return;
      }
      var mercy = ctx.R(K, c).aff > 25;
      ctx.pair(K, c)[mercy ? 'zmercy' : 'zexec'] = K.i;
      ctx.act2({ actors: [K, c].concat(mates.filter(function (o) { return o !== K; })), cat: 'death', fx: function () { mates.forEach(function (o) { if (o !== K) ctx.mod(o, K, { ten: 15, trust: -10 }); }); }, text: gfill(ctx.pick(GR.kill), m), why: K.name + 'の判断（ドライさ ' + Math.round(K.tr.cold * 100) + '・CP' + (K.z.know.blood ? '・「返り血でも感染するよ」というデマを信じていた' : '') + '）' + (mercy ? '／情のある別れ' : ''), mag: 48 });
      ctx.kill(c, K, mercy ? '発症する前に、' + K.name + 'の手で静かに' : '発症する前に、' + K.name + 'に殺された');
      return;
    }
    if (leavers.length && leavers.length >= mates.length / 2 && !(P && pv > 0.75)) {
      leavers.forEach(function (o) { ctx.pair(o, c).abandoned = o.i; var na = ctx.rng.pick(Z.adj(o.z.area)); o.z.area = na; o.z.path.push(na); });
      ctx.act2({ actors: [c].concat(leavers), cat: 'betray', fx: function () { leavers.forEach(function (o) { ctx.mod(c, o, { aff: -20, trust: -30 }); }); ctx.stress(c, 20); }, text: gfill(ctx.pick(GR.leave), { who: names(leavers), c: c.name }), why: names(leavers) + 'の慎重さ（感染が怖い）', mag: 32 });
      return;
    }
    if (P) ctx.act2({ actors: [P, c], cat: 'help', fx: function () { ctx.mod2(P, c, { aff: 8, trust: 8 }, { aff: 15, trust: 15 }); c.stress = Math.max(0, c.stress - 20); }, text: gfill(ctx.pick(GR.accept), m), why: P.name + 'のNPと' + c.name + 'への好意', mag: 28 });
  };

  /* ======================= 住人どうしの出来事 ======================= */
  function believeRumor(ctx, c) {
    var zb = ctx.zb, rng = ctx.rng, wrong = rng() < ctx.env.rumor / 100 * 0.75;
    var pool = [];
    if (ctx.env.end === 'heli' || rng() < 0.4) pool.push('heliPlace');
    pool.push('safePlace');
    Z.RUMORS.forEach(function (r) { if (!c.z.know[r.id]) pool.push(r.id); });
    var id = rng.pick(pool), text, truth;
    if (id === 'heliPlace') {
      var real = ctx.env.end === 'heli' ? zb.heli : -1, at = !wrong && real >= 0 ? real : rng.pick([2, 5, 7, 8, 4, 0].filter(function (x) { return x !== real; }));
      c.z.heliAt = at; c.z.know.heli = true; truth = at === real;
      text = '「最終日、救助ヘリは' + an(ctx, at) + 'に降りる」';
    } else if (id === 'safePlace') {
      var at2 = !wrong && zb.safe >= 0 ? zb.safe : rng.pick([0, 1, 2, 3, 4, 5, 6, 7, 8].filter(function (x) { return x !== zb.safe; }));
      c.z.safe = at2; truth = at2 === zb.safe;
      text = '「' + an(ctx, at2) + 'はまだ安全らしい」';
    } else {
      var r = Z.RUMORS.filter(function (x) { return x.id === id; })[0];
      c.z.know[id] = true;
      truth = r.truth === 'env' ? (id === 'burn' ? ctx.env.end === 'burn' : ctx.env.end === 'heli') : r.truth;
      if (truth === false && !wrong && rng() < 0.6) { c.z.know[id] = false; return { text: '「' + r.t + '」という書き込みを、{a}はデマだと見抜いた。', truth: true, id: id }; }
      text = '「' + r.t + '」';
    }
    return { text: text + 'という話を、{a}は信じた。', truth: truth, id: id };
  }
  EV.push({
    id: 'z_info', cat: 'solo', scope: 'solo',
    w: function (ctx, a) { return (a.action.id === 'info' ? 1.8 : 0.45) * (ctx.zb.netDown ? 0.45 : 1); },
    run: function (ctx, a) {
      var r = believeRumor(ctx, a);
      var how = ctx.zb.netDown ? ctx.pick(['{a}は手回しラジオのダイヤルを、ゆっくり回した。', '{a}は電柱に貼られた手書きのビラを読んだ。', '{a}は通りすがりの生存者と、短く情報を交換した。']) : ctx.pick(Z.SNS_HOW);
      return { text: ctx.t(how + r.text, a), why: '情報集め' + (r.truth === true ? '（本当の情報）' : r.truth === 'maybe' ? '（真偽不明）' : '（デマ）') + '／情報の錯綜 ' + ctx.env.rumor };
    }
  });
  EV.push({
    id: 'z_tell', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { return (a.z.safe != null && a.z.safe !== b.z.safe) || (a.z.heliAt != null && a.z.heliAt !== b.z.heliAt); },
    w: function (ctx, a, b) { return 0.6 + a.tr.warmth * 0.5 + ctx.R(b, a).trust / 100; },
    run: function (ctx, a, b) {
      var heli = a.z.heliAt != null && a.z.heliAt !== b.z.heliAt, belief = ctx.R(b, a).trust + b.tr.ac * 30 > 25 + ctx.rng() * 40;
      var what = heli ? '救助ヘリは' + an(ctx, a.z.heliAt) + 'に来る' : an(ctx, a.z.safe) + 'は安全だ';
      if (belief) { if (heli) b.z.heliAt = a.z.heliAt; else b.z.safe = a.z.safe; ctx.mod2(a, b, { trust: 3 }, { trust: 5 }); }
      else ctx.mod(b, a, { ten: 3 });
      return { text: ctx.t('{a}は{b}に、「' + what + '」と話した。' + (belief ? '{b}はそれを信じた。' : '{b}は「どこで聞いたの、それ｜どこで聞いたんだ、それ｜どこで聞いたんですか、それ」と眉をひそめた。'), a, b), why: b.name + 'の' + a.name + 'への信頼（' + Math.round(ctx.R(b, a).trust) + '）' };
    }
  });
  /* 物資探し */
  EV.push({
    id: 'z_loot', cat: 'solo', scope: 'solo',
    w: function (ctx, a) { return (a.action.id === 'loot' ? 1.6 : 0.6) + (a.z.food <= 0 ? 1 : 0); },
    run: function (ctx, a) {
      var A = ctx.zb.A[a.z.area], rng = ctx.rng, l = luck(ctx, a);
      var r = rng() + l * 0.08;
      if (A.food > 0 && r < 0.75) {
        var got = Math.min(A.food, 1 + rng.int(2) + (l >= 4 ? 1 : 0)); A.food -= got; a.z.food += got;
        return { cat: 'help', text: ctx.t(rng.pick(['{a}は' + A.name + 'の荒らされた棚の奥から、缶詰を' + got + 'つ見つけた。', '{a}は倒れた自販機をこじ開け、ペットボトルと菓子パンを手に入れた。', '{a}は誰かの置いていったリュックの中に、非常食を見つけた。']), a), why: a.name + 'の運（' + l + '）と' + A.name + 'の残り物資' };
      }
      var W = Z.WEAPONS[ctx.zb.reg];
      if (r > 0.6 && rng() < A.loot) {
        var wl = A.def.guns && rng() < 0.6 ? W.gun : W.loot, w = Z.weapon(rng.pick(wl));
        if (!a.weapon || w.pow > a.weapon.pow) { var old = wname(a); a.weapon = w; return { text: ctx.t('{a}は' + A.name + 'で' + w.name + 'を見つけた。' + old + 'を捨てて、持ち替えた。', a), why: A.name + 'は武器が見つかりやすい（' + Math.round(A.loot * 100) + '）' }; }
      }
      if (A.def.med && r > 0.5 && a.z.wound >= 0) { a.z.wound = -1; a.z.fever = false; a.hp = Math.min(100, a.hp + 12); return { cat: 'help', text: ctx.t('{a}は' + A.name + 'の薬品庫で、抗生物質と包帯を見つけた。', a), why: '病院の医療品' }; }
      if (A.def.med && a.z.drug && a.z.bitten && !a.z.drugDone) {
        a.z.drugDone = true;
        var real = rng() < 0.35;
        if (real) a.z.turnAt += 6;
        return { text: ctx.t('{a}は病院の研究棟で、噂の薬らしいアンプルを見つけ、自分の腕に打った。' + (real ? '……熱が、少しだけ引いた。' : '何も変わらなかった。'), a), why: '噂「病院に発症を遅らせる薬があるんだって」' + (real ? '（効いた：発症が遅れた）' : '（効かなかった）'), mag: 25 };
      }
      ctx.stress(a, 5);
      if (rng() < 0.3) Z.hordeEvent(ctx, [a].concat(Z.here(ctx, a).filter(function (o) { return ctx.R(a, o).trust > 15; })), A);
      return { text: ctx.t(rng.pick((Z.LOOT_NONE || ['{a}は{area}を探し回ったが、食べられるものは何も残っていなかった。']).map(function (x) { return x.replace(/\{area\}/g, A.name); })), a), why: A.name + 'の物資は残り少ない' };
    }
  });
  EV.push({
    id: 'z_barricade', cat: 'solo', scope: 'solo',
    w: function (ctx, a) { return (a.action.id === 'hole' ? 1.5 : 0.4) * (1 - ctx.zb.A[a.z.area].bar); },
    run: function (ctx, a) {
      var A = ctx.zb.A[a.z.area], add = 0.15 + a.tr.a * 0.1 + Z.here(ctx, a).length * 0.05;
      A.bar = Math.min(0.9, A.bar + add);
      return { text: ctx.t(ctx.pick((Z.BARRICADE || ['{a}は{area}の入口に、机と棚を積み上げた。']).map(function (x) { return x.replace(/\{area\}/g, A.name); })), a), why: a.name + 'の慎重さ。籠城しやすさ ' + Math.round(A.bar * 100) + '%' };
    }
  });
  EV.push({
    id: 'z_hunt', cat: 'combat', scope: 'solo',
    when: function (ctx, a) { return a.action.id === 'hunt' || a.tr.aggr > 0.65; },
    w: function (ctx, a) { return a.tr.aggr * 1.2 + (a.action.id === 'hunt' ? 0.8 : 0); },
    run: function (ctx, a) {
      var A = ctx.zb.A[a.z.area], rng = ctx.rng, n = 2 + rng.int(4) + (a.weapon ? Math.round(a.weapon.pow / 2) : 0);
      A.z = Math.max(0, A.z - n); a.z.kills += n;
      if (a.weapon && a.weapon.loud) A.z = Math.min(100, A.z + 8);
      var bit = rng() < 0.06 - luck(ctx, a) * 0.008;
      if (bit) { Z.infect(ctx, a, 'horde', true); return { text: ctx.t('{a}は' + wname(a) + 'で' + n + '体を片づけた。最後の一体の歯が、{a}の手の甲をかすめていた。', a), why: a.name + 'の攻撃性。深追いしすぎた', mag: 30 }; }
      return { text: ctx.t(rng.pick(['{a}は' + wname(a) + 'を手に、' + A.name + 'のゾンビを' + n + '体片づけた。', '{a}は' + A.name + 'の通りで、群れから外れたゾンビを一体ずつ仕留めていった。（' + n + '体）']) + (a.weapon && a.weapon.loud ? '音が、また別の群れを呼んだ。' : ''), a), why: a.name + 'の攻撃性（' + Math.round(a.tr.aggr * 100) + '）と武器「' + wname(a) + '」' };
    }
  });
  /* 食料 */
  EV.push({
    id: 'z_share', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return a.z.food >= 1 && b.z.food <= 0; },
    w: function (ctx, a, b) { return a.tr.np * 1.3 + Math.max(0, ctx.R(a, b).aff) / 60 + (b.z.hunger ? 0.5 : 0); },
    run: function (ctx, a, b) {
      a.z.food--; b.z.food++;
      ctx.mod2(a, b, { aff: 3 }, { aff: 10, trust: 12 });
      return { text: ctx.t(ctx.pick(['{a}は最後の缶詰を開け、半分を{b}に差し出した。', '{a}は「お腹、鳴ってるよ｜腹、鳴ってるぞ｜お腹、鳴っていますよ」と言って、自分のカロリーバーを{b}に放った。', '{a}は{b}が眠っている間に、{b}のリュックにそっと乾パンを入れておいた。']), a, b), why: a.name + 'のNP（' + Math.round(a.eg.NP) + '）／' + b.name + 'の食料が尽きていた' };
    }
  });
  EV.push({
    id: 'z_food_fight', cat: 'conflict', scope: 'pair',
    when: function (ctx, a, b) { return a.z.food <= 0 && b.z.food >= 1 && a.z.hunger >= 1; },
    w: function (ctx, a, b) { return Math.max(0.02 + a.z.hunger * 0.02, a.tr.aggr + a.tr.cold * 0.6 + a.z.hunger * 0.3 - a.tr.np * 0.5 - Math.max(0, ctx.R(a, b).aff) / 60) * (0.5 + ctx.env.strife / 100); },
    run: function (ctx, a, b) {
      var rng = ctx.rng, steal = a.tr.caution > a.tr.aggr;
      /* NPが高くドライさの低い人は、盗まずに頼むか、黙って耐える */
      /* ただし飢えと焦りが限界を超えると、まれに手が出る（らしくない行動） */
      var snap = a.tr.np > 0.6 && a.tr.cold < 0.45 && rng() < 0.06 + a.stress / 500 + a.z.hunger * 0.03;
      if (a.tr.np > 0.6 && a.tr.cold < 0.45 && !snap) {
        if (a.tr.ac > 0.55 || rng() < 0.4) { ctx.stress(a, 10); return { cat: 'solo', text: ctx.t(ctx.pick(['{a}は{b}の缶詰に目をやって、すぐに逸らした。腹が鳴っても、何も言わなかった。', '{a}は空腹を隠して、「平気｜＝｜平気です」と笑ってみせた。{b}は気づかなかった。']), a, b), why: a.name + 'の飢え（' + a.z.hunger + '日）。NPが高く、人のものには手を出せない' }; }
        var give = b.tr.np * 0.6 + Math.max(0, ctx.R(b, a).aff) / 80 + 0.2 > rng();
        if (give) { b.z.food--; a.z.food++; ctx.mod2(a, b, { aff: 8, trust: 6 }, { aff: 4 }); }
        else ctx.mod2(a, b, { ten: 4 }, { ten: 2 });
        return { cat: give ? 'help' : 'bond', text: ctx.t(give ? '{a}は頭を下げて、{b}に少しだけ分けてもらえないか頼んだ。{b}は黙って缶詰を半分渡した。' : '{a}は{b}に、食べ物を少し分けてほしいと頼んだ。{b}は首を振った。{a}はそれ以上言わなかった。', a, b), why: a.name + 'の飢え（' + a.z.hunger + '日）。盗まずに頼んだ（NP）。' + b.name + 'は' + (give ? '応じた（NP・好意）' : '応じなかった') };
      }
      if (steal) {
        var caught = rng() < b.tr.caution * 0.6 + b.tr.a * 0.3;
        b.z.food--; if (!caught) a.z.food++;
        ctx.mod2(a, b, { ten: 5 }, caught ? { ten: 25, trust: -30, aff: -12 } : { trust: -5 });
        return { cat: 'betray', text: ctx.t(caught ? '夜中、{a}は{b}のリュックに手を入れた。その手首を、{b}が掴んだ。「……何してるの｜……何をしている｜……何をしているんですか」' : '{a}は{b}が眠っている隙に、{b}の缶詰を一つ抜き取った。{b}は朝、首を傾げていた。', a, b), why: a.name + 'の飢え（' + a.z.hunger + '日）と慎重さ' + (caught ? '／' + b.name + 'が気づいた' : '') + (snap ? '。NPの高い' + a.name + 'には、らしくない行動（飢えと焦り ' + Math.round(a.stress) + '）' : ''), odd: snap };
      }
      if (rng() < 0.35 + a.tr.aggr * 0.3 && b.tr.aggr > 0.4) {
        var fr = ctx.fight(a, b, { lethality: 0.9 });
        if (fr.winner === a && b.alive) { a.z.food += b.z.food; b.z.food = 0; }
        return { cat: 'combat', text: ctx.t('{a}は{b}に「食べ物、よこして｜食い物をよこせ｜食べ物を、渡してください」と詰め寄った。{b}が拒むと、{a}は掴みかかった。', a, b) + fr.text, why: a.name + 'の飢え（' + a.z.hunger + '日）と攻撃性。' + fr.why + (snap ? '。NPの高い' + a.name + 'には、らしくない行動' : ''), mag: 30, odd: snap };
      }
      b.z.food--; a.z.food++;
      ctx.mod2(a, b, { ten: 6 }, { ten: 18, aff: -10, trust: -15 });
      return { text: ctx.t('{a}は{b}に' + wname(a) + 'を向けて、食料を一つ出させた。「恨まないでね。お腹が減ってるの｜恨むなよ。腹が減ってるんだ｜恨まないでください。お腹が減っているんです」', a, b), why: a.name + 'の飢えと攻撃性' };
    }
  });
  /* この混乱に乗じて、邪魔な相手を消す */
  var MURDER = L('{a}は、{b}を群れのいる路地へ誘い込んだ。「こっち｜こっちだ｜こちらです」――{a}だけが、引き返してきた。|{a}は、{b}と二人きりになるのを待っていた。屋上の縁で、{a}は{b}の背中を押した。|「ゾンビかと思った｜＝｜ゾンビかと思いました」――{a}はそう言うつもりで、{b}に' + '{wa}' + 'を向けた。|{a}は眠っている{b}の部屋の外から、そっと鍵をかけた。窓の外には、群れが集まり始めていた。');
  EV.push({
    id: 'z_murder', cat: 'betray', dk: 'kill', scope: 'pair',
    when: function (ctx, a, b) {
      var r = ctx.R(a, b), t = tieT(ctx, a, b);
      return (r.ten > 45 || t === 'enemy' || t === 'rival' || a.goal.id === 'chaos') && r.aff < 15 && a.tr.cold + a.tr.aggr > 1.0 && !ctx.pair(a, b).couple && !spare(ctx, b, a);
    },
    w: function (ctx, a, b) { var r = ctx.R(a, b), wit = Z.here(ctx, a).length - 1; return (0.25 + r.ten / 70 + (a.goal.id === 'chaos' ? 0.7 : 0) + (['enemy', 'rival'].indexOf(tieT(ctx, a, b)) >= 0 ? 0.5 : 0)) / (1 + wit * 0.8) * (0.4 + ctx.env.strife / 80); },
    run: function (ctx, a, b) {
      var rng = ctx.rng, wit = Z.here(ctx, a).filter(function (o) { return o !== b; });
      var t = ctx.t(ctx.pick(MURDER), a, b);
      var why = a.name + 'の、' + b.name + 'への緊張（' + Math.round(ctx.R(a, b).ten) + '）とドライさ・攻撃性' + (a.goal.id === 'chaos' ? '／目標「この混乱を利用する｜＝｜この混乱を利用します」' : '') + '。この街では、誰が死んでもゾンビのせいにできる';
      if (b.tr.caution * rng() > 0.45) {
        ctx.mod2(a, b, { ten: 10 }, { ten: 40, trust: -50, aff: -30 });
        return { text: t + ctx.t('――だが{b}は寸前で気づき、逃げ延びた。{b}はもう、{a}に背中を見せない。', a, b), why: why + '／' + b.name + 'の慎重さ', mag: 35 };
      }
      ctx.pair(a, b).zmurder = a.i;
      ctx.kill(b, a, 'この混乱に紛れて、' + a.name + 'に殺された');
      var seen = wit.filter(function (o) { return o.tr.a + o.tr.caution > 1.0 && rng() < 0.5; })[0];
      if (seen) { ctx.mod(seen, a, { ten: 35, trust: -45 }); ctx.pair(seen, a).sawMurder = true; t += ctx.t('――{c}だけが、それを見ていた。', a, b, seen); }
      return { text: t, why: why, with: seen ? [seen] : null, mag: 50 };
    }
  });
  /* 隠された咬み跡に気づく */
  EV.push({
    id: 'z_notice', cat: 'conflict', scope: 'pair',
    when: function (ctx, a, b) { return b.z.hiding && b.z.bitten && !b.z.exposed; },
    w: function (ctx, a) { return 0.6 + a.tr.a + a.tr.caution * 0.6; },
    run: function (ctx, a, b) {
      var rng = ctx.rng, r = ctx.R(a, b);
      b.z.exposed = true;
      if (r.aff > 45 && rng() < 0.55) {
        ctx.pair(a, b).secret = true; ctx.mod2(a, b, { trust: 5 }, { trust: 20, aff: 10 });
        return { cat: 'help', text: ctx.t('{a}は{b}の袖の下の咬み跡に気づいた。{a}は何も言わずに、新しい包帯を{b}に渡した。「……皆には、言わない｜＝｜……皆には、言いません」', a, b), why: a.name + 'の観察眼（A・慎重さ）と、' + b.name + 'への好意（' + Math.round(r.aff) + '）', mag: 30 };
      }
      b.z.hiding = false;
      var t = ctx.t('{a}は{b}の腕を掴んで、袖をまくり上げた。そこには、黒ずんだ咬み跡があった。{a}は低く訊いた。「いつから？｜いつからだ｜いつからですか」', a, b);
      ctx.mod2(a, b, { ten: 20, trust: -20 }, { ten: 15 });
      ctx.pending = (ctx.pending || []);
      setTimeout0(ctx, function () { Z.groupReaction(ctx, b); });
      return { text: t, why: a.name + 'の観察眼（A・慎重さ）。' + b.name + 'は咬み跡を隠していた', mag: 32 };
    }
  });
  /* 出来事のあとで続けて起きること（同じ区切りのうちに） */
  function setTimeout0(ctx, fn) { (ctx.zb.later = ctx.zb.later || []).push(fn); }
  Z.later = setTimeout0;
  var after0 = scen.after;
  scen.after = function (ctx, s, n) {
    var L0 = ctx.zb.later || []; ctx.zb.later = [];
    L0.forEach(function (fn) { fn(); });
    after0(ctx, s, n);
  };

  /* 傷の手当て・慰め・見張り・恋 */
  EV.push({
    id: 'z_treat', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return b.z.wound >= 0 && !b.z.bitten; },
    w: function (ctx, a, b) { return a.tr.np + a.tr.a * 0.5; },
    run: function (ctx, a, b) {
      var ok = ctx.rng() < 0.35 + a.tr.a * 0.3 + a.tr.np * 0.2;
      if (ok) { b.z.wound = -1; b.z.fever = false; b.hp = Math.min(100, b.hp + 8); }
      ctx.mod2(a, b, { aff: 3 }, { aff: 8, trust: 10, att: 2 });
      return { text: ctx.t(ok ? '{a}は沸かした湯で{b}の傷口を洗い、きつく縛り直した。「化膿させないでね｜化膿させるなよ｜化膿させないでくださいね」' : '{a}は{b}の傷に、ありったけの消毒液をかけた。{b}は歯を食いしばった。腫れは、引かなかった。', a, b), why: a.name + 'の手当て（NP・A）' + (ok ? '' : '／道具が足りなかった') };
    }
  });
  EV.push({
    id: 'z_comfort', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return b.stress > 55; },
    w: function (ctx, a, b) { return a.tr.np * 0.9 + Math.max(0, ctx.R(a, b).aff) / 70; },
    run: function (ctx, a, b) {
      b.stress = Math.max(0, b.stress - 18 - a.tr.np * 10);
      ctx.mod2(a, b, { aff: 4 }, { aff: 8, trust: 8 });
      return { text: ctx.t(ctx.pick(['{b}の手が震えて止まらなかった。{a}はその手を、自分の両手で包んだ。', '{a}は{b}の隣に座り、何も言わずに肩を貸した。{b}は、ようやく少しだけ眠った。', '{a}は{b}に、この街を出たら何を食べたいかを訊いた。{b}は泣きながら笑って、「ラーメン」と答えた。']), a, b), why: b.name + 'の追い詰められ方（焦り ' + Math.round(b.stress) + '）／' + a.name + 'のNP' };
    }
  });
  EV.push({
    id: 'z_watch', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { return Z.part(ctx) === 3 && HK.canLove(a, b); },
    w: function (ctx, a, b) { return 0.4 + ctx.R(a, b).att / 60 + ctx.R(b, a).att / 90; },
    run: function (ctx, a, b) {
      ctx.mod2(a, b, { att: 6, aff: 4, trust: 4 }, { att: 6, aff: 4, trust: 4 });
      return { text: ctx.t(ctx.pick(['見張りの番が、{a}と{b}に回ってきた。二人は肩を寄せ合い、窓の外の闇を見つめながら、小声で昔の話をした。', '停電の夜、{a}と{b}は一本の懐中電灯を二人で持った。消してしまえば、互いの息遣いしか聞こえなかった。', '{a}は見張り中にうとうとした{b}の頭を、そっと自分の肩に乗せた。']), a, b), why: '夜の見張り（惹かれ ' + Math.round(ctx.R(a, b).att) + '）' };
    }
  });
  EV.push({
    id: 'z_last', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { var r = ctx.R(a, b); return HK.canLove(a, b) && r.att > 34 && r.aff > 15 && !ctx.pair(a, b).couple && !ctx.pair(a, b).zconf && (!HK.Poly || HK.Poly.canTry(ctx, a, b)) && (a.stress > 45 || a.z.bitten); },
    w: function (ctx, a) { return 0.6 + a.tr.honesty + (a.z.bitten ? 1 : 0); },
    run: function (ctx, a, b) {
      var rb = ctx.R(b, a), yes = rb.att > 28 && rb.aff > 15, pf = ctx.pair(a, b);
      pf.zconf = true;
      if (yes) { pf.couple = true; ctx.mod2(a, b, { aff: 12, trust: 10, att: 8 }, { aff: 12, trust: 10, att: 8 }); }
      else ctx.mod2(a, b, { att: -4 }, { aff: 4 });
      var t = a.z.bitten ? '{a}は咬み跡を隠したまま、{b}に言った。「死ぬ前に、言っておきたかった。好きだった｜＝｜死ぬ前に、言っておきたかったんです。好きでした」' : ctx.pick(['「どうせ明日死ぬかもしれないなら｜＝｜どうせ明日死ぬかもしれませんから」――{a}は{b}に、ずっと言えなかったことを言った。', '{a}は、崩れかけたビルの非常階段で、{b}に好きだと言った。']);
      return { text: ctx.t(t + (yes ? '{b}は返事の代わりに、{a}を強く抱きしめた。' : '{b}は「生き延びたら、もう一回言って｜生き延びたら、もう一度言え｜生き延びたら、もう一度言ってください」と答えた。'), a, b), why: '追い詰められた状況で、' + a.name + 'の本音（本音の出やすさ ' + Math.round(a.tr.honesty * 100) + '）が出た', mag: 30 };
    }
  });
  /* 落ち着いた時間の告白（z_last は追い詰められたとき。こちらは見張りの合間・隠れ家の夜など、ふだんの気持ちが育ったとき）。
     起こりやすさは恋愛の出来事として「恋愛の起こりやすさ」に連動する */
  /* 恋愛の起こりやすさ（既定50）が高いほど、告白に踏み切る・受け入れる気持ちの敷居が下がる */
  function romShift(ctx) { return ctx.env.romance == null ? 0 : (ctx.env.romance - 50) / 50; }
  EV.push({
    id: 'z_confess', cat: 'romance', scope: 'pair',
    when: function (ctx, a, b) { var r = ctx.R(a, b), pf = ctx.pair(a, b), d = romShift(ctx); return HK.canLove(a, b) && r.att > 38 - d * 12 && r.aff > 20 - d * 10 && !pf.couple && !pf.zconf && (!HK.Poly || HK.Poly.canTry(ctx, a, b)) && !pf.kin && !HK.lockOut(a, b); },
    w: function (ctx, a, b) { return 0.35 + a.tr.honesty * 0.8 + ctx.R(a, b).att / 120; },
    run: function (ctx, a, b) {
      var d = romShift(ctx), rb = ctx.R(b, a), yes = rb.att > 30 - d * 10 && rb.aff > 15 - d * 8 && !HK.lockOut(b, a), pf = ctx.pair(a, b);
      pf.zconf = true;
      if (yes) { pf.couple = true; ctx.mod2(a, b, { aff: 10, trust: 8, att: 8 }, { aff: 10, trust: 8, att: 8 }); }
      else { ctx.mod2(a, b, { att: -4 }, { aff: 2 }); ctx.stress(a, 10); }
      var t = ctx.pick(['見張りの交代のとき、{a}は{b}の隣に座ったまま言った。「こんな時に言うことじゃないけど……好き｜こんな時に言うことじゃないが……好きだ｜こんな時に言うことじゃないですけど……好きです」', '隠れ家の暗がりで、{a}は{b}にだけ聞こえる声で言った。「生き延びたら、じゃなくて、今言っておきたい。好き｜生き延びたら、ではなく、今言っておきたい。好きだ｜生き延びたら、ではなくて、今言っておきたいです。好きです」', '缶詰を分け合いながら、{a}はふと手を止めた。「……{b}のこと、ずっと見てた｜……{b}のことを、ずっと見ていた｜……{b}さんのこと、ずっと見ていました」']);
      return { text: ctx.t(t + (yes ? ctx.pick(['{b}は少し黙ってから、{a}の手を握り返した。', '{b}は「知ってた｜知っていた｜知っていました」と小さく笑って、{a}の肩に頭を預けた。']) : ctx.pick(['{b}は困ったように目を伏せた。「今は、生き延びることしか考えられない｜＝｜今は、生き延びることしか考えられません」', '{b}は答えず、見張りの窓の外へ目をやった。'])), a, b), why: a.name + 'の惹かれ（' + Math.round(ctx.R(a, b).att) + '）と本音の出やすさ。' + b.name + 'の惹かれ（' + Math.round(rb.att) + '）・好意（' + Math.round(rb.aff) + '）', mag: yes ? 28 : 18 };
    }
  });
  EV.push({
    id: 'z_close', cat: 'romance', sex: true, scope: 'pair',
    when: function (ctx, a, b) { var pf = ctx.pair(a, b); return HK.canLove(a, b) && HK.canLove(b, a) && (pf.couple || (ctx.R(a, b).att > 40 && ctx.R(b, a).att > 36)) && !pf.zclose; },
    w: function (ctx, a, b) { return 0.5 + ctx.R(a, b).att / 80 + (Z.part(ctx) === 3 ? 0.6 : 0); },
    run: function (ctx, a, b) {
      var pf = ctx.pair(a, b); pf.zclose = true; pf.night = true;
      ctx.mod2(a, b, { att: 8, aff: 8, trust: 6 }, { att: 8, aff: 8, trust: 6 });
      return { text: ctx.t(ctx.pick(['生きていることを確かめるように、{a}は{b}に口づけた。その夜、二人はバリケードの内側で、互いの体温だけを頼りに眠った。', '{b}が「怖い｜＝｜怖いです」とこぼした。{a}は{b}を抱き寄せ、朝まで離さなかった。', '{a}と{b}は、誰もいない屋上で手を繋いで、燃える街を眺めていた。どちらからともなく、唇が重なった。']), a, b), why: '極限状態で、互いの惹かれ（' + Math.round(ctx.R(a, b).att) + '／' + Math.round(ctx.R(b, a).att) + '）が溢れた', mag: 24 };
    }
  });
  EV.push({
    id: 'z_plan', cat: 'conflict', scope: 'pair',
    when: function (ctx, a, b) { return a.goal.id !== b.goal.id && (a.goal.id === 'escape' || b.goal.id === 'escape' || a.goal.id === 'family'); },
    w: function (ctx, a) { return 0.35 + a.tr.lead * 0.6; },
    run: function (ctx, a, b) {
      var rng = ctx.rng, win = a.tr.lead + ctx.R(b, a).trust / 100 > b.tr.lead + rng() * 0.6;
      if (win && b.goal.id !== 'family' && b.goal.id !== 'chaos') { var from = b.goal.label; b.goal = a.goal; ctx.mod2(a, b, { trust: 4 }, { trust: 4 }); return { cat: 'bond', text: ctx.t('{a}は{b}を説得した。「' + a.goal.label + '。それしかない」――{b}は、少し考えてから頷いた。', a, b) + b.name + 'の目標が変わった：「' + from + '」→「' + b.goal.label + '」', why: a.name + 'の主導性と、' + b.name + 'からの信頼', mag: 12 }; }
      ctx.mod2(a, b, { ten: 8 }, { ten: 8 });
      return { text: ctx.t('{a}と{b}は、これからどうするかで言い争いになった。{a}は「' + a.goal.label + '」、{b}は「' + b.goal.label + '」。どちらも譲らなかった。', a, b), why: '目標の違い' };
    }
  });
  EV.push({
    id: 'z_weapon_give', cat: 'help', scope: 'pair',
    when: function (ctx, a, b) { return a.weapon && b.weapon && a.weapon.pow >= b.weapon.pow + 3; },
    w: function (ctx, a, b) { return a.tr.np * 0.6 + Math.max(0, ctx.R(a, b).aff) / 70; },
    run: function (ctx, a, b) {
      var w = a.weapon; a.weapon = b.weapon; b.weapon = w;
      ctx.mod2(a, b, { aff: 3 }, { aff: 10, trust: 12 });
      return { text: ctx.t('{a}は自分の' + w.name + 'を{b}に押しつけた。「あなたのほうが危なっかしいよ。持ってて｜あなたのほうが危なっかしい。持ってろ｜あなたのほうが危なっかしいです。持っていてください」', a, b), why: a.name + 'のNPと、' + b.name + 'への好意' };
    }
  });

  /* ======================= 小さな出来事 ======================= */
  var E = HK.E;
  HK.addMini('zombie', [
    E('z_m_hide', 'solo', 's+', 'caution*.6+.1', '', 'as:3', '{a}は押し入れの中で膝を抱え、外を歩く足音が遠ざかるのを待った。|{a}は浴槽に身を沈め、蓋の隙間から息をした。|{a}は車の後部座席に毛布をかぶって横たわり、窓の外を通る影を数えた。|{a}はスーパーの冷凍庫の中に隠れた。寒さで歯が鳴るのを、必死に抑えた。|{a}は駐車場の車の下に潜り込み、近づいてくる足を見つめていた。|{a}は試着室のカーテンの陰で、息を止めた。|{a}は公衆トイレの天井の点検口から、天井裏に逃げ込んだ。'),
    E('z_m_noise', 'solo', 's+', 'caution*.4+stress/150', '', 'as:6', '{a}は、どこかで鳴り続ける防犯ブザーの音に耳を塞いだ。|{a}は、隣の部屋から聞こえる爪の音に、ずっと身を固くしていた。|{a}の背後で、空き缶が転がる音がした。振り向いても、誰もいなかった。|{a}は、遠くで誰かが助けを呼ぶ声を聞いた。行くべきか迷っているうちに、声は聞こえなくなった。|{a}は、壁越しに聞こえる規則正しいノックの音に、一晩中眠れなかった。|{a}は、どこかで犬が吠え続けるのを聞いていた。急に、吠えなくなった。'),
    E('z_m_photo', 'solo', 's+', 'np*.4+ac*.3', '', 'as:4', '{a}はスマホの写真フォルダを遡った。三日前の自分は、こんな日が来るなんて思っていなかった。|{a}は財布に入れていた古い写真を、何度も見返した。|{a}は、録音しておいた誰かの声を、音量を最小にして聞いた。|{a}は、スマホに残った最後の写真を見た。ランチの写真だった。|{a}は、誰かの家で見つけたアルバムを、つい最後までめくってしまった。|{a}は、写真の中の笑っている自分に、「呑気だね｜呑気だな｜呑気ですね」と言った。'),
    E('z_m_tv', 'solo', 's+', 'a*.4+.15', '', 'as:5', '{a}は電池式のテレビで、同じ避難の呼びかけが流れ続けるのを見ていた。キャスターの声が、途中で途切れた。|{a}は警察無線の周波数に合わせたラジオで、「全隊、撤退」という声を聞いた。|{a}はラジオで、聞き覚えのある地名が「封鎖区域」と呼ばれるのを聞いた。|{a}は電池式のテレビをつけた。映ったのは、誰もいないスタジオだった。|{a}は防災無線の「ただちに避難してください」という放送が、三日前から同じ録音であることに気づいた。|{a}はテレビの砂嵐を、しばらくぼんやりと眺めていた。'),
    E('z_m_dark', 'solo', 's+', 'fc*.4+cold*.3', '', 'as:-4', '{a}は、ゾンビ映画の主人公ならここでどうするか考えて、少しだけ笑った。|{a}は、「出勤しなくていいんだ｜出勤しなくていい｜出勤しなくていいんですね」という事実だけは、少し嬉しかった。|{a}は、ゾンビ映画の知識が意外と役に立つことに、複雑な気持ちになった。|{a}は、終わったら絶対に誰かに自慢してやる、と思った。生き延びた話ほど、いい自慢はない。|{a}は、明日の会議の資料がもう誰にも必要ないことを思って、変な笑いが出た。|{a}は、ゾンビにあだ名をつけて気を紛らわせた。今日見かけた中では「スーツ」がいちばんしつこかった。|{a}は「ローンの支払いも、もう関係ないね｜ローンの支払いも、もう関係ないな｜ローンの支払いも、もう関係ありませんね」と呟いて、少しだけ笑った。'),
    E('z_m_pray', 'solo', 's+', 'ac*.5+np*.2', '', 'as:-5', '{a}は、信じたこともない神様に祈った。|{a}は、子どもの頃に覚えた歌を、声に出さずに歌った。|{a}は、お守りを握りしめて目を閉じた。|{a}は、誰に祈ればいいのか分からないまま、手を合わせた。|{a}は、空に向かって「頼むよ｜頼む｜お願いします」とだけ言った。|{a}は、神社の鳥居の前で、ためらいながら一礼した。'),
    E('z_m_body', 'solo', 's+', 'np*.3+ac*.3+.1', '', 'as:8', '{a}は、通りに倒れた誰かの顔に、自分のジャケットをかけた。|{a}は、ベビーカーが一つ転がっているのを見て、目を逸らした。|{a}は、通りに散らばった誰かの買い物袋を見て、その人の夕飯の献立を考えてしまった。|{a}は、乗り捨てられた車の中に、チャイルドシートが空のまま残っているのを見た。|{a}は、壁に残る誰かの手形を見ないようにして、足を速めた。|{a}は、倒れていた誰かの手から、握られたままのスマホをそっと外した。画面には、まだ通話中の表示が残っていた。'),
    E('z_m_rest', 'solo', 's+', 'caution*.3+stress/100', '', 'as:-8;ahp:4', '{a}は鍵のかかる部屋を見つけて、二時間だけ泥のように眠った。|{a}は屋上の給水タンクの陰で、少しだけ目を閉じた。|{a}は誰もいない保健室のベッドで、靴を履いたまま横になった。|{a}はコインランドリーの乾燥機に背を預けて、少しだけうとうとした。|{a}は銀行の金庫室に入り込み、重い扉を閉めて、久しぶりに深く眠った。|{a}は図書館の書庫の奥で、本を枕にして眠った。'),
    E('z_m_rain', 'solo', 's+', '.2', '', 'as:-2', '雨が降り出した。{a}は空き缶で雨水を受けながら、雨音がゾンビの呻き声を消してくれることに感謝した。|雨が降り出した。{a}は軒下で雨音を聞きながら、少しだけ目を閉じた。|雨の中、{a}はビニール傘を差して歩いた。こんな日でも、傘を差す自分がおかしかった。|激しい雨が、通りの血を洗い流していった。{a}は窓越しに、それをずっと見ていた。|雨上がりの水たまりに、青空が映っていた。{a}は、それを踏まずに避けて歩いた。'),
    E('z_m_note', 'solo', 's+', 'a*.3+ac*.3', '', 'as:-2', '{a}は手帳に、今日生き延びた理由を書き出した。三つ目で、ペンが止まった。|{a}は壁に、生存者向けの伝言を書き残した。「' + '{a}' + '、生きてます」|{a}は手帳に、今日すれ違った生存者の特徴を書き留めた。いつか、誰かの役に立つかもしれない。|{a}は、地図の余白に「ここに水あり」と書き込んだ。|{a}は、避難所の伝言板に貼られた無数の紙の中に、知っている名前を探した。'),
    E('z_m_talk', 'bond', 'p+', 'warmth*.5+.15', '', 'ab:aff4,trust3;ba:aff4,trust3', '{a}と{b}は、小声で好きな食べ物の話をした。話しているあいだだけは、外の呻き声が聞こえなかった。|{a}は{b}に、この騒ぎが始まった日のことを話した。{b}も、自分の三日前のことを話した。|{a}と{b}は、生き延びたら何をするかを順番に言い合った。'),
    E('z_m_joke', 'bond', 'p+', 'fc*.6', '', 'ab:aff4;ba:aff5;bs:-6', '{a}が「この状況、絶対あとでネタになるね｜この状況、絶対あとでネタになるな｜この状況、絶対あとでネタになりますね」と言い、{b}は不謹慎だと言いながら吹き出した。|{a}はゾンビの歩き方を真似して、{b}に本気で怒られた。それから二人で、声を殺して笑った。'),
    E('z_m_snap', 'conflict', 'p+', 'stress/90+cp*.3', 'stress>50', 'ab:ten8;ba:ten8,aff-3', '{a}は{b}の足音がうるさいと怒鳴った。怒鳴った声のほうが、ずっとうるさかった。|{b}が「大丈夫だよ｜大丈夫だ｜大丈夫ですよ」と言うと、{a}は噛みついた。「何が大丈夫なの｜何が大丈夫なんだ｜何が大丈夫なんですか」'),
    E('z_m_watchtrust', 'bond', 'p+', 'a*.3+lead*.3', '', 'ab:trust6;ba:trust6', '{a}と{b}は、合図の決め方を決めた。口笛二回で「逃げて｜逃げろ｜逃げてください」。|{a}は{b}に、はぐれたときの集合場所を決めておこうと言った。'),
    E('z_m_suspect', 'conflict', 'p+', 'caution*.4+jealous*.3', 'trust<20', 'ab:ten8,trust-4', '{a}は眠ったふりをしながら、{b}の様子を窺っていた。|{a}は{b}の咳を聞くたびに、そっと武器に手を伸ばした。'),
    E('z_m_carry', 'help', 'p+', 'np*.5+#hp/10', '', 'ba:aff6,trust6;bhp:4', '{a}は足を引きずる{b}に肩を貸して、階段を上がった。|{a}は{b}の重い荷物を、黙って自分のリュックに移した。'),
    E('z_m_hand', 'romance', 'p+', 'att/60+np*.2', 'love>0', 'ab:att5;ba:att5', '逃げるとき、{a}は{b}の手を掴んでいた。安全な場所に着いても、どちらもその手を離さなかった。|{a}は{b}の頬についた煤を、指でぬぐった。'),
    E('z_m_cover', 'help', 'p+', 'np*.4+aggr*.3', '', 'ba:trust8,aff4', '{a}は{b}の背後に迫っていたゾンビを、間一髪で叩き伏せた。|{a}は{b}に「下がってて｜下がってろ｜下がっていてください」と言って、扉の前に立った。'),
    E('z_m_blame', 'conflict', 'p+', 'cp*.5+stress/120', '', 'ab:ten8;ba:ten10,aff-4', '{a}は{b}が物音を立てたせいで群れに見つかったと責めた。|{a}は「あなたが来なければ、あの人は死ななかった｜あなたが来なければ、あいつは死ななかった｜あなたが来なければ、あの人は死ななかったんです」と{b}に言った。言ってから、後悔した。')
  ]);

  /* ======================= 関係の判定 ======================= */
  var LB = HK.LABELS;
  /* 心中は執着の仕組み（obsess-kit.js・中核）が HK.LABELS.shinju（殺害の札）を持つ。ゾンビの心中は自分の札 zshinju を足し、
     共有の表の鍵を上書きしない（上書きすると、ゾンビのかたまりを読んだかどうかでほかの箱庭の心中の札が変わる） */
  LB.zshinju = { name: '心中', cls: 'obsess', pol: 0 };
  LB.zmercy = { name: '情けの一撃', cls: 'kill', pol: -1 };
  LB.zexec = { name: '発症前に殺した', cls: 'kill', pol: -2 };
  LB.zkill = { name: 'ゾンビになって喰らった', cls: 'kill', pol: -2 };
  LB.zbite = { name: 'ゾンビになって咬んだ', cls: 'kill', pol: -2 };
  LB.putdown = { name: 'とどめを刺した', cls: 'obsess', pol: -1 };
  LB.sacrifice = { name: '身代わり', cls: 'guard', pol: 2 };
  LB.zabandon = { name: '見捨てた', cls: 'enemy', pol: -2 };
  LB.zbait = { name: '囮にした', cls: 'kill', pol: -2 };
  LB.zmurder = { name: '混乱に紛れて殺した', cls: 'kill', pol: -2 };
  LB.zparted = { name: '死に別れ', cls: 'pine', pol: 1 };
  scen.classifyFirst = function (ctx, A, B, pf) {
    var d = function (i) { return i; };
    if (pf.shinju) return { id: 'zshinju' };
    if (pf.zkill != null) return { id: 'zkill', dir: d(pf.zkill) };
    if (pf.zbite != null) return { id: 'zbite', dir: d(pf.zbite) };
    if (pf.zmercy != null) return { id: 'zmercy', dir: d(pf.zmercy) };
    if (pf.zexec != null) return { id: 'zexec', dir: d(pf.zexec) };
    if (pf.zmurder != null) return { id: 'zmurder', dir: d(pf.zmurder) };
    if (pf.bait != null) return { id: 'zbait', dir: d(pf.bait) };
    if (pf.putdown != null) return { id: 'putdown', dir: d(pf.putdown) };
    if (pf.sacrifice != null) return { id: 'sacrifice', dir: d(pf.sacrifice) };
    if (pf.abandoned != null) return { id: 'zabandon', dir: d(pf.abandoned) };
    /* 想い合っていたのに、どちらかが死んだ・ゾンビになった */
    var lov = function (x, y) { var r = ctx.R(x, y); return r.aff > 35 && r.att > 38; };
    if ((!A.alive || !B.alive) && (pf.couple || tieT(ctx, A, B) === 'lover' || (lov(A, B) && lov(B, A)))) return { id: 'zparted' };
    return null;
  };
  scen.pairText = function (ctx, A, B, cl) {
    var n = function (i) { return ctx.chars[i].name; }, o = function (i) { return i === A.i ? B.name : A.name; };
    switch (cl.id) {
      case 'zshinju': return '咬まれた一人と、それを一人にできなかった一人。二人は一緒に逝くことを選んだ。';
      case 'zkill': return 'ゾンビになった' + n(cl.dir) + 'が、' + o(cl.dir) + 'を喰い殺した。';
      case 'zbite': return 'ゾンビになった' + n(cl.dir) + 'が、' + o(cl.dir) + 'に咬みついた。';
      case 'zmercy': return n(cl.dir) + 'は、' + o(cl.dir) + 'を一人にしないために、自分の手で終わらせた。';
      case 'zexec': return '咬まれた' + o(cl.dir) + 'を、' + n(cl.dir) + 'が発症前に殺した。';
      case 'zmurder': return n(cl.dir) + 'は、この混乱に紛れて' + o(cl.dir) + 'を殺した。';
      case 'zbait': return n(cl.dir) + 'は、' + o(cl.dir) + 'をゾンビの群れへの囮にした。';
      case 'putdown': return 'ゾンビになった' + o(cl.dir) + 'を、' + n(cl.dir) + 'が自分の手で眠らせた。';
      case 'sacrifice': return n(cl.dir) + 'は、' + o(cl.dir) + 'の身代わりになった。';
      case 'zabandon': return n(cl.dir) + 'は、' + o(cl.dir) + 'を見捨てて逃げた。';
      case 'zparted': var dd = !A.alive ? A : B, lv = dd === A ? B : A; return '想い合っていた二人は、' + dd.name + (dd.fate === 'ゾンビ化' ? 'がゾンビになったことで' : 'の死で') + '引き裂かれた。' + (lv.alive ? lv.name + 'は生き延びた。' : '');
    }
    return null;
  };
  scen.charNote = function (ctx, c) {
    var z = c.z, f = z.family, path = z.path.filter(function (v, i, a) { return i === 0 || a[i - 1] !== v; }).map(function (i) { return an(ctx, i); });
    var t = '足取り：' + path.join('→') + '　武器：' + wname(c) + (z.kills ? '　倒したゾンビ ' + z.kills + '体' : '');
    if (f && f.pc == null) t += '　家族：' + f.rel + '（' + (f.inside ? '街の中' : '街の外') + (f.found ? '・' + { ok: '合流できた', zombie: 'ゾンビになっていた', dead: '亡くなっていた' }[f.state] : f.heard ? '・悪い知らせが届いた' : '') + '）';
    if (z.cut) t += '　咬まれた腕を処置して助かった';
    if (c.goalHist && c.goalHist.length) t += '　目標の変化：' + c.goalHist.map(function (g) { return GOAL[g] ? GOAL[g].label : (g && g.label) || String(g); }).join('→');
    var rum = [];
    if (z.safe != null) rum.push('「' + an(ctx, z.safe) + 'は安全」' + (z.safe === ctx.zb.safeOrig ? '（本当）' : '（デマ）'));
    if (z.heliAt != null) rum.push('「ヘリは' + an(ctx, z.heliAt) + '」' + (ctx.env.end === 'heli' && z.heliAt === ctx.zb.heli ? '（本当）' : '（デマ）'));
    if (z.know.blood) rum.push('「返り血でも感染」（デマ）');
    if (rum.length) t += '　信じた噂：' + rum.join('・');
    return t;
  };

  /* ======================= 結末 ======================= */
  HK.Endings.zombie = function (res, X) {
    var Zr = res.end.zombie || {}, n = X.C.length;
    var resc = X.byFate(/救助/), esc = X.byFate(/脱出/), live = X.byFate(/生き延びた/), zomb = X.byFate(/ゾンビ/), dead = X.C.filter(function (c) { return !c.alive && !/ゾンビ/.test(c.fate); });
    var surv = resc.length + esc.length + live.length;
    var head = surv ? Zr.days + '日間を生き延びたのは' + X.names(resc.concat(esc, live)) + '。' + (resc.length ? '救助ヘリに乗れたのは' + X.names(resc) + '。' : '') + (esc.length ? '自力で街を出たのは' + X.names(esc) + '。' : '')
      : '誰も、' + Zr.days + '日目の朝を迎えられなかった。';
    var lines = HK.Endings.deathLines(res, X);
    (Zr.zpc || []).forEach(function (z) {
      lines.push(X.nm(z.i) + 'はゾンビになり、' + (z.down ? '最後は誰かの手で眠らされた。' : z.type === 'bond' && z.target != null ? X.nm(z.target) + 'を探して' + z.area + 'をさまよっている。' : z.area + 'をさまよっている。'));
    });
    var fam = (Zr.chars || []).map(function (c, i) { return c.family ? X.nm(i) + 'の' + c.family : null; }).filter(Boolean);
    if (fam.length) lines.push('家族：' + fam.join('、'));
    var npcs = (Zr.npcs || []);
    if (npcs.length) lines.push('出会った生存者：' + npcs.map(function (p) { return Z.NPC_TYPES[p.type].label + 'の' + p.name + (p.note ? '（' + p.note + '）' : p.alive ? '' : '（死亡）'); }).join('、'));
    return {
      headline: head,
      stats: [['生存', surv + '/' + n + '人'], ['死亡', dead.length + '人'], ['ゾンビ化', zomb.length + '人'], ['咬まれた回数', (Zr.stats ? Zr.stats.bites : 0) + '回']],
      lines: lines
    };
  };
})();
