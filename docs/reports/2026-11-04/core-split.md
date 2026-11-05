# 中核の振り分けの見直しと、大きなファイルの分割（2026-11-04）

担当CS（work/core）。対象：main 79cf52a1。

利用者の指示：

1. 「分割と振り分けの見直しをお願いします」：R18版の中核（起動時に読む）が br の目安で約 1050KB と上限 1MB（目安 0.9MB）を超えている。ui.js が 2458 行（上限 2000）、tone-fix.js 2625 行、tone-fix-g2.js 2258 行も超えている。
2. 「ルールに無理があれば変更も考えてもいいが、**箱庭を増やせば増やすほど一ファイルが膨らんでいく、という風にはしたくない**」。

追加の注意（まとめ役から）：「Safari の問題が再発しないように気をつけて」（読み込みの失敗と再試行・描き直しで位置を動かさない・Safari 固有の判定を保つ。確かめは 6 章）。

---

## 0. 結論

| | 変える前 | 変えたあと |
|---|---|---|
| R18版の中核 | 146本・3548KB（かたまりの br **859KB**／ファイルごとの br の目安の合計 **1050KB**） | 115本・2207KB（かたまりの br **566KB**／目安の合計 **698KB**） |
| 全年齢版の中核 | 131本・2817KB（br **704KB**／目安 **860KB**） | 109本・1988KB（br **513KB**／目安 **628KB**） |
| R18版：画面が出たあと late までに読む分（pack-sim・pack-lewd・late・tone-base） | pack-lewd 427＋late 198＋tone-base 63＝br 688KB | pack-sim 約150＋pack-lewd 507＋late 217＋tone-base 58＝br 約930KB |
| R18版：起動から late まで（中核＋上の分） | br 1547KB | br 約1500KB |
| ui.js | 2458 行 | 1963 行（ui-norm.js 212・ui-cast-ops.js 157・late の ui-json.js 214 に分けた） |
| tone-fix.js／tone-fix-g2.js | 2625／2258 行 | 1634／1036 行（箱庭だけの台詞を tone-fix-<箱庭>.js 21 本へ） |

- 中核の br は R18版で −34%（かたまり）・−34%（目安）、全年齢版で −27%。どちらも 0.9MB の目安を大きく下回る（増えても余裕がある）。
- 起動から全部そろうまで（late まで）に読む量の合計はほぼ同じ（分け方を変えただけ）。画面が出るまでに読む量が減った。
- 結果は変わらない：regress（R18版 #r18・#safe・全年齢版。指紋 1・2）が変える前のビルドと全箱庭一致。chunk-audit 0 件、口調の最終の表（6 つの表の全行と、ゆるい引き方の結果）が変える前と一致、dict-regress の数字も同じ（4 章）。
- 決まりを変えた：箱庭を足しても共有のファイルが太らない書き方（5 章）と、中核の上限を build で判定して不合格にする仕組み。

---

## 1. 現状の分析（A）

### 1-1. 中核 146 本（R18版）の内訳と行き先

br はファイル単独の目安（build の「中核の内訳」と同じ数え方）。

| 種類 | 主なファイル（br の目安） | 起動して画面を出すのに要るか | 行き先 |
|---|---|---|---|
| R18 の場面の文・部品 | hate-sex-r18 40.3・novel-moan-tone 30.9・content-text-r18 11.9・content-events-r18 10.7 | 要らない（夜の場面を回すときだけ） | **pack-lewd** |
| 隠した箱庭「ふたりの日常」 | scenario-futari 34.7 | 要らない（#futari のときだけ一覧に出る） | **scen-futari**（目録に隠し箱庭の欄を足した） |
| シミュレーションの部品 | daily-kit 24.8・hate-love-more 19.2・hate-love 14.5・epilogue 13.9・obsess-kit 10.7・food 10.6・rel-bad-story 9.5・free-sex 8.2・omega-heat 8.0・mini 7.7・hate-kit 7.4・endings 6.7・feud-kit 6.0・solo-kit 5.7・ego-image 5.6・solo-rel-bad 4.3・omega-detective 4.1 ほか小さいもの | 要らない（回す・結末を出すときだけ） | **pack-sim**（新しいかたまり） |
| 口調の書き下ろしの表 | voice-override-solo 15.7・tone-new2-rows 13.7・tone-new2-r18 2.0 | 要らない（表を書くだけ） | **tone**（build が口調のデータに書き出す） |
| 画面のうち押したときだけ | portable 11.3（まるごと書き出し）・share-card 5.2（結果の画像）・egoquiz 2.9（診断）・ui.js の JSON の書き出し・読み込み（約 200 行） | 要らない | **late** |
| 起動・住人タブ・箱庭の一覧・設定の枠・結果の枠・骨組み | ui・view・ties・voice・tone-engine・attr・engine・tone-dict-builtin・special・tone-plus・ui-gear・ui-ties・tie-rel・view-map ほか | 要る | 中核に残す |

### 1-2. 中核に残したもの（移せなかった理由）

| ファイル | br | 残した理由 |
|---|---|---|
| events-common.js | 5.8 | HK.COMMON を中核の persona・tie-rel・attr・topics が読み込み時に読む |
| ero-kit.js | 5.8 | HK.Ero を中核の attr.js と load.js（口調のデータの M）が読む |
| emotion.js | 8.7 | emotion-r18.js（中核）が読み込み時に HK.Emo を読む |
| poly.js | 10.7 | events-common.js（中核）が読み込み時に HK.Poly を読む |
| solo-story-kit.js | 9.0 | attr-look・voice-fp（中核）が読み込み時に HK.Story.say を包む |
| dungeon-rich.js・dungeon-persona.js | 4.1・6.8 | persona-final・dungeon-view（中核）が読み込み時に HK.DG を読む |
| pos-ff.js・pos-fm.js・pos-nogen.js | 6.3・6.9・16.6 | HK.simulate を素の代入で包み、回したあとの文を見直す。pos-ff・pos-fm は後ろに回すと出られない部屋の指紋 1 が 1 件変わった。pos-nogen は指紋は同じだったが、audit-all で「体の語の印の持ち主がその場にいない」（性器なしの住人の文の見直しが、あとから足される夜の文に当たらない）と、全年齢モードの seg join（見直しが台詞の区分を付けたあとに回る）が出たので中核に戻した。**指紋が同じでも audit-all は要る**（8 章） |
| attr-meet.js・avoid-kit.js・goukon-fresh.js・pining-core.js・ero-scene.js | 9.5・2.4・0.5・0.3・1.2 | HK.simulate・HK.lewdEvent を素の代入で包む（包む順が変わる） |
| solo-locker-data.js | 12.8 | safe.js（中核）が読み込み時に HK.LOCKER を読む・ero-flavor-r18 が読み込み時に包む（2026-11-01 と同じ） |
| view-map.js | 11.5 | 結果の関係図。残した結果を late より前に開くと図が出ないままになる（結果タブは late のあとで描き直さない＝描き直すと Safari で位置がずれる） |
| save-folder.js | 6.7 | 起動時に保存先のフォルダの確認を始める（late だと自動の保存の始まりが遅れる） |
| ui-import.js | 3.6 | 住人タブの貼り付け欄。late にすると、読み終えたときに住人タブの途中に欄が増えて高さが変わる |
| tone-lines.js・voice-override.js | 5.9・8.8 | 表のほかにコード（HK.TL・V.overrideFor）を持つ |
| tone-*.js（口調の登録） | 計 約 70 | 住人タブの口調の選択・見本に要る |

### 1-3. 「箱庭を増やすと太るファイル」の洗い出し

| ファイル | 太り方 | 扱い |
|---|---|---|
| ui.js | 箱庭ごとの欄（オメガバースの案内・教室の担任・出られない部屋の部屋の名前）を `S.scenId === '…'` で直書き。ほかは共通の枠 | **直した**：`HK.ScenUI.add(<id>, { joinNote, envHead, envChange })` で、その箱庭のファイル（scenario-omega.js・scenario-room.js）と部品（ui-cast-teacher.js）から差し込む。ui.js には箱庭の id を書かない |
| view.js | 出られない部屋だけの表示（部屋の名前の見出しなど）が 3 か所 | 残した（結果の描き方の中で、外へ出すには view の差し込み口が要る。7 章） |
| tone-fix.js・tone-fix-g2.js | 箱庭の台詞の書き下ろしが 1 本にたまる（行の 4 割が 1 つの箱庭だけの台詞） | **直した**：箱庭だけの台詞を tone-fix-<箱庭>.js へ（2 章）。今後はそこに書く決まり |
| voice-override-rows*・-scenes*・tone-fix-g*・tone-brush* | 同じく箱庭の台詞がたまる（どれも 2000 行未満） | build が箱庭だけの行をその箱庭のかたまりに書き出すので、起動時・口調のかたまりは太らない（ソースの行数だけ）。2000 行に近づいたら同じやり方で分ける |
| event-catalog.js（build の生成物。pack-catalog） | 全箱庭の出来事を 1 本に出す（R18版 239KB・br 43KB。押したときだけ読む） | 起動時には効かない。箱庭ごとに分ける案は 7 章 |
| HK.COMMON などの共有の表 | 箱庭のかたまりが HK.addTo で足すので、表の中身は箱庭を選んだときに増える（ソースは箱庭のファイル） | そのまま（決まりどおり） |
| `_order.txt` の @need | 隠した箱庭（ふたりの日常）だけが中核で登録され @need を使っていた | 目録の hidden に移したので @need は無くなった |

---

## 2. 分割（C）

### 2-1. ui.js（2458 → 1963 行）

| 新しいファイル | かたまり | 中身（ui.js の元の場所） |
|---|---|---|
| ui-norm.js（212 行） | 中核（ui.js の直前） | 住人・保存データの整え（uid・newReg・mk・obj・str・okTone・okCall・fixEg・idList・migSexLock・migUserTone・normChar・normRefs・normState・migVamp。118〜317 行）。`HK.UINorm` |
| ui-cast-ops.js（157 行） | 中核（ui.js の直後） | 住人の複製（660〜718 行）・並び替えのドラッグと上下キー（2336〜2397 行）・画面の上へ／下へのボタン（2419〜2437 行）。`HK.UI.dupRes` |
| ui-json.js（214 行） | **late** | 住人の JSON の書き出し・読み込み（rosterJSON・exportJSON・importJSON。801〜998 行）。`HK.UIJson` |

- ui.js の中の状態と関数は `HK.UI._k`（S・save・renderCast・cleanTies・copy・inGrp・toast）で渡す。分けた部分の中身は元と同じ。
- late の部品を呼ぶところ（`rosterJSON`・`exportJSON`・`importJSON`・診断を開く）は `lateCall`：まだ届いていなければ「データを読み込んでいます…」を出して late を読み（失敗していれば読み直し）、届いたら続ける。読めなければ下に「読み込めませんでした（もう一度）」（箱庭のかたまりと同じ知らせ）。
- まるごと書き出し（portable.js）の窓：late の前に開いたら「データを読み込んでいます…」を出して late を読み、届いたら描き直す。読めなければ「もう一度」。
- 診断（egoquiz.js）は late。ui.js の結び付け（住人を足す・書き換える）は `bindQuiz` で、起動時と HK.onLate のときに渡す。

### 2-2. tone-fix.js・tone-fix-g2.js（箱庭ごと）

- build の振り分け（build-tone.js の②：元の台詞の断片が 1 つの箱庭のかたまりの文字列にだけある行）で「箱庭だけの行」と判定された行を、その箱庭のファイル tone-fix-<箱庭の id>.js に移した（両ビルドに同じファイル。r18 の印の中の行は印ごと移した）。
- 形は tone-fix.js と同じ。第1組＝tone-fix.js から（印なし）、第2組＝tone-fix-g2.js から（G の印つき：派生の口調には引き継がない）。`_order.txt` で tone-fix-g2.js のすぐ後ろに置く（両方の組が同じ鍵を書かないことは最終の表の一致で確かめた）。
- tone-fix.js：2625 → 1634 行（箱庭へ 988 行）。tone-fix-g2.js：2258 → 1036 行（箱庭へ 1223 行）。末尾の包み（V.overrideFor）は tone-fix.js に残した。

| ファイル | 第1組 | 第2組 | ファイル | 第1組 | 第2組 |
|---|---|---|---|---|---|
| tone-fix-jinro.js | 129 | 318 | tone-fix-island.js | 58 | 37 |
| tone-fix-whiteroom.js | 126 | 106 | tone-fix-rpg.js | 42 | 29 |
| tone-fix-jashin.js | 139 | 77 | tone-fix-locker.js | 23 | 17 |
| tone-fix-goukon.js | 82 | 76 | tone-fix-classroom.js | 26 | 14 |
| tone-fix-saimin.js | 41 | 110 | tone-fix-succubus.js | 0 | 46 |
| tone-fix-ship.js | 71 | 73 | tone-fix-hole.js | 0 | 16 |
| tone-fix-zombie.js | 71 | 51 | tone-fix-dungeon.js | 0 | 6 |
| tone-fix-omega.js | 57 | 65 | tone-fix-variety.js | 0 | 3 |
| tone-fix-yakata.js | 42 | 58 | tone-fix-trial.js | 0 | 2 |
| tone-fix-kaihen.js | 0 | 99 | tone-fix-br.js | 1 | 1 |
| tone-fix-massage.js | 80 | 19 | | | |

### 2-3. 確かめ（同じ行の集合）

- build に `HK_TONE_DUMP=<ファイル>` を足した（元の順で全部読んだときの 6 つの表の全行・tone-fix-loose のゆるい引き方の結果・行の行き先を書き出す）。変える前（main）と変えたあとで、R18版 66,513 行・ゆるい引き方 31,207 件、全年齢版 40,348 行・21,693 件が**すべて一致**（違い 0）。
- `dict-regress.js hakoniwa-full` の出力が変える前と同じ（全口調の「└3本」の数字も一致）。
- build の口調のデータの確かめ（読む順 3 とおり）も合格。

---

## 3. 振り分け（B）とコードの手直し

### 3-1. 新しいかたまり pack-sim と `@base`

- `@pack:sim`：動かすのに要るが、画面を出すのには要らない部品。画面が出たあと late より先に読む。
- `_order.txt` の `@base pack-sim`：core・口調のほかの全部のかたまり（late・族・箱庭・追加パックが頼るかたまり）の deps の先頭に自動で入る（build.js・event-catalog.js が読む）。全年齢版は族のかたまりの依存の付け方が箱庭ごとにまちまち（scen-massage・scen-saimin は deps なし）なので、書き忘れで抜けないようにした。
- 追加パックはかたまりの名前で頼る（pack-roomkit・pack-lewd・pack-rel）ので、その先で pack-sim を読む。**かたまりの名前は変えていない**（hakoniwa-packs/ は変えていない）。

### 3-2. 包み直しを HK.wrap に（結果は変えない）

- `HK.Ctx.prototype.say` の包み：avoid-kit.js・attr-look.js・attr-meet.js・voice-fp.js（両ビルド）と content-events-r18.js を `HK.wrap` にした。content-events-r18.js（pack-lewd へ移した）の包みが、元のファイルの順で中核の 4 本より内側に入る。
  書き換えだけ（移す前）でも、移したあとでも、指紋は全箱庭一致（pack-lewd・pack-rel の HK.wrap の包み fear-body-r18 などが voice-fp の内側に入る形になったが、結果は同じ）。
- content-events-r18.js の HK.simulate の包み（結末の「その後」の注記を足す）も HK.wrap にした（pack-lewd から素の代入で包むと、中核の voice-seg.js の名前の整えより外に回るため）。
- hate-sex-r18.js・content-text-r18.js は content-events-r18.js と一緒に pack-lewd へ。hate-love.js・hate-kit.js・endings.js は hate-sex-r18.js が中核でなくなったので pack-sim へ。

### 3-3. 隠した箱庭（ふたりの日常）

- build-manifest.js：`HK.SCENARIOS_HIDDEN` の箱庭も目録の `hidden` に載せる（scen と同じ形。要るかたまり chunks も）。
- load.js：URL の `#futari` か localStorage の `hakoniwa-futari=1` のときだけ、目録の hidden の箱庭を目録と一覧（出られない部屋のすぐ後ろ）に足す（前は scenario-futari.js が中核でしていた）。
- scenario-futari.js は `@scen:futari`（全年齢版にも scen-futari のかたまりを作った）。これで daily-kit.js も pack-sim へ移せた。

### 3-4. 小説調の喘ぎの表（novel-moan-tone.js）

- 口調のデータの N の行（HK.NovelMoan.T）を受け取る口が中核に要ったのを、load.js で「受け口がまだ無ければ取っておき、novel-moan-tone.js の終わり（と、かたまりを読み終えたとき）に入れる」（`HK.Load.flushTone`）にして pack-lewd へ移した。今は N の行は無いが、足したときに消えない。

### 3-5. 中核が外したものを読むところ

- 外したものを中核が読み込み時に読むところは chunk-audit の (2) で 0 件。押したときに読むところは `HK.X && …` のまま（share-card・EgoImage・Portable は前から確かめてあった）。
- 読み込み時の描画は今までどおり `HK.LATE_READY !== false` のときだけ（住人タブ・箱庭タブは HK.onLate が位置を保って描き直す）。
- （2026-11-05 追記）late に移したファイルの値は、起動時の描画では参照できない（`HK.X && …` で落ちはしないが、黙って欠ける）。全年齢版の箱庭タブの一覧の最後の「R-18版のご案内」は `HK.CONF.r18Url`（late の share-card.js）を読んでいたうえ、PC の上の一覧（ui-box-list.js）にはカードが無く、利用者から「有料版への導線が死んでいる」と報告があった。**案内カードの URL（`HK.CONF` の boothUrl・r18Url・noteUrl）は中核の `js/safe.js` に置く**（share-card.js の残りは late のまま）。起動時に出す導線の値を late に移すときは、中核に残すか、描き直しで必ず出ることを Playwright（遅延を入れて）で確かめる。

---

## 4. 点検

（最後の check.js の一覧は 8 章）

| 点検 | 結果 |
|---|---|
| regress（R18版 #r18・#safe・全年齢版。指紋 1・2） | 変える前（main のビルド）と 19・14・16 箱庭すべて一致 |
| chunk-audit（両ビルド） | 0 件 |
| 口調の最終の表（HK_TONE_DUMP） | R18版・全年齢版とも違い 0 |
| dict-regress | 変える前と同じ |

---

## 5. 決まりの変更（D）

### 5-1. CLAUDE.md に足した・変えた

- 「箱庭を増やしても一つのファイルが太らないようにする」：箱庭を足すときに触ってよい共有のファイルは `_order.txt`（行の追加）と箱庭の登録の表（`@chunk`・`@need`）だけ。画面・口調の書き下ろし・出来事・文はその箱庭のかたまりのファイルに書く。共有の表は `HK.addTo`、包み直しは `HK.wrap`、全箱庭への取り付けは `HK.Load.onChunk`、箱庭タブの部品は `HK.ScenUI.add`。箱庭だけの台詞の書き下ろしは `tone-fix-<箱庭>.js`。
- 中核の振り分けに pack-sim を足し、中核の上限を「build で判定して不合格」に変えた。

### 5-2. 無理のあった決まりと扱い

| 決まり・作り | 無理 | 扱い |
|---|---|---|
| 「中核の br の目安 0.9MB（上限 1MB）」を build が警告するだけ | 守られているかを誰も止めず、1050KB まで増えていた | build が中核のかたまりの br とファイルごとの目安の合計の両方を見て、どちらかが 900KB を超えたら不合格（終了コード 1。check.js の build も落ちる）。調べものの途中は `--no-core-limit` |
| 2000 行の上限は check.js の前置き（変えたファイルだけ）で見る | もともと超えていたファイルは警告だけで、超えたまま増え続けた | 今回で全部 2000 行以下になったので、今後は超えたら不合格になる（前置きのまま） |
| 「動かすのに要る部品」は中核か族のかたまりしか置き場が無い | 族に頼らない箱庭（一人用・全年齢版のマッサージなど）があるので、全箱庭の部品は中核に置くしかなかった | pack-sim と `@base` を足した |
| 隠した箱庭は中核で登録する | 目録に載らないので、本体を箱庭のかたまりに置けなかった | 目録に hidden を足した |
| tone の仕組みは「1 ファイル前提」か | 前提ではなかった（build は全部の tone のファイルを元の順で読んで最終の表を作る）。ファイルを分けても、元の位置に続けて置けば最終の表は同じ | 箱庭ごとのファイルに分け、HK_TONE_DUMP で一致を確かめる手順にした |
| event-catalog は全箱庭を 1 本に出す | 起動時には効かない（押したときだけ）が、箱庭を足すほど 1 本が太る | 今回は変えない。変更案は 7 章 |

---

## 6. Safari（iPhone）の 2 件が戻らないこと

まとめ役からの注意（`safari-scroll.md`・`mobile-parity.md` の 2 件を戻さない）への対応と確かめ。

- **読み込みの失敗と再試行**：新しいかたまり pack-sim は late・族・箱庭の依存なので、箱庭を選ぶ・動かすときの `HK.Load.ensure`（箱庭タブの自動のやり直し 1.5・4・10 秒、「もう一度」、不具合の記録の `load`）がそのまま効く。late に移した画面の部品（JSON の書き出し・読み込み・まるごと・診断）は、押したときに届いていなければ late を読み直し、読めなければ下に「この機能のデータを読み込めませんでした（もう一度）」、データの窓は「もう一度」を出す（画面が欠けたままにしない）。
- **描き直しで位置を動かさない**：late を読み終えたときの描き直しは今までどおり `HK.onLate` の `keepY`。住人タブ・箱庭タブの高さを後から変える部品は late に移していない（貼り付け欄の ui-import.js・関係図の view-map.js は中核に残した）。late の部品は窓の中か、押したときにだけ出るもの。
- **Safari 固有の判定**：index.html の小さな script（iOS 16.3 以前の案内・text-size-adjust）と、中核の先頭の load.js・load-order.js・ui-guard.js（content-visibility を WebKit で止める判定・`navigator.vendor`）は位置も順も変えていない。中核に新しく正規表現の後読みは足していない（中核に足したコードは ui-norm.js・ui-cast-ops.js（ui.js から移しただけ）と load.js の隠し箱庭・flushTone の数行）。

確かめ（Playwright・Chromium の iPhone エミュレーション 390×664・キャッシュ無し・毎回新しいプロファイル。http で br を配る。作業用 `stress.js`・`late.js`・`walk.js`）：
起動 → 箱庭タブ → 出られない部屋を最初に選ぶ → 動かす → 結果を指で上下にスクロール。

| 配信 | 回数 | 選べない | 結果が出ない | ページのエラー | 不具合の記録の scroll／jump／shrink |
|---|---|---|---|---|---|
| 遅い回線（往復 150ms・6Mbps）・切れなし | 20 | **0** | 0 | **0** | **0／0／0** |
| 往復 80ms・中核のほかのかたまり（late・pack-sim・pack-lewd・口調・箱庭）の応答を 3 割の確率で途中で切る（105 回切った） | 22 | **0** | 0 | 87（すべて途中で切った script の構文エラー＝わざと壊したもの） | **0／0／0** |

- 切る配信では、22 回のうち 11 回で late か口調のかたまりが自動のやり直しのあとも読めず（`HK.LATE_FAILED`）、不具合の記録に「かたまり ○○ を読み込めませんでした（broken）」が 41 件残ったが、箱庭はどの回も選べて動いた（動かすときに箱庭の依存＝pack-sim・pack-lewd を読み直す）。
- late を 6 秒遅らせて住人タブの途中（位置 600）にいると、late が届いて描き直したあとも位置 600 のまま。late を読めなくしてから JSON の書き出し・データの窓を押すと「データを読み込んでいます…」→「読み込めませんでした（もう一度）」、読めるようにして「もう一度」を押すと中身が出た。ページのエラー 0。
- 画面の通し（PC 1280・スマホ 390。R18版・全年齢版）：起動 → 住人 → 住人の設定の窓 → 箱庭 → 動かす → 結果 → JSON（late の部品）→ データの窓（まるごと）→ 不具合の記録で、ページのエラー 0・横のはみ出し 0。画像は作業用フォルダ `core/<full|zen>-<pc|sp>-<1〜8>.png`。
- 箱庭タブの差し込み（HK.ScenUI）：出られない部屋の部屋の名前・オメガバースの案内・教室の担任の選び・#futari のふたりの日常が出ることを確かめた。

---

## 7. 残った課題・変更案

1. **event-catalog を箱庭ごとに**：build が出来事の一覧を箱庭ごとのデータ（`catalog:<id>` の def）にし、その箱庭のかたまりの後ろか、箱庭ごとの小さなかたまり（catalog-<id>）に入れる。event-catalog-ui.js は押した箱庭の分だけ読む。catalog-check・check.js の「作り直されるもの」の表・パックの一覧（pk-<枠>-catalog）も合わせて直す。今は R18版で br 43KB（押したときだけ）なので急がない。
2. **view.js の出られない部屋だけの表示**（3 か所）：結果の描き方の差し込み口（`HK.ScenView.add(<id>, {...})` のような形）を作り、scenario-room.js に移す。
3. **中核に残した素の代入の包み**（pos-ff・pos-fm・pos-nogen・attr-meet・avoid-kit の simulate など）：HK.simulate の包みを全部 HK.wrap にそろえれば、元のファイルの順で並ぶので pack-sim へ移せる。今は中核の素の代入の包みと HK.wrap が混ざっていて、後から読むかたまりの包みの位置が「元の順」と少しずれる（今の結果はそのずれを含めて固まっている）。そろえるときは regress と audit-all の全部で確かめる。
4. **text-studio の書き下ろしの保存先**：画面から足した台詞は今も tone-fix.js（R18 は tone-fix-r18.js）に入る。build が箱庭だけの行を箱庭のかたまりに書き出すので配る量は太らないが、ソースは tone-fix.js に戻る。箱庭が分かるときは tone-fix-<箱庭>.js に入れるようにする。
5. **結果の画像の帯（share-card）**：late の前に残した結果を開くと、画像で保存する帯が出ない（開き直すと出る）。描き直すと Safari で位置がずれるので、届いたあとに描き足していない。

---

## 8. check.js の一覧

- `node hakoniwa-tools/check.js --pack=set-b`（c38b4109 の前、比べる相手 79cf52a1）：**すべて合格**（回した 31・キャッシュ 2・所要 1334 秒）。build 両方（中核の上限：R18版 566KB／698KB・全年齢版 513KB／628KB）・regress 3 通り一致・chunk-regress 両ビルド 0 件・chunk-audit 両ビルド 0 件・audit-all（既定＋sexgate・feud・group・state-hot・relcons・trio）すべて 0 件・tone-feel（3 箱庭）全口調 ◯・moan-tone 0 件・catalog-check 0 件・base-lint 増加 0・パック set-b の audit-all・tone-feel・moan-tone・trio-shape（3 部屋）すべて合格。
  - 1 回目は audit-all の pos V10（性器なしの住人の文に体の語の印）5 件・seg join 2 件と、パックの看病の部屋の V10 2 件で不合格だった。regress の指紋は一致していたが、pos-nogen.js を pack-sim に移したことで、回したあとの見直しの包みの位置が変わっていた。pos-nogen.js を中核に戻し、content-events-r18.js の simulate の包みを HK.wrap にして 0 件（同じ箱庭・同じ配役で変える前のビルドと件数が同じことも確かめた）。
- origin/main（3b3728eb：work/guard）を取り込んだあと（3667e6db）：`node hakoniwa-tools/check.js --since=c38b4109` **すべて合格**（build 両方・regress 3 通り・audit-all・catalog-check）。取り込んだ ui.js の 3 行（`HK.Guard.act()` 2 か所・`setTab('result', false, !!record)`）は分けたあとの ui.js に残っている。

