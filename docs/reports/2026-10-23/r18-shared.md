# R18 共通部品のパターン数調査（箱庭シミュレーター R18版）

- 対象：`/home/user/hakoniwa/hakoniwa-full/js`（読み取りのみ）
- 数え方：推測ではなく node で実測した。
  1. acorn で各ファイルの AST を走査し、`L('a|b|c')`（`'…'.split('|')`）と文字列配列リテラルの要素数を、変数名とキーのパスごとに集計した。
  2. `index.html` の読み込み順どおりに全 290 ファイルを vm 上で実行し（DOM はスタブ）、公開されている `HK.R18M_DATA` / `HK.FF.POOLS` / `HK.FM.POOLS` / `HK.ThickSex` / `HK.ThickVM` / `HK.Ero` の実行時の要素数と突き合わせた。両者は一致した。
  3. 実行時に効くフィルタ（受け攻めの `RECV`、女性攻めの `FF_TOPC_NG`、対等な繋がりの `MUTUAL_RE`、拒む台詞の `REFUSE` / `M_REF` / `M_DOM`）を同じ正規表現で当てて、実際に引ける件数を出した。
- 組み合わせ数は「1回の山場で、同じ条件（気分・型・口調の組）のときに出る文の並びの数」とする。乱数で省かれる段（攻めの果てる声・事後の一言など）は「なし」を1通りとして数えた。
- 用語：**地の文**＝ナレーション、**声**＝「」の台詞・喘ぎ。

---

## 0. 先に結論（運営向けの要点）

| 部品 | 総文数 | いちばん厚い段 | いちばん薄い段 |
|---|---:|---|---|
| solo-r18-moan-data.js（HK.R18M） | 545 | 口調ごとの声 341（17口調×20） | 口淫・指の果てる文は**各1文で固定**。13体位のうち9体位は2文 |
| thick-sex.js | 270 | mf の最中（BODY 4〜5×6型） | 嫉妬の首押さえは BODY・CLIMAX とも**1文**。ff は最中と頂が同じ番号で組になるので**4組しかない** |
| r18-thick.js | 106＋固定セット4つ | mm（男性器あり）の山場 | 嗜虐の山場は**3セット固定**、嫉妬は**1セット固定**。plain の4表（13文）は**どこからも使われない** |
| pos-ff.js（HK.FF） | 74 | body 4 | clinical・clumsy の climax が**2文**。open・after・repeat・speed の32文は**呼び出し元がない** |
| pos-fm.js（HK.FM） | 42 | body 3 | open・climax が全型で**2文**。地の文の組み合わせは**12通りだけ**（mf は 3,120） |
| ero-kit.js（HK.Ero） | 191 | 9態度×3段階×6 | DOM（主導側の喘ぎ）は段階ごとに3文 |
| special-r18.js | 17 | 吸血鬼が攻め・挿入 3 | 吸われる側が攻めのとき（跨る・ff）は**1文** |
| solo-rel-r18.js | 67 | 無人島の4段×3 | ゾンビの街は各段2文で、事後は**1文**。最中の段がない |
| dark-thick.js | 95 | 略奪者（26,244通り） | オメガの仕組まれた発情の頂は A・B とも**1文** |
| 口調の上書き・直し（件数のみ） | 6,035行 | 上書きは のじゃ・関西弁・無口・混在で各 1,050行以上 | tone-fix の R18 版：内気 18、穏やか 20 |

性別の組で見ると、**mf だけが厚く、fm と ff は桁違いに薄い**（どの部品でも同じ傾向）。

| 地の文の組み合わせ（1気分・1型あたり） | mf | ff | fm |
|---|---:|---:|---:|
| HK.R18M.sex（短い版、邪神村・館以外の呼び出し） | 3,120 | 60〜120 | 12 |
| r18-thick（邪神村・館の長い版） | 56,160〜199,680 | 450〜900 | 180 |
| thick-sex（合コン・部屋・ロッカーの小説調） | 400〜500 | 32〜64 | 256 |

**男性どうし（mm）とふたなりには専用の文がない**。どちらも mf の文で書く（pos.js の `P.isF` がふたなりの攻めを false にする）。

---

## 1. solo-r18-moan-data.js ＋ solo-r18-moan.js（HK.R18M）

**役割**：邪神村・吹雪の館の交わりの短い版（前戯→体位→喘ぎ→最中→攻めの台詞→果てる声→果てる瞬間→事後）。抵抗・耐える声・村人の声も持つ。ff と fm のときは HK.FF / HK.FM に振り分ける。

### 1-1. 段階ごとの文数（総計 545）

| 表 | 段・分岐 | 文数 |
|---|---|---|
| FORE（前戯） | love / rough / drug / plain | 5 / 5 / 5 / 5（計20） |
| POS（体位）13種 `t` | 正常位3・屈曲位2・後背位3・寝バック2・立ちバック3・騎乗位3・対面座位2・背面座位2・側位2・駅弁2・立位2・口淫2・指と舌2 | 計30（挿入あり11体位で26） |
| MID（最中） | love / rough / drug（plain はない） | 4 / 4 / 4 |
| CLIMAX（果てる瞬間） | love / rough / drug / oral | 3 / 3 / 3 / 2（oral は [0]=口淫・[1]=指で**固定**） |
| V（声）17口調 × 6種 | start 4・mid 4・top 4（proud だけ5）・climax 3・topc 2・after 3 | 1口調20（proud 21）、計341 |
| RESIST（抵抗）17口調 | 各3 | 51 |
| SUBDUE（押さえ込む） | hard / soft / crowd / god | 6 / 4 / 4 / 3 |
| ENDURE（耐える声）17口調 | 各3 | 51 |
| NPC | villager / villagerB / servant / god | 4 / 2 / 3 / 3 |
| STRONG（気の強い口調の印） | 10口調 | 文なし |

### 1-2. 分岐の軸

- **口調（V）は17種**：proud・stern・tsun・tsun_n・gentle・gentle_n・devoted・devoted_p・cool・calm・free・shy・polite・aniki・noja・mukuchi・kansai。依頼文の「15種」とは数が違う（実際は17キー）。
  - 全31口調のうち残りの14種（yankee・ane・kohai・usan・ojou・gentleman・sondai・mixed・hero・gyaru・chara・mystic・genki・darui）には専用の表がない。`toneKey` で9態度（persona）の表に落ち、そのあと voice-override や tone-fix で言い換える。
- **mood は4種**：love / rough / drug / plain。
  - plain は最中・果てる瞬間で love か rough に振り分ける（rough になる確率は 0.25＋攻撃性×0.4）。
  - plain 以外は、前戯の30%を plain から引く。
- **体位**：13種。関係と気質で重みが変わり、同じゲームでは続きにくい。
- **性別の組**：mf はこのファイルの文を使う。ff は `ffSex`（前戯＋HK.FF の body/climax）、fm は `fmSex`（HK.FM の open/body/climax）に回る。mm とふたなりは mf の文を使う。
- **受け攻めのフィルタ**：
  - 自分で「攻め」を選んだ人（hardTop）の start/mid/climax/after からは、受け身の言い回し（`RECV`）を外す。
  - 女性の攻めの topc からは、男性の体を前提にした言い回し（`FF_TOPC_NG`）を外す。
- **長さ**：`opt.short` で最中・攻めの台詞・事後を省く。

### 1-3. 組み合わせ数

- 地の文（mf、full、1つの mood あたり）＝ 前戯(plain なら5、ほかは自分の5＋plain の5で10) × 体位 26 × MID 4 × CLIMAX 3。
  - love / rough / drug：10 × 26 × 4 × 3 ＝ **3,120**
  - plain：5 × 26 × (4×3 [love] ＋ 4×3 [rough]) ＝ **3,120**
- 声（同じ口調の組）＝ start 4 × top 4 × mid 4 × climax 3 ＝ 192。
  - これに topc（なし＋2）を掛けて 576、after（なし＋受け3＋攻め3）を掛けて **4,032**。
- **合計（1 mood・1口調の組）＝ 3,120 × 4,032 ≒ 1,258万通り**。
- 口淫（kuchi）＝ t 2 × top 4 × topc 2 × 果てる文 1 ＝ **16通りだけ**。
- ff（ffSex）の地の文 ＝ 前戯 10 × FF.body × FF.climax ＝ **60〜120**（後述）。
- fm（fmSex）の地の文 ＝ FM.open 2 × body 3 × climax 2 ＝ **12**。

### 1-4. 薄い箇所

1. **果てる瞬間の文が少ない**。
   - 口淫・指の果てる文は表の中で位置が決まっていて、各1文しか出ない（`D.CLIMAX.oral[0]` / `[1]`）。
   - love・rough・drug の果てる瞬間も各3文しかない。
2. **体位の本文が少ない**。13体位のうち9体位（屈曲位・寝バック・対面座位・背面座位・側位・駅弁・立位・口淫・指と舌）は2文だけ。
3. **topc（攻めの果てる声）は全17口調で2文**。
   - 女性が攻めの組（ff と fm）でフィルタを通すと、proud・devoted・devoted_p・aniki は**0文**になり、汎用の息づかい `TOP_OK`（7文、口調なし）に落ちる。
   - ほかの口調も1文だけ残る。例外は cool で、2文とも残る。
4. **攻め指定の人が喘ぐとき**（催眠・常識改変が `topLines` を使う）、受け身の言い回しを外すと残りがかなり少ない。

   | 口調 | start | mid | climax |
   |---|---:|---:|---:|
   | polite | 1/4 | 1/4 | 1/3 |
   | kansai | 1/4 | 1/4 | — |
   | proud | 1/4 | — | — |
   | cool | 1/4 | — | — |
   | noja | 1/4 | — | — |
   | shy | — | 1/4 | 2/3 |

5. **NPC.villagerB は2文**、**SUBDUE.god は3文**。
6. **fm の地の文は12通り**しかなく、mf（3,120）の約1/260。

---

## 2. thick-sex.js（HK.ThickSex：合コン・出られない部屋・媚薬ロッカーの小説調の山場）

**役割**：山場を「始まり／繋がって揺れる／感じていく／果てる」の段落（`\n\n`）で400字前後に組み立てる。形は mf / fm / ff、型は6種、態度は9種。

### 2-1. 文数（総計 270）

| 表 | 分岐 | 文数 |
|---|---|---|
| OPEN | 6型（rough・gentle・tease・playful・clinical・clumsy） | 各4（計24）。呼び出し元が自前の書き出しを渡すので、実際に使うのは出られない部屋（room-thick）だけ |
| BODY（mf） | 6型 | rough 5、ほか各4（計25） |
| CLIMAX（mf） | 6型 | 各4（計24） |
| FM_BODY / FM_CLIMAX | 3群（dom・soft・play） | 各4 / 各4（計24） |
| FF_BODY / FF_CLIMAX | 3群 | 各4 / 各4（計24） |
| FEEL / FEEL_FM / FEEL_FF | 形ごと | 5 / 4 / 4 |
| FEEL_A（攻めの快感） | mf / fm / ff | 5 / 4 / 4 |
| MOAN（受けの喘ぎ） | 9態度 | 各5（計45） |
| CMOAN（果てる声） | 9態度 | 各3（計27） |
| REACT（崩れ方） | 9態度 | 各3（計27） |
| PLACE | goukon / room / locker | 各5 |
| ROUGH_BODY / ROUGH_CLIMAX（嗜虐） | — | 4 / 3 |
| JEALOUS_BODY / JEALOUS_CLIMAX（嫉妬・首） | — | **1 / 1** |

### 2-2. 分岐の軸

- **形**：二人の性別で決まる。
  - mf：攻めが男性。受けの性別は問わず、mm もここに入る。ふたなりの攻めは男性の体として扱う。
  - fm：攻めが女性で、受けが男性。
  - ff：女性どうし。
- **型**：6種。ただし fm と ff は3群にまとめる（gentle・clumsy→soft、playful→play、ほか→dom）。
- **態度**：9種（proud・stern・tsun・gentle・devoted・cool・free・shy・polite）。口調17種ではなく、persona の9表を使う。
- **嗜虐**：mf だけ。`HK.Ero.sadist` が通ったうえでくじ25%、受けが攻め指定なら使わない。嫉妬の場面（`opt.jealous`）は首押さえの文になる。
- **場所**：goukon / room / locker の一文。入らないこともある。
- 作風は小説調だけで、♡ は使わない。

### 2-3. 組み合わせ数（OPEN は呼び出し元が渡すので除く）

| 形・型 | 計算 | 地の文 |
|---|---|---:|
| mf・rough | BODY 5 × FEEL 5 × FEEL_A 5 × CLIMAX 4 | 500 |
| mf・ほかの5型 | 4 × 5 × 5 × 4 | 400 |
| mf・嗜虐 | ROUGH_BODY 4 × FEEL 5 × FEEL_A 5 × ROUGH_CLIMAX 3 | 300 |
| mf・嫉妬 | 1 × 5 × 5 × 1 | 25 |
| fm（3群とも） | FM_BODY 4 × FEEL_FM 4 × FEEL_A 4 × FM_CLIMAX 4 | 256 |
| ff | （最中と頂は**同じ番号の組**で4組）× FEEL_FF 4 × FEEL_A 4 | 64 |
| ff（リバ同士でない組） | 対等な繋がりの文を外すと soft 3組、play 2組 | 48 / 32 |

- 声（1態度）＝ MOAN 5 × REACT 3 × CMOAN 3 ＝ **45**。
- 場所の文（5文、またはなし）で地の文は最大6倍になる。

### 2-4. 薄い箇所

1. **嫉妬の首押さえは BODY・CLIMAX とも1文**なので、地の文は毎回同じになる。
2. **ff は最中と頂が番号で固定の組**になっていて、体の描写は4パターンしかない。
   - リバ同士でない組では、play が2パターン、soft が3パターンに減る。
3. **ff と fm は3群しかない**（mf は6型）。clinical と tease の雰囲気差は ff と fm では出ない。
4. **ROUGH_CLIMAX は3文**。
5. mm（男性どうし）専用・ふたなり専用の文はない。

---

## 3. r18-thick.js（HK.R18Thick：邪神村・吹雪の館の長い山場）

**役割**：邪神村・吹雪の館のときだけ `HK.R18M.sex` を包み、段落に分けた400字前後の山場にする。

- 流れ：体位に入る → 攻めの一言 → 受けの声と最中 → 崩れる受けと余裕の攻め → 果てる → 余韻。
- 喘ぎは thick-vmd.js の VB（9態度）を使う。

### 3-1. 文数（L 表 106 ＋ 固定セット）

| 表 | love / rough / drug / plain |
|---|---|
| ENTER | 4 / 4 / 4 / 4 |
| MID_STRONG（気の強い受け） | 4 / 3 / 3 / 3 ※plain は使われない |
| MID_SOFT（やわらかい受け） | 3 / 3 / 3 / 3 ※plain は使われない |
| PEAK | 4 / 4 / 3 / 4 ※plain は使われない |
| AFTER | 4 / 3 / 3 / 4 |
| PLEASE（攻めも感じる） | 3 / 2 / 2 / 3 ※plain は使われない |

- FLAVOR：jashin 5、yakata 5。
- SOFT_MID：ff 5、fm 5。SOFT_AFTER：ff 3、fm 3。
- **ROUGH_SADIST：3セット**、**JEALOUS_CHOKE：1セット**。どちらも open・say・mid・say2・peak・after の6文が1組で固定されている。

### 3-2. 分岐の軸

- **mood**：4種。ただし最中・PLEASE・PEAK は `mid` で引き、mid は love / rough / drug にしかならない。
- **受けの気の強さ**：強い／やわらかいの2種。`R18M.isStrong` で決める。
- **体位**：13種（R18M と共通）。
- **性別の組**：mm（男性器あり）は `mm()`、ff と fm は `soft()`。
  - 攻め指定がなくても、主導する側が女性で相手が男性なら fm の書き方になる。
- **嗜虐**：攻めが sadist でくじ25%。love と plain のときだけ使う。嫉妬なら首押さえになる。
- **声**：R18M の17口調と、ThickVM.VB の9態度×2段階を混ぜて使う。
- **長さ**：`opt.short` は3段落の短い版。

### 3-3. 組み合わせ数

- mm・full の地の文 ＝ 前戯(10/5) × 体位 26 × ENTER × MID × PLEASE × PEAK × AFTER。

  | mood | 気の強い受け | やわらかい受け |
  |---|---:|---:|
  | love | 199,680 | 149,760 |
  | plain | 149,760 | 124,800 |
  | rough | 74,880 | 74,880 |
  | drug | 56,160 | 56,160 |

- 声と余韻の差し込みが、さらに掛かる。
  - 攻め top 4、受け start 4、VB0 5、VB1 5 か R18M climax 3（計8）、topc（なし＋2）、FLAVOR（5、またはなし）、after（なし＋3＋3）。
- **嗜虐の山場 ＝ 3セット**、**嫉妬 ＝ 1セット**。差が出るのは前戯と声だけ。
- ff の地の文 ＝ 前戯 5 × FF.body 3〜4 × SOFT_MID 5 × FF.climax 2〜3 × SOFT_AFTER 3 ＝ **450〜900**。
  - SOFT_MID は、body と「舌」「指」がかぶる文を外すので、実際はこれより少ない。
- fm の地の文 ＝ FM.open 2 × body 3 × SOFT_MID 5 × climax 2 × SOFT_AFTER 3 ＝ **180**。

### 3-4. 薄い箇所

1. **嫉妬（首押さえ）の山場は1セット固定**なので、地の文が毎回まったく同じになる。
2. **嗜虐の山場は3セット**。
3. **PLEASE.rough と PLEASE.drug は2文**。
4. **使われない文がある**：MID_STRONG.plain・MID_SOFT.plain・PEAK.plain・PLEASE.plain の**計13文**は、`mid` が plain にならないので、どこからも引かれない。
5. **ff と fm は mm の約1/100〜1/1000**。
   - SOFT_AFTER は3文、fm の書き出しは pos-fm の2文に頼っている。

---

## 4. pos.js（HK.Pos：受け攻め・ふたなり）

**役割**：受け攻め（top・bottom・riba・おまかせ）、恋愛対象（posLike 5種）、向き（`order`）、ふたなり（`futa`）、性別の判定（`isF`・`ff`・`bothRiba`）を決める。**文は0**。

- 文数に効くのは次の分岐だけ。
  - **ふたなり**：`P.isF` が false になり、mf（男性器あり）の文で書かれる。ふたなり専用の文はない。
  - **リバ同士**：`MUTUAL_RE`（双頭・貝合わせ・入れ替わりなど）に当たる文は、二人ともリバのときだけ使える。
  - **攻め指定（hardTop）**：R18M の受け身の言い回しを外す（1-4 の表を参照）。
- 薄い箇所：mm とふたなりの攻めの専用文が、どの部品にもない。

---

## 5. pos-ff.js（HK.FF：女性どうし）

**役割**：指・舌・肌で書く ff の地の文。`HK.FF.fix` は男性の体を前提にした文を ff の文に差し替え、`HK.simulate` の結果を全箱庭で見直して対等な繋がりの描写を直す。

### 5-1. 文数（総計 74）

| 種類 | rough | gentle | tease | playful | clinical | clumsy |
|---|---:|---:|---:|---:|---:|---:|
| open | 3 | 3 | 3 | 3 | 3 | 3 |
| body | 4 | 4 | 4 | 4 | 3 | 3 |
| climax | 3 | 3 | 3 | 3 | **2** | **2** |

- after：will 3、des 3、aphro 3。
- toy 4、repeat 3、speed 2。

### 5-2. 分岐の軸

- **型**：6種。`styleOf`：攻撃性 or CP→rough、冷たさ→clinical、FC→playful、AC→clumsy、A→tease、それ以外は gentle。R18M からの呼び出しでは love→gentle、rough→rough。
- **リバ同士かどうか**：対等な繋がりの文を外すかどうか。
  - body rough は4文中1文、playful は4文中**2文**、toy は4文中1文が外れる。
- **道具（opt.tools）**：toy を使う。
  - 実際に効くのは吹雪の館の媚薬が `oil` のとき（`S.drugTools`）だけ。`FF.fix` は tools を受け取っても toy を使わない。

### 5-3. 組み合わせ数

- 本文（body × climax）＝ 1型あたり 4×3＝12、clinical と clumsy は 3×2＝**6**。
- リバ同士でない組：rough 3×3＝9、playful 2×3＝**6**。

### 5-4. 薄い箇所

1. **climax の clinical と clumsy が2文**。
2. **使われない文がある**：`FF.scene` を呼ぶところがなく、`FF.pick` は body と climax にしか使われていない。
   - そのため **open 18・after 9・repeat 3・speed 2 の計32文は使われていない**。
   - 「repeat（二度目以降）」「after（事後）」の段は、ff では実質なし。
3. **playful でリバ同士でない組は、body が2文**しかない。

---

## 6. pos-fm.js（HK.FM：女性攻め×男性受け）

**役割**：女性上位（押し倒す→跨る→果てる）の地の文。`FM.fixWith` は、男性が攻める前提の文を差し替える。

| 種類 | 6型それぞれ | 計 |
|---|---:|---:|
| open | **2** | 12 |
| body | 3 | 18 |
| climax | **2** | 12 |

- **組み合わせ** ＝ open 2 × body 3 × climax 2 ＝ **1型あたり12**。
- **薄い箇所**：
  - 全型で open と climax が2文。
  - `FM.scene` は呼び出し元がない（fmSex と r18-thick の soft が pick で使う）。
  - fm には事後の文がない。r18-thick だけが SOFT_AFTER.fm（3文）を使う。

## 7. pos-fm-tease.js（女性攻めのいじめる小イベント、全年齢版と共通）

- 文数：island 4、zombie 3、whiteroom 3、TAIL 4（計14）。描写はぼかした書き方。
- 組み合わせ：本文 × (TAIL 4＋なし) ＝ 島 20、ゾンビ 15、部屋 15。
- 薄い箇所：場所ごとに3〜4文しかない。

---

## 8. ero-kit.js（HK.Ero：作風「男性向け」）

**役割**：
- 作風の切り替え（`OPT`：小説調／男性向け）と、箱庭ごとの男性向けの文の登録（`add` / `L`）。
- 態度ごとの♡喘ぎ（`moan`：段階0 こらえる／1 とろける／2 崩れる）、擬音（`SFX`）、嗜虐の判定（`sadist`）。

| 表 | 分岐 | 文数 |
|---|---|---|
| MOAN（M＋MORE を足したもの） | 9態度 × 3段階 | 各6（3＋3）、計162 |
| DOM（主導側） | rough / soft × 段階0・1 | 各3、計12（段階2は MOAN を使う） |
| SFX | wet / hit / cum / suck | 5 / 4 / 4 / 4 |

- **組み合わせ**：
  - 1人の3段階 ＝ 6×6×6 ＝ **216**。
  - 主導側 ＝ 3×3×6（段階2）＝ 54。
- **箱庭ごとの登録数**（実行時の `HK.Ero.T`）：hole は99キー・240文、kaihen は168キー・268文、saimin は164キー・202文、succubus は48キー・119文。
- **薄い箇所**：
  - DOM が段階ごとに3文。
  - 擬音 hit・cum・suck が4文。
  - 態度は9種だけで、口調17種の差は出ない。

---

## 9. special-r18.js（吸血鬼の吸血＋性描写）

| 表 | pen（挿入） | ride（跨る） | ff |
|---|---:|---:|---:|
| VT（吸血鬼が攻め） | 3 | 2 | 2 |
| WT（吸われる側が攻め） | 2 | **1** | **1** |

- HOW（どう抱いたか）：催眠 2、力ずく 2、同意（恋仲）**1**、同意 **1**。
- **組み合わせ** ＝ HOW × 本文。例：VT・pen・催眠は 2×3＝6。WT・ride・同意は **1×1＝1通り（固定）**。
- **薄い箇所**：吸われる側が攻めのとき（跨る・ff）は1文。同意のときの導入も1文。

## 10. solo-rel-r18.js（無人島「島の夜」・ゾンビの街の夜）

| 箱庭 | 段 | 文数 |
|---|---|---|
| 無人島 I | ask：lover 3・fwb 2・lock 2・mentor 2・new 2 | — |
| 無人島 I | high：fore・insert・mid・end | 各3 |
| 無人島 I | ffHigh：insert・mid・end | 各3（fore は high から引く） |
| 無人島 I | after（5関係） | 各2 |
| 無人島 I | fade | 4 |
| ゾンビ ZT | ask：lock・mentor | 各2 |
| ゾンビ ZT | high：fore・insert・end | 各2（**mid がない**） |
| ゾンビ ZT | ffHigh：insert・end | 各2 |
| ゾンビ ZT | after：lock・mentor | **各1** |
| ゾンビ ZT | fade | 2 |
| 共通 | ANIKI（兄貴分の一言） | 3 |

- 総計は67（AST 上の段名の配列7件を除く）。
- **組み合わせ**：
  - 無人島・描写する ＝ ask 2〜3 × 3⁴(81) × after 2 ＝ 324〜486。ff は 3³×3 ＝ 81 が中身。
  - ゾンビ・描写する ＝ ask 2 × 2³(8) × after 1 ＝ **16**。
- **薄い箇所**：ゾンビの街は各段2文、事後は1文で、最中の段がない。

## 11. solo-feud-r18.js（愛憎の揉み合い→無理やり）

- OPEN 3文だけ。続きは `R18M.resist`（17口調×3＋SUBDUE）と、`R18M.sex`（mood rough・短い版）に任せる。
- ff のときは feud-kit.js が `FF.pick(body/climax, 'rough')` を使う。body 4（リバ同士でない組は3）、climax 3。
- 組み合わせ（地の文）＝ OPEN 3 × SUBDUE 4〜6 × 体位 26 × CLIMAX.rough 3。

## 12. hate-kit.js ／ obsess-*.js の R18 部分

- **hate-kit.js：R18 部分はない**。性描写の語は0件。揉み合いの性描写は feud-kit.js から solo-feud-r18.js を経由する。
- **obsess-kit.js**：監禁中の夜（`CAGE_NIGHT`）は、執着する側が攻め（top）3文、受け（bottom）3文。
- **obsess-install.js**：箱庭ごとの PACK に夜の文があるのは goukon だけ（top 2 / bottom 2）。ほかの箱庭（classroom・zombie・whiteroom・island）は共通の3文を使う。
- **obsess-omega.js**：

  | 表 | 文数 |
  |---|---:|
  | 巣の夜 top / bottom | 2 / 2 |
  | FORCE（奪う番） | 3 |
  | GIVEN（自分から差し出す） | 2 |
  | TRAP（仕組まれた発情） | 2 |
  | TRAP_X alphaTop / omegaTop | 2 / 2 |
  | TRAP_BITE | 2 |

- **obsess-story.js**：物語型の閉じ込めは文だけで、性描写はない。
- **組み合わせ**：
  - 監禁の夜 ＝ 3（PACK があれば2が混ざる）。
  - 仕組まれた発情 ＝ TRAP 2 × TRAP_X 2 × (TRAP_BITE 2＋なし) ＝ 12。
- **薄い箇所**：監禁の夜は向きごとに3文だけ。3〜4回に1回は dark-thick の長い版に替わる。

## 13. dark-thick.js（HK.DarkThick：合意のない山場の長い版。約30%の確率）

| 場面 | 段と文数 |
|---|---|
| RESIST（抵抗の声） | 9態度 × 3 |
| YIELD（受け入れてしまう） | 3 |
| RAID（ゾンビの略奪者） | open 3・feel 3・struggle 3・force 3・raider 4・witness 2・peak 3・after 3 |
| CAGE（監禁の夜） | open 3・feel 3・say（bind・devote・depend・purge 各2）・peakTop 2・peakRide 2・after 3 |
| OMG（オメガの奪う番） | forceOpen・Feel・Say・Peak・After 各2 |
| OMG（仕組まれた発情） | trapOpen・Feel・Say・After 各2、trapPeakA **1**・trapPeakB **1** |

- **組み合わせ**：
  - RAID ＝ 3×3×3×3×4×(RESIST 3)×(witness 2＋なし)×3×3 ＝ **26,244**。
  - CAGE ＝ 3×3×2×3×2×3 ＝ **324**（執着の型ごと・向きごと）。
  - OMG 奪う番 ＝ 2×2×2×3×2×2 ＝ **96**。
  - OMG 仕組まれた発情 ＝ 2×2×2×3×1×2 ＝ **48**。
- **薄い箇所**：
  - 発情の頂が A・B とも1文。
  - CAGE の台詞は型ごとに2文。
  - 略奪の目撃は2文。

## 14. 口調の上書き・直し（件数のみ）

**voice-override-r18.js**：1,062行。1行は元の台詞＋6口調。`-` でないセルを数えた。

| 口調 | 上書きの件数 |
|---|---:|
| noja | 1,062 |
| kansai | 1,061 |
| mixed | 1,060 |
| gentleman | 1,055 |
| mukuchi | 1,052 |
| polite | 904 |

**tone-mixed-more-r18.js**：混在口調だけで876行。

**tone-fix-*-r18.js**：

| ファイル | 行数 | 口調ごとの内訳 |
|---|---:|---|
| tone-fix-r18.js | 1,433 | 30口調。少ない順に gyaru 3・chara 4・gentle 6・hero 7・shy 9 |
| tone-fix-g1-r18.js | 503 | proud 57・aniki 108・hero 99・chara 75・yankee 164 |
| tone-fix-g2-r18.js | 536 | stern 61・gentleman 106・sondai 113・cool 116・calm 61・mystic 79 |
| tone-fix-g3-r18.js | 730 | darui 139・free 101・gyaru 98・tsun 99・tsun_n 121・usan 172 |
| tone-fix-g4-r18.js | 124 | gentle_n 19・ane 23・gentle 14・devoted_p 39・devoted 20・shy 9 |
| tone-fix-g5-r18.js | 290 | genki 35・kohai 78・mixed 61・ojou 77・polite 39 |
| tone-fix-g6-r18.js | 481 | kansai 171・noja 197・mukuchi 113 |
| **計** | **4,097** | |

- 口調ごとの合計が少ない口調：shy 18、gentle 20、devoted 51、gentle_n 51、polite 57。
- 多い口調：yankee 363、noja 341、kansai 294。

## 15. 参考：依頼の対象外だが共通で使われている厚い版

| 部品 | 使う箱庭 | 文数と薄い箇所 |
|---|---|---|
| thick-vmd.js（HK.ThickVM） | dungeon・massage・variety、r18-thick の喘ぎ | VB 9態度 × 2段階 × 5、VT 9 × 5（計135）。1態度の組で 5×5×5＝125通り |
| solo-thick4.js（HK.Thick4） | 催眠・サキュバス・常識改変・感覚遮断穴 | 計314。TFEEL の serve・kneel・ff が各1、SCN（箱庭ごと）はほとんど1〜2文 |
| jashin-dark-thick.js（HK.JDark） | 邪神村・吹雪の館 | 計54。7場面のうち SENSE・PEAK は各**1文**、IN は各2文 |

---

## 16. どの箱庭がどの共通部品を使っているか

呼び出し元は grep で調べた。

- `pos.js`、`HK.FF.fixMutual`、`HK.FM.fix` は `HK.simulate` を包んでいるので、**全箱庭の結果に効く**。表には直接の呼び出しだけを載せた。
- 宇宙船漂流記（ship）・人狼（jinro）・ダンジョンRPG（rpg）は、上の共通部品の R18 の文を直接呼ばない。
  - ship と jinro は obsess-story（R18 の文なし）だけを使う。rpg は全年齢なので、吸血鬼の R18 は出ない。

| 箱庭（id） | 呼び出し元ファイル | R18M | r18-thick | thick-sex | FF | FM | Ero | ThickVM | Thick4 | dark-thick | JDark | special-r18 | feud-r18 | rel-r18 | fm-tease | obsess 夜 |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 邪神村RTA（jashin） | solo-jashin-r18*.js, jashin-dark-thick.js, jashin-feud.js→feud-kit.js, jashin-special.js | ● sex・say・moans・resist・npc | ● | | ● pick | ● fixWith | （sadist） | ●（喘ぎ） | | | ● | ● | ● | | | |
| 吹雪の館の殺人（yakata） | solo-yakata-r18.js, yakata-feud.js→feud-kit.js, yakata-special.js | ● 上に加えて solo・group | ● | | ● pick（toy あり） | ● fixWith | （sadist） | ●（喘ぎ） | | | ● | ● | ● | | | |
| 合コン（goukon） | solo-goukon-night.js, obsess-install.js |  |  | ● | ● fix |  |  |  |  | ● 監禁 |  |  |  |  |  | ● PACK |
| 出られない部屋（whiteroom） | room-thick.js, room-lewd.js, room-trio.js, pos-fm-tease.js, obsess-install.js |  |  | ● | ● fix | ● fixWith |  |  |  | ● 監禁 |  |  |  |  | ● | ● |
| 媚薬ロッカー（locker） | locker-thick.js | | | ●（ff 以外） | | | | | | | | | | | | |
| オメガバース（omega） | omega-heat.js, omega-love.js, omega-thick.js, obsess-omega.js | | | | ● fix | | sadist | | | ● 奪う番・発情 | | | | | | ● 巣 |
| 無人島（island） | solo-rel-r18.js, pos-fm-tease.js, obsess-install.js |  |  |  |  |  |  |  |  | ● 監禁 |  |  |  | ● I | ● | ● |
| ゾンビの街（zombie） | solo-rel-r18.js, solo-zombie-raid.js, zombie-special.js, pos-fm-tease.js, obsess-install.js | | | | | | | | | ● 略奪・監禁 | | ● | | ● ZT | ● | ● |
| クラスメイト（classroom） | obsess-install.js | | | | | | | | | ● 監禁 | | | | | | ● |
| 催眠（saimin） | solo-saimin.js, solo-saimin-sex.js, solo-saimin-ero.js | topLines | | | | ● fixWith | ● OPT・add・L・moan | | ● | | | | | | | |
| サキュバスの一夜（succubus） | solo-succubus.js, solo-succubus-ero.js | | | | | ● fixWith | ● OPT・add・L・moan | | ● | | | | | | | |
| 常識改変（kaihen） | solo-kaihen.js, solo-kaihen-ero.js | topLines | | | | | ● OPT・add・moan | | ● | | | | | | | |
| 感覚遮断穴（hole） | solo-hole.js, solo-hole-behind.js, solo-hole-ero.js | | | | | | ● OPT・add・L・fill | | ● | | | | | | | |
| エロトラップダンジョン（dungeon） | dungeon.js | | | | | | | ● | | | | | | | | |
| マッサージ（massage） | solo-massage.js | | | | | | | ● | | | | | | | | |
| エロバラエティ番組（variety） | solo-variety.js | | | | | | | ● | | | | | | | | |

補足：

- 「（sadist）」は r18-thick と thick-vmd を経由して `HK.Ero.sadist` を使う、という意味。直接は omega-thick.js・solo-thick4.js・thick-sex.js・thick-vmd.js・r18-thick.js が呼ぶ。
- `HK.R18M.sex` を呼ぶのは邪神村と館だけ（solo-jashin-r18*.js・solo-yakata-r18.js・solo-feud-r18.js 経由）。この2箱庭では r18-thick.js が必ず包んで長い版にする。そのため **R18M.sex の短い版がそのまま出るのは、この2箱庭の範囲外になる場合（`R18Thick.on` が偽）に限られる**。
- dark-thick の監禁の長い版は `O.cageTick` を包んでいるので、obsess を入れた全箱庭で出る。
- obsess の夜（`CAGE_NIGHT`）は、`O.install` を入れた classroom・zombie・goukon・whiteroom・island・omega で出る。br・trial の PACK は、その箱庭が読み込まれていないので効かない。

---

## 17. 均すときの候補（数の上での優先順）

1. **fm**：open・climax を各型2文→4文以上にする。fm の after もない。
2. **ff**：
   - pos-ff の climax を clinical・clumsy で2文→3〜4文にする。
   - thick-sex の FF_BODY・FF_CLIMAX の組を4組→6組以上にする。リバ同士でない組で play が2組になる問題もある。
3. **固定になっている箇所**：
   - thick-sex の JEALOUS_BODY・CLIMAX（1文）、r18-thick の JEALOUS_CHOKE（1セット）と ROUGH_SADIST（3セット）。
   - R18M の CLIMAX.oral（各1文）、special-r18 の WT.ride・WT.ff・HOW 同意（1文）。
   - dark-thick の trapPeakA・B（1文）、ゾンビ ZT.after（1文）。
4. **R18M**：
   - topc が全口調で2文。女性攻めのとき proud・devoted・devoted_p・aniki が0文になる。
   - 9体位が2文。
5. **使われていない文**：
   - pos-ff の open・after・repeat・speed（32文）は、呼び出しを足すか整理する。
   - r18-thick の plain 4表（13文）も同じ。
6. 基準数の目安（現状の中央値）：
   - 地の文の段：3〜4文。
   - 口調ごとの声：start・mid・top 4、climax 3、topc・after 2〜3。
   - これに届いていないのは、上の 1〜4 の項目。
