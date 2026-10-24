/* 箱庭診断: 住人どうしの既存の関係（初期値と振る舞いの補正） */
(function () {
  'use strict';
  var HK = window.HK;

  /* ab = A→Bの初期値、ba = B→A（対称なら省略） / pol = 関係の明るさ（-2〜2）
     bias = 相手がこの関係の人のとき、行動の種類に掛ける倍率（biasA/biasB は向きのある関係） */
  var T = HK.TIES = {
    acq: { mods: {}, effect: '少し話しやすい', label: '知人', ab: { aff: 8, trust: 5 }, pol: 0, pull: 0.6 },
    friend: { mods: { trust: 1.15 }, effect: '協力しやすい', label: '友人', ab: { aff: 25, trust: 20 }, pol: 1, pull: 1.4, bias: { bond: 1.4, help: 1.2 } },
    colleague: { mods: { trust: 1.15 }, effect: '仕事仲間として息が合い協力しやすいが、張り合うこともある', label: '同僚', ab: { aff: 15, trust: 25, ten: 6 }, pol: 1, pull: 1.3, bias: { help: 1.35, bond: 1.2, conflict: 1.1 } },
    senpai: { mods: { trust: 1.15 }, effect: '先輩は後輩の面倒を見たがり、後輩は先輩を頼りにする。憧れが恋に変わることも', label: '先輩後輩', dir: true, roleA: '先輩', roleB: '後輩', ab: { aff: 20, trust: 20, ten: 4 }, ba: { aff: 28, trust: 30, att: 6 }, pol: 1, pull: 1.6, biasA: { help: 1.6, bond: 1.2, conflict: 1.1 }, biasB: { help: 1.2, bond: 1.3, romance: 1.15, betray: 0.6 } },
    buddy: { mods: { trust: 1.3, ten: 0.8 }, effect: '背中を預け合う相棒。危ない場面ほど助け合い、裏切りはまず起きない', label: 'バディ', ab: { aff: 30, trust: 55, att: 4 }, pol: 2, pull: 2.1, bias: { help: 1.9, bond: 1.4, betray: 0.2, combat: 0.35, conflict: 0.9 } },
    childhood: { mods: { trust: 1.2, ten: 0.85 }, effect: '気安く、喧嘩してもこじれにくい', label: '幼馴染', ab: { aff: 35, trust: 40, att: 6 }, pol: 1, pull: 1.6, bias: { bond: 1.5, help: 1.3, conflict: 1.1 } },
    almost: { mods: { att: 1.35 }, effect: '恋に発展しやすい', label: '友達以上恋人未満', ab: { aff: 35, trust: 25, att: 32 }, pol: 2, chem: 1.5, pull: 2, bias: { romance: 1.7, bond: 1.2 } },
    best: { mods: { trust: 1.3, ten: 0.7 }, effect: '裏切り・争いが起きにくく、助け合う', label: '親友', ab: { aff: 50, trust: 50 }, pol: 2, pull: 2, bias: { help: 1.6, bond: 1.5, betray: 0.4, combat: 0.3 } },
    sibling: { mods: { att: 0.08, ten: 1.1 }, effect: '恋愛にはならない。口喧嘩は多いが、信頼は崩れにくい', label: '兄弟姉妹', ab: { aff: 30, trust: 40, ten: 8 }, pol: 1, chem: 0.05, pull: 1.6, family: true, bias: { help: 1.6, conflict: 1.3, romance: 0.1, combat: 0.3, betray: 0.4 } },
    parent: { mods: { att: 0.05, trust: 1.15 }, effect: '恋愛にはならない。親は子を守ろうとする。ぶつかっても信頼は崩れにくい', label: '親子', dir: true, roleA: '親', roleB: '子', ab: { aff: 50, trust: 30, ten: 5 }, ba: { aff: 30, trust: 40, ten: 12 }, pol: 1, chem: 0.02, pull: 1.8, family: true, biasA: { help: 2, conflict: 1.3, romance: 0.05, combat: 0.15, betray: 0.2 }, biasB: { help: 1.2, conflict: 1.4, romance: 0.05, combat: 0.3 } },
    pparent: { mods: { att: 0.72, trust: 1.15 }, effect: '親代わり・育ての親のような関係。基本は親子と同じで親代わりは子を守ろうとするが、血の繋がりがないぶん恋愛に発展することもある', label: '擬似親子', dir: true, roleA: '親代わり', roleB: '子', like: 'parent', ab: { aff: 48, trust: 30, ten: 6 }, ba: { aff: 32, trust: 40, ten: 12 }, pol: 1, chem: 0.65, pull: 1.9, family: true, loveOK: true, biasA: { help: 2, conflict: 1.3, romance: 0.72, combat: 0.15, betray: 0.2 }, biasB: { help: 1.2, conflict: 1.4, romance: 0.82, combat: 0.3 } },
    crush: { mods: { att: 1.3 }, effect: '想う側だけが恋愛的に動きやすい', label: '片想い', dir: true, roleA: '想う側', roleB: '想われる側', ab: { aff: 40, att: 50 }, ba: { aff: 5 }, pol: 0, pull: 2, biasA: { romance: 1.8, help: 1.3 }, biasB: {} },
    rival: { mods: { ten: 1.25, att: 1.1 }, effect: 'ぶつかりやすいが、惹かれることもある', label: 'ライバル', ab: { ten: 35, att: 10, trust: 10, aff: 5 }, pol: 0, fric: 1.3, pull: 1.6, bias: { conflict: 1.6, bond: 1.1, combat: 1.3 } },
    enemy: { mods: { aff: 0.5, trust: 0.5, att: 0.5, ten: 1.3 }, effect: '強い嫌悪。好意・信頼が育ちにくく、争いやすい。相手の気持ちを選ぶと一方的な敵視にもできる（相手は気にしていない・友人だと思っている・愛している…）。嫌悪の強さは箱庭の中で上下し、下がれば不仲と同じ振る舞いに', label: '敵対', dir: true, roleA: '敵視する側', roleB: '相手', hate: 2, ab: { ten: 60, aff: -40, trust: -40 }, pol: -2, fric: 1.4, pull: 1.8, bias: { conflict: 2, combat: 2, betray: 1.5, romance: 0.3, help: 0.4 } },
    lover: { mods: { att: 1.2, ten: 0.85 }, effect: '惹かれが育ちやすく、争いを避ける', label: '恋人', ab: { aff: 55, att: 55, trust: 40 }, pol: 2, chem: 1.3, pull: 2.4, couple: true, bias: { romance: 1.8, help: 1.4, combat: 0.15, betray: 0.4 } },
    fwb: { mods: { att: 1.15, aff: 0.85 }, effect: '体の距離は近いが、気持ちは育ちにくい', label: 'セフレ', ab: { att: 45, aff: 15, trust: 15 }, pol: 1, chem: 1.2, pull: 1.8, night: true, bias: { romance: 1.6, bond: 0.8 } },
    ex: { mods: { att: 1.1, ten: 1.15 }, effect: '未練と気まずさが残る', label: '元恋人', ab: { aff: 10, att: 25, ten: 30, trust: 5 }, pol: 0, pull: 1.5, bias: { conflict: 1.3, romance: 1.2 } },
    fated: { mods: { att: 1.6, aff: 1.2, ten: 0.8 }, effect: '遺伝子レベルで惹かれ合う。出会った瞬間から抗いにくい（オメガバース向け）', label: '運命の番', ab: { att: 55, aff: 20, trust: 10 }, pol: 2, chem: 1.8, pull: 2.6, bias: { romance: 2.2, help: 1.3, combat: 0.2 } },
    mate: { mods: { att: 1.2, ten: 0.85, trust: 1.1 }, effect: 'オメガバースでα×Ωなら、最初から番（うなじを噛んだ仲）。ほかの組み合わせや箱庭では恋人と同じ', label: '番', ab: { aff: 60, att: 60, trust: 50 }, pol: 2, chem: 1.3, pull: 2.6, couple: true, bias: { romance: 1.8, help: 1.5, combat: 0.1, betray: 0.3 } },
    teacher: { mods: { trust: 1.15 }, effect: '教師は生徒を導き守ろうとし、生徒は教師を頼る。叱ることも、反発することもある', label: '教師と生徒', dir: true, roleA: '教師', roleB: '生徒', ab: { aff: 18, trust: 25, ten: 4 }, ba: { aff: 18, trust: 30, ten: 6 }, pol: 1, chem: 0.6, pull: 1.5, biasA: { help: 1.7, conflict: 1.15, bond: 1.1 }, biasB: { help: 1.15, bond: 1.2, conflict: 1.1 } },
    mentor: { mods: { trust: 1.3, ten: 0.85 }, effect: '師は弟子を鍛え、弟子は師を慕う。信頼が厚く、裏切りは起きにくい', label: '師弟', dir: true, roleA: '師匠', roleB: '弟子', ab: { aff: 25, trust: 40, ten: 4 }, ba: { aff: 35, trust: 55 }, pol: 2, chem: 0.7, pull: 1.9, biasA: { help: 1.7, conflict: 1.1, bond: 1.2, betray: 0.3 }, biasB: { help: 1.8, bond: 1.4, betray: 0.2, combat: 0.4 } },
    sibprot: { mods: { att: 0.06, trust: 1.15 }, effect: '兄姉が弟妹を我が子のように守ろうとする。恋愛にはならない', label: 'きょうだい（庇護）', dir: true, roleA: '兄姉', roleB: '弟妹', like: 'parent', ab: { aff: 50, trust: 32, ten: 5 }, ba: { aff: 35, trust: 45, ten: 10 }, pol: 1, chem: 0.03, pull: 1.8, family: true, biasA: { help: 2, conflict: 1.25, romance: 0.05, combat: 0.15, betray: 0.2 }, biasB: { help: 1.3, conflict: 1.3, romance: 0.05, combat: 0.3, betray: 0.3 } },
    sibclose: { mods: { att: 0.08, trust: 1.3, ten: 0.75 }, effect: '親友や幼馴染のように仲のいいきょうだい。気安く、助け合う。恋愛にはならない', label: 'きょうだい（親友のよう）', like: 'sibling', ab: { aff: 45, trust: 50, ten: 3 }, pol: 2, chem: 0.05, pull: 1.9, family: true, bias: { help: 1.7, bond: 1.6, conflict: 1.0, romance: 0.1, combat: 0.25, betray: 0.3 } },
    sibbad: { mods: { att: 0.08, aff: 0.8, ten: 1.25 }, effect: '血はつながっているが反りが合わないきょうだい。顔を合わせれば口喧嘩。それでも、いざとなると見捨てきれない（信頼は底をつかない）。恋愛にはならない', label: 'きょうだい（不仲）', like: 'sibling', ab: { aff: -8, trust: 12, ten: 32 }, pol: -1, chem: 0.05, fric: 1.25, pull: 1.8, family: true, bias: { conflict: 1.9, help: 1.1, bond: 0.75, romance: 0.1, combat: 0.7, betray: 0.8 } },
    bad: { mods: { aff: 0.75, trust: 0.8, ten: 1.15 }, effect: '気が合わず、何かと衝突する（敵対ほど強い嫌悪ではない）。いがみ合いながらも、きっかけがあれば打ち解けることもある。相手の気持ちを選ぶと一方的な敵視にもできる。嫌悪が強まれば敵対と同じ振る舞いに', label: '不仲', dir: true, roleA: '敵視する側', roleB: '相手', hate: 1, ab: { aff: -18, trust: -8, ten: 34 }, pol: -1, fric: 1.25, pull: 1.4, bias: { conflict: 1.6, help: 0.7, bond: 0.75, romance: 0.6, combat: 1.1, betray: 1.15 } },
    yan: { mods: { att: 1.25, ten: 1.1 }, effect: '執着する側は、相手が誰かと親しくするたびに嫉妬し、執着を深めていく。深まると監視・束縛・恋敵への敵意に変わり、R18版では監禁・恋敵への危害・心中まで暴走することがある（全年齢版ではほのめかす程度）', label: '執着（ヤンデレ）', dir: true, roleA: '執着する側', roleB: '執着される側', ab: { aff: 30, att: 55, trust: -5, ten: 10 }, ba: { aff: 5 }, pol: 0, chem: 1.3, pull: 2, biasA: { romance: 1.6, conflict: 1.2 }, obsess: true },
    noobs: { mods: {}, effect: 'この二人のあいだでは、嫉妬も執着も生まれない（ほかの関係に重ねて使う）', label: '執着なし', ab: {}, pol: 0, pull: 0, noObsess: true },
    master: { mods: { trust: 1.25 }, effect: '従は主を助けに動く', label: '主従', dir: true, roleA: '主', roleB: '従', ab: { trust: 20, aff: 15, ten: 8 }, ba: { trust: 55, aff: 30 }, pol: 1, pull: 1.8, biasA: { conflict: 1.2, help: 1.1 }, biasB: { help: 2, bond: 1.2, betray: 0.3, combat: 0.4 } }
  };
  /* 片想いの「想われる側」の温度（相手にされていない片想い） */
  HK.CRUSH_COLD = {
    '': { label: '想われる側：ふつう', short: '' },
    none: { label: '想われる側：興味がない', short: '興味なし', att: 0.2, ba: { aff: -5 } },
    friend: { label: '想われる側：友達としか見ていない', short: '友達止まり', att: 0.1, ba: { aff: 20, trust: 20 } },
    dislike: { label: '想われる側：苦手・避けている', short: '苦手', att: 0.08, aff: 0.6, ba: { aff: -20, ten: 18 } },
    other: { label: '想われる側：ほかに好きな人がいる', short: '他に好きな人', att: 0.15, ba: { aff: 5 } },
    /* 両片想い：お互いに想っているのに、相手は自分を何とも思っていないと思い込んでいる。
       箱庭に渡すときは、向きを逆にした片想いと二本にする（HK.Ties.expand）。どちらも想う側として動き、両片想いの出来事（pining.js）が起きる */
    mutual: { label: '想われる側：実は想っている（両片想い）', short: '両片想い', mutual: true }
  };
  HK.CRUSH_COLD_ORDER = ['', 'none', 'friend', 'dislike', 'other', 'mutual'];
  /* 不仲・敵対の「相手」の気持ち（一方的な敵視・噛み合わない関係）。空欄は、お互いに敵視している（以前の不仲・敵対と同じ）
     ba=相手から敵視する側への初期値、mods=相手の側の関係値の伸び、bias=相手の側の行動の倍率 */
  HK.HATE_BACK = {
    '': { label: '相手：お互いに敵視している', short: '' },
    none: { label: '相手：なんとも思っていない', short: '一方的', ba: { aff: 0 }, mods: {}, bias: {} },
    normal: { label: '相手：ふつうに接している', short: '相手はふつう', ba: { aff: 10, trust: 8 }, mods: {}, bias: { bond: 1.1 } },
    friend: { label: '相手：友人だと思っている', short: '相手は友人だと', ba: { aff: 28, trust: 25 }, mods: { trust: 1.1 }, bias: { bond: 1.4, help: 1.3 } },
    love: { label: '相手：愛している', short: '相手は好き', ba: { aff: 42, att: 48, trust: 18 }, mods: { att: 1.25 }, bias: { romance: 1.8, help: 1.5, bond: 1.3 } }
  };
  HK.HATE_BACK_ORDER = ['', 'none', 'normal', 'friend', 'love'];
  /* 執着（ヤンデレ）の「執着される側」の気持ち。ba=執着される側から執着する側への初期値 */
  HK.OBS_BACK = {
    '': { label: '執着される側：気づいていない', short: '' },
    afraid: { label: '執着される側：怖がっている', short: '怖がっている', ba: { aff: -8, ten: 22 } },
    hate: { label: '執着される側：嫌っている', short: '嫌われている', ba: { aff: -28, ten: 30, trust: -10 } },
    accept: { label: '執着される側：受け入れている', short: '受け入れている', ba: { aff: 25, trust: 15, att: 18 } },
    mutual: { label: '執着される側：共依存（同じくらい想っている）', short: '共依存', ba: { aff: 38, att: 50, trust: 10 } }
  };
  HK.OBS_BACK_ORDER = ['', 'afraid', 'hate', 'accept', 'mutual'];
  /* 関係の種類ごとの「相手の気持ち」の選択肢（片想い・不仲・敵対）。なければ null */
  HK.coldOpts = function (type) {
    if (type === 'crush' && HK.CRUSH_COLD) return { map: HK.CRUSH_COLD, order: HK.CRUSH_COLD_ORDER, aria: '想われる側の気持ち' };
    if ((type === 'bad' || type === 'enemy') && HK.HATE_BACK) return { map: HK.HATE_BACK, order: HK.HATE_BACK_ORDER, aria: '相手の気持ち' };
    if (type === 'yan' && HK.OBS_BACK) return { map: HK.OBS_BACK, order: HK.OBS_BACK_ORDER, aria: '執着される側の気持ち' };
    return null;
  };
  var HATE_WORDS = [[/一方的|片思いならぬ|相手は気にして(?:い)?ない|相手は気づいて(?:い)?ない|なんとも思って(?:い)?ない/, 'none'], [/相手はふつう|相手は普通/, 'normal'], [/相手は友(?:達|人)だと|友達だと思って/, 'friend'], [/相手は(?:好き|愛して|惚れて)|片想いされ|好かれて/, 'love']];
  var COLD_WORDS = [[/両片想い|両片思い|実は相手も/, 'mutual'], [/脈なし|眼中に|相手にされ|興味がない|興味なし/, 'none'], [/友達としか|友達止まり|異性として見|恋愛対象外|対象外/, 'friend'], [/苦手|嫌われ|避けられ|避けて/, 'dislike'], [/他に好き|ほかに好き|別に好き|好きな人がいる/, 'other']];
  HK.TIE_ORDER = ['acq', 'friend', 'colleague', 'senpai', 'buddy', 'childhood', 'almost', 'best', 'sibling', 'sibprot', 'sibclose', 'sibbad', 'parent', 'pparent', 'teacher', 'mentor', 'crush', 'yan', 'bad', 'rival', 'enemy', 'lover', 'fwb', 'ex', 'fated', 'mate', 'master', 'noobs'];

  /* 文字から関係の種類を推定（長い語から順に照合） */
  var ALIAS = [
    ['きょうだい（不仲）', 'sibbad'], ['兄弟姉妹（不仲）', 'sibbad'], ['兄弟（不仲）', 'sibbad'], ['姉妹（不仲）', 'sibbad'], ['不仲なきょうだい', 'sibbad'], ['不仲な兄弟', 'sibbad'], ['仲の悪いきょうだい', 'sibbad'], ['仲の悪い兄弟', 'sibbad'], ['兄弟（仲が悪い）', 'sibbad'], ['姉妹（仲が悪い）', 'sibbad'],
    ['執着なし', 'noobs'], ['嫉妬しない', 'noobs'], ['ヤンデレ', 'yan'], ['執着', 'yan'],
    ['片想い', 'crush'], ['片思い', 'crush'],
    ['友達以上恋人未満', 'almost'], ['友達以上', 'almost'], ['恋人未満', 'almost'], ['いい感じ', 'almost'],
    ['幼なじみ', 'childhood'], ['幼馴染', 'childhood'], ['親友', 'best'], ['知り合い', 'acq'], ['知人', 'acq'],
    ['友人', 'friend'], ['友達', 'friend'], ['兄弟姉妹', 'sibling'], ['兄弟', 'sibling'], ['姉妹', 'sibling'], ['兄妹', 'sibling'], ['姉弟', 'sibling'],
    ['兄弟姉妹（庇護）', 'sibprot'], ['きょうだい（庇護）', 'sibprot'], ['過保護な兄', 'sibprot'], ['過保護な姉', 'sibprot'], ['きょうだい（親友のよう）', 'sibclose'], ['兄弟姉妹（親友のよう）', 'sibclose'], ['仲良しきょうだい', 'sibclose'], ['仲良し兄弟', 'sibclose'], ['不仲', 'bad'], ['仲が悪い', 'bad'], ['険悪', 'bad'], ['反りが合わない', 'bad'], ['そりが合わない', 'bad'],
    ['教師と生徒', 'teacher'], ['教師', 'teacher'], ['先生と生徒', 'teacher'], ['担任', 'teacher'], ['生徒', 'teacher'], ['師弟', 'mentor'], ['師匠', 'mentor'], ['弟子', 'mentor'],
    ['擬似親子', 'pparent'], ['疑似親子', 'pparent'], ['親代わり', 'pparent'], ['育ての親', 'pparent'], ['保護者', 'pparent'], ['後見人', 'pparent'], ['親子', 'parent'], ['父親', 'parent'], ['母親', 'parent'], ['片想い', 'crush'], ['片思い', 'crush'],
    ['ライバル', 'rival'], ['敵対', 'enemy'], ['因縁', 'enemy'], ['宿敵', 'enemy'], ['犬猿', 'enemy'], ['敵', 'enemy'],
    ['元恋人', 'ex'], ['元カレ', 'ex'], ['元カノ', 'ex'], ['元彼', 'ex'], ['元カノ', 'ex'],
    ['運命の番', 'fated'], ['運命', 'fated'], ['番', 'mate'], ['セフレ', 'fwb'], ['恋人', 'lover'], ['夫婦', 'lover'], ['彼氏', 'lover'], ['彼女', 'lover'], ['付き合って', 'lover'],
    ['先輩後輩', 'senpai'], ['先輩', 'senpai'], ['後輩', 'senpai'], ['センパイ', 'senpai'],
    ['バディ', 'buddy'], ['相棒', 'buddy'], ['コンビ', 'buddy'], ['相方', 'buddy'],
    ['同僚', 'colleague'], ['同期', 'colleague'], ['仕事仲間', 'colleague'], ['職場', 'colleague'], ['バイト仲間', 'colleague'],
    ['主従', 'master'], ['主人', 'master'], ['従者', 'master'], ['部下', 'master'], ['主', 'master'],
    ['の子', 'parent'], ['子ども', 'parent'], ['息子', 'parent'], ['娘', 'parent'], ['の親', 'parent'], ['父', 'parent'], ['母', 'parent'],
    ['兄', 'sibling'], ['弟', 'sibling'], ['姉', 'sibling'], ['妹', 'sibling'], ['友', 'friend']
  ];

  HK.parseTies = function (text, chars) {
    var out = [], warn = [];
    var names = chars.map(function (c) { return { n: c.name, id: c.id }; }).sort(function (a, b) { return b.n.length - a.n.length; });
    String(text || '').split(/\r?\n/).forEach(function (raw, i) {
      var line = raw.replace(/^\s*(?:[-*・●○]|\d+[.)])\s*/, '').trim();
      if (!line) return;
      var found = [], used = line;
      names.forEach(function (x) {
        var p = used.indexOf(x.n);
        if (p >= 0 && found.every(function (f) { return f.id !== x.id; })) {
          found.push({ id: x.id, pos: p });
          used = used.slice(0, p) + Array(x.n.length + 1).join('\u0000') + used.slice(p + x.n.length);
        }
      });
      found.sort(function (a, b) { return a.pos - b.pos; });
      /* 「セフレで片想い」のように、一行に複数の関係を書いてもよい */
      var cold = '', back = '', obc = '';
      [[/共依存/, 'mutual'], [/受け入れて|受け入れ/, 'accept'], [/怖がって|怯えて|怖がる/, 'afraid'], [/嫌って|嫌がって/, 'hate']].forEach(function (w) { if (!obc && /ヤンデレ|執着/.test(used) && w[0].test(used)) { obc = w[1]; used = used.replace(w[0], function (x) { return Array(x.length + 1).join('\u0000'); }); } });
      HATE_WORDS.forEach(function (w) { var m = used.match(w[0]); if (m) { if (!back) back = w[1]; used = used.replace(w[0], function (x) { return Array(x.length + 1).join('\u0000'); }); } });
      COLD_WORDS.forEach(function (w) { var m = used.match(w[0]); if (m) { if (!cold) cold = w[1]; used = used.replace(w[0], function (x) { return Array(x.length + 1).join('\u0000'); }); } });
      var types = [];
      for (var k = 0; k < ALIAS.length; k++) {
        var p0 = used.indexOf(ALIAS[k][0]);
        if (p0 < 0) continue;
        if (types.indexOf(ALIAS[k][1]) < 0) types.push(ALIAS[k][1]);
        used = used.slice(0, p0) + Array(ALIAS[k][0].length + 1).join('\u0000') + used.slice(p0 + ALIAS[k][0].length);
        k--;
      }
      /* 「両片想い」だけ書いたら、片想い（想われる側：実は想っている） */
      if (cold === 'mutual' && types.indexOf('crush') < 0) types.unshift('crush');
      /* 「兄弟で不仲」のように二つ書いたら、きょうだい（不仲）にまとめる */
      if (types.indexOf('bad') >= 0 && types.indexOf('sibling') >= 0) types = types.filter(function (x) { return x !== 'bad'; }).map(function (x) { return x === 'sibling' ? 'sibbad' : x; });
      var type = types[0] || null;
      if (found.length < 2 || !type) { warn.push((i + 1) + '行目「' + raw.trim().slice(0, 24) + '」は' + (found.length < 2 ? '登録済みの名前が二つ見つかりませんでした' : '関係の種類が分かりませんでした')); return; }
      types.forEach(function (ty) {
        var a = found[0].id, b = found[1].id;
        /* 「BはAの親」「子」などの言い回しで向きを反転 */
        if (T[ty].dir && /の(子|子ども|息子|娘|従者|部下|後輩|生徒|弟子|弟|妹)|←/.test(line)) { var t = a; a = b; b = t; }
        var nt = { a: a, b: b, type: ty };
        if (ty === 'crush' && cold) nt.cold = cold;
        if ((ty === 'bad' || ty === 'enemy') && back) nt.cold = back;
        if (ty === 'yan' && obc) nt.cold = obc;
        out.push(nt);
      });
    });
    return { ties: out, warnings: warn };
  };

  HK.tieText = function (tie, nameOf) {
    var D = T[tie.type];
    if (!D) return '';
    var CO = HK.coldOpts(tie.type);
    if (D.dir) return nameOf(tie.a) + '（' + D.roleA + '）→ ' + nameOf(tie.b) + '（' + D.roleB + '）：' + D.label + (CO && tie.cold && CO.map[tie.cold] && CO.map[tie.cold].short ? '（' + CO.map[tie.cold].short + '）' : '');
    return nameOf(tie.a) + ' × ' + nameOf(tie.b) + '：' + D.label;
  };

  /* ---------- エンジンへの適用 ----------
     同じ二人に複数の関係（セフレ＋片想い など）を重ねられる。
     get() は代表の関係（PRIO の先頭に近いもの）を返し、has() で個々の関係を調べる */
  var PRIO = ['mate', 'fated', 'lover', 'parent', 'pparent', 'sibprot', 'sibling', 'sibclose', 'sibbad', 'master', 'mentor', 'teacher', 'fwb', 'ex', 'crush', 'yan', 'almost', 'best', 'buddy', 'childhood', 'rival', 'enemy', 'bad', 'senpai', 'colleague', 'friend', 'acq', 'noobs'];
  function keyOf(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  /* 関係を持っているか（どのファイルからでも安全に呼べる形）。古いファイルが混ざっても止まらないように */
  HK.tieHas = function (ctx, a, b, type) {
    var T0 = HK.Ties;
    if (!T0 || !ctx || !a || !b) return null;
    if (typeof T0.has === 'function') return T0.has(ctx, a, b, type);
    var k = a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i, l = (ctx.tiesAll || {})[k] || [];
    for (var i = 0; i < l.length; i++) if (l[i].type === type || l[i].like === type) return l[i];
    return null;
  };
  /* 血縁（きょうだい・親子）で恋愛が起きない関係か。関係ごとに「恋愛：あり」（t.love === 'ok'）にもできる */
  HK.tieNoLove = function (t) { var D = t && T[t.type]; return !!(D && D.family && !D.loveOK && t.love !== 'ok'); };
  HK.tieFamLove = function (t) { var D = t && T[t.type]; return !!(D && D.family && !D.loveOK && t.love === 'ok'); };
  HK.Ties = {
    /* 片想いの「両片想い」を、向きを逆にした片想い二本に開く（どちらも mutual: true）。箱庭に渡す前に一度だけ */
    expand: function (ties) {
      var out = [];
      (ties || []).forEach(function (t) {
        if (!(t && t.type === 'crush' && t.cold === 'mutual')) { out.push(t); return; }
        var x = {}; for (var k in t) if (k !== 'cold') x[k] = t[k];
        x.mutual = true; out.push(x);
        var y = {}; for (var k2 in x) y[k2] = x[k2];
        y.a = x.b; y.b = x.a;
        if (!(ties || []).some(function (u) { return u && u.type === 'crush' && u.a === y.a && u.b === y.b; })) out.push(y);
      });
      return out;
    },
    /* a と b が両片想いか（どちらからも片想い。恋人になったら外れる） */
    pining: function (ctx, a, b) {
      if (!a || !b || a === b || ctx.pair(a, b).couple) return false;
      if (HK.Ties.has(ctx, a, b, 'lover') || HK.Ties.has(ctx, a, b, 'mate') || HK.Ties.has(ctx, a, b, 'fated')) return false;
      return !!(HK.Ties.from(ctx, a, b, 'crush') && HK.Ties.from(ctx, b, a, 'crush'));
    },
    apply: function (ctx, ties) {
      ctx.ties = {}; ctx.tiesAll = {};
      (ties || []).forEach(function (t) {
        var A = ctx.chars[t.a], B = ctx.chars[t.b], D = T[t.type];
        if (!A || !B || A === B || !D) return;
        /* クラスメイト（高校生）では、セフレの関係は設定しても使わない */
        if (t.type === 'fwb' && ctx.scen && ctx.scen.id === 'classroom') return;
        var k = keyOf(A, B), list = ctx.tiesAll[k] = ctx.tiesAll[k] || [];
        if (list.some(function (x) { return x.type === t.type && (!D.dir || x.a === A.i); })) return;
        var ab = ctx.R(A, B), ba = ctx.R(B, A);
        function add(r, d) { for (var f in d) r[f] = HK.clamp(r[f] + d[f], f === 'ten' || f === 'att' ? 0 : -100, 100); }
        /* 二つめ以降の関係は、初期値を半分だけ足す（重ねすぎて振り切れないように） */
        var half = list.length ? 0.5 : 1;
        function addH(r, d) { var o = {}; for (var f in d) o[f] = d[f] * half; add(r, o); }
        var HB = D.hate && t.cold && HK.HATE_BACK[t.cold] ? HK.HATE_BACK[t.cold] : null;
        addH(ab, D.ab); addH(ba, HB ? HB.ba : D.ba || D.ab);
        var CD = t.type === 'crush' && t.cold ? HK.CRUSH_COLD[t.cold] : null;
        if (CD && CD.ba) add(ba, CD.ba);
        var OB = t.type === 'yan' && t.cold && HK.OBS_BACK ? HK.OBS_BACK[t.cold] : null;
        if (OB && OB.ba) add(ba, OB.ba);
        var p = ctx.pair(A, B);
        if (D.chem != null) p.chem = HK.clamp(p.chem * (HK.tieFamLove(t) ? 0.7 : D.chem) + (D.chem > 1 ? 0.2 : 0), 0.01, 2);
        if (D.fric != null && !HB) p.fric = HK.clamp(p.fric * D.fric, 0.2, 2);
        if (D.couple) p.couple = true;
        /* 血のつながった家族（きょうだい・親子）：恋愛には絶対にならず、喧嘩しても信頼は崩れにくい */
        if (HK.tieNoLove(t)) p.kin = true;
        if (D.family && !D.loveOK) p.trustFloor = Math.max(p.trustFloor || 0, t.type === 'sibbad' ? 15 : 30);
        if (D.night && ctx.scen.id !== 'classroom') p.night = true;
        var o = { type: t.type, like: D.like || '', a: A.i, b: B.i, cold: CD || HB || OB ? t.cold : '', love: HK.tieFamLove(t) ? 'ok' : '', mutual: !!t.mutual };
        list.push(o);
        list.sort(function (x, y) { return PRIO.indexOf(x.type) - PRIO.indexOf(y.type); });
        ctx.ties[k] = list[0];
        p.tie = list[0];
        list[0].also = list.slice(1).map(function (x) { return x.type; });
      });
    },
    /* 代表の関係。type を渡すと、その種類の関係があればそれを返す */
    get: function (ctx, a, b, type) {
      if (!ctx.ties || !b) return null;
      if (type) return HK.Ties.has(ctx, a, b, type);
      return ctx.ties[keyOf(a, b)] || null;
    },
    all: function (ctx, a, b) { return (ctx.tiesAll && b && ctx.tiesAll[keyOf(a, b)]) || []; },
    has: function (ctx, a, b, type) {
      var l = HK.Ties.all(ctx, a, b);
      for (var i = 0; i < l.length; i++) if (l[i].type === type || l[i].like === type) return l[i];
      return null;
    },
    /* a が b を敵視する関係（不仲・敵対）。相手の気持ちが決まっている関係では、相手の側からは null */
    hostile: function (ctx, a, b) {
      var l = HK.Ties.all(ctx, a, b);
      for (var i = 0; i < l.length; i++) { var D = T[l[i].type]; if (D && D.hate && (l[i].a === a.i || !l[i].cold)) return l[i]; }
      return null;
    },
    /* 向きのある関係で、from から向いているもの（片想いが両方向にあるときなど） */
    from: function (ctx, a, b, type) {
      var l = HK.Ties.all(ctx, a, b);
      for (var i = 0; i < l.length; i++) if ((l[i].type === type || l[i].like === type) && l[i].a === a.i) return l[i];
      return null;
    },
    /* a が b に向けて起こす行動の倍率（重ねた関係ぶん掛け合わせる） */
    bias: function (ctx, a, b, cat) {
      var r = 1;
      HK.Ties.all(ctx, a, b).forEach(function (t) {
        var D = T[t.type], m;
        if (D.hate) m = t.a !== a.i && t.cold && HK.HATE_BACK[t.cold] ? HK.HATE_BACK[t.cold].bias : D.bias || {};
        else if (D.dir) m = (t.a === a.i ? D.biasA : D.biasB) || {};
        else m = D.bias || {};
        if (m[cat] != null) r *= cat === 'romance' && HK.tieFamLove(t) ? Math.max(m[cat], 0.75) : m[cat];
      });
      return r;
    },
    /* 関係値の伸びに掛ける倍率（増える方向のみ） */
    mult: function (ctx, a, b, f) {
      var r = 1;
      HK.Ties.all(ctx, a, b).forEach(function (t) {
        var D = T[t.type], m = D.mods && D.mods[f];
        if (D.hate && t.a !== a.i && t.cold && HK.HATE_BACK[t.cold]) { var hm = HK.HATE_BACK[t.cold].mods[f]; if (hm != null) r *= hm; return; }
        if (t.type === 'crush' && t.a !== a.i) {
          /* 想われる側：相手にしていなければ、惹かれ（と苦手なら好意）がほとんど育たない */
          var CD = t.cold ? HK.CRUSH_COLD[t.cold] : null;
          if (CD && CD[f] != null) r *= CD[f];
          else if (f !== 'att' && m != null) r *= m;
          return;
        }
        if (m != null) r *= f === 'att' && HK.tieFamLove(t) ? Math.max(m, 0.8) : m;
      });
      return r;
    },
    pull: function (ctx, a, b) {
      var v = 0;
      HK.Ties.all(ctx, a, b).forEach(function (t) { v = Math.max(v, T[t.type].pull || 1); });
      return v;
    },
    /* 「守りたい相手」の候補（恋人・親子・親友・主従・片想いなど） */
    focusFor: function (ctx, a) {
      var best = null, bv = 0, PRI = { lover: 5, parent: 5, pparent: 5, sibprot: 5, crush: 4, best: 4, master: 4, mentor: 3, almost: 3, sibling: 3, sibclose: 3, teacher: 2, childhood: 2, fwb: 2, friend: 1, colleague: 1, buddy: 4, senpai: 2 };
      var L0 = [];
      Object.keys(ctx.tiesAll || {}).forEach(function (k) { L0 = L0.concat(ctx.tiesAll[k]); });
      L0.forEach(function (t) {
        if (t.a !== a.i && t.b !== a.i) return;
        var v = PRI[t.type] || 0;
        if (t.type === 'crush' && t.a !== a.i) v = 0;
        if (v > bv) { bv = v; best = ctx.chars[t.a === a.i ? t.b : t.a]; }
      });
      return best;
    },
    note: function (ctx, t) {
      var D = T[t.type], A = ctx.chars[t.a], B = ctx.chars[t.b];
      return D.dir ? A.name + 'は' + B.name + 'の' + D.roleA + '（' + D.label + '）' : D.label;
    }
  };
})();
