/* 箱庭シミュレーター: 邪神村RTA（R18版のみ）― 神ごとの夜の出来事
   ・シュブ＝ニグラス：実りの秋の収穫祭。葡萄酒と宴と、豊穣の母に捧げる交わりが、毎晩のように起きる
   ・イグ：夢の中で蛇に犯される。好きな人がラミア（下半身が大蛇の姿）になって迫ってくる
   ・チャウグナー・フォーン：チョー・チョー人の村人が残虐性をむき出しにして、参加者を襲う（無理やりの場面は抵抗と耐える声だけ）
   ・ほかの48柱：神ごとの夢・儀式・眷属・村人・憑依の夜（文は solo-jashin-r18-godnight.js、流れはこのファイルの godNight）
   全年齢版ではこのファイルは読み込まれない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, JS = HK.JASHIN, ST = HK.Story;
  if (!JS || !JS.R18 || !ST) return;
  function L(s) { return s.split('|'); }
  function M() { return HK.R18M; }
  function fmt(t, o) { return ST.fmt(t, o); }
  function ok(p, h, cd) { return p.lastNight == null || h - p.lastNight >= cd; }
  function mark(p, h) { p.lastNight = h; p.cnt.r18 = (p.cnt.r18 || 0) + 1; }
  function mates(S, p, live, h, cd) { return live.filter(function (q) { return q !== p && (!HK.State || HK.State.mobSexOk(q)) && JS.alive(q) && !q.bound && ok(q, h, cd) && (HK.canLove ? HK.canLove(p, q) && HK.canLove(q, p) : true) && JS.R18.okPair(p, q); }); }
  /* 自分で攻めを選んだ人（村人・眷属・神に「される」場面に入れない） */
  function top(p) { return JS.R18.hardTop(p); }

  /* ================= シュブ＝ニグラス ================= */
  var SHUB_FEAST = L('収穫祭の夜、広場の篝火のまわりで、葡萄酒の樽が次々と空けられた。酔った村人たちは、そのまま草の上で、相手を選ばずに抱き合い始めた。「＠豊穣の母さまは、子を宿す営みを、何よりお喜びになる」――{a}の杯にも、紫の酒がなみなみと注がれ、誰かの手が{a}の帯にかかった。|葡萄棚の下に、村人たちが筵を敷き詰めていた。熟れた房の甘い匂いの中で、何組もの男女が絡み合っていた。{a}は、葡萄酒で火照った体を、何本もの手に引き寄せられた。|収穫祭の宴の締めくくりに、篝火が一斉に落とされた。闇の中で、誰が誰とも分からない手が{a}を探り当て、葡萄酒の香りのする唇が、{a}の口を塞いだ。');
  var SHUB_WINE = L('酒蔵の奥で、村の{w}が{a}に、新酒を口移しで飲ませた。「＠今年の初物です。母さまの恵みは、体の奥まで染みますでしょう」――葡萄酒が喉を落ちていくたびに、{a}の体は熱くとろけていった。{w}は、{a}を樽の陰の藁の上に押し倒した。|利き酒だと誘われた蔵の二階で、{a}は村の{w}と二人きりになった。杯を重ねるうちに、{w}の指が{a}の膝を割り、甘く熟れた葡萄の粒を、{a}の肌に押しつけて潰した。滴る果汁を、{w}は舌で辿っていった。');
  var SHUB_PAIR = L('葡萄酒に酔った{x}と{y}は、宴を抜け出し、葡萄畑の奥へもつれ込んだ。熟れた房が二人の上でつぶれ、果汁が肌を伝った。{x}はその甘い滴を舐め取りながら、{y}を葡萄の褥に押し倒した。|収穫祭の篝火の明かりが届かない納屋で、{x}は{y}の着物の裾を割った。藁の匂いと葡萄酒の匂いの中で、二人は豊穣の母に捧げるように、何度も繋がった。|葡萄踏みの大桶に、{x}と{y}は着物のまま転がり落ちた。真っ赤な果汁にまみれた{y}の肌に、{x}が吸いついた。二人は桶の中で、果汁を跳ね上げながら交わった。');
  /* 女性どうしの収穫祭の夜 */
  var SHUB_PAIR_FF = L('葡萄酒に酔った{x}と{y}は、宴を抜け出し、葡萄畑の奥へもつれ込んだ。熟れた房が二人の上でつぶれ、果汁が肌を伝った。{x}はその甘い滴を舐め取りながら、{y}の脚のあいだへ顔を埋めていった。|収穫祭の篝火の明かりが届かない納屋で、{x}は{y}の着物の裾を割った。藁の匂いと葡萄酒の匂いの中で、{x}の指は、{y}が何度震えても止まらなかった。|葡萄踏みの大桶に、{x}と{y}は着物のまま転がり落ちた。真っ赤な果汁にまみれた{y}の肌に、{x}が吸いついた。二人は桶の中で脚を絡め、果汁を跳ね上げながら肌を擦り合わせた。');
  /* 自分で攻めを選んだ人の収穫祭：誘ってきた村人を、逆に組み伏せる */
  var SHUB_TOP = L('酒蔵の奥で、村の{w}が{a}に新酒を口移しで飲ませようとした。{a}は杯ごと{w}の手首を掴み、樽の陰の藁の上に押し倒した。「＠お、お客人……」――葡萄酒で濡れた{w}の肌に、{a}は夜明けまで痕を刻み続けた。|収穫祭の篝火が一斉に落とされた闇の中で、{a}の帯を探り当てた手があった。{a}はその手を捻り上げ、手の主の村の{w}を草の上に組み伏せた。豊穣の母に捧げる営みは、最後まで{a}の思うままに進んだ。|利き酒だと誘われた蔵の二階で、{a}は村の{w}と二人きりになった。膝に伸びてきた{w}の指を、{a}は掴んで止めた。「＠あ……」――{a}は熟れた葡萄の粒を{w}の肌で潰し、滴る果汁を舌で辿っていった。{w}の甘い声が、蔵の梁に響いた。');
  var SHUB_TOP_NPC = L('{w}は、{a}の下で身をよじり、葡萄酒の香りのする吐息を漏らした。|{w}は、{a}の肩にしがみついたまま、何度も豊穣の母の名を呼んだ。');
  var SHUB_GOAT_NO = L('葡萄畑の暗がりで、木だと思っていたものが身を起こした。黒い仔山羊の触手が{a}の手足に伸びてきたが、{a}は葡萄棚の支柱を引き抜いて叩き伏せ、蹄の音が遠ざかるまで一歩も退かなかった。|村の女たちが、{a}を森の石舞台へ連れていこうとした。「＠今年の母さまの器は、あなたよ」――{a}は女たちの手を振り払い、石舞台に描かれた紋を、葡萄酒の樽ごと蹴り崩した。');
  var SHUB_GOAT = L('葡萄畑の暗がりで、木だと思っていたものが身を起こした。黒い仔山羊の、縄のような触手が{a}の手足を絡め取り、熟れた果実のような匂いのする粘液を、{a}の肌に塗りつけた。触手は着物の下に潜り込み、{a}を、母の新しい器として満たしていった。|黒い仔山羊の幹に開いた口のひとつが、{a}の首筋に吸いついた。もう一本の触手が{a}の脚を押し開き、ゆっくりと奥へ入り込んだ。蹄の音が、{a}のまわりを、祝うように踏み鳴らしていた。');
  var SHUB_RITE = L('村の女たちが、{a}を森の石舞台へ連れていった。「＠今年の母さまの器は、あなたよ」石舞台の上に横たえられた{a}の下腹に、葡萄酒で紋が描かれた。森の闇の奥から、蹄の音が近づいてきた。|石舞台のまわりで、村人たちが豊穣の祝詞を唱えていた。{a}は葡萄の蔓で手足を舞台に括りつけられ、千の仔の母に捧げられた。闇の中から伸びてきたものは、温かく、湿っていて、果てしなく優しかった。');
  var SHUB_PREG = L('翌朝、{a}の下腹は、実った果実のように、ふっくらと膨らんでいた。村の女たちが、それを撫でて微笑んだ。「母さまの仔が、宿りなさった」|{a}の下腹の奥で、何かが、葡萄の房が揺れるように、ことりと動いた。');
  var W = ['娘', '若い衆', '女将', '杜氏'];
  function shub(S, p, live, h) {
    var rng = S.rng, lv = S.env.jlewd / 100, m = M();
    if (!ok(p, h, 6) || rng() > lv * (p.aphro ? 0.55 : 0.4)) return false;
    mark(p, h);
    var r = rng(), t, why, mag = 28, act = [p];
    var ms = mates(S, p, live, h, 6);
    if (r < 0.25 && ms.length) {
      var q = rng.pick(ms); mark(q, h); act = [p, q];
      var o = HK.Pos ? HK.Pos.order(p, q, [p, q]) : [p, q], X = o[0], Y = o[1];
      t = fmt(ST.pick(S, JS.R18.ff(X, Y) ? SHUB_PAIR_FF : SHUB_PAIR), { x: X.name, y: Y.name }) + JS.R18.sex(S, X, Y, { mood: 'drug', fore: false });
      if (rng() < 0.5) { Y.preg = true; t += (HK.R18Thick && HK.R18Thick.on(S) ? '\n\n' : '') + fmt(ST.pick(S, SHUB_PREG), { a: Y.name }); }
      why = '収穫祭の葡萄酒に酔い、参加者どうしで交わった' + (m && m.lastPos(S) ? '（' + m.lastPos(S) + '）' : '') + (Y.preg ? '（' + Y.name + 'が疑似妊娠した）' : '');
    } else if (top(p)) {
      /* 自分で攻めを選んだ人：誘ってきた村人を組み伏せるか、仔山羊・石舞台をはねのける */
      var w = rng.pick(HK.Pos && HK.Pos.isF(p) ? ['若い衆', '杜氏', '娘'] : W), wm = { a: p.name, w: w };
      if (r < 0.72) { t = fmt(ST.pick(S, SHUB_TOP), wm) + (m ? m.say(S, p, 'top') : '') + fmt(ST.pick(S, SHUB_TOP_NPC), { a: p.name, w: '村の' + w }); why = '収穫祭の夜。誘ってきた村人を、' + p.name + 'のほうが組み伏せた（受け攻めの指定：攻め）'; }
      else { t = fmt(ST.pick(S, SHUB_GOAT_NO), wm); why = '豊穣の母の器にされかけたが、' + p.name + 'ははねのけた'; mag = 22; }
    } else if (r < 0.5) {
      var others = ms.filter(function (q) { return rng() < 0.5 && !top(q); }).slice(0, 2);
      others.forEach(function (q) { mark(q, h); });
      act = [p].concat(others);
      t = fmt(ST.pick(S, SHUB_FEAST), { a: p.name }) + (others.length ? '篝火の向こうでは、' + others.map(function (q) { return q.name; }).join('と') + 'も、村人たちの輪に引き込まれていた。' : '') + (m ? m.npc(S, 'villager') + (others.length ? m.group(S, act) : m.moans(S, p, ['start', 'mid', 'climax'])) : '');
      why = '収穫祭の夜の交わり（豊穣の母に捧げる営み）' + (p.aphro ? '・媚薬と葡萄酒が回っていた' : '');
    } else if (r < 0.72) {
      t = fmt(ST.pick(S, SHUB_WINE), { a: p.name, w: rng.pick(W) }) + (m ? m.moans(S, p, ['start', 'mid', 'climax']) : '');
      why = '初物の葡萄酒で酔わされ、村人に抱かれた';
    } else if (r < 0.88) {
      var strong = m && m.isStrong(p);
      t = fmt(ST.pick(S, SHUB_GOAT), { a: p.name }) + (strong ? m.resist(S, 'god', p, { endure: false }) : '') + (m ? (strong ? m.say(S, p, 'endure') : m.moans(S, p, ['start', 'mid', 'climax'])) + m.npc(S, 'god', p) : '');
      if (rng() < 0.5) { p.preg = true; t += fmt(ST.pick(S, SHUB_PREG), { a: p.name }); }
      why = '黒い仔山羊に襲われた' + (p.preg ? '（疑似妊娠した）' : ''); mag = 30;
    } else {
      t = fmt(ST.pick(S, SHUB_RITE), { a: p.name }) + (m ? m.moans(S, p, ['start', 'mid', 'climax']) + m.npc(S, 'god', p) : '');
      p.preg = true; t += fmt(ST.pick(S, SHUB_PREG), { a: p.name });
      why = '豊穣の母の器として、石舞台に捧げられた（疑似妊娠した：生贄にされると巫女になりやすい）'; mag = 32;
    }
    ST.say(S, { actors: act, tag: '収穫祭の夜', kind: 'climax', text: t, why: why, mag: mag });
    return true;
  }

  /* ================= イグ ================= */
  var YIG_DREAM = L('夢の中で、{a}は蛇の巣穴の底に横たわっていた。何百匹もの蛇が、{a}の体の上を這い回り、手首に、足首に、首に巻きついて、{a}を地面に縫いとめた。一番太い一匹が、ゆっくりと{a}の脚のあいだへ頭を潜り込ませた。|夢の中で、{a}の布団の中に、冷たく重いものが滑り込んできた。大蛇だった。大蛇は{a}の体を締め上げ、二股の舌で{a}の肌をなぞり、ひくつく奥へ、鱗の擦れる音とともに入り込んできた。');
  var YIG_WAKE = L('目覚めると、{a}の手首と足首に、鱗の跡が赤く残っていた。|目覚めると、布団の中に、脱ぎ捨てられた大きな蛇の抜け殻があった。|目覚めた{a}の太腿の内側に、小さな二つの牙の跡があった。');
  var LAMIA = L('夜半、{a}の部屋の襖が開いた。入ってきたのは、{b}だった。――けれど、月明かりに浮かんだ{b}の下半身は、ぬめるような鱗に覆われた、長い大蛇の尾だった。{b}は、熱に浮かされたように囁いた。「ずっと、こうしたかった」{b}の尾が、{a}の体にゆっくりと巻きついていった。|{a}が目を覚ますと、{b}が枕元に座っていた。{b}の瞳は、蛇のように縦に裂けていた。腰から下は、畳の上をとぐろを巻く、太い大蛇の尾だった。{b}は二股に割れた舌で、{a}の唇を舐めた。「逃がさないよ」');
  var LAMIA_ACT = L('鱗の尾が{a}の両脚を絡め取り、押し開いた。{b}は{a}を尾で締め上げたまま、上からのしかかった。|尾の先が{a}の手首を頭の上でひとまとめに縛り上げ、{b}は、蛇が獲物を呑むように、ゆっくりと{a}を味わっていった。');
  /* 想う相手が受けの組：ラミアになった{b}を、{a}のほうが組み伏せる */
  var LAMIA_REV = L('鱗の尾が{a}の脚に絡みつこうとした。{a}はその尾を掴んで押さえつけ、逆に{b}を畳に組み伏せた。冷たい鱗の肌に指を這わせると、{b}は蛇のような細い声で鳴いた。|{a}は、唇を舐めてきた{b}の顎を掴み、深く口づけ返した。とぐろを巻く尾ごと{b}を抱きすくめ、{a}は人ではなくなった{b}の体を、隅々まで確かめていった。');
  /* 自分で攻めを選んだ人の蛇の夢：蛇をねじ伏せる */
  var YIG_DREAM_TOP = L('夢の中で、{a}は蛇の巣穴の底にいた。何百匹もの蛇が這い寄ってきたが、{a}は一番太い一匹の首を掴み、握り潰した。蛇たちは、恐れるように{a}から離れていった。|夢の中で、{a}の布団に冷たく重いものが滑り込んできた。大蛇だった。{a}はその頭を押さえつけ、逆に締め上げた。大蛇は身をよじり、やがて{a}の足元で、従うようにとぐろを巻いた。');
  var YIG_WAKE_TOP = L('目覚めると、{a}の掌に、鱗の跡が赤く残っていた。|目覚めると、布団の脇に、脱ぎ捨てられた大きな蛇の抜け殻があった。');
  var LAMIA_AFTER = L('朝、{b}は何も覚えていなかった。ただ、{a}の体じゅうに、鱗の擦れた赤い跡が残っていた。|夜明けとともに、{b}の尾は人の脚に戻っていた。{b}は自分の膝に残る鱗の欠片を見つめ、青ざめた。');
  function yig(S, p, live, h) {
    var rng = S.rng, lv = S.env.jlewd / 100, m = M();
    if (!ok(p, h, 8) || rng() > lv * (p.aphro ? 0.4 : 0.25)) return false;
    var lover = live.filter(function (q) { return q !== p && JS.alive(q) && !q.bound && JS.REL.bond(S, p, q) >= 0.35 && (HK.canLove ? HK.canLove(q, p) : true) && JS.R18.okPair(p, q); }).sort(function (a, b) { return JS.REL.bond(S, p, b) - JS.REL.bond(S, p, a); })[0];
    mark(p, h);
    var strong = m && m.isStrong(p);
    if (lover && rng() < 0.5) {
      /* 向きは受け攻めの指定どおり。ラミアの側が受けなら、{a}が尾ごと組み伏せる */
      var lo = HK.Pos ? HK.Pos.order(lover, p, [lover, p]) : [lover, p];
      if (lo[0] === p) {
        var tr = fmt(ST.pick(S, LAMIA), { a: p.name, b: lover.name }) + fmt(ST.pick(S, LAMIA_REV), { a: p.name, b: lover.name }) + (m ? m.say(S, p, 'top') + m.moans(S, lover, ['start', 'mid', 'climax']) : '') + fmt(ST.pick(S, LAMIA_AFTER), { a: p.name, b: lover.name });
        ST.say(S, { actors: [p, lover], tag: '蛇の夜', kind: 'climax', text: tr, why: '蛇の父の呪いで、' + p.name + 'の想う相手（' + lover.name + '）がラミアの姿になって迫ってきた。' + p.name + 'のほうが組み伏せた（受け攻めの指定）', mag: 32 });
        return true;
      }
      var t = fmt(ST.pick(S, LAMIA), { a: p.name, b: lover.name }) + (strong ? m.resist(S, { name: lover.name }, p, { endure: false }) : '') + fmt(ST.pick(S, LAMIA_ACT), { a: p.name, b: lover.name }) + (m ? m.say(S, lover, 'top') + (strong ? m.say(S, p, 'endure') : m.moans(S, p, ['start', 'mid', 'climax'])) + m.say(S, lover, 'topc') : '') + fmt(ST.pick(S, LAMIA_AFTER), { a: p.name, b: lover.name });
      ST.say(S, { actors: [p, lover], tag: '蛇の夜', kind: 'climax', text: t, why: '蛇の父の呪いで、' + p.name + 'の想う相手（' + lover.name + '）がラミアの姿になって迫ってきた', mag: 32 });
      return true;
    }
    if (top(p)) {
      ST.say(S, { actors: [p], tag: '蛇の夢', text: fmt(ST.pick(S, YIG_DREAM_TOP), { a: p.name }) + fmt(ST.pick(S, YIG_WAKE_TOP), { a: p.name }), why: '夢の中に蛇の父の眷属が現れたが、' + p.name + 'はねじ伏せた（受け攻めの指定：攻め）', mag: 22 });
      return true;
    }
    var t2 = fmt(ST.pick(S, YIG_DREAM), { a: p.name }) + (strong ? m.resist(S, 'god', p, { endure: false }) : '') + (m ? (strong ? m.say(S, p, 'endure') : m.moans(S, p, ['start', 'mid', 'climax'])) : '') + fmt(ST.pick(S, YIG_WAKE), { a: p.name });
    ST.say(S, { actors: [p], tag: '蛇の夢', kind: 'climax', text: t2, why: '夢の中で、蛇の父の眷属に犯された', mag: 28 });
    return true;
  }

  /* ================= チャウグナー・フォーン（チョー・チョー人の残虐） ================= */
  var TCHO = L('夜半、{a}の部屋に、子どものように小柄な村人たちが、音もなく入り込んできた。月明かりに、尖らせた歯が光った。|{a}は厠からの帰り、暗い廊下で、何本もの小さな手に足首を掴まれ、引き倒された。聞き慣れない言葉が、くすくすと笑い合っていた。|寺の裏に呼び出された{a}を、小柄な村人たちが取り囲んだ。誰もが老人の顔をしていて、誰もが笑っていた。');
  var TCHO_ACT = L('村人たちは{a}の手足を縄で寺の柱に括りつけ、交代で{a}を犯した。順番を待つ者たちは、{a}の肩や脇腹に、尖った歯を立てて血を舐めていた。|村人の一人が{a}の髪を掴んで床に押しつけ、もう一人が背後からのしかかった。{a}が身をよじるたびに、別の誰かが、面白がって{a}の太腿に噛みついた。|村人たちは{a}を象の神の仏像の前に引きずり出し、その足元で{a}を組み敷いた。仏像の鼻がゆっくりと下りてきて、{a}の首筋から血を啜るあいだ、村人たちは代わる代わる{a}を貫き続けた。');
  var TCHO_AFTER = L('夜明け前、村人たちは満足げに去っていった。{a}の体には、無数の歯形が残っていた。|朝、{a}は寺の柱に括りつけられたまま見つかった。肩には、肉を食いちぎられた跡があった。|村人たちは去り際に、{a}の頬を撫でて、聞き慣れない言葉で何か言った。それが「次は食べる」という意味だと、{a}には、なぜか分かった。');
  /* 自分で攻めを選んだ人は、取り囲まれても組み敷かれない（叩き伏せて追い払う） */
  var TCHO_TOP = L('夜半、{a}の部屋に、子どものように小柄な村人たちが、音もなく入り込んできた。{a}は掴みかかってきた一人の首根っこを掴んで畳に叩きつけ、もう一人の腕を捻り上げた。村人たちは尖った歯を剥いて唸ったが、{a}が一歩も退かないと分かると、くすくす笑いながら闇に溶けていった。|寺の裏に呼び出された{a}を、小柄な村人たちが取り囲んだ。{a}は伸びてきた手を払いのけ、先頭の一人を寺の柱に押しつけた。「次に触ったら、折る」――村人たちは顔を見合わせ、聞き慣れない言葉で何か言い交わして、引き下がった。');
  function chaugnar(S, p, live, h) {
    var rng = S.rng, lv = S.env.jlewd / 100, m = M();
    if (!ok(p, h, 10) || rng() > lv * (0.18 + S.hostile / 400)) return false;
    mark(p, h);
    if (top(p)) {
      p.m.hp = Math.max(0, p.m.hp - 6); p.m.fear = Math.min(100, p.m.fear + 10);
      ST.say(S, { actors: [p], tag: 'チョー・チョー人の夜', text: fmt(ST.pick(S, TCHO_TOP), { a: p.name }), why: 'チョー・チョー人の村人たちが襲ってきたが、' + p.name + 'は叩き伏せて追い払った（体力−6・恐怖＋10）', mag: 26 });
      return true;
    }
    var t = fmt(ST.pick(S, TCHO), { a: p.name }) + (m ? m.resist(S, 'crowd', p, { endure: false }) : '') + fmt(ST.pick(S, TCHO_ACT), { a: p.name }) + (m ? m.say(S, p, 'endure') : '') + fmt(ST.pick(S, TCHO_AFTER), { a: p.name });
    p.m.hp = Math.max(0, p.m.hp - 18); p.m.fear = Math.min(100, p.m.fear + 22);
    ST.say(S, { actors: [p], tag: 'チョー・チョー人の夜', kind: 'climax', text: t, why: '象の神を奉じるチョー・チョー人の村人たちが、残虐性をむき出しにして襲ってきた（体力−18・恐怖＋22）', mag: 34 });
    return true;
  }

  /* ================= ほかの神々（文は solo-jashin-r18-godnight.js の JS.R18GN） =================
     起こり方は上の3柱と同じ：「夜の出来事（R18）」の設定と媚薬で起きやすさが変わる。きっかけ（夢・儀式・眷属・村人・憑依）は文の頭の一字。
     ・自分で攻めを選んだ人：寄ってきた村人・眷属を逆に組み伏せるか、はねのける（受ける側にしない）
     ・参加者どうし（その神に「二人の夜」があるときだけ）：神の気配に当てられた二人。導入は性別を問わない書き方で、
       そのあとに 男性が攻め／女性どうし／女性が攻め×男性 の別の文を挟み、体の描写は共通の交わり（R18M・r18-thick）に任せる
     ・受ける夜：強気な人（R18M.isStrong）や素面の人は抗い（resist → 耐える声）、媚薬の回った気の弱い人は喘ぎ。態度9種ごとの反応（GP）を挟む */
  /* 態度9種：人ではないもの（神・眷属・神に憑かれた村人）に触れられたときの反応。{a}=本人。甘く書かない */
  var GP = {
    proud: L('{a}は人ではないものを睨み据え、最後まで目を逸らさなかった。逸らさなかった目の縁に、悔し涙が滲んでいた。|{a}は歯を食いしばり、こんなものに屈してたまるかと身をよじった。体のほうが先に、その意地を裏切った。|{a}は、自分の体が勝手に応えていくのを、屈辱に顔を歪めて見ていることしかできなかった。'),
    stern: L('{a}は「これは現実ではない」と自分に言い聞かせ、呼吸を数えて耐えようとした。数は、途中で分からなくなった。|{a}は唇を真一文字に結び、声を漏らすまいとした。異様な感触が、規律の隙間から{a}を崩していった。|{a}は最後まで背筋を伸ばそうとした。人ではないものの手は、その背を、ゆっくりとしならせていった。'),
    tsun: L('{a}は「こんなの、ぜんぜん平気」と震える声で言い張った。強がりの続きは、引きつった息に呑まれた。|{a}は涙目で相手を睨み、「触んないで」と繰り返した。繰り返すほど、声は細く崩れていった。|{a}は意地でも泣くまいとした。泣くまいとした顔が、くしゃりと歪んだ。'),
    gentle: L('{a}は押し返そうとした手を、怯えて途中で止めてしまった。人ではないものの冷たさが、その手首を包んだ。|{a}は震えながら、「仲間には、手を出さないで」とだけ頼んだ。返事はなかった。|{a}は声を殺して泣いた。泣きながら、ただ早く終わることだけを祈っていた。'),
    devoted: L('{a}は「私が耐えれば、皆は助かる」と自分に言い聞かせ、目を閉じた。閉じた瞼が、ずっと震えていた。|{a}は誰かの名前を呼びかけて、口をつぐんだ。助けを呼べば、その人が巻き込まれる気がした。|{a}は祈るように指を組んだ。組んだ指は、途中でほどけてしまった。'),
    cool: L('{a}はそれが何なのかを観察しようとした。観察するほど、理屈の通じない感触に、思考が削られていった。|{a}は「幻覚だ」と短く呟いた。幻覚にしては、肌に残る冷たさが生々しすぎた。|{a}は表情一つ変えまいとした。乱れていく呼吸だけが、平静を裏切っていた。'),
    free: L('{a}は最初、怖さを笑い飛ばそうとした。笑い声は、人ではないものの感触に、すぐ凍りついた。|{a}は軽口を叩こうとして、声が出ないことに気づいた。初めて、本当に怖いと思った。|{a}は身をよじって逃げようとした。いつもの身軽さが、まるで嘘のように体が動かなかった。'),
    shy: L('{a}は声も出せずに、ただ身を縮めていた。見られることも、触れられることも、何もかもが怖かった。|{a}は両腕で顔を隠した。隠せたのは、顔だけだった。|{a}の拒む声は、蚊の鳴くように小さかった。人ではないものには、届きもしなかった。'),
    polite: L('{a}は「お、おやめください」と最後まで丁寧に頼んだ。丁寧な言葉は、途中から言葉にならなくなった。|{a}は乱れまいと居住まいを正そうとしたが、異様な力に押さえつけられて、それも叶わなかった。|{a}は「どうか、ご容赦を」と震える声で繰り返した。神には、人の作法は通じなかった。')
  };
  function gp(S, p) { var t = GP[(HK.personaOf ? HK.personaOf(p) : p.persona) || 'gentle'] || GP.gentle; return fmt(ST.pick(S, t), { a: p.name }); }
  /* きっかけごとの言い方（理由の欄）と、媚薬が回っていたときの書き出し */
  var KIND = { d: '夢の中で', r: '村の儀式で', b: '眷属に襲われ', v: '村人たちに襲われ', p: '神に取り憑かれ' };
  var G_DRUG = L('{a}の体には、昼間に盛られた薬の熱がまだ残っていた。|媚薬の熱が引かないまま、{a}は寝つけずにいた。|{a}は火照る体を持て余し、何度も寝返りを打っていた。');
  /* どの神にも使う翌朝（神ごとの文に混ぜる） */
  var G_AFTER = L('翌朝、{a}は自分の体を何度も洗った。洗っても洗っても、{g}の気配が肌の下に残っている気がした。|{a}はその日、誰とも口をきかなかった。仲間が肩に触れると、びくりと身をすくませた。|朝の光の中で、{a}は昨夜のことが本当にあったのか分からなくなっていた。体の芯に残る鈍い痛みだけが、夢ではないと告げていた。');
  /* どの神にも使う、攻めの人の夜（x=組み伏せる n=はねのける） */
  var G_TOP = L('n:{a}は闇の中から伸びてきた{g}の気配を、真正面から睨み返した。気配はしばらく{a}のまわりを這い回っていたが、やがて諦めたように引いていった。|n:夜半、{a}の枕元に人ではないものが立った。{a}は起き上がって明かりを点け、それが消えるまで黙って見据え続けた。|x:{a}の寝所に忍び込んできたのは、{g}に心を奪われた村人だった。{a}はその腕を捻り上げて布団に押さえつけ、主導権を一度も渡さないまま、相手が神の名を呼ぶのも忘れるまで責め立てた。');
  var G_TOPNPC = L('村人は、{a}の下で荒い息を吐き、神の名ではなく{a}の名を呼んだ。|相手は、{a}の腕の中で何度も身を震わせ、やがてぐったりと力を抜いた。|人の形をしたそれは、{a}の下で、聞いたことのない声で細く鳴いた。');
  var G_PREG = L('翌朝、{a}の下腹が、わずかに張っていた。村の老婆が手を当てて頷いた。「＠神さまの御子が、宿りなさった」|{a}の下腹の奥で、何かがことりと動いた。{a}は、その感触を誰にも言えなかった。|{a}の下腹に、昨夜まではなかった紋様が浮かんでいた。村人たちは、それを見て目を細めた。');
  /* 参加者どうし：神ごとの導入のあとに挟む、性別の組ごとの文（{x}=攻め {y}=受け {g}=神） */
  var G_PAIR = {
    m: L('{x}は{y}を布団に横たえ、熱に浮かされたように肌を重ねていった。{g}の気配が、二人の上に重くのしかかっていた。|{x}は{y}の浴衣をはだけさせ、首筋から胸へ唇を落としていった。{y}は拒まず、{x}の背に腕を回した。|二人は言葉も交わさずに抱き合った。{x}が{y}の脚を割り、ゆっくりと腰を進めていくあいだ、障子の外で何かが息を潜めていた。'),
    ff: L('{x}は{y}を布団に横たえ、浴衣の合わせから手を差し入れた。指先が胸を、腹を、ゆっくりと下っていった。|{x}は{y}の耳元に唇を寄せ、熱い息を吹きかけながら、太腿の内側を指でなぞった。{y}の膝が、震えながら開いていった。|二人は脚を絡め、互いの肌の熱を確かめ合った。{x}の舌が{y}の鎖骨をなぞるたび、{y}は小さく息を呑んだ。'),
    fm: L('{x}は{y}を布団の上に仰向けにさせ、その腰の上に跨った。見下ろす{x}の目は、{g}の夜の熱に濡れていた。|{x}は{y}の両手首を枕元に押さえ、自分から腰を沈めていった。{y}は息を詰め、{x}の動きにただ翻弄された。|{x}は{y}の胸に手をついて跨り、ゆっくりと自分の中へ導いた。主導権は、最初から最後まで{x}の手の中にあった。')
  };
  function kindOf(s) { var m = /^([a-z]):/.exec(s); return m ? { k: m[1], t: s.slice(2) } : { k: 'v', t: s }; }
  function godNight(S, p, live, h) {
    var GD = JS.R18GN && JS.R18GN[S.G.id];
    if (!GD) return false;
    var rng = S.rng, lv = S.env.jlewd / 100, m = M(), g = S.G.call;
    if (!ok(p, h, 10) || rng() > lv * (p.aphro ? 0.3 : 0.16)) return false;
    mark(p, h);
    var r = rng(), ms = mates(S, p, live, h, 10), am = { a: p.name, g: g };
    /* 参加者どうし */
    if (GD.P.length && ms.length && r < 0.28) {
      var q = rng.pick(ms); mark(q, h);
      var o = HK.Pos ? HK.Pos.order(p, q, [p, q]) : [p, q], X = o[0], Y = o[1], Pz = HK.Pos;
      var ck = Pz && Pz.ff(X, Y) ? 'ff' : Pz && Pz.isF(X) && !Pz.isF(Y) ? 'fm' : 'm', xm = { x: X.name, y: Y.name, g: g };
      var t = fmt(ST.pick(S, GD.P), xm) + fmt(ST.pick(S, G_PAIR[ck]), xm) + JS.R18.sex(S, X, Y, { mood: 'drug', fore: false });
      if (GD.preg && rng() < GD.preg) { Y.preg = true; t += (HK.R18Thick && HK.R18Thick.on(S) ? '\n\n' : '') + fmt(ST.pick(S, G_PREG), { a: Y.name }); }
      if (JS.R18.pz && rng() < 0.5) t += (HK.R18Thick && HK.R18Thick.on(S) ? '\n\n' : '') + JS.R18.pz(S, Y, 'mutual');
      ST.say(S, { actors: [X, Y], tag: GD.tag, kind: 'climax', text: t, why: GD.who + 'の気配に当てられ、参加者どうしで交わった' + (m && m.lastPos(S) ? '（' + m.lastPos(S) + '）' : '') + (Y.preg ? '（' + Y.name + 'が疑似妊娠した）' : ''), mag: 30 });
      return true;
    }
    /* 自分で攻めを選んだ人 */
    if (top(p)) {
      var tp = kindOf(ST.pick(S, GD.T.concat(G_TOP)));
      var tt = fmt(tp.t, am);
      if (tp.k === 'x') tt += (m ? m.say(S, p, 'top') : '') + fmt(ST.pick(S, G_TOPNPC), am);
      var to = { actors: [p], tag: GD.tag, text: tt, why: tp.k === 'x' ? GD.who + 'の夜。寄ってきた相手を、' + p.name + 'のほうが組み伏せた（受け攻めの指定：攻め）' : GD.who + 'が迫ってきたが、' + p.name + 'ははねのけた（受け攻めの指定：攻め）', mag: tp.k === 'x' ? 26 : 20 };
      if (tp.k === 'x') to.kind = 'climax';
      ST.say(S, to);
      return true;
    }
    /* 受ける夜 */
    var pt = kindOf(ST.pick(S, GD.N)), part = pt.t.split('／'), dream = pt.k === 'd';
    var strong = m && m.isStrong(p), fight = m && !dream && (strong || !p.aphro);
    /* 夢の文の最後の「目覚めると〜」は、喘ぎと反応のあとへ回す */
    var act = part[1] || '', wi = Math.max(act.lastIndexOf('。目覚め'), act.lastIndexOf('。目が覚め')), wake = '';
    if (wi >= 0) { wake = act.slice(wi + 1); act = act.slice(0, wi + 1); }
    var t2 = (p.aphro && rng() < 0.6 ? fmt(ST.pick(S, G_DRUG), am) : '') + fmt(part[0], am) + (fight ? m.resist(S, pt.k === 'v' ? 'crowd' : 'god', p, { endure: false }) : '') + fmt(act, am) + (pt.k === 'v' && JS.R18.pz ? JS.R18.pz(S, p, 'react') : gp(S, p));
    if (m) t2 += (fight ? m.say(S, p, 'endure') : m.moans(S, p, dream ? ['mid', 'climax'] : ['start', 'mid', 'climax'])) + m.npc(S, pt.k === 'v' ? 'villager' : 'god', p);
    t2 += fmt(wake, am);
    if (GD.preg && rng() < GD.preg * (0.5 + lv * 0.5)) { p.preg = true; t2 += fmt(ST.pick(S, G_PREG), am); }
    t2 += fmt(ST.pick(S, GD.A.concat(G_AFTER)), am);
    var fear = dream ? 8 : 14, hurt = dream ? 0 : 4;
    p.m.fear = Math.min(100, p.m.fear + fear); p.m.hp = Math.max(0, p.m.hp - hurt);
    ST.say(S, { actors: [p], tag: GD.tag, kind: 'climax', text: t2, why: KIND[pt.k] + '、' + GD.who + 'に体を弄ばれた' + (fight ? '（抗った）' : p.aphro ? '（媚薬が回っていた）' : '') + (p.preg ? '（疑似妊娠した：生贄にされると巫女になりやすい）' : '') + '（恐怖＋' + fear + (hurt ? '・体力−' + hurt : '') + '）', mag: dream ? 26 : 30 });
    return true;
  }

  var GODR = { shub: shub, yig: yig, chaugnar: chaugnar };
  var base = JS.R18.night;
  JS.R18.night = function (S, p, live, h) {
    /* R18に参加しない人は夜に出ない。「恋人だけ」の人は神の夜には進まず、住人どうしの夜（base）だけ */
    if (HK.State && !HK.State.r18ok(p)) return false;
    if (p.noMob) return base(S, p, live, h);
    var f = GODR[S.G.id] || godNight;
    if (f(S, p, live, h)) return true;
    return base(S, p, live, h);
  };
})();
