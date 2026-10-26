/* 箱庭シミュレーター: 邪神村RTA ― 役割「無能」
   推理・調べる力はほぼゼロ（jashin.js の skill）。手がかりを集める代わりに、自分の目標ばかり追いかけて空回りし、場をかき乱す。
   関係が敵対的な相手（敵・不仲・ライバル）の足を強烈に引っ張り、自分が死ぬときは、その相手を巻き添えにしやすい。
   {a}=無能の住人 {b}=足を引っ張られる相手 {g}=目標 */
(function () {
  'use strict';
  var HK = window.HK, JS = HK.JASHIN;
  if (!JS || !JS.core) return;
  var ST = HK.Story, L = function (s) { return s.split('|'); };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  var FLUB = L('{a}は「犯人が分かった！｜＝｜犯人が分かりました！」と叫んで村の祠に駆け込み、供え物をひっくり返した。村人たちの目つきが変わった。|{a}は手がかりを探すと言って、皆がまとめておいた地図に水筒の茶をこぼした。|{a}は「近道を見つけた｜＝｜近道を見つけました」と言い張り、一行を三十分も同じ場所でぐるぐる歩かせた。|{a}は村人に「この村、絶対なんかあるよね！｜この村には、絶対に何かある！｜この村、絶対なんかありますよね！」と大声で話しかけた。村人は笑顔のまま、二度と口をきいてくれなかった。|{a}は勝手に神社の鈴を鳴らし続けた。夜中まで、どこからか同じ音が返ってきた。|{a}は見つけた古文書を「読めない｜＝｜読めません」と言って、焚き付けに使ってしまった。|{a}は「みんなのために｜皆のためだ｜皆さんのためです」と夕食を作ろうとして、民宿の台所を小火にした。');
  var GOAL = L('{a}は「\u2060{g}」のことしか頭になかった。皆の制止を振り切って、一人で村の奥へ向かった。|{a}は「\u2060{g}」のためだと言い張って、話し合いの途中で席を立った。|{a}は「\u2060{g}」に夢中で、皆が集めた手がかりの話を一つも聞いていなかった。|{a}は「\u2060{g}」のためにと勝手に村人と約束を取りつけ、一行の予定をめちゃくちゃにした。');
  var SABO = L('{a}は{b}が調べていた蔵の扉を、外から閂で閉めてしまった。「わざとじゃない｜わざとではない｜わざとではありません」と{a}は言ったが、{b}が出られたのは二時間後だった。|{a}は{b}の懐中電灯の電池を「\u2060借りた」まま返さなかった。{b}は夜道で足を踏み外し、膝を強く打った。|{a}は村人に「{b}が祠を荒らした｜＝｜{b}が祠を荒らしました」と吹き込んだ。村人たちは、{b}を冷たい目で見るようになった。|{a}は{b}の手帳を「\u2060間違えて」持ち出し、谷川に落とした。{b}が書き留めていたことは、すべて流れていった。|{a}は{b}が隠れていた納屋の前で大声を上げた。駆けつけた村人たちに、{b}は追い回された。');
  var SABO_WHY = '敵対している相手の足を引っ張った（無能）';
  var STUCK = L('{a}は、{b}のせいで足止めを食らっていた。|{a}は、{b}が引き起こした騒ぎの後始末に追われていた。');
  var DRAG = L('――倒れる間際、{a}は{b}の足首を掴んで離さなかった。二人はもつれ合ったまま、闇の中へ落ちていった。|――{a}の悲鳴に気を取られて振り返った{b}も、同じものに捕まった。|――{a}は最後に、{b}の名前を叫んだ。振り返った{b}の背後に、それはもう立っていた。|――{a}が引きずり込まれた先には、{b}が隠れていた。');
  var DRAG_DIE = L('{a}は、そのまま戻らなかった。|{a}も、二度と戻らなかった。');

  function alive(p) { return JS.alive ? JS.alive(p) : p.alive !== false; }
  function foes(S, p, live) {
    return live.filter(function (q) { return q !== p && alive(q) && !q.out && !q.bound && (JS.REL.cat(S, p, q) === 'bad' || JS.REL.bond(S, p, q) < -0.15); });
  }

  JS.MUNO = {
    /* 住人の一時間：無能はたいてい自分の目標を追うか空回りする。足止めを食らった人は動けない */
    act: function (S, p, h, live) {
      var rng = S.rng;
      if (p.munoStun && p.munoStun > h) {
        ST.sayB(S, { actors: [p], tag: '足止め', text: ST.fmt(ST.pick(S, STUCK), { a: p.name, b: p.munoBy || '' }), why: '無能に足を引っ張られた' }, p.name + 'は足止め');
        return true;
      }
      if (p.job !== 'muno' || rng() > 0.7) return false;
      var fs = foes(S, p, live), r = rng();
      if (fs.length && r < 0.35) {
        var q = fs[Math.floor(rng() * fs.length)];
        q.m.hp = clamp(q.m.hp - (10 + rng() * 14), 0, 100); q.m.fear = clamp(q.m.fear + 14, 0, 100);
        q.munoStun = h + 2; q.munoBy = p.name;
        S.hostile = clamp((S.hostile || 0) + 4, 0, 100);
        var o = ST.say(S, { actors: [p, q], tag: '足を引っ張る', text: ST.fmt(ST.pick(S, SABO), { a: p.name, b: q.name }), why: SABO_WHY + '：' + q.name + 'は怪我をして、しばらく動けない', mag: 24 });
        if (!p.munoKey) { p.munoKey = true; ST.key(S, o, p.name + 'が' + q.name + 'の足を引っ張った'); }
        return true;
      }
      if (r < 0.65 && p.goal) {
        p.m.fear = clamp(p.m.fear - 3, 0, 100);
        ST.sayB(S, { actors: [p], tag: '空回り', text: ST.fmt(ST.pick(S, GOAL), { a: p.name, g: p.goal.label }), why: '無能：手がかりより自分の目標「' + p.goal.label + '」を追いかけた' }, p.name + 'は目標に夢中');
        return true;
      }
      S.hostile = clamp((S.hostile || 0) + 5, 0, 100);
      live.forEach(function (q) { if (q !== p && alive(q)) q.m.fear = clamp(q.m.fear + 3, 0, 100); });
      ST.sayB(S, { actors: [p], tag: '空回り', text: ST.fmt(ST.pick(S, FLUB), { a: p.name }), why: '無能：行動が空回りして、場をかき乱した（村人の敵意 +5・皆の恐怖 +3）' }, p.name + 'が空回り');
      return true;
    },
    /* 無能が死ぬとき、敵対している相手を巻き添えにしやすい */
    onDeath: function (S, p) {
      if (p.job !== 'muno' || S.munoDrag) return;
      var fs = foes(S, p, S.P || []);
      if (!fs.length || S.rng() > 0.55) return;
      var q = fs[Math.floor(S.rng() * fs.length)];
      S.munoDrag = true;
      JS.core.die(S, q, p.name + 'の巻き添えで', DRAG_DIE, ST.fmt(ST.pick(S, DRAG), { a: p.name, b: q.name }));
    }
  };
})();
