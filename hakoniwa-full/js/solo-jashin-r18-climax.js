/* 箱庭シミュレーター: 邪神村RTA（R18版のみ）― クライマックスの場所と関係の、成人向けの描写
   ・関係の出来事（jashin-place.js）：イゴーロナクに煽られた恋人の交わり／シュブ＝ニグラスの豊穣の宴
   ・場所ごとの眷属（鏡の先の異空間・婚礼の座敷・森の宴・貸本屋の書庫・廃劇場・岩礁・竹林の無音堂）。
     ほかの場所では、もとの洞窟の描写（solo-jashin-r18.js）を場所の語に置き換えて使う
   全年齢版ではこのファイルは読み込まれない。登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, JS = HK.JASHIN, ST = HK.Story;
  if (!JS || !JS.R18 || !ST) return;
  function L(s) { return s.split('|'); }
  var M = function () { return HK.R18M; };

  var LUST = L('{x}は{y}を書架に押しつけ、服を引き裂くように剥ぎ取った。掌の口が{y}の肌のあちこちに吸いつき、{y}は仲間の目も構わずに声を上げた。|{x}は{y}を本の山の上に押し倒した。崩れた本のページが舞う中で、二人は獣のように互いを貪った。');
  var FERTILE = L('宴の輪の真ん中で、{x}と{y}は、村人たちに囲まれて交わった。土が二人の下で脈打ち、甘い葡萄酒の雨が肌を濡らした。|葡萄酒を口移しで飲まされた{x}は、{y}を苔の上に押し倒した。宴の歌が、二人の腰の動きに合わせて高まっていった。');
  /* 女性どうしの豊穣の宴 */
  var FERTILE_FF = L('宴の輪の真ん中で、{x}と{y}は、村人たちに囲まれて肌を重ねた。土が二人の下で脈打ち、甘い葡萄酒の雨が肌を濡らした。{x}は濡れた{y}の胸に唇を寄せ、指を脚のあいだへ滑らせた。|葡萄酒を口移しで飲まされた{x}は、{y}を苔の上に押し倒した。宴の歌が高まるにつれて、二人は脚を絡め、互いの熱いところを擦り合わせた。');
  var PREG = L('{y}の下腹に、熱いものが根を張る感覚があった。森の母が、{y}の中に仔を宿したのだった。|宴が静まったとき、{y}の下腹は、わずかに膨らんでいた。');

  /* 呼ぶ側（jashin-place.js）は、向きの決まる組（HK.Pos.okSex）のときだけ呼ぶ */
  JS.R18.climaxRel = function (S, kind, a, b) {
    var R = M(), o = HK.Pos ? HK.Pos.order(a, b, [a, b]) : [a, b], X = o[0], Y = o[1], m = { x: X.name, y: Y.name };
    a.cnt.r18 = (a.cnt.r18 || 0) + 1; b.cnt.r18 = (b.cnt.r18 || 0) + 1;
    if (kind === 'fertile') {
      var t = ST.fmt(ST.pick(S, JS.R18.ff(X, Y) ? FERTILE_FF : FERTILE), m) + JS.R18.sex(S, X, Y, { mood: 'drug', fore: false });
      if (S.rng() < 0.6) { Y.preg = true; t += (HK.R18Thick && HK.R18Thick.on(S) ? '\n\n' : '') + ST.fmt(ST.pick(S, PREG), m); }
      return t;
    }
    return ST.fmt(ST.pick(S, LUST), m) + JS.R18.sex(S, X, Y, { mood: 'rough', fore: false }) + (HK.R18Thick && HK.R18Thick.on(S) ? '\n\n' : '') + '仲間が二人を引き剥がしたとき、' + X.name + 'の掌の口は、まだ物欲しげに開いたり閉じたりしていた。';
  };

  /* 場所ごとの眷属 */
  var PLACE = {
    mirror: L('鏡の中の{a}が、鏡の外へ手を伸ばしてきた。自分と同じ顔、同じ体の何かに組み敷かれ、{a}は自分の手で、自分の知らない場所を暴かれていった。'),
    wedding: L('{a}は白無垢を着せられ、床入りの褥に横たえられた。綿帽子の下の何かが、{a}の裾を割り、冷たいものを奥まで沈めてきた。村人たちは、襖の向こうで祝いの謡を歌っていた。'),
    feast: L('宴の輪の村人たちが、{a}を苔の上に押し倒した。何本もの手と、獣のような腰が、代わる代わる{a}を貫いた。'),
    books: L('書庫の本から這い出した掌の口が、{a}の体じゅうに吸いついた。乳首にも、脚のあいだにも。{a}は書架に縋りながら、何度も達した。'),
    theater: L('{a}は舞台の上に引き出された。黄色い襤褸の役者が、台本どおりに{a}を床に組み伏せた。客席の観客たちは、身じろぎもせずにそれを見ていた。'),
    reef: L('潮だまりから這い上がった深きものが、{a}を岩の上に押さえつけた。ぬめる鱗の腰が打ちつけられ、{a}の中に、冷たい卵のようなものが注ぎ込まれた。'),
    temple: L('神殿の壁画から抜け出した触手が、{a}の手足を絡め取った。狂った角度の石段の上で、{a}は宙吊りのまま、奥の奥まで犯された。')
  };
  var cave0 = JS.R18.cave;
  JS.R18.cave = function (S, live) {
    var PL = S.place, rng = S.rng, lv = S.env.jlewd / 100, R = M();
    if (!PL || PL.id === 'cave' || (!PLACE[PL.id] && PL.id !== 'bamboo')) return cave0(S, live);
    /* 眷属に襲われるのは、攻めを選んでいない人だけ */
    live = live.filter(function (q) { return !JS.R18.hardTop(q); });
    if (!live.length || rng() > lv * 0.6) return;
    var p = rng.pick(live); p.cnt.r18 = (p.cnt.r18 || 0) + 1;
    p.m.fear = Math.min(100, p.m.fear + 8);
    /* 無音堂：声を漏らせば消える */
    if (PL.id === 'bamboo') {
      var t = '竹林の闇から伸びた冷たい指が、' + p.name + 'の服の下に滑り込んだ。声を出せば、消える。' + p.name + 'は唇を噛み、奥まで探られるままに耐えた。';
      if (rng() < 0.3 + (p.aphro ? 0.2 : 0) - p.tr.cp * 0.2) {
        JS.core.die(S, p, '無音堂で、声を漏らして', [t + (R ? R.say(S, p, 'climax') : '') + 'その声が、{a}の最後の声になった。']);
        return;
      }
      ST.say(S, { actors: [p], tag: PL.name, kind: 'climax', text: t + p.name + 'は、最後まで声を漏らさなかった。指が去ったあと、' + p.name + 'の唇には血が滲んでいた。', why: '無音堂の何かに弄ばれた。声を出さずに耐えた（CP）', mag: 28 });
      return;
    }
    if (rng() < lv * 0.4) p.preg = true;
    ST.say(S, { actors: [p], tag: PL.name, kind: 'climax', text: (R ? R.resist(S, 'god', p, { endure: false }) : '') + ST.fmt(ST.pick(S, PLACE[PL.id]), { a: p.name, g: S.G.call }) + (R ? R.moans(S, p, ['mid', 'climax']) + R.npc(S, 'god', p) : '') + (p.preg ? '下腹に、熱いものが宿った感覚があった。' : ''), why: PL.name + 'の眷属に襲われた' + (p.preg ? '（疑似妊娠）' : ''), mag: 26 });
  };
})();
