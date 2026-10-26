/* 箱庭診断: 無人島の危険生物（毒蛇など）―― 気配 → 襲撃 → 会議 → 武器づくり → 討伐 */
(function () {
  'use strict';
  var HK = window.HK;
  var isl = HK.SCENARIOS.island;
  if (!isl) return;
  function R(ctx, a, b) { return ctx.R(a, b); }
  function pk(ctx, arr) { return arr[ctx.rng.int(arr.length)]; }
  function sk(ctx, c, id) { return ctx.stat(c, id); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }

  isl.env = isl.env.concat([{ id: 'danger', label: '危険な生き物', min: 0, max: 100, def: 40, lo: 'いない', hi: 'うようよ', desc: '毒蛇やイノシシが出る頻度。出たら討伐するか避けるかを話し合う' }]);

  var BEASTS = [
    { id: 'habu', name: '毒蛇', venom: true, pow: 0.55, dmg: 14, meat: 8,
      sign: ['{a}が拠点の裏で、大きな蛇の抜け殻を見つけた。{a}「…これ、腕くらい太くない？｜…これは、腕くらい太くないか？｜…これ、腕くらい太くないですか？」', '夜中、草むらで何かが這う音がした。{a}「今の、聞こえた？｜今のが、聞こえたか？｜今の、聞こえましたか？」', '{a}は岩の上で日向ぼっこする、三角頭の蛇を見た。黙って後ずさった。'],
      attack: ['{a}の足首に、草むらから飛び出した毒蛇が噛みついた。{a}「痛っ…！」二つの小さな穴から血が滲んだ。', '薪を拾おうとした{a}の手に、毒蛇が食らいついた。', '寝床の葉の下に、毒蛇が潜んでいた。{a}の悲鳴で全員が飛び起きた。'] },
    { id: 'mukade', name: '大ムカデ', venom: true, pow: 0.4, dmg: 10, meat: 0,
      sign: ['{a}の靴の中から、手のひらほどのムカデが這い出してきた。{a}「…」声も出なかった。', '倒木をひっくり返した{a}が、赤黒いムカデの群れを見て凍りついた。'],
      attack: ['眠っていた{a}の首筋を、大ムカデが這った。次の瞬間、焼けるような痛みが走った。', '{a}が岩の隙間に手を入れた瞬間、大ムカデに噛まれた。腕が見る見る腫れた。'] },
    { id: 'boar', name: '気の荒いイノシシ', venom: false, pow: 0.7, dmg: 24, meat: 22,
      sign: ['{a}が森の入り口で、地面がめちゃくちゃに掘り返されているのを見つけた。{a}「…デカいのがいる｜…大きいのがいる｜…大きいのがいます」', '夜、拠点の食料が荒らされていた。蹄の跡が残っていた。'],
      attack: ['茂みから飛び出したイノシシが、{a}を跳ね飛ばした。{a}は太腿を押さえてうずくまった。', '{a}は果物を採っている最中にイノシシと鉢合わせし、牙で脚を裂かれた。'] },
    { id: 'spider', name: '毒グモ', venom: true, pow: 0.3, dmg: 8, meat: 0,
      sign: ['拠点の屋根の裏に、拳ほどの毛むくじゃらのクモが巣を張っていた。{a}「無理無理無理」'],
      attack: ['{a}が上着を着た瞬間、袖の中のクモに噛まれた。{a}「…なんか、手がしびれる｜…何か、手がしびれる｜…なんだか、手がしびれます」'] }
  ];
  var WEAPONS = [
    { n: '竹槍', t: '{a}は竹の先を石で斜めに削いで、竹槍を作った。' }, { n: '銛', t: '{a}は流木の先に、研いだ貝殻を蔓で縛りつけて銛にした。' },
    { n: '石斧', t: '{a}は平たい石を何時間も研いで、石斧を作った。「これで叩けば一発｜これで叩けば一発だ｜これで叩けば一発です」' }, { n: '弓矢', t: '{a}はしなる枝と蔓で弓を張った。矢羽は海鳥の羽根だった。' },
    { n: '投石紐', t: '{a}は布を裂いて投石紐を編んだ。試しに投げた石が、ヤシの実を割った。' }, { n: '松明', t: '{a}は乾いた葉を束ねて、松明を何本も作った。「火なら、どんな生き物も怯む｜＝｜火なら、どんな生き物も怯みます」' },
    { n: '木の盾', t: '{a}は流木を蔓で編んで、小さな盾を作った。' }, { n: '棍棒', t: '{a}は太い枝の先に石を括りつけて、棍棒を作った。' },
    { n: '落とし穴', t: '{a}は獣道に穴を掘り、上を葉で覆って罠を仕掛けた。' }, { n: '二股の枝', t: '{a}は先が二股の枝を削った。「蛇は頭を押さえるのが一番｜蛇は頭を押さえるのが一番だ｜蛇は頭を押さえるのが一番です」' }
  ];

  function venomTick(ctx) {
    ctx.present().forEach(function (c) {
      if (!c.flags.venom) return;
      c.hp -= 6 + (c.flags.venom > 2 ? 4 : 0);
      c.flags.venom--;
      if (c.hp <= 0) { ctx.kill(c, null, '毒が全身に回った'); return; }
      var nurse = ctx.most(ctx.others(c), function (o) { return o.tr.np + sk(ctx, o, 'know') * 0.15 + R(ctx, o, c).aff / 100; });
      if (nurse && ctx.rng() < 0.35 + nurse.tr.np * 0.3 + sk(ctx, nurse, 'know') * 0.08) {
        c.flags.venom = 0; c.hp = Math.min(100, c.hp + 8);
        ctx.act2({ actors: [nurse, c], cat: 'help', fx: function () { ctx.mod2(nurse, c, { aff: 5 }, { aff: 12, trust: 14 }); },
          text: pk(ctx, [nurse.name + 'は' + c.name + 'の傷口を縛り、毒を吸い出しては吐いた。「動かないで。大丈夫だから｜動くな。大丈夫だ｜動かないでください。大丈夫ですから」', nurse.name + 'は森で見つけた解毒の葉を噛み潰して、' + c.name + 'の傷に貼った。熱が、少しずつ引いていった。', nurse.name + 'は一晩中、' + c.name + 'の手を握っていた。朝には腫れが引いていた。' + c.name + '「…ずっといたの？｜…ずっといたのか？｜…ずっといたんですか？」']),
          why: nurse.name + 'のNP・サバイバル知識 ' + sk(ctx, nurse, 'know') });
      }
    });
  }

  function hazardTurn(ctx) {
    var I = ctx.isl, P = ctx.present(), rng = ctx.rng, env = ctx.env;
    if (!I || P.length < 2) return;
    I.weapons = I.weapons || [];
    var H = I.hz;
    if (!H) {
      if ((I.hzCount || 0) >= 2 || ctx.stepIndex < 1 || rng() > (env.danger == null ? 40 : env.danger) / 100 * 0.38) return;
      var b = pk(ctx, BEASTS);
      I.hz = H = { b: b, stage: 'sign' }; I.hzCount = (I.hzCount || 0) + 1;
      var f = ctx.most(P, function (c) { return c.tr.caution + c.tr.fc * 0.3 + rng() * 0.5; });
      ctx.act2({ actors: [f], cat: 'solo', fx: function () { P.forEach(function (c) { ctx.stress(c, 6); }); }, text: ctx.t(pk(ctx, b.sign), f), why: '島の危険な生き物（' + b.name + '）の気配' });
      return;
    }
    var B = H.b;
    if (H.stage === 'sign' || (H.stage === 'avoid' && rng() < 0.4)) {
      var v = ctx.most(P, function (c) { return (1 - c.tr.caution) + (c.action && /food|explore|hunting/.test(c.action.id) ? 0.4 : 0) + rng() * 0.6; });
      v.hp -= B.dmg + rng.int(8);
      if (B.venom) v.flags.venom = 3;
      ctx.act2({ actors: [v], cat: 'solo', fx: function () { P.forEach(function (c) { ctx.stress(c, 8); if (c !== v) ctx.mod(c, v, { aff: 3 }); }); }, text: ctx.t(pk(ctx, B.attack), v), why: B.name + 'の襲撃' + (B.venom ? '（毒）' : '') + '。' + v.name + 'の慎重さ ' + Math.round(v.tr.caution * 100) });
      if (v.hp <= 0) { ctx.kill(v, null, B.name + 'に襲われた'); ctx.flush(); }
      H.stage = 'council'; H.attacks = (H.attacks || 0) + 1;
      return;
    }
    if (H.stage === 'council') {
      var lead = ctx.most(P, function (c) { return c.tr.lead + c.tr.aggr * 0.5 + sk(ctx, c, 'hunt') * 0.1; });
      var shy = ctx.most(ctx.others(lead), function (c) { return c.tr.caution + c.tr.ac * 0.5; });
      var vote = P.reduce(function (s, c) { return s + c.tr.aggr + c.tr.cp * 0.5 + sk(ctx, c, 'hunt') * 0.12 - c.tr.caution * 0.8; }, 0) / P.length + (H.attacks >= 2 ? 0.4 : 0);
      var go = vote > 0.2 || rng() < 0.25;
      H.stage = go ? 'arm' : 'avoid';
      ctx.act2({ actors: [lead, shy], cat: go ? 'bond' : 'conflict', fx: function () { ctx.mod2(lead, shy, { ten: go ? 3 : 8 }, { ten: go ? 5 : 3 }); },
        text: go ? lead.name + '「このままじゃ、また誰かがやられる。こっちから' + B.name + 'を仕留めに行こう｜このままでは、また誰かがやられる。こちらから' + B.name + 'を仕留めに行こう｜このままでは、また誰かがやられます。こちらから' + B.name + 'を仕留めに行きましょう」' + shy.name + '「…本気？｜…本気か？｜…本気ですか？」' + lead.name + '「本気。まずは武器だ｜本気だ。まずは武器だ｜本気です。まずは武器です」' :
          lead.name + '「' + B.name + 'を退治しに行くべきだ｜＝｜' + B.name + 'を退治しに行くべきです」' + shy.name + '「危なすぎる。近づかなければいいだけでしょ｜危なすぎる。近づかなければいいだけだろう｜危なすぎます。近づかなければいいだけでしょう」結局、拠点の周りに近づかないことになった。',
        why: '討伐か回避か（全員の攻撃性・CP・狩猟と慎重さの綱引き）' });
      return;
    }
    if (H.stage === 'arm') {
      var makers = P.slice().sort(function (x, y) { return (sk(ctx, y, 'build') + sk(ctx, y, 'hunt') + y.tr.a * 2) - (sk(ctx, x, 'build') + sk(ctx, x, 'hunt') + x.tr.a * 2); }).slice(0, Math.min(3, P.length));
      var made = [];
      makers.forEach(function (m) {
        var w = pk(ctx, WEAPONS.filter(function (x) { return !I.weapons.some(function (y) { return y.n === x.n; }); }).concat(WEAPONS.slice(0, 1)));
        var q = sk(ctx, m, 'build') + sk(ctx, m, 'hunt') * 0.5 + rng() * 2;
        I.weapons.push({ n: w.n, q: q, by: m.i });
        made.push(ctx.t(w.t, m) + (q < 3 ? '…ちょっと頼りない。' : q > 6 ? '出来は上々だった。' : ''));
      });
      ctx.act2({ actors: makers, cat: 'help', fx: function () { makers.forEach(function (m) { ctx.others(m).forEach(function (o) { ctx.mod(o, m, { trust: 4 }); }); }); }, text: '討伐の準備。' + made.join(''), why: '拠点づくり・狩猟の腕で武器の出来が決まる' });
      H.stage = 'hunt';
      return;
    }
    if (H.stage === 'hunt') {
      var party = P.slice().sort(function (x, y) { return (y.tr.aggr + sk(ctx, y, 'hunt') * 0.2 + y.hp / 200) - (x.tr.aggr + sk(ctx, x, 'hunt') * 0.2 + x.hp / 200); }).slice(0, Math.min(3, P.length));
      var guard = ctx.most(P.filter(function (c) { return party.indexOf(c) < 0; }), function (c) { return c.tr.np + party.reduce(function (s, p) { return s + R(ctx, c, p).aff; }, 0) / 150; });
      if (guard && guard.tr.np > 0.6 && rng() < 0.5) party.push(guard);
      var wq = I.weapons.reduce(function (s, w) { return s + w.q; }, 0);
      var power = party.reduce(function (s, c) { return s + sk(ctx, c, 'hunt') * 0.04 + c.tr.aggr * 0.08 + c.tr.a * 0.03; }, 0) + wq * 0.012 + rng() * 0.5;
      var need = B.pow + 0.32 + rng() * 0.5;
      var offw = I.weapons.filter(function (w) { return !/盾|松明|落とし穴/.test(w.n); });
      var wpn = offw.length ? pk(ctx, offw).n : I.weapons.length ? pk(ctx, I.weapons).n : '素手';
      var hero = ctx.most(party, function (c) { return c.tr.aggr + sk(ctx, c, 'hunt') * 0.2 + rng() * 0.5; });
      var text, fx, cat = 'combat', why = '討伐隊の狩猟・攻撃性＋武器（' + I.weapons.map(function (w) { return w.n; }).join('・') + '）';
      var intro = names(party) + 'は' + wpn + 'を手に、' + B.name + 'の巣へ向かった。';
      if (power > need + 0.25) {
        fx = function () { party.forEach(function (c) { ctx.others(c).forEach(function (o) { ctx.mod(o, c, { trust: 8, aff: 4 }); }); party.forEach(function (d) { if (c !== d) ctx.mod(c, d, { trust: 10, aff: 6 }); }); }); P.forEach(function (c) { ctx.stress(c, -15); }); if (B.meat) ctx.food += B.meat; };
        text = intro + pk(ctx, [hero.name + 'の' + wpn + 'が、' + B.name + 'の頭を正確に捉えた。' + hero.name + '「…やった、やったぞ！｜＝｜…やった、やりました！」', '三方向から追い詰め、最後は' + hero.name + 'がとどめを刺した。帰り道、全員が少しだけ笑っていた。', hero.name + '「今だ！｜＝｜今です！」の合図で一斉にかかった。' + B.name + 'は動かなくなった。']) + (B.meat ? 'その夜は' + B.name + 'の肉で宴になった。' : '拠点に、ようやく安心が戻った。');
        H.stage = 'done'; I.slain = (I.slain || []).concat([{ b: B.name, hero: hero.i }]);
      } else if (power > need - 0.15) {
        var hurt = pk(ctx, party);
        fx = function () { hurt.hp -= B.dmg * 0.7; if (B.venom) hurt.flags.venom = 2; party.forEach(function (c) { ctx.stress(c, 6); }); if (B.meat) ctx.food += B.meat * 0.6; };
        text = intro + B.name + 'は仕留めた。だが' + hurt.name + 'が深手を負った。' + hurt.name + '「…平気。平気だから、そんな顔すんな｜…平気だ。平気だから、そんな顔をするな｜…平気です。平気ですから、そんな顔をしないでください」';
        H.stage = 'done'; I.slain = (I.slain || []).concat([{ b: B.name, hero: hero.i }]);
      } else {
        var down = pk(ctx, party);
        fx = function () { down.hp -= B.dmg * 1.3; if (B.venom) down.flags.venom = 3; P.forEach(function (c) { ctx.stress(c, 12); }); };
        text = intro + pk(ctx, [B.name + 'は想像以上に素早かった。' + down.name + 'がやられ、全員で引きずるようにして逃げ帰った。', wpn + 'は' + B.name + 'に弾かれた。' + down.name + '「逃げろ！｜＝｜逃げてください！」――撤退するしかなかった。']);
        H.stage = 'avoid'; why += '（力が及ばなかった）';
        cat = 'conflict';
      }
      ctx.act2({ actors: party, cat: cat, fx: fx, text: text, why: why, mag: 20 });
      party.forEach(function (c) { if (c.hp <= 0 && c.alive) ctx.kill(c, null, B.name + 'の討伐で命を落とした'); });
      ctx.flush();
      if (H.stage === 'avoid') H.retry = (H.retry || 0) + 1;
      if (H.stage === 'avoid' && H.retry < 2 && rng() < 0.5) H.stage = 'arm';
      return;
    }
    if (H.stage === 'done' && rng() < 0.5) I.hz = null;
  }

  var after0 = isl.after;
  isl.after = function (ctx, s, n) {
    after0(ctx, s, n);
    venomTick(ctx);
    hazardTurn(ctx);
  };
  HK.IslandHazard = { BEASTS: BEASTS, WEAPONS: WEAPONS };
})();
