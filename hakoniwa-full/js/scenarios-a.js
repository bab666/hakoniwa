/* 箱庭診断: 合コン／〇〇しないと出られない部屋／クラスメイト */
(function () {
  'use strict';
  var HK = window.HK;
  HK.SCENARIOS = HK.SCENARIOS || {};
  HK.SCEN_ORDER = HK.SCEN_ORDER || [];
  function R(ctx, a, b) { return ctx.R(a, b); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  function add(s) { HK.SCENARIOS[s.id] = s; HK.SCEN_ORDER.push(s.id); }

  /* ======================= 合コン ======================= */
  add({
    id: 'goukon', name: '合コン', kicker: '恋愛・社交',
    desc: '居酒屋の個室で一晩。酒が回るほど本音と衝動が出る。最後に誰と帰ったかで決着。',
    unit: '時刻', preRel: 0, lethal: false,
    derived: ['impulse', 'honesty', 'warmth', 'jealous'],
    env: [
      { id: 'alcohol', label: '酒の進み', min: 0, max: 100, def: 55, lo: 'ソフドリ', hi: '飲み放題の暴走' },
      { id: 'mood', label: '場の空気', min: 0, max: 100, def: 55, lo: 'しらけ', hi: '盛り上がり' },
      { id: 'second', label: '二次会', type: 'select', def: 'yes', options: [{ v: 'yes', label: 'カラオケまで行く' }, { v: 'no', label: '一次会で解散' }] },
      { id: 'kingsgame', label: '王様ゲーム', type: 'select', def: 'yes', options: [{ v: 'yes', label: 'やる' }, { v: 'no', label: 'やらない' }] }
    ],
    stats: [
      { id: 'drink', label: '酒の強さ', desc: '低いほど早く酔い、衝動性が上がる' },
      { id: 'looks', label: '見た目の自信', desc: '高いほど相手の第一印象（惹かれ）が上がる' }
    ],
    actions: [
      { id: 'watch', label: '端の席で様子見', fit: function (t) { return t.caution; }, bias: { solo: 1.8, romance: 0.7, bond: 0.8 } },
      { id: 'mc', label: '幹事として場を回す', fit: function (t) { return t.lead * 0.6 + t.warmth * 0.4; }, bias: { bond: 1.6, conflict: 1.2 } },
      { id: 'seat', label: '狙いの相手の隣を確保', fit: function (t) { return t.impulse * 0.6 + t.honesty * 0.4; }, bias: { romance: 1.8 } },
      { id: 'eat', label: '食べることに集中', fit: function (t) { return t.cold * 0.5 + t.fc * 0.3; }, bias: { solo: 1.5, romance: 0.6 } }
    ],
    goals: [
      { id: 'lover', label: '恋人を作る', fit: function (t) { return t.honesty * 0.5 + t.ac * 0.3; }, bias: { romance: 1.8 } },
      { id: 'friends', label: '友達を増やす', fit: function (t) { return t.warmth; }, bias: { bond: 1.6, romance: 0.7 } },
      { id: 'takehome', label: '誰かを持ち帰る', fit: function (t) { return t.impulse * 0.7 + t.cold * 0.3; }, bias: { romance: 2.2, bond: 0.7 } },
      { id: 'leave', label: '早く帰りたい', fit: function (t) { return t.cold * 0.6 + t.caution * 0.2; }, bias: { solo: 2, bond: 0.6, romance: 0.4 } },
      { id: 'cupid', label: '誰かの恋を応援する', fit: function (t) { return t.np * 0.8; }, bias: { help: 2 }, needsFocus: true }
    ],
    steps: function (env) {
      var s = ['19:00 乾杯', '19:40 自己紹介', '20:20 盛り上がり', '21:00 席替え', '21:40 王様ゲーム', '22:20 一次会終了'];
      if (env.kingsgame === 'no') s[4] = '21:40 宴たけなわ';
      if (env.second === 'yes') s.push('23:00 二次会・カラオケ', '24:00 終電');
      else s.push('22:40 店の前');
      return s;
    },
    setup: function (ctx) {
      ctx.place = '居酒屋の個室';
      ctx.chars.forEach(function (c) {
        c.flags.drunk = 0; c.baseTr = JSON.parse(JSON.stringify(c.tr));
        ctx.others(c).forEach(function (o) { if (HK.canLove(o, c)) ctx.R(o, c).att = HK.clamp(ctx.R(o, c).att + (ctx.stat(c, 'looks') - 3) * 6, 0, 100); });
      });
    },
    phase: function (ctx, s) {
      var P = ctx.present(), rng = ctx.rng;
      if (s === 0) ctx.say({ text: names(P) + 'がグラスを合わせた。' + (ctx.env.mood > 60 ? '最初から妙に空気がいい。' : ctx.env.mood < 35 ? '乾杯の声が少しだけ揃わなかった。' : '') });
      if (s === 3 && P.length > 2) {
        var sh = rng.shuffle(P);
        for (var i = 0; i + 1 < sh.length; i += 2) {
          ctx.R(sh[i], sh[i + 1]).att += 4; ctx.R(sh[i + 1], sh[i]).att += 4;
        }
        ctx.say({ text: '席替え。' + sh.map(function (c) { return c.name; }).join('、') + 'の順に座り直した。' });
      }
      if (s === 4 && ctx.env.kingsgame === 'yes' && P.length >= 2) {
        var two = rng.shuffle(P).slice(0, 2), a = two[0], b = two[1];
        var lines = ['見つめ合って10秒', 'ポッキーゲーム', '相手のいいところを3つ言う'];
        var order = rng.pick(lines);
        ctx.k = 1; ctx._mag = 0; ctx._touched = {};
        var shyA = a.tr.ac > 0.6, shyB = b.tr.ac > 0.6;
        ctx.mod2(a, b, { att: shyA ? 12 : 7 }, { att: shyB ? 12 : 7 });
        var txt = '王様の命令で、' + a.name + 'と' + b.name + 'が「' + order + '」をすることになった。';
        if (a.tr.cp > 0.7 || b.tr.cp > 0.7) { txt += (a.tr.cp > b.tr.cp ? a.name : b.name) + 'は最後まで渋い顔をしていた。'; ctx.mod2(a, b, { ten: 6 }, { ten: 6 }); }
        else if (shyA || shyB) txt += (shyA ? a.name : b.name) + 'の耳が赤い。';
        else txt += '二人とも案外ノリノリだった。';
        var e = ctx.say({ kind: 'event', cat: 'romance', actors: [a, b], text: txt, why: '王様ゲーム（ランダム）。反応はCP・ACで分かれる', mag: ctx._mag });
        ctx.pair(a, b).moments.push({ n: e.n, mag: e.mag });
      }
    },
    after: function (ctx) {
      ctx.present().forEach(function (c) {
        c.stress = HK.clamp(c.stress + 3 + c.tr.ac * 6 - c.tr.fc * 2 + (ctx.crush(c, 50) ? 2 : 0), 0, 100);
        var gain = ctx.env.alcohol / 100 * (6 - ctx.stat(c, 'drink')) * (2 + ctx.rng() * 4);
        c.flags.drunk = HK.clamp(c.flags.drunk + gain, 0, 100);
        c.tr.impulse = HK.clamp(c.baseTr.impulse + c.flags.drunk / 220);
        c.tr.honesty = HK.clamp(c.baseTr.honesty + c.flags.drunk / 260);
        c.tr.a = HK.clamp(c.baseTr.a - c.flags.drunk / 300);
      });
    },
    finish: function (ctx) {
      var P = ctx.present(), used = {}, rng = ctx.rng, out = [];
      /* 夜のあと（全年齢でも出る短い一文） */
      var SOFT_END = {
        keep: ['朝、二人は何事もなかったように並んで歯を磨いた。', '翌朝、二人はいつもより少し長く、玄関でキスをした。'],
        lover: ['朝、二人は「ちゃんと付き合おう」と言い合った。', '翌朝の二人は、もう恋人の顔をしていた。'],
        fwb: ['朝、二人は「またね」とだけ言って別れた。恋人ではない「また」だった。', '二人とも、「好き」とは言わなかった。'],
        forget: ['翌朝、二人は昨夜のことをなかったことにした。', '朝になると、二人は他人の顔に戻っていた。'],
        unsure: ['連絡先だけは交換した。その先は、まだ決まっていない。', '「これって何なんだろうね」――答えは、まだ出ていない。']
      };
      function tieHas(a, b, t) { return HK.Ties && HK.Ties.has ? HK.Ties.has(ctx, a, b, t) : false; }
      function nightOutcome(ctx, a, b, fwb) {
        var pf = ctx.pair(a, b), ab = R(ctx, a, b), ba = R(ctx, b, a), mutual = Math.min(ab.aff, ba.aff), dry = (a.tr.cold + b.tr.cold) / 2;
        if (fwb) return 'fwb';
        if (tieHas(a, b, 'lover') || tieHas(a, b, 'mate')) return 'keep';
        if (pf.couple) return 'lover';
        var imp = (a.tr.impulse + b.tr.impulse) / 2, warm = (a.tr.warmth + b.tr.warmth) / 2;
        /* 好意が深く、二人とも誠実寄りなら恋人に。ドライさ・衝動の強さが勝てば、なかったことに */
        if (mutual >= 46 && Math.min(ab.att, ba.att) >= 58 && warm > 0.42) return 'lover';
        if (mutual < 26 || dry > 0.56 || (tieHas(a, b, 'rival') && mutual < 36) || (imp > 0.72 && mutual < 36)) return 'forget';
        return 'unsure';
      }
      var cand = [];
      for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) {
        var a = P[i], b = P[j], ab = R(ctx, a, b), ba = R(ctx, b, a);
        var v = Math.min(ab.att, ba.att) + Math.min(ab.aff, ba.aff) * 0.5 + (ctx.pair(a, b).couple ? 30 : 0);
        cand.push({ a: a, b: b, v: v });
      }
      cand.sort(function (x, y) { return y.v - x.v; });
      cand.forEach(function (c) {
        if (used[c.a.i] || used[c.b.i] || c.v < 55 || !HK.canLove(c.a, c.b) || !HK.canLove(c.b, c.a)) return;
        used[c.a.i] = used[c.b.i] = 1;
        var imp = (c.a.tr.impulse + c.b.tr.impulse) / 2;
        var night = imp > 0.55 && rng() < imp * 0.9;
        if (night) ctx.pair(c.a, c.b).night = true;
        c.a.fate = c.b.fate = night ? 'お持ち帰り' : '一緒に帰った';
        (ctx.flags.together = ctx.flags.together || []).push({ a: c.a.i, b: c.b.i, night: night });
        c.a.fateNote = c.b.name + 'と' + (night ? '同じ部屋に帰った' : '同じ方向の電車に乗った');
        c.b.fateNote = c.a.name + 'と' + (night ? '同じ部屋に帰った' : '同じ方向の電車に乗った');
        ctx.k = 1; ctx._mag = 0; ctx._touched = {};
        ctx.mod2(c.a, c.b, { att: 10, aff: 6 }, { att: 10, aff: 6 });
        /* R18版：お持ち帰りのあとの夜（solo-goukon-night.js。全年齢版・全年齢モードでは null） */
        /* その夜のあと、二人はどうなるか（恋人／セフレ／なかったことに／まだ答えが出ない）。数値で決まり、関係にも反映する */
        var fwbNow = night && !ctx.pair(c.a, c.b).couple && !tieHas(c.a, c.b, 'lover') && !tieHas(c.a, c.b, 'mate') && HK.FWB && HK.FWB.decide(ctx, c.a, c.b);
        var outc = night ? nightOutcome(ctx, c.a, c.b, fwbNow) : null;
        if (outc) { var on = { keep: '恋人どうしの夜を過ごした', lover: 'そのまま付き合うことになった', fwb: '恋人ではない関係に落ち着いた', forget: '翌朝、なかったことにした', unsure: '関係はまだ決まっていない' }[outc]; c.a.fateNote += '。' + on; c.b.fateNote += '。' + on; }
        var gn = night && HK.GoukonNight ? HK.GoukonNight(ctx, c.a, c.b, outc) : null;
        if (outc === 'lover' || outc === 'keep') ctx.pair(c.a, c.b).couple = true;
        if (outc === 'forget') ctx.pair(c.a, c.b).forgot = true;
        var e = ctx.say({ kind: 'event', cat: 'romance', actors: [c.a, c.b], text: night ? c.a.name + 'と' + c.b.name + 'は、店を出たあと同じタクシーに乗った。' + (gn ? gn.text : 'その先のことは、二人しか知らない。') + (gn ? '' : (function () {
          /* 受け攻めの指定どおりの「翌朝」 */
          var tb = HK.Pos ? HK.Pos.order(c.a, c.b, [c.a, c.b]) : [c.a, c.b];
          return ctx.t(rng.pick(['――翌朝、{b}は少しだけ腰をかばうように歩いていた。{a}はそれに気づいて、黙って{b}の荷物を持った。', '――翌朝、{a}の背中には{b}の爪の痕が残っていた。{b}は目を合わせずに「……強すぎ」とだけ言った。', '――翌朝、{b}は{a}のシャツを着たまま、ベッドから起き上がれずにいた。', '――翌朝、{a}は先に起きて、まだ眠っている{b}の髪をそっと撫でた。']), tb[0], tb[1]);
        })()) + (!gn && outc ? rng.pick(SOFT_END[outc]) : '') : c.a.name + 'と' + c.b.name + 'は駅まで一緒に歩いた。改札で別れるのに少し時間がかかった。', why: '互いの惹かれ（' + Math.round(Math.min(R(ctx, c.a, c.b).att, R(ctx, c.b, c.a).att)) + '）' + (night ? 'と酔いによる衝動性' : '') + (gn ? '／夜：' + gn.label : outc ? '／その後：' + { keep: '恋人のまま', lover: '恋人になる', fwb: 'セフレに落ち着く', forget: 'なかったことにする', unsure: 'まだ答えが出ない' }[outc] : ''), mag: 25 });
        ctx.pair(c.a, c.b).moments.push({ n: e.n, mag: 25 });
        if (fwbNow) {
          HK.FWB.mark(ctx, c.a, c.b);
          var e2 = ctx.say({ kind: 'event', cat: 'romance', actors: [c.a, c.b], text: '翌朝。' + HK.FWB.after(ctx, c.a, c.b), why: '二人とも「恋人より気楽な関係」寄り（ドライさ・衝動性）', mag: 15 });
          ctx.pair(c.a, c.b).moments.push({ n: e2.n, mag: 15 });
        }
      });
      P.forEach(function (c) {
        if (used[c.i]) return;
        if (c.flags.drunk > 88) { c.fate = '潰れた'; c.fateNote = '最後は誰かに肩を借りて帰った'; }
        else { c.fate = '一人で帰った'; c.fateNote = c.goal.id === 'leave' ? '目標どおり、さっさと帰った' : '終電の窓に映る自分の顔を見ていた'; }
        out.push(c);
      });
    },
    events: [
      {
        id: 'drink', cat: 'solo', scope: 'solo',
        w: function (ctx, a) { return ctx.env.alcohol / 100 * (0.4 + a.tr.fc * 0.5 + a.stress / 120); },
        run: function (ctx, a) {
          a.flags.drunk = HK.clamp(a.flags.drunk + 12 * (6 - ctx.stat(a, 'drink')) / 3, 0, 100);
          return { text: ctx.t(a.flags.drunk > 70 ? '{a}の呂律が怪しくなってきた。' : '{a}のグラスがまた空になった。', a), why: '酒の強さ ' + ctx.stat(a, 'drink') + '／酔い ' + Math.round(a.flags.drunk) };
        }
      },
      {
        id: 'nurse', cat: 'help', scope: 'pair',
        when: function (ctx, a, b) { return b.flags.drunk > 55; },
        w: function (ctx, a, b) { return a.tr.np * 1.3; },
        run: function (ctx, a, b) {
          ctx.mod2(a, b, { aff: 3, att: 3 }, { aff: 10, trust: 10, att: 6 });
          return { text: ctx.t('{a}は酔った{b}に水を渡し、上着を取ってやった。', a, b), why: a.name + 'のNP（' + Math.round(a.eg.NP) + '）と' + b.name + 'の酔い' };
        }
      },
      {
        id: 'contact', cat: 'romance', scope: 'pair',
        when: function (ctx, a, b) { return R(ctx, a, b).att > 25 && !ctx.pair(a, b).contact; },
        w: function (ctx, a) { return 0.4 + a.tr.honesty * 0.8; },
        run: function (ctx, a, b) {
          var rb = R(ctx, b, a);
          ctx.pair(a, b).contact = true;
          if (rb.att < 12 && b.tr.cold > 0.6) {
            ctx.mod(a, b, { att: -4 });
            return { text: ctx.t('{a}が連絡先を聞いた。{b}は「あとでグループに貼っといて」とかわした。', a, b), why: b.name + 'のドライさ、' + a.name + 'への関心の薄さ' };
          }
          ctx.mod2(a, b, { att: 6, trust: 3 }, { att: 6, trust: 3 });
          return { text: ctx.t('{a}と{b}が連絡先を交換した。', a, b), why: a.name + 'の積極性（本音の出やすさ）' };
        }
      },
      {
        id: 'wingman', cat: 'help', scope: 'pair',
        when: function (ctx, a, b) { var c = ctx.crush(b, 45); return c && c !== a && c.alive && !c.out; },
        w: function (ctx, a, b) { return (a.tr.np * 0.7 + a.tr.fc * 0.3) * (a.focus === b ? 2.5 : 1); },
        run: function (ctx, a, b) {
          var c = ctx.crush(b, 45);
          ctx.mod(b, a, { trust: 8, aff: 5 });
          ctx.mod2(b, c, { att: 6 }, { att: 7, aff: 4 });
          if (R(ctx, a, c).att > 35) { ctx.mod(a, c, { att: 4 }); ctx.stress(a, 12); }
          return { with: [c], text: ctx.t('{a}はさりげなく席を立ち、{b}と{c}を二人きりにした。', a, b, c), why: a.name + 'のNP' + (R(ctx, a, c).att > 35 ? '。ただし' + a.name + '自身も' + c.name + 'が気になっていた' : '') };
        }
      },
      {
        id: 'outside', cat: 'romance', scope: 'pair',
        when: function (ctx, a, b) { return R(ctx, a, b).att > 35 && R(ctx, b, a).att > 20; },
        w: function (ctx, a) { return 0.3 + a.tr.impulse * 0.9; },
        run: function (ctx, a, b) {
          ctx.mod2(a, b, { att: 9, trust: 5, aff: 4 }, { att: 9, trust: 5, aff: 4 });
          return { text: ctx.t('「ちょっと外の空気吸ってくる」と言った{a}に、{b}がついてきた。戻ってくるまで十五分かかった。', a, b), why: '互いの惹かれと' + a.name + 'の衝動性' };
        }
      },
      {
        id: 'phone', cat: 'solo', scope: 'solo',
        w: function (ctx, a) { return a.tr.cold * 0.6 * (1.2 - ctx.env.mood / 100); },
        run: function (ctx, a) {
          ctx.others(a).forEach(function (o) { ctx.mod(o, a, { aff: -3 }); });
          return { text: ctx.t('{a}はテーブルの下でスマホを見ていた。', a), why: a.name + 'のドライさと場の空気' };
        }
      },
      {
        id: 'monopolize', cat: 'conflict', scope: 'pair',
        when: function (ctx, a, b) { var c = ctx.crush(b, 40); return c && c !== a; },
        w: function (ctx, a) { return a.tr.fc * a.tr.cp * 1.4; },
        run: function (ctx, a, b) {
          var c = ctx.crush(b, 40);
          ctx.mod(a, c, { att: 3 });
          ctx.mod(b, a, { ten: 12, aff: -6 });
          return { with: [c], text: ctx.t('{a}が{c}との会話を独占した。{b}は相槌を打つしかなかった。', a, b, c), why: a.name + 'のFC×CP（自分が中心にいたい）' };
        }
      }
    ]
  });

  /* ======================= クラスメイト ======================= */
  var MONTHS = ['4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'];
  add({
    id: 'classroom', name: 'クラスメイト', kicker: '日常・一年間',
    desc: '同じクラスで過ごす一年。テスト、体育祭、文化祭、修学旅行。行事ごとに関係が動く。',
    unit: '月', preRel: 4, lethal: false, factions: true, maxCast: 30,
    derived: ['warmth', 'lead', 'jealous', 'caution'],
    env: [
      { id: 'grade', label: '学年', type: 'select', def: '2', options: [{ v: '1', label: '高校1年' }, { v: '2', label: '高校2年（修学旅行あり）' }, { v: '3', label: '高校3年（受験）' }] },
      { id: 'climate', label: 'クラスの雰囲気', min: 0, max: 100, def: 55, lo: '荒れている', hi: '仲がいい' },
      { id: 'faction', label: '派閥が生まれる人数', min: 3, max: 8, def: 4, lo: '3人から', hi: '8人から', unit: '人以上', desc: 'この人数を下回ると派閥には分かれない。上回っても、引っぱる人や信頼がなければ生まれない' },
      { id: 'bully', label: 'いじめ', type: 'select', def: 'auto', options: [{ v: 'auto', label: 'あり（気質と雰囲気しだい）' }, { v: 'high', label: 'あり（起きやすい）' }, { v: 'off', label: 'なし' }], desc: '「なし」にすると、いじめも陰口・嫌がらせの小さな出来事も起きない' },
      { id: 'span', label: '期間', type: 'select', def: 'year', options: [{ v: 'year', label: '一年間' }, { v: 'term', label: '一学期だけ' }] }
    ],
    stats: [
      { id: 'study', label: '学力', desc: 'テストの順位に影響' },
      { id: 'sport', label: '運動', desc: '体育祭の活躍に影響' }
    ],
    actions: [
      { id: 'talky', label: '自分から話しかけまくる', fit: function (t) { return t.warmth; }, bias: { bond: 1.7 } },
      { id: 'club', label: '部活に打ち込む', fit: function (t) { return t.fc * 0.5 + t.a * 0.3; }, bias: { solo: 1.5 } },
      { id: 'rep', label: '委員長に立候補する', fit: function (t) { return t.lead; }, bias: { conflict: 1.3, help: 1.3 } },
      { id: 'window', label: '窓際の席でひとり', fit: function (t) { return t.cold * 0.6 + t.ac * 0.4; }, bias: { solo: 2, bond: 0.6 } }
    ],
    goals: [
      { id: 'lover', label: '恋人を作る', fit: function (t) { return t.honesty * 0.5 + t.fc * 0.4; }, bias: { romance: 1.9 } },
      { id: 'peace', label: '平穏に過ごす', fit: function (t) { return t.ac * 0.6 + t.caution * 0.4; }, bias: { conflict: 0.5, solo: 1.3 } },
      { id: 'center', label: 'クラスの中心になる', fit: function (t) { return t.lead * 0.6 + t.fc * 0.4; }, bias: { bond: 1.4, conflict: 1.3 } },
      { id: 'beat', label: '誰かに勝つ', fit: function (t) { return t.cp * 0.6 + t.aggr * 0.4; }, bias: { conflict: 1.8 }, needsFocus: true },
      { id: 'watch', label: '誰かを見守る', fit: function (t) { return t.np; }, bias: { help: 2, romance: 1.2 }, needsFocus: true }
    ],
    steps: function (env) { return env.span === 'term' ? MONTHS.slice(0, 4) : MONTHS.slice(); },
    setup: function (ctx) {
      ctx.place = '教室';
      ctx.chars.forEach(function (a) { ctx.others(a).forEach(function (b) { ctx.R(a, b).ten = HK.clamp(ctx.R(a, b).ten + (50 - ctx.env.climate) / 8, 0, 100); }); });
    },
    phase: function (ctx, s, n) {
      var P = ctx.present(), rng = ctx.rng, m = ctx.label;
      var e;
      if (s === 0) ctx.say({ text: '始業式。' + names(P) + 'は同じクラスになった。' });
      if (m === '5月' || m === '12月') {
        var rank = P.map(function (c) { return { c: c, v: ctx.stat(c, 'study') * 10 + rng() * 25 + c.tr.a * 10 }; }).sort(function (x, y) { return y.v - x.v; });
        var top = rank[0].c, bot = rank[rank.length - 1].c;
        ctx.say({ text: (m === '5月' ? '中間' : '期末') + 'テストの結果が出た。トップは' + top.name + '、最下位は' + bot.name + '。' });
        P.forEach(function (c) { if (c !== top && c.tr.cp > 0.6) { ctx.k = 1; ctx.R(c, top).ten += 8; } });
        if (ctx.env.grade === '3') P.forEach(function (c) { c.stress = HK.clamp(c.stress + 10, 0, 100); });
      }
      if (m === '11月' && ctx.env.grade === '2' && P.length >= 2) {
        var sh = rng.shuffle(P);
        ctx.say({ text: '修学旅行。消灯後、部屋のあちこちで話し声が続いた。' });
        for (var i = 0; i + 1 < sh.length; i += 2) {
          ctx.k = 1; ctx._mag = 0; ctx._touched = {};
          var a = sh[i], b = sh[i + 1];
          ctx.mod2(a, b, { trust: 8, att: 4 }, { trust: 8, att: 4 });
          var ab = R(ctx, a, b);
          e = ctx.say({ kind: 'event', cat: ab.att > 35 ? 'romance' : 'bond', actors: [a, b], text: ab.att > 35 ? a.name + 'と' + b.name + 'は、旅館の廊下の自販機の前で偶然二人になった。' : a.name + 'と' + b.name + 'は同じ布団の列で、眠くなるまで話した。', why: '修学旅行の夜（ランダムな組み合わせ）', mag: ctx._mag });
          ctx.pair(a, b).moments.push({ n: e.n, mag: e.mag });
        }
      }
      if (HK.ClassLife) HK.ClassLife.month(ctx, s, n);
    },
    after: function (ctx, s, n) { if (HK.ClassLife) HK.ClassLife.after(ctx, s, n); },
    finish: function (ctx) {
      var g = ctx.env.grade === '3';
      if (HK.ClassLife) HK.ClassLife.finish(ctx);
      ctx.present().forEach(function (c) {
        if (c.stress > 75) { c.fate = '休みがちに'; c.fateNote = '三学期は教室にいないことが増えた'; }
        else { c.fate = g ? '卒業' : '進級'; c.fateNote = g ? '卒業式の日、' + (ctx.closest(c) ? ctx.closest(c).name + 'と写真を撮った' : '一人で校門を出た') : (ctx.closest(c) ? ctx.closest(c).name + 'と同じクラスになりたいと思っている' : '春休みを待っている'); }
      });
    },
    events: [
      {
        id: 'studytogether', cat: 'bond', scope: 'pair',
        w: function (ctx, a, b) { return 0.2 + Math.abs(ctx.stat(a, 'study') - ctx.stat(b, 'study')) * 0.12 + a.tr.np * 0.3; },
        run: function (ctx, a, b) {
          var teach = ctx.stat(a, 'study') >= ctx.stat(b, 'study');
          ctx.mod2(a, b, { aff: 5, trust: 4 }, { aff: 5, trust: teach ? 8 : 3, att: teach ? 4 : 0 });
          return { text: ctx.t(teach ? '放課後、{a}が{b}に数学を教えた。{b}の方が先に問題を解き終えて、{a}が悔しがった。' : '{a}は{b}にノートを借りた。字が思ったより丁寧だった。', a, b), why: '学力差（' + ctx.stat(a, 'study') + '／' + ctx.stat(b, 'study') + '）' };
        }
      },
      {
        id: 'rumor', cat: 'betray', scope: 'pair',
        when: function (ctx, a, b) { return R(ctx, a, b).ten > 25 || ctx.pair(a, b).jealous > 0; },
        w: function (ctx, a) { return a.tr.jealous * 0.8 * (1.2 - ctx.env.climate / 100) - 0.15; },
        run: function (ctx, a, b) {
          ctx.others(b).forEach(function (o) { if (o !== a) ctx.mod(o, b, { aff: -4, ten: 4 }); });
          ctx.stress(b, 20);
          var found = ctx.rng() < 0.4 + b.tr.a * 0.3;
          if (found) ctx.mod(b, a, { ten: 30, aff: -25, trust: -35 });
          return { text: ctx.t('{b}についての妙な噂がクラスに流れた。出どころは{a}だった。' + (found ? '{b}はそれを突き止めた。' : '{b}はまだ知らない。'), a, b), why: a.name + 'の嫉妬・執着（' + Math.round(a.tr.jealous * 100) + '）と、クラスの雰囲気' };
        }
      },
      {
        id: 'lunch', cat: 'bond', scope: 'pair',
        w: function (ctx, a, b) { return 0.3 + a.tr.warmth * 0.5 + Math.max(0, R(ctx, a, b).aff) / 100; },
        run: function (ctx, a, b) {
          ctx.mod2(a, b, { aff: 5, trust: 3 }, { aff: 5, trust: 3 });
          return { text: ctx.t(ctx.pick(['昼休み、{a}と{b}は屋上で弁当を食べた。', '{a}が購買の最後の焼きそばパンを{b}に譲った。']), a, b), why: '日常の積み重ね' };
        }
      },
      {
        id: 'skip', cat: 'bond', scope: 'pair',
        when: function (ctx, a, b) { return R(ctx, a, b).aff > 15; },
        w: function (ctx, a, b) { return a.tr.fc * b.tr.fc * 1.2 * (1 - a.tr.ac); },
        run: function (ctx, a, b) {
          ctx.mod2(a, b, { aff: 8, att: 5, trust: 6 }, { aff: 8, att: 5, trust: 6 });
          return { text: ctx.t('{a}が{b}を誘って五限をサボった。河川敷で、何をするでもなく時間を潰した。', a, b), why: '二人ともFC高・AC低' };
        }
      },
      {
        id: 'rivalry', cat: 'conflict', scope: 'pair',
        w: function (ctx, a, b) { return a.tr.cp * 0.6 * (a.focus === b ? 2.5 : 0.6) + (b.tr.cp > 0.6 ? 0.2 : 0); },
        run: function (ctx, a, b) {
          var win = ctx.rng() < 0.5 + (ctx.stat(a, 'study') - ctx.stat(b, 'study')) * 0.08;
          ctx.mod2(a, b, { ten: 8, att: 3 }, { ten: 8, att: 3 });
          if (!win) ctx.stress(a, 10);
          return { text: ctx.t(win ? '小テストで{a}が{b}に勝った。{a}はわざわざ点数を見せに行った。' : '{a}はまた{b}に負けた。答案を握りしめた手に力が入った。', a, b), why: a.name + 'のCP（負けず嫌い）' + (a.focus === b ? '。' + b.name + 'を目標にしている' : '') };
        }
      },
      {
        id: 'club', cat: 'solo', scope: 'solo',
        w: function (ctx, a) { return 0.3 + a.tr.fc * 0.3 + (a.action.id === 'club' ? 0.6 : 0); },
        run: function (ctx, a) {
          ctx.stress(a, -12);
          return { text: ctx.t('{a}は部活に打ち込んでいた。教室にいる時間は少なかった。', a), why: '初動「' + a.action.label + '」' };
        }
      }
    ]
  });
})();
