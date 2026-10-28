/* 箱庭シミュレーター: 邪神村RTA（R18版のみ）― クライマックスの場所と関係の、成人向けの描写
   ・関係の出来事（jashin-place.js）：イゴーロナクに煽られた恋人の交わり／シュブ＝ニグラスの豊穣の宴
   ・場所ごとの眷属（鏡の先の異空間・婚礼の座敷・森の宴・貸本屋の書庫・廃劇場・岩礁・竹林の無音堂）。
     ほかの場所では、もとの洞窟の描写（solo-jashin-r18.js）を場所の語に置き換えて使う
   全年齢版ではこのファイルは読み込まれない。登場人物はすべて成人として扱う */
/* 出来事の一覧の印（hakoniwa-tools/build/event-catalog.js が数える。決まりは docs/reports/2026-10-28/event-catalog.md） */
/* @event scen=jashin id=js_climax_lover cat=夜 tie=lover tags=night label=イゴーロナクに煽られた恋人の交わり */
/* @event scen=jashin id=js_climax_mob cat=夜 tags=night,mob,force,preg cond=HK.Content.ok(S, 'force') HK.Content.ok(S, 'preg') label=場所ごとの眷属（異空間・婚礼の座敷・森の宴など） */
(function () {
  'use strict';
  var HK = window.HK, JS = HK.JASHIN, ST = HK.Story;
  if (!JS || !JS.R18 || !ST) return;
  function L(s) { return s.split('|'); }
  /* 一回の結果の中で同じ文を繰り返さない選び方（ero-kit.js の HK.Ero.fresh。使い切ったら、いちばん前に使ったものから戻す） */
  function fp(S, a) { return HK.Ero && HK.Ero.fresh ? HK.Ero.fresh(S, a, function (l) { return ST.pick(S, l); }) : ST.pick(S, a); }
  var M = function () { return HK.R18M; };

  var LUST = L('{x}は{y}を書架に押しつけ、服を引き裂くように剥ぎ取った。掌の口が{y}の肌のあちこちに吸いつき、{y}は仲間の目も構わずに声を上げた。|{x}は{y}を本の山の上に押し倒した。崩れた本のページが舞う中で、二人は獣のように互いを貪った。|{x}は{y}の手首を掴んで閲覧机に押し伏せた。掌の口に耳元で何かを囁かれるたび、{x}の腰は荒々しさを増し、{y}の声は書庫じゅうに響いた。');
  var FERTILE = L('宴の輪の真ん中で、{x}と{y}は、村人たちに囲まれて交わった。土が二人の下で脈打ち、甘い葡萄酒の雨が肌を濡らした。|葡萄酒を口移しで飲まされた{x}は、{y}を苔の上に押し倒した。宴の歌が、二人の腰の動きに合わせて高まっていった。|宴の焚き火の明かりの中で、{x}は{y}を抱き寄せた。村人たちの手拍子に急かされるように、二人は苔の上で何度も求め合った。');
  /* 女性どうしの豊穣の宴 */
  var FERTILE_FF = L('宴の輪の真ん中で、{x}と{y}は、村人たちに囲まれて肌を重ねた。土が二人の下で脈打ち、甘い葡萄酒の雨が肌を濡らした。{x}は濡れた{y}の胸に唇を寄せ、指を脚のあいだへ滑らせた。|葡萄酒を口移しで飲まされた{x}は、{y}を苔の上に押し倒した。宴の歌が高まるにつれて、二人は脚を絡め、互いの熱いところを擦り合わせた。|宴の焚き火の明かりの中で、{x}は{y}を抱き寄せた。村人たちの手拍子に急かされるように、{x}の指と舌が{y}の体じゅうを辿っていった。');
  var PREG = L('{y}の下腹に、熱いものが根を張る感覚があった。森の母が、{y}の中に仔を宿したのだった。|宴が静まったとき、{y}の下腹は、わずかに膨らんでいた。|宴のあと、{y}は下腹に手を当てて首をかしげた。そこには、自分のものではない鼓動が、かすかに響いていた。');

  /* 呼ぶ側（jashin-place.js）は、向きの決まる組（HK.Pos.okSex）のときだけ呼ぶ */
  JS.R18.climaxRel = function (S, kind, a, b) {
    JS.R18.spend(S, [a, b]);
    var R = M(), o = HK.Pos ? HK.Pos.order(a, b, [a, b]) : [a, b], X = o[0], Y = o[1], m = { x: X.name, y: Y.name };
    a.cnt.r18 = (a.cnt.r18 || 0) + 1; b.cnt.r18 = (b.cnt.r18 || 0) + 1;
    if (kind === 'fertile') {
      var fpool = JS.R18.ff(X, Y) ? FERTILE_FF.filter(function (x) { return (HK.Pos && HK.Pos.bothRiba && HK.Pos.bothRiba(X, Y)) || !/擦り合わせ/.test(x); }) : FERTILE;
      var t = ST.fmt(fp(S, fpool), m) + JS.R18.sex(S, X, Y, { mood: 'drug', fore: false });
      if ((!HK.Content || HK.Content.ok(S, 'preg')) && S.rng() < 0.6) { Y.preg = true; t += (HK.R18Thick && HK.R18Thick.on(S) ? '\n\n' : '') + ST.fmt(fp(S, PREG), m); }
      return t;
    }
    return ST.fmt(fp(S, LUST), m) + JS.R18.sex(S, X, Y, { mood: 'rough', fore: false }) + (HK.R18Thick && HK.R18Thick.on(S) ? '\n\n' : '') + '仲間が二人を引き剥がしたとき、' + X.name + 'の掌の口は、まだ物欲しげに開いたり閉じたりしていた。';
  };

  /* 場所ごとの眷属 */
  var PLACE = {
    mirror: L('鏡の中の{a}が、鏡の外へ手を伸ばしてきた。自分と同じ顔、同じ体の何かに組み敷かれ、{a}は自分の手で、自分の知らない場所を暴かれていった。|鏡の向こうから、{a}と同じ顔が微笑んだ。次の瞬間、{a}は鏡の中に引き込まれ、自分自身の手に、自分のいちばん弱いところを探り当てられていた。|合わせ鏡の奥から、何人もの{a}が這い出してきた。同じ顔の群れに囲まれ、{a}は自分の声で喘ぐ自分たちの中で、正気を手放していった。'),
    wedding: L('{a}は白無垢を着せられ、床入りの褥に横たえられた。綿帽子の下の何かが、{a}の裾を割り、冷たいものを奥まで沈めてきた。村人たちは、襖の向こうで祝いの謡を歌っていた。|祝言の盃を無理やり飲まされた{a}は、褥の上で帯を解かれた。顔の見えない婿の冷たい手が、花嫁の肌を一寸ずつ確かめていった。|三三九度の謡が終わると、襖が閉められた。暗い座敷で、{a}は婿とも神ともつかないものに、夜通し花嫁として扱われた。'),
    feast: L('宴の輪の村人たちが、{a}を苔の上に押し倒した。何本もの手と、獣のような腰が、代わる代わる{a}を貫いた。|葡萄酒の雨に濡れた{a}は、宴の輪の中心に引き込まれた。苔の上で何本もの腕に抱え込まれ、{a}は歌声の中で代わる代わる求められた。|黒山羊の面をつけた村人たちが、{a}の手足を押さえて苔に縫いとめた。土の匂いと獣の匂いの中で、{a}は宴の供物になった。'),
    books: L('書庫の本から這い出した掌の口が、{a}の体じゅうに吸いついた。{乳首}にも、脚のあいだにも。{a}は書架に縋りながら、何度も達した。|開いた頁から墨のような触手が伸び、{a}の手首を本棚に縛りつけた。文字が肌の上を這い、読まれるたびに{a}の体は熱く疼いた。|書架の隙間から伸びた何本もの手が、{a}の服を一枚ずつ剥いでいった。掌の口が囁く言葉に、{a}の体は勝手に応えていた。'),
    theater: L('{a}は舞台の上に引き出された。黄色い襤褸の役者が、台本どおりに{a}を床に組み伏せた。客席の観客たちは、身じろぎもせずにそれを見ていた。|幕が上がると、{a}は舞台の中央に縛られていた。黄衣の役者たちが代わる代わる{a}にのしかかり、客席から、乾いた拍手が湧いた。|台本の頁がめくられるたびに、{a}の衣装が一枚ずつ剥がされていった。最後の頁で、{a}は舞台の上で声を上げて果てた。'),
    reef: L('潮だまりから這い上がった深きものが、{a}を岩の上に押さえつけた。ぬめる鱗の腰が打ちつけられ、{a}の中に、冷たい卵のようなものが注ぎ込まれた。|満ち潮とともに、深きものの群れが{a}を岩場に引きずり上げた。冷たい水かきの手に体じゅうを撫で回され、{a}は波音の中で喘いだ。|岩礁の潮だまりに沈められた{a}の体に、ぬめる腕が何本も絡みついた。息継ぎのたびに、{a}の声は甘く崩れていった。'),
    temple: L('神殿の壁画から抜け出した触手が、{a}の手足を絡め取った。狂った角度の石段の上で、{a}は宙吊りのまま、奥の奥まで犯された。|狂った角度の回廊を逃げるうちに、{a}は同じ場所に戻されていた。壁から伸びた触手に絡め取られ、{a}は石の祭壇の上に横たえられた。|神殿の柱に刻まれた紋様が、{a}の肌に浮かび上がった。紋様が光るたびに、{a}の体は見えない何かに奥まで暴かれた。')
  };
  /* 人の形の相手が襲う場所（作風「男性向け」の行為は crowd の文。[行為の文の呼び方, 庇い展開の文の呼び方]）。ほかの場所は触手・眷属の文（cave） */
  var PLACE_MAN = { wedding: ['婿', '婿の一族'], feast: ['村人たち', '村人たち'], theater: ['役者たち', '役者たち'] };
  /* 竹林の無音堂（声を漏らせば消える） */
  var BAMBOO = L('竹林の闇から伸びた冷たい指が、{a}の服の下に滑り込んだ。声を出せば、消える。{a}は唇を噛み、奥まで探られるままに耐えた。|無音堂の床板が軋む音さえ、ここでは鳴らなかった。音のない闇の中で、何本もの指が{a}の体を開き、{a}は袖を噛んで息を殺した。|口を縫われた白い影が、{a}の背後から覆いかぶさってきた。耳元に吐息だけを感じながら、{a}は声を飲み込み、体の奥を探られ続けた。');
  var cave0 = JS.R18.cave;
  JS.R18.cave = function (S, live) {
    var PL = S.place, rng = S.rng, lv = JS.R18.lvMob ? JS.R18.lvMob(S) : S.env.jlewd / 100, R = M();
    if (HK.State) live = live.filter(HK.State.mobSexOk);
    if (HK.Content && !HK.Content.ok(S, 'force')) return;
    if (!PL || PL.id === 'cave' || (!PLACE[PL.id] && PL.id !== 'bamboo')) return cave0(S, live);
    /* 眷属に襲われるのは、攻めを選んでいない人だけ */
    live = live.filter(function (q) { return !(HK.Pos && HK.Pos.hardTopNpc ? HK.Pos.hardTopNpc(q) : JS.R18.hardTop(q)); });
    if (!live.length || rng() > lv * 0.6) return;
    var p = rng.pick(live); p.cnt.r18 = (p.cnt.r18 || 0) + 1;
    p.m.fear = Math.min(100, p.m.fear + 8);
    /* 無音堂：声を漏らせば消える */
    if (PL.id === 'bamboo') {
      var t = ST.fmt(fp(S, BAMBOO), { a: p.name });
      /* 作風「男性向け」：触手に弄ばれる段を足す（声を抑えた喘ぎ） */
      if (JS.R18.lwEro && JS.R18.lwEro(S)) t += JS.R18.lwSep(S) + JS.R18.eroBody(S, p, 'cave', true) + JS.R18.lwSep(S);
      if (rng() < 0.3 + (p.aphro ? 0.2 : 0) - p.tr.cp * 0.2) {
        JS.core.die(S, p, '無音堂で、声を漏らして', [t + (R ? R.say(S, p, 'climax') : '') + 'その声が、{a}の最後の声になった。']);
        return;
      }
      ST.say(S, { actors: [p], tag: PL.name, kind: 'climax', text: t + p.name + 'は、最後まで声を漏らさなかった。指が去ったあと、' + p.name + 'の唇には血が滲んでいた。', why: '無音堂の何かに弄ばれた。声を出さずに耐えた（CP）', mag: 28 });
      return;
    }
    /* 庇い展開（solo-jashin-r18.js の JS.R18.cover。身代わりが聞き入れられたら、襲われるのは庇った人） */
    var C = JS.R18.cover, man = !!PLACE_MAN[PL.id], cv = C ? C.tryIt(S, p, 'cave', man ? 'man' : 'kin', man ? PLACE_MAN[PL.id][1] : '眷属') : null, p0 = p;
    if (cv) C.pre(S, cv);
    if (cv && cv.eff === 'sub') { p = cv.r; p.cnt.r18 = (p.cnt.r18 || 0) + 1; p0.cnt.r18 = Math.max(0, p0.cnt.r18 - 1); }
    if ((!HK.Content || HK.Content.ok(S, 'preg')) && rng() < lv * 0.4) p.preg = true;
    /* 作風「男性向け」：場所の文を導入にして、眷属（人の形の相手は crowd）に犯される段を組む */
    var ero = JS.R18.lwEro && JS.R18.lwEro(S);
    var body = ero ? JS.R18.eroMob(S, p, man ? 'crowd' : 'cave', ST.fmt(fp(S, PLACE[PL.id]), { a: p.name, g: S.G.call }), man ? PLACE_MAN[PL.id][0] : null) : (R ? R.resist(S, 'god', p, { endure: false }) : '') + ST.fmt(fp(S, PLACE[PL.id]), { a: p.name, g: S.G.call }) + (R ? R.moans(S, p, ['mid', 'climax']) + R.npc(S, 'god', p) : '');
    ST.say(S, { actors: [p], tag: PL.name, kind: 'climax', text: body + (cv ? C.watch(S, cv) : '') + (p.preg ? (ero ? JS.R18.lwSep(S) : '') + '下腹に、熱いものが宿った感覚があった。' : ''), why: PL.name + 'の眷属に襲われた' + (p !== p0 ? '（' + p0.name + 'の身代わりになった）' : '') + (p.preg ? '（疑似妊娠）' : ''), mag: 26 });
    if (cv) { C.both(S, cv, PL.name, man ? 'crowd' : 'cave'); C.after(S, cv); }
  };
  /* 一回の中の性的な夜の上限（solo-jashin-r18.js の room）：眷属に襲われるのも、まだ余裕のある人だけ */
  var cave1 = JS.R18.cave;
  JS.R18.cave = function (S, live) {
    if (!JS.R18.room(S, [])) return;
    var n0 = S.log.length;
    cave1(S, live.filter(function (q) { return JS.R18.room(S, [q]); }));
    JS.R18.spendLog(S, n0);
  };
})();
