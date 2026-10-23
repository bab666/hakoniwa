# R18場面のパターン数調査（エロトラップダンジョン／ダンジョンRPG／感覚遮断穴／常識改変／サキュバスの一夜／催眠）

対象：`/home/user/hakoniwa/hakoniwa-full/js`（R18版ビルド）。読み取りのみ。調査日 2026-10-23。

## 0. 数え方

推測ではなく、次の3通りで実際に数えた（スクリプトは scratchpad の `ana/` に置いた。リポジトリには書き込んでいない）。

1. **静的に数える**：acorn で各ファイルを構文解析し、日本語を含む文字列リテラルを `split('|')` した断片を、代入先・プロパティ名ごとに集計（`L('a|b|c')`、`'…|…'.split('|')`、配列リテラル、`E(lv, '文')`、`D(…,'本文|本文')` などすべて）。
2. **読み込み後に数える**：Playwright（Chromium）で `index.html#r18` を開き、`HK.DG` `HK.HoleMore` `HK.HoleLive` `HK.KAIHEN` `HK.SUCCUBUS` `HK.SAIMIN` `HK.Ero.T` の配列長を直接数えた（追加ファイルが `concat` した後の実数。persona-final.js の「敬語＝健気の流用」もここで確認）。
3. **実際に回して数える**：`HK.Ero.has` と共通部品（Thick4 / ThickVM / R18M / FM / FF / Ero.moan など）をフックし、各箱庭を **20,000回ずつ**（住人1〜4人・性別 m/f/未指定・受け攻め ''/top/bottom/riba・ふたなり・口調・設定値をランダム、作風は 3/4 を「男性向け」）シミュレーションして、**男性向けの差し替えキーが実際に引かれたか／登録があったか**を記録した。エラー 0 件。

表記：
- 「文」＝ `|` で区切った1断片（＝ランダムに選ばれる1候補）。
- 「全断片」は名前・ラベルを含む全数、「本文」は15字以上で、`why`・`tag`・ラベル・設定画面・結果まとめを除いたもの。
- 小説調＝描写の作風「小説調」（既定）。男性向け＝作風「男性向け」で `HK.Ero.L` により**配列ごと差し替わる**文（登録がなければ小説調のまま）。
- persona（態度）＝ proud 強気／stern 厳格／tsun 意地っ張り／gentle 穏やか／devoted 健気／cool 冷静／free 奔放／shy 恥じらい／polite 敬語 の9種。

### 共通部品（このレポートでは数えない。呼んでいるかどうかだけ記す）

| 部品 | ダンジョン | 遮断穴 | 常識改変 | サキュバス | 催眠 |
|---|---|---|---|---|---|
| ero-kit.js（`HK.Ero`：作風の切替・擬音 `{s:*}`・♡喘ぎ `{m0-2}`・`sadist`） | 使わない（作風の選択肢なし） | ○ fill / moan / sfx | ○ fill / moan / sfx / sadist | ○ fill / moan / sfx / sadist | ○ fill / moan / sfx / sadist |
| solo-thick4.js（小説調の山場 `HK.Thick4`） | × | ○ `flood`（解放の最初の絶頂） | ○ `scene`（施術の山場） | ○ `scene`（搾精の山場） | ○ `scene`（本番の暗示の山場） |
| thick-vmd.js（`HK.ThickVM`） | ○ `voice`（陥落の山場の声） | × | × | × | × |
| solo-r18-moan.js（`HK.R18M`） | × | × | ○ `topLines` のみ | × | ○ `topLines` のみ |
| thick-sex.js（`HK.ThickSex`） / r18-thick.js | × | × | × | × | × |
| pos-fm.js（`HK.FM`：女性上位への置き換え） | ○ fix | ○ fix | ○ fix / fixWith | ○ fixWith（女性サキュバスが攻めの時） | ○ fixWith |
| pos-ff.js（`HK.FF`：女性どうしへの置き換え） | ○ fixMutual | × | ○ fixMutual | × | ○ fixMutual |
| `HK.Voice.CLIMAX`（態度ごとの絶頂の声、共通） | ○（`DG.MOAN` として） | ○（SoloKit 経由） | ○ | ○ | ○ |
| solo-kit.js（`HK.SoloKit`。絶頂文は **ダンジョンの `DG.CLIMAX`/`DG.TAILS`** を流用） | ― | ○ | × | × | × |
| solo-story-kit.js（`HK.Story`） | × | × | ○ | ○ | ○ |
| 口調の自動変換（voice*.js / tone-*.js / voice-override-r18.js） | ○ | ○ | ○ | ○ | ○ |
| hate-kit / obsess（不仲・執着の出来事） | ○ | × | ○（solo-rel-bad） | ○（solo-rel-bad） | ○（rel-bad-story） |

- **口調（15種前後の tone）について**：どの箱庭も台詞を口調ごとに**書き分けておらず**、結果の台詞を共通の口調変換（`HK.Voice.processResult`）が書き換える。箱庭固有の「口調の表」と書かれているもの（常識改変 `KAIHEN.VOICE`、サキュバス `QUOTE`/`VOICE`）は、実際には **persona（態度）9種**で引いている。したがって以下の「口調」軸は、箱庭固有の文としては **0（共通変換に依存）** と数える。
- **solo-thick4.js の中の箱庭固有の段落**（共通部品の中にあるが、特定の箱庭専用）：催眠 SCN 14＋FLAVOR 2＝16、サキュバス SCN 14＋FLAVOR 2＝16、常識改変 SCN 14＋FLAVOR 2＝16、感覚遮断穴 FLOOD_* 13。各箱庭の節で「固有文」に加えて示す。
- **solo-rel-bad.js** の `STORY.kaihen` `STORY.succubus` `STORY.dungeon` 各24文は「きょうだい（不仲）・不仲」の出来事で、性的な場面ではない（R18版専用ファイルにあるだけ）。参考値。

---

## 1. エロトラップダンジョン（dungeon*.js）

ファイル：dungeon.js（本体）、dungeon-lines.js、dungeon-persona.js、dungeon-rich.js、dungeon-thick.js、dungeon-events-a/b/c.js、dungeon-bosses.js、dungeon-party.js、dungeon-view.js（表示）。

全断片 2,171／本文（15字以上）1,425（うち dungeon-view.js 26・dungeon.js 本体 17 は結果まとめ）。
**作風の切替（小説調／男性向け）はない**。`S.env.lewd`（罠の淫らさ）が15以上なら、陥落だけ厚い段落（DG.THICK＋ThickVM）になる。

### 1-1. R18場面の種類と文の数

| 場面 | 発生条件 | 文の数 |
|---|---|---|
| 罠（trap） | 部屋の種類のくじ（罠率 0.36＋淫らさ/400）。察知に失敗 | 81種・334文（迷宮ごとに使える数：淫魔の城173／粘液105／触手92／塔173／神殿160） |
| 魔物（mon・負けたとき） | 魔物の部屋で退けられなかった | 21種・67文（迷宮ごと 16〜28） |
| 宝箱・怪しい物（chest） | 開けた | 11種・33文 |
| 泉（spring） | 浸かった | 5種・15文 |
| 心を揺さぶる出来事（odd・幻惑） | くじ | 13種・39文 |
| 囚われ人（captive）／捕縛中（cap） | 囚われ人の部屋／捕まっている間 | 5種13文／8種20文 |
| 罠の直後の反応（TAILS） | 罠・魔物のたびに（同じ段階なら8割省略） | persona × 堕ち度5段階 × **4文**（＝20/persona。8種＋敬語は健気の流用）＝160 |
| こらえる（ENDURE） | 段階0〜2で4割 | persona × **3文**（8種＋流用）＝24 |
| 絶頂（CLIMAX） | 快感100到達 | persona × 5段階 × **3文**＝120（＋45%で共通 `Voice.CLIMAX` の声を前置） |
| 寸止め（LINES.edge） | 寸止めの呪い | 4 |
| 心が揺らぐ／陥落寸前（LINES.mid / brink） | 堕ち度40／75 | 4／4 |
| 陥落の山場（DG.THICK） | 堕ち度100（淫らさ≥15） | 迷宮5種×**2文**＋any 2＝12（400字前後の段落） |
| 陥落（短い版 LINES.fall） | 淫らさ<15 など | 4 |
| 堕ちたあとの結末（FALLS） | 陥落時、条件の先頭 | 12（題 13） |
| ボス戦 | 各階の番人・最深部 | 15体 × （登場2・技3×2・反撃2・勝利2・堕ち1＝13）＝195 |
| 夢（LINES.dream） | 淫夢の呪いで休憩 | 4 |
| 拘束（holdOn／holdEscape／holdRelease／captured／capEscape） | 罠・魔物で拘束 | 6／5／5／4／4 |
| 仲間に見せつけられる（witness） | 複数人・仲間が責められた直後 6割 | 火照る 4（攻め指定なら別4〜5）／気分が悪い 4／助けに入る 成功3〜4・失敗 2×3通り・見ているだけ1〜2 |
| 慰め合い／仲間の暴走（heat） | 複数人・堕ち度と快感が高い | 慰め合い4／襲う3／止められる 1＋2 |
| 堕ちた仲間が手招き（lure） | 堕ちた仲間がいる 2割 | 約3 |
| 攻め指定の挑戦者（DG.TOP ほか） | `HK.Pos.hardTop`（自分で攻めを選んだ） | 出来事の差し替え 34、行の差し替え 24、TAILS_TOP 5段階×4＝20、CLIMAX_TOP 5×3＝15、FALLS_TOP 12、THICK fallTop 2＋fallTopF（女性）2 |
| 平凡な結果の言い回し（RICH） | 罠を避けた・退けた・素通り・休憩 | persona × （avoid 3／resist 2／win 2／sneak 1／skip 1／rest 1） |

### 1-2. 分岐の軸ごとの文数

| 軸 | 内容 | 文数 |
|---|---|---|
| 性別の組 | 挑戦者×魔物・罠。**性別で本文は変わらない**。例外は攻め指定の女性の陥落 `fallTopF` 2文のみ。仲間どうし（慰め合い・暴走）も性別の書き分けなし（可否は `HK.canLove`／`Pos.order`）。男×男・女×女・ふたなり専用文 0 | 2 |
| 受け攻め | 攻め指定（hardTop）は「される」側にしない専用文 | 34＋24＋20＋15＋12＋4＝109 |
| persona | 8種は固有。**敬語（polite）は persona-final.js で健気（devoted）の配列をそのまま流用** | TAILS 160・CLIMAX 120・ENDURE 24・RICH 80（各 polite 分は0） |
| 口調 | 共通変換のみ | 0 |
| 快楽の段階 | 堕ち度0抵抗／1動揺／2揺らぎ／3受容／4陥落寸前 | TAILS 4・CLIMAX 3（各 persona・各段階）、TAILS_TOP 4・CLIMAX_TOP 3（段階ごと） |
| 迷宮のテーマ | 淫魔の城・粘液・触手・塔・神殿（＋混成） | 罠・魔物は「テーマ指定」で振り分け（上表）。THICK は各2 |
| 嗜虐 | なし（dungeon-thick.js は「首を押さえる描写は入れない」と明記） | 0 |
| 作風（小説調／男性向け） | 切替なし（男性向けの差し替え 0） | 0 |
| 長い版 | 陥落の DG.THICK（400字前後） | 16（受け12・攻め4） |

### 1-3. 理論上のパターン数

- 罠1回（淫魔の城・段階0〜2・persona 固定）：罠文 173 ×（反応なし＋TAILS 4＋ENDURE 3）＝ **1,384**（部位 `{p}` の差し込みは除く）
- 絶頂1回：CLIMAX 3 ×（声なし＋共通 MOAN 32）＝ 99／（persona・段階）→ 99 × 5段階 × 8（実質の persona）＝ **3,960**
- 陥落：THICK（テーマ2＋any 2）× ThickVM の声（共通）。短い版 4。結末 12
- ボス戦1回：登場2 × 技（3種×2）× 反撃2 ×（勝利2 or 堕ち1）＝ 1体あたり 72 程度 × 15体

### 1-4. 薄い箇所

- **男性向けの作風が丸ごと無い**（他の4箱庭は Ero.OPT で切替あり）。擬音・♡喘ぎ・淫語の版は 0。
- **性別の書き分けがほぼ無い**（女性攻めの陥落 2文だけ）。男性の挑戦者でも女性の挑戦者でも同じ罠文。
- 敬語 persona は固有文 0（健気の流用）。
- 陥落の山場 DG.THICK は迷宮ごとに **2文**しかない（受け12・攻め4）。陥落は1回の遊びのクライマックスなので、繰り返し遊ぶとすぐ重なる。
- ボスの「堕ち（fall）」は1体1文、技の本文は1技2文。
- RICH の sneak／skip／rest は persona ごとに1文。
- 複数人の「仲間の暴走」は襲う3文・慰め合い4文と少ない（R18的には一番の山場なのに薄い）。

---

## 2. ダンジョンRPG（scenario-rpg.js / rpg-data.js / rpg-special.js）

- **R18部分は無い**。scenario-rpg.js の冒頭に「全年齢・R18版の両方で使う」、rpg-special.js は吸血鬼の吸血を `r18: false` として「全年齢の箱庭なので、性的な場面にはしない」と明記。lewd・Ero・Thick など R18 部品の呼び出しも 0。
- R18 用の共通ファイル（special-r18.js、solo-rel-bad.js、r18-thick.js、voice-override-r18.js など）にも `rpg` の分岐は無い（rel-bad-story.js の `STORY.rpg` は全年齢の不仲イベント）。
- → 比較表では「R18場面 0」とした。

---

## 3. 感覚遮断穴（solo-hole*.js）

ファイル：solo-hole.js（本体）、solo-hole-data.js（`HK.HoleMore`）、solo-hole-live.js（`HK.HoleLive`）、solo-hole-behind.js（`HK.HoleBehind`）、solo-hole-ero.js（男性向け）。

全断片 1,304／本文 956（＋solo-thick4.js の遮断穴専用 13）。うち男性向け差し替え（Ero.T.hole）**99キー・240文**。

### 3-1. R18場面の種類と文の数

| 場面 | 発生条件 | 小説調 | 男性向け |
|---|---|---|---|
| 壁の向こう（遮断中） | 人通りのくじ（1時間に最大2件）。過激さで lv0〜2 の重み | 場所5 × **20**（`HoleMore.BEYOND`）＝100。男性用書き直し 24、攻め寄り用 8、攻め指定 4×5＝20 | 場所ごとの追加 toilet 8／lab 5／show 4／dungeon 5／white 4（＝26。小説調に**足して2倍の重み**で混ぜる）／beyondTop 3 |
| 同じころのこちら側（落差） | 壁の向こうの後 55% | 12 | 5（＋.top 2） |
| 待機・心の声（MIND） | 何も起きない時 6割 | persona × （2＋3）＝5 | ― |
| 想像する（IMAGINE） | FC・AC・衝動 | 3 | ― |
| 時間を数える／数えられない | A・行動「数える」 | 6＋3／5 | ― |
| 眠り（DREAM）・叫ぶ・もがく・待つ体 | 行動・くじ | 4・3・2・5 | ― |
| こちら側に人が来る | 溜まった感覚>60、22% | 場所 × 3 ＋ 反応 persona × 2 | ― |
| 遮断の揺らぎ（LEAK） | 不完全さ（leak） | 3 | 4（＋.top 2） |
| 解放（RELEASE）＋一気に戻る（FLOOD） | 解放のしかた burst | 3 × 3 | flood 3（＋.top 2） |
| 少しずつ戻る（DRIP） | drip | 1＋3（攻め用 4） | drip 1 |
| 帰り道で遅れて（LATE） | late | LATE_IN 2・LATE 4・LATE_AFTER 3状態×2 | ― |
| 戻った波：絶頂＋混乱（CONFUSE） | 溜まった量で 1〜10波 | persona × （3＋3）＝6。絶頂文は **ダンジョンの DG.CLIMAX** を流用 | confuse.persona × 5、wave（絶頂の前の地の文）5（＋.top 2） |
| 小説調の山場（Thick4.flood） | 最初に達した波（late 以外） | solo-thick4 の FLOOD_RECV 3／FEEL 3／LINK 3（＋TOP 2・TOP_F 2） | （男性向けでは使わない） |
| 余韻・陥落（AFTER） | 解放後の状態 hold／broken／fall | hold **persona × 1**、broken 2、fall 3 | after.hold.persona × 1、broken 3、fall 3 |
| 壁の向こう側へ見に行く（PEEK） | FC・A・目標「気になる」 | 3 | 3 |
| 最中に戻る：遮断が壊れた（BREAK＋FLOOD） | 解放のしかた mid（攻め指定は起きない） | 場所 × 2 ＋ 3 | ― |
| 最中に戻る：壁の向こうの反応（LIVE） | 壊れた後の出来事ごと | 場所5 × 段階3 × **3**＝45 | live.場所.段階 × 2（dungeon.2 だけ1）＝29 |
| 　体の感覚（FEEL／FEEL_LIGHT） | 同上 | recv 段階3 × 3、top 3×3、軽い 3×2 | feel.recv 2×3、feel.top 2,2,1 |
| 　性格ごとの反応（REACT） | 同上 | persona9 × 段階3 × **3**＝81 | react.persona.段階 × 2＝54 |
| 　自分から求める（ENJOY） | 段階2で5割 | recv 4・top 4 | recv 3・top 2 |
| 　甘イキが止まらない（SWEET） | 段階1以上・激しい出来事、1回の遊びで2度まで | 5パターン（各：導入 recv/top・喘ぎ2・中・結び） | ― |
| 　間（LULL）・解放（END） | 出来事なし／時間切れ | 段階3 × 2、段階3 × 2 | end.段階 × 1 |
| 壁の向こうの住人（BEHIND） | 2人目以降の住人がいる時、途中で出くわす | 下表 | behind.* 20文 |
| 攻め指定の結末 | hardTop | TOP_RELEASE 2、TOP_AFTER 3、返り討ち 場所×1 | ― |

壁の向こうの住人（solo-hole-behind.js）：来る（1人3／複数3）→ 見え方（発情の見え方3段階×2）→ 気づく3／気づかない2 →
1人：助ける3・知らない人を助ける2・立ち去る3／複数：率先して助ける3・迷い3＋先を越される3・制止2（失敗2）・話し合い3＋各自の発言（助ける3・手を出す3・去る2）＋決定（2・2・2）→
手を出す：挿入 pen 3／指 finger 3／焦らす tease 3／跨る ride 3／お仕置き punish 3／加わる join 3 → 本人は知らない unaware 3／感じる feel 2 → 事のあと 助ける2・去る2 → 救出された rescued 3（最中なら 2・攻め 2）・後で気づく 2。
男性向け：pen 2・finger 2・tease 2・ride 2・punish 2・unaware 3・feel 2・feel.other 2・rescued 2・rescued.top 1。

### 3-2. 分岐の軸ごとの文数

| 軸 | 内容 | 文数 |
|---|---|---|
| 性別（はまっている本人） | 女性：BEYOND 20/場所そのまま。男性：女性の体前提の24文（toilet 6・lab 5・show 4・dungeon 6・white 3）を男性の体で書き直した版に差し替え。**性別未指定：その24文を外すので 76文**（場所 14〜17） | 書き直し 24 |
| 性別（壁の向こうの住人） | 手を出す側が女性なら指、それ以外は挿入（behind の pen／finger） | pen 3・finger 3 |
| 男×男・男×女・女×女・女攻め×男・ふたなり | 「組」の書き分けは無い（相手はモブ）。ふたなり専用文 0（`Pos.isF` が false になるだけ） | 0 |
| 受け攻め | 攻め指定（hardTop）：BEYOND_HARD 20・TOP_RELEASE 2・TOP_AFTER 3・返り討ち 5。攻め寄り（.top）は下記のとおり**到達しない** | 30 |
| persona | 9種すべて固有（polite も独自の文あり） | 小説調 MIND 5・CONFUSE 6・こちら側の反応 2・AFTER.hold 1・REACT 9（各 persona）／男性向け confuse 5・after.hold 1・react 6 |
| 口調 | 共通変換のみ | 0 |
| 快楽の段階 | 最中に戻る：0抵抗／1揺らぐ／2享受。解放後：hold／broken／fall | LIVE・FEEL・REACT・END・LULL が段階ごと |
| 場所 | 公衆トイレ／魔術師の研究室／見世物小屋／ダンジョンの罠／白い部屋 | BEYOND 20・LIVE 9・BREAK 2・THIS 3・BEYOND_HARD 4・返り討ち 1（各場所） |
| 嗜虐 | なし | 0 |
| 作風 | 小説調／男性向け | 男性向け 240文 |
| 長い版 | Thick4.flood（最初の波） | 13（うち TOP 4 は到達しない） |

### 3-3. 理論上のパターン数

- 壁の向こう1件（小説調・女性・1場所）：20 ×（落差なし＋CONTRAST 12）＝ **260** → 5場所で 1,300。性別未指定だと 76 × 13 ＝ 988。
- 同（男性向け・トイレ）：（20＋8）×（なし＋5）＝ **168**（lab 150・show 144・dungeon 150・white 144、計 756）。
- 最中に戻る1件（小説調・1場所・1 persona）：出来事20 ×（LIVE 3＋なし）× FEEL 3 × REACT 3 ＝ 720（段階0・1）、段階2は ×（ENJOY 4＋なし）＝ 3,600 → 1場所1 persona で 5,040、**5場所 × 9 persona ＝ 226,800**。
- 同（男性向け・トイレ）：28 ×（2＋1）× 2 × 2 ＝ 336（段階0・1）、段階2 ×4 → 1 persona 2,016。
- 一気に戻る解放：RELEASE 3 × FLOOD 3 ＝ 9 → 波ごとに CONFUSE 6（persona）×（絶頂：DG.CLIMAX 3 × 共通の声）→ 余韻 hold は **persona ごとに1文**。

### 3-4. 薄い箇所

- **「攻め寄り（.top）」の文がすべて到達不能**：本体は `topMe = HK.Pos.vsNpc(h,'') === 'top'` で分岐するが、`vsNpc` が 'top' を返すのは自分で「攻め」を選んだ人（hardTop）だけで、hardTop は壁の向こう・最中に戻る・解放の各処理より前に専用の流れへ抜ける。20,000回の実行でも一度も引かれなかった。対象：小説調 BEYOND_TOP 8・DRIP_TOP 4・FEEL.top 9・ENJOY.top 4・SWEET の top 5・Thick4 の FLOOD_TOP/TOP_F 4、男性向け beyondTop 3・contrast.top 2・leak.top 2・flood.top 2・wave.top 2・feel.top.* 5・enjoy.top 2・behind.rescued.top 1（計 約53文が死に文）。逆に `confuse.<persona>.top` は引かれるが未登録（使われる前に抜けるので実害なし）。
- solo-hole.js の `var BEYOND`（8文）は参照されていない（`HoleMore.BEYOND` を使う）。
- **性別未指定のとき壁の向こうが 76文に減る**（女性用24文を外すだけで、代わりの中立文が無い）。
- 男性向けの壁の向こうは show・white が **4文**ずつ、余韻 hold・解放 end・drip は **1文**、live.dungeon.2・feel.top.2 も1文。
- 小説調でも、解放後の余韻 hold は **persona ごとに1文**、返り討ちは場所ごとに1文、PEEK 3、LATE_IN 2。
- 男性向けは「最中に戻る」「解放」に厚いが、遮断中の「待機・想像・数える・眠り・こちら側に人が来る・待つ体」には男性向けの差し替えが無い（遮断中は平然としている設計なので意図どおりの可能性あり）。
- 嗜虐の分岐なし。

---

## 4. 常識改変（solo-kaihen*.js）

ファイル：solo-kaihen.js（本体）、solo-kaihen-data.js（`HK.KAIHEN`）、solo-kaihen-more.js（客・施術の追加）、solo-kaihen-voice.js（persona ごとの台詞）、solo-kaihen-ero.js（男性向け）。

全断片 1,489／本文 953（＋solo-thick4.js の常識改変専用 16）。男性向け **168キー・268文**。

### 4-1. R18場面の種類と文の数

| 場面 | 発生条件 | 小説調 | 男性向け |
|---|---|---|---|
| 施術（男性の受け手・基本） | 施す側（giver）が客・住人に施す。受け攻めで候補を絞る | 舞台5 × **12施術**＝60施術。本文：導入 1〜2 ＋ 続き 1（舞台ごと 35／34／31／30／29、計159） | act.＜施術名＞ 1〜2 ＋ act2 1〜2 が **60施術中30施術だけ**（舞台ごとに最初の6施術）。残り30は小説調の文＋種類ごとの続き `kind.*`（2文） |
| 攻めの施術（施す側が攻め） | `Pos.order` で施す側が先頭 | 舞台 × 2施術（計10・24文） | 10施術すべて act／act2 各1 |
| 女性上位の攻めの施術 | 施す側が女性の攻め | 舞台 × 2施術（計10・23文） | 10施術すべて act／act2 各1 |
| 女性どうし／受け手が女性（FF） | 受け手が女性、または女×女 | 舞台 × （施す give 2＋受ける take 2）＝20施術・21文、絶頂 give 4・take 3 | ff.give 2・ff.take 2 |
| 絶頂（施術の種類ごと） | 毎回 | hand 9・mouth 8・in 8・machine 8・face 4・top 6・topF 2 | 各 2（machine・face 1） |
| 施す側の絶頂（GCLIMAX） | 施す側の快感が100 | 9 | 3 |
| 施す側の喘ぎ（MOAN／MOAN_P） | in・top の施術で 4〜8割 | 共通15 ＋ persona × 6 | moan 7 ＋ persona × 3、攻め用 moanTop 段階3×3〜4 |
| 心の声（INNER／INNER_TOP） | in・mouth・top で 2〜4割 | 12／4 | 5／4 |
| 受け手の反応（TAKER） | 住人が受け手 | calm 7・shy 6・doubt 6 ＋ persona（TAKER 7・DOUBT 4） | calm 3・shy 2・doubt 2 |
| 流れ作業・二人同時・世間話・立ち会い・トラブル・ノリノリ（FLOW） | モブ客のときのくじ | rush 3＋結び4、double 3＋3、talk 4、watch 3＋3、mishap 5、nori 4 | ― |
| 小説調の山場（Thick4.scene） | 住人の受け手は毎回、モブは3回に1回 | solo-thick4 の SCN.kaihen in 6・ride 4・serve 2・ff 2 ＋ FLAVOR 2 | （使わない） |
| 体の違和感（BODY） | 快感40超で 12%〜 | 12 | 4 |
| 空き時間（同僚どうしの練習／独り） | 客が来ない | 本体に直書き 約12 ＋ persona の IDLE 2 | idle 2 |
| ハプニング（EVENTS） | くじ | 16種・31文 | **5種**（self・reverse・machine・double・camera）×2 |
| 違和感（GLITCH・舞台 glitch） | 改変のほころび | 16 ＋ 舞台 × 3 | ― |
| 気づき（AWAKE：正気に戻る／続ける／隠す／打ち消す） | 違和感が閾値超え | 3・3・3・2 ＋ persona × 4 | ― |
| 再改変（RESET） | 上司に見抜かれる | 3 | ― |
| 正気の人（OUT：見る・言う・施術される・逃げる・呑まれる） | 改変されていない住人 | 3・2・2・2・2 ＋ persona × 3 | out.taken 2（未到達） |
| 施す側の決め台詞（舞台 lines） | 施術時、エゴグラムの最上位因子 | 舞台5 × 因子5 × 4＝100 | lines.舞台.因子 × 2＝50 |
| 受付・相談（consult）・客の名前（npc） | 毎回 | 舞台 × 12、舞台 × 20 名 | ― |

### 4-2. 分岐の軸ごとの文数

| 軸 | 内容 | 文数（施術本文） |
|---|---|---|
| 男→男（竿前提） | 基本60施術（モブ客はすべて男性） | 159（男性向け 30施術分 act 35＋act2 35＝70） |
| 女攻め→男 | TOP_ACTS_F 10施術 | 23（男性向け 20、climax.topF 2、kind.topF 1） |
| 攻め（男女問わず）→ | TOP_ACTS 10施術 | 24（男性向け 20、climax.top 2） |
| 女×女／受け手が女性 | FF_ACTS 20施術 | 21 ＋ 絶頂7（男性向け ff 4） |
| ふたなり | 専用文なし（`Pos.isF` が false → 竿前提の文） | 0 |
| persona | 9種固有（VOICE：GIVER 11・TAKER 7・DOUBT 4・AWAKE 4・OUT 3・IDLE 2〜3、MOAN_P 6） | 小説調 280＋54、男性向け moan.persona 27 |
| エゴグラム因子（CP/NP/A/FC/AC） | 施す側の決め台詞 | 100（男性向け 50） |
| 口調 | 共通変換のみ | 0 |
| 快楽の段階 | 喘ぎは共通の Ero.moan（0こらえる／1とろける／2崩れる）。固有は moanTop 0〜2 のみ | moanTop 10 |
| 嗜虐 | Thick4.rollSad（共通の CHOKE/ROUGH）。箱庭固有 0 | 0 |
| 作風 | 小説調／男性向け（描写「ぼかす」lew=low では差し替えない） | 男性向け 268 |
| 長い版 | Thick4.scene ＋ 常識改変専用の段落 | 16 |

### 4-3. 理論上のパターン数

- モブ客への基本施術1回（小説調・in の施術）：導入 2 × 続き 1 ×（喘ぎ：共通15＋persona 6）×（心の声なし＋12）× 絶頂 in 8 ＝ 2 × 21 × 13 × 8 ≒ **4,368**（客の名前20・採取量の数値は除く）。
- 同（男性向け・登録ありの施術）：act 2 × act2 2 ×（moan 7＋persona 3）×（inner なし＋5）× climax.in 2 ＝ **480**。登録のない30施術は「小説調の導入×続き×kind.in 2×…」。
- 施術の種類：60＋攻め10＋女性攻め10＋女性どうし20 ＝ **100施術**（舞台ごとに 20）。

### 4-4. 薄い箇所

- **男性向けの差し替えが基本60施術の半分（30施術）にしか無い**：solo-kaihen-more.js で足した各舞台の7〜12番目（正常位採取・後背位採取・対面座位・ベッドメイキング・ルームサービス・デスクの上・給湯室・湯船での繋がり・マットでの密着・スクワット補助（挿入）など、ほぼ挿入系）が act／act2 とも未登録。20,000回の実行で 60キーが「引いたが無い」状態だった（各 700〜1,900回）。
- **ハプニング16種のうち11種に男性向けが無い**（audit・award・blackout・boss・break・complaint・diary・friend・menu・regular・rookie）。
- 女性どうし（FF）は舞台ごとに 4施術・各1文と少なく、男性向けも give 2・take 2 だけ。
- 男性向け `kind.face`・`kind.machine`・`kind.top`・`kind.topF`・`moanTop.0`・`out.taken` は実行で一度も引かれなかった（face／machine／top の施術はすべて act2 があるため続きの kind に来ない）。
- 小説調でも絶頂 face 4・topF 2 は少ない。
- 嗜虐は共通部品任せで固有文 0。

---

## 5. サキュバスの一夜（solo-succubus*.js）

ファイル：solo-succubus.js（本体）、solo-succubus-data.js、solo-succubus-more.js（獲物54種・台詞追加）、solo-succubus-types.js（誘惑の型10種・型×persona の台詞）、solo-succubus-kohyo.js（先輩の講評。非性的）、solo-succubus-ero.js（男性向け）。

全断片 1,574／本文 1,021（＋solo-thick4.js 専用 16）。男性向け **48キー・119文**。

### 5-1. R18場面の種類と文の数

| 場面 | 発生条件 | 小説調 | 男性向け |
|---|---|---|---|
| 変身・魅力診断 | 開始 | TRANSFORM 9 | ― |
| 声をかける（入り方＋型の誘い） | 1時間ごと | FLOW 7（13）、型の誘い ap 3〜4 × 型の台詞（型×persona×2） | ― |
| 成功・大成功：搾精（受け入れて搾る tk） | 誘惑の出来 15以上 | 型10 × **3**＝30（型の台詞 tk：型×persona×2＝180） | tk.型 × **2**＝20 |
| 　同（抱いて搾る top：サキュバスが攻め） | `vsNpc==='top'`、リバは半々 | 型10 × 2＝20 | top.型 × 2＝20、女性が攻めなら **全型共通の topf 4** |
| 　絶頂・吸った量（CLIMAX） | 成功時（山場にしない時） | 12 | 5 ＋ climax.in 2 |
| 　大成功の追い文（BIG） | 出来 45以上 | 9 | 4 |
| 　小説調の山場（Thick4.scene） | 成功で逆転・インキュバスでない時 | solo-thick4 の SCN.succubus in 4・ride 8・serve 2 ＋ FLAVOR 2 | （使わない） |
| 　逆に搾られる（REVERSE） | 体力自慢の獲物 | 4／攻め 2／攻め指定 2 | 2／2／2（＋topf 2） |
| あと一歩（HALF） | 出来 −5〜15 | 9 | 3 |
| 失敗（FAIL） | 出来 −5未満 | 因子5 × 6 ＋ 型10 × 2 | ― |
| 感じすぎ（MELT） | 昂り・技巧・獲物で確率 | 12／攻め 4／攻め指定 4／ぼかす 3、声 persona × 3、余韻 8 | melt 5・melt.top 3・melt.topf 3・melt.hard 4、voice.melt.persona × 3、melt.after 4 |
| ハプニング（EVENTS） | くじ | 16種・25文 | **4種**（couple・sens・fan・full）6文 |
| 退魔師・天使 | 聖職者などの獲物で大失敗 | 本体に直書き | ― |
| 共闘（二人で一人を搾る） | 二人の NP・FC | 直書き1 | team 1 |
| 取り合い（RIVAL） | 同じ獲物 | 4 | ― |
| 先輩のアドバイス・講評 | 先輩サキュバス役がいる | SENPAI・VOICE.SEN・kohyo（非性的） | ― |

### 5-2. 分岐の軸ごとの文数

| 軸 | 内容 | 文数（搾精の本文） |
|---|---|---|
| 性別の組 | 獲物は**男性 NPC 固定**（獲物54種）。サキュバス側の性別で書き分けるのは「女性サキュバスが攻め」だけ（男性向け topf 4・melt.topf 3・reverse.topf 2、小説調は共通 FM.fixWith で置換）。男性サキュバス（男×男）・女×女・ふたなりの専用文 0（tk は性別を問わない書き方） | 9 |
| 受け攻め | 受け入れて搾る tk／抱いて搾る top／攻め指定 hard | tk 30・top 20・MELT_HARD 4・REVERSE_HARD 2（男性向け 20・20・4・2） |
| 誘惑の型（エゴグラム上位2因子） | 10型（女王様・トレーナー・ママ・妹・分析・役者・パーティ・小悪魔・献身・誘惑） | 型ごと ap 3〜4・tk 3・top 2・fail 2 |
| persona | 9種固有。型の台詞 QUOTE（型10 × 誘い/搾精 × persona9 × 2＝360）、VOICE（OPEN 5・WIN 5・FAIL 5・MELT 3・先輩用 7） | 小説調 360＋225、男性向け voice.melt 27 |
| 獲物 | 54種（反応 re 1）・狩り場4 | 54 |
| 口調 | 共通変換のみ（QUOTE は persona で引く） | 0 |
| 快楽の段階 | 結果の5段階（失敗／あと一歩／成功／大成功／感じすぎ）。喘ぎは共通の Ero.moan | ― |
| 嗜虐 | Thick4.rollSad（共通）。固有 0 | 0 |
| 作風 | 小説調／男性向け | 男性向け 119 |
| 長い版 | Thick4.scene ＋ サキュバス専用の段落 | 16 |

### 5-3. 理論上のパターン数

- 成功1回（小説調・型と persona 固定）：誘い ap 3 × 台詞 2 × 搾精 tk 3 × 台詞 2 × 絶頂 12 ＝ **432**（大成功は × BIG 9、獲物54・狩り場の場所は除く）。
- 同（男性向け）：ap 3 × 2 × tk 2 × 台詞 2 ×（climax 5＋in 2）＝ **168**。女性サキュバスが攻めの時は型に関係なく topf 4 → 3 × 2 × 4 × 5 ＝ 120 で、**10型の個性が消える**。
- 感じすぎ1回：MELT 12 ×（共通の声 or VOICE.MELT 3）× MELT_AFTER 8 ＝ **288**、男性向け 5 × 3 × 4 ＝ **60**。

### 5-4. 薄い箇所

- **死に文**：誘惑の型が solo-succubus-types.js の `SB.typeOf` で必ず10型のどれかになり、どの型にも `tk`・`ap` があるため、旧来の `SB.TAKE`（因子5×6＝30）・`SB.TAKE_TOP`（5×4＝20）・`SB.STYLE[*].approach`（5×8＝40）の **計90文は到達しない**。
- 男性向けは型ごとに tk 2・top 2 しかなく、**女性が攻めの時は全型で topf 4 を共用**。
- **ハプニング16種のうち11種に男性向けが無い**（dawn・drunk・eye・holy・host・love・moon・police・rain・rival・tail。20,000回で各4,700〜6,200回引いて未登録）。
- あと一歩（HALF）男性向け 3、BIG 4、REVERSE 2 と少ない。
- 獲物は男性固定。サキュバス本人が男性の場合の書き分け（インキュバスとして抱く・受ける）が無い。
- 小説調の山場（Thick4）の serve は 2 文のみ。

---

## 6. 催眠（solo-saimin*.js）

ファイル：solo-saimin.js（本体）、solo-saimin-data.js（`HK.SAIMIN`）、solo-saimin-more.js（暗示9種追加）、solo-saimin-sex.js（本番の暗示4種・我に返る・その後）、solo-saimin-ero.js（男性向け）。

全断片 1,212／本文 824（＋solo-thick4.js 専用 16）。男性向け **164キー・202文**。

### 6-1. R18場面の種類と文の数

| 場面 | 発生条件 | 小説調 | 男性向け |
|---|---|---|---|
| かける相手の登場 | 相手5種（同僚・恋人・友人・恨み・ストーカー） | 各 intro 3・名前 6 | ― |
| かけ方・誘導（METHODS・INDUCE） | 道具7種 | 各 intro 2、深い8・浅い7・失敗8 | ― |
| かかった様子（TRANCE） | 誘導成功 | persona × 8（攻め側 persona × 6） | ― |
| 性的な暗示（25種）：暗示の言葉（cmd） | 暗示を選ぶ | 計 74（攻め 11・女性どうし 4） | （cmd の差し替えなし） |
| 　受け入れた（full） | 点数≥8 | 87（攻め fullTop 27、女×女 ff 23・ffTop 17） | full 49・fullTop 18・ff 22・ffTop 12 |
| 　半分だけ（part） | 点数 −10〜8 | 35（攻め partTop 7、ffPart 1・ffTopPart 1） | part 26・partTop 3・ffPart 22・ffTopPart 10 |
| 　拒んだ（RESIST） | 点数<−10 | 8 ＋ persona × 4 | ― |
| 非性的な暗示（12種：頭が良くなる・本音・にゃん・犬・王様・歌・レモン・秘密・赤面・ニワトリ・眠る・褒め） | 同上 | cmd 18・full 32・part 12・fullTop 6・softFull 2 | 0（不要） |
| 小説調の山場（Thick4.scene） | 本番の暗示で達した 85% など | solo-thick4 の SCN.saimin in 8・ride 4・ff 2 ＋ FLAVOR 2 | （使わない） |
| 中に出されて我に返る（SNAP） | 本番の暗示・g.snap | 5／攻め 2／女性攻め 2／女×女 2・2 | 2／2／2／1・1 |
| 最中に我に返る（MID） | 行為中、抵抗・浅さで | oral 2・in 3・touch 2・kiss 1（攻め 2・1・2・1、女×女 in 2、女×女攻め 1・1） | MID 2・2・2、MID_TOP in 1、MID_FF 1、MID_FF_TOP 1・1 |
| 我に返った後：流される（SWEPT） | 快楽堕ち・AC・FC | 4／攻め 2／最中 3・攻め最中 1／女×女 2・2 | 2／1／2・1／1・1 |
| 　通報（REPORT）・逃げる（FLEE） | CP・A／AC | 3・3（最中 3・3） | 0 |
| ハプニング（EVENTS） | くじ | 15種・28文 | ― |
| その後（AFTER：14の結末） | 最後 | 14 × 4＝56、攻め fall 2、ぼかす 5種 9、台詞 persona × 3種 | fall 2・body 2・depend 2、AFTER_TOP.fall 2、AFTER_FF 3種×1 |
| 我に返った後のその後（SNAP_AFTER） | 通報・堕ち | report 2・fall 2（攻め fall 2・女×女 fall 2） | fall 1（攻め 1・女×女 1） |
| 絶頂の声（攻め側 CLIMAX_TOP） | かけられた側が攻めで達した | persona × 2、女×女 3 | （受け側は共通 Ero.moan） |

### 6-2. 分岐の軸ごとの文数

| 軸 | 内容 | 文数（性的な暗示の本文） |
|---|---|---|
| 通常（かける側が竿・かけられた側が受け。男×男・男×女） | full／part | 87＋35（男性向け 49＋26） |
| かけられた側が攻め（女攻め×男 含む） | fullTop／partTop／cmdTop。fullTop の無い性的な暗示は選ばれない | 27＋7＋11（男性向け 18＋3） |
| 女性攻め専用 | SNAP_TOP_F | 2（男性向け 2） |
| 女×女 | ff／ffTop／ffPart／ffTopPart／cmdFF。無い暗示は選ばれないか full に戻る | 23＋17＋1＋1＋4（男性向け 22＋12＋22＋10） |
| ふたなり | 専用文なし | 0 |
| persona | 9種固有：TRANCE 8・TRANCE_TOP 6・RESIST_SAY 4・AFTER_SAY 1×3・AFTER_SAY_TOP 1×2・CLIMAX_TOP 2 | 小説調 計 225 |
| かける相手 | 5種（暗示の選びやすさ・その後に影響） | intro 3 × 5 |
| 口調 | 共通変換のみ | 0 |
| 快楽の段階 | 受け入れ度 full／part／ng、快楽堕ち（その後の結末）、喘ぎは共通 Ero.moan 0〜2 | ― |
| 嗜虐 | Thick4.rollSad（共通）。固有 0 | 0 |
| 作風 | 小説調／男性向け | 男性向け 202 |
| 長い版 | Thick4.scene ＋ 催眠専用の段落 | 16 |

### 6-3. 理論上のパターン数

- 性的な暗示1回（受け入れた・通常）：Σ（暗示の言葉 × full）＝ **276**（25暗示の合計。例：感度上昇 4×4＝16、甘えん坊 4×7＝28、声が我慢できない 2×2＝4）。
- 同（男性向け）：Σ（暗示の言葉 × 男性向け full）＝ **146**（25暗示で各 2〜8）。
- 我に返る → その後：SNAP 5 ×（流される 4 or 通報 3 or 逃げる 3）× その後 4 × persona の一言。

### 6-4. 薄い箇所

- **男性向けは1キー1〜2文が大半**（164キー・202文で、平均 1.2文/キー）。暗示1種あたり full 2・part 1・fullTop 1 程度。
- 攻め側の「半分だけ」partTop：男性向けは 25暗示中 3文だけ。実行では 16暗示で partTop を引いて未登録（amae・heat・kiss・mirror・nakadashi・normal・obey・onedari・pet・saigo・scent・seduce・serve・ukeire ほか）。
- **その後（AFTER）14結末のうち男性向けは fall・body・depend の3つだけ**。angry・sweet・forget・counter・shy・couple・revenge・report・peace 等、攻め版 AFTER_TOP 10結末、女×女版 AFTER_FF 8結末が実行で未登録だった。
- 通報（REPORT／REPORT_MID）・逃げる（FLEE／FLEE_MID）・SNAP_AFTER.report に男性向け無し（REPORT_MID 513回・SNAP_AFTER.report 524回引いて未登録）。
- 小説調でも女×女の part は ffPart 1・ffTopPart 1 しか無く、ほぼ通常の part に戻る（男性向けの方が 22・10 と多い逆転状態）。
- 小説調の MID.kiss 1、SWEPT_MID_TOP 1、MID_FF_TOP 各1。
- 男性向けは女×女の半分（ffPart）など一部が実行で一度も引かれない（ff かつ part はまれ）。

---

## 7. 比較表

「固有文の総数」は、その箱庭のファイルにある本文（15字以上、`why`・ラベル・結果まとめを除く）。括弧内は全断片（名前・ラベル込み）。solo-thick4.js の箱庭専用段落は＋で別記。

| 箱庭 | R18場面の種類数 | 固有文の総数（本文／全断片） | うち男性向け | 主な分岐軸 |
|---|---|---|---|---|
| エロトラップダンジョン | 約20（罠・魔物・宝箱・泉・幻惑・囚われ人・捕縛・反応・こらえる・絶頂・寸止め・揺らぎ・陥落寸前・陥落山場・結末・ボス・夢・仲間の見せつけ・慰め合い/暴走・手招き） | 1,425（2,171） | 0（作風の切替なし） | 迷宮テーマ5、persona 8（敬語は流用）、堕ち度5段階、攻め指定 |
| ダンジョンRPG | 0 | 0 | 0 | ―（全年齢の箱庭） |
| 感覚遮断穴 | 約22（壁の向こう・落差・待機・想像・数える・眠り・叫ぶ・もがく・人が来る・待つ体・揺らぎ・解放4種・波・余韻/陥落・覗く・遮断が壊れる・最中の反応・甘イキ・間・壁の向こうの住人・返り討ち） | 956（1,304）＋13 | 240（99キー） | 場所5、解放のしかた4、最中の段階3、persona 9、本人の性別（女/男/未指定）、攻め指定 |
| 常識改変 | 約16（施術・攻めの施術・女性上位・女性どうし・絶頂・施す側の絶頂・喘ぎ・心の声・受け手の反応・流れ作業等6種・山場・体の違和感・空き時間・ハプニング・違和感/気づき/再改変・正気の人） | 953（1,489）＋16 | 268（168キー） | 舞台5 × 施術100、受け攻め・性別（男受け/攻め/女性攻め/女×女）、persona 9、エゴ因子5 |
| サキュバスの一夜 | 約13（変身・誘い・成功/大成功・抱いて搾る・逆に搾られる・あと一歩・失敗・感じすぎ・ハプニング・退魔師/天使・共闘・取り合い・講評） | 1,021（1,574）＋16 | 119（48キー） | 誘惑の型10、persona 9、獲物54、結果5段階、受け攻め（女性攻めのみ別） |
| 催眠 | 約14（相手・誘導・トランス・性的な暗示25種・非性的な暗示12種・拒む・山場・中出しで我に返る・最中に我に返る・流される/通報/逃げる・ハプニング・その後14結末） | 824（1,212）＋16 | 202（164キー） | 暗示37（性的25）、受け入れ度、受け攻め・女×女、persona 9、相手5 |

### 7-1. 基準づくりのための横並び（同じ「役割」の場面の文数）

| 役割 | ダンジョン | 遮断穴 | 常識改変 | サキュバス | 催眠 |
|---|---|---|---|---|---|
| 山場の本文（1回の行為の中心） | 罠 334＋魔物 67 | 壁の向こう 100（＋男性 24） | 施術 159（基本60）＋47（攻め20）＋21（FF） | tk 30・top 20 | 性的な暗示 full 87・fullTop 27・ff 23・ffTop 17 |
| 絶頂の文 | CLIMAX 120（persona × 段階） | DG.CLIMAX を流用（固有 0）＋CONFUSE 54 | CLIMAX 45＋GCLIMAX 9 | CLIMAX 12＋BIG 9 | 固有 0（共通の声）＋CLIMAX_TOP 21 |
| persona ごとの反応 | TAILS 20・ENDURE 3・RICH 10（8種） | MIND 5・CONFUSE 6・REACT 9・THIS 2・AFTER 1 | VOICE 31・MOAN_P 6 | QUOTE 40・VOICE 25 | TRANCE 8・TRANCE_TOP 6・RESIST 4・AFTER_SAY 3・AFTER_SAY_TOP 2・CLIMAX_TOP 2 |
| 長い版（固有） | 16 | 13（到達 9） | 16 | 16 | 16 |
| 男性向け／山場1種あたり | ― | 場所ごと 4〜8 | 施術ごと 2〜4（半数は 0） | 型ごと tk 2・top 2 | 暗示の変化形ごと 1〜2 |
| 女性攻め×男の専用文 | 2 | 0 | 23（＋男性向け 23） | 0（男性向け 9） | 2（＋男性向け 2） |
| 女×女の専用文 | 0 | 0 | 28（＋男性向け 4） | 0 | 暗示 46＋我に返る・その後 17（＋男性向け 暗示 66・その他 11） |
| 嗜虐の固有文 | 0 | 0 | 0（共通） | 0（共通） | 0（共通） |

### 7-2. 到達しない文（死に文）のまとめ

| 箱庭 | 対象 | 文数 | 理由 |
|---|---|---|---|
| 感覚遮断穴 | `.top`（攻め寄り）系すべて：BEYOND_TOP・DRIP_TOP・FEEL.top・ENJOY.top・SWEET.top・Thick4 FLOOD_TOP/TOP_F、男性向けの *.top・beyondTop 等 | 約53 | `Pos.vsNpc` が 'top' を返すのは hardTop だけで、hardTop は別の流れへ先に抜ける |
| 感覚遮断穴 | solo-hole.js の `var BEYOND` | 8 | 参照なし |
| サキュバスの一夜 | `SB.TAKE`・`SB.TAKE_TOP`・`SB.STYLE[*].approach` | 90 | 型が必ず `typeOf` の10型になり、tk・ap が常にある |
| 常識改変 | 男性向け kind.face／machine／top／topF・moanTop.0・out.taken | 9 | 実行2万回で一度も引かれない（act2 が先に使われる等） |

### 7-3. 均すときの目安（観察から）

- 「山場1種あたりの男性向け」は、遮断穴（4〜8）＞サキュバス（2）≒催眠（1〜2）＞常識改変（後半の30施術は 0）。基準を「山場1種につき男性向け 2文以上」にすると、常識改変の30施術・ハプニング11種、サキュバスのハプニング11種、催眠のその後11結末・partTop が不足。
- 「persona ごとの反応」はダンジョン（20/段階込み）が最厚、遮断穴が次。サキュバスは型×persona の台詞（各2）で数は多いが1セル2文。
- 性別の組は、ダンジョン・遮断穴・サキュバスで「女攻め×男」「女×女」の専用文がほぼ 0。常識改変と催眠だけが書き分けている。
- 長い版（固有）はどの箱庭も 13〜16 でそろっている。
