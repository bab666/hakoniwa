# 追加パック（新しい箱庭のセット）のソース

本体とは別に作り直して配る、有料の追加パックのソースを置く。仕組みは `docs/reports/2026-11-02/pack-foundation.md`。

## フォルダ

```
hakoniwa-packs/
  README.md             … これ
  codes.example.json    … コードのファイルの見本
  codes.local.json      … 本物のコード（git に入れない。codes.example.json を写して作る）
  _sample/              … 見本のパック（本番に出さない。試しのフォルダにだけ組み立てる）
  set-a/                … パック（1セット1フォルダ）
    pack.json
    js/*.js
```

## pack.json

```json
{
  "id": "set-a",
  "slot": "set-a",
  "name": "ソロR18セット",
  "desc": "コードの入力画面に出す紹介（部屋の名前は書かない）",
  "builds": ["full"],
  "api": 2,
  "chunks": [
    { "name": "tentacle", "deps": ["pack-solo"], "files": ["js/tentacle.js"] },
    { "name": "av", "deps": { "full": ["pack-rel", "pack-solo"], "zenrei": ["pack-rel"] }, "files": ["js/av.js", "js/av-text.js"] }
  ],
  "needs": { "set-a-av": ["pack-trap"] }
}
```

- `id`：英小文字・数字・-。箱庭の id はこれで始める（`set-a-tentacle`）。
- `slot`：本体が読みに行く枠（`set-a`〜`set-l`）。ふつうは id と同じ。
- `builds`：作るビルド（`full`＝R18版、`zenrei`＝全年齢版）。Cセットのように R18版だけなら `["full"]`。
- `chunks`：かたまり。箱庭1つにかたまり1つが目安（その箱庭を選んだときだけ読まれる）。`deps` は頼る本体のかたまり（`pack-rel`・`pack-solo`・`pack-story`・`pack-trap`・`scen-<箱庭>` など。本体の `js/_order.txt` の `@chunk` を見る）か、同じパックのかたまりの名前。ビルドで分け方が違うときは `{ "full": [...], "zenrei": [...] }`。
- `needs`：任意。その箱庭を動かすのに、登録するかたまりのほかに要るかたまり。
- `api`：パックが頼る本体の版（本体の `HK.Packs.API`。`js/packs.js`）。本体より新しい版のパックは開かずに「本体を新しくしてください」と出る。台詞に `{一人称}`・`{二人称}` を書くパックは **2**（2026-11-06。本体がこの印を展開する版）。

## ファイルの書き方

- 最上位は `(function () { 'use strict'; var HK = window.HK; … })();` で包む（本体と同じ決まり）。
- 箱庭の登録は `HK.SCENARIOS['set-a-tentacle'] = scen;` だけ。並び（`HK.SCEN_ORDER`）は本体が足す。
- **台詞の一人称・二人称は `{一人称}`・`{二人称}` で書く**（2026-11-06。「私」「あなた」「俺」などを直に書かない。話し手の一人称・二人称に展開される。名前は `{a}`／`{b}`。3 本の台詞の例：`「{二人称}がいてくれて、{一人称}はうれしい｜＝｜{二人称}がいてくださって、{一人称}はうれしいです」`。書き下ろしの鍵は今までどおり「私」「あなた」の本文で書き、値を印で書く。印を使うパックは pack.json の `api` を 2 にする。決まりは `docs/reports/2026-11-06/fp-marker-design.md`）。
- 本体の作業の決まり（CLAUDE.md）はパックにもそのまま当てる：台詞の3本、R18の文の基準、体の語の印、`HK.SexLead` への登録、出来事の印と表示名、恋愛対象・受け攻めの点検。
- 両方のビルドに出すファイルでは、性的な場面の文を `/* r18:begin */`〜`/* r18:end */` で挟む。全年齢版のパックを作るときに落とし、性的な語が残っていれば止まる。

## 部屋ごとの長いエッチの場面・エッチの型（2026-11-03）

本体の長い場面（`HK.ThickSex.scene`・`HK.ThickEro.scene`）は、一回ごとに「エッチの型」（入り方・主な責め・道具・体位・終わり方。`HK.Play`）を決めて組み替える。部屋の側からは次の 3 つで関われる（設計は `docs/reports/2026-11-03/play-design.md` の 7）：

- `HK.Play.addScene(部屋の id, { id, label, when(ctx, a, b, opt), weight, play: { pos: … }, lead: { mf: [...], ff: [...], fm: [...] }, steps: [ { stage: 'undress'|'fore'|'insert'|'play'|'after', mf|ff|fm|all: [...] }, … ], tags: ['night'] })`：その部屋でしか出ない長い場面。`lead` がきっかけの段、`steps` が段階順の段（各 3 文以上・3 組の専用文）。山場の喘ぎ・終わり方・事後は共通の部品が後ろに付く。場面の近くに `/* @event scen=<部屋の id> id=<場面の id> tags=night label=… */` を付ける。
- `HK.Play.addRoom(部屋の id, { entry: { bath: 2 }, prop: { chakui: 1 }, … })`：部屋の小道具として、型の値の選ばれやすさを足す。
- 長い場面を呼ぶときの `opt.playScene`（登録した場面に決める）・`opt.play`（型の軸を固定）。短い・中くらいの場面に主な責めと体位の一文を入れるなら `HK.Play.shortLine(攻め, 受け, 組, opt)`（`{a}{b}` のままの文）。

足したら `sex-flow-audit.js` を部屋のある試しのフォルダで回し、(a)〜(h)（(h) は型の矛盾）を 0 件にする。

## 部屋専用の段（セット B の HK.PairR18・2026-11-05）

セット B の部屋（新婚・看病・デート）の短い・中くらい・長い場面は、共通の部品 `set-b/js/kit-r18.js` の `HK.PairR18.scene` で組む。共通の段（本体の `HK.ThickSex`・`HK.ThickEro`・kit の `FB`）だけで組むと、3 部屋で同じ段落が出る（2026-11-05 の報告では場面の文の 4 割強）。**部屋の段を登録すると、中くらい・長い場面はその段だけで組み、共通の段は補いになる**（目標：その部屋だけの文 8 割以上）。

```js
/* r18:begin */
HK.PairR18.addRoom('<部屋の id>', {
  ok: function (ctx, t, a, b) { return true; },   /* 部屋の文の絞り込み（住まい・家事・時間帯など。省いてよい） */
  open:  [ '…', … ],                               /* 長い場面の書き出し（6 本以上。寝床へ向かう・口づけ。挿入・山場なし） */
  fore:  { mf: [ … ], ff: [ … ], fm: [ … ] },      /* 前戯（挿入なし。{m0}＝こらえる声） */
  insert:{ mf: [ … ], ff: [ … ], fm: [ … ] },      /* 繋がる段（mf＝{男性器}、ff＝指・重ね合わせ、fm＝指と手、まれにペニバン。{mm}＝最中の声） */
  mid:   { all: [ … ], mf: [ … ], ff: [ … ], fm: [ … ] }, /* 最中の一幕（12 本以上で部屋の重み 95%。山場・脱がせる・体位を変える動きは書かない） */
  peak:  { mf: [ … ], ff: [ … ], fm: [ … ] },      /* 山場（{m}＝受けの絶頂の喘ぎ。態度・口調で本体の表から入る） */
  peakE: { mf: [ … ], ff: [ … ], fm: [ … ] },      /* 男性向けの山場（2 文以上） */
  end:   [ … ],                                    /* 終わり方（果てたあとの一幕。5 本以上。挿入・体位の言い回しは書かない） */
  again: [ … ]                                     /* 濃いときのもう一度（省けば本体の文） */
});
/* r18:end */
```

- 表の要素は文字列（三つの組で使える文）か、`{ t: 文, sh: 'mf'|'ff'|'fm'|'all', when(ctx, a, b, sh) }`。あとから足すときは `HK.PairR18.addMid(id, list)`・`addEnd`・`addOpen`・`addFore`・`addInsert`・`addPeak`・`addPeakE`・`addAgain`。
- 組み方（`HK.PairR18.compose`）：中くらい＝前戯 → 繋がる段 → 最中の一幕 2 → 山場 → 終わり方、長い＝書き出し → 前戯 1〜2 → 繋がる段 → 最中の一幕 2（描写「厚く」は 3）→ 山場 → 終わり方（→ 濃いときはもう一度）。そのあとに部屋の事後の文。夜の性格・夜の主導の一文（本体）は書き出しのあとに入る。最後に本体の流れの管理（`HK.SexFlow.fix`）に通す。
- 重み（`HK.PairR18.roomW`）：書き出し・前戯・繋がる段・最中・山場（男性向けは peakE）・終わり方がその組にそろっていて、最中の一幕が 12 本以上なら 95%（`addRoom` の `w` で変えられる）。少なければ本数に比例。性器の指定で形と体が食い違う組（フタナリなど）・性器なしの組は共通の組み立て。男性どうしは mf の文を使い、受けに男性器があれば `{女性器}`・`{陰核}` の文を外す（受けの男性器の文は `when` で受けに男性器があるときだけに）。
- 一回の遊びで同じ段落は二度出さない（`ctx._pkLru`。`HK.PairR18.lru(ctx, 配列)` は部屋の文にも使える）。共通の長い場面に渡す選び方も繰り返さない選び方（`HK.Ero.freshPick`）にした。
- 書くときの決まり（sex-flow を 0 件にするため）：場所は一つ（寝室ならベッド。玄関・台所・脱衣所・ソファなど場所の語を最中の一幕に書かない）。後ろからの繋がる段（うつ伏せ・後ろから・背中から）のあとは、顔を合わせる文（見つめ・額・頬・見下ろす…）を自動で外す。最中の一幕は 3 文で、性感が閾値に届くように「動き」「揺れ」などの最中の言葉を入れる（fm は指の文だけだと前戯に数えられるので、受けの「腰を揺らす」などを 1 文）。描写の長さ「数行で短く」の場面は一つの段落にまとまる（部屋の段は使わない）。
- 確かめ方：`HK.PairR18.trace = []` にして回すと、部屋の段で組んだ場面（印の解決前）がたまるので、`HK.SexFlow.analyze(text, a, b, sh, after)` で数える（新婚部屋の計測は `docs/reports/2026-11-03/shinkon-design.md` の 10）。
- 体の語の絞り込み（受けに男性器があれば `{女性器}`・`{陰核}`・`{愛液}`・「潮を」の文を外す）は、`addRoom` の表と `addMid` などで足した段にだけかかる。部屋が `HK.Play.addScene` の lead・steps や、`HK.PairR18.scene` に渡す書き出し（`MO.OPEN`）を自分の関数で返すときは、部屋の側で同じ絞り込みと `ok`（部屋の決まり）を通す（配信の部屋の `fit`・`MO`。2026-11-06 P15b：男性どうしの専用の長い場面に女性器の語が出ていた）。mf の文は受けが男性のこともあるので `{ナカ}` で書くのが安全。

## 温度（HK.Heat・2026-11-06）

本体の温度 6 段（`HK.Heat`。`hakoniwa-full/js/heat.js`・かたまり pack-sim。設計は `docs/reports/2026-11-06/heat-design.md`）：初々しい fresh／甘い sweet／じゃれ合い play／ドライ dry／荒い rough／歪んだ warped。
温度は部屋が登録したときだけ働く（既存の箱庭は夜の色 `HK.EroFlavor` のまま）。パックは本体の「かたまりの名前」にだけ頼るので、`HK.Heat` が無くても落ちないように書く。

```js
/* r18:begin */
if (HK.Heat && HK.Heat.use) HK.Heat.use('<部屋の id>');          /* 温度を読む部屋にする（合意なし寄りの部屋は { forceGate: true }：荒い・歪んだは内容のスイッチ「無理矢理」が入のときだけ） */
var H = HK.Heat && HK.Heat.enabled && HK.Heat.enabled('<部屋の id>') ? HK.Heat : null;
var h = H ? H.of(ctx, 攻め, 受け, { first: 初めてか（分かれば）, rel: 'lover'|'casual', kind: 'naka'（仲直り）|'jeal'（やきもち）, scen: '<部屋の id>' }) : null;
/* 場面のあいだ H.scope を置く：本体の型（HK.Play）の重み・飽きない決まり・体の特徴の溶かした文・候補の絞り込み（H.pickWrap(pick)・H.trim(list)）が温度を読む */
var r = h ? H.scope(ctx, a, b, h, function () { return 場面を組む({ flavor: H.flavor(h.key, a, b), … }); }) : 場面を組む({ … });
/* 着地：変化の一文（前回と違う温度のとき）・事後の型の一文・仕上げの絞り込み・気分・覚える */
if (h) { var chg = H.change(ctx, h, a, b), aft = H.after(ctx, h, 組, { spot: 場所 }); r.text = H.strip(r.text, h.key); …; H.move(ctx, h, a, b); H.note(ctx, h, a, b, { text: r.text }); H.remember(ctx, a, b, h.key); }
/* r18:end */
```

- セット B の 3 部屋は、共通の部品 `kit-r18.js` の `HK.PairR18.scene` がこの形で温度を読む（部屋の段の候補の絞り込み `H.trim`・前戯の段の数・長い場面の夜の色・事後の型・変化の一文）。部屋の r18 のファイルは何もしなくてよい。
- 部屋だけの新しい型の値は `HK.Play.addValue(部屋の id, 軸, { key, label, weight, text, mid, short })`（文は本体の `HK.PlayText` と同じ形、3 組 × 3 文以上）。温度を読む部屋は、同じ組の前の夜と同じ入り方・主な責めを選ばず、道具は一回の遊びに 2 回まで（`HK.Play.strict`）。
- 確かめ方：check.js が試しのフォルダで `heat-audit.js` を回す（温度の矛盾 0 件で合格）。

## 恋愛と夜の可否（2026-11-05）

恋愛と夜の可否は住人の設定（恋愛相手の固定・性行為の相手＝体の相手の固定・恋愛にしない相手 `loveNo`・R18にしない相手 `r18No`・R18に参加しない）だけで決める。関係の欄の `t.love`（恋愛：あり／なし）・`t.body`（恐怖の体の関係）は画面から外したので、パックでも `ctx.input.ties` の `love`・`body` を見ず、本体の関数を使う（決まりは `docs/reports/2026-10-31/rel-consistency.md` の「恋愛と夜の可否は住人の設定で」）。

- `HK.loveOK(a, b)`：恋愛してよい二人か（`HK.canLove` を両方向）
- `HK.bodyOK(a, b)`：体の関係を持ってよい二人か（R18にしない相手・R18に参加しない・性行為の相手の固定・受け攻めと恋愛対象 `HK.Pos.okSex`）
- `HK.bodyPick(a, b)`：どちらかが相手を体の相手に選んでいて、体の関係を持ってよい二人か（関係が進まない二人の「体だけ・関係はそのまま」の夜に。夜の起こりやすさ 100 なら必ず一度）
- `HK.FreeSex.kind(ctx, a, b)` が `'body'` なら体の相手の二人、`HK.FreeSex.lead(ctx, a, b)` がその導入の文（態度 9 種）

## キスの場面（HK.Kiss・2026-11-03）

キスの文は本体の共通部品 `HK.Kiss`（`js/kiss.js`。文の表は `js/kiss-text.js`・`js/kiss-text2.js` の `HK.KissText`）の型で組む。両方のビルドにある（R18版は本体のかたまり pack-lewd、全年齢版は pack-rel。どちらもパックの依存に入っていれば使える）。設計は `docs/reports/2026-11-03/kiss-design.md`。

- `HK.Kiss.scene(ctx, a, b, opt)`：キスだけの場面を記録に一件出す（`ctx.act2`。cat は romance、夜には数えない）。a・b はどちらが先でもよい（受け攻めは `HK.Pos.order` で決める）。戻り値 `{ e, plan, text }` か null。
  - `opt.trig`：きっかけ（`itte` いってらっしゃい・`okaeri` おかえり・`oyasumi` おやすみ・`neoki` 寝起き・`gochi` ごちそうさま・`fui` ふいに・`naka` 仲直り・`hobi` ご褒美・`karakai` からかい・`amayadori` 雨宿り・`amae` おねだり・`kinen` お祝い）
  - `opt.len`（`'s'`｜`'m'`｜`'l'`）・`opt.end`（`tere`・`again`・`nagori`・`hold`・`oazuke`・`promise`・`late`・`out`・`night`）を渡すと固定、省くと二人の態度・夜の性格・気分で選ぶ。`opt.place`（`genkan`・`kitchen`・`sofa`・`futon`・`soto`）は場所の決まっていないきっかけの頭に一文を置く
  - `opt.x`・`opt.y`：いってらっしゃい・おかえりの出かける人（帰った人）と見送る人。`opt.promise: true` で「続きは帰ってから」、`opt.night: true` で「そのまま夜へ」（R18 だけ）を候補にする
  - `opt.lead`・`opt.tail`：始まりの段を部屋の文（`{a}{b}` のまま）に替える・最後の段の後ろに文を足す（新婚部屋の最後の夜の幸せなキスで使用）
  - `opt.whyPre`（理由の欄の頭。既定は「キスだけの触れ合い：」）・`opt.fx`・`opt.tag`
- `HK.Kiss.text(ctx, a, b, opt)`：記録に出さずに本文だけ返す（`{ text, plan, why, label }`）。`HK.Kiss.trio(ctx, a, b, c)`（三人のキス）・`HK.Kiss.seen(ctx, a, b, c, 'warm'|'jeal')`（三人目 c に見られる）。
- 本体の共通の出来事のキス（kiss-events.js）は、id が `set-` で始まる箱庭には出ない。部屋でキスを出すときは、部屋のファイルから `HK.Kiss.scene` を呼び、出来事の印（`/* @event scen=<部屋の id> id=… label=… */`）を付ける。
- 例：新婚部屋は `js/shinkon-kiss.js`（shinkon.js を書き換えず、`HK.wrap` で区切りの関数 `phase`・`HK.Journal.add`・`HK.ShinkonR18.night` を包んで差し込む）。

## 記録のコメント欄 `e.ch`（2026-11-06・api 3）

カップル配信（set-b-haishin）の視聴者のコメントのように、本編と分けて読ませたい記録は、記録に欄 `e.ch` を付ける。結果の経過の見出しの横に「本編｜コメント欄（n件）」の切り替えが出て、本編には出ない（区切りの見出しはどちらにも出る）。件数（「経過 n件」）・重要な場面・関係の転機・エロシーンの数えには入らない。テキストの書き出しと PDF は本編のあとに「■ コメント欄」として区切りごとに並ぶ。設計は `docs/reports/2026-11-06/log-channel-design.md`。

```js
var e = ctx.say({ kind: 'phase', cat: 'phase', actors: [], text: '「＠＠こんばんは」\n「＠＠待ってた」', mag: 0, lewd: false });
if (e && !e.skipped) e.ch = 'cm';
```

- 一区切りのコメントは一件にまとめ、改行で並べる（件数を抑える）。`kind: 'phase'`・`actors: []`・`lewd: false` にする（恋愛・夜・状態の点検と数えから外れる）。
- コメントの台詞は話し手を住人にしない（頭に `＠` を付けた `「＠台詞」` はモブ、`「＠＠…」` は名詞の引用。どちらも口調の言い換えを通らない）。モブは住人の名前を呼ばない。
- 体の語の印（`{男性器}` など）は、画面の住人の体に合わせて選ぶ（点検 pos の V10 は記録の文をすべて見る。女性の配信者に `{男性器}` を求めるコメントを出さない）。R18 のコメントは `/* r18:begin */`〜`/* r18:end */` の中に書く。
- いまの欄の名前は `cm`（コメント欄）だけ。古い本体（api 2 以下）では開かない（`pack.json` の `api` を 3 にする）。

## 表情の鍵の印（2026-11-06・api 3）

台詞の一言ずつに表情の鍵が付く（画像はまだ持たない。結果の吹き出し・カードの台詞に `data-face="shy"` の差し込み口が付くだけで、見た目は変わらない）。鍵の決め方と一覧は `docs/reports/2026-11-06/face-design.md`。大事な台詞は、台詞の頭に印を書いて鍵を決める（表示では消える）：

```js
'{a}は目を逸らした。「＠{a}＠〈照れ〉もう、そういうこと聞かないで｜＝｜もう、そういうことは聞かないでください」'
'「〈驚き〉＠{b}＠え、今の、本当？｜＝｜え、今のは本当ですか？」'
```

- 印の語：〈通常〉〈驚き〉〈嬉しい〉〈悲しみ〉〈怒り〉〈照れ〉〈恐怖〉〈嫉妬〉〈恋人の笑顔〉〈家族の笑顔〉（R18版だけ 〈喘ぎ1〉〜〈喘ぎ4〉＝はじまり・高まり・山場・事後。全年齢では照れに落ちる）。
- 「＠名前＠」の前でも後ろでもよい。3 本の台詞は頭（1 本目の前）に一つだけ書く。表の語に無い〈…〉は印にならず、そのまま残る。
- 出来事の札（`e.tag`）・出来事の id・関係の節目から鍵を決めるときは `HK.Face.addTag('嫉妬の見せつけ', 'jealous')`（欄を決めるなら第 3 引数に `'tag'`・`'ev'`・`'mark'`。id は正規表現も可）。印の無い台詞は、出来事の種類 → 話し手のその時の気分 → 恋人・家族の前の笑顔 → 通常 の順で決まる。
- 喘ぎの段は本体の喘ぎ（`HK.Moan`・`HK.Ero.moan`）が決めるので、喘ぎに印を書かなくてよい。

## 場所 `chair`・共有の能力値（2026-11-06）

- 長い場面の場所（`opt.spot`。R18版の `HK.SexSpot`）に `chair`（配信用の椅子：カメラの前の椅子に座った・座らせた形。机の語は通し、寝具の語・寝そべる体位を外す。体位は座位・騎乗位（対面座位）・後ろから）を足した。無い本体のために `HK.SexSpot && HK.SexSpot.KIND.chair ? 'chair' : 'sofa'` で渡す。
- 住人の設定と共有する能力値（体力・運・魅力・色気など。`HK.Shared.GROUPS` の項目）を部屋の能力値の欄に写すときは、登録のあとで `HK.Shared && HK.Shared.addMap && HK.Shared.addMap('charm', 'set-b-haishin', 'charm')`（項目・箱庭の id・`scen.stats` の欄の id。既にある項目だけ。無い本体では部屋の中だけの値として動く）。

## グラフの部品 `HK.Chart.line`（2026-11-06）

結果の結末のカードに折れ線を出すときは、本体の `HK.Chart.line(series, opt)`（`js/chart.js`。かたまり pack-sim で、どのパックからも使える）で SVG の文字列を作り、`HK.Endings[箱庭の id]` の戻り値の `after` に入れる（`after` は結末のカードの最後にそのまま入る。テキストの書き出し・共有の札には出ないので、数字は `lines`・`stats` にも書く）。

```js
if (HK.Endings) HK.Endings['set-b-haishin'] = function (res, X) {
  var S = (res.end && res.end.haishin && res.end.haishin.series) || [];
  var svg = HK.Chart && HK.Chart.line ? HK.Chart.line([
    { name: '同時接続', values: S.map(function (x) { return x.v; }) },
    { name: 'スパチャの累計', values: S.map(function (x) { return x.sum; }), unit: '円' }
  ], { labels: S.map(function (x) { return x.t; }), aria: '配信の推移', h: 120 }) : '';
  return { headline: res.outcome || '', stats: [['最高同接', '…']], lines: ['…'], after: svg };
};
```

- `series`：2 本まで（`{ name, values, max, unit, col }`。2 本目は右の目盛り・点線）。`values` に null を入れるとその点を飛ばす。
- `opt`：`w`（既定 320）・`h`（既定 110）・`max`（左の目盛りの上限。省くと値から）・`labels`（横の目盛りの文字。多ければ間引く）・`cols`（線の色。CSS の変数名 `'--accent'` など）・`aria`（読み上げの名前）・`caption`（図の下の一行）。色は CSS の変数なのでダークの見た目にも合う。

## 出来事の一覧（2026-11-03）

パックの箱庭も、本体と同じく箱庭カードの「出来事の一覧」に出る（コードで開けたときだけ。一覧はパックの中身に暗号化して入り、ボタンを押したときだけ読む）。印は本体と同じ：

- 出来事のオブジェクト：`label: '内容の分かる 8〜25 字の日本語'`（必ず）、関係が条件なら `tie: 'lover'`（問わないなら `'-'`）、拾えない内容は `tags: ['night', 'mob', 'force', …]`。
- 関数で書いた場面：場面の近くに 1 行 `/* @event scen=set-b-shinkon id=sk_night_kiss cat=romance tie=- tags=night label=寝る前のキスから始まる夜 */`。scen はパックの箱庭の id、id は英字の重ならない名前、label は表示名（台詞「…」・英字を入れない）。
- 表：`/* @event-table scen=<箱庭の id> path=<HK. から先の表の場所> label=… */`（`rows=1` で行ごとに一覧へ）。工場で作る出来事の表示名は `/* @labels` の下に 1 行ずつ `id=表示名` `*/`。
- R18 の場面（`tags=night` など）の印は `/* r18:begin */`〜`/* r18:end */` の中に書く（全年齢版では落ちる）。エッチの入口の数は、この夜の印の数で数える。
- かたまりの名前 `catalog` は使えない（一覧のかたまり `pk-<枠>-catalog` に使う）。

足したら：`node hakoniwa-tools/build/event-catalog.js --pack=hakoniwa-packs/<パック>`（コード無しで一覧だけ。build-pack.js でも書き直る）で `docs/reports/2026-11-03/pack-event-catalog.md` を作り直し、`node hakoniwa-tools/build/catalog-check.js` を 0 件にして（表示名の無い出来事・印の無い出来事・一覧が古い）、md の差分に足した出来事が入っているのを確かめ、同じコミットに入れる。`HK.Packs.API` は上げていない（一覧のかたまりは古い本体では読まれないだけ）。

## 作る

本体を build したあとで：

```
node hakoniwa-tools/build/build-pack.js hakoniwa-packs/set-a
node hakoniwa-tools/build/build-pack.js hakoniwa-packs/set-a --dist          # 配布用の zip も dist/ に
node hakoniwa-tools/build/build-pack.js hakoniwa-packs/_sample --out=<試しのフォルダ> --codes=<試しのコード>   # 見本
```

書き出し：`hakoniwa-full/packs/set-a/pack.js`（と全年齢版）、`packs/index.js`（サイト公開版用の枠の一覧）。

## コード

`codes.local.json`：

```json
{ "set-a": ["セットAのコード"], "set-b": ["…"], "*": ["まとめ用のコード"] }
```

- `"*"` のコードは全部のパックに入る（1回入れると全部のセットが開く）。
- コードは空白・- を除いて大文字にしたとき6文字以上。入力では全角・小文字・- の有無を問わない。
- コードは変えずに使い続け、漏れなどの問題が起きたときだけ差し替えて、パックを作り直す（2026-10-31 の決定）。
