# 点検の工程の見直し：棚卸し・依存の表・check.js

2026-11-04　担当（work/checks）。対象 HEAD：c429ecd2（無理やりの場面の二回目・三回目を取り込み）。

利用者の指示「コードのチェック工程に無駄がないか（口調更新してないのに口調チェックを通したり）、一度リファクタリングしてみてください」への対応。

**結論**：点検の道具と判定はそのままに、変わったファイルから要る点検だけを決めて回す入口 `node hakoniwa-tools/check.js` を作った。依存の表（`hakoniwa-tools/check/table.js`）で「何を変えたら何を回すか」を決め、軽い前置き → build → 重い点検を並べて回し、結果を入力のハッシュでキャッシュする。今までの「全部回す」（順に回して約 45 分。担当がふだん回していた一式でも約 23 分）に対し、典型的な変更では 台詞 1 行で約 3 分・画面で約 4.6 分・パックの 1 文で約 47 秒・宇宙船だけの部品で約 1.5 分。同じ入力の 2 回目は数秒。

## 1. 棚卸し：点検と build の道具

所要時間は同じ機械（4 コア）で、ほかに何も回していないときの実測（ページを開く時間を含む）。「いつ要るか」は 2026-11-04 までの CLAUDE.md の決まり。

| 道具 | 何を見るか | 入力（何を読むか） | R18版 | 全年齢版 | いつ要るか（今までの決まり） |
|---|---|---|---|---|---|
| `build/build.js` | かたまりと目録を作る・全年齢版の R18 の語の検査・出来事の一覧の作り直し | そのビルドの js・_order.txt・index.html | 38 秒 | 19 秒 | js を変えたら毎回・両ビルド |
| `build/catalog-check.js` | 出来事の一覧が古くないか・表示名・印の無い場面（パックも） | 両ビルドの js と一覧、パックの js、git の差 | 4〜9 秒（両ビルド） | 〃 | 出来事を足したら |
| `build/event-catalog.js --pack=` | パックの一覧（md）を作り直す | パックの js | 1 秒 | — | パックの出来事を足したら |
| `build/pack-site.js` | 試しのフォルダ（本体を写してパックを組み立てる） | 組み立て済みの両ビルド・パック | 5 秒（両ビルド） | 〃 | パックの点検の前 |
| `build/regress.js` | 全箱庭の結果の指紋（固定の配役・seed） | 組み立て済みのビルド（全部のかたまり） | 16 秒（全年齢モード 14 秒） | 13 秒 | 読み込み順・振り分けを変えたとき（変える前の出力と比べる） |
| `build/chunk-regress.js` | 箱庭を単独・乱順で読んだときの指紋の一致・口調の閉包 | 組み立て済みのビルド（http で配る） | 453 秒 | 328 秒 | 〃 |
| `build/chunk-audit.js` | かたまりの境目（中核が族の持ち物を読まない・持ち主が 2 つない） | 組み立て済みのビルド・_order.txt | 4 秒 | 3 秒 | 〃 |
| `tone-check/audit-all.js`（既定の一式） | orient・pos×3・state・loveflag・seg・qa・call・noname・topics・misc | 組み立て済みの両ビルド（全部のかたまり） | 3 通りで 241 秒 | （3 通りに含む） | js を変えて build したら毎回 |
| `audit-all.js --only-extra --extra=all` | sexgate・feud・group・state-hot・name・relcons・sexflow（＋今回 trio） | 〃 | 3 通りで 339 秒 | （含む） | 性的な出来事の門・不仲・複数人の恋愛・死・言い換え・関係の文・長い場面を変えたら（それぞれ） |
| `tone-check/tone-feel.js` | 49 口調の台詞の違和感（3 箱庭） | 組み立て済みの R18版 | 157 秒 | 160 秒（決まりでは要らない） | 場面・台詞を足したら（変えた箱庭だけ） |
| `tone-check/base-lint.js` | 3 本の台詞の約束（ソースを読むだけ） | js の文字列 | 1 秒 | — | 台詞を足したら |
| `tone-check/moan-tone-audit.js` | 喘ぎの口調（49 口調×性別×夜の性格。moan-audit.js を夜の性格ごとに 6 回） | 組み立て済みの R18版 | 415 秒 | — | 喘ぎを変えたら |
| `tone-check/sex-flow-audit.js` | 長い場面の流れ (a)〜(h) | 〃 | 8 秒 | — | 長い場面・型の部品を変えたら（audit-all の sexflow と同じ関数） |
| `tone-check/trio-shape-audit.js` | 三人の場面の形・設定に合わない形・場面の状態 | 〃 | 8 秒 | — | 三人の場面を変えたら |
| `tone-check/force-repeat-audit.js` | 無理やりの二回目・三回目の文・同じ台詞の二度出し | 〃 | 7 秒 | — | 無理やりの部品を変えたら（2026-11-04 から） |
| `tone-check/relcons-audit.js`（単独） | 展開の不整合 | 〃 | 47 秒（R18版だけ） | — | `--extra=relcons` と同じ関数 |
| `tone-check/dict-regress.js` | 口調の辞書の成績（書き下ろしを正解に） | js の辞書（node で読む） | 1 秒 | — | 参考（辞書を変えたとき） |
| パックの audit-all（`HK_ONLY_SCEN=部屋`） | 既定の一式を部屋だけで | 試しのフォルダ | 新婚 154 秒・看病 150 秒・デート 152 秒（3 通り） | （含む） | パックを変えたら部屋ごとに |
| パックの tone-feel（`--scen=部屋`） | 49 口調の違和感 | 試しのフォルダ | 新婚 29 秒・看病 17 秒・デート 25 秒 | — | 〃 |
| パックの sex-flow（新婚） | 長い場面の流れ | 試しのフォルダ | 4 秒 | — | 長い場面を変えたら |

点検でない道具（collect.js・lint.js・moan-audit.js 単独・setting-audit.js・lock-trio-check.js・locker-trio-rate.js・call-audit.js 単独・text-studio など）は、毎回の確認には入れていない（調べもの用）。

### 1-2. audit-all の各パスと、本体の js の種類

audit-all はページの中で全箱庭を回すので、どのパスも「組み立て済みの全部のかたまり」を読む。どの種類の js の変更で結果が変わりうるかを、パスごとにまとめる（check.js の依存の表の元）。

| パス（判定） | 主に効く js の種類 | 見るもの |
|---|---|---|
| orient | 組み立て（engine・attr・pos）・関係（ties・tie-*）・恋愛と夜の出来事（各箱庭・rel-*・R18 の場面） | 恋愛対象に合わない恋人・夜 |
| pos・pos-hot・pos-ffhot | R18 の場面・喘ぎ・体の語の印（lewd-words）・受け攻め（pos*）・長い場面 | 受け攻め・体の語 |
| state・topics-state | 組み立て・全部の出来事・死と退場・監禁・内容のスイッチ | 状態の整合 |
| loveflag | 関係・恋愛の出来事 | 恋愛：なし |
| seg・topics-seg | 話者推定（voice*）・台詞の文・目印 | 台詞の区分 |
| qa | 会話の部品・台詞 | 問いと返事（比率の参考） |
| call | 呼びかけ（pair-name・口調） | 名前の呼びかけ |
| noname | 組み立て・置き換え | 名前の無い住人 |
| misc（全部の回に相乗り） | すべての文（地の文・台詞・置き換え・体の語の印・全年齢の漏れ） | 文の崩れ |
| sexgate（追加） | 性的な出来事の門（engine・attr・content・free-sex・cold-fear・sex-lead など） | 関係ごとの起こりやすさ |
| feud（追加） | 不仲の部品（feud-kit・rel-bad-*・hate-*・各箱庭の不仲） | 不仲の組の交流 |
| group（追加） | 複数人の恋愛（rel-group・heartbreak・pining・rival など） | すれ違い系と仲良し系の比 |
| state-hot（追加） | 死・退場・蘇り（room-kill・grief-kit・deathgame-kit など） | 状態（R18 の熱い配役） |
| name（追加） | 言い換え（tone-dict-builtin・tone-engine・lewd-words・part-words・pair-name） | 名前が壊れないか |
| relcons・topics-relcons（追加） | 関係を前提にした文・場面と結末（ties・room-end・endings・*-after） | 展開の不整合（箱庭の決まった並び。HK_ONLY_SCEN では絞れない） |
| sexflow（追加） | 長い場面（thick-sex・sex-flow-*・play-*・pos-lead・ero-initiative-*・tie-order） | 流れ (a)〜(h)（HK_ONLY_SCEN の箱庭で回る） |
| trio（追加・今回） | 三人の場面（Trio3・trio-*） | 形・設定に合わない形（箱庭の決まった並び） |

口調だけの変更（tone-fix*・tone-brush*・voice-override-*：表に行を足すだけ。build が口調のかたまりに書き出す）は、台詞の言い換えの結果だけが変わり、配役・出来事の起こり方・状態は変わらないので、audit-all ではなく tone-feel と base-lint で見る（利用者の指摘どおり）。

## 2. 見つけた無駄と重複

| # | 無駄・重複 | 中身 | 対応 |
|---|---|---|---|
| 1 | 変更に関係ない点検 | 決まりが「js を変えたら毎回 audit-all」「場面・台詞を足したら tone-feel」「喘ぎを変えたら moan-tone」と道具ごとに書かれ、担当は安全側に全部回していた（口調だけの変更で audit-all、文を変えていないのに tone-feel、喘ぎを変えていないのに moan-tone の 9 分、読み込み順を変えていないのに regress、パックを変えていないのにパックの点検） | 依存の表で決める（3 章） |
| 2 | 箱庭を絞らない | 1 つの箱庭のかたまり（`@scen:`）だけを変えても、audit-all・moan-tone は全箱庭を回していた | 目録の依存から「そのかたまりを読む箱庭」を出して `HK_ONLY_SCEN`・`--scen=` で絞る |
| 3 | 同じ判定を 2 回 | sex-flow-audit 単独と `audit-all --extra=sexflow`、relcons-audit 単独と `--extra=relcons` は同じパス・判定。決まりの書き方（「…を 0 件にする（audit-all --extra=sexflow でも同じ）」）から、既定の一式と別に単独でも回すと、ページを 2 回開いて同じ回を 2 回回す | check.js はどちらか一方だけ。audit-all を全箱庭で回すときは相乗り、絞るときは単独 |
| 4 | 単独でしか回せない点検 | trio-shape-audit はパス・判定の形（core.js）なのに audit-all に入っておらず、いつも別のページを開いていた | audit-all に `--extra=trio` を足した（判定はそのまま。7 章で件数の一致） |
| 5 | 同じ指紋を 2 回 | chunk-regress は `--base` が無いと同じビルドを #all で開いて regress と同じ指紋を取り直す。regress と続けて回すと同じ指紋を 2 回取る | check.js は同じ回の regress（R18版）の今の指紋を chunk-regress の `--base` に渡す |
| 6 | 比べる相手の作り方 | regress は「変える前の出力」を手で取っておく必要があり、取り忘れると比べられない（担当が変える前のコミットを別に build して回すこともあった） | check.js が比べる相手のコミットの組み立て済みのビルドを `git archive` で取り出して指紋を取り、キャッシュに残す |
| 7 | 取り込みのたびのやり直し | 担当が回した点検を、まとめ役が取り込みのあとに同じ中身でもう一度回していた | 入力のハッシュでキャッシュ（主の作業フォルダのキャッシュをどの worktree からも使う） |
| 8 | パックの部屋ごとの重複 | 部屋ごとに audit-all・sex-flow-audit・trio-shape-audit・tone-feel をそれぞれ開いていた／全部屋を毎回 | 変えた部屋だけ。長い場面は部屋の audit-all に `--extra=sexflow` で相乗り |
| 9 | 全年齢版の tone-feel | 決まりは R18版だけなのに、全年齢版でも回すことがあった（160 秒） | 依存の表に入れない（--all でも R18版だけ） |
| 10 | 前置きの不足 | 構文の誤り・r18 の印の崩れ・両ビルドの片方だけの変更が、build や数分の点検のあとで見つかっていた | 数秒の前置きで先に落とす（syntax・r18mark・lines・twin・base-lint） |
| 11 | base-lint の誤検出 | HEAD でも画面の文字列（「結末｜経過｜…」など）が 9 件出て、終了コードが 1 のまま | 比べる相手のコミットに無かった問題だけを数える（判定は変えない） |
| 12 | 箱庭の絞り込みが効かないパス | `HK_ONLY_SCEN` は HK.SCEN_ORDER だけを絞るので、HK.SCENARIOS の全部を回す pos・state・noname・group は絞れず、パックの部屋の audit-all でも本体の全箱庭（R18版 3,452 回・約 150 秒）を回していた | lib.js が絞る箱庭を `HK.SCEN_ONLY` に残し、これらのパスは HK_ONLY_SCEN のときだけ絞る（ふだんの回は変わらない）。パックの部屋 1 つで 596〜620 回・約 45 秒 |

単独の orient-audit.js などは audit-all と同じ関数で、決まりの上は「詳しく見るとき」用なので、毎回の確認の重複ではない（check.js は呼ばない）。

## 3. check.js

### 3-1. 使い方

```
node hakoniwa-tools/check.js                 # まだコミットしていない変更（HEAD との差・未追跡のファイル）
node hakoniwa-tools/check.js --since=main    # main からの変更（作業ブランチ。取り込みのあとは --since=<取り込む前のコミット>）
node hakoniwa-tools/check.js --staged        # git add した分
node hakoniwa-tools/check.js --all           # 全部（全箱庭・追加の配役パス全部・全パック）
node hakoniwa-tools/check.js --pack=set-b    # パックの点検も（変えていなくても、全部屋）
node hakoniwa-tools/check.js --dry           # 何を回すか・飛ばす理由・キャッシュの有無だけ
node hakoniwa-tools/check.js --table         # 依存の表を md で出す（下の 3-3 はこの出力）
```

ほかに `--files=a,b`（git の差の代わりにこのファイルを変えたものとして決める。表の確かめ用）、`--force`（キャッシュを使わない）、`--jobs=N`（同時に使うページの数。既定は CPU の数。audit-all は 1 本で 2 ページ）、`--keep-going`（前置きが落ちても続ける）、`--cache=…`／`HK_CHECK_CACHE`、`-v`。終了コードは 0（すべて合格）／1。ログは `hakoniwa-tools/.check-cache/logs/<点検>.log`。

### 3-2. 流れ

1. **変わったファイル**：`git diff --name-status <比べる相手>` と未追跡のファイル。作り直されるもの（js/c・js/event-catalog.js・packs/・一覧の md・index.html の scripts:begin〜end の中だけの変更・.gz/.br）は見ない。
2. **印を付ける**：ファイルの場所・名前（3-3 の 2 つめの表）と、変わった行（足した行・消した行）の中身（3 つめの表）から印を付ける。js は acorn で字句に分け、**字句が前と同じ（コメント・空白だけの変更）なら印を外す**（`@event` 系・r18 の印に触れたときだけ event・zen）。_order.txt は行を足しただけ（既にある行の並び・注記が同じ）なら order を付けない。名前で決まらない js は sim（結果が変わりうる）。
3. **箱庭の範囲**：本体の js は _order.txt からかたまりを出し、目録（HK_MANIFEST）の依存をたどって「そのかたまりを読む箱庭」を出す（core・late・tone・pack-lewd と late が頼るかたまりは全箱庭）。audit-all・moan-tone・sex-flow・trio-shape はその箱庭だけ（`HK_ONLY_SCEN`・`--scen=`・箱庭の引数）。tone-feel は `@scen:` のファイルならその箱庭、ほかは既定の 3 箱庭。
4. **パック**：パックのファイルは pack.json のかたまりから部屋を出す（部屋の本体のかたまり＝部屋の id の後ろの名前。kit など共有のかたまりはそれを頼る全部屋）。本体の、パックが頼るかたまり（pack.json の deps のうち本体のもの：pack-roomkit・pack-lewd など。core・late は数えない）を変えたときも、そのパックの全部屋の audit-all を回す。
5. **回す**：前置き（順に。落ちたら重い点検に進まない）→ build（変えたビルドだけ。両ビルドは並べる）・パックの一覧 → catalog-check・pack-site → 重い点検（依存が済んだものから、目安の重い順に、ページの数の上限 `--jobs` まで並べる。audit-all は 2 ページに数える）。
6. **キャッシュ**：点検ごとに鍵＝sha1（点検・引数・環境値 ＋ 道具のファイル（require をたどったもの）の中身 ＋ 入力）。入力は、本体の重い点検なら「回す範囲の箱庭が読むかたまりのファイル（core・late とその依存・口調のかたまり・箱庭の依存）の中身と目録の箱庭の情報」、パックなら「本体のパックが頼るかたまり ＋ 部屋のかたまりのファイル ＋ コード」、build なら「js・_order.txt・index.html の scripts の外・build の道具」と出力。同じ鍵の結果（合否・件数・まとめ・所要・日時・コミット）があれば回さずに出す。かたまりの名前は中身のハッシュなので、取り込みで別の箱庭のかたまりだけが変わったときは、変わっていない箱庭の範囲の結果がそのまま使える。
7. **一覧**：回した点検・合否・件数・所要（キャッシュなら前回の日時と所要）・まとめの一行、飛ばした点検とその理由。

### 3-3. 依存の表（`node hakoniwa-tools/check.js --table` の出力）

| 印 | 意味 |
|---|---|
| `js` | js を変えた（build が要る） |
| `sim` | シミュレーションの結果が変わりうる（恋愛・夜・R18・関係・場面・組み立て） |
| `ui` | 画面だけ（結果は変わらないはず） |
| `serifu` | 台詞（「」・3 本の台詞）を足した・変えた |
| `tone` | 口調の表・書き下ろし（tone-*・voice-override-*） |
| `dict` | 口調の辞書・言い換えの仕組み |
| `moan` | 喘ぎ |
| `thick` | 長いエッチの場面の部品 |
| `trio` | 三人の場面の部品 |
| `force` | 無理やりの部品 |
| `sexgate` | 性的な出来事の起こり方（性欲・理性・関係） |
| `feud` | 不仲の組 |
| `group` | 複数人の恋愛（嫉妬・失恋・応援） |
| `death` | 死・退場・蘇り |
| `name` | 言い換え（名前が壊れうる） |
| `rel` | 関係を前提にした文・場面や結末を足した |
| `pair` | 二人きりで出うる文（出られない部屋・執着・関係・共通の出来事。第三者を前提にした文） |
| `event` | 出来事の印（@event・label・場面の書き方） |
| `zen` | r18 の印（全年齢版の中身が変わる） |
| `order` | 読み込み順・かたまりの振り分け |
| `buildtool` | build の道具 |
| `butt` | 体の語の印（lewd-words.js）・喘ぎ・R18 の文（お尻の語の点検） |
| `doc` | 文書・コメントだけ（何も回さない） |

| ファイルの場所・名前 | 付く印 |
|---|---|
| `/^hakoniwa-(?:full\|zenrei)\/(?:js\/c\/\|js\/event-catalog\.js$\|packs\/)\|^docs\/reports\/2026-10-28\/event-catalog\.md$\|^docs\/reports\/2026-11-03\/pack-event-catalog\.md$\|\.(?:gz\|br)$/` | 作り直されるもの（見ない）（ここで止める） |
| `/\.md$\|^docs\/\|^CLAUDE\.md$\|\.txt$(?<!_order\.txt)/` | `doc`（ここで止める） |
| `/^hakoniwa-tools\/(?:check\.js\|check\/\|text-studio\/\|\.check-cache\/)/` | —（ここで止める） |
| `/^hakoniwa-tools\/build\/(?:build\|build-min\|build-manifest\|build-tone)\.js$/` | `buildtool` `js`（ここで止める） |
| `/^hakoniwa-tools\/build\/event-catalog(?:-headless)?\.js$/` | `event` `js`（ここで止める） |
| `/^hakoniwa-(?:full\|zenrei)\/js\/_order\.txt$/` | `order` `js`（ここで止める） |
| `/^hakoniwa-(?:full\|zenrei)\/js\/(?:load\|load-order)\.js$/` | `order` `js`（ここで止める） |
| `/^hakoniwa-(?:full\|zenrei)\/(?!js\/)/` | `ui` `js`（ここで止める） |
| `/^hakoniwa-(?:full\|zenrei)\/js\/[^/]+\.js$/` | `js` |
| `/^hakoniwa-packs\/[^/_][^/]*\/js\/[^/]+\.js$/` | — |
| `/^(?:ui\|view)(?:[-.])\|-view\.js$\|^(?:packs-ui\|event-catalog-ui\|share-card\|export-out\|icons\|save-folder\|saves\|history\|notice\|tips\|tips-scen-[a-z]\|egoquiz\|ego-image\|portable)\.js$/`（js の名前） | `ui`（画面：台詞の印を付けない） |
| `/^lewd-words\.js$\|-r18\.js$\|-ero\d*\.js$\|^moan-\|r18-\|^ero-/`（js の名前） | `butt` |
| `/^(?:tone-(?:dict-builtin\|engine\|registry\|plus\|keigo-unify)\|lewd-words\|lewd-unify\|part-words\|pair-name\|sib-word\|attr-yomi\|safe)\.js$/`（js の名前） | `dict` `name` `serifu` `sim` |
| `/^(?:voice\|voice-seg\|voice-tone\|voice-fp\|voice-more)\.js$/`（js の名前） | `serifu` `sim` |
| `/^(?:tone-\|voice-override)\|-tone\.js$/`（js の名前） | `tone` `serifu`（口調だけ：sim を付けない） |
| `/^(?:moan-\|ero-moan-tone\|novel-moan-tone\|solo-r18-moan)/`（js の名前） | `moan` `sim` |
| `/^(?:sex-flow-\|play-\|pos-lead\|ero-initiative-\|tie-order\|moan-tease\|room-thick\|thick-sex\|r18-thick)/`（js の名前） | `thick` `sim` |
| `/trio/`（js の名前） | `trio` `sim` |
| `/^(?:force-\|hate-sex)/`（js の名前） | `force` `sim` |
| `/^(?:engine\|attr\|attr-r18\|free-sex\|pos\|pos-ff\|pos-fm\|pos-nogen\|content\|content-events-r18\|emotion-r18\|esteem-r18\|fwb\|cold-fear\|cold-fear-r18\|fear-body-r18\|tie-master-r18\|sex-lead-r18)\.js$/`（js の名前） | `sexgate` `sim` |
| `/feud\|^rel-bad\|^hate-\|^unlike\|^sib-/`（js の名前） | `feud` `sim` |
| `/^rel-group\|heartbreak\|^poly\|^pining\|jealous\|rival\|fwbcrush/`（js の名前） | `group` `sim` |
| `/kill\|grief\|deathgame\|corpse\|-bite\|-cure\|state-store\|^reset/`（js の名前） | `death` `sim` |
| `/^(?:ties?\|tie-\|rel-\|room-know\|room-end\|room-awkward\|fam-kin\|endings\|epilogue\|attr-meet)\|-after\.js$\|-rel\.js$/`（js の名前） | `rel` `sim` |
| `/^(?:scenario-room\|room-\|mini\|obsess\|ties?[-.]\|tie-\|common\|engine\|endings\|hate-kit\|sib-feud\|fwbcrush\|solo-room-jealous\|sex-lead\|cold-fear)/`（js の名前） | `pair` `sim` |
| `/^hakoniwa-packs\/[^/_][^/]*\/pack\.json$/` | `sim` |
| `/^hakoniwa-tools\//` | 道具（その道具の点検を回し直す） |

| 変わった行の中身 | 付く印 |
|---|---|
| `/「[^」\n]*」\|「[^」\n]*$\|^[^「\n]*」/` | `serifu` |
| `/TONE_MOAN\|NovelMoan\|HK\.Moan\b\|MOAN_\|moan/i` | `moan` |
| `/♡\|[ぁぃぅぇぉ]{2}\|[あんっ]っ[、…♡！]\|イっ\|イく/` | `moan` |
| `/ThickSex\.scene\|ThickEro\.scene\|Play\.addScene\|HK\.SexFlow\|HK\.Play\b/` | `thick` |
| `/HK\.Trio3\|trio/i` | `trio` |
| `/ForceRep\|'force'\|"force"/` | `force` |
| `/okSex\|canSex\|sexGate\|libido\|tieBodyOK\|fearHeld\|理性\|性欲/` | `sexgate` |
| `/不仲\|敵対\|険悪\|feud\|'enemy'\|"enemy"/` | `feud` |
| `/嫉妬\|失恋\|三角関係\|応援\|祝福\|ダブルデート\|jealous\|heartbreak/` | `group` |
| `/\bdead\b\|\.dead\|alive\|revive\|退場\|蘇\|死ん\|死体\|死ぬ/` | `death` |
| `/relFilter\|relClass\|初対面\|初めまして\|連絡先\|付き合い始め\|出会/` | `rel` |
| `/ほかの誰か\|他の誰か\|別の誰か\|みんな\|全員\|人目\|誰と話\|誰に笑いかけ\|周りの人\|noThird\|THIRD_RE/` | `pair` |
| `/@event\|@labels\|@event-table\|@event-ok/` | `event` `rel` `js` |
| `/r18:(?:begin\|end\|ok)/` | `zen` `js` |
| `/\blabel\s*:\s*['"]\|\btag\s*:\s*['"]\|kind\s*:\s*['"]climax\|\bsex\s*:\s*true/`・ファイルの追加と削除 | `event` |

| 点検 | 段 | 回す印 | 先に済ませる | ページ | 目安 | 備考 |
|---|---|---|---|---|---|---|
| 構文（node --check と同じ）（`syntax`） | pre | `js` | — | 0 | 1 秒 | 変えた js（本体・パック・道具）をコンパイルだけする |
| r18 の印の対応（`r18mark`） | pre | `js` | — | 0 | 1 秒 | 変えた本体の js で /* r18:begin */ と /* r18:end */ が行全体・交互・入れ子なし |
| 2000 行の上限（`lines`） | pre | `js` | — | 0 | 1 秒 | 変えた js が 2000 行を超えた（もともと超えていて増えたものは警告だけ） |
| 両ビルドの同名ファイル（`twin`） | pre | `js` | — | 0 | 1 秒 | 前は同じだった hakoniwa-full と hakoniwa-zenrei の同名ファイルが、片方だけ変わった |
| 3 本の台詞の約束（base-lint）（`base-lint`） | pre | `serifu` `tone` | — | 0 | 6 秒 | 比べる相手のコミットに無かった問題だけを数える（今ある誤検出 9 件は数えない） |
| build（両ビルド）（`build`） | build | `js` | — | 1 | 40 秒 | ビルドのフォルダの js・_order.txt・index.html を変えたビルドだけ。入力が前回の build と同じで出力も同じなら飛ばす。中核（core）の br（かたまり・ファイルごとの目安の合計）が 900KB を超えたら不合格（2026-11-04） |
| 出来事の一覧（catalog-check）（`catalog`） | post | `js` `event` | build・pack-catalog | 0 | 6 秒 | build のあと。一覧が古い・表示名の無い出来事・印の無い新しい場面 |
| 点検の一式（audit-all）（`audit-all`） | heavy | `sim` `ui` `zen` `moan` `thick` `trio` `force` `sexgate` `feud` `group` `death` `name` `rel` `pair` | build | 2 | 240 秒 | 既定の一式（orient・pos×3・state・loveflag・seg・qa・call・misc）。印で追加の配役パス（--extra）を足す。箱庭のかたまりだけ変えたときはその箱庭だけ（HK_ONLY_SCEN） |
| 口調の違和感（tone-feel）（`tone-feel`） | heavy | `serifu` `tone` | build | 1 | 155 秒 | 変えた箱庭だけ（--scen=）。本体の共通の文なら既定の 3 箱庭 |
| 喘ぎの口調（moan-tone-audit）（`moan-tone`） | heavy | `moan` | build | 1 | 420 秒 | 箱庭のかたまりだけ変えたときは --scen= |
| 長い場面の流れ（sex-flow-audit）（`sex-flow`） | heavy | `thick` | build | 1 | 10 秒 | audit-all を全箱庭で回すときは --extra=sexflow に入れる（同じ関数。ページを開き直さない） |
| 三人の場面の形（trio-shape-audit）（`trio-shape`） | heavy | `trio` | build | 1 | 10 秒 | audit-all を全箱庭で回すときは --extra=trio に入れる |
| 無理やりの二回目・三回目（force-repeat-audit）（`force-repeat`） | heavy | `force` | build | 1 | 10 秒 |  |
| 女性の受けのお尻の語（butt-word-audit）（`butt-word`） | heavy | `butt` | build | 1 | 60 秒 | 受けが女性の体の組（男×女・女×女）の記録に「ケツ」が 0 件（男性の受けの件数は参考）。箱庭のかたまりだけ変えたときはその箱庭だけ（HK_ONLY_SCEN） |
| 自分の口調に言及する台詞（meta-tone-audit）（`meta-tone`） | heavy | `moan` `serifu` `tone` | build | 1 | 25 秒 | 台詞・喘ぎで本人が自分の話し方（敬語・言葉遣い・口調・タメ口…）に触れるもの 0 件。R18版・全年齢版の記録と、喘ぎの表・書き下ろし・「」の中のソース（静的。本体の両ビルドと全パック）。箱庭のかたまりだけ変えたときは記録はその箱庭だけ |
| 結果の指紋（regress。比べる相手のコミットと）（`regress`） | heavy | `ui` `order` `buildtool` | build | 1 | 15 秒 | R18版・全年齢モード・全年齢版。比べる相手の指紋は、そのコミットのビルドを取り出して取る（キャッシュに残る） |
| 単独・乱順の読み込み（chunk-regress）（`chunk-regress`） | heavy | `order` `buildtool` | build | 1 | 450 秒 | 両ビルド |
| かたまりの境目（chunk-audit）（`chunk-audit`） | heavy | `order` `buildtool` | build | 1 | 60 秒 | 両ビルド |
| 口調の辞書の成績（dict-regress。参考）（`dict-regress`） | heavy | `dict` | — | 1 | 10 秒 | 終了コードに入れない（成績を出すだけ） |
| デートの舞台と段（date-setting-audit）（`date-setting`） | pre | `pack` | — | 0 | 1 秒 | set-b のデートの日々を変えたとき。行き先 52 か所 × 汎用の出来事の舞台の矛盾・段の付いていない行（ページを開かない） |
| 看病の部屋の役と状態（kanbyo-role-audit）（`kanbyo-role`） | heavy | `pack` | pack-site | 1 | 30 秒 | set-b の看病の部屋を変えたとき。報告の 16 通りで、看る人・看られる人の取り違え・通いの行き来・熱の数字と言葉・関係の取り違え・三人目・結末のあとが 0 件 |
| パックの出来事の一覧（event-catalog --pack）（`pack-catalog`） | build | `pack` | — | 1 | 3 秒 | 作り直してから catalog-check |
| パックの試しのフォルダ（pack-site）（`pack-site`） | build | `pack` | build | 1 | 40 秒 | 本体を写してパックを組み立てる（キャッシュの中に作る） |
| パックの点検の一式（audit-all・HK_ONLY_SCEN）（`pack-audit`） | heavy | `pack` | pack-site | 2 | 150 秒 | 変えた部屋だけ（共有の部品 kit などを変えたらそのパックの全部屋）。長い場面を変えたら --extra=sexflow も |
| パックの口調の違和感（tone-feel --scen=部屋）（`pack-feel`） | heavy | `pack` | pack-site | 1 | 60 秒 | 台詞を変えた部屋だけ |
| パックの喘ぎの口調（moan-tone-audit --scen=部屋）（`pack-moan`） | heavy | `pack` | pack-site | 1 | 120 秒 | 喘ぎを変えた部屋だけ |
| パックの三人の場面（trio-shape-audit 部屋）（`pack-flow`） | heavy | `pack` | pack-site | 1 | 30 秒 | 三人の部品を変えた部屋だけ（長い場面はパックの audit-all に --extra=sexflow で入れる） |

補足：
- 印 → 追加の配役パス：sexgate→sexgate、feud→feud、group→group、death→state-hot、name→name、rel→relcons（＋topics-relcons）、pair→pair（出られない部屋の二人きりの文。2026-11-04 担当PR）。audit-all を全箱庭で回すときは thick→sexflow、trio→trio も相乗り（絞るときは sex-flow-audit・trio-shape-audit を箱庭の引数で単独に）。
- 既定の一式が要らず追加の配役パスだけで足りるのは、名前・言い換えの印だけが付いたとき（`--only-extra`）。r18 の印だけを変えたときは全年齢版だけ（`--modes=zen`）。
- 点検の道具（hakoniwa-tools/ の js）を変えたら、その道具を使う点検を全範囲で回し直す（キャッシュの鍵にも道具の中身が入っている）。check.js・check/table.js・text-studio は何も回さない。
- 文書（*.md・docs/）・CLAUDE.md は何も回さない。

## 4. 重複の解消で変えた道具（判定は変えていない）

- `trio-shape-audit.js`：audit-all 用のまとめ `summarize`・`LABEL` を足した（単独で回したときの終了コードの条件と同じ 5 項目：設定に合わない形・動きの二度出し・繋がったあとの脱がせる・応答待ちのあと受けの台詞なし・同じ地の文の二度出し）。
- `audit-all.js`：追加の配役パス `trio`（R18版。単独と同じ N=4・同じ箱庭）を足した。`--extra=all` にも入る。
- `lib.js`・`pos-audit.js`・`state-audit.js`・`audit/misc.js`（noname）・`group-audit.js`：`HK_ONLY_SCEN` のときだけ、HK.SCENARIOS の全部を回すパスも絞る（`HK.SCEN_ONLY`）。環境値の無いふだんの回は変わらない。
- 件数の一致：`node hakoniwa-tools/tone-check/audit-all.js --modes=r18 --only-extra --extra=trio --print=…` の trio-r18.txt と、単独の `trio-shape-audit.js hakoniwa-full` の出力（文の表の行を除く）が一致（三人の場面・形ごと・配役ごとの件数・設定に合わない形 0・場面の状態 0。R18版 672 回・9 秒）。既定の一式・ほかの追加の配役パスの件数は、`--all` の audit-all がすべて 0 件で、回数も前と同じ（R18版 17,836 回＝既定の一式 4,916＋追加の配役パス 12,248＋trio 672、全年齢モード 5,220＝2,508＋2,712、全年齢版 6,676＝3,044＋3,632。HK_ONLY_SCEN を pos・state などに効かせる前と後で同じ）。

## 5. 確かめ

確かめのための変更は `--files=…` で渡し（ファイルを書き換えて回し、あとで元に戻した）、キャッシュは空から。`--dry` の「回す点検」と実走の結果。

| # | 変更 | `--dry` で回す点検 | 実走（所要・結果） |
|---|---|---|---|
| (a) | `docs/…/kiss-design.md` に 1 行 ＋ 両ビルドの `kiss.js` の 2 行目のコメントに 1 語 | なし（md は doc、kiss.js は字句が同じ「コメントだけ」） | 0 秒・「回す点検はありません」・終了コード 0 |
| (b) | 両ビルドの `tone-fix.js` の 1 行（書き下ろしの台詞） | 前置き 4 ＋ base-lint、build ×2、catalog-check、**tone-feel（既定の 3 箱庭）**。audit-all・moan-tone・regress などは飛ばす | 185 秒・すべて合格（tone-feel 143 秒・build 40＋19 秒） |
| (b') | (b) をもう一度（キャッシュ） | 同じ | **0.7 秒**（build は入力・出力とも前回と同じ、base-lint・catalog・tone-feel はキャッシュ） |
| (c) | `moan-engine.js`（pack-lewd）にコードを 1 つ | 前置き、build（R18版）、catalog、**audit-all・moan-tone**、パックの一覧・試しのフォルダ・**パックの audit-all ×3 部屋**（pack-lewd はパックが頼るかたまりなので） | 619 秒・すべて合格（moan-tone 424 秒が最長。audit-all 207 秒と並べた） |
| (d) | 両ビルドの `ui.js` にコードを 1 つ | 前置き、build ×2、catalog、**audit-all・regress ×3**。tone-feel・base-lint は飛ばす（ui は台詞の印を付けない） | 278 秒・すべて合格（regress は c429ecd2 のビルドと全箱庭一致） |
| (e) | パック set-b の `kanbyo-text-a.js` の 1 文 | 前置き ＋ base-lint（パック）、パックの一覧・試しのフォルダ・catalog、**看病の部屋だけ**の audit-all・tone-feel。本体の build・audit-all は回さない | 139 秒。audit-all 0 件、tone-feel は ✕ 8 口調（HEAD でも同じ 8 口調。7 章の 1） |
| (f) | `--all` | 前置き 4・base-lint ×2・build ×2・catalog・audit-all（既定＋追加の配役パス全部 8 つ）・tone-feel・moan-tone・force-repeat・regress ×3・chunk-regress ×2・chunk-audit ×2・dict-regress・パックの一覧・試しのフォルダ・パックの部屋ごとに audit-all（＋sexflow）・tone-feel・moan-tone・trio-shape | 1,536 秒（約 26 分）→ pos・state なども HK_ONLY_SCEN で絞るようにしたあと **1,140 秒（約 19 分）**。パックの tone-feel の 2 部屋（HEAD でも同じ）のほかは合格 |
| (f') | `--all` をもう一度（キャッシュ） | 同じ | **3.7 秒**（35 のうち 30 がキャッシュ。前置き 4 と dict-regress（参考）だけ回る） |
| (g) | 宇宙船だけのファイル `ship-life.js`（`@scen:ship`）にコードを 1 つ | 前置き、build ×2、catalog、**audit-all（ship だけ。HK_ONLY_SCEN）** | 171 秒（audit-all 131 秒）→ pos・state なども絞るようにしたあと **audit-all 37 秒** |

ほかに、2026-11-04 のコミット 12e5eaa0（無理やりの二回目・三回目）を `--dry --since=12e5eaa0~1` で当てると、audit-all ＋ sexgate・feud・relcons・sexflow、tone-feel、moan-tone、force-repeat、base-lint、パックの audit-all ×3 になり、_order.txt は「行を足しただけ」なので regress・chunk-regress は回さない（index.html の目録だけの変更は作り直されたものとして見ない）。

`--force` で回し直したときと、キャッシュの結果が同じであることは、同じ入力なら同じ seed・配役で回る作りなので、(b)(b') のまとめ（件数・シミュレーションの回数）が一致することで見た。

## 6. 所要時間の前後

同じ機械（4 コア）。「今まで」は、各道具を単独で順に回した時間（1 章の実測）の和。担当は変更の種類によらず「build ＋ audit-all ＋ tone-feel ＋ moan-tone ＋ base-lint ＋ catalog-check ＋ パック 3 部屋の audit-all と tone-feel」を回していた（約 23 分）。check.js は `--jobs=4`（ページ 4 枚）で並べた実測（キャッシュが空のとき）。

| 変更 | 今まで（担当の一式・順に） | check.js（初回） | check.js（2 回目・同じ入力） |
|---|---|---|---|
| 台詞を 1 行（tone-fix.js） | 約 1,400 秒（約 23 分） | **185 秒**（build 2・base-lint・catalog・tone-feel） | **0.7 秒** |
| 画面（ui.js） | 約 1,400 秒（＋regress を取り直すなら比べる相手の build と指紋） | **278 秒**（build 2・catalog・audit-all・regress 3） | 1 秒前後 |
| 喘ぎの仕組み（moan-engine.js） | 約 1,400 秒 | **619 秒**（moan-tone 424 秒が最長。パックの部屋の audit-all は絞り込みの前の 150 秒で計測。今は 1 部屋 45 秒前後） | 1 秒前後 |
| パックの 1 文（看病） | 約 1,400 秒（本体の一式も回していた）／パックだけでも 3 部屋で約 530 秒 | **47 秒**（看病の部屋の audit-all 42 秒・tone-feel 19 秒・試しのフォルダ 5 秒を並べて） | 1 秒前後 |
| 宇宙船だけの部品（ship-life.js） | 約 1,400 秒 | **約 95 秒**（build 2 の 57 秒 ＋ ship だけの audit-all 37 秒の実測の和。build がキャッシュなら 40 秒ほど） | 1 秒前後 |
| 文書・コメントだけ | （回していた担当もいた） | **0 秒**（何も回さない） | — |
| 全部（`--all`） | 約 2,700 秒（約 45 分：build・audit-all と追加の配役パス・tone-feel・moan-tone・sex-flow・trio・force・regress と比べる相手・chunk-regress・chunk-audit・catalog・base-lint・relcons 単独（重複）・パック 3 部屋の audit-all と tone-feel） | **1,140 秒（約 19 分）** | **3.7 秒** |

取り込み（merge）のあと：まとめ役が `--since=<取り込む前のコミット>` で回すと、担当が同じ中身で回した点検は（主の作業フォルダのキャッシュを共有しているので）キャッシュから出る。別の担当の変更と重なったかたまりを読む点検だけが回り直る（鍵は「回す範囲の箱庭が読むかたまりの中身」なので、別の箱庭のかたまりだけが変わったなら当たる）。

## 7. 残った課題

1. **パックの tone-feel が HEAD でも合格でない**：新婚 4 口調（後輩・関西弁・チャラい・男オタク）、看病 8 口調（関西弁・のじゃ・熱血・ギャル・チャラい・けだるげ・けだるげ（軽）・無口（だね））が △（3〜5.4%。10% 以下）。1 部屋 N=24 だと 1 口調 300 本ほどで割合がぶれやすい。check.js はパックの台詞を変えると ✕ を出し続けるので、書き下ろしで直すか、パックの tone-feel の回数・合否の線を決め直す（別の担当へ）。
   - **済（2026-11-04 work/followup）**：回数・種・配役の違いではなく、前の担当が直したあとに台詞が増えて崩れが残っていた（check.js と同じ引数の単独実行でも同じ数）。辞書では直らない言い回し（新婚・看病・デートに共通の kit の台詞：おかえり・ご褒美・寝顔・甘えたいなら・上手・攻めるのも など）を口調ごとに書き下ろした（set-b/js/shinkon-tone.js に 10 口調・216 行（3 本の鍵ごと。性的な台詞は r18 の印の中）、kanbyo-tone.js ののじゃ・ギャルの 2 か所と shinkon-tone.js の後輩の 1 か所を直した）。判定は変えていない。3 部屋とも全 49 口調 ◯（最大：新婚 2.7%・看病 2.9%・デート 1.8%。見ていない種で最大 3.7%）。あわせて、媚薬ロッカー（locker）単独の tone-feel が HEAD のままで 10 口調 △ だったので、tone-brush-lk3-r18.js に 3 本の鍵で 194 行を足して全口調 ◯（最大 2.8%）にした
2. **misc の T2「空の記録」が三人の場面の回で 4 件**：audit-all に trio のパスを足したとき、文の崩れ（misc）を当てると、媚薬ロッカーの三人の夜（`tag: '三人の夜'`・`text: ''` の記録）で 4 件出た。今回は判定を変えない範囲なので、trio の回には misc を当てない（`noMisc`）にした。本体の記録が空でよいもの（印だけの記録）か、文が抜けているのかを確かめる（別の担当へ）。
   - **済（2026-11-04 work/followup）**：本体の不具合だった。locker-trio-bed.js の仮眠室の三人のベッドで、描写の長さが「短く」のとき HK.Trio3 の文の量の調整（fit。短くは 3〜4 文）が山場の文（重さ 1）だけを残し、前戯〜最中（fore・in・mid）が空になって「三人の夜」が text '' で出ていた（4 件はすべて短く）。前戯〜最中が空なら山場の文を「三人の夜」に入れて「三人の絶頂」を出さないように直した。audit-all の trio のパスの noMisc を外し、misc を当てて 0 件
3. **中核・late を変えてもパックの点検は回らない**：パックが頼る本体のかたまりは pack.json の deps（pack-roomkit・pack-lewd・pack-rel など）だけで数え、どの変更にも当たる core・late は数えない（数えると毎回パックの 3 部屋が回る）。中核の組み立て（engine・attr など）を大きく変えたときは `--pack=set-b` を付ける。
4. **relcons・trio のパスは箱庭の決まった並びを回す**：HK_ONLY_SCEN で絞れない（relcons は 11 箱庭、trio は 4 箱庭）。絞った回では、関係の文の印が付くと relcons は 11 箱庭のまま回る（遅いだけで、誤りではない）。パックの部屋では relcons を回していない（部屋が並びに無い）。
5. **既定の一式はパスごとに分けていない**：シミュレーションに触れる変更なら、喘ぎだけでも orient・state など全部のパスが回る（約 4 分。箱庭を絞れば数十秒）。パスごとの依存はまだ表にしていない（1-2 の表は目安）。
6. **印の付け方は名前と行の中身の目安**：名前で決まらない js は安全側（sim）に倒す。新しい種類の部品（新しい名前の付け方・新しい点検）を足したら `check/table.js` に足す。誤って飛ばすのが心配なときは `--all`。
7. **base-lint の誤検出 9 件**（画面の文字列「結末｜経過｜…」など）は残したまま。比べる相手との差で数えるので、check.js の合否には影響しない。
8. **chunk-regress が --all の大半**（R18版 約 7.5 分・全年齢版 約 5.5 分）。読み込み順・かたまりを変えたときだけ回るので、ふだんは回らない。
