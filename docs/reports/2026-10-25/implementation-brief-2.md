# 箱庭シミュレーター：フェーズ7以降の実装指示書

> 2026-10-29 追記：この文書に出てくる sex-audit・emo-audit・daily-audit・dark-audit・text-audit（と punct-audit・stage-audit）は削除した。価値のある判定は `hakoniwa-tools/tone-check/audit-all.js` の判定 misc に取り込み、点検は audit-all を中心に回す（`docs/reports/2026-10-29/audit-consolidation.md`）。

作成日：2026-10-25　対象 HEAD：52f4d32
前の指示書：`implementation-brief.md`（フェーズ0〜6、完了）。アンケートは 414 件（10/24 14:23〜10/25 14:04）。前回の仕分け（305 件）からの増分 109 件（10/25 2:07〜）をこの文書で拾う。

この文書は、実装担当（Opus）にそのまま渡す前提で書く。「あなた」は実装担当。コードの場所は `hakoniwa-full/js/` 基準の `ファイル:行`（HEAD 52f4d32）。ずれていたら関数名・変数名で探し直す。

---

## 0. 依頼の仕方（前回と同じ。省略不可）

- `CLAUDE.md` の決まりに従う（両ビルド同期・更新履歴・ビルド・点検）。
- フェーズごとに 1〜数コミット。コミットは source js・docs だけにし、バンドル（`bundle-*.js`・`index.html`）は取り込み側で作り直す。
- 点検は全部 0 件で終える：`orient-audit`（r18・safe・全年齢版）、`pos-audit`（素・`--hot`・`--ff --hot`・NPCBOT=1）、`state-audit`（r18・safe・全年齢版、`--hot`）、`text-audit`（T1〜T7、3通り）、`collect`（失敗 0）。R18 の文を足したら `sex-audit`（回の中の重複 ≤0.5%）。恋愛の複数人場面を足したら `group-audit`（嫉妬系 40〜60%）。
- 禁止：点検を弱めて通す、R18 専用ファイルを全年齢版に入れる、実在作品名・特定の国の人をまねる口調、未成年を想定した仕組み（全員成人）。
- 判断に迷ったら本文の推奨に従い、報告に「こう決めた」と書く。止まるのは §7 の確認点だけ。

---

## 1. アンケートの増分 109 件（10/25 2:07〜14:04）の仕分け

### 1-1. 数字
- 好きな箱庭：出られない部屋 19、媚薬ロッカー 15、邪神村 11、ゾンビ 10、オメガ 10、宇宙船 6、マッサージ 6。
- 優先：有料版の R18 30、新しい箱庭 15、口調の精度 13、二人で進展する恋愛 13、新しい口調 13、個人行動の細分化 9、3人以上のわちゃわちゃ 8、ドロドロ 6。
- 楽しい：推し CP の交流 43（群を抜く）、ランダム性 14、成人向け 14、性格差 12。
- イベント追加が欲しい箱庭：出られない部屋 23、媚薬ロッカー 14、邪神村 7、オメガ 7、無人島 6。
- 少人数版（設問 G）への回答 33 件：同居・シェアハウス・同棲 9、デート・旅行・日常を眺める 6、3P／1人を複数で 5、Dom/Sub 2、監禁 2、恋愛リアリティショー 2、職場 2、ボードゲーム・オンラインゲーム 2、ほか（勇者と魔王、潜入捜査、ホラーゲーム実況、西部劇、サナトリウム、吸血鬼、お見舞い、告白特化）。
- 傾向：前回より「出られない部屋」「同居・日常」「夜の性格」「一途・浮気しない設定」「3人の円満交際」「師弟・主従の上下関係イベント」が増えた。「設定が守られない」系の不満は減り、「口調のブレ」「表記の向き」など仕上げの不満が残る。

### 1-2. すでに入っているもの（告知で返す）
| 要望 | 入ったもの |
|---|---|
| キャラ間は攻め、モブには受け（#329） | 住人の設定「モブには受け」（posNpc） |
| 本命機能（#333） | 関係「本命」 |
| 上司と部下（#383）、両片想い（4件）、片想い・幼馴染・親友・同僚・先輩後輩 | 関係性にあり |
| 恋人がいるのに他に片想いしない一途設定（#348） | 「恋愛相手の固定」＋「本命」＋「性行為の相手を固定：恋人だけ」で可。説明を設定画面に足す（§5-C） |
| 感覚遮断穴で攻めが搾られる／受けが反抗（#330） | 攻めは「モブには受け」で可。反抗はフェーズ 12 で足す |
| 困惑・放心・受容エンド | フェーズ 4・6 で対応 |

### 1-3. 新しく拾う要望と、入れるフェーズ
| 優先 | 要望（件数） | フェーズ |
|---|---|---|
| A | 「結果と結末」の時刻・時期の文字が見づらい（ライトで白文字・ダークで黒文字。#365） | 12（即日） |
| A | 受け攻めを固定していても結果の表記が 受け×攻め になる（#373） | 12（即日） |
| A | 口調ミステリアスの「〜なのさ」が名詞に付くと不自然（#310）、冷静の語尾を丸めた口調／三点リーダーの少ないダウナー（#334）、男性の中性的な口調をもっと（#394）、神らしい尊大な命令口調（#314）、口調の自由入力（#382） | 12 |
| A | 恋人の日常・同居・シェアハウス・デート・旅行を眺める箱庭（15 件以上） | 10 → 11 |
| A | 3人で円満に付き合う／二人で一人を愛する／1人を複数で（#358・#319・#395・#324） | 9 |
| A | 夜の性格（サド・マゾ・意地悪・甘々）、表と夜のギャップ、相手ごと（#315・#406・#408） | 8 |
| A | 感情の見える化・表情差分（前回 2 件＋予告） | 7 |
| B | 師弟・主従の「仲の良さ」と上下関係イベント（嗜める・試練・下剋上・破門。#327・#338・#343・#369・#403） | 9.5（関係の段階） |
| B | 主従で従者が主人を襲わない／主従逆転（#338） | 9.5 ＋ 内容のスイッチ force |
| B | 「苦手・避けている」（敵視される側の反応。#327）、一方的な好意・敬愛・苦手意識（#319・#367・#394）、興味なし（片方だけ。#354） | 9.5 |
| B | 熟年夫婦・祖父母と孫・子育て・引き裂かれた二人・盲信・年上の憧れ（#344・#371・#405） | 9.5（夫婦の cold に「熟年」、気持ちの関係に「盲信」） |
| B | きょうだい（恋愛なし）のイベントが薄い（#389）、擬似兄弟の組み合わせ差分（#333） | 10（家族の日常場面） |
| B | 女性の胸の大きさ、体格差（#333、前回 3 件） | 8 |
| B | 住人に複数グループ、グループの表示／非表示（#389・#327） | 12 |
| B | 同一人物・別次元の自分（#307・#399） | 8（属性「同一人物」。恋愛は不可、鏡の場面） |
| B | 快楽堕ちしても心は折れない「精神力」補正（#405） | 8（属性 `will`）＋ R18 の堕ち判定 |
| B | 女×女の玩具の描写、クラスメイトに R18（#333・#307） | 12（R18 文の追加はタグ付きで） |
| C | 新箱庭の題材：恋愛リアリティショー、職場、ボードゲーム、ホラゲ実況、サナトリウム、吸血鬼パロ、アイドル、陣営バトル、デート特化、告白特化、お見舞い、終電後のファミレス | 11 の次（§6） |
| C | パパ活・感覚共有・共有の嫁・オークション・人間農場・拷問（#402・#390） | 内容のスイッチの新タグ候補。今回は見送り、報告に書く |

---

## 2. コードの現状地図（探索を省くための要約）

### 2-1. 結末
- `endings.js`：`E.build(res)`(49-58) が `E[res.scenId](res, X)` → なければ `{headline: res.outcome, stats:[], lines:[]}`。`res.end.notes` と「主な関係」を足す。形は `{headline, stats:[[label,value]], lines:[], after?(HTML)}`。描画は `view.js endingBlock()`(353-359)・`V.toText`(403-414)・`share-card.js:127`。
- 箱庭別ビルダー：omega 60、whiteroom 82、goukon 125、classroom 150、island 172、trial 214、br 259、zombie は `zombie-events.js:587`。物語型（jashin・yakata・ship・dungeon・solo-*）は `ST.result`（`solo-story-kit.js:118-131`）の `res.ending {title, kind, lines}`。
- 「その後」の後付け：`island-after.js`(33-62)、`dungeon-end.js`(262-274)、`omega-after.js`（記録の中）、`locker-crowd.js:497-525`、`room-trio.js:855-868`、`hole-end.js`、`jinro-after.js`、`jashin.js JS.LOOP.epilogue`(589)。**共通の枠はない。**
- 死：`Ctx.kill`(364-392) が `fate/deathLabel/deathHow/killedBy/fateNote`、`E.deathLines`(32-45)。最期の言葉は箱庭ごと（`zombie-bite.js:181 BITE_LABEL`、`zombie-letter.js`、`mini-extra-b.js:78`、`jashin-npc-text.js:19`）。**共通の枠はない。** 生き残り側は `grief-kit.js`（`flags.loss`、`G.install` 366、対象 zombie/island/classroom/whiteroom/omega/br/trial）。
- 結果オブジェクト：`engine.js finalize`(828-871) `{seed, scenId, env, log, history, pairs, chars, outcome, end, factions}`。`chars[i]`(888-926) に感情・ストレスの項目はない。`pairs[i].series` が折れ線（`view.js spark` 174-191）。

### 2-2. 感情
- 関係値 `ctx.rel[a][b] = {aff, trust, ten, att}`、`Ctx.mod/mod2`(208-235) 経由のみ。減衰 527-528。
- `c.stress` 0〜100（`Ctx.stress` 236、毎ステップ −3）。UI に出ない。
- `pf.*`：`brokeAt`・`abFree`・`hb*`（heartbreak）・`ob`（執着）・`tieGrow`。`c.flags.grief/revenge/loss/mobHit`。
- 物語型は `p.m`（jashin `{fear,hp,clue}`、yakata `{fear,sus,clue}`、succubus `{ml,mana,plea,mood}`）。`ST.snap` が `S.hist` に積み、`card()/chart()` で描く。
- UI に出るもの：`ctx.history` の関係値の折れ線、関係図 `mapSvg`、`markRel` の節目チップ、`charCard` の fate/fateNote/notes。**感情の値そのものは出ない。**

### 2-3. 属性
- `perFields`（箱庭ごとの住人欄）：`ui.js:645` 描画、`S.per[charId][scenId].pick`、`input.perChar[i].pick` → `c.pick`。手本 `special.js SP.FIELD`(38) と `HK.Roles.field`（`mob.js:46-87`）。
- 住人の共通欄（`ui.js normChar` 86-115、`buildInput` 729）：`gender(''/m/f/x)`・`likes`・`pos`・`posLike`・`futa`・`daku`・`noR18`・`posNpc`・`alcohol`・`partWords/partM/partF`・`age`・`bmonth`・`loveLock`・`sexLock`・`loveNG`。**種族・体格・夜の性格はない。**
- オメガの第二性：`scenario-omega.js:73-80 perFields`、`c.om = {sex, sw, job, heat, rut, hidden, …}`(146-175)。読むのは omega-*.js・`obsess-omega.js`・`drunk.js:149-155`・`incidents-extra.js:128` だけ。

### 2-4. 複数人交際
- `pf.couple` は組ごとの真偽。**一人一恋人の強制はない**（`events-common.js confess` 144-160 はその組の `!pf.couple` だけ見る）。
- `loveSet`(488)、`coNG`(491-505：同じ人の恋人どうしは恋愛・R18 不可。間に恋愛系の関係があれば可)、`lock`、`sexLock`、`honmei`（`HK.honmeiFactor` 102-108、`act()` 645）。
- 浮気の印 `markRel`(577-616)：恋人が同じ場面にいれば浮気にしない、開始時点で両方と恋人なら浮気にしない（609）。
- 二股：合コン `GC_TWO`(265-287)・580-597。オメガは一夫一妻（`partnerOf` 45-49）。
- 三人：`room-trio.js`（`ctx.flags.trios` love/lovehub/loveclash、`BOND_LABEL` 三人婚ほか）、`locker-crowd.js`、`rel-group.js`（`loverOf`(20) は最初の恋人だけ返す）。

### 2-5. 日常・場所・登録
- 共通イベント `HK.COMMON`（`events-common.js`）。`HK.buildPool(scen)`(290-294)。`mini.js` の DSL `E(id, cat, scope, w, when, effects, texts)` → `HK.MINI[scenId]`。
- 日常の部品：`tie-rel.js`（ふだん・保つ・深まる。zombie/whiteroom/omega は ×0.35）、`classroom-life.js`（行事カレンダー）、オメガのデート `OM.DATES`（`omega-data.js:39`）。
- 場所：`ctx.place` は箱庭に 1 文字列（`{place}`）。同じ場所にいる人は `scen.othersFor`(184-191)、実装は zombie だけ（3×3 の `c.z.area`）。
- エンジン型箱庭の登録：`HK.SCENARIOS[id]`＋`HK.SCEN_ORDER`、項目は `id, name, kicker, desc, lethal, exclude, perFields, env, stats, actions, goals, steps(env), setup, phase, after, end, finish, classify, pairText, charNote, othersFor, events`。主ループ `HK.simulate`(441-549)。人数 `minCast/maxCast`（`ui.js:21-22`）。

---

## 3. 全体の順番と並行

```
フェーズ 7（結末・感情）  ─┐
フェーズ 8（属性・夜の性格）─┼─ 並行可（触るファイルを分ける）─→ フェーズ 11（二人の箱庭「ふたりの日常」）
フェーズ 9（複数人交際）  ─┤
フェーズ 10（日常・場所キット）┘
フェーズ 12（アンケート小改善・口調）── いつでも。A の 2 件は即日
フェーズ 9.5（関係の段階：師弟・主従・苦手） ── 9 のあと
```

並行するときの取り決め：
- 新しい仕組みは**新しいファイル**に置く（`emotion.js`・`epilogue.js`・`attr.js`・`poly.js`・`daily-kit.js`・`place.js`）。`engine.js`・`ui.js`・`view.js`・`endings.js` への変更は「呼び出しを 1〜3 行足す」までにし、関数の中身を書き換えない（取り込み側で衝突を避けるため）。
- `_order.txt` に足す行は、各フェーズで指定した位置に 1 行だけ。
- 住人の新しい欄（§8）は `ui.js mk/normChar/rosterJSON/import/buildInput` の 5 か所＋`ui-gear.js` の描画・入力の決まった手順（`daku` の手本）に従う。欄の id は衝突しないよう本文のものを使う。

---

## 4. フェーズ 7：基盤 7「結末・後日談・最期の言葉の共通枠」と「感情の持続と表示」

### 7-a　感情の値 `HK.Emo`（新 `js/emotion.js`、両ビルド。`engine.js` の直後、`state.js` のあとに読む）
住人ごとに**持続する気分**を 1 か所に持ち、出来事の重みと文に効かせ、結果に見せる。

```js
c.emo = { joy, grief, fear, anger, shame, lust /*R18版だけ*/ , calm }   // 各 0〜100
HK.Emo.bump(ctx, c, { grief: +40 }, why)  // 立てる。why は記録の why に足す
HK.Emo.tick(ctx)                          // 毎ステップの減衰（grief は遅く、anger は速く。stress と連動）
HK.Emo.mood(c) → 'calm'|'joy'|'grief'|'fear'|'anger'|'shame'|'lust'  // いちばん高いもの（35 未満なら calm）
HK.Emo.face(c) → 表情の id（neutral/smile/cry/fear/angry/blush/dark）  // 表情差分の土台。画像は持たない
HK.Emo.word(c) → 地の文に挿せる短い一句（態度9種×気分7種×3文以上。「{a}はまだ笑えなかった」など）
```
- 立てる場所（最小）：`Ctx.kill`（殺した側 shame/anger、周り grief・fear）、`grief-kit.js` の `loss` 設定時（grief）、`heartbreak.js`（shame・grief）、`markRel` の break/cheat（anger・grief）、`obsess-kit.js` の監禁・暴走（fear／被害側、lust／執着側）、`tie-abuse.js`（fear）、R18 の山場（lust。全年齢では立てない）、祝福・両想い（joy）。
- 効かせる場所：`act()` の候補の重み（`engine.js:645` の honmei の隣）に `HK.Emo.weight(ctx, a, ev)` を掛ける（grief が高い人は romance ×0.4・bond ×1.3、anger は conflict ×1.6、fear は solo ×1.5）。`Ctx.t` のあとに `HK.Emo.word` を 25% の確率で前置き（1 ステップ 1 回まで、`kind` が step/phase/death 以外）。
- 物語型：`ST.state` の `p.m` を `HK.Emo` に寄せない（壊すため）。`p.emo` を別に持ち、`ST.say` の前後で `bump/word` だけ使う。対象は jashin・yakata・ship（死のある 3 箱庭）。
- `snapshot()` に `emo:{i:[joy,grief,fear,anger]}` を積み、`charSummary` に `emo`（最終値）と `moodPeak`（いちばん高かった気分とそのステップ）を載せる。
- 表示（`view.js charCard` 232-245 の下）：気分の小さなバロメーター（4 本の横棒）と `HK.Emo.face` の絵文字相当の記号（画像は後。`data-face` 属性を付けて、将来の表情差分の差し込み口にする）。全年齢版も同じ（lust は出さない）。
- `HK.SAFE_ON` では lust を常に 0。

### 7-b　結末・後日談・最期の言葉の共通枠 `HK.Epilogue`（新 `js/epilogue.js`、両ビルド。`endings.js` の直後）
```js
HK.Epilogue.last(ctx, c, how)        // 最期の言葉：態度9種×死に方（kill/accident/sacrifice/suicide/disease）×3文以上。恋人・本命・執着の相手がいれば宛先つき
HK.Epilogue.after(res, c)            // 一人ごとの「その後」：fate（生存/脱出/死亡/監禁/堕ち）× 気分の最終値 × 関係（恋人がいる/失った/一人）で 1 文。島・ダンジョン・ロッカーの既存を移さず、ない箱庭に足す
HK.Epilogue.pairAfter(res, p)        // 組ごとの「その後」：label（lovers/fwb/ex/…）× 二人の気分
HK.Epilogue.build(res, E)            // E.build の最後に呼ばれ、E.lines に「その後」を最大 8 行、E.last に最期の言葉を足す
```
- `Ctx.kill` で `c.lastWords = HK.Epilogue.last(...)` を立て、死の記録の末尾に「――{a}の最期の言葉：『…』」を 60% で足す（`lewd-unify.js:86` の最期の一文の差し替えより前に実行。全年齢版は穏当な言い回しの表）。
- `E.build` の末尾（`endings.js:58`）で `HK.Epilogue.build(res, E)`。既存の後付け（island-after・dungeon-end・locker-crowd・room-trio）が既に「その後」を出した人は飛ばす（`c.afterDone` を立てる）。
- 物語型は `ST.result` の `ending.lines` に `HK.Epilogue.after` を足す（jashin・yakata・ship・jinro）。
- `view.js endingBlock` に `E.last`（最期の言葉）の節を足し、`V.toText`・`share-card.js` にも出す。

### 7-c　点検
- `state-audit` に S11：死の記録のあとに `lastWords` を持つ人が、別の人の最期の言葉を言っていない（名前の取り違え）。`text-audit` の T1 に `{a}` 残りを見る（既存）。
- 新しい `emo-audit.js`：全箱庭 N 回で、grief ≥60 の人が同じステップに romance の主役になった回数（0 であること）、気分の一句が 1 ステップに 2 回出た回数（0）、全員の気分が最初から最後まで calm のまま終わった回の割合（過半数でないこと）。

受け入れ：3 通りの全点検 0、`emo-audit` 0、regress は変わってよい。CHANGELOG「全体：結果に気分のバロメーターと最期の言葉・その後を追加」。

---

## 5. フェーズ 8：基盤 8「世界観の属性」と「夜の性格」

### 8-a　住人の共通欄（`js/attr.js` 新設、両ビルド。`pos.js` の直後）
| id | 欄 | 値 | 使う所 |
|---|---|---|---|
| `build` | 体格 | ''/small/avg/large（小柄・ふつう・大柄） | 二人の体格差で文を差し替え（抱き上げる・見下ろす・膝の上）。`HK.Attr.sizeDiff(a,b)` → 'a>b'/'b>a'/'' |
| `bust` | 胸（女性・R18 版のみ） | ''/s/m/l | R18 の地の文の差し替え語（`HK.Attr.bustWord`） |
| `race` | 種族 | ''/human/vampire/beast/demon/angel/ghost/other（人間・吸血鬼・獣人・魔族・天使・幽霊・その他）＋自由記入 `raceNote` | 文の飾り（耳・尾・牙・翼）、`special.js` の吸血鬼と統合（`race:'vampire'` なら `special:'vampire'` と同じ扱い） |
| `night` | 夜の性格 | ''/sadist/maso/mean/sweet/shy/none（サド・マゾ・意地悪・甘々・恥じらい・表と同じ） | R18 の `T.scene`・`X.scene`・`R18M.sex`・`omega-thick`・`room-thick` の style に優先（sadist→rough、maso→受けの崩れ方、mean→tease、sweet→gentle）。`HK.Ero.sadist` の判定に足す。全年齢では無視 |
| `nightFor` | 相手ごとの夜の性格 | `{相手id: night}` | 関係の行（`ui-gear.js:85`）に select。あればこちらを優先 |
| `will` | 心の強さ | ''/weak/avg/strong | 快楽堕ち・催眠・常識改変・遮断穴の「堕ちる」判定に掛ける（strong は体は落ちても心は折れない文に。`solo-kaihen`・`solo-saimin`・`solo-hole`・`dungeon` の fall 判定） |
| `same` | 同一人物 | 相手 id（任意） | 恋愛・R18 不可（`ngPair` に足す）。「鏡を見るような」会話の共通場面 3 本。結果の関係名「もう一人の自分」 |

- UI：`ui-gear.js` に「体と設定」の折りたたみ節を足し、R18 版だけの欄（bust・night・nightFor）は `daku` 方式。`mk/normChar/rosterJSON/import/buildInput` の 5 か所。実行時の住人 `engine.js:41`・`dungeon.js:700`・`solo-story-kit.js:15`・`solo-hole.js:136`・`solo-hole-behind.js:110` にも写す（`HK.Attr.copy(dst, src)` を 1 か所に）。
- 第二性の一般化：`c.om.sex` はそのまま。`HK.Attr.second(c)` → omega なら `c.om.sex`、ほかは ''。将来の Dom/Sub・ケーキはここに `c.attr.second` を足す形にする（今回は枠だけ）。
- 文の差し替え：`HK.Attr.flavor(c, kind)`（kind: 'touch'/'look'/'hold'）で種族・体格の一句を返す。`thick-sex.js` の体の感触の段・`omega-thick.js` の体の組み合わせの一文・`tie-rel.js` のふだんの場面に 1 か所ずつ差し込む（文が無ければ空）。
- 既存の「不死・吸血鬼」の perField は残す（箱庭ごとの役。race は全箱庭の見た目）。両方が吸血鬼のときは重複しない。

### 8-b　点検
- `pos-audit` に V5：`night:'maso'` の人が住人どうしの場面で攻めの文を言っていない（攻め指定は優先。maso は受け攻めを変えない）。
- `state-audit` S12：`same` の二人が恋愛・R18 の記録に二人だけで出ていない。
- `text-audit` で `{race}` 系の印の残り 0。

受け入れ：全点検 0、`sex-audit` の重複 ≤0.5%。CHANGELOG「住人・関係：体格・胸・種族・夜の性格・心の強さ・同一人物」。

---

## 6. フェーズ 9：基盤 9「複数人での交際」

### 9-a　恋人の組 `HK.Poly`（新 `js/poly.js`、両ビルド。`ties.js` の直後）
- 全体の設定 `HK.GLOBAL_ENV` に `poly`（select：なし＝一人一恋人／あり＝複数の恋人を認める／秘密＝複数は持てるが互いに知らない）。**既定は「なし」**（今は仕組みがなく実質「あり」なので、既定を変えると挙動が変わる。§7 の確認点 1）。
- `HK.Poly.lovers(ctx, c)` → 恋人の配列（`pf.couple` を集める。`rel-group.js loverOf` はこれに替える）。
- `HK.Poly.canCouple(ctx, a, b)`：「なし」なら a・b のどちらかに恋人がいれば偽（本命がいれば本命以外は偽。`events-common.js confess` 144-160・各箱庭の告白成功・`fwb.js` の恋人化・オメガの番で呼ぶ）。「あり」「秘密」なら真。
- 「なし」で恋人がいる人が別の人と恋人になりそうなとき（既存の二股になり得る箇所）：**乗り換え**の出来事に替える（`markRel` の break を立て、前の恋人に `grief`、`brokeAt`）。合コンの `GC_TWO` は「あり」のときだけ今の二股に。
- 「あり」：`ctx.flags.polyGroups` に `{members:[…], hub?, known:true}` を持つ。`room-trio.js` の `trios` と `locker-crowd.js` はこれを使って登録する（ラベル lovehub ⇔ hub あり）。結果の `pairs` のラベルに `polyamory`（「三人で円満」）・`hub`（「一人を二人が愛している」）を `HK.LABELS` に足し、`E.build` の「主な関係」に組で出す。
- 「秘密」：`known:false`。`markRel` の cheat/affair は「秘密」のときだけ立つ。発覚の出来事 `poly_found`（共通、嫉妬系）→ 修復／破局の分岐（`rel-bad-engine.js` の形）。
- 仲良し系の共通場面（`rel-group.js`）に、円満な 3 人の日常 3 本（朝の順番・買い物・寝る位置）を足し、`group-audit` の仲良し系に数える。
- 物語型（jashin・yakata・ship）は `S.poly` に同じ設定を写し、`loveSet` の作り方だけ合わせる（告白の成否は各箱庭のまま）。

### 9-b　「一途」の明示
- `honmei` の隣に、住人の設定 `faithful`（チェック：一途。恋人ができたら以後は他の人に惹かれない・浮気しない）。`canLove` ではなく `romanceOk` と `sexOne` に効かせる（恋人がいる間だけ）。モブからの一方的な場面は内容のスイッチの force に従う。

### 9-c　点検
- `state-audit` S13：`poly:'none'` の回で、同じ人が同じステップに 2 人以上と `couple` になっていない（`ctx.pf` を走査）。S14：`faithful` の人が恋人以外と恋愛・夜の記録に出ていない。
- `group-audit` の比率 40〜60%。

受け入れ：全点検 0。CHANGELOG「全体：複数人での交際（なし／あり／秘密）、一途」。

---

## 6.5　フェーズ 9.5：関係の段階（師弟・主従・苦手）

- `HK.TIES` の `mentor`・`master`・`boss`・`teacher` に `grade`（良好／ふつう／険悪。`coldOpts` と同じ仕組み）を足し、`tie-rel.js` のふだん・保つ・深まる場面を grade で 3 分岐（嗜める→素直／ヘソを曲げる、成功→「さすが」／「調子に乗るな」、失敗→激励／嫌味。各 3 文以上、態度 9 種で選ぶ）。
- 節目の出来事（共通、低確率）：`tie_trial`（試練・挑戦→認める／下剋上／破門）。結果は `tie.grade` の変更と `markRel` の印（`HK.MARK_NAME` に「破門」「一人前」「主従逆転」）。下剋上は R18 版で内容のスイッチ force が入のときだけ凌辱の分岐（`dark-thick.js` を使う）。全年齢では和解／決別。
- 主従の `master`：従者が主人を襲う分岐は force が入のときだけ（`tie-abuse.js` の形で `tie-master-r18.js` 新設、full のみ）。
- 敵視される側の `HATE_BACK` に `avoid`「苦手・避けている」：無視する・第三者を頼る・身代わりに対応させる（3 文以上）。
- 気持ちの関係に `fond`（一方的な好意・敬愛。恋愛にならない。`respect` との違いは「見守る・差し入れ」）と `blind`（盲信：相手に近づく人を排除しようとする。執着の purge 型の軽い版、恋愛にならない）。`spouse` の cold に `mature`（熟年：穏やかな場面、口数の少ない労い）。
- `likes:'none'` に「興味なし（片方だけ）」の説明を足す（既存の片方向 `canLove` で可能なことを UI で示す）。

受け入れ：`orient`・`pos`・`state` 0、`group-audit` 40〜60%。CHANGELOG「住人・関係」。

---

## 7. フェーズ 10：基盤 10「日常と場所の場面キット」

### 10-a　`HK.Daily`（新 `js/daily-kit.js`、両ビルド。`tie-rel.js` の直後）
- 場所の表 `HK.Daily.PLACES`：home（自宅：居間・寝室・台所・風呂・玄関）、town（カフェ・スーパー・公園・駅・夜の街・ファミレス）、trip（温泉・海・夏祭り・花火）、work（職場・学校）。各場所に `time`（morning/day/evening/night）の重みと、場所らしい小道具の一句 5 本以上。
- 出来事の部品（`mini.js` の DSL で書き、`HK.MINI.daily` に積む）：**殺し合いのない日常**を 60 本以上。
  - 二人：朝（起こす・寝坊・朝食）、食事（作る・外食・好き嫌い）、買い出し、掃除、風呂、寝る前、休日のデート、雨の日、体調不良のお見舞い（#389）、終電後のファミレス（#406）、些細なケンカと仲直り、記念日、ペット、写真。
  - 三人以上：当番・席取り・ゲーム大会・鍋・引っ越し・来客。
  - 家族（きょうだい・親子・親族。恋愛なし）：昔話・頼みごと・口うるさい・差し入れ（#389）。擬似兄弟は性別の組み合わせ（兄弟・姉妹・姉弟・兄妹）で呼び方と一文を変える（#333）。
  - 全部に `place` と `time` の条件、`rel`（lovers/friend/family/colleague/any）、感情の条件（`HK.Emo.mood`）。
- `HK.Daily.install(scen, {places, weight})`：箱庭に日常の部品を混ぜる。既存の箱庭では classroom・omega・island（平穏な月）・whiteroom（長い閉じ込め）に弱く（×0.3）、フェーズ 11 の箱庭では主役。
- 場所の状態：`ctx.place` を文字列のまま使うが、`HK.Daily.at(ctx, c)` → 今いる場所 id（箱庭が `scen.places` を持つときだけ動く。zombie の `othersFor` は触らない）。`Ctx.t` の `{place}` はこれを優先。

### 10-b　点検
- `text-audit` T1 に `{place}` の残り。
- `group-audit` の仲良し系に日常の三人の場面を数える。
- 新しい `daily-audit.js`：classroom・omega を N 回回し、同じ日常の文が 1 回に 2 度出た回数（≤1%）、場所と時間帯の矛盾（夜に学校の授業、朝に夜の街）0。

受け入れ：全点検 0。CHANGELOG「全体：日常の場面を追加（クラスメイト・オメガバース・無人島・出られない部屋）」。

---

## 8. フェーズ 11：二人の箱庭の第一作「ふたりの日常」（2〜3 人）

- 題材は増分アンケートの最多「同居・シェアハウス・デート」。エンジン型、`minCast 2 / maxCast 3`、`lethal:false`、R18 は内容のスイッチと `night` に従う。全年齢版にも出す（夜は「同じ布団で眠った」まで）。
- env：`days`（7〜90 日）、`living`（同居／別居でデート／シェアハウス）、`season`、`pace`（恋愛の進み：ゆっくり／ふつう／早い）、`r18`（既存の lewd・style の統一欄）。
- 1 日 = 朝／昼／夕／夜の 4 ステップ。場所は `HK.Daily.PLACES` の home・town。`steps(env)` は日付と曜日のラベル。
- 出来事は `HK.Daily` の部品＋`tie-rel`＋`HK.COMMON`（conflict は ×0.4）。3 人のときは `HK.Poly` の設定に従い、三角関係（嫉妬系）と円満（仲良し系）を半々に。
- 関係の進み：出会い→友人→両片想い→恋人→同棲→（結婚の約束）。節目は `markRel` の印に `propose`（指輪交換だけの結婚。#353）を足す。
- 結末：`HK.Epilogue` の「その後」＋「二人の N 日の記録」（デートの回数・ケンカの回数・いちばん幸せだった日）。表情差分の差し込み口（`data-face`）はこの箱庭で最初に目立たせる。
- 設定画面のカード説明・TIPS・アンケートの選択肢の文言を同じコミットで。

受け入れ：2 人・3 人で各 100 回例外 0、全点検 0、同じ日常の文の重複 ≤1%、R18 版で `night` ごとに夜の文が変わることを目で確かめる。

---

## 9. フェーズ 12：アンケートの小改善・口調（いつでも。A は即日）

### 12-A（即日）
- **結果の時刻・時期の文字色**（#365）：`view.js` のステップ見出し（`.step`/`.when` 相当）の色を `--fg` 系の変数にし、ライト・ダーク両方で読めるように。`share-card.js` も同じ変数。
- **結果の組の表記を 攻め×受け に**（#373）：`ui.js summarize`(744-748)・`endings.js pn`(22)・`E.*` の `nm(a)+'×'+nm(b)`、`view.js pairCard`、`share-card.js` を `HK.Pos.order(a, b, [a, b])` の順にする共通関数 `HK.pairName(res, p)` に寄せる（向きが決まらない組は index 順のまま）。女×女・リバどうしも `order` に従う。

### 12-B（口調）
- ミステリアス：名詞＋「なのさ」を「だよ」「さ」に寄せる辞書行を 20 本以上（#310。`tone-fix-g2.js` の mystic、報告の例「二人だけの秘密なのさ」→「二人だけの秘密、さ」）。
- 新口調 `cool_soft`「冷静（丸い）」：`derive:'cool'`、言い切りを柔らかく（「……そうか。聞いていなかったな」→「そう、聞いてなかった」）、三点リーダーを半分に（#334）。`darui_lite`「けだるげ（軽）」：三点リーダーを 1 つまで。
- 新口調 `boku_n`「中性的（僕）」：男性の中性的な話し方をもう 1 種（#394。`gentle_n` との違いは一人称「僕」既定・語尾「〜かな」「〜だね」）。
- 新口調 `god`「神の命令口調」：尊大の派生、「〜せよ」「〜であろう」「我」（#314。邪神村の神・信仰の相手に合う）。
- **口調の自由入力**（#382）：住人の設定に `toneCustom`（語尾の付け替え表を 5 行まで：「です→っす」「だ→だぜ」）。`HK.toneFinish` の最後に適用。辞書には入れない（崩れを避ける）。

### 12-C（設定画面の説明と小さな機能）
- 「一途にしたい人は：恋愛相手の固定＋本命＋性行為の相手を固定「恋人だけ」」を TIPS と該当欄の説明に（#348）。
- 住人の複数グループ（`group` をカンマ区切りで複数可、絞り込みはどれかに一致。#389）、グループごとの表示／非表示（`ui.js` の一覧にトグル。#327）。
- 感覚遮断穴：受けが強気に反抗する分岐（態度 proud/stern/tsun で 3 文以上。#330）、快楽堕ちの「向こう側から引き戻される」結末（#362。force 入のときだけ）。
- 女×女の玩具の描写を `thick-sex.js` の ff に 6 本（R18 版。#333）。
- クラスメイトの R18 は見送り（全員成人として扱うが、学園が舞台のため R18 は入れない方針。報告に書く）。
- 内容のスイッチの新タグ候補（パパ活・感覚共有・共有・オークション・拷問）は今回は見送り。アンケートの回答として件数だけ報告。

受け入れ：口調は `collect → report → lint` で新口調の「元のまま」が後輩と同程度以下、`lint` の一人称不一致 0。CHANGELOG「口調・呼び方」「表示・その他」。

---

## 10. 製作ルールへの追加（16 条に足す）

| ルール | 実装での形 |
|---|---|
| 大きな出来事は感情として残す | `HK.Emo.bump` を立て、`act()` の重みで次の出来事を変える。何事もなかったような文を出さない（`emo-audit`） |
| はじめから結末・後日談・最期の言葉 | `HK.Epilogue` を通す。箱庭専用の「その後」は `c.afterDone` を立てる |
| 住人の属性は欄で、文は `flavor` で | 種族・体格を文に直書きしない。`HK.Attr.flavor` から引く |
| 恋人の数は設定で決める | `HK.Poly.canCouple` を通さない恋人化を書かない |
| 日常の出来事は場所と時間を持つ | `HK.Daily` の部品は `place`・`time` の条件を必ず持つ |

---

## 11. 確認が要る点（止まらずに進め、報告で明示）

1. フェーズ 9 の `poly` の既定を「なし」にすると、今まで起きていた二股（合コン・部屋・ロッカーの三人）が「乗り換え」か「設定を変えたときだけ」になる。既存の挙動を残すなら既定を「あり」にする。推奨は「なし」（アンケートの「一途に」要望が多い）。
2. フェーズ 8 の `night`（夜の性格）は作風（style）に優先させる。作風を選んでいた人の夜が変わる。
3. フェーズ 12 の「クラスメイトに R18 を入れない」方針の確認。
4. フェーズ 11 の箱庭名「ふたりの日常」（仮）。

---

## 12. 報告の形（各フェーズの終わり）
- 入れた変更（コミット一覧と利用者向けの一行）、触ったファイル（両ビルド共通／full のみ）
- 点検の数字（orient・pos・state・text、3 通り。R18 を触ったら sex-audit、複数人の恋愛を触ったら group-audit）
- 「ここはこう決めた」と §11 の確認点
- CHANGELOG に足す箇条書き（そのまま貼れる形）

---

## 13. フェーズ 13：展開の重さ（穏当派と過激派の両方に）

アンケートで「穏当な展開が好き」と「無理やり系・バッドエンドが好き」に分かれた。合意のない展開は内容のスイッチ（既定は切）で選べるが、**死・心中・監禁・危害・破局・浮気・失恋・発狂・堕ち・全滅・襲撃・恨みの殺し**をまとめて上げ下げする設定がなかった。それを全体の設定一つにした。

### 13-a　`HK.Dark`（新 `js/mood-dial.js`、両ビルドで同じ中身。`content.js` の直後）
- 全体の環境値 `heavy`（select、既定 `normal`）：`mild`「穏やか：死・心中・監禁・破局が起こりにくい（起きないわけではない）」／`normal`「ふつう」／`dark`「重い：起こりやすい」。島の「飢えの果て」がすでに `env.dark`（yes/mild）を使っているので、**id は `heavy`** にした。`all: 1` を付け、物語型の箱庭（`ui.js genv`）にも出す。
- 渡し方：エンジン型は `GLOBAL_ENV` から `ctx.env.heavy`。物語型は `ST.state`・`SoloKit.state`・`DG.simulate` で `env.heavy` を写す（`S.env.heavy`）。
- 関数（どれも「ふつう」では 1・元の値を返し、乱数も引かない。**ふつうの結果は前と同じ**：regress と同じ配役で `heavy` を除いた指紋が、r18・safe・全年齢版の全箱庭で一致）
  - `f(ctxOrS, kind)`：悪いことの確率・重みに掛ける倍率。kind は `kill shinju cage harm breakup cheat heartbreak madness fall raid wipe grudge`（＋人狼の夜の `night`）。穏やか 0.35（fall・wipe 0.5、night 0.7）、重い 1.8。
  - `live(x, p, kind)`：助かる確率 p を「失敗する側 ×f」に直す。`pace(x)`：執着が積もる速さ（0.6／1／1.4）。`skip(x, kind)`：穏やかのとき、まれに重い展開を見送る。`pick(x, 穏やか, ふつう, 重い)`：しきい値など。`endings(x)`：結末を選ぶときの悪い結末の重み（0.4／1／1.6）。`note(x)`：「展開：穏やか」「展開：重い」。`cheat(ctx, a, b)`：その二人の恋愛が浮気になるか。
- 穏やかでは、内容のスイッチの `force`・`violence`・`abuse` を入れていても切として扱う（`HK.Content.on` を包む）。R18 が中心の箱庭（`HK.Content.CORE`）は題材なので効かせず、そこでは堕ちが遅くなるだけ。

### 13-b　差し込んだ所（どれも 1 行。関数の形は変えない）
- エンジン：`act()` の候補の重み（`combat`・`kill` に kill、`betray` に grudge、恋人のいる人のほかの人との恋愛に cheat）、相手選びの仇討ち（grudge）、`Ctx.fight` のとどめ（kill）。
- 執着（`obsess-kit.js`・`obsess-story.js`）：積もる速さ（pace）、暴走を見送る（skip）、監禁・危害・心中の重み、恋敵を殺す確率、心中を引き止める確率、嫉妬が執着に変わる確率。重いでは執着度 70 で暴走し、嫉妬深さ 0.5・惹かれ 60 でも執着に変わりうる。
- 別れ・浮気・失恋：合コンの二股の「別れを選ぶ」・問い詰めての別れ、オメガの破局の重み・浮気を許すか（2 か所）、失恋の出来事の重み、きょうだい（不仲）・不仲の衝突（grudge）、喪失の無茶（harm）・崩れる（madness）。発狂は `special.js SP.wear`。
- 物語型：邪神村（罠・村人の襲撃と抵抗・錯乱・祠の呪い・生贄を隠れて逃れる／生贄の座が空く・儀式の夜の逃走・暴力の衝動・魔術師の制裁・場所と神の出来事の死・神の顕現で村ごと呑まれる・重いでは封印がしくじりやすい・封印後の崩落）、吹雪の館（連続殺人・指名の殺人・犯人の最後の動きの自害と襲撃は endings・推理の場で襲われる・愛憎の殺人と守り）、ゾンビの街（咬まれても感染しないことがある・飢え・絶望と引き止め・置き去り・群れに呑まれる・傷の化膿・腕を切って助かる・仲間が助けに入る・咬まれる危うさ・略奪者・ゾンビや略奪者に襲われる）、宇宙船（調査中の死・事故・全滅の危機の起こりやすさと食い止める見込み・遭遇・感染症の始まり／治る／うつる・連れ去り）、人狼（穏やかでは襲撃が空振りする夜がある）、塔（倒れても踏みとどまる・祈りと回復薬・受ける傷）、ロッカー（自分から求める・強引に）、堕ち（常識改変の「呑み込まれる」しきい値、催眠の快楽堕ちの積もり方と結末の重み、遮断穴・ダンジョン・マッサージの `S.k`）。
- 倍率だけでは「穏やか ≤0.5×」に届かない所（死ぬ機会が多く、生き残った人がまた危険に会う）は `pick` で強めた：邪神村の顕現で呑まれる（0.05／1／2）・封印の成功率（1／1／0.8）・儀式の夜の逃走（+0.6／0／−0.2）、吹雪の館の連続殺人（0.2／1／1.8）、ゾンビの感染しない（穏やかで 75%）・咬まれる危うさ（0.8／1／1.6）、塔の踏みとどまる（穏やかで 80%）・受ける傷（0.85／1／1.15）、執着の心中・危害の重み（0.6／1／1.6）。
- 結果：`endings.js E.build`・`ST.result`・`SoloKit.finish`・`DG.finish` で、ふつう以外なら結末に「展開：穏やか」「展開：重い」を一行。説明は `tips.js` の環境値。

### 13-c　点検
- 新 `hakoniwa-tools/tone-check/dark-audit.js`：全箱庭を穏やか／ふつう／重いで N 回ずつ回し、死／回・心中・監禁・危害・物語型の暴走・別れ・堕ち・悪い結末の割合を出す。合否は「死＋暴走」の合計で 穏やか ≤0.5×ふつう・重い ≥1.3×ふつう、死ぬ箱庭（lethal、または物語型でふつうの死が 0.25／回以上）は穏やかでも死が 1 件以上。人狼・バトルロワイヤル・裁判デスゲーム（全年齢版）の脱落はゲームの決まりなので比を見ない（数は出す）。ふつうの「死＋暴走」が 30 件未満の箱庭は、比がぶれやすいので 3N 回まで足して判定する（穏やかでも死が要る、は最初の N 回で見る）。`--why` で死因の内訳。
- ついでに直したもの：催眠の「合意の上の催眠プレイ」の前置きで、R18 に参加しない人・向きの決まらない組に「エッチなのも、ちょっとなら」の文が出ていた（穏やかで合意のない展開が切になって表に出た。`solo-saimin.js` で除く）。邪神村で、連れ去られていた人が「生贄の身代わり」で解き放たれたあと、儀式の夜の「逃走」の場面に出ていた（`jashin-rel.js substitute` で、その場で逃げ延びた扱いに）。
- `text-audit` に `--env=` を足した（`collect` は `ENV=heavy=mild` で全体の設定も固定できる）。state・orient・pos・text・collect を 3 段階で回して 0 件。
