/* 箱庭シミュレーター: クラスメイトの誕生日の祝い方（HK.Birthday。全年齢版・R18版共通。classroom-life.js の直前に読む）
   ・本人と特に近い人（恋人・本命・片想い・親友・相棒・家族。最大3人）は一人ずつ個別の記録。恋人がいれば恋人を先に
   ・それ以外の「覚えていた」人は、行動の種類ごとに一つの記録にまとめる（記録は個別とまとめを合わせて最大5つ。あふれた分は「ほかにも」の一つに）
   ・三人以上が同じ行動をしたら、まとめた記録の末尾に笑い話（祝う側の態度の組み合わせ4種×5文）と本人の反応（態度9種）を足す。
     笑い話になった回は、まとめられた全員の間で信頼が少し上がる（why に「祝福・仲良し」）
   ・贈り物は12種（購買のプリン・缶ジュース・手作りの菓子・文房具・手紙・歌・黒板の落書き・写真・放課後の誘い・おごり・一言だけ・翌日に謝る）。
     祝う側の態度と関係で選び方を偏らせ、同じ日に誰かが選んだものは、ほかの人も選びやすい（被る）
   ・好きな食べ物（HK.Food.like）が決まっている本人には、仲の良い人は好物をちゃんと渡せる。仲が浅い人・空回りしやすい人（奔放・恥じらい・健気で信頼が足りない）は、
     嫌いな物（HK.Food.hate）や的外れな物を渡して空回る（本人の反応：隠す・正直に言う・あとで誰かが食べる。態度で）。HK.Food が無いときは今までどおりの種類から
   ・人数が少ない（4人以下）ときは、まとめずに一人ずつ出す
   ・同じ一文が人数ぶん並ぶほかの出来事（転校の噂）も、同じようにまとめる（B.transfer） */
(function () {
  'use strict';
  var HK = window.HK;
  if (!HK) return;
  var B = HK.Birthday = {};
  function L(s) { return s.split('|'); }
  function R(ctx, a, b) { return ctx.R(a, b); }
  function per(c) { return HK.personaOf ? HK.personaOf(c) : 'gentle'; }
  function foodOf(c, k) {
    var F = HK.Food;
    if (!F || typeof F[k] !== 'function') return [];
    var v = F[k](c);
    return (Array.isArray(v) ? v : v ? [v] : []).map(function (x) { return x && typeof x === 'object' ? x.name || x.label || '' : String(x || ''); }).filter(Boolean);
  }
  var KN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  function cnt(n, ctr) { return n <= 10 ? KN[n] + ctr : n + (ctr === 'つ' ? '個' : ctr); }
  /* 人の並び：二人は「AとB」、三〜六人は「A・B・Cの3人」、七人以上は「A・B・C・D・Eたち9人」 */
  function grp(list) {
    var n = list.map(function (c) { return c.name; });
    if (n.length === 1) return n[0];
    if (n.length === 2) return n[0] + 'と' + n[1];
    if (n.length <= 6) return n.join('・') + 'の' + n.length + '人';
    return n.slice(0, 5).join('・') + 'たち' + n.length + '人';
  }
  /* 文の穴埋め：{a}本人 {b}祝う人 {c}三人目 {n}人の並び {x}笑い話で口を開く人 {item}{like} 物 {list} 種類の並び {k:つ} 人数×助数詞 */
  function fill(ctx, s, v) {
    s = s.replace(/\{k:(.)\}/g, function (m, c) { return cnt(v.k || 0, c); });
    s = s.replace(/\{(n|x|item|like|list|raw)\}/g, function (m, k) { var x = v[k]; return x == null ? '' : typeof x === 'string' ? x : x.name; });
    return ctx.t(s, v.a, v.b, v.c);
  }

  /* ======================= 贈り物の種類 ======================= */
  /* one：一人の記録（{a}本人 {b}祝う人）／many：まとめた記録（{n}）／pile：三人以上のときの「並んだ」一文／label：「ほかにも」の並びに出す名前 */
  var KIND = {
    purin: { label: 'プリン',
      one: L('{b}は、購買のプリンを一つ{a}の机に置いていった。名前は書かなかった。|{b}は昼休み、購買で最後の一個だったプリンを買って、{a}に渡した。「誕生日でしょ」|{a}が席に戻ると、机の上にプリンが一つと、「おめでとう」と書いた付箋があった。{b}の字だった。'),
      many: L('{n}は、それぞれ購買のプリンを{a}の机に置いていった。|昼休みのあいだに、{n}が入れ替わりで{a}の机にプリンを置いていった。|{n}は、示し合わせたわけでもないのに、そろって購買のプリンを{a}に渡した。'),
      pile: L('{a}の机の上に、プリンが{k:つ}並んだ。|購買のプリンは、その日{a}の机の上だけで{k:つ}売れた計算になった。') },
    juice: { label: '缶ジュース',
      one: L('{b}は{a}に「誕生日でしょ」と言って、紙パックのジュースを一本おごった。|{b}は自販機の前で{a}を呼び止めて、「好きなの押していいよ」と小銭を入れた。|{b}は、冷えた缶ジュースを{a}の首筋に押し当てた。「おめでと。これ、プレゼント」'),
      many: L('{n}は、それぞれ{a}に缶ジュースを一本ずつおごった。|{n}は、休み時間のたびに、代わる代わる{a}に飲み物を差し入れた。|{n}は、そろって自販機のジュースを{a}の机に置いていった。'),
      pile: L('{a}の机の上に、缶ジュースが{k:本}並んだ。|{a}の机は、ちょっとした自販機のようになった。数えると{k:本}あった。') },
    sweets: { label: '手作りのお菓子',
      one: L('{b}は、手作りのクッキーを小さな袋に詰めて、{a}に渡した。「味見はしたから、たぶん大丈夫」|{b}は朝早く来て、{a}の机にマフィンを一つ置いていった。まだ少し温かかった。|{b}は「昨日焼いたんだ」と言って、{a}にカップケーキを差し出した。上にはチョコペンで{a}の名前が書いてあった。'),
      many: L('{n}は、それぞれ手作りのお菓子を{a}に渡した。|{n}は、前の晩にそれぞれ家でお菓子を焼いてきていた。全部、{a}の分だった。|{n}は、そろって手作りのお菓子の包みを{a}の机に置いた。'),
      pile: L('{a}の机には、手作りのお菓子の包みが{k:つ}積み上がった。|{a}の机の上は、小さなお菓子屋さんのようになった。包みは{k:つ}あった。') },
    stationery: { label: '文房具',
      one: L('{b}は{a}に、少し高いボールペンを一本渡した。「使ってるの、インク切れそうだったでしょ」|{b}は、{a}が前に欲しがっていた色の付箋を、何も言わずに{a}の筆箱に入れておいた。|{b}は「実用的なのがいいと思って」と言って、{a}にシャープペンの替え芯を一箱渡した。'),
      many: L('{n}は、それぞれ{a}に文房具を贈った。|{n}は、そろって{a}にペンを一本ずつ渡した。|{n}は、思い思いの文房具を{a}の机に置いていった。'),
      pile: L('{a}の筆箱には入りきらないほど、新しいペンが増えた。{k:本}あった。|{a}は、この一年はもう文房具を買わなくていいくらいの量を受け取った。') },
    letter: { label: '手紙',
      one: L('{b}は、小さく折りたたんだ手紙を{a}の机に入れておいた。「誕生日おめでとう。いつもありがとう」とだけ書いてあった。|{b}は授業中、後ろから{a}にメモを回した。開くと、「おめでとう」の文字と下手な絵が描いてあった。|{b}は帰り際、{a}に封筒を渡した。「家に帰ってから読んで」'),
      many: L('{n}は、それぞれ{a}に手紙を書いた。|{n}は、そろって{a}の机に小さな手紙を入れておいた。|{n}から、授業中に代わる代わるメモが回ってきた。どれにも「おめでとう」と書いてあった。'),
      pile: L('{a}の机の中は、{k:通}の手紙でいっぱいになった。|{a}の机の中から、手紙が{k:通}出てきた。') },
    song: { label: '歌',
      one: L('{b}は昼休み、いきなり{a}の前で「ハッピーバースデー」を歌いだした。{a}は顔を覆った。|{b}は朝の挨拶の代わりに、{a}に向かってバースデーソングを一節だけ歌った。|{b}は放課後、{a}の前で手拍子をしながら誕生日の歌を歌った。途中で歌詞を間違えて、二人で笑った。'),
      many: L('{n}は、それぞれ{a}の前で誕生日の歌を歌った。|{n}は、休み時間のたびに代わる代わる「ハッピーバースデー」を歌いだした。|{n}は、{a}の顔を見るたびに、思い出したように誕生日の歌を口ずさんだ。'),
      pile: L('その日、{a}は誕生日の歌を{k:回}聞いた。|{k:回}目の「ハッピーバースデー」には、教室じゅうが手拍子をしていた。') },
    board: { label: '黒板の落書き',
      one: L('朝、{a}が教室に入ると、黒板いっぱいに「HAPPY BIRTHDAY」の文字が描かれていた。描いたのは{b}だった。|{b}は休み時間に、黒板の隅に小さく{a}の似顔絵とケーキを描いた。|{b}は日直の欄の横に、「今日は{a}の誕生日」と大きく書き足した。'),
      many: L('{n}は、それぞれ黒板に{a}へのお祝いを書き込んだ。|朝、{a}が教室に入ると、黒板には{n}が描いたお祝いの落書きが並んでいた。|{n}は、休み時間ごとに黒板の「おめでとう」を一つずつ増やしていった。'),
      pile: L('黒板には、{k:人}ぶんの「おめでとう」が重なり合って、何が何だか分からなくなっていた。|黒板は{k:人}ぶんのお祝いで埋まり、一時間目の先生が消すのをためらった。') },
    photo: { label: '写真',
      one: L('{b}は、春から撮りためていた{a}の写真を一枚ずつ選んで、小さなアルバムにして渡した。|{b}は昼休み、{a}を引っぱって教室の真ん中で一緒に写真を撮った。「誕生日の記念」|{b}は、{a}が写っている写真を何枚か選んで、「誕生日おめでとう」と一緒に送った。'),
      many: L('{n}は、それぞれ{a}に写真を送った。|{n}は、かわるがわる{a}と並んで記念写真を撮った。|{n}から、{a}の写っている写真がまとめて送られてきた。'),
      pile: L('{a}の携帯には、その日だけで{k:人}から写真が届いた。|その日の{a}は、{k:回}も記念写真に呼ばれた。') },
    invite: { label: '放課後の誘い',
      one: L('{b}は放課後、{a}を駅前のクレープ屋に誘った。「今日は奢り。誕生日だから」|{b}は{a}を引き止めて、コンビニのケーキにろうそくを一本立てた。|{b}は「ちょっと付き合って」と{a}を連れ出し、ゲームセンターで{a}の欲しがっていた景品を取ってみせた。'),
      many: L('{n}は、それぞれ放課後に{a}を誘った。|{n}は、そろって{a}を放課後の寄り道に誘った。|放課後、{n}が代わる代わる{a}に声をかけた。どれも「ちょっと寄っていかない？」だった。'),
      pile: L('放課後、{a}を誘った{k:人}は、全員が同じ店の前で鉢合わせした。|{a}の放課後は、{k:件}の誘いで埋まった。') },
    treat: { label: 'おごり',
      one: L('{b}は昼休み、{a}の分のパンも買ってきた。「今日くらいは出す」|{b}は学食で、{a}のトレーにデザートを一つ足して、黙って会計を済ませた。|{b}は「誕生日だから好きなの頼んで」と言って、{a}に学食の券を渡した。'),
      many: L('{n}は、それぞれ{a}に昼ご飯をおごろうとした。|昼休み、{n}が代わる代わる{a}の分のパンを買ってきた。|{n}は、そろって学食で{a}の分まで払おうとした。'),
      pile: L('昼休み、{a}の前に{k:人}ぶんのパンが並んだ。|{a}は{k:人}からおごられそうになり、弁当を抱えたまま立ちつくした。') },
    word: { label: 'ひと言',
      one: L('{b}は朝いちばんに「誕生日おめでとう」と言った。{a}は、それだけで一日機嫌がよかった。|{b}はすれ違いざまに「おめでと」とだけ言って、そのまま歩いていった。|{b}は何も用意していなかったが、帰り際に「誕生日、おめでとう」とだけ言った。{a}は少し笑った。'),
      many: L('{n}は、それぞれ{a}に「誕生日おめでとう」と声をかけた。|{n}は、すれ違うたびに{a}に「おめでとう」と言った。|{n}は、何も用意していなかったが、ひと言だけ{a}にお祝いを言った。'),
      pile: L('その日、{a}は「誕生日おめでとう」を{k:回}聞いた。|{a}は、廊下を歩くだけで{k:回}「おめでとう」と言われた。') },
    late: { label: '一日遅れの「おめでとう」',
      one: L('{b}は、{a}の誕生日を一日過ぎてから思い出した。翌朝いちばんに「ごめん、昨日だったよね」と謝った。|翌日、{b}は{a}の机の前で両手を合わせた。「誕生日、完全に忘れてた。ごめん。おめでとう」|{b}は翌日になって、慌てて購買のパンを{a}に差し出した。「一日遅れだけど……おめでとう」'),
      many: L('{n}は、翌日になって{a}の誕生日だったことを思い出した。|翌朝、{n}が次々に{a}のところへ来て「昨日だったよね、ごめん」と謝った。|{n}は、一日遅れでそれぞれ{a}に「おめでとう」を言いに来た。'),
      pile: L('翌朝、{k:人}が揃って{a}の机の前に並び、同時に頭を下げた。|{a}は翌日、{k:回}も「ごめん、昨日だったよね」を聞いた。') },
    like: { label: '好物',
      one: L('{b}は、{a}の好きな{like}を覚えていた。「誕生日、おめでとう」――差し出された袋の中身を見て、{a}の顔がぱっと明るくなった。|{b}は放課後、{a}に小さな袋を渡した。中には{a}の好物の{like}が入っていた。「前に好きって言ってたから」|{a}の机に、{like}が一つ置いてあった。添えられたメモの字で、{b}だと分かった。好物を覚えていてくれたことが、{a}には何より嬉しかった。'),
      many: L('{n}は、そろって{a}の好物の{like}を覚えていた。|{n}は、それぞれ{a}の好きな{like}を買ってきた。|{n}は、示し合わせたわけでもないのに、全員が{a}の好物の{like}を選んでいた。'),
      pile: L('{a}の机の上に、好物の{like}が{k:つ}並んだ。|{a}の鞄は、その日{like}で満杯になった。{k:つ}あった。') },
    miss: { label: '的外れな贈り物',
      one: [],
      many: L('{n}は、それぞれ{a}に{item}を渡した。{a}の好みとは、まるで違っていた。|{n}は、そろって{a}のために{item}を選んでいた。よりによって、{a}の好きではない物だった。'),
      manyHate: L('{n}は、それぞれ{a}に{item}を渡した。{a}が{raw}を苦手なことは、誰も知らなかった。|{n}は、そろって{a}のために{item}を選んでいた。よりによって、{a}のいちばん苦手な{raw}入りだった。'),
      pile: L('{a}の机の上に、{item}が{k:つ}並んだ。|{a}の鞄には、好きでもない{item}が{k:つ}増えた。') }
  };
  /* 形の残らない種類（本人の反応・笑い話で「贈り物の山」と言わない） */
  var NOOBJ = { song: 1, board: 1, invite: 1, word: 1, late: 1, photo: 1, treat: 1 };
  /* 態度ごとの選びやすさ（祝う側） */
  var KW = {
    proud: { juice: 3, treat: 3, word: 2, purin: 2, invite: 1 },
    stern: { stationery: 3, letter: 2, word: 3, treat: 1 },
    tsun: { purin: 3, juice: 2, late: 2, word: 2, sweets: 1 },
    gentle: { sweets: 3, letter: 2, purin: 2, invite: 1 },
    devoted: { sweets: 3, letter: 3, stationery: 2 },
    cool: { stationery: 3, word: 3, photo: 2 },
    free: { song: 3, board: 3, invite: 2, photo: 2, late: 1 },
    shy: { letter: 3, purin: 3, stationery: 2 },
    polite: { letter: 3, stationery: 2, sweets: 2 }
  };
  /* 的外れな物（好物と重なるものは除く） */
  var CARRY = ['パン', 'おにぎり', 'サンドイッチ', 'マフィン'];
  var OFF = ['激辛のスナック', 'ブラックの缶コーヒー', '梅干し味の飴', '酢昆布', 'わさび味のおせんべい', 'ミントのガム', '青汁の粉末', 'ゴーヤのチップス'];

  /* ======================= 関係 ======================= */
  var KIN = ['sibling', 'sibprot', 'sibclose', 'stepsib', 'relative', 'parent', 'pparent'];
  var RANK = { lover: 0, honmei: 1, crush: 2, best: 3, kin: 4 };
  function closeOf(ctx, o, t) {
    var pf = ctx.pair(o, t), T = HK.Ties, r = R(ctx, o, t), rom = ctx.romanceOk([o, t]);
    if (pf.couple) return 'lover';
    if (pf.kin || (T && T.has && KIN.some(function (x) { return T.has(ctx, o, t, x); }))) return 'kin';
    if (rom && T && T.from && T.from(ctx, o, t, 'honmei')) return 'honmei';
    if (T && T.has && (T.has(ctx, o, t, 'best') || T.has(ctx, o, t, 'buddy') || T.has(ctx, o, t, 'childhood'))) return 'best';
    if (rom && r.att > 50 && HK.canLove(o, t)) return 'crush';
    if (r.aff > 55 && r.trust > 35) return 'best';
    return null;
  }
  var TIE = { lover: '恋人', honmei: '本命', crush: '片想い', best: '親友', kin: '家族' };
  /* 覚えていたか：近い人は必ず。それ以外は好意・惹かれ・面倒見（NP）しだいで、仲がいいほど覚えている */
  function remembers(ctx, o, t) {
    if (o.role === 'teacher') return false;
    var r = R(ctx, o, t);
    if (r.ten > 60 && r.aff < 10) return false;
    if (closeOf(ctx, o, t)) return true;
    if (r.aff <= 5 && r.att <= 20) return false;
    var p = -0.2 + Math.max(0, r.aff) / 100 + Math.max(0, r.att) / 120 + o.tr.np * 0.25;
    return ctx.rng() < Math.min(0.75, p);
  }
  /* 近い人の個別の文（{a}本人 {b}祝う人） */
  var CLOSE = {
    lover: L('{b}は放課後の教室で、{a}に小さな箱を渡した。「誕生日、おめでとう。……一番に言いたかった」|{b}は{a}の誕生日に、一緒に帰ろうと声をかけた。途中で寄った公園で、手作りのお守りを渡した。|{b}は朝、{a}の家の前で待っていた。「おめでとう。今日は一日、隣にいさせて」|{b}は、{a}が前に一度だけ「いいな」と言った髪留めを、ちゃんと覚えていた。放課後、二人きりになってから渡した。'),
    honmei: L('{b}は一日じゅう、{a}に渡す包みを鞄の中で握りしめていた。放課後になって、ようやく「誕生日、おめでとう」と差し出した。|{b}は、誰よりも早く{a}に「おめでとう」を言うために、いつもより一時間早く登校した。|{b}は{a}に、何週間も前から選んでいたキーホルダーを渡した。「……似合うと思って」'),
    crush: L('{b}は、{a}の机にそっと小さな包みを置いた。名前は書かなかったが、{a}の方をちらちら見ていたのですぐに分かった。|{b}は「ついでだから」と言って、{a}に可愛いラッピングの包みを渡した。ついでにしては、包み紙が丁寧すぎた。|{b}は帰り道で{a}に追いついて、息を切らしながら「お、おめでとう」と言った。それだけ言って、走って帰った。'),
    best: L('{b}は朝いちばんに{a}の机まで来て、「誕生日おめでと！」と背中を叩いた。手には、二人で前から気になっていた店のお菓子の袋があった。|{b}は{a}のために、昼休みに小さなお菓子の山を作った。{a}は「大げさだって」と言いながら、笑っていた。|{b}は{a}の机にこっそり寄せ書きの色紙を置いておいた。{a}は昼休みまで気づかなかった。|{b}は「誕生日だから、今日は全部付き合う」と言って、放課後、{a}の寄り道に最後までついていった。'),
    kin: L('{b}は朝、家を出るときに「誕生日おめでとう」と言った。照れくさくて、学校ではそれ以上何も言わなかった。|{b}は昼休み、{a}の教室までわざわざ来て、小さな包みを置いていった。「家だと渡しにくいから」|{b}は帰り道、{a}の好きなケーキ屋に寄って、二人分のケーキを買った。「家で食べよう」')
  };

  /* ======================= 空回り（{a}本人 {b}祝う人 {c}三人目 {item}） ======================= */
  var MISS = {
    hate: L('{b}は張り切って、{a}に{item}を渡した。……{a}が{raw}を苦手なことを、{b}は知らなかった。|{b}「誕生日おめでとう！　これ、絶対好きだと思って」――差し出されたのは{item}だった。{a}のいちばん苦手な{raw}が、たっぷり入っていた。|{b}は{a}のために、わざわざ{item}を用意した。よりによって、{a}が苦手な{raw}の入ったものだった。'),
    off: L('{b}は{a}に{item}を渡した。「好きそうだと思って」――{a}の好みとは、だいぶ違っていた。|{b}は悩みに悩んだ末に、{item}を選んだ。{a}がそれを好きだと言ったことは、一度もなかった。|{b}「誕生日だから、ちょっと珍しいのにしてみた」――{item}だった。{a}は一瞬、言葉に詰まった。')
  };
  /* 本人の反応：隠す（穏やか・健気・敬語・恥じらい・意地っ張り）／正直に言う（強気・厳格・冷静・奔放） */
  var MISS_RE = {
    gentle: L('{a}は「ありがとう」とにっこり笑って、{item}を大事そうに鞄にしまった。好みではないことは、最後まで言わなかった。|{a}「わあ、ありがとう」――{a}は嬉しそうに受け取った。{item}が得意でないことは、{b}には内緒にした。'),
    devoted: L('{a}「う、嬉しいです……！」――{a}は{item}を両手で受け取り、その夜、涙目で全部食べた。|{a}は{item}を見て一瞬固まったが、すぐに笑顔を作った。{b}の気持ちが嬉しかったのは、本当だった。'),
    polite: L('{a}は丁寧にお礼を言って、{item}を受け取った。好みでないことは、おくびにも出さなかった。|{a}「お気遣い、ありがとうございます」――{a}は{item}を上品に受け取って、そっと鞄にしまった。'),
    shy: L('{a}は何も言えずに、{item}を受け取った。家に帰ってから、どうしようかと一時間悩んだ。|{a}「あ、ありがとう……」――{a}は{item}を抱えたまま、困ったように笑った。'),
    tsun: L('{a}「べ、別に嫌いじゃないし」――そう言いながら、{a}は{item}を鞄の奥深くにしまい込んだ。|{a}「……まあ、もらってあげる」――{a}は{item}を受け取ったが、包みを開けようとはしなかった。'),
    proud: L('{a}「……悪い、{item}は得意じゃない。気持ちだけもらっとく」――{b}はがっくり肩を落とした。|{a}「{item}って……分かってねえな」――{a}は笑って、{b}の頭を軽く小突いた。{b}は「来年こそ」と拳を握った。'),
    stern: L('{a}「ありがとう。……だが、{item}は得意ではないんだ。正直に言っておく」――{b}は「次は覚えておく」と頭をかいた。|{a}は{item}を受け取って、まっすぐに言った。「すまない、これは苦手だ。でも、気持ちは嬉しい」'),
    cool: L('{a}「{item}は好みじゃない。でも、選んでくれた時間には礼を言う」――{b}は、喜んでいいのか分からない顔をした。|{a}は{item}をしばらく眺めてから、「次の参考に、好きな物を教えておく」と言った。{b}は真剣にメモを取った。'),
    free: L('{a}「うわ、{item}！　ごめん、これだけはムリ！」――正直すぎる反応に、{b}は思わず笑ってしまった。|{a}は{item}を見るなり「なんでこれ！？」と叫んだ。{b}もつられて笑いだし、二人でしばらく笑い転げた。')
  };
  var MISS_GEN = L('{a}は{item}を受け取って、少し困ったように笑った。|{a}は「ありがとう」と言って、{item}をそっと鞄にしまった。|{a}は{item}をしばらく見つめてから、「……気持ちは嬉しい」と言った。');
  var MISS_EAT = L('{a}がどうしようか迷っていると、{c}が横から「いらないならちょうだい」と手を出した。{item}は、{c}がおいしそうに食べた。|結局、{item}は{c}が「もったいない」と言って食べた。{b}は少しだけ複雑な顔をした。|{a}は{item}を、こっそり{c}に渡した。{c}は事情を察して、黙って食べてくれた。');

  /* ======================= 笑い話（三人以上が同じ行動） ======================= */
  /* 祝う側の態度の組み合わせ：にぎやか（奔放・強気・意地っ張り）／おとなしい（恥じらい・健気・穏やか・敬語）／淡々（冷静・厳格）／入り混じる */
  var JOKE = {
    loud: L('{x}「……え、みんな同じ？」――{k:人}は顔を見合わせて、いっせいに吹き出した。|{x}「私たち、気が合いすぎじゃない？」――教室じゅうが笑いに包まれた。|誰かが「打ち合わせした？」と聞き、{k:人}が声を揃えて「してない」と答えた。それでまた笑いが起きた。|{x}が「次は被らないように相談しよう」と言いだし、なぜか来年の作戦会議が始まった。|{x}「真似したでしょ」「そっちこそ」――言い合いは、すぐに笑い声に変わった。'),
    quiet: L('{k:人}は、互いの手元を見て気まずそうに笑った。{x}が小さく「……私たち、気が合うね」と言うと、ようやく空気がほどけた。|同じものを持った{k:人}は、顔を見合わせて、照れくさそうに笑い合った。|{x}「あ……同じ、ですね」――それを合図に、{k:人}はこらえきれずに笑いだした。|{k:人}は、しばらく黙って並んだ贈り物を見つめていた。誰からともなく、くすくすと笑いが漏れた。|{x}は「かぶっちゃった」と頭をかいた。ほかの人たちも同じ顔をしていたので、みんなで笑った。'),
    calm: L('{x}は並んだ贈り物を見て、「この一致率は興味深い」と言った。誰かが吹き出した。|{x}「……考えることは同じらしい」――淡々とした一言に、教室が笑いに包まれた。|{x}は眉ひとつ動かさずに「被ったな」とだけ言った。それがかえって可笑しくて、みんなが笑った。|{k:人}は、互いの贈り物を見比べて、無言で頷き合った。その妙な連帯感に、周りが笑った。|{x}「来年は事前に申告制にしよう」――大真面目な提案に、教室じゅうが笑った。'),
    mix: L('{x}が「……私たち、気が合うね」と言って、教室が笑いに包まれた。|{k:人}は顔を見合わせた。打ち合わせをした覚えは、誰にもなかった。次の瞬間、全員が笑いだした。|あまりの被りっぷりに、隣のクラスからまで見物人が来た。{k:人}は、なぜか少し誇らしげだった。|{x}が「もう同盟組もう」と言いだし、{k:人}は、その場で「誕生日同盟」を結成した。|{k:人}は、同じものを手にした互いを指さして笑った。笑い声は、しばらく止まらなかった。')
  };
  var MOOD = { free: 'loud', proud: 'loud', tsun: 'loud', shy: 'quiet', devoted: 'quiet', gentle: 'quiet', polite: 'quiet', cool: 'calm', stern: 'calm' };
  /* 本人の反応（照れる・困る・喜ぶ・数える・一つだけ大事に持ち帰る。態度9種） */
  var REACT = {
    proud: L('{a}「……多すぎだろ。まあ、もらっとく」――そう言いながら、{a}は一つ残らず鞄に詰めた。|{a}は「どんだけ祝われてんだ」と笑って、全部まとめて抱えて帰った。'),
    stern: L('{a}は一人ずつに礼を言って回り、律儀に全員の名前を手帳に書き留めた。|{a}「……ありがとう。来年は、ちゃんと返す」――{a}は真面目な顔で、贈り物を一つずつ確かめた。'),
    tsun: L('{a}「べ、別に嬉しくないし。……全部もらうけど」|{a}は「こんなにいらない」と言いながら、一つも人に譲らなかった。'),
    gentle: L('{a}は「ありがとう、みんな」と笑って、その日の放課後、もらったものを少しずつみんなに分けて回った。|{a}は嬉しそうに目を細め、一人ひとりに「ありがとう」と言って回った。'),
    devoted: L('{a}は何度も頭を下げた。「こんなに……ありがとうございます」――目が少し潤んでいた。|{a}は一つひとつを大事そうに抱えて、「全部、大切にします」と言った。'),
    cool: L('{a}は、誰から何をいくつもらったのか数えようとして、途中でやめた。|{a}「これで{k:つ}目だ」――そう言った{a}の口元は、少しだけ緩んでいた。'),
    free: L('{a}は「最高！」と両手を上げて、贈り物の山を嬉しそうに眺めた。|{a}「みんな最高！」――{a}は贈り物の山に抱きついて、また笑いを誘った。'),
    shy: L('{a}は真っ赤になって、贈り物の山の陰に隠れるようにうつむいた。|{a}「あ、ありがとう……」――消え入りそうな声だったが、顔はずっと緩んでいた。'),
    polite: L('{a}は一人ひとりに丁寧にお礼を言った。「皆さん、本当にありがとうございます」|{a}は、もらったものの中から一つだけを大事そうに持ち帰った。ほかのものは、翌日きちんとみんなで分けた。')
  };
  /* 形の残らない祝い方（歌・落書き・誘い・ひと言など）への本人の反応 */
  var REACT_X = {
    proud: L('{a}「……祝われすぎだろ」――そう言いながら、{a}はまんざらでもない顔をしていた。|{a}は「暇なのか」と笑ったが、その日はずっと機嫌がよかった。'),
    stern: L('{a}は「……ありがとう」と一人ずつに頭を下げた。少しだけ、声が震えていた。|{a}は咳払いをして表情を引き締めようとしたが、うまくいかなかった。'),
    tsun: L('{a}「べ、別に嬉しくないし」――そう言う{a}の耳は、真っ赤だった。|{a}は「大げさなんだから」とそっぽを向いた。口元は、ずっと緩んでいた。'),
    gentle: L('{a}は「ありがとう、みんな」と、一人ひとりの顔を見て笑った。|{a}は嬉しそうに目を細めて、何度も「ありがとう」と言った。'),
    devoted: L('{a}は何度も頭を下げた。「こんなに……ありがとうございます」――目が少し潤んでいた。|{a}は胸の前で手を握りしめて、「今日のこと、ずっと忘れません」と言った。'),
    cool: L('{a}は、今日だけで何回祝われたのかを数えようとして、途中でやめた。|{a}「……想定外だ」――そう言った{a}の口元は、少しだけ緩んでいた。'),
    free: L('{a}は「うれしい！」と両手を上げて、その場でくるりと回った。|{a}「みんな最高！」――{a}が全員に抱きつこうとして、また笑いが起きた。'),
    shy: L('{a}は真っ赤になって、両手で顔を覆った。|{a}「あ、ありがとう……」――消え入りそうな声だったが、顔はずっと緩んでいた。'),
    polite: L('{a}は一人ひとりに丁寧にお礼を言った。「皆さん、本当にありがとうございます」|{a}は深々と頭を下げた。「こんなに祝っていただけるなんて」')
  };
  var OBJ_RE = /贈り物|同じもの|手元|手にした/;
  var MISC = L('ほかにも、{n}が、{list}で、思い思いに{a}を祝った。|{n}からも、{list}が届いた。{a}の一日は、最後までにぎやかだった。|そのあとも、{n}が{list}を持って、入れ替わりに{a}のところへやって来た。');
  var NONE = L('今日が{a}の誕生日だということを、クラスの誰も知らなかった。{a}は帰り道、自分で小さなケーキを一つ買った。|{a}は誕生日の一日を、いつも通りに過ごした。家に帰ってから、母親からのメッセージに気づいた。|誰も気づかなかった。{a}も、自分からは言わなかった。');

  /* ======================= 贈り物の選び方 ======================= */
  /* g＝祝う人、t＝本人、tie＝近い関係、counts＝その日すでに選ばれた種類（被りやすくする） */
  function choose(ctx, g, t, tie, counts) {
    var r = R(ctx, g, t), p = per(g), lk = foodOf(t, 'like'), hs = foodOf(t, 'hate'), rng = ctx.rng;
    if (lk.length || hs.length) {
      var good = !!tie || (r.aff > 45 && r.trust > 25);
      var clumsy = !good && (r.aff < 30 || ((p === 'free' || p === 'shy' || p === 'devoted') && r.trust < 25));
      if (good && lk.length && rng() < 0.7) return { id: 'like', item: ctx.rng.pick(lk) };
      if (clumsy && rng() < ((p === 'free' || p === 'shy' || p === 'devoted') ? 0.6 : 0.35)) {
        if (hs.length && (!lk.length || rng() < 0.6)) { var h = ctx.rng.pick(hs); return { id: 'miss', item: h + '入りの' + ctx.rng.pick(CARRY), raw: h, hate: true }; }
        var off = OFF.filter(function (x) { return !lk.some(function (l) { return x.indexOf(l) >= 0 || l.indexOf(x) >= 0; }); });
        return { id: 'miss', item: ctx.rng.pick(off.length ? off : OFF) };
      }
    }
    var w = {}, base = KW[p] || KW.gentle;
    Object.keys(KIND).forEach(function (k) { if (k !== 'like' && k !== 'miss') w[k] = 0.4 + (base[k] || 0); });
    if (r.aff > 40 || tie) { w.invite += 1.5; w.treat += 1; w.photo += 1; w.sweets += 1; w.late *= 0.2; }
    else { w.word += 1.5; w.purin += 1; w.juice += 1; }
    if (g.tr.a < 0.35 && g.tr.fc > 0.5) w.late += 1.5;
    Object.keys(w).forEach(function (k) { w[k] *= 1 + (counts[k] || 0) * 0.3; });
    var ks = Object.keys(w), id = HK.weighted(rng, ks, function (k) { return w[k]; });
    /* 購買のプリンを選んだら、プリンが好物の人には好物として渡る */
    var pl = id === 'purin' && lk.filter(function (x) { return /プリン/.test(x); })[0];
    return pl ? { id: 'like', item: pl } : { id: id };
  }

  /* 同じ日（一人の誕生日）の中で、同じ文を二度使わない */
  var DAY = null;
  function pk(ctx, arr) {
    if (!DAY || !arr || arr.length < 2) return ctx.pick(arr);
    var f = arr.filter(function (x) { return !DAY[x]; });
    var t = ctx.pick(f.length ? f : arr);
    DAY[t] = 1;
    return t;
  }
  /* 添える一文（並んだ・本人の反応）：その日もう使い切っていたら、足さない */
  function pkOpt(ctx, arr) {
    if (!DAY) return ctx.pick(arr);
    var f = (arr || []).filter(function (x) { return !DAY[x]; });
    if (!f.length) return '';
    var t = ctx.pick(f); DAY[t] = 1; return t;
  }
  function bump(ctx, c, d) { if (HK.Emo && HK.Emo.bump) HK.Emo.bump(ctx, c, d); }

  /* 一人の記録 */
  function one(ctx, t, g, tie, k, m) {
    var r = R(ctx, g, t), rom = (tie === 'lover' || tie === 'honmei' || tie === 'crush') && ctx.romanceOk([g, t]);
    var v = { a: t, b: g, like: k.item, item: k.item, raw: k.raw }, text, why = t.name + 'の誕生日' + m + '。' + g.name + (tie ? '（' + TIE[tie] + '）' : '') + 'は覚えていた';
    var c = null;
    if (k.id === 'miss') {
      var pt = per(t), others = ctx.others(t).filter(function (x) { return x !== g && x.role !== 'teacher'; });
      c = others.length && ctx.rng() < 0.35 ? ctx.rng.pick(others) : null;
      v.c = c;
      text = fill(ctx, pk(ctx, MISS[k.hate ? 'hate' : 'off']), v) + fill(ctx, c ? pk(ctx, MISS_EAT) : pkOpt(ctx, MISS_RE[pt] || MISS_RE.gentle) || pk(ctx, MISS_GEN), v);
      why += '：空回り（' + (k.hate ? t.name + 'の嫌いな食べ物（' + k.raw + '）' : '的外れな物（' + k.item + '）') + '。' + (c ? c.name + 'が食べた' : (/gentle|devoted|polite|shy|tsun/.test(pt) ? '隠した' : '正直に言った')) + '）';
    } else if (k.id === 'like') {
      text = fill(ctx, pk(ctx, KIND.like.one), v);
      why += '：' + t.name + 'の好物（' + k.item + '）を覚えていた';
    } else if (tie && (CLOSE[tie] || CLOSE.best).some(function (x) { return !DAY || !DAY[x]; })) {
      text = fill(ctx, pk(ctx, CLOSE[tie] || CLOSE.best), v);
    } else {
      text = fill(ctx, pk(ctx, KIND[k.id].one), v);
      if (k.id === 'late') why = t.name + 'の誕生日' + m + '。' + g.name + 'は忘れていて、翌日謝った';
    }
    ctx.act2({ actors: c ? [g, t, c] : [g, t], cat: rom && k.id !== 'miss' ? 'romance' : 'bond', mag: tie ? 12 : 8, fx: function () {
      if (k.id === 'miss') { ctx.mod2(g, t, { aff: 1, ten: 2 }, { ten: 3 }); if (c) ctx.mod(t, c, { aff: 2 }); bump(ctx, t, { shame: 6 }); return; }
      if (k.id === 'late') { ctx.mod(t, g, { aff: 1 }); return; }
      ctx.mod2(g, t, { aff: 2 }, { aff: 4, trust: 3 });
      if (k.id === 'like') ctx.mod(t, g, { aff: 3, trust: 2 });
      if (rom) ctx.mod2(g, t, { att: 3 }, { att: 4 });
      ctx.stress(t, tie ? -6 : -3);
      bump(ctx, t, { joy: tie ? 10 : 5 });
    }, text: text, why: why });
  }

  /* まとめた記録（同じ種類・同じ物） */
  /* joked：その日すでに笑い話が出ていれば、二つ目からは「並んだ」の一文だけ（笑い話と本人の反応は一日一回） */
  function many(ctx, t, list, k, m, joked) {
    if (list.length === 1) return one(ctx, t, list[0], null, k, m);
    var K = KIND[k.id], v = { a: t, n: grp(list), item: k.item, like: k.item, raw: k.raw, k: list.length };
    var text = fill(ctx, pk(ctx, k.hate ? K.manyHate : K.many), v), why = t.name + 'の誕生日' + m + '。' + list.map(function (c) { return c.name; }).join('・') + 'は覚えていた（' + (k.id === 'like' ? '好物（' + k.item + '）' : k.id === 'miss' ? '空回り（' + k.item + '）' : K.label) + '）';
    if (list.length >= 3 && joked) text += fill(ctx, pkOpt(ctx, K.pile), v);
    /* 空回りをまとめたときも、本人の反応（隠す・正直に言う）を足す */
    if (k.id === 'miss') { v.b = list[0]; text += fill(ctx, pkOpt(ctx, MISS_RE[per(t)] || MISS_RE.gentle), v); }
    var joke = list.length >= 3 && !joked;
    if (joke) {
      var md = {}; list.forEach(function (c) { var x = MOOD[per(c)] || 'mix'; md[x] = (md[x] || 0) + 1; });
      var top = Object.keys(md).sort(function (x, y) { return md[y] - md[x]; })[0], mood = md[top] * 2 > list.length ? top : 'mix';
      v.x = ctx.rng.pick(list);
      var nob = !!NOOBJ[k.id], jl = JOKE[mood].filter(function (x) { return !nob || !OBJ_RE.test(x); }), RT = nob ? REACT_X : REACT;
      text += fill(ctx, pkOpt(ctx, K.pile), v) + fill(ctx, pk(ctx, jl), v) + (k.id === 'miss' ? '' : fill(ctx, pkOpt(ctx, RT[per(t)] || RT.gentle), v));
      why += '。' + list.length + '人が同じことをして、笑い話になった（祝福・仲良し）';
    }
    ctx.act2({ actors: [t].concat(list), cat: 'bond', mag: joke ? 12 : 8, fx: function () {
      list.forEach(function (g) {
        if (k.id === 'miss') ctx.mod2(g, t, { ten: 1 }, { ten: 2 });
        else if (k.id === 'late') ctx.mod(t, g, { aff: 1 });
        else ctx.mod2(g, t, { aff: 1 }, { aff: k.id === 'like' ? 4 : 2, trust: 1 });
        if (joke) ctx.mod2(g, t, { trust: 1 }, { trust: 1 });
      });
      if (joke) for (var i = 0; i < list.length; i++) for (var j = i + 1; j < list.length; j++) ctx.mod2(list[i], list[j], { trust: 1 }, { trust: 1 });
      ctx.stress(t, joke ? -8 : -4);
      bump(ctx, t, joke ? { joy: 12 } : k.id === 'miss' ? { shame: 6 } : { joy: 6 });
    }, text: text, why: why });
    return joke;
  }

  /* 「ほかにも」の一つにまとめる */
  function misc(ctx, t, bs, m) {
    var list = [], labels = [];
    bs.forEach(function (b) { list = list.concat(b.list); var lb = b.k.id === 'like' ? '好物の' + b.k.item : b.k.id === 'miss' ? b.k.item : KIND[b.k.id].label; if (labels.indexOf(lb) < 0) labels.push(lb); });
    var lst = labels.length <= 3 ? labels.join('や') : labels.slice(0, 3).join('や') + 'など';
    ctx.act2({ actors: [t].concat(list), cat: 'bond', mag: 6, fx: function () { list.forEach(function (g) { ctx.mod2(g, t, { aff: 1 }, { aff: 2 }); }); ctx.stress(t, -3); },
      text: fill(ctx, pk(ctx, MISC), { a: t, n: grp(list), list: lst }), why: t.name + 'の誕生日' + m + '。' + list.map(function (c) { return c.name; }).join('・') + 'も、それぞれのやり方で祝った' });
  }

  function none(ctx, t, m) {
    ctx.act2({ actors: [t], cat: 'solo', fx: function () { ctx.stress(t, 8); bump(ctx, t, { grief: 6 }); }, text: fill(ctx, pk(ctx, NONE), { a: t }),
      why: t.name + 'の誕生日' + m + '。まだ、祝ってくれるほど親しい人がいない（' + (t.tr.ac > 0.55 ? 'AC：自分からは言わない' : 'ドライさ') + '）' });
  }

  var MAXREC = 5, MAXCLOSE = 3;
  /* t の誕生日を祝う。o: { m: 月（why に出す）, header: false で「今日は〜の誕生日だった。」を出さない } */
  B.celebrate = function (ctx, t, o) {
    o = o || {};
    var m = o.m ? '（' + o.m + '月）' : '';
    ctx.flags.bday = ctx.flags.bday || {};
    ctx.flags.bday[t.i] = 1;
    DAY = {};
    try { run(ctx, t, o, m); } finally { DAY = null; }
  };
  function run(ctx, t, o, m) {
    if (o.header !== false) ctx.incident('今日は' + t.name + 'の誕生日だった。');
    var pool = ctx.others(t).filter(function (g) { return remembers(ctx, g, t); });
    if (!pool.length) { none(ctx, t, m); ctx.flush(); return; }
    pool.sort(function (x, y) { return R(ctx, y, t).aff - R(ctx, x, t).aff; });
    var tie = {}; pool.forEach(function (g) { tie[g.i] = closeOf(ctx, g, t); });
    var counts = {};
    /* 人数が少ないときは、まとめずに一人ずつ（恋人が先） */
    var few = ctx.present().length <= 4;
    var close = pool.filter(function (g) { return few || tie[g.i]; }).sort(function (x, y) { return (RANK[tie[x.i]] == null ? 9 : RANK[tie[x.i]]) - (RANK[tie[y.i]] == null ? 9 : RANK[tie[y.i]]) || R(ctx, y, t).aff - R(ctx, x, t).aff; });
    if (!few) close = close.slice(0, MAXCLOSE);
    close.forEach(function (g) { var k = choose(ctx, g, t, tie[g.i], counts); counts[k.id] = (counts[k.id] || 0) + 1; one(ctx, t, g, tie[g.i], k, m); });
    var rest = pool.filter(function (g) { return close.indexOf(g) < 0; });
    if (!rest.length) { ctx.flush(); return; }
    var bucket = {}, order = [];
    rest.forEach(function (g) {
      var k = choose(ctx, g, t, null, counts), key = k.id + '|' + (k.item || '');
      counts[k.id] = (counts[k.id] || 0) + 1;
      if (!bucket[key]) { bucket[key] = { k: k, list: [] }; order.push(key); }
      bucket[key].list.push(g);
    });
    var bs = order.map(function (x) { return bucket[x]; }).sort(function (x, y) { return y.list.length - x.list.length; });
    var room = Math.max(1, MAXREC - close.length);
    var shown = bs.length <= room ? bs : bs.slice(0, room - 1), rem = bs.length <= room ? [] : bs.slice(room - 1);
    var joked = false;
    shown.forEach(function (b) { if (many(ctx, t, b.list, b.k, m, joked)) joked = true; });
    if (rem.length) misc(ctx, t, rem, m);
    ctx.flush();
  }

  /* 箱庭全体の出来事「誕生日」（incidents-social.js の classroom）：誕生月を決めていない人か、今月が誕生月でまだ祝われていない人から一人 */
  B.incident = function (ctx) {
    var mm = parseInt(ctx.label, 10) || 0;
    ctx.flags.bday = ctx.flags.bday || {};
    var P = ctx.present().filter(function (c) { return c.role !== 'teacher' && !ctx.flags.bday[c.i] && (!c.bmonth || +c.bmonth === mm); });
    if (!P.length) return;
    var t = ctx.rng.pick(P);
    B.celebrate(ctx, t, { m: +t.bmonth === mm ? mm : 0 });
  };

  /* ======================= 転校の噂（同じ一文が人数ぶん並ばないように） ======================= */
  var TR_ONE = L('{a}は授業中、何度も{b}の席の方を振り返った。|{a}は{b}に本当なのか聞こうとして、何度も言葉を飲み込んだ。|{a}はその日、{b}の横顔ばかり見ていた。ノートは一行も進まなかった。|{a}は帰り道、{b}の少し後ろを、話しかけられないまま歩いた。');
  var TR_MANY = L('{n}も、授業中に何度か{b}の席を振り返っていた。|{n}は、休み時間のたびに{b}の様子をうかがっていた。誰も、本人に聞く勇気はなかった。|{n}も、その日はどこか上の空だった。視線の先には、いつも{b}がいた。');
  B.transfer = function (ctx) { DAY = {}; try { transfer(ctx); } finally { DAY = null; } };
  function transfer(ctx) {
    var P = ctx.present(), t = ctx.rng.pick(P);
    ctx.incident(t.name + 'が転校するらしい、という噂が流れた。');
    var list = ctx.others(t).filter(function (o) { var r = R(ctx, o, t); return (r.att > 35 || r.aff > 45) && ctx.romanceOk([o, t]); })
      .sort(function (x, y) { return R(ctx, y, t).att + R(ctx, y, t).aff * 0.5 - R(ctx, x, t).att - R(ctx, x, t).aff * 0.5; });
    var few = P.length <= 4, solo = few ? list : list.slice(0, 2), rest = few ? [] : list.slice(2);
    function fx(o) { ctx.mod(o, t, { att: 6 }); ctx.stress(o, 15); o.tr.honesty = HK.clamp(o.tr.honesty + 0.15); }
    solo.forEach(function (o) {
      var r = R(ctx, o, t);
      ctx.act2({ actors: [o, t], cat: 'romance', fx: function () { fx(o); }, text: ctx.t(pk(ctx, TR_ONE), o, t), why: o.name + 'の' + t.name + 'への想い（好意' + Math.round(r.aff) + '・惹かれ' + Math.round(r.att) + '）' });
    });
    if (rest.length === 1) ctx.act2({ actors: [rest[0], t], cat: 'romance', fx: function () { fx(rest[0]); }, text: ctx.t(pk(ctx, TR_ONE), rest[0], t), why: rest[0].name + 'の' + t.name + 'への想い' });
    else if (rest.length) ctx.act2({ actors: rest.concat([t]), cat: 'bond', fx: function () { rest.forEach(fx); }, text: fill(ctx, pk(ctx, TR_MANY), { b: t, n: grp(rest) }), why: rest.map(function (c) { return c.name; }).join('・') + 'も、' + t.name + 'のことが気がかりだった' });
    ctx.say({ text: '噂は、ただの噂だった。' + t.name + 'は何も知らなかった。' });
  }
  B.grp = grp;
})();
