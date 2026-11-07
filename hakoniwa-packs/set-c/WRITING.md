# Cセット（闇の過激セット）の書き方（担当向け）

セット全体の設計は `docs/reports/2026-11-07/set-c-design.md`。部屋ごとの設計はそれぞれの設計書（`kankin-design.md` など。部屋の担当が書く）。
共通の部品 kit（かたまり `kit`）は **文を持たない**。文はすべて部屋のファイルに書く。本体の長い場面・共通の出来事の文、セット B の文は使わず、呼ばない。

## 1. kit の入れ物：`HK.DarkKit`

本体の `HK.Dark` は「展開の重さ」（mood-dial.js）がもう使っている名前なので、kit は **`HK.DarkKit`** にした（部屋では `var DK = HK.DarkKit;`）。

| ファイル | 中身 |
| --- | --- |
| `js/kit-dark.js` | 巻き戻らない計器（`gauge`・`push`・`val`・`stage`・`tmpReset`）、段の札で表を引く（`pick`・`stOk`）、一度だけ（`once`・`seen`）、同じ文を二度出さない（`use`・`fresh`。`S.used`・`S.lru`）、話し手の目印（`who`・`mark`）、文の仕上げ（`fill`）、記録（`say`） |
| `js/kit-dark-cast.js` | 態度 9 種（`per`）、運命の揺らぎ（`pOdd`・`branch`）、住人ごとの欄（`part`）、役（`cast`・`couple`・`noBody`）、周りの人（`install`）、展開の重さ（`heavy`・`heavyDefault`）、内容のスイッチ（`content`） |
| `js/kit-dark-face.js` | 出来事の id → 表情の既定（`face`）、記録ごとの表情（`say` の `face` → `e.dkf`） |

R18 の場面の組み立て（`kit-dark-r18.js`・`HK.DarkKit.R18`）は別の担当が足す（設計書 2-3）。

## 2. 部屋のかたまり

`pack.json` の `chunks` に部屋を一つ足す。deps は `kit` と、部屋が実際に読む本体のかたまり（`pack-roomkit`・`pack-lewd`・`pack-rel`・`pack-solo` のうち。本体の `hakoniwa-full/js/_order.txt` の `@chunk` にある名前だけ）。

```json
{ "name": "<部屋>", "deps": ["kit", "pack-roomkit", "pack-lewd"], "files": ["js/<部屋>-text-a.js", "js/<部屋>.js", "js/<部屋>-tags.js", "js/<部屋>-tips.js"] }
```

箱庭の id は `set-c-<部屋>`、出来事の id は部屋の頭字（監禁なら `kk_`）で始めて、ほかの部屋と重ねない。1 ファイル 2000 行まで。

## 3. 計器と段の札（巻き戻らない）

```js
var DK = HK.DarkKit;
/* setup で作る（S は ctx.<部屋> などの部屋の状態） */
DK.gauge(S, 'fear',   { v: 20,  dir: 'up',   stages: [40, 70, 90] });
DK.gauge(S, 'sanity', { v: 100, dir: 'down', stages: [70, 40, 0] });
/* 出来事で進める（逆向きは 0 に丸められる） */
var r = DK.push(S, 'sanity', -8);       /* r.rose が真なら段が上がった区切り */
if (r.rose && DK.once(S, 'sanity-' + r.stage)) { /* 段が上がった一件を出す */ }
/* 一時の揺れは計器にしない */
DK.tmpReset(S); S.tmp.drowsy = true;
```

- 進む値（恐怖・依存・慣れ・開発・正気の低下…）は必ず計器で持つ。下げたいときは別の計器（上がるだけ）を作る。
- 段は `DK.stage(S, 名前)`＝到達した最高の段。段が上がったあとに前の段の文を出さない。
- 表の行に段の札 `st` を付ける：`'0'`（ちょうど 0）・`'2+'`（2 以上）・`'-1'`（1 以下）・`'1-2'`。ほかの計器で見るなら `'sanity:2+'`。空白で区切って並べると全部を満たす行だけ（`'fear:1+ sanity:-1'`）。
- 「初めて」「まだ気づかない」の文は `st: '0'` を付けたうえで `DK.once` で一度だけ。

## 4. 表の書き方

行は文字列か `{ t, st, g, sh, when, w }`。

```js
var T = HK.<部屋>Text = HK.<部屋>Text || {};
T.MEAL = [
  { t: '（段 0 の地の文。{a}…{b}…）', st: '0' },
  { t: '（段 1〜2 の地の文）', st: '1-2' },
  { t: '（段 3 の地の文）', st: '3', when: function (ctx, S, a, b) { return S.chain !== 'bed'; } }
];
/* 引く */
var t = DK.pick(ctx, S, T.MEAL, { g: 'fall', a: A, b: B });   /* 使い切ったら '' */
if (t) DK.say(ctx, { id: 'xx_meal', cat: 'bond', actors: [A, B], t: t, a: A, b: B, S: S });
```

- 一回の遊びで同じ文は二度出ない（`S.used`）。足りないときに戻すなら `{ again: true }`（使った回数が少なく古い順）。戻す前提の表は 3〜4 本以上書く。
- `sh`（`'mf'`・`'ff'`・`'fm'`）は R18 の組の絞り込み。心理の文には付けない。
- `when` は設定と食い違う文を外すのに使う（拘束なのに部屋を歩く・連絡なしなのにスマホを見る、など）。
- 地の文・台詞に作り手の語（計器・段の札・分岐・英字の鍵・`{x}` の残り）が出たら `DK.say` は出さずに `ctx._dkLeak` に残す。部屋の計測で 0 を確かめる。

### {a}・{b} の役（部屋ごとに表の見出しに書く）

| 部屋 | {a} | {b} | ほかの印 |
| --- | --- | --- | --- |
| （部屋の担当が足す） | | | |

## 5. 役と可否

```js
var C = DK.cast(ctx, { field: 'part', top: '<攻め側の値>', bottom: '<受け側の値>', others: ['guest'],
  auto: function (ctx, X, Y) { return score(X) >= score(Y) ? [X, Y] : [Y, X]; } });
var A = C.A, B = C.B;
S.noBody = C.noBody;     /* 真なら体の場面を出さない（心・言葉・拘束だけ）。開始前の注意 HK.SoloWarn.add でも伝える */
var per = DK.per(A);     /* 態度 9 種 */
var br = DK.branch(ctx, A, { gentle: 'k1', devoted: 'k1', proud: 'k4', _: 'k2' }, ['k1', 'k2', 'k3', 'k4']);   /* br.k・br.odd（らしくない） */
DK.install(ID, DK.couple('part', '<攻め側の値>', '<受け側の値>', ['guest']), '<結果の鍵>');   /* 周りの人（名簿から）・結果に写す */
DK.heavyDefault(ctx);    /* 展開の重さが空なら「重い」 */
if (DK.content(ctx, 'death')) { /* 死ネタのスイッチが入のときだけ */ }
```

- 攻めを選んだ人を受けにしない。`noBody` のときは体の場面の入口を出さない。
- 内容のスイッチは利用者の設定どおり（kit は上書きしない）。

## 6. 表情

```js
/* <部屋>-tags.js */
DK.face('set-c-<部屋>', [[/^xx_(snap|rage)/, 'angry'], [/^xx_beg/, 'fear'], [/^xx_gift/, 'joy']]);
/* 記録ごとに、計器で決めた表情を付ける（印の無い台詞の話し手が対象） */
var fc = {}; fc[B.i] = DK.val(S, 'fear') >= 70 ? 'fear' : 'normal';
DK.say(ctx, { id: 'xx_talk', cat: 'bond', actors: [A, B], t: t, a: A, b: B, face: fc });
```

大事な台詞（豹変・懇願・堕ちた一言・結末）は台詞の頭に表情の印を書く：`「〈恐怖〉…｜…｜…」`。印が最優先、次に `e.dkf`、次に出来事の id の既定、最後に気分。

## 7. 書式の決まり（本体の CLAUDE.md と同じ）

- 台詞は 3 本 `「くだけた常体｜硬い常体｜敬語」`（同じでよいところは `＝`）。一人称 `{一人称}`・二人称 `{二人称}`（「私」「あなた」「俺」の直書き禁止）。名前は `{a}`・`{b}`。紛らわしい台詞は `「＠{a}＠…」`。
- 台詞・喘ぎで本人が自分の口調に触れない。性別の決めつけの語（彼・彼女・夫・妻）は使わず名前で。登場人物はすべて成人。♡ は使わない。
- 関係の種類の内部の名前（「擬似親子」「セフレ」「元恋人」など）は本人の台詞と本人の目線の地の文に出さない（`HK.Kin.say` などの言い方）。
- すべての出来事に表示名（`label`、または `/* @event scen=set-c-<部屋> id=… cat=… tie=… tags=… label=… */`。8〜25 字の日本語）。
- 1 区切りに二人のやりとりを 1 件以上（空の区切り 0、1 文だけの区切りなし）。設定は 2 日目以降の出来事の種として毎日効かせる。
- 変えたら `node hakoniwa-tools/check.js` を終了コード 0 に。出来事を足したら `node hakoniwa-tools/build/event-catalog.js --pack=hakoniwa-packs/set-c` で一覧を作り直して差分を確かめる。
