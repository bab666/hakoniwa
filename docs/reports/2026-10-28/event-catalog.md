# 出来事の一覧（箱庭ごと・関係ごと・R18 の夜）

このファイルは `hakoniwa-tools/build/event-catalog.js` が build のたびに書き直します（各ビルドの節は `<!-- catalog:<ビルド>:begin -->`〜`end` の間だけ。冒頭の決まりは手で直してよい）。画面では、箱庭カードの「この箱庭のTIPS」の隣の「出来事の一覧」から同じ表が見られます。

## 新しい出来事を足すときの決まり

- 出来事は build のたびに自動で数え直されます（`node hakoniwa-tools/build/build.js <ビルド>` の中で `js/event-catalog.js` とこのファイルを作り直す）。手で追記しません。
- 関係が条件の出来事は、`when` に `HK.Ties.has(ctx, a, b, 'master')` のように関係の鍵をそのまま書けば拾われます。補助の関数（`is(k)`・`o.roles(…)` など）で隠れるときは、出来事に `tie: 'master'`（複数なら `'lover,fwb'` か配列。関係を問わないと明示するなら `'-'`）を付けます。
- 夜・モブ・内容のスイッチ・死ネタ・残酷は、`sex: true`／`r18: true`・`HK.Content.ok(ctx, 'force')`・`HK.Dark.f(ctx, 'kill')`・`ctx.kill(…)` から拾います。拾えない書き方なら `tags: ['night', 'mob', 'force', 'preg', 'violence', 'abuse', 'death', 'cruel']` から当てはまるものを付けます（文や動きは変えない）。
- 表示名は `label` が無ければ、run の最初の文の先頭 30 字です。分かりにくければ `label: '…'` を付けます。
- 物語型の箱庭（場面を関数で書くもの）は、場面の近くに 1 行のコメントを書くと数えられます：`/* @event scen=jashin id=jn_god_night cat=夜 tie=- tags=night,mob,force label=神に捧げられる夜 */`。表（配列・オブジェクト）は `/* @event-table scen=jashin path=JASHIN.DUO_EV label=二人の場面 */`（`pair=1` は職業×職業の表として数だけ、`rows=1` は行ごとに一覧へ）。
- R18 の場面の印は、R18専用のファイルか `/* r18:begin */`〜`/* r18:end */` の中に書きます（全年齢版のビルドでは読まれません）。
- 足したら build を回し、`js/event-catalog.js` の差分（その出来事が入ったか）を確かめてコミットします。

## 数え方と限界

- 数は仕組みが数えた「出来事の種類」の数で、文の本数ではありません。同じ出来事が複数の箱庭に出るときは、箱庭ごとに数えます。
- エンジン型の箱庭は、その箱庭の出来事の山（`HK.buildPool`）とハプニング（`HK.INCIDENTS`）。物語型の箱庭は、印の付いた場面と表だけです（手書きの場面は入らない）。
- 関係の判定は文字列からの推定です（分類の方法の記号を見てください）。「関係を問わない」には、関係の条件が補助の関数に隠れていて拾えなかったものも入ります。
- 邪神村・吹雪の館・オメガバースの職業の掛け合わせ（職業×職業の表）は、組の数だけを出します。

<!-- catalog:full:begin -->
## R18版（hakoniwa-full）

箱庭 19 個・出来事 1324 件（同じ出来事が複数の箱庭に出るときは1件）。分類の方法：a 印／b 条件の文字列／d 定義の文字列／c id／- 拾えない（関係を問わない）。

| 箱庭 | 型 | 出来事 | 関係が条件 | 関係を問わない | 夜（R18） | うちモブ | 合意のない展開 | 妊娠 | 暴力をともなう性描写 | 歪んだ関係（DV など） | 死ネタ | 残酷な展開 | 表（数だけ） |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 合コン | エンジン型 | 302 | 124 | 178 | 13 | 0 | 6（条件つき） | 2（条件つき） | 2（条件つき） | 2（条件つき） | なし | 3 | - |
| 出られない部屋 | エンジン型 | 379 | 147 | 232 | 23 | 0 | 6（条件つき） | 2（条件つき） | 2（条件つき） | 2（条件つき） | 1 | 6 | - |
| クラスメイト | エンジン型 | 304 | 118 | 186 | 5 | 0 | 2（条件つき） | なし | なし | 1（条件つき） | なし | 2 | - |
| 無人島 | エンジン型 | 379 | 145 | 234 | 12 | 0 | 5（条件つき） | 2（条件つき） | 1（条件つき） | 2（条件つき） | 2 | 2 | - |
| 宇宙船漂流記 | 物語型 | 26 | 14 | 12 | 5 | 2 | 2（条件つき） | なし | なし | なし | 5 | 3 | 星の資源 30件、星の生命体 37件、星の文明 30件、船のトラブル 12件、宇宙での遭遇 14件、船を滅ぼすトラブル 6件 |
| ゾンビの街 | エンジン型 | 278 | 148 | 130 | 19 | 3 | 9（条件つき） | 2（条件つき） | 2（条件つき） | 2（条件つき） | 7 | 8 | - |
| 邪神村RTA | 物語型 | 46 | 21 | 25 | 13 | 9 | 9（条件つき） | 10（条件つき） | なし | なし | 10 | 6 | 神（手がかり・対抗策） 51件、職業の出来事 21件、職業×職業の出来事 14組、役職×役職の特別な出来事（協力・因縁） 200組、祠の効果 7件 |
| 吹雪の館の殺人 | 物語型 | 49 | 25 | 24 | 7 | 1 | 4（条件つき） | なし | 1（条件つき） | なし | 5 | 6 | 犯人の動機 21件、職業×職業の出来事 14組 |
| オメガバース | エンジン型 | 257 | 158 | 99 | 18 | 1 | 7（条件つき） | 2（条件つき） | 2（条件つき） | 2（条件つき） | なし | 4 | 職業×職業の出来事 38組 |
| エロトラップダンジョン | 物語型 | 6 | 3 | 3 | 3 | 2 | 1 | なし | なし | なし | なし | 1 | 罠・魔物・宝箱 144件、最深部の主 15件 |
| これって本当にマッサージですか？ | 物語型 | 14 | 11 | 3 | 3 | 2 | 2 | なし | なし | なし | なし | 2 | 施術中のハプニング 10件 |
| 感覚遮断穴 | 物語型 | 3 | 1 | 2 | 3 | 2 | 2 | なし | なし | なし | なし | なし | - |
| ダンジョンRPG | 物語型 | 19 | 14 | 5 | 0 | 0 | なし | なし | なし | なし | 4 | 3 | - |
| 常識改変 | 物語型 | 3 | 2 | 1 | 1 | 1 | 1 | なし | なし | なし | なし | なし | 営業中のハプニング 16件、改変された職場 6件 |
| サキュバスの一夜 | 物語型 | 6 | 2 | 4 | 4 | 2 | 2 | なし | なし | なし | なし | なし | 夜の街のハプニング 16件、獲物（モブ） 54件 |
| 催眠 | 物語型 | 21 | 18 | 3 | 2 | 0 | 1（条件つき） | 1（条件つき） | なし | 1（条件つき） | なし | 2 | 催眠中のハプニング 15件、暗示 37件 |
| エロバラエティ番組 | 物語型 | 5 | 3 | 2 | 2 | 0 | 2 | なし | なし | なし | なし | なし | 企画 61件、収録中のハプニング 16件、出演者ごとの出来事 11件 |
| 媚薬ロッカー | 物語型 | 26 | 16 | 10 | 7 | 2 | 1（条件つき） | なし | なし | なし | なし | 4 | 仕掛け 6件 |
| 人狼 | 物語型 | 19 | 16 | 3 | 2 | 0 | 1（条件つき） | なし | なし | なし | 1 | 3 | 罰ゲーム 11件 |

※ は、内容のスイッチの表示側（content-events-r18.js の HK.Content.judge の表）の見込みと、数えた出来事が食い違うもの（表示側は「なし」なのに出来事がある、または表示側は「ある」なのに印の付いた出来事が見つからない）。

### 合コン（goukon）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 同僚 | 2 | tie_colleague〔c〕、tie_colleague2〔b〕 |
| 先輩後輩 | 1 | tie_senpai〔c〕 |
| バディ | 1 | tie_buddy〔c〕 |
| 同級生 | 1 | tie_classmate〔c〕 |
| 兄弟（不仲） | 6 | rb_goukon_sbSpat〔c〕、rb_goukon_sbCompare〔c〕、rb_goukon_sbGrudge〔c〕、rb_goukon_sbDefend〔c〕 ほか |
| 親族 | 1 | tie_relative〔c〕 |
| 上司と部下 | 1 | tie_boss〔c〕 |
| 恩人 | 4 | tie_benefactor〔c〕、tie_nw_gu_refuse〔c〕、tie_nw_gu_obey〔c〕、tie_nw_gu_guilt〔c〕 |
| 片想い | 15 | u_serve〔c〕、u_tri〔c〕、u_protect〔c〕、u_confess〔c〕 ほか |
| 執着（ヤンデレ） | 14 | tie_nw_dep_search〔c〕、tie_nw_dep_check〔c〕、tie_nw_dep_cling〔c〕、tie_nw_dep_worry〔c〕 ほか |
| 執着（信仰） | 1 | tie_worship〔c〕 |
| 一方的な好意・敬愛 | 5 | tie_nw_os_cheer〔c〕、tie_nw_os_gift〔c〕、tie_nw_os_watch〔c〕、tie_nw_os_freeze〔c〕 ほか |
| 盲信 | 2 | tie_nw_blind〔c〕、tie_blind〔c〕 |
| 不仲 | 7 | rb_goukon_bdClash〔c〕、rb_goukon_bdSnark〔c〕、rb_goukon_bdForced〔c〕、rb_goukon_bdCredit〔c〕 ほか |
| ライバル | 1 | ct_violence_hook〔a〕 |
| 敵対 | 8 | tie_nw_hate_demean〔c〕、tie_nw_hate_trap〔c〕、tie_nw_hate_isolate〔c〕、tie_nw_hate_harm〔c〕 ほか |
| 無関心 | 3 | tie_nw_ap_talk〔c〕、tie_nw_ap_gift〔c〕、tie_nw_ap_other〔c〕 |
| 恐怖 | 5 | tie_nw_fr_avoid〔c〕、tie_nw_fr_freeze〔c〕、tie_nw_fr_obey〔c〕、tie_nw_fr_shelter〔c〕 ほか |
| 恋人 | 4 | grp_cheer〔b〕、grp_bless〔b〕、mob_after〔b〕、ct_preg_news〔d〕 |
| 夫婦 | 1 | tie_spouse〔c〕 |
| 許嫁 | 6 | tie_nw_fi_eager〔c〕、tie_nw_fi_unsure〔c〕、tie_nw_fi_refuse〔c〕、tie_nw_fi_talk〔c〕 ほか |
| 本命 | 1 | tie_nw_honmei〔c〕 |
| セフレ | 22 | tie_nw_mi_secret〔c〕、tie_nw_mi_found〔c〕、tie_nw_mi_cut〔c〕、tie_nw_mi_noshow〔c〕 ほか |
| 元恋人 | 1 | tie_ly_ex〔c〕 |
| 歪んだ関係 | 5 | tie_abuse〔c〕、tie_warm_r18〔b〕、ct_dv〔c〕、ct_abuse_night〔c〕 ほか |
| 主従 | 1 | tie_master_r18〔c〕 |
| 仲間 | 4 | tie_nw_co_help〔c〕、tie_nw_co_cover〔c〕、tie_nw_co_mourn〔c〕、tie_nw_co_together〔c〕 |
| 同一人物 | 3 | attr_mirror_talk〔c〕、attr_mirror_habit〔c〕、attr_mirror_clash〔c〕 |
| 関係を問わない | 178 | talk、tease、care、lecture ほか |

種類：交流 83・対立 75・恋愛 62・献身 44・単独行動 26・ハプニング 7・夜 4・裏切り 1

R18：夜 13 件：住人どうし〔受け攻め・関係：セフレ〕 2、住人どうし〔合意のない展開・関係：執着（ヤンデレ）〕 2、住人どうし〔関係：セフレ〕 2、住人どうし〔合意のない展開〕 1、住人どうし〔合意のない展開・暴力をともなう性描写・重い・関係：不仲・関係：ライバル・関係：敵対〕 1、住人どうし〔合意のない展開・関係：主従〕 1、住人どうし〔合意のない展開・関係：歪んだ関係〕 1、住人どうし〔暴力をともなう性描写・関係：歪んだ関係〕 1、住人どうし〔歪んだ関係（DV など）・関係：歪んだ関係〕 1、住人どうし〔関係：歪んだ関係〕 1

内容の軸：合意のない展開：6件（スイッチ「合意のない展開」が入のとき・重いのとき：1件）〔表示側：条件つき・関係（敵対・執着・主従・歪んだ関係）しだい〕／妊娠：2件（スイッチ「妊娠」が入のとき・重いのとき：1件）〔表示側：条件つき・重いのとき〕／暴力をともなう性描写：2件（スイッチ「暴力をともなう性描写」が入のとき・重いのとき：1件）〔表示側：条件つき・重いのとき〕／歪んだ関係（DV など）：2件（スイッチ「歪んだ関係（DV など）」が入のとき）〔表示側：条件つき・関係「歪んだ関係」か、重いとき〕／死ネタ：なし／残酷な展開：3件（重いのとき：1件）

### 出られない部屋（whiteroom）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 2 | tie_rc_whiteroom_friend_blame〔c〕、tie_rc_whiteroom_friend_joke〔c〕 |
| 同僚 | 2 | tie_colleague〔c〕、tie_colleague2〔b〕 |
| 先輩後輩 | 1 | tie_senpai〔c〕 |
| バディ | 1 | tie_buddy〔c〕 |
| 幼馴染 | 2 | tie_rc_whiteroom_childhood_old〔c〕、tie_rc_whiteroom_childhood_sign〔c〕 |
| 同級生 | 1 | tie_classmate〔c〕 |
| 兄弟姉妹 | 2 | tie_rc_whiteroom_sib_bicker〔c〕、tie_rc_whiteroom_sib_back〔c〕 |
| 兄弟（不仲） | 6 | rb_whiteroom_sbSpat〔c〕、rb_whiteroom_sbCompare〔c〕、rb_whiteroom_sbGrudge〔c〕、rb_whiteroom_sbDefend〔c〕 ほか |
| 親族 | 1 | tie_relative〔c〕 |
| 親子 | 2 | tie_rc_whiteroom_parent_worry〔c〕、tie_rc_whiteroom_parent_care〔c〕 |
| 師弟 | 2 | tie_rc_whiteroom_mentor_calm〔c〕、tie_rc_whiteroom_mentor_defy〔c〕 |
| 上司と部下 | 2 | tie_boss〔c〕、rt_keep〔d〕 |
| 恩人 | 5 | tie_benefactor〔c〕、tie_nw_gu_refuse〔c〕、tie_nw_gu_obey〔c〕、tie_nw_gu_guilt〔c〕 ほか |
| 片想い | 15 | u_serve〔c〕、u_tri〔c〕、u_protect〔c〕、u_confess〔c〕 ほか |
| 執着（ヤンデレ） | 14 | tie_nw_dep_search〔c〕、tie_nw_dep_check〔c〕、tie_nw_dep_cling〔c〕、tie_nw_dep_worry〔c〕 ほか |
| 執着（信仰） | 2 | tie_worship〔c〕、rt_keep〔d〕 |
| 一方的な好意・敬愛 | 5 | tie_nw_os_cheer〔c〕、tie_nw_os_gift〔c〕、tie_nw_os_watch〔c〕、tie_nw_os_freeze〔c〕 ほか |
| 盲信 | 2 | tie_nw_blind〔c〕、tie_blind〔c〕 |
| 不仲 | 7 | rb_whiteroom_bdClash〔c〕、rb_whiteroom_bdSnark〔c〕、rb_whiteroom_bdForced〔c〕、rb_whiteroom_bdCredit〔c〕 ほか |
| ライバル | 1 | ct_violence_hook〔a〕 |
| 敵対 | 8 | tie_nw_hate_demean〔c〕、tie_nw_hate_trap〔c〕、tie_nw_hate_isolate〔c〕、tie_nw_hate_harm〔c〕 ほか |
| 無関心 | 3 | tie_nw_ap_talk〔c〕、tie_nw_ap_gift〔c〕、tie_nw_ap_other〔c〕 |
| 恐怖 | 5 | tie_nw_fr_avoid〔c〕、tie_nw_fr_freeze〔c〕、tie_nw_fr_obey〔c〕、tie_nw_fr_shelter〔c〕 ほか |
| 恋人 | 6 | grp_cheer〔b〕、grp_bless〔b〕、mob_after〔b〕、ct_preg_news〔d〕 ほか |
| 夫婦 | 1 | tie_spouse〔c〕 |
| 許嫁 | 6 | tie_nw_fi_eager〔c〕、tie_nw_fi_unsure〔c〕、tie_nw_fi_refuse〔c〕、tie_nw_fi_talk〔c〕 ほか |
| 本命 | 1 | tie_nw_honmei〔c〕 |
| セフレ | 21 | tie_nw_mi_secret〔c〕、tie_nw_mi_found〔c〕、tie_nw_mi_cut〔c〕、tie_nw_mi_noshow〔c〕 ほか |
| 元恋人 | 3 | tie_ly_ex〔c〕、tie_rc_whiteroom_ex_awk〔c〕、tie_rc_whiteroom_ex_know〔c〕 |
| 歪んだ関係 | 5 | tie_abuse〔c〕、tie_warm_r18〔b〕、ct_dv〔c〕、ct_abuse_night〔c〕 ほか |
| 主従 | 1 | tie_master_r18〔c〕 |
| 仲間 | 4 | tie_nw_co_help〔c〕、tie_nw_co_cover〔c〕、tie_nw_co_mourn〔c〕、tie_nw_co_together〔c〕 |
| 同一人物 | 12 | attr_mirror_talk〔c〕、attr_mirror_habit〔c〕、attr_mirror_clash〔c〕、rs_rival〔c〕 ほか |
| 関係を問わない | 232 | talk、tease、care、lecture ほか |

種類：交流 112・対立 81・恋愛 74・献身 53・単独行動 33・ハプニング 9・脱出 8・裏切り 5・夜 4

R18：夜 23 件：住人どうし〔条件の印なし〕 6、住人どうし〔受け攻め〕 3、住人どうし〔受け攻め・関係：セフレ〕 2、住人どうし〔合意のない展開・関係：執着（ヤンデレ）〕 2、住人どうし〔関係：セフレ〕 2、住人どうし〔合意のない展開〕 1、住人どうし〔合意のない展開・暴力をともなう性描写・重い・関係：不仲・関係：ライバル・関係：敵対〕 1、住人どうし〔合意のない展開・関係：主従〕 1、住人どうし〔合意のない展開・関係：歪んだ関係〕 1、住人どうし〔暴力をともなう性描写・関係：歪んだ関係〕 1、住人どうし〔歪んだ関係（DV など）・関係：歪んだ関係〕 1、住人どうし〔関係：同一人物〕 1、住人どうし〔関係：歪んだ関係〕 1

内容の軸：合意のない展開：6件（スイッチ「合意のない展開」が入のとき・重いのとき：1件）〔表示側：条件つき・関係（敵対・執着・主従・歪んだ関係）しだい〕／妊娠：2件（スイッチ「妊娠」が入のとき・重いのとき：1件）〔表示側：条件つき・重いのとき〕／暴力をともなう性描写：2件（スイッチ「暴力をともなう性描写」が入のとき・重いのとき：1件）〔表示側：条件つき・重いのとき〕／歪んだ関係（DV など）：2件（スイッチ「歪んだ関係（DV など）」が入のとき）〔表示側：条件つき・関係「歪んだ関係」か、重いとき〕／死ネタ：1件／残酷な展開：6件（重いのとき：1件）

### クラスメイト（classroom）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 2 | tie_rc_classroom_friend_split〔c〕、tie_rc_classroom_friend_study〔c〕 |
| 同僚 | 2 | tie_colleague〔c〕、tie_colleague2〔b〕 |
| 先輩後輩 | 1 | tie_senpai〔c〕 |
| バディ | 1 | tie_buddy〔c〕 |
| 幼馴染 | 2 | tie_rc_classroom_childhood_tease〔c〕、tie_rc_classroom_childhood_always〔c〕 |
| 同級生 | 3 | tie_classmate〔c〕、tie_rc_classroom_classmate_again〔c〕、tie_rc_classroom_classmate_know〔c〕 |
| 兄弟姉妹 | 2 | tie_rc_classroom_sib_bicker〔c〕、tie_rc_classroom_sib_back〔c〕 |
| 兄弟（不仲） | 6 | rb_classroom_sbSpat〔c〕、rb_classroom_sbCompare〔c〕、rb_classroom_sbGrudge〔c〕、rb_classroom_sbDefend〔c〕 ほか |
| 親族 | 1 | tie_relative〔c〕 |
| 親子 | 2 | tie_rc_classroom_parent_meddle〔c〕、tie_rc_classroom_parent_care〔c〕 |
| 師弟 | 2 | tie_rc_classroom_mentor_strict〔c〕、tie_rc_classroom_mentor_proud〔c〕 |
| 上司と部下 | 3 | tie_boss〔c〕、tie_rc_classroom_boss_habit〔c〕、tie_rc_classroom_boss_cover〔c〕 |
| 恩人 | 4 | tie_benefactor〔c〕、tie_nw_gu_refuse〔c〕、tie_nw_gu_obey〔c〕、tie_nw_gu_guilt〔c〕 |
| 片想い | 15 | u_serve〔c〕、u_tri〔c〕、u_protect〔c〕、u_confess〔c〕 ほか |
| 執着（ヤンデレ） | 13 | tie_nw_dep_search〔c〕、tie_nw_dep_check〔c〕、tie_nw_dep_cling〔c〕、tie_nw_dep_worry〔c〕 ほか |
| 執着（信仰） | 1 | tie_worship〔c〕 |
| 一方的な好意・敬愛 | 5 | tie_nw_os_cheer〔c〕、tie_nw_os_gift〔c〕、tie_nw_os_watch〔c〕、tie_nw_os_freeze〔c〕 ほか |
| 盲信 | 2 | tie_nw_blind〔c〕、tie_blind〔c〕 |
| 不仲 | 6 | rb_classroom_bdClash〔c〕、rb_classroom_bdSnark〔c〕、rb_classroom_bdForced〔c〕、rb_classroom_bdCredit〔c〕 ほか |
| 敵対 | 7 | tie_nw_hate_demean〔c〕、tie_nw_hate_trap〔c〕、tie_nw_hate_isolate〔c〕、tie_nw_hate_harm〔c〕 ほか |
| 無関心 | 3 | tie_nw_ap_talk〔c〕、tie_nw_ap_gift〔c〕、tie_nw_ap_other〔c〕 |
| 恐怖 | 5 | tie_nw_fr_avoid〔c〕、tie_nw_fr_freeze〔c〕、tie_nw_fr_obey〔c〕、tie_nw_fr_shelter〔c〕 ほか |
| 恋人 | 3 | grp_cheer〔b〕、grp_bless〔b〕、mob_after〔b〕 |
| 夫婦 | 1 | tie_spouse〔c〕 |
| 許嫁 | 6 | tie_nw_fi_eager〔c〕、tie_nw_fi_unsure〔c〕、tie_nw_fi_refuse〔c〕、tie_nw_fi_talk〔c〕 ほか |
| 本命 | 1 | tie_nw_honmei〔c〕 |
| セフレ | 6 | tie_nw_mi_secret〔c〕、tie_nw_mi_found〔c〕、tie_nw_mi_cut〔c〕、tie_nw_mi_noshow〔c〕 ほか |
| 元恋人 | 3 | tie_ly_ex〔c〕、tie_rc_classroom_ex_awk〔c〕、tie_rc_classroom_ex_easy〔c〕 |
| 歪んだ関係 | 2 | tie_abuse〔c〕、tie_warm_r18〔b〕 |
| 主従 | 1 | tie_master_r18〔c〕 |
| 仲間 | 4 | tie_nw_co_help〔c〕、tie_nw_co_cover〔c〕、tie_nw_co_mourn〔c〕、tie_nw_co_together〔c〕 |
| 同一人物 | 3 | attr_mirror_talk〔c〕、attr_mirror_habit〔c〕、attr_mirror_clash〔c〕 |
| 関係を問わない | 186 | talk、tease、care、lecture ほか |

種類：交流 100・対立 73・献身 48・恋愛 43・単独行動 30・ハプニング 7・裏切り 2・夜 1

R18：夜 5 件：住人どうし〔受け攻め・関係：セフレ〕 2、住人どうし〔合意のない展開・関係：主従〕 1、住人どうし〔合意のない展開・関係：執着（ヤンデレ）〕 1、住人どうし〔関係：歪んだ関係〕 1

内容の軸：合意のない展開：2件（スイッチ「合意のない展開」が入のとき）〔表示側：条件つき・関係（敵対・執着・主従・歪んだ関係）しだい〕／妊娠：なし〔表示側：なし・妊娠の場面なし〕／暴力をともなう性描写：なし〔表示側：なし・場面なし〕／歪んだ関係（DV など）：1件（スイッチ「歪んだ関係（DV など）」が入のとき）〔表示側：条件つき・関係「歪んだ関係」か、重いとき〕／死ネタ：なし／残酷な展開：2件

### 無人島（island）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 3 | i_solo_gift〔b〕、tie_rc_island_friend_share〔c〕、tie_rc_island_friend_watch〔c〕 |
| 同僚 | 2 | tie_colleague〔c〕、tie_colleague2〔b〕 |
| 先輩後輩 | 1 | tie_senpai〔c〕 |
| バディ | 1 | tie_buddy〔c〕 |
| 幼馴染 | 2 | tie_rc_island_childhood_reckless〔c〕、tie_rc_island_childhood_beach〔c〕 |
| 同級生 | 3 | tie_classmate〔c〕、tie_rc_island_classmate_rival〔c〕、tie_rc_island_classmate_roll〔c〕 |
| 兄弟姉妹 | 2 | tie_rc_island_sib_food〔c〕、tie_rc_island_sib_storm〔c〕 |
| 兄弟（庇護） | 2 | ir_prebel〔d〕、ir_pcare〔d〕 |
| 兄弟（親友のよう） | 1 | ir_csig〔d〕 |
| 兄弟（不仲） | 6 | rb_island_sbSpat〔c〕、rb_island_sbCompare〔c〕、rb_island_sbGrudge〔c〕、rb_island_sbDefend〔c〕 ほか |
| 親族 | 1 | tie_relative〔c〕 |
| 親子 | 2 | tie_rc_island_parent_stop〔c〕、tie_rc_island_parent_care〔c〕 |
| 教師と生徒 | 2 | ir_lesson〔d〕、ir_scold〔d〕 |
| 師弟 | 3 | ir_train〔d〕、tie_rc_island_mentor_drill〔c〕、tie_rc_island_mentor_stand〔c〕 |
| 上司と部下 | 3 | tie_boss〔c〕、tie_rc_island_boss_rank〔c〕、tie_rc_island_boss_trust〔c〕 |
| 恩人 | 4 | tie_benefactor〔c〕、tie_nw_gu_refuse〔c〕、tie_nw_gu_obey〔c〕、tie_nw_gu_guilt〔c〕 |
| 片想い | 15 | u_serve〔c〕、u_tri〔c〕、u_protect〔c〕、u_confess〔c〕 ほか |
| 執着（ヤンデレ） | 13 | tie_nw_dep_search〔c〕、tie_nw_dep_check〔c〕、tie_nw_dep_cling〔c〕、tie_nw_dep_worry〔c〕 ほか |
| 執着（信仰） | 1 | tie_worship〔c〕 |
| 一方的な好意・敬愛 | 5 | tie_nw_os_cheer〔c〕、tie_nw_os_gift〔c〕、tie_nw_os_watch〔c〕、tie_nw_os_freeze〔c〕 ほか |
| 盲信 | 2 | tie_nw_blind〔c〕、tie_blind〔c〕 |
| 不仲 | 6 | rb_island_bdClash〔c〕、rb_island_bdSnark〔c〕、rb_island_bdForced〔c〕、rb_island_bdCredit〔c〕 ほか |
| ライバル | 1 | i_solo_gift〔b〕 |
| 敵対 | 4 | tie_nw_hate_demean〔c〕、tie_nw_hate_trap〔c〕、tie_nw_hate_isolate〔c〕、tie_nw_hate_harm〔c〕 |
| 無関心 | 3 | tie_nw_ap_talk〔c〕、tie_nw_ap_gift〔c〕、tie_nw_ap_other〔c〕 |
| 恐怖 | 5 | tie_nw_fr_avoid〔c〕、tie_nw_fr_freeze〔c〕、tie_nw_fr_obey〔c〕、tie_nw_fr_shelter〔c〕 ほか |
| 恋人 | 8 | grp_cheer〔b〕、grp_bless〔b〕、mob_after〔b〕、ct_preg_news〔d〕 ほか |
| 夫婦 | 1 | tie_spouse〔c〕 |
| 許嫁 | 6 | tie_nw_fi_eager〔c〕、tie_nw_fi_unsure〔c〕、tie_nw_fi_refuse〔c〕、tie_nw_fi_talk〔c〕 ほか |
| 本命 | 1 | tie_nw_honmei〔c〕 |
| セフレ | 21 | tie_nw_mi_secret〔c〕、tie_nw_mi_found〔c〕、tie_nw_mi_cut〔c〕、tie_nw_mi_noshow〔c〕 ほか |
| 元恋人 | 3 | tie_ly_ex〔c〕、tie_rc_island_ex_awk〔c〕、tie_rc_island_ex_know〔c〕 |
| 歪んだ関係 | 5 | tie_abuse〔c〕、tie_warm_r18〔b〕、ct_dv〔c〕、ct_abuse_night〔c〕 ほか |
| 主従 | 1 | tie_master_r18〔c〕 |
| 仲間 | 4 | tie_nw_co_help〔c〕、tie_nw_co_cover〔c〕、tie_nw_co_mourn〔c〕、tie_nw_co_together〔c〕 |
| 同一人物 | 3 | attr_mirror_talk〔c〕、attr_mirror_habit〔c〕、attr_mirror_clash〔c〕 |
| 関係を問わない | 234 | talk、tease、care、lecture ほか |

種類：交流 98・対立 84・献身 74・恋愛 55・単独行動 39・ハプニング 10・脱出 8・裏切り 6・ハプニング 2・夜 2・戦闘 1

R18：夜 12 件：住人どうし〔受け攻め・関係：セフレ〕 2、住人どうし〔関係：セフレ〕 2、住人どうし〔合意のない展開・関係：主従〕 1、住人どうし〔合意のない展開・関係：執着（ヤンデレ）〕 1、住人どうし〔合意のない展開・関係：歪んだ関係〕 1、住人どうし〔暴力をともなう性描写・関係：歪んだ関係〕 1、住人どうし〔条件の印なし〕 1、住人どうし〔歪んだ関係（DV など）・関係：歪んだ関係〕 1、住人どうし〔環境値：天候の荒さ 60 超〕 1、住人どうし〔関係：歪んだ関係〕 1

内容の軸：合意のない展開：5件（スイッチ「合意のない展開」が入のとき）〔表示側：条件つき・関係（敵対・執着・主従・歪んだ関係）しだい〕／妊娠：2件（スイッチ「妊娠」が入のとき・重いのとき：1件）〔表示側：条件つき・重いのとき〕／暴力をともなう性描写：1件（スイッチ「暴力をともなう性描写」が入のとき）〔表示側：条件つき・重いのとき〕／歪んだ関係（DV など）：2件（スイッチ「歪んだ関係（DV など）」が入のとき）〔表示側：条件つき・関係「歪んだ関係」か、重いとき〕／死ネタ：2件（体力が尽きると死ぬ箱庭（出来事の外でも死が起きる））／残酷な展開：2件

### 宇宙船漂流記（ship）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| バディ | 1 | ship_infect_react〔a〕 |
| 親友 | 1 | ship_infect_react〔a〕 |
| 兄弟姉妹 | 1 | ship_infect_react〔a〕 |
| 親子 | 1 | ship_infect_react〔a〕 |
| 恩人 | 1 | tns_guilt〔a〕 |
| 執着（ヤンデレ） | 4 | os_obsess〔a〕、ship_infect_react〔a〕、tns_dep〔a〕、tns_hatelove〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 敵対 | 1 | tns_hate〔a〕 |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 恋人 | 2 | ship_infect_react〔a〕、ship_night_lover〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| 本命 | 1 | ship_infect_react〔a〕 |
| セフレ | 1 | tns_mistress〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |
| 同一人物 | 1 | ss_same〔a〕 |
| 関係を問わない | 12 | ship_after_wipe、ship_lab、ship_nurse、ship_cover ほか |

種類：交流 6・対立 5・夜 5・献身 3・ハプニング 3・単独行動 2・恋愛 1・探索 1

R18：夜 5 件：モブ〔合意のない展開〕 1、モブ〔合意のない展開・環境値：夜の出来事の起こりやすさ〕 1、住人どうし〔条件の印なし〕 1、住人どうし〔環境値：夜の出来事の起こりやすさ〕 1、住人どうし〔関係：恋人〕 1

内容の軸：合意のない展開：2件（スイッチ「合意のない展開」が入のとき）〔表示側：ある・星の生命体に襲われる〕／妊娠：なし〔表示側：なし・妊娠の場面なし〕／暴力をともなう性描写：なし〔表示側：なし・場面なし〕／歪んだ関係（DV など）：なし〔表示側：なし・スイッチで足す場面なし（関係としては出る）〕／死ネタ：5件／残酷な展開：3件

表（数だけ）：星の資源 30件、星の生命体 37件、星の文明 30件、船のトラブル 12件、宇宙での遭遇 14件、船を滅ぼすトラブル 6件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### ゾンビの街（zombie）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 2 | tie_rc_zombie_friend_leave〔c〕、tie_rc_zombie_friend_cheer〔c〕 |
| 同僚 | 3 | tie_colleague〔c〕、tie_colleague2〔b〕、zb_colleague〔c〕 |
| 先輩後輩 | 1 | tie_senpai〔c〕 |
| バディ | 1 | tie_buddy〔c〕 |
| 幼馴染 | 2 | tie_rc_zombie_childhood_again〔c〕、tie_rc_zombie_childhood_sign〔c〕 |
| 同級生 | 2 | tie_classmate〔c〕、zb_classmate〔c〕 |
| 親友 | 1 | zb_cure〔a〕 |
| 兄弟姉妹 | 3 | tie_rc_zombie_sib_split〔c〕、tie_rc_zombie_sib_back〔c〕、zb_cure〔a〕 |
| 兄弟（不仲） | 6 | rb_zombie_sbSpat〔c〕、rb_zombie_sbCompare〔c〕、rb_zombie_sbGrudge〔c〕、rb_zombie_sbDefend〔c〕 ほか |
| 親族 | 2 | tie_relative〔c〕、zb_relative〔c〕 |
| 親子 | 4 | tie_rc_zombie_parent_shield〔c〕、tie_rc_zombie_parent_guard〔c〕、tie_rc_zombie_parent_fight〔c〕、zb_cure〔a〕 |
| 教師と生徒 | 1 | zr_scold〔b〕 |
| 上司と部下 | 2 | tie_boss〔c〕、zb_boss〔c〕 |
| 恩人 | 5 | tie_benefactor〔c〕、tie_nw_gu_refuse〔c〕、tie_nw_gu_obey〔c〕、tie_nw_gu_guilt〔c〕 ほか |
| 片想い | 16 | z_cr_guard〔b〕、u_serve〔c〕、u_tri〔c〕、u_protect〔c〕 ほか |
| 執着（ヤンデレ） | 18 | tie_nw_dep_search〔c〕、tie_nw_dep_check〔c〕、tie_nw_dep_cling〔c〕、tie_nw_dep_worry〔c〕 ほか |
| 執着（信仰） | 2 | tie_worship〔c〕、zb_worship〔c〕 |
| 一方的な好意・敬愛 | 5 | tie_nw_os_cheer〔c〕、tie_nw_os_gift〔c〕、tie_nw_os_watch〔c〕、tie_nw_os_freeze〔c〕 ほか |
| 盲信 | 2 | tie_nw_blind〔c〕、tie_blind〔c〕 |
| 不仲 | 7 | rb_zombie_bdClash〔c〕、rb_zombie_bdSnark〔c〕、rb_zombie_bdForced〔c〕、rb_zombie_bdCredit〔c〕 ほか |
| ライバル | 1 | ct_violence_hook〔a〕 |
| 敵対 | 8 | tie_nw_hate_demean〔c〕、tie_nw_hate_trap〔c〕、tie_nw_hate_isolate〔c〕、tie_nw_hate_harm〔c〕 ほか |
| 無関心 | 3 | tie_nw_ap_talk〔c〕、tie_nw_ap_gift〔c〕、tie_nw_ap_other〔c〕 |
| 恐怖 | 5 | tie_nw_fr_avoid〔c〕、tie_nw_fr_freeze〔c〕、tie_nw_fr_obey〔c〕、tie_nw_fr_shelter〔c〕 ほか |
| 恋人 | 13 | grp_cheer〔b〕、grp_bless〔b〕、mob_after〔b〕、ct_preg_news〔d〕 ほか |
| 夫婦 | 1 | tie_spouse〔c〕 |
| 許嫁 | 6 | tie_nw_fi_eager〔c〕、tie_nw_fi_unsure〔c〕、tie_nw_fi_refuse〔c〕、tie_nw_fi_talk〔c〕 ほか |
| 本命 | 1 | tie_nw_honmei〔c〕 |
| セフレ | 14 | tie_nw_mi_secret〔c〕、tie_nw_mi_found〔c〕、tie_nw_mi_cut〔c〕、tie_nw_mi_noshow〔c〕 ほか |
| 元恋人 | 3 | tie_ly_ex〔c〕、tie_rc_zombie_ex_awk〔c〕、tie_rc_zombie_ex_trust〔c〕 |
| 歪んだ関係 | 5 | tie_abuse〔c〕、tie_warm_r18〔b〕、ct_dv〔c〕、ct_abuse_night〔c〕 ほか |
| 主従 | 1 | tie_master_r18〔c〕 |
| 仲間 | 4 | tie_nw_co_help〔c〕、tie_nw_co_cover〔c〕、tie_nw_co_mourn〔c〕、tie_nw_co_together〔c〕 |
| 同一人物 | 3 | attr_mirror_talk〔c〕、attr_mirror_habit〔c〕、attr_mirror_clash〔c〕 |
| 関係を問わない | 130 | talk、care、confide、jealous ほか |

種類：対立 64・交流 58・献身 54・単独行動 47・恋愛 36・ハプニング 7・戦闘 5・夜 4・裏切り 2・ハプニング 1

R18：夜 19 件：モブ〔合意のない展開〕 3、住人どうし〔受け攻め・関係：セフレ〕 2、住人どうし〔合意のない展開・関係：執着（ヤンデレ）〕 2、住人どうし〔関係：恋人〕 2、住人どうし〔受け攻め・関係：恋人〕 1、住人どうし〔合意のない展開〕 1、住人どうし〔合意のない展開・暴力をともなう性描写・重い・関係：不仲・関係：ライバル・関係：敵対〕 1、住人どうし〔合意のない展開・関係：主従〕 1、住人どうし〔合意のない展開・関係：歪んだ関係〕 1、住人どうし〔暴力をともなう性描写・関係：歪んだ関係〕 1、住人どうし〔条件の印なし〕 1、住人どうし〔歪んだ関係（DV など）・関係：歪んだ関係〕 1、住人どうし〔関係：セフレ〕 1、住人どうし〔関係：歪んだ関係〕 1

内容の軸：合意のない展開：9件（スイッチ「合意のない展開」が入のとき・重いのとき：1件）〔表示側：条件つき・関係（敵対・執着・主従・歪んだ関係）しだい〕／妊娠：2件（スイッチ「妊娠」が入のとき・重いのとき：1件）〔表示側：条件つき・重いのとき〕／暴力をともなう性描写：2件（スイッチ「暴力をともなう性描写」が入のとき・重いのとき：1件）〔表示側：条件つき・重いのとき〕／歪んだ関係（DV など）：2件（スイッチ「歪んだ関係（DV など）」が入のとき）〔表示側：条件つき・関係「歪んだ関係」か、重いとき〕／死ネタ：7件（体力が尽きると死ぬ箱庭（出来事の外でも死が起きる））／残酷な展開：8件（重いのとき：1件）

### 邪神村RTA（jashin）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 1 | js_rel〔a〕 |
| 同僚 | 1 | js_rel〔a〕 |
| 先輩後輩 | 1 | js_rel〔a〕 |
| バディ | 1 | js_rel〔a〕 |
| 幼馴染 | 1 | js_rel〔a〕 |
| 同級生 | 1 | js_rel〔a〕 |
| 友達以上恋人未満 | 1 | js_rel〔a〕 |
| 親友 | 1 | js_rel〔a〕 |
| 兄弟姉妹 | 1 | js_rel〔a〕 |
| 兄弟（庇護） | 1 | js_rel〔a〕 |
| 兄弟（親友のよう） | 1 | js_rel〔a〕 |
| 兄弟（不仲） | 2 | js_rel〔a〕、rbs_sibbad〔a〕 |
| 親族 | 1 | js_rel〔a〕 |
| 親子 | 1 | js_rel〔a〕 |
| 擬似親子 | 2 | js_pparent〔a〕、js_rel〔a〕 |
| 教師と生徒 | 1 | js_rel〔a〕 |
| 師弟 | 1 | js_rel〔a〕 |
| 上司と部下 | 1 | js_rel〔a〕 |
| 恩人 | 1 | tns_guilt〔a〕 |
| 執着（ヤンデレ） | 4 | js_hatelove〔a〕、os_obsess〔a〕、tns_dep〔a〕、tns_hatelove〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 不仲 | 1 | rbs_bad〔a〕 |
| ライバル | 1 | js_feud〔a〕 |
| 敵対 | 4 | js_feud〔a〕、js_hate〔a〕、js_rel〔a〕、tns_hate〔a〕 |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 恋人 | 3 | js_love〔a〕、js_rel〔a〕、js_climax_lover〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| セフレ | 2 | js_rel〔a〕、tns_mistress〔a〕 |
| 運命の番 | 1 | js_rel〔a〕 |
| 番 | 1 | js_rel〔a〕 |
| 主従 | 1 | js_rel〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |
| 同一人物 | 1 | ss_same〔a〕 |
| 関係を問わない | 25 | js_cave、js_drama、js_betray、js_feast ほか |

種類：夜 13・対立 10・交流 8・ハプニング 4・献身 3・単独行動 3・裏切り 2・恋愛 2・戦闘 1

R18：夜 13 件：モブ〔合意のない展開・妊娠〕 7、住人どうし〔妊娠〕 3、モブ〔合意のない展開〕 2、住人どうし〔関係：恋人〕 1

内容の軸：合意のない展開：9件（スイッチ「合意のない展開」が入のとき）〔表示側：ある・村人・神・眷属に襲われる〕／妊娠：10件（スイッチ「妊娠」が入のとき）〔表示側：ある・いつも（疑似妊娠）〕／暴力をともなう性描写：なし〔表示側：なし・場面なし〕／歪んだ関係（DV など）：なし〔表示側：なし・スイッチで足す場面なし（関係としては出る）〕／死ネタ：10件／残酷な展開：6件

表（数だけ）：神（手がかり・対抗策） 51件、職業の出来事 21件、職業×職業の出来事 14組（職業×職業）、役職×役職の特別な出来事（協力・因縁） 200組（職業×職業）、祠の効果 7件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### 吹雪の館の殺人（yakata）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 親友 | 1 | mercy〔a〕 |
| 兄弟姉妹 | 2 | insurance〔a〕、mercy〔a〕 |
| 兄弟（不仲） | 1 | rbs_sibbad〔a〕 |
| 親子 | 2 | insurance〔a〕、mercy〔a〕 |
| 恩人 | 1 | tns_guilt〔a〕 |
| 片想い | 3 | yk_r18_crush〔a〕、jealous〔a〕、obsess〔a〕 |
| 執着（ヤンデレ） | 4 | os_obsess〔a〕、tns_dep〔a〕、tns_hatelove〔a〕、yk_hatelove〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 不仲 | 1 | rbs_bad〔a〕 |
| ライバル | 3 | yk_r18_enemy〔a〕、yk_feud〔a〕、jealous〔a〕 |
| 敵対 | 5 | yk_r18_enemy〔a〕、tns_hate〔a〕、yk_feud〔a〕、yk_hate〔a〕 ほか |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 恋人 | 3 | yk_r18_lover〔a〕、insurance〔a〕、mercy〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| セフレ | 2 | tns_mistress〔a〕、insurance〔a〕 |
| 元恋人 | 2 | jealous〔a〕、obsess〔a〕 |
| 番 | 2 | insurance〔a〕、mercy〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |
| 同一人物 | 1 | ss_same〔a〕 |
| 関係を問わない | 24 | yk_r18_night〔a〕、yk_r18_servant、yk_r18_silence、yk_r18_pleasure ほか |

種類：謎解き 22・対立 10・夜 7・交流 5・死亡 1・献身 1・恋愛 1・単独行動 1・ハプニング 1

R18：夜 7 件：モブ〔合意のない展開〕 1、住人どうし〔合意のない展開〕 1、住人どうし〔合意のない展開・暴力をともなう性描写〕 1、住人どうし〔合意のない展開・関係：ライバル・関係：敵対〕 1、住人どうし〔条件の印なし〕 1、住人どうし〔関係：恋人〕 1、住人どうし〔関係：片想い〕 1

内容の軸：合意のない展開：4件（スイッチ「合意のない展開」が入のとき）〔表示側：ある・使用人・犯人に襲われる〕／妊娠：なし〔表示側：なし・妊娠の場面なし〕／暴力をともなう性描写：1件（スイッチ「暴力をともなう性描写」が入のとき）〔表示側：条件つき・快楽殺人の動機〕／歪んだ関係（DV など）：なし〔表示側：なし・スイッチで足す場面なし（関係としては出る）〕／死ネタ：5件／残酷な展開：6件

表（数だけ）：犯人の動機 21件、職業×職業の出来事 14組（職業×職業）

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### オメガバース（omega）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 2 | tie_rc_omega_friend_meddle〔c〕、tie_rc_omega_friend_cover〔c〕 |
| 同僚 | 5 | tie_colleague〔c〕、tie_colleague2〔b〕、om_tie_colleague〔c〕、om_tiekeep_colleague〔c〕 ほか |
| 先輩後輩 | 1 | tie_senpai〔c〕 |
| バディ | 1 | tie_buddy〔c〕 |
| 幼馴染 | 2 | tie_rc_omega_childhood_test〔c〕、tie_rc_omega_childhood_stay〔c〕 |
| 同級生 | 4 | tie_classmate〔c〕、om_tie_classmate〔c〕、om_tiekeep_classmate〔c〕、om_tiegrow_classmate〔c〕 |
| 兄弟姉妹 | 2 | tie_rc_omega_sib_bicker〔c〕、tie_rc_omega_sib_guard〔c〕 |
| 兄弟（不仲） | 6 | rb_omega_sbSpat〔c〕、rb_omega_sbCompare〔c〕、rb_omega_sbGrudge〔c〕、rb_omega_sbDefend〔c〕 ほか |
| 親族 | 4 | tie_relative〔c〕、om_tie_relative〔c〕、om_tiekeep_relative〔c〕、om_tiegrow_relative〔c〕 |
| 親子 | 2 | tie_rc_omega_parent_worry〔c〕、tie_rc_omega_parent_care〔c〕 |
| 師弟 | 2 | tie_rc_omega_mentor_teach〔c〕、tie_rc_omega_mentor_defy〔c〕 |
| 上司と部下 | 4 | tie_boss〔c〕、om_tie_boss〔c〕、om_tiekeep_boss〔c〕、om_tiegrow_boss〔c〕 |
| 恩人 | 7 | tie_benefactor〔c〕、tie_nw_gu_refuse〔c〕、tie_nw_gu_obey〔c〕、tie_nw_gu_guilt〔c〕 ほか |
| 執着（ヤンデレ） | 14 | tie_nw_dep_search〔c〕、tie_nw_dep_check〔c〕、tie_nw_dep_cling〔c〕、tie_nw_dep_worry〔c〕 ほか |
| 執着（信仰） | 4 | tie_worship〔c〕、om_tie_worship〔c〕、om_tiekeep_worship〔c〕、om_tiegrow_worship〔c〕 |
| 一方的な好意・敬愛 | 5 | tie_nw_os_cheer〔c〕、tie_nw_os_gift〔c〕、tie_nw_os_watch〔c〕、tie_nw_os_freeze〔c〕 ほか |
| 盲信 | 2 | tie_nw_blind〔c〕、tie_blind〔c〕 |
| 不仲 | 7 | rb_omega_bdClash〔c〕、rb_omega_bdSnark〔c〕、rb_omega_bdForced〔c〕、rb_omega_bdCredit〔c〕 ほか |
| ライバル | 2 | om_rival〔c〕、ct_violence_hook〔a〕 |
| 敵対 | 8 | tie_nw_hate_demean〔c〕、tie_nw_hate_trap〔c〕、tie_nw_hate_isolate〔c〕、tie_nw_hate_harm〔c〕 ほか |
| 無関心 | 3 | tie_nw_ap_talk〔c〕、tie_nw_ap_gift〔c〕、tie_nw_ap_other〔c〕 |
| 恐怖 | 5 | tie_nw_fr_avoid〔c〕、tie_nw_fr_freeze〔c〕、tie_nw_fr_obey〔c〕、tie_nw_fr_shelter〔c〕 ほか |
| 恋人 | 20 | grp_cheer〔b〕、grp_bless〔b〕、mob_after〔b〕、ct_preg_news〔d〕 ほか |
| 夫婦 | 1 | tie_spouse〔c〕 |
| 許嫁 | 6 | tie_nw_fi_eager〔c〕、tie_nw_fi_unsure〔c〕、tie_nw_fi_refuse〔c〕、tie_nw_fi_talk〔c〕 ほか |
| 本命 | 1 | tie_nw_honmei〔c〕 |
| セフレ | 21 | tie_nw_mi_secret〔c〕、tie_nw_mi_found〔c〕、tie_nw_mi_cut〔c〕、tie_nw_mi_noshow〔c〕 ほか |
| 元恋人 | 3 | tie_ly_ex〔c〕、tie_rc_omega_ex_scent〔c〕、tie_rc_omega_ex_care〔c〕 |
| 歪んだ関係 | 5 | tie_abuse〔c〕、tie_warm_r18〔b〕、ct_dv〔c〕、ct_abuse_night〔c〕 ほか |
| 運命の番 | 2 | om_fated_waver〔c〕、om_fated_realize〔c〕 |
| 主従 | 1 | tie_master_r18〔c〕 |
| 仲間 | 4 | tie_nw_co_help〔c〕、tie_nw_co_cover〔c〕、tie_nw_co_mourn〔c〕、tie_nw_co_together〔c〕 |
| 同一人物 | 4 | attr_mirror_talk〔c〕、attr_mirror_habit〔c〕、attr_mirror_clash〔c〕、om_same〔c〕 |
| 関係を問わない | 99 | talk、tease、care、lecture ほか |

種類：交流 81・対立 71・恋愛 47・献身 31・単独行動 16・ハプニング 6・夜 4・裏切り 1

R18：夜 18 件：住人どうし〔受け攻め・関係：セフレ〕 2、住人どうし〔合意のない展開・関係：執着（ヤンデレ）〕 2、住人どうし〔関係：セフレ〕 2、住人どうし〔関係：恋人〕 2、モブ〔合意のない展開・環境値：発情期の重さ〕 1、住人どうし〔合意のない展開・暴力をともなう性描写・重い・関係：不仲・関係：ライバル・関係：敵対〕 1、住人どうし〔合意のない展開・環境値：発情期の重さ・性欲・関係：恋人〕 1、住人どうし〔合意のない展開・関係：主従〕 1、住人どうし〔合意のない展開・関係：歪んだ関係〕 1、住人どうし〔暴力をともなう性描写・関係：歪んだ関係〕 1、住人どうし〔歪んだ関係（DV など）・関係：歪んだ関係〕 1、住人どうし〔環境値：描写の有無：濃い・関係：恋人〕 1、住人どうし〔環境値：発情期の重さ〕 1、住人どうし〔関係：歪んだ関係〕 1

内容の軸：合意のない展開：7件（スイッチ「合意のない展開」が入のとき・重いのとき：1件）〔表示側：条件つき・関係（敵対・執着・主従・歪んだ関係）しだい〕／妊娠：2件（スイッチ「妊娠」が入のとき・重いのとき：1件）〔表示側：条件つき・重いのとき〕／暴力をともなう性描写：2件（スイッチ「暴力をともなう性描写」が入のとき・重いのとき：1件）〔表示側：条件つき・重いのとき〕／歪んだ関係（DV など）：2件（スイッチ「歪んだ関係（DV など）」が入のとき）〔表示側：条件つき・関係「歪んだ関係」か、重いとき〕／死ネタ：なし／残酷な展開：4件（重いのとき：1件）

表（数だけ）：職業×職業の出来事 38組（職業×職業）（JOB_PAIR_RULES の26組（omega-jobs-pair2.js）を含む）

### エロトラップダンジョン（dungeon）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 兄弟（不仲） | 1 | rbs_sibbad〔a〕 |
| 執着（ヤンデレ） | 1 | os_obsess〔a〕 |
| 不仲 | 1 | rbs_bad〔a〕 |
| 関係を問わない | 3 | dg_party〔a〕、dg_topfall、dg_trap |

種類：対立 3・夜 3

R18：夜 3 件：モブ〔合意のない展開〕 1、モブ〔条件の印なし〕 1、住人どうし〔条件の印なし〕 1

内容の軸：合意のない展開：1件（題材なので、いつも入）〔表示側：ある・題材（いつも入）〕／妊娠：なし〔表示側：なし・妊娠の場面なし〕／暴力をともなう性描写：なし〔表示側：なし・場面なし〕／歪んだ関係（DV など）：なし〔表示側：なし・スイッチで足す場面なし（関係としては出る）〕／死ネタ：なし／残酷な展開：1件

表（数だけ）：罠・魔物・宝箱 144件、最深部の主 15件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### これって本当にマッサージですか？（massage）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 恩人 | 1 | tns_guilt〔a〕 |
| 片想い | 1 | ms_love〔a〕 |
| 執着（ヤンデレ） | 2 | tns_dep〔a〕、tns_hatelove〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 敵対 | 1 | tns_hate〔a〕 |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 恋人 | 1 | ms_love〔a〕 |
| 夫婦 | 1 | ms_love〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| 本命 | 1 | ms_love〔a〕 |
| セフレ | 1 | tns_mistress〔a〕 |
| 運命の番 | 1 | ms_love〔a〕 |
| 番 | 1 | ms_love〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |
| 関係を問わない | 3 | ms_sleep、ms_treat、ms_r18 |

種類：交流 4・対立 4・夜 3・献身 1・恋愛 1・単独行動 1

R18：夜 3 件：モブ〔合意のない展開〕 2、住人どうし〔関係：片想い・関係：恋人・関係：夫婦・関係：本命・関係：運命の番・関係：番〕 1

内容の軸：合意のない展開：2件（題材なので、いつも入）〔表示側：ある・題材（いつも入）〕／妊娠：なし〔表示側：なし・妊娠の場面なし〕／暴力をともなう性描写：なし〔表示側：なし・場面なし〕／歪んだ関係（DV など）：なし〔表示側：なし・スイッチで足す場面なし（関係としては出る）〕／死ネタ：なし／残酷な展開：2件

表（数だけ）：施術中のハプニング 10件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### 感覚遮断穴（hole）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 1 | hole_behind〔a〕 |
| 片想い | 1 | hole_behind〔a〕 |
| 執着（ヤンデレ） | 1 | hole_behind〔a〕 |
| 恋人 | 1 | hole_behind〔a〕 |
| 関係を問わない | 2 | hole_live、hole_main |

種類：夜 3

R18：夜 3 件：モブ〔合意のない展開〕 2、住人どうし〔関係：友人・関係：片想い・関係：執着（ヤンデレ）・関係：恋人〕 1

内容の軸：合意のない展開：2件（題材なので、いつも入）〔表示側：ある・題材（いつも入）〕／妊娠：なし〔表示側：なし・妊娠の場面なし〕／暴力をともなう性描写：なし〔表示側：なし・場面なし〕／歪んだ関係（DV など）：なし〔表示側：なし・スイッチで足す場面なし（関係としては出る）〕／死ネタ：なし／残酷な展開：なし

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### ダンジョンRPG（rpg）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 兄弟（不仲） | 1 | rbs_sibbad〔a〕 |
| 恩人 | 1 | tns_guilt〔a〕 |
| 執着（ヤンデレ） | 3 | os_obsess〔a〕、tns_dep〔a〕、tns_hatelove〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 不仲 | 1 | rbs_bad〔a〕 |
| 敵対 | 1 | tns_hate〔a〕 |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| セフレ | 1 | tns_mistress〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |
| 同一人物 | 1 | ss_same〔a〕 |
| 関係を問わない | 5 | rpg_special、rpg_floor、rpg_boss、rpg_event ほか |

種類：対立 7・交流 5・ハプニング 2・戦闘 1・献身 1・恋愛 1・単独行動 1・探索 1

内容の軸：合意のない展開：なし〔表示側：なし・場面なし〕／妊娠：なし〔表示側：なし・妊娠の場面なし〕／暴力をともなう性描写：なし〔表示側：なし・場面なし〕／歪んだ関係（DV など）：なし〔表示側：なし・スイッチで足す場面なし（関係としては出る）〕／死ネタ：4件／残酷な展開：3件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### 常識改変（kaihen）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 兄弟（不仲） | 1 | rbs_sibbad〔a〕 |
| 不仲 | 1 | rbs_bad〔a〕 |
| 関係を問わない | 1 | kh_work |

種類：対立 2・夜 1

R18：夜 1 件：モブ〔合意のない展開〕 1

内容の軸：合意のない展開：1件（題材なので、いつも入）〔表示側：ある・題材（いつも入）〕／妊娠：なし〔表示側：なし・妊娠の場面なし〕／暴力をともなう性描写：なし〔表示側：なし・場面なし〕／歪んだ関係（DV など）：なし〔表示側：なし・スイッチで足す場面なし（関係としては出る）〕／死ネタ：なし／残酷な展開：なし

表（数だけ）：営業中のハプニング 16件、改変された職場 6件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### サキュバスの一夜（succubus）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 兄弟（不仲） | 1 | rbs_sibbad〔a〕 |
| 不仲 | 1 | rbs_bad〔a〕 |
| 関係を問わない | 4 | sc_rival、sc_share〔a〕、sc_target〔a〕、sc_hunt |

種類：夜 4・対立 2

R18：夜 4 件：モブ〔合意のない展開〕 2、住人どうし〔条件の印なし〕 2

内容の軸：合意のない展開：2件（題材なので、いつも入）〔表示側：ある・題材（いつも入）〕／妊娠：なし〔表示側：なし・妊娠の場面なし〕／暴力をともなう性描写：なし〔表示側：なし・場面なし〕／歪んだ関係（DV など）：なし〔表示側：なし・スイッチで足す場面なし（関係としては出る）〕／死ネタ：なし／残酷な展開：なし

表（数だけ）：夜の街のハプニング 16件、獲物（モブ） 54件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### 催眠（saimin）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 1 | sm_friend〔a〕 |
| 同僚 | 1 | sm_colleague〔a〕 |
| 兄弟（不仲） | 1 | rbs_sibbad〔a〕 |
| 恩人 | 1 | tns_guilt〔a〕 |
| 執着（ヤンデレ） | 4 | ct_saimin_abuse〔a〕、sm_stalker〔a〕、tns_dep〔a〕、tns_hatelove〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 不仲 | 1 | rbs_bad〔a〕 |
| 敵対 | 2 | sm_grudge〔a〕、tns_hate〔a〕 |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 恋人 | 2 | ct_saimin_abuse〔a〕、sm_lover〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| セフレ | 1 | tns_mistress〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |
| 関係を問わない | 3 | ct_saimin_preg、sm_r18_sex〔a〕、sm_r18_force |

種類：対立 9・交流 6・夜 3・恋愛 2・献身 1

R18：夜 2 件：住人どうし〔合意のない展開〕 1、住人どうし〔条件の印なし〕 1

内容の軸：合意のない展開：1件（スイッチ「合意のない展開」が入のとき）〔表示側：ある・同意のない催眠〕／妊娠：1件（スイッチ「妊娠」が入のとき・重いのときだけ）〔表示側：条件つき・重いのとき〕／暴力をともなう性描写：なし〔表示側：なし・場面なし〕／歪んだ関係（DV など）：1件（スイッチ「歪んだ関係（DV など）」が入のとき・重いのときだけ）〔表示側：条件つき・重いのとき〕／死ネタ：なし／残酷な展開：2件

表（数だけ）：催眠中のハプニング 15件、暗示 37件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### エロバラエティ番組（variety）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 兄弟姉妹 | 1 | vr_kin〔a〕 |
| 兄弟（庇護） | 1 | vr_kin〔a〕 |
| 兄弟（親友のよう） | 1 | vr_kin〔a〕 |
| 兄弟（不仲） | 2 | rbs_sibbad〔a〕、vr_kin〔a〕 |
| 親子 | 1 | vr_kin〔a〕 |
| 擬似親子 | 1 | vr_kin〔a〕 |
| 不仲 | 1 | rbs_bad〔a〕 |
| 関係を問わない | 2 | vr_show〔a〕、vr_penalty |

種類：対立 2・夜 2・交流 1

R18：夜 2 件：住人どうし〔合意のない展開〕 2

内容の軸：合意のない展開：2件（題材なので、いつも入）〔表示側：ある・題材（いつも入）〕／妊娠：なし〔表示側：なし・妊娠の場面なし〕／暴力をともなう性描写：なし〔表示側：なし・場面なし〕／歪んだ関係（DV など）：なし〔表示側：なし・スイッチで足す場面なし（関係としては出る）〕／死ネタ：なし／残酷な展開：なし

表（数だけ）：企画 61件、収録中のハプニング 16件、出演者ごとの出来事 11件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### 媚薬ロッカー（locker）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 同僚 | 2 | lk_r18_ties〔a〕、lk_ties〔a〕 |
| 同級生 | 2 | lk_r18_ties〔a〕、lk_ties〔a〕 |
| 兄弟（不仲） | 1 | rbs_sibbad〔a〕 |
| 親族 | 1 | lk_ties〔a〕 |
| 上司と部下 | 2 | lk_r18_ties〔a〕、lk_ties〔a〕 |
| 恩人 | 3 | lk_r18_ties〔a〕、lk_ties〔a〕、tns_guilt〔a〕 |
| 執着（ヤンデレ） | 2 | tns_dep〔a〕、tns_hatelove〔a〕 |
| 執着（信仰） | 2 | lk_r18_ties〔a〕、lk_ties〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 不仲 | 2 | rbs_bad〔a〕、lk_r18_hate〔a〕 |
| ライバル | 1 | lk_r18_hate〔a〕 |
| 敵対 | 2 | lk_r18_hate〔a〕、tns_hate〔a〕 |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| セフレ | 1 | tns_mistress〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |
| 同一人物 | 1 | ss_same〔a〕 |
| 関係を問わない | 10 | lk_crowd_jeal、lk_crowd_cheer、lk_one、lk_r18_mob ほか |

種類：交流 7・対立 7・夜 7・恋愛 2・脱出 1・献身 1・単独行動 1

R18：夜 7 件：住人どうし〔条件の印なし〕 3、モブ〔合意のない展開〕 1、モブ〔条件の印なし〕 1、住人どうし〔関係：不仲・関係：ライバル・関係：敵対〕 1、住人どうし〔関係：同僚・関係：同級生・関係：上司と部下・関係：恩人・関係：執着（信仰）〕 1

内容の軸：合意のない展開：1件（スイッチ「合意のない展開」が入のとき）〔表示側：ある・群衆に襲われる〕／妊娠：なし〔表示側：なし・妊娠の場面なし〕／暴力をともなう性描写：なし〔表示側：なし・場面なし〕／歪んだ関係（DV など）：なし〔表示側：なし・スイッチで足す場面なし（関係としては出る）〕／死ネタ：なし／残酷な展開：4件

表（数だけ）：仕掛け 6件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### 人狼（jinro）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 1 | jr_love〔a〕 |
| 幼馴染 | 2 | jr_love〔a〕、jr_wolf_close〔a〕 |
| 親友 | 2 | jr_love〔a〕、jr_wolf_close〔a〕 |
| 兄弟（不仲） | 1 | rbs_sibbad〔a〕 |
| 恩人 | 1 | tns_guilt〔a〕 |
| 執着（ヤンデレ） | 3 | os_obsess〔a〕、tns_dep〔a〕、tns_hatelove〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 不仲 | 1 | rbs_bad〔a〕 |
| 敵対 | 2 | jr_love〔a〕、tns_hate〔a〕 |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 恋人 | 2 | jr_love〔a〕、jr_wolf_close〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| セフレ | 2 | jr_wolf_close〔a〕、tns_mistress〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |
| 同一人物 | 1 | ss_same〔a〕 |
| 関係を問わない | 3 | jr_confront、jr_wolf_force、jr_game |

種類：対立 9・交流 5・恋愛 2・夜 2・献身 1

R18：夜 2 件：住人どうし〔合意のない展開〕 1、住人どうし〔関係：幼馴染・関係：親友・関係：恋人・関係：セフレ〕 1

内容の軸：合意のない展開：1件（スイッチ「合意のない展開」が入のとき）〔表示側：条件つき・人狼が勝ったとき〕／妊娠：なし〔表示側：なし・妊娠の場面なし〕／暴力をともなう性描写：なし〔表示側：なし・場面なし〕／歪んだ関係（DV など）：なし〔表示側：なし・スイッチで足す場面なし（関係としては出る）〕／死ネタ：1件／残酷な展開：3件

表（数だけ）：罰ゲーム 11件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

<!-- catalog:full:end -->

<!-- catalog:zenrei:begin -->
## 全年齢版（hakoniwa-zenrei）

箱庭 16 個・出来事 1537 件（同じ出来事が複数の箱庭に出るときは1件）。分類の方法：a 印／b 条件の文字列／d 定義の文字列／c id／- 拾えない（関係を問わない）。

| 箱庭 | 型 | 出来事 | 関係が条件 | 関係を問わない | 死ネタ | 残酷な展開 | 表（数だけ） |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 合コン | エンジン型 | 289 | 113 | 176 | なし | なし | - |
| 出られない部屋 | エンジン型 | 361 | 134 | 227 | 1 | 2 | - |
| クラスメイト | エンジン型 | 300 | 114 | 186 | なし | 1 | - |
| 無人島 | エンジン型 | 366 | 136 | 230 | 2 | 1 | - |
| 宇宙船漂流記 | 物語型 | 20 | 13 | 7 | 5 | 3 | 星の資源 30件、星の生命体 37件、星の文明 30件、船のトラブル 12件、宇宙での遭遇 14件、船を滅ぼすトラブル 6件 |
| バトルロワイヤル | エンジン型 | 282 | 105 | 177 | 8 | 1 | - |
| 裁判デスゲーム | エンジン型 | 280 | 111 | 169 | 1 | 2 | - |
| ゾンビの街 | エンジン型 | 261 | 136 | 125 | 7 | 3 | - |
| 邪神村RTA | 物語型 | 32 | 20 | 12 | 10 | 5 | 神（手がかり・対抗策） 51件、職業の出来事 21件、職業×職業の出来事 14組、役職×役職の特別な出来事（協力・因縁） 180組、祠の効果 7件 |
| 吹雪の館の殺人 | 物語型 | 42 | 22 | 20 | 4 | 5 | 犯人の動機 21件、職業×職業の出来事 14組 |
| オメガバース | エンジン型 | 244 | 147 | 97 | なし | 1 | 職業×職業の出来事 38組 |
| これって本当にマッサージですか？ | 物語型 | 11 | 10 | 1 | なし | 2 | 施術中のハプニング 10件 |
| ダンジョンRPG | 物語型 | 19 | 14 | 5 | 4 | 3 | - |
| 催眠 | 物語型 | 17 | 17 | 0 | なし | 2 | 催眠中のハプニング 12件、暗示 12件 |
| 媚薬ロッカー | 物語型 | 19 | 14 | 5 | なし | 2 | 仕掛け 6件 |
| 人狼 | 物語型 | 17 | 15 | 2 | 1 | 3 | 罰ゲーム 11件 |

### 合コン（goukon）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 同僚 | 2 | tie_colleague〔c〕、tie_colleague2〔b〕 |
| 先輩後輩 | 1 | tie_senpai〔c〕 |
| バディ | 1 | tie_buddy〔c〕 |
| 同級生 | 1 | tie_classmate〔c〕 |
| 兄弟（不仲） | 6 | rb_goukon_sbSpat〔c〕、rb_goukon_sbCompare〔c〕、rb_goukon_sbGrudge〔c〕、rb_goukon_sbDefend〔c〕 ほか |
| 親族 | 1 | tie_relative〔c〕 |
| 上司と部下 | 1 | tie_boss〔c〕 |
| 恩人 | 4 | tie_benefactor〔c〕、tie_nw_gu_refuse〔c〕、tie_nw_gu_obey〔c〕、tie_nw_gu_guilt〔c〕 |
| 片想い | 15 | u_serve〔c〕、u_tri〔c〕、u_protect〔c〕、u_confess〔c〕 ほか |
| 執着（ヤンデレ） | 12 | tie_nw_dep_search〔c〕、tie_nw_dep_check〔c〕、tie_nw_dep_cling〔c〕、tie_nw_dep_worry〔c〕 ほか |
| 執着（信仰） | 1 | tie_worship〔c〕 |
| 一方的な好意・敬愛 | 5 | tie_nw_os_cheer〔c〕、tie_nw_os_gift〔c〕、tie_nw_os_watch〔c〕、tie_nw_os_freeze〔c〕 ほか |
| 盲信 | 2 | tie_nw_blind〔c〕、tie_blind〔c〕 |
| 不仲 | 6 | rb_goukon_bdClash〔c〕、rb_goukon_bdSnark〔c〕、rb_goukon_bdForced〔c〕、rb_goukon_bdCredit〔c〕 ほか |
| 敵対 | 7 | tie_nw_hate_demean〔c〕、tie_nw_hate_trap〔c〕、tie_nw_hate_isolate〔c〕、tie_nw_hate_harm〔c〕 ほか |
| 無関心 | 3 | tie_nw_ap_talk〔c〕、tie_nw_ap_gift〔c〕、tie_nw_ap_other〔c〕 |
| 恐怖 | 5 | tie_nw_fr_avoid〔c〕、tie_nw_fr_freeze〔c〕、tie_nw_fr_obey〔c〕、tie_nw_fr_shelter〔c〕 ほか |
| 恋人 | 2 | grp_cheer〔b〕、grp_bless〔b〕 |
| 夫婦 | 1 | tie_spouse〔c〕 |
| 許嫁 | 6 | tie_nw_fi_eager〔c〕、tie_nw_fi_unsure〔c〕、tie_nw_fi_refuse〔c〕、tie_nw_fi_talk〔c〕 ほか |
| 本命 | 1 | tie_nw_honmei〔c〕 |
| セフレ | 21 | tie_nw_mi_secret〔c〕、tie_nw_mi_found〔c〕、tie_nw_mi_cut〔c〕、tie_nw_mi_noshow〔c〕 ほか |
| 元恋人 | 1 | tie_ly_ex〔c〕 |
| 歪んだ関係 | 1 | tie_abuse〔c〕 |
| 仲間 | 4 | tie_nw_co_help〔c〕、tie_nw_co_cover〔c〕、tie_nw_co_mourn〔c〕、tie_nw_co_together〔c〕 |
| 同一人物 | 3 | attr_mirror_talk〔c〕、attr_mirror_habit〔c〕、attr_mirror_clash〔c〕 |
| 関係を問わない | 176 | talk、tease、care、lecture ほか |

種類：交流 83・対立 71・恋愛 59・献身 43・単独行動 25・ハプニング 7・裏切り 1

内容の軸：死ネタ：なし／残酷な展開：なし

### 出られない部屋（whiteroom）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 2 | tie_rc_whiteroom_friend_blame〔c〕、tie_rc_whiteroom_friend_joke〔c〕 |
| 同僚 | 2 | tie_colleague〔c〕、tie_colleague2〔b〕 |
| 先輩後輩 | 1 | tie_senpai〔c〕 |
| バディ | 1 | tie_buddy〔c〕 |
| 幼馴染 | 2 | tie_rc_whiteroom_childhood_old〔c〕、tie_rc_whiteroom_childhood_sign〔c〕 |
| 同級生 | 1 | tie_classmate〔c〕 |
| 兄弟姉妹 | 2 | tie_rc_whiteroom_sib_bicker〔c〕、tie_rc_whiteroom_sib_back〔c〕 |
| 兄弟（不仲） | 6 | rb_whiteroom_sbSpat〔c〕、rb_whiteroom_sbCompare〔c〕、rb_whiteroom_sbGrudge〔c〕、rb_whiteroom_sbDefend〔c〕 ほか |
| 親族 | 1 | tie_relative〔c〕 |
| 親子 | 2 | tie_rc_whiteroom_parent_worry〔c〕、tie_rc_whiteroom_parent_care〔c〕 |
| 師弟 | 2 | tie_rc_whiteroom_mentor_calm〔c〕、tie_rc_whiteroom_mentor_defy〔c〕 |
| 上司と部下 | 2 | tie_boss〔c〕、rt_keep〔d〕 |
| 恩人 | 5 | tie_benefactor〔c〕、tie_nw_gu_refuse〔c〕、tie_nw_gu_obey〔c〕、tie_nw_gu_guilt〔c〕 ほか |
| 片想い | 15 | u_serve〔c〕、u_tri〔c〕、u_protect〔c〕、u_confess〔c〕 ほか |
| 執着（ヤンデレ） | 12 | tie_nw_dep_search〔c〕、tie_nw_dep_check〔c〕、tie_nw_dep_cling〔c〕、tie_nw_dep_worry〔c〕 ほか |
| 執着（信仰） | 2 | tie_worship〔c〕、rt_keep〔d〕 |
| 一方的な好意・敬愛 | 5 | tie_nw_os_cheer〔c〕、tie_nw_os_gift〔c〕、tie_nw_os_watch〔c〕、tie_nw_os_freeze〔c〕 ほか |
| 盲信 | 2 | tie_nw_blind〔c〕、tie_blind〔c〕 |
| 不仲 | 6 | rb_whiteroom_bdClash〔c〕、rb_whiteroom_bdSnark〔c〕、rb_whiteroom_bdForced〔c〕、rb_whiteroom_bdCredit〔c〕 ほか |
| 敵対 | 7 | tie_nw_hate_demean〔c〕、tie_nw_hate_trap〔c〕、tie_nw_hate_isolate〔c〕、tie_nw_hate_harm〔c〕 ほか |
| 無関心 | 3 | tie_nw_ap_talk〔c〕、tie_nw_ap_gift〔c〕、tie_nw_ap_other〔c〕 |
| 恐怖 | 5 | tie_nw_fr_avoid〔c〕、tie_nw_fr_freeze〔c〕、tie_nw_fr_obey〔c〕、tie_nw_fr_shelter〔c〕 ほか |
| 恋人 | 3 | grp_cheer〔b〕、grp_bless〔b〕、rm_tease〔b〕 |
| 夫婦 | 1 | tie_spouse〔c〕 |
| 許嫁 | 6 | tie_nw_fi_eager〔c〕、tie_nw_fi_unsure〔c〕、tie_nw_fi_refuse〔c〕、tie_nw_fi_talk〔c〕 ほか |
| 本命 | 1 | tie_nw_honmei〔c〕 |
| セフレ | 20 | tie_nw_mi_secret〔c〕、tie_nw_mi_found〔c〕、tie_nw_mi_cut〔c〕、tie_nw_mi_noshow〔c〕 ほか |
| 元恋人 | 3 | tie_ly_ex〔c〕、tie_rc_whiteroom_ex_awk〔c〕、tie_rc_whiteroom_ex_know〔c〕 |
| 歪んだ関係 | 1 | tie_abuse〔c〕 |
| 仲間 | 4 | tie_nw_co_help〔c〕、tie_nw_co_cover〔c〕、tie_nw_co_mourn〔c〕、tie_nw_co_together〔c〕 |
| 同一人物 | 11 | attr_mirror_talk〔c〕、attr_mirror_habit〔c〕、attr_mirror_clash〔c〕、rs_rival〔c〕 ほか |
| 関係を問わない | 227 | talk、tease、care、lecture ほか |

種類：交流 112・対立 76・恋愛 69・献身 52・単独行動 31・ハプニング 9・脱出 8・裏切り 4

内容の軸：死ネタ：1件／残酷な展開：2件

### クラスメイト（classroom）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 2 | tie_rc_classroom_friend_split〔c〕、tie_rc_classroom_friend_study〔c〕 |
| 同僚 | 2 | tie_colleague〔c〕、tie_colleague2〔b〕 |
| 先輩後輩 | 1 | tie_senpai〔c〕 |
| バディ | 1 | tie_buddy〔c〕 |
| 幼馴染 | 2 | tie_rc_classroom_childhood_tease〔c〕、tie_rc_classroom_childhood_always〔c〕 |
| 同級生 | 3 | tie_classmate〔c〕、tie_rc_classroom_classmate_again〔c〕、tie_rc_classroom_classmate_know〔c〕 |
| 兄弟姉妹 | 2 | tie_rc_classroom_sib_bicker〔c〕、tie_rc_classroom_sib_back〔c〕 |
| 兄弟（不仲） | 6 | rb_classroom_sbSpat〔c〕、rb_classroom_sbCompare〔c〕、rb_classroom_sbGrudge〔c〕、rb_classroom_sbDefend〔c〕 ほか |
| 親族 | 1 | tie_relative〔c〕 |
| 親子 | 2 | tie_rc_classroom_parent_meddle〔c〕、tie_rc_classroom_parent_care〔c〕 |
| 師弟 | 2 | tie_rc_classroom_mentor_strict〔c〕、tie_rc_classroom_mentor_proud〔c〕 |
| 上司と部下 | 3 | tie_boss〔c〕、tie_rc_classroom_boss_habit〔c〕、tie_rc_classroom_boss_cover〔c〕 |
| 恩人 | 4 | tie_benefactor〔c〕、tie_nw_gu_refuse〔c〕、tie_nw_gu_obey〔c〕、tie_nw_gu_guilt〔c〕 |
| 片想い | 15 | u_serve〔c〕、u_tri〔c〕、u_protect〔c〕、u_confess〔c〕 ほか |
| 執着（ヤンデレ） | 12 | tie_nw_dep_search〔c〕、tie_nw_dep_check〔c〕、tie_nw_dep_cling〔c〕、tie_nw_dep_worry〔c〕 ほか |
| 執着（信仰） | 1 | tie_worship〔c〕 |
| 一方的な好意・敬愛 | 5 | tie_nw_os_cheer〔c〕、tie_nw_os_gift〔c〕、tie_nw_os_watch〔c〕、tie_nw_os_freeze〔c〕 ほか |
| 盲信 | 2 | tie_nw_blind〔c〕、tie_blind〔c〕 |
| 不仲 | 6 | rb_classroom_bdClash〔c〕、rb_classroom_bdSnark〔c〕、rb_classroom_bdForced〔c〕、rb_classroom_bdCredit〔c〕 ほか |
| 敵対 | 7 | tie_nw_hate_demean〔c〕、tie_nw_hate_trap〔c〕、tie_nw_hate_isolate〔c〕、tie_nw_hate_harm〔c〕 ほか |
| 無関心 | 3 | tie_nw_ap_talk〔c〕、tie_nw_ap_gift〔c〕、tie_nw_ap_other〔c〕 |
| 恐怖 | 5 | tie_nw_fr_avoid〔c〕、tie_nw_fr_freeze〔c〕、tie_nw_fr_obey〔c〕、tie_nw_fr_shelter〔c〕 ほか |
| 恋人 | 2 | grp_cheer〔b〕、grp_bless〔b〕 |
| 夫婦 | 1 | tie_spouse〔c〕 |
| 許嫁 | 6 | tie_nw_fi_eager〔c〕、tie_nw_fi_unsure〔c〕、tie_nw_fi_refuse〔c〕、tie_nw_fi_talk〔c〕 ほか |
| 本命 | 1 | tie_nw_honmei〔c〕 |
| セフレ | 6 | tie_nw_mi_secret〔c〕、tie_nw_mi_found〔c〕、tie_nw_mi_cut〔c〕、tie_nw_mi_noshow〔c〕 ほか |
| 元恋人 | 3 | tie_ly_ex〔c〕、tie_rc_classroom_ex_awk〔c〕、tie_rc_classroom_ex_easy〔c〕 |
| 歪んだ関係 | 1 | tie_abuse〔c〕 |
| 仲間 | 4 | tie_nw_co_help〔c〕、tie_nw_co_cover〔c〕、tie_nw_co_mourn〔c〕、tie_nw_co_together〔c〕 |
| 同一人物 | 3 | attr_mirror_talk〔c〕、attr_mirror_habit〔c〕、attr_mirror_clash〔c〕 |
| 関係を問わない | 186 | talk、tease、care、lecture ほか |

種類：交流 100・対立 72・献身 48・恋愛 41・単独行動 30・ハプニング 7・裏切り 2

内容の軸：死ネタ：なし／残酷な展開：1件

### 無人島（island）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 3 | i_solo_gift〔b〕、tie_rc_island_friend_share〔c〕、tie_rc_island_friend_watch〔c〕 |
| 同僚 | 2 | tie_colleague〔c〕、tie_colleague2〔b〕 |
| 先輩後輩 | 1 | tie_senpai〔c〕 |
| バディ | 1 | tie_buddy〔c〕 |
| 幼馴染 | 2 | tie_rc_island_childhood_reckless〔c〕、tie_rc_island_childhood_beach〔c〕 |
| 同級生 | 3 | tie_classmate〔c〕、tie_rc_island_classmate_rival〔c〕、tie_rc_island_classmate_roll〔c〕 |
| 兄弟姉妹 | 2 | tie_rc_island_sib_food〔c〕、tie_rc_island_sib_storm〔c〕 |
| 兄弟（庇護） | 2 | ir_prebel〔d〕、ir_pcare〔d〕 |
| 兄弟（親友のよう） | 1 | ir_csig〔d〕 |
| 兄弟（不仲） | 6 | rb_island_sbSpat〔c〕、rb_island_sbCompare〔c〕、rb_island_sbGrudge〔c〕、rb_island_sbDefend〔c〕 ほか |
| 親族 | 1 | tie_relative〔c〕 |
| 親子 | 2 | tie_rc_island_parent_stop〔c〕、tie_rc_island_parent_care〔c〕 |
| 教師と生徒 | 2 | ir_lesson〔d〕、ir_scold〔d〕 |
| 師弟 | 3 | ir_train〔d〕、tie_rc_island_mentor_drill〔c〕、tie_rc_island_mentor_stand〔c〕 |
| 上司と部下 | 3 | tie_boss〔c〕、tie_rc_island_boss_rank〔c〕、tie_rc_island_boss_trust〔c〕 |
| 恩人 | 4 | tie_benefactor〔c〕、tie_nw_gu_refuse〔c〕、tie_nw_gu_obey〔c〕、tie_nw_gu_guilt〔c〕 |
| 片想い | 15 | u_serve〔c〕、u_tri〔c〕、u_protect〔c〕、u_confess〔c〕 ほか |
| 執着（ヤンデレ） | 12 | tie_nw_dep_search〔c〕、tie_nw_dep_check〔c〕、tie_nw_dep_cling〔c〕、tie_nw_dep_worry〔c〕 ほか |
| 執着（信仰） | 1 | tie_worship〔c〕 |
| 一方的な好意・敬愛 | 5 | tie_nw_os_cheer〔c〕、tie_nw_os_gift〔c〕、tie_nw_os_watch〔c〕、tie_nw_os_freeze〔c〕 ほか |
| 盲信 | 2 | tie_nw_blind〔c〕、tie_blind〔c〕 |
| 不仲 | 6 | rb_island_bdClash〔c〕、rb_island_bdSnark〔c〕、rb_island_bdForced〔c〕、rb_island_bdCredit〔c〕 ほか |
| ライバル | 1 | i_solo_gift〔b〕 |
| 敵対 | 4 | tie_nw_hate_demean〔c〕、tie_nw_hate_trap〔c〕、tie_nw_hate_isolate〔c〕、tie_nw_hate_harm〔c〕 |
| 無関心 | 3 | tie_nw_ap_talk〔c〕、tie_nw_ap_gift〔c〕、tie_nw_ap_other〔c〕 |
| 恐怖 | 5 | tie_nw_fr_avoid〔c〕、tie_nw_fr_freeze〔c〕、tie_nw_fr_obey〔c〕、tie_nw_fr_shelter〔c〕 ほか |
| 恋人 | 6 | grp_cheer〔b〕、grp_bless〔b〕、il_jealous〔d〕、is_gift〔b〕 ほか |
| 夫婦 | 1 | tie_spouse〔c〕 |
| 許嫁 | 6 | tie_nw_fi_eager〔c〕、tie_nw_fi_unsure〔c〕、tie_nw_fi_refuse〔c〕、tie_nw_fi_talk〔c〕 ほか |
| 本命 | 1 | tie_nw_honmei〔c〕 |
| セフレ | 20 | tie_nw_mi_secret〔c〕、tie_nw_mi_found〔c〕、tie_nw_mi_cut〔c〕、tie_nw_mi_noshow〔c〕 ほか |
| 元恋人 | 3 | tie_ly_ex〔c〕、tie_rc_island_ex_awk〔c〕、tie_rc_island_ex_know〔c〕 |
| 歪んだ関係 | 1 | tie_abuse〔c〕 |
| 仲間 | 4 | tie_nw_co_help〔c〕、tie_nw_co_cover〔c〕、tie_nw_co_mourn〔c〕、tie_nw_co_together〔c〕 |
| 同一人物 | 3 | attr_mirror_talk〔c〕、attr_mirror_habit〔c〕、attr_mirror_clash〔c〕 |
| 関係を問わない | 230 | talk、tease、care、lecture ほか |

種類：交流 98・対立 80・献身 73・恋愛 50・単独行動 38・ハプニング 10・脱出 8・裏切り 6・ハプニング 2・戦闘 1

内容の軸：死ネタ：2件（体力が尽きると死ぬ箱庭（出来事の外でも死が起きる））／残酷な展開：1件

### 宇宙船漂流記（ship）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| バディ | 1 | ship_infect_react〔a〕 |
| 親友 | 1 | ship_infect_react〔a〕 |
| 兄弟姉妹 | 1 | ship_infect_react〔a〕 |
| 親子 | 1 | ship_infect_react〔a〕 |
| 恩人 | 1 | tns_guilt〔a〕 |
| 執着（ヤンデレ） | 4 | os_obsess〔a〕、ship_infect_react〔a〕、tns_dep〔a〕、tns_hatelove〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 敵対 | 1 | tns_hate〔a〕 |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 恋人 | 1 | ship_infect_react〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| 本命 | 1 | ship_infect_react〔a〕 |
| セフレ | 1 | tns_mistress〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |
| 同一人物 | 1 | ss_same〔a〕 |
| 関係を問わない | 7 | ship_after_wipe、ship_special、ship_explore、ship_infect ほか |

種類：交流 6・対立 5・ハプニング 3・献身 2・単独行動 2・恋愛 1・探索 1

内容の軸：死ネタ：5件／残酷な展開：3件

表（数だけ）：星の資源 30件、星の生命体 37件、星の文明 30件、船のトラブル 12件、宇宙での遭遇 14件、船を滅ぼすトラブル 6件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### バトルロワイヤル（br）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 2 | tie_rc_br_friend_doubt〔c〕、tie_rc_br_friend_watch〔c〕 |
| 同僚 | 2 | tie_colleague〔c〕、tie_colleague2〔b〕 |
| 先輩後輩 | 1 | tie_senpai〔c〕 |
| バディ | 1 | tie_buddy〔c〕 |
| 幼馴染 | 2 | tie_rc_br_childhood_lie〔c〕、tie_rc_br_childhood_sign〔c〕 |
| 同級生 | 3 | tie_classmate〔c〕、tie_rc_br_classmate_aim〔c〕、tie_rc_br_classmate_roll〔c〕 |
| 兄弟姉妹 | 2 | tie_rc_br_sib_who〔c〕、tie_rc_br_sib_back〔c〕 |
| 兄弟（不仲） | 6 | rb_br_sbSpat〔c〕、rb_br_sbCompare〔c〕、rb_br_sbGrudge〔c〕、rb_br_sbDefend〔c〕 ほか |
| 親族 | 1 | tie_relative〔c〕 |
| 親子 | 2 | tie_rc_br_parent_shield〔c〕、tie_rc_br_parent_notchild〔c〕 |
| 師弟 | 2 | tie_rc_br_mentor_teach〔c〕、tie_rc_br_mentor_blade〔c〕 |
| 上司と部下 | 3 | tie_boss〔c〕、tie_rc_br_boss_order〔c〕、tie_rc_br_boss_take〔c〕 |
| 恩人 | 4 | tie_benefactor〔c〕、tie_nw_gu_refuse〔c〕、tie_nw_gu_obey〔c〕、tie_nw_gu_guilt〔c〕 |
| 執着（ヤンデレ） | 12 | tie_nw_dep_search〔c〕、tie_nw_dep_check〔c〕、tie_nw_dep_cling〔c〕、tie_nw_dep_worry〔c〕 ほか |
| 執着（信仰） | 1 | tie_worship〔c〕 |
| 一方的な好意・敬愛 | 5 | tie_nw_os_cheer〔c〕、tie_nw_os_gift〔c〕、tie_nw_os_watch〔c〕、tie_nw_os_freeze〔c〕 ほか |
| 盲信 | 2 | tie_nw_blind〔c〕、tie_blind〔c〕 |
| 不仲 | 6 | rb_br_bdClash〔c〕、rb_br_bdSnark〔c〕、rb_br_bdForced〔c〕、rb_br_bdCredit〔c〕 ほか |
| 敵対 | 4 | tie_nw_hate_demean〔c〕、tie_nw_hate_trap〔c〕、tie_nw_hate_isolate〔c〕、tie_nw_hate_harm〔c〕 |
| 無関心 | 3 | tie_nw_ap_talk〔c〕、tie_nw_ap_gift〔c〕、tie_nw_ap_other〔c〕 |
| 恐怖 | 5 | tie_nw_fr_avoid〔c〕、tie_nw_fr_freeze〔c〕、tie_nw_fr_obey〔c〕、tie_nw_fr_shelter〔c〕 ほか |
| 恋人 | 3 | grp_cheer〔b〕、grp_bless〔b〕、lastwords〔d〕 |
| 夫婦 | 1 | tie_spouse〔c〕 |
| 許嫁 | 6 | tie_nw_fi_eager〔c〕、tie_nw_fi_unsure〔c〕、tie_nw_fi_refuse〔c〕、tie_nw_fi_talk〔c〕 ほか |
| 本命 | 1 | tie_nw_honmei〔c〕 |
| セフレ | 14 | tie_nw_mi_secret〔c〕、tie_nw_mi_found〔c〕、tie_nw_mi_cut〔c〕、tie_nw_mi_noshow〔c〕 ほか |
| 元恋人 | 3 | tie_ly_ex〔c〕、tie_rc_br_ex_meet〔c〕、tie_rc_br_ex_trust〔c〕 |
| 歪んだ関係 | 1 | tie_abuse〔c〕 |
| 仲間 | 4 | tie_nw_co_help〔c〕、tie_nw_co_cover〔c〕、tie_nw_co_mourn〔c〕、tie_nw_co_together〔c〕 |
| 同一人物 | 3 | attr_mirror_talk〔c〕、attr_mirror_habit〔c〕、attr_mirror_clash〔c〕 |
| 関係を問わない | 177 | talk、care、lecture、confide ほか |

種類：対立 72・交流 66・単独行動 50・献身 47・恋愛 21・脱出 8・ハプニング 8・裏切り 7・戦闘 3

内容の軸：死ネタ：8件（体力が尽きると死ぬ箱庭（出来事の外でも死が起きる））／残酷な展開：1件

### 裁判デスゲーム（trial）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 2 | tie_rc_trial_friend_vote〔c〕、tie_rc_trial_friend_stay〔c〕 |
| 同僚 | 2 | tie_colleague〔c〕、tie_colleague2〔b〕 |
| 先輩後輩 | 1 | tie_senpai〔c〕 |
| バディ | 1 | tie_buddy〔c〕 |
| 幼馴染 | 2 | tie_rc_trial_childhood_know〔c〕、tie_rc_trial_childhood_sign〔c〕 |
| 同級生 | 3 | tie_classmate〔c〕、tie_rc_trial_classmate_suspect〔c〕、tie_rc_trial_classmate_roll〔c〕 |
| 兄弟姉妹 | 2 | tie_rc_trial_sib_motive〔c〕、tie_rc_trial_sib_guard〔c〕 |
| 兄弟（不仲） | 6 | rb_trial_sbSpat〔c〕、rb_trial_sbCompare〔c〕、rb_trial_sbGrudge〔c〕、rb_trial_sbDefend〔c〕 ほか |
| 親族 | 1 | tie_relative〔c〕 |
| 親子 | 2 | tie_rc_trial_parent_doubt〔c〕、tie_rc_trial_parent_protect〔c〕 |
| 師弟 | 2 | tie_rc_trial_mentor_deduce〔c〕、tie_rc_trial_mentor_refuse〔c〕 |
| 上司と部下 | 3 | tie_boss〔c〕、tie_rc_trial_boss_speak〔c〕、tie_rc_trial_boss_cover〔c〕 |
| 恩人 | 4 | tie_benefactor〔c〕、tie_nw_gu_refuse〔c〕、tie_nw_gu_obey〔c〕、tie_nw_gu_guilt〔c〕 |
| 執着（ヤンデレ） | 12 | tie_nw_dep_search〔c〕、tie_nw_dep_check〔c〕、tie_nw_dep_cling〔c〕、tie_nw_dep_worry〔c〕 ほか |
| 執着（信仰） | 1 | tie_worship〔c〕 |
| 一方的な好意・敬愛 | 5 | tie_nw_os_cheer〔c〕、tie_nw_os_gift〔c〕、tie_nw_os_watch〔c〕、tie_nw_os_freeze〔c〕 ほか |
| 盲信 | 2 | tie_nw_blind〔c〕、tie_blind〔c〕 |
| 不仲 | 6 | rb_trial_bdClash〔c〕、rb_trial_bdSnark〔c〕、rb_trial_bdForced〔c〕、rb_trial_bdCredit〔c〕 ほか |
| 敵対 | 4 | tie_nw_hate_demean〔c〕、tie_nw_hate_trap〔c〕、tie_nw_hate_isolate〔c〕、tie_nw_hate_harm〔c〕 |
| 無関心 | 3 | tie_nw_ap_talk〔c〕、tie_nw_ap_gift〔c〕、tie_nw_ap_other〔c〕 |
| 恐怖 | 5 | tie_nw_fr_avoid〔c〕、tie_nw_fr_freeze〔c〕、tie_nw_fr_obey〔c〕、tie_nw_fr_shelter〔c〕 ほか |
| 恋人 | 2 | grp_cheer〔b〕、grp_bless〔b〕 |
| 夫婦 | 1 | tie_spouse〔c〕 |
| 許嫁 | 6 | tie_nw_fi_eager〔c〕、tie_nw_fi_unsure〔c〕、tie_nw_fi_refuse〔c〕、tie_nw_fi_talk〔c〕 ほか |
| 本命 | 1 | tie_nw_honmei〔c〕 |
| セフレ | 21 | tie_nw_mi_secret〔c〕、tie_nw_mi_found〔c〕、tie_nw_mi_cut〔c〕、tie_nw_mi_noshow〔c〕 ほか |
| 元恋人 | 3 | tie_ly_ex〔c〕、tie_rc_trial_ex_alibi〔c〕、tie_rc_trial_ex_trust〔c〕 |
| 歪んだ関係 | 1 | tie_abuse〔c〕 |
| 仲間 | 4 | tie_nw_co_help〔c〕、tie_nw_co_cover〔c〕、tie_nw_co_mourn〔c〕、tie_nw_co_together〔c〕 |
| 同一人物 | 3 | attr_mirror_talk〔c〕、attr_mirror_habit〔c〕、attr_mirror_clash〔c〕 |
| 関係を問わない | 169 | talk、tease、care、lecture ほか |

種類：交流 82・対立 68・献身 46・単独行動 35・恋愛 27・裏切り 11・脱出 10・死亡 1

内容の軸：死ネタ：1件（体力が尽きると死ぬ箱庭（出来事の外でも死が起きる））／残酷な展開：2件

### ゾンビの街（zombie）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 2 | tie_rc_zombie_friend_leave〔c〕、tie_rc_zombie_friend_cheer〔c〕 |
| 同僚 | 3 | tie_colleague〔c〕、tie_colleague2〔b〕、zb_colleague〔c〕 |
| 先輩後輩 | 1 | tie_senpai〔c〕 |
| バディ | 1 | tie_buddy〔c〕 |
| 幼馴染 | 2 | tie_rc_zombie_childhood_again〔c〕、tie_rc_zombie_childhood_sign〔c〕 |
| 同級生 | 2 | tie_classmate〔c〕、zb_classmate〔c〕 |
| 親友 | 1 | zb_cure〔a〕 |
| 兄弟姉妹 | 3 | tie_rc_zombie_sib_split〔c〕、tie_rc_zombie_sib_back〔c〕、zb_cure〔a〕 |
| 兄弟（不仲） | 6 | rb_zombie_sbSpat〔c〕、rb_zombie_sbCompare〔c〕、rb_zombie_sbGrudge〔c〕、rb_zombie_sbDefend〔c〕 ほか |
| 親族 | 2 | tie_relative〔c〕、zb_relative〔c〕 |
| 親子 | 4 | tie_rc_zombie_parent_shield〔c〕、tie_rc_zombie_parent_guard〔c〕、tie_rc_zombie_parent_fight〔c〕、zb_cure〔a〕 |
| 教師と生徒 | 1 | zr_scold〔b〕 |
| 上司と部下 | 2 | tie_boss〔c〕、zb_boss〔c〕 |
| 恩人 | 5 | tie_benefactor〔c〕、tie_nw_gu_refuse〔c〕、tie_nw_gu_obey〔c〕、tie_nw_gu_guilt〔c〕 ほか |
| 片想い | 16 | z_cr_guard〔b〕、u_serve〔c〕、u_tri〔c〕、u_protect〔c〕 ほか |
| 執着（ヤンデレ） | 16 | tie_nw_dep_search〔c〕、tie_nw_dep_check〔c〕、tie_nw_dep_cling〔c〕、tie_nw_dep_worry〔c〕 ほか |
| 執着（信仰） | 2 | tie_worship〔c〕、zb_worship〔c〕 |
| 一方的な好意・敬愛 | 5 | tie_nw_os_cheer〔c〕、tie_nw_os_gift〔c〕、tie_nw_os_watch〔c〕、tie_nw_os_freeze〔c〕 ほか |
| 盲信 | 2 | tie_nw_blind〔c〕、tie_blind〔c〕 |
| 不仲 | 6 | rb_zombie_bdClash〔c〕、rb_zombie_bdSnark〔c〕、rb_zombie_bdForced〔c〕、rb_zombie_bdCredit〔c〕 ほか |
| 敵対 | 7 | tie_nw_hate_demean〔c〕、tie_nw_hate_trap〔c〕、tie_nw_hate_isolate〔c〕、tie_nw_hate_harm〔c〕 ほか |
| 無関心 | 3 | tie_nw_ap_talk〔c〕、tie_nw_ap_gift〔c〕、tie_nw_ap_other〔c〕 |
| 恐怖 | 5 | tie_nw_fr_avoid〔c〕、tie_nw_fr_freeze〔c〕、tie_nw_fr_obey〔c〕、tie_nw_fr_shelter〔c〕 ほか |
| 恋人 | 10 | grp_cheer〔b〕、grp_bless〔b〕、z_last〔d〕、z_confess〔d〕 ほか |
| 夫婦 | 1 | tie_spouse〔c〕 |
| 許嫁 | 6 | tie_nw_fi_eager〔c〕、tie_nw_fi_unsure〔c〕、tie_nw_fi_refuse〔c〕、tie_nw_fi_talk〔c〕 ほか |
| 本命 | 1 | tie_nw_honmei〔c〕 |
| セフレ | 13 | tie_nw_mi_secret〔c〕、tie_nw_mi_found〔c〕、tie_nw_mi_cut〔c〕、tie_nw_mi_noshow〔c〕 ほか |
| 元恋人 | 3 | tie_ly_ex〔c〕、tie_rc_zombie_ex_awk〔c〕、tie_rc_zombie_ex_trust〔c〕 |
| 歪んだ関係 | 1 | tie_abuse〔c〕 |
| 仲間 | 4 | tie_nw_co_help〔c〕、tie_nw_co_cover〔c〕、tie_nw_co_mourn〔c〕、tie_nw_co_together〔c〕 |
| 同一人物 | 3 | attr_mirror_talk〔c〕、attr_mirror_habit〔c〕、attr_mirror_clash〔c〕 |
| 関係を問わない | 125 | talk、care、confide、jealous ほか |

種類：対立 59・交流 58・献身 53・単独行動 46・恋愛 32・ハプニング 7・戦闘 3・裏切り 2・ハプニング 1

内容の軸：死ネタ：7件（体力が尽きると死ぬ箱庭（出来事の外でも死が起きる））／残酷な展開：3件

### 邪神村RTA（jashin）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 1 | js_rel〔a〕 |
| 同僚 | 1 | js_rel〔a〕 |
| 先輩後輩 | 1 | js_rel〔a〕 |
| バディ | 1 | js_rel〔a〕 |
| 幼馴染 | 1 | js_rel〔a〕 |
| 同級生 | 1 | js_rel〔a〕 |
| 友達以上恋人未満 | 1 | js_rel〔a〕 |
| 親友 | 1 | js_rel〔a〕 |
| 兄弟姉妹 | 1 | js_rel〔a〕 |
| 兄弟（庇護） | 1 | js_rel〔a〕 |
| 兄弟（親友のよう） | 1 | js_rel〔a〕 |
| 兄弟（不仲） | 2 | js_rel〔a〕、rbs_sibbad〔a〕 |
| 親族 | 1 | js_rel〔a〕 |
| 親子 | 1 | js_rel〔a〕 |
| 擬似親子 | 2 | js_pparent〔a〕、js_rel〔a〕 |
| 教師と生徒 | 1 | js_rel〔a〕 |
| 師弟 | 1 | js_rel〔a〕 |
| 上司と部下 | 1 | js_rel〔a〕 |
| 恩人 | 1 | tns_guilt〔a〕 |
| 執着（ヤンデレ） | 4 | js_hatelove〔a〕、os_obsess〔a〕、tns_dep〔a〕、tns_hatelove〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 不仲 | 1 | rbs_bad〔a〕 |
| ライバル | 1 | js_feud〔a〕 |
| 敵対 | 4 | js_feud〔a〕、js_hate〔a〕、js_rel〔a〕、tns_hate〔a〕 |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 恋人 | 2 | js_love〔a〕、js_rel〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| セフレ | 2 | js_rel〔a〕、tns_mistress〔a〕 |
| 運命の番 | 1 | js_rel〔a〕 |
| 番 | 1 | js_rel〔a〕 |
| 主従 | 1 | js_rel〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |
| 同一人物 | 1 | ss_same〔a〕 |
| 関係を問わない | 12 | js_cave、js_drama、js_betray、js_feast ほか |

種類：対立 10・交流 8・ハプニング 4・単独行動 3・裏切り 2・献身 2・恋愛 2・戦闘 1

内容の軸：死ネタ：10件／残酷な展開：5件

表（数だけ）：神（手がかり・対抗策） 51件、職業の出来事 21件、職業×職業の出来事 14組（職業×職業）、役職×役職の特別な出来事（協力・因縁） 180組（職業×職業）、祠の効果 7件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### 吹雪の館の殺人（yakata）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 親友 | 1 | mercy〔a〕 |
| 兄弟姉妹 | 2 | insurance〔a〕、mercy〔a〕 |
| 兄弟（不仲） | 1 | rbs_sibbad〔a〕 |
| 親子 | 2 | insurance〔a〕、mercy〔a〕 |
| 恩人 | 1 | tns_guilt〔a〕 |
| 片想い | 2 | jealous〔a〕、obsess〔a〕 |
| 執着（ヤンデレ） | 4 | os_obsess〔a〕、tns_dep〔a〕、tns_hatelove〔a〕、yk_hatelove〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 不仲 | 1 | rbs_bad〔a〕 |
| ライバル | 2 | yk_feud〔a〕、jealous〔a〕 |
| 敵対 | 4 | tns_hate〔a〕、yk_feud〔a〕、yk_hate〔a〕、revenge〔a〕 |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 恋人 | 2 | insurance〔a〕、mercy〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| セフレ | 2 | tns_mistress〔a〕、insurance〔a〕 |
| 元恋人 | 2 | jealous〔a〕、obsess〔a〕 |
| 番 | 2 | insurance〔a〕、mercy〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |
| 同一人物 | 1 | ss_same〔a〕 |
| 関係を問わない | 20 | yk_special、yk_murder、yk_detect、yk_end ほか |

種類：謎解き 22・対立 10・交流 5・死亡 1・献身 1・恋愛 1・単独行動 1・ハプニング 1

内容の軸：死ネタ：4件／残酷な展開：5件

表（数だけ）：犯人の動機 21件、職業×職業の出来事 14組（職業×職業）

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### オメガバース（omega）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 2 | tie_rc_omega_friend_meddle〔c〕、tie_rc_omega_friend_cover〔c〕 |
| 同僚 | 5 | tie_colleague〔c〕、tie_colleague2〔b〕、om_tie_colleague〔c〕、om_tiekeep_colleague〔c〕 ほか |
| 先輩後輩 | 1 | tie_senpai〔c〕 |
| バディ | 1 | tie_buddy〔c〕 |
| 幼馴染 | 2 | tie_rc_omega_childhood_test〔c〕、tie_rc_omega_childhood_stay〔c〕 |
| 同級生 | 4 | tie_classmate〔c〕、om_tie_classmate〔c〕、om_tiekeep_classmate〔c〕、om_tiegrow_classmate〔c〕 |
| 兄弟姉妹 | 2 | tie_rc_omega_sib_bicker〔c〕、tie_rc_omega_sib_guard〔c〕 |
| 兄弟（不仲） | 6 | rb_omega_sbSpat〔c〕、rb_omega_sbCompare〔c〕、rb_omega_sbGrudge〔c〕、rb_omega_sbDefend〔c〕 ほか |
| 親族 | 4 | tie_relative〔c〕、om_tie_relative〔c〕、om_tiekeep_relative〔c〕、om_tiegrow_relative〔c〕 |
| 親子 | 2 | tie_rc_omega_parent_worry〔c〕、tie_rc_omega_parent_care〔c〕 |
| 師弟 | 2 | tie_rc_omega_mentor_teach〔c〕、tie_rc_omega_mentor_defy〔c〕 |
| 上司と部下 | 4 | tie_boss〔c〕、om_tie_boss〔c〕、om_tiekeep_boss〔c〕、om_tiegrow_boss〔c〕 |
| 恩人 | 7 | tie_benefactor〔c〕、tie_nw_gu_refuse〔c〕、tie_nw_gu_obey〔c〕、tie_nw_gu_guilt〔c〕 ほか |
| 執着（ヤンデレ） | 12 | tie_nw_dep_search〔c〕、tie_nw_dep_check〔c〕、tie_nw_dep_cling〔c〕、tie_nw_dep_worry〔c〕 ほか |
| 執着（信仰） | 4 | tie_worship〔c〕、om_tie_worship〔c〕、om_tiekeep_worship〔c〕、om_tiegrow_worship〔c〕 |
| 一方的な好意・敬愛 | 5 | tie_nw_os_cheer〔c〕、tie_nw_os_gift〔c〕、tie_nw_os_watch〔c〕、tie_nw_os_freeze〔c〕 ほか |
| 盲信 | 2 | tie_nw_blind〔c〕、tie_blind〔c〕 |
| 不仲 | 6 | rb_omega_bdClash〔c〕、rb_omega_bdSnark〔c〕、rb_omega_bdForced〔c〕、rb_omega_bdCredit〔c〕 ほか |
| ライバル | 1 | om_rival〔c〕 |
| 敵対 | 7 | tie_nw_hate_demean〔c〕、tie_nw_hate_trap〔c〕、tie_nw_hate_isolate〔c〕、tie_nw_hate_harm〔c〕 ほか |
| 無関心 | 3 | tie_nw_ap_talk〔c〕、tie_nw_ap_gift〔c〕、tie_nw_ap_other〔c〕 |
| 恐怖 | 5 | tie_nw_fr_avoid〔c〕、tie_nw_fr_freeze〔c〕、tie_nw_fr_obey〔c〕、tie_nw_fr_shelter〔c〕 ほか |
| 恋人 | 18 | grp_cheer〔b〕、grp_bless〔b〕、om_night〔b〕、om_amagami〔b〕 ほか |
| 夫婦 | 1 | tie_spouse〔c〕 |
| 許嫁 | 6 | tie_nw_fi_eager〔c〕、tie_nw_fi_unsure〔c〕、tie_nw_fi_refuse〔c〕、tie_nw_fi_talk〔c〕 ほか |
| 本命 | 1 | tie_nw_honmei〔c〕 |
| セフレ | 20 | tie_nw_mi_secret〔c〕、tie_nw_mi_found〔c〕、tie_nw_mi_cut〔c〕、tie_nw_mi_noshow〔c〕 ほか |
| 元恋人 | 3 | tie_ly_ex〔c〕、tie_rc_omega_ex_scent〔c〕、tie_rc_omega_ex_care〔c〕 |
| 歪んだ関係 | 1 | tie_abuse〔c〕 |
| 運命の番 | 2 | om_fated_waver〔c〕、om_fated_realize〔c〕 |
| 仲間 | 4 | tie_nw_co_help〔c〕、tie_nw_co_cover〔c〕、tie_nw_co_mourn〔c〕、tie_nw_co_together〔c〕 |
| 同一人物 | 4 | attr_mirror_talk〔c〕、attr_mirror_habit〔c〕、attr_mirror_clash〔c〕、om_same〔c〕 |
| 関係を問わない | 97 | talk、tease、care、lecture ほか |

種類：交流 81・対立 66・恋愛 45・献身 30・単独行動 15・ハプニング 6・裏切り 1

内容の軸：死ネタ：なし／残酷な展開：1件

表（数だけ）：職業×職業の出来事 38組（職業×職業）（JOB_PAIR_RULES の26組（omega-jobs-pair2.js）を含む）

### これって本当にマッサージですか？（massage）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 恩人 | 1 | tns_guilt〔a〕 |
| 執着（ヤンデレ） | 2 | tns_dep〔a〕、tns_hatelove〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 敵対 | 1 | tns_hate〔a〕 |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| セフレ | 1 | tns_mistress〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |
| 関係を問わない | 1 | ms_treat |

種類：交流 4・対立 4・献身 1・恋愛 1・単独行動 1

内容の軸：死ネタ：なし／残酷な展開：2件

表（数だけ）：施術中のハプニング 10件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### ダンジョンRPG（rpg）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 兄弟（不仲） | 1 | rbs_sibbad〔a〕 |
| 恩人 | 1 | tns_guilt〔a〕 |
| 執着（ヤンデレ） | 3 | os_obsess〔a〕、tns_dep〔a〕、tns_hatelove〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 不仲 | 1 | rbs_bad〔a〕 |
| 敵対 | 1 | tns_hate〔a〕 |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| セフレ | 1 | tns_mistress〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |
| 同一人物 | 1 | ss_same〔a〕 |
| 関係を問わない | 5 | rpg_special、rpg_floor、rpg_boss、rpg_event ほか |

種類：対立 7・交流 5・ハプニング 2・戦闘 1・献身 1・恋愛 1・単独行動 1・探索 1

内容の軸：死ネタ：4件／残酷な展開：3件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### 催眠（saimin）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 1 | sm_friend〔a〕 |
| 同僚 | 1 | sm_colleague〔a〕 |
| 兄弟（不仲） | 1 | rbs_sibbad〔a〕 |
| 恩人 | 1 | tns_guilt〔a〕 |
| 執着（ヤンデレ） | 3 | sm_stalker〔a〕、tns_dep〔a〕、tns_hatelove〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 不仲 | 1 | rbs_bad〔a〕 |
| 敵対 | 2 | sm_grudge〔a〕、tns_hate〔a〕 |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 恋人 | 1 | sm_lover〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| セフレ | 1 | tns_mistress〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |

種類：対立 8・交流 6・恋愛 2・献身 1

内容の軸：死ネタ：なし／残酷な展開：2件

表（数だけ）：催眠中のハプニング 12件、暗示 12件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### 媚薬ロッカー（locker）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 同僚 | 1 | lk_ties〔a〕 |
| 同級生 | 1 | lk_ties〔a〕 |
| 兄弟（不仲） | 1 | rbs_sibbad〔a〕 |
| 親族 | 1 | lk_ties〔a〕 |
| 上司と部下 | 1 | lk_ties〔a〕 |
| 恩人 | 2 | lk_ties〔a〕、tns_guilt〔a〕 |
| 執着（ヤンデレ） | 2 | tns_dep〔a〕、tns_hatelove〔a〕 |
| 執着（信仰） | 1 | lk_ties〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 不仲 | 1 | rbs_bad〔a〕 |
| 敵対 | 1 | tns_hate〔a〕 |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| セフレ | 1 | tns_mistress〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |
| 同一人物 | 1 | ss_same〔a〕 |
| 関係を問わない | 5 | lk_crowd_jeal、lk_crowd_cheer、lk_one、lk_escape ほか |

種類：交流 7・対立 7・恋愛 2・脱出 1・献身 1・単独行動 1

内容の軸：死ネタ：なし／残酷な展開：2件

表（数だけ）：仕掛け 6件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

### 人狼（jinro）

| 関係 | 件数 | 主な出来事 |
| --- | --- | --- |
| 友人 | 1 | jr_love〔a〕 |
| 幼馴染 | 1 | jr_love〔a〕 |
| 親友 | 1 | jr_love〔a〕 |
| 兄弟（不仲） | 1 | rbs_sibbad〔a〕 |
| 恩人 | 1 | tns_guilt〔a〕 |
| 執着（ヤンデレ） | 3 | os_obsess〔a〕、tns_dep〔a〕、tns_hatelove〔a〕 |
| 一方的な好意・敬愛 | 1 | tns_oshi〔a〕 |
| 不仲 | 1 | rbs_bad〔a〕 |
| 敵対 | 2 | jr_love〔a〕、tns_hate〔a〕 |
| 無関心 | 1 | tns_apathy〔a〕 |
| 恐怖 | 1 | tns_fear〔a〕 |
| 恋人 | 1 | jr_love〔a〕 |
| 許嫁 | 1 | tns_fiance〔a〕 |
| セフレ | 1 | tns_mistress〔a〕 |
| 仲間 | 1 | tns_comrade〔a〕 |
| 同一人物 | 1 | ss_same〔a〕 |
| 関係を問わない | 2 | jr_confront、jr_game |

種類：対立 9・交流 5・恋愛 2・献身 1

内容の軸：死ネタ：1件／残酷な展開：3件

表（数だけ）：罰ゲーム 11件

物語型：場面は関数で書かれていて、印（@event／@event-table）の付いたものだけを数えています。印の無い手書きの場面は入っていません。

<!-- catalog:zenrei:end -->
