/* 箱庭診断: バトルロワイヤル（全年齢版のみ。R18版の配布物には含めない） */
(function () {
  'use strict';
  var HK = window.HK;
  function R(ctx, a, b) { return ctx.R(a, b); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  /* ---------- 結末の締め：優勝・脱出・時間切れ（生還／首輪の作動）・全滅で、ゲームが終わった場面を記録の最後に入れる ---------- */
  function closing(ctx, P) {
    var rng = ctx.rng, all = ctx.chars, out = all.filter(function (c) { return c.out; }), dead = all.filter(function (c) { return !c.alive; });
    var fill = function (t, m) { return t.replace(/\{(\w)\}/g, function (_, k) { return m[k] != null ? m[k] : ''; }); };
    var text, head;
    /* 生き残った人どうしでいちばん近い組（同盟・好意） */
    var live = all.filter(function (c) { return c.alive; }), pr = null, best = 25;
    live.forEach(function (a) { live.forEach(function (b) { if (a.i < b.i) { var v = (R(ctx, a, b).aff + R(ctx, b, a).aff) / 2 + (ctx.pair(a, b).allied ? 20 : 0); if (v > best) { best = v; pr = [a, b]; } } }); });
    if (out.length) {
      head = '脱出';
      var left = all.filter(function (c) { return c.alive && !c.out; });
      text = fill(rng.pick([
        '夜明け前、ボートは島影を離れた。外した首輪は、波の底へ沈めた。{o}は振り返らなかった。島の灯りが見えなくなるまで、誰も口をきかなかった。',
        '朝の光の中で、{o}はようやく顔を上げた。ゲームの会場だった島は、もう水平線の向こうの小さな影でしかなかった。生き延びたのではなく、自分の手で抜け出したのだと、{o}は何度も胸の中で繰り返した。',
        'ボートが本土の浜に乗り上げたとき、{o}は膝から崩れ落ちた。首に残った輪の跡が、まだひりひりと痛んだ。それでも、ここから先は、誰にも決められない明日だった。'
      ]), { o: names(out) }) + (left.length ? fill(rng.pick(['島には、{l}が残された。', '{l}は、ボートに乗らなかった。', '岸に立つ{l}の姿が、だんだん小さくなっていった。']), { l: names(left) }) : '');
    } else if (P.length === 1 && P[0].alive) {
      var w = P[0], k = w.flags.kills || 0;
      head = '優勝';
      text = fill(rng.pick(k ? [
        '最後の放送が、{a}の名前を優勝者として読み上げた。迎えのヘリが降りてきたとき、{a}は手にしていた武器をようやく離した。指は、しばらく開かなかった。',
        '首輪の電子音が止んだ。島に立っているのは、もう{a}一人だけだった。{a}が手にかけたのは{k}人。ヘリの窓から見下ろした島は、ひどく小さく見えた。',
        '{a}は、優勝者の証として渡された紙切れを、黙って握りつぶした。帰りの船の上で、{a}は一度も眠れなかった。目を閉じるたびに、最後に向かい合った顔が浮かんだ。'
      ] : [
        '最後の放送が、{a}の名前を優勝者として読み上げた。{a}は一度も、自分の手で誰かを殺さなかった。それでも、生き残ったのは{a}一人だった。',
        '{a}は、隠れていた場所から外へ出た。島はしんと静まり返っていた。誰とも戦わずに勝った{a}を、迎えのヘリが黙って乗せていった。',
        '首輪の電子音が止んだとき、{a}は自分がまだ息をしていることに驚いた。手は汚れていなかった。それが救いなのかどうか、{a}にはまだ分からなかった。'
      ]), { a: w.name, k: k });
    } else if (P.length > 1 && P.every(function (c) { return c.alive; })) {
      head = '時間切れ';
      text = fill(rng.pick([
        '試合の終わりを告げるサイレンが、島じゅうに鳴り響いた。{l}は、最後まで生き延びた。誰も勝たなかったゲームは、記録の上では「中止」として片づけられた。',
        '時間切れの放送のあと、首輪のランプが一斉に消えた。{l}は呆然と空を見上げた。殺し合わずに迎えた朝が、ひどくまぶしかった。',
        '迎えの船に乗せられた{l}は、互いの顔を見ないようにして座っていた。生き残ったという実感は、本土の港が見えるまで湧いてこなかった。'
      ]), { l: names(P) });
    } else {
      head = '全滅';
      text = fill(rng.pick([
        '島に、動く者はいなくなった。管理室のモニターには、{n}人分の首輪の信号が、ひとつ残らず途絶えたことが表示されていた。今回のゲームに、優勝者はいなかった。',
        '最後の首輪が鳴り止んだあと、島には波の音だけが残った。勝者のいない試合の記録は、誰にも読まれないまま綴じられた。',
        '翌朝、島に上陸した回収班は、{n}人の名前を一人ずつ名簿から消していった。最後の欄には、「該当者なし」とだけ書き込まれた。'
      ]), { n: all.length });
    }
    if (pr && head !== '全滅') text += fill(rng.pick(['{a}と{b}は、最後まで互いの名前を呼び合っていた。', '{a}は、{b}の手を離さなかった。', '{a}と{b}の背中合わせの約束は、最後まで守られた。']), { a: pr[0].name, b: pr[1].name });
    else if (dead.length && head !== '全滅') text += fill(rng.pick(['{d}の名前は、もう放送で読み上げられることもない。', '島に残された{d}のことを、生き残った者は一生忘れないだろう。', head === '優勝' ? '{d}の顔を、夢の中で何度も見ることになる。' : '{d}の分まで生きる――そう思えるようになるには、まだ時間がかかりそうだった。']), { d: names(dead.slice(-3)) });
    ctx.say({ kind: 'step', cat: 'phase', text: '試合終了 ― ' + head });
    ctx.say({ kind: 'event', cat: head === '全滅' ? 'combat' : 'escape', actors: head === '全滅' ? [] : all.filter(function (c) { return c.alive; }), text: text, why: 'ゲームの結末（' + head + '）', mag: 40 });
    if (!ctx.flags.outcome) ctx.flags.outcome = head === '脱出' ? names(out) + 'が島を脱出' : head === '時間切れ' ? '時間切れ ― ' + names(P) + 'が生き延びた' : head === '全滅' ? '全滅 ― 優勝者なし' : '';
  }
  function add(s) { HK.SCENARIOS[s.id] = s; HK.SCEN_ORDER.push(s.id); }

  /* ======================= バトルロワイヤル ======================= */
  HK.WEAPONS = [
    { id: 'gun', name: '拳銃', pow: 9 }, { id: 'bow', name: 'ボウガン', pow: 7 }, { id: 'sickle', name: '鎌', pow: 6 },
    { id: 'knife', name: 'サバイバルナイフ', pow: 5 }, { id: 'bat', name: '金属バット', pow: 4 }, { id: 'kitchen', name: '包丁', pow: 4 },
    { id: 'stun', name: 'スタンガン', pow: 3 }, { id: 'poison', name: '毒薬の小瓶', pow: 2, sp: 'poison' },
    { id: 'aid', name: '救急箱', pow: 0, sp: 'heal' }, { id: 'radar', name: '探知機', pow: 0, sp: 'radar' },
    { id: 'lid', name: '鍋の蓋', pow: 1 }, { id: 'fork', name: 'フォーク', pow: 1 }
  ];
  function allied(ctx, a, b) { return !!ctx.pair(a, b).allied; }
  /* 生い立ち：殺し合いに踏み出しやすさ（平和な日常を生きてきた人ほど、自分からは襲わない） */
  function willKill(c) { return c.tol != null ? 0.45 + c.tol * 0.9 : 1; }
  /* 初めて人を手にかけたあと */
  function firstKill(ctx) {
    var DG = HK.DGK;
    if (!DG) return;
    ctx.present().forEach(function (c) {
      if (!c.flags.kills || c.flags.trauma || !c.life) return;
      c.flags.trauma = true;
      ctx.stress(c, { peace: 28, harsh: 10, killed: 2 }[c.life]);
      ctx.act2({ actors: [c], cat: 'solo', text: ctx.t(ctx.pick(DG.AFTER_KILL[c.life]), c), why: c.name + 'の生い立ち（' + DG.LIFE_LABEL[c.life] + '）。初めて人を殺したあと' });
    });
  }

  add({
    id: 'br', name: 'バトルロワイヤル', kicker: 'デスゲーム', zenreiOnly: true,
    /* 殺し合いが本筋：住人の「憎悪を持っても殺さない」を越えて殺す（attr.js の HK.Attr.killForced） */
    killMain: true,
    desc: '首輪をつけられ、ランダムな武器を一つ渡される。最後の一人だけが帰れる。',
    note: '※映画『バトル・ロワイアル』のパロディです。',
    unit: '時間帯', preRel: 2, lethal: true,
    derived: ['caution', 'aggr', 'cold', 'warmth'],
    exclude: ['lighten', 'tease', 'compliment', 'take_charge', 'apologize'],
    catBias: { combat: 1.2 },
    env: [
      { id: 'days', label: '制限日数', min: 1, max: 6, def: 4, lo: '1日', hi: '6日', unit: '日', desc: '大人数ほど決着に日数がかかる（30人なら4日以上が目安）' },
      { id: 'zone', label: '禁止エリアの進行', min: 0, max: 100, def: 50, lo: 'ゆっくり', hi: '急速', desc: '速いほど後半に遭遇・戦闘が増える' },
      { id: 'gap', label: '支給武器の格差', min: 0, max: 100, def: 60, lo: '均等', hi: '当たり外れ大' },
      { id: 'timeout', label: '時間切れ', type: 'select', def: 'boom', options: [{ v: 'boom', label: '生存者全員の首輪が爆発' }, { v: 'home', label: '生存者は全員帰還' }] }
    ],
    stats: [
      { id: 'hp', label: '体力', desc: '戦闘力と耐久' },
      { id: 'agi', label: '運動神経', desc: '戦闘力と逃げ足' }
    ],
    weapons: true, maxCast: 30,
    perFields: HK.DGK ? [HK.DGK.LIFE] : [],
    actions: [
      { id: 'hide', label: '隠れてやり過ごす', fit: function (t) { return t.caution; }, bias: { solo: 2, combat: 0.5 } },
      { id: 'seek', label: '仲間を探す', fit: function (t) { return t.warmth; }, bias: { bond: 1.8, help: 1.3 } },
      { id: 'hunt', label: '武器を確かめて狩りに出る', fit: function (t) { return t.aggr; }, bias: { combat: 2 } },
      { id: 'collar', label: '首輪を外す方法を探す', fit: function (t) { return t.a * 0.7 + t.cp * 0.3; }, bias: { escape: 2 } },
      { id: 'freeze', label: '動けずに震えている', fit: function (t) { return t.ac * 0.7 + (1 - t.a) * 0.3; }, bias: { solo: 1.6, combat: 0.4 } }
    ],
    goals: [
      { id: 'last', label: '最後の一人になる', fit: function (t) { return t.aggr * 0.5 + t.cold * 0.5; }, bias: { combat: 1.8, betray: 1.8, help: 0.4 } },
      { id: 'save', label: '誰かを生き残らせる', fit: function (t) { return t.np; }, bias: { help: 2.2, combat: 0.7 }, needsFocus: true },
      { id: 'nokill', label: '誰も殺さない', fit: function (t) { return t.np * 0.6 + t.ac * 0.4; }, bias: { combat: 0.25, betray: 0.2, bond: 1.4 } },
      { id: 'rebel', label: '主催者に一矢報いる', fit: function (t) { return t.cp * 0.5 + t.a * 0.5; }, bias: { escape: 2, bond: 1.2 } },
      { id: 'meet', label: '好きな人に会いたい', fit: function (t) { return t.ac * 0.4 + t.fc * 0.4; }, bias: { romance: 2, help: 1.3 }, needsFocus: true }
    ],
    steps: function (env) {
      var s = [], parts = ['朝', '昼', '夕方', '夜'];
      for (var d = 1; d <= env.days; d++) parts.forEach(function (p) { s.push(d + '日目・' + p); });
      return s;
    },
    setup: function (ctx) {
      ctx.place = '会場の島';
      ctx.flags.plan = 0; ctx.flags.deadSeen = 0;
      var rng = ctx.rng, gap = ctx.env.gap / 100;
      ctx.chars.forEach(function (c) {
        var w = null;
        if (c.weaponPick && c.weaponPick !== 'random') w = HK.WEAPONS.filter(function (x) { return x.id === c.weaponPick; })[0];
        if (!w) w = HK.weighted(rng, HK.WEAPONS, function (x) { return 1 - (1 - gap) * Math.abs(x.pow - 4.5) / 5; });
        c.weapon = w;
        c.hp = 60 + ctx.stat(c, 'hp') * 8;
        if (HK.DGK) HK.DGK.init(rng, c, { know: false });
      });
      /* 恋人・家族・親友・主従などは、最初から手を組んでいる */
      var TEAM = { lover: 1, best: 1, parent: 1, sibling: 1, master: 1, childhood: 1, almost: 1 };
      Object.keys(ctx.ties || {}).forEach(function (k) {
        var t = ctx.ties[k];
        if (TEAM[t.type] || TEAM[(HK.TIES[t.type] || {}).like]) ctx.pair(ctx.chars[t.a], ctx.chars[t.b]).allied = true;
      });
    },
    phase: function (ctx, s, n) {
      var P = ctx.present();
      if (s === 0) ctx.say({ text: '教室のスピーカーがゲームの開始を告げた。' + ctx.chars.map(function (c) { return c.name + '「\u2060' + c.weapon.name + '」'; })   /* 支給品の告知は台詞ではないので、口調を変えない（U+2060） */.join('、') + '。' + (HK.Attr && HK.Attr.raceIntro ? HK.Attr.raceIntro(ctx.chars, 'alert', ctx) : '') });
      if (s > 0 && s % 4 === 0) {
        var dead = ctx.chars.filter(function (c) { return !c.alive; });
        var fresh = dead.slice(ctx.flags.deadSeen);
        ctx.flags.deadSeen = dead.length;
        ctx.say({ text: '定時放送。' + (fresh.length ? '死亡者は、' + names(fresh) + '。' : '死亡者はいない。') + '残り' + P.length + '名。' });
        /* 名前を読み上げられるたびに削られる。人の死に慣れていない人ほど（生い立ち） */
        if (fresh.length && HK.DGK) P.forEach(function (c) { ctx.stress(c, fresh.length * 2.5 * HK.DGK.drain(c)); });
      }
      if (s === n - 1 && P.length > 1 && ctx.flags.plan >= 100) {
        var crew = P.filter(function (c) { return c.goal.id === 'rebel' || c.action.id === 'collar' || P.some(function (o) { return o !== c && (o.goal.id === 'rebel') && allied(ctx, c, o); }); });
        if (crew.length) {
          crew.forEach(function (c) { c.out = true; c.fate = '脱出'; c.fateNote = '首輪を外して会場を出た'; });
          ctx.say({ kind: 'event', cat: 'escape', actors: crew, text: names(crew) + 'は首輪の解除に成功した。夜の海へ、ボートが一艘滑り出した。', why: '首輪解除の計画（進捗 ' + Math.round(ctx.flags.plan) + '%）', mag: 50 });
        }
      }
    },
    after: function (ctx, s, n) {
      ctx.present().forEach(function (c) { c.stress = HK.clamp(c.stress + (4 + ctx.stepIndex * 0.4) * (HK.DGK ? HK.DGK.drain(c) : 1) + c.tr.ac * 3 - c.tr.cold * 2, 0, 100); });
      firstKill(ctx);
      /* 大人数のときは、行動の外でも島のあちこちで遭遇が起きる */
      var P = ctx.present(), rng = ctx.rng;
      /* 終盤：禁止エリアが狭まり、残った者同士が出会ってしまう */
      for (var eg = 0; eg < 2; eg++) if (P.length >= 2 && P.length <= 6 && s >= n - 4 && rng() < 0.45 + ctx.env.zone / 200) {
        var x = HK.weighted(rng, P, function (c) { return 0.2 + c.tr.aggr; });
        var y = rng.pick(P.filter(function (o) { return o !== x; }));
        if (ctx.pair(x, y).allied && x.tr.np > 0.55) {
          ctx.act2({ actors: [x, y], cat: 'bond', text: ctx.t('狭まる禁止エリアに追われて、{a}と{b}は最後の安全地帯で背中を合わせた。', x, y), why: '同盟と' + x.name + 'のNP' });
        } else {
          var fr = ctx.fight(x, y, { noEvade: true, lethality: 1.3 });
          ctx.act2({ actors: [x, y], cat: 'combat', text: ctx.t('禁止エリアが島の大半を覆った。逃げ場をなくした{a}と{b}が、同じ岬で向かい合った。', x, y) + fr.text, why: '終盤の追い込み。' + fr.why });
        }
        P = ctx.present();
      }
      if (P.length < 6) return;
      var cnt = Math.floor((P.length - 1) / 3 * (0.8 + s / n * (1 + ctx.env.zone / 100)) + rng());
      for (var k = 0; k < cnt; k++) {
        P = ctx.present();
        if (P.length < 2) break;
        var a = HK.weighted(rng, P, function (c) { return 0.15 + c.tr.aggr * c.tr.aggr + (c.goal.id === 'last' ? 0.5 : 0); });
        var b = rng.pick(P.filter(function (o) { return o !== a && !ctx.pair(a, o).allied; }));
        if (!b) continue;
        var tb = HK.Ties ? HK.Ties.get(ctx, a, b) : null;
        var tmod = tb ? (tb.type === 'enemy' ? 0.35 : tb.type === 'rival' ? 0.15 : HK.TIES[tb.type].pol > 0 ? -0.5 : 0) : 0;
        if (a.tr.aggr + rng() * 0.7 + s / n * 0.2 + tmod - Math.max(0, ctx.R(a, b).aff) / 80 < 0.6) {
          ctx.act2({ actors: [a, b], cat: 'solo', fx: function () { ctx.mod2(a, b, { ten: 6 }, { ten: 6 }); },
            text: ctx.t(rng.pick(['{a}と{b}は、森の中で鉢合わせた。互いに武器を構えたまま、後ずさりで別れた。', '{a}は遠くに{b}の姿を見つけて、気づかれないように道を変えた。', '{a}と{b}は廃屋の入り口で目が合い、どちらからともなく背を向けた。']), a, b), why: '遭遇。' + a.name + 'に襲う気がなかった' });
          continue;
        }
        var res = ctx.fight(a, b, { lethality: 1.4 });
        ctx.act2({ actors: [a, b], cat: 'combat', text: ctx.t(rng.pick(['禁止エリアに追い立てられた先で、{a}が{b}に襲いかかった。', '{a}は物陰から{b}に{wa}を向けた。', '{a}と{b}は、水場で鉢合わせた。先に動いたのは{a}だった。']), a, b) + res.text, why: res.why });
      }
    },
    end: function (ctx) { return ctx.alive().filter(function (c) { return !c.out; }).length <= 1 && ctx.stepIndex > 0; },
    finish: function (ctx) {
      var P = ctx.present();
      if (P.length === 1 && !ctx.chars.some(function (c) { return c.out; })) {
        P[0].fate = '優勝'; P[0].fateNote = '最後の一人として会場を出た（' + (P[0].flags.kills || 0) + '人を手にかけた）';
        ctx.flags.outcome = P[0].name + 'の優勝';
      } else if (P.length > 1) {
        if (ctx.env.timeout === 'boom') {
          ctx.say({ text: '時間切れ。生き残っていた' + names(P) + 'の首輪が、同時に鳴った。' });
          P.forEach(function (c) { c.alive = false; c.fate = '死亡'; c.fateNote = '時間切れで首輪が作動した'; });
        } else P.forEach(function (c) { c.fate = '生還'; c.fateNote = '時間切れまで生き延びた'; });
      }
      closing(ctx, P);
    },
    events: [
      {
        id: 'hunt', cat: 'combat', scope: 'pair',
        when: function (ctx, a, b) { return !allied(ctx, a, b); },
        w: function (ctx, a, b) {
          var enc = 0.35 + ctx.stepIndex / 12 * (0.3 + ctx.env.zone / 100);
          var r = R(ctx, a, b);
          return enc * (a.tr.aggr * 1.1 + r.ten / 80 - Math.max(0, r.aff) / 70 + (a.flags.revenge === b.i ? 1.5 : 0)) * (0.5 + (a.weapon.pow / 9)) * willKill(a);
        },
        run: function (ctx, a, b) {
          var res = ctx.fight(a, b);
          var lead = a.flags.revenge === b.i ? ctx.t('{a}は{b}を見つけた。仇だった。', a, b) : ctx.t('{a}が{wa}を構えて{b}に襲いかかった。', a, b);
          return { text: lead + res.text, why: res.why + (a.flags.revenge === b.i ? '／復讐' : '') };
        }
      },
      {
        id: 'ambush', cat: 'combat', scope: 'pair',
        when: function (ctx, a, b) { return !allied(ctx, a, b) && ctx.stepIndex > 1; },
        w: function (ctx, a) { return a.tr.a * a.tr.aggr * 1.3 * (a.weapon.pow > 4 ? 1 : 0.4) * willKill(a); },
        run: function (ctx, a, b) {
          var res = ctx.fight(a, b, { ambush: true });
          return { text: ctx.t('{a}は物陰で{b}が通り過ぎるのを待った。', a, b) + res.text, why: a.name + 'のA×攻撃性（待ち伏せ）。' + res.why };
        }
      },
      {
        id: 'ally', cat: 'bond', scope: 'pair',
        when: function (ctx, a, b) { return !allied(ctx, a, b) && R(ctx, a, b).ten < 45; },
        w: function (ctx, a, b) { return 0.3 + a.tr.warmth * 0.7 + Math.max(0, R(ctx, a, b).aff) / 60; },
        run: function (ctx, a, b) {
          var rb = R(ctx, b, a);
          if (b.tr.caution > 0.6 && rb.trust < 15 && ctx.rng() < 0.6) {
            ctx.mod2(a, b, { aff: -3 }, { ten: 10 });
            return { cat: 'solo', text: ctx.t('{a}が「味方だ」と声をかけた。{b}は{wb}を向けたまま後ずさり、姿を消した。', a, b), why: b.name + 'の慎重さ（' + Math.round(b.tr.caution * 100) + '）が信じることを拒んだ' };
          }
          ctx.pair(a, b).allied = true;
          ctx.mod2(a, b, { trust: 22, aff: 8 }, { trust: 18, aff: 8 });
          return { text: ctx.t('{a}と{b}は手を組んだ。交代で見張りをすることにした。', a, b), why: a.name + 'の人懐こさ' + (rb.aff > 20 ? '、元々の好意' : '') };
        }
      },
      {
        id: 'betrayal', cat: 'betray', scope: 'pair',
        when: function (ctx, a, b) { return allied(ctx, a, b) && ctx.present().length <= 4; },
        w: function (ctx, a, b) { return ((a.tr.cold * 0.7 + a.tr.aggr * 0.4 + (a.goal.id === 'last' ? 0.9 : 0)) - Math.max(0, R(ctx, a, b).aff) / 50) * willKill(a); },
        run: function (ctx, a, b) {
          ctx.pair(a, b).allied = false;
          ctx.mod(b, a, { trust: -80, ten: 40 });
          var res;
          if (a.weapon.sp === 'poison') {
            if (ctx.rng() < 0.7) { ctx.kill(b, a, '水筒の水に毒が入っていた', { force: true }); res = { text: '' }; }
            else res = { text: b.name + 'は一口目で異変に気づき、水を吐き出した。' };
            return { mag: 40, text: ctx.t('{a}は{b}の水筒に、小瓶の中身を落とした。', a, b) + res.text, why: a.name + 'のドライさと目標「' + a.goal.label + '」' };
          }
          res = ctx.fight(a, b, { ambush: true, noEvade: true, canSpare: false });
          return { mag: 30, text: ctx.t('見張りを交代した直後、{a}は背後から{b}に{wa}を向けた。', a, b) + res.text, why: a.name + 'のドライさ（' + Math.round(a.tr.cold * 100) + '）と目標「' + a.goal.label + '」。' + res.why };
        }
      },
      {
        id: 'shield', cat: 'help', scope: 'pair',
        when: function (ctx, a, b) { return (allied(ctx, a, b) || R(ctx, a, b).aff > 40) && b.hp < 70; },
        w: function (ctx, a, b) { return a.tr.np * 1.2 + (a.focus === b ? 1.5 : 0); },
        run: function (ctx, a, b) {
          var dmg = 15 + ctx.rng() * 20;
          a.hp -= dmg;
          ctx.mod2(a, b, { aff: 8 }, { aff: 20, trust: 25, att: 8 });
          var dead = a.hp <= 0;
          if (dead) ctx.kill(a, null, b.name + 'をかばって');
          return { mag: 25, text: ctx.t('{b}を狙った一撃の前に、{a}が割って入った。', a, b) + (dead ? '' : '（残り体力 ' + Math.round(a.hp) + '）'), why: a.name + 'のNP（' + Math.round(a.eg.NP) + '）' + (a.focus === b ? '。' + b.name + 'を生き残らせると決めていた' : '') };
        }
      },
      {
        id: 'hide', cat: 'solo', scope: 'solo',
        w: function (ctx, a) { return 0.2 + a.tr.caution * 0.9; },
        run: function (ctx, a) {
          ctx.stress(a, 5); a.hp = Math.min(100, a.hp + 4);
          return { text: ctx.t(ctx.pick(['{a}は民家の押し入れに身を潜めていた。遠くで銃声が二度鳴った。', '{a}は灯台の螺旋階段の途中で、息を殺していた。']), a), why: a.name + 'の慎重さ（A・AC高、FC低）' };
        }
      },
      {
        id: 'medic', cat: 'help', scope: 'pair',
        when: function (ctx, a, b) { return b.hp < 75 && R(ctx, a, b).ten < 40; },
        w: function (ctx, a) { return (a.weapon.sp === 'heal' ? 1.4 : 0.2) + a.tr.np * 0.5; },
        run: function (ctx, a, b) {
          b.hp = Math.min(100, b.hp + (a.weapon.sp === 'heal' ? 35 : 12));
          ctx.mod2(a, b, { aff: 4 }, { aff: 12, trust: 15 });
          return { text: ctx.t(a.weapon.sp === 'heal' ? '{a}は救急箱を開けて、{b}の傷を縫った。' : '{a}は自分のシャツを裂いて{b}の傷を縛った。', a, b), why: a.name + 'のNP' + (a.weapon.sp === 'heal' ? '／支給品が救急箱' : '') };
        }
      },
      {
        id: 'plan', cat: 'escape', scope: 'solo',
        w: function (ctx, a) { return a.tr.a * 0.6 * ((a.goal.id === 'rebel' || a.action.id === 'collar') ? 2.2 : 0.4); },
        run: function (ctx, a) {
          ctx.flags.plan += (5 + a.tr.a * 12 + (a.weapon.sp === 'radar' ? 10 : 0)) / Math.max(1, ctx.chars.length / 8);
          return { text: ctx.t('{a}は首輪の継ぎ目を調べ、分校の配電図を書き起こしていた。（解除計画 ' + Math.min(100, Math.round(ctx.flags.plan)) + '%）', a), why: a.name + 'のA（' + Math.round(a.eg.A) + '）と目標「' + a.goal.label + '」' };
        }
      },
      {
        id: 'lastwords', cat: 'romance', scope: 'pair',
        when: function (ctx, a, b) { return a.hp < 40 && R(ctx, a, b).aff > 35 && !ctx.pair(a, b).confessed[a.i]; },
        w: function (ctx, a, b) { return 1 + R(ctx, a, b).att / 40; },
        run: function (ctx, a, b) {
          ctx.pair(a, b).confessed[a.i] = true;
          var rb = R(ctx, b, a);
          if (rb.aff > 30) ctx.pair(a, b).couple = R(ctx, a, b).att > 35 && rb.att > 30;
          ctx.mod2(a, b, { aff: 10, att: 10 }, { aff: 15, att: 12, trust: 10 });
          return { mag: 25, text: ctx.t('血の止まらない腹を押さえたまま、{a}は{b}に言った。「本当は、ずっと――」', a, b), why: '体力 ' + Math.round(a.hp) + '。言わずに終わることへの恐れが' + a.name + 'の口を開かせた' };
        }
      },
      {
        id: 'mourn', cat: 'solo', scope: 'solo',
        when: function (ctx, a) { return a.flags.grief != null && !a.flags.mourned; },
        w: function () { return 2; },
        run: function (ctx, a) {
          a.flags.mourned = true;
          var d = ctx.chars[a.flags.grief];
          return { with: [d], text: ctx.t('{a}は{c}の名前が呼ばれたことを、まだ受け入れられずにいた。', a, null, d), why: d.name + 'への好意（' + Math.round(R(ctx, a, d).aff) + '）' };
        }
      }
    ]
  });
})();
