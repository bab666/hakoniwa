/* 箱庭シミュレーター: 口調の登録簿
   口調を足すときは、まずここに一つ書き足す（選択欄の並び・名前・一人称・文面の表・見本・場面ごとの分類は、すべてここから読む）。
   話し方の言い換えそのもの（「〜っす」に付け替えるなど）は、口調ごとのファイル（tone-*.js）に書く。
   ■ 新しい口調の足し方
   1. 下の TONES に一つ足す（書く順が選択欄の並び）
   2. 既存の口調の台詞を作ってから語尾だけ付け替える口調なら、derive にその口調を書き、
      付け替える関数を HK.toneFinish(口調, 関数) で登録する（例：tone-polite-kin.js の後輩・お嬢様）。
      その口調の書き下ろし・直しは辞書（tone-fix.js など）に口調名で入れれば、付け替えずにそのまま使われる
   3. まったく新しい言い換えが要る口調は、tone-extra2.js などと同じく V.styleQuote を包んで書く
   4. 全年齢版にも同じファイルを置く。tools/tone-check は HK.TONE_KEYS を読むので、そのまま新しい口調も点検される
   ■ 項目（どれも省略できる。8つの基本口調と敬語の名前と説明は persona.js の HK.PERSONA にある）
   label・desc … 選択欄の名前と説明
   base … 文面の表（場面ごとの台詞）を借りる口調。null ならエゴグラムからいちばん合う口調の表
   top … 行動の傾向に使うエゴグラムの因子。null ならエゴグラムから
   fp … 一人称 { m: 男性, f: 女性, x: 性別なし }
   neutral / plain / calm / kansai … tone-plus.js の言い換え（中性的な語尾・敬語を外す・分析口調を外す・関西弁）
   derive … この口調の台詞を作ってから、最後に語尾を付け替える（付け替えは HK.toneFinish で登録）
   noBaseFix … derive の口調で、元の口調向けに書き下ろした台詞（tone-fix-g*.js）を引き継がない（引き継ぐと口調の個性が薄れるとき）
   egoTable … 文面の表がエゴグラムから決まり、それが敬語の表なら穏やかの表に替える（敬語の表だと言い換えが効かないため）
   noPolite … egoTable に加えて、敬語で話す健気の表も穏やかの表に替える
   lines: 'base' … 書き下ろしの列（tone-lines.js などの ROWS）を持つ口調。場面の台詞は元の表から引き、辞書で差し替える
   firm … 拒み方を強く言い換える（tone-firm.js）：'plain'（はっきりした口調）/ 'noja' / 'gentleman'
   group … 書き分けた台詞を選ぶときの大まかな分類：'polite'（敬語）/ 'soft'（やわらかい）。省略は強い口調
   reluct … 人前で渋りやすさの補正（room-reluct.js）
   （設定画面の台詞の見本は、全口調で同じ HK.TONE_SAMPLE を使う。口調ごとの手書きは tone-sample-fix.js） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK || !HK.PERSONA) return;
  var TONES = {
    proud: { firm: 'plain' },
    aniki: { label: '頼れる兄貴・姉貴分', desc: 'CP・NP高。面倒見がよく、さっぱりした物言い／兄貴肌・姉御肌', base: 'proud', top: 'NP', fp: { m: '俺', f: 'あたし', x: '俺' }, firm: 'plain', reluct: -0.05 },
    yankee: { label: 'ヤンキー（〜じゃねえよ）', desc: '「知らねえよ」「文句あんのかよ」「ナメてんのか？　あァ？」。荒っぽいヤンキーの話し方。荒い性格ほど威嚇が強く、穏やかな性格なら砕けた優しさになる。態度はエゴグラムから決まる', base: null, top: null, fp: { m: '俺', f: 'あたし', x: '俺' }, plain: true, egoTable: true, noPolite: true, reluct: -0.1 },
    stern: { firm: 'plain', reluct: 0.18 },
    tsun: { reluct: 0.12 },
    tsun_n: { label: '意地っ張り（中性的）', desc: '意地っ張りの、語尾が中性的な話し方', base: 'tsun', top: 'CP', neutral: true, fp: { m: '俺', f: '私', x: '僕' }, firm: 'plain', reluct: 0.12 },
    gentle: { group: 'soft' },
    gentle_n: { label: '穏やか（中性的）', desc: '穏やかの、語尾が中性的な話し方', base: 'gentle', top: 'NP', neutral: true, fp: { m: '僕', f: '私', x: '僕' }, group: 'soft' },
    /* 2026-10-26（順149）：「穏やか」を男性に使うと語尾が女性的になる、という要望への、既存口調の性別ぶれの直し。辞書（tone-dict-builtin.js の gentle_m）だけで作る。
       辞書が触らない喘ぎの台詞にも女性的な語尾（あら・〜わね）が残らないよう、男性・性別なしの人は穏やか（中性的）と同じ性別の語尾の仕上げ（neutral）も通す */
    gentle_m: { label: '穏やか（男性）', desc: '穏やかの男性向けの語尾。「〜だね」「〜だよ」「〜かな」「〜してごらん」「〜じゃないかな」。「〜わ」「〜のよ」「〜かしら」「あら」は使わない。文面は穏やかのものを使う', base: 'gentle', top: 'NP', neutral: true, fp: { m: '僕', f: '私', x: '僕' }, group: 'soft', dictOnly: true, reluct: 0,
      axis: { polite: 0, attitude: 'soft', ending: 'n' } },
    ane: { label: 'お姉さん（〜わよ）', desc: '「〜ね」「ふふ、いいわよ」「〜ってことね？」。余裕があって面倒見のいい、お姉さんの話し方。文面は穏やかのものを使う', base: 'gentle', top: 'NP', fp: { m: '私', f: '私', x: '私' }, derive: 'gentle', group: 'soft', reluct: -0.05 },
    devoted: { group: 'polite' },
    devoted_p: { label: '健気（くだけた）', desc: '健気の、敬語を使わない話し方', base: 'devoted', top: 'AC', plain: true, group: 'soft' },
    kohai: { label: '後輩（〜っす）', desc: '「〜っす」「〜じゃないっすか」。人なつっこい後輩の話し方。文面は敬語のものを使う', base: 'polite', top: 'AC', fp: { m: '俺', f: '私', x: '自分' }, derive: 'polite' },
    cool: { firm: 'plain', reluct: 0.05 },
    calm: { label: '冷静（落ち着き）', desc: '動じない、落ち着いた話し方。分析や計算はしない', base: 'cool', top: 'A', calm: true, fp: { m: '俺', f: '私', x: '私' }, firm: 'plain' },
    free: { reluct: -0.25 },
    usan: { label: '胡散臭い（〜だねえ）', desc: '「〜だねえ」「〜ってことかい？」「参ったねえ」「ちょいと、あんた」。のらりくらりと砕けた、どこか信用ならない話し方。文面は穏やかのものを使う', base: 'gentle', top: 'FC', fp: { m: '僕', f: 'あたし', x: '僕' }, derive: 'gentle', reluct: -0.1 },
    shy: { group: 'soft', reluct: 0.2 },
    polite: { group: 'polite', reluct: 0.15 },
    ojou: { label: 'お嬢様（〜ですわ）', desc: '「〜ですわ」「〜ですの？」「〜くださいまし」。上品なお嬢様の話し方。文面は敬語のものを使う', base: 'polite', top: 'CP', fp: { m: 'わたくし', f: 'わたくし', x: 'わたくし' }, derive: 'polite' },
    gentleman: { label: '古風な紳士', desc: '「〜したまえ」「〜ということだね」「〜かい？」。落ち着いた、古風で品のある話し方', base: 'stern', top: 'A', fp: { m: '私', f: '私', x: '私' }, lines: 'base', firm: 'gentleman' },
    sondai: { label: '尊大（〜のかね）', desc: '「君、ふざけているのかね」「私に任せたまえ」「ほう、そういうものかね」。尊大で、やや古風な話し方。めったに取り乱さないが、驚くと声を荒らげる。文面は厳格のものを使う', base: 'stern', top: 'CP', fp: { m: '私', f: '私', x: '私' }, lines: 'base', derive: 'gentleman', firm: 'gentleman', reluct: 0.15 },
    kansai: { label: '関西弁（軽め）', desc: '語尾がやわらかい関西弁。態度はエゴグラムから決まる', base: null, top: null, kansai: true, fp: { m: '俺', f: 'うち', x: 'うち' }, egoTable: true, lines: 'base', reluct: -0.05 },
    noja: { label: 'のじゃ（古風）', desc: '「〜なのじゃ」「〜じゃろう」「〜ぞ」「おぬし」。古風で少し尊大な話し方。態度はエゴグラムから決まる', base: null, top: null, fp: { m: 'わし', f: 'わらわ', x: 'わし' }, egoTable: true, lines: 'base', firm: 'noja', reluct: 0.08 },
    mixed: { label: '敬語まじりのため口', desc: '「私は〇〇です。よろしく」「大丈夫。何とかなります」。説明や頼みごとは敬語で、短い一言・問い・驚き・念押しはため口になる、距離感のゆれる話し方', base: null, top: null, egoTable: true, lines: 'base', reluct: 0.05 },
    mukuchi: { label: '無口', desc: '「……」「……ん」。ほとんど喋らず、話してもひと言だけ。態度はエゴグラムから決まる', base: null, top: null, egoTable: true, lines: 'base', group: 'soft', reluct: 0.12 },
    hero: { label: '熱血（〜だぜ！）', desc: '「任せとけ！」「〜だぜ！」「行くぞ！」。まっすぐで暑苦しい、物語の主人公のような話し方。文面は奔放のものを使う', base: 'free', top: 'FC', fp: { m: '俺', f: 'あたし', x: '俺' }, derive: 'free', noBang: true, reluct: -0.2 },
    gyaru: { label: 'ギャル（マジ・〜じゃん）', desc: '「よろ〜」「マジヤバ！」「チョーイケてる」「そんなん知らんし！」。ノリと勢いのギャルの話し方。文面は奔放のものを使う', base: 'free', top: 'FC', fp: { m: '俺', f: 'あたし', x: 'ウチ' }, derive: 'free', reluct: -0.25 },
    chara: { label: 'チャラい（〜っしょ・サンキュ）', desc: '「よろしゃーっす」「サンキュ！　マジ助かったわ！」「嘘だろ、聞いてねーって」。軽くてノリのいい、チャラ系の話し方。文面は奔放のものを使う', base: 'free', top: 'FC', fp: { m: '俺', f: 'あたし', x: '俺' }, derive: 'free', reluct: -0.3 },
    mystic: { label: 'ミステリアス（〜かい？）', desc: '「〜かい？」「〜しておくれよ」「〜なんだ」「ふふ、どうだろうね」。若いのに、少し文語調で持って回った、つかみどころのない話し方。文面はクールのものを使う', base: 'cool', top: 'A', fp: { m: '僕', f: '私', x: '僕' }, derive: 'cool', reluct: 0.0 },
    genki: { label: '明るい敬語（〜まーす！）', desc: '「よろしくお願いしまーす！」「助かっちゃいました！」「聞いてませんよ〜！」。元気いっぱいの丁寧な話し方。文面は敬語のものを使う', base: 'polite', top: 'FC', fp: { m: '僕', f: '私', x: '私' }, derive: 'polite', group: 'polite', reluct: -0.1 },
    darui: { label: 'けだるげ（ダウナー）', desc: '「……あ。……来たんだ」「……めんどい」。テンションは最低、省エネ。何が起きても「……別に」と受け流す。態度はエゴグラムから決まる', base: null, top: null, fp: { m: '俺', f: 'わたし', x: 'わたし' }, egoTable: true, lines: 'base' },
    /* 2026-10-25：アンケートで希望の多かった口調（仕上げは tone-new.js） */
    keigo_sarc: { label: '無愛想な敬語（〜ですが、何か）', desc: '「……どうも」「それが何か？」。感嘆はほとんどなく、言い切りと皮肉の一言で突き放す敬語。文面は敬語のものを使う', base: 'polite', top: 'A', fp: { m: '私', f: '私', x: '私' }, derive: 'polite', group: 'polite', firm: 'plain', reluct: 0.1 },
    keigo_bossy: { label: '偉そうな敬語（〜なさい）', desc: '「座りなさい」「聞こえませんでしたか？」。丁寧だが上から言い渡す、高圧的な敬語。文面は敬語のものを使う', base: 'polite', top: 'CP', fp: { m: '私', f: '私', x: '私' }, derive: 'polite', group: 'polite', firm: 'plain', reluct: 0.12 },
    keigo_flat: { label: '無機質な敬語', desc: '「了解しました」「問題ありません」。感情を見せず、報告のように淡々と言い切る敬語。文面は敬語のものを使う', base: 'polite', top: 'A', fp: { m: '私', f: '私', x: '私' }, derive: 'polite', group: 'polite', firm: 'plain', reluct: 0.08 },
    tame: { label: 'ふつうのタメ口', desc: '「ねえ、それなんだけど」「いいよ、行こう」。癖のない、友達どうしのような話し方。態度はエゴグラムから決まる', base: null, top: null, plain: true, egoTable: true, noPolite: true, fp: { m: '俺', f: '私', x: '私' }, lines: 'base', reluct: 0 },
    chara_down: { label: 'ダウナー系チャラ男（〜ですよー）', desc: '「あれ、もしかして気があります？」「遊ぶのは大歓迎ですよー。責任は取りませんけど」。軽薄で気だるげ。敬語を交えてからかい、さりげなく距離を詰める。文面は敬語のものを使う', base: 'polite', top: 'FC', fp: { m: 'オレ', f: 'あたし', x: 'オレ' }, derive: 'polite', reluct: -0.25 },
    /* 2026-10-25（二回目）：アンケートの口調の要望（仕上げは tone-new2.js）。axis = { polite: 0 タメ口・1 混ざる・2 敬語, attitude: 態度, ending: 'm'（男性的な語尾が個性。女性でも直さない）|'f'|'n'|'auto' } */
    cool_soft: { label: '冷静（丸い）', desc: '「そう、聞いてなかった」「……まあ、いいけど」。冷静の言い切りを丸くした、落ち着いた話し方。「……」は控えめ。文面は冷静のものを使う', base: 'cool', top: 'A', fp: { m: '俺', f: '私', x: '私' }, derive: 'cool', reluct: 0.05,
      axis: { polite: 0, attitude: 'calm', ending: 'n' } },
    darui_lite: { label: 'けだるげ（軽）', desc: '「……あ、来たんだ」「めんどいし」。けだるげの「……」を一つまでにした、軽めのダウナー。態度はエゴグラムから決まる', base: null, top: null, fp: { m: '俺', f: 'わたし', x: 'わたし' }, egoTable: true, lines: 'base', derive: 'darui',
      axis: { polite: 0, attitude: 'flat', ending: 'n' } },
    boku_n: { label: '中性的（僕）', desc: '「僕は〜だよ」「〜かな」「〜だね」。一人称は「僕」の、やわらかく中性的な話し方。文面は穏やかのものを使う', base: 'gentle', top: 'NP', neutral: true, fp: { m: '僕', f: '僕', x: '僕' }, derive: 'gentle_n', group: 'soft', reluct: 0.02,
      axis: { polite: 0, attitude: 'calm', ending: 'n' } },
    god: { label: '神の命令口調（〜せよ）', desc: '「面を上げよ」「我に従え」「〜であろう」。人ならざるものの、尊大で古めかしい命令口調。邪神村の神や、崇められる役に。文面は厳格のものを使う', base: 'stern', top: 'CP', fp: { m: '我', f: '我', x: '我' }, lines: 'base', derive: 'gentleman', firm: 'gentleman', reluct: 0.2,
      axis: { polite: 0, attitude: 'proud', ending: 'm' } },
    /* 2026-10-26：利用者の要望の口調8つ。書き下ろしも従来の言い換えも持たず、辞書（tone-dict-builtin.js の4回目）だけで作る。
       dictOnly … 1本の台詞にも辞書を当てる（voice.js の processText → HK.Tone.apply1。台詞の形から常体か敬語かを見て、辞書のベースに寄せてから当てる） */
    honwaka: { label: 'ほんわか・おっとり（〜ねえ）', desc: '「そうだねえ」「何とかなるよぉ」「わぁ、すごいねえ」。ゆっくりやわらかい、おっとりした話し方。文面は穏やかのものを使う', base: 'gentle', top: 'NP', fp: { m: '僕', f: '私', x: '私' }, group: 'soft', dictOnly: true, reluct: 0 },
    darui_talk: { label: '言葉数の多いダウナー', desc: '「聞いてないけど。まあ、どうでもいいか」「何とかなるよ。知らないけど」。けだるげなのに、付け足しの一言が多い話し方。文面は穏やかのものを使う', base: 'gentle', top: 'A', fp: { m: '俺', f: 'わたし', x: 'わたし' }, dictOnly: true, reluct: 0 },
    otaku: { label: '男オタク（〜ですぞ）', desc: '「それは聞いていませんぞ」「なんと！」「感謝ですぞ」。丁寧だけど独特の語尾で話す、オタクの話し方。一人称は「拙者」。文面は敬語のものを使う', base: 'polite', top: 'FC', fp: { m: '拙者', f: '私', x: '拙者' }, group: 'polite', dictOnly: true, reluct: -0.05,
      axis: { polite: 2, attitude: 'free', ending: 'm' } },
    tsun_soft: { label: '意地っ張り（柔らかい語尾）', desc: '「聞いてないけど……」「何とかなるよ……」「……ありがと、ね」。意地っ張りの当たりを柔らかくした話し方。文面は意地っ張りのものを使う', base: 'tsun', top: 'CP', fp: { m: '俺', f: '私', x: '私' }, dictOnly: true, reluct: 0.12 },
    keigo_twist: { label: 'ひねくれ敬語（〜ですけどね）', desc: '「へえ、それは聞いていませんが」「まあ、本当に助かりましたけどね」「別に、急がなくていいんじゃないですか」。敬語は崩さず、丁寧なまま冷ややかに捻る話し方。相手の話には「へえ、〜ですね」、勧めには「別に、〜んじゃないですか」、言い返しには「〜ませんが」。「〜けどね」は台詞の締めに時々。文面は敬語のものを使う', base: 'polite', top: 'A', fp: { m: '私', f: '私', x: '私' }, group: 'polite', dictOnly: true, reluct: 0.1 },
    mukuchi_ne: { label: '無口（……だね）', desc: '「え……それ聞いてない」「……無理はしなくていいよ」「……本当だね」。ほとんど喋らず、話してもひと言だけ。無口と違って、元の「よ」「ね」「だね」が残る、少しやさしい話し方。態度はエゴグラムから決まる', base: null, top: null, egoTable: true, group: 'soft', dictOnly: true, reluct: 0.12 },
    ronkyaku: { label: '冷徹な論客（〜なのだよ）', desc: '「フッ……。相変わらず、キミの理屈は破綻しているな」「何とかなるのだよ」。冷静沈着で論理的、プライドが高く慇懃無礼。めったに取り乱さないが、崩れると「バカな……！」。二人称は「キミ」。文面は厳格のものを使う', base: 'stern', top: 'A', fp: { m: '私', f: '私', x: '私' }, firm: 'plain', dictOnly: true, reluct: 0.1,
      axis: { polite: 0, attitude: 'proud', ending: 'm' } },
    flat_plain: { label: '無機質（常体）', desc: '「問題ない。対処できる」「……そうか。それは聞いていない」。考えも感情も読めない、敬語を使わない淡々とした話し方。無口とは違い、文は省略せず淡々と言い切ります。文面は冷静のものを使う', base: 'cool', top: 'A', fp: { m: '私', f: '私', x: '私' }, firm: 'plain', dictOnly: true, reluct: 0.08,
      axis: { polite: 0, attitude: 'flat', ending: 'm' } }
  };
  HK.TONES = TONES;
  /* 選択欄の並び（基本口調の名前は persona.js、追加の口調は TONE_EXTRA） */
  /* 設定画面の台詞の見本：全口調で同じ6文（自己紹介・驚き・気遣い・お礼・励まし・二人称の見本）を3本で持ち、口調の辞書と書き下ろし（tone-sample-fix.js）で口調ごとの形にする。
     {n}=本人、{o}=相手。一人称は「私」、二人称は「あなた」（話し手の設定で置き換わる） */
  HK.TONE_SAMPLE = [
    '{n}「私は{n}。よろしくね｜私は{n}だ。よろしく頼む｜私は{n}です。よろしくお願いします」',
    '{n}「え、それ聞いてない｜何、それは聞いていない｜え、それは聞いていません」',
    '{n}「{o}、無理しないで。ほら、座って｜{o}、無理をするな。座れ｜{o}さん、無理をしないでください。ほら、座ってください」',
    '{n}「ありがとう。ほんとに助かった｜助かった。感謝する｜ありがとうございます。本当に助かりました」',
    '{n}「大丈夫。何とかなるよ｜大丈夫だ。何とかなる｜大丈夫です。何とかなります」',
    /* 6文目：二人称（2回）と一人称（1回）がどう置き換わるかを見る文 */
    '{n}「{o}、あなたはどうしたい？　私は、あなたの決めたことに乗るよ｜{o}、あなたはどうしたい。私は、あなたの決めたことに乗る｜{o}さん、あなたはどうしたいですか？　私は、あなたの決めたことに乗ります」'
  ];
  HK.TONE_KEYS = Object.keys(TONES).filter(function (k) { return HK.PERSONA[k] || TONES[k].label; });
  HK.TONE_EXTRA = {};
  HK.TONE_KEYS.forEach(function (k) { if (!HK.PERSONA[k]) HK.TONE_EXTRA[k] = TONES[k]; });
  /* 口調の項目を引く（なければ undefined） */
  HK.toneOpt = function (k, name) { var d = k && TONES[k]; return d ? d[name] : undefined; };
  /* 男性的な語尾そのものが口調の個性の口調（女性が選んでも「〜ぞ」「〜ねえ」などを女性の言い方に直さない。tone-plus.js の V.genderEnd） */
  var MASC_END = { yankee: 1, aniki: 1, hero: 1, chara: 1, noja: 1, gentleman: 1, sondai: 1 };
  /* 口調の軸（axis）。書いていない口調は、ほかの項目から大まかに決める */
  HK.toneAxis = function (k) {
    var d = k && TONES[k];
    if (!d) return null;
    if (d.axis) return d.axis;
    return { polite: d.group === 'polite' ? 2 : k === 'mixed' ? 1 : 0, attitude: d.firm ? 'firm' : d.group === 'soft' ? 'soft' : 'plain', ending: d.neutral ? 'n' : MASC_END[k] ? 'm' : 'auto' };
  };
  /* 語尾の付け替え（derive の口調）：tone-polite-kin.js などで登録し、voice.js の V.toneFinish から呼ばれる */
  HK.TONE_FINISH = HK.TONE_FINISH || {};
  /* 口調ごとの既定の二人称（キャラの二人称の設定が空のとき）。文面の表から来た「あなた」「お前」「きみ」の混ざりを、口調と性別でそろえる。
     {m, f, x} で性別ごとに。文字列なら性別を問わない。voice.js の仕上げの後に HK.Voice.applyYou で置き換える */
  var MF = function (m, f) { return { m: m, f: f, x: m }; };
  HK.TONE_YOU = {
    proud: MF('お前', 'あんた'), aniki: MF('お前', 'あんた'), yankee: MF('お前', 'あんた'), hero: MF('お前', 'あんた'), chara: MF('お前', 'あんた'),
    stern: MF('お前', 'あなた'), gentleman: '君', sondai: '君', cool: MF('お前', 'あなた'), calm: MF('君', 'あなた'), mystic: '君',
    tsun: 'あんた', tsun_n: 'あんた', gyaru: MF('お前', 'あんた'), free: MF('お前', 'あんた'), usan: 'あんた', darui: 'あんた',
    gentle: 'きみ', gentle_n: 'きみ', gentle_m: 'きみ', ane: 'あなた', devoted: 'あなた', devoted_p: 'あなた', shy: 'あなた',
    polite: 'あなた', ojou: 'あなた', kohai: 'あなた', genki: 'あなた', mixed: 'あなた',
    kansai: MF('お前', 'あんた'), noja: 'おぬし', mukuchi: MF('お前', 'あんた'),
    keigo_sarc: 'あなた', keigo_bossy: 'あなた', keigo_flat: 'あなた', tame: MF('お前', 'あんた'), chara_down: 'キミ',
    cool_soft: MF('君', 'あなた'), darui_lite: 'あんた', boku_n: 'きみ', god: '汝',
    honwaka: 'あなた', darui_talk: 'あんた', otaku: '貴殿', tsun_soft: 'あんた', keigo_twist: 'あなた', mukuchi_ne: MF('お前', 'あんた'), ronkyaku: 'キミ', flat_plain: 'あなた'
  };
  HK.toneYou = function (tone, gender) { var v = HK.TONE_YOU[tone]; if (!v) return ''; if (typeof v === 'string') return v; return v[gender === 'f' ? 'f' : gender === 'x' ? 'x' : 'm'] || ''; };
  HK.toneFinish = function (k, fn) { HK.TONE_FINISH[k] = fn; };   /* fn(台詞, 話し手, { kg: 敬語の相手か, raw: 元の台詞 }) */
  /* 台詞ごとに決まる「くじ」（同じ台詞はいつも同じ結果）。n 回に 1 回 true */
  HK.lineLot = function (q, n) { var h = 7; for (var i = 0; i < q.length; i++) h = (h * 31 + q.charCodeAt(i)) % 100003; return h % n === 0; };
  /* 「あらあら」「あら」を口調の感嘆詞に替えるときの間引き。
     喘ぎの台詞では「あ」にする。台詞がその感嘆詞だけなら替える。続きがある台詞は三回に一回だけ替え、残りは感嘆詞ごと外す
     rep = { 'あらあら': 'おやおや', 'あらまあ': 'おやまあ', 'あら': 'おや' } */
  HK.thinIntj = function (q, rep) {
    var moan = /[っッぁぃぅぇぉ♡]/.test(q), lot = HK.lineLot(q, 3);
    return q.replace(/(^|[、…‥「\s])(あらあら|あらまあ|あ、あら|あら)([、…‥。！？!?]*)/g, function (m, pre, w, p, at, all) {
      if (w === 'あら' && !p) return m;
      var rest = all.slice(at + m.length);
      if (moan) return pre + (w === 'あ、あら' ? 'あ、あ' : 'あ') + p;
      var r = w === 'あ、あら' ? rep['あら'] && rep['あら'].charAt(0) + '、' + rep['あら'] : rep[w] || rep['あら'];
      if (!r) return m;
      /* 続きが短い（「あら、上手」）なら外さない */
      if (rest.replace(/[、…‥。！？!?」\s]/g, '').length <= 4 || lot) return pre + r + p;
      return pre === '、' ? '' : pre;
    });
  };
})();
