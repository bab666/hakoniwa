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
    enemy: { mods: { aff: 0.5, trust: 0.5, att: 0.5, ten: 1.3 }, effect: '強い嫌悪。好意・信頼が育ちにくく、争いやすい。相手の気持ちを選ぶと一方的な敵視にもできる（相手は気にしていない・友人だと思っている・愛している…）。嫌悪の強さは箱庭の中で上下し、下がれば不仲と同じ振る舞いに。愛憎（〇〇だけ／××だけ／双方）を選ぶと、持つ側は口では嫌いながら相手を構いたがり、相手がほかの人と親しくすると嫉妬する（嫌い合いながら離れられない腐れ縁に。恋愛対象・受け攻めは越えない）', label: '敵対', dir: true, roleA: '敵視する側', roleB: '相手', hate: 2, ab: { ten: 60, aff: -40, trust: -40 }, pol: -2, fric: 1.4, pull: 1.8, bias: { conflict: 2, combat: 2, betray: 1.5, romance: 0.3, help: 0.4 } },
    lover: { mods: { att: 1.2, ten: 0.85 }, effect: '惹かれが育ちやすく、争いを避ける', label: '恋人', ab: { aff: 55, att: 55, trust: 40 }, pol: 2, chem: 1.3, pull: 2.4, couple: true, bias: { romance: 1.8, help: 1.4, combat: 0.15, betray: 0.4 } },
    fwb: { mods: { att: 1.15, aff: 0.85 }, effect: '体の距離は近いが、気持ちは育ちにくい', label: 'セフレ', ab: { att: 45, aff: 15, trust: 15 }, pol: 1, chem: 1.2, pull: 1.8, night: true, bias: { romance: 1.6, bond: 0.8 } },
    ex: { mods: { att: 1.1, ten: 1.15 }, effect: '未練と気まずさが残る', label: '元恋人', ab: { aff: 10, att: 25, ten: 30, trust: 5 }, pol: 0, pull: 1.5, bias: { conflict: 1.3, romance: 1.2 } },
    fated: { mods: { att: 1.6, aff: 1.2, ten: 0.8 }, effect: '遺伝子レベルで惹かれ合う。出会った瞬間から抗いにくい（オメガバース向け）', label: '運命の番', ab: { att: 55, aff: 20, trust: 10 }, pol: 2, chem: 1.8, pull: 2.6, bias: { romance: 2.2, help: 1.3, combat: 0.2 } },
    mate: { mods: { att: 1.2, ten: 0.85, trust: 1.1 }, effect: 'オメガバースでα×Ωなら、最初から番（うなじを噛んだ仲）。ほかの組み合わせや箱庭では恋人と同じ', label: '番', ab: { aff: 60, att: 60, trust: 50 }, pol: 2, chem: 1.3, pull: 2.6, couple: true, bias: { romance: 1.8, help: 1.5, combat: 0.1, betray: 0.3 } },
    teacher: { mods: { trust: 1.15 }, effect: '教師は生徒を導き守ろうとし、生徒は教師を頼る。叱ることも、反発することもある', label: '教師と生徒', dir: true, roleA: '教師', roleB: '生徒', ab: { aff: 18, trust: 25, ten: 4 }, ba: { aff: 18, trust: 30, ten: 6 }, pol: 1, chem: 0.6, pull: 1.5, biasA: { help: 1.7, conflict: 1.15, bond: 1.1 }, biasB: { help: 1.15, bond: 1.2, conflict: 1.1 } },
    mentor: { mods: { trust: 1.3, ten: 0.85 }, effect: '師は弟子を鍛え、弟子は師を慕う。信頼が厚く、裏切りは起きにくい', label: '師弟', dir: true, roleA: '師匠', roleB: '弟子', ab: { aff: 25, trust: 40, ten: 4 }, ba: { aff: 35, trust: 55 }, pol: 2, chem: 0.7, pull: 1.9, biasA: { help: 1.7, conflict: 1.1, bond: 1.2, betray: 0.3 }, biasB: { help: 1.8, bond: 1.4, betray: 0.2, combat: 0.4 } },
    sibprot: { mods: { att: 0.06, trust: 1.15 }, effect: '兄姉が弟妹を我が子のように守ろうとする。恋愛にはならない', label: '兄弟（庇護）', dir: true, roleA: '兄姉', roleB: '弟妹', like: 'parent', ab: { aff: 50, trust: 32, ten: 5 }, ba: { aff: 35, trust: 45, ten: 10 }, pol: 1, chem: 0.03, pull: 1.8, family: true, biasA: { help: 2, conflict: 1.25, romance: 0.05, combat: 0.15, betray: 0.2 }, biasB: { help: 1.3, conflict: 1.3, romance: 0.05, combat: 0.3, betray: 0.3 } },
    sibclose: { mods: { att: 0.08, trust: 1.3, ten: 0.75 }, effect: '親友や幼馴染のように仲のいいきょうだい。気安く、助け合う。恋愛にはならない', label: '兄弟（親友のよう）', like: 'sibling', ab: { aff: 45, trust: 50, ten: 3 }, pol: 2, chem: 0.05, pull: 1.9, family: true, bias: { help: 1.7, bond: 1.6, conflict: 1.0, romance: 0.1, combat: 0.25, betray: 0.3 } },
    sibbad: { mods: { att: 0.08, aff: 0.8, ten: 1.25 }, effect: '血はつながっているが反りが合わないきょうだい。顔を合わせれば口喧嘩。それでも、いざとなると見捨てきれない（信頼は底をつかない）。恋愛にはならない', label: '兄弟（不仲）', like: 'sibling', ab: { aff: -8, trust: 12, ten: 32 }, pol: -1, chem: 0.05, fric: 1.25, pull: 1.8, family: true, bias: { conflict: 1.9, help: 1.1, bond: 0.75, romance: 0.1, combat: 0.7, betray: 0.8 } },
    bad: { mods: { aff: 0.75, trust: 0.8, ten: 1.15 }, effect: '気が合わず、何かと衝突する（敵対ほど強い嫌悪ではない）。いがみ合いながらも、きっかけがあれば打ち解けることもある。相手の気持ちを選ぶと一方的な敵視にもできる。嫌悪が強まれば敵対と同じ振る舞いに。愛憎（〇〇だけ／××だけ／双方）を選ぶと、持つ側は嫌いながらも相手を気にして構い、相手がほかの人と親しくすると嫉妬する', label: '不仲', dir: true, roleA: '敵視する側', roleB: '相手', hate: 1, ab: { aff: -18, trust: -8, ten: 34 }, pol: -1, fric: 1.25, pull: 1.4, bias: { conflict: 1.6, help: 0.7, bond: 0.75, romance: 0.6, combat: 1.1, betray: 1.15 } },
    yan: { mods: { att: 1.25, ten: 1.1 }, effect: '執着する側は、相手が誰かと親しくするたびに嫉妬し、執着を深めていく。深まると監視・束縛・恋敵への敵意に変わり、R18版では監禁・恋敵への危害・心中まで暴走することがある（全年齢版ではほのめかす程度）', label: '執着（ヤンデレ）', dir: true, roleA: '執着する側', roleB: '執着される側', ab: { aff: 30, att: 55, trust: -5, ten: 10 }, ba: { aff: 5 }, pol: 0, chem: 1.3, pull: 2, biasA: { romance: 1.6, conflict: 1.2 }, obsess: true },
    noobs: { mods: {}, effect: 'この二人のあいだでは、嫉妬も執着も生まれない（ほかの関係に重ねて使う）', label: '執着なし', ab: {}, pol: 0, pull: 0, noObsess: true },
    /* 同級生：同じ学年・クラスだった（いる）仲。職業や立場によらない */
    classmate: { mods: { trust: 1.1 }, effect: '同じ学年・同じクラスだった（いる）仲。気安く話せて、昔話で打ち解けやすい。張り合うこともある', label: '同級生', ab: { aff: 15, trust: 15, ten: 3 }, pol: 1, pull: 1.3, bias: { bond: 1.4, help: 1.15, conflict: 1.05 } },
    /* 上司と部下：職業によらない（医者と警察でも、同じ組織・現場で上下があればこれ） */
    boss: { mods: { trust: 1.15 }, effect: '上司は部下に指示を出して守り、部下は上司を立てて従う。職場の外では立場が揺らぐことも、恋愛に発展することもある', label: '上司と部下', dir: true, roleA: '上司', roleB: '部下', ab: { aff: 12, trust: 25, ten: 6 }, ba: { aff: 15, trust: 30, ten: 8 }, pol: 1, chem: 0.85, pull: 1.6, biasA: { help: 1.4, conflict: 1.2, bond: 1.1 }, biasB: { help: 1.5, bond: 1.1, betray: 0.5 } },
    /* 執着（信仰）：相手を崇め、すべてを捧げようとする。想いは揺らぎにくい（stiffA・floorA）。恋愛に発展するかは「恋愛」の選択（loveOpt）、相手の気持ちは WORSHIP_BACK */
    worship: { mods: { trust: 1.3, aff: 1.2 }, effect: '信仰する側は相手を崇め、すべてを捧げようとする。その想いは揺らぎにくく、相手のためなら身を投げ出す。恋愛に発展するかは選べる。相手の気持ち（気づいていない・受け入れている・戸惑っている・支配している・大切に思っている）も選べる', label: '執着（信仰）', dir: true, roleA: '信仰する側', roleB: '信仰される側', ab: { aff: 55, trust: 70, att: 8 }, ba: { aff: 10, trust: 10 }, pol: 1, chem: 0.7, pull: 2.4, loveOpt: true, worship: true, stiffA: { aff: 0.12, trust: 0.12 }, floorA: { aff: 35, trust: 45 }, biasA: { help: 2.2, bond: 1.4, betray: 0.05, combat: 0.2, conflict: 0.4 }, biasB: { help: 1.1 } },
    /* 恩人：恩を受けた側の感謝は消えにくい（stiffB） */
    benefactor: { mods: { trust: 1.15 }, effect: '恩を受けた側は恩人に深く感謝し、恩を返そうとする。恩人は相手を気にかける。恩は簡単には消えない', label: '恩人', dir: true, roleA: '恩人', roleB: '恩を受けた側', ab: { aff: 22, trust: 25 }, ba: { aff: 40, trust: 55 }, pol: 2, pull: 1.8, stiffB: { aff: 0.35, trust: 0.3 }, floorB: { aff: 5, trust: 20 }, biasA: { help: 1.4, bond: 1.2 }, biasB: { help: 2, bond: 1.3, betray: 0.15, conflict: 0.7 } },
    /* 親族（親子・きょうだいでない）：いとこ・おじおば・甥姪など */
    /* 夫婦（配偶者）：箱庭に渡すときに「恋人」（夫婦の印つき）に開く。冷えた・別居は惹かれが下がり、険悪さが上がる。離婚した二人は「元恋人」に開く（HK.Ties.expand） */
    spouse: { mods: { att: 1.15, ten: 0.9 }, effect: '恋人の上に重なる、暮らしを共にする二人。円満・冷えている・別居中・離婚した（元夫婦）を選べる', label: '夫婦', ab: { aff: 55, att: 50, trust: 50 }, pol: 2, chem: 1.2, pull: 2.4, couple: true, expandTo: 'lover', bias: { romance: 1.6, help: 1.5, combat: 0.15, betray: 0.35 } },
    /* 義理のきょうだい・異母（異父）きょうだい：箱庭に渡すときに「親族」（義理の印つき）に開く。「恋愛：あり」も選べる */
    stepsib: { mods: { att: 0.1, trust: 1.05 }, effect: '親の再婚でできたきょうだい・片親だけが同じきょうだい。家族としての距離感があり、恋愛にはならない（「恋愛：あり」も選べる）', label: '義理の兄弟', ab: { aff: 22, trust: 25, ten: 8 }, pol: 1, chem: 0.05, pull: 1.5, family: true, expandTo: 'relative', bias: { help: 1.4, bond: 1.2, conflict: 1.1, romance: 0.1, betray: 0.4, combat: 0.4 } },
    relative: { mods: { att: 0.1, trust: 1.1 }, effect: 'いとこ・おじおば・甥姪など、親子やきょうだいでない親族。気安いが遠慮もあり、いざとなれば助け合う。恋愛にはならない（「恋愛：あり」も選べる）', label: '親族', ab: { aff: 25, trust: 30, ten: 5 }, pol: 1, chem: 0.05, pull: 1.5, family: true, bias: { help: 1.5, bond: 1.2, romance: 0.1, betray: 0.4, combat: 0.4 } },
    /* 本命（{a}＝想う人、{b}＝本命）：本命との恋愛の出来事が起きやすく、ほかの人の誘いは一途に断りがち。耐えがたい状況（強い媚薬・焦りの限界・重い条件の部屋）では妥協する（HK.honmeiFactor） */
    honmei: { mods: { att: 1.25 }, effect: '想う人は本命との恋愛の出来事が起きやすく、ほかの人からの誘いは断りがち。強い媚薬や焦りの限界など耐えがたい状況では、ほかの人とも妥協する', label: '本命', dir: true, roleA: '想う人', roleB: '本命', ab: { att: 40, aff: 30 }, ba: {}, pol: 1, pull: 2.2, biasA: { romance: 1.9, bond: 1.2 }, biasB: {} },
    /* 歪んだ関係（{a}＝支配する側、{b}＝支配される側）：恋人どうしだが、支配する側が束縛・暴言・暴力で相手を縛る。
       重い場面（暴言・暴力・束縛）は「内容のスイッチ」の「DVなど歪んだ関係」（abuse）が入のときだけ。切なら、すれ違いの多い恋人として軽い場面だけ（tie-abuse.js） */
    abuse: { mods: { ten: 1.3, trust: 0.75 }, effect: '恋人どうしだが、支配する側が束縛や暴言で相手を縛る。支配される側の気持ち（離れられない・怯えている・逃げ出したい）を選べる。重い場面は「内容のスイッチ」で「DVなど歪んだ関係」を入れたときだけ（切なら、すれ違いの多い恋人として軽い場面だけ）', label: '歪んだ関係', dir: true, roleA: '支配する側', roleB: '支配される側', ab: { att: 40, aff: 20, trust: 5, ten: 22 }, ba: { att: 35, aff: 30, trust: 10, ten: 28 }, pol: -1, chem: 1.1, pull: 2.2, fric: 1.4, couple: true, biasA: { conflict: 1.6, romance: 1.2 }, biasB: { romance: 1.1, help: 1.2 } },
    master: { mods: { trust: 1.25 }, effect: '従は主を助けに動く', label: '主従', dir: true, roleA: '主', roleB: '従', ab: { trust: 20, aff: 15, ten: 8 }, ba: { trust: 55, aff: 30 }, pol: 1, pull: 1.8, biasA: { conflict: 1.2, help: 1.1 }, biasB: { help: 2, bond: 1.2, betray: 0.3, combat: 0.4 } }
  };
  /* 気持ちの関係（恋愛にはならない。tie-stage.js の場面）
     fond：一方的な好意・敬愛。慕う側が見守る・差し入れる。相手は気づくことも、気づかないこともある
     blind：盲信。盲信する側が相手を絶対視し、相手に近づく人を遠ざけようとする（執着の「排除」の軽い版。恋愛にはならない） */
  T.fond = { mods: { aff: 1.15, trust: 1.1, att: 0.4 }, effect: '慕う側が相手を一方的に敬い、そっと見守ったり差し入れたりする。恋愛にはならない。相手は気づいていないこともある', label: '一方的な好意・敬愛', dir: true, roleA: '慕う側', roleB: '慕われる側', ab: { aff: 35, trust: 30 }, ba: { aff: 4 }, pol: 1, chem: 0.4, pull: 1.6, stiffA: { aff: 0.4 }, biasA: { help: 1.8, bond: 1.3, romance: 0.35, conflict: 0.6 }, biasB: {} };
  T.blind = { mods: { trust: 1.25, att: 0.4 }, effect: '盲信する側は相手を絶対に正しいと信じ、相手に近づく人を遠ざけようとする。恋愛にはならない。揺らぎにくい', label: '盲信', dir: true, roleA: '盲信する側', roleB: '盲信される側', ab: { aff: 40, trust: 70, ten: 4 }, ba: { aff: 6, trust: 8 }, pol: 0, chem: 0.4, pull: 2, stiffA: { trust: 0.2, aff: 0.3 }, floorA: { trust: 40 }, biasA: { help: 2, conflict: 1.3, romance: 0.3, betray: 0.1 }, biasB: {} };
  /* 追加の気持ち・関係（2026-10-25。場面は tie-new.js と、物語型は tie-new-story.js）
     apathy：無関心（{a}→{b}）。a から b への好意・信頼・惹かれ・緊張は最初の値から動かない（engine.js の凍結）。
             a は b との恋愛・夜・嫉妬・心配・助け合いの出来事に入らない（b からの一方的な働きかけは起きる）
     fear：恐怖（{a} が {b} を恐れる）。a は b を避け、命じられると従い、第三者に庇護を求める。二人は恋愛にも夜にもならない
     ※ 無関心・恐怖の二人は、住人の noLove（互いの番号）に入れる：HK.ngPair・HK.canLove・HK.sexBlocked・HK.Pos.okSex がどれも偽になる
     fiance：許嫁（向きなし）。二人それぞれの気持ち（t.feel＝{a} の、t.feelB＝{b} の：eager 乗り気／unsure 戸惑い／refuse 断りたい）。
             両方が乗り気で、恋愛対象と受け攻めが合う組（HK.canLove 両方向・HK.Pos.okSex）だけ、恋人と同じ扱い（pf.couple）。
             断りたい側がほかの人を好きになると破談（tie-new.js。pf.fiBroken。以後は恋愛の出来事を起こさず、元恋人に近い気まずさ）
     comrade：仲間（関係の一覧には出さない。住人の一覧のグループの「仲間」を入れたグループの住人どうしに、ui.js が自動で付ける） */
  T.apathy = { mods: {}, effect: '無関心な側は相手に何の感情も動かさない。好意・信頼・惹かれ・緊張は最初のまま変わらず、相手との恋愛・夜・嫉妬・心配・助け合いの出来事に入らない（相手からの一方的な働きかけは起きる）', label: '無関心', dir: true, roleA: '無関心な側', roleB: '相手', ab: {}, ba: {}, pol: 0, chem: 0.05, pull: 0.9, apathy: true, biasA: { romance: 0, help: 0.15, bond: 0.3, conflict: 0.4, combat: 0.5, betray: 0.6 }, biasB: {} };
  T.fear = { mods: {}, modsA: { trust: 0.5, aff: 0.6 }, effect: '恐れる側は相手を避け（同じ場所にいたがらない・目を合わせない・話しかけられると固まる）、命じられると逆らえずに従い、ほかの人に庇護を求める。この二人は恋愛にも夜にもならない', label: '恐怖', dir: true, roleA: '恐れる側', roleB: '恐れられる側', ab: { ten: 42, aff: -12, trust: -18 }, ba: {}, pol: -1, chem: 0.05, fric: 1.2, pull: 1.1, fear: true, stiffA: { ten: 0.4 }, biasA: { romance: 0, help: 0.3, bond: 0.25, conflict: 0.35, combat: 0.25, betray: 0.7 }, biasB: { romance: 0.2 } };
  T.fiance = { mods: { att: 1.1 }, effect: '家どうしや周りが決めた、結婚の約束をした二人。それぞれの気持ち（乗り気・戸惑い・断りたい）を選べる。両方が乗り気なら恋人と同じ扱い（恋愛対象と受け攻めが合う組だけ）。断りたい側がほかの人を好きになると、破談になることがある', label: '許嫁', ab: { aff: 15, att: 16, trust: 15, ten: 8 }, pol: 1, chem: 1.1, pull: 1.9, fiance: true, bias: { romance: 1.3, help: 1.2, bond: 1.1 } };
  T.comrade = { mods: { trust: 1.15 }, effect: '同じグループの仲間。信頼が育ちやすく、助け合い・庇い合い・一緒に動く出来事が起きる。恋愛や嫉妬には関わらない', label: '仲間', ab: { aff: 6, trust: 12 }, pol: 1, pull: 0.8, hidden: true, comrade: true, bias: { help: 1.4, bond: 1.2, betray: 0.6 } };
  /* 許嫁の気持ち（それぞれの側）。ab＝その側から相手への初期値の足し引き、att＝惹かれの育ち、rom＝恋愛の出来事の倍率 */
  HK.FIANCE_FEEL = {
    eager: { label: '乗り気', short: '乗り気', ab: { aff: 12, att: 14 }, att: 1.25, rom: 1.4 },
    unsure: { label: '戸惑い', short: '戸惑い', ab: { ten: 6 }, att: 0.9, rom: 0.85 },
    refuse: { label: '断りたい', short: '断りたい', ab: { aff: -10, att: -12, ten: 14 }, att: 0.35, rom: 0.25 }
  };
  HK.FIANCE_FEEL_ORDER = ['eager', 'unsure', 'refuse'];
  /* 執着（ヤンデレ）の型（空欄は今までどおり気質で決める。obsess-kit.js の O.type が優先して使う） */
  HK.OBS_SUB = {
    '': { label: '型：おまかせ（気質で）', short: '' },
    devote: { label: '型：献身（尽くして囲い込む）', short: '献身' },
    bind: { label: '型：束縛（監視して縛る）', short: '束縛' },
    purge: { label: '型：排除（近づく人を遠ざける）', short: '排除' },
    dep: { label: '型：依存（傍にいないと不安で、探す・確かめる・すがる）', short: '依存' },
    hatelove: { label: '型：愛憎（探し守りながら、責めて試して傷つける）', short: '愛憎' }
  };
  HK.OBS_SUB_ORDER = ['', 'devote', 'bind', 'purge', 'dep', 'hatelove'];
  /* 敵対の度合い（空欄は今までどおり）。hate＝憎悪：貶める・陥れる・孤立させる。死のある箱庭では危害に至りうる */
  HK.ENEMY_GRADE = {
    '': { label: '度合い：敵対', short: '' },
    hate: { label: '度合い：憎悪（貶める・陥れる・孤立させる）', short: '憎悪', ab: { ten: 14, aff: -18, trust: -10 } }
  };
  HK.ENEMY_GRADE_ORDER = ['', 'hate'];
  /* 愛憎（敵対・不仲の追加の欄 lh。2026-10-26）：口では嫌悪しながら、相手を構いたがる・相手がほかの人を構うと嫉妬する気持ちを、誰が持つか。
     ''＝なし／a＝{a}（一人目）だけ／b＝{b}（二人目）だけ／both＝双方。判定は hate-love.js の HK.LoveHate（恋愛対象・受け攻めは越えない）。
     表示は名前入り（HK.tieExtraLabel）。名前が取れないところでは「一人目だけ／二人目だけ」 */
  HK.LOVEHATE = {
    '': { label: '愛憎：なし', short: '' },
    a: { label: '愛憎：一人目だけ', short: '愛憎（一人目だけ）', nl: '愛憎：%だけ', ns: '愛憎（%だけ）' },
    b: { label: '愛憎：二人目だけ', short: '愛憎（二人目だけ）', nl: '愛憎：%だけ', ns: '愛憎（%だけ）' },
    both: { label: '愛憎：双方', short: '愛憎（双方）' }
  };
  HK.LOVEHATE_ORDER = ['', 'a', 'b', 'both'];
  /* きょうだいの上下（兄弟姉妹・兄弟（親友のよう）・兄弟（不仲）・義理のきょうだいの追加の欄 elder。2026-10-26）。
     ''＝自動（年齢で決める。同じ年齢なら双子で上下なし）／a＝{a}（一人目）が上／b＝{b}（二人目）が上／none＝上下なし（年齢差があっても対等）。
     a・b は年齢より優先（同じ年齢なら「双子の姉」「双子の弟」の形）。判定は sib-word.js の HK.Sib.info。兄弟（庇護）は向きで上下が決まるので、この欄はない。
     表示は名前入り（HK.tieExtraLabel：nl・ns の % を名前に） */
  HK.SIB_ELDER = {
    '': { label: '上下：自動（年齢）', short: '' },
    a: { label: '上下：一人目が上', short: '一人目が上', nl: '上下：%が上', ns: '%が上' },
    b: { label: '上下：二人目が上', short: '二人目が上', nl: '上下：%が上', ns: '%が上' },
    none: { label: '上下：なし（対等）', short: '上下なし' }
  };
  HK.SIB_ELDER_ORDER = ['', 'a', 'b', 'none'];
  /* 恩人の、恩を受けた側の気持ち（空欄＝感謝） */
  HK.BENE_FEEL = {
    '': { label: '恩を受けた側：感謝', short: '' },
    guilt: { label: '恩を受けた側：負い目（逆らえない・頼みを断れない）', short: '負い目', ba: { ten: 10, aff: -6 }, biasB: { help: 2.2, conflict: 0.25, betray: 0.05, bond: 0.9 } }
  };
  HK.BENE_FEEL_ORDER = ['', 'guilt'];
  /* 一方的な好意・敬愛の様子（空欄＝敬愛） */
  HK.FOND_MODE = {
    '': { label: '様子：敬愛', short: '' },
    oshi: { label: '様子：推し（ファン目線で応援する）', short: '推し' }
  };
  HK.FOND_MODE_ORDER = ['', 'oshi'];
  /* セフレの様子（空欄＝対等）。mistress＝愛人：片方にほかの本命・夫婦がいる前提の、秘密の関係 */
  HK.FWB_MODE = {
    '': { label: '様子：対等', short: '' },
    mistress: { label: '様子：愛人（片方にほかの本命・夫婦がいる秘密の関係）', short: '愛人' }
  };
  HK.FWB_MODE_ORDER = ['', 'mistress'];
  /* 関係ごとの追加の選択肢（「相手の気持ち」cold とは別の欄）。f＝関係の欄の名前、who＝その欄がどちらの側の気持ちか（表示用） */
  HK.tieExtra = function (type) {
    var X = {
      yan: [{ f: 'sub', map: HK.OBS_SUB, order: HK.OBS_SUB_ORDER, aria: '執着の型' }],
      /* 敵対の度合い（憎悪）は設定画面から外した（2026-10-26。hide）。保存済みの grade: 'hate' は読めて、今までどおり効く */
      enemy: [{ f: 'lh', map: HK.LOVEHATE, order: HK.LOVEHATE_ORDER, aria: '愛憎', names: true }, { f: 'grade', map: HK.ENEMY_GRADE, order: HK.ENEMY_GRADE_ORDER, aria: '敵対の度合い', hide: true }],
      bad: [{ f: 'lh', map: HK.LOVEHATE, order: HK.LOVEHATE_ORDER, aria: '愛憎', names: true }],
      benefactor: [{ f: 'feel', map: HK.BENE_FEEL, order: HK.BENE_FEEL_ORDER, aria: '恩を受けた側の気持ち' }],
      fond: [{ f: 'mode', map: HK.FOND_MODE, order: HK.FOND_MODE_ORDER, aria: '慕う側の様子' }],
      fwb: [{ f: 'mode', map: HK.FWB_MODE, order: HK.FWB_MODE_ORDER, aria: 'セフレの様子' }],
      fiance: [{ f: 'feel', who: 'a', map: HK.FIANCE_FEEL, order: HK.FIANCE_FEEL_ORDER, aria: '一人目の気持ち' }, { f: 'feelB', who: 'b', map: HK.FIANCE_FEEL, order: HK.FIANCE_FEEL_ORDER, aria: '二人目の気持ち' }]
    };
    /* きょうだいの上下（兄弟（庇護）は向きで決まるので付けない） */
    if (/^(sibling|sibclose|sibbad|stepsib)$/.test(type)) X[type] = [{ f: 'elder', map: HK.SIB_ELDER, order: HK.SIB_ELDER_ORDER, aria: '上下', names: true }];
    return X[type] || [];
  };
  /* 追加の欄の選択肢の文字（names の欄は、一人目・二人目を名前に置き換える（選択肢の nl・ns の % に名前）。na・nb＝名前。なければ元の文字） */
  HK.tieExtraLabel = function (x, id, na, nb) {
    var m = x && x.map && x.map[id];
    if (!m) return '';
    if (!x.names || !m.nl) return m.label;
    var n = id === 'a' ? na : id === 'b' ? nb : '';
    return n ? m.nl.replace('%', n) : m.label;
  };
  HK.tieExtraShort = function (x, id, na, nb) {
    var m = x && x.map && x.map[id];
    if (!m || !m.short) return '';
    if (!x.names || !m.ns) return m.short;
    var n = id === 'a' ? na : id === 'b' ? nb : '';
    return n ? m.ns.replace('%', n) : m.short;
  };
  /* 追加の欄の値を、関係の種類に合う値だけに直す（合わない欄は消す）。t を書き換えて返す */
  HK.tieExtraNorm = function (t) {
    if (!t) return t;
    var ex = HK.tieExtra(t.type), keep = {};
    ex.forEach(function (x) { keep[x.f] = 1; if (t[x.f] != null && !(x.map[t[x.f]] && t[x.f] !== '')) delete t[x.f]; });
    ['sub', 'grade', 'feel', 'feelB', 'mode', 'lh', 'elder'].forEach(function (f) { if (!keep[f]) delete t[f]; });
    return t;
  };
  /* 無関心・恐怖の二人のあいだの恋愛の関係（恋人・セフレ・片想い・本命など）は外す（無関心・恐怖のほうを優先する）。
     一方通行の執着（yan）・許嫁・元恋人は残す（恋愛・夜には進まない：noLove）。該当がなければ、渡された配列をそのまま返す */
  var FEAR_DROP = /^(lover|mate|fated|fwb|almost|crush|abuse|honmei|spouse)$/;
  HK.fearTies = function (ties) {
    var l = ties || [], nl = {};
    l.forEach(function (t) { if (t && (t.type === 'apathy' || t.type === 'fear') && t.a !== t.b) nl[Math.min(t.a, t.b) + '-' + Math.max(t.a, t.b)] = 1; });
    if (!Object.keys(nl).length) return ties;
    return l.filter(function (t) { return !(t && FEAR_DROP.test(t.type) && nl[Math.min(t.a, t.b) + '-' + Math.max(t.a, t.b)]); });
  };
  /* 関係の一覧の外（関係の種類の選択肢に出さない）の関係 */
  HK.tieHidden = function (id) { return !!(HK.TIES[id] && HK.TIES[id].hidden); };
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
  /* 苦手・避けている：敵視されている側が、相手を苦手に思って距離を取る（無視する・第三者を頼る・身代わりに対応させる。hate-kit.js の H.avoid） */
  HK.HATE_BACK.avoid = { label: '相手：苦手・避けている', short: '相手は苦手', ba: { aff: -12, trust: -6, ten: 16 }, mods: { aff: 0.8 }, bias: { bond: 0.6, help: 0.7, romance: 0.3, conflict: 0.8 } };
  HK.HATE_BACK_ORDER.push('avoid');
  /* 執着（ヤンデレ）の「執着される側」の気持ち。ba=執着される側から執着する側への初期値 */
  HK.OBS_BACK = {
    '': { label: '執着される側：気づいていない', short: '' },
    afraid: { label: '執着される側：怖がっている', short: '怖がっている', ba: { aff: -8, ten: 22 } },
    hate: { label: '執着される側：嫌っている', short: '嫌われている', ba: { aff: -28, ten: 30, trust: -10 } },
    /* 困惑：怖いというより、どうすればいいか分からない。受け入れる余裕はないが、情があって拒めない */
    confused: { label: '執着される側：困惑している（情があって拒めない）', short: '困惑している', ba: { aff: 12, trust: 6, ten: 12 } },
    accept: { label: '執着される側：受け入れている', short: '受け入れている', ba: { aff: 25, trust: 15, att: 18 } },
    mutual: { label: '執着される側：共依存（同じくらい想っている）', short: '共依存', ba: { aff: 38, att: 50, trust: 10 } }
  };
  HK.OBS_BACK_ORDER = ['', 'afraid', 'hate', 'confused', 'accept', 'mutual'];
  /* 執着（信仰）の「信仰される側」の気持ち。ba=信仰される側から信仰する側への初期値。dominate は信仰を利用して相手を支配している */
  HK.WORSHIP_BACK = {
    '': { label: '信仰される側：気づいていない', short: '' },
    accept: { label: '信仰される側：受け入れている', short: '受け入れている', ba: { aff: 28, trust: 30 } },
    confused: { label: '信仰される側：戸惑っている（重荷に感じている）', short: '戸惑っている', ba: { aff: 5, ten: 16 } },
    dominate: { label: '信仰される側：支配している（信仰を利用して従わせている）', short: '支配している', ba: { aff: 6, trust: 12, ten: 4 }, dominate: true },
    cherish: { label: '信仰される側：大切に思っている', short: '大切に思っている', ba: { aff: 45, trust: 45, att: 6 } }
  };
  HK.WORSHIP_BACK_ORDER = ['', 'accept', 'confused', 'dominate', 'cherish'];
  /* 夫婦の今の様子（空欄は円満） */
  HK.MARRIED_COLD = {
    '': { label: '夫婦の様子：円満', short: '円満' },
    cold: { label: '夫婦の様子：冷えている', short: '冷えた夫婦', mod: { aff: -25, att: -30, ten: 18, trust: -10 } },
    separated: { label: '夫婦の様子：別居中', short: '別居中', mod: { aff: -15, att: -20, ten: 25, trust: -20 } },
    divorced: { label: '夫婦の様子：離婚した（元夫婦）', short: '元夫婦' }
  };
  HK.MARRIED_COLD_ORDER = ['', 'cold', 'separated', 'divorced'];
  /* 熟年夫婦：長年連れ添った二人。口数は少ないが穏やか（tie-rel.js の夫婦の場面） */
  HK.MARRIED_COLD.mature = { label: '夫婦の様子：熟年（長年連れ添った）', short: '熟年夫婦', mod: { trust: 12, aff: 4, att: -12, ten: -8 }, calm: true };
  HK.MARRIED_COLD_ORDER.splice(1, 0, 'mature');
  /* 関係の段階：師弟・主従・上司と部下・教師と生徒の仲（空欄はふつう）。ab＝上から下へ、ba＝下から上への初期値の足し引き */
  HK.TIE_GRADE = {
    '': { label: '仲：ふつう', short: '' },
    good: { label: '仲：良好（素直に慕い、よく認める）', short: '良好', ab: { aff: 10, trust: 10 }, ba: { aff: 12, trust: 10 } },
    bad: { label: '仲：険悪（反発し合う）', short: '険悪', ab: { aff: -12, ten: 18, trust: -6 }, ba: { aff: -14, ten: 20, trust: -8 } }
  };
  HK.TIE_GRADE_ORDER = ['', 'good', 'bad'];
  /* 歪んだ関係の、支配される側の気持ち（空欄は「離れられない」） */
  HK.ABUSE_BACK = {
    '': { label: '支配される側：離れられない（まだ好き）', short: '離れられない', ba: { att: 10, aff: 8 } },
    fear: { label: '支配される側：怯えている', short: '怯えている', ba: { att: -12, aff: -6, trust: -6, ten: 10 } },
    flee: { label: '支配される側：逃げ出したい', short: '逃げ出したい', ba: { att: -22, aff: -18, ten: 18 } }
  };
  HK.ABUSE_BACK_ORDER = ['', 'fear', 'flee'];
  /* 関係の種類ごとの「相手の気持ち」の選択肢（片想い・不仲・敵対）。なければ null */
  HK.coldOpts = function (type) {
    if (type === 'crush' && HK.CRUSH_COLD) return { map: HK.CRUSH_COLD, order: HK.CRUSH_COLD_ORDER, aria: '想われる側の気持ち' };
    if ((type === 'bad' || type === 'enemy') && HK.HATE_BACK) return { map: HK.HATE_BACK, order: HK.HATE_BACK_ORDER, aria: '相手の気持ち' };
    if (type === 'yan' && HK.OBS_BACK) return { map: HK.OBS_BACK, order: HK.OBS_BACK_ORDER, aria: '執着される側の気持ち' };
    if (type === 'worship' && HK.WORSHIP_BACK) return { map: HK.WORSHIP_BACK, order: HK.WORSHIP_BACK_ORDER, aria: '信仰される側の気持ち' };
    if (type === 'abuse' && HK.ABUSE_BACK) return { map: HK.ABUSE_BACK, order: HK.ABUSE_BACK_ORDER, aria: '支配される側の気持ち' };
    if (type === 'spouse' && HK.MARRIED_COLD) return { map: HK.MARRIED_COLD, order: HK.MARRIED_COLD_ORDER, aria: '夫婦の様子' };
    if (/^(mentor|master|boss|teacher)$/.test(type) && HK.TIE_GRADE) return { map: HK.TIE_GRADE, order: HK.TIE_GRADE_ORDER, aria: '二人の仲' };
    return null;
  };
  var HATE_WORDS = [[/一方的|片思いならぬ|相手は気にして(?:い)?ない|相手は気づいて(?:い)?ない|なんとも思って(?:い)?ない/, 'none'], [/相手はふつう|相手は普通/, 'normal'], [/相手は友(?:達|人)だと|友達だと思って/, 'friend'], [/相手は(?:好き|愛して|惚れて)|片想いされ|好かれて/, 'love']];
  var COLD_WORDS = [[/両片想い|両片思い|実は相手も/, 'mutual'], [/脈なし|眼中に|相手にされ|興味がない|興味なし/, 'none'], [/友達としか|友達止まり|異性として見|恋愛対象外|対象外/, 'friend'], [/苦手|嫌われ|避けられ|避けて/, 'dislike'], [/他に好き|ほかに好き|別に好き|好きな人がいる/, 'other']];
  HK.TIE_ORDER = ['acq', 'friend', 'colleague', 'senpai', 'buddy', 'childhood', 'classmate', 'almost', 'best', 'sibling', 'sibprot', 'sibclose', 'sibbad', 'stepsib', 'relative', 'parent', 'pparent', 'teacher', 'mentor', 'boss', 'benefactor', 'crush', 'yan', 'worship', 'bad', 'rival', 'enemy', 'lover', 'spouse', 'honmei', 'fwb', 'ex', 'abuse', 'fated', 'mate', 'master', 'noobs'];
  HK.TIE_ORDER.splice(HK.TIE_ORDER.indexOf('worship') + 1, 0, 'fond', 'blind');
  HK.TIE_ORDER.splice(HK.TIE_ORDER.indexOf('enemy') + 1, 0, 'apathy', 'fear');
  HK.TIE_ORDER.splice(HK.TIE_ORDER.indexOf('spouse') + 1, 0, 'fiance');
  /* 設定画面の関係の選択肢のまとまり（選びやすさのため。表に載っていない関係は「そのほか」）。並びは TIE_ORDER のまま */
  HK.TIE_GROUPS = [
    { id: 'stance', label: '立場・つながり', ids: ['acq', 'friend', 'best', 'buddy', 'childhood', 'classmate', 'colleague', 'senpai', 'boss', 'teacher', 'mentor', 'master', 'rival'] },
    { id: 'family', label: '家族・血縁', ids: ['sibling', 'sibprot', 'sibclose', 'sibbad', 'stepsib', 'parent', 'pparent', 'relative'] },
    { id: 'feeling', label: '気持ち（執着・恩・片想いなど）', ids: ['crush', 'honmei', 'yan', 'worship', 'fond', 'blind', 'benefactor', 'bad', 'enemy', 'apathy', 'fear', 'abuse', 'noobs'] },
    { id: 'love', label: '恋愛・夫婦の状態', ids: ['almost', 'lover', 'spouse', 'fiance', 'fwb', 'ex', 'mate', 'fated'] }
  ];
  /* <select> の中身（<optgroup> で分ける）。sel＝選んでおく id */
  HK.tieOptions = function (sel, o) {
    var esc = function (x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var done = {}, out = '';
    var grp = function (label, ids) {
      var l = HK.TIE_ORDER.filter(function (id) { return ids.indexOf(id) >= 0 && HK.TIES[id] && !done[id]; });
      if (!l.length) return;
      out += '<optgroup label="' + esc(label) + '">' + l.map(function (id) { done[id] = 1; return '<option value="' + id + '"' + (id === sel ? ' selected' : '') + '>' + esc(HK.TIES[id].label) + (o && o.dir && HK.TIES[id].dir ? '（' + esc(HK.TIES[id].roleA) + '→' + esc(HK.TIES[id].roleB) + '）' : '') + '</option>'; }).join('') + '</optgroup>';
    };
    HK.TIE_GROUPS.forEach(function (g) { grp(g.label, g.ids); });
    grp('そのほか', HK.TIE_ORDER.filter(function (id) { return !done[id]; }));
    return out;
  };

  /* 文字から関係の種類を推定（長い語から順に照合） */
  var ALIAS = [
    ['一方的な敬愛', 'fond'], ['敬愛', 'fond'], ['陰ながら慕う', 'fond'], ['盲信', 'blind'], ['盲目的に信じ', 'blind'],
    ['きょうだい（不仲）', 'sibbad'], ['兄弟姉妹（不仲）', 'sibbad'], ['兄弟（不仲）', 'sibbad'], ['姉妹（不仲）', 'sibbad'], ['不仲なきょうだい', 'sibbad'], ['不仲な兄弟', 'sibbad'], ['仲の悪いきょうだい', 'sibbad'], ['仲の悪い兄弟', 'sibbad'], ['兄弟（仲が悪い）', 'sibbad'], ['姉妹（仲が悪い）', 'sibbad'],
    ['執着なし', 'noobs'], ['嫉妬しない', 'noobs'], ['執着（信仰）', 'worship'], ['信仰', 'worship'], ['崇拝', 'worship'], ['心酔', 'worship'], ['ヤンデレ', 'yan'], ['執着', 'yan'],
    ['同級生', 'classmate'], ['クラスメイト', 'classmate'], ['同窓', 'classmate'], ['上司と部下', 'boss'], ['上司', 'boss'], ['部下', 'boss'], ['恩人', 'benefactor'], ['命の恩人', 'benefactor'],
    ['義理のきょうだい', 'stepsib'], ['義理の兄弟', 'stepsib'], ['義理の姉妹', 'stepsib'], ['義兄弟', 'stepsib'], ['義姉妹', 'stepsib'], ['義兄', 'stepsib'], ['義姉', 'stepsib'], ['義弟', 'stepsib'], ['義妹', 'stepsib'], ['異母', 'stepsib'], ['異父', 'stepsib'], ['連れ子', 'stepsib'],
    ['親族', 'relative'], ['親戚', 'relative'], ['いとこ', 'relative'], ['従兄弟', 'relative'], ['従姉妹', 'relative'], ['叔父', 'relative'], ['叔母', 'relative'], ['伯父', 'relative'], ['伯母', 'relative'], ['おじ', 'relative'], ['おば', 'relative'], ['甥', 'relative'], ['姪', 'relative'],
    ['片想い', 'crush'], ['片思い', 'crush'],
    ['友達以上恋人未満', 'almost'], ['友達以上', 'almost'], ['恋人未満', 'almost'], ['いい感じ', 'almost'],
    ['幼なじみ', 'childhood'], ['幼馴染', 'childhood'], ['親友', 'best'], ['知り合い', 'acq'], ['知人', 'acq'],
    ['友人', 'friend'], ['友達', 'friend'], ['兄弟姉妹', 'sibling'], ['兄弟', 'sibling'], ['姉妹', 'sibling'], ['兄妹', 'sibling'], ['姉弟', 'sibling'],
    ['兄弟姉妹（庇護）', 'sibprot'], ['きょうだい（庇護）', 'sibprot'], ['過保護な兄', 'sibprot'], ['過保護な姉', 'sibprot'], ['きょうだい（親友のよう）', 'sibclose'], ['兄弟姉妹（親友のよう）', 'sibclose'], ['仲良しきょうだい', 'sibclose'], ['仲良し兄弟', 'sibclose'], ['不仲', 'bad'], ['仲が悪い', 'bad'], ['険悪', 'bad'], ['反りが合わない', 'bad'], ['そりが合わない', 'bad'],
    ['教師と生徒', 'teacher'], ['教師', 'teacher'], ['先生と生徒', 'teacher'], ['担任', 'teacher'], ['生徒', 'teacher'], ['師弟', 'mentor'], ['師匠', 'mentor'], ['弟子', 'mentor'],
    ['擬似親子', 'pparent'], ['疑似親子', 'pparent'], ['親代わり', 'pparent'], ['育ての親', 'pparent'], ['保護者', 'pparent'], ['後見人', 'pparent'], ['親子', 'parent'], ['父親', 'parent'], ['母親', 'parent'], ['片想い', 'crush'], ['片思い', 'crush'],
    ['ライバル', 'rival'], ['敵対', 'enemy'], ['因縁', 'enemy'], ['宿敵', 'enemy'], ['犬猿', 'enemy'], ['敵', 'enemy'],
    ['歪んだ関係', 'abuse'], ['DV', 'abuse'], ['モラハラ', 'abuse'], ['支配的な恋人', 'abuse'],
    ['元恋人', 'ex'], ['元カレ', 'ex'], ['元カノ', 'ex'], ['元彼', 'ex'], ['元カノ', 'ex'],
    ['運命の番', 'fated'], ['運命', 'fated'], ['番', 'mate'], ['セフレ', 'fwb'], ['本命', 'honmei'], ['恋人', 'lover'], ['夫婦', 'spouse'], ['配偶者', 'spouse'], ['旦那', 'spouse'], ['奥さん', 'spouse'], ['彼氏', 'lover'], ['彼女', 'lover'], ['付き合って', 'lover'],
    ['先輩後輩', 'senpai'], ['先輩', 'senpai'], ['後輩', 'senpai'], ['センパイ', 'senpai'],
    ['バディ', 'buddy'], ['相棒', 'buddy'], ['コンビ', 'buddy'], ['相方', 'buddy'],
    ['同僚', 'colleague'], ['同期', 'colleague'], ['チームメイト', 'colleague'], ['チーム仲間', 'colleague'], ['チーム', 'colleague'], ['仕事仲間', 'colleague'], ['職場', 'colleague'], ['バイト仲間', 'colleague'],
    ['主従', 'master'], ['主人', 'master'], ['従者', 'master'], ['主', 'master'],
    ['の子', 'parent'], ['子ども', 'parent'], ['息子', 'parent'], ['娘', 'parent'], ['の親', 'parent'], ['父', 'parent'], ['母', 'parent'],
    ['兄', 'sibling'], ['弟', 'sibling'], ['姉', 'sibling'], ['妹', 'sibling'], ['友', 'friend'],
    /* 追加の関係（2026-10-25）。「チーム仲間」「仕事仲間」などは上で同僚として先に読む */
    ['無関心', 'apathy'], ['恐怖', 'fear'], ['恐れている', 'fear'], ['許嫁', 'fiance'], ['許婚', 'fiance'], ['いいなずけ', 'fiance'], ['婚約者', 'fiance'], ['仲間', 'comrade']
  ];
  /* 型・度合い・気持ち・様子の付いた言い方（関係の種類と、追加の欄の値）。ALIAS より先に読む */
  var XALIAS = [
    ['執着（依存）', 'yan', { sub: 'dep' }], ['執着(依存)', 'yan', { sub: 'dep' }], ['執着（愛憎）', 'yan', { sub: 'hatelove' }], ['執着(愛憎)', 'yan', { sub: 'hatelove' }],
    ['執着（献身）', 'yan', { sub: 'devote' }], ['執着（束縛）', 'yan', { sub: 'bind' }], ['執着（排除）', 'yan', { sub: 'purge' }],
    ['憎悪', 'enemy', { grade: 'hate' }], ['負い目', 'benefactor', { feel: 'guilt' }], ['推し', 'fond', { mode: 'oshi' }], ['愛人', 'fwb', { mode: 'mistress' }]
  ];

  HK.parseTies = function (text, chars) {
    var out = [], warn = [], groups = [];
    var names = chars.map(function (c) { return { n: c.name, id: c.id }; }).sort(function (a, b) { return b.n.length - a.n.length; });
    /* グループ名（住人の group。カンマ区切りで複数）。「3年A組 同級生」のように書くと、そのグループの全員の組に付ける。
       住人の名前・関係の言葉と同じグループ名は使わない（名前・関係として読む） */
    var gmap = {};
    chars.forEach(function (c) { String(c.group || '').split(/[,，、]/).forEach(function (g) { g = g.trim(); if (g && (gmap[g] = gmap[g] || []).indexOf(c.id) < 0) gmap[g].push(c.id); }); });
    var gnames = Object.keys(gmap).filter(function (g) { return !names.some(function (x) { return x.n === g; }) && !ALIAS.some(function (w) { return w[0] === g; }); }).sort(function (a, b) { return b.length - a.length; });
    var mask = function (s, p, n) { return s.slice(0, p) + Array(n + 1).join('\u0000') + s.slice(p + n); };
    String(text || '').split(/\r?\n/).forEach(function (raw, i) {
      var line = raw.replace(/^\s*(?:[-*・●○]|\d+[.)])\s*/, '').trim();
      if (!line) return;
      var found = [], used = line, gfound = [];
      gnames.forEach(function (g) { var p = used.indexOf(g); if (p >= 0) { gfound.push({ g: g, pos: p }); used = mask(used, p, g.length); } });
      /* 愛憎（敵対・不仲の追加の欄）：「愛憎:双方」「愛憎（名前だけ）」「愛憎：一人目だけ」。「執着（愛憎）」は執着の型（XALIAS）として読む。
         名前より先に読む（「名前だけ」の名前を三人目として数えないように。行のほかの場所に名前がなければ、その名前は住人として残す） */
      var lhW = '', lhName = '', lhWarned = false;
      used = used.replace(/(?<!執着[（(])愛憎\s*[:：]?\s*[（(]?\s*(双方|両方|お互い|互い|一人目だけ|1人目だけ|二人目だけ|2人目だけ|[^\s　（）()]{1,16}?だけ)?\s*[）)]?/, function (x, w, at) {
        lhW = !w || /^(双方|両方|お互い|互い)$/.test(w) ? 'both' : /^(一人目|1人目)だけ$/.test(w) ? 'a' : /^(二人目|2人目)だけ$/.test(w) ? 'b' : 'name';
        if (lhW !== 'name') return Array(x.length + 1).join('\u0000');
        lhName = w.replace(/だけ$/, '');
        var p0 = x.indexOf(w), rest = used.slice(0, at) + used.slice(at + x.length);
        /* 名前がこの行のほかの場所にも書いてあるか、ほかに二人の名前があれば全部伏せる。なければ名前の部分だけ残す（住人として数える） */
        if (rest.indexOf(lhName) >= 0 || names.filter(function (q) { return rest.indexOf(q.n) >= 0; }).length >= 2) return Array(x.length + 1).join('\u0000');
        return Array(p0 + 1).join('\u0000') + lhName + Array(x.length - p0 - lhName.length + 1).join('\u0000');
      });
      /* きょうだいの上下（追加の欄 elder）：「上下:名前」「上下：名前が上」「上下（一人目）」「上下なし」。愛憎と同じく、名前より先に読む */
      var elW = '', elName = '', elWarned = false;
      used = used.replace(/上下\s*[:：]?\s*[（(]?\s*(なし|無し|対等|自動|年齢|一人目|1人目|二人目|2人目|[^\s　（）()]{1,18})?(\s*[）)])?/, function (x, w, cl, at) {
        var fixed = { 'なし': 'none', '無し': 'none', '対等': 'none', '自動': 'auto', '年齢': 'auto', '一人目': 'a', '1人目': 'a', '二人目': 'b', '2人目': 'b' };
        if (!w || fixed[w]) { elW = w ? fixed[w] : 'auto'; return Array(x.length + 1).join('\u0000'); }
        /* 名前：登録済みの名前で始まるなら、その名前（と「が上」）までを読む（「上下:美咲が上」「上下:美咲」） */
        var hit = names.filter(function (q) { return w.indexOf(q.n) === 0; })[0], nm = hit ? hit.n : w.replace(/が上$/, '');
        var p0 = x.indexOf(w), end = p0 + nm.length + (x.substr(p0 + nm.length, 2) === 'が上' ? 2 : 0);
        elW = 'name'; elName = nm;
        var head = x.slice(0, end), tail = x.slice(end);
        var rest = used.slice(0, at) + used.slice(at + head.length);
        var keep = !(rest.indexOf(nm) >= 0 || names.filter(function (q) { return rest.indexOf(q.n) >= 0; }).length >= 2);
        return (keep ? Array(p0 + 1).join('\u0000') + nm + Array(head.length - p0 - nm.length + 1).join('\u0000') : Array(head.length + 1).join('\u0000')) + tail;
      });
      names.forEach(function (x) {
        var p = used.indexOf(x.n);
        if (p >= 0 && found.every(function (f) { return f.id !== x.id; })) {
          found.push({ id: x.id, pos: p });
          used = used.slice(0, p) + Array(x.n.length + 1).join('\u0000') + used.slice(p + x.n.length);
        }
      });
      /* グループの人は、グループ名を書いた位置に並べる（名前でも書いた人は、名前の位置のまま） */
      gfound.forEach(function (g) { gmap[g.g].forEach(function (id, j) { if (found.every(function (f) { return f.id !== id; })) found.push({ id: id, pos: g.pos + j / 1000, grp: g.g }); }); });
      found.sort(function (a, b) { return a.pos - b.pos; });
      /* 「セフレで片想い」のように、一行に複数の関係を書いてもよい */
      var cold = '', back = '', obc = '';
      [[/共依存/, 'mutual'], [/困惑|戸惑って|戸惑い|拒めない/, 'confused'], [/受け入れて|受け入れ/, 'accept'], [/怖がって|怯えて|怖がる/, 'afraid'], [/嫌って|嫌がって/, 'hate']].forEach(function (w) { if (!obc && /ヤンデレ|執着/.test(used) && w[0].test(used)) { obc = w[1]; used = used.replace(w[0], function (x) { return Array(x.length + 1).join('\u0000'); }); } });
      HATE_WORDS.forEach(function (w) { var m = used.match(w[0]); if (m) { if (!back) back = w[1]; used = used.replace(w[0], function (x) { return Array(x.length + 1).join('\u0000'); }); } });
      COLD_WORDS.forEach(function (w) { var m = used.match(w[0]); if (m) { if (!cold) cold = w[1]; used = used.replace(w[0], function (x) { return Array(x.length + 1).join('\u0000'); }); } });
      var types = [], xtra = {};
      XALIAS.forEach(function (w) { var p1 = used.indexOf(w[0]); if (p1 < 0) return; if (types.indexOf(w[1]) < 0) types.push(w[1]); xtra[w[1]] = xtra[w[1]] || {}; for (var xk in w[2]) xtra[w[1]][xk] = w[2][xk]; used = mask(used, p1, w[0].length); });
      for (var k = 0; k < ALIAS.length; k++) {
        var p0 = used.indexOf(ALIAS[k][0]);
        if (p0 < 0) continue;
        if (types.indexOf(ALIAS[k][1]) < 0) types.push(ALIAS[k][1]);
        used = used.slice(0, p0) + Array(ALIAS[k][0].length + 1).join('\u0000') + used.slice(p0 + ALIAS[k][0].length);
        k--;
      }
      /* 「両片想い」だけ書いたら、片想い（想われる側：実は想っている） */
      if (cold === 'mutual' && types.indexOf('crush') < 0) types.unshift('crush');
      /* 「愛憎」だけ書いたら、敵対（愛憎）として読む */
      if (lhW && types.indexOf('enemy') < 0 && types.indexOf('bad') < 0) types.unshift('enemy');
      /* 「上下」だけ書いたら、兄弟姉妹として読む */
      if (elW && !types.length) types.unshift('sibling');
      if (elW && elW !== 'auto' && types.length && !types.some(function (x) { return /^(sibling|sibclose|sibbad|stepsib)$/.test(x); })) warn.push((i + 1) + '行目の「上下」は、兄弟姉妹・兄弟（親友のよう）・兄弟（不仲）・義理のきょうだいにだけ付けられます（兄弟（庇護）は向きで上下が決まります）');
      /* 「兄弟で不仲」のように二つ書いたら、きょうだい（不仲）にまとめる */
      if (types.indexOf('bad') >= 0 && types.indexOf('sibling') >= 0) types = types.filter(function (x) { return x !== 'bad'; }).map(function (x) { return x === 'sibling' ? 'sibbad' : x; });
      /* 「仲間」はグループに付ける（住人の一覧のグループの「仲間」を入れるのと同じ）。名前だけの行には付けない */
      if (types.indexOf('comrade') >= 0) {
        types = types.filter(function (x) { return x !== 'comrade'; });
        if (gfound.length) gfound.forEach(function (g) { if (groups.indexOf(g.g) < 0) groups.push(g.g); });
        else warn.push((i + 1) + '行目の「仲間」は、グループ名と一緒に書いてください（例：「3年A組 仲間」）。住人の一覧のグループの札の「仲間」でも入れられます');
        if (!types.length) return;
      }
      var type = types[0] || null;
      /* 空白で区切った語のうち、名前・グループ・関係のどれにも当たらなかったもの（知らない名前・書き間違いなど） */
      var unk = [], uw = used.split(/[\s\u3000,，、・\/]+/), ow = line.split(/[\s\u3000,，、・\/]+/);
      if (uw.length === ow.length) uw.forEach(function (w, j) { var r = w.replace(/[→←⇔↔\-－ー―~〜×&＆+＋:：（）()「」。！!？?とはのがでをにもや]/g, ''); if (r && w.indexOf('\u0000') < 0 && ow[j].length === w.length) unk.push(ow[j]); });
      var unkTxt = unk.length ? '「' + unk.slice(0, 3).join('」「') + '」' + (unk.length > 3 ? 'など' : '') : '';
      if (found.length < 2 || !type) {
        warn.push((i + 1) + '行目「' + raw.trim().slice(0, 24) + '」は' + (found.length < 2 ? (gfound.length ? 'グループ「' + gfound[0].g + '」の住人が二人そろいませんでした' : '登録済みの名前が二つ見つかりませんでした') + (unkTxt ? '（' + unkTxt + 'は登録済みの名前・グループにありません）' : '') : '関係の種類が分かりませんでした' + (unkTxt ? '（' + unkTxt + 'を関係の名前として読めませんでした）' : '')));
        return;
      }
      if (unkTxt) warn.push((i + 1) + '行目の' + unkTxt + 'は登録済みの名前・グループにないので、ほかの人どうしにだけ付けました');
      /* 3人以上（グループを含む）：向きのない関係は全員の組、向きのある関係（上司と部下・師弟・片想いなど）は「最初の人→残りの全員」 */
      var ids = found.map(function (f) { return f.id; });
      types.forEach(function (ty) {
        if (T[ty].dir && found[0].grp) { warn.push((i + 1) + '行目の「' + T[ty].label + '」は向きのある関係なので、最初に' + T[ty].roleA + 'の名前を書いてください（例：「名前 ' + found[0].grp + ' ' + T[ty].label + '」）'); return; }
        var prs = [];
        if (T[ty].dir) for (var j = 1; j < ids.length; j++) prs.push([ids[0], ids[j]]);
        else for (var p = 0; p < ids.length; p++) for (var q = p + 1; q < ids.length; q++) prs.push([ids[p], ids[q]]);
        prs.forEach(function (pr) {
          var a = pr[0], b = pr[1];
          /* 「BはAの親」「子」などの言い回しで向きを反転 */
          if (T[ty].dir && /の(子|子ども|息子|娘|従者|部下|後輩|生徒|弟子|弟|妹)|←/.test(line)) { var t = a; a = b; b = t; }
          var nt = { a: a, b: b, type: ty };
          if (ty === 'crush' && cold) nt.cold = cold;
          if ((ty === 'bad' || ty === 'enemy') && back) nt.cold = back;
          if (ty === 'yan' && obc) nt.cold = obc;
          if (xtra[ty]) for (var xf in xtra[ty]) nt[xf] = xtra[ty][xf];
          if (lhW && (ty === 'enemy' || ty === 'bad')) {
            var lhId = lhW;
            if (lhW === 'name') { var nmA = (names.filter(function (x) { return x.id === a; })[0] || {}).n, nmB = (names.filter(function (x) { return x.id === b; })[0] || {}).n; lhId = lhName && lhName === nmA ? 'a' : lhName && lhName === nmB ? 'b' : ''; if (!lhId && !lhWarned) { lhWarned = true; warn.push((i + 1) + '行目の「' + lhName + 'だけ」は、この行の二人の名前ではないので、愛憎は付けませんでした'); } }
            if (lhId) nt.lh = lhId;
          }
          if (elW && elW !== 'auto' && /^(sibling|sibclose|sibbad|stepsib)$/.test(ty)) {
            var elId = elW;
            if (elW === 'name') { var enA = (names.filter(function (x) { return x.id === a; })[0] || {}).n, enB = (names.filter(function (x) { return x.id === b; })[0] || {}).n; elId = elName === enA ? 'a' : elName === enB ? 'b' : ''; if (!elId && !elWarned && !found.some(function (f) { return (names.filter(function (x) { return x.id === f.id; })[0] || {}).n === elName; })) { elWarned = true; warn.push((i + 1) + '行目の「上下:' + elName + '」は、この行の住人の名前ではないので、上下は自動（年齢）のままにしました'); } }
            if (elId) nt.elder = elId;
          }
          out.push(nt);
        });
      });
    });
    return { ties: out, warnings: warn, groups: groups };
  };

  /* who（省略可）：番号か id → 住人 の関数。きょうだいなら名前に続柄を添える（「美咲（姉）→ 健（弟）：兄弟（庇護）」。sib-word.js） */
  HK.tieText = function (tie, nameOf, who) {
    var D = T[tie.type];
    if (!D) return '';
    if (who && HK.Sib && HK.Sib.uiRole && (HK.Sib.isSibTie(tie) || tie.type === 'stepsib')) {
      var A0 = who(tie.a), B0 = who(tie.b), ra = HK.Sib.uiRole(tie, A0, B0, 'a'), rb = HK.Sib.uiRole(tie, A0, B0, 'b'), nf = nameOf;
      if (ra || rb) nameOf = function (id) { var r = id === tie.a ? ra : id === tie.b ? rb : ''; return nf(id) + (r ? '（' + r + '）' : ''); };
      if (D.dir && (ra || rb)) return nameOf(tie.a) + '→ ' + nameOf(tie.b) + '：' + D.label;
    }
    var CO = HK.coldOpts(tie.type);
    /* 追加の欄（型・度合い・気持ち・様子）の短い名前 */
    var xs = HK.tieExtra(tie.type).map(function (x) { var v = tie[x.f] || (tie.type === 'fiance' ? 'eager' : ''), m = x.map[v]; return m && m.short ? (x.who ? nameOf(x.who === 'a' ? tie.a : tie.b) + '：' : '') + HK.tieExtraShort(x, v, nameOf(tie.a), nameOf(tie.b)) : ''; }).filter(Boolean).join('・');
    if (D.dir) return nameOf(tie.a) + '（' + D.roleA + '）→ ' + nameOf(tie.b) + '（' + D.roleB + '）：' + D.label + (CO && tie.cold && CO.map[tie.cold] && CO.map[tie.cold].short ? '（' + CO.map[tie.cold].short + '）' : '') + (xs ? '（' + xs + '）' : '');
    return nameOf(tie.a) + ' × ' + nameOf(tie.b) + '：' + D.label + (xs ? '（' + xs + '）' : '');
  };

  /* ---------- エンジンへの適用 ----------
     同じ二人に複数の関係（セフレ＋片想い など）を重ねられる。
     get() は代表の関係（PRIO の先頭に近いもの）を返し、has() で個々の関係を調べる */
  var PRIO = ['mate', 'fated', 'abuse', 'lover', 'fiance', 'parent', 'pparent', 'sibprot', 'sibling', 'sibclose', 'sibbad', 'relative', 'master', 'worship', 'mentor', 'teacher', 'benefactor', 'boss', 'fwb', 'ex', 'crush', 'yan', 'almost', 'best', 'buddy', 'childhood', 'rival', 'enemy', 'bad', 'senpai', 'colleague', 'classmate', 'friend', 'acq', 'honmei', 'noobs'];
  PRIO.splice(PRIO.indexOf('worship') + 1, 0, 'blind', 'fond');
  PRIO.splice(PRIO.indexOf('crush'), 0, 'fear');
  PRIO.splice(PRIO.indexOf('bad') + 1, 0, 'apathy');
  PRIO.push('comrade');
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
  /* 関係の表示名（夫婦・元夫婦・義理のきょうだいは、開いたあとの関係ではなく元の名前で） */
  /* きょうだいの関係は、二人の性別・年齢で「姉弟」「兄妹（庇護）」「義理の姉妹」のように言い換える（sib-word.js。分からなければ元の名前）。
     who：住人の配列か 番号→住人 の関数（省略時は関係を当てたときに覚えた名前か、回している箱庭の入力） */
  HK.tieLabel = function (t, who) {
    if (!t) return '';
    if (t.spouse) return t.type === 'ex' ? '元夫婦' : t.married && HK.MARRIED_COLD[t.married] ? HK.MARRIED_COLD[t.married].short === '円満' ? '夫婦' : HK.MARRIED_COLD[t.married].short : '夫婦';
    var sl = HK.Sib && HK.Sib.labelOf ? HK.Sib.labelOf(t, who) : '';
    if (sl) return sl;
    if (t.step) return '義理の兄弟';
    var D = T[t.type]; return D ? D.label : t.type;
  };
  HK.tieNoLove = function (t) { var D = t && T[t.type]; return !!(D && D.family && !D.loveOK && t.love !== 'ok'); };
  HK.tieFamLove = function (t) { var D = t && T[t.type]; return !!(D && D.family && !D.loveOK && t.love === 'ok'); };
  /* 恋愛に発展するかを選べる関係（執着（信仰）など。loveOpt）：「発展しない」なら、この二人のあいだでは惹かれが育たず、恋愛の出来事も起きにくい */
  HK.tieLoveOpt = function (t) { var D = t && T[t.type]; return !!(D && D.loveOpt); };
  HK.tieOptNoLove = function (t) { return HK.tieLoveOpt(t) && t.love !== 'ok'; };
  HK.Ties = {
    /* 片想いの「両片想い」を、向きを逆にした片想い二本に開く（どちらも mutual: true）。箱庭に渡す前に一度だけ */
    expand: function (ties) {
      var out = [];
      (ties || []).forEach(function (t) {
        /* 夫婦・義理のきょうだいは、既存の関係（恋人・元恋人・親族）に印をつけて開く。恋人・親族の場面がすべてそのまま効く */
        if (t && t.type === 'spouse') { var sp = {}; for (var k3 in t) sp[k3] = t[k3]; sp.type = t.cold === 'divorced' ? 'ex' : 'lover'; sp.spouse = true; sp.married = t.cold || ''; delete sp.cold; out.push(sp); return; }
        if (t && t.type === 'stepsib') { var st = {}; for (var k4 in t) st[k4] = t[k4]; st.type = 'relative'; st.step = true; out.push(st); return; }
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
      (HK.fearTies(ties) || []).forEach(function (t) {
        var A = ctx.chars[t.a], B = ctx.chars[t.b], D = T[t.type];
        if (!A || !B || A === B || !D) return;
        /* 恋愛・R18にしない組（HK.ngPair）には、恋愛の関係（恋人・セフレ・片想いなど）を当てない。
           ただし「恋愛相手の固定」だけが理由の組（相手が別の人に決めている）では、片想い・執着のような一方通行の想いは残す（叶わない恋として。heartbreak.js） */
        var mk0 = (A.ng && A.ng.indexOf(B.i) >= 0) || (B.ng && B.ng.indexOf(A.i) >= 0);
        /* 恋愛相手の固定だけが食い違い、体の関係は許されている組（engine.js の HK.lockSexOnly）は、セフレの関係を残す */
        var sexOk0 = !mk0 && HK.lockSexOnly && HK.lockSexOnly(A, B);
        if (HK.ngPair && HK.ngPair(A, B) && (mk0 ? /^(lover|fwb|mate|fated|crush|almost|ex|yan|abuse|honmei)$/ : sexOk0 ? /^(lover|mate|fated|almost|ex|abuse|honmei)$/ : /^(lover|fwb|mate|fated|almost|ex|abuse|honmei)$/).test(t.type)) return;
        /* 体の関係にならない組（性行為の相手の固定「恋人だけ」「特定の人だけ」・R18に参加しない：HK.sexBlocked）には、セフレの関係を当てない */
        if (t.type === 'fwb' && HK.sexBlocked && HK.sexBlocked(A, B)) return;
        if (HK.ngPair && HK.ngPair(A, B) && /^(crush|yan)$/.test(t.type)) {
          /* 想う側（A）が別の人に恋愛相手を固定しているなら、その想いは使わない（固定した人は、ほかの人を想わない） */
          if (HK.lockOut(A, B)) return;
          /* 想われる側（B）が別の人に固定しているなら、一方通行のまま（両片想い・共依存・受け入れている、にはしない） */
          if (t.cold === 'mutual' || t.cold === 'accept') { var t2 = {}; for (var k0 in t) t2[k0] = t[k0]; delete t2.cold; t = t2; }
        }
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
        var WB = t.type === 'worship' && t.cold && HK.WORSHIP_BACK ? HK.WORSHIP_BACK[t.cold] : null;
        if (WB && WB.ba) add(ba, WB.ba);
        var p = ctx.pair(A, B);
        /* 信仰される側が相手を支配している */
        if (WB && WB.dominate) p.dominate = B.i;
        if (D.chem != null) p.chem = HK.clamp(p.chem * (HK.tieFamLove(t) ? 1 : D.chem) + (D.chem > 1 ? 0.2 : 0), 0.01, 2);
        if (D.fric != null && !HB) p.fric = HK.clamp(p.fric * D.fric, 0.2, 2);
        if (D.couple) p.couple = true;
        /* 血のつながった家族（きょうだい・親子）：恋愛には絶対にならず、喧嘩しても信頼は崩れにくい */
        if (HK.tieNoLove(t)) p.kin = true;
        if (D.family && !D.loveOK) p.trustFloor = Math.max(p.trustFloor || 0, t.type === 'sibbad' ? 15 : 30);
        if (D.night && ctx.scen.id !== 'classroom') p.night = true;
        /* 恋愛に発展しない信仰：最初の惹かれも低く抑える */
        if (D.loveOpt && t.love !== 'ok') { ab.att = Math.min(ab.att, 8); ba.att = Math.min(ba.att, 8); }
        /* 冷えた・別居中の夫婦：惹かれと信頼を下げ、険悪さを上げる（どちらから見ても） */
        /* 本命：想う人に本命の印（engine.js の HK.honmeiFactor） */
        if (t.type === 'honmei') A.honmei = B.i;
        var MC = t.spouse && t.married && HK.MARRIED_COLD[t.married] && HK.MARRIED_COLD[t.married].mod;
        if (MC) { add(ab, MC); add(ba, MC); p.fric = HK.clamp((p.fric || 1) * 1.4, 0.2, 2); }
        /* 熟年夫婦：穏やかで、ぶつかりにくい */
        if (MC && HK.MARRIED_COLD[t.married].calm) p.fric = HK.clamp(p.fric / 1.4 * 0.75, 0.2, 2);
        var AB = t.type === 'abuse' && HK.ABUSE_BACK ? HK.ABUSE_BACK[t.cold || ''] : null;
        if (AB && AB.ba) add(ba, AB.ba);
        /* 関係の段階（師弟・主従・上司と部下・教師と生徒の仲：良好／ふつう／険悪。tie-stage.js の場面と試練が使う） */
        var GR = /^(mentor|master|boss|teacher)$/.test(t.type) && t.cold && HK.TIE_GRADE ? HK.TIE_GRADE[t.cold] : null;
        if (GR && GR.ab) { add(ab, GR.ab); add(ba, GR.ba || GR.ab); }
        /* 追加の欄（2026-10-25）：憎悪・負い目・許嫁のそれぞれの気持ち */
        var xf = {};
        HK.tieExtra(t.type).forEach(function (x) { var v = t[x.f]; if (v && x.map[v]) xf[x.f] = v; });
        if (t.type === 'fiance') {
          xf.feel = xf.feel || 'eager'; xf.feelB = xf.feelB || 'eager'; add(ab, HK.FIANCE_FEEL[xf.feel].ab); add(ba, HK.FIANCE_FEEL[xf.feelB].ab);
          /* 恋愛対象・受け攻めが合わない許嫁は、家どうしの約束だけ（最初の惹かれも低く抑える） */
          if (!HK.Ties.fiLoveOk(A, B)) { ab.att = Math.min(ab.att, 8); ba.att = Math.min(ba.att, 8); }
        }
        if (t.type === 'enemy' && xf.grade === 'hate') add(ab, HK.ENEMY_GRADE.hate.ab);
        /* 愛憎：持つ側は、嫌いながらも惹かれている（惹かれを少し足す。恋愛対象・受け攻めの合わない相手には、engine.js の mod で惹かれが育たない） */
        if (xf.lh === 'a' || xf.lh === 'both') add(ab, { att: HK.canLove(A, B) ? 18 : 0, ten: 4 });
        if (xf.lh === 'b' || xf.lh === 'both') add(ba, { att: HK.canLove(B, A) ? 18 : 0, ten: 4 });
        if (t.type === 'benefactor' && xf.feel === 'guilt') add(ba, HK.BENE_FEEL.guilt.ba);
        var o = { type: t.type, like: D.like || '', a: A.i, b: B.i, cold: CD || HB || OB || WB || AB || GR ? t.cold || '' : '', love: HK.tieFamLove(t) || (D.loveOpt && t.love === 'ok') ? 'ok' : '', mutual: !!t.mutual, spouse: !!t.spouse, married: t.married || '', step: !!t.step };
        /* 追加の欄は、ある関係だけに付ける（ほかの関係の中身は今までと同じ） */
        if (t.type === 'yan') o.sub = xf.sub || '';
        if (t.type === 'enemy') o.grade = xf.grade || '';
        /* きょうだいの上下の欄（義理のきょうだいは親族＋step に開いているので、元の t の値を見る） */
        if (/^(sibling|sibclose|sibbad)$/.test(t.type) || (t.type === 'relative' && t.step)) { var el0 = t.elder; if (el0 && HK.SIB_ELDER[el0]) o.elder = el0; }
        /* きょうだい：二人の性別・年齢から決めた関係名（「姉弟（庇護）」など。sib-word.js）を覚えておく（HK.tieLabel が使う） */
        if (HK.Sib && HK.Sib.isSibTie(o)) o.sibLab = HK.Sib.tieLabel(o, A, B) || '';
        if (t.type === 'enemy' || t.type === 'bad') o.lh = xf.lh || '';
        if (t.type === 'benefactor') o.feel = xf.feel || 'thanks';
        if (t.type === 'fond') o.mode = xf.mode || 'adore';
        if (t.type === 'fwb') o.mode = xf.mode || 'equal';
        if (t.type === 'fiance') {
          o.feel = xf.feel; o.feelB = xf.feelB;
          /* 両方が乗り気で、恋愛対象と受け攻めが合う組だけ恋人と同じ扱い（R18に参加しない人も恋人にはなれるので、受け攻めは noR18 を外して見る） */
          var nr = function (c) { var x = {}; for (var kk in c) x[kk] = c[kk]; x.noR18 = false; return x; };
          if (o.feel === 'eager' && o.feelB === 'eager' && HK.canLove && HK.canLove(A, B) && HK.canLove(B, A) && (!HK.Pos || HK.Pos.okSex(nr(A), nr(B)))) { p.couple = true; o.couple = true; }
        }
        list.push(o);
        list.sort(function (x, y) { return PRIO.indexOf(x.type) - PRIO.indexOf(y.type); });
        ctx.ties[k] = list[0];
        p.tie = list[0];
        list[0].also = list.slice(1).map(function (x) { return x.type; });
      });
      HK.Ties.after(ctx);
    },
    /* 関係をすべて当てたあとの印：無関心・恐怖の二人は互いの noLove に入れる（恋愛・夜の判定のすべてが偽になる）。
       無関心は ctx._apathy（a→b）、恐怖は ctx._fear（a→b）に覚える（engine.js の凍結・避ける重み・出来事の門）。許嫁の恋人扱いは外す */
    after: function (ctx) {
      Object.keys(ctx.tiesAll || {}).forEach(function (k) {
        ctx.tiesAll[k].forEach(function (t) {
          if (t.type !== 'apathy' && t.type !== 'fear') return;
          var A = ctx.chars[t.a], B = ctx.chars[t.b];
          [[A, B], [B, A]].forEach(function (q) { var l = q[0].noLove = q[0].noLove || []; if (l.indexOf(q[1].i) < 0) l.push(q[1].i); });
          var m = t.type === 'apathy' ? (ctx._apathy = ctx._apathy || {}) : (ctx._fear = ctx._fear || {});
          m[t.a + '>' + t.b] = 1;
          /* 恋人・セフレなどを重ねていても、無関心・恐怖のほうを優先する（恋人の扱い・夜の印を外す） */
          var p = ctx.pair(A, B);
          p.couple = false; p.night = false;
          var fi = HK.Ties.has(ctx, A, B, 'fiance'); if (fi) fi.couple = false;
        });
      });
    },
    /* 無関心の凍結：a→b の値を覚える（engine.js が初期の関係を整えたあとに呼ぶ）／覚えた値に戻す（区切りの終わりと結果の前） */
    freezeInit: function (ctx) {
      if (!ctx._apathy) return;
      ctx._frz = {};
      Object.keys(ctx._apathy).forEach(function (k) { var ij = k.split('>'), r = ctx.rel[+ij[0]][+ij[1]]; if (r) ctx._frz[k] = { aff: r.aff, trust: r.trust, ten: r.ten, att: r.att }; });
    },
    refreeze: function (ctx) {
      if (!ctx._frz) return;
      Object.keys(ctx._frz).forEach(function (k) { var ij = k.split('>'), r = ctx.rel[+ij[0]][+ij[1]], v = ctx._frz[k]; if (r) { r.aff = v.aff; r.trust = v.trust; r.ten = v.ten; r.att = v.att; } });
    },
    /* a が b に無関心か／a が b を恐れているか（向きを見る） */
    apathy: function (ctx, a, b) { return !!(ctx && ctx._apathy && a && b && ctx._apathy[a.i + '>' + b.i]); },
    /* 無関心な a が b との出来事に入らないもの（恋愛・助け合い・嫉妬・心配・慰め・夜） */
    apathyBlock: function (ctx, a, b, e) {
      if (!HK.Ties.apathy(ctx, a, b) || !e) return false;
      return e.cat === 'romance' || e.cat === 'help' || /jeal|envy|worry|care|comfort|grief|mourn|obsess|^ob_|night|sex|kiss|date|confess/i.test(e.id || '') || /嫉妬|心配/.test(e.why || '');
    },
    fears: function (ctx, a, b) { return !!(ctx && ctx._fear && a && b && ctx._fear[a.i + '>' + b.i]); },
    /* 許嫁の a の側の気持ち（eager／unsure／refuse。許嫁でなければ ''） */
    fianceFeel: function (ctx, a, b) { var t = HK.Ties.has(ctx, a, b, 'fiance'); return t ? (t.a === a.i ? t.feel : t.feelB) || 'eager' : ''; },
    /* 許嫁の二人が恋に進んでよい組か（恋愛対象が両方向で合い、受け攻めが決まる。R18に参加しない人も恋人にはなれるので noR18 は外して見る）。
       合わない許嫁は、家どうしの約束として向き合うだけ（惹かれは育たず、恋愛の出来事はほとんど起きない） */
    fiLoveOk: function (a, b) {
      if (!a || !b || !HK.canLove || !HK.canLove(a, b) || !HK.canLove(b, a)) return false;
      if (!HK.Pos) return true;
      var x = {}, y = {}, k; for (k in a) x[k] = a[k]; for (k in b) y[k] = b[k]; x.noR18 = false; y.noR18 = false;
      return HK.Pos.okSex(x, y);
    },
    /* 二人が同じ「仲間」のグループか */
    comrade: function (ctx, a, b) { return !!HK.Ties.has(ctx, a, b, 'comrade'); },
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
        /* 負い目：恩を受けた側は逆らえず、頼みを断れない */
        if (t.type === 'benefactor' && t.feel === 'guilt' && t.a !== a.i) m = HK.BENE_FEEL.guilt.biasB;
        /* 許嫁：それぞれの気持ちで恋愛の出来事の起こりやすさが変わる */
        if (t.type === 'fiance' && cat === 'romance') { var fe = HK.FIANCE_FEEL[(t.a === a.i ? t.feel : t.feelB) || 'eager']; if (fe) r *= fe.rom; if (!HK.Ties.fiLoveOk(a, b)) r *= 0.02; }
        if (m[cat] != null) r *= cat === 'romance' && HK.tieFamLove(t) ? Math.max(m[cat], 1) : m[cat];
        if (cat === 'romance' && HK.tieOptNoLove(t)) r *= 0.1;
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
        if (m != null) r *= f === 'att' && HK.tieFamLove(t) ? Math.max(m, 1) : m;
        if (f === 'att' && HK.tieOptNoLove(t)) r *= 0.05;
        /* 愛憎を持つ側：嫌っていても、惹かれは育つ（敵対の惹かれにくさを打ち消す。持たない側は今までどおり） */
        if (f === 'att' && t.lh && (t.lh === 'both' || (t.lh === 'a') === (t.a === a.i))) r *= D.mods && D.mods.att ? 1.6 / D.mods.att : 1.6;
        /* 向きのある伸びの倍率（恐怖：恐れる側の好意・信頼は育ちにくい） */
        if (D.dir && (D.modsA || D.modsB)) { var dm = t.a === a.i ? D.modsA : D.modsB; if (dm && dm[f] != null) r *= dm[f]; }
        /* 許嫁：それぞれの気持ちで惹かれの育ち方が変わる */
        if (t.type === 'fiance' && f === 'att') { var fe = HK.FIANCE_FEEL[(t.a === a.i ? t.feel : t.feelB) || 'eager']; if (fe) r *= fe.att; if (!HK.Ties.fiLoveOk(a, b)) r *= 0.1; }
      });
      return r;
    },
    /* 減る方向の倍率（揺らぎにくい想い：信仰する側・恩を受けた側の好意と信頼）。1 より小さいほど減りにくい */
    stiff: function (ctx, a, b, f) {
      var r = 1;
      HK.Ties.all(ctx, a, b).forEach(function (t) {
        var D = T[t.type], m = D.dir ? (t.a === a.i ? D.stiffA : D.stiffB) : D.stiff;
        if (m && m[f] != null) r *= m[f];
      });
      return r;
    },
    /* 下限（信仰する側の好意・信頼は、ここより下がらない） */
    floor: function (ctx, a, b, f) {
      var v = null;
      HK.Ties.all(ctx, a, b).forEach(function (t) {
        var D = T[t.type], m = D.dir ? (t.a === a.i ? D.floorA : D.floorB) : D.floor;
        if (m && m[f] != null) v = Math.max(v == null ? -100 : v, m[f]);
      });
      return v;
    },
    /* 執着（信仰）：a が b を信仰しているか（その関係を返す） */
    worship: function (ctx, a, b) { var t = HK.Ties.from(ctx, a, b, 'worship'); return t || null; },
    pull: function (ctx, a, b) {
      var v = 0;
      HK.Ties.all(ctx, a, b).forEach(function (t) { v = Math.max(v, T[t.type].pull || 1); });
      return v;
    },
    /* 「守りたい相手」の候補（恋人・親子・親友・主従・片想いなど） */
    focusFor: function (ctx, a) {
      var best = null, bv = 0, PRI = { lover: 5, parent: 5, pparent: 5, sibprot: 5, crush: 4, best: 4, master: 4, mentor: 3, almost: 3, sibling: 3, sibclose: 3, teacher: 2, childhood: 2, fwb: 2, friend: 1, colleague: 1, buddy: 4, senpai: 2, fiance: 3, comrade: 1 };
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
      /* きょうだいは「美咲は健の姉（姉弟（庇護））」のように、二人の性別・年齢で（sib-word.js） */
      if (HK.Sib && HK.Sib.isSibTie(t)) { var sl = HK.tieLabel(t) || D.label, up = D.dir ? HK.Sib.rel(B, A, { tie: t }) : ''; return D.dir ? A.name + 'は' + B.name + 'の' + (up && up !== 'きょうだい' ? up : D.roleA) + '（' + sl + '）' : sl; }
      return D.dir ? A.name + 'は' + B.name + 'の' + D.roleA + '（' + D.label + '）' : D.label;
    }
  };
})();
