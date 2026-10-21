/* 箱庭シミュレーター: デスゲーム系の共通部品 ―― 生い立ち（人の死・殺人への耐性）と、検死の知識
   ・生い立ち：平和な日常／死が身近な世界／人を殺したことがある。エゴグラムが同じでも、
     死体を見たときの消耗、殺人へのためらい、手にかけたあとの崩れ方が変わる（耐性 tol 0〜1）
   ・検死の知識：なし／少し（看護師・救急隊員・刑事など）／専門家（医師・監察医・鑑識）（kn 0〜2）
     推理が苦手でも、死因や死亡推定時刻で捜査に貢献できる。犯人側なら偽装にも使える
   裁判デスゲーム・バトルロワイヤル・吹雪の館の殺人で使う */
(function () {
  'use strict';
  var HK = window.HK, clamp = HK.clamp;
  var K = HK.DGK = {};

  K.LIFE = { id: 'life', label: '生い立ち', auto: 'おまかせ（気質から）', options: [
    { id: 'peace', label: '平和な日常を生きてきた' },
    { id: 'harsh', label: '死が身近な世界で生きてきた（戦地・災害現場・裏社会など）' },
    { id: 'killed', label: '人を殺したことがある' }
  ] };
  K.KNOW = { id: 'know', label: '検死の知識', auto: 'おまかせ（気質から）', options: [
    { id: 'none', label: 'なし' },
    { id: 'some', label: '少しある（看護師・救急隊員・刑事など）' },
    { id: 'expert', label: '専門家（医師・監察医・鑑識）' }
  ] };
  K.LIFE_LABEL = { peace: '平和な日常', harsh: '死が身近な世界', killed: '人を殺したことがある' };
  K.KNOW_LABEL = ['なし', '少しある', '専門家'];

  /* c: { tr, pick } に life / tol / kn をつける */
  K.init = function (rng, c, opt) {
    opt = opt || {};
    var t = c.tr, pick = c.pick || {};
    var life = pick.life;
    if (!K.LIFE_LABEL[life]) {
      var w = { peace: 1, harsh: 0.1 + t.cold * 0.2 + t.aggr * 0.12, killed: 0.02 + t.cold * t.aggr * 0.12 };
      life = HK.weighted(rng, ['peace', 'harsh', 'killed'], function (k) { return w[k]; });
      c.lifeAuto = true;
    }
    c.life = life;
    var base = { peace: 0.08, harsh: 0.5, killed: 0.76 }[life];
    c.tol = clamp(base + t.cold * 0.22 + t.aggr * 0.06 - t.ac * 0.06 - t.np * 0.04, 0, 1);
    if (opt.know === false) return c;
    var kn = { none: 0, some: 1, expert: 2 }[pick.know];
    if (kn == null) {
      var r = rng();
      kn = r < 0.03 + t.a * 0.04 + (opt.knBias || 0) ? 2 : r < 0.1 + t.a * 0.1 + (opt.knBias || 0) * 2 ? 1 : 0;
      if (opt.knMin) kn = Math.max(kn, opt.knMin);
      c.knAuto = true;
    }
    c.kn = kn;
    return c;
  };
  K.tol = function (c) { return c && c.tol != null ? c.tol : null; };
  /* 死体や死を目にしたときの消耗の倍率（平和な人ほど大きい） */
  K.drain = function (c) { return c && c.tol != null ? 1.35 - c.tol * 0.75 : 1; };
  /* 殺すことへのためらい（0〜1） */
  K.hesitate = function (c) { return c && c.tol != null ? clamp((1 - c.tol) * 0.55 + c.tr.np * 0.2 - c.tr.cold * 0.15, 0, 0.9) : 0.2; };
  /* 取っ組み合いの強さ（武器や体力のない箱庭向けのおおまかな値） */
  K.phys = function (c, rng) { return c.tr.aggr * 0.4 + c.tr.cp * 0.15 + (c.tol || 0) * 0.25 + (c.stats && c.stats.hp ? (c.stats.hp - 3) * 0.06 : 0) + rng() * 0.35; };
  K.note = function (c) {
    var s = [];
    if (c.life) s.push('生い立ち：' + K.LIFE_LABEL[c.life] + (c.lifeAuto ? '（気質から）' : ''));
    if (c.kn != null) s.push('検死の知識：' + K.KNOW_LABEL[c.kn]);
    return s.join('・');
  };

  /* 死体を見たときの反応 */
  K.SHOCK = {
    peace: ['{a}はその場で膝から崩れ、口を押さえて吐いた。', '{a}は悲鳴も出せずに立ち尽くした。指先の震えが、いつまでも止まらなかった。', '{a}は「嘘でしょ」と何度も繰り返しながら、後ずさりした。'],
    harsh: ['{a}は黙って遺体のそばに膝をつき、瞼をそっと閉じてやった。', '{a}は一度だけ目を閉じ、それから冷静に周りを見回した。', '{a}は「触るな、現場が崩れる」と低く言った。'],
    killed: ['{a}は眉ひとつ動かさなかった。その落ち着きに、何人かが息を呑んだ。', '{a}は遺体を見下ろして、小さく言った。「……慣れたくなかったな」', '{a}は、傷口の角度をじっと見ていた。まるで、自分ならどうするかを考えているように。']
  };
  /* 初めて手にかけたあと */
  K.AFTER_KILL = {
    peace: ['{a}は自分の手を見つめたまま、朝まで一睡もできなかった。', '{a}は何度も手を洗った。皮膚が赤く剥けても、洗うのをやめられなかった。', '{a}は部屋の隅で膝を抱え、震えながら誰かの名前を呼んでいた。'],
    harsh: ['{a}は長いあいだ、黙って空を見ていた。', '{a}は息を整えて、何もなかったような顔をつくった。手だけが、まだ冷たかった。'],
    killed: ['{a}の呼吸は、もう落ち着いていた。それが一番、自分でも怖かった。', '{a}は淡々と後始末をした。手際がよすぎた。']
  };
})();
