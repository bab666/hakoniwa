/* 箱庭シミュレーター: 吹雪の館の殺人 ― 特殊役職（不死・吸血鬼）（special.js の組み込み）
   ・殺された不死・吸血鬼は、遺体が見つかったあと（朝・昼・夕方の頭）に蘇る。犯人の顔は見ていないので、事件の謎は残る
   ・特殊役職の人は、恐怖の高い時間が続くと発狂して動けなくなる（仲の良い人が落ち着かせるまで）。発狂中は犯人に狙われやすい
   ・吸血鬼は三日に一度、夜に人の血を吸う */
/* 出来事の一覧の印（hakoniwa-tools/build/event-catalog.js が数える。決まりは docs/reports/2026-10-28/event-catalog.md） */
/* @event scen=yakata id=yk_special cat=solo tags=death label=不死・吸血鬼（殺されても蘇る・発狂・血を吸う） */
(function () {
  'use strict';
  var HK = window.HK, Y = HK.YAKATA, SP = HK.Special, ST = HK.Story;
  if (!Y || !SP || !ST) return;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  var NOTE = ['{a}は、自分を殺した相手の顔を覚えていなかった。暗がりで、背後から襲われたのだ。', '{a}は首をさすりながら言った。「……誰にやられたのかは、分からない｜＝｜……誰にやられたのかは、分かりません」'];
  function adapter(S, h) {
    var A = S.spA;
    if (!A) A = S.spA = {
      rng: S.rng, all: S.P, env: S.env, scenId: 'yakata',
      r18: !!(Y.R18 && Y.R18.on(S)), lewd: clamp((S.env.ylewd || 0) / 100, 0.15, 0.85),
      alive: function (p) { return !!p.alive; },
      here: function (p) { return !p.gone && !p.bound; },
      say: function (o) {
        var a0 = o.actors[0];
        var kk = o.tag === '蘇生' ? S.kills.filter(function (k) { return k.v === a0 && !k.revived; })[0] : null;
        if (kk) o.text += NOTE[Math.floor(S.rng() * NOTE.length)].replace(/\{a\}/g, a0.name);
        var r = o.short && S.room != null ? ST.sayB(S, o, o.short) : ST.say(S, o);
        if (o.key && r) ST.key(S, r, o.key);
        /* 殺された人が蘇った：犯人の反応と、探偵が証言から手がかりを拾う（推理にも残す） */
        if (kk) { kk.revived = true; a0.spRevealed = true; reactRevive(S, a0); }
        return r;
      },
      hp: function (p) { return p.hpS == null ? 100 : p.hpS; },
      setHp: function (p, v) { p.hpS = clamp(v, 0, 100); },
      full: function () { return 100; },
      stress: function (p) { return p.m.fear; },
      addStress: function (p, v) { p.m.fear = clamp(p.m.fear + v, 0, 100); },
      rel: function (a, b) { return { love: Y.cat(S, a, b) === 'love', w: Y.bond(S, a, b) }; },
      revive: function (p) { p.alive = true; p.fate = ''; },
      kill: function (p, how, text, by) {
        p.alive = false; p.fate = how + '死亡（' + S.curDay + '日目）';
        if (by) (S.extraKills = S.extraKills || []).push({ a: by, b: p });
        var o = ST.say(S, { actors: by ? [by, p] : [p], tag: '死', kind: 'climax', text: text, why: how + '命を落とした', mag: 40 });
        ST.key(S, o, p.name + 'の死');
      },
      zombie: function () { return false; }
    };
    A.nowH = h;
    return A;
  }
  /* 犯人の反応（冷たい人は平然を装い、衝動的な人は動揺し、ほかは確かめに行く） */
  var CUL = {
    cold: ['{c}は、眉ひとつ動かさなかった。ただ、カップを持つ指先だけが白くなっていた。', '{c}は「よかった｜＝｜よかったです」とだけ言った。その声は、ほかの誰よりも落ち着いていた。', '{c}は窓の外の吹雪に目をやったまま、{a}のほうを一度も見なかった。'],
    shaken: ['{c}の手から、持っていたものが床に落ちた。{c}は慌てて拾い上げ、「驚いて」とだけ言った。', '{c}の顔から、さっと血の気が引いた。誰よりも早く、{c}はその場を離れた。', '{c}は「嘘だろ｜嘘だろう｜嘘でしょう」と呟きかけて、口をつぐんだ。その一言を、何人かが聞いていた。'],
    check: ['夜更け、{c}は{a}の部屋の前で長いこと立ち止まっていた。足音に気づいて、{c}は何も言わずに去った。', '{c}は、{a}に「本当に何も覚えてないの？｜本当に何も覚えていないのか｜本当に何も覚えていないんですか」と、二度も確かめた。', '{c}は、蘇った{a}の首筋の傷を、じっと見つめていた。その目は、心配しているようには見えなかった。']
  };
  var CLUE = ['{a}の話を聞いた{d}は、手帳に何かを書き足した。――{t}', '{d}は{a}に、襲われた時刻と場所を繰り返し尋ねた。――{t}', '「顔は見てない。でも、匂いだけは覚えてる｜顔は見ていない。だが、匂いだけは覚えている｜顔は見ていません。でも、匂いだけは覚えています」{a}の一言で、{d}は一つの線を引いた。――{t}'];
  /* ---------- 正体バレ（順167）：蘇った不死・吸血鬼を見た生存者の反応と、本人の打ち明け ----------
     反応は見た人の態度（HK.personaOf）で選び、関係で上書きする（恋人・家族・親しい人はかばう、仲の悪い人は疑う、探偵役は問い詰める）。
     {b}＝見た人 {a}＝蘇った人 */
  var OUT = {
    surprise: ['{b}は持っていたカップを取り落とした。床に広がる紅茶にも気づかず、{b}は{a}の顔を見つめ続けた。{b}「嘘……さっきまで、冷たくなってたのに｜嘘だ……さっきまで、冷たくなっていたはずだ｜嘘です……さっきまで、冷たくなっていたはずです」',
      '{b}は二、三歩あとずさって、壁に背中をぶつけた。{b}「どういうこと？　あなた、死んでたよね？｜どういうことだ。あなたは死んでいたはずだ｜どういうことですか。あなたは、亡くなっていたはずです」',
      '{b}は{a}の手首に触れ、脈を確かめた。指先に伝わる鼓動に、{b}の顔から血の気が引いた。{b}「……動いてる。本当に、生きてる｜……動いている。本当に、生きている｜……動いています。本当に、生きています」'],
    question: ['{b}は{a}の前に立ちはだかった。{b}「説明して。あなたは、いったい何なの？｜説明しろ。あなたは、いったい何者だ｜説明してください。あなたは、いったい何者なんですか」',
      '{b}は{a}の首筋の傷を指さした。{b}「その傷で生きていられる人間はいない。……正直に話して｜その傷で生きていられる人間はいない。……正直に話せ｜その傷で生きていられる人間はいません。……正直に話してください」',
      '{b}は腕を組み、{a}をまっすぐに見据えた。{b}「隠していたことがあるなら、今のうちに全部話して｜隠していたことがあるなら、今のうちに全部話せ｜隠していたことがあるなら、今のうちに全部話してください」'],
    defend: ['{b}は、{a}を囲む皆のあいだに割って入った。{b}「何者だっていい。生きててくれたなら、それでいい｜何者でもかまわない。生きていてくれたなら、それでいい｜何者でもかまいません。生きていてくれたなら、それでいいんです」',
      '{b}は{a}の肩に自分の上着をかけた。{b}「寒かったよね。……話は、あとで聞く｜寒かっただろう。……話は、あとで聞く｜寒かったでしょう。……お話は、あとで聞きます」',
      '{b}は、疑いの目を向ける皆を振り返った。{b}「この人は殺されたんだよ。疑うなら、殺した人のほうでしょう｜この人は殺されたんだ。疑うなら、殺した側のほうだろう｜この人は殺されたんです。疑うなら、殺した人のほうでしょう」'],
    doubt: ['{b}は、蘇った{a}から一歩離れた。{b}「死んだふりだったんじゃないの？　最初から、全部｜死んだふりだったのではないか。最初から、全部｜死んだふりだったんじゃないですか。最初から、全部」',
      '{b}は誰にも聞こえないように呟いた。{b}「死なない人間なら、人を殺すのも怖くないよね｜死なない人間なら、人を殺すのも怖くないだろう｜死なない人間なら、人を殺すのも怖くないはずです」',
      '{b}は{a}の顔をじっと見つめたまま、テーブルの燭台を引き寄せた。{b}「……近づかないで｜……近づくな｜……近づかないでください」']
  };
  var OUT_ME = {
    immortal: ['{a}は首をさすり、困ったように笑った。{a}「……私は、死ねない体なんだ。黙っていて、悪かった｜……私は、死ねない体なのだ。黙っていて、すまなかった｜……私は、死ねない体なんです。黙っていて、すみませんでした」',
      '{a}は、ゆっくりと目を伏せた。{a}「何度死んでも、こうして戻ってくる。……だから、言えなかった｜＝｜何度死んでも、こうして戻ってくるんです。……だから、言えませんでした」',
      '{a}は乾いた血のついた襟を見下ろした。{a}「信じてもらえないと思った。私は、死なないんだ｜信じてもらえないと思った。私は、死なないのだ｜信じてもらえないと思いました。私は、死なないんです」'],
    vampire: ['{a}は口元を手で覆った。指の隙間から、鋭い牙がのぞいていた。{a}「……私は、人の血で生きるものだ。でも、あなたたちを襲うつもりはない｜＝｜……私は、人の血で生きるものです。でも、あなたたちを襲うつもりはありません」',
      '{a}は窓の外の吹雪に目をやった。{a}「夜の生き物は、簡単には死なない。……知られたくなかった｜夜の生き物は、簡単には死なない。……知られたくはなかった｜夜の生き物は、簡単には死にません。……知られたくなかったんです」',
      '{a}は青白い指先で、閉じかけた傷をなぞった。{a}「怖がらせてごめん。私は、吸血鬼なんだ｜怖がらせてすまない。私は、吸血鬼だ｜怖がらせてごめんなさい。私は、吸血鬼なんです」']
  };
  /* 推理への影響：clear＝被害者なので容疑から外す／doubt＝死んだふりを疑う。{d}＝探偵役 {a}＝蘇った人 */
  var DED = {
    clear: ['{d}は手帳に一行を書き足した。――{a}は確かに一度殺された。犯人が、自分の手で殺した相手をわざわざ蘇らせる理由はない。{d}は、{a}の名前を容疑者の欄から消した。',
      '{d}は、蘇った{a}の首の傷をもう一度確かめた。背後から、迷いのない一撃だった。{d}「あなたは犯人じゃない。殺された側だ｜あなたは犯人ではない。殺された側だ｜あなたは犯人ではありません。殺された側です」',
      '{d}は皆を見回した。{d}「死んだはずの人が生きている。つまり犯人は、それを知らずに殺した。……犯人は、この中の別の誰かだ｜＝｜死んだはずの人が生きています。つまり犯人は、それを知らずに殺した。……犯人は、この中の別の誰かです」'],
    doubt: ['{d}は、蘇った{a}から目を離さなかった。死んだはずの人間が、平然とそこに立っている。{d}「……死んだふりだったのかもしれない。少なくとも、死を怖がる理由はない｜……死んだふりだったのかもしれない。少なくとも、死を恐れる理由はない｜……死んだふりだったのかもしれません。少なくとも、死を怖がる理由はありません」',
      '{d}は手帳の容疑者の欄に、{a}の名前を書き加えた。殺されても死なない人間なら、自分を被害者に見せかけることもできる。{d}は、その考えを誰にも言わずにおいた。',
      '{d}は{a}に聞こえないように、皆に囁いた。{d}「死なない体なら、自分を被害者にして疑いを逸らせる。……気をつけて｜死なない体なら、自分を被害者にして疑いを逸らせる。……気をつけろ｜死なない体なら、自分を被害者にして疑いを逸らせます。……気をつけてください」']
  };
  var P2K = { proud: 'question', stern: 'question', tsun: 'surprise', gentle: 'defend', devoted: 'defend', cool: 'doubt', free: 'surprise', shy: 'surprise', polite: 'doubt' };
  function pk3(S, l) { return l[Math.floor(S.rng() * l.length)]; }
  function outed(S, a) {
    if (a.ykOuted) return;
    a.ykOuted = true;
    var rng = S.rng, F = function (t, v) { return ST.fmt(t, v); }, c = S.cul;
    /* 見た人：その場にいる生存者（犯人・発狂中・閉じ込められた人は除く。犯人の反応は CUL で別に書く）。関係の深い人から2人まで */
    var obs = S.P.filter(function (q) { return q !== a && q !== c && q.alive && !q.gone && !q.bound && !q.mad; })
      .sort(function (x, y) { return Math.abs(Y.bond(S, y, a)) - Math.abs(Y.bond(S, x, a)); }).slice(0, 1 + (rng() < 0.5 ? 1 : 0));
    if (!obs.length) return;
    var kinds = [];
    var t = obs.map(function (b) {
      var per = (HK.personaOf ? HK.personaOf(b) : b.persona) || 'gentle', k = P2K[per] || 'surprise', ct = Y.cat(S, b, a), w = Y.bond(S, b, a);
      if (ct === 'love' || ct === 'family' || w >= 0.6) k = 'defend';
      else if (ct === 'bad' || w <= -0.2) k = 'doubt';
      else if (b.isDet && k !== 'doubt') k = 'question';
      kinds.push(k);
      if (k === 'doubt') a.m.sus = clamp((a.m.sus || 0) + 8, 0, 100);
      if (k === 'defend') a.m.fear = clamp((a.m.fear || 0) - 6, 0, 100);
      return F(pk3(S, OUT[k]), { a: a.name, b: b.name });
    }).join('');
    t += F(pk3(S, OUT_ME[a.spec] || OUT_ME.immortal), { a: a.name });
    var lab = { surprise: '驚く', question: '問い詰める', defend: 'かばう', doubt: '疑う' };
    var o = ST.say(S, { actors: [a].concat(obs), tag: '正体', kind: 'climax', text: t, why: a.name + 'の正体（' + SP.LABEL[a.spec] + '）が皆に知られた。' + obs.map(function (b, i) { return b.name + '：' + lab[kinds[i]]; }).join('・') + '（見た人の態度と関係で）', mag: 30 });
    ST.key(S, o, a.name + 'の正体が知られた');
    /* 推理への影響：探偵役が、蘇った人を容疑から外すか、死んだふりを疑うか */
    var ds = Y.investigators ? Y.investigators(S).filter(function (d) { return d !== a && d !== c && !d.bound; }) : [];
    var d = ds[0];
    if (!d) return;
    var pd = 0.3 + (d.tr.caution || 0) * 0.3 - Y.skill(d, 'obs') * 0.25 + kinds.filter(function (k) { return k === 'doubt'; }).length * 0.15 - kinds.filter(function (k) { return k === 'defend'; }).length * 0.1;
    var dk = rng() < clamp(pd, 0.08, 0.85) ? 'doubt' : 'clear', isC = a === c && !S.mot.nobody, why;
    if (dk === 'clear') {
      a.m.sus = clamp((a.m.sus || 0) - 15, 0, 100);
      if (!isC && c && !S.mot.nobody && Y.alive(c)) { S.pool.push({ type: 'talk', t: '死んだはずの' + a.name + 'が生きていると分かったとき、喜ぶより先に顔色を変えた者が一人だけいた' }); why = '蘇った' + a.name + 'は被害者なので、容疑から外れた。「死んだはずの人が生きている」ことが、犯人を探す手がかりになった'; }
      else why = '蘇った' + a.name + 'は被害者だとして、容疑から外れた' + (isC ? '（……' + a.name + 'こそが犯人だ。犯人が殺されて蘇った）' : '');
    } else {
      a.m.sus = clamp((a.m.sus || 0) + 18, 0, 100);
      if (isC) { S.pool.push({ type: 'obs', t: '死んでも死なない' + a.name + 'なら、自分を被害者に見せかけることもできた', found: true, by: d }); d.cnt.clue++; why = d.name + 'は、死んだふりを疑った。……' + a.name + 'こそが犯人だ（正しい疑い）'; }
      else { S.pool.push({ type: 'obs', t: '死んだはずの' + a.name + 'が生きていた――殺されたふりだったのかもしれない', found: true, by: d, misread: a }); why = d.name + 'は、蘇った' + a.name + 'の死んだふりを疑った（' + a.name + 'は犯人ではない。推理が' + a.name + 'の方へずれていく）'; }
    }
    ST.say(S, { actors: [d, a], tag: '推理', text: F(pk3(S, DED[dk]), { a: a.name, d: d.name }), why: why, mag: 26 });
  }
  function reactRevive(S, a) {
    var rng = S.rng, c = S.cul, F = function (t, v) { return ST.fmt(t, v); };
    outed(S, a);
    if (c && c !== a && c.alive && !c.gone && !c.bound) {
      var t = c.tr || {}, k = (t.cold || 0) > 0.55 ? 'cold' : (t.impulse || 0) > 0.5 ? 'shaken' : 'check';
      c.m.sus = clamp((c.m.sus || 0) + (k === 'shaken' ? 18 : k === 'check' ? 10 : 4), 0, 100);
      ST.say(S, { actors: [c, a], tag: '動揺', text: F(CUL[k][Math.floor(rng() * CUL[k].length)], { a: a.name, c: c.name }), why: '殺したはずの' + a.name + 'が蘇った（' + c.name + 'の反応：' + { cold: '平然を装う', shaken: '動揺する', check: '確かめに行く' }[k] + '）', mag: 24 });
    }
    var ds = Y.investigators ? Y.investigators(S).filter(function (d) { return d !== a && d !== c; }) : [];
    if (ds.length && Y.gainClue && rng() < 0.6) {
      var d = ds[0], tc = Y.gainClue(S, d, 'witness');
      if (tc) ST.say(S, { actors: [d, a], tag: '手がかり', text: F(CLUE[Math.floor(rng() * CLUE.length)], { a: a.name, d: d.name, t: tc }), why: '蘇った' + a.name + 'の証言', mag: 22 });
    }
  }
  function hourOf(day, ph) { return (day - 1) * 24 + ({ night: 22, morning: 8, noon: 12, eve: 17 }[ph] || 0); }
  Y.SPEC = {
    setup: function (S, input) {
      SP.setup(adapter(S, 0), S.P, function (p) { return input.perChar && input.perChar[p.i]; });
      S.P.forEach(function (p) { if (p.spec) p.roleLabel += '・' + SP.LABEL[p.spec]; });
    },
    /* 夜：渇いた吸血鬼が動く */
    night: function (S, day) {
      var A = adapter(S, hourOf(day, 'night'));
      S.P.forEach(function (p) { if (p.alive && !p.gone && !p.bound && !p.mad) SP.vampTurn(A, p); });
    },
    /* 朝・昼・夕方の頭：蘇り・発狂中の人の番・渇き */
    revive: function (S, day, ph) {
      var A = adapter(S, hourOf(day, ph || 'morning'));
      SP.revive(A);
      S.P.forEach(function (p) {
        if (!p.alive || p.gone || p.bound) return;
        if (p.mad) SP.madTurn(A, p);
        else if (p.spec === 'vampire') SP.vampTurn(A, p);
      });
    },
    /* 場面の終わり：特殊役職の精神の摩耗 */
    wear: function (S, day, ph) {
      var A = adapter(S, hourOf(day, ph));
      S.P.forEach(function (p) { if (p.alive && !p.gone) SP.wear(A, p, { base: 60, lim: 20 }); });
    },
    danger: function (p) { return SP.danger(p); },
    note: function (p) { return SP.endNote(p); }
  };
})();
