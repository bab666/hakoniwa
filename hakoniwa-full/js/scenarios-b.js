/* 箱庭診断: 無人島 */
(function () {
  'use strict';
  var HK = window.HK;
  function R(ctx, a, b) { return ctx.R(a, b); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  /* 並びに無ければ足す（分割読み込みでは目録の並びが中核で先に作られている） */
  function add(s) { HK.SCENARIOS[s.id] = s; if (HK.SCEN_ORDER.indexOf(s.id) < 0) HK.SCEN_ORDER.push(s.id); }

  /* ======================= 無人島 ======================= */
  add({
    id: 'island', name: '無人島', kicker: 'サバイバル・共同生活',
    desc: '漂着した島で救助を待つ日々。食料が尽きれば体力が削れ、人間関係も削れる。',
    unit: '日', preRel: 0, lethal: true, factions: true,
    derived: ['caution', 'lead', 'cold', 'warmth'],
    env: [
      { id: 'days', label: '救助までの日数', min: 4, max: 15, def: 8, lo: '4日', hi: '15日', unit: '日' },
      { id: 'res', label: '島の資源', min: 0, max: 100, def: 50, lo: '岩だらけ', hi: '果物が実る' },
      { id: 'storm', label: '天候の荒さ', min: 0, max: 100, def: 40, lo: '凪', hi: '嵐続き' },
      { id: 'faction', label: '派閥が生まれる人数', min: 3, max: 8, def: 4, lo: '3人から', hi: '8人から', unit: '人以上', desc: 'この人数を下回ると派閥には分かれない。上回っても、引っぱる人や信頼がなければ生まれない。派閥をなくす・グループで固定する・リーダーを気質で決めるときは「派閥の決め方」「派閥のリーダー」で' },
      { id: 'bugs', label: '虫を食べる描写', type: 'select', def: 'yes', options: [{ v: 'yes', label: 'あり（幼虫やイナゴも食料になる）' }, { v: 'no', label: 'なし（虫は食料に出てこない）' }], desc: '「なし」にすると、採集で虫を捕まえたり、虫を料理したりする場面が出なくなる' },
      { id: 'rescue', label: '救助', type: 'select', def: 'yes', options: [{ v: 'yes', label: '最終日に船が来る' }, { v: 'no', label: '来ない（イカダで脱出するしかない）' }] }
    ],
    stats: [
      { id: 'hp', label: '体力', desc: '空腹や嵐、ケンカでの耐久' },
      { id: 'know', label: 'サバイバル知識', desc: '食料探しとイカダ作りの成功率' }
    ],
    actions: [
      { id: 'food', label: '食料を探しに行く', fit: function (t) { return t.np * 0.4 + t.a * 0.4; }, bias: { help: 1.6 } },
      { id: 'base', label: '拠点を作る', fit: function (t) { return t.a * 0.6 + t.caution * 0.4; }, bias: { solo: 1.3, escape: 1.3 } },
      { id: 'gather', label: '皆をまとめる', fit: function (t) { return t.lead; }, bias: { conflict: 1.4, bond: 1.3 } },
      { id: 'wait', label: '海を見て救助を待つ', fit: function (t) { return t.ac * 0.6 + (1 - t.a) * 0.4; }, bias: { solo: 1.8 } },
      { id: 'explore', label: '一人で島を探索する', fit: function (t) { return t.fc * 0.6 + t.cold * 0.4; }, bias: { solo: 1.6, escape: 1.4 } }
    ],
    goals: [
      { id: 'all', label: '全員で帰る', fit: function (t) { return t.np; }, bias: { help: 1.8, betray: 0.3 } },
      { id: 'self', label: '自分が生き延びる', fit: function (t) { return t.cold; }, bias: { betray: 2, help: 0.6 } },
      { id: 'lead', label: '島のリーダーになる', fit: function (t) { return t.lead; }, bias: { conflict: 1.7 } },
      /* 選ばれにくめ：FC（自由）やAC（元の生活の窮屈さ）が強くても、多くの人はまず帰りたい */
      { id: 'stay', label: '本当は帰りたくない', fit: function (t) { return (t.fc * 0.5 + t.ac * 0.3) * 0.85 - t.np * 0.04; }, bias: { bond: 1.5, romance: 1.4, escape: 0.3 } },
      { id: 'guard', label: '誰かを守る', fit: function (t) { return t.np * 0.7 + t.cp * 0.3; }, bias: { help: 2 }, needsFocus: true }
    ],
    steps: function (env) { var s = []; for (var i = 1; i <= env.days; i++) s.push(i + '日目'); return s; },
    setup: function (ctx) {
      ctx.place = '島';
      ctx.food = 20 + ctx.env.res * 0.6;
      ctx.flags.raft = 0;
      ctx.chars.forEach(function (c) { c.hp = 70 + ctx.stat(c, 'hp') * 6; c.flags.stash = 0; });
    },
    phase: function (ctx, s, n) {
      var P = ctx.present(), rng = ctx.rng;
      if (s === 0) ctx.say({ text: names(P) + 'は、見知らぬ浜辺で目を覚ました。' + (HK.Attr && HK.Attr.raceIntro ? HK.Attr.raceIntro(P, 'alert', ctx) : '') });
    },
    after: function (ctx) {
      var P = ctx.present(), need = P.length * 6;
      ctx.food += ctx.env.res / 100 * 6 * ctx.rng();
      if (ctx.food >= need) { ctx.food -= need; P.forEach(function (c) { c.hp = Math.min(100, c.hp + 3); }); }
      else {
        var short = 1 - ctx.food / need; ctx.food = 0;
        P.forEach(function (c) {
          if (c.flags.stash > 0) { c.flags.stash -= 6; return; }
          c.hp -= short * (10 + (5 - ctx.stat(c, 'hp')) * 3);
          c.stress = HK.clamp(c.stress + short * 15, 0, 100);
          if (c.hp <= 0) ctx.kill(c, null, '飢えと疲労で倒れた');
        });
      }
      if (ctx.flags.raft >= 100 && !ctx.flags.raftDone) {
        ctx.flags.raftDone = true;
        var builder = ctx.chars[ctx.flags.raftBy];
        if (builder && builder.alive && !builder.out && (ctx.env.rescue === 'no' || builder.goal.id !== 'stay')) {
          var crew = [builder].concat(ctx.others(builder).filter(function (o) { return R(ctx, builder, o).trust > 15 || builder.goal.id === 'all'; }).slice(0, 3));
          crew.forEach(function (c) { c.out = true; c.fate = 'イカダで脱出'; c.fateNote = builder.name + 'のイカダで海へ出た'; });
          ctx.flags.raftCrew = { by: builder.i, crew: crew.map(function (c) { return c.i; }), label: ctx.label };
          var left = ctx.present();
          left.forEach(function (o) { ctx.k = 1; ctx.mod(o, builder, { ten: 25, aff: -20, trust: -30 }); });
          ctx.say({ kind: 'event', cat: 'escape', actors: crew, text: 'イカダが完成した。' + names(crew) + 'が海へ漕ぎ出した。' + (left.length ? names(left) + 'は浜に残された。' : ''), why: builder.name + 'が選んだ乗員（信頼15以上）', mag: 40 });
        }
      }
    },
    end: function (ctx) { return ctx.present().length === 0; },
    finish: function (ctx) {
      var P = ctx.present();
      if (ctx.env.rescue === 'yes' || ctx.flags.radio) {
        if (ctx.flags.radio && ctx.env.rescue !== 'yes') ctx.say({ text: '修理した無線機の呼びかけが届いていた。' });
        P.forEach(function (c) {
          if (c.goal.id === 'stay' && ctx.rng() < 0.45) { c.fate = '島に残った'; c.fateNote = '救助船に乗らなかった'; }
          else { c.fate = '救助'; c.fateNote = '最終日の船で帰還した（体力 ' + Math.max(0, Math.round(c.hp)) + '）'; }
        });
        if (P.length) ctx.say({ text: '水平線に船影が見えた。' + names(P) + 'は浜で手を振った。' });
      } else P.forEach(function (c) { c.fate = '島に残った'; c.fateNote = '救助は来なかった'; });
    },
    events: [
      {
        id: 'forage', cat: 'help', scope: 'solo',
        w: function (ctx, a) { return 0.4 + a.tr.np * 0.4 + a.tr.a * 0.3 + (ctx.food < 20 ? 0.5 : 0); },
        run: function (ctx, a) {
          var ok = ctx.rng() < 0.25 + ctx.stat(a, 'know') * 0.1 + ctx.env.res / 300;
          if (!ok) { a.hp -= 4; ctx.stress(a, 8); return { cat: 'solo', text: ctx.t('{a}は半日歩き回ったが、手ぶらで戻ってきた。', a), why: 'サバイバル知識 ' + ctx.stat(a, 'know') + '・島の資源' }; }
          var amt = 10 + ctx.stat(a, 'know') * 4;
          if (a.goal.id === 'self' && a.tr.cold > 0.55) {
            a.flags.stash += amt * 0.6; ctx.food += amt * 0.4;
            return { cat: 'betray', text: ctx.t('{a}は魚を獲って戻った。持ち帰った量は、獲った量より少なかった。', a), why: a.name + 'の目標「自分が生き延びる」とドライさ' };
          }
          ctx.food += amt;
          ctx.others(a).forEach(function (o) { ctx.mod(o, a, { trust: 5, aff: 4 }); });
          return { text: ctx.t(ctx.pick(['{a}が岩場で貝を山ほど獲ってきた。その夜は久しぶりに腹が満ちた。', '{a}が森の奥で食べられる果実を見つけた。']), a), why: a.name + 'のNP・A／知識 ' + ctx.stat(a, 'know') };
        }
      },
      {
        id: 'stashfound', cat: 'conflict', scope: 'pair',
        when: function (ctx, a, b) { return b.flags.stash > 4; },
        w: function (ctx, a) { return a.tr.a * 0.8 + a.tr.cp * 0.4; },
        run: function (ctx, a, b) {
          ctx.food += b.flags.stash; b.flags.stash = 0;
          ctx.others(b).forEach(function (o) { ctx.mod(o, b, { trust: -25, ten: 20, aff: -10 }); });
          ctx.mod(b, a, { ten: 25 });
          return { text: ctx.t(ctx.few() ? '{a}が、{b}の寝床の下に隠された食料を見つけた。{a}は黙ってそれを半分に分けた。' : '{a}が、{b}の寝床の下に隠された食料を見つけた。全員の前で、それは山分けされた。', a, b), why: a.name + 'の観察力（A）とCP（不正を許さない）' };
        }
      },
      {
        id: 'firewatch', cat: 'bond', scope: 'pair',
        w: function (ctx, a, b) { return 0.4 + (R(ctx, a, b).aff + R(ctx, a, b).att) / 100; },
        run: function (ctx, a, b) {
          var rom = R(ctx, a, b).att > 30 && R(ctx, b, a).att > 25;
          ctx.mod2(a, b, { trust: 8, aff: 5, att: rom ? 7 : 2 }, { trust: 8, aff: 5, att: rom ? 7 : 2 });
          return { cat: rom ? 'romance' : 'bond', text: ctx.t(rom ? '火の番をしながら、{a}と{b}は肩を寄せて眠った。どちらから寄ったのかはわからない。' : '{a}と{b}が焚き火の番をした。島に来る前の話をした。', a, b), why: rom ? '互いの惹かれ' : '夜の静けさ' };
        }
      },
      {
        id: 'nurseisl', cat: 'help', scope: 'pair',
        when: function (ctx, a, b) { return b.hp < 60; },
        w: function (ctx, a, b) { return a.tr.np * 1.4 + (a.focus === b ? 1 : 0); },
        run: function (ctx, a, b) {
          b.hp = Math.min(100, b.hp + 15); a.hp -= 3;
          ctx.mod2(a, b, { aff: 5 }, { aff: 12, trust: 12, att: 5 });
          return { text: ctx.t('熱を出した{b}を、{a}が一晩中看病した。', a, b), why: a.name + 'のNP（' + Math.round(a.eg.NP) + '）と' + b.name + 'の体力低下（' + Math.round(b.hp) + '）' };
        }
      },
      {
        id: 'clash', cat: 'conflict', scope: 'pair',
        when: function (ctx, a, b) { return a.tr.lead > 0.5 && b.tr.lead > 0.5; },
        w: function (ctx, a) { return a.tr.lead + (a.goal.id === 'lead' ? 0.8 : 0); },
        run: function (ctx, a, b) {
          ctx.mod2(a, b, { ten: 15, aff: -5 }, { ten: 15, aff: -5 });
          ctx.others(a).forEach(function (o) { if (o !== b) ctx.stress(o, 5); });
          return { text: ctx.t('拠点の場所を巡って{a}と{b}が対立した。二人とも、自分の案を譲らなかった。', a, b), why: '二人とも主導性が高い（CP・A高、AC低）' };
        }
      },
      {
        id: 'raft', cat: 'escape', scope: 'solo',
        when: function (ctx) { return !ctx.flags.raftDone; },
        w: function (ctx, a) { return (a.tr.a * 0.6 + a.tr.fc * 0.2) * (a.goal.id === 'stay' ? 0.2 : 1) * (ctx.env.rescue === 'no' ? 1.8 : 0.6); },
        run: function (ctx, a) {
          var gain = 8 + ctx.stat(a, 'know') * 5 + ctx.rng() * 10;
          ctx.flags.raft += gain; ctx.flags.raftBy = ctx.flags.raftBy == null ? a.i : ctx.flags.raftBy;
          if (ctx.chars[ctx.flags.raftBy] !== a && ctx.rng() < 0.5) ctx.flags.raftBy = a.i;
          return { text: ctx.t('{a}は流木を集め、蔓で縛っていった。イカダの進み具合 ' + Math.min(100, Math.round(ctx.flags.raft)) + '%。', a), why: a.name + 'のA／知識 ' + ctx.stat(a, 'know') };
        }
      },
      {
        id: 'foodfight', cat: 'combat', scope: 'pair',
        when: function (ctx, a, b) { return ctx.food < 15 && (R(ctx, a, b).ten > 30 || a.stress > 60); },
        w: function (ctx, a) { return a.tr.aggr * 0.9 - 0.2; },
        run: function (ctx, a, b) {
          var r = ctx.fight(a, b, { lethality: 0.55, noEvade: true });
          return { text: ctx.t('最後の干し魚を巡って、{a}が{b}に掴みかかった。', a, b) + r.text, why: '飢え・緊張と' + a.name + 'の攻撃性。' + r.why };
        }
      },
      {
        id: 'sea', cat: 'solo', scope: 'solo',
        w: function (ctx, a) { return 0.2 + a.tr.ac * 0.4 + a.stress / 150 + (a.goal.id === 'stay' ? 0.4 : 0); },
        run: function (ctx, a) {
          ctx.stress(a, a.goal.id === 'stay' ? -15 : -5);
          return { text: ctx.t(a.goal.id === 'stay' ? '{a}は夕焼けの海を眺めていた。帰りたい、とは一度も口にしていない。' : '{a}は一人で海を眺めていた。水平線には何も見えない。', a), why: '目標「' + a.goal.label + '」' };
        }
      }
    ]
  });
})();
