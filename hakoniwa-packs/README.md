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
