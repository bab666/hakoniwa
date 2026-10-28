/* 箱庭シミュレーター: 媚薬ロッカー（R18版のみ）― 主従の「命令」・家族の「立場」・恋人の照れの型（HK.TieOrder）をつなぐ（2026-10-28 担当LJ）
   tie-order-r18.js（HK.TieOrder）を、locker-tie-more-r18.js のつなぎ口（LK.TIES2_R18.hesHook／introHook）と、solo-locker.js の扉が開いたあとに差し込む。
   ■ 二人の夜の型は locker-tie-more-r18.js と同じ（LK.TIES2_R18.groupOf：関係の強い順で最初に型に入る関係）
     master（主従）：扉が開いてベッドへ行く前に、主の命令の型を決める（LK.bedGate。solo-locker.js が呼ぶ）。
       合意（従の反応 mutual／cling／obey／defy／cond／free）→ ベッドの誘いの段を、主の命令とその反応（scene の open）に差し替え（LK.bed の o.lead）、
         ためらいの段は命令のあとの一文（BRIDGE）に。山場は既存の LK.bed のまま。事後の段の終わりに命令の結び（scene の after）。
         主が攻めなら「命令だ、私に抱かれろ」（take）、従が攻めなら「私を抱け」（give）。ベッドの攻め（HK.Pos.order）に合わせる
       通らない（refuse 対等に近い主従が笑って断る／decline 従が望まず主が引く／rebuff 仲が険悪で撥ねつける。物語型なので rebel は rebuff）
         → その場面だけを書いて、ベッドへ行かない（solo-locker.js の「起きない」流れ）
       命令でねじ伏せる（obeyF など。内容のスイッチ「合意のない展開」が入・HK.Pos.forceOn・HK.Pos.okForce・主が攻めに回れる組・従が主を想っていない組）
         → ベッドの代わりに HK.TieOrder.forceBody の一場面（理由に HK.Pos.FORCE_MARK）
       ロッカーの中で繋がったとき（LK.TIES2.r18Act）：主の命令の短い一言を一度だけ（IN_CMD。主が攻め／受けで書き分け、態度9種）
       solo-locker.js の「主の許し」（SV.order）とは同じ回に重ねない（pair.svOrd が立っていれば命令の型を出さず、命令の型を出したら pair.toOrd で主の許しを止める）
     fam（家族。「恋愛：あり」の組だけ＝HK.TieOrder.famOk）：立場の型。push（上が立場で押す）／plead（下が家族を持ち出してねだる）→ 戸惑いつつ受け入れる（誘いの段に）。
       deny（片方だけが想っている）→ 想われた側が家族の暮らしを理由に拒み、その夜は起きない
     love（恋人・夫婦・許嫁・番・運命の番）：locker-tie-more-r18.js の照れの一言（ためらいの段）はそのままに、
       導入の段に HK.TieOrder.react(…,'auto') の一言を一本足す（照れの一言と別の人が話す。照れの一言と同じ言葉＝カメラ／恥ずかしいが重なれば、もう一方の向き（cam⇔shy）に。それでも重なれば足さない）
   ■ ベッドの条件を満たさなかった夜にも（2026-10-28 担当LK。利用者の要望「出やすくしてください。ベッドに行く条件じゃなくても実施するルートがあるべき」）
     solo-locker.js は、扉が開いたあとベッドへ行かない回にも LK.bedGate を呼ぶ（o.bed が偽）。返り値 'bed'＝ベッドへ（命令・立場から始まる夜／ねじ伏せる夜）、'no'＝場面だけ（ベッドへ行かない）、''＝何もしない
       主従：主の発情が 50 以上（主の性欲が「強い」なら 40 以上）か主が企んだ人なら、主が命じる（従の発情は問わない。起きる見込みは主の発情・性欲・企みで上がる）。
         従の発情が 25 未満なら惹かれを 20 までにして（合意の型にしない）、通らなければ断る・撥ねつける、合意のない展開が入ならねじ伏せる。
         従が主を想っている組（片想い・本命・恋人など、従の側から）は、ねじ伏せない（断る場面に）
       家族（恋愛：あり）：片方だけが惹かれていれば拒む（deny）場面、二人とも惹かれていれば立場の夜（見込み 6 割）
       時間切れの扉でまだ繋がったままの二人・ロッカーの中で最後までした二人・三人以上の回は通らない。企んだ人が拒む側になる組は、拒む場面にしない
     ロッカーの中（LK.inGate。solo-locker.js が主の番に呼ぶ）：従が 2 回以上耐えていて（主に手を出していない）、主の発情が 70 以上で、まだ二人の間に何も起きていないとき、主が命令で押し切る（一度だけ見て、見込み 6 割）。
       従が乗るなら何もしない（solo-locker.js の「主の許し」に任せる）。合意のない展開が入でねじ伏せられる組なら、主が従をロッカーの壁に押さえつけ、
       扉が開いたらそのままベッドで続ける（pair.toPlan.inLk。ロッカーの中では、それ以上は誰も手を出さない＝pair.rest）。通らなければ、従が狭いロッカーの中で撥ねつける・断る（そのあとロッカーの中では手を出さず、扉が開いてもベッドへ行かない）
     結末の欄：従者は FATE、主・家族の二人は FATE_U（p.toFateU。企んだ主がねじ伏せたときも「相手をモノにした」にしない）
   ■ 惹かれ（opt.fond）と好意（opt.aff）：ロッカーには数値の好意がないので、ロッカーの中の値から作る（2026-10-28 担当LK が見直し）。
     惹かれ＝体の熱（発情×0.36×性欲の倍率（弱い 0.6・強い 1.15）＋応じた回数×6＋仕掛けた回数×5−嗜めた回数×10−CP×10−残った理性×0.2。0〜45）
       ＋関係（恋人・番・友達以上・セフレ、想う側の片想い・本命・信仰・盲信・執着・慕う：+35、仲 良い +5／険悪 -25）。発情 25 以上で想っている人は 45 から、発情 25 未満の人は 20 まで
       ベッドの条件を満たした夜（二人とも発情 60 以上で、一度は応じた）は、主従 +10・家族 +4。家族の立場の夜は、二人とも惹かれ 42 以上（opt.like）
     好意＝40＋関係（同じ）。発情が限界（90 以上）で理性が尽き、性欲が「弱い」でない人は、夜に乗れる（opt.willing。主従だけ。家族の線は、惹かれのない人は越えない）。発情 25 未満の人は好意も 60 まで
   ■ 乱数は S.rng。起きるかどうかは peek（乱数を使わない）で見てから、本番の plan を引く
   ■ 文の決まり：台詞は3本「くだけた常体｜硬い常体｜敬語」（一人称は「私」、二人称は「あなた」）。登場人物はすべて成人として扱う。全年齢版にはこのファイルはない */
/* 出来事の一覧の印（hakoniwa-tools/build/event-catalog.js が数える。決まりは docs/reports/2026-10-28/event-catalog.md） */
/* @event scen=locker id=lk_to_master cat=夜 tie=master tags=night label=主の命令で始まる夜（抱け・抱かれろ） */
/* @event scen=locker id=lk_to_master_no cat=conflict tie=master label=主の命令が通らない（断る・撥ねつける） */
/* @event scen=locker id=lk_to_master_force cat=夜 tie=master tags=night,force label=主が命令で従の抵抗をねじ伏せる */
/* @event scen=locker id=lk_to_master_in cat=夜 tie=master tags=night label=ロッカーの中で主が命じる一言 */
/* @event scen=locker id=lk_to_fam cat=夜 tie=sibling,sibprot,sibclose,sibbad,relative,parent,pparent tags=night label=家族の立場で押す・ねだる夜 */
/* @event scen=locker id=lk_to_fam_deny cat=conflict tie=sibling,sibprot,sibclose,sibbad,relative,parent,pparent label=家族の一線を越えようとして拒まれる */
/* @event scen=locker id=lk_to_master_inforce cat=夜 tie=master tags=night,force label=ロッカーの中で主が命令で従を押さえつける */
/* @event scen=locker id=lk_to_master_inno cat=conflict tie=master label=ロッカーの中で主の命令を従が撥ねつける */
/* @event scen=locker id=lk_to_love cat=夜 tie=lover,fiance,mate,fated tags=night label=恋人が場所に照れる・警戒する一言 */
(function () {
  'use strict';
  var HK = window.HK, LK = HK.LOCKER, ST = HK.Story;
  if (!LK || !LK.bed || !LK.TIES2 || !LK.TIES2_R18 || !ST) return;
  var R18 = LK.TIES2_R18;
  function TO() { return HK.TieOrder; }
  function L(s) { return s.split('|'); }
  function P9(o) { var r = {}; for (var k in o) r[k] = L(o[k]); return r; }
  var PS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function ps(c) { var p = HK.personaOf ? HK.personaOf(c) : c.persona; return PS.indexOf(p) >= 0 ? p : 'gentle'; }
  function pick(S, arr) { return LK.pick(S, arr); }
  function clamp(v) { return Math.max(0, Math.min(100, v)); }
  /* 点検・計測用の記録（道具が HK.LockerTOLog = [] を置いたときだけ） */
  function note(k, p) { if (HK.LockerTOLog) HK.LockerTOLog.push({ k: k, type: p ? p.type : '', kind: p ? p.kind : '', react: p ? p.react || '' : '' }); }

  /* ---------- 場所の語（扉が開いたあとの部屋。{paper} は「媚薬のせいにしよう」の媚薬） ---------- */
  var PL_BED = { room: 'ガスの残る部屋', door: '部屋の扉', paper: '媚薬', bed: 'ベッド', here: 'この部屋' };
  var PL_LOVE = { room: 'この部屋', door: '部屋の扉', paper: '媚薬', bed: 'ベッド', here: 'この部屋' };
  var PL_IN = { room: 'ロッカー', door: 'ロッカーの扉', paper: '媚薬', bed: 'ベッド', here: 'このロッカー' };

  /* ---------- 命令・立場のあとの一文（ためらいの段。地の文。{u}＝主・上、{l}＝従・下） ---------- */
  var BRIDGE = {
    take: L('命じた声の余韻が消えないうちに、主と従者の線は、その夜だけ脇へ置かれた。|{u}の手つきは、命じたときの声よりも、ずっと静かだった。|{l}は、命令の言葉を胸の中で繰り返しながら、{u}に身を預けた。'),
    give: L('命じられたとおりに、{l}は主に触れた。その手が震えていることに、{u}だけが気づいていた。|主を抱く日が来るとは、{l}は思ってもいなかった。命令が、その最後の迷いを消した。|{u}は{l}の首に腕を回し、命令の続きを目だけで伝えた。'),
    stand: L('家族の顔は、もう二人のどちらにも残っていなかった。|子どものころから知っている手が、知らない熱を帯びていた。|ためらいは、家族として過ごした年月の分だけ長かった。それでも、二人は手を離さなかった。')
  };
  /* ---------- ロッカーの中の主の命令の一言（「」の中身。take＝主が攻め、give＝主が受け。主の態度9種） ---------- */
  var IN_CMD = {
    take: P9({
      proud: '声を殺して。これは命令｜声を殺せ。これは命令だ｜声を殺しなさい。これは命令です|……私だけを見て。命令だよ｜……私だけを見ろ。命令だ｜……私だけを見なさい。命令です',
      stern: '動かないで。私が許すまで｜動くな。私が許すまで｜動かないでください。私が許すまで|声を出さないで。外に聞こえる｜声を出すな。外に聞こえる｜声を出さないでください。外に聞こえます',
      tsun: 'め、命令だから。……我慢しないで｜め、命令だ。……我慢するな｜め、命令です。……我慢しないでください|か、勘違いしないで。命令だから、こうしてるの｜か、勘違いするな。命令だから、こうしているんだ｜か、勘違いなさらないで。命令だから、こうしているんです',
      gentle: '力を抜いて。……主の命令、聞けるよね｜力を抜け。……主の命令は聞けるな｜力を抜いてください。……主の命令、聞けますね|怖くないよ。今だけは、命令に従って｜怖くはない。今だけは、命令に従え｜怖くありませんよ。今だけは、命令に従ってください',
      devoted: '主として命じる。……私に、全部預けて｜主として命じる。……私に、全部預けろ｜主として命じます。……私に、全部預けてください|あなたは私の従者。……だから、私だけのもの｜あなたは私の従者だ。……だから、私だけのものだ｜あなたは私の従者です。……ですから、私だけのものです',
      cool: '命令。声は殺して｜命令だ。声は殺せ｜命令です。声は殺してください|外に聞かれたら困る。……命令、分かってるね｜外に聞かれたら困る。……命令は分かっているな｜外に聞かれたら困ります。……命令、分かっていますね',
      free: '命令ってことにしとこう。……逃げないでね｜命令ということにしておく。……逃げるなよ｜命令ということにしておきましょう。……逃げないでくださいね|主の命令。今は、私のことだけ考えて｜主の命令だ。今は、私のことだけ考えろ｜主の命令です。今は、私のことだけ考えてください',
      shy: 'め、命令……だから。……こっち、見て｜め、命令……だ。……こちらを見ろ｜め、命令……です。……こちらを、見てください|そ、その……命令、だから。我慢しなくて、いい｜そ、その……命令、だ。我慢しなくて、いい｜そ、その……命令、ですから。我慢しなくて、いいです',
      polite: '命令だよ。……少しだけ、声を抑えて｜命令だ。……少しだけ、声を抑えろ｜命令です。……少しだけ、声を抑えてください|今だけは、主の言うことを聞いて｜今だけは、主の言うことを聞け｜今だけは、主の言うことを聞いてください'
    }),
    give: P9({
      proud: '止まらないで。命令だよ｜止まるな。命令だ｜止まらないでください。命令です|……もっと。主の命令が聞けないの？｜……もっとだ。主の命令が聞けないのか｜……もっと。主の命令が聞けないのですか',
      stern: '遠慮はいらない。命令だから｜遠慮はいらない。命令だ｜遠慮はいりません。命令ですから|そのまま続けて。止まれとは言っていない｜そのまま続けろ。止まれとは言っていない｜そのまま続けてください。止まれとは申していません',
      tsun: 'と、止まったら、許さないから。命令｜と、止まったら、許さない。命令だ｜と、止まったら、許しません。命令です|べ、別に……命令だから、続けて｜べ、別に……命令だから、続けろ｜べ、別に……命令ですから、続けてください',
      gentle: 'いいよ、そのまま。……命令だと思って｜いい、そのままで。……命令だと思え｜いいですよ、そのまま。……命令だと思ってください|遠慮しないで。これは、主のお願い……ううん、命令｜遠慮するな。これは、主の頼み……いや、命令だ｜遠慮しないでください。これは、主のお願い……いいえ、命令です',
      devoted: 'あなたになら、全部あげる。……命令だよ、やめないで｜あなたになら、全部やる。……命令だ、やめるな｜あなたになら、全部差し上げます。……命令です、やめないでください|主の命令。……あなたの好きにして｜主の命令だ。……あなたの好きにしろ｜主の命令です。……あなたの好きにしてください',
      cool: '続けて。命令｜続けろ。命令だ｜続けてください。命令です|声は私が殺す。あなたは止まらないで｜声は私が殺す。あなたは止まるな｜声は私が殺します。あなたは止まらないでください',
      free: 'いいね、その調子。……命令、追加ね｜いいな、その調子だ。……命令を追加する｜いいですね、その調子です。……命令を追加しますね|止まったら、命令違反だよ｜止まったら、命令違反だ｜止まったら、命令違反ですよ',
      shy: 'や、やめないで……め、命令……｜や、やめるな……め、命令だ……｜や、やめないでください……め、命令、です……|そ、そのまま……命令、だから｜そ、そのまま……命令、だ｜そ、そのまま……命令、ですから',
      polite: 'そのまま、続けて。……命令だよ｜そのまま、続けろ。……命令だ｜そのまま、続けてください。……命令です|遠慮はいらないよ。主が許すから｜遠慮はいらない。主が許す｜遠慮はいりませんよ。主が許しますから'
    })
  };
  /* ---------- ロッカーの中で、耐え続ける従に主が命じる一言（「」の中身。向きを決めない言い方。主の態度9種。2026-10-28 担当LK） ---------- */
  var IN_ASK = P9({
    proud: '我慢はそこまで。主が許す、じゃない。主が命じる｜我慢はそこまでだ。主が許すのではない。主が命じる｜我慢はそこまでです。主が許すのではありません。主が命じます|私の前で耐えてみせる必要はない。命令だよ、こっちを向いて｜私の前で耐えてみせる必要はない。命令だ、こちらを向け｜私の前で耐えてみせる必要はありません。命令です、こちらを向きなさい',
    stern: '耐えるのはもういい。これは命令｜耐えるのはもういい。これは命令だ｜耐えるのはもう結構です。これは命令です|動かないで。ここから先は、私が決める｜動くな。ここから先は、私が決める｜動かないでください。ここから先は、私が決めます',
    tsun: 'い、いつまで我慢してるの。命令だから、こっち来て｜い、いつまで我慢している。命令だ、こっちに来い｜い、いつまで我慢しているんですか。命令です、こちらに来てください|か、勘違いしないで。命令だから、言うことを聞いて｜か、勘違いするな。命令だから、言うことを聞け｜か、勘違いなさらないで。命令ですから、言うことを聞いてください',
    gentle: 'もう耐えなくていいよ。……主の命令、聞けるよね｜もう耐えなくていい。……主の命令は聞けるな｜もう耐えなくていいんですよ。……主の命令、聞けますね|大丈夫。今だけは、命令に従って｜大丈夫だ。今だけは、命令に従え｜大丈夫です。今だけは、命令に従ってください',
    devoted: 'あなたが耐えるのを、もう見ていられない。命令する、私に全部預けて｜あなたが耐えるのを、もう見ていられない。命令する、私に全部預けろ｜あなたが耐えるのを、もう見ていられません。命令します、私に全部預けてください|主として命じる。……あなたは、私だけ見ていて｜主として命じる。……あなたは、私だけ見ていろ｜主として命じます。……あなたは、私だけ見ていてください',
    cool: '我慢は終わり。命令｜我慢は終わりだ。命令だ｜我慢は終わりです。命令です|時間の無駄。命令に従って｜時間の無駄だ。命令に従え｜時間の無駄です。命令に従ってください',
    free: 'はい、我慢比べはおしまい。主の命令ね｜よし、我慢比べはおしまいだ。主の命令だ｜はい、我慢比べはおしまいです。主の命令ですよ|耐えてる顔も悪くないけど、もう十分。命令だよ｜耐えている顔も悪くないが、もう十分だ。命令だ｜耐えていらっしゃるお顔も悪くありませんが、もう十分です。命令ですよ',
    shy: 'そ、そんなに我慢しないで……め、命令、だから｜そ、そんなに我慢するな……め、命令、だ｜そ、そんなに我慢しないでください……め、命令、ですから|こ、こっち、向いて。……命令｜こ、こっちを、向け。……命令だ｜こ、こちらを、向いてください。……命令です',
    polite: '十分に耐えてくれたね。ここからは、主の命令に従って｜十分に耐えてくれた。ここからは、主の命令に従え｜十分に耐えてくださいましたね。ここからは、主の命令に従ってください|申し訳ないけど、これは命令。我慢はもうやめて｜申し訳ないが、これは命令だ。我慢はもうやめろ｜申し訳ありませんが、これは命令です。我慢はもうおやめください'
  });
  /* ロッカーの中で押さえつける（地の文。{u}＝主、{l}＝従。続きは扉が開いてから） */
  var IN_HOLD = L('{u}は{l}の両手首をまとめて、ロッカーの奥の壁に押さえつけた。狭い箱の中に、逃げる隙間はどこにもなかった。{u}は{l}の耳元で、扉が開いたら続きをすると告げた。|' +
    '{l}が身をよじるたびに、背中がロッカーの壁にぶつかって鈍い音を立てた。{u}は体ごと{l}を押さえ込み、首筋に唇を押し当てた。扉が開くまでの時間が、{l}にはひどく長かった。|' +
    '{u}は{l}の顎を掴んで上を向かせ、命令をもう一度だけ繰り返した。{l}の返事を待たずに、{u}の手が服の内側へ滑り込んだ。狭いロッカーの中では、{l}が顔を背けることさえ許されなかった。');
  /* ロッカーの中の命令が通らない（{l}＝従が、狭い中で断る・撥ねつける） */
  var IN_NO = {
    refuse: L('{l}は狭いロッカーの中で、器用に肩をすくめた。{l}「こんなところで命令ごっこ？　出てからにして｜こんなところで命令ごっこか。出てからにしろ｜こんなところで命令ごっこですか。出てからにしてください」――{u}は言い返せずに、黙って仕掛けの方へ向き直った。|' +
      '{l}は{u}の額を指で軽く弾いた。{l}「その命令、却下。耐えてるのは、あなたのためでもあるんだから｜その命令は却下だ。耐えているのは、あなたのためでもある｜そのご命令、却下です。耐えているのは、あなたのためでもあるんですから」――対等に近い二人には、命令はただの冗談にしかならなかった。|' +
      '{l}は小さく吹き出した。{l}「主の威厳、ロッカーの中じゃ台無しだよ｜主の威厳も、ロッカーの中では台無しだな｜主の威厳も、ロッカーの中では台無しですね」――{u}もつられて笑い、張りつめていた空気が少しだけ緩んだ。'),
    decline: L('{l}は首を振り、狭い中でできるだけ身を引いた。{l}「どんな命令でも聞く。でも、それだけは聞けない｜どんな命令でも聞く。だが、それだけは聞けない｜どんなご命令でも聞きます。でも、それだけはお聞きできません」――{u}は伸ばしかけた手を、ゆっくりと下ろした。|' +
      '{l}は目を伏せたまま、震える声で答えた。{l}「ここで命令に従ったら、明日から主の顔が見られない｜ここで命令に従えば、明日から主の顔が見られない｜ここでご命令に従ったら、明日から主のお顔が見られません」――{u}は苦く笑って、命令を取り消した。|' +
      '{l}は、ロッカーの扉に背中を押しつけるようにして距離を取った。{u}は、{l}の青ざめた顔を見て、自分の口にしたことを悔やんだ。{u}「……忘れて。今のは、命令じゃない｜……忘れろ。今のは、命令ではない｜……お忘れください。今のは、命令じゃありません」'),
    rebuff: L('{l}は{u}の手を払いのけた。{l}「媚薬で命令までおかしくなった？　聞くわけない｜媚薬で命令までおかしくなったか。聞くわけがない｜媚薬でご命令までおかしくなりましたか。聞くわけがありません」――{l}はそれきり、狭いロッカーの中で{u}に背を向けた。|' +
      '{l}の目が、すっと冷えた。{l}「耐えてきたのは、あなたのためじゃない。自分のため｜耐えてきたのは、あなたのためではない。自分のためだ｜耐えてきたのは、あなたのためではありません。自分のためです」――{u}の命令は、狭い箱の中で行き場をなくした。|' +
      '{l}は{u}の胸を押し返し、ロッカーの壁際ぎりぎりまで身を引いた。{l}「命令なら、出てからいくらでも聞く。ここでは聞かない｜＝｜ご命令なら、出てからいくらでもお聞きします。ここではお聞きしません」――{u}は舌打ちをこらえて、手を引いた。')
  };
  /* ロッカーの中で押さえつけた続き：扉が開いたあと（ねじ伏せる夜の導入。{u}＝主、{l}＝従） */
  var FORCE_DOOR = L('扉が開いても、{u}の命令は取り消されなかった。{u}は{l}の腕を掴んだまま、部屋の奥の{bed}まで引きずっていった。{l}が振り返った扉の向こうは、ひどく遠く見えた。|' +
    'ロッカーの扉が開く音がしても、{u}は{l}を離さなかった。ロッカーの中で始まったことの続きを、{u}は{bed}の上で終わらせるつもりだった。{l}の抵抗は、狭い箱の中にいたときよりも弱かった。|' +
    '外の空気が流れ込んだのは、ほんの一瞬だった。{u}は{l}を{bed}に突き倒し、その上にのしかかった。{u}「命令は、まだ終わってない｜命令は、まだ終わっていない｜命令は、まだ終わっていません」');
  /* 従者の結末（solo-locker.js の結末の欄。p.toFate） */
  var FATE = { refuse: '主の命令を笑って断った', decline: '主の命令を断り、主が引いた', rebuff: '主の命令を撥ねつけた', force: '主の命令でねじ伏せられた', take: '主の命令で身を委ねた', give: '主の命令で主を抱いた' };
  /* 主・家族の二人の結末（p.toFateU。企んだ主がねじ伏せたときも「相手をモノにした」にしない） */
  var FATE_U = { refuse: '命令を笑って断られた', decline: '命令を断られ、引き下がった', rebuff: '命令を撥ねつけられた', force: '命令で従者をねじ伏せた', denyX: '家族の一線の前で想いを拒まれた', denyH: '家族の暮らしを守って拒んだ' };

  /* ---------- 惹かれ・好意（ロッカーの中の値から） ---------- */
  var LOVE_T = /^(lover|mate|fated|almost|fwb)$/, PINE_T = /^(crush|honmei|worship|blind|yan|fond)$/;
  function tiesOf(S, a, b) { return (S.ties || []).filter(function (t) { return t && ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)); }); }
  /* x が相手を想う関係（恋人どうしの関係か、x の側からの片想い・本命・信仰など） */
  function pines(S, ties, x) { return ties.some(function (t) { return LOVE_T.test(t.type) || (PINE_T.test(t.type) && S.P && S.P[t.a] === x); }); }
  function relB(S, ties, x) {
    var v = 0;
    ties.forEach(function (t) {
      if (LOVE_T.test(t.type) || (PINE_T.test(t.type) && S.P && S.P[t.a] === x)) v += 35;
      if (t.cold === 'good') v += 5; else if (t.cold === 'bad') v -= 25;
    });
    return v;
  }
  /* 性欲の強さの倍率（弱い 0.6・強い 1.15。体の熱の惹かれだけに掛ける） */
  var LIBF = { low: 0.6, high: 1.15, none: 0 };
  function libOf(x) { return HK.Pos && HK.Pos.libOf ? HK.Pos.libOf(x) : ''; }
  function libF(x) { var v = libOf(x); return LIBF[v] != null ? LIBF[v] : 1; }
  /* 惹かれ：発情が低い人・理性の残っている人・CP の高い人は低く。発情 25 未満の人は、関係があっても 20 まで（25 以上で想っている人は 45 から）。bedOk＝ベッドの条件を満たした夜の加点（主従 10・家族 4） */
  function fondOf(S, ties, x, bedOk) {
    var c = x.cnt || {}, m = x.m || {}, h = m.heat || 0, cp = (x.tr && x.tr.cp) || 0;
    var body = h * 0.36 * libF(x) + Math.min(2, c.accept || 0) * 6 + Math.min(2, c.make || 0) * 5 - Math.min(2, c.refuse || 0) * 10 - cp * 10 - (m.reason || 0) * 0.2 + (+bedOk || 0);
    var v = Math.max(0, Math.min(45, body)) + relB(S, ties, x);
    /* 想っている人（恋人どうし・片想いなど）は、発情が 25 以上なら惹かれ 45 以上 */
    if (h >= 25 && pines(S, ties, x)) v = Math.max(v, 45);
    return clamp(h < 25 ? Math.min(v, 20) : v);
  }
  function optOf(S, A, B, peek, place, bedOk) {
    var ties = tiesOf(S, A, B);
    var o = { peek: !!peek, place: place || PL_BED, ties: ties,
      fond: function (x) { return fondOf(S, ties, x, bedOk); },
      aff: function (x) { var v = clamp(40 + relB(S, ties, x)); return x && x.m && x.m.heat < 25 ? Math.min(v, 60) : v; },
      willing: function (x) { return !!(x && x.m && x.m.heat >= 90 && (x.m.reason || 0) < 10 && libF(x) >= 1); } };
    /* 合意のない展開は、内容のスイッチ（HK.Pos.forceOn）が入のときだけキットに任せる */
    if (!(HK.Pos && HK.Pos.forceOn && HK.Pos.forceOn(S))) o.force = false;
    return o;
  }
  /* 二人の型の関係（locker-tie-more-r18.js の型。主従・家族）。片想いなどが家族の関係より強い組（型は pine）は、家族（恋愛：あり）の関係を探す */
  function tieFor(S, x, y) {
    if (!R18.groupOf) return null;
    var gi = R18.groupOf(S, x, y), T = TO();
    if (gi && gi.e && gi.e.t && (gi.g === 'master' || gi.g === 'fam')) return { g: gi.g, t: gi.e.t };
    if (gi && gi.g !== 'pine') return null;
    var fam = tiesOf(S, x, y).filter(function (t) { return T.famOk(t); })[0];
    return fam ? { g: 'fam', t: fam } : null;
  }
  /* 二人の型（主従・家族）を決める。r＝{ g, p（plan）, sc（scene）, x, y } か null */
  function align(r, x, y) {
    var p = r.p, T = TO();
    if (!p.sex || p.force) return;
    if (p.type === 'order') p.kind = x === p.up ? 'take' : 'give';
    p.top = x; p.bot = y; p.why = T.why(p);
    r.x = x; r.y = y;
  }
  /* how：{ place, bedOk } */
  function planFor(S, A, B, x, y, pair, how) {
    var T = TO();
    how = how || {};
    if (!T || HK.SAFE_ON) return null;
    var gi = tieFor(S, x, y);
    if (!gi) return null;
    if (gi.g === 'master' && pair && pair.svOrd) return null;
    if (gi.g === 'fam' && !T.famOk(gi.t)) return null;
    var f = T.find(S, x, y, { tie: gi.t });
    if (!f || (gi.g === 'master' ? 'order' : 'stand') !== f.type) return null;
    var opt = function (peek) {
      var o = optOf(S, A, B, peek, how.place, how.bedOk ? (f.type === 'order' ? 10 : 4) : 0);
      o.find = f;
      /* 従が主を想っている組は、ねじ伏せない（断る場面に） */
      if (f.type === 'order' && pines(S, o.ties, f.down)) o.force = false;
      /* 家族の立場の夜は、二人とも惹かれ 42 以上（家族の線は、主従の命令より越えにくい。発情が限界でも、惹かれのない人は乗らない） */
      if (f.type === 'stand') { o.like = 42; o.willing = null; }
      return o;
    };
    /* 起きる見込み（乱数を使わない） */
    if (!T.plan(S, x, y, opt(true))) return null;
    var p = T.plan(S, x, y, opt(false));
    if (!p) return null;
    var r = { g: gi.g, p: p, x: x, y: y };
    align(r, x, y);
    r.sc = T.scene(S, p, { place: how.place || PL_BED });
    return r;
  }
  /* 命令が通らない・家族の線を越えない場面の結末の欄 */
  function fateNo(o, p) {
    if (p.type === 'order') {
      if (o.servant === p.down && FATE[p.react]) p.down.toFate = FATE[p.react];
      if (FATE_U[p.react]) p.up.toFateU = FATE_U[p.react];
    } else if (p.kind === 'deny' && p.x && p.h) { p.x.toFateU = FATE_U.denyX; p.h.toFateU = FATE_U.denyH; }
  }

  /* ---------- 扉が開いたあと（solo-locker.js が呼ぶ。o.bed＝ベッドの条件を満たしたか）。
     返り値 'bed'＝ベッドへ（命令・立場から始まる夜／ねじ伏せる夜）、'no'＝場面だけ書いてベッドへ行かない、''＝何もしない（ベッドの条件どおり） ---------- */
  LK.bedGate = function (S, o) {
    if (HK.SAFE_ON || !TO() || !o || !o.pair || !o.A || !o.B) return '';
    var pair = o.pair, A = o.A, B = o.B, nob = !o.bed;
    /* ロッカーの中で主が押さえつけた二人：扉が開いたら、そのままベッドへ（LK.bed の包みがねじ伏せる夜を書く） */
    if (pair.toPlan && pair.toPlan.inLk) return nob && !pair.conn ? 'bed' : '';
    /* ロッカーの中で主の命令を断った二人は、ベッドへ行かない（結末の「断った」と食い違わないように） */
    if (pair.toNo) return o.bed ? 'no' : '';
    if (pair.toTried) return '';
    /* 時間切れの扉でまだ繋がったままの二人は、今の流れのまま（ベッドの条件を満たさない夜の入口は通らない） */
    if (nob && pair.conn) return '';
    /* ロッカーの中で最後までした二人は、ベッドの条件を満たさない夜の入口を通らない（ガスのせいにした結末のまま） */
    if (nob && pair.sexIn) return '';
    pair.toTried = true;
    /* ベッドの攻め（solo-locker.js と同じ決め方） */
    var x = o.plotter || (A.cnt.make >= B.cnt.make ? A : B), y = x === A ? B : A;
    if (HK.Pos && HK.Pos.order(x, y, [x, y])[0] !== x) { var t0 = x; x = y; y = t0; }
    var gi = tieFor(S, x, y);
    if (!gi) return '';
    /* ベッドの条件を満たさない主従：主の発情が 50 以上（性欲が「強い」なら 40 以上）か、主が企んだ人なら、主が命じる（従の発情は問わない） */
    if (nob && gi.g === 'master') {
      var f0 = TO().find(S, x, y, { tie: gi.t });
      if (!f0 || f0.type !== 'order' || pair.svOrd) return '';
      var M = f0.up, hi = libOf(M) === 'high', pl = o.plotter === M;
      if (!(M.m.heat >= (hi ? 40 : 50) || pl)) return '';
      if (S.rng() >= 0.5 + Math.max(0, M.m.heat - 50) / 100 + (hi ? 0.15 : 0) + (pl ? 0.3 : 0)) return '';
    }
    var r = planFor(S, A, B, x, y, pair, { bedOk: !nob });
    if (!r) return '';
    var p = r.p;
    /* 時間切れの扉が開いたとき、まだ繋がったままの二人は、拒む・断る場面にしない（結末の「繋がったまま」と食い違うので、今の夜の流れのまま） */
    if (!p.sex && pair.conn) return '';
    /* ロッカーの中で最後までした二人も、扉のあとで拒む・断る場面にしない（「家族の線を守った」「命令は通らなかった」と食い違うので） */
    if (!p.sex && pair.sexIn) return '';
    /* 自分から閉じ込められた人（企んだ人）が、命令や想いを拒む側にはならない */
    if (!p.sex && o.plotter && o.plotter === (p.type === 'order' ? p.down : p.h)) return '';
    /* ベッドの条件を満たさない家族：二人とも惹かれていれば、立場の夜（見込み 6 割） */
    if (nob && p.sex && p.type === 'stand' && S.rng() >= 0.6) return '';
    r.nob = nob;
    pair.toPlan = r;
    if (p.type === 'order') pair.toOrd = true;
    if (p.sex) return nob ? 'bed' : '';
    note('no', p);
    pair.toNo = true;
    /* 命令が通らない・家族の線を越えない：その場面だけ */
    var ev = ST.say(S, { actors: [A, B], tag: p.type === 'order' ? '主の命令' : '家族の一線', text: r.sc.open, why: p.why + (nob ? '（ベッドの条件とは別に）' : ''), mag: 24 });
    ST.key(S, ev, p.type === 'order' ? p.up.name + 'の命令は通らなかった' : p.h.name + 'が家族の線を守った');
    fateNo(o, p);
    return 'no';
  };

  /* ---------- ロッカーの中：耐え続ける従に、主が命令で押し切る（solo-locker.js が主の番に呼ぶ。真を返せば、その番はそれで終わり） ----------
     o：{ A, B, pair, M（主）, Sv（従）, servant }。従が乗る組は何もしない（solo-locker.js の「主の許し」に任せる） */
  function fillIn(s, M, Sv) {
    return String(s).replace(/\{u\}/g, M.name).replace(/\{l\}/g, Sv.name).replace(/\{(room|door|paper|bed|here)\}/g, function (q, k) { return PL_IN[k]; });
  }
  LK.inGate = function (S, o) {
    if (HK.SAFE_ON || !TO() || !o || !o.pair || !o.M || !o.Sv) return false;
    var pair = o.pair, M = o.M, Sv = o.Sv, T = TO();
    /* まだ何も起きていない二人だけ（従が耐え続けている） */
    if (pair.toIn || pair.svOrd || pair.toTried || pair.conn || pair.acts || M.bound) return false;
    var gi = tieFor(S, M, Sv);
    if (!gi || gi.g !== 'master') return false;
    var f = T.find(S, M, Sv, { tie: gi.t });
    if (!f || f.type !== 'order' || f.up !== M || f.down !== Sv) return false;
    /* 主の番に一度だけ見る */
    if (pair.inTried) return false;
    pair.inTried = true;
    var r = planFor(S, o.A, o.B, M, Sv, pair, { place: PL_IN });
    if (!r || (r.p.sex && !r.p.force) || r.p.rebel) return false;
    /* 見込みは 6 割。通らなかった回は、扉が開いたあとの入口に任せる */
    if (S.rng() >= 0.6) return false;
    var p = r.p, mp = ps(M), ask = M.name + '「' + pick(S, IN_ASK[mp]) + '」', ev, why = p.why + '（' + Sv.name + 'は' + Sv.cnt.hold + '回耐えていた・' + M.name + 'の発情 ' + Math.round(M.m.heat) + '）';
    pair.toIn = true; pair.toOrd = true; pair.toTried = true;
    if (p.force) {
      var X = T.X, rx = (X.REACT.take[p.react] || X.REACT.take.obeyF).filter(function (l) { return !/灯り|\{bed\}|ベッド/.test(l); });
      var text = ask + fillIn(pick(S, rx), M, Sv) + fillIn(pick(S, X.PUSH[mp] || X.PUSH.proud), M, Sv) + fillIn(pick(S, IN_HOLD), M, Sv);
      ev = ST.sayB(S, { actors: [M, Sv], tag: '主の命令', text: text, why: why + '／ロッカーの中では押さえつけたまま、続きは扉が開いてから', mag: 34 }, '', true);
      ST.key(S, ev, M.name + 'が命令で' + Sv.name + 'を押さえつけた');
      /* 扉が開いたら、そのままねじ伏せる夜へ（LK.bedGate が 'bed' を返す）。ロッカーの中では、それ以上は誰も手を出さない */
      r.inLk = true; pair.toPlan = r; pair.rest = 99;
      Sv.cnt.refuse++; Sv.m.reason = clamp(Sv.m.reason + 10);
      if (o.servant === Sv) Sv.toFate = FATE.force;
      M.toFateU = FATE_U.force;
      note('inforce', p);
      return true;
    }
    ev = ST.sayB(S, { actors: [M, Sv], tag: '主の命令', text: ask + fillIn(pick(S, IN_NO[p.react] || IN_NO.decline), M, Sv), why: why, mag: 24 }, '', true);
    ST.key(S, ev, M.name + 'の命令は通らなかった');
    Sv.cnt.refuse++; Sv.m.reason = clamp(Sv.m.reason + 10); M.m.reason = clamp(M.m.reason + 8);
    /* 断られたあとは、ロッカーの中で二人とも手を出さない（結末の「断った」と食い違わないように） */
    pair.toNo = true; pair.rest = 99;
    fateNo(o, p);
    note('inno', p);
    return true;
  };

  /* ---------- 命令でねじ伏せる夜（ベッドの代わりの一場面）。ロッカーの中で押さえつけた続きは、命令の段を繰り返さない ---------- */
  function forceBed(S, o, r) {
    var p = r.p, pre = !r.inLk && o.how === 'timeout' && LK.BED && LK.BED.timeout ? LK.BED.timeout[0] : '';
    if (r.inLk) { p.place = PL_BED; r.sc = TO().scene(S, p, { place: PL_BED }); }
    var open = r.inLk ? pick(S, FORCE_DOOR) : r.sc.open;
    var text = TO().forceBody(S, p.top, p.bot, pre + open, r.sc.after || '', { place: PL_BED, fade: r.sc.fade });
    var ev = ST.say(S, { actors: [o.A, o.B], tag: '主の命令', text: text, why: p.why + '／' + p.top.name + 'が攻め' + (r.nob ? '（ベッドの条件とは別に）' : ''), mag: 45, kind: 'climax' });
    ST.key(S, ev, p.up.name + 'が命令でねじ伏せた');
    note('force', p);
    if (o.pair) o.pair.forced = (o.pair.forced || 0) + 1;
    if (o.servant === p.down) p.down.toFate = FATE.force;
    p.up.toFateU = FATE_U.force;
    return ['主の命令でねじ伏せる'];
  }

  /* ---------- 扉が開いたあとのベッド（いちばん外側の包み。locker-thick.js が呼び直すときは o.lkoDone で素通し） ---------- */
  var bed1 = LK.bed;
  LK.bed = function (S, o) {
    if (!o || o.lkoDone || HK.SAFE_ON || !o.x || !o.y || !TO()) return bed1.apply(this, arguments);
    var pair = o.pair || {}, r = pair.toPlan || null;
    /* 三人以上の回の二人きりのベッドなど、solo-locker.js の入口を通らない回：合意の夜になる型だけ使う */
    if (!r && !pair.toTried) {
      pair.toTried = true;
      r = planFor(S, o.A, o.B, o.x, o.y, pair, { bedOk: true });
      if (r && (!r.p.sex || r.p.force)) r = null;
      if (r) { pair.toPlan = r; if (r.p.type === 'order') pair.toOrd = true; }
    }
    if (!r || !r.p.sex) return bed1.apply(this, arguments);
    var p = r.p;
    if (p.force) return forceBed(S, o, r);
    /* 攻めの向きがずれたら、命令の向き（抱け／抱かれろ）を合わせ直す */
    if (r.x !== o.x) { align(r, o.x, o.y); r.sc = TO().scene(S, p, { place: PL_BED }); }
    var o2 = Object.assign({}, o, { lkoDone: true, noOrder: true, lead: { text: r.sc.open, label: p.type === 'order' ? '主の命令' : '家族の立場', why: p.why } });
    var start = S.log.length, res;
    note(r.nob ? 'bed2' : 'bed', p);
    S.lkTOcur = r;
    try { res = bed1.call(this, S, o2); } finally { S.lkTOcur = null; }
    if (p.type === 'order') {
      /* 事後の段の終わりに、命令の結び */
      var es = S.log.slice(start).filter(function (q) { return q && typeof q.text === 'string' && q.kind !== 'step' && q.kind !== 'phase'; });
      var fin = es[es.length - 1];
      if (r.sc.after && fin && es.length > 1 && o.lew !== 'low') fin.text += (/\n\n/.test(fin.text) ? '\n\n' : '') + r.sc.after;
      if (o.servant === p.down && !p.down.broke) p.down.toFate = FATE[p.kind === 'give' ? 'give' : 'take'];
    }
    return res;
  };

  /* ---------- つなぎ口 ---------- */
  /* ためらいの段：命令・立場の型の夜は、命令のあとの一文（命令とその反応は誘いの段に入れてある） */
  R18.hesHook = function (S, c) {
    var r = S.lkTOcur;
    if (!r || !r.p.sex || r.p.force) return '';
    var p = r.p, k = p.type === 'order' ? (p.kind === 'give' ? 'give' : 'take') : p.type === 'stand' ? 'stand' : '';
    return k ? ST.fmt(pick(S, BRIDGE[k]), { u: p.up.name, l: p.down.name }) : '';
  };
  /* 導入の段：恋人たちに、場所への照れ・警戒の一言（照れの一言と別の人が、別の向きで） */
  R18.introHook = function (S, c) {
    if (c.g !== 'love' || HK.SAFE_ON || !TO() || !c.x || !c.y) return '';
    var hs = c.hes || '', sp = null;
    [c.x, c.y].slice().sort(function (p, q) { return q.name.length - p.name.length; }).forEach(function (p) { if (!sp && hs.indexOf(p.name + '「') === 0) sp = p; });
    var s1 = sp ? (sp === c.x ? c.y : c.x) : (S.rng() < 0.5 ? c.x : c.y), s2 = s1 === c.x ? c.y : c.x;
    /* 照れの一言と同じ言葉（カメラ・恥ずかしい）を重ねない：重なれば、もう一方の向き（cam⇔shy）に。どちらも重なれば足さない */
    var share = function (l) { return (/カメラ/.test(l) && /カメラ/.test(hs)) || (/恥ずかし/.test(l) && /恥ずかし/.test(hs)); };
    var line = TO().react(S, s1, s2, 'auto', { place: PL_LOVE });
    if (share(line)) line = TO().react(S, s1, s2, /^(proud|stern|cool|free|polite)$/.test(ps(s1)) ? 'shy' : 'cam', { place: PL_LOVE });
    if (share(line)) return '';
    note('love', null);
    return (c.intro || '') + line;
  };

  /* ---------- ロッカーの中で繋がったとき：主の命令の一言（一度だけ） ---------- */
  var act0 = LK.TIES2.r18Act;
  LK.TIES2.r18Act = function (S, tp, bt, pair) {
    var t = act0.apply(this, arguments) || '';
    if (HK.SAFE_ON || !pair || pair.svOrd || pair.toIn || !TO() || !R18.groupOf || !tp || !bt) return t;
    var gi = R18.groupOf(S, tp, bt);
    if (!gi || gi.g !== 'master' || !gi.e || !gi.e.t) return t;
    var f = TO().find(S, tp, bt, { tie: gi.e.t });
    if (!f || f.type !== 'order') return t;
    var o0 = optOf(S, tp, bt, true, PL_IN); o0.find = f;
    var p0 = TO().plan(S, tp, bt, o0);
    if (!p0 || !p0.sex || p0.force || S.rng() >= 0.6) return t;
    pair.toIn = true; pair.toOrd = true;
    note('in', p0);
    var M = f.up;
    return t + M.name + '「' + pick(S, IN_CMD[tp === M ? 'take' : 'give'][ps(M)]) + '」';
  };
  R18.ORDER_COUNT = function () { var n = 0; Object.keys(BRIDGE).forEach(function (k) { n += BRIDGE[k].length; }); ['take', 'give'].forEach(function (k) { PS.forEach(function (p) { n += IN_CMD[k][p].length; }); }); return n; };
})();
