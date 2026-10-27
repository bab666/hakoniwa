/* 箱庭シミュレーター: 邪神村RTA ― 村の歓迎の宴（全年齢版も同じ）
   夕方、村長が一行を集会所の宴に招く（一度だけ）。酒の強さ（キャラの設定「お酒」。なければ気質から。HK.alcLevel）で、宴での過ごし方が変わる。
   ・弱い（1・2）：すぐに酔いが回る。怖さは少し和らぐが、口を滑らせて村人に警戒されたり、酔いつぶれて仲間に介抱されたりする
   ・ふつう（3）：ほどほどに付き合う。ときどき村人の様子の違和感に気づく
   ・強い（4・5）：村人と盃を重ね、先に酔った村人の口から、村の秘密（手がかり）を聞き出すことがある
   ・慎重な人は、盃に口をつけるふりをしてかわす。未成年の職業（全年齢版の高校生・令嬢・幼子）は酒を飲まない（甘酒・ジュース）
   {a}=その人 {b}=介抱する仲間 */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, JS = HK.JASHIN, clamp = HK.clamp;
  if (!ST || !JS) return;
  function L(s) { return s.split('|'); }
  function alc(p) { return HK.alcLevel ? HK.alcLevel(p) : 3; }
  function F(S, pool, v) { return ST.fmt(ST.pick(S, pool), v); }
  var T = {
    intro: L('日が傾くころ、村長が民宿に顔を出した。「遠いところをようこそ。ささやかですが、集会所に席を用意しました」――断れる雰囲気ではなかった。|夕方、集会所に提灯が灯り、一行は「よそ者を歓迎する宴」に招かれた。膳には山菜と川魚、そして大きな酒樽が並んでいた。|村の年寄りたちが、一行を集会所へ手招きした。「祭りの前の、顔合わせの宴です。今夜は飲んでいってください」'),
    minor: L('{a}の前には、甘酒の湯呑みが置かれた。「若い人には、こっちね」――村の女たちは、やけに優しく笑った。|{a}はジュースの瓶を渡され、子どもたちの座る端の席に案内された。'),
    dodge: L('{a}は盃に口をつけるふりをして、こっそり膳の下の小鉢に酒を捨てた。|{a}は「明日も早いから｜明日も早いからな｜明日も早いですので」と一杯だけ受け、あとは手のひらで盃を覆い続けた。|{a}は盃を受けるたびに唇を湿らせるだけにして、村人たちの顔を一人ずつ見ていた。'),
    weak: L('{a}は一杯目で耳まで真っ赤になった。「ごめん、お酒、弱くて……｜すまない、酒は弱くて……｜すみません、お酒、弱くて……」|{a}は二口で目が据わり、隣の村人の肩に寄りかかって笑い始めた。|{a}は湯呑み半分の酒で、もう呂律が怪しくなっていた。'),
    weakSlip: L('酔った{a}は、うっかり「この村、なんか変だよね｜この村は、どこか変だ｜この村、なんか変ですよね」と口にした。座が一瞬、しんと静まった。|{a}は上機嫌で、昼間見た祠の話を村人に聞かせてしまった。村長の目が、すっと細くなった。'),
    weakDown: L('{a}はそのまま座布団に突っ伏して、寝息を立て始めた。{b}が肩を貸して、民宿まで連れて帰った。|{a}は宴の途中で青い顔になり、{b}に背中をさすられながら外の空気を吸いに出た。'),
    mid: L('{a}は勧められた分だけほどほどに付き合い、愛想よく相槌を打った。|{a}は二、三杯で切り上げ、あとは料理に箸を伸ばした。|{a}はほろ酔いのまま、村人たちの世間話に耳を傾けた。'),
    midNote: L('{a}は、酒を注いで回る村人たちの手首に、そろって同じ形の痣があることに気づいた。|{a}は、村長だけが一滴も飲まず、一行の盃の減り方を数えるように見ているのに気づいた。|{a}は、上座の空いた席の前にだけ、手つかずの膳が供えられているのに気づいた。'),
    strong: L('{a}は、勧められるそばから盃を空けた。顔色ひとつ変わらない{a}に、村の男たちが面白がって次々と酒を注いだ。|{a}は「いい酒だね｜いい酒だ｜いい酒ですね」と言いながら、村の酒豪と差しで飲み比べを始めた。|{a}は涼しい顔で何杯も盃を重ね、先に酔いの回った村人の隣へ、そっと席を移した。'),
    strongLeak: L('すっかり酔った村の男が、{a}に肩を組んで声をひそめた。「よそ者のくせに飲めるな。……気に入ったから教えてやる」――|酔いつぶれかけた老人が、{a}の盃に酒を注ぎながら、ぽつりとこぼした。「昔はな、もっと大勢で祀ったもんだ」――|飲み比べに負けた村の若者が、赤い顔で{a}に打ち明けた。「本当は、祭りなんかやめたいんだ」――'),
    strongNone: L('{a}が何杯付き合っても、村人たちは肝心な話になると口をつぐんだ。|{a}は最後まで素面のまま、酔ったふりをする村人たちの目が笑っていないのを見ていた。')
  };
  /* 未成年の職業（全年齢版の高校生・令嬢・幼子）が出る邪神村の記録では、酒を飲む言い回しを果汁・ジュースに言い換える（収穫祭の宴・死の場面など） */
  var MINOR_SUB = [[/新酒の葡萄酒/g, '搾りたての葡萄のジュース'], [/葡萄酒/g, '葡萄のジュース'], [/御神酒/g, '甘酒'], [/杯を重ねた/g, '杯を何度もおかわりした'], [/酔わせた/g, '眠らせた'], [/酔わされ/g, '眠らされ'], [/酔った/g, 'ぼんやりした'], [/酔いが回/g, '眠気が回']];
  /* 包み直しは HK.wrap（包む順を元のファイルの順に固定。このファイルは箱庭のかたまり scen-jashin にあり、中核の包みより後に届く） */
  HK.wrap(ST, 'say', function (say0) { return function (S, o) {
    if (S && S.scen && S.scen.id === 'jashin' && o && typeof o.text === 'string' && /酒|酔/.test(o.text)) {
      var minor = (o.actors || []).some(function (a) { var p = typeof a === 'number' ? S.P[a] : a; return p && p.minor; });
      if (minor) MINOR_SUB.forEach(function (w) { o.text = o.text.replace(w[0], w[1]); });
    }
    return say0.apply(this, arguments);
  }; });
  var F_ = JS.FEAST = {
    tick: function (S, live, h) {
      if (S.feastDone || !live.length || h >= S.deadline - 4) return;
      var hh = (16 + h) % 24;
      if (hh < 18 || hh > 22) return;
      if (h > 30) { S.feastDone = true; return; }
      if (S.rng() >= 0.4) return;
      S.feastDone = true;
      var rng = S.rng, parts = [], whys = [], actors = live.slice();
      var strongest = live.filter(function (p) { return !p.minor; }).sort(function (x, y) { return alc(y) - alc(x); })[0];
      live.forEach(function (p) {
        var a = alc(p), v = { a: p.name };
        if (p.minor) { parts.push(F(S, T.minor, v)); return; }
        if (p.tr.caution > 0.7 && rng() < 0.6) { parts.push(F(S, T.dodge, v)); whys.push(p.name + '：飲むふり（慎重さ）'); return; }
        if (a <= 2) {
          parts.push(F(S, T.weak, v));
          p.m.fear = clamp((p.m.fear || 0) - 8, 0, 100);
          var r = rng();
          if (r < 0.35) { parts.push(F(S, T.weakSlip, v)); S.hostile = clamp((S.hostile || 0) + 6, 0, 100); whys.push(p.name + '：酒に弱く、口を滑らせた（村人の敵意 +）'); }
          else if (r < 0.75 && strongest && strongest !== p && alc(strongest) >= 3) {
            parts.push(F(S, T.weakDown, { a: p.name, b: strongest.name }));
            if (JS.DRAMA && JS.DRAMA.setRel) JS.DRAMA.setRel(S, p, strongest, 0.06);
            whys.push(p.name + '：酔いつぶれ、' + strongest.name + 'に介抱された');
          } else whys.push(p.name + '：酒に弱い（怖さが少し和らいだ）');
          return;
        }
        if (a === 3) {
          parts.push(F(S, T.mid, v));
          p.m.fear = clamp((p.m.fear || 0) - 4, 0, 100);
          if (rng() < 0.25 + p.tr.caution * 0.2) { parts.push(F(S, T.midNote, v)); p.wary = true; whys.push(p.name + '：ほどほどに付き合い、違和感に気づいた'); }
          return;
        }
        parts.push(F(S, T.strong, v));
        var left = S.G.clues.map(function (c, k) { return k; }).filter(function (k) { return S.found.indexOf(k) < 0; });
        if (left.length && rng() < (a >= 5 ? 0.6 : 0.45)) {
          var talk = left.filter(function (k) { return S.G.clues[k].type === 'talk'; }), k = (talk.length ? talk : left)[0];
          S.found.push(k); p.cnt.clue++;
          parts.push(F(S, T.strongLeak, v) + S.G.clues[k].t + '。');
          whys.push(p.name + '：酒に強く、酔った村人から聞き出した（手がかり ' + S.found.length + '/' + S.G.clues.length + '）');
        } else { parts.push(F(S, T.strongNone, v)); whys.push(p.name + '：酒に強いが、村人は口を割らなかった'); }
      });
      /* 食べ物の好み（food.js）：好みを決めた人がいるときだけ、宴の料理の好物・苦手・味の一句を足す */
      var fz = HK.Food && HK.Food.feast(S, live, 'feast');
      if (fz) { parts.push(fz.text); whys.push(fz.why); }
      ST.say(S, { actors: actors, tag: '歓迎の宴', text: ST.pick(S, T.intro) + parts.join(''), why: '村の歓迎の宴。酒の強さ（キャラの設定「お酒」、なければ気質から）で過ごし方が変わる。' + (whys.join('／') || ''), mag: 16 });
    }
  };
})();
