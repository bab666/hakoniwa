# 箱庭別 R18シーンのパターン数調査（合コン／出られない部屋／クラスメイト／無人島／媚薬ロッカー／エロバラエティ／マッサージ）

対象：`/home/user/hakoniwa/hakoniwa-full/js`（R18版）。比較のため `/home/user/hakoniwa/hakoniwa-zenrei`（全年齢版）の `index.html` と js も確認した。読み取りのみで、リポジトリには何も書いていない。

## 0. 数え方

- `acorn` で各 js を構文解析し、日本語を含む文字列リテラルをすべて拾った。`'a|b|c'`（`L()`・`add()`・`E()` などで `split('|')` されるもの）は要素数で数え、`'…|' + '…'` の連結は1本の文字列としてまとめてから分割した。どの配列・キーにある文かも記録した。スクリプトは `/tmp/claude-0/-home-user-hakoniwa/639f6a26-edfd-5897-8cd6-ace71cd500eb/scratchpad/p/an2.js`（集計）と `/tmp/claude-0/-home-user-hakoniwa/639f6a26-edfd-5897-8cd6-ace71cd500eb/scratchpad/p/sk.js`（文字列を伏せたコードの骨組み）。ファイルごとの出力は `/tmp/claude-0/-home-user-hakoniwa/639f6a26-edfd-5897-8cd6-ace71cd500eb/scratchpad/out/` に置いた。
- 「文」＝ランダムに選ばれる候補1本（1要素）。ラベル・why（理由表示）・UIの文言は数えていない。
- 共通部品（`thick-sex.js`=HK.ThickSex、`pos*.js`、`ero-kit.js`、`solo-r18-moan*.js`、`voice*.js`、`hate-kit`/`tone`系の `HK.TL`、`solo-kit.js`＋ダンジョンの `DG.*`）は数えず、どれを呼ぶかだけを書いた。組み合わせの計算で共通部品の掛け算が要るところは、参考として **TS** と書いた。値は次のとおり（`thick-sex.js` を数えたもの）。
  - TS(mf, 型と態度を固定) = BODY4 × FEEL5 × MOAN5 × FEEL_A5 × PLACE5 × REACT3 × CMOAN3 × CLIMAX4 = **90,000**（型が rough のときは BODY が5なので 112,500）
  - TS(fm) = 4×4×5×4×5×3×3×4 = **57,600**、TS(ff) = 4(BODY と CLIMAX は同じ番号で対になる)×4×5×4×5×3×3 = **14,400**
- **死んでいる文**：コードの流れ上、R18版では一度も選ばれない文。根拠になる分岐はその都度書いた。
- 軸の名前：態度（persona）は9種（proud/stern/tsun/gentle/devoted/cool/free/shy/polite）。型（style）は6種（rough/gentle/tease/playful/clinical/clumsy）。口調は `room-reluct.js` で18キー（15口調と派生）。
- 全年齢の区別は二通りある。(a) 全年齢版ビルドの `index.html` からファイルごと外されている、(b) 両方の版に読み込まれ、`HK.SAFE_ON`（`safe.js`。R18版の「全年齢モード」でも立つ）で止めたり差し替えたりする。

---

## 1. 合コン（goukon）

### 1-1. R18場面
R18の場面は **1種類だけ**：「お持ち帰りの夜」（`solo-goukon-night.js` の `HK.GoukonNight`）。
- 起きる条件：`scenarios-a.js` の finish で、惹かれが55以上の組の衝動の平均が0.55を超え、くじ（衝動×0.9）に当たったとき。
- 夜の種類 `kindOf` は関係で11種：stranger／tipsy／newCouple／lover／ex／friend／work／crush／rival／fwb／king（王様ゲームの続き）。
- 夜のあとの行き先 `nightOutcome` は5種：keep／lover／fwb／forget／unsure。

R18版での本文の組み立て（HK.ThickSex があるので、必ずこの経路を通る）：
`THICK_OPEN[種類]` → ThickSex（最中・感じる・喘ぎ・崩れ方・`PLACE.goukon`・果てる）→ `END[行き先]`

| 段階 | プール | 文の数 |
|---|---|---|
| 導入（関係ごと） | THICK_OPEN | 11種×2 = **22** |
| 最中・絶頂 | ThickSex（共通。合コン用の `PLACE.goukon` 5文を含む） | 共通部品 |
| 事後（行き先ごと） | END | 5種×5 = **25** |
| **固有の文で実際に使われるもの** | | **47** |

**死んでいる文 149本**（`if (TS && THICK_OPEN[k])` は R18 で常に真なので、旧い一段落版に戻らない）：N 55＋ADD 45（関係11種×9前後で「100通り」）、FF（女性どうし）44、AFTER 5。

全年齢版でだけ出る文（`scenarios-a.js`。`gn` が null のとき）：翌朝の一文4本と SOFT_END（行き先5種×2＝10本）。

その他（両方の版）：`fwbcrush.js` に合コン用の夜の文2本と小イベント2本。`drunk.js`（酔い方9種）と `goukon-talk.js` は性的な描写を含まないので対象外。

### 1-2. 分岐の軸

| 軸 | 固有の文 | 中身 |
|---|---|---|
| 性別の組 | 0 | mf／fm／ff の書き分けはすべて ThickSex が行う。合コンの女性どうし専用の FF 44本は死んでいる。ふたなりは `Pos.isF=false` の扱いで mf の文になる |
| 態度・口調 | 0 | ThickSex の MOAN／CMOAN／REACT（9態度）だけ |
| 関係 | 22 | THICK_OPEN（11種×2） |
| 嗜虐 | 0 | ThickSex の `T.hard`。種類が lover のときは `jealous: true` を渡すので、首を押さえる書き方がありうる |
| 濃さ | なし | 描写の濃さの設定がない。R18版では常に厚い版 |
| 行き先 | 25 | END（5×5） |

### 1-3. 理論上のパターン数
- 固有部分：（関係, 行き先）の1組あたり THICK_OPEN 2 × END 5 = **10通り**。55組すべてで **550通り**。
- 共通部品を含めた1組あたり（型と態度を固定）：mf は 2 × TS 90,000 × 5 = **900,000**、fm は 576,000、ff は 144,000。

### 1-4. 版の区別
`solo-goukon-night.js` は R18版だけに読み込まれる。全年齢版と全年齢モードでは「その先のことは、二人しか知らない。」に、翌朝の一文と SOFT_END が続く。

### 1-5. 薄い箇所
- 導入が関係ごとに**2文しかない**。11種×2＝22本で、そのぶんの差は全部 ThickSex に頼っている。
- 女性どうし・女性が攻めのとき、合コン固有の文が一本もない（せっかくの FF 44本が死んでいる）。
- 事後は行き先ごとの5本を全性別で共有している。
- 書いた文の3/4（149本／196本）が使われていない。

---

## 2. 出られない部屋（whiteroom）

### 2-1. R18場面の種類（R18版で実際に通る経路）

| # | 場面 | 起きる条件 | 固有の文（段階別） |
|---|---|---|---|
| 1 | 条件「エッチ」の初回・望んで（will） | `doact`。willing が通る | 導入 ROOM[型] 6×4=24 ＋ T.OPEN（共通）→ ThickSex（`PLACE.room`）→ 事後 AFTER.will 3 |
| 2 | 初回・仕方なく（des） | `doact`。desperate だけ通る | 前置き ACT_TEXT.h.des 3 ＋ ROOM 24 → ThickSex → AFTER.des 3（des でドライな人の型は clinical） |
| 3 | 二回目以降（repeat） | 回数が2以上の条件 | REPEAT 4 → ThickSex → AFTER.repeat 2 |
| 4 | 木箱の道具（toolText） | 「木箱あり」でくじに当たる | TOOLS 6種・計11（目隠し・ローション・手錠・玩具・ロープ・媚薬オイル）。ff は FF_TOY 3（50%）→ ThickSex → AFTER（will／des） |
| 5 | 媚薬が回りきる（aphro_heat） | 媚薬の量が閾値を超え、相手も惹かれている | きっかけ4 → ROOM ＋ APHRO 4 → ThickSex → AFTER.aphro 2 |
| 5' | 媚薬で押し倒す（同意なし） | wild>1・heat>4 | 押し倒す3／止められる5（攻め指定の相手用1・第三者が止める1・本人が拒む2・他1）／熱に浮かされるだけ4 |
| 6 | スピード型（縛る） | `speedy`≥0.38 で攻めに回れる側。条件にエッチがある | 縛る4 → SPEED 3 → ThickSex → AFTER.speed 2 → 解く2。かわされる3 |
| 7 | 受け×受けの押し付け合い | 自分で受けを選んだ二人の初回 | CLASH_BOTTOM 7（cp2・cold1・fc2・np1・ac1） |
| 8 | 恋人でも渋る（room-reluct） | 恋人どうしで場所を嫌がる | 渋る REFUSE 18口調×3=54、見られている WATCHED 3、説得 COAX 6型×3=18、届いた MOVED 4／届かない BOUNCE 4、折れる YIELD 18×3=54 → **137** |
| 9 | 嫉妬で取り戻す（`solo-room-jealous.js`。R18のみ） | 「一人だけ」と決めた相手が別の人と寝た・キスした | 詰め寄る（3文体×6=18）、返し（3文体×3種×2=18）、抱く CLAIM_SEX 4／受け側用 2 → `LW.scene`（will か repeat。jealous）、事後 3文体×3=9、気が変わる 9＋見せつける 9、黙って傷つく 2、きっかけ 3＋2 → **76** |
| 10 | 三人で（room-trio＋trio-lines） | 但し書きを知っていて、三角関係／誘う／ノリ／時間切れ／打ち解け | 下の表 |

三人の場面（`room-trio-lines.js` 90本＋`room-trio.js` の使われる文）：

| 段階 | プール | 文の数 |
|---|---|---|
| きっかけ | OPEN（hub3・invite3・free2・late2・warm2） | 12 |
| 前戯 | WARM 8種 | 15 |
| 本番（形ごと） | MAIN sandwich5／twoOne5／oneTwo5／ring3 | 18 |
| 本番（女性どうしの組を含む） | MAIN_FF 4形×2 ＋ TOY_FF 4形×1 | 12 |
| 見所 | HL 18種 | 32 |
| 絶頂／余韻／二回目の入り | CLIMAX 4／AFTER 5／ROUND2 4 | 13 |
| 説得・拒否・心変わり・発見 | 説得12・拒否3・心変わり4・FIND 3＋反応10 | 32 |
| 部屋を出たあと | BOND_TEXT（marry3・secret2・jealous2・forget2） | 9 |

**死んでいる文 401本**（両方の版）：
- `room-thick.js` が R18版の `HK.RoomLewd.scene` を will／des／aphro／repeat／speed のすべてで横取りし、ThickSex を使う。全年齢では `safe-room.js` が scene を丸ごと差し替える。
- その結果、`room-lewd.js` の場面の文145本（OPEN 18／BODY 18／CLIMAX 18／AFTER 8／SPECIAL 21／react 12／FF_系 40／その場の文 10）が使われない。
- 同じく `room-lewd-more.js` 71本、`room-lewd-x.js` 166本（SPECIAL 追加21、REACT_X 12、NORI 6 を含む）も使われない。
- `scenario-room.js` の ACT_TEXT.h.will 5本も使われない（`isH` なら `LW.scene` だけを使う）。
- `room-trio.js` の SEX 11本と CLIMAX3 3本も使われない（`HK.TrioLines` があるときは使わない）。

**R18版で使われる固有の文：約452本**（内訳：room-thick 50、scenario-room の性的な部分 46、jealous 76、reluct 137、trio-lines 90、trio 53）。

### 2-2. 分岐の軸

| 軸 | 固有の文 |
|---|---|
| 性別の組 | 固有は FF_TOY 3、三人の MAIN_FF＋TOY_FF 12。それ以外は ThickSex の mf／fm／ff と `pos-ff`／`pos-fm` の fix（共通）。ふたなりの専用文はない |
| 型（リードする側の気質6種） | ROOM 24（4×6）。T.OPEN／BODY／CLIMAX は共通 |
| 口調 | reluct の18口調で108（REFUSE＋YIELD）。jealous の3文体（rough／soft／polite）で54（詰め寄る・返し・事後）＋気が変わる・見せつける18。トリオは `HK.Voice` の edge／climax（共通） |
| 態度（9） | 0（ThickSex と Voice が担う） |
| 関係 | 敵視の強引さ（`HK.HateKit.forcer` → 型が rough になり、`HK.TL` の H_ROUGH の一文が付く）。恋人の渋り（reluct）。嫉妬（jealous）。どれも条件の分岐で、関係ごとの導入文はない |
| 嗜虐 | ThickSex の `hard`。jealous で嫉妬した本人が攻めのときだけ JEALOUS（首） |
| 濃さ | 設定なし。R18版は常に厚い版 |
| 3P | 4形 × 5きっかけ。見所18種（kinds／shapes／who で絞る） |
| 媚薬・道具・拘束 | APHRO 4、TOOLS 11、SPEED 3、縛る4 |

### 2-3. 理論上のパターン数（mf、型と態度を固定、扉が開く場合）

| 場面 | 固有部分 | 共通部品を含めた数 |
|---|---|---|
| will | ROOM4 × AFTER3 = 12 | ×T.OPEN 4×TS → 4,320,000 |
| des | 3×4×3 = 36 | 12,960,000 |
| aphro | きっかけ4×ROOM4×APHRO4×AFTER2 = 128 | 46,080,000 |
| repeat | 4×2 = 8 | 720,000 |
| speed | 4×3×2 = 24 | 2,160,000 |
| 道具 | TOOLS 11 × AFTER 3 | 2,970,000 |
| 嫉妬（claim） | 3×6×2×4×3 = 432（1文体・1返しあたり） | ×場面 |
| 渋る | REFUSE3×COAX3×(MOVED／BOUNCE)4×YIELD3 = 108（1口調×1型あたり）。全体は 18口調×6型 | — |
| 三人（初回・上限の目安） | OPEN3×WARM15×MAIN5×HL32×CLIMAX4×AFTER(5＋なし)6 = 172,800（kinds／shapes／recv の絞り込み前） | — |

### 2-4. 版の区別
- R18版だけ：`room-thick.js`、`solo-room-jealous.js`（ファイルとして外れるうえ、`HK.SAFE_ON` でも止まる）。
- 両方の版：`room-lewd*.js`（ただし場面の文はどちらの版でも死んでいる）、`room-reluct.js`、`room-trio*.js`（全年齢では `safe-room.js` が HK.simulate の結果を `HK.SafeText` で和らげる）。
- 全年齢だけで使われる文：`safe-room.js` の NEAR（型5×3）、MID 5、FADE 4、AFTER 9、NEAR_FM、MID_FM。

### 2-5. 薄い箇所
- 事後 AFTER が aphro／repeat／speed で各**2文**しかない。will／des も3文。
- 女性どうしに固有の文がほとんどない（FF_TOY 3と三人の FF 12だけ）。room-lewd の FF_* 40本は死んでいる。
- 三人の場面の女性どうしの本番は形ごとに2文、TOY_FF は**1文ずつ**。
- 受け×受けの CLASH が cold／np／ac で**1文ずつ**。
- 死んだ文が401本あり、使われている固有の文（約452本）とほぼ同じ量になっている。room-lewd 系（OPEN／BODY／CLIMAX が型ごと12本、SPECIAL 42本、NORI 12本）は、room-thick の段落に移すか削るかの整理が必要。

---

## 3. クラスメイト（classroom）

- **R18場面はない**（0種、0本）。`classroom-life.js`、`classroom-teacher.js`、`mini-classroom.js`、`mini-extra-a.js`（classroom の部分）、`scenarios-a.js`（classroom の部分）を見た。
  - R18の印（r18）の出来事も、R18 と書かれた設定もない。
  - 性的な語で検索して当たったのは「舌を出して」の1件だけだった。
  - `fwb.js` は `NO = ['classroom','br']` でクラスメイトを明示的に除いている。
- 小イベント `mini-classroom.js` は77件・462本、すべて全年齢。
- 基準を均すときは「R18なし（全年齢の箱庭）」として扱うのが妥当。

---

## 4. 無人島（island）

### 4-1. R18場面
R18の場面は **1種類だけ**：「島の夜」`ir18_night`。`island-*.js` や `scenarios-b.js` ではなく、`solo-rel-r18.js`（R18版のみ）が島の箱庭に追加している。
- 設定 `ilewd`：描かない／ほのめかす（既定）／描写する。
- 起きる条件：恋愛できる組で、関係ごとに惹かれの閾値がある。1組あたり2回まで、6ステップの間隔を空ける。
- 夜の種類は5種：lock（想い続けた相手）／mentor（師弟）／fwb／lover／new。

| 段階 | プール | 文の数 |
|---|---|---|
| 導入（種類ごと） | ask lover3／fwb2／lock2／mentor2／new2 | 11 |
| ほのめかす | fade | 4 |
| 描写する（mf） | fore3・insert3・mid3・end3 | 12 |
| 描写する（ff） | fore は共通、ffHigh insert3・mid3・end3 | 9 |
| 兄貴・姉貴分の口調の一言（60%） | ANIKI（ゾンビの街と共用） | 3 |
| 翌朝（種類ごと） | after 5種×2 | 10 |
| **合計** | | **46（＋ANIKI 3）** |

`island-*.js`（cook／corpse／escape／hazard／life／rel／sea／stay）、`scenarios-b.js`、`mini-island.js`（56件・336本）、`mini-extra-b.js` には R18 の文がない。`fwbcrush.js` に島の夜の文が2本ある（全年齢、ぼかした書き方）。

### 4-2. 分岐の軸
- 性別：mf と ff だけ。**fm の分岐がない**。`order()` で攻めになった女性 {x} に、「{x}はゆっくりと{y}の中に沈んだ」「{x}は{y}の奥で果て」が当たりうる（`HK.FM` による直しも呼んでいない）。ふたなりは mf の扱い。
- 態度・型：0。口調は aniki だけ3文。
- 関係：導入と翌朝が5種。
- 嗜虐：0。
- 濃さ：off／fade／high の3段階。厚い版（ThickSex）はない。

### 4-3. 理論上のパターン数
- （種類ごとの導入×翌朝）の組み合わせ：lover 3×2、ほかは 2×2 → 合計22。
- 描写する mf：22 × (3×3×3×3=81) = **1,782**。ff も同じく1,782。
- ほのめかす：22 × 4 = **88**。
- 攻めが aniki の口調なら、上の数の60%が ×3 の言い回しに分かれる。

### 4-4. 版の区別
R18版だけ。`solo-rel-r18.js` は全年齢版で読み込まれず、全年齢モードでは `safe.js` が `e.r18` の出来事と `ilewd` の設定を外す。

### 4-5. 薄い箇所
- 描写の各段階が**3文ずつ**で、導入は種類ごとに2文。
- 態度・型・嗜虐の分岐がまったくない。
- fm の文がない（性別の向きが合わなくなるおそれがある）。
- 厚い版がない。合コン・部屋・ロッカーの ThickSex にあたるものがない。

---

## 5. 媚薬ロッカー（locker）

箱庭そのものが R18（kicker「2人・R18」）。全年齢では `safe.js` が最大の段階を2（抱きしめる）にし、文を差し替え、描写の濃さを「ぼかす」に固定して残す。ファイルは `solo-locker.js`／`-data`／`-more`／`-bed`（両方の版）と `locker-thick.js`（R18版だけ）。

### 5-1. 場面の種類と文の数（data＋more の追加分を合算）

ロッカーの中で手を出す（段階 touch→kiss→grope→oral→sex）：

| 段階 | mf | ff | fm |
|---|---|---|---|
| touch | t9＋拘束5 = 14 | — | — |
| kiss | 9＋5 = 14 | — | — |
| grope | 9＋3 = 12 | — | — |
| oral | 6＋3 = 9 | FF_ACT 6 | — |
| sex | t9／受けが跨る ride9／拘束 bound3／boundTop3＋自分から跨る nori5＋拘束2 = 31 | FF_ACT 9 | FM_ACT 6 |
| 繋がる前の焦らし | TEASE 9 | FF tease 5 | FM tease 3 |

相手の反応：
- 応じる ACCEPT 9／嗜める REFUSE 9／流される PASSIVE 6。
- 台詞は態度ごと：ACCEPT_SAY 9×6 = 54、REFUSE_SAY 9×6 = 54。
- そそのかす TEMPT 5、奪う TAKE 7、ヘイトでの導入 3。

繋がったままの進行 CONT 69本（any 16／ins 16／fm 16／ff 16／ぼかす5）。段階は move／hush／edge／climax／after／again／linger。

攻めの声 TOPV 90本：moan（ins／fm／ff × 9態度 × 2）54、edge 18、hush 18。

関係ごと REL：first 9×2＝18、after 9×2＝18。

特殊な役・状況：二人とも拘束で生殺し NAMA 12、片方だけ ONE 18、主従 SERVANT 19、セフレで片想い FC 15、攻め×攻め CLASH 34、心に決めた人 LOCKED 4、自分から閉じ込めた（思惑）PLOT 42。

ぼかす：FADE 4、KISS_MID 2。

脱出後のベッド（`LK.bed`）：

| 段階 | 文の数 |
|---|---|
| 誘い方 | INVITE 5種・13 ＋ noriInvite 3 ＋ BED.timeout 6 |
| 脱がせる | strip 9（start 9 はロッカー内の導入） |
| 前戯 | R18版 mf：locker-thick の FORE 3。ff：BED.fore 9 |
| 挿入 | R18版 mf：ThickSex BODY＋FEEL＋`PLACE.locker`。ff：FF.insert 4 |
| 雰囲気 | rough 6／sweet 6、FM rough3・sweet3、FF rough4 |
| 最中の展開（2つ選ぶ） | MID 13種・27本（中出しをせがむ・跨る・寸止め・ロッカーに押しつけて・鏡・言葉責め・名前・着衣・抜かず・声を我慢・残り香・主導権の取り合い（リバ同士のみ）など）。FF.mid 21、FM.mid 20 |
| 中出し | NAKA_SAY 9×2 = 18、NAKA_ANS 10、FM nakaSay 18＋nakaEnd 2＋endNaka 2 |
| 体位を変える | R18版 mf：locker-thick の POS 3／POS_FM 3。ff：FF.pos 5 |
| 絶頂 | R18版 mf：ThickSex CLIMAX。リバ同士とぼかすは BED.climax 9。ff：FF.climax 4、FM 3 |
| 結び | END 6種×2 = 12、FF shower 2、FM shower 2 |
| 関係ごとの余韻 | END_REL 16 |
| fm の言い換え | FM_SAFE 3 |

結末（脱出のしかた）：AFTER 7種 計43＋性行為ありの版 7 = **50**。

脱出の仕掛け・環境（性的でない）：INTRO 9、SPEAKER 9、BIND 18、GIMMICK 6種 108＋名前4、CUFF1 16、QUIET 15、KISS_OK 6、OUTSIDE 9、GAS 24、SURGE 12、CALM 8 → **238**。

**合計**：性的な場面の固有の文 **約886本**。ほかに結末50、仕掛け・環境238。

**死んでいる文 18本**：BED.insert 9、BED.pos 9。R18版の mf（描写がほどほど／濃いめ）では `locker-thick.js` が差し替え、ff は FF.insert／pos を使い、ぼかすは使わない。

### 5-2. 分岐の軸

| 軸 | 内容 |
|---|---|
| 性別の組 | mf と、ff 専用（FF_ACT 20、CONT ff 16、TOPV ff 18、ベッド FF 40）、fm 専用（FM_ACT 9、CONT fm 16、TOPV fm 18、ベッド FM 53＋locker-thick の fm 6）。ふたなりは mf の扱い |
| 態度（9） | ACCEPT_SAY と REFUSE_SAY 108、TOPV 90、NAKA_SAY と FM nakaSay 36、NAKA_ANS 10 |
| 関係（9種：恋人・セフレ・主従・片想い・知り合い・友達以上・険悪・元恋人・初対面） | REL 36、END_REL 16、主従 19、片想い15、PLOT 42、CLASH 34 |
| 拘束（両方／片方／なし） | 各段階の bound／boundTop、NAMA、ONE、BIND |
| 濃さ | low／mid／high。low は FADE・CONT.low・ベッドを暗転。mid／high は厚い版 |
| 嗜虐 | ThickSex の `T.hard`（リバ同士と fm では使わない） |
| 3P | なし（2人固定） |

### 5-3. 理論上のパターン数（例）
- ロッカー内で繋がり始める場面（mf、拘束なし、攻め、1態度）：TEASE 9 × ACT.sex.t 9 × ACCEPT 9 × ACCEPT_SAY 6 = **4,374**。
- ベッドの固有部分（mf、R18版の厚い版）：INVITE 3 × strip 9 × FORE 3 × 雰囲気6 × MID（2つの順列 27×26） × POS 3 × END 2 ≈ **2,047,032**。これに ThickSex の BODY・FEEL などが掛かる。

### 5-4. 版の区別
両方の版にあるが、全年齢版では段階2までにして文を差し替える（`safe.js` の LK.ACT 置き換えは約12本）。`locker-thick.js` は R18版だけ。

### 5-5. 薄い箇所
- ベッドの前戯・体位変更・mf 絶頂の厚い版（locker-thick）が**各3文**しかない。
- MID 13種のうち多くが**1〜2文**。FF.mid の ride／mirror／gas、FM.mid の mirror／gas は**1文**。
- END は結び6種×**2文**。END_REL の fwb／master は**1文**。
- NAKA_ANS は gentle 以外の8態度が**1文ずつ**。
- ACT.oral の拘束版、sex の bound／boundTop が**3文**。

---

## 6. エロバラエティ（variety）

箱庭そのものが R18で、ファイルはすべて R18版だけ（全年齢では箱庭ごと外れる）。対象は `solo-variety*.js` の6ファイルと、`solo-erotic-more-b.js` のバラエティ部分（118本）。

### 6-1. 場面の種類と文の数

| 場面 | 発生 | 文の数 |
|---|---|---|
| 企画 KIKAKU **51種**（一人ずつ22／投票8／耐久8／対決8／チーム5） | 2〜5本をくじで選ぶ | ルール51＋play／hit／miss 338 = **389** |
| 攻め指定の人向けの差し替え | TOP_SIDE、ENDURE_TOP、DUEL_POS（＋引き分け）、DUEL_NG | 24＋7＋30＋5 = 66 |
| 当てっこ（共演者のを当てる） | 3人以上 | GUESS 35＋見るだけの版 11 = 46 |
| ハプニング | 頻度設定 | EVENTS 22＋amaama 3＋dressing（楽屋）3、STIR 11、AMA 9×2 = 18＋AMA_FRAME 4、CHAR_EV 20＋6 |
| 罰ゲーム | 頻度設定 | PENALTY 20、FINAL_PENALTY 9、同点二人 PAIR／FINAL_PAIR と多人数版 12、攻め指定用 TOP 6、SAFE 5 → **52** |
| 山場（R18版の厚い版） | 描写が low 以外 | THICK：final 3／finalTop 2／pairM・pairFM・pairFF 各2／goneM 3・goneFM 2・goneFF 2・goneSad 2 = **20**。声 VB 9×7 = 63、VT 9×4 = 36（バラエティ専用の `VA.thickVoice`） |
| 収録後のカップル | 惹かれ | gone 3／血縁 6／恋人 4／その他 6 = 19、RETURN 3、PRODUCER 7 |
| 態度・司会の台詞 | 常時 | WIN 18＋27＋20、LOSE 18＋26＋16＋5、INTRO_SAY 54、INTRO_COMBO 36 など。MCR 41＋23、MC_SAY 12、CATCH 6 |

固有の文の総数（ラベルと why を除いた概数）：**約1,500**（data 495、more 286、extra 180、intro 208、thick 119、variety.js の中の文 約100、erotic-more-b 118）。

### 6-2. 分岐の軸
- 企画（51）× 形式（5）× 競う能力（tech／gaman／iro／brain／luck）。
- 性別：
  - THICK の M／FM／FF（`p.gender` で判定）。
  - アシスタントの性別を絞る（ASSIST_NEED_M、FF_OK）。
  - NEED_PENIS（女性がいると選ばない企画が2つ）。
  - ふたなりは `p.gender==='f'` なので FF の扱いになる（`Pos.isF` を見ていない）。
- 態度（9）：WIN、LOSE、INTRO_SAY、AMA、VB、VT、NAKA 系。
- 関係：血縁の紹介（INTRO_KIN 16＋MC 8＋反応10）、恋人どうしの対決、カップル成立。
- 攻め指定：TOP_SIDE と NO_TOP（攻めの人がいると選ばない企画）。
- 嗜虐：goneSad 2（M のみ）。
- 濃さ：low／mid／high（厚い版は low 以外）。
- 3P：多人数の企画はあるが、性行為としての3P場面はない。

### 6-3. 理論上のパターン数
- 企画の並び（既定の3本）：51P3 = **124,950** 通り。1企画あたりの本文はルール1 × play2 × 結果（hit2 か miss2）。
- 山場：final は 3 × VB（受けの2段×7）× VT 4。

### 6-4. 版の区別
すべて R18版だけ（`safe.js` が kicker に R18 の付いた箱庭を外す）。

### 6-5. 薄い箇所
- THICK が場面ごとに**2〜3文**。pairFF／goneFF／goneSad は**2文**。
- 企画の hit／miss が各**2文**で、何度も遊ぶと同じ結果文が出やすい。
- LOSE.stern は data にない（extra で5本足して補っている）。
- 罰ゲームの攻め指定用（PENALTY_TOP 3、FINAL_PENALTY_TOP 3）が少ない。

---

## 7. マッサージ（massage「これって本当にマッサージですか？」）

ソロ（客1人 × 施術者）。ファイルは `solo-massage.js`（両方の版）、`solo-massage-data.js`（両方の版）、`solo-massage-thick.js`（R18版だけ）。共通部品は `thick-vmd.js`（R18版だけ。ダンジョンと共有）と、`solo-kit.js`＋ダンジョンの DG.TAILS／CLIMAX／ENDURE／MOAN（態度ごと。全年齢では `safe.js` が中身を差し替える）。

### 7-1. 場面の種類と文の数

| 場面・段階 | 文の数 |
|---|---|
| 施術の段階（問診〜仕上げの10段階、コースで範囲が決まる） | ACT 10×3 = 30 |
| 施術者の台詞（5人：店長・若いスタッフ・無口な職人・女性セラピスト・二人がかり） | STAFF_TALK 5×9 = 45 |
| 方針ごとの小場面（chat／endure／enjoy／relax／watch） | M.ACT 5×6 = 30 |
| 客の反応（9態度 × 際どさ3段） | REACT 9×11 = 99 |
| ハプニング（10種） | t 15、反応 r 10×9 = 90 |
| 気づく・騙される・言い訳 | NOTICE 18、DECEIVED 9、EXCUSE 5 |
| 流された後の行為（R18、描写する） | 体位 POS 8／POS_TOP 6／POS_TOP_F 3／POS_TOP_FF 4／POS_FF 9 = 30 |
| 山場の厚い版（R18、描写する） | MassageThick：fall 4（施術者が男性）／fallLady 3（女性セラピストが男性客に跨る）／fallFF 3／top 3（客が攻める）／topF 2／topFF 2／topSad 3（嗜虐的な客）= **20**。声は thick-vmd の VB と VT |
| 暗転（軽め＝全年齢と共通の経路） | DARK 21（act4・blackout3・climax5・lightsOn3・reverse2・研修生2＋2） |
| 分岐 | 立場逆転 REVERSE 7・TOP_* 14、研修生 TRAINEE 9、寝落ち SLEEP 15、スカウト 21、証拠 3、恋心 3、残る・去る・秘密 9 |
| 帰り道・結末 | AFTERSHOP 9×2 = 18、ending() の中の文 約39 |

固有の文の総数：**約620**（data 460、massage.js の文 約150、thick 20。thick-vmd は共通扱い）。このうち **R18でしか使わないもの** は POS 系30と MassageThick 20 の **50本だけ**。残りの約570本は全年齢と共通（全年齢では `softText` で和らげる）。

### 7-2. 分岐の軸
- 施術者5 × コース4 × 段階10。
- 態度9：REACT、INCIDENTS の反応、SCOUT、SLEEP_WAKE、AFTERSHOP。
- 性別：fall／fallLady／fallFF、topF／topFF、POS_TOP_F／POS_FF（`h.gender` と `staff.g` で判定）。ふたなりの扱いはない。
- 受け攻め：`Pos.vsNpc` で客が攻めなら top 系。
- 嗜虐：topSad 3。
- 濃さ：desc が full／dark の2段階（全年齢は dark に固定）。
- 3P：二人のスタッフ（duo）は台詞だけで、3Pの本文はない。

### 7-3. 理論上のパターン数
- 全10段階のコースなら、施術文だけで 3^10 = **59,049**。これに REACT（段ごとに3〜4）、STAFF_TALK、ハプニングが掛かる。
- 山場（厚い版）：fall は 4 × VB（受けの2段×5）× VT 5。

### 7-4. 版の区別
- R18版だけ：`solo-massage-thick.js`、POS 系、`thick-vmd`。
- 全年齢版では「軽め（暗転して回数だけ）」に固定し、DG の反応を全年齢用（`safe.js` の SAFE_POOLS）に差し替える。

### 7-5. 薄い箇所
- R18固有の本文が**50本**しかなく、比較する6箱庭の中でいちばん少ない。
- MassageThick の topF／topFF が**2文**、fallLady／fallFF が**3文**。
- POS_TOP_F 3、POS_TOP_FF 4。

---

## 8. 共有ファイルの割り当て

| ファイル | 対象箱庭のぶん |
|---|---|
| mini.js（仕組み）、mini-goukon（91件／546本）、mini-classroom（77／462）、mini-island（56／336）、mini-room（61／369）、mini-room-cute（15／73）、mini-extra-a／b／c、mini-serifu、mini-tails | すべて全年齢（性的な語は0件）。R18の文は0 |
| solo-erotic-more-a.js | 常識改変とサキュバスだけ。対象外 |
| solo-erotic-more-b.js | 催眠と**バラエティ（118本、6章に算入）** |
| solo-flow.js | 常識改変、サキュバス、オメガバースの NORI。対象外 |
| solo-thick4.js | 催眠、サキュバス、常識改変、感覚遮断穴の厚い版。対象外 |
| thick-vmd.js | バラエティ（`VA.thickVoice` があるので実際は使わない）、ダンジョン、**マッサージ**の声（VB 90、VT 45）。共通部品として数えていない |
| fwbcrush.js | 合コン、部屋、島の「セフレで片想い」（全年齢）。夜の文が各2本 |

## 9. どの共通部品を呼ぶか

| 箱庭 | 呼ぶ共通部品 |
|---|---|
| 合コン | ThickSex（PLACE.goukon）、Pos、pos-ff（FF.fix） |
| 出られない部屋 | ThickSex（PLACE.room）、Pos、pos-ff、pos-fm（三人）、Voice、HateKit＋TL（H_ROUGH）、FWB、Obsess |
| 無人島 | Pos と RelKit（ThickSex なし） |
| 媚薬ロッカー | ThickSex（PLACE.locker、FEEL、CLIMAX など）、Pos、Voice（EDGE／AFTER）、HateKit |
| エロバラエティ | Pos、Voice（CLIMAX）。thick-vmd は呼ぶが、自前の thickVoice が優先される |
| マッサージ | thick-vmd（VB／VT）、SoloKit＋DG（TAILS／CLIMAX／ENDURE／MOAN） |

solo-r18-moan と ero-kit（HK.Ero.sadist は ThickSex と thick-vmd の中で使われる）を直接呼ぶ対象箱庭はない。

---

## 10. 比較表

| 箱庭 | R18場面の種類数 | 固有の文の総数（R18で実際に使われるもの） | 死んでいる文 | 主な分岐軸 | 版 |
|---|---|---|---|---|---|
| 合コン | 1（お持ち帰りの夜） | **47**（導入22＋事後25） | 149 | 関係11 × 行き先5（性別・態度・型は共通の ThickSex 任せ） | R18のみ |
| 出られない部屋 | 10（will／des／repeat／道具／媚薬（同意あり・なし）／縛る／受け×受け／渋る／嫉妬／三人） | **約452**（room-thick 50、room 46、嫉妬 76、渋る 137、三人 143） | 401 | 型6、口調18（渋る）と3文体（嫉妬）、3Pの形4×きっかけ5×見所18、媚薬・道具・拘束 | 両方（厚い版と嫉妬は R18のみ） |
| クラスメイト | 0 | 0 | — | — | 全年齢のみ |
| 無人島 | 1（島の夜。ほのめかす／描写する） | **46**（＋ANIKI 3） | 0 | 関係5 × mf／ff × 濃さ3（fm なし・態度なし・厚い版なし） | R18のみ |
| 媚薬ロッカー | ロッカー内の5段階＋繋がった後の進行＋ベッド（誘い方5・展開13・結び6）＋特殊（主従・片想い・思惑・生殺し・攻め×攻め）の約25種 | **約886**（ほかに結末50、仕掛け・環境238） | 18 | mf／fm／ff すべてに専用の文、態度9、関係9、拘束3、濃さ3 | 両方（全年齢は段階2まで。厚い版は R18のみ） |
| エロバラエティ | 企画51＋当てっこ＋ハプニング＋罰ゲーム＋山場9種＋楽屋 | **約1,500**（企画389、山場20＋声99、罰52など） | 少数（thick-vmd の声） | 企画51 × 形式5 × 能力5、態度9、M／FM／FF、攻め指定 | R18のみ |
| マッサージ | 段階10＋ハプニング10＋分岐6＋流された後（体位・厚い版7種） | **約620**（うち R18でしか使わないもの50） | 0 | 施術者5 × 段階10 × 態度9、性別（fall／fallLady／fallFF・top 系）、濃さ2 | 両方（R18固有は50本） |

### 基準数を決めるための所見
1. 濃い場面の固有の厚みは、合コン（47）と無人島（46）が際立って薄い。部屋・ロッカー・バラエティの1/10以下で、両方とも1場面しかない。ただし合コンは共通の ThickSex で本文の分岐を補えている。無人島は ThickSex も通らず、各段階が3文しかない。
2. 女性どうし・女性が攻めの固有の文：ロッカーは充実（ff 約110、fm 約100）。部屋は約15、合コンは0（FF 44が死んでいる）、無人島は ff 9・fm 0、バラエティの山場は各2、マッサージは各2〜3。
3. 事後の文：合コン5/行き先、部屋2〜3/モード、無人島2/関係、ロッカー2/結び、バラエティはカップル成立19。基準は「1分岐あたり3〜5文」あたりが目安になる。
4. 死んでいる文が、部屋で401本、合コンで149本ある。数を均す前に、厚い版へ移すか削るかを決めないと、ファイル上の文の数と実際のパターン数が大きく食い違う。
