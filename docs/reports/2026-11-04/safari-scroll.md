# iPhone の Safari：スクロールすると文字が見えなくなる件・出られない部屋を選べない件（2026-11-04）

利用者の報告（どちらも iPhone の Safari。利用者本人の iPhone では起きない）：

1. 「画面をスクロールすると、文字が見えなくなってしまう（ページのどこかに飛んでしまう？）。縦画面・横画面のどちらでも発生し、表示倍率の変更やデスクトップ用 Web サイト表示も試したが改善しない」
2. 「箱庭を選択する際、『合コン』『媚薬ロッカー』を事前に選択していないと、『出られない部屋』の箱庭を選択することができない」

前回の直し（`mobile-parity.md` の 3：WebKit で content-visibility を使わない・`ui-guard.js` の空の画面の見張り・不具合の記録）に足した。

## 1. スクロールで文字が見えなくなる・飛ぶ件

### 洗い出した候補と判断

| # | 候補 | 調べたこと | 判断・直し方 |
|---|---|---|---|
| A | **描き直しのたびにタブの頭へ戻す処理が走る**（`HK.UI.refresh` → `setTab(tab)` の中の「タブの位置まで戻す」 `up()`） | `HK.UI.refresh` は利用者の操作と関係なく呼ばれる：追加パックを読み終えたとき（`packs-ui.js`。late）・喘ぎのかたまりを読んだとき（`ui-voice-moan.js`）・前回入れた空の画面の見張りが描き直すとき（`ui-guard.js`）・設定の窓を閉じたとき。そのたびにいまのタブを全部描き直し（結果タブなら経過ごと作り直す）、`up()` が「タブより下なら上へ」スクロールする。試すと、上の段（`.tabs`）は上に止まる（sticky）ので戻るのは 4px ほど（切り欠きのある iPhone では 0）で、大きくは飛ばない（直す前 3000→2996、直したあと 3000→3000。`refr.js`） | **直した（小さい）**：`setTab(t, quick, keep)` に「描き直すだけ」を足し、`HK.UI.refresh` は位置を保って描き直す（`keepY`：前後で位置が変わっていて、そのあいだに利用者がスクロールしていなければ元へ戻す）。タブを押したときだけタブの頭へ戻す。描き直しは不具合の記録の「直前」に残す |
| B | **late を読み終えたときの描き直し**（`HK.onLate` → `renderCast`／`boxRedraw`） | 画面が出たあと数秒（iPhone の回線ではもっと）で late が届き、住人タブ・箱庭タブを描き直す。住人タブの `renderCast` は位置を保っていなかった。Safari にはスクロール位置の補正（scroll anchoring・`overflow-anchor`）が無いので、上の行の高さが変わると読んでいた文がずれる | **直した**：`keepY` で包んで位置を保つ |
| C | **箱庭を動かした直後の念押しの「上へ戻す」**（`ui.js` の `toTop`：すぐ・次のフレーム・150ms・500ms） | 結果の頭から読めるように 4 回上へ戻す。結果が出てすぐ指でスクロールし始めると、0.5 秒後までの念押しで上へ引き戻される | **直した**：念押しのあいだに利用者が自分でスクロール・操作したら（`HK.Guard.userAt()`）もう戻さない |
| D | **空の画面の見張りの誤判定**（前回の `ui-guard.js`） | スクロールが止まった 0.5 秒後に「中身が空か」を見て、空なら描き直す。iOS の慣性スクロールの途中や、遅れて描く節の途中で「高さ 0」と取ると描き直し → A で頭へ戻る筋がありえた | **直した**：空とみなすのは「子が無い」か「高さが無く文字も無い」ときだけ。指で触っているあいだ・直前 350ms に操作があったときは見ない（後回し）。描き直しは A で位置を保つ |
| E | **content-visibility**（住人の行・関係の行の `content-visibility:auto`、隠した箱庭タブの `content-visibility:hidden`） | Safari 18（2024年9月）から効く。見込みの高さ（`contain-intrinsic-size`）と実際の高さが違う行が画面の上で描かれると、Safari は位置を補正しないので本文が飛ぶ・描かれず白いまま残る。iOS 17 以前では効かない＝「利用者の iPhone では起きない」と合う | **前回の直しで対処済み**（WebKit では使わない）。ただし判定が UA だけだった。iPhone の「デスクトップ用 Web サイトを表示」は UA が Mac になる（`maxTouchPoints` で拾っていた）が、念のため `navigator.vendor`（Apple）でも WebKit とみなすようにした |
| F | **iOS の文字の自動拡大**（`-webkit-text-size-adjust` の指定が無かった） | iPhone の横向きで本文の字が自動で大きくなり、描き直しや画面の大きさの変化で組み直される（行の高さが変わる） | **直した**：`html { -webkit-text-size-adjust: 100%; text-size-adjust: 100% }`（両ビルドの index.html） |
| G | 上に止まる目次（`.bxtabs`・`.rvtabs`）の「いま見ている節」の強調で目次の高さが変わる（太字で折り返す → 本文がずれる → 強調が変わる、の繰り返し） | Chromium で幅 360〜1280px の各幅で、強調する節を変えて目次の高さを測った → どの幅でも変わらない（箱庭の目次は 52／56px で一定。結果の目次は横に流れて折り返さない）。目次の横の流れの `scrollLeft` は目次の中だけでページは動かさない | 該当なし（変更なし） |
| H | sticky／fixed と transform・will-change・overflow | 上に止まる段（`.tabs`・`.bxtabs`・`.rvtabs`・`.rvtoc`）の親に transform・will-change・filter は無い。`backdrop-filter`・`translateZ` も使っていない。`body.hk-modal-open`（窓を開いているあいだ body を fixed）は窓が無いと戻す（前回） | 該当なし |
| I | 100vh／100dvh と二重スクロール | 本文はページ（window）だけがスクロールする。固定の高さの箱の中で本文をスクロールさせる作りは無い（窓の中・経過の目次・右の絞り込みだけが自分でスクロールし、どれも `overscroll-behavior: contain`）。`dvh` はアドレスバーの出入りで変わるが、使っているのは窓・目次の最大の高さだけで、本文の流れの高さは変えない | 該当なし |
| J | resize（iOS はアドレスバーの出入りで resize が来る）で描き直す処理 | 参加表の縮尺（前回、幅が変わったときだけに直した）・目次の位置の計算・グループの一覧の位置合わせだけ。どれもスクロール位置は動かさない | 該当なし |
| K | そのほかの scrollTo・scrollIntoView・scrollTop | 全部で 30 か所ほどを読んだ。押した操作の中（目次へ移る・日へ飛ぶ・この二人の経過へ・ページ送り・上へ／下へ）か、描き直しの前後で位置を戻すもの（`boxRedraw`・住人の行の描き直し・口調の節・辞書の欄の伸び縮み・窓を閉じたとき）だけ | 該当なし（A〜C のほかは利用者の操作からだけ動く） |
| L | 古い iOS で無い機能 | かたまりを acorn で古い構文（ES2017／2019／2020）に当て、新しい API を探した（作業用 `syn.js`）。構文は ES2019 で全部読める（`??=`・クラスのフィールド・`#private` は無い）。`Array.prototype.at`・`structuredClone`・`Object.hasOwn`・`scrollend` は使っていない（`.at(` は自前の関数）。**正規表現の後読み `(?<=…)`・`(?<!…)` を中核に 200 か所以上・late・媚薬ロッカー・喘ぎのかたまりで使っている**。後読みは iOS 16.4（2023年3月）から。それより前の iOS では中核が読み込みの段階で構文エラーになり、何も表示されない | 報告の症状（スクロールで文字が消える）とは別（その版では最初から動かない）。後読みを書き換えるのは文の点検に響くので今回はしない。代わりに、後読みが使えないブラウザでは「iOS 16.4 以降に更新してください」の案内を出す（index.html の小さな script。両ビルド） |
| M | デスクトップ用表示で別の経路に入る UA 判定 | 画面の分岐は幅（`max-width:600px` など）で、UA で分けているのは WebKit の判定（E）と先読みの PC 判定（`hover`・`pointer`・幅。UA は見ない）だけ | E の判定に vendor を足した |

**最有力**：A（描き直しでタブの頭へ戻る）と E（Safari 18 の content-visibility。前回対処）。A は「どの向き・倍率・デスクトップ表示でも起きる」「起きる人と起きない人がいる（回線の速さで late・パックの届く時刻が変わる、前回の見張りの誤判定は端末の速さに左右される）」と合う。E は「iOS 18 以降だけ」で、利用者の iPhone との差を説明できる。

### 再現の試み

- WebKit：`npx playwright install webkit` はこの環境からダウンロードできず（Download failure）、試せなかった。
- Chromium（`probe.js`。作業用フォルダ `safari/`）：iPhone の UA で 390×664（縦）・844×340（横）・980×1680（デスクトップ用表示＝Mac の UA・タッチ）・1280×900 で、住人・箱庭・結果の各タブを `Input.synthesizeScrollGesture` で速く長く上下にスクロールし（各タブ 38 回）、プログラムによるスクロール（`scrollTo`・`scrollBy`・`scrollIntoView`・`scrollTop` を包んで呼び元を控える）・一度の飛び（画面の 1.2 倍超）・目次の高さの変化・本文の消失（`elementFromPoint` で見える要素が 3 割未満）を数えた → **直す前も後も 0 件**（Chromium は scroll anchoring があり、content-visibility も正しく描くので、Safari だけの筋は出ない）。
- A は直接確かめた：結果タブの位置 3000 で `HK.UI.refresh()` を呼ぶと、直す前は 2996（4px 上へ）、直したあとは 3000（`refr.js`）。プログラムによるスクロールの記録は、操作なしの `scrollTo` を呼ぶと `scroll` の記録に呼び元の関数の名前が残ることを確かめた（`diag.js`）。

## 2. 出られない部屋を選べない件

### 原因（筋は確定・Safari で切れる理由は推定）

出られない部屋はかたまり `scen-whiteroom`（約 1.8MB。いちばん大きい箱庭）と依存の `pack-rel`・`pack-trap`（と `pack-lewd`）で動く。読み込み（`load.js`）が途中で切れる（通信が不安定・アプリの切り替えなどで中身が途中までしか届かない）と、

1. script は「読めた」が終わりの印（`HK.Load.done`）が来ない → キャッシュを通らずに 1 回取り直す → それも切れると「壊れている（broken）」で失敗
2. 箱庭タブは `boxErr[id]` を立てて「読み込めませんでした」を出す。**`boxLoad` は `boxErr` があると二度と読まない**
3. 「箱庭を選ぶ」の窓で同じ出られない部屋を選び直すと、`pickGo` は「いまの箱庭と同じ」なので何もしない（`boxErr` も消さない）
4. ほかの箱庭（合コン・媚薬ロッカー）を選ぶと、そのかたまり（`pack-rel`・`pack-trap` を含む）が読まれ、そのあと出られない部屋に選び替えると `boxErr` が消えて、残りの `scen-whiteroom` だけを読み直す → 選べる

報告の「合コン・ロッカーを先に選ぶと選べる」はこの 4 と合う（合コンが `pack-rel`、ロッカーが `pack-trap` を先に読む）。前回の箱庭が出られない部屋だと、起動直後に late・`pack-lewd` と並んで約 4.5MB を同時に読むので、切れやすい。

かたまりの依存の解き方（`closure`）はどの箱庭から先に選んでも同じ順（`pack-lewd → pack-rel → pack-trap → scen-whiteroom`）で、依存が先に失敗したときも次の `ensure` で失敗したものから読み直す（`load.js` の `s.failed` は次の読み込みを止めない）。目録の `@need` は使っていない（中核で登録される箱庭ではない）。

### 直し方（`ui.js`・`load.js`）

- 選んでいる箱庭をもう一度選んだとき、読み込めていなければ（`!HK.Load.has(id)`）`boxErr` を消して読み直す
- 読み込みに失敗したら、カードは「読み込み中…」のまま、1.5・4・10 秒待って自動で 3 回までやり直す（新しい版・通信できないときは待たずに知らせる）。「もう一度」・選び替えで回数を戻す
- 読み込めなかったかたまりの名前と理由（net・broken・stale・offline）、箱庭の何回目の失敗か、取り直しを、不具合の記録に残す

### 再現の数字（Chromium・簡易サーバ `serve.js`。キャッシュ無し・毎回新しいプロファイル・iPhone の UA 390×664）

最初に「箱庭を選ぶ」→ 出られない部屋 →「この箱庭にする」。選べなかったら、もう一度出られない部屋を選び直す（利用者の操作）。20 秒待って `HK.SCENARIOS.whiteroom` が登録され、読み込みが終わっていれば「選べた」。

| 配信 | 直す前 | 直したあと |
|---|---|---|
| br（`Content-Encoding: br`）・切れなし | 選べない 0／20 | 0／20 |
| gzip・`scen-whiteroom`・`pack-rel`・`pack-trap` の応答を 4 割の確率で途中で切る | **選べない 8／20**（選び直しても読まない） | **0／20**（自動のやり直しで読める。記録に「かたまり scen-whiteroom を読み込めませんでした（broken）」） |
| 切る回数を決めて（最初の 6 回） | 2／3 | 0／3 |

Safari で切れる理由そのもの（回線・メモリ・アプリの切り替え）は確かめられていない。次に起きたときは、不具合の記録に「かたまり ○○ を読み込めませんでした（理由）」が残る。

## 3. 不具合の記録に足したもの

右上の「表示」→「不具合の記録」→「コピー」で、次が分かるようにした（住人の名前・設定・文は入らない）。

- 頭：ブラウザ（UA）・**端末（iOS の版。デスクトップ表示のときは Safari の版）**・画面の大きさ・**縦／横**・倍率・WebKit か・ホーム画面から開いたか・版
- 各記録：タブ・箱庭・画面の大きさと向き・**拡大の倍率（ピンチで拡大しているとき）**・位置／ページの高さ、と**直前の出来事 6 件**（描き直し・プログラムによるスクロール・読み込みの取り直し・ページに戻った・向きの変化。何秒前か）
- 新しい記録の種類（`js/ui-guard-scroll.js`。late）：
  - `scroll`：操作（押した・キー）から 1.2 秒より後に、プログラムがページのスクロール位置を動かした（`scrollTo`・`scrollBy`・`scroll`・`scrollIntoView`・ページの `scrollTop`。**呼んだ関数の名前とファイル**）
  - `jump`：スクロールの知らせの間で、位置が一度に画面の高さの 1.5 倍（900px 以上）動いた（前後の位置・間隔・ページの高さの変化・直前のプログラムによるスクロール）。上端へ飛んだときは「画面の上端を押したときもこうなる」と添える
  - `shrink`：ページの高さが 3 割以上・1000px 以上急に縮んだ（描き直しで中身が消えた）
  - `load`：読み込めなかったかたまり・箱庭（上の 2）
- `HK.Guard.note`・`HK.Guard.userAt`（中核）：控えと「利用者が最後に操作した時刻」。`ui.js` が描き直し・念押しで使う

## 4. 点検

- 両ビルドで build（中核：ui.js・load.js・ui-guard.js の変更。late に ui-guard-scroll.js を足した）
- `node hakoniwa-tools/check.js`：すべて合格（終了コード 0。回した 15）。構文・r18 の印・2000 行・両ビルドの同名ファイル・build 両方（中核 br の目安の合計は増減なし：R18版 1050KB・全年齢版 860KB）・regress（R18版 19・全年齢モード 14・全年齢版 16 箱庭の指紋が直す前のコミット 8ca52948 と一致）・audit-all（すべて 0 件）・chunk-audit 0 件・chunk-regress 不一致 0 件（両ビルド）・catalog-check 0 件
- スクリーンショット（作業用フォルダの `safari/after-<pc|sp|land>-<cast|box|result|result-mid|errlog>.png`）：PC 1280・スマホ 390 縦・844 横で崩れ・横のはみ出し 0・ページの例外 0

## 5. 利用者に試してもらいたいこと

- 起きたら、右上の「表示」→ いちばん下の「不具合の記録」→「コピー」で、記録を貼って知らせてもらう（`scroll`・`jump` の行に、動かした処理の名前が出る）
- 記録に何も残っていないのに文字が消える場合は、Safari の描画（タイルの描き遅れ）の可能性が高い。そのときは iOS の版・端末名と、どのタブのどのあたりか（経過の吹き出し・関係図など）を教えてもらう

## 6. 届いた記録の読み解きと直したこと（iOS 16.7 の利用者の記録）

記録の抜粋：`shrink`（24392→635・4650→635・26401→1123。画面 375x635／716）が多数、`scroll`（`scrollTo ← toTop`。直前に `scrollTo 398 ← up ← setTab ← simulate` と `scrollTo 394 ← toTop ← simulate ← run`）。

- **shrink は誤検出**：窓（`HK.Modal.lock`）が body を `position:fixed` にするので、開いた瞬間にページの高さが表示領域の高さになる。jump は `.hk-modal-open` を除いていたが shrink は除いていなかった。→ `ui-guard-scroll.js`：窓が止めているあいだと外した直後（100ms）は jump・shrink とも数えない。`ui-modal.js` の freeze／thaw で `HK.Guard.note('modal', '窓を開きました（止めた位置 y）'／'窓を閉じました（y へ戻す）')` を控える
- **「操作なし toTop」は run の念押し**（すぐ・rAF・150ms・500ms）。操作からの時間を click／keydown からだけ測っていたので、箱庭を回すのに 1.2 秒以上かかると外れていた。→ 操作の時刻に `touchend`・`pointerup` も足し、`HK.Guard.act()`（run の頭）／`act(true)`（run の終わり）と `HK.Guard.acting()`（始まりから 3 秒以内か終わりから 1 秒以内）を中核の `ui-guard.js` に足して、その間のスクロールは「操作から」とする。`userAt`（利用者が自分でスクロールした時刻。念押しを止める判定）は act では動かさない
- **二重のスクロール**：`simulate` の `setTab('result')` がタブの頭（398px）へ、直後の toTop が 0 へ動かしていた。→ 回したとき（record）は `setTab('result', false, true)`（位置を動かさない）にして toTop に一本化。念押しの回数・利用者がスクロールし始めたら止める判定はそのまま
- 確かめ（Playwright。HK.simulate を 1.5 秒遅くして回す）：幅 390（iPhone の UA・hasTouch）で 1940px まで下げて注意事項の窓を開閉 → shrink 0 件・位置 1940 へ戻る・控えに modal の 2 行。回す → 控えの scroll 4 本（3929→0 の toTop ×4）がすべて「操作から」・記録の scroll 0 件・回したあと位置 0。幅 1280 でも同じ（scroll 4 本すべて「操作から」・位置 0）
- 残り：タブを押して切り替えた直後（箱庭タブは描画を後回しにする）にも shrink が出ることがある（窓とは別。本物の縮みとして残している）

## 分割後の確認（2026-11-04・中核の振り分けの見直し。`core-split.md` の 6 章）

中核から外す・後で読むものが増えたので、上の 2 件が戻らないかを確かめた（Chromium の iPhone エミュレーション 390×664・キャッシュ無し・毎回新しいプロファイル・br で配る。起動 → 出られない部屋を最初に選ぶ → 動かす → 結果を指でスクロール）。

| 配信 | 回数 | 選べない | ページのエラー | プログラムによるスクロール（scroll）・飛び（jump） |
|---|---|---|---|---|
| 遅い回線（往復 150ms・6Mbps） | 20 | 0 | 0 | 0・0 |
| 中核のほかのかたまりの応答を 3 割の確率で途中で切る（往復 80ms） | 22 | 0 | 切った script の構文エラーだけ | 0・0 |

- 新しいかたまり pack-sim も、箱庭の依存として自動のやり直し・「もう一度」・不具合の記録の `load` が効く。late に移した画面の部品は、押したときに late を読み直し、読めなければ「もう一度」を出す。
- late を読み終えたときの描き直しで位置は動かない（住人タブの位置 600 のまま）。住人タブ・箱庭タブの高さを後から変える部品は late に移していない。
- index.html の Safari 向けの script と、中核の先頭（load.js・load-order.js・ui-guard.js）の位置と順は変えていない。中核に正規表現の後読みは足していない。


## 7. 見えないがコピーはできる（描画の層）

### 報告

iPhone（iOS 16.7）の Safari。結果タブでスクロールした先の文字が見えない（白いまま）。**文字のコピーはできる**（DOM にはある）。縦横・倍率・「デスクトップ用 Web サイトを表示」でも起きる。手元の Chromium では再現しない。

### 読み解き

DOM にあり、選んでコピーできるのに描かれないのは、WebKit が合成（compositing）した層のタイルを描き直さない不具合の形。iOS 16 の Safari は content-visibility に対応していないので、3 の保険（WebKit で content-visibility を使わない）は元から関係がない。iOS で層を作る指定のうち、この画面にあったもの：

| 指定 | 場所 | 直し方 |
|---|---|---|
| `-webkit-overflow-scrolling: touch`（付けた箱が独立の合成層になり、「中身が白いまま、触るまで描かれない」不具合が多数報告されている。iOS 13 以降は無くても慣性スクロールになる） | index.html 2 か所（`.tblwrap`・`.modal-box`）、`ui-result-style.js`（結果の目次 `.rvtabs`）・`ui-box-style.js` 2 か所（`.bxtl`・`.scfilt`）・`ui-modal.js`（窓・設定・箱庭を選ぶの各箱 8 つをまとめた 1 行）・`ui-gear.js`・`ui-cast-tools.js`・`ui-tagsel-pop.js`・`export-out.js` 各 1 か所。**1 ビルド 10 か所** | **全部外した**（両ビルド。grep で 0 件。`overscroll-behavior` は残す） |
| 結果の目次 `.rvw .rvtabs` の `position:sticky` ＋ `overflow-x:auto`（sticky の横スクロールの箱は iOS で層が重なり、後ろの兄弟が描かれない例がある） | `ui-result-style.js` | `html.hk-webkit` だけ `overflow-x:visible; flex-wrap:wrap` にして横スクロールの箱にしない（幅 390 では 2 段・約 92px になり、5 つの切替が全部見えて押せる）。sticky はそのまま。目次へ移るときの位置は目次の高さを測って決める（`HK.Toc.go`）ので、2 段でも節の頭が目次の下に来る |
| transform・will-change・backface-visibility・isolation・filter・contain・大きな fixed／opacity | index.html の `<style>` と js の css 文字列を洗い、結果タブを出した状態で `#view-result` の全要素の computed style を見た | 文の容器（`#view-result`・`.rvw`・`.rvpane`・`.rvcard`・経過の `.stepblk`・`li.ev`）には**無い**。あるのは小さな部品だけ（矢印の `rotate(45deg)`、丸札の字の `translateY(.02em)`。対象外） |
| 大きな `overflow:auto` の箱 | 結果タブ | 文の容器には無い。あるのは関係図の箱（`#map.tray`、高さ約 350px）と、PC 幅で出る経過の目次・右の絞り込み（`.rvtoc`・`.rvrail`・`.rvlist`。sticky ＋ 自分でスクロール）。どれも本文の横・上にある小さな箱で、本文そのものは window がスクロールする。機能（目次を自分でスクロールする）を残すため変えていない |

### 保険：iOS の WebKit だけの「描き直しの一押し」（`js/ui-ios-paint.js`。late）

原因を WebKit 本物で確かめられないので、描き直されないタイルを描き直させる一押しを足した。

- 対象：`html.hk-webkit` のとき（ui-guard.js の判定。UA・`navigator.vendor`・タッチの点数で見るので、UA が Mac になる「デスクトップ用 Web サイトを表示」も含む）。ほかのブラウザでは何もしない
- いつ：スクロールが止まったとき（最後の scroll から 120ms）・指を離したとき（`touchend`）・ページに戻ったとき（`pageshow`・`visibilitychange`）・向き（`orientationchange`）・大きさ（`resize`。Safari のツールバーの伸び縮み）
- 何を：いま見えているタブ（`main>section[role=tabpanel]:not([hidden])`）の中の、画面に重なっている文の容器（`.rvpane`・`.rvcard`・`.stepblk` など。48 個まで。無ければタブパネル全体）に、クラス `hk-repaint`（`outline: 1px solid transparent`）を 1 フレームだけ付けて外す。outline は大きさも位置も変えず層も作らないので、レイアウトを変えずに、その箱の範囲を描き直させる（transform・opacity・will-change は層を作るので使わない）
- 1 秒に 1 回まで。指で触っているあいだは待ち、離したら当てる
- 記録：効いたかは JS から読めないので、不具合の記録の控え（直前の欄）に `paint：描き直しの一押し（きっかけ・か所の数）` を**最初の 1 回だけ**残す。記録の頭の画面の行に `・WebKit・描き直しの一押し：有効`（late を読む前なら「未読込」）が出る

### 確かめたこと（Chromium。WebKit 本物は無い）

Playwright（Chromium。iPhone 相当＝幅 390・iOS 16.7 の UA・isMobile・hasTouch、PC＝幅 1280）。出られない部屋（既定の住人 10 人）を回して結果タブを下までスクロールした（作業用 `probe.js`）：

| 見たこと | iPhone 相当（390） | PC（1280） |
|---|---|---|
| `html.hk-webkit`・一押しが有効 | 付く・有効 | 付かない・無効（一押し 0 回） |
| 結果のページの高さ → 下端までのスクロール | 9193px → 8529（下端）まで | 6713px → 5813（下端）まで |
| 位置の後戻り（50px 超）・ページの例外 | 0・0 | 0・0 |
| スクロール中の一押しの回数（1 秒に 1 回まで） | 13 回（19 秒） | 0 |
| 一押しのあと `.hk-repaint` が残った数 | 0（2 フレームで外れる） | 0 |
| 一押しの前後でページの高さ・位置 | 変わらない | （対象外） |
| タブパネル全体（高さ約 8600px）に付け外しした時間 | 30ms（2 フレーム）、付けた直後のレイアウト 13ms | 18ms |
| computed style の `-webkit-overflow-scrolling` | 0 個 | 0 個 |
| 文の容器の transform・will-change・filter・contain | 0（あるのは字の丸札・矢印の小さな部品だけ） | 0（同じ） |
| 結果の目次 `.rvtabs` | 折り返し（`overflow-x:visible`・`flex-wrap:wrap`）・2 段 92px・5 つ全部見える | 横流しのまま（48px）・5 つ全部見える |
| 目次の 5 つを押して節へ | 全部、節の頭が目次の下 10px・押した札が強調 | 同じ |
| 不具合の記録の頭 | `画面：390x664・縦・倍率 3・WebKit・描き直しの一押し：有効` | WebKit の表示なし |

（ページのエラーとして出たのは、試しのサーバで外したパスワードの画面の 404 と外のフォントの取得失敗だけ）

### 利用者に確かめてもらうこと

1. ページを読み込み直して、結果タブで長い結果（出られない部屋の 8 人など）を下までスクロールする
2. 文字が白いまま残るかを見る。残ったら、その場で少し指で動かして、描かれるかも見る
3. 右上の「表示」→「不具合の記録」→「コピー」で記録を貼ってもらう。**頭の「画面：」の行に `WebKit・描き直しの一押し：有効` が出ていること**、記録の「直前」に `paint：描き直しの一押し` の行があることで、保険が当たっているかが分かる（記録が無いときは、頭の行だけでよい）

## 8. iOS 18.2 の全タブの真っ白（セーフモード）

### 報告と記録の読み解き

2026-11-04 19:36。iPhone 15（iOS 18.2.1）の Safari で、住人／箱庭／結末の**どのタブでも**、下にスクロールすると真っ白。iPhone SE（iOS 27.0.1）では起きない。記録の頭は `画面：393x659・縦・倍率 3・WebKit・描き直しの一押し：有効`（7 の一押しが当たっていたのに白くなる＝outline の一押しは効かない）。

- `［jump］9533→8162（17ms・ページの高さ 13579→13579）・プログラムによるスクロールなし`、`11891→10602`、`6955→8238`：指でスクロールしている最中に、**ページの高さが変わらないまま約 1300px（上下どちらにも）飛ぶ**。プログラムのスクロールも描き直しも無い。WebKit が合成した層のタイルを作り直すときに、描く位置とスクロールの位置がずれる（タイルが白いまま、位置が飛ぶ）形に合う。ツールバーの伸び縮み（659↔776）の最中にも出る
- `［shrink］13545→2394（位置 375）タブ cast`：結果タブ（13545px）→ 住人タブ（2394px）の**タブの切り替え**で、本物の縮みではない（見張りの誤検出。下の D で直した）
- 直前の欄の go・up・thaw・toTop はどれも「操作から」で、飛びの原因ではない
- iOS 16.7 の報告（7）と合わせると、**Safari 16〜18 の WebKit に共通し、最新（Safari 26 以降の WebKit）では直っている描画の不具合**とみるのが自然。結果タブだけの部品ではなく、全タブに共通する部品を疑う

### 候補（全タブ共通・Safari 16〜18 の WebKit に当たりそうなもの）

| 候補 | 場所 | 根拠 | 見立て |
|---|---|---|---|
| **上の切替 `.tabs` の `position:sticky` ＋ `top: env(safe-area-inset-top)` ＋ `overflow-x:auto`（PC 幅）＋ `.wrap>.tabs` の `box-shadow: 0 0 0 100vmax` と `clip-path: inset(0 -100vmax -1px)`** | index.html 328・1203・1571 | 全タブにある唯一の貼り付く要素。sticky は iOS で独立の合成層になり、その層に 100vmax の影（横に画面 2 つ分）と clip-path が付く。WebKit の既知の不具合「sticky 要素のある長いページで、スクロール中にタイルが白いまま残る／位置が跳ぶ」（iOS 17〜18 の報告が多い。clip-path・大きな影の付いた sticky、safe-area の env() を top に使うものが典型）、ツールバーの伸び縮みで sticky の位置を計算し直すときに跳ぶ例に合う | **最有力** |
| 画面上端の帯 `body::before`（`position:fixed; inset:0 0 auto; height: env(safe-area-inset-top)`。z-index 10） | index.html 327 | 全タブ。高さが env() の fixed の層。ツールバーの伸び縮みのたびに大きさが変わる。fixed の層と sticky の層が重なる | 有力（sticky と組で） |
| `html{overflow-anchor:none}` | ui-mobile.js（600px 以下） | Safari は scroll anchoring に対応していない（何もしない指定）ので、直接の原因ではない見込み。保守的に外す | 低い |
| `content-visibility:auto`／`contain-intrinsic-size`（住人の行・関係の行）、`#view-box[hidden]{content-visibility:hidden}` | ui.js 30・ui-ties.js 25・ui-box-draw.js 23 | iOS 18 は対応しているので当たりうる（後回しの行が見積もりの高さで置かれ、描くときに高さが変わってスクロールが跳ぶ）。ただし hk-webkit の上書き（ui-guard.js）が中核の最初で入り、`!important` と詳細度（1,2,1）で勝つので、iOS 18.2 では効いていない（確認：Chromium で iOS の UA（hk-webkit・セーフモードなし）にして、content-visibility が visible でない要素は 0 個、隠した箱庭タブは display:none）。ページの高さが変わらない飛びにも合わない | 低い（念のためセーフモードで全要素を visible に） |
| 参加表の `zoom`／`transform: scale(var(--pz))` | index.html 583・584 | 箱庭タブだけ。全タブの症状とは合わない。scale は層を作る | 低い（セーフモードで 100% 固定） |
| 下に固定する帯（`.runbar`・住人タブの `.uimobar`）・`#pagejump`（上へ／下へ） | ui-mobile.js 35・index.html 1440・ui-cast-ops.js 135 | fixed の層。住人・箱庭タブで出るが結果タブでは #pagejump だけ。機能に要るので残し、`translateZ(0)` で自分の層に分ける | 中（層を分けて残す） |
| 結果の目次 `.rvtabs`・箱庭の目次 `.bxtabs`・住人の一括の帯 `.tsbulk.on`・PC 幅の `.rvtoc`/`.rvrail`/`.rvlist` の sticky | ui-result-style.js・ui-box-style.js・ui-tagsel.js | `.tabs` の下に重ねて貼り付く（`--hk-stick`）。sticky の層が 2 段になる | 中（セーフモードで static） |
| 描き直しの一押し（outline） | ui-ios-paint.js | 有効だったのに白くなった＝outline では合成層のタイルは作り直されない | 効かない → translateZ の一押しへ |

（Playwright の Chromium では再現しない。WebKit は手元に無いので、WebKit Bugzilla の既知の報告（"position: sticky blank / not repainting while scrolling on iOS"、"fixed element with safe-area-inset causes jump"、"content-visibility: auto scroll jump"）と症状を照らした推定）

### セーフモード（`html.hk-ios-legacy`）

- **判定**（中核の `ui-guard.js`）：`hk-webkit` で、iPhone・iPad（「デスクトップ用 Web サイトを表示」で UA が Mac のときも、タッチの点数で見分ける）の **Safari の版（`Version/`＝WebKit の版）が 16〜18**。iOS の版（UA の `OS 18_7` など）は見ない：別の利用者の iOS 18.7（`CPU iPhone OS 18_7 … Version/26.6.1`）は Safari 26 の WebKit で、真っ白は起きていない。起きているのは `Version/18.2`（iOS 18.2.1）と `Version/16.6.2`（iOS 16.7）。iOS 26 以降も UA の OS は 18 台に固定されるが `Version/26`・`27` で外れる（iOS 27 の利用者は自動で切）。`Version/` の無いアプリ内の表示（WebView）は版が分からないので対象にする
- **切ったもの**（CSS は中核の ui-guard.js に最小限。どれも `html.hk-ios-legacy` の下だけ）：
  - 上の切替 `.tabs` の sticky → static（タブはスクロールで流れる。上へ／下へのボタン `#pagejump` とタブを押したときのタブの頭へで戻れる）。`.wrap>.tabs` の 100vmax の影と clip-path も外す
  - 結果の目次 `.rvtabs`・箱庭の目次 `.bxtabs`・住人の一括の帯 `.tsbulk.on`・PC 幅の `.rvtoc`/`.rvrail`/`.rvlist` の sticky → static（自分でスクロールする箱もやめる）
  - 画面上端の帯 `body::before` を消す
  - `html{overflow-anchor:none}` を外す（auto）
  - 全要素の `content-visibility` を visible、`contain-intrinsic-size` を none。隠した箱庭タブは display:none
  - 参加表の `zoom`／`transform: scale()` → 100% 固定（late の ui-perzoom.js が −・＋・全体を表示を押せなくし、「縮尺は 100% に固定しています（Safari の表示を軽くしているため）」と出す。選んでいた縮尺は残り、切れば戻る。表の形の積む／並べるは使える）
  - 下に固定する帯 `.runbar`（箱庭タブで要る）・`.uimobar`・`#pagejump` は残し、`translateZ(0)` で自分の層に分ける
- **描き直しの一押し**（late の ui-ios-paint.js）：セーフモードのときは、outline ではなく、いま見えているタブパネルの子に `transform: translateZ(0)` を 1 フレームだけ付けて外す（クラス `hk-repaint-z`。層を一瞬作って壊し、白いタイルを作り直させる）。パネルそのものに付けると中の fixed の帯がパネルに付いて動くので、帯と帯を含む子は避けて 2 段まで中へ降りる。いつ：スクロールが止まったとき・指を離したとき・**タブを切り替えたとき**・ページに戻ったとき・向き・大きさ（ツールバーの伸縮）。1 秒に 1 回まで
- 記録の頭：`・WebKit・描き直しの一押し：有効（層を作り直す）・Safari 16〜18 のセーフモード：有効（自動）`（入にしたときは「（入）」、切は `・セーフモード：切`）

### スイッチ「Safari の表示を軽くする（真っ白・飛びの対策）：自動／入／切」

- 置き場所：右上の「表示」のメニュー（「不具合」の行の上。どのタブからも開ける）と、「不具合の記録」の窓の中。PC・スマホ同じ（mobile-parity.md の全体の表）
- 既定は自動（上の判定）。入はどのブラウザでも当たる（試すため）。localStorage の `hakoniwa-iossafe`（自動のときは消す）。押すとすぐ切り替わり、知らせ（toast）と記録の控え（`safe：…`）が出る
- 住人の設定の窓（歯車）は住人ごとの設定なので、画面全体のスイッチは置かなかった（同じ窓を開ける「表示」のメニューと記録の窓の 2 か所）

### 見張りの誤検出（ui-guard-scroll.js・ui.js）

- タブの切り替え（`setTab`）を `HK.Guard.note('tab', 'タブ：result → cast')` で控える。タブの切り替え・描き直し（`redraw`。ページに戻ったときの描き直しも）・ページに戻った（`pageshow`・`visibilitychange`）の直後 1 秒と、前のスクロールの知らせのあとにそれらがあったときは、高さの急な変化（shrink）を数えない（iOS 18.7 の利用者の記録の shrink 6 件も、すべてタブの切り替え・ページに戻った直後の描き直しの誤検出だった）
- 飛び（jump）の記録に「指で触っている最中／指は離れている」（`HK.Guard.touching()`）と、セーフモードのときは「セーフモード」を添える

### 確かめたこと（Playwright・Chromium。WebKit 本物は無い）

| 見たこと | 結果 |
|---|---|
| iOS 18.2.1 の UA（Version/18.2。390×664・isMobile・hasTouch）・iOS 16.7 の UA（Version/16.6.2）・自動 | `hk-ios-legacy` が付く。`.tabs` static・`body::before` none・overflow-anchor auto |
| iOS 27 の UA（OS 18_6・Version/27）・iOS 18.7 の UA（Version/26.6.1）・自動／iOS 18.2 で切／PC 1280 で自動 | 付かない（`.tabs` sticky のまま。PC の切は今までと同じ表示） |
| デスクトップ用表示（Mac の UA・Version/18.2・タッチ 5 点・980 幅）・自動 | 付く |
| PC 1280 で入 | 付く（試せる） |
| スイッチ（表示のメニュー）入→切→自動・記録の窓で入 | その場で CSS が切り替わる。押した札の aria-pressed・メニューは開いたまま |
| 4 タブ（結果→住人→箱庭→セーブ→結果）を下までスクロール（390：108 回、1280：23 回） | 位置の後戻り 0・ページの例外 0・記録（jump・shrink）0 件 |
| タブの切り替えの控え | `tab：タブ：cast → box` など 6 件。切り替えの直後の shrink は 0 件（結果 9070px → 住人 2604px） |
| Version/ の無い WebView の UA（iPhone）・自動 | 付く |
| 描き直し（`HK.UI.refresh`）・ページに戻った（pageshow）の直後に結果 9097px → 住人 2604px | shrink 0 件。対照（1 秒過ぎてから描き直しなしで同じ縮み）は 1 件記録される |
| タブの頭へ（タブを押し直す・`.tabs` が static） | 落ちない（例外 0） |
| 参加表（390・セーフモード） | `--pz` 1・zoom 1・transform none・−／＋／全体を表示が押せない・固定の一文。表は横スクロールで崩れない |
| 一押し（390・セーフモード） | translateZ の方式で 11 回、`hk-repaint(-z)` の残り 0 |
| 記録の頭（390） | `画面：390x664・縦・倍率 3・WebKit・描き直しの一押し：有効（層を作り直す）・Safari 16〜18 のセーフモード：有効（自動）` |

### 利用者に確かめてもらう手順

1. ページを読み込み直す。iOS 18.2 など Safari 18 以前の人は**まず自動のまま**（右上の「表示」→「Safari の表示を軽くする」が「自動」で、説明に「この端末では入」と出ていること）。上の切替がスクロールで流れるようになっていれば当たっている
2. 住人・箱庭・結末の各タブで下までスクロールし、真っ白・飛びが出るかを見る
3. 自動で「切」と出る端末で白くなるなら「入」にして試す
4. それでも出るなら「表示」→「不具合の記録」→「コピー」で送ってもらう（頭の行に `セーフモード：有効`、飛びの記録に「指で触っている最中か」が出る）
5. iOS 27 など起きない端末は「自動」（＝切）のままでよい
