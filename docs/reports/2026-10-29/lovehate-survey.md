# 愛憎（関係の追加の欄 lh）の現状調査（2026-10-29・読み取りのみ）

対象：`hakoniwa-full/js`（`ties.js`・`hate-love.js`・`feud-kit.js` は全年齢版と同じ内容であることを cmp で確認済み。R18 専用ファイルは full だけにある）。
行番号は R18 版のもの。

---

## 1. 欄と保存の形

### 1-1. 保存の形
- 関係（tie）の項目 **`t.lh`**。値は `''`（なし。保存しない）／`'a'`（一人目＝t.a だけ）／`'b'`（二人目＝t.b だけ）／`'both'`（双方）。
- 付くのは **敵対 `enemy`・不仲 `bad` だけ**（`ties.js:198-199` の `HK.tieExtra`）。どちらも `dir: true`（roleA「敵視する側」→ roleB「相手」）の向きのある関係で、`hate: 2`／`hate: 1` の印を持つ。
- 定義：`ties.js:107-116` `HK.LOVEHATE`（label／short／nl・ns＝名前入りの表示「愛憎：%だけ」）と `HK.LOVEHATE_ORDER = ['', 'a', 'b', 'both']`。
- 追加の欄の名前の一覧 `HK.TIE_XF`（`ties.js:192`）に `'lh'` が入っているので、保存・書き出し・JSON 読み込み（`ui.js:892`）・まとめて読み込む（`ui.js:1591`）を通る。`HK.tieExtraNorm`（`ties.js:240`）が、関係の種類を変えたときに enemy/bad 以外では消す。
- 箱庭に渡すとき：`ties.js:909` `if (t.type === 'enemy' || t.type === 'bad') o.lh = xf.lh || ''` で `ctx.tiesAll` の関係に写る。物語型は入力の `S.ties`（`input.ties` をほぼそのまま）を `HK.LoveHate` が直接見る。

### 1-2. 読み出しの関数（`HK.LoveHate`、`hate-love.js:32-83`。中核 core で読む）
| 関数 | 中身 |
|---|---|
| `dir(x, a, b)` | a から見た向き：`'a'`（a が b に）／`'b'`（b が a に）／`'both'`／`''`。enemy/bad の `t.lh` だけを見る。x はエンジン型 ctx でも物語型 S でもよい |
| `off(x, a, b)` | 愛憎を持たない扱い：`HK.ngExplicit`（恋愛・R18にしない相手）・`HK.lockOut`（恋愛相手の固定）／エンジン型だけ：家族（pair.kin）・無関心・恐怖 |
| `has(x, a, b)` | a が b に持つ（dir が a/both かつ off でない） |
| `any` / `mutual` | どちらか／双方 |
| `sexOk(x, a, b)` | 体の関係にしてよいか（全年齢は偽・pairSex・sexBlocked・ngPair・canLove 両方向・Pos.okSex・kin） |
| `targets(x, a)` | a が愛憎を持つ、その場にいる人 |
| `k(x, a, b)` | 選び方の重み：双方 2.6／片方 2／なし 1 |
| `why(x, a, b)` | 理由の一文 |
| `kamau(x, a, b, c)` | 「構う」の文（態度9種の台詞） |
| `refine` / `pairText` | 結末の名前「腐れ縁（愛憎）」 |
| `R18`（hate-love-r18.js） | LURE・AGAIN_LEAD・LAST・AFTER・TAIL などの文 |

- `HK.lhOf` という関数は**無い**。`t.lh` を直接読む箇所は次の 6 か所だけ（ほかはすべて `HK.LoveHate` 経由）：
  `ties.js:774`（sexTieK）・`ties.js:883-885`（初期値）・`ties.js:909`（写し）・`ties.js:1075`（伸びの倍率）・`cold-fear.js:233`（hostile）・`ui-gear.js:459`（向きの入れ替え）。
- 名前の似た別物：`room-trio-rival-r18.js:181 lhOf(ctx,k,u)` は `LoveHate.any` の薄い包み。`locker-crowd.js:222 lhHas` も `LoveHate.has` の包み（CROWD_API で locker-trio-bed.js に渡す）。

### 1-3. 住人タブの UI
- **関係の表（ui-ties.js:106-131 `rowHtml`）**：列「恋愛・気持ち・様子」（`.tcx`）に、恋愛の欄（`loveSel`）→ 相手の気持ち（`HK.coldOpts`：enemy/bad は `HK.HATE_BACK`）→ 追加の欄（`HK.tieExtra`）の順で select が並ぶ。愛憎は `names: true` なので `HK.tieExtraLabel` が「愛憎：鷹野だけ」のように名前入りで出す。id は `txlh-<k>`、`data-p="lh"`。
- 変更の処理：`ui.js:1834`（`HK.TIE_XF` の欄なら、値があれば代入・空なら削除）。
- **⚙️ 住人ごとの設定（ui-gear.js:141-156 `extraSels`）**にも同じ欄。`ui-gear.js:459`：向き（tdir）を入れ替えると `lh` の a/b も入れ替える（「愛憎を持つ人は同じ人のまま」）。※関係の表の左右の人を select で選び直したときは入れ替えない（値は位置に付いたまま）。
- 説明文：`HK.TIES.enemy/bad.effect`（ties.js:22・33）に「愛憎（〇〇だけ／××だけ／双方）…」、使い方の手引き `tips.js:163-165・206`。
- 関係の一行表示 `HK.tieText`（ties.js:661-674）は「朝霧（敵視する側）→ 鷹野（相手）：敵対（愛憎（鷹野だけ））」の形。

### 1-4. テキスト書式（`HK.parseTies`、ties.js:525-536・586・632-637）
- 読める形：`愛憎:双方`・`愛憎（双方｜両方｜お互い｜互い）`・`愛憎：一人目だけ／1人目だけ／二人目だけ／2人目だけ`・`愛憎（名前だけ）`・`愛憎`（語だけ＝双方）。「執着（愛憎）」は否定先読みで除外（執着の型 sub:hatelove として XALIAS が読む、ties.js:483）。
- 名前より先に読み、「名前だけ」の名前が行のほかに無ければ住人として残す。
- `愛憎` があって敵対・不仲が書いていなければ **enemy を先頭に足す**（ties.js:586-587）。→「A B ライバル 愛憎」は ライバル＋敵対（愛憎）の 2 本になる（気づき）。
- 名前がその行の二人でなければ警告「〇〇だけ は、この行の二人の名前ではないので、愛憎は付けませんでした」。
- 既存の関係に上書きするとき（`ui.js:1591`）、`lh` は `nt` の値でそのまま上書き（向きが逆なら ex.a/ex.b も nt に合わせるので整合する）。

### 1-5. 一括設定（ui-ties.js）
- 「関係の欄」の一括（`FV`、ui-ties.js:237）は **出来事（noev）と過去（past）だけ**。愛憎は一括では付けられない。
- 「関係をまとめて付ける」（ui-ties.js:334）も種類だけで、`lh` は付かない（`HK.tieExtraNorm` で空）。
- テキスト欄（`#tiebulk`、ui-ties.js:208・ui.js:1586）なら行ごとに `愛憎` を書ける（実質の一括手段）。

---

## 2. 愛憎が今、何に効いているか（効き目の一覧）

### A. 関係の値・倍率（エンジン型の中核、ties.js）
| # | 場所 | 効き目（数値） |
|---|---|---|
| A1 | ties.js:883-885 | 初期値：持つ側→相手に **惹かれ +18**（`HK.canLove(持つ側, 相手)` のときだけ。合わなければ 0）、**緊張 +4** |
| A2 | ties.js:1074-1075 `HK.Ties.mult` | 持つ側の惹かれの伸び ×(1.6 / D.mods.att)：敵対は 0.5 を打ち消して **実質 ×1.6**、不仲は **×1.6**。※相手の気持ち（cold）を選んだ敵対・不仲で、b 側が持つ（lh='b'/'both'）と、その手前の `HATE_BACK` の分岐で `return` するので **b 側にはこの倍率が掛からない**（不整合の候補） |
| A3 | ties.js:774 `HK.sexTieK` | 体の関係の倍率：敵対 0.6／不仲 0.7（ライバル 0.85）を、愛憎**片方なら 0.85、双方なら 1** まで戻す |
| A4 | ties.js:775-781 `HK.hostMark` → 住人の `hostOf` | A3 の値を**両方向に同じ値**で付ける（片方だけでも 0.85 が両向き）。読む側：`pos.js:485 P.hostK`・`pos.js:493 P.sexRel`・`free-sex.js:97・120`（F.factor／chance）・`scenarios-a.js:540・553`・`ship-night.js:340`・`solo-yakata-r18.js:36`・`solo-sit-night-r18.js:411`・`solo-saimin.js:183`（敵対・ライバルの催眠プレイ、sexTieK を直接） |
| A5 | ties.js:1049 `HK.Ties.bias` | 体の関係の出来事（ev.sex かつ ev.love なし）は、敵対・不仲の恋愛の倍率（0.3／0.6）の代わりに sexTieK（A3）を掛ける |
| A6 | engine.js | **直接の効き目なし**。engine.js:1005 の結果の名前 `lovehate`「愛憎」は値（緊張>45 かつ 好意>22 か惹かれ>48）で決まる別物（view-map.js:279 も同じ式） |

### B. hate-love.js（両ビルド・中核）
| # | 場所 | 効き目 |
|---|---|---|
| B1 | hate-love.js:284-300 `tie_lh_kamau` | 「構う」の出来事（重み 1.1＋FC×0.4＋衝動×0.3＋攻撃性×0.2、同じ人は 2 区切りあけ、mag 16） |
| B2 | hate-love.js:302-325 `tie_lh_jeal` | 「嫉妬」の出来事。重み (1＋嫉妬)×(直前に親しくした 3／親しげ 0.6)。値：持つ側→邪魔した人 緊張+10・好意-6、持つ側→愛憎の相手 **惹かれ+7**、ストレス+6、`HK.Obsess.feed(…, 3)`（執着度に足す） |
| B3 | hate-love.js:331-346 `HateKit.storyTick` の包み | 物語型で、愛憎の組があれば確率 rate×1.4 で「構う」を返す（`lh: true`）。邪神村（rate 0.1〜0.13）・吹雪の館（0.22）・人狼（scenario-jinro.js:184、kinds:'love' rate 0.35 → **0.49 で構うに置き換わる**。kinds を見ていない） |
| B4 | hate-love.js:349-372 `LH.refine`・`pairText` | 結末の関係名を **腐れ縁（愛憎）**（kusare＝双方／kusare1＝片方）に。条件：恋人でない・殺害でない・既存の分類が OVER の一覧、かつ体の関係（night/hateSex/hateNight）か「構う＋嫉妬＋挑発×2」が 3 以上。`HK.TieRel.refine/pairText` を `HK.wrap` で包む |

### C. R18（full だけ）
| # | 場所 | 効き目 |
|---|---|---|
| C1 | hate-love-r18.js:101-125 `tie_lh_lewd` | 挑発して構わせる（口づけ・押しつけ）。値：持つ側→相手 惹かれ+4・緊張+1、相手は双方なら惹かれ+4／片方なら緊張+3。持つ側が攻めなら内容のスイッチ force が要る |
| C2 | hate-sex-r18.js:434-435 `hates()` | 愛憎を持つ人は「嫌っている側」に数える → `dirOk`（受け＝嫌っている側）の向き決めに効く |
| C3 | hate-sex-r18.js:488-541 `HS.scene` | 文の分岐：二度目以降は AGAIN_LEAD、受けが持てば LURE（受けの挑発）、攻めが持てば LAST、受けが持てば AFTER、TAIL を足す、もう一度（AGAIN）の段が 50% で出やすい |
| C4 | hate-sex-r18.js:556 | 理由に「／〇〇は△△に愛憎を…。受けが挑発して構わせた」 |
| C5 | `LH.k` の重み（×2／×2.6） | hate-sex-room-r18.js:51（hate_sex）・omega-passion.js:213（om_hatenight。R18 のときだけ）・solo-sit-night-r18.js:693（zr18_hate） |
| C6 | hate-sex-room-r18.js:36-37・51・61 | 部屋：条件を満たしたあとも愛憎の組は**部屋の中で 3 回まで**再発（間隔 3 区切り）／相手を第三者に取られそうなら **×1.6**（`rivalOf`：片想い・本命・恋人・セフレ・夜・惹かれ45以上） |
| C7 | sex-lead-r18.js:419 | きっかけの段：初回は `T.FORCE.hateLove`（「{a}は{b}を嫌っていた。同じくらい、誰にも渡したくなかった」）。※`any` で選ぶので、持つのが b だけでも {a} の文になる（要確認） |
| C8 | tie-warm-r18.js:523 | 受けが愛憎を持つ（挑発で始まる）ときは、家族・主従の縁の一言を差し込まない |
| C9 | room-trio-rival-r18.js:181・200・320・343 | 部屋の三人（不仲の攻め×片想いの攻め×受け）：型の重み mono +1.2、体位 show ×1.3、山場 names ×1.3 |

### D. ほかの箱庭・共通部品
| # | 場所 | 効き目 |
|---|---|---|
| D1 | cold-fear.js:229-235 `hostile` | 持つ側を「敵視している」に数える（恐怖の相手が落ちぶれたときの反応） |
| D2 | cold-fear.js:280-287 | 突き落とす・見捨てる等（攻撃型）の重み wA に **+0.45**（`LoveHate.dir` が a/both。※off を見ない dir を使用）、理由に「・愛憎」 |
| D3 | avoid-kit.js:57 `loves` | 持つ側は「避けている」に数えない（苦手で避ける人の門を通る） |
| D4 | room-games.js:403-416 `grudgeOk` | 部屋の三人の場面：持つ側は時間の **2 割**から、弱い焦り（諦め・ストレス>25・乗り気>0.35）で加わる（持たない側は時間の 3.5 割以降・ストレス>40 など） |
| D5 | room-games.js:570 | 避けている人の説明文に「持つ側の愛憎を付けると避けずに加わる」 |
| D6 | locker-crowd.js:708・738・919・926 | 媚薬ロッカー（大人数）：手を出す urge **+0.2**、応じる w **+0.25**、三人 urge +0.2、三人の応じる +0.25 |
| D7 | locker-trio-bed.js:213・271-272・279・285（R18） | 三人のベッド：翌朝・誘いの型を rough（口では嫌がりながら）に、理性で踏みとどまる判定を 60% で外す、加わる +0.25 |
| D8 | solo-locker.js:177・322-325・359・422・434・590・592・667 | 媚薬ロッカー（二人）：狭い場所で「構う」60%、urge +0.2、応じる +0.3／+0.25、ベッドの踏みとどまりを 60% で外す、R18 でベッドへ 50%、結果に「腐れ縁（愛憎）」の行 |
| D9 | zombie-assault.js:134・137 `Z.pairTie` | 「関係のある二人」に `lovehate`（愛憎の相手）。環境値 zpair＝多い なら同じ場所から始まり、z_lust の重み・z_pair（R18）の対象・理由の文に出る |
| D10 | feud-kit.js:97-121 | `F.lovehate`／`lhFrom`／`lhWhy`／`bodyOk`：lh を設定していればそれ、無ければ以前の判定（恋愛の関係＋嫌悪35以上かライバル）。`duo` の顔合わせを DUO_RIVAL に |
| D11 | jashin-feud.js:119・136-148・192-205 | 邪神村：持つ側が強引な側として揉める（毎時 0.06＋夜0.03）、身を挺して守る（75%）、手がかりの奪い合いから愛憎の組を外す |
| D12 | yakata-feud.js:53-66・107・116-128 | 吹雪の館：同上（犯人に狙われた相手を守る・刺されて倒れることも） |
| D13 | sib-feud.js:86 `FE_SRC` | LoveHate を使う出来事は、不仲の雪解け抑制の対象外（抑えない） |
| D14 | endings.js:166-167・186-188／epilogue.js:272-279 | 合コン・クラスメイトの結末に「腐れ縁（愛憎）：…」、行く末の一文（kusare／kusare1） |
| D15 | ui-gear.js:459 | 向きの入れ替えで lh も入れ替え |

**効き目の数：直接の効き目 約 30 項目（A1〜A5・B1〜B4・C1〜C9・D1〜D15、うち A4 の hostK は 8 ファイルが読む）**。
効かないもの：omega の「愛憎」（omega-passion.js:138 `hateLove` は値で判定、lh を見ない。lh は惹かれの補正 A1・A2 を通して間接に効くだけ）、room-left.js:163 の「愛憎の誓い」（元恋人か惹かれ≥40 かつ嫌悪≥30 の値判定）、room-end.js（愛憎の組は Ties.hostile で「hate」の層＝睨み合って別れる。腐れ縁の文は無い）、room-last3-r18.js の「愛憎のある三人」（MOOD 'hate'。関係・嫌悪の判定で lh 不使用）。

---

## 3. 愛憎で分岐している出来事の一覧（箱庭ごと）

条件の表記：持つ側＝`LH.has`（lh が a/both の側）、any＝どちらか。enemy/bad はどちらでも同じ（lh を区別して見る出来事は無い）。

### エンジン型の全箱庭（HK.COMMON。合コン・クラスメイト・無人島・出られない部屋・オメガバース・ゾンビの街 など）
| id | 条件 | 内容 | R18 |
|---|---|---|---|
| tie_lh_kamau | 持つ側→相手（各向き） | わざと突っかかる・嫌味を言いながら隣に座る・物を取り上げる・世話を焼いて「勘違いするな」・割り込む。相手の返しは双方／片方で分岐 | 両ビルド |
| tie_lh_jeal | 持つ側が、愛憎の相手と親しくした第三者に | 嫌味・邪魔・八つ当たり・敵意。結びは双方／片方で分岐 | 両ビルド |
| tie_lh_lewd | 持つ側、sexOk、クラスメイト以外、描写の設定 on | 攻めなら口づけで黙らせる・押しつける（force）、受けなら自分から仕掛けて挑発。性別の組 m/ff/fm | R18 |
（`tie_` で始まるので、全体「関係性イベント：出さない」と関係ごとの「出来事：起こさない」（noev）で消える。@event の印は無く、一覧は event-catalog.js:137 の規則 `/^tie_lh_/ → 'yan'` で **執着（ヤンデレ）に分類されている（誤り。正しくは敵対・不仲）**）

### 出られない部屋（whiteroom）
| id | 条件 | 内容 | R18 |
|---|---|---|---|
| hate_sex | any（敵対の判定は別）。愛憎なら条件済みでも 3 回まで再発、重み ×2／×2.6、取られそうなら ×1.6 | 敵対する二人の強引なエッチ（C3 の文の分岐） | R18 |
| 三人の場面（room-games.js grudgeOk） | 持つ側は早く・弱い焦りで加わる | 不仲・敵対の三人 | R18 の場面 |
| 三人の型（room-trio-rival-r18.js） | any | 型・体位・山場の重み | R18 |
| きっかけの段（sex-lead-r18.js） | any | 初回のきっかけ文 hateLove | R18 |

### 合コン（goukon）
| ct_goukon_hate | HS.scene を通る | 帰り道に敵意ある相手に迫られる（C3 の文の分岐） | R18 |
| 結末 | kusare／kusare1 | 「腐れ縁（愛憎）」の行 | 両ビルド |

### クラスメイト（classroom）
| 結末 | kusare／kusare1 | 「腐れ縁（愛憎）」の行（tie_lh_lewd は出ない） | 両ビルド |

### オメガバース（omega）
| om_hatenight | 値の hateLove（lh 不使用）。重みに LH.k（R18） | 憎みながら惹かれ合う夜（HS.scene の文の分岐も） | R18 |

### ゾンビの街（zombie）
| zr18_hate | HS.hostile。重み LH.k | 言い争いの夜（HS.scene） | R18 |
| z_lust／z_pair・初期配置 | pairTie='lovehate' | 関係のある二人の遭遇（多い） | z_pair は R18 |

### 邪神村RTA（jashin。物語型）
| js_hatelove | FD.lhFrom（lh 設定時は持つ側、未設定なら恋愛＋嫌悪の旧判定） | 揉めて唇・体を奪う（R18 は solo-feud-r18.js の r18Clash）／相手が襲われたら身を挺して守る | 両ビルド（体は R18） |
| （構う） | HateKit.storyTick の包み | 構う（tag「敵視」） | 両ビルド |
| js_feud | lovehate の組を除外 | 手がかりの奪い合い | 両 |
（@event の印 `tie=yan` は誤り。関係は enemy/bad）

### 吹雪の館の殺人（yakata。物語型）
| yk_hatelove | 同上 | 揉める／犯人に狙われた相手を守る（刺されて倒れることも） | 両ビルド |
| （構う） | storyTick の包み | 構う | 両 |
| yk_feud | lovehate の組を除外 | 両 |
（@event の印 `tie=yan` は誤り）

### 人狼（jinro）
| （構う） | storyTick の包み（kinds:'love' を無視して 0.49 で構うに置き換わる） | 朝の広場で構う | 両 |

### 媚薬ロッカー（locker）
| 二人（solo-locker.js） | any／持つ側 | 構う（60%）・手を出しやすい・応じやすい・ベッドへ・結果の「腐れ縁（愛憎）」 | 両（体は R18） |
| 大人数（locker-crowd.js） | 持つ側 | urge／応じる の上乗せ | 両 |
| 三人のベッド（locker-trio-bed.js） | any | rough の型・踏みとどまり外し | R18 |

### 恐怖・無関心の変化（cold-fear.js。全箱庭）
| cf_fall／cf_story_fall | 恐れる側が lh を持つ | 落ちぶれた相手を突き落とす・見捨てる型の重み +0.45 | 両 |

**出来事の数：愛憎で分岐（または愛憎専用）の出来事 id は 13**（tie_lh_kamau・tie_lh_jeal・tie_lh_lewd・hate_sex・ct_goukon_hate・om_hatenight・zr18_hate・z_pair・js_hatelove・yk_hatelove・js_feud／yk_feud（除外）・cf_fall）＋ id の無い物語型の場面（構う×3箱庭、ロッカーの構う・ベッド、部屋の三人・きっかけの段、結末の腐れ縁）。そのうち lh 専用に作った出来事は **tie_lh_kamau・tie_lh_jeal・tie_lh_lewd の 3 つ**、ほかは既存の敵対の場面の分岐・重み。

### 「愛憎」という語が文に出るだけの箇所（lh を見ない）
- 執着の型 hatelove（別の仕組み。5 章）：tie-new.js（tie_nw_hl_seek／guard／test／wound）・tie-new-story.js（tns_hatelove）・obsess-kit.js:183-185。
- 値で決まる「愛憎」：engine.js:941・1005・1036（結果の名前 lovehate）、view-map.js:279・323、omega-passion.js:136-231・380-417（om_forcekiss・om_hatenight・結末 E.lovehate）、omega-guard.js:83、room-left.js:113・163・259（誓い）、endings.js:131（誓い）。
- 説明・ヒント：tips.js:162-165・206・448・522、tips-scen-a.js:116、tips-scen-b.js:61、tips-scen-d.js:202、attr.js:354（闇堕ち「愛憎より悪質」）、room-same.js:596（地の文）、room-last3-r18.js:9・125（MOOD_WHY）、locker-trio-bed.js:28・214、obsess-omega.js:119・omega-passion.js:26（箱庭の説明）、tone-lines.js:156-（LH_CLASH・LH_GUARD・LH_AFTER。feud-kit が使う台詞の表）。
- コメントだけ：lewd-unify.js:161、r18-thick.js:8、story-lewd.js:6・122・162、omega-thick*.js、omega-ties.js:399、room-end.js:8。
→ 約 **25 ファイル・60 か所前後**。

---

## 4. 関係の「気持ち」の層（どの関係にどんな欄があるか）

関係（tie）の欄は 3 系統。

### 4-1. 相手の気持ち `t.cold`（`HK.coldOpts`、ties.js:416-425。1 関係に 1 つ、向きは「相手（b）の側」）
| 関係 | 表 | 選択肢 |
|---|---|---|
| 片想い crush | CRUSH_COLD | ふつう／興味がない／友達としか／苦手・避けている／ほかに好きな人／両片想い（mutual。二本に開く） |
| 敵対・不仲 enemy/bad | HATE_BACK | お互いに敵視（空）／なんとも思っていない（＝一方的な敵意）／ふつうに接している／友人だと思っている／愛している／苦手・避けている |
| 執着 yan | OBS_BACK | 気づいていない／怖がっている／嫌っている／困惑／受け入れている／共依存 |
| 執着（信仰）worship | WORSHIP_BACK | 気づいていない／受け入れている／戸惑い／支配している／大切に思っている |
| 歪んだ関係 abuse | ABUSE_BACK | 離れられない／怯えている／逃げ出したい |
| 夫婦 spouse | MARRIED_COLD | 円満／熟年／冷えている／別居中／離婚（元夫婦） |
| 師弟・主従・上司・教師 | TIE_GRADE | 仲：ふつう／良好／険悪 |

### 4-2. 追加の欄 `HK.tieExtra`（ties.js:196-224。`HK.TIE_XF = sub, grade, feel, feelB, mode, lh, elder, heavy, kg, past, pastB, noev`）
| 欄 | 付く関係 | 中身 | 向き |
|---|---|---|---|
| sub | yan | 執着の型：おまかせ／献身／束縛／排除／依存／**愛憎（hatelove）** | 執着する側 a |
| grade | enemy（画面では hide） | 度合い：敵対／憎悪 | a |
| **lh** | **enemy・bad** | 愛憎：なし／一人目だけ／二人目だけ／双方（names） | a／b／both |
| feel | benefactor | 恩を受けた側：感謝／負い目 | b |
| mode | fond／fwb | 推し／愛人 | — |
| feel・feelB | fiance／ex | 許嫁：乗り気・戸惑い・断りたい／元恋人：気まずい・ふっきれ・未練（二人それぞれ。who） | a・b 別々 |
| elder | sibling・sibclose・sibbad・stepsib | 上下：自動／一人目が上／二人目が上／なし（names。lh と同じ a/b の流儀） | a／b |
| heavy | lover・spouse・honmei | 気持ちの重さ：普通／軽い／重い | 二人（本命は a） |
| kg | 親子・擬似親子・きょうだい・兄弟（庇護）・義理・親族・恩人 | 家族の仲：ふつう／良好／不仲 | 二人 |
| past・pastB | **hidden・noobs 以外のすべて** | 過去の札（組に一か所。`HK.tiePastHome` 等で同じ二人の最初の関係に置く） | a から／b から |
| noev | hidden・noobs 以外のすべて | 出来事：起こす／起こさない | — |

### 4-3. 恋愛の欄 `t.love`（どの関係にもある。ties.js:706-750、ui-ties.js:66-96）
- `''`＝自動（`D.loveDef`）／`'ok'`／`'no'`。`HK.tieLoveOK`・`HK.tiesLove(list)`（同じ二人の関係すべてを見る）・`HK.loveOffMark`・`HK.Ties.after`（loveOff・noLove・noSex の印）。UI は列の先頭の select（`loveSel`）。一括設定（`LV`）にもある。
- **「どの関係にも付く欄」の実装例として最も近い**：`TIE_XF` に入れず独立の項目、`tieExtraNorm` で消されない、表示は `HK.tieLoveHelp`。

### 4-4. 愛憎を「関係を問わない気持ち」にするなら（置き場所の材料）
- 候補 1：**past／pastB と同じ「どの関係にも付く・向きごとの欄」**（`tieExtra` の全関係の末尾に足す枠がある：ties.js:221）。向きの扱い（a から／b から）と「組に一か所」（`tiePastHome`）の仕組みが既にあり、表の列（`.tcp`）も確保されている。lh の値 a/b/both は pastの「from」に近い。
- 候補 2：**love と同じ独立の項目**（TIE_XF の外）。全関係で同じ select を出す。ただし love は向きを持たない。
- 候補 3：**apathy／fear のような向きのある関係の型を 1 つ足す**（cold-fear 方式。5 章）。CLAUDE.md の「関係性は増やさない」に触れるので不可に近い。
- どの案でも、読み手の大半は `HK.LoveHate.dir` 1 か所を通るので、保存の形を変えても **直す箇所は少ない**：`t.lh` を直接読む 6 か所（ties.js:774・883-885・909・1075、cold-fear.js:233、ui-gear.js:459）＋ `dir` の `t.type !== 'enemy' && t.type !== 'bad'` の絞り＋テキスト書式（ties.js:528-636 の enemy 自動付与・ty の絞り）＋ tieExtra の定義。
- 注意：A3〜A5（sexTieK・hostMark・bias）は「敵対・不仲の嫌悪を戻す」意味なので、ほかの関係に広げると「戻す元」が無い（SEX_BIAS に無い関係では 1 のまま）。A2 の倍率も `D.mods.att` で割る式なので、att の倍率が 1 より大きい関係（rival 1.1・crush 1.3 など）では意味が変わる。

---

## 5. 愛憎と似た既存の仕組み

### 5-1. 執着の型「愛憎」（yan sub:'hatelove'）との違い
| | lh（敵対・不仲の欄） | yan sub:hatelove（執着の型） |
|---|---|---|
| 土台の関係 | 敵対・不仲（嫌悪が表、恋愛は「隠れた想い」） | 執着（ヤンデレ）。恋愛の関係（LOVE_TIE_RE に yan）・惹かれの伸び ×1.25 |
| 向き | a／b／双方 | 執着する側 a だけ（相手の気持ちは OBS_BACK） |
| 出来事 | 構う・嫉妬・挑発（R18）・強引なエッチの文・探偵の揉める／守る | 探す・かばう・試す・心ない言葉（tie_nw_hl_*）、物語型 tns_hatelove、執着の暴走（obsess-kit.js：監禁 ×2、危害 ×1.8、心中 ×1.5、gk>1.6 で致死あり） |
| 暗さ | 死・監禁には至らない（館の「刺されて倒れる」は守る側） | 監禁・危害・心中・致死まで（内容のスイッチ） |
| 結末 | 腐れ縁（愛憎） | 執着の結末（obsess 系） |
| 体の関係 | 嫌悪の倍率を戻す（0.85／1）、sexOk で恋愛対象・受け攻めを見る | 執着の夜（obsess-kit） |
| 判定の窓口 | HK.LoveHate | HK.Obsess（O.type が sub を読む。obsess-kit.js:120・140） |
- テキスト書式は「執着（愛憎）」→ yan＋sub、「愛憎」→ 敵対（lh）で読み分け（ties.js:483・528）。利用者には同名の「愛憎」が 2 つあることになる。

### 5-2. 無関心・恐怖（cold-fear）の作り方
- 「気持ち」を**向きのある関係の型**として足している：`T.apathy`／`T.fear`（ties.js:72-73、dir・roleA/roleB、TIE_ORDER に enemy の後ろで挿入）。ほかの関係に**重ねて**使う（同じ二人に恋人＋恐怖など。fearTies で恋愛の関係を外す）。
- 箱庭に渡すと `HK.Ties.after`（ties.js:936-）が住人に `noLove`／`noSex`（「恋愛：あり」なら noSex だけ）を付け、`ctx._apathy`／`ctx._fear`（キー `'a>b'`）の表を作る。
- `HK.ColdFear`（cold-fear.js、pack-rel）は `freezeInit` を包んで、**一回の箱庭の組の表 `ctx._cf`（物語型は `S._cf`）**を作る：キー `'抱く側>相手'`、値 `{ h, t, type: 'apathy'|'fear', lv: 恋愛ありか, st: 状態（''→deep/eased/fled/hate/despise/guard/love…）, deep }`。`Ctx.prototype.mod` を包んで値の動きを抑え（無関心 ×0.25・恐怖 ×0.1 など）、引き金の出来事（cf_tend・cf_moved・cf_fall・cf_force_r18）で `st` を書き換えて**箱庭の中で気持ちが変わる**。`CF.pairOf(Z, h, t)` で読む。
- 愛憎の参考になる点：①入力の関係（保存）と、箱庭の中で動く状態（`_cf` の st）を分けている、②向きごとのキー `'h>t'`、③恋愛の欄（lv）で振る舞いを切り替え、④理由に「無関心の変化：…」を出す。愛憎は今は**状態を持たない**（ペアの記録は pf.lhN・lhJeal・lhLewd・lhAt・lhJAt・lhLewdAt・hateSex の回数だけ）。

### 5-3. 「恋愛：自動／あり／なし」（どの関係にも付く欄の実装例）
- 保存：`t.love`（''／'ok'／'no'）。`TIE_XF` の外の独立項目なので、`tieExtraNorm`（種類を変えると合わない欄を消す）の対象外。
- 既定：`D.loveDef`（ties.js:79-82 で全関係に計算）＋ `loveSoft`。
- 判定：`HK.tieLoveOK(t)`（1 本）・`HK.tiesLove(list)`（同じ二人の全関係：一つでも no なら恋愛しない…）。
- 箱庭へ：`HK.tieLoveNorm`（ties.js:741）で `o.love` に写し、`HK.Ties.after` が `loveOff` を付ける。物語型は `HK.loveOffMark`（fam-kin.js）。
- UI：ui-ties.js `loveSel`（関係の表）・ui-gear.js（⚙️）・一括設定 `LV`。テキスト書式でも読める。
- → 「関係を問わず持てる気持ち」を足す場合の UI・保存・一括・物語型への受け渡しの雛形がそろっている。

---

## 6. 点検（audit）で愛憎に関わるもの
| 道具 | 判定 id | 愛憎との関わり |
|---|---|---|
| orient-audit.js | O1〜O7 | FT の回（8 回に 1 回、orient-audit.js:76-81）：恋愛対象「なし」の住人 0〜2 に `{0-2 敵対 lh:'both'}`・`{1-2 敵対 lh:'both'}` を付け、恋愛対象の合わない愛憎の組が恋人・夜・性的な文にならないか（O1・O2・O4）を数える |
| state-audit.js | S31 | 避けている人が迫った：配役（state-audit.js:104-105）で `2↔3 敵対 lh:'a'`（2 は愛憎＝避けていない）を入れ、`HK.Avoid` の除外が効くかを見る |
| state-audit.js | W1（追加の回） | 媚薬ロッカーを敵対・不仲（4 回に 1 回 lh:'both'、1 回 lh:'a'）で回し、狭い場所の文（hate-kit・hate-love の「構う」）に場所に合わない語が出ないか（misc の判定） |
| state-audit.js | S25〜S30 の追加の回 | 「執着・愛憎…で回す」とあるが、配役は `yan sub:'hatelove'`（state-audit.js:209）＝執着の型のほうで、lh ではない |
| pos-audit.js | V1〜V14 | lh を付けた配役は**無い**（hate_sex 等は敵対の配役が無いと出ない。ふつうの配役の値でたまたま出る分だけ） |
| feud-audit.js | 不仲の比率 | KINDS（sibbad・bad・enemy・rival・cold:bad・kg:bad）に lh なし。愛憎の恋は「恋愛（参考）」として仲良しとは分けて数える旨のコメントだけ |
| sex-gate-audit.js | 列 g | 「敵対＋愛憎（双方）」の性的な場面の割合を b（友人）と比べる（4 割未満で不具合。sexgate パス） |
| group-audit・qa・seg・loveflag・name | — | lh の配役なし |
- 共通の部品 `audit/core.js`・`audit/misc.js`・`audit-all.js` には lh／LoveHate の語は無い。

---

## 7. 行数（2000 行の上限に近いものに ★、1500 以上に △）
| ファイル | 行数 | |
|---|---|---|
| ui.js | 1974 | ★（残り 26 行） |
| engine.js | 1158 | |
| ties.js | 1149 | |
| locker-crowd.js | 1098 | |
| solo-sit-night-r18.js | 707 | |
| sex-lead-r18.js | 707 | |
| hate-sex-r18.js | 686 | |
| solo-locker.js | 684 | |
| room-games.js | 661 | |
| sib-feud.js | 649 | |
| tie-new.js | 646 | |
| cold-fear.js | 635 | |
| ui-ties.js | 611 | |
| tips.js | 605 | |
| pos.js | 597 | |
| content-events-r18.js | 582 | |
| tie-new-story.js | 554 | |
| tie-warm-r18.js | 549 | |
| epilogue.js | 523 | |
| obsess-kit.js | 485 | |
| ui-gear.js | 469 | |
| omega-passion.js | 434 | |
| room-trio-rival-r18.js | 409 | |
| tie-layer.js | 395 | |
| room-end.js | 376 | |
| hate-love.js | 374 | |
| hate-kit.js | 358 | |
| endings.js | 310 | |
| locker-trio-bed.js | 293 | |
| free-sex.js | 275 | |
| zombie-assault.js | 252 | |
| avoid-kit.js | 236 | |
| feud-kit.js | 218 | |
| jashin-feud.js | 208 | |
| yakata-feud.js | 156 | |
| hate-love-r18.js | 127 | |
| hate-sex-room-r18.js | 70 | |
| solo-feud-r18.js | 39 | |
- 読み込み順（_order.txt）：ties.js(35, core)・tie-new.js(41, pack:rel)・tie-layer.js(47, pack:rel)・hate-kit.js(66)・feud-kit.js(67)・**hate-love.js(68, core)**・hate-sex-r18.js(133)・hate-sex-room-r18.js(134, scen:whiteroom)・**hate-love-r18.js(135, pack:rel)**・avoid-kit.js(287)・cold-fear*.js(292-294, pack:rel)・ui-ties.js(425)・tie-new-story.js(567, late)。

---

## 8. 気づいたこと（設計の前に確かめたい点）
1. **一覧の分類の誤り**：event-catalog.js（ビルドの道具 hakoniwa-tools/build/event-catalog.js:137）が `/^tie_lh_/` を `yan`（執着）に分類。js_hatelove・yk_hatelove の @event も `tie=yan`。一覧では lh の出来事が「執着（ヤンデレ）」に並ぶ。正しくは `enemy,bad`。
2. **Ties.mult の早期 return**（ties.js:1064）：相手の気持ち（cold）を選んだ敵対・不仲で、二人目（b）が愛憎を持つと、惹かれ ×1.6 が掛からない（A1 の初期値 +18 は掛かる）。
3. **hostOf は両向き同じ値**：片方だけ（a）でも、持たない b から見ても 0.85。「持たない側はふつうの敵対」という説明とずれる（体の関係は二人で一つの確率なので、意図どおりかもしれない）。
4. **人狼で「構う」が出すぎる可能性**：storyTick の包みが `opt.kinds`（jinro は 'love'）を見ずに rate 0.35×1.4＝0.49 で構うを返す。
5. **sex-lead-r18 のきっかけ文 hateLove** は `any` で選び、文は「{a}は{b}を嫌っていた。同じくらい、誰にも渡したくなかった」固定。持つのが b だけの組で向きが逆になりうる。
6. **物語型の off**：`LH.off` の家族・無関心・恐怖の除外はエンジン型（ctx）だけ。物語型（邪神村・館・ロッカー・人狼）では、恐怖・無関心と愛憎が同じ二人に重なっていても愛憎として動く（ngExplicit・lockOut は見る）。また物語型の tieList は noev（出来事：起こさない）を見ない。
7. **cold-fear.js:280** は `LoveHate.dir`（off を見ない）で +0.45 を足す（has ではない）。
8. **テキスト書式**：「ライバル 愛憎」は敵対（愛憎）が新しく 1 本増える。「片想い 愛憎」なども同様。
9. **一括設定で愛憎を付けられない**（FV に lh 無し）。
10. **相手の気持ち（cold）との組み合わせを検査していない**：例えば敵対で「相手：愛している」＋「愛憎：二人目だけ」、「相手：苦手・避けている」＋「愛憎：二人目だけ」（avoid-kit は愛憎を優先して避けていない扱い）など、意味の重なる・矛盾する組を選べる。
11. 「愛憎」という名前が 3 つある：lh（敵対・不仲の欄）・執着の型 hatelove・値で決まる結果の名前 lovehate（engine／omega）。結末名も lh は「腐れ縁（愛憎）」、値の方は「愛憎」。
12. room-end.js（出られない部屋の後日談）には腐れ縁の文が無い（愛憎の組は「hate」の層＝睨み合って別れる）。合コン・クラスメイトの結末と、ロッカーの結果には腐れ縁が出る。
13. ui.js は 1974 行で上限まで 26 行。愛憎の UI を足すなら ui-ties.js／ui-gear.js 側に置く必要がある。
