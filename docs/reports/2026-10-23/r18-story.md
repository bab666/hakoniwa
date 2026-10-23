# R18シーンのパターン数調査（6箱庭）

対象：`/home/user/hakoniwa/hakoniwa-full/js`（R18版）。読み取りのみ。

## 数え方

- acorn（`/opt/node-tools/node_modules/acorn`）でJSを構文解析し、次のものを機械的に数えた。
  - 文字列の配列 `['…','…']` の要素数
  - `L('a|b|c')` などの `split('|')` 後の要素数
  - 1文だけをプロパティに直書きしたもの（25字以上の日本語）は1と数えた
  - 日本語を含む8字以上の要素だけを「文」とした。`L('…|…|')` の末尾の空要素（「何も足さない」選択肢）、`'start'` などのキー配列、`why`/`label` は数えていない
- 実行時の中身は、`index.html` に書かれた290本のスクリプトを同じ順で node の vm に読み込んで確認した（UI系4本は DOM がないので失敗するが、データには関係しない）。これで、後から読み込まれるファイルによる上書きや差し替えを判定した。
- 使っていない文（「死に文」）は、呼び出し元のコードを読んで判定した。
- 共通部品（solo-r18-moan / r18-thick / thick-sex / pos-ff / pos-fm / ero-kit / voice / tone-lines / dark-thick / special-r18 / solo-feud-r18 など）は数えていない。各箱庭が呼ぶものを記すだけにした。
- 例外が1つある。`omega-thick.js` の前半にある **HK.TKC（段落に分けた山場の組み立て）** は、オメガ・漂流記・ゾンビの3箱庭が共有する共通部品である。そのため箱庭固有には入れず、別に数えた（下記）。
- 作業用スクリプトはスクラッチパッドの `an/` にある（`count.js`, `load.js`, `all.js`, `ship2.js`）。

### 参考：3箱庭共有の HK.TKC（omega-thick.js の1〜301行）

| ブロック | 文数 |
|---|---|
| CORE（攻めの最強因子 CP/NP/A/FC/AC × open/mid/peak/after × 6） | 120 |
| ROUGH（嗜虐 `HK.Ero.sadist` のとき30%） | 25 |
| RIDE（女攻め×男受け） | 24 |
| FF（女×女） | 24 |
| FLAV（箱庭ごとの感覚の一文。omega/ship/zombie × fl/fl2 × 4） | 24 |
| NOV（受けの喘ぎ。persona 9種 × 高まり8・絶頂6） | 126 |
| TOPV（攻めの声。因子5 × 6） | 30 |
| **合計** | **373**（8字未満の短い喘ぎを除くと368） |

**重要**：プールはどれも6本だが、`flav` で `i%3` に振り分けている。そのため、1つの箱庭で最初に引かれるのは各段落2本だけである（使い切ると他の箱庭の分から引く）。
- 1つの箱庭から見た TKC の本文は、1つの組（CORE.CP など）につき open2 × mid2 × peak2 = **8通り**が基本になる。
- 組は「攻めの因子5種＋ROUGH＋RIDE＋FF」の8種。
- M×M と M×F は書き分けておらず、同じ CORE を使う。体の性別は `Pos.isFBody` で見る。

---

## 1. 宇宙船漂流記（ship*.js）

設定は `slewd`（夜の出来事の頻度 0〜100）の1軸だけ。描写の濃さを選ぶ設定はない。

### 1-1 場面の一覧と文数

| 場面 | 発生条件 | 導入 | 最中 | 絶頂・結び | 事後 |
|---|---|---|---|---|---|
| 夜（船員どうし） | 夜ごと `slewd×0.45`。okSex の組で、家族でない。恋人か絆0.25以上（または15%の確率） | open 12（通常）／pollen 6（植物系の生命体を調べた星で35%）／civ 6（文明の儀式25%） | 共通の TKC＋固有の LEAD.night 2（＋なし） | 固有の FIN.night 3 | after 8 |
| 看病の夜 | 看病のあと。`slewd×(恋人1.2／絆0.8／0.3)` | nurseTop 5（看病する側が攻め）／nurseSick 3（病人が攻め） | TKC＋LEAD.nurse 2 | FIN.nurse 2 | nurseAfter 4 |
| 星の生命体（xeno・X2） | 探索で生命体に出会ったとき35%×`slewd`（その75%）。誘いの場面の70%。正体を知らないまま侵入される経路（invade）もある | SP（生命体ごと）79文／KIND（性質の汎用）16文。始まりから行為まで1文で書く | 長い版（1/3）：FORM 10・KIND 7・OVER 5・RESIST 10（因子5×2）・BREAK 10 | 長い版：PEAK 5 | AFTER 16（型ごと3〜4）＋REACT 14（因子5） |
| 　同・攻め指定の人 | `Pos.hardTop(a)` | TOP 10（型5×2） | 長い版：TOP_MID 3＋TOP_LINE 5 | TOP_PEAK 3 | TOP_AFTER 3 |
| 異星の生き物（古い経路） | 上の xeno が選ばれなかった25% | — | X.play 6性質×(3＋長い版1)=24／R.alien 3／alienTop 2 | — | — |
| 異種族の誘い（文明の住人） | `slewd×0.15`。原始的・生きた文明を調べたあと | lureCiv 4 | huge 4 → hugeAct 6（うち長い版2）／攻めは lureTop 2 | — | lureAfter 4 |
| 研究（文明に攫われる） | 攫われた人が攻め指定でないとき。`0.35+slewd×0.4` | lab 10 | — | — | labAfter 3（救出時） |

**型の数**：依頼文では「4種」とあるが、実装は **5種**ある。lure（誘いと分からない）・force（強引）・take（攫われる）・probe（実験）・invade（体内に入り込む）。

**生命体×型のマトリクス（実行時に計測）**：生命体は37種（LIFE 30＋追加7）なので、マス目は37×5=185ある。

| 型 | 固有文あり | 汎用のみ | 文なし（起きない） |
|---|---|---|---|
| lure | 19 | 6 | 12 |
| force | 13 | 12 | 12 |
| take | 15 | 18 | 4 |
| probe | 11 | 4 | 22 |
| invade | 14 | 0 | 23 |
| **計** | **72マス（79文）** | **40マス** | **73マス** |

- 固有文のあるマスは、ほぼ1文だけである（2文あるのは drifter.lure / sand_mind.probe / twin_silk.lure と invade の5マスだけ）。
- 選べる型が2つしかない生命体：灯り尾のカワウソ、硝子の鳥、木霊鹿、星鯨、棘狼、影蟷螂、雷エイ、地喰い大蚯蚓、霜の多頭竜、甲殻の守り手、環蛇、双頭の絹蛇。

### 1-2 分岐の軸ごとの文数

- **性別の組（固有文）**
  - 夜・看病の本文は、短い版の pen 10／ride 6／ff 8 と nursePen 3／Ride 2／Ff 2 がある。しかし後述のとおり R18 版では使われず、本文はすべて TKC（CORE/RIDE/FF）になる。
  - 異種姦は人間の性別を問わない書き方なので、性別の軸はない。ふたなり専用の文もない。
- **性格／persona**
  - 固有の文は、エゴグラムの最強因子5種で分かれる。X2.REACT 14、xeno-thick の RESIST 10・BREAK 10・TOP_LINE 5。
  - persona 9種で分かれる文は TKC の NOV（共通）だけである。
- **口調**：固有の書き分けはない（台詞の口調変換は共通部品に任せている）。
- **関係**：恋人か絆かは「誰が組になるか」の重みにだけ使う。関係ごとの文はない。導入の違いは「通常／花粉（媚薬に近い）／儀式／看病」の4種。
- **合意／非合意**
  - 合意：夜・看病（44文）
  - 曖昧：花粉、lure（誘いと分からない）
  - 非合意：force/take/probe/invade、研究、古い経路の hostile
- **嗜虐**：TKC の ROUGH（共通）だけ。固有の文はない。
- **描写の濃さ**
  - 夜・看病は、Voice が読み込まれていれば必ず TKC の長い版になる。
  - 生命体は1/3の確率で長い版（ship-xeno-thick.js）になる。
  - 男性向けの作風はない。

### 1-3 理論上のパターン数

- **夜**：導入(12＋6＋6) × LEAD 3 × FIN 3 × after 8 = **1,728**。これに TKC 本文8（組ごと）を掛けて、組ごとに **13,824**。さらに喘ぎ・台詞（共通）の差し込みがある。
- **看病**：(5＋3) × LEAD 2 × FIN 2 × after 4 = **128**。TKC を掛けると組ごとに1,024。
- **生命体（短い版）**：1マスあたり 本文(SP1〜2 と、K がある場合は25%で汎用) × AFTER 3〜4 × 反応(なし＋その因子の2〜3)。
  - 例：浮遊クラゲ×lure は (2＋2) × 3 × 4 = 48。
  - 全体では、文のある112マス × 平均およそ1.4本文 × 3.2 × 3.6 ≒ **1,800前後**。
- **生命体（長い版）**：上の数に、感覚2 × 抗う声2 × 崩れる声2 × OVER/PEAK 1 を掛ける。抗う声と崩れる声は因子で1つに決まる。おおむね ×8。
- **生命体の攻め版**：TOP 2 ×(短い1／長い版 TOP_MID 3 × TOP_PEAK 3 × TOP_AFTER 3 = 27)。型ごとに2＋54。
- **文明の誘い**：4 × 4 × 6 × 4 = **384**（攻めは 4×2=8）。
- **研究**：10 × 3 = **30**。

### 1-4 薄い箇所・問題点

1. **短い版の本文31文が死んでいる**。`bodyFor`・看病の `R.thick()` が null を返すのは SAFE_ON か Voice が無いときだけである。そのため R18 版では、pen 10・ride 6・ff 8・nursePen 3・nurseRide 2・nurseFf 2 が出ない。
2. **上書き**：ship-r18.js の `R.alien` 8文と `alienTop` 4文は、ship-thick.js が `R.alien = L(…)` で3文と2文に差し替えている。ship-r18.js 側の12文は読み込まれるが、使われない。
3. **lureLife 4文が死んでいる**。X2 があると、生命体の誘いは xeno に回るため。
4. **異種姦のマス目の4割が空いている**（185マス中73マス）。特に invade は23/37、probe は22/37が空。汎用の KIND は1マスに1文しかなく（friendly.lure だけ2文）、固有文のないマスでは常に同じ文になる。
5. **ship-xeno-thick の KIND・OVER・PEAK は1文ずつ**。37種すべてで同じ一文が出る。FORM はあるが、5種類×2文で、使う生命体は7種だけ。
6. 看病の LEAD・FIN が2文ずつ、文明の誘いの lureTop が2文で少ない。
7. 夜の場面に**関係（恋人／初めて／憎しみ）ごとの書き分けがない**。導入12文が関係を問わず共通。
8. TKC は、この箱庭から見ると各段落2本しかない。「一つの結果に場面が多い漂流記」で使い切りやすい（その場合は他の箱庭の分から引く）。

### 1-5 呼ぶ共通部品

HK.TKC（omega-thick.js）、HK.Voice（受けの edge/climax）、HK.Pos（order/okSex/hardTop/isF）、HK.Ero.sadist（ero-kit）、HK.egoType。

---

## 2. ゾンビの街（zombie-*.js, solo-zombie-*.js）

設定は `zlewd`（恋人たちの夜：off／fade＝ほのめかす／high＝描写する）。強姦系の場面も high か fade かで分かれる。

### 2-1 場面の一覧と文数

| 場面 | 発生条件 | 導入 | 最中 | 絶頂 | 事後・結末 |
|---|---|---|---|---|---|
| 恋人たちの夜 `z_lv_night`（zombie-love.js） | 恋人どうしで zlewd が off 以外 | nightAsk 18（persona 9×2） | high：TKC＋LEAD 2（zombie-thick）／fade：nightFade 4 | high：FIN 2 | nightAfter 4 |
| 迫る（press） | 終わりかけの街で関係を迫る（攻撃性・衝動） | press 3 | high：PRESS 2／PRESS_FF 2 | — | pressYes 2／pressNo 2 |
| 想い人・師弟の夜 `zr18_night`（solo-rel-r18.js のゾンビ節） | 恋愛相手を固定した人・師弟。part 1以降。1組2回まで | ask 4（lock 2・mentor 2） | high：fore 2・insert 2（ff 2）／fade 2 | end 2（ff 2） | after 2（lock 1・mentor 1）、兄貴分の一言は共通の ANIKI |
| ゾンビに犯される（zombie-bite → solo-zombie-love の ZT） | ゾンビに襲われたとき10%（part 3は15%）。被害者が canReceive | open 2／openM 2（仲間がいる） | high：act 2 ＋ as 9（persona ×1）＋ seen 2 ＋ memL 2／mem 3 | fill 2／fade 2 | crawl・die・dieFade・save・saveL・bitAfter・caught・caughtTop・abandon 各2。恋人の反応 SHOCK 11（zombie-assault） |
| 治療薬で触手の怪物に（zombie-cure → cureAssault） | 治療薬が失敗して怪物化。sexOK のとき60% | HIGH_OPEN 2 | AS 18（persona 9×2）＋ SEEN 3 ＋ MEM 4 | FILL 3／fade の FADE 2 | 2人目 SECOND 2 |
| 略奪者に犯される（solo-zombie-raid） | 略奪者と遭遇したとき30% | open 2／openM 2 ＋ 共通 TL の RAID_BEG | high：act 3 ＋ seen 2 ＋ act2 2（30%は共通 dark-thick の RAID）／fade 2 | — | photo 3・flee 2・kill 2・save 2・saveL 2・caught 2・abandon 2・after 2・cold 2・later 3 |

### 2-2 分岐の軸ごとの文数

- **性別**：女×女専用は PRESS_FF 2、ZT.ffHigh 4、HIGH_FF 10（死に文）。女攻め×男・ふたなり専用の文はない。強姦系は性別を問わない書き方で、受けの性別による差はない。
- **persona 9種**：nightAsk 18、AS 18、ZT.as 9 で、計45文がこの箱庭固有。ほかに TKC NOV（共通）。
- **口調**：固有の文はない。略奪者の場面で共通の tone-lines（RAID_BEG／RAID_WITNESS）を使う。
- **関係**：恋人（夜）、非恋人（迫る）、恋愛相手の固定・師弟（zr18）。恋人が居合わせたとき・恋人を思い出すときの文（SHOCK 11、memL 2、saveL 4）。
- **合意／非合意**：合意の文は 夜・迫る・zr18 で計 33＋4＋18 ≒ 55。非合意は ゾンビ・怪物・略奪者で計 約115。
- **嗜虐**：TKC の ROUGH（共通）だけ。
- **描写の濃さ**：off／fade／high の3段階。high の恋人の夜は TKC の長い版。略奪者は30%で dark-thick の長い版。

### 2-3 理論上のパターン数

- **恋人の夜 high**：ask 2（persona ごと） × LEAD 2 × FIN 2 × after 4 = 32（persona ごと）。9種で **288**、TKC を掛けると組ごとに **2,304**。
  - fade：2 × 4 × 4 = 32（persona ごと）。
- **迫る**：3 × 2 × 2 = 12（承諾・high）／3 × 2 = 6（拒否）。
- **zr18**：ask 2 × fore 2 × insert 2 × end 2 × after 1 = **16**（lock・mentor それぞれ）。
- **ゾンビ high**：open 2 × act 2 × as 1 × seen(1＋2) × mem(1＋2〜3) × fill 2 ≒ 96（persona ごと）。結末9種×2、恋人の反応を掛ける。
- **怪物 high**：2 × 2 × (1＋3) × (1＋4) × 3 = **240**（persona ごと）。
- **略奪者 high**：open 2 × act 3 × seen(1＋2) × act2 2 × photo(1＋3) = **144**。結末と後日談がある。

### 2-4 薄い箇所・問題点

1. **solo-zombie-love の HIGH 13文・HIGH_FF 10文は事実上使われない**。zombie-thick.js が `nightHigh` を包み、Voice と Pos があれば常に TKC に差し替えるため。受けが攻め指定のときだけ元に戻る。
2. **`Z.CURE_R18` 3文と `CURE_R18_FADE` 2文は、どこからも参照されていない**（grep で確認）。
3. zombie-thick の LEAD・FIN が各2文しかない。合意の本番は TKC 頼みで、箱庭固有の文が少ない。
4. ZT.as（ゾンビに襲われたときの反応）は、persona ごとに1文。
5. zr18 の after は1文ずつ。ff 版には fore がない（男女と同じ文を使う）。
6. 合意の場面が「恋人」「迫る」「固定・師弟」しかなく、嫉妬・仲直り・別れ際などの関係の書き分けがない。

### 2-5 呼ぶ共通部品

TKC、Voice、Pos（order/ff/canReceive/okSex）、Ero.sadist、HK.TL（tone-lines）、dark-thick.js（HK.DarkThick.raid）、solo-rel-r18.js（zr18・ANIKI）、special-r18（吸血鬼）。

---

## 3. 邪神村RTA（jashin*.js, solo-jashin-r18*.js）

設定は `jlewd`（頻度 0〜100）。描写の濃さを選ぶ設定はない。二人の交わりは常に共通の r18-thick（`SCEN={jashin,yakata}`）になる。非合意の長い版は jashin-dark-thick が30%で出す。

### 3-1 場面の一覧と文数

| 場面 | 発生条件 | 固有文 |
|---|---|---|
| 媚薬を盛る（到着・2日目以降の20時） | 到着時に必ず1種（膳40%・香15%・茶13%・御神酒12%・薬湯10%・枕元の香10%）。以後 `0.35+lv×0.4` | 6種：intro 13、take 15、leave 15。計 **41**（MEAL 3/EAT 3/SKIP 3 を含む） |
| 夢で神に抱かれる | 夜。r0<0.16（クトゥルフ系の神は+0.06） | DREAM 3（汎用）、DREAM_GOD 27（神ごとに1。60%）、攻めは DREAM_TOP 3。長い版 JDark dream |
| 憑依 | 取り憑かれた仲間がいて r0<0.3 | POSSESS 2／POSSESS_REV 2 ＋ 共通の pairSex（rough） |
| 清めの湯 | r0>0.88 | BATH 3／攻めは BATH_NO 2。長い版 JDark bath |
| 参加者どうし | 40%（媚薬で+15%） | MUTUAL 9／MUTUAL_FF 8／YGO_SEX 2（イゴーロナク）＋ PREG 3。配信者がいると STREAM_LEAK 4、HAME 4 |
| 村人の夜這い | 上のどれでもないとき | 受け入れ：YOBAI 7。強気・素面：YOBAI_FORCE 4 → YOBAI_ACT 4。攻め：YOBAI_TOP 2／TOP_F 3 ＋ TOP_NPC 2。拒否：YOBAI_NO 2。ドッキリ：PRANK 2。長い版 JDark yobai |
| 洞窟・場所の眷属（クライマックス） | `lv×0.6`。攻めの人は除く | CAVE 3（洞窟と、場所を置き換える12か所）、PLACE 7（場所ごとに1）、無音堂（直書き）。長い版 JDark cave |
| 生贄の儀 | 生贄。`0.35+lv×0.6` | RITUAL 5、攻めは RITUAL_TOP 3、MIKO 3。長い版 JDark ritual |
| 関係の出来事（jashin-place → climaxRel） | クライマックスで、恋人がイゴーロナクに煽られる／シュブの宴 | LUST 2、FERTILE 2／FF 2、PREG 2 |
| 神ごとの夜：シュブ＝ニグラス | 神がシュブ | FEAST 3、WINE 2、PAIR 3／PAIR_FF 3、TOP 3 ＋ TOP_NPC 2、GOAT_NO 2、GOAT 2、RITE 2、PREG 2（計24） |
| 神ごとの夜：イグ | 神がイグ | YIG_DREAM 2 ＋ WAKE 3、LAMIA 2 ＋ ACT 2 ＋ AFTER 2、LAMIA_REV 2、攻めの DREAM_TOP 2 ＋ WAKE_TOP 2（計17） |
| 神ごとの夜：チャウグナー | 神がチャウグナー | TCHO 3 ＋ ACT 3 ＋ AFTER 3、TOP 2（計11） |
| 役職×役職の夜（jashin-duo-r18） | 該当する役職の2人がそろう。okSex | **20組**（協力10・因縁10）× intro 1 ＋ ok 1 ＋ ng 1 = 60 |
| 長い版（jashin-dark-thick。夜這い・儀式・洞窟・清めの湯・夢） | 該当場面の30%（攻めの人を除く） | 邪神村専用 30 ＋ 館と共用 20 |

固有文の合計：solo-jashin-r18 153 ＋ climax 17 ＋ god 52 ＋ duo-r18 60 ＋ dark-thick（邪神村分）30 = **312**（館と共用の20を除く）。

### 3-2 分岐の軸

- **性別**
  - 女×女：MUTUAL_FF 8、FERTILE_FF 2、SHUB_PAIR_FF 3。
  - 女攻め×男：固有文はない。導入を共通の pos-fm `fixWith` で跨る書き方に直す。
  - 攻め指定の女性：YOBAI_TOP_F 3。
  - 交わりの本文は共通（R18M／R18Thick／FF）。
- **persona・口調**：固有文はない（喘ぎは共通の R18M）。
  - 気の強さ2分岐：JDark の V_STRONG／V_SOFT 各4、MID 2〜2、AFTER 2〜2。夜這いの FORCE と通常の分岐。
- **関係**：役職の組（協力／因縁）20、恋人がラミアになる（イグ）、愛憎（共通の solo-feud-r18）、恋人のLUST。
- **合意／非合意**：合意は 参加者どうし・duo の ok・シュブの PAIR。ただし媚薬で曖昧なものが多い。それ以外（夜這い・儀式・洞窟・夢・湯・憑依・チャウグナー）は非合意で、固有文の約7割。
- **攻め指定**：場面ごとに「攻めなら逆に屈服させる」文がある（DREAM_TOP、BATH_NO、YOBAI_TOP、RITUAL_TOP、SHUB_TOP、YIG_*_TOP、TCHO_TOP、LAMIA_REV）。
- **嗜虐**：r18-thick（共通）の25%。固有では YGO_SEX と LUST が rough。
- **疑似妊娠 → 巫女**：PREG 3＋2＋2、MIKO 3。

### 3-3 理論上のパターン数（固有部分 × 共通）

- **媚薬**：Σ intro × take × leave。例：膳は 3×3×3=27、香は 2×3×3=18。
- **夢**：神27柱が固有の1文（60%）。残り24柱は汎用の3文 × R18M。長い版：IN 2 × SENSE 1 × V 4 × MID 2 × PEAK 1 × AFTER(1×2) = **32**（＋薬の熱の有無で2）。
- **夜這い（受け・薬あり）**：YOBAI 7 × R18M。強気：FORCE 4 × ACT 4 = **16** × R18M。長い版：IN 2 × NPC(1＋2) × V 4 × MID 2 × AFTER 2 = **96**。
- **参加者どうし**：(9｜8｜2) × r18-thick × PREG(1＋3)。
- **役職の夜**：20組 × (ok｜ng) = **40**（組が決まれば文は固定）。
- **チャウグナー**：3 × 3 × 3 = 27。シュブの PAIR：3 × 共通 × PREG(1＋2)。

### 3-4 薄い箇所・問題点

1. **DREAM_GOD は51柱のうち27柱しかない**。cthugha, nyogtha, rlyeh_child, rhan, ghatanothoa2, mordiggian, kubinashi, kakashi, ryujin, mayu, hiruko, kuchisake, dorogami, shinigami, yatsume, shiroi, tatari, oshira, kamikakushi, kodama, suiko, kurai, tsuki, sekai の24柱は、汎用の DREAM 3文だけになる。ある神も1文ずつである。
2. **神ごとの夜はシュブ・イグ・チャウグナーの3柱だけ**。
3. 場所の眷属（PLACE）は場所ごとに1文。残りの12か所は CAVE 3文を語だけ置き換えて使う。
4. **duo-r18 は各組が1本道**（intro・ok・ng 各1文）。同じ組がそろうと毎回同じ文になる。
5. POSSESS・POSSESS_REV・YGO_SEX・LUST・FERTILE が各2文、PRANK・YOBAI_NO・BATH_NO が各2文。
6. persona・口調の固有書き分けがゼロで、共通の R18M に全面的に頼っている。

### 3-5 呼ぶ共通部品

R18M（solo-r18-moan：sex/moans/resist/npc/say/isStrong/lastPos）、R18Thick（r18-thick）、FF（pos-ff）、FM（pos-fm）、Pos、Feud.r18Clash（solo-feud-r18。愛憎の揉み合い）、special-r18（吸血鬼）、HK.canLove。

---

## 4. 吹雪の館の殺人（yakata*.js, solo-yakata-r18*.js）

設定は `ylewd`（頻度）と `ypleasure`（快楽殺人の起きやすさ）。交わりは邪神村と同じく共通の r18-thick。

### 4-1 場面の一覧と文数（文数は「solo-yakata-r18 ＋ R18T（女×女版）」）

| 場面 | 発生条件 | 固有文 |
|---|---|---|
| 媚薬の夜：盛る | 犯人が生きていて拘束されていない。1ゲーム2回まで。`lv×heat×(冷酷・FC)` | DRUG 10種 × (t 2 ＋ e 2) = 40、SKIP 4 |
| 　探偵への誘惑 | 酔った探偵がいて `0.35+lv×0.3` | SEDUCE 3＋7（ff 4）、女攻め×男の SEDUCE_FMC 2・FMD 2、探偵が攻めの SEDUCE_TOP 3＋7（ff 4） |
| 　口封じ | 手がかりを持つ人に40% | silence 2＋6（ff 4）、犯人が受けの silenceB 4（ff 2） |
| 　探偵とバディ | バディがいて60% | buddy 3＋5（ff 5）＋ 探偵が攻め DT 1／受け DB 1 |
| 　恋人／片想い／敵 | ties と絆で判定 | lovers 4＋6（ff 6）／crush 3＋7（ff 5）／enemies 3＋7（ff 6、rough） |
| 　残った人どうし・乱交 | 残りで組む。3人以上なら `lv×0.5` で乱交 | casual 4＋7（ff 6）／group 3＋7（ff 5） |
| 　あぶれた人 | 50%で一人／攻めは使用人をはねのける／それ以外は使用人 | solo 3＋7、SERVANT_TOP 2、servant 2＋6（＋JDark servant） |
| 　翌朝 | 正気の人が現場を守る（35%）か否か | guard 2、MORNING 10、MORNING_SAFE 1 |
| 媚薬以外の夜（extra） | `lv×0.7` で次から重みで1つ | — |
| 　凌辱 | 犯人の動機が「快楽殺人」で犯人が攻め | assault_in 5、assault 5（ff 5）、live 2／kill 3。長い版 JDark assault |
| 　脅迫 | 手がかりを掴んだ人、犯人が攻め | blackmail 4（強気の人には共通の R18M.resist） |
| 　吊り橋 | 二人の恐怖の合計が80超 | bridge 5（ff 4） |
| 　大浴場 | 絆が-0.4より上 | bath 5（ff 5） |
| 　凍える夜 | 捜索組 | warmth 4（ff 4） |
| 　取り調べでの誘惑 | 疑われている人（嘘・FC） | interrogate 3 ＋ T 1／B 2 |
| 長い版（jashin-dark-thick の servant・assault） | 30% | 館専用 12 ＋ 邪神村と共用 20 |

固有文の合計：solo-yakata-r18 96 ＋ solo-yakata-r18-text 182（うち ff 65） ＋ dark-thick（館分）12 = **290**（共用20を除く）。

### 4-2 分岐の軸

- **性別**
  - 女×女：**R18T.ff が14場面・65文**で、6箱庭でいちばん厚い。
  - 女攻め×男：SEDUCE_FMC・FMD 各2。導入は共通の pos-fm で直す。
  - ふたなり：固有文はない。
- **向き**：buddyDT・DB、interrogateT・B、silence・silenceB、SEDUCE と SEDUCE_TOP（攻め受けで文を替える）。
- **persona・口調**：固有文はない（共通の R18M）。気の強さ2分岐は JDark だけ。
- **関係**：恋人・片想い・敵・バディ・探偵と犯人・その場限り・乱交・使用人・脅迫・取り調べ・吊り橋。**関係の種類は6箱庭でいちばん多い**（約15）。
- **合意／非合意**：媚薬の夜はすべて薬つき（曖昧）。凌辱・脅迫・使用人は非合意。吊り橋・大浴場・凍える夜・取り調べは合意。
- **嗜虐**：enemies が rough、凌辱。それ以外は共通の r18-thick。
- **描写の濃さ**：設定はない。JDark が30%で長い版になる。

### 4-3 理論上のパターン数

- **媚薬の夜の導入**：盛り方 10 × t 2 × e 2 = **40**。正気の人の SKIP 4 が最大2人分つく。
- **1場面**：(SC ＋ R18T) × r18-thick。例：lovers は 10文（ff 6）、casual は 11文（ff 6）。
- **一晩の組み合わせ**：導入40 × 誘惑(1＋約14) × 口封じ(1＋約8) × 最大4場面 × 翌朝11。場面の並びまで含めると数百万になるが、ほとんどは共通の r18-thick による。
- **凌辱**：assault_in 5 × assault 5 × (live 2｜kill 3) = **125**。長い版は IN 2 × SENSE 1 × NPC(1＋2) × V 4 × MID 2 × AFTER 2 = 96。

### 4-4 薄い箇所・問題点

1. guard 2、MORNING_SAFE 1、SERVANT_TOP 2、SEDUCE_FMC・FMD 各2、buddyDT・DB 各1、interrogateT 1。
2. JDark の servant・assault は SENSE と PEAK が各1文。
3. persona・口調の固有書き分けがゼロ（邪神村と同じ）。
4. 女攻め×男の専用文が誘惑の場面にしかない（ほかは pos-fm の自動書き換え）。

### 4-5 呼ぶ共通部品

R18M（sex/solo/npc/resist/say/isStrong）、R18Thick、FF（tools：マッサージオイルの夜）、FM、Pos、Feud.r18Clash（yakata-feud → solo-feud-r18）、special-r18、JDark（jashin-dark-thick）。

---

## 5. オメガバース（omega-*.js, scenario-omega.js, obsess-omega.js）

設定は `lewd`（low＝朝チュン／mid＝ほどほど／high＝濃いめ）、`heat`、`destiny`。

### 5-1 場面の一覧と文数

| 場面 | 発生条件 | 導入 | 最中 | 結び・絶頂 | 事後 |
|---|---|---|---|---|---|
| 発情期 `om_heat` | Ωが発情期（またはαのラット）。互いに惹かれていて、恋人・運命の番・その場の勢い | COME 20（相手の因子5×4）、STATE 20（Ωの因子5×4）、MOE 25、LEAD_HEAT 2／_R 2（omega-thick） | mid/high：TKC。low：LOW 3。元の ACT・ACT_R・ACT_FF は後述 | KNOT 2／KNOT_R 2／BETA 2（omega-thick）。噛む biteL 3／instL 2（scenario 直書き） | AFTER 15（Ωの因子5×3） |
| 　発情期・断る／抑制剤 | 理性が勝つ・βが看病など | scenario 直書き 11文 | — | — | COOL 5（回数が多い回） |
| 恋人・番の夜 `om_lovers` | 恋人か番で、発情期でない | when 11、bondOpen 8／coupleOpen 6（mid/high では最初の一文だけ残る）、BOND_LEAD 2 | mid/high：TKC。low：T.low 4 | TKC の after | — |
| 勢いの夜 `om_night` | 恋人でなく惹かれている | 直書き 5 | 直書き 3（50%で TKC） | — | 直書き 3 |
| 愛憎の夜 `om_hatenight` | 惹かれと苛立ちが同じだけ育つ | HN.open 4（＋ TKC の50%：HATE_LEAD 4） | HN.mid 3／low 2（TKC の ROUGH） | — | HN.end 3／HATE_END 3 |
| 寝取り `om_steal` | 恋人のいる相手に迫る | NT.steal 4・rival 2・cheat 3 | NT.scene 3／low 2 | — | NT.after 3。拒否 refuse 3／refuseSelf 3 |
| 執着の暴走（obsess-omega） | 執着度が高いαまたはΩ | FORCE 3（奪う番）、GIVEN 2、TRAP 2（仕組まれた発情） | TRAP_X 4（αが攻め2／Ωが攻め2）、巣の夜 top 2／bottom 2 | TRAP_BITE 2 | （長い版は共通の dark-thick の OMG） |

（参考：無理やりのキス FK 18、浮気の発覚 FOUND 15、運命に気づく REALIZE 15 は性描写ではないので、下の合計に入れていない。）

固有文の合計：omega-heat 155 ＋ omega-thick（オメガ部）18 ＋ omega-love 106 ＋ omega-passion（HN 12・NT 23）35 ＋ scenario-omega の発情期・勢いの夜の直書き 27 ＋ obsess-omega（R18部）17 = **358**。

### 5-2 分岐の軸

- **第二性の組**：T.play は base、ao（α攻め×Ω受け）、oa（Ω攻め×α受け）、aa（α同士）、oo（Ω同士）、b（βがいる組）。T.knot は5組。ACT_R（Ω攻め）。
  - ただし後述のとおり mid/high では大半が使われない。
- **性別**：女×女は ACT_FF 8、AFTERGLOW_FF 3、playFF 6、knotFF 3（いずれも mid/high では未使用）。実際には TKC の FF（共通）が使われる。M×M も M×F も同じ扱い。ふたなりの設定は使わない（体の性別で見る）。
- **性格**
  - エゴグラム因子5種：COME・STATE・AFTER・T.lead・T.after・ACT（固有約110文）。
  - persona 9種：TKC の NOV（共通）。
- **口調**：固有文はない。
- **関係**：番（bondOpen・BOND_LEAD・bondAfter）、恋人、勢い、愛憎、寝取り、執着（奪う番・仕組まれた発情・巣）、運命の番（噛む文）。**関係の種類は豊富**。
- **合意／非合意**：合意は恋人・番・勢い。本能（instinct で噛む）、愛憎、寝取り、奪う番・仕組まれた発情（非合意）。
- **嗜虐**：TKC の ROUGH（sadist 30%、愛憎の夜は固定）。
- **描写の濃さ**：low／mid／high。

### 5-3 理論上のパターン数

- **発情期（mid/high・α攻め）**：COME 4 × STATE 4 × MOE 25 × LEAD 3 × 結び(1＋KNOT 2) × AFTER 3 = **10,800**（因子の組ごと。25組ある）。TKC 本文8を掛けて **86,400**。噛む文（3＋2）があればさらに増える。
- **恋人・番（mid/high）**：最初の一文(when 12 × open 14) × BOND_LEAD 3 × TKC(open2 × mid2 × peak2 × after2 = 16) ≒ **8,000**（組ごと）。
- **愛憎**：HN 4 × 3 × 3 = **36**（50%）。TKC 版は HATE_LEAD 4 × ROUGH(3×2×2) × HATE_END 3 = **144**。
- **寝取り**：(4＋2＋3) × 3 × 3 = **81**。
- **低（朝チュン）**：発情期は COME × STATE × MOE × LOW 3 × AFTER。恋人の夜は open × T.low 4。

### 5-4 薄い箇所・問題点（最重要）

1. **omega-heat の本番の断片72文が、R18版の mid/high では使われない**。omega-thick.js が `H.scene` を包み、`TK.on(lew)`（lew が low 以外）なら常に TKC に差し替えるため。未使用は ACT mid/high 30、ACT_R 20、ACT_FF 8、KNOT 5、BETA 3、KNOT_R 3、AFTERGLOW_FF 3。lovePlay も差し込まれない。
2. **omega-love の T.* 74文も同様に使われない**。lead 10、play 29、knot 11、after 10、bondAfter 3、playFF 6、knotFF 3。`OM.loveScene` を包むと、最初の一文と TKC 本文だけになる。
   - 第二性の組（ao/oa/aa/oo/b）の書き分けが、mid/high の画面には出てこない。TKC は第二性を見ないため。
3. **mid と high の差がほとんどない**。違いは KNOT が出る確率（0.55 と 0.8）だけで、TKC は lewd を見ない。
4. omega-thick 内のオメガ専用の文が薄い。KNOT・KNOT_R・BETA・LEAD_HEAT が各2文、BOND_LEAD 2文。
5. 勢いの夜 `om_night` は直書き11文だけ。
6. 執着の TRAP_X・巣の夜が各2文。

### 5-5 呼ぶ共通部品

TKC、Voice、Pos（order/ff/fixed/nori/hardTop）、FF.fix（pos-ff）、Ero.sadist、Obsess（obsess-kit）、dark-thick（OMG）、H.NORI（solo-flow.js。low 以外では TKC に替わるため実質未使用）、FWB.lean。

---

## 6. 人狼（jinro-*.js, scenario-jinro.js）

- **R18シーンは0種・0文**。
- scenario-jinro.js と jinro-after.js の冒頭に「全年齢・R18版の両方で使う」とある。R18専用ファイル、`r18`・`lewd` のフラグ、性的な語のどれもない（「裸」は「裸足」の1件だけ）。
- 罰ゲーム11種（初恋の話、たこ焼き、足つぼなど）と好意モードは全年齢向けの内容である。
- special.js（不死・吸血鬼）の組み込みもない。
- 呼ぶ共通部品：なし（rel-bad-story.js の `STORY.jinro` は、不仲なきょうだいの全年齢向けの文）。

---

## 7. 比較表

| 箱庭 | 場面の種類 | 固有文（書かれている数） | うち実際に使われる数（R18版・既定設定） | 主な分岐の軸 | 呼ぶ共通部品 |
|---|---|---|---|---|---|
| 宇宙船漂流記 | 7（夜・看病・生命体5型・古い異星経路・文明の誘い・研究） | **358** | 約311（31＋12＋4文が未使用） | 生命体37種×型5（185マス中72マスに固有文）、エゴ因子5、導入4種、攻め指定 | TKC、Voice、Pos |
| ゾンビの街 | 6（恋人の夜・迫る・固定と師弟・ゾンビ・怪物・略奪者） | **211**（solo-rel-r18 のゾンビ節18を含む） | 約183（HIGH 23・CURE_R18 5が未使用） | persona 9（45文）、off/fade/high、恋人の有無、結末9種 | TKC、Voice、Pos、tone-lines、dark-thick、solo-rel-r18 |
| 邪神村RTA | 14（媚薬・夢・憑依・湯・参加者どうし・夜這い・洞窟と場所・儀式・関係・神3柱・役職の組20） | **312**（＋館と共用20） | ほぼすべて | 神（夢27/51柱・専用の夜3柱）、攻め指定の逆転、気の強さ2、役職の組20 | R18M、R18Thick、FF、FM、Pos、solo-feud-r18、special-r18 |
| 吹雪の館の殺人 | 16（媚薬の夜10種＋媚薬以外の夜6種） | **290**（＋共用20） | ほぼすべて | 関係15種、女×女の専用版（14場面・65文）、攻め受けの向き、盛り方10 | R18M、R18Thick、FF、FM、Pos、solo-feud-r18、special-r18 |
| オメガバース | 7（発情期・恋人と番・勢い・愛憎・寝取り・奪う番・仕組まれた発情と巣） | **358** | 約205（ACT系72・T.* 74が mid/high で未使用。low 専用7） | エゴ因子5（約110文）、第二性の組5（mid/high では無効）、関係、low/mid/high | TKC、Voice、Pos、pos-ff、obsess-kit、dark-thick |
| 人狼 | 0 | **0** | 0 | — | — |
| （参考）TKC | 3箱庭共通 | 373 | 箱庭ごとに各段落2本ずつ | 攻め因子5＋ROUGH・RIDE・FF、受け persona 9 | — |

### 基準を決めるためのメモ

- 「書かれている数」と「実際に使われる数」がずれている箱庭がある。漂流記、ゾンビ、オメガは、後から読み込まれる thick 系のファイルが短い版を丸ごと差し替えている。オメガの差は特に大きく、書かれた数の約4割が mid/high で出ない。
- 箱庭固有の文が手厚いのは館（関係と女×女）と邪神村（場面の種類）である。この2つは persona や口調の書き分けを共通の R18M に任せている。逆に漂流記、ゾンビ、オメガは、本番の本文を TKC に任せ、導入と事後に固有文を置く作りになっている。
- 場面1つあたりの固有文を均すなら、目安は次のとおり。
  - 導入：6〜12
  - 事後：4〜8
  - 1本道（各1文）の場面：最低3
  - 現状の最小値は、各1文（DREAM_GOD、PLACE、duo-r18、xeno の大半のマス、xeno-thick の KIND・OVER・PEAK）と、各2文（LEAD・FIN、KNOT など）。
