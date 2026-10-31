/* 箱庭診断: 無人島の暮らし（得意分野・釣りと料理・拠点・飢え・裏切りの発覚と謝罪） */
(function () {
  'use strict';
  var HK = window.HK;
  var isl = HK.SCENARIOS.island;
  if (!isl) return;
  function R(ctx, a, b) { return ctx.R(a, b); }
  function names(list) { return list.map(function (c) { return c.name; }).join('・'); }
  function pk(ctx, arr) { return arr[ctx.rng.int(arr.length)]; }
  function sk(ctx, c, id) { return ctx.stat(c, id); }

  /* ---------- 得意分野 ---------- */
  isl.stats = isl.stats.concat([
    { id: 'cook', label: '料理', desc: '同じ食材でも豪華な料理にできる。うまい食事は体力と気持ちを回復させる' },
    { id: 'fish', label: '釣り', desc: '大物が釣れる確率。漁獲量にも効く' },
    { id: 'hunt', label: '狩猟', desc: '鳥や獣を獲る力。危険な獲物に返り討ちに遭いにくい' },
    { id: 'build', label: '拠点づくり', desc: '寝床や屋根を整える力。拠点がよいほど夜にしっかり回復する' }
  ]);
  isl.actions = isl.actions.concat([
    { id: 'fishing', label: '釣りに行く', fit: function (t) { return t.a * 0.4 + t.caution * 0.3 + (1 - t.fc) * 0.2; }, bias: { solo: 1.3, help: 1.3 } },
    { id: 'hunting', label: '狩りに出る', fit: function (t) { return t.aggr * 0.6 + t.fc * 0.3; }, bias: { solo: 1.4, combat: 1.2 } },
    { id: 'cooking', label: '料理番をする', fit: function (t) { return t.np * 0.6 + t.fc * 0.2; }, bias: { help: 1.6, bond: 1.3 } }
  ]);
  isl.env = isl.env.concat([
    { id: 'dark', label: '飢えの果て', type: 'select', def: 'yes', options: [{ v: 'yes', label: 'あり（殺し合い・人を食べることも）' }, { v: 'mild', label: '揉めるまで' }] }
  ]);

  /* ---------- 食材と料理 ---------- */
  var FISH = [
    ['ハゼ', 1, 3], ['小アジ', 1, 4], ['ベラ', 1, 3], ['カサゴ', 2, 5], ['メバル', 2, 5], ['アジ', 2, 6], ['サバ', 2, 7], ['イサキ', 3, 8],
    ['タコ', 3, 8], ['フグ', 3, 8], ['イカ', 3, 7], ['ヒラメ', 4, 10], ['真鯛', 4, 12], ['カツオ', 4, 14], ['伊勢海老', 5, 10], ['大きなハタ', 5, 16],
    ['ボラ', 1, 4], ['ブダイ', 2, 6], ['ハリセンボン', 2, 5], ['ウツボ', 3, 9], ['シイラ', 4, 13], ['アオリイカ', 4, 9]
  ];
  var GAME = [['野鳥', 1, 5], ['ハト', 1, 4], ['カモ', 2, 7], ['ヤシガニ', 2, 7], ['野ウサギ', 2, 8], ['大トカゲ', 2, 8], ['海鳥の卵', 1, 4], ['ヘビ', 2, 5], ['野ヤギ', 4, 16], ['イノシシ', 5, 22]];
  /* 採集：[名前, 量, 毒のおそれ, 動詞] */
  var FORAGE = [
    ['ヤシの実', 4], ['バナナ', 5], ['マンゴー', 5], ['パパイヤ', 5], ['グアバ', 3], ['パッションフルーツ', 3], ['野生のパイナップル', 4], ['野イチゴ', 2], ['イチジク', 3],
    ['スターフルーツ', 3], ['ライム', 2], ['ドラゴンフルーツ', 4], ['サトウキビ', 3], ['マカダミアナッツ', 3], ['クルミ', 3],
    ['貝', 5], ['ハマグリ', 5], ['サザエ', 5], ['トコブシ', 4], ['カキ', 5], ['ウニ', 4], ['ナマコ', 4], ['カニ', 4], ['海藻', 3],
    ['野草', 2], ['山芋', 5], ['タロイモ', 6], ['ヤムイモ', 6], ['野生のネギ', 2], ['ツワブキ', 2], ['長命草', 2], ['アロエ', 2], ['ノビル', 2],
    ['ヒラタケに似たキノコ', 3, 0.15], ['タマゴタケ', 3, 0.25], ['アミガサタケ', 3, 0.1], ['キクラゲ', 3, 0], ['白い傘のキノコ', 3, 0.5], ['派手な赤いキノコ', 3, 0.8],
    ['カブトムシの幼虫', 3, 0, '掘り出した'], ['セミ', 2, 0, '捕まえた'], ['イナゴ', 2, 0, '捕まえた'], ['コオロギ', 2, 0, '捕まえた'], ['カミキリムシの幼虫', 3, 0, '掘り出した'], ['カブトムシ', 2, 0, '捕まえた'], ['シロアリ', 2, 0, '集めた']
  ];
  /* 「虫を食べる描写：なし」のときの採集リスト */
  var FORAGE_NOBUG = FORAGE.filter(function (f) { return !/幼虫|セミ|イナゴ|コオロギ|カブトムシ|シロアリ|ムシ/.test(f[0]); });
  function catchFish(ctx, c) {
    var s = sk(ctx, c, 'fish'), tier = Math.min(5, Math.max(1, Math.round(s * 0.7 + ctx.rng() * 2.4 + ctx.env.res / 60 - 0.6)));
    var list = FISH.filter(function (f) { return f[1] <= tier && f[1] >= tier - 2; });
    var f = pk(ctx, list), n = 1 + ctx.rng.int(1 + s);
    return { name: f[0], n: n, food: f[2] * (0.6 + n * 0.4), tier: f[1], who: c, how: '釣った' };
  }
  function hunt(ctx, c) {
    var s = sk(ctx, c, 'hunt'), g = pk(ctx, GAME.filter(function (x) { return x[1] <= s + 1; }));
    if (g[1] >= 4 && ctx.rng() > 0.35 + s * 0.1) { c.hp -= 12 + ctx.rng.int(10); return { fail: true, name: g[0], who: c }; }
    var wb = ctx.isl && ctx.isl.weapons ? Math.min(0.2, ctx.isl.weapons.length * 0.05) : 0;
    if (ctx.rng() > 0.3 + s * 0.13 + wb) return { miss: true, name: g[0], who: c };
    return { name: g[0], n: 1, food: g[2], tier: g[1], who: c, how: g[0] === '海鳥の卵' ? '見つけた' : g[0] === 'ヤシガニ' ? '捕まえた' : '仕留めた' };
  }
  function forage(ctx, c) {
    var f = pk(ctx, ctx.env.bugs === 'no' ? FORAGE_NOBUG : FORAGE), n = 1 + ctx.rng.int(2 + sk(ctx, c, 'know'));
    var toxic = f[2] && ctx.rng() < f[2] * (1.1 - sk(ctx, c, 'know') * 0.18);
    if (f[2] && !toxic && ctx.rng() < f[2] * 0.5) return { miss: true, name: f[0], who: c, wary: true };
    return { name: f[0], n: n, food: f[1] * (0.5 + n * 0.3) * (0.6 + ctx.env.res / 120), tier: /キノコ|タケ|キクラゲ/.test(f[0]) ? 2 : 1, who: c, how: f[3] || (/キノコ|タケ|キクラゲ/.test(f[0]) ? '見つけた' : '集めた'), toxic: toxic };
  }

  /* 一日の食卓：誰が何を獲り、誰が何を作ったか */
  function meal(ctx, s) {
    var P = ctx.present(), rng = ctx.rng, I = ctx.isl, got = [], fails = [];
    P.forEach(function (c) {
      if (c.hp < 25 || (I.hungry >= 2 && c.stress > 70 && rng() < 0.3)) return;
      var aid = c.action && c.action.id, r;
      var wf = sk(ctx, c, 'fish') + (aid === 'fishing' ? 3 : 0), wh = sk(ctx, c, 'hunt') + (aid === 'hunting' ? 3 : 0), wg = 2 + (aid === 'food' ? 3 : 0);
      if (aid === 'cooking' || aid === 'base') { wf *= 0.4; wh *= 0.4; wg *= 0.5; }
      var roll = rng() * (wf + wh + wg);
      if (roll < wf) r = catchFish(ctx, c); else if (roll < wf + wh) r = hunt(ctx, c); else r = forage(ctx, c);
      if (r.fail || r.miss) fails.push(r); else got.push(r);
    });
    var total = got.reduce(function (a, g) { return a + g.food; }, 0) * (0.3 + ctx.env.res / 220);
    got.sort(function (a, b) { return b.tier - a.tier; });
    ctx.food += total;
    var cook = ctx.most(P, function (c) { return sk(ctx, c, 'cook') + (c.action && c.action.id === 'cooking' ? 2 : 0) + c.tr.np * 0.5 + rng() * 1.6 - (I.lastCook === c.i && I.cookStreak >= 2 ? 3 : 0); });
    I.cookStreak = I.lastCook === cook.i ? (I.cookStreak || 0) + 1 : 1; I.lastCook = cook.i;
    var best = got[0];
    function unit(g) { return /釣った/.test(g.how) || /幼虫|セミ|イナゴ|コオロギ|カブトムシ|ムシ/.test(g.name) ? '匹' : /シロアリ/.test(g.name) ? '' : 'つ'; }
    function say1(g) { return g.who.name + 'が' + g.name + (g.n > 1 && unit(g) ? g.n + unit(g) : '') + 'を' + g.how; }
    var parts = got.slice(0, 3).map(say1);
    fails.forEach(function (f) {
      if (f.fail) parts.push(f.who.name + 'は' + f.name + 'に返り討ちに遭った');
    });
    if (!got.length) {
      I.lastMeal = 0;
      ctx.act2({ actors: [cook], cat: 'solo', text: (parts.length ? parts.join('。') + '。' : '') + '今日は誰も、何も獲れなかった。' + (P.length > 2 ? '夕食は水だけだった。' : ''), why: '漁・狩りの不発' });
      return;
    }
    var help = HK.IslandCook.helper(ctx, cook);
    var q = HK.clamp(Math.round(sk(ctx, cook, 'cook') * 0.75 - 1 + (best.tier >= 3 ? 0.6 : 0) + (rng() - 0.5) * 1.4) + (help ? help.dq : 0), 0, 3);
    if (ctx.food < P.length * 4) q = Math.min(q, 1);
    var D = HK.IslandCook.dish(ctx, got, q), dish = D.name;
    best = D.main;
    if (got.indexOf(best) > 2) parts[Math.min(2, parts.length - 1)] = say1(best);
    var bad = got.filter(function (g) { return g.toxic; })[0];
    var poison = ((best.name === 'フグ' || (/貝|カキ/.test(best.name) && rng() < 0.08)) && sk(ctx, cook, 'cook') < 4) || (bad && rng() > sk(ctx, cook, 'cook') * 0.12);
    I.lastMeal = q;
    I.dishes.push({ s: s, dish: dish, by: cook.i, q: q });
    var fx = function () {
      P.forEach(function (c) {
        c.hp = Math.min(100, c.hp + q * 2.6);
        c.stress = HK.clamp(c.stress - q * 5, 0, 100);
        if (c !== cook && q >= 2) ctx.mod(c, cook, { aff: q * 1.5, trust: q });
      });
    };
    var line = parts.join('。') + '。' + cook.name + (help ? 'と' + help.who.name : '') + 'が「' + dish + '」を作った。' + (D.season ? '味付けは' + D.season + '。' : '') + D.taste;
    if (q >= 3 && P.length > 2 && rng() < 0.6) {
      var fan = ctx.most(ctx.others(cook), function (c) { return c.tr.fc + c.tr.warmth; });
      line += fan.name + '「' + pk(ctx, ['おかわり！', 'ねえ、これ帰ってからも作って｜なあ、これは帰ってからも作ってくれ｜あの、これ、帰ってからも作ってください', '料理人だったの？', 'もう帰らなくていいかも｜もう帰らなくてもいいかもしれない｜もう帰らなくていいかもしれません']) + '」';
    }
    if (help) ctx.act2({ actors: [help.who, cook], cat: help.cat, fx: help.fx, text: help.text, why: help.why + (help.dq > 0 ? '（料理の出来が上がった）' : help.dq < 0 ? '（料理の出来が下がった）' : ''), mag: 6 });
    ctx.act2({ actors: [cook], cat: q >= 2 ? 'bond' : 'help', fx: fx, text: line, why: cook.name + 'の料理 ' + sk(ctx, cook, 'cook') + '・食材「' + best.name + '」', mag: q * 3 });
    /* 食べ物の好み（food.js）：好みを決めた人がいるときだけ、料理に味を付けて、食べた人の「うまい／まずい」を足す（作った人との関係に少し効く） */
    if (HK.Food && P.length > 1 && HK.Food.any(P)) {
      var fe = ctx.others(cook).filter(function (c) { return P.indexOf(c) >= 0; }), fp = fe.filter(HK.Food.has), eater = (fp.length ? fp : fe)[ctx.rng.int((fp.length ? fp : fe).length || 1)];
      if (eater) ctx.act2({ actors: [eater, cook], cat: 'bond', fx: function () {
        var r = HK.Food.meal(ctx, cook, eater, dish, { q: q });
        /* 好物は島では食べられないので、ときどき恋しがる */
        var lg = r && HK.Food.like(eater).length && ctx.rng() < 0.35 ? HK.Food.longing(ctx, eater) : null;
        if (lg) { r.text += lg.text; r.why += '／' + lg.why; }
        return r;
      }, text: function (r) { return r && r.text; }, why: function (r) { return r ? '料理の味：' + r.why : ''; }, mag: 3 });
    }
    if (poison) {
      var vic = pk(ctx, P.length > 1 ? ctx.others(cook) : P);
      vic.hp -= 25;
      if (bad) {
        var fg = bad.who;
        var mt = pk(ctx, ['夜中、' + vic.name + 'が急に笑い出して止まらなくなった。原因は' + fg.name + 'が採ってきた' + bad.name + 'だった。', vic.name + 'は焚き火に向かって「綺麗な蝶がいっぱいいる｜綺麗な蝶がたくさんいる｜綺麗な蝶がいっぱいいます」と言い続けた。' + fg.name + '「…あのキノコ、やっぱりダメなやつだった？｜…あのキノコは、やはり駄目なものだったか？｜…あのキノコ、やっぱりダメなものでしたか？」', vic.name + 'は夜通し吐き続けた。' + fg.name + 'は青い顔で背中をさすり、「ごめん、ごめん｜すまない、すまない｜ごめんなさい、ごめんなさい」と繰り返した。', vic.name + 'の手がしびれて、貝殻のスプーンを落とした。' + fg.name + '「' + bad.name + '、似てたんだよ、食べられるやつに…｜' + bad.name + 'は、食べられるものに似ていたんだ…｜' + bad.name + '、食べられるものに似ていたんです…」']);
        ctx.act2({ actors: [vic, fg], cat: 'conflict', fx: function () { ctx.mod(vic, fg, { ten: 10, trust: -6 }); ctx.mod(fg, vic, { aff: 3 }); ctx.stress(fg, 10); }, text: mt, why: fg.name + 'のサバイバル知識 ' + sk(ctx, fg, 'know') + '（毒キノコを見分けられなかった）' });
      } else
      ctx.act2({ actors: [vic, cook], cat: 'conflict', fx: function () { ctx.mod(vic, cook, { ten: 15, trust: -10 }); }, text: '夜中、' + vic.name + 'が腹を押さえて転げ回った。' + (vic === cook ? vic.name + '「…自分で作ったのに…｜…自分で作ったというのに…｜…自分で作ったんですけど…」' : vic.name + '「…' + cook.name + '、あれ、ちゃんと火通した？｜…' + cook.name + '、あれにはちゃんと火を通したのか？｜…' + cook.name + '、あれ、ちゃんと火を通しましたか？」'), why: '料理の腕が足りず、毒にあたった' });
    }
  }

  /* ---------- 拠点 ---------- */
  var BASE = ['野宿', '雨よけの屋根', '寝床つきの小屋', '快適な拠点'];
  function build(ctx) {
    var P = ctx.present(), I = ctx.isl;
    var add = 0, best = null, bv = 0;
    P.forEach(function (c) {
      var w = sk(ctx, c, 'build') * (c.action && c.action.id === 'base' ? 1.6 : 0.5) * (c.hp > 30 ? 1 : 0.3);
      add += w; if (w > bv) { bv = w; best = c; }
    });
    var before = Math.floor(I.base / 34);
    I.base = Math.min(100, I.base + add * 2.2);
    var lv = Math.min(3, Math.floor(I.base / 34));
    if (lv > before && best) {
      ctx.act2({ actors: [best], cat: 'help', fx: function () { ctx.others(best).forEach(function (o) { ctx.mod(o, best, { trust: 6, aff: 3 }); }); },
        text: best.name + 'の指揮で、拠点が「' + BASE[lv] + '」になった。' + pk(ctx, ['今夜から、雨に濡れずに眠れる。', '寝床に葉を敷き詰めると、ふかふかになった。', '焚き火の周りに、ちゃんとした居場所ができた。']), why: '拠点づくり ' + sk(ctx, best, 'build') });
    }
    return lv;
  }

  /* ---------- 飢えの果て ---------- */
  function hungerTurn(ctx) {
    var I = ctx.isl, P = ctx.present(), rng = ctx.rng;
    if (I.hungry < 2 || P.length < 2) return;
    var heat = I.hungry * 0.18 + P.reduce(function (a, c) { return a + c.stress; }, 0) / P.length / 250;
    if (rng() > heat) return;
    var a = ctx.most(P, function (c) { return c.tr.aggr + c.stress / 100 + c.tr.cold * 0.5 - c.tr.np * 0.5; });
    var b = ctx.most(ctx.others(a), function (c) { return R(ctx, a, c).ten / 50 - R(ctx, a, c).aff / 60 + (c.hp < 40 ? 0.5 : 0); });
    var dark = ctx.env.dark !== 'mild';
    var lvl = I.hungry + (a.stress > 75 ? 1 : 0) + (a.tr.cold > 0.65 ? 1 : 0);
    /* 少人数ほど、殺し合いには踏み込みにくい（mood-dial.js の HK.Dark.few。6人以上は前と同じ） */
    if (dark && lvl >= 4 && R(ctx, a, b).aff < 10 && rng() < 0.45 * HK.Dark.few(ctx)) {
      var r = ctx.fight(a, b, { lethality: 1.3, ambush: true, canSpare: R(ctx, a, b).aff > 0 });
      ctx.act2({ actors: [a, b], cat: 'combat', text: '飢えが' + a.name + 'の中の何かを壊した。' + a.name + '「…ごめん。でも、もう無理なんだ｜…すまない。だが、もう無理なんだ｜…ごめんなさい。でも、もう無理なんです」' + r.text, why: '飢え' + I.hungry + '日目・' + a.name + 'の攻撃性とドライさ。' + r.why });
      ctx.flush();
      if (r.killed) I.corpse = { v: b.i, by: a.i };
      return;
    }
    var lines = [
      [a.name + '「あなた、昨日の分も食べたでしょ｜あなた、昨日の分も食べただろう｜あなた、昨日の分も食べましたよね」' + b.name + '「食べてない！｜食べていない！｜食べていません！」', '食べ物の取り分で口論になった'],
      [a.name + 'は' + b.name + 'の手から貝殻の器を叩き落とした。' + a.name + '「働いてない奴に食わせる分はない｜働いていない者に食わせる分はない｜働いていない人に食べさせる分はありません」', '働き分を巡る衝突'],
      [a.name + '「誰のせいでこうなったと思ってるの｜誰のせいでこうなったと思っている｜誰のせいでこうなったと思っているんですか」' + b.name + 'は何も言い返さなかった。', '飢えで責任をなすりつけた'],
      ['焚き火の前で、' + a.name + 'と' + b.name + 'が掴み合いになった。原因は、焦げた魚の頭一つだった。', '空腹が理性を削った']
    ];
    var L = pk(ctx, lines);
    ctx.act2({ actors: [a, b], cat: 'conflict', fx: function () { ctx.mod2(a, b, { ten: 16, aff: -8 }, { ten: 18, aff: -10, trust: -8 }); ctx.others(a).forEach(function (o) { if (o !== b) ctx.stress(o, 6); }); }, text: L[0], why: L[1] + '（飢え' + I.hungry + '日目）' });
  }
  function corpseTurn(ctx) {
    var I = ctx.isl, rng = ctx.rng;
    if (ctx.env.dark === 'mild' || I.ate) return;
    /* 弔われた（埋められた）人の墓だけが対象。亡骸をどうするかは island-corpse.js が先に決める */
    var dead = ctx.chars.filter(function (c) { return !c.alive && (I.buried || []).indexOf(c.i) >= 0; });
    if (!dead.length || I.hungry < 3) return;
    var P = ctx.present();
    var a = ctx.most(P, function (c) { return c.tr.cold + c.stress / 100 - c.tr.np * 0.6 + (I.corpse && I.corpse.by === c.i ? 0.6 : 0); });
    if (!a || rng() > 0.25 + a.tr.cold * 0.3 + I.hungry * 0.05) return;
    var v = I.corpse && dead.indexOf(ctx.chars[I.corpse.v]) >= 0 ? ctx.chars[I.corpse.v] : pk(ctx, dead);
    I.ate = true;
    ctx.food += 25;
    var eaters = P.filter(function (c) { return c === a || c.tr.cold + c.stress / 100 > 1 || rng() < 0.3; });
    var refused = P.filter(function (c) { return eaters.indexOf(c) < 0; });
    ctx.act2({ actors: eaters, cat: 'betray', fx: function () {
      eaters.forEach(function (c) { c.stress = HK.clamp(c.stress + 20, 0, 100); });
      refused.forEach(function (c) { eaters.forEach(function (e) { ctx.mod(c, e, { aff: -25, trust: -20, ten: 25 }); }); });
      eaters.forEach(function (e) { eaters.forEach(function (f) { if (e !== f) { ctx.mod(e, f, { trust: 8 }); ctx.pair(e, f).secret = true; } }); });
    }, text: 'その夜、焚き火で焼かれていた肉が何だったのか、' + a.name + 'は説明しなかった。' + v.name + 'の墓は、少し浅くなっていた。' + (refused.length ? refused.map(function (c) { return c.name; }).join('・') + 'は、最後まで口をつけなかった。' : '誰も、何も言わなかった。'), why: '飢え' + I.hungry + '日目。' + a.name + 'のドライさと極限状態', mag: 40 });
  }

  /* ---------- 組み込み ---------- */
  var oldSetup = isl.setup, oldAfter = isl.after;
  isl.setup = function (ctx) {
    oldSetup(ctx);
    ctx.isl = { base: 0, hungry: 0, dishes: [], lastMeal: 0 };
  };
  isl.after = function (ctx, s, n) {
    var I = ctx.isl;
    meal(ctx, s);
    var lv = build(ctx);
    var need = ctx.present().length * 6;
    I.hungry = ctx.food + ctx.env.res / 100 * 3 < need ? I.hungry + 1 : 0;
    if (I.hungry === 2) ctx.incident('二日続けて、まともな食事がない。焚き火の周りの会話が減った。');
    if (I.hungry === 4) ctx.incident('飢えて四日目。誰もが、誰かの取り分を数えていた。');
    oldAfter(ctx, s, n);
    var heal = [0, 4, 8, 13][lv];
    var stormy = ctx.env.storm / 100 * ctx.rng();
    ctx.present().forEach(function (c) {
      c.hp = Math.min(100, c.hp + heal - (lv === 0 ? stormy * 8 : 0));
      if (I.hungry >= 2) c.stress = HK.clamp(c.stress + I.hungry * 4, 0, 100);
    });
    hungerTurn(ctx);
    corpseTurn(ctx);
  };
  isl.notes = function (ctx) { return ctx.isl; };

  /* ---------- 裏切りの発覚・口論・謝罪 ---------- */
  var stash = isl.events.filter(function (e) { return e.id === 'stashfound'; })[0];
  if (stash) {
    var run0 = stash.run;
    stash.run = function (ctx, a, b) {
      var r = run0(ctx, a, b);
      b.flags.exposed = { by: a.i, at: ctx.stepIndex };
      r.text += a.name + '「これ、何？｜これは何だ？｜これ、何ですか？」' + b.name + 'は目を逸らした。';
      return r;
    };
  }
  isl.events = isl.events.concat([
    {
      id: 'steal', cat: 'betray', scope: 'solo',
      when: function (ctx, a) { return ctx.isl && ctx.isl.hungry >= 1 && !a.flags.exposed; },
      w: function (ctx, a) { return (a.tr.cold * 0.6 + a.tr.impulse * 0.3 - a.tr.np * 0.4 + a.stress / 200) * (a.goal.id === 'self' ? 1.6 : 0.8); },
      run: function (ctx, a) {
        a.flags.stash = (a.flags.stash || 0) + 8; ctx.food = Math.max(0, ctx.food - 8);
        return { text: ctx.t(pk(ctx, ['夜中、{a}は共有の食料袋に手を入れた。', '{a}は干し魚を一切れ、袖に隠した。', '{a}は見張りの交代の隙に、ヤシの実を一つ埋めた。']), a), why: a.name + 'のドライさ・衝動と飢え' };
      }
    },
    {
      id: 'quarrel_thief', label: '食料の盗み食いを責める', cat: 'conflict', scope: 'pair',
      when: function (ctx, a, b) { return b.flags.exposed && !b.flags.apologized && ctx.stepIndex - b.flags.exposed.at <= 2 && !b.flags.quarreled; },
      w: function (ctx, a, b) { return 0.6 + a.tr.cp * 0.8 + R(ctx, a, b).ten / 60; },
      run: function (ctx, a, b) {
        b.flags.quarreled = true;
        ctx.mod2(a, b, { ten: 18, trust: -10 }, { ten: 14 });
        var back = b.tr.cp > 0.6 ? b.name + '「生き残るためだろ。あなただって腹減ってるくせに｜生き残るためだろう。あなただって腹が減っているくせに｜生き残るためでしょう。あなただって、お腹が空いているじゃないですか」' : b.tr.ac > 0.6 ? b.name + 'は唇を噛んで、黙って俯いた。' : b.name + '「…ちょっとだけのつもりだった｜…少しだけのつもりだった｜…ちょっとだけのつもりでした」';
        return { text: a.name + '「仲間だと思ってたのに｜仲間だと思っていたのに｜仲間だと思っていましたのに」' + back, why: a.name + 'のCP（不正を許さない）' };
      }
    },
    {
      id: 'apology', label: '盗み食いを謝って魚を差し出す', cat: 'help', scope: 'pair',
      when: function (ctx, a, b) { return a.flags.exposed && !a.flags.apologized && ctx.stepIndex - a.flags.exposed.at >= 1 && (b.i === a.flags.exposed.by || ctx.rng() < 0.3); },
      w: function (ctx, a) { return 0.4 + a.tr.ac * 0.8 + a.tr.np * 0.6 + a.tr.honesty * 0.3 - a.tr.cp * 0.3; },
      run: function (ctx, a, b) {
        a.flags.apologized = true;
        var how = a.tr.ac > 0.6 ? a.name + 'は' + b.name + 'の前で、額を砂につけた。「ごめんなさい。本当に、ごめんなさい」' :
          a.tr.fc > 0.6 ? a.name + 'は獲ってきた一番大きな魚を差し出した。「これでチャラ…にはならないよね。ごめん｜これで帳消し…にはならないな。すまない｜これでチャラ…にはなりませんよね。ごめんなさい」' :
            a.tr.cp > 0.6 ? a.name + 'はしばらく黙ってから、ぶっきらぼうに言った。「…悪かった。二度としない」' :
              a.name + 'は' + b.name + 'の隣に座って、小さな声で言った。「ずっと言わなきゃって思ってた。ごめん｜ずっと言わなければと思っていた。すまない｜ずっと言わなきゃと思っていました。ごめんなさい」';
        var forgive = b.tr.np * 0.6 + R(ctx, b, a).aff / 100 + 0.25 > ctx.rng();
        if (forgive) {
          ctx.mod2(a, b, { trust: 10, aff: 6, ten: -12 }, { trust: 12, aff: 8, ten: -15 });
          ctx.others(a).forEach(function (o) { if (o !== b) ctx.mod(o, a, { trust: 6, ten: -6 }); });
          how += b.name + pk(ctx, ['「…次やったら海に放り込むからね｜…次やったら海に放り込むからな｜…次やったら海に放り込みますからね」と、少し笑った。', 'は黙って、' + a.name + 'の頭を一度だけ叩いた。', '「腹が減ってたのは、みんな同じだよ｜腹が減っていたのは、皆同じだ｜お腹が空いていたのは、みんな同じですよ」と言った。', 'は「もういいよ｜もういい｜もういいですよ」と言って、魚を半分に割った。']);
        } else {
          ctx.mod2(a, b, { ten: 4 }, { ten: 6 });
          how += b.name + pk(ctx, ['は返事をしなかった。', '「謝って済むなら、腹は減らない｜＝｜謝って済むなら、お腹は空きません」と背を向けた。', 'は「信用は、獲り直せないよ｜信用は、獲り直せない｜信用は、獲り直せませんよ」と言った。']);
        }
        return { cat: forgive ? 'help' : 'conflict', text: how, why: (forgive ? b.name + 'のNPが許した' : b.name + 'は許さなかった') + '（' + a.name + 'のAC・NP）', mag: 10 };
      }
    },
    {
      id: 'campfire_talk', label: '食後の焚き火で語り合う', cat: 'bond', scope: 'pair',
      w: function (ctx, a, b) { return 0.3 + (ctx.isl && ctx.isl.lastMeal >= 2 ? 0.4 : 0) + a.tr.warmth * 0.3; },
      run: function (ctx, a, b) {
        ctx.mod2(a, b, { aff: 5, trust: 4 }, { aff: 5, trust: 4 });
        var L = ['{a}「帰ったら、最初に何食べたい？｜帰ったら、最初に何を食べたい？｜帰ったら、最初に何を食べたいですか？」{b}「…今日の魚、かな｜…今日の魚、だな｜…今日の魚、でしょうか」', '{a}「この島、星がすごいね｜この島は、星がすごいな｜この島、星がすごいですね」{b}「怖いくらい｜怖いくらいだ｜怖いくらいです」', '{a}「もし救助が来なかったら、どうする？｜＝｜もし救助が来なかったら、どうしますか？」{b}「そのときは、ここで店でも開こう｜＝｜そのときは、ここで店でも開きましょう」', '{a}「私、{b}がいてよかった｜私は、{b}がいてよかった｜私、{b}さんがいてよかったです」{b}「急にどうしたの｜急にどうした｜急にどうしたんですか」', '{a}「寝てる間、私が火の番代わろうか｜寝ている間、私が火の番を代わろうか｜寝ている間、私が火の番を代わりましょうか」{b}「ありがと。じゃあ、隣で寝る｜ありがとう。では、隣で寝る｜ありがとうございます。では、隣で寝ますね」'];
        return { text: ctx.t(pk(ctx, L), a, b), why: '食後の焚き火' };
      }
    }
  ]);
})();
/* @event-ok 台詞を3本に（口調直し第8回） */
