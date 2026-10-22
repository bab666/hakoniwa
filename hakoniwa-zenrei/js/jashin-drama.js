/* 箱庭シミュレーター: 邪神村RTA ― 人間関係の変化と関係図
   ・村で過ごすうちに、関係が深まったり、こじれたりする（語らい・寄り添い・共闘・口論・疑い・仲直り・告白・嫉妬）
   ・疑似親子（親代わり）の二人には、どちらかが実はこの村の出身だった、という秘密が明かされることがある
   ・追い詰められた人は、仲間を村に売ったり、一人だけ逃げたりして裏切る。裏切りがばれると、一行から締め出される
   ・結果画面に関係図を出す（最初の関係＋村で生まれた・変わった関係＋かばった・救った・裏切った・殺した） */
(function () {
  'use strict';
  var HK = window.HK, ST = HK.Story, JS = HK.JASHIN, clamp = HK.clamp;
  if (!ST || !JS) return;
  function L(s) { return s.split('|'); }
  function F(t, m) { return ST.fmt(t, m); }
  var T = {
    talk: L('{a}と{b}は、眠れない夜を囲炉裏の前で語り明かした。村の外の話をしているあいだだけ、怖さを忘れられた。|{a}は、{b}に自分の昔の話をした。こんな場所でなければ、話さなかったはずの話だった。|{a}と{b}は、民宿の縁側で星を見上げた。この村の星は、どこか数が多すぎた。'),
    protect: L('{b}が震えていると、{a}が黙って隣に座った。「大丈夫。朝まで起きてるから」|{a}は怯える{b}の部屋の前で、一晩中見張りに立った。外の足音が近づくたび、{a}は扉を背中で押さえた。'),
    team: L('{a}と{b}は、二人で村の地図を描き直した。いつの間にか、息の合った相棒のようになっていた。|{a}と{b}は、背中合わせで神社の裏を調べた。互いの足音だけが、頼りだった。'),
    shared: L('{a}と{b}は、{v}のいた場所の前で、肩を寄せ合って泣いた。|{a}は、{v}を失った{b}の背中を、ずっとさすっていた。'),
    quarrel: L('{a}と{b}は、民宿の廊下で怒鳴り合った。「お前のせいで、こんな村に来たんだ！」|{a}は{b}の言葉に我慢できず、膳をひっくり返して席を立った。村人たちが、障子の隙間からそれを見て笑っていた。'),
    distrust: L('{a}は、{b}が夜中に村人と話しているのを見てしまった。それ以来、{b}の顔をまともに見られなかった。|{a}は、{b}の言葉に一つだけ嘘が混じっていることに気づいた。'),
    makeup: L('{a}と{b}は、口論のあと、黙って並んで座った。「……疑って、悪かった」|{a}は{b}に頭を下げた。「あのときは、怖かったんだ」――{b}は、少し笑って頷いた。'),
    confess: L('{a}は、{b}の手を取った。「こんなときに言うことじゃないけど……ずっと、好きだった」|祭り囃子にかき消されそうな声で、{a}は{b}に想いを告げた。「生きて帰れたら、一緒にいてほしい」'),
    yes: L('{b}は少し驚いて、それから{a}の手を握り返した。|{b}は泣きそうな顔で笑った。「……生きて帰ったら、ちゃんと聞かせて」'),
    no: L('{b}は、困ったように目を伏せた。「……ごめん」|{b}は、何も答えなかった。その沈黙が、答えだった。'),
    jealous: L('{a}は、{b}と{c}が親しげに話しているのを見て、胸の奥がざらついた。|{a}は、{c}をかばう{b}の背中を見つめていた。どうして、自分じゃないのか。')
  };
  /* 疑似親子：実は村の出身だった */
  var PP = {
    child: L('村の老婆が、{b}の顔を見て息を呑んだ。「その子は……二十年前の祭りの晩に消えた、巫女の子じゃ」――{a}は、震える手で{b}の肩を抱いた。{b}を拾ったのは、この山のふもとだった。|{a}は、ずっと隠していたことを打ち明けた。「お前を見つけたのは、この村の外れの祠の前だった。……お前は、ここで生まれたんだ」'),
    child_end: L('――村人たちの目の色が変わった。「御子さまが、お戻りになった」{b}は、今年の祭りの「器」に選ばれた。{a}は、{b}の前に立ちはだかった。「この子は渡さない」|――{b}は呆然と{a}を見た。「……どうして、今まで黙ってたの」{a}は答えられなかった。'),
    parent: L('村人の一人が、{a}を指さして叫んだ。「お前……戻ってきたのか。祭りから逃げた、あの晩の娘っ子じゃろう」――{a}は、この村の出身だった。|{a}は観念したように言った。「……私は、この村で生まれた。祭りの夜に、一人で逃げたんだ。{b}を、ここにだけは連れてきたくなかった」'),
    parent_end: L('――{a}は、村の禁忌を一つずつ{b}に話した。それは、何よりの手がかりだった。村人たちは、裏切り者を見る目で{a}を睨んだ。|――{b}は黙って{a}の手を握った。「……生まれた場所なんて、関係ない」'),
    betray: L('夜半、{a}は眠る{b}の枕元に座っていた。「ごめんね。……あなたは、最初から、この村に返すために育てたの」――{a}が戸を開けると、村人たちが待っていた。|{a}は、{b}を「見せたいものがある」と神社の奥へ連れ出した。そこには、白い着物が用意されていた。「お前は、この村の子なんだ。……返さなきゃいけない」'),
    regret: L('{a}は、{b}が連れていかれた座敷牢の前で、膝をついた。「……やっぱり、できない」{a}は鍵を壊し、{b}の手を引いて走り出した。|{a}は自分のしたことに耐えられず、夜の村へ飛び出した。「返してくれ！　あの子を返してくれ！」')
  };
  /* 裏切り */
  var BT = {
    sell: L('{a}は、村の長老の家を一人で訪ねた。「{b}の居場所を教える。だから、私だけは見逃してくれ」――長老は、満足げに頷いた。|{a}は震える声で村人に告げた。「生贄なら、{b}がいい。あいつは、村の秘密を嗅ぎ回ってる」'),
    sold: L('その夜、{b}の部屋に村人たちが押し入った。{b}は、なぜ居場所が知られていたのか分からないまま、連れ去られた。'),
    run: L('{a}は、皆が眠っている隙に、一つしかない懐中電灯と地図を持ち出した。そして、一人で村を出た。|{a}は、{b}と二人で見つけた抜け道を、誰にも言わずに一人で使った。'),
    found: L('{c}は、{a}が村の長老の家から出てくるのを見てしまった。「……お前が、売ったのか」|{c}は、{a}の荷物から村人の渡したお守りを見つけた。「これ、何。……村と取引したの？」'),
    cast: L('一行は、{a}を民宿から締め出した。「二度と戻ってくるな」――{a}は、一人で夜の村に立ち尽くした。|一行は、{a}を土蔵に閉じ込めた。{a}は扉を叩き続けたが、誰も開けなかった。')
  };

  function rk(a, b) { return a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i; }
  function bond(S, a, b) { return JS.REL ? JS.REL.bond(S, a, b) : 0; }
  function ties(S, a, b) { return (S.ties || []).filter(function (t) { return (t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i); }); }
  function has(S, a, b, list) { return ties(S, a, b).some(function (t) { return list.split(',').indexOf(t.type) >= 0; }); }
  function live(S) { return S.P.filter(function (p) { return JS.alive(p) && !p.bound; }); }
  function setRel(S, a, b, d, lab, from) {
    S.relD = S.relD || {}; S.relLab = S.relLab || {}; S.relDir = S.relDir || {};
    var k = rk(a, b);
    S.relD[k] = clamp((S.relD[k] || 0) + d, -1, 1); if (lab) S.relLab[k] = lab;
    if (from) S.relDir[k] = from.i; else delete S.relDir[k];
  }
  /* 出来事の線（かばった・救った・裏切った・殺した） */
  function edge(S, a, b, lab, cls, from) {
    if (!a || !b || a.i == null || b.i == null || a === b) return;
    S.evEdges = S.evEdges || [];
    S.evEdges.push({ a: a.i, b: b.i, label: lab, cls: cls, dir: from ? from.i : null });
  }

  /* ---------- 毎時の人間ドラマ ---------- */
  function tick(S, L0, h) {
    var rng = S.rng, P = live(S);
    if (P.length < 2) return;
    pparent(S, P, h);
    betrayal(S, P, h);
    if (rng() > 0.4) return;
    var opts = [], lastDead = S.P.filter(function (p) { return !p.alive && p.i != null; }).pop();
    P.forEach(function (a) {
      P.forEach(function (b) {
        if (a === b) return;
        var w = bond(S, a, b);
        if (a.i < b.i) {
          if (w < -0.1) { opts.push([a, b, 'quarrel', 0.5]); opts.push([a, b, 'makeup', 0.2 + a.tr.np * 0.3 + (S.found.length >= 3 ? 0.3 : 0)]); }
          else { opts.push([a, b, 'talk', 0.4 + a.tr.np * 0.3 + b.tr.np * 0.3]); opts.push([a, b, 'team', 0.35]); }
          if (lastDead && bond(S, a, lastDead) >= 0.3 && bond(S, b, lastDead) >= 0.3) opts.push([a, b, 'shared', 1]);
        }
        if (w >= -0.1 && b.m.fear > 55) opts.push([a, b, 'protect', 0.3 + a.tr.np * 0.5]);
        if (w >= 0.3 && !has(S, a, b, 'lover,mate,fated') && !S.ties.some(function (t) { return ((t.a === a.i && t.b === b.i) || (t.a === b.i && t.b === a.i)) && HK.tieNoLove(t); }) && (!HK.canLove || HK.canLove(a, b)) && !S.dConfess) opts.push([a, b, 'confess', 0.25 + a.tr.fc * 0.4 + w * 0.4]);
        if (a.tr.a > 0.5 && (b.traitor || b.plot || b.sold)) opts.push([a, b, 'distrust', 0.6]);
        if (S.ties.some(function (t) { return t.type === 'crush' && t.a === a.i && t.b === b.i; })) { var c = P.filter(function (q) { return q !== a && q !== b && bond(S, b, q) > 0.4; })[0]; if (c) opts.push([a, b, 'jealous', 0.5, c]); }
      });
    });
    if (!opts.length) return;
    var o = HK.weighted(rng, opts, function (x) { return x[3]; }), a = o[0], b = o[1], k = o[2];
    var m = { a: a.name, b: b.name, c: o[4] ? o[4].name : '', v: lastDead ? lastDead.name : '' }, t = F(ST.pick(S, T[k]), m), why = '';
    if (k === 'talk') { setRel(S, a, b, 0.15, '打ち解けた'); why = '眠れない夜に、距離が縮まった'; }
    if (k === 'protect') { setRel(S, a, b, 0.2, '信頼', a); b.m.fear = clamp(b.m.fear - 12, 0, 100); why = a.name + 'は怯える' + b.name + 'を放っておけなかった（NP）'; }
    if (k === 'team') { setRel(S, a, b, 0.15, '相棒'); why = '二人で調べるうちに、息が合ってきた'; }
    if (k === 'shared') { setRel(S, a, b, 0.2, '支え合う'); why = '同じ人を失った者どうし'; }
    if (k === 'quarrel') { setRel(S, a, b, -0.15, '険悪'); S.hostile = clamp(S.hostile + 3, 0, 100); why = '恐怖が、二人の仲をこじらせた（村人に隙を見せた）'; }
    if (k === 'makeup') { setRel(S, a, b, 0.3, '和解'); why = '命がかかって、意地を張るのをやめた'; }
    if (k === 'distrust') { setRel(S, a, b, -0.2, '不信', a); why = a.name + 'の観察眼が、' + b.name + 'の綻びを捉えた'; }
    if (k === 'jealous') { setRel(S, a, o[4], -0.15, '嫉妬', a); why = a.name + 'は' + b.name + 'に片想いしている'; }
    if (k === 'confess') {
      S.dConfess = true;
      var yes = rng() < 0.25 + bond(S, b, a) * 0.5 + b.tr.warmth * 0.2;
      t += F(ST.pick(S, yes ? T.yes : T.no), m);
      if (yes) { S.ties.push({ a: a.i, b: b.i, type: 'lover', born: true }); setRel(S, a, b, 0.2, '恋人'); a.m.fear = clamp(a.m.fear - 15, 0, 100); b.m.fear = clamp(b.m.fear - 15, 0, 100); why = 'この村で、恋が実った（恐怖がやわらぐ）'; }
      else { S.ties.push({ a: a.i, b: b.i, type: 'crush', born: true }); setRel(S, a, b, -0.05, '片想い', a); why = '想いは届かなかった'; }
      var o2 = ST.say(S, { actors: [a, b], tag: '想いを告げる', kind: 'climax', text: t, why: why, mag: 32 }); ST.key(S, o2, a.name + 'が' + b.name + 'に告白');
      return;
    }
    ST.sayB(S, { actors: o[4] ? [a, b, o[4]] : [a, b], tag: '関係', text: t, why: why + '（' + a.name + '×' + b.name + '）' }, a.name + 'と' + b.name);
  }

  /* 疑似親子の秘密（一度だけ） */
  function pparent(S, P, h) {
    var rng = S.rng;
    if (S.ppDone || h < 6 || rng() > 0.14) return;
    var t = S.ties.filter(function (x) { return x.type === 'pparent'; }).filter(function (x) { var a = S.P[x.a], b = S.P[x.b]; return a && b && JS.alive(a) && JS.alive(b) && !a.bound && !b.bound; })[0];
    if (!t) return;
    S.ppDone = true;
    var a = S.P[t.a], b = S.P[t.b], m = { a: a.name, b: b.name };
    var w = { child: 1, parent: 0.8, betray: a.tr.cold * 1.2 + (1 - a.tr.warmth) * 0.4 - 0.3 };
    var k = HK.weighted(rng, Object.keys(w), function (x) { return Math.max(0.05, w[x]); }), o;
    if (k === 'child') {
      b.villager = true; setRel(S, a, b, 0.25, '守る', a); edge(S, a, b, '村から守る', 'guard', a);
      o = ST.say(S, { actors: [a, b], tag: '出自', kind: 'climax', text: F(ST.pick(S, PP.child), m) + F(ST.pick(S, PP.child_end), m), why: '疑似親子の秘密：' + b.name + 'は、実はこの村で生まれた子だった（生贄に選ばれやすくなる。' + a.name + 'はかばいやすくなる）', mag: 46 });
    } else if (k === 'parent') {
      a.villager = true; S.hostile = clamp(S.hostile + 10, 0, 100);
      var gi = S.G.clues.map(function (c, i) { return i; }).filter(function (i) { return S.found.indexOf(i) < 0; })[0], ex = '';
      if (gi != null) { S.found.push(gi); a.cnt.clue++; ex = '――' + S.G.clues[gi].t + '。'; }
      setRel(S, a, b, 0.2, '秘密を明かした', a);
      o = ST.say(S, { actors: [a, b], tag: '出自', kind: 'climax', text: F(ST.pick(S, PP.parent), m) + F(ST.pick(S, PP.parent_end), m) + ex, why: '疑似親子の秘密：親代わりの' + a.name + 'は、この村から逃げた人だった（手がかり +1・村人の敵意 +10）', mag: 46 });
    } else {
      b.taken = true; b.takenAt = h; setRel(S, a, b, -0.6, '裏切り', a); edge(S, a, b, '村に返した', 'enemy', a); a.traitor = true;
      o = ST.say(S, { actors: [a, b], tag: '裏切り', kind: 'climax', text: F(ST.pick(S, PP.betray), m), why: '疑似親子の秘密：' + a.name + 'は、' + b.name + 'を村に返すために育てていた（ドライさ・温かさの低さ）。' + b.name + 'は連れ去られた', mag: 50 });
      S.ppRegret = { a: a, b: b, h: h };
    }
    ST.key(S, o, '疑似親子の秘密');
  }
  /* 裏切り（仲間を村に売る・一人で逃げる）と、その発覚 */
  function betrayal(S, P, h) {
    var rng = S.rng;
    /* 疑似親子の後悔 */
    if (S.ppRegret && h - S.ppRegret.h >= 4 && rng() < 0.3) {
      var R = S.ppRegret; S.ppRegret = null;
      if (JS.alive(R.a) && R.b.alive && R.b.taken && R.a.tr.np + R.a.tr.warmth > 0.6) {
        R.b.taken = false; setRel(S, R.a, R.b, 0.5, '後悔と和解', R.a); edge(S, R.a, R.b, '取り返した', 'guard', R.a);
        ST.say(S, { actors: [R.a, R.b], tag: '後悔', kind: 'climax', text: F(ST.pick(S, PP.regret), { a: R.a.name, b: R.b.name }), why: R.a.name + 'は、育てた情に勝てなかった（NP・温かさ）', mag: 44 });
      }
    }
    /* ばれる */
    S.P.forEach(function (a) {
      if (!a.sold || a.castOut || !JS.alive(a)) return;
      var seer = P.filter(function (c) { return c !== a && JS.skill(c, 'obs') > 0.45; })[0];
      if (!seer || rng() > 0.25) return;
      a.castOut = true; a.action = JS.ACTIONS.filter(function (x) { return x.id === 'alone'; })[0] || a.action;
      P.forEach(function (c) { if (c !== a) setRel(S, c, a, -0.4, '裏切り者', c); });
      edge(S, seer, a, '告発', 'enemy', seer);
      var o = ST.say(S, { actors: [seer, a], tag: '発覚', kind: 'climax', text: F(ST.pick(S, BT.found), { a: a.name, c: seer.name }) + F(ST.pick(S, BT.cast), { a: a.name }), why: a.name + 'の裏切りが、' + seer.name + 'にばれた（観察）。' + a.name + 'は一行から締め出され、一人で動くしかなくなった', mag: 42 });
      ST.key(S, o, a.name + 'の裏切りが露見');
    });
    if (S.betrays >= 2 || h < 8 || rng() > 0.06) return;
    /* 裏切る人：冷たく、温かさが低く、追い詰められている */
    var cand = P.filter(function (a) { return !a.sold && a.tr.cold * 0.6 + (1 - a.tr.warmth) * 0.4 + a.m.fear / 200 + (a.goal.id === 'escape' ? 0.2 : 0) > 0.85; });
    if (!cand.length) return;
    var a = HK.weighted(rng, cand, function (x) { return x.tr.cold + x.m.fear / 100; });
    var vs = P.filter(function (b) { return b !== a && bond(S, a, b) < 0.5; });
    if (!vs.length) return;
    var b = HK.weighted(rng, vs, function (x) { return 1 + Math.max(0, -bond(S, a, x)) * 2 + x.cnt.clue * 0.5; });
    S.betrays = (S.betrays || 0) + 1;
    if (rng() < 0.6) {
      a.sold = true; b.taken = true; b.takenAt = h; S.hostile = clamp(S.hostile - 5, 0, 100);
      setRel(S, a, b, -0.5, '裏切り', a); edge(S, a, b, '村に売った', 'enemy', a);
      var o = ST.say(S, { actors: [a, b], tag: '裏切り', kind: 'climax', text: F(ST.pick(S, BT.sell), { a: a.name, b: b.name }) + F(ST.pick(S, BT.sold), { a: a.name, b: b.name }), why: a.name + 'は自分だけ助かるために、' + b.name + 'を村に売った（ドライさ・温かさの低さ・恐怖 ' + Math.round(a.m.fear) + '）', mag: 46 });
      ST.key(S, o, a.name + 'が' + b.name + 'を売った');
    } else {
      a.out = true; a.esc = h - 1 + rng() * 2; a.fate = '仲間を見捨てて一人で脱出（' + JS.hm(a.esc) + '）';
      P.forEach(function (c) { if (c !== a) setRel(S, c, a, -0.3, '見捨てられた', c); });
      edge(S, a, b, '見捨てた', 'enemy', a);
      var o2 = ST.say(S, { actors: [a, b], tag: '裏切り', kind: 'climax', text: F(ST.pick(S, BT.run), { a: a.name, b: b.name }) + '――翌朝、' + a.name + 'の布団は空っぽだった。', why: a.name + 'は、仲間を見捨てて一人で逃げた（ドライさ・恐怖）', mag: 44 });
      ST.key(S, o2, a.name + 'が一人で逃げた');
    }
  }

  /* ---------- 関係図 ---------- */
  function relmap(S) {
    var P = S.P, edges = [];
    var CLS = { lover: 'love', sibbad: 'enemy', bad: 'enemy', mate: 'love', fated: 'love', almost: 'love', fwb: 'night', crush: 'pine', enemy: 'enemy', rival: 'enemy', ex: 'obsess', buddy: 'partner', best: 'friend', friend: 'friend', childhood: 'friend', sibling: 'guard', sibprot: 'guard', sibclose: 'guard', parent: 'guard', pparent: 'guard', master: 'partner', mentor: 'partner', teacher: 'partner', senpai: 'friend', colleague: 'friend', acq: 'none' };
    (S.ties || []).forEach(function (t) { var lab = HK.TIES && HK.TIES[t.type] ? HK.TIES[t.type].label : t.type; edges.push({ a: t.a, b: t.b, label: (t.born ? '★' : '') + lab, cls: CLS[t.type] || 'friend', dir: t.type === 'crush' || (HK.TIES && HK.TIES[t.type] && HK.TIES[t.type].dir) ? t.a : null }); });
    Object.keys(S.relLab || {}).forEach(function (k) {
      var ab = k.split('-'), lab = S.relLab[k];
      if (lab === '恋人' || lab === '片想い') return;
      var cls = /険悪|裏切|見捨て/.test(lab) ? 'enemy' : /不信|嫉妬/.test(lab) ? 'obsess' : /信頼|支え合う|和解|守る|秘密/.test(lab) ? 'guard' : /相棒/.test(lab) ? 'partner' : 'friend';
      edges.push({ a: +ab[0], b: +ab[1], label: '★' + lab, cls: cls, dir: S.relDir && S.relDir[k] != null ? S.relDir[k] : null });
    });
    (S.evEdges || []).forEach(function (e) { edges.push({ a: e.a, b: e.b, label: '★' + e.label, cls: e.cls, dir: e.dir }); });
    return {
      nodes: P.map(function (p) { return { i: p.i, name: p.name, sub: (JS.JOB[p.job] || {}).label + (p.plot ? '・企み' : '') + (p.villager ? '・村の出' : ''), dead: !p.alive, fate: p.fate }; }),
      edges: edges, note: '★は村で生まれた・変わった関係と出来事。矢印は気持ちや行為の向き。'
    };
  }

  JS.DRAMA = { tick: tick, edge: edge, relmap: relmap, setRel: setRel };
})();
