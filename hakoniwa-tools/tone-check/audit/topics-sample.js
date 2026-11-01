/* 点検の配役に入れる見本の話題（2026-11-01 担当TB。話題の仕組みは js/topics.js の HK.Topics）
   ・点検の配役は話題を持たないので、そのままだと話題の文（交流・独り・三人・物語型のひと言・雑談に添える一文）が検査に当たらない。
     audit/core.js の RUN が、パスの opt.topics が真のとき（audit-all.js の topics-state・topics-seg・topics-relcons）に、回ごとに simulate の前で ADD(input) を呼び、
     話題の無い input に見本を入れる（全 scope・全 kind を一通り、最大 10 件）。話題があると乱数の進み方が変わって回の中身が別物になるので、
     ほかのパスの回には入れない（今までのパスの件数は変わらず、話題の入った回が足されるだけ）。
     住人に id が無ければ 'tk'+番号、偶数番の住人にグループ「見本の会」を付ける（シミュレーションは id・group を話題の引き当てにしか使わない）。
   ・ALL：住人を問わない見本（tone-feel.js --topics が使う。話し手を固定する点検なので scope は全体だけ） */
'use strict';
/* ページの中で動く（toString して送る）。input.topics が既にあれば何もしない */
const ADD = function (input) {
  if (!input || input.topics != null || !Array.isArray(input.chars)) return input;
  const C = input.chars, n = C.length, id = i => C[i].id;
  C.forEach((c, i) => { if (!c) return; if (c.id == null || c.id === '') c.id = 'tk' + i; if (i % 2 === 0 && !c.group) c.group = '見本の会'; });
  const t = [
    { scope: 'all', kind: 'food', word: 'ラーメン', note: '味噌が好き' },
    { scope: 'all', kind: 'koto', word: '環境問題' },
    { scope: 'scen', scen: input.scenId, kind: 'koto', word: '去年の夏祭り' },
    { scope: 'group', group: '見本の会', kind: 'hobby', word: '釣り' }
  ];
  if (n >= 1 && C[0]) t.push({ scope: 'char', a: id(0), kind: 'like', word: '猫' });
  if (n >= 2 && C[1]) t.push({ scope: 'char', a: id(1), kind: 'hate', word: '猫' }, { scope: 'pair', a: id(0), b: id(1), kind: 'work', word: '星の王子さま' });
  if (n >= 3 && C[2]) t.push({ scope: 'char', a: id(2), kind: 'place', word: '隣町の古本屋' }, { scope: 'pair', a: id(1), b: id(2), kind: 'person', word: '駅前の花屋の店長' });
  if (n >= 4 && C[3]) t.push({ scope: 'char', a: id(3), kind: 'thing', word: '古いフィルムカメラ' });
  input.topics = t;
  return input;
};
const ALL = [
  { scope: 'all', kind: 'food', word: 'ラーメン', note: '味噌が好き' },
  { scope: 'all', kind: 'koto', word: '環境問題' },
  { scope: 'all', kind: 'hobby', word: '釣り' },
  { scope: 'all', kind: 'like', word: '猫' },
  { scope: 'all', kind: 'hate', word: '雨の日の満員電車' },
  { scope: 'all', kind: 'work', word: '星の王子さま' },
  { scope: 'all', kind: 'place', word: '隣町の古本屋' },
  { scope: 'all', kind: 'person', word: '駅前の花屋の店長' },
  { scope: 'all', kind: 'thing', word: '古いフィルムカメラ' }
];
module.exports = { ADD, ALL };
