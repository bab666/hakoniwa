/* 箱庭シミュレーター: 内容のスイッチ（R18版の設定。全箱庭で共通）
   刺激の強い要素を、遊ぶ人が入れ切りできるようにする。既定はすべて切（見たい人だけ入れる）。
   ・設定は画面の「内容のスイッチ」で選び、シミュレーションには env.ct（入れたものの id をカンマでつないだ文字列）で渡す
   ・出来事の側は HK.Content.on(env, 'force') のように確かめ、切なら起こさない（またはやわらかい分岐に替える）
   ・全年齢版・全年齢モードでは、どれも常に切
   ・近親は、関係ごとの「恋愛：あり」がそのままスイッチ（ここでは扱わない）
   ・R18が中心の箱庭（エロトラップダンジョン・感覚遮断穴・常識改変・サキュバスの一夜・エロバラエティ・マッサージ）は、題材そのものが合意のない展開なので「合意のない展開」は効かせない */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var C = HK.Content = {
    TAGS: [
      { id: 'force', label: '合意のない展開', desc: '夜這い・略奪者やゾンビに襲われる・神や眷属の夜・生贄の儀式・執着の監禁の夜・敵対する二人の強引なエッチ・星の生命体に攫われる・同意のない催眠（切なら、催眠は同意の上の催眠プレイに） など' },
      { id: 'preg', label: '妊娠・孕む描写', desc: '邪神村の疑似妊娠・巫女、行為のあとに孕む描写' },
      { id: 'violence', label: '暴力をともなう性描写', desc: '吹雪の館の快楽殺人・凌辱など、暴力と性が結びつく場面' },
      { id: 'abuse', label: 'DVなど歪んだ関係', desc: '関係「歪んだ関係」の支配・暴言・暴力の場面' }
    ],
    CORE: { dungeon: 1, hole: 1, kaihen: 1, succubus: 1, variety: 1, massage: 1 },
    /* env（箱庭の ctx.env・物語型の S.env）で、その内容が入になっているか */
    on: function (env, tag, scenId) {
      if (HK.SAFE_ON) return false;
      if (tag === 'force' && scenId && C.CORE[scenId]) return true;
      var c = env && env.ct;
      if (c == null || c === '') return false;
      return (',' + c + ',').indexOf(',' + tag + ',') >= 0;
    },
    /* ctx・S のどちらでも（env と scen を中から取る） */
    ok: function (x, tag) { return C.on(x && x.env, tag, x && x.scen && x.scen.id); }
  };
})();
