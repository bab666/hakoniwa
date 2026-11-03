# 追加パック（新しい箱庭のセット）のソース

本体とは別に作り直して配る、有料の追加パックのソースを置く。仕組みは `docs/reports/2026-11-02/pack-foundation.md`。

## フォルダ

```
hakoniwa-packs/
  README.md             … これ
  codes.example.json    … コードのファイルの見本
  codes.local.json      … 本物のコード（git に入れない。codes.example.json を写して作る）
  _sample/              … 見本のパック（本番に出さない。試しのフォルダにだけ組み立てる）
  set-a/                … パック（1セット1フォルダ）
    pack.json
    js/*.js
```

## pack.json

```json
{
  "id": "set-a",
  "slot": "set-a",
  "name": "ソロR18セット",
  "desc": "コードの入力画面に出す紹介（部屋の名前は書かない）",
  "builds": ["full"],
  "api": 1,
  "chunks": [
    { "name": "tentacle", "deps": ["pack-solo"], "files": ["js/tentacle.js"] },
    { "name": "av", "deps": { "full": ["pack-rel", "pack-solo"], "zenrei": ["pack-rel"] }, "files": ["js/av.js", "js/av-text.js"] }
  ],
  "needs": { "set-a-av": ["pack-trap"] }
}
```

- `id`：英小文字・数字・-。箱庭の id はこれで始める（`set-a-tentacle`）。
- `slot`：本体が読みに行く枠（`set-a`〜`set-l`）。ふつうは id と同じ。
- `builds`：作るビルド（`full`＝R18版、`zenrei`＝全年齢版）。Cセットのように R18版だけなら `["full"]`。
- `chunks`：かたまり。箱庭1つにかたまり1つが目安（その箱庭を選んだときだけ読まれる）。`deps` は頼る本体のかたまり（`pack-rel`・`pack-solo`・`pack-story`・`pack-trap`・`scen-<箱庭>` など。本体の `js/_order.txt` の `@chunk` を見る）か、同じパックのかたまりの名前。ビルドで分け方が違うときは `{ "full": [...], "zenrei": [...] }`。
- `needs`：任意。その箱庭を動かすのに、登録するかたまりのほかに要るかたまり。

## ファイルの書き方

- 最上位は `(function () { 'use strict'; var HK = window.HK; … })();` で包む（本体と同じ決まり）。
- 箱庭の登録は `HK.SCENARIOS['set-a-tentacle'] = scen;` だけ。並び（`HK.SCEN_ORDER`）は本体が足す。
- 本体の作業の決まり（CLAUDE.md）はパックにもそのまま当てる：台詞の3本、R18の文の基準、体の語の印、`HK.SexLead` への登録、出来事の印と表示名、恋愛対象・受け攻めの点検。
- 両方のビルドに出すファイルでは、性的な場面の文を `/* r18:begin */`〜`/* r18:end */` で挟む。全年齢版のパックを作るときに落とし、性的な語が残っていれば止まる。

## 部屋ごとの長いエッチの場面・エッチの型（2026-11-03）

本体の長い場面（`HK.ThickSex.scene`・`HK.ThickEro.scene`）は、一回ごとに「エッチの型」（入り方・主な責め・道具・体位・終わり方。`HK.Play`）を決めて組み替える。部屋の側からは次の 3 つで関われる（設計は `docs/reports/2026-11-03/play-design.md` の 7）：

- `HK.Play.addScene(部屋の id, { id, label, when(ctx, a, b, opt), weight, play: { pos: … }, lead: { mf: [...], ff: [...], fm: [...] }, steps: [ { stage: 'undress'|'fore'|'insert'|'play'|'after', mf|ff|fm|all: [...] }, … ], tags: ['night'] })`：その部屋でしか出ない長い場面。`lead` がきっかけの段、`steps` が段階順の段（各 3 文以上・3 組の専用文）。山場の喘ぎ・終わり方・事後は共通の部品が後ろに付く。場面の近くに `/* @event scen=<部屋の id> id=<場面の id> tags=night label=… */` を付ける。
- `HK.Play.addRoom(部屋の id, { entry: { bath: 2 }, prop: { chakui: 1 }, … })`：部屋の小道具として、型の値の選ばれやすさを足す。
- 長い場面を呼ぶときの `opt.playScene`（登録した場面に決める）・`opt.play`（型の軸を固定）。短い・中くらいの場面に主な責めと体位の一文を入れるなら `HK.Play.shortLine(攻め, 受け, 組, opt)`（`{a}{b}` のままの文）。

足したら `sex-flow-audit.js` を部屋のある試しのフォルダで回し、(a)〜(h)（(h) は型の矛盾）を 0 件にする。

## キスの場面（HK.Kiss・2026-11-03）

キスの文は本体の共通部品 `HK.Kiss`（`js/kiss.js`。文の表は `js/kiss-text.js`・`js/kiss-text2.js` の `HK.KissText`）の型で組む。両方のビルドにある（R18版は本体のかたまり pack-lewd、全年齢版は pack-rel。どちらもパックの依存に入っていれば使える）。設計は `docs/reports/2026-11-03/kiss-design.md`。

- `HK.Kiss.scene(ctx, a, b, opt)`：キスだけの場面を記録に一件出す（`ctx.act2`。cat は romance、夜には数えない）。a・b はどちらが先でもよい（受け攻めは `HK.Pos.order` で決める）。戻り値 `{ e, plan, text }` か null。
  - `opt.trig`：きっかけ（`itte` いってらっしゃい・`okaeri` おかえり・`oyasumi` おやすみ・`neoki` 寝起き・`gochi` ごちそうさま・`fui` ふいに・`naka` 仲直り・`hobi` ご褒美・`karakai` からかい・`amayadori` 雨宿り・`amae` おねだり・`kinen` お祝い）
  - `opt.len`（`'s'`｜`'m'`｜`'l'`）・`opt.end`（`tere`・`again`・`nagori`・`hold`・`oazuke`・`promise`・`late`・`out`・`night`）を渡すと固定、省くと二人の態度・夜の性格・気分で選ぶ。`opt.place`（`genkan`・`kitchen`・`sofa`・`futon`・`soto`）は場所の決まっていないきっかけの頭に一文を置く
  - `opt.x`・`opt.y`：いってらっしゃい・おかえりの出かける人（帰った人）と見送る人。`opt.promise: true` で「続きは帰ってから」、`opt.night: true` で「そのまま夜へ」（R18 だけ）を候補にする
  - `opt.lead`・`opt.tail`：始まりの段を部屋の文（`{a}{b}` のまま）に替える・最後の段の後ろに文を足す（新婚部屋の最後の夜の幸せなキスで使用）
  - `opt.whyPre`（理由の欄の頭。既定は「キスだけの触れ合い：」）・`opt.fx`・`opt.tag`
- `HK.Kiss.text(ctx, a, b, opt)`：記録に出さずに本文だけ返す（`{ text, plan, why, label }`）。`HK.Kiss.trio(ctx, a, b, c)`（三人のキス）・`HK.Kiss.seen(ctx, a, b, c, 'warm'|'jeal')`（三人目 c に見られる）。
- 本体の共通の出来事のキス（kiss-events.js）は、id が `set-` で始まる箱庭には出ない。部屋でキスを出すときは、部屋のファイルから `HK.Kiss.scene` を呼び、出来事の印（`/* @event scen=<部屋の id> id=… label=… */`）を付ける。
- 例：新婚部屋は `js/shinkon-kiss.js`（shinkon.js を書き換えず、`HK.wrap` で区切りの関数 `phase`・`HK.Journal.add`・`HK.ShinkonR18.night` を包んで差し込む）。

## 出来事の一覧（2026-11-03）

パックの箱庭も、本体と同じく箱庭カードの「出来事の一覧」に出る（コードで開けたときだけ。一覧はパックの中身に暗号化して入り、ボタンを押したときだけ読む）。印は本体と同じ：

- 出来事のオブジェクト：`label: '内容の分かる 8〜25 字の日本語'`（必ず）、関係が条件なら `tie: 'lover'`（問わないなら `'-'`）、拾えない内容は `tags: ['night', 'mob', 'force', …]`。
- 関数で書いた場面：場面の近くに 1 行 `/* @event scen=set-b-shinkon id=sk_night_kiss cat=romance tie=- tags=night label=寝る前のキスから始まる夜 */`。scen はパックの箱庭の id、id は英字の重ならない名前、label は表示名（台詞「…」・英字を入れない）。
- 表：`/* @event-table scen=<箱庭の id> path=<HK. から先の表の場所> label=… */`（`rows=1` で行ごとに一覧へ）。工場で作る出来事の表示名は `/* @labels` の下に 1 行ずつ `id=表示名` `*/`。
- R18 の場面（`tags=night` など）の印は `/* r18:begin */`〜`/* r18:end */` の中に書く（全年齢版では落ちる）。エッチの入口の数は、この夜の印の数で数える。
- かたまりの名前 `catalog` は使えない（一覧のかたまり `pk-<枠>-catalog` に使う）。

足したら：`node hakoniwa-tools/build/event-catalog.js --pack=hakoniwa-packs/<パック>`（コード無しで一覧だけ。build-pack.js でも書き直る）で `docs/reports/2026-11-03/pack-event-catalog.md` を作り直し、`node hakoniwa-tools/build/catalog-check.js` を 0 件にして（表示名の無い出来事・印の無い出来事・一覧が古い）、md の差分に足した出来事が入っているのを確かめ、同じコミットに入れる。`HK.Packs.API` は上げていない（一覧のかたまりは古い本体では読まれないだけ）。

## 作る

本体を build したあとで：

```
node hakoniwa-tools/build/build-pack.js hakoniwa-packs/set-a
node hakoniwa-tools/build/build-pack.js hakoniwa-packs/set-a --dist          # 配布用の zip も dist/ に
node hakoniwa-tools/build/build-pack.js hakoniwa-packs/_sample --out=<試しのフォルダ> --codes=<試しのコード>   # 見本
```

書き出し：`hakoniwa-full/packs/set-a/pack.js`（と全年齢版）、`packs/index.js`（サイト公開版用の枠の一覧）。

## コード

`codes.local.json`：

```json
{ "set-a": ["セットAのコード"], "set-b": ["…"], "*": ["まとめ用のコード"] }
```

- `"*"` のコードは全部のパックに入る（1回入れると全部のセットが開く）。
- コードは空白・- を除いて大文字にしたとき6文字以上。入力では全角・小文字・- の有無を問わない。
- コードは変えずに使い続け、漏れなどの問題が起きたときだけ差し替えて、パックを作り直す（2026-10-31 の決定）。
