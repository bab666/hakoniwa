/* 箱庭シミュレーター: ゾンビの街 ― 治療薬
   ・まれに「感染を治す薬がある」という噂が流れる（デマのこともある）
   ・咬まれた／ゾンビになった大切な人がいる住人は、目標が「治療薬を手に入れる」に変わる
   ・薬のある場所には障害（群れ・危険な薬品庫・先客）があり、手に入れたら相手のもとへ向かう
   ・投与すると、治ることもあれば、体が溶けて触手の怪物になることもある
   ・相手がもう死んでいたら、絶望はいっそう深くなる */
(function () {
  'use strict';
  var HK = window.HK, Z = HK.ZB;
  if (!Z || !Z.scen) return;
  var EV = Z.scen.events;
  function L(s) { return s.split('|'); }
  function fill(t, m) { return t.replace(/\{(\w+)\}/g, function (x, k) { return m[k] != null ? m[k] : x; }); }
  function alive(c) { return c && c.alive && !c.out; }
  var GOAL = { id: 'cure', label: '治療薬を手に入れる', bias: { help: 1.4, combat: 1.2 } };

  var T = Z.CURE = {
    rumor: L('ラジオの雑音の向こうで、誰かが言った。「{area}の地下に、感染を治す試薬が残っている」|SNSに、{area}の研究員を名乗る投稿が流れた。「治療薬の試作品が、まだ保管庫にある」――すぐに削除された。|壁に、乱れた字の落書きがあった。「{area}　薬　まだある　治る」'),
    rumorOff: L('拾った無線機から、途切れ途切れの声が聞こえた。「……{area}……試薬……治る……」|生存者が残したメモに、「{area}の保管庫に治療薬」と書かれていた。'),
    hear: L('{a}はその噂を聞いた瞬間、立ち上がっていた。{b}を、元に戻せるかもしれない。|{a}は噂を何度も頭の中で繰り返した。デマかもしれない。それでも、{b}のためなら。|{a}は武器を握り直した。「{area}に行く。{b}を、治す」'),
    obstacle: [
      { n: '群れ', t: L('{area}の入口は、ゾンビの群れで埋まっていた。{a}は{w}を構え、隙間を縫うように走った。|保管庫へ続く廊下に、白衣のゾンビがひしめいていた。{a}は息を殺して、一体ずつ数えた。') },
      { n: '危険な薬品庫', t: L('薬品庫の扉の向こうは、割れた薬瓶から漏れた薬品の煙で満ちていた。{a}は袖で口を覆って踏み込んだ。|保管庫は電子ロックで閉ざされていた。非常電源を探して、{a}は真っ暗な地下を這い回った。') },
      { n: '先客', t: L('保管庫の前には、先客がいた。銃を構えた男が、「これは俺たちのだ」と言った。|薬を独り占めしようとする白衣の男が、{a}の前に立ちふさがった。「渡さない。これは研究成果だ」') }
    ],
    win: L('――{a}は、震える手で銀色のケースを掴んだ。中には、青く光るアンプルが一本だけ入っていた。|――棚の奥に、ラベルの剥がれかけた小箱があった。「試作品・投与注意」。{a}はそれを胸に抱えて、走った。'),
    lose: L('――{a}は引き返すしかなかった。腕から血が流れていた。|――{a}は這うようにして逃げ出した。薬は、まだあの奥にある。'),
    bit: L('――逃げる途中、{a}の足首に、何かが噛みついた。'),
    fake: L('保管庫は、空っぽだった。棚には「回収済み」の札が一枚だけ残っていた。噂は、デマだった。{a}はその場に座り込んだ。|ケースの中身は、ただのビタミン剤だった。{a}は笑おうとして、笑えなかった。'),
    /* 投与（{a}=投与する人、{b}=相手） */
    give: L('{a}は{b}の腕を押さえ、アンプルの中身を一気に注ぎ込んだ。「戻ってきて」|{a}は{b}の首筋に針を刺した。「お願い。お願いだから」'),
    giveZ: L('{a}は{b}に組みつき、もみ合いながら首筋に針を刺した。|{a}は{b}の正面に立ち、伸びてきた腕をかいくぐって、胸に針を突き立てた。'),
    giveChain: L('{a}は鎖で繋いだ{b}の腕に、全身の体重をかけて針を突き立てた。{b}が呻き声を上げた。|{a}は閉じ込めていた部屋の扉を開け、暴れる{b}を押さえつけて、首筋に針を刺した。'),
    cured: L('{b}の体が大きく痙攣した。やがて、濁っていた目に、ゆっくりと光が戻った。「……{a}？」――{a}は声を上げて泣いた。|長い沈黙のあと、{b}が咳き込んだ。人間の咳だった。「……なんで、泣いてるの」――{a}は答えられずに、{b}を抱きしめた。|{b}の肌から、灰色の斑点がすうっと引いていった。{b}は自分の手を見つめて、それから{a}を見た。「……ただいま」'),
    curedBit: L('{b}の熱は、その夜のうちに引いた。咬み跡の黒ずみが、少しずつ薄れていった。|朝、{b}は「お腹すいた」と言った。それが、{a}がこの世で聞いたいちばん嬉しい言葉だった。'),
    melt: L('{b}の体が、内側から泡立ち始めた。皮膚が溶け、背中から何本もの触手が這い出した。{a}が悲鳴を上げる前に、それはもう{b}の形をしていなかった。|{b}が絶叫した。骨が軋み、肉が裂け、溶けた体の中から、ぬめった触手が四方へ伸びた。薬は、効きすぎた。'),
    grab: L('触手が{a}の手足に巻きつき、宙に吊り上げた。'),
    grabM: L('触手が{a}の手足に巻きつき、{m}の目の前で宙に吊り上げた。|悲鳴を上げる{m}の前で、触手は{a}を軽々と持ち上げた。'),
    dieSex: L('最後に{a}の体を引き裂いたのも、同じ触手だった。|{a}の声が途絶えたあと、触手はゆっくりと{a}を飲み込んでいった。|夜が明けるころ、そこには{a}の衣服の切れ端だけが残っていた。'),
    dieFade: L('{a}の声は、やがて聞こえなくなった。|それは、長い時間続いた。そして、終わった。'),
    save: L('――{m}が叫びながら飛び込み、{w}で触手を叩き切った。落ちてきた{a}を、{m}は全身で受け止めた。怪物は甲高い声を上げて、闇の奥へ逃げていった。|――{m}が{w}を振りかざして怪物に飛びかかった。触手が緩んだ一瞬、{a}は床に転がり落ちた。'),
    saveKill: L('――{m}たちは一斉に飛びかかった。何度も、何度も{w}を振り下ろし、やがてかつて{b}だったものは動かなくなった。|――銃声が何発も響いた。触手が力を失い、{a}は床に落ちた。{b}だったものは、もう動かなかった。'),
    afterSave: L('{a}は助け出されたあとも、しばらく自分の体を抱いて震えていた。誰も、何も言えなかった。|{a}は仲間の上着にくるまれたまま、一言も喋らなかった。'),
    caught: L('――{m}が助けに飛び込んだ。だが、別の触手が{m}の足首を捕らえ、同じように吊り上げた。|――「離せ！」{m}が触手に斬りかかった。その腕に、二本目、三本目の触手が絡みついた。'),
    abandon: L('――仲間たちは、どうすることもできなかった。{m}は、吊るされた{a}から目を逸らして走った。背後の声は、角を曲がっても聞こえていた。|――{m}は{a}の名前を叫びながら、走るしかなかった。振り返ることは、できなかった。'),
    eaten: L('触手が{a}の体を絡め取った。{a}は最後まで、それが{b}だったことを忘れなかった。|{a}は逃げなかった。かつて{b}だったものに抱かれて、{a}は飲み込まれていった。'),
    flee: L('{a}は触手を振りほどき、血まみれになって逃げ出した。背後で、かつて{b}だったものが、聞いたことのない声で鳴いていた。'),
    gone: L('{a}が薬を握りしめて戻ったとき、{b}はもう、どこにもいなかった。――間に合わなかった。{a}は薬を握りつぶした。ガラスが手に食い込んでも、離さなかった。|{a}は、{b}の亡骸の前に膝をついた。手の中のアンプルが、ひどく軽かった。「……遅かった。全部、遅かった」|{a}はアンプルを地面に叩きつけようとして、できなかった。{b}を救うはずだったものを、壊すことさえできなかった。'),
    goneDespair: L('その夜、{a}は誰とも口をきかなかった。目から、何かが消えていた。|{a}は空のアンプルを首から下げた。もう、生き延びる理由が見つからなかった。')
  };

  /* 治したい相手：咬まれている／ゾンビになったが、まだ倒されていない大切な人 */
  function stateOf(ctx, o) {
    if (alive(o)) return o.z.bitten ? 'bitten' : 'ok';
    var zp = Z.zpOf ? Z.zpOf(ctx, o.i) : null;
    if (zp && !zp.monster && (!zp.down || zp.chained || zp.kept)) return 'zombie';
    return 'gone';
  }
  function dear(ctx, c, o) {
    if (Z.isLover && Z.isLover(ctx, c, o)) return 3;
    if (HK.Ties && (HK.Ties.has(ctx, c, o, 'parent') || HK.Ties.has(ctx, c, o, 'sibling'))) return 3;
    if (HK.Ties && HK.Ties.from(ctx, c, o, 'crush')) return 2;
    return ctx.R(c, o).aff > 55 ? 1 : 0;
  }
  function targetOf(ctx, c) {
    var best = null, bv = 0;
    ctx.chars.forEach(function (o) {
      if (o === c) return;
      var st = stateOf(ctx, o), d = dear(ctx, c, o);
      if ((st === 'bitten' || st === 'zombie') && d > bv) { bv = d; best = o; }
    });
    return best;
  }
  function placeOf(ctx, o) {
    if (alive(o)) return o.z.area;
    var zp = Z.zpOf(ctx, o.i);
    return zp ? zp.area : null;
  }
  /* 移動先（zombie-core の destOf から呼ぶ） */
  Z.cureDest = function (ctx, c) {
    var q = c.z.cureQ, zb = ctx.zb;
    if (!q || q.done) return null;
    if (q.stage === 'seek') return zb.cure.area;
    if (q.stage === 'have') { var p = placeOf(ctx, ctx.chars[q.target]); return p != null ? p : null; }
    return null;
  };
  function startQuest(ctx, c, o, heard) {
    if (c.z.cureQ || c.goal.id === 'chaos' || c.z.bitten) return;
    c.z.cureQ = { target: o.i, stage: 'seek', tries: 0, prevGoal: c.goal };
    var from = c.goal.label;
    c.goal = GOAL;
    var m = { a: c.name, b: o.name, area: Z.an(ctx, ctx.zb.cure.area) };
    ctx.act2({ actors: [c, o], cat: 'solo', text: (heard ? fill(ctx.pick(T.hear), m) : '') + c.name + 'の目標が変わった：「' + from + '」→「' + GOAL.label + '」', why: c.name + 'は、' + (stateOf(ctx, o) === 'zombie' ? 'ゾンビになった' : '咬まれた') + o.name + 'を治したい', mag: 26 });
  }
  function endQuest(ctx, c, goalId) {
    var q = c.z.cureQ; q.done = true;
    c.goal = Z.scen.goals.filter(function (g) { return g.id === goalId; })[0] || q.prevGoal || c.goal;
  }

  /* 噂が流れる（まれ）。聞いた人のうち、治したい相手がいる人の目標が変わる */
  function rumor(ctx) {
    var zb = ctx.zb, rng = ctx.rng;
    if (zb.cure || Z.part(ctx) !== 0 || Z.day(ctx) < 2) return;
    var need = ctx.present().some(function (c) { return !!targetOf(ctx, c); });
    if (rng() > (need ? 0.07 : 0.015)) return;
    var medA = zb.A.filter(function (A) { return A.def.med; })[0];
    var area = medA && rng() < 0.7 ? medA.i : rng.int(zb.A.length);
    zb.cure = { area: area, real: rng() > ctx.env.rumor / 100 * 0.55, taken: false };
    var m = { area: Z.an(ctx, area) };
    var heard = ctx.present().filter(function (c) { return rng() < (zb.netDown ? 0.4 : 0.7); });
    ctx.say({ kind: 'event', cat: 'phase', actors: heard, text: fill(ctx.pick(zb.netDown ? T.rumorOff : T.rumor), m) + (heard.length ? '――' + Z.names(heard) + 'が、その話を耳にした。' : ''), why: '治療薬の噂（情報の錯綜 ' + ctx.env.rumor + '）', mag: 24 });
    heard.forEach(function (c) { c.z.know.cure = true; var o = targetOf(ctx, c); if (o) startQuest(ctx, c, o, true); });
  }

  /* 薬のある場所で：障害を越えられるか */
  function raid(ctx, c, q) {
    var rng = ctx.rng, zb = ctx.zb, ob = rng.pick(T.obstacle), mates = Z.here(ctx, c);
    var m = { a: c.name, area: Z.an(ctx, zb.cure.area), w: c.weapon ? c.weapon.name : '素手' };
    var p = 0.3 + ctx.stat(c, 'luck') * 0.04 + (c.weapon ? c.weapon.pow * 0.03 : 0) + c.tr.caution * 0.1 + mates.length * 0.06 + q.tries * 0.12;
    q.tries++;
    var t = fill(ctx.pick(ob.t), m), why = c.name + 'は「' + ob.n + '」を越えようとした（運・武器・仲間 ' + mates.length + '人）';
    if (zb.cure.taken) { ctx.act2({ actors: [c], cat: 'solo', text: t + '――保管庫は、すでに荒らされていた。誰かが先に持ち去ったあとだった。', why: why, mag: 20 }); ctx.stress(c, 25); endQuest(ctx, c, 'live'); return; }
    if (rng() < p) {
      if (!zb.cure.real) { ctx.act2({ actors: [c].concat(mates), cat: 'solo', text: t + fill(ctx.pick(T.fake), m), why: why + '――噂はデマだった', mag: 30 }); ctx.stress(c, 35); endQuest(ctx, c, 'live'); return; }
      zb.cure.taken = true; q.stage = 'have';
      ctx.act2({ actors: [c].concat(mates), cat: 'help', text: t + fill(ctx.pick(T.win), m), why: why + '――治療薬を手に入れた', mag: 36 });
      return;
    }
    c.hp -= 14 + rng.int(16); ctx.stress(c, 12);
    var bitten = ob.n === '群れ' && rng() < 0.3;
    ctx.act2({ actors: [c].concat(mates), cat: 'combat', text: t + fill(ctx.pick(bitten ? T.bit : T.lose), m), why: why + '――越えられなかった', mag: 28 });
    if (bitten && Z.infect) Z.infect(ctx, c, null, true);
    if (c.hp <= 0) ctx.kill(c, null, '治療薬を取りに行き、' + ob.n + 'に阻まれて');
  }

  /* 投与する */
  function dose(ctx, c, q) {
    var rng = ctx.rng, o = ctx.chars[q.target], st = stateOf(ctx, o), m = { a: c.name, b: o.name };
    if (st === 'ok') { endQuest(ctx, c, 'live'); return; }
    if (st === 'gone') {
      ctx.stress(c, 50);
      var deep = c.stress > 85 && c.tr.ac + c.tr.np > 1.1 && rng() < 0.3;
      ctx.act2({ actors: [c, o], cat: 'death', text: fill(ctx.pick(T.gone), m) + fill(ctx.pick(T.goneDespair), m), why: c.name + 'は治療薬を手に入れた。だが、' + o.name + 'はもういなかった（焦り ' + Math.round(c.stress) + '）', mag: 44 });
      endQuest(ctx, c, c.tr.cold + c.tr.aggr > 1.2 ? 'chaos' : 'live');
      if (deep) ctx.kill(c, null, o.name + 'に間に合わなかった治療薬を握りしめたまま、自ら');
      return;
    }
    var zombie = st === 'zombie', zp = zombie ? Z.zpOf(ctx, o.i) : null;
    var okP = zombie ? 0.4 : 0.6;
    q.done = true;
    var giveT = zombie ? (zp.chained || zp.kept ? T.giveChain : T.giveZ) : T.give;
    if (rng() < okP) {
      if (zombie) {
        zp.down = true; zp.cured = true; zp.chained = false; zp.kept = false;
        o.alive = true; o.hp = 35; o.fate = ''; o.deathHow = ''; o.diedAt = null; o.fateNote = '';
        o.z.bitten = null; o.z.turnAt = -1; o.z.area = zp.area; o.z.aware = false; o.z.decided = false; o.z.cured = true;
        o.stress = 60;
      } else { o.z.bitten = null; o.z.turnAt = -1; o.z.aware = false; o.z.cured = true; o.z.hiding = false; }
      ctx.mod2(c, o, { aff: 15, trust: 15 }, { aff: 25, trust: 25, att: 10 });
      ctx.act2({ actors: [c, o], cat: 'help', text: fill(ctx.pick(giveT), m) + fill(ctx.pick(zombie ? T.cured : T.curedBit), m), why: c.name + 'は' + o.name + 'に治療薬を投与した――' + (zombie ? 'ゾンビから人間に戻った' : '感染が治った'), mag: 50 });
      c.goal = q.prevGoal && q.prevGoal.id !== 'cure' ? q.prevGoal : Z.scen.goals[0];
      if (o.z.keep != null) o.z.keep = null;
      return;
    }
    /* 体が溶けて、触手の怪物になる */
    var head = fill(ctx.pick(zombie ? (zp.chained || zp.kept ? T.giveChain : T.giveZ) : T.give), m) + fill(ctx.pick(T.melt), m);
    if (!zombie) { o.z.bitten = o.z.bitten || { at: ctx.stepIndex, by: null }; Z.turn(ctx, o, true); zp = Z.zpOf(ctx, o.i); }
    if (zp) { zp.loveDone = true; zp.crushDone = true; zp.monster = true; zp.down = false; zp.chained = false; zp.kept = false; zp.type = 'wild'; zp.target = null; zp.area = c.z.area; }
    o.fateNote = (o.fateNote || '') + '。治療薬で体が溶け、触手の怪物になった';
    ctx.stress(c, 40);
    /* その場にいる仲間：多いほど、助かる見込みが上がる */
    var mates = Z.here(ctx, c).filter(function (x) { return x !== o && alive(x); });
    var lv = Z.cureAssault ? Z.loveLv(ctx) : 'off';
    /* 犯される描写は、怪物になった側が「受け」でなく、襲われる側が「攻め」でないときだけ */
    /* 襲われる側が「攻め」指定なら、犯される展開にはしない（喰われる・助け出されるだけ） */
    /* 怪物になった o が c を襲う向き（HK.Pos.order の先頭が o）で、二人の向きが決まる組（okSex）のときだけ */
    function sexOK(x) { var P = HK.Pos; return !P || (P.canReceive(x) && P.okSex(o, x) && P.order(o, x, [o, x])[0] === o); }
    var sexual = lv !== 'off' && sexOK(c) && rng() < 0.6;
    var lvr = Z.loverOf ? Z.loverOf(ctx, c, o) : null, lvHere = lvr && mates.indexOf(lvr) >= 0;
    var pow = mates.reduce(function (s0, x) { return s0 + (x.weapon ? x.weapon.pow : 0); }, 0);
    var brave = mates.reduce(function (s0, x) { return Math.max(s0, x.tr.np * 0.5 + x.tr.cp * 0.3 + x.tr.aggr * 0.3); }, 0);
    var save = Math.min(0.85, 0.1 + ctx.stat(c, 'luck') * 0.03 + mates.length * 0.17 + pow * 0.02 + brave * 0.2 + (lvHere ? 0.15 : 0));
    var mm = { a: c.name, b: o.name, m: mates.length ? Z.names(mates.slice(0, 2)) : '', m1: mates.length ? mates[0].name : '' };
    var body = fill(ctx.pick(mates.length ? T.grabM : T.grab), mm) + (sexual ? Z.cureAssault(ctx, c, o, mates, lv) : '') + (Z.loverShock ? Z.loverShock(ctx, c, lvr, lvHere, sexual) : '');
    var whyH = c.name + 'の投与した治療薬で、' + o.name + 'は触手の怪物になった';
    if (!mates.length) {
      if (rng() < 0.18 + ctx.stat(c, 'luck') * 0.03) {
        c.hp -= 30;
        ctx.act2({ actors: [c, o], cat: 'escape', text: head + fill(ctx.pick(T.flee), mm), why: whyH + '――' + c.name + 'は辛くも逃げた', mag: 52 });
        if (c.hp <= 0) ctx.kill(c, null, '怪物になった' + o.name + 'から逃げきれず');
        else { var na = rng.pick(Z.adj(c.z.area)); c.z.area = na; c.z.path.push(na); endQuest(ctx, c, 'escape'); }
        return;
      }
      /* ときどき、襲われてから喰い殺されるまでを一続きで書いた文（R18版の solo-zombie-love.js の CURE_R18・CURE_R18_FADE） */
      var whole = sexual && Z.CURE_R18 && rng() < 0.35 ? (lv === 'high' ? Z.CURE_R18 : Z.CURE_R18_FADE) : null;
      ctx.act2({ actors: [c, o], cat: 'death', text: head + (whole ? fill(ctx.pick(T.grab), mm) + fill(ctx.pick(whole), mm) : body + fill(ctx.pick(sexual ? (lv === 'high' ? T.dieSex : T.dieFade) : T.eaten), mm)), why: whyH + '（その場に、誰もいなかった）', mag: 60 });
      ctx.kill(c, null, sexual ? '治療薬で怪物になった' + o.name + 'に、犯されながら喰い殺された' : '治療薬で怪物になった' + o.name + 'に喰われた');
      return;
    }
    var actors = [c, o].concat(mates);
    var r2 = rng();
    if (r2 < save) {
      /* 仲間が助け出す */
      var hero = ctx.most(mates, function (x) { return x.tr.np * 0.5 + x.tr.cp * 0.3 + (x.weapon ? x.weapon.pow * 0.05 : 0); });
      var kill = pow >= 8 && rng() < 0.5;
      c.hp -= sexual ? 25 : 35; ctx.stress(c, 45);
      mates.forEach(function (x) { ctx.stress(x, 20); ctx.mod(c, x, { aff: 15, trust: 20 }); });
      if (kill) { zp.down = true; ctx.zb.stats.putdown++; o.fateNote += '。仲間たちの手で倒された'; }
      else { zp.area = rng.pick(Z.adj(zp.area)); }
      ctx.act2({ actors: actors, cat: 'help', text: head + body + fill(ctx.pick(kill ? T.saveKill : T.save), { a: c.name, b: o.name, m: hero.name, w: hero.weapon ? hero.weapon.name : '素手' }) + (sexual && lv !== 'off' ? fill(ctx.pick(T.afterSave), mm) : ''), why: whyH + '――仲間（' + mates.length + '人・武器・NP/CP）が助け出した（助かる見込み ' + Math.round(save * 100) + '%）', mag: 58 });
      if (c.hp <= 0) ctx.kill(c, null, '怪物になった' + o.name + 'から助け出されたが、傷が深すぎて');
      else endQuest(ctx, c, 'live');
      return;
    }
    if (r2 < save + (1 - save) * 0.4) {
      /* 助けに入った仲間も、巻き込まれる */
      var vic = ctx.most(mates, function (x) { return x.tr.np + x.tr.impulse * 0.5; });
      var body2 = sexual && sexOK(vic) ? Z.cureAssault(ctx, vic, o, mates.filter(function (x) { return x !== vic; }).concat([]), lv, { second: true, first: c }) : '';
      ctx.act2({ actors: actors, cat: 'death', text: head + body + fill(ctx.pick(T.caught), { a: c.name, b: o.name, m: vic.name }) + body2 + fill(ctx.pick(sexual ? (lv === 'high' ? T.dieSex : T.dieFade) : T.eaten), mm), why: whyH + '――助けに入った' + vic.name + 'も巻き込まれた', mag: 64 });
      ctx.kill(c, null, sexual ? '治療薬で怪物になった' + o.name + 'に、仲間の前で犯されながら喰い殺された' : '治療薬で怪物になった' + o.name + 'に喰われた');
      vic.hp -= 45 + rng.int(30); ctx.stress(vic, 40);
      if (vic.hp <= 0 || rng() < 0.5) ctx.kill(vic, null, c.name + 'を助けに入り、怪物になった' + o.name + 'に' + (sexual ? '捕まって' : '') + '喰われた');
      return;
    }
    /* 仲間は逃げるしかなかった */
    mates.forEach(function (x) { ctx.stress(x, 30); x.flags.grief = c.i; });
    ctx.act2({ actors: actors, cat: 'death', text: head + body + fill(ctx.pick(T.abandon), mm) + fill(ctx.pick(sexual ? (lv === 'high' ? T.dieSex : T.dieFade) : T.eaten), mm), why: whyH + '――仲間は、助けられなかった', mag: 62 });
    ctx.kill(c, null, sexual ? '治療薬で怪物になった' + o.name + 'に、仲間の前で犯されながら喰い殺された' : '治療薬で怪物になった' + o.name + 'に、仲間の前で喰われた');
    mates.forEach(function (x) { var na = rng.pick(Z.adj(x.z.area)); x.z.area = na; x.z.path.push(na); });
  }

  /* 区切りのあとで：噂・新しく治したい相手ができた人・薬の入手と投与 */
  var after0 = Z.scen.after;
  Z.scen.after = function (ctx, s, n) {
    after0.call(this, ctx, s, n);
    if (!ctx.zb) return;
    rumor(ctx);
    var zb = ctx.zb;
    if (!zb.cure) return;
    ctx.present().forEach(function (c) {
      if (!c.z.cureQ && c.z.know.cure) { var o = targetOf(ctx, c); if (o) startQuest(ctx, c, o, false); }
      var q = c.z.cureQ;
      if (!q || q.done || !alive(c)) return;
      if (q.stage === 'seek' && c.z.area === zb.cure.area) raid(ctx, c, q);
      else if (q.stage === 'have') {
        var o = ctx.chars[q.target], st = stateOf(ctx, o);
        if (st === 'gone' || st === 'ok' || placeOf(ctx, o) === c.z.area) dose(ctx, c, q);
      }
    });
    ctx.flush();
  };
  /* 噂を人に伝える：知っている人から、同じ場所の人へ */
  EV.push({
    id: 'z_cure_tell', cat: 'bond', scope: 'pair',
    when: function (ctx, a, b) { return a.z.know.cure && !b.z.know.cure && !!ctx.zb.cure; },
    w: function (ctx, a, b) { return 0.6 + (targetOf(ctx, b) ? 1.5 : 0); },
    run: function (ctx, a, b) {
      b.z.know.cure = true;
      var o = targetOf(ctx, b);
      if (o) Z.later(ctx, function () { startQuest(ctx, b, o, true); });
      return { text: ctx.t('{a}は{b}に、治療薬の噂を伝えた。「' + Z.an(ctx, ctx.zb.cure.area) + 'にあるらしい。本当かどうかは分からないけど」', a, b), why: '噂が人づてに広まった' };
    }
  });
})();
