/* 箱庭シミュレーター: エロシーンの印（両ビルド共通。このファイルには性的な語を書かない）
   記録の「エロシーンだけ」の絞り込みと、組のカードの概要（core.js の HK.lewdEvent・HK.lewdBrief）は、記録の印 e.lewd を見る。
   ■ 印の付け方（性的な場面を書く側）
     ・HK.EroScene.touch(S)：いま組み立てている記録（S.log の次の一件）が性的な場面だと知らせる。夜の場面・山場の文の生成器の入口から呼ぶ
       （story-lewd.js の touch と同じ考え方：記録が一件増えるまで有効）
     ・記録を作る say（engine.js の Ctx.say、solo-story-kit.js の ST.say、dungeon.js の say、solo-kit.js の K.say）が HK.EroScene.hit で見て、e.lewd = true にする。
       ほかに、say に渡す o.lewd === true、出来事の定義の sex:true（engine.js の sexEv）、体の語の印（lewd-words.js の {…}）が文にある、も印になる
     ・結果を返すとき、印のない記録は e.lewd = false にする（新しい結果は印だけで決まる。語の当たり外れに左右されない）
   ■ 印のない古い結果（保存しておいた結果）だけ、これまでどおり本文の語で見る（core.js の判定）。
     ただし発狂・死・戦闘など性的でない分類の記録は、語に当たっても入れない */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || HK.EroScene) return;
  /* 体の語の印（lewd-words.js。全年齢版には入らない） */
  var TOKEN = /\{(?:男性器|亀頭|女性器|陰核|ナカ|胸|乳首|尻|後ろ|精液|愛液|股間)\}/;
  /* 箱庭ごとの決まり（R18の一人用の箱庭。その箱庭の記録の形 kind・tag で決める）
     ・迷宮：絶頂・寸止め（kind: 'climax'）、陥落、罠・技・番人などの記録で快感か絶頂の回数が上がった（捕まって責められた）場面
     ・マッサージ：絶頂、陥落（際どい段・体位・逆転などは solo-massage.js が o.lewd を付ける）
     ・感覚遮断穴：絶頂、壁の向こうで起きていること・遮断が揺らいだ／壊れた・陥落などの札
     ・サキュバス・催眠・ロッカー・お色気バラエティ：山場（kind: 'climax'）は性的な場面 */
  function felt(S, o) {
    var h = S.h; if (!h || !o.v) return false;
    var M = S._eroPv = S._eroPv || {}, k = h.name, p0 = M[k], c0 = M[k + '\u0000c'];
    M[k] = o.v.p; M[k + '\u0000c'] = h.climax;
    return (p0 != null && o.v.p > p0) || (c0 != null && h.climax > c0);
  }
  var DG_TAG = { '罠': 1, '技': 1, '番人': 1, '敗北': 1, '誘惑': 1, '仲間の暴走': 1, '主催者の罠': 1, '囚われ人': 1, '慰め合い': 1 };
  var HOLE_TAG = { '壁の向こう': 1, '壁の向こうの住人': 1, '揺らぎ': 1, '混乱': 1, '体が応える': 1, '遮断が壊れた': 1, '陥落': 1, '自分から求める': 1, '余韻': 1, '解放': 1, '数えられない': 1 };
  function dgRule(S, o) { var f = felt(S, o); return o.kind === 'climax' || o.tag === '陥落' || (DG_TAG[o.tag] === 1 && f); }
  function climaxRule(S, o) { return o.kind === 'climax'; }
  var RULE = {
    dungeon: dgRule,
    massage: function (S, o) { return o.kind === 'climax' || o.tag === '陥落'; },
    hole: function (S, o) { return o.kind === 'climax' || HOLE_TAG[o.tag] === 1; },
    succubus: climaxRule, saimin: climaxRule, locker: climaxRule, variety: climaxRule
  };
  var X = HK.EroScene = {
    RULE: RULE,
    /* S（ctx・物語の S・迷宮の S）の次の記録を、性的な場面にする */
    touch: function (S) { if (S && S.log) S._eroN = S.log.length; return S; },
    /* 次の記録の印を取り消す（生成した文を使わなかったとき） */
    untouch: function (S) { if (S) S._eroN = null; },
    /* say の中で、記録を足す前に呼ぶ：この記録は性的な場面か */
    hit: function (S, o, sex, scenId) {
      if (HK.SAFE_ON || !o) return false;
      if (o.lewd === true || sex) return true;
      if (o.lewd === false) return false;
      if (S && S.log && S._eroN === S.log.length) return true;
      var id = scenId || (S && S.scen && S.scen.id), R = id && RULE[id];
      if (R && R(S, o)) return true;
      return typeof o.text === 'string' && o.text.indexOf('{') >= 0 && TOKEN.test(o.text);
    },
    /* 結果の記録に印を揃える（印のない記録は false） */
    finish: function (res) {
      (res && res.log || []).forEach(function (e) { if (e && typeof e === 'object' && e.kind !== 'step' && typeof e.lewd !== 'boolean') e.lewd = false; });
      return res;
    }
  };
  /* 古い結果の予備：性的でない分類（死・戦闘・発狂・事件など）の記録は、語に当たっても入れない */
  var NON_TAG = /発狂|死|処刑|戦闘|殺|事件|推理|全滅|撃破/;
  X.nonSex = function (e) { return e.kind === 'death' || e.cat === 'combat' || (typeof e.tag === 'string' && NON_TAG.test(e.tag)); };
  var old = HK.lewdEvent;
  HK.lewdEvent = function (e) {
    if (!e || e.kind === 'step') return false;
    if (typeof e.lewd === 'boolean') return e.lewd;
    if (X.nonSex(e)) return false;
    return old ? !!old(e) : false;
  };
  /* 結果を返すときに印を揃える */
  if (HK.simulate && !HK.simulate._eroScene) {
    var sim0 = HK.simulate;
    HK.simulate = function () { return X.finish(sim0.apply(this, arguments)); };
    HK.simulate._eroScene = true;
  }
})();
