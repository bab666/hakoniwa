# 担当BH：箱庭ごとの分割読み込み — 調査と設計案

（2026-10-27。コードは変えていない・コミットしていない。試験はすべてスナップショット `BH/snap/`（現行のソース）と Playwright で回した。
試験のスクリプトは `/tmp/claude-0/-home-user-hakoniwa/cf27edc2-d635-51af-8f88-631fa3141f44/scratchpad/BH2/`、
結果のデータは `/tmp/claude-0/-home-user-hakoniwa/cf27edc2-d635-51af-8f88-631fa3141f44/scratchpad/BH/data/` にある）

---

## 0. 結論（先に要点）

1. **分割読み込みはできる。** 起動時に読む量を、R18版で 約3.5MB（br）→ 約0.75〜0.95MB（br）、JSのヒープを 26MB → 6〜7MB にできる（実測）。
   箱庭が100個増えても、起動時に増えるのは目録（1箱庭あたり約0.3KB・br）だけになる。今の作りのままだと、1箱庭あたり平均 約190KB（br）が起動時に足され、100個で +19MB（br）になる。
2. **ただし、今のコードは「読む順番」に結果が依存している。** 何も直さずに箱庭ごとに後から読むと、19箱庭のうち 11〜17 の結果（指紋）が変わった。原因は次の3つで、数は限られている。
   - 共通の関数の「包み直し」（`HK.simulate` を20ファイルが順に包む、`Ctx.prototype.say/kill`・`Story.say/state/step`・`buildPool`・`TieRel.refine` など）。包む順が読み込み順で変わる。
   - 共有の表への追加（`HK.MINI.<箱庭>`・`HK.COMMON`・`RoomAPI.EV` など）。足す順が変わると、重み付きの抽選の結果が変わる。
   - 全部の箱庭をなめて書き換える「取り付け役」（`lewd-unify.js`・`story-lewd.js`・`safe.js`・`lewd-mark.js`・`safe-room.js`。後から来た箱庭に効かない）。
3. **段階的に進めれば、指紋を一致させたまま移せる。** まず「族ごとのまとまり（恋愛系 rel・物語系 story・一人用 solo の3つ）」に分け、取り付け役をまとまりを読んだあとに当て直すようにすれば、
   R18版・全年齢版で、箱庭を1つだけ読んでも、どの順で読んでも、全箱庭の指紋が今と一致した（試験G：単独19＋乱順5通り、全年齢版 単独16＋乱順2通り）。
   全年齢モード（R18版の #safe）だけは、`safe.js` と `safe-room.js`・`dark-thick.js` の包む順を元の順に保つ仕組みが要る（下の `HK.wrap`）。
4. **箱庭ごとの細かい分割**（目標の「箱庭を選んだら、その箱庭だけ読む」）には、上の包み直し・表への追加・取り付け役を「元のファイルの順で並べ直す」小さな仕組み（`HK.wrap`・`HK.addTo`・`HK.Load.onScen`）が要る。直す箇所はかたまりをまたぐ包み直し 約50か所（27本）、表への追加のうち本当に順がきくもの（MINI・COMMON・RoomAPI.EV など 十数種）。
5. **口調の書き下ろし（約3.9MB）は口調ごとに分けられる。** 表の鍵が口調名で、使う口調（＋派生元）だけに絞っても全箱庭の指紋は変わらなかった（試験C2）。ただし書き下ろしの行の約4割は特定の箱庭の台詞なので、口調ごとではなく「箱庭のかたまり」に入れるほうが、箱庭を増やしたときに伸びない。
6. **推奨の読み込み方：端末で分ける。** スマホは「中核＋前回の箱庭」だけ、PC は起動後に裏で全部を先読み（ダウンロードだけ。実行は選んだとき）。設定で「すべて先読み／選んだ箱庭だけ」に切り替えられるようにする。Service Worker は最後（任意）。iOS の保存領域は7日で消えうるので、速さは HTTP キャッシュ（名前に内容のハッシュ＋immutable）で出す。

---

## 1. 調べたこと・分かったこと

### 1-1. 今の読み込み

| | R18版（hakoniwa-full） | 全年齢版（hakoniwa-zenrei） |
|---|---|---|
| ソース | 454本・19.55MB（コメント込み） | 309本・12.47MB |
| bundle-main（先に読む） | 356本・11.4MB（軽量化後）・**br 2.52MB** | 7.05MB・br 1.68MB |
| bundle-late（画面が出たあと） | 98本・6.1MB・br 0.96MB | 3.14MB・br 0.47MB |
| late で後回し済みのもの | 口調の書き下ろし（tone-fix*・voice-override-*）・一部の箱庭の厚い文・TIPS など | 同 |

- 読み込みは `index.html` の scripts:begin〜end（build.js が書く）で `bundle-main.js` を同期で読み、`bundle-late.js` を script 要素で後から足す。読み終わると `HK.LATE_READY = true` と `HK.onLate()`。
- 「動かす」で late が未読なら、`ui.js` の `pendingSim` に入れて読み終わりを待つ（この仕組みは分割後もそのまま使える）。
- **起動の実測**（Chromium・CPU 6倍遅延・file://・5回の中央値。BH2/measure.js）

| | 画面が使えるまで | 全部読み終わるまで | スクリプト実行 | JSヒープ |
|---|---|---|---|---|
| 今（main＋late） | 1,478ms | 2,237ms | 1,080ms | 26.3MB |
| 中核だけ（分け方3の core） | 1,008ms | 1,029ms | 275ms | 5.7MB |
| 中核だけ（族まとまり案の core） | 1,073ms | 1,109ms | 308ms | 7.0MB |

  中核を読んだあとに「まとまり」を足す時間（同条件）：恋愛系 265〜303ms、物語系 160〜184ms、一人用 201〜246ms、口調の書き下ろし全部 405〜457ms。
  ほかに、スクリプトの本文はブラウザの中で2バイト文字列として持たれる（日本語が多いため）。今は 約19MB、中核だけなら 約4MB。
- **通信**（br の大きさから計算）：画面が出る前に要る量は今 2.52MB → 中核 0.75〜0.95MB。
  4G（10Mbps）で 約2.0秒 → 約0.6〜0.8秒、弱い回線（1.6Mbps）で 約12.6秒 → 約3.8〜4.8秒。

### 1-2. 箱庭の登録と、目録に出す情報

- 登録の形は2通り：`scenarios-a.js`・`scenarios-b.js` の `add(s)`（合コン・クラスメイト・無人島、全年齢版はバトロワ・裁判も）と、各箱庭の本体ファイルの末尾の `HK.SCENARIOS.<id> = scen; HK.SCEN_ORDER.push/splice(...)`（scenario-room / scenario-omega / dungeon / solo-* / zombie-core / jashin / yakata / ship / scenario-rpg / scenario-jinro / scenario-futari）。
  並びは `SCEN_ORDER` への push・splice の順で決まり、`ui.js` の renderBox でさらに並べ替え（rpg・jinro をゾンビの後ろへ）、`safe.js` が全年齢モードで絞る（zenreiOnly・R18 の箱庭・R18 の出来事と設定）。
- **一覧のカードに要る情報**（ui.js renderBox・smin/smax・scenR18・scen-tags.js・tips.js scenBtn）：
  `id`・`name`・`kicker`・`desc`・`note`・`minCast`・`maxCast`・設定（env）のうちラベルに「R18」を含むものの名前・`CARD_DESC[id]`・`KICK_GENRE[id]`・`R18_PLOT[id]`（いずれも ui.js の中の表）・`HK.ScenTags.TABLE[id]`・TIPS の有無。
  ⚙設定の「箱庭の能力」（shared-stats.js）には、各箱庭の `stats`・`perFields` の id・ラベル・選択肢が要る（関数は要らない）。
- 選んだ箱庭の設定欄（箱庭タブの表）には `env`・`stats`・`perFields`（`offWhen` などの関数あり）・`actions`・`goals`・`check` が要る → これは箱庭のかたまりを読んでから出す。
- node の vm で全ファイルを読んで目録の情報を取り出せることを確かめた（BH/vmmeta.js：1.1秒。画面のファイルは飛ばす）。

### 1-3. 依存関係の棚卸し（分類）

ファイルごとの「その箱庭を回したときに使う」を、次の3つを合わせて決めた。
(a) 抜き取り試験：1本ずつ抜いて全箱庭を回し、指紋が変わった箱庭（R18 390本・全年齢 267本。前任の残りを完走）、
(b) 精密カバレッジ：箱庭ごとに、関数が呼ばれたファイル、
(c) 読み込み時の参照の実測：`window.HK` を Proxy にして、各ファイルが読み込み中に読み書きした `HK.X`（と `HK.SCENARIOS.<id>`）を記録（BH2/rtrace.js）。f が o の持ち物を読み込み時に使うなら、o は f の使い手にも要る、として広げた。

※前任の抜き取りは、指紋の口調の割り当てが `SCEN_ORDER` の並びで通し番号になっていたため、箱庭を登録するファイルを抜くと後ろの箱庭すべてが「変わった」と出ていた（見かけの依存）。並びに左右されない指紋（BH2/h2.js の指紋2：口調を元の並びの通し番号で決める）で取り直した（登録ファイル19本はそれぞれ自分の箱庭だけに効くと分かった）。

**分け方3（箱庭ごと）の結果**（BH/data/part3-full.json。大きさは build.js と同じ軽量化のあと、br は品質9）

| 層 | 本数 | 軽量化後 | gzip | br | 中身 |
|---|---|---|---|---|---|
| core（中核） | 113 | 3,035K | 941K | **753K** | エンジン・状態・画面・保存・履歴・口調の仕組みと辞書・R18の共通部品（ero-kit・lewd-words・moan-engine など）・多数の箱庭が使う部品 |
| tone（口調の書き下ろし） | 46 | 3,865K | 723K | 487K | tone-fix*・voice-override-*・tone-mixed-more*・ero-moan-tone・novel-moan-tone など |
| shared:rel（恋愛系の共有） | 30 | 981K | 276K | 228K | events-common・tie-*・rel-group・mini・fwb・unreq・heartbreak・grief-kit・dark-thick など |
| shared:rel+solo+story | 20 | 389K | 110K | 98K | content・mob・free-sex・attr-race など |
| shared:solo+story | 12 | 367K | 115K | 100K | dungeon 本体・solo-kit・story-lewd・same-story など |
| shared:rel+story / solo / story | 9 / 6 / 2 | 272K / 222K / 74K | | 68K / 61K / 19K | |
| scen:<箱庭>（19） | 1〜35 | 29K〜997K | | **8K〜258K** | 邪神村 258K・宇宙船 161K・部屋 150K・ゾンビ 131K・オメガ 133K・ロッカー 121K…人狼 35K・RPG 23K |
| tips（箱庭ごとの TIPS） | 4 | 129K | 38K | 35K | tips-scen-a〜d（鍵が箱庭の id なので箱庭ごとに切れる） |
| 合計 | 454 | 16,506K | 4,546K | 3,671K | 1本にまとめた今の br 3.48MB より約5%大きい（分けると圧縮が少し効きにくい） |

全年齢版（part3-zenrei.json）：core 91本・1,981K・br 521K、tone 25本・br 274K、shared:rel br 230K、箱庭 8K〜197K（br）、合計 br 2,279K。

**中核が大きくなっている原因**（箱庭のファイルが共通の部品を兼ねている。分ければ中核は 約2MB（軽量化後）まで下がる見込み）：
`omega-thick.js`（183K。`HK.TKC` を attr-r18 が使う）、`scenario-futari.js`（139K）、`scenario-room.js`（139K。`HK.RoomAPI` をほかが使う）、`hate-sex-r18.js`（108K）、`solo-saimin-thick.js`・`solo-saimin-data.js`（約200K）、`solo-r18-moan-data.js`（80K）、`ship-text.js`（51K）。
ほかに、箱庭のデータを別の族の箱庭が借りているもの：`jashin-gods.js`・`jashin-more.js`・`yakata-data.js`（rel+solo+story）、`dungeon.js`（一人用の箱庭が DG の部品を使う）。

**読み込み時に「先に要るものが無い」参照**（分け方3で後から読むと成り立たないもの。BH/data/rtrace-r18-viol.json）：100件。主なもの：
- 中核のファイルが共有部品の持ち物を読む：`persona.js`・`attr.js`→`COMMON`（events-common）、`mood-dial.js`→`GLOBAL_ENV`・`Content`、`scenarios-a.js`・`goukon-rel.js`→`buildPool`、`pining.js`→`MINI`・`addMini`、`attr-r18.js`→`ThickSex`・`ThickEro`・`R18M`・`TKC`。
- 共有部品が特定の箱庭の持ち物を読む：`dungeon.js`・`solo-kit.js`・`solo-massage.js`・`solo-hole.js`→`DG`（dungeon-rich）、`solo-flow.js`・`solo-erotic-more-a.js`→`KAIHEN`・`SUCCUBUS`、`yakata.js`→`DGK`（deathgame-kit）。
- 取り付け役が全箱庭を読む：`safe.js`・`lewd-unify.js`・`ui.js`・`ui-gear.js`・`attr-race-r18.js` が `HK.SCENARIOS.<id>` を読み込み時に読む（後から来た箱庭には効かない）。
- 複数の箱庭を直接書き換えるファイル：`drunk.js`（合コン・オメガ）。
**元は無かったものが有る**（後から読むと、読み込み時の判定が変わる）：5件（`HK.SAFE_ON` を読み込み時に見る tie-master-r18・mob-after・solo-zombie-raid・jashin-dark-thick、`HK.LABELS` の hate-love（実害なし：実行時に足し直す作り））。

### 1-4. 読み込み時の副作用（中核の表の書き換え）

ファイルを1本読むたびに `HK` の形（2段目まで。配列は長さ、関数は同一性）を取り、ほかのファイルが作った持ち物を書き換えた箇所を全部記録した（BH2/trace.js。R18版で 1,382件）。

| 書き換えの種類 | 主な先（書き換えるファイル数） | 後から読んでも成り立つか |
|---|---|---|
| 関数の包み直し | `HK.simulate`（20本）・`Voice.styleQuote`（7）・`Ctx.prototype.say`（6）・`Story.say`（6）・`buildPool`（5）・`Voice.processResult`（4）・`Ctx.prototype.kill`（4）・`Story.state`（4）・`TieRel.refine/pairText`（3）・`R18M.sex`（3） | **順が変わると結果が変わる**。包む順＝読み込み順なので、後から読んだものが外側になる。例：`room-same.js`（部屋）の kill の包みは、元は epilogue・attr の内側だが、後から読むと外側になる |
| 共有の表・配列への追加 | `HK.MINI.<箱庭>`（mini-goukon・mini-extra-a・mini-serifu・unreq・fwbcrush・heartbreak…が同じ配列に足す）・`HK.COMMON`（10本）・`RoomAPI.EV`（14本）・`OMEGA.*`・`DG.pool` | 中身は同じでも**並びが変わると抽選が変わる** |
| 箱庭の本体への追加 | `HK.SCENARIOS.<id>.events`（island-life・omega-passion など。`var isl = HK.SCENARIOS.island` で読み込み時に取る） | 箱庭本体より後に読めば成り立つ。複数の箱庭に足すファイル（drunk.js）は分けるか、`onScen` で待つ |
| 取り付け役（全箱庭をなめる） | `safe.js`（全年齢モードで箱庭・出来事・設定を絞る、simulate を包む）・`lewd-unify.js`（R18の描写の設定をそろえる）・`story-lewd.js`・`lewd-mark.js`・`safe-room.js`・`persona-final.js`・`ui-gear.js`・`attr-race-r18.js` | **後から来た箱庭には効かない** → 箱庭（まとまり）を読むたびに当てる形に直す |
| 名前の表 | `HK.LABELS`（omega・zombie・futari などが関係名を足す）・`HK.INCIDENTS.<箱庭>`・`HK.Endings.<箱庭>`・`HK.TIPS_SCEN.<箱庭>` | 実行時・表示時に引くので、箱庭を読んでいれば成り立つ（表示には箱庭のかたまりが要る） |
| 口調の登録 | `HK.TONES`・`TONE_FINISH`・`TONE_EXTRA`（中核の tone-*） | 中核に残す |

### 1-5. 口調の書き下ろし

- 表は `HK.Voice.TONE_FIX[口調][元の台詞]`・`HK.Voice.OVR[口調][元の台詞]`・`HK.Voice.TONE_FIX_G[口調]`・`HK.Ero.TONE_MOAN[口調]`・`HK.NovelMoan.T[口調]`。**鍵は口調名**なので口調ごとに切れる。
  ただし1本のファイルに複数の口調が混ざる（tone-fix-g1 は尊大・兄貴・ヤンキー…）、`if (T[key] == null)` の「先に入れたほうが勝つ」書き方がある → 分けるのはソースではなく、**ビルドで全部を実行した後の最終の表**を口調ごとに書き出すのが安全。
  tone-fix.js・tone-fix-loose.js にはコード（`overrideFor` の包み直し）もあるので、コードは中核に残し、表だけを包みにする。
- **試験C**：口調の書き下ろし46本（4.0MB）を、ほかを全部読んだ後ろに回しても、全箱庭の指紋は同じ（R18版・全年齢版）。
- **試験C2**：毎回の実行で、表を「住人の口調とその派生元（`HK.TONES[t].base/derive` をたどる）」だけに絞っても指紋は同じ（R18・全年齢モード・全年齢版。1回あたり平均 7.5口調だけ残る）。
- 必要な口調の決め方：住人ごとに `HK.toneOf(c)`（口調が空なら気質から自動＝`aniki`＋気質の9つ）・喘ぎの口調 `moanTone`・自作口調の元の口調、をたどる。**モブ・住人でない人物は気質から自動の口調**になるので、自動の10口調（aniki・proud・stern・tsun・gentle・devoted・cool・free・shy・polite）は「基本の口調」として常に読む。
- 大きさ（重複を除いた JSON の包み。BH2/tonepack2.js）：全部で 4.2MB・br 911K、**自動の10口調 877K・br 191K**、1口調の中央値 br 16K、最大は「敬語まじり」511K/91K。
- **書き下ろしの行がどの文から来ているか**（BH2/toneattr.js。元の台詞の断片をソースの文字列から探した）：大きさで **40% が1つの箱庭だけの台詞**、11% が1つの共有部品、26% が中核、残りは不明・複数。
  → 箱庭を足すと書き下ろしもその箱庭の分だけ増える。**箱庭だけの行は箱庭のかたまりに入れる**（全口調の分をまとめて。1箱庭 平均 約25K・br）、残りを口調ごとの包みにする、のが伸びない形。

### 1-6. 結果の再現性（試験のまとめ）

| 試験 | 内容 | 結果 |
|---|---|---|
| D（前任・再実行） | 新しいページでその箱庭だけ回す／同じページで2回目 | 一致（実行のあいだに残る状態はない。`HK.Ero.fresh` などは rng に付く1回限りの状態） |
| 乱数 | `Math.random` は rng が無いときの予備だけ（core.js の newSeed・ui-rand は画面用） | 読み込み順に依存しない |
| C・C2 | 口調の表を後回し・口調ごとに絞る | 一致 |
| E2（分け方3） | 中核だけで起動し、箱庭を選ぶたびにその分を script 要素で後から読む（逆順） | **17/19 が不一致**（RPG・人狼だけ一致） |
| F（静的・全部読む） | 「中核（元の順）→残り（元の順）」に並べ替え | 14 が不一致。中核のうち **4本**（omega-thick・persona-final・lewd-unify・lewd-mark）を元の位置関係のまま残りの側に置けば一致（BH2/greedyT.js） |
| G（分け方3） | 中核→箱庭のかたまり→最後に取り付け役 | 単独 16/19 一致（宇宙船・邪神村・館が不一致：omega-thick の位置）、乱順は 11〜12 が不一致（かたまりどうしの包み直し・表への追加の順） |
| **G（族まとまり案）** | 中核→rel／story／solo のまとまり（物語系は rel も読む。omega-thick は rel へ）→取り付け役 | **R18版：単独19・乱順5通り（seed 3,5,7,11,21）すべて一致。全年齢版：単独16・乱順2通り一致**（取り付け役＝story-lewd・safe・safe-room・lewd-unify・lewd-mark） |
| G（全年齢モード #safe） | 同上 | 合コン・部屋の2つだけ不一致。`safe-room.js`・`dark-thick.js` を `safe.js` より後ろ（元の順）に置けば一致（BH2/safeAfter.js）＝包む順の問題 |
| R18専用の分を全年齢モードで読まない | R18版の #safe で、全年齢版に無い150本（6.95MB）を読まない | 7箱庭が不一致 → 「全年齢モードでは R18 の分を読まない」は結果が変わる（今は R18 専用のファイルも全年齢モードの結果に効いている） |

→ **結論**：結果が変わる原因は「包む順」「表に足す順」「取り付け役の当てる時」の3つだけで、これを元のファイルの順に固定すれば、どの順で読んでも結果は今と同じになる、と言える（族まとまり案で、取り付け役を後から当てる形の近似として実証）。

### 1-7. 保存・履歴・点検道具への影響

- **履歴から開く**（ui.js histOpen）：結果は IndexedDB（history.js）にあり、表示は `V.render`。ただし表示の中で `HK.Endings.build(res)`（箱庭ごとの結末の組み立て。zombie・island・futari などは箱庭のファイルが登録）と `HK.DView`（一人用の表示）・`HK.Epilogue` を呼ぶ → **開く前にその箱庭のかたまりを読む**。口調の包みは要らない（文はできあがっている）。回し直し（lost・old・r18）は実行と同じく口調も要る。
- **セーブから開く**（saves.js → `HK.UIres.show`）：同じ。「同じ条件でもう一度」ボタンは `HK.SCENARIOS[inp.scenId]` で出し分けている → 目録で判定する。
- **共有カード**（share-card.js）・**書き出し**：`HK.SCENARIOS[id].name` は目録で足りる。
- **点検道具**：`tone-check/lib.js` の openBuild と `build/regress.js` は index.html を開いて `HK.LATE_READY !== false` を待つ。ほかの点検（collect・pos/orient/state-audit など12本）は lib.js を使う。text-studio の試し読みは `_order.txt` の順に1本ずつ読む（分割と無関係に動く）。
  → 読み込み器に「全部読む」の切り替え（`index.html#r18&all` か `?all=1`）を付け、lib.js と regress.js はそれを付けて開き、全部読み終わってから `LATE_READY = true` にする。点検は本物のかたまりを使う（別の全部入り bundle は作らない）。
  **regress.js の指紋は `SCEN_ORDER` の並びで口調を割り当てる**ので、並びが変わると見かけの差が出る → 並びは目録で固定する（下）。あわせて、試験で使った「指紋2」（並びに左右されない）を regress.js に足す。

### 1-8. R18版と全年齢版

- build.js の R18 の印の処理（strip）と性的な語の検査（guard）は**ファイル単位・行単位**なので、かたまりごとにそのまま行える。全年齢版の目録・かたまりは全年齢版のソースだけから作る（R18 専用の箱庭のかたまりは存在しない）。
- かたまりの名前・目録に R18 の語を出さない（全年齢版の guard の対象に目録も入れる）。
- R18版の全年齢モードでも、今は R18 専用ファイルが結果に効いている（上の試験）。R18版で「全年齢モードでは R18 の分を読まない」小分けは、結果が変わるので別の段（任意）にする。

---

## 2. 設計案

### 2-1. 層とかたまり

```
起動時 ─┬─ index.html（no-cache）……目録（manifest）を内蔵
        └─ core.<hash>.js ……………… エンジン・状態・画面・保存・履歴・口調の仕組みと辞書・R18の共通部品
                                        ＋読み込み器 HK.Load・順序を固定する HK.wrap／HK.addTo
起動直後（裏）── tone-base.<hash>.js … 自動の10口調＋共通の台詞の書き下ろし
                └─ 前回の箱庭のかたまり
選んだとき ─┬─ pack-<族>.<hash>.js … その族の共有部品（rel／story／solo。依存があれば先に）
            ├─ scen-<箱庭>.<hash>.js … 箱庭の本体・出来事・結末・R18の文・TIPS・その箱庭だけの台詞の書き下ろし（全口調ぶん）
            └─ tone-<口調>.<hash>.js … 住人の口調（基本の10以外）の共通の書き下ろし
```

| かたまり | 推定の大きさ（br） | 読む時 |
|---|---|---|
| core | R18 約750〜950K（共通部品を兼ねる箱庭のファイルを分ければ 約600K）／全年齢 約520〜690K | 起動 |
| tone-base | 約190K（共通の行だけにすればさらに小さい） | 起動直後（裏） |
| tone-<口調> | 中央値 約16K（最大 約90K） | 住人の口調で |
| pack-rel / pack-story / pack-solo | 族まとまり案：804K / 631K / 545K（箱庭ごとに分けた後の共有部分は 230K / 約120K / 約60K） | その族の箱庭を選んだとき |
| scen-<箱庭> | 8〜258K（＋その箱庭の台詞の書き下ろし 約25K） | 選んだとき |
| 目録 | 1箱庭あたり 約0.6KB（br 約0.3KB）。100箱庭で 約60KB（br 約15〜30KB） | index.html に内蔵 |

起動時の合計：今 3.48MB（br）→ **約0.75〜0.95MB（br）＋目録**。箱庭を100個足しても、起動時は目録の分（br 約30KB）しか増えない。

### 2-2. 目録（manifest）

**manifest.js を index.html に直接書き込む**（別ファイルにしない）：index.html は毎回たしかめる（no-cache）ので、目録とかたまりの版が必ずそろう。file:// で開く配布版でも fetch なしで読める。

```js
window.HK_MANIFEST = {
  v: 'c41f2a9b07',                 // 目録の版（全かたまりのハッシュから）
  api: 3,                          // 読み込み器の約束の版（かたまり側と合わなければ読み直しを促す）
  build: 'full',                   // full / zenrei
  core: 'js/c/core.3f9a1c2d4e.js',
  chunks: {                        // 名前 → 置き場所・大きさ・先に要るかたまり
    'pack-rel':    { src: 'js/c/pack-rel.8d2e41b0aa.js',    br: 804000, deps: [] },
    'pack-story':  { src: 'js/c/pack-story.27c9e0d311.js',  br: 631000, deps: ['pack-rel'] },
    'scen-goukon': { src: 'js/c/scen-goukon.1a2b3c4d5e.js', br: 46000,  deps: ['pack-rel'] },
    'tone-base':   { src: 'js/c/tone-base.9e8d7c6b5a.js',   br: 191000, deps: [] },
    'tone-noja':   { src: 'js/c/tone-noja.0f1e2d3c4b.js',   br: 69000,  deps: ['tone-base'] }
  },
  order: ['goukon', 'whiteroom', 'classroom', 'island', ...],   // 一覧の並び（SCEN_ORDER はここから作る）
  scen: {
    goukon: { name: '合コン', kicker: '恋愛・社交', card: '…', desc: '…', note: '…', min: 2, max: 12,
              tags: ['drink', 'mob', ...], r18env: ['…'], r18plot: 'お持ち帰りの夜', tips: true,
              stats: [{ id: 'drink', label: '酒の強さ' }], perFields: [], chunks: ['scen-goukon'] }
  },
  tones: { auto: ['aniki', 'proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'],
           pack: { noja: 'tone-noja', kansai: 'tone-kansai', ... } }
};
```

**build.js での作り方**
1. `_order.txt` の各行の後ろに、かたまりの名前を書けるようにする（並びはそのまま＝「全部読んだときの元の順」を壊さない）。
   `js/mini-goukon.js  @scen:goukon` ／ `js/tie-rel.js  @pack:rel` ／ 書かない行は core。`late` は廃止（core の後ろの tone-base などに置き換え）。
   分類の当たりは BH/data/part3-full.json・fam2-full.json（抜き取り・カバレッジ・読み込み時の参照から出した）を初期値にする。
2. ファイルごとに `HK.Load.def(<元の通し番号>, 'js/xx.js', function () { …中身… });` で包む（全455本が IIFE で、最上位の宣言・'use strict' は 0本と確かめた＝包んでも意味は変わらない）。
   かたまりの最後に `HK.Load.done('<名前>', '<ハッシュ>', <api>)`。
3. かたまりごとに、今と同じ strip（全年齢版）→ guard → 軽量化 → .gz/.br を作る。名前に内容のハッシュ（10桁）を入れ `js/c/<名前>.<hash>.js` に書く。前の版のかたまりは1世代残し、それより古いものを消す（開いたままの古いページが 404 にならないように）。
4. 目録のカード情報は、node の vm で core と各箱庭のかたまりを実行して `HK.SCENARIOS` から取り出す（BH/vmmeta.js で 1.1秒と確認）。そのために `CARD_DESC`・`KICK_GENRE`・`R18_PLOT`（ui.js）と `ScenTags.TABLE`（scen-tags.js）を、箱庭の定義の `card` 欄（か、中核の小さなデータファイル `scen-meta.js`）に移す。
5. 口調：vm で全部を実行した後の最終の表を、①箱庭だけの台詞の行 → その箱庭のかたまりへ、②残り → 口調ごとの包み（`HK.Load.tone('noja', {F: [[元, 書き下ろし, G印], ...], S: [同じ文の鍵...], O: {...}, M: {...}, N: {...}})`）として書き出す。
6. 検査：①どのファイルもどこかのかたまりに入っている、②中核のファイルが読み込み時に中核以外の持ち物を読まない、③共有のかたまりが箱庭のかたまりの持ち物を読まない、④同じ `HK.X` を2つのかたまりが作らない（持ち主は1つ）——を、rtrace と同じ実測（Proxy）を build の後の点検（`chunk-audit.js`）で回して止める。

### 2-3. 読み込み器（HK.Load）と、順序を固定する仕組み

```js
HK.Load = {
  ensure(scenId, opt) → Promise   // 箱庭（と opt.tones の口調）に要るかたまりを、deps の順に読む。読み済み・読み中は使い回す
  ensureTones(tones) → Promise    // 口調の閉包（base・derive・moanTone・自作口調の元・自動の10）を読む
  has(scenId) → bool
  prefetch(names)                 // 裏でダウンロードだけ（実行しない）
  onScen(id, fn) / onPack(name, fn) // 取り付け役：そのかたまりを読み終えたら、元のファイルの順で呼ぶ（読み済みなら今すぐ）
  gen                             // かたまりを読むたびに 1 増える（tone-fix-loose の索引の作り直しなど。今の LATE_READY の代わり）
  all() → Promise                 // 全部読む（点検用。#all）
};
HK.wrap(obj, name, makeFn)        // 包み直し。包む順を「包んだファイルの元の通し番号」で固定（新しい包みが来たら並べ直して組み直す）
HK.addTo(list, items)             // 共有の配列への追加。足したファイルの元の通し番号の順に並べる
```

- **def の実行**：かたまりが届いたら、その中の def を通し番号の順に実行し、続いてそのかたまりに当たる onPack/onScen を通し番号の順に呼ぶ。
- **包み直し**（R18版でかたまりをまたぐもの：分け方3で 50件/27本、族まとまり案で 27件/18本）は `HK.wrap` に書き換える。中核どうし・同じかたまりの中だけの包み直しは書き換えなくてよい（順は変わらない）。
- **表への追加**のうち順がきくもの（`MINI.<箱庭>`・`COMMON`・`RoomAPI.EV`・`buildPool` の候補・`Obsess.PACK` など）は `HK.addTo` に書き換える。
- **取り付け役**（`lewd-unify`・`story-lewd`・`safe`・`safe-room`・`lewd-mark`・`persona-final`・`ui-gear`・`attr-race-r18`）は、「全箱庭をなめる」部分を `HK.Load.onScen(id, …)` に分ける。
- **複数の箱庭を書き換えるファイル**（drunk.js）と、**共通部品を兼ねる箱庭のファイル**（omega-thick の TKC、scenario-room の RoomAPI、solo-saimin-data、scenario-futari、hate-sex-r18、dungeon の DG 部品）は、部品と箱庭本体に分ける。
- **`SCEN_ORDER`** は目録の `order` から中核が作る（箱庭のファイルの push・splice は「並びに無ければ足す」だけにする）。`ui.js` 317行の `if (!HK.SCENARIOS[S.scenId])` は目録で判定する。`HK.SCENARIOS[id]` は、読む前は目録から作った「仮の箱庭」（name・min・max など。`stub: true`）にしておき、かたまりを読んだら本物に置き換える。
- `HK.SAFE_ON` は中核の最初で決める（今は safe.js の位置で決まり、それより前のファイルは読み込み時に undefined を見ている。上の「元は無かったものが有る」5件）。

### 2-4. 読み込みの流れ

```
[index.html]──目録──▶[core]──▶ 住人タブ・箱庭の一覧（目録だけで描ける）
                         │
                         ├─(裏) tone-base ＋ 前回の箱庭 S.scenId のかたまり
                         │
       箱庭のカードを押す ─▶ ensure(id) ─▶ カードに「読み込み中 ○%」─▶ 箱庭タブの設定欄を描く
                         │
       「箱庭を動かす」 ─▶ ensure(id, 住人の口調) ─▶ 未読なら待つ（今の pendingSim と同じ「読み込んでいます…」）─▶ simulate
                         │
       履歴・セーブを開く ─▶ ensure(res.scenId) ─▶ 表示（回し直しなら口調も）
                         │
       失敗 ─▶ 1秒・3秒・9秒で3回まで再試行 ─▶ だめなら「読み込めませんでした［もう一度］」（カード・結果欄に）
```

| 段 | スマホ | PC |
|---|---|---|
| 起動 | index.html（目録入り）＋ core だけ（br 約0.75〜0.95MB） | 同じ |
| 画面が出たあと | tone-base と「前回の箱庭」のかたまりを裏で読む（実行まで）。それ以外は読まない | 同じ。さらに数秒あとから、残りの全部のかたまりを**ダウンロードだけ**先読み（低い優先度。実行は選んだとき） |
| 箱庭のカードを押す | そのかたまり（＋族の共有）を読む。カードと箱庭タブに進捗。読み終わるまで設定欄は仮表示 | 先読み済みなら実行だけ（CPU 6倍遅延で 160〜300ms、実機の PC なら 数十ms） |
| 住人の口調を変える | 口調の包みを読む（中央値 16K） | 先読み済み |
| 動かす | 未読なら待って動かす | ほぼ待たない |
| 履歴・セーブを開く | その箱庭のかたまりを読んでから表示 | 先読み済みならすぐ |
| オフライン | 読んだ箱庭だけ動く。ほかは「通信できないため読み込めません」 | 先読みが終わっていれば全部動く |
| ページを開いたまま新しい版が出た | 目録は開いた時のまま。古いかたまりは1世代残すので読める。それも無ければ「新しい版があります。再読み込みしてください」 | 同じ（開いたままの時間が長いので起きやすい） |

### 2-5. 画面の違いに応じた読み込み（選択肢と推奨）

| 案 | スマホ | PC | 良い点 | 悪い点 |
|---|---|---|---|---|
| A：どの端末も選んだ箱庭だけ | 選んだ箱庭だけ | 選んだ箱庭だけ | 通信量が最小。作りが一つ | PC でも箱庭を初めて選ぶたびに 0.2〜0.5秒待つ。オフラインに弱い |
| **B：端末で分ける（推奨）** | 選んだ箱庭＋前回の箱庭 | 起動後に裏で全部をダウンロードだけ先読み、実行は選んだとき | スマホは軽く、PC は今より速く・後退しない。PC はオフラインでも全部動く | 判定の誤り（タブレット・小さな窓の PC）がありうる → 設定で上書き |
| C：どの端末も裏で全部先読み | 全部 | 全部 | 起動は軽くなる。どこでも待たない | スマホの通信量は今と同じ（約3.5MB）。弱い回線・ギガ節約の人に重い |

- 判定（案B）：`matchMedia('(hover: hover) and (pointer: fine)').matches && innerWidth >= 900 && !(navigator.connection && navigator.connection.saveData)` なら PC 扱い。
- ⚙設定に「データの先読み：自動（おすすめ）／すべて先読み／選んだ箱庭だけ」を置く（localStorage に保存。全年齢版も同じ）。
- 先読みの方法：Chrome・Edge・Firefox は `<link rel="prefetch">`。**Safari は rel=prefetch を使えない**ので、https なら `fetch(src, { priority: 'low' })`（HTTP キャッシュに入る）、file:// では先読みしない（手元のファイルなので速い）。`requestIdleCallback` は Safari に無いので `setTimeout` で代える。
- 先読みは「1本ずつ順に」。画面の操作（箱庭を選ぶ）が来たら、そちらを先に読む（先読みの列を止めて割り込ませる）。

### 2-6. iOS Safari の制約と方針

| 制約 | 方針 |
|---|---|
| ITP：スクリプトで書く保存領域（IndexedDB・Cache API・Service Worker の登録）は、7日使わないと消されることがある（ホーム画面に追加したものは別） | 速さは **HTTP キャッシュ**で出す（名前に内容のハッシュ＋`Cache-Control: public, max-age=31536000, immutable`。BG の .htaccess・_headers の `bundle-*` の規則を `js/c/*` に広げる）。Cache API・SW に頼らない。履歴（IndexedDB）が消えうるのは今も同じ（変わらない） |
| Service Worker：https だけ（file:// 不可）。キャッシュも上の7日の対象 | 段④（任意）。オフラインで使いたい人・ホーム画面に追加した人向け。index.html はネット優先、かたまりは名前で固定なのでキャッシュ優先で安全 |
| メモリ：タブが重いと Safari がページを読み直す（古い機種ほど低い） | JSヒープ 26MB→6〜7MB、本文の文字列 約19MB→約4MB。読んだかたまりは捨てない（族1つで +1〜3MB） |
| JS の解析：iPhone の JavaScriptCore は PC の数分の一の速さ | 起動時の解析量を 約1/5 に。口調の包みはデータ（JSON に近い形）にして解析を軽く |
| 同時の通信：HTTP/1.1 の置き場所だと同じ宛先に6本まで | 1回の「選ぶ」で読むのは 2〜4本（族の共有・箱庭・口調）。口調は使う口調が多いときだけ数本 |
| 裏に回ったタブはタイマーが止まる | `visibilitychange` で先読み・再試行を再開 |
| `rel=prefetch`・`requestIdleCallback` が無い | 上の代わりの方法 |

---

## 3. 移行の段取り（指紋を一致させたまま）

各段の終わりに、regress（r18・safe・全年齢版）の指紋が段の前と一致すること、chunk-regress（下）が全部一致することを確かめてからコミットする。

| 段 | 中身 | 工数の目安（Opus 1人日） | 担当の分け方（ファイルの重なりなし） |
|---|---|---|---|
| ① 目録と起動の分離 | かたまりは今の main／late の2つのまま。build.js に目録・`HK.Load.def` 包み・ハッシュ名・1世代残しを入れ、`js/load.js`（中核の先頭）に読み込み器を作る。ui.js の run・histOpen・HK.UIres・renderBox を `HK.Load.ensure` 経由に。lib.js・regress.js に `#all`。regress に指紋2 | 1.5〜2 | 担当1：build.js（BG の軽量化が入った後）／担当2：js/load.js・ui.js・saves.js・history.js／担当3：tone-check/lib.js・build/regress.js・chunk-regress.js（新） |
| ② 族ごとのまとまり（rel・story・solo） | `_order.txt` に `@pack:` を付ける（BH/data/fam2-*.json が初期値）。取り付け役6本（lewd-unify・story-lewd・safe・safe-room・lewd-mark・dark-thick）を `onPack`／`HK.wrap` に。omega-thick を部品（TKC）と箱庭に分ける。`SCEN_ORDER` を目録から。カード情報を目録へ（CARD_DESC など） | 2〜3 | 担当1：取り付け役6本／担当2：omega-thick・scenario-*.js の登録部分・ui.js の表の移動・scen-tags.js／担当3：build.js の pack 対応と chunk-audit.js |
| ③ 箱庭ごと | `HK.wrap`・`HK.addTo`・`onScen` を中核に入れ、かたまりをまたぐ包み直し・表への追加を書き換え。部品を兼ねる箱庭のファイル（scenario-room の RoomAPI、solo-saimin-data、scenario-futari、hate-sex-r18、dungeon の DG、drunk.js、mini-extra-*、scenarios-a/b を箱庭ごとに）を分ける。tips-scen-a〜d をビルドで箱庭ごとに切る | 4〜6 | 担当0：中核の API（先に1日）／担当1：恋愛系の箱庭と rel の部品／担当2：物語系（宇宙船・邪神村・館・RPG・人狼・ダンジョン）／担当3：一人用（マッサージ・穴・常識改変・サキュバス・催眠・バラエティ・ロッカー）|
| ④ 口調ごと | ビルドで最終の表を書き出し、箱庭だけの行は箱庭のかたまりへ、残りを口調の包みへ。tone-base（自動の10口調）。読み込み器で口調の閉包を計算。tone-fix-loose の索引を `HK.Load.gen` で作り直す。住人タブの台詞の見本は、口調を選んだときに包みを読む | 2 | 担当1：build.js の書き出し／担当2：load.js・tone-fix-loose.js・ui の見本 |
| ⑤ Service Worker（任意） | https だけ。index.html はネット優先、`js/c/*` はキャッシュ優先、古い版の掃除 | 1 | 担当1人 |
| ⑥ R18版の全年齢モードで R18 の分を読まない（任意） | `scen-<id>-r18` に分ける。**結果が変わる**（R18版の #safe で7箱庭）ので、指紋の一致ではなく、orient／pos／state-audit・collect の 0件で受け入れる | 1〜2 | — |

順番の理由：①だけでも「目録で一覧を描き、未読なら待つ」流れができ、②で起動が 約3.5MB→約1MB（br）になる（族まとまり案は指紋一致を実証済み）。③④は箱庭が増えるほど効く。

---

## 4. 点検の計画

1. **regress.js**（r18・safe・全年齢版。`#all` で全部読む）：段の前と指紋が一致。指紋2（並びに左右されない）も出す。
2. **chunk-regress.js**（新。試験G・E2 を道具にしたもの）：版×モード（r18・safe・全年齢版）ごとに、
   (a) 単独：中核＋その箱庭のかたまりだけで、その箱庭の指紋2が `#all` と一致（全箱庭）、
   (b) 乱順：箱庭を選ぶ順を乱数で5通り変え、選ぶたびに本物の `HK.Load.ensure` で読み、すぐその箱庭の指紋2を取る。最後に全箱庭の指紋2を取り直す（あとから読んだ別の箱庭に汚されない）。
3. **chunk-audit.js**（新。rtrace と同じ Proxy の実測）：読み込み時の参照がかたまりの依存で満たされる・持ち主が1つ・全ファイルが分類済み。0件。
4. **collect.js**（R18版 r18／全年齢版）がエラーなく回る。**orient-audit・pos-audit（`--hot`・`--ff --hot`）・state-audit**（r18・safe・全年齢版）が 0件（中身は変わらないはずだが、読み込みが変わるので回す）。
5. **画面の往復試験（ui-rt）**：Playwright でスマホ幅 375px と PC 1280px、CPU 6倍遅延・回線は Slow 4G 相当（CDP の Network.emulateNetworkConditions。http で配る）で：
   起動→住人→箱庭を選ぶ→読み込み中に「動かす」（待ってから動く）→結果→履歴から開く→セーブから開く→書き出し・読み込み→「同じ条件でもう一度」。
   失敗の注入：かたまりの URL を落とす（再試行→知らせ）、途中でオフライン、目録の版違い（読み直しを促す）。save-check の試験を流用する。
6. **起動の計測**（BH2/measure.js を http 版に）：前後で、画面が使えるまで・全部読み終わるまで・スクリプト時間・JSヒープ・通信量。
   目安（CPU 6倍遅延）：中核 br ≤ 1MB、画面が使えるまで ≤ 1.1秒（今 1.48秒）、JSヒープ ≤ 10MB（今 26MB）、PC の先読み完了は今の late と同程度以下。
7. **全年齢版の検査**：かたまりごとの guard（今と同じ）＋目録の文字列も guard にかける。

---

## 5. 危険と対策

| 危険 | PC での出方と対策 | スマホでの出方と対策 |
|---|---|---|
| 読み込み順の副作用（包む順・表に足す順・取り付け役） | 先読みで読む順が日によって変わり、結果が微妙に変わる → `HK.wrap`・`HK.addTo`・`onScen` で元の順に固定。chunk-regress の乱順試験で毎回確かめる | 選ぶ順が人ごとに違う → 同じ。単独試験で「その箱庭だけ」でも同じ結果を保証 |
| HK の名前の衝突（2つのかたまりが同じ `HK.X` を作る・`HK.X = HK.X \|\| {}` の前提が崩れる） | chunk-audit で持ち主を1つに。build で止める | 同じ |
| 古いキャッシュとの混在 | 名前にハッシュ＋目録を index.html に内蔵＝混ざらない。開いたままのタブ（PC に多い）は前の版のかたまりを1世代残して救う。api 版が合わなければ「新しい版があります。再読み込みしてください」 | bfcache から数日前のページが戻ることがある → 同じ。404 なら読み直しを促す（住人・設定は localStorage にあるので消えない） |
| 通信の失敗・遅さ | ほぼ起きない。先読みの失敗は黙って再試行 | 弱い回線・途中で切れる → 3回まで再試行（1・3・9秒）、カードに「もう一度」。読み込み中も住人タブなどは使える |
| オフライン | 先読みが終わっていれば全部動く | 読んだ箱庭だけ。未読の箱庭は「通信できないため読み込めません」。SW（段⑤）で改善 |
| 待ち時間が増える（PC の後退） | 案B の先読み＋実行は選んだときだけ（数十ms）。先読みが間に合わなければ今の late と同じ待ち方 | 箱庭を初めて選ぶとき 0.2〜1秒（回線しだい）。カードを押した時点で読み始める（動かすまでに終わることが多い） |
| メモリ・解析 | 問題なし | 起動時の解析とヒープが約1/4〜1/5 に。族を全部読んでも今と同程度 |
| iOS の保存領域の消去 | — | HTTP キャッシュ頼み（7日の対象外）。消えても通信し直すだけ |
| file:// の配布版（R18版を手元で開く） | script 要素で読むので動く。fetch・SW は使わない。先読みしない | 同じ |
| 点検道具の前提が崩れる | `#all` で全部読んでから LATE_READY。lib.js・regress.js の2か所だけ直す | — |
| 全年齢版への R18 の文の漏れ | かたまりごとの strip・guard（今と同じ規則）＋目録も guard | 同じ |
| 目録と箱庭の本体の食い違い（カードの人数・名前） | 目録はビルドが箱庭の定義から作る。手で書かない | 同じ |
| 箱庭タブのちらつき（設定欄が後から出る） | 先読み済みならすぐ | 「読み込み中」の仮表示。高さを確保してずれないように |

---

## 6. 残っている問い・次に調べること

- 箱庭ごと（段③）の指紋一致は、`HK.wrap` などを入れてからでないと実証できない（族まとまり案までは実証済み）。段③の最初に、中核の API を入れた状態で chunk-regress を回して確かめる。
- `HK.MINI` などの「表に足す」のうち、どれが本当に抽選の順に効くかは、`HK.addTo` に置き換えながら chunk-regress で見る（BH/data/trace-r18.json に全候補がある）。
- 口調の包みの形（JSON に近いデータ）にしたときの JavaScriptCore での解析時間は、実機で測っていない。
- R18版の全年齢モードで R18 の分を読まない小分け（段⑥）は、結果が変わる理由（R18 専用ファイルが全年齢モードでも乱数や候補に効いている）を先に調べる。
- 作業ツリーで `hakoniwa-full/js/dungeon-thick.js` が一時的に構文エラーだった（ほかの担当の作業中と思われる。BH の試験はスナップショットで回したので影響なし）。

---

## 7. 試験の道具と結果の置き場所

- スクリプト（BH2）：`trace.js`（読み込み時の書き換え）・`rtrace.js`（読み込み時の参照）・`viol.js`（分け方で成り立たない参照）・`h2.js`（指紋2）・`abl2.js`（指紋2の抜き取り）・`part3.js`（分け方3）・`sizes.js`（かたまりの大きさ）・`expE2.js`・`expF.js`・`greedyT.js`・`expG.js`・`safeAfter.js`・`safeNoR18.js`・`measure.js`・`measure2.js`・`mkcore.js`・`mkpacks.js`・`tonepack.js`・`tonepack2.js`・`toneattr.js`・`mut.js`
- スクリプト（BH・前任）：`harness.js`（ソースを1本ずつ読む試験台）・`ablate.js`・`cover.js`・`expC.js`・`expC2.js`・`expD.js`・`vmmeta.js`・`static.js`
- データ（BH/data）：`part3-full.json`・`part3-zenrei.json`（箱庭ごとの分け方）、`fam2-full.json`・`fam2-zenrei.json`（族まとまり案）、`T-*.json`・`TU*.json`（取り付け役）、`base2.json`（指紋2の基準）、`rtrace-r18.json`・`rtrace-r18-viol.json`、`trace-r18.json`・`trace-sum.txt`、`sizes-*.json`（最後に測った分け方＝族まとまり案の大きさ）
- 抜き取りの全結果：BH/`ablate-r18.json`（390本）・`ablate-zenrei.json`（267本）、BH2/`abl2-r18.json`・`abl2-zenrei.json`

## 8. 更新履歴に書く利用者向けの箇条書き（案）

- （今回はコードを変えていないので、更新履歴への追記はなし）
- 実装したときの案：「起動を軽くしました。最初に読むデータを約4分の1にし、箱庭のデータは選んだときに読み込むようにしました（パソコンでは裏で先に読み込みます）。設定の『データの先読み』で切り替えられます」
