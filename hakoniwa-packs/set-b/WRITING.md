# 新婚部屋の文の書き方（担当向け）

設計は `docs/reports/2026-11-03/shinkon-design.md`。表のデータは `js/shinkon-data.js`（`HK.ShinkonData`）と `js/shinkon-r18-data.js`（`HK.ShinkonR18Data`）。
表の行は「何が起きたか」の種として内部で引くだけで、画面には出ない（2026-11-03 の作り直し）。担当が書くのは、その行を**一つの場面にした地の文**。
家事・料理をする文は、家事をしない設定の人が主語になると使われない（shinkon.js の choreOk）。台詞の話し手は kit-text.js（HK.PairKit。もとの shinkon-kit.js）が目印を付けるが、決めにくい文には「＠{a}＠」を直に書く。

## 1. 書式

- 表の行ごとに、同じ並び（番号）の配列に文を入れる：`T.DAILY = [ [文, 文], [文, 文], … ]`（`T.DAILY[i]` が `HK.ShinkonData.DAILY[i]` の地の文）。
- 1 行につき **2 本以上**（違う運び方で）。1 本は **2〜4 文**（短い場面の段落。長くしすぎない）。
- 名前は `{a}`・`{b}`（下の表のとおりの役）。ほかに使える印は各キーの欄に書いたものだけ。
- 台詞は **3 本のベース**：`「くだけた常体｜硬い常体｜敬語」`（同じでよいところは `＝`）。一人称は「私」、二人称は「あなた」（口調の辞書が話し手ごとに言い換える）。
  台詞の前に話し手が分かるように書く（「{a}は笑った。「…」」）。話し手が紛らわしいときは `「＠{a}＠…」`。
- 地の文は「{a}は〜した。」の過去形・三人称。性別の決めつけの語（彼・彼女・夫・妻・旦那）は使わず、名前で書く。
- 二人は**結婚したばかりの成人**。一緒に暮らしている（出張の日などは離れている）。
- 表の行の言葉をなぞるだけにしない。その行の出来事が起きた場面（何をして、どう感じたか）を書く。
- 表の行が「願望ptが高い方が〜」のように役を決めているときは、下の表の {a}／{b} の役どおりに書く。

## 2. ファイルと書く場所（担当ごとに 1 ファイル。ほかのファイルは触らない）

ファイルの形（中身を足すだけ）：

```js
/* 新婚部屋の地の文（a。…） */
(function () {
  'use strict';
  var HK = window.HK;
  var T = HK.ShinkonText = HK.ShinkonText || {};
  T.DAILY = [
    ['{a}は…。{b}は…。', '…'],
    …
  ];
})();
```

R18 のファイル（`shinkon-r18-text-*.js`）は、ファイルの先頭の行に `/* r18:begin */`、最後の行に `/* r18:end */`（今の形のまま）。中は `var T = HK.ShinkonR18Text = HK.ShinkonR18Text || {};`。

| ファイル | キー | {a} | {b} | ほかの印 |
| --- | --- | --- | --- | --- |
| shinkon-text-a.js | `SETUP`（配列。6 本以上） | 一人目 | 二人目 | `{home}` 住まい・`{rel}` なれそめ（短い名前）・`{meet}` 出会いの場所 |
| 〃 | `INTRO`（10） | その朝、気持ちが動く人（ムラムラしている・夢を見た・相手の香りに気づいた人） | 相手 | |
| 〃 | `DAILY`（52） | 主役（願望ptが高い方）。「どちらかが忙しい」「連絡がうまく取れない」は待つ側 | 相手。「忙しい」「連絡」は忙しい・離れている側、「体調が悪い」は体調の悪い人 | `{item}` キーアイテム（無い日は空。使うなら「{item}」を入れても入れなくても読める文に） |
| 〃 | `FIGHT`（10）・`MAKEUP`（配列）・`KISS`（10）・`HUG`（配列）・`DIST`（`{ mend, rough, apart, close, calm }` の配列） | FIGHT：言い出した側／MAKEUP：謝る側／KISS・HUG：二人 | 相手 | |
| shinkon-text-b.js | `DATE`（52。休日のデート）・`PONKOTSU`（52）・`END`（52） | DATE：主役／PONKOTSU：見守る側／END：一日の終わりに思う人 | DATE：相手／PONKOTSU：家事が苦手でやらかす側／END：相手 | |
| shinkon-text-c.js | `ACT`（10 個の配列。`ACT[願望][行動]`、行動 10 ずつ） | 願望を持つ人 | 相手 | |
| 〃 | `WISH4`（行動の表 10 行。`[{ t: '…' }, …]`）と `ACT[3]`（WISH4 の行に合わせた文） | 〃 | 〃 | 願望4「もっと気持ちを言葉にしてほしい・したい」の行動の表は、もとの表が願望3の写しだったので新しく 10 行作る |
| 〃 | `BREAKFAST`・`LUNCH`・`DINNER`（各 52。1 本以上でよい） | ご飯を作る・用意する人 | 相手 | `{food}` 食材表の食材（文に入れる） |
| shinkon-sick.js | `MORN`・`NIGHT`・`WORK`・`REST`・`REACT[看病を受ける人の態度9種]`・`WELL`・`DULL`（体調を崩した人の状態のあいだ・治った朝）／`APART`・`APART2`（出張で離れて迎える朝） | 看る人／APART は家にいる人 | 体調の悪い人・治った人／APART は出張中の人 | 体調の悪い人が出かける・家事をする・元気に動く文は書かない |
| shinkon-r18-text-a.js（R18） | `LEWD`（52。ちょっとえっちな日替わり：その夜の始まりの段） | 攻め | 受け | |
| 〃 | `TRIGGER`（52。きっかけの段＝なぜ今エッチになったか） | 攻め | 受け | |
| 〃 | `WITNESS`（配列 1 つ：`[ [文, …] ]`。自慰の目撃のきっかけ。8 本以上） | ― | ― | `{s}` ひとりでしていた人・`{w}` 見た人（受け攻めに関係なく） |
| 〃 | `AFTER`（10。事後の反応） | 攻め | 受け（反応する側） | |
| shinkon-r18-text-b.js（R18） | `PLAY`（52。形ごと：`{ mf: [文, 文], ff: [文, 文], fm: [文, 文] }`） | 攻め | 受け | |
| 〃 | `BOTTOM`（52。受けの反応。形ごとか配列） | 攻め | 受け（反応する側） | |
| 〃 | `TOP`（52。攻めの反応。形ごとか配列） | 攻め（反応する側） | 受け | |

| shinkon-r18-ini-text.js（R18） | `LEAD[sasoi/osoi/nedari][受けの態度9種]`・`ANS[攻めの態度9種]`（受けのほうから誘う夜のきっかけ） | 攻め | 受け（誘う人） | 体の組を問わない書き方。osoi は押し倒さない |
| shinkon-r18-knock-text.js（R18） | `OPEN`・`BELL`・`RESP`・`SAY`・`STIFLE`・`RESUME`・`STOP_END`（最中に来客・電話） | 攻め | 受け | `{x}` 応対する人・`{y}` もう一人・`{who}` 来た人の名詞句（台詞を書かない） |

- 離れていた日数・忙しい日の続きを前提にする語（数日ぶり・久しぶりに帰ってきた・ずっと会えなかった・出張から帰った{a}・残業続き・遅い夜が続いていた・久しぶりの休み）は、shinkon.js の `awayOk` が実際の日数で絞る。新しく書くときもこの言い回しを使うか、日数を前提にしない書き方にする（2026-11-03）。

## 3. R18 の文の決まり

- 形：**mf**＝{a} が男性（{b} の性別は問わない書き方）／**ff**＝女性どうし（指・舌・玩具。挿入の語を使わない）／**fm**＝{a} が女性・{b} が男性（{a} が跨る・主導する。女性に「押し入る・注ぎ込む」は書かない）。
- 体の語は**印**で書く：`{男性器}` `{女性器}` `{ナカ}` `{胸}` `{乳首}` `{精液}` `{尻}` など（一覧は `docs/reports/2026-10-26/lewd-words.md`）。
- 合意のある新婚の二人。暴力・合意のない展開・妊娠の描写は書かない。表の行に拘束・SM・首を絞める などがあれば、合意の上の軽い遊びとして書く（首は軽く手を添える程度で、すぐ緩める）。
- **攻めと受けを入れ替えない**（表の「主導権逆転」「能動が逆転」は、受けが積極的に求める・上に乗って甘える、までにする。{a} を受ける側に書かない）。
- PLAY は 3〜5 文の短い場面（きっかけ・事後は別の段が付く）。中くらいの場面では、共通の山場（喘ぎ・絶頂は態度ごと）が後ろに付くので、PLAY に絶頂の決着まで書かなくてよい。
- 表の言葉に体位・場所があればその通りに。玄関・車内など家の外に近い場所は、人に見られない書き方に。

## 4. 確かめ方（担当が自分で回す）

```
node hakoniwa-tools/build/pack-site.js hakoniwa-packs/set-b --out=<試しのフォルダ> --codes=<試しのコード>
```

- 組み立てが通ること（全年齢版のパックに性的な語が残ると止まる。両方のビルドに出るファイルに性的な語を書かない）。
- `node -e` で構文を確かめ、配列の数（52・10）が表と合うことを確かめる。
- できあがりの見本：`<試しのフォルダ>` の hakoniwa-full を開いてコードを入れ、新婚部屋を回して読む（まとめ役が回し方の道具を持っている）。
- 点検（audit-all・tone-feel・relcons・base-lint）はまとめ役がまとめて回す。

# 看病の部屋の文の書き方（担当向け。2026-11-03）

設計は `docs/reports/2026-11-03/kanbyo-design.md`。文は `js/kanbyo-text-a.js`・`kanbyo-text-b.js`・`kanbyo-text-c.js`（`HK.KanbyoText`）と、R18 は `js/kanbyo-r18-text.js`（`HK.KanbyoR18Text`。ファイル全体を r18 の印で挟む）。

- 役：ことわりの無い表は `{a}`＝看病する人、`{b}`＝看病される人（体調を崩した人）。看病し返す表（KAESHI・KMORN・KCARE・KNIGHT・KHEAL）は `{a}`＝看病し返す人、`{b}`＝うつって寝込んだ人。DATE・REI は `{a}`＝お礼をする人。CONFESS は `{a}`＝想いを告げる人。R18 の LEAD・FEEL・FANS は `{a}`＝言い出す人、PLAY・BOTTOM・TOP・OPEN は `{a}`＝攻め。
- 関係ごとの表は `{ 関係: [...], まとめ: [...], all: [...] }`。関係の鍵：spouse・lover・fam・pfam・ex・almost・crush（crushA＝看病する人が想う側／crushB）・bad・mentor（mentorA＝看病する人が師）・senpai（senpaiA＝看病する人が先輩）・work・childhood・friend・school・weak・none。まとめ：love・pine・close・work・fam・awk。関係の文を先に使い、使い切ったら all。
- 使える印：`{temp}`（その日の熱）、`{rel}`（関係の名前）、見舞いの表は `{g}`（来た人）・`{h}`（来た人と関係のある人）・`{gl}`（`{h}` から見た呼び名）。
- 一回の遊びで同じ文は二度出ないので、出番の多い表（看病の種・朝・夜・来る／帰る）は多めに書く（1 行の種につき 2 本以上、1 本 2〜4 文）。
- 恋愛の語（好き・甘え・抱き・キス・寄り添 など＝`HK.PairKit.ROM`）は、恋愛にならない二人では外れる。家族・不仲・同僚の表には書かない。「恋人」「付き合っている」は恋人どうしでない二人では外れる（「元恋人」は可）。結婚の語は夫婦の表だけ。
- 看病される人が出かける・家事をする・元気に動く文は、治った日より前の表に書かない。料理・家事の文の主語は看病する人（料理をしない設定の人には出ない）。
- 台詞は 3 本「くだけた常体｜硬い常体｜敬語」（一人称「私」・二人称「あなた」、敬語のベースに尊敬語・謙譲語を書かない）。名前が 2 人以上出る文は話し手の目印が自動で付くが、決めにくい文は `「＠{a}＠…」` を直に書く。
- R18：病み上がりの相手を気づかう合意の上の場面だけ。形 mf／ff／fm を書き分け、体の語は印、攻めを選んだ人を受けにしない。地の文は 3 文以上。
- 足したら：`node hakoniwa-tools/tone-check/base-lint.js hakoniwa-packs/set-b`、tone-feel（`--scen=set-b-kanbyo`。崩れは `kanbyo-tone.js` に書き下ろし）、出来事を足したら `kanbyo.js`／`kanbyo-r18.js` の `@event` と出来事の一覧。
- 目標（短期・長期）と結末の判定の一文は `js/kanbyo-text-e.js`（GOAL_S・GOAL_SR・GOAL_L・GOAL_LR・GOAL_RES・GOAL_LRES。目標の文は結末の段の中で「＠＠{goal}」の名詞の引用にする）。
- 追加の表（`js/kanbyo-text-d.js`）：家事で変わる出来事（CHORE_*・NOCHORE）、同居していない日（ALONE・ALONE_N・TEL・WEAK_TEL・ARRIVE_APART・LEAVE_APART・STAY_APART）、仲の悪い二人（FEUD_*・WEAK_ANS_FEUD・関係 rival・lovehate の導入）、病中の夜の翌朝（ILL_AFTER）。
  R18 の病中の夜は `kanbyo-r18-text.js` の ILL_*（理性が揺らぐ入口は、受けの「でも……」の段 ILL_HESIT を必ず書く）。
- 看病の部屋でしか出ない長い場面は `kanbyo-r18-text.js` の LONG_LEAD・LONG_OPEN（{ mf, ff, fm } × 2 本、2 段落）・LONG_AFTER。中盤と山場は本体の長い場面の部品が組み立てる。

# 新婚部屋の追加の文（2026-11-03。設計は `docs/reports/2026-11-03/shinkon-design.md` の 6）

| ファイル | キー | {a} | {b} | ほかの印・決まり |
| --- | --- | --- | --- | --- |
| shinkon-cal-text.js | `EV[行事の id]`（月の行事 31 種 × 2 本） | 言い出す人 | 相手 | 季節の語は shinkon-cal.js の `CL.SEA` の月にだけ出る。行事を足したら `CL.EV` の表と `@event` も |
| 〃 | `VDAY.give[hand/shop/fail/surp]`・`VDAY.both`・`VDAY.prep`・`VDAY.thanks`（恋愛にならない二人）・`WDAY.ret[…]`・`WDAY.both/nogot/none/thanks` | 贈る人・お返しをする人 | 受け取る人 | 手作り（hand・fail）の文の主語は料理をする人だけに出る。性別で贈る側を決めつけない |
| 〃 | `BDAY.morn/prep/party[cook/buy/out]/gift`（`{gift}`＝贈り物）・`GIFT[態度9種]`（受け取った人の反応） | 祝う人（GIFT は受け取った人） | 誕生日の人（GIFT は贈った人） | 「誕生日」の語は誕生日の日だけに出る |
| 〃 | `VDAY.trio3`・`WDAY.trio3`・`BDAY.trio3`（三人婚の三人目） | 二人 | 二人 | `{c}`＝三人目 |
| shinkon-past-text.js | `PAST[関係][yobi/yaku/chijin/kenka]`（12 関係 × 4 種 × 2 本） | 先輩・師匠・面倒を見てきた側・想っていた側（向きのある関係）か、どちらか | 相手 | 元の関係のまま暮らす二人（結婚していない友人どうしなど）にも出るので、「〜だったころ」に決めつけない書き方を混ぜる。`HK.relFilter` の語（初対面・連絡先・家まで送る・馴れ初め・付き合うことになった など）は書かない |
| 〃 | `EXNARR[関係]`・`EXSAY[態度9種]`・`EXANS[態度9種]`・`FEAR[calm/still][態度9種]`・`FEARANS[calm/still]`・`EXEV[関係][種]` | EXSAY は言い出す人、EXANS は返事をする人、恐怖は怖がっていた人、主従は主 | 相手 | `{was}`（ライバルだった など）は地の文に書く（台詞に入れると口調の書き下ろしが当たらない）。台詞は「まさか私たちが結婚するなんて……」の形を入れる |
| 〃 | `NFSETUP`・`NFSAY[態度9種]`・`NFANS[態度9種]`（恐怖の関係のままの二人の始まりと「今は少し慣れてきた……多分」）・`RELAPSE[種]`・`RX`／`RXODD[態度9種]`・`RY.kyori`／`RY.fureru[態度9種]`（恐怖のぶり返し）・`FEAREND[calm/some/still]`（最後の夜の恐怖のゆくえ） | 怖がっていた人（NFANS・RY は返事をする相手） | 相手（NFANS・RY は怖がっていた人） | 恐怖の関係のままの二人にも出るので、恋愛・結婚の語（`HK.PairKit.ROM`・`WED`）を書かない（寄り添う文などは恋愛にしてよい二人だけに出る）。NFSAY は「…慣れてきた」と言ってから「……多分」と付け足す形（台詞の文末に口調が付くように）。RELAPSE の種を足したら shinkon-past.js の `FK`（日中 d／夜 n）と `FKN` も |
| shinkon-wed.js | `W.T[出来事の id]`（13 種 × 2 本） | 言い出す人（エプロンは待っていた人） | 相手 | 出来事を足したら `W.EV` の表（part・wed・love）と `@event` も |
| shinkon-trio.js | `TR.T.SETUP/MORN/DAY[種]/DATE[種]/HELP/SEE[態度9種]/NIGHT/KISS` | 三人のうち一人 | 二人目 | `{c}`＝三人目（`TR.say` が名前を当てる）。HELP・SEE は {c}＝三人目、{a}{b}＝二人 |
| shinkon-r18-special.js（R18） | `APRON`・`PILLOW.show/yes/no/noReact[態度9種]`・`LEAD[入口]`・`PLAY[入口][mf/ff/fm]`・`OPEN[入口]` | APRON・PILLOW は言い出す人、PLAY・OPEN は攻め | 相手（PLAY・OPEN は受け） | LEAD は `{x}`＝言い出した人・`{y}`＝相手（受け攻めに関係なく。立場を入れ替える言い回しは書かない）。PLAY・OPEN の `{x}`＝エプロンの人・贈った人、`{y}`＝誕生日の人。地の文 3 文以上、体の語は印 |
| shinkon-r18-trio.js（R18） | `LEAD`・`FADE`・`MID[oneTwo/twoOne/sandwich/ring]`・`PEAK`・`AFTER` | LEAD・FADE・AFTER は {a}{b}{c} | | MID は `{t}`＝攻め・`{m}`＝真ん中・`{u}`＝受け。直接の行為は `HK.Pos.trioPlan` の組だけ（本体の `HK.Trio3` が組み立てる） |

- 足したら：`node hakoniwa-tools/tone-check/base-lint.js hakoniwa-packs/set-b`、tone-feel（`--scen=set-b-shinkon`。元○○の台詞は `--tie=rival`・`--tie=fear` などでも見る。恐怖の二人の、怖がられていた側の台詞は `--tie=fear` では話し手にならないので、話し手と相手を入れ替えた回でも見る。崩れは `shinkon-tone.js` に書き下ろし）、`node hakoniwa-tools/build/event-catalog.js --pack=hakoniwa-packs/set-b` と catalog-check。
