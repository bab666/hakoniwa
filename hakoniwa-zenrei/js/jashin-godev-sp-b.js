/* 箱庭シミュレーター: 邪神村RTA ― 凝ったしくみの神（その2）
   ・イタクァ：風の眷属が住人を殺し、その人に成り代わる。仲間が気づくかどうか
   ・グラーキ：湖の主の棘に刺された者は、死んだまま動く「従者」になる。陽に当たり続けると「緑の崩壊」で崩れ落ちる
   ・目洗い薬師：病や傷を治すと、いちばん縁の深い仲間の同じ部位が腐り始める。両目を潰されて「薬師さまの嫁」にされる
   ・クアチル・ウタウス：触れられると老いる。三度目には塵になる
   ・ガタノトーアの鏡の罠、チャウグナー・フォーン（チョー・チョー人）の怪異の差し替えもここ */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, JS = HK.JASHIN, clamp = HK.clamp, GD = JS && JS.GODEV;
  if (!ST || !JS || !GD) return;
  var SP = GD.SP;
  function alive(p) { return JS.alive(p); }
  function free(live) { return live.filter(function (p) { return alive(p) && !p.bound; }); }
  function best(live, type, f) { return free(live).filter(function (p) { return !f || f(p); }).sort(function (a, b) { return JS.skill(b, type) - JS.skill(a, type); })[0]; }
  function L(s) { return s.split('|'); }

  /* ================= イタクァ（風の眷属の成り代わり） ================= */
  var ITH_SIGN = L('雪の上を歩いて戻ってきた{a}の後ろには、足跡がひとつも残っていなかった。|{b}が{a}の手に触れて、思わず手を引っ込めた。{a}の手は、氷のように冷たかった。|{a}は、出された温かい汁物に手をつけず、窓の外の吹雪を、じっと見つめていた。|夜中、{a}の布団は空だった。外の雪の上に、人のものとは思えない大きな足跡が、峠へ向かって続いていた。朝、{a}は何食わぬ顔で、囲炉裏の前に座っていた。|{a}の吐く息だけが、部屋の中でも白かった。');
  SP.ithaqua = {
    tick: function (S, live, h) {
      var rng = S.rng, I = S.ith, vs = free(live);
      if (!I) {
        if (!JS.night(h) || h < 6 || vs.length < 2 || rng() > 0.26) return false;
        var v = HK.weighted(rng, vs, function (p) { return 0.4 + (p.action.id === 'alone' ? 2 : 0) + (6 - p.stats.stamina) * 0.15; });
        v.alive = false; v.ithFake = true; v.fate = '風の眷属に殺され、成り代わられた（' + JS.hm(h) + '）'; v.how = '風の眷属に殺されて';
        S.ith = { v: v, h: h, seen: 0, rev: false };
        ST.say(S, { actors: [v], tag: '吹雪の夜', text: '吹雪の夜、' + v.name + 'は外の様子を見に出たきり、なかなか戻らなかった。明け方、' + v.name + 'は雪まみれで戻ってきた。「平気だよ。少し道に迷っただけだよ」――' + v.name + 'は、そう言って笑った。', why: '吹雪の中で、何かがあったらしい', mag: 18 });
        return true;
      }
      if (I.rev || rng() > 0.4) return false;
      I.seen++;
      var b = vs[rng() * vs.length | 0];
      var sh = best(vs, 'obs'), ch = sh ? clamp(0.08 + JS.skill(sh, 'obs') * 0.3 + I.seen * 0.12 + (sh.job === 'psychic' ? 0.15 : 0), 0.05, 0.85) : 0;
      var t = ST.fmt(ST.pick(S, ITH_SIGN), { a: I.v.name, b: b ? b.name : '仲間' });
      if (!sh || rng() > ch) { ST.say(S, { actors: b ? [b] : [], tag: '違和感', text: t, why: '……' + I.v.name + 'の様子がおかしい', mag: 18 }); return true; }
      reveal(S, sh, vs, t);
      return true;
    },
    cave: function (S, live) {
      var I = S.ith;
      if (!I || I.rev) return I ? { bonus: 0.04, why: '風の眷属を見破っていた' } : {};
      I.rev = true;
      var vs = free(live), a = vs[S.rng() * vs.length | 0];
      ST.say(S, { kind: 'climax', tag: '成り代わり', text: '峠の祠へ向かう途中、' + I.v.name + 'が、ふいに足を止めた。振り向いたその顔は、霜に覆われ、目だけが青白く燃えていた。「＠――寒いだろう。お前たちも、風になれ」' + I.v.name + 'の姿をしていたものは、吹雪の中へ跳び上がり、一行の頭上を旋回し始めた。', why: I.v.name + 'は、とうに風の眷属に殺され、成り代わられていた（最後まで気づけなかった）', mag: 46 });
      if (a && S.rng() < 0.4) JS.core.die(S, a, '風の眷属に襲われて', ['吹雪の中から伸びた爪が{a}を掴み上げ、空の高みへ連れ去った。しばらくして、遠くの雪原に、何かが落ちる音がした。']);
      JS.REL.onDeath(S, I.v);
      return { bonus: -0.12, why: '風の眷属が紛れていた' };
    },
    end: function (S) {
      var I = S.ith;
      if (I && !I.rev) ST.say(S, { kind: 'phase', tag: '雪解け', text: '春になって、峠の雪の中から、ひとりの遺体が見つかった。' + I.v.name + 'だった。死んでから、ずいぶん日が経っていた。――では、あの村で一行と一緒にいた' + I.v.name + 'は、誰だったのか。', why: I.v.name + 'は、吹雪の夜に風の眷属に殺され、成り代わられていた' });
    }
  };
  function reveal(S, sh, vs, sign) {
    var I = S.ith; I.rev = true;
    var ct = GD.giveClue(S, sh);
    var o = ST.say(S, { actors: [sh], tag: '成り代わり', kind: 'climax', text: sign + '――' + sh.name + 'は、気づいてしまった。「あなた……' + I.v.name + 'じゃない」' + I.v.name + 'の姿をしたものの顔に、霜の亀裂が走った。それは人の声ではない声で笑い、窓を突き破って、吹雪の中へ消えた。' + ct, why: sh.name + 'が、成り代わりを見抜いた（観察' + (sh.job === 'psychic' ? '・霊感' : '') + '）', mag: 44 });
    ST.key(S, o, I.v.name + 'は成り代わられていた');
    ST.say(S, { actors: [I.v], tag: '雪の中', text: '峠の雪の中から、本物の' + I.v.name + 'が見つかった。凍りついたその顔は、最後まで誰かを呼んでいるようだった。', why: I.v.name + 'は、吹雪の夜にすでに殺されていた', mag: 36 });
    S.gBonus = (S.gBonus || 0) + 0.06;
    JS.REL.onDeath(S, I.v);
  }

  /* ================= グラーキ（棘と緑の崩壊） ================= */
  SP.glaaki = {
    tick: function (S, live, h) {
      var rng = S.rng, vs = free(live), night = JS.night(h);
      /* 棘に刺された人 */
      var sp = vs.filter(function (p) { return p.spine != null; });
      for (var i = 0; i < sp.length; i++) {
        var p = sp[i], cur = vs.filter(function (q) { return q !== p && q.spine == null && (q.job === 'doctor' || q.job === 'priest' || q.job === 'occult' || q.magic); })[0];
        if (cur && h - p.spine <= 4 && rng() < 0.45) {
          var ok = rng() < 0.4 + JS.skill(cur, 'rite') * 0.3 + (cur.job === 'doctor' ? 0.15 : 0);
          p.spine = ok ? null : p.spine;
          p.m.hp = clamp(p.m.hp - 25, 0, 100);
          ST.say(S, { actors: [cur, p], tag: '棘', text: cur.name + 'は、' + p.name + 'の胸の傷口に指を差し入れ、中に残った棘の欠片を探った。' + (ok ? '細く黒い棘が、ずるりと抜けた。棘は床の上で、しばらく虫のように蠢いていた。' + p.name + 'の胸から、ようやく赤い血が流れ出した。――' + p.name + 'は、生きている人間に戻った。' : '棘は、もう' + p.name + 'の心臓に根を張っていた。' + cur.name + 'の指先に、冷たい脈が触れた。それは、' + p.name + 'の脈ではなかった。'), why: ok ? cur.name + 'が、刺さった棘を抜いた（従者にならずに済んだ）' : '棘を抜けなかった', mag: 34 });
          return true;
        }
        if (!night && h - p.spine >= 4 && rng() < 0.35 + (h - p.spine) * 0.03) {
          JS.core.die(S, p, '緑の崩壊で', ['朝日が、{a}の頬に差した。{a}の肌が、見る間に緑色に変わり始めた。指先が、苔むした石のように崩れ、髪が緑の粉になって舞い落ちた。{a}は何か言おうとして口を開いた。その口も、崩れた。――陽の当たる縁側に、緑色の粉の山だけが残った。']);
          p.fate = '湖の主の従者となり、緑の崩壊で崩れ落ちた（' + JS.hm(h) + '）';
          return true;
        }
        if (night && rng() < 0.3) {
          p.m.fear = clamp(p.m.fear + 6, 0, 100);
          ST.sayB(S, { actors: [p], tag: '従者', text: p.name + 'は夜中にふらりと起き上がり、湖の方へ歩いていこうとした。その胸の傷からは、一滴の血も流れていなかった。仲間が引き止めると、' + p.name + 'は、ひどく穏やかな声で言った。「呼ばれてるんだ。行かなきゃ」', why: '棘に刺された者は、湖の主の従者になる' }, p.name + 'が湖へ向かおうとした');
          return true;
        }
      }
      /* 棘に刺される */
      if (night && h >= 4 && (S.gf.spine || 0) < (S.P.length >= 5 ? 2 : 1) && rng() < 0.22) {
        var a = GD.pickWho(S, 'alone', vs); if (!a || a.spine != null) return false;
        S.gf.spine = (S.gf.spine || 0) + 1;
        var helper = vs.filter(function (q) { return q !== a && JS.REL.near(S, a, q); })[0];
        var res = clamp(0.2 + a.stats.stamina * 0.04 + a.stats.luck * 0.03 + a.tr.caution * 0.15 + (helper ? 0.2 : 0), 0.1, 0.8);
        var pre = '夜の湖のほとりで、' + a.name + 'の背後の水面が、音もなく盛り上がった。月明かりの中に、巨大な楕円の体と、全身に生えた無数の金属の棘が浮かび上がった。一本の棘が、ひゅっと伸びた――';
        if (S.rng() < res) { a.m.fear = clamp(a.m.fear + 18, 0, 100); ST.say(S, { actors: helper ? [a, helper] : [a], tag: '棘', text: pre + (helper ? helper.name + 'が' + a.name + 'を突き飛ばした。棘は、' + a.name + 'のいた場所の砂を深々と抉った。' : a.name + 'は、とっさに砂浜に身を投げた。棘は頬をかすめ、背後の木の幹を貫いた。'), why: '湖の主の棘をかわした（体力・運・慎重さ' + (helper ? '・' + helper.name + 'の助け' : '') + '）', mag: 30 }); return true; }
        a.spine = h; a.m.fear = clamp(a.m.fear + 25, 0, 100);
        var o = ST.say(S, { actors: [a], tag: '棘', kind: 'climax', text: pre + '棘は、' + a.name + 'の胸を貫いた。' + a.name + 'は砂浜に倒れた。――そして、起き上がった。胸に開いた穴からは、一滴の血も流れていなかった。棘はするりと抜け、湖の底へ戻っていった。' + a.name + 'の胸の中に、細い枝のようなものを残して。', why: '湖の主の棘に刺された者は、死んだまま動く従者になる。早く棘を抜かないと、陽の光で「緑の崩壊」が始まる', mag: 42 });
        ST.key(S, o, a.name + 'が湖の主の棘に刺された');
        return true;
      }
      return false;
    }
  };

  /* ================= 目洗い薬師（厄介払い・薬師さまの嫁） ================= */
  var PART = ['左腕', '右足', '脇腹', '右手の指', '左の耳', '膝'];
  SP.mekura = {
    tick: function (S, live, h) {
      var rng = S.rng, vs = free(live);
      /* 傷を治すと、縁の深い仲間の同じ部位が腐る */
      if (!S.gf.heal && h >= 4 && rng() < 0.3) {
        var a = vs.filter(function (p) { return p.m.hp < 70; }).sort(function (x, y) { return x.m.hp - y.m.hp; })[0] || (rng() < 0.4 ? vs[rng() * vs.length | 0] : null);
        if (!a) return false;
        var b = vs.filter(function (q) { return q !== a; }).sort(function (x, y) { return JS.REL.bond(S, y, a) - JS.REL.bond(S, x, a); })[0];
        if (!b) return false;
        S.gf.heal = 1;
        var part = rng.pick(PART);
        a.m.hp = clamp(a.m.hp + 30, 0, 100); b.m.hp = clamp(b.m.hp - 20, 0, 100); b.m.fear = clamp(b.m.fear + 20, 0, 100); b.rot = part;
        var ct = GD.giveClue(S, b);
        var o = ST.say(S, { actors: [a, b], tag: '厄介払い', kind: 'climax', text: '寺の住職が、' + a.name + 'の' + part + 'の傷に、黒い薬湯を塗ってくれた。「薬師さまのご利益です」傷は、見る間に跡形もなく消えた。――その夜、' + b.name + 'が悲鳴を上げた。' + b.name + 'の' + part + 'が、黒く変色し、甘い腐臭を放っていた。住職は、穏やかに手を合わせた。「＠厄介払いでございます。いちばん縁の深いお方が、代わりに厄を引き受けてくださる」' + ct, why: '目洗い薬師は、治した部位の代わりに、祈った者に縁の深い誰かの同じ部位を腐らせる（' + a.name + 'といちばん縁が深いのは' + b.name + '）', mag: 40 });
        ST.key(S, o, b.name + 'の' + part + 'が腐り始めた');
        return true;
      }
      if (S.gf.heal && !S.gf.rot2) {
        var r = vs.filter(function (p) { return p.rot; })[0];
        if (r && rng() < 0.3) { S.gf.rot2 = 1; r.m.hp = clamp(r.m.hp - 15, 0, 100); ST.say(S, { actors: [r], tag: '厄介払い', text: r.name + 'の' + r.rot + 'の黒ずみは、少しずつ広がっていた。包帯を替えるたびに、何かが、ぽろりと落ちた。', why: '厄は、少しずつ腐り落ちていく（封じれば止まる）', mag: 24 }); return true; }
      }
      /* 両目を潰して、薬師さまの嫁にする */
      if (!S.gf.bride && JS.night(h) && h >= 8 && rng() < 0.24) {
        S.gf.bride = 1;
        var v = GD.pickWho(S, function (p) { return (p.gender === 'f' ? 2 : 1) * (p.action.id === 'alone' ? 2 : 1); }, vs); if (!v) return false;
        var hp = vs.filter(function (q) { return q !== v && JS.REL.near(S, v, q); }).sort(function (x, y) { return JS.skill(y, 'fight') - JS.skill(x, 'fight'); })[0];
        var pre = '夜更け、寺の鐘が鳴った。白無垢の女たちが、目隠しをしたまま、すり足で民宿に入ってきた。女たちは迷わず' + v.name + 'の布団を囲んだ。「＠お迎えにあがりました。薬師さまの、お嫁さま」';
        if (hp && rng() < 0.35 + JS.skill(hp, 'fight') * 0.4) { v.m.fear = clamp(v.m.fear + 20, 0, 100); ST.say(S, { actors: [v, hp], tag: '薬師さまの嫁', text: pre + hp.name + 'が跳ね起き、女たちを振り払って、' + v.name + 'を部屋の外へ引きずり出した。女たちは、見えないはずの目で、じっと二人の背中を見送った。「＠また、お迎えにあがります」', why: hp.name + 'が、' + v.name + 'が連れ去られるのを防いだ', mag: 34 }); return true; }
        v.taken = true; v.takenAt = h; v.blind = true;
        var o2 = ST.say(S, { actors: [v], tag: '薬師さまの嫁', kind: 'climax', text: pre + '冷たい手が、' + v.name + 'の口と手足を押さえた。' + v.name + 'は、寺の裏の小屋へ連れていかれた。明け方、小屋から、婚礼の唄が聞こえてきた。――唄の合間に、一度だけ、' + v.name + 'の悲鳴が混じった。', why: '両目を潰された者が「薬師さまの嫁」にされる（連れ去られた。対抗策を実行できれば助け出せるが、目は戻らない）', mag: 44 });
        ST.key(S, o2, v.name + 'が薬師さまの嫁にされた');
        return true;
      }
      return false;
    },
    end: function (S) {
      S.P.forEach(function (p) {
        if (p.blind && p.fate && !/両目/.test(p.fate)) p.fate += '・両目を失った';
        if (p.rot && p.alive && S.result === 'sealed') p.notes.push(p.rot + 'の腐れは、封印とともに止まった');
      });
    }
  };

  /* ================= クアチル・ウタウス（触れられると老いる） ================= */
  var AGE = [
    '{a}の髪に、白いものが一気に混じった。目尻と口元に、深い皺が刻まれた。鏡を見た{a}は、しばらく声が出なかった。',
    '{a}の背中が、目に見えて曲がった。指の関節が節くれ立ち、歯が一本、ぽろりと抜け落ちた。{a}の手を握った仲間は、その軽さに息を呑んだ。'
  ];
  SP.quachil = {
    tick: function (S, live, h) {
      var rng = S.rng, vs = free(live);
      if (rng() > (JS.night(h) ? 0.3 : 0.16) || h < 4) return false;
      var a = GD.pickWho(S, function (p) { return (p.action.id === 'alone' ? 2 : 1) * (1 + (p.age || 0) * 0.8); }, vs); if (!a) return false;
      var pre = ST.pick(S, L('空き地の上に、光の柱が下りてきた。その中から、枯れ枝のような指が伸び、{a}の肩に触れた。|夜道で、{a}は小さな骸骨のような影とすれ違った。影の指先が、{a}の手の甲を、そっとなでていった。|{a}の部屋の柱時計の針が、狂ったように回り始めた。誰かが、{a}の背中に触れた。'));
      pre = ST.fmt(pre, { a: a.name });
      var dodge = clamp(0.25 + JS.skill(a, 'obs') * 0.3 + a.stats.luck * 0.03, 0.1, 0.7);
      if (rng() < dodge) { a.m.fear = clamp(a.m.fear + 10, 0, 100); ST.say(S, { actors: [a], tag: '老い', text: pre.replace(/触れた。|なでていった。|触れた。$/, '触れかけた――') + a.name + 'は、とっさに身を引いた。触れられかけた袖口だけが、百年経った布のように、ぼろぼろに崩れた。', why: '塵を踏むものに触れられる寸前で逃れた（観察・運）', mag: 26 }); return true; }
      a.age = (a.age || 0) + 1;
      if (a.age >= 3) { JS.core.die(S, a, '塵を踏むものに触れられて', ['{a}の体は、もう、それ以上老いることができなかった。{a}は、仲間の腕の中で、乾いた音を立てて塵になった。風が吹くと、{a}だった塵は、空き地の灰色の塵に混じって、見分けがつかなくなった。'], pre); a.fate = '老い果てて塵になった（' + JS.hm(h) + '）'; return true; }
      a.m.hp = clamp(a.m.hp - 18, 0, 100); a.m.fear = clamp(a.m.fear + 18, 0, 100); a.stats.stamina = Math.max(1, a.stats.stamina - 1);
      var o = ST.say(S, { actors: [a], tag: '老い', kind: 'climax', text: pre + ST.fmt(AGE[a.age - 1], { a: a.name }), why: '塵を踏むものに触れられた者は、一瞬で何十年も老いる（' + a.age + '度目。三度目には塵になる）', mag: 36 });
      if (a.age === 1) ST.key(S, o, a.name + 'が一瞬で老いた');
      return true;
    },
    end: function (S) { S.P.forEach(function (p) { if (p.age) p.notes.push('塵を踏むものに触れられ、' + (p.age * 30) + '年ほど老いた'); }); }
  };

  /* ================= 差し替え：ガタノトーアの罠（鏡越し）・チャウグナーの怪異（チョー・チョー人） ================= */
  function F(id, traps, horror) {
    var fx = JS.FX[id]; if (!fx) return;
    if (traps) fx.traps = traps.split('|').map(function (t) { var k = t.split('／'); return { set: k[0], die: k[1] }; });
    if (horror) fx.horror = fx.horror.concat(horror.split('|'));
  }
  F('gatano',
    '{a}は、山の社の銅鏡を磨いていた村人に「＠よそ者は鏡を見るでない」と止められたが、つい覗き込んでしまった。鏡の中の山が、動いた／{a}の体は、鏡を覗いた姿勢のまま、灰色の石に変わっていった。最後まで動いていたのは、恐怖に揺れる瞳だった|{a}が神社の奥の布をめくると、山の神を描いた絵があった。絵の中の山は、鏡に映した姿で描かれていた／絵を見た瞬間、{a}の指先から、皮膚が乾いた石のように硬くなっていった。それは心臓まで届いた|{a}は霧の晴れた朝、民宿の板戸の節穴から、山の社の方を覗いてしまった。社の鏡が、朝日を跳ね返して{a}の目を射た／村人たちが駆けつけたとき、{a}は板戸の前で、石像になっていた',
    '村人の一人が、山の社の鏡に向かって、ひれ伏したまま何時間も話し込んでいた。返事は、鏡の向こうからしか来ないらしかった。');
  F('chaugnar', null,
    '村人たちが、寺の裏で輪になって、聞いたことのない言葉の歌を歌っていた。その輪の中心の鍋から、甘い肉の匂いがした。――一行の誰も、その鍋の中身を確かめる勇気はなかった。|小柄な村人が、{a}の手首を、値踏みするように指でつまんだ。そして、仲間の村人に向かって、聞き慣れない言葉で何か言い、くすくすと笑った。|村の子どもだと思っていた小さな人影が振り向くと、皺だらけの老人の顔をしていた。その歯は、すべて鋭く尖らせてあった。');
})();
