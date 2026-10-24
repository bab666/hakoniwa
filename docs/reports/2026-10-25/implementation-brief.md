# 箱庭シミュレーター：アンケート対応の実装指示書（Opus 5 向け）

作成日：2026-10-25　対象 HEAD：5af422b
元になった分析：Claude Docs「箱庭シミュレーター 要望の仕分けと製作ルール」（アンケート305件の仕分け）

この文書は、そのまま実装担当（Opus 5）へのプロンプトとして渡す前提で書いています。
「あなた」は実装担当を指します。コードの場所は 2026-10-25 時点の `hakoniwa-full/js/` 基準の `ファイル:行` で、
ずれていたら関数名・変数名で探し直してください。

---

## 0. あなたへの依頼の仕方

- リポジトリ `bab666/hakoniwa` で作業します。作業の決まりは `CLAUDE.md` に従います（両ビルド同期・更新履歴・ビルド・点検の4点は必須）。
- この文書の **§4 のフェーズを上から順に**、1フェーズ＝1〜数コミットで進めてください。フェーズの途中で止まるときも、
  そのフェーズの「受け入れ条件」のどこまで通ったかを報告してください。
- 各フェーズの冒頭に「このフェーズで触るファイル」を挙げていますが、網羅ではありません。`grep` で呼び出し元を全部洗ってから直してください。
- **設計上の判断で迷ったら、この文書の推奨に従って進め、報告で「ここはこう決めた」と書いてください。** 止まって質問するのは、
  §6 に「確認が要る」と書いた項目だけにしてください。
- 禁止：テストや点検を弱めて通すこと、R18専用ファイルを全年齢版に入れること、実在作品名・特定の国の人をまねる口調を作ること、
  未成年を想定した仕組みを作ること（全員成人として扱う）。

---

## 1. 目的と優先順位

アンケートの要望の半分以上は「設定したのに守られない」「口調・状態がずれる」に集約されます。
新箱庭や文の追加より先に、**設定・状態と食い違う文を出さない基盤**を入れます。順番は分析レポートの推奨どおり

> 基盤 1（状態の共通チェック）→ 3（口調の軸）→ 4（R18の進み具合）→ 2（関係の層）→ 5・6（内容のスイッチ・役割とモブ）→ 7・8 → 9・10

とし、各基盤と同時に、その基盤で直る A 優先の不具合・設定追加・箱庭ごとの改善を入れます。
基盤 7 以降（結末と感情の持続・世界観の属性・複数人交際・日常キット）はこの指示書の範囲外です（§4.8 に方針だけ書きます）。

---

## 2. 毎フェーズ共通の手順（省略不可）

1. `hakoniwa-full/js` と `hakoniwa-zenrei/js` の同名ファイルは必ず同じ変更にする。R18専用ファイル（`*-r18.js`、`ero-kit.js`、`thick-sex*.js`、`room-thick.js`、`dark-thick.js`、`solo-hole*`、`solo-kaihen*`、`solo-succubus*`、`solo-variety*`、`dungeon*`（zenrei は `dungeon-lite.js`）など、`diff -rq hakoniwa-full/js hakoniwa-zenrei/js` で full にしかないもの）は full だけ。
   全年齢版だけにある `scenario-trial.js`・`scenario-br.js`・`mini-br.js`・`mini-trial.js` も忘れずに同じ扱いを入れる。
2. js を足した・読み込み順を変えたら、両方の `js/_order.txt` を直し、`node hakoniwa-tools/build/build.js hakoniwa-full` と `… hakoniwa-zenrei` を実行して bundle と index.html を作り直す。
3. 読み込み順だけを変えた変更は、`node hakoniwa-tools/build/regress.js <ビルド> 6 r18`（`safe`、全年齢版も）の指紋が変更前と一致することを確かめる。
   文や確率を変えたフェーズでは指紋は変わってよい。
4. 点検（`hakoniwa-tools/tone-check/` で実行。Playwright は `/opt/pw-browsers/chromium` を使う）：
   - `node collect.js ../../hakoniwa-full out-full.json 40 r18` と `node collect.js ../../hakoniwa-zenrei out-zen.json 40` がエラー 0 で回る
   - `node orient-audit.js ../../hakoniwa-full 40 r18 --why`、同 `safe`、`node orient-audit.js ../../hakoniwa-zenrei 40 '' --why` が **O1〜O3 とも 0 件**
   - `node pos-audit.js ../../hakoniwa-full 40`、`--hot`、`--ff --hot`、全年齢版が **V1〜V4 とも 0 件**
   - §4.0 で作る `state-audit.js` が **0 件**（作った後のフェーズすべて）
   - 口調を触ったフェーズは `node report.js out-full.json out-zen.json` と `node lint.js out-full.json` も見て、触った口調の崩れが増えていないこと
5. `docs/CHANGELOG.md` のいちばん上の日付の節（なければ今日の日付で作る）に、利用者向けの言葉で箇条書きを足す。形式は既存の 2026-10-24 の節に合わせる（`・` 項目、全角空白＋`- ` の子項目、`該当の箱庭：` の行、R18 のものは「アップデート（R18）」の節）。
6. コミットメッセージは日本語で、何が利用者にどう効くかを 1 行目に書く。

---

## 3. コードの現状地図（探索を省くための要約）

### 3-1. 住人・組の判定
- 住人の設定（UI 側）：`ui.js:74 mk()`、`ui.js:86-119 normChar()`、保存 `ui.js:169 save()`、書き出し `rosterJSON` `ui.js:374`、読み込み `ui.js:437`、シミュレーション入力 `ui.js:682-707 buildInput()`。
  項目：`gender(''/m/f/x)`, `likes(''/m/f/both/none)`, `pos(''/top/bottom/riba)`, `posLike`, `tone`, `fp`, `you`, `call/callG/calls/keigo`, `futa`, `daku`, `loveLock`, `sexLock(''/any/lover/相手id)`, `loveNG[]`。
- 住人ごとの設定欄の足し方の手本は `daku`（R18 版だけに出るチェック）：描画 `ui-gear.js:174`、入力処理 `ui-gear.js:258 case 'daku'`、`mk/normChar/rosterJSON/import/buildInput` の 5 か所、消費側 `ero-kit.js:139-144`。
- 実行時の住人オブジェクト：`engine.js:38-48`（`Ctx` の生成）。`alive`, `out`, `flags.caged`（監禁されている側＝監禁した人の index）, `flags.cagePair`, `flags.down`, `lock`, `sexLock`, `ng[]`, `loveSet`, `coNG`, `minor`, `role`, `pick`。
  **別に住人オブジェクトを作っている所**（新しい項目はここにも写す）：`dungeon.js:700`、`solo-story-kit.js:15`、`solo-hole.js:128/136`、`solo-hole-behind.js:110`。物語型（solo）は `S.P[i]` と `special.js` の `A.alive(p)/A.here(p)` を使う。
- 判定関数（`engine.js:61-111`）：`HK.ngPairHard`, `HK.ngPair`, `HK.ngExplicit`, `HK.lockConflict`, `HK.sexNG`, `HK.sexBlocked`, `HK.lockSexOnly`, `HK.canLove`（片方向。両方向で呼ぶ）。`pos.js:88-109`：`P.orients`, `P.okSex`（= `okLove`）, `P.clash`, `P.genderOK`。`pos.js:170` で `HK.canLove` に `okLove` を重ねている。
- 場にいる人：`Ctx.prototype.present()` `engine.js:118`（alive かつ !out かつ caged でない）、`others()` `engine.js:121-126`、`say()` の最終防波堤 `engine.js:231-249`（監禁中の人が actors にいる出来事を `cageOk` なしなら捨てる）。
  **直接名簿をたどる所**：`ctx.chars.forEach` 51 か所（24 ファイル）、`ctx.chars.filter` 17 か所、`c.alive && !c.out` の手書き 16 か所。`ctx.alive()` は未使用。
- 呼び出し数：`HK.canLove(` 123 か所／44 ファイル、`okSex(` 72 か所／33 ファイル（局所ラッパー `obsess-omega.js:19`、`room-trio.js:68`、`scenario-room.js:364`）。

### 3-2. 口調
- 登録簿 `tone-registry.js:31-93 HK.TONES`（31 口調、`HK.TONE_KEYS`）。項目：`base, top, fp{m,f,x}, neutral/plain/calm/kansai, derive, egoTable, lines:'base', firm, group, reluct, sample`。二人称の既定 `HK.TONE_YOU` `tone-registry.js:106-113`。語尾付け替えの登録 `HK.toneFinish`。
- 基本 9 口調の台詞表：`persona.js:54-`（`V.CLIMAX/EDGE/AFTER/TALK`）。**穏やか（gentle）の表は女性語尾で書かれている**（`persona.js:58,69,80,112`）。
- 変換の本体：`V.processText` `voice.js:502-574`。順に 話し手の特定 `speakerOf`(415) → 辞書 `V.overrideFor`(537-548) → 一人称 `V.replaceFP`(551, 正規表現 `FP_RE` は `voice.js:22`) → **辞書に当たらなかったときだけ** `V.styleQuote`(552) → `HK.TONE_FINISH[tone]`(554-556) → 二人称 `V.applyYou`(558-559, `YOU2` は 486) → 呼び方 `V.applyCalls`/`V.callAddress`（`tone-plus.js:203-244`）。
  先頭が `⁠`（U+2060）の台詞は変換を丸ごと飛ばす（522）。
- 性別の語尾は「差し替え」ではなく「削る」正規表現：`voice-tone.js:374`（男性なら女性語尾を削る）、中性的 `neutral()` `tone-plus.js:56-61`（`gentle_n/tsun_n` は `tone-plus.js:155` で男性扱いにしてから）。`aniki()` `tone-plus.js:128-140` に「名詞＋よ→だよ」の例あり。
- 辞書：`tone-fix*.js`（`口調\t元\t書き下ろし`、g1〜g6・gc と各 `-r18`）、`voice-override*.js`、`tone-lines*.js`、`tone-mixed-more*.js`。**辞書は口調だけで引き、性別の次元がない**（`who.gender` を読む辞書はない）。喘ぎは `ero-moan-tone.js`・`novel-moan-tone.js` が恒等の FIX として登録（231-236）。
- R18 の攻めの台詞 `solo-r18-moan-data.js:116-250 D.V[tone].top/topc`（17 口調、男性前提の文）。女性攻めは山場の `topc` だけ `topcF` `solo-r18-moan.js:42-47` でふるう。`top` は無加工。口調が表にないときの落とし先 `toneKey` `solo-r18-moan.js:13-18`。
- 口調の点検道具：`tone-check/collect.js`（`TONE=cool FPS=私` で固定できる）、`lint.js`（一人称のずれも拾う）、`report.js`、`worklist.js`、`longest.js`。

### 3-3. 関係
- 定義 `ties.js:8-47 HK.TIES`、並び `TIE_ORDER`(98)、代表の優先 `PRIO`(183)、別名 `ALIAS`(101-122)、相手側の気持ち `coldOpts`(89-95)：`CRUSH_COLD`(57, 両片想いは `crush` の `cold:'mutual'`)、`HATE_BACK`、`OBS_BACK`(71-78, 5 種)、`WORSHIP_BACK`(83, `confused` あり)。`love:'ok'` で家族の恋愛あり（`tieNoLove` 195）。
- 適用 `HK.Ties.apply` `ties.js:220-273`（1 組に複数の関係を重ねられる。`get` は PRIO の先頭を返す）。
- 共通場面 `tie-rel.js`（`HK.COMMON` に push、zombie/whiteroom/omega は ×0.35 `tie-rel.js:13`）。箱庭ごとの専用場面 `room-tie(-r18).js`、`locker-ties(-r18).js`、`omega-ties(-r18).js`、`zombie-bonds/seek/letter/reunion.js`。
  重み・分類の表（新しい関係を足すたびに全部触る）：`feud-kit.js:12`、`hate-kit.js:36`、`rpg-special.js:9`、`jashin-drama.js:190`、`jashin-rel.js:11`、`ship.js:56,727`、`yakata.js:38,699`、`solo-hole-behind.js:17`、`solo-locker.js:46-57`、`solo-saimin.js:61`、`grief-kit.js:33,55,69`、`pair-react.js:29-30`、`jinro-after.js`、`jinro-love.js`。
  手本のコミット：`4c2a4ed`（同級生・上司と部下・信仰・恩人・親族を一度に追加）。
- 呼び方は関係ではなく住人に持つ：`c.calls[相手id]`（`ui-gear.js:154`）。`V.callFor` `tone-plus.js:175-185`。
- 執着の本体 `obsess-kit.js`（`O.stance` 114-123、`O.react` 259-275、`O.climax` 277-318、監禁 294/333、設置 `obsess-install.js:261-262`）。軽量版 `obsess-story.js`、オメガ版 `obsess-omega.js`。

### 3-4. R18 の組み立て
- 共通部品と使う箱庭：`thick-sex.js T.scene`(202-229, 合コン・部屋・ロッカー・solo-rel)、`thick-sex-ero.js X.scene`(141-154, 男性向け)、`solo-r18-moan.js HK.R18M.sex`(197-231, 邪神村・館)、`r18-thick.js`(邪神村・館の長い版 `mm()` 147-180、`soft()` 303-349)、`omega-thick.js`(オメガ・ゾンビ・漂流記)、`dark-thick.js`(非合意)、`room-trio.js sexScene`(314-478, 三人)。
- **段の概念は共有されていない**（各ビルダーが段落順を直書き）。重複回避は `HK.Ero.fresh/freshPick` `ero-kit.js:100-130`（`S.rng._fresh`）、喘ぎの `pickFresh`(84-96, `S._eroSeen`)、`E.pairNight`(117-123)。`Ctx.pick` `engine.js:129-140` は 4 回の再試行だけ。**記憶が 3 系統に分かれていて互いを知らない。**
- 段飛び・後出しの具体箇所：`r18-thick.js:167,177,329`（絶頂の地の文のあとに「果てる声」`moan(S,y,1)` を置いている）、`r18-thick.js:154,172-173` と `solo-r18-moan.js:210-211`（前戯→いきなり `pos.t + ENTER`、橋渡しの文がない）、`room-thick.js:124-131`（open）と `145-148`（tail に `ThickEro.again` の二度目の絶頂＋`{mb2}` が入り、`T.CLIMAX` のあとにもう一度イく）。`dark-thick.js:12` は生の `pk`、`room-trio.js` は `ctx.pick`。
- 小さすぎる表：`T.REACT`・`T.REACT_AGAIN`・`T.CMOAN` 各 3 文／態度、`room-thick.js:70 PEAK_PS` 3 文。
- 作風の切り替え：`lewd-unify.js HK.Lewd.install`（`lewd`/`lewdLen`/`style`）。**文に付けるタグの仕組みはない**（正規表現で中身を推定：`E.FORCE` `ero-kit.js:150` など）。オブジェクト形式で書かれていてタグを載せやすい表：`HK.TrioLines`（`{id,t,kinds,shapes,jeal,open,recv,…}`）、`D.POS`、`LW.SPECIAL`。

### 3-5. 箱庭の登録・設定欄・道具
- 登録：`HK.SCENARIOS[id]`＋`HK.SCEN_ORDER`。エンジン型（`steps/events/env`、`Ctx`）と物語型（`solo:true, simulate`、`HK.Story`／`K.state`）。人数は `minCast/maxCast`（既定 `ui.js:21-22`）。結末は `endings.js HK.Endings[id]`。
- 設定欄 `env[]` は `select`／`text`／スライダーの 3 種だけ（`ui.js:518-535 envItem`）。**チェックボックス型はない。** 全体共通は `HK.GLOBAL_ENV` `events-common.js:6`。住人ごとの箱庭専用欄は `perFields`（手本 `special.js:38 SP.FIELD`、`perChar.pick.<id>` で届く）。
- 出られない部屋：条件 `K` `scenario-room.js:10-24`、`rulesOf` 31-35、env 391-399。心中は `obsess-install.js:262` の `O.install(SC.whiteroom, {w:1.6, pace:3, cool:0})` に `shinju`/`lethal` の指定がなく、`O.climax` `obsess-kit.js:277-318` で起きる。
- 邪神村の夜：スライダー 1 本 `jlewd` `solo-jashin-r18.js:11`、分岐 `night` 296-370（夢／憑依／清めの湯／参加者どうし／夜這い）。神の夜 `solo-jashin-r18-god.js`。
- ゾンビ：略奪者 `zombie-npc.js:221-245`（性的分岐 236、`Z.raiderAssault` は `solo-zombie-raid.js:40`）、ゾンビに襲われる `zombie-bite.js:106`（0.1＋夜 0.05）。性欲の設定はない。
- 館：探偵と助手の結びつけ `yakata.js:104-108`、後継 `successor` 373、暴露 `reveal` 634-638、「先生」直書き `yakata-data.js:164,190,257,259`。蘇生 `yakata-special.js`、推理 `deduce/showdown` `yakata.js:548-600`、真相 `truthOf` 627（蘇生を見ない）。動機 `Y.MOTIVES` `yakata-data.js:51-136`。
- モブ：共通の名前生成はない。散在：`zombie-data.js:67`、`omega-mob.js:32`、`solo-saimin-data.js:12-28`、`solo-kaihen.js KH.SIT[k].npc`、`solo-massage.js:10-16 STAFF`、`solo-succubus.js SB.PREY`。
- 道具：`build/build.js`、`build/regress.js`、`tone-check/lib.js openBuild()`（点検はすべて headless Chromium で `HK.simulate` を回す。手本は `pos-audit.js:58-90`）、`text-studio/server.js`。

---

## 4. フェーズ別の実装指示

### 4.0　フェーズ 0：状態の点検 `state-audit.js` を先に作る

目的：フェーズ 1 の「直った」を数字で言えるようにする。`pos-audit.js` を写して `hakoniwa-tools/tone-check/state-audit.js` を作る。

実装：
- `openBuild` で開き、`page.evaluate` の中で **`HK.Ctx.prototype.say` を包んで**、呼ばれた瞬間の各 actor の `alive/out/flags.caged/flags.down` と、`o.kind`・`o.cageOk`・`o.text` を記録する。物語型は `HK.Story.say`（`solo-story-kit.js:36`）と `K`（`solo-kit.js`）の say を同様に包み、`S.P[i].alive/gone/bound` を読む。
- 配役は `pos-audit.js` の `CASTS` に倣い、必ず次を混ぜる：`yan` の関係（監禁を起こす）、`lethal` な箱庭で死者が出る回数、`loveNG` の組、フェーズ 1 で足す `noR18` の人、`sexLock:'loverOnly'` の人。
- 数える違反：
  - S1 死亡した人が `kind` が `death/step/phase/end` 以外の出来事の actors にいる（死んだターン内の余韻は `o.after` などの印で除く。印がなければ `diedAt` と `step` で判定）
  - S2 監禁中（`flags.caged != null`）の人が `cageOk` なしの出来事に出た
  - S3 `out` の人が出来事に出た
  - S4 `noR18` の人が、性的な文（`pos-audit.js` の `SEXCORE` を流用）の actors にいる
  - S5 `HK.ngPair` または `HK.sexBlocked` が真の二人だけの性的な文（`orient-audit` の O2 と重なるが、恋愛対象以外の理由で数える）
  - S6 `sexLock:'loverOnly'` の人が、住人でない相手（モブ・魔物・略奪者・ゾンビ・村人・神）との性的な文に出た
- 出力は `pos-audit.js` と同じ（箱庭別の件数、`--why` で例文）。R18 版 `r18`・全年齢モード `safe`・全年齢版の 3 通りで回す。
- `tone-check/README.md` に使い方を追記し、`CLAUDE.md` の点検の箇条書きに `state-audit.js` を足す。

受け入れ条件：3 通りで回り切り、**現状の件数が出る**（0 でなくてよい。フェーズ 1 の前後比較に使う）。

### 4.1　フェーズ 1：基盤 1「住人の状態の共通チェック」＋ 直せる不具合・設定

#### 1-a　共通の判定を一か所に（`js/state.js` を新設、`engine.js` の直後に読む）
```js
HK.State = {
  here(ctx, c)        // alive && !out && flags.caged == null && (物語型なら A.here(p))
  canAct(ctx, c)      // here && !flags.down
  r18ok(c)            // !c.noR18（全年齢モードでは常に false）
  mobSexOk(c)         // r18ok && c.sexLock !== 'loverOnly'
  pairLove(ctx, a, b) // here 両方 && HK.canLove(a,b) && HK.canLove(b,a)
  pairSex(ctx, a, b)  // here 両方 && r18ok 両方 && HK.Pos.okSex(a,b)
  trioSex(ctx, list)  // 全員 pairSex が成り立つ（room-trio の free() と同じ条件を吸収）
}
```
- `Ctx.prototype.present()` と `others()` は `HK.State.here` を呼ぶ形に書き換える（結果は同じになるはず。regress で確かめる）。
- `Ctx.say` の防波堤（`engine.js:231-249`）に、**死亡・out の actor も `kind` が `death/step/phase/end` 以外なら捨てる**処理を足し、捨てた回数を `ctx._stateDrop[種別]` に積む。`HK.simulate` の返り値 `res.audit = ctx._stateDrop` に載せ、`state-audit.js` はこれも「出所で直すべき件数」として表示する（防波堤で消えても出所を直すのが目的）。
- `ctx.chars.forEach/filter` で直接名簿をたどっている 24 ファイルを全部見て、「その場の人」を要する箇所は `ctx.present()` か `HK.State.here` に替える。死者・不在を意図して含めるところ（遺品・回想・結末）はそのまま。
- 物語型（jashin・yakata・ship・dungeon・hole・locker・saimin・kaihen・succubus・variety・massage、zenrei の trial・br）は `special.js` の `A.here` を `HK.State.here` に寄せ、各箱庭の「生きている人」の filter を順に置き換える。全部は無理なら、R18 の場面を組む箇所と結末を優先。

#### 1-b　住人ごとの「R18に参加しない」（`noR18`）
- UI は `daku` と同じ 9 か所（§3-1）。表示名「R18に参加しない（受けも攻めもしない）」。R18 版だけに出す。設定の要約行（`ui-gear.js:22-42`）にも出す。
- 実行時の住人に写す：`engine.js:41`、`dungeon.js:700`、`solo-story-kit.js:15`、`solo-hole.js:136`、`solo-hole-behind.js:110`。
- 判定：`HK.sexBlocked`（`engine.js:94`）に `a.noR18 || b.noR18` を足す → `P.orients/okSex/clash` 経由の住人どうしの夜はすべて止まる。
- `okSex` を通らない所を個別に塞ぐ（`HK.State.mobSexOk`／`r18ok` を使う）：ダンジョンの罠・魔物（`dungeon-lewd.js`、`dungeon-bosses.js`）、感覚遮断穴、マッサージ、サキュバスの獲物、常識改変、エロバラエティ、ゾンビの略奪者・噛みつき（`zombie-npc.js:236`、`zombie-bite.js:106`）、邪神村の夜這い・神・洞窟・儀式（`solo-jashin-r18.js`、`solo-jashin-r18-god.js`）、オメガのモブ（`omega-mob.js`）、執着の監禁の夜（`dark-thick.js`／`obsess-kit.js`）、宇宙船の異種姦（`ship-r18*.js`）。
- 決めごと：**R18専用の箱庭（dungeon/hole/kaihen/succubus/variety）で全員が noR18 だと遊べないので、その箱庭では無視し、設定画面の説明に「R18専用の箱庭では効きません」と書く。** 殺し合い系（館・人狼・ゾンビ・邪神村・漂流記）では性的な場面だけ飛ばし、ほかは通常どおり。
- 全年齢モード・全年齢版では常に真扱い（UI は非表示）。

#### 1-c　性行為の相手固定に「恋人だけ（モブにも襲われない）」
- `sexLock` の値 `'loverOnly'` を足す（UI の select：`ui-gear.js` の sexLock 行、説明 tips）。`sexOne`（`engine.js:73-`）は `'lover'` と同じ扱い、加えて `HK.State.mobSexOk` が偽になる。1-b で塞いだモブの箇所がそのまま効く。

#### 1-d　吹雪の館：不死・吸血鬼が蘇っても推理に出ない
- `SP.revive` が走ったら `S.kills` の該当項目に `k.revived = true` を立て、`truthOf`（`yakata.js:627`）は「殺されたが蘇った」文に替える。`deduce/showdown` の前に「死んだはずの人が現れる」出来事を 1 つ足し、周りの反応を性格で 3 文以上（驚く／疑う／平然）。正体がばれた印 `p.spRevealed` を立て、以後の `say` で使える（基盤 8 への布石）。

#### 1-e　出られない部屋（A の分）
- `rulesOf` に「条件の順番（第一→第二）」と「連動（媚薬→エッチ：第一が consume なら第二の act は媚薬の効果中に数える）」を足す。env に `order: 'any'|'seq'` を足す。
- 「一人しか出られない」は `K.one` という条件の一つになっているので、独立した env `only1`（select：なし／あり）に分け、ほかの条件と併用できるようにする。既存の保存データで `cond:'one'` が来たら `only1:'on'` に読み替える。
- 恋人系の「〇人で脱出」：env `escapeN`（2〜4）。全員が恋人関係（`loveSet`）でそろって条件を満たしたときだけ出られる。
- 「誰かを殺す」条件：`lethal:false` の箱庭なので、**この条件を選んだときだけ** `ctx.lethal = true` にして `kill` を許す。全年齢版は「気絶させる」に読み替える。
- 心中の確率：`O.install(SC.whiteroom, …)` に `shinjuW: 0.35` のような重みを渡せるようにし（`O.climax` の `opts.push(['shinju', …])` に掛ける）、部屋は 0.35 にする。`tips-scen-*.js` の部屋の説明に「執着なし／共依存でない相手なら心中は起きにくい」を書く。
- 「片想いと執着を同時に持てない」：`HK.Ties.get` が `crush` を代表にするため、部屋の `tieWall`（`scenario-room.js:351-359`）と `room-reluct.js:15`、`room-trio.js:194` が `yan` を見落としている可能性が高い。`HK.Ties.all` で両方見る形に直し、UI で同じ組に `crush` と `yan` を重ねたときに部屋で両方の出来事が出ることを確かめる（原因が別なら報告）。

#### 1-f　その他 A
- 「出来事どうしの矛盾」は 1-a の防波堤の件数と `state-audit` で拾う。
- アンケートの選択肢（バトルロワイヤル・裁判デスゲーム）はフォーム側なので対象外。報告に一言書く。

受け入れ条件：`state-audit` が 3 通りで **0 件**、`orient-audit`・`pos-audit` 0 件、`regress`（1-a の置き換えだけをコミットした時点）が一致、CHANGELOG に「R18に参加しない」「恋人だけ」「部屋の条件」「館の蘇生」「心中の頻度」を記載。

### 4.2　フェーズ 2：基盤 3「口調の軸」＋ 口調の不具合 ＋ 新しい口調（A）

方針：31 口調を作り直さない。**登録簿に軸を足し、変換の最後に「性別の語尾」を必ず通す**ことで、辞書に当たった台詞も性別のずれを直す。

#### 2-a　登録簿に軸を足す（`tone-registry.js`）
- 各口調に `axis: { polite: 0|1|2 /*タメ口・混ざる・敬語*/, attitude: 'calm'|'proud'|'sarcastic'|'flat'|'loose'|…, ending: 'm'|'f'|'n'|'auto' }` を足す。既存の口調は現状の挙動を表す値を入れる（例：`gentle: ending 'auto'`（女性語尾の表を借りるが男性なら削る）、`gentle_n: 'n'`、`ane: 'f'`、`ojou: 'f'`、`proud: 'auto'`）。
- `HK.toneAxis(tone)` を用意し、以後の新しい口調はこの 3 軸と `derive` で宣言する。

#### 2-b　性別の語尾を変換の最後に必ず通す（不具合 a：穏やか（中性的）の男性／女カプの攻め）
- `V.processText`（`voice.js:551-556`）で、**辞書に当たった場合でも** `axis.ending` が `'n'` または `'auto'` なら、`styleQuote` の性別処理に相当する `V.genderEnd(q, who)` を通す（`'f'`／`'m'` 固定の口調は通さない。お姉さん・お嬢様の書き下ろしを壊さないため）。
- `neutral()`（`tone-plus.js:56-61`）を補強：名詞＋「よ」→「だよ」（`aniki()` の `endRe` を流用）、「、ね」→「、な」または削除、「〜の。」→「〜んだ。」、「〜のよ」「〜わ」「〜かしら」「〜なのね」。`voice-tone.js:374` の女性語尾削りは男性のときだけ動くので、`gentle_n/tsun_n` では `tone-plus.js:155` の男性扱いと合わせて必ず通ることを確かめる。
- 喘ぎの辞書（`ero-moan-tone.js:63-69`、`novel-moan-tone.js:55` の gentle_n）は性別で分ける：`s0/s1/s2` に加えて `s0m/s1m/s2m`（男性用）を書き、`E.moan`／`NovelMoan.list` が `who.gender==='m'` なら `*m` を優先する。穏やか（中性的）・健気・恥じらい・ミステリアス・胡散臭い・明るい敬語（男性だと「僕」になる口調）から始める。
- 女性の攻めの台詞：`solo-r18-moan-data.js D.V[tone]` に `topF`（女性攻め用、各 4 文以上）を 17 口調分書き、`solo-r18-moan.js:129,155` と `r18-thick.js:174,343` の `say(S,x,'top')` は、話し手が女性なら `topF` → なければ `top` を `V.genderEnd` で女性語尾に寄せる。`topcF` の正規表現ふるいは残す。
- 点検：`TONE=gentle_n node collect.js … 40 r18` を男女で回し、`lint.js` の女性語尾の指摘が gentle_n の男性で 0 になること。`pos-audit --ff --hot` 0 件。

#### 2-c　不具合 b：冷静の男性で一人称「私」なのに「僕」
- まず再現：`TONE=cool FPS=私 node collect.js ../../hakoniwa-full out.json 40 r18` → `node lint.js out.json cool`。`calm` も。
- 調べる順：(1) `speakerOf`（`voice.js:415-452`）が話し手を取り違えている台詞（相手が「僕」の口調の人）、(2) `FP_RE`（`voice.js:22`）の後読みに入っていない続き（僕へ／僕一人／僕ん／僕なり／僕好み／僕自身）、(3) 先頭 `⁠` で変換を飛ばしている書き下ろし、(4) 地の文の「僕」（`（…）` の独白は replaceFP だけ通るが、「」の外の地の文は通らない）。
- 直したら `lint.js` に「一人称の設定と出力の不一致」を明示の違反として数える行を足し、全口調で 0 にする。

#### 2-d　一人称の直書きを印に（製作ルール）
- `grep -n '「[^」]*\(俺\|僕\|私\|あたし\)' js/*.js | grep -v tone-fix` で、台詞表に直書きされた一人称を洗い、既存の決まり（元の文は「私」で書く）に合わせて「私」に統一する。`tone-check/lint.js` で「私」以外の一人称を元の文に持つ台詞を拾うルールを足す。
- 呼び名の既定（「先生」「様」）はフェーズ 4 の館の修正で扱う。

#### 2-e　新しい口調（A）
登録簿＋`tone-*.js`（`HK.toneFinish` で語尾付け替え）＋喘ぎ 2 表＋`_order.txt`×2 の最小構成で作り、`collect → report → lint → worklist` で上位 200 行の書き下ろしまで入れる。
- `keigo_sarc`「無愛想な敬語（〜ですが、何か）」：`derive:'polite'`、`axis {polite:2, attitude:'sarcastic', ending:'n'}`。皮肉っぽい・砕けて捻くれた敬語をここに寄せる。
- `keigo_bossy`「偉そうな敬語（〜なさい）」：`derive:'polite'`、`attitude:'proud'`。嫌味・高圧的もここ。
- `keigo_flat`「無機質な敬語」：`derive:'polite'`、`attitude:'flat'`。感嘆・間投詞を削り、言い切りに。
- `tame`「ふつうのタメ口（ねえ俺〇〇なんだけど）」：`egoTable:true, plain:true`、`attitude:'plain'`、`ending:'auto'`。
- `chara_down`「ダウナー系チャラ男（オレに気があります？）」：`base:'free', derive:'chara'`、敬語を混ぜてからかう finisher。**実在作品名・キャラ名は一切書かない。** 説明文は「軽薄で気だるげ。敬語を交えてからかい、さりげなく距離を詰める」。
- 設定画面の見本 `sample` を各口調に書く。`special.js:130 PMAP`、`room-reluct.js`、`solo-r18-moan-data.js D.V`（最低 `top/topF/topc` 各 4 文）に入れる。

受け入れ条件：`report.js` で新口調の「元のまま」が既存の派生口調（後輩・お嬢様）と同程度以下、`lint.js` の一人称不一致 0、`pos-audit --ff --hot` 0、CHANGELOG「口調・呼び方」に記載。

### 4.3　フェーズ 3：基盤 4「R18 の行為の進み具合」＋ 段飛び・重複の修正

#### 3-a　場面の状態オブジェクト（`ero-kit.js` に追加。全年齢版には不要）
```js
HK.Ero.Scene = function (S, people, opt) → {
  stage: 'touch'|'fore'|'enter'|'peak'|'after',   // 進んだ段。戻せない
  parts: { fingers:0, mouth:0, toy:0, inside:0 }, // 使った部位・道具
  people, nth,                                     // 参加者、何回目か
  used: Set,                                       // この場面で出した文（元の文字列）
  pick(list), next(stage), can(stage)              // used を見て引く／段を進める／その段の文を出してよいか
}
```
- `pick` は `HK.Ero.fresh` と `pickFresh` と `Ctx.pick` の記憶を **この場面の `used` に統合**する（`S.rng._fresh`／`S._eroSeen` は場面をまたぐ記憶として残してよい）。
- 各ビルダー（`T.scene`、`X.scene`、`R18M.sex`、`r18-thick mm/soft`、`omega-thick`、`dark-thick`、`room-trio sexScene`）は `Scene` を受け取り、段を `next()` で進めながら文を出す。段に合わない文は `can()` で止める（例：`after` に入ったら「イく」系の喘ぎ `s2` は出さない）。

#### 3-b　今すぐ直す具体箇所
- `r18-thick.js:167,177,329`：「果てる声」を絶頂の地の文の **前** に移す（`thick-sex.js:226` と `solo-r18-moan.js:224-226` が正しい順）。
- 前戯→挿入の橋渡し：`ENTER_BRIDGE` の表（指→抜いて位置を変える、口→体を起こす、など 態度 9 種×2 文以上）を `ero-kit.js` に置き、`r18-thick.js:154`、`solo-r18-moan.js:210`、`room-thick.js:124-131` の open の直後に挟む。
- `room-thick.js:145-148`：`T.CLIMAX` のあとの tail から二度目の絶頂を外し、二度目は `Scene.nth` を進めた上で `again` として別段にする（`{mb2}` を含む文は `peak` 段でしか出さない）。
- `dark-thick.js:12` の `pk`、`room-trio.js` の `ctx.pick` を `Scene.pick` に替える。
- 3 文しかない表を 5 文以上に：`T.REACT`、`T.REACT_AGAIN`、`T.CMOAN`（各 態度 9 種）、`room-thick.js:70 PEAK_PS`。基準は `docs/reports/2026-10-23/spec-and-r18.md` 2-6。

#### 3-c　三人以上
- `room-trio.js sexScene` を `Scene` に載せるところまで。4 人以上への一般化と他箱庭への 3P 追加は基盤 6（役割）と一緒に後のフェーズで。

受け入れ条件：`pos-audit` 0 件、出られない部屋・邪神村・館を各 200 回回して「同じ文が 1 場面に 2 回」が 0（`state-audit` に S7 として追加：`res.log` の連続する性的な文の重複を数える）、`regress` の指紋は変わってよい。CHANGELOG は「アップデート（R18）」。

### 4.4　フェーズ 4：基盤 2「二人の関係を層に分ける」＋ 設定の追加（A・B）＋ 館の「先生」

#### 4-a　層の宣言（壊さない範囲で）
- `HK.TIES` の各項目に `layer: 'stance'|'family'|'feeling'|'love'` を足す。
  立場 stance：boss, senpai, master, teacher, mentor, colleague, classmate, buddy, acq, friend, best, childhood, rival
  家族 family：sibling, sibprot, sibclose, sibbad, parent, pparent, relative, **spouse（新）**, **stepsib（新）**
  気持ち feeling：crush, yan, worship, benefactor, enemy, bad, noobs, **respect／envy／guilt／inferior／fear（新・向きつき）**
  恋愛の状態 love：lover, fwb, ex, almost, mate, fated
- UI（`ui.js:823-826`）は「同じ組に同じ層を 2 つ」を拒み、層が違えば重ねられるようにする。`HK.Ties.layer(ctx,a,b,'love')` を足し、**`Ties.get` の PRIO 順は今は変えない**（変えると全箱庭の挙動が変わる。`regress` で差分が出たら戻す）。
- 組ごとの夜の個性を関係に持てるようにする：`lover/spouse/mate/fwb/almost` の関係に任意項目 `pairPos ('ab'|'ba'|'')`（この組での受け攻め）、`weight ('light'|'heavy'|'')`（想いの重さ）、`nightStyle`（`thick-sex` の style：rough/gentle/tease/playful/''）。`ui-gear.js:85` の関係行に select を足し、`buildInput` で渡す。消費：`P.orients` は `pairPos` があれば向きを固定、`T.scene`／`R18M.sex` は `nightStyle` を `style` に優先、`weight` は執着・嫉妬の重み（`obsess-kit` の初期 `lv`、`pining.js`）に掛ける。

#### 4-b　新しい関係（手本 `4c2a4ed`。§3-3 の表を全部触る）
- `spouse`「夫婦」：`couple:true, night:true`（恋人の上位）。`cold` に `''（円満）/cold（冷えた）/separated（別居）/divorced（バツイチ）` を持たせ、円満は恋人、冷えた・別居は `fric` 大・夜の確率を下げる、バツイチは `ex` 相当の出来事。専用場面は `tie-rel.js` に共通 3 本以上（ふだん・保つ・深まる）＋結末ラベル。部屋・ロッカー・オメガ・ゾンビに各 1 本以上。
- `stepsib`「義理のきょうだい・異母きょうだい」：`family:true`、`relative` と同じく `love:'ok'` を選べる。恋愛なしなら `kinNG` で止まる。
- 気持ちだけの関係 5 種（尊敬・憧れ／嫉妬／罪悪感／劣等感／恐怖、すべて `dir:true`）：`like/hate` と `trustFloor` の初期値だけで成り立たせ、共通場面は各 1 本から。恋愛にはつながらない（`noRomance` 扱い）。
- 執着される側に `confused`「困惑（どうすればいいか分からない。情があって拒めない）」：`ties.js OBS_BACK/_ORDER/141 の解析`、`obsess-kit.js O.react(259-275) に r_confused`、`r_calm` 条件、`O.climax` の resist（accept と afraid の間 0.6）、初期 lv、`obsess-story.js:56,102,103`、`obsess-omega.js:32,72`、`dark-thick.js:80`、`solo-saimin.js:98`。
- 関係性イベントをオフ：`HK.GLOBAL_ENV` に `tieEvents`（する／しない）。`tie-rel.js own()` と各箱庭の tie 専用場面の `when` で見る。

#### 4-c　吹雪の館の「先生」と助手の取り違え
- `yakata-data.js:164,190,257,259` の「先生」を `{call}` にし、`V.callFor(助手, 探偵) || '先生'` で埋める（利用者が決めた呼び方を優先）。`V.callAddress` の `YOU_W`（`tone-plus.js:224`）に「先生」を足して、裸の「先生」も呼び方に置き換わるようにする（副作用：教師と生徒の箱庭。クラスメイトの担任は `role:'teacher'` なので、相手が担任のときは置き換えない）。
- `successor`（`yakata.js:373`）の落とし先は `q.buddy === 死んだ探偵` の助手を優先し、いなければ再結びつけ（`a.buddy = 生きている探偵`）してから使う。`reveal`（634-638）で犯人が助手・相手が探偵のときの向きを直す。導入（253）は助手ごとに 1 文ずつ。

受け入れ条件：`orient-audit`／`pos-audit`／`state-audit` 0 件、館を 100 回×探偵 2 人＋助手 2 人で回して助手が別の探偵を「先生」と呼ぶ文が 0（`state-audit` の `--yakata` オプションとして足す）、CHANGELOG「住人・関係」。

### 4.5　フェーズ 5：基盤 5「内容のスイッチ」＋ ゾンビ・邪神村の分離

- `HK.Content`（新 `js/content.js`、両ビルド）：タグ `force（無理矢理）/mob（モブ）/incest（近親）/ntr/preg（妊娠）/violence（暴力）`。
  - 全体の設定：`HK.GLOBAL_ENV` に `type:'toggles'` を新設（`ui.js envItem` にチェックボックス型を足す）。**既定はすべてオフ**（決めた方針。§6 参照）。
  - 住人ごと：`c.avoid = {force:true,…}`（「この人には出さない」）。UI は `daku` 方式で R18 版のみ。
  - 判定 `HK.Content.ok(ctxOrS, tag, [受ける人])`。
- 付け方：**文ではなく出来事・場面の単位**に付ける。エンジン型は event オブジェクトに `tags:['force']` を足し、`act()`（`engine.js:572-636`）の候補選びで `HK.Content.ok` を通す。物語型は分岐の入口で呼ぶ。最初に付ける対象（全部で 30 か所前後）：
  - force：邪神村の夜這い・憑依、ゾンビの略奪者・ゾンビに襲われる、執着の監禁の夜（`dark-thick`）、敵対の強引なエッチ（`4cae36e` で足したもの）、オメガの同意なしの番、館の凌辱、ダンジョンの罠・魔物、感覚遮断穴の「壁の向こう」、サキュバスの吸精（獲物側が住人のとき）
  - mob：上の略奪者・村人・客・スタッフ・壁の向こう・オメガのモブ・合コンのモブ
  - incest：`love:'ok'` の家族の夜（オンのときだけ `kinNG` を外す形にはしない。既存の「恋愛：あり」の設定が利用者の明示なので、この設定が **両方オン** のときだけ出す）
  - preg：邪神村の疑似妊娠、オメガの妊娠
  - violence：拷問・快楽殺人・陵辱の描写（`lethal` の死そのものは対象外）
  - ntr：恋人がいる人のモブ・他人との夜（`loveSet` があり相手が恋人でない性的な場面）
- 作風（標準／男性向け）の切り替えは `lewd-unify.js` のまま。設定画面では「内容のスイッチ」の隣に並べる。
- ゾンビ：env `raider`（略奪者に襲われる：なし／あり）は `Content.force` に吸収（オンのときだけ `zombie-npc.js:236` の分岐へ）。`zlust`「ゾンビの性欲」スライダー（R18 ファイルから push）で `zombie-bite.js:106` の `0.1` を `0.02 + lust*0.25` に。
- 邪神村：`jlewd` を `jnight`（住人どうし）と `jyobai`（村人・神・夜這い）に分ける。`night`（`solo-jashin-r18.js:296-370`）の `lv` を分岐ごとに差し替え、神の夜（`solo-jashin-r18-god.js`）は `jyobai`。古い保存の `jlewd` は両方に写す。`jyobai` の夜這いは `Content.force` も見る。

受け入れ条件：全スイッチをオフにして 3 通りで回し、`state-audit` に S8（タグ付き出来事がオフなのに出た：`res.log` の `tags` を見る）を足して 0。全部オンで `pos-audit --hot` 0。CHANGELOG に「既定ではオフ。見たい人は設定でオンに」と明記。

### 4.6　フェーズ 6：基盤 6「役割の枠とモブ」

- `HK.Mob`（新 `js/mob.js`）：`HK.Mob.make(S, {gender, role, tone, likes})` → `{name, gender, tone, fp, tr, mob:true}`。名前は散在する表（§3-5）を 1 か所に集め、既存の表はそこを参照する。モブは `HK.Pos.vsNpc` で向きを決め、`HK.State.mobSexOk` を必ず通す。
- 役割の共通欄：`HK.Roles.field(id, label, {allowMob:true, allowNone:false})` が `perFields`（住人側：この役になる）と `env`（住人／モブ／なし）の両方を作る。対象：
  - 裁判デスゲーム（zenrei）：黒幕・裏切り者を住人から。放送・動機の追加は `deathgame-kit.js`。
  - マッサージ：施術者を住人かモブで（`maxCast` を 2 に。2 人で受ける「カーテン越し」は 2 人目が客）。
  - サキュバスの一夜：住人を標的（人間側）にも。`SB.PREY` の代わりに住人を獲物にする分岐。
  - 合コン：恋愛にならないモブ（`env mobs` 人数、`HK.canLove` で常に偽）。
  - エロトラップダンジョン・感覚遮断穴：主催者の役（C 優先。枠だけ作って文は後）。
- 媚薬ロッカー 1 人／3 人以上、催眠の女性攻め・後日談、オメガの番の後日談、常識改変・催眠の「困惑・放心・受け入れて終わる」結末（B）は、このフェーズの後半で各 1 コミット。

受け入れ条件：各箱庭を最少人数と最多人数で 50 回回して例外 0、`state-audit` S6（loverOnly とモブ）0。

### 4.7　箱庭ごとの小さな改善（まとめて 1 フェーズ）
- 無人島に箱庭ごとの結末（`endings.js E.island` に人ごとの「その後」を `dungeon-end.js:255-268` の形で）。
- オメガ：番の後日談を 1 種→5 種以上、付き合っていた相手から運命の番へ流れる話（`fated` の関係と `lover` が別の相手にあるとき）。
- 宇宙船漂流記に不死・吸血鬼（`special.js` の `perFields` を `ship` にも）。
- 人狼の人狼勝利時の R18、受けがモブに襲われたあとの攻めの反応（C）。

### 4.8　この指示書の範囲外（次の指示書で）
- 基盤 7（結末・後日談・最期の言葉の共通枠、感情の持続と表示）、基盤 8（種族・体格・第二性の後付け）、9（複数人交際）、10（日常と場所の場面キット）。
- 二人の箱庭（少人数の関係特化版）は基盤 2・7・10 がそろってから。

---

## 5. 製作ルール（分析レポートの 16 条を、この実装でどう守るか）

| ルール | 実装での形 |
|---|---|
| 人選びは共通の判定を通す | `HK.State.*`／`HK.canLove` 両方向／`HK.Pos.okSex`。箱庭専用の filter を書かない |
| 縛りは全場面で効かせる | `sexBlocked` に集約し、`okSex` を通らない所は `HK.State.mobSexOk/r18ok` で塞ぐ。新しい縛りを足したら `state-audit` に違反の種類を足す |
| 状態は立てたら外すまで尊重 | `Ctx.say` の防波堤＋`state-audit`。立てる出来事と外す出来事を同じコミットで |
| 役割は住人／モブ／なし | `HK.Roles.field` |
| 一人称・二人称・呼び方は印で | 元の文は「私」、`{call}`、`lint.js` で直書きを拾う |
| 性別の語尾は口調の側で | `axis.ending`＋`V.genderEnd` を辞書の後にも通す。新しい台詞は男・女・その他で `collect` |
| R18 は段を持つ | `HK.Ero.Scene`。段に合わない文は `can()` で止める。重複は `used` |
| 刺激の強い要素はタグ | `HK.Content`、既定オフ |
| 性格×状況×関係で分岐、1 文の段を作らない | 2-6 の基準（1 分岐 3 文以上、3 組すべてに専用文、態度 9 種、男性向け 2 文以上） |
| 公開前の点検 | collect・orient-audit・pos-audit・**state-audit**・regress、CHANGELOG・設定画面の説明・アンケートの選択肢 |

---

## 6. 決めた方針と、利用者（うに）に確認が要る点

決定済み（分析レポート「決めた方針」10/25）：合意のない展開は内容のスイッチで既定オフ／未成年の仕組みは作らない／特定の国の人をまねる口調は見送り／実在作品のキャラを例にした口調は一般名で実装／R18G 版の感覚遮断穴は含めない。

**確認が要る点（止まらずに進め、報告で明示すること）：**
1. フェーズ 5 の「既定オフ」で、今まで既定で出ていた邪神村の夜這い・ゾンビの略奪者・執着の監禁の夜が、設定を触らない人には出なくなります。告知文に書く前提で進めます。もし「既存の挙動は残し、新しい要素だけオフ」にするなら、`force` の既定だけオンにします。
2. フェーズ 4 の「同じ組に層が違えば重ねられる」は、UI の見た目（関係の行が増える）に影響します。1 組 4 行まで。
3. フェーズ 2 の「辞書に当たった台詞にも性別の語尾を通す」は、既存の書き下ろし（約 2 万行）の一部で語尾が変わります。`report.js` の「元のまま」の割合で監視し、崩れた例があれば報告に 10 件添えます。

---

## 7. 報告の形（各フェーズの終わりに）

- 入れた変更（コミット一覧と利用者向けの一行）
- 点検の数字：`state-audit`／`orient-audit`／`pos-audit`（r18・safe・全年齢版）、口調を触ったら `report.js` の前後
- 「ここはこう決めた」と §6 の確認点
- 次のフェーズで先に触る予定のファイル
