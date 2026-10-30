/* 箱庭シミュレーター: 出られない部屋 ― 脱出の時間が迫ったときの、切羽詰まったやりとり（全年齢版・R18版の共通。2026-10-30 担当W2）
   利用者の要望（2026-10-30）：「部屋の脱出時間が迫っても、楽しげな交流が多く発生するので、切羽詰まったり、条件を一切クリアできてないなら
     『そろそろ覚悟を決めないと……』といったやりとりなどが欲しい。恐怖をもっていたりすると追い詰められ方も強いだろう。それに対する相手の反応も色々ありそうだ」
   ■ 段階：残り時間（区切りの進み。残り 3 割以下＝late、1 割以下＝last）と、二人の条件の達成度（まったく／少し／半分／あと少し）
   ■ 出来事（どれも残り 3 割以下で、まだ条件を満たしていない二人だけ）
     ・rp_brink   「そろそろ覚悟を決めないと……」の切り出し（言い出す側の態度9種）と相手の反応（開き直る・泣き出す・怒る・段取りを話す・気遣う・自分が引き受けると言う・責める）
     ・rp_clock   時計を見る沈黙（達成度で書き分け）
     ・rp_refuse  条件を言い出す側と拒む側の往復（二往復）
     ・rp_reality 「このままだと二人とも出られない」の現実の確認（達成度で台詞を変える）
     ・rp_one     一人しか出られない部屋の「どっちが出るか」の詰め
     ・rp_trio    三人以上の部屋の「誰と誰が」
     ・rp_dread   条件が傷つける・ロシアンルーレット・誰かを殺す（全年齢は気絶させる）なら、恐怖の高まり
     ・rp_fear    関係「恐怖」の二人：恐れる側の追い詰められ方（震える・黙る・言いなりになる・取り乱す）と、恐れられる側の反応（苛立つ・無理に落ち着かせる・利用する）
     ・rp_urge    条件を満たした人が、まだの人を急かす・慰める
     ・rp_food    飲み切る・食べ切る条件（激辛ラーメン・酒など）が残っている焦り
   ■ 重み：残り時間が少ないほど、まだ条件を満たしていない人の「楽しげな交流」（bond・romance の、条件を進めない出来事）を下げ、上の出来事を上げる。
     条件を満たした人は今までどおり（Ctx.bias を HK.wrap で包む。出られない部屋のときだけ）
   ■ 文：地の文は 1 分岐 3 文以上。台詞は 3 本「くだけた常体｜硬い常体｜敬語」（一人称「私」・二人称「あなた」）。
     部屋の数え上げ（scenario-room.js の countFlavor）に拾われないよう、どの記録にも「扉」の字を入れ、触れ合いの言い回し（手を繋ぐ・抱く・キスなど）は書かない。
     恋愛・R18にしない組（HK.ngPair）・家族の組では、触れ合いの条件（キス以上）・「好き」の条件の覚悟を迫らない。体の関係を持てない組（HK.Pos.okSex）にエッチの条件の覚悟を迫らない。
   登場人物はすべて成人として扱う */
(function () {
  'use strict';
  var HK = window.HK, A = HK && HK.RoomAPI, scen = HK && HK.SCENARIOS && HK.SCENARIOS.whiteroom;
  if (!HK || !A || !scen || !A.EV || !HK.addTo) return;
  var K = A.K;
  function L(s) { return s.split('|'); }
  function ev(o) { HK.addTo(A.EV, o); }
  var PS = ['proud', 'stern', 'tsun', 'gentle', 'devoted', 'cool', 'free', 'shy', 'polite'];
  function ps(c) { var p = c && (HK.personaOf ? HK.personaOf(c) : c.persona); return PS.indexOf(p) >= 0 ? p : 'gentle'; }
  function R(ctx, a, b) { return ctx.R(a, b); }

  /* ---------- 段階 ---------- */
  /* 残り時間の割合（0〜1）。区切りの進みで数える */
  function remOf(ctx) { return 1 - (ctx.stepIndex || 0) / Math.max(1, (ctx.stepsTotal || 2) - 1); }
  function stageOf(ctx) { var r = remOf(ctx); return r <= 0.1 + 1e-9 ? 'last' : r <= 0.3 + 1e-9 ? 'late' : ''; }
  /* 残りの時間の言い方（「あと 3 時間」など） */
  function hoursLeft(ctx) {
    var H = +(ctx.env && ctx.env.hours) || 0, h = Math.max(1, Math.round(H - (ctx.stepIndex || 0) * (ctx.stepH || 1)));
    return h >= 24 ? Math.floor(h / 24) + '日' + (h % 24 ? 'と' + (h % 24) + '時間' : '') : h + '時間';
  }
  function here(ctx, c) { return !!c && c.alive !== false && !c.out && !(c.flags && (c.flags.down || c.flags.knocked || c.flags.caged != null)); }
  function pk(ctx, arr) { return ctx.pick(arr); }

  /* 家族・恋愛にしない組 */
  var LOVE_T = { lover: 1, spouse: 1, mate: 1, fated: 1, fiance: 1, honmei: 1 }, FAM_T = { sibling: 1, parent: 1, pparent: 1, sibprot: 1, sibclose: 1, sibbad: 1, stepsib: 1, relative: 1 };
  var HATE_T = { enemy: 1, rival: 1, bad: 1 }, RANK_T = { master: 1, boss: 1, teacher: 1, mentor: 1, senpai: 1 }, FRIEND_T = { friend: 1, best: 1, childhood: 1, classmate: 1, colleague: 1, buddy: 1, acq: 1, almost: 1 };
  function tieTy(ctx, a, b) { var t = HK.Ties && HK.Ties.get ? HK.Ties.get(ctx, a, b) : null; return t ? t.type : ''; }
  function isFam(ctx, a, b) { return !!(ctx.pair(a, b).kin || FAM_T[tieTy(ctx, a, b)]); }
  function relOf(ctx, a, b) {
    var ty = tieTy(ctx, a, b), pf = ctx.pair(a, b), ab = R(ctx, a, b), ba = R(ctx, b, a);
    if (pf.kin || FAM_T[ty]) return 'fam';
    if (HATE_T[ty] || Math.max(ab.ten, ba.ten) >= 45) return 'hate';
    if (LOVE_T[ty] || pf.couple || (ab.att >= 50 && ba.att >= 50 && HK.canLove && HK.canLove(a, b) && HK.canLove(b, a))) return 'love';
    if (RANK_T[ty]) return 'rank';
    if (FRIEND_T[ty] || (ab.aff >= 30 && ba.aff >= 30)) return 'friend';
    return 'plain';
  }

  /* ---------- 達成度 ---------- */
  /* 二人で数える条件のうち、この二人が進められるもの（体の関係を持てない組のエッチ・恋愛にしない組や家族の触れ合い・「好き」は除く） */
  function feasible(ctx, r, a, b) {
    var T = K[r.k];
    if (!T || (T.type !== 'act' && T.type !== 'word' && T.type !== 'hurt')) return false;
    if (T.type === 'act' && T.lvl >= 5 && !A.okSex(a, b)) return false;
    if (((T.type === 'act' && T.lvl >= 3) || r.k === 'love') && (HK.ngPair(a, b) || isFam(ctx, a, b))) return false;
    return true;
  }
  /* 一つの条件の進み（0〜1） */
  function ruleFr(ctx, r, a, b) {
    var T = K[r.k];
    if (!T || T.type === 'one') return 0;
    if (A.isGlob(T)) { if (A.globDone(ctx, r)) return 1; var lf = A.globLeft(ctx, r); return lf > 0 ? Math.max(0, (r.n - lf) / r.n) : 0; }
    if (!a || !b) return 0;
    if (A.ruleDone(ctx, r, a, b)) return 1;
    var k = a.i < b.i ? a.i + '-' + b.i : b.i + '-' + a.i, p = ctx.flags.prog && ctx.flags.prog[k];
    if (!p) return 0;
    if (T.type === 'word') { var x = (p.said || {})[r.k + a.i] || 0, y = (p.said || {})[r.k + b.i] || 0; return T.mode === 'sum' ? Math.min(1, (x + y) / r.n) : Math.min(1, Math.min(x, y) / r.n); }
    return Math.min(1, ((p.act || {})[r.k] || 0) / r.n);
  }
  /* 二人の達成度（0〜1。済んでいれば 1）。条件の「一人しか出られない」だけの部屋は 0 */
  function frOf(ctx, a, b) {
    if (a && b && A.pairDone(ctx, a, b)) return 1;
    var rs = (ctx.rules || []).filter(function (r) { return K[r.k] && K[r.k].type !== 'one'; });
    if (!rs.length) return 0;
    return rs.reduce(function (s, r) { return s + ruleFr(ctx, r, a, b); }, 0) / rs.length;
  }
  function levelOf(fr) { return fr <= 0 ? 'none' : fr < 0.34 ? 'some' : fr < 0.8 ? 'half' : 'near'; }
  /* a が条件を満たしている（部屋に残っている人のだれかと条件が済んでいる・自分から残った）か */
  function doneOf(ctx, a) {
    if (a.flags && a.flags.stayed) return true;
    if (!A.hasPairRule(ctx)) return (ctx.rules || []).every(function (r) { var T = K[r.k]; return !T || T.type === 'one' ? false : A.globDone(ctx, r); });
    return ctx.chars.some(function (o) { return o !== a && o.alive !== false && A.pairDone(ctx, a, o); });
  }
  /* a の切迫の強さ（0〜1）：残り時間が少なく、条件が進んでいないほど強い。条件を満たした人・まだ 3 割残っている時間は 0 */
  function urgOf(ctx, a) {
    var st = stageOf(ctx);
    if (!st || !a || doneOf(ctx, a)) return 0;
    var M = ctx._rpU || (ctx._rpU = {}), key = ctx.stepIndex + ':' + a.i;
    if (M[key] != null) return M[key];
    var rem = remOf(ctx), best = 0;
    ctx.chars.forEach(function (o) { if (o !== a && here(ctx, o)) best = Math.max(best, frOf(ctx, a, o)); });
    if (!A.hasPairRule(ctx)) best = frOf(ctx, null, null);
    var t = Math.min(1, 0.4 + (0.3 - rem) / 0.3 * 0.6);
    return (M[key] = Math.max(0, t * (1 - best * 0.55)));
  }
  HK.RoomPressure = { stage: stageOf, urg: urgOf, fr: frOf, level: levelOf };

  /* ---------- 楽しげな交流の重みを下げる（Ctx.bias を包む。出られない部屋のときだけ） ---------- */
  /* 切羽詰まりの側の出来事（下げない） */
  var TENSE = /^(rp_|r_resolve$|r_negotiate$|r_dilemma$|r_clock$|r_one_|r_whoWith$|r_refuse$|r_protect_cond$|discuss$|consent$|push$|panic$|resign$|pick_one$|sacrifice$|grab$|cond_kill$)/;
  /* 進行役（pri）の出来事のうち、楽しげな交流のもの（質問ごっこ。room-know.js） */
  var FUN_PRI = { r_ask: 1, r_answer_later: 1 };
  function hashOf(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; }
  function funEv(e) { return !!e && !e.sex && (!e.pri || FUN_PRI[e.id] === 1) && (e.cat === 'bond' || e.cat === 'romance') && !TENSE.test(e.id || ''); }
  if (HK.Ctx && HK.Ctx.prototype.bias) HK.wrap(HK.Ctx.prototype, 'bias', function (b0) {
    return function (a, cat, e) {
      var m = b0.apply(this, arguments);
      if (this.scen && this.scen.id === 'whiteroom') this._rpA = a;
      if (!e || !this.scen || this.scen.id !== 'whiteroom' || !(m > 0) || !funEv(e)) return m;
      var u = urgOf(this, a);
      if (!(u > 0)) return m;
      /* 揺らぎ（engine.js の act：重みを平均に寄せる）で、小さくした重みが戻らないように、切迫に応じた割合の出来事をこの区切りの候補から外す（乱数は使わない） */
      if (hashOf((e.id || '') + ':' + this.stepIndex + ':' + a.i) < u) return 0;
      return m * Math.max(0.05, 1 - u * 0.8);
    };
  });

  /* 小さな出来事（mini。大半が雑談・遊び）は、engine.js の act が「汎用の出来事の重みの合計 × miniShare」に揃え直すので、上の割引だけでは戻ってしまう。
     いま選んでいる人（Ctx.bias で覚えた ctx._rpA）の切迫に合わせて、出られない部屋の miniShare そのものを下げる（読むたびに計算する。ほかの箱庭には効かない） */
  var MS0 = scen.miniShare;
  try {
    Object.defineProperty(scen, 'miniShare', {
      configurable: true, enumerable: true,
      get: function () { var c = HK._curCtx; if (!c || !c.scen || c.scen.id !== 'whiteroom' || !c._rpA || c.stepIndex == null) return MS0; var u = urgOf(c, c._rpA); return u > 0 ? MS0 * Math.max(0.15, 1 - u * 0.9) : MS0; },
      set: function (v) { MS0 = v; }
    });
  } catch (e) { /* 定義できない環境では今までどおり */ }

  /* ---------- 文の材料 ---------- */
  var TIME = {
    late: L('残りの時間は、もう三割を切っていた。|閉じ込められてから、ずいぶん時間が経った。残りはあと{h}ほどだ。|時計の針は、思っていたよりずっと先まで進んでいた。'),
    last: L('照明が一段暗くなってから、だいぶ経っていた。残された時間は、もうわずかだった。|残りはあと{h}もない。扉が開く気配は、まだどこにもなかった。|時計の針が、最後の区切りに近づいていた。')
  };
  var LVL = {
    none: L('扉の紙の条件は、閉じ込められたときから一つも進んでいなかった。|扉の紙の数字は、最初に読んだときのまま、少しも減っていなかった。'),
    some: L('扉の紙の条件は、まだほとんど進んでいない。残っているのは、{left}。|扉の紙に目をやると、残りはまだ{left}もあった。'),
    half: L('扉の紙の条件は、ようやく半分を越えたところだった。残っているのは、{left}。|扉の紙の残りは{left}。半分は来たが、このままでは間に合いそうになかった。'),
    near: L('扉の紙の条件は、あと少しのところまで来ていた。残っているのは、{left}。|扉の紙の残りは、あと{left}だけだった。それが、かえって重かった。')
  };
  /* 関係ごとの一文（二人のあいだの空気） */
  var RELS = {
    love: L('{a}と{b}のあいだに、いつもの柔らかい空気はなかった。|大事な相手だからこそ、{a}はこの話を先延ばしにしてきた。'),
    fam: L('家族だからこそ、{a}も{b}も、この話をずっと避けてきた。|{a}は、{b}にこんな顔をさせたくなかった。家族なのに、言葉が出てこなかった。'),
    hate: L('普段なら、口もききたくない相手だった。それでも、ほかに話せる相手はいなかった。|{a}と{b}は、睨み合うようにして向かい合った。'),
    rank: L('立場の違いが、こんなときにも二人の言葉を硬くしていた。|{a}は、{b}との立場の違いを、いったん脇に置くことにした。'),
    friend: L('気心の知れた相手だからこそ、{a}はかえって言い出しにくかった。|いつもなら冗談で流せる相手なのに、今はそうもいかなかった。'),
    plain: L('ほとんど知らない相手に、こんな話をすることになるとは思わなかった。|{a}は、{b}のことをまだよく知らない。それでも、話すしかなかった。')
  };
  /* 「そろそろ覚悟を決めないと……」の切り出し（言い出す側 {a} の態度9種） */
  var BRINK = {
    proud: L('{a}「もう待てない。そろそろ覚悟を決めて｜もう待てない。そろそろ覚悟を決めろ｜もう待てません。そろそろ覚悟を決めてください」|{a}「もう時間がない。急いで｜もう時間がない。急げ｜もう時間がありません。急いでください」'),
    stern: L('{a}「残りの時間を考えると、もう先延ばしにはできない｜＝｜残りの時間を考えると、もう先延ばしにはできません」|{a}「決めるなら今だよ。後になるほど難しくなる｜決めるなら今だ。後になるほど難しくなる｜決めるなら今です。後になるほど難しくなります」'),
    tsun: L('{a}「……別に急かしてるわけじゃないけど。そろそろ覚悟、決めないと……｜……別に急かしているわけではない。だが、そろそろ覚悟を決めないと……｜……別に急かしているわけではありません。でも、そろそろ覚悟を決めないと……」|{a}「私だって嫌だよ。でも、このままじゃ出られないでしょ｜私だって嫌だ。だが、このままでは出られない｜私だって嫌です。でも、このままでは出られません」'),
    gentle: L('{a}「ねえ……そろそろ、覚悟を決めないといけないのかもしれない｜……そろそろ、覚悟を決めないといけないのかもしれない｜あの……そろそろ、覚悟を決めないといけないのかもしれません」|{a}「怖いのは分かる。でも、一緒に考えよう｜怖いのは分かる。だが、一緒に考えよう｜怖いのは分かります。でも、一緒に考えましょう」'),
    devoted: L('{a}「私は何でもする。だから、決めよう｜私は何でもする。だから決めよう｜私は何でもします。ですから、決めましょう」|{a}「私のことはいいから。あなたが外に出られる方法を考えよう｜私のことはいい。あなたが外に出られる方法を考えよう｜私のことはいいんです。あなたが外に出られる方法を考えましょう」'),
    cool: L('{a}「もう余裕はない。今決めないと間に合わない｜＝｜もう余裕はありません。今決めないと間に合いません」|{a}「迷うのは後。先に決めよう｜迷うのは後だ。先に決めよう｜迷うのは後です。先に決めましょう」'),
    free: L('{a}「……さすがに、ふざけてる場合じゃないね。そろそろ本気で覚悟しないと｜……さすがに、ふざけている場合ではないな。そろそろ本気で覚悟しないと｜……さすがに、ふざけている場合じゃないですね。そろそろ本気で覚悟しないと」|{a}「笑ってごまかすのも、もう限界かも。そろそろ決めよう｜笑ってごまかすのも、もう限界だ。そろそろ決めよう｜笑ってごまかすのも、もう限界かもしれません。そろそろ決めましょう」'),
    shy: L('{a}「あ、あの……そろそろ、覚悟、決めないと……だよね｜あ、あの……そろそろ、覚悟を決めないと……｜あ、あの……そろそろ、覚悟を決めないと……ですよね」|{a}「……こ、このままだと、本当に出られないよ……｜……このままでは、本当に出られない……｜……こ、このままだと、本当に出られません……」'),
    polite: L('{a}「失礼を承知で言うね。そろそろ、覚悟を決めないといけない｜失礼を承知で言う。そろそろ覚悟を決めねばならない｜失礼を承知で言います。そろそろ、覚悟を決めないといけません」|{a}「言いにくいけど、もう迷う時間はないよ｜言いにくいが、もう迷う時間はない｜言いにくいのですが、もう迷う時間はありません」')
  };
  /* 相手 {b} の反応（7 種）。o.mode が one（一人しか出られない）・trio（誰と誰が）のときは、合う言い方に替える */
  var REACT = {
    open: L('{b}はしばらく黙っていたが、やがて大きく息を吐いて、小さく笑った。「……分かった。もう、やるしかないね｜……分かった。もう、やるしかない｜……分かりました。もう、やるしかないですね」その声は、少しだけ震えていた。|{b}は扉の紙を睨んで、それから肩をすくめた。「……もう、開き直るしかないね｜……もう、開き直るしかない｜……もう、開き直るしかないですね」{b}の顔からは、さっきまでの迷いが消えていた。'),
    cry: L('{b}の目から、急に涙がこぼれた。「分かってる……分かってるけど、怖いよ｜分かっている……分かっているが、怖い｜分かっています……分かっていますけど、怖いんです」{a}は何も言えずに、{b}が落ち着くのを待った。|{b}は膝を抱えて、顔を伏せた。小さくしゃくり上げる声が、白い部屋に響いた。「どうして、こんなことに……｜どうして、こんなことに……｜どうして、こんなことになったんでしょう……」'),
    angry: L('{b}は勢いよく立ち上がった。「簡単に言わないで！ こんなの、おかしいよ｜簡単に言うな！ こんなことは、おかしい｜簡単に言わないでください！ こんなの、おかしいです」壁を叩いた音が、白い部屋に響いた。|{b}の顔が、さっと赤くなった。「急かされたって、できないものはできないよ！｜急かされても、できないものはできない！｜急かされても、できないものはできません！」{b}は扉を一度蹴って、黙り込んだ。'),
    plan: L('{b}は扉の紙を見上げて、指を折って数えた。「先に順番を決めよう。考えるのは、それから｜先に順番を決めよう。考えるのはそれからだ｜先に順番を決めましょう。考えるのは、それからです」{a}は少し驚いた顔で頷いた。|{b}は深呼吸をひとつして、床に座り直した。「落ち着こう。焦ると、できることもできなくなる｜落ち着こう。焦れば、できることもできなくなる｜落ち着きましょう。焦ると、できることもできなくなります」{b}は残りの時間を、声に出して数え始めた。'),
    care: L('{b}は{a}の顔を覗き込んだ。「私は平気。それより、あなたの顔色のほうが心配だよ｜私は平気だ。それより、あなたの顔色のほうが心配だ｜私は平気です。それより、あなたの顔色のほうが心配です」{a}は、自分の指先が冷たくなっていたことに気づいた。|{b}は自分の上着を脱いで、{a}の肩に掛けた。「無理しないで。一人で背負わなくていいから｜無理はするな。一人で背負わなくていい｜無理しないでください。一人で背負わなくていいんです」{a}は、こわばっていた肩の力を少しだけ抜いた。'),
    give: L('{b}は静かに首を振った。「無理はしなくていい。どうしても駄目なら、つらいところは私が引き受ける｜無理はするな。どうしても駄目なら、つらいところは私が引き受ける｜無理はしなくていいです。どうしても駄目なら、つらいところは私が引き受けます」{a}は言い返そうとして、言葉に詰まった。|{b}は笑ってみせた。ひどく下手な笑い方だった。「私のことはいい。あなたが外に出られるなら、それでいい｜私のことはいい。あなたが外に出られるなら、それでいい｜私のことはいいんです。あなたが外に出られるなら、それで」'),
    blame: L('{b}は{a}を睨みつけた。「そもそも、あなたがぐずぐずしてたからでしょ｜そもそも、あなたがぐずぐずしていたからだ｜そもそも、あなたがぐずぐずしていたからでしょう」{a}は言い返しかけて、時計を見て口をつぐんだ。|{b}は鼻で笑った。「今さら何？ 逃げてたのは、あなたでしょ｜今さら何だ。逃げていたのは、あなただ｜今さら何ですか。逃げていたのは、あなたでしょう」部屋の空気が、さらに冷えた。')
  };
  var REACT_ONE = {
    give: L('{b}は、しばらく扉を見つめていた。それから、ゆっくり{a}のほうを向いた。「いいよ。あなたが行って｜いい。あなたが行け｜いいんです。あなたが行ってください」{b}の声は、驚くほど静かだった。|{b}は首を振った。「私はいい。外で待っている人がいるのは、あなたのほうでしょ｜私はいい。外で待っている人がいるのは、あなたのほうだ｜私はいいです。外で待っている人がいるのは、あなたのほうでしょう」{a}は言葉を失った。'),
    blame: L('{b}は{a}を睨んだ。「勝手に決めないで。出たいのは、私だって同じだよ｜勝手に決めるな。出たいのは、私だって同じだ｜勝手に決めないでください。出たいのは、私だって同じです」二人のあいだに、重い沈黙が落ちた。|{b}は扉の前に立ちふさがった。「先に言ったもの勝ちなんて、ずるいよ｜先に言ったもの勝ちなど、ずるい｜先に言ったもの勝ちなんて、ずるいです」{a}も{b}も、一歩も引かなかった。'),
    plan: L('{b}は床に座り込んで、指を組んだ。「決め方を決めよう。くじでも何でもいい。時間切れよりはましだよ｜決め方を決めよう。くじでも何でもいい。時間切れよりはましだ｜決め方を決めましょう。くじでも何でもいいです。時間切れよりはましです」{a}は黙って、紙の切れ端を探し始めた。|{b}は扉の紙をもう一度読み返した。「出られるのは一人。それなら、外で助けを呼べるほうが出るべきだね｜出られるのは一人だ。それなら、外で助けを呼べるほうが出るべきだ｜出られるのは一人です。それなら、外で助けを呼べるほうが出るべきですね」{b}の声は、震えていなかった。')
  };
  var REACT_TRIO = {
    open: L('{b}は大きく息を吐いた。「……分かった。決まったら、それに従うよ｜……分かった。決まったら、それに従う｜……分かりました。決まったら、それに従います」{b}はそう言って、扉の紙から目を逸らした。|{b}は苦笑いを浮かべた。「誰と誰でも、もう文句は言わない。時間のほうが大事だから｜誰と誰でも、もう文句は言わない。時間のほうが大事だ｜誰と誰でも、もう文句は言いません。時間のほうが大事ですから」{b}の指先は、少し震えていた。')
  };
  /* 反応を選ぶ（{b} の気質・態度・関係・恐怖） */
  function reactOf(ctx, a, b, rel, mode) {
    var t = b.tr, p = ps(b), hate = rel === 'hate';
    var c = [
      ['open', (t.fc || 0) + (t.impulse || 0) * 0.5 + (p === 'free' ? 1.2 : 0) + (p === 'proud' ? 0.5 : 0)],
      ['cry', (t.ac || 0) + (p === 'shy' || p === 'devoted' ? 0.9 : 0) + (b.stress || 0) / 120],
      ['angry', (t.cp || 0) * 0.6 + (t.aggr || 0) * 0.8 + (hate ? 1.2 : 0) + (p === 'proud' || p === 'tsun' ? 0.5 : 0)],
      ['plan', (t.a || 0) + (p === 'cool' || p === 'stern' ? 1 : 0) + (p === 'polite' ? 0.4 : 0)],
      ['care', hate ? 0 : (t.np || 0) + (rel === 'love' || rel === 'fam' ? 0.9 : rel === 'friend' ? 0.4 : 0) + (p === 'gentle' ? 0.6 : 0)],
      ['give', hate ? 0 : (t.np || 0) * 0.5 + (p === 'devoted' ? 1.3 : 0) + (mode === 'one' ? 0.8 : 0)],
      ['blame', (hate ? 1.6 : 0) + (t.cp || 0) * 0.4 + Math.max(0, -R(ctx, b, a).trust) / 40 + (p === 'tsun' ? 0.3 : 0)]
    ];
    if (mode === 'one') c = c.filter(function (x) { return x[0] === 'give' || x[0] === 'blame' || x[0] === 'plan' || x[0] === 'cry'; });
    if (mode === 'trio') c = c.filter(function (x) { return x[0] !== 'care' && x[0] !== 'give'; });
    var k = HK.weighted(ctx.rng, c, function (x) { return 0.15 + Math.max(0, x[1]); })[0];
    var tab = mode === 'one' && REACT_ONE[k] ? REACT_ONE[k] : mode === 'trio' && REACT_TRIO[k] ? REACT_TRIO[k] : REACT[k];
    return { k: k, text: pk(ctx, tab) };
  }
  var REACT_JA = { open: '開き直った', cry: '泣き出した', angry: '怒った', plan: '冷静に段取りを話した', care: '相手を気遣った', give: '自分が引き受けると言った', blame: '相手を責めた' };
  /* 反応の後始末（覚悟が決まる・緊張が上がる など） */
  function reactFx(ctx, a, b, k) {
    if (k === 'open') { b.flags.resign = true; ctx.stress(b, -4); ctx.mod2(a, b, { trust: 3 }, { trust: 3 }); }
    else if (k === 'cry') { ctx.stress(b, 8); ctx.stress(a, 4); ctx.mod(a, b, { aff: 2 }); }
    else if (k === 'angry') { ctx.mod2(a, b, { ten: 5 }, { ten: 8 }); ctx.stress(b, 5); }
    else if (k === 'plan') { ctx.mod2(a, b, { trust: 5 }, { trust: 4 }); ctx.stress(a, -4); ctx.stress(b, -4); }
    else if (k === 'care') { ctx.mod2(a, b, { trust: 5, aff: 3 }, { trust: 3, aff: 2 }); ctx.stress(a, -6); }
    else if (k === 'give') { b.flags.resign = true; ctx.mod(a, b, { trust: 6, aff: 4 }); ctx.stress(a, 3); }
    else if (k === 'blame') { ctx.mod2(a, b, { ten: 8, trust: -4 }, { ten: 6 }); ctx.stress(a, 6); }
  }
  function fill(ctx, s, a, b, c) {
    return ctx.t(String(s).replace(/\{h\}/g, hoursLeft(ctx)).replace(/\{left\}/g, a && b ? A.leftText(ctx, a, b) : ''), a, b, c);
  }
  /* 一度に同じ組で続けない：同じ出来事は同じ組で 2 区切りあける */
  function cool(ctx, id, who, gap) {
    var M = ctx.flags.rpAt || (ctx.flags.rpAt = {}), k = id + ':' + who.map(function (c) { return c.i; }).sort().join('-');
    return M[k] == null || ctx.stepIndex - M[k] >= (gap || 2);
  }
  function mark(ctx, id, who) { (ctx.flags.rpAt || (ctx.flags.rpAt = {}))[id + ':' + who.map(function (c) { return c.i; }).sort().join('-')] = ctx.stepIndex; ctx.flags.rpLast = ctx.stepIndex; }
  /* 二人の組の出来事を起こしてよいか：残り 3 割以下・二人とも部屋にいる・まだ二人の条件が済んでいない・二人で進められる条件か部屋全体の条件がある */
  function pairOk(ctx, a, b) {
    if (!stageOf(ctx) || !here(ctx, a) || !here(ctx, b) || ctx.flags.trioCur) return false;
    if (A.trioOnly && A.trioOnly(ctx)) return false;
    if (doneOf(ctx, a) || doneOf(ctx, b)) return false;
    return (ctx.rules || []).some(function (r) { var T = K[r.k]; return T && (A.isGlob(T) ? !A.globDone(ctx, r) : feasible(ctx, r, a, b) && !A.ruleDone(ctx, r, a, b)); });
  }
  function noOne(ctx) { return !ctx.flags.isOne && !ctx.flags.oneCond; }
  /* 切羽詰まりの出来事の重みの倍率（切迫が強いほど、二乗に近く上がる） */
  function U(ctx, a, b) { var u = Math.max(urgOf(ctx, a), b ? urgOf(ctx, b) : 0); return u * (1 + u); }

  /* 部屋全体で数える条件（飲む・お題）は、焦りの段のあとに、そのまま条件を進める出来事（consume・room_task）を続けて起こす（焦って時間を使うだけで、条件が遅れないように） */
  function evById(id) { return A.EV.filter(function (x) { return x.id === id; })[0] || null; }
  /* 焦りの段（{a}・{b} の記録）を先に書き、続けてその出来事（一人の出来事）を、その出来事として起こす（記録の主役・顔ぶれ・印は、ふだんその出来事が起きたときと同じ）。
     焦りの段はもう書いたので、呼んだ出来事には何も返さない（null） */
  function chain(ctx, id, a, b, text, why, mag, cat) {
    var E = evById(id);
    if (!E || (E.when && !E.when(ctx, a))) return { text: text, why: why, mag: mag };
    ctx.say({ kind: 'event', cat: cat || 'escape', actors: [a, b], text: text, why: why, mag: mag });
    ctx.flush();
    if (!here(ctx, a)) return null;
    var ev0 = ctx._ev; ctx._ev = E;
    try {
      var res = E.run(ctx, a);
      if (res && typeof res.text === 'string' && res.text) {
        var acts = [a]; (res.with || []).forEach(function (x) { if (x && acts.indexOf(x) < 0) acts.push(x); });
        ctx.say({ kind: 'event', cat: res.cat || E.cat, actors: acts, text: res.text, why: res.why || '', mag: res.mag || 0, sex: res.sex != null ? !!res.sex : !!E.sex, force: !!res.force, lewd: res.lewd != null ? !!res.lewd : undefined, trioPairs: res.trioPairs || null });
        ctx.flush();
      }
    } finally { ctx._ev = ev0; }
    return null;
  }

  /* 二人で数える条件のない部屋（飲む・お題だけ）では、焦りの段のあとに、部屋全体の条件を進める出来事を続ける */
  function globChain(ctx, a, b, text, why, mag) {
    if (A.hasPairRule(ctx)) return { text: text, why: why, mag: mag };
    var c = evById('consume'), t = evById('room_task');
    if (c && c.when(ctx, a)) return chain(ctx, 'consume', a, b, text, why, mag);
    if (t && t.when(ctx, a)) return chain(ctx, 'room_task', a, b, text, why, mag);
    return { text: text, why: why, mag: mag };
  }

  /* ---------- 「そろそろ覚悟を決めないと……」 ---------- */
  ev({
    id: 'rp_brink', label: '残り時間が迫り覚悟を決めようと切り出す', tie: '-', cat: 'escape', scope: 'pair', pri: true,
    when: function (ctx, a, b) { if (!noOne(ctx) || !pairOk(ctx, a, b) || !cool(ctx, 'brink', [a, b], 3)) return false; var lv = levelOf(frOf(ctx, a, b)); return lv === 'none' || lv === 'some'; },
    w: function (ctx, a, b) { return (0.5 + (a.tr.lead || 0) * 0.4 + (a.tr.a || 0) * 0.2) * U(ctx, a, b) * 4; },
    run: function (ctx, a, b) {
      mark(ctx, 'brink', [a, b]);
      var st = stageOf(ctx), rel = relOf(ctx, a, b), lv = levelOf(frOf(ctx, a, b)), re = reactOf(ctx, a, b, rel, '');
      reactFx(ctx, a, b, re.k); ctx.stress(a, 4);
      var text = fill(ctx, pk(ctx, TIME[st]) + pk(ctx, LVL[lv]) + pk(ctx, RELS[rel]) + pk(ctx, BRINK[ps(a)]) + re.text, a, b);
      return globChain(ctx, a, b, text, '残り時間が' + (st === 'last' ? '1割' : '3割') + 'を切り、条件の進みが' + { none: 'まったくない', some: 'わずか', half: '半分', near: 'あと少し' }[lv] + '。' + a.name + 'が覚悟を切り出し、' + b.name + 'は' + REACT_JA[re.k] + '（切羽詰まり）', 9);
    }
  });

  /* ---------- 時計を見る沈黙 ---------- */
  var CLOCK = {
    low: L('{a}は何度目かに、天井の時計を見上げた。秒針の音が、さっきより大きく聞こえた。{b}もつられて時計を見て、それから二人とも黙り込んだ。扉の紙は、何も言わずにそこにあった。|時計の針が一つ進むたびに、{a}と{b}の口数は減っていった。どちらも、残りの時間を口に出そうとはしなかった。{a}が膝の上で指を組み直す音だけが、やけに響いた。扉の向こうは静かだった。|{b}が時計を見ているのに、{a}は気づいた。{a}も同じように時計を見た。目が合って、二人とも何か言いかけて、やめた。沈黙が、扉の紙の文字よりも重かった。'),
    near: L('扉の紙の残りは、あとわずかだった。それなのに、{a}も{b}も時計を見るばかりで、どちらも動けずにいた。秒針の音が、急かすように響いた。{a}が先に目を伏せた。|あと少しで扉が開く。分かっているのに、{a}と{b}は時計から目を離せなかった。どちらも、最後の一歩を言い出せなかった。{b}の喉が、小さく鳴った。'),
    last: L('照明が暗くなってから、{a}と{b}は一度も口をきいていなかった。{a}は時計から目を離せなかった。残りの時間を数えるたびに、喉が渇いた。扉は、まだ閉じたままだった。|最後の区切りが近づいていた。{a}は時計の針を、瞬きもせずに見つめていた。{b}はその横顔を見て、何も言えなかった。扉の紙の文字が、薄暗い明かりの中でやけにくっきり見えた。')
  };
  var CLOCK_LINE = L('{a}「……時間、ないね｜……時間がないな｜……時間、ないですね」|{a}「……あと、どれくらい？｜……あと、どれくらいだ？｜……あと、どれくらいですか？」|{b}「……分かってる｜……分かっている｜……分かっています」');
  ev({
    id: 'rp_clock', label: '残り時間を数えて時計を見つめる沈黙', tie: '-', cat: 'solo', scope: 'pair', pri: true,
    when: function (ctx, a, b) { return pairOk(ctx, a, b) && cool(ctx, 'clock', [a, b], 2); },
    w: function (ctx, a, b) { return (0.45 + (a.tr.ac || 0) * 0.3 + (a.tr.caution || 0) * 0.2) * U(ctx, a, b) * 3; },
    run: function (ctx, a, b) {
      mark(ctx, 'clock', [a, b]);
      var st = stageOf(ctx), lv = levelOf(frOf(ctx, a, b));
      ctx.stress(a, 5); ctx.stress(b, 5);
      var text = fill(ctx, pk(ctx, st === 'last' ? CLOCK.last : lv === 'near' ? CLOCK.near : CLOCK.low) + (ctx.rng() < 0.6 ? pk(ctx, CLOCK_LINE) : ''), a, b);
      return globChain(ctx, a, b, text, '残り時間が' + (st === 'last' ? '1割' : '3割') + 'を切った。' + a.name + 'と' + b.name + 'は時計を見たまま黙り込んだ（切羽詰まり）', 6);
    }
  });

  /* ---------- 言い出す側と拒む側の往復 ---------- */
  var ASK = L('{a}「お願い。やるしかないの｜頼む。やるしかないんだ｜お願いします。やるしかないんです」|{a}「このまま終わるなんて、嫌だよ｜このまま終わるのは嫌だ｜このまま終わるなんて、嫌です」');
  var NO = L('{b}「嫌だって言ったでしょ｜嫌だと言ったはずだ｜嫌だって、言ったはずです」|{b}「……今は、無理｜……今は、無理だ｜……今は、無理です」');
  var ASK2 = L('{a}「じゃあ、どうすればいいの？｜では、どうすればいい？｜では、どうすればいいんですか？」|{a}「ほかに方法がないんだよ｜ほかに方法がないんだ｜ほかに方法がないんです」');
  var NO2 = {
    soft: L('{b}は長いこと黙っていた。それから、消え入りそうな声で言った。「……もう少しだけ、待って｜……もう少し待ってくれ｜……もう少しだけ、待ってください」{a}は唇を噛んで、頷いた。扉の紙の残りは、少しも減らなかった。|{b}は首を振りかけて、途中で止めた。「……次までには、決めるから｜……次までには決める｜……次までには、決めますから」{a}はそれ以上、何も言わなかった。時計の針だけが進んだ。'),
    hard: L('{b}は{a}から顔を背けた。「……ごめん。今は、どうしても無理｜……すまない。今は、どうしても無理だ｜……ごめんなさい。今は、どうしても無理です」{a}は拳を握りしめて、扉の前に座り込んだ。二人のあいだの距離は、さっきより開いていた。|{b}は壁際まで下がった。「来ないで。決めるのは私だよ｜来るな。決めるのは私だ｜来ないでください。決めるのは私です」{a}はその場で立ち尽くした。扉の紙の数字だけが、二人を見下ろしていた。')
  };
  ev({
    id: 'rp_refuse', label: '条件を迫る側と拒む側の押し問答', tie: '-', cat: 'conflict', scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      if (!noOne(ctx) || !pairOk(ctx, a, b) || !cool(ctx, 'refuse', [a, b], 3) || !A.hasPairRule(ctx)) return false;
      /* 二人で進める条件があり、b がまだ乗り気でない（覚悟が決まっていない） */
      return !b.flags.resign && (ctx.rules || []).some(function (r) { return feasible(ctx, r, a, b) && !A.ruleDone(ctx, r, a, b); }) && (a.stress > 30 || a.flags.resign);
    },
    w: function (ctx, a, b) { return (0.35 + (a.tr.lead || 0) * 0.4 + (a.tr.cp || 0) * 0.2) * U(ctx, a, b) * 3; },
    run: function (ctx, a, b) {
      mark(ctx, 'refuse', [a, b]);
      var st = stageOf(ctx), soft = R(ctx, b, a).trust > 15 && (b.tr.ac || 0) + (b.tr.np || 0) > (b.tr.cp || 0) + 0.3;
      var lead = pk(ctx, L('{a}は、もう何度目か分からない話を、また切り出した。扉の紙の残りは、さっきから変わっていない。|{a}は扉の紙を指さして、{b}の正面に立った。残りの時間を考えると、もう黙っていられなかった。'));
      var text = fill(ctx, lead + pk(ctx, ASK) + pk(ctx, NO) + pk(ctx, ASK2) + pk(ctx, NO2[soft ? 'soft' : 'hard']), a, b);
      if (soft) { ctx.mod2(a, b, { trust: 2 }, { trust: 2 }); ctx.stress(b, 6); if (st === 'last') b.flags.resign = true; }
      else { ctx.mod2(a, b, { ten: 6 }, { ten: 8, trust: -4 }); ctx.stress(a, 6); }
      return { text: text, why: a.name + 'が条件を迫り、' + b.name + 'が拒んだ。残り時間が' + (st === 'last' ? '1割' : '3割') + 'を切っている（' + (soft ? '少しだけ時間をもらった' : 'はねつけられた') + '・切羽詰まり）', mag: 8 };
    }
  });

  /* ---------- 「このままだと二人とも出られない」 ---------- */
  var REAL = {
    none: L('{a}「このままだと、二人とも出られないよ｜このままでは、二人とも出られない｜このままだと、二人とも出られません」|{a}「時間切れになったら、全部おしまいだよ｜時間切れになれば、全部おしまいだ｜時間切れになったら、全部おしまいです」'),
    half: L('{a}「半分は来た。でも、このペースじゃ間に合わない｜半分は来た。だが、このペースでは間に合わない｜半分は来ました。でも、このペースでは間に合いません」|{a}「無駄にしたくない。でも、時間が足りないよ｜無駄にしたくない。だが、時間が足りない｜無駄にしたくありません。でも、時間が足りないんです」'),
    near: L('{a}「あと少しなんだ。ここで止まれない｜あと少しだ。ここで止まれない｜あと少しなんです。ここで止まれません」|{a}「もう一息だよ。ここで諦めたら、絶対に後悔する｜もう一息だ。ここで諦めれば、必ず後悔する｜もう一息です。ここで諦めたら、きっと後悔します」')
  };
  var REAL_ALL = L('{a}「このままだと、みんな出られないよ｜このままでは、全員出られない｜このままだと、みんな出られません」');
  ev({
    id: 'rp_reality', label: 'このままでは出られないと現実を確かめる', tie: '-', cat: 'escape', scope: 'pair', pri: true,
    when: function (ctx, a, b) { return noOne(ctx) && pairOk(ctx, a, b) && cool(ctx, 'reality', [a, b], 3); },
    w: function (ctx, a, b) { var lv = levelOf(frOf(ctx, a, b)); return (0.4 + (a.tr.a || 0) * 0.4) * U(ctx, a, b) * (lv === 'half' || lv === 'near' ? 4.5 : 3); },
    run: function (ctx, a, b) {
      mark(ctx, 'reality', [a, b]);
      var st = stageOf(ctx), rel = relOf(ctx, a, b), lv = levelOf(frOf(ctx, a, b)), re = reactOf(ctx, a, b, rel, '');
      reactFx(ctx, a, b, re.k);
      var lead = pk(ctx, L('{a}は扉の紙の前に立って、残りの数と時計を何度も見比べた。それから振り返って、{b}を呼んだ。|{a}は床に指で、残りの数と残りの時間を書いて並べた。書いてみると、思っていたよりずっと足りなかった。'));
      var many = ctx.present().length >= 3 && lv === 'none';
      var text = fill(ctx, pk(ctx, TIME[st]) + lead + pk(ctx, LVL[lv]) + pk(ctx, many ? REAL_ALL : REAL[lv === 'some' ? 'none' : lv]) + re.text, a, b);
      return globChain(ctx, a, b, text, a.name + 'が「このままだと出られない」と現実を確かめた（条件の進み：' + { none: 'まったくない', some: 'わずか', half: '半分', near: 'あと少し' }[lv] + '）。' + b.name + 'は' + REACT_JA[re.k] + '（切羽詰まり）', 8);
    }
  });

  /* ---------- 一人しか出られない部屋の「どっちが出るか」 ---------- */
  var ONE_A = {
    offer: L('{a}「あなたが出て。私は、あとでどうにかする｜あなたが出ろ。私は、あとでどうにかする｜あなたが出てください。私は、あとでどうにかします」|{a}「出るのは、あなたにして。私はここで待ってるから｜出るのは、あなたにしろ。私はここで待っている｜出るのは、あなたにしてください。私はここで待っていますから」'),
    claim: L('{a}「悪いけど、私は出たい。外で待ってる人がいるから｜悪いが、私は出たい。外で待っている人がいる｜申し訳ないですが、私は出たいんです。外で待っている人がいますから」|{a}「譲る気はないよ。私だって、ここで終わりたくない｜譲る気はない。私だって、ここで終わりたくない｜譲る気はありません。私だって、ここで終わりたくないんです」'),
    fair: L('{a}「決め方を決めよう。このまま時間切れになるのが、いちばん最悪だよ｜決め方を決めよう。このまま時間切れになるのが、いちばん最悪だ｜決め方を決めましょう。このまま時間切れになるのが、いちばん最悪です」|{a}「どっちが出るか、今決めよう。もう先延ばしにはできない｜どちらが出るか、今決めよう。もう先延ばしにはできない｜どちらが出るか、今決めましょう。もう先延ばしにはできません」')
  };
  ev({
    id: 'rp_one', label: '一人しか出られない部屋でどちらが出るか詰める', tie: '-', cat: 'conflict', scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      if (noOne(ctx) || ctx.flags.oneOut || !stageOf(ctx) || !here(ctx, a) || !here(ctx, b) || !cool(ctx, 'one', [a, b], 3)) return false;
      /* 条件つきの「一人だけ」は、条件が済む前（済めば扉は開く） */
      return ctx.flags.isOne || !A.pairDone(ctx, a, b);
    },
    w: function (ctx, a, b) { return (0.6 + (a.tr.a || 0) * 0.3 + (a.tr.np || 0) * 0.3) * Math.max(0.4, U(ctx, a, b) || (stageOf(ctx) === 'last' ? 1 : 0.6)) * 3.5; },
    run: function (ctx, a, b) {
      mark(ctx, 'one', [a, b]);
      var st = stageOf(ctx), rel = relOf(ctx, a, b), p = ps(a), t = a.tr;
      var kind = (t.np || 0) + (p === 'devoted' || p === 'gentle' ? 0.8 : 0) > (t.cp || 0) + (t.impulse || 0) * 0.5 + (p === 'proud' || p === 'free' ? 0.6 : 0) ? 'offer' : (t.a || 0) > 0.55 || p === 'cool' || p === 'stern' ? 'fair' : 'claim';
      if (rel === 'hate' && kind === 'offer') kind = 'fair';
      var re = reactOf(ctx, a, b, rel, kind === 'offer' ? '' : 'one');
      if (kind === 'offer' && re.k === 'give') re = { k: 'care', text: pk(ctx, REACT.care) };
      reactFx(ctx, a, b, re.k);
      var lead = pk(ctx, L('扉をくぐれるのは、一人だけ。残りの時間が減るにつれて、その一文が部屋の空気を重くしていた。{a}はとうとう、その話を口に出した。|{a}と{b}は、扉の前で向かい合った。どちらが出るのか。それを決めないまま、ここまで来てしまった。'));
      var text = fill(ctx, pk(ctx, TIME[st]) + lead + pk(ctx, ONE_A[kind]) + re.text, a, b);
      if (kind === 'claim') ctx.mod2(a, b, { ten: 4 }, { ten: 6 }); else ctx.mod2(a, b, { trust: 3 }, { trust: 3 });
      return { text: text, why: '一人しか出られない部屋で、残り時間が' + (st === 'last' ? '1割' : '3割') + 'を切った。' + a.name + 'は' + { offer: '相手に譲ろうとした', claim: '自分が出たいと言った', fair: '決め方を決めようと言った' }[kind] + '。' + b.name + 'は' + REACT_JA[re.k] + '（切羽詰まり）', mag: 9 };
    }
  });

  /* ---------- 三人以上の部屋の「誰と誰が」 ---------- */
  ev({
    id: 'rp_trio', label: '三人の部屋で誰と誰が条件を満たすか詰める', tie: '-', cat: 'escape', scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      if (!noOne(ctx) || !A.hasPairRule(ctx) || !pairOk(ctx, a, b) || !cool(ctx, 'trio', [a], 3)) return false;
      var P = ctx.present().filter(function (c) { return here(ctx, c); });
      if (P.length < 3) return false;
      /* まだ誰の組も条件が済んでいない */
      return P.every(function (c) { return !doneOf(ctx, c); });
    },
    w: function (ctx, a, b) { return (0.5 + (a.tr.lead || 0) * 0.5) * U(ctx, a, b) * 3.5; },
    run: function (ctx, a, b) {
      mark(ctx, 'trio', [a]);
      var st = stageOf(ctx), c = ctx.present().filter(function (x) { return x !== a && x !== b && here(ctx, x); })[0];
      var rel = relOf(ctx, a, b), re = reactOf(ctx, a, b, rel, 'trio');
      reactFx(ctx, a, b, re.k);
      var lead = pk(ctx, L('{a}は{b}と{c}を見回した。誰と誰が扉の条件を満たすのか。それを決めないまま、ここまで来てしまった。|{a}は扉の紙の前で振り返った。三人のうち、誰と誰が組むのか。時間はもう、それを曖昧にさせてくれなかった。'));
      var say = pk(ctx, L('{a}「組み合わせ、決めよう｜組み合わせを決めよう｜組み合わせを決めましょう」|{a}「黙ってても始まらない。組み合わせを決めよう｜黙っていても始まらない。組み合わせを決めよう｜黙っていても始まりません。組み合わせを決めましょう」'));
      var tail = pk(ctx, L('{c}は黙って、二人の顔を見比べていた。|{c}は扉の紙から目を逸らして、膝の上で指を組んだ。|{c}は何か言いかけて、結局口を閉じた。'));
      var text = fill(ctx, pk(ctx, TIME[st]) + lead + say + re.text + tail, a, b, c);
      if (c) ctx.stress(c, 5);
      return { with: c ? [c] : [], text: text, why: '三人以上の部屋で、残り時間が' + (st === 'last' ? '1割' : '3割') + 'を切った。' + a.name + 'が誰と誰が条件を満たすかを切り出し、' + b.name + 'は' + REACT_JA[re.k] + '（切羽詰まり）', mag: 8 };
    }
  });

  /* ---------- 傷つける・ロシアンルーレット・誰かを殺す（気絶させる）条件の恐怖 ---------- */
  function dreadKind(ctx) {
    var ks = (ctx.rules || []).map(function (r) { return r.k; });
    return ks.indexOf('kill') >= 0 ? 'kill' : ks.indexOf('roulette') >= 0 ? 'roulette' : ks.indexOf('hurt') >= 0 ? 'hurt' : '';
  }
  var DREAD = {
    roulette: L('{a}は、テーブルの上のリボルバーから目を離せなかった。空砲だと分かっていても、引き金を引くたびに鳴るかもしれない音が怖かった。残りの回数を数えるたびに、指先が冷たくなった。扉の紙の数字は、まだ減りきっていなかった。|リボルバーの弾倉が回る音を、{a}は頭の中で何度も聞いていた。次に鳴るのは自分の番かもしれない。そう思うと、息が浅くなった。扉は、まだ閉じたままだった。'),
    hurt: L('{a}は、自分の手のひらを見つめていた。扉の条件は、相手を傷つけること。時間が減るほど、その一文が重くなった。{a}は手を膝に押しつけて、震えを止めようとした。|{a}は{b}の顔を見られなかった。時間切れが近づくほど、扉の条件を果たさなければならない気がしてくる。それが何より怖かった。{a}は壁に背中を押しつけて、深く息を吸った。'),
    kill: L('{a}は扉の紙の一文を、何度も読み返していた。時間が減るほど、その文字が重くのしかかってくる。誰かが、誰かを――。{a}は、その先を考えないようにした。|{a}は部屋の隅で、膝を抱えて震えていた。扉の条件を果たさなければ、誰も出られない。けれど、それを果たすことが何より怖かった。{a}は{b}の足音がするたびに、びくりと顔を上げた。')
  };
  var DREAD_B = {
    calm: L('{b}は{a}の隣に腰を下ろした。「大丈夫。まだ時間はある。一緒に考えよう｜大丈夫だ。まだ時間はある。一緒に考えよう｜大丈夫です。まだ時間はあります。一緒に考えましょう」その声も、少し震えていた。|{b}は{a}の背中をさすった。「息をして。ゆっくりでいいから｜息をしろ。ゆっくりでいい｜息をしてください。ゆっくりでいいですから」'),
    scared: L('{b}も、同じように青い顔をしていた。「私だって怖いよ……｜私だって怖い……｜私だって怖いです……」二人は扉の前で、黙って寄り添うように座っていた。|{b}は唇を噛んで、扉から目を逸らした。「……考えたくない｜……考えたくない｜……考えたくありません」その一言のあと、二人ともしばらく動けなかった。'),
    hard: L('{b}は硬い顔で言った。「怖がってても、時間は止まらないよ｜怖がっていても、時間は止まらない｜怖がっていても、時間は止まりません」{a}は返事ができなかった。|{b}は扉の紙を見上げたまま言った。「決めないと。誰かが、決めないと｜決めないと。誰かが、決めなければ｜決めないと。誰かが、決めなければいけません」その声は、ひどく冷たく聞こえた。')
  };
  ev({
    id: 'rp_dread', label: '危ない条件の時間切れが迫り恐怖が高まる', tie: '-', tags: ['violence'], cat: 'solo', scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      var dk = dreadKind(ctx);
      if (!dk || !stageOf(ctx) || !here(ctx, a) || !here(ctx, b) || doneOf(ctx, a) || !cool(ctx, 'dread', [a], 2)) return false;
      return (ctx.rules || []).some(function (r) { return r.k === dk && (A.isGlob(K[r.k]) ? !A.globDone(ctx, r) : !A.ruleDone(ctx, r, a, b)); });
    },
    w: function (ctx, a, b) { return (0.5 + (a.tr.ac || 0) * 0.5 + (a.tr.caution || 0) * 0.3 + (a.stress || 0) / 120) * U(ctx, a, b) * 3.5; },
    run: function (ctx, a, b) {
      mark(ctx, 'dread', [a]);
      var dk = dreadKind(ctx), st = stageOf(ctx), rel = relOf(ctx, a, b);
      var bk = rel !== 'hate' && (b.tr.np || 0) > 0.5 ? 'calm' : (b.tr.cold || 0) > 0.55 || (b.tr.cp || 0) > 0.65 || rel === 'hate' ? 'hard' : 'scared';
      ctx.stress(a, 10); ctx.stress(b, bk === 'scared' ? 8 : 3);
      if (bk === 'calm') ctx.mod(a, b, { trust: 5, aff: 3 }); else if (bk === 'hard') ctx.mod(a, b, { ten: 4 });
      var text = fill(ctx, pk(ctx, TIME[st]) + pk(ctx, DREAD[dk]) + pk(ctx, DREAD_B[bk]), a, b);
      if (dk === 'roulette') return chain(ctx, 'room_task', a, b, text, '扉の条件（ロシアンルーレット）の時間切れが迫り、' + a.name + 'の恐怖が高まった（切羽詰まり）', 8);
      return { text: text, why: '扉の条件（' + { roulette: 'ロシアンルーレット', hurt: '相手を傷つける', kill: HK.SAFE_ON ? '誰かを気絶させる' : '誰かを殺す' }[dk] + '）の時間切れが迫り、' + a.name + 'の恐怖が高まった。' + b.name + 'は' + { calm: '落ち着かせようとした', scared: '一緒に怯えた', hard: '突き放した' }[bk] + '（切羽詰まり）', mag: 8 };
    }
  });

  /* ---------- 関係「恐怖」の二人 ---------- */
  function fears(ctx, x, y) { return !!(HK.Ties && HK.Ties.fears && HK.Ties.fears(ctx, x, y)); }
  /* 恐れる側 {a}（恐れられる側は {b}）の追い詰められ方 */
  var FEAR_A = {
    shake: L('{a}は、{b}が近くに来るたびに肩を震わせた。残りの時間が減るにつれて、震えはひどくなっていった。扉の紙の残りを見ても、{a}の頭には何も入ってこなかった。|{a}の指先は、さっきから止まらずに震えていた。{b}と二人きりで時間切れを迎えるかもしれない。そう思うだけで、息がうまく吸えなかった。扉は、まだ閉じたままだった。'),
    mute: L('{a}は、{b}の前ではほとんど口をきかなくなっていた。何を言っても、何を言われても怖かった。残りの時間が減るほど、{a}は扉の前で小さくなっていった。|{b}に話しかけられても、{a}はうつむいて首を振るだけだった。声を出したら、何かが壊れてしまいそうだった。扉の紙の数字は、まだ減りきっていなかった。'),
    obey: L('{b}が何か言うたびに、{a}は反射的に頷いていた。自分が何に頷いているのかも、もうよく分からなかった。残りの時間が、{a}から考える力を奪っていた。扉の紙の文字だけが、やけに大きく見えた。|{a}は、{b}の言うことには逆らわないと決めていた。逆らうほうが、ずっと怖かった。時間切れが近づくにつれて、{a}の返事は「はい」しか残らなくなった。扉は、まだ開かなかった。'),
    panic: L('{a}は突然立ち上がって、扉を拳で叩き始めた。「出して！ 誰か、ここから出して！｜出してくれ！ 誰か、ここから出せ！｜出してください！ 誰か、ここから出してください！」残りの時間と{b}の視線が、{a}を追い詰めていた。扉は、びくともしなかった。|{a}の呼吸が、急に浅く速くなった。{b}がこちらを向いただけで、{a}は部屋の隅まで後ずさった。時計の針の音が、{a}にはひどくうるさく聞こえた。扉の紙の残りは、まだ多かった。')
  };
  /* 恐れられる側 {b} の反応 */
  var FEAR_B = {
    irked: L('{b}は舌打ちをした。「いちいち怯えないで。時間がないって言ってるでしょ｜いちいち怯えるな。時間がないと言っているだろう｜いちいち怯えないでください。時間がないと言っているでしょう」{a}の肩が、また小さく跳ねた。|{b}は苛立ったように髪をかき上げた。「そんな顔をされたら、話も進まないよ｜そんな顔をされては、話も進まない｜そんな顔をされたら、話も進みません」{a}は、さらにうつむいた。'),
    soothe: L('{b}は、{a}から少し離れた場所に座り直した。「近づかない。だから、落ち着いて話を聞いて｜近づかない。だから、落ち着いて話を聞け｜近づきません。ですから、落ち着いて話を聞いてください」その声は、無理に作ったように穏やかだった。|{b}は両手を上げてみせた。「何もしない。……今は、時間のことだけ考えよう｜何もしない。……今は、時間のことだけ考えよう｜何もしません。……今は、時間のことだけ考えましょう」{a}は、まだ顔を上げられなかった。'),
    use: L('{b}は、{a}の怯え方に気づいて、口の端をわずかに上げた。「私の言うとおりにすれば、ちゃんと出られるよ｜私の言うとおりにすれば、ちゃんと出られる｜私の言うとおりにすれば、ちゃんと出られますよ」{a}は、断る言葉を見つけられなかった。|{b}は{a}の前にしゃがみ込んだ。「時間がないのは分かるでしょ。決めるのは私。いいね｜時間がないのは分かるだろう。決めるのは私だ。いいな｜時間がないのは分かりますよね。決めるのは私です。いいですね」{a}は、震えながら頷いた。')
  };
  ev({
    id: 'rp_fear', label: '恐れる相手と時間切れを前に追い詰められる', tie: 'fear', cat: 'conflict', scope: 'pair', pri: true,
    when: function (ctx, a, b) { return fears(ctx, a, b) && !!stageOf(ctx) && here(ctx, a) && here(ctx, b) && !doneOf(ctx, a) && cool(ctx, 'fear', [a, b], 2); },
    w: function (ctx, a, b) { return (0.9 + (a.stress || 0) / 80) * Math.max(0.5, U(ctx, a, b)) * 4; },
    run: function (ctx, a, b) {
      mark(ctx, 'fear', [a, b]);
      var st = stageOf(ctx), t = a.tr, p = ps(a);
      var ak = HK.weighted(ctx.rng, [['shake', 0.6 + (t.ac || 0)], ['mute', 0.4 + (t.cold || 0) * 0.6 + (p === 'shy' || p === 'cool' ? 0.6 : 0)], ['obey', 0.3 + (t.ac || 0) * 0.8 + (p === 'devoted' || p === 'polite' ? 0.6 : 0)], ['panic', 0.3 + (t.impulse || 0) * 0.8 + (a.stress || 0) / 100]], function (x) { return x[1]; })[0];
      var u = b.tr, bp = ps(b), hostile = Math.max(R(ctx, b, a).ten, 0) >= 40 || (u.aggr || 0) > 0.6;
      var bk = HK.weighted(ctx.rng, [['irked', 0.4 + (u.cp || 0) * 0.6 + (u.impulse || 0) * 0.4 + (bp === 'proud' || bp === 'tsun' ? 0.4 : 0)], ['soothe', 0.3 + (u.np || 0) + (bp === 'gentle' || bp === 'devoted' ? 0.6 : 0)], ['use', (hostile ? 0.8 : 0.1) + (u.cold || 0) * 0.6 + (bp === 'cool' ? 0.3 : 0)]], function (x) { return x[1]; })[0];
      ctx.stress(a, ak === 'panic' ? 16 : 12); ctx.stress(b, 3);
      if (ak === 'obey' || bk === 'use') a.flags.resign = true;
      if (bk === 'soothe') ctx.mod(a, b, { ten: -2 }); else ctx.mod(a, b, { ten: 5, trust: -3 });
      var text = fill(ctx, pk(ctx, TIME[st]) + pk(ctx, FEAR_A[ak]) + pk(ctx, FEAR_B[bk]), a, b);
      return { text: text, why: a.name + 'は' + b.name + 'を恐れている。残り時間が' + (st === 'last' ? '1割' : '3割') + 'を切り、' + a.name + 'は' + { shake: '震えが止まらなくなった', mute: '黙り込んだ', obey: '言いなりになった', panic: '取り乱した' }[ak] + '。' + b.name + 'は' + { irked: '苛立った', soothe: '無理に落ち着かせようとした', use: 'その怯えを利用した' }[bk] + '（恐怖・切羽詰まり）', mag: 10 };
    }
  });

  /* ---------- 条件を満たした人が、まだの人を急かす・慰める ---------- */
  var URGE = {
    push: L('{a}は、まだ扉の条件が済んでいない{b}の前に立った。「あと少しだよ。迷ってる時間がもったいない｜あと少しだ。迷っている時間がもったいない｜あと少しです。迷っている時間がもったいないですよ」{b}は唇を噛んで、時計を見た。|{a}は扉の紙を指さした。「私はもう済んでる。あとは、あなたの番だよ｜私はもう済んでいる。あとは、あなたの番だ｜私はもう済んでいます。あとは、あなたの番ですよ」{b}は、返事の代わりに深く息を吐いた。'),
    soothe: L('{a}は{b}の隣に座った。「焦らなくていい。私が最後まで一緒にいるから｜焦らなくていい。私が最後まで一緒にいる｜焦らなくていいです。私が最後まで一緒にいますから」{b}は、少しだけ肩の力を抜いて、扉の紙を見上げた。|{a}は{b}に水を差し出した。「一息ついて。まだ、間に合うよ｜一息つけ。まだ、間に合う｜一息ついてください。まだ、間に合いますよ」{b}は黙って受け取って、扉の紙を見上げた。')
  };
  ev({
    id: 'rp_urge', label: '条件を済ませた人がまだの人を急かし慰める', tie: '-', cat: 'help', scope: 'pair', pri: true,
    when: function (ctx, a, b) { return !!stageOf(ctx) && here(ctx, a) && here(ctx, b) && doneOf(ctx, a) && !doneOf(ctx, b) && cool(ctx, 'urge', [a, b], 2); },
    w: function (ctx, a, b) { return (0.4 + (a.tr.np || 0) * 0.4 + (a.tr.lead || 0) * 0.3) * Math.max(0.4, urgOf(ctx, b)) * 3; },
    run: function (ctx, a, b) {
      mark(ctx, 'urge', [a, b]);
      var st = stageOf(ctx), k = (a.tr.np || 0) + (relOf(ctx, a, b) === 'hate' ? -1 : 0) > (a.tr.cp || 0) + (a.tr.lead || 0) * 0.5 ? 'soothe' : 'push';
      if (k === 'soothe') { ctx.mod(b, a, { trust: 5, aff: 3 }); ctx.stress(b, -6); } else { ctx.stress(b, 5); b.flags.resign = b.flags.resign || st === 'last'; }
      var text = fill(ctx, pk(ctx, TIME[st]) + pk(ctx, URGE[k]), a, b);
      return { text: text, why: a.name + 'は条件を済ませている。まだの' + b.name + 'を' + (k === 'soothe' ? '慰めた' : '急かした') + '（残り時間が' + (st === 'last' ? '1割' : '3割') + 'を切った・切羽詰まり）', mag: 7 };
    }
  });

  /* ---------- 飲み切る・食べ切る条件が残っている焦り ---------- */
  function foodRule(ctx) { return (ctx.rules || []).filter(function (r) { var T = K[r.k]; return T && T.type === 'consume' && A.globLeft(ctx, r) > 0; })[0] || null; }
  var FOOD = {
    spicy: L('テーブルの上では、{item}がまだ{left}残っていた。{a}はスープの赤さを見ただけで、額に汗がにじんだ。舌はとっくに痺れて、何を食べても辛さしか分からない。扉の紙は、完食するまで開かないと言っている。|{a}は箸を握ったまま、伸びかけた麺を見つめていた。{item}は、まだ{left}ある。辛さで涙がにじみ、水を飲むたびに腹が苦しくなった。扉の紙の数字は、なかなか減らなかった。'),
    sake: L('テーブルの上には、{item}がまだ{left}残っていた。{a}の視界は、もう少し揺れ始めている。一杯ごとに、頭の芯がぼんやりと重くなった。扉の紙の数字は、なかなか減らなかった。|{a}はグラスを持ち上げかけて、また置いた。{item}は、あと{left}。酔いが回るほど、残りの時間のことが考えられなくなっていく。扉は、まだ閉じたままだった。'),
    other: L('テーブルの上には、{item}がまだ{left}残っていた。{a}はその数を見るたびに、胃のあたりが重くなった。時間内に全部片づけられるのか、もう分からなかった。扉の紙の数字は、なかなか減らなかった。|{a}は、残った{item}を指で数えた。あと{left}。一つ減らすだけでも、さっきより時間がかかるようになっていた。扉は、まだ開かなかった。')
  };
  var FOOD_A = L('{a}「……無理かも。でも、やらないと｜……無理かもしれない。だが、やらないと｜……無理かもしれません。でも、やらないと」|{a}「あと少し……あと少しだから……｜あと少しだ……あと少し……｜あと少しです……あと少しですから……」|{a}「時間内に、全部いけるかな……｜時間内に、全部いけるのか……｜時間内に、全部いけるでしょうか……」');
  var FOOD_B = {
    help: L('{b}は黙って器を引き寄せた。「半分、私が片づける。休んでて｜半分、私が片づける。休んでいろ｜半分、私が片づけます。休んでいてください」{a}は、ほっとしたように息を吐いた。|{b}は{a}の背中を軽く叩いた。「ゆっくりでいい。二人でやれば間に合う｜ゆっくりでいい。二人でやれば間に合う｜ゆっくりでいいです。二人でやれば間に合いますから」'),
    push: L('{b}は時計を指さした。「休んでる暇はないよ。手を動かして｜休んでいる暇はない。手を動かせ｜休んでいる暇はありません。手を動かしてください」{a}は涙目で、また器に向き直った。|{b}も、自分の分で手一杯だった。「……私だって限界。でも、やるしかないよ｜……私だって限界だ。だが、やるしかない｜……私だって限界です。でも、やるしかないんです」二人は黙って、残りに手を伸ばした。')
  };
  ev({
    id: 'rp_food', label: '飲み切り食べ切りの条件が残り焦る', tie: '-', cat: 'escape', scope: 'pair', pri: true,
    when: function (ctx, a, b) { var r = foodRule(ctx); return !!r && !!stageOf(ctx) && here(ctx, a) && here(ctx, b) && !doneOf(ctx, a) && !(a.flags.belly > 2) && cool(ctx, 'food', [a], 2); },
    w: function (ctx, a, b) { return (0.6 + (a.tr.impulse || 0) * 0.2) * Math.max(0.4, U(ctx, a, b)) * 3.5; },
    run: function (ctx, a, b) {
      mark(ctx, 'food', [a]);
      var r = foodRule(ctx), T = K[r.k], st = stageOf(ctx), left = A.globLeft(ctx, r);
      var k = r.k === 'spicy' ? 'spicy' : r.k === 'sake' ? 'sake' : 'other', bk = relOf(ctx, a, b) !== 'hate' && (b.tr.np || 0) >= (b.tr.cp || 0) ? 'help' : 'push';
      ctx.stress(a, 6); if (bk === 'help') ctx.mod(a, b, { trust: 4, aff: 2 }); else ctx.stress(b, 3);
      var s = pk(ctx, TIME[st]) + pk(ctx, FOOD[k]).replace(/\{item\}/g, T.item).replace(/\{left\}/g, left + T.unit) + pk(ctx, FOOD_A) + pk(ctx, FOOD_B[bk]);
      return chain(ctx, 'consume', a, b, fill(ctx, s, a, b), '扉の条件（' + T.item + '）が、残り時間' + (st === 'last' ? '1割' : '3割') + 'を切っても、まだ' + left + T.unit + '残っている。' + a.name + 'が焦り、' + b.name + 'は' + (bk === 'help' ? '手伝った' : '急かした') + '（切羽詰まり）', 7);
    }
  });

  /* ---------- 恐怖の入口（cold-fear-room-r18.js の cf_room_r18）のきっかけの段に、残り時間の切迫を足す（R18版だけ） ---------- */
  var CF_TIME = { late: '残りの時間は、もう三割を切っていた。条件の回数が、時計と一緒に二人を追い詰めていた。', last: '照明が暗くなり、残された時間はわずかだった。時間切れの恐ろしさが、ためらいを押し流した。' };
  if (!HK.SAFE_ON && HK.ColdFear && HK.ColdFear.R18 && typeof HK.ColdFear.R18.leadRoom === 'function') HK.wrap(HK.ColdFear.R18, 'leadRoom', function (f0) {
    return function (ctx) {
      var r = f0.apply(this, arguments), st = ctx && ctx.scen && ctx.scen.id === 'whiteroom' ? stageOf(ctx) : '';
      if (r && st && typeof r.text === 'string') { r.text += CF_TIME[st]; r.why = (r.why || '') + '／残り時間の切迫（' + (st === 'last' ? '1割' : '3割') + 'を切った）'; }
      return r;
    };
  });
})();
