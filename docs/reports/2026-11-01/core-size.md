# 担当CR：中核（core）が膨らむのを止める — 内訳・振り分け・仕組み

（2026-11-01。利用者の依頼「中核（core）が膨らんでいくのを直せないか」。build のたびに「※ 中核（core）の br が 1MB を超えています（1146KB）」と出ていた）

---

## 0. 結論

| | 変える前 | 変えたあと | 差 |
|---|---|---|---|
| R18版の中核 | 173本・5007KB（br **1146KB**） | 138本・3344KB（br **815KB**） | br −331KB（−29%） |
| 全年齢版の中核 | 125本・2733KB（br **688KB**） | 123本・2616KB（br **661KB**） | br −27KB（−4%） |
| R18版の late | 18本・br 160KB | 19本・br 184KB（deps=pack-lewd） | +24KB（TIPS） |
| R18版の新しいかたまり pack-lewd | — | 31本・1480KB（br 307KB） | 画面が出たあと late の前に読む |
| 全体の合計（R18版） | br 4966KB | br 4986KB | ほぼ同じ（分け方だけ変えた） |

- 目標の **R18版の中核 br 1MB 未満（できれば 0.9MB 以下）** を満たした（815KB）。全年齢版も 661KB。
- 結果は変わらない：`regress.js` の指紋（R18版 #r18・R18版 #safe・全年齢版。指紋1・2 とも）が変える前と全箱庭一致。
  `chunk-regress.js`（単独・乱順5通り・口調の閉包）3 通りとも 0 件、`chunk-audit.js` 3 通りとも 0 件、`audit-all.js` すべて 0 件、`catalog-check.js` 0 件。
- 起動の実測（下の 5 章）：R18版で「画面が使えるまで」が 552ms → 447ms（回線を 20Mbps に絞ると 1.24 秒 → 0.92 秒）。全年齢版は 20Mbps で 0.84 秒 → 0.80 秒。
- 膨らみ続けないように、build が中核の内訳（大きい順の上位15本と、前回の build からの増減）を毎回出し、1MB を超えたら増えたファイルを名指しする。CLAUDE.md に振り分けの決まりを 2 行足した。

---

## 1. 内訳（変える前・R18版の中核 173本）

大きさは軽量化後の字数と、ファイル単独で br（品質9）にした目安（かたまり全体では辞書を共有するので、単独の合計 1399KB より 2 割ほど小さい 1146KB になる）。
分類：(a) 特定の箱庭・族だけ (b) 画面が出たあとでよい (c) R18 の文の表・夜の部品（全年齢では使わない） (d) 本当に中核に要る。

| # | ファイル | 軽量化後 | br の目安 | 分類 | 行き先・残した理由 |
|---|---|---|---|---|---|
| 1 | ero-moan-tone.js | 259KB | 49KB | c | **pack-lewd** |
| 2 | hate-sex-r18.js | 188KB | 40KB | c | 中核に残す：content-events-r18.js（中核）が読み込み時に HS.extra・HS.why を包む（下の 3-3） |
| 3 | scenario-futari.js | 120KB | 34KB | a | 中核に残す：隠した箱庭（目録に載らない。#futari のときだけ中核で登録する作り）。移すには目録に隠し箱庭の欄が要る（見送り 4 章） |
| 4 | ui.js | 114KB | 34KB | d | 画面の本体 |
| 5 | novel-moan-tone.js | 157KB | 31KB | c | 中核に残す：口調のデータ（tone-*）の喘ぎの列 N を受ける HK.NovelMoan.T が中核に要る（見送り 4 章） |
| 6 | thick-sex.js | 119KB | 31KB | c | **pack-lewd** |
| 7 | tips.js | 94KB | 27KB | b | **late**（？ボタンは HK.Tips があるときだけ出す作り。late のあと HK.onLate が描き直す） |
| 8 | omega-thick-kit.js | 100KB | 26KB | c | **pack-lewd** |
| 9 | daily-kit.js | 83KB | 25KB | d | engine.js が HK.Daily、events-common.js・mini.js が HK.MINI を使う |
| 10 | ero-initiative-text-r18.js | 101KB | 23KB | c | **pack-lewd** |
| 11 | ties.js | 78KB | 23KB | d | 関係の本体 |
| 12 | voice.js | 67KB | 21KB | d | 台詞の言い換えの本体 |
| 13 | hate-love-more.js | 86KB | 19KB | d | HK.LoveHate（中核の ties・endings・feud-kit が全箱庭で使う）への追加 |
| 14 | tone-engine.js | 59KB | 19KB | d | 口調エンジン |
| 15 | attr.js | 60KB | 19KB | d | 住人の設定（画面と本体） |
| 16 | solo-r18-moan-data.js | 74KB | 18KB | c | **pack-lewd** |
| 17 | thick-sex-ero.js | 72KB | 18KB | c | **pack-lewd** |
| 18 | pos-nogen.js | 51KB | 17KB | d | pos.js（中核）が HK.NoGen を使う |
| 19 | engine.js | 48KB | 16KB | d | 本体 |
| 20 | hate-sex-refuse-r18.js | 74KB | 16KB | c | **pack-lewd**（HK.HateSex.Refuse を足すだけ） |
| 21 | trio-talk-r18.js | 64KB | 16KB | c | **pack-lewd** |
| 22 | voice-override-solo.js | 87KB | 16KB | a/表 | 中核に残す（台詞の上書きの表。tone の印に移せるかは見送り 4 章） |
| 23 | tone-dict-builtin.js | 82KB | 16KB | d | 口調の辞書 |
| 24 | moan-tease-r18.js | 84KB | 16KB | c | **pack-lewd** |
| 25 | view.js | 45KB | 16KB | d | 結果の表示 |
| 26 | special.js | 56KB | 15KB | d | ui.js・shared-stats.js が使う |
| 27 | moan-engine.js | 44KB | 15KB | c | **pack-lewd**（HK.Moan を使う中核の所はすべて `HK.Moan &&` で無くても動く） |
| 28 | hate-love.js | 58KB | 14KB | d | HK.LoveHate の本体 |
| 29 | tone-plus.js | 47KB | 14KB | d | 口調 |
| 30 | ero-flavor-lines-r18.js | 62KB | 14KB | c | **pack-lewd** |
| 31 | tone-new2-rows.js | 63KB | 14KB | 表 | 中核に残す（口調の書き下ろしの表。tone の印に移せるかは見送り 4 章） |
| 32 | same-story.js | 47KB | 13KB | a | **pack-story**（使うのは邪神村・吹雪の館・宇宙船・人狼＝pack-story の箱庭だけ）。same-story-r18.js も一緒に |
| 33 | epilogue.js | 43KB | 13KB | d | view.js が結末の表示で使う |
| 34 | solo-variety-data.js | 40KB | 13KB | a | **scen-variety**（エロバラエティ番組だけ） |
| 35 | solo-locker-data.js | 43KB | 13KB | a | 中核に残す：ero-flavor-r18.js が読み込み時に HK.LOCKER.pick を包む・safe.js も使う（見送り 4 章） |
| 36 | ui-ties.js | 40KB | 12KB | d | 住人タブ |
| 37 | content-text-r18.js | 44KB | 12KB | c | 中核に残す：content-events-r18.js（中核）が読み込み時に読む |
| 38 | portable.js | 37KB | 12KB | b | 中核に残す（見送り 4 章） |
| 39 | tie-rel.js | 44KB | 12KB | d | 関係 |
| 40 | ui-gear.js | 37KB | 12KB | d | ⚙設定 |
| 41 | view-map.js | 33KB | 12KB | d | 結果の表示 |
| 42 | after-reply-top-r18.js | 58KB | 11KB | c | **pack-lewd** |
| 43〜45 | poly・obsess-kit・food | 34〜35KB | 各11KB | d | 中核・全箱庭が使う |
| 46 | content-events-r18.js | 32KB | 10KB | c | 中核に残す：Ctx.prototype.say を素の代入で包み、包みの順が中核の avoid-kit・attr-look・attr-meet・voice-fp と入れ替わると乱数の順が変わりうる（3-3） |
| 47 | ero-top-lines-r18.js | 49KB | 10KB | c | **pack-lewd** |
| 54 | moan-top-said.js | 47KB | 9KB | c | **pack-lewd** |
| — | ほか pack-lewd へ | | | c | ero-flavor-r18 8・moan-cut 8・moan-said-more 7・after-reply-r18 7・ero-initiative-r18 6・pos-lead-r18 5・solo-r18-moan 4・special-r18 4・moan-mob 3・moan-said 3・moan-dict 3・thick-vmd 2・solo-feud-r18 1 |
| — | ほか pack-lewd へ（R18 の喘ぎの設定の画面） | | | b+c | ui-adv-moan-fit 6・ui-adv-moan 5・ui-gear-moan 5・ui-voice-moan 3 |
| — | 残りの約 110 本 | | 各 9KB 以下 | d ほか | 口調（tone-*.js）・画面（ui-*.js）・状態の保存など |

全年齢版の中核（125本・br 688KB）の上位は scenario-futari 34・ui 34・daily-kit 25・ties 23・voice 21・tips 21・hate-love-more 19・tone-engine 19・attr 18・engine 16。
R18 の表は全年齢版にはもともと入っていない（R18版だけのファイル）ので、全年齢版で外せたのは tips.js（late）と same-story.js（pack-story）。

---

## 2. 移したもの（_order.txt の振り分け）

### 2-1. 新しいかたまり pack-lewd（R18版だけ。31本・br 307KB）

- 夜の場面・喘ぎの文の表と、それを組み立てる R18 だけの部品、R18 の喘ぎの設定の画面（上の表で **pack-lewd** の行）。
- 読む時：`@chunk late deps=pack-lewd`・`@chunk pack-rel deps=pack-lewd`・`@chunk pack-solo deps=pack-lewd`・`@chunk pack-trap deps=pack-lewd`。
  late は画面が出たあとに読むので、pack-lewd も画面が出たあと late の直前に読む。箱庭のかたまりはどれも pack-rel／pack-solo／pack-story（→pack-rel）を通って pack-lewd に頼るので、
  先に読んだ前回の箱庭が pack-lewd より先に届いても、読み込み時に足りない物は無い（chunk-audit の (3') が 0 件）。
- 動かす前は ui.js の whenReady が LATE_READY（late を読み終えたら true。pack-lewd はその前）を待つので、箱庭を回すときはいつも pack-lewd が有る。
- 残した結果を開くとき（scenOnly）も、箱庭のかたまりの依存で pack-lewd を読む。
- ファイルの通し番号（HK.wrap／HK.addTo の並べ替えの鍵）は _order.txt の位置のままなので変わらない（late に移すと番号が後ろに移るが、@pack では変わらない）。

### 2-2. late へ

- tips.js（R18版 br 27KB・全年齢版 21KB）。late の tips-scen-a〜d・event-catalog-ui.js（HK.Tips.scenBtn を HK.wrap で包む）より前に置いた。
  ？ボタンは `HK.Tips ? HK.Tips.btn(…) : ''` で、無いうちは出さない作り。late を読み終えると HK.onLate が住人タブ・箱庭タブを描き直すので、そこで出る。

### 2-3. 族・箱庭のかたまりへ

- same-story.js（両ビルド）・same-story-r18.js（R18版）→ pack-story。
- solo-variety-data.js（R18版）→ scen-variety。

### 2-4. コードの手直し（結果は変えない）

- **ui-gear.js（両ビルド）**：住人の要約の「声：…」「喘ぎ辞書：N行」は、`HK.LATE_READY !== false`（late と pack-lewd を読み終えた）ときだけ添える。読み込み時の描き直しで pack-lewd の物を読まないように（chunk-audit (2)）。読み終えたら onLate が描き直す。
- **ui-voice-moan.js（R18版）**：読み込み時の `HK.UI.refresh()` を、late を読み終えたあとのときだけにした（読み終える前なら onLate が描き直す）。
- **moan-engine.js・pos-lead-r18.js・ero-initiative-r18.js（R18版）**：`HK.simulate` の素の代入による包みを `HK.wrap(HK, 'simulate', …)` に書き換えた（中身は同じ）。
  pack-lewd は中核のあとに読むので、素の代入のままだと、そのあとに来るかたまりの HK.wrap（scen-whiteroom の safe-room.js など）が「素の代入で書き換えられた」とみなして並べ直しを切ってしまう。
  実際に全年齢モードの出られない部屋で、voice-seg.js（台詞の区分 e.seg を付ける包み）より safe-room.js（全年齢の書き換え）が外側に回り、seg が本文とずれた（audit-all の seg join 2 件）。HK.wrap にして 0 件に戻した。

---

## 3. 確かめたこと

### 3-1. 点検の結果（最後の build で）

| 点検 | 結果 |
|---|---|
| regress.js（指紋1・2。N=6）R18版 #r18 | 19箱庭すべて一致 |
| regress.js R18版 #safe | 14箱庭すべて一致 |
| regress.js 全年齢版 | 16箱庭すべて一致 |
| chunk-regress.js（単独・乱順5通り・口調の閉包） | R18版 r18／safe・全年齢版：不一致・エラー 0 件 |
| chunk-audit.js | 3 通りとも 0 件 |
| audit-all.js（既定の一式） | すべて 0 件（R18版 4748 回・全年齢モード 2380 回・全年齢版 2900 回） |
| catalog-check.js | 0 件 |
| build の口調のデータの確かめ（3 通りの読む順） | 一致 |
| 記録の本文と seg の比べ（seg-audit の配役・内容のスイッチ全部・環境値を最大にした回を、変える前のビルドと 1 件ずつ比べる） | R18版 380 回・全年齢モード 280 回・全年齢版 192 回で違い 0 |
| 画面の操作（Playwright。http で br を配る） | R18版・全年齢モード・全年齢版で console のエラー 0（下） |

画面の操作：住人タブ・TIPS の？・⚙設定・口調の設定（住人と全体。喘ぎの見本を押す）・話題の節・箱庭タブ・動かす（合コン・出られない部屋・媚薬ロッカー・マッサージ・邪神村・バラエティ・ダンジョン・オメガバース）・結果・この結果をセーブ・セーブタブ・開く。
加えて late と pack-lewd の到着を 4 秒遅らせ、届く前に ⚙設定・口調の設定（全体・住人）を開き「動かす」を押した：エラーなく「データを読み込んでいます」のまま待ち、届いたあと結果が出た。
届く前の口調の節は「口調の設定」（喘ぎの欄なし）、届いたあとは「口調・喘ぎの設定」と全体の節 3 つ（夜の色の寄り・喘ぎ声の調整・喘ぎの辞書）で、変える前と同じ並び。

### 3-2. 包みの順（なぜ一部を中核に残したか）

かたまりを後から読むと、そのファイルの「素の代入による包み」（`var f0 = X.f; X.f = function () { … f0 … }`）は、中核の同じ関数の包みより外側に来る。
HK.wrap で書かれた包みは通し番号の順に並べ直されるが、素の代入の包みは並べ直せない。pack-lewd に入れたファイルの包みを全部洗った（HK.simulate・Ctx.prototype.say／pair・Voice.processResult／processText・Story.say・Ero.fresh・TKC.body など）：

- HK.simulate：moan-engine・pos-lead-r18・ero-initiative-r18 を HK.wrap に（2-4）。中身は「入口で状態を置く／部品を取り付ける」だけで、内側の素の包み（pos.js など中核 160〜271 番）との前後は結果に効かない（指紋・本文の比べで確認）。
- Ctx.prototype.say：ero-flavor-r18 の包みは「呼ぶ前に why に印を付ける」だけで、外側に回っても前後の包みが見る値は同じ。
  **content-events-r18 の包みは呼んだあとに本文を足し・別の記録を出す（乱数を使う）ので、中核の avoid-kit・attr-look・attr-meet・voice-fp の包みと前後が入れ替わると乱数の順が変わりうる → 中核に残した**。
  それが読み込み時に包む HK.HateSex（hate-sex-r18.js）と、読む HK.CtText（content-text-r18.js）も中核に残した。
- Ctx.prototype.pair（ero-top-lines-r18）：ほかに包むのは engine.js の定義だけ。
- Voice.processResult（moan-engine・moan-cut）：もともと一番外側（番号がいちばん大きい）なので変わらない。
- Story.say（ero-initiative-r18・ero-flavor-r18）：HK.wrap で、中核の HK.wrap（voice-fp）との並びは番号どおり。

---

## 4. 見送ったもの

| ファイル | br | 理由 |
|---|---|---|
| hate-sex-r18.js・content-events-r18.js・content-text-r18.js | 40＋10＋12KB | 3-2 のとおり。content-events-r18 の Ctx.prototype.say の包みを HK.wrap にし、中核の avoid-kit・attr-look・attr-meet・voice-fp も HK.wrap にそろえれば移せるが、今の pack-rel の包みとの並びも変わるので、指紋が変わらないことを別に確かめる作業になる |
| scenario-futari.js | 34KB（両ビルド） | 隠した箱庭。目録（HK_MANIFEST）に載らないので、本体を scen-futari に移すと #futari で開いたときに仮の箱庭（HK.Load.info）を作れない。目録に「隠し箱庭」の欄を足し、#futari で SCEN_ORDER に足す小さな部品を中核に残す形にすれば移せる（load.js・build-manifest.js の変更） |
| novel-moan-tone.js | 31KB | 口調のかたまり（tone-base など）が HK.NovelMoan.T に喘ぎの列 N を入れる受け口（load.js の toneData）が、NovelMoan が無いと捨てる。tone-base が pack-lewd より先に届くことがあるので、受け口に「後から来た NovelMoan に渡す」仕組みを足してから（今は N の行が無いので実害は無いが、将来足したときに消える） |
| voice-override-solo.js・tone-new2-rows.js・tone-lines.js | 16＋14＋6KB（両ビルド） | 口調の書き下ろしの表（V.OVR・TONE_FIX を書くだけ）。tone の印にすれば口調ごとのデータに分かれるが、通し番号が後ろに移り、同じ鍵を書く中核のファイルとの上書きの順が変わりうる。build の確かめ（3 通りの読む順）と指紋で確かめる別の作業にする |
| solo-locker-data.js | 13KB（両ビルド） | ero-flavor-r18.js が読み込み時に HK.LOCKER.pick を包む（無ければ包まない）・safe.js も読む。scen-locker に移すと、ロッカーを後から読んだときに包みが当たらない |
| omega-data.js・dungeon-*.js・solo-kit.js など | 各 2〜8KB | persona.js・persona-final.js・safe.js・view.js など中核が使う |
| portable.js・save-folder.js・share-card.js・egoquiz.js・ui-import.js | 合計 約30KB（両ビルド） | 押したときだけ要る画面だが、ui.js が読み込み時に HK.EgoQuiz に関数を渡す（late だと渡らない）など、画面側の作りを変える必要がある |
| pack-lewd を「R18 モードで箱庭を動かすときだけ」読む | — | 今は late の依存なので、全年齢モード（#safe）でも画面が出たあとに読む。モードで読み分けるには、全年齢モードで pack-lewd が無いときに結果が同じこと（ero-flavor-r18 などは全年齢モードでも包みを付ける）を chunk-regress で確かめる仕組みが要る。起動時に読む量（中核）には効かないので見送り |

---

## 5. 起動の実測

Playwright（chromium）・http（127.0.0.1。.br を Content-Encoding: br で返す）・まっさらな文脈（保存なし）・CPU の遅延なし。中央値。
「画面が使えるまで」＝中核を読み終え（HK.Load の core が done）、住人タブが描かれた時刻（performance.now）。「late まで」＝HK.LATE_READY が true になった時刻。

| ビルド | 回線 | 中核の br | 画面が使えるまで（前→後） | late まで（前→後） | 画面が使えるまでに受け取った量（前→後） |
|---|---|---|---|---|---|
| R18版 | 絞らない（9回） | 1146KB → 815KB | 552ms → **447ms** | 820ms → 731ms | （手元の配信なので全部が先に届く） |
| R18版 | 20Mbps・往復40ms（7回） | 1146KB → 815KB | 1241ms → **917ms** | 1520ms → 1483ms | 1146KB → 815KB |
| 全年齢版 | 絞らない（9回） | 688KB → 661KB | 420ms → 438ms（差は揺れの範囲） | 562ms → 568ms | （同上） |
| 全年齢版 | 20Mbps・往復40ms（7回） | 688KB → 661KB | 838ms → **799ms** | 1004ms → 966ms | 688KB → 662KB |

- R18版は、画面が使えるまでが絞らない回線で約 2 割、20Mbps で約 3 割（0.32 秒）早くなった。late まで（夜の文・喘ぎの設定・TIPS を含めて全部そろうまで）は、読む量の合計が同じなのでほぼ変わらない。
- 全年齢版は中核が 4% 減っただけなので、絞らない回線では差が出ない（揺れの範囲）。20Mbps では 0.04 秒ほど早い。
- どの回もページのエラーは 0。

---

## 6. 膨らみ続けないための仕組み

- **build.js**：毎回、中核の内訳を出す。
  - 「中核の内訳（N本。軽量化後の大きさ・ファイル単独の br の目安。大きい順の上位15本）」
  - 「前回の build からの中核の増減（br の目安の合計 A → B・±）：増えた … ／減った … ／中核に足した … ／中核から外した …」（±1KB 以上）
  - 中核の br が 1MB を超えたら、警告に「前回より増えた・中核に足したファイル」を大きい順に出し、振り分けの決まり（CLAUDE.md）を示す。
  - ファイルごとの数字は `js/c/.prev.json` の `core`（{ファイル: [軽量化後のバイト数, 単独の br]}）に残す（次の build が比べる）。今回のコミットでは、変える前の中核の内訳を `.prev.json` に入れてから build したので、差分（中核から外した 35 本など）が出る。
- **CLAUDE.md**（「スクリプトはかたまりに分けて配る」の項の下に 2 行）：文の表・箱庭固有・R18 の夜の文の表と喘ぎの設定の画面（@pack:lewd）・画面の後回しは中核に入れない。中核の br の目安は 0.9MB 以下（上限 1MB）、20KB 以上増えたら振り分けを見直す。

---

## 7. 追記（2026-11-04）：二度目の見直し

その後に中核へ足されたもので、R18版の中核が br の目安の合計 1050KB（かたまりの br 859KB）、全年齢版が 860KB（704KB）まで戻っていた。
新しいかたまり pack-sim（動かすのに要るが画面を出すのには要らない部品。`@base pack-sim` で全部のかたまりの依存に入る）を足し、4 章で見送ったもののうち hate-sex-r18・content-events-r18・content-text-r18（Ctx.prototype.say の包みを HK.wrap にそろえた）・scenario-futari（目録に隠し箱庭の欄 hidden を足した）・novel-moan-tone（口調のデータの N を後から渡す HK.Load.flushTone）・voice-override-solo・tone-new2-rows（tone の印）を移した。portable.js・share-card・egoquiz は late へ。

| | 2026-11-01 のあと | 2026-11-04 の前 | 2026-11-04 のあと |
|---|---|---|---|
| R18版の中核（かたまりの br／目安の合計） | 815KB／— | 859KB／1050KB | **566KB／698KB** |
| 全年齢版の中核 | 661KB／— | 704KB／860KB | **513KB／628KB** |

あわせて、中核の上限を build で判定するようにした（かたまりの br・目安の合計のどちらかが 900KB を超えたら build が不合格）。分け方・対応表・決まりの変更は `docs/reports/2026-11-04/core-split.md`。
