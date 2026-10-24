# 箱庭シミュレーター：作業の決まり

- `hakoniwa-full`（R18版）と `hakoniwa-zenrei`（全年齢版）の2つのビルドがある。両方にある同名ファイルを変えたら、もう片方にも同じ変更を入れる（R18専用のファイルは full だけ）。
- **更新履歴を必ず更新する**：機能・文の追加や修正をコミットするときは、`docs/CHANGELOG.md` のいちばん上の日付の節（なければ今日の日付で新しく作る）に、利用者向けの言葉で箇条書きを足す。全体／箱庭ごと、R18は「アップデート（R18）」に分けて書く。
- R18の文の基準（`docs/reports/2026-10-23/spec-and-r18.md` の 2-6）：地の文は1分岐3文以上、男×女・女×女・女攻め×男の3組すべてに専用文、山場と喘ぎは態度9種で書き分け、男性向け作風は山場1種につき2文以上、1文だけで固定の段を作らない。
- 登場人物はすべて成人として扱う。攻めを選んだ人は受ける側にしない。
- **スクリプトの読み込みはまとめて配る**：読み込み順は各ビルドの `js/_order.txt`（`late ` を付けた行は画面が出たあとで読む）。js を足したり変えたりしたら、両方のビルドで `node hakoniwa-tools/build/build.js hakoniwa-full`（と `hakoniwa-zenrei`）を実行して `js/bundle-main.js`・`js/bundle-late.js` と index.html を作り直してからコミットする（`?v=` は自動で付く。index.html の scripts:begin〜end は手で直さない）。
- 読み込み順を変えた（late を付け外しした）ときは、`hakoniwa-tools/build/regress.js` で変える前と結果の指紋が一致することを確かめる（r18・safe・全年齢版）。
- 変更後は `hakoniwa-tools/tone-check` の collect.js（R18版は `r18`）と pos-audit.js で全箱庭がエラーなく回ることを確かめる。
- **恋愛対象・受け攻めの間違いは利用者がとても気にするので、毎回念入りに確かめる**：恋愛・夜・R18・関係に触れる変更をしたら、`orient-audit.js`（恋愛対象の性別に合わない相手と恋人・夜・体の関係になっていないか。R18版 `r18`・全年齢モード `safe`・全年齢版）と `pos-audit.js`（受け攻め。`--hot`・`--ff --hot` も）を回し、0件であることを確かめる。体の関係の組は `HK.Pos.okSex`（恋愛対象と受け攻めの両方を見る）、恋愛は `HK.canLove` を両方向で通す。
- 文の閲覧・試し読み・編集・点検の画面は `hakoniwa-tools/text-studio`（`node hakoniwa-tools/text-studio/server.js`）。画面からの依頼は `hakoniwa-tools/text-studio/ai-requests.md` に `- [ ]` でたまるので、「依頼を片付けて」と言われたら上から順に直して `[x]` にする。
