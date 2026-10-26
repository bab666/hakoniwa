# 喘ぎの仕組み（HK.Moan）がどこまで場面に効いているか（2026-10-26 調べ）

R18版（`hakoniwa-full/js`、bundle を除く）で、喘ぎ（短い声・果てる声・キス中の声・口でしているときの声）を**作っている箇所**を洗い出した。

- (a) `HK.Moan.pick`／`HK.Ero.moan`（`{m0}`〜`{m2}`・`{m:鍵}`・`{mb1}` などの差し込みを含む）を通っている
- (b) 箱庭や共通部品が持つ、独自の態度別・口調別の表から選んでいる
- (c) 場面の地の文に直書きされていて、差し替えが難しい

件数は目安（呼び出し・差し込みの数、表の行の数、地の文の中の短い声の数を機械的に数えたもの）。

## 1. 今回のまとめ

| 分類 | 今回の前 | 今回のあと |
|---|---|---|
| (a) 仕組みを通る | 男性向けの作風の場面だけ（約1,500か所の差し込み・呼び出し、40ファイル） | 男性向けに加えて、下の (b) のうち 18 か所の小説調の場面・山場の声 |
| (b) 独自の表 | 約20の表（下の表）。小説調の場面の喘ぎはほぼ全部ここ | 差し替えたものは `HK.Moan` が無いとき（全年齢版）の逃げ道と、小説調の「元の味」として4割ほど残す。残した (b) は 2-3 |
| (c) 地の文に直書き | 約1,700（137ファイル。台詞の語尾の「……っ」も含む粗い数え） | 変えていない |

差し替えには、`moan-engine.js` に足した **`HK.Moan.say(S, 住人, 場面, o, 元の表)`** を使う。

- 場面：`start` 始まり／`mid` 最中／`climax` 受けが果てる／`top` 攻めが果てる／`topmid` 攻めの最中の声／`kiss`／`suck` 口でしている／`lick` 口でされる
- o：`force` 嫌がっている（合意のない・敵対・堕ちる前）、`hush` 声を殺す（狭いロッカー・隣に人がいる）、`deep`・`late`、`novel` 小説調、`fall` 堕ちている
- 鍵の選び方：果てる＝`w2`（後半や1割強で `w3`）、嫌がる＝`r3`／`r4`（態度が荒い人は `r4` が多い）、声を殺す＝`h1`／`h2`、攻め＝`t4`（もう限界）・`t1`（声を我慢）・`t5`（やわらかい人が嫌がる相手に）、最中＝`w1`／`b0`／`p0`（嫌がるなら `r1`／`r2`／`p1`）、キス＝`k0`、口でしている＝`o0`、口でされる＝`l0`／`l1`
- 小説調（`novel`）：♡を落とし、言葉のある喘ぎの割合を 0.6 にする。利用者の辞書にその鍵の行が無ければ、元の表（口調ごとの小説調の喘ぎなど）も4割ほど残す。辞書に行があれば必ず辞書から
- 全年齢モード（`HK.SAFE_ON`）では元の表のまま（元の表が無ければ何も出さない）。自分で攻めを選んだ人の受け身の声（始まり・最中・果てる）は、元の表（受け身の台詞を外したもの）のまま
- 全年齢版には `moan-engine.js` が無いので、両ビルドにあるファイル（`solo-locker.js`・`locker-crowd.js`・`solo-kit.js`）は `HK.Moan` が無ければ元の表を使う

## 2. 一覧

### 2-1. (a) すでに通っていた（今回は触っていない）

| ファイル | 関数／差し込み | 場面 | 件数の目安 |
|---|---|---|---|
| `ero-kit.js`・`moan-engine.js` | `HK.Ero.moan`（段階→鍵に読み替え）、`HK.Ero.fill` の `{m0}`〜`{m2}`・`{m:鍵}` | 男性向けの作風の全場面の土台 | — |
| `thick-sex-ero.js` | `{mb0}`〜`{mb2}`・`{ma1}` | 男性向けの厚い交わり（部屋・合コン・島・ゾンビ・宇宙船・オメガ・ふたりの日常など共通） | 209 |
| `solo-kaihen-ero.js`・`solo-kaihen-talk.js` | `{m…}` の差し込み、`emoan` | 常識改変（男性向け） | 163・89 |
| `solo-saimin-ero.js`・`solo-saimin-thick.js` | `{m…}`、`moan()` | 催眠（男性向け） | 158・18 |
| `ship-lewd.js`・`ship-r18-more.js`・`ship-night.js` | `{m…}` | 宇宙船（男性向け） | 73・64・29 |
| `solo-massage-lewd.js`・`solo-massage-thick.js` | `{m…}` | マッサージ（男性向け） | 49・14 |
| `locker-crowd-r18.js`・`locker-ties-r18.js` | `{m…}` | 媚薬ロッカー（大人数・新しい関係。男性向け） | 45・43 |
| `hole-thick.js`・`solo-hole-ero.js` | `HK.Ero.moan`・`{m…}` | 感覚遮断穴（男性向け） | 40・38 |
| `dungeon-topfall.js`・`dungeon-lewd.js`・`dungeon-tempt.js`・`dungeon-thick.js` | `moanSafe`・`moan`・`{m…}` | エロトラップダンジョン（男性向け） | 38・24・18・4 |
| `solo-yakata-r18.js`・`story-lewd.js` | `R.say`（男性向けは `E.moan`） | 吹雪の館・邪神村など物語型の交わり（男性向け） | 35・21 |
| `solo-succubus-ero.js`・`solo-succubus-rival.js`・`solo-succubus-target.js` | `moans()`（`HK.Ero.moan`） | サキュバス（男性向け） | 27・26・7 |
| `solo-variety-plus.js`・`solo-variety-thick.js` | `{m…}` | エロバラエティ（男性向け） | 50・22 |
| `omega-ties-r18.js`・`room-tie-r18.js`・`hate-sex-r18.js` | `{m…}` | オメガバース・部屋の関係・憎しみの夜（男性向け） | 29・3・3 |
| `locker-thick.js` | `{m…}` | 媚薬ロッカーの寝台（男性向け） | 19 |
| `scenario-room.js` | `HK.Moan.pick(…, 'k0')` | 出られない部屋のキスの条件 | 1 |
| `solo-locker.js`・`locker-crowd.js`・`solo-variety.js` の男性向けの枝 | `HK.Ero.moan` | ロッカー・バラエティ（男性向け） | 各1〜2 |

### 2-2. (b) 独自の表から選んでいた → 今回 `HK.Moan.say` に差し替えた

| ファイル | 関数／表 | 場面 | 表の行の目安 | 差し替え後の鍵 |
|---|---|---|---|---|
| `solo-locker.js` | `moan()`・`climax()`（小説調は `V.CLIMAX[態度]`、攻めは `LK.TOPV.moan`） | 媚薬ロッカーで繋がったまま果てる・寝台 | Voice.CLIMAX 260・攻めの声 約40 | ロッカーの中＝声を殺す（`h2` 7割／`w2`）、攻め＝`t1`／`t4`。扉が開いたあとの寝台は声を殺さない（`w2`・`t4`） |
| `locker-crowd.js` | `moan()`（`V.CLIMAX`・`LK.TOPV.moan`） | 大人数ロッカー：一人で果てる・求めた・無理やり | 同上 | 声を殺す＋無理やりは `force`（`h2`／`r3`） |
| `thick-sex.js` | `T.moan`（`T.MOAN`・`T.CMOAN` ＋口調ごとの `HK.NovelMoan`） | 小説調の交わり（出られない部屋・合コン・島・ゾンビ・ふたりの日常・ロッカーの寝台・性器なしの組） | 135 ＋ 口調ごと 3,078 | 最中＝`mid`、果てる＝`climax`（元の表も4割） |
| `r18-thick.js` | `moan()`（`ThickVM.VB` ＋ `NovelMoan`） | 邪神村RTA・吹雪の館の厚い山場（小説調） | 90 ＋ 口調ごと | こらえる＝`mid`、崩れる＝`climax`、主導する側＝`topmid`／`top` |
| `solo-r18-moan.js` | `say()` の start／mid／climax／topc（`R18M_DATA.V[口調]` ＋ `NovelMoan`） | 物語型の交わり全般（邪神村・吹雪の館・人狼の夜・確執など、小説調） | 343 ＋ 口調ごと | `start`／`mid`／`climax`／`top`。無理やりの場面（`S._r18F`）は `force` |
| `thick-vmd.js` | `HK.ThickVM.voice` の `{vb1}`・`{vb2}`（`VB[態度]`） | ダンジョン・マッサージ・エロバラエティ・ダンジョンの誘惑／堕ちた攻めの山場（小説調） | 90 | `{vb1}`＝`mid`、`{vb2}`＝`climax`。段落の文から強引・奥・後半を読む（`HK.Ero.ctxOf`） |
| `solo-variety-thick.js` | `VA.thickVoice`（この箱庭の軽い声 `VB`） | エロバラエティの山場 | 約60 | `{vb1}`＝`mid`、`{vb2}`＝`climax` |
| `solo-thick4.js` | `HK.Thick4.scene` の受けの声（`SUB1`・`SUB2`） | 常識改変・催眠・サキュバスの山場の受けの声 | 81 | `mid`・`climax`（荒い型・首の型の決まった台詞は元のまま） |
| `hole-thick.js` | `voice()` の小説調（`Thick4.SUB1`・`SUB2`） | 感覚遮断穴の山場 | 81 | `start`／`mid`／`climax`。堕ちる前（段階0〜1で意志が強い）は `force` |
| `solo-kit.js` | `K.moan`（`DG.MOAN`＝`V.CLIMAX`） | 一人用の箱庭の絶頂（マッサージ・感覚遮断穴など、`K.climax`） | 260 | `climax`。堕ちる前は `force`、段階3以上は堕ちている |
| `dungeon.js` | 絶頂の声（`DG.MOAN`） | エロトラップダンジョンの絶頂 | 260 | `climax`。段階0〜1で堕ちていなければ `force` |
| `solo-variety.js` | `moan()` の小説調（`V.CLIMAX`） | エロバラエティの絶頂 | 260 | `climax` |
| `solo-kaihen.js` | 小説調の果てる声 3か所（`V.CLIMAX`） | 常識改変：施術・攻め役・モブ | 260 | `climax`（新しく `nClimax()`） |
| `solo-succubus.js` | 感じすぎて仕事にならないときの声（`V.CLIMAX`） | サキュバス | 260 | `climax`、上に乗っているときは `top`（男性向けでは♡のまま） |
| `solo-saimin-sex.js` | 流されて果てる声（`V.CLIMAX`）、数日後の夜の果てる声（`CL`） | 催眠（小説調） | 260・約30 | `climax`（攻めの声 `CLIMAX_TOP` は元のまま） |
| `omega-thick.js` | `{climax}`（`V.line` の枠つき `V.CLIMAX`）、`{mU0}`・`{mU1}`（`NOV[態度]`） | オメガバースなどの厚い夜（小説調） | 260・約90 | `{climax}`・`{mU1}`＝`climax`、`{mU0}`＝`mid`（奥） |
| `futari-r18.js`・`locker-thick.js`・`pos-nogen.js` | `ThickSex.moan` を呼ぶ側 | ふたりの日常・ロッカーの寝台・性器なしの組 | — | 乱数を渡すようにして、上の `T.moan` 経由で通る |

### 2-3. (b) 独自の表のまま残したもの

| ファイル | 関数／表 | 場面 | 件数の目安 | 残した理由 |
|---|---|---|---|---|
| `persona.js`・`voice-more.js` | `V.EDGE`（寸前の台詞） | ロッカー・寝台などの寸前 | 127 | 喘ぎより「待って」「まだだ」の台詞。鍵に当たるものがない |
| `solo-locker-more.js` | `LK.TOPV.hush`・`edge`（攻めのささやき） | ロッカーで物音に止まる・寸前 | 約40 | 声ではなく台詞 |
| `solo-kaihen-more.js`・`solo-kaihen-ero.js` | `KH.MOAN`・`KH.MOAN_P`・`T.moan`（「仕事なのに」「業務中なのに」） | 常識改変の施術中 | 約60 | 箱庭の設定そのものの言葉。辞書の鍵にすると味が消える |
| `solo-succubus-data.js` 他 | `SB.VOICE.MELT` | サキュバスの感じすぎ | 約20 | 同上（仕事・精気の言葉） |
| `solo-saimin-sex.js` | `SM.CLIMAX_TOP`・`CLIMAX_TOP_FF` | 催眠をかけられた側が攻めのとき | 約30 | 攻めの果てる声として書き分け済み。`solo-saimin.js` は別の人が作業中なので、そちらから使う分も触っていない |
| `solo-saimin.js` | 小説調の絶頂の声（`V.CLIMAX`・`topVoice`） | 催眠 | — | 別の人が作業中のため未着手（次に `HK.Moan.say(S, p, 'climax', { novel: true }, …)` で差し替えられる） |
| `solo-r18-moan.js` | `say()` の endure・top・after | 物語型の交わりのこらえる台詞・攻めの台詞・事後 | — | 喘ぎではなく台詞 |
| `solo-thick4.js` | `ROUGH_SUB`・`CHOKE_SUB`・`flood()` | 嗜虐的な攻め・首の型の受けの声、感覚遮断穴の戻ってきた感覚 | 約30 | 型に合わせて書いた決まった台詞 |
| `safe.js` | `MOAN`（全年齢モードの置き換え） | 全年齢モード | 2 | R18 の声ではない |

### 2-4. (c) 地の文に直書き（差し替えが難しい）

山場の地の文の中に「〜」と短い声が書き込まれている、または「果てた」「声を殺しきれなかった」のように語りで書かれているもの。文の流れごと書いてあるので、喘ぎだけを鍵に置き換えにくい。

| ファイル | 表 | 場面 | 件数の目安 |
|---|---|---|---|
| `solo-saimin-data.js`・`solo-saimin-ero.js`・`solo-saimin-sex.js` | 暗示ごとの反応・山場の文 | 催眠 | 172・136・66 |
| `solo-massage-data.js`（`M.CLIMAX` など）・`solo-massage-thick.js`・`solo-massage-lewd.js` | 施術の段階・絶頂の文 | マッサージ | 69・28・19 |
| `locker-crowd-r18.js`（`R.PCL`・`R.TCL`・`R.SELF_CL`・`R.FREACT`）・`solo-locker-more.js` | 果てる文・無理やりの反応 | 媚薬ロッカー | 59・15 |
| `solo-hole-ero.js`・`solo-hole-live.js`・`solo-hole-data.js` | 壁の向こうの出来事 | 感覚遮断穴 | 49・41・11 |
| `solo-erotic-more-a.js`・`solo-erotic-more-b.js`・`solo-variety-*.js` | 企画ごとの文 | エロバラエティ | 32・49・約70 |
| `solo-sit-night-r18.js`・`solo-rel-r18.js` | 状況の夜の段 | 無人島・ゾンビの街 | 42・16 |
| `hate-sex-r18.js` | 憎しみの夜 | 共通 | 39 |
| `thick-sex.js`（`T.BODY`・`T.CLIMAX`・`T.REACT` など）・`room-thick.js`・`futari-r18.js`・`solo-goukon-night.js` | 小説調の交わりの段 | 部屋・ふたり・合コンなど | 35・16・19・21 |
| `ship-after.js`・`ship-xeno-thick.js`・`ship-r18-more.js`・`ship-night.js` | 宇宙船の夜 | 宇宙船 | 34・30・21・15 |
| `dungeon-persona.js`（`DG.CLIMAX`・`DG.CLIMAX_TOP`）・`dungeon-topfall.js`・`solo-kit.js`（`CLIMAX_SOLO`） | 態度×段階の絶頂の文 | ダンジョン・一人用の箱庭 | 約200・30 |
| `solo-kaihen-data.js`（`KH.CLIMAX`）・`solo-kaihen-after.js`・`solo-kaihen-voice.js` | 施術ごとの果てる文 | 常識改変 | 約60・22・19 |
| `solo-succubus-target.js`・`solo-succubus-more.js`・`solo-succubus-data.js`（`SB.CLIMAX`） | 搾る文 | サキュバス | 27・22・約20 |
| `omega-thick.js`・`dark-thick.js`・`pos-nogen.js`・`room-lewd*.js`（`CLIMAX`）・`room-trio*.js`（`CLIMAX3` など）・`pos-ff.js`・`pos-fm.js`・`attr-race-r18.js` | 果てる語り | オメガ・部屋・三人・女性どうし・女性の攻め・種族 | 16・14・14 ほか語りのみ |

出られない部屋（`room-lewd.js`・`room-lewd-x.js`・`room-lewd-more.js`・`room-trio.js`・`room-trio-lines.js`）とオメガバースの発情期（`omega-heat.js`）は、喘ぎの台詞を持たず語りだけで書いてある（短い声 0）。厚い場面は `room-thick.js` から `thick-sex.js` の `T.scene` を通るので、今回の差し替えで喘ぎの仕組みが効く。

## 3. 確かめたこと

- 両ビルドを作り直し、`smoke.js` でページのエラー0・simulate のエラー0
- `collect.js`：R18版（r18）19箱庭152回・全年齢版16箱庭128回とも失敗0・ページのエラー0
- `pos-audit.js 24 --hot`・`--ff --hot`：全部0
- `orient-audit.js`（R18版 r18・safe、全年齢版）：0
- `state-audit.js`（R18版 r18・safe、全年齢版）：S1〜S9・S11〜S22 は0。S10（同じ性的な文が一回の遊びで3つ以上の記録に出た。目安の項目）がサキュバスで1件。サキュバスの「受け入れて搾ったとき」の果てる文（`solo-succubus-ero.js` の `T['climax.in']`）が2行しかないため。乱数の進み方が変わって表に出たもので、喘ぎの差し替えとは別の、表の少なさによるもの
- 全年齢版の `solo-locker.js`・`locker-crowd.js`・`solo-kit.js` は R18版と `cmp` で一致。足した文字列は鍵の名前（`'climax'` など）だけで、全年齢版のビルドの検査で止まらない
