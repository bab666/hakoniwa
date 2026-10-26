/* 箱庭シミュレーター: 吹雪の館の殺人（R18版のみ）― 犯人が媚薬を盛って、事件をうやむやにする
   ・「夜の出来事（R18）」の設定で頻度が変わる（0なら起きない）。1回のゲームで2回まで
   ・盛り方は10通り（ワイン・ホットワイン・強い酒・お香・大浴場・菓子・暖房・紅茶・マッサージオイル・停電と香水）
   ・その夜に起きることも10通り（恋人どうし・敵どうし・片想いの暴走・探偵とバディ・探偵への誘惑・
     手がかりを持つ人の口封じ・館の使用人・乱交・一人で悶える・正気の人が現場を守る）
   ・翌朝、現場が荒らされて手がかりが失われ、酒の残った人の捜査は鈍る
   全年齢版ではこのファイルは読み込まれず、全年齢モードでも使わない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, Y = HK.YAKATA, ST = HK.Story, scen = HK.SCENARIOS && HK.SCENARIOS.yakata;
  if (!Y || !scen || !ST) return;
  function L(s) { return s.split('|'); }
  /* 一回の結果の中で同じ文を繰り返さない選び方（ero-kit.js の HK.Ero.fresh。使い切ったら、いちばん前に使ったものから戻す） */
  function fp(S, a) { return HK.Ero && HK.Ero.fresh ? HK.Ero.fresh(S, a, function (l) { return ST.pick(S, l); }) : ST.pick(S, a); }
  function F(t, m) { return ST.fmt(t, m); }
  /* 描写はシチュエーションごとに約10通り（solo-yakata-r18-text.js の文を足す） */
  /* 交わりの描写（体位・口調ごとの喘ぎ）：solo-r18-moan.js */
  /* 受け攻めの決まり（pos.js）：住人どうしは向きの決まる組（HK.Pos.okSex）だけ、{x}=HK.Pos.order の先頭。
     自分で攻めを選んだ人は、使用人・犯人の凌辱などで「される」側にしない。女性どうしは Y.R18T.ff の文と HK.FF で */
  function okP(a, b) { return !HK.Pos || HK.Pos.okSex(a, b); }
  function hardTop(p) { return !!(HK.Pos && HK.Pos.hardTop(p)); }
  function isFF(a, b) { return !!(HK.Pos && HK.Pos.ff(a, b)); }
  /* 主導する側が女性・相手が男性（指定の有無を問わず）：導入の文の「入れる」書き方を、跨る書き方に直す（合意の場面だけ） */
  function fmFix(S, t, x, y) {
    var g = function (c) { return c.gender || (c.src && c.src.gender); };
    return HK.FM && HK.FM.fixWith && g(x) === 'f' && g(y) === 'm' ? HK.FM.fixWith({ pick: function (a) { return fp(S, a); } }, t, x, y.name) : t;
  }
  function od2(a, b) { return HK.Pos ? HK.Pos.order(a, b, [a, b]) : [a, b]; }
  function SX(S, x, y, mood, short, allow) {
    var R = HK.R18M;
    /* 描写の作風「男性向け」（story-lewd.js）。合意のない場面はこの関数を通らない */
    if (HK.Lewd && HK.Lewd.storyEro && HK.Lewd.storyEro(S)) return HK.Lewd.storyEroSex(S, x, y);
    /* 性器なしの人がいる組（pos-nogen.js）：口まで／指と玩具だけ */
    if (HK.NoGen && HK.NoGen.on(x, y)) { S.r18Last = ''; return HK.NoGen.text(S, x, y, { short: short }); }
    if (isFF(x, y) && HK.FF) {
      /* 山場を段落に分けて厚く（r18-thick.js） */
      if (HK.R18Thick && HK.R18Thick.on(S)) return HK.R18Thick.ff(S, x, y, { mood: mood, short: short, fore: false, tools: S.drugTools });
      var ctx = { pick: function (a) { return fp(S, a); } }, st = mood === 'rough' ? 'rough' : mood === 'love' ? 'gentle' : HK.FF.styleOf(x);
      var f = function (t) { return t.replace(/\{a\}/g, x.name).replace(/\{b\}/g, y.name); };
      S.r18Last = '';
      return f(HK.FF.pick(ctx, 'body', st, { tools: S.drugTools })) + (R ? R.say(S, y, 'start') + (short ? '' : R.say(S, x, 'top') + R.say(S, y, 'mid')) + R.say(S, y, 'climax') : '') + f(HK.FF.pick(ctx, 'climax', st));
    }
    return R ? R.sex(S, x, y, { mood: mood, fore: false, short: short, allow: allow }) : '';
  }
  function PW(S) { return HK.R18M && HK.R18M.lastPos(S) ? '（' + HK.R18M.lastPos(S) + '）' : ''; }
  function PL(k, base) { var T = Y.R18T || {}; return base.concat(T[k] || []); }
  /* 女性どうしなら女性どうしの文（Y.R18T.ff）、そうでなければ PL */
  function PLF(k, base, x, y) { var T = Y.R18T || {}; return isFF(x, y) && T.ff && T.ff[k] ? T.ff[k] : isFM(x, y) && T.fm && T.fm[k] ? T.fm[k] : PL(k, base); }
  /* 女性（ふたなりでない）が攻め、相手が男性：Y.R18T.fm の跨る・導く文 */
  function isFM(x, y) { var g = function (c) { return c.gender || (c.src && c.src.gender); }; return !!(HK.Pos && HK.Pos.isF(x)) && g(y) === 'm'; }
  /* 態度9種（HK.personaOf）ごとの書き分け：drug＝媚薬が回ったとき、react＝媚薬の夜・誘惑・口封じ・使用人で受ける側の崩れ方（拒む言葉は使わない）、
     force＝凌辱・脅迫で抗う様子、after＝翌朝の態度。{a}=本人 */
  var YP = {
    proud: {
      drug: L('{a}はグラスを置き、「酔ってなどいない」と言い切った。テーブルの縁を掴む指に、余計な力がこもっていた。|{a}は火照る頬を手の甲で冷やしながら、窓辺に立って吹雪を睨んでいた。睨んでいないと、膝が崩れそうだった。|「こんなもの、気合いでどうにでもなる」――{a}はそう言って立ち上がり、一歩目でよろめいた。'),
      react: L('{a}は主導権を渡すまいと、最後まで相手を睨み返していた。その目は、すぐに熱で潤んだ。|{a}は「調子に乗るな」と言いかけて、続きを甘い息に呑まれた。|{a}は悔しそうに眉を寄せたまま、それでも相手の背中に回した腕を解かなかった。'),
      force: L('{a}は相手の顔に唾を吐きかけた。返ってきたのは、さらに強く押さえつける手だった。|{a}は最後まで、相手の名前を呪うように呼び続けた。|{a}は歯を食いしばり、一度も泣き声を上げなかった。握りしめた拳だけが、白く震えていた。'),
      after: L('翌朝、{a}はいつもより背筋を伸ばして食堂に現れた。昨夜のことを訊く者は、誰もいなかった。|{a}は鏡の前で襟を立て、首筋の痕を隠した。「薬のせいだ」と、鏡の中の自分に言い聞かせた。|{a}は朝食のあいだ、誰とも目を合わせずにコーヒーを三杯飲んだ。')
    },
    stern: {
      drug: L('{a}は異変に気づくと、グラスを伏せて皆に「これ以上飲むな」と命じた。命じる声が、わずかに上ずっていた。|{a}は冷水で顔を洗い、乱れた呼吸を数えて整えようとした。整うより先に、熱が上がった。|{a}は背筋を伸ばしたまま椅子に座り続けた。膝の上で組んだ手が、汗で湿っていった。'),
      react: L('{a}は乱れまいと唇を結んでいた。結んだ唇の隙間から、堪えきれない息が零れた。|{a}は「規律を、乱すな」と自分に言い聞かせた。言い聞かせる声が、途中で甘く崩れた。|{a}は最後まで眉間の皺を解かなかった。皺の下の目だけが、とろりと潤んでいた。'),
      force: L('{a}は「恥を知れ」と叱りつけた。その声は、口を塞ぐ手に遮られた。|{a}は抵抗が無駄だと悟ると、目を閉じて耐えた。閉じた瞼の端から、一筋だけ涙が流れた。|{a}は最後まで、相手の顔と手口を記憶に刻みつけていた。'),
      after: L('翌朝、{a}は乱れた寝台を整え直してから部屋を出た。几帳面な手つきが、かえって痛々しかった。|{a}は朝の点呼で、いつも通りの声で皆の名を呼んだ。一度だけ、言葉が詰まった。|{a}は昨夜のことを手帳に書きかけて、頁ごと破り捨てた。')
    },
    tsun: {
      drug: L('{a}は「べ、別に酔ってないし」と言いながら、グラスを持つ手が震えていた。|{a}は誰かに顔を覗き込まれるたび「見ないでよ」と怒った。そのたびに、頬は赤くなった。|{a}は「先に寝る」と言い捨てて客間を出た。廊下の途中で、壁にもたれて動けなくなった。'),
      react: L('{a}は「勘違いしないでよ」と言い張った。言葉とは裏腹に、相手の袖をきつく掴んでいた。|{a}は顔を背けて「ばか」と繰り返した。繰り返すたびに、声は甘く崩れていった。|{a}は意地でも声を出すまいと、枕に顔を押しつけた。くぐもった声は、隠しようもなかった。'),
      force: L('{a}は「さわんないで」と叫んで、相手の腕に噛みついた。噛みついた歯は、すぐに震えて力を失った。|{a}は泣きながら相手を罵り続けた。罵る声は、やがて嗚咽にしかならなかった。|{a}は涙をこぼすまいと天井を睨んでいた。睨む目から、とうとう涙が溢れた。'),
      after: L('翌朝、{a}は「何もなかった」と言い張り、誰よりも早く食堂に着いた。トーストを持つ手が、少し震えていた。|{a}は鏡を見て、首筋の痕に悲鳴を上げた。それから黙って、スカーフを巻いた。|{a}は一日じゅう、話しかけられるたびにびくりと肩を跳ねさせた。')
    },
    gentle: {
      drug: L('{a}は自分の火照りより先に、具合の悪そうな仲間に水を運んで回った。|{a}は「少し、体が熱いみたい」と困ったように笑い、窓を細く開けて吹雪の冷気を入れた。|{a}は熱に戸惑いながらも、皆に「今夜は部屋に鍵をかけて休もうね」と声をかけた。'),
      react: L('{a}は戸惑いながらも、相手の髪をそっと撫でた。撫でる手が、だんだん震えていった。|{a}は相手を拒みきれず、包み込むように抱き寄せた。触れたところから、熱が広がっていった。|{a}は柔らかく息をこぼしながら、相手の名前を何度も呼んだ。'),
      force: L('{a}は涙を浮かべながら、それでも「乱暴にしないで」とだけ、静かに頼んだ。|{a}は押し返そうとした手を、途中で止めてしまった。拒むことに、慣れていなかった。|{a}は声を殺して泣いた。廊下の誰かに聞かせて、巻き込みたくなかった。'),
      after: L('翌朝、{a}は何も言わずに厨房に立ち、皆の分の朝食を作った。いつもの笑顔が、少しだけ硬かった。|{a}は「心配かけてごめんね」と皆に謝った。謝る理由など、どこにもなかった。|{a}は窓辺で、吹雪のやんだ雪原をぼんやりと眺めていた。')
    },
    devoted: {
      drug: L('{a}は体の異変を隠して、皆の寝室の暖炉に薪を足して回った。誰かの役に立っていれば、熱を忘れられる気がした。|{a}は「私は大丈夫です」と繰り返した。大丈夫ではないことは、潤んだ目が語っていた。|{a}は熱に耐えながら、仲間の水差しを満たしに行った。階段の手すりにもたれて、しばらく動けなかった。'),
      react: L('{a}は相手の望むままに、健気に身を委ねた。委ねるうちに、満たされているのは自分のほうになっていた。|{a}は「私でよければ」と小さく言って、自分から寝間着の釦を外した。|{a}は相手の背に回した腕を決して緩めなかった。'),
      force: L('{a}は「私が我慢すれば、皆は無事でいられる」と自分に言い聞かせ、抵抗をやめた。|{a}は泣きながら、それでも相手の機嫌を損ねまいと、身を硬くして耐えた。|{a}は誰かの名前を呼びかけて、口をつぐんだ。助けを求めれば、その人が危ない目に遭う。'),
      after: L('翌朝、{a}は誰よりも早く起きて、皆のコーヒーを淹れていた。手首の痕は、袖で隠していた。|{a}は「皆さんが無事でよかったです」と微笑んだ。自分のことは、何も話さなかった。|{a}は洗面所で、何度も何度も手を洗っていた。')
    },
    cool: {
      drug: L('{a}は自分の脈を測り、「何か盛られた」と淡々と告げた。告げる声だけが、わずかに上ずっていた。|{a}はグラスの残りを小瓶に取り分けてから、ふらつく足で自室へ戻った。証拠は、確保しておくべきだった。|{a}は熱の原因を推理しようとしたが、思考がまとまらないことに気づいて、黙って部屋の鍵を閉めた。'),
      react: L('{a}は平静を装っていた。浅くなる呼吸だけは、隠しきれなかった。|{a}は「合理的じゃない」と呟いた。呟いた唇は、すぐに塞がれた。|{a}は表情一つ変えまいとした。紅潮した頬と乱れた息が、無表情を裏切っていた。'),
      force: L('{a}は相手の手の動きを冷静に観察しようとした。観察することだけが、正気を保つ手段だった。|{a}は「無意味だ」と短く言った。その後に続いたのは、言葉ではなかった。|{a}は最後まで目を開けていた。相手の顔を記憶することが、{a}に残された抵抗だった。'),
      after: L('翌朝、{a}は昨夜の出来事を探偵に手短に報告した。自分の身に起きたことは、「特記事項なし」で済ませた。|{a}は冷めた紅茶をすすりながら、窓の外を見ていた。カップを持つ指先だけが、白くなっていた。|{a}は昨夜の誰の部屋の明かりがいつ消えたかを、黙って手帳に書き留めた。')
    },
    free: {
      drug: L('{a}は「なんか体ぽかぽかするー」と笑い、ソファに寝転がった。笑い声が、どこか上ずっていた。|{a}は熱に浮かされたまま、廊下を裸足で歩き回った。冷えた床が気持ちいい、と笑っていた。|{a}は「これ、絶対なんか入ってるよね」と面白がりながら、もう一杯おかわりした。'),
      react: L('{a}は楽しげに笑いながら、自分から相手を引き寄せた。|{a}は恥じらう素振りも見せず、気持ちいいところを素直にねだった。|{a}は笑う余裕もなくなるまで、夢中で相手を求めた。'),
      force: L('{a}は最初こそ笑い飛ばそうとした。笑い声は、すぐに悲鳴に変わった。|{a}は「冗談でしょ」と言った。冗談ではないと分かったとき、{a}の顔から血の気が引いた。|{a}は暴れ、蹴り、叫んだ。いつもの軽さは、どこにもなかった。'),
      after: L('翌朝、{a}は「すっごい夜だった」と笑い話にしようとした。誰も笑わなかったので、{a}も黙った。|{a}は寝不足の顔であくびをし、「今日は昼まで寝る」と宣言した。目の下の隈は、隠しきれなかった。|{a}は首の痕を指でなぞり、「消えるかな、これ」と小さく呟いた。')
    },
    shy: {
      drug: L('{a}は火照る顔を両手で覆い、客間の隅で小さくなっていた。|{a}は服の擦れる感触にさえ声を漏らしそうになり、慌てて口を押さえた。|{a}は「お手洗いに」と小さく言って席を立ち、そのまま戻ってこなかった。'),
      react: L('{a}は両手で顔を隠そうとして、相手にそっと手首を外された。|{a}は自分の声が恥ずかしくて、シーツに顔を埋めた。耳まで真っ赤だった。|{a}は消え入りそうな声で、相手の名前を呼んだ。'),
      force: L('{a}は声も出せずに、ただシーツの端を握りしめていた。|{a}の拒む声は、蚊の鳴くように小さかった。吹雪の音に、すぐにかき消された。|{a}は目を固く閉じた。見なければ、何もなかったことにできる気がした。'),
      after: L('翌朝、{a}は部屋から出てこなかった。扉越しに声をかけられると、小さく「大丈夫」とだけ返した。|{a}は誰とも目を合わせられず、朝食にほとんど手をつけなかった。|{a}は耳まで赤くしたまま、昨夜のことを一言も口にしなかった。')
    },
    polite: {
      drug: L('{a}は「少々、失礼いたします」と丁寧に頭を下げ、乱れかけた襟を正して席を外した。|{a}は熱に浮かされながらも、グラスを下げに来た使用人に「ごちそうさまでした」と礼を言った。|{a}は「お見苦しいところを」と詫び、扇子を広げて顔をあおいだ。'),
      react: L('{a}は「はしたないことを」と詫びながら、相手の首に腕を回した。|{a}は丁寧な言葉を選ぼうとして、途中で言葉を見失った。|{a}は乱れた髪を直すことも忘れ、相手にすべてを委ねていた。'),
      force: L('{a}は「お、おやめください」と最後まで丁寧に頼んだ。丁寧な言葉は、途中から言葉にならなくなった。|{a}は乱れまいと居住まいを正そうとしたが、押さえつけられてそれも叶わなかった。|{a}は「どうか、お考え直しを」と震える声で言った。相手は笑って、聞き入れなかった。'),
      after: L('翌朝、{a}は皆に「ご心配をおかけしました」と深々と頭を下げた。顔を上げたとき、目が赤かった。|{a}は乱れた部屋を丁寧に片づけ、使用人に礼を言った。声が、かすかに震えていた。|{a}は朝食の席で、いつもより少しだけ遠い席に座った。')
    }
  };
  function pz(S, p, k) {
    var t = YP[(HK.personaOf ? HK.personaOf(p) : p.persona) || 'gentle'] || YP.gentle;
    return t[k] ? F(fp(S, t[k]), { a: p.name }) : '';
  }
  /* 翌朝の一文（4割ほど。厚い版のあとは段落を分ける） */
  function aft(S, p) { return S.rng() < 0.4 ? (HK.R18Thick && HK.R18Thick.on(S) ? '\n\n' : '') + pz(S, p, 'after') : ''; }
  scen.env.push({ id: 'ylewd', label: '夜の出来事の起こりやすさ', min: 0, max: 100, def: 40, lo: '起きない', hi: 'たびたび', desc: '犯人が媚薬を盛って事件をうやむやにしたり、探偵を誘惑したりする頻度' });

  scen.env.push({ id: 'ypleasure', label: '快楽殺人の起きやすさ', min: 0, max: 100, def: 15, lo: '起きない', hi: 'いつも', desc: '犯人の動機が「快楽殺人（楽しかったから）」になる確率。快楽殺人の犯人は、夜に誰かを無理やり犯し、そのまま殺すことがある。動機を指定したときはそちらが優先' });
  /* 快楽殺人の起きやすさ：冷酷さ・FCの高い犯人ほど少しなりやすい */
  function pleasure(S, env, cul) {
    if (HK.SAFE_ON) return null;
    /* 快楽殺人は「暴力をともなう性描写」（内容のスイッチ）が入のときだけ */
    if (HK.Content && !HK.Content.on(env, 'violence')) return 'no';
    var v = env.ypleasure; if (v == null) v = 15;
    if (v <= 0) return 'no';
    var t = cul && cul.tr ? cul.tr : {};
    var p = v / 100 * (0.8 + (t.cold || 0) * 0.25 + (t.fc || 0) * 0.15);
    return S.rng() < Math.min(1, v >= 100 ? 1 : p) ? 'yes' : 'no';
  }

  /* ---------- 盛り方（10通り）：{c}=犯人 {p}=その夜の場所 ---------- */
  var DRUG = [
    { id: 'wine', p: '客間', t: L('その夜の夕食で、{c}は「とっておきの一本です」と、古いワインを開けた。|{c}は「館の主の秘蔵品だそうです」と、地下から埃をかぶった赤ワインを持ってきた。'), e: L('グラスが空になるころ、広間の空気は、ねっとりと甘く熱を帯びていた。|しばらくすると、誰もが頬を上気させ、互いの肌から目を離せなくなった。') },
    { id: 'hotwine', p: '暖炉の前', t: L('{c}は厨房に立ち、皆のために温かいホットワインを作った。蜂蜜と、少し変わった香辛料の匂いがした。|{c}は「体が温まりますよ」と、湯気の立つカップを一人ずつに手渡した。'), e: L('体の芯から温まったはずなのに、熱はいつまでも引かなかった。むしろ、下腹に溜まっていった。|カップを置いた指先が、隣の人の手に触れた。それだけで、息が止まりそうになった。') },
    { id: 'spirits', p: '遊戯室', t: L('{c}は暖炉の前で、皆に強い酒を注いで回った。「眠れない夜には、これが一番」|{c}は遊戯室で酒盛りを始めた。「怖いときは飲むに限る。ほら、もう一杯」'), e: L('二杯目で、誰もが妙に饒舌になった。三杯目で、誰もが妙に近くなった。|酔いが回るにつれて、恐怖は消え、代わりに得体の知れない熱が体を満たした。') },
    { id: 'incense', p: '寝室', t: L('{c}は「よく眠れますように」と、皆の寝室に小さなお香を焚いて回った。|館じゅうの部屋に、甘ったるい香りの煙が漂い始めた。{c}が、古い香炉に何かをくべていた。'), e: L('布団に入ってしばらくすると、肌が布に擦れるだけで声が漏れそうになった。|香りを吸い込むたびに、頭がぼうっとして、誰かに触れられたくてたまらなくなった。') },
    { id: 'bath', p: '大浴場', t: L('{c}は大浴場の湯を沸かし、「体を温めましょう」と皆を誘った。湯には、乳白色の入浴剤が溶かされていた。|{c}は「冷えた体には温泉が一番」と言って、館の大浴場に湯を張った。湯は、ほんのりと桃色だった。'), e: L('湯に浸かった瞬間から、肌という肌が火照り出した。湯気の向こうで、誰かの吐息が甘く震えていた。|湯から上がっても、熱は引かなかった。浴衣の合わせから覗く肌に、誰もが目を奪われた。') },
    { id: 'sweets', p: '談話室', t: L('{c}は「夜食にどうぞ」と、手作りのチョコレートを配って回った。|{c}は厨房で焼いたというマドレーヌを、皆に勧めた。「甘いものは、心を落ち着かせますから」'), e: L('ひと口かじると、舌の上で何かが溶けて広がった。体が、急に重く、熱くなった。|甘さが喉を通り過ぎたあと、体の奥から、じわじわと疼きが湧き上がってきた。') },
    { id: 'heater', p: '客間', t: L('{c}は「冷えますね」と言って、館の暖房の温度を上げた。通風口の奥に、何かを流し込んだことには、誰も気づかなかった。|{c}は夜中に起き出し、ボイラー室の吸気口に小瓶の中身を垂らした。'), e: L('暖房の風が強くなるにつれて、館じゅうの空気が、むせかえるほど甘くなった。|部屋が暖まるほど、頭がぼんやりとして、誰かの体温が恋しくてたまらなくなった。') },
    { id: 'tea', p: '書斎', t: L('{c}は「気持ちが落ち着きますよ」と、ハーブティーを淹れた。|{c}は、館に残っていた珍しい茶葉で紅茶を淹れた。花のような、少し変わった香りがした。'), e: L('二口目を飲んだあたりから、心臓の音がやけに大きく聞こえ始めた。|カップを持つ手が震えた。寒さのせいではなかった。') },
    { id: 'oil', p: '医務室', t: L('{c}は「肩が凝っているでしょう」と、皆にマッサージを申し出た。手に取ったオイルは、甘い花の香りがした。|{c}は「血行をよくするオイルです」と言って、小瓶を皆に回した。'), e: L('オイルを塗られた肌が、内側から燃えるように熱くなった。誰かの指が触れるたびに、体がびくりと跳ねた。|オイルが肌に馴染むにつれて、どこを触られても、声を抑えられなくなった。') },
    { id: 'dark', p: '暗闇の広間', t: L('夜更け、館の電気が一斉に消えた。暗闇の中で、{c}がまいた香水の匂いだけが、濃く漂っていた。|{c}は停電の暗闇に乗じて、甘い香りの霧を広間に撒いた。'), e: L('誰の顔も見えない闇の中で、誰かの手が、誰かの肌を探り当てた。|暗闇と甘い香りが、理性をゆっくりと溶かしていった。') }
  ];
  var SKIP = L('{a}は、グラスに口をつけるふりだけをした。何かがおかしい、と感じていた。|{a}は、それに手をつけなかった。それが、あとで幸いした。|{a}は、匂いに違和感を覚えて、そっと自室に戻った。|{a}は「今夜はやめておく」と断った。');

  /* ---------- その夜に起きること（10通り）：{x}=攻め {y}=受け {p}=場所 ---------- */
  var SC = {
    lovers: L('{p}で、{x}は{y}を抱き寄せた。「今夜は……我慢できない」――殺人犯がいるかもしれない館で、二人はいつもより激しく求め合った。{x}は{y}の奥を何度も突き上げ、{y}は{x}の名前を呼び続けた。|恋人どうしの{x}と{y}は、{p}の扉に鍵をかけるのももどかしく絡み合った。{y}は自分から脚を開き、{x}を深く迎え入れた。|{x}は{y}を{p}の壁に押しつけた。「怖いの、全部忘れさせて」――{y}の囁きに、{x}は何度も応えた。|{y}は{x}の上に跨り、熱に浮かされたまま腰を揺らした。{x}が{y}の中で果てても、二人は離れなかった。'),
    enemies: L('{p}で鉢合わせた{x}と{y}は、いつものように睨み合った。――次の瞬間、どちらからともなく唇を奪い合っていた。憎しみと熱が、ひとつに混ざった。|{x}は{y}の胸ぐらを掴んだ。「……お前なんか、大嫌いだ」そう言いながら、{x}は{y}を{p}の床に押し倒し、乱暴に奥まで沈めた。|罵り合いながら、{x}と{y}は互いの服を剥ぎ取った。{y}は{x}の背中に爪を立て、声を噛み殺しながら果てた。'),
    crush: L('ずっと{y}を想っていた{x}は、媚薬の熱に背中を押された。「ごめん……もう、抑えられない」――{x}は{p}で{y}を抱きしめ、唇を重ねた。|{x}は{y}の部屋を訪ねた。「ずっと、こうしたかった」――{y}は戸惑いながらも、熱に浮かされた体で{x}を受け入れた。|{x}は、{p}で眠り込んだ{y}の寝顔を見つめていた。媚薬の熱に負けて、そっと{y}の肌に触れた。{y}は目を覚まし――拒まなかった。'),
    /* 両片想い：どちらも自分だけの片想いだと思っていて、媚薬の夜に同時に溢れる */
    pining: L('媚薬の熱に浮かされた{x}は、{p}で{y}と鉢合わせた。「ごめん……ずっと、好きだった。薬のせいにさせて」――言い終わる前に、{y}の方から唇が重なってきた。「……こっちの台詞。薬のせいになんて、しないで」――{x}は{y}を抱き寄せ、そのまま深く繋がった。|{x}が{y}の部屋の扉を叩いたのと、{y}が扉を開けたのは同時だった。{y}も、ちょうど{x}の部屋へ行こうとしていたところだった。二人は言葉もなく抱き合って寝台に倒れ込み、{x}はゆっくりと{y}の奥へ沈んでいった。|{x}は{y}を抱きながら、何度も「好き」と繰り返した。どうせ片想いだから、今夜だけは言ってしまおうと思っていた。けれど{y}は、そのたびに「私も」と返して、{x}の背中にしがみついた。'),
    buddy: L('探偵の{d}と助手の{b}は、{p}で二人きりになった。「{sensei}……変なんです、体が」――その夜、二人は「相棒」の一線を越えた。|{b}は熱に浮かされた{d}を介抱しようとした。けれど、触れた指先から熱が移り、気づけば二人はベッドの上で絡み合っていた。|「推理の続きは、明日にしましょう」――{d}は{b}の手を引いた。いつも背中を預け合っていた相棒の肌は、思っていたよりずっと熱かった。'),
    casual: L('{x}は{y}の手を引いて、{p}に転がり込んだ。扉が閉まる前から、二人の唇は重なっていた。{x}は熱に浮かされたまま、何度も{y}の奥まで突き上げた。|{p}の絨毯の上で、{x}は{y}を組み敷いた。{y}は自分から脚を開き、{x}の腰を引き寄せた。|{y}は廊下で{x}にしがみついた。「熱いの……どうにかして」――{x}は{y}を壁に押しつけ、その場で繋がった。|名前くらいしか知らない相手だった。それでも{x}と{y}は、{p}で夜明けまで互いを貪った。'),
    group: L('{p}では、もう誰が誰と抱き合っているのか分からなかった。服が床に散らばり、喘ぎ声と水音が重なり合っていた。|気がつけば、{p}で三人が絡み合っていた。誰の手が誰の肌を這っているのか、誰にも分からなかった。|{p}のソファの上で、何人もの体が重なり合っていた。吹雪の音も、殺人犯のことも、誰の頭にも残っていなかった。'),
    solo: L('{a}は自室に閉じこもり、熱を持て余していた。誰にも見られないように、布団の中で自分の体に手を伸ばした。|{a}は浴室の冷たい水を浴びても、熱が引かなかった。壁に背を預けたまま、声を殺して何度も自分を慰めた。|{a}は誰とも顔を合わせたくなくて、部屋の鍵をかけた。扉の向こうから聞こえる甘い声に、指が止まらなくなった。'),
    servant: L('館の古い使用人が、{a}の部屋の扉を叩いた。「お休みになれないご様子でしたので」――{a}は、その手を拒めなかった。|{a}が廊下でうずくまっていると、館の使用人が黙って肩を貸してくれた。運ばれた先は、使用人部屋のベッドだった。'),
    silence: L('{c}は、手がかりを掴みかけていた{a}の部屋を訪ねた。「ねえ……今夜は、私のことだけ考えて」――{a}が目を覚ましたとき、手帳のページが一枚、破り取られていた。|{c}は熱に浮かされた{a}を抱きながら、耳元で囁き続けた。「全部、忘れて」――翌朝、{a}は自分が何を調べていたのか、うまく思い出せなかった。'),
    guard: L('{a}は、一人だけ酒を飲んでいなかった。乱れた館の中、{a}は現場の扉の前に座り込み、朝まで誰も近づけなかった。|{a}は異変に気づいて、現場の部屋に鍵をかけた。鍵は、自分のポケットにしまった。|{a}は酒の匂いに気づいて、グラスを置いた。それから一晩じゅう、手がかりの置かれた書斎の前を離れなかった。')
  };
  var SEDUCE = L('{c}は、熱に浮かされた{d}の部屋を訪ねた。「探偵さん……ずっと、気になってたんです」――{c}は{d}の膝に跨り、ゆっくりと腰を沈めた。|{c}は{d}の首に腕を回してベッドへ誘い込み、耳元で囁いた。「事件のことなんて、今夜は忘れて」――{d}は{c}を組み敷いた。{c}の中で果てるたびに、推理の糸が一本ずつほどけていった。|{c}は{d}の手帳をそっと閉じ、その手を自分の胸に導いた。「謎解きより、楽しいことしませんか」');
  /* 女性が主導して男性と交わるときの誘惑（女性の側に男性の体の書き方を当てない）：FMC＝誘った{c}が女性で主導、FMD＝探偵{d}が女性で主導 */
  var SEDUCE_FMC = L('{c}は、熱に浮かされた{d}の部屋を訪ねた。「探偵さん……今夜は、私に任せて」――{c}は{d}を寝台に押し倒して跨り、自分の手で導いて、ゆっくりと腰を沈めた。{d}が何か言いかけるたびに、{c}は中をきゅうっと締めて、その言葉を溶かした。|{c}は{d}の膝に乗り、首に腕を回した。「推理なんて、朝まで忘れて」――根元まで呑み込んだまま腰を揺らす{c}に、{d}の思考は一つずつほどけていった。|{c}は、熱に浮かされた{d}の部屋を訪ねた。「推理なんて、今夜は休みにしましょう」――{c}は{d}の膝に跨り、首に腕を回したまま、自分から腰を沈めていった。');
  var SEDUCE_FMD = L('{c}は、熱に浮かされた{d}の部屋を訪ねた。「探偵さん……ずっと、気になってたんです」――けれど主導権を握ったのは{d}のほうだった。{d}は{c}を寝台に押し倒して跨り、見下ろしたまま、ゆっくりと腰を落とした。|{c}が寄り添ってきた瞬間、{d}はその肩を押して仰向けにさせた。「誘ったのは、そっちだよね」――{d}は{c}の上に跨り、熱を自分の中へ迎え入れて、好きな速さで腰を揺らした。|{c}は{d}を誘惑するつもりで部屋を訪ねた。けれど熱に浮かされた{d}は、{c}を寝台に押し倒して跨り、自分の手で導いて腰を沈めた。「探偵を甘く見ないで」');
  var SEDUCE_TOP = L('{c}は、熱に浮かされた{d}の部屋に忍び込み、そのまま{d}を組み敷いた。「探偵さん、今夜は何も考えなくていい」――{c}に奥まで貫かれるたびに、{d}の頭から推理が抜け落ちていった。|{c}は{d}の手首を押さえつけ、ゆっくりと腰を進めた。{d}は抗おうとしたが、媚薬に浮かされた体は、{c}を受け入れることしか知らなかった。|{c}は{d}の眼鏡を外し、机の上に置いた。「推理は、もうおしまい」――そのまま{d}を机に押し伏せた。');
  /* 翌朝（10通り） */
  /* 自分で攻めを選んだ人のところへ来た使用人：{a}のほうが組み伏せる */
  var SERVANT_TOP = L('館の古い使用人が、{a}の部屋の扉を叩いた。「お休みになれないご様子でしたので」――{a}はその手首を掴んで部屋に引き入れ、寝台に押し倒した。夜明けまで、使用人は{a}の下で声を殺し続けた。|{a}が廊下でうずくまっていると、館の使用人が黙って肩を貸してくれた。運ばれた使用人部屋のベッドで、{a}は使用人の燕尾服の襟を掴み、自分の下に組み敷いた。|館の使用人が「お慰めを」と囁いて{a}の寝台に上がってきた。{a}はその肩を押し倒し、逆に組み伏せた。夜が明けるまで、主導権が使用人に渡ることはなかった。');
  /* ---------- 描写の作風「男性向け」・描写の有無「濃い」（lewd-unify.js・story-lewd.js）で、二人の場面以外も切り替える ----------
     一人で悶える・乱交・使用人を組み伏せる・媚薬が回る場面。凌辱・脅迫・使用人に慰められる場面（合意のない場面）には足さない */
  function lwEro(S) { return !!(HK.Ero && HK.Lewd && HK.Lewd.storyEro && HK.Lewd.storyEro(S)); }
  function lwHi(S) { return !!(HK.Lewd && !HK.SAFE_ON && HK.Lewd.lv(S.env) === 'high'); }
  function lwShort(S) { return !!(HK.Lewd && HK.Lewd.storyShort && HK.Lewd.storyShort(S)); }
  /* 男性の体で書くか（女性でふたなりでない人は女性の体） */
  function mBody(p) { return !(HK.Pos && HK.Pos.isF(p)); }
  function EF(S, t, p, m) { return HK.Ero.fill(S, F(t, m || { a: p.name }), p); }
  /* 媚薬が回ったとき：「R18に参加しない」人の一文（性的でない書き方。火照り・めまい・息苦しさ） */
  var DRUG_SOFT = L('{a}は頬の火照りと軽いめまいに、椅子の背にもたれて目を閉じた。グラスの中身が、急に重く感じられた。|{a}は襟元を緩め、浅くなった息を整えようとした。暖炉の熱が、やけに近く感じられた。|{a}は額に手を当て、ふらつく足で窓辺へ行った。冷たいガラスに頬を寄せると、少しだけ楽になった。');
  var Y_ERO = {
    /* 媚薬が回ったとき（一人ずつ。{m0}＝こらえる声） */
    drug: L('{a}は服の擦れる感触だけで、びくりと腰を跳ねさせた。慌てて膝を閉じても、熱は脚の間に溜まっていく一方だった。{a}「{m0}」|{a}は椅子の上で膝をきつく閉じ、もじもじと腰を揺らしていた。じわりと下着が湿っていくのが、自分でも分かった。{a}「{m0}」|{a}は胸の先が布に擦れるたびに、小さく息を呑んだ。尖ったそこが、薄い服の上からでも分かるほどだった。{a}「{m0}」'),
    soloM: L('{a}は布団を跳ねのけ、張りつめた{男性器}を握りしめた。先走りでぬるぬるになった手を上下させるたびに、腰が勝手に跳ねた。{s:wet}。{a}「{m1}」――止めようと思っても、手は速くなる一方だった。|{a}は浴室の壁に額を押しつけ、熱を持て余した{男性器}を扱き上げた。シャワーの水音に、いやらしい音が混ざって響いた。{s:wet}。{a}「{m1}」――声を殺そうとして噛んだ唇が、すぐにほどけた。|{a}は寝台の縁に腰かけ、脈打つものを両手で包み込んだ。媚薬のせいで、少し擦るだけで頭の奥が白く弾けそうだった。{s:wet}。{a}「{m1}」――指の間から、とろりと先走りが溢れた。'),
    soloF: L('{a}は寝間着の裾をたくし上げ、とろとろに濡れたそこへ指を沈めた。一本では足りず、すぐに二本目を咥え込んだ。{s:wet}。{a}「{m1}」――指を曲げるたびに、腰が勝手に浮いた。|{a}は浴室の壁にもたれ、脚の間に指を這わせた。膨らんだ芽を擦るたびに、膝ががくがくと震えた。{s:wet}。{a}「{m1}」――水音にまぎれて、甘い声が浴室に響いた。|{a}は枕を脚の間に挟み、腰を擦りつけた。それでは足りなくて、自分の指で奥を掻き回した。{s:wet}。{a}「{m1}」――シーツに、恥ずかしい染みが広がっていった。'),
    soloMc: L('{a}「{m2}」――{a}は背を反らし、びゅくびゅくと何度も吐き出した。{s:cum}。シーツに散った白いものを見下ろしても、熱はまだ引かなかった。|{a}「{m2}」――手の中で、{男性器}が大きく跳ねた。{s:cum}。吐き出しても吐き出しても、硬さは少しも収まらなかった。|{a}「{m2}」――腰を突き出したまま、{a}は勢いよく精を放った。{s:cum}。濡れた手を見つめて、{a}は荒い息をついた。'),
    soloFc: L('{a}「{m2}」――{a}は指を咥え込んだまま、びくびくと痙攣して果てた。中が指をきゅうきゅうと締めつけて、なかなか離さなかった。溢れた蜜が、手首まで伝っていた。|{a}「{m2}」――爪先をぴんと伸ばして、{a}はイった。ぷしゃっ、と恥ずかしい音がして、シーツがぐっしょりと濡れた。それでも、疼きは消えなかった。|{a}「{m2}」――腰を浮かせたまま、{a}は長く果てた。指を抜いたあとも、中がひくひくと物欲しげに震えていた。'),
    soloAgain: L('{a}は息を整える間もなく、また手を伸ばした。二度目は、一度目よりずっと敏感だった。{a}「{m2}」――夜が白むまで、{a}の部屋から甘い声が途切れることはなかった。|一度果てても、媚薬の熱は少しも引かなかった。{a}は濡れた手のまま、また自分を慰め始めた。{a}「{m1}」――三度目を数えたところで、{a}は数えるのをやめた。|{a}はシーツを握りしめたまま、また自分の熱に手を伸ばした。{s:wet}。{a}「{m2}」――二度目は、一度目よりあっけなく果ててしまった。|{a}は果てたばかりの体を丸め、それでも指を止められなかった。{s:wet}。{a}「{m1}」――吹雪の音に紛れて、{a}は三度目の波に呑まれた。|{a}「{m2}」――熱は引くどころか、果てるたびに強くなっていった。{s:wet}。{a}が眠りに落ちたのは、窓の外が白みはじめてからだった。'),
    /* 濃い・小説調：一人の夜の続き */
    soloAgainN: L('一度果てても、熱は少しも引かなかった。{a}は乱れた息のまま、また自分の体に手を伸ばした。二度目は、一度目よりずっと長かった。|{a}は果てたあとも、疼きを持て余して寝返りを打った。結局、もう一度だけ、と自分に言い訳をした。その「もう一度」は、夜明けまで続いた。|果てたあとも、体の奥の疼きは収まらなかった。{a}は枕に顔を埋め、もう一度だけと自分に言い聞かせながら手を伸ばした。|{a}は荒い息のまま天井を見上げた。吹雪の音を聞いているうちに、また指が勝手に動きはじめていた。|一度では足りなかった。{a}は乱れた寝間着を直すこともせず、夜が明けるまで熱と格闘し続けた。|{a}は果てた余韻に震えながら、誰かの足音が廊下を過ぎるのを聞いた。息を殺したまま、{a}の指はまた熱を探りはじめた。'),
    /* 使用人を組み伏せる（自分で攻めを選んだ人。{m1}＝主導する側の声） */
    topM: L('{a}は使用人を寝台に這わせ、後ろから一気に奥まで突き入れた。使用人が声を殺そうとするたびに、{a}はわざと奥を抉った。{s:hit}。{a}「{m1}」――最後は使用人の奥に、たっぷりと吐き出した。{s:cum}。|{a}は使用人の脚を抱え上げ、自分の好きな速さで腰を打ちつけた。使用人の喉から、堪えきれない声が漏れた。{s:hit}。{a}「{m1}」――{a}が満足するまで、使用人は解放されなかった。|{a}は使用人を壁に押しつけ、立ったまま後ろから貫いた。{s:hit}。{a}「{m1}」――使用人が膝から崩れそうになるたびに、{a}は腰を掴んで引き戻した。|{a}は使用人を寝台に仰向けにさせ、脚を大きく割り開いて沈めた。{s:hit}。{a}「{m1}」――使用人の取り澄ました顔が崩れるまで、{a}は少しも手加減しなかった。|{a}「{m1}」――{a}は使用人の口元に指を差し入れて声を塞ぎ、奥を何度も捏ね回した。{s:wet}。最後は使用人の一番奥に押しつけたまま、熱を吐き出した。'),
    topF: L('{a}は使用人を寝台に押し倒して跨り、自分のいいところに当たるように腰をくねらせた。使用人が果てそうになるたびに、{a}は動きを止めて焦らした。{s:wet}。{a}「{m1}」――{a}が満足するまで、使用人は解放されなかった。|{a}は使用人の顔の上に跨り、舌で奉仕させた。使用人の舌が奥まで這うたびに、{a}は髪を掴んで引き寄せた。{s:wet}。{a}「{m1}」――{a}は使用人の顔をびしょびしょに濡らして果てた。|{a}は使用人を椅子に座らせ、その膝に跨って腰を沈めた。{s:wet}。{a}「{m1}」――使用人の手が肘掛けを握りしめるのを見下ろして、{a}は楽しげに腰を揺らした。|{a}は使用人の顔の上に跨り、舌で奉仕させた。{s:suck}。{a}「{m1}」――髪を掴んで逃がさないまま、{a}は何度も腰を震わせて達した。|{a}「{m1}」――{a}は使用人の胸に手をつき、自分のいいところに当たる角度を探して腰を落とした。{s:wet}。使用人が果てそうになるたびに、{a}は動きを止めて笑った。'),
    topAgain: L('{a}はひと息つくと、また使用人を組み敷いた。夜は、まだ長かった。使用人が部屋を出られたのは、空が白みはじめてからだった。|一度では収まらず、{a}は使用人に二度目を命じた。使用人は、もう逆らう気力も残っていなかった。夜明けまで、{a}は使用人を手放さなかった。|使用人がぐったりと崩れても、{a}はまだ満足しなかった。体を返させ、もう一度最初から責め直した。|{a}は水差しの水を一口飲むと、また使用人の上に覆いかぶさった。吹雪の夜は、まだ長かった。|夜明け前、使用人はとうとう声も出せなくなっていた。それでも{a}は、最後にもう一度だけ使用人を求めた。'),
    /* 乱交（{a}{b}{c}＝その場の三人。{ma}{mb}{mc}＝それぞれの声） */
    group: L('{s:hit}。{s:wet}。{p}のあちこちで、肌のぶつかる音と水音が重なり合った。後ろから突かれながら、{a}は目の前の誰かの肌に縋りついた。{a}「{ma}」――その声に煽られて、{b}も夢中で腰を揺らした。{b}「{mb}」――{c}が果てる声を合図に、絡み合った体が次々に震えた。{c}「{mc}」|{p}の床で、{a}は誰かの{男性器}を咥えさせられたまま、別の誰かに奥を突き上げられていた。{s:hit}。{a}「{ma}」――隣では{b}が、両側から胸と脚の間を同時に責められていた。{b}「{mb}」――{c}は誰に注がれたのかも分からないまま、とろけた顔でまた次をねだった。{c}「{mc}」|{s:wet}。{s:hit}。{p}の長椅子の上で、{a}は{b}に組み敷かれ、{c}の指に胸を弄ばれていた。{a}「{ma}」――誰かの脚が絡みつき、誰かの吐息が首筋にかかった。{b}「{mb}」――{b}が果てる震えが伝わり、{c}も堪えきれずに声を上げた。{c}「{mc}」'),
    groupFF: L('指と舌が、誰のものか分からないまま肌を這い回った。{s:wet}。{a}は{b}の指を奥まで咥え込み、{c}に胸の先を吸われていた。{a}「{ma}」――{b}は{a}に脚を絡めたまま、{c}の指で何度も果てた。{b}「{mb}」――最後に{c}が、二人に挟まれて甘い声を上げた。{c}「{mc}」|{p}のソファの上で、三人は脚を絡め合い、互いの濡れたところへ指を伸ばした。{s:wet}。{a}「{ma}」――{b}は{a}の胸に顔を埋め、{c}の指を奥へ奥へと誘い込んだ。{b}「{mb}」――{c}は二人の舌に挟まれて、腰を浮かせたまま震えた。{c}「{mc}」|{s:wet}。{p}の絨毯の上で、{a}は{b}の膝に頭を預け、{c}の舌に脚のあいだを責められていた。{a}「{ma}」――{b}は{a}の髪を撫でながら、自分の胸の先を{c}の指に摘ままれていた。{b}「{mb}」――三人分の甘い声が、吹雪の音に溶けていった。{c}「{mc}」')
  };
  /* 一人で悶える場面の本文（男性向け）。濃い＝もう一度。短く＝山場だけ */
  function soloEro(S, q) {
    var m = mBody(q), t = (lwShort(S) ? '' : EF(S, fp(S, m ? Y_ERO.soloM : Y_ERO.soloF), q)) + EF(S, fp(S, m ? Y_ERO.soloMc : Y_ERO.soloFc), q);
    return t + (lwHi(S) ? EF(S, fp(S, Y_ERO.soloAgain), q) : '');
  }
  function topEro(S, q) {
    var d = q.eroDom; q.eroDom = true;
    var t = EF(S, fp(S, mBody(q) ? Y_ERO.topM : Y_ERO.topF), q) + (lwHi(S) ? F(fp(S, Y_ERO.topAgain), { a: q.name }) : '');
    q.eroDom = d;
    return t;
  }
  function groupEro(S, g, P) {
    var a = g.slice(0, 3).sort(function (x, y) { return mBody(x) - mBody(y); }), ff = a.every(function (q) { return HK.Pos && HK.Pos.isF(q); });
    var m = { p: P, a: a[0].name, b: a[1].name, c: a[2].name, ma: HK.Ero.moan(S, a[0], 1), mb: HK.Ero.moan(S, a[1], 2), mc: HK.Ero.moan(S, a[2], 2) };
    return HK.Ero.fill(S, F(fp(S, ff ? Y_ERO.groupFF : Y_ERO.group), m), a[0]);
  }
  var MORNING = L('翌朝、館の誰もが、昨夜のことを口にしようとしなかった。乱れた広間は、いつの間にか片づけられていた――事件の現場ごと。|翌朝、皆はぼんやりとした頭で目を覚ました。昨夜の記憶は、甘い靄に包まれていた。現場に残っていたはずの痕跡も、誰かが踏み荒らしていた。|朝食の席で、誰も目を合わせようとしなかった。それどころではない事件が起きているはずなのに。|翌朝、何人かは見知らぬベッドで目を覚ました。慌てて服を探しているうちに、現場の証拠のことなど、誰も覚えていなかった。|翌朝、館じゅうに甘い香りが残っていた。窓を開けても、その匂いはなかなか消えなかった。|「昨夜は……飲みすぎましたね」誰かがそう言い、皆が気まずく笑った。笑いの中に、犯人の安堵が混じっていた。|翌朝、現場の扉は開け放たれ、床には誰かの浴衣の帯が落ちていた。何が証拠で、何がそうでないのか、もう分からなかった。|翌朝の館は、嘘のように静かだった。昨夜のことを思い出すたびに、誰もが顔を赤らめた。|翌朝、探偵の手帳は、昨夜のページだけが白紙だった。|翌朝、何人かの首筋には、隠しきれない痕が残っていた。互いの顔を見るたびに、昨夜の熱がぶり返した。');
  var MORNING_SAFE = L('翌朝、館は乱れきっていた。ただ一つ、{a}が守った現場だけは、昨夜のままだった。|翌朝、誰もが寝不足の顔で起きてきた。{a}だけが、一晩じゅう現場の前に座っていた。手がかりは、無事だった。|翌朝、荒れた館の中で、{a}が鍵をかけた部屋だけが、昨夜のまま残されていた。');

  Y.R18 = {
    pleasure: pleasure,
    on: function (S) { return !HK.SAFE_ON && (S.env.ylewd || 0) > 0; },
    /* 媚薬の夜。起きたら true（その夜の殺人は起きない） */
    night: function (S, day) {
      var rng = S.rng, c = S.cul, lv = S.env.ylewd / 100;
      if (!c || !Y.alive(c) || c.bound || S.mot.nobody || (S.spiked || 0) >= 2) return false;
      var found = S.pool.filter(function (x) { return x.found && !x.fake; }).length;
      var heat = found >= 2 || c.m.sus > 45 ? 0.35 : 0.12;
      if (rng() > lv * heat * (0.6 + c.tr.cold * 0.4 + c.tr.fc * 0.3)) return false;
      S.spiked = (S.spiked || 0) + 1; S.drugNight = day;
      var used = S.drugUsed || (S.drugUsed = []);
      var D = rng.pick(DRUG.filter(function (d) { return used.indexOf(d.id) < 0; })); used.push(D.id);
      var live = S.P.filter(function (q) { return Y.alive(q) && !q.bound; });
      var drunk = [], sober = [];
      live.forEach(function (q) { if (q === c) return; var ok = rng() < 0.85 - q.tr.caution * 0.5 - (q.role === 'doctor' || q.role === 'detective' ? 0.15 : 0); (ok ? drunk : sober).push(q); q.drugged = ok; });
      var t = F(fp(S, D.t), { c: c.name }) + fp(S, D.e);
      S.drugTools = D.id === 'oil';
      sober.slice(0, 2).forEach(function (q) { t += F(fp(S, SKIP), { a: q.name }); });
      /* 「R18に参加しない」人（HK.State.r18ok が偽）には、媚薬の効きを性的でない書き方（火照り・めまい・息苦しさ）にする */
      drunk.slice(0, 2).forEach(function (q) { if (HK.State && !HK.State.r18ok(q)) { if (rng() < 0.5) t += F(fp(S, DRUG_SOFT), { a: q.name }); } else if (lwEro(S)) t += EF(S, fp(S, Y_ERO.drug), q); else if (rng() < 0.5) t += pz(S, q, 'drug'); });
      var o = ST.say(S, { actors: [c].concat(drunk), tag: '媚薬', kind: 'climax', text: t, why: '犯人の' + c.name + 'が媚薬を盛った（' + { wine: 'ワイン', hotwine: 'ホットワイン', spirits: '強い酒', incense: 'お香', bath: '大浴場の湯', sweets: '菓子', heater: '暖房', tea: '紅茶', oil: 'マッサージオイル', dark: '停電と香水' }[D.id] + '）。追い詰められるほど盛りやすい（夜の出来事 ' + S.env.ylewd + '）。その夜、事件はうやむやになる', mag: 40 });
      ST.key(S, o, c.name + 'が媚薬を盛った');
      var P = D.p, scenes = 0;
      function pairScene(kind, x, y, extra, why) {
        var od = HK.Pos ? HK.Pos.order(x, y, [x, y]) : [x, y];
        var m = { x: od[0].name, y: od[1].name, p: P, d: (extra && extra.d) || '', b: (extra && extra.b) || '', sensei: (extra && extra.sensei) || '先生' };
        var pool = PLF(kind, SC[kind], od[0], od[1]);
        /* 体だけの夜（「誰とでも可」の人と固定外の相手。HK.State.freeSex。free-sex.js）：導入に「恋ではない」一文。恋人にはならない */
        var free = kind === 'casual' && !!(HK.State.freeSex && HK.State.freeSex(S, x, y));
        /* 探偵と助手：向きの決まった文は、探偵が攻めか受けかで選ぶ */
        if (kind === 'buddy' && !isFF(od[0], od[1]) && Y.R18T) pool = pool.concat(Y.R18T[od[0] === x ? 'buddyDT' : 'buddyDB'] || []);
        ST.say(S, { actors: [od[0], od[1]], tag: '媚薬の夜', kind: 'climax', text: (free ? HK.FreeSex.lead(S, x, y) : '') + fmFix(S, F(fp(S, pool), m), od[0], od[1]) + (S.rng() < 0.6 ? pz(S, od[1], 'react') : '') + SX(S, od[0], od[1], kind === 'enemies' ? 'rough' : kind === 'lovers' || kind === 'crush' || kind === 'pining' || kind === 'buddy' ? 'love' : 'drug') + aft(S, od[1]), why: (free ? HK.FreeSex.why(x, y) + '／' : '') + why + PW(S), mag: 32 });
        Y.setRel(S, x, y, kind === 'enemies' ? 0.35 : 0.2, free ? '体だけの関係' : kind === 'enemies' ? '憎しみの一夜' : kind === 'buddy' ? '一線を越えた' : kind === 'crush' ? '想いが溢れた' : kind === 'pining' ? '想いが通じた' : '一夜', kind === 'crush' ? x : null);
        if (free) { HK.FreeSex.mark(S, x, y); HK.FreeSex.jealous(S, x, y); }
        drunk.splice(drunk.indexOf(x), 1); if (drunk.indexOf(y) >= 0) drunk.splice(drunk.indexOf(y), 1);
        scenes++;
      }
      function can(a, b) { return (!HK.canLove || HK.canLove(a, b)) && okP(a, b); }
      /* 残った人どうしの夜には、体だけの関係の組（HK.State.freeSex）も入る。固定した恋人がその場にいれば ×0.3（組ごとに一度だけ決める） */
      var fz = {};
      function canFree(a, b) { var k = Math.min(a.i, b.i) + '-' + Math.max(a.i, b.i); if (fz[k] == null) fz[k] = !!(HK.State.freeSex && HK.State.freeSex(S, a, b)) && rng() < HK.FreeSex.factor(S, a, b) * 1.5; return fz[k]; }
      function tie(a, b, list) { return (S.ties || []).some(function (t) { return ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)) && list.split(',').indexOf(t.type) >= 0; }); }
      /* 探偵への誘惑 */
      var det = drunk.filter(function (q) { return q.isDet; })[0];
      if (det && rng() < 0.35 + lv * 0.3 && can(c, det)) {
        var o2 = HK.Pos ? HK.Pos.order(c, det, [c, det]) : [c, det];
        ST.say(S, { actors: [c, det], tag: '誘惑', kind: 'climax', text: F(fp(S, HK.Pos && HK.Pos.isF(o2[0]) && !HK.Pos.isF(o2[1]) ? (o2[0] === c ? SEDUCE_FMC : SEDUCE_FMD) : o2[0] === c ? PLF('seduceTop', SEDUCE_TOP, c, det) : PLF('seduce', SEDUCE, c, det)), { c: c.name, d: det.name }) + pz(S, o2[1], 'react') + SX(S, o2[0], o2[1], 'drug'), why: c.name + 'は探偵の' + det.name + 'を誘惑した。' + det.name + 'は' + c.name + 'を疑いにくくなり、推理が狂いやすくなる', mag: 44 });
        c.m.sus = Math.max(0, c.m.sus - 25); det.seduced = true; S.fake++;
        Y.setRel(S, c, det, 0.25, '誘惑', c); drunk.splice(drunk.indexOf(det), 1);
      }
      /* 手がかりを持つ人の口封じ（体で） */
      var holder = drunk.filter(function (q) { return q.cnt.clue > 0 || q.approached; }).sort(function (a, b) { return b.cnt.clue - a.cnt.clue; })[0];
      if (holder && rng() < 0.4 && can(c, holder)) {
        /* 犯人が受けの組は、犯人が自分から跨って聞き出す（silenceB） */
        var o3 = od2(c, holder), sl = o3[0] === c ? PLF('silence', SC.silence, c, holder) : PLF('silenceB', [], c, holder);
        ST.say(S, { actors: [c, holder], tag: '媚薬の夜', kind: 'climax', text: F(fp(S, sl), { c: c.name, a: holder.name }) + pz(S, o3[1], 'react') + SX(S, o3[0], o3[1], 'drug', true), why: c.name + 'は、手がかりを掴みかけていた' + holder.name + 'を抱いて、記憶を曖昧にさせた（' + holder.name + 'の手がかり探しが鈍る）', mag: 36 });
        holder.approached = false; holder.cnt.clue = Math.max(0, holder.cnt.clue - 1); Y.setRel(S, c, holder, 0.2, '口封じの一夜', c);
        drunk.splice(drunk.indexOf(holder), 1);
      }
      /* 探偵とバディ */
      drunk.filter(function (q) { return q.isDet && q.buddies && q.buddies.length; }).forEach(function (d) {
        var b = d.buddies.filter(function (x) { return drunk.indexOf(x) >= 0; })[0];
        if (b && rng() < 0.6 && can(d, b) && scenes < 4) pairScene('buddy', d, b, { d: d.name, b: b.name, sensei: Y.sensei ? Y.sensei(b, d) : '先生' }, '探偵と助手が、相棒の一線を越えた');
      });
      /* 関係のある人どうし：恋人・敵・片想い */
      drunk.slice().forEach(function (x) {
        if (drunk.indexOf(x) < 0 || scenes >= 4) return;
        var cand = drunk.filter(function (y) { return y !== x && can(x, y); });
        var lov = cand.filter(function (y) { return tie(x, y, 'lover,mate,fated,almost,fwb'); })[0];
        if (lov) return pairScene('lovers', x, lov, null, '恋人どうし（' + Y.relLabel(S, x, lov) + '）');
        /* 両片想い（どちらからも片想い）は、片想いより先に見る */
        var pn = Y.pining ? cand.filter(function (y) { return Y.pining(S, x, y); })[0] : null;
        if (pn && rng() < 0.8) return pairScene('pining', x, pn, null, x.name + 'と' + pn.name + 'の両片想いが、媚薬の勢いで溢れた（どちらも、自分だけの片想いだと思っていた）');
        var cr = cand.filter(function (y) { return !(Y.pining && Y.pining(S, x, y)) && (S.ties || []).some(function (t) { return t.type === 'crush' && t.a === x.i && t.b === y.i; }); })[0];
        if (cr && rng() < 0.7) return pairScene('crush', x, cr, null, x.name + 'の片想いが、媚薬の勢いで溢れた');
        var en = cand.filter(function (y) { return Y.bond(S, x, y) < -0.2; })[0];
        if (en && rng() < 0.5) return pairScene('enemies', x, en, null, '仲の悪い二人（' + Y.relLabel(S, x, en) + '）が、憎しみごと抱き合った');
      });
      /* 残った人どうし */
      while (drunk.length >= 2 && scenes < 4) {
        var x = drunk[0], y = drunk.slice(1).filter(function (q) { return can(x, q) || canFree(x, q); }).sort(function (a, b) { return Y.bond(S, x, b) - Y.bond(S, x, a); })[0];
        if (!y) { drunk.shift(); continue; }
        /* 乱交には、自分で攻めを選んだ人を入れない（誰に何をされるか分からない場面のため） */
        var gp = drunk.filter(function (q) { return !(HK.Pos && HK.Pos.hardTopIn(q, drunk)) && !(HK.State && !HK.State.r18ok(q)); });
        /* 恋愛・R18にしない組（HK.ngPair）は、同じ乱交の輪に入れない（入れる人が三人に満たなければ、二人の場面にする） */
        var gq = []; gp.forEach(function (q) { if (gq.every(function (z) { return !HK.ngPair(z, q); })) gq.push(q); }); gp = gq;
        if (gp.length >= 3 && rng() < lv * 0.5) { var g = gp.slice(0, Math.min(gp.length, 3 + Math.floor(rng() * 2))); ST.say(S, { actors: g, tag: '媚薬の夜', kind: 'climax', text: F(fp(S, g.every(function (q) { return HK.Pos && HK.Pos.isF(q); }) && Y.R18T && Y.R18T.ff ? Y.R18T.ff.group : PL('group', SC.group)), { p: P }) + (lwEro(S) ? groupEro(S, g, P) : HK.R18M ? HK.R18M.group(S, g) : ''), why: '媚薬の熱で、' + g.map(function (q) { return q.name; }).join('・') + 'が絡み合った', mag: 34 }); g.forEach(function (q) { drunk.splice(drunk.indexOf(q), 1); }); scenes++; continue; }
        pairScene('casual', x, y, null, '媚薬の熱（' + (Y.relLabel(S, x, y) || '関係なし') + '）');
      }
      /* 一人あぶれた人 */
      drunk.forEach(function (q) {
        /* R18に参加しない人は出さない。性行為の相手を「固定した相手だけ」にした人（noMob）は、使用人（モブ）の場面にしない */
        if (HK.State && !HK.State.r18ok(q)) return;
        if (q.noMob) return;
        if (rng() < 0.5) ST.sayB(S, { actors: [q], tag: '媚薬の夜', text: F(fp(S, PL('solo', SC.solo)), { a: q.name }) + (lwEro(S) ? soloEro(S, q) : HK.R18M ? HK.R18M.solo(S, q) : '') + (!lwEro(S) && lwHi(S) ? F(fp(S, Y_ERO.soloAgainN), { a: q.name }) : ''), why: '相手がいなかった' }, q.name + 'は一人で悶えた');
        else if (HK.Pos && HK.Pos.hardTopNpc ? HK.Pos.hardTopNpc(q) : hardTop(q)) ST.sayB(S, { actors: [q], tag: '媚薬の夜', text: F(fp(S, SERVANT_TOP), { a: q.name }) + (lwEro(S) ? topEro(S, q) : (HK.R18M ? HK.R18M.say(S, q, 'top') : '') + (lwHi(S) ? F(fp(S, Y_ERO.topAgain), { a: q.name }) : '')), why: '館の使用人が慰めに来たが、' + q.name + 'のほうが組み伏せた（受け攻めの指定：攻め）' }, q.name + 'は使用人と');
        else if (HK.Content && !HK.Content.ok(S, 'force')) return;
        else ST.sayB(S, { actors: [q], tag: '媚薬の夜', text: HK.JDark && HK.JDark.roll(S, q) ? HK.JDark.text(S, 'servant', q) : F(fp(S, PL('servant', SC.servant)), { a: q.name }) + (HK.R18M ? HK.R18M.npc(S, 'servant') + pz(S, q, 'react') + HK.R18M.moans(S, q, ['start', 'mid', 'climax']) : ''), why: '館の使用人に慰められた' }, q.name + 'は使用人と');
      });
      /* 正気の人が現場を守ると、手がかりは失われない */
      var gd = sober.filter(function (q) { return q.tr.caution + q.tr.cp > 0.9; })[0];
      if (gd && rng() < 0.35) {
        ST.say(S, { actors: [gd], tag: '見張り', text: F(fp(S, SC.guard), { a: gd.name }), why: gd.name + 'は酒を飲まず、現場を守った（慎重さ・CP）', mag: 26 });
        ST.say(S, { kind: 'phase', tag: '翌朝', text: F(fp(S, MORNING_SAFE), { a: gd.name }), why: '手がかりは失われなかった' });
      } else {
        var left = S.pool.filter(function (x) { return !x.found && !x.lost && !x.fake; });
        if (left.length > 1) left[0].lost = true;
        ST.say(S, { kind: 'phase', tag: '翌朝', text: fp(S, MORNING), why: '媚薬の夜のあと：手がかりが一つ失われ、翌日は酒の残った人の捜査が鈍る', mag: 20 });
      }
      live.forEach(function (q) { q.m.fear = Math.max(0, q.m.fear - 10); });
      return true;
    }
  };
  /* ---------- 犯人の凌辱・脅迫の夜（順168：ほかの夜の出来事と同じ濃さに） ----------
     導入 → 抵抗（R18M.resist）→ 行為（組ごと：Y.R18T.asl の mf・mm・ff・fm）→ 抗う様子（態度9種の force）・耐える声 →
     山場（受ける側の態度9種の peak）→ 喘ぎ（気の強い人は耐える声）→ 犯人の果て（組ごと）→（描写の有無「濃い」：もう一度）。結末の文は呼ぶ側で足す。
     向きは呼ぶ側で HK.Pos.order（犯人が攻めの組だけ）。性器なしの人がいる組（pos-nogen.js）は、組を問わない以前の文。
     描写の作風「男性向け」は、合意のない場面には使わない（tips の決まりどおり） */
  function aslKind(c, v) { return HK.NoGen && HK.NoGen.on(c, v) ? '' : mBody(c) ? (mBody(v) ? 'mm' : 'mf') : (mBody(v) ? 'fm' : 'ff'); }
  function assaultBody(S, c, v, intro, skipIntro) {
    var T = Y.R18T || {}, A = T.asl || {}, M = HK.R18M, mv = { c: c.name, v: v.name };
    var sep = HK.R18Thick && HK.R18Thick.on(S) ? '\n\n' : '', k = aslKind(c, v), P = A.peak || {};
    var per = (HK.personaOf ? HK.personaOf(v) : v.persona) || 'gentle', strong = !!(M && M.isStrong(v));
    var t = (skipIntro || !intro || !intro.length ? '' : F(fp(S, intro), mv)) + (M ? M.resist(S, c, v, { endure: false }) : '');
    t += sep + F(fp(S, A[k] || (isFF(c, v) && T.ff ? T.ff.assault : T.assault)), mv);
    if (!lwShort(S)) t += pz(S, v, 'force') + (M ? M.say(S, v, 'endure') : '');
    if (P[per] || P.gentle) t += sep + F(fp(S, P[per] || P.gentle), mv);
    if (M) t += M.say(S, v, strong ? 'endure' : 'climax');
    var fk = k === 'mf' || k === 'mm' ? 'm' : k;
    if (A.fin && A.fin[fk]) t += F(fp(S, A.fin[fk]), mv);
    if (lwHi(S) && A.again) t += sep + F(fp(S, A.again), mv) + (M ? M.say(S, v, 'endure') : '');
    return t;
  }
  /* ---------- 媚薬以外の夜の出来事（媚薬の夜でない夜に、1つ起きることがある） ----------
     凌辱（快楽殺人の犯人が無理やり）・吊り橋効果・犯人の脅し・大浴場・凍えた体を温め合う・取り調べでの誘惑
     起きても殺人は止まらない（false を返す）。凌辱のあと、そのまま殺されることもある */
  /* 体だけの夜の書き出し（{x}＝攻め、{y}＝受け。本番は SX） */
  var FREE_IN = ['吹雪の音が窓を叩いていた。廊下の暗がりで、{x}と{y}はすれ違いざまに目を合わせた。それだけで、行き先は決まった。', '眠れない夜だった。{x}が客室の扉を叩くと、{y}は何も訊かずに鍵を開けた。互いに欲しいものは、言わなくても分かっていた。', '暖炉の火が落ちた談話室に、二人だけが残っていた。{x}が立ち上がって{y}の手を引くと、{y}は黙ってついてきた。客室の扉が、静かに閉まった。'];
  Y.R18.extra = function (S, day) {
    var rng = S.rng, lv = S.env.ylewd / 100, c = S.cul, T = Y.R18T;
    if (!T || rng() > lv * 0.7) return false;
    var live = S.P.filter(function (q) { return Y.alive(q) && !q.bound; });
    if (live.length < 2) return false;
    function can(a, b) { return (!HK.canLove || HK.canLove(a, b)) && okP(a, b); }
    /* 犯人 c が攻めに回る組（凌辱・脅しは、犯人が攻めのときだけ） */
    function cTop(q) { return can(c, q) && od2(c, q)[0] === c; }
    function od(a, b) { return HK.Pos ? HK.Pos.order(a, b, [a, b]) : [a, b]; }
    function pairs(f) { var r = []; live.forEach(function (a) { live.forEach(function (b) { if (a.i < b.i && can(a, b) && f(a, b)) r.push([a, b]); }); }); return r; }
    var cOk = c && Y.alive(c) && !c.bound && !S.mot.nobody;
    var others = live.filter(function (q) { return q !== c && q !== S.acc && !q.locked; });
    var EV = [];
    /* 凌辱：快楽殺人の犯人だけ */
    if (cOk && S.mot.id === 'pleasure' && !HK.lockAny(c) && (!HK.Content || (HK.Content.ok(S, 'violence') && HK.Content.ok(S, 'force')))) {
      var vs = others.filter(function (q) { return cTop(q); });
      if (vs.length) EV.push({ w: 3 + c.tr.cold * 2, f: function () {
        var v = HK.weighted ? HK.weighted(rng, vs, function (q) { return 1 + q.m.fear / 50 + (q.tr.caution < 0.4 ? 1 : 0); }) : rng.pick(vs);
        var kill = S.kills.length < 5 && day <= S.env.days && rng() < 0.4 + c.tr.cold * 0.2;
        var mv = { c: c.name, v: v.name }, M = HK.R18M;
        /* たまに長い版（jashin-dark-thick.js）。結末（殺す／口をつぐむ）の文はそのまま続ける */
        var aLong = HK.JDark && HK.JDark.roll(S, v) ? HK.JDark.text(S, 'assault', v, c) + '\n\n' : '';
        var A = T.asl || {}, sep = HK.R18Thick && HK.R18Thick.on(S) ? '\n\n' : '';
        var t = (aLong || assaultBody(S, c, v, (T.assault_in || []).concat(A.inn || []))) + (aLong ? '' : sep) + F(fp(S, kill ? T.assault_kill.concat(A.kill || []) : T.assault_live.concat(A.live || [])), { c: c.name, v: v.name });
        ST.say(S, { actors: [c, v], tag: '凌辱', kind: 'climax', text: t, why: '快楽殺人の犯人' + c.name + 'が、' + v.name + 'を無理やり犯した（冷酷さ・衝動）。' + (kill ? 'そのまま殺した' : v.name + 'は恐怖で口をつぐんだ'), mag: 46 });
        Y.setRel(S, c, v, -0.8, '凌辱', c);
        if (kill) { S.forceTgt = v; S.forceWhy = '快楽殺人：' + v.name + 'を犯したあと、殺した'; }
        else { v.m.fear = Math.min(100, v.m.fear + 35); v.cnt.clue = Math.max(0, v.cnt.clue - 1); v.violated = true; }
      } });
    }
    /* 犯人の脅し：手がかりを掴んだ人を体で黙らせる（「合意のない展開」が入のときだけ） */
    if (cOk && (!HK.Content || HK.Content.ok(S, 'force'))) {
      var hs = others.filter(function (q) { return (q.cnt.clue > 0 || q.approached) && !q.isDet && cTop(q); });
      if (hs.length) EV.push({ w: 1 + c.tr.cold + (S.mot.id === 'pleasure' ? 1 : 0), f: function () {
        var v = hs.sort(function (a, b) { return b.cnt.clue - a.cnt.clue; })[0];
        /* 脅しの書き出し（気の強い人は食ってかかって黙らされる）のあとは、凌辱と同じ組み立て（assaultBody） */
        ST.say(S, { actors: [c, v], tag: '脅迫', kind: 'climax', text: assaultBody(S, c, v, T.blackmail, HK.R18M && HK.R18M.isStrong(v)), why:c.name + 'は、秘密に近づいた' + v.name + 'を脅し、体で黙らせた（' + v.name + 'は手がかりを口にできなくなる）', mag: 38 });
        v.approached = false; v.cnt.clue = Math.max(0, v.cnt.clue - 1); v.m.fear = Math.min(100, v.m.fear + 20);
        Y.setRel(S, c, v, -0.5, '脅迫', c);
      } });
    }
    /* 吊り橋効果：怖がっている二人 */
    var br = pairs(function (a, b) { return a.m.fear + b.m.fear > 80 && Y.bond(S, a, b) > -0.2; });
    if (br.length) EV.push({ w: 2, f: function () { var pr = rng.pick(br), o = od(pr[0], pr[1]);
      ST.say(S, { actors: o, tag: '吊り橋', kind: 'climax', text: F(fp(S, PLF('bridge', T.bridge, o[0], o[1])), { x: o[0].name, y: o[1].name }) + SX(S, o[0], o[1], 'love') + aft(S, o[1]), why: PW(S) + '恐怖の夜に、' + o[0].name + 'と' + o[1].name + 'が求め合った（恐怖 ' + Math.round(o[0].m.fear) + '・' + Math.round(o[1].m.fear) + '）', mag: 32 });
      o.forEach(function (q) { q.m.fear = Math.max(0, q.m.fear - 20); }); Y.setRel(S, o[0], o[1], 0.35, '吊り橋の一夜'); } });
    /* 大浴場で鉢合わせ */
    var bp = pairs(function (a, b) { return Y.bond(S, a, b) > -0.4; });
    if (bp.length) EV.push({ w: 1.2, f: function () { var pr = rng.pick(bp), o = od(pr[0], pr[1]);
      ST.say(S, { actors: o, tag: '大浴場', kind: 'climax', text: F(fp(S, PLF('bath', T.bath, o[0], o[1])), { x: o[0].name, y: o[1].name }) + SX(S, o[0], o[1], 'plain', false, ['tachi', 'taimen', 'haimen', 'kijo', 'kuchi', 'yubi']) + aft(S, o[1]), why: PW(S) + '夜の大浴場で、' + o[0].name + 'と' + o[1].name + 'が鉢合わせた', mag: 30 });
      Y.setRel(S, o[0], o[1], 0.25, '湯けむりの一夜'); } });
    /* 凍えた体を温め合う：捜索で外に出た二人 */
    var wp = pairs(function (a, b) { return Y.bond(S, a, b) > -0.1 && (a.tr.cp + b.tr.cp > 0.8 || a.isDet || b.isDet || a.role === 'butler' || b.role === 'butler'); });
    if (wp.length) EV.push({ w: 1, f: function () { var pr = rng.pick(wp), o = od(pr[0], pr[1]);
      ST.say(S, { actors: o, tag: '凍える夜', kind: 'climax', text: F(fp(S, PLF('warmth', T.warmth, o[0], o[1])), { x: o[0].name, y: o[1].name }) + SX(S, o[0], o[1], 'love', false, ['soku', 'taimen', 'seijo', 'haimen']) + aft(S, o[1]), why: PW(S) + '吹雪の中を捜索した' + o[0].name + 'と' + o[1].name + 'が、肌で温め合った', mag: 30 });
      Y.setRel(S, o[0], o[1], 0.3, '温め合った'); } });
    /* 体だけの夜：恋愛相手を固定し、性行為の相手を「誰とでも可」にした人と、固定外の相手（HK.State.freeSex。free-sex.js）。
       恋愛の条件（HK.canLove）は見ない。導入に「恋ではない」一文。固定した恋人が館にいれば ×0.3。恋人にはならない */
    var fp2 = []; live.forEach(function (a) { live.forEach(function (b) { if (a.i < b.i && HK.State.freeSex && HK.State.freeSex(S, a, b) && Y.bond(S, a, b) > -0.3) fp2.push([a, b]); }); });
    if (fp2.length) EV.push({ w: 2 * HK.FreeSex.factor(S, fp2[0][0], fp2[0][1]), f: function () { var pr = rng.pick(fp2), o = od(pr[0], pr[1]);
      ST.say(S, { actors: o, tag: '体だけの夜', kind: 'climax', text: HK.FreeSex.lead(S, pr[0], pr[1]) + F(fp(S, FREE_IN), { x: o[0].name, y: o[1].name }) + SX(S, o[0], o[1], 'plain') + aft(S, o[1]), why: PW(S) + HK.FreeSex.why(pr[0], pr[1]) + '／吹雪に閉ざされた夜', mag: 30 });
      Y.setRel(S, o[0], o[1], 0.15, '体だけの関係'); HK.FreeSex.mark(S, o[0], o[1]); HK.FreeSex.jealous(S, o[0], o[1]); } });
    /* 取り調べでの誘惑：疑われている人が、取り調べ役を落とす */
    var sus = live.filter(function (q) { return q.m.sus > 40 && q.tr.fc + (q.tr.lie || q.tr.a * 0.5 || 0) > 0.8; }).sort(function (a, b) { return b.m.sus - a.m.sus; })[0];
    if (sus) { var iv = live.filter(function (q) { return q !== sus && (q.isDet || q.tr.cp > 0.5) && can(sus, q); })[0];
      if (iv) EV.push({ w: 1.5 + (sus === c ? 1 : 0), f: function () {
        /* 疑われた人が攻めなら膝に座らせ、受けなら自分から跨る */
        var o4 = od2(sus, iv);
        ST.say(S, { actors: [sus, iv], tag: '誘惑の取り調べ', kind: 'climax', text: F(fp(S, T.interrogate.concat(T[o4[0] === sus ? 'interrogateT' : 'interrogateB'] || [])), { x: sus.name, y: iv.name }) + SX(S, o4[0], o4[1], 'plain', true), why: '疑われていた' + sus.name + 'が、取り調べ役の' + iv.name + 'を誘惑した（嘘・FC）。' + sus.name + 'への疑いが薄れる', mag: 34 });
        sus.m.sus = Math.max(0, sus.m.sus - 20); if (sus === c) S.fake++; if (iv.isDet) iv.seduced = true;
        Y.setRel(S, sus, iv, 0.25, '取り調べの夜', sus); } }); }
    if (!EV.length) return false;
    var tot = EV.reduce(function (a, e) { return a + e.w; }, 0), r = rng() * tot;
    for (var i = 0; i < EV.length; i++) { r -= EV[i].w; if (r <= 0) { EV[i].f(); break; } }
    if (i >= EV.length) EV[EV.length - 1].f();
    return false;
  };
})();
