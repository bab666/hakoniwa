/* 箱庭シミュレーター: 出られない部屋 ― 足した条件（両ビルド共通。2026-10-26 順25・27・28）
   ・お題（部屋全体で合計して数える。type 'task'）：「〜にゃん」と言う／ロシアンルーレット（空砲。負けた人は罰ゲーム＝条件の行為をもう一回）／
     くすぐられる（合計の秒数。数字×10秒）／風船を割る。R18向けのお題（水を飲む・媚薬ガス入りの風船）は room-games-r18.js（R18版だけ）
   ・相手を傷つけないと出られない（二人の組で数える。type 'hurt'）：平手・つねる・言葉の三段。展開の重さ・死ネタの重さに連動し、どちらかが「穏やか」なら言葉だけ。
     関係（恋人・敵対・無関心）で台詞と、そのあとの気持ちの動きを分ける
   ・三人で（三人の組で数える。type 'trio'。三人以上のとき）：R18版では三人のエッチ（三組とも HK.Pos.okSex を通す三人だけ。room-trio.js の場面）。
     通る三人がいなければ、最初の記録にその旨を書いて「三人で抱き合う」に落とす。全年齢版・全年齢モードは、はじめから三人で手をつないで抱き合う版。
     二人しかいない部屋では「ハグ」に落とす */
(function () {
  'use strict';
  var HK = window.HK, A = HK.RoomAPI;
  if (!A || !A.addKind) return;
  var K = A.K, EV = A.EV, scen = A.scen;
  function R(ctx, a, b) { return ctx.R(a, b); }
  function nm(list) { return list.map(function (c) { return c.name; }).join('・'); }
  function ruleK(ctx, k) { return ctx.rules.filter(function (r) { return r.k === k; })[0]; }
  function free(c) { return !!c && c.alive !== false && !c.out && !(c.flags && (c.flags.down || c.flags.knocked)) && c.flags.cagePair == null; }
  function fillN(s, n) { return String(s).replace(/\{N\}/g, String(n)); }
  /* 同じ文の候補から、直前と同じ文を続けて選ばない（お題を何度も繰り返す部屋で、同じ文が並ばないように） */
  function pickNew(ctx, pool) {
    var L = ctx.flags.gLast = ctx.flags.gLast || {}, key = pool[0], c = pool.length > 1 ? pool.filter(function (s) { return s !== L[key]; }) : pool;
    var s = ctx.pick(c.length ? c : pool);
    L[key] = s;
    return s;
  }
  /* いちばん強い気質（文の書き分け） */
  function topKey(c) {
    var t = c.tr, best = 'np', bv = -1;
    [['np', t.np], ['fc', t.fc], ['cold', t.cold || 0], ['ac', t.ac], ['cp', t.cp]].forEach(function (x) { if (x[1] > bv) { bv = x[1]; best = x[0]; } });
    return best;
  }

  /* ================= 条件の部品 ================= */
  var softNow = false;   /* 三人で、の条件が抱き合う版に落ちた部屋の名前を付け直すあいだだけ真 */
  function trioSoft() { return HK.SAFE_ON || softNow; }
  /* goal：経過の画面の「条件を満たした」印に出す短い名前 */
  A.addKind('nyan', { type: 'task', noun: '「にゃん」', unit: '回', goal: '「にゃん」と言う',
    fin: function (n) { return '語尾に「にゃん」を付けて' + n + '回しゃべらないと'; }, mid: function (n) { return '語尾に「にゃん」を付けて' + n + '回しゃべって'; },
    nounN: function (n) { return '「にゃん」' + n + '回'; }, left: function (x) { return '「にゃん」があと' + x + '回'; }, last: function () { return '最後の「にゃん」が部屋に響いた'; } }, '「〜にゃん」と言う（部屋の全員で合計）');
  A.addKind('roulette', { type: 'task', noun: 'ロシアンルーレット', unit: '回', goal: 'ロシアンルーレット',
    fin: function (n) { return 'ロシアンルーレットを' + (n > 1 ? n + '回' : '') + 'しないと'; }, mid: function (n) { return 'ロシアンルーレットを' + (n > 1 ? n + '回' : '') + 'して'; },
    nounN: function (n) { return 'ロシアンルーレット' + (n > 1 ? n + '回' : ''); }, left: function (x) { return 'ロシアンルーレットがあと' + x + '回'; }, last: function () { return '最後の空砲が鳴った'; } }, 'ロシアンルーレット（空砲。負けた人は罰ゲーム）');
  A.addKind('tickle', { type: 'task', noun: 'くすぐり', unit: '秒', mul: 10, goal: 'くすぐられる',
    fin: function (n) { return '合計' + n + '秒くすぐられないと'; }, mid: function (n) { return '合計' + n + '秒くすぐられて'; },
    nounN: function (n) { return 'くすぐり合計' + n + '秒'; }, left: function (x) { return 'くすぐりがあと' + x + '秒'; }, last: function () { return 'タイマーが最後の一秒を刻んだ'; } }, 'くすぐられる（部屋の全員で合計の秒数。数字×10秒）');
  A.addKind('balloon', { type: 'task', noun: '風船', unit: '個', goal: '風船を割る',
    fin: function (n) { return '風船を' + n + '個割らないと'; }, mid: function (n) { return '風船を' + n + '個割って'; },
    nounN: function (n) { return '風船' + n + '個'; }, left: function (x) { return '風船があと' + x + '個'; }, last: function () { return '最後の風船が割れた'; } }, '風船を割る');
  A.addKind('hurt', { type: 'hurt', noun: '傷つけること', unit: '回', goal: '相手を傷つける',
    fin: function (n) { return '相手を' + (n > 1 ? n + '回' : '') + '傷つけないと'; }, mid: function (n) { return '相手を' + (n > 1 ? n + '回' : '') + '傷つけて'; },
    nounN: function (n) { return '相手を傷つけること' + (n > 1 ? n + '回' : ''); },
    leftP: function (x, n) { return n > 1 ? 'どちらかが傷つくことがあと' + x + '回' : 'どちらかが傷つくこと'; } }, '相手を傷つける（平手・つねる・言葉。どちらかが傷つけば満たす）');
  var TRIO_LABEL = '三人で抱き合う（三人以上のとき）';
  /* r18:begin */
  TRIO_LABEL = '三人で仲良くする（R18版では3P。三人以上のとき。全年齢モードでは三人で抱き合う）';
  /* r18:end */
  A.addKind('trio3', { type: 'trio', noun: '三人で', unit: '回', goal: '三人で',
    fin: function (n) { return '三人で' + (n > 1 ? n + '回' : '') + (trioSoft() ? '抱き合わないと' : '仲良くしないと'); },
    mid: function (n) { return '三人で' + (n > 1 ? n + '回' : '') + (trioSoft() ? '抱き合って' : '仲良くして'); },
    nounN: function (n) { return '三人での' + (trioSoft() ? 'ハグ' : '仲良し') + (n > 1 ? n + '回' : ''); },
    leftP: function (x, n) { return '三人で' + (trioSoft() ? '抱き合うこと' : '仲良くすること') + (n > 1 ? 'があと' + x + '回' : ''); } }, TRIO_LABEL);
  A.noteN('くすぐりは「1」で10秒として数える');

  /* ================= 部屋の紙・最初の様子（導入） ================= */
  var INTRO = {
    nyan: ['扉の脇の壁には、数字のカウンターが埋め込まれていた。語尾に「にゃん」を付けてしゃべった回数を数えるらしい。表示は0/{N}。', '扉の紙の横に、猫耳のカチューシャが人数分ぶら下がっていた。壁のカウンターには「0/{N}」と出ている。', '扉の紙の下に、小さな字で注意書きがあった。誰が言っても、部屋の全員の合計で数えるという。壁のカウンターは0を示していた。'],
    roulette: ['テーブルの上に、古びたリボルバーが一丁置かれていた。添えられたメモには、弾は空砲が一発、音が鳴った人の負け、負けた人は罰ゲーム、とある。', 'テーブルのリボルバーの横に、メモが一枚。空砲が一発だけ入っていること、そして罰ゲームは「扉の条件をもう一回」であることが書かれていた。', '部屋の真ん中の小さなテーブルに、リボルバーが置かれていた。弾倉には、空砲が一発だけ。その重さに、誰もすぐには手を伸ばさなかった。'],
    tickle: ['壁の高いところに、大きなタイマーが掛かっていた。誰かがくすぐられているあいだだけ進むらしい。表示は0/{N}秒。', '部屋の隅に、羽根ぼうきが一本立てかけてあった。壁のタイマーは0/{N}秒を示している。', '扉の紙の下に、小さな字で注意書きがあった。誰がくすぐられても、合計の秒数で数えるという。壁のタイマーは止まったままだ。'],
    balloon: ['床一面に、色とりどりの風船が転がっていた。数えると、ちょうど{N}個。', '天井から、たくさんの風船がぶら下がっていた。紐の先には、一つずつ番号札がついている。全部で{N}個。', '部屋の半分が、膨らんだ風船で埋まっていた。歩くたびに、足元で風船がきゅっと鳴った。'],
    hurt: ['扉の紙の下には、赤い字で注意書きがあった。傷つけ方は問わない、と。誰も、すぐには口を開かなかった。', '扉の紙を読んだ全員の顔がこわばった。殴る必要はない。けれど、何もしないわけにはいかない。', '扉の紙の条件の横に、小さな救急箱が置かれていた。それが、かえって気味が悪かった。'],
    trio3: ['扉の紙の条件の横には、三つの丸を線でつないだ絵が描かれていた。', '扉の紙には、三人が抱き合う簡単な絵が添えられていた。', '扉の紙の「三人で」の字だけが、やけに大きく書かれていた。']
  };
  /* R18版の「三人で仲良く」の導入（全年齢版では文ごと落ちて null のまま） */
  var INTRO_H = null, LEAD_H = null;
  /* r18:begin */
  INTRO_H = ['扉の紙の条件の下に、小さな字で但し書きがあった。三人そろって、仲良く。意味は分かるはず、と。', '扉の紙の「三人で仲良く」の字の横に、ハートが三つ描かれていた。その意味を取り違える者はいなかった。', 'ベッドの脇には、三人で寝ても余るほど大きな毛布が畳んであった。扉の紙の「三人で」が、急に生々しく見えた。'];
  LEAD_H = ['扉の紙の「三人で仲良く」の意味を、三人はもう取り違えなかった。', '{a}と{b}と{c}は、扉の紙をもう一度だけ見て、それから互いを見た。', '三人は、誰からともなくベッドへ向かった。'];
  /* r18:end */

  /* ================= お題の出来事（部屋全体で数える） ================= */
  var TASK = {};
  function by(ctx, k, c, n) { var B = ctx.flags.taskBy = ctx.flags.taskBy || {}; var m = B[k] = B[k] || {}; m[c.i] = (m[c.i] || 0) + n; }
  function scaleOf(ctx, r, span) { return Math.max(1, Math.round(r.n / Math.max(4, ctx.stepsTotal * (span || 0.7)))); }
  /* お題が一つ済んだあと：ほかの条件がなければ全員で出る。二人の条件が残っていれば、もう満たしている組から出る */
  function taskDone(ctx, r, e) {
    ctx.say(e);
    if (!A.hasPairRule(ctx)) { A.checkExit(ctx); return; }
    if (A.globDone && !ctx.rules.every(function (q) { return !A.isGlob(K[q.k]) || A.globDone(ctx, q); })) return;
    ctx.say({ text: A.lastOf(r) + '。だが扉はまだ開かない。紙の残りの一文が、まだ残っている。' });
    ctx.present().forEach(function (x) {
      ctx.present().forEach(function (y) {
        if (x.i < y.i && !x.out && !y.out && !ctx.flags.oneOut && A.pairDone(ctx, x, y)) {
          var ex = A.exitPair(ctx, x, y, x.name + 'と' + y.name + 'は、もう一つの条件をすでに満たしていた。', '条件がすべて揃った', false);
          ctx.say({ kind: 'event', cat: 'escape', actors: [x, y], text: ex.text, why: ex.why, mag: 30 });
        }
      });
    });
  }
  function taskRule(ctx, a) {
    return ctx.rules.filter(function (r) { return K[r.k].type === 'task' && TASK[r.k] && A.globLeft(ctx, r) > 0 && (!TASK[r.k].when || TASK[r.k].when(ctx, a, r)); })[0];
  }
  EV.push({
    id: 'room_task', label: '扉の条件の恥ずかしい課題をこなす', cat: 'escape', scope: 'solo', pri: true,
    when: function (ctx, a) { return free(a) && !!taskRule(ctx, a); },
    /* 時間の進みに対して、お題が遅れているほど起きやすい（扉の紙を見て焦る） */
    w: function (ctx, a) {
      var r = taskRule(ctx, a), H = TASK[r.k], tf = ctx.stepIndex / Math.max(4, ctx.stepsTotal), df = 1 - A.globLeft(ctx, r) / r.n;
      /* 条件の順番あり（条件1を満たしてから条件2）で、このお題が条件1：条件2が待っているので、先に片づけようとする */
      var gate = ctx.env.order === 'seq' && ctx.rules.length === 2 && ctx.rules[0] === r ? 2.5 : 1;
      return (1.8 + (H.fit ? H.fit(a) : 0.5) * 1.4 + a.stress / 120 + tf * 1.6) * (1 + 3 * Math.max(0, tf - df)) * gate;
    },
    run: function (ctx, a) {
      var r = taskRule(ctx, a), H = TASK[r.k], T = K[r.k], left = A.globLeft(ctx, r);
      var first = !(ctx.flags.taskFirst = ctx.flags.taskFirst || {})[r.k];
      ctx.flags.taskFirst[r.k] = 1;
      var res = H.run(ctx, a, r, first, left);
      if (!res) return null;
      var inc = Math.max(0, Math.min(left, res.inc || 0));
      ctx.flags.consumed[r.k] = (ctx.flags.consumed[r.k] || 0) + inc;
      if (inc) by(ctx, r.k, res.who || a, inc);
      var total = r.n - A.globLeft(ctx, r);
      var text = res.text + (inc ? '（' + T.noun + ' ' + total + '/' + r.n + T.unit + '）' : '');
      if (res.after) text += res.after();
      var actors = [a].concat((res.with || []).filter(function (c) { return c !== a; }));
      if (total >= r.n) {
        /* 達成の文：{a}{b} は出来事の側が決める（くすぐりは {a}＝くすぐった人・{b}＝くすぐられた人） */
        text += ctx.t(fillN(ctx.pick(H.done), r.n), res.doneA || a, res.doneB || (res.with && res.with[0]) || null);
        taskDone(ctx, r, { kind: 'event', cat: 'escape', actors: actors, text: text, why: res.why, mag: 12, sex: !!res.sex, lewd: res.lewd });
        return null;
      }
      return { cat: res.cat, text: text, why: res.why, with: res.with, mag: res.mag || 6, sex: res.sex, lewd: res.lewd };
    }
  });

  /* ---------- 「〜にゃん」と言う ---------- */
  var NYAN = {
    first: ['{a}は扉の紙を三回読み直してから、観念したように口を開いた。{a}「……よろしくにゃん｜……よろしく頼むにゃん｜……よろしくお願いしますにゃん」言い終えた途端、{a}の耳が真っ赤になった。', '{a}は咳払いを一つして、壁のカウンターをにらんだ。{a}「数えるなら、ちゃんと数えてにゃん｜数えるなら、ちゃんと数えろにゃん｜数えるなら、ちゃんと数えてくださいにゃん」カウンターの数字が、ぴこんと増えた。', '{a}は誰とも目を合わせないまま、小さな声で言った。{a}「……にゃん｜＝｜……にゃん、です」それでも、壁のカウンターは律儀に数を進めた。'],
    fc: ['{a}は両手を猫の手にして、くるりと回ってみせた。{a}「お腹すいたにゃん｜腹が減ったにゃん｜お腹が空きましたにゃん」部屋の空気が、少しだけゆるんだ。', '{a}は面白がって、一言ごとに語尾を付けた。{a}「この部屋、意外と快適にゃん。ベッドもふかふかにゃん｜この部屋は意外と快適にゃん。ベッドもふかふかにゃん｜この部屋、意外と快適ですにゃん。ベッドもふかふかですにゃん」カウンターの数字が、まとめて進んだ。', '{a}は{b}の肩をつついた。{a}「一緒に言おうにゃん｜一緒に言うにゃん｜一緒に言いましょうにゃん」{a}だけが、やけに楽しそうだった。'],
    cold: ['{a}は表情ひとつ変えずに言った。{a}「了解にゃん。続けるにゃん｜＝｜了解ですにゃん。続けますにゃん」淡々とした声が、かえって部屋の笑いを誘った。', '{a}は壁のカウンターを見上げ、残りの回数を確かめた。{a}「効率よく済ませるにゃん｜＝｜効率よく済ませましょうにゃん」誰も笑ってはいけない気がした。', '{a}は腕を組んだまま、事務連絡のように言った。{a}「水を飲むにゃん。寝るにゃん。以上にゃん｜＝｜水を飲みますにゃん。寝ますにゃん。以上ですにゃん」カウンターが、まとめて進んだ。'],
    ac: ['{a}は膝を抱えて、蚊の鳴くような声で言った。{a}「……喉、かわいたにゃん｜……喉が、渇いたにゃん｜……喉が、渇きましたにゃん」顔を上げられないまま、{a}はさらに小さく丸まった。', '{a}は何度も口を開きかけてはやめ、ようやく言った。{a}「わ、私も、言うにゃん｜＝｜わ、私も、言いますにゃん」声が裏返った。', '{a}は手で顔を隠したまま言った。{a}「見ないでにゃん｜見るなにゃん｜見ないでくださいにゃん」隠しきれない耳が、真っ赤だった。'],
    cp: ['{a}は紙をにらみつけたまま、吐き捨てるように言った。{a}「ふざけてるにゃん｜ふざけているにゃん｜ふざけていますにゃん」怒っているのに語尾だけ守るので、誰かが吹き出した。', '{a}は眉間に皺を寄せた。{a}「こんな条件を考えた人に、文句を言いたいにゃん｜＝｜こんな条件を考えた人に、文句を言いたいですにゃん」語尾のせいで、少しも迫力がなかった。', '{a}は腕を組んで壁にもたれた。{a}「私は言わない。……言わないにゃん｜＝｜私は言いません。……言いませんにゃん」言ってしまったことに気づいて、{a}は天井を仰いだ。'],
    np: ['{a}は固まっている皆を見回して、先に手を挙げた。{a}「私が多めに言うにゃん。だから、気にしないでにゃん｜私が多めに言うにゃん。だから、気にするなにゃん｜私が多めに言いますにゃん。だから、気にしないでくださいにゃん」', '{a}は{b}の顔をのぞきこんだ。{a}「大丈夫、怖くないにゃん｜大丈夫だ、怖くないにゃん｜大丈夫です、怖くないですにゃん」{b}の肩から、少し力が抜けた。', '{a}は照れ笑いしながら、次々に言葉を継いだ。{a}「おはようにゃん。おやすみにゃん。ありがとうにゃん｜＝｜おはようございますにゃん。おやすみなさいにゃん。ありがとうございますにゃん」'],
    more: ['それからしばらく、{a}は語尾に「にゃん」を付けたまま、しゃべり続けた。', '一度言ってしまうと、{a}の口からは「にゃん」が次々に出てきた。', '{a}はそのまま、壁のカウンターが進むのを見ながら、何度か「にゃん」を繰り返した。'],
    react: ['{b}は口元を押さえて、肩を震わせていた。', '{b}「……今の、もう一回｜……今のを、もう一回だ｜……今のを、もう一回お願いします」{b}は真顔で言った。', '{b}は聞こえなかったふりをして、壁の継ぎ目を数え続けた。耳だけが、こちらを向いていた。', '{b}も観念したように、小さく「にゃん」と付け足した。'],
    done: ['{a}の一言で、壁のカウンターがちょうど{N}になった。部屋に、妙な達成感と気まずさが同時に広がった。', 'カウンターの数字が{N}でぴたりと止まった。{a}は両手で顔を覆った。{a}「……もう一生言わない｜＝｜……もう一生言いません」', '最後の「にゃん」を言い終えた{a}は、深いため息をついた。誰も、今の数時間のことを口にしようとはしなかった。']
  };
  TASK.nyan = {
    fit: function (c) { return c.tr.fc * 0.6 + c.tr.np * 0.3 - c.tr.cp * 0.2; },
    done: NYAN.done,
    run: function (ctx, a, r, first) {
      var b = ctx.pick(ctx.others(a).filter(free)) || null;
      var tk = topKey(a), pool = first ? NYAN.first : NYAN[tk] || NYAN.np;
      /* {b} を使う文は、相手がいるときだけ */
      if (!b) pool = pool.filter(function (s) { return s.indexOf('{b}') < 0; });
      if (!pool.length) pool = NYAN.first;
      var inc = (tk === 'fc' || tk === 'np' ? 1 + ctx.rng.int(3) : 1 + ctx.rng.int(2)) * scaleOf(ctx, r);
      var text = ctx.t(pickNew(ctx, pool), a, b);
      if (b && ctx.rng() < 0.6) { text += ctx.t(pickNew(ctx, NYAN.react), a, b); ctx.mod(b, a, { aff: 2 }); }
      /* 文の中の「にゃん」より多く数えるときは、そのあともしゃべり続けたことにする */
      if (inc > (text.match(/にゃん/g) || []).length + 1) text += pickNew(ctx, NYAN.more).replace(/\{a\}/g, a.name);
      if (tk === 'cp' || tk === 'ac') ctx.stress(a, 4); else ctx.stress(a, -3);
      return { text: text, inc: inc, with: b ? [b] : null, cat: 'bond', why: a.name + 'の' + { fc: '奔放さ（面白がる）', cold: 'ドライさ（淡々とこなす）', ac: '照れ（顔が上げられない）', cp: '厳しさ（腹を立てながら）', np: '優しさ（皆の分まで）' }[tk] + '。お題：語尾に「にゃん」' };
    }
  };

  /* ---------- ロシアンルーレット（空砲。負けた人は罰ゲーム＝条件の行為をもう一回） ---------- */
  var RR = {
    start: ['{a}は銃を手に取り、弾倉を回した。', '{a}が弾倉を指で弾くと、からからと乾いた音がした。', '{a}はリボルバーを持ち上げ、皆の顔を順に見た。{a}「回す｜回すぞ｜回します」'],
    lose: ['{a}は肩を跳ねさせ、それから自分が無事なことを確かめるように胸を押さえた。', '{a}「……分かっていても、怖い｜……分かっていても、怖いな｜……分かっていても、怖いです」{a}は銃をそっとテーブルに戻した。', '{a}はしばらく天井を見上げたまま動かなかった。耳の奥で、まだ音が鳴っていた。'],
    pen: ['罰ゲームは、扉の紙の条件をもう一回。{a}は覚悟を決めて、{b}の方を向いた。', 'メモの裏には、罰ゲームは条件の行為をもう一回、とあった。{a}は{b}に目で尋ね、{b}は小さく頷いた。', '{b}「罰ゲームだよ｜罰ゲームだ｜罰ゲームですよ」{b}にそう言われて、{a}は観念した。'],
    light: ['罰ゲームとして、{a}は皆の前で変顔を十秒続けた。誰も笑わないので、余計に恥ずかしかった。', '罰ゲームは、恥ずかしい昔話を一つ。{a}は渋々、学生のころの失敗談を話した。思ったより受けた。', '罰ゲームとして、{a}は部屋の真ん中で一曲歌わされた。拍手は、まばらだった。', '罰ゲームは、皆の肩を順番に揉むことだった。{a}「……どこが凝ってる？｜……どこが凝っている？｜……どこが凝っていますか？」'],
    done: ['最後の空砲が鳴ると、リボルバーのメモの文字が「おつかれさま」に変わった。', '{N}回目の空砲の音が、白い壁に吸い込まれていった。もう、引き金を引かなくていい。', '最後の音が鳴り終わると、{a}はリボルバーをそっとテーブルに置いた。手のひらが汗で湿っていた。']
  };
  RR.first = ['誰も動かないので、{a}が最初にリボルバーを手に取った。思ったより重かった。', '{a}は深呼吸を一つして、テーブルのリボルバーに手を伸ばした。{a}「空砲なら、怖くない｜空砲なら、怖くはない｜空砲なら、怖くありません」声が少し震えていた。', '{a}がメモをもう一度読み上げ、それから銃を取った。誰も、止めなかった。'];
  /* 罰ゲームにできる条件の行為と相手（体の関係は HK.Pos.okSex、キスは恋愛が両方向で成り立つ組だけ。気持ちか焦りがある組） */
  function actOk(ctx, r, x, y) {
    var lv = K[r.k].lvl;
    if (A.ruleDone(ctx, r, x, y) || (A.seqWait && A.seqWait(ctx, r, x, y))) return false;
    if (lv >= 5 && (!A.okSex(x, y) || (HK.RoomReluct && HK.RoomReluct.blocks(ctx, x, y)))) return false;
    if (lv >= 3 && (!HK.canLove(x, y) || !HK.canLove(y, x) || A.exclOther(ctx, x, y) || A.exclOther(ctx, y, x) || A.tieWall(ctx, x, y, lv) >= 999)) return false;
    if (lv >= 2 && HK.ngPair(x, y)) return false;
    return A.willing(ctx, x, y, lv) || A.desperate(ctx, x, y, lv) || (lv <= 2 && R(ctx, x, y).ten < 50 && R(ctx, y, x).ten < 50);
  }
  function penAct(ctx, x) {
    var out = null;
    ctx.rules.forEach(function (r) {
      if (out || K[r.k].type !== 'act') return;
      var cands = ctx.present().filter(function (y) { return y !== x && free(y) && actOk(ctx, r, x, y); });
      if (!cands.length) return;
      var y = cands.filter(function (c) { return c.i === x.flags.partner; })[0] || ctx.most(cands, function (c) { return R(ctx, x, c).att + R(ctx, c, x).att; });
      out = { r: r, b: y };
    });
    return out;
  }
  TASK.roulette = {
    fit: function (c) { return c.tr.fc * 0.4 + (c.tr.cold || 0) * 0.3 + c.tr.cp * 0.2; },
    done: RR.done,
    run: function (ctx, a, r, first) {
      var P = ctx.present().filter(free);
      if (P.indexOf(a) < 0) P.unshift(a);
      var s = P.indexOf(a), k = ctx.rng.int(6), loser = P[(s + k) % P.length];
      /* 一回目：誰が最初に銃を手に取るか（リボルバーとメモの様子は、目覚めたときの記録に書いてある） */
      var text = first ? ctx.t(pickNew(ctx, RR.first), a) : '';
      text += ctx.t(pickNew(ctx,RR.start), a);
      var clicks = [];
      for (var j = 0; j < k; j++) clicks.push(P[(s + j) % P.length].name + 'の番。カチリ。');
      text += (clicks.length > 3 ? clicks.slice(0, 2).join('') + '……カチリ、カチリ。' : clicks.join('')) + loser.name + 'の番。パン、と乾いた音が響いた。' + ctx.t(pickNew(ctx,RR.lose), loser);
      ctx.stress(loser, 8);
      (ctx.flags.rrLose = ctx.flags.rrLose || {})[loser.i] = (ctx.flags.rrLose[loser.i] || 0) + 1;
      var why = '空砲が' + loser.name + 'の番で鳴った（運）。罰ゲーム';
      var res = { text: text, inc: 1, who: a, with: loser !== a ? [loser] : [], cat: 'escape', why: why };
      /* 罰ゲーム：扉の条件の行為をもう一回（できる相手がいなければ、軽い罰ゲーム） */
      var pa = penAct(ctx, loser);
      res.after = function () {
        if (!pa) { ctx.stress(loser, 4); res.why += '：条件の行為を一緒にできる相手がいないので、軽い罰ゲーム'; return ctx.t(pickNew(ctx,RR.light), loser); }
        var x = loser, y = pa.b, rk = pa.r.k, wl = A.willing(ctx, x, y, K[rk].lvl);
        if (res.with.indexOf(y) < 0) res.with.push(y);
        A.bumpAct(ctx, pa.r, x, y, 1);
        var t = ctx.t(pickNew(ctx,RR.pen), x, y), LW = HK.RoomLewd;
        if (rk === 'h') {
          t += LW && LW.scene ? LW.scene(ctx, x, y, wl ? 'will' : 'des') : ctx.t('{a}と{b}は、罰ゲームの分だけ、もう一度身を寄せ合った。――', x, y);
          ctx.pair(x, y).night = true; res.sex = true; res.lewd = true;
        } else t += ctx.t(pickNew(ctx,A.ACT_TEXT[rk][wl ? 'will' : 'des']), x, y);
        ctx.mod2(x, y, { att: 3, trust: 2 }, { att: 3, trust: 2 });
        t += A.cntTag(ctx, pa.r, x, y, A.prog(ctx, x, y).act[rk]);
        res.cat = 'romance';
        res.why += '：扉の条件（' + A.KLABEL[rk] + '）をもう一回。相手は' + y.name + '（' + (wl ? '互いの惹かれと信頼' : '焦りと諦め') + '）';
        if (A.pairDone(ctx, x, y)) {
          var ex = A.exitPair(ctx, x, y, '', res.why, rk === 'h');
          t += ex.text; res.why = ex.why;
        }
        return t;
      };
      return res;
    }
  };

  /* ---------- くすぐられる（合計の秒数） ---------- */
  var TK = {
    first: ['{a}は壁のタイマーを見上げてから、{b}に向き直った。{a}「……覚悟して｜……覚悟しろ｜……覚悟してください」{b}が身構えるより早く、{a}の指が脇腹に届いた。', '{a}は両手の指をわきわきと動かしながら、{b}に近づいた。{b}「待って、心の準備が｜待て、心の準備が｜待ってください、心の準備が」――待たなかった。', '{a}は{b}に、どこが弱いのかと真面目な顔で訊いた。{b}が答えるより先に、{b}の脇腹が答えを出した。'],
    warm: ['{a}は{b}の脇腹をくすぐった。{b}「あははっ、待って、待って｜ははっ、待て、待てって｜あははっ、待ってください、待って」{b}は笑いすぎて、床を転げ回った。', '{a}の指が{b}の首筋をなぞると、{b}は笑い声を上げて身をよじった。タイマーの数字が、どんどん進んでいく。', '{b}は笑い涙を拭いながら、それでも逃げなかった。{b}「あと何秒？｜あと何秒だ？｜あと何秒ですか？」{a}「内緒｜内緒だ｜内緒です」'],
    awk: ['{a}は遠慮がちに、{b}の脇腹をつついた。{b}は笑いをこらえて、唇を噛んでいた。タイマーは、それでも進んだ。', '{a}と{b}は、目を合わせないまま条件をこなした。{b}の押し殺した笑い声だけが、部屋に響いていた。', '{a}は{b}の足の裏をくすぐった。{b}「……っ、くすぐったい｜……っ、くすぐったいな｜……っ、くすぐったいです」{b}の声は、思ったより高かった。'],
    foe: ['{a}は容赦なく{b}の脇腹を攻めた。{b}「やめ、っ……覚えてて｜やめ、っ……覚えていろ｜やめ、っ……覚えていてください」笑いながらにらむという器用なことを、{b}はやってのけた。', '{b}は歯を食いしばって笑いをこらえていた。{a}はそれが面白くて、手を止めなかった。', '{a}の指が触れるたびに、{b}は笑い声と文句を交互に上げた。タイマーの数字だけが、律儀に進んでいった。'],
    done: ['タイマーが{N}秒を指したところで、ブザーが鳴った。{b}は床に大の字になって、肩で息をしていた。', 'ブザーの音で、{a}はようやく手を止めた。{b}の目尻には、笑い涙がたまっていた。', '最後の一秒が過ぎると、タイマーの表示が「満了」に変わった。くすぐられ続けた{b}は、しばらく起き上がれなかった。']
  };
  TASK.tickle = {
    fit: function (c) { return c.tr.fc * 0.6 + c.tr.np * 0.2 + (c.tr.aggr || 0) * 0.2; },
    done: TK.done,
    when: function (ctx, a) { return ctx.others(a).some(free); },
    run: function (ctx, a, r, first) {
      var O = ctx.others(a).filter(free);
      if (!O.length) return null;
      var b = HK.weighted(ctx.rng, O, function (o) { return Math.max(0.2, 1 + (R(ctx, a, o).aff + R(ctx, o, a).aff) / 60 + o.tr.fc * 0.5); });
      var ten = Math.max(R(ctx, a, b).ten, R(ctx, b, a).ten), warm = ctx.pair(a, b).couple || (R(ctx, a, b).aff > 15 && R(ctx, b, a).aff > 15);
      var kind = ten > 45 ? 'foe' : warm ? 'warm' : 'awk';
      var sec = Math.max(10, Math.round(r.n / Math.max(3, ctx.stepsTotal * 0.4) * (0.6 + ctx.rng() * 0.8) / 5) * 5);
      var text = ctx.t(pickNew(ctx,first ? TK.first : TK[kind]), a, b);
      ctx.stress(b, -5);
      if (kind === 'foe') ctx.mod(b, a, { ten: 4 }); else ctx.mod2(a, b, { trust: 2, aff: 1 }, { trust: 2, aff: kind === 'warm' ? 2 : 0 });
      return { text: text, inc: sec, who: b, with: [b], doneA: a, doneB: b, cat: 'bond', why: a.name + 'が' + b.name + 'を' + sec + '秒くすぐった（' + { warm: '仲がよい', awk: 'ぎこちない', foe: '張りつめた' }[kind] + '二人）' };
    }
  };

  /* ---------- 風船を割る ---------- */
  var BL = {
    fc: ['{a}は風船の上に勢いよく尻もちをついた。パン、と派手な音がして、{a}はそのまま床に転がって笑った。', '{a}は風船を両手で抱えて、思いきり締め上げた。{a}「割れろ、割れろ｜＝｜割れてください、お願いします」――パン。', '{a}は風船を蹴り上げては踏みつけ、次々に割っていった。'],
    ac: ['{a}は耳を両手で塞ぎながら、そっと風船を踏んだ。パン、という音に、{a}自身がいちばん驚いていた。', '{a}はヘアピンを一本抜いて、風船の端をそっとつついた。割れた瞬間、小さく悲鳴を上げた。', '{a}は風船から顔を背けたまま、ゆっくり体重をかけた。{a}「来る、来る……｜＝｜来ます、来ます……」――パン。'],
    cold: ['{a}は風船を一列に並べ、端から順番に踏み割っていった。無駄のない動きだった。', '{a}は割れやすい結び目の近くを狙って、指で弾いて割った。', '{a}「一人あたりの割り当てを出した｜＝｜一人あたりの割り当てを出しました」{a}は自分の分を、黙々と割った。'],
    np: ['{a}は怖がる皆の分まで、風船を引き受けて割った。', '{a}は割れる音に皆が驚かないように、「次、割るよ｜次、割るぞ｜次、割りますよ」と声をかけてから踏んだ。', '{a}は割れた風船の切れ端を、一つずつ拾い集めた。'],
    cp: ['{a}は風船を力任せに握りつぶした。{a}「こんなもの｜＝｜こんなもの、です」――パン。', '{a}は鬼のような形相で、風船を次々に踏み抜いた。', '{a}は割れない風船に苛立ち、二度、三度と踏みつけた。'],
    pair: ['{a}と{b}は、風船を一つ体の間に挟んで、ぎゅっと押し合った。なかなか割れずに、二人の顔が近づいていく。――パン。二人は同時に跳び退いた。', '{a}が{b}の背中に風船を押し当てて、体重をかけて割った。{b}「わっ、びっくりした｜わっ、驚いた｜わっ、びっくりしました」{b}の悲鳴に、{a}が吹き出した。', '{a}と{b}は、背中合わせに風船を挟んで、せーので体重をかけた。パン、と割れた音と一緒に、二人は床に尻もちをついた。'],
    done: ['最後の風船が割れた。床には、色とりどりのゴムの切れ端だけが残った。', '最後の一個は、なかなか割れなかった。{a}が全体重をかけて、ようやくパンと鳴った。', '{N}個目の風船が割れると、部屋は急に静かになった。耳の奥に、まだ音が残っていた。']
  };
  TASK.balloon = {
    fit: function (c) { return c.tr.fc * 0.5 + c.tr.np * 0.3 + (c.tr.cold || 0) * 0.2; },
    done: BL.done,
    run: function (ctx, a, r) {
      var inc = (1 + ctx.rng.int(3)) * scaleOf(ctx, r);
      /* 二人で挟んで割る：張りつめていない、恋愛・R18にしない組でもない二人だけ */
      var mate = ctx.most(ctx.others(a).filter(function (o) { return free(o) && !HK.ngPair(a, o) && R(ctx, a, o).ten < 40 && R(ctx, o, a).ten < 40 && R(ctx, a, o).aff > 5 && R(ctx, o, a).aff > 5; }), function (o) { return R(ctx, a, o).aff + R(ctx, o, a).aff; });
      if (mate && ctx.rng() < 0.3) {
        ctx.mod2(a, mate, { att: 2, trust: 2 }, { att: 2, trust: 2 });
        return { text: ctx.t(pickNew(ctx,BL.pair), a, mate), inc: inc, with: [mate], cat: 'bond', why: a.name + 'と' + mate.name + 'は気安い仲。二人で挟んで割った' };
      }
      var tk = topKey(a);
      if (tk === 'ac') ctx.stress(a, 5); else ctx.stress(a, -3);
      return { text: ctx.t(pickNew(ctx,BL[tk] || BL.np), a), inc: inc, cat: 'escape', why: a.name + 'の' + { fc: '奔放さ', ac: '怖がり', cold: 'ドライさ（効率）', np: '優しさ（皆の分まで）', cp: '厳しさ（苛立ち）' }[tk] + '。お題：風船を割る' };
    }
  };

  /* ================= 相手を傷つけないと出られない（二人の組） ================= */
  function hurtRule(ctx) { return ruleK(ctx, 'hurt'); }
  /* 二人の関係：恋人（恋人の組・恋人の関係・惹かれと好意が高い）／敵対（緊張が高い・好意が低い・敵対の関係）／無関心（そのほか） */
  function relOf(ctx, a, b) {
    var Ti = HK.Ties, ab = R(ctx, a, b), ba = R(ctx, b, a);
    var lover = ctx.pair(a, b).couple || (Ti && Ti.has && (Ti.has(ctx, a, b, 'lover') || Ti.has(ctx, a, b, 'mate') || Ti.has(ctx, a, b, 'fated'))) || (ab.att > 45 && ba.att > 45 && ab.aff > 30 && ba.aff > 30 && HK.canLove(a, b) && HK.canLove(b, a));
    if (lover) return 'love';
    if (Math.max(ab.ten, ba.ten) > 45 || Math.min(ab.aff, ba.aff) < -20 || (Ti && Ti.has && (Ti.has(ctx, a, b, 'enemy') || Ti.has(ctx, a, b, 'rival')))) return 'foe';
    return 'cold';
  }
  /* 傷つけ方の段：展開の重さ（harm）と死ネタの重さ（kill）の軽い方で決める。穏やかなら言葉だけ */
  function tierOf(ctx) {
    var D = HK.Dark, h = D ? D.on(ctx, 'harm') : 'normal', k = D ? D.on(ctx, 'kill') : 'normal';
    if (h === 'mild' || k === 'mild') return 'word';
    var w = h === 'dark' && k === 'dark' ? [0.2, 0.3, 0.5] : [0.4, 0.35, 0.25], x = ctx.rng();
    return x < w[0] ? 'word' : x < w[0] + w[1] ? 'pinch' : 'slap';
  }
  var HURT = {
    no: {
      love: ['{a}は{b}の頬に手を伸ばしかけて、そのまま撫でてしまった。{a}「……できない｜＝｜……できません」', '{a}は{b}を傷つける言葉を探して、一つも見つけられなかった。', '{b}は目を閉じて待った。{b}「いいよ、叩いて｜いい、叩け｜いいですよ、叩いてください」{a}は手を上げたまま、下ろせなかった。'],
      foe: ['{a}は{b}をにらみつけ、拳を握った。……けれど、紙の言いなりになるのは癪だった。', '{a}は{b}に詰め寄ったが、{b}の目を見て、言いかけた言葉を飲み込んだ。', '{a}「あなたのために手を汚すのも、ばかばかしい｜あなたのために手を汚すのも、ばかばかしいな｜あなたのために手を汚すのも、ばかばかしいです」{a}は背を向けた。'],
      cold: ['{a}は{b}の前に立ったが、何を言えば傷つくのか、{b}のことを何も知らなかった。', '{a}は手を上げかけて、やめた。理由もなく人を叩けるほど、{a}は冷たくなれなかった。', '{a}と{b}は気まずく顔を見合わせた。どちらも、相手を傷つける理由を持っていなかった。']
    },
    word: {
      love: ['{a}は目を伏せて、震える声で言った。{a}「あなたの寝相、本当にひどい。毎晩、蹴られてる｜あなたの寝相は、本当にひどい。毎晩、蹴られている｜あなたの寝相、本当にひどいです。毎晩、蹴られています」{b}は目を丸くして、それから少し傷ついた顔をした。', '{a}は{b}のいちばん気にしていることを、わざと口にした。{a}「前から思ってた。料理、下手だよね｜前から思っていた。料理が下手だな｜前から思っていました。料理、下手ですよね」言った{a}の方が、泣きそうだった。', '{a}「あなたなんか、嫌い｜あなたなんか、嫌いだ｜あなたなんか、嫌いです」{a}は言った直後に、{b}の手を握っていた。{b}は、その言葉が嘘だと知っていた。'],
      foe: ['{a}は{b}に向かって、ずっと腹に溜めていたことをぶちまけた。{b}の顔から、すっと表情が消えた。', '{a}「あなたと同じ部屋にいるだけで、息が詰まる｜＝｜あなたと同じ部屋にいるだけで、息が詰まります」{a}の言葉は、{b}のいちばん痛いところに刺さった。', '{a}は{b}の失敗を、一つずつ数え上げた。{b}は黙って聞いていたが、握った拳が白くなっていた。'],
      cold: ['{a}は{b}をまっすぐ見て、感情のこもらない声で言った。{a}「あなたのこと、別に何とも思ってない｜あなたのことは、別に何とも思っていない｜あなたのこと、別に何とも思っていません」{b}は、思ったより傷ついた顔をした。', '{a}は{b}の服の趣味を、淡々とけなした。{b}「……そこまで言わなくても｜……そこまで言わなくてもいいだろう｜……そこまで言わなくても、いいでしょう」', '{a}「正直、あなたの話はいつも退屈｜正直、あなたの話はいつも退屈だ｜正直、あなたの話はいつも退屈です」{b}は苦笑いしたが、目は笑っていなかった。']
    },
    pinch: {
      love: ['{a}は{b}の腕を、そっとつねった。{b}「……痛い｜……痛いな｜……痛いです」{a}はすぐに、つねったところを撫でた。', '{b}が自分から手の甲を差し出した。{a}はためらいながら、そこをつねった。赤い跡が、小さく残った。', '{a}は{b}の頬をつまんで、ぎゅっと引っぱった。{b}の目に涙がにじんだのは、痛みのせいだけではなかった。'],
      foe: ['{a}は{b}の二の腕を、爪を立ててつねり上げた。{b}は顔をしかめて、{a}をにらみ返した。', '{a}は{b}の手の甲を、ひねるようにつねった。{a}「これで済むなら、安いもの｜これで済むなら、安いものだ｜これで済むなら、安いものです」', '{a}は無言で{b}の脇腹をつねった。遠慮も、手加減もなかった。'],
      cold: ['{a}は「失礼｜失礼する｜失礼します」と断ってから、{b}の腕をつねった。{b}は小さく声を上げた。', '{a}は{b}の手の甲を、事務的につねった。痛みより、その手つきの冷たさの方がこたえた。', '{a}と{b}は、どちらがどちらをつねるかで少し揉めた。結局、{a}が{b}の腕をつねった。']
    },
    slap: {
      love: ['{a}は目をつぶって、{b}の頬を平手で打った。乾いた音のあと、{a}は{b}以上に痛そうな顔をした。', '{b}「いいよ。思いきりやって｜いい。思いきりやれ｜いいですよ。思いきりやってください」{a}は{b}の頬を打ち、すぐにその頬に手を添えた。', '{a}の平手は、{b}の頬を軽く打っただけだった。それでも扉の紙は、それを数えた。'],
      foe: ['{a}の平手が、{b}の頬を打った。部屋に響いた音は、思ったより大きかった。', '{a}は迷わず{b}の頬を張った。{b}の頬に、赤い手の跡が浮かんだ。', '{a}は{b}の頬を打ってから、手のひらを振った。{a}「ずっと、こうしたかった｜＝｜ずっと、こうしたかったんです」'],
      cold: ['{a}は{b}に断ってから、その頬を平手で打った。{b}はよろめいたが、文句は言わなかった。', '{a}の平手は、迷いがなかった。{b}は打たれた頬を押さえて、{a}を見た。', '{a}と{b}は、どちらが打つかを、じゃんけんで決めた。負けた{b}の頬を、{a}の平手が打った。']
    },
    after: {
      love: ['{a}は{b}を抱き寄せて、何度も謝った。{b}「大丈夫。条件だから｜大丈夫だ。条件だから｜大丈夫です。条件ですから」', '二人は、しばらく黙って寄り添っていた。傷ついたのは、どちらも同じだった。', '{b}は笑ってみせた。{a}は、その笑顔を見ていられなかった。'],
      foe: ['{b}は{a}をにらみつけたまま、低い声で言った。{b}「覚えておく｜覚えておくぞ｜覚えておきます」', '{a}は少しだけ気が晴れた顔をしていた。{b}の方は、そうはいかなかった。', '二人のあいだの空気は、前よりいっそう冷たくなった。'],
      cold: ['{a}と{b}は、気まずそうに目を逸らした。それ以上、何も言わなかった。', '{b}は肩をすくめた。{b}「お互い、仕方なかった｜＝｜お互い、仕方なかったですね」', '何でもない相手だったはずなのに、二人のあいだに小さな棘が残った。']
    }
  };
  var TIER_JA = { word: '言葉で傷つけた', pinch: 'つねった', slap: '平手で打った' }, REL_JA = { love: '恋人', foe: '敵対', cold: '無関心' };
  EV.push({
    id: 'cond_hurt', cat: 'conflict', scope: 'pair', pri: true,
    when: function (ctx, a, b) {
      var r = hurtRule(ctx);
      return !!r && ctx.stepIndex > 0 && free(a) && free(b) && !A.ruleDone(ctx, r, a, b) && a.stress > 20;
    },
    w: function (ctx, a, b) {
      var rel = relOf(ctx, a, b), t = ctx.stepIndex / Math.max(4, ctx.stepsTotal);
      var w = rel === 'foe' ? 1.8 + Math.max(R(ctx, a, b).ten, 0) / 50 : rel === 'love' ? 0.8 + a.stress / 120 : 1.1 + (a.tr.cold || 0) * 0.8;
      w += t * 2 + (a.flags.partner === b.i ? 0.5 : 0);
      /* 条件の順番あり：まだ数えない間は起きにくい。この条件が条件1なら、条件2が待っているので先に片づけようとする */
      if (A.seqWait(ctx, hurtRule(ctx), a, b)) w *= 0.15;
      else if (ctx.env.order === 'seq' && ctx.rules.length === 2 && ctx.rules[0] === hurtRule(ctx)) w *= 2;
      return w;
    },
    run: function (ctx, a, b) {
      var r = hurtRule(ctx), rel = relOf(ctx, a, b), t = ctx.stepIndex / Math.max(4, ctx.stepsTotal);
      var will = 0.15 + (a.tr.cold || 0) * 0.5 + (a.tr.aggr || 0) * 0.4 + a.stress / 150 - a.tr.np * 0.4 + (rel === 'foe' ? 0.3 : rel === 'love' ? -0.1 : 0) + t * 0.6;
      if (ctx.rng() > HK.clamp(will, 0.15, 0.92)) {
        ctx.stress(a, 6);
        if (rel === 'love') ctx.mod2(a, b, { aff: 2 }, { aff: 2 });
        return { cat: rel === 'love' ? 'bond' : 'conflict', text: ctx.t(pickNew(ctx,HURT.no[rel]), a, b), why: a.name + 'は条件を満たそうとして、踏みとどまった（関係：' + REL_JA[rel] + '）', mag: 8 };
      }
      var tier = tierOf(ctx), k = tier === 'slap' ? 1.3 : tier === 'pinch' ? 1 : 0.8;
      var counted = A.bumpAct(ctx, r, a, b, 1);
      var text = ctx.t(pickNew(ctx,HURT[tier][rel]), a, b) + ctx.t(pickNew(ctx,HURT.after[rel]), a, b);
      if (rel === 'love') { ctx.mod2(a, b, { trust: 3, aff: 2 }, { trust: 2, ten: 4 * k }); ctx.stress(a, 8); }
      else if (rel === 'foe') { ctx.mod(b, a, { ten: 14 * k, trust: -10 * k, aff: -8 * k }); ctx.mod(a, b, { ten: -3 }); ctx.stress(b, 6); }
      else { ctx.mod(b, a, { ten: 8 * k, trust: -6 * k }); ctx.stress(b, 4); }
      (ctx.flags.hurtLog = ctx.flags.hurtLog || []).push({ a: a.i, b: b.i, tier: tier, rel: rel });
      if (!counted) text += A.waitNote(ctx, r, a, b);
      else text += A.cntTag(ctx, r, a, b, A.prog(ctx, a, b).act.hurt);
      var why = a.name + 'は条件のために、' + b.name + 'を' + TIER_JA[tier] + '（関係：' + REL_JA[rel] + (HK.Dark ? '／' + HK.Dark.tag(ctx, 'harm') : '') + '）';
      if (counted && A.pairDone(ctx, a, b)) return A.exitPair(ctx, a, b, text, why, false);
      if (counted && A.ruleDone(ctx, r, a, b)) text += '扉はまだ開かない。' + a.name + 'と' + b.name + 'に残っているのは、' + A.leftText(ctx, a, b) + '。';
      return { text: text, why: why, mag: tier === 'slap' ? 22 : 15 };
    }
  });

  /* ================= 三人で（三人の組） ================= */
  function trioRule(ctx) { return ruleK(ctx, 'trio3'); }
  function pairs3(g) { return [[g[0], g[1]], [g[0], g[2]], [g[1], g[2]]]; }
  /* 体の関係の三人として成り立つか（R18版：三人の場面（3P）の判定 room-trio.js の T.sexOk3＝HK.Pos.trioPlan。2026-10-27 担当HN）：
     「三人の場面（3P）：しない」の人がいれば成り立たない。三組とも直接できれば三人とも、二組なら中心の一人とだけ触れ合う形。
     直接できない組（direct が偽：性行為の相手の固定・受け攻め・恋愛対象など）は、同じ場にいても見ている・声をかけるだけ */
  /* 一途（poly.js）で恋人のいる人は、恋人でない人がいる三人には加わらない（engine.js の romanceOk が止める）ので、その三人は成り立たない（2026-10-28 担当JB） */
  function faith3(g) { return !HK.Poly || !HK.Poly.faithOk || !HK._curCtx || HK.Poly.faithOk(HK._curCtx, g); }
  function hardOk(g) { var T = HK.RoomTrio; return !!(T && T.sexOk3 && T.sexOk3(g)) && faith3(g); }
  /* 一途で、この部屋に恋人がいて恋人でない人とは三人にならない人 */
  function faithOut(ctx, C) { return C.filter(function (c) { return c.faithful && HK.Poly && HK.Poly.faithOk && C.some(function (o) { return o !== c && !HK.Poly.faithOk(ctx, [c, o]); }); }); }
  function direct(x, y) { return !!(A.okSex && A.okSex(x, y)); }
  function soft(ctx) { return !!ctx.flags.trioSoft || HK.SAFE_ON; }
  /* 三人の誰も、決めた相手（「相手は一人だけ」）がこの三人の外にいない */
  function exclOk(ctx, g) { return g.every(function (x) { return !g.some(function (y) { return y !== x && A.exclOther(ctx, x, y); }); }); }
  function readyPair(ctx, x, y, lv) { return A.willing(ctx, x, y, lv) || A.desperate(ctx, x, y, lv); }
  /* 張りつめていない組が、時間が三割半を過ぎて焦り・覚悟・積極性で踏み切る */
  function lateOk(ctx, x, y, late) { return late && R(ctx, x, y).ten < 55 && R(ctx, y, x).ten < 55 && [x, y].every(function (z) { return z.stress > 45 || z.flags.resign || A.eager(ctx, z) > 0.5; }); }
  /* 不仲・敵対の二人（関係の不仲・敵対・ライバル、または嫌悪 35 以上。2026-10-28 担当LG：利用者の報告「不仲の相手がいると 3P が起きない」）。
     二人きりのエッチには、部屋の仕掛けとしての敵対する二人の場面（hate-sex-room-r18.js）があるが、三人の場面には道がなく、
     張りつめた組（緊張 55 以上）は最後まで「その気」にも「焦りが限界」にもならないので、三人の場面が起きなかった */
  function grudge(ctx, x, y) {
    if (HK.SAFE_ON || !x || !y) return false;
    var ts = HK.Ties && HK.Ties.all ? HK.Ties.all(ctx, x, y) : [], H = HK.HateKit;
    return ts.some(function (t) { return /^(rival|enemy|bad)$/.test(t.type); }) || !!(H && H.level && (H.level(ctx, x, y) >= 35 || H.level(ctx, y, x) >= 35));
  }
  /* 不仲の二人が、もう一人がいる三人の場面なら割り切って加わる：時間が三割半を過ぎて、二人とも焦り（性欲「弱い」の人は強い焦り）・覚悟・積極性があり、
     どちらも相手を避けていない（HK.Avoid：苦手・避けている人は、割り切っても加わらない）。三人のうち、ほかの直接の組の一つ以上がその気か焦りで踏み切れること（pickTrio） */
  /* 愛憎（気持ちの関係「愛憎」。2026-10-29 に不仲・敵対の欄 lh から移した。hate-love.js の HK.LoveHate が新しい関係も古い lh も読む）を持つ人は、三人の場面では相手をもう一人に取られそうなので、早く（時間の二割から）・
     弱い焦りでも踏み込む（2026-10-28 担当LG：利用者の要望「愛憎は、誰かに取られると思ったら自分が手に入れたいと思う気持ちもある」）。
     愛憎を持たない側は、ふつうの不仲と同じ（時間の三割半を過ぎて焦り） */
  function grudgeOk(ctx, x, y, late) {
    if (!grudge(ctx, x, y)) return false;
    if (HK.Avoid && (HK.Avoid.of(ctx, x, y) || HK.Avoid.of(ctx, y, x))) return false;
    var LH = HK.LoveHate, early = ctx.stepIndex >= ctx.stepsTotal * 0.2;
    return [x, y].every(function (z) {
      var o = z === x ? y : x;
      if (LH && LH.has && LH.has(ctx, z, o)) return early && (z.flags.resign || z.stress > 25 || A.eager(ctx, z) > 0.35);
      if (!late) return false;
      var low = HK.Pos && HK.Pos.libOf && HK.Pos.libOf(z) === 'low';
      return z.flags.resign || z.stress > (low ? 55 : 40) || A.eager(ctx, z) > (low ? 0.65 : 0.5);
    });
  }
  function pickTrio(ctx, a, b) {
    var r = trioRule(ctx);
    if (!r) return null;
    var late = ctx.stepIndex >= ctx.stepsTotal * 0.35;
    var cs = ctx.present().filter(function (c) { return c !== a && c !== b && free(c); }), best = null, bv = -1e9;
    cs.forEach(function (c) {
      var g = [a, b, c], gr = [];
      if (A.pairDone(ctx, a, b) && A.pairDone(ctx, a, c) && A.pairDone(ctx, b, c)) return;
      if (!exclOk(ctx, g) || (HK.Poly && HK.Poly.faithOk && !HK.Poly.faithOk(ctx, g))) return;
      var ok;
      if (soft(ctx)) ok = pairs3(g).every(function (p) { var x = p[0], y = p[1]; return (R(ctx, x, y).ten < 60 && R(ctx, y, x).ten < 60 && R(ctx, x, y).trust > -30 && R(ctx, y, x).trust > -30) || (late && x.stress > 60 && y.stress > 60); });
      /* 三組とも：その気がある（惹かれと信頼）か焦りが限界。時間が三割半を過ぎたら、張りつめていない組は焦り・覚悟・積極性で踏み切る。
         不仲の組（grudgeOk）は、ほかの直接の組が一つ以上踏み切れるときだけ、割り切って加わる */
      else {
        var warm = 0;
        ok = hardOk(g) && pairs3(g).every(function (p) {
          var x = p[0], y = p[1];
          if (!direct(x, y)) return R(ctx, x, y).ten < 60 && R(ctx, y, x).ten < 60;
          if (HK.RoomReluct && HK.RoomReluct.blocks(ctx, x, y)) return false;
          if (readyPair(ctx, x, y, 4) || lateOk(ctx, x, y, late)) { warm++; return true; }
          if (grudgeOk(ctx, x, y, late)) { gr.push(p); return true; }
          return false;
        }) && (!gr.length || warm > 0);
      }
      if (!ok) return;
      var v = pairs3(g).reduce(function (s, p) { return s + R(ctx, p[0], p[1]).att + R(ctx, p[1], p[0]).att + R(ctx, p[0], p[1]).aff; }, 0) - gr.length * 40;
      if (v > bv) { bv = v; best = g; best.gr = gr; }
    });
    return best;
  }
  var TRIO_SOFT = {
    first: ['{a}が{b}と{c}に手を差し出した。三人は輪になって手をつなぎ、それから、誰からともなく身を寄せ合った。', '{a}「三人で、だって｜三人で、だそうだ｜三人で、だそうです」{a}が両腕を広げると、{b}と{c}が照れくさそうにその中に入った。', '三人は、どこに手を置けばいいか迷いながら、ぎこちなく抱き合った。{b}の肘が{c}の脇腹に当たって、三人そろって吹き出した。'],
    again: ['三人はもう一度輪になって、肩を寄せ合った。さっきより、ずっと自然だった。', '{a}が「もう一回｜もう一回だ｜もう一回しましょう」と言うと、{b}と{c}は笑って、また腕を回した。', '三人で抱き合うたびに、扉の紙の数字が一つずつ減っていった。{c}は、それを少しだけ惜しそうに見ていた。'],
    done: ['三人が抱き合ったまま、扉の紙の文字が淡く光った。', '腕をほどいた三人は、顔を見合わせて小さく笑った。', '三人の輪がほどけると、部屋の空気が少しだけ温かくなっていた。']
  };
  EV.push({
    id: 'cond_trio', label: '三人で条件を満たそうとする', cat: 'bond', scope: 'pair', pri: true,
    when: function (ctx, a, b) { return !!ctx.flags.trioRule && ctx.stepIndex >= 1 && free(a) && free(b) && !!pickTrio(ctx, a, b); },
    /* 残り三割を切ったら、時間切れを前に三人の場面へ向かいやすく（三人がそろって踏み切れる回に、ほかの出来事に埋もれて時間が尽きないように。2026-10-28 担当LG） */
    w: function (ctx, a) { return 1.6 + ctx.stepIndex / Math.max(4, ctx.stepsTotal) * 2 + A.eager(ctx, a) + (ctx.stepIndex >= ctx.stepsTotal * 0.7 ? 2 : 0); },
    run: function (ctx, a, b) {
      var g = pickTrio(ctx, a, b), r = trioRule(ctx);
      if (!g) return null;
      var c = g[2], P = pairs3(g), first = !P.some(function (p) { return (A.prog(ctx, p[0], p[1]).act.trio3 || 0) > 0; });
      var hard = !soft(ctx), text = '', why = '', sex = false, waited = null;
      /* r18:begin */
      if (hard && HK.RoomTrio && HK.RoomTrio.condScene) {
        /* 不仲の組が割り切って加わる三人（grudgeOk）：場面の書き出しは、張りつめたまま条件のために割り切る形（room-trio.js の kind 'grudge'） */
        var gr = g.gr || [];
        var sc = HK.RoomTrio.condScene(ctx, g, first, gr.length ? { kind: 'grudge', gr: gr } : null);
        if (sc) {
          text = (first && LEAD_H && !gr.length ? ctx.t(pickNew(ctx,LEAD_H), a, b, c) : '') + sc.text;
          var wt = P.filter(function (p) { return !direct(p[0], p[1]); });
          why = '条件「三人で」：' + (wt.length ? '中心の一人とだけ触れ合う三人（' + nm(g) + '。' + wt.map(function (p) { return p[0].name + 'と' + p[1].name; }).join('・') + 'は直接は触れ合わない）。' : '三組とも体の関係を持てる三人（' + nm(g) + '）。') + sc.why +
            (gr.length ? '／' + gr.map(function (p) { return p[0].name + 'と' + p[1].name + '（緊張 ' + Math.round(Math.max(R(ctx, p[0], p[1]).ten, R(ctx, p[1], p[0]).ten)) + '）'; }).join('・') + 'は不仲で張りつめたままだったが、焦り（' + gr.map(function (p) { return p[0].name + ' ' + Math.round(p[0].stress) + '・' + p[1].name + ' ' + Math.round(p[1].stress); }).join('／') + '）に押されて、もう一人がいる三人ならと割り切った' : ''); sex = true;
          ctx.flags.trioSexN = (ctx.flags.trioSexN || 0) + 1;
          /* 夜を過ごしたことにするのは、直接の行為があった組だけ */
          P.forEach(function (p) { if (direct(p[0], p[1])) ctx.pair(p[0], p[1]).night = true; ctx.pair(p[0], p[1]).heatDone = true; });
        }
      }
      /* r18:end */
      if (!text) {
        text = ctx.t(pickNew(ctx,first ? TRIO_SOFT.first : TRIO_SOFT.again), a, b, c);
        why = '条件「三人で」：' + nm(g) + 'は、張りつめていない三人。三人で抱き合った';
      }
      /* 三組とも同じだけ数える。ほかの行為の条件（三人で抱き合う版ではハグ・手繋ぎ・膝枕まで）も、三人の場面で数える */
      var inc = r.n > 3 ? Math.max(1, Math.round(r.n / Math.max(3, ctx.stepsTotal * 0.55) * (0.6 + ctx.rng() * 0.8))) : 1;
      ctx.rules.forEach(function (q) {
        var T = K[q.k];
        if (q !== r && !(T.type === 'act' && (sex || T.lvl <= 2))) return;
        P.forEach(function (p) { if (!A.bumpAct(ctx, q, p[0], p[1], q === r ? inc : 1) && !waited) waited = [q, p[0], p[1]]; });
      });
      P.forEach(function (p) { ctx.mod2(p[0], p[1], { att: sex ? 8 : 2, aff: 4, trust: 4 }, { att: sex ? 8 : 2, aff: 4, trust: 4 }); });
      if (waited) text += A.waitNote(ctx, waited[0], waited[1], waited[2]);
      else if (r.n > 1) text += '（三人で：' + P.map(function (p) { return p[0].name + '×' + p[1].name + ' ' + (A.prog(ctx, p[0], p[1]).act.trio3 || 0) + '/' + r.n; }).join('・') + '）';
      /* 直接の行為をした組（engine.js の romanceOk はこの組だけを体の関係として見る。2026-10-27 担当HN） */
      var tps = sex ? P.filter(function (p) { return direct(p[0], p[1]); }) : null;
      var all = P.every(function (p) { return A.pairDone(ctx, p[0], p[1]); });
      if (all && HK.RoomTrio && HK.RoomTrio.exitGroup) {
        if (!sex) text += ctx.t(pickNew(ctx,TRIO_SOFT.done), a, b, c);
        var n0 = (ctx.flags.trios || []).length;
        var ex = HK.RoomTrio.exitGroup(ctx, g, text, why, sex, sex ? 'warm' : 'soft');
        /* 抱き合う版で出た三人には、三人の後日談（三人婚など）を付けない */
        if (!sex && ctx.flags.trios && ctx.flags.trios.length > n0) ctx.flags.trios.length = n0;
        ex.with = [c]; if (sex) { ex.sex = true; ex.cat = 'romance'; ex.trioPairs = tps; }
        return ex;
      }
      if (!waited && P.every(function (p) { return A.ruleDone(ctx, r, p[0], p[1]); })) text += '扉はまだ開かない。残っているのは、' + A.leftText(ctx, a, b) + '。';
      return { cat: sex ? 'romance' : 'bond', sex: sex, lewd: sex ? true : undefined, text: text, why: why, with: [c], mag: sex ? 30 : 14, trioPairs: tps };
    }
  });

  /* ================= 準備・最初の記録・終わりの記録 ================= */
  var setup0 = scen.setup, phase0 = scen.phase, finish0 = scen.finish;
  scen.setup = function (ctx) {
    setup0(ctx);
    /* 媚薬ガスの風船など、媚薬の段を使う条件（room-games-r18.js） */
    if (ctx.rules.some(function (r) { return K[r.k].aphro; })) { ctx.flags.hasAphroRule = true; ctx.flags.romantic = true; }
    var tr = trioRule(ctx);
    ctx.flags.trioRule = !!tr;
    if (!tr) return;
    ctx.flags.romantic = true;
    var C = ctx.chars.filter(function (c) { return HK.State.here(c); });
    if (C.length < 3) {
      if (HK._trioPrev) HK._trioPrev.res = { n: C.length, few: true };
      /* 二人しかいない：三人で、は成り立たないので「ハグ」に（もう一つの条件がハグなら、三人で、を外す） */
      if (ctx.rules.some(function (q) { return q.k === 'hug'; })) ctx.rules.splice(ctx.rules.indexOf(tr), 1); else tr.k = 'hug';
      ctx.flags.trioRule = false; ctx.flags.trioFall = 'few';
      /* 部屋の名前は、最初の記録（元の条件）のあとで付け直す */
      ctx.flags.trioLabel = HK.roomLabelOf(ctx.env, ctx.rules);
      return;
    }
    if (HK.SAFE_ON) { ctx.flags.trioSoft = true; if (HK._trioPrev) HK._trioPrev.res = { n: C.length, soft: true }; return; }
    /* r18:begin */
    var ng = [], okAny = false, okN = 0, okList = [];
    for (var i = 0; i < C.length; i++) for (var j = i + 1; j < C.length; j++) {
      if (!A.okSex(C[i], C[j])) ng.push([C[i], C[j]]);
      for (var k2 = j + 1; k2 < C.length; k2++) if (hardOk([C[i], C[j], C[k2]])) { okAny = true; okN++; okList.push(okInfo(ctx, [C[i], C[j], C[k2]])); }
    }
    /* 成り立つ三人ごとの形（中心・直接は触れ合わない組・不仲の組）。最初の記録の但し書きと事前の表示で、三人の場面の可否を二人の組の理由と分けて書く（2026-10-28 担当LG：
       利用者の報告「恋愛対象が合わない、と出て 3P が起きない」。攻めどうしの組の理由が、三人の場面が成り立たない理由のように読めたため） */
    ctx.flags.trioOkList = okList;
    ctx.flags.trioNG = ng.map(function (p) { return [p[0].i, p[1].i]; });
    ctx.flags.trioOut = C.filter(function (c) { return HK.Pos && HK.Pos.trioOptOut && HK.Pos.trioOptOut(c); }).map(function (c) { return c.i; });
    ctx.flags.trioFaith = faithOut(ctx, C).map(function (c) { return c.i; });
    /* 箱庭タブの事前の表示（room-trio-note.js の HK.RoomGames.preview）：この顔ぶれで成り立つ三人の数と、成り立たない組の理由 */
    /* 不仲・敵対の組（体の関係は持てるが張りつめている。2026-10-28 担当LG）：事前の表示に、割り切って加わるまでの条件・避けている人を書く */
    var tense = [];
    for (var i2 = 0; i2 < C.length; i2++) for (var j2 = i2 + 1; j2 < C.length; j2++) if (A.okSex(C[i2], C[j2]) && grudge(ctx, C[i2], C[j2])) {
      var av2 = HK.Avoid ? [[C[i2], C[j2]], [C[j2], C[i2]]].filter(function (p) { return HK.Avoid.of(ctx, p[0], p[1]); })[0] : null;
      tense.push({ a: C[i2].name, b: C[j2].name, avoid: av2 ? av2[0].name : '', low: [C[i2], C[j2]].filter(function (z) { return HK.Pos && HK.Pos.libOf && HK.Pos.libOf(z) === 'low'; }).map(function (z) { return z.name; }) });
    }
    if (HK._trioPrev) HK._trioPrev.res = { n: C.length, okN: okN, tense: tense, trios: okList.map(function (o) { return { names: o.g.map(function (i) { return ctx.chars[i].name; }), hub: o.hub != null ? ctx.chars[o.hub].name : '', watch: o.watch.map(function (p) { return ngInfo(ctx, ctx.chars[p[0]], ctx.chars[p[1]]); }), tense: o.tense.map(function (p) { return { a: ctx.chars[p[0]].name, b: ctx.chars[p[1]].name }; }) }; }), ng: ng.map(function (p) { return ngInfo(ctx, p[0], p[1]); }), out: C.filter(function (c) { return HK.Pos && HK.Pos.trioOptOut && HK.Pos.trioOptOut(c); }).map(function (c) { return c.name; }), faith: faithOut(ctx, C).map(function (c) { return c.name; }),
      /* 点検用：okSex と理由の有無が食い違う組の数（0 であること） */
      odd: (function () { var n = 0; for (var i = 0; i < C.length; i++) for (var j = i + 1; j < C.length; j++) if (!A.okSex(C[i], C[j]) !== !!(HK.Pos.noSexInfo && HK.Pos.noSexInfo(C[i], C[j], { ctx: ctx }))) n++; return n; })() };
    if (!okAny) {
      ctx.flags.trioSoft = true; ctx.flags.trioFall = 'ng';
      softNow = true;
      try { ctx.flags.trioLabel = HK.roomLabelOf(ctx.env, ctx.rules); } finally { softNow = false; }
    }
    /* r18:end */
    if (!ctx.flags.trioSoft && !ctx.flags.trioNG) ctx.flags.trioSoft = true;
  };
  /* 体の関係を持てない組の書き方（最初の記録の注意書き） */
  var NG_NOTE = null;
  /* r18:begin */
  /* 三人の場面にならなかった理由（結末の注意書き。2026-10-28 担当LG）：体の関係を持てる三人のうち、踏み切れなかった直接の組と、その理由・直し方 */
  function stuckWhy(ctx, x, y) {
    var t = function (p, q) { return Math.round(Math.max(R(ctx, p, q).ten, R(ctx, q, p).ten)); };
    if (HK.RoomReluct && HK.RoomReluct.blocks(ctx, x, y)) return x.name + 'と' + y.name + 'は、この場所でするのを渋ったままだった';
    if (grudge(ctx, x, y)) {
      var av = HK.Avoid ? [[x, y], [y, x]].filter(function (p) { return HK.Avoid.of(ctx, p[0], p[1]); })[0] : null;
      if (av) return av[0].name + 'は' + av[1].name + 'を避けている（' + HK.Avoid.why(ctx, av[0], av[1]) + '）ので、割り切っても加わらなかった（' + av[0].name + 'から' + av[1].name + 'への「愛憎」を付けると、避けずに加わる）';
      var low = [x, y].filter(function (z) { return HK.Pos && HK.Pos.libOf && HK.Pos.libOf(z) === 'low'; });
      return x.name + 'と' + y.name + 'は不仲で張りつめたまま（緊張 ' + t(x, y) + '）、割り切れるほど焦りが溜まらなかった（焦り ' + Math.round(x.stress) + '・' + Math.round(y.stress) + (low.length ? '。性欲「弱い」の' + nm(low) + 'は、強い焦りが要る' : '') + '）';
    }
    if (t(x, y) >= 55) return x.name + 'と' + y.name + 'は張りつめたままだった（緊張 ' + t(x, y) + '）';
    return x.name + 'と' + y.name + 'は、その気になるほど惹かれも信頼も育たず、焦りも足りなかった（惹かれ ' + Math.round(R(ctx, x, y).att) + '・' + Math.round(R(ctx, y, x).att) + '／焦り ' + Math.round(x.stress) + '・' + Math.round(y.stress) + '）';
  }
  function missNote(ctx) {
    var C = ctx.chars.filter(function (c) { return c.alive !== false; }), best = null, bn = 9;
    for (var i = 0; i < C.length; i++) for (var j = i + 1; j < C.length; j++) for (var k = j + 1; k < C.length; k++) {
      var g = [C[i], C[j], C[k]];
      if (!hardOk(g)) continue;
      var st = pairs3(g).filter(function (p) { var x = p[0], y = p[1]; return direct(x, y) && ((HK.RoomReluct && HK.RoomReluct.blocks(ctx, x, y)) || !(readyPair(ctx, x, y, 4) || lateOk(ctx, x, y, true) || grudgeOk(ctx, x, y, true))); });
      if (st.length < bn) { bn = st.length; best = { g: g, st: st }; }
    }
    if (!best) return '';
    var gr = best.st.some(function (p) { return grudge(ctx, p[0], p[1]); });
    return '条件「三人で」：三人の場面にならなかった（' + nm(best.g) + '：' + (best.st.length ? best.st.map(function (p) { return stuckWhy(ctx, p[0], p[1]); }).join('。') : '三人がそろって踏み切る機会がないまま、時間が尽きた') +
      '。直し方：閉じ込められる時間を長くする・部屋の圧を上げる' + (gr ? '・二人の関係の「不仲」を外す' : '') + '）';
  }
  /* 体の関係を持てない理由（2026-10-28 担当JB：pos.js の HK.Pos.whyNoSex に置き換えた。性欲「なし」・一途・恋愛やR18にしない相手・
     体の関係の相手「なし」・恋愛相手の固定に合わせた性行為の相手の固定などが、みな「受け攻め」に落ちていたため） */
  function whyNG(ctx, x, y) { return (HK.Pos && HK.Pos.whyNoSex && HK.Pos.whyNoSex(x, y, { ctx: ctx })) || '受け攻めの組み合わせが成り立たない'; }
  /* 事前の表示（room-trio-note.js）に渡す中身：成り立たない組の理由と直し方 */
  function ngInfo(ctx, x, y) { var d = HK.Pos && HK.Pos.noSexInfo ? HK.Pos.noSexInfo(x, y, { ctx: ctx }) : null; return { a: x.name, b: y.name, t: d ? d.t : '受け攻めの組み合わせが成り立たない', fix: d ? d.fix : '' }; }
  /* 成り立つ三人の形：{ g: 番号, hub: 中心の番号か null, watch: 直接は触れ合わない組, tense: 不仲の組 } */
  function okInfo(ctx, g) {
    var pl = HK.RoomTrio && HK.RoomTrio.plan3 ? HK.RoomTrio.plan3(g) : null, ix = function (p) { return [p[0].i, p[1].i]; };
    return { g: g.map(function (c) { return c.i; }), hub: pl && !pl.all && pl.hub ? pl.hub.i : null, watch: pl ? pl.watch.map(ix) : [], tense: pairs3(g).filter(function (p) { return direct(p[0], p[1]) && grudge(ctx, p[0], p[1]); }).map(ix) };
  }
  /* 成り立つ三人の一行（「ユイ・ソウタ・レンの三人は、ユイを真ん中にすれば成り立つ（ソウタとレンは直接は触れ合わない――理由）。ソウタとユイは不仲なので…」） */
  function okLine(ctx, o) {
    var ch = function (i) { return ctx.chars[i]; }, g = o.g.map(ch);
    var t = nm(g) + 'の三人は、' + (o.hub != null ? ch(o.hub).name + 'を真ん中にすれば成り立つ（' + o.watch.map(function (p) { return ch(p[0]).name + 'と' + ch(p[1]).name + 'は直接は触れ合わない――' + whyNG(ctx, ch(p[0]), ch(p[1])); }).join('。') + '）' : '三組とも触れ合える');
    if (o.tense.length) t += '。' + o.tense.map(function (p) { return ch(p[0]).name + 'と' + ch(p[1]).name; }).join('・') + 'は不仲なので、時間が経って焦りが溜まってから、割り切って加わる';
    return t;
  }
  NG_NOTE = function (ctx, fall) {
    var ps = (ctx.flags.trioNG || []).map(function (p) { var x = ctx.chars[p[0]], y = ctx.chars[p[1]]; return x.name + 'と' + y.name + '（' + whyNG(ctx, x, y) + '）'; });
    /* 住人の設定「三人の場面（3P）：しない」の人（2026-10-27 担当HN） */
    var os = (ctx.flags.trioOut || []).map(function (i) { return ctx.chars[i].name; });
    var on = os.length ? os.join('・') + 'は、三人の場面に加わらない。' : '';
    var fs = (ctx.flags.trioFaith || []).map(function (i) { return ctx.chars[i].name; });
    if (fs.length) on += fs.join('・') + 'は一途で、恋人でない人がいる三人には加わらない。';
    if (fall) return '扉の紙の条件「三人で仲良くしないと出られない」は、この部屋では成り立たなかった。' + on + (ps.length ? ps.join('、') + 'は体の関係を持てない組なので、二組以上が体の関係を持てる三人を選べない。' : '二組以上が体の関係を持てる三人がいない。') + '紙の文字がにじんで、条件は「三人で抱き合う」に書き換わった。';
    /* 成り立つ三人を先に（三人の場面の可否）。二人の組の理由は、その三人の形の説明として書き、形に出てこない組だけを最後にまとめる */
    var ok = (ctx.flags.trioOkList || []).filter(function (o) { return o.hub != null || o.tense.length; }), shown = {};
    ok.slice(0, 3).forEach(function (o) { o.watch.forEach(function (p) { shown[p[0] + '_' + p[1]] = 1; }); });
    var rest = (ctx.flags.trioNG || []).filter(function (p) { return !shown[p[0] + '_' + p[1]]; }).map(function (p) { var x = ctx.chars[p[0]], y = ctx.chars[p[1]]; return x.name + 'と' + y.name + '（' + whyNG(ctx, x, y) + '）'; });
    var tl = ok.slice(0, 3).map(function (o) { return okLine(ctx, o); });
    if (!on && !tl.length && !rest.length) return '';
    return '扉の紙の但し書き：' + on + (tl.length ? tl.join('。') + '。' + (ok.length > 3 ? 'ほかに' + (ok.length - 3) + '組の三人でも成り立つ。' : '') : '') +
      (rest.length ? rest.join('、') + 'は体の関係にならない二人なので、同じ三人に入っても直接は触れ合わない。' : '');
  };
  /* r18:end */
  scen.phase = function (ctx, s, n) {
    phase0(ctx, s, n);
    if (s !== 0) return;
    /* 三人で、が成り立たない部屋：目覚めた直後（最初の記録）に、成り立たない理由と替わった条件を書いて、部屋の名前を付け直す */
    if (ctx.flags.trioFall === 'few') ctx.say({ text: '扉の紙の条件は「三人で」だったが、部屋にいるのは' + ctx.chars.length + '人だけだった。三人そろわなければ、この条件は成り立たない。紙の文字がにじんで、条件は「ハグ」に書き換わった。' });
    else if (ctx.flags.trioFall === 'ng' && NG_NOTE) ctx.say({ text: NG_NOTE(ctx, true) });
    if (ctx.flags.trioLabel) ctx.flags.roomLabel = ctx.flags.trioLabel;
    if (ctx.flags.trioRule && !ctx.flags.trioFall && NG_NOTE) { var nt = NG_NOTE(ctx, false); if (nt) ctx.say({ text: nt }); }
    ctx.rules.forEach(function (r) {
      var pool = r.k === 'trio3' && !soft(ctx) && INTRO_H ? INTRO_H : INTRO[r.k] || HK.RoomGames.INTRO[r.k];
      if (pool && pool.length) ctx.say({ text: fillN(ctx.pick(pool), r.n) });
    });
  };
  /* 結末の行：お題の合計と、誰がどれだけ／傷つけた組／三人で、が成り立たなかった組 */
  var BY_JA = { nyan: '言った回数', roulette: '回した回数', tickle: 'くすぐられた秒数', balloon: '割った個数' };
  scen.finish = function (ctx) {
    finish0(ctx);
    var notes = function (s) { (ctx.flags.endNotes = ctx.flags.endNotes || []).push(s); };
    ctx.rules.forEach(function (r) {
      var T = K[r.k];
      if (T.type !== 'task') return;
      var B = (ctx.flags.taskBy || {})[r.k] || {}, ids = Object.keys(B).sort(function (x, y) { return B[y] - B[x]; });
      notes(A.KLABEL[r.k].replace(/（.*$/, '') + '：' + Math.min(r.n, ctx.flags.consumed[r.k] || 0) + '/' + r.n + T.unit + (ids.length ? '（' + (BY_JA[r.k] || '') + '：' + ids.map(function (i) { return ctx.chars[i].name + ' ' + B[i] + T.unit; }).join('・') + '）' : ''));
      if (r.k === 'roulette' && ctx.flags.rrLose) { var L0 = ctx.flags.rrLose; notes('罰ゲーム：' + Object.keys(L0).map(function (i) { return ctx.chars[i].name + ' ' + L0[i] + '回'; }).join('・')); }
    });
    if (ctx.flags.hurtLog && ctx.flags.hurtLog.length) notes('傷つけた：' + ctx.flags.hurtLog.map(function (h) { return ctx.chars[h.a].name + '→' + ctx.chars[h.b].name + '（' + { word: '言葉', pinch: 'つねる', slap: '平手' }[h.tier] + '）'; }).join('、'));
    if (ctx.flags.trioFall === 'few') notes('条件「三人で」：部屋に三人そろわなかったので、「ハグ」に替わった');
    /* r18:begin */
    if (ctx.flags.trioFall === 'ng') notes('条件「三人で」：体の関係を持てる三人がいなかったので、「三人で抱き合う」に替わった');
    /* 三人の場面が一度も起きなかった部屋：どの組が踏み切れなかったかと直し方（2026-10-28 担当LG） */
    if (ctx.flags.trioRule && !soft(ctx) && !ctx.flags.trioFall && !ctx.flags.trioSexN) { var mn = missNote(ctx); if (mn) notes(mn); }
    /* r18:end */
  };

  /* R18向けのお題（room-games-r18.js）が使う部品 */
  HK.RoomGames = { TASK: TASK, INTRO: {}, addTask: function (k, H, intro) { TASK[k] = H; if (intro) HK.RoomGames.INTRO[k] = intro; }, free: free, topKey: topKey, scaleOf: scaleOf, fillN: fillN, pickNew: pickNew };
})();
